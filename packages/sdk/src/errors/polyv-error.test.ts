import { describe, expect, it } from 'vitest';
import { PolyVError } from './polyv-error.js';

describe('PolyVError', () => {
  it('creates a base SDK error with code and details', () => {
    const error = new PolyVError('Something failed', 'ERR_TEST', { field: 'channelId' });

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(PolyVError);
    expect(error.name).toBe('PolyVError');
    expect(error.message).toBe('Something failed');
    expect(error.code).toBe('ERR_TEST');
    expect(error.details).toEqual({ field: 'channelId' });
  });

  it('serializes to JSON for logging', () => {
    const error = new PolyVError('Serializable', 'ERR_JSON', { retryable: false });

    expect(error.toJSON()).toEqual({
      name: 'PolyVError',
      message: 'Serializable',
      code: 'ERR_JSON',
      details: { retryable: false },
    });
  });

  it('formats with and without an error code', () => {
    expect(new PolyVError('Coded', 'ERR_CODED').toString()).toBe('PolyVError [ERR_CODED]: Coded');
    expect(new PolyVError('Plain').toString()).toBe('PolyVError: Plain');
  });
});
