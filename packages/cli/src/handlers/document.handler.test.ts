/**
 * @fileoverview Unit tests for DocumentHandler - ATDD Failing Tests (RED Phase)
 * @story 9.5: 课件文档管理命令
 *
 * These tests will FAIL until the feature is implemented (TDD red phase)
 *
 * Acceptance Criteria:
 * - AC1: `document list` 命令支持 `--channel-id` 参数获取频道课件列表
 * - AC2: `document list` 命令支持 `--status` 参数过滤文档状态
 * - AC3: `document list` 命令支持分页参数（`--page`, `--page-size`）
 * - AC4: `document upload` 命令支持通过 `--url` 参数上传远程文件
 * - AC5: `document upload` 命令支持 `--type` 参数设置转换类型
 * - AC6: `document upload` 命令支持 `--doc-name` 参数设置文档名称
 * - AC7: `document upload` 命令支持 `--callback-url` 参数设置回调地址
 * - AC8: `document delete` 命令支持 `--file-id` 参数删除指定文档
 * - AC9: `document delete` 命令需要确认提示（可通过 `--force` 跳过）
 * - AC10: `document status` 命令支持查询文档转码状态
 * - AC11: 所有命令支持 `--output` 参数选择 table 或 json 输出格式
 * - AC12: 表格输出格式清晰，显示文档信息
 */

import { DocumentHandler, IDocumentService } from './document.handler';
import { AuthConfig } from '../types/auth';
import {
  DocumentServiceConfig,
  DocumentListOptions,
  DocumentUploadOptions,
  DocumentDeleteOptions,
  DocumentStatusOptions,
} from '../types/document';
import { confirmDeletion, isInteractiveEnvironment } from '../utils/confirmation';

// Mock the DocumentServiceSdk
jest.mock('../services/document.service.sdk', () => ({
  DocumentServiceSdk: jest.fn().mockImplementation(() => ({
    getDocumentList: jest.fn(),
    uploadDocument: jest.fn(),
    deleteDocument: jest.fn(),
    getDocumentStatus: jest.fn(),
  })),
}));

// Mock the confirmation utility
jest.mock('../utils/confirmation', () => ({
  confirmDeletion: jest.fn(),
  isInteractiveEnvironment: jest.fn().mockReturnValue(true),
}));

describe('DocumentHandler (Story 9.5 - ATDD RED Phase)', () => {
  let handler: DocumentHandler;
  let mockDocumentService: jest.Mocked<IDocumentService>;
  let mockConsoleLog: jest.SpyInstance;
  let mockConsoleError: jest.SpyInstance;

  const mockAuthConfig: AuthConfig = {
    appId: 'test-app-id',
    appSecret: 'test-app-secret',
  };

  const mockServiceConfig: DocumentServiceConfig = {
    baseUrl: 'https://api.polyv.net',
    timeout: 30000,
    debug: false,
  };

  const mockDocumentListResponse = {
    pageSize: 10,
    pageNumber: 1,
    totalItems: 2,
    totalPages: 1,
    contents: [
      {
        fileId: 'abc123',
        fileName: '培训课件.pptx',
        fileUrl: 'https://example.com/doc.pptx',
        fileType: '.pptx',
        totalPage: 19,
        channelId: '3151318',
        status: 'normal',
        createTime: 1705286400000,
        convertType: 'common',
        type: 'new',
      },
      {
        fileId: 'def456',
        fileName: '产品手册.pdf',
        fileUrl: 'https://example.com/manual.pdf',
        fileType: '.pdf',
        totalPage: 5,
        channelId: '3151318',
        status: 'waitConvert',
        createTime: 1705372800000,
        convertType: 'common',
        type: 'new',
      },
    ],
  };

  const mockUploadResponse = {
    fileId: 'ghi789',
    status: 'waitConvert',
    type: 'common',
  };

  const mockStatusResponse = [
    {
      fileId: 'abc123',
      convertStatus: 'normal',
      type: 'common',
      totalPage: 19,
      imageCount: 19,
      htmlUrl: 'https://example.com/converted.html',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock service
    mockDocumentService = {
      getDocumentList: jest.fn(),
      uploadDocument: jest.fn(),
      deleteDocument: jest.fn(),
      getDocumentStatus: jest.fn(),
    };

    // Create handler with mock service
    handler = new DocumentHandler(mockAuthConfig, mockServiceConfig, mockDocumentService);

    // Mock console methods
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  // ============================================
  // AC1: listDocuments - Basic functionality
  // ============================================

  describe('AC1: listDocuments - Basic functionality', () => {
    it('should call service with channelId', async () => {
      mockDocumentService.getDocumentList.mockResolvedValueOnce(mockDocumentListResponse);

      const options: DocumentListOptions = {
        channelId: '3151318',
      };

      await handler.listDocuments(options);

      expect(mockDocumentService.getDocumentList).toHaveBeenCalledWith({
        channelId: '3151318',
      });
    });

    it('should display document list in table format by default', async () => {
      mockDocumentService.getDocumentList.mockResolvedValueOnce(mockDocumentListResponse);

      const options: DocumentListOptions = {
        channelId: '3151318',
      };

      await handler.listDocuments(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('课件列表')
      );
    });

    it('should validate required channelId', async () => {
      const options: DocumentListOptions = {
        channelId: '',
      };

      await expect(handler.listDocuments(options)).rejects.toThrow();
    });
  });

  // ============================================
  // AC2: listDocuments - Status filter
  // ============================================

  describe('AC2: listDocuments - Status filter', () => {
    it('should pass status parameter to service', async () => {
      mockDocumentService.getDocumentList.mockResolvedValueOnce(mockDocumentListResponse);

      const options: DocumentListOptions = {
        channelId: '3151318',
        status: 'normal',
      };

      await handler.listDocuments(options);

      expect(mockDocumentService.getDocumentList).toHaveBeenCalledWith({
        channelId: '3151318',
        status: 'normal',
      });
    });

    it('should support all status values', async () => {
      const statuses: Array<'normal' | 'waitUpload' | 'failUpload' | 'waitConvert' | 'failConvert'> = [
        'normal',
        'waitUpload',
        'failUpload',
        'waitConvert',
        'failConvert',
      ];

      for (const status of statuses) {
        mockDocumentService.getDocumentList.mockResolvedValueOnce(mockDocumentListResponse);

        const options: DocumentListOptions = {
          channelId: '3151318',
          status,
        };

        await handler.listDocuments(options);

        expect(mockDocumentService.getDocumentList).toHaveBeenCalledWith(
          expect.objectContaining({ status })
        );
      }
    });
  });

  // ============================================
  // AC3: listDocuments - Pagination
  // ============================================

  describe('AC3: listDocuments - Pagination', () => {
    it('should pass page parameter to service', async () => {
      mockDocumentService.getDocumentList.mockResolvedValueOnce(mockDocumentListResponse);

      const options: DocumentListOptions = {
        channelId: '3151318',
        page: 2,
      };

      await handler.listDocuments(options);

      expect(mockDocumentService.getDocumentList).toHaveBeenCalledWith({
        channelId: '3151318',
        page: 2,
      });
    });

    it('should pass pageSize parameter to service', async () => {
      mockDocumentService.getDocumentList.mockResolvedValueOnce(mockDocumentListResponse);

      const options: DocumentListOptions = {
        channelId: '3151318',
        pageSize: 20,
      };

      await handler.listDocuments(options);

      expect(mockDocumentService.getDocumentList).toHaveBeenCalledWith({
        channelId: '3151318',
        pageSize: 20,
      });
    });

    it('should pass both page and pageSize parameters to service', async () => {
      mockDocumentService.getDocumentList.mockResolvedValueOnce(mockDocumentListResponse);

      const options: DocumentListOptions = {
        channelId: '3151318',
        page: 2,
        pageSize: 20,
      };

      await handler.listDocuments(options);

      expect(mockDocumentService.getDocumentList).toHaveBeenCalledWith({
        channelId: '3151318',
        page: 2,
        pageSize: 20,
      });
    });
  });

  // ============================================
  // AC11, AC12: listDocuments - Output format
  // ============================================

  describe('AC11, AC12: listDocuments - Output format', () => {
    it('should display table with Chinese headers', async () => {
      mockDocumentService.getDocumentList.mockResolvedValueOnce(mockDocumentListResponse);

      const options: DocumentListOptions = {
        channelId: '3151318',
        output: 'table',
      };

      await handler.listDocuments(options);

      const logCalls = mockConsoleLog.mock.calls.map(call => call.join(' ')).join(' ');
      expect(logCalls).toContain('文件ID');
      expect(logCalls).toContain('文件名');
      expect(logCalls).toContain('类型');
      expect(logCalls).toContain('状态');
    });

    it('should output full JSON when output is json', async () => {
      mockDocumentService.getDocumentList.mockResolvedValueOnce(mockDocumentListResponse);

      const options: DocumentListOptions = {
        channelId: '3151318',
        output: 'json',
      };

      await handler.listDocuments(options);

      const jsonCall = mockConsoleLog.mock.calls.find(call =>
        call.some(arg => typeof arg === 'string' && arg.includes('"fileId"'))
      );
      expect(jsonCall).toBeDefined();
    });

    it('should display friendly message when no documents found', async () => {
      const emptyResponse = {
        pageSize: 10,
        pageNumber: 1,
        totalItems: 0,
        totalPages: 0,
        contents: [],
      };
      mockDocumentService.getDocumentList.mockResolvedValueOnce(emptyResponse);

      const options: DocumentListOptions = {
        channelId: '3151318',
      };

      await handler.listDocuments(options);

      const logCalls = mockConsoleLog.mock.calls.map(call => call.join(' ')).join(' ');
      expect(logCalls).toContain('暂无课件文档');
    });
  });

  // ============================================
  // listDocuments - Error Handling
  // ============================================

  describe('listDocuments - Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      const error = new Error('API Error');
      mockDocumentService.getDocumentList.mockRejectedValueOnce(error);

      const options: DocumentListOptions = {
        channelId: '3151318',
      };

      await expect(handler.listDocuments(options)).rejects.toThrow('API Error');
    });
  });

  // ============================================
  // AC4: uploadDocument - Basic functionality
  // ============================================

  describe('AC4: uploadDocument - Basic functionality', () => {
    it('should call service with channelId and url', async () => {
      mockDocumentService.uploadDocument.mockResolvedValueOnce(mockUploadResponse);

      const options: DocumentUploadOptions = {
        channelId: '3151318',
        url: 'https://example.com/doc.pdf',
      };

      await handler.uploadDocument(options);

      expect(mockDocumentService.uploadDocument).toHaveBeenCalledWith(
        '3151318',
        expect.objectContaining({
          url: 'https://example.com/doc.pdf',
        })
      );
    });

    it('should validate required channelId', async () => {
      const options: DocumentUploadOptions = {
        channelId: '',
        url: 'https://example.com/doc.pdf',
      };

      await expect(handler.uploadDocument(options)).rejects.toThrow();
    });

    it('should validate required url', async () => {
      const options: DocumentUploadOptions = {
        channelId: '3151318',
        url: '',
      };

      await expect(handler.uploadDocument(options)).rejects.toThrow();
    });
  });

  // ============================================
  // AC5: uploadDocument - Type parameter
  // ============================================

  describe('AC5: uploadDocument - Type parameter', () => {
    it('should pass type parameter to service', async () => {
      mockDocumentService.uploadDocument.mockResolvedValueOnce(mockUploadResponse);

      const options: DocumentUploadOptions = {
        channelId: '3151318',
        url: 'https://example.com/doc.pptx',
        type: 'animate',
      };

      await handler.uploadDocument(options);

      expect(mockDocumentService.uploadDocument).toHaveBeenCalledWith(
        '3151318',
        expect.objectContaining({
          type: 'animate',
        })
      );
    });

    it('should support both type values', async () => {
      const types: Array<'common' | 'animate'> = ['common', 'animate'];

      for (const type of types) {
        mockDocumentService.uploadDocument.mockResolvedValueOnce(mockUploadResponse);

        const options: DocumentUploadOptions = {
          channelId: '3151318',
          url: 'https://example.com/doc.pdf',
          type,
        };

        await handler.uploadDocument(options);

        expect(mockDocumentService.uploadDocument).toHaveBeenCalledWith(
          '3151318',
          expect.objectContaining({ type })
        );
      }
    });
  });

  // ============================================
  // AC6: uploadDocument - DocName parameter
  // ============================================

  describe('AC6: uploadDocument - DocName parameter', () => {
    it('should pass docName parameter to service', async () => {
      mockDocumentService.uploadDocument.mockResolvedValueOnce(mockUploadResponse);

      const options: DocumentUploadOptions = {
        channelId: '3151318',
        url: 'https://example.com/doc.pdf',
        docName: '培训课件',
      };

      await handler.uploadDocument(options);

      expect(mockDocumentService.uploadDocument).toHaveBeenCalledWith(
        '3151318',
        expect.objectContaining({
          docName: '培训课件',
        })
      );
    });
  });

  // ============================================
  // AC7: uploadDocument - CallbackUrl parameter
  // ============================================

  describe('AC7: uploadDocument - CallbackUrl parameter', () => {
    it('should pass callbackUrl parameter to service', async () => {
      mockDocumentService.uploadDocument.mockResolvedValueOnce(mockUploadResponse);

      const options: DocumentUploadOptions = {
        channelId: '3151318',
        url: 'https://example.com/doc.pdf',
        callbackUrl: 'https://example.com/callback',
      };

      await handler.uploadDocument(options);

      expect(mockDocumentService.uploadDocument).toHaveBeenCalledWith(
        '3151318',
        expect.objectContaining({
          callbackUrl: 'https://example.com/callback',
        })
      );
    });
  });

  // ============================================
  // AC11: uploadDocument - Output format
  // ============================================

  describe('AC11: uploadDocument - Output format', () => {
    it('should display upload result in table format by default', async () => {
      mockDocumentService.uploadDocument.mockResolvedValueOnce(mockUploadResponse);

      const options: DocumentUploadOptions = {
        channelId: '3151318',
        url: 'https://example.com/doc.pdf',
      };

      await handler.uploadDocument(options);

      const logCalls = mockConsoleLog.mock.calls.map(call => call.join(' ')).join(' ');
      expect(logCalls).toContain('上传成功');
    });

    it('should output JSON when output is json', async () => {
      mockDocumentService.uploadDocument.mockResolvedValueOnce(mockUploadResponse);

      const options: DocumentUploadOptions = {
        channelId: '3151318',
        url: 'https://example.com/doc.pdf',
        output: 'json',
      };

      await handler.uploadDocument(options);

      const jsonCall = mockConsoleLog.mock.calls.find(call =>
        call.some(arg => typeof arg === 'string' && arg.includes('"fileId"'))
      );
      expect(jsonCall).toBeDefined();
    });
  });

  // ============================================
  // uploadDocument - Error Handling
  // ============================================

  describe('uploadDocument - Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      const error = new Error('Upload API Error');
      mockDocumentService.uploadDocument.mockRejectedValueOnce(error);

      const options: DocumentUploadOptions = {
        channelId: '3151318',
        url: 'https://example.com/doc.pdf',
      };

      await expect(handler.uploadDocument(options)).rejects.toThrow('Upload API Error');
    });
  });

  // ============================================
  // AC8: deleteDocument - Basic functionality
  // ============================================

  describe('AC8: deleteDocument - Basic functionality', () => {
    it('should call service with channelId and fileId', async () => {
      mockDocumentService.deleteDocument.mockResolvedValueOnce(true);
      mockDocumentService.getDocumentList.mockResolvedValueOnce(mockDocumentListResponse);

      const options: DocumentDeleteOptions = {
        channelId: '3151318',
        fileId: 'abc123',
        force: true,
      };

      await handler.deleteDocument(options);

      expect(mockDocumentService.deleteDocument).toHaveBeenCalledWith(
        '3151318',
        'abc123',
        'new'
      );
    });

    it('should validate required channelId', async () => {
      const options: DocumentDeleteOptions = {
        channelId: '',
        fileId: 'abc123',
        force: true,
      };

      await expect(handler.deleteDocument(options)).rejects.toThrow();
    });

    it('should validate required fileId', async () => {
      const options: DocumentDeleteOptions = {
        channelId: '3151318',
        fileId: '',
        force: true,
      };

      await expect(handler.deleteDocument(options)).rejects.toThrow();
    });
  });

  // ============================================
  // AC9: deleteDocument - Confirmation flow
  // ============================================

  describe('AC9: deleteDocument - Confirmation flow', () => {
    it('should prompt for confirmation before deletion when force is false', async () => {
      (confirmDeletion as jest.Mock).mockResolvedValueOnce(true);
      mockDocumentService.deleteDocument.mockResolvedValueOnce(true);
      mockDocumentService.getDocumentList.mockResolvedValueOnce(mockDocumentListResponse);

      const options: DocumentDeleteOptions = {
        channelId: '3151318',
        fileId: 'abc123',
        force: false,
      };

      await handler.deleteDocument(options);

      expect(confirmDeletion).toHaveBeenCalledWith(
        expect.stringContaining('abc123'),
        'yes'
      );
    });

    it('should throw error in non-TTY environment without force flag', async () => {
      (isInteractiveEnvironment as jest.Mock).mockReturnValueOnce(false);

      const options: DocumentDeleteOptions = {
        channelId: '3151318',
        fileId: 'abc123',
        force: false,
      };

      await expect(handler.deleteDocument(options)).rejects.toThrow('non-TTY');
    });

    it('should cancel operation when user declines confirmation', async () => {
      (confirmDeletion as jest.Mock).mockResolvedValueOnce(false);
      mockDocumentService.getDocumentList.mockResolvedValueOnce(mockDocumentListResponse);

      const options: DocumentDeleteOptions = {
        channelId: '3151318',
        fileId: 'abc123',
        force: false,
      };

      await handler.deleteDocument(options);

      expect(mockDocumentService.deleteDocument).not.toHaveBeenCalled();
      const logCalls = mockConsoleLog.mock.calls.map(call => call.join(' ')).join(' ');
      expect(logCalls).toContain('取消');
    });

    it('should proceed with deletion when user confirms', async () => {
      (confirmDeletion as jest.Mock).mockResolvedValueOnce(true);
      mockDocumentService.deleteDocument.mockResolvedValueOnce(true);
      mockDocumentService.getDocumentList.mockResolvedValueOnce(mockDocumentListResponse);

      const options: DocumentDeleteOptions = {
        channelId: '3151318',
        fileId: 'abc123',
        force: false,
      };

      await handler.deleteDocument(options);

      expect(mockDocumentService.deleteDocument).toHaveBeenCalled();
    });

    it('should skip confirmation when force flag is true', async () => {
      mockDocumentService.deleteDocument.mockResolvedValueOnce(true);
      mockDocumentService.getDocumentList.mockResolvedValueOnce(mockDocumentListResponse);

      const options: DocumentDeleteOptions = {
        channelId: '3151318',
        fileId: 'abc123',
        force: true,
      };

      await handler.deleteDocument(options);

      expect(confirmDeletion).not.toHaveBeenCalled();
      expect(mockDocumentService.deleteDocument).toHaveBeenCalled();
    });
  });

  // ============================================
  // AC11: deleteDocument - Output format
  // ============================================

  describe('AC11: deleteDocument - Output format', () => {
    it('should display deletion result in table format by default', async () => {
      mockDocumentService.deleteDocument.mockResolvedValueOnce(true);
      mockDocumentService.getDocumentList.mockResolvedValueOnce(mockDocumentListResponse);

      const options: DocumentDeleteOptions = {
        channelId: '3151318',
        fileId: 'abc123',
        force: true,
        output: 'table',
      };

      await handler.deleteDocument(options);

      const logCalls = mockConsoleLog.mock.calls.map(call => call.join(' ')).join(' ');
      expect(logCalls).toContain('频道');
      expect(logCalls).toContain('文件ID');
    });

    it('should display deletion result in JSON format when output is json', async () => {
      mockDocumentService.deleteDocument.mockResolvedValueOnce(true);
      mockDocumentService.getDocumentList.mockResolvedValueOnce(mockDocumentListResponse);

      const options: DocumentDeleteOptions = {
        channelId: '3151318',
        fileId: 'abc123',
        force: true,
        output: 'json',
      };

      await handler.deleteDocument(options);

      const jsonCall = mockConsoleLog.mock.calls.find(call =>
        call.some(arg => typeof arg === 'string' && (arg.includes('"fileId"') || arg.includes('"channelId"')))
      );
      expect(jsonCall).toBeDefined();
    });

    it('should include status "已删除" in output', async () => {
      mockDocumentService.deleteDocument.mockResolvedValueOnce(true);
      mockDocumentService.getDocumentList.mockResolvedValueOnce(mockDocumentListResponse);

      const options: DocumentDeleteOptions = {
        channelId: '3151318',
        fileId: 'abc123',
        force: true,
        output: 'table',
      };

      await handler.deleteDocument(options);

      const logCalls = mockConsoleLog.mock.calls.map(call => call.join(' ')).join(' ');
      expect(logCalls).toContain('已删除');
    });
  });

  // ============================================
  // deleteDocument - Error Handling
  // ============================================

  describe('deleteDocument - Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      const error = new Error('Delete API Error');
      mockDocumentService.getDocumentList.mockResolvedValueOnce(mockDocumentListResponse);
      mockDocumentService.deleteDocument.mockRejectedValueOnce(error);

      const options: DocumentDeleteOptions = {
        channelId: '3151318',
        fileId: 'abc123',
        force: true,
      };

      await expect(handler.deleteDocument(options)).rejects.toThrow('Delete API Error');
    });

    it('should handle document not found error', async () => {
      mockDocumentService.getDocumentList.mockResolvedValueOnce({
        ...mockDocumentListResponse,
        contents: [],
      });

      const options: DocumentDeleteOptions = {
        channelId: '3151318',
        fileId: 'nonexistent',
        force: true,
      };

      await expect(handler.deleteDocument(options)).rejects.toThrow();
    });
  });

  // ============================================
  // AC10: getDocumentStatus - Basic functionality
  // ============================================

  describe('AC10: getDocumentStatus - Basic functionality', () => {
    it('should call service with channelId and fileId', async () => {
      mockDocumentService.getDocumentStatus.mockResolvedValueOnce(mockStatusResponse);

      const options: DocumentStatusOptions = {
        channelId: '3151318',
        fileId: 'abc123',
      };

      await handler.getDocumentStatus(options);

      expect(mockDocumentService.getDocumentStatus).toHaveBeenCalledWith(
        '3151318',
        'abc123'
      );
    });

    it('should validate required channelId', async () => {
      const options: DocumentStatusOptions = {
        channelId: '',
        fileId: 'abc123',
      };

      await expect(handler.getDocumentStatus(options)).rejects.toThrow();
    });

    it('should validate required fileId', async () => {
      const options: DocumentStatusOptions = {
        channelId: '3151318',
        fileId: '',
      };

      await expect(handler.getDocumentStatus(options)).rejects.toThrow();
    });
  });

  // ============================================
  // AC10: getDocumentStatus - Multiple fileIds
  // ============================================

  describe('AC10: getDocumentStatus - Multiple fileIds', () => {
    it('should handle comma-separated fileIds', async () => {
      mockDocumentService.getDocumentStatus.mockResolvedValueOnce([
        ...mockStatusResponse,
        { ...mockStatusResponse[0], fileId: 'def456' },
      ]);

      const options: DocumentStatusOptions = {
        channelId: '3151318',
        fileId: 'abc123,def456',
      };

      await handler.getDocumentStatus(options);

      expect(mockDocumentService.getDocumentStatus).toHaveBeenCalledWith(
        '3151318',
        'abc123,def456'
      );
    });
  });

  // ============================================
  // AC11: getDocumentStatus - Output format
  // ============================================

  describe('AC11: getDocumentStatus - Output format', () => {
    it('should display status in table format by default', async () => {
      mockDocumentService.getDocumentStatus.mockResolvedValueOnce(mockStatusResponse);

      const options: DocumentStatusOptions = {
        channelId: '3151318',
        fileId: 'abc123',
        output: 'table',
      };

      await handler.getDocumentStatus(options);

      const logCalls = mockConsoleLog.mock.calls.map(call => call.join(' ')).join(' ');
      expect(logCalls).toContain('转码状态');
    });

    it('should output JSON when output is json', async () => {
      mockDocumentService.getDocumentStatus.mockResolvedValueOnce(mockStatusResponse);

      const options: DocumentStatusOptions = {
        channelId: '3151318',
        fileId: 'abc123',
        output: 'json',
      };

      await handler.getDocumentStatus(options);

      const jsonCall = mockConsoleLog.mock.calls.find(call =>
        call.some(arg => typeof arg === 'string' && arg.includes('"fileId"'))
      );
      expect(jsonCall).toBeDefined();
    });

    it('should handle empty status result', async () => {
      mockDocumentService.getDocumentStatus.mockResolvedValueOnce([]);

      const options: DocumentStatusOptions = {
        channelId: '3151318',
        fileId: 'abc123',
        output: 'table',
      };

      await handler.getDocumentStatus(options);

      const logCalls = mockConsoleLog.mock.calls.map(call => call.join(' ')).join(' ');
      expect(logCalls).toContain('未找到文档转码状态');
    });
  });

  // ============================================
  // getDocumentStatus - Error Handling
  // ============================================

  describe('getDocumentStatus - Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      const error = new Error('Status API Error');
      mockDocumentService.getDocumentStatus.mockRejectedValueOnce(error);

      const options: DocumentStatusOptions = {
        channelId: '3151318',
        fileId: 'abc123',
      };

      await expect(handler.getDocumentStatus(options)).rejects.toThrow('Status API Error');
    });
  });
});
