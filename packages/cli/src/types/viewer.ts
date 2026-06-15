/**
 * @fileoverview Type definitions for viewer CLI commands
 * @author Development Team
 * @since 12.1.0
 */

/**
 * Viewer source type
 */
export type ViewerSource = 'IMPORT' | 'WX' | 'MOBILE';

/**
 * Viewer service configuration
 */
export interface ViewerServiceConfig {
  /** API base URL */
  baseUrl?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Enable debug mode */
  debug?: boolean;
}

/**
 * Options for viewer get command
 */
export interface ViewerGetOptions {
  /** Viewer unique ID (required) */
  viewerId: string;
  /** Output format: table or json */
  output?: 'table' | 'json';
}

/**
 * Options for viewer list command
 */
export interface ViewerListOptions {
  /** Filter by source type */
  source?: ViewerSource;
  /** Filter by mobile number */
  mobile?: string;
  /** Filter by email */
  email?: string;
  /** Filter by area */
  area?: string;
  /** Page number (default: 1) */
  page?: number;
  /** Page size (default: 10, max: 1000) */
  size?: number;
  /** Output format: table or json */
  output?: 'table' | 'json';
}

// ========================================
// Story 12-2: Viewer Tag Types
// ========================================

/**
 * Options for viewer tag add command
 */
export interface ViewerTagAddOptions {
  /** Comma-separated viewer IDs (required) */
  viewerIds: string;
  /** Comma-separated label IDs (required) */
  labelIds: string;
  /** Output format: table or json */
  output?: 'table' | 'json';
}

/**
 * Options for viewer tag remove command
 */
export interface ViewerTagRemoveOptions {
  /** Comma-separated viewer IDs (required) */
  viewerIds: string;
  /** Comma-separated label IDs (required) */
  labelIds: string;
  /** Output format: table or json */
  output?: 'table' | 'json';
}

/**
 * Options for viewer tag list command
 */
export interface ViewerTagListOptions {
  /** Keyword search for tag name */
  keyword?: string;
  /** Page number (default: 1) */
  page?: number;
  /** Page size (default: 10, max: 1000) */
  size?: number;
  /** Output format: table or json */
  output?: 'table' | 'json';
}
