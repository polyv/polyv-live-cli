/**
 * @fileoverview Unit tests for PromotionServiceSdk
 * @author Development Team
 * @since 14.1.0
 */

import { PromotionServiceSdk } from './promotion-service';
import { AuthConfig } from '../types/auth';
import { PolyVClient } from 'polyv-live-api-sdk';

// Mock PolyVClient
const mockHttpClient = {
  get: jest.fn(),
  post: jest.fn(),
};

const mockClient = {
  httpClient: mockHttpClient,
} as unknown as PolyVClient;

jest.mock('polyv-live-api-sdk', () => ({
  PolyVClient: jest.fn(() => mockClient),
}));

describe('PromotionServiceSdk', () => {
  let authConfig: AuthConfig;
  let service: PromotionServiceSdk;

  beforeEach(() => {
    jest.clearAllMocks();

    authConfig = {
      appId: 'test-app-id',
      appSecret: 'test-app-secret',
      userId: 'test-user-id',
    };

    service = new PromotionServiceSdk(authConfig);
  });

  // ========================================
  // AC5: Reuse SDK V4 Channel Service
  // ========================================
  describe('listPopularizations', () => {
    it('[P0][SVC-001] should call httpClient.get for list operations', async () => {
      const mockSdkResponse = {
        contents: [
          {
            promoteId: 'Fq5gpU',
            popularizationName: '甘肃分公司',
            visitsNum: 100,
            reservationNum: 10,
            watchNum: 50,
            viewerNum: 25,
            averageWatchTime: '00:15:30',
            enrollNum: 5,
            createdTime: 1616384611000,
          },
        ],
      };

      const expectedResponse = [
        {
          promoteId: 'Fq5gpU',
          popularizationName: '甘肃分公司',
          visitsNum: 100,
          reservationNum: 10,
          watchNum: 50,
          viewerNum: 25,
          averageWatchTime: '00:15:30',
          enrollNum: 5,
          createdTime: 1616384611000,
        },
      ];

      mockHttpClient.get.mockResolvedValueOnce({ data: mockSdkResponse });

      const result = await service.listPopularizations('3151318');

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/channel/popularization/list',
        {
          params: {
            channelId: '3151318',
            pageNumber: 1,
            pageSize: 500,
          },
        }
      );
      expect(result).toEqual(expectedResponse);
    });

    it('[P1] should throw error when channelId is empty', async () => {
      await expect(service.listPopularizations('')).rejects.toThrow(/channelId|Channel.*ID/i);
    });

    it('[P1] should handle API errors gracefully', async () => {
      mockHttpClient.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(service.listPopularizations('3151318')).rejects.toThrow('API Error');
    });

    it('[P1] should return empty array when no promotions exist', async () => {
      mockHttpClient.get.mockResolvedValueOnce({ data: { contents: [] } });

      const result = await service.listPopularizations('3151318');

      expect(result).toEqual([]);
    });

    it('[P0] should support unwrapped list responses from SDK client', async () => {
      mockHttpClient.get.mockResolvedValueOnce({
        contents: [
          {
            promoteId: 'Fq5gpU',
            popularizationName: '甘肃分公司',
          },
        ],
      });

      const result = await service.listPopularizations('3151318');

      expect(result).toEqual([
        {
          promoteId: 'Fq5gpU',
          popularizationName: '甘肃分公司',
          visitsNum: 0,
          reservationNum: 0,
          watchNum: 0,
          viewerNum: 0,
          averageWatchTime: '',
          enrollNum: 0,
          createdTime: 0,
        },
      ]);
    });
  });

  describe('batchCreatePopularizations', () => {
    it('[P0][SVC-002] should call httpClient.post for create operations', async () => {
      const mockResponse = [
        { promoteId: 'abc123', popularizationName: 'Promotion 1' },
        { promoteId: 'def456', popularizationName: 'Promotion 2' },
      ];

      mockHttpClient.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await service.batchCreatePopularizations({
        channelId: '3151318',
        names: ['Promotion 1', 'Promotion 2'],
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/channel/popularization/create-batch',
        {
          channelId: 3151318,
          names: ['Promotion 1', 'Promotion 2'],
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('[P0] should support unwrapped create responses from SDK client', async () => {
      const mockResponse = [
        { promoteId: 'abc123', popularizationName: 'Promotion 1' },
      ];

      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.batchCreatePopularizations({
        channelId: '3151318',
        names: ['Promotion 1'],
      });

      expect(result).toEqual(mockResponse);
    });

    it('[P1] should throw error when channelId is missing', async () => {
      await expect(
        service.batchCreatePopularizations({ channelId: '', names: ['Test'] })
      ).rejects.toThrow(/channelId|Channel.*ID/i);
    });

    it('[P1] should throw error when names is empty', async () => {
      await expect(
        service.batchCreatePopularizations({ channelId: '3151318', names: [] })
      ).rejects.toThrow(/names|empty/i);
    });

    it('[P1] should handle API errors gracefully', async () => {
      mockHttpClient.post.mockRejectedValueOnce(new Error('API Error'));

      await expect(
        service.batchCreatePopularizations({ channelId: '3151318', names: ['Test'] })
      ).rejects.toThrow('API Error');
    });
  });

  // ========================================
  // Constructor tests
  // ========================================
  describe('constructor', () => {
    it('should create service with auth config only', () => {
      const newService = new PromotionServiceSdk(authConfig);
      expect(newService).toBeInstanceOf(PromotionServiceSdk);
    });

    it('should create service with optional service config', () => {
      const customConfig = {
        baseUrl: 'https://custom.api.polyv.net',
        timeout: 60000,
        debug: true,
      };

      const newService = new PromotionServiceSdk(authConfig, customConfig);
      expect(newService).toBeInstanceOf(PromotionServiceSdk);
    });
  });
});
