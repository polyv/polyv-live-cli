/**
 * @fileoverview Handler for watch condition CLI commands
 * @author Development Team
 * @since 12.3.0
 */

import { existsSync, readFileSync } from 'fs';
import { BaseHandler } from './base.handler';
import { WatchConditionServiceSdk } from '../services/watch-condition-service';
import {
  WatchConditionServiceConfig,
  WatchConditionGetOptions,
  WatchConditionSetOptions,
  WatchConditionConfig,
  VALID_AUTH_TYPES,
  AUTH_TYPE_LABELS,
} from '../types/watch-condition';
import { AuthConfig } from '../types/auth';
import { PolyVValidationError } from '../utils/errors';
import type { WebAuthSetting, AuthType } from 'polyv-live-api-sdk';

type AuthSetting = WebAuthSetting;

/**
 * Handler for watch condition CLI commands
 */
export class WatchConditionHandler extends BaseHandler {
  private readonly watchConditionService: WatchConditionServiceSdk;

  /**
   * Creates a new WatchConditionHandler instance
   * @param authConfig Authentication configuration
   * @param serviceConfig Watch condition service configuration
   */
  constructor(authConfig: AuthConfig, serviceConfig: WatchConditionServiceConfig) {
    super();
    this.watchConditionService = new WatchConditionServiceSdk(authConfig, serviceConfig);
  }

  // ========================================
  // watch-condition get (AC #1)
  // ========================================

  /**
   * Get watch condition settings
   * @param options Get options from CLI
   * @returns Promise that resolves when results are displayed
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async getWatchCondition(options: WatchConditionGetOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate input options
      this.validateGetOptions(options);

      // Build params
      const params: { channelId?: string } = {};
      if (options.channelId) {
        params.channelId = options.channelId;
      }

      // Call SDK service
      const result = await this.watchConditionService.getWatchCondition(params);

      // Display results
      this.displayGetResult(result, options);

    }, 'watch-condition.get');
  }

  // ========================================
  // watch-condition set (AC #2)
  // ========================================

  /**
   * Set watch condition settings
   * @param options Set options from CLI
   * @returns Promise that resolves when results are displayed
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async setWatchCondition(options: WatchConditionSetOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate and build auth settings
      const authSettings = this.validateAndBuildAuthSettings(options);

      // Build params
      const params: { channelId?: string; authSettings: any[] } = {
        authSettings,
      };
      if (options.channelId) {
        params.channelId = options.channelId;
      }

      // Call SDK service
      await this.watchConditionService.setWatchCondition(params);

      // Display result
      this.displaySetResult(options);

    }, 'watch-condition.set');
  }

  // ===== Private Validation Methods =====

  private validateGetOptions(options: WatchConditionGetOptions): void {
    const errors: string[] = [];

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

  private validateAndBuildAuthSettings(options: WatchConditionSetOptions): any[] {
    // If config file is provided, load from file
    if (options.configFile) {
      return this.loadAuthSettingsFromConfig(options.configFile);
    }

    // Otherwise, build from CLI options
    return this.buildAuthSettingsFromOptions(options);
  }

  private loadAuthSettingsFromConfig(configPath: string): any[] {
    // Check if file exists
    if (!existsSync(configPath)) {
      throw new PolyVValidationError(
        '配置文件不存在',
        'config',
        configPath,
        'file_not_found'
      );
    }

    // Read and parse JSON
    let configContent: string;
    try {
      configContent = readFileSync(configPath, 'utf8');
    } catch (error) {
      throw new PolyVValidationError(
        '无法读取配置文件',
        'config',
        configPath,
        'file_read_error'
      );
    }

    let config: WatchConditionConfig;
    try {
      config = JSON.parse(configContent);
    } catch {
      throw new PolyVValidationError(
        '配置文件 JSON 格式无效',
        'config',
        configPath,
        'invalid_json'
      );
    }

    // Validate config structure
    if (!config.authSettings || !Array.isArray(config.authSettings)) {
      throw new PolyVValidationError(
        '配置文件必须包含 authSettings 字段',
        'config',
        configPath,
        'invalid_structure'
      );
    }

    return config.authSettings;
  }

  private buildAuthSettingsFromOptions(options: WatchConditionSetOptions): any[] {
    const errors: string[] = [];

    // Validate rank
    if (options.rank !== undefined && ![1, 2].includes(options.rank)) {
      errors.push('rank 必须是 1 (主要条件) 或 2 (次要条件)');
    }

    // Validate authType
    if (options.authType !== undefined && !VALID_AUTH_TYPES.includes(options.authType)) {
      errors.push('无效的认证类型，支持的类型: none, code, pay, phone, info, custom, external, direct');
    }

    // Validate enabled
    if (options.enabled !== undefined && !['Y', 'N'].includes(options.enabled)) {
      errors.push('enabled 必须是 Y 或 N');
    }

    // Validate output
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

    // Build auth setting
    const authSetting: any = {
      rank: options.rank,
    };

    if (options.enabled !== undefined) {
      authSetting.enabled = options.enabled;
    }

    // Only add authType if it's not 'none' (none means no restriction, API doesn't accept it as authType)
    if (options.authType !== undefined && options.authType !== 'none') {
      authSetting.authType = options.authType;
    }

    // Add auth type specific fields
    if (options.authCode !== undefined) {
      authSetting.authCode = options.authCode;
    }

    if (options.price !== undefined) {
      // Convert price from yuan to cents
      authSetting.payAmount = Math.round(options.price * 100);
    }

    return [authSetting];
  }

  // ===== Private Display Methods =====

  private displayGetResult(result: any[], options: WatchConditionGetOptions): void {
    if (!result || result.length === 0) {
      this.displayInfo('未找到观看条件配置');
      return;
    }

    const output = options.output || 'table';

    if (output === 'json') {
      this.displayData(result, 'json');
    } else {
      console.log(`找到 ${result.length} 条观看条件配置`);
      const tableData = result.map((item: AuthSetting, index: number) => {
        const authType = item.authType as AuthType | undefined;
        // Use rank from item, or infer from array position (first=primary, second=secondary)
        const rank = item.rank ?? (index === 0 ? 1 : 2);
        const row: Record<string, string> = {
          '条件级别': rank === 1 ? '主要 (1)' : '次要 (2)',
          '状态': item.enabled === 'Y' ? '启用 (Y)' : '禁用 (N)',
          '认证类型': (authType && AUTH_TYPE_LABELS[authType]) || authType || '-',
        };

        // Add auth type specific details
        const details = this.getAuthTypeDetails(item);
        row['详细配置'] = details;

        return row;
      });

      if (tableData.length > 0) {
        this.displayAsTable(tableData);
      }
    }
  }

  private getAuthTypeDetails(item: any): string {
    switch (item.authType) {
      case 'code':
        return item.code ? `密码: ${item.code}` : '-';
      case 'pay':
        return item.payAmount ? `价格: ${(item.payAmount / 100).toFixed(2)} 元` : '-';
      case 'external':
        return item.externalUri ? `链接: ${this.truncate(item.externalUri, 30)}` : '-';
      case 'custom':
        return item.customUri ? `链接: ${this.truncate(item.customUri, 30)}` : '-';
      case 'info':
        return item.infoFields ? `字段数: ${item.infoFields.length}` : '-';
      case 'direct':
        return item.directKey ? `Key: ${this.truncate(item.directKey, 20)}` : '-';
      default:
        return '-';
    }
  }

  private displaySetResult(options: WatchConditionSetOptions): void {
    const output = options.output || 'table';

    if (output === 'json') {
      this.displayData({
        success: true,
        channelId: options.channelId || 'global',
      }, 'json');
    } else {
      const target = options.channelId
        ? `channel ${options.channelId}`
        : 'global settings';
      this.displaySuccess(`Successfully updated watch condition for ${target}`);
    }
  }

  // ===== Private Helper Methods =====

  private truncate(str: string, maxLength: number): string {
    if (!str) return '-';
    return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
  }
}
