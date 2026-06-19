import type { AuthConfig } from '../types/auth';
import type { ApiServiceConfig } from '../utils/api-command';
import { createSdkClient } from '../sdk';

export class InviteSalesServiceSdk {
  constructor(
    private readonly authConfig: AuthConfig,
    private readonly config: ApiServiceConfig
  ) {}

  async listInviteSales(params: any = {}) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4User.listInviteSales(params);
  }

  async addInviteSale(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4User.addInviteSale(params);
  }

  async updateInviteSale(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4User.updateInviteSale(params);
  }

  async removeInviteSale(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4User.removeInviteSale(params);
  }

  async listFollowViewers(params: any = {}) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4User.listFollowViewers(params);
  }
}
