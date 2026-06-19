import { BaseHandler } from './base.handler';
import type { AuthConfig } from '../types/auth';
import { PolyVValidationError } from '../utils/errors';
import { apiParams, confirmWrite, type ApiServiceConfig } from '../utils/api-command';
import { PartnerServiceSdk } from '../services/partner-service';

export class PartnerHandler extends BaseHandler {
  private readonly service: PartnerServiceSdk;

  constructor(authConfig: AuthConfig, serviceConfig: ApiServiceConfig) {
    super();
    this.service = new PartnerServiceSdk(authConfig, serviceConfig);
  }

  async registerUser(options: any): Promise<void> {
    this.requireFields(options, ['company', 'mobile', 'contact', 'email']);
    await confirmWrite(options.force, `Register partner user ${options.email}?`);
    this.displayData(await this.service.registerUser(apiParams(options)), options.output || 'table');
  }

  async createTencentOrder(options: any): Promise<void> {
    this.requireFields(options, ['uin', 'orderId', 'email', 'mobile']);
    if (!options.basicService && !options.premiumService) {
      throw new PolyVValidationError(
        'Missing required option(s): basicService or premiumService',
        'options',
        options,
        'validation_failed'
      );
    }
    await confirmWrite(options.force, `Create Tencent order ${options.orderId}?`);
    this.displayData({ success: await this.service.createTencentOrder(apiParams(options)) }, options.output || 'table');
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
