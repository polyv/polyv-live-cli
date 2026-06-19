import type { AuthConfig } from '../types/auth';
import type { ApiServiceConfig } from '../utils/api-command';
import { createSdkClient } from '../sdk';

export class RobotServiceSdk {
  constructor(
    private readonly authConfig: AuthConfig,
    private readonly config: ApiServiceConfig
  ) {}

  async listRobots(params: any = {}) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Robot.listRobots(params);
  }

  async batchSaveRobots(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Robot.batchSaveRobots(params);
  }

  async batchDeleteRobots(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Robot.batchDeleteRobots(params);
  }
}
