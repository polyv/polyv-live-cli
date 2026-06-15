/**
 * @fileoverview Integration tests for coupon commands
 * @author Development Team
 * @since 8.1.0
 */

import { createSdkClient } from '../../src/sdk';
import { hasRealCredentials, getTestConfig } from '../helpers/integration-config';
import type { CreateCouponParams } from 'polyv-live-api-sdk';

const testConfig = getTestConfig();
const shouldRunTests = hasRealCredentials();

(shouldRunTests ? describe : describe.skip)('Coupon Integration Tests', () => {
  let createdCouponIds: string[] = [];

  function getTimestamps() {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    return {
      receiveStart: now,
      receiveEnd: now + oneDay * 7,
      useStart: now,
      useEnd: now + oneDay * 30
    };
  }

  afterAll(async () => {
    if (createdCouponIds.length > 0) {
      console.log(`🧹 Cleaning up ${createdCouponIds.length} coupons...`);
      try {
        const client = createSdkClient(testConfig.authConfig, testConfig.baseUrl);
        await client.v4Platform.deleteCouponsBatch({ couponIds: createdCouponIds });
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  });

  // ========================================
  // Coupon List Tests
  // ========================================

  describe('coupon list', () => {
    it('should list coupons successfully', async () => {
      const client = createSdkClient(testConfig.authConfig, testConfig.baseUrl);
      const result = await client.v4Platform.searchCoupons({
        pageNumber: 1,
        pageSize: 10
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result.contents)).toBe(true);
      // total may be undefined in some API responses
      if (result.total !== undefined) {
        expect(typeof result.total).toBe('number');
      }
    }, 15000);

    it('should handle pagination', async () => {
      const client = createSdkClient(testConfig.authConfig, testConfig.baseUrl);
      const result = await client.v4Platform.searchCoupons({
        pageNumber: 1,
        pageSize: 5
      });

      expect(result.contents.length).toBeLessThanOrEqual(5);
    }, 15000);

    it('should filter by status', async () => {
      const client = createSdkClient(testConfig.authConfig, testConfig.baseUrl);
      const result = await client.v4Platform.searchCoupons({
        pageNumber: 1,
        pageSize: 10,
        status: 'GOING'
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result.contents)).toBe(true);
      result.contents.forEach(coupon => {
        expect(coupon.status).toBe('GOING');
      });
    }, 15000);
  });

  // ========================================
  // Coupon Create Tests
  // ========================================

  describe('coupon create', () => {
    it('should create a MAX_OUT coupon with FULL_REDUCE rule', async () => {
      const timestamps = getTimestamps();
      const client = createSdkClient(testConfig.authConfig, testConfig.baseUrl);

      const params: CreateCouponParams = {
        name: `Test Coupon MAX_OUT ${Date.now()}`,
        type: 'MAX_OUT',
        availableAmount: 100,
        receiveStartTime: timestamps.receiveStart,
        receiveEndTime: timestamps.receiveEnd,
        useTimeType: 'RANGE',
        useStartTime: timestamps.useStart,
        useEndTime: timestamps.useEnd,
        rule: {
          condition: 'FULL_REDUCE',
          limitPerPerson: 1,
          fullReduce: {
            enable: true,
            full: 100,
            reduce: 20,
            unit: 'MONEY'
          }
        }
      };

      const couponId = await client.v4Platform.createCoupon(params);

      expect(couponId).toBeDefined();
      expect(typeof couponId).toBe('string');
      expect(couponId.length).toBeGreaterThan(0);

      createdCouponIds.push(couponId);
    }, 15000);

    it('should create a DISCOUNT coupon with UNCONDITIONAL rule', async () => {
      const timestamps = getTimestamps();
      const client = createSdkClient(testConfig.authConfig, testConfig.baseUrl);

      const params: CreateCouponParams = {
        name: `Test Coupon DISCOUNT ${Date.now()}`,
        type: 'DISCOUNT',
        availableAmount: 50,
        receiveStartTime: timestamps.receiveStart,
        receiveEndTime: timestamps.receiveEnd,
        useTimeType: 'DAY',
        dayOfUse: 7,
        rule: {
          condition: 'UNCONDITIONAL',
          limitPerPerson: -1,
          unconditional: {
            enable: true,
            value: 10,
            unit: 'DISCOUNT'
          }
        }
      };

      const couponId = await client.v4Platform.createCoupon(params);

      expect(couponId).toBeDefined();
      expect(typeof couponId).toBe('string');

      createdCouponIds.push(couponId);
    }, 15000);

    it('should validate required fields', async () => {
      const client = createSdkClient(testConfig.authConfig, testConfig.baseUrl);

      await expect(
        client.v4Platform.createCoupon({
          name: '',
          type: 'MAX_OUT',
          availableAmount: 100,
          receiveStartTime: Date.now(),
          receiveEndTime: Date.now() + 86400000,
          useTimeType: 'RANGE',
          rule: {
            condition: 'FULL_REDUCE',
            limitPerPerson: 1
          }
        } as any)
      ).rejects.toThrow();
    }, 10000);
  });

  // ========================================
  // Coupon Delete Tests
  // ========================================

  describe('coupon delete', () => {
    let testCouponId: string;

    beforeAll(async () => {
      const timestamps = getTimestamps();
      const client = createSdkClient(testConfig.authConfig, testConfig.baseUrl);

      testCouponId = await client.v4Platform.createCoupon({
        name: `Coupon To Delete ${Date.now()}`,
        type: 'MAX_OUT',
        availableAmount: 10,
        receiveStartTime: timestamps.receiveStart,
        receiveEndTime: timestamps.receiveEnd,
        useTimeType: 'RANGE',
        useStartTime: timestamps.useStart,
        useEndTime: timestamps.useEnd,
        rule: {
          condition: 'FULL_REDUCE',
          limitPerPerson: 1,
          fullReduce: { enable: true, full: 50, reduce: 10, unit: 'MONEY' }
        }
      });
    });

    it('should delete a coupon successfully', async () => {
      const client = createSdkClient(testConfig.authConfig, testConfig.baseUrl);

      // Delete operation may return undefined or void
      await client.v4Platform.deleteCouponsBatch({
        couponIds: [testCouponId]
      });
      // If no error is thrown, deletion was successful
    }, 15000);

    it('should batch delete multiple coupons', async () => {
      const timestamps = getTimestamps();
      const client = createSdkClient(testConfig.authConfig, testConfig.baseUrl);

      const couponId1 = await client.v4Platform.createCoupon({
        name: `Batch Delete 1 ${Date.now()}`,
        type: 'MAX_OUT',
        availableAmount: 10,
        receiveStartTime: timestamps.receiveStart,
        receiveEndTime: timestamps.receiveEnd,
        useTimeType: 'RANGE',
        useStartTime: timestamps.useStart,
        useEndTime: timestamps.useEnd,
        rule: {
          condition: 'FULL_REDUCE',
          limitPerPerson: 1,
          fullReduce: { enable: true, full: 100, reduce: 10, unit: 'MONEY' }
        }
      });

      const couponId2 = await client.v4Platform.createCoupon({
        name: `Batch Delete 2 ${Date.now()}`,
        type: 'MAX_OUT',
        availableAmount: 10,
        receiveStartTime: timestamps.receiveStart,
        receiveEndTime: timestamps.receiveEnd,
        useTimeType: 'RANGE',
        useStartTime: timestamps.useStart,
        useEndTime: timestamps.useEnd,
        rule: {
          condition: 'FULL_REDUCE',
          limitPerPerson: 1,
          fullReduce: { enable: true, full: 100, reduce: 10, unit: 'MONEY' }
        }
      });

      // Delete operation may return undefined or void
      await client.v4Platform.deleteCouponsBatch({
        couponIds: [couponId1, couponId2]
      });
      // If no error is thrown, deletion was successful
    }, 20000);
  });

  // ========================================
  // Coupon Lifecycle Test
  // ========================================

  describe('coupon lifecycle (CRUD)', () => {
    it('should complete full coupon lifecycle', async () => {
      const timestamps = getTimestamps();
      const client = createSdkClient(testConfig.authConfig, testConfig.baseUrl);

      // 1. Create
      const couponId = await client.v4Platform.createCoupon({
        name: `Lifecycle Coupon ${Date.now()}`,
        type: 'MAX_OUT',
        availableAmount: 100,
        receiveStartTime: timestamps.receiveStart,
        receiveEndTime: timestamps.receiveEnd,
        useTimeType: 'RANGE',
        useStartTime: timestamps.useStart,
        useEndTime: timestamps.useEnd,
        rule: {
          condition: 'FULL_REDUCE',
          limitPerPerson: 1,
          fullReduce: {
            enable: true,
            full: 200,
            reduce: 50,
            unit: 'MONEY'
          }
        }
      });

      expect(couponId).toBeDefined();
      expect(typeof couponId).toBe('string');

      // 2. Read - Verify it exists in list
      const listResult = await client.v4Platform.searchCoupons({
        pageNumber: 1,
        pageSize: 100
      });

      const found = listResult.contents.find(c => c.couponId === couponId);
      expect(found).toBeDefined();
      expect(found?.name).toContain('Lifecycle Coupon');

      // 3. Delete
      await client.v4Platform.deleteCouponsBatch({
        couponIds: [couponId]
      });
      // If no error is thrown, deletion was successful

      // 4. Verify deletion
      const afterDelete = await client.v4Platform.searchCoupons({
        pageNumber: 1,
        pageSize: 100
      });

      const deletedCoupon = afterDelete.contents.find(c => c.couponId === couponId);
      if (deletedCoupon) {
        expect(deletedCoupon.status).toBe('INVALID');
      }
    }, 30000);
  });
});
