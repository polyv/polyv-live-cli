/**
 * @fileoverview Document CLI type definitions
 * @author Development Team
 * @since 9.5.0
 */

/**
 * Document service configuration
 */
export interface DocumentServiceConfig {
  baseUrl: string;
  timeout: number;
  debug: boolean;
}

/**
 * Document list options from CLI
 */
export interface DocumentListOptions {
  /** Channel ID (required) */
  channelId: string;
  /** Document status filter */
  status?: 'normal' | 'waitUpload' | 'failUpload' | 'waitConvert' | 'failConvert';
  /** Page number (optional, default: 1) */
  page?: number;
  /** Page size (optional, default: 10) */
  pageSize?: number;
  /** Output format */
  output?: 'table' | 'json';
}

/**
 * Document upload options from CLI
 */
export interface DocumentUploadOptions {
  /** Channel ID (required) */
  channelId: string;
  /** File URL (required) */
  url: string;
  /** Convert type (common|animate) */
  type?: 'common' | 'animate';
  /** Document name */
  docName?: string;
  /** Callback URL */
  callbackUrl?: string;
  /** Output format */
  output?: 'table' | 'json';
}

/**
 * Document delete options from CLI
 */
export interface DocumentDeleteOptions {
  /** Channel ID (required) */
  channelId: string;
  /** File ID (required) */
  fileId: string;
  /** Document type (old|new) */
  type?: 'old' | 'new';
  /** Force flag to skip confirmation */
  force?: boolean;
  /** Output format */
  output?: 'table' | 'json';
}

/**
 * Document status options from CLI
 */
export interface DocumentStatusOptions {
  /** Channel ID (required) */
  channelId: string;
  /** File ID, comma-separated for multiple files (required) */
  fileId: string;
  /** Output format */
  output?: 'table' | 'json';
}

/**
 * Document display item for table and JSON output
 */
export interface DocumentDisplayItem {
  fileId: string;
  fileName: string;
  fileUrl?: string | undefined;
  fileType: string;
  totalPage: number;
  channelId?: string | undefined;
  status: string;
  createTime: number;
  convertType: string;
  type: string;
}

/**
 * Document upload result
 */
export interface DocumentUploadResult {
  fileId: string;
  status: string;
  type: string;
}

/**
 * Document status item
 */
export interface DocumentStatusItem {
  fileId: string;
  convertStatus: string;
  type: string;
  totalPage: number;
  imageCount: number;
  htmlUrl?: string;
}

/**
 * Runtime type placeholder for DocumentServiceConfig
 */
export const DocumentServiceConfig: {
  baseUrl: string;
  timeout: number;
  debug: boolean;
} = {} as any;

/**
 * Runtime type placeholder for DocumentListOptions
 */
export const DocumentListOptions: {
  channelId: string;
  status?: 'normal' | 'waitUpload' | 'failUpload' | 'waitConvert' | 'failConvert';
  page?: number;
  pageSize?: number;
  output?: 'table' | 'json';
} = {} as any;

/**
 * Runtime type placeholder for DocumentUploadOptions
 */
export const DocumentUploadOptions: {
  channelId: string;
  url: string;
  type?: 'common' | 'animate';
  docName?: string;
  callbackUrl?: string;
  output?: 'table' | 'json';
} = {} as any;

/**
 * Runtime type placeholder for DocumentDeleteOptions
 */
export const DocumentDeleteOptions: {
  channelId: string;
  fileId: string;
  type?: 'old' | 'new';
  force?: boolean;
  output?: 'table' | 'json';
} = {} as any;

/**
 * Runtime type placeholder for DocumentStatusOptions
 */
export const DocumentStatusOptions: {
  channelId: string;
  fileId: string;
  output?: 'table' | 'json';
} = {} as any;

/**
 * Runtime type placeholder for DocumentDisplayItem
 */
export const DocumentDisplayItem: {
  fileId: string;
  fileName: string;
  fileUrl?: string | undefined;
  fileType: string;
  totalPage: number;
  channelId?: string | undefined;
  status: string;
  createTime: number;
  convertType: string;
  type: string;
} = {} as any;

/**
 * Runtime type placeholder for DocumentUploadResult
 */
export const DocumentUploadResult: {
  fileId: string;
  status: string;
  type: string;
} = {} as any;

/**
 * Runtime type placeholder for DocumentStatusItem
 */
export const DocumentStatusItem: {
  fileId: string;
  convertStatus: string;
  type: string;
  totalPage: number;
  imageCount: number;
  htmlUrl?: string;
} = {} as any;
