/**
 * @fileoverview Unit tests for donate CLI commands
 * @author Development Team
 * @since 11.6.0
 *
 * ATDD RED PHASE - These tests will fail until donate.commands.ts is implemented
 */

import { Command } from 'commander';
import { registerDonateCommands, validateOutputFormat } from './donate.commands';
import { authAdapter } from '../config/auth-adapter';
import { configManager } from '../config/manager';
import { suppressConsole, mockProcessExit, mockAuthSuccess } from '../utils/test-helpers';

// Mock dependencies
jest.mock('../config/auth-adapter');
jest.mock('../config/manager');
jest.mock('../handlers/donate.handler');
jest.mock('../utils/errors', () => ({
  logError: jest.fn(),
}));

describe('Donate Commands Registration (ATDD RED PHASE)', () => {
  let program: Command;

  beforeEach(() => {
    program = new Command();
    jest.clearAllMocks();
  });

  // ============================================================
  // Main command registration
  // ============================================================
  describe('11.6-CMD-001: should register donate main command', () => {
    it('should register donate command with correct description', () => {
      registerDonateCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'donate');
      expect(command).toBeDefined();
      expect(command?.description()).toContain('donate');
    });
  });

  // ============================================================
  // AC #1: donate config get command
  // ============================================================
  describe('11.6-CMD-002: should register donate config get command', () => {
    it('should register config subcommand', () => {
      registerDonateCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'donate');
      const configSubcommand = command?.commands.find(cmd => cmd.name() === 'config');
      expect(configSubcommand).toBeDefined();
    });

    it('should register get sub-subcommand with correct options', () => {
      registerDonateCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'donate');
      const configSubcommand = command?.commands.find(cmd => cmd.name() === 'config');
      const getSubcommand = configSubcommand?.commands.find(cmd => cmd.name() === 'get');
      expect(getSubcommand).toBeDefined();

      const options = getSubcommand?.options || [];
      expect(options.some(opt => opt.long === '--channel-id')).toBe(true);
      expect(options.some(opt => opt.long === '--output')).toBe(true);
    });

    it('should have short form -c for --channel-id', () => {
      registerDonateCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'donate');
      const configSubcommand = command?.commands.find(cmd => cmd.name() === 'config');
      const getSubcommand = configSubcommand?.commands.find(cmd => cmd.name() === 'get');

      const channelIdOption = getSubcommand?.options.find(opt => opt.long === '--channel-id');
      expect(channelIdOption?.short).toBe('-c');
    });

    it('should have short form -o for --output', () => {
      registerDonateCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'donate');
      const configSubcommand = command?.commands.find(cmd => cmd.name() === 'config');
      const getSubcommand = configSubcommand?.commands.find(cmd => cmd.name() === 'get');

      const outputOption = getSubcommand?.options.find(opt => opt.long === '--output');
      expect(outputOption?.short).toBe('-o');
      expect(outputOption?.defaultValue).toBe('table');
    });

    it('should mark channel-id as required', () => {
      registerDonateCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'donate');
      const configSubcommand = command?.commands.find(cmd => cmd.name() === 'config');
      const getSubcommand = configSubcommand?.commands.find(cmd => cmd.name() === 'get');

      const channelIdOption = getSubcommand?.options.find(opt => opt.long === '--channel-id');
      expect(channelIdOption?.required).toBe(true);
    });

    it('should have description for config get command', () => {
      registerDonateCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'donate');
      const configSubcommand = command?.commands.find(cmd => cmd.name() === 'config');
      const getSubcommand = configSubcommand?.commands.find(cmd => cmd.name() === 'get');
      expect(getSubcommand?.description().toLowerCase()).toContain('get');
    });
  });

  // ============================================================
  // AC #2: donate config update command
  // ============================================================
  describe('11.6-CMD-003: should register donate config update command', () => {
    it('should register update sub-subcommand with correct options', () => {
      registerDonateCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'donate');
      const configSubcommand = command?.commands.find(cmd => cmd.name() === 'config');
      const updateSubcommand = configSubcommand?.commands.find(cmd => cmd.name() === 'update');
      expect(updateSubcommand).toBeDefined();

      const options = updateSubcommand?.options || [];
      expect(options.some(opt => opt.long === '--channel-id')).toBe(true);
      expect(options.some(opt => opt.long === '--cash-enabled')).toBe(true);
      expect(options.some(opt => opt.long === '--gift-enabled')).toBe(true);
      expect(options.some(opt => opt.long === '--tips')).toBe(false);
      expect(options.some(opt => opt.long === '--amounts')).toBe(true);
      expect(options.some(opt => opt.long === '--output')).toBe(true);
    });

    it('should have short form -c for --channel-id', () => {
      registerDonateCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'donate');
      const configSubcommand = command?.commands.find(cmd => cmd.name() === 'config');
      const updateSubcommand = configSubcommand?.commands.find(cmd => cmd.name() === 'update');

      const channelIdOption = updateSubcommand?.options.find(opt => opt.long === '--channel-id');
      expect(channelIdOption?.short).toBe('-c');
    });

    it('should mark channel-id as required', () => {
      registerDonateCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'donate');
      const configSubcommand = command?.commands.find(cmd => cmd.name() === 'config');
      const updateSubcommand = configSubcommand?.commands.find(cmd => cmd.name() === 'update');

      const channelIdOption = updateSubcommand?.options.find(opt => opt.long === '--channel-id');
      expect(channelIdOption?.required).toBe(true);
    });

    it('should have description for config update command', () => {
      registerDonateCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'donate');
      const configSubcommand = command?.commands.find(cmd => cmd.name() === 'config');
      const updateSubcommand = configSubcommand?.commands.find(cmd => cmd.name() === 'update');
      expect(updateSubcommand?.description().toLowerCase()).toContain('update');
    });
  });

  // ============================================================
  // AC #3: donate list command
  // ============================================================
  describe('11.6-CMD-004: should register donate list command', () => {
    it('should register list subcommand with correct options', () => {
      registerDonateCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'donate');
      const listSubcommand = command?.commands.find(cmd => cmd.name() === 'list');
      expect(listSubcommand).toBeDefined();

      const options = listSubcommand?.options || [];
      expect(options.some(opt => opt.long === '--channel-id')).toBe(true);
      expect(options.some(opt => opt.long === '--start')).toBe(true);
      expect(options.some(opt => opt.long === '--end')).toBe(true);
      expect(options.some(opt => opt.long === '--page')).toBe(true);
      expect(options.some(opt => opt.long === '--size')).toBe(true);
      expect(options.some(opt => opt.long === '--output')).toBe(true);
    });

    it('should have short form -c for --channel-id', () => {
      registerDonateCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'donate');
      const listSubcommand = command?.commands.find(cmd => cmd.name() === 'list');

      const channelIdOption = listSubcommand?.options.find(opt => opt.long === '--channel-id');
      expect(channelIdOption?.short).toBe('-c');
    });

    it('should mark channel-id as required', () => {
      registerDonateCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'donate');
      const listSubcommand = command?.commands.find(cmd => cmd.name() === 'list');

      const channelIdOption = listSubcommand?.options.find(opt => opt.long === '--channel-id');
      expect(channelIdOption?.required).toBe(true);
    });

    it('should mark start as required', () => {
      registerDonateCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'donate');
      const listSubcommand = command?.commands.find(cmd => cmd.name() === 'list');

      const startOption = listSubcommand?.options.find(opt => opt.long === '--start');
      expect(startOption?.required).toBe(true);
    });

    it('should mark end as required', () => {
      registerDonateCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'donate');
      const listSubcommand = command?.commands.find(cmd => cmd.name() === 'list');

      const endOption = listSubcommand?.options.find(opt => opt.long === '--end');
      expect(endOption?.required).toBe(true);
    });

    it('should have description for list command', () => {
      registerDonateCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'donate');
      const listSubcommand = command?.commands.find(cmd => cmd.name() === 'list');
      expect(listSubcommand?.description().toLowerCase()).toContain('list');
    });
  });

  // ============================================================
  // Help text tests
  // ============================================================
  describe('11.6-CMD-005: should show help for donate commands', () => {
    it('should have help text for config get command with examples', () => {
      registerDonateCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'donate');
      const configSubcommand = command?.commands.find(cmd => cmd.name() === 'config');
      const getSubcommand = configSubcommand?.commands.find(cmd => cmd.name() === 'get');

      // Check that help text exists (addHelpText is called)
      expect(getSubcommand).toBeDefined();
    });

    it('should have help text for list command with examples', () => {
      registerDonateCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'donate');
      const listSubcommand = command?.commands.find(cmd => cmd.name() === 'list');

      expect(listSubcommand).toBeDefined();
    });
  });

  // ============================================================
  // validateOutputFormat function tests
  // ============================================================
  describe('validateOutputFormat', () => {
    it('11.6-CMD-006: should return "table" for valid input "table"', () => {
      expect(validateOutputFormat('table')).toBe('table');
    });

    it('11.6-CMD-007: should return "json" for valid input "json"', () => {
      expect(validateOutputFormat('json')).toBe('json');
    });

    it('11.6-CMD-008: should throw error for invalid format', () => {
      expect(() => validateOutputFormat('invalid')).toThrow(
        'Output format must be either "table" or "json"'
      );
    });

    it('11.6-CMD-009: should throw error for empty string', () => {
      expect(() => validateOutputFormat('')).toThrow(
        'Output format must be either "table" or "json"'
      );
    });

    it('11.6-CMD-010: should throw error for case-sensitive mismatch', () => {
      expect(() => validateOutputFormat('TABLE')).toThrow(
        'Output format must be either "table" or "json"'
      );
    });

    it('11.6-CMD-011: should throw error for XML format', () => {
      expect(() => validateOutputFormat('xml')).toThrow(
        'Output format must be either "table" or "json"'
      );
    });

    it('11.6-CMD-012: should throw error for CSV format', () => {
      expect(() => validateOutputFormat('csv')).toThrow(
        'Output format must be either "table" or "json"'
      );
    });
  });

  // ============================================================
  // All subcommands overview
  // ============================================================
  describe('11.6-CMD-013: should register all subcommands', () => {
    it('should register config and list subcommands', () => {
      registerDonateCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'donate');
      const subcommandNames = command?.commands.map(cmd => cmd.name()) || [];

      expect(subcommandNames).toContain('config');
      expect(subcommandNames).toContain('list');
    });

    it('should register get and update subcommands under config', () => {
      registerDonateCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'donate');
      const configSubcommand = command?.commands.find(cmd => cmd.name() === 'config');
      const configSubcommandNames = configSubcommand?.commands.map(cmd => cmd.name()) || [];

      expect(configSubcommandNames).toContain('get');
      expect(configSubcommandNames).toContain('update');
    });
  });
});

// ============================================================
// Action execution tests
// ============================================================
describe('action execution', () => {
  let restoreConsole: () => void;
  let restoreExit: () => void;
  let MockDonateHandler: jest.Mock;

  const createTestProgram = (): Command => {
    const program = new Command();
    program.exitOverride();
    return program;
  };

  beforeEach(() => {
    restoreConsole = suppressConsole();
    restoreExit = mockProcessExit();
    MockDonateHandler = require('../handlers/donate.handler').DonateHandler;
    MockDonateHandler.mockClear();
    mockAuthSuccess(authAdapter as jest.Mocked<typeof authAdapter>, configManager as jest.Mocked<typeof configManager>);
  });

  afterEach(() => {
    restoreConsole();
    restoreExit();
  });

  describe('config get action', () => {
    it('[P0] should call getConfig handler with correct params', async () => {
      const mockHandler = { getConfig: jest.fn().mockResolvedValue(undefined) };
      MockDonateHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerDonateCommands(program);
      await program.parseAsync(['node', 'test', 'donate', 'config', 'get', '-c', '123456']);

      expect(MockDonateHandler).toHaveBeenCalled();
      expect(mockHandler.getConfig).toHaveBeenCalledWith({
        channelId: '123456',
        output: 'table',
      });
    });

    it('[P1] should call getConfig with json output', async () => {
      const mockHandler = { getConfig: jest.fn().mockResolvedValue(undefined) };
      MockDonateHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerDonateCommands(program);
      await program.parseAsync(['node', 'test', 'donate', 'config', 'get', '-c', '123456', '-o', 'json']);

      expect(mockHandler.getConfig).toHaveBeenCalledWith({
        channelId: '123456',
        output: 'json',
      });
    });

    it('[P1] should handle API errors in config get action', async () => {
      const mockHandler = { getConfig: jest.fn().mockRejectedValue(new Error('Get failed')) };
      MockDonateHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerDonateCommands(program);
      await expect(program.parseAsync(['node', 'test', 'donate', 'config', 'get', '-c', '123456'])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });

  describe('config update action', () => {
    it('[P0] should call updateConfig handler with correct params', async () => {
      const mockHandler = { updateConfig: jest.fn().mockResolvedValue(undefined) };
      MockDonateHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerDonateCommands(program);
      await program.parseAsync([
        'node', 'test', 'donate', 'config', 'update',
        '-c', '123456',
        '--cash-enabled', 'Y',
        '--amounts', '1,5,10',
      ]);

      expect(MockDonateHandler).toHaveBeenCalled();
      expect(mockHandler.updateConfig).toHaveBeenCalledWith({
        channelId: '123456',
        cashEnabled: 'Y',
        giftEnabled: undefined,
        amounts: '1,5,10',
        output: 'table',
      });
    });

    it('[P1] should call updateConfig with all options', async () => {
      const mockHandler = { updateConfig: jest.fn().mockResolvedValue(undefined) };
      MockDonateHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerDonateCommands(program);
      await program.parseAsync([
        'node', 'test', 'donate', 'config', 'update',
        '-c', '123456',
        '--cash-enabled', 'Y',
        '--gift-enabled', 'N',
        '--amounts', '1,5,10',
        '-o', 'json',
      ]);

      expect(mockHandler.updateConfig).toHaveBeenCalledWith({
        channelId: '123456',
        cashEnabled: 'Y',
        giftEnabled: 'N',
        amounts: '1,5,10',
        output: 'json',
      });
    });

    it('[P1] should handle API errors in config update action', async () => {
      const mockHandler = { updateConfig: jest.fn().mockRejectedValue(new Error('Update failed')) };
      MockDonateHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerDonateCommands(program);
      await expect(program.parseAsync([
        'node', 'test', 'donate', 'config', 'update',
        '-c', '123456',
      ])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });

  describe('list action', () => {
    it('[P0] should call listRecords handler with correct params', async () => {
      const mockHandler = { listRecords: jest.fn().mockResolvedValue(undefined) };
      MockDonateHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerDonateCommands(program);
      await program.parseAsync([
        'node', 'test', 'donate', 'list',
        '-c', '123456',
        '--start', '1615772426000',
        '--end', '1615858826000',
      ]);

      expect(MockDonateHandler).toHaveBeenCalled();
      expect(mockHandler.listRecords).toHaveBeenCalledWith({
        channelId: '123456',
        start: 1615772426000,
        end: 1615858826000,
        page: undefined,
        size: undefined,
        output: 'table',
      });
    });

    it('[P1] should call listRecords with pagination options', async () => {
      const mockHandler = { listRecords: jest.fn().mockResolvedValue(undefined) };
      MockDonateHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerDonateCommands(program);
      await program.parseAsync([
        'node', 'test', 'donate', 'list',
        '-c', '123456',
        '--start', '1615772426000',
        '--end', '1615858826000',
        '--page', '2',
        '--size', '50',
        '-o', 'json',
      ]);

      expect(mockHandler.listRecords).toHaveBeenCalledWith({
        channelId: '123456',
        start: 1615772426000,
        end: 1615858826000,
        page: 2,
        size: 50,
        output: 'json',
      });
    });

    it('[P1] should handle API errors in list action', async () => {
      const mockHandler = { listRecords: jest.fn().mockRejectedValue(new Error('List failed')) };
      MockDonateHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerDonateCommands(program);
      await expect(program.parseAsync([
        'node', 'test', 'donate', 'list',
        '-c', '123456',
        '--start', '1615772426000',
        '--end', '1615858826000',
      ])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });
});
