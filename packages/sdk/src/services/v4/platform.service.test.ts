/**
 * @fileoverview Unit tests for V4PlatformService
 * @module services/v4/platform.service.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { V4PlatformService } from './platform.service.js';
import type { PolyVClient } from '../../client.js';

// Mock the PolyVClient
const mockHttpClient = {
  get: vi.fn(),
  post: vi.fn(),
};

const mockClient = {
  httpClient: mockHttpClient,
} as unknown as PolyVClient;

describe('V4PlatformService', () => {
  let service: V4PlatformService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new V4PlatformService(mockClient);
  });

  // ============================================
  // createCoupon Tests
  // ============================================

  describe('createCoupon', () => {
    it('[P0] should create coupon with DAY useTimeType successfully', async () => {
      mockHttpClient.post.mockResolvedValueOnce('coupon123');

      const params = {
        name: 'Test Coupon',
        receiveStartTime: Date.now(),
        receiveEndTime: Date.now() + 7 * 24 * 60 * 60 * 1000,
        useTimeType: 'DAY' as const,
        dayOfUse: 30,
        type: 'MAX_OUT' as const,
        availableAmount: 1000,
        rule: {
          condition: 'UNCONDITIONAL' as const,
          unconditional: { enable: true, value: 10, unit: 'MONEY' as const },
          limitPerPerson: 1,
        },
      };

      const result = await service.createCoupon(params);

      expect(result).toBe('coupon123');
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/coupon/create',
        params
      );
    });

    it('[P0] should create coupon with RANGE useTimeType successfully', async () => {
      mockHttpClient.post.mockResolvedValueOnce('coupon456');

      const params = {
        name: 'Range Coupon',
        receiveStartTime: Date.now(),
        receiveEndTime: Date.now() + 7 * 24 * 60 * 60 * 1000,
        useTimeType: 'RANGE' as const,
        useStartTime: Date.now(),
        useEndTime: Date.now() + 30 * 24 * 60 * 60 * 1000,
        type: 'MAX_OUT' as const,
        availableAmount: 1000,
        rule: {
          condition: 'UNCONDITIONAL' as const,
          unconditional: { enable: true, value: 10, unit: 'MONEY' as const },
          limitPerPerson: 1,
        },
      };

      await service.createCoupon(params);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/coupon/create',
        params
      );
    });

    it('[P1] should throw error when name is empty', async () => {
      const params = {
        name: '',
        useTimeType: 'DAY' as const,
        dayOfUse: 30,
        type: 'MAX_OUT' as const,
        rule: { condition: 'UNCONDITIONAL' as const },
      };

      await expect(service.createCoupon(params as any)).rejects.toThrow('name is required');
    });

    it('[P1] should throw error when name exceeds 50 characters', async () => {
      const params = {
        name: 'a'.repeat(51),
        useTimeType: 'DAY' as const,
        dayOfUse: 30,
        type: 'MAX_OUT' as const,
        rule: { condition: 'UNCONDITIONAL' as const },
      };

      await expect(service.createCoupon(params as any)).rejects.toThrow(
        'name must not exceed 50 characters'
      );
    });

    it('[P1] should throw error when availableAmount is negative', async () => {
      const params = {
        name: 'Test Coupon',
        useTimeType: 'DAY' as const,
        dayOfUse: 30,
        type: 'MAX_OUT' as const,
        availableAmount: -1,
        rule: { condition: 'UNCONDITIONAL' as const },
      };

      await expect(service.createCoupon(params as any)).rejects.toThrow(
        'availableAmount must be >= 0'
      );
    });

    it('[P1] should throw error when useTimeType is RANGE but times are missing', async () => {
      const params = {
        name: 'Test Coupon',
        useTimeType: 'RANGE' as const,
        type: 'MAX_OUT' as const,
        rule: { condition: 'UNCONDITIONAL' as const },
      };

      await expect(service.createCoupon(params as any)).rejects.toThrow(
        'useStartTime and useEndTime are required when useTimeType is RANGE'
      );
    });

    it('[P1] should throw error when useTimeType is DAY but dayOfUse is missing', async () => {
      const params = {
        name: 'Test Coupon',
        useTimeType: 'DAY' as const,
        type: 'MAX_OUT' as const,
        rule: { condition: 'UNCONDITIONAL' as const },
      };

      await expect(service.createCoupon(params as any)).rejects.toThrow(
        'dayOfUse is required when useTimeType is DAY'
      );
    });
  });

  // ============================================
  // updateCoupon Tests
  // ============================================

  describe('updateCoupon', () => {
    it('[P0] should update coupon successfully', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateCoupon({
        couponId: 'coupon123',
        name: 'Updated Coupon',
        availableAmount: 2000,
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/coupon/update',
        { couponId: 'coupon123', name: 'Updated Coupon', availableAmount: 2000 }
      );
    });

    it('[P1] should throw error when couponId is empty', async () => {
      await expect(
        service.updateCoupon({ couponId: '', name: 'Test' })
      ).rejects.toThrow('couponId is required');
    });
  });

  // ============================================
  // searchCoupons Tests
  // ============================================

  describe('searchCoupons', () => {
    it('[P0] should search coupons successfully', async () => {
      const mockResponse = {
        contents: [{ couponId: 'coupon123', name: 'Test Coupon', status: 'GOING' }],
        total: 1,
        pageNumber: 1,
        pageSize: 20,
      };

      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.searchCoupons({ status: 'GOING', pageNumber: 1, pageSize: 20 });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/user/coupon/search',
        { params: { status: 'GOING', pageNumber: 1, pageSize: 20 } }
      );
    });

    it('[P0] should search coupons with default params', async () => {
      mockHttpClient.get.mockResolvedValueOnce({ contents: [], total: 0 });

      await service.searchCoupons();

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/live/v4/user/coupon/search',
        { params: {} }
      );
    });

    it('[P1] should throw error when pageNumber < 1', async () => {
      await expect(
        service.searchCoupons({ pageNumber: 0, pageSize: 10 })
      ).rejects.toThrow('pageNumber must be >= 1');
    });

    it('[P1] should throw error when pageSize > 1000', async () => {
      await expect(
        service.searchCoupons({ pageNumber: 1, pageSize: 1001 })
      ).rejects.toThrow('pageSize must be between 1 and 1000');
    });
  });

  // ============================================
  // searchCouponViewers Tests
  // ============================================

  describe('searchCouponViewers', () => {
    it('[P0] should search coupon viewers successfully', async () => {
      const mockResponse = {
        contents: [{ viewerId: 'viewer1', receivedAt: Date.now() }],
        total: 1,
        pageNumber: 1,
        pageSize: 50,
      };

      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.searchCouponViewers({
        couponId: 'coupon123',
        pageNumber: 1,
        pageSize: 50,
      });

      expect(result).toEqual(mockResponse);
    });

    it('[P1] should throw error when couponId is missing', async () => {
      await expect(
        service.searchCouponViewers({ pageNumber: 1, pageSize: 10 } as any)
      ).rejects.toThrow('couponId is required');
    });
  });

  // ============================================
  // deleteCouponsBatch Tests
  // ============================================

  describe('deleteCouponsBatch', () => {
    it('[P0] should delete coupons in batch successfully', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.deleteCouponsBatch({
        couponIds: ['coupon1', 'coupon2', 'coupon3'],
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/coupon/delete-batch',
        { couponIds: ['coupon1', 'coupon2', 'coupon3'] }
      );
    });

    it('[P1] should throw error when couponIds is empty', async () => {
      await expect(
        service.deleteCouponsBatch({ couponIds: [] })
      ).rejects.toThrow('couponIds is required and must not be empty');
    });

    it('[P1] should throw error when couponIds exceeds 200', async () => {
      const couponIds = Array.from({ length: 201 }, (_, i) => `coupon${i}`);

      await expect(
        service.deleteCouponsBatch({ couponIds })
      ).rejects.toThrow('couponIds must not exceed 200 items');
    });
  });

  // ============================================
  // updateCouponsStatusBatch Tests
  // ============================================

  describe('updateCouponsStatusBatch', () => {
    it('[P0] should update coupons status in batch successfully', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined);

      await service.updateCouponsStatusBatch({
        couponIds: ['coupon1', 'coupon2'],
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/user/coupon/update-status-batch',
        { couponIds: ['coupon1', 'coupon2'] }
      );
    });

    it('[P1] should throw error when couponIds is empty', async () => {
      await expect(
        service.updateCouponsStatusBatch({ couponIds: [] })
      ).rejects.toThrow('couponIds is required and must not be empty');
    });
  });
});
