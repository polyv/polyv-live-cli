/**
 * Shared fixtures for the unit tests. Not part of the published API.
 */
import { vi } from 'vitest';

import { PolyVVodClient, type PolyVVodClientConfig } from '../index.js';

export const USER_ID = 'userid123';
export const SECRET_KEY = 'secret-key';
export const WRITE_TOKEN = 'write-token';

export function envelope(data: unknown, code = 200, message = 'success'): Record<string, unknown> {
  return { code, status: code === 200 ? 'success' : 'error', message, data };
}

export function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } });
}

export interface RecordedCall {
  url: URL;
  init: RequestInit;
  /** Every transmitted parameter, from the query for GET and from the form body for POST. */
  params: URLSearchParams;
}

type Handler = (call: RecordedCall) => Response | Promise<Response> | undefined;

/** A `fetch` stand-in that records each call and lets a handler decide the response. */
export function recordedFetch(handler: Handler = () => undefined) {
  const calls: RecordedCall[] = [];
  const fetch = vi.fn(async (input: string | URL | Request, init: RequestInit = {}) => {
    const url = new URL(input instanceof Request ? input.url : String(input));
    const body = typeof init.body === 'string' ? init.body : undefined;
    const params = new URLSearchParams(init.method === 'GET' || body === undefined ? url.searchParams : body);
    const call = { url, init, params };
    calls.push(call);
    return (await handler(call)) ?? jsonResponse(envelope({ ok: true }));
  });
  return { fetch: fetch as unknown as typeof globalThis.fetch, calls, fn: fetch };
}

export type Recorded = ReturnType<typeof recordedFetch>;

/** A client with rate limiting off, no retry delay and the recorded fetch. */
export function clientWith(http: Recorded, config: Partial<PolyVVodClientConfig> = {}): PolyVVodClient {
  return new PolyVVodClient({
    userId: USER_ID,
    secretKey: SECRET_KEY,
    rateLimit: false,
    retryDelayMs: 1,
    fetch: http.fetch,
    ...config
  });
}
