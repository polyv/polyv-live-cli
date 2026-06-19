import type { AuthConfig } from '../types/auth';
import type { ApiServiceConfig } from '../utils/api-command';
import { createSdkClient } from '../sdk';

export class WebAppServiceSdk {
  constructor(
    private readonly authConfig: AuthConfig,
    private readonly config: ApiServiceConfig
  ) {}

  async listPermissions() {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4WebApp.listPermissions();
  }

  async createRole(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4WebApp.createRole(params);
  }

  async getRole(roleId: number) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4WebApp.getRole(roleId);
  }

  async listRoles(params: any = {}) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4WebApp.listRoles(params);
  }

  async updateRole(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4WebApp.updateRole(params);
  }

  async deleteRole(roleId: number) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4WebApp.deleteRole(roleId);
  }
}
