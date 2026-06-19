import type { AuthConfig } from '../types/auth';
import type { ApiServiceConfig } from '../utils/api-command';
import { createSdkClient } from '../sdk';

export class GroupServiceSdk {
  constructor(
    private readonly authConfig: AuthConfig,
    private readonly config: ApiServiceConfig
  ) {}

  async listAllocateLog(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.group.listAllocateLog(params);
  }

  async setConcurrences(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.group.setConcurrences(params);
  }

  async setFlow(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.group.setFlow(params);
  }

  async setLiveDurations(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.group.setLiveDurations(params);
  }

  async setSpace(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.group.setSpace(params);
  }

  async createGroupUser(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Group.createGroupUser(params);
  }

  async listGroupUserPackages(params: any = {}) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Group.listGroupUserPackages(params);
  }

  async updateGroupUserPackage(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Group.updateGroupUserPackage(params);
  }

  async listBillingDaily(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Group.listBillingDaily(params);
  }

  async listGroupUserBillingDaily(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Group.listGroupUserBillingDaily(params);
  }

  async listAllocationLogs(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Group.listAllocationLogs(params);
  }

  async healthCheck() {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.other.healthCheck();
  }

  async createIsolation(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.other.createIsolation(params);
  }

  async getPackageValidityList(params: any = {}) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.other.getPackageValidityList(params);
  }

  async updatePackageValidity(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.other.updatePackageValidity(params);
  }

  async resetAppSecret(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.other.resetAppSecret(params);
  }
}
