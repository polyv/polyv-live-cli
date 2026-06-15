/**
 * @fileoverview SDK wrapper for donate operations
 * @author Development Team
 * @since 11.6.0
 */

import { PolyVClient } from 'polyv-live-api-sdk';
import { AuthConfig } from '../types/auth';
import { PolyVError } from '../utils/errors';
import {
  DonateServiceConfig,
  GetDonateConfigParams,
  UpdateDonateConfigParams,
  ListRewardGiftParams,
  DonateRecordApiResponse,
  DonateUpdateApiResponse,
} from '../types/donate';

/**
 * SDK wrapper for donate operations
 * Encapsulates V4ChannelService donate methods and reward gift API
 */
export class DonateServiceSdk {
  private readonly client: PolyVClient;
  private readonly v4Channel: any;

  /**
   * Creates a new DonateServiceSdk instance
   * @param authConfig Authentication configuration
   * @param _serviceConfig Service configuration (currently unused but required for consistency)
   */
  constructor(authConfig: AuthConfig, _serviceConfig?: DonateServiceConfig) {
    this.client = new PolyVClient(authConfig);
    this.v4Channel = this.client.v4Channel;
  }

  /**
   * Get donate configuration using V4 API
   * @param params Get donate config parameters
   * @returns API response with donate configuration
   */
  async getDonateConfig(params: GetDonateConfigParams): Promise<any> {
    try {
      const result = await this.v4Channel.getDonate(params);
      return result;
    } catch (error) {
      throw this.wrapError(error, 'getDonateConfig');
    }
  }

  /**
   * Update donate configuration using V4 API
   * @param params Update donate config parameters
   * @returns API response
   */
  async updateDonateConfig(params: UpdateDonateConfigParams): Promise<DonateUpdateApiResponse> {
    try {
      await this.v4Channel.updateDonate(params);
      return {
        code: 200,
        status: 'success',
        data: {},
      };
    } catch (error) {
      throw this.wrapError(error, 'updateDonateConfig');
    }
  }

  /**
   * List reward gift records using V4 API
   * @param params List reward gift parameters
   * @returns API response with reward gift records
   */
  async listRewardGift(params: ListRewardGiftParams): Promise<DonateRecordApiResponse> {
    try {
      // Use httpClient directly for this endpoint
      const response = await this.client.httpClient.get('/live/v4/channel/reward/gift-list', {
        params: {
          channelId: params.channelId,
          start: params.start,
          end: params.end,
          pageNumber: params.pageNumber ?? 1,
          pageSize: params.pageSize ?? 10,
        },
      });
      return response as unknown as DonateRecordApiResponse;
    } catch (error) {
      throw this.wrapError(error, 'listRewardGift');
    }
  }

  /**
   * Wrap SDK errors with PolyVError for consistent error handling
   */
  private wrapError(error: unknown, operation: string): PolyVError {
    if (error instanceof PolyVError) {
      return error;
    }
    const message = error instanceof Error ? error.message : String(error);
    return new PolyVError(
      `${operation} failed: ${message}`,
      'DONATE_API_ERROR',
      1,
      { originalError: error }
    );
  }
}
