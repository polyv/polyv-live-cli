import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PolyVVodError } from '../errors/index.js';
import { DEFAULT_PART_SIZE, MIN_PART_SIZE } from '../types/upload.js';
import {
  checkpointPath,
  defaultCheckpointDir,
  isCheckpointFor,
  readCheckpoint,
  removeCheckpoint,
  writeCheckpoint,
  type UploadCheckpoint
} from './checkpoint.js';
import { abortChunkedUpload, normalizePartSize, selectStorage, uploadFileChunked } from './chunked-uploader.js';
import { clientWith, envelope, jsonResponse, recordedFetch, type Recorded } from '../__tests__/helpers.js';

const TINY_MP4 = fileURLToPath(new URL('../../tests/fixtures/tiny.mp4', import.meta.url));
const FILE_SIZE = 350_000;
const PART_SIZE = MIN_PART_SIZE;

let dir: string;
let filePath: string;
let checkpointDir: string;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'polyv-vod-sdk-'));
  filePath = join(dir, 'sample.bin');
  checkpointDir = join(dir, 'checkpoints');
  await writeFile(filePath, Buffer.alloc(FILE_SIZE, 7));
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

interface World {
  api: Recorded;
  storage: ReturnType<typeof vi.fn<[input: string | URL, init?: RequestInit], Promise<Response>>>;
  state: { stored: Map<number, string>; failPart: number; expireOnPart: number; completeStatus: number };
}

const OBS_INFO = {
  bucketName: 'polyvupload',
  expires: '2026-11-25T12:00:00Z',
  endpoint: 'obs.cn-south-1.myhuaweicloud.com',
  callbackBodyType: 'application/json',
  securitytoken: 'STS',
  sk: 'SK',
  ak: 'AK',
  callbackUrl: 'https://my.polyv.net/hw/obs-callback',
  isCname: false,
  dir: 'uploadvideo/20261125/',
  callbackBody: '{"vid":"V_4"}'
};
const OSS_CALLBACK = Buffer.from('{"callbackUrl":"oss-callback"}').toString('base64');

/** A platform that always reserves vid `V_4`, plus a storage that remembers its parts. */
function fakeWorld(issuesObs: boolean): World {
  const init = {
    vid: 'V_4',
    validityTime: 3600,
    encodedCallback: OSS_CALLBACK,
    ...(issuesObs ? { hwObsInfo: OBS_INFO, storageType: 'hw' } : { storageType: 'oss' }),
    accessId: 'AK',
    accessKey: 'SK',
    token: 'STS',
    host: 'http://polyvupload.oss-cn-shenzhen.aliyuncs.com',
    bucketName: 'polyvupload',
    dir: 'uploadvideo/20261125/'
  };
  const state: World['state'] = { stored: new Map(), failPart: 0, expireOnPart: 0, completeStatus: 200 };
  const xml = (text: string, status = 200) => new Response(text, { status });
  const storage = vi.fn(async (input: string | URL, init: RequestInit = {}) => {
    const url = new URL(String(input));
    const method = init.method ?? 'GET';
    const partNumber = Number(url.searchParams.get('partNumber'));
    if (method === 'PUT' && partNumber === state.expireOnPart) {
      state.expireOnPart = 0;
      return xml('<Error><Code>SecurityTokenExpired</Code></Error>', 403);
    }
    if (method === 'POST' && url.searchParams.has('uploads')) {
      return xml('<InitiateMultipartUploadResult><UploadId>UP-1</UploadId></InitiateMultipartUploadResult>');
    }
    if (method === 'PUT') {
      if (partNumber === state.failPart) {
        state.failPart = 0;
        return xml('<Error><Code>InternalError</Code><Message>boom</Message></Error>', 500);
      }
      state.stored.set(partNumber, `"etag-${partNumber}"`);
      return new Response(null, { status: 200, headers: { etag: `"etag-${partNumber}"` } });
    }
    if (method === 'GET') {
      return xml(
        `<ListPartsResult>${[...state.stored].map(([n, etag]) => `<Part><PartNumber>${n}</PartNumber><ETag>${etag.replace(/"/g, '&quot;')}</ETag></Part>`).join('')}</ListPartsResult>`
      );
    }
    if (method === 'POST') return xml('{"status":"success"}', state.completeStatus);
    if (method === 'DELETE') {
      state.stored.clear();
      return new Response(null, { status: 204 });
    }
    return xml('<Error><Code>BadRequest</Code></Error>', 400);
  });
  const api = recordedFetch(({ url }) => jsonResponse(envelope(url.pathname.endsWith('/init') ? init : { ...init, vid: undefined })));
  return { api, storage, state };
}

const asFetch = (world: World) => world.storage as unknown as typeof globalThis.fetch;
const storageCalls = (world: World) =>
  world.storage.mock.calls.map(([input, init]) => ({ url: new URL(String(input)), method: init?.method ?? 'GET', init: init ?? {} }));
const headerOf = (call: { init: RequestInit }, name: string): string => (call.init.headers as Record<string, string>)[name];

const sampleCheckpoint = (overrides: Partial<UploadCheckpoint> = {}): UploadCheckpoint => ({
  version: 1,
  vid: 'V_4',
  title: 'sample',
  key: 'uploadvideo/20261125/V_4.bin',
  storage: 'obs',
  uploadId: 'UP-1',
  fileSize: FILE_SIZE,
  fileModifiedMs: 1,
  partSize: PART_SIZE,
  createdAt: 1,
  parts: [],
  ...overrides
});

describe('uploadFileChunked', () => {
  it('uploads every part through Huawei OBS and completes with the callback', async () => {
    const world = fakeWorld(true);
    const progress: number[] = [];

    const result = await uploadFileChunked(clientWith(world.api), {
      filePath,
      title: '课程 第一课',
      description: '简介',
      cataId: 7,
      partSize: PART_SIZE,
      checkpointDir,
      storageFetch: asFetch(world),
      onProgress: (event) => progress.push(event.uploadedBytes)
    });

    expect(result).toEqual({ vid: 'V_4', mode: 'chunked', title: '课程 第一课', status: 6, resumed: false, parts: 4 });

    const init = world.api.calls[0];
    expect(`${init.url.origin}${init.url.pathname}`).toBe('https://api.polyv.net/v2/uploadvideo/userid123/init');
    expect(init.init.method).toBe('POST');
    expect(Object.fromEntries(init.params)).toMatchObject({
      autoid: '1',
      uploadType: 'java_sdk_chunk_v1',
      title: '课程 第一课',
      describ: '简介',
      cataid: '7',
      filesize: String(FILE_SIZE),
      luping: '0',
      keepsource: '0'
    });
    expect(JSON.parse(init.params.get('extra') ?? '')).toEqual({ watermarkLocation: '', watermark: '' });

    const calls = storageCalls(world);
    expect(calls.map((call) => call.method)).toEqual(['POST', 'GET', 'PUT', 'PUT', 'PUT', 'PUT', 'POST']);
    expect(calls[0].url.origin).toBe('https://polyvupload.obs.cn-south-1.myhuaweicloud.com');
    expect(calls[0].url.pathname).toBe('/uploadvideo/20261125/V_4.bin');

    const complete = calls[calls.length - 1];
    expect(complete.url.search).toBe('?uploadId=UP-1');
    expect(headerOf(complete, 'x-obs-callback')).toBe(
      Buffer.from(JSON.stringify({ callbackUrl: OBS_INFO.callbackUrl, callbackBody: OBS_INFO.callbackBody, callbackBodyType: OBS_INFO.callbackBodyType })).toString('base64')
    );
    expect(String(complete.init.body)).toBe(
      '<CompleteMultipartUpload>' +
        [1, 2, 3, 4].map((n) => `<Part><PartNumber>${n}</PartNumber><ETag>"etag-${n}"</ETag></Part>`).join('') +
        '</CompleteMultipartUpload>'
    );

    expect(progress[progress.length - 1]).toBe(FILE_SIZE);
    expect([...progress].sort((a, b) => a - b)).toEqual(progress);
    await expect(readCheckpoint(checkpointPath(checkpointDir, filePath))).resolves.toBeNull();
  });

  it('uploads through Aliyun OSS when asked to', async () => {
    const world = fakeWorld(true);
    await uploadFileChunked(clientWith(world.api), { filePath, partSize: PART_SIZE, checkpointDir, storageFetch: asFetch(world), storage: 'oss' });

    const calls = storageCalls(world);
    expect(calls[0].url.origin).toBe('https://polyvupload.oss-cn-shenzhen.aliyuncs.com');
    expect(headerOf(calls[0], 'Authorization')).toMatch(/^OSS AK:/);
    const complete = calls[calls.length - 1];
    expect(headerOf(complete, 'x-oss-callback')).toBe(OSS_CALLBACK);
    expect(headerOf(complete, 'x-oss-security-token')).toBe('STS');
  });

  it('follows the platform and uses OSS when it issues no OBS credentials', async () => {
    const world = fakeWorld(false);
    await uploadFileChunked(clientWith(world.api), { filePath, partSize: PART_SIZE, checkpointDir, storageFetch: asFetch(world) });
    expect(storageCalls(world)[0].url.origin).toBe('https://polyvupload.oss-cn-shenzhen.aliyuncs.com');
  });

  it('refuses a storage the platform issued no credentials for', async () => {
    const world = fakeWorld(false);
    await expect(uploadFileChunked(clientWith(world.api), { filePath, partSize: PART_SIZE, checkpointDir, storageFetch: asFetch(world), storage: 'obs' })).rejects.toThrow(
      'no OBS credentials'
    );
  });

  it('derives the title from the file name when none is given', async () => {
    const world = fakeWorld(true);
    const result = await uploadFileChunked(clientWith(world.api), { filePath, partSize: PART_SIZE, checkpointDir, storageFetch: asFetch(world) });
    expect(result.title).toBe('sample');
    expect(world.api.calls[0].params.get('title')).toBe('sample');
  });

  it('continues an interrupted upload from its checkpoint', async () => {
    const world = fakeWorld(true);
    const client = clientWith(world.api);
    const options = { filePath, partSize: PART_SIZE, checkpointDir, storageFetch: asFetch(world), concurrency: 1 };

    world.state.failPart = 3;
    await expect(uploadFileChunked(client, options)).rejects.toMatchObject({ kind: 'upload', message: 'upload part 3 failed: HTTP 500 InternalError boom' });

    const saved = await readCheckpoint(checkpointPath(checkpointDir, filePath));
    expect(saved).toMatchObject({ vid: 'V_4', uploadId: 'UP-1', key: 'uploadvideo/20261125/V_4.bin', storage: 'obs', fileSize: FILE_SIZE });
    expect(saved?.parts.map((part) => part.partNumber)).toEqual([1, 2]);
    expect([...world.state.stored.keys()]).toEqual([1, 2]);

    const result = await uploadFileChunked(client, options);
    expect(result).toMatchObject({ vid: 'V_4', resumed: true, parts: 4 });

    const secondRunInit = world.api.calls[world.api.calls.length - 1];
    expect(secondRunInit.params.get('autoid')).toBe('0');
    expect(secondRunInit.params.get('vid')).toBe('V_4');
    expect(secondRunInit.params.has('describ')).toBe(false);
    // Only the two missing parts are put again; the upload is not initiated anew.
    expect(storageCalls(world).slice(-4).map((call) => call.method)).toEqual(['GET', 'PUT', 'PUT', 'POST']);
    await expect(readCheckpoint(checkpointPath(checkpointDir, filePath))).resolves.toBeNull();
  });

  it('keeps the title of the interrupted run when it resumes, and reports that one', async () => {
    const world = fakeWorld(true);
    const client = clientWith(world.api);
    const options = { filePath, partSize: PART_SIZE, checkpointDir, storageFetch: asFetch(world), concurrency: 1 };

    world.state.failPart = 3;
    await expect(uploadFileChunked(client, { ...options, title: '第一课' })).rejects.toMatchObject({ kind: 'upload' });

    // The second run asks for another title. The vid was reserved as "第一课" and stays so.
    const result = await uploadFileChunked(client, { ...options, title: '改过的标题' });
    expect(result).toMatchObject({ vid: 'V_4', title: '第一课', resumed: true });
    expect(world.api.calls[world.api.calls.length - 1].params.get('title')).toBe('第一课');
  });

  it('ignores a checkpoint that describes a different version of the file', async () => {
    const world = fakeWorld(true);
    await writeCheckpoint(checkpointPath(checkpointDir, filePath), sampleCheckpoint({ vid: 'OLD', uploadId: 'OLD-UP', fileSize: FILE_SIZE - 1 }));

    const result = await uploadFileChunked(clientWith(world.api), { filePath, partSize: PART_SIZE, checkpointDir, storageFetch: asFetch(world) });

    expect(result.resumed).toBe(false);
    expect(world.api.calls[0].params.get('autoid')).toBe('1');
  });

  it('does not look for a checkpoint when resume is off', async () => {
    const world = fakeWorld(true);
    await writeCheckpoint(checkpointPath(checkpointDir, filePath), sampleCheckpoint({ vid: 'OLD', uploadId: 'OLD-UP' }));

    const result = await uploadFileChunked(clientWith(world.api), { filePath, partSize: PART_SIZE, checkpointDir, resume: false, storageFetch: asFetch(world) });

    expect(result.resumed).toBe(false);
    expect(world.api.calls[0].params.get('vid')).toBeNull();
  });

  it('re-issues the storage credentials when they expire mid-upload', async () => {
    const world = fakeWorld(true);
    world.state.expireOnPart = 2;

    const result = await uploadFileChunked(clientWith(world.api), { filePath, partSize: PART_SIZE, checkpointDir, concurrency: 1, storageFetch: asFetch(world) });

    expect(result.parts).toBe(4);
    expect(world.api.calls.map((call) => call.url.pathname)).toEqual(['/v2/uploadvideo/userid123/init', '/v2/uploadvideo/userid123/token']);
    expect(world.state.stored.size).toBe(4);
  });

  it('fails when the platform callback fails, and keeps the checkpoint', async () => {
    const world = fakeWorld(true);
    world.state.completeStatus = 203;
    await expect(uploadFileChunked(clientWith(world.api), { filePath, partSize: PART_SIZE, checkpointDir, storageFetch: asFetch(world) })).rejects.toThrow(
      'platform callback failed (HTTP 203)'
    );
    expect(await readCheckpoint(checkpointPath(checkpointDir, filePath))).toMatchObject({ uploadId: 'UP-1' });
  });

  it('stops picking up new parts once one part fails for good', async () => {
    const world = fakeWorld(true);
    world.state.failPart = 1;
    await expect(uploadFileChunked(clientWith(world.api), { filePath, partSize: PART_SIZE, checkpointDir, storageFetch: asFetch(world), concurrency: 1 })).rejects.toMatchObject({
      kind: 'upload'
    });
    expect(world.state.stored.size).toBe(0);
    expect(storageCalls(world).filter((call) => call.method === 'PUT')).toHaveLength(1);
  });

  it('stops before any request when the caller already aborted', async () => {
    const world = fakeWorld(true);
    const controller = new AbortController();
    controller.abort();
    await expect(
      uploadFileChunked(clientWith(world.api), { filePath, partSize: PART_SIZE, checkpointDir, storageFetch: asFetch(world), signal: controller.signal })
    ).rejects.toMatchObject({ name: 'AbortError' });
    expect(world.api.calls).toHaveLength(0);
  });

  it('validates the file and the part size before touching the network', async () => {
    const world = fakeWorld(true);
    const client = clientWith(world.api);
    const upload = (overrides: Record<string, unknown>) =>
      uploadFileChunked(client, { filePath, partSize: PART_SIZE, checkpointDir, storageFetch: asFetch(world), ...overrides });

    await expect(upload({ filePath: join(dir, 'missing.bin') })).rejects.toThrow('Cannot read file');
    await writeFile(join(dir, 'empty.bin'), '');
    await expect(upload({ filePath: join(dir, 'empty.bin') })).rejects.toThrow('File is empty');
    await expect(upload({ filePath: dir })).rejects.toThrow('Not a file');
    await expect(upload({ partSize: 0 })).rejects.toThrow('partSize must be a positive integer');
    await expect(upload({ partSize: 1.5 })).rejects.toThrow('partSize must be a positive integer');
    await expect(upload({ partSize: 5 * 1024 * 1024 * 1024 + 1 })).rejects.toThrow('must not exceed');
    expect(world.api.calls).toHaveLength(0);

    // A part size below the storage minimum is raised to it.
    await expect(upload({ filePath: TINY_MP4, partSize: 10 })).resolves.toMatchObject({ vid: 'V_4', parts: 1 });
    expect(world.api.calls).toHaveLength(1);
  });
});

describe('abortChunkedUpload', () => {
  it('discards the stored parts and the checkpoint', async () => {
    const world = fakeWorld(true);
    await writeCheckpoint(checkpointPath(checkpointDir, filePath), sampleCheckpoint());
    world.state.stored.set(1, '"etag-1"');

    await expect(abortChunkedUpload(clientWith(world.api), { filePath, checkpointDir, storageFetch: asFetch(world) })).resolves.toBe(true);

    expect(world.api.calls[0].params.get('autoid')).toBe('0');
    expect(storageCalls(world).map((call) => call.method)).toEqual(['DELETE']);
    expect(world.state.stored.size).toBe(0);
    await expect(readCheckpoint(checkpointPath(checkpointDir, filePath))).resolves.toBeNull();
  });

  it('resolves to false when there is nothing to abort', async () => {
    const world = fakeWorld(true);
    await expect(abortChunkedUpload(clientWith(world.api), { filePath, checkpointDir })).resolves.toBe(false);
    expect(world.api.calls).toHaveLength(0);
  });
});

describe('selectStorage', () => {
  const source = {
    hwObsInfo: OBS_INFO,
    accessId: 'AK',
    accessKey: 'SK',
    token: 'STS',
    host: 'http://b.oss-cn-shenzhen.aliyuncs.com',
    bucketName: 'b',
    dir: 'oss/',
    encodedCallback: 'Q0I='
  };

  it('prefers OBS when the platform issued OBS credentials', () => {
    expect(selectStorage(source).credentials).toEqual({
      kind: 'obs',
      accessKey: 'AK',
      secretKey: 'SK',
      sessionToken: 'STS',
      bucket: 'polyvupload',
      origin: 'https://polyvupload.obs.cn-south-1.myhuaweicloud.com'
    });
  });

  it('uses OSS otherwise, upgrading its host to https', () => {
    const { credentials, callback, dir } = selectStorage({ ...source, hwObsInfo: undefined });
    expect(credentials).toMatchObject({ kind: 'oss', origin: 'https://b.oss-cn-shenzhen.aliyuncs.com', bucket: 'b' });
    expect(callback).toBe('Q0I=');
    expect(dir).toBe('oss/');
  });

  it('refuses a storage without credentials', () => {
    expect(() => selectStorage({ ...source, hwObsInfo: undefined }, 'obs')).toThrow('no OBS credentials');
    expect(() => selectStorage({ hwObsInfo: undefined }, 'oss')).toThrow('no complete OSS credentials');
  });
});

describe('normalizePartSize', () => {
  it('defaults, enforces the minimum and rejects bad values', () => {
    expect(normalizePartSize()).toBe(DEFAULT_PART_SIZE);
    expect(normalizePartSize(1024)).toBe(MIN_PART_SIZE);
    expect(normalizePartSize(2 * 1024 * 1024)).toBe(2 * 1024 * 1024);
    expect(() => normalizePartSize(-1)).toThrow(PolyVVodError);
    expect(() => normalizePartSize(6 * 1024 * 1024 * 1024)).toThrow('must not exceed');
  });
});

describe('checkpoint files', () => {
  it('round-trip and stay tied to the file they describe', async () => {
    const path = checkpointPath(checkpointDir, filePath);
    const checkpoint = sampleCheckpoint({ parts: [{ partNumber: 1, etag: '"a"' }] });
    await writeCheckpoint(path, checkpoint);
    expect(await readCheckpoint(path)).toEqual(checkpoint);
    expect(isCheckpointFor(checkpoint, { size: FILE_SIZE, mtimeMs: 1 })).toBe(true);
    expect(isCheckpointFor(checkpoint, { size: FILE_SIZE + 1, mtimeMs: 1 })).toBe(false);
    expect(isCheckpointFor(checkpoint, { size: FILE_SIZE, mtimeMs: 2 })).toBe(false);
    expect((await readFile(path, 'utf8')).endsWith('\n')).toBe(true);
  });

  it('are named after a hash of the path and readable by the owner only', async () => {
    const path = checkpointPath(checkpointDir, filePath);
    expect(path.replace(`${checkpointDir}/`, '')).toMatch(/^[0-9a-f]{32}-sample\.bin\.json$/);
    await writeCheckpoint(path, sampleCheckpoint());
    expect((await stat(path)).mode & 0o777).toBe(0o600);
  });

  it('read as null when missing, unreadable or of another shape', async () => {
    const path = checkpointPath(checkpointDir, filePath);
    expect(await readCheckpoint(path)).toBeNull();
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, 'not json');
    expect(await readCheckpoint(path)).toBeNull();
    await writeFile(path, JSON.stringify({ version: 2, vid: 'V' }));
    expect(await readCheckpoint(path)).toBeNull();
    await writeFile(path, JSON.stringify({ version: 1 }));
    expect(await readCheckpoint(path)).toBeNull();
  });

  it('can be removed without error when absent', async () => {
    await expect(removeCheckpoint(checkpointPath(checkpointDir, filePath))).resolves.toBeUndefined();
    expect(defaultCheckpointDir()).toContain('polyv-vod-upload');
  });
});
