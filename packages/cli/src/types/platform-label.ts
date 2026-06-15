/**
 * @fileoverview Platform label types for CLI commands
 * @author Development Team
 * @since 13.4.0
 */

/**
 * Output format options for platform label commands
 */
export type OutputFormat = 'table' | 'json';

/**
 * Viewer label interface
 */
export interface ViewerLabel {
  /** Label ID */
  labelId: number;
  /** Label name */
  labelName: string;
  /** Created time (optional) */
  createdTime?: string;
  /** Updated time (optional) */
  updatedTime?: string;
}

/**
 * Options for platform label list command
 */
export interface PlatformLabelListOptions {
  /** Output format (table or json) */
  output?: OutputFormat;
}

/**
 * Options for platform label create command
 */
export interface PlatformLabelCreateOptions {
  /** Label name */
  labelName: string;
  /** Output format (table or json) */
  output?: OutputFormat;
}

/**
 * Options for platform label update command
 */
export interface PlatformLabelUpdateOptions {
  /** Label ID */
  labelId: number;
  /** Label name */
  labelName: string;
  /** Output format (table or json) */
  output?: OutputFormat;
}

/**
 * Options for platform label delete command
 */
export interface PlatformLabelDeleteOptions {
  /** Label ID */
  labelId: number;
  /** Output format (table or json) */
  output?: OutputFormat;
}

/**
 * Service configuration for platform label handler
 */
export interface PlatformLabelServiceConfig {
  /** Base URL for PolyV API */
  baseUrl: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Debug mode flag */
  debug?: boolean;
}
