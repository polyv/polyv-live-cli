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
  ListCardPushesParams,
  ListCardPushesResponse,
  CreateCardPushParams,
  CreateCardPushResponse,
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
    if (params.channels.length > 100) {
      throw new PolyVValidationError('channels cannot contain more than 100 items');
    }

    // Validate each channel name
    for (let i = 0; i < params.channels.length; i++) {
      this.validateChannelName(params.channels[i].name, `channels[${i}].name`);
    }

    const response = await this.client.httpClient.post<BatchCreateChannelsResponse>(
      '/live/v4/channel/create-batch',
      params
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

    await this.client.httpClient.post(
      '/live/v4/channel/update',
      null,
      { params }
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
   * Update card push
   *
   * @param params - Update parameters
   */
  async cardPushUpdate(params: UpdateCardPushParams): Promise<void> {
    this.validateCardPushIdParams(params);
    this.validateCardPushOptionalParams(params);

    const { channelId, cardPushId, ...body } = params;

    await this.client.httpClient.post(
      '/live/v4/channel/card-push/update',
      body,
      { params: { channelId, cardPushId } }
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
  // V4 Channel Marketing & Content API Paths
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

  private validateLotteryActivityBody(params: CreateLotteryActivityParams | UpdateLotteryActivityParams): void {
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

  private validateCardPushIdParams(
    params: UpdateCardPushParams | DeleteCardPushParams | PushCardParams | CancelCardPushParams
  ): void {
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
