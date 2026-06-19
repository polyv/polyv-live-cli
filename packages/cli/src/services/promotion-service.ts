/**
 * @fileoverview Promotion SDK wrapper service for CLI
 * @author Development Team
 * @since 14.1.0
 */

import { PolyVClient } from 'polyv-live-api-sdk';
import { AuthConfig } from '../types/auth';
import { PromotionServiceConfig, PromotionChannel, CreatedPromotion } from '../types/promotion';

/**
 * PromotionServiceSdk
 *
 * SDK wrapper service for promotion operations.
 * Wraps the V4ChannelService methods for use by CLI handlers.
 */
export class PromotionServiceSdk {
  private readonly client: PolyVClient;
  private readonly v4Channel: PolyVClient['v4Channel'];

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
    this.v4Channel = this.client.v4Channel;
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

    const response = await this.v4Channel.listPopularizations({
      channelId,
      pageNumber: 1,
      pageSize: 500,
    } as unknown as Parameters<PolyVClient['v4Channel']['listPopularizations']>[0]);

    // Transform API response to CLI format
    const data = this.unwrapData<{ contents?: unknown[] } | unknown[]>(response);
    const items = Array.isArray(data)
      ? data
      : (data?.contents ?? []);
    return items.map((item) => {
      const value = item as Record<string, any>;
      return {
        promoteId: value['promoteId'] ?? value['id'],
        popularizationName: value['popularizationName'] ?? value['name'],
        visitsNum: value['visitsNum'] ?? 0,
        reservationNum: value['reservationNum'] ?? 0,
        watchNum: value['watchNum'] ?? 0,
        viewerNum: value['viewerNum'] ?? 0,
        averageWatchTime: value['averageWatchTime'] ?? '',
        enrollNum: value['enrollNum'] ?? 0,
        createdTime: value['createdTime'] ?? 0,
      };
    });
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

    const response = await this.v4Channel.createPopularizations({
      channelId: parseInt(params.channelId, 10),
      names: params.names,
    });
    const items = this.unwrapData<Array<Record<string, any>>>(response) ?? [];

    // Return created promotions
    return items.map((item) => ({
      promoteId: (item as Record<string, any>)['promoteId'] ?? item.id,
      popularizationName: (item as Record<string, any>)['popularizationName'] ?? item.name,
    }));
  }

  private unwrapData<T>(value: unknown): T | undefined {
    if (value && typeof value === 'object' && 'data' in value) {
      return (value as { data: T }).data;
    }
    return value as T;
  }
}
