import type { AuthConfig } from '../types/auth';
import type { ApiServiceConfig } from '../utils/api-command';
import { createSdkClient } from '../sdk';

export class MonitorServiceSdk {
  constructor(
    private readonly authConfig: AuthConfig,
    private readonly config: ApiServiceConfig
  ) {}

  async listTencentStreamInfo(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.other.listTencentStreamInfo(params);
  }

  async listMonitorStreamInfo(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Channel.listMonitorStreamInfo(params);
  }
}
