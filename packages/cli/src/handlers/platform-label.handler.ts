/**
 * @fileoverview Platform label command handler for CLI operations
 * @author Development Team
 * @since 13.4.0
 */

import { BaseHandler, OutputFormat } from './base.handler';
import { AuthConfig } from '../types/auth';
import { PolyVValidationError } from '../utils/errors';
import { PlatformLabelServiceSdk } from '../services/platform-label-service';
import {
  PlatformLabelServiceConfig,
  PlatformLabelListOptions,
  PlatformLabelCreateOptions,
  PlatformLabelUpdateOptions,
  PlatformLabelDeleteOptions,
  ViewerLabel,
} from '../types/platform-label';

export type {
  PlatformLabelListOptions,
  PlatformLabelCreateOptions,
  PlatformLabelUpdateOptions,
  PlatformLabelDeleteOptions,
};

/**
 * Handler for platform label-related CLI commands
 */
export class PlatformLabelHandler extends BaseHandler {
  private readonly labelService: PlatformLabelServiceSdk;

  /**
   * Creates a new PlatformLabelHandler instance
   * @param authConfig Authentication configuration
   * @param serviceConfig Service configuration
   */
  constructor(authConfig: AuthConfig, serviceConfig: PlatformLabelServiceConfig) {
    super();
    this.labelService = new PlatformLabelServiceSdk(authConfig, serviceConfig);
  }

  /**
   * List all viewer labels
   * @param options Platform label list options from CLI
   * @returns Promise that resolves when labels are displayed
   *
   * @throws {PolyVError} When API call fails
   */
  async listLabels(options: PlatformLabelListOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      const format: OutputFormat = this.validateOutputFormat(options.output);

      // Call service to list labels
      const labels = await this.labelService.listViewerLabels();

      // Display results
      if (format === 'json') {
        this.displayData(labels, 'json');
      } else {
        this.displayLabelsTable(labels);
      }
    }, 'platformLabel.listLabels');
  }

  /**
   * Create a new viewer label
   * @param options Platform label create options from CLI
   * @returns Promise that resolves when label is created
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async createLabel(options: PlatformLabelCreateOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      const format: OutputFormat = this.validateOutputFormat(options.output);

      // Validate label name
      this.validateLabelName(options.labelName);

      // Call service to create label
      const label = await this.labelService.createViewerLabel({
        labelName: options.labelName,
      });

      // Display results
      if (format === 'json') {
        this.displayData(label, 'json');
      } else {
        this.displaySuccess('标签创建成功');
        this.displayLabelInfo(label);
      }
    }, 'platformLabel.createLabel');
  }

  /**
   * Update a viewer label
   * @param options Platform label update options from CLI
   * @returns Promise that resolves when label is updated
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async updateLabel(options: PlatformLabelUpdateOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      const format: OutputFormat = this.validateOutputFormat(options.output);

      // Validate options
      this.validateLabelId(options.labelId);
      this.validateLabelName(options.labelName);

      // Call service to update label
      await this.labelService.updateViewerLabel({
        labelId: options.labelId,
        labelName: options.labelName,
      });

      // Display results
      if (format === 'json') {
        this.displayData({ success: true }, 'json');
      } else {
        console.log('标签更新成功');
      }
    }, 'platformLabel.updateLabel');
  }

  /**
   * Delete a viewer label
   * @param options Platform label delete options from CLI
   * @returns Promise that resolves when label is deleted
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async deleteLabel(options: PlatformLabelDeleteOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      const format: OutputFormat = this.validateOutputFormat(options.output);

      // Validate label ID
      this.validateLabelId(options.labelId);

      // Call service to delete label
      await this.labelService.deleteViewerLabel({
        labelId: options.labelId,
      });

      // Display results
      if (format === 'json') {
        this.displayData({ success: true }, 'json');
      } else {
        console.log('标签删除成功');
      }
    }, 'platformLabel.deleteLabel');
  }

  // ========================================
  // Private Validation Methods
  // ========================================

  /**
   * Validates output format
   * @param output Output format
   * @returns Validated output format
   * @throws {PolyVValidationError} When validation fails
   */
  private validateOutputFormat(output?: string): OutputFormat {
    if (!output) {
      return 'table';
    }
    if (output !== 'table' && output !== 'json') {
      throw new PolyVValidationError(
        'output 格式必须是 table 或 json',
        'output',
        output,
        'validation_failed'
      );
    }
    return output;
  }

  /**
   * Validates label name
   * @param labelName Label name to validate
   * @throws {PolyVValidationError} When validation fails
   */
  private validateLabelName(labelName: string): void {
    if (!labelName || typeof labelName !== 'string' || labelName.trim().length === 0) {
      throw new PolyVValidationError(
        'labelName 不能为空',
        'labelName',
        labelName,
        'validation_failed'
      );
    }
  }

  /**
   * Validates label ID
   * @param labelId Label ID to validate
   * @throws {PolyVValidationError} When validation fails
   */
  private validateLabelId(labelId: number): void {
    if (labelId === undefined || labelId === null || labelId <= 0 || !Number.isInteger(labelId)) {
      throw new PolyVValidationError(
        'labelId 必须是正整数',
        'labelId',
        labelId,
        'validation_failed'
      );
    }
  }

  // ========================================
  // Private Display Methods
  // ========================================

  /**
   * Displays labels as a formatted table
   * @param labels Labels to display
   */
  private displayLabelsTable(labels: ViewerLabel[]): void {
    if (!labels || labels.length === 0) {
      console.log('暂无标签数据');
      return;
    }

    const tableData = labels.map((label) => ({
      '标签ID': label.labelId,
      '标签名称': label.labelName,
      '创建时间': label.createdTime || '-',
    }));

    this.displayAsTable(tableData);
  }

  /**
   * Displays a single label info
   * @param label Label to display
   */
  private displayLabelInfo(label: ViewerLabel): void {
    const tableData = {
      '标签ID': label.labelId,
      '标签名称': label.labelName,
      '创建时间': label.createdTime || '-',
    };

    this.displayAsTable(tableData);
  }
}
