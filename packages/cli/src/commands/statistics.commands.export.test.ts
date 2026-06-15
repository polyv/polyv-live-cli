/**
 * @fileoverview Unit tests for Statistics Export commands - ATDD Failing Tests (RED Phase)
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
 * - AC8: 表格输出格式清晰，显示导出状态和文件路径/链接
 * - AC9: JSON 输出完整包含所有字段
 * - AC10: 支持 `--channel-id` 参数指定频道（viewlog 必需，session 可选）
 */

import { Command } from 'commander';
import {
  registerStatisticsExportCommands,
  validateDateTimeFormat,
  validateWatchType,
  validateSameMonth,
} from './statistics.commands.export';
import { authAdapter } from '../config/auth-adapter';
import { configManager } from '../config/manager';
import { suppressConsole, mockProcessExit, mockAuthSuccess, mockAuthFailure, mockConfigError } from '../utils/test-helpers';

// Mock dependencies
jest.mock('../config/auth-adapter');
jest.mock('../config/manager');
jest.mock('../handlers/statistics.handler');
jest.mock('../utils/errors', () => ({
  logError: jest.fn(),
}));

describe('Statistics Export Commands (Story 10.4 - ATDD RED Phase)', () => {
  // ============================================
  // Command Registration Tests
  // ============================================

  describe('command registration', () => {
    let program: Command;

    beforeEach(() => {
      program = new Command();
      // Create the parent 'statistics' command first
      program.command('statistics').description('Statistics commands');
      registerStatisticsExportCommands(program);
    });

    it('should register statistics export command group', () => {
      // THIS TEST WILL FAIL - Command not implemented yet
      const statisticsCmd = program.commands.find((cmd) => cmd.name() === 'statistics');
      const exportCmd = statisticsCmd?.commands.find((cmd) => cmd.name() === 'export');

      expect(exportCmd).toBeDefined();
      expect(exportCmd?.description()).toContain('export');
    });

    it('should register statistics export viewlog subcommand', () => {
      // THIS TEST WILL FAIL - Command not implemented yet
      const statisticsCmd = program.commands.find((cmd) => cmd.name() === 'statistics');
      const exportCmd = statisticsCmd?.commands.find((cmd) => cmd.name() === 'export');
      const viewlogCmd = exportCmd?.commands.find((cmd) => cmd.name() === 'viewlog');

      expect(viewlogCmd).toBeDefined();
      expect(viewlogCmd?.description()).toContain('观看日志');
    });

    it('should register statistics export session subcommand', () => {
      // THIS TEST WILL FAIL - Command not implemented yet
      const statisticsCmd = program.commands.find((cmd) => cmd.name() === 'statistics');
      const exportCmd = statisticsCmd?.commands.find((cmd) => cmd.name() === 'export');
      const sessionCmd = exportCmd?.commands.find((cmd) => cmd.name() === 'session');

      expect(sessionCmd).toBeDefined();
      expect(sessionCmd?.description()).toContain('场次报表');
    });
  });

  // ============================================
  // AC1, AC3, AC4, AC5, AC10: Viewlog Command Options
  // ============================================

  describe('statistics export viewlog command options', () => {
    let program: Command;

    beforeEach(() => {
      program = new Command();
      // Create the parent 'statistics' command first
      program.command('statistics').description('Statistics commands');
      registerStatisticsExportCommands(program);
    });

    it('should register required --channel-id option (AC10)', () => {
      // THIS TEST WILL FAIL - Command not implemented yet
      const statisticsCmd = program.commands.find((cmd) => cmd.name() === 'statistics');
      const exportCmd = statisticsCmd?.commands.find((cmd) => cmd.name() === 'export');
      const viewlogCmd = exportCmd?.commands.find((cmd) => cmd.name() === 'viewlog');

      const options = viewlogCmd?.options || [];
      const channelIdOption = options.find((opt) => opt.long === '--channel-id');

      expect(channelIdOption).toBeDefined();
      expect(channelIdOption?.required).toBe(true);
    });

    it('should register --channel-id with short option -c (AC10)', () => {
      // THIS TEST WILL FAIL - Command not implemented yet
      const statisticsCmd = program.commands.find((cmd) => cmd.name() === 'statistics');
      const exportCmd = statisticsCmd?.commands.find((cmd) => cmd.name() === 'export');
      const viewlogCmd = exportCmd?.commands.find((cmd) => cmd.name() === 'viewlog');

      const options = viewlogCmd?.options || [];
      const channelIdOption = options.find((opt) => opt.long === '--channel-id');

      expect(channelIdOption?.short).toBe('-c');
    });

    it('should register --start-time option (AC3)', () => {
      // THIS TEST WILL FAIL - Command not implemented yet
      const statisticsCmd = program.commands.find((cmd) => cmd.name() === 'statistics');
      const exportCmd = statisticsCmd?.commands.find((cmd) => cmd.name() === 'export');
      const viewlogCmd = exportCmd?.commands.find((cmd) => cmd.name() === 'viewlog');

      const options = viewlogCmd?.options || [];
      const optionNames = options.map((opt) => opt.long);

      expect(optionNames).toContain('--start-time');
    });

    it('should register --end-time option (AC3)', () => {
      // THIS TEST WILL FAIL - Command not implemented yet
      const statisticsCmd = program.commands.find((cmd) => cmd.name() === 'statistics');
      const exportCmd = statisticsCmd?.commands.find((cmd) => cmd.name() === 'export');
      const viewlogCmd = exportCmd?.commands.find((cmd) => cmd.name() === 'viewlog');

      const options = viewlogCmd?.options || [];
      const optionNames = options.map((opt) => opt.long);

      expect(optionNames).toContain('--end-time');
    });

    it('should register --watch-type option (AC4)', () => {
      // THIS TEST WILL FAIL - Command not implemented yet
      const statisticsCmd = program.commands.find((cmd) => cmd.name() === 'statistics');
      const exportCmd = statisticsCmd?.commands.find((cmd) => cmd.name() === 'export');
      const viewlogCmd = exportCmd?.commands.find((cmd) => cmd.name() === 'viewlog');

      const options = viewlogCmd?.options || [];
      const optionNames = options.map((opt) => opt.long);

      expect(optionNames).toContain('--watch-type');
    });

    it('should register --output option (AC5)', () => {
      // THIS TEST WILL FAIL - Command not implemented yet
      const statisticsCmd = program.commands.find((cmd) => cmd.name() === 'statistics');
      const exportCmd = statisticsCmd?.commands.find((cmd) => cmd.name() === 'export');
      const viewlogCmd = exportCmd?.commands.find((cmd) => cmd.name() === 'viewlog');

      const options = viewlogCmd?.options || [];
      const optionNames = options.map((opt) => opt.long);

      expect(optionNames).toContain('--output');
    });

    it('should register -o as short option for --output (AC5)', () => {
      // THIS TEST WILL FAIL - Command not implemented yet
      const statisticsCmd = program.commands.find((cmd) => cmd.name() === 'statistics');
      const exportCmd = statisticsCmd?.commands.find((cmd) => cmd.name() === 'export');
      const viewlogCmd = exportCmd?.commands.find((cmd) => cmd.name() === 'viewlog');

      const options = viewlogCmd?.options || [];
      const outputOption = options.find((opt) => opt.long === '--output');

      expect(outputOption?.short).toBe('-o');
    });

    it('should show usage example in help', () => {
      // THIS TEST WILL FAIL - Command not implemented yet
      const statisticsCmd = program.commands.find((cmd) => cmd.name() === 'statistics');
      const exportCmd = statisticsCmd?.commands.find((cmd) => cmd.name() === 'export');
      const viewlogCmd = exportCmd?.commands.find((cmd) => cmd.name() === 'viewlog');

      const helpText = viewlogCmd?.helpInformation();

      expect(helpText).toContain('--channel-id');
      expect(helpText).toContain('--start-time');
      expect(helpText).toContain('--end-time');
    });
  });

  // ============================================
  // AC2, AC6, AC7, AC10: Session Command Options
  // ============================================

  describe('statistics export session command options', () => {
    let program: Command;

    beforeEach(() => {
      program = new Command();
      // Create the parent 'statistics' command first
      program.command('statistics').description('Statistics commands');
      registerStatisticsExportCommands(program);
    });

    it('should register required --channel-id option (AC10)', () => {
      // THIS TEST WILL FAIL - Command not implemented yet
      const statisticsCmd = program.commands.find((cmd) => cmd.name() === 'statistics');
      const exportCmd = statisticsCmd?.commands.find((cmd) => cmd.name() === 'export');
      const sessionCmd = exportCmd?.commands.find((cmd) => cmd.name() === 'session');

      const options = sessionCmd?.options || [];
      const channelIdOption = options.find((opt) => opt.long === '--channel-id');

      expect(channelIdOption).toBeDefined();
      expect(channelIdOption?.required).toBe(true);
    });

    it('should register required --session-id option (AC6)', () => {
      // THIS TEST WILL FAIL - Command not implemented yet
      const statisticsCmd = program.commands.find((cmd) => cmd.name() === 'statistics');
      const exportCmd = statisticsCmd?.commands.find((cmd) => cmd.name() === 'export');
      const sessionCmd = exportCmd?.commands.find((cmd) => cmd.name() === 'session');

      const options = sessionCmd?.options || [];
      const sessionIdOption = options.find((opt) => opt.long === '--session-id');

      expect(sessionIdOption).toBeDefined();
      expect(sessionIdOption?.required).toBe(true);
    });

    it('should register --output option', () => {
      // THIS TEST WILL FAIL - Command not implemented yet
      const statisticsCmd = program.commands.find((cmd) => cmd.name() === 'statistics');
      const exportCmd = statisticsCmd?.commands.find((cmd) => cmd.name() === 'export');
      const sessionCmd = exportCmd?.commands.find((cmd) => cmd.name() === 'session');

      const options = sessionCmd?.options || [];
      const optionNames = options.map((opt) => opt.long);

      expect(optionNames).toContain('--output');
    });

    it('should show usage example in help', () => {
      // THIS TEST WILL FAIL - Command not implemented yet
      const statisticsCmd = program.commands.find((cmd) => cmd.name() === 'statistics');
      const exportCmd = statisticsCmd?.commands.find((cmd) => cmd.name() === 'export');
      const sessionCmd = exportCmd?.commands.find((cmd) => cmd.name() === 'session');

      const helpText = sessionCmd?.helpInformation();

      expect(helpText).toContain('--channel-id');
      expect(helpText).toContain('--session-id');
    });
  });

  // ============================================
  // Validation Helpers
  // ============================================

  describe('validateDateTimeFormat', () => {
    it('should accept valid date time format yyyy-MM-dd HH:mm:ss', () => {
      // THIS TEST WILL FAIL - Function not implemented yet
      expect(validateDateTimeFormat('2024-01-01 00:00:00')).toBe('2024-01-01 00:00:00');
    });

    it('should reject invalid date time format', () => {
      // THIS TEST WILL FAIL - Function not implemented yet
      expect(() => validateDateTimeFormat('2024/01/01')).toThrow(
        'DateTime format must be yyyy-MM-dd HH:mm:ss'
      );
    });

    it('should reject date only without time', () => {
      // THIS TEST WILL FAIL - Function not implemented yet
      expect(() => validateDateTimeFormat('2024-01-01')).toThrow(
        'DateTime format must be yyyy-MM-dd HH:mm:ss'
      );
    });

    it('should reject empty string', () => {
      // THIS TEST WILL FAIL - Function not implemented yet
      expect(() => validateDateTimeFormat('')).toThrow(
        'DateTime format must be yyyy-MM-dd HH:mm:ss'
      );
    });
  });

  describe('validateWatchType', () => {
    it('should accept "live" watchType', () => {
      // THIS TEST WILL FAIL - Function not implemented yet
      expect(validateWatchType('live')).toBe('live');
    });

    it('should accept "vod" watchType', () => {
      // THIS TEST WILL FAIL - Function not implemented yet
      expect(validateWatchType('vod')).toBe('vod');
    });

    it('should reject invalid watchType', () => {
      // THIS TEST WILL FAIL - Function not implemented yet
      expect(() => validateWatchType('invalid')).toThrow(
        'watchType must be either "live" or "vod"'
      );
    });
  });

  describe('validateSameMonth', () => {
    it('should accept dates in the same month', () => {
      // THIS TEST WILL FAIL - Function not implemented yet
      expect(() =>
        validateSameMonth('2024-01-01 00:00:00', '2024-01-31 23:59:59')
      ).not.toThrow();
    });

    it('should reject dates in different months', () => {
      // THIS TEST WILL FAIL - Function not implemented yet
      expect(() =>
        validateSameMonth('2024-01-01 00:00:00', '2024-02-28 23:59:59')
      ).toThrow('startDate and endDate must be in the same month');
    });

    it('should accept same day', () => {
      // THIS TEST WILL FAIL - Function not implemented yet
      expect(() =>
        validateSameMonth('2024-01-15 00:00:00', '2024-01-15 23:59:59')
      ).not.toThrow();
    });
  });

  // ============================================
  // Help Information Tests
  // ============================================

  describe('help information', () => {
    let program: Command;

    beforeEach(() => {
      program = new Command();
      // Create the parent 'statistics' command first
      program.command('statistics').description('Statistics commands');
      registerStatisticsExportCommands(program);
    });

    it('should include basic help information for viewlog command', () => {
      // THIS TEST WILL FAIL - Command not implemented yet
      const statisticsCmd = program.commands.find((cmd) => cmd.name() === 'statistics');
      const exportCmd = statisticsCmd?.commands.find((cmd) => cmd.name() === 'export');
      const viewlogCmd = exportCmd?.commands.find((cmd) => cmd.name() === 'viewlog');

      const helpText = viewlogCmd?.helpInformation();

      expect(helpText).toContain('--channel-id');
      expect(helpText).toContain('--start-time');
      expect(helpText).toContain('--end-time');
      expect(helpText).toContain('--watch-type');
      expect(helpText).toContain('--output');
    });

    it('should include basic help information for session command', () => {
      // THIS TEST WILL FAIL - Command not implemented yet
      const statisticsCmd = program.commands.find((cmd) => cmd.name() === 'statistics');
      const exportCmd = statisticsCmd?.commands.find((cmd) => cmd.name() === 'export');
      const sessionCmd = exportCmd?.commands.find((cmd) => cmd.name() === 'session');

      const helpText = sessionCmd?.helpInformation();

      expect(helpText).toContain('--channel-id');
      expect(helpText).toContain('--session-id');
      expect(helpText).toContain('--output');
    });

    it('should show export command examples', () => {
      // THIS TEST WILL FAIL - Command not implemented yet
      const statisticsCmd = program.commands.find((cmd) => cmd.name() === 'statistics');
      const exportCmd = statisticsCmd?.commands.find((cmd) => cmd.name() === 'export');

      const helpText = exportCmd?.helpInformation();

      // Should contain the command usage pattern
      expect(helpText).toBeDefined();
    });
  });
});

// ============================================================
// Action execution tests
// ============================================================
describe('action execution', () => {
  let restoreConsole: () => void;
  let restoreExit: () => void;
  let MockStatisticsHandler: jest.Mock;

  const createTestProgram = (): Command => {
    const program = new Command();
    program.exitOverride();
    // Create the parent statistics command first
    program.command('statistics').description('Statistics commands');
    return program;
  };

  beforeEach(() => {
    restoreConsole = suppressConsole();
    restoreExit = mockProcessExit();
    MockStatisticsHandler = require('../handlers/statistics.handler').StatisticsHandler;
    MockStatisticsHandler.mockClear();
    mockAuthSuccess(authAdapter as jest.Mocked<typeof authAdapter>, configManager as jest.Mocked<typeof configManager>);
  });

  afterEach(() => {
    restoreConsole();
    restoreExit();
  });

  describe('viewlog action', () => {
    it('[P0] should call exportViewlog handler with correct params', async () => {
      const mockHandler = { exportViewlog: jest.fn().mockResolvedValue(undefined) };
      MockStatisticsHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerStatisticsExportCommands(program);
      await program.parseAsync([
        'node', 'test', 'statistics', 'export', 'viewlog',
        '-c', '3151318',
        '--start-time', '2024-01-01 00:00:00',
        '--end-time', '2024-01-31 23:59:59',
      ]);

      expect(MockStatisticsHandler).toHaveBeenCalled();
      expect(mockHandler.exportViewlog).toHaveBeenCalledWith({
        channelId: '3151318',
        startTime: '2024-01-01 00:00:00',
        endTime: '2024-01-31 23:59:59',
        output: 'table',
      });
    });

    it('[P1] should call exportViewlog with watch-type filter', async () => {
      const mockHandler = { exportViewlog: jest.fn().mockResolvedValue(undefined) };
      MockStatisticsHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerStatisticsExportCommands(program);
      await program.parseAsync([
        'node', 'test', 'statistics', 'export', 'viewlog',
        '-c', '3151318',
        '--start-time', '2024-01-01 00:00:00',
        '--end-time', '2024-01-31 23:59:59',
        '--watch-type', 'live',
      ]);

      expect(mockHandler.exportViewlog).toHaveBeenCalledWith(
        expect.objectContaining({
          watchType: 'live',
        })
      );
    });

    it('[P1] should call exportViewlog with output-file option', async () => {
      const mockHandler = { exportViewlog: jest.fn().mockResolvedValue(undefined) };
      MockStatisticsHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerStatisticsExportCommands(program);
      await program.parseAsync([
        'node', 'test', 'statistics', 'export', 'viewlog',
        '-c', '3151318',
        '--start-time', '2024-01-01 00:00:00',
        '--end-time', '2024-01-31 23:59:59',
        '--output-file', './viewlog.csv',
      ]);

      expect(mockHandler.exportViewlog).toHaveBeenCalledWith(
        expect.objectContaining({
          outputFile: './viewlog.csv',
        })
      );
    });

    it('[P1] should call exportViewlog with json output', async () => {
      const mockHandler = { exportViewlog: jest.fn().mockResolvedValue(undefined) };
      MockStatisticsHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerStatisticsExportCommands(program);
      await program.parseAsync([
        'node', 'test', 'statistics', 'export', 'viewlog',
        '-c', '3151318',
        '--start-time', '2024-01-01 00:00:00',
        '--end-time', '2024-01-31 23:59:59',
        '-o', 'json',
      ]);

      expect(mockHandler.exportViewlog).toHaveBeenCalledWith(
        expect.objectContaining({
          output: 'json',
        })
      );
    });

    it('[P1] should handle API errors in viewlog action', async () => {
      const mockHandler = { exportViewlog: jest.fn().mockRejectedValue(new Error('Export failed')) };
      MockStatisticsHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerStatisticsExportCommands(program);
      await expect(program.parseAsync([
        'node', 'test', 'statistics', 'export', 'viewlog',
        '-c', '3151318',
        '--start-time', '2024-01-01 00:00:00',
        '--end-time', '2024-01-31 23:59:59',
      ])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });

  describe('session action', () => {
    it('[P0] should call exportSessionStats handler with correct params', async () => {
      const mockHandler = { exportSessionStats: jest.fn().mockResolvedValue(undefined) };
      MockStatisticsHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerStatisticsExportCommands(program);
      await program.parseAsync([
        'node', 'test', 'statistics', 'export', 'session',
        '-c', '3151318',
        '--session-id', 'fv3ma84e63',
      ]);

      expect(MockStatisticsHandler).toHaveBeenCalled();
      expect(mockHandler.exportSessionStats).toHaveBeenCalledWith({
        channelId: '3151318',
        sessionId: 'fv3ma84e63',
        output: 'table',
      });
    });

    it('[P1] should call exportSessionStats with json output', async () => {
      const mockHandler = { exportSessionStats: jest.fn().mockResolvedValue(undefined) };
      MockStatisticsHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerStatisticsExportCommands(program);
      await program.parseAsync([
        'node', 'test', 'statistics', 'export', 'session',
        '-c', '3151318',
        '--session-id', 'fv3ma84e63',
        '-o', 'json',
      ]);

      expect(mockHandler.exportSessionStats).toHaveBeenCalledWith(
        expect.objectContaining({
          output: 'json',
        })
      );
    });

    it('[P1] should handle API errors in session action', async () => {
      const mockHandler = { exportSessionStats: jest.fn().mockRejectedValue(new Error('Export failed')) };
      MockStatisticsHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerStatisticsExportCommands(program);
      await expect(program.parseAsync([
        'node', 'test', 'statistics', 'export', 'session',
        '-c', '3151318',
        '--session-id', 'fv3ma84e63',
      ])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });

  describe('auth failure handling', () => {
    it('should handle auth failure in viewlog action', async () => {
      mockAuthFailure(authAdapter as jest.Mocked<typeof authAdapter>);
      const program = createTestProgram();
      registerStatisticsExportCommands(program);

      await expect(program.parseAsync([
        'node', 'test', 'statistics', 'export', 'viewlog',
        '-c', '3151318',
        '--start-time', '2024-01-01 00:00:00',
        '--end-time', '2024-01-31 23:59:59',
      ])).rejects.toThrow('process.exit:1');
    });

    it('should handle auth failure in session action', async () => {
      mockAuthFailure(authAdapter as jest.Mocked<typeof authAdapter>);
      const program = createTestProgram();
      registerStatisticsExportCommands(program);

      await expect(program.parseAsync([
        'node', 'test', 'statistics', 'export', 'session',
        '-c', '3151318',
        '--session-id', 'fv3ma84e63',
      ])).rejects.toThrow('process.exit:1');
    });
  });

  describe('authentication error with diagnostics', () => {
    it('should show diagnostics when auth error in viewlog', async () => {
      const mockHandler = { exportViewlog: jest.fn().mockRejectedValue(new Error('Authentication failed')) };
      MockStatisticsHandler.mockImplementation(() => mockHandler);
      (authAdapter.getDiagnostics as jest.Mock).mockReturnValue({
        availableSources: [{ appId: 'a', appSecret: 's', metadata: { source: 'env' }, type: 'env' }],
        errors: [],
      });

      const program = createTestProgram();
      registerStatisticsExportCommands(program);

      await expect(program.parseAsync([
        'node', 'test', 'statistics', 'export', 'viewlog',
        '-c', '3151318',
        '--start-time', '2024-01-01 00:00:00',
        '--end-time', '2024-01-31 23:59:59',
      ])).rejects.toThrow('process.exit:1');

      expect(authAdapter.getDiagnostics).toHaveBeenCalled();
    });

    it('should show diagnostics with errors in session', async () => {
      const mockHandler = { exportSessionStats: jest.fn().mockRejectedValue(new Error('Authentication failed')) };
      MockStatisticsHandler.mockImplementation(() => mockHandler);
      (authAdapter.getDiagnostics as jest.Mock).mockReturnValue({
        availableSources: [{ appId: '', appSecret: '', metadata: { source: 'cli' }, type: 'cli' }],
        errors: ['Missing secret'],
      });

      const program = createTestProgram();
      registerStatisticsExportCommands(program);

      await expect(program.parseAsync([
        'node', 'test', 'statistics', 'export', 'session',
        '-c', '3151318',
        '--session-id', 'fv3ma84e63',
      ])).rejects.toThrow('process.exit:1');

      expect(authAdapter.getDiagnostics).toHaveBeenCalled();
    });
  });

  describe('config error handling', () => {
    it('should handle incomplete auth config gracefully', async () => {
      mockConfigError(configManager as jest.Mocked<typeof configManager>, 'Auth configuration is incomplete');
      const mockHandler = { exportViewlog: jest.fn().mockResolvedValue(undefined) };
      MockStatisticsHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerStatisticsExportCommands(program);
      await program.parseAsync([
        'node', 'test', 'statistics', 'export', 'viewlog',
        '-c', '3151318',
        '--start-time', '2024-01-01 00:00:00',
        '--end-time', '2024-01-31 23:59:59',
      ]);

      expect(mockHandler.exportViewlog).toHaveBeenCalled();
    });

    it('should handle other config errors', async () => {
      mockConfigError(configManager as jest.Mocked<typeof configManager>, new Error('Network error'));
      const program = createTestProgram();
      registerStatisticsExportCommands(program);

      await expect(program.parseAsync([
        'node', 'test', 'statistics', 'export', 'viewlog',
        '-c', '3151318',
        '--start-time', '2024-01-01 00:00:00',
        '--end-time', '2024-01-31 23:59:59',
      ])).rejects.toThrow('process.exit:1');
    });
  });

  describe('verbose mode', () => {
    it('should show auth source info when verbose', async () => {
      mockAuthSuccess(authAdapter as jest.Mocked<typeof authAdapter>, configManager as jest.Mocked<typeof configManager>, {
        source: 'env',
        accountName: 'test-account',
      });
      const mockHandler = { exportViewlog: jest.fn().mockResolvedValue(undefined) };
      MockStatisticsHandler.mockImplementation(() => mockHandler);
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      const program = new Command();
      program.option('--verbose', 'verbose');
      program.command('statistics').description('Statistics');
      registerStatisticsExportCommands(program);
      await program.parseAsync([
        'node', 'test', '--verbose', 'statistics', 'export', 'viewlog',
        '-c', '3151318',
        '--start-time', '2024-01-01 00:00:00',
        '--end-time', '2024-01-31 23:59:59',
      ]);

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Authentication Source'));
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Account'));
      logSpy.mockRestore();
    });

    it('should handle missing accountName in verbose mode', async () => {
      mockAuthSuccess(authAdapter as jest.Mocked<typeof authAdapter>, configManager as jest.Mocked<typeof configManager>, {
        source: 'env',
      });
      const mockHandler = { exportViewlog: jest.fn().mockResolvedValue(undefined) };
      MockStatisticsHandler.mockImplementation(() => mockHandler);
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      const program = new Command();
      program.option('--verbose', 'verbose');
      program.command('statistics').description('Statistics');
      registerStatisticsExportCommands(program);
      await program.parseAsync([
        'node', 'test', '--verbose', 'statistics', 'export', 'viewlog',
        '-c', '3151318',
        '--start-time', '2024-01-01 00:00:00',
        '--end-time', '2024-01-31 23:59:59',
      ]);

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Authentication Source'));
      logSpy.mockRestore();
    });

    it('should handle missing source and accountName', async () => {
      mockAuthSuccess(authAdapter as jest.Mocked<typeof authAdapter>, configManager as jest.Mocked<typeof configManager>, {});
      const mockHandler = { exportViewlog: jest.fn().mockResolvedValue(undefined) };
      MockStatisticsHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerStatisticsExportCommands(program);
      await program.parseAsync([
        'node', 'test', 'statistics', 'export', 'viewlog',
        '-c', '3151318',
        '--start-time', '2024-01-01 00:00:00',
        '--end-time', '2024-01-31 23:59:59',
      ]);

      expect(mockHandler.exportViewlog).toHaveBeenCalled();
    });
  });

  describe('non-Error exceptions', () => {
    it('should handle non-Error in viewlog action', async () => {
      const mockHandler = { exportViewlog: jest.fn().mockRejectedValue('string error') };
      MockStatisticsHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerStatisticsExportCommands(program);

      await expect(program.parseAsync([
        'node', 'test', 'statistics', 'export', 'viewlog',
        '-c', '3151318',
        '--start-time', '2024-01-01 00:00:00',
        '--end-time', '2024-01-31 23:59:59',
      ])).rejects.toThrow('process.exit:1');
    });
  });

  describe('skip registration when statistics command missing', () => {
    it('should not crash when statistics command is not registered', () => {
      const program = new Command();
      registerStatisticsExportCommands(program);

      const exportCmd = program.commands.find(c => c.name() === 'statistics')?.commands.find(c => c.name() === 'export');
      expect(exportCmd).toBeUndefined();
    });
  });
});
