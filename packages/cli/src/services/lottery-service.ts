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
  ListChannelsLotteryParams,
  DownloadWinnerDetailParams,
  AddReceiveInfoV4Params,
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
      const result = await this.v4Channel.createLotteryActivityExact(
        this.buildLotteryActivityCreate(params)
      );
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
      const result = await this.v4Channel.listLotteryActivitiesExact(params);
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
      const result = await this.v4Channel.getLotteryActivityExact(params);
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
      const currentResponse = await this.v4Channel.getLotteryActivityExact({
        channelId: params.channelId,
        id: params.id,
      });
      const current = this.unwrapData<Record<string, unknown>>(currentResponse) ?? {};
      const result = await this.v4Channel.updateLotteryActivityExact(
        this.buildLotteryActivityUpdate(params, current)
      );
      return result ?? this.successResponse();
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
      const result = await this.v4Channel.deleteLotteryActivityExact(params);
      return result ?? this.successResponse();
    } catch (error) {
      throw this.wrapError(error, 'deleteLotteryActivity');
    }
  }

  /**
   * Get winner detail list, or viewer-specific winner detail when viewerId is provided.
   * @param params Winner detail parameters
   * @returns API response with winner list
   */
  async getWinnerDetail(params: GetWinnerDetailParams): Promise<any> {
    try {
      if (params.viewerId) {
        const result = await this.v4Channel.queryWinnerViewer({
          channelId: params.channelId,
          lotteryId: params.lotteryId,
          viewerId: params.viewerId,
          pageNumber: params.page,
          pageSize: params.limit,
        });
        return result;
      }

      const result = await this.liveInteraction.getWinnerDetail({
        channelId: params.channelId,
        lotteryId: params.lotteryId,
        page: params.page,
        limit: params.limit,
      });
      return result;
    } catch (error) {
      throw this.wrapError(error, 'getWinnerDetail');
    }
  }

  /**
   * List lottery records using V4 Channel API
   * @param params List lottery records parameters
   * @returns API response with lottery records
   */
  async listLottery(params: ListLotteryRecordsParams): Promise<any> {
    try {
      const query = this.withDefaultLotteryTimeRange(params);
      const result = await this.v4Channel.listLotteryActivityRecords({
        channelId: query.channelId,
        sessionId: query.sessionId,
        startTimeBegin: query.startTime,
        startTimeEnd: query.endTime,
        pageNumber: query.page,
        pageSize: query.limit,
      });
      return result;
    } catch (error) {
      throw this.wrapError(error, 'listLottery');
    }
  }

  /**
   * List lottery records across channels using LiveInteraction V3 API
   * @param params List parameters
   * @returns API response with lottery records
   */
  async listChannelsLottery(params: ListChannelsLotteryParams): Promise<any> {
    try {
      const result = await this.liveInteraction.listChannelsLottery({
        channelIds: params.channelIds,
        startTime: params.startTime,
        endTime: params.endTime,
        sessionId: params.sessionId,
        page: params.page,
        limit: params.limit,
      });
      return result;
    } catch (error) {
      throw this.wrapError(error, 'listChannelsLottery');
    }
  }

  /**
   * Download winner details using LiveInteraction V3 API
   * @param params Download parameters
   * @returns API response with download data
   */
  async downloadWinnerDetail(params: DownloadWinnerDetailParams): Promise<any> {
    try {
      const result = await this.liveInteraction.downloadWinnerDetail({
        channelId: params.channelId,
        lotteryId: params.lotteryId,
      });
      return result;
    } catch (error) {
      throw this.wrapError(error, 'downloadWinnerDetail');
    }
  }

  /**
   * Add winner receive information using LiveInteraction V4 API
   * @param params Receive information parameters
   * @returns API response
   */
  async addReceiveInfoV4(params: AddReceiveInfoV4Params): Promise<any> {
    try {
      const result = await this.liveInteraction.addReceiveInfoV4({
        channelId: params.channelId,
        lotteryId: params.lotteryId,
        winnerCode: params.winnerCode,
        viewerId: params.viewerId,
        receiveInfo: params.receiveInfo,
      });
      return result;
    } catch (error) {
      throw this.wrapError(error, 'addReceiveInfoV4');
    }
  }

  async createConditionWaitLottery(params: Record<string, unknown>): Promise<any> {
    try {
      const result = await this.v4Channel.createConditionWaitLottery(params);
      return result ?? this.successResponse();
    } catch (error) {
      throw this.wrapError(error, 'createConditionWaitLottery');
    }
  }

  async listLotteryViewerGroups(params: Record<string, unknown>): Promise<any> {
    try {
      return await this.v4Channel.listLotteryViewerGroups(params);
    } catch (error) {
      throw this.wrapError(error, 'listLotteryViewerGroups');
    }
  }

  async createLotteryViewerGroup(params: Record<string, unknown>): Promise<any> {
    try {
      return await this.v4Channel.createLotteryViewerGroup(params);
    } catch (error) {
      throw this.wrapError(error, 'createLotteryViewerGroup');
    }
  }

  async updateLotteryViewerGroup(params: Record<string, unknown>): Promise<any> {
    try {
      return await this.v4Channel.updateLotteryViewerGroup(params);
    } catch (error) {
      throw this.wrapError(error, 'updateLotteryViewerGroup');
    }
  }

  async deleteLotteryViewerGroup(params: Record<string, unknown>): Promise<any> {
    try {
      const result = await this.v4Channel.deleteLotteryViewerGroup(params);
      return result ?? this.successResponse();
    } catch (error) {
      throw this.wrapError(error, 'deleteLotteryViewerGroup');
    }
  }

  async listLotteryGroupViewers(params: Record<string, unknown>): Promise<any> {
    try {
      return await this.v4Channel.listLotteryGroupViewers(params);
    } catch (error) {
      throw this.wrapError(error, 'listLotteryGroupViewers');
    }
  }

  async createLotteryGroupViewers(params: Record<string, unknown>): Promise<any> {
    try {
      return await this.v4Channel.createLotteryGroupViewers(params);
    } catch (error) {
      throw this.wrapError(error, 'createLotteryGroupViewers');
    }
  }

  async createLotteryGroupViewerNames(params: Record<string, unknown>): Promise<any> {
    try {
      return await this.v4Channel.createLotteryGroupViewerNames(params);
    } catch (error) {
      throw this.wrapError(error, 'createLotteryGroupViewerNames');
    }
  }

  async deleteLotteryGroupViewers(params: Record<string, unknown>): Promise<any> {
    try {
      const result = await this.v4Channel.deleteLotteryGroupViewers(params);
      return result ?? this.successResponse();
    } catch (error) {
      throw this.wrapError(error, 'deleteLotteryGroupViewers');
    }
  }

  async listLotteryBlacklistViewers(params: Record<string, unknown>): Promise<any> {
    try {
      return await this.v4Channel.listLotteryBlacklistViewers(params);
    } catch (error) {
      throw this.wrapError(error, 'listLotteryBlacklistViewers');
    }
  }

  async createLotteryBlacklistViewers(params: Record<string, unknown>): Promise<any> {
    try {
      return await this.v4Channel.createLotteryBlacklistViewers(params);
    } catch (error) {
      throw this.wrapError(error, 'createLotteryBlacklistViewers');
    }
  }

  async deleteLotteryBlacklistViewers(params: Record<string, unknown>): Promise<any> {
    try {
      const result = await this.v4Channel.deleteLotteryBlacklistViewers(params);
      return result ?? this.successResponse();
    } catch (error) {
      throw this.wrapError(error, 'deleteLotteryBlacklistViewers');
    }
  }

  async listLuckyBagWinners(params: Record<string, unknown>): Promise<any> {
    try {
      return await this.v4Channel.listLuckyBagWinners(params);
    } catch (error) {
      throw this.wrapError(error, 'listLuckyBagWinners');
    }
  }

  private buildLotteryActivityUpdate(
    params: UpdateLotteryActivityParams,
    current: Record<string, unknown>
  ): Record<string, unknown> {
    const updateParams: Record<string, unknown> = {
      channelId: params.channelId,
      id: params.id,
      activityName: params.activityName ?? current['activityName'],
      lotteryCondition: current['lotteryCondition'],
      amount: params.amount ?? current['amount'],
      prizeName: params.prizeName ?? current['prizeName'],
    };

    [
      'hiddenWinnerAmount',
      'lotteryRange',
      'customGroupIds',
      'customGroupLotteryType',
      'customGroupLotteryAmount',
      'hiddenAttendeeNumber',
      'repeatWinEnabled',
      'receiveEnabled',
      'receiveInfo',
      'thumbnail',
      'externalListLink',
      'externalInviteNumLink',
      'comment',
      'realPrice',
      'price',
      'prizeInfo',
      'questionGroupId',
      'perAnswerDuration',
      'lotteryOnlineEnabled',
      'answerType',
      'showWinnerCode',
      'showWinners',
    ].forEach((key) => {
      if (current[key] !== undefined && current[key] !== null) {
        updateParams[key] = current[key];
      }
    });

    const lotteryCondition = updateParams['lotteryCondition'];
    if (lotteryCondition !== 'none') {
      this.copyDefined(current, updateParams, ['activityDuration', 'activityDurationType']);
      if (current['acceptType']) {
        this.copyDefined(current, updateParams, ['acceptType', 'formInfo', 'prizeUrl', 'qrCode', 'qrCodeTips']);
      }
    }
    if (lotteryCondition === 'invite') {
      this.copyDefined(current, updateParams, ['inviteType']);
      const inviteNum = this.numberOrUndefined(current['inviteNum']);
      if (inviteNum !== undefined && inviteNum >= 1) {
        updateParams['inviteNum'] = inviteNum;
      }
    }
    if (lotteryCondition === 'duration') {
      const duration = this.numberOrUndefined(current['duration']);
      if (duration !== undefined && duration >= 2) {
        updateParams['duration'] = duration;
      }
    }

    return updateParams;
  }

  private buildLotteryActivityCreate(params: CreateLotteryActivityParams): Record<string, unknown> {
    const createParams: Record<string, unknown> = { ...params };

    if (params.lotteryCondition !== 'none' && params.duration !== undefined) {
      createParams['activityDuration'] = String(Math.max(1, Math.ceil(params.duration / 60)));
      createParams['activityDurationType'] = 'minute';
    }

    if (params.lotteryCondition === 'invite' && createParams['inviteType'] === undefined) {
      createParams['inviteType'] = 'poster';
    }

    if (params.lotteryCondition !== 'none' && createParams['acceptType'] === undefined) {
      createParams['acceptType'] = 'form';
      createParams['formInfo'] = [
        {
          type: 'userName',
          field: 'Name',
          tips: 'Please enter name',
          required: true,
        },
      ];
    }

    return createParams;
  }

  private copyDefined(
    source: Record<string, unknown>,
    target: Record<string, unknown>,
    keys: string[]
  ): void {
    keys.forEach((key) => {
      if (source[key] !== undefined && source[key] !== null) {
        target[key] = source[key];
      }
    });
  }

  private numberOrUndefined(value: unknown): number | undefined {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
  }

  private withDefaultLotteryTimeRange(
    params: ListLotteryRecordsParams
  ): ListLotteryRecordsParams {
    if (params.startTime !== undefined && params.endTime !== undefined) {
      return params;
    }

    const endTime = params.endTime ?? Date.now();
    const startTime = params.startTime ?? endTime - 7 * 24 * 60 * 60 * 1000;
    return {
      ...params,
      startTime,
      endTime,
    };
  }

  private unwrapData<T>(value: unknown): T | undefined {
    if (value && typeof value === 'object' && 'data' in value) {
      return (value as { data: T }).data;
    }
    return value as T;
  }

  private successResponse(): { code: number; status: string; data: Record<string, unknown> } {
    return {
      code: 200,
      status: 'success',
      data: {},
    };
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
