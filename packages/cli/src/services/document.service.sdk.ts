/**
 * @fileoverview Document service using PolyV Live API SDK
 * @author Development Team
 * @since 9.5.0
 */

import {
  DocumentServiceConfig,
  DocumentListOptions,
  DocumentDisplayItem,
  DocumentUploadResult,
  DocumentStatusItem,
} from '../types/document';
import { AuthConfig } from '../types/auth';
import { PolyVValidationError } from '../utils/errors';
import { createSdkClient } from '../sdk';
import type { DocStatus, DocConvertType } from 'polyv-live-api-sdk';

/**
 * Valid document status values
 */
const VALID_STATUSES = ['normal', 'waitUpload', 'failUpload', 'waitConvert', 'failConvert'];

/**
 * Valid document convert types
 */
const VALID_CONVERT_TYPES = ['common', 'animate'];

/**
 * Valid document types (old/new)
 */
const VALID_DOC_TYPES = ['old', 'new'];

/**
 * Document service for managing PolyV live documents using SDK
 */
export class DocumentServiceSdk {
  private readonly config: DocumentServiceConfig;
  private readonly authConfig: AuthConfig;

  /**
   * Creates a new DocumentServiceSdk instance
   * @param authConfig Authentication configuration
   * @param serviceConfig Service configuration
   */
  constructor(authConfig: AuthConfig, serviceConfig: DocumentServiceConfig) {
    this.authConfig = authConfig;
    this.config = serviceConfig;
  }

  /**
   * Get document list for a channel
   * @param options Document list options from CLI
   * @returns Promise resolving to document list with pagination info
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async getDocumentList(options: DocumentListOptions): Promise<{
    contents: DocumentDisplayItem[];
    pageNumber: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  }> {
    // Validate parameters
    this.validateListOptions(options);

    // Create SDK client
    const client = createSdkClient(this.authConfig, this.config.baseUrl);

    // Build SDK params
    const params: {
      channelId: string;
      status?: DocStatus;
      page?: number;
      limit?: number;
      isShowUrl?: 'Y' | 'N';
    } = {
      channelId: options.channelId,
      isShowUrl: 'Y',
    };

    if (options.status !== undefined) {
      params.status = options.status as DocStatus;
    }
    if (options.page !== undefined) {
      params.page = options.page;
    }
    if (options.pageSize !== undefined) {
      params.limit = options.pageSize;
    }

    // Call SDK
    const result = await client.channel.getDocList(params);

    // Transform data for CLI display
    return {
      contents: (result.contents || []).map((item) => ({
        fileId: item.fileId,
        fileName: item.fileName,
        fileUrl: item.fileUrl,
        fileType: item.fileType,
        totalPage: item.totalPage,
        channelId: item.channelId,
        status: item.status,
        createTime: item.createTime,
        convertType: item.convertType,
        type: item.type,
      })),
      pageNumber: result.page || 1,
      pageSize: result.pageSize || result.limit || 10,
      totalItems: result.total || 0,
      totalPages: Math.ceil((result.total || 0) / (result.pageSize || result.limit || 10)),
    };
  }

  /**
   * Upload a document to a channel
   * @param channelId Channel ID
   * @param options Upload options
   * @returns Promise resolving to upload result
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async uploadDocument(
    channelId: string,
    options: {
      url: string;
      type?: 'common' | 'animate';
      docName?: string;
      callbackUrl?: string;
    }
  ): Promise<DocumentUploadResult> {
    // Validate parameters
    this.validateUploadParams(channelId, options);

    // Create SDK client
    const client = createSdkClient(this.authConfig, this.config.baseUrl);

    // Build params object
    // Note: SDK's UploadDocRequest.type is incorrectly typed as DocType (old/new)
    // but the actual API expects DocConvertType (common/animate)
    const params: {
      url: string;
      type?: DocConvertType;
      docName?: string;
      callbackUrl?: string;
    } = { url: options.url };

    if (options.type !== undefined) {
      params.type = options.type as DocConvertType;
    }
    if (options.docName !== undefined) {
      params.docName = options.docName;
    }
    if (options.callbackUrl !== undefined) {
      params.callbackUrl = options.callbackUrl;
    }

    // Call SDK
    const result = await client.channel.uploadDoc(channelId, params);

    return {
      fileId: result.fileId,
      status: result.status,
      type: result.type,
    };
  }

  /**
   * Delete a document from a channel
   * @param channelId Channel ID
   * @param fileId File ID to delete
   * @param type Document type (old/new)
   * @returns Promise resolving to true if deletion was successful
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async deleteDocument(
    channelId: string,
    fileId: string,
    type: 'old' | 'new'
  ): Promise<boolean> {
    // Validate parameters
    this.validateDeleteParams(channelId, fileId, type);

    // Create SDK client
    const client = createSdkClient(this.authConfig, this.config.baseUrl);

    // Call SDK - note: SDK method is deleteDocument not deleteDoc
    const result = await client.channel.deleteDocument(channelId, fileId, type);

    return result;
  }

  /**
   * Get document conversion status
   * @param channelId Channel ID
   * @param fileId File ID (can be comma-separated for multiple files)
   * @returns Promise resolving to array of status items
   *
   * @throws {PolyVValidationError} When parameters are invalid
   * @throws {PolyVError} When API call fails
   */
  async getDocumentStatus(channelId: string, fileId: string): Promise<DocumentStatusItem[]> {
    // Validate parameters
    this.validateStatusParams(channelId, fileId);

    // Create SDK client
    const client = createSdkClient(this.authConfig, this.config.baseUrl);

    // Call SDK
    const result = await client.channel.getDocConvertStatus(channelId, fileId);

    // Transform to DocumentStatusItem format
    return result.map((item) => ({
      fileId: item.fileId,
      convertStatus: item.convertStatus,
      type: item.type,
      totalPage: item.totalPage,
      imageCount: item.imageCount,
      htmlUrl: item.htmlUrl,
    }));
  }

  async updateTeacherDocRelation(teacherId: string, fileIds: string, operation: 1 | 2): Promise<boolean> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.channel.updateTeacherDocRelation(teacherId, fileIds, operation);
  }

  async getChannelMultimediaResourceList(
    channelId: string,
    options?: { pageNumber?: number; pageSize?: number }
  ): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.channel.getChannelMultimediaResourceList(channelId, options);
  }

  async getChannelMultimediaResourceDetail(
    channelId: string,
    options?: { pageNumber?: number; pageSize?: number }
  ): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.channel.getChannelMultimediaResourceDetail(channelId, options);
  }

  async linkChannelMultimediaResource(channelId: string, vids: string): Promise<boolean> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.channel.linkChannelMultimediaResource(channelId, vids);
  }

  async unlinkChannelMultimediaResource(channelId: string, vids: string): Promise<boolean> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.channel.unlinkChannelMultimediaResource(channelId, vids);
  }

  async getUserMultimediaResourceDetail(vids: string): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.channel.getUserMultimediaResourceDetail(vids);
  }

  async deleteUserMultimediaResource(vids: string): Promise<boolean> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.channel.deleteUserMultimediaResource(vids);
  }

  /**
   * Validates document list options
   * @param options Options to validate
   * @throws {PolyVValidationError} When validation fails
   */
  private validateListOptions(options: DocumentListOptions): void {
    const errors: string[] = [];

    // Validate channelId parameter
    if (!options.channelId || typeof options.channelId !== 'string' || options.channelId.trim().length === 0) {
      errors.push('channelId is required and must be a non-empty string');
    }

    // Validate page if specified
    if (options.page !== undefined && (!Number.isInteger(options.page) || options.page < 1)) {
      errors.push('page must be a positive integer');
    }

    // Validate pageSize if specified
    if (options.pageSize !== undefined && (!Number.isInteger(options.pageSize) || options.pageSize < 1)) {
      errors.push('pageSize must be a positive integer');
    }

    // Validate status if specified
    if (options.status !== undefined && !VALID_STATUSES.includes(options.status)) {
      errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}`);
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Document list options validation failed: ${errors.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }

  /**
   * Validates upload parameters
   * @param channelId Channel ID
   * @param options Upload options
   * @throws {PolyVValidationError} When validation fails
   */
  private validateUploadParams(
    channelId: string,
    options: { url: string; type?: 'common' | 'animate' }
  ): void {
    const errors: string[] = [];

    // Validate channelId parameter
    if (!channelId || typeof channelId !== 'string' || channelId.trim().length === 0) {
      errors.push('channelId is required and must be a non-empty string');
    }

    // Validate url parameter
    if (!options.url || typeof options.url !== 'string' || options.url.trim().length === 0) {
      errors.push('url is required and must be a non-empty string');
    }

    // Validate type if specified
    if (options.type !== undefined && !VALID_CONVERT_TYPES.includes(options.type)) {
      errors.push(`type must be one of: ${VALID_CONVERT_TYPES.join(', ')}`);
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Document upload parameters validation failed: ${errors.join(', ')}`,
        'params',
        { channelId, ...options },
        'validation_failed'
      );
    }
  }

  /**
   * Validates delete parameters
   * @param channelId Channel ID
   * @param fileId File ID
   * @param type Document type
   * @throws {PolyVValidationError} When validation fails
   */
  private validateDeleteParams(
    channelId: string,
    fileId: string,
    type: 'old' | 'new'
  ): void {
    const errors: string[] = [];

    // Validate channelId parameter
    if (!channelId || typeof channelId !== 'string' || channelId.trim().length === 0) {
      errors.push('channelId is required and must be a non-empty string');
    }

    // Validate fileId parameter
    if (!fileId || typeof fileId !== 'string' || fileId.trim().length === 0) {
      errors.push('fileId is required and must be a non-empty string');
    }

    // Validate type
    if (!VALID_DOC_TYPES.includes(type)) {
      errors.push(`type must be one of: ${VALID_DOC_TYPES.join(', ')}`);
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Document delete parameters validation failed: ${errors.join(', ')}`,
        'params',
        { channelId, fileId, type },
        'validation_failed'
      );
    }
  }

  /**
   * Validates status parameters
   * @param channelId Channel ID
   * @param fileId File ID
   * @throws {PolyVValidationError} When validation fails
   */
  private validateStatusParams(channelId: string, fileId: string): void {
    const errors: string[] = [];

    // Validate channelId parameter
    if (!channelId || typeof channelId !== 'string' || channelId.trim().length === 0) {
      errors.push('channelId is required and must be a non-empty string');
    }

    // Validate fileId parameter
    if (!fileId || typeof fileId !== 'string' || fileId.trim().length === 0) {
      errors.push('fileId is required and must be a non-empty string');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Document status parameters validation failed: ${errors.join(', ')}`,
        'params',
        { channelId, fileId },
        'validation_failed'
      );
    }
  }
}
