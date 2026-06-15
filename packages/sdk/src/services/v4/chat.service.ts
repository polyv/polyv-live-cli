/**
 * V4 Chat Service
 *
 * Service for managing PolyV V4 Chat operations.
 * Provides methods for messages, notices, Q&A, check-in, and robot settings.
 *
 * @module services/v4/chat
 */

import type { PolyVClient } from '../../client.js';
import type {
  SendCustomMessageParams,
  SendCustomMessageEncodeParams,
  ListBulletinsParams,
  ListBulletinsResponse,
  CleanNoticesParams,
  ListQaParams,
  ListQaResponse,
  BatchCheckinParams,
} from '../../types/v4-chat.js';
import type {
  GetRobotSettingParams,
  RobotSetting,
  GetRobotStatsParams,
  RobotStats,
  PauseRobotParams,
  UpdateRobotSettingParams,
} from '../../types/v4-robot.js';
import { PolyVValidationError } from '../../errors/polyv-validation-error.js';

/**
 * V4ChatService
 *
 * Provides methods to interact with PolyV V4 Chat APIs.
 *
 * @example
 * ```typescript
 * const client = new PolyVClient({ appId: 'xxx', appSecret: 'yyy' });
 * const messages = await client.v4Chat.sendCustomMessage({ channelId: '123', content: 'Hello' });
 * ```
 */
export class V4ChatService {
  private client: PolyVClient;

  /**
   * Create a new V4ChatService instance
   *
   * @param client - The PolyVClient instance to use for API calls
   */
  constructor(client: PolyVClient) {
    this.client = client;
  }

  // ============================================
  // AC1: Chat Message APIs (2 methods)
  // ============================================

  /**
   * Send a custom message
   *
   * @param params - Message parameters
   *
   * @example
   * ```typescript
   * await client.v4Chat.sendCustomMessage({
   *   channelId: '123456',
   *   content: 'Hello everyone!',
   *   watchType: '1',
   * });
   * ```
   */
  async sendCustomMessage(params: SendCustomMessageParams): Promise<void> {
    this.validateChannelId(params.channelId);
    this.validateMessageContent(params);

    await this.client.httpClient.get(
      '/live/v4/chat/send-custom-message',
      { params }
    );
  }

  /**
   * Send an encoded custom message
   *
   * @param params - Message parameters (content should be URL encoded)
   *
   * @example
   * ```typescript
   * await client.v4Chat.sendCustomMessageEncode({
   *   channelId: '123456',
   *   content: encodeURIComponent('Hello with special chars!'),
   * });
   * ```
   */
  async sendCustomMessageEncode(params: SendCustomMessageEncodeParams): Promise<void> {
    this.validateChannelId(params.channelId);
    this.validateMessageContent(params);

    await this.client.httpClient.get(
      '/live/v4/chat/send-custom-message-encode',
      { params }
    );
  }

  // ============================================
  // AC2: Channel Notice APIs (2 methods)
  // ============================================

  /**
   * List channel bulletins/notices
   *
   * @param params - Query parameters
   * @returns Paginated bulletin list
   *
   * @example
   * ```typescript
   * const result = await client.v4Chat.listBulletins({
   *   channelId: '123456',
   *   pageNumber: 1,
   *   pageSize: 10,
   *   sort: 'createTime:desc',
   * });
   * console.log(result.contents);
   * ```
   */
  async listBulletins(params: ListBulletinsParams): Promise<ListBulletinsResponse> {
    this.validateChannelId(params.channelId);
    this.validatePaginationParams(params);

    const response = await this.client.httpClient.get<ListBulletinsResponse>(
      '/live/v4/chat/list-bullentin',
      { params }
    );
    return response as unknown as ListBulletinsResponse;
  }

  /**
   * Clean/clear channel notices
   *
   * @param params - Clean parameters
   *
   * @example
   * ```typescript
   * await client.v4Chat.cleanNotices({
   *   channelId: '123456',
   * });
   * ```
   */
  async cleanNotices(params: CleanNoticesParams): Promise<void> {
    this.validateChannelId(params.channelId);

    await this.client.httpClient.post(
      '/live/v4/chat/notice/clean',
      null,
      { params }
    );
  }

  // ============================================
  // AC3: Q&A API (1 method)
  // ============================================

  /**
   * List channel Q&A
   *
   * @param params - Query parameters
   * @returns Paginated Q&A list
   *
   * @example
   * ```typescript
   * const result = await client.v4Chat.listQa({
   *   channelId: '123456',
   *   pageNumber: 1,
   *   pageSize: 10,
   * });
   * console.log(result.contents);
   * ```
   */
  async listQa(params: ListQaParams): Promise<ListQaResponse> {
    this.validateChannelId(params.channelId);
    this.validatePaginationParams(params);

    const response = await this.client.httpClient.get<ListQaResponse>(
      '/live/v4/chat/list-qa',
      { params }
    );
    return response as unknown as ListQaResponse;
  }

  // ============================================
  // AC4: Check-in API (1 method)
  // ============================================

  /**
   * Batch set check-in for channels
   *
   * @param params - Batch check-in parameters
   *
   * @example
   * ```typescript
   * await client.v4Chat.batchCheckin({
   *   items: [
   *     {
   *       channelId: '123456',
   *       limitTime: 60,
   *       message: 'Please check in',
   *       forceCheckInEnabled: true,
   *     },
   *   ],
   * });
   * ```
   */
  async batchCheckin(params: BatchCheckinParams): Promise<void> {
    if (!params.items || params.items.length === 0) {
      throw new PolyVValidationError('items is required and cannot be empty');
    }
    if (params.items.length > 1000) {
      throw new PolyVValidationError('items cannot contain more than 1000 items');
    }

    // Validate each item
    for (let i = 0; i < params.items.length; i++) {
      const item = params.items[i];
      if (!item.channelId || item.channelId.trim() === '') {
        throw new PolyVValidationError(
          `items[${i}].channelId is required`,
          `items[${i}].channelId`,
          item.channelId
        );
      }
    }

    await this.client.httpClient.post(
      '/live/v4/chat/batch-checkin',
      params.items
    );
  }

  // ============================================
  // AC5: Robot APIs (4 methods)
  // ============================================

  /**
   * Get robot/virtual user setting
   *
   * @param params - Query parameters
   * @returns Robot setting
   *
   * @example
   * ```typescript
   * const setting = await client.v4Chat.getRobotSetting({
   *   channelId: '123456',
   * });
   * console.log(setting.robotNumber);
   * ```
   */
  async getRobotSetting(params: GetRobotSettingParams): Promise<RobotSetting> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<RobotSetting>(
      '/live/v4/channel/robot/setting/get',
      { params }
    );
    return response as unknown as RobotSetting;
  }

  /**
   * Get robot statistics
   *
   * @param params - Query parameters
   * @returns Robot statistics
   *
   * @example
   * ```typescript
   * const stats = await client.v4Chat.getRobotStats({
   *   channelId: '123456',
   * });
   * console.log(stats.total);
   * ```
   */
  async getRobotStats(params: GetRobotStatsParams): Promise<RobotStats> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<RobotStats>(
      '/live/v4/chat/robot/get-robot-stats',
      { params }
    );
    return response as unknown as RobotStats;
  }

  /**
   * Pause robot
   *
   * @param params - Pause parameters
   *
   * @example
   * ```typescript
   * await client.v4Chat.pauseRobot({
   *   channelId: '123456',
   * });
   * ```
   */
  async pauseRobot(params: PauseRobotParams): Promise<void> {
    this.validateChannelId(params.channelId);

    await this.client.httpClient.post(
      '/live/v4/chat/robot/pause',
      null,
      { params }
    );
  }

  /**
   * Update robot setting
   *
   * @param params - Update parameters
   *
   * @example
   * ```typescript
   * await client.v4Chat.updateRobotSetting({
   *   channelId: '123456',
   *   robotNumber: 10,
   *   addRobotModel: 1,
   * });
   * ```
   */
  async updateRobotSetting(params: UpdateRobotSettingParams): Promise<void> {
    this.validateChannelId(params.channelId);

    await this.client.httpClient.post(
      '/live/v4/chat/robot/update-robot-setting',
      null,
      { params }
    );
  }

  // ============================================
  // Private Validation Helpers
  // ============================================

  /**
   * Validate channel ID
   */
  private validateChannelId(channelId: string): void {
    if (!channelId || channelId.trim() === '') {
      throw new PolyVValidationError('channelId is required and cannot be empty', 'channelId', channelId);
    }
  }

  /**
   * Validate pagination parameters
   */
  private validatePaginationParams(params: { pageNumber: number; pageSize: number }): void {
    if (params.pageNumber === undefined || params.pageNumber === null || params.pageNumber < 1) {
      throw new PolyVValidationError('pageNumber must be >= 1', 'pageNumber', params.pageNumber);
    }
    if (params.pageSize === undefined || params.pageSize === null || params.pageSize < 1 || params.pageSize > 1000) {
      throw new PolyVValidationError('pageSize must be between 1 and 1000', 'pageSize', params.pageSize);
    }
  }

  /**
   * Validate message content (content or imgUrl must be provided)
   */
  private validateMessageContent(params: { content?: string; imgUrl?: string }): void {
    if (!params.content && !params.imgUrl) {
      throw new PolyVValidationError('content or imgUrl is required');
    }
    if (params.content && params.content.length > 1000) {
      throw new PolyVValidationError('content cannot exceed 1000 characters', 'content', params.content);
    }
  }
}
