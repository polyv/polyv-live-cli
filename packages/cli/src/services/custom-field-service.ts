import type { AuthConfig } from '../types/auth';
import type { ApiServiceConfig } from '../utils/api-command';
import { createSdkClient } from '../sdk';

export class CustomFieldServiceSdk {
  constructor(
    private readonly authConfig: AuthConfig,
    private readonly config: ApiServiceConfig
  ) {}

  async listCustomFields() {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4User.listCustomFields();
  }

  async addCustomField(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4User.addCustomField(params);
  }

  async addCustomFieldValue(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4User.addCustomFieldValue(params);
  }
}
