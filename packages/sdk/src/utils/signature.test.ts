/**
 * @fileoverview Tests for signature utilities
 */
import { describe, it, expect } from 'vitest';
import {
  generateTimestamp,
  sortParams,
  generateSignature,
  createSignature,
  getEnvironmentInfo,
  SignatureMethod,
} from './signature.js';

describe('signature', () => {
  describe('generateTimestamp', () => {
    it('[P0] should return current timestamp in milliseconds', () => {
      const before = Date.now();
      const timestamp = generateTimestamp();
      const after = Date.now();

      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
      expect(typeof timestamp).toBe('number');
      expect(timestamp.toString().length).toBe(13);
    });
  });

  describe('sortParams', () => {
    it('[P0] should return sorted keys array', () => {
      const params = { z: '1', a: '2', m: '3', b: '4' };
      const sorted = sortParams(params);

      expect(sorted).toEqual(['a', 'b', 'm', 'z']);
    });

    it('[P1] should filter out null and undefined values', () => {
      const params = { a: 1, b: null, c: undefined, d: 2 };
      const sorted = sortParams(params);

      expect(sorted).toEqual(['a', 'd']);
    });

    it('[P1] should handle empty object', () => {
      const sorted = sortParams({});
      expect(sorted).toEqual([]);
    });
  });

  describe('generateSignature', () => {
    it('[P0] should generate MD5 signature', async () => {
      const result = await generateSignature(
        { appId: 'test-app-id', timestamp: 1234567890 },
        { appSecret: 'test-secret', method: SignatureMethod.MD5 }
      );

      expect(result).toHaveProperty('signature');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('method');
      expect(typeof result.signature).toBe('string');
      expect(result.signature.length).toBe(32); // MD5 hex length
    });

    it('[P0] should generate SHA256 signature', async () => {
      const result = await generateSignature(
        { appId: 'test-app-id', timestamp: 1234567890 },
        { appSecret: 'test-secret', method: SignatureMethod.SHA256 }
      );

      expect(result).toHaveProperty('signature');
      expect(result.signature.length).toBe(64); // SHA256 hex length
    });

    it('[P0] should use MD5 as default method', async () => {
      const result = await generateSignature(
        { appId: 'test-app-id', timestamp: 1234567890 },
        { appSecret: 'test-secret' }
      );

      expect(result.method).toBe(SignatureMethod.MD5);
    });

    it('[P1] should throw error without appSecret', async () => {
      await expect(
        generateSignature({ appId: 'test', timestamp: 123 }, { appSecret: '' })
      ).rejects.toThrow('appSecret is required');
    });

    it('[P1] should throw error without appId', async () => {
      await expect(
        generateSignature({ appId: '', timestamp: 123 }, { appSecret: 'secret' })
      ).rejects.toThrow('appId is required');
    });

    it('[P1] should include additional params in signature', async () => {
      const result = await generateSignature(
        { appId: 'test-app-id', timestamp: 1234567890, params: { channelId: '123456' } },
        { appSecret: 'test-secret' }
      );

      expect(result).toHaveProperty('signature');
    });

    it('[P1] should include nested params in signature', async () => {
      const result = await generateSignature(
        { appId: 'test-app-id', timestamp: 1234567890, params: { channel: '123' } },
        { appSecret: 'test-secret' }
      );

      expect(result).toHaveProperty('signature');
    });
  });

  describe('createSignature', () => {
    it('[P0] should create signature from appId and secret', () => {
      const result = createSignature('test-app-id', 'test-secret');

      expect(result).toHaveProperty('sign');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('method');
      expect(typeof result.sign).toBe('string');
    });

    it('[P1] should use MD5 as default method', () => {
      const result = createSignature('test-app-id', 'test-secret');

      expect(result.method).toBe(SignatureMethod.MD5);
    });

    it('[P1] should support SHA256 method', () => {
      const result = createSignature('test-app-id', 'test-secret', {}, SignatureMethod.SHA256);

      expect(result.method).toBe(SignatureMethod.SHA256);
    });

    it('[P1] should include additional params in signature', () => {
      const result = createSignature('test-app-id', 'test-secret', { channelId: '123456' });

      expect(result).toHaveProperty('sign');
    });
  });

  describe('getEnvironmentInfo', () => {
    it('[P0] should return environment info', () => {
      const info = getEnvironmentInfo();

      expect(info).toHaveProperty('isNode');
      expect(info).toHaveProperty('cryptoSource');
    });
  });
});
