/**
 * @fileoverview Tests for PolyVAPIError class
 */
import { describe, it, expect } from 'vitest';
import { PolyVAPIError, PolyVAPIErrorResponse } from './polyv-api-error.js';
import { PolyVError } from './polyv-error.js';

describe('PolyVAPIError', () => {
  describe('constructor', () => {
    it('should create error with message and statusCode', () => {
      const error = new PolyVAPIError('Test error', 400);
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(PolyVError);
      expect(error).toBeInstanceOf(PolyVAPIError);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('PolyVAPIError');
    });

    it('should create error with options', () => {
      const error = new PolyVAPIError('API error', 500, {
        polyvCode: 1001,
        polyvMessage: 'Invalid parameter',
        code: 'INVALID_PARAM',
        details: { field: 'channelId' },
      });
      expect(error.statusCode).toBe(500);
      expect(error.polyvCode).toBe(1001);
      expect(error.polyvMessage).toBe('Invalid parameter');
      expect(error.code).toBe('INVALID_PARAM');
      expect(error.details).toEqual({ field: 'channelId' });
    });

    it('should create error without options', () => {
      const error = new PolyVAPIError('Simple error', 404);
      expect(error.statusCode).toBe(404);
      expect(error.polyvCode).toBeUndefined();
      expect(error.polyvMessage).toBeUndefined();
    });
  });

  describe('fromResponse', () => {
    it('should create error from API response', () => {
      const response: PolyVAPIErrorResponse = {
        code: 400,
        status: 'error',
        message: 'Bad request',
        data: {
          polyvCode: 2001,
          polyvMessage: 'Channel not found',
        },
      };
      const error = PolyVAPIError.fromResponse(response);
      expect(error).toBeInstanceOf(PolyVAPIError);
      expect(error.message).toBe('Bad request');
      expect(error.statusCode).toBe(400);
      expect(error.polyvCode).toBe(2001);
      expect(error.polyvMessage).toBe('Channel not found');
    });

    it('should create error from response without data', () => {
      const response: PolyVAPIErrorResponse = {
        code: 500,
        status: 'error',
        message: 'Internal server error',
      };
      const error = PolyVAPIError.fromResponse(response);
      expect(error.message).toBe('Internal server error');
      expect(error.statusCode).toBe(500);
      expect(error.polyvCode).toBeUndefined();
      expect(error.polyvMessage).toBeUndefined();
    });
  });

  describe('isRetryable', () => {
    it('should return true for 5xx errors', () => {
      expect(new PolyVAPIError('Error', 500).isRetryable()).toBe(true);
      expect(new PolyVAPIError('Error', 502).isRetryable()).toBe(true);
      expect(new PolyVAPIError('Error', 503).isRetryable()).toBe(true);
      expect(new PolyVAPIError('Error', 599).isRetryable()).toBe(true);
    });

    it('should return true for 429 rate limit', () => {
      expect(new PolyVAPIError('Rate limited', 429).isRetryable()).toBe(true);
    });

    it('should return false for other 4xx errors', () => {
      expect(new PolyVAPIError('Bad request', 400).isRetryable()).toBe(false);
      expect(new PolyVAPIError('Unauthorized', 401).isRetryable()).toBe(false);
      expect(new PolyVAPIError('Forbidden', 403).isRetryable()).toBe(false);
      expect(new PolyVAPIError('Not found', 404).isRetryable()).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('should serialize error to JSON', () => {
      const error = new PolyVAPIError('Test error', 400, {
        polyvCode: 1001,
        polyvMessage: 'Invalid',
        code: 'TEST_CODE',
        details: { key: 'value' },
      });
      const json = error.toJSON();
      expect(json.name).toBe('PolyVAPIError');
      expect(json.message).toBe('Test error');
      expect(json.code).toBe('TEST_CODE');
      expect(json.details).toEqual({ key: 'value' });
      expect(json.statusCode).toBe(400);
      expect(json.polyvCode).toBe(1001);
      expect(json.polyvMessage).toBe('Invalid');
    });
  });

  describe('toString', () => {
    it('should return formatted string with polyvCode', () => {
      const error = new PolyVAPIError('Test error', 400, {
        polyvCode: 1001,
      });
      expect(error.toString()).toBe('PolyVAPIError [1001]: Test error');
    });

    it('should return formatted string without polyvCode', () => {
      const error = new PolyVAPIError('Test error', 400);
      expect(error.toString()).toBe('PolyVAPIError: Test error');
    });
  });
});
