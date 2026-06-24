/**
 * Account Service Types
 *
 * Types for the AccountService APIs (Epic 4, Story 4.1)
 * Includes: Category Management, User Info, Channel List, Statistics, Switch Config, Callback Settings, Token Management
 */

// ============================================
// AC1: Category Management Types
// ============================================

export interface Category {
  categoryId: number;
  categoryName: string;
  userId: string;
  rank: number;
}

export interface GetCategoryListResponse {
  categories: Category[];
}

export interface CreateCategoryParams {
  categoryName: string;
}

export interface CreateCategoryResponse {
  categoryId: number;
  categoryName: string;
  userId: string;
  rank: number;
}

export interface DeleteCategoryParams {
  categoryId: number;
}

export interface DeleteCategoryResponse {
  success: boolean;
}

export interface UpdateCategoryNameParams {
  categoryId: number;
  categoryName: string;
}

export interface UpdateCategoryNameResponse {
  success: boolean;
}

export interface UpdateCategoryRankParams {
  categoryId: number;
  /** Move the category to AFTER this category ID (PolyV update-rank contract). */
  afterCategoryId: number;
}

export interface UpdateCategoryRankResponse {
  success: boolean;
}

// ============================================
// AC2: User Info Types
// ============================================

export interface GetUserInfoResponse {
  userId: string;
  email: string;
  maxChannels: number;
  totalChannels: number;
  availableChannels: number;
  linkMicLimit: number;
  watchDomain?: string;
}

// ============================================
// AC3: Channel List Types
// ============================================

export type AccountYnFlag = 'Y' | 'N';

export type ChannelWatchStatus = 'live' | 'playback' | 'end' | 'waiting' | string;

export interface AccountPaginatedResponse<T> {
  pageSize: number;
  pageNumber: number;
  totalItems: number;
  contents: T[];
  startRow?: number;
  firstPage?: boolean;
  lastPage?: boolean;
  prePageNumber?: number;
  limit?: number;
  nextPageNumber?: number;
  endRow?: number;
  totalPages?: number;
  offset?: number;
}

export interface ChannelsParams {
  /** Category ID. */
  categoryId?: string | number;
  /** Channel name keyword. */
  keyword?: string;
  /** Label ID. */
  labelId?: string;
  /**
   * Deprecated compatibility fields from older SDK builds.
   * The source account/channels API does not document pagination.
   */
  page?: number;
  pageSize?: number;
}

export interface ChannelListItem {
  channelId: string;
  name: string;
  scene?: string;
  status?: string;
  coverImage?: string;
  watchUrl?: string;
  createdTime?: number;
  startTime?: number | null;
  lastStartTime?: number | null;
  categoryId?: string;
  categoryName?: string;
}

export interface ChannelsResponse {
  channels: Array<string | number>;
}

export interface ChannelDetailParams {
  channelId: string;
}

export interface ChannelDetail {
  channelId: string;
  name: string;
  scene: string;
  coverImage: string;
  coverImg: string;
  watchUrl: string;
  channelId1: string;
  streamAddress: string;
  pushAddress: string;
  pushAddressKey: string;
  authKeys: {
    push: string;
    pull: string;
  };
  status: string;
  categoryId: string;
  categoryName: string;
  createdTime: number;
  startTime: number | null;
  lastStartTime: number | null;
  channelPasswd: string;
  content: string;
}

export interface ChannelDetailResponse {
  channel: ChannelDetail;
}

export interface GetSimpleChannelListParams {
  page?: number;
  pageSize?: number;
  categoryId?: string | number;
  watchStatus?: ChannelWatchStatus;
  keyword?: string;
}

export interface ChannelDetailListParams {
  page?: number;
  pageSize?: number;
  categoryId?: string | number;
  watchStatus?: ChannelWatchStatus;
  keyword?: string;
}

export interface ChannelAuthSetting {
  channelId: string | number;
  rank: number;
  userId: string;
  globalSettingEnabled: AccountYnFlag;
  enabled: AccountYnFlag;
  authType: string;
  payAuthTips?: string | null;
  price?: number | null;
  watchEndTime?: number | null;
  validTimePeriod?: number | null;
  infoAuthTips?: string | null;
  infoDesc?: string | null;
  codeAuthTips?: string | null;
  authCode?: string | null;
  qcodeTips?: string | null;
  qcodeImg?: string | null;
  customKey?: string | null;
  customUri?: string | null;
  externalKey?: string | null;
  externalUri?: string | null;
  externalRedirectUri?: string | null;
  directKey?: string | null;
  trialWatchEnabled?: AccountYnFlag;
  trialWatchTime?: number | null;
  trialWatchEndTime?: number | null;
  authTips?: string | null;
  whiteListInputTips?: string | null;
  whiteListEntryText?: string | null;
  [key: string]: unknown;
}

export interface ChannelManagementDetail {
  channelId: string | number;
  name: string;
  channelPasswd?: string;
  categoryId?: string | number;
  scene?: string;
  watchStatus?: string;
  watchStatusText?: string;
  sceneText?: string;
  watchUrl?: string;
  content?: string;
  startTime?: number;
  channelLogo?: string;
  splashImg?: string;
  splashEnabled?: AccountYnFlag;
  publisher?: string;
  authSetting?: ChannelAuthSetting[];
  [key: string]: unknown;
}

export type ChannelDetailListResponse = AccountPaginatedResponse<ChannelManagementDetail>;

export interface SimpleChannel {
  channelId: string | number;
  name: string;
  channelPasswd?: string;
  categoryId?: string | number;
  scene?: string;
  watchStatus?: string;
  watchStatusText?: string;
  sceneText?: string;
  watchUrl?: string;
  [key: string]: unknown;
}

export type GetSimpleChannelListResponse = AccountPaginatedResponse<SimpleChannel>;

export interface UserChannelBasicListParams {
  /** Category IDs, either comma-separated or an array to be joined by comma. */
  categoryIds?: string | number | Array<string | number>;
  page?: number;
  pageSize?: number;
  /** Deprecated compatibility field from older SDK builds. */
  keyword?: string;
}

export interface ChannelBasicVideo {
  videoId: string;
  videoPoolId: string;
}

export interface ChannelBasicItem {
  channelId: string | number;
  name: string;
  publisher?: string;
  startTime?: number;
  pageView?: number;
  likes?: number;
  coverImg?: string;
  splashImg?: string;
  splashEnabled?: AccountYnFlag;
  desc?: string;
  maxViewer?: number;
  watchStatus?: string;
  watchStatusText?: string;
  onlineNum?: number;
  bgImg?: string | null;
  videoList?: ChannelBasicVideo[] | null;
  categoryId?: string | number;
  [key: string]: unknown;
}

export type UserChannelBasicListResponse = AccountPaginatedResponse<ChannelBasicItem>;

export interface UserPlaybackListParams {
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  keyword?: string;
}

export interface PlaybackItem {
  videoId: string;
  title: string;
  channelId: string;
  channelName: string;
  startTime: number;
  duration: number;
  coverImage: string;
  status: string;
}

export interface UserPlaybackListResponse {
  contents: PlaybackItem[];
  total: number;
}

// ============================================
// AC4: Statistics Types
// ============================================

export interface ReceiveListParams {
  channelId: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export interface ReceiveItem {
  channelId: string | number;
  name: string;
  channelPasswd?: string | null;
  hostPasswd?: string | null;
  attendeePasswd?: string | null;
  categoryName?: string;
  authType?: string;
  status?: number;
  recentViewCount?: number;
  subChannelAccount?: string | null;
  subChannelPasswd?: string | null;
  watchUrl?: string | null;
  watchQRCodeUrl?: string | null;
  scene?: string;
  type?: string;
  startTime?: string | null;
  guest?: string | null;
  pureRtcEnabled?: AccountYnFlag;
  transmitType?: string;
  multipleRoom?: unknown;
  creatorChildId?: string | null;
  creatorName?: string | null;
  rtcType?: string;
  transmitChannelId?: string | null;
  [key: string]: unknown;
}

export type ReceiveListResponse = AccountPaginatedResponse<ReceiveItem>;

export interface GetIncomeDetailParams {
  /** Live account user ID used in the URL path. */
  userId: string;
  /** Query start date in yyyy-MM-dd format. */
  startDate: string;
  /** Query end date in yyyy-MM-dd format. */
  endDate: string;
  /** Channel ID. Omit or pass 0 to query all channels. */
  channelId?: string | number;
  page?: number;
  pageSize?: number;
}

export interface IncomeDetailItem {
  userId: string;
  amount: number;
  goodNum?: number | null;
  channelId?: string | number;
  payType: string;
  payTypeName: string;
  viewerName?: string;
  payTime?: number;
  weixinAppId?: string;
  outTradeNo?: string;
  openId?: string;
  [key: string]: unknown;
}

export type GetIncomeDetailResponse = AccountPaginatedResponse<IncomeDetailItem>;

export interface GetUserDurationsParams {}

export interface GetUserDurationsResponse {
  userId: string;
  available: number;
  used: number;
}

export interface MicDurationParams {}

export interface MicDurationResponse {
  available: number;
  history: number;
}

// ============================================
// AC5: Switch Config Types
// ============================================

export interface SwitchGetParams {
  /** Channel ID. Omit to query global switch settings. */
  channelId?: string;
}

export interface SwitchConfigItem {
  type: string;
  enabled: AccountYnFlag;
}

export type SwitchGetResponse = SwitchConfigItem[];

export interface SwitchUpdateParams {
  /** Channel ID. Omit to update global switch settings. */
  channelId?: string;
  /** Switch type from the source API. */
  type?: string;
  /** Deprecated compatibility alias for type. */
  param?: string;
  enabled: AccountYnFlag | boolean;
}

export interface SwitchUpdateResponse {
  success: boolean;
}

// ============================================
// AC6: Callback Settings Types
// ============================================

export interface SetStreamCallbackParams {
  /** Live account user ID used in the URL path. */
  userId: string;
  url?: string;
}

export interface SetStreamCallbackResponse {
  success: boolean;
}

export interface SetRecordCallbackParams {
  /** Live account user ID used in the URL path. */
  userId: string;
  url?: string;
}

export interface SetRecordCallbackResponse {
  success: boolean;
}

export interface SetPlaybackCallbackParams {
  /** Live account user ID used in the URL path. */
  userId: string;
  url?: string;
}

export interface SetPlaybackCallbackResponse {
  success: boolean;
}

// ============================================
// AC7: Token Management Types
// ============================================

export interface SetUserLoginTokenParams {
  token: string;
}

export interface SetUserLoginTokenResponse {
  success: boolean;
}

export type SetUserChildrenLoginTokenParams =
  | {
      /** Child account email from the source API. */
      childEmail: string;
      token: string;
      userId?: never;
    }
  | {
      /** Deprecated compatibility alias. Prefer childEmail. */
      userId: string;
      token: string;
      childEmail?: never;
    };

export interface SetUserChildrenLoginTokenResponse {
  success: boolean;
}

// ============================================
// AC8: SSO Types
// ============================================

export interface SsoLoginParams {
  code: string;
  redirectUri?: string;
}

export interface SsoLoginResponse {
  token: string;
  userId: string;
  expireTime: number;
}

export interface SsoConfigParams {
  ssoEnabled: boolean;
  ssoUrl?: string;
  logoutUrl?: string;
}

export interface SsoConfigResponse {
  success: boolean;
}
