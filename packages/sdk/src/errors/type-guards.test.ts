import { describe, it, expect } from 'vitest';
import { isPolyVError, isPolyVAPIError, isPolyVValidationError } from './type-guards.js';
import { PolyVError } from './polyv-error.js';
import { PolyVAPIError } from './polyv-api-error.js';
import { PolyVValidationError } from './polyv-validation-error.js';

describe('type-guards', () => {
  describe('isPolyVError', () => {
    it('should return true for PolyVError instance', () => {
      const error = new PolyVError('Test error');
      expect(isPolyVError(error)).toBe(true);
    });

    it('should return true for PolyVAPIError instance (subclass of PolyVError)', () => {
      const error = new PolyVAPIError('Test error', 400, { polyvCode: 10001 });
      expect(isPolyVError(error)).toBe(true);
    });

    it('should return true for PolyVValidationError instance (subclass of PolyVError)', () => {
      const error = new PolyVValidationError('Test error');
      expect(isPolyVError(error)).toBe(true);
    });

    it('should return false for standard Error', () => {
      const error = new Error('Standard error');
      expect(isPolyVError(error)).toBe(false);
    });

    it('should return false for string', () => {
      expect(isPolyVError('error')).toBe(false);
    });

    it('should return false for null', () => {
      expect(isPolyVError(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isPolyVError(undefined)).toBe(false);
    });

    it('should return false for object without prototype', () => {
      expect(isPolyVError({})).toBe(false);
    });

    it('should return false for number', () => {
      expect(isPolyVError(123)).toBe(false);
    });
  });

  describe('isPolyVAPIError', () => {
    it('should return true for PolyVAPIError instance', () => {
      const error = new PolyVAPIError('Test error', 400, { polyvCode: 10001 });
      expect(isPolyVAPIError(error)).toBe(true);
    });

    it('should return false for PolyVError (parent class)', () => {
      const error = new PolyVError('Test error');
      expect(isPolyVAPIError(error)).toBe(false);
    });

    it('should return false for PolyVValidationError (sibling class)', () => {
      const error = new PolyVValidationError('Test error');
      expect(isPolyVAPIError(error)).toBe(false);
    });

    it('should return false for standard Error', () => {
      const error = new Error('Standard error');
      expect(isPolyVAPIError(error)).toBe(false);
    });

    it('should return false for string', () => {
      expect(isPolyVAPIError('error')).toBe(false);
    });

    it('should return false for null', () => {
      expect(isPolyVAPIError(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isPolyVAPIError(undefined)).toBe(false);
    });
  });

  describe('isPolyVValidationError', () => {
    it('should return true for PolyVValidationError instance', () => {
      const error = new PolyVValidationError('Test error');
      expect(isPolyVValidationError(error)).toBe(true);
    });

    it('should return false for PolyVError (parent class)', () => {
      const error = new PolyVError('Test error');
      expect(isPolyVValidationError(error)).toBe(false);
    });

    it('should return false for PolyVAPIError (sibling class)', () => {
      const error = new PolyVAPIError('Test error', 400, { polyvCode: 10001 });
      expect(isPolyVValidationError(error)).toBe(false);
    });

    it('should return false for standard Error', () => {
      const error = new Error('Standard error');
      expect(isPolyVValidationError(error)).toBe(false);
    });

    it('should return false for string', () => {
      expect(isPolyVValidationError('error')).toBe(false);
    });

    it('should return false for null', () => {
      expect(isPolyVValidationError(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isPolyVValidationError(undefined)).toBe(false);
    });
  });
});
