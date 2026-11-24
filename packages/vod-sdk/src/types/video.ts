/**
 * Video types.
 *
 * @module types/video
 */

export const PUBLISHED_STATUSES: readonly number[] = [60, 61];
/**
 * Statuses after which a video will not become playable.
 *
 * `40` and `51` are documented. `41` is not in the public docs: it was observed on files that
 * are not valid videos (zero duration, no format, no transcoded files), and it did not change.
 */
export const FAILED_STATUSES: readonly number[] = [40, 41, 51];

/**
 * Status codes of `basicInfo.status`.
 *
 * `6` (just uploaded), `41` and `61` are not in the public docs; they were observed on the live
 * platform. `61` is a video that was restored from the recycle bin.
 */
export const VIDEO_STATUS_TEXT: Readonly<Record<number, string>> = {
  [-1]: 'deleted',
  6: 'processing',
  10: 'waiting-encode',
  20: 'encoding',
  40: 'encode-failed',
  41: 'not-playable',
  50: 'waiting-audit',
  51: 'audit-rejected',
  60: 'published',
  61: 'published'
};

export function describeVideoStatus(status: number): string {
  return VIDEO_STATUS_TEXT[status] ?? `unknown(${status})`;
}

export function isPublished(status: number): boolean {
  return PUBLISHED_STATUSES.includes(status);
}

export function isTerminalFailure(status: number): boolean {
  return FAILED_STATUSES.includes(status);
}

export type VideoSort = 'creationTimeAsc' | 'creationTimeDesc' | 'playTimesAsc' | 'playTimesDesc';
export type VideoFilter = 'basicInfo' | 'metaData' | 'transcodeInfo' | 'snapshotInfo';

export interface SearchVideosParams {
  /** Sections to return. Default is the basic info only. */
  filters?: VideoFilter[] | string;
  cataId?: string | number;
  /** Fuzzy match on title or vid. */
  title?: string;
  /** Fuzzy match on tag. */
  tag?: string;
  uploader?: string;
  /** Status codes; any of `60`/`61` means published. Default is every status. */
  status?: string;
  /** Include sub-categories. Default true. */
  containSubCate?: boolean;
  /** 13-digit timestamps. */
  startTime?: number;
  endTime?: number;
  startModifyTime?: number;
  endModifyTime?: number;
  encrypted?: boolean;
  playAuthEnable?: boolean;
  sort?: VideoSort;
  /** Default 1. */
  page?: number;
  /** Default 10, max 1000. */
  pageSize?: number;
}

export interface VideoBasicInfo {
  title: string;
  description: string;
  /** Source duration in seconds. */
  duration: number;
  thumbnailURL: string;
  coverURL: string;
  miniCoverURL?: string;
  largeCoverURL?: string;
  audioUrl?: string;
  /** `yyyy-MM-dd HH:mm:ss` */
  creationTime: string;
  updateTime: string;
  /** Source file size in bytes. */
  size: number;
  status: number;
  /** `1` is the root category ("默认分类"). */
  cateId: number;
  cateName: string;
  tags: string;
  uploader: string;
  playTimes: number;
  md5Checksum?: string;
  courseId?: string;
}

export interface VideoMetaData {
  size: number;
  format: string;
  duration: number;
  bitrate: number;
  fps: number;
  height: number;
  width: number;
  codec: string;
}

export interface VideoTranscodeInfo {
  playUrl: string;
  /** `SOURCE`, `LD`, `SD`, `HD` */
  definition: string;
  bitrate: number;
  duration: number;
  encrypt: boolean;
  format: string;
  fps: number;
  height: number;
  width: number;
  /** `normal` or `unavailable` */
  status: string;
  fileSize?: number;
}

export interface VideoSnapshotInfo {
  imageUrl: string[];
  bigImageUrl?: string[];
}

export interface VideoInfoItem {
  vid: string;
  basicInfo: VideoBasicInfo;
  metaData?: VideoMetaData;
  transcodeInfos?: VideoTranscodeInfo[];
  snapshotInfo?: VideoSnapshotInfo;
}

export interface SearchVideosResult {
  pageNumber: number;
  totalPages: number;
  pageSize: number;
  contents: VideoInfoItem[];
  totalItems: number;
}

export interface UpdateVideoInfoParams {
  vid: string;
  title?: string;
  description?: string;
  tag?: string;
  /** First-publish URL outside the platform. */
  publishUrl?: string;
}

export interface MoveVideosParams {
  vids: string | string[];
  cataId: string | number;
}

export interface SetForbiddenParams {
  vids: string | string[];
  /** `true` bans, `false` unbans. Only published videos can be banned and only banned ones unbanned. */
  forbidden: boolean;
}

export interface DurationAndSizeParams {
  /** Up to 500 vids. Takes precedence over `cataId`. */
  vids?: string | string[];
  /** Comma-separated category ids. */
  cataId?: string;
}

/** Duration and size of one video. The sizes are the transcoded FLV files, in bytes. */
export interface DurationAndSizeVideo {
  vid: string;
  /** `hh:mm:ss` */
  duration: string;
  /** Clearness 1. */
  filesize1: number;
  filesize2?: number;
  filesize3?: number;
}

export interface DurationAndSizeItem {
  /** `null` when the query was by vids. */
  cataid: number | null;
  videos: DurationAndSizeVideo[];
}

export interface DeleteVideosOptions {
  /** `1` moves to the recycle bin (default), `2` deletes permanently. */
  deleteType?: 1 | 2;
  /** Skip vids that cannot be deleted instead of failing the whole batch. Default false. */
  ignoreInvalidVids?: boolean;
}

export interface DeleteVideosResult {
  /** Vids the platform skipped: unknown, already deleted, or still being processed. */
  skipped: string[];
}

export interface WaitOptions {
  /** Default 10 minutes; transcoding a small clip takes about 80 seconds. */
  timeoutMs?: number;
  /** Default 5 seconds. */
  intervalMs?: number;
  signal?: AbortSignal;
}

export type WaitResult =
  | { state: 'published'; info: VideoInfoItem }
  | { state: 'failed'; info: VideoInfoItem }
  | { state: 'timeout'; info: VideoInfoItem | undefined };
