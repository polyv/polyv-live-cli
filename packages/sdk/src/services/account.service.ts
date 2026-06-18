/**
 * Account Service
 *
 * Service for managing PolyV account-related operations.
 * Provides methods for category management, user info, channel lists, statistics, and more.
 *
 * @module services/account
 */

import type { PolyVClient } from '../client.js';
import type {
  Category,
  GetCategoryListResponse,
  CreateCategoryParams,
  CreateCategoryResponse,
  DeleteCategoryParams,
  DeleteCategoryResponse,
  UpdateCategoryNameParams,
  UpdateCategoryNameResponse,
  UpdateCategoryRankParams,
  UpdateCategoryRankResponse,
  GetUserInfoResponse,
  ChannelsParams,
  ChannelsResponse,
  ChannelDetailParams,
  ChannelDetailResponse,
  ChannelDetailListParams,
  ChannelDetailListResponse,
  GetSimpleChannelListParams,
  GetSimpleChannelListResponse,
  UserChannelBasicListParams,
  UserChannelBasicListResponse,
  UserPlaybackListParams,
  UserPlaybackListResponse,
  ReceiveListParams,
  ReceiveListResponse,
  GetIncomeDetailParams,
  GetIncomeDetailResponse,
  GetUserDurationsParams,
  GetUserDurationsResponse,
  MicDurationParams,
  MicDurationResponse,
  SwitchGetParams,
  SwitchGetResponse,
  SwitchUpdateParams,
  SwitchUpdateResponse,
  SetStreamCallbackParams,
  SetStreamCallbackResponse,
  SetRecordCallbackParams,
  SetRecordCallbackResponse,
  SetPlaybackCallbackParams,
  SetPlaybackCallbackResponse,
  SetUserLoginTokenParams,
  SetUserLoginTokenResponse,
  SetUserChildrenLoginTokenParams,
  SetUserChildrenLoginTokenResponse,
  SsoLoginParams,
  SsoLoginResponse,
  SsoConfigParams,
  SsoConfigResponse,
} from '../types/account.js';
import { PolyVValidationError } from '../errors/polyv-validation-error.js';

/**
 * AccountService
 *
 * Provides methods to interact with PolyV Live Account APIs.
 *
 * @example
 * ```typescript
 * const client = new PolyVClient({ appId: 'xxx', appSecret: 'yyy' });
 * const categories = await client.account.getCategoryList();
 * ```
 */
export class AccountService {
  private client: PolyVClient;

  /**
   * Create a new AccountService instance
   *
   * @param client - The PolyVClient instance to use for API calls
   */
  constructor(client: PolyVClient) {
    this.client = client;
  }

  private compactParams(params?: Record<string, unknown>): Record<string, unknown> {
    if (!params) return {};

    return Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null)
    );
  }

  private validateRequiredString(value: unknown, fieldName: string): string {
    if (typeof value !== 'string' || value.trim() === '') {
      throw new PolyVValidationError(`${fieldName} is required`);
    }

    return value.trim();
  }

  private validatePositiveInteger(value: unknown, fieldName: string): void {
    if (value === undefined || value === null) return;
    if (!Number.isInteger(value) || Number(value) < 1) {
      throw new PolyVValidationError(`${fieldName} must be a positive integer`);
    }
  }

  private validatePageParams(params?: { page?: number; pageSize?: number }): void {
    this.validatePositiveInteger(params?.page, 'page');
    this.validatePositiveInteger(params?.pageSize, 'pageSize');
  }

  private validateDate(value: string, fieldName: string): void {
    this.validateRequiredString(value, fieldName);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new PolyVValidationError(`${fieldName} must use yyyy-MM-dd format`);
    }
  }

  private validateCallbackUrl(url: string | undefined): void {
    if (!url || url.trim() === '') return;

    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        throw new Error('invalid protocol');
      }
    } catch {
      throw new PolyVValidationError('url must be a valid http:// or https:// URL');
    }
  }

  private normalizeEnabled(enabled: SwitchUpdateParams['enabled']): 'Y' | 'N' {
    if (typeof enabled === 'boolean') {
      return enabled ? 'Y' : 'N';
    }

    if (enabled !== 'Y' && enabled !== 'N') {
      throw new PolyVValidationError('enabled must be Y or N');
    }

    return enabled;
  }

  private successResponse(response: unknown): { success: boolean } {
    return { success: response === true || response === 'success' || response === '' };
  }

  // ============================================
  // AC1: Category Management APIs
  // ============================================

  /**
   * Get category list
   * Query all live categories for the account
   *
   * @returns Category list
   *
   * @example
   * ```typescript
   * const result = await client.account.getCategoryList();
   * console.log(result.categories);
   * ```
   */
  async getCategoryList(): Promise<GetCategoryListResponse> {
    const response = await this.client.httpClient.post<Category[]>(
      '/live/v3/user/category/list'
    );
    return { categories: response as unknown as Category[] };
  }

  /**
   * Create a new category
   *
   * @param params - Create parameters
   * @returns Created category info
   *
   * @example
   * ```typescript
   * const result = await client.account.createCategory({
   *   categoryName: 'New Category',
   * });
   * console.log(result.categoryId);
   * ```
   */
  async createCategory(params: CreateCategoryParams): Promise<CreateCategoryResponse> {
    if (!params.categoryName || params.categoryName.trim() === '') {
      throw new PolyVValidationError('categoryName is required and cannot be empty');
    }

    const response = await this.client.httpClient.post<CreateCategoryResponse>(
      '/live/v3/user/category/create',
      null,
      { params }
    );
    return response as unknown as CreateCategoryResponse;
  }

  /**
   * Delete a category
   *
   * @param params - Delete parameters
   * @returns Delete result
   *
   * @example
   * ```typescript
   * const result = await client.account.deleteCategory({
   *   categoryId: 12345,
   * });
   * console.log(result.success);
   * ```
   */
  async deleteCategory(params: DeleteCategoryParams): Promise<DeleteCategoryResponse> {
    if (!params.categoryId || params.categoryId <= 0) {
      throw new PolyVValidationError('categoryId must be a positive number');
    }

    const response = await this.client.httpClient.post<DeleteCategoryResponse>(
      '/live/v3/user/category/delete',
      null,
      { params: { categoryId: params.categoryId } }
    );
    return { success: response as unknown as boolean };
  }

  /**
   * Update category name
   *
   * @param params - Update parameters
   * @returns Update result
   *
   * @example
   * ```typescript
   * const result = await client.account.updateCategoryName({
   *   categoryId: 12345,
   *   categoryName: 'Updated Name',
   * });
   * console.log(result.success);
   * ```
   */
  async updateCategoryName(params: UpdateCategoryNameParams): Promise<UpdateCategoryNameResponse> {
    if (!params.categoryId || params.categoryId <= 0) {
      throw new PolyVValidationError('categoryId must be a positive number');
    }
    if (!params.categoryName || params.categoryName.trim() === '') {
      throw new PolyVValidationError('categoryName is required and cannot be empty');
    }

    const response = await this.client.httpClient.post<UpdateCategoryNameResponse>(
      '/live/v3/user/category/update-name',
      null,
      { params }
    );
    return { success: response as unknown as boolean };
  }

  /**
   * Update category rank (sort order)
   *
   * @param params - Update parameters
   * @returns Update result
   *
   * @example
   * ```typescript
   * const result = await client.account.updateCategoryRank({
   *   categoryId: 12345,
   *   rank: 1,
   * });
   * console.log(result.success);
   * ```
   */
  async updateCategoryRank(params: UpdateCategoryRankParams): Promise<UpdateCategoryRankResponse> {
    if (!params.categoryId || params.categoryId <= 0) {
      throw new PolyVValidationError('categoryId must be a positive number');
    }
    if (params.rank === undefined || params.rank === null) {
      throw new PolyVValidationError('rank is required');
    }

    const response = await this.client.httpClient.post<UpdateCategoryRankResponse>(
      '/live/v3/user/category/update-rank',
      null,
      { params }
    );
    return { success: response as unknown as boolean };
  }

  // ============================================
  // AC2: User Info API
  // ============================================

  /**
   * Get user account information
   *
   * @returns User info
   *
   * @example
   * ```typescript
   * const info = await client.account.getUserInfo();
   * console.log(info.userId, info.maxChannels);
   * ```
   */
  async getUserInfo(): Promise<GetUserInfoResponse> {
    const response = await this.client.httpClient.get<GetUserInfoResponse>(
      '/live/v3/user/get-info'
    );
    return response as unknown as GetUserInfoResponse;
  }

  // ============================================
  // AC3: Channel List APIs
  // ============================================

  /**
   * Get channel ID list
   *
   * @param params - Query parameters
   * @returns Channel ID list
   *
   * @example
   * ```typescript
   * const result = await client.account.channels({
   *   categoryId: 123,
   *   keyword: 'demo',
   * });
   * console.log(result.channels);
   * ```
   */
  async channels(params?: ChannelsParams): Promise<ChannelsResponse> {
    const response = await this.client.httpClient.get<ChannelsResponse>(
      '/live/v3/user/channels',
      { params: this.compactParams(params as Record<string, unknown> | undefined) }
    );
    return response as unknown as ChannelsResponse;
  }

  /**
   * Get channel detail
   *
   * @param params - Query parameters
   * @returns Channel detail
   *
   * @example
   * ```typescript
   * const detail = await client.account.channelDetail({
   *   channelId: '123456',
   * });
   * console.log(detail.channel);
   * ```
   */
  async channelDetail(params: ChannelDetailParams): Promise<ChannelDetailResponse> {
    if (!params.channelId) {
      throw new PolyVValidationError('channelId is required');
    }

    const response = await this.client.httpClient.get<ChannelDetailResponse>(
      '/live/v3/user/channel/detail',
      { params }
    );
    return response as unknown as ChannelDetailResponse;
  }

  /**
   * Get channel detail list
   *
   * @param params - Query parameters
   * @returns Paginated channel detail list
   */
  async channelDetailList(params?: ChannelDetailListParams): Promise<ChannelDetailListResponse> {
    this.validatePageParams(params);

    const response = await this.client.httpClient.post<ChannelDetailListResponse>(
      '/live/v3/channel/management/list-detail',
      null,
      { params: this.compactParams(params as Record<string, unknown> | undefined) }
    );
    return response as unknown as ChannelDetailListResponse;
  }

  /**
   * Get simple channel list (lightweight)
   *
   * @param params - Query parameters
   * @returns Simple channel list
   *
   * @example
   * ```typescript
   * const result = await client.account.getSimpleChannelList({
   *   categoryId: 123,
   *   page: 1,
   *   pageSize: 100,
   * });
   * console.log(result.contents);
   * ```
   */
  async getSimpleChannelList(params?: GetSimpleChannelListParams): Promise<GetSimpleChannelListResponse> {
    this.validatePageParams(params);

    const response = await this.client.httpClient.get<GetSimpleChannelListResponse>(
      '/live/v3/channel/management/list',
      { params: this.compactParams(params as Record<string, unknown> | undefined) }
    );
    return response as unknown as GetSimpleChannelListResponse;
  }

  /**
   * Get user channel basic list
   *
   * @param params - Query parameters
   * @returns Channel basic list
   *
   * @example
   * ```typescript
   * const result = await client.account.userChannelBasicList({
   *   page: 1,
   *   pageSize: 20,
   *   categoryIds: '340019,345134',
   * });
   * console.log(result.contents);
   * ```
   */
  async userChannelBasicList(params?: UserChannelBasicListParams): Promise<UserChannelBasicListResponse> {
    this.validatePageParams(params);
    const categoryIds = Array.isArray(params?.categoryIds)
      ? params.categoryIds.join(',')
      : params?.categoryIds;

    const response = await this.client.httpClient.get<UserChannelBasicListResponse>(
      '/live/v3/channel/basic/list',
      {
        params: this.compactParams({
          ...params,
          categoryIds,
        }),
      }
    );
    return response as unknown as UserChannelBasicListResponse;
  }

  /**
   * Get user playback list
   *
   * @param params - Query parameters
   * @returns Playback list
   *
   * @example
   * ```typescript
   * const result = await client.account.userPlaybackList({
   *   page: 1,
   *   pageSize: 10,
   *   startDate: '2024-01-01',
   *   endDate: '2024-01-31',
   * });
   * console.log(result.contents);
   * ```
   */
  async userPlaybackList(params?: UserPlaybackListParams): Promise<UserPlaybackListResponse> {
    const response = await this.client.httpClient.get<UserPlaybackListResponse>(
      '/live/v3/user/playback/list',
      { params }
    );
    return response as unknown as UserPlaybackListResponse;
  }

  // ============================================
  // AC4: Statistics APIs
  // ============================================

  /**
   * Get channels that can receive a transmission
   *
   * @param params - Query parameters
   * @returns Receive list
   *
   * @example
   * ```typescript
   * const result = await client.account.receiveList({
   *   channelId: '2788479',
   *   page: 1,
   *   pageSize: 10,
   * });
   * console.log(result.contents);
   * ```
   */
  async receiveList(params?: ReceiveListParams): Promise<ReceiveListResponse> {
    this.validateRequiredString(params?.channelId, 'channelId');
    this.validatePageParams(params);

    const response = await this.client.httpClient.get<ReceiveListResponse>(
      '/live/v3/channel/basic/receive/list',
      { params: this.compactParams(params as Record<string, unknown> | undefined) }
    );
    return response as unknown as ReceiveListResponse;
  }

  /**
   * Get income detail
   *
   * @param params - Query parameters
   * @returns Income detail
   *
   * @example
   * ```typescript
   * const result = await client.account.getIncomeDetail({
   *   userId: '1b448be323',
   *   startDate: '2024-01-01',
   *   endDate: '2024-01-31',
   * });
   * console.log(result.contents);
   * ```
   */
  async getIncomeDetail(params?: GetIncomeDetailParams): Promise<GetIncomeDetailResponse> {
    if (!params) {
      throw new PolyVValidationError('params is required');
    }
    const encodedUserId = encodeURIComponent(this.validateRequiredString(params.userId, 'userId'));
    this.validateDate(params.startDate, 'startDate');
    this.validateDate(params.endDate, 'endDate');
    this.validatePageParams(params);

    const { userId: _userId, ...requestParams } = params;
    const response = await this.client.httpClient.post<GetIncomeDetailResponse>(
      `/live/v2/user/${encodedUserId}/get-income-detail`,
      null,
      { params: this.compactParams(requestParams as Record<string, unknown>) }
    );
    return response as unknown as GetIncomeDetailResponse;
  }

  /**
   * Get account live duration balance
   *
   * @returns User durations
   *
   * @example
   * ```typescript
   * const result = await client.account.getUserDurations();
   * console.log(result.available, result.used);
   * ```
   */
  async getUserDurations(params?: GetUserDurationsParams): Promise<GetUserDurationsResponse> {
    const response = await this.client.httpClient.post<GetUserDurationsResponse>(
      '/live/v2/user/get-user-durations',
      null,
      { params: this.compactParams(params as Record<string, unknown> | undefined) }
    );
    return response as unknown as GetUserDurationsResponse;
  }

  /**
   * Get account mic duration statistics
   *
   * @returns Mic duration
   *
   * @example
   * ```typescript
   * const result = await client.account.micDuration();
   * console.log(result.available, result.history);
   * ```
   */
  async micDuration(params?: MicDurationParams): Promise<MicDurationResponse> {
    const response = await this.client.httpClient.get<MicDurationResponse>(
      '/live/v3/channel/statistics/mic/get-duration',
      { params: this.compactParams(params as Record<string, unknown> | undefined) }
    );
    return response as unknown as MicDurationResponse;
  }

  // ============================================
  // AC5: Switch Config APIs
  // ============================================

  /**
   * Get switch configuration
   *
   * @returns Switch configuration
   *
   * @example
   * ```typescript
   * const result = await client.account.switchGet({ channelId: '123456' });
   * console.log(result[0]);
   * ```
   */
  async switchGet(params?: SwitchGetParams): Promise<SwitchGetResponse> {
    const response = await this.client.httpClient.get<SwitchGetResponse>(
      '/live/v3/channel/switch/get',
      { params: this.compactParams(params as Record<string, unknown> | undefined) }
    );
    return response as unknown as SwitchGetResponse;
  }

  /**
   * Update switch configuration
   *
   * @param params - Update parameters
   * @returns Update result
   *
   * @example
   * ```typescript
   * const result = await client.account.switchUpdate({
   *   channelId: '123456',
   *   type: 'mobileWatch',
   *   enabled: 'Y',
   * });
   * console.log(result.success);
   * ```
   */
  async switchUpdate(params: SwitchUpdateParams): Promise<SwitchUpdateResponse> {
    const type = this.validateRequiredString(params.type ?? params.param, 'type');
    if (params.enabled === undefined || params.enabled === null) {
      throw new PolyVValidationError('enabled is required');
    }

    const response = await this.client.httpClient.post<SwitchUpdateResponse>(
      '/live/v3/channel/switch/update',
      null,
      {
        params: this.compactParams({
          channelId: params.channelId,
          type,
          enabled: this.normalizeEnabled(params.enabled),
        }),
      }
    );
    return this.successResponse(response);
  }

  // ============================================
  // AC6: Callback Settings APIs
  // ============================================

  /**
   * Set stream callback URL
   *
   * @param params - Callback parameters
   * @returns Set result
   *
   * @example
   * ```typescript
   * const result = await client.account.setStreamCallback({
   *   url: 'https://example.com/stream-callback',
   * });
   * console.log(result.success);
   * ```
   */
  async setStreamCallback(params: SetStreamCallbackParams): Promise<SetStreamCallbackResponse> {
    const encodedUserId = encodeURIComponent(this.validateRequiredString(params.userId, 'userId'));
    this.validateCallbackUrl(params.url);

    const response = await this.client.httpClient.post<SetStreamCallbackResponse>(
      `/live/v2/user/${encodedUserId}/set-stream-callback`,
      null,
      { params: this.compactParams({ url: params.url }) }
    );
    return this.successResponse(response);
  }

  /**
   * Set record callback URL
   *
   * @param params - Callback parameters
   * @returns Set result
   *
   * @example
   * ```typescript
   * const result = await client.account.setRecordCallback({
   *   url: 'https://example.com/record-callback',
   * });
   * console.log(result.success);
   * ```
   */
  async setRecordCallback(params: SetRecordCallbackParams): Promise<SetRecordCallbackResponse> {
    const encodedUserId = encodeURIComponent(this.validateRequiredString(params.userId, 'userId'));
    this.validateCallbackUrl(params.url);

    const response = await this.client.httpClient.post<SetRecordCallbackResponse>(
      `/live/v2/user/${encodedUserId}/set-record-callback`,
      null,
      { params: this.compactParams({ url: params.url }) }
    );
    return this.successResponse(response);
  }

  /**
   * Set playback callback URL
   *
   * @param params - Callback parameters
   * @returns Set result
   *
   * @example
   * ```typescript
   * const result = await client.account.setPlaybackCallback({
   *   url: 'https://example.com/playback-callback',
   * });
   * console.log(result.success);
   * ```
   */
  async setPlaybackCallback(params: SetPlaybackCallbackParams): Promise<SetPlaybackCallbackResponse> {
    const encodedUserId = encodeURIComponent(this.validateRequiredString(params.userId, 'userId'));
    this.validateCallbackUrl(params.url);

    const response = await this.client.httpClient.post<SetPlaybackCallbackResponse>(
      `/live/v2/user/${encodedUserId}/set-playback-callback`,
      null,
      { params: this.compactParams({ url: params.url }) }
    );
    return this.successResponse(response);
  }

  // ============================================
  // AC7: Token Management APIs
  // ============================================

  /**
   * Set user login token
   *
   * @param params - Token parameters
   * @returns Set result
   *
   * @example
   * ```typescript
   * const result = await client.account.setUserLoginToken({
   *   token: 'your-login-token',
   * });
   * console.log(result.success);
   * ```
   */
  async setUserLoginToken(params: SetUserLoginTokenParams): Promise<SetUserLoginTokenResponse> {
    if (!params.token) {
      throw new PolyVValidationError('token is required');
    }

    const response = await this.client.httpClient.post<SetUserLoginTokenResponse>(
      '/live/v3/user/set-sso-token',
      null,
      { params }
    );
    return this.successResponse(response);
  }

  /**
   * Set child account login token
   *
   * @param params - Token parameters
   * @returns Set result
   *
   * @example
   * ```typescript
   * const result = await client.account.setUserChildrenLoginToken({
   *   userId: 'child123',
   *   token: 'your-login-token',
   * });
   * console.log(result.success);
   * ```
   */
  async setUserChildrenLoginToken(params: SetUserChildrenLoginTokenParams): Promise<SetUserChildrenLoginTokenResponse> {
    const childEmail = 'childEmail' in params
      ? params.childEmail
      : params.userId;
    this.validateRequiredString(childEmail, 'childEmail');
    if (!params.token) {
      throw new PolyVValidationError('token is required');
    }

    const response = await this.client.httpClient.post<SetUserChildrenLoginTokenResponse>(
      '/live/v3/user/set-sso-token',
      null,
      { params: { childEmail, token: params.token } }
    );
    return this.successResponse(response);
  }

  // ============================================
  // AC8: SSO APIs
  // ============================================

  /**
   * SSO login
   *
   * @param params - SSO login parameters
   * @returns SSO login response
   *
   * @example
   * ```typescript
   * const result = await client.account.ssoLogin({
   *   code: 'sso-auth-code',
   *   redirectUri: 'https://example.com/callback',
   * });
   * console.log(result.token);
   * ```
   */
  async ssoLogin(params: SsoLoginParams): Promise<SsoLoginResponse> {
    if (!params.code) {
      throw new PolyVValidationError('code is required');
    }

    const response = await this.client.httpClient.get<SsoLoginResponse>(
      '/live/v3/user/sso/login',
      { params }
    );
    return response as unknown as SsoLoginResponse;
  }

  /**
   * Configure SSO settings
   *
   * @param params - SSO config parameters
   * @returns Config result
   *
   * @example
   * ```typescript
   * const result = await client.account.ssoConfig({
   *   ssoEnabled: true,
   *   ssoUrl: 'https://sso.example.com/login',
   *   logoutUrl: 'https://sso.example.com/logout',
   * });
   * console.log(result.success);
   * ```
   */
  async ssoConfig(params: SsoConfigParams): Promise<SsoConfigResponse> {
    // Convert boolean ssoEnabled to 'Y'/'N' for API
    const apiParams = {
      ...params,
      ssoEnabled: typeof params.ssoEnabled === 'boolean'
        ? (params.ssoEnabled ? 'Y' : 'N')
        : params.ssoEnabled,
    };

    const response = await this.client.httpClient.post<SsoConfigResponse>(
      '/live/v3/user/sso/config',
      null,
      { params: apiParams }
    );
    return { success: response as unknown as boolean };
  }
}
