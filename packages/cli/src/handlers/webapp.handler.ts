import { BaseHandler, OutputFormat } from './base.handler';
import type { AuthConfig } from '../types/auth';
import { PolyVValidationError } from '../utils/errors';
import { apiParams, confirmWrite, type ApiServiceConfig } from '../utils/api-command';
import { WebAppServiceSdk } from '../services/webapp-service';

export class WebAppHandler extends BaseHandler {
  private readonly service: WebAppServiceSdk;

  constructor(authConfig: AuthConfig, serviceConfig: ApiServiceConfig) {
    super();
    this.service = new WebAppServiceSdk(authConfig, serviceConfig);
  }

  async listPermissions(options: any): Promise<void> {
    this.show(await this.service.listPermissions(), options.output);
  }

  async listRoles(options: any): Promise<void> {
    this.show(await this.service.listRoles(apiParams(options)), options.output);
  }

  async getRole(options: any): Promise<void> {
    this.requireFields(options, ['roleId']);
    this.show(await this.service.getRole(options.roleId), options.output);
  }

  async createRole(options: any): Promise<void> {
    this.requireFields(options, ['name', 'roleType', 'permissionIds']);
    await confirmWrite(options.force, `Create WebApp role "${options.name}"?`);
    await this.service.createRole(apiParams(options));
    this.show({ success: true }, options.output);
  }

  async updateRole(options: any): Promise<void> {
    this.requireFields(options, ['roleId', 'name', 'roleType']);
    await confirmWrite(options.force, `Update WebApp role ${options.roleId}?`);
    await this.service.updateRole(apiParams(options));
    this.show({ success: true, roleId: options.roleId }, options.output);
  }

  async deleteRole(options: any): Promise<void> {
    this.requireFields(options, ['roleId']);
    await confirmWrite(options.force, `Delete WebApp role ${options.roleId}?`);
    await this.service.deleteRole(options.roleId);
    this.show({ success: true, roleId: options.roleId }, options.output);
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
