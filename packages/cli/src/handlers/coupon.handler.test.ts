/**
 * @fileoverview Unit tests for CouponHandler
 */

import { CouponHandler } from './coupon.handler';
import { AuthConfig } from '../types/auth';
import { PolyVValidationError } from '../utils/errors';

// Mock the SDK module
const mockV4Platform = {
  createCoupon: jest.fn(),
  searchCoupons: jest.fn(),
  deleteCouponsBatch: jest.fn()
};

const mockClient = {
  v4Platform: mockV4Platform
};

jest.mock('../sdk', () => ({
  createSdkClient: jest.fn(() => mockClient)
}));

// Mock console methods to suppress output during tests
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});

describe('CouponHandler', () => {
  let couponHandler: CouponHandler;
  let mockAuthConfig: AuthConfig;
  let mockServiceConfig: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Ensure console methods are properly mocked and silent
    mockConsoleLog.mockImplementation(() => {});
    mockConsoleError.mockImplementation(() => {});
    mockConsoleWarn.mockImplementation(() => {});

    // Mock configs
    mockAuthConfig = {
      appId: 'test-app-id',
      appSecret: 'test-app-secret',
      userId: 'test-user-id'
    };

    mockServiceConfig = {
      baseUrl: 'https://api.polyv.net',
      timeout: 30000,
      debug: false
    };

    // Create handler instance
    couponHandler = new CouponHandler(mockAuthConfig, mockServiceConfig);
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
    mockConsoleWarn.mockRestore();
  });

  // ========================================
  // AC1: addCoupon - 创建优惠券
  // ========================================
  describe('addCoupon', () => {
    const validMaxOutOptions = {
      name: '满100减20',
      type: 'MAX_OUT' as const,
      availableAmount: 100,
      receiveStart: 1704067200000,
      receiveEnd: 1704153600000,
      useTimeType: 'RANGE' as const,
      useStart: 1704067200000,
      useEnd: 1704758400000,
      condition: 'FULL_REDUCE' as const,
      full: 100,
      reduce: 20,
      limitPerPerson: 1,
      output: 'table' as const
    };

    const validDiscountOptions = {
      name: '8折优惠券',
      type: 'DISCOUNT' as const,
      availableAmount: 200,
      receiveStart: 1704067200000,
      receiveEnd: 1704153600000,
      useTimeType: 'DAY' as const,
      dayOfUse: 7,
      condition: 'UNCONDITIONAL' as const,
      discount: 80,
      limitPerPerson: 1,
      output: 'json' as const
    };

    it('[P0] should create MAX_OUT coupon (满减券) with valid options', async () => {
      mockV4Platform.createCoupon.mockResolvedValue('coupon123456');

      await expect(couponHandler.addCoupon(validMaxOutOptions)).resolves.toBeUndefined();

      expect(mockV4Platform.createCoupon).toHaveBeenCalledWith(expect.objectContaining({
        name: '满100减20',
        type: 'MAX_OUT',
        availableAmount: 100,
        useTimeType: 'RANGE'
      }));
    });

    it('[P0] should create DISCOUNT coupon (折扣券) with valid options', async () => {
      mockV4Platform.createCoupon.mockResolvedValue('coupon789012');

      await expect(couponHandler.addCoupon(validDiscountOptions)).resolves.toBeUndefined();

      expect(mockV4Platform.createCoupon).toHaveBeenCalledWith(expect.objectContaining({
        name: '8折优惠券',
        type: 'DISCOUNT',
        useTimeType: 'DAY',
        dayOfUse: 7
      }));
    });

    it('[P0] should throw validation error for missing required fields', async () => {
      const invalidOptions = {
        // Missing name, type, etc.
        availableAmount: 100,
        output: 'table' as const
      } as any;

      await expect(couponHandler.addCoupon(invalidOptions))
        .rejects
        .toThrow(PolyVValidationError);

      expect(mockV4Platform.createCoupon).not.toHaveBeenCalled();
    });

    it('[P1] should validate useTimeType RANGE requires useStart and useEnd', async () => {
      const invalidOptions = {
        ...validMaxOutOptions,
        useTimeType: 'RANGE' as const,
        useStart: undefined,
        useEnd: undefined
      };

      await expect(couponHandler.addCoupon(invalidOptions))
        .rejects
        .toThrow(PolyVValidationError);
    });

    it('[P1] should validate useTimeType DAY requires dayOfUse', async () => {
      const invalidOptions = {
        ...validDiscountOptions,
        useTimeType: 'DAY' as const,
        dayOfUse: undefined
      };

      await expect(couponHandler.addCoupon(invalidOptions))
        .rejects
        .toThrow(PolyVValidationError);
    });

    it('[P1] should validate UNCONDITIONAL rule condition', async () => {
      const unconditionalOptions = {
        ...validMaxOutOptions,
        condition: 'UNCONDITIONAL' as const,
        discount: 80, // Required for UNCONDITIONAL condition
        full: undefined
      };

      mockV4Platform.createCoupon.mockResolvedValue('coupon001');

      await expect(couponHandler.addCoupon(unconditionalOptions)).resolves.toBeUndefined();

      expect(mockV4Platform.createCoupon).toHaveBeenCalledWith(expect.objectContaining({
        rule: expect.objectContaining({
          condition: 'UNCONDITIONAL'
        })
      }));
    });

    it('[P1] should validate FULL_REDUCE rule condition requires full and reduce', async () => {
      const fullReduceOptions = {
        ...validMaxOutOptions,
        condition: 'FULL_REDUCE' as const,
        full: 100,
        reduce: 20
      };

      mockV4Platform.createCoupon.mockResolvedValue('coupon002');

      await expect(couponHandler.addCoupon(fullReduceOptions)).resolves.toBeUndefined();

      expect(mockV4Platform.createCoupon).toHaveBeenCalledWith(expect.objectContaining({
        rule: expect.objectContaining({
          condition: 'FULL_REDUCE',
          fullReduce: expect.objectContaining({
            full: 100,
            reduce: 20
          })
        })
      }));
    });

    it('[P1] should throw error for invalid type', async () => {
      const invalidOptions = {
        ...validMaxOutOptions,
        type: 'INVALID_TYPE' as any
      };

      await expect(couponHandler.addCoupon(invalidOptions))
        .rejects
        .toThrow(PolyVValidationError);
    });

    it('[P1] should validate name length (max 50 characters)', async () => {
      const invalidOptions = {
        ...validMaxOutOptions,
        name: 'a'.repeat(51)
      };

      await expect(couponHandler.addCoupon(invalidOptions))
        .rejects
        .toThrow(PolyVValidationError);
    });

    it('[P1] should validate availableAmount is non-negative', async () => {
      const invalidOptions = {
        ...validMaxOutOptions,
        availableAmount: -1
      };

      await expect(couponHandler.addCoupon(invalidOptions))
        .rejects
        .toThrow(PolyVValidationError);
    });

    it('[P1] should output table format correctly', async () => {
      mockV4Platform.createCoupon.mockResolvedValue('coupon123456');

      await couponHandler.addCoupon({ ...validMaxOutOptions, output: 'table' });

      // Verify table output was called (mockConsoleLog captures the output)
      expect(mockV4Platform.createCoupon).toHaveBeenCalled();
    });

    it('[P1] should output JSON format correctly', async () => {
      mockV4Platform.createCoupon.mockResolvedValue('coupon123456');

      await couponHandler.addCoupon({ ...validMaxOutOptions, output: 'json' });

      expect(mockV4Platform.createCoupon).toHaveBeenCalled();
    });
  });

  // ========================================
  // AC2: listCoupons - 查询优惠券列表
  // ========================================
  describe('listCoupons', () => {
    const mockCouponList = [
      {
        couponId: 'coupon001',
        name: '满100减20',
        type: 'MAX_OUT',
        status: 'GOING',
        availableAmount: 100,
        receiveStartTime: 1704067200000,
        receiveEndTime: 1704153600000,
        receivedAmount: 0,
        useTimeType: 'RANGE'
      },
      {
        couponId: 'coupon002',
        name: '8折优惠券',
        type: 'DISCOUNT',
        status: 'NOT_START',
        availableAmount: 200,
        receiveStartTime: 1704067200000,
        receiveEndTime: 1704153600000,
        receivedAmount: 0,
        useTimeType: 'DAY'
      }
    ];

    beforeEach(() => {
      mockV4Platform.searchCoupons.mockResolvedValue({
        contents: mockCouponList,
        total: 2,
        pageNumber: 1,
        pageSize: 10
      });
    });

    it('[P0] should list coupons with default pagination', async () => {
      await expect(couponHandler.listCoupons()).resolves.toBeUndefined();

      expect(mockV4Platform.searchCoupons).toHaveBeenCalledWith({
        pageNumber: 1,
        pageSize: 10
      });
    });

    it('[P0] should list coupons with NOT_START status filter', async () => {
      await couponHandler.listCoupons({ status: 'NOT_START' });

      expect(mockV4Platform.searchCoupons).toHaveBeenCalledWith(expect.objectContaining({
        status: 'NOT_START'
      }));
    });

    it('[P0] should list coupons with GOING status filter', async () => {
      await couponHandler.listCoupons({ status: 'GOING' });

      expect(mockV4Platform.searchCoupons).toHaveBeenCalledWith(expect.objectContaining({
        status: 'GOING'
      }));
    });

    it('[P0] should list coupons with FINISHED status filter', async () => {
      await couponHandler.listCoupons({ status: 'FINISHED' });

      expect(mockV4Platform.searchCoupons).toHaveBeenCalledWith(expect.objectContaining({
        status: 'FINISHED'
      }));
    });

    it('[P0] should list coupons with INVALID status filter', async () => {
      await couponHandler.listCoupons({ status: 'INVALID' });

      expect(mockV4Platform.searchCoupons).toHaveBeenCalledWith(expect.objectContaining({
        status: 'INVALID'
      }));
    });

    it('[P1] should list coupons with custom page and size', async () => {
      await couponHandler.listCoupons({ page: 2, size: 20 });

      expect(mockV4Platform.searchCoupons).toHaveBeenCalledWith({
        pageNumber: 2,
        pageSize: 20
      });
    });

    it('[P1] should output table format by default', async () => {
      await couponHandler.listCoupons();

      expect(mockV4Platform.searchCoupons).toHaveBeenCalled();
    });

    it('[P1] should output JSON format when specified', async () => {
      await couponHandler.listCoupons({ output: 'json' });

      expect(mockV4Platform.searchCoupons).toHaveBeenCalled();
    });

    it('[P1] should validate page number (must be >= 1)', async () => {
      await expect(couponHandler.listCoupons({ page: 0 }))
        .rejects
        .toThrow(PolyVValidationError);
    });

    it('[P1] should validate page size (must be <= 1000)', async () => {
      await expect(couponHandler.listCoupons({ size: 1001 }))
        .rejects
        .toThrow(PolyVValidationError);
    });

    it('[P1] should handle empty coupon list', async () => {
      mockV4Platform.searchCoupons.mockResolvedValue({
        contents: [],
        total: 0,
        pageNumber: 1,
        pageSize: 10
      });

      await expect(couponHandler.listCoupons()).resolves.toBeUndefined();
    });
  });

  // ========================================
  // AC3: deleteCoupons - 批量删除优惠券
  // ========================================
  describe('deleteCoupons', () => {
    it('[P0] should delete single coupon', async () => {
      mockV4Platform.deleteCouponsBatch.mockResolvedValue({});

      await couponHandler.deleteCoupons({ couponIds: ['coupon001'] });

      expect(mockV4Platform.deleteCouponsBatch).toHaveBeenCalledWith({
        couponIds: ['coupon001']
      });
    });

    it('[P0] should delete batch coupons (multiple IDs)', async () => {
      mockV4Platform.deleteCouponsBatch.mockResolvedValue({});

      await couponHandler.deleteCoupons({
        couponIds: ['coupon001', 'coupon002', 'coupon003']
      });

      expect(mockV4Platform.deleteCouponsBatch).toHaveBeenCalledWith({
        couponIds: ['coupon001', 'coupon002', 'coupon003']
      });
    });

    it('[P1] should validate max 200 IDs limit', async () => {
      const tooManyIds = Array.from({ length: 201 }, (_, i) => `coupon${i}`);

      await expect(couponHandler.deleteCoupons({ couponIds: tooManyIds }))
        .rejects
        .toThrow(PolyVValidationError);

      expect(mockV4Platform.deleteCouponsBatch).not.toHaveBeenCalled();
    });

    it('[P1] should throw error for empty couponIds', async () => {
      await expect(couponHandler.deleteCoupons({ couponIds: [] }))
        .rejects
        .toThrow(PolyVValidationError);

      expect(mockV4Platform.deleteCouponsBatch).not.toHaveBeenCalled();
    });

    it('[P1] should accept exactly 200 IDs (boundary test)', async () => {
      const maxIds = Array.from({ length: 200 }, (_, i) => `coupon${i}`);
      mockV4Platform.deleteCouponsBatch.mockResolvedValue({});

      await expect(couponHandler.deleteCoupons({ couponIds: maxIds })).resolves.toBeUndefined();

      expect(mockV4Platform.deleteCouponsBatch).toHaveBeenCalled();
    });

    it('[P1] should output success message in table format', async () => {
      mockV4Platform.deleteCouponsBatch.mockResolvedValue({});

      await couponHandler.deleteCoupons({
        couponIds: ['coupon001'],
        output: 'table'
      });

      expect(mockV4Platform.deleteCouponsBatch).toHaveBeenCalled();
    });

    it('[P1] should output success message in JSON format', async () => {
      mockV4Platform.deleteCouponsBatch.mockResolvedValue({});

      await couponHandler.deleteCoupons({
        couponIds: ['coupon001'],
        output: 'json'
      });

      expect(mockV4Platform.deleteCouponsBatch).toHaveBeenCalled();
    });
  });

  // ========================================
  // Error handling
  // ========================================
  describe('Error handling', () => {
    it('[P0] should handle API errors with user-friendly messages', async () => {
      const apiError = new Error('API error: Coupon name already exists');
      mockV4Platform.createCoupon.mockRejectedValue(apiError);

      await expect(couponHandler.addCoupon({
        name: '重复名称',
        type: 'MAX_OUT',
        availableAmount: 100,
        receiveStart: 1704067200000,
        receiveEnd: 1704153600000,
        useTimeType: 'RANGE',
        useStart: 1704067200000,
        useEnd: 1704758400000,
        condition: 'UNCONDITIONAL',
        reduce: 10,
        limitPerPerson: 1,
        output: 'table'
      })).rejects.toThrow();
    });

    it('[P1] should handle authentication errors', async () => {
      const authError = new Error('Authentication failed');
      mockV4Platform.searchCoupons.mockRejectedValue(authError);

      await expect(couponHandler.listCoupons())
        .rejects
        .toThrow();
    });

    it('[P1] should handle network errors', async () => {
      const networkError = new Error('Network connection failed');
      mockV4Platform.deleteCouponsBatch.mockRejectedValue(networkError);

      await expect(couponHandler.deleteCoupons({ couponIds: ['coupon001'] }))
        .rejects
        .toThrow();
    });
  });
});
