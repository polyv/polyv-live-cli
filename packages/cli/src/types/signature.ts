/**
 * Signature-related TypeScript type definitions for PolyV CLI
 */

/**
 * Parameters used for signature generation
 */
export interface SignatureParams {
  /** Application ID */
  appId: string;
  /** Timestamp in milliseconds (auto-generated if not provided) */
  timestamp?: number;
  /** Optional user ID */
  userId?: string;
  /** Additional parameters for API requests */
  [key: string]: string | number | boolean | undefined;
}

/**
 * Options for signature generation
 */
export interface SignatureOptions {
  /** Application secret for signature generation */
  appSecret: string;
  /** Enable debug mode to log intermediate steps */
  debug?: boolean;
  /** Custom timestamp for testing purposes */
  customTimestamp?: number;
}

/**
 * Result of signature generation
 */
export interface SignatureResult {
  /** Generated MD5 signature (uppercase) */
  signature: string;
  /** Timestamp used in signature generation */
  timestamp: number;
  /** Sorted and filtered parameters used */
  sortedParams: Record<string, string | number | boolean>;
  /** Raw string before MD5 hashing (for debug) */
  rawString?: string;
}

/**
 * Internal parameter processing result
 */
export interface ProcessedParams {
  /** Filtered and sorted parameters */
  params: Record<string, string | number | boolean>;
  /** Concatenated parameter string */
  paramString: string;
}