import { BaseHandler, OutputFormat } from './base.handler';
import type { AuthConfig } from '../types/auth';
import { PolyVValidationError } from '../utils/errors';
import { apiParams, confirmWrite, type ApiServiceConfig } from '../utils/api-command';
import { RobotServiceSdk } from '../services/robot-service';

export class RobotHandler extends BaseHandler {
  private readonly service: RobotServiceSdk;

  constructor(authConfig: AuthConfig, serviceConfig: ApiServiceConfig) {
    super();
    this.service = new RobotServiceSdk(authConfig, serviceConfig);
  }

  async listRobots(options: any): Promise<void> {
    this.show(await this.service.listRobots(apiParams(options)), options.output);
  }

  async batchSaveRobots(options: any): Promise<void> {
    this.requireFields(options, ['robots']);
    await confirmWrite(options.force, `Save ${options.robots.length} robot(s)?`);
    this.show(await this.service.batchSaveRobots(apiParams(options)), options.output);
  }

  async batchDeleteRobots(options: any): Promise<void> {
    this.requireFields(options, ['ids']);
    await confirmWrite(options.force, `Delete ${options.ids.length} robot(s)?`);
    await this.service.batchDeleteRobots(apiParams(options));
    this.show({ success: true, ids: options.ids }, options.output);
  }

  private show(data: unknown, output: OutputFormat = 'table'): void {
    this.displayData(data, output);
  }

  private requireFields(options: Record<string, unknown>, fields: string[]): void {
    const missing = fields.filter((field) => options[field] === undefined || options[field] === '');
    if (missing.length > 0) {
      throw new PolyVValidationError(
        `Missing required option(s): ${missing.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }
}
