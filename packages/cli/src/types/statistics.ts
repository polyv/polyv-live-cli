/**
 * @fileoverview Statistics types for CLI commands
 * @author Development Team
 * @since 10.1.0
 */

/**
 * Options for statistics view command from CLI
 */
export interface StatisticsViewOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Start date (yyyy-MM-dd format, required) */
  startDay: string;
  /** End date (yyyy-MM-dd format, required) */
  endDay: string;
  /** Output format (table or json) */
  output?: 'table' | 'json';
}

/**
 * Statistics service configuration
 */
export interface StatisticsServiceConfig {
  /** Base URL for API */
  baseUrl: string;
  /** Request timeout in milliseconds */
  timeout: number;
  /** Enable debug mode */
  debug: boolean;
}

/**
 * Daily view statistics item
 */
export interface DailyViewStatisticsItem {
  /** Query date (yyyy-MM-dd) */
  currentDay: string;
  /** Channel ID */
  channelId: string;
  /** User ID */
  userId: string;
  /** PC play duration in minutes */
  pcPlayDuration: number;
  /** PC page views */
  pcVideoView: number;
  /** PC unique viewers */
  pcUniqueViewer: number;
  /** Mobile play duration in minutes */
  mobilePlayDuration: number;
  /** Mobile page views */
  mobileVideoView: number;
  /** Mobile unique viewers */
  mobileUniqueViewer: number;
  /** Created timestamp */
  createdTime: number;
  /** Last modified timestamp */
  lastModified: number;
}

// ============================================
// Story 10.2: Concurrency Data Types
// ============================================

/**
 * Options for statistics concurrency command from CLI
 */
export interface StatisticsConcurrencyOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Start date (yyyy-MM-dd format, required) */
  startDate: string;
  /** End date (yyyy-MM-dd format, required) */
  endDate: string;
  /** Output format (table or json) */
  output?: 'table' | 'json';
}

/**
 * Options for statistics max-concurrent command from CLI
 */
export interface StatisticsMaxConcurrentOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Start time (13-digit millisecond timestamp, required) */
  startTime: number;
  /** End time (13-digit millisecond timestamp, required) */
  endTime: number;
  /** Output format (table or json) */
  output?: 'table' | 'json';
}

/**
 * Concurrency data point item for CLI display
 */
export interface ConcurrencyDataPointItem {
  /** Concurrency date (yyyy-MM-dd) */
  day: string;
  /** Concurrency time point (HH:mm) */
  minute: string;
  /** Concurrent viewers count */
  viewers: number;
}

// ============================================
// Story 10.3: Audience Distribution Types
// ============================================

/**
 * Options for statistics audience region command from CLI
 */
export interface StatisticsAudienceRegionOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Start time (13-digit millisecond timestamp, required) */
  startTime: number;
  /** End time (13-digit millisecond timestamp, required) */
  endTime: number;
  /** Region type (country/province/city) */
  type?: 'country' | 'province' | 'city';
  /** Output format (table or json) */
  output?: 'table' | 'json';
}

/**
 * Options for statistics audience device command from CLI
 */
export interface StatisticsAudienceDeviceOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Start time (13-digit millisecond timestamp, required) */
  startTime: number;
  /** End time (13-digit millisecond timestamp, required) */
  endTime: number;
  /** Output format (table or json) */
  output?: 'table' | 'json';
}

/**
 * Region distribution display item for CLI
 */
export interface RegionDistributionDisplayItem {
  /** Region name (country/province/city) */
  region: string;
  /** Number of plays */
  plays: number;
  /** Number of viewers */
  viewers: number;
  /** Number of unique IPs */
  ips: number;
  /** Play duration in minutes */
  playDuration: number;
  /** Percentage string (e.g., "97.73%") */
  percent: string;
}

/**
 * Device distribution display item for CLI
 */
export interface DeviceDistributionDisplayItem {
  /** Browser/device name */
  name: string;
  /** Platform (pc/mobile) */
  platform: string;
  /** Number of plays */
  plays: number;
  /** Number of viewers */
  viewers: number;
  /** Number of unique IP addresses */
  ips: number;
  /** Play duration in minutes */
  playDuration: number;
  /** Percentage string (e.g., "69.18%") */
  percent: string;
}
