/**
 * Handler for global CLI operations.
 */

import { BaseHandler, OutputFormat } from './base.handler';
import type { AuthConfig } from '../types/auth';
import type {
  GlobalAuthUpdateOptions,
  GlobalBaseOptions,
  GlobalPageSettingUpdateOptions,
  GlobalServiceConfig,
} from '../types/global';
import { PolyVValidationError } from '../utils/errors';
import { confirmDeletion } from '../utils/confirmation';
import { GlobalServiceSdk } from '../services/global-service';
import type { AuthSetting, UpdatePageSettingParams } from 'polyv-live-api-sdk';

export class GlobalHandler extends BaseHandler {
  private readonly globalService: GlobalServiceSdk;

  constructor(authConfig: AuthConfig, serviceConfig: GlobalServiceConfig) {
    super();
    this.globalService = new GlobalServiceSdk(authConfig, serviceConfig);
  }

  async getAuth(options: GlobalBaseOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      const result = await this.globalService.getAuth();
      this.displayData(result, (options.output || 'table') as OutputFormat);
    }, 'global.getAuth');
  }

  async updateAuth(options: GlobalAuthUpdateOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      if (!Array.isArray(options.authSettings) || options.authSettings.length !== 2) {
        throw this.validationError('authSettings must be a JSON array with exactly 2 items', 'authSettings', options.authSettings);
      }
      await this.confirmWrite(options.force, 'Update global auth settings?');
      await this.globalService.updateAuth({
        authSettings: options.authSettings as AuthSetting[],
      });
      this.displayData({ success: true }, (options.output || 'table') as OutputFormat);
    }, 'global.updateAuth');
  }

  async getPageSetting(options: GlobalBaseOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      const result = await this.globalService.getPageSetting();
      this.displayData(result, (options.output || 'table') as OutputFormat);
    }, 'global.getPageSetting');
  }

  async updatePageSetting(options: GlobalPageSettingUpdateOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      if (!options.config || Object.keys(options.config).length === 0) {
        throw this.validationError('config must not be empty', 'config', options.config);
      }
      await this.confirmWrite(options.force, 'Update global page settings?');
      await this.globalService.updatePageSetting(options.config as UpdatePageSettingParams);
      this.displayData({ success: true, ...options.config }, (options.output || 'table') as OutputFormat);
    }, 'global.updatePageSetting');
  }

  private async confirmWrite(force: boolean | undefined, message: string): Promise<void> {
    if (force) return;
    const confirmed = await confirmDeletion(message);
    if (!confirmed) {
      throw new Error('Operation cancelled.');
    }
  }

  private validationError(message: string, field: string, value: unknown): PolyVValidationError {
    return new PolyVValidationError(message, field, value, 'validation_failed');
  }
}
