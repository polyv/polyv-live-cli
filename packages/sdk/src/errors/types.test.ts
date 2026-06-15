/**
 * @fileoverview Unit tests for error types
 * @module errors/types.test
 */

import { describe, it, expect } from 'vitest';
import type { PolyVErrorOptions, ValidationConstraints } from './types.js';
import type { PolyVAPIErrorOptions, PolyVAPIErrorResponse } from './polyv-api-error.js';

describe('Error Types', () => {
  describe('PolyVErrorOptions', () => {
    it('should allow code and details properties', () => {
      const options: PolyVErrorOptions = {
        code: 'TEST_ERROR',
        details: { foo: 'bar' },
      };
      expect(options.code).toBe('TEST_ERROR');
      expect(options.details).toEqual({ foo: 'bar' });
    });

    it('should allow empty options', () => {
      const options: PolyVErrorOptions = {};
      expect(options.code).toBeUndefined();
      expect(options.details).toBeUndefined();
    });
  });

  describe('PolyVAPIErrorOptions', () => {
    it('should allow polyvCode and polyvMessage', () => {
      const options: PolyVAPIErrorOptions = {
        code: 'API_ERROR',
        polyvCode: 200001,
        polyvMessage: 'Invalid parameter',
      };
      expect(options.code).toBe('API_ERROR');
      expect(options.polyvCode).toBe(200001);
      expect(options.polyvMessage).toBe('Invalid parameter');
    });

    it('should allow empty options', () => {
      const options: PolyVAPIErrorOptions = {};
      expect(options.code).toBeUndefined();
      expect(options.polyvCode).toBeUndefined();
    });
  });

  describe('PolyVAPIErrorResponse', () => {
    it('should have correct structure', () => {
      const response: PolyVAPIErrorResponse = {
        code: 200,
        status: 'success',
        message: 'Request successful',
        data: {
          polyvCode: 0,
          polyvMessage: 'OK',
        },
      };
      expect(response.code).toBe(200);
      expect(response.status).toBe('success');
      expect(response.message).toBe('Request successful');
    });

    it('should allow response without data', () => {
      const response: PolyVAPIErrorResponse = {
        code: 400,
        status: 'error',
        message: 'Bad request',
      };
      expect(response.code).toBe(400);
      expect(response.data).toBeUndefined();
    });
  });

  describe('ValidationConstraints', () => {
    it('should allow validation constraint properties', () => {
      const constraints: ValidationConstraints = {
        minLength: 1,
        maxLength: 100,
        min: 0,
        max: 1000,
      };
      expect(constraints.minLength).toBe(1);
      expect(constraints.maxLength).toBe(100);
    });

    it('should allow empty constraints', () => {
      const constraints: ValidationConstraints = {};
      expect(constraints.minLength).toBeUndefined();
      expect(constraints.maxLength).toBeUndefined();
    });
  });
});
