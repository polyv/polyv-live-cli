/**
 * @fileoverview Handler for lottery CLI commands
 * @author Development Team
 * @since 11.5.0
 */

import { BaseHandler, OutputFormat } from './base.handler';
import { LotteryServiceSdk } from '../services/lottery-service';
import {
  LotteryServiceConfig,
  LotteryCreateOptions,
  LotteryListOptions,
  LotteryGetOptions,
  LotteryUpdateOptions,
  LotteryDeleteOptions,
  LotteryWinnersOptions,
  LotteryRecordsOptions,
  LotteryLegacyRecordsOptions,
  LotteryChannelRecordsOptions,
  LotteryDownloadWinnersOptions,
  LotteryReceiveInfoOptions,
  LotteryCondition,
} from '../types/lottery';
import { AuthConfig } from '../types/auth';
import { PolyVValidationError } from '../utils/errors';
import { apiParams, confirmWrite } from '../utils/api-command';

/**
 * Valid lottery condition types
 */
const VALID_LOTTERY_CONDITIONS: LotteryCondition[] = ['none', 'invite', 'duration', 'comment', 'question'];

/**
 * Handler for lottery-related CLI commands
 */
export class LotteryHandler extends BaseHandler {
  private readonly lotteryService: LotteryServiceSdk;

  /**
   * Creates a new LotteryHandler instance
   * @param authConfig Authentication configuration
   * @param serviceConfig Lottery service configuration
   */
  constructor(authConfig: AuthConfig, serviceConfig: LotteryServiceConfig) {
    super();
    this.lotteryService = new LotteryServiceSdk(authConfig, serviceConfig);
  }

  // ========================================
  // lottery create (AC #1)
  // ========================================

  /**
   * Create a lottery activity
   * @param options Lottery create options from CLI
   * @returns Promise that resolves when lottery is created
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async createLottery(options: LotteryCreateOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate input options
      this.validateCreateOptions(options);

      // Build params
      const params: any = {
        channelId: options.channelId,
        activityName: options.name,
        lotteryCondition: options.type,
        amount: options.amount,
        prizeName: options.prizeName,
      };

      // Add receive info if provided
      if (options.receiveInfo) {
        params.receiveEnabled = 'Y';
        params.receiveInfo = options.receiveInfo;
      }

      // Add type-specific parameters
      if (options.type === 'invite' || options.type === 'duration') {
        if (options.duration !== undefined) {
          params.duration = options.duration;
        }
        if (options.type === 'invite' && options.inviteNum !== undefined) {
          params.inviteNum = options.inviteNum;
        }
      }

      await confirmWrite(options.force, `Create lottery activity "${options.name}" on channel ${options.channelId}?`);

      // Call SDK service
      const result = await this.lotteryService.createLotteryActivity(params);

      // Display results
      this.displayCreateResult(result, options);

    }, 'lottery.create');
  }

  // ========================================
  // lottery list (AC #2)
  // ========================================

  /**
   * List lottery activities
   * @param options Lottery list options from CLI
   * @returns Promise that resolves when activities are listed
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async listLottery(options: LotteryListOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate input options
      this.validateListOptions(options);

      // Build params with defaults
      const params: any = {
        channelId: options.channelId,
        pageNumber: options.page ?? 1,
        pageSize: options.size ?? 10,
      };

      // Call SDK service
      const result = await this.lotteryService.listLotteryActivities(params);

      // Display results
      this.displayListResult(result, options);

    }, 'lottery.list');
  }

  // ========================================
  // lottery get (AC #3)
  // ========================================

  /**
   * Get lottery activity details
   * @param options Lottery get options from CLI
   * @returns Promise that resolves when activity is displayed
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async getLottery(options: LotteryGetOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate input options
      this.validateGetOptions(options);

      // Call SDK service
      const result = await this.lotteryService.getLotteryActivity({
        channelId: options.channelId,
        id: options.id,
      });

      // Display results
      this.displayGetResult(result, options);

    }, 'lottery.get');
  }

  // ========================================
  // lottery update (AC #4)
  // ========================================

  /**
   * Update lottery activity
   * @param options Lottery update options from CLI
   * @returns Promise that resolves when activity is updated
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async updateLottery(options: LotteryUpdateOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate input options
      this.validateUpdateOptions(options);

      // Build params
      const params: any = {
        channelId: options.channelId,
        id: options.id,
      };
      if (options.name !== undefined) params.activityName = options.name;
      if (options.amount !== undefined) params.amount = options.amount;
      if (options.prizeName !== undefined) params.prizeName = options.prizeName;

      await confirmWrite(options.force, `Update lottery activity ${options.id} on channel ${options.channelId}?`);

      // Call SDK service
      const result = await this.lotteryService.updateLotteryActivity(params);

      // Display results
      this.displayUpdateResult(result, options);

    }, 'lottery.update');
  }

  // ========================================
  // lottery delete (AC #5)
  // ========================================

  /**
   * Delete lottery activity
   * @param options Lottery delete options from CLI
   * @returns Promise that resolves when activity is deleted
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async deleteLottery(options: LotteryDeleteOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate input options
      this.validateDeleteOptions(options);

      await confirmWrite(options.force, `Delete lottery activity ${options.id} on channel ${options.channelId}?`);

      // Call SDK service
      await this.lotteryService.deleteLotteryActivity({
        channelId: options.channelId,
        id: options.id,
      });

      // Display results
      console.log(`Lottery deleted successfully`);
      console.log(`Channel ID: ${options.channelId}`);
      console.log(`Activity ID: ${options.id}`);

    }, 'lottery.delete');
  }

  // ========================================
  // lottery winners (AC #6)
  // ========================================

  /**
   * Get winner list
   * @param options Lottery winners options from CLI
   * @returns Promise that resolves when winners are displayed
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async getWinners(options: LotteryWinnersOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate input options
      this.validateWinnersOptions(options);

      // Build params
      const params: any = {
        channelId: options.channelId,
        lotteryId: options.lotteryId,
      };
      if (options.viewerId !== undefined) params.viewerId = options.viewerId;
      if (options.page !== undefined) params.page = options.page;
      if (options.limit !== undefined) params.limit = options.limit;

      // Call SDK service
      const result = await this.lotteryService.getWinnerDetail(params);

      // Display results
      this.displayWinnersResult(result, options);

    }, 'lottery.winners');
  }

  // ========================================
  // lottery records (AC #7)
  // ========================================

  /**
   * Get lottery records
   * @param options Lottery records options from CLI
   * @returns Promise that resolves when records are displayed
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async getRecords(options: LotteryRecordsOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate input options
      this.validateRecordsOptions(options);

      // Build params
      const params: any = {
        channelId: options.channelId,
      };
      if (options.startTime !== undefined) params.startTime = options.startTime;
      if (options.endTime !== undefined) params.endTime = options.endTime;
      if (options.sessionId !== undefined) params.sessionId = options.sessionId;
      if (options.page !== undefined) params.page = options.page;
      if (options.limit !== undefined) params.limit = options.limit;

      // Call SDK service
      const result = await this.lotteryService.listLottery(params);

      // Display results
      this.displayRecordsResult(result, options);

    }, 'lottery.records');
  }

  async getChannelRecords(options: LotteryChannelRecordsOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateChannelRecordsOptions(options);

      const params: any = {
        channelIds: options.channelIds,
        startTime: options.startTime,
        endTime: options.endTime,
      };
      if (options.sessionId !== undefined) params.sessionId = options.sessionId;
      if (options.page !== undefined) params.page = options.page;
      if (options.limit !== undefined) params.limit = options.limit;

      const result = await this.lotteryService.listChannelsLottery(params);

      this.displayGenericResult(result, options.output);
    }, 'lottery.channel-records');
  }

  async getLegacyRecords(options: LotteryLegacyRecordsOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateLegacyRecordsOptions(options);

      const params: any = {
        channelId: options.channelId,
        startTime: options.startTime,
        endTime: options.endTime,
      };
      if (options.sessionId !== undefined) params.sessionId = options.sessionId;
      if (options.page !== undefined) params.page = options.page;
      if (options.limit !== undefined) params.limit = options.limit;

      const result = await this.lotteryService.listLegacyLottery(params);

      this.displayRecordsResult(result, options);
    }, 'lottery.legacy-records');
  }

  async downloadWinners(options: LotteryDownloadWinnersOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateDownloadWinnersOptions(options);

      const result = await this.lotteryService.downloadWinnerDetail({
        channelId: options.channelId,
        lotteryId: options.lotteryId,
      });

      this.displayGenericResult(result, options.output);
    }, 'lottery.download-winners');
  }

  async addReceiveInfo(options: LotteryReceiveInfoOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateReceiveInfoOptions(options);

      await confirmWrite(options.force, `Add receive info for lottery winner ${options.winnerCode}?`);
      const params: any = {
        channelId: options.channelId,
        lotteryId: options.lotteryId,
        winnerCode: options.winnerCode,
        viewerId: options.viewerId,
      };
      const receiveInfo = this.parseReceiveInfo(options.receiveInfo);
      if (receiveInfo !== undefined) params.receiveInfo = receiveInfo;

      const result = await this.lotteryService.addReceiveInfoV4(params);

      this.displayGenericResult(result ?? { success: true }, options.output, 'Receive info saved successfully');
    }, 'lottery.receive-info');
  }

  async createWaitLottery(options: Record<string, any>): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateGenericOptions('Lottery wait create', options, ['channelId', 'id', 'lotteryTime'], [], ['lotteryTime']);

      await confirmWrite(options.force, `Create wait lottery schedule for lottery ${options.id}?`);
      const result = await this.lotteryService.createConditionWaitLottery(this.toV4Params(options));

      this.displayGenericResult(result ?? { success: true }, options.output, 'Wait lottery scheduled successfully');
    }, 'lottery.wait.create');
  }

  async listViewerGroups(options: Record<string, any>): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateGenericOptions('Lottery group list', options, ['channelId'], ['page', 'size']);
      const result = await this.lotteryService.listLotteryViewerGroups(this.toV4Params(options));
      this.displayGenericResult(result, options.output);
    }, 'lottery.group.list');
  }

  async createViewerGroup(options: Record<string, any>): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateGenericOptions('Lottery group create', options, ['channelId', 'title']);

      await confirmWrite(options.force, `Create lottery viewer group "${options.title}"?`);
      const result = await this.lotteryService.createLotteryViewerGroup(this.toV4Params(options));

      this.displayGenericResult(result, options.output, 'Lottery viewer group created successfully');
    }, 'lottery.group.create');
  }

  async updateViewerGroup(options: Record<string, any>): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateGenericOptions('Lottery group update', options, ['channelId', 'id', 'title']);

      await confirmWrite(options.force, `Update lottery viewer group ${options.id}?`);
      const result = await this.lotteryService.updateLotteryViewerGroup(this.toV4Params(options));

      this.displayGenericResult(result ?? { success: true }, options.output, 'Lottery viewer group updated successfully');
    }, 'lottery.group.update');
  }

  async deleteViewerGroup(options: Record<string, any>): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateGenericOptions('Lottery group delete', options, ['channelId', 'id']);

      await confirmWrite(options.force, `Delete lottery viewer group ${options.id}?`);
      const result = await this.lotteryService.deleteLotteryViewerGroup(this.toV4Params(options));

      this.displayGenericResult(result ?? { success: true }, options.output, 'Lottery viewer group deleted successfully');
    }, 'lottery.group.delete');
  }

  async listGroupViewers(options: Record<string, any>): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateGenericOptions('Lottery group-viewer list', options, ['channelId', 'groupId'], ['page', 'size']);
      const result = await this.lotteryService.listLotteryGroupViewers(this.toV4Params(options));
      this.displayGenericResult(result, options.output);
    }, 'lottery.group-viewer.list');
  }

  async createGroupViewers(options: Record<string, any>): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateGenericOptions('Lottery group-viewer add', options, ['channelId', 'groupId']);
      this.validateArrayOption('viewerIds', options.viewerIds, options);

      await confirmWrite(options.force, `Add ${options.viewerIds.length} lottery group viewer(s)?`);
      const result = await this.lotteryService.createLotteryGroupViewers(this.toV4Params(options));

      this.displayGenericResult(result, options.output, 'Lottery group viewers added successfully');
    }, 'lottery.group-viewer.add');
  }

  async createGroupViewerNames(options: Record<string, any>): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateGenericOptions('Lottery group-viewer add-names', options, ['channelId', 'groupId']);
      this.validateArrayOption('viewerNames', options.viewerNames, options);

      await confirmWrite(options.force, `Add ${options.viewerNames.length} lottery group viewer name(s)?`);
      const result = await this.lotteryService.createLotteryGroupViewerNames(this.toV4Params(options));

      this.displayGenericResult(result, options.output, 'Lottery group viewer names added successfully');
    }, 'lottery.group-viewer.add-names');
  }

  async deleteGroupViewers(options: Record<string, any>): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateGenericOptions('Lottery group-viewer delete', options, ['channelId', 'groupId']);
      this.validateArrayOption('ids', options.ids, options);

      await confirmWrite(options.force, `Delete ${options.ids.length} lottery group viewer record(s)?`);
      const result = await this.lotteryService.deleteLotteryGroupViewers(this.toV4Params(options));

      this.displayGenericResult(result ?? { success: true }, options.output, 'Lottery group viewers deleted successfully');
    }, 'lottery.group-viewer.delete');
  }

  async listBlacklistViewers(options: Record<string, any>): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateGenericOptions('Lottery blacklist list', options, ['channelId'], ['page', 'size']);
      const result = await this.lotteryService.listLotteryBlacklistViewers(this.toV4Params(options));
      this.displayGenericResult(result, options.output);
    }, 'lottery.blacklist.list');
  }

  async createBlacklistViewers(options: Record<string, any>): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateGenericOptions('Lottery blacklist add', options, ['channelId']);
      this.validateArrayOption('viewerIds', options.viewerIds, options);

      await confirmWrite(options.force, `Add ${options.viewerIds.length} lottery blacklist viewer(s)?`);
      const result = await this.lotteryService.createLotteryBlacklistViewers(this.toV4Params(options));

      this.displayGenericResult(result, options.output, 'Lottery blacklist viewers added successfully');
    }, 'lottery.blacklist.add');
  }

  async deleteBlacklistViewers(options: Record<string, any>): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateGenericOptions('Lottery blacklist delete', options, ['channelId']);
      this.validateArrayOption('ids', options.ids, options);

      await confirmWrite(options.force, `Delete ${options.ids.length} lottery blacklist viewer record(s)?`);
      const result = await this.lotteryService.deleteLotteryBlacklistViewers(this.toV4Params(options));

      this.displayGenericResult(result ?? { success: true }, options.output, 'Lottery blacklist viewers deleted successfully');
    }, 'lottery.blacklist.delete');
  }

  async listLuckyBagWinners(options: Record<string, any>): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateGenericOptions('Lottery lucky-bag winners', options, ['activityId'], ['page', 'size']);
      const result = await this.lotteryService.listLuckyBagWinners(this.toV4Params(options));
      this.displayGenericResult(result, options.output);
    }, 'lottery.lucky-bag.winners');
  }

  // ===== Private Validation Methods =====

  private validateCreateOptions(options: LotteryCreateOptions): void {
    const errors: string[] = [];

    if (!options.channelId || options.channelId.trim() === '') {
      errors.push('channelId is required');
    }

    if (!options.name || options.name.trim() === '') {
      errors.push('name is required');
    }

    if (!options.type || !VALID_LOTTERY_CONDITIONS.includes(options.type)) {
      errors.push('type must be one of: none, invite, duration, comment, question');
    }

    if (typeof options.amount !== 'number' || !Number.isInteger(options.amount) || options.amount < 1) {
      errors.push('amount must be a positive integer');
    }

    if (!options.prizeName || options.prizeName.trim() === '') {
      errors.push('prizeName is required');
    }

    if (options.output && !['table', 'json'].includes(options.output)) {
      errors.push('output must be either "table" or "json"');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Lottery create options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  private validateListOptions(options: LotteryListOptions): void {
    const errors: string[] = [];

    if (!options.channelId || options.channelId.trim() === '') {
      errors.push('channelId is required');
    }

    if (options.page !== undefined) {
      if (typeof options.page !== 'number' || !Number.isInteger(options.page) || options.page < 1) {
        errors.push('page must be a positive integer');
      }
    }

    if (options.size !== undefined) {
      if (typeof options.size !== 'number' || !Number.isInteger(options.size) || options.size < 1) {
        errors.push('size must be a positive integer');
      }
    }

    if (options.output && !['table', 'json'].includes(options.output)) {
      errors.push('output must be either "table" or "json"');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Lottery list options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  private validateGetOptions(options: LotteryGetOptions): void {
    const errors: string[] = [];

    if (!options.channelId || options.channelId.trim() === '') {
      errors.push('channelId is required');
    }

    if (!options.id || options.id.trim() === '') {
      errors.push('id is required');
    }

    if (options.output && !['table', 'json'].includes(options.output)) {
      errors.push('output must be either "table" or "json"');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Lottery get options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  private validateUpdateOptions(options: LotteryUpdateOptions): void {
    const errors: string[] = [];

    if (!options.channelId || options.channelId.trim() === '') {
      errors.push('channelId is required');
    }

    if (!options.id || options.id.trim() === '') {
      errors.push('id is required');
    }

    if (options.output && !['table', 'json'].includes(options.output)) {
      errors.push('output must be either "table" or "json"');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Lottery update options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  private validateDeleteOptions(options: LotteryDeleteOptions): void {
    const errors: string[] = [];

    if (!options.channelId || options.channelId.trim() === '') {
      errors.push('channelId is required');
    }

    if (!options.id || options.id.trim() === '') {
      errors.push('id is required');
    }

    if (options.output && !['table', 'json'].includes(options.output)) {
      errors.push('output must be either "table" or "json"');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Lottery delete options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  private validateWinnersOptions(options: LotteryWinnersOptions): void {
    const errors: string[] = [];

    if (!options.channelId || options.channelId.trim() === '') {
      errors.push('channelId is required');
    }

    if (!options.lotteryId || options.lotteryId.trim() === '') {
      errors.push('lotteryId is required');
    }

    if (options.viewerId !== undefined && options.viewerId.trim() === '') {
      errors.push('viewerId must not be empty');
    }

    if (options.output && !['table', 'json'].includes(options.output)) {
      errors.push('output must be either "table" or "json"');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Lottery winners options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  private validateRecordsOptions(options: LotteryRecordsOptions): void {
    const errors: string[] = [];

    if (!options.channelId || options.channelId.trim() === '') {
      errors.push('channelId is required');
    }

    if (options.output && !['table', 'json'].includes(options.output)) {
      errors.push('output must be either "table" or "json"');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Lottery records options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  private validateChannelRecordsOptions(options: LotteryChannelRecordsOptions): void {
    const errors: string[] = [];

    if (!Array.isArray(options.channelIds) || options.channelIds.length === 0) {
      errors.push('channelIds is required');
    }
    this.validatePositiveNumber(errors, 'startTime', options.startTime);
    this.validatePositiveNumber(errors, 'endTime', options.endTime);
    this.validateOptionalPositiveInteger(errors, 'page', options.page);
    this.validateOptionalPositiveInteger(errors, 'limit', options.limit);

    if (options.output && !['table', 'json'].includes(options.output)) {
      errors.push('output must be either "table" or "json"');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Lottery channel records options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  private validateLegacyRecordsOptions(options: LotteryLegacyRecordsOptions): void {
    const errors: string[] = [];

    if (!options.channelId || options.channelId.trim() === '') {
      errors.push('channelId is required');
    }
    this.validatePositiveNumber(errors, 'startTime', options.startTime);
    this.validatePositiveNumber(errors, 'endTime', options.endTime);
    this.validateOptionalPositiveInteger(errors, 'page', options.page);
    this.validateOptionalPositiveInteger(errors, 'limit', options.limit);

    if (options.output && !['table', 'json'].includes(options.output)) {
      errors.push('output must be either "table" or "json"');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Lottery legacy records options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  private validateDownloadWinnersOptions(options: LotteryDownloadWinnersOptions): void {
    const errors: string[] = [];

    if (!options.channelId || options.channelId.trim() === '') {
      errors.push('channelId is required');
    }
    if (!options.lotteryId || options.lotteryId.trim() === '') {
      errors.push('lotteryId is required');
    }
    if (options.output && !['table', 'json'].includes(options.output)) {
      errors.push('output must be either "table" or "json"');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Lottery download winners options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  private validateReceiveInfoOptions(options: LotteryReceiveInfoOptions): void {
    const errors: string[] = [];

    if (!options.channelId || options.channelId.trim() === '') {
      errors.push('channelId is required');
    }
    if (!options.lotteryId || options.lotteryId.trim() === '') {
      errors.push('lotteryId is required');
    }
    if (!options.winnerCode || options.winnerCode.trim() === '') {
      errors.push('winnerCode is required');
    }
    if (!options.viewerId || options.viewerId.trim() === '') {
      errors.push('viewerId is required');
    }
    if (options.output && !['table', 'json'].includes(options.output)) {
      errors.push('output must be either "table" or "json"');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Lottery receive info options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  private validatePositiveNumber(errors: string[], field: string, value: number | undefined): void {
    if (!Number.isFinite(value) || (value as number) <= 0) {
      errors.push(`${field} must be a positive number`);
    }
  }

  private validateOptionalPositiveInteger(errors: string[], field: string, value: number | undefined): void {
    if (value === undefined) return;
    if (!Number.isInteger(value) || value < 1) {
      errors.push(`${field} must be a positive integer`);
    }
  }

  private validateGenericOptions(
    label: string,
    options: Record<string, any>,
    requiredFields: string[],
    positiveIntegerFields: string[] = [],
    positiveNumberFields: string[] = []
  ): void {
    const errors: string[] = [];

    requiredFields.forEach((field) => {
      const value = options[field];
      if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
        errors.push(`${field} is required`);
      }
    });

    positiveIntegerFields.forEach((field) => {
      const value = options[field];
      if (value !== undefined && (!Number.isInteger(value) || value < 1)) {
        errors.push(`${field} must be a positive integer`);
      }
    });

    positiveNumberFields.forEach((field) => {
      const value = options[field];
      if (value !== undefined && (!Number.isFinite(value) || value <= 0)) {
        errors.push(`${field} must be a positive number`);
      }
    });

    if (options.output && !['table', 'json'].includes(options.output)) {
      errors.push('output must be either "table" or "json"');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `${label} options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  private validateArrayOption(field: string, value: unknown, options: Record<string, any>): void {
    if (!Array.isArray(value) || value.length === 0) {
      throw new PolyVValidationError(
        `${field} must be a non-empty array`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  private toV4Params(options: Record<string, any>): Record<string, unknown> {
    const params = apiParams(options) as Record<string, unknown>;
    if (params.page !== undefined) {
      params.pageNumber = params.page;
      delete params.page;
    }
    if (params.size !== undefined) {
      params.pageSize = params.size;
      delete params.size;
    }
    return params;
  }

  // ===== Private Display Methods =====

  private displayCreateResult(result: any, options: LotteryCreateOptions): void {
    const activityId = result?.data?.id || 'N/A';

    if (options.output === 'json') {
      this.displayData({
        channelId: options.channelId,
        activityId,
        name: options.name,
        type: options.type,
        amount: options.amount,
        prizeName: options.prizeName,
        result
      }, 'json');
    } else {
      console.log(`Lottery created successfully`);
      console.log(`Channel ID: ${options.channelId}`);
      console.log(`Activity ID: ${activityId}`);
      console.log(`Name: ${options.name}`);
      console.log(`Type: ${options.type}`);
      console.log(`Amount: ${options.amount}`);
      console.log(`Prize: ${options.prizeName}`);
    }
  }

  private displayListResult(result: any, options: LotteryListOptions): void {
    const contents = result?.data?.contents || [];
    const totalItems = result?.data?.totalItems || 0;

    if (contents.length === 0) {
      this.displayInfo(`No lottery activities found for channel ${options.channelId}`);
      return;
    }

    if (options.output === 'json') {
      this.displayData({
        channelId: options.channelId,
        totalItems,
        data: contents
      }, 'json');
    } else {
      const tableData = contents.map((item: any) => ({
        'ID': item.id || '-',
        'Name': this.truncate(item.activityName || '-', 30),
        'Type': item.lotteryCondition || '-',
        'Status': item.status || '-',
        'Amount': item.amount || '-',
        'Prize': this.truncate(item.prizeName || '-', 20),
      }));

      console.log(`Found ${totalItems} lottery activities`);
      this.displayAsTable(tableData);
    }
  }

  private displayGetResult(result: any, options: LotteryGetOptions): void {
    const data = result?.data;

    if (!data) {
      this.displayInfo(`No lottery activity found with ID ${options.id}`);
      return;
    }

    if (options.output === 'json') {
      this.displayData({
        channelId: options.channelId,
        data
      }, 'json');
    } else {
      console.log(`Lottery Activity Details`);
      console.log(`Channel ID: ${options.channelId}`);
      console.log(`ID: ${data.id || '-'}`);
      console.log(`Name: ${data.activityName || '-'}`);
      console.log(`Type: ${data.lotteryCondition || '-'}`);
      console.log(`Status: ${data.status || '-'}`);
      console.log(`Amount: ${data.amount || '-'}`);
      console.log(`Prize: ${data.prizeName || '-'}`);
    }
  }

  private displayUpdateResult(result: any, options: LotteryUpdateOptions): void {
    if (options.output === 'json') {
      this.displayData({
        channelId: options.channelId,
        id: options.id,
        result
      }, 'json');
    } else {
      console.log(`Lottery updated successfully`);
      console.log(`Channel ID: ${options.channelId}`);
      console.log(`Activity ID: ${options.id}`);
    }
  }

  private displayWinnersResult(result: any, options: LotteryWinnersOptions): void {
    const data = result?.data?.contents || result?.data || [];

    if (!data || (Array.isArray(data) && data.length === 0)) {
      this.displayInfo(`No winners found for lottery ${options.lotteryId}`);
      return;
    }

    if (options.output === 'json') {
      this.displayData({
        channelId: options.channelId,
        lotteryId: options.lotteryId,
        data
      }, 'json');
    } else {
      const tableData = data.map((item: any) => ({
        'ID': this.truncate(item.viewerId || '-', 10),
        'Nickname': this.truncate(item.nick || '-', 20),
        'Winner Code': item.winnerCode || '-',
        'Win Time': item.winTime ? new Date(item.winTime).toLocaleString() : '-',
      }));

      console.log(`Found ${data.length} winners`);
      this.displayAsTable(tableData);
    }
  }

  private displayRecordsResult(result: any, options: LotteryRecordsOptions): void {
    const data = result?.data?.contents || result?.data || [];

    if (!data || (Array.isArray(data) && data.length === 0)) {
      this.displayInfo(`No lottery records found for channel ${options.channelId}`);
      return;
    }

    if (options.output === 'json') {
      this.displayData({
        channelId: options.channelId,
        data
      }, 'json');
    } else {
      const tableData = data.map((item: any) => ({
        'Lottery ID': this.truncate(item.lotteryId || '-', 10),
        'Session ID': this.truncate(item.sessionId || '-', 10),
        'Prize': this.truncate(item.prize || '-', 20),
        'Amount': item.amount || '-',
        'Winners': item.winnerCount || '-',
        'Created Time': item.createdTime ? new Date(item.createdTime).toLocaleString() : '-',
      }));

      console.log(`Found ${data.length} lottery records`);
      this.displayAsTable(tableData);
    }
  }

  private displayGenericResult(result: any, format?: OutputFormat, successMessage?: string): void {
    if (successMessage && format !== 'json') {
      this.displaySuccess(successMessage);
    }
    this.displayData(result ?? { success: true }, format || 'table');
  }

  // ===== Private Helper Methods =====

  private parseReceiveInfo(
    value: LotteryReceiveInfoOptions['receiveInfo']
  ): Record<string, unknown> | unknown[] | undefined {
    if (value === undefined || typeof value !== 'string') {
      return value as Record<string, unknown> | unknown[] | undefined;
    }
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object') {
      throw new PolyVValidationError(
        'receiveInfo must be a JSON object or array',
        'receiveInfo',
        value,
        'validation_failed'
      );
    }
    return parsed as Record<string, unknown> | unknown[];
  }

  private truncate(str: string, maxLength: number): string {
    if (!str) return '-';
    return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
  }
}
