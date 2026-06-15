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

    // According to API docs, names are sent as JSON array in request body
    const response = await this.client.httpClient.post<{ data: TransmitChannelInfo[] }>(
      '/live/v3/channel/transmit/batch-create',
      names,
      {
        params: {
          channelId: parseInt(channelId, 10),
        },
      }
    );

    // Response structure: { data: TransmitChannelInfo[] }
    const data = response as unknown as { data: TransmitChannelInfo[] };
    return data?.data || [];
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

    const response = await this.client.httpClient.get<{ data: TransmitAssociation[] }>(
      '/live/v3/channel/transmit/get-associations',
      {
        params: {
          channelId,
        },
      }
    );

    // Response structure: { data: TransmitAssociation[] }
    const data = response as unknown as { data: TransmitAssociation[] };
    return data?.data || [];
  }
}
