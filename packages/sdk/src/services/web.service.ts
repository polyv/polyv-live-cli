/**
 * Web Service
 *
 * Service for managing PolyV web page-related operations.
 * Provides methods for web info, menu management, and more.
 *
 * @module services/web
 */

import type { PolyVClient } from '../client.js';
import type {
  GetSplashResponse,
  SetSplashParams,
  SetPublisherParams,
  UpdateChannelNameParams,
  UpdateChannelLogoParams,
  UpdateLikesParams,
  LiveLikesResponse,
  GetCountdownResponse,
  SetCountdownParams,
  GetMenuListParams,
  GetMenuListResponse,
  AddMenuParams,
  AddMenuResponse,
  DeleteMenuParams,
  UpdateMenuParams,
  SetMenuParams,
  UpdateRankParams,
  UpdateConsultingEnabledParams,
  GetTuwenListParams,
  GetTuwenListResponse,
  // Story 4.3: Page Interaction APIs
  GetDonateResponse,
  GetWeixinShareResponse,
  UpdateCashParams,
  UpdateGoodParams,
  UpdateWeixinShareParams,
  // Story 4.3: Setting APIs
  UpdateGlobalEnabledParams,
  UploadImageParams,
  UploadImageResponse,
  // Story 4.5: Watch Condition APIs
  WatchConditionResponse,
  GetWatchConditionParams,
  SetWatchConditionParams,
  SetAuthTypeParams,
  GetWhiteListParams,
  GetWhiteListResponse,
  AddWhiteListParams,
  UpdateWhiteListParams,
  DeleteWhiteListParams,
  UploadWhiteListParams,
  DownloadWhiteListParams,
  SetExternalAuthParams,
  SetCustomAuthParams,
  SetDirectAuthParams,
  DirectAuthParams,
  DirectAuthResponse,
  GetRecordFieldParams,
  RecordFieldResponse,
  GetRecordInfoParams,
  RecordInfoResponse,
  EnrollListParams,
  EnrollListResponse,
  DownloadRecordInfoParams,
  UpdateAuthUrlParams,
  SetAuthorizedAddressParams,
  CustomAuthInfoResponse,
  PolyvUrlResponse,
  AuthSetting
} from '../types/web.js';
import { PolyVValidationError } from '../errors/polyv-validation-error.js';

/**
 * WebService
 *
 * Provides methods to interact with PolyV Live Web APIs.
 *
 * @example
 * ```typescript
 * const client = new PolyVClient({ appId: 'xxx', appSecret: 'yyy' });
 * const splash = await client.web.getSplash('123456');
 * ```
 */
export class WebService {
  private client: PolyVClient;

  /**
   * Create a new WebService instance
   *
   * @param client - The PolyVClient instance to use for API calls
   */
  constructor(client: PolyVClient) {
    this.client = client;
  }

  // ============================================
  // AC1: Web Info APIs
  // ============================================

  /**
   * Get splash screen settings
   * Query splash screen status and image URL for a channel
   *
   * @param channelId - Channel ID
   * @returns Splash screen settings
   *
   * @example
   * ```typescript
   * const splash = await client.web.getSplash('123456');
   * console.log(splash.splashEnabled, splash.splashImg);
   * ```
   */
  async getSplash(channelId: string): Promise<GetSplashResponse> {
    this.validateChannelId(channelId);
    const response = await this.client.httpClient.get<GetSplashResponse>(
      `/live/v2/channelSetting/${channelId}/getSplash`
    );
    return response as unknown as GetSplashResponse;
  }

  /**
   * Set splash screen settings
   * Configure splash screen on/off and optionally upload an image
   *
   * @param params - Set splash parameters
   * @returns Image URL if uploaded, or "success"
   *
   * @example
   * ```typescript
   * const result = await client.web.setSplash({
   *   channelId: '123456',
   *   splashEnabled: 'Y',
   * });
   * ```
   */
  async setSplash(params: SetSplashParams): Promise<string> {
    if (!params.channelId) {
      throw new PolyVValidationError('channelId is required');
    }
    if (!params.splashEnabled) {
      throw new PolyVValidationError('splashEnabled is required');
    }
    if (!['Y', 'N'].includes(params.splashEnabled)) {
      throw new PolyVValidationError('splashEnabled must be Y or N');
    }

    const response = await this.client.httpClient.post<string>(
      `/live/v2/channelSetting/${params.channelId}/setSplash`,
      null,
      { params: { splashEnabled: params.splashEnabled } }
    );
    return response as unknown as string;
  }

  /**
   * Set publisher name
   * Set the publisher/host name for a channel or all channels
   *
   * @param params - Set publisher parameters
   * @returns Channel ID on success
   *
   * @example
   * ```typescript
   * const result = await client.web.setPublisher({
   *   userId: 'user123',
   *   publisher: 'John Doe',
   *   channelId: '123456',
   * });
   * ```
   */
  async setPublisher(params: SetPublisherParams): Promise<string> {
    if (!params.userId) {
      throw new PolyVValidationError('userId is required');
    }
    if (!params.publisher || params.publisher.trim() === '') {
      throw new PolyVValidationError('publisher is required and cannot be empty');
    }
    if (params.publisher.length > 50) {
      throw new PolyVValidationError('publisher cannot exceed 50 characters');
    }

    const apiParams: Record<string, unknown> = {
      publisher: params.publisher,
    };
    if (params.channelId) {
      apiParams.channelId = params.channelId;
    }

    const response = await this.client.httpClient.post<string>(
      `/live/v2/channelSetting/${params.userId}/setPublisher`,
      null,
      { params: apiParams }
    );
    return response as unknown as string;
  }

  /**
   * Update channel name
   * Change the name of a channel
   *
   * @param params - Update parameters
   * @returns true on success
   *
   * @example
   * ```typescript
   * const result = await client.web.updateChannelName({
   *   channelId: '123456',
   *   name: 'New Channel Name',
   * });
   * ```
   */
  async updateChannelName(params: UpdateChannelNameParams): Promise<boolean> {
    if (!params.channelId) {
      throw new PolyVValidationError('channelId is required');
    }
    if (!params.name || params.name.trim() === '') {
      throw new PolyVValidationError('name is required and cannot be empty');
    }

    const response = await this.client.httpClient.post<boolean>(
      `/live/v2/channels/${params.channelId}/update`,
      null,
      { params: { name: params.name } }
    );
    return response as unknown as boolean;
  }

  /**
   * Update channel logo
   * Upload a new logo image for a channel
   *
   * @param params - Update parameters including image file
   * @returns Image URL on success
   *
   * @example
   * ```typescript
   * const result = await client.web.updateChannelLogo({
   *   channelId: '123456',
   *   imgfile: imageFile,
   * });
   * ```
   */
  async updateChannelLogo(params: UpdateChannelLogoParams): Promise<string> {
    if (!params.channelId) {
      throw new PolyVValidationError('channelId is required');
    }
    if (!params.imgfile) {
      throw new PolyVValidationError('imgfile is required');
    }

    // Note: This is a multipart upload API
    const response = await this.client.httpClient.post<string>(
      `/live/v2/channelSetting/${params.channelId}/setCoverImg`,
      null,
      { params: { imgfile: params.imgfile } }
    );
    return response as unknown as string;
  }

  /**
   * Get live likes for channels
   * Query likes and viewers count for one or more channels
   *
   * @param channelIds - Comma-separated channel IDs (max 20)
   * @returns Array of channel likes info
   *
   * @example
   * ```typescript
   * const likes = await client.web.liveLikes('123456,789012');
   * console.log(likes[0].likes, likes[0].viewers);
   * ```
   */
  async liveLikes(channelIds: string): Promise<LiveLikesResponse> {
    if (!channelIds || channelIds.trim() === '') {
      throw new PolyVValidationError('channelIds is required');
    }

    const response = await this.client.httpClient.get<LiveLikesResponse>(
      '/live/v2/channels/live-likes',
      { params: { channelIds } }
    );
    return response as unknown as LiveLikesResponse;
  }

  /**
   * Update likes and viewers count
   * Modify the likes and/or viewers count for a channel
   *
   * @param params - Update parameters
   * @returns "success" on success
   *
   * @example
   * ```typescript
   * const result = await client.web.updateLikes({
   *   channelId: '123456',
   *   likes: 99999,
   *   viewers: 1000000,
   * });
   * ```
   */
  async updateLikes(params: UpdateLikesParams): Promise<string> {
    if (!params.channelId) {
      throw new PolyVValidationError('channelId is required');
    }
    if (params.likes === undefined && params.viewers === undefined) {
      throw new PolyVValidationError('at least one of likes or viewers must be provided');
    }

    const apiParams: Record<string, number> = {};
    if (params.likes !== undefined) {
      apiParams.likes = params.likes;
    }
    if (params.viewers !== undefined) {
      apiParams.viewers = params.viewers;
    }

    const response = await this.client.httpClient.get<string>(
      `/live/v2/channels/${params.channelId}/update-likes`,
      { params: apiParams }
    );
    return response as unknown as string;
  }

  /**
   * Get countdown settings
   * Query countdown configuration for a channel
   *
   * @param channelId - Channel ID
   * @returns Countdown settings
   *
   * @example
   * ```typescript
   * const countdown = await client.web.getCountdown('123456');
   * console.log(countdown.startTime, countdown.bookingEnabled);
   * ```
   */
  async getCountdown(channelId: string): Promise<GetCountdownResponse> {
    this.validateChannelId(channelId);
    const response = await this.client.httpClient.get<GetCountdownResponse>(
      `/live/v2/channelSetting/${channelId}/get-countdown`
    );
    return response as unknown as GetCountdownResponse;
  }

  /**
   * Set countdown settings
   * Configure countdown and booking settings for a channel
   *
   * @param params - Set countdown parameters
   * @returns Empty string on success
   *
   * @example
   * ```typescript
   * const result = await client.web.setCountdown({
   *   channelId: '123456',
   *   bookingEnabled: 'Y',
   *   startTime: '2024-03-15 15:00:00',
   * });
   * ```
   */
  async setCountdown(params: SetCountdownParams): Promise<string> {
    if (!params.channelId) {
      throw new PolyVValidationError('channelId is required');
    }

    const apiParams: Record<string, unknown> = {};
    if (params.bookingEnabled !== undefined) {
      apiParams.bookingEnabled = params.bookingEnabled;
    }
    if (params.startTime) {
      apiParams.startTime = params.startTime;
    }

    const response = await this.client.httpClient.post<string>(
      `/live/v2/channelSetting/${params.channelId}/set-countdown`,
      null,
      { params: apiParams }
    );
    return response as unknown as string;
  }

  // ============================================
  // AC2: Menu Management APIs
  // ============================================

  /**
   * Get menu list for a channel
   * Query all menus for a channel
   *
   * @param params - Query parameters
   * @returns Array of menu items
   *
   * @example
   * ```typescript
   * const menus = await client.web.getMenuList({ channelId: '123456' });
   * console.log(menus);
   * ```
   */
  async getMenuList(params: GetMenuListParams): Promise<GetMenuListResponse> {
    if (!params.channelId) {
      throw new PolyVValidationError('channelId is required');
    }

    const apiParams: Record<string, unknown> = { channelId: params.channelId };
    if (params.lang) {
      apiParams.lang = params.lang;
    }

    const response = await this.client.httpClient.get<GetMenuListResponse>(
      '/live/v3/channel/menu/list',
      { params: apiParams }
    );
    return response as unknown as GetMenuListResponse;
  }

  /**
   * Add a new menu
   * Create a new menu for a channel
   *
   * @param params - Add menu parameters
   * @returns Created menu details
   *
   * @example
   * ```typescript
   * const menu = await client.web.addMenu({
   *   channelId: '123456',
   *   name: 'My Menu',
   *   type: 'text',
   *   content: 'Menu content',
   * });
   * ```
   */
  async addMenu(params: AddMenuParams): Promise<AddMenuResponse> {
    if (!params.channelId) {
      throw new PolyVValidationError('channelId is required');
    }
    if (!params.name || params.name.trim() === '') {
      throw new PolyVValidationError('name is required and cannot be empty');
    }
    if (!params.type) {
      throw new PolyVValidationError('type is required');
    }
    const validTypes = ['desc', 'chat', 'quiz', 'text', 'iframe', 'qa', 'buy', 'invite'];
    if (!validTypes.includes(params.type)) {
      throw new PolyVValidationError(`type must be one of: ${validTypes.join(', ')}`);
    }

    const apiParams: Record<string, unknown> = {
      channelId: params.channelId,
      name: params.name,
      type: params.type,
    };
    if (params.content) {
      apiParams.content = params.content;
    }
    if (params.lang) {
      apiParams.lang = params.lang;
    }
    if (params.iframeOpenType) {
      apiParams.iframeOpenType = params.iframeOpenType;
    }
    if (params.linkType !== undefined) {
      apiParams.linkType = params.linkType;
    }

    const response = await this.client.httpClient.post<AddMenuResponse>(
      '/live/v3/channel/menu/add',
      null,
      { params: apiParams }
    );
    return response as unknown as AddMenuResponse;
  }

  /**
   * Delete menus
   * Remove one or more menus from a channel
   *
   * @param params - Delete parameters
   * @returns 1 on success
   *
   * @example
   * ```typescript
   * const result = await client.web.deleteMenu({ menuIds: 'menu1,menu2' });
   * ```
   */
  async deleteMenu(params: DeleteMenuParams): Promise<number> {
    if (!params.menuIds || params.menuIds.trim() === '') {
      throw new PolyVValidationError('menuIds is required');
    }

    const apiParams: Record<string, unknown> = { menuIds: params.menuIds };
    if (params.lang) {
      apiParams.lang = params.lang;
    }

    const response = await this.client.httpClient.post<number>(
      '/live/v3/channel/menu/delete',
      null,
      { params: apiParams }
    );
    return response as unknown as number;
  }

  /**
   * Update menu content
   * Modify the content of an existing menu
   *
   * @param params - Update parameters
   * @returns "success" on success
   *
   * @example
   * ```typescript
   * const result = await client.web.updateMenu({
   *   menuId: 'menu123',
   *   content: 'Updated content',
   * });
   * ```
   */
  async updateMenu(params: UpdateMenuParams): Promise<string> {
    if (!params.menuId || params.menuId.trim() === '') {
      throw new PolyVValidationError('menuId is required');
    }
    if (!params.content) {
      throw new PolyVValidationError('content is required');
    }

    const apiParams: Record<string, unknown> = {
      channelId: params.channelId,
      menuId: params.menuId,
      content: params.content,
    };
    if (params.lang) {
      apiParams.lang = params.lang;
    }
    if (params.iframeOpenType) {
      apiParams.iframeOpenType = params.iframeOpenType;
    }
    if (params.linkType !== undefined) {
      apiParams.linkType = params.linkType;
    }

    const response = await this.client.httpClient.post<string>(
      '/live/v3/channel/menu/update',
      null,
      { params: apiParams }
    );
    return response as unknown as string;
  }

  /**
   * Set menu (live introduction)
   * Set the live introduction menu content
   *
   * @param params - Set menu parameters
   * @returns "success" on success
   *
   * @example
   * ```typescript
   * const result = await client.web.setMenu({
   *   userId: 'user123',
   *   channelId: '123456',
   *   menuType: 'desc',
   *   content: '<p>Introduction content</p>',
   * });
   * ```
   */
  async setMenu(params: SetMenuParams): Promise<string> {
    if (!params.userId) {
      throw new PolyVValidationError('userId is required');
    }
    if (!params.channelId) {
      throw new PolyVValidationError('channelId is required');
    }
    if (!params.menuType) {
      throw new PolyVValidationError('menuType is required');
    }
    if (params.menuType !== 'desc') {
      throw new PolyVValidationError('menuType must be desc');
    }
    if (!params.content) {
      throw new PolyVValidationError('content is required');
    }

    const response = await this.client.httpClient.post<string>(
      `/live/v2/channelSetting/${params.userId}/${params.channelId}/set-menu`,
      null,
      { params: { menuType: params.menuType, content: params.content } }
    );
    return response as unknown as string;
  }

  /**
   * Update menu rank (order)
   * Reorder menus by specifying their order
   *
   * @param params - Update rank parameters
   * @returns "success" on success
   *
   * @example
   * ```typescript
   * const result = await client.web.updateRank({
   *   channelId: '123456',
   *   menuIds: 'menu1,menu2,menu3',
   * });
   * ```
   */
  async updateRank(params: UpdateRankParams): Promise<string> {
    if (!params.channelId) {
      throw new PolyVValidationError('channelId is required');
    }
    if (!params.menuIds || params.menuIds.trim() === '') {
      throw new PolyVValidationError('menuIds is required');
    }

    const apiParams: Record<string, unknown> = {
      channelId: params.channelId,
      menuIds: params.menuIds,
    };
    if (params.lang) {
      apiParams.lang = params.lang;
    }

    const response = await this.client.httpClient.post<string>(
      '/live/v3/channel/menu/update-rank',
      null,
      { params: apiParams }
    );
    return response as unknown as string;
  }

  /**
   * Update consulting enabled
   * Toggle the consulting/quiz feature on/off
   *
   * @param params - Update parameters
   * @returns Empty string on success
   *
   * @example
   * ```typescript
   * const result = await client.web.updateConsultingEnabled({
   *   channelId: '123456',
   *   enabled: 'Y',
   * });
   * ```
   */
  async updateConsultingEnabled(params: UpdateConsultingEnabledParams): Promise<string> {
    if (!params.channelId) {
      throw new PolyVValidationError('channelId is required');
    }
    if (!params.enabled) {
      throw new PolyVValidationError('enabled is required');
    }
    if (!['Y', 'N'].includes(params.enabled)) {
      throw new PolyVValidationError('enabled must be Y or N');
    }

    const response = await this.client.httpClient.post<string>(
      `/live/v2/channel/menu/${params.channelId}/update-consulting-enabled`,
      null,
      { params: { enabled: params.enabled } }
    );
    return response as unknown as string;
  }

  /**
   * Get tuwen (image-text) list
   * Query image-text content for a channel
   *
   * @param params - Query parameters
   * @returns Tuwen content list with pagination
   *
   * @example
   * ```typescript
   * const tuwen = await client.web.getTuwenList({
   *   channelId: '123456',
   * });
   * console.log(tuwen.contents);
   * ```
   */
  async getTuwenList(params: GetTuwenListParams): Promise<GetTuwenListResponse> {
    if (!params.channelId) {
      throw new PolyVValidationError('channelId is required');
    }

    const apiParams: Record<string, unknown> = { channelId: params.channelId };
    if (params.id !== undefined) {
      apiParams.id = params.id;
    }
    if (params.imageMode) {
      apiParams.imageMode = params.imageMode;
    }

    // Note: Documentation says POST but example uses GET
    const response = await this.client.httpClient.get<GetTuwenListResponse>(
      '/live/v3/channel/watch/tuwen/list',
      { params: apiParams }
    );
    return response as unknown as GetTuwenListResponse;
  }

  // ============================================
  // Story 4.3: Page Interaction APIs
  // ============================================

  /**
   * Get donate settings
   * Query channel donation settings
   *
   * @param channelId - Channel ID (optional, omit for global settings)
   * @returns Donate settings
   *
   * @example
   * ```typescript
   * // Get channel donate settings
   * const donate = await client.web.getDonate('123456');
   * // Get global donate settings
   * const globalDonate = await client.web.getDonate();
   * ```
   */
  async getDonate(channelId?: string): Promise<GetDonateResponse> {
    const apiParams: Record<string, unknown> = {};
    if (channelId) {
      apiParams.channelId = channelId;
    }

    const response = await this.client.httpClient.get<GetDonateResponse>(
      '/live/v3/channel/donate/get',
      { params: apiParams }
    );
    return response as unknown as GetDonateResponse;
  }

  /**
   * Get weixin share settings
   * Query channel WeChat share information
   *
   * @param channelId - Channel ID (required)
   * @returns WeChat share settings
   *
   * @example
   * ```typescript
   * const share = await client.web.getWeixinShare('123456');
   * console.log(share.weixinShareTitle, share.weixinShareDesc);
   * ```
   */
  async getWeixinShare(channelId: string): Promise<GetWeixinShareResponse> {
    this.validateChannelId(channelId);

    const response = await this.client.httpClient.get<GetWeixinShareResponse>(
      '/live/v3/channel/weixin-share/get',
      { params: { channelId } }
    );
    return response as unknown as GetWeixinShareResponse;
  }

  /**
   * Update cash donation settings
   * Configure cash donation options for a channel
   *
   * @param params - Update cash parameters
   * @returns "success" on success
   *
   * @example
   * ```typescript
   * const result = await client.web.updateCash({
   *   channelId: '123456',
   *   cashes: [1, 2, 5, 10, 50, 100],
   *   cashMin: 1,
   *   enabled: 'Y',
   * });
   * ```
   */
  async updateCash(params: UpdateCashParams): Promise<string> {
    // Validate cashes array
    if (!params.cashes || !Array.isArray(params.cashes)) {
      throw new PolyVValidationError('cashes is required and must be an array');
    }
    if (params.cashes.length !== 6) {
      throw new PolyVValidationError('cashes must contain exactly 6 numbers');
    }

    // Validate cashMin
    if (params.cashMin === undefined || params.cashMin === null) {
      throw new PolyVValidationError('cashMin is required');
    }

    // Validate enabled
    if (params.enabled !== undefined && !['Y', 'N'].includes(params.enabled)) {
      throw new PolyVValidationError('enabled must be Y or N');
    }

    // Build request body
    const body: Record<string, unknown> = {
      cashes: params.cashes,
      cashMin: params.cashMin,
    };
    if (params.channelId) {
      body.channelId = params.channelId;
    }
    if (params.enabled) {
      body.enabled = params.enabled;
    }

    const response = await this.client.httpClient.post<string>(
      '/live/v3/channel/donate/update-cash',
      body
    );
    return response as unknown as string;
  }

  /**
   * Update goods donation settings
   * Configure goods/gifts donation options for a channel
   *
   * @param params - Update good parameters
   * @returns "success" on success
   *
   * @example
   * ```typescript
   * const result = await client.web.updateGood({
   *   channelId: '123456',
   *   goods: [
   *     { goodName: 'Rose', goodImg: 'http://...', goodPrice: 10, goodEnabled: 'Y' },
   *   ],
   *   enabled: 'Y',
   * });
   * ```
   */
  async updateGood(params: UpdateGoodParams): Promise<string> {
    // Validate goods array
    if (!params.goods || !Array.isArray(params.goods)) {
      throw new PolyVValidationError('goods is required and must be an array');
    }
    if (params.goods.length < 1 || params.goods.length > 10) {
      throw new PolyVValidationError('goods must contain 1-10 items');
    }

    // Validate each good item
    for (const good of params.goods) {
      if (!good.goodName || good.goodName.length > 5) {
        throw new PolyVValidationError('goodName is required and must be max 5 characters');
      }
      if (!good.goodImg || good.goodImg.length > 120) {
        throw new PolyVValidationError('goodImg is required and must be max 120 characters');
      }
      if (good.goodPrice === undefined || good.goodPrice === null) {
        throw new PolyVValidationError('goodPrice is required');
      }
      if (!good.goodEnabled || !['Y', 'N'].includes(good.goodEnabled)) {
        throw new PolyVValidationError('goodEnabled is required and must be Y or N');
      }
    }

    // Validate enabled
    if (params.enabled !== undefined && !['Y', 'N'].includes(params.enabled)) {
      throw new PolyVValidationError('enabled must be Y or N');
    }

    // Build request body
    const body: Record<string, unknown> = {
      goods: params.goods,
    };
    if (params.channelId) {
      body.channelId = params.channelId;
    }
    if (params.enabled) {
      body.enabled = params.enabled;
    }

    const response = await this.client.httpClient.post<string>(
      '/live/v3/channel/donate/update-good',
      body
    );
    return response as unknown as string;
  }

  /**
   * Update weixin share settings
   * Configure WeChat share title and description for a channel
   *
   * @param params - Update weixin share parameters
   * @returns "success" on success
   *
   * @example
   * ```typescript
   * const result = await client.web.updateWeixinShare({
   *   channelId: '123456',
   *   weixinShareTitle: 'My Live Stream',
   *   weixinShareDesc: 'Join my live stream!',
   * });
   * ```
   */
  async updateWeixinShare(params: UpdateWeixinShareParams): Promise<string> {
    this.validateChannelId(params.channelId);

    // Validate title length
    if (params.weixinShareTitle !== undefined && params.weixinShareTitle.length > 30) {
      throw new PolyVValidationError('weixinShareTitle must be max 30 characters');
    }

    // Validate description length
    if (params.weixinShareDesc !== undefined && params.weixinShareDesc.length > 120) {
      throw new PolyVValidationError('weixinShareDesc must be max 120 characters');
    }

    const apiParams: Record<string, unknown> = {
      channelId: params.channelId,
    };
    if (params.weixinShareTitle) {
      apiParams.weixinShareTitle = params.weixinShareTitle;
    }
    if (params.weixinShareDesc) {
      apiParams.weixinShareDesc = params.weixinShareDesc;
    }

    const response = await this.client.httpClient.post<string>(
      '/live/v3/channel/weixin-share/update',
      null,
      { params: apiParams }
    );
    return response as unknown as string;
  }

  // ============================================
  // Story 4.3: Setting APIs
  // ============================================

  /**
   * Update global enabled setting
   * Enable or disable a global setting type for a channel
   *
   * @param params - Update global enabled parameters
   * @returns "success" on success
   *
   * @example
   * ```typescript
   * // Enable donation setting for channel
   * await client.web.updateGlobalEnabled({
   *   channelId: '123456',
   *   globalEnabledType: 'donate',
   *   enabled: 'Y',
   * });
   * ```
   */
  async updateGlobalEnabled(params: UpdateGlobalEnabledParams): Promise<string> {
    this.validateChannelId(params.channelId);

    // Validate globalEnabledType
    const validTypes: string[] = [
      'auth', 'switch', 'marquee', 'restrict', 'donate',
      'advert', 'callback', 'player', 'watchtheme'
    ];
    if (!params.globalEnabledType || !validTypes.includes(params.globalEnabledType)) {
      throw new PolyVValidationError(
        `globalEnabledType must be one of: ${validTypes.join(', ')}`
      );
    }

    // Validate enabled
    if (!params.enabled || !['Y', 'N'].includes(params.enabled)) {
      throw new PolyVValidationError('enabled is required and must be Y or N');
    }

    const response = await this.client.httpClient.post<string>(
      '/live/v3/channel/common/update-global-enabled',
      null,
      {
        params: {
          channelId: params.channelId,
          globalEnabledType: params.globalEnabledType,
          enabled: params.enabled,
        }
      }
    );
    return response as unknown as string;
  }

  /**
   * Upload image
   * Upload channel decoration images
   *
   * @param params - Upload image parameters
   * @returns Array of uploaded image URLs
   *
   * @example
   * ```typescript
   * const urls = await client.web.uploadImage({
   *   type: 'coverImage',
   *   files: [imageFile],
   * });
   * console.log(urls[0]); // First uploaded image URL
   * ```
   */
  async uploadImage(params: UploadImageParams): Promise<UploadImageResponse> {
    // Validate type
    const validTypes: string[] = [
      'coverImage', 'splashImage', 'logoImage', 'adminAvatar', 'assistantAvatar',
      'authCodeImage', 'warmImage', 'adImage', 'startAdImage', 'stopAdImage',
      'goodImage', 'invitationImage', 'menuImage'
    ];
    if (!params.type || !validTypes.includes(params.type)) {
      throw new PolyVValidationError(
        `type must be one of: ${validTypes.join(', ')}`
      );
    }

    // Validate files
    if (!params.files || !Array.isArray(params.files) || params.files.length === 0) {
      throw new PolyVValidationError('files is required and must be a non-empty array');
    }
    if (params.files.length > 6) {
      throw new PolyVValidationError('files must contain 1-6 files');
    }

    // Build FormData
    const formData = new FormData();
    formData.append('type', params.type);
    for (const file of params.files) {
      formData.append('files', file);
    }

    const response = await this.client.httpClient.post<UploadImageResponse>(
      '/live/v3/common/upload-image',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response as unknown as UploadImageResponse;
  }

  // ============================================
  // Private Validation Helpers
  // ============================================

  /**
   * Validate channel ID
   */
  private validateChannelId(channelId: string): void {
    if (!channelId || channelId.trim() === '') {
      throw new PolyVValidationError('channelId is required');
    }
  }

  // ============================================
  // Story 4.5: Watch Condition APIs
  // ============================================

  /**
   * Get watch condition
   * Query channel watch condition settings
   *
   * @param params - Get watch condition parameters
   * @returns Watch condition settings
   *
   * @example
   * ```typescript
   * // Get channel watch condition
   * const condition = await client.web.getWatchCondition({ channelId: '123456' });
   * // Get global watch condition
   * const globalCondition = await client.web.getWatchCondition({});
   * ```
   */
  async getWatchCondition(params: GetWatchConditionParams): Promise<WatchConditionResponse> {
    const apiParams: Record<string, unknown> = {};
    if (params.channelId) {
      apiParams.channelId = params.channelId;
    }

    const response = await this.client.httpClient.get<WatchConditionResponse>(
      '/live/v3/channel/auth/get',
      { params: apiParams }
    );
    return response as unknown as WatchConditionResponse;
  }

  /**
   * Set watch condition
   * Update channel watch condition settings
   *
   * @param params - Set watch condition parameters
   * @returns "success" on success
   *
   * @example
   * ```typescript
   * const result = await client.web.setWatchCondition({
   *   channelId: '123456',
   *   authSettings: [
   *     { rank: 1, enabled: 'Y', authType: 'code', code: '123456' },
   *   ],
   * });
   * ```
   */
  async setWatchCondition(params: SetWatchConditionParams): Promise<string> {
    // Validate authSettings
    if (!params.authSettings || !Array.isArray(params.authSettings)) {
      throw new PolyVValidationError('authSettings is required and must be an array');
    }
    if (params.authSettings.length === 0) {
      throw new PolyVValidationError('authSettings must contain at least one item');
    }

    // Validate each authSetting
    for (const setting of params.authSettings) {
      if (setting.rank !== 1 && setting.rank !== 2) {
        throw new PolyVValidationError('rank must be 1 or 2');
      }
      if (setting.enabled && !['Y', 'N'].includes(setting.enabled)) {
        throw new PolyVValidationError('enabled must be Y or N');
      }
    }

    // Build request body
    const body: Record<string, unknown> = {
      authSettings: params.authSettings,
    };
    if (params.channelId) {
      body.channelId = params.channelId;
    }

    const response = await this.client.httpClient.post<string>(
      '/live/v3/channel/auth/update',
      body
    );
    return response as unknown as string;
  }

  /**
   * Set auth type (simple version)
   * Set channel authentication type
   *
   * @param params - Set auth type parameters
   * @returns "success" on success
   *
   * @example
   * ```typescript
   * const result = await client.web.setAuthType({
   *   channelId: '123456',
   *   authType: 'none',
   * });
   * ```
   */
  async setAuthType(params: SetAuthTypeParams): Promise<string> {
    this.validateChannelId(params.channelId);

    // Currently only 'none' is supported
    if (params.authType !== 'none') {
      throw new PolyVValidationError('authType must be "none" (currently only this value is supported)');
    }

    const response = await this.client.httpClient.post<string>(
      `/live/v2/channelSetting/${params.channelId}/set-auth-type`,
      null,
      { params: { authType: params.authType } }
    );
    return response as unknown as string;
  }

  /**
   * Get white list
   * Query channel white list with pagination
   *
   * @param params - Get white list parameters
   * @returns Paginated white list
   *
   * @example
   * ```typescript
   * const result = await client.web.getWhiteList({
   *   rank: 1,
   *   channelId: '123456',
   *   page: 1,
   *   pageSize: 10,
   * });
   * ```
   */
  async getWhiteList(params: GetWhiteListParams): Promise<GetWhiteListResponse> {
    // Validate rank
    if (params.rank !== 1 && params.rank !== 2) {
      throw new PolyVValidationError('rank must be 1 or 2');
    }

    const apiParams: Record<string, unknown> = { rank: params.rank };
    if (params.channelId) {
      apiParams.channelId = params.channelId;
    }
    if (params.page !== undefined) {
      apiParams.page = params.page;
    }
    if (params.pageSize !== undefined) {
      apiParams.pageSize = params.pageSize;
    }
    if (params.keyword) {
      apiParams.keyword = params.keyword;
    }

    const response = await this.client.httpClient.get<GetWhiteListResponse>(
      '/live/v3/channel/auth/get-white-list',
      { params: apiParams }
    );
    return response as unknown as GetWhiteListResponse;
  }

  /**
   * Add white list item
   * Add a single item to channel white list
   *
   * @param params - Add white list parameters
   * @returns "success" or "true" on success
   *
   * @example
   * ```typescript
   * const result = await client.web.addWhiteList({
   *   rank: 1,
   *   code: '13800138000',
   *   name: 'John Doe',
   *   channelId: '123456',
   * });
   * ```
   */
  async addWhiteList(params: AddWhiteListParams): Promise<string> {
    // Validate rank
    if (params.rank !== 1 && params.rank !== 2) {
      throw new PolyVValidationError('rank must be 1 or 2');
    }
    // Validate code
    if (!params.code || params.code.trim() === '') {
      throw new PolyVValidationError('code is required');
    }
    if (params.code.length > 50) {
      throw new PolyVValidationError('code cannot exceed 50 characters');
    }
    // Validate name
    if (params.name && params.name.length > 50) {
      throw new PolyVValidationError('name cannot exceed 50 characters');
    }

    const apiParams: Record<string, unknown> = {
      rank: params.rank,
      code: params.code,
    };
    if (params.name) {
      apiParams.name = params.name;
    }
    if (params.channelId) {
      apiParams.channelId = params.channelId;
    }

    const response = await this.client.httpClient.post<string>(
      '/live/v3/channel/auth/add-white-list',
      null,
      { params: apiParams }
    );
    return response as unknown as string;
  }

  /**
   * Update white list item
   * Update a single item in channel white list
   *
   * @param params - Update white list parameters
   * @returns "success" or "true" on success
   *
   * @example
   * ```typescript
   * const result = await client.web.updateWhiteList({
   *   rank: 1,
   *   oldCode: '13800138000',
   *   code: '13900139000',
   *   name: 'Updated Name',
   *   channelId: '123456',
   * });
   * ```
   */
  async updateWhiteList(params: UpdateWhiteListParams): Promise<string> {
    // Validate rank
    if (params.rank !== 1 && params.rank !== 2) {
      throw new PolyVValidationError('rank must be 1 or 2');
    }
    // Validate oldCode
    if (!params.oldCode || params.oldCode.trim() === '') {
      throw new PolyVValidationError('oldCode is required');
    }
    // Validate code
    if (!params.code || params.code.trim() === '') {
      throw new PolyVValidationError('code is required');
    }
    if (params.code.length > 50) {
      throw new PolyVValidationError('code cannot exceed 50 characters');
    }
    // Validate name
    if (params.name && params.name.length > 50) {
      throw new PolyVValidationError('name cannot exceed 50 characters');
    }

    const apiParams: Record<string, unknown> = {
      rank: params.rank,
      oldCode: params.oldCode,
      code: params.code,
    };
    if (params.name) {
      apiParams.name = params.name;
    }
    if (params.channelId) {
      apiParams.channelId = params.channelId;
    }

    const response = await this.client.httpClient.post<string>(
      '/live/v3/channel/auth/update-white-list',
      null,
      { params: apiParams }
    );
    return response as unknown as string;
  }

  /**
   * Delete white list items
   * Delete one or more items from channel white list
   *
   * @param params - Delete white list parameters
   * @returns "success" or "true" on success
   *
   * @example
   * ```typescript
   * // Delete specific codes
   * const result = await client.web.deleteWhiteList({
   *   rank: 1,
   *   isClear: 'N',
   *   codes: '13800138000,13800138001',
   *   channelId: '123456',
   * });
   *
   * // Clear all
   * const result = await client.web.deleteWhiteList({
   *   rank: 1,
   *   isClear: 'Y',
   *   channelId: '123456',
   * });
   * ```
   */
  async deleteWhiteList(params: DeleteWhiteListParams): Promise<string> {
    // Validate rank
    if (params.rank !== 1 && params.rank !== 2) {
      throw new PolyVValidationError('rank must be 1 or 2');
    }
    // Validate isClear
    if (!params.isClear) {
      throw new PolyVValidationError('isClear is required');
    }
    // Validate codes when isClear=N
    if (params.isClear === 'N' && (!params.codes || params.codes.trim() === '')) {
      throw new PolyVValidationError('codes is required when isClear=N');
    }

    const apiParams: Record<string, unknown> = {
      rank: params.rank,
      isClear: params.isClear,
    };
    // API uses 'code' (singular) not 'codes'
    if (params.codes) {
      apiParams.code = params.codes;
    }
    if (params.channelId) {
      apiParams.channelId = params.channelId;
    }

    const response = await this.client.httpClient.post<string>(
      '/live/v3/channel/auth/delete-white-list',
      null,
      { params: apiParams }
    );
    return response as unknown as string;
  }

  /**
   * Upload white list
   * Batch upload white list from Excel file
   *
   * @param params - Upload white list parameters
   * @returns "true" on success
   *
   * @example
   * ```typescript
   * const result = await client.web.uploadWhiteList({
   *   rank: 1,
   *   file: excelFile,
   *   channelId: '123456',
   * });
   * ```
   */
  async uploadWhiteList(params: UploadWhiteListParams): Promise<string> {
    // Validate rank
    if (params.rank !== 1 && params.rank !== 2) {
      throw new PolyVValidationError('rank must be 1 or 2');
    }
    // Validate file
    if (!params.file) {
      throw new PolyVValidationError('file is required');
    }

    // Build FormData
    const formData = new FormData();
    formData.append('rank', params.rank.toString());
    formData.append('file', params.file);
    if (params.channelId) {
      formData.append('channelId', params.channelId);
    }

    const response = await this.client.httpClient.post<string>(
      '/live/v3/channel/auth/upload-white-list',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response as unknown as string;
  }

  /**
   * Download white list template
   * Download the white list Excel template
   *
   * @param params - Download white list parameters
   * @returns File stream (binary data)
   *
   * @example
   * ```typescript
   * const result = await client.web.downloadWhiteList({
   *   rank: 1,
   *   channelId: '123456',
   * });
   * ```
   */
  async downloadWhiteList(params: DownloadWhiteListParams): Promise<unknown> {
    // Validate rank
    if (params.rank !== 1 && params.rank !== 2) {
      throw new PolyVValidationError('rank must be 1 or 2');
    }

    const apiParams: Record<string, unknown> = { rank: params.rank };
    if (params.channelId) {
      apiParams.channelId = params.channelId;
    }

    const response = await this.client.httpClient.get<unknown>(
      '/live/v3/channel/auth/download-white-list',
      { params: apiParams, responseType: 'arraybuffer' }
    );
    return response as unknown as unknown;
  }

  /**
   * Set external auth
   * Configure external authorization settings
   *
   * @param params - Set external auth parameters
   * @returns "success" on success
   *
   * @example
   * ```typescript
   * const result = await client.web.setExternalAuth({
   *   channelId: '123456',
   *   externalKey: 'your-key',
   *   externalUri: 'https://your-auth-server.com/auth',
   * });
   * ```
   */
  async setExternalAuth(params: SetExternalAuthParams): Promise<string> {
    this.validateChannelId(params.channelId);

    const apiParams: Record<string, unknown> = { channelId: params.channelId };
    if (params.externalKey !== undefined) {
      apiParams.externalKey = params.externalKey;
    }
    if (params.externalUri !== undefined) {
      apiParams.externalUri = params.externalUri;
    }
    if (params.externalRedirectUri !== undefined) {
      apiParams.externalRedirectUri = params.externalRedirectUri;
    }
    if (params.externalButtonEnabled !== undefined) {
      if (!['Y', 'N'].includes(params.externalButtonEnabled)) {
        throw new PolyVValidationError('externalButtonEnabled must be Y or N');
      }
      apiParams.externalButtonEnabled = params.externalButtonEnabled;
    }

    const response = await this.client.httpClient.post<string>(
      '/live/v3/channel/auth/external/set',
      null,
      { params: apiParams }
    );
    return response as unknown as string;
  }

  /**
   * Set custom auth
   * Configure custom authorization settings
   *
   * @param params - Set custom auth parameters
   * @returns "success" on success
   *
   * @example
   * ```typescript
   * const result = await client.web.setCustomAuth({
   *   channelId: '123456',
   *   customKey: 'your-key',
   *   customUri: 'https://your-auth-server.com/custom',
   * });
   * ```
   */
  async setCustomAuth(params: SetCustomAuthParams): Promise<string> {
    this.validateChannelId(params.channelId);

    const apiParams: Record<string, unknown> = { channelId: params.channelId };
    if (params.customKey !== undefined) {
      apiParams.customKey = params.customKey;
    }
    if (params.customUri !== undefined) {
      apiParams.customUri = params.customUri;
    }

    const response = await this.client.httpClient.post<string>(
      '/live/v3/channel/auth/custom/set',
      null,
      { params: apiParams }
    );
    return response as unknown as string;
  }

  /**
   * Set direct auth
   * Configure direct authorization settings
   *
   * @param params - Set direct auth parameters
   * @returns "success" on success
   *
   * @example
   * ```typescript
   * const result = await client.web.setDirectAuth({
   *   channelId: '123456',
   *   directKey: 'your-direct-key',
   * });
   * ```
   */
  async setDirectAuth(params: SetDirectAuthParams): Promise<string> {
    this.validateChannelId(params.channelId);

    const apiParams: Record<string, unknown> = { channelId: params.channelId };
    if (params.directKey !== undefined) {
      apiParams.directKey = params.directKey;
    }

    const response = await this.client.httpClient.post<string>(
      '/live/v3/channel/auth/direct/set',
      null,
      { params: apiParams }
    );
    return response as unknown as string;
  }

  /**
   * Get direct auth
   * Query direct authorization settings
   *
   * @param params - Direct auth parameters
   * @returns Direct auth settings
   *
   * @example
   * ```typescript
   * const result = await client.web.directAuth({ channelId: '123456' });
   * console.log(result.directKey);
   * ```
   */
  async directAuth(params: DirectAuthParams): Promise<DirectAuthResponse> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<DirectAuthResponse>(
      '/live/v3/channel/auth/direct/get',
      { params: { channelId: params.channelId } }
    );
    return response as unknown as DirectAuthResponse;
  }

  /**
   * Get record field
   * Query registration watching field settings
   *
   * @param params - Get record field parameters
   * @returns Record field settings
   *
   * @example
   * ```typescript
   * const result = await client.web.getRecordField({ channelId: '123456' });
   * console.log(result.infoFields);
   * ```
   */
  async getRecordField(params: GetRecordFieldParams): Promise<RecordFieldResponse> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<RecordFieldResponse>(
      '/live/v3/channel/auth/get-record-field',
      { params: { channelId: params.channelId } }
    );
    return response as unknown as RecordFieldResponse;
  }

  /**
   * Get record info
   * Query registration watching information
   *
   * @param params - Get record info parameters
   * @returns Record info list
   *
   * @example
   * ```typescript
   * const result = await client.web.getRecordInfo({ channelId: '123456' });
   * console.log(result.contents);
   * ```
   */
  async getRecordInfo(params: GetRecordInfoParams): Promise<RecordInfoResponse> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<RecordInfoResponse>(
      '/live/v3/channel/auth/get-record-info',
      { params: { channelId: params.channelId } }
    );
    return response as unknown as RecordInfoResponse;
  }

  /**
   * Get enroll list
   * Query enrollment/registration list
   *
   * @param params - Enroll list parameters
   * @returns Enroll list with pagination
   *
   * @example
   * ```typescript
   * const result = await client.web.enrollList({
   *   channelId: '123456',
   *   page: 1,
   *   pageSize: 10,
   * });
   * ```
   */
  async enrollList(params: EnrollListParams): Promise<EnrollListResponse> {
    this.validateChannelId(params.channelId);

    const apiParams: Record<string, unknown> = { channelId: params.channelId };
    if (params.page !== undefined) {
      apiParams.page = params.page;
    }
    if (params.pageSize !== undefined) {
      apiParams.pageSize = params.pageSize;
    }

    const response = await this.client.httpClient.get<EnrollListResponse>(
      '/live/v3/channel/auth/enroll/list',
      { params: apiParams }
    );
    return response as unknown as EnrollListResponse;
  }

  /**
   * Download record info
   * Download registration watching information as file
   *
   * @param params - Download record info parameters
   * @returns File stream (binary data)
   *
   * @example
   * ```typescript
   * const result = await client.web.downloadRecordInfo({ channelId: '123456' });
   * ```
   */
  async downloadRecordInfo(params: DownloadRecordInfoParams): Promise<unknown> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<unknown>(
      '/live/v3/channel/auth/download-record-info',
      { params: { channelId: params.channelId }, responseType: 'arraybuffer' }
    );
    return response as unknown as unknown;
  }

  /**
   * Update auth URL
   * Update authorization redirect URL
   *
   * @param params - Update auth URL parameters
   * @returns "success" on success
   *
   * @example
   * ```typescript
   * const result = await client.web.updateAuthUrl({
   *   channelId: '123456',
   *   authUrl: 'https://example.com/auth-callback',
   * });
   * ```
   */
  async updateAuthUrl(params: UpdateAuthUrlParams): Promise<string> {
    this.validateChannelId(params.channelId);

    const apiParams: Record<string, unknown> = { channelId: params.channelId };
    if (params.authUrl !== undefined) {
      apiParams.authUrl = params.authUrl;
    }

    const response = await this.client.httpClient.post<string>(
      '/live/v3/channel/auth/update-auth-url',
      null,
      { params: apiParams }
    );
    return response as unknown as string;
  }

  /**
   * Set authorized address
   * Configure authorized IP addresses
   *
   * @param params - Set authorized address parameters
   * @returns "success" on success
   *
   * @example
   * ```typescript
   * const result = await client.web.setAuthorizedAddress({
   *   channelId: '123456',
   *   authAddresses: '192.168.1.1,192.168.1.2',
   * });
   * ```
   */
  async setAuthorizedAddress(params: SetAuthorizedAddressParams): Promise<string> {
    this.validateChannelId(params.channelId);

    const apiParams: Record<string, unknown> = { channelId: params.channelId };
    if (params.authAddresses !== undefined) {
      apiParams.authAddresses = params.authAddresses;
    }

    const response = await this.client.httpClient.post<string>(
      '/live/v3/channel/auth/set-authorized-address',
      null,
      { params: apiParams }
    );
    return response as unknown as string;
  }

  /**
   * Get custom auth info (customauth2)
   * Query custom authorization information
   *
   * @param channelId - Channel ID (required)
   * @returns Custom auth info
   *
   * @example
   * ```typescript
   * const result = await client.web.customauth2('123456');
   * console.log(result.customKey, result.customUri);
   * ```
   */
  async customauth2(channelId: string): Promise<CustomAuthInfoResponse> {
    this.validateChannelId(channelId);

    const response = await this.client.httpClient.get<CustomAuthInfoResponse>(
      '/live/v3/channel/auth/customauth2',
      { params: { channelId } }
    );
    return response as unknown as CustomAuthInfoResponse;
  }

  /**
   * Get PolyV URL
   * Get PolyV authorization URL
   *
   * @param channelId - Channel ID (required)
   * @returns PolyV auth URL
   *
   * @example
   * ```typescript
   * const result = await client.web.polyvUrl('123456');
   * console.log(result.url);
   * ```
   */
  async polyvUrl(channelId: string): Promise<PolyvUrlResponse> {
    this.validateChannelId(channelId);

    const response = await this.client.httpClient.get<PolyvUrlResponse>(
      '/live/v3/channel/auth/polyv-url',
      { params: { channelId } }
    );
    return response as unknown as PolyvUrlResponse;
  }
}
