/**
 * API Version Types
 *
 * Types for API versioning.
 */

/**
 * API Version
 */
export type ApiVersion = 'v3' | 'v4';

/**
 * Version Configuration
 */
export interface VersionConfig {
  /** API version */
  version: ApiVersion;
  /** Base URL for this version */
  baseUrl: string;
  /** Default timeout for this version */
  timeout?: number;
}
