/**
 * @fileoverview Unit tests for ResourceHandlers (Story 8-4)
 */

import {
  ResourceHandlers,
  ResourceHandler,
  createResourceHandlers
} from './resource-handlers';

// Mock the SDK
jest.mock('polyv-live-api-sdk', () => ({
  PolyVClient: jest.fn()
}));

describe('ResourceHandlers', () => {
  let mockClient: any;
  let handlers: ResourceHandlers;

  beforeEach(() => {
    jest.clearAllMocks();

    mockClient = {
      channel: {
        createChannelV4: jest.fn(),
        updateWatchCondition: jest.fn(),
        deleteChannel: jest.fn(),
        addChannelProduct: jest.fn(),
        deleteChannelProduct: jest.fn(),
        updateChannelProductEnabled: jest.fn(),
        updateChannelConfig: jest.fn()
      },
      v4Channel: {
        addChannelCoupon: jest.fn()
      } as any,
      v4Platform: {
        createCoupon: jest.fn(),
        deleteCouponsBatch: jest.fn()
      }
    };

    handlers = createResourceHandlers(mockClient);
  });

  // ========================================
  // Channel Handler
  // ========================================
  describe('channel handler', () => {
    it('should be defined', () => {
      expect(handlers.channel).toBeDefined();
      expect(handlers.channel.create).toBeDefined();
      expect(handlers.channel.rollback).toBeDefined();
    });

    it('[P0] should create channel with resolved params', async () => {
      const params = {
        name: '电商示例频道-1710960000000',
        newScene: 'alone',
        template: 'portrait_alone',
        channelPasswd: 'abc123xyz'
      };

      mockClient.channel.createChannelV4.mockResolvedValue({
        channelId: 123456,
        userId: 'test-user',
        channelPasswd: 'abc123xyz'
      });

      const result = await handlers.channel.create(params);

      expect(mockClient.channel.createChannelV4).toHaveBeenCalledWith(params);
      expect(result).toEqual({
        channelId: 123456,
        channelName: '电商示例频道-1710960000000',
        channelPasswd: 'abc123xyz',
        userId: 'test-user'
      });
    });

    it('should create channel with outputConfig', async () => {
      mockClient.channel.createChannelV4.mockResolvedValue({
        channelId: 123456,
        userId: 'test-user',
        channelPasswd: 'abc123xyz'
      });

      const result = await handlers.channel.create(
        { name: 'Test' },
        { customId: 'channelId', customName: 'name' }
      );

      expect(result).toEqual({ customId: 123456 });
    });

    it('[P0] should rollback channel by deleting it', async () => {
      const resource = {
        channelId: 'ch_123456',
        name: 'Test Channel'
      };

      mockClient.channel.deleteChannel.mockResolvedValue(true);

      await handlers.channel.rollback!(resource);

      expect(mockClient.channel.deleteChannel).toHaveBeenCalledWith(
        'ch_123456',
        ''
      );
    });

    it('should rollback channel with userId from createdUserId', async () => {
      mockClient.channel.deleteChannel.mockResolvedValue(true);

      await handlers.channel.rollback!({ channelId: 'ch_123', createdUserId: 'user1' });

      expect(mockClient.channel.deleteChannel).toHaveBeenCalledWith('ch_123', 'user1');
    });

    it('should rollback channel with userId', async () => {
      mockClient.channel.deleteChannel.mockResolvedValue(true);

      await handlers.channel.rollback!({ channelId: 'ch_123', userId: 'user2' });

      expect(mockClient.channel.deleteChannel).toHaveBeenCalledWith('ch_123', 'user2');
    });

    it('should throw when rollback channel without channelId', async () => {
      await expect(handlers.channel.rollback!({ name: 'no-id' }))
        .rejects.toThrow('channelId is missing');
    });
  });

  // ========================================
  // Watch Condition Handler
  // ========================================
  describe('watchCondition handler', () => {
    it('should be defined', () => {
      expect(handlers.watchCondition).toBeDefined();
      expect(handlers.watchCondition.create).toBeDefined();
    });

    it('[P0] should set public watch condition', async () => {
      const params = {
        channelId: '123456',
        authSettings: [
          { rank: 1, enabled: 'Y', authType: 'public' },
          { rank: 2, enabled: 'N' }
        ]
      };

      mockClient.channel.updateWatchCondition.mockResolvedValue(true);

      const result = await handlers.watchCondition.create(params);

      expect(mockClient.channel.updateWatchCondition).toHaveBeenCalledWith({
        channelId: '123456',
        authSettings: params.authSettings
      });
      expect(result.success).toBe(true);
      expect(result.channelId).toBe('123456');
    });

    it('should throw error if channelId is missing', async () => {
      await expect(handlers.watchCondition.create({
        authSettings: [{ rank: 1, enabled: 'Y' }]
      }))
        .rejects
        .toThrow('channelId is required');
    });

    it('should throw error if authSettings is missing', async () => {
      await expect(handlers.watchCondition.create({
        channelId: '123456'
      }))
        .rejects
        .toThrow('authSettings array is required');
    });

    it('should throw error if authSettings is not an array', async () => {
      await expect(handlers.watchCondition.create({
        channelId: '123456',
        authSettings: 'invalid'
      }))
        .rejects
        .toThrow('authSettings array is required');
    });

    it('should create watch condition with outputConfig', async () => {
      mockClient.channel.updateWatchCondition.mockResolvedValue(true);

      const result = await handlers.watchCondition.create(
        { channelId: '123', authSettings: [{ rank: 1, enabled: 'Y', authType: 'public' }] },
        { myChannelId: 'channelId' }
      );

      expect(result).toEqual({ myChannelId: '123' });
    });
  });

  // ========================================
  // Product Handler
  // ========================================
  describe('product handler', () => {
    it('should be defined', () => {
      expect(handlers.product).toBeDefined();
      expect(handlers.product.create).toBeDefined();
      expect(handlers.product.rollback).toBeDefined();
    });

    it('[P0] should create product with resolved channelId', async () => {
      const params = {
        channelId: 'ch_123456',
        name: '示例商品',
        price: 99.9,
        status: 1,
        linkType: 10
      };

      mockClient.channel.addChannelProduct.mockResolvedValue({
        productId: 123456,
        name: '示例商品',
        channelId: 'ch_123456'
      });

      const result = await handlers.product.create(params);

      expect(mockClient.channel.addChannelProduct).toHaveBeenCalledWith(params);
      expect(result.productId).toBe(123456);
    });

    it('should throw error if channelId is missing', async () => {
      await expect(handlers.product.create({ name: 'Test' }))
        .rejects
        .toThrow('channelId is required');
    });

    it('should create product with outputConfig', async () => {
      mockClient.channel.addChannelProduct.mockResolvedValue({
        productId: 123456,
        name: '示例商品',
        channelId: 'ch_123'
      });

      const result = await handlers.product.create(
        { channelId: 'ch_123', name: 'Test' },
        { customProductId: 'productId', customName: 'name' }
      );

      expect(result).toEqual({ customProductId: 123456, customName: '示例商品' });
    });

    it('should rollback product', async () => {
      mockClient.channel.deleteChannelProduct.mockResolvedValue(true);
      await handlers.product.rollback!({ channelId: 'ch_123', productId: 'prod_456' });
      expect(mockClient.channel.deleteChannelProduct).toHaveBeenCalledWith({
        channelId: 'ch_123',
        productId: 'prod_456',
      });
    });

    it('should throw when rollback product without channelId or productId', async () => {
      await expect(handlers.product.rollback!({ channelId: 'ch_123' }))
        .rejects.toThrow('channelId or productId is missing');
      await expect(handlers.product.rollback!({ productId: 'prod_456' }))
        .rejects.toThrow('channelId or productId is missing');
    });
  });

  // ========================================
  // ProductEnabled Handler
  // ========================================
  describe('productEnabled handler', () => {
    it('should be defined', () => {
      expect(handlers.productEnabled).toBeDefined();
      expect(handlers.productEnabled.create).toBeDefined();
    });

    it('[P0] should enable channel product library', async () => {
      const params = {
        channelId: '123456',
        enabled: 'Y'
      };

      mockClient.channel.updateChannelProductEnabled.mockResolvedValue(true);

      const result = await handlers.productEnabled.create(params);

      expect(mockClient.channel.updateChannelProductEnabled).toHaveBeenCalledWith({
        channelId: '123456',
        enabled: 'Y'
      });
      expect(result.success).toBe(true);
      expect(result.channelId).toBe('123456');
      expect(result.enabled).toBe('Y');
    });

    it('should throw error if channelId is missing', async () => {
      await expect(handlers.productEnabled.create({ enabled: 'Y' }))
        .rejects
        .toThrow('channelId is required');
    });

    it('should throw error if enabled is missing', async () => {
      await expect(handlers.productEnabled.create({ channelId: '123456' }))
        .rejects
        .toThrow('enabled is required');
    });

    it('should create with outputConfig', async () => {
      mockClient.channel.updateChannelProductEnabled.mockResolvedValue(true);

      const result = await handlers.productEnabled.create(
        { channelId: '123', enabled: 'Y' },
        { myChannelId: 'channelId' }
      );

      expect(result).toEqual({ myChannelId: '123' });
    });
  });

  // ========================================
  // CouponEnabled Handler
  // ========================================
  describe('couponEnabled handler', () => {
    it('should be defined', () => {
      expect(handlers.couponEnabled).toBeDefined();
      expect(handlers.couponEnabled.create).toBeDefined();
    });

    it('[P0] should enable coupon display on watch page', async () => {
      const params = {
        channelId: '123456',
        enabled: 'Y'
      };

      mockClient.channel.updateChannelConfig.mockResolvedValue(true);

      const result = await handlers.couponEnabled.create(params);

      expect(mockClient.channel.updateChannelConfig).toHaveBeenCalledWith({
        channelId: '123456',
        key: 'couponEnabled',
        value: 'Y'
      });
      expect(result.success).toBe(true);
      expect(result.channelId).toBe('123456');
      expect(result.enabled).toBe('Y');
    });

    it('should throw error if channelId is missing', async () => {
      await expect(handlers.couponEnabled.create({ enabled: 'Y' }))
        .rejects
        .toThrow('channelId is required');
    });

    it('should throw error if enabled is missing', async () => {
      await expect(handlers.couponEnabled.create({ channelId: '123456' }))
        .rejects
        .toThrow('enabled is required');
    });

    it('should create with outputConfig', async () => {
      mockClient.channel.updateChannelConfig.mockResolvedValue(true);

      const result = await handlers.couponEnabled.create(
        { channelId: '123', enabled: 'Y' },
        { myChannelId: 'channelId' }
      );

      expect(result).toEqual({ myChannelId: '123' });
    });
  });

  // ========================================
  // CouponChannel Handler
  // ========================================
  describe('couponChannel handler', () => {
    it('should be defined', () => {
      expect(handlers.couponChannel).toBeDefined();
      expect(handlers.couponChannel.create).toBeDefined();
    });

    it('[P0] should associate coupon with channel', async () => {
      const params = {
        channelId: '123456',
        couponIds: ['cpn_001']
      };

      (mockClient as any).v4Channel.addChannelCoupon.mockResolvedValue(true);

      const result = await handlers.couponChannel.create(params);

      expect((mockClient as any).v4Channel.addChannelCoupon).toHaveBeenCalledWith({
        channelId: '123456',
        couponIds: ['cpn_001']
      });
      expect(result.success).toBe(true);
      expect(result.channelId).toBe('123456');
      expect(result.couponIds).toEqual(['cpn_001']);
    });

    it('should throw error if channelId is missing', async () => {
      await expect(handlers.couponChannel.create({ couponIds: ['cpn_001'] }))
        .rejects
        .toThrow('channelId is required');
    });

    it('should throw error if couponIds is missing', async () => {
      await expect(handlers.couponChannel.create({ channelId: '123456' }))
        .rejects
        .toThrow('couponIds array is required');
    });

    it('should throw error if couponIds is empty array', async () => {
      await expect(handlers.couponChannel.create({ channelId: '123456', couponIds: [] }))
        .rejects
        .toThrow('couponIds array is required');
    });

    it('should create with outputConfig', async () => {
      (mockClient as any).v4Channel.addChannelCoupon.mockResolvedValue(true);

      const result = await handlers.couponChannel.create(
        { channelId: '123', couponIds: ['cpn_001'] },
        { myChannelId: 'channelId' }
      );

      expect(result).toEqual({ myChannelId: '123' });
    });
  });

  // ========================================
  // Coupon Handler
  // ========================================
  describe('coupon handler', () => {
    it('should be defined', () => {
      expect(handlers.coupon).toBeDefined();
      expect(handlers.coupon.create).toBeDefined();
      expect(handlers.coupon.rollback).toBeDefined();
    });

    it('[P0] should create coupon', async () => {
      const params = {
        name: '新人专享券',
        type: 'MAX_OUT',
        availableAmount: 100
      };

      mockClient.v4Platform.createCoupon.mockResolvedValue('cpn_123456');

      const result = await handlers.coupon.create(params);

      expect(mockClient.v4Platform.createCoupon).toHaveBeenCalledWith(params);
      expect(result.couponId).toBe('cpn_123456');
    });

    it('[P0] should rollback coupon', async () => {
      const resource = {
        couponId: 'cpn_123456',
        name: 'Test Coupon'
      };

      mockClient.v4Platform.deleteCouponsBatch.mockResolvedValue({});

      await handlers.coupon.rollback!(resource);

      expect(mockClient.v4Platform.deleteCouponsBatch).toHaveBeenCalledWith({
        couponIds: ['cpn_123456']
      });
    });

    it('should create coupon with outputConfig', async () => {
      mockClient.v4Platform.createCoupon.mockResolvedValue('cpn_789');
      const result = await handlers.coupon.create(
        { name: 'Test' },
        { myCoupon: 'couponId' }
      );
      expect(result).toEqual({ myCoupon: 'cpn_789' });
    });

    it('should throw when rollback coupon without couponId', async () => {
      await expect(handlers.coupon.rollback!({ name: 'no-id' }))
        .rejects.toThrow('couponId is missing');
    });
  });

  // ========================================
  // Handler Registry
  // ========================================
  describe('handler registry', () => {
    it('should have handlers for all supported types', () => {
      expect(handlers.channel).toBeDefined();
      expect(handlers.product).toBeDefined();
      expect(handlers.coupon).toBeDefined();
      expect(handlers.productEnabled).toBeDefined();
      expect(handlers.couponEnabled).toBeDefined();
      expect(handlers.couponChannel).toBeDefined();
    });

    it('all handlers should have create method', () => {
      expect(typeof handlers.channel.create).toBe('function');
      expect(typeof handlers.product.create).toBe('function');
      expect(typeof handlers.coupon.create).toBe('function');
    });

    it('all handlers should have rollback method', () => {
      expect(typeof handlers.channel.rollback).toBe('function');
      expect(typeof handlers.product.rollback).toBe('function');
      expect(typeof handlers.coupon.rollback).toBe('function');
    });
  });
});
