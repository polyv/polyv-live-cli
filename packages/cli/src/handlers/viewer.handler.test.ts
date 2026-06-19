/**
 * @fileoverview Unit tests for ViewerHandler
 * @author Development Team
 * @since 12.1.0
 *
 * ATDD RED PHASE - These tests will fail until viewer.handler.ts is implemented
 */

// @ts-expect-error - Module not implemented yet
import { ViewerHandler } from './viewer.handler';
// @ts-expect-error - Module not implemented yet
import { ViewerServiceSdk } from '../services/viewer-service';
import {
  ViewerServiceConfig,
  ViewerGetOptions,
  ViewerListOptions,
} from '../types/viewer';
import { AuthConfig } from '../types/auth';
import { PolyVValidationError, PolyVError } from '../utils/errors';

// Mock ViewerServiceSdk
jest.mock('../services/viewer-service');
const MockedViewerService = ViewerServiceSdk as jest.MockedClass<typeof ViewerServiceSdk>;

// Mock console methods
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('ViewerHandler (ATDD RED PHASE)', () => {
  let viewerHandler: ViewerHandler;
  let mockAuthConfig: AuthConfig;
  let mockServiceConfig: ViewerServiceConfig;
  let mockViewerService: jest.Mocked<ViewerServiceSdk>;

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

    mockViewerService = {
      getViewerRecord: jest.fn(),
      listViewerRecords: jest.fn(),
      listViewerLabels: jest.fn(),
      addViewersLabels: jest.fn(),
      removeViewersLabels: jest.fn(),
    } as any;

    try {
      MockedViewerService.mockImplementation(() => mockViewerService);
      viewerHandler = new ViewerHandler(mockAuthConfig, mockServiceConfig);
    } catch {
      // Expected to fail in RED phase
    }
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('constructor', () => {
    it('12.1-UNIT-001: should create ViewerServiceSdk with correct configuration', () => {
      expect(MockedViewerService).toHaveBeenCalledWith(mockAuthConfig, mockServiceConfig);
    });
  });

  // ============================================================
  // AC #1: viewer get command
  // ============================================================
  describe('getViewer (AC #1)', () => {
    it('12.1-UNIT-002: should get viewer details with required viewerId', async () => {
      const options: ViewerGetOptions = {
        viewerId: '2_v378gn997yovtl3p8h77db9e224t6hg9',
        output: 'table',
      };

      mockViewerService.getViewerRecord.mockResolvedValue({
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
      });

      await viewerHandler.getViewer(options);

      expect(mockViewerService.getViewerRecord).toHaveBeenCalledWith({
        viewerUnionId: '2_v378gn997yovtl3p8h77db9e224t6hg9',
      });
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('12.1-UNIT-003: should validate viewerId is required', async () => {
      const options = {
        viewerId: '',
        output: 'table' as const,
      };

      await expect(viewerHandler.getViewer(options)).rejects.toThrow(PolyVValidationError);
      await expect(viewerHandler.getViewer(options)).rejects.toThrow('观众ID是必需的');
    });

    it('12.1-UNIT-004: should output viewer details in JSON format', async () => {
      const options: ViewerGetOptions = {
        viewerId: '2_v378gn997yovtl3p8h77db9e224t6hg9',
        output: 'json',
      };

      mockViewerService.getViewerRecord.mockResolvedValue({
        viewerUnionId: '2_v378gn997yovtl3p8h77db9e224t6hg9',
        nickname: 'Test User',
        mobile: '13800138000',
        source: 'WX',
        watchDuration: 1800,
        watchChannelCount: 3,
        createTime: 1615772426000,
      });

      await viewerHandler.getViewer(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('viewerUnionId')
      );
    });

    it('12.1-UNIT-005: should output viewer details in table format', async () => {
      const options: ViewerGetOptions = {
        viewerId: '2_v378gn997yovtl3p8h77db9e224t6hg9',
        output: 'table',
      };

      mockViewerService.getViewerRecord.mockResolvedValue({
        viewerUnionId: '2_v378gn997yovtl3p8h77db9e224t6hg9',
        nickname: 'Test User',
        mobile: '13800138000',
        source: 'MOBILE',
        name: 'Jane Doe',
        email: 'jane@example.com',
        area: 'Shanghai',
        watchDuration: 7200,
        watchChannelCount: 10,
        createTime: 1615772426000,
      });

      await viewerHandler.getViewer(options);

      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('12.1-UNIT-006: should handle API errors gracefully', async () => {
      const options: ViewerGetOptions = {
        viewerId: 'nonexistent-viewer-id',
        output: 'table',
      };

      const apiError = new PolyVError('API Error: Viewer not found', 'NOT_FOUND', 404);
      mockViewerService.getViewerRecord.mockRejectedValue(apiError);

      await expect(viewerHandler.getViewer(options)).rejects.toThrow(PolyVError);
    });
  });

  // ============================================================
  // AC #2: viewer list command
  // ============================================================
  describe('listViewers (AC #2)', () => {
    it('12.1-UNIT-007: should list viewers with default pagination', async () => {
      const options: ViewerListOptions = {
        output: 'table',
      };

      mockViewerService.listViewerRecords.mockResolvedValue({
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
      });

      await viewerHandler.listViewers(options);

      expect(mockViewerService.listViewerRecords).toHaveBeenCalledWith({
        pageNumber: 1,
        pageSize: 10,
      });
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('12.1-UNIT-008: should list viewers with custom pagination', async () => {
      const options: ViewerListOptions = {
        page: 2,
        size: 20,
        output: 'table',
      };

      mockViewerService.listViewerRecords.mockResolvedValue({
        pageNumber: 2,
        pageSize: 20,
        totalPages: 5,
        totalItems: 100,
        contents: [],
      });

      await viewerHandler.listViewers(options);

      expect(mockViewerService.listViewerRecords).toHaveBeenCalledWith(
        expect.objectContaining({
          pageNumber: 2,
          pageSize: 20,
        })
      );
    });

    it('12.1-UNIT-009: should display empty message when no viewers found', async () => {
      const options: ViewerListOptions = {
        output: 'table',
      };

      mockViewerService.listViewerRecords.mockResolvedValue({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 0,
        totalItems: 0,
        contents: [],
      });

      await viewerHandler.listViewers(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('未找到观众')
      );
    });

    it('12.1-UNIT-010: should output viewer list in JSON format', async () => {
      const options: ViewerListOptions = {
        output: 'json',
      };

      mockViewerService.listViewerRecords.mockResolvedValue({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
        totalItems: 1,
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
        ],
      });

      await viewerHandler.listViewers(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('viewerUnionId')
      );
    });

    it('12.1-UNIT-011: should output viewer list in table format', async () => {
      const options: ViewerListOptions = {
        output: 'table',
      };

      mockViewerService.listViewerRecords.mockResolvedValue({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
        totalItems: 1,
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
        ],
      });

      await viewerHandler.listViewers(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('1')
      );
    });
  });

  // ============================================================
  // AC #3: Filter conditions
  // ============================================================
  describe('listViewers with filters (AC #3)', () => {
    it('12.1-UNIT-012: should filter by source (IMPORT)', async () => {
      const options: ViewerListOptions = {
        source: 'IMPORT',
        output: 'table',
      };

      mockViewerService.listViewerRecords.mockResolvedValue({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
        totalItems: 1,
        contents: [
          {
            viewerUnionId: 'viewer1',
            nickname: 'Imported User',
            mobile: '13800000001',
            source: 'IMPORT',
            watchDuration: 1000,
            watchChannelCount: 2,
            createTime: 1615772426000,
          },
        ],
      });

      await viewerHandler.listViewers(options);

      expect(mockViewerService.listViewerRecords).toHaveBeenCalledWith(
        expect.objectContaining({
          source: 'IMPORT',
        })
      );
    });

    it('12.1-UNIT-013: should filter by source (WX)', async () => {
      const options: ViewerListOptions = {
        source: 'WX',
        output: 'table',
      };

      mockViewerService.listViewerRecords.mockResolvedValue({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
        totalItems: 1,
        contents: [
          {
            viewerUnionId: 'viewer2',
            nickname: 'WeChat User',
            mobile: '13800000002',
            source: 'WX',
            watchDuration: 2000,
            watchChannelCount: 1,
            createTime: 1615772426000,
          },
        ],
      });

      await viewerHandler.listViewers(options);

      expect(mockViewerService.listViewerRecords).toHaveBeenCalledWith(
        expect.objectContaining({
          source: 'WX',
        })
      );
    });

    it('12.1-UNIT-014: should filter by source (MOBILE)', async () => {
      const options: ViewerListOptions = {
        source: 'MOBILE',
        output: 'table',
      };

      mockViewerService.listViewerRecords.mockResolvedValue({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
        totalItems: 1,
        contents: [
          {
            viewerUnionId: 'viewer3',
            nickname: 'Mobile User',
            mobile: '13800000003',
            source: 'MOBILE',
            watchDuration: 3000,
            watchChannelCount: 4,
            createTime: 1615772426000,
          },
        ],
      });

      await viewerHandler.listViewers(options);

      expect(mockViewerService.listViewerRecords).toHaveBeenCalledWith(
        expect.objectContaining({
          source: 'MOBILE',
        })
      );
    });

    it('12.1-UNIT-015: should filter by mobile number', async () => {
      const options: ViewerListOptions = {
        mobile: '13800138000',
        output: 'table',
      };

      mockViewerService.listViewerRecords.mockResolvedValue({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
        totalItems: 1,
        contents: [
          {
            viewerUnionId: 'viewer1',
            nickname: 'Test User',
            mobile: '13800138000',
            source: 'IMPORT',
            watchDuration: 3600,
            watchChannelCount: 5,
            createTime: 1615772426000,
          },
        ],
      });

      await viewerHandler.listViewers(options);

      expect(mockViewerService.listViewerRecords).toHaveBeenCalledWith(
        expect.objectContaining({
          mobile: '13800138000',
        })
      );
    });

    it('12.1-UNIT-016: should filter by email', async () => {
      const options: ViewerListOptions = {
        email: 'user@example.com',
        output: 'table',
      };

      mockViewerService.listViewerRecords.mockResolvedValue({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
        totalItems: 1,
        contents: [
          {
            viewerUnionId: 'viewer1',
            nickname: 'Test User',
            mobile: '13800138000',
            email: 'user@example.com',
            source: 'IMPORT',
            watchDuration: 1800,
            watchChannelCount: 2,
            createTime: 1615772426000,
          },
        ],
      });

      await viewerHandler.listViewers(options);

      expect(mockViewerService.listViewerRecords).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'user@example.com',
        })
      );
    });

    it('12.1-UNIT-017: should filter by area', async () => {
      const options: ViewerListOptions = {
        area: 'Beijing',
        output: 'table',
      };

      mockViewerService.listViewerRecords.mockResolvedValue({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
        totalItems: 1,
        contents: [
          {
            viewerUnionId: 'viewer1',
            nickname: 'Beijing User',
            mobile: '13800138000',
            area: 'Beijing',
            source: 'WX',
            watchDuration: 2400,
            watchChannelCount: 3,
            createTime: 1615772426000,
          },
        ],
      });

      await viewerHandler.listViewers(options);

      expect(mockViewerService.listViewerRecords).toHaveBeenCalledWith(
        expect.objectContaining({
          area: 'Beijing',
        })
      );
    });

    it('12.1-UNIT-018: should combine multiple filter conditions', async () => {
      const options: ViewerListOptions = {
        source: 'IMPORT',
        mobile: '13800138000',
        page: 1,
        size: 50,
        output: 'json',
      };

      mockViewerService.listViewerRecords.mockResolvedValue({
        pageNumber: 1,
        pageSize: 50,
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
      });

      await viewerHandler.listViewers(options);

      expect(mockViewerService.listViewerRecords).toHaveBeenCalledWith(
        expect.objectContaining({
          source: 'IMPORT',
          mobile: '13800138000',
          pageNumber: 1,
          pageSize: 50,
        })
      );
    });
  });

  // ============================================================
  // AC #4: Output format validation
  // ============================================================
  describe('Output Format Validation (AC #4)', () => {
    it('12.1-UNIT-019: should validate output must be table or json', async () => {
      const options = {
        viewerId: 'test-viewer-id',
        output: 'xml' as any,
      };

      await expect(viewerHandler.getViewer(options)).rejects.toThrow(PolyVValidationError);
      await expect(viewerHandler.getViewer(options)).rejects.toThrow(
        '输出格式必须是 "table" 或 "json"'
      );
    });

    it('12.1-UNIT-020: should default to table output', async () => {
      const options: ViewerGetOptions = {
        viewerId: 'test-viewer-id',
      };

      mockViewerService.getViewerRecord.mockResolvedValue({
        viewerUnionId: 'test-viewer-id',
        nickname: 'Test User',
        mobile: '13800138000',
        source: 'IMPORT',
        watchDuration: 1000,
        watchChannelCount: 2,
        createTime: 1615772426000,
      });

      await viewerHandler.getViewer(options);

      expect(mockConsoleLog).toHaveBeenCalled();
    });
  });

  // ============================================================
  // AC #7: Error handling
  // ============================================================
  describe('Error Handling (AC #7)', () => {
    it('12.1-UNIT-021: should show friendly error for empty viewerId', async () => {
      const options = {
        viewerId: '',
        output: 'table' as const,
      };

      await expect(viewerHandler.getViewer(options)).rejects.toThrow(PolyVValidationError);
      await expect(viewerHandler.getViewer(options)).rejects.toThrow('观众ID是必需的');
    });

    it('12.1-UNIT-022: should handle API 401 error (authentication failed)', async () => {
      const options: ViewerGetOptions = {
        viewerId: 'test-viewer-id',
        output: 'table',
      };

      const apiError = new PolyVError('Request failed with status code 401', 'AUTH_ERROR', 401);
      mockViewerService.getViewerRecord.mockRejectedValue(apiError);

      await expect(viewerHandler.getViewer(options)).rejects.toThrow();
    });

    it('12.1-UNIT-023: should handle API 403 error (permission denied)', async () => {
      const options: ViewerGetOptions = {
        viewerId: 'test-viewer-id',
        output: 'table',
      };

      const apiError = new PolyVError('Request failed with status code 403', 'FORBIDDEN', 403);
      mockViewerService.getViewerRecord.mockRejectedValue(apiError);

      await expect(viewerHandler.getViewer(options)).rejects.toThrow();
    });

    it('12.1-UNIT-024: should handle API 404 error (viewer not found)', async () => {
      const options: ViewerGetOptions = {
        viewerId: 'nonexistent-viewer-id',
        output: 'table',
      };

      const apiError = new PolyVError('Request failed with status code 404', 'NOT_FOUND', 404);
      mockViewerService.getViewerRecord.mockRejectedValue(apiError);

      await expect(viewerHandler.getViewer(options)).rejects.toThrow();
    });

    it('12.1-UNIT-025: should handle API 500 error (internal server error)', async () => {
      const options: ViewerListOptions = {
        output: 'table',
      };

      const apiError = new PolyVError('Request failed with status code 500', 'SERVER_ERROR', 500);
      mockViewerService.listViewerRecords.mockRejectedValue(apiError);

      await expect(viewerHandler.listViewers(options)).rejects.toThrow();
    });

    it('12.1-UNIT-026: should handle network timeout errors', async () => {
      const options: ViewerGetOptions = {
        viewerId: 'test-viewer-id',
        output: 'table',
      };

      const apiError = new PolyVError('timeout of 30000ms exceeded', 'TIMEOUT', -1);
      mockViewerService.getViewerRecord.mockRejectedValue(apiError);

      await expect(viewerHandler.getViewer(options)).rejects.toThrow();
    });
  });

  // ============================================================
  // AC #8: Table output format
  // ============================================================
  describe('Table Output Format (AC #8)', () => {
    it('12.1-UNIT-027: should display viewer get as key-value table', async () => {
      const options: ViewerGetOptions = {
        viewerId: 'test-viewer-id',
        output: 'table',
      };

      mockViewerService.getViewerRecord.mockResolvedValue({
        viewerUnionId: 'test-viewer-id',
        nickname: 'Test User',
        mobile: '13800138000',
        source: 'IMPORT',
        name: 'John Doe',
        email: 'test@example.com',
        area: 'Beijing',
        watchDuration: 3661, // 1 hour 1 minute 1 second
        watchChannelCount: 5,
        createTime: 1615772426000,
      });

      await viewerHandler.getViewer(options);

      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('12.1-UNIT-028: should display viewer list with proper columns', async () => {
      const options: ViewerListOptions = {
        output: 'table',
      };

      mockViewerService.listViewerRecords.mockResolvedValue({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
        totalItems: 1,
        contents: [
          {
            viewerUnionId: 'test-viewer-id',
            nickname: 'Test User',
            mobile: '13800138000',
            source: 'WX',
            watchDuration: 3661,
            watchChannelCount: 5,
            createTime: 1615772426000,
          },
        ],
      });

      await viewerHandler.listViewers(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('1')
      );
    });

    it('12.1-UNIT-029: should truncate long IDs in table output', async () => {
      const options: ViewerListOptions = {
        output: 'table',
      };

      const longId = '2_v378gn997yovtl3p8h77db9e224t6hg9_very_long_suffix';
      mockViewerService.listViewerRecords.mockResolvedValue({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
        totalItems: 1,
        contents: [
          {
            viewerUnionId: longId,
            nickname: 'Test User',
            mobile: '13800138000',
            source: 'IMPORT',
            watchDuration: 1000,
            watchChannelCount: 2,
            createTime: 1615772426000,
          },
        ],
      });

      await viewerHandler.listViewers(options);

      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('12.1-UNIT-030: should format time fields properly', async () => {
      const options: ViewerGetOptions = {
        viewerId: 'test-viewer-id',
        output: 'table',
      };

      mockViewerService.getViewerRecord.mockResolvedValue({
        viewerUnionId: 'test-viewer-id',
        nickname: 'Test User',
        mobile: '13800138000',
        source: 'MOBILE',
        watchDuration: 7322, // 2 hours 2 minutes 2 seconds
        watchChannelCount: 10,
        createTime: 1615772426000,
      });

      await viewerHandler.getViewer(options);

      expect(mockConsoleLog).toHaveBeenCalled();
    });
  });

  // ============================================================
  // Pagination validation
  // ============================================================
  describe('Pagination Validation', () => {
    it('should validate page must be a positive integer', async () => {
      const options = {
        page: -1,
        output: 'table' as const,
      };

      await expect(viewerHandler.listViewers(options)).rejects.toThrow(PolyVValidationError);
    });

    it('should validate size must be a positive integer', async () => {
      const options = {
        size: 0,
        output: 'table' as const,
      };

      await expect(viewerHandler.listViewers(options)).rejects.toThrow(PolyVValidationError);
    });

    it('should validate size must not exceed 1000', async () => {
      const options = {
        size: 1001,
        output: 'table' as const,
      };

      await expect(viewerHandler.listViewers(options)).rejects.toThrow(PolyVValidationError);
    });
  });

  // ============================================================
  // Story 12-2: Viewer Tag Management
  // ============================================================
  describe('listViewerTags (Story 12-2, AC #3)', () => {
    it('12.2-UNIT-001: should list viewer tags with default pagination', async () => {
        const options = {
          output: 'table' as const,
        };

        mockViewerService.listViewerLabels = jest.fn().mockResolvedValue({
          contents: [
            { labelId: 1, labelName: 'VIP' },
            { labelId: 2, labelName: 'Premium' },
            { labelId: 3, labelName: 'New User' },
          ],
        });

        await viewerHandler.listViewerTags(options);

        expect(mockViewerService.listViewerLabels).toHaveBeenCalled();
        expect(mockConsoleLog).toHaveBeenCalled();
      });

      it('12.2-UNIT-002: should list viewer tags with keyword filter', async () => {
        const options = {
          keyword: 'VIP',
          output: 'table' as const,
        };

        mockViewerService.listViewerLabels = jest.fn().mockResolvedValue({
          contents: [
            { labelId: 1, labelName: 'VIP' },
          ],
        });

        await viewerHandler.listViewerTags(options);

        expect(mockViewerService.listViewerLabels).toHaveBeenCalled();
      });

      it('12.2-UNIT-003: should list viewer tags with custom pagination', async () => {
        const options = {
          page: 1,
          size: 20,
          output: 'table' as const,
        };

        mockViewerService.listViewerLabels = jest.fn().mockResolvedValue({
          contents: [
            { labelId: 1, labelName: 'VIP' },
            { labelId: 2, labelName: 'Premium' },
          ],
        });

        await viewerHandler.listViewerTags(options);

        expect(mockViewerService.listViewerLabels).toHaveBeenCalled();
      });

      it('12.2-UNIT-004: should output tag list in JSON format', async () => {
        const options = {
          output: 'json' as const,
        };

        mockViewerService.listViewerLabels = jest.fn().mockResolvedValue({
          contents: [
            { labelId: 1, labelName: 'VIP' },
          ],
        });

        await viewerHandler.listViewerTags(options);

        expect(mockConsoleLog).toHaveBeenCalledWith(
          expect.stringContaining('labelId')
        );
      });

      it('12.2-UNIT-005: should display tag list in table format', async () => {
        const options = {
          output: 'table' as const,
        };

        mockViewerService.listViewerLabels = jest.fn().mockResolvedValue({
          contents: [
            { labelId: 1, labelName: 'VIP User with Long Name' },
          ],
        });

        await viewerHandler.listViewerTags(options);

        expect(mockConsoleLog).toHaveBeenCalled();
      });

      it('12.2-UNIT-006: should display empty message when no tags found', async () => {
        const options = {
          output: 'table' as const,
        };

        mockViewerService.listViewerLabels = jest.fn().mockResolvedValue({
          contents: [],
        });

        await viewerHandler.listViewerTags(options);

        expect(mockConsoleLog).toHaveBeenCalledWith(
          expect.stringContaining('未找到标签')
        );
      });
    });

    describe('addViewerTag (Story 12-2, AC #1)', () => {
      it('12.2-UNIT-007: should add single label to single viewer', async () => {
        const options = {
          viewerIds: 'viewer1',
          labelIds: '1',
          force: true,
          output: 'table' as const,
        };

        mockViewerService.addViewersLabels = jest.fn().mockResolvedValue({
          total: 1,
          succeeded: 1,
          failed: 0,
          results: [{ viewerUnionId: 'viewer1', labelId: 1, success: true }],
        });

        await viewerHandler.addViewerTag(options);

        expect(mockViewerService.addViewersLabels).toHaveBeenCalledWith(
          ['viewer1'],
          [1],
          undefined
        );
        expect(mockConsoleLog).toHaveBeenCalled();
      });

      it('12.2-UNIT-008: should add multiple labels to multiple viewers (batch)', async () => {
        const options = {
          viewerIds: 'viewer1,viewer2,viewer3',
          labelIds: '1,2,3',
          force: true,
          output: 'table' as const,
        };

        mockViewerService.addViewersLabels = jest.fn().mockResolvedValue({
          total: 1,
          succeeded: 1,
          failed: 0,
          results: [{ viewerUnionId: 'viewer1', labelId: 1, success: true }],
        });

        await viewerHandler.addViewerTag(options);

        expect(mockViewerService.addViewersLabels).toHaveBeenCalledWith(
          ['viewer1', 'viewer2', 'viewer3'],
          [1, 2, 3],
          undefined
        );
      });

      it('12.2-UNIT-009: should validate empty viewerIds', async () => {
        const options = {
          viewerIds: '',
          labelIds: '1',
          output: 'table' as const,
        };

        await expect(viewerHandler.addViewerTag(options)).rejects.toThrow(PolyVValidationError);
        await expect(viewerHandler.addViewerTag(options)).rejects.toThrow('观众ID列表是必需的');
      });

      it('12.2-UNIT-010: should validate empty labelIds', async () => {
        const options = {
          viewerIds: 'viewer1',
          labelIds: '',
          output: 'table' as const,
        };

        await expect(viewerHandler.addViewerTag(options)).rejects.toThrow(PolyVValidationError);
        await expect(viewerHandler.addViewerTag(options)).rejects.toThrow('标签ID列表是必需的');
      });

      it('12.2-UNIT-011: should validate invalid label ID format', async () => {
        const options = {
          viewerIds: 'viewer1',
          labelIds: 'abc,def',
          output: 'table' as const,
        };

        await expect(viewerHandler.addViewerTag(options)).rejects.toThrow(PolyVValidationError);
        await expect(viewerHandler.addViewerTag(options)).rejects.toThrow('标签ID格式无效，必须是正整数');
      });

      it('should reject zero and negative label IDs before calling the API', async () => {
        const options = {
          viewerIds: 'viewer1',
          labelIds: '0,-1',
          output: 'table' as const,
        };

        await expect(viewerHandler.addViewerTag(options)).rejects.toThrow(PolyVValidationError);
        expect(mockViewerService.addViewersLabels).not.toHaveBeenCalled();
      });

      it('12.2-UNIT-012: should output add result in JSON format', async () => {
        const options = {
          viewerIds: 'viewer1,viewer2',
          labelIds: '1,2',
          force: true,
          output: 'json' as const,
        };

        mockViewerService.addViewersLabels = jest.fn().mockResolvedValue({
          total: 1,
          succeeded: 1,
          failed: 0,
          results: [{ viewerUnionId: 'viewer1', labelId: 1, success: true }],
        });

        await viewerHandler.addViewerTag(options);

        expect(mockConsoleLog).toHaveBeenCalledWith(
          expect.stringContaining('viewer1')
        );
      });
    });

    describe('removeViewerTag (Story 12-2, AC #2)', () => {
      it('12.2-UNIT-013: should remove single label from single viewer', async () => {
        const options = {
          viewerIds: 'viewer1',
          labelIds: '1',
          force: true,
          output: 'table' as const,
        };

        mockViewerService.removeViewersLabels = jest.fn().mockResolvedValue({
          total: 1,
          succeeded: 1,
          failed: 0,
          results: [{ viewerUnionId: 'viewer1', labelId: 1, success: true }],
        });

        await viewerHandler.removeViewerTag(options);

        expect(mockViewerService.removeViewersLabels).toHaveBeenCalledWith(
          ['viewer1'],
          [1],
          undefined
        );
        expect(mockConsoleLog).toHaveBeenCalled();
      });

      it('12.2-UNIT-014: should remove multiple labels from multiple viewers (batch)', async () => {
        const options = {
          viewerIds: 'viewer1,viewer2',
          labelIds: '1,2,3',
          force: true,
          output: 'table' as const,
        };

        mockViewerService.removeViewersLabels = jest.fn().mockResolvedValue({
          total: 1,
          succeeded: 1,
          failed: 0,
          results: [{ viewerUnionId: 'viewer1', labelId: 1, success: true }],
        });

        await viewerHandler.removeViewerTag(options);

        expect(mockViewerService.removeViewersLabels).toHaveBeenCalledWith(
          ['viewer1', 'viewer2'],
          [1, 2, 3],
          undefined
        );
      });

      it('12.2-UNIT-015: should validate empty viewerIds', async () => {
        const options = {
          viewerIds: '',
          labelIds: '1',
          output: 'table' as const,
        };

        await expect(viewerHandler.removeViewerTag(options)).rejects.toThrow(PolyVValidationError);
        await expect(viewerHandler.removeViewerTag(options)).rejects.toThrow('观众ID列表是必需的');
      });

      it('12.2-UNIT-016: should validate empty labelIds', async () => {
        const options = {
          viewerIds: 'viewer1',
          labelIds: '',
          output: 'table' as const,
        };

        await expect(viewerHandler.removeViewerTag(options)).rejects.toThrow(PolyVValidationError);
        await expect(viewerHandler.removeViewerTag(options)).rejects.toThrow('标签ID列表是必需的');
      });

      it('12.2-UNIT-017: should output remove result in JSON format', async () => {
        const options = {
          viewerIds: 'viewer1,viewer2',
          labelIds: '1,2',
          force: true,
          output: 'json' as const,
        };

        mockViewerService.removeViewersLabels = jest.fn().mockResolvedValue({
          total: 1,
          succeeded: 1,
          failed: 0,
          results: [{ viewerUnionId: 'viewer1', labelId: 1, success: true }],
        });

        await viewerHandler.removeViewerTag(options);

        expect(mockConsoleLog).toHaveBeenCalledWith(
          expect.stringContaining('viewer1')
        );
      });
    });

    describe('Error Handling (Story 12-2, AC #7)', () => {
      it('12.2-UNIT-018: should handle API 401 error for tag operations', async () => {
        const options = {
          viewerIds: 'viewer1',
          labelIds: '1',
          force: true,
          output: 'table' as const,
        };

        const apiError = new PolyVError('Request failed with status code 401', 'AUTH_ERROR', 401);
        mockViewerService.addViewersLabels = jest.fn().mockRejectedValue(apiError);

        await expect(viewerHandler.addViewerTag(options)).rejects.toThrow();
      });

      it('12.2-UNIT-019: should handle API 403 error for tag operations', async () => {
        const options = {
          output: 'table' as const,
        };

        const apiError = new PolyVError('Request failed with status code 403', 'FORBIDDEN', 403);
        mockViewerService.listViewerLabels = jest.fn().mockRejectedValue(apiError);

        await expect(viewerHandler.listViewerTags(options)).rejects.toThrow();
      });

      it('12.2-UNIT-020: should handle API 500 error for tag operations', async () => {
        const options = {
          viewerIds: 'viewer1',
          labelIds: '1',
          force: true,
          output: 'table' as const,
        };

        const apiError = new PolyVError('Request failed with status code 500', 'SERVER_ERROR', 500);
        mockViewerService.removeViewersLabels = jest.fn().mockRejectedValue(apiError);

        await expect(viewerHandler.removeViewerTag(options)).rejects.toThrow();
      });
    });
});
