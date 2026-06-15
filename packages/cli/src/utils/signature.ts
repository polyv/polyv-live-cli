/**
 * MD5 signature generation utilities for PolyV API authentication
 */

import { createHash } from 'crypto';
import { SignatureParams, SignatureOptions, SignatureResult, ProcessedParams } from '../types/signature';

/**
 * Generate millisecond-level timestamp
 * @param customTimestamp Optional custom timestamp for testing
 * @returns Current timestamp in milliseconds
 */
export function generateTimestamp(customTimestamp?: number): number {
  return customTimestamp ?? Date.now();
}

/**
 * Filter out null, undefined, and empty string values from parameters
 * @param params Input parameters
 * @returns Filtered parameters with valid values only
 */
export function filterParams(params: SignatureParams): Record<string, string | number | boolean> {
  const filtered: Record<string, string | number | boolean> = {};
  
  for (const [key, value] of Object.entries(params)) {
    // Skip null, undefined, and empty string values
    if (value !== null && value !== undefined && value !== '') {
      filtered[key] = value;
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
export function sortAndConcatenateParams(params: Record<string, string | number | boolean>): string {
  // Sort keys alphabetically
  const sortedKeys = Object.keys(params).sort();
  
  // Concatenate key-value pairs
  let result = '';
  for (const key of sortedKeys) {
    result += key + String(params[key]);
  }
  
  return result;
}

/**
 * Process parameters: filter and sort
 * @param params Input signature parameters
 * @returns Processed parameters and concatenated string
 */
export function processParams(params: SignatureParams): ProcessedParams {
  const filteredParams = filterParams(params);
  const paramString = sortAndConcatenateParams(filteredParams);
  
  return {
    params: filteredParams,
    paramString
  };
}

/**
 * Generate MD5 hash using appSecret sandwich method
 * Format: appSecret + paramString + appSecret
 * @param paramString Concatenated parameter string
 * @param appSecret Application secret
 * @returns Uppercase MD5 hash
 */
export function generateMD5Signature(paramString: string, appSecret: string): string {
  // Create signature source using appSecret sandwich method
  const signatureSource = appSecret + paramString + appSecret;
  
  // Generate MD5 hash and convert to uppercase
  const md5Hash = createHash('md5').update(signatureSource, 'utf8').digest('hex');
  
  return md5Hash.toUpperCase();
}

/**
 * Main signature generation function
 * @param params Signature parameters including appId, timestamp, etc.
 * @param options Signature options including appSecret and debug settings
 * @returns Complete signature result
 */
export function generateSignature(params: SignatureParams, options: SignatureOptions): SignatureResult {
  // Validate required parameters
  if (!params.appId) {
    throw new Error('appId is required for signature generation');
  }
  
  if (!options.appSecret) {
    throw new Error('appSecret is required for signature generation');
  }
  
  // Use custom timestamp, provided timestamp, or generate new one
  const timestamp = options.customTimestamp ?? params.timestamp ?? generateTimestamp();
  
  // Create parameters with timestamp
  const signatureParams: SignatureParams = {
    ...params,
    timestamp
  };
  
  // Process parameters
  const { params: sortedParams, paramString } = processParams(signatureParams);
  
  // Generate MD5 signature
  const signature = generateMD5Signature(paramString, options.appSecret);
  
  // Create result
  const result: SignatureResult = {
    signature,
    timestamp,
    sortedParams
  };
  
  // Add debug information if requested
  if (options.debug) {
    result.rawString = options.appSecret + paramString + options.appSecret;
  }
  
  // Log debug information if debug mode is enabled
  if (options.debug) {
    console.log('[Signature Debug] Sorted parameters:', sortedParams);
    console.log('[Signature Debug] Parameter string:', paramString);
    console.log('[Signature Debug] Raw signature string:', result.rawString);
    console.log('[Signature Debug] Final signature:', signature);
  }
  
  return result;
}

/**
 * Convenience function to generate signature with authentication config
 * @param params Signature parameters (timestamp will be auto-generated)
 * @param appSecret Application secret from auth config
 * @param debug Optional debug mode
 * @returns Generated signature result
 */
export function createSignature(
  params: SignatureParams,
  appSecret: string,
  debug = false
): SignatureResult {
  return generateSignature(params, { appSecret, debug });
}