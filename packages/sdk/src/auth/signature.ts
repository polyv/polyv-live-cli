/**
 * Signature Generation Module
 *
 * Provides MD5 and SHA256 signature generation for PolyV API authentication.
 * Supports both Node.js (native crypto) and browser (crypto-js) environments.
 *
 * @module auth/signature
 */

import CryptoJS from 'crypto-js';
import { createHash } from 'crypto';
import { isNode } from '../utils/env.js';
import { SignatureMethod } from '../types/signature.js';
import type { SignatureOutput, SignatureInput } from '../types/signature.js';
import type { SignatureConfig } from '../types/auth.js';

/**
 * Filter out null and undefined values from parameters
 * @param params Input parameters
 * @returns Filtered parameters with valid values only
 */
function filterParams(params: Record<string, unknown>): Record<string, string> {
  const filtered: Record<string, string> = {};

  for (const [key, value] of Object.entries(params)) {
    // Skip null and undefined values (but NOT empty strings)
    if (value !== null && value !== undefined) {
      filtered[key] = String(value);
    }
  }

  return filtered;
}

/**
 * Sort parameters by key name alphabetically and concatenate into string
 * Format: key1value1key2value2...
 * @param params Filtered parameters
 * @returns Concatenated parameter string
 */
function buildParamString(params: Record<string, string>): string {
  // Sort keys alphabetically (ASCII order)
  const sortedKeys = Object.keys(params).sort();

  // Concatenate key-value pairs
  let result = '';
  for (const key of sortedKeys) {
    result += key + params[key];
  }

  return result;
}

/**
 * Generate MD5 hash (uppercase hex)
 * Uses Node.js crypto in Node environment, CryptoJS in browser
 * @param data String to hash
 * @returns Uppercase MD5 hash
 */
function md5Hash(data: string): string {
  if (isNode) {
    // Node.js environment - use native crypto (synchronous)
    return createHash('md5').update(data, 'utf8').digest('hex').toUpperCase();
  } else {
    // Browser environment - use CryptoJS
    return CryptoJS.MD5(data).toString().toUpperCase();
  }
}

/**
 * Generate SHA256 hash (uppercase hex)
 * Uses Node.js crypto in Node environment, CryptoJS in browser
 * @param data String to hash
 * @returns Uppercase SHA256 hash
 */
function sha256Hash(data: string): string {
  if (isNode) {
    // Node.js environment - use native crypto (synchronous)
    return createHash('sha256').update(data, 'utf8').digest('hex').toUpperCase();
  } else {
    // Browser environment - use CryptoJS
    return CryptoJS.SHA256(data).toString().toUpperCase();
  }
}

/**
 * Generate signature for PolyV API authentication
 *
 * The signature algorithm:
 * 1. Filter out null/undefined parameter values
 * 2. Sort remaining parameters by key (ASCII order)
 * 3. Concatenate as key1value1key2value2...
 * 4. Prepend and append appSecret
 * 5. Compute MD5 or SHA256 hash (uppercase hex)
 *
 * @param params Parameters to sign (includes appId, timestamp, and optional business params)
 * @param config Signature configuration with appSecret and optional method
 * @returns Signature output with sign, timestamp, and method
 *
 * @example
 * ```typescript
 * const result = generateSignature(
 *   { appId: 'g4rqgmmjuo', timestamp: 1660270926732 },
 *   { appSecret: 'fsq2k5weced1h8vui657xtdva66whf0g' }
 * );
 * // result.sign === '0D2BDA2FD04D93A2B8832B91FD973C4D'
 * ```
 */
export function generateSignature(
  params: Record<string, unknown>,
  config: SignatureConfig
): SignatureOutput;

/**
 * Generate signature for PolyV API authentication (alternative signature)
 *
 * @param input Signature input with appId, timestamp, and optional params
 * @param config Signature configuration with appSecret and optional method
 * @returns Signature output with sign, timestamp, and method
 */
export function generateSignature(
  input: SignatureInput,
  config: SignatureConfig
): SignatureOutput;

// Implementation
export function generateSignature(
  inputOrParams: SignatureInput | Record<string, unknown>,
  config: SignatureConfig
): SignatureOutput {
  // Validate required parameters
  if (!config.appSecret) {
    throw new Error('appSecret is required for signature generation');
  }

  // Normalize input - handle both SignatureInput and raw params object
  let allParams: Record<string, unknown>;

  // Check if this is SignatureInput format (has appId, timestamp, and params property that is an object)
  // vs raw params format (has appId, timestamp, and other business params at the top level)
  const hasParamsProperty =
    'params' in inputOrParams &&
    inputOrParams.params !== null &&
    typeof inputOrParams.params === 'object' &&
    !Array.isArray(inputOrParams.params);

  if (hasParamsProperty && 'appId' in inputOrParams) {
    // SignatureInput format - params is a nested object
    const input = inputOrParams as SignatureInput;
    allParams = {
      appId: input.appId,
      timestamp: input.timestamp,
      ...(input.params as Record<string, unknown> || {}),
    };
  } else {
    // Raw params format - all properties at top level
    allParams = { ...inputOrParams } as Record<string, unknown>;
  }

  if (!allParams.appId) {
    throw new Error('appId is required for signature generation');
  }

  // Auto-generate timestamp if not provided
  const timestamp =
    typeof allParams.timestamp === 'number' ? allParams.timestamp : Date.now();
  allParams.timestamp = timestamp;

  // Determine signature method
  const useSHA256 =
    config.method === SignatureMethod.SHA256 ||
    allParams.signatureMethod === 'SHA256';

  // Remove signatureMethod from params if present (it's metadata, not for signing)
  if (allParams.signatureMethod) {
    delete allParams.signatureMethod;
  }

  // Filter and sort parameters
  const filteredParams = filterParams(allParams);
  const paramString = buildParamString(filteredParams);

  // Create signature source using appSecret sandwich method
  const signatureSource = config.appSecret + paramString + config.appSecret;

  // Generate hash
  const signature = useSHA256
    ? sha256Hash(signatureSource)
    : md5Hash(signatureSource);

  return {
    sign: signature,
    timestamp,
    method: useSHA256 ? 'SHA256' : 'MD5',
  };
}

/**
 * Generate timestamp in milliseconds
 * @param customTimestamp Optional custom timestamp for testing
 * @returns Current timestamp in milliseconds
 */
export function generateTimestamp(customTimestamp?: number): number {
  return customTimestamp ?? Date.now();
}

/**
 * Sort parameters by key name (ASCII order)
 * @param params Parameters to sort
 * @returns Sorted keys array
 */
export function sortParams(params: Record<string, unknown>): string[] {
  return Object.keys(params).filter(
    (key) => params[key] !== null && params[key] !== undefined
  ).sort();
}

/**
 * Create signature with just appId, appSecret, and optional business params
 * Convenience function that auto-generates timestamp
 *
 * @param appId PolyV App ID
 * @param appSecret PolyV App Secret
 * @param params Optional business parameters
 * @param method Signature method (default: MD5)
 * @returns Signature output
 */
export function createSignature(
  appId: string,
  appSecret: string,
  params?: Record<string, unknown>,
  method?: SignatureMethod
): SignatureOutput {
  const timestamp = Date.now();

  return generateSignature(
    {
      appId,
      timestamp,
      ...params,
    },
    {
      appSecret,
      method: method || SignatureMethod.MD5,
    }
  );
}
