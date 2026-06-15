/**
 * Callback Types
 *
 * TypeScript type definitions for PolyV callback/webhook payloads.
 * Callbacks are webhooks that PolyV sends to user-configured URLs.
 * The SDK provides types only (no API methods) for handling these callbacks.
 *
 * @module types/callback
 */

// ============================================
// Common Callback Types
// ============================================

/**
 * Callback origin type
 * Describes how the recording was generated
 */
export type CallbackOriginType =
  | 'manual'     // Manual recording
  | 'auto'       // Automatic recording
  | 'merge'      // Merged recording
  | 'clip'       // Clipped recording
  | 'remake'     // Remade recording
  | 'smart-clip' // AI smart clip
  | 'transcode'; // Transcoded playback

/**
 * Base callback payload with common fields
 */
export interface BaseCallbackPayload {
  /** Channel ID */
  channelId: string;
  /** Callback timestamp (13-bit) */
  timestamp: number;
  /** Signature for verification */
  sign: string;
}

// ============================================
// Recording Callback Types
// ============================================

/**
 * Record callback payload
 * Sent when a recording is generated
 */
export interface RecordCallbackPayload extends BaseCallbackPayload {
  /** Recording file URL */
  fileUrl: string;
  /** File format (e.g., 'mp4', 'flv') */
  format: string;
  /** File ID */
  fileId: string;
  /** Recording origin type */
  origin: CallbackOriginType;
  /** Whether has RTC recording */
  hasRtcRecord: string;
  /** Session ID */
  sessionId: string;
  /** File size (bytes) */
  fileSize?: number;
  /** Recording duration (seconds) */
  duration?: number;
  /** Stream name */
  streamName?: string;
}

// ============================================
// Playback Callback Types
// ============================================

/**
 * Playback callback payload
 * Sent when a live stream is converted to playback
 */
export interface PlaybackCallbackPayload extends BaseCallbackPayload {
  /** Video ID */
  vid: string;
  /** Video title */
  title: string;
  /** Video duration (seconds) */
  duration: number;
  /** File size (bytes) */
  fileSize: number;
  /** File URL */
  fileUrl: string;
  /** First image URL */
  firstImageUrl?: string;
  /** Session ID */
  sessionId: string;
  /** Origin type */
  origin?: CallbackOriginType;
  /** Video description */
  description?: string;
  /** Tag */
  tag?: string;
}

// ============================================
// Live Status Callback Types
// ============================================

/**
 * Live status type
 */
export type LiveStatusType =
  | 'liveStart'    // Stream started
  | 'liveEnd'      // Stream ended
  | 'streamStart'  // Push stream started
  | 'streamEnd';   // Push stream ended

/**
 * Live status callback payload
 * Sent when live status changes
 */
export interface LiveStatusCallbackPayload extends BaseCallbackPayload {
  /** Status type */
  status: LiveStatusType;
  /** Session ID */
  sessionId: string;
  /** Stream name */
  stream?: string;
  /** Stream URL */
  streamUrl?: string;
  /** Timestamp of status change */
  eventTime?: number;
}

// ============================================
// Member Status Callback Types
// ============================================

/**
 * Member status type
 */
export type MemberStatusType =
  | 'login'   // Member logged in
  | 'logout'; // Member logged out

/**
 * Member status callback payload
 * Sent when member status changes
 */
export interface MemberStatusCallbackPayload extends BaseCallbackPayload {
  /** Status type */
  status: MemberStatusType;
  /** User ID */
  userId: string;
  /** User nickname */
  nickname?: string;
  /** User avatar */
  avatar?: string;
  /** Session ID */
  sessionId?: string;
  /** Viewer ID */
  viewerId?: string;
}

// ============================================
// Interaction Callback Types
// ============================================

/**
 * Interaction type
 */
export type InteractionType =
  | 'lottery'       // Lottery draw
  | 'questionnaire' // Questionnaire
  | 'checkin'       // Check-in
  | 'question'      // Q&A
  | 'vote'          // Vote
  | 'donate';       // Donate

/**
 * Interaction callback payload
 * Sent when interaction events occur
 */
export interface InteractionCallbackPayload extends BaseCallbackPayload {
  /** Interaction type */
  type: InteractionType;
  /** Interaction ID */
  interactionId: string;
  /** User ID who triggered the interaction */
  userId?: string;
  /** User nickname */
  nickname?: string;
  /** Interaction data (varies by type) */
  data?: Record<string, unknown>;
  /** Session ID */
  sessionId?: string;
}

// ============================================
// Statistics Callback Types
// ============================================

/**
 * Statistics callback payload
 * Sent for various statistics events
 */
export interface StatisticsCallbackPayload extends BaseCallbackPayload {
  /** Event type */
  eventType: string;
  /** Session ID */
  sessionId?: string;
  /** Statistics data */
  data?: Record<string, unknown>;
}

// ============================================
// Callback Union Types
// ============================================

/**
 * All callback payload types
 */
export type CallbackPayload =
  | RecordCallbackPayload
  | PlaybackCallbackPayload
  | LiveStatusCallbackPayload
  | MemberStatusCallbackPayload
  | InteractionCallbackPayload
  | StatisticsCallbackPayload;
