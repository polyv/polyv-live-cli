/**
 * Authentication Types
 *
 * Configuration types for PolyV API authentication.
 */

import type { SignatureMethod } from './signature.js';

/**
 * Authentication Configuration
 *
 * Required configuration for PolyV API authentication.
 */
export interface AuthConfig {
  /** PolyV App ID */
  appId: string;
  /** PolyV App Secret */
  appSecret: string;
  /** Custom base URL (optional) */
  baseUrl?: string;
}

/**
 * Signature Configuration
 *
 * Configuration for signature generation.
 */
export interface SignatureConfig {
  /** PolyV App Secret */
  appSecret: string;
  /** Signature method (default: MD5) */
  method?: SignatureMethod;
}
