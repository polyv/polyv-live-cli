/**
 * @fileoverview Execution tests for Statistics commands
 * @story Week 3: Statistics Commands 测试覆盖率改进
 *
 * These tests verify the actual execution of statistics commands
 * with mocked handlers and services.
 */

import { Command } from 'commander';
import { registerStatisticsCommands } from './statistics.commands';
import { StatisticsHandler } from '../handlers/statistics.handler';

// Mock the StatisticsHandler
jest.mock('../handlers/statistics.handler');

// Mock auth and config modules
jest.mock('../config/auth-adapter', () => ({
  authAdapter: {
    tryGetAuthConfig: jest.fn().mockReturnValue({
      config: {
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
        userId: 'test-user-id',
      },
      source: 'test',
      accountName: 'test-account',
    }),
    getStatusMessage: jest.fn().mockReturnValue('Authentication required'),
    getDiagnostics: jest.fn().mockReturnValue({
      availableSources: [],
      errors: [],
    }),
  },
}));

jest.mock('../config/manager', () => ({
  configManager: {
    load: jest.fn().mockResolvedValue({
      config: {
        baseUrl: 'https://api.polyv.net',
        timeout: 30000,
        debug: false,
      },
    }),
  },
}));

// Mock process.exit
const mockExit = jest.spyOn(process, 'exit').mockImplementation((code) => {
  throw new Error(`process.exit:${code}`);
});

// Suppress console output during tests
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('Statistics Commands Execution Tests', () => {
  let program: Command;
  let mockStatisticsHandler: jest.Mocked<StatisticsHandler>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock handler instance
    mockStatisticsHandler = {
      viewStatistics: jest.fn().mockResolvedValue(undefined),
      viewConcurrency: jest.fn().mockResolvedValue(undefined),
      viewMaxConcurrent: jest.fn().mockResolvedValue(undefined),
      viewRegionDistribution: jest.fn().mockResolvedValue(undefined),
      viewDeviceDistribution: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<StatisticsHandler>;

    // Mock the constructor to return our mock instance
    (StatisticsHandler as jest.Mock).mockImplementation(() => mockStatisticsHandler);

    // Create fresh program for each test
    program = new Command();
    program.exitOverride();
    registerStatisticsCommands(program);
  });

  afterAll(() => {
    mockExit.mockRestore();
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  // ============================================
  // Statistics View Command Execution Tests
  // ============================================

  describe('statistics view command execution', () => {
    it('should execute view command with required options', async () => {
      await program.parseAsync([
        'node',
        'cli',
        'statistics',
        'view',
        '--channel-id',
        '3151318',
        '--start-day',
        '2024-01-01',
        '--end-day',
        '2024-01-15',
      ]);

      expect(mockStatisticsHandler.viewStatistics).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '3151318',
          startDay: '2024-01-01',
          endDay: '2024-01-15',
        })
      );
    });

    it('should execute view command with short options', async () => {
      await program.parseAsync([
        'node',
        'cli',
        'statistics',
        'view',
        '-c',
        '3151318',
        '--start-day',
        '2024-01-01',
        '--end-day',
        '2024-01-15',
      ]);

      expect(mockStatisticsHandler.viewStatistics).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '3151318',
        })
      );
    });

    it('should execute view command with JSON output', async () => {
      await program.parseAsync([
        'node',
        'cli',
        'statistics',
        'view',
        '--channel-id',
        '3151318',
        '--start-day',
        '2024-01-01',
        '--end-day',
        '2024-01-15',
        '--output',
        'json',
      ]);

      expect(mockStatisticsHandler.viewStatistics).toHaveBeenCalledWith(
        expect.objectContaining({
          output: 'json',
        })
      );
    });

    it('should execute view command with table output', async () => {
      await program.parseAsync([
        'node',
        'cli',
        'statistics',
        'view',
        '--channel-id',
        '3151318',
        '--start-day',
        '2024-01-01',
        '--end-day',
        '2024-01-15',
        '--output',
        'table',
      ]);

      expect(mockStatisticsHandler.viewStatistics).toHaveBeenCalledWith(
        expect.objectContaining({
          output: 'table',
        })
      );
    });

    it('should fail when channel-id is missing', async () => {
      await expect(
        program.parseAsync([
          'node',
          'cli',
          'statistics',
          'view',
          '--start-day',
          '2024-01-01',
          '--end-day',
          '2024-01-15',
        ])
      ).rejects.toThrow();
    });

    it('should fail when start-day is missing', async () => {
      await expect(
        program.parseAsync([
          'node',
          'cli',
          'statistics',
          'view',
          '--channel-id',
          '3151318',
          '--end-day',
          '2024-01-15',
        ])
      ).rejects.toThrow();
    });

    it('should fail when end-day is missing', async () => {
      await expect(
        program.parseAsync([
          'node',
          'cli',
          'statistics',
          'view',
          '--channel-id',
          '3151318',
          '--start-day',
          '2024-01-01',
        ])
      ).rejects.toThrow();
    });

    it('should handle handler errors gracefully', async () => {
      mockStatisticsHandler.viewStatistics.mockRejectedValueOnce(new Error('API Error'));

      await expect(
        program.parseAsync([
          'node',
          'cli',
          'statistics',
          'view',
          '--channel-id',
          '3151318',
          '--start-day',
          '2024-01-01',
          '--end-day',
          '2024-01-15',
        ])
      ).rejects.toThrow();
    });
  });

  // ============================================
  // Statistics Concurrency Command Execution Tests
  // ============================================

  describe('statistics concurrency command execution', () => {
    it('should execute concurrency command with required options', async () => {
      await program.parseAsync([
        'node',
        'cli',
        'statistics',
        'concurrency',
        '--channel-id',
        '3151318',
        '--start-date',
        '2024-01-01',
        '--end-date',
        '2024-01-15',
      ]);

      expect(mockStatisticsHandler.viewConcurrency).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '3151318',
          startDate: '2024-01-01',
          endDate: '2024-01-15',
        })
      );
    });

    it('should execute concurrency command with JSON output', async () => {
      await program.parseAsync([
        'node',
        'cli',
        'statistics',
        'concurrency',
        '--channel-id',
        '3151318',
        '--start-date',
        '2024-01-01',
        '--end-date',
        '2024-01-15',
        '--output',
        'json',
      ]);

      expect(mockStatisticsHandler.viewConcurrency).toHaveBeenCalledWith(
        expect.objectContaining({
          output: 'json',
        })
      );
    });

    it('should execute concurrency command with short channel-id option', async () => {
      await program.parseAsync([
        'node',
        'cli',
        'statistics',
        'concurrency',
        '-c',
        '3151318',
        '--start-date',
        '2024-01-01',
        '--end-date',
        '2024-01-15',
      ]);

      expect(mockStatisticsHandler.viewConcurrency).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '3151318',
        })
      );
    });

    it('should fail when channel-id is missing', async () => {
      await expect(
        program.parseAsync([
          'node',
          'cli',
          'statistics',
          'concurrency',
          '--start-date',
          '2024-01-01',
          '--end-date',
          '2024-01-15',
        ])
      ).rejects.toThrow();
    });

    it('should handle handler errors gracefully', async () => {
      mockStatisticsHandler.viewConcurrency.mockRejectedValueOnce(new Error('API Error'));

      await expect(
        program.parseAsync([
          'node',
          'cli',
          'statistics',
          'concurrency',
          '--channel-id',
          '3151318',
          '--start-date',
          '2024-01-01',
          '--end-date',
          '2024-01-15',
        ])
      ).rejects.toThrow();
    });
  });

  // ============================================
  // Statistics Max-Concurrent Command Execution Tests
  // ============================================
  // Note: Time range must not exceed 3 months (MAX_TIME_RANGE_MS = ~90 days)
  // Valid range: 1704067200000 (2024-01-01) to 1709251200000 (2024-03-01) = 60 days

  describe('statistics max-concurrent command execution', () => {
    it('should execute max-concurrent command with required options', async () => {
      await program.parseAsync([
        'node',
        'cli',
        'statistics',
        'max-concurrent',
        '--channel-id',
        '3151318',
        '--start-time',
        '1704067200000',
        '--end-time',
        '1709251200000',
      ]);

      expect(mockStatisticsHandler.viewMaxConcurrent).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '3151318',
          startTime: 1704067200000,
          endTime: 1709251200000,
        })
      );
    });

    it('should execute max-concurrent command with JSON output', async () => {
      await program.parseAsync([
        'node',
        'cli',
        'statistics',
        'max-concurrent',
        '--channel-id',
        '3151318',
        '--start-time',
        '1704067200000',
        '--end-time',
        '1709251200000',
        '--output',
        'json',
      ]);

      expect(mockStatisticsHandler.viewMaxConcurrent).toHaveBeenCalledWith(
        expect.objectContaining({
          output: 'json',
        })
      );
    });

    it('should parse timestamp options as numbers', async () => {
      await program.parseAsync([
        'node',
        'cli',
        'statistics',
        'max-concurrent',
        '--channel-id',
        '3151318',
        '--start-time',
        '1704067200000',
        '--end-time',
        '1709251200000',
      ]);

      const callArgs = mockStatisticsHandler.viewMaxConcurrent.mock.calls[0][0];
      expect(typeof callArgs.startTime).toBe('number');
      expect(typeof callArgs.endTime).toBe('number');
    });

    it('should fail when required options are missing', async () => {
      await expect(
        program.parseAsync([
          'node',
          'cli',
          'statistics',
          'max-concurrent',
          '--channel-id',
          '3151318',
        ])
      ).rejects.toThrow();
    });

    it('should handle handler errors gracefully', async () => {
      mockStatisticsHandler.viewMaxConcurrent.mockRejectedValueOnce(new Error('API Error'));

      await expect(
        program.parseAsync([
          'node',
          'cli',
          'statistics',
          'max-concurrent',
          '--channel-id',
          '3151318',
          '--start-time',
          '1704067200000',
          '--end-time',
          '1709251200000',
        ])
      ).rejects.toThrow();
    });
  });

  // ============================================
  // Statistics Audience Region Command Execution Tests
  // ============================================

  describe('statistics audience region command execution', () => {
    it('should execute region command with required options', async () => {
      await program.parseAsync([
        'node',
        'cli',
        'statistics',
        'audience',
        'region',
        '--channel-id',
        '3151318',
        '--start-time',
        '1648742400000',
        '--end-time',
        '1651334399000',
      ]);

      expect(mockStatisticsHandler.viewRegionDistribution).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '3151318',
          startTime: 1648742400000,
          endTime: 1651334399000,
        })
      );
    });

    it('should execute region command with type parameter', async () => {
      await program.parseAsync([
        'node',
        'cli',
        'statistics',
        'audience',
        'region',
        '--channel-id',
        '3151318',
        '--start-time',
        '1648742400000',
        '--end-time',
        '1651334399000',
        '--type',
        'city',
      ]);

      expect(mockStatisticsHandler.viewRegionDistribution).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'city',
        })
      );
    });

    it('should execute region command with JSON output', async () => {
      await program.parseAsync([
        'node',
        'cli',
        'statistics',
        'audience',
        'region',
        '--channel-id',
        '3151318',
        '--start-time',
        '1648742400000',
        '--end-time',
        '1651334399000',
        '--output',
        'json',
      ]);

      expect(mockStatisticsHandler.viewRegionDistribution).toHaveBeenCalledWith(
        expect.objectContaining({
          output: 'json',
        })
      );
    });

    it('should use province as default type', async () => {
      await program.parseAsync([
        'node',
        'cli',
        'statistics',
        'audience',
        'region',
        '--channel-id',
        '3151318',
        '--start-time',
        '1648742400000',
        '--end-time',
        '1651334399000',
      ]);

      expect(mockStatisticsHandler.viewRegionDistribution).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'province',
        })
      );
    });

    it('should fail when required options are missing', async () => {
      await expect(
        program.parseAsync([
          'node',
          'cli',
          'statistics',
          'audience',
          'region',
          '--start-time',
          '1648742400000',
          '--end-time',
          '1651334399000',
        ])
      ).rejects.toThrow();
    });

    it('should handle handler errors gracefully', async () => {
      mockStatisticsHandler.viewRegionDistribution.mockRejectedValueOnce(new Error('API Error'));

      await expect(
        program.parseAsync([
          'node',
          'cli',
          'statistics',
          'audience',
          'region',
          '--channel-id',
          '3151318',
          '--start-time',
          '1648742400000',
          '--end-time',
          '1651334399000',
        ])
      ).rejects.toThrow();
    });
  });

  // ============================================
  // Statistics Audience Device Command Execution Tests
  // ============================================

  describe('statistics audience device command execution', () => {
    it('should execute device command with required options', async () => {
      await program.parseAsync([
        'node',
        'cli',
        'statistics',
        'audience',
        'device',
        '--channel-id',
        '3151318',
        '--start-time',
        '1651386101000',
        '--end-time',
        '1652336501462',
      ]);

      expect(mockStatisticsHandler.viewDeviceDistribution).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '3151318',
          startTime: 1651386101000,
          endTime: 1652336501462,
        })
      );
    });

    it('should execute device command with JSON output', async () => {
      await program.parseAsync([
        'node',
        'cli',
        'statistics',
        'audience',
        'device',
        '--channel-id',
        '3151318',
        '--start-time',
        '1651386101000',
        '--end-time',
        '1652336501462',
        '--output',
        'json',
      ]);

      expect(mockStatisticsHandler.viewDeviceDistribution).toHaveBeenCalledWith(
        expect.objectContaining({
          output: 'json',
        })
      );
    });

    it('should execute device command with short channel-id option', async () => {
      await program.parseAsync([
        'node',
        'cli',
        'statistics',
        'audience',
        'device',
        '-c',
        '3151318',
        '--start-time',
        '1651386101000',
        '--end-time',
        '1652336501462',
      ]);

      expect(mockStatisticsHandler.viewDeviceDistribution).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '3151318',
        })
      );
    });

    it('should fail when required options are missing', async () => {
      await expect(
        program.parseAsync([
          'node',
          'cli',
          'statistics',
          'audience',
          'device',
          '--start-time',
          '1651386101000',
          '--end-time',
          '1652336501462',
        ])
      ).rejects.toThrow();
    });

    it('should handle handler errors gracefully', async () => {
      mockStatisticsHandler.viewDeviceDistribution.mockRejectedValueOnce(new Error('API Error'));

      await expect(
        program.parseAsync([
          'node',
          'cli',
          'statistics',
          'audience',
          'device',
          '--channel-id',
          '3151318',
          '--start-time',
          '1651386101000',
          '--end-time',
          '1652336501462',
        ])
      ).rejects.toThrow();
    });
  });

  // ============================================
  // Output Format Tests
  // ============================================

  describe('output format validation', () => {
    it('should use table as default output format for view', async () => {
      await program.parseAsync([
        'node',
        'cli',
        'statistics',
        'view',
        '--channel-id',
        '3151318',
        '--start-day',
        '2024-01-01',
        '--end-day',
        '2024-01-15',
      ]);

      expect(mockStatisticsHandler.viewStatistics).toHaveBeenCalledWith(
        expect.objectContaining({
          output: 'table',
        })
      );
    });

    it('should use table as default output format for concurrency', async () => {
      await program.parseAsync([
        'node',
        'cli',
        'statistics',
        'concurrency',
        '--channel-id',
        '3151318',
        '--start-date',
        '2024-01-01',
        '--end-date',
        '2024-01-15',
      ]);

      expect(mockStatisticsHandler.viewConcurrency).toHaveBeenCalledWith(
        expect.objectContaining({
          output: 'table',
        })
      );
    });

    it('should use table as default output format for max-concurrent', async () => {
      await program.parseAsync([
        'node',
        'cli',
        'statistics',
        'max-concurrent',
        '--channel-id',
        '3151318',
        '--start-time',
        '1704067200000',
        '--end-time',
        '1709251200000',
      ]);

      expect(mockStatisticsHandler.viewMaxConcurrent).toHaveBeenCalledWith(
        expect.objectContaining({
          output: 'table',
        })
      );
    });

    it('should use table as default output format for region', async () => {
      await program.parseAsync([
        'node',
        'cli',
        'statistics',
        'audience',
        'region',
        '--channel-id',
        '3151318',
        '--start-time',
        '1648742400000',
        '--end-time',
        '1651334399000',
      ]);

      expect(mockStatisticsHandler.viewRegionDistribution).toHaveBeenCalledWith(
        expect.objectContaining({
          output: 'table',
        })
      );
    });

    it('should use table as default output format for device', async () => {
      await program.parseAsync([
        'node',
        'cli',
        'statistics',
        'audience',
        'device',
        '--channel-id',
        '3151318',
        '--start-time',
        '1651386101000',
        '--end-time',
        '1652336501462',
      ]);

      expect(mockStatisticsHandler.viewDeviceDistribution).toHaveBeenCalledWith(
        expect.objectContaining({
          output: 'table',
        })
      );
    });
  });

  // ============================================
  // Date Validation Tests
  // ============================================

  describe('date validation', () => {
    it('should reject invalid date format for view command', async () => {
      await expect(
        program.parseAsync([
          'node',
          'cli',
          'statistics',
          'view',
          '--channel-id',
          '3151318',
          '--start-day',
          '2024/01/01',
          '--end-day',
          '2024-01-15',
        ])
      ).rejects.toThrow();
    });

    it('should reject invalid date format for concurrency command', async () => {
      await expect(
        program.parseAsync([
          'node',
          'cli',
          'statistics',
          'concurrency',
          '--channel-id',
          '3151318',
          '--start-date',
          '2024.01.01',
          '--end-date',
          '2024-01-15',
        ])
      ).rejects.toThrow();
    });
  });
});
