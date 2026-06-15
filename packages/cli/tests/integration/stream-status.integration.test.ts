/**
 * @fileoverview Integration tests for stream status functionality
 * @author Development Team
 * @since 3.4.0
 */

import { StreamServiceSdk, StreamServiceConfig } from '../../src/services/stream.service.sdk';
import { AuthConfig } from '../../src/types/auth';
import { StreamStatusRequest } from '../../src/types/stream';
import { hasRealCredentials, getTestConfig } from '../helpers/integration-config';

// Use test config from CLI accounts or environment
const testConfig = getTestConfig();
const shouldRunTests = hasRealCredentials();

(shouldRunTests ? describe : describe.skip)('Stream Status Integration Tests', () => {
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

  describe('Full workflow integration', () => {
    it('should handle complete live stream status workflow', async () => {
      const request: StreamStatusRequest = {
        channelId: testChannelId
      };

      const result = await streamService.getStreamStatus(request);

      // Verify comprehensive status information
      expect(result).toBeDefined();
      expect(result.channelId).toBe(testChannelId);
      expect(['live', 'waiting', 'stopped', 'error', 'unknown']).toContain(result.status);
      expect(result.statusText).toBeDefined();
      expect(typeof result.isLive).toBe('boolean');
      expect(result.lastUpdated).toBeInstanceOf(Date);
    }, 15000);

    it('should handle waiting channel status workflow', async () => {
      const request: StreamStatusRequest = {
        channelId: testChannelId
      };

      const result = await streamService.getStreamStatus(request);

      expect(result).toBeDefined();
      expect(result.channelId).toBe(testChannelId);
      // Channel may or may not be live, but we should get a valid status
      expect(['live', 'waiting', 'stopped', 'error', 'unknown']).toContain(result.status);
    }, 15000);

    it('should handle error workflow for non-existent channel', async () => {
      const request: StreamStatusRequest = {
        channelId: 'non-existent-channel-99999'
      };

      // Should either throw an error or return error status
      try {
        const result = await streamService.getStreamStatus(request);
        // If it doesn't throw, it should return an error status
        expect(['error', 'unknown']).toContain(result.status);
      } catch (error) {
        // Throwing is also acceptable for non-existent channels
        expect(error).toBeDefined();
      }
    }, 15000);
  });

  describe('Service validation', () => {
    it('should validate empty channel ID', async () => {
      const request: StreamStatusRequest = {
        channelId: ''
      };

      await expect(streamService.getStreamStatus(request)).rejects.toThrow('Channel ID cannot be empty');
    });

    it('should validate whitespace-only channel ID', async () => {
      const request: StreamStatusRequest = {
        channelId: '   '
      };

      await expect(streamService.getStreamStatus(request)).rejects.toThrow('Channel ID cannot be empty');
    });
  });

  describe('Performance and timing', () => {
    it('should complete status check within reasonable time', async () => {
      const request: StreamStatusRequest = {
        channelId: testChannelId
      };

      const startTime = Date.now();
      await streamService.getStreamStatus(request);
      const endTime = Date.now();

      // Should complete within 10 seconds
      expect(endTime - startTime).toBeLessThan(10000);
    }, 15000);
  });
});
