import { mkdtemp, readFile, rm, truncate, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PolyVVodError } from '../errors/index.js';
import { clientWith, envelope, jsonResponse, recordedFetch, WRITE_TOKEN } from '../__tests__/helpers.js';
import { DIRECT_UPLOAD_MAX_BYTES } from '../types/upload.js';
import { multipartStream, uploadFileDirect } from './direct-uploader.js';

const TINY_MP4 = fileURLToPath(new URL('../../tests/fixtures/tiny.mp4', import.meta.url));

let dir: string;
let tiny: Buffer;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'polyv-vod-sdk-'));
  tiny = await readFile(TINY_MP4);
});
afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

async function bodyOf(init: RequestInit): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of init.body as AsyncIterable<Uint8Array>) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

const okResponse = (extra: Record<string, unknown> = {}) => jsonResponse({ error: '0', data: [{ vid: 'V_4', title: 'sample', duration: '00:00:01', status: '10', ...extra }] });

describe('uploadFileDirect', () => {
  it('streams the fields and the file in one multipart request', async () => {
    let raw: Buffer = Buffer.alloc(0);
    let request: RequestInit | undefined;
    const http = recordedFetch(async (call) => {
      raw = await bodyOf(call.init);
      request = call.init;
      return okResponse();
    });
    const progress: number[] = [];

    const result = await uploadFileDirect(clientWith(http, { writeToken: WRITE_TOKEN }), {
      filePath: TINY_MP4,
      title: 'sample',
      tag: 't',
      description: 'd',
      cataId: 3,
      luping: true,
      state: 'ctx',
      watermark: 'https://img.example.com/w.png',
      watermarkLocation: 2,
      fcharset: 'ISO-8859-1',
      onProgress: (event) => progress.push(event.uploadedBytes)
    });

    expect(result).toEqual({ vid: 'V_4', mode: 'direct', title: 'sample', status: 10, resumed: false });
    const [call] = http.calls;
    expect(`${call.url.origin}${call.url.pathname}${call.url.search}`).toBe('https://v.polyv.net/uc/services/rest?method=uploadfile');
    expect(call.init.method).toBe('POST');
    expect(request).toMatchObject({ duplex: 'half' });
    const headers = call.init.headers as Record<string, string>;
    const boundary = /boundary=(.+)$/.exec(headers['content-type'])?.[1] as string;
    expect(boundary).toMatch(/^----polyv-vod-sdk-[0-9a-f-]{36}$/);

    const text = raw.toString('utf8');
    const field = (name: string, value: string) => `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`;
    expect(text).toContain(field('writetoken', WRITE_TOKEN));
    expect(text).toContain(field('JSONRPC', '{"title":"sample","tag":"t","desc":"d"}'));
    expect(text).toContain(field('format', 'json'));
    expect(text).toContain(field('cataid', '3'));
    expect(text).toContain(field('luping', '1'));
    expect(text).toContain(field('state', 'ctx'));
    expect(text).toContain(field('watermark', 'https://img.example.com/w.png'));
    expect(text).toContain(field('watermarkLocation', '2'));
    expect(text).toContain(field('fcharset', 'ISO-8859-1'));
    expect(text).toContain(`--${boundary}\r\nContent-Disposition: form-data; name="Filedata"; filename="tiny.mp4"\r\nContent-Type: application/octet-stream\r\n\r\n`);
    const tail = Buffer.from(`\r\n--${boundary}--\r\n`);
    expect(raw.subarray(raw.length - tail.length - tiny.length, raw.length - tail.length).equals(tiny)).toBe(true);
    expect(raw.subarray(raw.length - tail.length).equals(tail)).toBe(true);

    expect(progress[0]).toBeGreaterThan(0);
    expect(progress[progress.length - 1]).toBe(tiny.length);
  });

  it('takes the title from the file name, sends fileMd5 in uppercase and skips absent options', async () => {
    let raw: Buffer = Buffer.alloc(0);
    const http = recordedFetch(async (call) => {
      raw = await bodyOf(call.init);
      return okResponse({ title: undefined });
    });

    const result = await uploadFileDirect(clientWith(http, { writeToken: WRITE_TOKEN }), { filePath: TINY_MP4, fileMd5: 'abcdef0123456789abcdef0123456789' });

    expect(result).toEqual({ vid: 'V_4', mode: 'direct', title: 'tiny', status: 10, resumed: false });
    const text = raw.toString('utf8');
    expect(text).toContain('{"title":"tiny"}');
    expect(text).toContain('ABCDEF0123456789ABCDEF0123456789');
    expect(text).not.toContain('name="cataid"');
    expect(text).not.toContain('name="luping"');
    expect(text).not.toContain('name="state"');
    expect(text).not.toContain('name="watermark"');
    expect(text).not.toContain('name="fcharset"');
  });

  it('maps the error codes of the endpoint', async () => {
    const http = recordedFetch(() => jsonResponse({ error: '16', data: '' }));
    const error = await uploadFileDirect(clientWith(http, { writeToken: WRITE_TOKEN }), { filePath: TINY_MP4 }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(PolyVVodError);
    expect(error).toMatchObject({ kind: 'upload', code: '16', message: 'Direct upload failed: The account has no storage space left' });
  });

  it('reports a response without a vid', async () => {
    await expect(
      uploadFileDirect(clientWith(recordedFetch(() => jsonResponse({ error: '0', data: [] })), { writeToken: WRITE_TOKEN }), { filePath: TINY_MP4 })
    ).rejects.toMatchObject({ kind: 'upload', message: 'Direct upload failed: HTTP 200', code: '0' });
    await expect(
      uploadFileDirect(clientWith(recordedFetch(() => new Response('<html>oops</html>', { status: 502 })), { writeToken: WRITE_TOKEN }), { filePath: TINY_MP4 })
    ).rejects.toMatchObject({ kind: 'upload', message: 'Direct upload failed: HTTP 502', httpStatus: 502 });
  });

  it('needs writeToken', async () => {
    const http = recordedFetch();
    await expect(uploadFileDirect(clientWith(http), { filePath: TINY_MP4 })).rejects.toMatchObject({ kind: 'auth' });
    expect(http.calls).toHaveLength(0);
  });

  it('validates the file before uploading', async () => {
    const http = recordedFetch();
    const client = clientWith(http, { writeToken: WRITE_TOKEN });
    await expect(uploadFileDirect(client, { filePath: join(dir, 'missing.mp4') })).rejects.toThrow('Cannot read file');
    await writeFile(join(dir, 'empty.mp4'), '');
    await expect(uploadFileDirect(client, { filePath: join(dir, 'empty.mp4') })).rejects.toThrow('File is empty');
    await expect(uploadFileDirect(client, { filePath: dir })).rejects.toThrow('Not a file');
    // A sparse file of just over 2 GB takes no disk space.
    const huge = join(dir, 'huge.mp4');
    await writeFile(huge, '');
    await truncate(huge, DIRECT_UPLOAD_MAX_BYTES + 1);
    await expect(uploadFileDirect(client, { filePath: huge })).rejects.toThrow('supports files up to 2 GB');
    expect(http.calls).toHaveLength(0);
  });

  it('reports a failed request, and a cancelled one as such', async () => {
    const failing = recordedFetch(() => {
      throw new TypeError('socket hang up');
    });
    await expect(uploadFileDirect(clientWith(failing, { writeToken: WRITE_TOKEN }), { filePath: TINY_MP4 })).rejects.toMatchObject({
      kind: 'upload',
      message: 'Upload failed: socket hang up',
      retryable: true
    });

    const controller = new AbortController();
    const cancelling = vi.fn((): Promise<Response> => {
      controller.abort();
      throw new DOMException('This operation was aborted', 'AbortError');
    });
    await expect(
      uploadFileDirect(clientWith(recordedFetch(), { writeToken: WRITE_TOKEN, fetch: cancelling as unknown as typeof globalThis.fetch }), { filePath: TINY_MP4, signal: controller.signal })
    ).rejects.toMatchObject({ kind: 'upload', message: 'Upload cancelled' });
  });

  it('stops before the request when the caller already aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    const http = recordedFetch();
    await expect(uploadFileDirect(clientWith(http, { writeToken: WRITE_TOKEN }), { filePath: TINY_MP4, signal: controller.signal })).rejects.toMatchObject({ name: 'AbortError' });
    expect(http.calls).toHaveLength(0);
  });
});

describe('multipartStream', () => {
  it('escapes quotes and newlines in the file name and closes with the final boundary', async () => {
    const parts = [
      { name: 'a', value: '1' },
      { name: 'f', filename: 'a"b\r\nc.mp4', contentType: 'video/mp4', stream: Readable.from([Buffer.from('FILE')]) }
    ];
    const chunks: Buffer[] = [];
    for await (const chunk of multipartStream(parts, 'BOUNDARY', () => undefined)) chunks.push(Buffer.from(chunk));
    expect(Buffer.concat(chunks).toString()).toBe(
      '--BOUNDARY\r\nContent-Disposition: form-data; name="a"\r\n\r\n1\r\n' +
        '--BOUNDARY\r\nContent-Disposition: form-data; name="f"; filename="a_b__c.mp4"\r\nContent-Type: video/mp4\r\n\r\nFILE\r\n' +
        '--BOUNDARY--\r\n'
    );
  });

  it('counts the bytes read from the stream', async () => {
    const counted: number[] = [];
    const stream = multipartStream([{ name: 'f', filename: 'f.bin', stream: Readable.from([Buffer.from('ab'), Buffer.from('cde')]) }], 'B', (n) => counted.push(n));
    for await (const _chunk of stream) {
      // drain
    }
    expect(counted).toEqual([2, 3]);
  });
});

describe('UploadService.uploadFile', () => {
  it('uses the direct upload for small files in auto mode and when asked to', async () => {
    const http = recordedFetch(() => okResponse());
    const client = clientWith(http, { writeToken: WRITE_TOKEN });
    await expect(client.upload.uploadFile({ filePath: TINY_MP4 })).resolves.toMatchObject({ vid: 'V_4', mode: 'direct' });
    await expect(client.upload.uploadFile({ filePath: TINY_MP4, mode: 'direct' })).resolves.toMatchObject({ vid: 'V_4', mode: 'direct' });
    expect(http.calls.map((call) => call.url.origin)).toEqual(['https://v.polyv.net', 'https://v.polyv.net']);
  });

  it('switches to the chunked upload above 2 GB, and when asked to', async () => {
    // A sparse file of just over 2 GB takes no disk space.
    const huge = join(dir, 'huge.mp4');
    await writeFile(huge, '');
    await truncate(huge, DIRECT_UPLOAD_MAX_BYTES + 1);
    const http = recordedFetch(() => jsonResponse(envelope({})));
    const client = clientWith(http, { writeToken: WRITE_TOKEN });

    await expect(client.upload.uploadFile({ filePath: huge })).rejects.toThrow('did not reserve a vid');
    await expect(client.upload.uploadFile({ filePath: TINY_MP4, mode: 'chunked' })).rejects.toThrow('did not reserve a vid');
    expect(http.calls.map((call) => call.url.pathname)).toEqual(['/v2/uploadvideo/userid123/init', '/v2/uploadvideo/userid123/init']);
  });

  it('reports an unreadable file in auto mode', async () => {
    const http = recordedFetch();
    await expect(clientWith(http, { writeToken: WRITE_TOKEN }).upload.uploadFile({ filePath: join(dir, 'missing.mp4') })).rejects.toThrow('Cannot read file');
    expect(http.calls).toHaveLength(0);
  });
});
