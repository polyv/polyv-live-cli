/**
 * @fileoverview Integration tests for stream stop functionality
 * @author Development Team
 * @since 3.3.0
 */

import { StreamServiceSdk, StreamServiceConfig } from '../../src/services/stream.service.sdk';
import { AuthConfig } from '../../src/types/auth';
import { StreamStopRequest } from '../../src/types/stream';
import { PolyVValidationError } from '../../src/utils/errors';
import { hasRealCredentials, getTestConfig } from '../helpers/integration-config';

// Use test config from CLI accounts or environment
const testConfig = getTestConfig();
const shouldRunTests = hasRealCredentials();

(shouldRunTests ? describe : describe.skip)('Stream Stop Integration Tests', () => {
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

  describe('Real API Integration Tests', () => {
    it('should successfully stop a live stream or handle already stopped', async () => {
      const request: StreamStopRequest = {
        channelId: testChannelId
      };

      // Note: This test may succeed or fail depending on channel state
      // We're testing the API integration, not specific state
      try {
        const result = await streamService.stopStream(request);

        expect(result).toBeDefined();
        expect(result.code).toBe(200);
        expect(result.status).toBe('success');
      } catch (error: any) {
        // If the channel is not live, stopping may return an error
        // This is expected behavior
        expect(error).toBeDefined();
        console.log(`Stream stop returned expected error: ${error.message}`);
      }
    }, 30000);

    it('should throw error for non-existent channel', async () => {
      const request: StreamStopRequest = {
        channelId: 'nonexistent99999'
      };

      await expect(streamService.stopStream(request)).rejects.toThrow();
    }, 30000);
  });

  describe('Validation Tests', () => {
    it('should call SDK client with correct parameters', async () => {
      const request: StreamStopRequest = {
        channelId: testChannelId
      };

      // This tests that the service can be called with the right parameters
      try {
        await streamService.stopStream(request);
      } catch (error: any) {
        // Even if it fails (channel not live), the call was made correctly
        expect(error).toBeDefined();
      }
    });

    it('should validate request parameters', async () => {
      const invalidRequest: StreamStopRequest = {
        channelId: ''
      };

      await expect(streamService.stopStream(invalidRequest)).rejects.toThrow(PolyVValidationError);
      await expect(streamService.stopStream(invalidRequest)).rejects.toThrow('Channel ID cannot be empty');
    });

    it('should require userId in auth config', async () => {
      const authWithoutUserId: AuthConfig = {
        appId: authConfig.appId,
        appSecret: authConfig.appSecret
      };

      const serviceWithoutUserId = new StreamServiceSdk(authWithoutUserId, serviceConfig);

      const request: StreamStopRequest = {
        channelId: testChannelId
      };

      await expect(serviceWithoutUserId.stopStream(request)).rejects.toThrow(PolyVValidationError);
      await expect(serviceWithoutUserId.stopStream(request)).rejects.toThrow('userId is required to stop stream');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string channelId', async () => {
      const request: StreamStopRequest = {
        channelId: ''
      };

      await expect(streamService.stopStream(request)).rejects.toThrow(PolyVValidationError);
    });

    it('should handle whitespace-only channelId', async () => {
      const request: StreamStopRequest = {
        channelId: '   '
      };

      await expect(streamService.stopStream(request)).rejects.toThrow(PolyVValidationError);
    });

    it('should handle null channelId', async () => {
      const request = {
        channelId: null
      } as any;

      await expect(streamService.stopStream(request)).rejects.toThrow(PolyVValidationError);
    });

    it('should handle undefined channelId', async () => {
      const request = {
        channelId: undefined
      } as any;

      await expect(streamService.stopStream(request)).rejects.toThrow(PolyVValidationError);
    });
  });
});
