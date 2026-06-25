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

/** A single interaction listener task rule (see tasks params of interaction-event/save). */
export interface InteractionEventSaveTask {
  /** Task condition type: onlineTime|signCount|speakCount|customCount|loginList|taskEndTimeOnline */
  type: string;
  /** Start time (13-digit ms epoch) */
  startTime: number;
  /** End time (13-digit ms epoch) */
  endTime: number;
  /** Online duration in ms (type=onlineTime) */
  onlineTime?: number;
  /** Sign-in count (type=signCount) */
  signCount?: number;
  /** User tags */
  userTags?: unknown[];
  /** Comment count (type=speakCount) */
  speakCount?: number;
  /** Comment content (type=speakCount) */
  speakContent?: string;
  /** Custom count (type=customCount) */
  customCount?: number;
  /** Event type (type=customCount) */
  eventType?: string;
  /** Payload (<=500 chars) */
  payload?: string;
}

/**
 * Parameters for saving interaction event
 */
export interface InteractionEventSaveParams {
  /** Channel ID */
  channelId: string;
  /** Task rule list */
  tasks: InteractionEventSaveTask[];
  /** Whether all tasks must complete to count the activity done: Y or N */
  allDone: 'Y' | 'N';
  /** Callback URL */
  callbackUrl?: string;
  /** Payload */
  payload?: string;
}

/** Response data for saving interaction event (the unwrapped `data` field). */
export interface InteractionEventSaveResponse {
  /** Activity ID (pass to delete as a taskId when allDone=Y) */
  activityId: string;
  /** Per-task creation results */
  list: Array<{
    taskId: string;
    result: {
      status: string;
      message: string;
      code: number;
      data: unknown;
    };
  }>;
}

/**
 * Parameters for deleting interaction event
 */
export interface InteractionEventDeleteParams {
  /** Channel ID */
  channelId: string;
  /**
   * Task ID collection. When the activity was saved with allDone=Y, pass the
   * activityId; when allDone=N, pass the specific taskIds to delete.
   */
  taskIds: string[];
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
// V4 Channel Core Exact API Types
// ============================================

export type ChannelIdListInput = string | Array<string | number>;

export interface V4ChannelPageResponse<T> {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  contents: T[];
}

export interface BatchPlaybackListParams {
  /** Channel IDs, max 100 */
  channelIds: ChannelIdListInput;
}

export interface PlaybackVideoListItem {
  videoId?: string | null;
  videoPoolId?: string | null;
  fileId?: string | null;
  duration?: string | null;
  name?: string | null;
  watchUrl?: string | null;
}

export interface ChannelPlaybackSetting {
  channelId: number;
  playBackEnabled: YNFlag;
  origin?: 'record' | 'playback' | 'vod' | string;
  type?: 'single' | 'list' | string;
  videoList?: PlaybackVideoListItem[];
  globalSettingEnabled?: YNFlag;
}

export type BatchPlaybackListResponse = ChannelPlaybackSetting[];

export interface SessionExternalBySessionParams extends GetRelevanceParams {}

export interface SessionExternalBySessionResponse {
  channelId: number;
  sessionId: string;
  externalSessionId?: string;
}

export interface ChannelLotteryListParams extends V4PaginationParams {
  channelId: string;
  lotteryId?: string;
  sessionId?: string;
  startTime?: number;
  endTime?: number;
}

export interface ChannelLotteryCollectInfo {
  field: string;
  tips: string;
}

export interface ChannelLotteryRecord {
  winnerCount: number;
  totalUsers: number;
  lotteryId: string;
  channelId: number;
  userId: string;
  sessionId: string;
  lotteryRange?: string;
  actor?: string;
  prize?: string;
  amount?: number;
  preset?: string;
  lotteryExt?: {
    collectInfo?: ChannelLotteryCollectInfo[];
    [key: string]: unknown;
  };
  createdTime: number;
}

export type ChannelLotteryListResponse = V4ChannelPageResponse<ChannelLotteryRecord>;

export interface AccountViewerConfig {
  actor?: string;
  actorEnabled?: YNFlag;
  questionStudentTitle?: string;
  questionStudentTitleEnabled?: YNFlag;
}

export interface LiveDataParams {
  channelId: string;
  startTime?: number;
  endTime?: number;
}

export interface LiveDataSummary {
  watchData?: {
    viewers?: number;
    plays?: number;
    playDuration?: number;
    averagePlayDuration?: number;
    pageView?: number;
    likes?: number;
  };
  realTimeData?: {
    maxConcurrent?: number;
    date?: number;
  };
  provinceData?: Array<{
    province?: string;
    viewers?: number;
    averagePlayDuration?: number;
  }>;
}

export interface SubtitleConfigParams {
  channelId: string | number;
}

export interface SubtitleConfig {
  realTimeSubtitleEnabled?: YNFlag;
  realTimeSubtitleDisplayEnabled?: YNFlag;
  sourceLanguage?: string;
  subtitleTranslationEnabled?: YNFlag;
  translationLanguage?: string;
  translationLanguages?: string[];
  subtitleCallbackEnabled?: YNFlag;
  subtitleCallbackUrl?: string;
  realTimeSubtitleDisplayNumberLimitEnabled?: YNFlag;
  realTimeSubtitleDisplayNumber?: number;
}

export interface SubtitleLanguageInfo {
  code: string;
  text: string;
  type: 'source' | 'translate' | 'all' | string;
}

export interface SessionStatsListParams extends V4PaginationParams {
  startTime?: number;
  endTime?: number;
}

export interface LiveSessionStatsItem {
  channelId: number;
  sessionId: string;
  name?: string;
  startTime?: number;
  endTime?: number;
  userId?: string;
}

export type SessionStatsListResponse = V4ChannelPageResponse<LiveSessionStatsItem>;

export interface ListAllChannelBasicParams extends V4PaginationParams {
  categoryIds?: string | Array<string | number>;
  channelIds?: ChannelIdListInput;
  watchStatus?: WatchStatus | 'banpush' | string;
  startTime?: number;
  endTime?: number;
  orderBy?: 'startTimeDesc' | 'startTimeAsc' | 'channelCreatedTimeDesc' | string;
}

export interface ListAllChannelSimpleParams extends V4PaginationParams {
  categoryId?: string | number;
  watchStatus?: WatchStatus | 'banpush' | string;
  keyword?: string;
  orderBy?: 'startTimeDesc' | 'startTimeAsc' | 'channelCreatedTimeDesc' | string;
}

export interface AllChannelSimpleListItem {
  channelId: string;
  name: string;
  channelPasswd?: string;
  categoryId?: string;
  scene?: string;
  sceneText?: string;
  watchStatus?: string;
  watchStatusText?: string;
  watchUrl?: string;
}

export type ListAllChannelBasicResponse = V4ChannelPageResponse<ChannelBasicInfo>;
export type ListAllChannelSimpleResponse = V4ChannelPageResponse<AllChannelSimpleListItem>;

export interface WeixinBookingListParams extends V4PaginationParams {
  channelId: string;
  startTime?: number;
  endTime?: number;
}

export interface WeixinBookingItem {
  channelId: string | number;
  channelName?: string;
  openId: string;
  nickname?: string | null;
  createdTime: number;
  TBname?: string | null;
  TBnumber?: string | null;
}

export type WeixinBookingListResponse = V4ChannelPageResponse<WeixinBookingItem>;

export interface InviteListParams extends V4PaginationParams {
  channelId: string;
  senderViewerId?: string;
  startTime?: number;
  endTime?: number;
}

export interface InviteListItem {
  invitee?: string | null;
  openId?: string;
  viewerId?: string;
  nickname?: string;
  avatar?: string;
  createdTime?: number;
  receiverNickname?: string;
  receiverOpenId?: string;
  receiverViewerId?: string;
  receiverTime?: number;
  receiverAvatar?: string;
  receiverPlayDuration?: number;
  receiverLivePlayDuration?: number;
  receiverPlaybackPlayDuration?: number;
  receiverCheckInCount?: number;
  receiverRegion?: string;
  receiverCity?: string;
}

export type InviteListResponse = V4ChannelPageResponse<InviteListItem>;

export interface DistributeStatisticExactParams {
  channelId: string;
  sessionIds?: string | string[];
  startTime?: number;
  endTime?: number;
}

export interface DistributeStatisticItem {
  channelId: number;
  sessionId?: string;
  liveStartTime?: number;
  liveEndTime?: number;
  distributeUrl?: string;
  distributeStartTime?: number;
  distributeEndTime?: number;
  duration?: number;
  desc?: string;
}

export type DistributeStatisticExactResponse = DistributeStatisticItem[];

export interface CreateInitBasicSetting extends CreateChannelParams {
  streamType?: 'client' | 'disk' | string;
  logoImg?: string;
  description?: string;
}

export interface CreateInitMasterAuthSetting {
  enabled: YNFlag;
  authType?: string;
  authCode?: string;
  codeAuthTips?: string;
  qCodeTips?: string;
  qCodeImg?: string;
  payAuthTips?: string;
  price?: number;
  watchEndTime?: number;
  validTimePeriod?: number;
  customKey?: string;
  customUri?: string;
  externalKey?: string;
  externalUri?: string;
  externalRedirectUri?: string;
  externalEntryText?: string;
  directKey?: string;
}

export interface CreateInitPlaybackSetting {
  playbackEnabled?: YNFlag;
  sectionEnabled?: YNFlag;
  type?: 'single' | 'list' | string;
  origin?: 'record' | 'playback' | 'vod' | string;
}

export interface ChannelRoleInput {
  role: 'Teacher' | 'Assistant' | 'Guest' | string;
  nickName?: string;
  actor?: string;
  passwd?: string;
  avatar?: string;
}

export interface CreateInitChannelParams {
  basicSetting: CreateInitBasicSetting;
  masterAuthSetting?: CreateInitMasterAuthSetting;
  playbackSetting?: CreateInitPlaybackSetting;
  roles?: ChannelRoleInput[];
}

export interface CreateInitChannelResponse extends CreateChannelResponse {
  name?: string;
  publisher?: string;
  description?: string;
  newScene?: string;
  template?: string;
  linkMicLimit?: number;
  pureRtcEnabled?: YNFlag;
  type?: string;
  currentTimeMillis?: number;
}

export interface AccountPurview {
  code: string;
  enabled: YNFlag;
}

export interface CreateAccountParams {
  channelId: string;
  role: 'Assistant' | 'Guest' | string;
  actor?: string;
  nickName?: string;
  avatar?: string;
  passwd?: string;
  purviewList?: AccountPurview[];
}

export interface ChannelRoleAccount {
  account: string;
  userId?: string;
  channelId: number;
  passwd?: string;
  nickname?: string;
  stream?: string;
  status?: YNFlag;
  createdTime?: number;
  lastModified?: number;
  sort?: number;
  avatar?: string;
  actor?: string;
  role?: string;
  monitorEnabled?: YNFlag;
  pageTurnEnabled?: YNFlag;
  chatListEnabled?: YNFlag;
  chatAuditEnabled?: YNFlag;
}

export interface UpdateAccountInfoParams {
  channelId: string;
  account: string;
  actor?: string;
  nickName?: string;
  avatar?: string;
  passwd?: string;
  purviewList?: AccountPurview[];
}

export interface DeleteAccountsBatchParams {
  channelId: string;
  accounts: string | string[];
}

export interface CreateMrChannelExactParams extends CreateMrChannelParams {
  startTime?: number;
  channelPasswd?: string;
  assistantPasswd?: string;
  splashImg?: string;
  subAccount?: string;
}

export interface CreateMrChannelExactResponse {
  channelId: string;
  name: string;
  userId: string;
  channelPasswd?: string;
  assistantAccount?: string;
  assistantPasswd?: string;
}

export interface MonitorListStreamInfoParams {
  channelId: string;
  startTime?: string | number;
  endTime?: string | number;
}

export interface MonitorStreamInfoPoint {
  audioFrameRate?: string;
  bitRate?: string;
  streamUrl?: string;
  time?: string;
  timestamp?: number;
  videoFrameRate?: string;
}

export interface BatchPlaybackVideoInfoParams {
  channelIds: ChannelIdListInput;
}

export interface PlaybackVideoInfoByChannel {
  channelId: number;
  vid?: string | null;
  videoId?: string | null;
  videoPoolId?: string | null;
  videoName?: string | null;
  firstImg?: string | null;
  duration?: string | null;
}

export interface LiveStatusListParams {
  channelIds: ChannelIdListInput;
}

export interface ChannelLiveStatusItem {
  channelId: number;
  liveStatus: WatchStatus | 'banpush' | string;
}

export interface TeacherListParams {
  channelIds: Array<string | number>;
}

export interface TeacherInfo {
  channelId: number;
  passwd?: string;
  userId?: string;
  nickname?: string;
  customTeacherId?: string;
  actor?: string;
  avatar?: string;
  globalSettingEnabled?: YNFlag;
  notifyEnabled?: YNFlag;
  checkinEnabled?: YNFlag;
  voteEnabled?: YNFlag;
  lotteryEnabled?: YNFlag;
}

export interface ChannelSubtitleBatchItem {
  id: number;
  name?: string;
  status?: 'publish' | 'finish' | string;
}

export interface UpdateChannelSubtitleBatchParams {
  channelId: string | number;
  body: ChannelSubtitleBatchItem[];
}

export interface UpdateSkinBatchParams {
  channelIds: ChannelIdListInput;
  skin: 'black' | 'red' | 'blue' | 'white' | 'green' | 'golden' | string;
}

export interface UpdateAccountViewerConfigParams extends AccountViewerConfig {
  channelId: string;
}

export interface SetPullBitrateExactParams {
  channelId: string;
  pullBitRate: -1 | 400 | 600 | 800 | 1000 | 1500 | 2000 | 2500 | number;
}

export interface UpdateTemplateExactParams {
  channelId: string;
  template: ChannelTemplate | string;
}

export interface UpdateSubtitleConfigParams extends SubtitleConfig {
  channelId: string | number;
}

// ============================================
// V4 Channel Interaction Exact API Types
// ============================================

export interface LotteryReceiveInfo {
  type?: 'userName' | 'userPhone' | 'custom' | string;
  field: string;
  tips: string;
  required?: boolean;
}

export interface LotteryPrizeInfo {
  prizeItem: string;
  correctAnswerCount: number;
  prizeName: string;
  thumbnail?: string;
  realPrice?: number;
  price?: number;
  acceptType: 'form' | 'link' | 'qrCode' | string;
  formInfo?: LotteryReceiveInfo[];
  prizeUrl?: string;
  qrCode?: string;
  qrCodeTips?: string;
  amount: number;
  hiddenWinnerAmount?: YNFlag;
}

export interface LotteryViewerGroup {
  id: number;
  title: string;
  type?: string;
  count?: number | string;
  createTime?: number;
  [key: string]: unknown;
}

export interface CreateLotteryViewerGroupParams {
  channelId: string | number;
  title: string;
}

export type CreateLotteryViewerGroupResponse = LotteryViewerGroup;

export interface UpdateLotteryViewerGroupParams {
  channelId: string | number;
  id: string | number;
  title: string;
}

export type UpdateLotteryViewerGroupResponse = LotteryViewerGroup;

export interface DeleteLotteryViewerGroupParams {
  channelId: string | number;
  id: string | number;
}

export interface ListLotteryViewerGroupsParams extends V4PaginationParams {
  channelId: string | number;
}

export type ListLotteryViewerGroupsResponse = V4ChannelPageResponse<LotteryViewerGroup>;

export interface LotteryGroupViewer {
  id: number;
  groupId: string | number;
  viewerId: string;
  viewerName?: string;
  createTime?: number;
  [key: string]: unknown;
}

export interface ListLotteryGroupViewersParams extends V4PaginationParams {
  channelId: string | number;
  groupId: string | number;
}

export type ListLotteryGroupViewersResponse = V4ChannelPageResponse<LotteryGroupViewer>;

export interface CreateLotteryGroupViewersParams {
  channelId: string | number;
  groupId: string | number;
  viewerIds: Array<string | number>;
}

export type CreateLotteryGroupViewersResponse = LotteryGroupViewer[];

export interface DeleteLotteryGroupViewersParams {
  channelId: string | number;
  groupId: string | number;
  ids: Array<string | number>;
}

export interface LotteryGroupViewerName {
  viewerId: string;
  viewerName: string;
}

export interface CreateLotteryGroupViewerNamesParams {
  channelId: string | number;
  groupId: string | number;
  viewerNames: LotteryGroupViewerName[];
}

export type CreateLotteryGroupViewerNamesResponse = LotteryGroupViewer[];

export interface LotteryBlacklistViewer {
  id: number;
  viewerId: string;
  viewerName?: string;
  createTime?: number;
  [key: string]: unknown;
}

export interface ListLotteryBlacklistViewersParams extends V4PaginationParams {
  channelId: string | number;
}

export type ListLotteryBlacklistViewersResponse = V4ChannelPageResponse<LotteryBlacklistViewer>;

export interface CreateLotteryBlacklistViewersParams {
  channelId: string | number;
  viewerIds: Array<string | number>;
}

export type CreateLotteryBlacklistViewersResponse = LotteryBlacklistViewer[];

export interface DeleteLotteryBlacklistViewersParams {
  channelId: string | number;
  ids: Array<string | number>;
}

export interface LuckyBagWinner {
  viewerId?: string;
  viewerName?: string;
  nickname?: string;
  mobile?: string;
  winTime?: number;
  [key: string]: unknown;
}

export interface ListLuckyBagWinnersParams {
  activityId: string | number;
  sessionId?: string;
  currentPage?: number;
  pageSize?: number;
}

export type ListLuckyBagWinnersResponse = V4ChannelPageResponse<LuckyBagWinner>;

export interface InteractionEventTask {
  taskId: string;
  activityId: string;
  type: string;
  startTime: number;
  endTime: number;
  status: 'waiting' | 'running' | 'ended' | string;
  userTags?: string[];
  payload?: string;
  onlineTime?: number;
  signCount?: number;
  likesCount?: number;
  speakCount?: number;
  speakContent?: string;
  customCount?: number;
  eventType?: string;
  loginDays?: number;
  minOnlineTimePerDay?: number;
  logicType?: 'AND' | 'OR' | string;
  allDone?: YNFlag;
  isUnlock?: YNFlag;
  parentTaskId?: string;
  [key: string]: unknown;
}

export interface ListInteractionEventsParams {
  roomId: string;
}

export interface ListInteractionEventsResponse {
  list: InteractionEventTask[];
}

export interface DiskVideoCustomScript {
  id: number | string;
  channelId?: number | string;
  diskVideoId?: string;
  labelId?: number;
  [key: string]: unknown;
}

export interface QueryDiskVideoCustomScriptParams {
  channelId: string | number;
  diskVideoId: string;
}

export type QueryDiskVideoCustomScriptResponse = DiskVideoCustomScript[];

export interface UploadDiskVideoCustomScriptParams {
  channelId: string | number;
  diskVideoId: string;
  file: File | Blob;
  labelId?: string | number;
}

export interface UploadDiskVideoCustomScriptResponse {
  id: number | string;
}

export interface DeleteInteractionScriptParams {
  channelId: string | number;
  id: string | number;
}

export interface InvitePosterCreateParams {
  channelId: string | number;
  openId: string;
  nickname: string;
  avatar?: string;
  viewerId?: string;
  invitee?: string;
}

export interface InvitePosterCreateResponse {
  [key: string]: unknown;
}

export interface LotteryActivityRecord {
  id?: number | string;
  channelId?: number | string;
  lotteryId?: string;
  sessionId?: string;
  activityName?: string;
  startTime?: number;
  winnerCount?: number;
  totalUsers?: number;
  [key: string]: unknown;
}

export interface ListLotteryActivityRecordsParams extends V4PaginationParams {
  channelId: string | number;
  sessionId?: string;
  startTimeBegin?: number;
  startTimeEnd?: number;
  lotteryId?: string;
}

export type ListLotteryActivityRecordsResponse = V4ChannelPageResponse<LotteryActivityRecord>;

export interface CreateConditionWaitLotteryParams {
  channelId: string | number;
  id: string | number;
  lotteryTime: number;
}

export interface CreateConditionWaitLotteryResponse {
  [key: string]: unknown;
}

export interface RewardGiftRecord {
  viewerId?: string;
  viewerName?: string;
  giftName?: string;
  price?: number;
  count?: number;
  createTime?: number;
  [key: string]: unknown;
}

export interface ListRewardGiftsParams extends V4PaginationParams {
  channelId: string | number;
  start: number;
  end: number;
}

export type ListRewardGiftsResponse = V4ChannelPageResponse<RewardGiftRecord>;

export interface RewardLikeRecord {
  viewerId?: string;
  viewerName?: string;
  likeCount?: number;
  createTime?: number;
  [key: string]: unknown;
}

export interface ListRewardLikesParams extends V4PaginationParams {
  channelId: string | number;
  start?: number;
  end?: number;
}

export type ListRewardLikesResponse = V4ChannelPageResponse<RewardLikeRecord>;

export interface TaskRewardReachCondition {
  type: 'sign' | 'online' | 'questionnaire' | 'custom' | string;
  amount: number;
  templateId?: number;
  customEvent?: string;
  customEventName?: string;
  customIcon?: string;
  customUnit?: string;
  customButtonText?: string;
  customReachText?: string;
}

export interface TaskRewardSetting {
  type: 'cash' | 'custom' | 'nothing' | 'externalPoint' | string;
  amount?: number;
  limit?: number;
  customReward?: string;
}

export interface TaskRewardActivityTask {
  sort?: number;
  reachCondition: TaskRewardReachCondition;
  rewardSetting: TaskRewardSetting;
}

export interface TaskRewardActivity {
  activityId: number;
  channelId?: number | string;
  activityName?: string;
  taskRule?: number;
  startTime?: number;
  endTime?: number;
  status?: string;
  tasks?: TaskRewardActivityTask[];
  [key: string]: unknown;
}

export interface CreateTaskRewardActivityParams {
  channelId: string | number;
  activityName: string;
  taskRule: number;
  startTime: number;
  endTime: number;
  tasks: TaskRewardActivityTask[];
}

export type CreateTaskRewardActivityResponse = number;

export interface UpdateTaskRewardActivityParams {
  channelId: string | number;
  activityId: string | number;
  tasks: TaskRewardActivityTask[];
  activityName?: string;
  taskRule?: number;
  startTime?: number;
  endTime?: number;
}

export interface ListTaskRewardActivitiesParams extends V4PaginationParams {
  channelId: string | number;
}

export type ListTaskRewardActivitiesResponse = V4ChannelPageResponse<TaskRewardActivity>;

export interface DeleteTaskRewardActivityParams {
  activityId: string | number;
}

export interface StopTaskRewardActivityParams {
  activityId: string | number;
}

export interface ListTaskRewardStatsParams extends V4PaginationParams {
  channelId: string | number;
}

export interface TaskRewardStatsRecord {
  activityId?: number | string;
  activityName?: string;
  submitCount?: number;
  rewardCount?: number;
  [key: string]: unknown;
}

export type ListTaskRewardStatsResponse = V4ChannelPageResponse<TaskRewardStatsRecord>;

export interface ListTaskRewardViewerDetailsParams extends V4PaginationParams {
  channelId: string | number;
  activityId: string | number;
  viewerId?: string;
}

export interface TaskRewardViewerDetailRecord {
  id?: number | string;
  activityId?: number | string;
  viewerId?: string;
  formInfo?: TaskRewardAcceptFormInfo[];
  [key: string]: unknown;
}

export type ListTaskRewardViewerDetailsResponse = V4ChannelPageResponse<TaskRewardViewerDetailRecord>;

export interface ListViewerTaskRewardDetailsParams extends V4PaginationParams {
  viewerId: string;
}

export type ListViewerTaskRewardDetailsResponse = V4ChannelPageResponse<TaskRewardViewerDetailRecord>;

export interface TaskRewardAcceptFormInfo {
  field: string;
  value?: string;
  type?: string;
  [key: string]: unknown;
}

export interface SubmitViewerTaskRewardAcceptInfoParams {
  id: string | number;
  viewerId: string;
  formInfo: TaskRewardAcceptFormInfo[];
}

export interface GiftDonatePayItem {
  name?: string;
  enabled?: YNFlag;
  imgType?: 'STATIC' | 'DYNAMIC' | string;
  img?: string;
  dynamicImg?: string;
  dynamicFile?: string;
  price?: number | string;
}

export interface GiftDonateConfig {
  payWay?: 'CASH' | 'POINT' | string;
  pointUnit?: string;
  cashPays?: GiftDonatePayItem[];
  pointPays?: GiftDonatePayItem[];
}

export interface UpdateDonateGiftParams {
  channelId: string | number;
  donateGiftEnabled: YNFlag;
  giftDonate?: GiftDonateConfig;
}

// ============================================
// V4 Channel Marketing & Content Exact API Types
// ============================================

export interface ListCardPushesParams {
  channelId: string | number;
}

export type ListCardPushesResponse = CardPushInfo[];

export interface CardPushIdParams {
  channelId: string | number;
  cardPushId: string | number;
}

export interface CouponEnabled {
  enabled: YNFlag;
  [key: string]: unknown;
}

export interface CouponEnabledParams {
  channelId: string | number;
}

export interface UpdateCouponEnabledParams extends CouponEnabledParams {
  enabled: YNFlag;
}

export interface ChannelCoupon {
  couponId?: string;
  name?: string;
  status?: string;
  [key: string]: unknown;
}

export interface ListChannelCouponsParams extends V4PaginationParams {
  channelId: string | number;
  name?: string;
}

export type ListChannelCouponsResponse = V4ChannelPageResponse<ChannelCoupon>;

export interface DeleteChannelCouponsParams {
  channelId: string | number;
  couponIds: Array<string | number>;
}

export interface ProductPushRule {
  productExplainEnabled?: YNFlag;
  productExplainingAutoPushAndSticky?: YNFlag;
  productListSortType?: 'ASC' | 'DESC' | string;
  productTagSortType?: 'DEFAULT' | 'CUSTOM' | string;
  productPushRule?: 'smallCard' | 'bigCard' | 'chooseCard' | string;
  productHotEffectEnabled?: YNFlag;
  normalProductHotEffectTips?: string;
  jobProductHotEffectTips?: string;
  financeProductHotEffectTips?: string;
  outLinkProductRedirectEnabled?: YNFlag;
  productTagSortOrderIds?: Array<string | number>;
  [key: string]: unknown;
}

export interface ProductPushRuleParams {
  channelId: string | number;
}

export interface UpdateProductPushRuleParams extends ProductPushRuleParams, ProductPushRule {}

export interface ProductStatsExact {
  productId?: string | number;
  productName?: string;
  viewCount?: number;
  clickCount?: number;
  [key: string]: unknown;
}

export interface ListProductStatsParams extends V4PaginationParams {
  channelId: string | number;
  productId?: string;
  productName?: string;
  sessionId?: string;
}

export type ListProductStatsResponse = V4ChannelPageResponse<ProductStatsExact>;

export interface ProductStatsSummaryParams {
  channelId: string | number;
  sessionId?: string;
}

export interface ProductStatsSummary {
  [key: string]: unknown;
}

export interface SortChannelProductRankParams {
  channelId: string | number;
  productId: string | number;
  rank: number;
}

export interface ChannelProductActionParams {
  channelId: string | number;
  productId: string | number;
}

export interface BatchCreatePopularizationsExactParams {
  channelId: string | number;
  names: string[];
}

export interface PopularizationExact {
  id?: number | string;
  name?: string;
  url?: string;
  [key: string]: unknown;
}

export type BatchCreatePopularizationsExactResponse = PopularizationExact[];

export interface ListPopularizationsExactParams {
  channelId: string | number;
}

export type ListPopularizationsExactResponse = PopularizationExact[];

export interface RecordFileExact {
  fileId?: string;
  channelId?: string | number;
  name?: string;
  duration?: number;
  [key: string]: unknown;
}

export interface ListMaterialRecordFilesParams extends V4PaginationParams {
  channelId: string | number;
}

export type ListMaterialRecordFilesResponse = V4ChannelPageResponse<RecordFileExact>;

export interface CreateRecordFileOutlineParams {
  fileId: string;
  aiKnowledgeQuizEnabled?: YNFlag;
  aiSummaryAuditEnabled?: YNFlag;
  syncToPlaybackDotEnabled?: YNFlag;
}

export interface RecordFileOutline {
  fileId?: string;
  outline?: unknown;
  [key: string]: unknown;
}

export interface GetRecordFileOutlineParams {
  channelId: string | number;
  fileId: string;
}

export interface RecordFileSubtitlePublishItem {
  id: string | number;
  status: 'finish' | 'publish' | string;
}

export interface BatchPublishRecordFileSubtitlesParams {
  subtitles: RecordFileSubtitlePublishItem[];
}

export interface WatchViewerLogoutParams {
  channelId: string | number;
  token?: string;
}

export interface BatchUpdateChatEnabledParams {
  channelIds: Array<string | number>;
  chatEnabled: YNFlag;
}

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
