/**
 * Platform Types
 *
 * TypeScript type definitions for Platform Service APIs.
 *
 * @module types/platform
 */

// ============================================
// Common Types
// ============================================

/**
 * Sex type for anchors
 * M = Male, W = Female
 */
export type SexType = 'M' | 'W';

/**
 * Content group type
 * SYS = System group, USER = User-defined group
 */
export type ContentGroupType = 'SYS' | 'USER';

/**
 * Content group type (extended)
 * Includes USER_NEW for new user groups (API may return this)
 */
export type ContentGroupTypeExtended = 'SYS' | 'USER' | 'USER_NEW';

// ============================================
// Anchor Types
// ============================================

/**
 * Create anchor parameters
 */
export interface CreateAnchorParams {
  /** Anchor nickname (required, max 20 characters) */
  nickname: string;
  /** Sex: M (male) or W (female) (required) */
  sex: SexType;
  /** Avatar URL (required, max 255 characters) */
  avatar: string;
  /** Description (optional, max 150 characters) */
  description?: string;
  /** Channel IDs to associate (optional, max 1000) */
  addChannelIds?: number[];
}

/**
 * Anchor detail response
 */
export interface AnchorDetail {
  /** Anchor ID */
  anchorId: number;
  /** Anchor nickname */
  nickname: string;
  /** Sex: M or W */
  sex: SexType;
  /** Avatar URL */
  avatar: string;
  /** Description */
  description: string;
  /** Status: 0 (disabled) or 1 (enabled) */
  status: number;
}

/**
 * List anchors parameters
 */
export interface ListAnchorsParams {
  /** Page number (default 1) */
  pageNumber?: number;
  /** Page size (default 10, max 1000) */
  pageSize?: number;
  /** Status filter: 0 (disabled) or 1 (enabled) */
  status?: 0 | 1;
  /** Sex filter: M or W */
  sex?: SexType;
  /** Nickname filter (supports fuzzy search) */
  nickname?: string;
  /** Start time (13-bit timestamp) */
  startTime?: number;
  /** End time (13-bit timestamp) */
  endTime?: number;
}

/**
 * Anchor item in list
 */
export interface AnchorItem {
  /** Anchor ID */
  anchorId: number;
  /** Anchor nickname */
  nickname: string;
  /** Sex: M or W */
  sex: SexType;
  /** Avatar URL */
  avatar: string;
  /** Status: 0 (disabled) or 1 (enabled) */
  status: number;
  /** Number of associated channels */
  channelCount: number;
  /** Number of sessions */
  sessionCount: number;
  /** Total watch duration (seconds) */
  watchDuration: number;
}

/**
 * List anchors response (paginated)
 */
export interface ListAnchorsResponse {
  /** Anchor items */
  contents: AnchorItem[];
  /** Current page number */
  pageNumber: number;
  /** Page size */
  pageSize: number;
  /** Total pages */
  totalPages: number;
  /** Total items */
  totalItems: number;
}

/**
 * List anchor relations parameters
 */
export interface ListAnchorRelationsParams {
  /** Anchor ID (required) */
  anchorId: number;
  /** Page number (optional) */
  pageNumber?: number;
  /** Page size (optional) */
  pageSize?: number;
}

/**
 * Anchor relation item (channel)
 */
export interface AnchorRelationItem {
  /** Channel ID */
  channelId: number;
  /** Channel name */
  name: string;
}

/**
 * Update anchor parameters
 */
export interface UpdateAnchorParams {
  /** Anchor ID (required) */
  anchorId: number;
  /** Anchor nickname (optional, max 20 characters) */
  nickname?: string;
  /** Sex: M or W (optional) */
  sex?: SexType;
  /** Avatar URL (optional, max 255 characters) */
  avatar?: string;
  /** Description (optional, max 150 characters) */
  description?: string;
  /** Channel IDs to add (optional, max 1000) */
  addChannelIds?: number[];
  /** Channel IDs to remove (optional, max 1000) */
  delChannelIds?: number[];
}

/**
 * Update anchor status parameters
 */
export interface UpdateAnchorStatusParams {
  /** Anchor ID (required) */
  anchorId: number;
  /** Status: 0 (disable) or 1 (enable) (required) */
  status: 0 | 1;
}

// ============================================
// Content Group Types
// ============================================

/**
 * List content groups parameters
 */
export interface ListContentGroupsParams {
  /** Content type: script (内容库) or robot (成员库) */
  type: 'script' | 'robot';
}

/**
 * Content group item
 */
export interface ContentGroupItem {
  /** Group ID */
  id: number;
  /** Group name */
  name: string;
  /** Group type: SYS or USER (API may also return USER_NEW) */
  type: ContentGroupType | ContentGroupTypeExtended;
  /** Update time (13-bit timestamp) */
  updateTime: number;
}
