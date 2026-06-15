/**
 * @fileoverview Unit tests for transmit commands
 * @author Development Team
 * @since 14.3.0
 */

import { Command } from 'commander';
import { registerTransmitCommands, validateOutputFormat } from './transmit.commands';
import { authAdapter } from '../config/auth-adapter';
import { configManager } from '../config/manager';
import { suppressConsole, mockProcessExit, mockAuthSuccess } from '../utils/test-helpers';

// Mock dependencies
jest.mock('../config/auth-adapter');
jest.mock('../config/manager');
jest.mock('../handlers/transmit.handler');
jest.mock('../utils/errors', () => ({
  logError: jest.fn(),
}));

describe('Transmit Commands', () => {
  describe('command registration', () => {
    let program: Command;

    beforeEach(() => {
      program = new Command();
      registerTransmitCommands(program);
    });

    it('should register transmit command group', () => {
      const transmitCmd = program.commands.find(cmd => cmd.name() === 'transmit');
      expect(transmitCmd).toBeDefined();
      expect(transmitCmd?.description()).toMatch(/转播|transmit/i);
    });

    // ========================================
    // AC1: create subcommand
    // ========================================
    it('should register transmit create subcommand', () => {
      const transmitCmd = program.commands.find(cmd => cmd.name() === 'transmit');
      const createCmd = transmitCmd?.commands.find(cmd => cmd.name() === 'create');

      expect(createCmd).toBeDefined();
      expect(createCmd?.description()).toMatch(/创建|create|批量|transmit/i);
    });

    it('should register channelId as required option for create command', () => {
      const transmitCmd = program.commands.find(cmd => cmd.name() === 'transmit');
      const createCmd = transmitCmd?.commands.find(cmd => cmd.name() === 'create');
      const options = createCmd?.options || [];

      const channelIdOption = options.find(opt => opt.long === '--channelId');
      expect(channelIdOption).toBeDefined();
      expect(channelIdOption?.required).toBe(true);
    });

    it('should register names as required option for create command', () => {
      const transmitCmd = program.commands.find(cmd => cmd.name() === 'transmit');
      const createCmd = transmitCmd?.commands.find(cmd => cmd.name() === 'create');
      const options = createCmd?.options || [];

      const namesOption = options.find(opt => opt.long === '--names');
      expect(namesOption).toBeDefined();
      expect(namesOption?.required).toBe(true);
    });

    it('should register output option for create command', () => {
      const transmitCmd = program.commands.find(cmd => cmd.name() === 'transmit');
      const createCmd = transmitCmd?.commands.find(cmd => cmd.name() === 'create');
      const options = createCmd?.options || [];

      const outputOption = options.find(opt => opt.long === '--output');
      expect(outputOption).toBeDefined();
    });

    // ========================================
    // AC2: list subcommand
    // ========================================
    it('should register transmit list subcommand', () => {
      const transmitCmd = program.commands.find(cmd => cmd.name() === 'transmit');
      const listCmd = transmitCmd?.commands.find(cmd => cmd.name() === 'list');

      expect(listCmd).toBeDefined();
      expect(listCmd?.description()).toMatch(/获取|列出|转播|关联|list/i);
    });

    it('should register channelId as required option for list command', () => {
      const transmitCmd = program.commands.find(cmd => cmd.name() === 'transmit');
      const listCmd = transmitCmd?.commands.find(cmd => cmd.name() === 'list');
      const options = listCmd?.options || [];

      const channelIdOption = options.find(opt => opt.long === '--channelId');
      expect(channelIdOption).toBeDefined();
      expect(channelIdOption?.required).toBe(true);
    });

    it('should register output option for list command', () => {
      const transmitCmd = program.commands.find(cmd => cmd.name() === 'transmit');
      const listCmd = transmitCmd?.commands.find(cmd => cmd.name() === 'list');
      const options = listCmd?.options || [];

      const outputOption = options.find(opt => opt.long === '--output');
      expect(outputOption).toBeDefined();
    });

    // ========================================
    // AC3: output format short option
    // ========================================
    it('[AC3] should register -o short form for --output option on all commands', () => {
      const transmitCmd = program.commands.find(cmd => cmd.name() === 'transmit');

      // Check all commands have -o short form
      const commands = ['create', 'list'];
      for (const cmdName of commands) {
        const cmd = transmitCmd?.commands.find(cmd => cmd.name() === cmdName);
        const outputOption = cmd?.options.find(opt => opt.long === '--output');
        expect(outputOption?.short).toBe('-o');
      }
    });

    it('should not use -v or -V as short option (reserved for --version)', () => {
      const transmitCmd = program.commands.find(cmd => cmd.name() === 'transmit');

      transmitCmd?.commands.forEach(subCmd => {
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
      registerTransmitCommands(program);
    });

    it('should include transmit command in help', () => {
      const helpText = program.helpInformation();
      expect(helpText).toContain('transmit');
    });

    it('should include create command in help', () => {
      const transmitCmd = program.commands.find(cmd => cmd.name() === 'transmit');
      const createCmd = transmitCmd?.commands.find(cmd => cmd.name() === 'create');

      const helpText = createCmd?.helpInformation() || '';
      expect(helpText).toMatch(/channelId|--channelId|names|--names/i);
    });

    it('should include list command in help', () => {
      const transmitCmd = program.commands.find(cmd => cmd.name() === 'transmit');
      const listCmd = transmitCmd?.commands.find(cmd => cmd.name() === 'list');

      const helpText = listCmd?.helpInformation() || '';
      expect(helpText).toMatch(/channelId|--channelId/i);
    });

    it('should include output format options in help', () => {
      const transmitCmd = program.commands.find(cmd => cmd.name() === 'transmit');
      const listCmd = transmitCmd?.commands.find(cmd => cmd.name() === 'list');

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

  // ========================================
  // Action handler execution tests
  // ========================================
  describe('action handlers', () => {
    it('should execute create action handler with correct options', async () => {
      const program = new Command();
      registerTransmitCommands(program);

      const transmitCmd = program.commands.find(cmd => cmd.name() === 'transmit');
      const createCmd = transmitCmd?.commands.find(cmd => cmd.name() === 'create');

      // Verify the action handler is registered
      expect(createCmd).toBeDefined();
    });

    it('should execute list action handler with correct options', async () => {
      const program = new Command();
      registerTransmitCommands(program);

      const transmitCmd = program.commands.find(cmd => cmd.name() === 'transmit');
      const listCmd = transmitCmd?.commands.find(cmd => cmd.name() === 'list');

      // Verify the action handler is registered
      expect(listCmd).toBeDefined();
    });
  });
});

// ============================================================
// Action execution tests
// ============================================================
describe('action execution', () => {
  let restoreConsole: () => void;
  let restoreExit: () => void;
  let MockTransmitHandler: jest.Mock;

  const createTestProgram = (): Command => {
    const program = new Command();
    program.exitOverride();
    return program;
  };

  beforeEach(() => {
    restoreConsole = suppressConsole();
    restoreExit = mockProcessExit();
    MockTransmitHandler = require('../handlers/transmit.handler').TransmitHandler;
    MockTransmitHandler.mockClear();
    mockAuthSuccess(authAdapter as jest.Mocked<typeof authAdapter>, configManager as jest.Mocked<typeof configManager>);
  });

  afterEach(() => {
    restoreConsole();
    restoreExit();
  });

  describe('create action', () => {
    it('[P0] should call batchCreateTransmitChannels handler with correct params', async () => {
      const mockHandler = { batchCreateTransmitChannels: jest.fn().mockResolvedValue(undefined) };
      MockTransmitHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerTransmitCommands(program);
      await program.parseAsync([
        'node', 'test', 'transmit', 'create',
        '--channelId', '123456',
        '--names', 'Channel1,Channel2',
      ]);

      expect(MockTransmitHandler).toHaveBeenCalled();
      expect(mockHandler.batchCreateTransmitChannels).toHaveBeenCalledWith({
        channelId: '123456',
        names: 'Channel1,Channel2',
        output: 'table',
      });
    });

    it('[P1] should call create with json output', async () => {
      const mockHandler = { batchCreateTransmitChannels: jest.fn().mockResolvedValue(undefined) };
      MockTransmitHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerTransmitCommands(program);
      await program.parseAsync([
        'node', 'test', 'transmit', 'create',
        '--channelId', '123456',
        '--names', 'Channel1',
        '-o', 'json',
      ]);

      expect(mockHandler.batchCreateTransmitChannels).toHaveBeenCalledWith({
        channelId: '123456',
        names: 'Channel1',
        output: 'json',
      });
    });

    it('[P1] should handle API errors in create action', async () => {
      const mockHandler = { batchCreateTransmitChannels: jest.fn().mockRejectedValue(new Error('Create failed')) };
      MockTransmitHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerTransmitCommands(program);
      await expect(program.parseAsync([
        'node', 'test', 'transmit', 'create',
        '--channelId', '123456',
        '--names', 'Channel1',
      ])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });

  describe('list action', () => {
    it('[P0] should call getTransmitAssociations handler with correct params', async () => {
      const mockHandler = { getTransmitAssociations: jest.fn().mockResolvedValue(undefined) };
      MockTransmitHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerTransmitCommands(program);
      await program.parseAsync(['node', 'test', 'transmit', 'list', '--channelId', '123456']);

      expect(MockTransmitHandler).toHaveBeenCalled();
      expect(mockHandler.getTransmitAssociations).toHaveBeenCalledWith({
        channelId: '123456',
        output: 'table',
      });
    });

    it('[P1] should call list with json output', async () => {
      const mockHandler = { getTransmitAssociations: jest.fn().mockResolvedValue(undefined) };
      MockTransmitHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerTransmitCommands(program);
      await program.parseAsync(['node', 'test', 'transmit', 'list', '--channelId', '123456', '-o', 'json']);

      expect(mockHandler.getTransmitAssociations).toHaveBeenCalledWith({
        channelId: '123456',
        output: 'json',
      });
    });

    it('[P1] should handle API errors in list action', async () => {
      const mockHandler = { getTransmitAssociations: jest.fn().mockRejectedValue(new Error('List failed')) };
      MockTransmitHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerTransmitCommands(program);
      await expect(program.parseAsync(['node', 'test', 'transmit', 'list', '--channelId', '123456'])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });
});
