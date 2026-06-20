/**
 * Channel Service
 *
 * Service for managing PolyV Live channels.
 * Provides CRUD operations for channels including create, read, update, and delete.
 *
 * @module services/channel
 */

import type { PolyVClient } from '../client.js';
import type {
  ChannelModel,
  ChannelDetail,
  YNFlag,
  CreateChannelRequest,
  CreateChannelV4Request,
  CreateChannelV4Response,
  UpdateChannelRequest,
  UpdateWatchConditionRequest,
  ChannelApiTokenResponse,
  GetChannelApiTokenRequest,
  GetTestModeTokenRequest,
  GetDocListRequest,
  DocListResponse,
  UploadDocRequest,
  UploadDocResponse,
  DocConvertStatusItem,
  MultimediaResourceVidListResponse,
  MultimediaResourceDetailResponse,
  PaginationParams,
  UserMultimediaResourceResponse,
  DocType,
  PlaybackListResponse,
  PlaybackListRequest,
  ChannelSessionsResponse,
  ChannelSessionsRequest,
  RecordInfoResponse,
  RecordInfoRequest,
  RecordFile,
  PlaybackSettingResponse,
  SetPlaybackSortRequest,
  SetPlaybackSingleSortRequest,
  UpdatePlaybackTitleRequest,
  AddVodPlaybackRequest,
  ClipRecordFileRequest,
  RecordAddBreakpointRequest,
  ListChannelSessionsParams,
  ListRecordFilesParams,
  ListRecordFilesResponse,
  MergeRecordFilesParams,
  MergeRecordFilesResponse,
  AddVodPlaybackToLibraryParams,
  AddVodPlaybackToLibraryResponse,
  DeleteRecordFileParams,
  ConvertRecordFileToVodParams,
  ConvertRecordFileToVodResponse,
  SetUserPlaybackEnabledParams,
  SetUserPlaybackEnabledResponse,
  MovePlaybackVideoParams,
  SetDefaultPlaybackVideoParams,
  SortPlaybackVideosParams,
  PlayerLogoSettings,
  PlayerHeadSettings,
  PlayerStopSettings,
  GetProductClickStatsRequest,
  GetProductClickStatsResponse,
  GetProductListStatsRequest,
  GetProductListStatsResponse,
  GetRedpackStatsRequest,
  GetRedpackStatsResponse,
  ChannelSummaryItem,
  DailySummaryItem,
  ChannelPlaySummaryItem,
  ConcurrencyDataItem,
  RealtimeViewerDataItem,
  RealtimeViewerV1Item,
  SessionStatsResponse,
  GetViewlogPageResponse,
  UserViewlogItem,
  GetUserViewlogResponse,
  GetMicDetailListResponse,
  GetLinkMicDetailListResponse,
  ChannelStatisticData,
  RealviewersDataItem,
  ViewlogV2Item,
  GetViewlogPageV3Response,
  // Story 2-6 Types
  SetDiyUrlMarqueeRequest,
  GetSessionDataListRequest,
  GetSessionDataListResponse,
  ExportSessionStatsRequest,
  GetSessionByExternalRequest,
  GetSessionByExternalResponse,
  ListFileIdByExternalRequest,
  FileIdByExternalItem,
  RelevanceSessionRequest,
  LiveStatus,
  LiveStatusItem,
  GetStreamInfoResponse,
  GetStreamsItem,
  ListDiskVideoRequest,
  ListDiskVideoResponse,
  SetStatusRequest,
  BanPushRequest,
  EndDiskPushRequest,
  UpdateWarmupSwitchRequest,
  UpdateWarmupImageRequest,
  UpdateWarmupVideoRequest,
  ChannelAdvert,
  ChannelProductEnabledResponse,
  PptRecordSettingResponse,
  ListPptRecordTasksParams,
  ListPptRecordTasksResponse,
  GetTransmitAssociationsParams,
  TransmitAssociation,
  GetUserChildrenChannelsParams,
  GetUserChildrenChannelsResponse,
  ListChannelsFollowParams,
  ListChannelsFollowResponse,
  AddPptRecordTaskParams,
  PptRecordMutationResponse,
  UpdatePptRecordSettingParams,
  DeletePptRecordParams,
  ViewerApiTokenParams,
  ViewerApiTokenResponse,
  ChatTokenParams,
  ChatTokenResponse,
  TokenLoginUrlParams,
  TokenLoginUrlResponse,
  BatchAddTransmitParams,
  BatchAddTransmitResponse,
  BatchAddSubmeetingParams,
  BatchAddSubmeetingResponse,
  AssociationReceiveChannelsParams,
  AssociationReceiveChannelsResponse,
  RemoveChatContentsParams,
  BatchDeleteChannelProductParams,
  BatchAddChannelProductsParams,
  BatchAddChannelProductsResponse,
  BatchShelfChannelProductParams,
  ProductIdParams,
  ProductStatus,
  ShelfChannelProductParams,
  PushChannelProductParams,
  SortChannelProductOrderParams,
  ReferenceProductParams,
  ReferenceProductResponse,
  DeleteDiskVideosParams,
  AddDiskVideosParams,
  SetChannelTokenParams,
  StopQuestionnaireParams,
  StopQuestionnaireResponse,
  BatchUpdateDanmuParams,
  UpdateChannelsFollowParams,
  UpdateStreamTypeParams,
  // Story 8-2 Types
  AddChannelProductParams,
  AddChannelProductResponse,
  UpdateChannelProductParams,
  DeleteChannelProductParams,
  UpdateChannelProductEnabledParams,
  UpdateChannelConfigParams,
  ListChannelProductsParams,
  ListChannelProductsResponse,
  ChannelViewerApiScope,
  ListChannelViewerGroupsParams,
  ListChannelViewerGroupsResponse,
  CreateChannelViewerGroupParams,
  UpdateChannelViewerGroupParams,
  DeleteChannelViewerGroupParams,
  ChannelViewerGroup,
  GetChannelViewerGroupSettingParams,
  UpdateChannelViewerGroupSettingParams,
  ChannelViewerGroupSetting,
  ListChannelViewersParams,
  ListChannelViewersResponse,
  ExportChannelViewersParams,
  ExportChannelViewersResponse,
  AddChannelViewersParams,
  DeleteChannelViewersParams,
  TransferChannelViewersParams,
  ImportChannelViewersParams,
  ImportChannelViewersResponse,
  ListUnrelatedChannelViewersParams,
  ListUnrelatedChannelViewersResponse,
} from '../types/channel.js';
import { PolyVValidationError } from '../errors/polyv-validation-error.js';
import { generateSignature } from '../auth/signature.js';

/**
 * ChannelService
 *
 * Provides methods to interact with PolyV Live Channel APIs.
 *
 * @example
 * ```typescript
 * const client = new PolyVClient({ appId: 'xxx', appSecret: 'yyy' });
 * const channel = await client.channel.createChannel({
 *   name: 'My Channel',
 *   channelPasswd: 'password123',
 *   userId: 'user123',
 * });
 * ```
 */
export class ChannelService {
  private client: PolyVClient;

  /**
   * Create a new ChannelService instance
   *
   * @param client - The PolyVClient instance to use for API calls
   */
  constructor(client: PolyVClient) {
    this.client = client;
  }

  private validateChannelViewerScope(scope?: ChannelViewerApiScope): ChannelViewerApiScope {
    if (scope === undefined) {
      return 'user';
    }

    if (scope !== 'user' && scope !== 'teacher') {
      throw new PolyVValidationError(
        'scope must be user or teacher',
        'scope',
        scope,
        { allowedValues: ['user', 'teacher'] }
      );
    }

    return scope;
  }

  private buildLiveBgConfig(params?: Record<string, unknown>): {
    params?: Record<string, unknown>;
    baseURL: string;
    headers: Record<string, string>;
  } {
    const baseURL = this.client.config.liveBgBaseUrl ?? 'https://live.polyv.net';

    return params
      ? {
          params,
          baseURL,
          headers: { 'X-Skip-Auth': 'true' },
        }
      : {
          baseURL,
          headers: { 'X-Skip-Auth': 'true' },
        };
  }

  private validateRequiredValue(value: unknown, field: string): void {
    if (value === undefined || value === null || String(value).trim() === '') {
      throw PolyVValidationError.required(field);
    }
  }

  private validateRequiredText(value: string | undefined, field: string, maxLength?: number): void {
    if (!value || value.trim() === '') {
      throw PolyVValidationError.required(field);
    }

    if (maxLength !== undefined && value.length > maxLength) {
      throw PolyVValidationError.outOfRange(field, value.length, { max: maxLength });
    }
  }

  private validateOptionalText(value: string | undefined, field: string, maxLength: number): void {
    if (value !== undefined && value.length > maxLength) {
      throw PolyVValidationError.outOfRange(field, value.length, { max: maxLength });
    }
  }

  private validateOptionalYn(value: YNFlag | undefined, field: string): void {
    if (value !== undefined && value !== 'Y' && value !== 'N') {
      throw new PolyVValidationError(
        `${field} must be Y or N`,
        field,
        value,
        { allowedValues: ['Y', 'N'] }
      );
    }
  }

  private validateOptionalPage(value: number | undefined, field: string): void {
    if (value === undefined) {
      return;
    }

    if (!Number.isInteger(value) || value < 1 || value > 1000) {
      throw PolyVValidationError.outOfRange(field, value, { min: 1, max: 1000 });
    }
  }

  private validatePositiveInteger(value: number | undefined, field: string): void {
    if (value === undefined || value === null) {
      throw PolyVValidationError.required(field);
    }

    if (!Number.isInteger(value) || value < 1 || value > 1000) {
      throw PolyVValidationError.outOfRange(field, value, { min: 1, max: 1000 });
    }
  }

  private normalizeCommaSeparatedValues(
    values: string | Array<string | number>,
    field: string
  ): string {
    if (Array.isArray(values)) {
      if (values.length === 0) {
        throw PolyVValidationError.required(field);
      }

      const normalized = values.map((value, index) => {
        this.validateRequiredValue(value, `${field}[${index}]`);
        return String(value).trim();
      });

      return normalized.join(',');
    }

    this.validateRequiredText(values, field);
    return values.trim();
  }

  private normalizeOptionalCommaSeparatedValues(
    values: string | number | Array<string | number> | undefined,
    field: string
  ): string | undefined {
    if (values === undefined) {
      return undefined;
    }

    if (Array.isArray(values)) {
      return this.normalizeCommaSeparatedValues(values, field);
    }

    this.validateRequiredValue(values, field);
    return String(values).trim();
  }

  private validateRequiredYn(value: YNFlag | undefined, field: string): void {
    if (value === undefined) {
      throw PolyVValidationError.required(field);
    }

    this.validateOptionalYn(value, field);
  }

  private validateStringArray(values: string[], field: string, maxLength: number): void {
    if (!Array.isArray(values) || values.length === 0) {
      throw PolyVValidationError.required(field);
    }

    if (values.length > maxLength) {
      throw PolyVValidationError.outOfRange(field, values.length, { max: maxLength });
    }

    values.forEach((value, index) => {
      this.validateRequiredText(value, `${field}[${index}]`);
    });
  }

  private validateNumberArray(values: number[], field: string, maxLength: number): void {
    if (!Array.isArray(values) || values.length === 0) {
      throw PolyVValidationError.required(field);
    }

    if (values.length > maxLength) {
      throw PolyVValidationError.outOfRange(field, values.length, { max: maxLength });
    }

    values.forEach((value, index) => {
      if (!Number.isInteger(value) || value < 1) {
        throw PolyVValidationError.outOfRange(`${field}[${index}]`, value, { min: 1 });
      }
    });
  }

  private validateProductStatus(value: ProductStatus | undefined, field: string): void {
    if (value === undefined) {
      throw PolyVValidationError.required(field);
    }

    if (value !== 1 && value !== 2) {
      throw new PolyVValidationError(
        `${field} must be 1 or 2`,
        field,
        value,
        { allowedValues: [1, 2] }
      );
    }
  }

  private validateViewerIds(viewerIds: string[]): void {
    if (!Array.isArray(viewerIds) || viewerIds.length === 0) {
      throw PolyVValidationError.required('viewerIds');
    }

    if (viewerIds.length > 1000) {
      throw PolyVValidationError.outOfRange('viewerIds', viewerIds.length, { max: 1000 });
    }

    viewerIds.forEach((viewerId, index) => {
      if (!viewerId || viewerId.trim() === '') {
        throw PolyVValidationError.required(`viewerIds[${index}]`);
      }
    });
  }

  private normalizeCommaSeparated(value: string | string[] | undefined): string | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (Array.isArray(value)) {
      const validValues = value.filter(item => item && item.trim() !== '');
      return validValues.length > 0 ? validValues.join(',') : undefined;
    }

    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  }

  private validateChannelViewerListParams(params: ListChannelViewersParams): void {
    this.validateRequiredValue(params.channelId, 'channelId');
    this.validateOptionalText(params.viewerId, 'viewerId', 64);
    this.validateOptionalText(params.nickname, 'nickname', 128);
    this.validateOptionalText(params.mobile, 'mobile', 32);
    this.validateOptionalPage(params.pageNumber, 'pageNumber');
    this.validateOptionalPage(params.pageSize, 'pageSize');
  }

  private validateUnrelatedChannelViewerParams(params: ListUnrelatedChannelViewersParams): void {
    this.validateRequiredValue(params.channelId, 'channelId');
    this.validateOptionalPage(params.pageNumber, 'pageNumber');
    this.validateOptionalPage(params.pageSize, 'pageSize');

    if (params.labelIds && params.labelIds.length > 10) {
      throw PolyVValidationError.outOfRange('labelIds', params.labelIds.length, { max: 10 });
    }
  }

  /**
   * Validate create channel request parameters (V2 API - deprecated)
   */
  private validateCreateRequest(request: CreateChannelRequest): void {
    const errors: PolyVValidationError[] = [];

    // Validate userId is required and not empty
    if (!request.userId || request.userId.trim() === '') {
      errors.push(PolyVValidationError.required('userId'));
    }

    // Validate name is required and max length (60 chars)
    if (!request.name || request.name.trim() === '') {
      errors.push(PolyVValidationError.required('name'));
    } else if (request.name.length > 60) {
      errors.push(PolyVValidationError.outOfRange('name', request.name.length, { max: 60 }));
    }

    // Validate channelPasswd max length (16 chars)
    if (request.channelPasswd && request.channelPasswd.length > 16) {
      errors.push(PolyVValidationError.outOfRange('channelPasswd', request.channelPasswd.length, { max: 16 }));
    }

    // Throw aggregated errors if any
    const aggregated = PolyVValidationError.aggregate(errors);
    if (aggregated) {
      throw aggregated;
    }
  }

  /**
   * Validate create channel V4 request parameters
   */
  private validateCreateV4Request(request: CreateChannelV4Request): void {
    const errors: PolyVValidationError[] = [];

    // Validate name is required and max length (100 chars)
    if (!request.name || request.name.trim() === '') {
      errors.push(PolyVValidationError.required('name'));
    } else if (request.name.length > 100) {
      errors.push(PolyVValidationError.outOfRange('name', request.name.length, { max: 100 }));
    }

    // Validate newScene is required
    if (!request.newScene) {
      errors.push(PolyVValidationError.required('newScene'));
    }

    // Validate template is required
    if (!request.template) {
      errors.push(PolyVValidationError.required('template'));
    }

    // Validate channelPasswd length (6-16 chars) if provided
    if (request.channelPasswd) {
      if (request.channelPasswd.length < 6 || request.channelPasswd.length > 16) {
        errors.push(PolyVValidationError.outOfRange('channelPasswd', request.channelPasswd.length, { min: 6, max: 16 }));
      }
    }

    // Validate seminar passwords if scene is seminar
    if (request.newScene === 'seminar') {
      if (request.seminarHostPassword && request.seminarAttendeePassword) {
        if (request.seminarHostPassword === request.seminarAttendeePassword) {
          errors.push(new PolyVValidationError('seminarHostPassword', '研讨会主持人密码和参会人密码不能相同'));
        }
      }
    }

    // Throw aggregated errors if any
    const aggregated = PolyVValidationError.aggregate(errors);
    if (aggregated) {
      throw aggregated;
    }
  }

  /**
   * Create a new channel (V4 API)
   *
   * Creates a new live streaming channel with the specified configuration.
   * Uses the V4 API endpoint which requires JSON body for request parameters.
   *
   * @param request - Channel creation parameters (V4 format)
   * @returns The created channel information
   * @throws PolyVValidationError if request parameters are invalid
   *
   * @example
   * ```typescript
   * const channel = await channelService.createChannelV4({
   *   name: 'My Live Channel',
   *   newScene: 'alone',
   *   template: 'portrait_alone',
   *   channelPasswd: 'password123',
   *   pureRtcEnabled: 'N',
   *   linkMicLimit: 0,
   * });
   * ```
   */
  async createChannelV4(request: CreateChannelV4Request): Promise<CreateChannelV4Response> {
    this.validateCreateV4Request(request);

    // V4 API uses JSON body for request parameters
    // appId, timestamp, sign are passed as query parameters (handled by interceptor)
    // Note: The response interceptor extracts data.data from the API response
    const response = await this.client.httpClient.post<CreateChannelV4Response>(
      '/live/v4/channel/create',
      request,
      { headers: { 'Content-Type': 'application/json' } }
    );

    return response as unknown as CreateChannelV4Response;
  }

  /**
   * Update channel watch condition
   * 修改频道观看条件
   *
   * Sets the watch condition for a channel. Use this to configure access control.
   * For public viewing, set authType to 'public' and enabled to 'Y'.
   *
   * @param request - Watch condition update parameters
   * @returns true if update was successful
   * @throws PolyVValidationError if request parameters are invalid
   *
   * @example
   * ```typescript
   * // Set to public viewing
   * await channelService.updateWatchCondition({
   *   channelId: '123456',
   *   authSettings: [
   *     { rank: 1, enabled: 'Y', authType: 'public' },
   *     { rank: 2, enabled: 'N' }
   *   ]
   * });
   * ```
   */
  async updateWatchCondition(request: UpdateWatchConditionRequest): Promise<boolean> {
    // Validate channelId if provided
    if (request.channelId !== undefined && request.channelId.trim() === '') {
      throw new PolyVValidationError('channelId cannot be empty string', 'channelId');
    }

    // Validate authSettings
    if (!request.authSettings || request.authSettings.length === 0) {
      throw new PolyVValidationError('authSettings is required', 'authSettings');
    }

    // Build request params (for signature)
    const params: Record<string, string> = {};
    if (request.channelId) {
      params.channelId = request.channelId;
    }

    // V3 API uses JSON body for authSettings
    const response = await this.client.httpClient.post<boolean>(
      '/live/v3/channel/auth/update',
      { authSettings: request.authSettings },
      { params, headers: { 'Content-Type': 'application/json' } }
    );

    return response as unknown as boolean;
  }

  /**
   * Create a new channel (V2 API - deprecated)
   *
   * @deprecated Use createChannelV4 instead. This method uses the old V2 API.
   * Creates a new live streaming channel with the specified configuration.
   *
   * @param request - Channel creation parameters
   * @returns The created channel information
   * @throws PolyVValidationError if request parameters are invalid
   *
   * @example
   * ```typescript
   * const channel = await channelService.createChannel({
   *   name: 'My Live Channel',
   *   channelPasswd: 'password123',
   *   userId: 'user123',
   *   scene: 'alone',
   * });
   * ```
   */
  async createChannel(request: CreateChannelRequest): Promise<ChannelModel> {
    this.validateCreateRequest(request);

    // PolyV API expects parameters as query parameters for this endpoint
    // The request interceptor will add appId, timestamp, and sign to params
    // Note: The response interceptor extracts data.data from the API response
    const response = await this.client.httpClient.post<ChannelModel>(
      '/live/v2/channels',
      null,
      { params: request }
    );

    return response as unknown as ChannelModel;
  }

  /**
   * Get channel details by ID
   *
   * Retrieves complete information about a specific channel.
   *
   * @param channelId - The channel ID to retrieve
   * @returns Channel details including all configuration
   *
   * @example
   * ```typescript
   * const channel = await channelService.getChannel('ch123456');
   * console.log(channel.name, channel.url);
   * ```
   */
  async getChannel(channelId: string): Promise<ChannelDetail> {
    // Note: The response interceptor extracts data.data from the API response
    const response = await this.client.httpClient.get<ChannelDetail>(
      `/live/v2/channels/${channelId}/get`
    );

    return response as unknown as ChannelDetail;
  }

  /**
   * Update channel settings
   *
   * Performs a partial update on channel settings.
   * Only provided fields will be updated.
   *
   * @param channelId - The channel ID to update
   * @param request - Partial update parameters
   * @returns Updated channel details
   * @throws PolyVValidationError if request parameters are invalid
   *
   * @example
   * ```typescript
   * const updated = await channelService.updateChannel('ch123456', {
   *   name: 'New Channel Name',
   *   maxViewer: 2000,
   * });
   * ```
   */
  async updateChannel(
    channelId: string,
    request: UpdateChannelRequest
  ): Promise<ChannelDetail> {
    // Validate channelId
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }

    // The API expects the request body to be wrapped in basicSetting
    // Endpoint: /live/v3/channel/basic/update
    // channelId is passed as a query parameter (signing parameter)
    const body = {
      basicSetting: request,
    };

    // Note: The response interceptor extracts data.data from the API response
    await this.client.httpClient.post(
      `/live/v3/channel/basic/update`,
      body,
      { params: { channelId } }
    );

    // After update, fetch and return the updated channel details
    return this.getChannel(channelId);
  }

  /**
   * Delete a channel
   *
   * Permanently deletes a channel. This action cannot be undone.
   *
   * @param channelId - The channel ID to delete
   * @param userId - The user ID performing the deletion
   * @returns true if deletion was successful
   *
   * @example
   * ```typescript
   * const success = await channelService.deleteChannel('ch123456', 'user123');
   * if (success) {
   *   console.log('Channel deleted');
   * }
   * ```
   */
  async deleteChannel(channelId: string, userId: string): Promise<boolean> {
    // Validate parameters
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!userId || userId.trim() === '') {
      throw PolyVValidationError.required('userId');
    }

    // The API returns { code: 200, data: true } on success
    // userId is passed as a query parameter (for signing)
    const response = await this.client.httpClient.post<boolean>(
      `/live/v2/channels/${channelId}/delete`,
      null,
      { params: { userId } }
    );

    return response as unknown as boolean;
  }

  /**
   * Batch delete channels
   *
   * Permanently deletes multiple channels. This action cannot be undone.
   * If the request fails, all channels fail (no partial success).
   *
   * @param channelIds - Array of channel IDs to delete (max 100 per request)
   * @returns true if all deletions were successful
   *
   * @example
   * ```typescript
   * const success = await channelService.batchDeleteChannels(['ch123456', 'ch789012']);
   * if (success) {
   *   console.log('All channels deleted');
   * }
   * ```
   */
  async batchDeleteChannels(channelIds: string[]): Promise<boolean> {
    // Validate parameters
    if (!channelIds || channelIds.length === 0) {
      return true; // Nothing to delete
    }

    if (channelIds.length > 100) {
      throw new PolyVValidationError(
        'channelIds',
        'Maximum 100 channels can be deleted per request'
      );
    }

    // Filter out empty channelIds
    const validChannelIds = channelIds.filter(id => id && id.trim() !== '');
    if (validChannelIds.length === 0) {
      return true;
    }

    // The API expects channelIds as numbers in the request body
    // Sign parameters (appId, timestamp) are in query string
    const body = {
      channelIds: validChannelIds.map(id => Number(id)),
    };

    // Note: The response interceptor extracts data.data from the API response
    const response = await this.client.httpClient.post(
      '/live/v3/channel/basic/batch-delete',
      body
    );

    return response as unknown as boolean;
  }

  // ============================================
  // Auth APIs (Story 2-2)
  // ============================================

  /**
   * Get channel API access token
   *
   * Generates a token for accessing channel-specific APIs.
   * Note: Maximum 500 calls per hour per channel.
   *
   * @param channelId - The channel ID
   * @param options - Optional token settings
   * @returns Token with expiration time
   * @throws PolyVValidationError if channelId is empty
   *
   * @example
   * ```typescript
   * const token = await channelService.getChannelApiAccessToken('ch123456');
   * console.log(token.channelToken, token.expireTime);
   * ```
   */
  async getChannelApiAccessToken(
    channelId: string,
    options?: GetChannelApiTokenRequest
  ): Promise<ChannelApiTokenResponse> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }

    const params: Record<string, unknown> = { channelId };
    if (options?.disposable !== undefined) {
      params.disposable = options.disposable;
    }
    if (options?.expireSeconds !== undefined) {
      params.expireSeconds = options.expireSeconds;
    }

    const response = await this.client.httpClient.post<ChannelApiTokenResponse>(
      '/live/v3/common/token/get-channel-token',
      null,
      { params }
    );

    return response as unknown as ChannelApiTokenResponse;
  }

  /**
   * Get test mode token
   *
   * Generates a token for testing the channel watch page.
   * Default validity: 4 hours, maximum: 30 days.
   *
   * @param channelId - The channel ID
   * @param options - Optional token settings
   * @returns Test mode token string
   * @throws PolyVValidationError if channelId is empty
   *
   * @example
   * ```typescript
   * const token = await channelService.getTestModeToken('ch123456');
   * console.log(token);
   * ```
   */
  async getTestModeToken(
    channelId: string,
    options?: GetTestModeTokenRequest
  ): Promise<string> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }

    const params: Record<string, unknown> = { channelId };
    if (options?.expireTime !== undefined) {
      params.expireTime = options.expireTime;
    }

    const response = await this.client.httpClient.post<string>(
      '/live/v3/channel/watch/get-test-mode-token',
      null,
      { params }
    );

    return response as unknown as string;
  }

  // ============================================
  // Doc APIs (Story 2-2)
  // ============================================

  /**
   * Get document list
   *
   * Retrieves a paginated list of documents for a channel or teacher.
   *
   * @param options - Query options (channelId or teacherId required)
   * @returns Paginated document list
   *
   * @example
   * ```typescript
   * const docs = await channelService.getDocList({ channelId: 'ch123456', page: 1, limit: 10 });
   * console.log(docs.contents);
   * ```
   */
  async getDocList(options: GetDocListRequest): Promise<DocListResponse> {
    const response = await this.client.httpClient.get<DocListResponse>(
      '/live/v3/channel/document/doc-list',
      { params: options }
    );

    return response as unknown as DocListResponse;
  }

  /**
   * Upload document
   *
   * Uploads a document to a channel from file or URL.
   * Max file size: 200M. Supported formats: ppt, pdf, pptx, doc, docx, wps.
   *
   * @param channelId - The channel ID
   * @param options - Upload options (file or url required)
   * @returns Upload result with fileId and status
   * @throws PolyVValidationError if channelId is empty or no file/url provided
   *
   * @example
   * ```typescript
   * const result = await channelService.uploadDoc('ch123456', {
   *   url: 'https://example.com/document.pdf',
   *   docName: 'My Document',
   * });
   * console.log(result.fileId);
   * ```
   */
  async uploadDoc(channelId: string, options: UploadDocRequest): Promise<UploadDocResponse> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }

    if (!options.file && !options.url) {
      throw PolyVValidationError.required('file or url');
    }

    // Build signature params from form fields (excluding file binary)
    const timestamp = Date.now();
    const signatureParams: Record<string, unknown> = {
      appId: this.client.config.appId,
      timestamp,
      channelId,
    };

    // Include URL or other non-file fields in signature
    if (options.url) {
      signatureParams.url = options.url;
    }
    if (options.type) {
      signatureParams.type = options.type;
    }
    if (options.docName) {
      signatureParams.docName = options.docName;
    }
    if (options.callbackUrl) {
      signatureParams.callbackUrl = options.callbackUrl;
    }

    // Generate signature from all form fields
    const { sign } = generateSignature(signatureParams, {
      appSecret: this.client.config.appSecret,
    });

    // Build FormData with all fields including auth params
    const formData = new FormData();
    formData.append('appId', this.client.config.appId);
    formData.append('timestamp', String(timestamp));
    formData.append('sign', sign);
    formData.append('channelId', channelId);

    if (options.file) {
      formData.append('file', options.file);
    } else if (options.url) {
      formData.append('url', options.url);
    }

    if (options.type) {
      formData.append('type', options.type);
    }
    if (options.docName) {
      formData.append('docName', options.docName);
    }
    if (options.callbackUrl) {
      formData.append('callbackUrl', options.callbackUrl);
    }

    // Make request without default auth interceptor (we handle it manually for FormData)
    const response = await this.client.httpClient.post<UploadDocResponse>(
      '/live/v3/channel/document/upload-doc',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-Skip-Auth': 'true',  // Signal interceptor to skip auth injection
        },
      }
    );

    return response as unknown as UploadDocResponse;
  }

  /**
   * Delete document
   *
   * Deletes one or more documents from a channel.
   *
   * @param channelId - The channel ID
   * @param fileId - File ID(s), comma-separated for multiple
   * @param type - Document type (old or new)
   * @returns true if deletion was successful
   * @throws PolyVValidationError if required parameters are empty
   *
   * @example
   * ```typescript
   * const success = await channelService.deleteDocument('ch123456', 'file123', 'new');
   * ```
   */
  async deleteDocument(channelId: string, fileId: string, type: DocType): Promise<boolean> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!fileId || fileId.trim() === '') {
      throw PolyVValidationError.required('fileId');
    }

    const response = await this.client.httpClient.post<boolean>(
      '/live/v3/channel/document/delete',
      null,
      { params: { channelId, fileId, type } }
    );

    return response as unknown as boolean;
  }

  /**
   * Get document convert status
   *
   * Retrieves the conversion status of one or more documents.
   *
   * @param channelId - The channel ID
   * @param fileId - File ID(s), comma-separated for multiple
   * @returns Array of document conversion status items
   * @throws PolyVValidationError if required parameters are empty
   *
   * @example
   * ```typescript
   * const status = await channelService.getDocConvertStatus('ch123456', 'file123');
   * console.log(status[0].convertStatus);
   * ```
   */
  async getDocConvertStatus(channelId: string, fileId: string): Promise<DocConvertStatusItem[]> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!fileId || fileId.trim() === '') {
      throw PolyVValidationError.required('fileId');
    }

    const response = await this.client.httpClient.get<DocConvertStatusItem[]>(
      '/live/v3/channel/document/status/get',
      { params: { channelId, fileId } }
    );

    return response as unknown as DocConvertStatusItem[];
  }

  /**
   * Update teacher document relation
   *
   * Adds or removes the binding between a teacher and documents.
   * Note: fileIds is passed in the body, other parameters in query string.
   *
   * @param teacherId - The teacher ID
   * @param fileIds - File IDs, comma-separated
   * @param operation - 1 to add binding, 2 to remove binding
   * @returns true if operation was successful
   * @throws PolyVValidationError if required parameters are empty
   *
   * @example
   * ```typescript
   * // Add binding
   * await channelService.updateTeacherDocRelation('teacher123', 'file1,file2', 1);
   * // Remove binding
   * await channelService.updateTeacherDocRelation('teacher123', 'file1', 2);
   * ```
   */
  async updateTeacherDocRelation(
    teacherId: string,
    fileIds: string,
    operation: 1 | 2
  ): Promise<boolean> {
    if (!teacherId || teacherId.trim() === '') {
      throw PolyVValidationError.required('teacherId');
    }
    if (!fileIds || fileIds.trim() === '') {
      throw PolyVValidationError.required('fileIds');
    }

    // fileIds in body, other params in query
    const response = await this.client.httpClient.post<boolean>(
      '/live/v4/channel/doc/teacher/update-relation',
      { fileIds },
      { params: { teacherId, operation } }
    );

    return response as unknown as boolean;
  }

  // ============================================
  // Multimedia APIs (Story 2-2)
  // ============================================

  /**
   * Get channel multimedia resource VID list
   *
   * Retrieves the list of video IDs associated with a channel.
   *
   * @param channelId - The channel ID
   * @param options - Pagination options
   * @returns Paginated VID list
   * @throws PolyVValidationError if channelId is empty
   *
   * @example
   * ```typescript
   * const vids = await channelService.getChannelMultimediaResourceList('ch123456');
   * console.log(vids.contents);
   * ```
   */
  async getChannelMultimediaResourceList(
    channelId: string,
    options?: PaginationParams
  ): Promise<MultimediaResourceVidListResponse> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }

    const params: Record<string, unknown> = { channelId };
    if (options?.pageNumber !== undefined) {
      params.pageNumber = options.pageNumber;
    }
    if (options?.pageSize !== undefined) {
      params.pageSize = options.pageSize;
    }

    const response = await this.client.httpClient.get<MultimediaResourceVidListResponse>(
      '/live/v4/channel/multimedia/resource/list-vids',
      { params }
    );

    return response as unknown as MultimediaResourceVidListResponse;
  }

  /**
   * Get channel multimedia resource details
   *
   * Retrieves detailed information about videos associated with a channel.
   *
   * @param channelId - The channel ID
   * @param options - Pagination options
   * @returns Paginated resource details
   *
   * @example
   * ```typescript
   * const details = await channelService.getChannelMultimediaResourceDetail('ch123456');
   * console.log(details.contents[0].title);
   * ```
   */
  async getChannelMultimediaResourceDetail(
    channelId: string,
    options?: PaginationParams
  ): Promise<MultimediaResourceDetailResponse> {
    const params: Record<string, unknown> = { channelId };
    if (options?.pageNumber !== undefined) {
      params.pageNumber = options.pageNumber;
    }
    if (options?.pageSize !== undefined) {
      params.pageSize = options.pageSize;
    }

    const response = await this.client.httpClient.get<MultimediaResourceDetailResponse>(
      '/live/v4/channel/multimedia/resource/list',
      { params }
    );

    return response as unknown as MultimediaResourceDetailResponse;
  }

  /**
   * Link multimedia resources to channel
   *
   * Associates one or more videos with a channel.
   *
   * @param channelId - The channel ID
   * @param vids - Video IDs, comma-separated
   * @returns true if operation was successful
   * @throws PolyVValidationError if required parameters are empty
   *
   * @example
   * ```typescript
   * await channelService.linkChannelMultimediaResource('ch123456', 'vid1,vid2');
   * ```
   */
  async linkChannelMultimediaResource(channelId: string, vids: string): Promise<boolean> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!vids || vids.trim() === '') {
      throw PolyVValidationError.required('vids');
    }

    const response = await this.client.httpClient.post<boolean>(
      '/live/v4/channel/multimedia/resource/save-batch',
      null,
      { params: { channelId, vids } }
    );

    return response as unknown as boolean;
  }

  /**
   * Unlink multimedia resources from channel
   *
   * Removes the association between videos and a channel.
   *
   * @param channelId - The channel ID
   * @param vids - Video IDs, comma-separated
   * @returns true if operation was successful
   * @throws PolyVValidationError if required parameters are empty
   *
   * @example
   * ```typescript
   * await channelService.unlinkChannelMultimediaResource('ch123456', 'vid1');
   * ```
   */
  async unlinkChannelMultimediaResource(channelId: string, vids: string): Promise<boolean> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!vids || vids.trim() === '') {
      throw PolyVValidationError.required('vids');
    }

    const response = await this.client.httpClient.post<boolean>(
      '/live/v4/channel/multimedia/resource/delete-batch',
      null,
      { params: { channelId, vids } }
    );

    return response as unknown as boolean;
  }

  /**
   * Get user multimedia resource details
   *
   * Retrieves detailed information about user's videos.
   * Maximum 100 VIDs per request.
   *
   * @param vids - Video IDs, comma-separated (max 100)
   * @returns User multimedia resource details
   * @throws PolyVValidationError if vids is empty
   *
   * @example
   * ```typescript
   * const details = await channelService.getUserMultimediaResourceDetail('vid1,vid2');
   * console.log(details.contents[0].title);
   * ```
   */
  async getUserMultimediaResourceDetail(vids: string): Promise<UserMultimediaResourceResponse> {
    if (!vids || vids.trim() === '') {
      throw PolyVValidationError.required('vids');
    }

    const response = await this.client.httpClient.get<UserMultimediaResourceResponse>(
      '/live/v4/user/multimedia/resource/list',
      { params: { vids } }
    );

    return response as unknown as UserMultimediaResourceResponse;
  }

  /**
   * Delete user multimedia resources
   *
   * Deletes one or more videos from the user's account.
   * Maximum 100 VIDs per request.
   *
   * @param vids - Video IDs, comma-separated (max 100)
   * @returns true if deletion was successful
   * @throws PolyVValidationError if vids is empty
   *
   * @example
   * ```typescript
   * await channelService.deleteUserMultimediaResource('vid1,vid2');
   * ```
   */
  async deleteUserMultimediaResource(vids: string): Promise<boolean> {
    if (!vids || vids.trim() === '') {
      throw PolyVValidationError.required('vids');
    }

    const response = await this.client.httpClient.post<boolean>(
      '/live/v4/user/multimedia/resource/delete-batch',
      null,
      { params: { vids } }
    );

    return response as unknown as boolean;
  }

  // ============================================
  // Monitor APIs (Story 2-3)
  // ============================================

  /**
   * Get HLS pull URL
   *
   * Gets the HLS pull URL for monitoring the channel stream.
   *
   * @param channelId - The channel ID
   * @returns HLS pull URL string
   * @throws PolyVValidationError if channelId is empty
   *
   * @example
   * ```typescript
   * const url = await channelService.getHlsPullUrl('ch123456');
   * console.log(url);
   * ```
   */
  async getHlsPullUrl(channelId: string): Promise<string> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }

    const response = await this.client.httpClient.get<string>(
      '/live/v3/channel/monitor/hls-pull-url',
      { params: { channelId } }
    );

    return response as unknown as string;
  }

  /**
   * Get push URL
   *
   * Gets the RTMP push URL for streaming to the channel.
   *
   * @param channelId - The channel ID
   * @returns Push URL string
   * @throws PolyVValidationError if channelId is empty
   *
   * @example
   * ```typescript
   * const url = await channelService.getPushUrl('ch123456');
   * console.log(url);
   * ```
   */
  async getPushUrl(channelId: string): Promise<string> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }

    const response = await this.client.httpClient.get<string>(
      '/live/v3/channel/stream/get-push-url',
      { params: { channelId } }
    );

    return response as unknown as string;
  }

  // ============================================
  // Channel Basic APIs (Story 2-3)
  // ============================================

  /**
   * Create channel (v3)
   *
   * Creates a new channel with full configuration support including auth, playback, teacher, and roles.
   *
   * @param request - Channel creation parameters
   * @returns Created channel information
   * @throws PolyVValidationError if required parameters are missing
   *
   * @example
   * ```typescript
   * const channel = await channelService.createChannelV3({
   *   name: 'My Channel',
   *   channelPasswd: 'password123',
   *   userId: 'user123',
   * });
   * console.log(channel.channelId);
   * ```
   */
  async createChannelV3(
    request: import('../types/channel.js').CreateChannelV3Request
  ): Promise<import('../types/channel.js').CreateChannelV3Response> {
    // Validate required fields
    if (!request.name || request.name.trim() === '') {
      throw PolyVValidationError.required('name');
    }
    if (!request.channelPasswd || request.channelPasswd.trim() === '') {
      throw PolyVValidationError.required('channelPasswd');
    }

    // The API expects the request body to be wrapped in basicSetting
    const body = {
      basicSetting: request,
    };

    const response = await this.client.httpClient.post<import('../types/channel.js').CreateChannelV3Response>(
      '/live/v3/channel/basic/create',
      body,
      { params: {} }
    );

    return response as unknown as import('../types/channel.js').CreateChannelV3Response;
  }

  /**
   * Copy channel
   *
   * Creates a copy of an existing channel.
   *
   * @param channelId - The channel ID to copy
   * @param options - Optional copy settings (name, categoryId, startTime, subAccount)
   * @returns New channel ID
   * @throws PolyVValidationError if channelId is empty
   *
   * @example
   * ```typescript
   * const newChannelId = await channelService.copyChannel('ch123456', { name: 'Copy of My Channel' });
   * console.log(newChannelId);
   * ```
   */
  async copyChannel(
    channelId: string,
    options?: import('../types/channel.js').CopyChannelOptions
  ): Promise<number> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }

    const params: Record<string, unknown> = { channelId };
    if (options?.name) {
      params.name = options.name;
    }
    if (options?.categoryId !== undefined) {
      params.categoryId = options.categoryId;
    }
    if (options?.startTime !== undefined) {
      params.startTime = options.startTime;
    }
    if (options?.subAccount) {
      params.subAccount = options.subAccount;
    }

    const response = await this.client.httpClient.post<number>(
      '/live/v3/channel/basic/copy',
      null,
      { params }
    );

    return response as unknown as number;
  }

  // ============================================
  // Setting APIs (Story 2-3)
  // ============================================

  /**
   * Set max viewer
   *
   * Sets the maximum number of concurrent viewers for a channel.
   *
   * @param channelId - The channel ID
   * @param userId - The user ID
   * @param maxViewer - Maximum viewer count
   * @returns Success message
   * @throws PolyVValidationError if required parameters are missing
   *
   * @example
   * ```typescript
   * const result = await channelService.setMaxViewer('ch123456', 'user123', 1000);
   * console.log(result);
   * ```
   */
  async setMaxViewer(channelId: string, userId: string, maxViewer: number): Promise<string> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!userId || userId.trim() === '') {
      throw PolyVValidationError.required('userId');
    }
    if (maxViewer === undefined || maxViewer === null) {
      throw PolyVValidationError.required('maxViewer');
    }

    const response = await this.client.httpClient.post<string>(
      `/live/v2/channelRestrict/${channelId}/set-max-viewer`,
      null,
      { params: { userId, maxViewer } }
    );

    return response as unknown as string;
  }

  /**
   * Update channel password
   *
   * Updates the password for a specific channel or all channels.
   *
   * @param userId - The user ID
   * @param passwd - New password
   * @param channelId - Optional channel ID (if not provided, updates all channels)
   * @returns true if update was successful
   * @throws PolyVValidationError if required parameters are missing
   *
   * @example
   * ```typescript
   * // Update specific channel password
   * await channelService.updateChannelPassword('user123', 'newpass', 'ch123456');
   * // Update all channels password
   * await channelService.updateChannelPassword('user123', 'newpass');
   * ```
   */
  async updateChannelPassword(userId: string, passwd: string, channelId?: string): Promise<boolean> {
    if (!userId || userId.trim() === '') {
      throw PolyVValidationError.required('userId');
    }
    if (!passwd || passwd.trim() === '') {
      throw PolyVValidationError.required('passwd');
    }

    const params: Record<string, unknown> = { passwd };
    if (channelId) {
      params.channelId = channelId;
    }

    const response = await this.client.httpClient.post<boolean>(
      `/live/v2/channels/${userId}/passwdSetting`,
      null,
      { params }
    );

    return response as unknown as boolean;
  }

  // ============================================
  // Callback APIs (Story 2-3)
  // ============================================

  /**
   * Update callback setting
   *
   * Updates callback URLs for various channel events.
   *
   * @param channelId - The channel ID
   * @param options - Callback URL settings
   * @returns null on success
   * @throws PolyVValidationError if channelId is empty
   *
   * @example
   * ```typescript
   * await channelService.updateCallbackSetting('ch123456', {
   *   recordCallbackUrl: 'https://example.com/callback',
   * });
   * ```
   */
  async updateCallbackSetting(
    channelId: string,
    options: Omit<import('../types/channel.js').UpdateCallbackSettingRequest, 'channelId'>
  ): Promise<null> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }

    const params: Record<string, unknown> = { channelId, ...options };

    const response = await this.client.httpClient.post<null>(
      '/live/v3/channel/callback/update-setting',
      null,
      { params }
    );

    return response as unknown as null;
  }

  /**
   * Get callback setting
   *
   * Retrieves the callback URL settings for a channel.
   *
   * @param channelId - The channel ID
   * @returns Callback settings
   * @throws PolyVValidationError if channelId is empty
   *
   * @example
   * ```typescript
   * const settings = await channelService.getCallbackSetting('ch123456');
   * console.log(settings.recordCallbackUrl);
   * ```
   */
  async getCallbackSetting(channelId: string): Promise<import('../types/channel.js').CallbackSettingResponse> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }

    const response = await this.client.httpClient.get<import('../types/channel.js').CallbackSettingResponse>(
      '/live/v3/channel/callback/get-setting',
      { params: { channelId } }
    );

    return response as unknown as import('../types/channel.js').CallbackSettingResponse;
  }

  // ============================================
  // Account APIs (Story 2-3)
  // ============================================

  /**
   * Add account (role)
   *
   * Creates a new assistant or guest account for a channel.
   *
   * @param channelId - The channel ID
   * @param options - Account creation options
   * @returns Created account information
   * @throws PolyVValidationError if channelId is empty
   *
   * @example
   * ```typescript
   * const account = await channelService.addAccount('ch123456', {
   *   role: 'Assistant',
   *   nickname: 'My Assistant',
   *   password: 'password123',
   * });
   * console.log(account.account);
   * ```
   */
  async addAccount(
    channelId: string,
    options?: import('../types/channel.js').AddAccountRequest
  ): Promise<import('../types/channel.js').AccountModel> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }

    const params: Record<string, unknown> = {};
    if (options?.role) {
      params.role = options.role;
    }
    if (options?.nickname) {
      params.nickname = options.nickname;
    }
    if (options?.password) {
      params.password = options.password;
    }
    if (options?.actor) {
      params.actor = options.actor;
    }
    if (options?.avatar) {
      params.avatar = options.avatar;
    }

    const response = await this.client.httpClient.post<import('../types/channel.js').AccountModel>(
      `/live/v2/channelAccount/${channelId}/add`,
      null,
      { params }
    );

    return response as unknown as import('../types/channel.js').AccountModel;
  }

  /**
   * Get account
   *
   * Retrieves a specific account by account ID.
   *
   * @param channelId - The channel ID
   * @param account - The account identifier
   * @returns Account information
   * @throws PolyVValidationError if required parameters are empty
   *
   * @example
   * ```typescript
   * const account = await channelService.getAccount('ch123456', 'account123');
   * console.log(account.nickname);
   * ```
   */
  async getAccount(channelId: string, account: string): Promise<import('../types/channel.js').AccountModel> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!account || account.trim() === '') {
      throw PolyVValidationError.required('account');
    }

    const response = await this.client.httpClient.get<import('../types/channel.js').AccountModel>(
      `/live/v2/channelAccount/${channelId}/account`,
      { params: { account } }
    );

    return response as unknown as import('../types/channel.js').AccountModel;
  }

  /**
   * Get accounts
   *
   * Retrieves all accounts for a channel.
   *
   * @param channelId - The channel ID
   * @returns Array of accounts
   * @throws PolyVValidationError if channelId is empty
   *
   * @example
   * ```typescript
   * const accounts = await channelService.getAccounts('ch123456');
   * console.log(accounts.length);
   * ```
   */
  async getAccounts(channelId: string): Promise<import('../types/channel.js').AccountModel[]> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }

    const response = await this.client.httpClient.get<import('../types/channel.js').AccountModel[]>(
      `/live/v2/channelAccount/${channelId}/accounts`,
      { params: {} }
    );

    return response as unknown as import('../types/channel.js').AccountModel[];
  }

  /**
   * Update account
   *
   * Updates an existing account's information.
   *
   * @param channelId - The channel ID
   * @param account - The account identifier
   * @param options - Update options
   * @returns Updated account information
   * @throws PolyVValidationError if channelId is empty
   *
   * @example
   * ```typescript
   * const updated = await channelService.updateAccount('ch123456', 'account123', {
   *   nickname: 'New Nickname',
   * });
   * console.log(updated.nickname);
   * ```
   */
  async updateAccount(
    channelId: string,
    account: string,
    options?: import('../types/channel.js').UpdateAccountRequest
  ): Promise<import('../types/channel.js').AccountModel> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!account || account.trim() === '') {
      throw PolyVValidationError.required('account');
    }

    const params: Record<string, unknown> = { account };
    if (options?.nickname) {
      params.nickname = options.nickname;
    }
    if (options?.password) {
      params.password = options.password;
    }
    if (options?.actor) {
      params.actor = options.actor;
    }
    if (options?.avatar) {
      params.avatar = options.avatar;
    }

    const response = await this.client.httpClient.post<import('../types/channel.js').AccountModel>(
      `/live/v2/channelAccount/${channelId}/update`,
      null,
      { params }
    );

    return response as unknown as import('../types/channel.js').AccountModel;
  }

  /**
   * Delete account
   *
   * Deletes an account from a channel.
   *
   * @param channelId - The channel ID
   * @param account - The account identifier
   * @returns true if deletion was successful
   * @throws PolyVValidationError if required parameters are empty
   *
   * @example
   * ```typescript
   * const success = await channelService.deleteAccount('ch123456', 'account123');
   * console.log(success);
   * ```
   */
  async deleteAccount(channelId: string, account: string): Promise<boolean> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!account || account.trim() === '') {
      throw PolyVValidationError.required('account');
    }

    const response = await this.client.httpClient.post<boolean>(
      `/live/v2/channelAccount/${channelId}/delete`,
      null,
      { params: { account } }
    );

    return response as unknown as boolean;
  }

  /**
   * Batch create accounts
   *
   * Creates multiple accounts for a channel at once.
   *
   * @param channelId - The channel ID
   * @param accounts - Array of account creation items
   * @returns Array of created accounts
   * @throws PolyVValidationError if channelId is empty
   *
   * @example
   * ```typescript
   * const accounts = await channelService.batchCreateAccounts('ch123456', [
   *   { role: 'Assistant', nickname: 'Assistant 1', passwd: 'pass1' },
   *   { role: 'Guest', nickname: 'Guest 1', passwd: 'pass2' },
   * ]);
   * console.log(accounts.length);
   * ```
   */
  async batchCreateAccounts(
    channelId: string,
    accounts: import('../types/channel.js').BatchCreateAccountItem[]
  ): Promise<import('../types/channel.js').AccountModel[]> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }

    const response = await this.client.httpClient.post<import('../types/channel.js').AccountModel[]>(
      '/live/v3/channel/account/batch-create',
      accounts,
      { params: { channelId } }
    );

    return response as unknown as import('../types/channel.js').AccountModel[];
  }

  // ============================================
  // Playback APIs (Story 2-4)
  // ============================================

  /**
   * List channel live sessions using the historical playback API.
   */
  async listChannelSessions(params: ListChannelSessionsParams): Promise<ChannelSessionsResponse> {
    this.validateRequiredValue(params.channelId, 'channelId');

    const query: Record<string, unknown> = { channelId: params.channelId };
    if (params.startDate !== undefined) {
      query.startDate = params.startDate;
    }
    if (params.endDate !== undefined) {
      query.endDate = params.endDate;
    }
    if (params.page !== undefined) {
      query.page = params.page;
    }
    if (params.pageSize !== undefined) {
      query.pageSize = params.pageSize;
    }

    const response = await this.client.httpClient.get<ChannelSessionsResponse>(
      '/live/v3/channel/session/list',
      { params: query }
    );

    return response as unknown as ChannelSessionsResponse;
  }

  /**
   * List historical recording files for a channel.
   */
  async listRecordFiles(params: ListRecordFilesParams): Promise<ListRecordFilesResponse> {
    this.validateRequiredValue(params.channelId, 'channelId');
    this.validateRequiredValue(params.userId, 'userId');

    if ((params.startDate && !params.endDate) || (!params.startDate && params.endDate)) {
      throw new PolyVValidationError('startDate and endDate must be provided together');
    }

    const query: Record<string, unknown> = { userId: params.userId };
    if (params.startDate !== undefined) {
      query.startDate = params.startDate;
    }
    if (params.endDate !== undefined) {
      query.endDate = params.endDate;
    }
    if (params.sessionIds !== undefined) {
      query.sessionIds = params.sessionIds;
    }

    const response = await this.client.httpClient.get<ListRecordFilesResponse>(
      `/live/v2/channels/${params.channelId}/recordFiles`,
      { params: query }
    );

    return response as unknown as ListRecordFilesResponse;
  }

  /**
   * Merge historical recording files by URL or file ID.
   */
  async mergeRecordFiles(params: MergeRecordFilesParams): Promise<MergeRecordFilesResponse> {
    this.validateRequiredValue(params.channelId, 'channelId');

    const urls = this.normalizeCommaSeparated(params.urls);
    const fileIds = this.normalizeCommaSeparated(params.fileIds);
    if (!urls && !fileIds) {
      throw PolyVValidationError.required('urls or fileIds');
    }

    const query: Record<string, unknown> = {};
    if (urls !== undefined) {
      query.urls = urls;
    }
    if (fileIds !== undefined) {
      query.fileIds = fileIds;
    }
    if (params.fileName !== undefined) {
      query.fileName = params.fileName;
    }

    const response = await this.client.httpClient.post<MergeRecordFilesResponse>(
      `/live/v2/channel/recordFile/${params.channelId}/merge`,
      null,
      { params: query }
    );

    return response as unknown as MergeRecordFilesResponse;
  }

  /**
   * Add a VOD video to a channel playback library.
   */
  async addVodPlaybackToLibrary(
    params: AddVodPlaybackToLibraryParams
  ): Promise<AddVodPlaybackToLibraryResponse> {
    this.validateRequiredValue(params.channelId, 'channelId');
    this.validateRequiredValue(params.vid, 'vid');
    this.validateOptionalYn(params.setAsDefault, 'setAsDefault');

    const query: Record<string, unknown> = {
      channelId: params.channelId,
      vid: params.vid,
    };
    if (params.setAsDefault !== undefined) {
      query.setAsDefault = params.setAsDefault;
    }
    if (params.listType !== undefined) {
      query.listType = params.listType;
    }

    const response = await this.client.httpClient.post<AddVodPlaybackToLibraryResponse>(
      '/live/v3/channel/playback/add',
      null,
      { params: query }
    );

    return response as unknown as AddVodPlaybackToLibraryResponse;
  }

  /**
   * Delete historical recording files by session ID or start time.
   */
  async deleteRecordFile(params: DeleteRecordFileParams): Promise<void> {
    this.validateRequiredValue(params.channelId, 'channelId');

    if (!params.sessionId && !params.startTime) {
      throw PolyVValidationError.required('sessionId or startTime');
    }

    const query: Record<string, unknown> = {};
    if (params.sessionId !== undefined) {
      query.sessionId = params.sessionId;
    }
    if (params.startTime !== undefined) {
      query.startTime = params.startTime;
    }

    await this.client.httpClient.post(
      `/live/v2/channel/recordFile/${params.channelId}/delete-record`,
      null,
      { params: query }
    );
  }

  /**
   * Convert a historical recording file to VOD synchronously.
   */
  async convertRecordFileToVod(params: ConvertRecordFileToVodParams): Promise<ConvertRecordFileToVodResponse> {
    this.validateRequiredValue(params.channelId, 'channelId');
    this.validateRequiredValue(params.userId, 'userId');
    this.validateRequiredValue(params.fileName, 'fileName');
    this.validateOptionalYn(params.toPlayList, 'toPlayList');
    this.validateOptionalYn(params.setAsDefault, 'setAsDefault');

    const query: Record<string, unknown> = {
      userId: params.userId,
      fileName: params.fileName,
    };
    if (params.fileUrl !== undefined) {
      query.fileUrl = params.fileUrl;
    }
    if (params.sessionId !== undefined) {
      query.sessionId = params.sessionId;
    }
    if (params.cataid !== undefined) {
      query.cataid = params.cataid;
    }
    if (params.cataname !== undefined) {
      query.cataname = params.cataname;
    }
    if (params.toPlayList !== undefined) {
      query.toPlayList = params.toPlayList;
    }
    if (params.setAsDefault !== undefined) {
      query.setAsDefault = params.setAsDefault;
    }

    const response = await this.client.httpClient.post<ConvertRecordFileToVodResponse>(
      `/live/v2/channel/recordFile/${params.channelId}/convert`,
      null,
      { params: query }
    );

    return response as unknown as ConvertRecordFileToVodResponse;
  }

  /**
   * Set playback enabled by user scope.
   */
  async setUserPlaybackEnabled(params: SetUserPlaybackEnabledParams): Promise<SetUserPlaybackEnabledResponse> {
    this.validateRequiredValue(params.userId, 'userId');
    this.validateRequiredValue(params.playBackEnabled, 'playBackEnabled');
    this.validateOptionalYn(params.playBackEnabled, 'playBackEnabled');

    const query: Record<string, unknown> = { playBackEnabled: params.playBackEnabled };
    if (params.channelId !== undefined) {
      query.channelId = params.channelId;
    }

    const response = await this.client.httpClient.post<SetUserPlaybackEnabledResponse>(
      `/live/v2/channelSetting/${params.userId}/setPlayBackEnabled`,
      null,
      { params: query }
    );

    return response as unknown as SetUserPlaybackEnabledResponse;
  }

  /**
   * Move a playback or VOD video up/down.
   */
  async movePlaybackVideo(params: MovePlaybackVideoParams): Promise<void> {
    this.validateRequiredValue(params.channelId, 'channelId');
    this.validateRequiredValue(params.videoId, 'videoId');

    if (params.type !== 'up' && params.type !== 'down') {
      throw new PolyVValidationError(
        'type must be up or down',
        'type',
        params.type,
        { allowedValues: ['up', 'down'] }
      );
    }

    const query: Record<string, unknown> = {
      channelId: params.channelId,
      videoId: params.videoId,
      type: params.type,
    };
    if (params.listType !== undefined) {
      query.listType = params.listType;
    }

    await this.client.httpClient.post(
      '/live/v3/channel/playback/single-sort',
      null,
      { params: query }
    );
  }

  /**
   * Set the default playback or VOD video.
   */
  async setDefaultPlaybackVideo(params: SetDefaultPlaybackVideoParams): Promise<string> {
    this.validateRequiredValue(params.channelId, 'channelId');
    this.validateRequiredValue(params.videoId, 'videoId');

    const query: Record<string, unknown> = { videoId: params.videoId };
    if (params.listType !== undefined) {
      query.listType = params.listType;
    }

    const response = await this.client.httpClient.post<string>(
      `/live/v2/channel/recordFile/${params.channelId}/playback/set-Default`,
      null,
      { params: query }
    );

    return response as unknown as string;
  }

  /**
   * Sort playback or VOD videos with a complete ordered video ID list.
   */
  async sortPlaybackVideos(params: SortPlaybackVideosParams): Promise<void> {
    this.validateRequiredValue(params.channelId, 'channelId');
    if (!Array.isArray(params.videoIds) || params.videoIds.length === 0) {
      throw PolyVValidationError.required('videoIds');
    }

    const query: Record<string, unknown> = { channelId: params.channelId };
    if (params.listType !== undefined) {
      query.listType = params.listType;
    }

    await this.client.httpClient.post(
      '/live/v3/channel/playback/sort',
      { videoIds: params.videoIds },
      { params: query }
    );
  }

  /**
   * Get playback list
   *
   * Retrieves the list of playback videos in the channel's video library.
   *
   * @param channelId - The channel ID
   * @param options - Query options
   * @returns Paginated playback video list
   * @throws PolyVValidationError if channelId is empty
   *
   * @example
   * ```typescript
   * const list = await channelService.getPlaybackList('ch123456', { listType: 'playback', pageSize: 10 });
   * console.log(list.contents);
   * ```
   */
  async getPlaybackList(
    channelId: string,
    options?: PlaybackListRequest
  ): Promise<PlaybackListResponse> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }

    const params: Record<string, unknown> = {};
    if (options?.page !== undefined) {
      params.page = options.page;
    }
    if (options?.pageSize !== undefined) {
      params.pageSize = options.pageSize;
    }
    if (options?.listType !== undefined) {
      params.listType = options.listType;
    }
    if (options?.sessionIds !== undefined) {
      params.sessionIds = options.sessionIds;
    }
    if (options?.title !== undefined) {
      params.title = options.title;
    }

    const response = await this.client.httpClient.get<PlaybackListResponse>(
      `/live/v2/channel/recordFile/${channelId}/playback/list`,
      { params }
    );

    return response as unknown as PlaybackListResponse;
  }

  /**
   * Delete playback
   *
   * Deletes a video from the channel's playback video library.
   * Note: This only removes from the channel list, the video still exists in the VOD backend.
   *
   * @param channelId - The channel ID
   * @param videoId - The video ID to delete
   * @param listType - The list type (playback or vod)
   * @returns true if deletion was successful
   * @throws PolyVValidationError if required parameters are empty
   *
   * @example
   * ```typescript
   * await channelService.deletePlayback('ch123456', 'video123', 'playback');
   * ```
   */
  async deletePlayback(
    channelId: string,
    videoId: string,
    listType?: import('../types/channel.js').PlaybackListType
  ): Promise<boolean> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!videoId || videoId.trim() === '') {
      throw PolyVValidationError.required('videoId');
    }

    const params: Record<string, unknown> = { videoId };
    if (listType !== undefined) {
      params.listType = listType;
    }

    await this.client.httpClient.post<string>(
      `/live/v2/channel/recordFile/${channelId}/playback/delete`,
      null,
      { params }
    );

    return true;
  }

  /**
   * Get channel sessions
   *
   * Retrieves the list of live session information for a channel.
   *
   * @param channelId - The channel ID
   * @returns Array of channel sessions
   * @throws PolyVValidationError if channelId is empty
   *
   * @example
   * ```typescript
   * const sessions = await channelService.getChannelSessions('ch123456');
   * console.log(sessions[0].sessionId);
   * ```
   */
  async getChannelSessions(channelId: string): Promise<import('../types/channel.js').ChannelSession[]> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }

    const response = await this.client.httpClient.get<import('../types/channel.js').ChannelSession[]>(
      `/live/v2/channel/recordFile/${channelId}/sessions`
    );

    return response as unknown as import('../types/channel.js').ChannelSession[];
  }

  /**
   * Get record file
   *
   * Retrieves paginated list of recording files for a channel.
   *
   * @param channelId - The channel ID
   * @param options - Pagination options
   * @returns Paginated record file list
   * @throws PolyVValidationError if channelId is empty
   *
   * @example
   * ```typescript
   * const result = await channelService.getRecordFile('ch123456', { page: 1, pageSize: 10 });
   * console.log(result.contents);
   * ```
   */
  async getRecordFile(
    channelId: string,
    options?: import('../types/channel.js').RecordFileRequest
  ): Promise<import('../types/channel.js').RecordFileResponse> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }

    const params: Record<string, unknown> = { channelId };
    if (options?.page !== undefined) {
      params.page = options.page;
    }
    if (options?.pageSize !== undefined) {
      params.pageSize = options.pageSize;
    }

    const response = await this.client.httpClient.get<import('../types/channel.js').RecordFileResponse>(
      '/live/v3/channel/record/get',
      { params }
    );

    return response as unknown as import('../types/channel.js').RecordFileResponse;
  }

  /**
   * Get record info
   *
   * Retrieves information about a specific recording by session ID.
   *
   * @param channelId - The channel ID
   * @param sessionId - The session ID
   * @returns Record information
   * @throws PolyVValidationError if required parameters are empty
   *
   * @example
   * ```typescript
   * const info = await channelService.getRecordInfo('ch123456', 'session123');
   * console.log(info.fileId);
   * ```
   */
  async getRecordInfo(channelId: string, sessionId: string): Promise<import('../types/channel.js').RecordInfo> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!sessionId || sessionId.trim() === '') {
      throw PolyVValidationError.required('sessionId');
    }

    const response = await this.client.httpClient.get<import('../types/channel.js').RecordInfo>(
      '/live/v3/channel/record/info',
      { params: { channelId, sessionId } }
    );

    return response as unknown as import('../types/channel.js').RecordInfo;
  }

  /**
   * Delete record
   *
   * Deletes a recording from the channel's temporary storage.
   *
   * @param channelId - The channel ID
   * @param fileId - The file ID
   * @returns true if deletion was successful
   * @throws PolyVValidationError if required parameters are empty
   *
   * @example
   * ```typescript
   * await channelService.deleteRecord('ch123456', 'file123');
   * ```
   */
  async deleteRecord(channelId: string, fileId: string): Promise<boolean> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!fileId || fileId.trim() === '') {
      throw PolyVValidationError.required('fileId');
    }

    await this.client.httpClient.post<string>(
      '/live/v3/channel/record/delete',
      null,
      { params: { channelId, fileId } }
    );

    return true;
  }

  /**
   * Set record default
   *
   * Sets a video as the default playback video in the video library.
   *
   * @param channelId - The channel ID
   * @param fileId - The file ID
   * @returns true if operation was successful
   * @throws PolyVValidationError if required parameters are empty
   *
   * @example
   * ```typescript
   * await channelService.setRecordDefault('ch123456', 'file123');
   * ```
   */
  async setRecordDefault(channelId: string, fileId: string, listType?: 'playback' | 'vod'): Promise<boolean> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!fileId || fileId.trim() === '') {
      throw PolyVValidationError.required('fileId');
    }

    const params: Record<string, string> = { channelId, fileId };
    if (listType) {
      params.listType = listType;
    }

    await this.client.httpClient.post<string>(
      '/live/v3/channel/record/set-default',
      null,
      { params }
    );

    return true;
  }

  /**
   * Set record setting
   *
   * Updates the channel playback settings.
   *
   * @param channelId - The channel ID
   * @param options - Playback setting options
   * @returns true if operation was successful
   * @throws PolyVValidationError if channelId is empty
   *
   * @example
   * ```typescript
   * await channelService.setRecordSetting('ch123456', {
   *   enabled: true,
   *   type: 'video',
   * });
   * ```
   */
  async setRecordSetting(
    channelId: string,
    options: import('../types/channel.js').SetRecordSettingRequest
  ): Promise<boolean> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }

    const params: Record<string, unknown> = { channelId, ...options };

    await this.client.httpClient.post<boolean>(
      '/live/v3/channel/record/set-setting',
      null,
      { params }
    );

    return true;
  }

  /**
   * Get playback enabled
   *
   * Retrieves the playback enabled status for a channel.
   *
   * @param channelId - The channel ID
   * @returns Playback enabled status
   * @throws PolyVValidationError if channelId is empty
   *
   * @example
   * ```typescript
   * const result = await channelService.getPlaybackEnabled('ch123456');
   * console.log(result.enabled);
   * ```
   */
  async getPlaybackEnabled(channelId: string): Promise<import('../types/channel.js').PlaybackEnabledResponse> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }

    const response = await this.client.httpClient.get<import('../types/channel.js').PlaybackEnabledResponse>(
      '/live/v3/channel/playback/get-enabled',
      { params: { channelId } }
    );

    return response as unknown as import('../types/channel.js').PlaybackEnabledResponse;
  }

  /**
   * Set playback enabled
   *
   * Enables or disables playback for a channel.
   *
   * @param channelId - The channel ID
   * @param enabled - boolean to enable/disable
   * @returns true if operation was successful
   * @throws PolyVValidationError if required parameters are empty
   *
   * @example
   * ```typescript
   * await channelService.setPlaybackEnabled('ch123456', true);
   * ```
   */
  async setPlaybackEnabled(channelId: string, enabled: boolean): Promise<boolean> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }

    const params: Record<string, unknown> = {
      channelId,
      enabled: enabled ? 'Y' : 'N',
    };

    await this.client.httpClient.post<string>(
      '/live/v3/channel/playback/set-enabled',
      null,
      { params }
    );

    return true;
  }

  /**
   * Get playback setting
   *
   * Retrieves the playback settings for a channel.
   *
   * @param channelId - The channel ID
   * @returns Playback settings
   * @throws PolyVValidationError if channelId is empty
   *
   * @example
   * ```typescript
   * const settings = await channelService.getPlaybackSetting('ch123456');
   * console.log(settings.sortType, settings.autoPublish);
   * ```
   */
  async getPlaybackSetting(channelId: string): Promise<PlaybackSettingResponse> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }

    const response = await this.client.httpClient.get<PlaybackSettingResponse>(
      '/live/v3/channel/playback/get-setting',
      { params: { channelId } }
    );

    return response as unknown as PlaybackSettingResponse;
  }

  /**
   * Set playback setting (Story 9.7)
   *
   * Sets the playback settings for a channel.
   * API: POST /live/v3/channel/playback/set-setting
   *
   * @param channelId - The channel ID
   * @param options - Playback setting options
   * @returns true if operation was successful
   * @throws PolyVValidationError if channelId is empty
   *
   * @example
   * ```typescript
   * await channelService.setPlaybackSetting('ch123456', {
   *   playbackEnabled: 'Y',
   *   type: 'single',
   *   origin: 'playback',
   * });
   * ```
   */
  async setPlaybackSetting(
    channelId: string,
    options: import('../types/channel.js').SetPlaybackSettingRequest
  ): Promise<boolean> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }

    const params: Record<string, unknown> = { channelId, ...options };

    await this.client.httpClient.post<boolean>(
      '/live/v3/channel/playback/set-setting',
      null,
      { params }
    );

    return true;
  }

  /**
   * Set playback sort
   *
   * Sets the sort order for playback videos in the video library.
   *
   * @param channelId - The channel ID
   * @param videoIds - Array of video IDs in desired order
   * @returns true if operation was successful
   * @throws PolyVValidationError if required parameters are empty
   *
   * @example
   * ```typescript
   * await channelService.setPlaybackSort('ch123456', ['video1', 'video2', 'video3']);
   * ```
   */
  async setPlaybackSort(channelId: string, videoIds: string[]): Promise<boolean> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!videoIds || videoIds.length === 0) {
      throw PolyVValidationError.required('videoIds');
    }

    const body = { videoIds: videoIds.join(',') };

    await this.client.httpClient.post<string>(
      '/live/v3/channel/playback/set-sort',
      body,
      { params: { channelId } }
    );

    return true;
  }

  /**
   * Set playback single sort
   *
   * Sets the sort rank for a single playback video.
   *
   * @param channelId - The channel ID
   * @param videoId - The video ID
   * @param rank - The sort rank (higher value = higher priority)
   * @returns true if operation was successful
   * @throws PolyVValidationError if required parameters are empty
   *
   * @example
   * ```typescript
   * await channelService.setPlaybackSingleSort('ch123456', 'video123', 10);
   * ```
   */
  async setPlaybackSingleSort(channelId: string, videoId: string, rank: number): Promise<boolean> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!videoId || videoId.trim() === '') {
      throw PolyVValidationError.required('videoId');
    }

    await this.client.httpClient.post<string>(
      '/live/v3/channel/playback/set-single-sort',
      null,
      { params: { channelId, videoId, rank } }
    );

    return true;
  }

  /**
   * Update playback title
   *
   * Updates the title of a playback video.
   *
   * @param channelId - The channel ID
   * @param videoId - The video ID
   * @param title - The new title
   * @returns true if operation was successful
   * @throws PolyVValidationError if required parameters are empty
   *
   * @example
   * ```typescript
   * await channelService.updatePlaybackTitle('ch123456', 'video123', 'New Title');
   * ```
   */
  async updatePlaybackTitle(channelId: string, videoId: string, title: string): Promise<boolean> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!videoId || videoId.trim() === '') {
      throw PolyVValidationError.required('videoId');
    }
    if (!title || title.trim() === '') {
      throw PolyVValidationError.required('title');
    }

    await this.client.httpClient.post<string>(
      '/live/v3/channel/playback/update-title',
      null,
      { params: { channelId, videoId, title } }
    );

    return true;
  }

  /**
   * Add VOD playback
   *
   * Adds a VOD video to the channel's video library.
   *
   * @param channelId - The channel ID
   * @param options - VOD playback options
   * @returns true if operation was successful
   * @throws PolyVValidationError if required parameters are empty
   *
   * @example
   * ```typescript
   * await channelService.addVodPlayback('ch123456', {
   *   vid: 'vod123',
   *   title: 'My Video',
   * });
   * ```
   */
  async addVodPlayback(
    channelId: string,
    options: AddVodPlaybackRequest
  ): Promise<boolean> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!options.vid || options.vid.trim() === '') {
      throw PolyVValidationError.required('vid');
    }

    const params: Record<string, unknown> = { channelId, vid: options.vid };
    if (options.title !== undefined) {
      params.title = options.title;
    }
    if (options.cataid !== undefined) {
      params.cataid = options.cataid;
    }

    await this.client.httpClient.post<string>(
      '/live/v3/channel/playback/add-vod',
      null,
      { params }
    );

    return true;
  }

  /**
   * Clip record file
   *
   * Clips a recording file asynchronously.
   *
   * @param channelId - The channel ID
   * @param options - Clip options
   * @returns Clipped file information
   * @throws PolyVValidationError if required parameters are empty
   *
   * @example
   * ```typescript
   * const result = await channelService.clipRecordFile('ch123456', {
   *   fileId: 'file123',
   *   startTime: 0,
   *   endTime: 1800,
   * });
   * ```
   */
  async clipRecordFile(
    channelId: string,
    options: ClipRecordFileRequest
  ): Promise<import('../types/channel.js').ClipRecordFileResponse> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!options.fileId || options.fileId.trim() === '') {
      throw PolyVValidationError.required('fileId');
    }

    const params: Record<string, unknown> = { channelId, fileId: options.fileId };
    if (options.startTime !== undefined) {
      params.startTime = options.startTime;
    }
    if (options.endTime !== undefined) {
      params.endTime = options.endTime;
    }
    if (options.fileName !== undefined) {
      params.fileName = options.fileName;
    }
    if (options.callbackUrl !== undefined) {
      params.callbackUrl = options.callbackUrl;
    }

    const response = await this.client.httpClient.post<import('../types/channel.js').ClipRecordFileResponse>(
      '/live/v3/channel/record/clip',
      null,
      { params }
    );

    return response as unknown as import('../types/channel.js').ClipRecordFileResponse;
  }

  /**
   * Record convert (synchronous)
   *
   * Converts a recording file to VOD synchronously.
   *
   * @param channelId - The channel ID
   * @param options - Convert options
   * @returns Converted file information
   * @throws PolyVValidationError if required parameters are empty
   *
   * @example
   * ```typescript
   * const result = await channelService.recordConvert('ch123456', {
   *   fileId: 'file123',
   * });
   * ```
   */
  async recordConvert(
    channelId: string,
    options: import('../types/channel.js').RecordConvertRequest
  ): Promise<import('../types/channel.js').RecordConvertResponse> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!options.fileId || options.fileId.trim() === '') {
      throw PolyVValidationError.required('fileId');
    }

    const params: Record<string, unknown> = { channelId, fileId: options.fileId };
    if (options.fileName !== undefined) {
      params.fileName = options.fileName;
    }
    if (options.callbackUrl !== undefined) {
      params.callbackUrl = options.callbackUrl;
    }

    const response = await this.client.httpClient.post<import('../types/channel.js').RecordConvertResponse>(
      '/live/v3/channel/record/convert',
      null,
      { params }
    );

    return response as unknown as import('../types/channel.js').RecordConvertResponse;
  }

  /**
   * Record convert async
   *
   * Converts a recording file to VOD asynchronously.
   *
   * @param channelId - The channel ID
   * @param options - Convert options
   * @returns true if submitted successfully
   * @throws PolyVValidationError if required parameters are empty
   *
   * @example
   * ```typescript
   * const result = await channelService.recordConvertAsync('ch123456', {
   *   fileId: 'file123',
   * });
   * ```
   */
  async recordConvertAsync(
    channelId: string,
    options: import('../types/channel.js').RecordConvertRequest
  ): Promise<boolean> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!options.fileId || options.fileId.trim() === '') {
      throw PolyVValidationError.required('fileId');
    }

    const params: Record<string, unknown> = { channelId, fileId: options.fileId };
    if (options.fileName !== undefined) {
      params.fileName = options.fileName;
    }
    if (options.callbackUrl !== undefined) {
      params.callbackUrl = options.callbackUrl;
    }

    await this.client.httpClient.post<string>(
      '/live/v3/channel/record/convert-async',
      null,
      { params }
    );

    return true;
  }

  /**
   * Record file merge (synchronous)
   *
   * Merges multiple recording files synchronously.
   *
   * @param channelId - The channel ID
   * @param options - Merge options
   * @returns Merged file information
   * @throws PolyVValidationError if required parameters are empty
   *
   * @example
   * ```typescript
   * const result = await channelService.recordFileMerge('ch123456', {
   *   fileIds: ['file1', 'file2'],
   * });
   * ```
   */
  async recordFileMerge(
    channelId: string,
    options: import('../types/channel.js').RecordMergeArrayRequest
  ): Promise<import('../types/channel.js').RecordMergeResponse> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!options.fileIds || options.fileIds.length === 0) {
      throw PolyVValidationError.required('fileIds');
    }

    const params: Record<string, unknown> = {
      channelId,
      fileIds: options.fileIds.join(','),
    };
    if (options.fileName !== undefined) {
      params.fileName = options.fileName;
    }
    if (options.callbackUrl !== undefined) {
      params.callbackUrl = options.callbackUrl;
    }

    const response = await this.client.httpClient.post<import('../types/channel.js').RecordMergeResponse>(
      '/live/v3/channel/record/merge',
      null,
      { params }
    );

    return response as unknown as import('../types/channel.js').RecordMergeResponse;
  }

  /**
   * Record file merge async
   *
   * Merges multiple recording files asynchronously.
   *
   * @param channelId - The channel ID
   * @param options - Merge options
   * @returns true if submitted successfully
   * @throws PolyVValidationError if required parameters are empty
   *
   * @example
   * ```typescript
   * const result = await channelService.recordFileMergeAsync('ch123456', {
   *   fileIds: ['file1', 'file2'],
   * });
   * ```
   */
  async recordFileMergeAsync(
    channelId: string,
    options: import('../types/channel.js').RecordMergeArrayRequest
  ): Promise<boolean> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!options.fileIds || options.fileIds.length === 0) {
      throw PolyVValidationError.required('fileIds');
    }

    const params: Record<string, unknown> = {
      channelId,
      fileIds: options.fileIds.join(','),
    };
    if (options.fileName !== undefined) {
      params.fileName = options.fileName;
    }
    if (options.callbackUrl !== undefined) {
      params.callbackUrl = options.callbackUrl;
    }
    if (options.autoConvert !== undefined) {
      params.autoConvert = options.autoConvert;
    }
    if (options.mergeMp4 !== undefined) {
      params.mergeMp4 = options.mergeMp4;
    }
    if (options.orderByCustom !== undefined) {
      params.orderByCustom = options.orderByCustom;
    }

    await this.client.httpClient.post<string>(
      '/live/v3/channel/record/merge-async',
      null,
      { params }
    );

    return true;
  }

  /**
   * Record merge MP4
   *
   * Merges recording files to MP4 format.
   *
   * @param channelId - The channel ID
   * @param options - Merge options
   * @returns Merged MP4 URL
   * @throws PolyVValidationError if required parameters are empty
   *
   * @example
   * ```typescript
   * const result = await channelService.recordMergeMp4('ch123456', {
   *   fileIds: ['file1', 'file2'],
   * });
   * ```
   */
  async recordMergeMp4(
    channelId: string,
    options: import('../types/channel.js').RecordMergeArrayRequest
  ): Promise<import('../types/channel.js').RecordMergeResponse> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!options.fileIds || options.fileIds.length === 0) {
      throw PolyVValidationError.required('fileIds');
    }

    const params: Record<string, unknown> = {
      channelId,
      fileIds: options.fileIds.join(','),
    };
    if (options.fileName !== undefined) {
      params.fileName = options.fileName;
    }
    if (options.callbackUrl !== undefined) {
      params.callbackUrl = options.callbackUrl;
    }

    const response = await this.client.httpClient.post<import('../types/channel.js').RecordMergeResponse>(
      '/live/v3/channel/record/merge-mp4',
      null,
      { params }
    );

    return response as unknown as import('../types/channel.js').RecordMergeResponse;
  }

  /**
   * Record merge MP4 start
   *
   * Starts an asynchronous MP4 merge task.
   *
   * @param channelId - The channel ID
   * @param options - Merge options
   * @returns true if submitted successfully
   * @throws PolyVValidationError if required parameters are empty
   *
   * @example
   * ```typescript
   * const result = await channelService.recordMergeMp4Start('ch123456', {
   *   fileIds: ['file1', 'file2'],
   * });
   * ```
   */
  async recordMergeMp4Start(
    channelId: string,
    options: import('../types/channel.js').RecordMergeArrayRequest
  ): Promise<boolean> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!options.fileIds || options.fileIds.length === 0) {
      throw PolyVValidationError.required('fileIds');
    }

    const params: Record<string, unknown> = {
      channelId,
      fileIds: options.fileIds.join(','),
    };
    if (options.fileName !== undefined) {
      params.fileName = options.fileName;
    }
    if (options.callbackUrl !== undefined) {
      params.callbackUrl = options.callbackUrl;
    }

    await this.client.httpClient.post<string>(
      '/live/v3/channel/record/merge-mp4-start',
      null,
      { params }
    );

    return true;
  }

  /**
   * Record add breakpoint
   *
   * Adds a breakpoint to a live session recording.
   *
   * @param channelId - The channel ID
   * @param options - Breakpoint options
   * @returns true if operation was successful
   * @throws PolyVValidationError if required parameters are empty
   *
   * @example
   * ```typescript
   * await channelService.recordAddBreakpoint('ch123456', {
   *   fileId: 'file123',
   *   time: 60,
   * });
   * ```
   */
  async recordAddBreakpoint(
    channelId: string,
    options: RecordAddBreakpointRequest
  ): Promise<boolean> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!options.fileId || options.fileId.trim() === '') {
      throw PolyVValidationError.required('fileId');
    }

    await this.client.httpClient.post<string>(
      '/live/v3/channel/record/add-breakpoint',
      null,
      { params: { channelId, fileId: options.fileId, time: options.time } }
    );

    return true;
  }

  // ============================================
  // Player APIs (Story 2-4)
  // ============================================

  /**
   * Update player logo
   *
   * Updates the player logo settings for a channel.
   *
   * @param channelId - The channel ID
   * @param options - Logo settings
   * @returns true if operation was successful
   * @throws PolyVValidationError if channelId is empty
   *
   * @example
   * ```typescript
   * await channelService.updatePlayerLogo('ch123456', {
   *   logoImage: 'https://example.com/logo.png',
   *   logoOpacity: 80,
   *   logoPosition: 'top-left',
   * });
   * ```
   */
  async updatePlayerLogo(channelId: string, options: PlayerLogoSettings): Promise<boolean> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }

    const params: Record<string, unknown> = {};
    if (options.logoImage !== undefined) {
      params.logoImage = options.logoImage;
    }
    if (options.logoOpacity !== undefined) {
      params.logoOpacity = options.logoOpacity;
    }
    if (options.logoPosition !== undefined) {
      params.logoPosition = options.logoPosition;
    }
    if (options.logoHref !== undefined) {
      params.logoHref = options.logoHref;
    }

    await this.client.httpClient.post<string>(
      `/live/v2/channels/${channelId}/update`,
      null,
      { params }
    );

    return true;
  }

  /**
   * Update player head
   *
   * Updates the player head image settings for a channel.
   *
   * @param channelId - The channel ID
   * @param options - Head image settings
   * @returns true if operation was successful
   * @throws PolyVValidationError if channelId is empty
   *
   * @example
   * ```typescript
   * await channelService.updatePlayerHead('ch123456', {
   *   headImage: 'https://example.com/head.png',
   * });
   * ```
   */
  async updatePlayerHead(channelId: string, options: PlayerHeadSettings): Promise<boolean> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }

    const params: Record<string, unknown> = {};
    if (options.headImage !== undefined) {
      params.headImage = options.headImage;
    }
    if (options.headImageHref !== undefined) {
      params.headImageHref = options.headImageHref;
    }

    await this.client.httpClient.post<string>(
      `/live/v2/channels/${channelId}/update`,
      null,
      { params }
    );

    return true;
  }

  /**
   * Update player stop
   *
   * Updates the player stop image settings for a channel.
   *
   * @param channelId - The channel ID
   * @param options - Stop image settings
   * @returns true if operation was successful
   * @throws PolyVValidationError if channelId is empty
   *
   * @example
   * ```typescript
   * await channelService.updatePlayerStop('ch123456', {
   *   stopImage: 'https://example.com/stop.png',
   * });
   * ```
   */
  async updatePlayerStop(channelId: string, options: PlayerStopSettings): Promise<boolean> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }

    const params: Record<string, unknown> = {};
    if (options.stopImage !== undefined) {
      params.stopImage = options.stopImage;
    }
    if (options.stopImageHref !== undefined) {
      params.stopImageHref = options.stopImageHref;
    }

    await this.client.httpClient.post<string>(
      `/live/v2/channels/${channelId}/update`,
      null,
      { params }
    );

    return true;
  }

  // ============================================
  // Statistics APIs (Story 2-5)
  // ============================================

  /**
   * Get product click statistics
   *
   * Queries product click statistics for a channel.
   *
   * @param options - Query options including channelId (required)
   * @returns Paginated list of product click statistics
   * @throws PolyVValidationError if channelId is empty
   *
   * @example
   * ```typescript
   * const result = await channelService.getProductClickStats({
   *   channelId: 'ch123456',
   *   startTime: Date.now() - 7 * 24 * 60 * 60 * 1000,
   *   endTime: Date.now(),
   * });
   * ```
   */
  async getProductClickStats(
    options: GetProductClickStatsRequest
  ): Promise<GetProductClickStatsResponse> {
    if (!options.channelId || options.channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }

    const params: Record<string, unknown> = { channelId: options.channelId };
    if (options.sessionId !== undefined) {
      params.sessionId = options.sessionId;
    }
    if (options.startTime !== undefined) {
      params.startTime = options.startTime;
    }
    if (options.endTime !== undefined) {
      params.endTime = options.endTime;
    }
    if (options.pageNumber !== undefined) {
      params.pageNumber = options.pageNumber;
    }
    if (options.pageSize !== undefined) {
      params.pageSize = options.pageSize;
    }

    const response = await this.client.httpClient.get<GetProductClickStatsResponse>(
      '/live/v4/channel/product/click',
      { params }
    );

    return response as unknown as GetProductClickStatsResponse;
  }

  /**
   * Get product list statistics
   *
   * Queries product list click statistics for a channel.
   *
   * @param options - Query options including channelId (required)
   * @returns Paginated list of product list statistics
   * @throws PolyVValidationError if channelId is empty
   *
   * @example
   * ```typescript
   * const result = await channelService.getProductListStats({
   *   channelId: 'ch123456',
   *   pageNumber: 1,
   *   pageSize: 20,
   * });
   * ```
   */
  async getProductListStats(
    options: GetProductListStatsRequest
  ): Promise<GetProductListStatsResponse> {
    if (!options.channelId || options.channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }

    const params: Record<string, unknown> = { channelId: options.channelId };
    if (options.sessionId !== undefined) {
      params.sessionId = options.sessionId;
    }
    if (options.startTime !== undefined) {
      params.startTime = options.startTime;
    }
    if (options.endTime !== undefined) {
      params.endTime = options.endTime;
    }
    if (options.pageNumber !== undefined) {
      params.pageNumber = options.pageNumber;
    }
    if (options.pageSize !== undefined) {
      params.pageSize = options.pageSize;
    }

    const response = await this.client.httpClient.get<GetProductListStatsResponse>(
      '/live/v4/channel/product/click/product-list',
      { params }
    );

    return response as unknown as GetProductListStatsResponse;
  }

  /**
   * Get red packet statistics
   *
   * Queries red packet distribution statistics for a channel.
   *
   * @param options - Query options including channelId (required)
   * @returns Paginated list of red packet statistics
   * @throws PolyVValidationError if channelId is empty
   *
   * @example
   * ```typescript
   * const result = await channelService.getRedpackStats({
   *   channelId: 'ch123456',
   *   sessionId: 'session123',
   * });
   * ```
   */
  async getRedpackStats(
    options: GetRedpackStatsRequest
  ): Promise<GetRedpackStatsResponse> {
    if (!options.channelId || options.channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }

    const params: Record<string, unknown> = { channelId: options.channelId };
    if (options.sessionId !== undefined) {
      params.sessionId = options.sessionId;
    }
    if (options.startTime !== undefined) {
      params.startTime = options.startTime;
    }
    if (options.endTime !== undefined) {
      params.endTime = options.endTime;
    }
    if (options.pageNumber !== undefined) {
      params.pageNumber = options.pageNumber;
    }
    if (options.pageSize !== undefined) {
      params.pageSize = options.pageSize;
    }

    const response = await this.client.httpClient.get<GetRedpackStatsResponse>(
      '/live/v4/channel/red-pack/statistics/list',
      { params }
    );

    return response as unknown as GetRedpackStatsResponse;
  }

  // ============================================
  // ViewData APIs (Story 2-5)
  // ============================================

  /**
   * Get channel summary statistics
   *
   * Queries live viewing statistics for a channel within a date range.
   *
   * @param channelId - The channel ID (required)
   * @param options - Query options including startDay and endDay (required)
   * @returns Array of daily summary statistics
   * @throws PolyVValidationError if channelId, startDay, or endDay is empty
   *
   * @example
   * ```typescript
   * const result = await channelService.getSummary('ch123456', {
   *   startDay: '2024-01-01',
   *   endDay: '2024-01-31',
   * });
   * ```
   */
  async getSummary(
    channelId: string,
    options: { startDay: string; endDay: string }
  ): Promise<ChannelSummaryItem[]> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!options.startDay || options.startDay.trim() === '') {
      throw PolyVValidationError.required('startDay');
    }
    if (!options.endDay || options.endDay.trim() === '') {
      throw PolyVValidationError.required('endDay');
    }

    const response = await this.client.httpClient.get<ChannelSummaryItem[]>(
      `/live/v2/statistics/${channelId}/summary`,
      { params: { startDay: options.startDay, endDay: options.endDay } }
    );

    return response as unknown as ChannelSummaryItem[];
  }

  /**
   * Get daily summary statistics
   *
   * Queries daily viewing statistics for a channel within a date range.
   *
   * @param options - Query options including channelId, startDay, endDay (all required)
   * @returns Array of daily summary statistics
   * @throws PolyVValidationError if required parameters are empty
   *
   * @example
   * ```typescript
   * const result = await channelService.getDailySummary({
   *   channelId: 'ch123456',
   *   startDay: '2024-01-01',
   *   endDay: '2024-01-31',
   * });
   * ```
   */
  async getDailySummary(options: {
    channelId: string;
    startDay: string;
    endDay: string;
  }): Promise<DailySummaryItem[]> {
    if (!options.channelId || options.channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!options.startDay || options.startDay.trim() === '') {
      throw PolyVValidationError.required('startDay');
    }
    if (!options.endDay || options.endDay.trim() === '') {
      throw PolyVValidationError.required('endDay');
    }

    const response = await this.client.httpClient.get<DailySummaryItem[]>(
      '/live/v3/channel/statistics/daily/summary',
      { params: { channelId: options.channelId, startDay: options.startDay, endDay: options.endDay } }
    );

    return response as unknown as DailySummaryItem[];
  }

  /**
   * Get channel play summary statistics
   *
   * Queries overview statistics for multiple channels within a date range.
   *
   * @param userId - The user ID (required)
   * @param options - Query options including startDate and endDate (required)
   * @returns Array of channel play summary statistics
   * @throws PolyVValidationError if userId is empty
   *
   * @example
   * ```typescript
   * const result = await channelService.getChannelPlaySummary('user123', {
   *   startDate: '2024-01-01',
   *   endDate: '2024-01-31',
   *   channelIds: 'ch123456,ch789012',
   * });
   * ```
   */
  async getChannelPlaySummary(
    userId: string,
    options: { startDate: string; endDate: string; channelIds?: string }
  ): Promise<ChannelPlaySummaryItem[]> {
    if (!userId || userId.trim() === '') {
      throw PolyVValidationError.required('userId');
    }
    if (!options.startDate || options.startDate.trim() === '') {
      throw PolyVValidationError.required('startDate');
    }
    if (!options.endDate || options.endDate.trim() === '') {
      throw PolyVValidationError.required('endDate');
    }

    const params: Record<string, unknown> = {
      startDate: options.startDate,
      endDate: options.endDate,
    };
    if (options.channelIds !== undefined) {
      params.channelIds = options.channelIds;
    }

    const response = await this.client.httpClient.post<ChannelPlaySummaryItem[]>(
      `/live/v2/statistics/${userId}/channel_summary`,
      null,
      { params }
    );

    return response as unknown as ChannelPlaySummaryItem[];
  }

  /**
   * Get channel statistic data
   *
   * Queries backend channel statistics for a date range.
   *
   * @param options - Query options including channelId, startDate, endDate (all required)
   * @returns Channel statistic data
   * @throws PolyVValidationError if required parameters are empty
   *
   * @example
   * ```typescript
   * const result = await channelService.getChannelStatistic({
   *   channelId: 'ch123456',
   *   startDate: '2024-01-01',
   *   endDate: '2024-01-31',
   * });
   * ```
   */
  async getChannelStatistic(options: {
    channelId: string;
    startDate: string;
    endDate: string;
  }): Promise<ChannelStatisticData> {
    if (!options.channelId || options.channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!options.startDate || options.startDate.trim() === '') {
      throw PolyVValidationError.required('startDate');
    }
    if (!options.endDate || options.endDate.trim() === '') {
      throw PolyVValidationError.required('endDate');
    }

    const response = await this.client.httpClient.get<ChannelStatisticData>(
      '/live/v4/channel/statistics/channel-statistic',
      { params: { channelId: options.channelId, startDate: options.startDate, endDate: options.endDate } }
    );

    return response as unknown as ChannelStatisticData;
  }

  /**
   * Get concurrency data
   *
   * Queries historical concurrency data for a channel within a date range.
   *
   * @param options - Query options including channelId, startDate, endDate (all required)
   * @returns Array of concurrency data points
   * @throws PolyVValidationError if required parameters are empty
   *
   * @example
   * ```typescript
   * const result = await channelService.getConcurrency({
   *   channelId: 'ch123456',
   *   startDate: '2024-01-01',
   *   endDate: '2024-01-31',
   * });
   * ```
   */
  async getConcurrency(options: {
    channelId: string;
    startDate: string;
    endDate: string;
  }): Promise<ConcurrencyDataItem[]> {
    if (!options.channelId || options.channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!options.startDate || options.startDate.trim() === '') {
      throw PolyVValidationError.required('startDate');
    }
    if (!options.endDate || options.endDate.trim() === '') {
      throw PolyVValidationError.required('endDate');
    }

    const response = await this.client.httpClient.get<ConcurrencyDataItem[]>(
      '/live/v3/channel/statistics/concurrence',
      { params: { channelId: options.channelId, startDate: options.startDate, endDate: options.endDate } }
    );

    return response as unknown as ConcurrencyDataItem[];
  }

  /**
   * Get max history concurrent viewers
   *
   * Queries the maximum historical concurrent viewers for a channel within a time range.
   *
   * @param options - Query options including channelId, startTime, endTime (all required)
   * @returns Maximum concurrent viewer count
   * @throws PolyVValidationError if required parameters are empty
   *
   * @example
   * ```typescript
   * const maxConcurrent = await channelService.getMaxHistoryConcurrent({
   *   channelId: 'ch123456',
   *   startTime: Date.now() - 90 * 24 * 60 * 60 * 1000,
   *   endTime: Date.now(),
   * });
   * ```
   */
  async getMaxHistoryConcurrent(options: {
    channelId: string;
    startTime: number;
    endTime: number;
  }): Promise<number> {
    if (!options.channelId || options.channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }

    const response = await this.client.httpClient.get<number>(
      '/live/v3/channel/statistics/get-max-history-concurrent',
      { params: { channelId: options.channelId, startTime: options.startTime, endTime: options.endTime } }
    );

    return response as unknown as number;
  }

  /**
   * Get realtime viewers
   *
   * Queries realtime viewer count for multiple channels.
   *
   * @param options - Query options including channelIds (required, comma-separated)
   * @returns Array of realtime viewer data points
   * @throws PolyVValidationError if channelIds is empty
   *
   * @example
   * ```typescript
   * const result = await channelService.getRealtimeViewers({
   *   channelIds: 'ch123456,ch789012',
   * });
   * ```
   */
  async getRealtimeViewers(options: { channelIds: string }): Promise<RealtimeViewerDataItem[]> {
    if (!options.channelIds || options.channelIds.trim() === '') {
      throw PolyVValidationError.required('channelIds');
    }

    const response = await this.client.httpClient.get<RealtimeViewerDataItem[]>(
      '/live/v2/statistics/get-realtime-viewers',
      { params: { channelIds: options.channelIds } }
    );

    return response as unknown as RealtimeViewerDataItem[];
  }

  /**
   * Get session statistics
   *
   * Queries multi-session overview statistics for a channel.
   *
   * @param options - Query options including channelId (required), and either sessionIds or startTime/endTime
   * @returns Session statistics response with list of session data
   * @throws PolyVValidationError if channelId is empty
   *
   * @example
   * ```typescript
   * const result = await channelService.getSessionStats({
   *   channelId: 'ch123456',
   *   startTime: Date.now() - 30 * 24 * 60 * 60 * 1000,
   *   endTime: Date.now(),
   * });
   * ```
   */
  async getSessionStats(options: {
    channelId: string;
    sessionIds?: string;
    startTime?: number;
    endTime?: number;
  }): Promise<SessionStatsResponse> {
    if (!options.channelId || options.channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }

    const params: Record<string, unknown> = { channelId: options.channelId };
    if (options.sessionIds !== undefined) {
      params.sessionIds = options.sessionIds;
    }
    if (options.startTime !== undefined) {
      params.startTime = options.startTime;
    }
    if (options.endTime !== undefined) {
      params.endTime = options.endTime;
    }

    const response = await this.client.httpClient.get<SessionStatsResponse>(
      '/live/v3/channel/statistics/get-session-stats',
      { params }
    );

    return response as unknown as SessionStatsResponse;
  }

  /**
   * Get realtime viewers V1
   *
   * Queries realtime viewer count for a channel using V1 API.
   *
   * @param channelId - The channel ID (required)
   * @param userId - The user ID (required)
   * @returns Array of realtime viewer data points
   * @throws PolyVValidationError if channelId or userId is empty
   *
   * @example
   * ```typescript
   * const result = await channelService.getRealtimeViewersV1('ch123456', 'user123');
   * ```
   */
  async getRealtimeViewersV1(channelId: string, userId: string): Promise<RealtimeViewerV1Item[]> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!userId || userId.trim() === '') {
      throw PolyVValidationError.required('userId');
    }

    const response = await this.client.httpClient.get<RealtimeViewerV1Item[]>(
      `/live/v1/statistics/${channelId}/realtime`,
      { params: { userId } }
    );

    return response as unknown as RealtimeViewerV1Item[];
  }

  /**
   * Get viewlog page
   *
   * Queries paginated viewing log data for a channel.
   *
   * @param channelId - The channel ID (required)
   * @param options - Query options (currentDay or startTime/endTime required)
   * @returns Paginated viewlog response
   * @throws PolyVValidationError if channelId is empty
   *
   * @example
   * ```typescript
   * const result = await channelService.getViewlogPage('ch123456', {
   *   currentDay: '2024-01-01',
   *   page: 1,
   *   pageSize: 100,
   * });
   * ```
   */
  async getViewlogPage(
    channelId: string,
    options?: {
      currentDay?: string;
      page?: number;
      pageSize?: number;
      startTime?: number;
      endTime?: number;
      param1?: string;
      param2?: string;
      param3?: string;
      viewLogType?: string;
      sessionIds?: string;
    }
  ): Promise<GetViewlogPageResponse> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }

    const params: Record<string, unknown> = {};
    if (options?.currentDay !== undefined) {
      params.currentDay = options.currentDay;
    }
    if (options?.page !== undefined) {
      params.page = options.page;
    }
    if (options?.pageSize !== undefined) {
      params.pageSize = options.pageSize;
    }
    if (options?.startTime !== undefined) {
      params.startTime = options.startTime;
    }
    if (options?.endTime !== undefined) {
      params.endTime = options.endTime;
    }
    if (options?.param1 !== undefined) {
      params.param1 = options.param1;
    }
    if (options?.param2 !== undefined) {
      params.param2 = options.param2;
    }
    if (options?.param3 !== undefined) {
      params.param3 = options.param3;
    }
    if (options?.viewLogType !== undefined) {
      params.viewLogType = options.viewLogType;
    }
    if (options?.sessionIds !== undefined) {
      params.sessionIds = options.sessionIds;
    }

    const response = await this.client.httpClient.get<GetViewlogPageResponse>(
      `/live/v2/statistics/${channelId}/viewlog/page`,
      { params }
    );

    return response as unknown as GetViewlogPageResponse;
  }

  /**
   * Get viewlog V1
   *
   * Queries viewing log data using V1 API.
   *
   * @param channelId - The channel ID (required)
   * @param options - Query options including currentDay and userId (required)
   * @returns Array of viewlog items
   * @throws PolyVValidationError if channelId, currentDay, or userId is empty
   *
   * @example
   * ```typescript
   * const result = await channelService.getViewlogV1('ch123456', {
   *   currentDay: '2024-01-01',
   *   userId: 'user123',
   * });
   * ```
   */
  async getViewlogV1(
    channelId: string,
    options: { currentDay: string; userId: string; param1?: string }
  ): Promise<UserViewlogItem[]> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!options.currentDay || options.currentDay.trim() === '') {
      throw PolyVValidationError.required('currentDay');
    }
    if (!options.userId || options.userId.trim() === '') {
      throw PolyVValidationError.required('userId');
    }

    const params: Record<string, unknown> = {
      currentDay: options.currentDay,
      userId: options.userId,
    };
    if (options.param1 !== undefined) {
      params.param1 = options.param1;
    }

    const response = await this.client.httpClient.get<UserViewlogItem[]>(
      `/live/v1/statistics/${channelId}/viewlog`,
      { params }
    );

    return response as unknown as UserViewlogItem[];
  }

  /**
   * Get user viewlog
   *
   * Queries paginated viewing log data for an account.
   *
   * @param options - Query options including startDate and endDate (required)
   * @returns Paginated user viewlog response
   * @throws PolyVValidationError if startDate or endDate is empty
   *
   * @example
   * ```typescript
   * const result = await channelService.getUserViewlog({
   *   startDate: '2024-01-01 00:00:00',
   *   endDate: '2024-01-31 23:59:59',
   *   channelId: 'ch123456',
   *   watchType: 'live',
   * });
   * ```
   */
  async getUserViewlog(options: {
    startDate: string;
    endDate: string;
    channelId?: string;
    watchType?: string;
    page?: number;
    pageSize?: number;
  }): Promise<GetUserViewlogResponse> {
    if (!options.startDate || options.startDate.trim() === '') {
      throw PolyVValidationError.required('startDate');
    }
    if (!options.endDate || options.endDate.trim() === '') {
      throw PolyVValidationError.required('endDate');
    }

    const params: Record<string, unknown> = {
      startDate: options.startDate,
      endDate: options.endDate,
    };
    if (options.channelId !== undefined) {
      params.channelId = options.channelId;
    }
    if (options.watchType !== undefined) {
      params.watchType = options.watchType;
    }
    if (options.page !== undefined) {
      params.page = options.page;
    }
    if (options.pageSize !== undefined) {
      params.pageSize = options.pageSize;
    }

    const response = await this.client.httpClient.get<GetUserViewlogResponse>(
      '/live/v3/user/statistics/viewlog',
      { params }
    );

    return response as unknown as GetUserViewlogResponse;
  }

  /**
   * Get mic detail list
   *
   * Queries mic usage details for channels.
   *
   * @param options - Query options
   * @returns Paginated mic detail list
   *
   * @example
   * ```typescript
   * const result = await channelService.getMicDetailList({
   *   channelIds: 'ch123456',
   *   startDay: '2024-01-01',
   *   endDay: '2024-01-31',
   * });
   * ```
   */
  async getMicDetailList(options?: {
    page?: number;
    size?: number;
    channelIds?: string;
    startDay?: string;
    endDay?: string;
  }): Promise<GetMicDetailListResponse> {
    const params: Record<string, unknown> = {};
    if (options?.page !== undefined) {
      params.page = options.page;
    }
    if (options?.size !== undefined) {
      params.size = options.size;
    }
    if (options?.channelIds !== undefined) {
      params.channelIds = options.channelIds;
    }
    if (options?.startDay !== undefined) {
      params.startDay = options.startDay;
    }
    if (options?.endDay !== undefined) {
      params.endDay = options.endDay;
    }

    const response = await this.client.httpClient.get<GetMicDetailListResponse>(
      '/live/v3/channel/statistics/mic/list',
      { params }
    );

    return response as unknown as GetMicDetailListResponse;
  }

  /**
   * Get link mic detail list
   *
   * Queries link mic detail data for a channel within a date range.
   *
   * @param options - Query options including channelId, startDate, endDate (all required)
   * @returns Link mic detail list response
   * @throws PolyVValidationError if required parameters are empty
   *
   * @example
   * ```typescript
   * const result = await channelService.getLinkMicDetailList({
   *   channelId: 'ch123456',
   *   startDate: '2024-01-01',
   *   endDate: '2024-01-31',
   * });
   * ```
   */
  async getLinkMicDetailList(options: {
    channelId: string;
    startDate: string;
    endDate: string;
    page?: number;
    pageSize?: number;
  }): Promise<GetLinkMicDetailListResponse> {
    if (!options.channelId || options.channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!options.startDate || options.startDate.trim() === '') {
      throw PolyVValidationError.required('startDate');
    }
    if (!options.endDate || options.endDate.trim() === '') {
      throw PolyVValidationError.required('endDate');
    }

    const params: Record<string, unknown> = {
      channelId: options.channelId,
      startDate: options.startDate,
      endDate: options.endDate,
    };
    if (options.page !== undefined) {
      params.page = options.page;
    }
    if (options.pageSize !== undefined) {
      params.pageSize = options.pageSize;
    }

    const response = await this.client.httpClient.get<GetLinkMicDetailListResponse>(
      '/live/v3/channel/mic/log/list-detail',
      { params }
    );

    return response as unknown as GetLinkMicDetailListResponse;
  }

  // ============================================
  // Additional ViewData APIs (Code Review Fixes)
  // ============================================

  /**
   * Get realviewers (AC13)
   *
   * Queries real viewers count for a channel.
   *
   * @param channelId - The channel ID (required)
   * @param options - Query options including currentDay (required)
   * @returns Array of realviewers data
   * @throws PolyVValidationError if channelId or currentDay is empty
   *
   * @example
   * ```typescript
   * const result = await channelService.getRealviewers('ch123456', {
   *   currentDay: '2024-01-01',
   * });
   * ```
   */
  async getRealviewers(
    channelId: string,
    options: { currentDay: string }
  ): Promise<RealviewersDataItem[]> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!options.currentDay || options.currentDay.trim() === '') {
      throw PolyVValidationError.required('currentDay');
    }

    const response = await this.client.httpClient.get<RealviewersDataItem[]>(
      `/live/v2/statistics/${channelId}/realviewers`,
      { params: { currentDay: options.currentDay } }
    );

    return response as unknown as RealviewersDataItem[];
  }

  /**
   * Get view summary (AC14)
   *
   * Alias for getSummary method. Queries live viewing statistics for a channel within a date range.
   *
   * @param channelId - The channel ID (required)
   * @param options - Query options including startDay and endDay (required)
   * @returns Array of daily summary statistics
   * @throws PolyVValidationError if channelId, startDay, or endDay is empty
   *
   * @example
   * ```typescript
   * const result = await channelService.getViewSummary('ch123456', {
   *   startDay: '2024-01-01',
   *   endDay: '2024-01-31',
   * });
   * ```
   */
  async getViewSummary(
    channelId: string,
    options: { startDay: string; endDay: string }
  ): Promise<ChannelSummaryItem[]> {
    return this.getSummary(channelId, options);
  }

  /**
   * Get viewlog V2 (AC15)
   *
   * Queries viewing log data using V2 API.
   *
   * @param channelId - The channel ID (required)
   * @param options - Query options including currentDay (required)
   * @returns Array of viewlog items
   * @throws PolyVValidationError if channelId or currentDay is empty
   *
   * @example
   * ```typescript
   * const result = await channelService.getViewlog2('ch123456', {
   *   currentDay: '2024-01-01',
   *   page: 1,
   *   pageSize: 100,
   * });
   * ```
   */
  async getViewlog2(
    channelId: string,
    options: { currentDay: string; page?: number; pageSize?: number }
  ): Promise<ViewlogV2Item[]> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!options.currentDay || options.currentDay.trim() === '') {
      throw PolyVValidationError.required('currentDay');
    }

    const params: Record<string, unknown> = {
      currentDay: options.currentDay,
    };
    if (options.page !== undefined) {
      params.page = options.page;
    }
    if (options.pageSize !== undefined) {
      params.pageSize = options.pageSize;
    }

    const response = await this.client.httpClient.get<ViewlogV2Item[]>(
      `/live/v2/statistics/${channelId}/viewlog`,
      { params }
    );

    return response as unknown as ViewlogV2Item[];
  }

  /**
   * Get viewlog page V3 (AC16)
   *
   * Queries paginated viewing log data using V3 API.
   *
   * @param channelId - The channel ID (required)
   * @param options - Query options
   * @returns Paginated viewlog response
   * @throws PolyVValidationError if channelId is empty
   *
   * @example
   * ```typescript
   * const result = await channelService.getViewlogPageV3('ch123456', {
   *   currentDay: '2024-01-01',
   *   page: 1,
   *   pageSize: 100,
   * });
   * ```
   */
  async getViewlogPageV3(
    channelId: string,
    options?: {
      currentDay?: string;
      page?: number;
      pageSize?: number;
      startTime?: number;
      endTime?: number;
      param1?: string;
      param2?: string;
      param3?: string;
    }
  ): Promise<GetViewlogPageV3Response> {
    if (!channelId || channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }

    const params: Record<string, unknown> = {};
    if (options?.currentDay !== undefined) {
      params.currentDay = options.currentDay;
    }
    if (options?.page !== undefined) {
      params.page = options.page;
    }
    if (options?.pageSize !== undefined) {
      params.pageSize = options.pageSize;
    }
    if (options?.startTime !== undefined) {
      params.startTime = options.startTime;
    }
    if (options?.endTime !== undefined) {
      params.endTime = options.endTime;
    }
    if (options?.param1 !== undefined) {
      params.param1 = options.param1;
    }
    if (options?.param2 !== undefined) {
      params.param2 = options.param2;
    }
    if (options?.param3 !== undefined) {
      params.param3 = options.param3;
    }

    const response = await this.client.httpClient.get<GetViewlogPageV3Response>(
      `/live/v3/statistics/${channelId}/viewlog`,
      { params }
    );

    return response as unknown as GetViewlogPageV3Response;
  }

  // ============================================
  // Story 2-6: Marquee, Session, State, Warmup APIs
  // ============================================

  // --------------------------------------------
  // Marquee APIs (AC1)
  // --------------------------------------------

  /**
   * Set DIY URL marquee (AC1)
   *
   * Sets or disables the DIY URL marquee for a channel.
   *
   * @param options - Marquee options including channelId, marqueeRestrict, and optional url
   * @returns The API response string
   * @throws PolyVValidationError if channelId or marqueeRestrict is empty, or if url is empty when marqueeRestrict is 'Y'
   *
   * @example
   * ```typescript
   * // Enable marquee
   * const result = await channelService.setDiyUrlMarquee({
   *   channelId: 'ch123456',
   *   marqueeRestrict: 'Y',
   *   url: 'https://example.com/marquee',
   * });
   *
   * // Disable marquee
   * const result = await channelService.setDiyUrlMarquee({
   *   channelId: 'ch123456',
   *   marqueeRestrict: 'N',
   * });
   * ```
   */
  async setDiyUrlMarquee(options: SetDiyUrlMarqueeRequest): Promise<string> {
    if (!options.channelId || options.channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!options.marqueeRestrict || options.marqueeRestrict.trim() === '') {
      throw PolyVValidationError.required('marqueeRestrict');
    }
    if (options.marqueeRestrict === 'Y' && (!options.url || options.url.trim() === '')) {
      throw PolyVValidationError.required('url');
    }

    const params: Record<string, unknown> = {
      marqueeRestrict: options.marqueeRestrict,
    };
    if (options.url) {
      params.url = options.url;
    }

    const response = await this.client.httpClient.get<string>(
      `/live/v2/channelRestrict/${options.channelId}/set-diyurl-marquee`,
      { params }
    );

    return response as unknown as string;
  }

  // --------------------------------------------
  // Session APIs (AC2-AC6)
  // --------------------------------------------

  /**
   * Get session data list (AC2)
   *
   * Queries session data list for a channel with optional date range and pagination.
   *
   * @param options - Query options including channelId (required)
   * @returns Paginated list of session data
   * @throws PolyVValidationError if channelId is empty
   *
   * @example
   * ```typescript
   * const result = await channelService.getSessionDataList({
   *   channelId: 'ch123456',
   *   startDate: '2024-01-01',
   *   endDate: '2024-01-31',
   *   page: 1,
   *   pageSize: 10,
   * });
   * ```
   */
  async getSessionDataList(options: GetSessionDataListRequest): Promise<GetSessionDataListResponse> {
    if (!options.channelId || options.channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }

    const params: Record<string, unknown> = {
      channelId: options.channelId,
    };
    if (options.startDate !== undefined) {
      params.startDate = options.startDate;
    }
    if (options.endDate !== undefined) {
      params.endDate = options.endDate;
    }
    if (options.page !== undefined) {
      params.page = options.page;
    }
    if (options.pageSize !== undefined) {
      params.pageSize = options.pageSize;
    }

    const response = await this.client.httpClient.get<GetSessionDataListResponse>(
      '/live/v3/channel/session/data/list',
      { params }
    );

    return response as unknown as GetSessionDataListResponse;
  }

  /**
   * Export session stats (AC3)
   *
   * Exports statistics for a specific session.
   *
   * @param options - Export options including channelId and sessionId (both required)
   * @returns The export response (typically a URL or confirmation string)
   * @throws PolyVValidationError if channelId or sessionId is empty
   *
   * @example
   * ```typescript
   * const result = await channelService.exportSessionStats({
   *   channelId: 'ch123456',
   *   sessionId: 'session123',
   * });
   * ```
   */
  async exportSessionStats(options: ExportSessionStatsRequest): Promise<string> {
    if (!options.channelId || options.channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!options.sessionId || options.sessionId.trim() === '') {
      throw PolyVValidationError.required('sessionId');
    }

    const response = await this.client.httpClient.get<string>(
      '/live/v3/channel/session/stats/export',
      {
        params: {
          channelId: options.channelId,
          sessionId: options.sessionId,
        },
      }
    );

    return response as unknown as string;
  }

  /**
   * Get session by external ID (AC4)
   *
   * Retrieves sessions associated with an external session ID.
   *
   * @param options - Query options including channelId and externalSessionId (both required)
   * @returns Response containing list of session IDs
   * @throws PolyVValidationError if channelId or externalSessionId is empty
   *
   * @example
   * ```typescript
   * const result = await channelService.getSessionByExternal({
   *   channelId: 'ch123456',
   *   externalSessionId: 'external-id-12345678901234567890',
   * });
   * console.log(result.list); // Array of session IDs
   * ```
   */
  async getSessionByExternal(options: GetSessionByExternalRequest): Promise<GetSessionByExternalResponse> {
    if (!options.channelId || options.channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!options.externalSessionId || options.externalSessionId.trim() === '') {
      throw PolyVValidationError.required('externalSessionId');
    }

    const response = await this.client.httpClient.get<GetSessionByExternalResponse>(
      '/live/v3/channel/session/list-session-by-external',
      {
        params: {
          channelId: options.channelId,
          externalSessionId: options.externalSessionId,
        },
      }
    );

    return response as unknown as GetSessionByExternalResponse;
  }

  /**
   * List file IDs by external session ID (AC5)
   *
   * Retrieves file IDs associated with an external session ID.
   *
   * @param options - Query options including channelId and externalSessionId (both required)
   * @returns Array of file ID items
   * @throws PolyVValidationError if channelId or externalSessionId is empty
   *
   * @example
   * ```typescript
   * const result = await channelService.listFileIdByExternal({
   *   channelId: 'ch123456',
   *   externalSessionId: 'external-id-12345678901234567890',
   * });
   * ```
   */
  async listFileIdByExternal(options: ListFileIdByExternalRequest): Promise<FileIdByExternalItem[]> {
    if (!options.channelId || options.channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!options.externalSessionId || options.externalSessionId.trim() === '') {
      throw PolyVValidationError.required('externalSessionId');
    }

    const response = await this.client.httpClient.get<FileIdByExternalItem[]>(
      '/live/v3/channel/session/list-file-id-by-external',
      {
        params: {
          channelId: options.channelId,
          externalSessionId: options.externalSessionId,
        },
      }
    );

    return response as unknown as FileIdByExternalItem[];
  }

  /**
   * Relevance session (AC6)
   *
   * Associates an external session ID with the current channel session.
   *
   * @param options - Request options including channelId and externalSessionId (both required)
   * @returns The API response
   * @throws PolyVValidationError if channelId or externalSessionId is empty
   *
   * @example
   * ```typescript
   * const result = await channelService.relevanceSession({
   *   channelId: 'ch123456',
   *   externalSessionId: 'external-id-12345678901234567890',
   * });
   * ```
   */
  async relevanceSession(options: RelevanceSessionRequest): Promise<string> {
    if (!options.channelId || options.channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!options.externalSessionId || options.externalSessionId.trim() === '') {
      throw PolyVValidationError.required('externalSessionId');
    }

    const response = await this.client.httpClient.post<string>(
      '/live/v3/channel/session/relevance',
      null,
      {
        params: {
          channelId: options.channelId,
          externalSessionId: options.externalSessionId,
        },
      }
    );

    return response as unknown as string;
  }

  // --------------------------------------------
  // Channel Viewer Backend APIs
  // --------------------------------------------

  /**
   * List channel viewer groups.
   */
  async listChannelViewerGroups(
    params: ListChannelViewerGroupsParams
  ): Promise<ListChannelViewerGroupsResponse> {
    const scope = this.validateChannelViewerScope(params.scope);
    this.validateRequiredValue(params.channelId, 'channelId');
    const { scope: _scope, ...query } = params;
    const config = this.buildLiveBgConfig(query);

    if (scope === 'teacher') {
      const response = await this.client.httpClient.get<ListChannelViewerGroupsResponse>(
        '/live-bg/v3/teacher/channel-viewer/group/list',
        config
      );
      return response as unknown as ListChannelViewerGroupsResponse;
    }

    const response = await this.client.httpClient.get<ListChannelViewerGroupsResponse>(
      '/live-bg/v3/user/channel-viewer/group/list',
      config
    );
    return response as unknown as ListChannelViewerGroupsResponse;
  }

  /**
   * Create a channel viewer group.
   */
  async createChannelViewerGroup(params: CreateChannelViewerGroupParams): Promise<ChannelViewerGroup> {
    const scope = this.validateChannelViewerScope(params.scope);
    this.validateRequiredValue(params.channelId, 'channelId');
    this.validateRequiredText(params.name, 'name', 128);
    const { scope: _scope, ...body } = params;
    const config = this.buildLiveBgConfig();

    if (scope === 'teacher') {
      const response = await this.client.httpClient.post<ChannelViewerGroup>(
        '/live-bg/v3/teacher/channel-viewer/group/save',
        body,
        config
      );
      return response as unknown as ChannelViewerGroup;
    }

    const response = await this.client.httpClient.post<ChannelViewerGroup>(
      '/live-bg/v3/user/channel-viewer/group/save',
      body,
      config
    );
    return response as unknown as ChannelViewerGroup;
  }

  /**
   * Update a channel viewer group.
   */
  async updateChannelViewerGroup(params: UpdateChannelViewerGroupParams): Promise<void> {
    const scope = this.validateChannelViewerScope(params.scope);
    this.validateRequiredValue(params.channelId, 'channelId');
    this.validateRequiredValue(params.id, 'id');
    this.validateRequiredText(params.name, 'name', 128);
    const { scope: _scope, ...body } = params;
    const config = this.buildLiveBgConfig();

    if (scope === 'teacher') {
      await this.client.httpClient.post(
        '/live-bg/v3/teacher/channel-viewer/group/update',
        body,
        config
      );
      return;
    }

    await this.client.httpClient.post(
      '/live-bg/v3/user/channel-viewer/group/update',
      body,
      config
    );
  }

  /**
   * Delete a channel viewer group.
   */
  async deleteChannelViewerGroup(params: DeleteChannelViewerGroupParams): Promise<void> {
    const scope = this.validateChannelViewerScope(params.scope);
    this.validateRequiredValue(params.channelId, 'channelId');
    this.validateRequiredValue(params.id, 'id');
    const { scope: _scope, ...body } = params;
    const config = this.buildLiveBgConfig();

    if (scope === 'teacher') {
      await this.client.httpClient.post(
        '/live-bg/v3/teacher/channel-viewer/group/delete',
        body,
        config
      );
      return;
    }

    await this.client.httpClient.post(
      '/live-bg/v3/user/channel-viewer/group/delete',
      body,
      config
    );
  }

  /**
   * Get channel viewer group setting.
   */
  async getChannelViewerGroupSetting(
    params: GetChannelViewerGroupSettingParams
  ): Promise<ChannelViewerGroupSetting> {
    const scope = this.validateChannelViewerScope(params.scope);
    this.validateRequiredValue(params.channelId, 'channelId');
    const { scope: _scope, ...query } = params;
    const config = this.buildLiveBgConfig(query);

    if (scope === 'teacher') {
      const response = await this.client.httpClient.get<ChannelViewerGroupSetting>(
        '/live-bg/v3/teacher/channel-viewer/group-setting/get',
        config
      );
      return response as unknown as ChannelViewerGroupSetting;
    }

    const response = await this.client.httpClient.get<ChannelViewerGroupSetting>(
      '/live-bg/v3/user/channel-viewer/group-setting/get',
      config
    );
    return response as unknown as ChannelViewerGroupSetting;
  }

  /**
   * Update channel viewer group setting.
   */
  async updateChannelViewerGroupSetting(params: UpdateChannelViewerGroupSettingParams): Promise<void> {
    const scope = this.validateChannelViewerScope(params.scope);
    this.validateRequiredValue(params.channelId, 'channelId');
    this.validateOptionalYn(params.channelViewerGroupEnabled, 'channelViewerGroupEnabled');
    this.validateOptionalYn(params.notInGroupWatchEnabled, 'notInGroupWatchEnabled');
    const { scope: _scope, channelId, ...body } = params;
    const config = this.buildLiveBgConfig({ channelId });

    if (scope === 'teacher') {
      await this.client.httpClient.post(
        '/live-bg/v3/teacher/channel-viewer/group-setting/update',
        body,
        config
      );
      return;
    }

    await this.client.httpClient.post(
      '/live-bg/v3/user/channel-viewer/group-setting/update',
      body,
      config
    );
  }

  /**
   * List viewers belonging to a channel.
   */
  async listChannelViewers(params: ListChannelViewersParams): Promise<ListChannelViewersResponse> {
    const scope = this.validateChannelViewerScope(params.scope);
    this.validateChannelViewerListParams(params);
    const { scope: _scope, ...query } = params;
    const config = this.buildLiveBgConfig(query);

    if (scope === 'teacher') {
      const response = await this.client.httpClient.get<ListChannelViewersResponse>(
        '/live-bg/v3/teacher/channel-viewer/list/list',
        config
      );
      return response as unknown as ListChannelViewersResponse;
    }

    const response = await this.client.httpClient.get<ListChannelViewersResponse>(
      '/live-bg/v3/user/channel-viewer/list/list',
      config
    );
    return response as unknown as ListChannelViewersResponse;
  }

  /**
   * Export viewers belonging to a channel.
   */
  async exportChannelViewers(params: ExportChannelViewersParams): Promise<ExportChannelViewersResponse> {
    const scope = this.validateChannelViewerScope(params.scope);
    this.validateRequiredValue(params.channelId, 'channelId');
    const { scope: _scope, ...query } = params;
    const config = this.buildLiveBgConfig(query);

    if (scope === 'teacher') {
      const response = await this.client.httpClient.get<ExportChannelViewersResponse>(
        '/live-bg/v3/teacher/channel-viewer/list/export',
        config
      );
      return response as unknown as ExportChannelViewersResponse;
    }

    const response = await this.client.httpClient.get<ExportChannelViewersResponse>(
      '/live-bg/v3/user/channel-viewer/list/export',
      config
    );
    return response as unknown as ExportChannelViewersResponse;
  }

  /**
   * Add viewers to a channel, optionally assigning a group.
   */
  async addChannelViewers(params: AddChannelViewersParams): Promise<void> {
    const scope = this.validateChannelViewerScope(params.scope);
    this.validateRequiredValue(params.channelId, 'channelId');
    this.validateViewerIds(params.viewerIds);
    const { scope: _scope, ...body } = params;
    const config = this.buildLiveBgConfig();

    if (scope === 'teacher') {
      await this.client.httpClient.post(
        '/live-bg/v3/teacher/channel-viewer/list/save',
        body,
        config
      );
      return;
    }

    await this.client.httpClient.post(
      '/live-bg/v3/user/channel-viewer/list/save',
      body,
      config
    );
  }

  /**
   * Delete viewers from a channel.
   */
  async deleteChannelViewers(params: DeleteChannelViewersParams): Promise<void> {
    const scope = this.validateChannelViewerScope(params.scope);
    this.validateRequiredValue(params.channelId, 'channelId');
    this.validateViewerIds(params.viewerIds);
    const { scope: _scope, ...body } = params;
    const config = this.buildLiveBgConfig();

    if (scope === 'teacher') {
      await this.client.httpClient.post(
        '/live-bg/v3/teacher/channel-viewer/list/delete',
        body,
        config
      );
      return;
    }

    await this.client.httpClient.post(
      '/live-bg/v3/user/channel-viewer/list/delete',
      body,
      config
    );
  }

  /**
   * Transfer channel viewers to a target group.
   */
  async transferChannelViewers(params: TransferChannelViewersParams): Promise<void> {
    const scope = this.validateChannelViewerScope(params.scope);
    this.validateRequiredValue(params.channelId, 'channelId');
    this.validateViewerIds(params.viewerIds);
    const { scope: _scope, ...body } = params;
    const config = this.buildLiveBgConfig();

    if (scope === 'teacher') {
      await this.client.httpClient.post(
        '/live-bg/v3/teacher/channel-viewer/list/transfer',
        body,
        config
      );
      return;
    }

    await this.client.httpClient.post(
      '/live-bg/v3/user/channel-viewer/list/transfer',
      body,
      config
    );
  }

  /**
   * Import channel viewers from an Excel file.
   */
  async importChannelViewers(params: ImportChannelViewersParams): Promise<ImportChannelViewersResponse> {
    const scope = this.validateChannelViewerScope(params.scope);
    this.validateRequiredValue(params.channelId, 'channelId');
    if (!params.file) {
      throw PolyVValidationError.required('file');
    }

    const formData = new FormData();
    formData.append('file', params.file);

    const query: Record<string, unknown> = { channelId: params.channelId };
    if (params.groupId !== undefined) {
      query.groupId = params.groupId;
    }

    const config = this.buildLiveBgConfig(query);
    config.headers['Content-Type'] = 'multipart/form-data';

    if (scope === 'teacher') {
      const response = await this.client.httpClient.post<ImportChannelViewersResponse>(
        '/live-bg/v3/teacher/channel-viewer/list/import',
        formData,
        config
      );
      return response as unknown as ImportChannelViewersResponse;
    }

    const response = await this.client.httpClient.post<ImportChannelViewersResponse>(
      '/live-bg/v3/user/channel-viewer/list/import',
      formData,
      config
    );
    return response as unknown as ImportChannelViewersResponse;
  }

  /**
   * List viewers that have not joined any channel group.
   */
  async listUnrelatedChannelViewers(
    params: ListUnrelatedChannelViewersParams
  ): Promise<ListUnrelatedChannelViewersResponse> {
    const scope = this.validateChannelViewerScope(params.scope);
    this.validateUnrelatedChannelViewerParams(params);
    const { scope: _scope, ...query } = params;
    const config = this.buildLiveBgConfig(query);

    if (scope === 'teacher') {
      const response = await this.client.httpClient.get<ListUnrelatedChannelViewersResponse>(
        '/live-bg/v3/teacher/viewer-record/list-unrelation-channel-viewer',
        config
      );
      return response as unknown as ListUnrelatedChannelViewersResponse;
    }

    const response = await this.client.httpClient.get<ListUnrelatedChannelViewersResponse>(
      '/live-bg/v3/user/viewer-record/list-unrelation-channel-viewer',
      config
    );
    return response as unknown as ListUnrelatedChannelViewersResponse;
  }

  // --------------------------------------------
  // State APIs (AC7-AC16)
  // --------------------------------------------

  /**
   * Get live status (AC7)
   *
   * Queries the live status of a stream. This API does NOT require authentication.
   *
   * @param stream - The stream name (required)
   * @returns The live status: 'live' or 'end'
   * @throws PolyVValidationError if stream is empty
   *
   * @example
   * ```typescript
   * const status = await channelService.getLiveStatus('stream123');
   * console.log(status); // 'live' or 'end'
   * ```
   */
  async getLiveStatus(stream: string): Promise<LiveStatus> {
    if (!stream || stream.trim() === '') {
      throw PolyVValidationError.required('stream');
    }

    // Note: This API does NOT require authentication - uses different base URL pattern
    // Use X-Skip-Auth header to signal the client to skip auth signature injection
    const response = await this.client.httpClient.get<LiveStatus>(
      '/live_status/query',
      {
        params: { stream },
        headers: { 'X-Skip-Auth': 'true' },
      }
    );

    return response as unknown as LiveStatus;
  }

  /**
   * Get live status list (AC8)
   *
   * Queries the live status for multiple channels. Note: This is a POST endpoint.
   *
   * @param options - Request options including channelIds array (required)
   * @returns Array of live status items
   * @throws PolyVValidationError if channelIds is empty
   *
   * @example
   * ```typescript
   * const result = await channelService.getLiveStatusList({
   *   channelIds: ['ch123456', 'ch789012'],
   * });
   * ```
   */
  async getLiveStatusList(options: { channelIds: string[] }): Promise<LiveStatusItem[]> {
    if (!options.channelIds || options.channelIds.length === 0) {
      throw PolyVValidationError.required('channelIds');
    }

    // Note: This is a POST endpoint, not GET
    // channelIds must be sent as comma-separated string in form data
    const response = await this.client.httpClient.post<LiveStatusItem[]>(
      '/live/v2/channels/live-status',
      null,
      { params: { channelIds: options.channelIds.join(',') } }
    );

    return response as unknown as LiveStatusItem[];
  }

  /**
   * Get stream info (AC9)
   *
   * Retrieves stream information for a channel.
   *
   * @param options - Request options including channelId (required)
   * @returns Stream information
   * @throws PolyVValidationError if channelId is empty
   *
   * @example
   * ```typescript
   * const result = await channelService.getStreamInfo({
   *   channelId: 'ch123456',
   * });
   * ```
   */
  async getStreamInfo(options: { channelId: string }): Promise<GetStreamInfoResponse> {
    if (!options.channelId || options.channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }

    const response = await this.client.httpClient.get<GetStreamInfoResponse>(
      '/live/v3/channel/monitor/get-stream-info',
      { params: { channelId: options.channelId } }
    );

    return response as unknown as GetStreamInfoResponse;
  }

  /**
   * Get streams (AC10)
   *
   * Retrieves stream information for multiple channels.
   *
   * @param options - Request options including channelIds array (required)
   * @returns Array of stream items
   * @throws PolyVValidationError if channelIds is empty
   *
   * @example
   * ```typescript
   * const result = await channelService.getStreams({
   *   channelIds: ['ch123456', 'ch789012'],
   * });
   * ```
   */
  async getStreams(options: { channelIds: string[] }): Promise<GetStreamsItem[]> {
    if (!options.channelIds || options.channelIds.length === 0) {
      throw PolyVValidationError.required('channelIds');
    }

    const response = await this.client.httpClient.get<GetStreamsItem[]>(
      '/live/v3/channel/monitor/get-streams',
      { params: { channelIds: options.channelIds.join(',') } }
    );

    return response as unknown as GetStreamsItem[];
  }

  /**
   * List disk videos (AC11)
   *
   * Lists disk videos for a channel with pagination.
   *
   * @param options - Request options including channelId (required)
   * @returns Paginated list of disk videos
   * @throws PolyVValidationError if channelId is empty
   *
   * @example
   * ```typescript
   * const result = await channelService.listDiskVideo({
   *   channelId: 'ch123456',
   *   page: 1,
   *   pageSize: 10,
   * });
   * ```
   */
  async listDiskVideo(options: ListDiskVideoRequest): Promise<ListDiskVideoResponse> {
    if (!options.channelId || options.channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }

    const params: Record<string, unknown> = {
      channelId: options.channelId,
    };
    if (options.page !== undefined) {
      params.page = options.page;
    }
    if (options.pageSize !== undefined) {
      params.pageSize = options.pageSize;
    }

    const response = await this.client.httpClient.get<ListDiskVideoResponse>(
      '/live/v3/channel/disk-video/list',
      { params }
    );

    return response as unknown as ListDiskVideoResponse;
  }

  /**
   * Set status to start/live (AC12)
   *
   * Sets the channel status to live.
   *
   * @param options - Request options including channelId and userId (both required)
   * @returns The API response
   * @throws PolyVValidationError if channelId or userId is empty
   *
   * @example
   * ```typescript
   * const result = await channelService.setStatusStart({
   *   channelId: 'ch123456',
   *   userId: 'user123',
   * });
   * ```
   */
  async setStatusStart(options: SetStatusRequest): Promise<string> {
    if (!options.channelId || options.channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!options.userId || options.userId.trim() === '') {
      throw PolyVValidationError.required('userId');
    }

    const response = await this.client.httpClient.post<string>(
      `/live/v2/channels/${options.channelId}/live`,
      null,
      { params: { userId: options.userId } }
    );

    return response as unknown as string;
  }

  /**
   * Set status to end (AC13)
   *
   * Sets the channel status to ended.
   *
   * @param options - Request options including channelId and userId (both required)
   * @returns The API response
   * @throws PolyVValidationError if channelId or userId is empty
   *
   * @example
   * ```typescript
   * const result = await channelService.setStatusEnd({
   *   channelId: 'ch123456',
   *   userId: 'user123',
   * });
   * ```
   */
  async setStatusEnd(options: SetStatusRequest): Promise<string> {
    if (!options.channelId || options.channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!options.userId || options.userId.trim() === '') {
      throw PolyVValidationError.required('userId');
    }

    const response = await this.client.httpClient.post<string>(
      `/live/v2/channels/${options.channelId}/end`,
      null,
      { params: { userId: options.userId } }
    );

    return response as unknown as string;
  }

  /**
   * Ban push stream (AC14)
   *
   * Bans the push stream for a channel.
   *
   * @param options - Request options including channelId and userId (both required)
   * @returns The API response
   * @throws PolyVValidationError if channelId or userId is empty
   *
   * @example
   * ```typescript
   * const result = await channelService.banPush({
   *   channelId: 'ch123456',
   *   userId: 'user123',
   *   forbidTime: 60, // 60 minutes
   *   playbackForbidden: 'Y',
   * });
   * ```
   */
  async banPush(options: BanPushRequest): Promise<string> {
    if (!options.channelId || options.channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!options.userId || options.userId.trim() === '') {
      throw PolyVValidationError.required('userId');
    }

    const params: Record<string, unknown> = {
      userId: options.userId,
    };
    if (options.forbidTime !== undefined) {
      params.forbidTime = options.forbidTime;
    }
    if (options.playbackForbidden !== undefined) {
      params.playbackForbidden = options.playbackForbidden;
    }

    const response = await this.client.httpClient.post<string>(
      `/live/v2/stream/${options.channelId}/cutoff`,
      null,
      { params }
    );

    return response as unknown as string;
  }

  /**
   * Resume push stream (AC15)
   *
   * Resumes the push stream for a channel.
   *
   * @param options - Request options including channelId and userId (both required)
   * @returns The API response
   * @throws PolyVValidationError if channelId or userId is empty
   *
   * @example
   * ```typescript
   * const result = await channelService.resume({
   *   channelId: 'ch123456',
   *   userId: 'user123',
   * });
   * ```
   */
  async resume(options: { channelId: string; userId: string }): Promise<string> {
    if (!options.channelId || options.channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!options.userId || options.userId.trim() === '') {
      throw PolyVValidationError.required('userId');
    }

    const response = await this.client.httpClient.post<string>(
      `/live/v2/stream/${options.channelId}/resume`,
      null,
      { params: { userId: options.userId } }
    );

    return response as unknown as string;
  }

  /**
   * End disk push (AC16)
   *
   * Ends the disk push stream for a channel.
   *
   * @param options - Request options including channelId and diskVideoId (both required)
   * @returns The API response
   * @throws PolyVValidationError if channelId or diskVideoId is empty
   *
   * @example
   * ```typescript
   * const result = await channelService.endDiskPush({
   *   channelId: 'ch123456',
   *   diskVideoId: 'video123',
   * });
   * ```
   */
  async endDiskPush(options: EndDiskPushRequest): Promise<string> {
    if (!options.channelId || options.channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!options.diskVideoId || options.diskVideoId.trim() === '') {
      throw PolyVValidationError.required('diskVideoId');
    }

    const response = await this.client.httpClient.post<string>(
      '/live/v3/channel/stream/end-disk-push',
      null,
      {
        params: {
          channelId: options.channelId,
          diskVideoId: options.diskVideoId,
        },
      }
    );

    return response as unknown as string;
  }

  // --------------------------------------------
  // Warmup APIs (AC17-AC19)
  // --------------------------------------------

  /**
   * Update warmup switch (AC17)
   *
   * Enables or disables the warmup feature for a channel.
   *
   * @param options - Request options including channelId and warmUpEnabled (both required)
   * @returns The API response
   * @throws PolyVValidationError if channelId or warmUpEnabled is empty
   *
   * @example
   * ```typescript
   * // Enable warmup
   * const result = await channelService.updateWarmupSwitch({
   *   channelId: 'ch123456',
   *   warmUpEnabled: 'Y',
   * });
   *
   * // Disable warmup
   * const result = await channelService.updateWarmupSwitch({
   *   channelId: 'ch123456',
   *   warmUpEnabled: 'N',
   * });
   * ```
   */
  async updateWarmupSwitch(options: UpdateWarmupSwitchRequest): Promise<string> {
    if (!options.channelId || options.channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!options.warmUpEnabled || options.warmUpEnabled.trim() === '') {
      throw PolyVValidationError.required('warmUpEnabled');
    }

    const response = await this.client.httpClient.post<string>(
      '/live/v3/channel/set-warmup-enabled',
      null,
      {
        params: {
          channelId: options.channelId,
          warmUpEnabled: options.warmUpEnabled,
        },
      }
    );

    return response as unknown as string;
  }

  /**
   * Update warmup image (AC18)
   *
   * Updates the warmup image for a channel.
   *
   * @param options - Request options including channelId and coverImage (both required)
   * @returns The API response
   * @throws PolyVValidationError if channelId or coverImage is empty
   *
   * @example
   * ```typescript
   * const result = await channelService.updateWarmupImage({
   *   channelId: 'ch123456',
   *   coverImage: 'https://example.com/cover.jpg',
   *   coverHref: 'https://example.com/target',
   * });
   * ```
   */
  async updateWarmupImage(options: UpdateWarmupImageRequest): Promise<string> {
    if (!options.channelId || options.channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!options.coverImage || options.coverImage.trim() === '') {
      throw PolyVValidationError.required('coverImage');
    }

    const params: Record<string, unknown> = {
      coverImage: options.coverImage,
    };
    if (options.coverHref !== undefined) {
      params.coverHref = options.coverHref;
    }

    const response = await this.client.httpClient.post<string>(
      `/live/v2/channels/${options.channelId}/update`,
      null,
      { params }
    );

    return response as unknown as string;
  }

  /**
   * Update warmup video (AC19)
   *
   * Updates the warmup video for a channel.
   *
   * @param options - Request options including channelId and warmUpFlv (both required)
   * @returns The API response
   * @throws PolyVValidationError if channelId or warmUpFlv is empty
   *
   * @example
   * ```typescript
   * const result = await channelService.updateWarmupVideo({
   *   channelId: 'ch123456',
   *   warmUpFlv: 'https://example.com/warmup.flv',
   * });
   * ```
   */
  async updateWarmupVideo(options: UpdateWarmupVideoRequest): Promise<string> {
    if (!options.channelId || options.channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!options.warmUpFlv || options.warmUpFlv.trim() === '') {
      throw PolyVValidationError.required('warmUpFlv');
    }

    const response = await this.client.httpClient.post<string>(
      `/live/v2/channels/${options.channelId}/update`,
      null,
      { params: { warmUpFlv: options.warmUpFlv } }
    );

    return response as unknown as string;
  }

  // --------------------------------------------
  // Historical Operate Read APIs
  // --------------------------------------------

  /**
   * Get channel advert list.
   *
   * @param channelId - The channel ID
   * @returns Channel advert settings. If channel advert uses global settings, the global adverts are returned.
   */
  async getChannelAdverts(channelId: string): Promise<ChannelAdvert[]> {
    this.validateRequiredText(channelId, 'channelId');

    const response = await this.client.httpClient.get<ChannelAdvert[]>(
      '/live/v3/channel/advert/list',
      { params: { channelId } }
    );

    return response as unknown as ChannelAdvert[];
  }

  /**
   * Get channel product library enabled status.
   *
   * @param channelId - The channel ID
   * @returns Product library enabled status
   */
  async getChannelProductEnabled(channelId: string): Promise<ChannelProductEnabledResponse> {
    this.validateRequiredText(channelId, 'channelId');

    const response = await this.client.httpClient.get<ChannelProductEnabledResponse>(
      '/live/v3/channel/product/get-enabled',
      { params: { channelId } }
    );

    return response as unknown as ChannelProductEnabledResponse;
  }

  /**
   * Get PPT record setting.
   *
   * @param channelId - The channel ID
   * @returns PPT record setting
   */
  async getPptRecordSetting(channelId: string): Promise<PptRecordSettingResponse> {
    this.validateRequiredText(channelId, 'channelId');

    const response = await this.client.httpClient.get<PptRecordSettingResponse>(
      '/live/v3/channel/pptRecord/get-setting',
      { params: { channelId } }
    );

    return response as unknown as PptRecordSettingResponse;
  }

  /**
   * List PPT record tasks.
   *
   * @param params - Query parameters including channelId
   * @returns Paginated PPT record task list
   */
  async listPptRecordTasks(params: ListPptRecordTasksParams): Promise<ListPptRecordTasksResponse> {
    this.validateRequiredText(params.channelId, 'channelId');
    this.validateOptionalPage(params.page, 'page');
    this.validateOptionalPage(params.pageSize, 'pageSize');

    const queryParams: Record<string, unknown> = {
      channelId: params.channelId,
    };
    if (params.sessionId !== undefined) {
      queryParams.sessionId = params.sessionId;
    }
    if (params.status !== undefined) {
      queryParams.status = params.status;
    }
    if (params.startTime !== undefined) {
      queryParams.startTime = params.startTime;
    }
    if (params.endTime !== undefined) {
      queryParams.endTime = params.endTime;
    }
    if (params.page !== undefined) {
      queryParams.page = params.page;
    }
    if (params.pageSize !== undefined) {
      queryParams.pageSize = params.pageSize;
    }

    const response = await this.client.httpClient.get<ListPptRecordTasksResponse>(
      '/live/v3/channel/pptRecord/list',
      { params: queryParams }
    );

    return response as unknown as ListPptRecordTasksResponse;
  }

  /**
   * Get transmit channel associations for the account or one source channel.
   *
   * @param params - Optional source channel filter
   * @returns Transmit association list
   */
  async getTransmitAssociations(
    params: GetTransmitAssociationsParams = {}
  ): Promise<TransmitAssociation[]> {
    if (params.channelId !== undefined) {
      this.validateRequiredText(params.channelId, 'channelId');
    }

    const queryParams: Record<string, unknown> = {};
    if (params.channelId !== undefined) {
      queryParams.channelId = params.channelId;
    }

    const response = await this.client.httpClient.get<TransmitAssociation[]>(
      '/live/v3/channel/transmit/get-associations',
      { params: queryParams }
    );

    return response as unknown as TransmitAssociation[];
  }

  /**
   * Get channels owned by a child account.
   *
   * @param params - Query parameters including childUserId and pagination
   * @returns Paginated child-account channel list
   */
  async getUserChildrenChannels(
    params: GetUserChildrenChannelsParams
  ): Promise<GetUserChildrenChannelsResponse> {
    this.validateRequiredText(params.childUserId, 'childUserId');
    this.validatePositiveInteger(params.pageNumber, 'pageNumber');
    this.validatePositiveInteger(params.pageSize, 'pageSize');

    const queryParams: Record<string, unknown> = {
      childUserId: params.childUserId,
      pageNumber: params.pageNumber,
      pageSize: params.pageSize,
    };
    if (params.startTime !== undefined) {
      queryParams.startTime = params.startTime;
    }
    if (params.endTime !== undefined) {
      queryParams.endTime = params.endTime;
    }

    const response = await this.client.httpClient.get<GetUserChildrenChannelsResponse>(
      '/live/v4/channel/channel-user-children/get-channels',
      { params: queryParams }
    );

    return response as unknown as GetUserChildrenChannelsResponse;
  }

  /**
   * List follow-public-account settings for one or more channels.
   *
   * @param params - Channel IDs as an array or comma-separated string
   * @returns Follow-public-account settings
   */
  async listChannelsFollow(params: ListChannelsFollowParams): Promise<ListChannelsFollowResponse> {
    const channelIds = this.normalizeCommaSeparatedValues(params.channelIds, 'channelIds');

    const response = await this.client.httpClient.get<ListChannelsFollowResponse>(
      '/live/v3/channel/promotion/list-channels-follow',
      { params: { channelIds } }
    );

    return response as unknown as ListChannelsFollowResponse;
  }

  // --------------------------------------------
  // Historical Operate Write APIs
  // --------------------------------------------

  /**
   * Capture the current live stream image.
   *
   * @param channelId - The channel ID
   * @returns Screenshot image URL
   */
  async getCaptureImage(channelId: string): Promise<string> {
    this.validateRequiredText(channelId, 'channelId');

    const response = await this.client.httpClient.post<string>(
      `/live/v2/stream/${channelId}/capture`,
      null
    );

    return response as unknown as string;
  }

  /**
   * Create a PPT record remaking task.
   *
   * @param params - Task parameters including channelId and playback videoId
   * @returns true if task creation succeeded
   */
  async addPptRecordTask(params: AddPptRecordTaskParams): Promise<boolean> {
    this.validateRequiredText(params.channelId, 'channelId');
    this.validateRequiredText(params.videoId, 'videoId');

    const response = await this.client.httpClient.post<boolean>(
      '/live/v3/channel/pptRecord/addRecordTask',
      null,
      { params: { channelId: params.channelId, videoId: params.videoId } }
    );

    return response as unknown as boolean;
  }

  /**
   * Update PPT record settings.
   *
   * @param params - PPT record setting fields
   * @returns Mutation result
   */
  async updatePptRecordSetting(
    params: UpdatePptRecordSettingParams
  ): Promise<PptRecordMutationResponse> {
    this.validateRequiredText(params.channelId, 'channelId');
    this.validateOptionalYn(params.globalSettingEnabled, 'globalSettingEnabled');

    if (params.type !== undefined && params.type !== 0 && params.type !== 1 && params.type !== 2) {
      throw new PolyVValidationError(
        'type must be 0, 1, or 2',
        'type',
        params.type,
        { allowedValues: [0, 1, 2] }
      );
    }

    if (params.videoRatio !== undefined && params.videoRatio !== 0 && params.videoRatio !== 1) {
      throw new PolyVValidationError(
        'videoRatio must be 0 or 1',
        'videoRatio',
        params.videoRatio,
        { allowedValues: [0, 1] }
      );
    }

    const { channelId, ...settingParams } = params;
    const response = await this.client.httpClient.post<PptRecordMutationResponse>(
      '/live/v3/channel/pptRecord/setting',
      null,
      { params: { channelId, ...settingParams } }
    );

    return response as unknown as PptRecordMutationResponse;
  }

  /**
   * Get watch-page SDK API token.
   *
   * @param params - Viewer token parameters
   * @returns Viewer API token
   */
  async getWatchApiToken(params: ViewerApiTokenParams): Promise<ViewerApiTokenResponse> {
    this.validateRequiredText(params.channelId, 'channelId');
    this.validateRequiredText(params.viewerId, 'viewerId', 64);

    const response = await this.client.httpClient.post<ViewerApiTokenResponse>(
      '/live/v3/channel/watch/get-watch-api-token',
      null,
      { params }
    );

    return response as unknown as ViewerApiTokenResponse;
  }

  /**
   * Get viewer API token.
   *
   * @param params - Viewer token parameters
   * @returns Viewer API token
   */
  async getApiToken(params: ViewerApiTokenParams): Promise<ViewerApiTokenResponse> {
    this.validateRequiredText(params.channelId, 'channelId');
    this.validateRequiredText(params.viewerId, 'viewerId', 64);

    const response = await this.client.httpClient.post<ViewerApiTokenResponse>(
      '/live/v3/channel/watch/get-api-token',
      null,
      { params }
    );

    return response as unknown as ViewerApiTokenResponse;
  }

  /**
   * Get channel chat-room online count.
   *
   * The historical channel operate doc lists this endpoint as POST, while
   * newer docs and some production environments only accept GET.
   *
   * @param channelId - The channel ID
   * @returns Online user count
   */
  async getChatOnlineCount(channelId: string): Promise<number> {
    this.validateRequiredText(channelId, 'channelId');

    try {
      const response = await this.client.httpClient.post<number>(
        '/live/v3/channel/chat/count-online-user',
        null,
        { params: { channelId } }
      );

      return response as unknown as number;
    } catch (error) {
      const statusCode = (error as { statusCode?: number; response?: { status?: number } }).statusCode
        ?? (error as { response?: { status?: number } }).response?.status;
      const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
      if (statusCode !== 405 && !message.includes('method not allowed')) {
        throw error;
      }
    }

    const response = await this.client.httpClient.get<number>(
      '/live/v3/channel/chat/count-online-user',
      { params: { channelId } }
    );

    return response as unknown as number;
  }

  /**
   * Get password-free login URL for teacher/admin roles.
   *
   * @param params - Channel and optional role account ID
   * @returns Login URL or token wrapper returned by the API
   */
  async getTokenLoginUrl(params: TokenLoginUrlParams): Promise<TokenLoginUrlResponse> {
    this.validateRequiredText(params.channelId, 'channelId');

    const response = await this.client.httpClient.post<TokenLoginUrlResponse>(
      '/live/v3/channel/common/token-login-url',
      null,
      { params }
    );

    return response as unknown as TokenLoginUrlResponse;
  }

  /**
   * Get authorization and link-mic chat token.
   *
   * @param params - Chat token parameters
   * @returns Chat token detail
   */
  async getChatToken(params: ChatTokenParams): Promise<ChatTokenResponse> {
    this.validateRequiredText(params.channelId, 'channelId');
    this.validateRequiredText(params.userId, 'userId');

    const allowedRoles = ['teacher', 'admin', 'guest', 'assistant', 'viewer'];
    if (!allowedRoles.includes(params.role)) {
      throw new PolyVValidationError(
        'role must be teacher, admin, guest, assistant, or viewer',
        'role',
        params.role,
        { allowedValues: allowedRoles }
      );
    }

    const response = await this.client.httpClient.post<ChatTokenResponse>(
      '/live/v3/channel/common/get-chat-token',
      null,
      { params }
    );

    return response as unknown as ChatTokenResponse;
  }

  /**
   * Batch create channels that receive a transmit stream.
   *
   * @param params - Source channel and receiver channel names
   * @returns Created receiver channels
   */
  async batchAddTransmit(params: BatchAddTransmitParams): Promise<BatchAddTransmitResponse> {
    this.validateRequiredText(params.channelId, 'channelId');
    this.validateStringArray(params.names, 'names', 100);

    const response = await this.client.httpClient.post<BatchAddTransmitResponse>(
      '/live/v3/channel/transmit/batch-create',
      params.names,
      { params: { channelId: params.channelId } }
    );

    return response as unknown as BatchAddTransmitResponse;
  }

  /**
   * Batch associate submeeting channels.
   *
   * @param params - Main channel and submeeting list
   * @returns Associated submeeting channel IDs
   */
  async batchAddSubmeeting(params: BatchAddSubmeetingParams): Promise<BatchAddSubmeetingResponse> {
    this.validateRequiredText(params.channelId, 'channelId');

    if (!Array.isArray(params.subChannels) || params.subChannels.length === 0) {
      throw PolyVValidationError.required('subChannels');
    }

    if (params.subChannels.length > 60) {
      throw PolyVValidationError.outOfRange('subChannels', params.subChannels.length, { max: 60 });
    }

    params.subChannels.forEach((subChannel, index) => {
      this.validateRequiredValue(subChannel.channelId, `subChannels[${index}].channelId`);
    });

    const response = await this.client.httpClient.post<BatchAddSubmeetingResponse>(
      '/live/v3/channel/multi-meeting/batch-save-submeeting',
      { subChannels: params.subChannels },
      { params: { channelId: params.channelId } }
    );

    return response as unknown as BatchAddSubmeetingResponse;
  }

  /**
   * Associate or cancel receiver channels for a transmit channel.
   *
   * @param params - Transmit association parameters
   * @returns Receiver channel IDs returned by the API
   */
  async associationReceiveChannels(
    params: AssociationReceiveChannelsParams
  ): Promise<AssociationReceiveChannelsResponse> {
    this.validateRequiredText(params.channelId, 'channelId');
    const receiveChannelIds = this.normalizeCommaSeparatedValues(
      params.receiveChannelIds,
      'receiveChannelIds'
    );

    if (params.type !== undefined && params.type !== 'add' && params.type !== 'cancel') {
      throw new PolyVValidationError(
        'type must be add or cancel',
        'type',
        params.type,
        { allowedValues: ['add', 'cancel'] }
      );
    }

    const queryParams: Record<string, unknown> = {
      channelId: params.channelId,
      receiveChannelIds,
    };
    if (params.type !== undefined) {
      queryParams.type = params.type;
    }

    const response = await this.client.httpClient.post<AssociationReceiveChannelsResponse>(
      '/live/v3/channel/transmit/associations',
      null,
      { params: queryParams }
    );

    return response as unknown as AssociationReceiveChannelsResponse;
  }

  /**
   * Batch remove chat records from a channel.
   *
   * @param params - Channel and chat message IDs
   * @returns Success message
   */
  async removeChatContents(params: RemoveChatContentsParams): Promise<string> {
    this.validateRequiredText(params.channelId, 'channelId');
    const ids = this.normalizeCommaSeparatedValues(params.ids, 'ids');

    const response = await this.client.httpClient.post<string>(
      '/live/v3/channel/chat/remove-contents',
      null,
      { params: { channelId: params.channelId, ids } }
    );

    return response as unknown as string;
  }

  /**
   * Batch delete channel products.
   *
   * @param params - Channel and product IDs
   * @returns Success message
   */
  async batchDeleteChannelProducts(params: BatchDeleteChannelProductParams): Promise<string> {
    this.validateRequiredText(params.channelId, 'channelId');
    this.validateNumberArray(params.productIds, 'productIds', 100);

    const response = await this.client.httpClient.post<string>(
      '/live/v3/channel/product/batch-delete',
      { productIds: params.productIds },
      { params: { channelId: params.channelId } }
    );

    return response as unknown as string;
  }

  /**
   * Batch add channel products.
   *
   * @param params - Channel and product list
   * @returns Created products
   */
  async batchAddChannelProducts(
    params: BatchAddChannelProductsParams
  ): Promise<BatchAddChannelProductsResponse> {
    this.validateRequiredText(params.channelId, 'channelId');

    if (!Array.isArray(params.products) || params.products.length === 0) {
      throw PolyVValidationError.required('products');
    }

    if (params.products.length > 100) {
      throw PolyVValidationError.outOfRange('products', params.products.length, { max: 100 });
    }

    params.products.forEach((product, index) => {
      this.validateRequiredText(product.name, `products[${index}].name`);
      this.validateProductStatus(product.status, `products[${index}].status`);
      if (product.linkType !== 10 && product.linkType !== 11) {
        throw new PolyVValidationError(
          `products[${index}].linkType must be 10 or 11`,
          `products[${index}].linkType`,
          product.linkType,
          { allowedValues: [10, 11] }
        );
      }
    });

    const response = await this.client.httpClient.post<BatchAddChannelProductsResponse>(
      '/live/v3/channel/product/batch-add',
      params.products,
      { params: { channelId: params.channelId } }
    );

    return response as unknown as BatchAddChannelProductsResponse;
  }

  /**
   * Batch update channel product shelf status.
   *
   * @param params - Channel, product IDs, and shelf status
   * @returns Success message
   */
  async batchShelfChannelProducts(params: BatchShelfChannelProductParams): Promise<string> {
    this.validateRequiredText(params.channelId, 'channelId');
    this.validateNumberArray(params.productIds, 'productIds', 100);
    this.validateProductStatus(params.shelf, 'shelf');

    const response = await this.client.httpClient.post<string>(
      '/live/v3/channel/product/batch-shelf',
      { productIds: params.productIds },
      { params: { channelId: params.channelId, shelf: params.shelf } }
    );

    return response as unknown as string;
  }

  /**
   * Cancel a pushed channel product.
   *
   * @param params - Channel and product ID
   * @returns API result
   */
  async cancelPushChannelProduct(params: ProductIdParams): Promise<null | string> {
    this.validateRequiredText(params.channelId, 'channelId');
    this.validateNumberArray([params.productId], 'productId', 1);

    const response = await this.client.httpClient.post<null | string>(
      '/live/v3/channel/product/cancel-push-product',
      null,
      { params: { channelId: params.channelId, productId: params.productId } }
    );

    return response as unknown as null | string;
  }

  /**
   * Push a channel product to viewers.
   *
   * @param params - Channel, product ID, and optional card type
   * @returns API result
   */
  async pushChannelProduct(params: PushChannelProductParams): Promise<null | string> {
    this.validateRequiredText(params.channelId, 'channelId');
    this.validateNumberArray([params.productId], 'productId', 1);

    if (
      params.pushCardType !== undefined &&
      params.pushCardType !== 'smallCard' &&
      params.pushCardType !== 'bigCard'
    ) {
      throw new PolyVValidationError(
        'pushCardType must be smallCard or bigCard',
        'pushCardType',
        params.pushCardType,
        { allowedValues: ['smallCard', 'bigCard'] }
      );
    }

    const queryParams: Record<string, unknown> = {
      channelId: params.channelId,
      productId: params.productId,
    };
    if (params.pushCardType !== undefined) {
      queryParams.pushCardType = params.pushCardType;
    }

    const response = await this.client.httpClient.post<null | string>(
      '/live/v3/channel/product/push-product',
      null,
      { params: queryParams }
    );

    return response as unknown as null | string;
  }

  /**
   * Update one channel product shelf status.
   *
   * @param params - Channel, product ID, and shelf status
   * @returns Success message
   */
  async shelfChannelProduct(params: ShelfChannelProductParams): Promise<string> {
    this.validateRequiredText(params.channelId, 'channelId');
    this.validateNumberArray([params.productId], 'productId', 1);
    this.validateProductStatus(params.shelf, 'shelf');

    const response = await this.client.httpClient.post<string>(
      '/live/v3/channel/product/shelf',
      null,
      {
        params: {
          channelId: params.channelId,
          productId: params.productId,
          shelf: params.shelf,
        },
      }
    );

    return response as unknown as string;
  }

  /**
   * Sort a channel product by moving it up, down, or to a rank.
   *
   * @param params - Sort parameters
   * @returns Success message
   */
  async sortChannelProduct(params: SortChannelProductOrderParams): Promise<string> {
    this.validateRequiredText(params.channelId, 'channelId');
    this.validateNumberArray([params.productId], 'productId', 1);

    if (params.type !== 10 && params.type !== 20 && params.type !== 50) {
      throw new PolyVValidationError(
        'type must be 10, 20, or 50',
        'type',
        params.type,
        { allowedValues: [10, 20, 50] }
      );
    }

    if (params.type === 50) {
      this.validateNumberArray([params.sort as number], 'sort', 1);
    }

    const queryParams: Record<string, unknown> = {
      channelId: params.channelId,
      productId: params.productId,
      type: params.type,
    };
    if (params.sort !== undefined) {
      queryParams.sort = params.sort;
    }

    const response = await this.client.httpClient.post<string>(
      '/live/v3/channel/product/sort',
      null,
      { params: queryParams }
    );

    return response as unknown as string;
  }

  /**
   * Reference a platform product into a channel product library.
   *
   * @param params - Channel and platform product fields
   * @returns Referenced channel product
   */
  async referenceProduct(params: ReferenceProductParams): Promise<ReferenceProductResponse> {
    this.validateRequiredText(params.channelId, 'channelId');
    this.validateRequiredText(params.originId, 'originId');
    this.validateProductStatus(params.status, 'status');

    const { channelId, ...bodyParams } = params;
    const response = await this.client.httpClient.post<ReferenceProductResponse>(
      '/live/v3/channel/product/reference',
      bodyParams,
      { params: { channelId } }
    );

    return response as unknown as ReferenceProductResponse;
  }

  /**
   * Delete pseudo-live disk videos.
   *
   * @param params - Channel and VOD/material or disk video IDs
   * @returns API result
   */
  async deleteDiskVideos(params: DeleteDiskVideosParams): Promise<string> {
    this.validateRequiredText(params.channelId, 'channelId');
    const vids = this.normalizeOptionalCommaSeparatedValues(params.vids, 'vids');
    const videoIds = this.normalizeOptionalCommaSeparatedValues(params.videoIds, 'videoIds');

    if (vids === undefined && videoIds === undefined) {
      throw PolyVValidationError.required('vids or videoIds');
    }

    const queryParams: Record<string, unknown> = { channelId: params.channelId };
    if (vids !== undefined) {
      queryParams.vids = vids;
    }
    if (videoIds !== undefined) {
      queryParams.videoIds = videoIds;
    }

    const response = await this.client.httpClient.post<string>(
      '/live/v3/channel/stream/delete-disk-videos',
      null,
      { params: queryParams }
    );

    return response as unknown as string;
  }

  /**
   * Delete PPT record remaking tasks.
   *
   * @param params - Channel and task IDs
   * @returns Mutation result
   */
  async deletePptRecord(params: DeletePptRecordParams): Promise<PptRecordMutationResponse> {
    this.validateRequiredText(params.channelId, 'channelId');
    const taskIds = this.normalizeCommaSeparatedValues(params.taskIds, 'taskIds');

    const response = await this.client.httpClient.post<PptRecordMutationResponse>(
      '/live/v3/channel/pptRecord/batch-delete',
      null,
      { params: { channelId: params.channelId, taskIds } }
    );

    return response as unknown as PptRecordMutationResponse;
  }

  /**
   * Set one-time login token for a channel.
   *
   * @param params - Channel and token
   * @returns Success message
   */
  async setChannelToken(params: SetChannelTokenParams): Promise<string> {
    this.validateRequiredText(params.channelId, 'channelId');
    this.validateRequiredText(params.token, 'token');

    const response = await this.client.httpClient.post<string>(
      `/live/v2/channels/${params.channelId}/set-token`,
      null,
      { params: { token: params.token } }
    );

    return response as unknown as string;
  }

  /**
   * Set one-time login token for a sub-account channel.
   *
   * @param params - Channel and token
   * @returns Success message
   */
  async setAccountToken(params: SetChannelTokenParams): Promise<string> {
    this.validateRequiredText(params.channelId, 'channelId');
    this.validateRequiredText(params.token, 'token');

    const response = await this.client.httpClient.post<string>(
      `/live/v2/channels/${params.channelId}/set-account-token`,
      null,
      { params: { token: params.token } }
    );

    return response as unknown as string;
  }

  /**
   * Manually stop questionnaires for one or more channels.
   *
   * @param params - Channel IDs
   * @returns Mutation result
   */
  async channelsStopQuestionnaire(
    params: StopQuestionnaireParams
  ): Promise<StopQuestionnaireResponse> {
    const channelIds = this.normalizeCommaSeparatedValues(params.channelIds, 'channelIds');

    const response = await this.client.httpClient.post<StopQuestionnaireResponse>(
      '/live/v3/channel/questionnaire/end',
      null,
      { params: { channelIds } }
    );

    return response as unknown as StopQuestionnaireResponse;
  }

  /**
   * Batch update channel danmu switches.
   *
   * @param params - Channel IDs and switch values
   * @returns Success message
   */
  async batchUpdateDanmu(params: BatchUpdateDanmuParams): Promise<string> {
    const channelIds = this.normalizeCommaSeparatedValues(params.channelIds, 'channelIds');
    this.validateRequiredYn(params.closeDanmu, 'closeDanmu');
    this.validateRequiredYn(params.showDanmuInfoEnabled, 'showDanmuInfoEnabled');

    const response = await this.client.httpClient.post<string>(
      '/live/v3/channel/basic/batchUpdateDanmu',
      null,
      {
        params: {
          channelIds,
          closeDanmu: params.closeDanmu,
          showDanmuInfoEnabled: params.showDanmuInfoEnabled,
        },
      }
    );

    return response as unknown as string;
  }

  /**
   * Update follow-public-account settings for one or more channels.
   *
   * @param params - Channel IDs and follow settings
   * @returns API result
   */
  async updateChannelsFollow(params: UpdateChannelsFollowParams): Promise<null | string> {
    const channelIds = this.normalizeCommaSeparatedValues(params.channelIds, 'channelIds');
    this.validateRequiredText(params.qrCodeUrl, 'qrCodeUrl');
    this.validateOptionalYn(params.enabled, 'enabled');
    this.validateOptionalYn(params.autoShowEnabled, 'autoShowEnabled');
    this.validateOptionalText(params.entranceText, 'entranceText', 8);
    this.validateOptionalText(params.tips, 'tips', 30);
    this.validateOptionalText(params.pcFollowTips, 'pcFollowTips', 30);

    const queryParams: Record<string, unknown> = {
      channelIds,
      qrCodeUrl: params.qrCodeUrl,
    };
    if (params.enabled !== undefined) {
      queryParams.enabled = params.enabled;
    }
    if (params.autoShowEnabled !== undefined) {
      queryParams.autoShowEnabled = params.autoShowEnabled;
    }
    if (params.entranceText !== undefined) {
      queryParams.entranceText = params.entranceText;
    }
    if (params.tips !== undefined) {
      queryParams.tips = params.tips;
    }
    if (params.pcFollowTips !== undefined) {
      queryParams.pcFollowTips = params.pcFollowTips;
    }

    const response = await this.client.httpClient.post<null | string>(
      '/live/v3/channel/promotion/update-channels-follow',
      null,
      { params: queryParams }
    );

    return response as unknown as null | string;
  }

  /**
   * Update channel stream type.
   *
   * @param params - Stream type parameters
   * @returns API result
   */
  async updateStreamType(params: UpdateStreamTypeParams): Promise<string> {
    this.validateRequiredText(params.channelId, 'channelId');

    const allowedStreamTypes = ['client', 'pull', 'thirdpull', 'disk', 'audio'];
    if (!allowedStreamTypes.includes(params.streamType)) {
      throw new PolyVValidationError(
        'streamType must be client, pull, thirdpull, disk, or audio',
        'streamType',
        params.streamType,
        { allowedValues: allowedStreamTypes }
      );
    }

    if (params.streamType === 'pull') {
      this.validateRequiredText(params.pullUrl, 'pullUrl');
    }

    const queryParams: Record<string, unknown> = {
      channelId: params.channelId,
      streamType: params.streamType,
    };
    if (params.pullUrl !== undefined) {
      queryParams.pullUrl = params.pullUrl;
    }
    if (params.pullStreamTime !== undefined) {
      queryParams.pullStreamTime = params.pullStreamTime;
    }

    const response = await this.client.httpClient.post<string>(
      '/live/v3/channel/stream/update',
      null,
      { params: queryParams }
    );

    return response as unknown as string;
  }

  /**
   * Configure pseudo-live disk videos.
   *
   * @param params - Channel and disk video source
   * @returns API result
   */
  async addDiskVideos(params: AddDiskVideosParams): Promise<string> {
    this.validateRequiredText(params.channelId, 'channelId');
    const vids = this.normalizeCommaSeparatedValues(params.vids, 'vids');

    if (
      params.origin !== undefined &&
      params.origin !== 'vod' &&
      params.origin !== 'material' &&
      params.origin !== 'record'
    ) {
      throw new PolyVValidationError(
        'origin must be vod, material, or record',
        'origin',
        params.origin,
        { allowedValues: ['vod', 'material', 'record'] }
      );
    }

    const startTimes = this.normalizeOptionalCommaSeparatedValues(params.startTimes, 'startTimes');
    if (params.origin === 'record' && startTimes === undefined) {
      throw PolyVValidationError.required('startTimes');
    }

    const queryParams: Record<string, unknown> = {
      channelId: params.channelId,
      vids,
    };
    if (params.origin !== undefined) {
      queryParams.origin = params.origin;
    }
    if (startTimes !== undefined) {
      queryParams.startTimes = startTimes;
    }

    const response = await this.client.httpClient.post<string>(
      '/live/v3/channel/stream/add-disk-videos',
      null,
      { params: queryParams }
    );

    return response as unknown as string;
  }

  // ============================================
  // Product APIs (Story 8-2)
  // ============================================

  /**
   * List channel products
   *
   * Lists products in a channel with pagination support.
   *
   * @param params - Query parameters including channelId (required)
   * @returns Paginated product list
   * @throws PolyVValidationError if channelId is missing
   *
   * @example
   * ```typescript
   * const result = await channelService.listChannelProducts({
   *   channelId: 'ch123456',
   *   pageNumber: 1,
   *   pageSize: 20,
   * });
   * console.log(result.contents);
   * ```
   */
  async listChannelProducts(params: ListChannelProductsParams): Promise<ListChannelProductsResponse> {
    if (!params.channelId || params.channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }

    const queryParams: Record<string, unknown> = {
      channelId: params.channelId,
    };
    if (params.pageNumber !== undefined) {
      queryParams.pageNumber = params.pageNumber;
    }
    if (params.pageSize !== undefined) {
      queryParams.pageSize = params.pageSize;
    }

    const response = await this.client.httpClient.get<ListChannelProductsResponse>(
      '/live/v3/channel/product/list',
      { params: queryParams }
    );

    return response as unknown as ListChannelProductsResponse;
  }

  /**
   * Add channel product
   *
   * Adds a new product to the channel product library.
   * Note: Only (channelId, timestamp, appId) participate in signature,
   * body parameters do NOT participate in signature.
   *
   * @param params - Product parameters including channelId, name, status, linkType
   * @returns Created product information including productId
   * @throws PolyVValidationError if required parameters are missing
   *
   * @example
   * ```typescript
   * const product = await channelService.addChannelProduct({
   *   channelId: 'ch123456',
   *   name: 'My Product',
   *   status: 1,
   *   linkType: 10,
   *   link: 'https://example.com/product',
   *   cover: 'https://example.com/cover.jpg',
   *   realPrice: 99.9,
   * });
   * console.log(product.productId);
   * ```
   */
  async addChannelProduct(params: AddChannelProductParams): Promise<AddChannelProductResponse> {
    // Validate required parameters
    if (!params.channelId || params.channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!params.name || params.name.trim() === '') {
      throw PolyVValidationError.required('name');
    }
    if (params.status === undefined) {
      throw PolyVValidationError.required('status');
    }
    if (params.linkType === undefined) {
      throw PolyVValidationError.required('linkType');
    }

    // Extract channelId for URL params (signature params)
    const { channelId, ...bodyParams } = params;

    // Make request: channelId in URL params (for signature), bodyParams in request body
    const response = await this.client.httpClient.post<AddChannelProductResponse>(
      '/live/v3/channel/product/add',
      bodyParams,
      { params: { channelId } }
    );

    return response as unknown as AddChannelProductResponse;
  }

  /**
   * Update channel product
   *
   * Updates an existing product in the channel product library.
   * Note: Only (channelId, timestamp, appId) participate in signature,
   * body parameters do NOT participate in signature.
   *
   * @param params - Product parameters including channelId, productId, name, status, linkType
   * @returns true if update was successful
   * @throws PolyVValidationError if required parameters are missing
   *
   * @examples
   * ```typescript
   * await channelService.updateChannelProduct({
   *   channelId: 'ch123456',
   *   productId: 12345,
   *   name: 'Updated Product Name',
   *   status: 2,
   *   linkType: 10,
   * });
   * ```
   */
  async updateChannelProduct(params: UpdateChannelProductParams): Promise<boolean> {
    // Validate required parameters
    if (!params.channelId || params.channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (params.productId === undefined) {
      throw PolyVValidationError.required('productId');
    }
    if (!params.name || params.name.trim() === '') {
      throw PolyVValidationError.required('name');
    }
    if (params.status === undefined) {
      throw PolyVValidationError.required('status');
    }
    if (params.linkType === undefined) {
      throw PolyVValidationError.required('linkType');
    }

    // Extract channelId for URL params (signature params)
    const { channelId, ...bodyParams } = params;

    // Make request: channelId in URL params (for signature), bodyParams in request body
    const response = await this.client.httpClient.post<boolean>(
      '/live/v3/channel/product/update',
      bodyParams,
      { params: { channelId } }
    );

    return response as unknown as boolean;
  }

  /**
   * Delete channel product
   *
   * Deletes a product from the channel product library.
   * Note: All parameters (channelId, productId, appId, timestamp) participate in signature.
   *
   * @param params - Delete parameters including channelId and productId
   * @returns true if deletion was successful
   * @throws PolyVValidationError if required parameters are missing
   *
   * @example
   * ```typescript
   * const success = await channelService.deleteChannelProduct({
   *   channelId: 'ch123456',
   *   productId: 12345,
   * });
   * if (success) {
   *   console.log('Product deleted');
   * }
   * ```
   */
  async deleteChannelProduct(params: DeleteChannelProductParams): Promise<boolean> {
    // Validate required parameters
    if (!params.channelId || params.channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (params.productId === undefined) {
      throw PolyVValidationError.required('productId');
    }

    // All params in URL query (for signature)
    const response = await this.client.httpClient.post<boolean>(
      '/live/v3/channel/product/delete',
      null,
      { params: { channelId: params.channelId, productId: params.productId } }
    );

    return response as unknown as boolean;
  }

  /**
   * Update channel product library enabled status
   *
   * Toggles the channel product library on or off.
   * All params (channelId, enabled, appId, timestamp) participate in signature.
   *
   * @param params - Parameters including channelId and enabled (Y/N)
   * @returns true if update was successful
   * @throws PolyVValidationError if required parameters are missing
   *
   * @example
   * ```typescript
   * await channelService.updateChannelProductEnabled({
   *   channelId: 'ch123456',
   *   enabled: 'Y',
   * });
   * ```
   */
  async updateChannelProductEnabled(params: UpdateChannelProductEnabledParams): Promise<boolean> {
    if (!params.channelId || params.channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!params.enabled || (params.enabled !== 'Y' && params.enabled !== 'N')) {
      throw PolyVValidationError.required('enabled');
    }

    const response = await this.client.httpClient.post<boolean>(
      '/live/v3/channel/product/update-enabled',
      null,
      { params: { channelId: params.channelId, enabled: params.enabled } }
    );

    return response as unknown as boolean;
  }

  /**
   * Update channel configuration
   *
   * Updates a channel config key-value pair via /v3/channel/config/update.
   * Common keys include: couponEnabled, productEnabled, etc.
   *
   * @param params - Parameters including channelId, key, and value
   * @returns true if update was successful
   * @throws PolyVValidationError if required parameters are missing
   *
   * @example
   * ```typescript
   * await channelService.updateChannelConfig({
   *   channelId: 'ch123456',
   *   key: 'couponEnabled',
   *   value: 'Y',
   * });
   * ```
   */
  async updateChannelConfig(params: UpdateChannelConfigParams): Promise<boolean> {
    if (!params.channelId || params.channelId.trim() === '') {
      throw PolyVValidationError.required('channelId');
    }
    if (!params.key || params.key.trim() === '') {
      throw PolyVValidationError.required('key');
    }
    if (!params.value || params.value.trim() === '') {
      throw PolyVValidationError.required('value');
    }

    const response = await this.client.httpClient.post<boolean>(
      '/live/v3/channel/config/update',
      null,
      { params: { channelId: params.channelId, key: params.key, value: params.value } }
    );

    return response as unknown as boolean;
  }
}
