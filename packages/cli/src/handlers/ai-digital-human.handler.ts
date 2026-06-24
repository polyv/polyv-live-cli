/**
 * @fileoverview AI Digital Human command handler for CLI operations
 * @author Development Team
 * @since 14.4.0
 */

import { BaseHandler, OutputFormat } from './base.handler';
import { AuthConfig } from '../types/auth';
import { PolyVValidationError } from '../utils/errors';
import { AIDigitalHumanServiceSdk } from '../services/ai-digital-human-service';
import {
  AIDigitalHumanServiceConfig,
  AIDigitalHumanListOptions,
  AIDigitalHumanListOrgOptions,
  AIDigitalHumanSetOrgOptions,
  SetOrganizationParams,
} from '../types/ai-digital-human';

export type { AIDigitalHumanListOptions, AIDigitalHumanListOrgOptions, AIDigitalHumanSetOrgOptions };

/**
 * Handler for AI Digital Human-related CLI commands
 */
export class AIDigitalHumanHandler extends BaseHandler {
  readonly aiDigitalHumanService: AIDigitalHumanServiceSdk;

  /**
   * Creates a new AIDigitalHumanHandler instance
   * @param authConfig Authentication configuration
   * @param serviceConfig Service configuration
   */
  constructor(authConfig: AuthConfig, serviceConfig?: AIDigitalHumanServiceConfig) {
    super();
    this.aiDigitalHumanService = new AIDigitalHumanServiceSdk(authConfig, serviceConfig);
  }

  /**
   * Lists AI Digital Humans
   * @param options List options from CLI
   * @returns Promise that resolves when list is displayed
   */
  async listDigitalHumans(options: AIDigitalHumanListOptions): Promise<void> {
    const format: OutputFormat = options.output || 'table';
    const page = options.page || 1;
    const size = options.size || 10;

    // Call service
    const response = await this.aiDigitalHumanService.listDigitalHumans(page, size);

    // Display results
    if (format === 'json') {
      this.displayData(response, 'json');
    } else {
      this.displayDigitalHumansTable(response);
    }
  }

  /**
   * Lists organization associations
   * @param options List options from CLI
   * @returns Promise that resolves when list is displayed
   */
  async listOrganizations(options: AIDigitalHumanListOrgOptions): Promise<void> {
    const format: OutputFormat = options.output || 'table';

    // Validate options
    this.validateIds(options.ids);

    // Call service
    const associations = await this.aiDigitalHumanService.listOrganizations(options.ids);

    // Display results
    if (format === 'json') {
      this.displayData(associations, 'json');
    } else {
      this.displayOrganizationsTable(associations);
    }
  }

  /**
   * Sets organization associations
   * @param options Set options from CLI
   * @returns Promise that resolves when set is displayed
   */
  async setOrganizations(options: AIDigitalHumanSetOrgOptions): Promise<void> {
    const format: OutputFormat = options.output || 'table';

    let params: SetOrganizationParams[];

    // Parse params from --config-json or individual options. Note: the option is
    // named --config-json (not --config) to avoid clashing with the top-level
    // global --config <path> option, which would otherwise shadow it.
    if (options.configJson) {
      try {
        params = JSON.parse(options.configJson);
      } catch {
        throw new PolyVValidationError(
          'Invalid JSON config format',
          'configJson',
          options.configJson,
          'invalid'
        );
      }

      if (!Array.isArray(params) || params.length === 0) {
        throw new PolyVValidationError(
          'config-json must be a non-empty array',
          'configJson',
          options.configJson,
          'invalid'
        );
      }
    } else {
      // Build from individual options
      if (!options.aiDigitalHumanId || options.aiDigitalHumanId.trim() === '') {
        throw new PolyVValidationError(
          'aiDigitalHumanId is required when config-json is not provided',
          'aiDigitalHumanId',
          options.aiDigitalHumanId,
          'required'
        );
      }

      if (!options.organizationIds || options.organizationIds.trim() === '') {
        throw new PolyVValidationError(
          'organizationIds is required when config-json is not provided',
          'organizationIds',
          options.organizationIds,
          'required'
        );
      }

      const orgIds = options.organizationIds
        .split(',')
        .map(id => parseInt(id.trim(), 10))
        .filter(id => !isNaN(id));

      params = [{
        aiDigitalHumanId: parseInt(options.aiDigitalHumanId, 10),
        organizationIds: orgIds,
        includeChildren: options.includeChildren ?? true,
      }];
    }

    // Call service
    const result = await this.aiDigitalHumanService.setOrganizations(params);

    // Display results
    if (format === 'json') {
      this.displayData({ success: result, count: params.length }, 'json');
    } else {
      this.displaySetSuccessTable(params.length);
    }
  }

  // ========================================
  // Public validation methods
  // ========================================

  /**
   * Validates IDs string
   * @param ids IDs string to validate
   * @throws {PolyVValidationError} When ids is invalid
   */
  validateIds(ids: string): void {
    if (!ids || ids.trim() === '') {
      throw new PolyVValidationError(
        'ids is required',
        'ids',
        ids,
        'required'
      );
    }

    const idsArray = ids.split(',').map(id => id.trim()).filter(id => id.length > 0);

    if (idsArray.length === 0) {
      throw new PolyVValidationError(
        'ids must contain at least one valid ID',
        'ids',
        ids,
        'invalid'
      );
    }

    // Validate each ID is numeric
    for (const id of idsArray) {
      if (!/^\d+$/.test(id)) {
        throw new PolyVValidationError(
          `Invalid ID format: ${id}. IDs must be numeric`,
          'ids',
          ids,
          'invalid'
        );
      }
    }

    if (idsArray.length > 100) {
      throw new PolyVValidationError(
        `ids count (${idsArray.length}) exceeds maximum of 100`,
        'ids',
        ids,
        'exceed_maximum'
      );
    }
  }

  // ========================================
  // Private display methods
  // ========================================

  private displayDigitalHumansTable(response: { contents: any[]; totalItems: number; pageNumber: number; pageSize: number; totalPages: number }): void {
    if (response.contents.length === 0) {
      console.log('No AI Digital Humans found (未找到AI数字人)');
      return;
    }

    const tableData = response.contents.map((dh) => {
      return {
        'ID': dh.id,
        '名称': dh.name,
        '角色代码': dh.thirdRoleCode,
        '服装': dh.clothesDesc,
        '默认语音ID': dh.defaultTtsVoiceId,
        '创建时间': this.formatTimestamp(dh.createTime),
      };
    });

    this.displayAsTable(tableData);

    console.log(`\nPage ${response.pageNumber}/${response.totalPages} | Total: ${response.totalItems} items (第 ${response.pageNumber}/${response.totalPages} 页 | 共 ${response.totalItems} 条)`);
  }

  private displayOrganizationsTable(associations: any[]): void {
    if (associations.length === 0) {
      console.log('No organization associations found (未找到组织关联)');
      return;
    }

    const tableData = associations.map((assoc) => {
      return {
        '数字人ID': assoc.aiDigitalHumanId,
        '关联组织ID': (assoc.organizationIds || []).join(', '),
        '包含子组织': assoc.includeChildren ? 'Yes' : 'No',
      };
    });

    this.displayAsTable(tableData);
  }

  private displaySetSuccessTable(count: number): void {
    console.log(`✅ Successfully set organizations for ${count} AI Digital Human(s) (成功设置 ${count} 个AI数字人的组织关联)`);
  }

  private formatTimestamp(timestamp: number): string {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toISOString().split('T')[0] || '-';
  }
}
