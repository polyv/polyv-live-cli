/**
 * Finance Service
 *
 * Service for managing PolyV finance-related operations (Audio/Video Moderation).
 * Provides methods for audio and video moderation settings and records.
 *
 * @module services/finance
 */

import type { PolyVClient } from '../client.js';
import type {
  AudioModerationSettings,
  ListAudioModerationRecordsParams,
  ListAudioModerationRecordsResponse,
  UpdateAudioModerationSettingsParams,
  VideoModerationSettings,
  UpdateVideoModerationSettingsParams,
  ListVideoModerationResultsParams,
  ListVideoModerationResultsResponse,
  IllegalNotifySettings,
} from '../types/finance.js';
import { PolyVValidationError } from '../errors/polyv-validation-error.js';

/**
 * FinanceService
 *
 * Provides methods to interact with PolyV Finance APIs (Audio/Video Moderation).
 *
 * @example
 * ```typescript
 * const client = new PolyVClient({ appId: 'xxx', appSecret: 'yyy' });
 * const settings = await client.finance.getAudioModerationSettings(123456);
 * ```
 */
export class FinanceService {
  private client: PolyVClient;

  /**
   * Create a new FinanceService instance
   *
   * @param client - The PolyVClient instance to use for API calls
   */
  constructor(client: PolyVClient) {
    this.client = client;
  }

  // ============================================
  // Audio Moderation APIs
  // ============================================

  /**
   * Get audio moderation settings
   * Query audio moderation settings for a channel
   *
   * @param channelId - Channel ID
   * @returns Audio moderation settings
   *
   * @example
   * ```typescript
   * const settings = await client.finance.getAudioModerationSettings(123456);
   * console.log(settings.moderationEnabled);
   * ```
   */
  async getAudioModerationSettings(channelId: number | string): Promise<AudioModerationSettings> {
    // Validate channelId
    this.validateChannelId(channelId);

    const response = await this.client.httpClient.get<AudioModerationSettings>(
      '/live/v4/channel/audio-moderation/get',
      { params: { channelId } }
    );
    return response as unknown as AudioModerationSettings;
  }

  /**
   * List audio moderation records
   * Query paginated list of audio moderation records
   *
   * @param channelId - Channel ID
   * @param params - Optional filter parameters
   * @returns Paginated list of audio moderation records
   *
   * @example
   * ```typescript
   * const records = await client.finance.listAudioModerationRecords(123456, {
   *   pageNumber: 1,
   *   pageSize: 10,
   * });
   * ```
   */
  async listAudioModerationRecords(
    channelId: number | string,
    params?: Omit<ListAudioModerationRecordsParams, 'channelId'>
  ): Promise<ListAudioModerationRecordsResponse> {
    // Validate channelId
    this.validateChannelId(channelId);

    // Validate pagination
    if (params) {
      this.validatePagination(params);
    }

    const apiParams: Record<string, unknown> = { channelId };
    if (params) {
      if (params.pageNumber !== undefined) {
        apiParams.pageNumber = params.pageNumber;
      }
      if (params.pageSize !== undefined) {
        apiParams.pageSize = params.pageSize;
      }
      if (params.startTime !== undefined) {
        apiParams.startTime = params.startTime;
      }
      if (params.endTime !== undefined) {
        apiParams.endTime = params.endTime;
      }
      if (params.sessionId !== undefined) {
        apiParams.sessionId = params.sessionId;
      }
      if (params.moderationStrategy !== undefined) {
        apiParams.moderationStrategy = params.moderationStrategy;
      }
      if (params.resultType !== undefined) {
        apiParams.resultType = params.resultType;
      }
    }

    const response = await this.client.httpClient.get<ListAudioModerationRecordsResponse>(
      '/live/v4/channel/audio-moderation/list',
      { params: apiParams }
    );
    return response as unknown as ListAudioModerationRecordsResponse;
  }

  /**
   * Update audio moderation settings
   * Modify audio moderation settings for a channel
   *
   * @param channelId - Channel ID
   * @param settings - Update parameters
   * @returns true on success
   *
   * @example
   * ```typescript
   * await client.finance.updateAudioModerationSettings(123456, {
   *   moderationEnabled: 'Y',
   *   moderationStrategy: 'normal',
   * });
   * ```
   */
  async updateAudioModerationSettings(
    channelId: number | string,
    settings: UpdateAudioModerationSettingsParams
  ): Promise<boolean> {
    // Validate channelId
    this.validateChannelId(channelId);

    // Validate settings
    if (settings.moderationEnabled !== undefined) {
      this.validateYNValue(settings.moderationEnabled, 'moderationEnabled');
    }
    if (settings.moderationStrategy !== undefined) {
      this.validateAudioModerationStrategy(settings.moderationStrategy);
    }
    if (settings.badwordEnabled !== undefined) {
      this.validateYNValue(settings.badwordEnabled, 'badwordEnabled');
    }
    if (settings.illegalNotify !== undefined) {
      this.validateIllegalNotify(settings.illegalNotify);
    }

    const body: Record<string, unknown> = {};
    if (settings.moderationEnabled !== undefined) {
      body.moderationEnabled = settings.moderationEnabled;
    }
    if (settings.moderationStrategy !== undefined) {
      body.moderationStrategy = settings.moderationStrategy;
    }
    if (settings.badwordEnabled !== undefined) {
      body.badwordEnabled = settings.badwordEnabled;
    }
    if (settings.illegalNotify !== undefined) {
      body.illegalNotify = settings.illegalNotify;
    }

    const response = await this.client.httpClient.post<boolean>(
      '/live/v4/channel/audio-moderation/update',
      body,
      { params: { channelId } }
    );
    return response as unknown as boolean;
  }

  // ============================================
  // Video Moderation APIs
  // ============================================

  /**
   * Get video moderation settings
   * Query video moderation settings for a channel
   *
   * @param channelId - Channel ID
   * @returns Video moderation settings
   *
   * @example
   * ```typescript
   * const settings = await client.finance.getVideoModerationSettings(123456);
   * console.log(settings.imageFrequency);
   * ```
   */
  async getVideoModerationSettings(channelId: number | string): Promise<VideoModerationSettings> {
    // Validate channelId
    this.validateChannelId(channelId);

    const response = await this.client.httpClient.get<VideoModerationSettings>(
      '/live/v4/channel/video-moderation/get',
      { params: { channelId } }
    );
    return response as unknown as VideoModerationSettings;
  }

  /**
   * Update video moderation settings
   * Modify video moderation settings for a channel
   *
   * @param channelId - Channel ID
   * @param settings - Update parameters (all required)
   * @returns true on success
   *
   * @example
   * ```typescript
   * await client.finance.updateVideoModerationSettings(123456, {
   *   moderationEnabled: 'Y',
   *   moderationStrategy: 'finance_serious',
   *   imageFrequency: 60,
   *   illegalNotify: {
   *     platformEnabled: 'Y',
   *   },
   * });
   * ```
   */
  async updateVideoModerationSettings(
    channelId: number | string,
    settings: UpdateVideoModerationSettingsParams
  ): Promise<boolean> {
    // Validate channelId
    this.validateChannelId(channelId);

    // Validate required fields
    if (settings.moderationEnabled === undefined) {
      throw new PolyVValidationError('moderationEnabled is required');
    }
    if (settings.moderationStrategy === undefined) {
      throw new PolyVValidationError('moderationStrategy is required');
    }
    if (settings.imageFrequency === undefined) {
      throw new PolyVValidationError('imageFrequency is required');
    }
    if (settings.illegalNotify === undefined) {
      throw new PolyVValidationError('illegalNotify is required');
    }

    // Validate values
    this.validateYNValue(settings.moderationEnabled, 'moderationEnabled');
    this.validateVideoModerationStrategy(settings.moderationStrategy);
    this.validateImageFrequency(settings.imageFrequency);
    this.validateIllegalNotify(settings.illegalNotify);

    const body: Record<string, unknown> = {
      moderationEnabled: settings.moderationEnabled,
      moderationStrategy: settings.moderationStrategy,
      imageFrequency: settings.imageFrequency,
      illegalNotify: settings.illegalNotify,
    };

    const response = await this.client.httpClient.post<boolean>(
      '/live/v4/channel/video-moderation/update',
      body,
      { params: { channelId } }
    );
    return response as unknown as boolean;
  }

  /**
   * List video moderation results
   * Query paginated list of video moderation results
   *
   * @param channelId - Channel ID
   * @param params - Optional filter parameters
   * @returns Paginated list of video moderation results
   *
   * @example
   * ```typescript
   * const results = await client.finance.listVideoModerationResults(123456, {
   *   sessionId: 'abc123',
   *   pageNumber: 1,
   *   pageSize: 20,
   * });
   * ```
   */
  async listVideoModerationResults(
    channelId: number | string,
    params?: Omit<ListVideoModerationResultsParams, 'channelId'>
  ): Promise<ListVideoModerationResultsResponse> {
    // Validate channelId
    this.validateChannelId(channelId);

    // Validate pagination
    if (params) {
      this.validatePagination(params);
    }

    const apiParams: Record<string, unknown> = { channelId };
    if (params) {
      if (params.pageNumber !== undefined) {
        apiParams.pageNumber = params.pageNumber;
      }
      if (params.pageSize !== undefined) {
        apiParams.pageSize = params.pageSize;
      }
      if (params.sessionId !== undefined) {
        apiParams.sessionId = params.sessionId;
      }
      if (params.label !== undefined) {
        apiParams.label = params.label;
      }
      if (params.resultType !== undefined) {
        apiParams.resultType = params.resultType;
      }
    }

    const response = await this.client.httpClient.get<ListVideoModerationResultsResponse>(
      '/live/v4/channel/video-moderation/result/list',
      { params: apiParams }
    );
    return response as unknown as ListVideoModerationResultsResponse;
  }

  // ============================================
  // Private Validation Helpers
  // ============================================

  /**
   * Validate channel ID
   */
  private validateChannelId(channelId: number | string): void {
    if (channelId === undefined || channelId === null) {
      throw new PolyVValidationError('channelId is required');
    }
    if (typeof channelId !== 'number' && typeof channelId !== 'string') {
      throw new PolyVValidationError('channelId must be a number or string');
    }
    if (typeof channelId === 'string' && channelId.trim() === '') {
      throw new PolyVValidationError('channelId is required');
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
   * Validate audio moderation strategy
   */
  private validateAudioModerationStrategy(strategy: string): void {
    const validStrategies = ['easy', 'normal', 'strict'];
    if (!validStrategies.includes(strategy)) {
      throw new PolyVValidationError(`moderationStrategy must be one of: ${validStrategies.join(', ')}`);
    }
  }

  /**
   * Validate video moderation strategy
   */
  private validateVideoModerationStrategy(strategy: string): void {
    const validStrategies = ['finance_easy', 'finance_normal', 'finance_serious'];
    if (!validStrategies.includes(strategy)) {
      throw new PolyVValidationError(`moderationStrategy must be one of: ${validStrategies.join(', ')}`);
    }
  }

  /**
   * Validate image frequency
   */
  private validateImageFrequency(frequency: number): void {
    const validFrequencies = [5, 20, 60];
    if (!validFrequencies.includes(frequency)) {
      throw new PolyVValidationError('imageFrequency must be 5, 20, or 60');
    }
  }

  /**
   * Validate illegal notify settings
   */
  private validateIllegalNotify(notify: IllegalNotifySettings): void {
    const validKeys = ['assistantEnabled', 'monitorEnabled', 'platformEnabled', 'talentEnabled'];
    for (const [key, value] of Object.entries(notify)) {
      if (!validKeys.includes(key)) {
        throw new PolyVValidationError(`Invalid illegalNotify key: ${key}`);
      }
      if (value !== undefined && value !== 'Y' && value !== 'N') {
        throw new PolyVValidationError(`illegalNotify.${key} must be "Y" or "N"`);
      }
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
}
