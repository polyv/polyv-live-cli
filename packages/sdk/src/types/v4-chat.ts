/**
 * V4 Chat Types
 *
 * Type definitions for V4 Chat APIs.
 *
 * @module types/v4-chat
 */

// ============================================
// Common Types
// ============================================

/**
 * Watch type enum for message targeting
 * - 1: All roles
 * - 2: Viewers only
 * - 3: Special roles (teacher, guest, assistant, admin)
 * - 4: Teacher
 * - 5: Guest
 * - 6: Assistant
 * - 7: Admin
 * Multiple values can be combined with comma (e.g., "4,5")
 */
export type WatchType = string;

// ============================================
// Message Types
// ============================================

/**
 * Parameters for sending a custom message
 */
export interface SendCustomMessageParams {
  /** Channel ID */
  channelId: string;
  /** Message content (required if imgUrl is not provided, max 1000 chars) */
  content?: string;
  /** Image URL (required if content is not provided) */
  imgUrl?: string;
  /** Whether to join history list */
  joinHistoryList?: boolean;
  /** Target audience type (see WatchType) */
  watchType?: WatchType;
  /** Whether message is important */
  important?: boolean;
}

/**
 * Parameters for sending an encoded custom message
 */
export interface SendCustomMessageEncodeParams {
  /** Channel ID */
  channelId: string;
  /** Encoded message content (required if imgUrl is not provided) */
  content?: string;
  /** Image URL (required if content is not provided) */
  imgUrl?: string;
  /** Whether to join history list */
  joinHistoryList?: boolean;
  /** Target audience type (see WatchType) */
  watchType?: WatchType;
  /** Whether message is important */
  important?: boolean;
}

// ============================================
// Notice/Bulletin Types
// ============================================

/**
 * Bulletin/Notice entity
 */
export interface Bulletin {
  /** Bulletin ID */
  id: string;
  /** Bulletin content */
  content: string;
  /** Whether pinned to top */
  isTop: boolean;
  /** Whether popup enabled */
  isPop: boolean;
  /** Whether can be closed */
  canClose: boolean;
  /** Creation timestamp (milliseconds) */
  createTime: number;
  /** Nickname of creator */
  nick: string;
  /** Profile picture URL */
  pic: string;
}

/**
 * Parameters for listing bulletins
 */
export interface ListBulletinsParams {
  /** Channel ID */
  channelId: string;
  /** Page number (>= 1) */
  pageNumber: number;
  /** Page size (1-1000) */
  pageSize: number;
  /** Sort order (e.g., "createTime:asc" or "createTime:desc") */
  sort?: string;
}

/**
 * Response for listing bulletins
 */
export interface ListBulletinsResponse {
  /** Current page number */
  pageNumber: number;
  /** Page size */
  pageSize: number;
  /** Total pages */
  totalPages: number;
  /** Total items */
  totalItems: number;
  /** Bulletin list */
  contents: Bulletin[];
}

/**
 * Parameters for cleaning notices
 */
export interface CleanNoticesParams {
  /** Channel ID */
  channelId: string;
}

// ============================================
// Q&A Types
// ============================================

/**
 * Q&A answer entity
 */
export interface QaAnswer {
  /** Answer ID */
  id: string;
  /** Answer content */
  content: string;
  /** Creation timestamp */
  createTime: number;
  /** Answerer nickname */
  nick: string;
}

/**
 * Q&A entity
 */
export interface Qa {
  /** Q&A ID */
  id: string;
  /** Session ID */
  sessionId: string;
  /** Viewer ID */
  viewerId: string;
  /** Status (0: unanswered, 1: answered) */
  status: number;
  /** Question content */
  content: string;
  /** List of answers */
  answers: QaAnswer[];
  /** Creation timestamp (milliseconds) */
  createTime: number;
}

/**
 * Parameters for listing Q&A
 */
export interface ListQaParams {
  /** Channel ID */
  channelId: string;
  /** Page number (>= 1) */
  pageNumber: number;
  /** Page size (1-1000) */
  pageSize: number;
}

/**
 * Response for listing Q&A
 */
export interface ListQaResponse {
  /** Current page number */
  pageNumber: number;
  /** Page size */
  pageSize: number;
  /** Total pages */
  totalPages: number;
  /** Total items */
  totalItems: number;
  /** Q&A list */
  contents: Qa[];
}

// ============================================
// Check-in Types
// ============================================

/**
 * Check-in item for batch operation
 */
export interface BatchCheckinItem {
  /** Channel ID */
  channelId: string;
  /** Limit time in seconds */
  limitTime?: number;
  /** Delay time in seconds */
  delayTime?: number;
  /** Check-in message */
  message?: string;
  /** Whether force check-in is enabled */
  forceCheckInEnabled?: boolean;
}

/**
 * Parameters for batch check-in
 */
export interface BatchCheckinParams {
  /** Check-in items (max 1000) */
  items: BatchCheckinItem[];
}

