/**
 * @fileoverview Player types for CLI commands
 * @author Development Team
 * @since 10.5.0
 */

/**
 * Player service configuration
 */
export interface PlayerServiceConfig {
  /** Base URL for API */
  baseUrl: string;
  /** Request timeout in milliseconds */
  timeout: number;
  /** Enable debug mode */
  debug: boolean;
}

/**
 * Options for player config get command from CLI
 */
export interface PlayerConfigGetOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Output format (table or json) */
  output?: 'table' | 'json';
}

/**
 * Options for player config update command from CLI
 */
export interface PlayerConfigUpdateOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Watermark enabled (Y/N) */
  watermarkEnabled?: 'Y' | 'N';
  /** Watermark image URL */
  watermarkUrl?: string;
  /** Watermark position (tl/tr/bl/br) */
  watermarkPosition?: 'tl' | 'tr' | 'bl' | 'br';
  /** Watermark opacity (0-1) */
  watermarkOpacity?: number;
  /** Warmup enabled (Y/N) */
  warmupEnabled?: 'Y' | 'N';
  /** Warmup image URL */
  warmupImageUrl?: string;
  /** Base page views */
  basePv?: number;
  /** Output format (table or json) */
  output?: 'table' | 'json';
}

/**
 * Player decorate display item for CLI output
 */
export interface PlayerDecorateDisplayItem {
  // Watermark settings
  /** Watermark enabled status */
  watermarkEnabled: string;
  /** Watermark image URL */
  watermarkUrl: string;
  /** Watermark position */
  watermarkPosition: string;
  /** Watermark opacity */
  watermarkOpacity: string;
  /** Watermark link URL */
  watermarkLink: string;
  // Warmup settings
  /** Warmup enabled status */
  warmupEnabled: string;
  /** Warmup image URL */
  warmupImageUrl: string;
  /** Cover jump URL */
  coverJumpUrl: string;
  /** Background image URL */
  backgroundImageUrl: string;
  // View data
  /** Base page views */
  basePv: number;
  /** Actual page views */
  actualPv: number;
}
