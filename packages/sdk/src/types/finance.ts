/**
 * Finance Types
 *
 * TypeScript type definitions for Finance Service APIs (Audio/Video Moderation).
 *
 * @module types/finance
 */

// ============================================
// Common Types
// ============================================

/**
 * Y/N switch type for moderation settings
 */
export type YNEnabled = 'Y' | 'N';

/**
 * Audio moderation strategy (for audio)
 * easy: Loose moderation
 * normal: Standard moderation
 * strict: Strict moderation
 */
export type AudioModerationStrategy = 'easy' | 'normal' | 'strict';

/**
 * Video moderation strategy (for video)
 * Uses finance_ prefix
 */
export type VideoModerationStrategy = 'finance_easy' | 'finance_normal' | 'finance_serious';

/**
 * Image frequency for video moderation (in seconds)
 * 5: Premium (12 audits/minute)
 * 20: Enhanced (3 audits/minute)
 * 60: Standard (1 audit/minute)
 */
export type ImageFrequency = 5 | 20 | 60;

/**
 * Moderation result type
 * 1: Passed
 * 2: Violation
 * 3: Suspected
 */
export type ModerationResultType = 1 | 2 | 3;

/**
 * Label type for moderation results
 */
export type ModerationLabel =
  | 'Normal'
  | 'Porn'
  | 'Abuse'
  | 'Ad'
  | 'Custom'
  | 'Badword'
  | 'Illegal'
  | 'Polity'
  | 'Moan'
  | 'Terror'
  | 'Religion'
  | 'Sexy'
  | 'Teenager'
  | 'Copyright';

// ============================================
// Illegal Notify Types
// ============================================

/**
 * Illegal notification settings
 * Controls who gets notified when violations are detected
 */
export interface IllegalNotifySettings {
  /** Assistant notification: Y/N */
  assistantEnabled?: YNEnabled;
  /** Monitor notification: Y/N */
  monitorEnabled?: YNEnabled;
  /** Platform notification: Y/N */
  platformEnabled?: YNEnabled;
  /** Talent (host) notification: Y/N */
  talentEnabled?: YNEnabled;
}

// ============================================
// Audio Moderation Types
// ============================================

/**
 * Audio moderation settings response
 */
export interface AudioModerationSettings {
  /** POLYV user ID */
  userId?: string;
  /** Channel ID */
  channelId: number;
  /** Moderation switch: Y/N */
  moderationEnabled: YNEnabled;
  /** Moderation strategy */
  moderationStrategy: AudioModerationStrategy;
  /** Badword filter switch: Y/N */
  badwordEnabled?: YNEnabled;
  /** Illegal notification settings */
  illegalNotify: IllegalNotifySettings;
}

/**
 * List audio moderation records parameters
 */
export interface ListAudioModerationRecordsParams {
  /** Channel ID (required) */
  channelId: number | string;
  /** Page number (default 1) */
  pageNumber?: number;
  /** Page size (default 10, max 1000) */
  pageSize?: number;
  /** Start time (13-bit timestamp) */
  startTime?: number;
  /** End time (13-bit timestamp) */
  endTime?: number;
  /** Session ID */
  sessionId?: string;
  /** Moderation strategy filter (comma-separated: pass,block,review) */
  moderationStrategy?: string;
  /** Result type filter */
  resultType?: ModerationResultType;
}

/**
 * Audio moderation record item
 */
export interface AudioModerationRecordItem {
  /** Audit task ID */
  id: number | string;
  /** Session ID */
  sessionId?: string;
  /** Audio transcription text */
  audioText?: string;
  /** Audio slice URL */
  audioUrl?: string;
  /** Badword detected */
  badword?: string;
  /** Keyword detected */
  keyword?: string;
  /** Label type */
  label?: ModerationLabel;
  /** Label description */
  labelDesc?: string;
  /** Moderation strategy */
  moderationStrategy?: AudioModerationStrategy;
  /** Moderation strategy description */
  moderationStrategyDesc?: string;
  /** Result type: 1=pass, 2=violation, 3=suspected */
  resultType: ModerationResultType;
  /** Confidence score */
  score?: number;
  /** Audio duration */
  duration?: number;
  /** Create time */
  createTime?: string;
  /** Start time */
  startTime?: string;
}

/**
 * List audio moderation records response (paginated)
 */
export interface ListAudioModerationRecordsResponse {
  /** Record items */
  contents: AudioModerationRecordItem[];
  /** Current page number */
  pageNumber: number;
  /** Page size */
  pageSize: number;
  /** Total pages */
  totalPages: number;
  /** Total items */
  totalItems: number;
}

/**
 * Update audio moderation settings parameters
 */
export interface UpdateAudioModerationSettingsParams {
  /** Moderation switch: Y/N */
  moderationEnabled?: YNEnabled;
  /** Moderation strategy */
  moderationStrategy?: AudioModerationStrategy;
  /** Badword filter switch: Y/N */
  badwordEnabled?: YNEnabled;
  /** Illegal notification settings */
  illegalNotify?: IllegalNotifySettings;
}

// ============================================
// Video Moderation Types
// ============================================

/**
 * Video moderation settings response
 */
export interface VideoModerationSettings {
  /** Channel ID */
  channelId: number;
  /** Moderation switch: Y/N */
  moderationEnabled: YNEnabled;
  /** Moderation strategy (with finance_ prefix) */
  moderationStrategy: VideoModerationStrategy;
  /** Image frequency (seconds): 5, 20, or 60 */
  imageFrequency: ImageFrequency;
  /** Illegal notification settings */
  illegalNotify: IllegalNotifySettings;
}

/**
 * Update video moderation settings parameters
 */
export interface UpdateVideoModerationSettingsParams {
  /** Moderation switch: Y/N (required) */
  moderationEnabled: YNEnabled;
  /** Moderation strategy (required) */
  moderationStrategy: VideoModerationStrategy;
  /** Image frequency (required): 5, 20, or 60 */
  imageFrequency: ImageFrequency;
  /** Illegal notification settings (required) */
  illegalNotify: IllegalNotifySettings;
}

/**
 * List video moderation results parameters
 */
export interface ListVideoModerationResultsParams {
  /** Channel ID (required) */
  channelId: number | string;
  /** Page number (default 1) */
  pageNumber?: number;
  /** Page size (default 10, max 1000) */
  pageSize?: number;
  /** Session ID */
  sessionId?: string;
  /** Label filter (comma-separated) */
  label?: string;
  /** Result type filter (comma-separated: 1,2,3) */
  resultType?: string;
}

/**
 * Video moderation result item
 */
export interface VideoModerationResultItem {
  /** Record ID */
  id: number;
  /** User ID */
  userId?: string;
  /** Channel ID */
  channelId: number;
  /** Session ID */
  sessionId?: string;
  /** Task ID */
  taskId?: number;
  /** Image URL */
  imageUrl?: string;
  /** OCR text detected */
  ocrText?: string;
  /** OCR keyword */
  ocrKeyword?: string;
  /** Political figure name */
  politicalName?: string;
  /** Label type */
  label?: ModerationLabel;
  /** Label description */
  labelDesc?: string;
  /** Result type: 1=pass, 2=violation, 3=suspected */
  resultType: ModerationResultType;
  /** Result type description */
  resultTypeDesc?: string;
  /** Moderation strategy description */
  moderationStrategyDesc?: string;
  /** Create time (timestamp) */
  createTime?: number;
}

/**
 * List video moderation results response (paginated)
 */
export interface ListVideoModerationResultsResponse {
  /** Result items */
  contents: VideoModerationResultItem[];
  /** Current page number */
  pageNumber: number;
  /** Page size */
  pageSize: number;
  /** Total pages */
  totalPages: number;
  /** Total items */
  totalItems: number;
}
