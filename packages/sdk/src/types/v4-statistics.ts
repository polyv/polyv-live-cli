/**
 * V4 Statistics Types
 *
 * Type definitions for V4 Statistics APIs.
 *
 * @module types/v4-statistics
 */

// ============================================
// Session Stats Summary Types
// ============================================

/**
 * Session statistics summary entity
 */
export interface SessionStatsSummary {
  /** Record ID */
  id: number;
  /** Channel ID */
  channelId: number;
  /** Session ID */
  sessionId: string;
  /** Session name */
  name: string;
  /** Live start time (timestamp in milliseconds) */
  startTime: string;
  /** Live end time (timestamp in milliseconds) */
  endTime: string;
  /** Broadcast duration (seconds) */
  startDuration: number;
  /** Unique viewer count */
  uniqueViewer: number;
  /** View count */
  videoView: number;
  /** PC unique viewer count */
  pcUniqueViewer: number;
  /** Mobile unique viewer count */
  mobileUniqueViewer: number;
  /** Total watch duration (minutes) */
  totalPlayDuration: number;
  /** Average watch duration (minutes) */
  averagePlayDuration: number;
  /** Maximum concurrent viewers */
  maxConcurrencyCount: number;
  /** Playback duration (minutes) */
  playDuration: number;
  /** Playback count */
  playCount: number;
  /** Playback viewer count */
  viewerCount: number;
  /** Attendance type: 0=no data, 1=registration, 2=whitelist */
  attendanceType: number;
  /** Expected attendance (registered/whitelisted) */
  attendanceExpected: number;
  /** Actual attendance */
  attendanceActual: number;
  /** POLYV user ID */
  userId: string;
}

/**
 * Parameters for getting session stats summary list
 */
export interface GetSessionStatsSummaryListParams {
  /** Channel ID filter */
  channelId?: string;
  /** Session name or ID (fuzzy match) */
  keyword?: string;
  /** Start time (timestamp in milliseconds) */
  startTime?: string;
  /** End time (timestamp in milliseconds) */
  endTime?: string;
  /** Page number (default: 1, must be >= 1) */
  pageNumber?: number;
  /** Page size (default: 10, must be 1-1000) */
  pageSize?: number;
}

/**
 * Response for getting session stats summary list
 */
export interface GetSessionStatsSummaryListResponse {
  /** Current page number */
  pageNumber: number;
  /** Page size */
  pageSize: number;
  /** Total pages */
  totalPages: number;
  /** Total items */
  totalItems: number;
  /** Session stats summary list */
  contents: SessionStatsSummary[];
}
