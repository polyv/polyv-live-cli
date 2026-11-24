/**
 * PolyV VOD signature schemes.
 *
 * Rules were verified against the live API and cross-checked with the official Java SDK
 * (`VodSignUtil`, `VodBaseService`):
 *
 * - SHA1 (most endpoints): params sorted by key as `k=v&k=v`, `secretkey` appended, SHA1 upper.
 * - MD5 (play token, sub-account, V4): params sorted by key concatenated as key + value,
 *   `secretkey` on both ends, MD5 upper.
 * - Upload signature (for the browser upload SDK): lowercase `md5(secretkey + ptime)` and
 *   `md5(ptime + writetoken)`.
 *
 * Values always take part in their raw form (never URL-encoded).
 *
 * @module auth/signature
 */

import { createHash } from 'node:crypto';

export type SignableParams = Record<string, unknown>;

/** Drops `undefined`, `null` and empty-string values and stringifies the rest. */
export function compactParams(params: SignableParams): Record<string, string> {
  const compacted: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    compacted[key] = String(value);
  }
  return compacted;
}

function sha1Hex(text: string): string {
  return createHash('sha1').update(text, 'utf8').digest('hex');
}

function md5Hex(text: string): string {
  return createHash('md5').update(text, 'utf8').digest('hex');
}

/** Plain string that the SHA1 scheme hashes: sorted `k=v` pairs joined by `&`, then `secretkey`. */
export function buildSha1SignString(params: SignableParams, secretKey: string): string {
  const compacted = compactParams(params);
  const query = Object.keys(compacted)
    .sort()
    .map((key) => `${key}=${compacted[key]}`)
    .join('&');
  return query + secretKey;
}

/** Uppercase SHA1 signature used by most VOD endpoints. */
export function signSha1(params: SignableParams, secretKey: string): string {
  return sha1Hex(buildSha1SignString(params, secretKey)).toUpperCase();
}

/** Plain string that the MD5 scheme hashes: sorted key + value pairs, `secretkey` on both ends. */
export function buildMd5SignString(params: SignableParams, secretKey: string): string {
  const compacted = compactParams(params);
  const joined = Object.keys(compacted)
    .sort()
    .map((key) => `${key}${compacted[key]}`)
    .join('');
  return secretKey + joined + secretKey;
}

/** Uppercase MD5 signature used by the play-token, sub-account and V4 endpoints. */
export function signMd5(params: SignableParams, secretKey: string): string {
  return md5Hex(buildMd5SignString(params, secretKey)).toUpperCase();
}

export interface UploadSignature {
  /** Millisecond timestamp the signature was issued at; valid for 3 minutes. */
  ptime: number;
  /** Lowercase `md5(secretkey + ptime)`. */
  sign: string;
  /** Lowercase `md5(ptime + writetoken)`. */
  hash: string;
}

/**
 * Signature the browser upload SDK (`@polyv/vod-upload-js-sdk`) expects from your server:
 * `videoUpload.updateUserData({ userid, ptime, sign, hash })`. Refresh it every 3 minutes.
 *
 * `ptime` is in **milliseconds**.
 */
export function createUploadSignature(
  secretKey: string,
  writeToken: string,
  ptime: number = Date.now()
): UploadSignature {
  return {
    ptime,
    sign: md5Hex(`${secretKey}${ptime}`),
    hash: md5Hex(`${ptime}${writeToken}`),
  };
}

/** The fields a callback carries that take part in its signature. */
export interface CallbackSignInput {
  /** Value of the `sign` query parameter that came with the callback. */
  sign: string;
  /** `type` from the callback (upload / encode / encode_failed / pass / nopass / ...). */
  type?: string;
  /** `eventType` from the callback body (used by the JSON-body events). */
  eventType?: string;
  /** Video id, named `vid` or `mediaId` depending on the event. */
  vid?: string;
  /** Transcoded format, e.g. mp4. */
  format?: string;
  /** Clearness index of the transcoded file. */
  df?: string | number;
  /** Source URL of a failed async upload. */
  fileUrl?: string;
}

/**
 * Every plain string whose MD5 could be the callback's `sign`, following
 * `docs/vod/api/callBack.md`. Callback signatures are lowercase MD5.
 */
export function callbackSignCandidates(input: CallbackSignInput, secretKey: string): string[] {
  const { type, eventType, vid, format, df, fileUrl } = input;
  const candidates: string[] = [];
  if (type === 'upload' && vid) candidates.push(`upload${vid}${secretKey}`);
  if (type && fileUrl) candidates.push(`${type}${fileUrl}${secretKey}`);
  if (type && format && vid && df !== undefined && df !== null && df !== '') {
    candidates.push(`${type}${format}${vid}${df}${secretKey}`);
  }
  if (type && vid) candidates.push(`${type}${vid}${secretKey}`);
  if (eventType && vid) candidates.push(`${eventType}${vid}${secretKey}`);
  if (type && vid) candidates.push(`manage${type}${vid}${secretKey}`);
  if (eventType) candidates.push(`${eventType}${secretKey}`);
  return candidates;
}

/** Whether a callback's `sign` is valid for the given `secretkey`. */
export function verifyCallbackSignature(input: CallbackSignInput, secretKey: string): boolean {
  if (!input.sign) return false;
  const expected = input.sign.toLowerCase();
  return callbackSignCandidates(input, secretKey).some((plain) => md5Hex(plain) === expected);
}
