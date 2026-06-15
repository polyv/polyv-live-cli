/**
 * @fileoverview Card-push command handler for CLI operations
 * @author Development Team
 * @since 14.2.0
 */

import { BaseHandler, OutputFormat } from './base.handler';
import { AuthConfig } from '../types/auth';
import { PolyVValidationError } from '../utils/errors';
import { CardPushServiceSdk } from '../services/card-push-service';
import {
  CardPushListOptions,
  CardPushCreateOptions,
  CardPushUpdateOptions,
  CardPushPushOptions,
  CardPushCancelOptions,
  CardPushDeleteOptions,
  CardPushServiceConfig,
  CardPush,
  CreatedCardPush,
} from '../types/card-push';

export type {
  CardPushListOptions,
  CardPushCreateOptions,
  CardPushUpdateOptions,
  CardPushPushOptions,
  CardPushCancelOptions,
  CardPushDeleteOptions,
};

/**
 * Handler for card-push-related CLI commands
 */
export class CardPushHandler extends BaseHandler {
  private readonly cardPushService: CardPushServiceSdk;

  /**
   * Creates a new CardPushHandler instance
   * @param authConfig Authentication configuration
   * @param serviceConfig Service configuration
   */
  constructor(authConfig: AuthConfig, serviceConfig: CardPushServiceConfig) {
    super();
    this.cardPushService = new CardPushServiceSdk(authConfig, serviceConfig);
  }

  /**
   * Lists all card-pushes for a channel
   * @param options List options from CLI
   * @returns Promise that resolves when list is displayed
   */
  async listCardPushes(options: CardPushListOptions): Promise<void> {
    const format: OutputFormat = options.output || 'table';

    // Validate options
    this.validateListOptions(options);

    // Call service to get card-pushes
    const cardPushes = await this.cardPushService.listCardPushes(options.channelId);

    // Display results
    if (format === 'json') {
      this.displayData(cardPushes, 'json');
    } else {
      this.displayCardPushesTable(cardPushes);
    }
  }

  /**
   * Creates a new card-push
   * @param options Create options from CLI
   * @returns Promise that resolves when creation is displayed
   */
  async createCardPush(options: CardPushCreateOptions): Promise<void> {
    const format: OutputFormat = options.output || 'table';

    // Validate options
    this.validateCreateOptions(options);

    // Call service to create card-push
    const createdCardPush = await this.cardPushService.createCardPush({
      channelId: options.channelId,
      cardType: options.cardType,
      imageType: options.imageType,
      title: options.title,
      link: options.link,
      duration: options.duration,
      durationPosition: options.durationPosition,
      showCondition: options.showCondition,
      conditionValue: options.conditionValue,
      conditionUnit: options.conditionUnit,
      countdownMsg: options.countdownMsg,
      enterEnabled: options.enterEnabled,
      linkEnabled: options.linkEnabled,
      redirectType: options.redirectType,
    });

    // Display results
    if (format === 'json') {
      this.displayData(createdCardPush, 'json');
    } else {
      this.displayCreatedCardPushTable(createdCardPush);
    }
  }

  /**
   * Updates an existing card-push
   * @param options Update options from CLI
   * @returns Promise that resolves when update is complete
   */
  async updateCardPush(options: CardPushUpdateOptions): Promise<void> {
    const format: OutputFormat = options.output || 'table';

    // Validate options
    this.validateUpdateOptions(options);

    // Call service to update card-push
    await this.cardPushService.updateCardPush({
      channelId: options.channelId,
      cardPushId: options.cardPushId,
      cardType: options.cardType,
      imageType: options.imageType,
      title: options.title,
      link: options.link,
      duration: options.duration,
      durationPosition: options.durationPosition,
      showCondition: options.showCondition,
      conditionValue: options.conditionValue,
      conditionUnit: options.conditionUnit,
      countdownMsg: options.countdownMsg,
      enterEnabled: options.enterEnabled,
      linkEnabled: options.linkEnabled,
      redirectType: options.redirectType,
    });

    // Display success message
    const successMsg = 'Card-push updated successfully (卡片推送更新成功)';
    if (format === 'json') {
      this.displayData({ success: true, message: successMsg }, 'json');
    } else {
      console.log(successMsg);
    }
  }

  /**
   * Pushes a card to viewers
   * @param options Push options from CLI
   * @returns Promise that resolves when push is complete
   */
  async pushCard(options: CardPushPushOptions): Promise<void> {
    const format: OutputFormat = options.output || 'table';

    // Validate options
    this.validatePushOptions(options);

    // Call service to push card
    await this.cardPushService.pushCard({
      channelId: options.channelId,
      cardPushId: options.cardPushId,
    });

    // Display success message
    const successMsg = 'Card pushed successfully (卡片推送成功)';
    if (format === 'json') {
      this.displayData({ success: true, message: successMsg }, 'json');
    } else {
      console.log(successMsg);
    }
  }

  /**
   * Cancels a pushing card
   * @param options Cancel options from CLI
   * @returns Promise that resolves when cancel is complete
   */
  async cancelPush(options: CardPushCancelOptions): Promise<void> {
    const format: OutputFormat = options.output || 'table';

    // Validate options
    this.validateCancelOptions(options);

    // Call service to cancel push
    await this.cardPushService.cancelPush({
      channelId: options.channelId,
      cardPushId: options.cardPushId,
    });

    // Display success message
    const successMsg = 'Card push cancelled successfully (卡片推送已取消)';
    if (format === 'json') {
      this.displayData({ success: true, message: successMsg }, 'json');
    } else {
      console.log(successMsg);
    }
  }

  /**
   * Deletes a card-push
   * @param options Delete options from CLI
   * @returns Promise that resolves when delete is complete
   */
  async deleteCardPush(options: CardPushDeleteOptions): Promise<void> {
    const format: OutputFormat = options.output || 'table';

    // Validate options
    this.validateDeleteOptions(options);

    // Call service to delete card-push
    await this.cardPushService.deleteCardPush({
      channelId: options.channelId,
      cardPushId: options.cardPushId,
    });

    // Display success message
    const successMsg = 'Card-push deleted successfully (卡片推送已删除)';
    if (format === 'json') {
      this.displayData({ success: true, message: successMsg }, 'json');
    } else {
      console.log(successMsg);
    }
  }

  // ========================================
  // Private validation methods
  // ========================================

  private validateListOptions(options: CardPushListOptions): void {
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

  private validateCreateOptions(options: CardPushCreateOptions): void {
    if (!options.channelId || options.channelId.trim() === '') {
      throw new PolyVValidationError(
        'channelId is required (频道ID是必需的)',
        'channelId',
        options.channelId,
        'required'
      );
    }

    if (!options.imageType) {
      throw new PolyVValidationError(
        'imageType is required (卡片样式类型是必需的)',
        'imageType',
        options.imageType,
        'required'
      );
    }

    const validImageTypes = ['giftbox', 'redpack', 'custom', 'weixinWork'];
    if (!validImageTypes.includes(options.imageType)) {
      throw new PolyVValidationError(
        `imageType must be one of: ${validImageTypes.join(', ')} (卡片样式类型必须是: ${validImageTypes.join(', ')})`,
        'imageType',
        options.imageType,
        'invalid_value'
      );
    }

    if (!options.title || options.title.trim() === '') {
      throw new PolyVValidationError(
        'title is required (卡片标题是必需的)',
        'title',
        options.title,
        'required'
      );
    }

    if (options.title.length > 16) {
      throw new PolyVValidationError(
        'title cannot exceed 16 characters (卡片标题不能超过16个字符)',
        'title',
        options.title,
        'invalid_length'
      );
    }

    if (!options.link || options.link.trim() === '') {
      throw new PolyVValidationError(
        'link is required (卡片链接是必需的)',
        'link',
        options.link,
        'required'
      );
    }

    if (!options.link.startsWith('http://') && !options.link.startsWith('https://')) {
      throw new PolyVValidationError(
        'link must start with http:// or https:// (卡片链接必须以 http:// 或 https:// 开头)',
        'link',
        options.link,
        'invalid_format'
      );
    }

    if (options.duration === undefined || options.duration === null) {
      throw new PolyVValidationError(
        'duration is required (卡片倒计时时长是必需的)',
        'duration',
        options.duration,
        'required'
      );
    }

    const validDurations = [0, 5, 10, 20, 30];
    if (!validDurations.includes(options.duration)) {
      throw new PolyVValidationError(
        `duration must be one of: ${validDurations.join(', ')} (卡片倒计时时长必须是: ${validDurations.join(', ')})`,
        'duration',
        options.duration,
        'invalid_value'
      );
    }

    if (!options.showCondition) {
      throw new PolyVValidationError(
        'showCondition is required (弹出方式是必需的)',
        'showCondition',
        options.showCondition,
        'required'
      );
    }

    const validShowConditions = ['PUSH', 'WATCH'];
    if (!validShowConditions.includes(options.showCondition)) {
      throw new PolyVValidationError(
        `showCondition must be one of: ${validShowConditions.join(', ')} (弹出方式必须是: ${validShowConditions.join(', ')})`,
        'showCondition',
        options.showCondition,
        'invalid_value'
      );
    }

    if (options.showCondition === 'WATCH') {
      if (!options.conditionUnit) {
        throw new PolyVValidationError(
          'conditionUnit is required when showCondition is WATCH (弹出方式为WATCH时观看时长单位是必需的)',
          'conditionUnit',
          options.conditionUnit,
          'required'
        );
      }

      const validConditionUnits = ['SECONDS', 'MINUTES'];
      if (!validConditionUnits.includes(options.conditionUnit)) {
        throw new PolyVValidationError(
          `conditionUnit must be one of: ${validConditionUnits.join(', ')} (观看时长单位必须是: ${validConditionUnits.join(', ')})`,
          'conditionUnit',
          options.conditionUnit,
          'invalid_value'
        );
      }
    }

    if (options.countdownMsg && options.countdownMsg.length > 8) {
      throw new PolyVValidationError(
        'countdownMsg cannot exceed 8 characters (倒计时文案不能超过8个字符)',
        'countdownMsg',
        options.countdownMsg,
        'invalid_length'
      );
    }
  }

  private validateUpdateOptions(options: CardPushUpdateOptions): void {
    if (!options.channelId || options.channelId.trim() === '') {
      throw new PolyVValidationError(
        'channelId is required (频道ID是必需的)',
        'channelId',
        options.channelId,
        'required'
      );
    }

    if (!options.cardPushId || options.cardPushId.trim() === '') {
      throw new PolyVValidationError(
        'cardPushId is required (卡片推送ID是必需的)',
        'cardPushId',
        options.cardPushId,
        'required'
      );
    }

    if (options.title && options.title.length > 16) {
      throw new PolyVValidationError(
        'title cannot exceed 16 characters (卡片标题不能超过16个字符)',
        'title',
        options.title,
        'invalid_length'
      );
    }

    if (options.link && !options.link.startsWith('http://') && !options.link.startsWith('https://')) {
      throw new PolyVValidationError(
        'link must start with http:// or https:// (卡片链接必须以 http:// 或 https:// 开头)',
        'link',
        options.link,
        'invalid_format'
      );
    }

    if (options.duration !== undefined) {
      const validDurations = [0, 5, 10, 20, 30];
      if (!validDurations.includes(options.duration)) {
        throw new PolyVValidationError(
          `duration must be one of: ${validDurations.join(', ')} (卡片倒计时时长必须是: ${validDurations.join(', ')})`,
          'duration',
          options.duration,
          'invalid_value'
        );
      }
    }

    if (options.showCondition) {
      const validShowConditions = ['PUSH', 'WATCH'];
      if (!validShowConditions.includes(options.showCondition)) {
        throw new PolyVValidationError(
          `showCondition must be one of: ${validShowConditions.join(', ')} (弹出方式必须是: ${validShowConditions.join(', ')})`,
          'showCondition',
          options.showCondition,
          'invalid_value'
        );
      }
    }

    if (options.showCondition === 'WATCH' && options.conditionUnit) {
      const validConditionUnits = ['SECONDS', 'MINUTES'];
      if (!validConditionUnits.includes(options.conditionUnit)) {
        throw new PolyVValidationError(
          `conditionUnit must be one of: ${validConditionUnits.join(', ')} (观看时长单位必须是: ${validConditionUnits.join(', ')})`,
          'conditionUnit',
          options.conditionUnit,
          'invalid_value'
        );
      }
    }

    if (options.countdownMsg && options.countdownMsg.length > 8) {
      throw new PolyVValidationError(
        'countdownMsg cannot exceed 8 characters (倒计时文案不能超过8个字符)',
        'countdownMsg',
        options.countdownMsg,
        'invalid_length'
      );
    }
  }

  private validatePushOptions(options: CardPushPushOptions): void {
    if (!options.channelId || options.channelId.trim() === '') {
      throw new PolyVValidationError(
        'channelId is required (频道ID是必需的)',
        'channelId',
        options.channelId,
        'required'
      );
    }

    if (!options.cardPushId || options.cardPushId.trim() === '') {
      throw new PolyVValidationError(
        'cardPushId is required (卡片推送ID是必需的)',
        'cardPushId',
        options.cardPushId,
        'required'
      );
    }
  }

  private validateCancelOptions(options: CardPushCancelOptions): void {
    if (!options.channelId || options.channelId.trim() === '') {
      throw new PolyVValidationError(
        'channelId is required (频道ID是必需的)',
        'channelId',
        options.channelId,
        'required'
      );
    }

    if (!options.cardPushId || options.cardPushId.trim() === '') {
      throw new PolyVValidationError(
        'cardPushId is required (卡片推送ID是必需的)',
        'cardPushId',
        options.cardPushId,
        'required'
      );
    }
  }

  private validateDeleteOptions(options: CardPushDeleteOptions): void {
    if (!options.channelId || options.channelId.trim() === '') {
      throw new PolyVValidationError(
        'channelId is required (频道ID是必需的)',
        'channelId',
        options.channelId,
        'required'
      );
    }

    if (!options.cardPushId || options.cardPushId.trim() === '') {
      throw new PolyVValidationError(
        'cardPushId is required (卡片推送ID是必需的)',
        'cardPushId',
        options.cardPushId,
        'required'
      );
    }
  }

  // ========================================
  // Private display methods
  // ========================================

  private displayCardPushesTable(cardPushes: CardPush[]): void {
    if (cardPushes.length === 0) {
      console.log('No card-pushes found (未找到卡片推送)');
      return;
    }

    const tableData = cardPushes.map((cardPush) => {
      return {
        '卡片推送ID': cardPush.id,
        '卡片标题': cardPush.title,
        '卡片样式': cardPush.imageType,
        '推送状态': this.getPushStatusText(cardPush.pushStatus),
        '弹出方式': cardPush.showCondition,
        '创建时间': this.formatTimestamp(cardPush.createdTime),
      };
    });

    this.displayAsTable(tableData);
  }

  private displayCreatedCardPushTable(cardPush: CreatedCardPush): void {
    const tableData = [
      {
        '卡片推送ID': cardPush.id,
        '卡片标题': cardPush.title,
        '卡片样式': cardPush.imageType,
        '弹出方式': cardPush.showCondition,
        '创建时间': this.formatTimestamp(cardPush.createdTime),
      },
    ];

    this.displayAsTable(tableData);
  }

  private getPushStatusText(status: 'Y' | 'N' | 'L'): string {
    const statusMap: Record<'Y' | 'N' | 'L', string> = {
      Y: '推送中',
      N: '未推送',
      L: '上次推送',
    };
    return statusMap[status];
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
