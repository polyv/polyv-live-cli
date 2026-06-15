/**
 * @fileoverview Unit tests for whitelist CLI commands
 * @author Development Team
 * @since 12.4.0
 */

import { Command } from 'commander';
import { registerWhitelistCommands, validateOutputFormat } from './whitelist.commands';
import { authAdapter } from '../config/auth-adapter';
import { configManager } from '../config/manager';
import {
  createTestProgram,
  mockAuthSuccess,
  mockAuthFailure,
  suppressConsole,
  mockProcessExit,
} from '../utils/test-helpers';

// Mock dependencies
jest.mock('../config/auth-adapter');
jest.mock('../config/manager');
jest.mock('../handlers/whitelist.handler', () => ({
  WhitelistHandler: jest.fn().mockImplementation(() => ({
    listWhitelist: jest.fn().mockResolvedValue(undefined),
    addWhitelist: jest.fn().mockResolvedValue(undefined),
    updateWhitelist: jest.fn().mockResolvedValue(undefined),
    removeWhitelist: jest.fn().mockResolvedValue(undefined),
  })),
}));

// Mock console.log to spy on console output
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();

describe('Whitelist Commands', () => {
  let program: Command;

  beforeEach(() => {
    program = new Command();
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
  });

  // ========================================
  // validateOutputFormat Tests
  // ========================================
  describe('validateOutputFormat', () => {
    it('should return "table" for "table" input', () => {
      expect(validateOutputFormat('table')).toBe('table');
    });

    it('should return "json" for "json" input', () => {
      expect(validateOutputFormat('json')).toBe('json');
    });

    it('should throw error for invalid format', () => {
      expect(() => validateOutputFormat('xml')).toThrow('Output format must be either "table" or "json"');
    });

    it('should throw error for empty string', () => {
      expect(() => validateOutputFormat('')).toThrow('Output format must be either "table" or "json"');
    });

    it('should throw error for case-sensitive mismatch', () => {
      expect(() => validateOutputFormat('JSON')).toThrow('Output format must be either "table" or "json"');
    });
  });

  // ============================================================
  // Main command registration
  // ============================================================
  describe('Main command', () => {
    it('12.4-CMD-001: should register whitelist main command', () => {
      registerWhitelistCommands(program);

      const mainCommand = program.commands.find(cmd => cmd.name() === 'whitelist');
      expect(mainCommand).toBeDefined();
      expect(mainCommand?.description()).toContain('白名单');
    });
  });

  // ============================================================
  // whitelist list subcommand
  // ============================================================
  describe('List subcommand', () => {
    it('12.4-CMD-002: should register whitelist list subcommand', () => {
      registerWhitelistCommands(program);

      const mainCommand = program.commands.find(cmd => cmd.name() === 'whitelist');
      const listCommand = mainCommand?.commands.find(cmd => cmd.name() === 'list');

      expect(listCommand).toBeDefined();
      expect(listCommand?.description()).toContain('获取');
    });

    it('12.4-CMD-003: should have --channel-id option for list command', () => {
      registerWhitelistCommands(program);

      const mainCommand = program.commands.find(cmd => cmd.name() === 'whitelist');
      const listCommand = mainCommand?.commands.find(cmd => cmd.name() === 'list');

      const channelIdOption = listCommand?.options.find(opt => opt.long === '--channel-id');
      expect(channelIdOption).toBeDefined();
    });

    it('12.4-CMD-004: should have --rank option (required) for list command', () => {
      registerWhitelistCommands(program);

      const mainCommand = program.commands.find(cmd => cmd.name() === 'whitelist');
      const listCommand = mainCommand?.commands.find(cmd => cmd.name() === 'list');

      const rankOption = listCommand?.options.find(opt => opt.long === '--rank');
      expect(rankOption).toBeDefined();
      expect(rankOption?.required).toBeTruthy();
    });

    it('12.4-CMD-005: should have --page option for list command', () => {
      registerWhitelistCommands(program);

      const mainCommand = program.commands.find(cmd => cmd.name() === 'whitelist');
      const listCommand = mainCommand?.commands.find(cmd => cmd.name() === 'list');

      const pageOption = listCommand?.options.find(opt => opt.long === '--page');
      expect(pageOption).toBeDefined();
    });

    it('12.4-CMD-006: should have --page-size option for list command', () => {
      registerWhitelistCommands(program);

      const mainCommand = program.commands.find(cmd => cmd.name() === 'whitelist');
      const listCommand = mainCommand?.commands.find(cmd => cmd.name() === 'list');

      const pageSizeOption = listCommand?.options.find(opt => opt.long === '--page-size');
      expect(pageSizeOption).toBeDefined();
    });

    it('12.4-CMD-007: should have --keyword option for list command', () => {
      registerWhitelistCommands(program);

      const mainCommand = program.commands.find(cmd => cmd.name() === 'whitelist');
      const listCommand = mainCommand?.commands.find(cmd => cmd.name() === 'list');

      const keywordOption = listCommand?.options.find(opt => opt.long === '--keyword');
      expect(keywordOption).toBeDefined();
    });

    it('12.4-CMD-008: should have --output option with default value', () => {
      registerWhitelistCommands(program);

      const mainCommand = program.commands.find(cmd => cmd.name() === 'whitelist');
      const listCommand = mainCommand?.commands.find(cmd => cmd.name() === 'list');

      const outputOption = listCommand?.options.find(opt => opt.long === '--output');
      expect(outputOption).toBeDefined();
    });

    it('12.4-CMD-009: should have -o short form for --output', () => {
      registerWhitelistCommands(program);

      const mainCommand = program.commands.find(cmd => cmd.name() === 'whitelist');
      const listCommand = mainCommand?.commands.find(cmd => cmd.name() === 'list');

      const outputOption = listCommand?.options.find(opt => opt.short === '-o');
      expect(outputOption).toBeDefined();
    });
  });

  // ============================================================
  // whitelist add subcommand
  // ============================================================
  describe('Add subcommand', () => {
    it('12.4-CMD-010: should register whitelist add subcommand', () => {
      registerWhitelistCommands(program);

      const mainCommand = program.commands.find(cmd => cmd.name() === 'whitelist');
      const addCommand = mainCommand?.commands.find(cmd => cmd.name() === 'add');

      expect(addCommand).toBeDefined();
      expect(addCommand?.description()).toContain('添加');
    });

    it('12.4-CMD-011: should have --channel-id option for add command', () => {
      registerWhitelistCommands(program);

      const mainCommand = program.commands.find(cmd => cmd.name() === 'whitelist');
      const addCommand = mainCommand?.commands.find(cmd => cmd.name() === 'add');

      const channelIdOption = addCommand?.options.find(opt => opt.long === '--channel-id');
      expect(channelIdOption).toBeDefined();
    });

    it('12.4-CMD-012: should have --rank option (required) for add command', () => {
      registerWhitelistCommands(program);

      const mainCommand = program.commands.find(cmd => cmd.name() === 'whitelist');
      const addCommand = mainCommand?.commands.find(cmd => cmd.name() === 'add');

      const rankOption = addCommand?.options.find(opt => opt.long === '--rank');
      expect(rankOption).toBeDefined();
      expect(rankOption?.required).toBeTruthy();
    });

    it('12.4-CMD-013: should have --code option (required) for add command', () => {
      registerWhitelistCommands(program);

      const mainCommand = program.commands.find(cmd => cmd.name() === 'whitelist');
      const addCommand = mainCommand?.commands.find(cmd => cmd.name() === 'add');

      const codeOption = addCommand?.options.find(opt => opt.long === '--code');
      expect(codeOption).toBeDefined();
      expect(codeOption?.required).toBeTruthy();
    });

    it('12.4-CMD-014: should have --name option for add command', () => {
      registerWhitelistCommands(program);

      const mainCommand = program.commands.find(cmd => cmd.name() === 'whitelist');
      const addCommand = mainCommand?.commands.find(cmd => cmd.name() === 'add');

      const nameOption = addCommand?.options.find(opt => opt.long === '--name');
      expect(nameOption).toBeDefined();
    });

    it('12.4-CMD-015: should have --output option for add command', () => {
      registerWhitelistCommands(program);

      const mainCommand = program.commands.find(cmd => cmd.name() === 'whitelist');
      const addCommand = mainCommand?.commands.find(cmd => cmd.name() === 'add');

      const outputOption = addCommand?.options.find(opt => opt.long === '--output');
      expect(outputOption).toBeDefined();
    });
  });

  // ============================================================
  // whitelist update subcommand
  // ============================================================
  describe('Update subcommand', () => {
    it('12.4-CMD-016: should register whitelist update subcommand', () => {
      registerWhitelistCommands(program);

      const mainCommand = program.commands.find(cmd => cmd.name() === 'whitelist');
      const updateCommand = mainCommand?.commands.find(cmd => cmd.name() === 'update');

      expect(updateCommand).toBeDefined();
      expect(updateCommand?.description()).toContain('更新');
    });

    it('12.4-CMD-017: should have --channel-id option for update command', () => {
      registerWhitelistCommands(program);

      const mainCommand = program.commands.find(cmd => cmd.name() === 'whitelist');
      const updateCommand = mainCommand?.commands.find(cmd => cmd.name() === 'update');

      const channelIdOption = updateCommand?.options.find(opt => opt.long === '--channel-id');
      expect(channelIdOption).toBeDefined();
    });

    it('12.4-CMD-018: should have --rank option (required) for update command', () => {
      registerWhitelistCommands(program);

      const mainCommand = program.commands.find(cmd => cmd.name() === 'whitelist');
      const updateCommand = mainCommand?.commands.find(cmd => cmd.name() === 'update');

      const rankOption = updateCommand?.options.find(opt => opt.long === '--rank');
      expect(rankOption).toBeDefined();
      expect(rankOption?.required).toBeTruthy();
    });

    it('12.4-CMD-019: should have --old-code option (required) for update command', () => {
      registerWhitelistCommands(program);

      const mainCommand = program.commands.find(cmd => cmd.name() === 'whitelist');
      const updateCommand = mainCommand?.commands.find(cmd => cmd.name() === 'update');

      const oldCodeOption = updateCommand?.options.find(opt => opt.long === '--old-code');
      expect(oldCodeOption).toBeDefined();
      expect(oldCodeOption?.required).toBeTruthy();
    });

    it('12.4-CMD-020: should have --code option (required) for update command', () => {
      registerWhitelistCommands(program);

      const mainCommand = program.commands.find(cmd => cmd.name() === 'whitelist');
      const updateCommand = mainCommand?.commands.find(cmd => cmd.name() === 'update');

      const codeOption = updateCommand?.options.find(opt => opt.long === '--code');
      expect(codeOption).toBeDefined();
      expect(codeOption?.required).toBeTruthy();
    });

    it('12.4-CMD-021: should have --name option for update command', () => {
      registerWhitelistCommands(program);

      const mainCommand = program.commands.find(cmd => cmd.name() === 'whitelist');
      const updateCommand = mainCommand?.commands.find(cmd => cmd.name() === 'update');

      const nameOption = updateCommand?.options.find(opt => opt.long === '--name');
      expect(nameOption).toBeDefined();
    });

    it('12.4-CMD-022: should have --output option for update command', () => {
      registerWhitelistCommands(program);

      const mainCommand = program.commands.find(cmd => cmd.name() === 'whitelist');
      const updateCommand = mainCommand?.commands.find(cmd => cmd.name() === 'update');

      const outputOption = updateCommand?.options.find(opt => opt.long === '--output');
      expect(outputOption).toBeDefined();
    });
  });

  // ============================================================
  // whitelist remove subcommand
  // ============================================================
  describe('Remove subcommand', () => {
    it('12.4-CMD-023: should register whitelist remove subcommand', () => {
      registerWhitelistCommands(program);

      const mainCommand = program.commands.find(cmd => cmd.name() === 'whitelist');
      const removeCommand = mainCommand?.commands.find(cmd => cmd.name() === 'remove');

      expect(removeCommand).toBeDefined();
      expect(removeCommand?.description()).toContain('删除');
    });

    it('12.4-CMD-024: should have --channel-id option for remove command', () => {
      registerWhitelistCommands(program);

      const mainCommand = program.commands.find(cmd => cmd.name() === 'whitelist');
      const removeCommand = mainCommand?.commands.find(cmd => cmd.name() === 'remove');

      const channelIdOption = removeCommand?.options.find(opt => opt.long === '--channel-id');
      expect(channelIdOption).toBeDefined();
    });

    it('12.4-CMD-025: should have --rank option (required) for remove command', () => {
      registerWhitelistCommands(program);

      const mainCommand = program.commands.find(cmd => cmd.name() === 'whitelist');
      const removeCommand = mainCommand?.commands.find(cmd => cmd.name() === 'remove');

      const rankOption = removeCommand?.options.find(opt => opt.long === '--rank');
      expect(rankOption).toBeDefined();
      expect(rankOption?.required).toBeTruthy();
    });

    it('12.4-CMD-026: should have --codes option for remove command', () => {
      registerWhitelistCommands(program);

      const mainCommand = program.commands.find(cmd => cmd.name() === 'whitelist');
      const removeCommand = mainCommand?.commands.find(cmd => cmd.name() === 'remove');

      const codesOption = removeCommand?.options.find(opt => opt.long === '--codes');
      expect(codesOption).toBeDefined();
    });

    it('12.4-CMD-027: should have --clear flag for remove command', () => {
      registerWhitelistCommands(program);

      const mainCommand = program.commands.find(cmd => cmd.name() === 'whitelist');
      const removeCommand = mainCommand?.commands.find(cmd => cmd.name() === 'remove');

      const clearOption = removeCommand?.options.find(opt => opt.long === '--clear');
      expect(clearOption).toBeDefined();
    });

    it('12.4-CMD-028: should have --output option for remove command', () => {
      registerWhitelistCommands(program);

      const mainCommand = program.commands.find(cmd => cmd.name() === 'whitelist');
      const removeCommand = mainCommand?.commands.find(cmd => cmd.name() === 'remove');

      const outputOption = removeCommand?.options.find(opt => opt.long === '--output');
      expect(outputOption).toBeDefined();
    });
  });

  // ========================================
  // Action Execution Tests
  // ========================================
  describe('action execution', () => {
    let restoreConsole: () => void;
    let restoreExit: () => void;

    beforeEach(() => {
      restoreConsole = suppressConsole();
      restoreExit = mockProcessExit();

      // Setup auth mocks
      mockAuthSuccess(
        authAdapter as jest.Mocked<typeof authAdapter>,
        configManager as jest.Mocked<typeof configManager>
      );
    });

    afterEach(() => {
      restoreConsole();
      restoreExit();
      jest.clearAllMocks();
    });

    // Helper function to create program with whitelist commands
    function createProgramWithWhitelist(): Command {
      const program = createTestProgram();
      registerWhitelistCommands(program);
      return program;
    }

    it('[P0] should call listWhitelist handler with correct params', async () => {
      const { WhitelistHandler } = await import('../handlers/whitelist.handler');
      const mockHandler = {
        listWhitelist: jest.fn().mockResolvedValue(undefined),
      };
      (WhitelistHandler as jest.Mock).mockImplementation(() => mockHandler);

      const program = createProgramWithWhitelist();
      await program.parseAsync(['node', 'test', 'whitelist', 'list', '--rank', '1', '--channel-id', '123456']);

      expect(mockHandler.listWhitelist).toHaveBeenCalledWith(
        expect.objectContaining({ rank: 1, channelId: '123456' })
      );
    });

    it('[P0] should call addWhitelist handler with correct params', async () => {
      const { WhitelistHandler } = await import('../handlers/whitelist.handler');
      const mockHandler = {
        addWhitelist: jest.fn().mockResolvedValue(undefined),
      };
      (WhitelistHandler as jest.Mock).mockImplementation(() => mockHandler);

      const program = createProgramWithWhitelist();
      await program.parseAsync(['node', 'test', 'whitelist', 'add', '--rank', '1', '--code', 'ABC123', '--channel-id', '123456']);

      expect(mockHandler.addWhitelist).toHaveBeenCalledWith(
        expect.objectContaining({ rank: 1, code: 'ABC123', channelId: '123456' })
      );
    });

    it('[P0] should call updateWhitelist handler with correct params', async () => {
      const { WhitelistHandler } = await import('../handlers/whitelist.handler');
      const mockHandler = {
        updateWhitelist: jest.fn().mockResolvedValue(undefined),
      };
      (WhitelistHandler as jest.Mock).mockImplementation(() => mockHandler);

      const program = createProgramWithWhitelist();
      await program.parseAsync([
        'node', 'test', 'whitelist', 'update',
        '--rank', '1',
        '--old-code', 'OLD123',
        '--code', 'NEW123',
        '--channel-id', '123456',
      ]);

      expect(mockHandler.updateWhitelist).toHaveBeenCalledWith(
        expect.objectContaining({
          rank: 1,
          oldCode: 'OLD123',
          code: 'NEW123',
          channelId: '123456',
        })
      );
    });

    it('[P0] should call removeWhitelist handler with correct params', async () => {
      const { WhitelistHandler } = await import('../handlers/whitelist.handler');
      const mockHandler = {
        removeWhitelist: jest.fn().mockResolvedValue(undefined),
      };
      (WhitelistHandler as jest.Mock).mockImplementation(() => mockHandler);

      const program = createProgramWithWhitelist();
      await program.parseAsync(['node', 'test', 'whitelist', 'remove', '--rank', '1', '--codes', 'ABC123', '--channel-id', '123456']);

      expect(mockHandler.removeWhitelist).toHaveBeenCalledWith(
        expect.objectContaining({ rank: 1, codes: 'ABC123', channelId: '123456' })
      );
    });

    it('[P1] should pass name option to addWhitelist', async () => {
      const { WhitelistHandler } = await import('../handlers/whitelist.handler');
      const mockHandler = {
        addWhitelist: jest.fn().mockResolvedValue(undefined),
      };
      (WhitelistHandler as jest.Mock).mockImplementation(() => mockHandler);

      const program = createProgramWithWhitelist();
      await program.parseAsync([
        'node', 'test', 'whitelist', 'add',
        '--rank', '1',
        '--code', 'ABC123',
        '--name', '张三',
      ]);

      expect(mockHandler.addWhitelist).toHaveBeenCalledWith(
        expect.objectContaining({ name: '张三' })
      );
    });

    it('[P1] should pass name option to updateWhitelist', async () => {
      const { WhitelistHandler } = await import('../handlers/whitelist.handler');
      const mockHandler = {
        updateWhitelist: jest.fn().mockResolvedValue(undefined),
      };
      (WhitelistHandler as jest.Mock).mockImplementation(() => mockHandler);

      const program = createProgramWithWhitelist();
      await program.parseAsync([
        'node', 'test', 'whitelist', 'update',
        '--rank', '1',
        '--old-code', 'OLD123',
        '--code', 'NEW123',
        '--name', '李四',
      ]);

      expect(mockHandler.updateWhitelist).toHaveBeenCalledWith(
        expect.objectContaining({ name: '李四' })
      );
    });

    it('[P1] should pass clear flag to removeWhitelist', async () => {
      const { WhitelistHandler } = await import('../handlers/whitelist.handler');
      const mockHandler = {
        removeWhitelist: jest.fn().mockResolvedValue(undefined),
      };
      (WhitelistHandler as jest.Mock).mockImplementation(() => mockHandler);

      const program = createProgramWithWhitelist();
      await program.parseAsync(['node', 'test', 'whitelist', 'remove', '--rank', '1', '--clear']);

      expect(mockHandler.removeWhitelist).toHaveBeenCalledWith(
        expect.objectContaining({ clear: true })
      );
    });

    it('[P1] should pass pagination options to listWhitelist', async () => {
      const { WhitelistHandler } = await import('../handlers/whitelist.handler');
      const mockHandler = {
        listWhitelist: jest.fn().mockResolvedValue(undefined),
      };
      (WhitelistHandler as jest.Mock).mockImplementation(() => mockHandler);

      const program = createProgramWithWhitelist();
      await program.parseAsync([
        'node', 'test', 'whitelist', 'list',
        '--rank', '1',
        '--page', '2',
        '--page-size', '20',
      ]);

      expect(mockHandler.listWhitelist).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2, pageSize: 20 })
      );
    });

    it('[P1] should pass keyword option to listWhitelist', async () => {
      const { WhitelistHandler } = await import('../handlers/whitelist.handler');
      const mockHandler = {
        listWhitelist: jest.fn().mockResolvedValue(undefined),
      };
      (WhitelistHandler as jest.Mock).mockImplementation(() => mockHandler);

      const program = createProgramWithWhitelist();
      await program.parseAsync([
        'node', 'test', 'whitelist', 'list',
        '--rank', '1',
        '--keyword', '张三',
      ]);

      expect(mockHandler.listWhitelist).toHaveBeenCalledWith(
        expect.objectContaining({ keyword: '张三' })
      );
    });

    it('[P1] should pass output option to handlers', async () => {
      const { WhitelistHandler } = await import('../handlers/whitelist.handler');
      const mockHandler = {
        listWhitelist: jest.fn().mockResolvedValue(undefined),
      };
      (WhitelistHandler as jest.Mock).mockImplementation(() => mockHandler);

      const program = createProgramWithWhitelist();
      await program.parseAsync(['node', 'test', 'whitelist', 'list', '--rank', '1', '-o', 'json']);

      expect(mockHandler.listWhitelist).toHaveBeenCalledWith(
        expect.objectContaining({ output: 'json' })
      );
    });

    it('[P1] should handle handler errors gracefully', async () => {
      const { WhitelistHandler } = await import('../handlers/whitelist.handler');
      const mockHandler = {
        listWhitelist: jest.fn().mockRejectedValue(new Error('API Error')),
      };
      (WhitelistHandler as jest.Mock).mockImplementation(() => mockHandler);

      const program = createProgramWithWhitelist();

      await expect(
        program.parseAsync(['node', 'test', 'whitelist', 'list', '--rank', '1'])
      ).rejects.toThrow();
    });

    it('[P1] should handle auth failure', async () => {
      mockAuthFailure(
        authAdapter as jest.Mocked<typeof authAdapter>,
        'No authentication configured'
      );
      const program = createProgramWithWhitelist();

      await expect(
        program.parseAsync(['node', 'test', 'whitelist', 'list', '--rank', '1'])
      ).rejects.toThrow();
    });

    it('[P1] should handle config fallback when auth config incomplete', async () => {
      // Mock auth success
      (authAdapter.tryGetAuthConfig as jest.Mock).mockReturnValue({
        config: { appId: 'test-app-id', appSecret: 'test-app-secret', userId: 'test-user-id' },
        source: 'environment',
      });
      // Mock config load failure with specific error message
      (configManager.load as jest.Mock).mockRejectedValue(new Error('Auth configuration is incomplete'));

      const { WhitelistHandler } = await import('../handlers/whitelist.handler');
      const mockHandler = {
        listWhitelist: jest.fn().mockResolvedValue(undefined),
      };
      (WhitelistHandler as jest.Mock).mockImplementation(() => mockHandler);

      const program = createProgramWithWhitelist();
      await program.parseAsync(['node', 'test', 'whitelist', 'list', '--rank', '1']);

      expect(mockHandler.listWhitelist).toHaveBeenCalledWith(
        expect.objectContaining({ rank: 1 })
      );
    });

    it('[P1] should handle config load error without fallback', async () => {
      // Mock auth success
      (authAdapter.tryGetAuthConfig as jest.Mock).mockReturnValue({
        config: { appId: 'test-app-id', appSecret: 'test-app-secret', userId: 'test-user-id' },
        source: 'environment',
      });
      // Mock config load failure with non-auth error
      (configManager.load as jest.Mock).mockRejectedValue(new Error('Config file corrupted'));

      const program = createProgramWithWhitelist();

      await expect(
        program.parseAsync(['node', 'test', 'whitelist', 'list', '--rank', '1'])
      ).rejects.toThrow();
    });
  });
});
