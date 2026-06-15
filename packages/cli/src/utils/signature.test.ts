/**
 * Unit tests for signature generation utilities
 */

import {
  generateTimestamp,
  filterParams,
  sortAndConcatenateParams,
  processParams,
  generateMD5Signature,
  generateSignature,
  createSignature
} from './signature';
import { SignatureParams, SignatureOptions } from '../types/signature';

describe('Signature Generation Utilities', () => {
  describe('generateTimestamp', () => {
    it('should generate current timestamp when no custom timestamp provided', () => {
      const before = Date.now();
      const timestamp = generateTimestamp();
      const after = Date.now();
      
      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });

    it('should return custom timestamp when provided', () => {
      const customTimestamp = 1609459200000; // 2021-01-01 00:00:00 UTC
      const timestamp = generateTimestamp(customTimestamp);
      
      expect(timestamp).toBe(customTimestamp);
    });

    it('should generate timestamp in milliseconds', () => {
      const timestamp = generateTimestamp();
      
      // Timestamp should be a 13-digit number (milliseconds since epoch)
      expect(timestamp.toString()).toHaveLength(13);
    });
  });

  describe('filterParams', () => {
    it('should remove null, undefined, and empty string values', () => {
      const params: SignatureParams = {
        appId: 'test123',
        timestamp: 1609459200000,
        userId: 'user456',
        emptyString: '',
        nullValue: null as any,
        undefinedValue: undefined,
        zeroValue: 0,
        falseValue: false
      };

      const filtered = filterParams(params);

      expect(filtered).toEqual({
        appId: 'test123',
        timestamp: 1609459200000,
        userId: 'user456',
        zeroValue: 0,
        falseValue: false
      });
    });

    it('should handle empty object', () => {
      const params: SignatureParams = {
        appId: '',
        timestamp: 0
      };

      const filtered = filterParams(params);

      expect(filtered).toEqual({
        timestamp: 0
      });
    });

    it('should preserve all valid values', () => {
      const params: SignatureParams = {
        appId: 'app123',
        timestamp: 1609459200000,
        userId: 'user456',
        customParam: 'value',
        numberParam: 42,
        booleanParam: true
      };

      const filtered = filterParams(params);

      expect(filtered).toEqual(params);
    });
  });

  describe('sortAndConcatenateParams', () => {
    it('should sort parameters alphabetically and concatenate', () => {
      const params = {
        userId: 'user123',
        appId: 'app456',
        timestamp: 1609459200000,
        customParam: 'value'
      };

      const result = sortAndConcatenateParams(params);

      expect(result).toBe('appIdapp456customParamvaluetimestamp1609459200000userIduser123');
    });

    it('should handle different data types correctly', () => {
      const params = {
        stringParam: 'text',
        numberParam: 42,
        booleanParam: true,
        zeroParam: 0,
        falseParam: false
      };

      const result = sortAndConcatenateParams(params);

      expect(result).toBe('booleanParamtruefalseParamfalsenumberParam42stringParamtextzeroParam0');
    });

    it('should handle empty object', () => {
      const params = {};

      const result = sortAndConcatenateParams(params);

      expect(result).toBe('');
    });

    it('should handle single parameter', () => {
      const params = { appId: 'test123' };

      const result = sortAndConcatenateParams(params);

      expect(result).toBe('appIdtest123');
    });
  });

  describe('processParams', () => {
    it('should filter and sort parameters correctly', () => {
      const params: SignatureParams = {
        userId: 'user123',
        appId: 'app456',
        timestamp: 1609459200000,
        emptyValue: '',
        nullValue: null as any
      };

      const result = processParams(params);

      expect(result.params).toEqual({
        appId: 'app456',
        timestamp: 1609459200000,
        userId: 'user123'
      });
      expect(result.paramString).toBe('appIdapp456timestamp1609459200000userIduser123');
    });
  });

  describe('generateMD5Signature', () => {
    it('should generate correct MD5 signature with appSecret sandwich', () => {
      const paramString = 'appIdtest123timestamp1609459200000';
      const appSecret = 'mySecret';
      
      const signature = generateMD5Signature(paramString, appSecret);
      
      // Expected MD5 of 'mySecretappIdtest123timestamp1609459200000mySecret'
      expect(signature).toBe('EFF0E886F37955B5767430D5A0F4824D'); // Actual calculated MD5
      expect(signature).toMatch(/^[A-F0-9]{32}$/); // Should be 32 uppercase hex chars
    });

    it('should produce consistent results for same input', () => {
      const paramString = 'appIdtest123timestamp1609459200000';
      const appSecret = 'mySecret';
      
      const signature1 = generateMD5Signature(paramString, appSecret);
      const signature2 = generateMD5Signature(paramString, appSecret);
      
      expect(signature1).toBe(signature2);
    });

    it('should generate different signatures for different inputs', () => {
      const appSecret = 'mySecret';
      
      const signature1 = generateMD5Signature('param1', appSecret);
      const signature2 = generateMD5Signature('param2', appSecret);
      
      expect(signature1).not.toBe(signature2);
    });

    it('should be case-sensitive for parameters', () => {
      const appSecret = 'mySecret';
      
      const signature1 = generateMD5Signature('Test', appSecret);
      const signature2 = generateMD5Signature('test', appSecret);
      
      expect(signature1).not.toBe(signature2);
    });
  });

  describe('generateSignature', () => {
    const mockOptions: SignatureOptions = {
      appSecret: 'testSecret123',
      customTimestamp: 1609459200000
    };

    it('should generate complete signature result', () => {
      const params: SignatureParams = {
        appId: 'app123',
        userId: 'user456'
      };

      const result = generateSignature(params, mockOptions);

      expect(result).toHaveProperty('signature');
      expect(result).toHaveProperty('timestamp', 1609459200000);
      expect(result).toHaveProperty('sortedParams');
      expect(result.signature).toMatch(/^[A-F0-9]{32}$/);
    });

    it('should include timestamp in signature calculation', () => {
      const params: SignatureParams = {
        appId: 'app123',
        userId: 'user456'
      };

      const result = generateSignature(params, mockOptions);

      expect(result.sortedParams).toHaveProperty('timestamp', 1609459200000);
      expect(result.timestamp).toBe(1609459200000);
    });

    it('should throw error when appId is missing', () => {
      const params: SignatureParams = {
        appId: ''
      };

      expect(() => generateSignature(params, mockOptions)).toThrow('appId is required for signature generation');
    });

    it('should throw error when appSecret is missing', () => {
      const params: SignatureParams = {
        appId: 'app123'
      };

      const options: SignatureOptions = {
        appSecret: ''
      };

      expect(() => generateSignature(params, options)).toThrow('appSecret is required for signature generation');
    });

    it('should include debug information when debug mode is enabled', () => {
      const params: SignatureParams = {
        appId: 'app123',
        userId: 'user456'
      };

      const debugOptions: SignatureOptions = {
        ...mockOptions,
        debug: true
      };

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = generateSignature(params, debugOptions);

      expect(result).toHaveProperty('rawString');
      expect(result.rawString).toContain(mockOptions.appSecret);
      expect(consoleSpy).toHaveBeenCalledWith('[Signature Debug] Sorted parameters:', expect.any(Object));

      consoleSpy.mockRestore();
    });

    it('should generate current timestamp when customTimestamp is not provided', () => {
      const params: SignatureParams = {
        appId: 'app123',
        userId: 'user456'
      };

      const options: SignatureOptions = {
        appSecret: 'testSecret123'
      };

      const before = Date.now();
      const result = generateSignature(params, options);
      const after = Date.now();

      expect(result.timestamp).toBeGreaterThanOrEqual(before);
      expect(result.timestamp).toBeLessThanOrEqual(after);
    });

    it('should filter out empty values from parameters', () => {
      const params: SignatureParams = {
        appId: 'app123',
        userId: '',
        customParam: null as any,
        validParam: 'value'
      };

      const result = generateSignature(params, mockOptions);

      expect(result.sortedParams).not.toHaveProperty('userId');
      expect(result.sortedParams).not.toHaveProperty('customParam');
      expect(result.sortedParams).toHaveProperty('validParam', 'value');
    });
  });

  describe('createSignature', () => {
    it('should generate signature without timestamp parameter', () => {
      const params = {
        appId: 'app123',
        userId: 'user456'
      };

      const result = createSignature(params, 'testSecret123');

      expect(result).toHaveProperty('signature');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('sortedParams');
      expect(result.signature).toMatch(/^[A-F0-9]{32}$/);
    });

    it('should use current timestamp', () => {
      const params = {
        appId: 'app123',
        userId: 'user456'
      };

      const before = Date.now();
      const result = createSignature(params, 'testSecret123');
      const after = Date.now();

      expect(result.timestamp).toBeGreaterThanOrEqual(before);
      expect(result.timestamp).toBeLessThanOrEqual(after);
    });

    it('should support debug mode', () => {
      const params = {
        appId: 'app123',
        userId: 'user456'
      };

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = createSignature(params, 'testSecret123', true);

      expect(result).toHaveProperty('rawString');
      expect(consoleSpy).toHaveBeenCalledWith('[Signature Debug] Sorted parameters:', expect.any(Object));

      consoleSpy.mockRestore();
    });
  });

  describe('Integration Tests', () => {
    it('should generate valid signature for known test case', () => {
      // Test case based on PolyV documentation example
      const params: SignatureParams = {
        appId: 'test123',
        timestamp: 1609459200000,
        userId: 'user456'
      };

      const options: SignatureOptions = {
        appSecret: 'mySecret',
        customTimestamp: 1609459200000
      };

      const result = generateSignature(params, options);

      // Verify the signature generation process
      expect(result.sortedParams).toEqual({
        appId: 'test123',
        timestamp: 1609459200000,
        userId: 'user456'
      });

      // The parameter string should be: appIdtest123timestamp1609459200000userIduser456
      // The raw string should be: mySecretappIdtest123timestamp1609459200000userIduser456mySecret
      expect(result.signature).toMatch(/^[A-F0-9]{32}$/);
      expect(result.timestamp).toBe(1609459200000);
    });

    it('should handle complex parameter combinations', () => {
      const params: SignatureParams = {
        appId: 'complex123',
        userId: 'user789',
        customParam1: 'value1',
        customParam2: 42,
        customParam3: true,
        emptyParam: '',
        nullParam: null as any
      };

      const options: SignatureOptions = {
        appSecret: 'complexSecret',
        customTimestamp: 1609459200000
      };

      const result = generateSignature(params, options);

      // Should only include non-empty parameters
      expect(result.sortedParams).toEqual({
        appId: 'complex123',
        customParam1: 'value1',
        customParam2: 42,
        customParam3: true,
        timestamp: 1609459200000,
        userId: 'user789'
      });

      expect(result.signature).toMatch(/^[A-F0-9]{32}$/);
    });

    it('should produce consistent signatures for same parameters', () => {
      const params = {
        appId: 'consistency-test',
        userId: 'user123'
      };

      // Timestamps will be different, so compare the process with fixed timestamps
      const options: SignatureOptions = {
        appSecret: 'secret123',
        customTimestamp: 1609459200000
      };

      const consistentResult1 = generateSignature(params, options);
      const consistentResult2 = generateSignature({ ...params }, options);

      expect(consistentResult1.signature).toBe(consistentResult2.signature);
    });
  });
});