/**
 * Direct upload: one multipart POST authenticated with `writetoken`.
 *
 * Documented at `docs/vod/api/video_upload/upload_video.md`. The file streams from disk, so
 * memory use does not grow with the file. The endpoint caps files at 2 GB; larger files go
 * through the chunked upload.
 *
 * @module upload/direct-uploader
 */

import { randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { basename, extname } from 'node:path';
import { Readable } from 'node:stream';

import type { PolyVVodClient } from '../client.js';
import { PolyVVodError } from '../errors/index.js';
import type { UploadFileResult, UploadProgress } from '../types/upload.js';
import { DIRECT_UPLOAD_MAX_BYTES } from '../types/upload.js';
import { fileStats } from '../utils/file.js';

export const DIRECT_UPLOAD_PATH = '/uc/services/rest?method=uploadfile';

/** Error codes the direct upload endpoint answers with. */
export const DIRECT_UPLOAD_ERRORS: Readonly<Record<string, string>> = {
  '1': 'No user is linked to this writetoken',
  '2': 'The file or the writetoken is empty',
  '3': 'The JSONRPC parameter is missing',
  '4': 'The file type is not supported, or the file is larger than 2 GB',
  '14': 'The file MD5 does not match',
  '15': 'The platform failed to process the upload',
  '16': 'The account has no storage space left'
};

export interface DirectUploadOptions {
  filePath: string;
  /** Default: the file name without its extension. */
  title?: string;
  description?: string;
  tag?: string;
  cataId?: string | number;
  /** Screen-recording optimisation (录屏优化). */
  luping?: boolean;
  /** Passed back in the upload callback. */
  state?: string;
  watermark?: string;
  watermarkLocation?: 1 | 2 | 3 | 4;
  /** Uppercase MD5 of the file. When given, the platform verifies the upload against it. */
  fileMd5?: string;
  /** Charset of the file name; `ISO-8859-1` avoids garbled non-ASCII names. */
  fcharset?: string;
  onProgress?: (progress: UploadProgress) => void;
  signal?: AbortSignal;
}

interface UploadedVideo {
  vid: string;
  title?: string;
  duration?: string;
  status?: number | string;
  [key: string]: unknown;
}

interface MultipartPart {
  name: string;
  value?: string;
  filename?: string;
  contentType?: string;
  stream?: Readable;
}

/** Builds the multipart body as a stream so the file is never held in memory as a whole. */
export function multipartStream(parts: MultipartPart[], boundary: string, onBytes: (count: number) => void): Readable {
  async function* body(): AsyncGenerator<Buffer> {
    for (const part of parts) {
      let header = `--${boundary}\r\nContent-Disposition: form-data; name="${part.name}"`;
      if (part.filename !== undefined) header += `; filename="${part.filename.replace(/["\r\n]/g, '_')}"`;
      header += '\r\n';
      if (part.contentType) header += `Content-Type: ${part.contentType}\r\n`;
      header += '\r\n';
      yield Buffer.from(header, 'utf8');
      if (part.value !== undefined) yield Buffer.from(part.value, 'utf8');
      if (part.stream) {
        for await (const chunk of part.stream) {
          const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as Uint8Array);
          onBytes(buffer.length);
          yield buffer;
        }
      }
      yield Buffer.from('\r\n');
    }
    yield Buffer.from(`--${boundary}--\r\n`);
  }
  return Readable.from(body(), { objectMode: false });
}

/**
 * Uploads a local file of up to 2 GB in a single request.
 *
 * @throws {PolyVVodError} `validation`, `auth` or `upload`
 */
export async function uploadFileDirect(client: PolyVVodClient, options: DirectUploadOptions): Promise<UploadFileResult> {
  const { writeToken, baseUrls, headers, userAgent, fetch } = client.config;
  if (!writeToken) throw new PolyVVodError('auth', 'The direct upload needs writeToken');
  const file = await fileStats(options.filePath);
  if (!file.isFile()) throw new PolyVVodError('validation', `Not a file: ${options.filePath}`);
  if (file.size === 0) throw new PolyVVodError('validation', `File is empty: ${options.filePath}`);
  if (file.size > DIRECT_UPLOAD_MAX_BYTES) {
    throw new PolyVVodError('validation', `The direct upload supports files up to 2 GB; this file is ${file.size} bytes. Use the chunked upload instead.`);
  }
  const signal = options.signal;
  signal?.throwIfAborted();

  const fileName = basename(options.filePath);
  const title = options.title ?? basename(fileName, extname(fileName));
  const metadata: Record<string, string> = { title };
  if (options.tag) metadata.tag = options.tag;
  if (options.description) metadata.desc = options.description;
  const field = (name: string, value: string | number | undefined): MultipartPart[] =>
    value === undefined ? [] : [{ name, value: String(value) }];

  const parts: MultipartPart[] = [
    { name: 'writetoken', value: writeToken },
    { name: 'JSONRPC', value: JSON.stringify(metadata) },
    { name: 'format', value: 'json' },
    ...field('cataid', options.cataId),
    ...field('luping', options.luping ? 1 : undefined),
    ...field('fileMd5', options.fileMd5?.toUpperCase()),
    ...field('state', options.state),
    ...field('watermark', options.watermark),
    ...field('watermarkLocation', options.watermarkLocation),
    ...field('fcharset', options.fcharset),
    { name: 'Filedata', filename: fileName, contentType: 'application/octet-stream', stream: createReadStream(options.filePath) }
  ];
  const boundary = `----polyv-vod-sdk-${randomUUID()}`;
  let uploadedBytes = 0;
  const body = multipartStream(parts, boundary, (count) => {
    uploadedBytes += count;
    options.onProgress?.({ uploadedBytes, totalBytes: file.size });
  });

  let response: Response;
  try {
    response = await fetch(`${baseUrls.upload}${DIRECT_UPLOAD_PATH}`, {
      method: 'POST',
      headers: {
        'user-agent': userAgent,
        ...headers,
        'content-type': `multipart/form-data; boundary=${boundary}`
      },
      body,
      // Node requires `duplex: 'half'` whenever the request body is a stream.
      ...{ duplex: 'half' },
      signal
    });
  } catch (error) {
    body.destroy();
    if (signal?.aborted) throw new PolyVVodError('upload', 'Upload cancelled', { cause: error });
    throw new PolyVVodError('upload', `Upload failed: ${messageOf(error)}`, { cause: error, retryable: true });
  }

  const text = await response.text();
  const parsed = parseJson(text) as { error?: unknown; data?: unknown } | null;
  const item = Array.isArray(parsed?.data) ? (parsed.data[0] as UploadedVideo | undefined) : undefined;
  const code = parsed?.error;
  if (!response.ok || String(code) !== '0' || !item?.vid) {
    throw new PolyVVodError('upload', `Direct upload failed: ${DIRECT_UPLOAD_ERRORS[String(code)] ?? `HTTP ${response.status}`}`, {
      code: code === undefined || code === null ? response.status : String(code),
      httpStatus: response.status,
      data: parsed?.data
    });
  }
  const status = Number(item.status);
  return { vid: item.vid, mode: 'direct', title: item.title ?? title, status: Number.isFinite(status) ? status : undefined, resumed: false };
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
