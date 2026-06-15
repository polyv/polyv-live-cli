/**
 * @fileoverview Unit tests for StatisticsHandler
 * @story 10.1: 观看数据统计命令
 *
 * Acceptance Criteria:
 * - AC1: Returns view metrics (PV, UV, play duration)
 * - AC2: Support date range filtering (--start-day, --end-day)
 * - AC3: Table output format with clear columns
 * - AC4: JSON output with complete fields
 */

import { StatisticsHandler, IStatisticsService } from './statistics.handler';
import {
  StatisticsViewOptions,
  StatisticsServiceConfig,
  StatisticsConcurrencyOptions,
  StatisticsMaxConcurrentOptions,
  StatisticsAudienceRegionOptions,
  StatisticsAudienceDeviceOptions,
} from '../types/statistics';
import { AuthConfig } from '../types/auth';

// Mock console methods
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('StatisticsHandler', () => {
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

  // ============================================================
  // AC1: Returns key metrics
  // ============================================================

  describe('viewStatistics (AC1)', () => {
    const mockStatisticsResponse = [
      {
        currentDay: '2024-01-15',
        channelId: '3151318',
        userId: 'test-user-id',
        pcPlayDuration: 500,
        pcVideoView: 100,
        pcUniqueViewer: 50,
        mobilePlayDuration: 300,
        mobileVideoView: 80,
        mobileUniqueViewer: 40,
        createdTime: 1705276800000,
        lastModified: 1705276800000,
      },
    ];

    it('should call StatisticsService with correct parameters', async () => {
      mockStatisticsService.getDailyViewStatistics.mockResolvedValueOnce(mockStatisticsResponse);

      const options: StatisticsViewOptions = {
        channelId: '3151318',
        startDay: '2024-01-15',
        endDay: '2024-01-16',
      };

      await statisticsHandler.viewStatistics(options);

      expect(mockStatisticsService.getDailyViewStatistics).toHaveBeenCalledWith(options);
    });

    it('should display statistics with PC metrics', async () => {
      mockStatisticsService.getDailyViewStatistics.mockResolvedValueOnce(mockStatisticsResponse);

      const options: StatisticsViewOptions = {
        channelId: '3151318',
        startDay: '2024-01-15',
        endDay: '2024-01-16',
        output: 'json',
      };

      await statisticsHandler.viewStatistics(options);

      // Verify JSON output contains PC metrics
      const logCalls = mockConsoleLog.mock.calls;
      const jsonOutputCall = logCalls.find((call) =>
        call[0] && typeof call[0] === 'string' && call[0].includes('pcPlayDuration')
      );
      expect(jsonOutputCall).toBeDefined();
    });

    it('should display statistics with mobile metrics', async () => {
      mockStatisticsService.getDailyViewStatistics.mockResolvedValueOnce(mockStatisticsResponse);

      const options: StatisticsViewOptions = {
        channelId: '3151318',
        startDay: '2024-01-15',
        endDay: '2024-01-16',
        output: 'json',
      };

      await statisticsHandler.viewStatistics(options);

      // Verify JSON output contains mobile metrics
      const logCalls = mockConsoleLog.mock.calls;
      const jsonOutputCall = logCalls.find((call) =>
        call[0] && typeof call[0] === 'string' && call[0].includes('mobilePlayDuration')
      );
      expect(jsonOutputCall).toBeDefined();
    });
  });

  // ============================================================
  // AC2: Date range filtering validation
  // ============================================================

  describe('date range validation (AC2)', () => {
    it('should accept valid date range', async () => {
      mockStatisticsService.getDailyViewStatistics.mockResolvedValueOnce([]);

      const options: StatisticsViewOptions = {
        channelId: '3151318',
        startDay: '2024-01-01',
        endDay: '2024-01-31',
      };

      await expect(statisticsHandler.viewStatistics(options)).resolves.not.toThrow();
    });

    it('should reject invalid date format', async () => {
      const options: StatisticsViewOptions = {
        channelId: '3151318',
        startDay: '2024/01/01', // Wrong format
        endDay: '2024-01-07',
      };

      await expect(statisticsHandler.viewStatistics(options)).rejects.toThrow();
    });
  });

  // ============================================================
  // AC3 & AC4: Output format tests
  // ============================================================

  describe('output formats (AC3, AC4)', () => {
    const mockStatisticsResponse = [
      {
        currentDay: '2024-01-15',
        channelId: '3151318',
        userId: 'test-user-id',
        pcPlayDuration: 500,
        pcVideoView: 100,
        pcUniqueViewer: 50,
        mobilePlayDuration: 300,
        mobileVideoView: 80,
        mobileUniqueViewer: 40,
        createdTime: 1705276800000,
        lastModified: 1705276800000,
      },
    ];

    it('should display table format by default', async () => {
      mockStatisticsService.getDailyViewStatistics.mockResolvedValueOnce(mockStatisticsResponse);

      const options: StatisticsViewOptions = {
        channelId: '3151318',
        startDay: '2024-01-15',
        endDay: '2024-01-16',
        // output not specified, defaults to table
      };

      await statisticsHandler.viewStatistics(options);

      // Table output uses cli-table3 which outputs to console
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('should display JSON format when specified', async () => {
      mockStatisticsService.getDailyViewStatistics.mockResolvedValueOnce(mockStatisticsResponse);

      const options: StatisticsViewOptions = {
        channelId: '3151318',
        startDay: '2024-01-15',
        endDay: '2024-01-16',
        output: 'json',
      };

      await statisticsHandler.viewStatistics(options);

      // Verify JSON output is displayed
      const logCalls = mockConsoleLog.mock.calls;
      const jsonCall = logCalls.find((call) => {
        try {
          if (call[0] && typeof call[0] === 'string') {
            JSON.parse(call[0]);
            return true;
          }
        } catch {
          // Not JSON
        }
        return false;
      });
      expect(jsonCall).toBeDefined();
    });

    it('should handle empty statistics', async () => {
      mockStatisticsService.getDailyViewStatistics.mockResolvedValueOnce([]);

      const options: StatisticsViewOptions = {
        channelId: '3151318',
        startDay: '2024-01-01',
        endDay: '2024-01-07',
      };

      await statisticsHandler.viewStatistics(options);

      // Should display "No statistics data found" message
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('No statistics data found')
      );
    });
  });

  // ============================================================
  // Error handling
  // ============================================================

  describe('error handling', () => {
    it('should handle service errors', async () => {
      mockStatisticsService.getDailyViewStatistics.mockRejectedValueOnce(new Error('Service Error'));

      const options: StatisticsViewOptions = {
        channelId: '3151318',
        startDay: '2024-01-01',
        endDay: '2024-01-07',
      };

      await expect(statisticsHandler.viewStatistics(options)).rejects.toThrow('Service Error');
    });
  });

  // ============================================
  // Story 10.2: Concurrency Data Tests
  // ============================================

  describe('viewConcurrency (Story 10.2)', () => {
    const mockConcurrencyResponse = [
      {
        day: '2024-01-15',
        minute: '10:30',
        viewers: 150,
      },
      {
        day: '2024-01-15',
        minute: '10:31',
        viewers: 180,
      },
    ];

    it('should call StatisticsService with correct parameters', async () => {
      mockStatisticsService.getConcurrencyData.mockResolvedValueOnce(mockConcurrencyResponse);

      const options: StatisticsConcurrencyOptions = {
        channelId: '3151318',
        startDate: '2024-01-15',
        endDate: '2024-01-16',
      };

      await statisticsHandler.viewConcurrency(options);

      expect(mockStatisticsService.getConcurrencyData).toHaveBeenCalledWith(options);
    });

    it('should display concurrency data in JSON format', async () => {
      mockStatisticsService.getConcurrencyData.mockResolvedValueOnce(mockConcurrencyResponse);

      const options: StatisticsConcurrencyOptions = {
        channelId: '3151318',
        startDate: '2024-01-15',
        endDate: '2024-01-16',
        output: 'json',
      };

      await statisticsHandler.viewConcurrency(options);

      // Verify JSON output contains concurrency data
      const logCalls = mockConsoleLog.mock.calls;
      const jsonOutputCall = logCalls.find((call) =>
        call[0] && typeof call[0] === 'string' && call[0].includes('viewers')
      );
      expect(jsonOutputCall).toBeDefined();
    });

    it('should display concurrency data table by default', async () => {
      mockStatisticsService.getConcurrencyData.mockResolvedValueOnce(mockConcurrencyResponse);

      const options: StatisticsConcurrencyOptions = {
        channelId: '3151318',
        startDate: '2024-01-15',
        endDate: '2024-01-16',
      };

      await statisticsHandler.viewConcurrency(options);

      // Table output uses cli-table3 which outputs to console
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('should handle empty concurrency data', async () => {
      mockStatisticsService.getConcurrencyData.mockResolvedValueOnce([]);

      const options: StatisticsConcurrencyOptions = {
        channelId: '3151318',
        startDate: '2024-01-15',
        endDate: '2024-01-16',
      };

      await statisticsHandler.viewConcurrency(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('No concurrency data found')
      );
    });

    it('should handle service errors', async () => {
      mockStatisticsService.getConcurrencyData.mockRejectedValueOnce(new Error('Service Error'));

      const options: StatisticsConcurrencyOptions = {
        channelId: '3151318',
        startDate: '2024-01-15',
        endDate: '2024-01-16',
      };

      await expect(statisticsHandler.viewConcurrency(options)).rejects.toThrow('Service Error');
    });
  });

  // ============================================
  // Story 10.2: Max Concurrent Tests
  // ============================================

  describe('viewMaxConcurrent (Story 10.2)', () => {
    it('should call StatisticsService with correct parameters', async () => {
      mockStatisticsService.getMaxConcurrent.mockResolvedValueOnce(500);

      const options: StatisticsMaxConcurrentOptions = {
        channelId: '3151318',
        startTime: 1705276800000,
        endTime: 1705363200000,
      };

      await statisticsHandler.viewMaxConcurrent(options);

      expect(mockStatisticsService.getMaxConcurrent).toHaveBeenCalledWith(options);
    });

    it('should display max concurrent in JSON format', async () => {
      mockStatisticsService.getMaxConcurrent.mockResolvedValueOnce(500);

      const options: StatisticsMaxConcurrentOptions = {
        channelId: '3151318',
        startTime: 1705276800000,
        endTime: 1705363200000,
        output: 'json',
      };

      await statisticsHandler.viewMaxConcurrent(options);

      // Verify JSON output contains maxConcurrent
      const logCalls = mockConsoleLog.mock.calls;
      const jsonOutputCall = logCalls.find((call) =>
        call[0] && typeof call[0] === 'string' && call[0].includes('maxConcurrent')
      );
      expect(jsonOutputCall).toBeDefined();
    });

    it('should display max concurrent in table format by default', async () => {
      mockStatisticsService.getMaxConcurrent.mockResolvedValueOnce(500);

      const options: StatisticsMaxConcurrentOptions = {
        channelId: '3151318',
        startTime: 1705276800000,
        endTime: 1705363200000,
      };

      await statisticsHandler.viewMaxConcurrent(options);

      // Verify table output displays the max concurrent value
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('历史最高并发人数: 500')
      );
    });

    it('should handle service errors', async () => {
      mockStatisticsService.getMaxConcurrent.mockRejectedValueOnce(new Error('Service Error'));

      const options: StatisticsMaxConcurrentOptions = {
        channelId: '3151318',
        startTime: 1705276800000,
        endTime: 1705363200000,
      };

      await expect(statisticsHandler.viewMaxConcurrent(options)).rejects.toThrow('Service Error');
    });
  });

  // ============================================
  // Story 10.3: Audience Region Tests
  // ============================================

  describe('viewRegionDistribution (Story 10.3 - AC1, AC5, AC6)', () => {
    const mockRegionResponse = [
      {
        region: '湖南',
        plays: 86,
        viewers: 30,
        ips: 38,
        playDuration: 677,
        percent: '97.73%',
      },
      {
        region: '未知',
        plays: 2,
        viewers: 1,
        ips: 1,
        playDuration: 1,
        percent: '2.27%',
      },
    ];

    it('should call StatisticsService with correct parameters', async () => {
      mockStatisticsService.getRegionDistribution.mockResolvedValueOnce(mockRegionResponse);

      const options: StatisticsAudienceRegionOptions = {
        channelId: '3151318',
        startTime: 1648742400000,
        endTime: 1651334399000,
        type: 'province',
      };

      await statisticsHandler.viewRegionDistribution(options);

      expect(mockStatisticsService.getRegionDistribution).toHaveBeenCalledWith(options);
    });

    it('should display region distribution in JSON format', async () => {
      mockStatisticsService.getRegionDistribution.mockResolvedValueOnce(mockRegionResponse);

      const options: StatisticsAudienceRegionOptions = {
        channelId: '3151318',
        startTime: 1648742400000,
        endTime: 1651334399000,
        output: 'json',
      };

      await statisticsHandler.viewRegionDistribution(options);

      // Verify JSON output contains region data
      const logCalls = mockConsoleLog.mock.calls;
      const jsonOutputCall = logCalls.find((call) =>
        call[0] && typeof call[0] === 'string' && call[0].includes('region')
      );
      expect(jsonOutputCall).toBeDefined();
    });

    it('should display region distribution table by default', async () => {
      mockStatisticsService.getRegionDistribution.mockResolvedValueOnce(mockRegionResponse);

      const options: StatisticsAudienceRegionOptions = {
        channelId: '3151318',
        startTime: 1648742400000,
        endTime: 1651334399000,
      };

      await statisticsHandler.viewRegionDistribution(options);

      // Table output uses cli-table3 which outputs to console
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('should handle empty region data', async () => {
      mockStatisticsService.getRegionDistribution.mockResolvedValueOnce([]);

      const options: StatisticsAudienceRegionOptions = {
        channelId: '3151318',
        startTime: 1648742400000,
        endTime: 1651334399000,
      };

      await statisticsHandler.viewRegionDistribution(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('No region distribution data found')
      );
    });

    it('should handle service errors', async () => {
      mockStatisticsService.getRegionDistribution.mockRejectedValueOnce(new Error('Service Error'));

      const options: StatisticsAudienceRegionOptions = {
        channelId: '3151318',
        startTime: 1648742400000,
        endTime: 1651334399000,
      };

      await expect(statisticsHandler.viewRegionDistribution(options)).rejects.toThrow('Service Error');
    });
  });

  // ============================================
  // Story 10.3: Audience Device Tests
  // ============================================

  describe('viewDeviceDistribution (Story 10.3 - AC2, AC5, AC6)', () => {
    const mockDeviceResponse = [
      {
        name: 'Chrome',
        platform: 'pc',
        plays: 101,
        viewers: 11,
        ips: 88,
        playDuration: 586,
        percent: '69.18%',
      },
      {
        name: 'weixin',
        platform: 'mobile',
        plays: 29,
        viewers: 13,
        ips: 17,
        playDuration: 49,
        percent: '19.86%',
      },
    ];

    it('should call StatisticsService with correct parameters', async () => {
      mockStatisticsService.getDeviceDistribution.mockResolvedValueOnce(mockDeviceResponse);

      const options: StatisticsAudienceDeviceOptions = {
        channelId: '3151318',
        startTime: 1651386101000,
        endTime: 1652336501462,
      };

      await statisticsHandler.viewDeviceDistribution(options);

      expect(mockStatisticsService.getDeviceDistribution).toHaveBeenCalledWith(options);
    });

    it('should display device distribution in JSON format', async () => {
      mockStatisticsService.getDeviceDistribution.mockResolvedValueOnce(mockDeviceResponse);

      const options: StatisticsAudienceDeviceOptions = {
        channelId: '3151318',
        startTime: 1651386101000,
        endTime: 1652336501462,
        output: 'json',
      };

      await statisticsHandler.viewDeviceDistribution(options);

      // Verify JSON output contains device data
      const logCalls = mockConsoleLog.mock.calls;
      const jsonOutputCall = logCalls.find((call) =>
        call[0] && typeof call[0] === 'string' && call[0].includes('platform')
      );
      expect(jsonOutputCall).toBeDefined();
    });

    it('should display device distribution table by default', async () => {
      mockStatisticsService.getDeviceDistribution.mockResolvedValueOnce(mockDeviceResponse);

      const options: StatisticsAudienceDeviceOptions = {
        channelId: '3151318',
        startTime: 1651386101000,
        endTime: 1652336501462,
      };

      await statisticsHandler.viewDeviceDistribution(options);

      // Table output uses cli-table3 which outputs to console
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('should handle empty device data', async () => {
      mockStatisticsService.getDeviceDistribution.mockResolvedValueOnce([]);

      const options: StatisticsAudienceDeviceOptions = {
        channelId: '3151318',
        startTime: 1651386101000,
        endTime: 1652336501462,
      };

      await statisticsHandler.viewDeviceDistribution(options);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('No device distribution data found')
      );
    });

    it('should handle service errors', async () => {
      mockStatisticsService.getDeviceDistribution.mockRejectedValueOnce(new Error('Service Error'));

      const options: StatisticsAudienceDeviceOptions = {
        channelId: '3151318',
        startTime: 1651386101000,
        endTime: 1652336501462,
      };

      await expect(statisticsHandler.viewDeviceDistribution(options)).rejects.toThrow('Service Error');
    });
  });
});
