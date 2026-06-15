/**
 * @fileoverview Unit tests for ViewerServiceSdk
 * @author Development Team
 * @since 12.1.0
 *
 * ATDD RED PHASE - These tests will fail until viewer-service.ts is implemented
 */

// @ts-expect-error - Module not implemented yet
import { ViewerServiceSdk } from './viewer-service';
import { AuthConfig } from '../types/auth';
import { ViewerServiceConfig } from '../types/viewer';
import { PolyVError } from '../utils/errors';

// Mock PolyVClient
jest.mock('polyv-live-api-sdk', () => ({
  PolyVClient: jest.fn().mockImplementation(() => ({
    v4User: {
      getViewerRecord: jest.fn(),
      listViewerRecords: jest.fn(),
      listViewerLabels: jest.fn(),
      addViewerLabel: jest.fn(),
      deleteViewerLabelRef: jest.fn(),
    },
  })),
}));

describe('ViewerServiceSdk (ATDD RED PHASE)', () => {
  let viewerService: ViewerServiceSdk;
  let mockAuthConfig: AuthConfig;
  let mockServiceConfig: ViewerServiceConfig;
  let mockV4User: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAuthConfig = {
      appId: 'test-app-id',
      appSecret: 'test-app-secret',
      userId: 'test-user-id',
    };

    mockServiceConfig = {
      baseUrl: 'https://api.polyv.net',
      timeout: 30000,
      debug: false,
    };

    // Create mock v4User methods
    mockV4User = {
      getViewerRecord: jest.fn(),
      listViewerRecords: jest.fn(),
      listViewerLabels: jest.fn(),
      addViewerLabel: jest.fn(),
      deleteViewerLabelRef: jest.fn(),
    };

    // Get the mocked PolyVClient constructor
    const { PolyVClient } = require('polyv-live-api-sdk');
    PolyVClient.mockImplementation(() => ({
      v4User: mockV4User,
    }));

    try {
      viewerService = new ViewerServiceSdk(mockAuthConfig, mockServiceConfig);
    } catch {
      // Expected to fail in RED phase
    }
  });

  describe('constructor', () => {
    it('12.1-SVC-000: should create PolyVClient with auth config', () => {
      const { PolyVClient } = require('polyv-live-api-sdk');
      expect(PolyVClient).toHaveBeenCalledWith(mockAuthConfig);
    });
  });

  // ============================================================
  // AC #1: getViewerRecord
  // ============================================================
  describe('getViewerRecord (AC #1)', () => {
    it('12.1-SVC-001: should call v4User.getViewerRecord for get operations', async () => {
      const mockViewerRecord = {
        viewerUnionId: '2_v378gn997yovtl3p8h77db9e224t6hg9',
        nickname: 'Test User',
        mobile: '13800138000',
        source: 'IMPORT',
        name: 'John Doe',
        email: 'test@example.com',
        area: 'Beijing',
        watchDuration: 3600,
        watchChannelCount: 5,
        createTime: 1615772426000,
      };

      mockV4User.getViewerRecord.mockResolvedValue(mockViewerRecord);

      const result = await viewerService.getViewerRecord({
        viewerUnionId: '2_v378gn997yovtl3p8h77db9e224t6hg9',
      });

      expect(mockV4User.getViewerRecord).toHaveBeenCalledWith({
        viewerUnionId: '2_v378gn997yovtl3p8h77db9e224t6hg9',
      });
      expect(result).toEqual(mockViewerRecord);
    });

    it('should wrap SDK errors with PolyVError', async () => {
      const sdkError = new Error('SDK error');
      mockV4User.getViewerRecord.mockRejectedValue(sdkError);

      await expect(viewerService.getViewerRecord({
        viewerUnionId: 'test-viewer-id',
      })).rejects.toThrow(PolyVError);
    });

    it('should preserve PolyVError instances', async () => {
      const polyvError = new PolyVError('Custom error', 'CUSTOM_ERROR', 400);
      mockV4User.getViewerRecord.mockRejectedValue(polyvError);

      await expect(viewerService.getViewerRecord({
        viewerUnionId: 'test-viewer-id',
      })).rejects.toThrow(polyvError);
    });
  });

  // ============================================================
  // AC #2, #3: listViewerRecords
  // ============================================================
  describe('listViewerRecords (AC #2, #3)', () => {
    it('12.1-SVC-002: should call v4User.listViewerRecords for list operations', async () => {
      const mockResponse = {
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
        totalItems: 2,
        contents: [
          {
            viewerUnionId: 'viewer1',
            nickname: 'User 1',
            mobile: '13800000001',
            source: 'IMPORT',
            watchDuration: 3600,
            watchChannelCount: 3,
            createTime: 1615772426000,
          },
          {
            viewerUnionId: 'viewer2',
            nickname: 'User 2',
            mobile: '13800000002',
            source: 'WX',
            watchDuration: 1800,
            watchChannelCount: 1,
            createTime: 1615858826000,
          },
        ],
      };

      mockV4User.listViewerRecords.mockResolvedValue(mockResponse);

      const result = await viewerService.listViewerRecords({
        pageNumber: 1,
        pageSize: 10,
      });

      expect(mockV4User.listViewerRecords).toHaveBeenCalledWith({
        pageNumber: 1,
        pageSize: 10,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should pass filter parameters to SDK', async () => {
      const mockResponse = {
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
        totalItems: 1,
        contents: [
          {
            viewerUnionId: 'viewer1',
            nickname: 'Filtered User',
            mobile: '13800138000',
            source: 'IMPORT',
            watchDuration: 5000,
            watchChannelCount: 8,
            createTime: 1615772426000,
          },
        ],
      };

      mockV4User.listViewerRecords.mockResolvedValue(mockResponse);

      await viewerService.listViewerRecords({
        pageNumber: 1,
        pageSize: 50,
        source: 'IMPORT',
        mobile: '13800138000',
        email: 'test@example.com',
        area: 'Beijing',
      });

      expect(mockV4User.listViewerRecords).toHaveBeenCalledWith({
        pageNumber: 1,
        pageSize: 50,
        source: 'IMPORT',
        mobile: '13800138000',
        email: 'test@example.com',
        area: 'Beijing',
      });
    });

    it('should wrap SDK errors with PolyVError', async () => {
      const sdkError = new Error('SDK error');
      mockV4User.listViewerRecords.mockRejectedValue(sdkError);

      await expect(viewerService.listViewerRecords({
        pageNumber: 1,
        pageSize: 10,
      })).rejects.toThrow(PolyVError);
    });

    it('should preserve PolyVError instances', async () => {
      const polyvError = new PolyVError('Custom error', 'CUSTOM_ERROR', 400);
      mockV4User.listViewerRecords.mockRejectedValue(polyvError);

      await expect(viewerService.listViewerRecords({
        pageNumber: 1,
        pageSize: 10,
      })).rejects.toThrow(polyvError);
    });

    it('should handle empty results', async () => {
      const mockResponse = {
        pageNumber: 1,
        pageSize: 10,
        totalPages: 0,
        totalItems: 0,
        contents: [],
      };

      mockV4User.listViewerRecords.mockResolvedValue(mockResponse);

      const result = await viewerService.listViewerRecords({
        pageNumber: 1,
        pageSize: 10,
      });

      expect(result.totalItems).toBe(0);
      expect(result.contents).toEqual([]);
    });
  });

  // ============================================================
  // Story 12-2: Viewer Tag Methods
  // ============================================================
  describe('listViewerLabels (Story 12-2, AC #3)', () => {
    it('12.2-SVC-001: should call v4User.listViewerLabels', async () => {
      const mockResponse = {
        contents: [
          { labelId: 1, labelName: 'VIP' },
          { labelId: 2, labelName: 'Premium' },
          { labelId: 3, labelName: 'New User' },
        ],
      };

      mockV4User.listViewerLabels.mockResolvedValue(mockResponse);

      const result = await viewerService.listViewerLabels();

      expect(mockV4User.listViewerLabels).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it('12.2-SVC-002: should wrap SDK errors with PolyVError', async () => {
      const sdkError = new Error('SDK error');
      mockV4User.listViewerLabels.mockRejectedValue(sdkError);

      await expect(viewerService.listViewerLabels()).rejects.toThrow(PolyVError);
    });

    it('12.2-SVC-003: should handle empty label list', async () => {
      const mockResponse = {
        contents: [],
      };

      mockV4User.listViewerLabels.mockResolvedValue(mockResponse);

      const result = await viewerService.listViewerLabels();

      expect(result.contents).toEqual([]);
    });
  });

  describe('addViewersLabels (Story 12-2, AC #1)', () => {
    it('12.2-SVC-004: should add single label to single viewer', async () => {
      mockV4User.addViewerLabel.mockResolvedValue(undefined);

      await viewerService.addViewersLabels(['viewer1'], [1]);

      expect(mockV4User.addViewerLabel).toHaveBeenCalledWith({
        viewerUnionId: 'viewer1',
        labelId: 1,
      });
    });

    it('12.2-SVC-005: should add multiple labels to multiple viewers (batch)', async () => {
      mockV4User.addViewerLabel.mockResolvedValue(undefined);

      await viewerService.addViewersLabels(['viewer1', 'viewer2'], [1, 2]);

      // Should be called 4 times (2 viewers x 2 labels)
      expect(mockV4User.addViewerLabel).toHaveBeenCalledTimes(4);
      expect(mockV4User.addViewerLabel).toHaveBeenCalledWith({
        viewerUnionId: 'viewer1',
        labelId: 1,
      });
      expect(mockV4User.addViewerLabel).toHaveBeenCalledWith({
        viewerUnionId: 'viewer1',
        labelId: 2,
      });
      expect(mockV4User.addViewerLabel).toHaveBeenCalledWith({
        viewerUnionId: 'viewer2',
        labelId: 1,
      });
      expect(mockV4User.addViewerLabel).toHaveBeenCalledWith({
        viewerUnionId: 'viewer2',
        labelId: 2,
      });
    });

    it('12.2-SVC-006: should wrap SDK errors with PolyVError', async () => {
      const sdkError = new Error('SDK error');
      mockV4User.addViewerLabel.mockRejectedValue(sdkError);

      await expect(viewerService.addViewersLabels(['viewer1'], [1])).rejects.toThrow(PolyVError);
    });
  });

  describe('removeViewersLabels (Story 12-2, AC #2)', () => {
    it('12.2-SVC-007: should remove single label from single viewer', async () => {
      mockV4User.deleteViewerLabelRef.mockResolvedValue(undefined);

      await viewerService.removeViewersLabels(['viewer1'], [1]);

      expect(mockV4User.deleteViewerLabelRef).toHaveBeenCalledWith({
        viewerUnionId: 'viewer1',
        labelId: 1,
      });
    });

    it('12.2-SVC-008: should remove multiple labels from multiple viewers (batch)', async () => {
      mockV4User.deleteViewerLabelRef.mockResolvedValue(undefined);

      await viewerService.removeViewersLabels(['viewer1', 'viewer2'], [1, 2]);

      // Should be called 4 times (2 viewers x 2 labels)
      expect(mockV4User.deleteViewerLabelRef).toHaveBeenCalledTimes(4);
    });

    it('12.2-SVC-009: should wrap SDK errors with PolyVError', async () => {
      const sdkError = new Error('SDK error');
      mockV4User.deleteViewerLabelRef.mockRejectedValue(sdkError);

      await expect(viewerService.removeViewersLabels(['viewer1'], [1])).rejects.toThrow(PolyVError);
    });
  });

  // ============================================================
  // Error handling
  // ============================================================
  describe('Error Handling', () => {
    it('should handle network timeout errors', async () => {
      const timeoutError = new Error('timeout of 30000ms exceeded');
      mockV4User.getViewerRecord.mockRejectedValue(timeoutError);

      await expect(viewerService.getViewerRecord({
        viewerUnionId: 'test-viewer-id',
      })).rejects.toThrow('getViewerRecord failed');
    });

    it('should handle authentication errors', async () => {
      const authError = new Error('Invalid appId or appSecret');
      mockV4User.listViewerRecords.mockRejectedValue(authError);

      await expect(viewerService.listViewerRecords({
        pageNumber: 1,
        pageSize: 10,
      })).rejects.toThrow('listViewerRecords failed');
    });

    it('should handle rate limit errors', async () => {
      const rateLimitError = new Error('Rate limit exceeded');
      mockV4User.getViewerRecord.mockRejectedValue(rateLimitError);

      await expect(viewerService.getViewerRecord({
        viewerUnionId: 'test-viewer-id',
      })).rejects.toThrow('getViewerRecord failed');
    });
  });
});
