/**
 * @fileoverview Handler for whitelist CLI commands
 * @author Development Team
 * @since 12.4.0
 */

import { BaseHandler } from './base.handler';
import { WhitelistServiceSdk } from '../services/whitelist-service';
import {
  WhitelistServiceConfig,
  WhitelistListOptions,
  WhitelistAddOptions,
  WhitelistUpdateOptions,
  WhitelistRemoveOptions,
} from '../types/whitelist';
import { AuthConfig } from '../types/auth';
import { PolyVValidationError } from '../utils/errors';

/**
 * Handler for whitelist CLI commands
 */
export class WhitelistHandler extends BaseHandler {
  private readonly whitelistService: WhitelistServiceSdk;

  /**
   * Creates a new WhitelistHandler instance
   * @param authConfig Authentication configuration
   * @param serviceConfig Whitelist service configuration
   */
  constructor(authConfig: AuthConfig, serviceConfig: WhitelistServiceConfig) {
    super();
    this.whitelistService = new WhitelistServiceSdk(authConfig, serviceConfig);
  }

  // ========================================
  // whitelist list (AC #1)
  // ========================================

  /**
   * List whitelist items
   * @param options List options from CLI
   * @returns Promise that resolves when results are displayed
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async listWhitelist(options: WhitelistListOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate input options
      this.validateListOptions(options);

      // Build params
      const params: any = {
        rank: options.rank,
      };
      if (options.channelId) {
        params.channelId = options.channelId;
      }
      if (options.page !== undefined) {
        params.page = options.page;
      }
      if (options.pageSize !== undefined) {
        params.pageSize = options.pageSize;
      }
      if (options.keyword) {
        params.keyword = options.keyword;
      }

      // Call SDK service
      const result = await this.whitelistService.getWhiteList(params);

      // Display results
      this.displayListResult(result, options);

    }, 'whitelist.list');
  }

  // ========================================
  // whitelist add (AC #2)
  // ========================================

  /**
   * Add whitelist item
   * @param options Add options from CLI
   * @returns Promise that resolves when results are displayed
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async addWhitelist(options: WhitelistAddOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate input options
      this.validateAddOptions(options);

      // Build params
      const params: any = {
        rank: options.rank,
        code: options.code,
      };
      if (options.channelId) {
        params.channelId = options.channelId;
      }
      if (options.name) {
        params.name = options.name;
      }

      // Call SDK service
      await this.whitelistService.addWhiteList(params);

      // Display result
      this.displayAddResult(options);

    }, 'whitelist.add');
  }

  // ========================================
  // whitelist update (AC #3)
  // ========================================

  /**
   * Update whitelist item
   * @param options Update options from CLI
   * @returns Promise that resolves when results are displayed
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async updateWhitelist(options: WhitelistUpdateOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate input options
      this.validateUpdateOptions(options);

      // Build params (includes oldCode which SDK type doesn't have)
      const params: any = {
        rank: options.rank,
        oldCode: options.oldCode,
        code: options.code,
      };
      if (options.channelId) {
        params.channelId = options.channelId;
      }
      if (options.name !== undefined) {
        params.name = options.name;
      }

      // Call SDK service
      await this.whitelistService.updateWhiteList(params);

      // Display result
      this.displayUpdateResult(options);

    }, 'whitelist.update');
  }

  // ========================================
  // whitelist remove (AC #4)
  // ========================================

  /**
   * Remove whitelist items
   * @param options Remove options from CLI
   * @returns Promise that resolves when results are displayed
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async removeWhitelist(options: WhitelistRemoveOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate input options
      this.validateRemoveOptions(options);

      // Build params
      const params: any = {
        rank: options.rank,
        isClear: options.clear ? 'Y' : 'N',
      };
      if (!options.clear && options.codes) {
        params.codes = options.codes;
      }
      if (options.channelId) {
        params.channelId = options.channelId;
      }

      // Call SDK service
      await this.whitelistService.deleteWhiteList(params);

      // Display result
      this.displayRemoveResult(options);

    }, 'whitelist.remove');
  }

  // ===== Private Validation Methods =====

  private validateListOptions(options: WhitelistListOptions): void {
    const errors: string[] = [];

    // Validate rank
    if (options.rank !== 1 && options.rank !== 2) {
      errors.push('rank 必须是 1 (主要条件) 或 2 (次要条件)');
    }

    // Validate output format
    if (options.output && !['table', 'json'].includes(options.output)) {
      errors.push('输出格式必须是 "table" 或 "json"');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        errors.join(', '),
        'options',
        options,
        'validation_failed'
      );
    }
  }

  private validateAddOptions(options: WhitelistAddOptions): void {
    const errors: string[] = [];

    // Validate rank
    if (options.rank !== 1 && options.rank !== 2) {
      errors.push('rank 必须是 1 (主要条件) 或 2 (次要条件)');
    }

    // Validate code
    if (!options.code || options.code.trim() === '') {
      errors.push('code (会员码) 是必需的');
    } else if (options.code.length > 50) {
      errors.push('code 不能超过50个字符');
    }

    // Validate name
    if (options.name && options.name.length > 50) {
      errors.push('name 不能超过50个字符');
    }

    // Validate output format
    if (options.output && !['table', 'json'].includes(options.output)) {
      errors.push('输出格式必须是 "table" 或 "json"');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        errors.join(', '),
        'options',
        options,
        'validation_failed'
      );
    }
  }

  private validateUpdateOptions(options: WhitelistUpdateOptions): void {
    const errors: string[] = [];

    // Validate rank
    if (options.rank !== 1 && options.rank !== 2) {
      errors.push('rank 必须是 1 (主要条件) 或 2 (次要条件)');
    }

    // Validate oldCode
    if (!options.oldCode || options.oldCode.trim() === '') {
      errors.push('old-code (原会员码) 是必需的');
    }

    // Validate code
    if (!options.code || options.code.trim() === '') {
      errors.push('code (新会员码) 是必需的');
    } else if (options.code.length > 50) {
      errors.push('code 不能超过50个字符');
    }

    // Validate name
    if (options.name && options.name.length > 50) {
      errors.push('name 不能超过50个字符');
    }

    // Validate output format
    if (options.output && !['table', 'json'].includes(options.output)) {
      errors.push('输出格式必须是 "table" 或 "json"');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        errors.join(', '),
        'options',
        options,
        'validation_failed'
      );
    }
  }

  private validateRemoveOptions(options: WhitelistRemoveOptions): void {
    const errors: string[] = [];

    // Validate rank
    if (options.rank !== 1 && options.rank !== 2) {
      errors.push('rank 必须是 1 (主要条件) 或 2 (次要条件)');
    }

    // Validate that either codes or clear is specified
    if (!options.clear && (!options.codes || options.codes.trim() === '')) {
      errors.push('必须指定 --codes 或使用 --clear 清空所有');
    }

    // Validate output format
    if (options.output && !['table', 'json'].includes(options.output)) {
      errors.push('输出格式必须是 "table" 或 "json"');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        errors.join(', '),
        'options',
        options,
        'validation_failed'
      );
    }
  }

  // ===== Private Display Methods =====

  private displayListResult(result: any, options: WhitelistListOptions): void {
    const output = options.output || 'table';

    if (output === 'json') {
      this.displayData(result, 'json');
    } else {
      // Display summary
      const scope = options.channelId ? `channel ${options.channelId}` : 'global settings';
      console.log(`找到 ${result.contents?.length || 0} 条白名单记录 (${scope})`);
      console.log(`页码: ${result.pageNumber || 1} / ${result.totalPages || 1}`);

      // Display table
      if (result.contents && result.contents.length > 0) {
        const tableData = result.contents.map((item: any) => ({
          '会员码': item.phone || '-',
          '昵称': item.name || '-',
        }));
        this.displayAsTable(tableData);
      } else {
        this.displayInfo('没有找到白名单记录');
      }
    }
  }

  private displayAddResult(options: WhitelistAddOptions): void {
    const output = options.output || 'table';

    if (output === 'json') {
      this.displayData({
        success: true,
        message: '白名单添加成功',
        code: options.code,
        channelId: options.channelId || 'global',
      }, 'json');
    } else {
      const target = options.channelId
        ? `channel ${options.channelId}`
        : 'global settings';
      this.displaySuccess(`Successfully added whitelist item for ${target}`);
    }
  }

  private displayUpdateResult(options: WhitelistUpdateOptions): void {
    const output = options.output || 'table';

    if (output === 'json') {
      this.displayData({
        success: true,
        message: '白名单更新成功',
        oldCode: options.oldCode,
        newCode: options.code,
        channelId: options.channelId || 'global',
      }, 'json');
    } else {
      const target = options.channelId
        ? `channel ${options.channelId}`
        : 'global settings';
      this.displaySuccess(`Successfully updated whitelist item for ${target}`);
    }
  }

  private displayRemoveResult(options: WhitelistRemoveOptions): void {
    const output = options.output || 'table';

    if (output === 'json') {
      this.displayData({
        success: true,
        message: options.clear ? '白名单已清空' : '白名单删除成功',
        codes: options.codes,
        clear: options.clear || false,
        channelId: options.channelId || 'global',
      }, 'json');
    } else {
      const target = options.channelId
        ? `channel ${options.channelId}`
        : 'global settings';

      if (options.clear) {
        this.displaySuccess(`Successfully cleared all whitelist items for ${target}`);
      } else {
        const codeCount = options.codes ? options.codes.split(',').length : 0;
        const itemText = codeCount === 1 ? 'item' : 'items';
        this.displaySuccess(`Successfully removed ${codeCount} whitelist ${itemText} for ${target}`);
      }
    }
  }
}
