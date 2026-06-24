/**
 * V4 Robot Service
 *
 * Service for managing PolyV V4 Robot operations.
 * Provides methods for global robot management and channel robot settings.
 *
 * @module services/v4/robot
 */

import type { PolyVClient } from '../../client.js';
import type {
  ListRobotsParams,
  ListRobotsResponse,
  BatchSaveRobotsParams,
  BatchSaveRobotsResponse,
  BatchDeleteRobotsParams,
  GetRobotSettingParams,
  RobotSetting,
  UpdateRobotSettingParams,
  GetRobotStatsParams,
  RobotStats,
  PauseRobotParams,
  AddRobotModel,
} from '../../types/v4-robot.js';
import { PolyVValidationError } from '../../errors/polyv-validation-error.js';

/**
 * V4RobotService
 *
 * Provides methods to interact with PolyV V4 Robot APIs.
 *
 * @example
 * ```typescript
 * const client = new PolyVClient({ appId: 'xxx', appSecret: 'yyy' });
 * const robots = await client.v4Robot.listRobots({ pageNumber: 1, pageSize: 10 });
 * ```
 */
export class V4RobotService {
  private client: PolyVClient;

  /**
   * Create a new V4RobotService instance
   *
   * @param client - The PolyVClient instance to use for API calls
   */
  constructor(client: PolyVClient) {
    this.client = client;
  }

  // ============================================
  // AC3: Global Robot APIs (3 methods)
  // ============================================

  /**
   * Query robot virtual nicknames with pagination
   *
   * @param params - Query parameters (optional)
   * @returns Paginated robot list
   *
   * @example
   * ```typescript
   * const result = await client.v4Robot.listRobots({
   *   pageNumber: 1,
   *   pageSize: 10,
   * });
   * console.log(result.contents);
   * ```
   */
  async listRobots(params?: ListRobotsParams): Promise<ListRobotsResponse> {
    const response = await this.client.httpClient.get<ListRobotsResponse>(
      '/live/v4/global/robot/list',
      { params: params || {} }
    );
    return response as unknown as ListRobotsResponse;
  }

  /**
   * Batch create robot virtual nicknames
   *
   * @param params - Batch creation parameters
   * @returns Batch creation result
   *
   * @example
   * ```typescript
   * const result = await client.v4Robot.batchSaveRobots({
   *   robots: [
   *     { name: 'Robot A', avatar: 'https://example.com/a.jpg' },
   *     { name: 'Robot B' },
   *   ],
   * });
   * console.log(result.savedCount);
   * ```
   */
  async batchSaveRobots(params: BatchSaveRobotsParams): Promise<BatchSaveRobotsResponse> {
    if (!params.robots || params.robots.length === 0) {
      throw new PolyVValidationError('robots is required and cannot be empty');
    }
    if (params.robots.length > 200) {
      throw new PolyVValidationError('robots cannot contain more than 200 items');
    }

    // Validate robot names
    for (let i = 0; i < params.robots.length; i++) {
      const robot = params.robots[i];

      // Check name length (max 20 chars)
      if (robot.name.length > 20) {
        throw new PolyVValidationError(
          `robots[${i}].name cannot exceed 20 characters`,
          `robots[${i}].name`,
          robot.name
        );
      }

      // Check for emojis in name
      if (this.containsEmoji(robot.name)) {
        throw new PolyVValidationError(
          `robots[${i}].name cannot contain emoji`,
          `robots[${i}].name`,
          robot.name
        );
      }
    }

    // The /live/v4/global/robot/save-batch endpoint expects the request body to be
    // a bare JSON array of GlobalRobotSaveBatchReq items (server deserializes into
    // ArrayList<GlobalRobotSaveBatchReq>), NOT an object wrapper. Sending
    // `{ robots: [...] }` triggers "Cannot deserialize ArrayList out of START_OBJECT".
    const response = await this.client.httpClient.post<BatchSaveRobotsResponse>(
      '/live/v4/global/robot/save-batch',
      params.robots
    );
    return response as unknown as BatchSaveRobotsResponse;
  }

  /**
   * Batch delete robots
   *
   * @param params - Batch deletion parameters
   *
   * @example
   * ```typescript
   * await client.v4Robot.batchDeleteRobots({
   *   ids: [3001, 3002, 3003],
   * });
   * ```
   */
  async batchDeleteRobots(params: BatchDeleteRobotsParams): Promise<void> {
    if (!params.ids || params.ids.length === 0) {
      throw new PolyVValidationError('ids is required and cannot be empty');
    }
    if (params.ids.length > 200) {
      throw new PolyVValidationError('ids cannot contain more than 200 items');
    }

    await this.client.httpClient.post(
      '/live/v4/global/robot/delete-batch',
      null,
      { params: { ids: params.ids.join(',') } }
    );
  }

  // ============================================
  // AC4: Channel Robot APIs (4 methods)
  // ============================================

  /**
   * Query channel robot settings
   *
   * @param params - Query parameters
   * @returns Channel robot settings
   *
   * @example
   * ```typescript
   * const settings = await client.v4Robot.getRobotSetting({
   *   channelId: '12345678',
   * });
   * console.log(settings.robotNumber);
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
   * Update channel robot settings
   *
   * @param params - Update parameters
   *
   * @example
   * ```typescript
   * await client.v4Robot.updateRobotSetting({
   *   channelId: '12345678',
   *   robotNumber: 10,
   *   addRobotModel: 'timely',
   * });
   * ```
   */
  async updateRobotSetting(params: UpdateRobotSettingParams): Promise<void> {
    this.validateChannelId(params.channelId);

    // Validate addRobotModel
    const validModels: AddRobotModel[] = ['timely', 'fixed_time'];
    if (!validModels.includes(params.addRobotModel)) {
      throw new PolyVValidationError(
        `addRobotModel must be one of: ${validModels.join(', ')}`,
        'addRobotModel',
        params.addRobotModel
      );
    }

    // Validate changeTime for fixed_time model
    if (params.addRobotModel === 'fixed_time') {
      if (params.changeTime === undefined || params.changeTime === null) {
        throw new PolyVValidationError(
          'changeTime is required when addRobotModel is "fixed_time"',
          'changeTime'
        );
      }
      if (params.changeTime < 20 || params.changeTime > 18000) {
        throw new PolyVValidationError(
          'changeTime must be between 20 and 18000 seconds',
          'changeTime',
          params.changeTime
        );
      }
    }

    await this.client.httpClient.post(
      '/live/v4/channel/robot/setting/update',
      null,
      { params }
    );
  }

  /**
   * Query channel robot stats
   *
   * @param params - Query parameters
   * @returns Channel robot stats
   *
   * @example
   * ```typescript
   * const stats = await client.v4Robot.getRobotStats({
   *   channelId: '12345678',
   * });
   * console.log(stats.robotCount);
   * ```
   */
  async getRobotStats(params: GetRobotStatsParams): Promise<RobotStats> {
    this.validateChannelId(params.channelId);

    const response = await this.client.httpClient.get<RobotStats>(
      '/live/v4/channel/robot/stats/get',
      { params }
    );
    return response as unknown as RobotStats;
  }

  /**
   * Pause channel robots
   *
   * @param params - Pause parameters
   *
   * @example
   * ```typescript
   * await client.v4Robot.pauseRobot({
   *   channelId: '12345678',
   * });
   * ```
   */
  async pauseRobot(params: PauseRobotParams): Promise<void> {
    this.validateChannelId(params.channelId);

    await this.client.httpClient.post(
      '/live/v4/channel/robot/pause',
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
      throw new PolyVValidationError('channelId is required and cannot be empty', 'channelId');
    }
  }

  /**
   * Check if string contains emoji
   */
  private containsEmoji(str: string): boolean {
    // Emoji regex pattern - matches most common emoji ranges
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F700}-\u{1F77F}]|[\u{1F780}-\u{1F7FF}]|[\u{1F800}-\u{1F8FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
    return emojiRegex.test(str);
  }
}
