/**
 * @fileoverview Unit tests for watch-condition CLI commands
 * @author Development Team
 * @since 12.3.0
 */

import { Command } from 'commander';
import { registerWatchConditionCommands, validateOutputFormat } from './watch-condition.commands';
import { authAdapter } from '../config/auth-adapter';
import { configManager } from '../config/manager';
import { suppressConsole, mockProcessExit, mockAuthSuccess } from '../utils/test-helpers';

// Mock dependencies
jest.mock('../config/auth-adapter');
jest.mock('../config/manager');
jest.mock('../handlers/watch-condition.handler');
jest.mock('../utils/errors', () => ({
  logError: jest.fn(),
}));

// Mock console.log to spy on console output
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();

describe('Watch Condition Commands Registration', () => {
  let program: Command;

  beforeEach(() => {
    program = new Command();
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
  });

  // ============================================================
  // Main command registration
  // ============================================================
  describe('Main command', () => {
    it('12.3-CMD-001: should register watch-condition main command', () => {
      registerWatchConditionCommands(program);

      const mainCommand = program.commands.find(cmd => cmd.name() === 'watch-condition');
      expect(mainCommand).toBeDefined();
      expect(mainCommand?.description()).toContain('观看条件');
    });
  });

  // ============================================================
  // watch-condition get subcommand
  // ============================================================
  describe('Get subcommand', () => {
    it('12.3-CMD-002: should register watch-condition get subcommand', () => {
      registerWatchConditionCommands(program);

      const mainCommand = program.commands.find(cmd => cmd.name() === 'watch-condition');
      const getCommand = mainCommand?.commands.find(cmd => cmd.name() === 'get');

      expect(getCommand).toBeDefined();
      expect(getCommand?.description()).toContain('获取');
    });

    it('12.3-CMD-003: should have --channel-id option', () => {
      registerWatchConditionCommands(program);

      const mainCommand = program.commands.find(cmd => cmd.name() === 'watch-condition');
      const getCommand = mainCommand?.commands.find(cmd => cmd.name() === 'get');

      const channelIdOption = getCommand?.options.find(opt => opt.long === '--channel-id');
      expect(channelIdOption).toBeDefined();
    });

    it('12.3-CMD-004: should have --output option with default value', () => {
      registerWatchConditionCommands(program);

      const mainCommand = program.commands.find(cmd => cmd.name() === 'watch-condition');
      const getCommand = mainCommand?.commands.find(cmd => cmd.name() === 'get');

      const outputOption = getCommand?.options.find(opt => opt.long === '--output');
      expect(outputOption).toBeDefined();
    });

    it('12.3-CMD-005: should have -o short form for --output', () => {
      registerWatchConditionCommands(program);

      const mainCommand = program.commands.find(cmd => cmd.name() === 'watch-condition');
      const getCommand = mainCommand?.commands.find(cmd => cmd.name() === 'get');

      const outputOption = getCommand?.options.find(opt => opt.short === '-o');
      expect(outputOption).toBeDefined();
    });
  });

  // ============================================================
  // watch-condition set subcommand
  // ============================================================
  describe('Set subcommand', () => {
    it('12.3-CMD-006: should register watch-condition set subcommand', () => {
      registerWatchConditionCommands(program);

      const mainCommand = program.commands.find(cmd => cmd.name() === 'watch-condition');
      const setCommand = mainCommand?.commands.find(cmd => cmd.name() === 'set');

      expect(setCommand).toBeDefined();
      expect(setCommand?.description()).toContain('设置');
    });

    it('12.3-CMD-007: should have --channel-id option for set command', () => {
      registerWatchConditionCommands(program);

      const mainCommand = program.commands.find(cmd => cmd.name() === 'watch-condition');
      const setCommand = mainCommand?.commands.find(cmd => cmd.name() === 'set');

      const channelIdOption = setCommand?.options.find(opt => opt.long === '--channel-id');
      expect(channelIdOption).toBeDefined();
    });

    it('12.3-CMD-008: should have --rank option for set command', () => {
      registerWatchConditionCommands(program);

      const mainCommand = program.commands.find(cmd => cmd.name() === 'watch-condition');
      const setCommand = mainCommand?.commands.find(cmd => cmd.name() === 'set');

      const rankOption = setCommand?.options.find(opt => opt.long === '--rank');
      expect(rankOption).toBeDefined();
    });

    it('12.3-CMD-009: should have --auth-type option for set command', () => {
      registerWatchConditionCommands(program);

      const mainCommand = program.commands.find(cmd => cmd.name() === 'watch-condition');
      const setCommand = mainCommand?.commands.find(cmd => cmd.name() === 'set');

      const authTypeOption = setCommand?.options.find(opt => opt.long === '--auth-type');
      expect(authTypeOption).toBeDefined();
    });

    it('12.3-CMD-010: should have --enabled option for set command', () => {
      registerWatchConditionCommands(program);

      const mainCommand = program.commands.find(cmd => cmd.name() === 'watch-condition');
      const setCommand = mainCommand?.commands.find(cmd => cmd.name() === 'set');

      const enabledOption = setCommand?.options.find(opt => opt.long === '--enabled');
      expect(enabledOption).toBeDefined();
    });

    it('12.3-CMD-011: should have --auth-code option for password authType', () => {
      registerWatchConditionCommands(program);

      const mainCommand = program.commands.find(cmd => cmd.name() === 'watch-condition');
      const setCommand = mainCommand?.commands.find(cmd => cmd.name() === 'set');

      const authCodeOption = setCommand?.options.find(opt => opt.long === '--auth-code');
      expect(authCodeOption).toBeDefined();
    });

    it('12.3-CMD-012: should have --price option for pay authType', () => {
      registerWatchConditionCommands(program);

      const mainCommand = program.commands.find(cmd => cmd.name() === 'watch-condition');
      const setCommand = mainCommand?.commands.find(cmd => cmd.name() === 'set');

      const priceOption = setCommand?.options.find(opt => opt.long === '--price');
      expect(priceOption).toBeDefined();
    });

    it('12.3-CMD-013: should have --config-file option for JSON config file', () => {
      registerWatchConditionCommands(program);

      const mainCommand = program.commands.find(cmd => cmd.name() === 'watch-condition');
      const setCommand = mainCommand?.commands.find(cmd => cmd.name() === 'set');

      const configOption = setCommand?.options.find(opt => opt.long === '--config-file');
      expect(configOption).toBeDefined();
    });

    it('12.3-CMD-014: should have --output option for set command', () => {
      registerWatchConditionCommands(program);

      const mainCommand = program.commands.find(cmd => cmd.name() === 'watch-condition');
      const setCommand = mainCommand?.commands.find(cmd => cmd.name() === 'set');

      const outputOption = setCommand?.options.find(opt => opt.long === '--output');
      expect(outputOption).toBeDefined();
    });

    it('12.3-CMD-015: should have -o short form for --output on set command', () => {
      registerWatchConditionCommands(program);

      const mainCommand = program.commands.find(cmd => cmd.name() === 'watch-condition');
      const setCommand = mainCommand?.commands.find(cmd => cmd.name() === 'set');

      const outputOption = setCommand?.options.find(opt => opt.short === '-o');
      expect(outputOption).toBeDefined();
    });
  });

  // ============================================================
  // Help text validation
  // ============================================================
  describe('Help text', () => {
    it('12.3-CMD-016: should display help for watch-condition get', () => {
      registerWatchConditionCommands(program);

      const mainCommand = program.commands.find(cmd => cmd.name() === 'watch-condition');
      const getCommand = mainCommand?.commands.find(cmd => cmd.name() === 'get');

      const helpText = getCommand?.helpInformation() || '';
      expect(helpText).toContain('获取');
      expect(helpText).toContain('--channel-id');
      expect(helpText).toContain('--output');
    });

    it('12.3-CMD-017: should display help for watch-condition set', () => {
      registerWatchConditionCommands(program);

      const mainCommand = program.commands.find(cmd => cmd.name() === 'watch-condition');
      const setCommand = mainCommand?.commands.find(cmd => cmd.name() === 'set');

      const helpText = setCommand?.helpInformation() || '';
      expect(helpText).toContain('设置');
      expect(helpText).toContain('--channel-id');
      expect(helpText).toContain('--rank');
      expect(helpText).toContain('--auth-type');
      expect(helpText).toContain('--enabled');
      expect(helpText).toContain('--config-file');
    });
  });

  // ============================================================
  // AuthType validation hints
  // ============================================================
  describe('AuthType hints', () => {
    it('12.3-CMD-018: should list valid authType options in help', () => {
      registerWatchConditionCommands(program);

      const mainCommand = program.commands.find(cmd => cmd.name() === 'watch-condition');
      const setCommand = mainCommand?.commands.find(cmd => cmd.name() === 'set');

      const authTypeOption = setCommand?.options.find(opt => opt.long === '--auth-type');

      // Should mention valid auth types
      const description = authTypeOption?.description || '';
      expect(description).toContain('none');
      expect(description).toContain('code');
      expect(description).toContain('pay');
      expect(description).toContain('phone');
      expect(description).toContain('info');
    });
  });

  // ============================================================
  // Rank validation hints
  // ============================================================
  describe('Rank hints', () => {
    it('12.3-CMD-019: should describe rank values in help', () => {
      registerWatchConditionCommands(program);

      const mainCommand = program.commands.find(cmd => cmd.name() === 'watch-condition');
      const setCommand = mainCommand?.commands.find(cmd => cmd.name() === 'set');

      const rankOption = setCommand?.options.find(opt => opt.long === '--rank');

      const description = rankOption?.description || '';
      expect(description).toContain('1');
      expect(description).toContain('2');
    });
  });

});

// ============================================================
// validateOutputFormat tests
// ============================================================
describe('validateOutputFormat', () => {
  it('should return "table" for valid table format', () => {
    expect(validateOutputFormat('table')).toBe('table');
  });

  it('should return "json" for valid json format', () => {
    expect(validateOutputFormat('json')).toBe('json');
  });

  it('should throw error for invalid format', () => {
    expect(() => validateOutputFormat('xml')).toThrow('Output format must be either "table" or "json"');
  });

  it('should throw error for invalid csv format', () => {
    expect(() => validateOutputFormat('csv')).toThrow('Output format must be either "table" or "json"');
  });
});

// ============================================================
// Action execution tests
// ============================================================
describe('action execution', () => {
  let restoreConsole: () => void;
  let restoreExit: () => void;
  let MockWatchConditionHandler: jest.Mock;

  const createTestProgram = (): Command => {
    const program = new Command();
    program.exitOverride();
    return program;
  };

  beforeEach(() => {
    restoreConsole = suppressConsole();
    restoreExit = mockProcessExit();
    MockWatchConditionHandler = require('../handlers/watch-condition.handler').WatchConditionHandler;
    MockWatchConditionHandler.mockClear();
    mockAuthSuccess(authAdapter as jest.Mocked<typeof authAdapter>, configManager as jest.Mocked<typeof configManager>);
  });

  afterEach(() => {
    restoreConsole();
    restoreExit();
  });

  describe('get action', () => {
    it('[P0] should call getWatchCondition handler with correct params', async () => {
      const mockHandler = { getWatchCondition: jest.fn().mockResolvedValue(undefined) };
      MockWatchConditionHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerWatchConditionCommands(program);
      await program.parseAsync(['node', 'test', 'watch-condition', 'get']);

      expect(MockWatchConditionHandler).toHaveBeenCalled();
      expect(mockHandler.getWatchCondition).toHaveBeenCalledWith({
        channelId: undefined,
        output: 'table',
      });
    });

    it('[P1] should call getWatchCondition with channel-id', async () => {
      const mockHandler = { getWatchCondition: jest.fn().mockResolvedValue(undefined) };
      MockWatchConditionHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerWatchConditionCommands(program);
      await program.parseAsync(['node', 'test', 'watch-condition', 'get', '--channel-id', '123456']);

      expect(mockHandler.getWatchCondition).toHaveBeenCalledWith({
        channelId: '123456',
        output: 'table',
      });
    });

    it('[P1] should call getWatchCondition with json output', async () => {
      const mockHandler = { getWatchCondition: jest.fn().mockResolvedValue(undefined) };
      MockWatchConditionHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerWatchConditionCommands(program);
      await program.parseAsync(['node', 'test', 'watch-condition', 'get', '-o', 'json']);

      expect(mockHandler.getWatchCondition).toHaveBeenCalledWith({
        channelId: undefined,
        output: 'json',
      });
    });

    it('[P1] should handle API errors in get action', async () => {
      const mockHandler = { getWatchCondition: jest.fn().mockRejectedValue(new Error('API error')) };
      MockWatchConditionHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerWatchConditionCommands(program);
      await expect(program.parseAsync(['node', 'test', 'watch-condition', 'get'])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });

  describe('set action', () => {
    it('[P0] should call setWatchCondition handler with correct params', async () => {
      const mockHandler = { setWatchCondition: jest.fn().mockResolvedValue(undefined) };
      MockWatchConditionHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerWatchConditionCommands(program);
      await program.parseAsync(['node', 'test', 'watch-condition', 'set', '--rank', '1', '--auth-type', 'none', '--enabled', 'Y']);

      expect(MockWatchConditionHandler).toHaveBeenCalled();
      expect(mockHandler.setWatchCondition).toHaveBeenCalledWith({
        channelId: undefined,
        rank: 1,
        authType: 'none',
        enabled: 'Y',
        authCode: undefined,
        price: undefined,
        configFile: undefined,
        output: 'table',
      });
    });

    it('[P1] should call setWatchCondition with all options', async () => {
      const mockHandler = { setWatchCondition: jest.fn().mockResolvedValue(undefined) };
      MockWatchConditionHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerWatchConditionCommands(program);
      await program.parseAsync([
        'node', 'test', 'watch-condition', 'set',
        '--channel-id', '123456',
        '--rank', '2',
        '--auth-type', 'code',
        '--enabled', 'Y',
        '--auth-code', 'abc123',
        '-o', 'json',
      ]);

      expect(mockHandler.setWatchCondition).toHaveBeenCalledWith({
        channelId: '123456',
        rank: 2,
        authType: 'code',
        enabled: 'Y',
        authCode: 'abc123',
        price: undefined,
        configFile: undefined,
        output: 'json',
      });
    });

    it('[P1] should call setWatchCondition with pay authType and price', async () => {
      const mockHandler = { setWatchCondition: jest.fn().mockResolvedValue(undefined) };
      MockWatchConditionHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerWatchConditionCommands(program);
      await program.parseAsync([
        'node', 'test', 'watch-condition', 'set',
        '--channel-id', '123456',
        '--rank', '1',
        '--auth-type', 'pay',
        '--enabled', 'Y',
        '--price', '99.9',
      ]);

      expect(mockHandler.setWatchCondition).toHaveBeenCalledWith({
        channelId: '123456',
        rank: 1,
        authType: 'pay',
        enabled: 'Y',
        authCode: undefined,
        price: 99.9,
        configFile: undefined,
        output: 'table',
      });
    });

    it('[P1] should call setWatchCondition with config-file', async () => {
      const mockHandler = { setWatchCondition: jest.fn().mockResolvedValue(undefined) };
      MockWatchConditionHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerWatchConditionCommands(program);
      await program.parseAsync([
        'node', 'test', 'watch-condition', 'set',
        '--channel-id', '123456',
        '--config-file', './watch-condition.json',
      ]);

      expect(mockHandler.setWatchCondition).toHaveBeenCalledWith({
        channelId: '123456',
        rank: undefined,
        authType: undefined,
        enabled: undefined,
        authCode: undefined,
        price: undefined,
        configFile: './watch-condition.json',
        output: 'table',
      });
    });

    it('[P1] should handle API errors in set action', async () => {
      const mockHandler = { setWatchCondition: jest.fn().mockRejectedValue(new Error('Set failed')) };
      MockWatchConditionHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerWatchConditionCommands(program);
      await expect(program.parseAsync(['node', 'test', 'watch-condition', 'set', '--rank', '1'])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });
});
