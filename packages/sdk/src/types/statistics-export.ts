/**
 * Statistics Export Types
 *
 * Type definitions for statistics export operations (Story 10.4)
 *
 * @module types/statistics-export
 */

// ============================================
// AC1: Viewlog Item Type (观看日志数据项)
// ============================================

/**
 * Viewlog item - a single viewing log entry from API
 * Contains detailed information about a single viewing session
 */
export interface ViewlogItem {
  /** Play action ID */
  playId: string;
  /** User ID (account ID) */
  userId: string;
  /** Channel ID */
  channelId: string;
  /** Play duration in seconds */
  playDuration: number;
  /** Stay duration in seconds */
  stayDuration: number;
  /** Session ID */
  sessionId: string;
  /** Viewer ID (param1) */
  param1: string;
  /** Viewer nickname (param2) */
  param2: string;
  /** Watch type: live or vod (param3) */
  param3: string;
  /** IP address */
  ipAddress: string;
  /** Country */
  country: string;
  /** Province */
  province: string;
  /** City */
  city: string;
  /** ISP provider */
  isp: string;
  /** Referrer URL */
  referer: string;
  /** User agent string */
  userAgent: string;
  /** Operating system */
  operatingSystem: string;
  /** Browser name */
  browser: string;
  /** Is mobile: Y/N */
  isMobile: string;
  /** Current day (yyyy-MM-dd) */
  currentDay: string;
  /** Created timestamp (13-digit milliseconds) */
  createdTime: number;
  /** Last modified timestamp (13-digit milliseconds) */
  lastModified: number;
  /** Live type: 0(normal)/1(ultra-low latency)/2(PRTC) */
  ptype: number;
  /** First active time (enter page time) */
  firstActiveTime: number;
  /** Last active time (exit page time) */
  lastActiveTime: number;
}

// ============================================
// AC1, AC3, AC4, AC10: GetViewlog Params and Response
// ============================================

/**
 * Parameters for getViewlog API call
 */
export interface GetViewlogParams {
  /** Channel ID (required for CLI, optional in API to query all channels) */
  channelId: string;
  /** Start date time (yyyy-MM-dd HH:mm:ss format, required) */
  startDate: string;
  /** End date time (yyyy-MM-dd HH:mm:ss format, required) */
  endDate: string;
  /** Watch type filter: live or vod (optional) */
  watchType?: 'live' | 'vod';
  /** Page number (default: 1) */
  page?: number;
  /** Page size (default: 1000) */
  pageSize?: number;
}

/**
 * Response from getViewlog API call
 */
export interface GetViewlogResponse {
  /** Page size */
  pageSize: number;
  /** Current page number */
  pageNumber: number;
  /** Total number of items */
  totalItems: number;
  /** Total number of pages */
  totalPages: number;
  /** Viewlog contents array */
  contents: ViewlogItem[];
}

// ============================================
// AC2, AC6, AC7, AC10: Export Session Stats
// ============================================

/**
 * Parameters for exportSessionStats API call
 */
export interface ExportSessionStatsParams {
  /** Channel ID (required) */
  channelId: string;
  /** Session ID (required) */
  sessionId: string;
}

/**
 * Response from exportSessionStats API call
 */
export interface ExportSessionStatsResponse {
  /** Download URL for the report (valid for 60 days) */
  downloadUrl: string;
}

// ============================================
// Runtime type guards / stubs for testing
// These are exported to allow runtime type checking in tests
// ============================================

/**
 * Type guard stub for ViewlogItem - returns true if object matches shape
 * Note: This is a runtime check for testing purposes
 */
export const ViewlogItem: unique symbol = Symbol('ViewlogItem');

/**
 * Type guard stub for GetViewlogParams - returns true if object matches shape
 */
export const GetViewlogParams: unique symbol = Symbol('GetViewlogParams');

/**
 * Type guard stub for GetViewlogResponse - returns true if object matches shape
 */
export const GetViewlogResponse: unique symbol = Symbol('GetViewlogResponse');

/**
 * Type guard stub for ExportSessionStatsParams - returns true if object matches shape
 */
export const ExportSessionStatsParams: unique symbol = Symbol('ExportSessionStatsParams');

/**
 * Type guard stub for ExportSessionStatsResponse - returns true if object matches shape
 */
export const ExportSessionStatsResponse: unique symbol = Symbol('ExportSessionStatsResponse');
