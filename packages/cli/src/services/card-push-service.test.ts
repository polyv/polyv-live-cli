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
  listCardPushes: jest.fn((params) => mockHttpClient.get('/live/v4/channel/card-push/list', { params })),
  cardPushCreate: jest.fn((params) => mockHttpClient.get('/live/v4/channel/card-push/create', { params })),
  cardPushUpdate: jest.fn((params) => mockHttpClient.post('/live/v4/channel/card-push/update', params)),
  cardPushPush: jest.fn((params) => mockHttpClient.post('/live/v4/channel/card-push/push', params)),
  cardPushCancelPush: jest.fn((params) => mockHttpClient.post('/live/v4/channel/card-push/cancel-push', params)),
  cardPushDelete: jest.fn((params) => mockHttpClient.post('/live/v4/channel/card-push/delete', params)),
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
    it('[P0][SVC-001] should call httpClient.get for list operations', async () => {
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

      mockHttpClient.get.mockResolvedValueOnce({ data: mockSdkResponse });

      const result = await service.listCardPushes('3151318');

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/channel/card-push/list',
        {
          params: {
            channelId: '3151318',
          },
        }
      );
      expect(result).toEqual(expectedResponse);
    });

    it('[P1] should throw error when channelId is empty', async () => {
      await expect(service.listCardPushes('')).rejects.toThrow(/channelId|Channel.*ID/i);
    });

    it('[P1] should handle API errors gracefully', async () => {
      mockHttpClient.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(service.listCardPushes('3151318')).rejects.toThrow('API Error');
    });

    it('[P1] should return empty array when no card pushes exist', async () => {
      mockHttpClient.get.mockResolvedValueOnce({ data: { contents: [] } });

      const result = await service.listCardPushes('3151318');

      expect(result).toEqual([]);
    });
  });

  // ========================================
  // AC2: createCardPush - Create card push config
  // ========================================
  describe('createCardPush', () => {
    it('[P0][SVC-002] should call httpClient.get for create operations', async () => {
      const mockResponse = {
        id: 123,
        title: 'New Card',
      };

      mockHttpClient.get.mockResolvedValueOnce({ data: mockResponse });

      const result = await service.createCardPush({
        channelId: '3151318',
        imageType: 'giftbox',
        title: 'New Card',
        link: 'https://example.com',
        duration: 10,
        showCondition: 'PUSH',
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/channel/card-push/create',
        {
          params: {
            channelId: 3151318,
            imageType: 'giftbox',
            title: 'New Card',
            link: 'https://example.com',
            duration: 10,
            showCondition: 'PUSH',
          },
        }
      );
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
      mockHttpClient.get.mockResolvedValueOnce({ data: mockResponse });

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

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/channel/card-push/create',
        expect.objectContaining({
          params: expect.objectContaining({
            cardType: 'qrCode',
            conditionValue: 30,
            conditionUnit: 'SECONDS',
            countdownMsg: 'Coming',
            enterEnabled: 'N',
            linkEnabled: 'Y',
            redirectType: 'tab',
          }),
        })
      );
    });
  });

  // ========================================
  // AC3: updateCardPush - Update card push config
  // ========================================
  describe('updateCardPush', () => {
    it('[P0][SVC-003] should call httpClient.post for update operations', async () => {
      const mockResponse = {
        id: 123,
        title: 'Updated Card',
      };

      mockHttpClient.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await service.updateCardPush({
        channelId: '3151318',
        cardPushId: '123',
        title: 'Updated Card',
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/channel/card-push/update',
        {
          channelId: 3151318,
          cardPushId: 123,
          title: 'Updated Card',
        }
      );
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
      mockHttpClient.post.mockRejectedValueOnce(new Error('API Error'));

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
    it('[P0][SVC-004] should call httpClient.post for push operations', async () => {
      mockHttpClient.post.mockResolvedValueOnce({ data: {} });

      await service.pushCard({
        channelId: '3151318',
        cardPushId: '123',
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/channel/card-push/push',
        {
          channelId: 3151318,
          cardPushId: 123,
        }
      );
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
      mockHttpClient.post.mockRejectedValueOnce(new Error('API Error'));

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
    it('[P0][SVC-005] should call httpClient.post for cancel operations', async () => {
      mockHttpClient.post.mockResolvedValueOnce({ data: {} });

      await service.cancelPush({
        channelId: '3151318',
        cardPushId: '123',
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/channel/card-push/cancel-push',
        {
          channelId: 3151318,
          cardPushId: 123,
        }
      );
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
      mockHttpClient.post.mockRejectedValueOnce(new Error('API Error'));

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
    it('[P0][SVC-006] should call httpClient.post for delete operations', async () => {
      mockHttpClient.post.mockResolvedValueOnce({ data: {} });

      await service.deleteCardPush({
        channelId: '3151318',
        cardPushId: '123',
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/channel/card-push/delete',
        {
          channelId: 3151318,
          cardPushId: 123,
        }
      );
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
      mockHttpClient.post.mockRejectedValueOnce(new Error('API Error'));

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
