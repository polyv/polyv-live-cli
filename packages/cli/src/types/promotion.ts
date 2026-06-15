/**
 * @fileoverview Promotion types for CLI commands
 * @author Development Team
 * @since 14.1.0
 */

import { OutputFormat } from './platform';

/**
 * Service configuration for promotion handler
 */
export interface PromotionServiceConfig {
  /** Base URL for PolyV API */
  baseUrl: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Debug mode flag */
  debug?: boolean;
}

/**
 * Options for promotion list command
 */
export interface PromotionListOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Output format (table or json) */
  output?: OutputFormat;
}

/**
 * Options for promotion create command
 */
export interface PromotionCreateOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Promotion channel names (required) */
  names: string[];
  /** Output format (table or json) */
  output?: OutputFormat;
}

/**
 * Promotion channel info from API
 */
export interface PromotionChannel {
  /** Promotion ID */
  promoteId: string;
  /** Promotion channel name */
  popularizationName: string;
  /** Total visit count */
  visitsNum: number;
  /** Reservation count */
  reservationNum: number;
  /** Watch count */
  watchNum: number;
  /** Viewer count */
  viewerNum: number;
  /** Average watch time */
  averageWatchTime: string;
  /** Enrollment count */
  enrollNum: number;
  /** Created time (13-digit millisecond timestamp) */
  createdTime: number;
}

/**
 * Created promotion info from API
 */
export interface CreatedPromotion {
  /** Promotion ID */
  promoteId: string;
  /** Promotion channel name */
  popularizationName: string;
}
