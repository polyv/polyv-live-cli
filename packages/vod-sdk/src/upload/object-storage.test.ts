import { createHash, createHmac } from 'node:crypto';

import { describe, expect, it, vi } from 'vitest';

import { PolyVVodError } from '../errors/index.js';
import { recordedFetch } from '../__tests__/helpers.js';
import { ObjectStorageClient, buildStringToSign, isCredentialsExpired } from './object-storage.js';

const OBS = {
  kind: 'obs' as const,
  accessKey: 'AK',
  secretKey: 'SK',
  sessionToken: 'TOKEN',
  bucket: 'polyvupload',
  origin: 'https://polyvupload.obs.cn-south-1.myhuaweicloud.com'
};
const OSS = { ...OBS, kind: 'oss' as const, origin: 'https://polyvupload.oss-cn-shenzhen.aliyuncs.com' };
const KEY = 'uploadvideo/20261125/v_4.mp4';
const xml = (text: string, status = 200) => new Response(text, { status });

describe('buildStringToSign', () => {
  it('lays the string out as the storages expect', () => {
    expect(
      buildStringToSign({
        method: 'PUT',
        vendor: 'obs',
        resource: `/polyvupload/${KEY}`,
        headers: {
          'x-obs-security-token': 'TOKEN',
          'Content-Type': 'text/plain',
          'Content-MD5': 'md5==',
          Date: 'Wed, 25 Nov 2026 00:00:00 GMT',
          Authorization: 'OBS AK:sig'
        },
        subResources: { uploadId: 'UP', partNumber: '1' }
      })
    ).toBe('PUT\nmd5==\ntext/plain\nWed, 25 Nov 2026 00:00:00 GMT\nx-obs-security-token:TOKEN\n/polyvupload/uploadvideo/20261125/v_4.mp4?partNumber=1&uploadId=UP');
  });

  it('sends a bare sub-resource without "=" and leaves missing headers blank', () => {
    expect(
      buildStringToSign({
        method: 'POST',
        vendor: 'oss',
        resource: '/b/k',
        headers: { 'x-oss-security-token': ' TOKEN ', 'x-oss-callback': 'cb' },
        subResources: { uploads: '' }
      })
    ).toBe('POST\n\n\n\nx-oss-callback:cb\nx-oss-security-token:TOKEN\n/b/k?uploads');
  });

  it('keeps sub-resource values raw and ignores other headers and query parameters', () => {
    expect(
      buildStringToSign({ method: 'GET', vendor: 'oss', resource: '/b/k', headers: { Accept: '*/*' }, subResources: { uploadId: 'A+B/C=' } })
    ).toBe('GET\n\n\n\n/b/k?uploadId=A+B/C=');
  });
});

describe('isCredentialsExpired', () => {
  it('is true only for the two expiry codes of a storage error', () => {
    const error = (code: string) => new PolyVVodError('upload', 'x', { code });
    expect(isCredentialsExpired(error('InvalidAccessKeyId'))).toBe(true);
    expect(isCredentialsExpired(error('SecurityTokenExpired'))).toBe(true);
    expect(isCredentialsExpired(error('AccessDenied'))).toBe(false);
    expect(isCredentialsExpired(new Error('SecurityTokenExpired'))).toBe(false);
    expect(isCredentialsExpired(undefined)).toBe(false);
  });
});

describe('ObjectStorageClient', () => {
  it('initiates a multipart upload at the virtual-hosted URL with a signed Authorization header', async () => {
    const http = recordedFetch(() => xml('<InitiateMultipartUploadResult><UploadId>UP-1</UploadId></InitiateMultipartUploadResult>'));
    const client = new ObjectStorageClient(OBS, { fetch: http.fetch });

    await expect(client.initiate(KEY)).resolves.toBe('UP-1');

    const [call] = http.calls;
    expect(call.url.href).toBe(`https://polyvupload.obs.cn-south-1.myhuaweicloud.com/${KEY}?uploads`);
    expect(call.init.method).toBe('POST');
    const headers = call.init.headers as Record<string, string>;
    expect(headers['x-obs-security-token']).toBe('TOKEN');
    expect(headers['Content-Type']).toBe('text/plain');
    const expected = createHmac('sha1', 'SK')
      .update(buildStringToSign({ method: 'POST', headers, vendor: 'obs', resource: `/polyvupload/${KEY}`, subResources: { uploads: '' } }))
      .digest('base64');
    expect(headers.Authorization).toBe(`OBS AK:${expected}`);
  });

  it('signs for OSS with the OSS keyword', async () => {
    const http = recordedFetch(() => xml('<InitiateMultipartUploadResult><UploadId>UP-1</UploadId></InitiateMultipartUploadResult>'));
    await new ObjectStorageClient(OSS, { fetch: http.fetch }).initiate(KEY);
    const headers = http.calls[0].init.headers as Record<string, string>;
    expect(http.calls[0].url.href).toBe(`https://polyvupload.oss-cn-shenzhen.aliyuncs.com/${KEY}?uploads`);
    expect(headers['x-oss-security-token']).toBe('TOKEN');
    expect(headers.Authorization).toMatch(/^OSS AK:/);
  });

  it('reports a storage error with its code and message', async () => {
    const http = recordedFetch(() => xml('<Error><Code>InvalidAccessKeyId</Code><Message>The access key Id you provided does not exist.</Message></Error>', 403));
    const error = await new ObjectStorageClient(OBS, { fetch: http.fetch }).initiate(KEY).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(PolyVVodError);
    expect(error).toMatchObject({
      kind: 'upload',
      code: 'InvalidAccessKeyId',
      httpStatus: 403,
      retryable: false,
      message: 'initiate multipart upload failed: HTTP 403 InvalidAccessKeyId The access key Id you provided does not exist.'
    });
    expect(isCredentialsExpired(error)).toBe(true);
  });

  it('fails when the initiate response carries no upload id', async () => {
    const http = recordedFetch(() => xml('<InitiateMultipartUploadResult></InitiateMultipartUploadResult>'));
    await expect(new ObjectStorageClient(OBS, { fetch: http.fetch }).initiate(KEY)).rejects.toThrow('initiate multipart upload failed');
  });

  it('uploads a part with its MD5 and returns the etag', async () => {
    const http = recordedFetch(({ url }) => {
      if (!url.searchParams.has('partNumber')) return xml('<Error><Code>MissingPart</Code></Error>', 400);
      return new Response(null, { status: 200, headers: { etag: '"etag-1"' } });
    });
    const body = Buffer.from('hello');

    await expect(new ObjectStorageClient(OBS, { fetch: http.fetch }).uploadPart(KEY, 'UP-1', 1, body)).resolves.toBe('"etag-1"');

    const [call] = http.calls;
    expect(call.init.method).toBe('PUT');
    expect(call.url.searchParams.get('partNumber')).toBe('1');
    expect(call.url.searchParams.get('uploadId')).toBe('UP-1');
    expect(call.init.body).toBe(body);
    const headers = call.init.headers as Record<string, string>;
    expect(headers['Content-MD5']).toBe(createHash('md5').update(body).digest('base64'));
    expect(headers['Content-Type']).toBe('text/plain');
  });

  it('marks a server-side part failure retryable', async () => {
    const http = recordedFetch(() => xml('<Error><Code>InternalError</Code><Message>We encountered an internal error.</Message></Error>', 500));
    await expect(new ObjectStorageClient(OBS, { fetch: http.fetch }).uploadPart(KEY, 'UP-1', 2, Buffer.from('x'))).rejects.toMatchObject({
      kind: 'upload',
      httpStatus: 500,
      retryable: true,
      code: 'InternalError'
    });
  });

  it('lists the parts the storage holds, decoding the etags', async () => {
    const http = recordedFetch(() => xml('<ListPartsResult><Part><PartNumber>1</PartNumber><ETag>&quot;etag-1&quot;</ETag><Size>100</Size></Part><Part><PartNumber>2</PartNumber><ETag>&quot;a&amp;b&quot;</ETag></Part></ListPartsResult>'));
    await expect(new ObjectStorageClient(OBS, { fetch: http.fetch }).listParts(KEY, 'UP-1')).resolves.toEqual([
      { partNumber: 1, etag: '"etag-1"' },
      { partNumber: 2, etag: '"a&b"' }
    ]);
    expect(http.calls[0].init.method).toBe('GET');
    expect(http.calls[0].url.searchParams.get('uploadId')).toBe('UP-1');
  });

  it('completes with the part list and the callback policy', async () => {
    const http = recordedFetch(({ init }) => new Response(String((init.headers as Record<string, string>)['x-obs-callback']), { status: 200 }));
    const client = new ObjectStorageClient(OBS, { fetch: http.fetch });

    const result = await client.complete(KEY, 'UP-1', [{ partNumber: 2, etag: '"b"' }, { partNumber: 1, etag: '"a"' }], 'Y2FsbGJhY2s=');

    expect(result).toEqual({ status: 200, body: 'Y2FsbGJhY2s=' });
    const [call] = http.calls;
    expect(call.init.method).toBe('POST');
    expect(call.url.searchParams.has('uploads')).toBe(false);
    expect(call.url.searchParams.get('uploadId')).toBe('UP-1');
    expect((call.init.headers as Record<string, string>)['x-obs-callback']).toBe('Y2FsbGJhY2s=');
    expect(String(call.init.body)).toBe(
      '<CompleteMultipartUpload><Part><PartNumber>2</PartNumber><ETag>"b"</ETag></Part><Part><PartNumber>1</PartNumber><ETag>"a"</ETag></Part></CompleteMultipartUpload>'
    );
  });

  it('returns the status of the complete call even when the callback failed', async () => {
    const http = recordedFetch(() => new Response('callback failed', { status: 203 }));
    await expect(new ObjectStorageClient(OSS, { fetch: http.fetch }).complete(KEY, 'UP-1', [], '')).resolves.toEqual({ status: 203, body: 'callback failed' });
  });

  it('aborts an upload and tolerates one that no longer exists', async () => {
    const gone = recordedFetch(() => new Response(null, { status: 404 }));
    await expect(new ObjectStorageClient(OBS, { fetch: gone.fetch }).abort(KEY, 'UP-1')).resolves.toBeUndefined();
    expect(gone.calls[0].init.method).toBe('DELETE');

    const broken = recordedFetch(() => xml('<Error><Code>InternalError</Code></Error>', 500));
    await expect(new ObjectStorageClient(OBS, { fetch: broken.fetch }).abort(KEY, 'UP-1')).rejects.toThrow('abort multipart upload failed');
  });

  it('encodes the object key and the upload id in the URL but signs them raw', async () => {
    const http = recordedFetch(() => xml('<ListPartsResult></ListPartsResult>'));
    const client = new ObjectStorageClient(OBS, { fetch: http.fetch });
    await client.listParts('dir/名 称.mp4', 'A+B/C=');

    const [call] = http.calls;
    expect(call.url.pathname).toBe('/dir/%E5%90%8D%20%E7%A7%B0.mp4');
    expect(call.url.searchParams.get('uploadId')).toBe('A+B/C=');
    const expected = createHmac('sha1', 'SK')
      .update(buildStringToSign({ method: 'GET', headers: call.init.headers as Record<string, string>, vendor: 'obs', resource: '/polyvupload/dir/名 称.mp4', subResources: { uploadId: 'A+B/C=' } }))
      .digest('base64');
    expect((call.init.headers as Record<string, string>).Authorization).toBe(`OBS AK:${expected}`);
  });

  it('reports a connection failure', async () => {
    const http = recordedFetch(() => {
      throw new TypeError('connection reset');
    });
    await expect(new ObjectStorageClient(OBS, { fetch: http.fetch }).initiate(KEY)).rejects.toMatchObject({
      kind: 'upload',
      message: 'Storage request failed: connection reset',
      retryable: true
    });
  });

  it('reports a cancellation as such', async () => {
    // Like the real fetch: an aborted signal makes the call fail right away.
    const aborting = vi.fn((_input: unknown, init?: RequestInit): Promise<Response> => {
      init?.signal?.throwIfAborted();
      return Promise.resolve(new Response(null, { status: 204 }));
    });
    const controller = new AbortController();
    controller.abort();
    const client = new ObjectStorageClient(OBS, { fetch: aborting as unknown as typeof globalThis.fetch, signal: controller.signal });
    await expect(client.abort(KEY, 'UP-1')).rejects.toMatchObject({ kind: 'upload', message: 'Upload cancelled', retryable: false });
  });
});
