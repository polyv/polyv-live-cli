import type { AuthConfig } from '../types/auth';
import type { ApiServiceConfig } from '../utils/api-command';
import { createSdkClient } from '../sdk';

export class PartnerServiceSdk {
  constructor(
    private readonly authConfig: AuthConfig,
    private readonly config: ApiServiceConfig
  ) {}

  async registerUser(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.other.registerUser(params);
  }

  async createTencentOrder(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.other.createTencentOrder(params);
  }
}
