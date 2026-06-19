import { BaseHandler, OutputFormat } from './base.handler';
import type { AuthConfig } from '../types/auth';
import { PolyVValidationError } from '../utils/errors';
import { apiParams, confirmWrite, type ApiServiceConfig } from '../utils/api-command';
import { InviteSalesServiceSdk } from '../services/invite-sales-service';

export class InviteSalesHandler extends BaseHandler {
  private readonly service: InviteSalesServiceSdk;

  constructor(authConfig: AuthConfig, serviceConfig: ApiServiceConfig) {
    super();
    this.service = new InviteSalesServiceSdk(authConfig, serviceConfig);
  }

  async list(options: any): Promise<void> {
    this.show(await this.service.listInviteSales(this.toPagingParams(options)), options.output);
  }

  async add(options: any): Promise<void> {
    const viewerUnionIds = this.parseViewerIds(options.viewerUnionIds, 200);
    await confirmWrite(options.force, `Add ${viewerUnionIds.length} invite sale(s)?`);
    this.show(
      { success: true, result: await this.service.addInviteSale(this.compact({ viewerUnionIds, organizationId: options.organizationId })) },
      options.output
    );
  }

  async update(options: any): Promise<void> {
    this.requireFields(options, ['organizationId']);
    const viewerUnionIds = this.parseViewerIds(options.viewerUnionIds, 200);
    await confirmWrite(options.force, `Update ${viewerUnionIds.length} invite sale(s)?`);
    this.show(
      { success: true, result: await this.service.updateInviteSale({ viewerUnionIds, organizationId: options.organizationId }) },
      options.output
    );
  }

  async remove(options: any): Promise<void> {
    const viewerUnionIds = this.parseViewerIds(options.viewerUnionIds, 100);
    await confirmWrite(options.force, `Remove ${viewerUnionIds.length} invite sale(s)?`);
    this.show(
      {
        success: true,
        result: await this.service.removeInviteSale(this.compact({
          viewerUnionIds,
          newViewerUnionId: options.newViewerUnionId,
          followViewersToNewViewerUnionId: options.newViewerUnionId,
        })),
      },
      options.output
    );
  }

  async listFollowViewers(options: any): Promise<void> {
    this.show(await this.service.listFollowViewers(this.toPagingParams(options)), options.output);
  }

  private toPagingParams(options: any): Record<string, unknown> {
    const { page, size, pageNumber, pageSize, output, force, ...rest } = options;
    return apiParams({
      ...rest,
      pageNumber: page ?? pageNumber,
      pageSize: size ?? pageSize,
    });
  }

  private parseViewerIds(value: string | undefined, max: number): string[] {
    if (!value || value.trim() === '') {
      throw new PolyVValidationError('viewerUnionIds is required', 'viewerUnionIds', value, 'required');
    }
    const ids = Array.from(new Set(value.split(',').map(id => id.trim()).filter(Boolean)));
    if (ids.length === 0) {
      throw new PolyVValidationError('viewerUnionIds must not be empty', 'viewerUnionIds', value, 'not_empty');
    }
    if (ids.length > max) {
      throw new PolyVValidationError(`viewerUnionIds cannot exceed ${max} items`, 'viewerUnionIds', value, 'max_items');
    }
    return ids;
  }

  private compact<T extends Record<string, unknown>>(params: T): Partial<T> {
    return Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
    ) as Partial<T>;
  }

  private requireFields(options: Record<string, unknown>, fields: string[]): void {
    const missing = fields.filter((field) => {
      const value = options[field];
      return value === undefined || value === null || value === '';
    });
    if (missing.length > 0) {
      throw new PolyVValidationError(`Missing required option(s): ${missing.join(', ')}`, 'options', options, 'required');
    }
  }

  private show(data: unknown, output: OutputFormat = 'table'): void {
    this.displayData(data, output);
  }
}
