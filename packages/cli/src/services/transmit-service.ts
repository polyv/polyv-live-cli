/**
 * @fileoverview Transmit service SDK wrapper
 * @author Development Team
 * @since 14.3.0
 */

import { PolyVClient } from 'polyv-live-api-sdk';
import { AuthConfig } from '../types/auth';
import {
  TransmitServiceConfig,
  TransmitChannelInfo,
  TransmitAssociation,
} from '../types/transmit';

/**
 * SDK wrapper for transmit operations
 */
export class TransmitServiceSdk {
  private readonly client: PolyVClient;
  private readonly channel: PolyVClient['channel'];

  /**
   * Creates a new TransmitServiceSdk instance
   * @param authConfig Authentication configuration
   * @param config Optional service configuration (defaults to standard PolyV API settings)
   */
  constructor(authConfig: AuthConfig, config?: TransmitServiceConfig) {
    this.client = new PolyVClient({
      appId: authConfig.appId,
      appSecret: authConfig.appSecret,
      baseUrl: config?.baseUrl || 'https://api.polyv.net',
    });
    this.channel = this.client.channel;
  }

  /**
   * Batch creates transmit channels
   * @param channelId Source channel ID (the channel that initiates transmit)
   * @param names Array of names for the receive channels
   * @returns Promise that resolves with created channel information
   */
  async batchCreateTransmitChannels(channelId: string, names: string[]): Promise<TransmitChannelInfo[]> {
    if (!channelId || channelId.trim() === '') {
      throw new Error('Channel ID is required (频道ID是必需的)');
    }

    if (!names || names.length === 0) {
      throw new Error('Names are required (频道名称是必需的)');
    }

    if (names.length > 100) {
      throw new Error('Names count exceeds maximum of 100 (频道名称数量超过最大值100)');
    }

    const result = await this.channel.batchAddTransmit({ channelId, names });
    return this.unwrapData<TransmitChannelInfo[]>(result) || [];
  }

  /**
   * Gets transmit associations for a channel
   * @param channelId Channel ID (optional - if not provided, gets all associations for the account)
   * @returns Promise that resolves with association list
   */
  async getTransmitAssociations(channelId: string): Promise<TransmitAssociation[]> {
    if (!channelId || channelId.trim() === '') {
      throw new Error('Channel ID is required (频道ID是必需的)');
    }

    const result = await this.channel.getTransmitAssociations({ channelId });
    return this.unwrapData<TransmitAssociation[]>(result) || [];
  }

  async associationReceiveChannels(options: {
    channelId: string;
    receiveChannelIds: string[];
    type?: 'add' | 'cancel';
  }): Promise<Array<string | number>> {
    if (!options.channelId || options.channelId.trim() === '') {
      throw new Error('Channel ID is required (频道ID是必需的)');
    }

    if (!options.receiveChannelIds || options.receiveChannelIds.length === 0) {
      throw new Error('Receive channel IDs are required (接收频道ID是必需的)');
    }

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

    const result = await this.channel.associationReceiveChannels(associationOptions);
    return this.unwrapData<Array<string | number>>(result) || [];
  }

  private unwrapData<T>(value: unknown): T | undefined {
    if (value && typeof value === 'object' && 'data' in value) {
      return (value as { data: T }).data;
    }
    return value as T;
  }
}
