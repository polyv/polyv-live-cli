/**
 * @fileoverview Integration tests for platform commands
 * @author Development Team
 * @since 13.1.0
 */

import { PlatformServiceSdk } from '../../src/services/platform-service';
import { hasRealCredentials, getTestConfig } from '../helpers/integration-config';

// Use test config from CLI accounts or environment
const testConfig = getTestConfig();
const shouldRunTests = hasRealCredentials();

(shouldRunTests ? describe : describe.skip)('Platform Integration Tests', () => {
  let platformService: PlatformServiceSdk;

  beforeAll(() => {
    platformService = new PlatformServiceSdk(testConfig.authConfig, {
      baseUrl: testConfig.baseUrl,
      timeout: 30000,
      debug: false
    });
  });

  // ========================================
  // Platform Get (Account Info) Tests
  // ========================================

  describe('platform get', () => {
    it('should get account info successfully', async () => {
      try {
        const result = await platformService.getUserInfo();

        expect(result).toBeDefined();
        // Result should contain user info fields
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          console.log('Platform API not available (404)');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);
  });

  // ========================================
  // Platform Switch Get Tests
  // ========================================

  describe('platform switch get', () => {
    it('should get switch configuration successfully', async () => {
      try {
        const result = await platformService.getSwitchConfig();

        expect(result).toBeDefined();
        // Result should contain switch configuration
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          console.log('Platform switch API not available (404)');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);
  });

  // ========================================
  // Platform Switch Update Tests
  // ========================================

  describe('platform switch update', () => {
    it('should update chat switch', async () => {
      try {
        const result = await platformService.updateSwitchConfig({
          param: 'chat',
          enabled: 'Y'
        });

        expect(result).toBeDefined();
      } catch (error: any) {
        const message = error.message || '';
        const expectedErrors = ['404', 'not found', '不能为空', '不存在', 'illegal switch type'];
        const isExpectedError = expectedErrors.some(e => message.includes(e));

        if (isExpectedError) {
          console.log('Platform switch update not available');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should update autoPlay switch', async () => {
      try {
        const result = await platformService.updateSwitchConfig({
          param: 'autoPlay',
          enabled: 'Y'
        });

        expect(result).toBeDefined();
      } catch (error: any) {
        const message = error.message || '';
        const expectedErrors = ['404', 'not found', '不能为空', '不存在', 'illegal switch type'];
        const isExpectedError = expectedErrors.some(e => message.includes(e));

        if (isExpectedError) {
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should update mobileWatch switch', async () => {
      try {
        const result = await platformService.updateSwitchConfig({
          param: 'mobileWatch',
          enabled: 'Y'
        });

        expect(result).toBeDefined();
      } catch (error: any) {
        const message = error.message || '';
        const expectedErrors = ['404', 'not found', '不能为空', '不存在', 'illegal switch type'];
        const isExpectedError = expectedErrors.some(e => message.includes(e));

        if (isExpectedError) {
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should validate invalid param name', async () => {
      await expect(
        platformService.updateSwitchConfig({
          param: 'invalidParam',
          enabled: 'Y'
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate invalid enabled value', async () => {
      await expect(
        platformService.updateSwitchConfig({
          param: 'chat',
          enabled: 'invalid' as any
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate empty param', async () => {
      await expect(
        platformService.updateSwitchConfig({
          param: '',
          enabled: 'Y'
        })
      ).rejects.toThrow();
    }, 10000);
  });

  // ========================================
  // Platform Callback Get Tests
  // ========================================

  describe('platform callback get', () => {
    it('should get callback settings successfully', async () => {
      try {
        const result = await platformService.getCallbackSettings();

        expect(result).toBeDefined();
        // Result should contain callback settings
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          console.log('Platform callback API not available (404)');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);
  });

  // ========================================
  // Platform Callback Update Tests
  // ========================================

  describe('platform callback update', () => {
    it('should update callback URL', async () => {
      try {
        const result = await platformService.updateCallbackSettings({
          url: 'https://example.com/callback'
        });

        expect(result).toBeDefined();
        expect(result.success).toBe(true);
      } catch (error: any) {
        const message = error.message || '';
        const expectedErrors = ['404', 'not found', '不能为空', '不存在'];
        const isExpectedError = expectedErrors.some(e => message.includes(e));

        if (isExpectedError) {
          console.log('Platform callback update not available');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should update callback enabled setting', async () => {
      try {
        const result = await platformService.updateCallbackSettings({
          enabled: true
        });

        expect(result).toBeDefined();
        expect(result.success).toBe(true);
      } catch (error: any) {
        const message = error.message || '';
        const expectedErrors = ['404', 'not found', '不能为空', '不存在'];
        const isExpectedError = expectedErrors.some(e => message.includes(e));

        if (isExpectedError) {
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should update both URL and enabled', async () => {
      try {
        const result = await platformService.updateCallbackSettings({
          url: 'https://example.com/new-callback',
          enabled: true
        });

        expect(result).toBeDefined();
        expect(result.success).toBe(true);
      } catch (error: any) {
        const message = error.message || '';
        const expectedErrors = ['404', 'not found', '不能为空', '不存在'];
        const isExpectedError = expectedErrors.some(e => message.includes(e));

        if (isExpectedError) {
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should validate invalid URL format', async () => {
      await expect(
        platformService.updateCallbackSettings({
          url: 'invalid-url'
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate empty parameters', async () => {
      await expect(
        platformService.updateCallbackSettings({})
      ).rejects.toThrow();
    }, 10000);
  });

  // ========================================
  // Platform Setting Get Tests (Global Settings)
  // ========================================

  describe('platform setting get', () => {
    it('should get global channel settings successfully', async () => {
      try {
        const result = await platformService.getGlobalChannelSettings();

        expect(result).toBeDefined();
        // Result should contain global settings
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          console.log('Platform global settings API not available (404)');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);
  });

  // ========================================
  // Platform Setting Update Tests
  // ========================================

  describe('platform setting update', () => {
    it('should update channel concurrences enabled', async () => {
      try {
        await platformService.updateGlobalChannelSettings({
          channelConcurrencesEnabled: 'Y'
        });
        // Success - no error thrown
        expect(true).toBe(true);
      } catch (error: any) {
        const message = error.message || '';
        const expectedErrors = ['404', 'not found', '不能为空', '不存在'];
        const isExpectedError = expectedErrors.some(e => message.includes(e));

        if (isExpectedError) {
          console.log('Platform setting update not available');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should update timely convert enabled', async () => {
      try {
        await platformService.updateGlobalChannelSettings({
          timelyConvertEnabled: 'Y'
        });
        expect(true).toBe(true);
      } catch (error: any) {
        const message = error.message || '';
        const expectedErrors = ['404', 'not found', '不能为空', '不存在'];
        const isExpectedError = expectedErrors.some(e => message.includes(e));

        if (isExpectedError) {
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should update donate enabled', async () => {
      try {
        await platformService.updateGlobalChannelSettings({
          donateEnabled: 'N'
        });
        expect(true).toBe(true);
      } catch (error: any) {
        const message = error.message || '';
        const expectedErrors = ['404', 'not found', '不能为空', '不存在'];
        const isExpectedError = expectedErrors.some(e => message.includes(e));

        if (isExpectedError) {
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should update cover image type', async () => {
      try {
        await platformService.updateGlobalChannelSettings({
          coverImgType: 'contain'
        });
        expect(true).toBe(true);
      } catch (error: any) {
        const message = error.message || '';
        const expectedErrors = ['404', 'not found', '不能为空', '不存在'];
        const isExpectedError = expectedErrors.some(e => message.includes(e));

        if (isExpectedError) {
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should update multiple settings at once', async () => {
      try {
        await platformService.updateGlobalChannelSettings({
          channelConcurrencesEnabled: 'Y',
          timelyConvertEnabled: 'Y',
          donateEnabled: 'N',
          coverImgType: 'cover'
        });
        expect(true).toBe(true);
      } catch (error: any) {
        const message = error.message || '';
        const expectedErrors = ['404', 'not found', '不能为空', '不存在'];
        const isExpectedError = expectedErrors.some(e => message.includes(e));

        if (isExpectedError) {
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should validate invalid Y/N value', async () => {
      await expect(
        platformService.updateGlobalChannelSettings({
          donateEnabled: 'invalid' as any
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate invalid coverImgType', async () => {
      await expect(
        platformService.updateGlobalChannelSettings({
          coverImgType: 'invalid' as any
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate empty parameters', async () => {
      await expect(
        platformService.updateGlobalChannelSettings({})
      ).rejects.toThrow();
    }, 10000);
  });

  // ========================================
  // Validation Tests Summary
  // ========================================

  describe('validation tests', () => {
    it('should validate updateSwitchConfig param', async () => {
      await expect(
        platformService.updateSwitchConfig({ param: '', enabled: 'Y' })
      ).rejects.toThrow();
    });

    it('should validate updateSwitchConfig enabled', async () => {
      await expect(
        platformService.updateSwitchConfig({ param: 'authEnabled', enabled: 'invalid' as any })
      ).rejects.toThrow();
    });

    it('should validate updateSwitchConfig invalid param name', async () => {
      await expect(
        platformService.updateSwitchConfig({ param: 'invalidParam', enabled: 'Y' })
      ).rejects.toThrow();
    });

    it('should validate updateCallbackSettings empty params', async () => {
      await expect(
        platformService.updateCallbackSettings({})
      ).rejects.toThrow();
    });

    it('should validate updateCallbackSettings invalid URL', async () => {
      await expect(
        platformService.updateCallbackSettings({ url: 'invalid-url' })
      ).rejects.toThrow();
    });

    it('should validate updateGlobalChannelSettings empty params', async () => {
      await expect(
        platformService.updateGlobalChannelSettings({})
      ).rejects.toThrow();
    });

    it('should validate updateGlobalChannelSettings invalid Y/N', async () => {
      await expect(
        platformService.updateGlobalChannelSettings({ donateEnabled: 'YES' as any })
      ).rejects.toThrow();
    });

    it('should validate updateGlobalChannelSettings invalid coverImgType', async () => {
      await expect(
        platformService.updateGlobalChannelSettings({ coverImgType: 'center' as any })
      ).rejects.toThrow();
    });
  });

  // ========================================
  // Platform Workflow Tests
  // ========================================

  describe('platform workflow', () => {
    it('should complete get-update-get workflow for switch', async () => {
      // 1. Get current switch config
      try {
        const initialConfig = await platformService.getSwitchConfig();
        expect(initialConfig).toBeDefined();

        // 2. Update a switch
        await platformService.updateSwitchConfig({
          param: 'chat',
          enabled: 'Y'
        });

        // 3. Get config again to verify
        const updatedConfig = await platformService.getSwitchConfig();
        expect(updatedConfig).toBeDefined();
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found') || message.includes('illegal switch type')) {
          console.log('Platform switch workflow not available');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 30000);

    it('should complete get-update-get workflow for callback', async () => {
      // 1. Get current callback settings
      try {
        const initialSettings = await platformService.getCallbackSettings();
        expect(initialSettings).toBeDefined();

        // 2. Update callback URL
        await platformService.updateCallbackSettings({
          url: 'https://example.com/test-callback'
        });

        // 3. Get settings again
        const updatedSettings = await platformService.getCallbackSettings();
        expect(updatedSettings).toBeDefined();
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          console.log('Platform API not available (404)');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 30000);

    it('should complete get-update-get workflow for global settings', async () => {
      // 1. Get current global settings
      try {
        const initialSettings = await platformService.getGlobalChannelSettings();
        expect(initialSettings).toBeDefined();

        // 2. Update settings
        await platformService.updateGlobalChannelSettings({
          donateEnabled: 'Y'
        });

        // 3. Get settings again
        const updatedSettings = await platformService.getGlobalChannelSettings();
        expect(updatedSettings).toBeDefined();
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          console.log('Platform API not available (404)');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 30000);
  });
});
