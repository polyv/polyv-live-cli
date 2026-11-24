/**
 * HTTP interface to the PolyV VOD platform.
 *
 * `PolyVVodClient` adds authentication, rate limiting, retries and envelope handling to
 * `fetch`; the services under `./services/` describe individual endpoints on top of it.
 *
 * @module client
 */

import { randomUUID } from 'node:crypto';
import { setTimeout as sleep } from 'node:timers/promises';

import { compactParams, signMd5, signSha1 } from './auth/signature.js';
import { PolyVVodError } from './errors/index.js';
import { VideoService } from './services/video.service.js';
import { CategoryService } from './services/category.service.js';
import { UploadService } from './services/upload.service.js';
import { PlaySafeService } from './services/playsafe.service.js';
import { StatisticsService } from './services/statistics.service.js';
import { CallbackService } from './services/callback.service.js';
import type {
  PolyVVodClientConfig,
  ResolvedVodClientConfig,
  VodHost,
  VodParams,
  VodRequestInit
} from './types/client.js';
import { DEFAULT_BASE_URLS } from './types/client.js';
import { RateLimiter } from './utils/rate-limiter.js';
import { VERSION } from './version.js';

const DEFAULT_RATE_LIMIT = { maxRequests: 400, windowMs: 10_000 };
const MAX_BACKOFF_MS = 5_000;

interface PreparedRequest {
  method: 'GET' | 'POST';
  url: string;
  params: Record<string, string>;
  placement: 'query' | 'body';
  envelope: 'standard' | 'none';
  host: VodHost;
  init: VodRequestInit;
}

interface ApiEnvelope {
  code?: number;
  status?: string;
  message?: string;
  data?: unknown;
  requestId?: string;
}

function newRequestId(): string {
  return randomUUID().replace(/-/g, '');
}

/** Aborts when the caller's signal aborts or the timeout elapses, whichever comes first. */
function combineSignals(signal: AbortSignal | undefined, timeoutMs: number): AbortSignal {
  const timeout = AbortSignal.timeout(timeoutMs);
  if (!signal) return timeout;
  const controller = new AbortController();
  const abort = (reason: unknown): void => controller.abort(reason);
  if (signal.aborted) abort(signal.reason);
  else signal.addEventListener('abort', () => abort(signal.reason), { once: true });
  if (timeout.aborted) abort(timeout.reason);
  else timeout.addEventListener('abort', () => abort(timeout.reason), { once: true });
  return controller.signal;
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export class PolyVVodClient {
  readonly config: ResolvedVodClientConfig;
  readonly video: VideoService;
  readonly category: CategoryService;
  readonly upload: UploadService;
  readonly playSafe: PlaySafeService;
  readonly statistics: StatisticsService;
  readonly callback: CallbackService;

  private readonly limiter: RateLimiter | null;

  constructor(config: PolyVVodClientConfig) {
    if (!config.userId || !config.secretKey) {
      throw new PolyVVodError('validation', 'userId and secretKey are required');
    }
    if (config.maxRetries !== undefined && config.maxRetries < 0) {
      throw new PolyVVodError('validation', 'maxRetries must not be negative');
    }
    if (config.timeout !== undefined && config.timeout <= 0) {
      throw new PolyVVodError('validation', 'timeout must be a positive number');
    }
    this.config = {
      userId: config.userId,
      secretKey: config.secretKey,
      writeToken: config.writeToken || undefined,
      readToken: config.readToken || undefined,
      appId: config.appId || undefined,
      appSecret: config.appSecret || undefined,
      baseUrls: { ...DEFAULT_BASE_URLS, ...(config.baseUrls ?? {}) },
      timeout: config.timeout ?? 30_000,
      maxRetries: config.maxRetries ?? 2,
      retryDelayMs: config.retryDelayMs ?? 500,
      headers: { ...(config.headers ?? {}) },
      userAgent: config.userAgent ?? `polyv-vod-api-sdk/${VERSION}`,
      rateLimit: config.rateLimit === undefined ? DEFAULT_RATE_LIMIT : config.rateLimit,
      fetch: config.fetch ?? globalThis.fetch
    };
    this.limiter = this.config.rateLimit ? new RateLimiter(this.config.rateLimit.maxRequests, this.config.rateLimit.windowMs) : null;
    this.video = new VideoService(this);
    this.category = new CategoryService(this);
    this.upload = new UploadService(this);
    this.playSafe = new PlaySafeService(this);
    this.statistics = new StatisticsService(this);
    this.callback = new CallbackService(this);
  }

  /**
   * Sends a request and returns the `data` of the response envelope.
   *
   * @throws {PolyVVodError} `validation`, `auth`, `api` or `network`
   */
  async request<T = unknown>(init: VodRequestInit): Promise<T> {
    const attempts = this.config.maxRetries + 1;
    let lastError: PolyVVodError | null = null;
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      if (attempt > 0) {
        await sleep(Math.min(this.config.retryDelayMs * 2 ** (attempt - 1), MAX_BACKOFF_MS));
      }
      // Params are rebuilt per attempt so every retry carries a fresh ptime and signature.
      const prepared = this.prepare(init);
      if (prepared.host === 'api' && this.limiter) {
        await this.limiter.acquire();
      }
      try {
        return await this.execute<T>(prepared);
      } catch (error) {
        if (!(error instanceof PolyVVodError) || !error.retryable) throw error;
        lastError = error;
      }
    }
    throw lastError;
  }

  private prepare(init: VodRequestInit): PreparedRequest {
    if (init.method !== 'GET' && init.method !== 'POST') {
      throw new PolyVVodError('validation', `Unsupported method "${init.method}"; only GET and POST are used by the VOD API`);
    }
    const host: VodHost = init.host ?? 'api';
    const params = this.signedParams(init);
    const placement = init.in ?? (init.method === 'GET' ? 'query' : 'body');
    const path = init.path.replace('{userid}', encodeURIComponent(this.config.userId));
    return {
      method: init.method,
      url: `${this.config.baseUrls[host].replace(/\/+$/, '')}${path.startsWith('/') ? path : `/${path}`}`,
      params,
      placement,
      envelope: init.envelope ?? 'standard',
      host,
      init
    };
  }

  /** Builds every transmitted parameter, including the auth ones and the signature. */
  private signedParams(init: VodRequestInit): Record<string, string> {
    const auth = init.auth ?? 'sha1';
    const business = compactParams(init.params ?? {});
    const { userId, secretKey, appId, appSecret, writeToken } = this.config;

    if (auth === 'sha1' || (typeof auth === 'object' && auth.scheme === 'sha1')) {
      const sent: VodParams = { ...business, userid: userId, ptime: Date.now(), requestId: newRequestId() };
      const signed = typeof auth === 'object' ? pick(sent, auth.keys) : sent;
      return { ...compactParams(sent), sign: signSha1(signed, secretKey) };
    }
    if (auth === 'md5') {
      return { ...business, sign: signMd5(business, secretKey) };
    }
    if (auth === 'v4') {
      if (!appId || !appSecret) {
        throw new PolyVVodError('auth', 'This endpoint needs the account API credentials: set appId and appSecret');
      }
      const sent: VodParams = { ...business, appId, timestamp: Date.now(), requestId: newRequestId() };
      return { ...compactParams(sent), sign: signMd5(sent, appSecret) };
    }
    if (auth === 'writetoken') {
      if (!writeToken) {
        throw new PolyVVodError('auth', 'This endpoint needs writeToken');
      }
      return { ...business, writetoken: writeToken };
    }
    return business;
  }

  private async execute<T>(prepared: PreparedRequest): Promise<T> {
    const { init } = prepared;
    const form = new URLSearchParams(prepared.params).toString();
    const url = prepared.placement === 'query' ? `${prepared.url}${form ? `?${form}` : ''}` : prepared.url;
    const headers: Record<string, string> = { 'user-agent': this.config.userAgent, ...this.config.headers };
    let body: string | undefined;
    if (prepared.method === 'POST' && prepared.placement === 'body') {
      body = form;
      headers['content-type'] = 'application/x-www-form-urlencoded';
    }

    let response: Response;
    let text: string;
    const timeoutMs = init.timeout ?? this.config.timeout;
    // A request that may change state twice must not be resent after a failure that leaves the
    // outcome unknown (timeout, connection drop).
    const mayRetry = init.idempotent ?? init.method === 'GET';
    const signal = combineSignals(init.signal, timeoutMs);
    try {
      response = await this.config.fetch(url, { method: prepared.method, headers, body, signal });
      text = await response.text();
    } catch (error) {
      if (init.signal?.aborted) {
        throw new PolyVVodError('network', 'Request cancelled', { cause: error });
      }
      if (signal.aborted) {
        throw new PolyVVodError('network', `Request timeout after ${timeoutMs}ms`, { cause: error, retryable: mayRetry });
      }
      throw new PolyVVodError('network', `Request failed: ${messageOf(error)}`, { cause: error, retryable: mayRetry });
    }

    const parsed = parseJson(text);
    if (prepared.envelope === 'none') {
      return (parsed ?? text) as T;
    }

    const envelope = (parsed ?? {}) as ApiEnvelope;
    if (response.status === 200 && envelope.code === 200) {
      return envelope.data as T;
    }
    const transient = response.status === 429 || response.status >= 500;
    const detail = (envelope as { error?: { code?: string | number; desc?: string } }).error;
    throw new PolyVVodError('api', envelope.message || detail?.desc || `HTTP ${response.status}`, {
      code: envelope.code ?? response.status,
      httpStatus: response.status,
      data: envelope.data,
      requestId: envelope.requestId,
      retryable: transient && mayRetry
    });
  }
}

function pick(source: VodParams, keys: readonly string[]): VodParams {
  const picked: VodParams = {};
  for (const key of keys) {
    if (key in source) picked[key] = source[key];
  }
  return picked;
}

function parseJson(text: string): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
