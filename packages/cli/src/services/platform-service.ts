/**
 * @fileoverview Platform service using PolyV Live API SDK
 * @author Development Team
 * @since 13.1.0
 */

import { AuthConfig } from '../types/auth';
import { PlatformServiceConfig, VALID_SWITCH_PARAMS, EnabledValue } from '../types/platform';
import { createSdkClient } from '../sdk';
import { PolyVValidationError } from '../utils/errors';
import {
  GetUserInfoResponse,
  SwitchGetResponse,
  SwitchUpdateResponse,
  CallbackSettings,
  UpdateCallbackParams,
} from 'polyv-live-api-sdk';

/**
 * Platform service for managing PolyV account information using SDK
 */
export class PlatformServiceSdk {
  private readonly config: PlatformServiceConfig;
  private readonly authConfig: AuthConfig;

  /**
   * Creates a new PlatformServiceSdk instance
   * @param authConfig Authentication configuration
   * @param serviceConfig Service configuration
   */
  constructor(authConfig: AuthConfig, serviceConfig: PlatformServiceConfig) {
    this.authConfig = authConfig;
    this.config = serviceConfig;
  }

  /**
   * Get user account information
   * @returns Promise resolving to user info response
   *
   * @throws {PolyVError} When API call fails
   */
  async getUserInfo(): Promise<GetUserInfoResponse> {
    // Create SDK client
    const client = createSdkClient(this.authConfig, this.config.baseUrl);

    // Call SDK
    const result = await client.account.getUserInfo();

    return result;
  }

  /**
   * Get switch configuration
   * @returns Promise resolving to switch config response
   *
   * @throws {PolyVError} When API call fails
   */
  async getSwitchConfig(): Promise<SwitchGetResponse> {
    // Create SDK client
    const client = createSdkClient(this.authConfig, this.config.baseUrl);

    // Call SDK
    const result = await client.account.switchGet();

    return result;
  }

  /**
   * Update switch configuration
   * @param params Update parameters
   * @returns Promise resolving to update response
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async updateSwitchConfig(params: {
    param: string;
    enabled: EnabledValue;
  }): Promise<SwitchUpdateResponse> {
    // Validate parameters
    this.validateUpdateParams(params);

    // Create SDK client
    const client = createSdkClient(this.authConfig, this.config.baseUrl);

    // Call SDK
    const result = await client.account.switchUpdate({
      param: params.param,
      enabled: params.enabled,
    });

    return result;
  }

  /**
   * Validates update parameters
   * @param params Parameters to validate
   * @throws {PolyVValidationError} When validation fails
   */
  private validateUpdateParams(params: { param: string; enabled: EnabledValue }): void {
    const errors: string[] = [];

    // Validate param is not empty
    if (!params.param || typeof params.param !== 'string' || params.param.trim().length === 0) {
      errors.push('param (配置项名称) 是必需的');
    } else if (!VALID_SWITCH_PARAMS.includes(params.param as any)) {
      errors.push(`不支持的配置项: ${params.param}。可用配置项: ${VALID_SWITCH_PARAMS.join(', ')}`);
    }

    // Validate enabled value
    if (!params.enabled || typeof params.enabled !== 'string') {
      errors.push('enabled 必须是 Y 或 N');
    } else if (params.enabled !== 'Y' && params.enabled !== 'N') {
      errors.push('enabled 必须是 Y 或 N');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        errors.join('; '),
        'params',
        params,
        'validation_failed'
      );
    }
  }

  /**
   * Get callback settings
   * @returns Promise resolving to callback settings response
   *
   * @throws {PolyVError} When API call fails
   */
  async getCallbackSettings(): Promise<CallbackSettings> {
    // Create SDK client
    const client = createSdkClient(this.authConfig, this.config.baseUrl);

    // Call SDK
    const result = await client.v4User.getCallback();

    return result;
  }

  /**
   * Update callback settings
   * @param params Update parameters
   * @returns Promise resolving to void
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async updateCallbackSettings(params: {
    url?: string;
    enabled?: boolean;
  }): Promise<{ success: boolean }> {
    // Validate parameters
    this.validateCallbackParams(params);

    // Create SDK client
    const client = createSdkClient(this.authConfig, this.config.baseUrl);

    // Build update params - only include defined values
    const updateParams: UpdateCallbackParams = {};
    if (params.url !== undefined) {
      updateParams.streamCallbackUrl = params.url;
    }

    // Call SDK
    await client.v4User.updateCallback(updateParams);

    return { success: true };
  }

  /**
   * Validates callback parameters
   * @param params Parameters to validate
   * @throws {PolyVValidationError} When validation fails
   */
  private validateCallbackParams(params: { url?: string; enabled?: boolean }): void {
    const errors: string[] = [];

    // At least one parameter must be provided
    if (params.url === undefined && params.enabled === undefined) {
      errors.push('至少需要提供一个参数 (url 或 enabled)');
    }

    // Validate URL format if provided
    if (params.url !== undefined && params.url !== '') {
      if (!params.url.startsWith('http://') && !params.url.startsWith('https://')) {
        errors.push('url 必须以 http:// 或 https:// 开头');
      }
    }

    // Validate enabled value if provided (should be boolean)
    if (params.enabled !== undefined && typeof params.enabled !== 'boolean') {
      errors.push('enabled 必须是布尔值');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        errors.join('; '),
        'params',
        params,
        'validation_failed'
      );
    }
  }

  // ========================================
  // Story 13-3: Global Channel Settings
  // ========================================

  /**
   * Get global channel settings
   * @returns Promise resolving to global settings response
   *
   * @throws {PolyVError} When API call fails
   */
  async getGlobalChannelSettings(): Promise<GlobalChannelSettingsResponse> {
    // Create SDK client
    const client = createSdkClient(this.authConfig, this.config.baseUrl);

    // Call SDK
    const result = await client.v4User.getGlobalChannelSettings();

    return result;
  }

  /**
   * Update global channel settings
   * @param params Update parameters
   * @returns Promise resolving to void
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async updateGlobalChannelSettings(params: GlobalChannelSettingsUpdateParams): Promise<void> {
    // Validate parameters
    this.validateGlobalSettingsParams(params);

    // Create SDK client
    const client = createSdkClient(this.authConfig, this.config.baseUrl);

    // Build update params - only include defined values
    const updateParams: Record<string, unknown> = {};
    const booleanFields = [
      'channelConcurrencesEnabled',
      'timelyConvertEnabled',
      'donateEnabled',
      'rebirthAutoUploadEnabled',
      'rebirthAutoConvertEnabled',
      'pptCoveredEnabled',
      'testModeButtonEnabled',
    ];

    for (const field of booleanFields) {
      if ((params as Record<string, unknown>)[field] !== undefined) {
        updateParams[field] = (params as Record<string, unknown>)[field];
      }
    }

    if (params.coverImgType !== undefined) {
      updateParams.coverImgType = params.coverImgType;
    }

    // Call SDK
    await client.v4User.updateGlobalChannelSettings(updateParams);
  }

  /**
   * Validates global settings parameters
   * @param params Parameters to validate
   * @throws {PolyVValidationError} When validation fails
   */
  private validateGlobalSettingsParams(params: GlobalChannelSettingsUpdateParams): void {
    const errors: string[] = [];

    // At least one parameter must be provided
    const booleanFields = [
      'channelConcurrencesEnabled',
      'timelyConvertEnabled',
      'donateEnabled',
      'rebirthAutoUploadEnabled',
      'rebirthAutoConvertEnabled',
      'pptCoveredEnabled',
      'testModeButtonEnabled',
    ];

    const hasAnyField = booleanFields.some(
      (field) => (params as Record<string, unknown>)[field] !== undefined
    ) || params.coverImgType !== undefined;

    if (!hasAnyField) {
      errors.push('至少需要提供一个参数');
    }

    // Validate Y/N values for boolean fields
    for (const field of booleanFields) {
      const value = (params as Record<string, unknown>)[field];
      if (value !== undefined && value !== 'Y' && value !== 'N') {
        errors.push(`${field} 必须是 Y 或 N`);
      }
    }

    // Validate coverImgType
    if (params.coverImgType !== undefined) {
      if (params.coverImgType !== 'contain' && params.coverImgType !== 'cover') {
        errors.push('coverImgType 必须是 contain 或 cover');
      }
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        errors.join('; '),
        'params',
        params,
        'validation_failed'
      );
    }
  }
}

/**
 * Global channel settings response type
 */
export interface GlobalChannelSettingsResponse {
  channelConcurrencesEnabled?: string;
  timelyConvertEnabled?: string;
  donateEnabled?: string;
  rebirthAutoUploadEnabled?: string;
  rebirthAutoConvertEnabled?: string;
  pptCoveredEnabled?: string;
  coverImgType?: string;
  testModeButtonEnabled?: string;
}

/**
 * Global channel settings update parameters
 */
export interface GlobalChannelSettingsUpdateParams {
  channelConcurrencesEnabled?: 'Y' | 'N';
  timelyConvertEnabled?: 'Y' | 'N';
  donateEnabled?: 'Y' | 'N';
  rebirthAutoUploadEnabled?: 'Y' | 'N';
  rebirthAutoConvertEnabled?: 'Y' | 'N';
  pptCoveredEnabled?: 'Y' | 'N';
  coverImgType?: 'contain' | 'cover';
  testModeButtonEnabled?: 'Y' | 'N';
}
