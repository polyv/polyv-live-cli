import { createHash } from 'crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSignature, generateSignature, generateTimestamp, sortParams } from './signature.js';
import { SignatureMethod } from '../types/signature.js';

function expectedHash(source: string, algorithm: 'md5' | 'sha256'): string {
  return createHash(algorithm).update(source, 'utf8').digest('hex').toUpperCase();
}

describe('auth signature', () => {
  afterEach(() => {
    vi.doUnmock('../utils/env.js');
    vi.resetModules();
  });

  it('generates deterministic MD5 signatures from sorted raw params', () => {
    const result = generateSignature(
      {
        timestamp: 123,
        channelId: 'ch1',
        appId: 'app',
        empty: '',
        nil: null,
        undef: undefined,
      },
      { appSecret: 'secret' }
    );

    expect(result).toEqual({
      sign: expectedHash('secretappIdappchannelIdch1emptytimestamp123secret', 'md5'),
      timestamp: 123,
      method: 'MD5',
    });
  });

  it('generates deterministic SHA256 signatures from nested input params', () => {
    const result = generateSignature(
      {
        appId: 'app',
        timestamp: 456,
        params: {
          channelId: 'ch1',
          name: 'demo',
        },
      },
      { appSecret: 'secret', method: SignatureMethod.SHA256 }
    );

    expect(result).toEqual({
      sign: expectedHash('secretappIdappchannelIdch1namedemotimestamp456secret', 'sha256'),
      timestamp: 456,
      method: 'SHA256',
    });
  });

  it('supports signatureMethod metadata without signing the metadata field', () => {
    const result = generateSignature(
      {
        appId: 'app',
        timestamp: 789,
        channelId: 'ch1',
        signatureMethod: 'SHA256',
      },
      { appSecret: 'secret' }
    );

    expect(result).toEqual({
      sign: expectedHash('secretappIdappchannelIdch1timestamp789secret', 'sha256'),
      timestamp: 789,
      method: 'SHA256',
    });
  });

  it('auto-generates timestamps and validates required fields', () => {
    const before = Date.now();
    const result = generateSignature({ appId: 'app' }, { appSecret: 'secret' });
    const after = Date.now();

    expect(result.timestamp).toBeGreaterThanOrEqual(before);
    expect(result.timestamp).toBeLessThanOrEqual(after);
    expect(() => generateSignature({ appId: 'app' }, { appSecret: '' })).toThrow('appSecret is required');
    expect(() => generateSignature({ timestamp: 1 }, { appSecret: 'secret' })).toThrow('appId is required');
  });

  it('exposes timestamp, sorting, and convenience signature helpers', () => {
    expect(generateTimestamp(1234)).toBe(1234);
    expect(sortParams({ b: 1, a: 2, c: null, d: undefined })).toEqual(['a', 'b']);

    const result = createSignature('app', 'secret', { channelId: 'ch1' }, SignatureMethod.SHA256);
    expect(result.method).toBe('SHA256');
    expect(result.sign).toHaveLength(64);
  });

  it('uses CryptoJS hashing when the environment is not Node.js', async () => {
    vi.resetModules();
    vi.doMock('../utils/env.js', () => ({ isNode: false }));

    const browserSignature = await import('./signature.js');

    expect(browserSignature.generateSignature(
      { appId: 'app', timestamp: 123 },
      { appSecret: 'secret' }
    ).sign).toHaveLength(32);
    expect(browserSignature.generateSignature(
      { appId: 'app', timestamp: 123 },
      { appSecret: 'secret', method: SignatureMethod.SHA256 }
    ).sign).toHaveLength(64);
  });
});
