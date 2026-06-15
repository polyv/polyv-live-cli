/**
 * @fileoverview Session CLI type definitions
 * @author Development Team
 * @since 9.6.0
 */

/**
 * Session service configuration
 */
export interface SessionServiceConfig {
  baseUrl: string;
  timeout: number;
  debug: boolean;
}

/**
 * Session list options from CLI
 */
export interface SessionListOptions {
  /** Channel ID (optional - if not provided, lists all sessions for account) */
  channelId?: string;
  /** Page number (optional, default: 1) */
  page?: number;
  /** Page size (optional, default: 10) */
  pageSize?: number;
  /** Start date filter (yyyy-MM-dd format) */
  startDate?: string;
  /** End date filter (yyyy-MM-dd format) */
  endDate?: string;
  /** Output format */
  output?: 'table' | 'json';
}

/**
 * Session get options from CLI
 */
export interface SessionGetOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Session ID (required) */
  sessionId: string;
  /** Output format */
  output?: 'table' | 'json';
}

/**
 * Session display item for table and JSON output
 * Contains all fields from API response for complete output
 */
export interface SessionDisplayItem {
  sessionId: string;
  channelId: string;
  name?: string;
  status: string;
  startTime?: string | number;
  endTime?: number;
  createdTime?: number;
  planStartTime?: number;
  planEndTime?: number;
  streamType?: string;
  pushClient?: string;
  watchUrl?: string;
  userId?: string;
  splashImg?: string;
  splashLargeImg?: string;
}

/**
 * Session list response from service
 */
export interface SessionListResponse {
  contents: SessionDisplayItem[];
  pageNumber: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

// Runtime type placeholders for type checking
export const SessionServiceConfig: {
  baseUrl: string;
  timeout: number;
  debug: boolean;
} = {} as any;

export const SessionListOptions: {
  channelId?: string;
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  output?: 'table' | 'json';
} = {} as any;

export const SessionGetOptions: {
  channelId: string;
  sessionId: string;
  output?: 'table' | 'json';
} = {} as any;

export const SessionDisplayItem: {
  sessionId: string;
  channelId: string;
  name?: string;
  status: string;
  startTime?: string | number;
  endTime?: number;
  createdTime?: number;
  planStartTime?: number;
  planEndTime?: number;
  streamType?: string;
  pushClient?: string;
  watchUrl?: string;
  userId?: string;
  splashImg?: string;
  splashLargeImg?: string;
} = {} as any;
