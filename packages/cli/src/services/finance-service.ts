import type { AuthConfig } from '../types/auth';
import type { ApiServiceConfig } from '../utils/api-command';
import { createSdkClient } from '../sdk';

export class FinanceServiceSdk {
  constructor(
    private readonly authConfig: AuthConfig,
    private readonly config: ApiServiceConfig
  ) {}

  async getAudioModerationSettings(channelId: string | number) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.finance.getAudioModerationSettings(channelId);
  }

  async listAudioModerationRecords(channelId: string | number, params: any = {}) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.finance.listAudioModerationRecords(channelId, params);
  }

  async updateAudioModerationSettings(channelId: string | number, params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.finance.updateAudioModerationSettings(channelId, params);
  }

  async getVideoModerationSettings(channelId: string | number) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.finance.getVideoModerationSettings(channelId);
  }

  async updateVideoModerationSettings(channelId: string | number, params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.finance.updateVideoModerationSettings(channelId, params);
  }

  async listVideoModerationResults(channelId: string | number, params: any = {}) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.finance.listVideoModerationResults(channelId, params);
  }

  async listBillDetails(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.finance.listBillDetails(params);
  }
}
