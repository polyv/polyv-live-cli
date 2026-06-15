/**
 * Statistics Types
 *
 * Type definitions for V3 Statistics APIs (Daily View Statistics).
 *
 * @module types/statistics
 */

// ============================================
// Daily View Statistics Types
// ============================================

/**
 * Daily view statistics entity
 *
 * Represents a single day's viewing statistics for a channel.
 */
export interface DailyViewStatistics {
  /** Query date, format: yyyy-MM-dd */
  currentDay: string;
  /** Channel ID */
  channelId: string;
  /** POLYV user ID */
  userId: string;
  /** PC端播放时长，单位：分钟 */
  pcPlayDuration: number;
  /** PC端总播放量（PV） */
  pcVideoView: number;
  /** PC端唯一观众数（UV） */
  pcUniqueViewer: number;
  /** 移动端播放时长，单位：分钟 */
  mobilePlayDuration: number;
  /** 移动端总播放量（PV） */
  mobileVideoView: number;
  /** 移动端唯一观众数（UV） */
  mobileUniqueViewer: number;
  /** 记录添加时间（13位时间戳） */
  createdTime: number;
  /** 记录修改时间（13位时间戳） */
  lastModified: number;
}

/**
 * Parameters for getting daily view statistics
 *
 * @property channelId - 频道号（必需）
 * @property startDay - 开始日期，格式：yyyy-MM-dd（必需）
 * @property endDay - 结束日期，格式：yyyy-MM-dd（必需）
 */
export interface GetDailyViewStatisticsParams {
  /** 频道号（必需） */
  channelId: string;
  /** 开始日期，格式：yyyy-MM-dd（必需） */
  startDay: string;
  /** 结束日期，格式：yyyy-MM-dd（必需） */
  endDay: string;
}

/**
 * Response for getting daily view statistics
 *
 * Contains an array of daily statistics for the requested date range.
 */
export interface GetDailyViewStatisticsResponse {
  /** Array of daily view statistics */
  contents: DailyViewStatistics[];
}

// ============================================
// Concurrency Data Types (Story 10.2)
// ============================================

/**
 * Single concurrency data point
 *
 * Represents concurrent viewer count at a specific time.
 */
export interface ConcurrencyDataPoint {
  /** Concurrency date, format: yyyy-MM-dd */
  day: string;
  /** Concurrency time point, format: HH:mm */
  minute: string;
  /** Concurrent viewers count */
  viewers: number;
}

/**
 * Parameters for getting concurrency data
 *
 * @property channelId - 频道号（必需）
 * @property startDate - 开始日期，格式：yyyy-MM-dd（必需）
 * @property endDate - 结束日期，格式：yyyy-MM-dd（必需）
 */
export interface GetConcurrencyDataParams {
  /** 频道号（必需） */
  channelId: string;
  /** 开始日期，格式：yyyy-MM-dd（必需） */
  startDate: string;
  /** 结束日期，格式：yyyy-MM-dd（必需） */
  endDate: string;
}

/**
 * Response for getting concurrency data
 *
 * Contains an array of concurrency data points.
 */
export interface GetConcurrencyDataResponse {
  /** Array of concurrency data points */
  contents: ConcurrencyDataPoint[];
}

// ============================================
// Max Concurrent Types (Story 10.2)
// ============================================

/**
 * Parameters for getting max concurrent viewers
 *
 * @property channelId - 频道号（必需）
 * @property startTime - 开始时间，13位毫秒级时间戳（必需）
 * @property endTime - 结束时间，13位毫秒级时间戳（必需）
 */
export interface GetMaxConcurrentParams {
  /** 频道号（必需） */
  channelId: string;
  /** 开始时间，13位毫秒级时间戳（必需） */
  startTime: number;
  /** 结束时间，13位毫秒级时间戳（必需） */
  endTime: number;
}

/**
 * Response for getting max concurrent viewers
 *
 * Contains the maximum concurrent viewer count for the time range.
 */
export interface GetMaxConcurrentResponse {
  /** Maximum concurrent viewers count */
  contents: number;
}

// ============================================
// Region Distribution Types (Story 10.3)
// ============================================

/**
 * Region distribution item
 *
 * Represents viewing statistics for a specific region (country/province/city).
 */
export interface RegionDistributionItem {
  /** Number of unique IP addresses */
  ips: number;
  /** Total play duration in minutes */
  playDuration: number;
  /** Total number of plays */
  plays: number;
  /** Number of unique viewers */
  viewers: number;
  /** Country name (null if not applicable) */
  country: string | null;
  /** Province name (null if not applicable) */
  province: string | null;
  /** City name (null if not applicable) */
  city: string | null;
  /** Percentage of total (0-100) */
  percent: number;
}

/**
 * Parameters for getting region distribution
 *
 * @property channelId - 频道号（必需）
 * @property startTime - 开始时间，13位毫秒级时间戳（必需）
 * @property endTime - 结束时间，13位毫秒级时间戳（必需）
 * @property type - 区域类型：country/province/city（可选，默认 province）
 */
export interface GetRegionDistributionParams {
  /** 频道号（必需） */
  channelId: string;
  /** 开始时间，13位毫秒级时间戳（必需） */
  startTime: number;
  /** 结束时间，13位毫秒级时间戳（必需） */
  endTime: number;
  /** 区域类型：country/province/city（可选，默认 province） */
  type?: 'country' | 'province' | 'city';
}

/**
 * Response for getting region distribution
 *
 * Contains an array of region distribution items.
 */
export interface GetRegionDistributionResponse {
  /** Array of region distribution items */
  data: RegionDistributionItem[];
}

// ============================================
// Device Distribution Types (Story 10.3)
// ============================================

/**
 * Device distribution item
 *
 * Represents viewing statistics for a specific browser/device.
 */
export interface DeviceDistributionItem {
  /** Browser/device name */
  name: string;
  /** Platform type (pc/mobile) */
  platform: string;
  /** Total number of plays */
  plays: number;
  /** Number of unique viewers */
  viewers: number;
  /** Number of unique IP addresses */
  ips: number;
  /** Total play duration in minutes */
  playDuration: number;
  /** Percentage of total (0-100) */
  percent: number;
}

/**
 * Parameters for getting device distribution
 *
 * @property channelId - 频道号（必需）
 * @property startTime - 开始时间，13位毫秒级时间戳（必需）
 * @property endTime - 结束时间，13位毫秒级时间戳（必需）
 */
export interface GetDeviceDistributionParams {
  /** 频道号（必需） */
  channelId: string;
  /** 开始时间，13位毫秒级时间戳（必需） */
  startTime: number;
  /** 结束时间，13位毫秒级时间戳（必需） */
  endTime: number;
}

/**
 * Response for getting device distribution
 *
 * Contains an array of device distribution items.
 */
export interface GetDeviceDistributionResponse {
  /** Array of device distribution items */
  data: DeviceDistributionItem[];
}
