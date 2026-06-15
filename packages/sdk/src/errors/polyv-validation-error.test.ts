import { describe, it, expect } from 'vitest';
import { PolyVValidationError } from './polyv-validation-error.js';

describe('PolyVValidationError', () => {
  describe('constructor', () => {
    it('should create with message only', () => {
      const err = new PolyVValidationError('test error');
      expect(err.message).toBe('test error');
      expect(err.name).toBe('PolyVValidationError');
      expect(err.code).toBe('ERR_VALIDATION');
      expect(err.field).toBeUndefined();
      expect(err.invalidValue).toBeUndefined();
      expect(err.constraints).toBeUndefined();
    });

    it('should create with field', () => {
      const err = new PolyVValidationError('test', 'myField');
      expect(err.field).toBe('myField');
      expect(err.details).toEqual({ field: 'myField' });
    });

    it('should create with invalidValue', () => {
      const err = new PolyVValidationError('test', 'myField', 'bad');
      expect(err.invalidValue).toBe('bad');
      expect(err.details).toEqual({ field: 'myField', invalidValue: 'bad' });
    });

    it('should create with constraints', () => {
      const constraints = { min: 1, max: 10 };
      const err = new PolyVValidationError('test', 'n', 0, constraints);
      expect(err.constraints).toEqual(constraints);
    });

    it('should create with custom code', () => {
      const err = new PolyVValidationError('test', undefined, undefined, undefined, 'CUSTOM');
      expect(err.code).toBe('CUSTOM');
    });

    it('should not set details when no extra fields', () => {
      const err = new PolyVValidationError('simple error');
      expect(err.details).toBeUndefined();
    });

    it('should be instanceof PolyVValidationError', () => {
      const err = new PolyVValidationError('test');
      expect(err).toBeInstanceOf(PolyVValidationError);
    });
  });

  describe('toJSON', () => {
    it('should serialize with all fields', () => {
      const err = new PolyVValidationError('test', 'f', 'v', { min: 1 });
      const json = err.toJSON();
      expect(json).toEqual({
        name: 'PolyVValidationError',
        message: 'test',
        code: 'ERR_VALIDATION',
        details: undefined,
        field: 'f',
        invalidValue: 'v',
        constraints: { min: 1 },
      });
    });

    it('should serialize minimal error', () => {
      const err = new PolyVValidationError('minimal');
      const json = err.toJSON();
      expect(json.field).toBeUndefined();
      expect(json.invalidValue).toBeUndefined();
      expect(json.constraints).toBeUndefined();
    });
  });

  describe('toString', () => {
    it('should include field when present', () => {
      const err = new PolyVValidationError('bad', 'myField');
      expect(err.toString()).toBe('PolyVValidationError [field=myField]: bad');
    });

    it('should exclude field when absent', () => {
      const err = new PolyVValidationError('bad');
      expect(err.toString()).toBe('PolyVValidationError: bad');
    });
  });

  describe('static factory methods', () => {
    it('required() should create required error', () => {
      const err = PolyVValidationError.required('name');
      expect(err.message).toBe('name is required');
      expect(err.field).toBe('name');
      expect(err.code).toBe('ERR_REQUIRED');
    });

    it('invalidType() should create type error', () => {
      const err = PolyVValidationError.invalidType('age', 'number', 'abc');
      expect(err.message).toContain('must be of type number');
      expect(err.field).toBe('age');
      expect(err.invalidValue).toBe('abc');
      expect(err.constraints).toEqual({ expectedType: 'number' });
    });

    it('outOfRange() with min and max', () => {
      const err = PolyVValidationError.outOfRange('val', 15, { min: 1, max: 10 });
      expect(err.message).toContain('between 1 and 10');
      expect(err.invalidValue).toBe(15);
    });

    it('outOfRange() with only min', () => {
      const err = PolyVValidationError.outOfRange('val', -1, { min: 0 });
      expect(err.message).toContain('at least 0');
    });

    it('outOfRange() with only max', () => {
      const err = PolyVValidationError.outOfRange('val', 100, { max: 50 });
      expect(err.message).toContain('at most 50');
    });

    it('outOfRange() with no constraints', () => {
      const err = PolyVValidationError.outOfRange('val', 5, {});
      expect(err.message).toContain('out of range');
    });

    it('patternMismatch() should create pattern error', () => {
      const pattern = /^\d+$/;
      const err = PolyVValidationError.patternMismatch('code', 'abc', pattern);
      expect(err.message).toContain('does not match expected pattern');
      expect(err.field).toBe('code');
      expect(err.constraints).toEqual({ pattern: '^\\d+$' });
    });

    it('aggregate() should return null for empty array', () => {
      expect(PolyVValidationError.aggregate([])).toBeNull();
    });

    it('aggregate() should aggregate multiple errors', () => {
      const errors = [
        PolyVValidationError.required('name'),
        PolyVValidationError.required('email'),
      ];
      const agg = PolyVValidationError.aggregate(errors);
      expect(agg).not.toBeNull();
      expect(agg!.message).toContain('2 error(s)');
      expect(agg!.errors).toHaveLength(2);
      expect(agg!.errors![0].field).toBe('name');
      expect(agg!.errors![1].field).toBe('email');
    });

    it('aggregate() should aggregate single error', () => {
      const errors = [PolyVValidationError.required('name')];
      const agg = PolyVValidationError.aggregate(errors);
      expect(agg!.message).toContain('1 error(s)');
      expect(agg!.errors).toHaveLength(1);
    });
  });
});
