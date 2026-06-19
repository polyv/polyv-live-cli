/**
 * V4 AI Types
 *
 * Type definitions for V4 AI and Digital Human APIs.
 *
 * @module types/v4-ai
 */

// ============================================
// Digital Human Types
// ============================================

/**
 * Digital Human entity
 */
export interface DigitalHuman {
  /** Digital human ID */
  id: number;
  /** Digital human name */
  name: string;
  /** Third-party role code */
  thirdRoleCode: string;
  /** Cover photo URL */
  coverPhoto: string;
  /** Full body photo URL */
  fullBodyPhoto: string;
  /** Clothes description */
  clothesDesc: string;
  /** Default TTS voice ID */
  defaultTtsVoiceId: number;
  /** Creation timestamp (milliseconds) */
  createTime: number;
}

/**
 * Parameters for listing digital humans
 */
export interface ListDigitalHumansParams {
  /** Page number (>= 1) */
  pageNumber: number;
  /** Page size (1-1000) */
  pageSize: number;
}

/**
 * Response for listing digital humans
 */
export interface ListDigitalHumansResponse {
  /** Current page number */
  pageNumber: number;
  /** Page size */
  pageSize: number;
  /** Total pages */
  totalPages: number;
  /** Total items */
  totalItems: number;
  /** Digital human list */
  contents: DigitalHuman[];
}

/**
 * Digital human organization mapping
 */
export interface DigitalHumanOrganization {
  /** Digital human ID */
  aiDigitalHumanId: number;
  /** Organization IDs */
  organizationIds: number[];
  /** Whether to include child organizations */
  includeChildren: boolean;
}

/**
 * Parameters for listing digital human organizations
 */
export interface ListOrganizationsParams {
  /** Comma-separated digital human IDs */
  aiDigitalHumanIds: string;
}

/**
 * Item for setting digital human organizations
 */
export interface SetOrganizationsItem {
  /** Digital human ID */
  aiDigitalHumanId: number;
  /** Organization IDs */
  organizationIds: number[];
  /** Whether to include child organizations */
  includeChildren?: boolean;
}

/**
 * Parameters for setting digital human organizations
 */
export interface SetOrganizationsParams {
  /** Organization mapping items */
  items: SetOrganizationsItem[];
}

// ============================================
// Video Produce Types
// ============================================

/**
 * Video produce status enum
 */
export enum VideoProduceStatus {
  /** Draft */
  DRAFT = 5,
  /** Waiting for processing */
  WAITING = 10,
  /** Processing */
  PROCESSING = 15,
  /** Success */
  SUCCESS = 20,
  /** Failed */
  FAILED = 30,
  /** Expired */
  EXPIRED = 50,
}

/**
 * Video produce task entity
 */
export interface VideoProduceTask {
  /** Task ID */
  id: number;
  /** Video name */
  videoName: string;
  /** Type (1: no digital human, 3: with digital human) */
  type: number;
  /** Task status */
  status: VideoProduceStatus;
  /** Video path URL (null if not completed) */
  videoPath: string | null;
  /** Video thumbnail URL (null if not completed) */
  videoImage: string | null;
  /** Video file size in bytes (null if not completed) */
  videoFileSize: number | null;
  /** Duration in seconds (null if not completed) */
  duration: number | null;
  /** Digital human ID (null if no digital human) */
  digitalHumanId: number | null;
  /** Processing time in seconds (null if not completed) */
  dealTime: number | null;
  /** Creation timestamp (milliseconds) */
  createTime: number;
  /** Last modification timestamp (milliseconds) */
  modifyTime: number;
  /** Subtitle file path (null if no subtitle) */
  subtitlePath: string | null;
  /** Tags */
  tags: string[];
}

/**
 * Parameters for listing video produce tasks
 */
export interface ListVideoProducesParams {
  /** Page number (>= 1) */
  pageNumber: number;
  /** Page size (1-1000) */
  pageSize: number;
  /** Filter by video name (fuzzy match) */
  videoName?: string;
  /** Filter by status */
  status?: VideoProduceStatus;
  /** Filter by creation time start (milliseconds) */
  createTimeStart?: number;
  /** Filter by creation time end (milliseconds) */
  createTimeEnd?: number;
  /** Filter by tags */
  tags?: string[];
}

/**
 * Response for listing video produce tasks
 */
export interface ListVideoProducesResponse {
  /** Current page number */
  pageNumber: number;
  /** Page size */
  pageSize: number;
  /** Total pages */
  totalPages: number;
  /** Total items */
  totalItems: number;
  /** Video produce task list */
  contents: VideoProduceTask[];
}

/**
 * Parameters for getting a video produce task
 */
export interface GetVideoProduceParams {
  /** Task ID */
  id: number;
}

/**
 * TTS voice info for video creation
 */
export interface TtsVoiceInfo {
  /** TTS voice ID */
  ttsVoiceId: number;
  /** Speech rate (0.5 - 2.0) */
  rate: number;
}

/**
 * Subtitle info for video creation
 */
export interface SubtitleInfo {
  /** Whether to enable subtitle */
  enableSubtitle: boolean;
}

/**
 * Material info for video creation
 */
export interface MaterialInfo {
  /** Background image URL */
  backgroundImage: string;
  /** Remark/content text */
  remark?: string;
  /** Audio file URL */
  audioFileUrl?: string;
}

/**
 * Digital human position info for video creation
 */
export interface DigitalHumanInfo {
  /** Digital human ID (null for random) */
  digitalHumanId: number | null;
  /** X position */
  x: number | null;
  /** Y position */
  y: number | null;
  /** Width */
  w: number | null;
  /** Height */
  h: number | null;
}

/**
 * Item for batch creating video produce tasks
 */
export interface BatchCreateVideoProducesItem {
  /** Video name */
  videoName: string;
  /** Whether to include digital human */
  hasDigitalHuman: boolean;
  /** TTS voice info */
  ttsVoiceInfo: TtsVoiceInfo;
  /** Subtitle info */
  subtitleInfo: SubtitleInfo;
  /** PPT file ID */
  fileId?: string;
  /** Material info list */
  materialInfos?: MaterialInfo[];
  /** Digital human info list (required if hasDigitalHuman is true) */
  digitalHumanInfos?: DigitalHumanInfo[];
  /** Tags */
  tags?: string[];
}

/**
 * Parameters for batch creating video produce tasks
 */
export interface BatchCreateVideoProducesParams {
  /** Task list (max 20) */
  tasks: BatchCreateVideoProducesItem[];
}

/**
 * Response for batch creating video produce tasks
 */
export interface BatchCreateVideoProducesResponse {
  /** Whether successful */
  success: boolean;
  /** Number of created tasks */
  createdCount: number;
}

/**
 * Parameters for deleting a video produce task
 */
export interface DeleteVideoProduceParams {
  /** Task ID */
  id: number;
}

/**
 * PPT status enum
 */
export enum PptStatus {
  /** Normal */
  NORMAL = 'normal',
  /** Upload failed */
  FAIL_UPLOAD = 'failUpload',
  /** Waiting for conversion */
  WAIT_CONVERT = 'waitConvert',
  /** Conversion failed */
  FAIL_CONVERT = 'failConvert',
}

/**
 * Video produce PPT entity
 */
export interface VideoProducePpt {
  /** File ID */
  fileId: string;
  /** File name */
  fileName: string;
  /** File URL */
  fileUrl: string;
  /** Total pages (null if not converted) */
  totalPage: number | null;
  /** PPT status */
  status: PptStatus;
  /** Conversion type */
  convertType: 'common' | 'animate';
  /** Preview image URL */
  previewImage: string;
  /** Large preview image URL */
  previewBigImage: string;
  /** Creation timestamp (milliseconds) */
  createTime: number;
}

/**
 * Parameters for listing video produce PPTs
 */
export interface ListVideoProducePptsParams {
  /** Page number (>= 1) */
  pageNumber: number;
  /** Page size (1-1000) */
  pageSize: number;
}

/**
 * Response for listing video produce PPTs
 */
export interface ListVideoProducePptsResponse {
  /** Current page number */
  pageNumber: number;
  /** Page size */
  pageSize: number;
  /** Total pages */
  totalPages: number;
  /** Total items */
  totalItems: number;
  /** PPT list */
  contents: VideoProducePpt[];
}

/**
 * Parameters for getting a video produce PPT
 */
export interface GetVideoProducePptParams {
  /** File ID */
  fileId: string;
}

/**
 * PPT conversion type for video creation
 */
export type VideoProducePptConvertType = 'common' | 'animate';

/**
 * Parameters for asynchronously uploading a video produce PPT by URL
 */
export interface AsyncUploadVideoProducePptParams {
  /** PPT file URL (ppt/pptx, max 200MB) */
  url: string;
  /** Custom document name, defaults to file name in URL */
  docName?: string;
  /** Conversion type, defaults to common */
  type?: VideoProducePptConvertType;
  /** Callback URL for upload/convert status */
  callbackUrl?: string;
  /** Child account user ID for PPT isolation */
  childUserId?: string;
}

/**
 * Response for asynchronously uploading a video produce PPT
 */
export interface AsyncUploadVideoProducePptResponse {
  /** File ID */
  fileId: string;
}

/**
 * Parameters for uploading a video produce PPT
 */
export interface UploadVideoProducePptParams {
  /** PPT file URL */
  url: string;
  /** Document name (optional) */
  docName?: string;
}

/**
 * Response for uploading a video produce PPT
 */
export interface UploadVideoProducePptResponse {
  /** File ID */
  fileId: string;
  /** File name */
  fileName: string;
}

/**
 * TTS voice tag enum
 */
export enum TtsVoiceTag {
  /** Male voice */
  MALE_VOICE = 'MALE_VOICE',
  /** Female voice */
  FEMALE_VOICE = 'FEMALE_VOICE',
  /** Children voice */
  CHILDREN_VOICE = 'CHILDREN_VOICE',
  /** Custom voice */
  CUSTOM_VOICE = 'CUSTOM_VOICE',
  /** Others */
  OTHERS = 'OTHERS',
}

/**
 * Query parameters for listing TTS voices.
 *
 * Both fields are optional: the server applies its own defaults when they are
 * omitted, so callers that want every voice can call `listTtsVoices()` with no
 * arguments.
 */
export interface ListTtsVoicesParams {
  /** Page number, must be >= 1. */
  pageNumber?: number;
  /** Page size, must be between 1 and 1000. */
  pageSize?: number;
}

/**
 * TTS voice entity
 */
export interface TtsVoice {
  /** Voice ID */
  id: number;
  /** Voice name */
  voiceName: string;
  /** Demo audio URL */
  voiceDemoUrl: string;
  /** Voice tag */
  tag: TtsVoiceTag;
}
