/**
 * @fileoverview Handler for donate CLI commands
 * @author Development Team
 * @since 11.6.0
 */

import { BaseHandler } from './base.handler';
import { DonateServiceSdk } from '../services/donate-service';
import {
  DonateServiceConfig,
  DonateConfigGetOptions,
  DonateConfigUpdateOptions,
  DonateListOptions,
} from '../types/donate';
import { AuthConfig } from '../types/auth';
import { PolyVValidationError } from '../utils/errors';

/**
 * Handler for donate-related CLI commands
 */
export class DonateHandler extends BaseHandler {
  private readonly donateService: DonateServiceSdk;

  /**
   * Creates a new DonateHandler instance
   * @param authConfig Authentication configuration
   * @param serviceConfig Donate service configuration
   */
  constructor(authConfig: AuthConfig, serviceConfig: DonateServiceConfig) {
    super();
    this.donateService = new DonateServiceSdk(authConfig, serviceConfig);
  }

  // ========================================
  // donate config get (AC #1)
  // ========================================

  /**
   * Get donate configuration
   * @param options Donate config get options from CLI
   * @returns Promise that resolves when config is displayed
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async getConfig(options: DonateConfigGetOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate input options
      this.validateConfigGetOptions(options);

      // Call SDK service
      const result = await this.donateService.getDonateConfig({
        channelId: options.channelId,
      });

      // Display results
      this.displayConfigGetResult(result, options);

    }, 'donate.config.get');
  }

  // ========================================
  // donate config update (AC #2)
  // ========================================

  /**
   * Update donate configuration
   * @param options Donate config update options from CLI
   * @returns Promise that resolves when config is updated
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async updateConfig(options: DonateConfigUpdateOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate input options
      this.validateConfigUpdateOptions(options);

      // Build params
      const params: any = {
        channelId: options.channelId,
      };

      if (options.cashEnabled !== undefined) {
        params.donateEnabled = options.cashEnabled;
      }
      if (options.tips !== undefined) {
        params.donateTips = options.tips;
      }
      if (options.amounts !== undefined) {
        if (typeof options.amounts === 'string') {
          params.donateAmounts = options.amounts.split(',').map(n => parseFloat(n.trim()));
        } else {
          params.donateAmounts = options.amounts;
        }
      }

      // Call SDK service
      await this.donateService.updateDonateConfig(params);

      // Display results
      this.displayConfigUpdateResult(options);

    }, 'donate.config.update');
  }

  // ========================================
  // donate list (AC #3)
  // ========================================

  /**
   * List donate records
   * @param options Donate list options from CLI
   * @returns Promise that resolves when records are displayed
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async listRecords(options: DonateListOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate input options
      this.validateListOptions(options);

      // Build params with defaults
      const params: any = {
        channelId: options.channelId,
        start: options.start,
        end: options.end,
        pageNumber: options.page ?? 1,
        pageSize: options.size ?? 10,
      };

      // Call SDK service
      const result = await this.donateService.listRewardGift(params);

      // Display results
      this.displayListResult(result, options);

    }, 'donate.list');
  }

  // ===== Private Validation Methods =====

  private validateConfigGetOptions(options: DonateConfigGetOptions): void {
    const errors: string[] = [];

    if (!options.channelId || options.channelId.trim() === '') {
      errors.push('channelId is required');
    }

    if (options.output && !['table', 'json'].includes(options.output)) {
      errors.push('output must be either "table" or "json"');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Donate config get options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  private validateConfigUpdateOptions(options: DonateConfigUpdateOptions): void {
    const errors: string[] = [];

    if (!options.channelId || options.channelId.trim() === '') {
      errors.push('channelId is required');
    }

    if (options.cashEnabled !== undefined && !['Y', 'N'].includes(options.cashEnabled)) {
      errors.push('cashEnabled must be either "Y" or "N"');
    }

    if (options.giftEnabled !== undefined && !['Y', 'N'].includes(options.giftEnabled)) {
      errors.push('giftEnabled must be either "Y" or "N"');
    }

    if (options.output && !['table', 'json'].includes(options.output)) {
      errors.push('output must be either "table" or "json"');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Donate config update options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  private validateListOptions(options: DonateListOptions): void {
    const errors: string[] = [];

    if (!options.channelId || options.channelId.trim() === '') {
      errors.push('channelId is required');
    }

    if (options.start === undefined || options.start === null) {
      errors.push('start is required');
    }

    if (options.end === undefined || options.end === null) {
      errors.push('end is required');
    }

    if (options.start !== undefined && options.end !== undefined && options.start > options.end) {
      errors.push('start must be before end');
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
        `Donate list options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  // ===== Private Display Methods =====

  private displayConfigGetResult(result: any, options: DonateConfigGetOptions): void {
    const data = result?.data;

    if (!data) {
      this.displayInfo(`No donate configuration found for channel ${options.channelId}`);
      return;
    }

    if (options.output === 'json') {
      this.displayData({
        channelId: options.channelId,
        ...data
      }, 'json');
    } else {
      console.log(`Donate Configuration for Channel: ${options.channelId}`);
      console.log('');
      console.log(`Global Setting Enabled: ${data.globalSettingEnabled || 'N'}`);
      console.log(`Cash Donate Enabled: ${data.donateCashEnabled || 'N'}`);
      console.log(`Good Donate Enabled: ${data.donateGoodEnabled || 'N'}`);
      console.log(`Point Donate Enabled: ${data.donatePointEnabled || 'N'}`);
      console.log(`Donate Tips: ${data.donateTips || '-'}`);
      console.log(`Cash Min: ${data.cashMin ?? '-'}`);
      console.log(`Cash Amounts: ${data.cashes?.join(', ') || '-'}`);
      if (data.goods && data.goods.length > 0) {
        console.log(`Goods:`);
        data.goods.forEach((good: any) => {
          console.log(`  - ${good.goodName} (${good.goodPrice}) - ${good.goodEnabled === 'Y' ? 'Enabled' : 'Disabled'}`);
        });
      }
    }
  }

  private displayConfigUpdateResult(options: DonateConfigUpdateOptions): void {
    if (options.output === 'json') {
      this.displayData({
        channelId: options.channelId,
        cashEnabled: options.cashEnabled,
        giftEnabled: options.giftEnabled,
        tips: options.tips,
        amounts: options.amounts,
      }, 'json');
    } else {
      console.log(`Donate config updated successfully`);
      console.log(`Channel ID: ${options.channelId}`);
      if (options.cashEnabled !== undefined) {
        console.log(`Cash Enabled: ${options.cashEnabled}`);
      }
      if (options.giftEnabled !== undefined) {
        console.log(`Gift Enabled: ${options.giftEnabled}`);
      }
      if (options.tips !== undefined) {
        console.log(`Tips: ${options.tips}`);
      }
      if (options.amounts !== undefined) {
        const amountsStr = typeof options.amounts === 'string' ? options.amounts : options.amounts.join(', ');
        console.log(`Amounts: ${amountsStr}`);
      }
    }
  }

  private displayListResult(result: any, options: DonateListOptions): void {
    const data = result?.data;
    const contents = data?.contents || [];
    const totalItems = data?.totalItems || 0;

    if (totalItems === 0) {
      this.displayInfo(`No donate records found for channel ${options.channelId}`);
      return;
    }

    if (options.output === 'json') {
      this.displayData({
        channelId: options.channelId,
        pageNumber: data.pageNumber,
        pageSize: data.pageSize,
        totalPages: data.totalPages,
        totalItems: data.totalItems,
        contents: contents
      }, 'json');
    } else {
      const tableData = contents.map((item: any) => ({
        'User ID': this.truncate(item.userId || '-', 15),
        'Nickname': this.truncate(item.nickName || '-', 20),
        'Type': item.type === '1' ? 'Props/Points' : 'Cash',
        'Amount': item.amount || '-',
        'Name': this.truncate(item.name || '-', 20),
        'Session ID': this.truncate(item.sessionId || '-', 12),
        'Time': item.timestamp ? new Date(item.timestamp).toLocaleString() : '-',
      }));

      console.log(`Found ${totalItems} donate records`);
      console.log(`Page: ${data.pageNumber}, Size: ${data.pageSize}`);
      console.log(`Total pages: ${data.totalPages}`);
      if (tableData.length > 0) {
        this.displayAsTable(tableData);
      }
    }
  }

  // ===== Private Helper Methods =====

  private truncate(str: string, maxLength: number): string {
    if (!str) return '-';
    return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
  }
}
