/**
 * @fileoverview Type definitions for lottery commands
 * @author Development Team
 * @since 11.5.0
 */

import { OutputFormat } from '../handlers/base.handler';

/**
 * Lottery condition types
 */
export type LotteryCondition = 'none' | 'invite' | 'duration' | 'comment' | 'question';

/**
 * Receive info item for prize collection
 */
export interface ReceiveInfoItem {
  /** Field type: userName, userPhone, custom */
  type: 'userName' | 'userPhone' | 'custom';
  /** Field label */
  field: string;
  /** Placeholder/tip text */
  tips: string;
  /** Whether field is required */
  required: boolean;
}

/**
 * Options for creating a lottery activity
 */
export interface LotteryCreateOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Lottery activity name (required) */
  name: string;
  /** Lottery condition type (required) */
  type: LotteryCondition;
  /** Number of winners (required) */
  amount: number;
  /** Prize name (required) */
  prizeName: string;
  /** Receive info JSON string */
  receiveInfo?: string;
  /** Duration in seconds (for invite/duration types) */
  duration?: number;
  /** Number of invites required (for invite type) */
  inviteNum?: number;
  /** Output format (table or json) */
  output?: OutputFormat;
  /** Skip confirmation prompt */
  force?: boolean;
}

/**
 * Options for listing lottery activities
 */
export interface LotteryListOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Page number */
  page?: number;
  /** Page size */
  size?: number;
  /** Output format (table or json) */
  output?: OutputFormat;
}

/**
 * Options for getting lottery activity details
 */
export interface LotteryGetOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Lottery activity ID (required) */
  id: string;
  /** Output format (table or json) */
  output?: OutputFormat;
}

/**
 * Options for updating lottery activity
 */
export interface LotteryUpdateOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Lottery activity ID (required) */
  id: string;
  /** New activity name */
  name?: string;
  /** New number of winners */
  amount?: number;
  /** New prize name */
  prizeName?: string;
  /** Output format (table or json) */
  output?: OutputFormat;
  /** Skip confirmation prompt */
  force?: boolean;
}

/**
 * Options for deleting lottery activity
 */
export interface LotteryDeleteOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Lottery activity ID (required) */
  id: string;
  /** Output format (table or json) */
  output?: OutputFormat;
  /** Skip confirmation prompt */
  force?: boolean;
}

/**
 * Options for getting winner list
 */
export interface LotteryWinnersOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Lottery ID (required) */
  lotteryId: string;
  /** Viewer ID for V4 viewer-specific winner lookup */
  viewerId?: string;
  /** Page number */
  page?: number;
  /** Items per page */
  limit?: number;
  /** Output format (table or json) */
  output?: OutputFormat;
}

/**
 * Options for getting lottery records
 */
export interface LotteryRecordsOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Start time (timestamp in milliseconds) */
  startTime?: number;
  /** End time (timestamp in milliseconds) */
  endTime?: number;
  /** Session ID filter */
  sessionId?: string;
  /** Page number */
  page?: number;
  /** Items per page */
  limit?: number;
  /** Output format (table or json) */
  output?: OutputFormat;
}

/**
 * Options for getting legacy lottery records through the LiveInteraction V3 API
 */
export interface LotteryLegacyRecordsOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Start time (timestamp in milliseconds, required) */
  startTime: number;
  /** End time (timestamp in milliseconds, required) */
  endTime: number;
  /** Session ID filter */
  sessionId?: string;
  /** Page number */
  page?: number;
  /** Items per page */
  limit?: number;
  /** Output format (table or json) */
  output?: OutputFormat;
}

/**
 * Options for listing lottery records across channels
 */
export interface LotteryChannelRecordsOptions {
  /** Channel IDs (required) */
  channelIds: string[];
  /** Start time (timestamp in milliseconds) */
  startTime: number;
  /** End time (timestamp in milliseconds) */
  endTime: number;
  /** Session ID filter */
  sessionId?: string;
  /** Page number */
  page?: number;
  /** Items per page */
  limit?: number;
  /** Output format (table or json) */
  output?: OutputFormat;
}

/**
 * Options for downloading winner details
 */
export interface LotteryDownloadWinnersOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Lottery ID (required) */
  lotteryId: string;
  /** Output format (table or json) */
  output?: OutputFormat;
}

/**
 * Options for adding winner receive information
 */
export interface LotteryReceiveInfoOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Lottery ID (required) */
  lotteryId: string;
  /** Winner code (required) */
  winnerCode: string;
  /** Viewer ID (required) */
  viewerId: string;
  /** Receive information JSON */
  receiveInfo?: string | Record<string, unknown> | unknown[];
  /** Skip confirmation prompt */
  force?: boolean;
  /** Output format (table or json) */
  output?: OutputFormat;
}

/**
 * Service configuration for lottery operations
 */
export interface LotteryServiceConfig {
  /** Base URL for API requests */
  baseUrl: string;
  /** Request timeout in milliseconds */
  timeout: number;
  /** Enable debug mode */
  debug: boolean;
}

/**
 * Parameters for creating lottery activity via SDK (V4 API)
 */
export interface CreateLotteryActivityParams {
  channelId: string;
  activityName: string;
  lotteryCondition: LotteryCondition;
  amount: number;
  prizeName: string;
  receiveEnabled?: string;
  receiveInfo?: string;
  duration?: number;
  inviteNum?: number;
}

/**
 * Parameters for listing lottery activities via SDK (V4 API)
 */
export interface ListLotteryActivitiesParams {
  channelId: string;
  pageNumber?: number;
  pageSize?: number;
}

/**
 * Parameters for getting lottery activity via SDK (V4 API)
 */
export interface GetLotteryActivityParams {
  channelId: string;
  id: string;
}

/**
 * Parameters for updating lottery activity via SDK (V4 API)
 */
export interface UpdateLotteryActivityParams {
  channelId: string;
  id: string;
  activityName?: string;
  amount?: number;
  prizeName?: string;
}

/**
 * Parameters for deleting lottery activity via SDK (V4 API)
 */
export interface DeleteLotteryActivityParams {
  channelId: string;
  id: string;
}

/**
 * Parameters for getting winner detail via SDK (LiveInteraction V2 API)
 */
export interface GetWinnerDetailParams {
  channelId: string;
  lotteryId: string;
  viewerId?: string;
  page?: number;
  limit?: number;
}

/**
 * Parameters for listing lottery records via SDK (LiveInteraction V3 API)
 */
export interface ListLotteryRecordsParams {
  channelId: string;
  startTime?: number;
  endTime?: number;
  sessionId?: string;
  page?: number;
  limit?: number;
}

/**
 * Parameters for listing lottery records across channels via SDK
 */
export interface ListChannelsLotteryParams {
  channelIds: string[];
  startTime: number;
  endTime: number;
  sessionId?: string;
  page?: number;
  limit?: number;
}

/**
 * Parameters for downloading winner details via SDK
 */
export interface DownloadWinnerDetailParams {
  channelId: string;
  lotteryId: string;
}

/**
 * Parameters for adding winner receive information via SDK
 */
export interface AddReceiveInfoV4Params {
  channelId: string;
  lotteryId: string;
  winnerCode: string;
  viewerId: string;
  receiveInfo?: Record<string, unknown> | unknown[];
}
