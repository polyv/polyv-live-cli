/**
 * V4 Channel Service
 *
 * Service for managing PolyV V4 Channel operations.
 * Provides methods for channel CRUD, playback, session, statistics, and more.
 *
 * @module services/v4/channel
 */

import type { PolyVClient } from '../../client.js';
import type {
  // AC1: Basic Operations
  CreateChannelParams,
  CreateChannelResponse,
  BatchCreateChannelsParams,
  BatchCreateChannelsResponse,
  CreateMrChannelParams,
  CreateMrChannelResponse,
  BasicCreateChannelParams,
  UpdateChannelParams,
  UpdateChatEnabledParams,
  // AC2: Operate
  ChannelBasicInfo,
  ChannelDetail,
  ListChannelBasicParams,
  ChannelBasicListItem,
  ChannelSimpleListItem,
  ChannelDetailListItem,
  UpdateChannelTemplateParams,
  SetPullBitrateParams,
  AddAccountParams,
  UpdateAccountParams,
  DeleteAccountsParams,
  AccountViewerSettings,
  GetAccountViewerParams,
  UpdateAccountViewerParams,
  // AC3: Playback & Recordfile
  PlaybackListParams,
  PlaybackListResponse,
  QueryPlaybackVideoInfoParams,
  PlaybackVideoInfo,
  UpdateChannelSubtitleParams,
  PageMRecordParams,
  PageMRecordResponse,
  BatchPublishSubtitleParams,
  // AC4: Session
  SessionInfo,
  GetRelevanceParams,
  SessionRelevanceInfo,
  CreateSessionParams,
  CreateSessionResponse,
  GetSessionParams,
  ListSessionsParams,
  ListSessionsResponse,
  UpdateSessionParams,
  DeleteSessionParams,
  // AC5: Decorate & Donate
  DecorateSettings,
  GetDecorateParams,
  UpdateDecorateParams,
  UpdateSkinParams,
  DonateSettings,
  GetDonateParams,
  UpdateDonateParams,
  // AC6: Distribute
  DistributeItem,
  DistributeListResponse,
  ListDistributeParams,
  CreateDistributeBatchParams,
  UpdateDistributeBatchParams,
  DeleteDistributeBatchParams,
  DistributeStatistic,
  GetDistributeStatisticParams,
  UpdateMasterSwitchParams,
  UpdateSwitchParams,
  // AC7: Lottery & Interaction
  CreateWaitLotteryParams,
  CreateWaitLotteryResponse,
  QueryWinnerViewerParams,
  WinnerViewerInfo,
  LotteryActivity,
  CreateLotteryActivityParams,
  CreateLotteryActivityResponse,
  GetLotteryActivityParams,
  ListLotteryActivitiesParams,
  ListLotteryActivitiesResponse,
  UpdateLotteryActivityParams,
  DeleteLotteryActivityParams,
  BlacklistAddParams,
  BlacklistDeleteParams,
  BlacklistPageParams,
  BlacklistItem,
  GroupAddParams,
  GroupResponse,
  CreateViewerNameGroupParams,
  GroupDeleteParams,
  GroupListParams,
  GroupInfo,
  GroupUpdateParams,
  GroupViewerAddParams,
  GroupViewerDeleteParams,
  GroupViewerListParams,
  GroupViewerInfo,
  InteractionEventSaveParams,
  InteractionEventDeleteParams,
  InviterCreateParams,
  DiskVideoScriptUploadParams,
  DiskVideoScriptUploadResponse,
  DiskVideoScriptQueryParams,
  DiskVideoScriptInfo,
  DiskVideoScriptDeleteParams,
  // AC8: Market & CardPush
  ShareSettings,
  GetShareParams,
  UpdateShareParams,
  CardPushItem,
  CreateCardPushParams,
  CreateCardPushResponse,
  GetCardPushParams,
  UpdateCardPushParams,
  DeleteCardPushParams,
  PushCardParams,
  CancelCardPushParams,
  // AC9: Statistics
  BrowsersSummary,
  BrowsersSummaryParams,
  GeoSummary,
  GeoSummaryParams,
  InviteRankItem,
  GetInviteRankParams,
  InviteStats,
  GetInviteStatsParams,
  LiveSummary,
  LiveSummaryParams,
  LotteryStatistics,
  LotteryListParams,
  WeixinBookingStats,
  WeixinBookingStatsParams,
  // AC10: Product & Reward
  SortChannelProductParams,
  ProductSetting,
  GetProductSettingParams,
  UpdateProductSettingParams,
  ProductStatsItem,
  ProductStatsPageParams,
  ProductTag,
  CreateProductTagParams,
  CreateProductTagResponse,
  GetProductTagParams,
  ListProductTagsParams,
  ListChannelProductTagsResponse,
  UpdateProductTagParams,
  DeleteProductTagParams,
  GiftItem,
  GiftPageParams,
  LikeItem,
  LikePageParams,
  // AC11: Task Reward
  TaskReward,
  CreateTaskRewardParams,
  CreateTaskRewardResponse,
  GetTaskRewardParams,
  TaskRewardPageParams,
  UpdateTaskRewardParams,
  DeleteTaskRewardParams,
  StopTaskRewardParams,
  TaskRewardStats,
  GetTaskRewardStatsParams,
  SubmitAcceptInfoParams,
  TaskRewardViewerDetail,
  GetViewerDetailParams,
  GetViewerUnionDetailParams,
  // AC12: Other
  SubtitleInfo,
  GetSubtitleParams,
  LanguageInfo,
  UpdateSubtitleParams,
  RoleConfig,
  GetByRoleParams,
  UpdateByRoleParams,
  ViewerLogoutParams,
  LiveStatusItem,
  MonitorStreamInfo,
  GetLiveSessionParams,
  LiveSessionInfo,
  BatchCreatePopularizationParams,
  PopularizationInfo,
  PopularizationListParams,
  V4PaginationParams,
  AddChannelCouponParams,
  ChannelIdListInput,
  BatchPlaybackListParams,
  BatchPlaybackListResponse,
  SessionExternalBySessionParams,
  SessionExternalBySessionResponse,
  ChannelLotteryListParams,
  ChannelLotteryListResponse,
  AccountViewerConfig,
  LiveDataParams,
  LiveDataSummary,
  SubtitleConfigParams,
  SubtitleConfig,
  SubtitleLanguageInfo,
  SessionStatsListParams,
  SessionStatsListResponse,
  ListAllChannelBasicParams,
  ListAllChannelBasicResponse,
  ListAllChannelSimpleParams,
  ListAllChannelSimpleResponse,
  WeixinBookingListParams,
  WeixinBookingListResponse,
  InviteListParams,
  InviteListResponse,
  DistributeStatisticExactParams,
  DistributeStatisticExactResponse,
  CreateInitChannelParams,
  CreateInitChannelResponse,
  CreateAccountParams,
  ChannelRoleAccount,
  UpdateAccountInfoParams,
  DeleteAccountsBatchParams,
  CreateMrChannelExactParams,
  CreateMrChannelExactResponse,
  MonitorListStreamInfoParams,
  MonitorStreamInfoPoint,
  BatchPlaybackVideoInfoParams,
  PlaybackVideoInfoByChannel,
  LiveStatusListParams,
  ChannelLiveStatusItem,
  TeacherListParams,
  TeacherInfo,
  UpdateChannelSubtitleBatchParams,
  UpdateSkinBatchParams,
  UpdateAccountViewerConfigParams,
  SetPullBitrateExactParams,
  UpdateTemplateExactParams,
  UpdateSubtitleConfigParams,
  ListLotteryGroupViewersParams,
  ListLotteryGroupViewersResponse,
  ListLotteryViewerGroupsParams,
  ListLotteryViewerGroupsResponse,
  ListLuckyBagWinnersParams,
  ListLuckyBagWinnersResponse,
  ListLotteryBlacklistViewersParams,
  ListLotteryBlacklistViewersResponse,
  ListInteractionEventsParams,
  ListInteractionEventsResponse,
  CreateTaskRewardActivityParams,
  CreateTaskRewardActivityResponse,
  CreateLotteryGroupViewersParams,
  CreateLotteryGroupViewersResponse,
  DeleteLotteryGroupViewersParams,
  UpdateLotteryViewerGroupParams,
  UpdateLotteryViewerGroupResponse,
  ListViewerTaskRewardDetailsParams,
  ListViewerTaskRewardDetailsResponse,
  SubmitViewerTaskRewardAcceptInfoParams,
  DeleteLotteryBlacklistViewersParams,
  CreateLotteryBlacklistViewersParams,
  CreateLotteryBlacklistViewersResponse,
  DeleteLotteryViewerGroupParams,
  DeleteInteractionScriptParams,
  DeleteTaskRewardActivityParams,
  UploadDiskVideoCustomScriptParams,
  UploadDiskVideoCustomScriptResponse,
  StopTaskRewardActivityParams,
  CreateConditionWaitLotteryParams,
  CreateConditionWaitLotteryResponse,
  CreateLotteryViewerGroupParams,
  CreateLotteryViewerGroupResponse,
  UpdateDonateGiftParams,
  UpdateTaskRewardActivityParams,
  ListTaskRewardActivitiesParams,
  ListTaskRewardActivitiesResponse,
  ListTaskRewardViewerDetailsParams,
  ListTaskRewardViewerDetailsResponse,
  ListTaskRewardStatsParams,
  ListTaskRewardStatsResponse,
  QueryDiskVideoCustomScriptParams,
  QueryDiskVideoCustomScriptResponse,
  InvitePosterCreateParams,
  InvitePosterCreateResponse,
  ListLotteryActivityRecordsParams,
  ListLotteryActivityRecordsResponse,
  ListRewardGiftsParams,
  ListRewardGiftsResponse,
  ListRewardLikesParams,
  ListRewardLikesResponse,
  CreateLotteryGroupViewerNamesParams,
  CreateLotteryGroupViewerNamesResponse,
  ListCardPushesParams,
  ListCardPushesResponse,
  CardPushIdParams,
  CouponEnabledParams,
  CouponEnabled,
  UpdateCouponEnabledParams,
  ListChannelCouponsParams,
  ListChannelCouponsResponse,
  DeleteChannelCouponsParams,
  ProductPushRuleParams,
  ProductPushRule,
  UpdateProductPushRuleParams,
  ListProductStatsParams,
  ListProductStatsResponse,
  ProductStatsSummaryParams,
  ProductStatsSummary,
  SortChannelProductRankParams,
  ChannelProductActionParams,
  BatchCreatePopularizationsExactParams,
  BatchCreatePopularizationsExactResponse,
  ListPopularizationsExactParams,
  ListPopularizationsExactResponse,
  ListMaterialRecordFilesParams,
  ListMaterialRecordFilesResponse,
  CreateRecordFileOutlineParams,
  RecordFileOutline,
  GetRecordFileOutlineParams,
  BatchPublishRecordFileSubtitlesParams,
  WatchViewerLogoutParams,
  BatchUpdateChatEnabledParams,
} from '../../types/v4-channel.js';
import { PolyVValidationError } from '../../errors/polyv-validation-error.js';

/**
 * V4ChannelService
 *
 * Provides methods to interact with PolyV V4 Channel APIs.
 *
 * @example
 * ```typescript
 * const client = new PolyVClient({ appId: 'xxx', appSecret: 'yyy' });
 * const channel = await client.v4Channel.create({
 *   name: 'My Channel',
 *   newScene: 'topclass',
 *   template: 'ppt',
 * });
 * ```
 */
export class V4ChannelService {
  private client: PolyVClient;

  /**
   * Create a new V4ChannelService instance
   *
   * @param client - The PolyVClient instance to use for API calls
   */
  constructor(client: PolyVClient) {
    this.client = client;
  }

  // ============================================
  // AC1: Channel Basic Operations (6 APIs)
  // ============================================

  /**
   * Create a new channel
   *
   * @param params - Channel creation parameters
   * @returns Created channel info
   *
   * @example
   * ```typescript
   * const channel = await client.v4Channel.create({
   *   name: 'My Channel',
   *   newScene: 'topclass',
   *   template: 'ppt',
   * });
   * console.log(channel.channelId);
   * ```
   */
  async create(params: CreateChannelParams): Promise<CreateChannelResponse> {
    this.validateChannelName(params.name);

    const response = await this.client.httpClient.post<CreateChannelResponse>(
      '/live/v4/channel/create',
      params
    );
    return response as unknown as CreateChannelResponse;
  }

  /**
   * Batch create channels
   *
   * @param params - Batch creation parameters
   * @returns Created channels info
   *
   * @example
   * ```typescript
   * const result = await client.v4Channel.createBatch({
   *   channels: [{ name: 'Channel 1', newScene: 'topclass', template: 'ppt' }],
   * });
   * ```
   */
  async createBatch(params: BatchCreateChannelsParams): Promise<BatchCreateChannelsResponse> {
    if (!params.channels || params.channels.length === 0) {
      throw new PolyVValidationError('channels is required and cannot be empty');
    }
    if (params.channels.length > 30) {
      throw new PolyVValidationError('channels cannot contain more than 30 items');
    }

    // Validate each channel name
    for (let i = 0; i < params.channels.length; i++) {
      this.validateChannelName(params.channels[i].name, `channels[${i}].name`);
    }

    const response = await this.client.httpClient.post<BatchCreateChannelsResponse>(
      '/live/v4/channel/create-batch',
      params.channels
    );
    return response as unknown as BatchCreateChannelsResponse;
  }

  /**
   * Create MR channel
   *
   * @param params - MR channel creation parameters
   * @returns Created channel info
   */
  async createMr(params: CreateMrChannelParams): Promise<CreateMrChannelResponse> {
    this.validateChannelName(params.name);

    const response = await this.client.httpClient.post<CreateMrChannelResponse>(
      '/live/v4/channel/create-mr',
      params
    );
    return response as unknown as CreateMrChannelResponse;
  }

  /**
   * Basic create channel (legacy)
   *
   * @param params - Channel creation parameters
   * @returns Created channel info
   */
  async basicCreate(params: BasicCreateChannelParams): Promise<CreateChannelResponse> {
    this.validateChannelName(params.name);

    const response = await this.client.httpClient.post<CreateChannelResponse>(
      '/live/v4/channel/basic-create',
      params
    );
    return response as unknown as CreateChannelResponse;
  }

  /**
   * Update channel
   *
   * @param params - Channel update parameters
   *
   * @example
   * ```typescript
   * await client.v4Channel.update({
   *   channelId: '123456',
   *   name: 'New Name',
   * });
   * ```
   */
  async update(params: UpdateChannelParams): Promise<void> {
    this.validateChannelId(params.channelId);
    const { channelId, channelPasswd, ...body } = params;
    const requestBody: Record<string, unknown> = { ...body };
    if (channelPasswd !== undefined) {
      requestBody.password = channelPasswd;
    }

    await this.client.httpClient.post(
      '/live/v4/channel/update',
      requestBody,
      { params: { channelId } }
    );
  }

  /**
   * Update chat enabled status
   *
   * @param params - Update parameters
   */
  async updateChatEnabled(params: UpdateChatEnabledParams): Promise<void> {
    this.validateChannelId(params.channelId);

    await this.client.httpClient.post(
      '/live/v4/channel/chat/update-chat-enabled',
      null,
      { params }
    );
  }

  // ============================================
  // AC2: Channel Operate APIs (14 APIs)
  // ============================================

  /**
   * Get channel info
   *
   * @param params - Query parameters
   * @returns Channel basic info
   */
  async getChannel(params: { channelId: string }): Promise<ChannelBasicInfo> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<ChannelBasicInfo>(
      '/live/v4/channel/basic/get',
      { params }
    );
    return response as unknown as ChannelBasicInfo;
  }

  /**
   * Get channel detail
   *
   * @param params - Query parameters
   * @returns Channel detail info
   */
  async getChannelDetail(params: { channelId: string }): Promise<ChannelDetail> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<ChannelDetail>(
      '/live/v4/channel/operate/get-channel-detail',
      { params }
    );
    return response as unknown as ChannelDetail;
  }

  /**
   * List channel basic
   *
   * @param params - Query parameters
   * @returns Channel basic list
   */
  async listChannelBasic(params: ListChannelBasicParams): Promise<{ contents: ChannelBasicListItem[] }> {
    this.validatePaginationParams(params);

    const response = await this.client.httpClient.get<{ contents: ChannelBasicListItem[] }>(
      '/live/v4/channel/operate/list-channel-basic',
      { params }
    );
    return response as unknown as { contents: ChannelBasicListItem[] };
  }

  /**
   * List channel basic info
   *
   * @param params - Query parameters
   * @returns Channel basic info list
   */
  async listChannelBasicInfo(params: { channelId: string }): Promise<ChannelBasicInfo> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<ChannelBasicInfo>(
      '/live/v4/channel/operate/list-channel-basic-info',
      { params }
    );
    return response as unknown as ChannelBasicInfo;
  }

  /**
   * Channel basic list
   *
   * @param params - Query parameters
   * @returns Channel basic list
   */
  async channelBasicList(params: V4PaginationParams): Promise<{ contents: ChannelBasicListItem[] }> {
    this.validatePaginationParams(params);

    const response = await this.client.httpClient.get<{ contents: ChannelBasicListItem[] }>(
      '/live/v4/channel/operate/channel-basic-list',
      { params }
    );
    return response as unknown as { contents: ChannelBasicListItem[] };
  }

  /**
   * Channel simple list
   *
   * @param params - Query parameters
   * @returns Channel simple list
   */
  async channelSimpleList(params?: V4PaginationParams): Promise<{ contents: ChannelSimpleListItem[] }> {
    const response = await this.client.httpClient.get<{ contents: ChannelSimpleListItem[] }>(
      '/live/v4/channel/operate/channel-simple-list',
      { params: params || {} }
    );
    return response as unknown as { contents: ChannelSimpleListItem[] };
  }

  /**
   * Channel detail list
   *
   * @param params - Query parameters
   * @returns Channel detail list
   */
  async channelDetailList(params: V4PaginationParams): Promise<{ contents: ChannelDetailListItem[] }> {
    this.validatePaginationParams(params);

    const response = await this.client.httpClient.get<{ contents: ChannelDetailListItem[] }>(
      '/live/v4/channel/detail/list',
      { params }
    );
    return response as unknown as { contents: ChannelDetailListItem[] };
  }

  /**
   * Update channel template
   *
   * @param params - Update parameters
   */
  async channelUpdateTemplate(params: UpdateChannelTemplateParams): Promise<void> {
    this.validateChannelId(params.channelId);

    await this.client.httpClient.post(
      '/live/v4/channel/operate/channel-update-template',
      null,
      { params }
    );
  }

  /**
   * Set pull bitrate
   *
   * @param params - Set parameters
   */
  async channelSetPullBitrate(params: SetPullBitrateParams): Promise<void> {
    this.validateChannelId(params.channelId);

    await this.client.httpClient.post(
      '/live/v4/channel/operate/channel-set-pull-bitrate',
      null,
      { params }
    );
  }

  /**
   * Add account
   *
   * @param params - Account parameters
   * @returns Account ID
   */
  async addAccount(params: AddAccountParams): Promise<{ accountId: number }> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.post<{ accountId: number }>(
      '/live/v4/channel/operate/account/add-account',
      null,
      { params }
    );
    return response as unknown as { accountId: number };
  }

  /**
   * Update account
   *
   * @param params - Update parameters
   */
  async updateAccount(params: UpdateAccountParams): Promise<void> {
    this.validateChannelId(params.channelId);

    await this.client.httpClient.post(
      '/live/v4/channel/operate/account/update-account',
      null,
      { params }
    );
  }

  /**
   * Delete accounts
   *
   * @param params - Delete parameters
   */
  async deleteAccounts(params: DeleteAccountsParams): Promise<void> {
    this.validateChannelId(params.channelId);

    await this.client.httpClient.post(
      '/live/v4/channel/operate/account/delete-accounts',
      null,
      { params: { channelId: params.channelId, accountIds: params.accountIds.join(',') } }
    );
  }

  /**
   * Get account viewer settings
   *
   * @param params - Query parameters
   * @returns Account viewer settings
   */
  async getAccountViewer(params: GetAccountViewerParams): Promise<AccountViewerSettings> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<AccountViewerSettings>(
      '/live/v4/channel/operate/account/get-account-viewer',
      { params }
    );
    return response as unknown as AccountViewerSettings;
  }

  /**
   * Update account viewer settings
   *
   * @param params - Update parameters
   */
  async updateAccountViewer(params: UpdateAccountViewerParams): Promise<void> {
    this.validateChannelId(params.channelId);

    await this.client.httpClient.post(
      '/live/v4/channel/operate/account/update-account-viewer',
      null,
      { params }
    );
  }

  // ============================================
  // AC3: Playback & Recordfile APIs (5 APIs)
  // ============================================

  /**
   * List playbacks
   *
   * @param params - Query parameters
   * @returns Playback list
   */
  async playbackList(params: PlaybackListParams): Promise<PlaybackListResponse> {
    this.validateChannelId(params.channelId);
    this.validatePaginationParams(params);

    const response = await this.client.httpClient.get<PlaybackListResponse>(
      '/live/v4/channel/playback/playback-list',
      { params }
    );
    return response as unknown as PlaybackListResponse;
  }

  /**
   * Query playback video info
   *
   * @param params - Query parameters
   * @returns Playback video info
   */
  async queryPlaybackVideoInfo(params: QueryPlaybackVideoInfoParams): Promise<PlaybackVideoInfo> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<PlaybackVideoInfo>(
      '/live/v4/channel/play-back/query-play-back-video-info',
      { params }
    );
    return response as unknown as PlaybackVideoInfo;
  }

  /**
   * Update channel subtitle
   *
   * @param params - Update parameters
   */
  async updateChannelSubtitle(params: UpdateChannelSubtitleParams): Promise<void> {
    this.validateChannelId(params.channelId);

    await this.client.httpClient.post(
      '/live/v4/channel/playback/update-channel-subtitle',
      params
    );
  }

  /**
   * Page recorded files
   *
   * @param params - Query parameters
   * @returns Recorded files list
   */
  async pageMRecord(params: PageMRecordParams): Promise<PageMRecordResponse> {
    this.validateChannelId(params.channelId);
    this.validatePaginationParams(params);

    const response = await this.client.httpClient.get<PageMRecordResponse>(
      '/live/v4/channel/recordfile/page-m-record',
      { params }
    );
    return response as unknown as PageMRecordResponse;
  }

  /**
   * Batch publish subtitle
   *
   * @param params - Publish parameters
   */
  async batchPublishSubtitle(params: BatchPublishSubtitleParams): Promise<void> {
    this.validateChannelId(params.channelId);

    await this.client.httpClient.post(
      '/live/v4/channel/recordfile/batch-publish-subtitle',
      params
    );
  }

  // ============================================
  // AC4: Session APIs (6 APIs)
  // ============================================

  /**
   * Get session relevance
   *
   * @param params - Query parameters
   * @returns Session relevance info
   */
  async getRelevance(params: GetRelevanceParams): Promise<SessionRelevanceInfo> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<SessionRelevanceInfo>(
      '/live/v4/channel/session/get-relevance',
      { params }
    );
    return response as unknown as SessionRelevanceInfo;
  }

  /**
   * Create session
   *
   * @param params - Session creation parameters
   * @returns Created session info
   */
  async sessionCreate(params: CreateSessionParams): Promise<CreateSessionResponse> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.post<CreateSessionResponse>(
      '/live/v4/channel/session/new/create',
      params,
      { params: { channelId: params.channelId } }
    );
    return response as unknown as CreateSessionResponse;
  }

  /**
   * Get session
   *
   * @param params - Query parameters
   * @returns Session info
   */
  async sessionGet(params: GetSessionParams): Promise<SessionInfo> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<SessionInfo>(
      '/live/v4/channel/session/new/get',
      { params }
    );
    return response as unknown as SessionInfo;
  }

  /**
   * List sessions
   *
   * @param params - Query parameters
   * @returns Sessions list
   */
  async sessionList(params: ListSessionsParams): Promise<ListSessionsResponse> {
    // channelId is optional - if not provided, returns sessions for all channels
    if (params.channelId) {
      this.validateChannelId(params.channelId);
    }
    this.validatePaginationParams(params);

    const response = await this.client.httpClient.get<ListSessionsResponse>(
      '/live/v4/channel/session/new/list',
      { params }
    );
    return response as unknown as ListSessionsResponse;
  }

  /**
   * Update session
   *
   * @param params - Update parameters
   */
  async sessionUpdate(params: UpdateSessionParams): Promise<void> {
    this.validateChannelId(params.channelId);

    await this.client.httpClient.post(
      '/live/v4/channel/session/new/update',
      params,
      { params: { channelId: params.channelId, sessionId: params.sessionId } }
    );
  }

  /**
   * Delete session
   *
   * @param params - Delete parameters
   */
  async sessionDelete(params: DeleteSessionParams): Promise<void> {
    this.validateChannelId(params.channelId);

    await this.client.httpClient.post(
      '/live/v4/channel/session/new/delete',
      null,
      { params }
    );
  }

  // ============================================
  // AC5: Decorate & Donate APIs (5 APIs)
  // ============================================

  /**
   * Get decorate settings
   *
   * @param params - Query parameters
   * @returns Decorate settings
   */
  async getDecorate(params: GetDecorateParams): Promise<DecorateSettings> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<DecorateSettings>(
      '/live/v4/channel/decorate/get',
      { params }
    );
    return response as unknown as DecorateSettings;
  }

  /**
   * Update decorate settings
   *
   * @param params - Update parameters
   */
  async updateDecorate(params: UpdateDecorateParams): Promise<void> {
    this.validateChannelId(params.channelId);

    await this.client.httpClient.post(
      '/live/v4/channel/decorate/update',
      params
    );
  }

  /**
   * Update skin
   *
   * @param params - Update parameters
   */
  async updateSkin(params: UpdateSkinParams): Promise<void> {
    this.validateChannelId(params.channelId);

    await this.client.httpClient.post(
      '/live/v4/channel/decorate/skin-update',
      params
    );
  }

  /**
   * Get donate settings
   *
   * @param params - Query parameters
   * @returns Donate settings
   */
  async getDonate(params: GetDonateParams): Promise<DonateSettings> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<DonateSettings>(
      '/live/v4/channel/donate/get',
      { params }
    );
    return response as unknown as DonateSettings;
  }

  /**
   * Update donate settings
   *
   * @param params - Update parameters
   */
  async updateDonate(params: UpdateDonateParams): Promise<void> {
    this.validateChannelId(params.channelId);

    await this.client.httpClient.post(
      '/live/v4/channel/donate/update',
      params
    );
  }

  // ============================================
  // AC6: Distribute APIs (7 APIs)
  // ============================================

  /**
   * List distributes
   *
   * @param params - Query parameters
   * @returns Distribute list
   */
  async distributeList(params: ListDistributeParams): Promise<DistributeListResponse> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<DistributeListResponse>(
      '/live/v4/channel/distribute/list',
      { params }
    );
    return response as unknown as DistributeListResponse;
  }

  /**
   * Batch create distributes
   *
   * @param params - Creation parameters
   */
  async distributeCreateBatch(params: CreateDistributeBatchParams): Promise<void> {
    this.validateChannelId(params.channelId);

    await this.client.httpClient.post(
      '/live/v4/channel/distribute/create-batch',
      params
    );
  }

  /**
   * Batch update distributes
   *
   * @param params - Update parameters
   */
  async distributeUpdateBatch(params: UpdateDistributeBatchParams): Promise<void> {
    this.validateChannelId(params.channelId);

    await this.client.httpClient.post(
      '/live/v4/channel/distribute/update-batch',
      params
    );
  }

  /**
   * Batch delete distributes
   *
   * @param params - Delete parameters
   */
  async distributeDeleteBatch(params: DeleteDistributeBatchParams): Promise<void> {
    this.validateChannelId(params.channelId);

    await this.client.httpClient.post(
      '/live/v4/channel/distribute/delete-batch',
      null,
      { params: { channelId: params.channelId, ids: params.ids.join(',') } }
    );
  }

  /**
   * Get distribute statistics
   *
   * @param params - Query parameters
   * @returns Distribute statistics
   */
  async distributeStatistic(params: GetDistributeStatisticParams): Promise<DistributeStatistic> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<DistributeStatistic>(
      '/live/v4/channel/distribute/statistic',
      { params }
    );
    return response as unknown as DistributeStatistic;
  }

  /**
   * Update master switch
   *
   * @param params - Update parameters
   */
  async updateMasterSwitch(params: UpdateMasterSwitchParams): Promise<void> {
    this.validateChannelId(params.channelId);

    await this.client.httpClient.post(
      '/live/v4/channel/distribute/update-master-switch',
      null,
      { params }
    );
  }

  /**
   * Update switch
   *
   * @param params - Update parameters
   */
  async updateSwitch(params: UpdateSwitchParams): Promise<void> {
    this.validateChannelId(params.channelId);

    await this.client.httpClient.post(
      '/live/v4/channel/distribute/update-switch',
      null,
      { params }
    );
  }

  // ============================================
  // AC7: Lottery & Interaction APIs (24 APIs)
  // ============================================

  /**
   * Create wait lottery
   *
   * @param params - Creation parameters
   * @returns Lottery ID
   */
  async createWaitLottery(params: CreateWaitLotteryParams): Promise<CreateWaitLotteryResponse> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.post<CreateWaitLotteryResponse>(
      '/live/v4/channel/lottery/create-wait-lottery',
      params
    );
    return response as unknown as CreateWaitLotteryResponse;
  }

  /**
   * Query winner viewer
   *
   * @param params - Query parameters
   * @returns Winner viewer list
   */
  async queryWinnerViewer(params: QueryWinnerViewerParams): Promise<WinnerViewerInfo[]> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<WinnerViewerInfo[]>(
      '/live/v4/channel/lottery/query-winner-viewer',
      { params }
    );
    return response as unknown as WinnerViewerInfo[];
  }

  /**
   * Create lottery activity
   *
   * @param params - Creation parameters
   * @returns Activity ID
   */
  async lotteryActivityCreate(params: CreateLotteryActivityParams): Promise<CreateLotteryActivityResponse> {
    this.validateLotteryActivityBody(params);
    const { channelId, ...body } = params;

    const response = await this.client.httpClient.post<CreateLotteryActivityResponse>(
      '/live/v4/channel/lottery-activity/create',
      body,
      { params: { channelId } }
    );
    return response as unknown as CreateLotteryActivityResponse;
  }

  /**
   * Get lottery activity
   *
   * @param params - Query parameters
   * @returns Lottery activity
   */
  async lotteryActivityGet(params: GetLotteryActivityParams): Promise<LotteryActivity> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<LotteryActivity>(
      '/live/v4/channel/lottery-activity/get',
      { params }
    );
    return response as unknown as LotteryActivity;
  }

  /**
   * List lottery activities
   *
   * @param params - Query parameters
   * @returns Lottery activities list
   */
  async lotteryActivityList(params: ListLotteryActivitiesParams): Promise<ListLotteryActivitiesResponse> {
    this.validateChannelId(params.channelId);
    this.validatePaginationParams(params);

    const response = await this.client.httpClient.get<ListLotteryActivitiesResponse>(
      '/live/v4/channel/lottery-activity/list',
      { params }
    );
    return response as unknown as ListLotteryActivitiesResponse;
  }

  /**
   * Update lottery activity
   *
   * @param params - Update parameters
   */
  async lotteryActivityUpdate(params: UpdateLotteryActivityParams): Promise<void> {
    this.validateLotteryActivityBody(params);
    this.validateRequiredId(params.id, 'id');
    const { channelId, ...body } = params;

    await this.client.httpClient.post(
      '/live/v4/channel/lottery-activity/update',
      body,
      { params: { channelId } }
    );
  }

  /**
   * Delete lottery activity
   *
   * @param params - Delete parameters
   */
  async lotteryActivityDelete(params: DeleteLotteryActivityParams): Promise<void> {
    this.validateChannelId(params.channelId);
    this.validateRequiredId(params.id, 'id');
    const { channelId, ...body } = params;

    await this.client.httpClient.post(
      '/live/v4/channel/lottery-activity/delete',
      body,
      { params: { channelId } }
    );
  }

  /**
   * Add to blacklist
   *
   * @param params - Add parameters
   */
  async blacklistAdd(params: BlacklistAddParams): Promise<void> {
    this.validateChannelId(params.channelId);

    await this.client.httpClient.post(
      '/live/v4/channel/lottery-viewer/blacklist-add',
      params
    );
  }

  /**
   * Delete from blacklist
   *
   * @param params - Delete parameters
   */
  async blacklistDelete(params: BlacklistDeleteParams): Promise<void> {
    this.validateChannelId(params.channelId);

    await this.client.httpClient.post(
      '/live/v4/channel/lottery-viewer/blacklist-delete',
      null,
      { params: { channelId: params.channelId, viewerIds: params.viewerIds.join(',') } }
    );
  }

  /**
   * Page blacklist
   *
   * @param params - Query parameters
   * @returns Blacklist page
   */
  async blacklistPage(params: BlacklistPageParams): Promise<{ contents: BlacklistItem[] }> {
    this.validateChannelId(params.channelId);
    this.validatePaginationParams(params);

    const response = await this.client.httpClient.get<{ contents: BlacklistItem[] }>(
      '/live/v4/channel/lottery-viewer/blacklist-page',
      { params }
    );
    return response as unknown as { contents: BlacklistItem[] };
  }

  /**
   * Add group
   *
   * @param params - Add parameters
   * @returns Group ID
   */
  async groupAdd(params: GroupAddParams): Promise<GroupResponse> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.post<GroupResponse>(
      '/live/v4/channel/lottery-viewer/group-add',
      params
    );
    return response as unknown as GroupResponse;
  }

  /**
   * Create viewer name group
   *
   * @param params - Creation parameters
   * @returns Group ID
   */
  async groupCreateViewerName(params: CreateViewerNameGroupParams): Promise<GroupResponse> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.post<GroupResponse>(
      '/live/v4/channel/lottery-viewer/group-create-viewer-name',
      params
    );
    return response as unknown as GroupResponse;
  }

  /**
   * Delete group
   *
   * @param params - Delete parameters
   */
  async groupDelete(params: GroupDeleteParams): Promise<void> {
    this.validateChannelId(params.channelId);

    await this.client.httpClient.post(
      '/live/v4/channel/lottery-viewer/group-delete',
      null,
      { params }
    );
  }

  /**
   * List groups
   *
   * @param params - Query parameters
   * @returns Groups list
   */
  async groupList(params: GroupListParams): Promise<GroupInfo[]> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<GroupInfo[]>(
      '/live/v4/channel/lottery-viewer/group-list',
      { params }
    );
    return response as unknown as GroupInfo[];
  }

  /**
   * Update group
   *
   * @param params - Update parameters
   */
  async groupUpdate(params: GroupUpdateParams): Promise<void> {
    this.validateChannelId(params.channelId);

    await this.client.httpClient.post(
      '/live/v4/channel/lottery-viewer/group-update',
      params
    );
  }

  /**
   * Add viewer to group
   *
   * @param params - Add parameters
   */
  async groupViewerAdd(params: GroupViewerAddParams): Promise<void> {
    this.validateChannelId(params.channelId);

    await this.client.httpClient.post(
      '/live/v4/channel/lottery-viewer/group-viewer-add',
      null,
      { params: { ...params, viewerIds: params.viewerIds.join(',') } }
    );
  }

  /**
   * Delete viewer from group
   *
   * @param params - Delete parameters
   */
  async groupViewerDelete(params: GroupViewerDeleteParams): Promise<void> {
    this.validateChannelId(params.channelId);

    await this.client.httpClient.post(
      '/live/v4/channel/lottery-viewer/group-viewer-delete',
      null,
      { params: { ...params, viewerIds: params.viewerIds.join(',') } }
    );
  }

  /**
   * List group viewers
   *
   * @param params - Query parameters
   * @returns Group viewers list
   */
  async groupViewerList(params: GroupViewerListParams): Promise<GroupViewerInfo[]> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<GroupViewerInfo[]>(
      '/live/v4/channel/lottery-viewer/group-viewer-list',
      { params }
    );
    return response as unknown as GroupViewerInfo[];
  }

  /**
   * Save interaction event
   *
   * @param params - Save parameters
   */
  async interactionEventSave(params: InteractionEventSaveParams): Promise<void> {
    this.validateChannelId(params.channelId);

    await this.client.httpClient.post(
      '/live/v4/channel/interaction-event/save',
      params
    );
  }

  /**
   * Delete interaction event
   *
   * @param params - Delete parameters
   */
  async interactionEventDelete(params: InteractionEventDeleteParams): Promise<void> {
    this.validateChannelId(params.channelId);

    await this.client.httpClient.post(
      '/live/v4/channel/interaction-event/delete',
      null,
      { params }
    );
  }

  /**
   * Create inviter
   *
   * @param params - Creation parameters
   */
  async inviterCreate(params: InviterCreateParams): Promise<void> {
    this.validateChannelId(params.channelId);

    await this.client.httpClient.post(
      '/live/v4/channel/interaction/invite/inviter-create',
      params
    );
  }

  /**
   * Upload disk video script
   *
   * @param params - Upload parameters
   * @returns Script ID
   */
  async diskVideoScriptUpload(params: DiskVideoScriptUploadParams): Promise<DiskVideoScriptUploadResponse> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.post<DiskVideoScriptUploadResponse>(
      '/live/v4/channel/interaction/script/disk-video-script-upload',
      params
    );
    return response as unknown as DiskVideoScriptUploadResponse;
  }

  /**
   * Query disk video script
   *
   * @param params - Query parameters
   * @returns Script info
   */
  async diskVideoScriptQuery(params: DiskVideoScriptQueryParams): Promise<DiskVideoScriptInfo[]> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<DiskVideoScriptInfo[]>(
      '/live/v4/channel/interaction/script/disk-video-script-query',
      { params }
    );
    return response as unknown as DiskVideoScriptInfo[];
  }

  /**
   * Delete disk video script
   *
   * @param params - Delete parameters
   */
  async diskVideoScriptDelete(params: DiskVideoScriptDeleteParams): Promise<void> {
    this.validateChannelId(params.channelId);

    await this.client.httpClient.post(
      '/live/v4/channel/interaction/script/disk-video-script-delete',
      null,
      { params }
    );
  }

  // ============================================
  // AC8: Market & CardPush APIs (8 APIs)
  // ============================================

  /**
   * Get share settings
   *
   * @param params - Query parameters
   * @returns Share settings
   */
  async shareGet(params: GetShareParams): Promise<ShareSettings> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<ShareSettings>(
      '/live/v4/channel/share/get',
      { params }
    );
    return response as unknown as ShareSettings;
  }

  /**
   * Update share settings
   *
   * @param params - Update parameters
   */
  async shareUpdate(params: UpdateShareParams): Promise<ShareSettings> {
    this.validateChannelId(params.channelId);
    this.validateRequiredString(params.shareBtnEnable, 'shareBtnEnable');
    this.validateOptionalYn(params.shareBtnEnable, 'shareBtnEnable');
    this.validateRequiredString(params.titleType, 'titleType');
    this.validateOptionalYn(params.weixinShareCustomUrlWithParamEnabled, 'weixinShareCustomUrlWithParamEnabled');
    this.validateOptionalYn(params.webShareCustomUrlWithParamEnabled, 'webShareCustomUrlWithParamEnabled');

    const response = await this.client.httpClient.get<ShareSettings>(
      '/live/v4/channel/share/update',
      { params }
    );
    return response as unknown as ShareSettings;
  }

  /**
   * Create card push
   *
   * @param params - Creation parameters
   * @returns Card ID
   */
  async cardPushCreate(params: CreateCardPushParams): Promise<CreateCardPushResponse> {
    this.validateCardPushCreateParams(params);

    const response = await this.client.httpClient.get<CreateCardPushResponse>(
      '/live/v4/channel/card-push/create',
      { params }
    );
    return response as unknown as CreateCardPushResponse;
  }

  /**
   * Get card push
   *
   * @param params - Query parameters
   * @returns Card push info
   */
  async cardPushGet(params: GetCardPushParams): Promise<CardPushItem> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<CardPushItem>(
      '/live/v4/channel/market/cardPush/get',
      { params }
    );
    return response as unknown as CardPushItem;
  }

  /**
   * Update card push
   *
   * @param params - Update parameters
   */
  async cardPushUpdate(params: UpdateCardPushParams): Promise<void> {
    this.validateCardPushIdParams(params);
    this.validateCardPushOptionalParams(params);

    await this.client.httpClient.post(
      '/live/v4/channel/card-push/update',
      params
    );
  }

  /**
   * Delete card push
   *
   * @param params - Delete parameters
   */
  async cardPushDelete(params: DeleteCardPushParams): Promise<void> {
    this.validateCardPushIdParams(params);

    await this.client.httpClient.post(
      '/live/v4/channel/card-push/delete',
      null,
      { params }
    );
  }

  /**
   * Push card
   *
   * @param params - Push parameters
   */
  async cardPushPush(params: PushCardParams): Promise<void> {
    this.validateCardPushIdParams(params);

    await this.client.httpClient.post(
      '/live/v4/channel/card-push/push',
      null,
      { params }
    );
  }

  /**
   * Cancel card push
   *
   * @param params - Cancel parameters
   */
  async cardPushCancelPush(params: CancelCardPushParams): Promise<void> {
    this.validateCardPushIdParams(params);

    await this.client.httpClient.post(
      '/live/v4/channel/card-push/cancel-push',
      null,
      { params }
    );
  }

  // ============================================
  // AC9: Statistics APIs (7 APIs)
  // ============================================

  /**
   * Get browsers summary
   *
   * @param params - Query parameters
   * @returns Browsers summary
   */
  async browsersSummary(params: BrowsersSummaryParams): Promise<BrowsersSummary[]> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<BrowsersSummary[]>(
      '/live/v4/channel/statistics/browsers-summary',
      { params }
    );
    return response as unknown as BrowsersSummary[];
  }

  /**
   * Get geo summary
   *
   * @param params - Query parameters
   * @returns Geo summary
   */
  async geoSummaryMc(params: GeoSummaryParams): Promise<GeoSummary[]> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<GeoSummary[]>(
      '/live/v4/channel/statistics/geo-summary-mc',
      { params }
    );
    return response as unknown as GeoSummary[];
  }

  /**
   * Get invite rank
   *
   * @param params - Query parameters
   * @returns Invite rank list
   */
  async getInviteRank(params: GetInviteRankParams): Promise<InviteRankItem[]> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<InviteRankItem[]>(
      '/live/v4/channel/statistics/get-invite-rank',
      { params }
    );
    return response as unknown as InviteRankItem[];
  }

  /**
   * Get invite stats
   *
   * @param params - Query parameters
   * @returns Invite stats
   */
  async getInviteStats(params: GetInviteStatsParams): Promise<InviteStats> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<InviteStats>(
      '/live/v4/channel/statistics/get-invite-stats',
      { params }
    );
    return response as unknown as InviteStats;
  }

  /**
   * Get live summary
   *
   * @param params - Query parameters
   * @returns Live summary
   */
  async liveSummary(params: LiveSummaryParams): Promise<LiveSummary> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<LiveSummary>(
      '/live/v4/channel/statistics/live-summary',
      { params }
    );
    return response as unknown as LiveSummary;
  }

  /**
   * List lotteries
   *
   * @param params - Query parameters
   * @returns Lottery statistics list
   */
  async lotteryList(params: LotteryListParams): Promise<{ contents: LotteryStatistics[] }> {
    this.validateChannelId(params.channelId);
    this.validatePaginationParams(params);

    const response = await this.client.httpClient.get<{ contents: LotteryStatistics[] }>(
      '/live/v4/channel/statistics/lottery-list',
      { params }
    );
    return response as unknown as { contents: LotteryStatistics[] };
  }

  /**
   * Get WeChat booking stats
   *
   * @param params - Query parameters
   * @returns WeChat booking stats
   */
  async weixinBookingStats(params: WeixinBookingStatsParams): Promise<WeixinBookingStats> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<WeixinBookingStats>(
      '/live/v4/channel/statistics/weixin-booking-stats',
      { params }
    );
    return response as unknown as WeixinBookingStats;
  }

  // ============================================
  // AC10: Product & Reward APIs (12 APIs)
  // ============================================

  /**
   * Sort channel product
   *
   * @param params - Sort parameters
   */
  async sortChannelProduct(params: SortChannelProductParams): Promise<void> {
    this.validateChannelId(params.channelId);

    await this.client.httpClient.post(
      '/live/v4/channel/product/sort-channel-product',
      params
    );
  }

  /**
   * Get product setting
   *
   * @param params - Query parameters
   * @returns Product setting
   */
  async getProductSetting(params: GetProductSettingParams): Promise<ProductSetting> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<ProductSetting>(
      '/live/v4/channel/product-setting/get-product-setting',
      { params }
    );
    return response as unknown as ProductSetting;
  }

  /**
   * Update product setting
   *
   * @param params - Update parameters
   */
  async updateProductSetting(params: UpdateProductSettingParams): Promise<void> {
    this.validateChannelId(params.channelId);

    await this.client.httpClient.post(
      '/live/v4/channel/product-setting/update-product-setting',
      params
    );
  }

  /**
   * Page product stats
   *
   * @param params - Query parameters
   * @returns Product stats list
   */
  async productStatsPage(params: ProductStatsPageParams): Promise<{ contents: ProductStatsItem[] }> {
    this.validateChannelId(params.channelId);
    this.validatePaginationParams(params);

    const response = await this.client.httpClient.get<{ contents: ProductStatsItem[] }>(
      '/live/v4/channel/product-stats/page',
      { params }
    );
    return response as unknown as { contents: ProductStatsItem[] };
  }

  /**
   * Create product tag
   *
   * @param params - Creation parameters
   * @returns Tag ID
   */
  async productTagCreate(params: CreateProductTagParams): Promise<CreateProductTagResponse> {
    this.validateChannelId(params.channelId);
    this.validateRequiredString(params.name, 'name');

    const { channelId, ...body } = params;
    const response = await this.client.httpClient.post<CreateProductTagResponse>(
      '/live/v4/channel/product/tag/create',
      body,
      { params: { channelId } }
    );
    return response as unknown as CreateProductTagResponse;
  }

  /**
   * Get product tag
   *
   * @param params - Query parameters
   * @returns Product tag
   */
  async productTagGet(params: GetProductTagParams): Promise<ProductTag> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<ProductTag>(
      '/live/v4/channel/product-tag/product-tag-get',
      { params }
    );
    return response as unknown as ProductTag;
  }

  /**
   * List product tags
   *
   * @param params - Query parameters
   * @returns Product tags list
   */
  async productTagList(params: ListProductTagsParams): Promise<ListChannelProductTagsResponse> {
    this.validateChannelId(params.channelId);
    this.validateOptionalPaginationParams(params);

    const response = await this.client.httpClient.get<ListChannelProductTagsResponse>(
      '/live/v4/channel/product/tag/list',
      { params }
    );
    return response as unknown as ListChannelProductTagsResponse;
  }

  /**
   * Update product tag
   *
   * @param params - Update parameters
   */
  async productTagUpdate(params: UpdateProductTagParams): Promise<void> {
    this.validateChannelId(params.channelId);
    this.validateRequiredId(params.id, 'id');
    this.validateRequiredString(params.name, 'name');

    const { channelId, ...body } = params;
    await this.client.httpClient.post(
      '/live/v4/channel/product/tag/update',
      body,
      { params: { channelId } }
    );
  }

  /**
   * Delete product tag
   *
   * @param params - Delete parameters
   */
  async productTagDelete(params: DeleteProductTagParams): Promise<void> {
    this.validateChannelId(params.channelId);
    this.validateRequiredId(params.id, 'id');

    const { channelId, ...body } = params;
    await this.client.httpClient.post(
      '/live/v4/channel/product/tag/delete',
      body,
      { params: { channelId } }
    );
  }

  /**
   * Page gifts
   *
   * @param params - Query parameters
   * @returns Gift list
   */
  async giftPage(params: GiftPageParams): Promise<{ contents: GiftItem[] }> {
    this.validateChannelId(params.channelId);
    this.validatePaginationParams(params);

    const response = await this.client.httpClient.get<{ contents: GiftItem[] }>(
      '/live/v4/channel/reward/gift-page',
      { params }
    );
    return response as unknown as { contents: GiftItem[] };
  }

  /**
   * Page likes
   *
   * @param params - Query parameters
   * @returns Like list
   */
  async likePage(params: LikePageParams): Promise<{ contents: LikeItem[] }> {
    this.validateChannelId(params.channelId);
    this.validatePaginationParams(params);

    const response = await this.client.httpClient.get<{ contents: LikeItem[] }>(
      '/live/v4/channel/reward/like-page',
      { params }
    );
    return response as unknown as { contents: LikeItem[] };
  }

  // ============================================
  // AC11: Task Reward APIs (10 APIs)
  // ============================================

  /**
   * Create task reward
   *
   * @param params - Creation parameters
   * @returns Task ID
   */
  async taskRewardCreate(params: CreateTaskRewardParams): Promise<CreateTaskRewardResponse> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.post<CreateTaskRewardResponse>(
      '/live/v4/channel/task-reward/create',
      params
    );
    return response as unknown as CreateTaskRewardResponse;
  }

  /**
   * Get task reward
   *
   * @param params - Query parameters
   * @returns Task reward
   */
  async taskRewardGet(params: GetTaskRewardParams): Promise<TaskReward> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<TaskReward>(
      '/live/v4/channel/task-reward/get',
      { params }
    );
    return response as unknown as TaskReward;
  }

  /**
   * Page task rewards
   *
   * @param params - Query parameters
   * @returns Task rewards list
   */
  async taskRewardPage(params: TaskRewardPageParams): Promise<{ contents: TaskReward[] }> {
    this.validateChannelId(params.channelId);
    this.validatePaginationParams(params);

    const response = await this.client.httpClient.get<{ contents: TaskReward[] }>(
      '/live/v4/channel/task-reward/page',
      { params }
    );
    return response as unknown as { contents: TaskReward[] };
  }

  /**
   * Update task reward
   *
   * @param params - Update parameters
   */
  async taskRewardUpdate(params: UpdateTaskRewardParams): Promise<void> {
    this.validateChannelId(params.channelId);

    await this.client.httpClient.post(
      '/live/v4/channel/task-reward/update',
      params
    );
  }

  /**
   * Delete task reward
   *
   * @param params - Delete parameters
   */
  async taskRewardDelete(params: DeleteTaskRewardParams): Promise<void> {
    this.validateChannelId(params.channelId);

    await this.client.httpClient.post(
      '/live/v4/channel/task-reward/delete',
      null,
      { params }
    );
  }

  /**
   * Stop task reward
   *
   * @param params - Stop parameters
   */
  async taskRewardStop(params: StopTaskRewardParams): Promise<void> {
    this.validateChannelId(params.channelId);

    await this.client.httpClient.post(
      '/live/v4/channel/task-reward/stop',
      null,
      { params }
    );
  }

  /**
   * Get task reward stats
   *
   * @param params - Query parameters
   * @returns Task reward stats
   */
  async taskRewardStats(params: GetTaskRewardStatsParams): Promise<TaskRewardStats> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<TaskRewardStats>(
      '/live/v4/channel/task-reward/stats',
      { params }
    );
    return response as unknown as TaskRewardStats;
  }

  /**
   * Submit accept info
   *
   * @param params - Submit parameters
   */
  async taskRewardSubmitAcceptInfo(params: SubmitAcceptInfoParams): Promise<void> {
    this.validateChannelId(params.channelId);

    await this.client.httpClient.post(
      '/live/v4/channel/task-reward/submit-accept-info',
      params
    );
  }

  /**
   * Get viewer detail
   *
   * @param params - Query parameters
   * @returns Viewer detail
   */
  async taskRewardViewerDetail(params: GetViewerDetailParams): Promise<TaskRewardViewerDetail> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<TaskRewardViewerDetail>(
      '/live/v4/channel/task-reward/viewer-detail',
      { params }
    );
    return response as unknown as TaskRewardViewerDetail;
  }

  /**
   * Get viewer union detail
   *
   * @param params - Query parameters
   * @returns Viewer union detail
   */
  async taskRewardViewerUnionDetail(params: GetViewerUnionDetailParams): Promise<TaskRewardViewerDetail> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<TaskRewardViewerDetail>(
      '/live/v4/channel/task-reward/viewer-union-detail',
      { params }
    );
    return response as unknown as TaskRewardViewerDetail;
  }

  // ============================================
  // AC12: Other APIs (15 APIs)
  // ============================================

  /**
   * Get subtitle
   *
   * @param params - Query parameters
   * @returns Subtitle info
   */
  async getSubtitle(params: GetSubtitleParams): Promise<SubtitleInfo> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<SubtitleInfo>(
      '/live/v4/channel/subtitle/get-subtitle',
      { params }
    );
    return response as unknown as SubtitleInfo;
  }

  /**
   * List all languages
   *
   * @returns Language list
   */
  async listAllLanguage(): Promise<LanguageInfo[]> {
    const response = await this.client.httpClient.get<LanguageInfo[]>(
      '/live/v4/channel/subtitle/list-all-language'
    );
    return response as unknown as LanguageInfo[];
  }

  /**
   * Update subtitle
   *
   * @param params - Update parameters
   */
  async updateSubtitle(params: UpdateSubtitleParams): Promise<void> {
    this.validateChannelId(params.channelId);

    await this.client.httpClient.post(
      '/live/v4/channel/subtitle/update-subtitle',
      params
    );
  }

  /**
   * Get config by role
   *
   * @param params - Query parameters
   * @returns Role config
   */
  async getByRole(params: GetByRoleParams): Promise<RoleConfig> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<RoleConfig>(
      '/live/v4/channel/role-config/get-by-role',
      { params }
    );
    return response as unknown as RoleConfig;
  }

  /**
   * Update config by role
   *
   * @param params - Update parameters
   */
  async updateByRole(params: UpdateByRoleParams): Promise<void> {
    this.validateChannelId(params.channelId);

    await this.client.httpClient.post(
      '/live/v4/channel/role-config/update-by-role',
      params
    );
  }

  /**
   * Viewer logout
   *
   * @param params - Logout parameters
   */
  async viewerLogout(params: ViewerLogoutParams): Promise<void> {
    this.validateChannelId(params.channelId);

    await this.client.httpClient.post(
      '/live/v4/channel/watch/viewer-logout',
      null,
      { params }
    );
  }

  /**
   * Get all live status list
   *
   * @returns Live status list
   */
  async getAllLiveStatusList(): Promise<LiveStatusItem[]> {
    const response = await this.client.httpClient.get<LiveStatusItem[]>(
      '/live/v4/channel/get-all-live-status-list'
    );
    return response as unknown as LiveStatusItem[];
  }

  /**
   * Monitor list stream info
   *
   * @param params - Query parameters
   * @returns Stream info list
   */
  async monitorListStreamInfo(params: { channelIds: string }): Promise<MonitorStreamInfo[]> {
    const response = await this.client.httpClient.get<MonitorStreamInfo[]>(
      '/live/v4/channel/monitor-list-stream-info',
      { params }
    );
    return response as unknown as MonitorStreamInfo[];
  }

  /**
   * Get live session
   *
   * @param params - Query parameters
   * @returns Live session info
   */
  async getLiveSession(params: GetLiveSessionParams): Promise<LiveSessionInfo> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<LiveSessionInfo>(
      '/live/v4/channel/viewdata/get-live-session',
      { params }
    );
    return response as unknown as LiveSessionInfo;
  }

  /**
   * Batch create popularization
   *
   * @param params - Creation parameters
   */
  async batchCreatePopularization(params: BatchCreatePopularizationParams): Promise<void> {
    this.validateChannelId(params.channelId);

    await this.client.httpClient.post(
      '/live/v4/channel/popularization/batch-create-popularization',
      params
    );
  }

  /**
   * List popularization
   *
   * @param params - Query parameters
   * @returns Popularization list
   */
  async popularizationList(params: PopularizationListParams): Promise<{ contents: PopularizationInfo[] }> {
    this.validateChannelId(params.channelId);
    this.validatePaginationParams(params);

    const response = await this.client.httpClient.get<{ contents: PopularizationInfo[] }>(
      '/live/v4/channel/popularization/popularization-list',
      { params }
    );
    return response as unknown as { contents: PopularizationInfo[] };
  }

  // ============================================
  // V4 Channel Core Exact API Paths
  // ============================================

  /**
   * Query playback settings for multiple channels.
   */
  async listPlaybackSettings(params: BatchPlaybackListParams): Promise<BatchPlaybackListResponse> {
    const channelIds = this.normalizeIdList(params.channelIds, 'channelIds', 100);

    const response = await this.client.httpClient.get<BatchPlaybackListResponse>(
      '/live/v4/channel/playback/list',
      { params: { channelIds } }
    );
    return response as unknown as BatchPlaybackListResponse;
  }

  /**
   * Query the external session ID bound to one channel session.
   */
  async getSessionExternalBySession(
    params: SessionExternalBySessionParams
  ): Promise<SessionExternalBySessionResponse> {
    this.validateChannelId(params.channelId);
    this.validateRequiredString(params.sessionId, 'sessionId');

    const response = await this.client.httpClient.get<SessionExternalBySessionResponse>(
      '/live/v4/channel/session/external-by-session',
      { params }
    );
    return response as unknown as SessionExternalBySessionResponse;
  }

  /**
   * Query channel lottery records.
   */
  async listChannelLotteryRecords(
    params: ChannelLotteryListParams
  ): Promise<ChannelLotteryListResponse> {
    this.validateChannelId(params.channelId);
    this.validateOptionalPaginationParams(params);

    const response = await this.client.httpClient.get<ChannelLotteryListResponse>(
      '/live/v4/channel/lottery/list',
      { params }
    );
    return response as unknown as ChannelLotteryListResponse;
  }

  /**
   * Query channel role-viewer settings.
   */
  async getAccountViewerConfig(params: GetAccountViewerParams): Promise<AccountViewerConfig> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<AccountViewerConfig>(
      '/live/v4/channel/account/viewer/get',
      { params }
    );
    return response as unknown as AccountViewerConfig;
  }

  /**
   * Query channel live data summary.
   */
  async getLiveData(params: LiveDataParams): Promise<LiveDataSummary> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<LiveDataSummary>(
      '/live/v4/channel/statistics/live-data',
      { params }
    );
    return response as unknown as LiveDataSummary;
  }

  /**
   * Query channel subtitle config.
   */
  async getSubtitleConfig(params: SubtitleConfigParams): Promise<SubtitleConfig> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<SubtitleConfig>(
      '/live/v4/channel/subtitle/config/get',
      { params }
    );
    return response as unknown as SubtitleConfig;
  }

  /**
   * Query live session statistics in a time range.
   */
  async listSessionStats(params: SessionStatsListParams = {}): Promise<SessionStatsListResponse> {
    this.validateOptionalPaginationParams(params);

    const response = await this.client.httpClient.post<SessionStatsListResponse>(
      '/live/v4/statistics/session-stats/list',
      null,
      { params }
    );
    return response as unknown as SessionStatsListResponse;
  }

  /**
   * List all realtime subtitle languages.
   */
  async listSubtitleLanguages(): Promise<SubtitleLanguageInfo[]> {
    const response = await this.client.httpClient.get<SubtitleLanguageInfo[]>(
      '/live/v4/channel/subtitle/language/list-all'
    );
    return response as unknown as SubtitleLanguageInfo[];
  }

  /**
   * Query all channels' basic information.
   */
  async listAllChannelBasic(
    params: ListAllChannelBasicParams = {}
  ): Promise<ListAllChannelBasicResponse> {
    this.validateOptionalPaginationParams(params);
    const queryParams = this.buildListChannelBasicParams(params);

    const response = await this.client.httpClient.get<ListAllChannelBasicResponse>(
      '/live/v4/channel/basic/list',
      { params: queryParams }
    );
    return response as unknown as ListAllChannelBasicResponse;
  }

  /**
   * Query all channels' compact information.
   */
  async listChannelSimple(params: ListAllChannelSimpleParams = {}): Promise<ListAllChannelSimpleResponse> {
    this.validateOptionalPaginationParams(params);

    const response = await this.client.httpClient.get<ListAllChannelSimpleResponse>(
      '/live/v4/channel/simple/list',
      { params }
    );
    return response as unknown as ListAllChannelSimpleResponse;
  }

  /**
   * Query WeChat booking records.
   */
  async listWeixinBookings(params: WeixinBookingListParams): Promise<WeixinBookingListResponse> {
    this.validateChannelId(params.channelId);
    this.validateOptionalPaginationParams(params);

    const response = await this.client.httpClient.get<WeixinBookingListResponse>(
      '/live/v4/channel/booking/list',
      { params }
    );
    return response as unknown as WeixinBookingListResponse;
  }

  /**
   * Query invite poster detail records.
   */
  async listInviteStats(params: InviteListParams): Promise<InviteListResponse> {
    this.validateChannelId(params.channelId);
    this.validateOptionalPaginationParams(params);

    const response = await this.client.httpClient.get<InviteListResponse>(
      '/live/v4/channel/invite/list',
      { params }
    );
    return response as unknown as InviteListResponse;
  }

  /**
   * Query cloud distribution statistics.
   */
  async getDistributeStatistic(
    params: DistributeStatisticExactParams
  ): Promise<DistributeStatisticExactResponse> {
    this.validateChannelId(params.channelId);
    if (params.sessionIds === undefined && (params.startTime === undefined || params.endTime === undefined)) {
      throw new PolyVValidationError(
        'sessionIds or startTime/endTime is required',
        'sessionIds'
      );
    }

    const queryParams: Record<string, unknown> = { ...params };
    if (params.sessionIds !== undefined) {
      queryParams.sessionIds = this.normalizeIdList(params.sessionIds, 'sessionIds');
    }

    const response = await this.client.httpClient.get<DistributeStatisticExactResponse>(
      '/live/v4/channel/distribute/get/statistic',
      { params: queryParams }
    );
    return response as unknown as DistributeStatisticExactResponse;
  }

  /**
   * Create and initialize a channel with settings.
   */
  async createInit(params: CreateInitChannelParams): Promise<CreateInitChannelResponse> {
    this.validateCreateInitParams(params);

    const response = await this.client.httpClient.post<CreateInitChannelResponse>(
      '/live/v4/channel/create-init',
      params
    );
    return response as unknown as CreateInitChannelResponse;
  }

  /**
   * Create an assistant or guest role account.
   */
  async createAccount(params: CreateAccountParams): Promise<ChannelRoleAccount> {
    this.validateChannelId(params.channelId);
    this.validateRequiredString(params.role, 'role');

    const { channelId, ...body } = params;
    const response = await this.client.httpClient.post<ChannelRoleAccount>(
      '/live/v4/channel/account/create',
      body,
      { params: { channelId } }
    );
    return response as unknown as ChannelRoleAccount;
  }

  /**
   * Create an MR channel.
   */
  async createMrChannel(params: CreateMrChannelExactParams): Promise<CreateMrChannelExactResponse> {
    this.validateChannelName(params.name);

    const response = await this.client.httpClient.post<CreateMrChannelExactResponse>(
      '/live/v4/channel/mr/create',
      params
    );
    return response as unknown as CreateMrChannelExactResponse;
  }

  /**
   * Query CDN realtime stream information for one channel.
   */
  async listMonitorStreamInfo(params: MonitorListStreamInfoParams): Promise<MonitorStreamInfoPoint[]> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<MonitorStreamInfoPoint[]>(
      '/live/v4/channel/monitor/list-stream-info',
      { params }
    );
    return response as unknown as MonitorStreamInfoPoint[];
  }

  /**
   * Batch query each channel's single playback video info.
   */
  async getPlaybackVideoInfo(
    params: BatchPlaybackVideoInfoParams
  ): Promise<PlaybackVideoInfoByChannel[]> {
    const channelIds = this.normalizeIdList(params.channelIds, 'channelIds');

    const response = await this.client.httpClient.get<PlaybackVideoInfoByChannel[]>(
      '/live/v4/channel/play-back/get',
      { params: { channelIds } }
    );
    return response as unknown as PlaybackVideoInfoByChannel[];
  }

  /**
   * Batch query live status for channels.
   */
  async listLiveStatus(params: LiveStatusListParams): Promise<ChannelLiveStatusItem[]> {
    const channelIds = this.normalizeIdList(params.channelIds, 'channelIds', 200);

    const response = await this.client.httpClient.get<ChannelLiveStatusItem[]>(
      '/live/v4/channel/live-status/list',
      { params: { channelIds } }
    );
    return response as unknown as ChannelLiveStatusItem[];
  }

  /**
   * Batch query teacher information.
   */
  async teacherList(params: TeacherListParams): Promise<TeacherInfo[]> {
    this.validateIdArray(params.channelIds, 'channelIds');

    const response = await this.client.httpClient.post<TeacherInfo[]>(
      '/live/v4/channel/account/teacher-list',
      { channelIds: params.channelIds }
    );
    return response as unknown as TeacherInfo[];
  }

  /**
   * Batch delete role accounts.
   */
  async deleteAccountsBatch(params: DeleteAccountsBatchParams): Promise<boolean> {
    this.validateChannelId(params.channelId);
    const accounts = this.normalizeIdList(params.accounts, 'accounts', 150);

    const response = await this.client.httpClient.post<boolean>(
      '/live/v4/channel/account/delete-batch',
      null,
      { params: { channelId: params.channelId, accounts } }
    );
    return response as unknown as boolean;
  }

  /**
   * Batch update playback subtitles for one channel.
   */
  async updateChannelSubtitleBatch(params: UpdateChannelSubtitleBatchParams): Promise<void> {
    this.validateChannelId(params.channelId);
    if (!Array.isArray(params.body) || params.body.length === 0) {
      throw new PolyVValidationError('body is required and cannot be empty', 'body');
    }
    params.body.forEach((item, index) => {
      if (!item.id || item.id <= 0) {
        throw new PolyVValidationError(`body[${index}].id must be a positive number`, `body[${index}].id`);
      }
    });

    await this.client.httpClient.post(
      '/live/v4/channel/subtitle/update-batch',
      params.body,
      { params: { channelId: params.channelId } }
    );
  }

  /**
   * Batch update channel skin.
   */
  async updateSkinBatch(params: UpdateSkinBatchParams): Promise<boolean> {
    const channelIds = this.normalizeIdList(params.channelIds, 'channelIds', 500);
    this.validateRequiredString(params.skin, 'skin');

    const response = await this.client.httpClient.post<boolean>(
      '/live/v4/channel/decorate/skin/update-batch',
      null,
      { params: { channelIds, skin: params.skin } }
    );
    return response as unknown as boolean;
  }

  /**
   * Update role-viewer settings.
   */
  async updateAccountViewerConfig(params: UpdateAccountViewerConfigParams): Promise<void> {
    this.validateChannelId(params.channelId);
    this.validateOptionalYn(params.actorEnabled, 'actorEnabled');
    this.validateOptionalYn(params.questionStudentTitleEnabled, 'questionStudentTitleEnabled');

    const { channelId, ...body } = params;
    await this.client.httpClient.post(
      '/live/v4/channel/account/viewer/update',
      body,
      { params: { channelId } }
    );
  }

  /**
   * Update role account information.
   */
  async updateAccountInfo(params: UpdateAccountInfoParams): Promise<ChannelRoleAccount> {
    this.validateChannelId(params.channelId);
    this.validateRequiredString(params.account, 'account');

    const { channelId, ...body } = params;
    const response = await this.client.httpClient.post<ChannelRoleAccount>(
      '/live/v4/channel/account/update',
      body,
      { params: { channelId } }
    );
    return response as unknown as ChannelRoleAccount;
  }

  /**
   * Set channel pull bitrate.
   */
  async setPullBitrate(params: SetPullBitrateExactParams): Promise<void> {
    this.validateChannelId(params.channelId);
    const allowedBitrates = [-1, 400, 600, 800, 1000, 1500, 2000, 2500];
    if (!allowedBitrates.includes(params.pullBitRate)) {
      throw new PolyVValidationError(
        'pullBitRate must be one of -1, 400, 600, 800, 1000, 1500, 2000, or 2500',
        'pullBitRate',
        params.pullBitRate
      );
    }

    await this.client.httpClient.post(
      '/live/v4/channel/set-pull-bitrate',
      null,
      { params }
    );
  }

  /**
   * Update channel live template.
   */
  async updateTemplate(params: UpdateTemplateExactParams): Promise<void> {
    this.validateChannelId(params.channelId);
    this.validateRequiredString(params.template, 'template');

    await this.client.httpClient.post(
      '/live/v4/channel/update-template',
      null,
      { params }
    );
  }

  /**
   * Update channel subtitle config.
   */
  async updateSubtitleConfig(params: UpdateSubtitleConfigParams): Promise<SubtitleConfig> {
    this.validateChannelId(params.channelId);
    this.validateOptionalYn(params.realTimeSubtitleEnabled, 'realTimeSubtitleEnabled');
    this.validateOptionalYn(params.realTimeSubtitleDisplayEnabled, 'realTimeSubtitleDisplayEnabled');
    this.validateOptionalYn(
      params.realTimeSubtitleDisplayNumberLimitEnabled,
      'realTimeSubtitleDisplayNumberLimitEnabled'
    );
    this.validateOptionalYn(params.subtitleTranslationEnabled, 'subtitleTranslationEnabled');
    this.validateOptionalYn(params.subtitleCallbackEnabled, 'subtitleCallbackEnabled');

    const response = await this.client.httpClient.post<SubtitleConfig>(
      '/live/v4/channel/subtitle/config/update',
      params
    );
    return response as unknown as SubtitleConfig;
  }

  /**
   * Start a scheduled lottery from an activity template.
   */
  async createConditionWaitLottery(
    params: CreateConditionWaitLotteryParams
  ): Promise<CreateConditionWaitLotteryResponse> {
    this.validateChannelId(params.channelId);
    this.validateRequiredId(params.id, 'id');
    this.validateRequiredNumber(params.lotteryTime, 'lotteryTime');

    const { channelId, ...body } = params;
    const response = await this.client.httpClient.post<CreateConditionWaitLotteryResponse>(
      '/live/v4/channel/condition-lottery/create-wait-lottery',
      body,
      { params: { channelId } }
    );
    return response as unknown as CreateConditionWaitLotteryResponse;
  }

  /**
   * List lottery activity statistic records.
   */
  async listLotteryActivityRecords(
    params: ListLotteryActivityRecordsParams
  ): Promise<ListLotteryActivityRecordsResponse> {
    this.validateChannelId(params.channelId);
    this.validateOptionalPaginationParams(params);

    const response = await this.client.httpClient.get<ListLotteryActivityRecordsResponse>(
      '/live/v4/channel/lottery/activity-record/list',
      { params }
    );
    return response as unknown as ListLotteryActivityRecordsResponse;
  }

  /**
   * Create a lottery viewer whitelist group.
   */
  async createLotteryViewerGroup(
    params: CreateLotteryViewerGroupParams
  ): Promise<CreateLotteryViewerGroupResponse> {
    this.validateChannelId(params.channelId);
    this.validateRequiredString(params.title, 'title');

    const { channelId, ...body } = params;
    const response = await this.client.httpClient.post<CreateLotteryViewerGroupResponse>(
      '/live/v4/channel/lottery-viewer-group/whitelist/create',
      body,
      { params: { channelId } }
    );
    return response as unknown as CreateLotteryViewerGroupResponse;
  }

  /**
   * List lottery viewer whitelist groups.
   */
  async listLotteryViewerGroups(
    params: ListLotteryViewerGroupsParams
  ): Promise<ListLotteryViewerGroupsResponse> {
    this.validateChannelId(params.channelId);
    this.validateOptionalPaginationParams(params);

    const response = await this.client.httpClient.get<ListLotteryViewerGroupsResponse>(
      '/live/v4/channel/lottery-viewer-group/whitelist/list',
      { params }
    );
    return response as unknown as ListLotteryViewerGroupsResponse;
  }

  /**
   * Update a lottery viewer whitelist group.
   */
  async updateLotteryViewerGroup(
    params: UpdateLotteryViewerGroupParams
  ): Promise<UpdateLotteryViewerGroupResponse> {
    this.validateChannelId(params.channelId);
    this.validateRequiredId(params.id, 'id');
    this.validateRequiredString(params.title, 'title');

    const { channelId, ...body } = params;
    const response = await this.client.httpClient.post<UpdateLotteryViewerGroupResponse>(
      '/live/v4/channel/lottery-viewer-group/whitelist/update',
      body,
      { params: { channelId } }
    );
    return response as unknown as UpdateLotteryViewerGroupResponse;
  }

  /**
   * Delete a lottery viewer whitelist group.
   */
  async deleteLotteryViewerGroup(params: DeleteLotteryViewerGroupParams): Promise<void> {
    this.validateChannelId(params.channelId);
    this.validateRequiredId(params.id, 'id');

    const { channelId, ...body } = params;
    await this.client.httpClient.post(
      '/live/v4/channel/lottery-viewer-group/whitelist/delete',
      body,
      { params: { channelId } }
    );
  }

  /**
   * Add viewers to a lottery viewer group.
   */
  async createLotteryGroupViewers(
    params: CreateLotteryGroupViewersParams
  ): Promise<CreateLotteryGroupViewersResponse> {
    this.validateChannelId(params.channelId);
    this.validateRequiredId(params.groupId, 'groupId');
    this.validateIdArray(params.viewerIds, 'viewerIds');

    const { channelId, ...body } = params;
    const response = await this.client.httpClient.post<CreateLotteryGroupViewersResponse>(
      '/live/v4/channel/lottery-viewer-list/create',
      body,
      { params: { channelId } }
    );
    return response as unknown as CreateLotteryGroupViewersResponse;
  }

  /**
   * Add viewer names to a lottery viewer group.
   */
  async createLotteryGroupViewerNames(
    params: CreateLotteryGroupViewerNamesParams
  ): Promise<CreateLotteryGroupViewerNamesResponse> {
    this.validateChannelId(params.channelId);
    this.validateRequiredId(params.groupId, 'groupId');
    this.validateNonEmptyArray(params.viewerNames, 'viewerNames');
    params.viewerNames.forEach((viewer, index) => {
      this.validateRequiredString(viewer.viewerId, `viewerNames[${index}].viewerId`);
    });

    const { channelId, ...body } = params;
    const response = await this.client.httpClient.post<CreateLotteryGroupViewerNamesResponse>(
      '/live/v4/channel/lottery-viewer-list/create-viewer-name',
      body,
      { params: { channelId } }
    );
    return response as unknown as CreateLotteryGroupViewerNamesResponse;
  }

  /**
   * Delete viewers from a lottery viewer group by relation IDs.
   */
  async deleteLotteryGroupViewers(params: DeleteLotteryGroupViewersParams): Promise<void> {
    this.validateChannelId(params.channelId);
    this.validateRequiredId(params.groupId, 'groupId');
    this.validateIdArray(params.ids, 'ids');

    const { channelId, ...body } = params;
    await this.client.httpClient.post(
      '/live/v4/channel/lottery-viewer-list/delete-batch',
      body,
      { params: { channelId } }
    );
  }

  /**
   * List viewers in a lottery viewer group.
   */
  async listLotteryGroupViewers(
    params: ListLotteryGroupViewersParams
  ): Promise<ListLotteryGroupViewersResponse> {
    this.validateChannelId(params.channelId);
    this.validateRequiredId(params.groupId, 'groupId');
    this.validateOptionalPaginationParams(params);

    const response = await this.client.httpClient.get<ListLotteryGroupViewersResponse>(
      '/live/v4/channel/lottery-viewer-list/list',
      { params }
    );
    return response as unknown as ListLotteryGroupViewersResponse;
  }

  /**
   * Add viewers to the lottery blacklist.
   */
  async createLotteryBlacklistViewers(
    params: CreateLotteryBlacklistViewersParams
  ): Promise<CreateLotteryBlacklistViewersResponse> {
    this.validateChannelId(params.channelId);
    this.validateIdArray(params.viewerIds, 'viewerIds');

    const { channelId, ...body } = params;
    const response = await this.client.httpClient.post<CreateLotteryBlacklistViewersResponse>(
      '/live/v4/channel/lottery-viewer-list/blacklist/create',
      body,
      { params: { channelId } }
    );
    return response as unknown as CreateLotteryBlacklistViewersResponse;
  }

  /**
   * Delete viewers from the lottery blacklist by relation IDs.
   */
  async deleteLotteryBlacklistViewers(params: DeleteLotteryBlacklistViewersParams): Promise<void> {
    this.validateChannelId(params.channelId);
    this.validateIdArray(params.ids, 'ids');

    const { channelId, ...body } = params;
    await this.client.httpClient.post(
      '/live/v4/channel/lottery-viewer-list/blacklist/delete-batch',
      body,
      { params: { channelId } }
    );
  }

  /**
   * List lottery blacklist viewers.
   */
  async listLotteryBlacklistViewers(
    params: ListLotteryBlacklistViewersParams
  ): Promise<ListLotteryBlacklistViewersResponse> {
    this.validateChannelId(params.channelId);
    this.validateOptionalPaginationParams(params);

    const response = await this.client.httpClient.get<ListLotteryBlacklistViewersResponse>(
      '/live/v4/channel/lottery-viewer-list/blacklist/list',
      { params }
    );
    return response as unknown as ListLotteryBlacklistViewersResponse;
  }

  /**
   * List lucky bag winners.
   */
  async listLuckyBagWinners(params: ListLuckyBagWinnersParams): Promise<ListLuckyBagWinnersResponse> {
    this.validateRequiredId(params.activityId, 'activityId');
    this.validateOptionalPaginationParams({
      pageNumber: params.currentPage,
      pageSize: params.pageSize,
    });

    const response = await this.client.httpClient.get<ListLuckyBagWinnersResponse>(
      '/live/v4/channel/lucky-bag/winner-page',
      { params }
    );
    return response as unknown as ListLuckyBagWinnersResponse;
  }

  /**
   * List active interaction event tasks.
   */
  async listInteractionEvents(params: ListInteractionEventsParams): Promise<ListInteractionEventsResponse> {
    this.validateRequiredString(params.roomId, 'roomId');

    const response = await this.client.httpClient.get<ListInteractionEventsResponse>(
      '/live/v5/chat/redirect/channel/interaction_event/list',
      { params }
    );
    return response as unknown as ListInteractionEventsResponse;
  }

  /**
   * Create an invite poster inviter.
   */
  async createInvitePoster(params: InvitePosterCreateParams): Promise<InvitePosterCreateResponse> {
    this.validateChannelId(params.channelId);
    this.validateRequiredString(params.openId, 'openId');
    this.validateRequiredString(params.nickname, 'nickname');

    const response = await this.client.httpClient.post<InvitePosterCreateResponse>(
      '/live/v4/channel/invite/poster/create',
      null,
      { params }
    );
    return response as unknown as InvitePosterCreateResponse;
  }

  /**
   * Upload a custom script file for a pseudo-live disk video.
   */
  async uploadDiskVideoCustomScript(
    params: UploadDiskVideoCustomScriptParams
  ): Promise<UploadDiskVideoCustomScriptResponse> {
    this.validateChannelId(params.channelId);
    this.validateRequiredString(params.diskVideoId, 'diskVideoId');
    if (!params.file) {
      throw new PolyVValidationError('file is required', 'file');
    }

    const formData = new FormData();
    formData.append('file', params.file);

    const queryParams: Record<string, unknown> = {
      channelId: params.channelId,
      diskVideoId: params.diskVideoId,
    };
    if (params.labelId !== undefined) {
      queryParams.labelId = params.labelId;
    }

    const response = await this.client.httpClient.post<UploadDiskVideoCustomScriptResponse>(
      '/live/v4/channel/interaction-script/upload-disk-video-custom-script',
      formData,
      {
        params: queryParams,
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response as unknown as UploadDiskVideoCustomScriptResponse;
  }

  /**
   * Query custom scripts for a pseudo-live disk video.
   */
  async queryDiskVideoCustomScript(
    params: QueryDiskVideoCustomScriptParams
  ): Promise<QueryDiskVideoCustomScriptResponse> {
    this.validateChannelId(params.channelId);
    this.validateRequiredString(params.diskVideoId, 'diskVideoId');

    const response = await this.client.httpClient.get<QueryDiskVideoCustomScriptResponse>(
      '/live/v4/channel/interaction-script/query-disk-video-custom-script',
      { params }
    );
    return response as unknown as QueryDiskVideoCustomScriptResponse;
  }

  /**
   * Delete an interaction script.
   */
  async deleteInteractionScript(params: DeleteInteractionScriptParams): Promise<void> {
    this.validateChannelId(params.channelId);
    this.validateRequiredId(params.id, 'id');

    await this.client.httpClient.post(
      '/live/v4/channel/interaction-script/delete',
      { channelId: params.channelId, id: params.id },
      { params: { channelId: params.channelId } }
    );
  }

  /**
   * List gift reward records.
   */
  async listRewardGifts(params: ListRewardGiftsParams): Promise<ListRewardGiftsResponse> {
    this.validateChannelId(params.channelId);
    this.validateRequiredNumber(params.start, 'start');
    this.validateRequiredNumber(params.end, 'end');
    this.validateOptionalPaginationParams(params);
    this.validateMaxPageSize(params.pageSize, 300);

    const response = await this.client.httpClient.get<ListRewardGiftsResponse>(
      '/live/v4/channel/reward/gift-list',
      { params }
    );
    return response as unknown as ListRewardGiftsResponse;
  }

  /**
   * List like reward records.
   */
  async listRewardLikes(params: ListRewardLikesParams): Promise<ListRewardLikesResponse> {
    this.validateChannelId(params.channelId);
    this.validateOptionalPaginationParams(params);
    this.validateMaxPageSize(params.pageSize, 300);

    const response = await this.client.httpClient.get<ListRewardLikesResponse>(
      '/live/v4/channel/reward/like-list',
      { params }
    );
    return response as unknown as ListRewardLikesResponse;
  }

  /**
   * Create a task reward activity.
   */
  async createTaskRewardActivity(
    params: CreateTaskRewardActivityParams
  ): Promise<CreateTaskRewardActivityResponse> {
    this.validateTaskRewardActivityBody(params, true);

    const response = await this.client.httpClient.post<CreateTaskRewardActivityResponse>(
      '/live/v4/channel/task-reward-activity/save',
      params
    );
    return response as unknown as CreateTaskRewardActivityResponse;
  }

  /**
   * List task reward activities.
   */
  async listTaskRewardActivities(
    params: ListTaskRewardActivitiesParams
  ): Promise<ListTaskRewardActivitiesResponse> {
    this.validateChannelId(params.channelId);
    this.validateOptionalPaginationParams(params);

    const response = await this.client.httpClient.get<ListTaskRewardActivitiesResponse>(
      '/live/v4/channel/task-reward-activity/page',
      { params }
    );
    return response as unknown as ListTaskRewardActivitiesResponse;
  }

  /**
   * List task reward activity statistics.
   */
  async listTaskRewardStats(params: ListTaskRewardStatsParams): Promise<ListTaskRewardStatsResponse> {
    this.validateChannelId(params.channelId);
    this.validateOptionalPaginationParams(params);

    const response = await this.client.httpClient.get<ListTaskRewardStatsResponse>(
      '/live/v4/channel/task-reward-activity/stats',
      { params }
    );
    return response as unknown as ListTaskRewardStatsResponse;
  }

  /**
   * List viewer reward details for a task reward activity.
   */
  async listTaskRewardViewerDetails(
    params: ListTaskRewardViewerDetailsParams
  ): Promise<ListTaskRewardViewerDetailsResponse> {
    this.validateChannelId(params.channelId);
    this.validateRequiredId(params.activityId, 'activityId');
    this.validateOptionalPaginationParams(params);

    const response = await this.client.httpClient.get<ListTaskRewardViewerDetailsResponse>(
      '/live/v4/channel/task-reward-activity/viewer-detail',
      { params }
    );
    return response as unknown as ListTaskRewardViewerDetailsResponse;
  }

  /**
   * Update a task reward activity.
   */
  async updateTaskRewardActivity(params: UpdateTaskRewardActivityParams): Promise<void> {
    this.validateTaskRewardActivityBody(params, false);
    this.validateRequiredId(params.activityId, 'activityId');

    await this.client.httpClient.post(
      '/live/v4/channel/task-reward-activity/update',
      params
    );
  }

  /**
   * Delete a task reward activity.
   */
  async deleteTaskRewardActivity(params: DeleteTaskRewardActivityParams): Promise<void> {
    this.validateRequiredId(params.activityId, 'activityId');

    await this.client.httpClient.get(
      '/live/v4/channel/task-reward-activity/delete',
      { params }
    );
  }

  /**
   * Stop a task reward activity.
   */
  async stopTaskRewardActivity(params: StopTaskRewardActivityParams): Promise<void> {
    this.validateRequiredId(params.activityId, 'activityId');

    await this.client.httpClient.get(
      '/live/v4/channel/task-reward-activity/stop',
      { params }
    );
  }

  /**
   * List reward details from the viewer side.
   */
  async listViewerTaskRewardDetails(
    params: ListViewerTaskRewardDetailsParams
  ): Promise<ListViewerTaskRewardDetailsResponse> {
    this.validateRequiredString(params.viewerId, 'viewerId');
    this.validateOptionalPaginationParams(params);

    const response = await this.client.httpClient.get<ListViewerTaskRewardDetailsResponse>(
      '/live/v4/user/viewer-task-reward/page',
      { params }
    );
    return response as unknown as ListViewerTaskRewardDetailsResponse;
  }

  /**
   * Submit viewer accept information for a task reward.
   */
  async submitViewerTaskRewardAcceptInfo(params: SubmitViewerTaskRewardAcceptInfoParams): Promise<void> {
    this.validateRequiredId(params.id, 'id');
    this.validateRequiredString(params.viewerId, 'viewerId');
    this.validateNonEmptyArray(params.formInfo, 'formInfo');

    await this.client.httpClient.post(
      '/live/v4/user/viewer-task-reward/submit-accept-info',
      params
    );
  }

  /**
   * Update channel gift donate settings.
   */
  async updateDonateGift(params: UpdateDonateGiftParams): Promise<DonateSettings> {
    this.validateChannelId(params.channelId);
    this.validateRequiredString(params.donateGiftEnabled, 'donateGiftEnabled');
    this.validateOptionalYn(params.donateGiftEnabled, 'donateGiftEnabled');

    const { channelId, ...body } = params;
    const response = await this.client.httpClient.post<DonateSettings>(
      '/live/v4/channel/donate/gift/update',
      body,
      { params: { channelId } }
    );
    return response as unknown as DonateSettings;
  }

  // ============================================
  // V4 Channel Marketing & Content Exact API Paths
  // ============================================

  /**
   * List channel card pushes.
   */
  async listCardPushes(params: ListCardPushesParams): Promise<ListCardPushesResponse> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<ListCardPushesResponse>(
      '/live/v4/channel/card-push/list',
      { params }
    );
    return response as unknown as ListCardPushesResponse;
  }

  /**
   * Query channel coupon switch.
   */
  async getCouponEnabled(params: CouponEnabledParams): Promise<CouponEnabled> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<CouponEnabled>(
      '/live/v4/channel/coupon/get-enabled',
      { params }
    );
    return response as unknown as CouponEnabled;
  }

  /**
   * Update channel coupon switch.
   */
  async updateCouponEnabled(params: UpdateCouponEnabledParams): Promise<void> {
    this.validateChannelId(params.channelId);
    this.validateRequiredString(params.enabled, 'enabled');
    this.validateOptionalYn(params.enabled, 'enabled');

    const { channelId, ...body } = params;
    await this.client.httpClient.post(
      '/live/v4/channel/coupon/update-enabled',
      body,
      { params: { channelId } }
    );
  }

  /**
   * List channel coupons.
   */
  async listChannelCoupons(params: ListChannelCouponsParams): Promise<ListChannelCouponsResponse> {
    this.validateChannelId(params.channelId);
    this.validateOptionalPaginationParams(params);

    const response = await this.client.httpClient.get<ListChannelCouponsResponse>(
      '/live/v4/channel/coupon/list',
      { params }
    );
    return response as unknown as ListChannelCouponsResponse;
  }

  /**
   * Delete channel coupons.
   */
  async deleteChannelCoupons(params: DeleteChannelCouponsParams): Promise<void> {
    this.validateChannelId(params.channelId);
    this.validateIdArray(params.couponIds, 'couponIds', 30);

    await this.client.httpClient.post(
      '/live/v4/channel/coupon/delete',
      params
    );
  }

  /**
   * Query channel product push rule.
   */
  async getProductPushRule(params: ProductPushRuleParams): Promise<ProductPushRule> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<ProductPushRule>(
      '/live/v4/channel/product/push/rule',
      { params }
    );
    return response as unknown as ProductPushRule;
  }

  /**
   * Update channel product push rule.
   */
  async updateProductPushRule(params: UpdateProductPushRuleParams): Promise<void> {
    this.validateChannelId(params.channelId);
    this.validateProductPushRuleParams(params);

    const { channelId, ...body } = params;
    await this.client.httpClient.post(
      '/live/v4/channel/product/push/rule',
      body,
      { params: { channelId } }
    );
  }


  /**
   * List channel product statistics.
   */
  async listProductStats(params: ListProductStatsParams): Promise<ListProductStatsResponse> {
    this.validateChannelId(params.channelId);
    this.validateOptionalPaginationParams(params);
    this.validateMaxPageSize(params.pageSize, 300);

    const response = await this.client.httpClient.get<ListProductStatsResponse>(
      '/live/v4/channel/product/stats/page',
      { params }
    );
    return response as unknown as ListProductStatsResponse;
  }

  /**
   * Query channel product statistics summary.
   */
  async getProductStatsSummary(params: ProductStatsSummaryParams): Promise<ProductStatsSummary> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<ProductStatsSummary>(
      '/live/v4/channel/product/stats/summary',
      { params }
    );
    return response as unknown as ProductStatsSummary;
  }

  /**
   * Update a channel product rank.
   */
  async sortChannelProductRank(params: SortChannelProductRankParams): Promise<void> {
    this.validateChannelId(params.channelId);
    this.validateRequiredId(params.productId, 'productId');
    this.validateRequiredNumber(params.rank, 'rank');
    if (params.rank <= 0) {
      throw new PolyVValidationError('rank must be greater than 0', 'rank', params.rank);
    }

    await this.client.httpClient.post(
      '/live/v4/channel/product/sort-rank',
      null,
      { params }
    );
  }

  /**
   * Pin a channel product.
   */
  async toppingChannelProduct(params: ChannelProductActionParams): Promise<void> {
    this.validateChannelProductActionParams(params);

    const { channelId, ...body } = params;
    await this.client.httpClient.post(
      '/live/v4/channel/product/topping',
      body,
      { params: { channelId } }
    );
  }

  /**
   * Unpin a channel product.
   */
  async untoppingChannelProduct(params: ChannelProductActionParams): Promise<void> {
    this.validateChannelProductActionParams(params);

    const { channelId, ...body } = params;
    await this.client.httpClient.post(
      '/live/v4/channel/product/un-topping',
      body,
      { params: { channelId } }
    );
  }

  /**
   * Batch create channel popularization entries.
   */
  async createPopularizations(
    params: BatchCreatePopularizationsExactParams
  ): Promise<BatchCreatePopularizationsExactResponse> {
    this.validateChannelId(params.channelId);
    this.validateNonEmptyArray(params.names, 'names');
    if (params.names.length > 500) {
      throw new PolyVValidationError('names cannot contain more than 500 items', 'names', params.names);
    }
    params.names.forEach((name, index) => {
      this.validateRequiredString(name, `names[${index}]`);
      if (name.length > 20) {
        throw new PolyVValidationError(`names[${index}] cannot exceed 20 characters`, `names[${index}]`, name);
      }
    });

    const response = await this.client.httpClient.post<BatchCreatePopularizationsExactResponse>(
      '/live/v4/channel/popularization/create-batch',
      params
    );
    return response as unknown as BatchCreatePopularizationsExactResponse;
  }

  /**
   * List channel popularization entries.
   */
  async listPopularizations(params: ListPopularizationsExactParams): Promise<ListPopularizationsExactResponse> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<ListPopularizationsExactResponse>(
      '/live/v4/channel/popularization/list',
      { params }
    );
    return response as unknown as ListPopularizationsExactResponse;
  }

  /**
   * List material-library record files for a channel.
   */
  async listMaterialRecordFiles(params: ListMaterialRecordFilesParams): Promise<ListMaterialRecordFilesResponse> {
    this.validateChannelId(params.channelId);
    this.validateOptionalPaginationParams(params);

    const response = await this.client.httpClient.get<ListMaterialRecordFilesResponse>(
      '/live/v4/channel/record-file/m-list',
      { params }
    );
    return response as unknown as ListMaterialRecordFilesResponse;
  }

  /**
   * Create an outline for a temporary record file.
   */
  async createRecordFileOutline(params: CreateRecordFileOutlineParams): Promise<RecordFileOutline> {
    this.validateRequiredString(params.fileId, 'fileId');
    this.validateOptionalYn(params.aiKnowledgeQuizEnabled, 'aiKnowledgeQuizEnabled');
    this.validateOptionalYn(params.aiSummaryAuditEnabled, 'aiSummaryAuditEnabled');
    this.validateOptionalYn(params.syncToPlaybackDotEnabled, 'syncToPlaybackDotEnabled');

    const response = await this.client.httpClient.post<RecordFileOutline>(
      '/live/v4/channel/record-file/subtitle/outline/create',
      null,
      { params }
    );
    return response as unknown as RecordFileOutline;
  }

  /**
   * Query an outline by temporary record file ID.
   */
  async getRecordFileOutline(params: GetRecordFileOutlineParams): Promise<RecordFileOutline> {
    this.validateChannelId(params.channelId);
    this.validateRequiredString(params.fileId, 'fileId');

    const response = await this.client.httpClient.get<RecordFileOutline>(
      '/live/v4/channel/record-file/subtitle/outline/get-by-fileId',
      { params }
    );
    return response as unknown as RecordFileOutline;
  }

  /**
   * Batch publish temporary record-file subtitles.
   */
  async batchPublishRecordFileSubtitles(params: BatchPublishRecordFileSubtitlesParams): Promise<void> {
    this.validateNonEmptyArray(params.subtitles, 'subtitles');
    params.subtitles.forEach((subtitle, index) => {
      this.validateRequiredId(subtitle.id, `subtitles[${index}].id`);
      this.validateRequiredString(subtitle.status, `subtitles[${index}].status`);
    });

    await this.client.httpClient.post(
      '/live/v4/channel/record-file/subtitle/batch-publish',
      null,
      { params }
    );
  }

  /**
   * Log out a viewer from the channel watch page.
   */
  async logoutWatchViewer(params: WatchViewerLogoutParams): Promise<void> {
    this.validateChannelId(params.channelId);

    const { channelId, ...body } = params;
    await this.client.httpClient.post(
      '/live/v4/channel/watch/viewer/logout',
      Object.keys(body).length > 0 ? body : null,
      { params: { channelId } }
    );
  }

  /**
   * Batch update channel chat speaking switch.
   */
  async batchUpdateChatEnabled(params: BatchUpdateChatEnabledParams): Promise<void> {
    this.validateIdArray(params.channelIds, 'channelIds');
    this.validateRequiredString(params.chatEnabled, 'chatEnabled');
    this.validateOptionalYn(params.chatEnabled, 'chatEnabled');

    await this.client.httpClient.post(
      '/live/v4/channel/chat/update-chatEnabled',
      params
    );
  }

  // ============================================
  // Private Validation Helpers
  // ============================================

  private validateRequiredString(value: string | undefined, field: string): void {
    if (!value || value.trim() === '') {
      throw new PolyVValidationError(`${field} is required and cannot be empty`, field);
    }
  }

  private validateOptionalYn(value: string | undefined, field: string): void {
    if (value !== undefined && value !== 'Y' && value !== 'N') {
      throw new PolyVValidationError(`${field} must be Y or N`, field, value);
    }
  }

  private validateRequiredId(value: string | number | undefined, field: string): void {
    if (typeof value === 'string') {
      this.validateRequiredString(value, field);
      return;
    }
    if (typeof value === 'number') {
      if (!Number.isFinite(value) || value <= 0) {
        throw new PolyVValidationError(`${field} must be a positive number`, field, value);
      }
      return;
    }
    throw new PolyVValidationError(`${field} is required`, field);
  }

  private validateRequiredNumber(value: number | undefined, field: string): void {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new PolyVValidationError(`${field} is required and must be a number`, field, value);
    }
  }

  private validateNonEmptyArray<T>(values: T[] | undefined, field: string): void {
    if (!Array.isArray(values) || values.length === 0) {
      throw new PolyVValidationError(`${field} is required and cannot be empty`, field);
    }
  }

  private validateMaxPageSize(pageSize: number | undefined, maxPageSize: number): void {
    if (pageSize !== undefined && pageSize > maxPageSize) {
      throw new PolyVValidationError(
        `pageSize must be between 1 and ${maxPageSize}`,
        'pageSize',
        pageSize
      );
    }
  }

  private validateLotteryActivityBody(params: CreateLotteryActivityParams): void {
    this.validateChannelId(params.channelId);
    this.validateRequiredString(params.activityName, 'activityName');
    this.validateRequiredString(params.lotteryCondition, 'lotteryCondition');
    this.validateRequiredNumber(params.amount, 'amount');
    if (params.amount < 1) {
      throw new PolyVValidationError('amount must be >= 1', 'amount', params.amount);
    }
    this.validateRequiredString(params.prizeName, 'prizeName');

    this.validateOptionalYn(params.hiddenWinnerAmount, 'hiddenWinnerAmount');
    this.validateOptionalYn(params.hiddenAttendeeNumber, 'hiddenAttendeeNumber');
    this.validateOptionalYn(params.repeatWinEnabled, 'repeatWinEnabled');
    this.validateOptionalYn(params.receiveEnabled, 'receiveEnabled');
    this.validateOptionalYn(params.lotteryOnlineEnabled, 'lotteryOnlineEnabled');
    this.validateOptionalYn(params.showWinnerCode, 'showWinnerCode');
    this.validateOptionalYn(params.showWinners, 'showWinners');
  }

  private validateTaskRewardActivityBody(
    params: CreateTaskRewardActivityParams | UpdateTaskRewardActivityParams,
    requireSchedule: boolean
  ): void {
    this.validateChannelId(params.channelId);
    this.validateNonEmptyArray(params.tasks, 'tasks');

    params.tasks.forEach((task, index) => {
      if (!task.reachCondition) {
        throw new PolyVValidationError(`tasks[${index}].reachCondition is required`, `tasks[${index}].reachCondition`);
      }
      this.validateRequiredString(task.reachCondition.type, `tasks[${index}].reachCondition.type`);
      this.validateRequiredNumber(task.reachCondition.amount, `tasks[${index}].reachCondition.amount`);
      if (!task.rewardSetting) {
        throw new PolyVValidationError(`tasks[${index}].rewardSetting is required`, `tasks[${index}].rewardSetting`);
      }
      this.validateRequiredString(task.rewardSetting.type, `tasks[${index}].rewardSetting.type`);
    });

    if (requireSchedule) {
      const createParams = params as CreateTaskRewardActivityParams;
      this.validateRequiredString(createParams.activityName, 'activityName');
      this.validateRequiredNumber(createParams.taskRule, 'taskRule');
      this.validateRequiredNumber(createParams.startTime, 'startTime');
      this.validateRequiredNumber(createParams.endTime, 'endTime');
    }

    if (params.startTime !== undefined && params.endTime !== undefined && params.endTime <= params.startTime) {
      throw new PolyVValidationError('endTime must be greater than startTime', 'endTime', params.endTime);
    }
  }

  private validateCardPushCreateParams(params: CreateCardPushParams): void {
    this.validateChannelId(params.channelId);
    this.validateRequiredString(params.imageType, 'imageType');
    this.validateRequiredString(params.title, 'title');
    if (params.title.length > 16) {
      throw new PolyVValidationError('title cannot exceed 16 characters', 'title', params.title);
    }
    this.validateRequiredString(params.link, 'link');
    this.validateRequiredNumber(params.duration, 'duration');
    this.validateRequiredString(params.showCondition, 'showCondition');
    this.validateCardPushOptionalParams(params);
  }

  private validateCardPushIdParams(params: CardPushIdParams): void {
    this.validateChannelId(params.channelId);
    this.validateRequiredId(params.cardPushId, 'cardPushId');
  }

  private validateCardPushOptionalParams(params: Partial<CreateCardPushParams>): void {
    this.validateOptionalYn(params.enterEnabled, 'enterEnabled');
    this.validateOptionalYn(params.linkEnabled, 'linkEnabled');
    if (params.countdownMsg !== undefined && params.countdownMsg.length > 8) {
      throw new PolyVValidationError('countdownMsg cannot exceed 8 characters', 'countdownMsg', params.countdownMsg);
    }
    if (params.duration !== undefined && ![0, 5, 10, 20, 30].includes(params.duration)) {
      throw new PolyVValidationError('duration must be one of 0, 5, 10, 20, or 30', 'duration', params.duration);
    }
  }

  private validateProductPushRuleParams(params: UpdateProductPushRuleParams): void {
    this.validateOptionalYn(params.productExplainEnabled, 'productExplainEnabled');
    this.validateOptionalYn(params.productExplainingAutoPushAndSticky, 'productExplainingAutoPushAndSticky');
    this.validateOptionalYn(params.productHotEffectEnabled, 'productHotEffectEnabled');
    this.validateOptionalYn(params.outLinkProductRedirectEnabled, 'outLinkProductRedirectEnabled');
  }

  private validateChannelProductActionParams(params: ChannelProductActionParams): void {
    this.validateChannelId(params.channelId);
    this.validateRequiredId(params.productId, 'productId');
  }

  private normalizeIdList(
    values: ChannelIdListInput,
    field: string,
    maxLength?: number
  ): string {
    if (Array.isArray(values)) {
      this.validateIdArray(values, field, maxLength);
      return values.map((value) => String(value).trim()).join(',');
    }

    this.validateRequiredString(values, field);
    const normalized = values
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    if (normalized.length === 0) {
      throw new PolyVValidationError(`${field} is required and cannot be empty`, field);
    }
    if (maxLength !== undefined && normalized.length > maxLength) {
      throw new PolyVValidationError(`${field} cannot contain more than ${maxLength} items`, field, values);
    }

    return normalized.join(',');
  }

  private validateIdArray(
    values: Array<string | number>,
    field: string,
    maxLength?: number
  ): void {
    if (!Array.isArray(values) || values.length === 0) {
      throw new PolyVValidationError(`${field} is required and cannot be empty`, field);
    }
    if (maxLength !== undefined && values.length > maxLength) {
      throw new PolyVValidationError(`${field} cannot contain more than ${maxLength} items`, field, values);
    }

    values.forEach((value, index) => {
      if (value === undefined || value === null || String(value).trim() === '') {
        throw new PolyVValidationError(`${field}[${index}] is required`, `${field}[${index}]`);
      }
    });
  }

  private validateCreateInitParams(params: CreateInitChannelParams): void {
    if (!params.basicSetting) {
      throw new PolyVValidationError('basicSetting is required', 'basicSetting');
    }

    this.validateChannelName(params.basicSetting.name, 'basicSetting.name');
    this.validateRequiredString(params.basicSetting.newScene, 'basicSetting.newScene');
    this.validateRequiredString(params.basicSetting.template, 'basicSetting.template');

    if (params.roles && params.roles.length > 10) {
      throw new PolyVValidationError('roles cannot contain more than 10 items', 'roles', params.roles);
    }
    params.roles?.forEach((role, index) => {
      this.validateRequiredString(role.role, `roles[${index}].role`);
    });
  }

  private buildListChannelBasicParams(params: ListAllChannelBasicParams): Record<string, unknown> {
    const queryParams: Record<string, unknown> = { ...params };

    if (params.categoryIds !== undefined) {
      queryParams.categoryIds = Array.isArray(params.categoryIds)
        ? this.normalizeIdList(params.categoryIds, 'categoryIds', 200)
        : this.normalizeIdList(params.categoryIds, 'categoryIds', 200);
    }
    if (params.channelIds !== undefined) {
      queryParams.channelIds = this.normalizeIdList(params.channelIds, 'channelIds');
    }

    return queryParams;
  }

  /**
   * Validate channel ID
   */
  private validateChannelId(channelId: string | number): void {
    if (typeof channelId === 'string') {
      if (!channelId || channelId.trim() === '') {
        throw new PolyVValidationError('channelId is required and cannot be empty', 'channelId');
      }
    } else if (typeof channelId === 'number') {
      if (!channelId || channelId <= 0) {
        throw new PolyVValidationError('channelId is required and must be a positive number', 'channelId');
      }
    } else {
      throw new PolyVValidationError('channelId must be a string or number', 'channelId');
    }
  }

  // ============================================
  // Channel Coupon Association
  // ============================================

  /**
   * Add platform coupons to a channel
   *
   * Associates existing platform coupons with a specific channel.
   * Invalid or already-added coupon IDs are silently ignored.
   * If all coupon IDs are invalid, the request will fail.
   *
   * @param params - Parameters including channelId and couponIds
   * @returns true if the operation was successful
   * @throws PolyVValidationError if required parameters are missing
   *
   * @example
   * ```typescript
   * await v4Channel.addChannelCoupon({
   *   channelId: '3151318',
   *   couponIds: ['caqfi6rqutunvofor5jrqbinswh14p2g'],
   * });
   * ```
   */
  async addChannelCoupon(params: AddChannelCouponParams): Promise<boolean> {
    if (!params.channelId || String(params.channelId).trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!Array.isArray(params.couponIds) || params.couponIds.length === 0) {
      throw new PolyVValidationError('couponIds must be a non-empty array', 'couponIds');
    }
    if (params.couponIds.length > 30) {
      throw new PolyVValidationError('couponIds must contain at most 30 items', 'couponIds');
    }

    const response = await this.client.httpClient.post<boolean>(
      '/live/v4/channel/coupon/create',
      params
    );

    return response as unknown as boolean;
  }

  /**
   * Validate channel name
   */
  private validateChannelName(name: string, fieldName = 'name'): void {
    if (!name || name.trim() === '') {
      throw new PolyVValidationError(`${fieldName} is required and cannot be empty`, fieldName);
    }
    if (name.length > 100) {
      throw new PolyVValidationError(`${fieldName} cannot exceed 100 characters`, fieldName, name);
    }
  }

  /**
   * Validate pagination parameters
   */
  private validatePaginationParams(params: V4PaginationParams): void {
    if (params.pageNumber === undefined || params.pageNumber === null || params.pageNumber < 1) {
      throw new PolyVValidationError('pageNumber must be >= 1', 'pageNumber', params.pageNumber);
    }
    if (params.pageSize === undefined || params.pageSize === null || params.pageSize < 1 || params.pageSize > 1000) {
      throw new PolyVValidationError('pageSize must be between 1 and 1000', 'pageSize', params.pageSize);
    }
  }

  private validateOptionalPaginationParams(params: V4PaginationParams): void {
    const pageNumber = params.pageNumber ?? params.page;
    if (pageNumber !== undefined && pageNumber < 1) {
      throw new PolyVValidationError('pageNumber must be >= 1', 'pageNumber', pageNumber);
    }
    if (params.pageSize !== undefined && (params.pageSize < 1 || params.pageSize > 1000)) {
      throw new PolyVValidationError('pageSize must be between 1 and 1000', 'pageSize', params.pageSize);
    }
  }
}
