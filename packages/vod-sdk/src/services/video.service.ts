/**
 * Video endpoints: search, info, update, delete, recover, move, ban, and waiting for transcoding.
 *
 * @module services/video
 */

import { setTimeout as sleep } from 'node:timers/promises';

import type { PolyVVodClient } from '../client.js';
import { PolyVVodError, isPolyVVodError } from '../errors/index.js';
import type {
  DeleteVideosOptions,
  DeleteVideosResult,
  DurationAndSizeItem,
  DurationAndSizeParams,
  MoveVideosParams,
  SearchVideosParams,
  SearchVideosResult,
  SetForbiddenParams,
  UpdateVideoInfoParams,
  VideoInfoItem,
  WaitOptions,
  WaitResult
} from '../types/video.js';
import { isPublished, isTerminalFailure } from '../types/video.js';

const VIDEO_PATH = '/v2/video/{userid}';

/** Per-endpoint signing exceptions; the public docs describe them differently, the Java SDK is right. */
const SIGN_USERID_VIDS_CATAID = { scheme: 'sha1', keys: ['userid', 'vids', 'cataid', 'ptime'] } as const;

export function normalizeVids(vids: string | string[], max: number, what = 'vids'): string {
  const list = (Array.isArray(vids) ? vids : String(vids ?? '').split(',')).map((vid) => vid.trim()).filter(Boolean);
  if (list.length === 0) throw new PolyVVodError('validation', `${what} must contain at least one video id`);
  if (list.length > max) throw new PolyVVodError('validation', `${what} accepts at most ${max} video ids, got ${list.length}`);
  return list.join(',');
}

/** Vids listed in the `data` of a delete that skipped them. */
export function parseSkippedVids(data: unknown): string[] {
  if (data === undefined || data === null || data === '') return [];
  const items = Array.isArray(data) ? data : String(data).split(/[,\s]+/);
  return items.map((item) => (typeof item === 'object' && item !== null ? String((item as { vid?: unknown }).vid ?? '') : String(item))).filter(Boolean);
}

/** Whether the platform answered that the video does not exist. */
export function isVideoNotFound(error: unknown): boolean {
  return isPolyVVodError(error) && error.kind === 'api' && error.code === 400 && /找不到视频|not exist|not found/i.test(error.message);
}

export class VideoService {
  constructor(private readonly client: PolyVVodClient) {}

  searchVideos(params: SearchVideosParams = {}): Promise<SearchVideosResult> {
    return this.client.request({
      method: 'GET',
      path: '/v2/video/search-videos',
      params: {
        filters: Array.isArray(params.filters) ? params.filters.join(',') : params.filters,
        cateId: params.cataId,
        title: params.title,
        tag: params.tag,
        uploader: params.uploader,
        status: params.status,
        containSubCate: params.containSubCate === undefined ? undefined : String(params.containSubCate),
        startTime: params.startTime,
        endTime: params.endTime,
        startModifyTime: params.startModifyTime,
        endModifyTime: params.endModifyTime,
        encrypted: params.encrypted === undefined ? undefined : String(params.encrypted),
        playAuthEnable: params.playAuthEnable === undefined ? undefined : String(params.playAuthEnable),
        sort: params.sort,
        page: params.page,
        pageSize: params.pageSize
      }
    });
  }

  /** Details of up to 100 videos. */
  async getVideoInfo(vids: string | string[]): Promise<VideoInfoItem[]> {
    return this.client.request({
      method: 'GET',
      path: `${VIDEO_PATH}/get-video-info`,
      params: { vid: normalizeVids(vids, 100) }
    });
  }

  async getVideo(vid: string): Promise<VideoInfoItem | undefined> {
    if (!vid) throw new PolyVVodError('validation', 'vid is required');
    const items = await this.getVideoInfo(vid);
    return items?.[0];
  }

  async updateVideoInfo(params: UpdateVideoInfoParams): Promise<unknown> {
    if (!params.vid) throw new PolyVVodError('validation', 'vid is required');
    return this.client.request({
      method: 'POST',
      path: `${VIDEO_PATH}/video-info`,
      params: { vid: params.vid, title: params.title, describ: params.description, tag: params.tag, publishUrl: params.publishUrl },
      idempotent: false
    });
  }

  /**
   * Deletes up to 500 videos.
   *
   * A `200` does not mean every video is gone: vids the platform skipped are listed in
   * `skipped`. A video that was just uploaded may be skipped while it is still being processed.
   */
  async deleteVideos(vids: string | string[], options: DeleteVideosOptions = {}): Promise<DeleteVideosResult> {
    const data = await this.client.request<unknown>({
      method: 'POST',
      path: '/v2/video/del-videos',
      params: {
        vids: normalizeVids(vids, 500),
        deleteType: options.deleteType ?? 1,
        ignoreInvalidVids: options.ignoreInvalidVids === false ? 'N' : 'Y'
      },
      idempotent: false
    });
    return { skipped: parseSkippedVids(data) };
  }

  /** Restores up to 100 videos from the recycle bin. */
  async recoverVideos(vids: string | string[]): Promise<unknown> {
    return this.client.request({
      method: 'POST',
      path: `${VIDEO_PATH}/recover-videos`,
      params: { vids: normalizeVids(vids, 100) },
      idempotent: false
    });
  }

  /** Moves videos into a category. */
  async moveVideos(params: MoveVideosParams): Promise<unknown> {
    if (params.cataId === undefined || params.cataId === null || params.cataId === '') {
      throw new PolyVVodError('validation', 'cataId is required');
    }
    return this.client.request({
      method: 'POST',
      path: `${VIDEO_PATH}/changeCata`,
      auth: SIGN_USERID_VIDS_CATAID,
      params: { vids: normalizeVids(params.vids, 500), cataid: params.cataId },
      idempotent: false
    });
  }

  /** Bans or unbans up to 500 videos. Only published videos can be banned and only banned ones unbanned. */
  async setForbidden(params: SetForbiddenParams): Promise<unknown> {
    return this.client.request({
      method: 'POST',
      path: `${VIDEO_PATH}/forbidden`,
      params: { vids: normalizeVids(params.vids, 500), forbidden: params.forbidden ? 1 : 0 },
      idempotent: false
    });
  }

  /** Duration and size of the given videos, or of every video in a category. */
  async getDurationAndSize(params: DurationAndSizeParams = {}): Promise<DurationAndSizeItem[]> {
    const vids = params.vids === undefined ? undefined : normalizeVids(params.vids, 500);
    if (vids === undefined && !params.cataId) {
      throw new PolyVVodError('validation', 'Pass vids, cataId, or both');
    }
    return this.client.request({ method: 'GET', path: `${VIDEO_PATH}/getSizeByCata`, params: { vids, cataid: params.cataId } });
  }

  /**
   * Polls a video until it is published or definitively failed.
   *
   * Transcoding starts about a minute after the upload and takes about 80 seconds for a small
   * clip, so plan for minutes rather than seconds.
   *
   * @throws {PolyVVodError} `validation`, or a polling error that is not "video not found"
   */
  async waitUntilPublished(vid: string, options: WaitOptions = {}): Promise<WaitResult> {
    if (!vid) throw new PolyVVodError('validation', 'vid is required');
    const timeoutMs = options.timeoutMs ?? 10 * 60_000;
    const intervalMs = options.intervalMs ?? 5_000;
    const deadline = Date.now() + timeoutMs;
    let info: VideoInfoItem | undefined;
    for (;;) {
      try {
        info = await this.getVideo(vid);
      } catch (error) {
        // Right after an upload the record may not be visible for a moment.
        if (!isVideoNotFound(error)) throw error;
      }
      const status = info?.basicInfo?.status;
      if (status !== undefined && info && isPublished(status)) return { state: 'published', info };
      if (status !== undefined && info && isTerminalFailure(status)) return { state: 'failed', info };
      if (Date.now() + intervalMs > deadline) return { state: 'timeout', info };
      await sleep(intervalMs, undefined, { signal: options.signal });
    }
  }
}
