/**
 * @fileoverview Transmit command handler for CLI operations
 * @author Development Team
 * @since 14.3.0
 */

import { BaseHandler, OutputFormat } from './base.handler';
import { AuthConfig } from '../types/auth';
import { PolyVValidationError } from '../utils/errors';
import { confirmWrite } from '../utils/api-command';
import { TransmitServiceSdk } from '../services/transmit-service';
import {
  TransmitServiceConfig,
  TransmitCreateOptions,
  TransmitListOptions,
  TransmitChannelInfo,
  TransmitAssociation,
} from '../types/transmit';

export type { TransmitCreateOptions, TransmitListOptions };

/**
 * Handler for transmit-related CLI commands
 */
export class TransmitHandler extends BaseHandler {
  private readonly transmitService: TransmitServiceSdk;

  /**
   * Creates a new TransmitHandler instance
   * @param authConfig Authentication configuration
   * @param serviceConfig Service configuration
   */
  constructor(authConfig: AuthConfig, serviceConfig?: TransmitServiceConfig) {
    super();
    this.transmitService = new TransmitServiceSdk(authConfig, serviceConfig);
  }

  /**
   * Batch creates transmit channels
   * @param options Create options from CLI
   * @returns Promise that resolves when creation is displayed
   */
  async batchCreateTransmitChannels(options: TransmitCreateOptions): Promise<void> {
    const format: OutputFormat = options.output || 'table';

    // Validate options
    this.validateChannelId(options.channelId);
    this.validateNames(options.names);

    // Parse names string into array
    const namesArray = options.names.split(',').map(name => name.trim()).filter(name => name.length > 0);

    // Call service to create transmit channels
    const createdChannels = await this.transmitService.batchCreateTransmitChannels(
      options.channelId,
      namesArray
    );

    // Display results
    if (format === 'json') {
      this.displayData(createdChannels, 'json');
    } else {
      this.displayCreatedChannelsTable(createdChannels);
    }
  }

  /**
   * Gets transmit associations
   * @param options List options from CLI
   * @returns Promise that resolves when list is displayed
   */
  async getTransmitAssociations(options: TransmitListOptions): Promise<void> {
    const format: OutputFormat = options.output || 'table';

    // Validate options
    this.validateChannelId(options.channelId);

    // Call service to get associations
    const associations = await this.transmitService.getTransmitAssociations(options.channelId);

    // Display results
    if (format === 'json') {
      this.displayData(associations, 'json');
    } else {
      this.displayAssociationsTable(associations);
    }
  }

  async associationReceiveChannels(options: {
    channelId: string;
    receiveChannelIds: string[];
    type?: 'add' | 'cancel';
    force?: boolean;
    output?: OutputFormat;
  }): Promise<void> {
    const format: OutputFormat = options.output || 'table';
    this.validateChannelId(options.channelId);

    if (!options.receiveChannelIds || options.receiveChannelIds.length === 0) {
      throw new PolyVValidationError(
        'receiveChannelIds is required (接收频道ID是必需的)',
        'receiveChannelIds',
        options.receiveChannelIds,
        'required'
      );
    }

    await confirmWrite(
      options.force,
      `${options.type === 'cancel' ? 'Cancel' : 'Add'} transmit association(s) for channel ${options.channelId}?`
    );

    const associationOptions: {
      channelId: string;
      receiveChannelIds: string[];
      type?: 'add' | 'cancel';
    } = {
      channelId: options.channelId,
      receiveChannelIds: options.receiveChannelIds,
    };
    if (options.type) {
      associationOptions.type = options.type;
    }

    const result = await this.transmitService.associationReceiveChannels(associationOptions);

    if (format === 'json') {
      this.displayData({ success: true, receiveChannelIds: result }, 'json');
    } else {
      this.displaySuccess('Transmit associations updated successfully', {
        channelId: options.channelId,
        receiveChannelIds: result,
      }, 'table');
    }
  }

  // ========================================
  // Public validation methods
  // ========================================

  /**
   * Validates channel ID
   * @param channelId Channel ID to validate
   * @throws {PolyVValidationError} When channelId is invalid
   */
  validateChannelId(channelId: string): void {
    if (!channelId || channelId.trim() === '') {
      throw new PolyVValidationError(
        'channelId is required (频道ID是必需的)',
        'channelId',
        channelId,
        'required'
      );
    }
  }

  /**
   * Validates names string
   * @param names Names string to validate
   * @throws {PolyVValidationError} When names is invalid
   */
  validateNames(names: string): void {
    if (!names || names.trim() === '') {
      throw new PolyVValidationError(
        'names is required (频道名称是必需的)',
        'names',
        names,
        'required'
      );
    }

    const namesArray = names.split(',').map(name => name.trim()).filter(name => name.length > 0);
    if (namesArray.length === 0) {
      throw new PolyVValidationError(
        'names must contain at least one valid name (频道名称必须包含至少一个有效名称)',
        'names',
        names,
        'invalid'
      );
    }

    if (namesArray.length > 100) {
      throw new PolyVValidationError(
        'names count exceeds maximum of 100 (频道名称数量超过最大值100)',
        'names',
        names,
        'exceed_maximum'
      );
    }
  }

  // ========================================
  // Private display methods
  // ========================================

  private displayCreatedChannelsTable(channels: TransmitChannelInfo[]): void {
    if (channels.length === 0) {
      console.log('No transmit channels created (未创建转播频道)');
      return;
    }

    const tableData = channels.map((channel) => {
      return {
        '频道号': channel.channelId,
        '频道名称': channel.name,
        '频道密码': channel.channelPasswd,
        '观看条件': channel.authType,
        '推流方式': channel.streamType,
        '状态': channel.status,
      };
    });

    this.displayAsTable(tableData);

    console.log(`\nCreated ${channels.length} transmit channel(s) successfully (成功创建 ${channels.length} 个转播频道)`);
  }

  private displayAssociationsTable(associations: TransmitAssociation[]): void {
    if (associations.length === 0) {
      console.log('No transmit associations found (未找到转播关联)');
      return;
    }

    const tableData = associations.map((assoc) => {
      return {
        '发起转播频道号': assoc.channelId || '-',
        '接收转播频道号': assoc.receiveChannelId,
      };
    });

    this.displayAsTable(tableData);
  }
}
