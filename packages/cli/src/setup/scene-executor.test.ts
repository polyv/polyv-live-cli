/**
 * @fileoverview ATDD Unit tests for SceneExecutor (Story 8-4)
 * TDD RED PHASE - These tests will FAIL until the feature is implemented
 */

import { SceneExecutor, ExecutionResult, ResourceResult } from './scene-executor';
import { SceneConfig, SceneResource } from './scene-config-loader';
import { ResourceHandlers, createResourceHandlers } from './resource-handlers';
import { VariableResolver } from './variable-resolver';
import { PolyVClient } from 'polyv-live-api-sdk';

// Mock dependencies
jest.mock('./resource-handlers', () => ({
  createResourceHandlers: jest.fn(),
}));
jest.mock('./variable-resolver');
jest.mock('polyv-live-api-sdk');

describe('SceneExecutor', () => {
  let executor: SceneExecutor;
  let mockClient: jest.Mocked<PolyVClient>;
  let mockHandlers: jest.Mocked<ResourceHandlers>;
  let mockResolver: jest.Mocked<VariableResolver>;

  const basicConfig: SceneConfig = {
    name: 'test-scene',
    version: '1.0',
    description: 'Test scene',
    resources: [
      {
        id: 'channel',
        type: 'channel',
        params: { name: 'Test Channel' },
        output: { channelId: 'channelId' }
      }
    ]
  };

  const multiResourceConfig: SceneConfig = {
    name: 'multi-scene',
    version: '1.0',
    description: 'Multi resource scene',
    resources: [
      {
        id: 'channel',
        type: 'channel',
        params: { name: 'Test Channel' },
        output: { channelId: 'channelId', channelName: 'name' }
      },
      {
        id: 'product',
        type: 'product',
        dependsOn: 'channel',
        params: {
          channelId: '{channel.channelId}',
          name: 'Test Product'
        },
        output: { productId: 'productId' }
      },
      {
        id: 'coupon',
        type: 'coupon',
        params: { name: 'Test Coupon' },
        output: { couponId: 'couponId' }
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockClient = {} as any;
    mockHandlers = {
      channel: {
        create: jest.fn(),
        rollback: jest.fn()
      },
      product: {
        create: jest.fn(),
        rollback: jest.fn()
      },
      coupon: {
        create: jest.fn(),
        rollback: jest.fn()
      }
    } as any;

    mockResolver = {
      resolve: jest.fn((str) => str),
      resolveObject: jest.fn((obj) => obj)
    } as any;

    (createResourceHandlers as jest.Mock).mockReturnValue(mockHandlers);
    (VariableResolver as jest.Mock).mockImplementation(() => mockResolver);

    executor = new SceneExecutor(mockClient);
  });

  // ========================================
  // AC4: 按配置顺序创建资源
  // ========================================
  describe('execute - resource creation order', () => {
    it('[P0] should create resources in configured order', async () => {
      const executionOrder: string[] = [];
      mockHandlers.channel.create.mockImplementation(async () => {
        executionOrder.push('channel');
        return { channelId: 'ch_123', name: 'Test Channel' };
      });
      mockHandlers.product.create.mockImplementation(async () => {
        executionOrder.push('product');
        return { productId: 'prod_456' };
      });
      mockHandlers.coupon.create.mockImplementation(async () => {
        executionOrder.push('coupon');
        return { couponId: 'cpn_789' };
      });

      await executor.execute(multiResourceConfig);

      expect(executionOrder).toEqual(['channel', 'product', 'coupon']);
    });

    it('[P0] should wait for dependency before creating dependent resource', async () => {
      let channelCreated = false;

      mockHandlers.channel.create.mockImplementation(async () => {
        channelCreated = true;
        return { channelId: 'ch_123', name: 'Test Channel' };
      });

      mockHandlers.product.create.mockImplementation(async () => {
        expect(channelCreated).toBe(true);
        return { productId: 'prod_456' };
      });

      await executor.execute(multiResourceConfig);

      expect(mockHandlers.product.create).toHaveBeenCalled();
    });
  });

  // ========================================
  // AC4: 支持资源间依赖
  // ========================================
  describe('execute - resource dependencies', () => {
    it('[P0] should resolve resource references in params', async () => {
      mockHandlers.channel.create.mockResolvedValue({ channelId: 'ch_123', name: 'Test' });
      mockHandlers.product.create.mockResolvedValue({ productId: 'prod_456' });

      mockResolver.resolveObject.mockImplementation((obj: any, outputs?: any) => {
        if (obj.channelId === '{channel.channelId}' && outputs?.channel) {
          return { ...obj, channelId: outputs.channel.channelId };
        }
        return obj;
      });

      await executor.execute(multiResourceConfig);

      // Product should receive resolved channelId (create is called with params and outputConfig)
      expect(mockHandlers.product.create).toHaveBeenCalledWith(
        expect.objectContaining({ channelId: 'ch_123' }),
        expect.any(Object)
      );
    });

    it('[P1] should handle multiple dependencies', async () => {
      const configWithMultipleDeps: SceneConfig = {
        name: 'multi-deps',
        version: '1.0',
        resources: [
          { id: 'a', type: 'channel', params: {}, output: { id: 'id' } },
          { id: 'b', type: 'product', params: {}, output: { id: 'id' } },
          {
            id: 'c',
            type: 'coupon',
            dependsOn: ['a', 'b'], // Multiple dependencies
            params: {},
            output: { id: 'id' }
          }
        ]
      };

      mockHandlers.channel.create.mockResolvedValue({ id: 'a_id' });
      mockHandlers.product.create.mockResolvedValue({ id: 'b_id' });
      mockHandlers.coupon.create.mockResolvedValue({ id: 'c_id' });

      await executor.execute(configWithMultipleDeps);

      // Both a and b should be created before c
      expect(mockHandlers.channel.create).toHaveBeenCalled();
      expect(mockHandlers.product.create).toHaveBeenCalled();
      expect(mockHandlers.coupon.create).toHaveBeenCalled();
    });

    it('[P1] should compute correct execution order with dependencies', () => {
      const config: SceneConfig = {
        name: 'complex',
        version: '1.0',
        resources: [
          { id: 'd', type: 'coupon', dependsOn: 'b', params: {}, output: {} },
          { id: 'a', type: 'channel', params: {}, output: {} },
          { id: 'c', type: 'product', dependsOn: 'a', params: {}, output: {} },
          { id: 'b', type: 'product', dependsOn: 'a', params: {}, output: {} }
        ]
      };

      const order = executor.getExecutionOrder(config);

      // a must come first (no dependencies)
      expect(order.indexOf('a')).toBe(0);
      // b and c depend on a
      expect(order.indexOf('b')).toBeGreaterThan(order.indexOf('a'));
      expect(order.indexOf('c')).toBeGreaterThan(order.indexOf('a'));
      // d depends on b
      expect(order.indexOf('d')).toBeGreaterThan(order.indexOf('b'));
    });
  });

  // ========================================
  // AC5: 创建失败时自动回滚
  // ========================================
  describe('execute - automatic rollback on failure', () => {
    it('[P0] should rollback created resources when subsequent resource fails', async () => {
      // Execution order: channel → product → coupon
      // When product fails, only channel has been created
      mockHandlers.channel.create.mockResolvedValue({ channelId: 'ch_123' });
      mockHandlers.product.create.mockRejectedValue(new Error('Product creation failed'));

      await expect(executor.execute(multiResourceConfig))
        .rejects
        .toThrow('Product creation failed');

      // Only channel should be rolled back (coupon not created yet when product fails)
      expect(mockHandlers.channel.rollback).toHaveBeenCalled();
      expect(mockHandlers.coupon.rollback).not.toHaveBeenCalled();
    });

    it('[P0] should rollback in reverse order of creation', async () => {
      const rollbackOrder: string[] = [];

      // Use a config where coupon is created before product fails
      const config: SceneConfig = {
        name: 'test',
        version: '1.0',
        resources: [
          { id: 'channel', type: 'channel', params: {}, output: {} },
          { id: 'coupon', type: 'coupon', params: {}, output: {} },
          { id: 'product', type: 'product', dependsOn: 'channel', params: {}, output: {} }
        ]
      };

      mockHandlers.channel.create.mockResolvedValue({ channelId: 'ch_123' });
      mockHandlers.coupon.create.mockResolvedValue({ couponId: 'cpn_789' });
      mockHandlers.product.create.mockRejectedValue(new Error('Failed'));

      mockHandlers.channel.rollback.mockImplementation(async () => {
        rollbackOrder.push('channel');
      });
      mockHandlers.coupon.rollback.mockImplementation(async () => {
        rollbackOrder.push('coupon');
      });

      await expect(executor.execute(config))
        .rejects
        .toThrow();

      // Rollback should be in reverse order: coupon, channel
      expect(rollbackOrder).toEqual(['coupon', 'channel']);
    });

    it('[P1] should continue rollback even if one rollback fails', async () => {
      const config: SceneConfig = {
        name: 'test',
        version: '1.0',
        resources: [
          { id: 'channel', type: 'channel', params: {}, output: {} },
          { id: 'coupon', type: 'coupon', params: {}, output: {} },
          { id: 'product', type: 'product', dependsOn: 'channel', params: {}, output: {} }
        ]
      };

      mockHandlers.channel.create.mockResolvedValue({ channelId: 'ch_123' });
      mockHandlers.coupon.create.mockResolvedValue({ couponId: 'cpn_789' });
      mockHandlers.product.create.mockRejectedValue(new Error('Failed'));

      mockHandlers.channel.rollback.mockRejectedValue(new Error('Rollback failed'));
      mockHandlers.coupon.rollback.mockResolvedValue(undefined);

      // Should not throw - rollback continues despite errors
      await expect(executor.execute(config))
        .rejects
        .toThrow('Failed to create resource');

      // Both rollbacks should have been attempted
      expect(mockHandlers.channel.rollback).toHaveBeenCalled();
      expect(mockHandlers.coupon.rollback).toHaveBeenCalled();
    });

    it('[P1] should not rollback resources created after failure point', async () => {
      const config: SceneConfig = {
        name: 'test',
        version: '1.0',
        resources: [
          { id: 'a', type: 'channel', params: {}, output: {} },
          { id: 'b', type: 'product', params: {}, output: {} },
          { id: 'c', type: 'coupon', params: {}, output: {} }
        ]
      };

      mockHandlers.channel.create.mockResolvedValue({ id: 'a' });
      mockHandlers.product.create.mockRejectedValue(new Error('B failed'));
      mockHandlers.coupon.create.mockResolvedValue({ id: 'c' });

      await expect(executor.execute(config))
        .rejects
        .toThrow();

      // C should not be created since B failed first
      expect(mockHandlers.coupon.create).not.toHaveBeenCalled();
      // Only A should be rolled back
      expect(mockHandlers.channel.rollback).toHaveBeenCalled();
      expect(mockHandlers.coupon.rollback).not.toHaveBeenCalled();
    });

    it('[P2] should track created resources for rollback', async () => {
      const trackResource = jest.spyOn(executor as any, 'trackCreatedResource');

      mockHandlers.channel.create.mockResolvedValue({ channelId: 'ch_123' });

      await executor.execute(basicConfig);

      expect(trackResource).toHaveBeenCalledWith('channel', { channelId: 'ch_123' });
    });
  });

  // ========================================
  // Execution Result
  // ========================================
  describe('execute - return results', () => {
    it('[P0] should return execution results on success', async () => {
      mockHandlers.channel.create.mockResolvedValue({ channelId: 'ch_123', name: 'Test' });
      mockHandlers.product.create.mockResolvedValue({ productId: 'prod_456' });
      mockHandlers.coupon.create.mockResolvedValue({ couponId: 'cpn_789' });

      const result = await executor.execute(multiResourceConfig);

      expect(result.success).toBe(true);
      expect(result.resources).toHaveLength(3);
      expect(result.resources[0]).toEqual({
        id: 'channel',
        type: 'channel',
        output: { channelId: 'ch_123', name: 'Test' },
        status: 'created'
      });
    });

    it('[P0] should return failure result with rollback info', async () => {
      mockHandlers.channel.create.mockResolvedValue({ channelId: 'ch_123' });
      mockHandlers.product.create.mockRejectedValue(new Error('Failed'));
      mockHandlers.channel.rollback.mockResolvedValue(undefined);

      try {
        await executor.execute(multiResourceConfig);
      } catch (error) {
        // Expected
      }

      // Should have tracked what was rolled back
      expect(executor.getLastExecution().rolledBack).toContain('channel');
    });

    it('[P1] should include timing information', async () => {
      mockHandlers.channel.create.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return { channelId: 'ch_123' };
      });

      const result = await executor.execute(basicConfig);

      expect(result.duration).toBeGreaterThan(0);
      expect(result.resourceTimings).toBeDefined();
    });
  });

  // ========================================
  // Progress Reporting
  // ========================================
  describe('execute - progress reporting', () => {
    it('[P1] should report progress for each resource', async () => {
      const progressCallback = jest.fn();
      executor.setProgressCallback(progressCallback);

      mockHandlers.channel.create.mockResolvedValue({ channelId: 'ch_123' });
      mockHandlers.product.create.mockResolvedValue({ productId: 'prod_456' });
      mockHandlers.coupon.create.mockResolvedValue({ couponId: 'cpn_789' });

      await executor.execute(multiResourceConfig);

      expect(progressCallback).toHaveBeenCalledWith(
        expect.objectContaining({ phase: 'creating', resourceId: 'channel' })
      );
      expect(progressCallback).toHaveBeenCalledWith(
        expect.objectContaining({ phase: 'created', resourceId: 'channel' })
      );
    });

    it('[P1] should report rollback progress', async () => {
      const progressCallback = jest.fn();
      executor.setProgressCallback(progressCallback);

      mockHandlers.channel.create.mockResolvedValue({ channelId: 'ch_123' });
      mockHandlers.product.create.mockRejectedValue(new Error('Failed'));
      mockHandlers.channel.rollback.mockResolvedValue(undefined);

      try {
        await executor.execute(multiResourceConfig);
      } catch (error) {
        // Expected
      }

      expect(progressCallback).toHaveBeenCalledWith(
        expect.objectContaining({ phase: 'rolling_back', resourceId: 'channel' })
      );
    });
  });

  // ========================================
  // Error Handling
  // ========================================
  describe('execute - error handling', () => {
    it('[P0] should provide clear error message on creation failure', async () => {
      mockHandlers.channel.create.mockRejectedValue(new Error('API Error: Invalid parameters'));

      await expect(executor.execute(basicConfig))
        .rejects
        .toThrow('Failed to create resource "channel": API Error: Invalid parameters');
    });

    it('[P1] should handle unknown resource type', async () => {
      const invalidConfig: SceneConfig = {
        name: 'test',
        version: '1.0',
        resources: [
          { id: 'unknown', type: 'invalid-type' as any, params: {}, output: {} }
        ]
      };

      await expect(executor.execute(invalidConfig))
        .rejects
        .toThrow('Unknown resource type: invalid-type');
    });

    it('[P2] should handle timeout errors', async () => {
      mockHandlers.channel.create.mockImplementation(async () => {
        await new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 100));
        return { channelId: 'ch_123' };
      });

      await expect(executor.execute(basicConfig, { timeout: 50 }))
        .rejects
        .toThrow();
    });
  });

  // ========================================
  // Dry Run Mode
  // ========================================
  describe('execute - dry run mode', () => {
    it('[P1] should not create resources in dry run mode', async () => {
      await executor.execute(basicConfig, { dryRun: true });

      expect(mockHandlers.channel.create).not.toHaveBeenCalled();
    });

    it('[P1] should return what would be created in dry run mode', async () => {
      const result = await executor.execute(multiResourceConfig, { dryRun: true });

      expect(result.success).toBe(true);
      expect(result.dryRun).toBe(true);
      expect(result.resources).toHaveLength(3);
      expect(result.resources[0].status).toBe('would_create');
    });

    it('[P1] should validate dependencies in dry run mode', async () => {
      const invalidDepsConfig: SceneConfig = {
        name: 'test',
        version: '1.0',
        resources: [
          { id: 'a', type: 'product', dependsOn: 'nonexistent', params: {}, output: {} }
        ]
      };

      await expect(executor.execute(invalidDepsConfig, { dryRun: true }))
        .rejects
        .toThrow('Dependency "nonexistent" not found');
    });
  });
});
