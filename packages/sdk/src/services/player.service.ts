/**
 * Player Service
 *
 * Service for managing PolyV player-related operations.
 * Provides methods for anti-record settings, adverts, logo, and watch feedback.
 *
 * @module services/player
 */

import type { PolyVClient } from '../client.js';
import type {
  AntiRecordSettingsParams,
  AntiRecordSettingsResponse,
  MarqueeUrlParams,
  HeadAdvertParams,
  StopAdvertParams,
  LogoParams,
  WatchFeedbackListParams,
  WatchFeedbackListResponse,
  ChannelDecorateGetResponse,
  ChannelDecorateUpdateParams,
} from '../types/player.js';
import { PolyVValidationError } from '../errors/polyv-validation-error.js';

/**
 * PlayerService
 *
 * Provides methods to interact with PolyV Player APIs (Anti-record, Adverts, Logo, Watch Feedback).
 *
 * @example
 * ```typescript
 * const client = new PolyVClient({ appId: 'xxx', appSecret: 'yyy' });
 * const settings = await client.player.getAntiRecordSettings(123456);
 * ```
 */
export class PlayerService {
  private client: PolyVClient;

  /**
   * Create a new PlayerService instance
   *
   * @param client - The PolyVClient instance to use for API calls
   */
  constructor(client: PolyVClient) {
    this.client = client;
  }

  // ============================================
  // Anti-Record Settings APIs
  // ============================================

  /**
   * Set anti-record settings
   * Configure anti-record (marquee/watermark) settings for a channel
   *
   * @param channelId - Channel ID
   * @param params - Anti-record settings parameters
   * @returns "SUCCESS" on success
   *
   * @example
   * ```typescript
   * await client.player.setAntiRecordSettings(123456, {
   *   antiRecordType: 'marquee',
   *   modelType: 'fixed',
   *   content: '用户ID：12345',
   *   fontSize: 14,
   * });
   * ```
   */
  async setAntiRecordSettings(
    channelId: number,
    params: AntiRecordSettingsParams
  ): Promise<string> {
    // Validate channelId
    this.validateChannelId(channelId);

    // Validate required parameters
    if (!params.antiRecordType) {
      throw new PolyVValidationError('antiRecordType is required');
    }
    if (!params.modelType) {
      throw new PolyVValidationError('modelType is required');
    }
    if (params.content === undefined) {
      throw new PolyVValidationError('content is required');
    }
    if (params.fontSize === undefined) {
      throw new PolyVValidationError('fontSize is required');
    }

    // Validate antiRecordType
    this.validateAntiRecordType(params.antiRecordType);

    // Validate modelType
    this.validateModelType(params.modelType);

    // Validate fontSize based on antiRecordType
    this.validateFontSize(params.fontSize, params.antiRecordType);

    // Validate optional parameters
    if (params.opacity !== undefined) {
      this.validateOpacity(params.opacity);
    }
    if (params.showMode !== undefined) {
      this.validateShowMode(params.showMode);
    }
    if (params.doubleEnabled !== undefined) {
      this.validateYNValue(params.doubleEnabled, 'doubleEnabled');
    }
    if (params.autoZoomEnabled !== undefined) {
      this.validateYNValue(params.autoZoomEnabled, 'autoZoomEnabled');
    }

    const requestParams: Record<string, unknown> = {
      channelId,
      antiRecordType: params.antiRecordType,
      modelType: params.modelType,
      content: params.content,
      fontSize: params.fontSize,
    };

    if (params.opacity !== undefined) {
      requestParams.opacity = params.opacity;
    }
    if (params.fontColor !== undefined) {
      requestParams.fontColor = params.fontColor;
    }
    if (params.showMode !== undefined) {
      requestParams.showMode = params.showMode;
    }
    if (params.doubleEnabled !== undefined) {
      requestParams.doubleEnabled = params.doubleEnabled;
    }
    if (params.autoZoomEnabled !== undefined) {
      requestParams.autoZoomEnabled = params.autoZoomEnabled;
    }

    const response = await this.client.httpClient.post<string>(
      '/live/v3/channel/anti/record/setting',
      null,
      { params: requestParams }
    );
    return response as unknown as string;
  }

  /**
   * Get anti-record settings
   * Query anti-record settings for a channel or account default template
   *
   * @param channelId - Channel ID (optional, returns account default template if not provided)
   * @returns Anti-record settings
   *
   * @example
   * ```typescript
   * const settings = await client.player.getAntiRecordSettings(123456);
   * // Or get account default template
   * const defaultSettings = await client.player.getAntiRecordSettings();
   * ```
   */
  async getAntiRecordSettings(channelId?: number): Promise<AntiRecordSettingsResponse> {
    const params: Record<string, number> = {};
    if (channelId !== undefined) {
      params.channelId = channelId;
    }

    const response = await this.client.httpClient.get<AntiRecordSettingsResponse>(
      '/live/v3/channel/anti/record/get',
      { params }
    );
    return response as unknown as AntiRecordSettingsResponse;
  }

  // ============================================
  // Marquee URL API
  // ============================================

  /**
   * Set marquee URL
   * Configure marquee jump URL settings for a channel
   *
   * @param channelId - Channel ID
   * @param params - Marquee URL parameters
   * @returns "设置成功" on success
   *
   * @example
   * ```typescript
   * await client.player.setMarqueeUrl(123456, {
   *   marqueeRestrict: 'Y',
   *   url: 'https://example.com/user/{userId}',
   * });
   * ```
   */
  async setMarqueeUrl(channelId: number, params: MarqueeUrlParams): Promise<string> {
    // Validate channelId
    this.validateChannelId(channelId);

    // Validate marqueeRestrict
    this.validateYNValue(params.marqueeRestrict, 'marqueeRestrict');

    // Validate url is required when marqueeRestrict is "Y"
    if (params.marqueeRestrict === 'Y' && !params.url) {
      throw new PolyVValidationError('url is required when marqueeRestrict is "Y"');
    }

    // marqueeRestrict and url must be signed query params (not an unsigned body),
    // otherwise the server reports "marqueeRestrict is wrong". See the PHP example in
    // docs/live/api/channel/marquee/set_diyurl-marquee.md and ChannelService.setDiyUrlMarquee.
    const queryParams: Record<string, unknown> = {
      marqueeRestrict: params.marqueeRestrict,
    };

    if (params.url !== undefined) {
      queryParams.url = params.url;
    }

    const response = await this.client.httpClient.get<string>(
      `/live/v2/channelRestrict/${channelId}/set-diyurl-marquee`,
      { params: queryParams }
    );
    return response as unknown as string;
  }

  // ============================================
  // Head Advert API
  // ============================================

  /**
   * Update head advert
   * Configure head advert settings for a channel
   *
   * @param channelId - Channel ID
   * @param params - Head advert parameters
   * @returns true on success
   *
   * @example
   * ```typescript
   * await client.player.updateHeadAdvert(123456, {
   *   headAdvertType: 'IMAGE',
   *   headAdvertImage: 'https://example.com/ad.jpg',
   * });
   * ```
   */
  async updateHeadAdvert(channelId: number, params: HeadAdvertParams): Promise<boolean> {
    // Validate channelId
    this.validateChannelId(channelId);

    // Validate headAdvertType
    this.validateHeadAdvertType(params.headAdvertType);

    // Validate enabled if provided
    if (params.enabled !== undefined) {
      this.validateYNValue(params.enabled, 'enabled');
    }

    const body: Record<string, unknown> = {
      headAdvertType: params.headAdvertType,
    };

    if (params.headAdvertImage !== undefined) {
      body.headAdvertImage = params.headAdvertImage;
    }
    if (params.headAdvertFlv !== undefined) {
      body.headAdvertFlv = params.headAdvertFlv;
    }
    if (params.headAdvertHref !== undefined) {
      body.headAdvertHref = params.headAdvertHref;
    }
    if (params.headAdvertDuration !== undefined) {
      body.headAdvertDuration = params.headAdvertDuration;
    }
    if (params.headAdvertWidth !== undefined) {
      body.headAdvertWidth = params.headAdvertWidth;
    }
    if (params.headAdvertHeight !== undefined) {
      body.headAdvertHeight = params.headAdvertHeight;
    }
    if (params.enabled !== undefined) {
      body.enabled = params.enabled;
    }

    const response = await this.client.httpClient.post<boolean>(
      `/live/v2/channelAdvert/${channelId}/updateHead`,
      body
    );
    return response as unknown as boolean;
  }

  // ============================================
  // Stop Advert API
  // ============================================

  /**
   * Update stop advert
   * Configure stop (pause) advert settings for a channel
   *
   * @param channelId - Channel ID
   * @param params - Stop advert parameters
   * @returns true on success
   *
   * @example
   * ```typescript
   * await client.player.updateStopAdvert(123456, {
   *   enabled: 'Y',
   *   stopAdvertImage: 'https://example.com/pause-ad.jpg',
   * });
   * ```
   */
  async updateStopAdvert(channelId: number, params: StopAdvertParams): Promise<boolean> {
    // Validate channelId
    this.validateChannelId(channelId);

    // Validate enabled if provided
    if (params.enabled !== undefined) {
      this.validateYNValue(params.enabled, 'enabled');
    }

    const body: Record<string, unknown> = {};

    if (params.enabled !== undefined) {
      body.enabled = params.enabled;
    }
    if (params.stopAdvertImage !== undefined) {
      body.stopAdvertImage = params.stopAdvertImage;
    }
    if (params.stopAdvertHref !== undefined) {
      body.stopAdvertHref = params.stopAdvertHref;
    }

    const response = await this.client.httpClient.post<boolean>(
      `/live/v2/channelAdvert/${channelId}/updateStop`,
      body
    );
    return response as unknown as boolean;
  }

  // ============================================
  // Logo API
  // ============================================

  /**
   * Update logo
   * Configure logo settings for a channel
   *
   * @param channelId - Channel ID
   * @param params - Logo parameters
   * @returns true on success
   *
   * @example
   * ```typescript
   * await client.player.updateLogo(123456, {
   *   logoImage: 'https://example.com/logo.png',
   *   logoOpacity: 0.8,
   *   logoPosition: 'tr',
   * });
   * ```
   */
  async updateLogo(channelId: number, params: LogoParams): Promise<boolean> {
    // Validate channelId
    this.validateChannelId(channelId);

    // Validate logoImage is required
    if (!params.logoImage) {
      throw new PolyVValidationError('logoImage is required');
    }

    // Validate logoOpacity if provided
    if (params.logoOpacity !== undefined) {
      this.validateLogoOpacity(params.logoOpacity);
    }

    // Validate logoPosition if provided
    if (params.logoPosition !== undefined) {
      this.validateLogoPosition(params.logoPosition);
    }

    const body: Record<string, unknown> = {
      logoImage: params.logoImage,
    };

    if (params.logoOpacity !== undefined) {
      body.logoOpacity = params.logoOpacity;
    }
    if (params.logoPosition !== undefined) {
      body.logoPosition = params.logoPosition;
    }
    if (params.logoHref !== undefined) {
      body.logoHref = params.logoHref;
    }

    const response = await this.client.httpClient.post<boolean>(
      `/live/v2/channels/${channelId}/update`,
      body
    );
    return response as unknown as boolean;
  }

  // ============================================
  // Watch Feedback API
  // ============================================

  /**
   * Get watch feedback list
   * Query paginated list of watch feedback for a channel or all channels
   *
   * @param params - Query parameters
   * @returns Paginated list of watch feedback
   *
   * @example
   * ```typescript
   * const feedback = await client.player.getWatchFeedbackList({
   *   channelId: 123456,
   *   pageNumber: 1,
   *   pageSize: 10,
   * });
   * ```
   */
  async getWatchFeedbackList(
    params?: WatchFeedbackListParams
  ): Promise<WatchFeedbackListResponse> {
    // Validate pagination if provided
    if (params) {
      this.validatePagination(params);
    }

    const apiParams: Record<string, unknown> = {};
    if (params) {
      if (params.channelId !== undefined) {
        apiParams.channelId = params.channelId;
      }
      if (params.pageNumber !== undefined) {
        apiParams.pageNumber = params.pageNumber;
      }
      if (params.pageSize !== undefined) {
        apiParams.pageSize = params.pageSize;
      }
    }

    const response = await this.client.httpClient.get<WatchFeedbackListResponse>(
      '/live/v4/channel/feedback/list',
      { params: apiParams }
    );
    return response as unknown as WatchFeedbackListResponse;
  }

  // ============================================
  // Private Validation Helpers
  // ============================================

  /**
   * Validate channel ID
   */
  private validateChannelId(channelId: number): void {
    if (channelId === undefined || channelId === null) {
      throw new PolyVValidationError('channelId is required');
    }
    if (typeof channelId !== 'number') {
      throw new PolyVValidationError('channelId must be a number');
    }
  }

  /**
   * Validate Y/N value
   */
  private validateYNValue(value: string, field: string): void {
    if (value !== 'Y' && value !== 'N') {
      throw new PolyVValidationError(`${field} must be "Y" or "N"`);
    }
  }

  /**
   * Validate anti-record type
   */
  private validateAntiRecordType(type: string): void {
    const validTypes = ['marquee', 'watermark'];
    if (!validTypes.includes(type)) {
      throw new PolyVValidationError(`antiRecordType must be one of: ${validTypes.join(', ')}`);
    }
  }

  /**
   * Validate model type
   */
  private validateModelType(type: string): void {
    const validTypes = ['fixed', 'nickname', 'diyurl'];
    if (!validTypes.includes(type)) {
      throw new PolyVValidationError(`modelType must be one of: ${validTypes.join(', ')}`);
    }
  }

  /**
   * Validate font size based on anti-record type
   */
  private validateFontSize(fontSize: number | string, antiRecordType: string): void {
    if (antiRecordType === 'marquee') {
      if (typeof fontSize !== 'number' || fontSize < 1 || fontSize > 256) {
        throw new PolyVValidationError('fontSize must be a number between 1 and 256 for marquee type');
      }
    } else if (antiRecordType === 'watermark') {
      const validSizes = ['small', 'middle', 'large'];
      if (!validSizes.includes(fontSize as string)) {
        throw new PolyVValidationError(`fontSize must be one of: ${validSizes.join(', ')} for watermark type`);
      }
    }
  }

  /**
   * Validate opacity (0-100)
   */
  private validateOpacity(opacity: number): void {
    if (typeof opacity !== 'number' || opacity < 0 || opacity > 100) {
      throw new PolyVValidationError('opacity must be a number between 0 and 100');
    }
  }

  /**
   * Validate show mode
   */
  private validateShowMode(mode: string): void {
    const validModes = ['roll', 'flicker'];
    if (!validModes.includes(mode)) {
      throw new PolyVValidationError(`showMode must be one of: ${validModes.join(', ')}`);
    }
  }

  /**
   * Validate head advert type
   */
  private validateHeadAdvertType(type: string): void {
    const validTypes = ['NONE', 'IMAGE', 'FLV'];
    if (!validTypes.includes(type)) {
      throw new PolyVValidationError(`headAdvertType must be one of: ${validTypes.join(', ')}`);
    }
  }

  /**
   * Validate logo opacity (0, 1]
   */
  private validateLogoOpacity(opacity: number): void {
    if (typeof opacity !== 'number' || opacity <= 0 || opacity > 1) {
      throw new PolyVValidationError('logoOpacity must be a number in range (0, 1]');
    }
  }

  /**
   * Validate logo position
   */
  private validateLogoPosition(position: string): void {
    const validPositions = ['tl', 'tr', 'bl', 'br'];
    if (!validPositions.includes(position)) {
      throw new PolyVValidationError(`logoPosition must be one of: ${validPositions.join(', ')}`);
    }
  }

  /**
   * Validate pagination parameters
   */
  private validatePagination(params: { pageNumber?: number; pageSize?: number }): void {
    if (params.pageNumber !== undefined && params.pageNumber < 1) {
      throw new PolyVValidationError('pageNumber must be at least 1');
    }
    if (params.pageSize !== undefined) {
      if (params.pageSize < 1) {
        throw new PolyVValidationError('pageSize must be at least 1');
      }
      if (params.pageSize > 1000) {
        throw new PolyVValidationError('pageSize cannot exceed 1000');
      }
    }
  }

  // ============================================
  // Channel Decorate APIs (Story 10.5)
  // ============================================

  /**
   * Get channel decorate settings
   * Query channel player decoration settings (watermark, warmup image, etc.)
   *
   * @param channelId - Channel ID
   * @returns Channel decorate settings
   *
   * @example
   * ```typescript
   * const decorate = await client.player.getChannelDecorate(123456);
   * console.log(decorate.player.watermarkEnabled);
   * ```
   */
  async getChannelDecorate(channelId: number): Promise<ChannelDecorateGetResponse> {
    // Validate channelId
    this.validateChannelId(channelId);

    const response = await this.client.httpClient.get<ChannelDecorateGetResponse>(
      '/live/v4/channel/decorate/get',
      { params: { channelId } }
    );
    return response as unknown as ChannelDecorateGetResponse;
  }

  /**
   * Update channel decorate settings
   * Update channel player decoration settings (watermark, warmup image, etc.)
   *
   * @param channelId - Channel ID
   * @param params - Channel decorate update parameters
   * @returns true on success
   *
   * @example
   * ```typescript
   * await client.player.updateChannelDecorate(123456, {
   *   watermarkEnabled: 'Y',
   *   iconUrl: 'http://example.com/logo.png',
   *   iconPosition: 'br',
   *   logoOpacity: 0.8,
   * });
   * ```
   */
  async updateChannelDecorate(
    channelId: number,
    params: ChannelDecorateUpdateParams
  ): Promise<boolean> {
    // Validate channelId
    this.validateChannelId(channelId);

    // Validate iconPosition if provided
    if (params.iconPosition !== undefined) {
      this.validateLogoPosition(params.iconPosition);
    }

    // Validate logoOpacity if provided (0-1 range)
    if (params.logoOpacity !== undefined) {
      this.validateDecorateOpacity(params.logoOpacity);
    }

    // Validate Y/N values
    if (params.watermarkEnabled !== undefined) {
      this.validateYNValue(params.watermarkEnabled, 'watermarkEnabled');
    }
    if (params.warmUpEnabled !== undefined) {
      this.validateYNValue(params.warmUpEnabled, 'warmUpEnabled');
    }

    // Build request body with player object
    const playerBody: Record<string, unknown> = {};

    if (params.watermarkEnabled !== undefined) {
      playerBody.watermarkEnabled = params.watermarkEnabled;
    }
    if (params.iconUrl !== undefined) {
      playerBody.iconUrl = params.iconUrl;
    }
    if (params.iconPosition !== undefined) {
      playerBody.iconPosition = params.iconPosition;
    }
    if (params.logoOpacity !== undefined) {
      playerBody.logoOpacity = params.logoOpacity;
    }
    if (params.iconLink !== undefined) {
      playerBody.iconLink = params.iconLink;
    }
    if (params.warmUpEnabled !== undefined) {
      playerBody.warmUpEnabled = params.warmUpEnabled;
    }
    if (params.warmUpImageUrl !== undefined) {
      playerBody.warmUpImageUrl = params.warmUpImageUrl;
    }
    if (params.coverJumpUrl !== undefined) {
      playerBody.coverJumpUrl = params.coverJumpUrl;
    }
    if (params.backgroundUrl !== undefined) {
      playerBody.backgroundUrl = params.backgroundUrl;
    }
    if (params.basePV !== undefined) {
      playerBody.basePV = params.basePV;
    }
    if (params.actualPV !== undefined) {
      playerBody.actualPV = params.actualPV;
    }

    const body = { player: playerBody };

    const response = await this.client.httpClient.post<boolean>(
      '/live/v4/channel/decorate/update',
      body,
      { params: { channelId } }
    );
    return response as unknown as boolean;
  }

  /**
   * Validate decorate opacity (0-1)
   */
  private validateDecorateOpacity(opacity: number): void {
    if (typeof opacity !== 'number' || opacity < 0 || opacity > 1) {
      throw new PolyVValidationError('logoOpacity must be a number between 0 and 1');
    }
  }
}
