/**
 * @fileoverview SDK Client wrapper for PolyV Live API SDK
 * @author Development Team
 * @since 3.0.0
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { PolyVClient, PolyVClientConfig } from 'polyv-live-api-sdk';
import { AuthConfig } from '../types/auth';
import { getResolvedSource } from '../utils/source-context';

/**
 * Singleton SDK client instance
 */
let sdkClient: PolyVClient | null = null;

let cachedCliVersion: string | null = null;

function getCliVersion(): string {
  if (cachedCliVersion === null) {
    try {
      const pkg = JSON.parse(readFileSync(join(__dirname, '..', '..', 'package.json'), 'utf8'));
      cachedCliVersion = typeof pkg.version === 'string' ? pkg.version : '0.0.0';
    } catch {
      cachedCliVersion = '0.0.0';
    }
  }
  return cachedCliVersion ?? '0.0.0';
}

/**
 * Build the User-Agent carrying the per-invocation declared source, e.g.
 * `polyv-live-cli/1.6.0 (source=workbuddy)`. Server-side aggregation keys
 * off this header.
 */
export function buildUserAgent(): string {
  const resolved = getResolvedSource();
  const suffix = resolved ? ` (source=${resolved.source})` : '';
  return `polyv-live-cli/${getCliVersion()}${suffix}`;
}

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
    headers: { 'User-Agent': buildUserAgent() },
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
    headers: { 'User-Agent': buildUserAgent() },
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
