/**
 * @fileoverview Card-push service SDK wrapper
 * @author Development Team
 * @since 14.2.0
 */

import { PolyVClient } from 'polyv-live-api-sdk';
import { AuthConfig } from '../types/auth';
import {
  CardPushServiceConfig,
  CardPush,
  CreatedCardPush,
  CardPushCreateParams,
  CardPushUpdateParams,
  CardPushPushParams,
  CardPushCancelParams,
  CardPushDeleteParams,
} from '../types/card-push';

/**
 * SDK wrapper for card-push operations
 */
export class CardPushServiceSdk {
  private readonly client: PolyVClient;

  /**
   * Creates a new CardPushServiceSdk instance
   * @param authConfig Authentication configuration
   * @param config Optional service configuration (defaults to standard PolyV API settings)
   */
  constructor(authConfig: AuthConfig, config?: CardPushServiceConfig) {
    this.client = new PolyVClient({
      appId: authConfig.appId,
      appSecret: authConfig.appSecret,
      baseUrl: config?.baseUrl || 'https://api.polyv.net',
    });
  }

  /**
   * Lists all card-pushes for a channel
   * @param channelId Channel ID
   * @returns Promise that resolves with card-push list
   */
  async listCardPushes(channelId: string): Promise<CardPush[]> {
    if (!channelId || channelId.trim() === '') {
      throw new Error('Channel ID is required (频道ID是必需的)');
    }

    const response = await this.client.httpClient.get<{ contents: CardPush[] }>(
      '/live/v4/channel/card-push/list',
      {
        params: {
          channelId,
        },
      }
    );

    // Response structure: { data: { contents: CardPush[] } }
    const data = response as unknown as { data: { contents: CardPush[] } };
    return data?.data?.contents || [];
  }

  /**
   * Creates a new card-push
   * @param params Create parameters
   * @returns Promise that resolves with created card-push
   */
  async createCardPush(params: CardPushCreateParams): Promise<CreatedCardPush> {
    if (!params.channelId || params.channelId.trim() === '') {
      throw new Error('Channel ID is required (频道ID是必需的)');
    }
    if (!params.imageType || params.imageType.trim() === '') {
      throw new Error('Image type is required (图片类型是必需的)');
    }
    if (!params.title || params.title.trim() === '') {
      throw new Error('Title is required (卡片标题是必需的)');
    }
    if (!params.link || params.link.trim() === '') {
      throw new Error('Link is required (卡片链接是必需的)');
    }
    if (params.duration === undefined || params.duration === null) {
      throw new Error('Duration is required (卡片倒计时时长是必需的)');
    }
    if (!params.showCondition || params.showCondition.trim() === '') {
      throw new Error('Show condition is required (弹出方式是必需的)');
    }

    // Build request params
    const requestParams: Record<string, unknown> = {
      channelId: parseInt(params.channelId, 10),
      imageType: params.imageType,
      title: params.title,
      link: params.link,
      duration: params.duration,
      showCondition: params.showCondition,
    };

    // Add optional parameters
    if (params.cardType) requestParams.cardType = params.cardType;
    if (params.durationPosition) requestParams.durationPosition = params.durationPosition;
    if (params.conditionValue !== undefined) requestParams.conditionValue = params.conditionValue;
    if (params.conditionUnit) requestParams.conditionUnit = params.conditionUnit;
    if (params.countdownMsg) requestParams.countdownMsg = params.countdownMsg;
    if (params.enterEnabled) requestParams.enterEnabled = params.enterEnabled;
    if (params.linkEnabled) requestParams.linkEnabled = params.linkEnabled;
    if (params.redirectType) requestParams.redirectType = params.redirectType;

    const response = await this.client.httpClient.get<CreatedCardPush>(
      '/live/v4/channel/card-push/create',
      {
        params: requestParams,
      }
    );

    // Response structure: { data: CreatedCardPush }
    const data = response as unknown as { data: CreatedCardPush };
    return data?.data || (response as unknown as CreatedCardPush);
  }

  /**
   * Updates an existing card-push
   * @param params Update parameters
   * @returns Promise that resolves with updated card-push data
   */
  async updateCardPush(params: CardPushUpdateParams): Promise<{ id: number; [key: string]: unknown }> {
    if (!params.channelId || params.channelId.trim() === '') {
      throw new Error('Channel ID is required (频道ID是必需的)');
    }
    if (!params.cardPushId || params.cardPushId.trim() === '') {
      throw new Error('Card-push ID is required (卡片推送ID是必需的)');
    }

    // Build request body - all parameters go in body
    const requestBody: Record<string, unknown> = {
      channelId: parseInt(params.channelId, 10),
      cardPushId: parseInt(params.cardPushId, 10),
    };

    if (params.cardType) requestBody.cardType = params.cardType;
    if (params.imageType) requestBody.imageType = params.imageType;
    if (params.title) requestBody.title = params.title;
    if (params.link) requestBody.link = params.link;
    if (params.duration !== undefined) requestBody.duration = params.duration;
    if (params.durationPosition) requestBody.durationPosition = params.durationPosition;
    if (params.showCondition) requestBody.showCondition = params.showCondition;
    if (params.conditionValue !== undefined) requestBody.conditionValue = params.conditionValue;
    if (params.conditionUnit) requestBody.conditionUnit = params.conditionUnit;
    if (params.countdownMsg) requestBody.countdownMsg = params.countdownMsg;
    if (params.enterEnabled) requestBody.enterEnabled = params.enterEnabled;
    if (params.linkEnabled) requestBody.linkEnabled = params.linkEnabled;
    if (params.redirectType) requestBody.redirectType = params.redirectType;

    const response = await this.client.httpClient.post<{ id: number; title: string }>(
      '/live/v4/channel/card-push/update',
      requestBody
    );

    // Response structure: { data: { id, title } }
    const data = response as unknown as { data: { id: number; title: string } };
    return data?.data || { id: parseInt(params.cardPushId, 10) };
  }

  /**
   * Pushes a card to viewers
   * @param params Push parameters
   * @returns Promise that resolves when push is complete
   */
  async pushCard(params: CardPushPushParams): Promise<void> {
    if (!params.channelId || params.channelId.trim() === '') {
      throw new Error('Channel ID is required (频道ID是必需的)');
    }
    if (!params.cardPushId || params.cardPushId.trim() === '') {
      throw new Error('Card-push ID is required (卡片推送ID是必需的)');
    }

    await this.client.httpClient.post(
      '/live/v4/channel/card-push/push',
      {
        channelId: parseInt(params.channelId, 10),
        cardPushId: parseInt(params.cardPushId, 10),
      }
    );
  }

  /**
   * Cancels a pushing card
   * @param params Cancel parameters
   * @returns Promise that resolves when cancel is complete
   */
  async cancelPush(params: CardPushCancelParams): Promise<void> {
    if (!params.channelId || params.channelId.trim() === '') {
      throw new Error('Channel ID is required (频道ID是必需的)');
    }
    if (!params.cardPushId || params.cardPushId.trim() === '') {
      throw new Error('Card-push ID is required (卡片推送ID是必需的)');
    }

    await this.client.httpClient.post(
      '/live/v4/channel/card-push/cancel-push',
      {
        channelId: parseInt(params.channelId, 10),
        cardPushId: parseInt(params.cardPushId, 10),
      }
    );
  }

  /**
   * Deletes a card-push
   * @param params Delete parameters
   * @returns Promise that resolves when delete is complete
   */
  async deleteCardPush(params: CardPushDeleteParams): Promise<void> {
    if (!params.channelId || params.channelId.trim() === '') {
      throw new Error('Channel ID is required (频道ID是必需的)');
    }
    if (!params.cardPushId || params.cardPushId.trim() === '') {
      throw new Error('Card-push ID is required (卡片推送ID是必需的)');
    }

    await this.client.httpClient.post(
      '/live/v4/channel/card-push/delete',
      {
        channelId: parseInt(params.channelId, 10),
        cardPushId: parseInt(params.cardPushId, 10),
      }
    );
  }
}
