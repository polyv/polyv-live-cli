/**
 * Player Types
 *
 * Type definitions for PlayerService APIs (Anti-record, Marquee, Advert, Logo, Watch Feedback).
 *
 * @module types/player
 */

// ============================================
// Anti-Record Settings Types
// ============================================

/**
 * Anti-record type
 */
export type AntiRecordType = 'marquee' | 'watermark';

/**
 * Anti-record model type
 */
export type AntiRecordModelType = 'fixed' | 'nickname' | 'diyurl';

/**
 * Anti-record show mode
 */
export type AntiRecordShowMode = 'roll' | 'flicker';

/**
 * Font size for watermark type (string values)
 */
export type WatermarkFontSize = 'small' | 'middle' | 'large';

/**
 * Parameters for setAntiRecordSettings
 */
export interface AntiRecordSettingsParams {
  /** Anti-record type: "marquee" or "watermark" */
  antiRecordType: AntiRecordType;
  /** Model type: "fixed", "nickname", or "diyurl" */
  modelType: AntiRecordModelType;
  /** Content text or DIY URL */
  content: string;
  /** Font size: number (1-256) for marquee, "small"|"middle"|"large" for watermark */
  fontSize: number | WatermarkFontSize;
  /** Opacity (0-100), default 80 */
  opacity?: number;
  /** Font color (hex format) */
  fontColor?: string;
  /** Show mode: "roll" or "flicker" */
  showMode?: AntiRecordShowMode;
  /** Double enabled: "Y" or "N" */
  doubleEnabled?: 'Y' | 'N';
  /** Auto zoom enabled: "Y" or "N" */
  autoZoomEnabled?: 'Y' | 'N';
}

/**
 * Anti-record settings response
 */
export interface AntiRecordSettingsResponse {
  /** Anti-record type */
  antiRecordType: AntiRecordType;
  /** Model type */
  modelType: AntiRecordModelType;
  /** Content text or DIY URL */
  content: string;
  /** Opacity */
  opacity: number;
  /** Font size */
  fontSize: number | WatermarkFontSize;
  /** Font color */
  fontColor?: string;
  /** Auto zoom enabled */
  autoZoomEnabled?: 'Y' | 'N';
  /** Double enabled */
  doubleEnabled?: 'Y' | 'N';
  /** Show mode */
  showMode?: AntiRecordShowMode;
}

// ============================================
// Marquee URL Types
// ============================================

/**
 * Parameters for setMarqueeUrl
 */
export interface MarqueeUrlParams {
  /** Marquee restrict: "Y" to enable, "N" to disable */
  marqueeRestrict: 'Y' | 'N';
  /** Marquee URL (required when marqueeRestrict is "Y") */
  url?: string;
}

// ============================================
// Head Advert Types
// ============================================

/**
 * Head advert type
 */
export type HeadAdvertType = 'NONE' | 'IMAGE' | 'FLV';

/**
 * Parameters for updateHeadAdvert
 */
export interface HeadAdvertParams {
  /** Head advert type: "NONE", "IMAGE", or "FLV" */
  headAdvertType: HeadAdvertType;
  /** Head advert media URL (广告地址, for IMAGE/FLV type) */
  headAdvertMediaUrl?: string;
  /** Head advert href (click URL) */
  headAdvertHref?: string;
  /** Head advert duration in seconds */
  headAdvertDuration?: number;
  /** Head advert width */
  headAdvertWidth?: number;
  /** Head advert height */
  headAdvertHeight?: number;
  /** Enabled: "Y" or "N" */
  enabled?: 'Y' | 'N';
}

// ============================================
// Stop Advert Types
// ============================================

/**
 * Parameters for updateStopAdvert
 */
export interface StopAdvertParams {
  /** Enabled: "Y" or "N" */
  enabled?: 'Y' | 'N';
  /** Stop advert image URL */
  stopAdvertImage?: string;
  /** Stop advert href (click URL) */
  stopAdvertHref?: string;
}

// ============================================
// Logo Types
// ============================================

/**
 * Logo position
 */
export type LogoPosition = 'tl' | 'tr' | 'bl' | 'br';

/**
 * Parameters for updateLogo
 */
export interface LogoParams {
  /** Logo image URL (required) */
  logoImage: string;
  /** Logo opacity (0, 1] - exclusive of 0, inclusive of 1 */
  logoOpacity?: number;
  /** Logo position: "tl" (top-left), "tr" (top-right), "bl" (bottom-left), "br" (bottom-right) */
  logoPosition?: LogoPosition;
  /** Logo href (click URL) */
  logoHref?: string;
}

// ============================================
// Watch Feedback Types
// ============================================

/**
 * Watch feedback item
 */
export interface WatchFeedbackItem {
  /** Feedback ID */
  feedbackId: number;
  /** Channel ID */
  channelId: number;
  /** Session ID */
  sessionId: string;
  /** User ID */
  userId: string;
  /** Feedback type */
  feedbackType: string;
  /** Feedback content */
  content: string;
  /** Create time */
  createTime: string;
}

/**
 * Parameters for getWatchFeedbackList
 */
export interface WatchFeedbackListParams {
  /** Channel ID (optional, returns all channels if not provided) */
  channelId?: number;
  /** Page number (>= 1) */
  pageNumber?: number;
  /** Page size (1-1000) */
  pageSize?: number;
}

/**
 * Watch feedback list response
 */
export interface WatchFeedbackListResponse {
  /** List of feedback items */
  contents: WatchFeedbackItem[];
  /** Current page number */
  pageNumber: number;
  /** Page size */
  pageSize: number;
  /** Total pages */
  totalPages: number;
  /** Total items */
  totalItems: number;
}

// ============================================
// Channel Decorate Types (Story 10.5)
// ============================================

/**
 * Channel decorate player configuration
 */
export interface ChannelDecoratePlayer {
  /** Watermark enabled: Y or N */
  watermarkEnabled: 'Y' | 'N';
  /** Watermark image URL */
  iconUrl: string;
  /** Watermark position: tl (top-left), tr (top-right), bl (bottom-left), br (bottom-right) */
  iconPosition: LogoPosition;
  /** Watermark opacity (0-1) */
  logoOpacity: number;
  /** Watermark link URL */
  iconLink: string;
  /** Warmup enabled: Y or N */
  warmUpEnabled: 'Y' | 'N';
  /** Warmup image URL */
  warmUpImageUrl: string;
  /** Cover jump URL */
  coverJumpUrl: string;
  /** Background image URL */
  backgroundUrl: string;
  /** Base page views */
  basePV: number;
  /** Actual page views */
  actualPV: number;
}

/**
 * Channel decorate chat configuration
 */
export interface ChannelDecorateChat {
  /** Chat enabled: Y or N */
  chatEnabled: 'Y' | 'N';
  /** Chat admin type */
  chatAdminType: string;
}

/**
 * Channel decorate description page configuration
 */
export interface ChannelDecorateDesc {
  /** Description enabled: Y or N */
  descEnabled: 'Y' | 'N';
  /** Description content */
  descContent: string;
}

/**
 * Channel decorate splash configuration
 */
export interface ChannelDecorateSplash {
  /** Splash enabled: Y or N */
  splashEnabled: 'Y' | 'N';
  /** Splash image URL */
  splashImage: string;
}

/**
 * Channel decorate menu configuration
 */
export interface ChannelDecorateMenu {
  /** Menu enabled: Y or N */
  menuEnabled: 'Y' | 'N';
}

/**
 * Channel decorate get response
 */
export interface ChannelDecorateGetResponse {
  /** Player configuration */
  player: ChannelDecoratePlayer;
  /** Chat configuration (optional) */
  chat?: ChannelDecorateChat;
  /** Description page configuration (optional) */
  desc?: ChannelDecorateDesc;
  /** Splash configuration (optional) */
  splash?: ChannelDecorateSplash;
  /** Menu configuration (optional) */
  menu?: ChannelDecorateMenu;
}

/**
 * Channel decorate update parameters
 */
export interface ChannelDecorateUpdateParams {
  /** Watermark enabled: Y or N */
  watermarkEnabled?: 'Y' | 'N';
  /** Watermark image URL */
  iconUrl?: string;
  /** Watermark position */
  iconPosition?: LogoPosition;
  /** Watermark opacity (0-1) */
  logoOpacity?: number;
  /** Watermark link URL */
  iconLink?: string;
  /** Warmup enabled: Y or N */
  warmUpEnabled?: 'Y' | 'N';
  /** Warmup image URL */
  warmUpImageUrl?: string;
  /** Cover jump URL */
  coverJumpUrl?: string;
  /** Background image URL */
  backgroundUrl?: string;
  /** Base page views */
  basePV?: number;
  /** Actual page views */
  actualPV?: number;
}
