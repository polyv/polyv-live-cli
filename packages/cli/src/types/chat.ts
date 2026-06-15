/**
 * @fileoverview Chat message management types for CLI
 * @author Development Team
 * @since 11.1.0
 */

/**
 * Output format type
 */
export type OutputFormat = 'table' | 'json';

/**
 * Chat service configuration
 */
export interface ChatServiceConfig {
  /** Base URL for API */
  baseUrl?: string;
  /** Request timeout in ms */
  timeout?: number;
  /** Enable debug mode */
  debug?: boolean;
}

/**
 * Options for chat send command from CLI
 */
export interface ChatSendOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Text message content */
  msg?: string;
  /** Image URL */
  imgUrl?: string;
  /** Avatar URL */
  pic?: string;
  /** Nickname */
  nickName?: string;
  /** Actor/role */
  actor?: string;
  /** Admin index */
  adminIndex?: number;
  /** Free review */
  freeReview?: boolean;
  /** Output format */
  output?: OutputFormat;
}

/**
 * Options for chat list command from CLI
 */
export interface ChatListOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Start date filter (yyyy-MM-dd) */
  startDay?: string;
  /** End date filter (yyyy-MM-dd) */
  endDay?: string;
  /** Page number */
  page?: number;
  /** Page size */
  size?: number;
  /** User type filter */
  userType?: string;
  /** Status filter */
  status?: string;
  /** Output format */
  output?: OutputFormat;
}

/**
 * Options for chat delete command from CLI
 */
export interface ChatDeleteOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Message ID to delete */
  messageId?: string;
  /** Clear all messages */
  clear?: boolean;
  /** Skip confirmation prompt */
  force?: boolean;
  /** Output format */
  output?: OutputFormat;
}

/**
 * Options for chat ban command (Story 11-2)
 */
export interface ChatBanOptions {
  /** Channel ID (required for channel-level ban) */
  channelId?: string;
  /** User IDs to ban */
  userIds: string[];
  /** Global ban (account level) */
  global?: boolean;
  /** Output format */
  output?: OutputFormat;
}

/**
 * Options for chat unban command (Story 11-2)
 */
export interface ChatUnbanOptions {
  /** Channel ID (required for channel-level unban) */
  channelId?: string;
  /** User IDs to unban */
  userIds: string[];
  /** Global unban (account level) */
  global?: boolean;
  /** Output format */
  output?: OutputFormat;
}

/**
 * Options for chat kick command (Story 11-2)
 */
export interface ChatKickOptions {
  /** Channel ID (required for channel-level kick) */
  channelId?: string;
  /** Viewer IDs to kick */
  viewerIds?: string[];
  /** Nicknames to kick */
  nickNames?: string[];
  /** Global kick (platform level) */
  global?: boolean;
  /** Output format */
  output?: OutputFormat;
}

/**
 * Options for chat unkick command (Story 11-2)
 */
export interface ChatUnkickOptions {
  /** Channel ID (required for channel-level unkick) */
  channelId?: string;
  /** Viewer IDs to unkick */
  viewerIds?: string[];
  /** Nicknames to unkick */
  nickNames?: string[];
  /** Global unkick (platform level) */
  global?: boolean;
  /** Output format */
  output?: OutputFormat;
}

/**
 * Options for chat banned list command (Story 11-2)
 */
export interface ChatBannedListOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Type of banned list: userId, ip, or badword */
  type: 'userId' | 'ip' | 'badword';
  /** Output format */
  output?: OutputFormat;
}

/**
 * Options for chat kicked list command (Story 11-2)
 */
export interface ChatKickedListOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Output format */
  output?: OutputFormat;
}
