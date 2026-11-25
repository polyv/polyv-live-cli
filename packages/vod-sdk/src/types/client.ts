/**
 * Client configuration and request descriptors.
 *
 * @module types/client
 */

export type VodParamValue = string | number | boolean | null | undefined;
export type VodParams = Record<string, VodParamValue>;

/** Hosts the VOD platform serves from. */
export type VodHost = 'api' | 'hls' | 'upload';

/**
 * Authentication applied to a request.
 *
 * - `sha1` (default rule): `userid` + `ptime` + `requestId` + every business param, SHA1.
 * - `{ scheme: 'sha1', keys }` (per-endpoint exception): the same params are sent, but only the
 *   listed keys take part in the signature.
 * - `md5`: the params as given, signed with MD5 (play token).
 * - `v4`: `appId` + `timestamp` + `requestId` + params, MD5 with `appSecret` (V4 endpoints).
 * - `writetoken`: no signature; `writetoken` is added to the params.
 * - `none`.
 */
export type VodAuth =
  | 'sha1'
  | 'md5'
  | 'v4'
  | 'writetoken'
  | 'none'
  | { scheme: 'sha1'; keys: readonly string[] };

export interface VodRequestInit {
  method: 'GET' | 'POST';
  /** Path on the chosen host. `{userid}` is replaced with the configured user id. */
  path: string;
  host?: VodHost;
  /** Business parameters. `undefined`, `null` and `''` are dropped. */
  params?: VodParams;
  auth?: VodAuth;
  /** Where the signed params travel. Defaults to the query for GET and the form body for POST. */
  in?: 'query' | 'body';
  /**
   * `standard` (default) unwraps `{ code, status, message, data }` and fails unless `code` is 200.
   * `none` returns the parsed JSON as is.
   */
  envelope?: 'standard' | 'none';
  timeout?: number;
  signal?: AbortSignal;
  /** Whether a transient failure may be retried. Defaults to true for GET. */
  idempotent?: boolean;
}

export interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

export interface PolyVVodClientConfig {
  /** VOD user id (设置 -> API接口). */
  userId: string;
  /** VOD secretkey, used for signatures. */
  secretKey: string;
  /** VOD writetoken, used by the direct upload endpoint. */
  writeToken?: string;
  /** VOD readtoken. Not needed by any endpoint this SDK calls today. */
  readToken?: string;
  /** API appId (the same credential the PolyV Live API uses). Only V4 endpoints need it. */
  appId?: string;
  /** API appSecret paired with `appId`. */
  appSecret?: string;
  /** Overrides per host. */
  baseUrls?: Partial<Record<VodHost, string>>;
  /** Request timeout in milliseconds. Default 30000. */
  timeout?: number;
  /** Retries for transient failures (timeouts, network errors, HTTP 5xx / 429). Default 2. */
  maxRetries?: number;
  /** Base delay for the exponential retry backoff. Default 500 ms. */
  retryDelayMs?: number;
  /** Extra headers sent with every request. */
  headers?: Record<string, string>;
  /** Default `polyv-vod-api-sdk/<version>`. */
  userAgent?: string;
  /** Budget for `api.polyv.net`. Pass `false` to disable. Default 400 requests per 10 seconds. */
  rateLimit?: RateLimitOptions | false;
  /** HTTP implementation. Defaults to the global `fetch`; injectable for tests. */
  fetch?: typeof globalThis.fetch;
}

export interface ResolvedVodClientConfig {
  userId: string;
  secretKey: string;
  writeToken?: string;
  readToken?: string;
  appId?: string;
  appSecret?: string;
  baseUrls: Record<VodHost, string>;
  timeout: number;
  maxRetries: number;
  retryDelayMs: number;
  headers: Record<string, string>;
  userAgent: string;
  rateLimit: RateLimitOptions | false;
  fetch: typeof globalThis.fetch;
}

export const DEFAULT_BASE_URLS: Readonly<Record<VodHost, string>> = {
  api: 'https://api.polyv.net',
  hls: 'https://hls.videocc.net',
  upload: 'https://v.polyv.net',
};
