/**
 * StatisticsService Export Methods Tests - ATDD Failing Tests (RED Phase)
 * @story 10.4: 统计报表导出命令
 *
 * These tests will FAIL until the feature is implemented (TDD red phase)
 *
 * Acceptance Criteria:
 * - AC1: `statistics export viewlog` 命令支持导出频道观看日志数据
 * - AC2: `statistics export session` 命令支持导出频道场次报表（返回下载链接）
 * - AC3: `viewlog` 命令支持 `--start-time` 和 `--end-time` 参数按时间范围过滤
 * - AC4: `viewlog` 命令支持 `--watch-type` 参数过滤观看类型（live/vod）
 * - AC6: `session` 命令需要 `--session-id` 参数指定场次
 * - AC7: `session` 命令返回报表下载链接
 * - AC10: 支持 `--channel-id` 参数指定频道（viewlog 必需，session 可选）
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { PolyVClient } from '../client.js';
import { StatisticsService } from './statistics.service.js';
import type {
  GetViewlogParams,
  GetViewlogResponse,
  ExportSessionStatsParams,
  ExportSessionStatsResponse,
} from '../types/statistics-export.js';
import { PolyVValidationError } from '../errors/polyv-validation-error.js';

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(),
    isCancel: vi.fn(),
    isAxiosError: vi.fn(),
  },
}));

// Test fixtures
const testConfig = {
  appId: 'test-app-id',
  appSecret: 'test-app-secret',
};

// Mock viewlog response from API documentation
const mockViewlogResponse: GetViewlogResponse = {
  pageSize: 1000,
  pageNumber: 1,
  totalItems: 1,
  totalPages: 1,
  contents: [
    {
      playId: '1648432513206X1501461',
      userId: '1b448be323',
      channelId: '2909053',
      playDuration: 87,
      stayDuration: 90,
      sessionId: 'g83wdgxfh6',
      param1: '1648432461504',
      param2: '回放列表观看',
      param3: 'vod',
      ipAddress: '120.228.5.164',
      country: '中国',
      province: '湖南',
      city: '长沙',
      isp: '移动',
      referer: 'https://live.polyv.cn/watch/2909053',
      userAgent: 'Mozilla/5.0...',
      operatingSystem: 'Windows',
      browser: 'Chrome 9',
      isMobile: 'N',
      currentDay: '2022-03-28',
      createdTime: 1648432556000,
      lastModified: 1648443664000,
      ptype: 0,
      firstActiveTime: 1648432516000,
      lastActiveTime: 1648432606000,
    },
  ],
};

// Mock session stats export response
const mockSessionExportResponse: ExportSessionStatsResponse = {
  downloadUrl: 'https://liveimages.videocc.net/xx/xxx/xx.xlsx',
};

describe('StatisticsService Export Methods (Story 10.4 - ATDD RED Phase)', () => {
  let mockAxiosInstance: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
    request: ReturnType<typeof vi.fn>;
    interceptors: {
      request: { use: ReturnType<typeof vi.fn> };
      response: { use: ReturnType<typeof vi.fn> };
    };
    defaults: {
      baseURL: string;
      timeout: number;
      headers: Record<string, string>;
    };
  };
  let client: PolyVClient;
  let statisticsService: StatisticsService;

  beforeEach(() => {
    vi.clearAllMocks();

    mockAxiosInstance = {
      get: vi.fn().mockResolvedValue({ result: [] }),
      post: vi.fn().mockResolvedValue({}),
      put: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({}),
      patch: vi.fn().mockResolvedValue({}),
      request: vi.fn().mockResolvedValue({}),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
      defaults: {
        baseURL: 'https://api.polyv.net/live/v3',
        timeout: 30000,
        headers: {},
      },
    };

    (axios.create as ReturnType<typeof vi.fn>).mockReturnValue(mockAxiosInstance);
    client = new PolyVClient(testConfig);
    statisticsService = new StatisticsService(client);
  });

  // ============================================
  // AC1: getViewlog - Export Viewlog Data
  // ============================================

  describe('getViewlog (AC1, AC3, AC4, AC10)', () => {
    it('should call API with correct endpoint and parameters', async () => {
      // THIS TEST WILL FAIL - Method not implemented yet
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockViewlogResponse });

      const params: GetViewlogParams = {
        channelId: '3151318',
        startDate: '2024-01-01 00:00:00',
        endDate: '2024-01-31 23:59:59',
      };

      await statisticsService.getViewlog(params);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v3/user/statistics/viewlog',
        { params: expect.objectContaining(params) }
      );
    });

    it('should return viewlog data with pagination info', async () => {
      // THIS TEST WILL FAIL - Method not implemented yet
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockViewlogResponse });

      const params: GetViewlogParams = {
        channelId: '3151318',
        startDate: '2024-01-01 00:00:00',
        endDate: '2024-01-31 23:59:59',
      };

      const result = await statisticsService.getViewlog(params);

      expect(result.pageSize).toBe(1000);
      expect(result.pageNumber).toBe(1);
      expect(result.totalItems).toBe(1);
      expect(result.contents).toHaveLength(1);
    });

    it('should return viewlog item with all expected fields', async () => {
      // THIS TEST WILL FAIL - Method not implemented yet
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockViewlogResponse });

      const params: GetViewlogParams = {
        channelId: '3151318',
        startDate: '2024-01-01 00:00:00',
        endDate: '2024-01-31 23:59:59',
      };

      const result = await statisticsService.getViewlog(params);

      const item = result.contents[0];
      expect(item.playId).toBe('1648432513206X1501461');
      expect(item.channelId).toBe('2909053');
      expect(item.playDuration).toBe(87);
      expect(item.stayDuration).toBe(90);
      expect(item.param3).toBe('vod');
    });
  });

  // ============================================
  // AC3: Date Time Range Parameters
  // ============================================

  describe('getViewlog date time parameters (AC3)', () => {
    it('should accept startDate and endDate in yyyy-MM-dd HH:mm:ss format', async () => {
      // THIS TEST WILL FAIL - Method not implemented yet
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockViewlogResponse });

      const params: GetViewlogParams = {
        channelId: '3151318',
        startDate: '2024-01-01 00:00:00',
        endDate: '2024-01-31 23:59:59',
      };

      await expect(statisticsService.getViewlog(params)).resolves.toBeDefined();
    });

    it('should reject when startDate and endDate are not in the same month', async () => {
      // THIS TEST WILL FAIL - Method not implemented yet
      const params: GetViewlogParams = {
        channelId: '3151318',
        startDate: '2024-01-01 00:00:00',
        endDate: '2024-02-28 23:59:59', // Different month
      };

      await expect(statisticsService.getViewlog(params)).rejects.toThrow(
        'startDate and endDate must be in the same month'
      );
    });

    it('should accept dates in the same month', async () => {
      // THIS TEST WILL FAIL - Method not implemented yet
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockViewlogResponse });

      const params: GetViewlogParams = {
        channelId: '3151318',
        startDate: '2024-01-01 00:00:00',
        endDate: '2024-01-31 23:59:59',
      };

      await expect(statisticsService.getViewlog(params)).resolves.toBeDefined();
    });

    it('should reject invalid date format', async () => {
      // THIS TEST WILL FAIL - Method not implemented yet
      const params = {
        channelId: '3151318',
        startDate: '2024/01/01', // Wrong format
        endDate: '2024-01-31 23:59:59',
      } as GetViewlogParams;

      await expect(statisticsService.getViewlog(params)).rejects.toThrow(
        'startDate is required and must be in yyyy-MM-dd HH:mm:ss format'
      );
    });
  });

  // ============================================
  // AC4: Watch Type Filter
  // ============================================

  describe('getViewlog watchType parameter (AC4)', () => {
    it('should accept "live" watchType', async () => {
      // THIS TEST WILL FAIL - Method not implemented yet
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockViewlogResponse });

      const params: GetViewlogParams = {
        channelId: '3151318',
        startDate: '2024-01-01 00:00:00',
        endDate: '2024-01-31 23:59:59',
        watchType: 'live',
      };

      await statisticsService.getViewlog(params);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v3/user/statistics/viewlog',
        { params: expect.objectContaining({ watchType: 'live' }) }
      );
    });

    it('should accept "vod" watchType', async () => {
      // THIS TEST WILL FAIL - Method not implemented yet
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockViewlogResponse });

      const params: GetViewlogParams = {
        channelId: '3151318',
        startDate: '2024-01-01 00:00:00',
        endDate: '2024-01-31 23:59:59',
        watchType: 'vod',
      };

      await statisticsService.getViewlog(params);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v3/user/statistics/viewlog',
        { params: expect.objectContaining({ watchType: 'vod' }) }
      );
    });

    it('should reject invalid watchType', async () => {
      // THIS TEST WILL FAIL - Method not implemented yet
      const params = {
        channelId: '3151318',
        startDate: '2024-01-01 00:00:00',
        endDate: '2024-01-31 23:59:59',
        watchType: 'invalid',
      } as GetViewlogParams;

      await expect(statisticsService.getViewlog(params)).rejects.toThrow(
        'watchType must be either "live" or "vod"'
      );
    });
  });

  // ============================================
  // AC10: Channel ID Parameter
  // ============================================

  describe('getViewlog channelId parameter (AC10)', () => {
    it('should reject missing channelId', async () => {
      // THIS TEST WILL FAIL - Method not implemented yet
      const params = {
        channelId: '',
        startDate: '2024-01-01 00:00:00',
        endDate: '2024-01-31 23:59:59',
      } as GetViewlogParams;

      await expect(statisticsService.getViewlog(params)).rejects.toThrow(
        PolyVValidationError
      );
    });

    it('should reject whitespace-only channelId', async () => {
      // THIS TEST WILL FAIL - Method not implemented yet
      const params: GetViewlogParams = {
        channelId: '   ',
        startDate: '2024-01-01 00:00:00',
        endDate: '2024-01-31 23:59:59',
      };

      await expect(statisticsService.getViewlog(params)).rejects.toThrow(
        PolyVValidationError
      );
    });
  });

  // ============================================
  // Pagination Support
  // ============================================

  describe('getViewlog pagination', () => {
    it('should accept page parameter', async () => {
      // THIS TEST WILL FAIL - Method not implemented yet
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockViewlogResponse });

      const params: GetViewlogParams = {
        channelId: '3151318',
        startDate: '2024-01-01 00:00:00',
        endDate: '2024-01-31 23:59:59',
        page: 1,
        pageSize: 500,
      };

      await statisticsService.getViewlog(params);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v3/user/statistics/viewlog',
        { params: expect.objectContaining({ page: 1, pageSize: 500 }) }
      );
    });

    it('should use default pageSize when not specified', async () => {
      // THIS TEST WILL FAIL - Method not implemented yet
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockViewlogResponse });

      const params: GetViewlogParams = {
        channelId: '3151318',
        startDate: '2024-01-01 00:00:00',
        endDate: '2024-01-31 23:59:59',
      };

      await statisticsService.getViewlog(params);

      // Default pageSize should be 1000
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v3/user/statistics/viewlog',
        expect.objectContaining({
          params: expect.objectContaining({ pageSize: 1000 }),
        })
      );
    });
  });

  // ============================================
  // AC2, AC6, AC7: Export Session Stats
  // ============================================

  describe('exportSessionStats (AC2, AC6, AC7, AC10)', () => {
    it('should call API with correct endpoint and parameters', async () => {
      // THIS TEST WILL FAIL - Method not implemented yet
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockSessionExportResponse });

      const params: ExportSessionStatsParams = {
        channelId: '3151318',
        sessionId: 'fv3ma84e63',
      };

      await statisticsService.exportSessionStats(params);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/live/v3/channel/session/stats/export',
        { params }
      );
    });

    it('should return download URL', async () => {
      // THIS TEST WILL FAIL - Method not implemented yet
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockSessionExportResponse });

      const params: ExportSessionStatsParams = {
        channelId: '3151318',
        sessionId: 'fv3ma84e63',
      };

      const result = await statisticsService.exportSessionStats(params);

      expect(result.downloadUrl).toBe('https://liveimages.videocc.net/xx/xxx/xx.xlsx');
    });

    it('should map a bare URL string (production interceptor-unwrap) to downloadUrl', async () => {
      // In production the response interceptor unwraps the { code, data } envelope,
      // so httpClient.get resolves directly to the bare download URL string.
      mockAxiosInstance.get.mockResolvedValueOnce(
        'https://liveimages.videocc.net/xx/xxx/xx.xlsx'
      );

      const params: ExportSessionStatsParams = {
        channelId: '3151318',
        sessionId: 'fv3ma84e63',
      };

      const result = await statisticsService.exportSessionStats(params);

      expect(result.downloadUrl).toBe('https://liveimages.videocc.net/xx/xxx/xx.xlsx');
    });

    it('should throw when the report is not ready (empty URL string)', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce('');

      const params: ExportSessionStatsParams = {
        channelId: '3151318',
        sessionId: 'fv3ma84e63',
      };

      await expect(statisticsService.exportSessionStats(params)).rejects.toThrow(
        '报表尚未生成'
      );
    });

    it('should reject missing sessionId', async () => {
      // THIS TEST WILL FAIL - Method not implemented yet
      const params = {
        channelId: '3151318',
        sessionId: '',
      } as ExportSessionStatsParams;

      await expect(statisticsService.exportSessionStats(params)).rejects.toThrow(
        PolyVValidationError
      );
    });

    it('should reject missing channelId', async () => {
      // THIS TEST WILL FAIL - Method not implemented yet
      const params = {
        channelId: '',
        sessionId: 'fv3ma84e63',
      } as ExportSessionStatsParams;

      await expect(statisticsService.exportSessionStats(params)).rejects.toThrow(
        PolyVValidationError
      );
    });
  });

  // ============================================
  // Error Handling
  // ============================================

  describe('error handling', () => {
    it('should handle network errors for getViewlog', async () => {
      // THIS TEST WILL FAIL - Method not implemented yet
      mockAxiosInstance.get.mockRejectedValue(new Error('Network error'));

      const params: GetViewlogParams = {
        channelId: '3151318',
        startDate: '2024-01-01 00:00:00',
        endDate: '2024-01-31 23:59:59',
      };

      await expect(statisticsService.getViewlog(params)).rejects.toThrow('Network error');
    });

    it('should handle network errors for exportSessionStats', async () => {
      // THIS TEST WILL FAIL - Method not implemented yet
      mockAxiosInstance.get.mockRejectedValue(new Error('Network error'));

      const params: ExportSessionStatsParams = {
        channelId: '3151318',
        sessionId: 'fv3ma84e63',
      };

      await expect(statisticsService.exportSessionStats(params)).rejects.toThrow(
        'Network error'
      );
    });

    it('should handle "report not ready" error for exportSessionStats', async () => {
      // THIS TEST WILL FAIL - Method not implemented yet
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          code: 400,
          status: 'error',
          message: 'Report is not ready yet, please try again later.',
          data: '',
        },
      });

      const params: ExportSessionStatsParams = {
        channelId: '3151318',
        sessionId: 'fv3ma84e63',
      };

      await expect(statisticsService.exportSessionStats(params)).rejects.toThrow(
        'Report is not ready yet'
      );
    });
  });

  // ============================================
  // Empty Results
  // ============================================

  describe('empty results', () => {
    it('should return empty contents array when no data', async () => {
      // THIS TEST WILL FAIL - Method not implemented yet
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          pageSize: 1000,
          pageNumber: 1,
          totalItems: 0,
          totalPages: 0,
          contents: [],
        },
      });

      const params: GetViewlogParams = {
        channelId: '3151318',
        startDate: '2024-01-01 00:00:00',
        endDate: '2024-01-31 23:59:59',
      };

      const result = await statisticsService.getViewlog(params);

      expect(result.contents).toEqual([]);
      expect(result.totalItems).toBe(0);
    });
  });
});
