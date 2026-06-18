/**
 * V4 Robot Types
 *
 * Type definitions for V4 Robot APIs.
 *
 * @module types/v4-robot
 */

// ============================================
// Global Robot Types
// ============================================

/**
 * Robot entity
 */
export interface Robot {
  /** Robot ID */
  id: number;
  /** Robot name (max 20 chars, no emoji) */
  name: string;
  /** Avatar URL */
  avatar: string;
  /** Last modified timestamp (milliseconds) */
  lastModified: number;
}

/**
 * Parameters for listing robots
 */
export interface ListRobotsParams {
  /** Page number (optional, default 1) */
  pageNumber?: number;
  /** Page size (optional, default 10) */
  pageSize?: number;
}

/**
 * Response for listing robots
 */
export interface ListRobotsResponse {
  /** Current page number */
  pageNumber: number;
  /** Page size */
  pageSize: number;
  /** Total pages */
  totalPages: number;
  /** Total items */
  totalItems: number;
  /** Robot list */
  contents: Robot[];
}

/**
 * Item for batch saving robots
 */
export interface SaveRobotItem {
  /** Robot name (max 20 chars, no emoji) */
  name: string;
  /** Avatar URL (optional) */
  avatar?: string;
}

/**
 * Parameters for batch saving robots
 */
export interface BatchSaveRobotsParams {
  /** Robot list (max 200) */
  robots: SaveRobotItem[];
}

/**
 * Response for batch saving robots
 */
export interface BatchSaveRobotsResponse {
  /** Whether successful */
  success: boolean;
  /** Number of saved robots */
  savedCount: number;
}

/**
 * Parameters for batch deleting robots
 */
export interface BatchDeleteRobotsParams {
  /** Robot IDs to delete (max 200) */
  ids: number[];
}

// ============================================
// Channel Robot Types
// ============================================

/**
 * Add robot model type
 */
export type AddRobotModel = 'timely' | 'fixed_time';

/**
 * Channel robot setting entity
 */
export interface RobotSetting {
  /** Channel ID */
  channelId: number;
  /** Number of robots */
  robotNumber: number;
  /** Add robot model */
  addRobotModel: AddRobotModel;
  /** Virtual booking number */
  virtualBookingNumber: number;
  /** Change time in seconds (for fixed_time model) */
  changeTime: number;
  /** Left time in seconds */
  leftTime: number;
}

/**
 * Parameters for getting channel robot settings
 */
export interface GetRobotSettingParams {
  /** Channel ID */
  channelId: string;
}

/**
 * Parameters for updating channel robot settings
 */
export interface UpdateRobotSettingParams {
  /** Channel ID */
  channelId: string;
  /** Number of robots */
  robotNumber: number;
  /** Add robot model */
  addRobotModel: AddRobotModel;
  /** Change time in seconds (required when addRobotModel='fixed_time', range: 20-18000) */
  changeTime?: number;
  /** Virtual booking number (optional) */
  virtualBookingNumber?: number;
}

/**
 * Channel custom robot item
 */
export interface ChannelRobotItem {
  /** Robot nickname */
  name: string;
  /** Robot avatar URL */
  avatar: string;
}

/**
 * Parameters for updating channel robot count and custom robot list
 */
export interface UpdateRobotListSettingParams {
  /** Channel ID */
  channelId: string | number;
  /** Displayed robot count, max 600000 */
  robotNumber: number;
  /** Virtual booking number */
  virtualBookingNumber?: number;
  /** Add robot model */
  addRobotModel: AddRobotModel;
  /** Effective time in seconds when addRobotModel is fixed_time */
  changeTime?: number;
  /** Custom robot list */
  robotList?: ChannelRobotItem[];
  /** Whether to use random content-library robots */
  robotRandomMemberEnabled?: 'Y' | 'N';
}

/**
 * Channel robot stats entity
 */
export interface RobotStats {
  /** Real viewer count */
  realViewerCount: number;
  /** Robot count */
  robotCount: number;
  /** Display count */
  displayCount: number;
  /** Real subscribe count */
  realSubscribeCount: number;
  /** Page views */
  pv: number;
}

/**
 * Parameters for getting channel robot stats
 */
export interface GetRobotStatsParams {
  /** Channel ID */
  channelId: string;
}

/**
 * Parameters for pausing channel robots
 */
export interface PauseRobotParams {
  /** Channel ID */
  channelId: string;
}
