/**
 * @fileoverview Handler for checkin CLI commands
 * @author Development Team
 * @since 11.3.0
 */

import { BaseHandler } from './base.handler';
import { CheckinServiceSdk } from '../services/checkin-service';
import {
  CheckinServiceConfig,
  CheckinStartOptions,
  CheckinListOptions,
  CheckinResultOptions,
  CheckinSessionResultOptions,
  CheckinSessionsOptions,
} from '../types/checkin';
import { AuthConfig } from '../types/auth';
import { PolyVValidationError } from '../utils/errors';

/**
 * Handler for checkin-related CLI commands
 */
export class CheckinHandler extends BaseHandler {
  private readonly checkinService: CheckinServiceSdk;

  /**
   * Creates a new CheckinHandler instance
   * @param authConfig Authentication configuration
   * @param serviceConfig Checkin service configuration
   */
  constructor(authConfig: AuthConfig, serviceConfig: CheckinServiceConfig) {
    super();
    this.checkinService = new CheckinServiceSdk(authConfig, serviceConfig);
  }

  // ========================================
  // checkin start (AC #1)
  // ========================================

  /**
   * Start a checkin session
   * @param options Checkin start options from CLI
   * @returns Promise that resolves when checkin is started
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   *
   * @examples
   * ```typescript
   * await checkinHandler.startCheckin({
   *   channelId: '3151318',
   *   output: 'table'
   * });
   * ```
   */
  async startCheckin(options: CheckinStartOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate input options
      this.validateStartOptions(options);

      // Build params with forceCheckInEnabled only if force is true
      const params: any = {
        channelId: options.channelId,
        limitTime: options.limitTime,
        delayTime: options.delayTime,
        message: options.message,
      };
      if (options.force) {
        params.forceCheckInEnabled = 'Y';
      }

      // Call SDK service
      const result = await this.checkinService.startCheckin(params);

      // Display results
      this.displayStartResult(result, options);

    }, 'checkin.start');
  }

  // ========================================
  // checkin list (AC #2)
  // ========================================

  /**
   * List checkin records
   * @param options Checkin list options from CLI
   * @returns Promise that resolves when records are listed
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async listCheckins(options: CheckinListOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate input options
      this.validateListOptions(options);

      // Call SDK service - only pass defined values to avoid exactOptionalPropertyTypes issues
      const params: { channelId: string; page?: number; pageSize?: number; date?: string; sessionId?: string } = {
        channelId: options.channelId,
      };
      if (options.page !== undefined) params.page = options.page;
      if (options.size !== undefined) params.pageSize = options.size;
      if (options.date !== undefined) params.date = options.date;
      if (options.sessionId !== undefined) params.sessionId = options.sessionId;

      const result = await this.checkinService.listCheckins(params);

      // Display results
      this.displayListResult(result, options);

    }, 'checkin.list');
  }

  // ========================================
  // checkin result (AC #3)
  // ========================================

  /**
   * Get checkin result details
   * @param options Checkin result options from CLI
   * @returns Promise that resolves when result is displayed
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async getCheckinResult(options: CheckinResultOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate input options
      this.validateResultOptions(options);

      // Call SDK service
      const result = await this.checkinService.getCheckinResult({
        channelId: options.channelId,
        checkinId: options.checkinId,
      });

      // Display results
      this.displayResultResult(result, options);

    }, 'checkin.result');
  }

  /**
   * Get checkin records by live session ID
   * @param options Checkin session result options from CLI
   * @returns Promise that resolves when result is displayed
   */
  async getCheckinBySessionId(options: CheckinSessionResultOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateSessionResultOptions(options);

      const result = await this.checkinService.getCheckinBySessionId({
        channelId: options.channelId,
        sessionId: options.sessionId,
      });

      this.displaySessionResult(result, options);
    }, 'checkin.session-result');
  }

  // ========================================
  // checkin sessions (AC #4)
  // ========================================

  /**
   * List checkin sessions by time range
   * @param options Checkin sessions options from CLI
   * @returns Promise that resolves when sessions are listed
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async listSessions(options: CheckinSessionsOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate input options
      this.validateSessionsOptions(options);

      // Call SDK service
      const result = await this.checkinService.listSessions({
        channelId: options.channelId,
        startDate: options.startDate || this.getDefaultStartDate(),
        endDate: options.endDate || this.getDefaultEndDate(),
      });

      // Display results
      this.displaySessionsResult(result, options);

    }, 'checkin.sessions');
  }

  // ===== Private Validation Methods =====

  private validateStartOptions(options: CheckinStartOptions): void {
    const errors: string[] = [];

    if (!options.channelId || options.channelId.trim() === '') {
      errors.push('channelId is required');
    }

    if (options.limitTime !== undefined) {
      if (typeof options.limitTime !== 'number' || options.limitTime < 0 || options.limitTime > 86400) {
        errors.push('limitTime must be between 0 and 86400');
      }
    }

    if (options.output && !['table', 'json'].includes(options.output)) {
      errors.push('output must be either "table" or "json"');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Checkin start options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  private validateListOptions(options: CheckinListOptions): void {
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
        `Checkin list options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  private validateResultOptions(options: CheckinResultOptions): void {
    const errors: string[] = [];

    if (!options.channelId || options.channelId.trim() === '') {
      errors.push('channelId is required');
    }

    if (!options.checkinId || options.checkinId.trim() === '') {
      errors.push('checkinId is required');
    }

    if (options.output && !['table', 'json'].includes(options.output)) {
      errors.push('output must be either "table" or "json"');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Checkin result options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  private validateSessionResultOptions(options: CheckinSessionResultOptions): void {
    const errors: string[] = [];

    if (!options.channelId || options.channelId.trim() === '') {
      errors.push('channelId is required');
    }

    if (!options.sessionId || options.sessionId.trim() === '') {
      errors.push('sessionId is required');
    }

    if (options.output && !['table', 'json'].includes(options.output)) {
      errors.push('output must be either "table" or "json"');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Checkin session result options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  private validateSessionsOptions(options: CheckinSessionsOptions): void {
    const errors: string[] = [];

    if (!options.channelId || options.channelId.trim() === '') {
      errors.push('channelId is required');
    }

    // Validate date format if provided
    const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (options.startDate && !dateFormatRegex.test(options.startDate)) {
      errors.push('Invalid date format. Use yyyy-MM-dd');
    }

    if (options.endDate && !dateFormatRegex.test(options.endDate)) {
      errors.push('Invalid date format. Use yyyy-MM-dd');
    }

    // Validate date range is within 30 days
    if (options.startDate && options.endDate) {
      const start = new Date(options.startDate);
      const end = new Date(options.endDate);
      const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays > 30) {
        errors.push('Date range cannot exceed 30 days');
      }
    }

    if (options.output && !['table', 'json'].includes(options.output)) {
      errors.push('output must be either "table" or "json"');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Checkin sessions options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  // ===== Private Display Methods =====

  private displayStartResult(result: any, options: CheckinStartOptions): void {
    const checkinId = result?.data?.checkinId || result?.checkinId;
    const nextStep = `Run "checkin sessions -c ${options.channelId}" to find the generated checkin ID.`;

    if (options.output === 'json') {
      const data: Record<string, any> = {
        channelId: options.channelId,
        limitTime: options.limitTime,
        delayTime: options.delayTime,
        message: options.message,
        force: options.force,
        result
      };
      if (checkinId) {
        data['checkinId'] = checkinId;
      } else {
        data['nextStep'] = nextStep;
      }
      this.displayData(data, 'json');
    } else {
      if (options.delayTime) {
        console.log(`Scheduled checkin submitted successfully`);
        console.log(`Channel ID: ${options.channelId}`);
        console.log(`Scheduled time: ${new Date(options.delayTime).toLocaleString()}`);
      } else {
        console.log(`Checkin started successfully`);
        console.log(`Channel ID: ${options.channelId}`);
      }
      if (checkinId) {
        console.log(`Checkin ID: ${checkinId}`);
      } else {
        console.log(`Next step: ${nextStep}`);
      }
    }
  }

  private displayListResult(result: any, options: CheckinListOptions): void {
    const data = result?.data ?? result;
    const contents = data?.contents || [];
    const count = data?.count || data?.totalItems || contents.length;

    if (contents.length === 0) {
      this.displayInfo(`No checkins found for channel ${options.channelId}`);
      return;
    }

    if (options.output === 'json') {
      this.displayData({
        channelId: options.channelId,
        count,
        data: contents
      }, 'json');
    } else {
      const tableData = contents.map((item: any) => ({
        'Checkin ID': item.checkinid || item.checkinId || '-',
        'User ID': item.userid || item.viewerId || '-',
        'Nickname': item.nickname || item.nick || '-',
        'Time': item.timeFormat || (item.time ? new Date(item.time).toLocaleString() : '-'),
      }));

      console.log(`Found ${count} checkin records`);
      this.displayAsTable(tableData);
    }
  }

  private displayResultResult(result: any, options: CheckinResultOptions): void {
    const data = result?.data ?? result ?? [];

    if (!data || (Array.isArray(data) && data.length === 0)) {
      this.displayInfo(`No checkin result found for checkin ID ${options.checkinId}`);
      return;
    }

    if (options.output === 'json') {
      this.displayData({
        channelId: options.channelId,
        checkinId: options.checkinId,
        data
      }, 'json');
    } else {
      const tableData = data.map((item: any) => ({
        'User ID': item.userid || item.viewerId || '-',
        'Nickname': item.nickname || item.nick || '-',
        'Checked': item.checked === 'Y' ? 'Yes' : 'No',
        'Time': item.timeFormat || (item.time ? new Date(item.time).toLocaleString() : '-'),
      }));

      const checkedCount = data.filter((item: any) => item.checked === 'Y').length;
      const uncheckedCount = data.filter((item: any) => item.checked === 'N').length;

      console.log(`Checkin result for ${options.checkinId}`);
      console.log(`Checked: ${checkedCount}, Unchecked: ${uncheckedCount}`);
      this.displayAsTable(tableData);
    }
  }

  private displaySessionsResult(result: any, options: CheckinSessionsOptions): void {
    const data = result?.data ?? result ?? [];

    if (!data || (Array.isArray(data) && data.length === 0)) {
      this.displayInfo(`No checkin sessions found for the specified date range`);
      return;
    }

    if (options.output === 'json') {
      this.displayData({
        channelId: options.channelId,
        startDate: options.startDate,
        endDate: options.endDate,
        data
      }, 'json');
    } else {
      const tableData = data.map((item: any) => ({
        'Checkin ID': item.checkinid || item.checkinId || '-',
        'Time': item.timeFormat || (item.time ? new Date(item.time).toLocaleString() : '-'),
      }));

      console.log(`Found ${data.length} checkin sessions`);
      this.displayAsTable(tableData);
    }
  }

  private displaySessionResult(result: any, options: CheckinSessionResultOptions): void {
    const data = result?.data ?? result;

    if (options.output === 'json') {
      this.displayData({
        channelId: options.channelId,
        sessionId: options.sessionId,
        data,
      }, 'json');
      return;
    }

    if (!data || (Array.isArray(data) && data.length === 0)) {
      this.displayInfo(`No checkin result found for session ${options.sessionId}`);
      return;
    }

    this.displayData(data, 'table');
  }

  // ===== Private Helper Methods =====

  private getDefaultStartDate(): string {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0] ?? '';
  }

  private getDefaultEndDate(): string {
    return new Date().toISOString().split('T')[0] ?? '';
  }
}
