/**
 * @fileoverview Unit tests for StatisticsHandler Export Methods - ATDD Failing Tests (RED Phase)
 * @story 10.4: 统计报表导出命令
 *
 * These tests will FAIL until the feature is implemented (TDD red phase)
 *
 * Acceptance Criteria:
 * - AC1: `statistics export viewlog` 命令支持导出频道观看日志数据
 * - AC2: `statistics export session` 命令支持导出频道场次报表（返回下载链接）
 * - AC3: `viewlog` 命令支持 `--start-time` 和 `--end-time` 参数按时间范围过滤
 * - AC4: `viewlog` 命令支持 `--watch-type` 参数过滤观看类型（live/vod）
 * - AC5: `viewlog` 命令支持 `--output` 参数指定输出文件路径（CSV 格式）
 * - AC6: `session` 命令需要 `--session-id` 参数指定场次
 * - AC7: `session` 命令返回报表下载链接
 * - AC8: 表格输出格式清晰，显示导出状态和文件路径/链接
 * - AC9: JSON 输出完整包含所有字段
 * - AC10: 支持 `--channel-id` 参数指定频道（viewlog 必需，session 可选）
 */

import { StatisticsHandler, IStatisticsService } from './statistics.handler';
import {
  StatisticsExportViewlogOptions,
  StatisticsExportSessionOptions,
  ViewlogDisplayItem,
  SessionExportDisplayItem,
} from '../types/statistics-export';
import { AuthConfig } from '../types/auth';
import { StatisticsServiceConfig } from '../types/statistics';
import * as fs from 'fs';
import * as path from 'path';

// Mock console methods
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

// Mock fs module
jest.mock('fs', () => ({
  writeFileSync: jest.fn(),
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
}));

describe('StatisticsHandler Export Methods (Story 10.4 - ATDD RED Phase)', () => {
  let statisticsHandler: StatisticsHandler;
  let mockAuthConfig: AuthConfig;
  let mockServiceConfig: StatisticsServiceConfig;
  let mockStatisticsService: jest.Mocked<IStatisticsService>;

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

    // Create mock service using dependency injection
    mockStatisticsService = {
      getDailyViewStatistics: jest.fn(),
      getConcurrencyData: jest.fn(),
      getMaxConcurrent: jest.fn(),
      getRegionDistribution: jest.fn(),
      getDeviceDistribution: jest.fn(),
    };

    // Inject mock service via constructor
    statisticsHandler = new StatisticsHandler(
      mockAuthConfig,
      mockServiceConfig,
      mockStatisticsService
    );
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  // ============================================
  // AC1: exportViewlog - Export Viewlog Data
  // ============================================

  describe('exportViewlog (AC1, AC3, AC4, AC5, AC8, AC9, AC10)', () => {
    const mockViewlogResponse: ViewlogDisplayItem[] = [
      {
        playId: '1648432513206X1501461',
        viewerId: '1648432461504',
        viewerName: '回放列表观看',
        watchType: 'vod',
        playDuration: 87,
        stayDuration: 90,
        sessionId: 'g83wdgxfh6',
        ipAddress: '120.228.5.164',
        region: '湖南/长沙',
        operatingSystem: 'Windows',
        browser: 'Chrome 9',
        isMobile: 'N',
        date: '2022-03-28',
        createdTime: 1648432556000,
      },
    ];

    it('should call statisticsService.getViewlog with correct parameters', async () => {
      // THIS TEST WILL FAIL - Method not implemented yet
      mockStatisticsService.getViewlog = jest.fn().mockResolvedValueOnce(mockViewlogResponse);

      const options: StatisticsExportViewlogOptions = {
        channelId: '3151318',
        startTime: '2024-01-01 00:00:00',
        endTime: '2024-01-31 23:59:59',
        output: 'table',
      };

      await statisticsHandler.exportViewlog(options);

      expect(mockStatisticsService.getViewlog).toHaveBeenCalledWith(options);
    });

    it('should display viewlog preview in table format', async () => {
      // THIS TEST WILL FAIL - Method not implemented yet
      mockStatisticsService.getViewlog = jest.fn().mockResolvedValueOnce(mockViewlogResponse);

      const options: StatisticsExportViewlogOptions = {
        channelId: '3151318',
        startTime: '2024-01-01 00:00:00',
        endTime: '2024-01-31 23:59:59',
        output: 'table',
      };

      await statisticsHandler.exportViewlog(options);

      // Verify table output displays key columns
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('观看日志导出成功')
      );
    });

    it('should display viewlog data in JSON format', async () => {
      // THIS TEST WILL FAIL - Method not implemented yet
      mockStatisticsService.getViewlog = jest.fn().mockResolvedValueOnce(mockViewlogResponse);

      const options: StatisticsExportViewlogOptions = {
        channelId: '3151318',
        startTime: '2024-01-01 00:00:00',
        endTime: '2024-01-31 23:59:59',
        output: 'json',
      };

      await statisticsHandler.exportViewlog(options);

      // Verify JSON output contains all fields
      const logCalls = mockConsoleLog.mock.calls;
      const jsonCall = logCalls.find((call) => {
        try {
          if (call[0] && typeof call[0] === 'string') {
            const parsed = JSON.parse(call[0]);
            return Array.isArray(parsed) || parsed.contents;
          }
        } catch {
          // Not JSON
        }
        return false;
      });
      expect(jsonCall).toBeDefined();
    });
  });

  // ============================================
  // AC5: CSV File Output
  // ============================================

  describe('exportViewlog CSV output (AC5)', () => {
    const mockViewlogResponse: ViewlogDisplayItem[] = [
      {
        playId: '1648432513206X1501461',
        viewerId: '1648432461504',
        viewerName: '测试用户',
        watchType: 'vod',
        playDuration: 87,
        stayDuration: 90,
        sessionId: 'g83wdgxfh6',
        ipAddress: '120.228.5.164',
        region: '湖南/长沙',
        operatingSystem: 'Windows',
        browser: 'Chrome 9',
        isMobile: 'N',
        date: '2022-03-28',
        createdTime: 1648432556000,
      },
    ];

    it('should write CSV file when outputFile is specified', async () => {
      // THIS TEST WILL FAIL - Method not implemented yet
      mockStatisticsService.getViewlog = jest.fn().mockResolvedValueOnce(mockViewlogResponse);

      const options: StatisticsExportViewlogOptions = {
        channelId: '3151318',
        startTime: '2024-01-01 00:00:00',
        endTime: '2024-01-31 23:59:59',
        output: 'table',
        outputFile: './viewlog.csv',
      };

      await statisticsHandler.exportViewlog(options);

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('viewlog.csv'),
        expect.stringContaining('播放ID'), // CSV header in Chinese
        'utf8'
      );
    });

    it('should include Chinese headers in CSV file', async () => {
      // THIS TEST WILL FAIL - Method not implemented yet
      mockStatisticsService.getViewlog = jest.fn().mockResolvedValueOnce(mockViewlogResponse);

      const options: StatisticsExportViewlogOptions = {
        channelId: '3151318',
        startTime: '2024-01-01 00:00:00',
        endTime: '2024-01-31 23:59:59',
        output: 'table',
        outputFile: './viewlog.csv',
      };

      await statisticsHandler.exportViewlog(options);

      const writeCall = (fs.writeFileSync as jest.Mock).mock.calls[0];
      const csvContent = writeCall[1];

      // Verify CSV headers (Chinese)
      expect(csvContent).toContain('播放ID');
      expect(csvContent).toContain('观众ID');
      expect(csvContent).toContain('观众昵称');
      expect(csvContent).toContain('观看类型');
      expect(csvContent).toContain('播放时长(秒)');
    });

    it('should display success message with file path', async () => {
      // THIS TEST WILL FAIL - Method not implemented yet
      mockStatisticsService.getViewlog = jest.fn().mockResolvedValueOnce(mockViewlogResponse);

      const options: StatisticsExportViewlogOptions = {
        channelId: '3151318',
        startTime: '2024-01-01 00:00:00',
        endTime: '2024-01-31 23:59:59',
        output: 'table',
        outputFile: './viewlog.csv',
      };

      await statisticsHandler.exportViewlog(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('已导出到')
      );
    });

    it('should not write file when outputFile is not specified', async () => {
      // THIS TEST WILL FAIL - Method not implemented yet
      mockStatisticsService.getViewlog = jest.fn().mockResolvedValueOnce(mockViewlogResponse);

      const options: StatisticsExportViewlogOptions = {
        channelId: '3151318',
        startTime: '2024-01-01 00:00:00',
        endTime: '2024-01-31 23:59:59',
        output: 'table',
        // outputFile not specified
      };

      await statisticsHandler.exportViewlog(options);

      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // AC2, AC6, AC7: exportSessionStats
  // ============================================

  describe('exportSessionStats (AC2, AC6, AC7, AC8, AC9, AC10)', () => {
    const mockSessionExportResponse: SessionExportDisplayItem = {
      channelId: '3151318',
      sessionId: 'fv3ma84e63',
      downloadUrl: 'https://liveimages.videocc.net/xx/xxx/xx.xlsx',
      expiresIn: '60天',
    };

    it('should call statisticsService.exportSessionStats with correct parameters', async () => {
      // THIS TEST WILL FAIL - Method not implemented yet
      mockStatisticsService.exportSessionStats = jest
        .fn()
        .mockResolvedValueOnce(mockSessionExportResponse);

      const options: StatisticsExportSessionOptions = {
        channelId: '3151318',
        sessionId: 'fv3ma84e63',
        output: 'table',
      };

      await statisticsHandler.exportSessionStats(options);

      expect(mockStatisticsService.exportSessionStats).toHaveBeenCalledWith(options);
    });

    it('should display download link in table format', async () => {
      // THIS TEST WILL FAIL - Method not implemented yet
      mockStatisticsService.exportSessionStats = jest
        .fn()
        .mockResolvedValueOnce(mockSessionExportResponse);

      const options: StatisticsExportSessionOptions = {
        channelId: '3151318',
        sessionId: 'fv3ma84e63',
        output: 'table',
      };

      await statisticsHandler.exportSessionStats(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('下载链接')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('60天')
      );
    });

    it('should display download link in JSON format', async () => {
      // THIS TEST WILL FAIL - Method not implemented yet
      mockStatisticsService.exportSessionStats = jest
        .fn()
        .mockResolvedValueOnce(mockSessionExportResponse);

      const options: StatisticsExportSessionOptions = {
        channelId: '3151318',
        sessionId: 'fv3ma84e63',
        output: 'json',
      };

      await statisticsHandler.exportSessionStats(options);

      const logCalls = mockConsoleLog.mock.calls;
      const jsonCall = logCalls.find((call) => {
        try {
          if (call[0] && typeof call[0] === 'string') {
            const parsed = JSON.parse(call[0]);
            return parsed.downloadUrl;
          }
        } catch {
          // Not JSON
        }
        return false;
      });
      expect(jsonCall).toBeDefined();
    });
  });

  // ============================================
  // AC8: Table Output Format
  // ============================================

  describe('table output format (AC8)', () => {
    const mockViewlogResponse: ViewlogDisplayItem[] = [
      {
        playId: 'xxx1461',
        viewerId: 'user1',
        viewerName: '张三',
        watchType: 'live',
        playDuration: 87,
        stayDuration: 90,
        sessionId: 'session1',
        ipAddress: '120.228...',
        region: '湖南/长沙',
        operatingSystem: 'Windows',
        browser: 'Chrome 9',
        isMobile: 'N',
        date: '2024-01-15',
        createdTime: 1648432556000,
      },
    ];

    it('should display total records count', async () => {
      // THIS TEST WILL FAIL - Method not implemented yet
      mockStatisticsService.getViewlog = jest.fn().mockResolvedValueOnce(mockViewlogResponse);

      const options: StatisticsExportViewlogOptions = {
        channelId: '3151318',
        startTime: '2024-01-01 00:00:00',
        endTime: '2024-01-31 23:59:59',
        output: 'table',
      };

      await statisticsHandler.exportViewlog(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('总记录数')
      );
    });

    it('should display time range in output', async () => {
      // THIS TEST WILL FAIL - Method not implemented yet
      mockStatisticsService.getViewlog = jest.fn().mockResolvedValueOnce(mockViewlogResponse);

      const options: StatisticsExportViewlogOptions = {
        channelId: '3151318',
        startTime: '2024-01-01 00:00:00',
        endTime: '2024-01-31 23:59:59',
        output: 'table',
      };

      await statisticsHandler.exportViewlog(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('时间范围')
      );
    });

    it('should preview first 10 records in table', async () => {
      // THIS TEST WILL FAIL - Method not implemented yet
      const manyRecords: ViewlogDisplayItem[] = Array.from({ length: 15 }, (_, i) => ({
        playId: `play${i}`,
        viewerId: `viewer${i}`,
        viewerName: `用户${i}`,
        watchType: 'live' as const,
        playDuration: 100 + i,
        stayDuration: 110 + i,
        sessionId: `session${i}`,
        ipAddress: `192.168.1.${i}`,
        region: '湖南/长沙',
        operatingSystem: 'Windows',
        browser: 'Chrome',
        isMobile: 'N',
        date: '2024-01-15',
        createdTime: 1648432556000 + i * 1000,
      }));

      mockStatisticsService.getViewlog = jest.fn().mockResolvedValueOnce(manyRecords);

      const options: StatisticsExportViewlogOptions = {
        channelId: '3151318',
        startTime: '2024-01-01 00:00:00',
        endTime: '2024-01-31 23:59:59',
        output: 'table',
      };

      await statisticsHandler.exportViewlog(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('预览')
      );
    });
  });

  // ============================================
  // Empty Results Handling
  // ============================================

  describe('empty results handling', () => {
    it('should handle empty viewlog data', async () => {
      // THIS TEST WILL FAIL - Method not implemented yet
      mockStatisticsService.getViewlog = jest.fn().mockResolvedValueOnce([]);

      const options: StatisticsExportViewlogOptions = {
        channelId: '3151318',
        startTime: '2024-01-01 00:00:00',
        endTime: '2024-01-31 23:59:59',
        output: 'table',
      };

      await statisticsHandler.exportViewlog(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('No viewlog data found')
      );
    });
  });

  // ============================================
  // Error Handling
  // ============================================

  describe('error handling', () => {
    it('should handle service errors for exportViewlog', async () => {
      // THIS TEST WILL FAIL - Method not implemented yet
      mockStatisticsService.getViewlog = jest
        .fn()
        .mockRejectedValueOnce(new Error('Service Error'));

      const options: StatisticsExportViewlogOptions = {
        channelId: '3151318',
        startTime: '2024-01-01 00:00:00',
        endTime: '2024-01-31 23:59:59',
        output: 'table',
      };

      await expect(statisticsHandler.exportViewlog(options)).rejects.toThrow('Service Error');
    });

    it('should handle service errors for exportSessionStats', async () => {
      // THIS TEST WILL FAIL - Method not implemented yet
      mockStatisticsService.exportSessionStats = jest
        .fn()
        .mockRejectedValueOnce(new Error('Service Error'));

      const options: StatisticsExportSessionOptions = {
        channelId: '3151318',
        sessionId: 'fv3ma84e63',
        output: 'table',
      };

      await expect(statisticsHandler.exportSessionStats(options)).rejects.toThrow('Service Error');
    });
  });
});
