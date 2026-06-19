import { BaseHandler, OutputFormat } from './base.handler';
import type { AuthConfig } from '../types/auth';
import { PolyVValidationError } from '../utils/errors';
import { apiParams, confirmWrite, type ApiServiceConfig } from '../utils/api-command';
import { MaterialServiceSdk } from '../services/material-service';

export class MaterialHandler extends BaseHandler {
  private readonly service: MaterialServiceSdk;

  constructor(authConfig: AuthConfig, serviceConfig: ApiServiceConfig) {
    super();
    this.service = new MaterialServiceSdk(authConfig, serviceConfig);
  }

  async listMaterials(options: any): Promise<void> {
    this.requireFields(options, ['type', 'pageNumber', 'pageSize']);
    this.show(await this.service.listMaterials(apiParams(options)), options.output);
  }

  async deleteMaterials(options: any): Promise<void> {
    this.requireFields(options, ['materialIds']);
    await confirmWrite(options.force, `Delete ${options.materialIds.length} material(s)?`);
    this.show(await this.service.deleteMaterials(apiParams(options)), options.output);
  }

  async listCategories(options: any): Promise<void> {
    this.requireFields(options, ['materialType']);
    this.show(await this.service.listMaterialCategories(apiParams(options)), options.output);
  }

  async listLabels(options: any): Promise<void> {
    this.requireFields(options, ['pageNumber', 'pageSize']);
    this.show(await this.service.listMaterialLabels(apiParams(options)), options.output);
  }

  async createLabel(options: any): Promise<void> {
    this.requireFields(options, ['name']);
    await confirmWrite(options.force, `Create material label "${options.name}"?`);
    this.show({ success: await this.service.createMaterialLabel(apiParams(options)) }, options.output);
  }

  async updateLabel(options: any): Promise<void> {
    this.requireFields(options, ['id', 'name']);
    await confirmWrite(options.force, `Update material label ${options.id}?`);
    this.show({ success: await this.service.updateMaterialLabel(apiParams(options)) }, options.output);
  }

  async deleteLabel(options: any): Promise<void> {
    this.requireFields(options, ['id']);
    await confirmWrite(options.force, `Delete material label ${options.id}?`);
    this.show({ success: await this.service.deleteMaterialLabel(apiParams(options)) }, options.output);
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
