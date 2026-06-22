/**
 * @fileoverview Unit tests for DonateServiceSdk
 * @author Development Team
 * @since 11.6.0
 */

import { DonateServiceSdk } from './donate-service';
import { PolyVClient } from 'polyv-live-api-sdk';
import { AuthConfig } from '../types/auth';
import { DonateServiceConfig } from '../types/donate';
import { PolyVError } from '../utils/errors';

// Mock PolyVClient
jest.mock('polyv-live-api-sdk');
const MockedPolyVClient = PolyVClient as jest.MockedClass<typeof PolyVClient>;

describe('DonateServiceSdk', () => {
  let donateService: DonateServiceSdk;
  let mockAuthConfig: AuthConfig;
  let mockServiceConfig: DonateServiceConfig;
  let mockPolyVClient: jest.Mocked<PolyVClient>;
  let mockV4ChannelService: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAuthConfig = {
      appId: 'test-app-id',
      appSecret: 'test-app-secret',
      userId: 'test-user-id',
    };

    mockServiceConfig = {
      baseUrl: 'https://api.polyv.net',
      timeout: 30000,
      debug: false,
    };

    // Create mock services
    mockV4ChannelService = {
      getDonate: jest.fn(),
      updateDonate: jest.fn(),
      updateDonateGift: jest.fn(),
      listRewardGifts: jest.fn(),
      listRewardLikes: jest.fn(),
    };

    // Create mock PolyVClient
    mockPolyVClient = {
      v4Channel: mockV4ChannelService,
    } as any;

    MockedPolyVClient.mockImplementation(() => mockPolyVClient);

    donateService = new DonateServiceSdk(mockAuthConfig, mockServiceConfig);
  });

  describe('constructor', () => {
    it('11.6-SVC-001: should create DonateServiceSdk with correct configuration', () => {
      expect(donateService).toBeDefined();
    });
  });

  // ============================================================
  // AC #1: getDonateConfig (V4 API)
  // ============================================================
  describe('getDonateConfig (AC #1)', () => {
    it('11.6-SVC-002: should get donate config', async () => {
      mockV4ChannelService.getDonate.mockResolvedValue({
        globalSettingEnabled: 'Y',
        donateCashEnabled: 'Y',
        donateGoodEnabled: 'Y',
        donateTips: 'Thanks for donating',
        cashMin: 0.01,
        cashes: [0.88, 6.66, 8.88, 18.88, 66.6, 88.8],
        donatePointEnabled: 'N',
        pointUnit: null,
        goods: [
          {
            goodName: 'Flower',
            goodImg: '//s1.videocc.net/default-img/donate/flower.png',
            goodPrice: 0.0,
            goodEnabled: 'Y',
          },
        ],
      });

      const result = await donateService.getDonateConfig({
        channelId: '3151318',
      });

      expect(mockV4ChannelService.getDonate).toHaveBeenCalledWith({
        channelId: '3151318',
      });
      expect(result.donateCashEnabled).toBe('Y');
      expect(result.donateGoodEnabled).toBe('Y');
      expect(result.cashes).toHaveLength(6);
    });

    it('11.6-SVC-003: should handle API errors', async () => {
      mockV4ChannelService.getDonate.mockRejectedValue(
        new Error('API Error: Authentication failed')
      );

      await expect(
        donateService.getDonateConfig({
          channelId: '3151318',
        })
      ).rejects.toThrow();
    });
  });

  // ============================================================
  // AC #2: updateDonateConfig (V4 API)
  // ============================================================
  describe('updateDonateConfig (AC #2)', () => {
    it('11.6-SVC-004: should update gift donate enabled', async () => {
      mockV4ChannelService.updateDonateGift.mockResolvedValue(undefined);

      await donateService.updateDonateConfig({
        channelId: '3151318',
        donateGiftEnabled: 'N',
      });

      expect(mockV4ChannelService.updateDonateGift).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '3151318',
          donateGiftEnabled: 'N',
        })
      );
    });

    it('11.6-SVC-005: should apply donateEnabled to generated cash gift entries', async () => {
      mockV4ChannelService.updateDonateGift.mockResolvedValue(undefined);

      await donateService.updateDonateConfig({
        channelId: '3151318',
        donateEnabled: 'N',
        donateAmounts: [1, 5],
      });

      expect(mockV4ChannelService.updateDonateGift).toHaveBeenCalledWith(
        expect.objectContaining({
          donateGiftEnabled: 'Y',
          giftDonate: expect.objectContaining({
            cashPays: expect.arrayContaining([
              expect.objectContaining({ price: 1, enabled: 'N' }),
            ]),
          }),
        })
      );
    });

    it('11.6-SVC-006: should update donate config with donateAmounts', async () => {
      mockV4ChannelService.updateDonateGift.mockResolvedValue(undefined);

      await donateService.updateDonateConfig({
        channelId: '3151318',
        donateAmounts: [0.88, 6.66, 8.88, 18.88, 66.6, 88.8],
      });

      expect(mockV4ChannelService.updateDonateGift).toHaveBeenCalledWith(
        expect.objectContaining({
          giftDonate: expect.objectContaining({
            payWay: 'CASH',
            cashPays: expect.arrayContaining([
              expect.objectContaining({ price: 0.88, imgType: 'STATIC' }),
            ]),
          }),
        })
      );
    });

    it('11.6-SVC-007: should update donate config with all parameters', async () => {
      mockV4ChannelService.updateDonateGift.mockResolvedValue(undefined);

      await donateService.updateDonateConfig({
        channelId: '3151318',
        donateEnabled: 'Y',
        donateGiftEnabled: 'Y',
        donateAmounts: [1, 5, 10],
      });

      expect(mockV4ChannelService.updateDonateGift).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '3151318',
          donateGiftEnabled: 'Y',
          giftDonate: expect.objectContaining({
            cashPays: expect.arrayContaining([
              expect.objectContaining({ price: 1 }),
            ]),
          }),
        })
      );
    });

    it('11.6-SVC-008: should handle API errors', async () => {
      mockV4ChannelService.updateDonateGift.mockRejectedValue(
        new Error('API Error: Permission denied')
      );

      await expect(
        donateService.updateDonateConfig({
          channelId: '3151318',
          donateGiftEnabled: 'Y',
        })
      ).rejects.toThrow();
    });
  });

  // ============================================================
  // AC #3: listRewardGift (V4 API - needs new implementation)
  // ============================================================
  describe('listRewardGift (AC #3)', () => {
    it('11.6-SVC-009: should list reward gift records with required parameters', async () => {
      // This test will fail until listRewardGift is implemented
      const mockResponse = {
        code: 200,
        status: 'success',
        data: {
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
          totalItems: 2,
          contents: [
            {
              userId: 'user123',
              nickName: 'Test User',
              timestamp: 1615772426000,
              name: 'Flower',
              type: '1',
              amount: 6.66,
              sessionId: 'session001',
            },
            {
              userId: 'user456',
              nickName: 'Another User',
              timestamp: 1615772526000,
              name: 'Cash',
              type: '2',
              amount: 8.88,
              sessionId: 'session001',
            },
          ],
        },
      };

      // Mock the httpClient directly for this new endpoint
      mockV4ChannelService.listRewardGifts.mockResolvedValue(mockResponse);

      const result = await donateService.listRewardGift({
        channelId: '3151318',
        start: 1615772426000,
        end: 1615858826000,
      });

      expect(result.data.contents).toHaveLength(2);
      expect(result.data.totalItems).toBe(2);
      expect(mockV4ChannelService.listRewardGifts).toHaveBeenCalledWith({
        channelId: '3151318',
        start: 1615772426000,
        end: 1615858826000,
        pageNumber: 1,
        pageSize: 10,
      });
    });

    it('11.6-SVC-010: should list reward gift records with pagination', async () => {
      const mockResponse = {
        code: 200,
        status: 'success',
        data: {
          pageNumber: 2,
          pageSize: 20,
          totalPages: 5,
          totalItems: 100,
          contents: [],
        },
      };

      mockV4ChannelService.listRewardGifts.mockResolvedValue(mockResponse);

      const result = await donateService.listRewardGift({
        channelId: '3151318',
        start: 1615772426000,
        end: 1615858826000,
        pageNumber: 2,
        pageSize: 20,
      });

      expect(result.data.pageNumber).toBe(2);
      expect(result.data.pageSize).toBe(20);
      expect(mockV4ChannelService.listRewardGifts).toHaveBeenCalledWith({
        channelId: '3151318',
        start: 1615772426000,
        end: 1615858826000,
        pageNumber: 2,
        pageSize: 20,
      });
    });

    it('11.6-SVC-011: should handle API errors', async () => {
      mockV4ChannelService.listRewardGifts.mockRejectedValue(new Error('API Error: Invalid time range'));

      await expect(
        donateService.listRewardGift({
          channelId: '3151318',
          start: 1615772426000,
          end: 1615858826000,
        })
      ).rejects.toThrow();
    });
  });

  // ============================================================
  // Error Handling
  // ============================================================
  describe('Error Handling', () => {
    it('11.6-SVC-012: should wrap SDK errors with PolyVError', async () => {
      mockV4ChannelService.getDonate.mockRejectedValue(
        new Error('Network error')
      );

      await expect(
        donateService.getDonateConfig({
          channelId: '3151318',
        })
      ).rejects.toThrow(PolyVError);
    });
  });
});
