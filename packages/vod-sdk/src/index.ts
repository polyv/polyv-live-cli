/**
 * PolyV VOD API SDK entry point.
 *
 * @example
 * ```ts
 * import { PolyVVodClient } from 'polyv-vod-api-sdk';
 *
 * const client = new PolyVVodClient({ userId, secretKey, writeToken });
 * const videos = await client.video.searchVideos({ pageSize: 10 });
 * const uploaded = await client.upload.uploadFile({ filePath: './intro.mp4' });
 * await client.video.waitUntilPublished(uploaded.vid);
 * ```
 */

export { VERSION } from './version.js';
export { PolyVVodClient } from './client.js';
export { PolyVVodError, isPolyVVodError } from './errors/index.js';
export type { PolyVVodErrorDetails, PolyVVodErrorKind } from './errors/index.js';
export {
  buildMd5SignString,
  buildSha1SignString,
  callbackSignCandidates,
  compactParams,
  createUploadSignature,
  signMd5,
  signSha1,
  verifyCallbackSignature
} from './auth/signature.js';
export type { CallbackSignInput, SignableParams, UploadSignature } from './auth/signature.js';
export {
  normalizeVids,
  parseSkippedVids,
  isVideoNotFound,
  VideoService
} from './services/video.service.js';
export { CategoryService } from './services/category.service.js';
export { UploadService } from './services/upload.service.js';
export { PlaySafeService } from './services/playsafe.service.js';
export { StatisticsService } from './services/statistics.service.js';
export { CallbackService } from './services/callback.service.js';
export { buildStringToSign, isCredentialsExpired, ObjectStorageClient } from './upload/object-storage.js';
export type {
  CompleteMultipartResult,
  ObjectStorageClientOptions,
  ObjectStorageCredentials,
  ObjectStorageKind,
  ObjectStoragePart
} from './upload/object-storage.js';
export { abortChunkedUpload, selectStorage, uploadFileChunked } from './upload/chunked-uploader.js';
export type { ChunkedUploadTokenResponse, StorageSelection } from './upload/chunked-uploader.js';
export { uploadFileDirect } from './upload/direct-uploader.js';
export type { DirectUploadOptions } from './upload/direct-uploader.js';
export { RateLimiter } from './utils/rate-limiter.js';
export * from './types/video.js';
export * from './types/category.js';
export * from './types/upload.js';
export * from './types/playsafe.js';
export type {
  PolyVVodClientConfig,
  RateLimitOptions,
  ResolvedVodClientConfig,
  VodAuth,
  VodHost,
  VodParamValue,
  VodParams,
  VodRequestInit
} from './types/client.js';
export { DEFAULT_BASE_URLS } from './types/client.js';
export * as generated from './types/generated/index.js';
