/**
 * Statistics Export Types
 *
 * Type definitions for statistics export CLI commands (Story 10.4)
 *
 * @module types/statistics-export
 */

// ============================================
// AC1, AC3, AC4, AC5, AC10: Viewlog Export Options
// ============================================

/**
 * Options for statistics export viewlog command
 */
export interface StatisticsExportViewlogOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Start time (yyyy-MM-dd HH:mm:ss format, required) */
  startTime: string;
  /** End time (yyyy-MM-dd HH:mm:ss format, required) */
  endTime: string;
  /** Watch type filter (live or vod, optional) */
  watchType?: 'live' | 'vod';
  /** Output format (table or json, default: table) */
  output?: 'table' | 'json';
  /** Output file path for CSV export (optional) */
  outputFile?: string;
  /** Page number (optional, for pagination) */
  page?: number;
  /** Page size (optional, for pagination) */
  pageSize?: number;
}

// ============================================
// AC2, AC6, AC8, AC9, AC10: Session Export Options
// ============================================

/**
 * Options for statistics export session command
 */
export interface StatisticsExportSessionOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Session ID (required) */
  sessionId: string;
  /** Output format (table or json, default: table) */
  output?: 'table' | 'json';
}

// ============================================
// AC8, AC9: Display Item Types
// ============================================

/**
 * Viewlog display item for CLI output
 */
export interface ViewlogDisplayItem {
  /** Play ID */
  playId: string;
  /** Viewer ID */
  viewerId: string;
  /** Viewer name/nickname */
  viewerName: string;
  /** Watch type (live or vod) */
  watchType: string;
  /** Play duration in seconds */
  playDuration: number;
  /** Stay duration in seconds */
  stayDuration: number;
  /** Session ID */
  sessionId: string;
  /** IP address */
  ipAddress: string;
  /** Region (province/city) */
  region: string;
  /** Operating system */
  operatingSystem: string;
  /** Browser name */
  browser: string;
  /** Is mobile device (Y/N) */
  isMobile: string;
  /** Date (yyyy-MM-dd) */
  date: string;
  /** Created timestamp (13-digit milliseconds) */
  createdTime: number;
}

/**
 * Session export display item for CLI output
 */
export interface SessionExportDisplayItem {
  /** Channel ID */
  channelId: string;
  /** Session ID */
  sessionId: string;
  /** Download URL for the report */
  downloadUrl: string;
  /** Expiration period */
  expiresIn: string;
}

// ============================================
// Runtime type exports for testing
// These symbols allow type checking at runtime
// ============================================

/**
 * Type guard stub for StatisticsExportViewlogOptions
 */
export const StatisticsExportViewlogOptions: unique symbol = Symbol('StatisticsExportViewlogOptions');

/**
 * Type guard stub for StatisticsExportSessionOptions
 */
export const StatisticsExportSessionOptions: unique symbol = Symbol('StatisticsExportSessionOptions');

/**
 * Type guard stub for ViewlogDisplayItem
 */
export const ViewlogDisplayItem: unique symbol = Symbol('ViewlogDisplayItem');

/**
 * Type guard stub for SessionExportDisplayItem
 */
export const SessionExportDisplayItem: unique symbol = Symbol('SessionExportDisplayItem');
