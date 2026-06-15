/**
 * @fileoverview Platform types for CLI commands
 * @author Development Team
 * @since 13.1.0
 */

/**
 * Output format options for platform commands
 */
export type OutputFormat = 'table' | 'json';

/**
 * Options for platform get command
 */
export interface PlatformGetOptions {
  /** Output format (table or json) */
  output?: OutputFormat;
}

/**
 * Options for platform switch get command
 */
export interface PlatformSwitchGetOptions {
  /** Output format (table or json) */
  output?: OutputFormat;
}

/**
 * Valid enabled values for switch update
 */
export type EnabledValue = 'Y' | 'N';

/**
 * Options for platform switch update command
 */
export interface PlatformSwitchUpdateOptions {
  /** Configuration parameter name to update */
  param: string;
  /** Enable status (Y or N) */
  enabled: EnabledValue;
  /** Output format (table or json) */
  output?: OutputFormat;
}

/**
 * Service configuration for platform handler
 */
export interface PlatformServiceConfig {
  /** Base URL for PolyV API */
  baseUrl: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Debug mode flag */
  debug?: boolean;
}

/**
 * Valid switch parameter names
 */
export const VALID_SWITCH_PARAMS = [
  'globalSettingEnabled',
  'authEnabled',
  'recordEnabled',
  'playbackEnabled',
  'danmuEnabled',
] as const;

/**
 * Type for valid switch parameter names
 */
export type ValidSwitchParam = typeof VALID_SWITCH_PARAMS[number];

/**
 * Options for platform callback get command
 */
export interface PlatformCallbackGetOptions {
  /** Output format (table or json) */
  output?: OutputFormat;
}

/**
 * Options for platform callback update command
 */
export interface PlatformCallbackUpdateOptions {
  /** Callback URL */
  url?: string;
  /** Enable status (Y or N) */
  enabled?: EnabledValue;
  /** Output format (table or json) */
  output?: OutputFormat;
}

/**
 * Valid cover image type values
 */
export type ValidCoverImgType = 'contain' | 'cover';

/**
 * Options for platform setting get command
 */
export interface PlatformSettingGetOptions {
  /** Output format (table or json) */
  output?: OutputFormat;
}

/**
 * Options for platform setting update command
 */
export interface PlatformSettingUpdateOptions {
  /** Enable status for max concurrent viewers (Y or N) */
  channelConcurrencesEnabled?: EnabledValue;
  /** enable status for auto convert (Y or N) */
  timelyConvertEnabled?: EnabledValue;
  /** enable status for donation (Y or N) */
  donateEnabled?: EnabledValue;
  /** enable status for rebirth auto upload (Y or N) */
  rebirthAutoUploadEnabled?: EnabledValue;
  /** enable status for rebirth auto convert (Y or N) */
  rebirthAutoConvertEnabled?: EnabledValue;
  /** enable status for PPT full screen (Y or N) */
  pptCoveredEnabled?: EnabledValue;
  /** cover image type (contain or cover) */
  coverImgType?: ValidCoverImgType;
  /** enable status for test mode button (Y or N) */
  testModeButtonEnabled?: EnabledValue;
  /** output format (table or json) */
  output?: OutputFormat;
}
