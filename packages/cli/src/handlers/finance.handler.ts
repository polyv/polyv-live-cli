import { BaseHandler, OutputFormat } from './base.handler';
import type { AuthConfig } from '../types/auth';
import { PolyVValidationError } from '../utils/errors';
import { apiParams, confirmWrite, type ApiServiceConfig } from '../utils/api-command';
import { FinanceServiceSdk } from '../services/finance-service';

export class FinanceHandler extends BaseHandler {
  private readonly service: FinanceServiceSdk;

  constructor(authConfig: AuthConfig, serviceConfig: ApiServiceConfig) {
    super();
    this.service = new FinanceServiceSdk(authConfig, serviceConfig);
  }

  async getAudioSettings(options: any): Promise<void> {
    this.requireFields(options, ['channelId']);
    this.show(await this.service.getAudioModerationSettings(options.channelId), options.output);
  }

  async listAudioRecords(options: any): Promise<void> {
    this.requireFields(options, ['channelId']);
    this.show(
      await this.service.listAudioModerationRecords(
        options.channelId,
        apiParams({ ...options, channelId: undefined })
      ),
      options.output
    );
  }

  async updateAudioSettings(options: any): Promise<void> {
    this.requireFields(options, ['channelId']);
    const params = apiParams({ ...options, channelId: undefined });
    await confirmWrite(options.force, `Update audio moderation settings for channel ${options.channelId}?`);
    await this.service.updateAudioModerationSettings(options.channelId, params);
    this.show({ success: true, channelId: options.channelId, ...params }, options.output);
  }

  async getVideoSettings(options: any): Promise<void> {
    this.requireFields(options, ['channelId']);
    this.show(await this.service.getVideoModerationSettings(options.channelId), options.output);
  }

  async updateVideoSettings(options: any): Promise<void> {
    this.requireFields(options, ['channelId']);
    const params = apiParams({ ...options, channelId: undefined });
    await confirmWrite(options.force, `Update video moderation settings for channel ${options.channelId}?`);
    await this.service.updateVideoModerationSettings(options.channelId, params);
    this.show({ success: true, channelId: options.channelId, ...params }, options.output);
  }

  async listVideoResults(options: any): Promise<void> {
    this.requireFields(options, ['channelId']);
    this.show(
      await this.service.listVideoModerationResults(
        options.channelId,
        apiParams({ ...options, channelId: undefined })
      ),
      options.output
    );
  }

  async listBillDetails(options: any): Promise<void> {
    this.requireFields(options, ['itemCategory', 'startDate', 'endDate']);
    this.show(await this.service.listBillDetails(apiParams(options)), options.output);
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
