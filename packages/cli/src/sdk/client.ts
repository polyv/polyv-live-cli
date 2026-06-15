/**
 * @fileoverview SDK Client wrapper for PolyV Live API SDK
 * @author Development Team
 * @since 3.0.0
 */

import { PolyVClient, PolyVClientConfig } from 'polyv-live-api-sdk';
import { AuthConfig } from '../types/auth';

/**
 * Singleton SDK client instance
 */
let sdkClient: PolyVClient | null = null;

/**
 * Creates or returns the existing SDK client instance
 * @param authConfig Authentication configuration
 * @param baseUrl Optional base URL override
 * @returns PolyVClient instance
 */
export function getSdkClient(authConfig: AuthConfig, baseUrl?: string): PolyVClient {
  if (sdkClient) {
    return sdkClient;
  }

  const config: PolyVClientConfig = {
    appId: authConfig.appId,
    appSecret: authConfig.appSecret,
    baseUrl: baseUrl || 'https://api.polyv.net',
  };

  sdkClient = new PolyVClient(config);
  return sdkClient;
}

/**
 * Resets the SDK client (useful for testing or account switching)
 */
export function resetSdkClient(): void {
  sdkClient = null;
}

/**
 * Creates a new SDK client without caching (for multi-account scenarios)
 * @param authConfig Authentication configuration
 * @param baseUrl Optional base URL override
 * @returns New PolyVClient instance
 */
export function createSdkClient(authConfig: AuthConfig, baseUrl?: string): PolyVClient {
  const config: PolyVClientConfig = {
    appId: authConfig.appId,
    appSecret: authConfig.appSecret,
    baseUrl: baseUrl || 'https://api.polyv.net',
  };

  return new PolyVClient(config);
}

// Re-export SDK types and classes for convenience
export {
  PolyVClient,
  PolyVAPIError,
  PolyVError,
  PolyVValidationError,
} from 'polyv-live-api-sdk';

export type { PolyVClientConfig } from 'polyv-live-api-sdk';
