/**
 * Integration tests for signature generation with authentication system
 */

import { generateSignature, createSignature } from '../../src/utils/signature';
import { loadAuthConfig } from '../../src/config/auth';
import { SignatureOptions } from '../../src/types/signature';

describe('Signature Integration Tests', () => {
  describe('Integration with Authentication System', () => {
    it('should use appSecret from authentication config', () => {
      // Mock authentication config
      const mockAuthConfig = {
        appId: 'integration-test-app',
        appSecret: 'integration-test-secret',
        userId: 'integration-test-user'
      };

      const params = {
        appId: mockAuthConfig.appId,
        userId: mockAuthConfig.userId
      };

      const result = createSignature(params, mockAuthConfig.appSecret);

      expect(result.signature).toMatch(/^[A-F0-9]{32}$/);
      expect(result.sortedParams['appId']).toBe(mockAuthConfig.appId);
      expect(result.sortedParams['userId']).toBe(mockAuthConfig.userId);
    });

    it('should work with environment variable authentication', () => {
      const originalEnv = process.env;

      try {
        // Set up environment variables
        process.env['POLYV_APP_ID'] = 'env-app-id';
        process.env['POLYV_APP_SECRET'] = 'env-app-secret';
        process.env['POLYV_USER_ID'] = 'env-user-id';

        // Load auth config from environment
        const authResult = loadAuthConfig({});
        
        const params = {
          appId: authResult.config.appId,
          ...(authResult.config.userId && { userId: authResult.config.userId })
        };

        const result = createSignature(params, authResult.config.appSecret);

        expect(result.signature).toMatch(/^[A-F0-9]{32}$/);
        expect(result.sortedParams['appId']).toBe('env-app-id');
        expect(result.sortedParams['userId']).toBe('env-user-id');
      } finally {
        process.env = originalEnv;
      }
    });

    it('should work with CLI parameter authentication', () => {
      const cliOptions = {
        appId: 'cli-app-id',
        appSecret: 'cli-app-secret',
        userId: 'cli-user-id'
      };

      // Load auth config from CLI options
      const authResult = loadAuthConfig(cliOptions);
      
      const params = {
        appId: authResult.config.appId,
        ...(authResult.config.userId && { userId: authResult.config.userId })
      };

      const result = createSignature(params, authResult.config.appSecret);

      expect(result.signature).toMatch(/^[A-F0-9]{32}$/);
      expect(result.sortedParams['appId']).toBe('cli-app-id');
      expect(result.sortedParams['userId']).toBe('cli-user-id');
    });
  });

  describe('Real-world API Scenarios', () => {
    const testAppSecret = 'test-api-secret-123';

    it('should generate signature for channel list API', () => {
      const params = {
        appId: 'test-app-123',
        userId: 'test-user-456'
      };

      const result = createSignature(params, testAppSecret);

      // Verify basic structure for API usage
      expect(result).toMatchObject({
        signature: expect.stringMatching(/^[A-F0-9]{32}$/),
        timestamp: expect.any(Number),
        sortedParams: expect.objectContaining({
          appId: 'test-app-123',
          userId: 'test-user-456',
          timestamp: expect.any(Number)
        })
      });

      // Verify timestamp is recent (within last minute)
      const now = Date.now();
      expect(result.timestamp).toBeGreaterThan(now - 60000);
      expect(result.timestamp).toBeLessThanOrEqual(now);
    });

    it('should generate signature for channel creation API', () => {
      const params = {
        appId: 'test-app-123',
        userId: 'test-user-456',
        name: 'Test Channel',
        description: 'This is a test channel'
      };

      const result = createSignature(params, testAppSecret);

      expect(result.signature).toMatch(/^[A-F0-9]{32}$/);
      expect(result.sortedParams).toMatchObject({
        appId: 'test-app-123',
        description: 'This is a test channel',
        name: 'Test Channel',
        timestamp: expect.any(Number),
        userId: 'test-user-456'
      });
    });

    it('should generate signature for stream control API', () => {
      const params = {
        appId: 'test-app-123',
        channelId: 'channel-789',
        action: 'start'
      };

      const result = createSignature(params, testAppSecret);

      expect(result.signature).toMatch(/^[A-F0-9]{32}$/);
      expect(result.sortedParams).toMatchObject({
        action: 'start',
        appId: 'test-app-123',
        channelId: 'channel-789',
        timestamp: expect.any(Number)
      });
    });

    it('should handle special characters in parameters', () => {
      const params = {
        appId: 'test-app-123',
        name: 'Channel with spaces & symbols!',
        description: '测试频道描述 with unicode 🎥'
      };

      const result = createSignature(params, testAppSecret);

      expect(result.signature).toMatch(/^[A-F0-9]{32}$/);
      expect(result.sortedParams['name']).toBe('Channel with spaces & symbols!');
      expect(result.sortedParams['description']).toBe('测试频道描述 with unicode 🎥');
    });
  });

  describe('Signature Consistency Tests', () => {
    it('should generate same signature for same parameters at same timestamp', () => {
      const params = {
        appId: 'consistency-test',
        userId: 'user-123'
      };

      const options: SignatureOptions = {
        appSecret: 'consistent-secret',
        customTimestamp: 1609459200000
      };

      const result1 = generateSignature(params, options);
      const result2 = generateSignature({ ...params }, { ...options });

      expect(result1.signature).toBe(result2.signature);
      expect(result1.timestamp).toBe(result2.timestamp);
    });

    it('should generate different signatures for different timestamps', () => {
      const params = {
        appId: 'timestamp-test',
        userId: 'user-123'
      };

      const options1: SignatureOptions = {
        appSecret: 'timestamp-secret',
        customTimestamp: 1609459200000
      };

      const options2: SignatureOptions = {
        appSecret: 'timestamp-secret',
        customTimestamp: 1609459200001 // 1ms difference
      };

      const result1 = generateSignature(params, options1);
      const result2 = generateSignature(params, options2);

      expect(result1.signature).not.toBe(result2.signature);
      expect(result1.timestamp).not.toBe(result2.timestamp);
    });

    it('should generate different signatures for different appSecrets', () => {
      const params = {
        appId: 'secret-test',
        userId: 'user-123'
      };

      const timestamp = 1609459200000;

      const result1 = generateSignature(params, {
        appSecret: 'secret1',
        customTimestamp: timestamp
      });

      const result2 = generateSignature(params, {
        appSecret: 'secret2',
        customTimestamp: timestamp
      });

      expect(result1.signature).not.toBe(result2.signature);
      expect(result1.timestamp).toBe(result2.timestamp);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle authentication errors gracefully', () => {
      const params = {
        appId: '', // Invalid appId
        userId: 'user-123'
      };

      expect(() => createSignature(params, 'test-secret')).toThrow('appId is required for signature generation');
    });

    it('should handle missing appSecret gracefully', () => {
      const params = {
        appId: 'test-app',
        userId: 'user-123'
      };

      expect(() => createSignature(params, '')).toThrow('appSecret is required for signature generation');
    });

    it('should validate authentication config integration', () => {
      // Test valid authentication config
      const validConfig = {
        appId: 'valid-app',
        appSecret: 'valid-secret'
      };

      const authResult = loadAuthConfig(validConfig);
      
      const params = {
        appId: authResult.config.appId
      };

      const result = createSignature(params, authResult.config.appSecret);
      expect(result.signature).toMatch(/^[A-F0-9]{32}$/);
      
      // Test that invalid config throws during signature creation
      expect(() => createSignature({ appId: '' }, 'test-secret')).toThrow('appId is required for signature generation');
    });
  });

  describe('Performance Tests', () => {
    it('should generate signature within performance requirements', () => {
      const params = {
        appId: 'performance-test',
        userId: 'user-123',
        param1: 'value1',
        param2: 'value2',
        param3: 'value3'
      };

      const startTime = Date.now();
      const result = createSignature(params, 'performance-secret');
      const endTime = Date.now();

      const executionTime = endTime - startTime;

      expect(result.signature).toMatch(/^[A-F0-9]{32}$/);
      expect(executionTime).toBeLessThan(200); // Should complete within 200ms as per requirements
    });

    it('should handle large parameter sets efficiently', () => {
      const params: any = {
        appId: 'large-param-test',
        userId: 'user-123'
      };

      // Add 50 additional parameters
      for (let i = 0; i < 50; i++) {
        params[`param${i}`] = `value${i}`;
      }

      const startTime = Date.now();
      const result = createSignature(params, 'large-param-secret');
      const endTime = Date.now();

      const executionTime = endTime - startTime;

      expect(result.signature).toMatch(/^[A-F0-9]{32}$/);
      expect(executionTime).toBeLessThan(200); // Should still complete within 200ms
      expect(Object.keys(result.sortedParams)).toHaveLength(53); // 50 + appId + userId + timestamp
    });
  });
});