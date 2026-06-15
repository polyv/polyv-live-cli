/**
 * @fileoverview Playback CLI type definitions
 * @author Development Team
 * @since 9.1.0
 */

/**
 * Playback service configuration
 */
export interface PlaybackServiceConfig {
  baseUrl: string;
  timeout: number;
  debug: boolean;
}

/**
 * Playback list options from CLI
 */
export interface PlaybackListOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Page number (optional, default: 1) */
  page?: number;
  /** Page size (optional, default: 10) */
  pageSize?: number;
  /** List type: 'playback' or 'vod' */
  listType?: 'playback' | 'vod';
  /** Output format */
  output?: 'table' | 'json';
}

/**
 * Playback display item for table and JSON output
 * Contains all fields from API response for complete output
 */
export interface PlaybackDisplayItem {
  videoId: string;
  videoPoolId?: string;
  userId?: string;
  channelId: string;
  title: string;
  firstImage?: string;
  duration: string;
  myBr?: string;
  seed?: number;
  createdTime?: number;
  lastModified?: number;
  asDefault?: string;
  status?: string;
  watchUrl?: string;
  liveType?: string;
  origin?: 'manual' | 'auto' | 'merge' | 'clip' | 'smart-clip';
}

/**
 * Runtime type placeholder for PlaybackListOptions
 * Note: This is a placeholder for runtime type checking.
 * Actual type information is in the interface above.
 */
export const PlaybackListOptions: {
  channelId: string;
  page?: number;
  pageSize?: number;
  listType?: 'playback' | 'vod';
  output?: 'table' | 'json';
} = {} as any;

/**
 * Runtime type placeholder for PlaybackServiceConfig
 */
export const PlaybackServiceConfig: {
  baseUrl: string;
  timeout: number;
  debug: boolean;
} = {} as any;

/**
 * Runtime type placeholder for PlaybackDisplayItem
 */
export const PlaybackDisplayItem: {
  videoId: string;
  videoPoolId?: string;
  userId?: string;
  channelId: string;
  title: string;
  firstImage?: string;
  duration: string;
  myBr?: string;
  seed?: number;
  createdTime?: number;
  lastModified?: number;
  asDefault?: string;
  status?: string;
  watchUrl?: string;
  liveType?: string;
  origin?: 'manual' | 'auto' | 'merge' | 'clip' | 'smart-clip';
} = {} as any;

/**
 * Playback get options from CLI (Story 9.2)
 */
export interface PlaybackGetOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Video ID (required) */
  videoId: string;
  /** List type: 'playback' or 'vod' */
  listType?: 'playback' | 'vod';
  /** Output format */
  output?: 'table' | 'json';
}

/**
 * Runtime type placeholder for PlaybackGetOptions
 */
export const PlaybackGetOptions: {
  channelId: string;
  videoId: string;
  listType?: 'playback' | 'vod';
  output?: 'table' | 'json';
} = {} as any;

/**
 * Playback delete options from CLI (Story 9.3)
 */
export interface PlaybackDeleteOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Video ID (required) */
  videoId: string;
  /** List type: 'playback' or 'vod' */
  listType?: 'playback' | 'vod';
  /** Force flag to skip confirmation */
  force?: boolean;
  /** Output format */
  output?: 'table' | 'json';
}

/**
 * Runtime type placeholder for PlaybackDeleteOptions
 */
export const PlaybackDeleteOptions: {
  channelId: string;
  videoId: string;
  listType?: 'playback' | 'vod';
  force?: boolean;
  output?: 'table' | 'json';
} = {} as any;

/**
 * Playback merge options from CLI (Story 9.4)
 */
export interface PlaybackMergeOptions {
  /** Channel ID (required) */
  channelId: string;
  /** File IDs to merge, comma-separated (required) */
  fileIds: string;
  /** Merged file name (optional) */
  fileName?: string;
  /** Use async merge mode */
  async?: boolean;
  /** Callback URL for async merge */
  callbackUrl?: string;
  /** Auto convert to VOD after merge */
  autoConvert?: boolean;
  /** Merge to MP4 format */
  mergeMp4?: boolean;
  /** Output format */
  output?: 'table' | 'json';
}

/**
 * Runtime type placeholder for PlaybackMergeOptions
 */
export const PlaybackMergeOptions: {
  channelId: string;
  fileIds: string;
  fileName?: string;
  async?: boolean;
  callbackUrl?: string;
  autoConvert?: boolean;
  mergeMp4?: boolean;
  output?: 'table' | 'json';
} = {} as any;
