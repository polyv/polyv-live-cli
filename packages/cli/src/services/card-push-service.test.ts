/**
 * @fileoverview Unit tests for CardPushServiceSdk
 * @author Development Team
 * @since 14.2.0
 */

import { CardPushServiceSdk } from './card-push-service';
import { AuthConfig } from '../types/auth';
import { PolyVClient } from 'polyv-live-api-sdk';

// Mock PolyVClient
const mockHttpClient = {
  get: jest.fn(),
  post: jest.fn(),
};

const mockV4Channel = {
  listCardPushes: jest.fn(),
  cardPushCreate: jest.fn(),
  cardPushUpdate: jest.fn(),
  cardPushPush: jest.fn(),
  cardPushCancelPush: jest.fn(),
  cardPushDelete: jest.fn(),
};

const mockClient = {
  httpClient: mockHttpClient,
  v4Channel: mockV4Channel,
} as unknown as PolyVClient;

jest.mock('polyv-live-api-sdk', () => ({
  PolyVClient: jest.fn(() => mockClient),
}));

describe('CardPushServiceSdk', () => {
  let authConfig: AuthConfig;
  let service: CardPushServiceSdk;

  beforeEach(() => {
    jest.clearAllMocks();

    authConfig = {
      appId: 'test-app-id',
      appSecret: 'test-app-secret',
      userId: 'test-user-id',
    };

    service = new CardPushServiceSdk(authConfig);
  });

  // ========================================
  // AC1: listCardPushes - List card push configs
  // ========================================
  describe('listCardPushes', () => {
    it('[P0][SVC-001] should call SDK list method for list operations', async () => {
      const mockSdkResponse = {
        contents: [
          {
            id: 123,
            channelId: 3151318,
            title: 'Test Card',
            cardType: 'common',
            imageType: 'giftbox',
            duration: 10,
            link: 'https://example.com',
            pushStatus: 'N',
            enterEnabled: 'Y',
            showCondition: 'PUSH',
            linkEnabled: 'Y',
            createdTime: 1616384611000,
          },
        ],
      };

      const expectedResponse = [
        {
          id: 123,
          channelId: 3151318,
          title: 'Test Card',
          cardType: 'common',
          imageType: 'giftbox',
          duration: 10,
          link: 'https://example.com',
          pushStatus: 'N',
          enterEnabled: 'Y',
          showCondition: 'PUSH',
          linkEnabled: 'Y',
          createdTime: 1616384611000,
        },
      ];

      mockV4Channel.listCardPushes.mockResolvedValueOnce({ data: mockSdkResponse });

      const result = await service.listCardPushes('3151318');

      expect(mockV4Channel.listCardPushes).toHaveBeenCalledWith({ channelId: '3151318' });
      expect(result).toEqual(expectedResponse);
    });

    it('[P0] should handle SDK top-level array responses', async () => {
      const mockSdkResponse = [
        {
          id: 77859,
          channelId: 7982219,
          title: 'Codex大促',
          pushStatus: 'N',
          showCondition: 'PUSH',
        },
      ];

      mockV4Channel.listCardPushes.mockResolvedValueOnce(mockSdkResponse);

      const result = await service.listCardPushes('7982219');

      expect(result).toEqual(mockSdkResponse);
    });

    it('[P1] should throw error when channelId is empty', async () => {
      await expect(service.listCardPushes('')).rejects.toThrow(/channelId|Channel.*ID/i);
    });

    it('[P1] should handle API errors gracefully', async () => {
      mockV4Channel.listCardPushes.mockRejectedValueOnce(new Error('API Error'));

      await expect(service.listCardPushes('3151318')).rejects.toThrow('API Error');
    });

    it('[P1] should return empty array when no card pushes exist', async () => {
      mockV4Channel.listCardPushes.mockResolvedValueOnce({ data: { contents: [] } });

      const result = await service.listCardPushes('3151318');

      expect(result).toEqual([]);
    });
  });

  // ========================================
  // AC2: createCardPush - Create card push config
  // ========================================
  describe('createCardPush', () => {
    it('[P0][SVC-002] should call SDK create method for create operations', async () => {
      const mockResponse = {
        id: 123,
        title: 'New Card',
      };

      mockV4Channel.cardPushCreate.mockResolvedValueOnce({ data: mockResponse });

      const result = await service.createCardPush({
        channelId: '3151318',
        imageType: 'giftbox',
        title: 'New Card',
        link: 'https://example.com',
        duration: 10,
        showCondition: 'PUSH',
      });

      expect(mockV4Channel.cardPushCreate).toHaveBeenCalledWith({
        channelId: 3151318,
        imageType: 'giftbox',
        title: 'New Card',
        link: 'https://example.com',
        duration: 10,
        showCondition: 'PUSH',
      });
      expect(result).toEqual({ id: 123, title: 'New Card' });
    });

    it('[P1] should throw error when channelId is missing', async () => {
      await expect(
        service.createCardPush({
          channelId: '',
          imageType: 'giftbox',
          title: 'Test',
          link: 'https://example.com',
          duration: 10,
          showCondition: 'PUSH',
        })
      ).rejects.toThrow(/channelId|Channel.*ID/i);
    });

    it('[P1] should throw error when title is missing', async () => {
      await expect(
        service.createCardPush({
          channelId: '3151318',
          imageType: 'giftbox',
          title: '',
          link: 'https://example.com',
          duration: 10,
          showCondition: 'PUSH',
        })
      ).rejects.toThrow(/title|标题/i);
    });

    it('[P1] should include optional params when provided', async () => {
      const mockResponse = { id: 123, title: 'Card' };
      mockV4Channel.cardPushCreate.mockResolvedValueOnce({ data: mockResponse });

      await service.createCardPush({
        channelId: '3151318',
        imageType: 'redpack',
        title: 'Card',
        link: 'https://example.com',
        duration: 20,
        showCondition: 'WATCH',
        cardType: 'qrCode',
        conditionValue: 30,
        conditionUnit: 'SECONDS',
        countdownMsg: 'Coming',
        enterEnabled: 'N',
        linkEnabled: 'Y',
        redirectType: 'tab',
      });

      expect(mockV4Channel.cardPushCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          cardType: 'qrCode',
          conditionValue: 30,
          conditionUnit: 'SECONDS',
          countdownMsg: 'Coming',
          enterEnabled: 'N',
          linkEnabled: 'Y',
          redirectType: 'tab',
        })
      );
    });
  });

  // ========================================
  // AC3: updateCardPush - Update card push config
  // ========================================
  describe('updateCardPush', () => {
    it('[P0][SVC-003] should call SDK update method for update operations', async () => {
      const mockResponse = {
        id: 123,
        title: 'Updated Card',
      };

      mockV4Channel.cardPushUpdate.mockResolvedValueOnce({ data: mockResponse });

      const result = await service.updateCardPush({
        channelId: '3151318',
        cardPushId: '123',
        title: 'Updated Card',
      });

      expect(mockV4Channel.cardPushUpdate).toHaveBeenCalledWith({
        channelId: 3151318,
        cardPushId: 123,
        title: 'Updated Card',
      });
      expect(result).toEqual({ id: 123, title: 'Updated Card' });
    });

    it('[P1] should throw error when cardPushId is missing', async () => {
      await expect(
        service.updateCardPush({
          channelId: '3151318',
          cardPushId: '',
          title: 'Updated',
        })
      ).rejects.toThrow(/cardPushId|卡片.*ID/i);
    });

    it('[P1] should handle API errors gracefully', async () => {
      mockV4Channel.cardPushUpdate.mockRejectedValueOnce(new Error('API Error'));

      await expect(
        service.updateCardPush({
          channelId: '3151318',
          cardPushId: '123',
          title: 'Updated',
        })
      ).rejects.toThrow('API Error');
    });
  });

  // ========================================
  // AC4: pushCard - Push card to viewers
  // ========================================
  describe('pushCard', () => {
    it('[P0][SVC-004] should call SDK push method for push operations', async () => {
      mockV4Channel.cardPushPush.mockResolvedValueOnce({ data: {} });

      await service.pushCard({
        channelId: '3151318',
        cardPushId: '123',
      });

      expect(mockV4Channel.cardPushPush).toHaveBeenCalledWith({
        channelId: 3151318,
        cardPushId: 123,
      });
    });

    it('[P1] should throw error when cardPushId is missing', async () => {
      await expect(
        service.pushCard({
          channelId: '3151318',
          cardPushId: '',
        })
      ).rejects.toThrow(/cardPushId|卡片.*ID/i);
    });

    it('[P1] should handle API errors gracefully', async () => {
      mockV4Channel.cardPushPush.mockRejectedValueOnce(new Error('API Error'));

      await expect(
        service.pushCard({
          channelId: '3151318',
          cardPushId: '123',
        })
      ).rejects.toThrow('API Error');
    });
  });

  // ========================================
  // AC5: cancelPush - Cancel card push
  // ========================================
  describe('cancelPush', () => {
    it('[P0][SVC-005] should call SDK cancel method for cancel operations', async () => {
      mockV4Channel.cardPushCancelPush.mockResolvedValueOnce({ data: {} });

      await service.cancelPush({
        channelId: '3151318',
        cardPushId: '123',
      });

      expect(mockV4Channel.cardPushCancelPush).toHaveBeenCalledWith({
        channelId: 3151318,
        cardPushId: 123,
      });
    });

    it('[P1] should throw error when cardPushId is missing', async () => {
      await expect(
        service.cancelPush({
          channelId: '3151318',
          cardPushId: '',
        })
      ).rejects.toThrow(/cardPushId|卡片.*ID/i);
    });

    it('[P1] should handle API errors gracefully', async () => {
      mockV4Channel.cardPushCancelPush.mockRejectedValueOnce(new Error('API Error'));

      await expect(
        service.cancelPush({
          channelId: '3151318',
          cardPushId: '123',
        })
      ).rejects.toThrow('API Error');
    });
  });

  // ========================================
  // AC6: deleteCardPush - Delete card push config
  // ========================================
  describe('deleteCardPush', () => {
    it('[P0][SVC-006] should call SDK delete method for delete operations', async () => {
      mockV4Channel.cardPushDelete.mockResolvedValueOnce({ data: {} });

      await service.deleteCardPush({
        channelId: '3151318',
        cardPushId: '123',
      });

      expect(mockV4Channel.cardPushDelete).toHaveBeenCalledWith({
        channelId: 3151318,
        cardPushId: 123,
      });
    });

    it('[P1] should throw error when cardPushId is missing', async () => {
      await expect(
        service.deleteCardPush({
          channelId: '3151318',
          cardPushId: '',
        })
      ).rejects.toThrow(/cardPushId|卡片.*ID/i);
    });

    it('[P1] should handle API errors gracefully', async () => {
      mockV4Channel.cardPushDelete.mockRejectedValueOnce(new Error('API Error'));

      await expect(
        service.deleteCardPush({
          channelId: '3151318',
          cardPushId: '123',
        })
      ).rejects.toThrow('API Error');
    });
  });

  // ========================================
  // Constructor tests
  // ========================================
  describe('constructor', () => {
    it('should create service with auth config only', () => {
      const newService = new CardPushServiceSdk(authConfig);
      expect(newService).toBeInstanceOf(CardPushServiceSdk);
    });

    it('should create service with optional service config', () => {
      const customConfig = {
        baseUrl: 'https://custom.api.polyv.net',
        timeout: 60000,
        debug: true,
      };

      const newService = new CardPushServiceSdk(authConfig, customConfig);
      expect(newService).toBeInstanceOf(CardPushServiceSdk);
    });
  });
});
