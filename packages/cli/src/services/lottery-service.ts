/**
 * @fileoverview SDK wrapper for lottery operations
 * @author Development Team
 * @since 11.5.0
 */

import { PolyVClient } from 'polyv-live-api-sdk';
import { AuthConfig } from '../types/auth';
import { PolyVError } from '../utils/errors';
import {
  LotteryServiceConfig,
  CreateLotteryActivityParams,
  ListLotteryActivitiesParams,
  GetLotteryActivityParams,
  UpdateLotteryActivityParams,
  DeleteLotteryActivityParams,
  GetWinnerDetailParams,
  ListLotteryRecordsParams,
} from '../types/lottery';

/**
 * SDK wrapper for lottery operations
 * Encapsulates V4ChannelService lottery activity methods and LiveInteractionService lottery methods
 */
export class LotteryServiceSdk {
  private readonly client: PolyVClient;
  private readonly v4Channel: any;
  private readonly liveInteraction: any;

  /**
   * Creates a new LotteryServiceSdk instance
   * @param authConfig Authentication configuration
   * @param _serviceConfig Service configuration (currently unused but required for consistency)
   */
  constructor(authConfig: AuthConfig, _serviceConfig?: LotteryServiceConfig) {
    this.client = new PolyVClient(authConfig);
    this.v4Channel = this.client.v4Channel;
    this.liveInteraction = this.client.liveInteraction;
  }

  /**
   * Create a lottery activity using V4 API
   * @param params Create lottery activity parameters
   * @returns API response
   */
  async createLotteryActivity(params: CreateLotteryActivityParams): Promise<any> {
    try {
      const result = await this.v4Channel.lotteryActivityCreate(params);
      return result;
    } catch (error) {
      throw this.wrapError(error, 'createLotteryActivity');
    }
  }

  /**
   * List lottery activities using V4 API
   * @param params List parameters
   * @returns API response with lottery activities list
   */
  async listLotteryActivities(params: ListLotteryActivitiesParams): Promise<any> {
    try {
      const result = await this.v4Channel.lotteryActivityList(params);
      return result;
    } catch (error) {
      throw this.wrapError(error, 'listLotteryActivities');
    }
  }

  /**
   * Get lottery activity details using V4 API
   * @param params Get parameters
   * @returns API response with lottery activity details
   */
  async getLotteryActivity(params: GetLotteryActivityParams): Promise<any> {
    try {
      const result = await this.v4Channel.lotteryActivityGet(params);
      return result;
    } catch (error) {
      throw this.wrapError(error, 'getLotteryActivity');
    }
  }

  /**
   * Update lottery activity using V4 API
   * @param params Update parameters
   * @returns API response
   */
  async updateLotteryActivity(params: UpdateLotteryActivityParams): Promise<any> {
    try {
      const result = await this.v4Channel.lotteryActivityUpdate(params);
      return result;
    } catch (error) {
      throw this.wrapError(error, 'updateLotteryActivity');
    }
  }

  /**
   * Delete lottery activity using V4 API
   * @param params Delete parameters
   * @returns API response
   */
  async deleteLotteryActivity(params: DeleteLotteryActivityParams): Promise<any> {
    try {
      const result = await this.v4Channel.lotteryActivityDelete(params);
      return result;
    } catch (error) {
      throw this.wrapError(error, 'deleteLotteryActivity');
    }
  }

  /**
   * Get winner detail list using LiveInteraction V2 API
   * @param params Winner detail parameters
   * @returns API response with winner list
   */
  async getWinnerDetail(params: GetWinnerDetailParams): Promise<any> {
    try {
      const result = await this.liveInteraction.getWinnerDetail(params);
      return result;
    } catch (error) {
      throw this.wrapError(error, 'getWinnerDetail');
    }
  }

  /**
   * List lottery records using LiveInteraction V3 API
   * @param params List lottery records parameters
   * @returns API response with lottery records
   */
  async listLottery(params: ListLotteryRecordsParams): Promise<any> {
    try {
      const result = await this.liveInteraction.listLottery(params);
      return result;
    } catch (error) {
      throw this.wrapError(error, 'listLottery');
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
      'LOTTERY_API_ERROR',
      1,
      { originalError: error }
    );
  }
}
