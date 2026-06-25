/**
 * V4 Global Service
 *
 * Service for managing PolyV V4 Global operations.
 * Provides methods for auth settings and page settings.
 *
 * @module services/v4/global
 */

import type { PolyVClient } from '../../client.js';
import { PolyVValidationError } from '../../errors/polyv-validation-error.js';
import type {
  AuthSetting,
  UpdateAuthParams,
  PageSetting,
  UpdatePageSettingParams,
} from '../../types/v4-global.js';

/**
 * V4 Global Service
 *
 * Provides methods for managing global settings including auth and page settings.
 */
export class V4GlobalService {
  private client: PolyVClient;

  constructor(client: PolyVClient) {
    this.client = client;
  }

  // ============================================
  // AC1: Auth APIs
  // ============================================

  /**
   * Get auth settings
   *
   * Get the default template watch condition settings.
   *
   * @returns Promise resolving to array of auth settings (primary and secondary)
   *
   * @example
   * ```typescript
   * const authSettings = await client.v4Global.getAuth();
   * console.log(authSettings[0].authType); // Primary auth type
   * console.log(authSettings[1].authType); // Secondary auth type
   * ```
   */
  async getAuth(): Promise<AuthSetting[]> {
    const response = await this.client.httpClient.get<AuthSetting[]>(
      '/live/v4/global/auth/get'
    );
    return response as unknown as AuthSetting[];
  }

  /**
   * Update auth settings
   *
   * Update the default template watch condition settings.
   * Must provide exactly 2 auth settings (primary and secondary).
   *
   * @param params - Update auth params containing array of auth settings
   *
   * @example
   * ```typescript
   * await client.v4Global.updateAuth({
   *   authSettings: [
   *     { authEnabled: 'Y', authType: 'code' },
   *     { authEnabled: 'N', authType: 'none' }
   *   ]
   * });
   * ```
   */
  async updateAuth(params: UpdateAuthParams): Promise<void> {
    if (!params.authSettings || params.authSettings.length !== 2) {
      throw new PolyVValidationError('authSettings must contain exactly 2 settings (primary and secondary)', 'authSettings');
    }
    await this.client.httpClient.post(
      '/live/v4/global/auth/update',
      params.authSettings
    );
  }

  // ============================================
  // AC2: Page Setting APIs
  // ============================================

  /**
   * Get page settings
   *
   * Get the watch page default template settings.
   *
   * @returns Promise resolving to page settings
   *
   * @example
   * ```typescript
   * const pageSetting = await client.v4Global.getPageSetting();
   * console.log(pageSetting.autoPlayEnabled); // 'Y' or 'N'
   * ```
   */
  async getPageSetting(): Promise<PageSetting> {
    const response = await this.client.httpClient.get<PageSetting>(
      '/live/v4/user/template/page-setting/get'
    );
    return response as unknown as PageSetting;
  }

  /**
   * Update page settings
   *
   * Update the watch page default template settings.
   * Uses query params instead of JSON body.
   *
   * @param params - Update page setting params
   *
   * @example
   * ```typescript
   * await client.v4Global.updatePageSetting({
   *   autoPlayEnabled: 'Y',
   *   barrageEnabled: 'Y',
   *   barrageSpeed: '270'
   * });
   * ```
   */
  async updatePageSetting(params: UpdatePageSettingParams): Promise<void> {
    // Business params must flow through config.params so the request signing
    // interceptor includes them in the signature. The API signs appId/timestamp
    // together with all business params, then appends them to the URL with an
    // empty body (see page_setting_update.md Java example: requestMap is signed
    // then appendUrl'd, postFormBody(url, null)). Embedding params in the URL
    // string bypasses signing and yields 签名错误.
    const queryParams: Record<string, string> = {};
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        queryParams[key] = String(value);
      }
    }

    await this.client.httpClient.post(
      '/live/v4/user/template/page-setting/update',
      undefined,
      { params: queryParams }
    );
  }
}
