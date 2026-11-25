/**
 * Minimal multipart client for the object storages behind the chunked upload (Huawei OBS and
 * Aliyun OSS), hand-signed so the SDK has no runtime dependency.
 *
 * Both storages use the same signature layout (verified against the live platform and the
 * official `esdk-obs-nodejs` / `ali-oss` sources):
 *
 * ```
 * METHOD\n Content-MD5\n Content-Type\n Date\n <sorted x-<vendor>-* headers> /bucket/object<sub-resources>
 * ```
 *
 * hashed with HMAC-SHA1 and sent as `Authorization: <VENDOR> accessKey:signature`. The temporary
 * session token travels in `x-<vendor>-security-token` and takes part in the signature.
 *
 * @module upload/object-storage
 */

import { createHash, createHmac } from 'node:crypto';

import { PolyVVodError } from '../errors/index.js';

export type ObjectStorageKind = 'obs' | 'oss';

/** Temporary credentials for one multipart upload. Valid for an hour. Never log them. */
export interface ObjectStorageCredentials {
  kind: ObjectStorageKind;
  accessKey: string;
  secretKey: string;
  sessionToken: string;
  bucket: string;
  /**
   * Origin requests are sent to. OBS requires the virtual-hosted form
   * `https://{bucket}.{endpoint}` and rejects path-style URLs; OSS uses the virtual-hosted host
   * the platform returns.
   */
  origin: string;
}

export interface ObjectStoragePart {
  partNumber: number;
  /** As returned by the storage, double quotes included. */
  etag: string;
}

export interface CompleteMultipartResult {
  /** 200: stored and the platform callback succeeded. 203: stored but the callback failed. */
  status: number;
  /** With a callback set, the callback server's response body. */
  body: string;
}

export interface ObjectStorageClientOptions {
  fetch?: typeof globalThis.fetch;
  timeout?: number;
  signal?: AbortSignal;
}

const EXPIRED_CREDENTIAL_CODES = new Set(['InvalidAccessKeyId', 'SecurityTokenExpired']);

/** Whether a storage error means the temporary credentials expired and must be refreshed. */
export function isCredentialsExpired(error: unknown): boolean {
  return error instanceof PolyVVodError && typeof error.code === 'string' && EXPIRED_CREDENTIAL_CODES.has(error.code);
}

export interface StringToSignInput {
  method: string;
  headers: Record<string, string>;
  vendor: 'obs' | 'oss';
  /** `/bucket/object` */
  resource: string;
  /** Only sub-resources take part. An empty value means the name is sent without `=`. */
  subResources: Record<string, string | undefined>;
}

/** Signature base shared by OBS and OSS. Sub-resource values are raw, never URL-encoded. */
export function buildStringToSign(input: StringToSignInput): string {
  const { method, headers, vendor, resource, subResources } = input;
  const vendorHeaders = Object.entries(headers)
    .filter(([name]) => name.toLowerCase().startsWith(`x-${vendor}-`))
    .map(([name, value]) => ({ name: name.toLowerCase(), value: value.trim() }))
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    .map(({ name, value }) => `${name}:${value}\n`)
    .join('');
  const header = (name: string): string => {
    const found = Object.entries(headers).find(([candidate]) => candidate.toLowerCase() === name);
    return found ? found[1] : '';
  };
  const canonicalQuery = Object.keys(subResources)
    .sort()
    .map((name) => (subResources[name] ? `${name}=${subResources[name]}` : name))
    .join('&');
  return `${method}\n${header('content-md5')}\n${header('content-type')}\n${header('date')}\n${vendorHeaders}${resource}${canonicalQuery ? `?${canonicalQuery}` : ''}`;
}

function md5Base64(data: Buffer): string {
  return createHash('md5').update(data).digest('base64');
}

function encodeKey(key: string): string {
  return key.split('/').map(encodeURIComponent).join('/');
}

/** Text content of the first `<tag>` element, with XML entities decoded. */
function xmlTag(xml: string, tag: string): string | undefined {
  const value = new RegExp(`<${tag}>([^<]*)</${tag}>`, 's').exec(xml)?.[1];
  return value?.replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}

function parseParts(xml: string): ObjectStoragePart[] {
  const parts: ObjectStoragePart[] = [];
  for (const match of xml.matchAll(/<Part>([\s\S]*?)<\/Part>/g)) {
    const partNumber = Number(xmlTag(match[1], 'PartNumber'));
    const etag = xmlTag(match[1], 'ETag');
    if (Number.isInteger(partNumber) && etag) parts.push({ partNumber, etag });
  }
  return parts;
}

export class ObjectStorageClient {
  constructor(
    readonly credentials: ObjectStorageCredentials,
    private readonly options: ObjectStorageClientOptions = {}
  ) {}

  /** Starts a multipart upload and returns its upload id. */
  async initiate(key: string): Promise<string> {
    const response = await this.request('POST', key, { uploads: '' }, { 'Content-Type': 'text/plain' });
    const uploadId = xmlTag(response.text, 'UploadId');
    if (response.status !== 200 || !uploadId) throw this.failure('initiate multipart upload', response);
    return uploadId;
  }

  async uploadPart(key: string, uploadId: string, partNumber: number, body: Buffer): Promise<string> {
    const response = await this.request(
      'PUT',
      key,
      { partNumber: String(partNumber), uploadId },
      { 'Content-Type': 'text/plain', 'Content-MD5': md5Base64(body) },
      body
    );
    if (response.status !== 200 || !response.etag) throw this.failure(`upload part ${partNumber}`, response);
    return response.etag;
  }

  /** Parts the storage already holds for this upload. */
  async listParts(key: string, uploadId: string): Promise<ObjectStoragePart[]> {
    const response = await this.request('GET', key, { uploadId });
    if (response.status !== 200) throw this.failure('list parts', response);
    return parseParts(response.text);
  }

  async complete(
    key: string,
    uploadId: string,
    parts: ObjectStoragePart[],
    callbackBase64: string
  ): Promise<CompleteMultipartResult> {
    const xml = `<CompleteMultipartUpload>${parts
      .map((part) => `<Part><PartNumber>${part.partNumber}</PartNumber><ETag>${part.etag}</ETag></Part>`)
      .join('')}</CompleteMultipartUpload>`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/xml',
      'Content-MD5': md5Base64(Buffer.from(xml)),
      // Tells the storage to notify the platform once the object is complete.
      [`x-${this.credentials.kind}-callback`]: callbackBase64
    };
    const response = await this.request('POST', key, { uploadId }, headers, Buffer.from(xml));
    return { status: response.status, body: response.text };
  }

  async abort(key: string, uploadId: string): Promise<void> {
    const response = await this.request('DELETE', key, { uploadId });
    if (response.status !== 204 && response.status !== 200 && response.status !== 404) {
      throw this.failure('abort multipart upload', response);
    }
  }

  private async request(
    method: string,
    key: string,
    subResources: Record<string, string | undefined>,
    headers: Record<string, string> = {},
    body?: Buffer
  ): Promise<{ status: number; text: string; etag: string }> {
    const { kind, bucket, origin, accessKey, secretKey, sessionToken } = this.credentials;
    const allHeaders: Record<string, string> = {
      [`x-${kind}-security-token`]: sessionToken,
      Date: new Date().toUTCString(),
      ...headers
    };
    const stringToSign = buildStringToSign({ method, headers: allHeaders, vendor: kind, resource: `/${bucket}/${key}`, subResources });
    const signature = createHmac('sha1', secretKey).update(stringToSign, 'utf8').digest('base64');
    const query = Object.keys(subResources)
      .sort()
      .map((name) => {
        const value = subResources[name];
        return value ? `${name}=${encodeURIComponent(value)}` : name;
      })
      .join('&');
    const url = `${origin}/${encodeKey(key)}${query ? `?${query}` : ''}`;
    let response: Response;
    try {
      response = await (this.options.fetch ?? globalThis.fetch)(url, {
        method,
        headers: { ...allHeaders, Authorization: `${kind.toUpperCase()} ${accessKey}:${signature}` },
        body,
        signal: this.options.signal
      });
    } catch (error) {
      const cancelled = this.options.signal?.aborted === true;
      throw new PolyVVodError('upload', cancelled ? 'Upload cancelled' : `Storage request failed: ${messageOf(error)}`, {
        cause: error,
        retryable: !cancelled
      });
    }
    return { status: response.status, text: await response.text(), etag: response.headers.get('etag') ?? '' };
  }

  private failure(what: string, response: { status: number; text: string }): PolyVVodError {
    return new PolyVVodError('upload', `${what} failed: HTTP ${response.status} ${xmlTag(response.text, 'Code') ?? ''} ${truncate(xmlTag(response.text, 'Message') ?? response.text)}`.trim(), {
      code: xmlTag(response.text, 'Code'),
      httpStatus: response.status,
      retryable: response.status === 429 || response.status >= 500
    });
  }
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function truncate(text: string, max = 200): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}
