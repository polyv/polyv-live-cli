/**
 * @fileoverview Document command handler for CLI operations
 * @author Development Team
 * @since 9.5.0
 */

import { BaseHandler, OutputFormat } from './base.handler';
import { DocumentServiceSdk } from '../services/document.service.sdk';
import {
  DocumentServiceConfig,
  DocumentListOptions,
  DocumentUploadOptions,
  DocumentDeleteOptions,
  DocumentStatusOptions,
  DocumentDisplayItem,
} from '../types/document';
import { AuthConfig } from '../types/auth';
import { confirmDeletion, isInteractiveEnvironment } from '../utils/confirmation';

/**
 * Interface for document service (enables dependency injection)
 */
export interface IDocumentService {
  getDocumentList(options: DocumentListOptions): Promise<{
    contents: DocumentDisplayItem[];
    pageNumber: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  }>;
  uploadDocument(channelId: string, options: {
    url: string;
    type?: 'common' | 'animate';
    docName?: string;
    callbackUrl?: string;
  }): Promise<{ fileId: string; status: string; type: string }>;
  deleteDocument(channelId: string, fileId: string, type: 'old' | 'new'): Promise<boolean>;
  getDocumentStatus(channelId: string, fileId: string): Promise<{
    fileId: string;
    convertStatus: string;
    type: string;
    totalPage: number;
    imageCount: number;
    htmlUrl?: string;
  }[]>;
}

/**
 * Handler for document-related CLI commands
 */
export class DocumentHandler extends BaseHandler {
  private readonly documentService: IDocumentService;

  /**
   * Creates a new DocumentHandler instance
   * @param authConfig Authentication configuration
   * @param serviceConfig Service configuration
   * @param documentService Optional injected document service (for testing)
   */
  constructor(
    authConfig: AuthConfig,
    serviceConfig: DocumentServiceConfig,
    documentService?: IDocumentService
  ) {
    super();
    this.documentService = documentService ?? new DocumentServiceSdk(authConfig, serviceConfig);
  }

  /**
   * List documents for a channel
   * @param options Document list options from CLI
   * @returns Promise that resolves when document list is displayed
   *
   * @throws {PolyVValidationError} When options are invalid
   * @throws {PolyVError} When document query fails
   *
   * @example
   * ```typescript
   * await documentHandler.listDocuments({
   *   channelId: '3151318',
   *   output: 'table'
   * });
   * ```
   */
  async listDocuments(options: DocumentListOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate required channelId
      if (!options.channelId || options.channelId.trim() === '') {
        throw new Error('channelId is required');
      }

      // Call SDK service to get document list
      const result = await this.documentService.getDocumentList(options);

      // Display results
      this.displayDocumentList(result.contents, options.channelId, options.output);
    }, 'document.list');
  }

  /**
   * Upload a document to a channel
   * @param options Document upload options from CLI
   * @returns Promise that resolves when document is uploaded
   *
   * @throws {PolyVValidationError} When options are invalid
   * @throws {PolyVError} When upload fails
   *
   * @example
   * ```typescript
   * await documentHandler.uploadDocument({
   *   channelId: '3151318',
   *   url: 'https://example.com/doc.pdf',
   *   type: 'common',
   *   output: 'table'
   * });
   * ```
   */
  async uploadDocument(options: DocumentUploadOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate required channelId
      if (!options.channelId || options.channelId.trim() === '') {
        throw new Error('channelId is required');
      }

      // Validate required url
      if (!options.url || options.url.trim() === '') {
        throw new Error('url is required');
      }

      // Build upload options
      const uploadOptions: {
        url: string;
        type?: 'common' | 'animate';
        docName?: string;
        callbackUrl?: string;
      } = { url: options.url };

      if (options.type !== undefined) {
        uploadOptions.type = options.type;
      }
      if (options.docName !== undefined) {
        uploadOptions.docName = options.docName;
      }
      if (options.callbackUrl !== undefined) {
        uploadOptions.callbackUrl = options.callbackUrl;
      }

      // Call SDK service to upload document
      const result = await this.documentService.uploadDocument(options.channelId, uploadOptions);

      // Display results
      this.displayUploadResult(options.channelId, result, options.output, options.docName);
    }, 'document.upload');
  }

  /**
   * Delete a document from a channel
   * @param options Document delete options from CLI
   * @returns Promise that resolves when document is deleted
   *
   * @throws {PolyVValidationError} When options are invalid
   * @throws {PolyVError} When deletion fails
   *
   * @example
   * ```typescript
   * await documentHandler.deleteDocument({
   *   channelId: '3151318',
   *   fileId: 'abc123',
   *   force: true
   * });
   * ```
   */
  async deleteDocument(options: DocumentDeleteOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate required channelId
      if (!options.channelId || options.channelId.trim() === '') {
        throw new Error('channelId is required');
      }

      // Validate required fileId
      if (!options.fileId || options.fileId.trim() === '') {
        throw new Error('fileId is required');
      }

      // Check for confirmation if force is not set
      if (!options.force) {
        // Check if we're in a TTY environment
        if (!isInteractiveEnvironment()) {
          throw new Error(
            'Interactive confirmation not available in non-TTY environment. Use --force flag to bypass confirmation.'
          );
        }
      }

      // Get document info to find the type (old/new)
      const listResult = await this.documentService.getDocumentList({
        channelId: options.channelId,
      });

      const doc = listResult.contents.find((item) => item.fileId === options.fileId);

      if (!doc) {
        throw new Error(`Document not found: ${options.fileId}`);
      }

      // Determine document type for deletion
      const docType = (options.type || doc.type) as 'old' | 'new';

      // Prompt for confirmation if force is not set
      if (!options.force) {
        // Prompt for confirmation
        const confirmed = await confirmDeletion(
          `确定要删除文档 '${doc.fileName}' (${options.fileId}) 吗？此操作无法撤销。`,
          'yes'
        );

        if (!confirmed) {
          this.displayInfo('删除操作已取消');
          return;
        }
      }

      // Call SDK service to delete document
      await this.documentService.deleteDocument(
        options.channelId,
        options.fileId,
        docType
      );

      // Display deletion result
      this.displayDeleteResult(options, doc);
    }, 'document.delete');
  }

  /**
   * Get document conversion status
   * @param options Document status options from CLI
   * @returns Promise that resolves when document status is displayed
   *
   * @throws {PolyVValidationError} When options are invalid
   * @throws {PolyVError} When status query fails
   *
   * @example
   * ```typescript
   * await documentHandler.getDocumentStatus({
   *   channelId: '3151318',
   *   fileId: 'abc123',
   *   output: 'table'
   * });
   * ```
   */
  async getDocumentStatus(options: DocumentStatusOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate required channelId
      if (!options.channelId || options.channelId.trim() === '') {
        throw new Error('channelId is required');
      }

      // Validate required fileId
      if (!options.fileId || options.fileId.trim() === '') {
        throw new Error('fileId is required');
      }

      // Call SDK service to get document status
      const result = await this.documentService.getDocumentStatus(
        options.channelId,
        options.fileId
      );

      // Display results
      this.displayStatusResult(options.channelId, result, options.output);
    }, 'document.status');
  }

  /**
   * Displays document list in the specified format
   * @param contents Array of document items
   * @param channelId Channel ID for context
   * @param format Output format (table or json)
   */
  private displayDocumentList(
    contents: DocumentDisplayItem[],
    channelId: string,
    format: OutputFormat = 'table'
  ): void {
    if (contents.length === 0) {
      this.displayInfo(`暂无课件文档 - 频道: ${channelId}`);
      return;
    }

    // Display context info
    this.displayInfo(`课件列表 - 频道: ${channelId}`);
    this.displayInfo(`共 ${contents.length} 个文档`);

    // Display document list in the requested format
    if (format === 'json') {
      this.displayData(contents, 'json');
    } else {
      this.displayDocumentTable(contents);
    }
  }

  /**
   * Displays document list as a formatted table
   * @param contents Array of document items
   */
  private displayDocumentTable(contents: DocumentDisplayItem[]): void {
    // Transform document data for table display
    const tableData = contents.map((item) => ({
      '文件ID': item.fileId,
      '文件名': item.fileName,
      '类型': item.fileType,
      '状态': this.translateStatus(item.status),
      '页数': item.totalPage || '-',
      '创建时间': this.formatTimestamp(item.createTime),
    }));

    this.displayAsTable(tableData);
  }

  /**
   * Displays upload result in the specified format
   * @param channelId Channel ID
   * @param result Upload result from API
   * @param format Output format
   * @param docName Optional document name
   */
  private displayUploadResult(
    channelId: string,
    result: { fileId: string; status: string; type: string },
    format: OutputFormat = 'table',
    docName?: string
  ): void {
    // Build result data
    const resultData = {
      channelId,
      fileName: docName || '未知',
      fileId: result.fileId,
      convertType: result.type,
      status: this.translateStatus(result.status),
    };

    // Display context info
    this.displayInfo(`上传成功`);
    this.displayInfo(`课件文档上传 - 频道: ${channelId}`);

    // Display in the requested format
    if (format === 'json') {
      this.displayData(resultData, 'json');
    } else {
      this.displayUploadResultTable(resultData);
    }
  }

  /**
   * Displays upload result as a formatted table
   * @param resultData Result data to display
   */
  private displayUploadResultTable(resultData: {
    channelId: string;
    fileName: string;
    fileId: string;
    convertType: string;
    status: string;
  }): void {
    const tableData = [{
      '频道': resultData.channelId,
      '文件名': resultData.fileName,
      '文件ID': resultData.fileId,
      '转换类型': resultData.convertType,
      '状态': resultData.status,
    }];

    this.displayAsTable(tableData);
  }

  /**
   * Displays deletion result in the specified format
   * @param options Delete options from CLI
   * @param docInfo Document info for display
   */
  private displayDeleteResult(
    options: DocumentDeleteOptions,
    docInfo: DocumentDisplayItem
  ): void {
    const format = options.output || 'table';

    // Build result data
    const resultData = {
      channelId: options.channelId,
      fileId: options.fileId,
      fileName: docInfo.fileName,
      status: '已删除',
    };

    // Display context info
    this.displayInfo(`删除成功`);
    this.displayInfo(`课件文档删除 - 频道: ${options.channelId}`);

    // Display in the requested format
    if (format === 'json') {
      this.displayData(resultData, 'json');
    } else {
      this.displayDeleteResultTable(resultData);
    }
  }

  /**
   * Displays deletion result as a formatted table
   * @param resultData Result data to display
   */
  private displayDeleteResultTable(resultData: {
    channelId: string;
    fileId: string;
    fileName: string;
    status: string;
  }): void {
    const tableData = [{
      '频道': resultData.channelId,
      '文件ID': resultData.fileId,
      '文件名': resultData.fileName,
      '状态': resultData.status,
    }];

    this.displayAsTable(tableData);
  }

  /**
   * Displays document status result in the specified format
   * @param channelId Channel ID
   * @param result Status result from API
   * @param format Output format
   */
  private displayStatusResult(
    channelId: string,
    result: {
      fileId: string;
      convertStatus: string;
      type: string;
      totalPage: number;
      imageCount: number;
      htmlUrl?: string;
    }[],
    format: OutputFormat = 'table'
  ): void {
    // Display context info
    this.displayInfo(`转码状态 - 频道: ${channelId}`);

    if (result.length === 0) {
      this.displayInfo('未找到文档转码状态');
      return;
    }

    // Display in the requested format
    if (format === 'json') {
      this.displayData(result, 'json');
    } else {
      this.displayStatusTable(result);
    }
  }

  /**
   * Displays status result as a formatted table
   * @param result Status result to display
   */
  private displayStatusTable(result: {
    fileId: string;
    convertStatus: string;
    type: string;
    totalPage: number;
    imageCount: number;
    htmlUrl?: string;
  }[]): void {
    const tableData = result.map((item) => ({
      '文件ID': item.fileId,
      '状态': this.translateConvertStatus(item.convertStatus),
      '类型': item.type,
      '页数': item.totalPage || '-',
      '图片数量': item.imageCount || '-',
    }));

    this.displayAsTable(tableData);
  }

  /**
   * Translates document status to Chinese
   * @param status Status code
   * @returns Chinese status text
   */
  private translateStatus(status: string): string {
    const statusMap: Record<string, string> = {
      normal: '正常',
      waitUpload: '等待上传',
      failUpload: '上传失败',
      waitConvert: '转换中',
      failConvert: '转换失败',
    };
    return statusMap[status] || status;
  }

  /**
   * Translates convert status to Chinese
   * @param status Convert status code
   * @returns Chinese status text
   */
  private translateConvertStatus(status: string): string {
    const statusMap: Record<string, string> = {
      normal: '正常',
      waiting: '等待中',
      processing: '处理中',
      fail: '失败',
    };
    return statusMap[status] || status;
  }

  /**
   * Formats a timestamp to readable date string
   * @param timestamp Unix timestamp in milliseconds
   * @returns Formatted date string
   */
  private formatTimestamp(timestamp?: number): string {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
