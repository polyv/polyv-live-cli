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
  ListRewardLikeParams,
  DonateRecordApiResponse,
  DonateUpdateApiResponse,
} from '../types/donate';

const DEFAULT_DONATE_GIFT_IMAGE = '//s1.videocc.net/default-img/donate/666.png';

/**
 * SDK wrapper for donate operations
 * Encapsulates V4ChannelService donate methods and reward gift API
 */
export class DonateServiceSdk {
  private readonly client: PolyVClient;
  private readonly v4Channel: PolyVClient['v4Channel'];

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
      const donateGiftEnabled = params.donateGiftEnabled ?? 'Y';
      const giftDonate = this.normalizeGiftDonateConfig(
        params.giftDonate ?? this.buildGiftDonateConfig(params.donateAmounts, params.donateEnabled)
      );

      await this.v4Channel.updateDonateGift({
        channelId: params.channelId,
        donateGiftEnabled,
        ...(giftDonate ? { giftDonate } : {}),
      });
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
      const response = await this.v4Channel.listRewardGifts({
        channelId: params.channelId,
        start: params.start,
        end: params.end,
        pageNumber: params.pageNumber ?? 1,
        pageSize: params.pageSize ?? 10,
      });
      return response as unknown as DonateRecordApiResponse;
    } catch (error) {
      throw this.wrapError(error, 'listRewardGift');
    }
  }

  /**
   * List like reward records using V4 API
   * @param params List reward like parameters
   * @returns API response with reward like records
   */
  async listRewardLikes(params: ListRewardLikeParams): Promise<any> {
    try {
      const response = await this.v4Channel.listRewardLikes({
        channelId: params.channelId,
        pageNumber: params.pageNumber ?? 1,
        pageSize: params.pageSize ?? 10,
        ...(params.start !== undefined ? { start: params.start } : {}),
        ...(params.end !== undefined ? { end: params.end } : {}),
      });
      return response;
    } catch (error) {
      throw this.wrapError(error, 'listRewardLikes');
    }
  }

  private buildGiftDonateConfig(
    amounts?: number[],
    cashEnabled: UpdateDonateConfigParams['donateEnabled'] = 'Y'
  ): UpdateDonateConfigParams['giftDonate'] | undefined {
    if (!amounts || amounts.length === 0) {
      return undefined;
    }

    return {
      payWay: 'CASH',
      cashPays: amounts.map((amount) => ({
        name: String(amount),
        enabled: cashEnabled,
        imgType: 'STATIC',
        img: DEFAULT_DONATE_GIFT_IMAGE,
        price: amount,
      })),
    };
  }

  private normalizeGiftDonateConfig(
    giftDonate?: UpdateDonateConfigParams['giftDonate']
  ): UpdateDonateConfigParams['giftDonate'] | undefined {
    if (!giftDonate) {
      return undefined;
    }

    type DonatePayItem = NonNullable<NonNullable<UpdateDonateConfigParams['giftDonate']>['cashPays']>[number];
    const normalizePayItem = (item: DonatePayItem): DonatePayItem => {
      if (item.img || item.imgType === 'DYNAMIC') {
        return item;
      }

      return {
        ...item,
        imgType: item.imgType ?? 'STATIC',
        img: DEFAULT_DONATE_GIFT_IMAGE,
      };
    };

    const normalized: UpdateDonateConfigParams['giftDonate'] = {
      ...giftDonate,
    };

    if (giftDonate.cashPays) {
      normalized.cashPays = giftDonate.cashPays.map(normalizePayItem);
    }
    if (giftDonate.pointPays) {
      normalized.pointPays = giftDonate.pointPays.map(normalizePayItem);
    }

    return normalized;
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
