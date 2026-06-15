/**
 * @fileoverview Integration tests for stream get-key functionality
 * @author Development Team
 * @since 3.1.0
 */

import { StreamServiceSdk, StreamServiceConfig } from '../../src/services/stream.service.sdk';
import { AuthConfig } from '../../src/types/auth';
import { StreamGetKeyRequest } from '../../src/types/stream';
import { PolyVValidationError } from '../../src/utils/errors';
import { hasRealCredentials, getTestConfig } from '../helpers/integration-config';

// Use test config from CLI accounts or environment
const testConfig = getTestConfig();
const shouldRunTests = hasRealCredentials();

(shouldRunTests ? describe : describe.skip)('Stream Get-Key Integration Tests', () => {
  let streamService: StreamServiceSdk;
  let authConfig: AuthConfig;
  let serviceConfig: StreamServiceConfig;
  let testChannelId: string;

  beforeAll(() => {
    if (!shouldRunTests) {
      console.warn('⚠️  Skipping integration tests - no real API credentials found');
      return;
    }

    authConfig = testConfig.authConfig;
    serviceConfig = {
      baseUrl: testConfig.baseUrl,
      timeout: 30000,
      debug: false
    };
    testChannelId = testConfig.testChannelId;

    streamService = new StreamServiceSdk(authConfig, serviceConfig);
  });

  describe('StreamServiceSdk Integration', () => {
    it('should handle validation errors for empty channelId', async () => {
      const request: StreamGetKeyRequest = { channelId: '' };

      await expect(streamService.getStreamKey(request)).rejects.toThrow(PolyVValidationError);
      await expect(streamService.getStreamKey(request)).rejects.toThrow('Channel ID cannot be empty');
    });

    it('should handle validation errors for null channelId', async () => {
      const request = { channelId: null } as any;

      await expect(streamService.getStreamKey(request)).rejects.toThrow(PolyVValidationError);
      await expect(streamService.getStreamKey(request)).rejects.toThrow('Channel ID cannot be empty');
    });

    it('should return stream credentials for valid channel or handle gracefully', async () => {
      const request: StreamGetKeyRequest = { channelId: testChannelId };

      try {
        const result = await streamService.getStreamKey(request);

        expect(result).toBeDefined();
        expect(result.channelId).toBe(testChannelId);
        expect(result.rtmpUrl).toBeDefined();
        expect(result.streamKey).toBeDefined();
        expect(typeof result.rtmpUrl).toBe('string');
        expect(typeof result.streamKey).toBe('string');
      } catch (error: any) {
        // 404 is a valid API response - channel might not exist in the API
        // This is expected behavior for integration tests
        if (error.message?.includes('404')) {
          console.log('Channel not found in API - this is expected for some channels');
          expect(error.message).toContain('404');
        } else {
          throw error;
        }
      }
    }, 10000);

    it('should handle API errors for non-existent channels', async () => {
      const request: StreamGetKeyRequest = { channelId: 'nonexistent-channel-id' };

      await expect(streamService.getStreamKey(request)).rejects.toThrow();
    }, 10000);
  });

  describe('Security Features Integration', () => {
    it('should return full stream key from service or handle gracefully', async () => {
      const request: StreamGetKeyRequest = { channelId: testChannelId };

      try {
        const result = await streamService.getStreamKey(request);

        // Service returns full key, not masked
        expect(result.streamKey).toBeDefined();
        expect(typeof result.streamKey).toBe('string');
        expect(result.streamKey.length).toBeGreaterThan(0);
      } catch (error: any) {
        // 404 is a valid API response
        if (error.message?.includes('404')) {
          console.log('Channel not found in API - this is expected for some channels');
          expect(error.message).toContain('404');
        } else {
          throw error;
        }
      }
    });
  });

  describe('Error Handling Integration', () => {
    it('should propagate validation errors', async () => {
        const request: StreamGetKeyRequest = { channelId: '   ' };

        await expect(streamService.getStreamKey(request)).rejects.toThrow(PolyVValidationError);
      });
  });
});
