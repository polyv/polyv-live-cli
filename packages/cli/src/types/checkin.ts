/**
 * @fileoverview Type definitions for checkin commands
 * @author Development Team
 * @since 11.3.0
 */

import { OutputFormat } from '../handlers/base.handler';

/**
 * Options for starting a checkin session
 */
export interface CheckinStartOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Checkin duration in seconds (0-86400, 0 = immediate) */
  limitTime?: number;
  /** Scheduled start time (13-digit timestamp) */
  delayTime?: number;
  /** Checkin message/prompt */
  message?: string;
  /** Force checkin flag */
  force?: boolean;
  /** Output format (table or json) */
  output?: OutputFormat;
}

/**
 * Options for listing checkin records
 */
export interface CheckinListOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Page number */
  page?: number;
  /** Page size */
  size?: number;
  /** Date filter (yyyy-MM-dd) */
  date?: string;
  /** Session ID filter */
  sessionId?: string;
  /** Output format (table or json) */
  output?: OutputFormat;
}

/**
 * Options for getting checkin result details
 */
export interface CheckinResultOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Checkin ID (required) */
  checkinId: string;
  /** Output format (table or json) */
  output?: OutputFormat;
}

/**
 * Options for listing checkin sessions
 */
export interface CheckinSessionsOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Start date (yyyy-MM-dd) */
  startDate?: string;
  /** End date (yyyy-MM-dd) */
  endDate?: string;
  /** Output format (table or json) */
  output?: OutputFormat;
}

/**
 * Service configuration for checkin operations
 */
export interface CheckinServiceConfig {
  /** Base URL for API requests */
  baseUrl: string;
  /** Request timeout in milliseconds */
  timeout: number;
  /** Enable debug mode */
  debug: boolean;
}

/**
 * Parameters for starting checkin via SDK
 */
export interface StartCheckinParams {
  channelId: string;
  limitTime?: number;
  delayTime?: number;
  message?: string;
  forceCheckInEnabled?: string;
}

/**
 * Parameters for listing checkins via SDK
 */
export interface ListCheckinsParams {
  channelId: string;
  page?: number;
  pageSize?: number;
  date?: string;
  sessionId?: string;
}

/**
 * Parameters for getting checkin result via SDK
 */
export interface GetCheckinResultParams {
  channelId: string;
  checkinId: string;
}

/**
 * Parameters for listing checkin sessions via SDK
 */
export interface ListSessionsParams {
  channelId: string;
  startDate: string;
  endDate: string;
}
