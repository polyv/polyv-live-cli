/**
 * Upload endpoints and both upload paths.
 *
 * @module services/upload
 */

import { stat } from 'node:fs/promises';

import { createUploadSignature, type UploadSignature } from '../auth/signature.js';
import type { PolyVVodClient } from '../client.js';
import { PolyVVodError } from '../errors/index.js';
import type { SyncTaskPage, UploadByUrlParams, UploadFileOptions, UploadFileResult } from '../types/upload.js';
import { DIRECT_UPLOAD_MAX_BYTES } from '../types/upload.js';
import { abortChunkedUpload, uploadFileChunked } from '../upload/chunked-uploader.js';
import { uploadFileDirect } from '../upload/direct-uploader.js';

export interface AbortUploadOptions {
  filePath: string;
  checkpointDir?: string;
  signal?: AbortSignal;
}

export class UploadService {
  constructor(private readonly client: PolyVVodClient) {}

  /**
   * Uploads a local file.
   *
   * `mode` picks the path: the direct upload is one request and stops at 2 GB; the chunked
   * upload rescales to any size and resumes after an interruption. `auto` (default) switches to
   * the chunked upload above 2 GB.
   *
   * @throws {PolyVVodError} `validation`, `auth`, `api`, `network` or `upload`
   */
  async uploadFile(options: UploadFileOptions): Promise<UploadFileResult> {
    const mode = options.mode ?? 'auto';
    if (mode === 'direct') return uploadFileDirect(this.client, options);
    if (mode === 'chunked') return uploadFileChunked(this.client, options);
    let size = 0;
    try {
      size = (await stat(options.filePath)).size;
    } catch {
      // The uploaders report an unreadable file with a proper error.
    }
    return size > DIRECT_UPLOAD_MAX_BYTES ? uploadFileChunked(this.client, options) : uploadFileDirect(this.client, options);
  }

  /** Discards an interrupted chunked upload. Resolves to false when there is nothing to abort. */
  abortChunkedUpload(options: AbortUploadOptions): Promise<boolean> {
    return abortChunkedUpload(this.client, options);
  }

  /**
   * Signature the browser upload SDK (`@polyv/vod-upload-js-sdk`) expects:
   * `videoUpload.updateUserData({ userid, ptime, sign, hash })`. Valid for 3 minutes.
   */
  createBrowserUploadSignature(): UploadSignature {
    const { secretKey, writeToken } = this.client.config;
    if (!writeToken) throw new PolyVVodError('auth', 'The upload signature needs writeToken');
    return createUploadSignature(secretKey, writeToken);
  }

  /**
   * Pulls videos from public URLs. The platform processes them asynchronously; results arrive
   * through the callback or show up in the sync tasks.
   */
  async uploadByUrl(params: UploadByUrlParams): Promise<unknown> {
    const infos = params.uploadInfos ?? [];
    const useInfos = infos.length > 0;
    if (!useInfos && !params.fileUrl) throw new PolyVVodError('validation', 'Pass uploadInfos or fileUrl');
    if (infos.length > 100) throw new PolyVVodError('validation', 'uploadInfos accepts at most 100 items');
    infos.forEach((item, index) => {
      const at = `uploadInfos[${index}]`;
      if (!/^https?:\/\//.test(item.fileUrl ?? '')) throw new PolyVVodError('validation', `${at}.fileUrl must be an http(s) URL`);
      if (item.fileUrl.length > 1000) throw new PolyVVodError('validation', `${at}.fileUrl must not exceed 1000 characters`);
      if (!item.title) throw new PolyVVodError('validation', `${at}.title is required`);
      if (item.title.length > 100) throw new PolyVVodError('validation', `${at}.title must not exceed 100 characters`);
      if (item.state && item.state.length > 100) throw new PolyVVodError('validation', `${at}.state must not exceed 100 characters`);
      if (item.tag && item.tag.length > 200) throw new PolyVVodError('validation', `${at}.tag must not exceed 200 characters`);
    });
    return this.client.request({
      method: 'POST',
      path: '/v2/video/grab/{userid}/upload/multi',
      params: {
        cataid: params.cataId,
        luping: params.luping === undefined ? undefined : params.luping ? 1 : 0,
        watermark: params.watermark,
        watermarkLocation: params.watermarkLocation,
        // The JSON array is signed as the raw string it is sent as.
        uploadInfos: useInfos ? JSON.stringify(infos) : undefined,
        fileUrl: useInfos ? undefined : params.fileUrl,
        title: useInfos ? undefined : params.title
      },
      idempotent: false
    });
  }

  /** URL-upload tasks, newest first. */
  listSyncTasks(params: { page?: number; pageSize?: number } = {}): Promise<SyncTaskPage> {
    return this.client.request({
      method: 'GET',
      path: '/v2/video/grab/{userid}/list',
      params: { page: params.page, pageSize: params.pageSize }
    });
  }

  /** CSV listing the videos of a task. */
  async exportSyncTask(taskId: string): Promise<string> {
    if (!taskId) throw new PolyVVodError('validation', 'taskId is required');
    return this.client.request({
      method: 'GET',
      path: '/v2/video/grab/{userid}/listVideos/export',
      params: { taskId },
      envelope: 'none'
    });
  }

  async deleteSyncTask(taskId: string): Promise<unknown> {
    if (!taskId) throw new PolyVVodError('validation', 'taskId is required');
    return this.client.request({
      method: 'POST',
      path: '/v2/video/grab/{userid}/delete',
      params: { taskId },
      idempotent: false
    });
  }
}
