/**
 * @fileoverview Promotion SDK wrapper service for CLI
 * @author Development Team
 * @since 14.1.0
 */

import { PolyVClient } from 'polyv-live-api-sdk';
import { AuthConfig } from '../types/auth';
import { PromotionServiceConfig, PromotionChannel, CreatedPromotion } from '../types/promotion';

// SDK types don't match actual API response, so we define our own
interface ApiPopularizationInfo {
  promoteId: string;
  popularizationName: string;
  visitsNum?: number;
  reservationNum?: number;
  watchNum?: number;
  viewerNum?: number;
  averageWatchTime?: string;
  enrollNum?: number;
  createdTime?: number;
}

interface ApiPopularizationListResponse {
  contents: ApiPopularizationInfo[];
}

interface ApiBatchCreateResponse {
  promoteId: string;
  popularizationName: string;
}

/**
 * PromotionServiceSdk
 *
 * SDK wrapper service for promotion operations.
 * Wraps the V4ChannelService methods for use by CLI handlers.
 */
export class PromotionServiceSdk {
  private readonly client: PolyVClient;

  /**
   * Creates a new PromotionServiceSdk instance
   *
   * @param authConfig Authentication configuration
   * @param config Optional service configuration (defaults to standard PolyV API settings)
   */
  constructor(authConfig: AuthConfig, config?: PromotionServiceConfig) {
    this.client = new PolyVClient({
      appId: authConfig.appId,
      appSecret: authConfig.appSecret,
      baseUrl: config?.baseUrl || 'https://api.polyv.net',
    });
  }

  /**
   * Lists all promotion channels for a channel
   *
   * @param channelId Channel ID to list promotions for
   * @returns Array of promotion channels
   *
   * @throws {Error} When channelId is empty or API call fails
   *
   * @example
   * ```typescript
   * const promotions = await service.listPopularizations('3151318');
   * ```
   */
  async listPopularizations(channelId: string): Promise<PromotionChannel[]> {
    if (!channelId || channelId.trim() === '') {
      throw new Error('Channel ID is required');
    }

    // Use httpClient directly with correct API endpoint
    // API endpoint: GET /live/v4/channel/popularization/list
    const response = await this.client.httpClient.get<ApiPopularizationListResponse>(
      '/live/v4/channel/popularization/list',
      {
        params: {
          channelId,
          pageNumber: 1,
          pageSize: 500,
        },
      }
    );

    // Transform API response to CLI format
    return response.data.contents.map((item) => ({
      promoteId: item.promoteId,
      popularizationName: item.popularizationName,
      visitsNum: item.visitsNum ?? 0,
      reservationNum: item.reservationNum ?? 0,
      watchNum: item.watchNum ?? 0,
      viewerNum: item.viewerNum ?? 0,
      averageWatchTime: item.averageWatchTime ?? '',
      enrollNum: item.enrollNum ?? 0,
      createdTime: item.createdTime ?? 0,
    }));
  }

  /**
   * Batch creates promotion channels for a channel
   *
   * @param params Parameters including channelId and names array
   * @returns Array of created promotions
   *
   * @throws {Error} When parameters are invalid or API call fails
   *
   * @example
   * ```typescript
   * const promotions = await service.batchCreatePopularizations({
   *   channelId: '3151318',
   *   names: ['Promotion 1', 'Promotion 2']
   * });
   * ```
   */
  async batchCreatePopularizations(params: {
    channelId: string;
    names: string[];
  }): Promise<CreatedPromotion[]> {
    if (!params.channelId || params.channelId.trim() === '') {
      throw new Error('Channel ID is required');
    }

    if (!params.names || params.names.length === 0) {
      throw new Error('Names array cannot be empty');
    }

    // Use httpClient directly with correct API endpoint
    // API endpoint: POST /live/v4/channel/popularization/create-batch
    // Request body: { channelId: number, names: string[] }
    const response = await this.client.httpClient.post<ApiBatchCreateResponse[]>(
      '/live/v4/channel/popularization/create-batch',
      {
        channelId: parseInt(params.channelId, 10),
        names: params.names,
      }
    );

    // Return created promotions
    return response.data.map((item) => ({
      promoteId: item.promoteId,
      popularizationName: item.popularizationName,
    }));
  }
}
