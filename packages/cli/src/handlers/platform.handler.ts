/**
 * @fileoverview Platform command handler for CLI operations
 * @author Development Team
 * @since 13.1.0
 */

import { BaseHandler, OutputFormat } from './base.handler';
import { AuthConfig } from '../types/auth';
import { PolyVValidationError } from '../utils/errors';
import { confirmDeletion } from '../utils/confirmation';
import {
  PlatformServiceSdk,
  GlobalChannelSettingsResponse,
  GlobalChannelSettingsUpdateParams,
} from '../services/platform-service';
import type { CallbackSettings, SwitchGetResponse } from 'polyv-live-api-sdk';
import {
  PlatformGetOptions,
  PlatformSwitchGetOptions,
  PlatformSwitchUpdateOptions,
  PlatformCallbackGetOptions,
  PlatformCallbackUpdateOptions,
  PlatformServiceConfig,
  VALID_SWITCH_PARAMS,
  PlatformSettingGetOptions,
  PlatformSettingUpdateOptions,
  PlatformAnchorCreateOptions,
  PlatformAnchorGetOptions,
  PlatformAnchorRelationOptions,
  PlatformAnchorUpdateOptions,
  PlatformAnchorUpdateStatusOptions,
  PlatformContentGroupListOptions,
  PlatformCouponStatusBatchOptions,
  PlatformCouponUpdateOptions,
  PlatformCouponViewerListOptions,
  PlatformListAnchorsOptions,
} from '../types/platform';

export type {
  PlatformGetOptions,
  PlatformSwitchGetOptions,
  PlatformSwitchUpdateOptions,
  PlatformCallbackGetOptions,
  PlatformCallbackUpdateOptions,
  PlatformSettingGetOptions,
  PlatformSettingUpdateOptions,
  PlatformAnchorCreateOptions,
  PlatformAnchorGetOptions,
  PlatformAnchorRelationOptions,
  PlatformAnchorUpdateOptions,
  PlatformAnchorUpdateStatusOptions,
  PlatformContentGroupListOptions,
  PlatformCouponStatusBatchOptions,
  PlatformCouponUpdateOptions,
  PlatformCouponViewerListOptions,
  PlatformListAnchorsOptions,
};

/**
 * Handler for platform-related CLI commands
 */
export class PlatformHandler extends BaseHandler {
  private readonly platformService: PlatformServiceSdk;

  /**
   * Creates a new PlatformHandler instance
   * @param authConfig Authentication configuration
   * @param serviceConfig Service configuration
   */
  constructor(authConfig: AuthConfig, serviceConfig: PlatformServiceConfig) {
    super();
    this.platformService = new PlatformServiceSdk(authConfig, serviceConfig);
  }

  /**
   * Get account information
   * @param options Platform get options from CLI
   * @returns Promise that resolves when account info is displayed
   *
   * @throws {PolyVError} When API call fails
   */
  async getAccountInfo(options: PlatformGetOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      const format: OutputFormat = options.output || 'table';

      // Call service to get user info
      const userInfo = await this.platformService.getUserInfo();

      // Display results
      if (format === 'json') {
        this.displayData(userInfo, 'json');
      } else {
        this.displayUserInfoTable(userInfo);
      }
    }, 'platform.getAccountInfo');
  }

  /**
   * Get switch configuration
   * @param options Platform switch get options from CLI
   * @returns Promise that resolves when switch config is displayed
   *
   * @throws {PolyVError} When API call fails
   */
  async getSwitchConfig(options: PlatformSwitchGetOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      const format: OutputFormat = options.output || 'table';

      // Call service to get switch config
      const switchConfig = await this.platformService.getSwitchConfig();

      // Display results
      if (format === 'json') {
        this.displayData(switchConfig, 'json');
      } else {
        this.displaySwitchConfigTable(switchConfig);
      }
    }, 'platform.getSwitchConfig');
  }

  /**
   * Update switch configuration
   * @param options Platform switch update options from CLI
   * @returns Promise that resolves when switch config is updated
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async updateSwitchConfig(options: PlatformSwitchUpdateOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      const format: OutputFormat = options.output || 'table';

      // Validate options
      this.validateUpdateOptions(options);

      // Call service to update switch config
      const result = await this.platformService.updateSwitchConfig({
        param: options.param,
        enabled: options.enabled,
      });

      // Display results
      if (format === 'json') {
        this.displayData({ success: result.success, param: options.param, enabled: options.enabled }, 'json');
      } else {
        this.displaySuccess(`Successfully updated switch config: ${options.param} = ${options.enabled}`);
      }
    }, 'platform.updateSwitchConfig');
  }

  /**
   * Get callback settings
   * @param options Platform callback get options from CLI
   * @returns Promise that resolves when callback settings is displayed
   *
   * @throws {PolyVError} When API call fails
   */
  async getCallbackSettings(options: PlatformCallbackGetOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      const format: OutputFormat = options.output || 'table';

      // Call service to get callback settings
      const callbackSettings = await this.platformService.getCallbackSettings();

      // Display results
      if (format === 'json') {
        this.displayData(callbackSettings, 'json');
      } else {
        this.displayCallbackSettingsTable(callbackSettings);
      }
    }, 'platform.getCallbackSettings');
  }

  /**
   * Update callback settings
   * @param options Platform callback update options from CLI
   * @returns Promise that resolves when callback settings is updated
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async updateCallbackSettings(options: PlatformCallbackUpdateOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      const format: OutputFormat = options.output || 'table';

      // Validate options
      this.validateCallbackOptions(options);

      // Convert enabled from Y/N to boolean
      const enabledBoolean = options.enabled !== undefined ? options.enabled === 'Y' : undefined;

      // Call service to update callback settings
      const updateParams: { url?: string; enabled?: boolean } = {};
      if (options.url !== undefined) {
        updateParams.url = options.url;
      }
      if (enabledBoolean !== undefined) {
        updateParams.enabled = enabledBoolean;
      }
      await this.platformService.updateCallbackSettings(updateParams);

      // Display results
      if (format === 'json') {
        this.displayData({ success: true, url: options.url, enabled: options.enabled }, 'json');
      } else {
        this.displaySuccess(`Successfully updated callback settings.`);
        if (options.url) {
          this.displayInfo(`Callback URL: ${options.url}`);
        }
        if (options.enabled) {
          this.displayInfo(`Enabled: ${options.enabled === 'Y' ? 'Yes' : 'No'}`);
        }
      }
    }, 'platform.updateCallbackSettings');
  }

  // ========================================
  // Story 13-3: Global Settings Methods
  // ========================================

  /**
   * Get global settings
   * @param options Platform setting get options from CLI
   * @returns Promise that resolves when global settings is displayed
   *
   * @throws {PolyVError} When API call fails
   */
  async getGlobalSettings(options: PlatformSettingGetOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      const format: OutputFormat = options.output || 'table';

      // Call service to get global channel settings
      const globalSettings = await this.platformService.getGlobalChannelSettings();

      // Display results
      if (format === 'json') {
        this.displayData(globalSettings, 'json');
      } else {
        this.displayGlobalSettingsTable(globalSettings);
      }
    }, 'platform.getGlobalSettings');
  }

  /**
   * Update global settings
   * @param options Platform setting update options from CLI
   * @returns Promise that resolves when global settings is updated
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async updateGlobalSettings(options: PlatformSettingUpdateOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      const format: OutputFormat = options.output || 'table';

      // Validate options
      this.validateGlobalSettingsOptions(options);

      // Build update params - only include defined values
      const updateParams: {
        channelConcurrencesEnabled?: string;
        timelyConvertEnabled?: string;
        donateEnabled?: string;
        rebirthAutoUploadEnabled?: string;
        rebirthAutoConvertEnabled?: string;
        pptCoveredEnabled?: string;
        coverImgType?: string;
        testModeButtonEnabled?: string;
      } = {};

      if (options.channelConcurrencesEnabled !== undefined) {
        updateParams.channelConcurrencesEnabled = options.channelConcurrencesEnabled;
      }
      if (options.timelyConvertEnabled !== undefined) {
        updateParams.timelyConvertEnabled = options.timelyConvertEnabled;
      }
      if (options.donateEnabled !== undefined) {
        updateParams.donateEnabled = options.donateEnabled;
      }
      if (options.rebirthAutoUploadEnabled !== undefined) {
        updateParams.rebirthAutoUploadEnabled = options.rebirthAutoUploadEnabled;
      }
      if (options.rebirthAutoConvertEnabled !== undefined) {
        updateParams.rebirthAutoConvertEnabled = options.rebirthAutoConvertEnabled;
      }
      if (options.pptCoveredEnabled !== undefined) {
        updateParams.pptCoveredEnabled = options.pptCoveredEnabled;
      }
      if (options.coverImgType !== undefined) {
        updateParams.coverImgType = options.coverImgType;
      }
      if (options.testModeButtonEnabled !== undefined) {
        updateParams.testModeButtonEnabled = options.testModeButtonEnabled;
      }

      // Call service to update global settings
      await this.platformService.updateGlobalChannelSettings(updateParams as GlobalChannelSettingsUpdateParams);

      // Display results
      if (format === 'json') {
        this.displayData({ success: true, ...updateParams }, 'json');
      } else {
        this.displaySuccess('Successfully updated global settings.');
        this.displayUpdatedGlobalSettingsTable(updateParams as GlobalChannelSettingsUpdateParams);
      }
    }, 'platform.updateGlobalSettings');
  }

  async listAnchors(options: PlatformListAnchorsOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      const result = await this.platformService.listAnchors(this.compact({
        pageNumber: options.pageNumber,
        pageSize: options.pageSize,
        status: options.status,
        sex: options.sex,
        nickname: options.nickname,
        startTime: options.startTime,
        endTime: options.endTime,
      }) as any);
      this.displayData(result, options.output || 'table');
    }, 'platform.listAnchors');
  }

  async getAnchor(options: PlatformAnchorGetOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validatePositiveNumber(options.anchorId, 'anchorId');
      const result = await this.platformService.getAnchor(options.anchorId);
      this.displayData(result, options.output || 'table');
    }, 'platform.getAnchor');
  }

  async createAnchor(options: PlatformAnchorCreateOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateAnchorCreateOptions(options);
      await this.confirmWrite(options.force, `Create anchor "${options.nickname}"?`);
      const result = await this.platformService.createAnchor(this.compact({
        nickname: options.nickname,
        sex: options.sex,
        avatar: options.avatar,
        description: options.description,
        addChannelIds: options.addChannelIds,
      }) as any);
      this.displayData(result, options.output || 'table');
    }, 'platform.createAnchor');
  }

  async updateAnchor(options: PlatformAnchorUpdateOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validatePositiveNumber(options.anchorId, 'anchorId');
      if (
        options.nickname === undefined &&
        options.sex === undefined &&
        options.avatar === undefined &&
        options.description === undefined &&
        options.addChannelIds === undefined &&
        options.delChannelIds === undefined
      ) {
        throw this.validationError('At least one update option is required', 'options', options);
      }
      await this.confirmWrite(options.force, `Update anchor ${options.anchorId}?`);
      await this.platformService.updateAnchor(this.compact({
        anchorId: options.anchorId,
        nickname: options.nickname,
        sex: options.sex,
        avatar: options.avatar,
        description: options.description,
        addChannelIds: options.addChannelIds,
        delChannelIds: options.delChannelIds,
      }) as any);
      this.displayData({ success: true, anchorId: options.anchorId }, options.output || 'table');
    }, 'platform.updateAnchor');
  }

  async updateAnchorStatus(options: PlatformAnchorUpdateStatusOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validatePositiveNumber(options.anchorId, 'anchorId');
      if (options.status !== 0 && options.status !== 1) {
        throw this.validationError('status must be 0 or 1', 'status', options.status);
      }
      await this.confirmWrite(options.force, `Update anchor ${options.anchorId} status?`);
      await this.platformService.updateAnchorStatus({
        anchorId: options.anchorId,
        status: options.status,
      });
      this.displayData({ success: true, anchorId: options.anchorId, status: options.status }, options.output || 'table');
    }, 'platform.updateAnchorStatus');
  }

  async listAnchorRelations(options: PlatformAnchorRelationOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validatePositiveNumber(options.anchorId, 'anchorId');
      const result = await this.platformService.listAnchorRelations(this.compact({
        anchorId: options.anchorId,
        pageNumber: options.pageNumber,
        pageSize: options.pageSize,
      }) as any);
      this.displayData(result, options.output || 'table');
    }, 'platform.listAnchorRelations');
  }

  async listAnchorUnrelations(options: PlatformAnchorRelationOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validatePositiveNumber(options.anchorId, 'anchorId');
      const result = await this.platformService.listAnchorUnrelations(this.compact({
        anchorId: options.anchorId,
        pageNumber: options.pageNumber,
        pageSize: options.pageSize,
      }) as any);
      this.displayData(result, options.output || 'table');
    }, 'platform.listAnchorUnrelations');
  }

  async listContentGroups(options: PlatformContentGroupListOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      const result = await this.platformService.listContentGroups(options.type);
      this.displayData(result, options.output || 'table');
    }, 'platform.listContentGroups');
  }

  async listCouponViewers(options: PlatformCouponViewerListOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredString(options.couponId, 'couponId');
      const result = await this.platformService.searchCouponViewers(this.compact({
        couponId: options.couponId,
        pageNumber: options.pageNumber,
        pageSize: options.pageSize,
        keyword: options.keyword,
        receiveSource: options.receiveSource,
      }) as any);
      this.displayData(result, options.output || 'table');
    }, 'platform.listCouponViewers');
  }

  async updateCoupon(options: PlatformCouponUpdateOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredString(options.couponId, 'couponId');
      const config = options.config || {};
      if (Object.keys(config).length === 0) {
        throw this.validationError('At least one coupon update field is required', 'config', config);
      }
      await this.confirmWrite(options.force, `Update coupon ${options.couponId}?`);
      await this.platformService.updateCoupon({
        couponId: options.couponId,
        ...config,
      } as any);
      this.displayData({ success: true, couponId: options.couponId }, options.output || 'table');
    }, 'platform.updateCoupon');
  }

  async updateCouponsStatusBatch(options: PlatformCouponStatusBatchOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      if (!options.couponIds || options.couponIds.length === 0) {
        throw this.validationError('couponIds is required', 'couponIds', options.couponIds);
      }
      await this.confirmWrite(options.force, `Update status for ${options.couponIds.length} coupon(s)?`);
      await this.platformService.updateCouponsStatusBatch({
        couponIds: options.couponIds,
      });
      this.displayData({ success: true, couponIds: options.couponIds }, options.output || 'table');
    }, 'platform.updateCouponsStatusBatch');
  }

  /**
   * Displays global settings as a table
   * @param settings Global settings to display
   */
  private displayGlobalSettingsTable(settings: GlobalChannelSettingsResponse): void {
    const fieldNames: Record<string, string> = {
      channelConcurrencesEnabled: '最大并发人数开关',
      timelyConvertEnabled: '自动转码开关',
      donateEnabled: '打赏开关',
      rebirthAutoUploadEnabled: '复活自动上传PPT',
      rebirthAutoConvertEnabled: '复活自动转码',
      pptCoveredEnabled: 'PPT全屏开关',
      coverImgType: '封面图类型',
      testModeButtonEnabled: '测试模式按钮',
    };

    const rows = Object.entries(settings)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => {
        const displayName = fieldNames[key] || key;
        let displayValue = value;
        // Convert Y/N to Enabled/Disabled for boolean fields
        if (key !== 'coverImgType' && (value === 'Y' || value === 'N')) {
          displayValue = value === 'Y' ? '开启' : '禁用';
        }
        return [displayName, String(displayValue)];
      });

    this.displayAsTable(rows.map(([displayName, displayValue]) => ({
      '设置项': displayName,
      '值': displayValue
    })));
  }

  /**
   * Displays updated global settings as a table
   * @param settings Updated settings to display
   */
  private displayUpdatedGlobalSettingsTable(settings: GlobalChannelSettingsUpdateParams): void {
    const fieldNames: Record<string, string> = {
      channelConcurrencesEnabled: '最大并发人数开关',
      timelyConvertEnabled: '自动转码开关',
      donateEnabled: '打赏开关',
      rebirthAutoUploadEnabled: '复活自动上传PPT',
      rebirthAutoConvertEnabled: '复活自动转码',
      pptCoveredEnabled: 'PPT全屏开关',
      coverImgType: '封面图类型',
      testModeButtonEnabled: '测试模式按钮',
    };

    const rows = Object.entries(settings)
      .filter(([key]) => key !== 'output')
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => {
        const displayName = fieldNames[key] || key;
        let displayValue = value;
        // Convert Y/N to Enabled/Disabled for boolean fields
        if (key !== 'coverImgType' && (value === 'Y' || value === 'N')) {
          displayValue = value === 'Y' ? '开启' : '禁用';
        }
        return [displayName, String(displayValue)];
      });

    this.displayAsTable(rows.map(([displayName, displayValue]) => ({
      '设置项': displayName,
      '新值': displayValue
    })));
  }

  // ========================================
  // Private Validation Methods
  // ========================================

  /**
   * Validates update options from CLI
   * @param options Options to validate
   * @throws {PolyVValidationError} When validation fails
   */
  private validateUpdateOptions(options: PlatformSwitchUpdateOptions): void {
    const errors: string[] = [];

    // Validate param
    if (!options.param || typeof options.param !== 'string' || options.param.trim().length === 0) {
      errors.push('param (配置项名称) 是必需的');
    } else if (!VALID_SWITCH_PARAMS.includes(options.param as any)) {
      errors.push(`不支持的配置项: ${options.param}。可用配置项: ${VALID_SWITCH_PARAMS.join(', ')}`);
    }

    // Validate enabled
    if (!options.enabled || typeof options.enabled !== 'string') {
      errors.push('enabled 必须是 Y 或 N');
    } else if (options.enabled !== 'Y' && options.enabled !== 'N') {
      errors.push('enabled 必须是 Y 或 N');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        errors.join('; '),
        'options',
        options,
        'validation_failed'
      );
    }
  }

  /**
   * Validates callback options from CLI
   * @param options Options to validate
   * @throws {PolyVValidationError} When validation fails
   */
  private validateCallbackOptions(options: PlatformCallbackUpdateOptions): void {
    const errors: string[] = [];

    // At least one parameter must be provided
    if (!options.url && !options.enabled) {
      errors.push('至少需要提供一个参数 (url 或 enabled)');
    }

    // Validate URL format if provided
    if (options.url !== undefined && options.url !== '') {
      if (!options.url.startsWith('http://') && !options.url.startsWith('https://')) {
        errors.push('url 必须以 http:// 或 https:// 开头');
      }
    }

    // Validate enabled value if provided
    if (options.enabled !== undefined) {
      if (options.enabled !== 'Y' && options.enabled !== 'N') {
        errors.push('enabled 必须是 Y 或 N');
      }
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        errors.join('; '),
        'options',
        options,
        'validation_failed'
      );
    }
  }

  // ========================================
  // Private Display Methods
  // ========================================

  /**
   * Displays user info as a formatted table
   * @param userInfo User info data
   */
  private displayUserInfoTable(userInfo: {
    userId: string;
    email: string;
    maxChannels: number;
    totalChannels: number;
    availableChannels: number;
    linkMicLimit: number;
    watchDomain?: string;
  }): void {
    const tableData = {
      '用户 ID': userInfo.userId,
      '邮箱': userInfo.email,
      '最大频道数': userInfo.maxChannels,
      '总频道数': userInfo.totalChannels,
      '可用频道数': userInfo.availableChannels,
      '连麦限制': userInfo.linkMicLimit,
      '观看域名': userInfo.watchDomain || '-',
    };

    this.displayAsTable(tableData);
  }

  /**
   * Displays switch config as a formatted table
   * @param config Switch config data
   */
  private displaySwitchConfigTable(config: SwitchGetResponse | {
    config?: Record<string, boolean | string>;
  }): void {
    const configItems = Array.isArray(config)
      ? config
      : Object.entries(config.config || {}).map(([type, enabled]) => ({ type, enabled }));

    const tableData = configItems.map(item => ({
      '开关名称': item.type,
      '状态': String(item.enabled).toUpperCase() === 'Y' ? 'enabled' : 'disabled',
    }));

    this.displayAsTable(tableData);
  }

  /**
   * Displays callback settings as a formatted table
   * @param settings Callback settings data
   */
  private displayCallbackSettingsTable(settings: CallbackSettings): void {
    const tableData = Object.entries(settings)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => ({
        '设置项': key,
        '值': String(value),
      }));

    this.displayAsTable(tableData);
  }

  /**
   * Validates global settings update options from CLI
   * @param options Options to validate
   * @throws {PolyVValidationError} When validation fails
   */
  private validateGlobalSettingsOptions(options: PlatformSettingUpdateOptions): void {
    const errors: string[] = [];

    // At least one parameter must be provided
    if (
      options.channelConcurrencesEnabled === undefined &&
      options.timelyConvertEnabled === undefined &&
      options.donateEnabled === undefined &&
      options.rebirthAutoUploadEnabled === undefined &&
      options.rebirthAutoConvertEnabled === undefined &&
      options.pptCoveredEnabled === undefined &&
      options.coverImgType === undefined &&
      options.testModeButtonEnabled === undefined
    ) {
      errors.push('至少需要提供一个参数 (At least one parameter is required)');
    }

    // Validate Y/N values for boolean fields
    const booleanFields = [
      'channelConcurrencesEnabled',
      'timelyConvertEnabled',
      'donateEnabled',
      'rebirthAutoUploadEnabled',
      'rebirthAutoConvertEnabled',
      'pptCoveredEnabled',
      'testModeButtonEnabled',
    ] as const;

    for (const field of booleanFields) {
      const value = (options as any)[field];
      if (value !== undefined) {
        if (value !== 'Y' && value !== 'N') {
          errors.push(`${field} 必须是 Y 或 N`);
        }
      }
    }

    // Validate coverImgType
    if (options.coverImgType !== undefined) {
      if (options.coverImgType !== 'contain' && options.coverImgType !== 'cover') {
        errors.push('coverImgType 必须是 contain 或 cover');
      }
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        errors.join('; '),
        'options',
        options,
        'validation_failed'
      );
    }
  }

  private validatePositiveNumber(value: number | undefined, field: string): void {
    if (!Number.isFinite(value) || Number(value) <= 0) {
      throw this.validationError(`${field} must be a positive number`, field, value);
    }
  }

  private validateRequiredString(value: string | undefined, field: string): void {
    if (!value || value.trim().length === 0) {
      throw this.validationError(`${field} is required`, field, value);
    }
  }

  private validateAnchorCreateOptions(options: PlatformAnchorCreateOptions): void {
    this.validateRequiredString(options.nickname, 'nickname');
    this.validateRequiredString(options.avatar, 'avatar');
    if (options.sex !== 'M' && options.sex !== 'W') {
      throw this.validationError('sex must be M or W', 'sex', options.sex);
    }
  }

  private compact<T extends Record<string, unknown>>(params: T): Partial<T> {
    return Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined)
    ) as Partial<T>;
  }

  private validationError(message: string, field: string, value: unknown): PolyVValidationError {
    return new PolyVValidationError(message, field, value, 'validation_failed');
  }

  private async confirmWrite(force: boolean | undefined, message: string): Promise<void> {
    if (force) return;
    const confirmed = await confirmDeletion(message);
    if (!confirmed) {
      throw new Error('Operation cancelled.');
    }
  }
}
