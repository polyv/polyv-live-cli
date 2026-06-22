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
  rank: number;
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

export interface ChannelsParams {
  page?: number;
  pageSize?: number;
  categoryId?: number;
  keyword?: string;
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
  contents: ChannelListItem[];
  total: number;
  pageSize: number;
  currentPage: number;
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
  categoryId?: number;
  page?: number;
  pageSize?: number;
}

export interface SimpleChannel {
  channelId: string;
  name: string;
  scene?: string;
}

export interface GetSimpleChannelListResponse {
  contents: SimpleChannel[];
  total: number;
}

export interface UserChannelBasicListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
}

export interface UserChannelBasicListResponse {
  contents: ChannelListItem[];
  total: number;
}

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
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  type?: string;
}

export interface ReceiveItem {
  id: string;
  type: string;
  amount: number;
  balance: number;
  desc: string;
  createdTime: number;
}

export interface ReceiveListResponse {
  contents: ReceiveItem[];
  total: number;
}

export interface GetIncomeDetailParams {
  startDate?: string;
  endDate?: string;
}

export interface IncomeDetail {
  totalIncome: number;
  todayIncome: number;
  monthIncome: number;
  details: Array<{
    type: string;
    amount: number;
    count: number;
  }>;
}

export interface GetIncomeDetailResponse {
  income: IncomeDetail;
}

export interface GetUserDurationsParams {
  userId?: string;
  channelId?: string;
  startDate?: string;
  endDate?: string;
}

export interface UserDurations {
  totalDuration: number;
  liveDuration: number;
  playbackDuration: number;
  details: Array<{
    date: string;
    liveDuration: number;
    playbackDuration: number;
  }>;
}

export interface GetUserDurationsResponse {
  durations: UserDurations;
}

export interface MicDurationParams {
  channelId?: string;
  startDate?: string;
  endDate?: string;
}

export interface MicDuration {
  totalDuration: number;
  sessionCount: number;
  avgDuration: number;
}

export interface MicDurationResponse {
  micDuration: MicDuration;
}

// ============================================
// AC5: Switch Config Types
// ============================================

export interface SwitchConfig {
  globalSettingEnabled: boolean;
  authEnabled: boolean;
  recordEnabled: boolean;
  playbackEnabled: boolean;
  danmuEnabled: boolean;
  // Add more switch config fields as needed
  [key: string]: boolean | string | number;
}

export interface SwitchGetParams {
  /** Channel ID. Omit to query global switch settings. */
  channelId?: string;
}

export interface SwitchConfigItem {
  type: string;
  enabled: 'Y' | 'N';
}

export type SwitchGetResponse = SwitchConfigItem[] | { config: SwitchConfig };

export interface SwitchUpdateParams {
  /** Channel ID. Omit to update global switch settings. */
  channelId?: string;
  /** Switch type from the source API. */
  type?: string;
  /** Deprecated compatibility alias for type. */
  param?: string;
  enabled: 'Y' | 'N' | boolean;
}

export interface SwitchUpdateResponse {
  success: boolean;
}

// ============================================
// AC6: Callback Settings Types
// ============================================

export interface SetStreamCallbackParams {
  url: string;
}

export interface SetStreamCallbackResponse {
  success: boolean;
}

export interface SetRecordCallbackParams {
  url: string;
}

export interface SetRecordCallbackResponse {
  success: boolean;
}

export interface SetPlaybackCallbackParams {
  url: string;
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

export interface SetUserChildrenLoginTokenParams {
  userId: string;
  token: string;
}

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
