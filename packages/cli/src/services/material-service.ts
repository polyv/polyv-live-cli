import type { AuthConfig } from '../types/auth';
import type { ApiServiceConfig } from '../utils/api-command';
import { createSdkClient } from '../sdk';

export class MaterialServiceSdk {
  constructor(
    private readonly authConfig: AuthConfig,
    private readonly config: ApiServiceConfig
  ) {}

  async listMaterials(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Material.listMaterials(params);
  }

  async deleteMaterials(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Material.deleteMaterials(params);
  }

  async listMaterialCategories(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Material.listMaterialCategories(params);
  }

  async listMaterialLabels(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Material.listMaterialLabels(params);
  }

  async createMaterialLabel(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Material.createMaterialLabel(params);
  }

  async updateMaterialLabel(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Material.updateMaterialLabel(params);
  }

  async deleteMaterialLabel(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Material.deleteMaterialLabel(params);
  }
}
