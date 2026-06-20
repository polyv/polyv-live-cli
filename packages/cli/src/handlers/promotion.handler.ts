/**
 * @fileoverview Promotion command handler for CLI operations
 * @author Development Team
 * @since 14.1.0
 */

import { BaseHandler, OutputFormat } from './base.handler';
import { AuthConfig } from '../types/auth';
import { PolyVValidationError } from '../utils/errors';
import { confirmWrite } from '../utils/api-command';
import { PromotionServiceSdk } from '../services/promotion-service';
import {
  PromotionListOptions,
  PromotionCreateOptions,
  PromotionServiceConfig,
  PromotionChannel,
  CreatedPromotion,
} from '../types/promotion';

export type { PromotionListOptions, PromotionCreateOptions };

/**
 * Handler for promotion-related CLI commands
 */
export class PromotionHandler extends BaseHandler {
  private readonly promotionService: PromotionServiceSdk;

  /**
   * Creates a new PromotionHandler instance
   * @param authConfig Authentication configuration
   * @param serviceConfig Service configuration
   */
  constructor(authConfig: AuthConfig, serviceConfig: PromotionServiceConfig) {
    super();
    this.promotionService = new PromotionServiceSdk(authConfig, serviceConfig);
  }

  /**
   * Lists all promotion channels for a channel
   * @param options List options from CLI
   * @returns Promise that resolves when list is displayed
   */
  async listPromotions(options: PromotionListOptions): Promise<void> {
    const format: OutputFormat = options.output || 'table';

    // Validate options
    this.validateListOptions(options);

    // Call service to get promotions
    const promotions = await this.promotionService.listPopularizations(options.channelId);

    // Display results
    if (format === 'json') {
      this.displayData(promotions, 'json');
    } else {
      this.displayPromotionsTable(promotions);
    }
  }

  /**
   * Batch creates promotion channels for a channel
   * @param options Create options from CLI
   * @returns Promise that resolves when creation is displayed
   */
  async createPromotions(options: PromotionCreateOptions): Promise<void> {
    const format: OutputFormat = options.output || 'table';

    // Validate options
    this.validateCreateOptions(options);

    await confirmWrite(
      options.force,
      `Create ${options.names.length} promotion channel(s) for channel ${options.channelId}?`
    );

    // Call service to create promotions
    const createdPromotions = await this.promotionService.batchCreatePopularizations({
      channelId: options.channelId,
      names: options.names,
    });

    // Display results
    if (format === 'json') {
      this.displayData(createdPromotions, 'json');
    } else {
      this.displayCreatedPromotionsTable(createdPromotions);
    }
  }

  // ========================================
  // Private validation methods
  // ========================================

  private validateListOptions(options: PromotionListOptions): void {
    if (!options.channelId || options.channelId.trim() === '') {
      throw new PolyVValidationError(
        'channelId is required (频道ID是必需的)',
        'channelId',
        options.channelId,
        'required'
      );
    }

    if (options.output && options.output !== 'table' && options.output !== 'json') {
      throw new PolyVValidationError(
        'output format must be table or json (输出格式必须是 table 或 json)',
        'output',
        options.output,
        'invalid_format'
      );
    }
  }

  private validateCreateOptions(options: PromotionCreateOptions): void {
    if (!options.channelId || options.channelId.trim() === '') {
      throw new PolyVValidationError(
        'channelId is required (频道ID是必需的)',
        'channelId',
        options.channelId,
        'required'
      );
    }

    if (!options.names || options.names.length === 0) {
      throw new PolyVValidationError(
        'names is required and cannot be empty (推广渠道名称是必需的且不能为空)',
        'names',
        options.names,
        'required'
      );
    }

    // Check for empty names in the array
    for (const name of options.names) {
      if (!name || name.trim() === '') {
        throw new PolyVValidationError(
          'names cannot contain empty strings (推广渠道名称不能包含空字符串)',
          'names',
          options.names,
          'invalid_value'
        );
      }
    }

    // Check for name length
    for (const name of options.names) {
      if (name.length > 20) {
        throw new PolyVValidationError(
          'each name cannot exceed 20 characters (每个名称不能超过20个字符)',
          'names',
          options.names,
          'invalid_length'
        );
      }
    }
  }

  // ========================================
  // Private display methods
  // ========================================

  private displayPromotionsTable(promotions: PromotionChannel[]): void {
    if (promotions.length === 0) {
      console.log('No promotions found (未找到推广渠道)');
      return;
    }

    const tableData = promotions.map((promotion) => {
      return {
        '推广ID': promotion.promoteId,
        '推广名称': promotion.popularizationName,
        '访问次数': promotion.visitsNum,
        '观看人数': promotion.viewerNum,
        '创建时间': this.formatTimestamp(promotion.createdTime),
      };
    });

    this.displayAsTable(tableData);
  }

  private displayCreatedPromotionsTable(promotions: CreatedPromotion[]): void {
    if (promotions.length === 0) {
      console.log('No promotions created (未创建推广渠道)');
      return;
    }

    const tableData = promotions.map((promotion) => {
      return {
        '推广ID': promotion.promoteId,
        '推广名称': promotion.popularizationName,
      };
    });

    this.displayAsTable(tableData);
  }

  private formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }
}
