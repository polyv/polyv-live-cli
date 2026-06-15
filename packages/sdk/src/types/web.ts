/**
 * Web Types
 *
 * TypeScript type definitions for Web Service APIs.
 *
 * @module types/web
 */

// ============================================
// Web Info API Types
// ============================================

/**
 * File type for Node.js/browser compatibility
 * In Node.js, this would typically be a Buffer or ReadStream
 */
type PolyVFile = Blob | Buffer | File;

/**
 * Splash screen settings response
 */
export interface GetSplashResponse {
  /** Splash image URL */
  splashImg: string;
  /** Splash enabled flag: Y or N */
  splashEnabled: string;
}

/**
 * Set splash parameters
 */
export interface SetSplashParams {
  /** Channel ID (required) */
  channelId: string;
  /** Enable splash screen: Y or N */
  splashEnabled: string;
  /** Image file (optional) */
  imgfile?: PolyVFile;
}

/**
 * Set publisher parameters
 */
export interface SetPublisherParams {
  /** User ID (in URL path) */
  userId: string;
  /** Publisher name (max 50 characters) */
  publisher: string;
  /** Channel ID (optional, -1 for all channels) */
  channelId?: string;
}

/**
 * Update channel name parameters
 */
export interface UpdateChannelNameParams {
  /** Channel ID */
  channelId: string;
  /** New channel name */
  name: string;
}

/**
 * Update channel logo parameters
 */
export interface UpdateChannelLogoParams {
  /** Channel ID */
  channelId: string;
  /** Image file (JPG, JPEG, PNG, max 2MB) */
  imgfile: PolyVFile;
}

/**
 * Channel likes info
 */
export interface ChannelLikes {
  /** Channel ID */
  channelId: string;
  /** Number of likes */
  likes: number;
  /** Number of viewers */
  viewers: number;
}

/**
 * Live likes response (array of channel likes)
 */
export type LiveLikesResponse = ChannelLikes[];

/**
 * Update likes parameters
 */
export interface UpdateLikesParams {
  /** Channel ID */
  channelId: string;
  /** Number of likes (optional) */
  likes?: number;
  /** Number of viewers (optional) */
  viewers?: number;
}

/**
 * Countdown settings
 */
export interface GetCountdownResponse {
  /** Booking enabled: Y or N */
  bookingEnabled: string;
  /** Countdown enabled: Y or N */
  countEnabled: string;
  /** Start time (format: yyyy-MM-dd HH:mm:ss) */
  startTime: string;
  /** End time (format: yyyy-MM-dd HH:mm:ss), can be null */
  endTime: string | null;
}

/**
 * Set countdown parameters
 */
export interface SetCountdownParams {
  /** Channel ID */
  channelId: string;
  /** Booking enabled: Y or N (optional) */
  bookingEnabled?: string;
  /** Start time (format: yyyy-MM-dd HH:mm:ss, (optional) */
  startTime?: string;
}

// ============================================
// Menu Management API Types
// ============================================

/**
 * Menu language types
 */
export type MenuLang = 'zh_CN' | 'EN';

/**
 * Menu types
 */
export type MenuType =
  | 'desc'      // Live introduction
  | 'chat'      // Interactive chat
  | 'quiz'      // Consulting/question
  | 'text'      // Text/image menu
  | 'iframe'    // External link promotion
  | 'qa'        // Q&A
  | 'buy'       // Product list
  | 'invite';   // Invitation leaderboard

/**
 * Iframe open types
 */
export type IframeOpenType = 'currentPage' | 'menuDisplay' | 'newPage';

/**
 * Link types for iframe menu
 */
export type LinkType = 10 | 11;

/**
 * Multi-platform link object for iframe menu
 */
export interface MultiPlatformLink {
  /** Jump way: NEW_WINDOW/CURRENT_WINDOW/POP_UP */
  jumpWay?: string;
  /** Generic link */
  link?: string;
  /** PC link */
  pcLink?: string;
  /** Mobile link */
  mobileLink?: string;
  /** WeChat mini program original ID */
  wxMiniprogramOriginalId?: string;
  /** WeChat mini program app ID */
  wxMiniprogramAppId?: string;
  /** WeChat mini program page path */
  wxMiniprogramLink?: string;
  /** Mobile app link */
  mobileAppLink?: string;
  /** iOS link */
  iosLink?: string;
  /** Android link */
  androidLink?: string;
  /** Other link */
  otherLink?: string;
}

/**
 * Menu item
 */
export interface MenuItem {
  /** Menu ID */
  menuId: string;
  /** Menu type */
  menuType: MenuType;
  /** Menu name */
  name: string;
  /** Order/rank */
  ordered: number;
  /** Menu content */
  content: string | null;
  /** Menu language */
  lang: MenuLang;
  /** Iframe open type (for iframe menu) */
  iframeOpenType?: IframeOpenType;
  /** Link type (for iframe menu) */
  linkType?: LinkType;
}

/**
 * Get menu list parameters
 */
export interface GetMenuListParams {
  /** Channel ID */
  channelId: string;
  /** Menu language (optional, defaults to zh_CN) */
  lang?: MenuLang;
}

/**
 * Get menu list response
 */
export type GetMenuListResponse = MenuItem[];

/**
 * Add menu parameters
 */
export interface AddMenuParams {
  /** Channel ID */
  channelId: string;
  /** Menu name */
  name: string;
  /** Menu type */
  type: MenuType;
  /** Menu content (optional) */
  content?: string;
  /** Menu language (optional, defaults to zh_CN) */
  lang?: MenuLang;
  /** Iframe open type (for iframe menu) */
  iframeOpenType?: IframeOpenType;
  /** Link type (for iframe menu) */
  linkType?: LinkType;
}

/**
 * Add menu response
 */
export interface AddMenuResponse {
  /** Menu ID */
  menuId: string;
  /** Menu type */
  menuType: MenuType;
  /** Menu name */
  name: string;
  /** Order/rank */
  ordered: number;
  /** Menu content */
  content: string;
  /** Menu language */
  lang: MenuLang;
}

/**
 * Delete menu parameters
 */
export interface DeleteMenuParams {
  /** Menu IDs (comma-separated for multiple) */
  menuIds: string;
  /** Menu language (optional, defaults to zh_CN) */
  lang?: MenuLang;
}

/**
 * Update menu parameters
 */
export interface UpdateMenuParams {
  /** Menu ID */
  menuId: string;
  /** Channel ID */
  channelId: string;
  /** Menu content */
  content: string;
  /** Menu language (optional, defaults to zh_CN) */
  lang?: MenuLang;
  /** Iframe open type (for iframe menu) */
  iframeOpenType?: IframeOpenType;
  /** Link type (for iframe menu) */
  linkType?: LinkType;
}

/**
 * Set menu parameters (for live introduction menu)
 */
export interface SetMenuParams {
  /** User ID */
  userId: string;
  /** Channel ID */
  channelId: string;
  /** Menu type (currently only 'desc') */
  menuType: 'desc';
  /** Menu content */
  content: string;
}

/**
 * Update menu rank parameters
 */
export interface UpdateRankParams {
  /** Channel ID */
  channelId: string;
  /** Menu IDs (complete list in desired order, comma-separated) */
  menuIds: string;
  /** Menu language (optional, defaults to zh_CN) */
  lang?: MenuLang;
}

/**
 * Update consulting enabled parameters
 */
export interface UpdateConsultingEnabledParams {
  /** Channel ID */
  channelId: string;
  /** Enable consulting: Y or N */
  enabled: string;
}

/**
 * Tuwen (image-text) content item
 */
export interface TuwenContentItem {
  /** Content ID */
  id: number;
  /** Channel ID */
  channelId: string;
  /** Text content */
  text: string;
  /** Image URLs */
  images: string[];
  /** Is pinned: Y or N */
  top: string;
  /** Created time (13-bit timestamp) */
  createdTime: number;
}

/**
 * Tuwen setting
 */
export interface TuwenSetting {
  /** Setting ID */
  id: number;
  /** Nickname */
  nickname: string;
  /** Actor title */
  actor: string;
  /** Avatar URL */
  avatar: string;
}

/**
 * Get tuwen list response
 */
export interface GetTuwenListResponse {
  /** Total count */
  total: number;
  /** Content items */
  contents: TuwenContentItem[];
  /** Pinned content items */
  topContents: TuwenContentItem[];
  /** Settings */
  setting: TuwenSetting;
}

/**
 * Get tuwen list parameters
 */
export interface GetTuwenListParams {
  /** Channel ID */
  channelId: string;
  /** Content ID for pagination (optional) */
  id?: number;
  /** Image mode: Y or N (optional, defaults to N) */
  imageMode?: string;
}

// ============================================
// Page Interaction API Types (Story 4.3)
// ============================================

/**
 * Donate goods item
 */
export interface DonateGoodsItem {
  /** Good name (max 5 characters) */
  goodName: string;
  /** Good image URL (max 120 characters) */
  goodImg: string;
  /** Good price */
  goodPrice: number;
  /** Good enabled flag: Y or N */
  goodEnabled: string;
}

/**
 * Get donate settings response
 */
export interface GetDonateResponse {
  /** Global setting enabled: Y or N */
  globalSettingEnabled: string;
  /** Donate cash enabled: Y or N */
  donateCashEnabled: string;
  /** Donate goods enabled: Y or N */
  donateGoodEnabled: string;
  /** Donate tips */
  donateTips: string;
  /** Minimum cash amount */
  cashMin: number;
  /** Cash amount options */
  cashes: number[];
  /** Goods list */
  goods: DonateGoodsItem[];
  /** Donate point enabled: Y or N */
  donatePointEnabled: string;
  /** Point unit */
  pointUnit: string;
}

/**
 * Get weixin share response
 */
export interface GetWeixinShareResponse {
  /** Channel ID */
  channelId: string;
  /** Channel name */
  channelName: string;
  /** Cover image URL */
  coverImg: string;
  /** WeChat share title */
  weixinShareTitle: string;
  /** WeChat share description */
  weixinShareDesc: string;
  /** WeChat share custom URL */
  weixinShareCustomUrl: string;
  /** Web share custom URL */
  webShareCustomUrl: string;
}

/**
 * Good item for update-good request
 */
export interface GoodItem {
  /** Good name (max 5 characters) */
  goodName: string;
  /** Good image URL (max 120 characters) */
  goodImg: string;
  /** Good price */
  goodPrice: number;
  /** Good enabled flag: Y or N */
  goodEnabled: string;
}

/**
 * Update cash parameters
 */
export interface UpdateCashParams {
  /** Channel ID (optional, null = global setting) */
  channelId?: string;
  /** Cash amount options (array of 6 numbers, required) */
  cashes: number[];
  /** Minimum cash amount (required) */
  cashMin: number;
  /** Enabled flag: Y or N (optional, defaults to Y) */
  enabled?: string;
}

/**
 * Update good parameters
 */
export interface UpdateGoodParams {
  /** Channel ID (optional) */
  channelId?: string;
  /** Goods list (1-10 items) */
  goods: GoodItem[];
  /** Enabled flag: Y or N (optional) */
  enabled?: string;
}

/**
 * Update weixin share parameters
 */
export interface UpdateWeixinShareParams {
  /** Channel ID (required) */
  channelId: string;
  /** WeChat share title (max 30 characters, optional) */
  weixinShareTitle?: string;
  /** WeChat share description (max 120 characters, optional) */
  weixinShareDesc?: string;
}

// ============================================
// Setting API Types (Story 4.3)
// ============================================

/**
 * Global enabled type
 * Determines which setting to enable/disable
 */
export type GlobalEnabledType =
  | 'auth'       // 观看条件设置
  | 'switch'     // 功能开关设置
  | 'marquee'    // 跑马灯设置
  | 'restrict'   // 播放限制设置
  | 'donate'     // 打赏设置
  | 'advert'     // 广告设置
  | 'callback'   // 回调设置
  | 'player'     // 播放器设置
  | 'watchtheme'; // 观看页的皮肤设置

/**
 * Update global enabled parameters
 */
export interface UpdateGlobalEnabledParams {
  /** Channel ID (required) */
  channelId: string;
  /** Global enabled type */
  globalEnabledType: GlobalEnabledType;
  /** Enabled flag: Y or N (required) */
  enabled: string;
}

/**
 * Upload image type
 * Determines which type of image is being uploaded
 */
export type UploadImageType =
  | 'coverImage'
  | 'splashImage'
  | 'logoImage'
  | 'adminAvatar'
  | 'assistantAvatar'
  | 'authCodeImage'
  | 'warmImage'
  | 'adImage'
  | 'startAdImage'
  | 'stopAdImage'
  | 'goodImage'
  | 'invitationImage'
  | 'menuImage';

/**
 * Upload image parameters
 */
export interface UploadImageParams {
  /** Image type */
  type: UploadImageType;
  /** Files to upload (1-6 files) */
  files: PolyVFile[];
}

/**
 * Upload image response (array of image URLs)
 */
export type UploadImageResponse = string[];

// ============================================
// Watch Condition API Types (Story 4.5)
// ============================================

/**
 * Auth type for watch conditions
 */
export type AuthType =
  | 'none'      // 无限制
  | 'code'      // 密码观看
  | 'pay'       // 付费观看
  | 'phone'     // 白名单观看
  | 'info'      // 登记观看
  | 'wxshare'   // 分享观看
  | 'custom'    // 自定义授权观看
  | 'external'  // 外部授权观看
  | 'direct'    // 独立授权
  | 'public'    // 公开观看 (authType=none时subAuthType)
  | 'wx';       // 微信授权 (authType=none时subAuthType)

/**
 * Sub auth type (used when authType is 'none')
 */
export type SubAuthType = 'public' | 'wx';

/**
 * Info field type for registration watching
 */
export type InfoFieldType = 'text' | 'number' | 'option' | 'name' | 'mobile';

/**
 * Info field for registration watching
 */
export interface InfoField {
  /** Field type */
  type: InfoFieldType;
  /** Field name/label */
  name: string;
  /** Options (for type 'option') */
  options?: string;
  /** Placeholder text */
  placeholder?: string;
  /** SMS verification enabled: Y or N */
  sms?: string;
}

/**
 * Auth setting for set-watch-condition request
 */
export interface AuthSetting {
  /** Rank: 1 (primary) or 2 (secondary) */
  rank: 1 | 2;
  /** Auth type */
  authType?: AuthType;
  /** Enabled: Y or N */
  enabled?: 'Y' | 'N';
  /** Password (for authType 'code') - API field name is authCode */
  authCode?: string;
  /** Price in cents (for authType 'pay') */
  payAmount?: number;
  /** Info fields (for authType 'info') */
  infoFields?: InfoField[];
  /** Sub auth type (for authType 'none') */
  subAuthType?: SubAuthType;
  /** External key (for authType 'external') */
  externalKey?: string;
  /** External URI (for authType 'external') */
  externalUri?: string;
  /** External redirect URI (for authType 'external') */
  externalRedirectUri?: string;
  /** External button enabled: Y or N */
  externalButtonEnabled?: 'Y' | 'N';
  /** Custom key (for authType 'custom') */
  customKey?: string;
  /** Custom URI (for authType 'custom') */
  customUri?: string;
  /** Direct key (for authType 'direct') */
  directKey?: string;
}

/**
 * Watch condition response
 */
export interface WatchConditionResponse {
  /** Channel ID */
  channelId: string;
  /** Auth type */
  authType: AuthType;
  /** Sub auth type */
  subAuthType?: SubAuthType;
  /** Whether watch condition is enabled: Y or N */
  enabled?: string;
  /** Password (for authType 'code') */
  code?: string;
  /** Price in cents (for authType 'pay') */
  payAmount?: number;
  /** Info fields (for authType 'info') */
  infoFields?: InfoField[];
  /** External key (for authType 'external') */
  externalKey?: string;
  /** External URI (for authType 'external') */
  externalUri?: string;
  /** External redirect URI */
  externalRedirectUri?: string;
  /** External button enabled: Y or N */
  externalButtonEnabled?: string;
  /** Custom key (for authType 'custom') */
  customKey?: string;
  /** Custom URI (for authType 'custom') */
  customUri?: string;
  /** Direct key (for authType 'direct') */
  directKey?: string;
  /** Auth URL */
  authUrl?: string;
  /** Authorized addresses */
  authAddresses?: string;
}

/**
 * Get watch condition parameters
 */
export interface GetWatchConditionParams {
  /** Channel ID (optional, omit for global settings) */
  channelId?: string;
}

/**
 * Set watch condition parameters
 */
export interface SetWatchConditionParams {
  /** Channel ID (optional, omit for global settings) */
  channelId?: string;
  /** Auth settings array */
  authSettings: AuthSetting[];
}

/**
 * Set auth type parameters
 */
export interface SetAuthTypeParams {
  /** Channel ID (required) */
  channelId: string;
  /** Auth type */
  authType: 'none';
}

/**
 * White list item
 */
export interface WhiteListItem {
  /** Name */
  name: string;
  /** Phone number */
  phone: string;
}

/**
 * Get white list parameters
 */
export interface GetWhiteListParams {
  /** Rank: 1 (primary) or 2 (secondary) */
  rank: 1 | 2;
  /** Channel ID (optional, omit for global settings) */
  channelId?: string;
  /** Page number (optional, default 1) */
  page?: number;
  /** Page size (optional, default 10) */
  pageSize?: number;
  /** Search keyword (optional) */
  keyword?: string;
}

/**
 * Get white list response
 */
export interface GetWhiteListResponse {
  /** Current page number */
  pageNumber: number;
  /** Total pages */
  totalPages: number;
  /** Page size */
  pageSize: number;
  /** White list contents */
  contents: WhiteListItem[];
}

/**
 * Add white list parameters
 */
export interface AddWhiteListParams {
  /** Rank: 1 (primary) or 2 (secondary) */
  rank: 1 | 2;
  /** Phone number/code (required, max 50 characters) */
  code: string;
  /** Name (optional, max 50 characters) */
  name?: string;
  /** Channel ID (optional, omit for global settings) */
  channelId?: string;
}

/**
 * Update white list parameters
 */
export interface UpdateWhiteListParams {
  /** Rank: 1 (primary) or 2 (secondary) */
  rank: 1 | 2;
  /** Old phone number/code (required, used to identify the record to update) */
  oldCode: string;
  /** New phone number/code (required, max 50 characters) */
  code: string;
  /** Name (optional, max 50 characters) */
  name?: string;
  /** Channel ID (optional, omit for global settings) */
  channelId?: string;
}

/**
 * Delete white list parameters
 */
export interface DeleteWhiteListParams {
  /** Rank: 1 (primary) or 2 (secondary) */
  rank: 1 | 2;
  /** Whether to clear all: Y = clear all, N = delete by code (required) */
  isClear: 'Y' | 'N';
  /** Phone numbers/codes to delete (comma-separated, required when isClear=N) */
  codes?: string;
  /** Channel ID (optional, omit for global settings) */
  channelId?: string;
}

/**
 * Upload white list parameters
 */
export interface UploadWhiteListParams {
  /** Rank: 1 (primary) or 2 (secondary) */
  rank: 1 | 2;
  /** Excel file (from template) */
  file: PolyVFile;
  /** Channel ID (optional, omit for global settings) */
  channelId?: string;
}

/**
 * Download white list parameters
 */
export interface DownloadWhiteListParams {
  /** Rank: 1 (primary) or 2 (secondary) */
  rank: 1 | 2;
  /** Channel ID (optional, omit for global settings) */
  channelId?: string;
}

/**
 * Set external auth parameters
 */
export interface SetExternalAuthParams {
  /** Channel ID (required) */
  channelId: string;
  /** External key (optional) */
  externalKey?: string;
  /** External URI (optional) */
  externalUri?: string;
  /** External redirect URI (optional) */
  externalRedirectUri?: string;
  /** External button enabled: Y or N (optional) */
  externalButtonEnabled?: 'Y' | 'N';
}

/**
 * Set custom auth parameters
 */
export interface SetCustomAuthParams {
  /** Channel ID (required) */
  channelId: string;
  /** Custom key (optional) */
  customKey?: string;
  /** Custom URI (optional) */
  customUri?: string;
}

/**
 * Set direct auth parameters
 */
export interface SetDirectAuthParams {
  /** Channel ID (required) */
  channelId: string;
  /** Direct key (optional) */
  directKey?: string;
}

/**
 * Direct auth parameters
 */
export interface DirectAuthParams {
  /** Channel ID (required) */
  channelId: string;
}

/**
 * Direct auth response
 */
export interface DirectAuthResponse {
  /** Direct key */
  directKey: string;
}

/**
 * Get record field parameters
 */
export interface GetRecordFieldParams {
  /** Channel ID (required) */
  channelId: string;
}

/**
 * Record field response
 */
export interface RecordFieldResponse {
  /** Info fields */
  infoFields: InfoField[];
}

/**
 * Get record info parameters
 */
export interface GetRecordInfoParams {
  /** Channel ID (required) */
  channelId: string;
}

/**
 * Record info item
 */
export interface RecordInfoItem {
  /** Record ID */
  id: number;
  /** Name */
  name: string;
  /** Phone */
  phone: string;
  /** Custom fields data */
  [key: string]: unknown;
}

/**
 * Record info response
 */
export interface RecordInfoResponse {
  /** Total count */
  total: number;
  /** Record info items */
  contents: RecordInfoItem[];
}

/**
 * Enroll list parameters
 */
export interface EnrollListParams {
  /** Channel ID (required) */
  channelId: string;
  /** Page number (optional, default 1) */
  page?: number;
  /** Page size (optional, default 10) */
  pageSize?: number;
}

/**
 * Enroll item
 */
export interface EnrollItem {
  /** Enroll ID */
  id: number;
  /** User ID */
  userId: string;
  /** Nickname */
  nickname: string;
  /** Avatar */
  avatar: string;
  /** Enroll time (13-bit timestamp) */
  createdTime: number;
  /** Custom fields data */
  [key: string]: unknown;
}

/**
 * Enroll list response
 */
export interface EnrollListResponse {
  /** Total count */
  total: number;
  /** Current page */
  pageNumber: number;
  /** Total pages */
  totalPages: number;
  /** Page size */
  pageSize: number;
  /** Enroll items */
  contents: EnrollItem[];
}

/**
 * Download record info parameters
 */
export interface DownloadRecordInfoParams {
  /** Channel ID (required) */
  channelId: string;
}

/**
 * Update auth URL parameters
 */
export interface UpdateAuthUrlParams {
  /** Channel ID (required) */
  channelId: string;
  /** Auth URL (optional) */
  authUrl?: string;
}

/**
 * Set authorized address parameters
 */
export interface SetAuthorizedAddressParams {
  /** Channel ID (required) */
  channelId: string;
  /** Authorized addresses (comma-separated, optional) */
  authAddresses?: string;
}

/**
 * Custom auth info response (customauth2)
 */
export interface CustomAuthInfoResponse {
  /** Custom key */
  customKey: string;
  /** Custom URI */
  customUri: string;
}

/**
 * PolyV URL response
 */
export interface PolyvUrlResponse {
  /** PolyV auth URL */
  url: string;
}
