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
  ViewerTagAddOptions,
  ViewerTagRemoveOptions,
  ViewerTagListOptions,
} from '../types/viewer';
import { AuthConfig } from '../types/auth';
import { PolyVValidationError } from '../utils/errors';
import type {
  ListViewerRecordsParams,
  ListViewerRecordsResponse,
  ViewerRecord,
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

  // ===== Private Validation Methods =====

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
      const parsedIds = options.labelIds
        .split(',')
        .map(id => {
          const trimmed = id.trim();
          if (trimmed === '') return NaN;
          return parseInt(trimmed, 10);
        });

      // Check for invalid formats
      const invalidIds = parsedIds.filter(id => isNaN(id));
      if (invalidIds.length > 0) {
        errors.push('标签ID格式无效，必须是数字');
      }

      labelIds = parsedIds.filter(id => !isNaN(id));

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
