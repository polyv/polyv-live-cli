/**
 * Signature Types
 *
 * Types for PolyV API signature generation.
 */

/**
 * Signature Method Enum
 */
export enum SignatureMethod {
  MD5 = 'MD5',
  SHA256 = 'SHA256',
}

/**
 * Signature Input Parameters
 *
 * Parameters required for signature generation.
 */
export interface SignatureInput {
  /** PolyV App ID */
  appId: string;
  /** 13-digit millisecond timestamp */
  timestamp: number;
  /** Additional parameters to include in signature */
  params?: Record<string, unknown>;
}

/**
 * Signature Output Result
 */
export interface SignatureOutput {
  /** Generated signature (uppercase hex) */
  sign: string;
  /** Timestamp used for signature */
  timestamp: number;
  /** Signature method used */
  method: string;
}

/**
 * Signature Parameters (legacy alias)
 */
export type SignParams = SignatureInput;

/**
 * Signature Result (legacy alias)
 */
export type SignatureResult = {
  /** Generated signature (uppercase hex) */
  signature: string;
  /** Parameters used for signature */
  params: SignParams;
};
