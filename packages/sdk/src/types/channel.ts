/**
 * Channel Types
 *
 * Type definitions for PolyV Live Channel operations.
 * This file is intentionally minimal - types will be properly defined during implementation.
 *
 * @module types/channel
 */

/**
 * Channel Scene Types (V2 API)
 */
export type ChannelScene = 'alone' | 'ppt' | 'topclass' | 'seminar';

/**
 * Channel New Scene Types (V4 API)
 * 直播场景
 */
export type NewScene = 'topclass' | 'double' | 'train' | 'alone' | 'seminar' | 'guide';

/**
 * Channel Template Types (V4 API)
 * 直播模板
 */
export type Template =
  | 'ppt' // 三分屏-横屏
  | 'portrait_ppt' // 三分屏-竖屏
  | 'alone' // 纯视频-横屏
  | 'portrait_alone' // 纯视频-竖屏
  | 'topclass' // 纯视频极速-横屏
  | 'portrait_topclass' // 纯视频极速-竖屏
  | 'seminar'; // 研讨会

/**
 * Channel Broadcast Type (V4 API)
 * 转播类型
 */
export type BroadcastType = 'normal' | 'transmit' | 'receive';

/**
 * Double Teacher Type (V4 API)
 * 线上双师类型
 */
export type DoubleTeacherType = 'transmit' | 'receive';

/**
 * Channel Stream Types
 */
export type ChannelStreamType = 'client' | 'pull' | 'thirdpull' | 'disk' | 'audio';

/**
 * Y/N Flag Type
 */
export type YNFlag = 'Y' | 'N';

/**
 * Channel Model
 *
 * Basic channel information returned from API operations.
 */
export interface ChannelModel {
  channelId: string;
  userId: string;
  name: string;
  publisher?: string;
  description?: string;
  url: string;
  stream: string;
  scene: ChannelScene;
  channelPasswd: string;
  streamType: ChannelStreamType;
  pureRtcEnabled: YNFlag;
  status?: string;
  createdTime?: number;
  lastModified?: number;
}

/**
 * Channel Detail
 *
 * Complete channel details including all configuration options.
 */
export interface ChannelDetail extends ChannelModel {
  categoryId?: string;
  maxViewer?: number;
  linkMicLimit?: number;
  playerColor?: string;
  autoPlay?: number;
  logoImage?: string;
  logoOpacity?: number;
  logoPosition?: string;
}

/**
 * Create Channel Request
 *
 * Parameters required for creating a new channel.
 */
export interface CreateChannelRequest {
  /** Channel name (max 60 characters) - REQUIRED */
  name: string;
  /** Channel password (max 16 characters) - REQUIRED */
  channelPasswd: string;
  /** PolyV user ID - REQUIRED */
  userId: string;
  /** Live stream scene - OPTIONAL */
  scene?: ChannelScene;
  /** Real-time communication enabled - OPTIONAL */
  pureRtcEnabled?: YNFlag;
  /** Category ID - OPTIONAL */
  categoryId?: string;
  /** Maximum online viewers - OPTIONAL */
  maxViewer?: number;
  /** Link mic limit (-1 to 16) - OPTIONAL */
  linkMicLimit?: number;
  /** Player color (hex) - OPTIONAL */
  playerColor?: string;
  /** Auto play (0/1) - OPTIONAL */
  autoPlay?: number;
  /** Stream type - OPTIONAL */
  streamType?: ChannelStreamType;
}

/**
 * Create Channel V4 Request
 *
 * Parameters required for creating a new channel using V4 API.
 * V4 API uses JSON body for request parameters.
 *
 * @see v4/channel/create.md under POLYV_API_DOCS_DIR or ../document-center/docs/live/api relative to the repository root
 */
export interface CreateChannelV4Request {
  /** 直播名称，最大长度100 - REQUIRED */
  name: string;
  /** 直播场景 - REQUIRED */
  newScene: NewScene;
  /** 直播模板 - REQUIRED */
  template: Template;
  /** 讲师登录密码，长度6-16位，不传则由系统随机生成 */
  channelPasswd?: string;
  /** 研讨会主持人密码，仅直播场景是研讨会时有效，长度6-16位 */
  seminarHostPassword?: string;
  /** 研讨会参会人密码，仅直播场景是研讨会时有效，长度6-16位 */
  seminarAttendeePassword?: string;
  /** 直播延迟 Y无延时 N普通延迟 */
  pureRtcEnabled?: YNFlag;
  /** 转播类型 normal不开启、transmit发起转播、receive接收转播 */
  type?: BroadcastType;
  /** 线上双师 transmit大房间、receive小房间 */
  doubleTeacherType?: DoubleTeacherType;
  /** 中英双语直播开关 Y开、N关 */
  cnAndEnLiveEnabled?: YNFlag;
  /** 引导页图片地址 */
  splashImg?: string;
  /** 连麦人数限制，最多16人 */
  linkMicLimit?: number;
  /** 分类ID */
  categoryId?: number;
  /** 开始时间，时间戳 */
  startTime?: number;
  /** 结束时间，时间戳 */
  endTime?: number;
  /** 子账号邮箱 */
  subAccount?: string;
  /** 自定义讲师ID，32个以内ASCII码可见字符 */
  customTeacherId?: string;
  /** 标签id数组 */
  labelData?: number[];
  /** 客户端模版背景图URL */
  clientAloneTemplateBackgroundUrl?: string;
  /** 视频混流背景图URL */
  liveCdnBackgroundUrl?: string;
  /** 手机H5观看页低延迟开关 Y开启 N关闭 */
  h5LowLatencyFlvEnabled?: YNFlag;
}

/**
 * Create Channel V4 Response
 *
 * Response from V4 channel creation API.
 */
export interface CreateChannelV4Response {
  /** 频道ID */
  channelId: number;
  /** POLYV用户ID */
  userId: string;
  /** 讲师登录密码，直播场景不是研讨会时不为null */
  channelPasswd?: string;
  /** 研讨会主持人密码 */
  seminarHostPassword?: string;
  /** 研讨会参会人密码 */
  seminarAttendeePassword?: string;
}

// ============================================
// Watch Condition Types (观看条件)
// ============================================

/**
 * Watch condition auth type
 * 观看条件类型
 */
export type WatchAuthType =
  | 'public' // 公开观看
  | 'pay' // 付费观看
  | 'code' // 验证码观看
  | 'phone' // 白名单观看
  | 'info' // 登记观看
  | 'custom' // 自定义授权观看
  | 'external' // 外部授权观看
  | 'direct' // 独立授权观看
  | 'wx'; // 微信授权观看

/**
 * Auth setting for watch condition
 * 观看条件设置项
 */
export interface AuthSetting {
  /** 主要观看条件为1，次要观看条件为2 */
  rank: 1 | 2;
  /** 是否开启条件观看 Y/N */
  enabled: YNFlag;
  /** 观看条件类型 */
  authType?: WatchAuthType;
  /** 付费观看 - 欢迎语标题 */
  payAuthTips?: string;
  /** 付费观看 - 入口文本 */
  payEntryText?: string;
  /** 付费观看 - 价格（元） */
  price?: number;
  /** 付费观看 - 有效截止日期 yyyy-MM-dd HH:mm */
  watchEndTime?: string;
  /** 付费观看 - 有效时长（天） */
  validTimePeriod?: number;
  /** 验证码观看 - 验证码 */
  authCode?: string;
  /** 验证码观看 - 提示文案 */
  qcodeTips?: string;
  /** 验证码观看 - 公众号二维码地址 */
  qcodeImg?: string;
  /** 登记观看 - 信息字段 */
  infoFields?: InfoField[];
  /** 外部授权 - SecretKey */
  externalKey?: string;
  /** 外部授权 - 自定义URL */
  externalUri?: string;
  /** 外部授权 - 跳转地址 */
  externalRedirectUri?: string;
  /** 自定义授权 - SecretKey */
  customKey?: string;
  /** 自定义授权 - 自定义URL */
  customUri?: string;
  /** 独立授权 - SecretKey */
  directKey?: string;
}

/**
 * Update Watch Condition Request
 * 修改频道观看条件请求
 *
 * @see web/watch_condition/set_watch_condition.md under POLYV_API_DOCS_DIR or ../document-center/docs/live/api relative to the repository root
 */
export interface UpdateWatchConditionRequest {
  /** 频道号，不传为通用设置 */
  channelId?: string;
  /** 观看条件设置 */
  authSettings: AuthSetting[];
}

/**
 * Update Channel Request
 *
 * Parameters for updating an existing channel.
 * All fields are optional for partial updates.
 */
export interface UpdateChannelRequest {
  /** Channel name (max 60 characters) */
  name?: string;
  /** Publisher name */
  publisher?: string;
  /** Channel description */
  description?: string;
  /** Category ID */
  categoryId?: string;
  /** Maximum online viewers */
  maxViewer?: number;
  /** Link mic limit (-1 to 16) */
  linkMicLimit?: number;
  /** Player color (hex) */
  playerColor?: string;
  /** Auto play (0/1) */
  autoPlay?: number;
  /** Logo image URL */
  logoImage?: string;
  /** Logo opacity (0-100) */
  logoOpacity?: number;
  /** Logo position */
  logoPosition?: string;
}

// ============================================
// Auth Types (Story 2-2)
// ============================================

/**
 * Channel API Token Response
 */
export interface ChannelApiTokenResponse {
  channelToken: string;
  expireTime: number;
}

/**
 * Get Channel API Token Request
 */
export interface GetChannelApiTokenRequest {
  disposable?: boolean;
  expireSeconds?: number;
}

/**
 * Get Test Mode Token Request
 */
export interface GetTestModeTokenRequest {
  expireTime?: number;
}

// ============================================
// Doc Types (Story 2-2)
// ============================================

/**
 * Document Status
 */
export type DocStatus = 'normal' | 'waitUpload' | 'failUpload' | 'waitConvert' | 'failConvert';

/**
 * Document Convert Type
 */
export type DocConvertType = 'common' | 'animate';

/**
 * Document Type (new/old)
 */
export type DocType = 'old' | 'new';

/**
 * Get Doc List Request
 */
export interface GetDocListRequest {
  channelId?: string;
  teacherId?: string;
  status?: DocStatus;
  page?: number;
  limit?: number;
  isShowUrl?: 'Y' | 'N';
}

/**
 * Document Model
 */
export interface DocModel {
  fileId: string;
  fileName: string;
  fileUrl?: string;
  fileType: string;
  totalPage: number;
  channelId?: string;
  status: DocStatus;
  createTime: number;
  convertType: DocConvertType;
  type: DocType;
  previewImage?: string;
  previewBigImage?: string;
  autoId?: number;
  teacherId?: string;
}

/**
 * Doc List Response
 */
export interface DocListResponse {
  contents: DocModel[];
  total: number;
  page?: number;
  /** Requested page size (max items per page) */
  pageSize?: number;
  /** Actual number of items returned on this page */
  limit?: number;
}

/**
 * Upload Doc Request
 */
export interface UploadDocRequest {
  file?: File | Blob | Buffer;
  url?: string;
  type?: DocConvertType;
  docName?: string;
  callbackUrl?: string;
}

/**
 * Upload Doc Response
 */
export interface UploadDocResponse {
  type: DocType;
  fileId: string;
  status: DocStatus;
}

/**
 * Document Convert Status Item
 */
export interface DocConvertStatusItem {
  fileId: string;
  convertStatus: string;
  type: DocType;
  imageCount: number;
  images: string[];
  smallImages: string[];
  totalPage: number;
  htmlUrl: string;
}

// ============================================
// Multimedia Types (Story 2-2)
// ============================================

/**
 * Pagination Parameters (V4 API style)
 */
export interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
}

/**
 * Multimedia Resource VID List Response
 */
export interface MultimediaResourceVidListResponse {
  contents: string[];
  total: number;
  pageNumber: number;
  pageSize: number;
}

/**
 * Multimedia Resource Detail Item
 */
export interface MultimediaResourceDetailItem {
  id: number;
  channelId: string;
  vid: string;
  title: string;
  status: string;
  url: string;
}

/**
 * Multimedia Resource Detail Response
 */
export interface MultimediaResourceDetailResponse {
  contents: MultimediaResourceDetailItem[];
  total: number;
  pageNumber: number;
  pageSize: number;
}

/**
 * User Multimedia Resource Item
 */
export interface UserMultimediaResourceItem {
  vid: string;
  title: string;
  status: number;
  createTime: string;
}

/**
 * User Multimedia Resource Response
 * API returns array directly
 */
export type UserMultimediaResourceResponse = UserMultimediaResourceItem[];

// ============================================
// Monitor Types (Story 2-3)
// ============================================

/**
 * HLS Pull URL Response
 */
export interface HlsPullUrlResponse {
  url: string;
}

/**
 * Push URL Response
 */
export interface PushUrlResponse {
  url: string;
}

// ============================================
// Channel Basic Types (Story 2-3)
// ============================================

/**
 * Create Channel V3 Request
 */
export interface CreateChannelV3Request {
  /** Channel name - REQUIRED */
  name: string;
  /** Channel password - REQUIRED */
  channelPasswd: string;
  /** User ID - OPTIONAL */
  userId?: string;
  /** Scene type */
  scene?: ChannelScene;
  /** Category ID */
  categoryId?: number;
  /** Maximum viewers */
  maxViewer?: number;
  /** Publisher name */
  publisher?: string;
  /** Description */
  description?: string;
  /** Link mic limit */
  linkMicLimit?: number;
  /** Pure RTC enabled */
  pureRtcEnabled?: YNFlag;
  /** Auto play */
  autoPlay?: number;
  /** Player color */
  playerColor?: string;
  /** Cover image URL */
  coverImg?: string;
  /** Splash enabled */
  splashEnabled?: YNFlag;
  /** Splash image URL */
  splashImg?: string;
  /** Initial likes count */
  likes?: number;
  /** Initial page view count */
  pageView?: number;
  /** Close danmu */
  closeDanmu?: YNFlag;
  /** Show danmu info enabled */
  showDanmuInfoEnabled?: YNFlag;
  /** Sub-account email */
  subAccount?: string;
  /** Auth settings array */
  authSettings?: AuthSetting[];
  /** Playback settings */
  playbackSetting?: PlaybackSetting;
  /** Teacher settings */
  teacher?: TeacherSetting;
  /** Roles array */
  roles?: RoleSetting[];
}

/**
 * Info Field
 */
export interface InfoField {
  name?: string;
  type?: string;
  options?: string;
  placeholder?: string;
  sms?: YNFlag;
}

/**
 * Playback Setting
 */
export interface PlaybackSetting {
  globalSettingEnabled?: YNFlag;
  playbackEnabled?: YNFlag;
  type?: string;
  origin?: string;
  videoId?: string;
}

/**
 * Teacher Setting
 */
export interface TeacherSetting {
  nickname?: string;
  actor?: string;
  passwd?: string;
  avatar?: string;
}

/**
 * Role Setting
 */
export interface RoleSetting {
  nickname?: string;
  actor?: string;
  passwd?: string;
  avatar?: string;
  role?: 'Assistant' | 'Guest';
}

/**
 * Create Channel V3 Response
 */
export interface CreateChannelV3Response {
  channelId: string;
  userId: string;
  name: string;
  publisher?: string;
  description?: string;
  url: string;
  stream: string;
  scene: ChannelScene;
  channelPasswd: string;
  streamType: string;
  pureRtcEnabled: YNFlag;
  maxViewer?: number;
  linkMicLimit?: number;
  playerColor?: string;
  autoPlay: boolean;
  logoImage?: string;
  logoOpacity?: number;
  logoPosition?: string;
  currentTimeMillis: number;
}

/**
 * Copy Channel Options
 */
export interface CopyChannelOptions {
  name?: string;
  categoryId?: number;
  startTime?: number;
  subAccount?: string;
}

// ============================================
// Callback Types (Story 2-3)
// ============================================

/**
 * Update Callback Setting Request
 */
export interface UpdateCallbackSettingRequest {
  channelId: string;
  recordCallbackUrl?: string;
  recordCallbackVideoType?: string;
  playbackCallbackUrl?: string;
  streamCallbackUrl?: string;
  pptRecordCallbackUrl?: string;
  liveScanCallbackUrl?: string;
  playbackCacheCallbackUrl?: string;
  subtitleCallbackUrl?: string;
  liveViolationCutoffCallbackUrl?: string;
}

/**
 * Callback Setting Response
 */
export interface CallbackSettingResponse {
  recordCallbackUrl?: string;
  playbackCallbackUrl?: string;
  streamCallbackUrl?: string;
  liveScanCallbackUrl?: string;
  recordCallbackVideoType?: string;
  pptRecordCallbackUrl?: string;
  playbackCacheCallbackUrl?: string;
  subtitleCallbackUrl?: string;
  globalSettingEnabled?: YNFlag;
  liveViolationCutoffCallbackUrl?: string;
}

// ============================================
// Account Types (Story 2-3)
// ============================================

/**
 * Add Account Request
 */
export interface AddAccountRequest {
  role?: 'Assistant' | 'Guest';
  nickname?: string;
  password?: string;
  actor?: string;
  avatar?: string;
}

/**
 * Account Model
 */
export interface AccountModel {
  account: string;
  userId: string;
  channelId: string;
  passwd: string;
  nickname: string;
  stream: string;
  status: string;
  createdTime: number;
  lastModified: number;
  sort: number;
  avatar: string;
  actor: string;
  pageTurnEnabled: YNFlag;
  notifyEnabled: YNFlag;
  checkinEnabled: YNFlag;
  voteEnabled: YNFlag;
  lotteryEnabled: YNFlag;
  role: 'Assistant' | 'Guest';
  chatListEnabled: YNFlag;
  chatAuditEnabled: YNFlag;
  monitorEnabled: YNFlag;
  roundTourEnabled: YNFlag;
  watchLockEnabled: YNFlag;
  loginUrl?: string;
  pushUrl?: string;
  chatInteractionEnabled?: YNFlag;
}

/**
 * Update Account Request
 */
export interface UpdateAccountRequest {
  nickname?: string;
  password?: string;
  actor?: string;
  avatar?: string;
}

/**
 * Batch Create Accounts Request Item
 */
export interface BatchCreateAccountItem {
  role: 'Assistant' | 'Guest';
  nickname: string;
  passwd: string;
  actor?: string;
  avatar?: string;
}

// ============================================
// Playback Types (Story 2-4)
// ============================================

/**
 * Playback List Type
 */
export type PlaybackListType = 'playback' | 'vod';

/**
 * Playback Video Item Subtitle
 */
export interface PlaybackVideoSubtitle {
  id: number;
  name: string;
  srtUrl: string;
  language: string;
  status: string;
}

/**
 * Playback Video Item
 */
export interface PlaybackVideoItem {
  videoId: string;
  channelId: string;
  title: string;
  startTime?: string;
  endTime?: string;
  fileSize?: number;
  duration?: number;
  status?: string;
  url?: string;
  videoPoolId?: string;
  userId?: string;
  firstImage?: string;
  myBr?: string;
  qid?: string;
  seed?: number;
  ordertime?: number;
  createdTime?: number;
  lastModified?: number;
  rank?: number;
  asDefault?: YNFlag;
  channelSessionId?: string;
  fileUrl?: string;
  fileId?: string;
  liveType?: ChannelScene;
  width?: number;
  height?: number;
  origin?: 'manual' | 'auto' | 'merge' | 'clip' | 'smart-clip';
  callbackUrl?: string;
  errorCount?: number;
  lang?: string;
  videoIdEN?: string;
  enFileUrl?: string;
  mergeInfo?: string;
  watchUrl?: string;
  originSessionId?: string;
  subtitleList?: PlaybackVideoSubtitle[];
}

/**
 * Playback List Response
 */
export interface PlaybackListResponse {
  pageSize: number;
  pageNumber: number;
  total: number;
  contents: PlaybackVideoItem[];
  totalItems?: number;
  startRow?: number;
  firstPage?: boolean;
  lastPage?: boolean;
  prePageNumber?: number;
  nextPageNumber?: number;
  limit?: number;
  totalPages?: number;
  endRow?: number;
  offset?: number;
}

/**
 * Playback List Request
 */
export interface PlaybackListRequest {
  page?: number;
  pageSize?: number;
  listType?: PlaybackListType;
  sessionIds?: string;
  title?: string;
}

/**
 * Channel Session
 */
export interface ChannelSession {
  sessionId: string;
  startTime: string;
  endTime: string;
  duration: number;
}

/**
 * Record File Item
 */
export interface RecordFileItem {
  fileId: string;
  channelId: string;
  sessionId: string;
  startTime: string;
  endTime: string;
  fileSize: number;
  duration: number;
  url: string;
}

/**
 * Record File Response
 */
export interface RecordFileResponse {
  contents: RecordFileItem[];
  total: number;
  pageSize: number;
  pageNumber: number;
}

/**
 * Record File Request
 */
export interface RecordFileRequest {
  page?: number;
  pageSize?: number;
}

/**
 * Record Info
 */
export interface RecordInfo {
  fileId: string;
  channelId: string;
  sessionId: string;
  startTime: string;
  endTime: string;
  fileSize: number;
  duration: number;
  url: string;
}

/**
 * Playback Enabled Response
 */
export interface PlaybackEnabledResponse {
  enabled: boolean;
}

/**
 * Playback Setting Response (Story 9.7)
 */
export interface PlaybackSettingResponse {
  channelId?: string;
  playbackEnabled?: YNFlag;
  type?: 'single' | 'list';
  origin?: 'record' | 'playback' | 'vod' | 'material';
  videoId?: string;
  videoName?: string;
  sectionEnabled?: YNFlag;
  globalSettingEnabled?: YNFlag;
  crontabType?: string;
  startTime?: number;
  endTime?: number;
  playbackMultiplierEnabled?: YNFlag;
  playbackProgressBarEnabled?: YNFlag;
  playbackProgressBarOperationType?: string;
  showPlayButtonEnabled?: YNFlag;
  chatPlaybackEnabled?: YNFlag;
  productPlaybackEnabled?: YNFlag;
  questionnairePlaybackEnabled?: YNFlag;
  qaPlaybackEnabled?: YNFlag;
  cardPushPlaybackEnabled?: YNFlag;
  checkInPlaybackEnabled?: YNFlag;
  // Legacy fields
  sortType?: string;
  autoPublish?: boolean;
}

/**
 * Set Playback Setting Request (Story 9.7)
 * API: POST /live/v3/channel/playback/set-setting
 */
export interface SetPlaybackSettingRequest {
  globalSettingEnabled?: YNFlag;
  crontabType?: string;
  startTime?: number;
  endTime?: number;
  playbackEnabled?: YNFlag;
  type?: 'single' | 'list';
  origin?: 'record' | 'playback' | 'vod' | 'material';
  videoId?: string;
  sectionEnabled?: YNFlag;
  playbackMultiplierEnabled?: YNFlag;
  playbackProgressBarEnabled?: YNFlag;
  playbackProgressBarOperationType?: string;
  showPlayButtonEnabled?: YNFlag;
  productPlaybackEnabled?: YNFlag;
  customOpenDuration?: number;
  chatPlaybackEnabled?: YNFlag;
  questionnairePlaybackEnabled?: YNFlag;
  qaPlaybackEnabled?: YNFlag;
  cardPushPlaybackEnabled?: YNFlag;
  checkInPlaybackEnabled?: YNFlag;
}

/**
 * Set Record Setting Request
 */
export interface SetRecordSettingRequest {
  enabled?: boolean;
  type?: string;
  [key: string]: unknown;
}

/**
 * Clip Record File Request
 */
export interface ClipRecordFileRequest {
  fileId: string;
  startTime: number;
  endTime: number;
  fileName?: string;
  callbackUrl?: string;
}

/**
 * Clip Record File Response
 */
export interface ClipRecordFileResponse {
  fileId: string;
}

/**
 * Record Convert Request
 */
export interface RecordConvertRequest {
  fileId: string;
  fileName?: string;
  callbackUrl?: string;
}

/**
 * Record Convert Response
 */
export interface RecordConvertResponse {
  fileId: string;
}

/**
 * Record Merge Request (for array input)
 */
export interface RecordMergeArrayRequest {
  fileIds: string[];
  fileName?: string;
  callbackUrl?: string;
  /** Whether to auto-convert to VOD (Y/N) - for async merge */
  autoConvert?: 'Y' | 'N';
  /** Merge output type (Y=MP4, N=m3u8) - for async merge */
  mergeMp4?: 'Y' | 'N';
  /** Whether to merge in order of fileIds parameter (Y/N) - for async merge */
  orderByCustom?: 'Y' | 'N';
}

/**
 * Record Merge Request (comma-separated fileIds)
 */
export interface RecordMergeRequest {
  fileIds: string;
  fileName?: string;
  callbackUrl?: string;
  deleteFileIds?: string;
  startTime?: string;
  endTime?: string;
  ignoreDuration?: number;
}

/**
 * Record Merge Response
 */
export interface RecordMergeResponse {
  fileId: string;
  url?: string;
}

/**
 * Record Add Breakpoint Request
 */
export interface RecordAddBreakpointRequest {
  fileId: string;
  time: number;
}

/**
 * Record Merge MP4 Request (comma-separated fileIds)
 */
export interface RecordMergeMp4Request {
  fileIds: string;
  fileName?: string;
  callbackUrl?: string;
  deleteFileIds?: string;
  startTime?: string;
  endTime?: string;
}

/**
 * Add VOD Playback Request
 */
export interface AddVodPlaybackRequest {
  vid: string;
  title?: string;
  cataid?: string;
}

/**
 * Delete Playback Request
 */
export interface DeletePlaybackRequest {
  videoId: string;
  listType?: PlaybackListType;
}

/**
 * Channel Session Item
 */
export interface ChannelSessionItem {
  sessionId: string;
  channelId: string;
  userId: string;
  startTime: number;
  endTime: number;
}

/**
 * Channel Sessions Response
 */
export interface ChannelSessionsResponse {
  pageSize: number;
  pageNumber: number;
  totalItems: number;
  contents: ChannelSessionItem[];
  startRow: number;
  firstPage: boolean;
  lastPage: boolean;
  prePageNumber: number;
  nextPageNumber: number;
  limit: number;
  totalPages: number;
  endRow: number;
  offset: number;
}

/**
 * Channel Sessions Request
 */
export interface ChannelSessionsRequest {
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Record File
 */
export interface RecordFile {
  fileId: string;
  userId: string;
  channelId: string;
  startTime: string;
  endTime: string;
  filename: string;
  filesize: number;
  createdTime: number;
  width: number;
  height: number;
  duration: number;
  bitrate: number;
  mp4: string;
  m3u8: string;
  channelSessionId: string;
  liveType: ChannelScene;
  daysLeft: number;
  originSessionId?: string;
}

/**
 * Record Info Item
 */
export interface RecordInfoItem {
  fileId: string;
  userId: string;
  channelId: string;
  sessionId: string;
  startTime: string;
  endTime: string;
  filename: string;
  filesize: number;
  status: string;
  createdTime: number;
  duration: number;
  bitrate: number;
  mp4Result: number;
  m3u8Result: number;
  mp4Url: string;
  m3u8Url: string;
  liveType: ChannelScene;
  bitNum: number;
  width: number;
  height: number;
  dv: string;
}

/**
 * Record Info Response
 */
export interface RecordInfoResponse {
  pageSize: number;
  pageNumber: number;
  totalItems: number;
  contents: RecordInfoItem[];
  startRow: number;
  firstPage: boolean;
  lastPage: boolean;
  prePageNumber: number;
  nextPageNumber: number;
  limit: number;
  totalPages: number;
  endRow: number;
  offset: number;
}

/**
 * Record Info Request
 */
export interface RecordInfoRequest {
  sessionId?: string;
  startTime?: string;
  endTime?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Set Playback Sort Request
 */
export interface SetPlaybackSortRequest {
  videoIds: string;
}

/**
 * Set Playback Single Sort Request
 */
export interface SetPlaybackSingleSortRequest {
  videoId: string;
  rank: number;
}

/**
 * Update Playback Title Request
 */
export interface UpdatePlaybackTitleRequest {
  videoId: string;
  title: string;
}

/**
 * Record Merge MP4 Start Request
 */
export interface RecordMergeMp4StartRequest {
  fileIds: string;
  fileName?: string;
  callbackUrl?: string;
  deleteFileIds?: string;
  startTime?: string;
  endTime?: string;
  outputClarity?: string;
}

/**
 * Record Add Breakpoint Request (old with sessionId - keep for backward compatibility)
 */
export interface RecordAddBreakpointRequestOld {
  sessionId: string;
  time: number;
}

// ============================================
// Player Types (Story 2-4)
// ============================================

/**
 * Player Logo Settings
 */
export interface PlayerLogoSettings {
  logoImage?: string;
  logoOpacity?: number;
  logoPosition?: string;
  logoHref?: string;
}

/**
 * Player Head Settings
 */
export interface PlayerHeadSettings {
  headImage?: string;
  headImageHref?: string;
}

/**
 * Player Stop Settings
 */
export interface PlayerStopSettings {
  stopImage?: string;
  stopImageHref?: string;
}

// ============================================
// Statistics Types (Story 2-5)
// ============================================

/**
 * Product Click Stats Request
 */
export interface GetProductClickStatsRequest {
  /** Channel ID - REQUIRED */
  channelId: string;
  /** Session ID */
  sessionId?: string;
  /** Start time (13-digit ms timestamp) */
  startTime?: number;
  /** End time (13-digit ms timestamp) */
  endTime?: number;
  /** Page number */
  pageNumber?: number;
  /** Page size (default 10, max 1000) */
  pageSize?: number;
}

/**
 * Product Click Stats Item
 */
export interface ProductClickStatsItem {
  channelId: string;
  sessionId: string;
  productId: string;
  name: string;
  productType: 'normal' | 'finance';
  productClickNum: number;
  linkClickNum: number;
  pcClickNum: number;
  mobileClickNum: number;
  wxMiniProgramClickNum: number;
  iosClickNum: number;
  androidClickNum: number;
}

/**
 * Product Click Stats Response
 */
export interface GetProductClickStatsResponse {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  contents: ProductClickStatsItem[];
}

/**
 * Product List Stats Request
 */
export interface GetProductListStatsRequest {
  /** Channel ID - REQUIRED */
  channelId: string;
  /** Session ID */
  sessionId?: string;
  /** Start time (13-digit ms timestamp) */
  startTime?: number;
  /** End time (13-digit ms timestamp) */
  endTime?: number;
  /** Page number */
  pageNumber?: number;
  /** Page size (default 10, max 1000) */
  pageSize?: number;
}

/**
 * Product List Stats Item
 */
export interface ProductListStatsItem {
  channelId: string;
  sessionId: string;
  productListClickNum: number;
}

/**
 * Product List Stats Response
 */
export interface GetProductListStatsResponse {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  contents: ProductListStatsItem[];
}

/**
 * Redpack Receive Item
 */
export interface RedpackReceiveItem {
  redPackId: string;
  userId: string;
  nickName: string;
  avatar: string;
  amount: number;
  createdTime: number;
}

/**
 * Redpack Stats Item
 */
export interface RedpackStatsItem {
  redPackId: string;
  userId: string;
  channelId: string;
  nickName: string;
  amount: number;
  balance: number;
  allotType: string;
  createdTime: number;
  channelSessionId: string;
  status: string;
  redPackType: string;
  redPackReceiveList?: RedpackReceiveItem[];
}

/**
 * Redpack Stats Request
 */
export interface GetRedpackStatsRequest {
  /** Channel ID - REQUIRED */
  channelId: string;
  /** Session ID */
  sessionId?: string;
  /** Start time (13-digit ms timestamp) */
  startTime?: number;
  /** End time (13-digit ms timestamp) */
  endTime?: number;
  /** Page number */
  pageNumber?: number;
  /** Page size (default 10, max 1000) */
  pageSize?: number;
}

/**
 * Redpack Stats Response
 */
export interface GetRedpackStatsResponse {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  contents: RedpackStatsItem[];
}

// ============================================
// ViewData Types (Story 2-5)
// ============================================

/**
 * Channel Statistic Request
 */
export interface GetChannelStatisticRequest {
  /** Channel ID - REQUIRED */
  channelId: string;
  /** Start date (yyyy-MM-dd) - REQUIRED */
  startDate: string;
  /** End date (yyyy-MM-dd) - REQUIRED */
  endDate: string;
}

/**
 * Channel Statistic Data
 */
export interface ChannelStatisticData {
  uniqueVisitor?: number;
  plays: number;
  playDuration: number;
  ips: number;
  viewers?: number;
  averagePlayDuration: number;
  averageTime: number;
  statisticsByViewer?: string;
  averagePlayDurationByViewer?: number;
  averageTimeByViewer?: number;
}

/**
 * Summary Item (V2)
 */
export interface ChannelSummaryItem {
  currentDay: string;
  channelId: string;
  userId: string;
  pcPlayDuration: number;
  pcVideoView: number;
  pcUniqueViewer?: number;
  mobilePlayDuration: number;
  mobileVideoView: number;
  mobileUniqueViewer: number;
  createdTime: number;
  lastModified: number;
  creatorId?: string;
  creatorName?: string;
}

/**
 * Get Summary Request
 */
export interface GetSummaryRequest {
  /** Start day (yyyy-MM-dd) - REQUIRED */
  startDay: string;
  /** End day (yyyy-MM-dd) - REQUIRED */
  endDay: string;
}

/**
 * Daily Summary Item
 */
export interface DailySummaryItem {
  currentDay: string;
  channelId: string;
  userId: string;
  pcPlayDuration: number;
  pcVideoView: number;
  pcUniqueViewer: number;
  mobilePlayDuration: number;
  mobileVideoView: number;
  mobileUniqueViewer: number;
  createdTime: number;
  lastModified: number;
  creatorId?: string;
  creatorName?: string;
}

/**
 * Get Daily Summary Request
 */
export interface GetDailySummaryRequest {
  /** Channel ID - REQUIRED */
  channelId: string;
  /** Start day (yyyy-MM-dd) - REQUIRED */
  startDay: string;
  /** End day (yyyy-MM-dd) - REQUIRED */
  endDay: string;
}

/**
 * Channel Play Summary Item
 */
export interface ChannelPlaySummaryItem {
  userId?: string;
  channelId: string;
  name: string;
  categoryName?: string;
  pcPlayDuration: number;
  pcVideoView: number;
  pcUniqueViewer: number;
  mobilePlayDuration: number;
  mobileVideoView: number;
  mobileUniqueViewer: number;
  livePcPlayDuration: number;
  playbackPcPlayDuration: number;
  unknownPcPlayDuration: number;
  liveMobilePlayDuration: number;
  playbackMobilePlayDuration: number;
  unknownMobilePlayDuration: number;
  creatorName?: string;
}

/**
 * Get Channel Play Summary Request
 */
export interface GetChannelPlaySummaryRequest {
  /** Start date (yyyy-MM-dd) - REQUIRED */
  startDate: string;
  /** End date (yyyy-MM-dd) - REQUIRED */
  endDate: string;
  /** Channel IDs (comma-separated) */
  channelIds?: string;
}

/**
 * Concurrency Data Item
 */
export interface ConcurrencyDataItem {
  day: string;
  minute: string;
  viewers: number;
}

/**
 * Get Concurrency Request
 */
export interface GetConcurrencyRequest {
  /** Channel ID - REQUIRED */
  channelId: string;
  /** Start date (yyyy-MM-dd) - REQUIRED */
  startDate: string;
  /** End date (yyyy-MM-dd) - REQUIRED */
  endDate: string;
}

/**
 * Get Max History Concurrent Request
 */
export interface GetMaxHistoryConcurrentRequest {
  /** Channel ID - REQUIRED */
  channelId: string;
  /** Start time (13-digit ms timestamp) - REQUIRED */
  startTime: number;
  /** End time (13-digit ms timestamp) - REQUIRED */
  endTime: number;
}

/**
 * Realtime Viewer Data Item
 */
export interface RealtimeViewerDataItem {
  channelId: string;
  time: string;
  count: number;
}

/**
 * Get Realtime Viewers Request
 */
export interface GetRealtimeViewersRequest {
  /** Channel IDs (comma-separated) - REQUIRED */
  channelIds: string;
}

/**
 * Realtime Viewer V1 Item
 */
export interface RealtimeViewerV1Item {
  time: string;
  count: string;
}

/**
 * Session Stats Item
 */
export interface SessionStatsItem {
  channelId: string;
  sessionId: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration: number;
  liveUV: number;
  livePV: number;
  playbackUV: number;
  playbackPV: number;
  totalPlayDuration?: number;
  totalPlaybackDuration?: number;
}

/**
 * Session Stats Response
 */
export interface SessionStatsResponse {
  list: SessionStatsItem[];
}

/**
 * Get Session Stats Request
 */
export interface GetSessionStatsRequest {
  /** Channel ID - REQUIRED */
  channelId: string;
  /** Session IDs (comma-separated) */
  sessionIds?: string;
  /** Start time (13-digit ms timestamp) */
  startTime?: number;
  /** End time (13-digit ms timestamp) */
  endTime?: number;
}

/**
 * Viewlog Page Item
 */
export interface ViewlogPageItem {
  playId: string;
  userId: string;
  channelId: string;
  playDuration: number;
  stayDuration: number;
  sessionId: string;
  param1: string;
  param2: string;
  param3: string;
  param4: string;
  param5: string;
  ipAddress: string;
  country: string;
  province: string;
  city: string;
  isp: string;
  referer: string;
  userAgent: string;
  operatingSystem: string;
  browser: string;
  isMobile: string;
  currentDay: string;
  createdTime?: number;
  lastModified?: number;
  ptype?: number;
  firstActiveTime?: number;
  lastActiveTime?: number;
}

/**
 * Get Viewlog Page Request
 */
export interface GetViewlogPageRequest {
  /** Current day (yyyy-MM-dd) */
  currentDay?: string;
  /** Page number (default 1) */
  page?: number;
  /** Page size (default 1000) */
  pageSize?: number;
  /** Start time (13-digit ms timestamp) */
  startTime?: number;
  /** End time (13-digit ms timestamp) */
  endTime?: number;
  /** Viewer user ID */
  param1?: string;
  /** Viewer nickname */
  param2?: string;
  /** View log type: 'vod' or 'live' */
  param3?: string;
  /** View log type: 'vod' or 'live' */
  viewLogType?: string;
  /** Session IDs (comma-separated) */
  sessionIds?: string;
}

/**
 * Viewlog Page Response
 */
export interface GetViewlogPageResponse {
  pageSize: number;
  pageNumber: number;
  totalItems: number;
  contents: ViewlogPageItem[];
  startRow: number;
  firstPage: boolean;
  lastPage: boolean;
  prePageNumber: number;
  nextPageNumber: number;
  limit: number;
  totalPages: number;
  endRow: number;
  offset: number;
}

/**
 * Get Viewlog V1 Request
 */
export interface GetViewlogV1Request {
  /** Current day (yyyy-MM-dd) - REQUIRED */
  currentDay: string;
  /** User ID - REQUIRED */
  userId: string;
  /** Viewer user ID */
  param1?: string;
}

/**
 * User Viewlog Item
 */
export interface UserViewlogItem {
  playId: string;
  userId: string;
  channelId: string;
  playDuration: number;
  stayDuration: number;
  sessionId: string;
  param1: string;
  param2: string;
  param3: string;
  param4: string;
  param5: string;
  ipAddress: string;
  country: string;
  province: string;
  city: string;
  isp: string;
  referer: string;
  userAgent: string;
  operatingSystem: string;
  browser: string;
  isMobile: string;
  currentDay: string;
  createdTime: number;
  lastModified: number;
  ptype?: number;
  firstActiveTime?: number;
  lastActiveTime?: number;
}

/**
 * Get User Viewlog Request
 */
export interface GetUserViewlogRequest {
  /** Start date (yyyy-MM-dd HH:mm:ss) - REQUIRED */
  startDate: string;
  /** End date (yyyy-MM-dd HH:mm:ss) - REQUIRED */
  endDate: string;
  /** Channel ID */
  channelId?: string;
  /** Watch type: 'live' or 'vod' */
  watchType?: string;
  /** Page number */
  page?: number;
  /** Page size */
  pageSize?: number;
}

/**
 * User Viewlog Response
 */
export interface GetUserViewlogResponse {
  pageSize: number;
  pageNumber: number;
  totalItems: number;
  contents: UserViewlogItem[];
  startRow: number;
  firstPage: boolean;
  lastPage: boolean;
  prePageNumber: number;
  nextPageNumber: number;
  limit: number;
  totalPages: number;
  endRow: number;
  offset: number;
}

/**
 * Mic Detail Item
 */
export interface MicDetailItem {
  userId: string;
  channelId: string;
  currentDay: string;
  history: number;
}

/**
 * Get Mic Detail List Request
 */
export interface GetMicDetailListRequest {
  /** Page number (default 1) */
  page?: number;
  /** Page size (default 10, max 1000) */
  size?: number;
  /** Channel IDs (comma-separated) */
  channelIds?: string;
  /** Start day (yyyy-MM-dd) */
  startDay?: string;
  /** End day (yyyy-MM-dd) */
  endDay?: string;
}

/**
 * Mic Detail List Response
 */
export interface GetMicDetailListResponse {
  pageSize: number;
  pageNumber: number;
  totalItems: number;
  contents: MicDetailItem[];
  startRow: number;
  firstPage: boolean;
  lastPage: boolean;
  prePageNumber: number;
  nextPageNumber: number;
  limit: number;
  totalPages: number;
  endRow: number;
  offset: number;
}

/**
 * Link Mic Detail Item
 */
export interface LinkMicDetailItem {
  channelId: string;
  sessionId: string;
  viewerId: string;
  identity: 'guest' | 'student';
  nickname: string;
  joinTime: number;
  leaveTime: number;
  duration?: number;
}

/**
 * Get Link Mic Detail List Request
 */
export interface GetLinkMicDetailListRequest {
  /** Channel ID - REQUIRED */
  channelId: string;
  /** Start date (yyyy-MM-dd) - REQUIRED */
  startDate: string;
  /** End date (yyyy-MM-dd) - REQUIRED */
  endDate: string;
  /** Page number (default 1) */
  page?: number;
  /** Page size (default 500, max 5000) */
  pageSize?: number;
}

/**
 * Link Mic Detail List Response
 */
export interface GetLinkMicDetailListResponse {
  page: number;
  pageSize: number;
  contents: LinkMicDetailItem[];
}

// ============================================
// Story 2-5 Additional Types (Code Review Fixes)
// ============================================

/**
 * Realviewers Data Item (AC13)
 */
export interface RealviewersDataItem {
  channelId: string;
  userId: string;
  realViewers: number;
  currentDay: string;
}

/**
 * Get Realviewers Request (AC13)
 */
export interface GetRealviewersRequest {
  /** Current day (yyyy-MM-dd) - REQUIRED */
  currentDay: string;
}

/**
 * Viewlog V2 Item (AC15)
 */
export interface ViewlogV2Item {
  playId: string;
  userId: string;
  channelId: string;
  playDuration: number;
  stayDuration: number;
  sessionId: string;
  param1: string;
  param2: string;
  param3: string;
  param4: string;
  param5: string;
  ipAddress: string;
  country: string;
  province: string;
  city: string;
  isp: string;
  referer: string;
  userAgent: string;
  operatingSystem: string;
  browser: string;
  isMobile: string;
  currentDay: string;
  createdTime?: number;
  lastModified?: number;
  ptype?: number;
  firstActiveTime?: number;
  lastActiveTime?: number;
}

/**
 * Get Viewlog V2 Request (AC15)
 */
export interface GetViewlog2Request {
  /** Current day (yyyy-MM-dd) - REQUIRED */
  currentDay: string;
  /** Page number (default 1) */
  page?: number;
  /** Page size (default 1000) */
  pageSize?: number;
}

/**
 * Viewlog Page V3 Item (AC16)
 */
export interface ViewlogPageV3Item {
  playId: string;
  userId: string;
  channelId: string;
  playDuration: number;
  stayDuration: number;
  sessionId: string;
  param1: string;
  param2: string;
  param3: string;
  param4: string;
  param5: string;
  ipAddress: string;
  country: string;
  province: string;
  city: string;
  isp: string;
  referer: string;
  userAgent: string;
  operatingSystem: string;
  browser: string;
  isMobile: string;
  currentDay: string;
  createdTime?: number;
  lastModified?: number;
  ptype?: number;
  firstActiveTime?: number;
  lastActiveTime?: number;
}

/**
 * Get Viewlog Page V3 Request (AC16)
 */
export interface GetViewlogPageV3Request {
  /** Current day (yyyy-MM-dd) */
  currentDay?: string;
  /** Page number (default 1) */
  page?: number;
  /** Page size (default 1000) */
  pageSize?: number;
  /** Start time (13-digit ms timestamp) */
  startTime?: number;
  /** End time (13-digit ms timestamp) */
  endTime?: number;
  /** Viewer user ID */
  param1?: string;
  /** Viewer nickname */
  param2?: string;
  /** View log type: 'vod' or 'live' */
  param3?: string;
}

/**
 * Viewlog Page V3 Response (AC16)
 */
export interface GetViewlogPageV3Response {
  pageSize: number;
  pageNumber: number;
  totalItems: number;
  contents: ViewlogPageV3Item[];
  startRow: number;
  firstPage: boolean;
  lastPage: boolean;
  prePageNumber: number;
  nextPageNumber: number;
  limit: number;
  totalPages: number;
  endRow: number;
  offset: number;
}

// ============================================
// Story 2-6 Types: Marquee, Session, State, Warmup
// ============================================

// --------------------------------------------
// Marquee Types (AC1)
// --------------------------------------------

/**
 * Set DIY URL Marquee Request (AC1)
 */
export interface SetDiyUrlMarqueeRequest {
  /** Channel ID - REQUIRED */
  channelId: string;
  /** Marquee restrict flag: 'Y' to enable, 'N' to disable - REQUIRED */
  marqueeRestrict: YNFlag;
  /** Marquee URL (required when marqueeRestrict is 'Y') */
  url?: string;
}

// --------------------------------------------
// Session Types (AC2-AC6)
// --------------------------------------------

/**
 * Session Data Item (AC2)
 */
export interface SessionDataItem {
  sessionId: string;
  channelId: string;
  userId: string;
  startTime: number;
  endTime: number | null;
  customId?: string;
}

/**
 * Get Session Data List Request (AC2)
 */
export interface GetSessionDataListRequest {
  /** Channel ID - REQUIRED */
  channelId: string;
  /** Start date (yyyy-MM-dd) */
  startDate?: string;
  /** End date (yyyy-MM-dd) */
  endDate?: string;
  /** Page number */
  page?: number;
  /** Page size */
  pageSize?: number;
}

/**
 * Get Session Data List Response (AC2)
 */
export interface GetSessionDataListResponse {
  pageSize: number;
  pageNumber: number;
  totalItems: number;
  contents: SessionDataItem[];
  startRow: number;
  firstPage: boolean;
  lastPage: boolean;
  prePageNumber: number;
  nextPageNumber: number;
  limit: number;
  totalPages: number;
  endRow: number;
  offset: number;
}

/**
 * Export Session Stats Request (AC3)
 */
export interface ExportSessionStatsRequest {
  /** Channel ID - REQUIRED */
  channelId: string;
  /** Session ID - REQUIRED */
  sessionId: string;
}

/**
 * Get Session By External Request (AC4)
 */
export interface GetSessionByExternalRequest {
  /** Channel ID - REQUIRED */
  channelId: string;
  /** External session ID (32-char UUID) - REQUIRED */
  externalSessionId: string;
}

/**
 * Get Session By External Response (AC4)
 */
export interface GetSessionByExternalResponse {
  list: string[];
}

/**
 * File ID By External Item (AC5)
 */
export interface FileIdByExternalItem {
  originSessionId: string;
  fileIds: string[];
  createdTime: number;
}

/**
 * List File ID By External Request (AC5)
 */
export interface ListFileIdByExternalRequest {
  /** Channel ID - REQUIRED */
  channelId: string;
  /** External session ID (32-char UUID) - REQUIRED */
  externalSessionId: string;
}

/**
 * Relevance Session Request (AC6)
 */
export interface RelevanceSessionRequest {
  /** Channel ID - REQUIRED */
  channelId: string;
  /** External session ID (32-char UUID) - REQUIRED */
  externalSessionId: string;
}

// --------------------------------------------
// State Types (AC7-AC16)
// --------------------------------------------

/**
 * Live Status Type
 */
export type LiveStatus = 'live' | 'end';

/**
 * Live Status Item (AC8)
 */
export interface LiveStatusItem {
  channelId: string;
  status: LiveStatus;
  seminarStatus?: string;
}

/**
 * Stream Info (AC9, AC10)
 */
export interface StreamInfo {
  deployAddress: string | null;
  inAddress: string | null;
  streamName: string;
  fps: string | null;
  lfr: string | null;
  inBandWidth: string | null;
}

/**
 * Get Stream Info Response (AC9)
 */
export interface GetStreamInfoResponse extends StreamInfo {}

/**
 * Get Streams Item (AC10)
 */
export interface GetStreamsItem {
  channelId: string;
  live: boolean;
  streamInfo: StreamInfo;
}

/**
 * Disk Video Item (AC11)
 */
export interface DiskVideoItem {
  videoId: string;
  videoPoolId: string;
  userId: string;
  channelId: string;
  title: string;
  firstImage: string;
  duration: number;
  startTime: number;
  endTime: number;
  createdTime: number;
  lastModified: number;
  url: string;
  streamStatus: string;
  langType: string;
  source: string;
}

/**
 * List Disk Video Response (AC11)
 */
export interface ListDiskVideoResponse {
  pageSize: number;
  pageNumber: number;
  totalItems: number;
  contents: DiskVideoItem[];
  startRow: number;
  firstPage: boolean;
  lastPage: boolean;
  prePageNumber: number;
  nextPageNumber: number;
  limit: number;
  totalPages: number;
  endRow: number;
  offset: number;
}

/**
 * List Disk Video Request (AC11)
 */
export interface ListDiskVideoRequest {
  /** Channel ID - REQUIRED */
  channelId: string;
  /** Page number */
  page?: number;
  /** Page size */
  pageSize?: number;
}

/**
 * Set Status Request (AC12, AC13)
 */
export interface SetStatusRequest {
  /** Channel ID - REQUIRED */
  channelId: string;
  /** User ID - REQUIRED */
  userId: string;
}

/**
 * Ban Push Request (AC14)
 */
export interface BanPushRequest {
  /** Channel ID - REQUIRED */
  channelId: string;
  /** User ID - REQUIRED */
  userId: string;
  /** Forbid time in minutes */
  forbidTime?: number;
  /** Playback forbidden: 'Y' or 'N' */
  playbackForbidden?: YNFlag;
}

/**
 * End Disk Push Request (AC16)
 */
export interface EndDiskPushRequest {
  /** Channel ID - REQUIRED */
  channelId: string;
  /** Disk video ID - REQUIRED */
  diskVideoId: string;
}

// --------------------------------------------
// Warmup Types (AC17-AC19)
// --------------------------------------------

/**
 * Update Warmup Switch Request (AC17)
 */
export interface UpdateWarmupSwitchRequest {
  /** Channel ID - REQUIRED */
  channelId: string;
  /** Warmup enabled flag: 'Y' or 'N' - REQUIRED */
  warmUpEnabled: YNFlag;
}

/**
 * Update Warmup Image Request (AC18)
 */
export interface UpdateWarmupImageRequest {
  /** Channel ID - REQUIRED */
  channelId: string;
  /** Cover image URL - REQUIRED */
  coverImage: string;
  /** Cover href URL */
  coverHref?: string;
}

/**
 * Update Warmup Video Request (AC19)
 */
export interface UpdateWarmupVideoRequest {
  /** Channel ID - REQUIRED */
  channelId: string;
  /** Warmup FLV URL - REQUIRED */
  warmUpFlv: string;
}

// ============================================
// Product Types (Story 8-2)
// ============================================

/**
 * Product link type
 * - 10: Universal link (通用链接)
 * - 11: Multi-platform link (多平台链接)
 */
export type ProductLinkType = 10 | 11;

/**
 * Product status
 * - 1: On shelf (上架)
 * - 2: Off shelf (下架)
 */
export type ProductStatus = 1 | 2;

/**
 * Product price type
 * - AMOUNT: Numeric price
 * - CUSTOM: Custom text price
 */
export type ProductPriceType = 'AMOUNT' | 'CUSTOM';

/**
 * Product type
 * - normal: Regular product
 * - finance: Financial product
 * - position: Job position
 */
export type ProductType = 'normal' | 'finance' | 'position';

/**
 * Copy strategy for platform products
 * - copy: Create independent copy
 * - ref: Reference (syncs with platform changes)
 */
export type ProductCopyStrategy = 'copy' | 'ref';

/**
 * Add Channel Product Request
 *
 * Parameters for adding a new product to channel product library.
 * Note: Only (channelId, timestamp, appId) participate in signature,
 * body parameters do NOT participate in signature.
 */
export interface AddChannelProductParams {
  /** Channel ID - REQUIRED (URL param for signature) */
  channelId: string;
  /** Product type - OPTIONAL, defaults to 'normal' */
  productType?: ProductType;
  /** Product name - REQUIRED, 1-100 chars (backend supports 1-50) */
  name: string;
  /** Product status - REQUIRED: 1 (on shelf) | 2 (off shelf) */
  status: ProductStatus;
  /** Link type - REQUIRED: 10 (universal) | 11 (multi-platform) */
  linkType: ProductLinkType;
  /** Product cover URL - REQUIRED for normal, optional for others */
  cover?: string;
  /** Universal link - REQUIRED when linkType=10 */
  link?: string;
  /** PC link - for multi-platform (linkType=11) */
  pcLink?: string;
  /** Mobile web link */
  mobileLink?: string;
  /** WeChat miniprogram link */
  wxMiniprogramLink?: string;
  /** WeChat miniprogram original ID */
  wxMiniprogramOriginalId?: string;
  /** Mobile app link */
  mobileAppLink?: string;
  /** Android native link */
  androidLink?: string;
  /** iOS native link */
  iosLink?: string;
  /** Custom params as JSON string, e.g., '{"id":21,"color":"blue"}' */
  params?: string;
  /** Product description */
  productDesc?: string;
  /** Product features/tags as JSON array string, e.g., '["tag1","tag2"]' */
  features?: string;
  /** Button text - REQUIRED for position type */
  btnShow?: string;
  /** Yield/rate - for finance products, e.g., '87.99%' */
  yield?: string;
  /** Platform product ID for copy/reference */
  originId?: string;
  /** Copy strategy when originId is set: copy | ref */
  strategy?: ProductCopyStrategy;
  /** Product detail HTML */
  productDetail?: string;
  /** Extension info as JSON string with coverList/videoList */
  ext?: string;
  /** Tag IDs as JSON array string, e.g., '[100,102,103]' */
  tagIds?: string;

  // Normal product specific fields
  /** Real price type - AMOUNT | CUSTOM */
  priceType?: ProductPriceType;
  /** Real price amount - required when priceType=AMOUNT */
  realPrice?: number;
  /** Custom price text - required when priceType=CUSTOM */
  customPrice?: string;
  /** Original price type - AMOUNT | CUSTOM */
  originalPriceType?: ProductPriceType;
  /** Original price amount */
  price?: number;
  /** Custom original price text */
  customOrignalPrice?: string;
}

/**
 * Add Channel Product Response
 *
 * Response data for successful product creation.
 */
export interface AddChannelProductResponse {
  /** Product ID */
  productId: number;
  /** User ID */
  userId: string;
  /** Channel ID */
  channelId: string;
  /** Product name */
  name: string;
  /** Product type */
  productType: ProductType;
  /** Product cover URL */
  cover: string;
  /** Product link */
  link: string;
  /** Product status */
  status: ProductStatus;
  /** Created time (13-bit ms timestamp) */
  createdTime: number;
  /** Last modified time (13-bit ms timestamp) */
  lastModified: number;
  /** Sort rank */
  rank: number;
  /** Platform type, default 'live' */
  type: string;
  /** Link type */
  linkType: ProductLinkType;
  /** PC link */
  pcLink: string;
  /** Mobile web link */
  mobileLink: string;
  /** WeChat miniprogram link */
  wxMiniprogramLink: string;
  /** WeChat miniprogram original ID */
  wxMiniprogramOriginalId: string;
  /** Mobile app link */
  mobileAppLink: string;
  /** Android link */
  androidLink: string | null;
  /** iOS link */
  iosLink: string | null;
  /** Custom params JSON */
  params: string;
  /** Button text */
  btnShow: string;
  /** Features JSON */
  features: string;
  /** Product description */
  productDesc: string;
  /** Yield for finance products */
  yield: string;
  /** Product detail URL */
  productDetail: string;

  // Normal product specific
  /** Real price type */
  priceType?: ProductPriceType;
  /** Real price */
  realPrice?: number;
  /** Custom price */
  customPrice?: string;
  /** Original price type */
  originalPriceType?: ProductPriceType;
  /** Original price */
  price?: number;
  /** Custom original price */
  customOrignalPrice?: string;
}

/**
 * Update Channel Product Request
 *
 * Parameters for updating an existing product.
 * Note: Only (channelId, timestamp, appId) participate in signature.
 */
export interface UpdateChannelProductParams {
  /** Channel ID - REQUIRED (URL param for signature) */
  channelId: string;
  /** Product ID - REQUIRED */
  productId: number;
  /** Product name - REQUIRED, 1-100 chars */
  name: string;
  /** Product status - REQUIRED: 1 (on shelf) | 2 (off shelf) */
  status: ProductStatus;
  /** Link type - REQUIRED: 10 (universal) | 11 (multi-platform) */
  linkType: ProductLinkType;
  /** Product cover URL */
  cover?: string;
  /** Universal link */
  link?: string;
  /** PC link */
  pcLink?: string;
  /** Mobile web link */
  mobileLink?: string;
  /** WeChat miniprogram link */
  wxMiniprogramLink?: string;
  /** WeChat miniprogram original ID */
  wxMiniprogramOriginalId?: string;
  /** Mobile app link */
  mobileAppLink?: string;
  /** Android native link */
  androidLink?: string;
  /** iOS native link */
  iosLink?: string;
  /** Custom params as JSON string */
  params?: string;
  /** Product description */
  productDesc?: string;
  /** Features as JSON array string */
  features?: string;
  /** Button text */
  btnShow?: string;
  /** Yield for finance products */
  yield?: string;
  /** Product detail HTML */
  productDetail?: string;
  /** Extension info as JSON string */
  ext?: string;
  /** Tag IDs as JSON array string */
  tagIds?: string;

  // Normal product specific
  /** Real price type */
  priceType?: ProductPriceType;
  /** Real price amount */
  realPrice?: number;
  /** Custom price text */
  customPrice?: string;
  /** Original price type */
  originalPriceType?: ProductPriceType;
  /** Original price amount */
  price?: number;
  /** Custom original price text */
  customOrignalPrice?: string;
}

/**
 * Delete Channel Product Request
 *
 * Parameters for deleting a product from channel.
 * Note: All params (channelId, productId, appId, timestamp) participate in signature.
 */
export interface DeleteChannelProductParams {
  /** Channel ID - REQUIRED */
  channelId: string;
  /** Product ID - REQUIRED */
  productId: number;
}

/**
 * Update Channel Product Enabled Request
 *
 * Parameters for toggling the channel product library on/off.
 */
export interface UpdateChannelProductEnabledParams {
  /** Channel ID - REQUIRED */
  channelId: string;
  /** Product library enabled status: Y = on, N = off - REQUIRED */
  enabled: YNFlag;
}

/**
 * Update Channel Config Params
 *
 * Parameters for updating channel configuration via /v3/channel/config/update.
 */
export interface UpdateChannelConfigParams {
  /** Channel ID - REQUIRED */
  channelId: string;
  /** Config key name (e.g. 'couponEnabled', 'productEnabled') - REQUIRED */
  key: string;
  /** Config value (e.g. 'Y' or 'N') - REQUIRED */
  value: string;
}

/**
 * List Channel Products Request
 *
 * Parameters for listing products in a channel.
 */
export interface ListChannelProductsParams {
  /** Channel ID - REQUIRED */
  channelId: string;
  /** Page number, default 1 */
  pageNumber?: number;
  /** Page size, default 20, max 100 */
  pageSize?: number;
}

/**
 * Channel Product Item
 */
export interface ChannelProductItem {
  /** Product ID */
  productId: number;
  /** Channel ID */
  channelId: string;
  /** Product name */
  name: string;
  /** Product type */
  productType?: string;
  /** Product status: 1 (on shelf) | 2 (off shelf) */
  status: number;
  /** Product cover URL */
  cover?: string;
  /** Product link */
  link?: string;
  /** Link type: 10 (universal) | 11 (multi-platform) */
  linkType?: number;
  /** Price */
  price?: number;
  /** Real price */
  realPrice?: number;
  /** Price type */
  priceType?: string;
  /** Original price type */
  originalPriceType?: string;
  /** Product description */
  productDesc?: string;
  /** Button text */
  btnShow?: string;
  /** Created time (13-bit ms timestamp) */
  createdTime?: number;
  /** Last modified time (13-bit ms timestamp) */
  lastModified?: number;
}

/**
 * List Channel Products Response
 */
export interface ListChannelProductsResponse {
  /** Array of product items */
  contents: ChannelProductItem[];
  /** Total count */
  total: number;
  /** Has more pages */
  hasMore?: boolean;
}

// ============================================
// Channel Viewer Management Types
// ============================================

/**
 * Backend login-state endpoint scope for channel viewer APIs.
 */
export type ChannelViewerApiScope = 'user' | 'teacher';

/**
 * Common params for backend login-state channel viewer APIs.
 */
export interface ChannelViewerScopedParams {
  /** Endpoint scope, defaults to user */
  scope?: ChannelViewerApiScope;
}

/**
 * Generic page response used by channel viewer backend APIs.
 */
export interface ChannelViewerPageResponse<T> {
  /** Current page number */
  pageNumber: number;
  /** Page size */
  pageSize: number;
  /** Total pages */
  totalPages: number;
  /** Total item count */
  totalItems: number;
  /** Page items */
  contents: T[];
}

/**
 * Channel viewer group item.
 */
export interface ChannelViewerGroup {
  /** Group ID */
  id: number;
  /** Channel ID */
  channelId: number;
  /** Group name */
  name: string;
  /** Number of viewers associated with this group */
  viewerCount: number;
}

export interface ListChannelViewerGroupsParams extends ChannelViewerScopedParams {
  /** Channel ID - REQUIRED */
  channelId: string | number;
}

export type ListChannelViewerGroupsResponse = ChannelViewerGroup[];

export interface CreateChannelViewerGroupParams extends ChannelViewerScopedParams {
  /** Channel ID - REQUIRED */
  channelId: string | number;
  /** Group name, max 128 chars - REQUIRED */
  name: string;
}

export interface UpdateChannelViewerGroupParams extends ChannelViewerScopedParams {
  /** Channel ID - REQUIRED */
  channelId: string | number;
  /** Group ID - REQUIRED */
  id: string | number;
  /** New group name, max 128 chars - REQUIRED */
  name: string;
}

export interface DeleteChannelViewerGroupParams extends ChannelViewerScopedParams {
  /** Channel ID - REQUIRED */
  channelId: string | number;
  /** Group ID - REQUIRED */
  id: string | number;
}

export interface ChannelViewerGroupSetting {
  /** Channel viewer group switch */
  channelViewerGroupEnabled: YNFlag;
  /** Allow viewers outside groups to watch */
  notInGroupWatchEnabled: YNFlag;
}

export interface GetChannelViewerGroupSettingParams extends ChannelViewerScopedParams {
  /** Channel ID - REQUIRED */
  channelId: string | number;
}

export interface UpdateChannelViewerGroupSettingParams extends ChannelViewerScopedParams {
  /** Channel ID - REQUIRED */
  channelId: string | number;
  /** Channel viewer group switch */
  channelViewerGroupEnabled?: YNFlag;
  /** Allow viewers outside groups to watch */
  notInGroupWatchEnabled?: YNFlag;
}

/**
 * Channel-owned viewer item.
 */
export interface ChannelViewerItem {
  /** Primary key */
  id: number;
  /** Channel ID */
  channelId: number;
  /** Viewer ID */
  viewerId: string;
  /** Group ID */
  groupId?: number;
  /** Group name */
  groupName?: string;
  /** Viewer nickname */
  nickname?: string;
  /** WeChat avatar */
  wxAvatar?: string;
  /** WeCom avatar */
  qwAvatar?: string;
  /** Mobile number */
  mobile?: string;
}

export interface ListChannelViewersParams extends ChannelViewerScopedParams {
  /** Channel ID - REQUIRED */
  channelId: string | number;
  /** Group ID */
  groupId?: string | number;
  /** Viewer ID, max 64 chars */
  viewerId?: string;
  /** Viewer nickname, max 128 chars */
  nickname?: string;
  /** Mobile number, max 32 chars */
  mobile?: string;
  /** Page number, default 1 */
  pageNumber?: number;
  /** Page size, default 10, max 1000 */
  pageSize?: number;
}

export type ListChannelViewersResponse = ChannelViewerPageResponse<ChannelViewerItem>;

export interface ExportChannelViewersParams extends ChannelViewerScopedParams {
  /** Channel ID - REQUIRED */
  channelId: string | number;
  /** Group ID */
  groupId?: string | number;
  /** Viewer ID */
  viewerId?: string;
  /** Viewer nickname */
  nickname?: string;
  /** Mobile number */
  mobile?: string;
}

export type ExportChannelViewersResponse = string;

export interface AddChannelViewersParams extends ChannelViewerScopedParams {
  /** Channel ID - REQUIRED */
  channelId: string | number;
  /** Target group ID */
  groupId?: string | number;
  /** Viewer IDs, max 1000 - REQUIRED */
  viewerIds: string[];
}

export interface DeleteChannelViewersParams extends ChannelViewerScopedParams {
  /** Channel ID - REQUIRED */
  channelId: string | number;
  /** Viewer IDs, max 1000 - REQUIRED */
  viewerIds: string[];
}

export interface TransferChannelViewersParams extends ChannelViewerScopedParams {
  /** Channel ID - REQUIRED */
  channelId: string | number;
  /** Target group ID; omit to clear group association */
  targetGroupId?: string | number;
  /** Viewer IDs, max 1000 - REQUIRED */
  viewerIds: string[];
}

export type ChannelViewerImportFile = File | Blob | Buffer;

export interface ImportChannelViewersParams extends ChannelViewerScopedParams {
  /** Channel ID - REQUIRED */
  channelId: string | number;
  /** Target group ID */
  groupId?: string | number;
  /** Excel file - REQUIRED */
  file: ChannelViewerImportFile;
}

export interface ImportChannelViewersResponse {
  /** Successful import count */
  successCount: number;
  /** Failed import count */
  failCount: number;
  /** Failed detail file URL */
  failFileUrl?: string;
}

/**
 * Viewer not associated with any channel group.
 */
export interface UnrelatedChannelViewerItem {
  /** Viewer unique ID */
  viewerUnionId: string;
  /** Viewer nickname */
  nickname?: string;
  /** WeChat nickname */
  wxNickName?: string;
  /** Mobile number */
  mobile?: string;
  /** External viewer ID */
  externalViewerId?: string;
  /** WeChat OpenID */
  wxOpenId?: string;
  /** WeChat UnionID */
  wxUnionId?: string;
  /** Viewer source */
  source?: string;
  /** Name */
  name?: string;
  /** Last collected mobile number */
  lastCollectMobile?: string;
  /** Email */
  email?: string;
  /** Area */
  area?: string;
  /** Latest access IP */
  latestAccessIp?: string;
  /** Device information */
  device?: string;
  /** Total watch duration in seconds */
  watchDuration?: number;
  /** Watched channel count */
  watchChannelCount?: number;
  /** Label IDs */
  labelIds?: Array<string | number>;
  /** Label names */
  labelNames?: string[];
  /** Viewer status */
  status?: string;
  /** Creation time */
  createTime?: string;
}

export interface ListUnrelatedChannelViewersParams extends ChannelViewerScopedParams {
  /** Channel ID - REQUIRED */
  channelId: string | number;
  name?: string;
  mobile?: string;
  externalViewerId?: string;
  wxOpenId?: string;
  wxUnionId?: string;
  nickname?: string;
  wxNickName?: string;
  source?: string;
  email?: string;
  area?: string;
  lastCollectMobile?: string;
  /** Search keyword matching nickname and wxNickName */
  searchKeyword?: string;
  viewerId?: string;
  status?: string;
  /** Registration start time, yyyy-MM-dd HH:mm:ss */
  startCreateTime?: string;
  /** Registration end time, yyyy-MM-dd HH:mm:ss */
  endCreateTime?: string;
  /** Label IDs, max 10 */
  labelIds?: Array<string | number>;
  /** Page number, default 1, max 1000 */
  pageNumber?: number;
  /** Page size, default 10, max 1000 */
  pageSize?: number;
}

export type ListUnrelatedChannelViewersResponse = ChannelViewerPageResponse<UnrelatedChannelViewerItem>;
