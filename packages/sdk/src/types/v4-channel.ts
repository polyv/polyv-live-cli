/**
 * V4 Channel Types
 *
 * Type definitions for V4 Channel management APIs.
 *
 * @module types/v4-channel
 */

// ============================================
// Channel Basic Types
// ============================================

/**
 * Channel scene types
 */
export type ChannelScene = 'topclass' | 'double' | 'train' | 'alone' | 'seminar' | 'guide';

/**
 * Channel template types
 */
export type ChannelTemplate =
  | 'ppt'
  | 'portrait_ppt'
  | 'alone'
  | 'portrait_alone'
  | 'topclass'
  | 'portrait_topclass'
  | 'seminar';

/**
 * Y/N flag type
 */
export type YNFlag = 'Y' | 'N';

/**
 * Parameters for creating a channel
 */
export interface CreateChannelParams {
  /** Channel name, max 100 chars */
  name: string;
  /** Channel scene */
  newScene: ChannelScene;
  /** Channel template */
  template: ChannelTemplate;
  /** Channel password (6-16 chars) */
  channelPasswd?: string;
  /** Seminar host password (6-16 chars) */
  seminarHostPassword?: string;
  /** Seminar attendee password (6-16 chars) */
  seminarAttendeePassword?: string;
  /** Pure RTC enabled */
  pureRtcEnabled?: YNFlag;
  /** Transmit type */
  type?: 'normal' | 'transmit' | 'receive';
  /** Double teacher type */
  doubleTeacherType?: 'normal' | 'transmit' | 'receive';
  /** CN and EN live enabled */
  cnAndEnLiveEnabled?: YNFlag;
  /** Splash image URL */
  splashImg?: string;
  /** Link mic limit (max 16) */
  linkMicLimit?: number;
  /** Category ID */
  categoryId?: number;
  /** Start time (timestamp) */
  startTime?: number;
  /** End time (timestamp) */
  endTime?: number;
  /** Sub account email */
  subAccount?: string;
  /** Custom teacher ID */
  customTeacherId?: string;
  /** Label IDs */
  labelData?: number[];
  /** Client alone template background URL */
  clientAloneTemplateBackgroundUrl?: string;
  /** Live CDN background URL */
  liveCdnBackgroundUrl?: string;
  /** H5 low latency FLV enabled */
  h5LowLatencyFlvEnabled?: YNFlag;
}

/**
 * Response for creating a channel
 */
export interface CreateChannelResponse {
  /** Channel ID */
  channelId: number;
  /** User ID */
  userId: string;
  /** Channel password */
  channelPasswd: string | null;
  /** Seminar host password */
  seminarHostPassword: string | null;
  /** Seminar attendee password */
  seminarAttendeePassword: string | null;
}

/**
 * Parameters for batch creating channels
 */
export interface CreateBatchChannelsParams {
  /** Channels to create */
  channels: CreateChannelParams[];
}

/**
 * Response for batch creating channels
 */
export interface CreateBatchChannelsResponse {
  /** Created channels */
  channels: CreateChannelResponse[];
}

/**
 * Parameters for creating MR channel
 */
export interface CreateMrChannelParams {
  /** Channel name */
  name: string;
  /** Category ID */
  categoryId?: number;
}

/**
 * Response for creating MR channel
 */
export interface CreateMrChannelResponse {
  /** Channel ID */
  channelId: number;
  /** User ID */
  userId: string;
}

/**
 * Parameters for basic channel creation
 */
export interface BasicCreateChannelParams {
  /** Channel name */
  name: string;
  /** Channel password */
  channelPasswd?: string;
  /** Scene */
  scene?: string;
  /** Publisher */
  publisher?: string;
}

/**
 * Response for basic channel creation
 */
export interface BasicCreateChannelResponse {
  /** Channel ID */
  channelId: number;
  /** User ID */
  userId: string;
}

/**
 * Parameters for updating a channel
 */
export interface UpdateChannelParams {
  /** Channel ID */
  channelId: string;
  /** Channel name */
  name?: string;
  /** Publisher */
  publisher?: string;
  /** Channel password */
  channelPasswd?: string;
  /** Start time */
  startTime?: number;
  /** End time */
  endTime?: number;
  /** Cover image URL */
  coverImg?: string;
  /** Splash image URL */
  splashImg?: string;
  /** Description */
  desc?: string;
  /** Publishing region */
  publishingRegion?: string;
}

/**
 * Response for updating a channel
 */
export interface UpdateChannelResponse {
  /** Success flag */
  success: boolean;
}

/**
 * Parameters for updating chat enabled status
 */
export interface UpdateChatEnabledParams {
  /** Channel ID */
  channelId: string;
  /** Chat enabled status */
  chatEnabled: YNFlag;
}

// ============================================
// Channel Operate Types
// ============================================

/**
 * Watch status type
 */
export type WatchStatus = 'live' | 'end' | 'playback' | 'waiting' | 'unStart';

/**
 * Channel basic info
 */
export interface ChannelBasicInfo {
  /** Channel ID */
  channelId: string;
  /** Channel name */
  name: string;
  /** Publisher name */
  publisher: string;
  /** Start time */
  startTime: number;
  /** Page views */
  pageView: number;
  /** Likes count */
  likes: number;
  /** Cover image URL */
  coverImg: string;
  /** Splash image URL */
  splashImg: string;
  /** Splash enabled */
  splashEnabled: YNFlag;
  /** Description */
  desc: string;
  /** Max viewers */
  maxViewer: number;
  /** Watch status */
  watchStatus: WatchStatus;
  /** Watch status text */
  watchStatusText: string;
  /** Online count */
  onlineNum: number;
  /** Background image URL */
  bgImg: string | null;
  /** Video list */
  videoList: Array<{ videoId: string; videoPoolId: string }> | null;
  /** Category ID */
  categoryId: number;
}

/**
 * Parameters for getting channel info
 */
export interface GetChannelParams {
  /** Channel ID */
  channelId: string;
}

/**
 * Channel auth setting
 */
export interface ChannelAuthSetting {
  /** Channel ID */
  channelId: string;
  /** Rank */
  rank: number;
  /** User ID */
  userId: string;
  /** Global setting enabled */
  globalSettingEnabled: YNFlag;
  /** Auth enabled */
  enabled: YNFlag;
  /** Auth type */
  authType: string;
  /** Auth tips */
  authTips: string;
  /** Pay auth tips */
  payAuthTips: string;
  /** Code auth tips */
  codeAuthTips: string;
  /** Info auth tips */
  infoAuthTips: string;
}

/**
 * Channel category info
 */
export interface ChannelCategory {
  /** Category ID */
  categoryId: number;
  /** Category name */
  categoryName: string;
  /** User ID */
  userId: string;
  /** Rank */
  rank: number;
}

/**
 * Channel detail info
 */
export interface ChannelDetailInfo extends ChannelBasicInfo {
  /** Scene */
  scene: string;
  /** New scene */
  newScene: string;
  /** Template */
  template: string;
  /** Channel password */
  channelPasswd: string;
  /** Consulting menu enabled */
  consultingMenuEnabled: YNFlag;
  /** Max viewer restrict */
  maxViewerRestrict: YNFlag;
  /** User category */
  userCategory: ChannelCategory;
  /** Auth settings */
  authSettings: ChannelAuthSetting[];
}

/**
 * Parameters for getting channel detail
 */
export interface GetChannelDetailParams {
  /** Channel ID */
  channelId: string;
}

/**
 * Parameters for listing basic channels
 */
export interface ListChannelBasicParams {
  /** Page number (>= 1) */
  pageNumber?: number;
  /** Page size (1-1000) */
  pageSize?: number;
  /** Category IDs (comma separated) */
  categoryIds?: string;
}

/**
 * Paginated response for channels
 */
export interface PaginatedChannelsResponse<T> {
  /** Page number */
  pageNumber: number;
  /** Page size */
  pageSize: number;
  /** Total pages */
  totalPages: number;
  /** Total items */
  totalItems: number;
  /** Contents */
  contents: T[];
}

/**
 * Parameters for listing basic channel info
 */
export interface ListChannelBasicInfoParams {
  /** Page number (>= 1) */
  pageNumber?: number;
  /** Page size (1-1000) */
  pageSize?: number;
}

/**
 * Parameters for channel basic list
 */
export interface ChannelBasicListParams {
  /** Category IDs (comma separated) */
  categoryIds?: string;
  /** Page number */
  page?: number;
  /** Page size */
  pageSize?: number;
}

/**
 * Parameters for channel simple list
 */
export interface ChannelSimpleListParams {
  /** Page number (>= 1) */
  pageNumber?: number;
  /** Page size (1-1000) */
  pageSize?: number;
}

/**
 * Channel simple info
 */
export interface ChannelSimpleInfo {
  /** Channel ID */
  channelId: string;
  /** Channel name */
  name: string;
}

/**
 * Parameters for channel detail list
 */
export interface ChannelDetailListParams {
  /** Page number (>= 1) */
  pageNumber?: number;
  /** Page size (1-1000) */
  pageSize?: number;
  /** Category ID */
  categoryId?: number;
}

/**
 * Parameters for updating channel template
 */
export interface UpdateChannelTemplateParams {
  /** Channel ID */
  channelId: string;
  /** Template */
  template: string;
}

/**
 * Parameters for setting pull bitrate
 */
export interface SetPullBitrateParams {
  /** Channel ID */
  channelId: string;
  /** Bitrate */
  bitrate: number;
}

// ============================================
// Account Types
// ============================================

/**
 * Account info
 */
export interface ChannelAccount {
  /** Account ID */
  id: number;
  /** Account */
  account: string;
  /** Nickname */
  nickname: string;
  /** Avatar */
  avatar: string;
  /** Status */
  status: YNFlag;
}

/**
 * Parameters for adding account
 */
export interface AddAccountParams {
  /** Channel ID */
  channelId: string;
  /** Account */
  account: string;
  /** Nickname */
  nickname: string;
  /** Password */
  password: string;
}

/**
 * Parameters for updating account
 */
export interface UpdateAccountParams {
  /** Channel ID */
  channelId: string;
  /** Account ID */
  id: number;
  /** Nickname */
  nickname?: string;
  /** Password */
  password?: string;
  /** Status */
  status?: YNFlag;
}

/**
 * Parameters for deleting accounts
 */
export interface DeleteAccountsParams {
  /** Channel ID */
  channelId: string;
  /** Account IDs to delete */
  accountIds: string[];
}

/**
 * Parameters for getting account viewer
 */
export interface GetAccountViewerParams {
  /** Channel ID */
  channelId: string;
}

/**
 * Account viewer settings
 */
export interface AccountViewerSettings {
  /** Channel ID */
  channelId: string;
  /** Viewer enabled */
  viewerEnabled: YNFlag;
  /** Max viewers */
  maxViewers: number;
}

/**
 * Parameters for updating account viewer
 */
export interface UpdateAccountViewerParams {
  /** Channel ID */
  channelId: string;
  /** Viewer enabled */
  viewerEnabled: YNFlag;
  /** Max viewers */
  maxViewers?: number;
}

// ============================================
// Playback & Recordfile Types
// ============================================

/**
 * Playback info
 */
export interface PlaybackInfo {
  /** Video ID */
  videoId: string;
  /** Video pool ID */
  videoPoolId: string;
  /** Duration */
  duration: number;
  /** File size */
  fileSize: number;
  /** Start time */
  startTime: number;
  /** End time */
  endTime: number;
  /** Status */
  status: string;
  /** Title */
  title: string;
}

/**
 * Parameters for listing playbacks
 */
export interface PlaybackListParams {
  /** Channel ID */
  channelId: string;
  /** Page number (>= 1) */
  pageNumber?: number;
  /** Page size (1-1000) */
  pageSize?: number;
}

/**
 * Response for listing playbacks
 */
export interface PlaybackListResponse {
  /** Page number */
  pageNumber: number;
  /** Page size */
  pageSize: number;
  /** Total pages */
  totalPages: number;
  /** Total items */
  totalItems: number;
  /** Contents */
  contents: PlaybackInfo[];
}

/**
 * Parameters for querying playback video info
 */
export interface QueryPlaybackVideoInfoParams {
  /** Channel ID */
  channelId: string;
  /** Video ID */
  videoId: string;
}

/**
 * Playback video info
 */
export interface PlaybackVideoInfo {
  /** Video ID */
  videoId: string;
  /** Video pool ID */
  videoPoolId: string;
  /** Duration */
  duration: number;
  /** File size */
  fileSize: number;
  /** Start time */
  startTime: number;
  /** End time */
  endTime: number;
  /** Status */
  status: string;
  /** Title */
  title: string;
  /** URL */
  url: string;
  /** Image URL */
  imageUrl: string;
}

/**
 * Parameters for updating channel subtitle
 */
export interface UpdateChannelSubtitleParams {
  /** Channel ID */
  channelId: string;
  /** Video ID */
  videoId: string;
  /** Subtitle URL */
  subtitleUrl: string;
}

/**
 * Recorded file info
 */
export interface RecordedFileInfo {
  /** File ID */
  fileId: string;
  /** File name */
  fileName: string;
  /** File size */
  fileSize: number;
  /** Duration */
  duration: number;
  /** Start time */
  startTime: number;
  /** End time */
  endTime: number;
  /** Status */
  status: string;
  /** URL */
  url: string;
}

/**
 * Parameters for paging recorded files
 */
export interface PageMRecordParams {
  /** Channel ID */
  channelId: string;
  /** Page number (>= 1) */
  pageNumber?: number;
  /** Page size (1-1000) */
  pageSize?: number;
  /** Start time */
  startTime?: number;
  /** End time */
  endTime?: number;
}

/**
 * Response for paging recorded files
 */
export interface PageMRecordResponse {
  /** Page number */
  pageNumber: number;
  /** Page size */
  pageSize: number;
  /** Total pages */
  totalPages: number;
  /** Total items */
  totalItems: number;
  /** Contents */
  contents: RecordedFileInfo[];
}

/**
 * Parameters for batch publishing subtitle
 */
export interface BatchPublishSubtitleParams {
  /** Channel ID */
  channelId: string;
  /** Subtitles */
  subtitles: Array<{
    videoId: string;
    subtitleUrl: string;
  }>;
}

// ============================================
// Session Types
// ============================================

/**
 * Session info
 */
export interface SessionInfo {
  /** Session ID */
  sessionId: string;
  /** Channel ID */
  channelId: number;
  /** Session name */
  name?: string;
  /** Status */
  status: 'unStart' | 'live' | 'end' | 'playback' | 'expired';
  /** Start time (can be string or number) */
  startTime?: string | number;
  /** End time */
  endTime?: number;
  /** Created time */
  createdTime?: number;
  /** Plan start time */
  planStartTime?: number;
  /** Plan end time */
  planEndTime?: number;
  /** Stream type */
  streamType?: string;
  /** Push client */
  pushClient?: string;
  /** Splash image */
  splashImg?: string;
  /** Splash large image */
  splashLargeImg?: string;
  /** Watch URL */
  watchUrl?: string;
  /** User ID */
  userId?: string;
}

/**
 * Parameters for getting session relevance
 */
export interface GetRelevanceParams {
  /** Channel ID */
  channelId: string;
  /** Session ID */
  sessionId: string;
}

/**
 * Session relevance info
 */
export interface SessionRelevanceInfo {
  /** Session ID */
  sessionId: string;
  /** Channel ID */
  channelId: string;
  /** Relevance data */
  relevance: Record<string, unknown>;
}

/**
 * Parameters for creating session
 */
export interface CreateSessionParams {
  /** Channel ID */
  channelId: string;
  /** Session name */
  name: string;
  /** Plan start time */
  planStartTime?: number;
  /** Plan end time */
  planEndTime?: number;
  /** Splash image */
  splashImg?: string;
}

/**
 * Response for creating session
 */
export interface CreateSessionResponse {
  /** Session ID */
  sessionId: string;
}

/**
 * Parameters for getting session
 */
export interface GetSessionParams {
  /** Channel ID */
  channelId: string | number;
  /** Session ID */
  sessionId: string;
}

/**
 * Parameters for listing sessions
 */
export interface ListSessionsParams {
  /** Channel ID (optional - if not provided, returns sessions for all channels) */
  channelId?: string | number | undefined;
  /** Page number (>= 1) */
  pageNumber?: number;
  /** Page size (1-1000) */
  pageSize?: number;
}

/**
 * Response for listing sessions
 */
export interface ListSessionsResponse {
  /** Page number */
  pageNumber: number;
  /** Page size */
  pageSize: number;
  /** Total pages */
  totalPages: number;
  /** Total items */
  totalItems: number;
  /** Contents */
  contents: SessionInfo[];
}

/**
 * Parameters for updating session
 */
export interface UpdateSessionParams {
  /** Channel ID */
  channelId: string;
  /** Session ID */
  sessionId: string;
  /** Session name */
  name?: string;
  /** Plan start time */
  planStartTime?: number;
  /** Plan end time */
  planEndTime?: number;
  /** Splash image */
  splashImg?: string;
}

/**
 * Parameters for deleting session
 */
export interface DeleteSessionParams {
  /** Channel ID */
  channelId: string;
  /** Session ID */
  sessionId: string;
}

// ============================================
// Decorate & Donate Types
// ============================================

/**
 * Decorate settings
 */
export interface DecorateSettings {
  /** Channel ID */
  channelId: string;
  /** Background image URL */
  bgImg: string;
  /** Cover image URL */
  coverImg: string;
  /** Splash image URL */
  splashImg: string;
  /** Theme color */
  themeColor: string;
  /** Custom CSS */
  customCss: string;
}

/**
 * Parameters for getting decorate settings
 */
export interface GetDecorateParams {
  /** Channel ID */
  channelId: string;
}

/**
 * Parameters for updating decorate settings
 */
export interface UpdateDecorateParams {
  /** Channel ID */
  channelId: string;
  /** Background image URL */
  bgImg?: string;
  /** Cover image URL */
  coverImg?: string;
  /** Splash image URL */
  splashImg?: string;
  /** Theme color */
  themeColor?: string;
  /** Custom CSS */
  customCss?: string;
}

/**
 * Parameters for updating skin
 */
export interface UpdateSkinParams {
  /** Channel ID */
  channelId: string;
  /** Skin ID */
  skinId: string;
}

/**
 * Donate settings
 */
export interface DonateSettings {
  /** Channel ID */
  channelId: string;
  /** Donate enabled */
  donateEnabled: YNFlag;
  /** Donate tips */
  donateTips: string;
  /** Donate amounts */
  donateAmounts: number[];
}

/**
 * Parameters for getting donate settings
 */
export interface GetDonateParams {
  /** Channel ID */
  channelId: string;
}

/**
 * Parameters for updating donate settings
 */
export interface UpdateDonateParams {
  /** Channel ID */
  channelId: string;
  /** Donate enabled */
  donateEnabled?: YNFlag;
  /** Donate tips */
  donateTips?: string;
  /** Donate amounts */
  donateAmounts?: number[];
}

// ============================================
// Distribute Types
// ============================================

/**
 * Distribute info
 */
export interface DistributeInfo {
  /** Distribute ID */
  id: number;
  /** Channel ID */
  channelId: number;
  /** Name */
  name: string;
  /** Distribute URL */
  distributeUrl: string;
  /** Distribute live code */
  distributeLiveCode: string;
  /** Status */
  status: YNFlag;
  /** Connection status */
  connectionStatus: 'completed' | 'processing' | 'waiting' | 'error';
}

/**
 * Parameters for listing distributes
 */
export interface DistributeListParams {
  /** Channel ID */
  channelId: string;
  /** Distribute IDs (comma separated) */
  distributeIds?: string;
}

/**
 * Response for listing distributes
 */
export interface DistributeListResponse {
  /** Distribute enable */
  distributeEnable: YNFlag;
  /** Result */
  result: DistributeInfo[];
}

/**
 * Parameters for batch creating distributes
 */
export interface DistributeCreateBatchParams {
  /** Channel ID */
  channelId: string;
  /** Distributes to create */
  distributes: Array<{
    name: string;
    distributeUrl: string;
    distributeLiveCode?: string;
  }>;
}

/**
 * Response for batch creating distributes
 */
export interface DistributeCreateBatchResponse {
  /** Created distributes */
  distributes: DistributeInfo[];
}

/**
 * Parameters for batch updating distributes
 */
export interface DistributeUpdateBatchParams {
  /** Channel ID */
  channelId: string;
  /** Distributes to update */
  distributes: Array<{
    id: number;
    name?: string;
    distributeUrl?: string;
    distributeLiveCode?: string;
    status?: YNFlag;
  }>;
}

/**
 * Parameters for batch deleting distributes
 */
export interface DistributeDeleteBatchParams {
  /** Channel ID */
  channelId: string;
  /** Distribute IDs */
  ids: number[];
}

/**
 * Parameters for getting distribute statistics
 */
export interface DistributeStatisticParams {
  /** Channel ID */
  channelId: string;
  /** Distribute ID */
  distributeId: number;
}

/**
 * Distribute statistics
 */
export interface DistributeStatistic {
  /** Distribute ID */
  distributeId: number;
  /** Channel ID */
  channelId: string;
  /** Total views */
  totalViews: number;
  /** Total duration */
  totalDuration: number;
  /** Connection count */
  connectionCount: number;
}

/**
 * Parameters for updating master switch
 */
export interface UpdateMasterSwitchParams {
  /** Channel ID */
  channelId: string;
  /** Enabled */
  enabled: YNFlag;
}

/**
 * Parameters for updating switch
 */
export interface UpdateSwitchParams {
  /** Channel ID */
  channelId: string;
  /** Distribute ID */
  distributeId: number;
  /** Enabled */
  enabled: YNFlag;
}

// ============================================
// Lottery & Interaction Types
// ============================================

/**
 * Parameters for creating wait lottery
 */
export interface CreateWaitLotteryParams {
  /** Channel ID */
  channelId: string;
  /** Session ID */
  sessionId: string;
  /** Lottery name */
  name: string;
  /** Max winners */
  maxWinners: number;
}

/**
 * Response for creating wait lottery
 */
export interface CreateWaitLotteryResponse {
  /** Lottery ID */
  lotteryId: string;
}

/**
 * Parameters for querying winner viewer
 */
export interface QueryWinnerViewerParams {
  /** Channel ID */
  channelId: string;
  /** Lottery ID */
  lotteryId: string;
  /** Page number */
  pageNumber?: number;
  /** Page size */
  pageSize?: number;
}

/**
 * Winner viewer info
 */
export interface WinnerViewerInfo {
  /** Viewer ID */
  viewerId: string;
  /** Viewer name */
  viewerName: string;
  /** Prize */
  prize: string;
  /** Win time */
  winTime: number;
}

/**
 * Response for querying winner viewer
 */
export interface QueryWinnerViewerResponse {
  /** Page number */
  pageNumber: number;
  /** Page size */
  pageSize: number;
  /** Total items */
  totalItems: number;
  /** Contents */
  contents: WinnerViewerInfo[];
}

export interface LotteryReceiveInfo {
  type?: 'userName' | 'userPhone' | 'custom' | string;
  field: string;
  tips?: string;
  required?: boolean;
}

export interface LotteryPrizeInfo {
  prizeItem: string;
  correctAnswerCount: number;
  [key: string]: unknown;
}

/**
 * Lottery activity info
 */
export interface LotteryActivity {
  /** Activity ID */
  id: number;
  /** Channel ID */
  channelId?: string;
  /** Activity name */
  activityName: string;
  /** Lottery condition type */
  lotteryCondition: 'none' | 'invite' | 'duration' | 'comment' | 'question' | string;
  /** Status */
  status?: string | null;
  /** Winner count */
  amount: number;
  /** Prize name */
  prizeName: string;
  hiddenWinnerAmount?: YNFlag;
  lotteryRange?: 'all' | 'customGroup' | string;
  customGroup?: Array<Record<string, unknown>>;
  customGroupIds?: Array<string | number>;
  customGroupLotteryType?: 'average' | 'random' | string;
  customGroupLotteryAmount?: number | null;
  hiddenAttendeeNumber?: YNFlag;
  repeatWinEnabled?: YNFlag;
  receiveEnabled?: YNFlag;
  receiveInfo?: LotteryReceiveInfo[] | null;
  thumbnail?: string | null;
  activityDuration?: string | number | null;
  activityDurationType?: 'second' | 'minute' | 'hour' | string | null;
  inviteType?: 'poster' | 'external' | string | null;
  externalListLink?: string | null;
  externalInviteNumLink?: string | null;
  inviteNum?: number | null;
  duration?: number | null;
  comment?: string | null;
  acceptType?: 'form' | 'link' | 'qrCode' | string | null;
  formInfo?: LotteryReceiveInfo[] | null;
  prizeUrl?: string | null;
  qrCode?: string | null;
  qrCodeTips?: string | null;
  realPrice?: number | null;
  price?: number | null;
  prizeInfo?: LotteryPrizeInfo[] | null;
  questionGroupId?: number | null;
  perAnswerDuration?: number | null;
  lotteryOnlineEnabled?: YNFlag;
  answerType?: 'pushQuestion' | 'autonomyAnswer' | string;
  showWinnerCode?: YNFlag;
  showWinners?: YNFlag;
  [key: string]: unknown;
}

/**
 * Parameters for creating lottery activity
 */
export interface LotteryActivityCreateParams {
  /** Channel ID */
  channelId: string | number;
  /** Activity name */
  activityName: string;
  /** Lottery condition type */
  lotteryCondition: 'none' | 'invite' | 'duration' | 'comment' | 'question' | string;
  /** Winner count */
  amount: number;
  /** Prize name */
  prizeName: string;
  hiddenWinnerAmount?: YNFlag;
  lotteryRange?: 'all' | 'customGroup' | string;
  customGroupIds?: Array<string | number>;
  customGroupLotteryType?: 'average' | 'random' | string;
  customGroupLotteryAmount?: number;
  hiddenAttendeeNumber?: YNFlag;
  repeatWinEnabled?: YNFlag;
  receiveEnabled?: YNFlag;
  receiveInfo?: LotteryReceiveInfo[];
  thumbnail?: string;
  activityDuration?: string | number;
  activityDurationType?: 'second' | 'minute' | 'hour' | string;
  inviteType?: 'poster' | 'external' | string;
  externalListLink?: string;
  externalInviteNumLink?: string;
  inviteNum?: number;
  duration?: number;
  comment?: string;
  acceptType?: 'form' | 'link' | 'qrCode' | string;
  formInfo?: LotteryReceiveInfo[];
  prizeUrl?: string;
  qrCode?: string;
  qrCodeTips?: string;
  realPrice?: number;
  price?: number;
  prizeInfo?: LotteryPrizeInfo[];
  questionGroupId?: number;
  perAnswerDuration?: number;
  lotteryOnlineEnabled?: YNFlag;
  answerType?: 'pushQuestion' | 'autonomyAnswer' | string;
  showWinnerCode?: YNFlag;
  showWinners?: YNFlag;
}

/**
 * Response for creating lottery activity
 */
export interface LotteryActivityCreateResponse {
  /** Activity ID */
  id: number;
}

/**
 * Parameters for getting lottery activity
 */
export interface LotteryActivityGetParams {
  /** Channel ID */
  channelId: string | number;
  /** Activity ID */
  id: string | number;
}

/**
 * Parameters for listing lottery activities
 */
export interface LotteryActivityListParams extends V4PaginationParams {
  /** Channel ID */
  channelId: string | number;
}

/**
 * Response for listing lottery activities
 */
export interface LotteryActivityListResponse {
  /** Page number */
  pageNumber: number;
  /** Page size */
  pageSize: number;
  /** Total items */
  totalItems: number;
  /** Contents */
  contents: LotteryActivity[];
}

/**
 * Parameters for updating lottery activity
 */
export interface LotteryActivityUpdateParams {
  /** Channel ID */
  channelId: string | number;
  /** Activity ID */
  id: string | number;
  /** Activity name */
  activityName: string;
  /** Lottery condition type */
  lotteryCondition: 'none' | 'invite' | 'duration' | 'comment' | 'question' | string;
  /** Winner count */
  amount: number;
  /** Prize name */
  prizeName: string;
  hiddenWinnerAmount?: YNFlag;
  lotteryRange?: 'all' | 'customGroup' | string;
  customGroupIds?: Array<string | number>;
  customGroupLotteryType?: 'average' | 'random' | string;
  customGroupLotteryAmount?: number;
  hiddenAttendeeNumber?: YNFlag;
  repeatWinEnabled?: YNFlag;
  receiveEnabled?: YNFlag;
  receiveInfo?: LotteryReceiveInfo[];
  thumbnail?: string;
  activityDuration?: string | number;
  activityDurationType?: 'second' | 'minute' | 'hour' | string;
  inviteType?: 'poster' | 'external' | string;
  externalListLink?: string;
  externalInviteNumLink?: string;
  inviteNum?: number;
  duration?: number;
  comment?: string;
  acceptType?: 'form' | 'link' | 'qrCode' | string;
  formInfo?: LotteryReceiveInfo[];
  prizeUrl?: string;
  qrCode?: string;
  qrCodeTips?: string;
  realPrice?: number;
  price?: number;
  prizeInfo?: LotteryPrizeInfo[];
  questionGroupId?: number;
  perAnswerDuration?: number;
  lotteryOnlineEnabled?: YNFlag;
  answerType?: 'pushQuestion' | 'autonomyAnswer' | string;
  showWinnerCode?: YNFlag;
  showWinners?: YNFlag;
}

/**
 * Parameters for deleting lottery activity
 */
export interface LotteryActivityDeleteParams {
  /** Channel ID */
  channelId: string | number;
  /** Activity ID */
  id: string | number;
}

/**
 * Parameters for adding to blacklist
 */
export interface BlacklistAddParams {
  /** Channel ID */
  channelId: string;
  /** Viewer IDs */
  viewerIds: string[];
}

/**
 * Parameters for deleting from blacklist
 */
export interface BlacklistDeleteParams {
  /** Channel ID */
  channelId: string;
  /** Viewer IDs */
  viewerIds: string[];
}

/**
 * Parameters for paging blacklist
 */
export interface BlacklistPageParams {
  /** Channel ID */
  channelId: string;
  /** Page number */
  pageNumber?: number;
  /** Page size */
  pageSize?: number;
}

/**
 * Blacklist item
 */
export interface BlacklistItem {
  /** Viewer ID */
  viewerId: string;
  /** Viewer name */
  viewerName: string;
  /** Added time */
  addedTime: number;
}

/**
 * Response for paging blacklist
 */
export interface BlacklistPageResponse {
  /** Page number */
  pageNumber: number;
  /** Page size */
  pageSize: number;
  /** Total items */
  totalItems: number;
  /** Contents */
  contents: BlacklistItem[];
}

/**
 * Parameters for adding group
 */
export interface GroupAddParams {
  /** Channel ID */
  channelId: string;
  /** Group name */
  name: string;
}

/**
 * Response for adding group
 */
export interface GroupAddResponse {
  /** Group ID */
  groupId: string;
}

/**
 * Parameters for creating viewer name group
 */
export interface GroupCreateViewerNameParams {
  /** Channel ID */
  channelId: string;
  /** Group name */
  name: string;
  /** Viewer names */
  viewerNames: string[];
}

/**
 * Parameters for deleting group
 */
export interface GroupDeleteParams {
  /** Channel ID */
  channelId: string;
  /** Group ID */
  groupId: string;
}

/**
 * Parameters for listing groups
 */
export interface GroupListParams {
  /** Channel ID */
  channelId: string;
}

/**
 * Group info
 */
export interface GroupInfo {
  /** Group ID */
  groupId: string;
  /** Group name */
  name: string;
  /** Member count */
  memberCount: number;
  /** Created time */
  createdTime: number;
}

/**
 * Parameters for updating group
 */
export interface GroupUpdateParams {
  /** Channel ID */
  channelId: string;
  /** Group ID */
  groupId: string;
  /** Group name */
  name: string;
}

/**
 * Parameters for adding viewer to group
 */
export interface GroupViewerAddParams {
  /** Channel ID */
  channelId: string;
  /** Group ID */
  groupId: string;
  /** Viewer IDs */
  viewerIds: string[];
}

/**
 * Parameters for deleting viewer from group
 */
export interface GroupViewerDeleteParams {
  /** Channel ID */
  channelId: string;
  /** Group ID */
  groupId: string;
  /** Viewer IDs */
  viewerIds: string[];
}

/**
 * Parameters for listing group viewers
 */
export interface GroupViewerListParams {
  /** Channel ID */
  channelId: string;
  /** Group ID */
  groupId: string;
  /** Page number */
  pageNumber?: number;
  /** Page size */
  pageSize?: number;
}

/**
 * Group viewer info
 */
export interface GroupViewerInfo {
  /** Viewer ID */
  viewerId: string;
  /** Viewer name */
  viewerName: string;
  /** Added time */
  addedTime: number;
}

/**
 * Response for listing group viewers
 */
export interface GroupViewerListResponse {
  /** Page number */
  pageNumber: number;
  /** Page size */
  pageSize: number;
  /** Total items */
  totalItems: number;
  /** Contents */
  contents: GroupViewerInfo[];
}

/**
 * Parameters for saving interaction event
 */
export interface InteractionEventSaveParams {
  /** Channel ID */
  channelId: string;
  /** Event type */
  eventType: string;
  /** Event data */
  eventData: Record<string, unknown>;
}

/**
 * Parameters for deleting interaction event
 */
export interface InteractionEventDeleteParams {
  /** Channel ID */
  channelId: string;
  /** Event ID */
  eventId: string;
}

/**
 * Parameters for creating inviter
 */
export interface InviterCreateParams {
  /** Channel ID */
  channelId: string;
  /** Inviter name */
  name: string;
  /** Inviter code */
  code?: string;
}

/**
 * Response for creating inviter
 */
export interface InviterCreateResponse {
  /** Inviter ID */
  inviterId: string;
}

/**
 * Parameters for uploading disk video script
 */
export interface DiskVideoScriptUploadParams {
  /** Channel ID */
  channelId: string;
  /** Script URL */
  scriptUrl: string;
  /** Script name */
  scriptName: string;
}

/**
 * Response for uploading disk video script
 */
export interface DiskVideoScriptUploadResponse {
  /** Script ID */
  scriptId: string;
}

/**
 * Parameters for querying disk video script
 */
export interface DiskVideoScriptQueryParams {
  /** Channel ID */
  channelId: string;
  /** Page number */
  pageNumber?: number;
  /** Page size */
  pageSize?: number;
}

/**
 * Disk video script info
 */
export interface DiskVideoScriptInfo {
  /** Script ID */
  scriptId: string;
  /** Script name */
  scriptName: string;
  /** Script URL */
  scriptUrl: string;
  /** Created time */
  createdTime: number;
}

/**
 * Response for querying disk video script
 */
export interface DiskVideoScriptQueryResponse {
  /** Page number */
  pageNumber: number;
  /** Page size */
  pageSize: number;
  /** Total items */
  totalItems: number;
  /** Contents */
  contents: DiskVideoScriptInfo[];
}

/**
 * Parameters for deleting disk video script
 */
export interface DiskVideoScriptDeleteParams {
  /** Channel ID */
  channelId: string;
  /** Script ID */
  scriptId: string;
}

// ============================================
// Market & CardPush Types
// ============================================

/**
 * Share settings
 */
export interface ShareSettings {
  shareBtnEnable?: YNFlag;
  titleType?: 'follow' | 'custom' | string;
  weixinShareTitle?: string;
  weixinShareDesc?: string;
  weixinShareCustomUrl?: string;
  webShareCustomUrl?: string;
  weixinShareCustomUrlWithParamEnabled?: YNFlag;
  webShareCustomUrlWithParamEnabled?: YNFlag;
  [key: string]: unknown;
}

/**
 * Parameters for getting share settings
 */
export interface ShareGetParams {
  /** Channel ID */
  channelId: string | number;
}

/**
 * Parameters for updating share settings
 */
export interface ShareUpdateParams {
  /** Channel ID */
  channelId: string | number;
  shareBtnEnable: YNFlag;
  titleType: 'follow' | 'custom' | string;
  weixinShareTitle?: string;
  weixinShareDesc?: string;
  weixinShareCustomUrl?: string;
  webShareCustomUrl?: string;
  weixinShareCustomUrlWithParamEnabled?: YNFlag;
  webShareCustomUrlWithParamEnabled?: YNFlag;
}

/**
 * Card push info
 */
export interface CardPushInfo {
  cardPushId?: number | string;
  channelId?: string | number;
  cardType?: 'common' | 'qrCode' | string;
  imageType?: 'giftbox' | 'redpack' | 'custom' | 'weixinWork' | string;
  title?: string;
  link?: string;
  duration?: 0 | 5 | 10 | 20 | 30 | number;
  showCondition?: 'PUSH' | 'WATCH' | string;
  [key: string]: unknown;
}

/**
 * Parameters for creating card push
 */
export interface CardPushCreateParams {
  /** Channel ID */
  channelId: string | number;
  cardType?: 'common' | 'qrCode' | string;
  imageType: 'giftbox' | 'redpack' | 'custom' | 'weixinWork' | string;
  title: string;
  link: string;
  duration: 0 | 5 | 10 | 20 | 30 | number;
  durationPosition?: 'bottom' | 'top' | string;
  showCondition: 'PUSH' | 'WATCH' | string;
  conditionValue?: number;
  conditionUnit?: 'SECONDS' | 'MINUTES' | string;
  countdownMsg?: string;
  enterEnabled?: YNFlag;
  linkEnabled?: YNFlag;
  redirectType?: 'iframe' | 'tab' | string;
  enterImage?: string;
  cardImage?: string;
  weixinWordQrCodeId?: string;
  qrCodeImage?: string;
  hrefType?: 'common' | 'multiplatform' | string;
  pcLink?: string;
  mobileLink?: string;
  wxMiniprogramOriginalId?: string;
  wxMiniprogramAppId?: string;
  wxMiniprogramLink?: string;
  mobileAppLink?: string;
}

/**
 * Response for creating card push
 */
export interface CardPushCreateResponse {
  /** Card push ID */
  cardPushId?: number | string;
  [key: string]: unknown;
}

/**
 * Parameters for updating card push
 */
export interface CardPushUpdateParams {
  /** Channel ID */
  channelId: string | number;
  /** Card push ID */
  cardPushId: string | number;
  title?: string;
  duration?: 0 | 5 | 10 | 20 | 30 | number;
  imageType?: 'giftbox' | 'redpack' | 'custom' | 'weixinWork' | string;
  link?: string;
  showCondition?: 'PUSH' | 'WATCH' | string;
  conditionValue?: number;
  conditionUnit?: 'SECONDS' | 'MINUTES' | string;
  countdownMsg?: string;
  enterEnabled?: YNFlag;
  linkEnabled?: YNFlag;
  [key: string]: unknown;
}

/**
 * Parameters for deleting card push
 */
export interface CardPushDeleteParams {
  /** Channel ID */
  channelId: string | number;
  /** Card push ID */
  cardPushId: string | number;
}

/**
 * Parameters for pushing card
 */
export interface CardPushPushParams {
  /** Channel ID */
  channelId: string | number;
  /** Card push ID */
  cardPushId: string | number;
}

/**
 * Parameters for canceling card push
 */
export interface CardPushCancelPushParams {
  /** Channel ID */
  channelId: string | number;
  /** Card push ID */
  cardPushId: string | number;
}

// ============================================
// Statistics Types
// ============================================

/**
 * Parameters for browsers summary
 */
export interface BrowsersSummaryParams {
  /** Channel ID */
  channelId: string;
  /** Start time */
  startTime: string;
  /** End time */
  endTime: string;
}

/**
 * Browsers summary
 */
export interface BrowsersSummary {
  /** Channel ID */
  channelId: string;
  /** Browser types */
  browsers: Array<{
    browserType: string;
    count: number;
    percentage: number;
  }>;
}

/**
 * Parameters for geo summary
 */
export interface GeoSummaryParams {
  /** Channel ID */
  channelId: string;
  /** Start time */
  startTime: string;
  /** End time */
  endTime: string;
}

/**
 * Geo summary
 */
export interface GeoSummary {
  /** Channel ID */
  channelId: string;
  /** Regions */
  regions: Array<{
    region: string;
    count: number;
    percentage: number;
  }>;
}

/**
 * Parameters for invite rank
 */
export interface GetInviteRankParams {
  /** Channel ID */
  channelId: string;
}

/**
 * Invite rank info
 */
export interface InviteRankInfo {
  /** Viewer ID */
  viewerId: string;
  /** Viewer name */
  viewerName: string;
  /** Invite count */
  inviteCount: number;
  /** Rank */
  rank: number;
}

/**
 * Parameters for invite stats
 */
export interface GetInviteStatsParams {
  /** Channel ID */
  channelId: string;
}

/**
 * Invite stats
 */
export interface InviteStats {
  /** Channel ID */
  channelId: string;
  /** Total invites */
  totalInvites: number;
  /** Unique inviters */
  uniqueInviters: number;
}

/**
 * Parameters for live summary
 */
export interface LiveSummaryParams {
  /** Channel ID */
  channelId: string;
  /** Start time */
  startTime: string;
  /** End time */
  endTime: string;
}

/**
 * Live summary
 */
export interface LiveSummary {
  /** Channel ID */
  channelId: string;
  /** Total views */
  totalViews: number;
  /** Unique viewers */
  uniqueViewers: number;
  /** Average duration */
  averageDuration: number;
  /** Peak concurrent */
  peakConcurrent: number;
}

/**
 * Parameters for lottery list
 */
export interface LotteryListParams extends V4PaginationParams {
  /** Channel ID */
  channelId: string;
}

/**
 * Lottery info
 */
export interface LotteryInfo {
  /** Lottery ID */
  lotteryId: string;
  /** Lottery name */
  name: string;
  /** Winner count */
  winnerCount: number;
  /** Created time */
  createdTime: number;
}

/**
 * Parameters for WeChat booking stats
 */
export interface WeixinBookingStatsParams {
  /** Channel ID */
  channelId: string;
}

/**
 * WeChat booking stats
 */
export interface WeixinBookingStats {
  /** Channel ID */
  channelId: string;
  /** Total bookings */
  totalBookings: number;
  /** Booking rate */
  bookingRate: number;
}

// ============================================
// Product & Reward Types
// ============================================

/**
 * Parameters for sorting channel product
 */
export interface SortChannelProductParams {
  /** Channel ID */
  channelId: string;
  /** Product IDs in order */
  productIds: string[];
}

/**
 * Product settings
 */
export interface ProductSettings {
  /** Channel ID */
  channelId: string;
  /** Product enabled */
  productEnabled: YNFlag;
  /** Product layout */
  productLayout: string;
}

/**
 * Parameters for getting product setting
 */
export interface GetProductSettingParams {
  /** Channel ID */
  channelId: string;
}

/**
 * Parameters for updating product setting
 */
export interface UpdateProductSettingParams {
  /** Channel ID */
  channelId: string;
  /** Product enabled */
  productEnabled?: YNFlag;
  /** Product layout */
  productLayout?: string;
}

/**
 * Parameters for paging product stats
 */
export interface ProductStatsPageParams {
  /** Channel ID */
  channelId: string;
  /** Page number */
  pageNumber?: number;
  /** Page size */
  pageSize?: number;
}

/**
 * Product stats
 */
export interface ProductStats {
  /** Product ID */
  productId: string;
  /** Product name */
  productName: string;
  /** View count */
  viewCount: number;
  /** Click count */
  clickCount: number;
  /** Purchase count */
  purchaseCount: number;
}

/**
 * Response for paging product stats
 */
export interface ProductStatsPageResponse {
  /** Page number */
  pageNumber: number;
  /** Page size */
  pageSize: number;
  /** Total items */
  totalItems: number;
  /** Contents */
  contents: ProductStats[];
}

/**
 * Product tag info
 */
export interface ProductTag {
  /** Tag ID */
  id?: number | string;
  /** Tag name */
  name?: string;
  [key: string]: unknown;
}

/**
 * Parameters for creating product tag
 */
export interface ProductTagCreateParams {
  /** Channel ID */
  channelId: string | number;
  /** Tag name */
  name: string;
}

/**
 * Response for creating product tag
 */
export interface ProductTagCreateResponse {
  /** Tag ID */
  id?: number | string;
  name?: string;
  [key: string]: unknown;
}

/**
 * Parameters for getting product tag
 */
export interface ProductTagGetParams {
  /** Channel ID */
  channelId: string | number;
  /** Tag ID */
  id: string | number;
}

/**
 * Parameters for listing product tags
 */
export interface ProductTagListParams extends V4PaginationParams {
  /** Channel ID */
  channelId: string | number;
}

/**
 * Parameters for updating product tag
 */
export interface ProductTagUpdateParams {
  /** Channel ID */
  channelId: string | number;
  /** Tag ID */
  id: string | number;
  /** Tag name */
  name: string;
}

/**
 * Parameters for deleting product tag
 */
export interface ProductTagDeleteParams {
  /** Channel ID */
  channelId: string | number;
  /** Tag ID */
  id: string | number;
}

/**
 * Parameters for paging gifts
 */
export interface GiftPageParams {
  /** Channel ID */
  channelId: string;
  /** Page number */
  pageNumber?: number;
  /** Page size */
  pageSize?: number;
  /** Start time */
  startTime?: number;
  /** End time */
  endTime?: number;
}

/**
 * Gift info
 */
export interface GiftInfo {
  /** Gift ID */
  giftId: string;
  /** Gift name */
  giftName: string;
  /** Sender name */
  senderName: string;
  /** Amount */
  amount: number;
  /** Send time */
  sendTime: number;
}

/**
 * Response for paging gifts
 */
export interface GiftPageResponse {
  /** Page number */
  pageNumber: number;
  /** Page size */
  pageSize: number;
  /** Total items */
  totalItems: number;
  /** Contents */
  contents: GiftInfo[];
}

/**
 * Parameters for paging likes
 */
export interface LikePageParams {
  /** Channel ID */
  channelId: string;
  /** Page number */
  pageNumber?: number;
  /** Page size */
  pageSize?: number;
  /** Start time */
  startTime?: number;
  /** End time */
  endTime?: number;
}

/**
 * Like info
 */
export interface LikeInfo {
  /** Viewer ID */
  viewerId: string;
  /** Viewer name */
  viewerName: string;
  /** Like count */
  likeCount: number;
  /** Like time */
  likeTime: number;
}

/**
 * Response for paging likes
 */
export interface LikePageResponse {
  /** Page number */
  pageNumber: number;
  /** Page size */
  pageSize: number;
  /** Total items */
  totalItems: number;
  /** Contents */
  contents: LikeInfo[];
}

// ============================================
// Task Reward Types
// ============================================

/**
 * Task reward info
 */
export interface TaskReward {
  /** Task ID */
  taskId: string;
  /** Channel ID */
  channelId: string;
  /** Task name */
  name: string;
  /** Task type */
  type: string;
  /** Status */
  status: string;
  /** Start time */
  startTime: number;
  /** End time */
  endTime: number;
  /** Created time */
  createdTime: number;
}

/**
 * Parameters for creating task reward
 */
export interface TaskRewardCreateParams {
  /** Channel ID */
  channelId: string;
  /** Task name */
  name: string;
  /** Task type */
  type: string;
  /** Start time */
  startTime?: number;
  /** End time */
  endTime?: number;
}

/**
 * Response for creating task reward
 */
export interface TaskRewardCreateResponse {
  /** Task ID */
  taskId: string;
}

/**
 * Parameters for getting task reward
 */
export interface TaskRewardGetParams {
  /** Channel ID */
  channelId: string;
  /** Task ID */
  taskId: string;
}

/**
 * Parameters for paging task rewards
 */
export interface TaskRewardPageParams {
  /** Channel ID */
  channelId: string;
  /** Page number */
  pageNumber?: number;
  /** Page size */
  pageSize?: number;
}

/**
 * Response for paging task rewards
 */
export interface TaskRewardPageResponse {
  /** Page number */
  pageNumber: number;
  /** Page size */
  pageSize: number;
  /** Total items */
  totalItems: number;
  /** Contents */
  contents: TaskReward[];
}

/**
 * Parameters for updating task reward
 */
export interface TaskRewardUpdateParams {
  /** Channel ID */
  channelId: string;
  /** Task ID */
  taskId: string;
  /** Task name */
  name?: string;
  /** Start time */
  startTime?: number;
  /** End time */
  endTime?: number;
}

/**
 * Parameters for deleting task reward
 */
export interface TaskRewardDeleteParams {
  /** Channel ID */
  channelId: string;
  /** Task ID */
  taskId: string;
}

/**
 * Parameters for stopping task reward
 */
export interface TaskRewardStopParams {
  /** Channel ID */
  channelId: string;
  /** Task ID */
  taskId: string;
}

/**
 * Parameters for getting task reward stats
 */
export interface TaskRewardStatsParams {
  /** Channel ID */
  channelId: string;
  /** Task ID */
  taskId: string;
}

/**
 * Task reward stats
 */
export interface TaskRewardStats {
  /** Task ID */
  taskId: string;
  /** Channel ID */
  channelId: string;
  /** Total participants */
  totalParticipants: number;
  /** Completed count */
  completedCount: number;
  /** Completion rate */
  completionRate: number;
}

/**
 * Parameters for submitting accept info
 */
export interface TaskRewardSubmitAcceptInfoParams {
  /** Channel ID */
  channelId: string;
  /** Task ID */
  taskId: string;
  /** Viewer ID */
  viewerId: string;
  /** Accept info */
  acceptInfo: Record<string, unknown>;
}

/**
 * Parameters for getting viewer detail
 */
export interface TaskRewardViewerDetailParams {
  /** Channel ID */
  channelId: string;
  /** Task ID */
  taskId: string;
  /** Viewer ID */
  viewerId: string;
}

/**
 * Task reward viewer detail
 */
export interface TaskRewardViewerDetail {
  /** Viewer ID */
  viewerId: string;
  /** Viewer name */
  viewerName: string;
  /** Task ID */
  taskId: string;
  /** Status */
  status: string;
  /** Progress */
  progress: number;
  /** Accept info */
  acceptInfo: Record<string, unknown>;
}

/**
 * Parameters for getting viewer union detail
 */
export interface TaskRewardViewerUnionDetailParams {
  /** Channel ID */
  channelId: string;
  /** Task ID */
  taskId: string;
  /** Union ID */
  unionId: string;
}

/**
 * Task reward viewer union detail
 */
export interface TaskRewardViewerUnionDetail {
  /** Union ID */
  unionId: string;
  /** Task ID */
  taskId: string;
  /** Status */
  status: string;
  /** Progress */
  progress: number;
}

// ============================================
// Other Types (Subtitle, Role Config, Watch, Popularization)
// ============================================

/**
 * Parameters for getting subtitle
 */
export interface GetSubtitleParams {
  /** Channel ID */
  channelId: string;
  /** Video ID */
  videoId?: string;
}

/**
 * Subtitle info
 */
export interface SubtitleInfo {
  /** Subtitle ID */
  subtitleId: string;
  /** Language */
  language: string;
  /** URL */
  url: string;
}

/**
 * Language info
 */
export interface LanguageInfo {
  /** Language code */
  code: string;
  /** Language name */
  name: string;
}

/**
 * Parameters for updating subtitle
 */
export interface UpdateSubtitleParams {
  /** Channel ID */
  channelId: string;
  /** Video ID */
  videoId: string;
  /** Subtitle URL */
  subtitleUrl: string;
  /** Language */
  language: string;
}

/**
 * Parameters for getting by role
 */
export interface GetByRoleParams {
  /** Channel ID */
  channelId: string;
  /** Role */
  role: string;
}

/**
 * Role config
 */
export interface RoleConfig {
  /** Channel ID */
  channelId: string;
  /** Role */
  role: string;
  /** Config */
  config: Record<string, unknown>;
}

/**
 * Parameters for updating by role
 */
export interface UpdateByRoleParams {
  /** Channel ID */
  channelId: string;
  /** Role */
  role: string;
  /** Config */
  config: Record<string, unknown>;
}

/**
 * Parameters for viewer logout
 */
export interface ViewerLogoutParams {
  /** Channel ID */
  channelId: string;
  /** Viewer ID */
  viewerId: string;
}

/**
 * Live status info
 */
export interface LiveStatusInfo {
  /** Channel ID */
  channelId: string;
  /** Live status */
  liveStatus: WatchStatus;
  /** Session ID */
  sessionId: string;
  /** Viewer count */
  viewerCount: number;
}

/**
 * Stream info
 */
export interface StreamInfo {
  /** Channel ID */
  channelId: string;
  /** Stream type */
  streamType: string;
  /** Stream URL */
  streamUrl: string;
  /** Status */
  status: string;
}

/**
 * Parameters for batch creating popularization
 */
export interface BatchCreatePopularizationParams {
  /** Channel ID */
  channelId: string;
  /** Popularizations */
  popularizations: Array<{
    name: string;
    url: string;
  }>;
}

/**
 * Response for batch creating popularization
 */
export interface BatchCreatePopularizationResponse {
  /** Created count */
  createdCount: number;
}

/**
 * Parameters for listing popularization
 */
export interface PopularizationListParams {
  /** Channel ID */
  channelId: string;
  /** Page number */
  pageNumber?: number;
  /** Page size */
  pageSize?: number;
}

/**
 * Popularization info
 */
export interface PopularizationInfo {
  /** Popularization ID */
  id: string;
  /** Channel ID */
  channelId: string;
  /** Name */
  name: string;
  /** URL */
  url: string;
  /** View count */
  viewCount: number;
  /** Created time */
  createdTime: number;
}

/**
 * Response for listing popularization
 */
export interface PopularizationListResponse {
  /** Page number */
  pageNumber: number;
  /** Page size */
  pageSize: number;
  /** Total items */
  totalItems: number;
  /** Contents */
  contents: PopularizationInfo[];
}

/**
 * Parameters for getting live session
 */
export interface GetLiveSessionParams {
  /** Channel ID */
  channelId: string;
  /** Session ID */
  sessionId?: string;
}

/**
 * Live session info
 */
export interface LiveSessionInfo {
  /** Session ID */
  sessionId: string;
  /** Channel ID */
  channelId: string;
  /** Start time */
  startTime: number;
  /** End time */
  endTime: number;
  /** Duration */
  duration: number;
  /** Viewer count */
  viewerCount: number;
  /** Max viewer count */
  maxViewerCount: number;
}

// ============================================
// V4 Channel Marketing & Content API Types
// ============================================

export interface ListCardPushesParams {
  channelId: string | number;
}

export type ListCardPushesResponse = CardPushInfo[];

// ============================================
// Type Aliases for Backward Compatibility
// ============================================

/** V4 Pagination parameters */
export interface V4PaginationParams {
  /** Page number (1-based) */
  page?: number;
  /** Page number alias */
  pageNumber?: number;
  /** Page size */
  pageSize?: number;
}

/** V4 Paginated response wrapper */
export interface V4PaginatedResponse<T> {
  /** Data items */
  contents: T[];
  /** Total count */
  total: number;
  /** Current page */
  pageNo?: number;
  /** Page size */
  pageSize?: number;
}

export type V4ChannelPageResponse<T> = V4PaginatedResponse<T>;

/** Channel ID parameter */
export interface ChannelIdParam {
  /** Channel ID */
  channelId: string;
}

/** Alias for ChannelScene (newScene in API) */
export type NewScene = ChannelScene;

/** Alias for ChannelTemplate */
export type Template = ChannelTemplate;

/** Broadcast type */
export type BroadcastType = 'normal' | 'transmit' | 'receive';

/** Double teacher type */
export type DoubleTeacherType = 'normal' | 'transmit' | 'receive';

// Re-export with expected names for service imports
export type BatchCreateChannelsParams = CreateBatchChannelsParams;
export type BatchCreateChannelsResponse = CreateBatchChannelsResponse;
export type ChannelDetail = ChannelDetailInfo;
export type ChannelBasicListItem = ChannelBasicInfo;
export type ChannelSimpleListItem = ChannelSimpleInfo;
export type ChannelDetailListItem = ChannelDetailInfo;
export type DistributeItem = DistributeInfo;
export type ListDistributeParams = DistributeListParams;
export type CreateDistributeBatchParams = DistributeCreateBatchParams;
export type UpdateDistributeBatchParams = DistributeUpdateBatchParams;
export type DeleteDistributeBatchParams = DistributeDeleteBatchParams;
export type GetDistributeStatisticParams = DistributeStatisticParams;
export type PlaybackItem = PlaybackInfo;
export type RecordedFileItem = RecordedFileInfo;
export type CreateLotteryActivityParams = LotteryActivityCreateParams;
export type CreateLotteryActivityResponse = LotteryActivityCreateResponse;
export type GetLotteryActivityParams = LotteryActivityGetParams;
export type ListLotteryActivitiesParams = LotteryActivityListParams;
export type ListLotteryActivitiesResponse = LotteryActivityListResponse;
export type UpdateLotteryActivityParams = LotteryActivityUpdateParams;
export type DeleteLotteryActivityParams = LotteryActivityDeleteParams;
export type GroupResponse = GroupAddResponse;
export type CreateViewerNameGroupParams = GroupCreateViewerNameParams;
export type CardPushItem = CardPushInfo;
export type GetShareParams = ShareGetParams;
export type UpdateShareParams = ShareUpdateParams;
export type CreateCardPushParams = CardPushCreateParams;
export type CreateCardPushResponse = CardPushCreateResponse;
export type UpdateCardPushParams = CardPushUpdateParams;
export type DeleteCardPushParams = CardPushDeleteParams;
export type PushCardParams = CardPushPushParams;
export type CancelCardPushParams = CardPushCancelPushParams;
export type InviteRankItem = InviteRankInfo;
export type LiveStatusItem = LiveStatusInfo;
export type MonitorStreamInfo = StreamInfo;
export type LotteryStatistics = LotteryInfo;
export type ProductSetting = ProductSettings;
export type ProductStatsItem = ProductStats;
export type CreateProductTagParams = ProductTagCreateParams;
export type CreateProductTagResponse = ProductTagCreateResponse;
export type GetProductTagParams = ProductTagGetParams;
export type ListProductTagsParams = ProductTagListParams;
export type ListChannelProductTagsResponse = V4ChannelPageResponse<ProductTag>;
export type UpdateProductTagParams = ProductTagUpdateParams;
export type DeleteProductTagParams = ProductTagDeleteParams;
export type GiftItem = GiftInfo;
export type LikeItem = LikeInfo;
export type CreateTaskRewardParams = TaskRewardCreateParams;
export type CreateTaskRewardResponse = TaskRewardCreateResponse;
export type GetTaskRewardParams = TaskRewardGetParams;
export type UpdateTaskRewardParams = TaskRewardUpdateParams;
export type DeleteTaskRewardParams = TaskRewardDeleteParams;
export type StopTaskRewardParams = TaskRewardStopParams;
export type GetTaskRewardStatsParams = TaskRewardStatsParams;
export type SubmitAcceptInfoParams = TaskRewardSubmitAcceptInfoParams;
export type GetViewerDetailParams = TaskRewardViewerDetailParams;
export type GetViewerUnionDetailParams = TaskRewardViewerUnionDetailParams;
export type PopularizationItem = PopularizationInfo;

/**
 * Add channel coupon params
 */
export interface AddChannelCouponParams {
  /** Channel ID */
  channelId: string;
  /** Coupon ID list (1-30) */
  couponIds: string[];
}
