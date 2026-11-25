/**
 * Chunked (resumable) upload.
 *
 * The protocol is not part of the public API docs; it follows the official Java SDK
 * (`net.polyv.vod.v1.upload`) and was verified against the live platform:
 *
 * 1. `POST /v2/uploadvideo/{userid}/init` reserves a vid and returns temporary storage
 *    credentials plus the callback policy.
 * 2. The file is uploaded as a multipart upload to Huawei OBS or Aliyun OSS.
 * 3. The complete request carries the callback, through which the storage notifies the
 *    platform. The video record appears immediately with status 6.
 *
 * @module upload/chunked-uploader
 */

import { open, type FileHandle } from 'node:fs/promises';
import { basename, extname, resolve } from 'node:path';

import type { PolyVVodClient } from '../client.js';
import { PolyVVodError } from '../errors/index.js';
import type {
  ChunkedUploadInitResponse,
  StoragePreference,
  UploadFileOptions,
  UploadFileResult
} from '../types/upload.js';
import { DEFAULT_PART_SIZE, MIN_PART_SIZE } from '../types/upload.js';
import { fileStats } from '../utils/file.js';
import {
  checkpointPath,
  defaultCheckpointDir,
  isCheckpointFor,
  readCheckpoint,
  removeCheckpoint,
  writeCheckpoint,
  type UploadCheckpoint
} from './checkpoint.js';
import {
  ObjectStorageClient,
  isCredentialsExpired,
  type ObjectStorageCredentials,
  type ObjectStoragePart
} from './object-storage.js';

export const CHUNKED_INIT_PATH = '/v2/uploadvideo/{userid}/init';
export const CHUNKED_TOKEN_PATH = '/v2/uploadvideo/{userid}/token';
/** Marker the platform uses to tell a new chunked upload from a resume. */
export const CHUNKED_UPLOAD_TYPE = 'java_sdk_chunk_v1';
const MAX_PART_SIZE = 5 * 1024 * 1024 * 1024;
const DEFAULT_CONCURRENCY = 3;

/** Response of the token call: fresh storage credentials, laid out like the init response minus the vid. */
export interface ChunkedUploadTokenResponse {
  accessId?: string;
  accessKey?: string;
  token?: string;
  host?: string;
  bucketName?: string;
  dir?: string;
  endpoint?: string;
  domain?: string;
  validityTime?: number;
  Expiration?: string;
  hwObsInfo?: ChunkedUploadInitResponse['hwObsInfo'];
  storageType?: string;
}

export interface StorageSelection {
  credentials: ObjectStorageCredentials;
  /** Base64 callback policy sent on the complete request. */
  callback: string;
  /** Object-key prefix issued by the platform. */
  dir: string;
}

/** What picking the storage reads: the credentials the platform issued for either storage. */
type StorageSource = ChunkedUploadTokenResponse & Pick<ChunkedUploadInitResponse, 'encodedCallback'>;

/**
 * Picks the storage for the upload. Following the Java SDK, `auto` uses Huawei OBS whenever the
 * platform issues OBS credentials; otherwise Aliyun OSS.
 */
export function selectStorage(source: StorageSource, preference: StoragePreference = 'auto'): StorageSelection {
  const useObs = preference === 'obs' || (preference === 'auto' && !!source.hwObsInfo);
  if (useObs) {
    const obs = source.hwObsInfo;
    if (!obs) {
      throw new PolyVVodError('upload', 'Huawei OBS was requested but the platform issued no OBS credentials');
    }
    return {
      credentials: {
        kind: 'obs',
        accessKey: obs.ak,
        secretKey: obs.sk,
        sessionToken: obs.securitytoken,
        bucket: obs.bucketName,
        origin: `https://${obs.bucketName}.${obs.endpoint}`
      },
      callback: Buffer.from(
        JSON.stringify({ callbackUrl: obs.callbackUrl, callbackBody: obs.callbackBody, callbackBodyType: obs.callbackBodyType })
      ).toString('base64'),
      dir: obs.dir
    };
  }
  const { accessId, accessKey, token, host, bucketName, dir, encodedCallback } = source;
  if (!accessId || !accessKey || !token || !host || !bucketName || !dir || !encodedCallback) {
    throw new PolyVVodError('upload', 'Aliyun OSS was requested but the platform issued no complete OSS credentials');
  }
  return {
    credentials: {
      kind: 'oss',
      accessKey: accessId,
      secretKey: accessKey,
      sessionToken: token,
      bucket: bucketName,
      origin: host.replace(/^http:/i, 'https:')
    },
    callback: encodedCallback,
    dir
  };
}

export function normalizePartSize(partSize?: number): number {
  if (partSize === undefined) return DEFAULT_PART_SIZE;
  if (!Number.isInteger(partSize) || partSize <= 0) {
    throw new PolyVVodError('validation', 'partSize must be a positive integer');
  }
  if (partSize > MAX_PART_SIZE) {
    throw new PolyVVodError('validation', `partSize must not exceed ${MAX_PART_SIZE} bytes`);
  }
  return Math.max(partSize, MIN_PART_SIZE);
}

/**
 * Uploads a local file through the resumable protocol.
 *
 * An interrupted upload leaves a checkpoint in the checkpoint directory; calling this again
 * with the same file continues from the parts the storage already holds.
 *
 * @throws {PolyVVodError} `validation`, `auth`, `api`, `network` or `upload`
 */
export async function uploadFileChunked(client: PolyVVodClient, options: UploadFileOptions): Promise<UploadFileResult> {
  const filePath = resolve(options.filePath);
  const file = await fileStats(filePath);
  if (!file.isFile()) throw new PolyVVodError('validation', `Not a file: ${filePath}`);
  if (file.size === 0) throw new PolyVVodError('validation', `File is empty: ${filePath}`);
  const partSize = normalizePartSize(options.partSize);
  const partCount = Math.ceil(file.size / partSize);
  const concurrency = Math.min(Math.max(Math.trunc(options.concurrency ?? DEFAULT_CONCURRENCY), 1), partCount);
  const title = options.title ?? basename(filePath, extname(filePath));
  const signal = options.signal;
  signal?.throwIfAborted();

  const checkpointFile = checkpointPath(options.checkpointDir ?? defaultCheckpointDir(), filePath);
  let saved = options.resume === false ? null : await readCheckpoint(checkpointFile);
  if (saved && !isCheckpointFor(saved, file)) {
    saved = null;
    await removeCheckpoint(checkpointFile);
  }
  // A resumed upload finishes the video the earlier run reserved, so it keeps that run's title,
  // and with it the description, category and tags fixed at the time.
  const keptTitle = saved?.title ?? title;

  // 1) Reserve a vid, or re-attach to the one an earlier run reserved.
  const init = await client.request<ChunkedUploadInitResponse>({
    method: 'POST',
    path: CHUNKED_INIT_PATH,
    params: saved
      ? { title: keptTitle, filesize: file.size, vid: saved.vid, autoid: 0, uploadType: CHUNKED_UPLOAD_TYPE }
      : {
          title,
          describ: options.description,
          cataid: options.cataId,
          tag: options.tag,
          luping: options.luping ? 1 : 0,
          filesize: file.size,
          keepsource: options.keepSource ? 1 : 0,
          extra: JSON.stringify({ watermarkLocation: options.watermarkLocation ?? '', watermark: options.watermark ?? '' }),
          autoid: 1,
          uploadType: CHUNKED_UPLOAD_TYPE,
          state: options.state
        },
    idempotent: false,
    signal
  });
  const vid = init?.vid;
  if (!vid) throw new PolyVVodError('upload', 'The platform did not reserve a vid for the upload');

  let selection = selectStorage(init, options.storage);
  const extension = extname(filePath).replace(/^\./, '').toLowerCase();
  const key = `${selection.dir}${vid}.${extension || 'mp4'}`;
  const storageOptions = { fetch: options.storageFetch, signal };
  let storage = new ObjectStorageClient(selection.credentials, storageOptions);
  const uploadId = saved?.uploadId ?? (await storage.initiate(key));

  const checkpoint: UploadCheckpoint = {
    version: 1,
    vid,
    title: keptTitle,
    key,
    storage: selection.credentials.kind,
    uploadId,
    fileSize: file.size,
    fileModifiedMs: file.mtimeMs,
    partSize,
    createdAt: saved?.createdAt ?? Date.now(),
    parts: []
  };
  await writeCheckpoint(checkpointFile, checkpoint);

  // A storage call that hits expired credentials re-issues them once and retries.
  const guarded = async <T>(operation: (current: ObjectStorageClient) => Promise<T>): Promise<T> => {
    try {
      return await operation(storage);
    } catch (error) {
      if (!isCredentialsExpired(error)) throw error;
      const token = await client.request<ChunkedUploadTokenResponse>({ method: 'GET', path: CHUNKED_TOKEN_PATH, signal });
      selection = selectStorage({ ...init, ...token }, selection.credentials.kind);
      storage = new ObjectStorageClient(selection.credentials, storageOptions);
      return operation(storage);
    }
  };

  const partBytes = (partNumber: number): number => Math.min(partSize, file.size - (partNumber - 1) * partSize);
  const report = (stored: ReadonlyMap<number, string>): void => {
    if (!options.onProgress) return;
    let uploadedBytes = 0;
    for (const partNumber of stored.keys()) uploadedBytes += partBytes(partNumber);
    options.onProgress({ uploadedBytes, totalBytes: file.size, uploadedParts: stored.size, totalParts: partCount });
  };

  // 2) Reconcile with the parts the storage already holds, then upload the missing ones.
  const stored = new Map<number, string>();
  for (const part of await guarded((current) => current.listParts(key, uploadId))) {
    stored.set(part.partNumber, part.etag);
  }
  report(stored);

  const pending: number[] = [];
  for (let partNumber = 1; partNumber <= partCount; partNumber += 1) {
    if (!stored.has(partNumber)) pending.push(partNumber);
  }
  const handle = await open(filePath, 'r');
  // Parallel runners record their parts one after another, so the file always moves forward.
  let persisting: Promise<void> = Promise.resolve();
  const persist = (): Promise<void> => {
    persisting = persisting.then(() => writeCheckpoint(checkpointFile, checkpoint));
    return persisting;
  };
  try {
    let stopped = false;
    let next = 0;
    const runner = async (): Promise<void> => {
      while (!stopped && next < pending.length) {
        const partNumber = pending[next];
        next += 1;
        try {
          signal?.throwIfAborted();
          const body = await readPart(handle, partNumber, file.size, partSize);
          const etag = await guarded((current) => current.uploadPart(key, uploadId, partNumber, body));
          stored.set(partNumber, etag);
          checkpoint.parts = sortedParts(stored);
          await persist();
          report(stored);
        } catch (error) {
          // Let the other runners finish their in-flight part, then stop picking up new ones.
          stopped = true;
          throw error;
        }
      }
    };
    const outcome = await Promise.allSettled(Array.from({ length: Math.min(concurrency, pending.length) }, runner));
    const failure = outcome.find((item): item is PromiseRejectedResult => item.status === 'rejected');
    if (failure) throw failure.reason;
  } finally {
    await handle.close();
  }

  // 3) Complete with the platform callback. Anything but 200 means the platform was not told.
  const completed = await guarded((current) => current.complete(key, uploadId, sortedParts(stored), selection.callback));
  if (completed.status !== 200) {
    throw new PolyVVodError('upload', `The file reached the storage but the platform callback failed (HTTP ${completed.status}): ${completed.body.slice(0, 200)}`, {
      httpStatus: completed.status
    });
  }
  await removeCheckpoint(checkpointFile);
  options.onProgress?.({ uploadedBytes: file.size, totalBytes: file.size, uploadedParts: partCount, totalParts: partCount });

  return { vid, mode: 'chunked', title: keptTitle, status: 6, resumed: saved !== null, parts: partCount };
}

/**
 * Aborts an interrupted upload: discards the stored parts and the checkpoint.
 * Resolves to false when there is nothing to abort.
 */
export async function abortChunkedUpload(
  client: PolyVVodClient,
  options: { filePath: string; checkpointDir?: string; storageFetch?: typeof globalThis.fetch; signal?: AbortSignal }
): Promise<boolean> {
  const filePath = resolve(options.filePath);
  const checkpointFile = checkpointPath(options.checkpointDir ?? defaultCheckpointDir(), filePath);
  const saved = await readCheckpoint(checkpointFile);
  if (!saved) return false;
  const init = await client.request<ChunkedUploadInitResponse>({
    method: 'POST',
    path: CHUNKED_INIT_PATH,
    params: { title: saved.title ?? 'abort', filesize: saved.fileSize, vid: saved.vid, autoid: 0, uploadType: CHUNKED_UPLOAD_TYPE },
    idempotent: false,
    signal: options.signal
  });
  const selection = selectStorage(init, saved.storage);
  await new ObjectStorageClient(selection.credentials, { fetch: options.storageFetch, signal: options.signal }).abort(saved.key, saved.uploadId);
  await removeCheckpoint(checkpointFile);
  return true;
}

function sortedParts(stored: ReadonlyMap<number, string>): ObjectStoragePart[] {
  return [...stored.entries()]
    .sort(([a], [b]) => a - b)
    .map(([partNumber, etag]) => ({ partNumber, etag }));
}

async function readPart(handle: FileHandle, partNumber: number, fileSize: number, partSize: number): Promise<Buffer> {
  const offset = (partNumber - 1) * partSize;
  const length = Math.min(partSize, fileSize - offset);
  const buffer = Buffer.allocUnsafe(length);
  let read = 0;
  while (read < length) {
    const { bytesRead } = await handle.read(buffer, read, length - read, offset + read);
    if (bytesRead === 0) throw new PolyVVodError('upload', `Unexpected end of file while reading part ${partNumber}`);
    read += bytesRead;
  }
  return buffer;
}
