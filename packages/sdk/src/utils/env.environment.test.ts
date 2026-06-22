import { afterEach, describe, expect, it, vi } from 'vitest';

async function importFreshEnv() {
  vi.resetModules();
  return import('./env.js');
}

describe('environment detection variants', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('detects a browser-like environment with Web Crypto', async () => {
    vi.stubGlobal('process', undefined);
    vi.stubGlobal('window', {});
    vi.stubGlobal('document', {});
    vi.stubGlobal('crypto', {});

    const env = await importFreshEnv();

    expect(env.isNode).toBe(false);
    expect(env.isBrowser).toBe(true);
    expect(env.isWebWorker).toBe(false);
    expect(env.getEnvironmentInfo()).toMatchObject({
      cryptoAvailable: true,
      cryptoSource: 'browser',
    });
  });

  it('detects a dedicated web worker environment', async () => {
    vi.stubGlobal('process', undefined);
    vi.stubGlobal('window', undefined);
    vi.stubGlobal('document', undefined);
    vi.stubGlobal('self', { constructor: { name: 'DedicatedWorkerGlobalScope' } });

    const env = await importFreshEnv();

    expect(env.isNode).toBe(false);
    expect(env.isBrowser).toBe(false);
    expect(env.isWebWorker).toBe(true);
  });

  it('falls back to crypto-js when no native crypto source is available', async () => {
    const originalCrypto = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
    vi.stubGlobal('process', undefined);
    vi.stubGlobal('window', undefined);
    vi.stubGlobal('document', undefined);
    Reflect.deleteProperty(globalThis, 'crypto');

    try {
      const env = await importFreshEnv();

      expect(env.getEnvironmentInfo()).toMatchObject({
        cryptoAvailable: true,
        cryptoSource: 'crypto-js',
      });
    } finally {
      if (originalCrypto) {
        Object.defineProperty(globalThis, 'crypto', originalCrypto);
      }
    }
  });
});
