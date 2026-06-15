/**
 * @fileoverview Unit tests for promotion commands
 * @author Development Team
 * @since 14.1.0
 */

import { Command } from 'commander';
import { registerPromotionCommands, validateOutputFormat } from './promotion.commands';
import { authAdapter } from '../config/auth-adapter';
import { configManager } from '../config/manager';
import { suppressConsole, mockProcessExit, mockAuthSuccess } from '../utils/test-helpers';

// Mock dependencies
jest.mock('../config/auth-adapter');
jest.mock('../config/manager');
jest.mock('../handlers/promotion.handler');
jest.mock('../utils/errors', () => ({
  logError: jest.fn(),
}));

describe('Promotion Commands', () => {
  describe('command registration', () => {
    let program: Command;

    beforeEach(() => {
      program = new Command();
      registerPromotionCommands(program);
    });

    it('should register promotion command group', () => {
      const promotionCmd = program.commands.find(cmd => cmd.name() === 'promotion');
      expect(promotionCmd).toBeDefined();
      expect(promotionCmd?.description()).toMatch(/推广|promotion/i);
    });

    it('should register promotion list subcommand', () => {
      const promotionCmd = program.commands.find(cmd => cmd.name() === 'promotion');
      const listCmd = promotionCmd?.commands.find(cmd => cmd.name() === 'list');

      expect(listCmd).toBeDefined();
      expect(listCmd?.description()).toMatch(/列出|list|推广|promotion/i);
    });

    it('should register promotion create subcommand', () => {
      const promotionCmd = program.commands.find(cmd => cmd.name() === 'promotion');
      const createCmd = promotionCmd?.commands.find(cmd => cmd.name() === 'create');

      expect(createCmd).toBeDefined();
      expect(createCmd?.description()).toMatch(/创建|create|推广|promotion/i);
    });

    it('should register channelId as required option for list command', () => {
      const promotionCmd = program.commands.find(cmd => cmd.name() === 'promotion');
      const listCmd = promotionCmd?.commands.find(cmd => cmd.name() === 'list');
      const options = listCmd?.options || [];

      const channelIdOption = options.find(opt => opt.long === '--channelId');
      expect(channelIdOption).toBeDefined();
      expect(channelIdOption?.required).toBe(true);
    });

    it('should register channelId as required option for create command', () => {
      const promotionCmd = program.commands.find(cmd => cmd.name() === 'promotion');
      const createCmd = promotionCmd?.commands.find(cmd => cmd.name() === 'create');
      const options = createCmd?.options || [];

      const channelIdOption = options.find(opt => opt.long === '--channelId');
      expect(channelIdOption).toBeDefined();
      expect(channelIdOption?.required).toBe(true);
    });

    it('should register names as required option for create command', () => {
      const promotionCmd = program.commands.find(cmd => cmd.name() === 'promotion');
      const createCmd = promotionCmd?.commands.find(cmd => cmd.name() === 'create');
      const options = createCmd?.options || [];

      const namesOption = options.find(opt => opt.long === '--names');
      expect(namesOption).toBeDefined();
      expect(namesOption?.required).toBe(true);
    });

    it('should register output option for list command', () => {
      const promotionCmd = program.commands.find(cmd => cmd.name() === 'promotion');
      const listCmd = promotionCmd?.commands.find(cmd => cmd.name() === 'list');
      const options = listCmd?.options || [];

      const outputOption = options.find(opt => opt.long === '--output');
      expect(outputOption).toBeDefined();
    });

    it('should register output option for create command', () => {
      const promotionCmd = program.commands.find(cmd => cmd.name() === 'promotion');
      const createCmd = promotionCmd?.commands.find(cmd => cmd.name() === 'create');
      const options = createCmd?.options || [];

      const outputOption = options.find(opt => opt.long === '--output');
      expect(outputOption).toBeDefined();
    });

    it('[AC3] should register -o short form for --output option', () => {
      const promotionCmd = program.commands.find(cmd => cmd.name() === 'promotion');

      // Check list command
      const listCmd = promotionCmd?.commands.find(cmd => cmd.name() === 'list');
      const listOutputOption = listCmd?.options.find(opt => opt.long === '--output');
      expect(listOutputOption?.short).toBe('-o');

      // Check create command
      const createCmd = promotionCmd?.commands.find(cmd => cmd.name() === 'create');
      const createOutputOption = createCmd?.options.find(opt => opt.long === '--output');
      expect(createOutputOption?.short).toBe('-o');
    });

    it('should not use -v or -V as short option (reserved for --version)', () => {
      const promotionCmd = program.commands.find(cmd => cmd.name() === 'promotion');

      promotionCmd?.commands.forEach(subCmd => {
        subCmd.options.forEach(opt => {
          expect(opt.short).not.toBe('-v');
          expect(opt.short).not.toBe('-V');
        });
      });
    });
  });

  describe('help information', () => {
    let program: Command;

    beforeEach(() => {
      program = new Command();
      registerPromotionCommands(program);
    });

    it('should include promotion command in help', () => {
      const helpText = program.helpInformation();
      expect(helpText).toContain('promotion');
    });

    it('should include list command in help', () => {
      const promotionCmd = program.commands.find(cmd => cmd.name() === 'promotion');
      const listCmd = promotionCmd?.commands.find(cmd => cmd.name() === 'list');

      const helpText = listCmd?.helpInformation() || '';
      expect(helpText).toMatch(/channelId|--channelId/i);
    });

    it('should include create command in help', () => {
      const promotionCmd = program.commands.find(cmd => cmd.name() === 'promotion');
      const createCmd = promotionCmd?.commands.find(cmd => cmd.name() === 'create');

      const helpText = createCmd?.helpInformation() || '';
      expect(helpText).toMatch(/channelId|--channelId|names|--names/i);
    });

    it('should include output format options in help', () => {
      const promotionCmd = program.commands.find(cmd => cmd.name() === 'promotion');
      const listCmd = promotionCmd?.commands.find(cmd => cmd.name() === 'list');

      const helpText = listCmd?.helpInformation() || '';
      expect(helpText).toMatch(/output|--output|-o|json|table/i);
    });
  });

  // ========================================
  // Validation functions tests
  // ========================================
  describe('validateOutputFormat', () => {
    it('should validate table format', () => {
      expect(validateOutputFormat('table')).toBe('table');
    });

    it('should validate json format', () => {
      expect(validateOutputFormat('json')).toBe('json');
    });

    it('should throw error for invalid format', () => {
      expect(() => validateOutputFormat('xml')).toThrow('Invalid output format');
    });

    it('should throw error for uppercase format', () => {
      expect(() => validateOutputFormat('JSON')).toThrow('Invalid output format');
    });

    it('should throw error for empty string', () => {
      expect(() => validateOutputFormat('')).toThrow('Invalid output format');
    });
  });
});

// ============================================================
// Action execution tests
// ============================================================
describe('action execution', () => {
  let restoreConsole: () => void;
  let restoreExit: () => void;
  let MockPromotionHandler: jest.Mock;

  const createTestProgram = (): Command => {
    const program = new Command();
    program.exitOverride();
    return program;
  };

  beforeEach(() => {
    restoreConsole = suppressConsole();
    restoreExit = mockProcessExit();
    MockPromotionHandler = require('../handlers/promotion.handler').PromotionHandler;
    MockPromotionHandler.mockClear();
    mockAuthSuccess(authAdapter as jest.Mocked<typeof authAdapter>, configManager as jest.Mocked<typeof configManager>);
  });

  afterEach(() => {
    restoreConsole();
    restoreExit();
  });

  describe('list action', () => {
    it('[P0] should call listPromotions handler with correct params', async () => {
      const mockHandler = { listPromotions: jest.fn().mockResolvedValue(undefined) };
      MockPromotionHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerPromotionCommands(program);
      await program.parseAsync(['node', 'test', 'promotion', 'list', '--channelId', '123456']);

      expect(MockPromotionHandler).toHaveBeenCalled();
      expect(mockHandler.listPromotions).toHaveBeenCalledWith({
        channelId: '123456',
        output: 'table',
      });
    });

    it('[P1] should call listPromotions with json output', async () => {
      const mockHandler = { listPromotions: jest.fn().mockResolvedValue(undefined) };
      MockPromotionHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerPromotionCommands(program);
      await program.parseAsync(['node', 'test', 'promotion', 'list', '--channelId', '123456', '-o', 'json']);

      expect(mockHandler.listPromotions).toHaveBeenCalledWith({
        channelId: '123456',
        output: 'json',
      });
    });

    it('[P1] should handle API errors in list action', async () => {
      const mockHandler = { listPromotions: jest.fn().mockRejectedValue(new Error('List failed')) };
      MockPromotionHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerPromotionCommands(program);
      await expect(program.parseAsync(['node', 'test', 'promotion', 'list', '--channelId', '123456'])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });

  describe('create action', () => {
    it('[P0] should call createPromotions handler with correct params', async () => {
      const mockHandler = { createPromotions: jest.fn().mockResolvedValue(undefined) };
      MockPromotionHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerPromotionCommands(program);
      await program.parseAsync([
        'node', 'test', 'promotion', 'create',
        '--channelId', '123456',
        '--names', 'Channel1,Channel2',
      ]);

      expect(MockPromotionHandler).toHaveBeenCalled();
      expect(mockHandler.createPromotions).toHaveBeenCalledWith({
        channelId: '123456',
        names: ['Channel1', 'Channel2'],
        output: 'table',
      });
    });

    it('[P1] should call createPromotions with json output', async () => {
      const mockHandler = { createPromotions: jest.fn().mockResolvedValue(undefined) };
      MockPromotionHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerPromotionCommands(program);
      await program.parseAsync([
        'node', 'test', 'promotion', 'create',
        '--channelId', '123456',
        '--names', 'Channel1',
        '-o', 'json',
      ]);

      expect(mockHandler.createPromotions).toHaveBeenCalledWith({
        channelId: '123456',
        names: ['Channel1'],
        output: 'json',
      });
    });

    it('[P1] should handle API errors in create action', async () => {
      const mockHandler = { createPromotions: jest.fn().mockRejectedValue(new Error('Create failed')) };
      MockPromotionHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerPromotionCommands(program);
      await expect(program.parseAsync([
        'node', 'test', 'promotion', 'create',
        '--channelId', '123456',
        '--names', 'Channel1',
      ])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });
});
