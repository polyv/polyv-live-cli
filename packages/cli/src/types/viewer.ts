/**
 * @fileoverview Type definitions for viewer CLI commands
 * @author Development Team
 * @since 12.1.0
 */

/**
 * Viewer source type
 */
export type ViewerSource = 'IMPORT' | 'WX' | 'MOBILE';

/**
 * Viewer service configuration
 */
export interface ViewerServiceConfig {
  /** API base URL */
  baseUrl?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Enable debug mode */
  debug?: boolean;
}

/**
 * Options for viewer get command
 */
export interface ViewerGetOptions {
  /** Viewer unique ID (required) */
  viewerId: string;
  /** Output format: table or json */
  output?: 'table' | 'json';
}

/**
 * Options for viewer list command
 */
export interface ViewerListOptions {
  /** Filter by source type */
  source?: ViewerSource;
  /** Filter by mobile number */
  mobile?: string;
  /** Filter by email */
  email?: string;
  /** Filter by area */
  area?: string;
  /** Page number (default: 1) */
  page?: number;
  /** Page size (default: 10, max: 1000) */
  size?: number;
  /** Output format: table or json */
  output?: 'table' | 'json';
}

/**
 * Options for viewer create command
 */
export interface ViewerCreateOptions {
  /** Viewer nickname (required) */
  nickname: string;
  /** Viewer mobile number (required) */
  mobile: string;
  /** Viewer real name */
  name?: string;
  /** Last collected mobile number */
  lastCollectMobile?: string;
  /** Viewer email */
  email?: string;
  /** Viewer area */
  area?: string;
  /** Latest access IP */
  latestAccessIp?: string;
  /** Device name */
  device?: string;
  /** Follow users JSON object */
  followUsers?: string;
  /** Skip confirmation */
  force?: boolean;
  /** Output format: table or json */
  output?: 'table' | 'json';
}

/**
 * Options for viewer update command
 */
export interface ViewerUpdateOptions {
  /** Viewer unique ID (required) */
  viewerUnionId: string;
  /** Viewer nickname */
  nickname?: string;
  /** Viewer mobile number */
  mobile?: string;
  /** Viewer real name */
  name?: string;
  /** Last collected mobile number */
  lastCollectMobile?: string;
  /** Viewer email */
  email?: string;
  /** Viewer area */
  area?: string;
  /** Latest access IP */
  latestAccessIp?: string;
  /** Device name */
  device?: string;
  /** Skip confirmation */
  force?: boolean;
  /** Output format: table or json */
  output?: 'table' | 'json';
}

/**
 * Options for viewer delete command
 */
export interface ViewerDeleteOptions {
  /** Viewer unique ID (required) */
  viewerUnionId: string;
  /** Skip confirmation */
  force?: boolean;
  /** Output format: table or json */
  output?: 'table' | 'json';
}

/**
 * Options for importing external viewers
 */
export interface ViewerImportExternalOptions {
  /** JSON array of viewer objects */
  viewers?: string;
  /** External viewer ID for single import */
  externalViewerId?: string;
  /** Viewer nickname for single import */
  nickname?: string;
  /** Comma-separated label IDs for single import */
  labelIds?: string;
  /** Follow user ID for single import */
  followUserId?: string;
  /** Follow user type for single import */
  followUserType?: string;
  /** Skip confirmation */
  force?: boolean;
  /** Output format: table or json */
  output?: 'table' | 'json';
}

/**
 * Options for viewer user system config update command
 */
export interface ViewerConfigUpdateOptions {
  /** Mobile login enabled switch */
  mobileLoginEnabled: 'Y' | 'N';
  /** WeCom login enabled switch */
  wxWorkLoginEnabled: 'Y' | 'N';
  /** WeChat auth expiry days */
  viewerWeixinAuthExpired?: number;
  /** Collect mobile switch */
  collectMobileEnabled?: 'Y' | 'N';
  /** Guest mode switch */
  guestModeEnabled?: 'Y' | 'N';
  /** External tourist link switch */
  touristExternalHrefEnabled?: 'Y' | 'N';
  /** External tourist link config JSON object */
  touristExternalHrefConfig?: string;
  /** Skip confirmation */
  force?: boolean;
  /** Output format: table or json */
  output?: 'table' | 'json';
}

/**
 * Options for viewer lottery wins command
 */
export interface ViewerLotteryWinsOptions {
  /** Viewer ID (required) */
  viewerId: string;
  /** Page number (default: 1) */
  page?: number;
  /** Page size (default: 10, max: 1000) */
  size?: number;
  /** Output format: table or json */
  output?: 'table' | 'json';
}

// ========================================
// Story 12-2: Viewer Tag Types
// ========================================

/**
 * Options for viewer tag add command
 */
export interface ViewerTagAddOptions {
  /** Comma-separated viewer IDs (required) */
  viewerIds: string;
  /** Comma-separated label IDs (required) */
  labelIds: string;
  /** Skip confirmation */
  force?: boolean;
  /** Output format: table or json */
  output?: 'table' | 'json';
}

/**
 * Options for viewer tag remove command
 */
export interface ViewerTagRemoveOptions {
  /** Comma-separated viewer IDs (required) */
  viewerIds: string;
  /** Comma-separated label IDs (required) */
  labelIds: string;
  /** Skip confirmation */
  force?: boolean;
  /** Output format: table or json */
  output?: 'table' | 'json';
}

/**
 * Options for viewer tag list command
 */
export interface ViewerTagListOptions {
  /** Keyword search for tag name */
  keyword?: string;
  /** Page number (default: 1) */
  page?: number;
  /** Page size (default: 10, max: 1000) */
  size?: number;
  /** Output format: table or json */
  output?: 'table' | 'json';
}

/**
 * Options for viewer tag create command
 */
export interface ViewerTagCreateOptions {
  /** Comma-separated tag names */
  labels: string;
  /** Skip confirmation */
  force?: boolean;
  /** Output format: table or json */
  output?: 'table' | 'json';
}

/**
 * Options for viewer tag update command
 */
export interface ViewerTagUpdateOptions {
  /** Viewer tag ID */
  id: number;
  /** New tag name */
  label?: string;
  /** Skip confirmation */
  force?: boolean;
  /** Output format: table or json */
  output?: 'table' | 'json';
}

/**
 * Options for viewer tag delete command
 */
export interface ViewerTagDeleteOptions {
  /** Viewer tag ID */
  id: number;
  /** Skip confirmation */
  force?: boolean;
  /** Output format: table or json */
  output?: 'table' | 'json';
}

/**
 * Options for account label list command
 */
export interface ViewerLabelListOptions {
  /** Page number (default: 1) */
  page?: number;
  /** Page size (default: 10, max: 1000) */
  size?: number;
  /** Output format: table or json */
  output?: 'table' | 'json';
}

/**
 * Options for account label create command
 */
export interface ViewerLabelCreateOptions {
  /** Account label name */
  labelName: string;
  /** Skip confirmation */
  force?: boolean;
  /** Output format: table or json */
  output?: 'table' | 'json';
}

/**
 * Options for account label update command
 */
export interface ViewerLabelUpdateOptions {
  /** Account label ID (string, e.g. "23e71q5gdp5ggr6d" from `viewer label list`) */
  labelId: string;
  /** Account label name */
  labelName: string;
  /** Skip confirmation */
  force?: boolean;
  /** Output format: table or json */
  output?: 'table' | 'json';
}

/**
 * Options for account label delete command
 */
export interface ViewerLabelDeleteOptions {
  /** Account label ID (string, e.g. "23e71q5gdp5ggr6d" from `viewer label list`) */
  labelId: string;
  /** Skip confirmation */
  force?: boolean;
  /** Output format: table or json */
  output?: 'table' | 'json';
}

/**
 * Options for channel-label refs add command
 */
export interface ViewerChannelLabelRefsOptions {
  /** Comma-separated channel IDs */
  channelIds: string;
  /** Comma-separated label IDs */
  labelIds: string;
  /** Skip confirmation */
  force?: boolean;
  /** Output format: table or json */
  output?: 'table' | 'json';
}
