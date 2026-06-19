/**
 * @fileoverview Handler for viewer CLI commands
 * @author Development Team
 * @since 12.1.0
 */

import { BaseHandler } from './base.handler';
import { ViewerServiceSdk, BatchOperationSummary } from '../services/viewer-service';
import {
  ViewerServiceConfig,
  ViewerGetOptions,
  ViewerListOptions,
  ViewerCreateOptions,
  ViewerUpdateOptions,
  ViewerDeleteOptions,
  ViewerImportExternalOptions,
  ViewerConfigUpdateOptions,
  ViewerLotteryWinsOptions,
  ViewerTagAddOptions,
  ViewerTagRemoveOptions,
  ViewerTagListOptions,
  ViewerTagCreateOptions,
  ViewerTagUpdateOptions,
  ViewerTagDeleteOptions,
  ViewerLabelListOptions,
  ViewerLabelCreateOptions,
  ViewerLabelUpdateOptions,
  ViewerLabelDeleteOptions,
  ViewerChannelLabelRefsOptions,
} from '../types/viewer';
import { AuthConfig } from '../types/auth';
import { PolyVValidationError } from '../utils/errors';
import { confirmWrite } from '../utils/api-command';
import type {
  ListViewerRecordsParams,
  ListViewerRecordsResponse,
  ViewerRecord,
  ImportExternalViewerParams,
  ViewerLotteryWinResponse,
  ViewerLabel as SdkViewerLabel,
} from 'polyv-live-api-sdk';

/** Viewer label type from API */
interface ViewerLabel {
  labelId: number;
  labelName: string;
}

/** Pagination options common interface */
interface PaginationOptions {
  page?: number;
  size?: number;
  output?: 'table' | 'json';
}

interface AccountLabel {
  id?: string | number;
  name?: string;
}

/**
 * Handler for viewer-related CLI commands
 */
export class ViewerHandler extends BaseHandler {
  private readonly viewerService: ViewerServiceSdk;

  /**
   * Creates a new ViewerHandler instance
   * @param authConfig Authentication configuration
   * @param serviceConfig Viewer service configuration
   */
  constructor(authConfig: AuthConfig, serviceConfig: ViewerServiceConfig) {
    super();
    this.viewerService = new ViewerServiceSdk(authConfig, serviceConfig);
  }

  // ========================================
  // viewer get (AC #1)
  // ========================================

  /**
   * Get viewer details
   * @param options Viewer get options from CLI
   * @returns Promise that resolves when viewer is displayed
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async getViewer(options: ViewerGetOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate input options
      this.validateGetOptions(options);

      // Call SDK service
      const result = await this.viewerService.getViewerRecord({
        viewerUnionId: options.viewerId,
      });

      // Display results
      this.displayGetResult(result, options);

    }, 'viewer.get');
  }

  // ========================================
  // viewer list (AC #2, #3)
  // ========================================

  /**
   * List viewers with optional filters
   * @param options Viewer list options from CLI
   * @returns Promise that resolves when viewers are displayed
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async listViewers(options: ViewerListOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate input options
      this.validatePaginationOptions(options);

      // Build params with defaults
      const params: ListViewerRecordsParams = {
        pageNumber: options.page ?? 1,
        pageSize: options.size ?? 10,
      };

      // Add optional filters
      if (options.source) {
        params.source = options.source;
      }
      if (options.mobile) {
        params.mobile = options.mobile;
      }
      if (options.email) {
        params.email = options.email;
      }
      if (options.area) {
        params.area = options.area;
      }

      // Call SDK service
      const result = await this.viewerService.listViewerRecords(params);

      // Display results
      this.displayListResult(result, options);

    }, 'viewer.list');
  }

  /**
   * Create a viewer record
   * @param options Viewer create options
   * @returns Promise that resolves when viewer is created
   */
  async createViewer(options: ViewerCreateOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredStringOptions(options, ['nickname', 'mobile']);
      this.validateOutputOption(options.output);
      await confirmWrite(options.force, `Create viewer "${options.nickname}"?`);

      const params = this.compactParams({
        nickname: options.nickname,
        mobile: options.mobile,
        name: options.name,
        lastCollectMobile: options.lastCollectMobile,
        email: options.email,
        area: options.area,
        latestAccessIp: options.latestAccessIp,
        device: options.device,
        followUsers: options.followUsers ? this.parseJsonObject(options.followUsers, 'followUsers') : undefined,
      });

      const result = await this.viewerService.createViewerRecord(params as any);
      this.displayWriteResult('观众创建成功', result, options.output);
    }, 'viewer.create');
  }

  /**
   * Update a viewer record
   * @param options Viewer update options
   * @returns Promise that resolves when viewer is updated
   */
  async updateViewer(options: ViewerUpdateOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredStringOptions(options, ['viewerUnionId']);
      this.validateOutputOption(options.output);
      await confirmWrite(options.force, `Update viewer ${options.viewerUnionId}?`);

      const params = this.compactParams({
        viewerUnionId: options.viewerUnionId,
        nickname: options.nickname,
        mobile: options.mobile,
        name: options.name,
        lastCollectMobile: options.lastCollectMobile,
        email: options.email,
        area: options.area,
        latestAccessIp: options.latestAccessIp,
        device: options.device,
      });

      await this.viewerService.updateViewerRecord(params as any);
      this.displayWriteResult('观众更新成功', params, options.output);
    }, 'viewer.update');
  }

  /**
   * Delete a viewer record
   * @param options Viewer delete options
   * @returns Promise that resolves when viewer is deleted
   */
  async deleteViewer(options: ViewerDeleteOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredStringOptions(options, ['viewerUnionId']);
      this.validateOutputOption(options.output);
      await confirmWrite(options.force, `Delete viewer ${options.viewerUnionId}?`);

      await this.viewerService.deleteViewerRecord({ viewerUnionId: options.viewerUnionId });
      this.displayWriteResult('观众删除成功', { viewerUnionId: options.viewerUnionId }, options.output);
    }, 'viewer.delete');
  }

  /**
   * Import external viewer records
   * @param options External import options
   * @returns Promise that resolves when import finishes
   */
  async importExternalViewers(options: ViewerImportExternalOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateOutputOption(options.output);
      const viewers = this.buildExternalViewers(options);
      await confirmWrite(options.force, `Import ${viewers.length} external viewer(s)?`);

      const result = await this.viewerService.importExternalViewer(viewers);
      this.displayWriteResult('外部观众导入成功', result, options.output);
    }, 'viewer.importExternal');
  }

  /**
   * Update viewer user system config
   * @param options Config update options
   * @returns Promise that resolves when config is updated
   */
  async updateViewerConfig(options: ViewerConfigUpdateOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredStringOptions(options, ['mobileLoginEnabled', 'wxWorkLoginEnabled']);
      this.validateYnOptions(options, [
        'mobileLoginEnabled',
        'wxWorkLoginEnabled',
        'collectMobileEnabled',
        'guestModeEnabled',
        'touristExternalHrefEnabled',
      ]);
      this.validateViewerConfigOptions(options);
      this.validateOutputOption(options.output);
      await confirmWrite(options.force, 'Update viewer user system config?');

      const params = this.compactParams({
        mobileLoginEnabled: options.mobileLoginEnabled,
        wxWorkLoginEnabled: options.wxWorkLoginEnabled,
        viewerWeixinAuthExpired: options.viewerWeixinAuthExpired,
        collectMobileEnabled: options.collectMobileEnabled,
        guestModeEnabled: options.guestModeEnabled,
        touristExternalHrefEnabled: options.touristExternalHrefEnabled,
        touristExternalHrefConfig: options.touristExternalHrefConfig
          ? this.parseJsonObject(options.touristExternalHrefConfig, 'touristExternalHrefConfig')
          : undefined,
      });

      await this.viewerService.updateViewerUserSystemConfig(params as any);
      this.displayWriteResult('观众系统配置更新成功', params, options.output);
    }, 'viewer.config.update');
  }

  /**
   * List viewer lottery wins
   * @param options Viewer lottery win query options
   * @returns Promise that resolves when results are displayed
   */
  async listViewerLotteryWins(options: ViewerLotteryWinsOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredStringOptions(options, ['viewerId']);
      this.validatePaginationOptions(options);

      const result = await this.viewerService.viewerLotteryWin({
        viewerId: options.viewerId,
        pageNumber: options.page ?? 1,
        pageSize: options.size ?? 10,
      });

      this.displayViewerLotteryWins(result, options);
    }, 'viewer.lotteryWins');
  }

  // ========================================
  // Story 12-2: Viewer Tag Management
  // ========================================

  /**
   * List viewer tags
   *
   * Note: The SDK API does not support server-side pagination or keyword filtering.
   * All tags are fetched and pagination/filtering is performed client-side.
   * This may be inefficient for accounts with thousands of tags.
   *
   * @param options Tag list options
   * @returns Promise that resolves when tags are displayed
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async listViewerTags(options: ViewerTagListOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate input options
      this.validatePaginationOptions(options);

      // Call SDK service - gets ALL labels (no server-side pagination)
      const result = await this.viewerService.listViewerLabels();

      // Filter by keyword if provided (client-side)
      let contents: ViewerLabel[] = (result?.contents || []).map(label => this.normalizeViewerLabel(label));
      if (options.keyword) {
        const keywordLower = options.keyword.toLowerCase();
        contents = contents.filter((label: ViewerLabel) =>
          label.labelName?.toLowerCase().includes(keywordLower)
        );
      }

      // Apply pagination (client-side since SDK doesn't support it)
      const page = options.page ?? 1;
      const size = options.size ?? 10;
      const startIndex = (page - 1) * size;
      const paginatedContents = contents.slice(startIndex, startIndex + size);

      // Display results
      this.displayTagListResult({
        contents: paginatedContents,
        totalItems: contents.length,
        pageNumber: page,
        pageSize: size,
        totalPages: Math.ceil(contents.length / size),
      }, options);

    }, 'viewer.tag.list');
  }

  /**
   * Create viewer tags
   * @param options Viewer tag create options
   * @returns Promise that resolves when tags are created
   */
  async createViewerTag(options: ViewerTagCreateOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredStringOptions(options, ['labels']);
      this.validateOutputOption(options.output);
      const labels = this.parseStringList(options.labels, '标签名称列表');
      await confirmWrite(options.force, `Create ${labels.length} viewer tag(s)?`);

      const result = await this.viewerService.createViewerLabel({ labels });
      this.displayWriteResult('观众标签创建成功', result, options.output);
    }, 'viewer.tag.create');
  }

  /**
   * Update a viewer tag
   * @param options Viewer tag update options
   * @returns Promise that resolves when tag is updated
   */
  async updateViewerTag(options: ViewerTagUpdateOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validatePositiveNumber(options.id, '标签ID');
      this.validateOutputOption(options.output);
      await confirmWrite(options.force, `Update viewer tag ${options.id}?`);

      const params = this.compactParams({ id: options.id, label: options.label }) as { id: number; label?: string };
      await this.viewerService.updateViewerLabel(params);
      this.displayWriteResult('观众标签更新成功', params, options.output);
    }, 'viewer.tag.update');
  }

  /**
   * Delete a viewer tag
   * @param options Viewer tag delete options
   * @returns Promise that resolves when tag is deleted
   */
  async deleteViewerTag(options: ViewerTagDeleteOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validatePositiveNumber(options.id, '标签ID');
      this.validateOutputOption(options.output);
      await confirmWrite(options.force, `Delete viewer tag ${options.id}?`);

      await this.viewerService.deleteViewerLabel({ id: options.id });
      this.displayWriteResult('观众标签删除成功', { id: options.id }, options.output);
    }, 'viewer.tag.delete');
  }

  /**
   * Add tags to viewers (batch operation with progress)
   * @param options Tag add options
   * @returns Promise that resolves when tags are added
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async addViewerTag(options: ViewerTagAddOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate and parse input options
      const { viewerIds, labelIds } = this.parseAndValidateTagOptions(options);
      await confirmWrite(options.force, `Add ${labelIds.length} tag(s) to ${viewerIds.length} viewer(s)?`);

      // Show progress for large batches
      const total = viewerIds.length * labelIds.length;
      if (total > 10) {
        this.displayInfo(`正在为 ${viewerIds.length} 个观众添加 ${labelIds.length} 个标签 (共 ${total} 个操作)...`);
      }

      // Call SDK service with progress callback
      const summary = await this.viewerService.addViewersLabels(
        viewerIds,
        labelIds,
        total > 50 ? (completed, total) => {
          if (completed % 10 === 0 || completed === total) {
            this.displayInfo(`进度: ${completed}/${total}`);
          }
        } : undefined
      );

      // Display result
      this.displayTagActionResult('添加', summary, options);

    }, 'viewer.tag.add');
  }

  /**
   * Remove tags from viewers (batch operation with progress)
   * @param options Tag remove options
   * @returns Promise that resolves when tags are removed
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async removeViewerTag(options: ViewerTagRemoveOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate and parse input options
      const { viewerIds, labelIds } = this.parseAndValidateTagOptions(options);
      await confirmWrite(options.force, `Remove ${labelIds.length} tag(s) from ${viewerIds.length} viewer(s)?`);

      // Show progress for large batches
      const total = viewerIds.length * labelIds.length;
      if (total > 10) {
        this.displayInfo(`正在为 ${viewerIds.length} 个观众移除 ${labelIds.length} 个标签 (共 ${total} 个操作)...`);
      }

      // Call SDK service with progress callback
      const summary = await this.viewerService.removeViewersLabels(
        viewerIds,
        labelIds,
        total > 50 ? (completed, total) => {
          if (completed % 10 === 0 || completed === total) {
            this.displayInfo(`进度: ${completed}/${total}`);
          }
        } : undefined
      );

      // Display result
      this.displayTagActionResult('移除', summary, options);

    }, 'viewer.tag.remove');
  }

  /**
   * List account labels
   * @param options Account label list options
   * @returns Promise that resolves when labels are displayed
   */
  async listLabels(options: ViewerLabelListOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validatePaginationOptions(options);
      const result = await this.viewerService.listLabels({
        pageNumber: options.page ?? 1,
        pageSize: options.size ?? 10,
      });
      this.displayAccountLabels(result, options);
    }, 'viewer.label.list');
  }

  /**
   * Create account label
   * @param options Account label create options
   * @returns Promise that resolves when label is created
   */
  async createLabel(options: ViewerLabelCreateOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredStringOptions(options, ['labelName']);
      this.validateOutputOption(options.output);
      await confirmWrite(options.force, `Create account label "${options.labelName}"?`);

      const result = await this.viewerService.createLabel({ labelName: options.labelName });
      this.displayWriteResult('账号标签创建成功', result, options.output);
    }, 'viewer.label.create');
  }

  /**
   * Update account label
   * @param options Account label update options
   * @returns Promise that resolves when label is updated
   */
  async updateLabel(options: ViewerLabelUpdateOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validatePositiveNumber(options.labelId, '标签ID');
      this.validateRequiredStringOptions(options, ['labelName']);
      this.validateOutputOption(options.output);
      await confirmWrite(options.force, `Update account label ${options.labelId}?`);

      const params = { labelId: String(options.labelId), labelName: options.labelName };
      await this.viewerService.updateLabel(params);
      this.displayWriteResult('账号标签更新成功', params, options.output);
    }, 'viewer.label.update');
  }

  /**
   * Delete account label
   * @param options Account label delete options
   * @returns Promise that resolves when label is deleted
   */
  async deleteLabel(options: ViewerLabelDeleteOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validatePositiveNumber(options.labelId, '标签ID');
      this.validateOutputOption(options.output);
      await confirmWrite(options.force, `Delete account label ${options.labelId}?`);

      await this.viewerService.deleteLabel({ labelId: String(options.labelId) });
      this.displayWriteResult('账号标签删除成功', { labelId: options.labelId }, options.output);
    }, 'viewer.label.delete');
  }

  /**
   * Add account label refs to channels
   * @param options Channel label refs options
   * @returns Promise that resolves when refs are added
   */
  async addChannelLabelRefs(options: ViewerChannelLabelRefsOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequiredStringOptions(options, ['channelIds', 'labelIds']);
      this.validateOutputOption(options.output);
      const channelIds = this.parseStringList(options.channelIds, '频道ID列表');
      const labelIds = this.parseStringList(options.labelIds, '标签ID列表');
      this.validateChannelLabelRefs(channelIds, labelIds);
      await confirmWrite(options.force, `Add ${labelIds.length} label(s) to ${channelIds.length} channel(s)?`);

      const params = { channelIds, labelIds };
      await this.viewerService.addChannelLabelRefs(params);
      this.displayWriteResult('频道标签关联成功', params, options.output);
    }, 'viewer.label.channelRef.add');
  }

  // ===== Private Validation Methods =====

  private compactParams<T extends Record<string, unknown>>(params: T): Partial<T> {
    return Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
    ) as Partial<T>;
  }

  private validateRequiredStringOptions(options: object, fields: string[]): void {
    const record = options as Record<string, unknown>;
    const errors = fields
      .filter(field => typeof record[field] !== 'string' || String(record[field]).trim() === '')
      .map(field => `${field} 是必需的`);

    if (errors.length > 0) {
      throw new PolyVValidationError(
        errors.join(', '),
        'options',
        options,
        'validation_failed'
      );
    }
  }

  private validateOutputOption(output: string | undefined): void {
    if (output && !['table', 'json'].includes(output)) {
      throw new PolyVValidationError(
        '输出格式必须是 "table" 或 "json"',
        'output',
        output,
        'validation_failed'
      );
    }
  }

  private validateYnOptions(options: object, fields: string[]): void {
    const record = options as Record<string, unknown>;
    const invalid = fields.filter(field => {
      const value = record[field];
      return value !== undefined && value !== 'Y' && value !== 'N';
    });

    if (invalid.length > 0) {
      throw new PolyVValidationError(
        `${invalid.join(', ')} 必须是 Y 或 N`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  private validatePositiveNumber(value: number | undefined, fieldName: string): void {
    if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
      throw new PolyVValidationError(
        `${fieldName}必须是正整数`,
        fieldName,
        value,
        'validation_failed'
      );
    }
  }

  private validateViewerConfigOptions(options: ViewerConfigUpdateOptions): void {
    const errors: string[] = [];

    if (options.viewerWeixinAuthExpired !== undefined) {
      const value = options.viewerWeixinAuthExpired;
      if (!Number.isInteger(value) || value < 0 || value > 180) {
        errors.push('微信授权有效期必须是 0 到 180 之间的整数');
      }
    }

    if (options.touristExternalHrefConfig) {
      try {
        this.parseJsonObject(options.touristExternalHrefConfig, 'touristExternalHrefConfig');
      } catch (error) {
        errors.push(error instanceof Error ? error.message : String(error));
      }
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        errors.join(', '),
        'options',
        options,
        'validation_failed'
      );
    }
  }

  private validateChannelLabelRefs(channelIds: string[], labelIds: string[]): void {
    const errors: string[] = [];

    if (channelIds.length > 100) {
      errors.push('频道ID数量不能超过 100');
    }
    if (labelIds.length > 50) {
      errors.push('标签ID数量不能超过 50');
    }

    const invalidLabelIds = labelIds.filter(id => !/^[1-9]\d*$/.test(id));
    if (invalidLabelIds.length > 0) {
      errors.push(`标签ID必须是正整数: ${invalidLabelIds.join(', ')}`);
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        errors.join(', '),
        'options',
        { channelIds, labelIds },
        'validation_failed'
      );
    }
  }

  private parseJsonObject(value: string, fieldName: string): Record<string, unknown> {
    try {
      const parsed = JSON.parse(value);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error(`${fieldName} 必须是 JSON 对象`);
      }
      return parsed as Record<string, unknown>;
    } catch (error) {
      if (error instanceof PolyVValidationError) {
        throw error;
      }
      throw new PolyVValidationError(
        error instanceof Error ? error.message : `${fieldName} JSON 解析失败`,
        fieldName,
        value,
        'validation_failed'
      );
    }
  }

  private parseStringList(value: string, fieldName: string): string[] {
    const list = value.split(',').map(item => item.trim()).filter(Boolean);
    if (list.length === 0) {
      throw new PolyVValidationError(
        `${fieldName}不能为空`,
        fieldName,
        value,
        'validation_failed'
      );
    }
    return Array.from(new Set(list));
  }

  private buildExternalViewers(options: ViewerImportExternalOptions): ImportExternalViewerParams {
    const errors: string[] = [];

    if (options.viewers) {
      try {
        const parsed = JSON.parse(options.viewers);
        if (!Array.isArray(parsed) || parsed.length === 0) {
          errors.push('viewers 必须是非空 JSON 数组');
        } else {
          for (const [index, item] of parsed.entries()) {
            if (!item || typeof item !== 'object' || Array.isArray(item)) {
              errors.push(`viewers[${index}] 必须是 JSON 对象`);
              continue;
            }
            const viewer = item as Record<string, unknown>;
            if (typeof viewer.externalViewerId !== 'string' || viewer.externalViewerId.trim() === '') {
              errors.push(`viewers[${index}].externalViewerId 是必需的`);
            }
            if (typeof viewer.nickname !== 'string' || viewer.nickname.trim() === '') {
              errors.push(`viewers[${index}].nickname 是必需的`);
            }
          }

          if (errors.length === 0) {
            return parsed as ImportExternalViewerParams;
          }
        }
      } catch (error) {
        errors.push(error instanceof Error ? error.message : 'viewers JSON 解析失败');
      }
    } else {
      if (!options.externalViewerId || options.externalViewerId.trim() === '') {
        errors.push('externalViewerId 是必需的');
      }
      if (!options.nickname || options.nickname.trim() === '') {
        errors.push('nickname 是必需的');
      }

      if (errors.length === 0) {
        const viewer: Record<string, unknown> = {
          externalViewerId: options.externalViewerId,
          nickname: options.nickname,
        };

        if (options.labelIds) {
          viewer.labelIds = this.parseStringList(options.labelIds, '标签ID列表');
        }

        if (options.followUserId) {
          viewer.followUsers = {
            userId: options.followUserId,
            ...(options.followUserType ? { type: options.followUserType } : {}),
          };
        }

        return [viewer] as unknown as ImportExternalViewerParams;
      }
    }

    throw new PolyVValidationError(
      errors.join(', '),
      'options',
      options,
      'validation_failed'
    );
  }

  private validateGetOptions(options: ViewerGetOptions): void {
    const errors: string[] = [];

    if (!options.viewerId || options.viewerId.trim() === '') {
      errors.push('观众ID是必需的');
    }

    if (options.output && !['table', 'json'].includes(options.output)) {
      errors.push('输出格式必须是 "table" 或 "json"');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        errors.join(', '),
        'options',
        options,
        'validation_failed'
      );
    }
  }

  /**
   * Validate pagination options (shared utility)
   * LOW-1: Extract to shared validation utility
   */
  private validatePaginationOptions(options: PaginationOptions): void {
    const errors: string[] = [];

    if (options.page !== undefined) {
      if (typeof options.page !== 'number' || !Number.isInteger(options.page) || options.page < 1) {
        errors.push('页码必须是正整数');
      }
    }

    if (options.size !== undefined) {
      if (typeof options.size !== 'number' || !Number.isInteger(options.size) || options.size < 1) {
        errors.push('每页数量必须是正整数');
      }
      if (options.size > 1000) {
        errors.push('每页数量不能超过 1000');
      }
    }

    if (options.output && !['table', 'json'].includes(options.output)) {
      errors.push('输出格式必须是 "table" 或 "json"');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        errors.join(', '),
        'options',
        options,
        'validation_failed'
      );
    }
  }

  /**
   * Parse and validate tag options
   * MEDIUM-3: Validate empty arrays after parsing
   */
  private parseAndValidateTagOptions(
    options: ViewerTagAddOptions | ViewerTagRemoveOptions
  ): { viewerIds: string[]; labelIds: number[] } {
    const errors: string[] = [];

    // Validate required fields
    if (!options.viewerIds || options.viewerIds.trim() === '') {
      errors.push('观众ID列表是必需的');
    }

    if (!options.labelIds || options.labelIds.trim() === '') {
      errors.push('标签ID列表是必需的');
    }

    // Parse viewer IDs
    let viewerIds: string[] = [];
    if (options.viewerIds && options.viewerIds.trim() !== '') {
      viewerIds = options.viewerIds
        .split(',')
        .map(id => id.trim())
        .filter(id => id.length > 0);

      // MEDIUM-3: Validate empty array after parsing
      if (viewerIds.length === 0) {
        errors.push('观众ID列表不能为空');
      }
    }

    // Parse and validate label IDs
    let labelIds: number[] = [];
    if (options.labelIds && options.labelIds.trim() !== '') {
      const rawIds = options.labelIds
        .split(',')
        .map(id => id.trim())
        .filter(id => id.length > 0);
      const parsedIds = rawIds.map(id => {
        if (!/^[1-9]\d*$/.test(id)) return NaN;
        return parseInt(id, 10);
      });

      // Check for invalid formats
      const invalidIds = parsedIds.filter(id => isNaN(id));
      if (invalidIds.length > 0) {
        errors.push('标签ID格式无效，必须是正整数');
      }

      labelIds = Array.from(new Set(parsedIds.filter(id => !isNaN(id))));

      // MEDIUM-3: Validate empty array after parsing
      if (labelIds.length === 0 && invalidIds.length === 0) {
        errors.push('标签ID列表不能为空');
      }
    }

    if (options.output && !['table', 'json'].includes(options.output)) {
      errors.push('输出格式必须是 "table" 或 "json"');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        errors.join(', '),
        'options',
        options,
        'validation_failed'
      );
    }

    return { viewerIds, labelIds };
  }

  // ===== Private Display Methods =====

  private displayGetResult(result: ViewerRecord | null, options: ViewerGetOptions): void {
    if (!result) {
      this.displayInfo(`未找到观众: ${options.viewerId}`);
      return;
    }

    const output = options.output || 'table';

    if (output === 'json') {
      this.displayData(result, 'json');
    } else {
      // Display as key-value table
      console.log('观众详情:');
      const tableData: Record<string, string> = {
        '观众ID': this.truncate(result.viewerUnionId || '-', 30),
        '昵称': result.nickname || '-',
        '手机号': result.mobile || '-',
        '来源': result.source || '-',
        '姓名': result.name || '-',
        '邮箱': result.email || '-',
        '地区': result.area || '-',
        '观看时长': this.formatDuration(result.watchDuration),
        '观看频道数': result.watchChannelCount?.toString() || '-',
        '创建时间': this.formatTime(result.createTime),
      };
      this.displayAsTable(tableData);
    }
  }

  private displayListResult(result: ListViewerRecordsResponse, options: ViewerListOptions): void {
    const contents = result?.contents || [];
    const totalItems = result?.totalItems || 0;

    if (totalItems === 0) {
      this.displayInfo('未找到观众');
      return;
    }

    const output = options.output || 'table';

    if (output === 'json') {
      this.displayData({
        pageNumber: result.pageNumber,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
        totalItems: result.totalItems,
        contents: contents
      }, 'json');
    } else {
      const tableData = contents.map((item: ViewerRecord) => ({
        '观众ID': this.truncate(item.viewerUnionId || '-', 20),
        '昵称': this.truncate(item.nickname || '-', 20),
        '手机号': item.mobile || '-',
        '来源': item.source || '-',
        '观看时长': this.formatDuration(item.watchDuration),
        '频道数': item.watchChannelCount?.toString() || '-',
        '创建时间': this.formatTime(item.createTime),
      }));

      console.log(`找到 ${totalItems} 个观众`);
      console.log(`页码: ${result.pageNumber}, 每页: ${result.pageSize}`);
      console.log(`总页数: ${result.totalPages}`);
      if (tableData.length > 0) {
        this.displayAsTable(tableData);
      }
    }
  }

  private displayWriteResult(message: string, data: unknown, output?: 'table' | 'json'): void {
    const format = output || 'table';
    if (format === 'json') {
      this.displayData({
        success: true,
        data,
      }, 'json');
    } else {
      this.displaySuccess(message, data, 'table');
    }
  }

  private displayViewerLotteryWins(
    result: ViewerLotteryWinResponse,
    options: ViewerLotteryWinsOptions
  ): void {
    const contents = result?.contents || [];
    const totalItems = result?.totalItems || 0;
    const output = options.output || 'table';

    if (output === 'json') {
      this.displayData(result, 'json');
      return;
    }

    if (totalItems === 0) {
      this.displayInfo('未找到中奖记录');
      return;
    }

    console.log(`找到 ${totalItems} 条中奖记录`);
    console.log(`页码: ${result.pageNumber}, 每页: ${result.pageSize}`);
    this.displayAsTable(contents.map(item => ({
      '频道ID': item.channelId?.toString() || '-',
      '频道名称': this.truncate(item.channelName || '-', 24),
      '活动名称': this.truncate(item.activityName || '-', 24),
      '奖品': this.truncate(item.prize || '-', 24),
      '中奖码': item.winnerCode || '-',
      '已领奖': item.received === undefined ? '-' : (item.received ? '是' : '否'),
      '中奖时间': this.formatTime(item.createdTime),
    })));
  }

  private displayAccountLabels(
    result: { contents?: AccountLabel[]; totalItems?: number; pageNumber?: number; pageSize?: number; totalPages?: number },
    options: ViewerLabelListOptions
  ): void {
    const contents = result?.contents || [];
    const totalItems = result?.totalItems || 0;
    const output = options.output || 'table';

    if (output === 'json') {
      this.displayData(result, 'json');
      return;
    }

    if (totalItems === 0) {
      this.displayInfo('未找到账号标签');
      return;
    }

    console.log(`找到 ${totalItems} 个账号标签`);
    console.log(`页码: ${result.pageNumber}, 每页: ${result.pageSize}`);
    this.displayAsTable(contents.map(item => ({
      '标签ID': item.id?.toString() || '-',
      '标签名称': this.truncate(item.name || '-', 30),
    })));
  }

  // ===== Private Display Methods for Tags =====

  private displayTagListResult(
    result: { contents: ViewerLabel[]; totalItems: number; pageNumber: number; pageSize: number; totalPages: number },
    options: ViewerTagListOptions
  ): void {
    const contents = result?.contents || [];
    const totalItems = result?.totalItems || 0;

    if (totalItems === 0) {
      const message = options.keyword
        ? `未找到包含关键词 "${options.keyword}" 的标签`
        : '未找到标签';
      this.displayInfo(message);
      return;
    }

    const output = options.output || 'table';

    if (output === 'json') {
      this.displayData({
        pageNumber: result.pageNumber,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
        totalItems: result.totalItems,
        contents: contents
      }, 'json');
    } else {
      const tableData = contents.map((item: ViewerLabel) => ({
        '标签ID': item.labelId?.toString() || '-',
        '标签名称': this.truncate(item.labelName || '-', 30),
      }));

      console.log(`找到 ${totalItems} 个标签`);
      console.log(`页码: ${result.pageNumber}, 每页: ${result.pageSize}`);
      if (tableData.length > 0) {
        this.displayAsTable(tableData);
      }
    }
  }

  private displayTagActionResult(
    action: '添加' | '移除',
    summary: BatchOperationSummary,
    options: ViewerTagAddOptions | ViewerTagRemoveOptions
  ): void {
    const output = options.output || 'table';

    if (output === 'json') {
      this.displayData({
        action,
        succeeded: summary.succeeded,
        failed: summary.failed,
        total: summary.total,
        results: summary.results,
      }, 'json');
    } else {
      if (summary.failed === 0) {
        this.displaySuccess(
          `成功${action} ${summary.succeeded} 个操作`
        );
      } else {
        this.displayWarning(
          `${action}完成: 成功 ${summary.succeeded} 个, 失败 ${summary.failed} 个`
        );
        // Show failed operations
        const failures = summary.results.filter(r => !r.success);
        if (failures.length > 0 && failures.length <= 5) {
          for (const f of failures) {
            console.log(`  - 观众 ${f.viewerUnionId}, 标签 ${f.labelId}: ${f.error}`);
          }
        }
      }
    }
  }

  // ===== Private Helper Methods =====

  private normalizeViewerLabel(label: SdkViewerLabel): ViewerLabel {
    return {
      labelId: Number(label.id),
      labelName: label.label,
    };
  }

  private truncate(str: string, maxLength: number): string {
    if (!str) return '-';
    return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
  }

  private formatDuration(seconds: number | undefined): string {
    if (!seconds) return '-';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}小时 ${minutes}分钟`;
    } else if (minutes > 0) {
      return `${minutes}分钟 ${secs}秒`;
    } else {
      return `${secs}秒`;
    }
  }

  /**
   * Format timestamp to localized string
   * LOW-2: Use system locale instead of hardcoded zh-CN
   */
  private formatTime(timestamp: number | undefined): string {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString();
  }
}
