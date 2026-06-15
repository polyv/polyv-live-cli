/**
 * StatisticsHandler Acceptance Tests
 *
 * Story 10.2: 并发数据命令
 *
 * Tests for StatisticsHandler methods covering:
 * - viewConcurrency: View historical concurrency data
 * - viewMaxConcurrent: View max concurrent viewers
 *
 * Acceptance Criteria (Story 10.2):
 * - AC1: viewConcurrency returns historical concurrency data (date, time, viewers)
 * - AC2: Support date range filtering (startDate, endDate, max 60 days)
 * - AC3: viewMaxConcurrent returns maximum historical concurrent viewers
 * - AC4: Support timestamp filtering (startTime, endTime, max 3 months)
 * - AC5: Table output format displays data correctly
 * - AC6: JSON output format includes all fields
 * - AC7: Support channelId parameter (required)
 */

import { StatisticsHandler, IStatisticsService } from '../../src/handlers/statistics.handler';
import {
  StatisticsConcurrencyOptions,
  StatisticsMaxConcurrentOptions,
  ConcurrencyDataPointItem,
} from '../../src/types/statistics';
import { AuthConfig } from '../../src/types/auth';
import { PolyVValidationError } from '../../src/utils/errors';

// Mock dependencies
jest.mock('../../src/services/statistics.service.sdk');

// Test fixtures
const mockAuthConfig: AuthConfig = {
  appId: 'test-app-id',
  appSecret: 'test-app-secret',
  userId: 'test-user-id',
};

const mockServiceConfig = {
  baseUrl: 'https://api.polyv.net',
  timeout: 30000,
  debug: false,
};

const mockConcurrencyData: ConcurrencyDataPointItem[] = [
  { day: '2024-01-15', minute: '10:30', viewers: 150 },
  { day: '2024-01-15', minute: '10:31', viewers: 165 },
  { day: '2024-01-15', minute: '10:32', viewers: 180 },
];

describe('StatisticsHandler - Story 10.2: Concurrency Commands', () => {
  let handler: StatisticsHandler;
  let mockStatisticsService: jest.Mocked<IStatisticsService>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock service with extended interface for Story 10.2
    mockStatisticsService = {
      getDailyViewStatistics: jest.fn(),
      // Story 10.2: Add new methods
      getConcurrencyData: jest.fn(),
      getMaxConcurrent: jest.fn(),
    } as unknown as jest.Mocked<IStatisticsService>;

    handler = new StatisticsHandler(
      mockAuthConfig,
      mockServiceConfig,
      mockStatisticsService
    );
  });

  // ============================================
  // AC1: viewConcurrency returns concurrency data
  // ============================================

  describe('viewConcurrency (AC1)', () => {
    it('should call service with correct parameters including output', async () => {
      mockStatisticsService.getConcurrencyData.mockResolvedValueOnce(mockConcurrencyData);

      const options: StatisticsConcurrencyOptions = {
        channelId: '3151318',
        startDate: '2024-01-15',
        endDate: '2024-01-16',
        output: 'table',
      };

      await handler.viewConcurrency(options);

      expect(mockStatisticsService.getConcurrencyData).toHaveBeenCalledWith({
        channelId: '3151318',
        startDate: '2024-01-15',
        endDate: '2024-01-16',
        output: 'table',
      });
    });

    it('should display data in table format by default', async () => {
      mockStatisticsService.getConcurrencyData.mockResolvedValueOnce(mockConcurrencyData);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const options: StatisticsConcurrencyOptions = {
        channelId: '3151318',
        startDate: '2024-01-15',
        endDate: '2024-01-16',
      };

      await handler.viewConcurrency(options);

      // Verify table output contains date, time, viewers
      expect(consoleSpy).toHaveBeenCalled();
      const output = consoleSpy.mock.calls.map(c => c.join(' ')).join('\n');
      expect(output).toContain('2024-01-15');
      expect(output).toContain('150');

      consoleSpy.mockRestore();
    });

    it('should display data in JSON format when requested', async () => {
      mockStatisticsService.getConcurrencyData.mockResolvedValueOnce(mockConcurrencyData);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const options: StatisticsConcurrencyOptions = {
        channelId: '3151318',
        startDate: '2024-01-15',
        endDate: '2024-01-16',
        output: 'json',
      };

      await handler.viewConcurrency(options);

      // Verify JSON output
      expect(consoleSpy).toHaveBeenCalled();
      const output = consoleSpy.mock.calls.map(c => c.join(' ')).join('\n');
      expect(output).toContain('"day": "2024-01-15"');
      expect(output).toContain('"minute": "10:30"');
      expect(output).toContain('"viewers": 150');

      consoleSpy.mockRestore();
    });

    it('should display message when no data found', async () => {
      mockStatisticsService.getConcurrencyData.mockResolvedValueOnce([]);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const options: StatisticsConcurrencyOptions = {
        channelId: '3151318',
        startDate: '2024-01-01',
        endDate: '2024-01-07',
      };

      await handler.viewConcurrency(options);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('No concurrency data found')
      );

      consoleSpy.mockRestore();
    });
  });

  // ============================================
  // AC2: Date range validation (tested in command layer)
  // ============================================

  // Note: Date range validation happens in command layer via validateDateRange function
  // The tests belong in command tests, not handler tests

  // ============================================
  // AC7: Required channelId (tested in command layer)
  // ============================================

  // Note: channelId validation happens in SDK service layer, not handler
  // The handler simply delegates to service

  // ============================================
  // AC3: viewMaxConcurrent returns max value
  // ============================================

  describe('viewMaxConcurrent (AC3)', () => {
    it('should call service with correct parameters including output', async () => {
      mockStatisticsService.getMaxConcurrent.mockResolvedValueOnce(180);

      const options: StatisticsMaxConcurrentOptions = {
        channelId: '3151318',
        startTime: 1704067200000, // 2024-01-01
        endTime: 1709251200000, // 2024-03-01 (59 days, within 3 months)
        output: 'table',
      };

      await handler.viewMaxConcurrent(options);

      expect(mockStatisticsService.getMaxConcurrent).toHaveBeenCalledWith({
        channelId: '3151318',
        startTime: 1704067200000,
        endTime: 1709251200000,
        output: 'table',
      });
    });

    it('should display max concurrent in table format', async () => {
      mockStatisticsService.getMaxConcurrent.mockResolvedValueOnce(180);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const options: StatisticsMaxConcurrentOptions = {
        channelId: '3151318',
        startTime: 1704067200000, // 2024-01-01
        endTime: 1709251200000, // 2024-03-01 (59 days, within 3 months)
      };

      await handler.viewMaxConcurrent(options);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('180')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('最高并发')
      );

      consoleSpy.mockRestore();
    });

    it('should display max concurrent in JSON format', async () => {
      mockStatisticsService.getMaxConcurrent.mockResolvedValueOnce(180);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const options: StatisticsMaxConcurrentOptions = {
        channelId: '3151318',
        startTime: 1704067200000, // 2024-01-01
        endTime: 1709251200000, // 2024-03-01 (59 days, within 3 months)
        output: 'json',
      };

      await handler.viewMaxConcurrent(options);

      expect(consoleSpy).toHaveBeenCalled();
      const output = consoleSpy.mock.calls.map(c => c.join(' ')).join('\n');
      expect(output).toContain('180');
      expect(output).toContain('maxConcurrent');

      consoleSpy.mockRestore();
    });

    it('should display 0 when no data in range', async () => {
      mockStatisticsService.getMaxConcurrent.mockResolvedValueOnce(0);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const options: StatisticsMaxConcurrentOptions = {
        channelId: '3151318',
        startTime: 1704067200000,
        endTime: 1704153600000,
      };

      await handler.viewMaxConcurrent(options);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('0')
      );

      consoleSpy.mockRestore();
    });
  });

  // ============================================
  // AC4: Timestamp range validation
  // ============================================

  describe('viewMaxConcurrent timestamp range validation (AC4)', () => {
    it('should accept valid timestamp range within 3 months', async () => {
      mockStatisticsService.getMaxConcurrent.mockResolvedValueOnce(100);

      const options: StatisticsMaxConcurrentOptions = {
        channelId: '3151318',
        startTime: 1704067200000, // 2024-01-01
        endTime: 1709251200000, // 2024-03-01
      };

      await expect(handler.viewMaxConcurrent(options)).resolves.not.toThrow();
    });

    // Note: Validation for timestamp range exceeding 3 months happens in command layer
    // via validateTimestampRange function in date-validation.ts

    // Note: Validation for startTime > endTime happens in command layer
    // via validateTimestampRange function in date-validation.ts
  });

  // Note: Validation happens in command layer, not handler
  // The handler simply delegates to SDK service without additional validation

  // ============================================
  // Error handling
  // ============================================

  describe('error handling', () => {
    it('should handle service errors in viewConcurrency', async () => {
      mockStatisticsService.getConcurrencyData.mockRejectedValueOnce(
        new Error('API error')
      );

      const options: StatisticsConcurrencyOptions = {
        channelId: '3151318',
        startDate: '2024-01-01',
        endDate: '2024-01-07',
      };

      await expect(handler.viewConcurrency(options)).rejects.toThrow('API error');
    });

    it('should handle service errors in viewMaxConcurrent', async () => {
      mockStatisticsService.getMaxConcurrent.mockRejectedValueOnce(
        new Error('API error')
      );

      const options: StatisticsMaxConcurrentOptions = {
        channelId: '3151318',
        startTime: 1704067200000,
        endTime: 1704153600000,
      };

      await expect(handler.viewMaxConcurrent(options)).rejects.toThrow('API error');
    });
  });
});
