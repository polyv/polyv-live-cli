/**
 * Environment Detection Utilities
 *
 * Detects the runtime environment (Node.js or Browser) for proper
 * crypto implementation selection.
 */

/**
 * Check if running in Node.js environment
 */
export const isNode: boolean =
  typeof process !== 'undefined' &&
  process.versions != null &&
  process.versions.node != null;

/**
 * Check if running in browser environment
 */
export const isBrowser: boolean =
  typeof globalThis !== 'undefined' &&
  typeof (globalThis as typeof globalThis & { window?: unknown; document?: unknown }).window !== 'undefined' &&
  typeof (globalThis as typeof globalThis & { window?: unknown; document?: unknown }).document !== 'undefined';

/**
 * Check if running in Web Worker
 */
export const isWebWorker: boolean =
  typeof globalThis !== 'undefined' &&
  typeof (globalThis as typeof globalThis & { self?: unknown; DedicatedWorkerGlobalScope?: unknown }).self === 'object' &&
  (globalThis as typeof globalThis & { self?: unknown; DedicatedWorkerGlobalScope?: unknown }).self != null &&
  ((globalThis as typeof globalThis & { self?: { constructor?: { name?: string } } }).self?.constructor?.name === 'DedicatedWorkerGlobalScope');

/**
 * Crypto source type
 */
export type CryptoSource = 'node' | 'browser' | 'crypto-js' | 'none';

/**
 * Environment information interface
 */
export interface EnvironmentInfo {
  /** Whether running in Node.js environment */
  isNode: boolean;
  /** Whether running in browser environment */
  isBrowser: boolean;
  /** Whether running in Web Worker */
  isWebWorker: boolean;
  /** Whether crypto is available */
  cryptoAvailable: boolean;
  /** Source of crypto implementation */
  cryptoSource: CryptoSource;
}

/**
 * Determine the crypto source based on environment
 * @returns The crypto source type
 */
function getCryptoSource(): CryptoSource {
  if (isNode) {
    return 'node';
  }
  if (typeof globalThis !== 'undefined' && 'crypto' in globalThis) {
    // Browser Web Crypto API
    return 'browser';
  }
  // crypto-js will be used as fallback
  return 'crypto-js';
}

/**
 * Get comprehensive environment information
 *
 * Returns an object containing all environment detection results,
 * including crypto availability and source.
 *
 * @returns Environment information object
 *
 * @example
 * ```typescript
 * const info = getEnvironmentInfo();
 * console.log(info.isNode); // true in Node.js
 * console.log(info.cryptoSource); // 'node' in Node.js
 * ```
 */
export function getEnvironmentInfo(): EnvironmentInfo {
  const cryptoSource = getCryptoSource();

  return {
    isNode,
    isBrowser,
    isWebWorker,
    cryptoAvailable: cryptoSource !== 'none',
    cryptoSource,
  };
}
