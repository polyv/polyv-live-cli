/**
 * @fileoverview Channel-related TypeScript types and interfaces
 * @author Development Team
 * @since 2.1.0
 */

/**
 * Channel creation request interface for PolyV API
 */
export interface ChannelCreateRequest {
  /** Channel name (required, max 100 characters) */
  name: string;
  /** Live scene type (V4 API: topclass/alone/seminar/train/double/guide) */
  newScene: 'topclass' | 'alone' | 'seminar' | 'train' | 'double' | 'guide';
  /** Channel template (V4 API: ppt/portrait_ppt/alone/portrait_alone/topclass/portrait_topclass/seminar) */
  template: 'ppt' | 'portrait_ppt' | 'alone' | 'portrait_alone' | 'topclass' | 'portrait_topclass' | 'seminar';
  /** Channel password (optional, 6-16 alphanumeric characters) */
  channelPasswd?: string;
  /** Enable pure RTC (optional) */
  pureRtcEnabled?: boolean;
  /** Link mic limit (optional) */
  linkMicLimit?: number;
  /** Category ID (optional) */
  categoryId?: string;
  /** Start time (optional, timestamp) */
  startTime?: number;
  /** End time (optional, timestamp) */
  endTime?: number;
}

/**
 * Channel creation response from PolyV API
 */
export interface ChannelCreateResponse {
  /** Response code */
  code: number;
  /** Response status */
  status: 'success' | 'error';
  /** Response message */
  message: string;
  /** Response data */
  data: {
    /** Created channel ID */
    channelId: string;
    /** User ID */
    userId: string;
    /** Channel password */
    channelPasswd: string;
    /** Additional channel properties */
    [key: string]: any;
  };
}

/**
 * Internal channel model representation
 */
export interface ChannelModel {
  /** Channel ID */
  channelId: string;
  /** Channel name */
  name: string;
  /** User ID */
  userId: string;
  /** Channel password */
  channelPasswd: string;
  /** Live scene type */
  newScene: string;
  /** Channel template */
  template: string;
  /** Channel status */
  status?: 'live' | 'waiting' | 'end' | 'unStart';
  /** Channel description */
  description?: string;
  /** Maximum viewers */
  maxViewers?: number;
  /** Auto record setting */
  autoRecord?: boolean;
  /** Creation timestamp */
  createdAt?: Date;
  /** Update timestamp */
  updatedAt?: Date;
}

/**
 * Channel creation command options from CLI
 */
export interface ChannelCreateOptions {
  /** Channel name (required) */
  name: string;
  /** Channel description (optional) */
  description?: string;
  /** Maximum viewers (optional) */
  maxViewers?: number;
  /** Auto record setting (optional) */
  autoRecord?: boolean;
  /** Output format (optional) */
  output?: 'table' | 'json';
  /** Live scene type (V4 API: topclass/alone/seminar/train/double/guide) */
  scene?: 'topclass' | 'alone' | 'seminar' | 'train' | 'double' | 'guide';
  /** Channel template (V4 API: ppt/portrait_ppt/alone/portrait_alone/topclass/portrait_topclass/seminar) */
  template?: 'ppt' | 'portrait_ppt' | 'alone' | 'portrait_alone' | 'topclass' | 'portrait_topclass' | 'seminar';
  /** Channel password (optional) */
  password?: string;
}

/**
 * Channel validation error details
 */
export interface ChannelValidationError {
  /** Field name that failed validation */
  field: string;
  /** Error message */
  message: string;
  /** Invalid value */
  value: any;
  /** Validation rule that failed */
  rule: 'required' | 'max_length' | 'min_length' | 'pattern' | 'enum' | 'type';
}

/**
 * Channel service configuration
 */
export interface ChannelServiceConfig {
  /** API base URL */
  baseUrl: string;
  /** Request timeout in milliseconds */
  timeout: number;
  /** Maximum retry attempts */
  maxRetries: number;
  /** Debug mode */
  debug: boolean;
}

/**
 * Channel list request interface for PolyV API
 */
export interface ChannelListRequest {
  /** Page number (minimum 1, default 1) */
  page?: number;
  /** Number of items per page (1-100, default 20) */
  limit?: number;
  /** Category ID filter (optional) */
  categoryId?: string;
  /** Channel name keyword search (optional) */
  keyword?: string;
  /** Label ID filter (optional) */
  labelId?: string;
}

/**
 * Channel list response from PolyV API
 */
export interface ChannelListResponse {
  /** Response code */
  code: number;
  /** Response status */
  status: 'success' | 'error';
  /** Response message */
  message: string;
  /** Response data */
  data: {
    /** Array of channel IDs */
    channels: string[];
    /** Total number of channels */
    total?: number;
    /** Current page number */
    page?: number;
    /** Items per page */
    limit?: number;
  };
}

/**
 * Channel list item representation for display
 */
export interface ChannelListItem {
  /** Channel ID */
  channelId: string;
  /** Channel name */
  name: string;
  /** Channel status */
  status: 'live' | 'waiting' | 'end' | 'unStart';
  /** Creation time */
  createdAt: Date;
  /** Live scene type */
  scene: string;
  /** Channel template */
  template: string;
  /** Channel description */
  description?: string;
  /** Maximum viewers */
  maxViewers?: number;
}

/**
 * Channel list command options from CLI
 */
export interface ChannelListOptions {
  /** Page number (optional, default 1) */
  page?: number;
  /** Items per page (optional, default 20) */
  limit?: number;
  /** Output format (optional, default 'table') */
  output?: 'table' | 'json';
  /** Category ID filter (optional) */
  categoryId?: string;
  /** Channel name keyword search (optional) */
  keyword?: string;
  /** Label ID filter (optional) */
  labelId?: string;
}

/**
 * Channel detail request interface for PolyV API
 */
export interface ChannelDetailRequest {
  /** Channel ID (required) */
  channelId: string;
}

/**
 * User category information
 */
export interface UserCategory {
  /** Category ID */
  categoryId: number;
  /** Category name */
  categoryName: string;
  /** User ID */
  userId: string;
  /** Category rank */
  rank: number;
}

/**
 * Label data information
 */
export interface LabelData {
  /** Label ID */
  id: string;
}

/**
 * Authentication settings for channel viewing
 */
export interface AuthSettings {
  /** Channel ID */
  channelId: number;
  /** User ID */
  userId: string;
  /** Rank (1 for primary, 2 for secondary) */
  rank: number;
  /** Global setting enabled */
  globalSettingEnabled: 'Y' | 'N';
  /** Setting enabled */
  enabled: 'Y' | 'N';
  /** Authentication type */
  authType: 'none' | 'code' | 'pay' | 'phone' | 'info' | 'wxshare' | 'custom' | 'external' | 'direct';
  /** Auth tips */
  authTips: string;
  /** Pay auth tips */
  payAuthTips: string;
  /** Code auth tips */
  codeAuthTips: string;
  /** Info auth tips */
  infoAuthTips: string;
  /** Auth code */
  authCode: string;
  /** QR code tips */
  qcodeTips: string;
  /** QR code image */
  qcodeImg: string;
  /** Price for paid viewing */
  price: number;
  /** Watch end time */
  watchEndTime: number | null;
  /** Valid time period */
  validTimePeriod: number | null;
  /** Custom key */
  customKey: string;
  /** Custom URI */
  customUri: string;
  /** External key */
  externalKey: string;
  /** External URI */
  externalUri: string;
  /** External redirect URI */
  externalRedirectUri: string;
  /** Direct key */
  directKey: string;
  /** Trial watch enabled */
  trialWatchEnabled: 'Y' | 'N';
  /** Trial watch time */
  trialWatchTime: number | null;
  /** Trial watch end time */
  trialWatchEndTime: number | null;
  /** White list input tips */
  whiteListInputTips: string;
  /** White list entry text */
  whiteListEntryText: string;
  /** Info description */
  infoDesc: string;
  /** Custom teacher ID */
  customTeacherId?: string;
  /** Expected arrival enabled */
  expectedArrivalEnabled?: 'Y' | 'N';
}

/**
 * Complete channel detail model for API response
 */
export interface ChannelDetailModel {
  /** Channel ID */
  channelId: number;
  /** Channel name */
  name: string;
  /** Scene (legacy) */
  scene: string;
  /** New scene */
  newScene: string;
  /** Template */
  template: string;
  /** Channel password */
  channelPasswd: string;
  /** Publisher name */
  publisher: string;
  /** Start time timestamp */
  startTime: number;
  /** End time timestamp */
  endTime: number;
  /** Pure RTC enabled */
  pureRtcEnabled?: 'Y' | 'N';
  /** Page view count */
  pageView: number;
  /** Likes count */
  likes: number;
  /** Cover image URL */
  coverImg: string;
  /** Splash image URL */
  splashImg: string;
  /** Splash enabled */
  splashEnabled: 'Y' | 'N';
  /** Background image URL */
  bgImg: string | null;
  /** Description */
  desc: string;
  /** Consulting menu enabled */
  consultingMenuEnabled: 'Y' | 'N';
  /** Max viewer restrict */
  maxViewerRestrict: 'Y' | 'N';
  /** Max viewer count */
  maxViewer: number;
  /** Watch status */
  watchStatus: 'live' | 'playback' | 'end' | 'waiting' | 'unStart' | 'banpush';
  /** Watch status text */
  watchStatusText: string;
  /** User category */
  userCategory: UserCategory;
  /** Authentication settings */
  authSettings: AuthSettings[];
  /** Link mic limit */
  linkMicLimit: number;
  /** Created account ID */
  createdAccountId: string;
  /** Created account email */
  createdAccountEmail: string;
  /** Created time timestamp */
  createdTime: number;
  /** Label data */
  labelData: string[];
  /** Client alone template background URL */
  clientAloneTemplateBackgroundUrl?: string;
  /** Live CDN background URL */
  liveCdnBackgroundUrl?: string;
  /** Push URL */
  pushUrl?: string;
  /** Push secret */
  pushSecret?: string;
  /** Stream type */
  streamType?: string;
  /** Only out enabled */
  onlyOutEnabled?: 'Y' | 'N';
}

/**
 * Channel detail response from PolyV API
 */
export interface ChannelDetailResponse {
  /** Response code */
  code: number;
  /** Response status */
  status: 'success' | 'error';
  /** Response message */
  message?: string;
  /** Request ID */
  requestId?: string;
  /** Success flag */
  success: boolean;
  /** Response data */
  data: ChannelDetailModel;
  /** Error information */
  error?: {
    code: number;
    desc: string;
  };
}

/**
 * Channel get command options from CLI
 */
export interface ChannelGetOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Output format (optional, default 'table') */
  output?: 'table' | 'json';
}

/**
 * Basic settings for channel update
 */
export interface BasicSetting {
  /** Channel name (optional, max 100 characters) */
  name?: string;
  /** Channel password (optional, 6-16 alphanumeric characters) */
  channelPasswd?: string;
  /** Publisher name (optional) */
  publisher?: string;
  /** Live description (optional, max 500 characters) */
  desc?: string;
  /** Live start time (optional, 13-digit timestamp) */
  startTime?: number;
  /** Live end time (optional, 13-digit timestamp) */
  endTime?: number;
  /** Accumulated view count (optional, non-negative integer) */
  pageView?: number;
  /** Like count (optional, non-negative integer) */
  likes?: number;
  /** Maximum viewers (optional, positive integer) */
  maxViewer?: number;
  /** Maximum viewer restriction (optional, Y/N) */
  maxViewerRestrict?: 'Y' | 'N';
  /** Close danmu (optional, Y/N) */
  closeDanmu?: 'Y' | 'N';
  /** Cover image URL (optional) */
  coverImg?: string;
  /** Splash image URL (optional) */
  splashImg?: string;
}

/**
 * Channel update request interface for PolyV API
 */
export interface ChannelUpdateRequest {
  /** Channel ID (required) */
  channelId: string;
  /** Basic settings (optional) */
  basicSetting?: BasicSetting;
  /** Authentication settings (optional) */
  authSettings?: AuthSettings[];
}

/**
 * Channel update command options from CLI
 */
export interface ChannelUpdateOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Channel name (optional, max 100 characters) */
  name?: string;
  /** Channel description (optional, max 500 characters) */
  description?: string;
  /** Publisher name (optional) */
  publisher?: string;
  /** Channel password (optional, 6-16 alphanumeric characters) */
  password?: string;
  /** Maximum viewers (optional, positive integer) */
  maxViewers?: number;
  /** Auto record setting (optional) */
  autoRecord?: boolean;
  /** Start time (optional, timestamp) */
  startTime?: number;
  /** End time (optional, timestamp) */
  endTime?: number;
  /** Page view count (optional, non-negative integer) */
  pageView?: number;
  /** Likes count (optional, non-negative integer) */
  likes?: number;
  /** Cover image URL (optional) */
  coverImg?: string;
  /** Splash image URL (optional) */
  splashImg?: string;
  /** Output format (optional, default 'table') */
  output?: 'table' | 'json';
}

/**
 * Channel update response from PolyV API (V3 format)
 */
export interface ChannelUpdateResponse {
  /** Response code */
  code: number;
  /** Response status */
  status: 'success' | 'error';
  /** Response message */
  message?: string;
  /** Request ID */
  requestId?: string;
  /** Success flag */
  success: boolean;
  /** Response data (empty string on success for V3 API) */
  data: string | null;
  /** Error information */
  error?: {
    code: number;
    desc: string;
  };
}

/**
 * Channel delete request interface for PolyV API
 */
export interface ChannelDeleteRequest {
  /** Array of channel IDs to delete (max 100 channels) */
  channelIds: string[];
}

/**
 * Channel delete response from PolyV API
 */
export interface ChannelDeleteResponse {
  /** Response code */
  code: number;
  /** Response status */
  status: 'success' | 'error';
  /** Response message */
  message?: string;
  /** Success flag - true on success, empty string on failure */
  data: boolean | string;
}

/**
 * Channel delete command options from CLI
 */
export interface ChannelDeleteOptions {
  /** Channel ID to delete (single channel) */
  channelId: string;
  /** Force delete without confirmation */
  force?: boolean;
  /** Output format (optional, default 'table') */
  output?: 'table' | 'json';
}

/**
 * User confirmation response interface
 */
export interface ConfirmationResponse {
  /** Whether user confirmed the action */
  confirmed: boolean;
  /** User input value */
  input?: string;
}

/**
 * Channel batch delete request (legacy interface for backwards compatibility)
 */
export interface ChannelBatchDeleteRequest extends ChannelDeleteRequest {}

/**
 * Channel batch delete response (legacy interface for backwards compatibility)
 */
export interface ChannelBatchDeleteResponse extends ChannelDeleteResponse {}