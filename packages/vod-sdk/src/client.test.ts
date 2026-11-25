import { describe, expect, it, vi } from 'vitest';

import { PolyVVodClient, PolyVVodError, signMd5, signSha1 } from './index.js';
import { clientWith, envelope, jsonResponse, recordedFetch, SECRET_KEY, USER_ID, WRITE_TOKEN } from './__tests__/helpers.js';

/** Transmitted params without the signature, as the signer sees them. */
const signedOf = (params: URLSearchParams): Record<string, string> =>
  Object.fromEntries([...params.entries()].filter(([key]) => key !== 'sign'));

describe('PolyVVodClient construction', () => {
  it('requires userId and secretKey', () => {
    expect(() => new PolyVVodClient({ userId: '', secretKey: 's' })).toThrow(PolyVVodError);
    expect(() => new PolyVVodClient({ userId: 'u', secretKey: '' })).toThrow('userId and secretKey are required');
  });

  it('rejects a negative maxRetries and a non-positive timeout', () => {
    expect(() => new PolyVVodClient({ userId: 'u', secretKey: 's', maxRetries: -1 })).toThrow('maxRetries');
    expect(() => new PolyVVodClient({ userId: 'u', secretKey: 's', timeout: 0 })).toThrow('timeout');
  });

  it('resolves the defaults', () => {
    const client = new PolyVVodClient({ userId: 'u', secretKey: 's', writeToken: '', appId: '' });
    expect(client.config.baseUrls).toEqual({
      api: 'https://api.polyv.net',
      hls: 'https://hls.videocc.net',
      upload: 'https://v.polyv.net'
    });
    expect(client.config).toMatchObject({ timeout: 30_000, maxRetries: 2, retryDelayMs: 500, writeToken: undefined, appId: undefined });
    expect(client.config.userAgent).toMatch(/^polyv-vod-api-sdk\//);
    expect(client.config.rateLimit).toEqual({ maxRequests: 400, windowMs: 10_000 });
  });

  it('exposes one service per endpoint group', () => {
    const client = new PolyVVodClient({ userId: 'u', secretKey: 's' });
    const services = [client.video, client.category, client.upload, client.playSafe, client.statistics, client.callback];
    expect(services.filter((service) => service == null)).toHaveLength(0);
    expect(new Set(services).size).toBe(services.length);
  });
});

describe('PolyVVodClient.request', () => {
  it('applies the default rule to a GET: common params plus every business param, signed raw', async () => {
    const http = recordedFetch();
    const client = clientWith(http);

    const data = await client.request({
      method: 'GET',
      path: '/v2/video/{userid}/cataJson',
      params: { cataid: '1', title: '测试', skip: undefined, empty: '' }
    });

    const [call] = http.calls;
    expect(`${call.url.origin}${call.url.pathname}`).toBe('https://api.polyv.net/v2/video/userid123/cataJson');
    expect(call.init.method).toBe('GET');
    expect(call.params.get('title')).toBe('测试');
    expect(call.params.has('skip')).toBe(false);
    expect(call.params.has('empty')).toBe(false);
    expect(call.params.get('userid')).toBe(USER_ID);
    expect(call.params.get('requestId')).toMatch(/^[0-9a-f]{32}$/);
    expect(call.params.get('sign')).toBe(signSha1(signedOf(call.params), SECRET_KEY));
    expect(call.init.headers).toMatchObject({ 'user-agent': client.config.userAgent });
    expect(data).toEqual({ ok: true });
  });

  it('sends the params of a POST as a form body', async () => {
    const http = recordedFetch();
    await clientWith(http).request({ method: 'POST', path: '/v2/video/{userid}/addCata', params: { cataname: '课程', parentid: 1 } });

    const [call] = http.calls;
    expect(`${call.url.origin}${call.url.pathname}`).toBe('https://api.polyv.net/v2/video/userid123/addCata');
    expect(call.url.search).toBe('');
    expect(call.init.method).toBe('POST');
    expect((call.init.headers as Record<string, string>)['content-type']).toBe('application/x-www-form-urlencoded');
    expect(call.params.get('cataname')).toBe('课程');
    expect(call.params.get('parentid')).toBe('1');
    expect(call.params.get('sign')).toBe(signSha1(signedOf(call.params), SECRET_KEY));
  });

  it('can carry the params of a POST in the query instead', async () => {
    const http = recordedFetch();
    await clientWith(http).request({ method: 'POST', path: '/vod/v4/x', auth: 'none', in: 'query', params: { a: 1 } });

    const [call] = http.calls;
    expect(call.url.search).toBe('?a=1');
    expect(call.init.body).toBeUndefined();
  });

  it('signs only the listed keys for an endpoint with a signing exception', async () => {
    const http = recordedFetch();
    await clientWith(http).request({
      method: 'POST',
      path: '/v2/video/{userid}/changeCata',
      auth: { scheme: 'sha1', keys: ['userid', 'vids', 'cataid', 'ptime'] },
      params: { vids: 'a,b', cataid: '9' }
    });

    const params = http.calls[0].params;
    expect(params.get('requestId')).toBeTruthy();
    expect(params.get('sign')).toBe(signSha1({ userid: USER_ID, vids: 'a,b', cataid: '9', ptime: params.get('ptime') }, SECRET_KEY));
    expect(params.get('sign')).not.toBe(signSha1(signedOf(params), SECRET_KEY));
  });

  it('signs with MD5 over the params as given, adding no common params', async () => {
    const http = recordedFetch();
    await clientWith(http).request({ method: 'POST', host: 'hls', path: '/service/v1/token', auth: 'md5', params: { userid: USER_ID, videoId: 'v_1', ts: 1700000000000 } });

    const [call] = http.calls;
    expect(`${call.url.origin}${call.url.pathname}`).toBe('https://hls.videocc.net/service/v1/token');
    expect([...call.params.keys()].sort()).toEqual(['sign', 'ts', 'userid', 'videoId']);
    expect(call.params.get('sign')).toBe(signMd5(signedOf(call.params), SECRET_KEY));
  });

  it('adds writetoken without signing, and needs it', async () => {
    const http = recordedFetch();
    await clientWith(http, { writeToken: WRITE_TOKEN }).request({ method: 'POST', path: '/x', auth: 'writetoken', params: { a: 1 } });
    expect(http.calls[0].params.get('writetoken')).toBe(WRITE_TOKEN);
    expect(http.calls[0].params.has('sign')).toBe(false);

    await expect(clientWith(http).request({ method: 'POST', path: '/x', auth: 'writetoken' })).rejects.toMatchObject({ kind: 'auth' });
  });

  it('sends no auth params with "none"', async () => {
    const http = recordedFetch();
    await clientWith(http).request({ method: 'GET', path: '/x', auth: 'none', params: { a: 1 } });
    expect([...http.calls[0].params.keys()]).toEqual(['a']);
  });

  describe('V4 endpoints', () => {
    it('need the account API credentials', async () => {
      const http = recordedFetch();
      await expect(clientWith(http).request({ method: 'GET', path: '/vod/v4/x', auth: 'v4' })).rejects.toMatchObject({
        kind: 'auth',
        message: 'This endpoint needs the account API credentials: set appId and appSecret'
      });
      expect(http.calls).toHaveLength(0);
    });

    it('sign appId, timestamp and requestId with appSecret, using MD5', async () => {
      const http = recordedFetch();
      await clientWith(http, { appId: 'app1', appSecret: 'app-secret' }).request({
        method: 'POST',
        path: '/vod/v4/user/setting/callback/update',
        auth: 'v4',
        in: 'query',
        params: { callbackUrl: 'https://example.com/cb' }
      });

      const params = http.calls[0].params;
      expect(params.get('appId')).toBe('app1');
      expect(params.has('userid')).toBe(false);
      expect(params.get('sign')).toBe(signMd5(signedOf(params), 'app-secret'));
    });
  });

  it('unwraps the envelope and returns data', async () => {
    const http = recordedFetch(() => jsonResponse(envelope([1, 2, 3])));
    await expect(clientWith(http).request({ method: 'GET', path: '/x' })).resolves.toEqual([1, 2, 3]);
  });

  it('returns the parsed JSON as is with envelope "none"', async () => {
    const http = recordedFetch(() => jsonResponse({ error: '0', data: [{ vid: 'v' }] }));
    await expect(clientWith(http).request({ method: 'GET', path: '/x', envelope: 'none' })).resolves.toEqual({ error: '0', data: [{ vid: 'v' }] });
  });

  describe('failures', () => {
    it('reports a non-200 code as an api error', async () => {
      const http = recordedFetch(() => jsonResponse(envelope('', 400, 'the sign is not right.')));
      const error = await clientWith(http).request({ method: 'GET', path: '/x' }).catch((e: unknown) => e);
      expect(error).toBeInstanceOf(PolyVVodError);
      expect(error).toMatchObject({ kind: 'api', code: 400, httpStatus: 200, message: 'the sign is not right.', retryable: false });
    });

    it('uses error.desc as the message and keeps requestId', async () => {
      const http = recordedFetch(() => jsonResponse({ code: 400, status: 'error', error: { code: 'InvalidParameter', desc: 'callbackUrl is invalid' }, requestId: 'req-1' }));
      await expect(clientWith(http).request({ method: 'GET', path: '/x' })).rejects.toMatchObject({
        kind: 'api',
        code: 400,
        message: 'callbackUrl is invalid',
        requestId: 'req-1'
      });
    });

    it('reports a non-JSON body by its HTTP status', async () => {
      const http = recordedFetch(() => new Response('<html>bad gateway</html>', { status: 502 }));
      await expect(clientWith(http).request({ method: 'GET', path: '/x', idempotent: false })).rejects.toMatchObject({
        kind: 'api',
        code: 502,
        httpStatus: 502,
        message: 'HTTP 502'
      });
    });

    it('reports a network failure', async () => {
      const http = recordedFetch(() => {
        throw new TypeError('fetch failed');
      });
      await expect(clientWith(http).request({ method: 'GET', path: '/x', idempotent: false })).rejects.toMatchObject({
        kind: 'network',
        message: 'Request failed: fetch failed'
      });
    });

    it('reports a timeout', async () => {
      const hanging = vi.fn(
        (_input: unknown, init?: RequestInit) =>
          new Promise<Response>((_, reject) => {
            init?.signal?.addEventListener('abort', () => reject(new DOMException('The operation was aborted due to timeout', 'TimeoutError')));
          })
      );
      const client = new PolyVVodClient({ userId: USER_ID, secretKey: SECRET_KEY, fetch: hanging as unknown as typeof globalThis.fetch, rateLimit: false, maxRetries: 0, timeout: 15 });
      await expect(client.request({ method: 'GET', path: '/x' })).rejects.toMatchObject({ kind: 'network', message: 'Request timeout after 15ms' });
    });

    it('reports a cancellation by the caller and does not retry it', async () => {
      // Like the real fetch: an already-aborted signal rejects right away instead of waiting for an event.
      const abortable = vi.fn(
        (_input: unknown, init?: RequestInit) =>
          new Promise<Response>((_, reject) => {
            const rejectWith = (): void => reject(new DOMException('This operation was aborted', 'AbortError'));
            if (init?.signal?.aborted) rejectWith();
            else init?.signal?.addEventListener('abort', rejectWith, { once: true });
          })
      );
      const client = new PolyVVodClient({ userId: USER_ID, secretKey: SECRET_KEY, fetch: abortable as unknown as typeof globalThis.fetch, rateLimit: false });
      const controller = new AbortController();
      controller.abort();
      await expect(client.request({ method: 'GET', path: '/x', signal: controller.signal })).rejects.toMatchObject({
        kind: 'network',
        message: 'Request cancelled',
        retryable: false
      });
      expect(abortable).toHaveBeenCalledTimes(1);
    });

    it('rejects methods the platform does not serve', async () => {
      const http = recordedFetch();
      await expect(clientWith(http).request({ method: 'DELETE' as 'GET', path: '/x' })).rejects.toMatchObject({ kind: 'validation' });
      expect(http.calls).toHaveLength(0);
    });
  });

  describe('retries', () => {
    it('retries a GET on a network failure', async () => {
      let attempts = 0;
      const http = recordedFetch(() => {
        attempts += 1;
        if (attempts === 1) throw new TypeError('fetch failed');
        return jsonResponse(envelope('done'));
      });
      await expect(clientWith(http).request({ method: 'GET', path: '/x' })).resolves.toBe('done');
      expect(http.calls).toHaveLength(2);
    });

    it('retries a GET on HTTP 503', async () => {
      const http = recordedFetch(() => (http.calls.length === 1 ? new Response(null, { status: 503 }) : jsonResponse(envelope(1))));
      await expect(clientWith(http).request({ method: 'GET', path: '/x' })).resolves.toBe(1);
      expect(http.calls).toHaveLength(2);
    });

    it('does not retry a POST unless it is marked idempotent', async () => {
      const unavailable = recordedFetch(() => new Response(null, { status: 503 }));
      await expect(clientWith(unavailable).request({ method: 'POST', path: '/x' })).rejects.toMatchObject({ kind: 'api', httpStatus: 503, retryable: false });
      expect(unavailable.calls).toHaveLength(1);

      const recoverable = recordedFetch(() => (recoverable.calls.length === 1 ? new Response(null, { status: 503 }) : jsonResponse(envelope('ok'))));
      await expect(clientWith(recoverable).request({ method: 'POST', path: '/x', idempotent: true })).resolves.toBe('ok');
      expect(recoverable.calls).toHaveLength(2);
    });

    it('gives up after maxRetries', async () => {
      const http = recordedFetch(() => new Response(null, { status: 500 }));
      await expect(clientWith(http, { maxRetries: 1 }).request({ method: 'GET', path: '/x' })).rejects.toMatchObject({ kind: 'api', httpStatus: 500 });
      expect(http.calls).toHaveLength(2);
    });

    it('signs every attempt afresh', async () => {
      const http = recordedFetch(() => new Response(null, { status: 500 }));
      await clientWith(http, { maxRetries: 1 }).request({ method: 'GET', path: '/x' }).catch(() => undefined);
      const [first, second] = http.calls.map((call) => call.params.get('requestId'));
      expect(first).not.toBe(second);
    });
  });

  describe('rate limiting', () => {
    it('spaces requests to api.polyv.net out', async () => {
      const http = recordedFetch();
      const client = new PolyVVodClient({ userId: USER_ID, secretKey: SECRET_KEY, fetch: http.fetch, rateLimit: { maxRequests: 1, windowMs: 60 }, retryDelayMs: 1 });
      const started = Date.now();
      await Promise.all([client.request({ method: 'GET', path: '/a' }), client.request({ method: 'GET', path: '/b' })]);
      expect(http.calls).toHaveLength(2);
      expect(Date.now() - started).toBeGreaterThanOrEqual(40);
    });

    it('leaves the other hosts alone and can be switched off', async () => {
      const http = recordedFetch();
      const client = new PolyVVodClient({ userId: USER_ID, secretKey: SECRET_KEY, fetch: http.fetch, rateLimit: { maxRequests: 1, windowMs: 60 }, retryDelayMs: 1 });
      const started = Date.now();
      await Promise.all([client.request({ method: 'POST', host: 'hls', path: '/a', auth: 'none' }), client.request({ method: 'POST', host: 'hls', path: '/b', auth: 'none' })]);
      expect(Date.now() - started).toBeLessThan(40);

      const off = recordedFetch();
      const unthrottled = new PolyVVodClient({ userId: USER_ID, secretKey: SECRET_KEY, fetch: off.fetch, rateLimit: false });
      const unthrottledStart = Date.now();
      await Promise.all(Array.from({ length: 5 }, (_, i) => unthrottled.request({ method: 'GET', path: `/x${i}` })));
      expect(Date.now() - unthrottledStart).toBeLessThan(40);
      expect(unthrottled.config.rateLimit).toBe(false);
    });
  });
});
