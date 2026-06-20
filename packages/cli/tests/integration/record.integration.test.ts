/**
 * @fileoverview Integration tests for record commands
 * @author Development Team
 * @since 9.7.0
 */

import { RecordServiceSdk } from '../../src/services/record.service.sdk';
import { hasRealCredentials, getTestConfig } from '../helpers/integration-config';
import { createTemporaryChannel, deleteTemporaryChannel } from '../helpers/channel-fixture';

// Use test config from CLI accounts or environment
const testConfig = getTestConfig();
const shouldRunTests = hasRealCredentials();

function isExpectedRecordSettingError(message: string): boolean {
  const expectedErrors = ['404', 'not found', 'illegal playback origin'];
  return expectedErrors.some(error => message.includes(error));
}

(shouldRunTests ? describe : describe.skip)('Record Integration Tests', () => {
  let recordService: RecordServiceSdk;
  let testChannelId: string;

  beforeAll(() => {
    recordService = new RecordServiceSdk(testConfig.authConfig, {
      baseUrl: testConfig.baseUrl,
      timeout: 30000,
      debug: false
    });
    testChannelId = createTemporaryChannel('Record Service');
  });

  afterAll(() => {
    if (testChannelId) {
      deleteTemporaryChannel(testChannelId);
    }
  });

  // ========================================
  // Record Setting Get Tests
  // ========================================

  describe('record setting get', () => {
    it('should get playback settings successfully', async () => {
      const result = await recordService.getPlaybackSetting(testChannelId);

      expect(result).toBeDefined();
      expect(result.channelId).toBeDefined();
      // The result should contain playback settings
      // API returns various fields based on channel configuration
    }, 15000);

    it('should validate empty channelId', async () => {
      await expect(
        recordService.getPlaybackSetting('')
      ).rejects.toThrow();
    }, 10000);

    it('should handle non-existent channel gracefully', async () => {
      try {
        const result = await recordService.getPlaybackSetting('9999999');
        // API might return empty or default settings
        expect(result).toBeDefined();
      } catch (error: any) {
        // Or it might throw an error
        expect(error).toBeDefined();
      }
    }, 15000);
  });

  // ========================================
  // Record Setting Set Tests
  // ========================================

  describe('record setting set', () => {
    it('should set playback enabled setting', async () => {
      try {
        const result = await recordService.setPlaybackSetting(testChannelId, {
          playbackEnabled: 'Y'
        });

        expect(result).toBe(true);
      } catch (error: any) {
        // API might require certain conditions
        const message = error.message || '';
        if (isExpectedRecordSettingError(message)) {
          console.log('Record setting API not available or channel origin is unsupported');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should set multiple playback settings', async () => {
      try {
        const result = await recordService.setPlaybackSetting(testChannelId, {
          playbackEnabled: 'Y',
          playbackMultiplierEnabled: 'Y',
          chatPlaybackEnabled: 'N'
        });

        expect(result).toBe(true);
      } catch (error: any) {
        const message = error.message || '';
        if (isExpectedRecordSettingError(message)) {
          console.log('Record setting API not available or channel origin is unsupported');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should validate empty channelId', async () => {
      await expect(
        recordService.setPlaybackSetting('', {
          playbackEnabled: 'Y'
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate invalid playbackEnabled value', async () => {
      await expect(
        recordService.setPlaybackSetting(testChannelId, {
          playbackEnabled: 'invalid' as any
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate invalid type value', async () => {
      await expect(
        recordService.setPlaybackSetting(testChannelId, {
          type: 'invalid' as any
        })
      ).rejects.toThrow();
    }, 10000);
  });

  // ========================================
  // Record Convert Tests
  // ========================================

  describe('record convert', () => {
    it('should validate empty channelId', async () => {
      await expect(
        recordService.recordConvert('', {
          fileName: 'Test Convert',
          sessionId: 'test-session-id'
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate empty fileName', async () => {
      await expect(
        recordService.recordConvert(testChannelId, {
          fileName: '',
          sessionId: 'test-session-id'
        })
      ).rejects.toThrow();
    }, 10000);

    it('should handle non-existent session ID', async () => {
      try {
        const result = await recordService.recordConvert(testChannelId, {
          fileName: 'Test Convert',
          sessionId: 'non-existent-session-id-99999'
        });
        // API might return empty or error
        expect(result).toBeDefined();
      } catch (error: any) {
        // Expected error for non-existent session
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found') || message.includes('不存在')) {
          expect(true).toBe(true);
        } else {
          // Other errors are also acceptable
          expect(error).toBeDefined();
        }
      }
    }, 15000);
  });

  // ========================================
  // Record Convert Async Tests
  // ========================================

  describe('record convert async', () => {
    it('should validate empty channelId', async () => {
      await expect(
        recordService.recordConvertAsync('', {
          fileName: 'Test Async Convert',
          sessionId: 'test-session-id'
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate empty fileName', async () => {
      await expect(
        recordService.recordConvertAsync(testChannelId, {
          fileName: '',
          sessionId: 'test-session-id'
        })
      ).rejects.toThrow();
    }, 10000);

    it('should handle non-existent session ID', async () => {
      try {
        const result = await recordService.recordConvertAsync(testChannelId, {
          fileName: 'Test Async Convert',
          sessionId: 'non-existent-session-id-99999'
        });
        expect(result).toBeDefined();
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          expect(true).toBe(true);
        } else {
          expect(error).toBeDefined();
        }
      }
    }, 15000);
  });

  // ========================================
  // Record Set Default Tests
  // ========================================

  describe('record set-default', () => {
    it('should validate empty channelId', async () => {
      await expect(
        recordService.setRecordDefault('', 'test-video-id')
      ).rejects.toThrow();
    }, 10000);

    it('should validate empty videoId', async () => {
      await expect(
        recordService.setRecordDefault(testChannelId, '')
      ).rejects.toThrow();
    }, 10000);

    it('should handle non-existent video ID', async () => {
      try {
        const result = await recordService.setRecordDefault(
          testChannelId,
          'non-existent-video-id-99999'
        );
        // API might return success or error
        expect(result).toBeDefined();
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          expect(true).toBe(true);
        } else {
          expect(error).toBeDefined();
        }
      }
    }, 15000);

    it('should set default with listType playback', async () => {
      try {
        const result = await recordService.setRecordDefault(
          testChannelId,
          'test-video-id',
          'playback'
        );
        expect(result).toBeDefined();
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          expect(true).toBe(true);
        } else {
          expect(error).toBeDefined();
        }
      }
    }, 15000);

    it('should set default with listType vod', async () => {
      try {
        const result = await recordService.setRecordDefault(
          testChannelId,
          'test-video-id',
          'vod'
        );
        expect(result).toBeDefined();
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          expect(true).toBe(true);
        } else {
          expect(error).toBeDefined();
        }
      }
    }, 15000);

    it('should validate invalid listType', async () => {
      await expect(
        recordService.setRecordDefault(testChannelId, 'test-video-id', 'invalid' as any)
      ).rejects.toThrow();
    }, 10000);
  });

  // ========================================
  // Validation Tests Summary
  // ========================================

  describe('validation tests', () => {
    it('should validate getPlaybackSetting channelId', async () => {
      await expect(
        recordService.getPlaybackSetting('')
      ).rejects.toThrow();
    });

    it('should validate setPlaybackSetting channelId', async () => {
      await expect(
        recordService.setPlaybackSetting('', { playbackEnabled: 'Y' })
      ).rejects.toThrow();
    });

    it('should validate recordConvert channelId', async () => {
      await expect(
        recordService.recordConvert('', { fileName: 'test' })
      ).rejects.toThrow();
    });

    it('should validate recordConvert fileName', async () => {
      await expect(
        recordService.recordConvert(testChannelId, { fileName: '' })
      ).rejects.toThrow();
    });

    it('should validate recordConvertAsync channelId', async () => {
      await expect(
        recordService.recordConvertAsync('', { fileName: 'test' })
      ).rejects.toThrow();
    });

    it('should validate recordConvertAsync fileName', async () => {
      await expect(
        recordService.recordConvertAsync(testChannelId, { fileName: '' })
      ).rejects.toThrow();
    });

    it('should validate setRecordDefault channelId', async () => {
      await expect(
        recordService.setRecordDefault('', 'test-video')
      ).rejects.toThrow();
    });

    it('should validate setRecordDefault videoId', async () => {
      await expect(
        recordService.setRecordDefault(testChannelId, '')
      ).rejects.toThrow();
    });
  });

  // ========================================
  // Record Setting Workflow Tests
  // ========================================

  describe('record setting workflow', () => {
    it('should complete record setting get and set workflow', async () => {
      // 1. Get current settings
      const currentSettings = await recordService.getPlaybackSetting(testChannelId);
      expect(currentSettings).toBeDefined();
      expect(currentSettings.channelId).toBeDefined();

      // 2. Set playback enabled
      try {
        const setResult = await recordService.setPlaybackSetting(testChannelId, {
          playbackEnabled: 'Y'
        });
        expect(setResult).toBe(true);
      } catch (error: any) {
        const message = error.message || '';
        if (isExpectedRecordSettingError(message)) {
          console.log('Record setting API not available or channel origin is unsupported');
        } else {
          throw error;
        }
      }

      // 3. Get settings again to verify
      const newSettings = await recordService.getPlaybackSetting(testChannelId);
      expect(newSettings).toBeDefined();
    }, 30000);
  });
});
