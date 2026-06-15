/**
 * Client Types
 *
 * Configuration and types for the PolyV API client.
 */

import type { ApiVersion } from './version.ts';

/**
 * PolyV Client Configuration
 *
 * Configuration options for creating a PolyVClient instance.
 */
export interface PolyVClientConfig {
  /** PolyV App ID */
  appId: string;
  /** PolyV App Secret */
  appSecret: string;
  /** API Base URL (default: https://api.polyv.net/live/v3) */
  baseUrl?: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Custom headers to include in all requests */
  headers?: Record<string, string>;
  /** API version (default: v3) */
  version?: ApiVersion;
}

/**
 * Internal client configuration (resolved with defaults)
 */
export interface ResolvedClientConfig {
  /** PolyV App ID */
  appId: string;
  /** PolyV App Secret */
  appSecret: string;
  /** API Base URL with version */
  baseUrl: string;
  /** Request timeout in milliseconds */
  timeout: number;
  /** Custom headers */
  headers: Record<string, string>;
  /** API version */
  version: ApiVersion;
}
