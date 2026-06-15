/**
 * Signature Utilities - Cross-Environment Support
 *
 * Provides MD5 and SHA256 signature generation for PolyV API authentication.
 * This module re-exports from auth/signature with a compatible interface for tests.
 *
 * @module utils/signature
 */

import {
  generateSignature as authGenerateSignature,
  createSignature,
  generateTimestamp,
  sortParams,
} from '../auth/signature.js';
import { SignatureMethod } from '../types/signature.js';
import type { SignatureInput, SignatureOutput as AuthSignatureOutput } from '../types/signature.js';
import type { SignatureConfig } from '../types/auth.js';
import { getEnvironmentInfo as getEnvInfo, isNode } from './env.js';
import type { EnvironmentInfo, CryptoSource } from './env.js';

/**
 * Get environment information
 * Re-exported for test compatibility
 */
export function getEnvironmentInfo(): EnvironmentInfo {
  return getEnvInfo();
}

/**
 * Signature Output Result (test-compatible interface)
 */
export interface SignatureOutput {
  /** Generated signature (uppercase hex) */
  signature: string;
  /** Timestamp used for signature */
  timestamp: number;
  /** Signature method used */
  method: string;
  /** Crypto implementation used (node, browser, crypto-js) */
  cryptoUsed?: CryptoSource;
}

/**
 * Convert auth signature output to test-compatible format
 */
function toTestFormat(result: AuthSignatureOutput): SignatureOutput {
  return {
    signature: result.sign,
    timestamp: result.timestamp,
    method: result.method,
    cryptoUsed: isNode ? 'node' : 'crypto-js',
  };
}

/**
 * Options for signature generation
 */
export interface SignatureOptions {
  /** PolyV App Secret */
  appSecret: string;
  /** Signature method (default: MD5) */
  method?: SignatureMethod;
}

/**
 * Generate signature for PolyV API authentication (async interface)
 *
 * The signature algorithm:
 * 1. Filter out null/undefined parameter values
 * 2. Sort remaining parameters by key (ASCII order)
 * 3. Concatenate as key1value1key2value2...
 * 4. Prepend and append appSecret
 * 5. Compute MD5 or SHA256 hash (uppercase hex)
 *
 * @param input Signature input with appId, timestamp, and optional params
 * @param options Signature options with appSecret and optional method
 * @returns Promise resolving to signature output
 *
 * @example
 * ```typescript
 * const result = await generateSignature(
 *   { appId: 'g4rqgmmjuo', timestamp: 1660270926732 },
 *   { appSecret: 'fsq2k5weced1h8vui657xtdva66whf0g' }
 * );
 * // result.signature depends on input parameters
 * ```
 */
export async function generateSignature(
  input: SignatureInput,
  options: SignatureOptions
): Promise<SignatureOutput> {
  // Validate required parameters
  if (!options.appSecret) {
    throw new Error('appSecret is required for signature generation');
  }

  if (!input.appId) {
    throw new Error('appId is required for signature generation');
  }

  // Build params for auth signature
  const params: Record<string, unknown> = {
    appId: input.appId,
    timestamp: input.timestamp,
  };

  // Add additional parameters from input (excluding appId and timestamp which are already added)
  for (const [key, value] of Object.entries(input)) {
    if (key !== 'appId' && key !== 'timestamp' && key !== 'params') {
      params[key] = value;
    }
  }

  // Also add nested params if present
  if (input.params) {
    Object.assign(params, input.params);
  }

  const config: SignatureConfig = {
    appSecret: options.appSecret,
    method: options.method || SignatureMethod.MD5,
  };

  const result = authGenerateSignature(params, config);
  return toTestFormat(result);
}

// Re-export types and enum
export { SignatureMethod };
export type { SignatureInput };

// Additional exports for convenience
export { createSignature, generateTimestamp, sortParams };
