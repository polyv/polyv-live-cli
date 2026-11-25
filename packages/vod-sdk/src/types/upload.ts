/**
 * Upload types.
 *
 * @module types/upload
 */

import type { ObjectStorageKind } from '../upload/object-storage.js';

/** The direct upload endpoint rejects larger files; use the chunked upload for them. */
export const DIRECT_UPLOAD_MAX_BYTES = 2 * 1024 * 1024 * 1024;

/** Default chunked-upload part size. The storage services accept 100 KB to 5 GB. */
export const DEFAULT_PART_SIZE = 5 * 1024 * 1024;
export const MIN_PART_SIZE = 100 * 1024;

export type UploadMode = 'auto' | 'direct' | 'chunked';

/**
 * Which storage a chunked upload goes through. `auto` (default) follows what the platform
 * issued: Huawei OBS when it hands out OBS credentials, otherwise Aliyun OSS.
 */
export type StoragePreference = 'auto' | 'obs' | 'oss';

/** Metadata both upload paths accept. */
export interface UploadFileOptions {
  filePath: string;
  /** Default: the file name without its extension. */
  title?: string;
  description?: string;
  tag?: string;
  cataId?: string | number;
  /** Screen-recording optimisation (录屏优化). Default false. */
  luping?: boolean;
  /** Play the source file instead of a transcoded one. Default false. */
  keepSource?: boolean;
  /** Passed back in the upload callback. Max 100 characters for URL uploads. */
  state?: string;
  watermark?: string;
  watermarkLocation?: 1 | 2 | 3 | 4;
  /**
   * `auto` (default) uses the direct upload up to 2 GB and the chunked upload above that.
   * `chunked` gives resumable uploads for any size.
   */
  mode?: UploadMode;
  /** Chunked upload only. */
  partSize?: number;
  /** Chunked upload only. Parallel part uploads. Default 3. */
  concurrency?: number;
  /** Chunked upload only. Where resume state is kept. Default: the OS temp dir. */
  checkpointDir?: string;
  /** Chunked upload only. Continue from a saved checkpoint for this file. Default true. */
  resume?: boolean;
  /** Chunked upload only. Which storage to upload through. Default `auto`. */
  storage?: StoragePreference;
  onProgress?: (progress: UploadProgress) => void;
  signal?: AbortSignal;
  /** Overrides the HTTP implementation used for storage requests. Intended for tests. */
  storageFetch?: typeof globalThis.fetch;
}

export interface UploadProgress {
  uploadedBytes: number;
  totalBytes: number;
  /** Number of parts stored so far; 0 for the direct upload before it starts. */
  uploadedParts?: number;
  totalParts?: number;
}

export interface UploadFileResult {
  vid: string;
  mode: 'direct' | 'chunked';
  title?: string;
  /** Status right after the upload. The direct upload returns it; the chunked upload reports `6`. */
  status?: number;
  resumed: boolean;
  parts?: number;
}

export interface UploadByUrlItem {
  fileUrl: string;
  /** Max 100 characters. */
  title: string;
  /** Max 100 characters. */
  state?: string;
  /** Max 200 characters; longer values are truncated. */
  tag?: string;
}

export interface UploadByUrlParams {
  /** Up to 100 items. Takes precedence over the legacy `fileUrl` + `title` pair. */
  uploadInfos?: UploadByUrlItem[];
  /** Legacy form: several URLs comma-separated, paired with `title`. */
  fileUrl?: string;
  title?: string;
  cataId?: string | number;
  luping?: boolean;
  watermark?: string;
  watermarkLocation?: 1 | 2 | 3 | 4;
}

export interface SyncTask {
  taskid: string;
  userid?: string;
  originalname?: string;
  fileurl?: string;
  classifyid?: number;
  classifyname?: string;
  seccesscount?: number;
  totalcount?: number;
  failcount?: number;
  /** `Y` when the task is running, `N` when it is paused. */
  status?: string;
  /** Whether the platform is still fetching (`SYNCHRONIZING`) or is done (`FINISHED`). Observed on the platform; not in the public docs. */
  taskstatus?: string;
  /** 13-digit timestamps. */
  createtime?: number;
  endtime?: number;
}

export interface SyncTaskPage {
  pageNumber: number;
  totalItems: number;
  totalPages: number;
  contents: SyncTask[];
}

/** Temporary credentials for one storage; valid for an hour. Never log them. */
export interface HuaweiObsInfo {
  bucketName: string;
  expires: string;
  endpoint: string;
  callbackBodyType: string;
  securitytoken: string;
  sk: string;
  ak: string;
  callbackUrl: string;
  isCname: boolean;
  dir: string;
  callbackBody: string;
}

/**
 * Response of the chunked-upload `init` call.
 *
 * It is a flat object that carries temporary storage credentials for **both** storages,
 * so treat it as a secret: never log or print it.
 */
export interface ChunkedUploadInitResponse {
  vid: string;
  remainSpace?: number;
  bucketName?: string;
  /** Credentials validity in seconds. */
  validityTime?: number;
  /** Base64 callback policy for Aliyun OSS (`x-oss-callback`). */
  encodedCallback?: string;
  Expiration?: string;
  /** Present when the account can upload to Huawei OBS. */
  hwObsInfo?: HuaweiObsInfo;
  dir?: string;
  accessId?: string;
  accessKey?: string;
  endpoint?: string;
  domain?: string;
  host?: string;
  /** `hw` for Huawei OBS. */
  storageType?: string;
  /** Which storage handles uploads for this account. */
  storage: ObjectStorageKind;
}
