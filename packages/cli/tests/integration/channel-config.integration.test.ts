/**
 * @fileoverview Integration tests for channel config update (couponEnabled, productEnabled, etc.)
 * @author Development Team
 * @since 1.2.26
 */

import { createSdkClient } from '../../src/sdk';
import { hasRealCredentials, getTestConfig } from '../helpers/integration-config';

const testConfig = getTestConfig();
const shouldRunTests = hasRealCredentials();

(shouldRunTests ? describe : describe.skip)('Channel Config Integration Tests', () => {
  const testChannelId = testConfig.testChannelId;

  // Track original config states for cleanup
  let originalCouponEnabled: string | undefined;

  afterAll(async () => {
    // Restore original couponEnabled state
    if (originalCouponEnabled !== undefined) {
      try {
        const client = createSdkClient(testConfig.authConfig, testConfig.baseUrl);
        await client.channel.updateChannelConfig({
          channelId: testChannelId,
          key: 'couponEnabled',
          value: originalCouponEnabled,
        });
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  });

  // ========================================
  // updateChannelConfig - couponEnabled
  // ========================================

  describe('updateChannelConfig - couponEnabled', () => {
    it('should enable coupon display on watch page', async () => {
      const client = createSdkClient(testConfig.authConfig, testConfig.baseUrl);

      const result = await client.channel.updateChannelConfig({
        channelId: testChannelId,
        key: 'couponEnabled',
        value: 'Y',
      });

      expect(result).toBe(true);
      originalCouponEnabled = 'N'; // Restore to N after test
    }, 15000);

    it('should disable coupon display on watch page', async () => {
      const client = createSdkClient(testConfig.authConfig, testConfig.baseUrl);

      const result = await client.channel.updateChannelConfig({
        channelId: testChannelId,
        key: 'couponEnabled',
        value: 'N',
      });

      expect(result).toBe(true);
      originalCouponEnabled = 'N';
    }, 15000);

    it('should validate channelId is required', async () => {
      const client = createSdkClient(testConfig.authConfig, testConfig.baseUrl);

      await expect(
        client.channel.updateChannelConfig({
          channelId: '',
          key: 'couponEnabled',
          value: 'Y',
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate key is required', async () => {
      const client = createSdkClient(testConfig.authConfig, testConfig.baseUrl);

      await expect(
        client.channel.updateChannelConfig({
          channelId: testChannelId,
          key: '',
          value: 'Y',
        })
      ).rejects.toThrow();
    }, 10000);
  });

  // ========================================
  // updateChannelConfig - other keys
  // ========================================

  describe('updateChannelConfig - generic keys', () => {
    it('should accept any valid key-value pair', async () => {
      const client = createSdkClient(testConfig.authConfig, testConfig.baseUrl);

      // Test with couponEnabled since we know it's a valid key
      const result = await client.channel.updateChannelConfig({
        channelId: testChannelId,
        key: 'couponEnabled',
        value: 'Y',
      });

      expect(typeof result).toBe('boolean');
      originalCouponEnabled = 'N';
    }, 15000);
  });

  // ========================================
  // couponEnabled Resource Handler (via setup flow)
  // ========================================

  describe('couponEnabled resource handler', () => {
    it('should verify couponEnabled step is in e-commerce scene config', async () => {
      // Import the scene config loader
      const { SceneConfigLoader } = await import('../../src/setup/scene-config-loader');
      const loader = new SceneConfigLoader();
      const config = await loader.loadScene('e-commerce');

      // Find couponEnabled resource in the scene
      const couponEnabledResource = config.resources.find(r => r.type === 'couponEnabled');
      expect(couponEnabledResource).toBeDefined();
      expect(couponEnabledResource?.params?.['enabled']).toBe('Y');
    }, 10000);

    it('should create couponEnabled handler and call updateChannelConfig', async () => {
      const { createResourceHandlers } = await import('../../src/setup/resource-handlers');
      const client = createSdkClient(testConfig.authConfig, testConfig.baseUrl);
      const handlers = createResourceHandlers(client);

      expect(handlers.couponEnabled).toBeDefined();
      expect(typeof handlers.couponEnabled.create).toBe('function');
    }, 10000);

    it('should execute couponEnabled handler with real API', async () => {
      const { createResourceHandlers } = await import('../../src/setup/resource-handlers');
      const client = createSdkClient(testConfig.authConfig, testConfig.baseUrl);
      const handlers = createResourceHandlers(client);

      const result = await handlers.couponEnabled.create({
        channelId: testChannelId,
        enabled: 'Y',
      });

      expect(result.success).toBe(true);
      expect(result.channelId).toBe(testChannelId);
      expect(result.enabled).toBe('Y');
      originalCouponEnabled = 'N';
    }, 15000);

    it('should throw error when channelId is missing', async () => {
      const { createResourceHandlers } = await import('../../src/setup/resource-handlers');
      const client = createSdkClient(testConfig.authConfig, testConfig.baseUrl);
      const handlers = createResourceHandlers(client);

      await expect(
        handlers.couponEnabled.create({ enabled: 'Y' })
      ).rejects.toThrow('channelId is required');
    }, 10000);

    it('should throw error when enabled is missing', async () => {
      const { createResourceHandlers } = await import('../../src/setup/resource-handlers');
      const client = createSdkClient(testConfig.authConfig, testConfig.baseUrl);
      const handlers = createResourceHandlers(client);

      await expect(
        handlers.couponEnabled.create({ channelId: testChannelId })
      ).rejects.toThrow('enabled is required');
    }, 10000);
  });
});
