/**
 * @fileoverview Player command handler for CLI operations
 * @author Development Team
 * @since 10.5.0
 */

import { BaseHandler, OutputFormat } from './base.handler';
import { PlayerServiceSdk } from '../services/player.service.sdk';
import {
  PlayerServiceConfig,
  PlayerConfigGetOptions,
  PlayerConfigUpdateOptions,
  PlayerDecorateDisplayItem,
} from '../types/player';
import { AuthConfig } from '../types/auth';
import { PolyVValidationError } from '../utils/errors';
import { apiParams, confirmWrite } from '../utils/api-command';

/**
 * Interface for player service (enables dependency injection)
 */
export interface IPlayerService {
  getChannelDecorate(options: PlayerConfigGetOptions): Promise<PlayerDecorateDisplayItem>;
  updateChannelDecorate(options: PlayerConfigUpdateOptions): Promise<{ success: boolean; updatedFields: string[] }>;
  getAntiRecordSettings(channelId?: string | number): Promise<any>;
  setAntiRecordSettings(channelId: string | number, params: any): Promise<any>;
  setMarqueeUrl(channelId: string | number, params: any): Promise<any>;
  updateHeadAdvert(channelId: string | number, params: any): Promise<any>;
  updateStopAdvert(channelId: string | number, params: any): Promise<any>;
  getWatchFeedbackList(params: any): Promise<any>;
  updatePlayerLogo(channelId: string | number, params: any): Promise<any>;
}

/**
 * Handler for player-related CLI commands
 */
export class PlayerHandler extends BaseHandler {
  private readonly playerService: IPlayerService;

  /**
   * Creates a new PlayerHandler instance
   * @param authConfig Authentication configuration
   * @param serviceConfig Service configuration
   * @param playerService Optional injected player service (for testing)
   */
  constructor(
    authConfig: AuthConfig,
    serviceConfig: PlayerServiceConfig,
    playerService?: IPlayerService
  ) {
    super();
    this.playerService = playerService ?? new PlayerServiceSdk(authConfig, serviceConfig);
  }

  /**
   * Get player configuration for a channel
   * @param options Player config get options from CLI
   * @returns Promise that resolves when player config is displayed
   *
   * @throws {PolyVValidationError} When options are invalid
   * @throws {PolyVError} When API call fails
   *
   * @example
   * ```typescript
   * await playerHandler.getConfig({
   *   channelId: '3151318',
   *   output: 'table'
   * });
   * ```
   */
  async getConfig(options: PlayerConfigGetOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Call SDK service to get player config
      const config = await this.playerService.getChannelDecorate(options);

      // Display results
      this.displayConfig(config, options.channelId, options.output);
    }, 'player.config.get');
  }

  /**
   * Displays player configuration in the specified format
   * @param config Player decorate display item
   * @param channelId Channel ID for context
   * @param format Output format (table or json)
   */
  private displayConfig(
    config: PlayerDecorateDisplayItem,
    channelId: string,
    format: OutputFormat = 'table'
  ): void {
    // Display context info
    this.displayInfo(`播放器配置`);
    this.displayInfo(`频道号: ${channelId}`);

    // Display config in the requested format
    if (format === 'json') {
      this.displayData(config, 'json');
    } else {
      this.displayConfigTable(config);
    }
  }

  /**
   * Displays player configuration as formatted tables
   * @param config Player decorate display item
   */
  private displayConfigTable(config: PlayerDecorateDisplayItem): void {
    // Watermark settings table
    this.displayInfo('\n水印设置 (watermark):');
    const watermarkTable = [
      { '配置项 (field)': '水印开关 (watermarkEnabled)', '值': `${config.watermarkEnabled} (${config.watermarkEnabled === 'Y' ? '开启' : '关闭'})` },
      { '配置项 (field)': '水印图片 (watermarkUrl)', '值': config.watermarkUrl || '-' },
      { '配置项 (field)': '水印位置 (watermarkPosition)', '值': `${config.watermarkPosition} (${this.getPositionLabel(config.watermarkPosition)})` },
      { '配置项 (field)': '水印透明度 (watermarkOpacity)', '值': config.watermarkOpacity },
      { '配置项 (field)': '水印链接 (watermarkLink)', '值': config.watermarkLink || '-' },
    ];
    this.displayAsTable(watermarkTable);

    // Warmup settings table
    this.displayInfo('\n暖场设置 (warmup):');
    const warmupTable = [
      { '配置项 (field)': '暖场开关 (warmupEnabled)', '值': `${config.warmupEnabled} (${config.warmupEnabled === 'Y' ? '开启' : '关闭'})` },
      { '配置项 (field)': '暖场图片 (warmupImageUrl)', '值': config.warmupImageUrl || '-' },
      { '配置项 (field)': '封面跳转 (coverJumpUrl)', '值': config.coverJumpUrl || '-' },
      { '配置项 (field)': '背景图片 (backgroundImageUrl)', '值': config.backgroundImageUrl || '-' },
    ];
    this.displayAsTable(warmupTable);

    // View data table
    this.displayInfo('\n观看数据 (view data):');
    const viewDataTable = [
      { '配置项 (field)': '基础观看次数 (basePv)', '值': config.basePv },
      { '配置项 (field)': '实际观看次数 (actualPv)', '值': config.actualPv },
    ];
    this.displayAsTable(viewDataTable);
  }

  /**
   * Get position label from position code
   * @param position Position code (tl/tr/bl/br)
   * @returns Human-readable position label
   */
  private getPositionLabel(position: string): string {
    const positionMap: Record<string, string> = {
      'tl': '左上角',
      'tr': '右上角',
      'bl': '左下角',
      'br': '右下角',
    };
    return positionMap[position] || position;
  }

  /**
   * Update player configuration for a channel
   * @param options Player config update options from CLI
   * @returns Promise that resolves when player config is updated
   *
   * @throws {PolyVValidationError} When options are invalid
   * @throws {PolyVError} When API call fails
   *
   * @example
   * ```typescript
   * await playerHandler.updateConfig({
   *   channelId: '3151318',
   *   watermarkEnabled: 'Y',
   *   watermarkUrl: 'http://example.com/logo.png',
   *   output: 'table'
   * });
   * ```
   */
  async updateConfig(options: PlayerConfigUpdateOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Call SDK service to update player config
      const result = await this.playerService.updateChannelDecorate(options);

      // Display results
      this.displayUpdateResult(result, options.channelId, options.output);
    }, 'player.config.update');
  }

  async getAntiRecord(options: any): Promise<void> {
    this.requireFields(options, ['channelId']);
    this.displayData(await this.playerService.getAntiRecordSettings(options.channelId), options.output || 'table');
  }

  async updateAntiRecord(options: any): Promise<void> {
    this.requireFields(options, ['channelId', 'antiRecordType', 'modelType', 'content', 'fontSize']);
    const params = apiParams({ ...options, channelId: undefined });
    await confirmWrite(options.force, `Update anti-record settings for channel ${options.channelId}?`);
    this.displayData(
      { success: true, result: await this.playerService.setAntiRecordSettings(options.channelId, params) },
      options.output || 'table'
    );
  }

  async setMarqueeUrl(options: any): Promise<void> {
    this.requireFields(options, ['channelId', 'marqueeRestrict']);
    const params = apiParams({ ...options, channelId: undefined });
    await confirmWrite(options.force, `Update marquee URL for channel ${options.channelId}?`);
    this.displayData(
      { success: true, result: await this.playerService.setMarqueeUrl(options.channelId, params) },
      options.output || 'table'
    );
  }

  async updateHeadAdvert(options: any): Promise<void> {
    this.requireFields(options, ['channelId', 'headAdvertType']);
    const params = apiParams({ ...options, channelId: undefined });
    await confirmWrite(options.force, `Update head advert for channel ${options.channelId}?`);
    this.displayData(
      { success: true, result: await this.playerService.updateHeadAdvert(options.channelId, params) },
      options.output || 'table'
    );
  }

  async updateStopAdvert(options: any): Promise<void> {
    this.requireFields(options, ['channelId']);
    const params = apiParams({ ...options, channelId: undefined });
    await confirmWrite(options.force, `Update stop advert for channel ${options.channelId}?`);
    this.displayData(
      { success: true, result: await this.playerService.updateStopAdvert(options.channelId, params) },
      options.output || 'table'
    );
  }

  async listWatchFeedback(options: any): Promise<void> {
    this.displayData(await this.playerService.getWatchFeedbackList(apiParams(options)), options.output || 'table');
  }

  async updateLogo(options: any): Promise<void> {
    this.requireFields(options, ['channelId', 'logoImage']);
    const params = apiParams({ ...options, channelId: undefined });
    await confirmWrite(options.force, `Update player logo for channel ${options.channelId}?`);
    this.displayData(
      { success: await this.playerService.updatePlayerLogo(options.channelId, params), channelId: options.channelId },
      options.output || 'table'
    );
  }

  private requireFields(options: Record<string, unknown>, fields: string[]): void {
    const missing = fields.filter((field) => options[field] === undefined || options[field] === null || options[field] === '');
    if (missing.length > 0) {
      throw new PolyVValidationError(
        `Missing required option(s): ${missing.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  /**
   * Displays update result in the specified format
   * @param result Update result with success status and updated fields
   * @param channelId Channel ID for context
   * @param format Output format (table or json)
   */
  private displayUpdateResult(
    result: { success: boolean; updatedFields: string[] },
    channelId: string,
    format: OutputFormat = 'table'
  ): void {
    // Display success message
    this.displayInfo(`播放器配置更新${result.success ? 'success' : '失败'}`);
    this.displayInfo(`频道号: ${channelId}`);

    if (format === 'json') {
      this.displayData(result, 'json');
    } else {
      // Display updated fields
      if (result.updatedFields.length > 0) {
        this.displayInfo('\n已更新:');
        result.updatedFields.forEach((field) => {
          this.displayInfo(`- ${field}`);
        });
      }
    }
  }
}
