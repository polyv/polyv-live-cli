/**
 * @fileoverview Unit tests for DocumentServiceSdk - ATDD Failing Tests (RED Phase)
 * @story 9.5: 课件文档管理命令
 *
 * These tests will FAIL until the feature is implemented (TDD red phase)
 *
 * Acceptance Criteria:
 * - AC1-AC3: getDocumentList - Document list operations
 * - AC4-AC7: uploadDocument - Document upload operations
 * - AC8-AC9: deleteDocument - Document delete operations
 * - AC10: getDocumentStatus - Document status operations
 */

import { DocumentServiceSdk } from './document.service.sdk';
import { AuthConfig } from '../types/auth';
import { DocumentServiceConfig, DocumentListOptions } from '../types/document';
import { PolyVValidationError } from '../utils/errors';

// Mock the SDK module
jest.mock('../sdk', () => ({
  createSdkClient: jest.fn().mockReturnValue({
    channel: {
      getDocList: jest.fn(),
      uploadDoc: jest.fn(),
      deleteDocument: jest.fn(),
      getDocConvertStatus: jest.fn(),
    },
  }),
}));

import { createSdkClient } from '../sdk';

describe('DocumentServiceSdk (Story 9.5 - ATDD RED Phase)', () => {
  let service: DocumentServiceSdk;
  let mockSdkClient: {
    channel: {
      getDocList: jest.Mock;
      uploadDoc: jest.Mock;
      deleteDocument: jest.Mock;
      getDocConvertStatus: jest.Mock;
    };
  };

  const mockAuthConfig: AuthConfig = {
    appId: 'test-app-id',
    appSecret: 'test-app-secret',
  };

  const mockServiceConfig: DocumentServiceConfig = {
    baseUrl: 'https://api.polyv.net',
    timeout: 30000,
    debug: false,
  };

  const mockDocListResponse = {
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
    page: 1,
    pageSize: 10,
    total: 2,
  };

  const mockUploadResponse = {
    type: 'common',
    fileId: 'ghi789',
    status: 'waitConvert',
  };

  const mockConvertStatusResponse = [
    {
      imageCount: 19,
      images: ['https://example.com/img1.jpg'],
      smallImages: ['https://example.com/small1.jpg'],
      totalPage: 19,
      htmlUrl: 'https://example.com/converted.html',
      convertStatus: 'normal',
      type: 'common',
      fileId: 'abc123',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock SDK client
    mockSdkClient = {
      channel: {
        getDocList: jest.fn(),
        uploadDoc: jest.fn(),
        deleteDocument: jest.fn(),
        getDocConvertStatus: jest.fn(),
      },
    };

    (createSdkClient as jest.Mock).mockReturnValue(mockSdkClient);

    // Create service instance
    service = new DocumentServiceSdk(mockAuthConfig, mockServiceConfig);
  });

  // ============================================
  // getDocumentList
  // ============================================

  describe('getDocumentList', () => {
    it('should call SDK getDocList with correct parameters', async () => {
      mockSdkClient.channel.getDocList.mockResolvedValueOnce(mockDocListResponse);

      const options: DocumentListOptions = {
        channelId: '3151318',
      };

      await service.getDocumentList(options);

      expect(mockSdkClient.channel.getDocList).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '3151318',
        })
      );
    });

    it('should pass status parameter to SDK', async () => {
      mockSdkClient.channel.getDocList.mockResolvedValueOnce(mockDocListResponse);

      const options: DocumentListOptions = {
        channelId: '3151318',
        status: 'normal',
      };

      await service.getDocumentList(options);

      expect(mockSdkClient.channel.getDocList).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'normal',
        })
      );
    });

    it('should pass page parameter to SDK', async () => {
      mockSdkClient.channel.getDocList.mockResolvedValueOnce(mockDocListResponse);

      const options: DocumentListOptions = {
        channelId: '3151318',
        page: 2,
      };

      await service.getDocumentList(options);

      expect(mockSdkClient.channel.getDocList).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
        })
      );
    });

    it('should pass pageSize parameter to SDK as limit', async () => {
      mockSdkClient.channel.getDocList.mockResolvedValueOnce(mockDocListResponse);

      const options: DocumentListOptions = {
        channelId: '3151318',
        pageSize: 20,
      };

      await service.getDocumentList(options);

      expect(mockSdkClient.channel.getDocList).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 20,
        })
      );
    });

    it('should pass isShowUrl as Y to SDK', async () => {
      mockSdkClient.channel.getDocList.mockResolvedValueOnce(mockDocListResponse);

      const options: DocumentListOptions = {
        channelId: '3151318',
      };

      await service.getDocumentList(options);

      expect(mockSdkClient.channel.getDocList).toHaveBeenCalledWith(
        expect.objectContaining({
          isShowUrl: 'Y',
        })
      );
    });

    it('should transform SDK response to display items', async () => {
      mockSdkClient.channel.getDocList.mockResolvedValueOnce(mockDocListResponse);

      const options: DocumentListOptions = {
        channelId: '3151318',
      };

      const result = await service.getDocumentList(options);

      expect(result.contents).toHaveLength(2);
      expect(result.contents[0].fileId).toBe('abc123');
      expect(result.contents[0].fileName).toBe('培训课件.pptx');
      expect(result.contents[0].fileType).toBe('.pptx');
      expect(result.contents[0].totalPage).toBe(19);
      expect(result.contents[0].status).toBe('normal');
    });

    it('should return pagination info', async () => {
      mockSdkClient.channel.getDocList.mockResolvedValueOnce(mockDocListResponse);

      const options: DocumentListOptions = {
        channelId: '3151318',
      };

      const result = await service.getDocumentList(options);

      expect(result.pageNumber).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(result.totalItems).toBe(2);
      expect(result.totalPages).toBe(1);
    });

    it('should handle empty contents', async () => {
      mockSdkClient.channel.getDocList.mockResolvedValueOnce({
        contents: [],
        pageNumber: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0,
      });

      const options: DocumentListOptions = {
        channelId: '3151318',
      };

      const result = await service.getDocumentList(options);

      expect(result.contents).toHaveLength(0);
      expect(result.totalItems).toBe(0);
    });

    it('should validate required channelId', async () => {
      const options: DocumentListOptions = {
        channelId: '',
      };

      await expect(service.getDocumentList(options)).rejects.toThrow(PolyVValidationError);
    });

    it('should validate page must be positive integer', async () => {
      const options: DocumentListOptions = {
        channelId: '3151318',
        page: -1,
      };

      await expect(service.getDocumentList(options)).rejects.toThrow(PolyVValidationError);
    });

    it('should validate pageSize must be positive integer', async () => {
      const options: DocumentListOptions = {
        channelId: '3151318',
        pageSize: 0,
      };

      await expect(service.getDocumentList(options)).rejects.toThrow(PolyVValidationError);
    });

    it('should validate status must be valid value', async () => {
      const options: DocumentListOptions = {
        channelId: '3151318',
        status: 'invalid' as any,
      };

      await expect(service.getDocumentList(options)).rejects.toThrow(PolyVValidationError);
    });
  });

  // ============================================
  // uploadDocument
  // ============================================

  describe('uploadDocument', () => {
    it('should call SDK uploadDoc with correct parameters', async () => {
      mockSdkClient.channel.uploadDoc.mockResolvedValueOnce(mockUploadResponse);

      await service.uploadDocument('3151318', {
        url: 'https://example.com/doc.pdf',
      });

      expect(mockSdkClient.channel.uploadDoc).toHaveBeenCalledWith(
        '3151318',
        expect.objectContaining({
          url: 'https://example.com/doc.pdf',
        })
      );
    });

    it('should pass type parameter to SDK', async () => {
      mockSdkClient.channel.uploadDoc.mockResolvedValueOnce(mockUploadResponse);

      await service.uploadDocument('3151318', {
        url: 'https://example.com/doc.pptx',
        type: 'animate',
      });

      expect(mockSdkClient.channel.uploadDoc).toHaveBeenCalledWith(
        '3151318',
        expect.objectContaining({
          type: 'animate',
        })
      );
    });

    it('should pass docName parameter to SDK', async () => {
      mockSdkClient.channel.uploadDoc.mockResolvedValueOnce(mockUploadResponse);

      await service.uploadDocument('3151318', {
        url: 'https://example.com/doc.pdf',
        docName: '培训课件',
      });

      expect(mockSdkClient.channel.uploadDoc).toHaveBeenCalledWith(
        '3151318',
        expect.objectContaining({
          docName: '培训课件',
        })
      );
    });

    it('should pass callbackUrl parameter to SDK', async () => {
      mockSdkClient.channel.uploadDoc.mockResolvedValueOnce(mockUploadResponse);

      await service.uploadDocument('3151318', {
        url: 'https://example.com/doc.pdf',
        callbackUrl: 'https://example.com/callback',
      });

      expect(mockSdkClient.channel.uploadDoc).toHaveBeenCalledWith(
        '3151318',
        expect.objectContaining({
          callbackUrl: 'https://example.com/callback',
        })
      );
    });

    it('should return upload result', async () => {
      mockSdkClient.channel.uploadDoc.mockResolvedValueOnce(mockUploadResponse);

      const result = await service.uploadDocument('3151318', {
        url: 'https://example.com/doc.pdf',
      });

      expect(result.fileId).toBe('ghi789');
      expect(result.status).toBe('waitConvert');
      expect(result.type).toBe('common');
    });

    it('should validate required channelId', async () => {
      await expect(service.uploadDocument('', {
        url: 'https://example.com/doc.pdf',
      })).rejects.toThrow(PolyVValidationError);
    });

    it('should validate required url', async () => {
      await expect(service.uploadDocument('3151318', {
        url: '',
      })).rejects.toThrow(PolyVValidationError);
    });

    it('should validate type must be valid value', async () => {
      await expect(service.uploadDocument('3151318', {
        url: 'https://example.com/doc.pdf',
        type: 'invalid' as any,
      })).rejects.toThrow(PolyVValidationError);
    });
  });

  // ============================================
  // deleteDocument
  // ============================================

  describe('deleteDocument', () => {
    it('should call SDK deleteDocument with correct parameters', async () => {
      mockSdkClient.channel.deleteDocument.mockResolvedValueOnce(true);

      await service.deleteDocument('3151318', 'abc123', 'new');

      expect(mockSdkClient.channel.deleteDocument).toHaveBeenCalledWith(
        '3151318',
        'abc123',
        'new'
      );
    });

    it('should return true on successful deletion', async () => {
      mockSdkClient.channel.deleteDocument.mockResolvedValueOnce(true);

      const result = await service.deleteDocument('3151318', 'abc123', 'new');

      expect(result).toBe(true);
    });

    it('should validate required channelId', async () => {
      await expect(service.deleteDocument('', 'abc123', 'new')).rejects.toThrow(PolyVValidationError);
    });

    it('should validate required fileId', async () => {
      await expect(service.deleteDocument('3151318', '', 'new')).rejects.toThrow(PolyVValidationError);
    });

    it('should validate type must be valid value', async () => {
      await expect(service.deleteDocument('3151318', 'abc123', 'invalid' as any)).rejects.toThrow(PolyVValidationError);
    });
  });

  // ============================================
  // getDocumentStatus
  // ============================================

  describe('getDocumentStatus', () => {
    it('should call SDK getDocConvertStatus with correct parameters', async () => {
      mockSdkClient.channel.getDocConvertStatus.mockResolvedValueOnce(mockConvertStatusResponse);

      await service.getDocumentStatus('3151318', 'abc123');

      expect(mockSdkClient.channel.getDocConvertStatus).toHaveBeenCalledWith(
        '3151318',
        'abc123'
      );
    });

    it('should return status items', async () => {
      mockSdkClient.channel.getDocConvertStatus.mockResolvedValueOnce(mockConvertStatusResponse);

      const result = await service.getDocumentStatus('3151318', 'abc123');

      expect(result).toHaveLength(1);
      expect(result[0].fileId).toBe('abc123');
      expect(result[0].convertStatus).toBe('normal');
      expect(result[0].type).toBe('common');
      expect(result[0].totalPage).toBe(19);
      expect(result[0].imageCount).toBe(19);
    });

    it('should handle multiple fileIds', async () => {
      mockSdkClient.channel.getDocConvertStatus.mockResolvedValueOnce([
        ...mockConvertStatusResponse,
        { ...mockConvertStatusResponse[0], fileId: 'def456' },
      ]);

      const result = await service.getDocumentStatus('3151318', 'abc123,def456');

      expect(result).toHaveLength(2);
    });

    it('should validate required channelId', async () => {
      await expect(service.getDocumentStatus('', 'abc123')).rejects.toThrow(PolyVValidationError);
    });

    it('should validate required fileId', async () => {
      await expect(service.getDocumentStatus('3151318', '')).rejects.toThrow(PolyVValidationError);
    });
  });
});
