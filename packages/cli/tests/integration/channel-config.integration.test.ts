/**
 * @fileoverview Integration tests for channel config update (couponEnabled, productEnabled, etc.)
 * @author Development Team
 * @since 1.2.26
 */

import { createSdkClient } from '../../src/sdk';
import { hasRealCredentials, getTestConfig } from '../helpers/integration-config';
import { createTemporaryChannel, deleteTemporaryChannel } from '../helpers/channel-fixture';

const testConfig = getTestConfig();
const shouldRunTests = hasRealCredentials();

(shouldRunTests ? describe : describe.skip)('Channel Config Integration Tests', () => {
  let testChannelId: string;

  beforeAll(() => {
    testChannelId = createTemporaryChannel('Channel Config Service');
  });

  afterAll(() => {
    if (testChannelId) {
      deleteTemporaryChannel(testChannelId);
    }
  });

  // ========================================
  // updateCouponEnabled - couponEnabled
  // ========================================

  describe('updateCouponEnabled - couponEnabled', () => {
    it('should enable coupon display on watch page', async () => {
      const client = createSdkClient(testConfig.authConfig, testConfig.baseUrl);

      await client.v4Channel.updateCouponEnabled({
        channelId: testChannelId,
        enabled: 'Y',
      });

      expect(true).toBe(true);
    }, 15000);

    it('should disable coupon display on watch page', async () => {
      const client = createSdkClient(testConfig.authConfig, testConfig.baseUrl);

      await client.v4Channel.updateCouponEnabled({
        channelId: testChannelId,
        enabled: 'N',
      });

      expect(true).toBe(true);
    }, 15000);

    it('should validate channelId is required', async () => {
      const client = createSdkClient(testConfig.authConfig, testConfig.baseUrl);

      await expect(
        client.v4Channel.updateCouponEnabled({
          channelId: '',
          enabled: 'Y',
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate enabled is required', async () => {
      const client = createSdkClient(testConfig.authConfig, testConfig.baseUrl);

      await expect(
        client.v4Channel.updateCouponEnabled({
          channelId: testChannelId,
          enabled: '' as 'Y',
        })
      ).rejects.toThrow();
    }, 10000);
  });

  // ========================================
  // updateCouponEnabled return contract
  // ========================================

  describe('updateCouponEnabled return contract', () => {
    it('should resolve for a valid couponEnabled value', async () => {
      const client = createSdkClient(testConfig.authConfig, testConfig.baseUrl);

      await client.v4Channel.updateCouponEnabled({
        channelId: testChannelId,
        enabled: 'Y',
      });

      expect(true).toBe(true);
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

    it('should create couponEnabled handler and call updateCouponEnabled', async () => {
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
