/**
 * Global API service using the PolyV Live API SDK.
 */

import type { AuthConfig } from '../types/auth';
import type { GlobalServiceConfig } from '../types/global';
import { createSdkClient } from '../sdk';
import type {
  UpdateAuthParams,
  UpdatePageSettingParams,
} from 'polyv-live-api-sdk';

export class GlobalServiceSdk {
  constructor(
    private readonly authConfig: AuthConfig,
    private readonly config: GlobalServiceConfig
  ) {}

  async getAuth() {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Global.getAuth();
  }

  async updateAuth(params: UpdateAuthParams) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Global.updateAuth(params);
  }

  async getPageSetting() {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Global.getPageSetting();
  }

  async updatePageSetting(params: UpdatePageSettingParams) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Global.updatePageSetting(params);
  }
}
