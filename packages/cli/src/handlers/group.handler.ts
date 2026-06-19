import { BaseHandler, OutputFormat } from './base.handler';
import type { AuthConfig } from '../types/auth';
import { PolyVValidationError } from '../utils/errors';
import { apiParams, confirmWrite, type ApiServiceConfig } from '../utils/api-command';
import { GroupServiceSdk } from '../services/group-service';

export class GroupHandler extends BaseHandler {
  private readonly service: GroupServiceSdk;

  constructor(authConfig: AuthConfig, serviceConfig: ApiServiceConfig) {
    super();
    this.service = new GroupServiceSdk(authConfig, serviceConfig);
  }

  async listAllocateLog(options: any): Promise<void> {
    this.requireFields(options, ['emails']);
    this.show(await this.service.listAllocateLog(apiParams(options)), options.output);
  }

  async setConcurrences(options: any): Promise<void> {
    this.requireFields(options, ['email', 'concurrences']);
    await confirmWrite(options.force, `Update live concurrences for ${options.email}?`);
    this.show({ success: true, result: await this.service.setConcurrences(apiParams(options)) }, options.output);
  }

  async setFlow(options: any): Promise<void> {
    this.requireFields(options, ['email']);
    await confirmWrite(options.force, `Update VOD flow for ${options.email}?`);
    this.show({ success: true, result: await this.service.setFlow(apiParams(options)) }, options.output);
  }

  async setLiveDurations(options: any): Promise<void> {
    this.requireFields(options, ['email', 'duration']);
    await confirmWrite(options.force, `Update live durations for ${options.email}?`);
    this.show({ success: true, result: await this.service.setLiveDurations(apiParams(options)) }, options.output);
  }

  async setSpace(options: any): Promise<void> {
    this.requireFields(options, ['email']);
    await confirmWrite(options.force, `Update VOD space for ${options.email}?`);
    this.show({ success: true, result: await this.service.setSpace(apiParams(options)) }, options.output);
  }

  async createUser(options: any): Promise<void> {
    this.requireFields(options, ['email', 'password', 'contacts', 'phone', 'maxChannels']);
    await confirmWrite(options.force, `Create group sub-account ${options.email}?`);
    this.show(await this.service.createGroupUser(apiParams(options)), options.output);
  }

  async listUserPackages(options: any): Promise<void> {
    this.show(await this.service.listGroupUserPackages(apiParams(options)), options.output);
  }

  async updateUserPackage(options: any): Promise<void> {
    this.requireFields(options, ['email']);
    await confirmWrite(options.force, `Update package for group user ${options.email}?`);
    this.show({ success: await this.service.updateGroupUserPackage(apiParams(options)) }, options.output);
  }

  async listBillingDaily(options: any): Promise<void> {
    this.requireFields(options, ['billingDate']);
    this.show(await this.service.listBillingDaily(apiParams(options)), options.output);
  }

  async listUserBillingDaily(options: any): Promise<void> {
    this.requireFields(options, ['startDate', 'endDate']);
    this.show(await this.service.listGroupUserBillingDaily(apiParams(options)), options.output);
  }

  async listAllocationLogs(options: any): Promise<void> {
    this.requireFields(options, ['emails']);
    this.show(await this.service.listAllocationLogs(apiParams(options)), options.output);
  }

  async healthCheck(options: any): Promise<void> {
    this.show(await this.service.healthCheck(), options.output);
  }

  async createIsolation(options: any): Promise<void> {
    this.requireFields(options, ['email', 'password']);
    await confirmWrite(options.force, `Create isolated group account ${options.email}?`);
    this.show(await this.service.createIsolation(apiParams(options)), options.output);
  }

  async listPackageValidity(options: any): Promise<void> {
    this.show(await this.service.getPackageValidityList(apiParams(options)), options.output);
  }

  async updatePackageValidity(options: any): Promise<void> {
    this.requireFields(options, ['email']);
    await confirmWrite(options.force, `Update package validity for ${options.email}?`);
    this.show({ success: await this.service.updatePackageValidity(apiParams(options)) }, options.output);
  }

  async resetAppSecret(options: any): Promise<void> {
    this.requireFields(options, ['email']);
    await confirmWrite(options.force, `Reset app secret for ${options.email}?`);
    this.show(await this.service.resetAppSecret({ email: options.email }), options.output);
  }

  private show(data: unknown, output: OutputFormat = 'table'): void {
    this.displayData(data, output);
  }

  private requireFields(options: Record<string, unknown>, fields: string[]): void {
    const missing = fields.filter((field) => {
      const value = options[field];
      return value === undefined || value === null || value === '';
    });
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
