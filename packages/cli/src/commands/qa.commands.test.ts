/**
 * @fileoverview Unit tests for QA CLI commands
 * @author Development Team
 * @since 11.4.0
 */

import { Command } from 'commander';
import { registerQaCommands, validateOutputFormat } from './qa.commands';
import { authAdapter } from '../config/auth-adapter';
import { configManager } from '../config/manager';
import { suppressConsole, mockProcessExit, mockAuthSuccess } from '../utils/test-helpers';

// Mock dependencies
jest.mock('../config/auth-adapter');
jest.mock('../config/manager');
jest.mock('../handlers/qa-questionnaire.handler');
jest.mock('../utils/errors', () => ({
  logError: jest.fn(),
}));

describe('QA Commands Registration', () => {
  let program: Command;
  let mockAction: jest.Mock;

  beforeEach(() => {
    program = new Command();
    mockAction = jest.fn();
    jest.clearAllMocks();
  });

  describe('11.4-UNIT-045: should register qa send command', () => {
    it('should register qa send command with correct options', () => {
      registerQaCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'qa');
      expect(command).toBeDefined();

      const sendSubcommand = command?.commands.find(cmd => cmd.name() === 'send');
      expect(sendSubcommand).toBeDefined();

      const options = sendSubcommand?.options || [];
      expect(options.some(opt => opt.long === '--channel-id')).toBe(true);
      expect(options.some(opt => opt.long === '--question-id')).toBe(true);
      expect(options.some(opt => opt.long === '--duration')).toBe(true);
      expect(options.some(opt => opt.long === '--output')).toBe(true);
    });
  });

  describe('11.4-UNIT-046: should register qa list command', () => {
    it('should register qa list command with correct options', () => {
      registerQaCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'qa');
      const listSubcommand = command?.commands.find(cmd => cmd.name() === 'list');
      expect(listSubcommand).toBeDefined();

      const options = listSubcommand?.options || [];
      expect(options.some(opt => opt.long === '--channel-id')).toBe(true);
      expect(options.some(opt => opt.long === '--output')).toBe(true);
    });
  });

  describe('11.4-UNIT-047: should register qa stop command', () => {
    it('should register qa stop command with correct options', () => {
      registerQaCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'qa');
      const stopSubcommand = command?.commands.find(cmd => cmd.name() === 'stop');
      expect(stopSubcommand).toBeDefined();

      const options = stopSubcommand?.options || [];
      expect(options.some(opt => opt.long === '--channel-id')).toBe(true);
      expect(options.some(opt => opt.long === '--question-id')).toBe(true);
      expect(options.some(opt => opt.long === '--output')).toBe(true);
    });
  });

  describe('11.4-UNIT-048: should parse --channel-id option correctly', () => {
    it('should parse --channel-id option with short form -c', () => {
      registerQaCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'qa');
      const sendSubcommand = command?.commands.find(cmd => cmd.name() === 'send');

      const channelIdOption = sendSubcommand?.options.find(opt => opt.long === '--channel-id');
      expect(channelIdOption?.short).toBe('-c');
    });
  });

  describe('11.4-UNIT-049: should parse --question-id option correctly', () => {
    it('should have --question-id option in qa send command', () => {
      registerQaCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'qa');
      const sendSubcommand = command?.commands.find(cmd => cmd.name() === 'send');

      const questionIdOption = sendSubcommand?.options.find(opt => opt.long === '--question-id');
      expect(questionIdOption).toBeDefined();
    });

    it('should have --question-id option in qa stop command', () => {
      registerQaCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'qa');
      const stopSubcommand = command?.commands.find(cmd => cmd.name() === 'stop');

      const questionIdOption = stopSubcommand?.options.find(opt => opt.long === '--question-id');
      expect(questionIdOption).toBeDefined();
    });
  });

  describe('11.4-UNIT-050: should parse --duration option correctly', () => {
    it('should have --duration option in qa send command', () => {
      registerQaCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'qa');
      const sendSubcommand = command?.commands.find(cmd => cmd.name() === 'send');

      const durationOption = sendSubcommand?.options.find(opt => opt.long === '--duration');
      expect(durationOption).toBeDefined();
    });
  });

  describe('11.4-UNIT-051: should parse --output option (table/json)', () => {
    it('should have --output option with short form -o', () => {
      registerQaCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'qa');
      const sendSubcommand = command?.commands.find(cmd => cmd.name() === 'send');

      const outputOption = sendSubcommand?.options.find(opt => opt.long === '--output');
      expect(outputOption?.short).toBe('-o');
      expect(outputOption?.defaultValue).toBe('table');
    });
  });

  describe('11.4-UNIT-052: should show help for qa send command', () => {
    it('should have description for qa send command', () => {
      registerQaCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'qa');
      const sendSubcommand = command?.commands.find(cmd => cmd.name() === 'send');
      expect(sendSubcommand?.description().toLowerCase()).toContain('send');
    });
  });

  describe('11.4-UNIT-053: should show help for qa list command', () => {
    it('should have description for qa list command', () => {
      registerQaCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'qa');
      const listSubcommand = command?.commands.find(cmd => cmd.name() === 'list');
      expect(listSubcommand?.description().toLowerCase()).toContain('list');
    });
  });

  describe('11.4-UNIT-054: should show help for qa stop command', () => {
    it('should have description for qa stop command', () => {
      registerQaCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'qa');
      const stopSubcommand = command?.commands.find(cmd => cmd.name() === 'stop');
      expect(stopSubcommand?.description().toLowerCase()).toContain('stop');
    });
  });

  // Tests for validateOutputFormat function
  describe('validateOutputFormat', () => {
    it('should return "table" for valid input "table"', () => {
      expect(validateOutputFormat('table')).toBe('table');
    });

    it('should return "json" for valid input "json"', () => {
      expect(validateOutputFormat('json')).toBe('json');
    });

    it('should throw error for invalid format', () => {
      expect(() => validateOutputFormat('invalid')).toThrow('Output format must be either "table" or "json"');
    });

    it('should throw error for empty string', () => {
      expect(() => validateOutputFormat('')).toThrow('Output format must be either "table" or "json"');
    });

    it('should throw error for case-sensitive mismatch', () => {
      expect(() => validateOutputFormat('TABLE')).toThrow('Output format must be either "table" or "json"');
    });

    it('should throw error for XML format', () => {
      expect(() => validateOutputFormat('xml')).toThrow('Output format must be either "table" or "json"');
    });

    it('should throw error for YAML format', () => {
      expect(() => validateOutputFormat('yaml')).toThrow('Output format must be either "table" or "json"');
    });

    it('should throw error for CSV format', () => {
      expect(() => validateOutputFormat('csv')).toThrow('Output format must be either "table" or "json"');
    });
  });
});

// ============================================================
// Action execution tests
// ============================================================
describe('action execution', () => {
  let restoreConsole: () => void;
  let restoreExit: () => void;
  let MockQaQuestionnaireHandler: jest.Mock;

  const createTestProgram = (): Command => {
    const program = new Command();
    program.exitOverride();
    return program;
  };

  beforeEach(() => {
    restoreConsole = suppressConsole();
    restoreExit = mockProcessExit();
    MockQaQuestionnaireHandler = require('../handlers/qa-questionnaire.handler').QaQuestionnaireHandler;
    MockQaQuestionnaireHandler.mockClear();
    mockAuthSuccess(authAdapter as jest.Mocked<typeof authAdapter>, configManager as jest.Mocked<typeof configManager>);
  });

  afterEach(() => {
    restoreConsole();
    restoreExit();
  });

  describe('send action', () => {
    it('[P0] should call sendQa handler with correct params', async () => {
      const mockHandler = { sendQa: jest.fn().mockResolvedValue(undefined) };
      MockQaQuestionnaireHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerQaCommands(program);
      await program.parseAsync(['node', 'test', 'qa', 'send', '-c', '123456', '--question-id', 'gv0uf9s5v7']);

      expect(MockQaQuestionnaireHandler).toHaveBeenCalled();
      expect(mockHandler.sendQa).toHaveBeenCalledWith({
        channelId: '123456',
        questionId: 'gv0uf9s5v7',
        duration: undefined,
        output: 'table',
      });
    });

    it('[P1] should call sendQa with duration option', async () => {
      const mockHandler = { sendQa: jest.fn().mockResolvedValue(undefined) };
      MockQaQuestionnaireHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerQaCommands(program);
      await program.parseAsync(['node', 'test', 'qa', 'send', '-c', '123456', '--question-id', 'gv0uf9s5v7', '--duration', '30']);

      expect(mockHandler.sendQa).toHaveBeenCalledWith({
        channelId: '123456',
        questionId: 'gv0uf9s5v7',
        duration: 30,
        output: 'table',
      });
    });

    it('[P1] should call sendQa with json output', async () => {
      const mockHandler = { sendQa: jest.fn().mockResolvedValue(undefined) };
      MockQaQuestionnaireHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerQaCommands(program);
      await program.parseAsync(['node', 'test', 'qa', 'send', '-c', '123456', '--question-id', 'gv0uf9s5v7', '-o', 'json']);

      expect(mockHandler.sendQa).toHaveBeenCalledWith({
        channelId: '123456',
        questionId: 'gv0uf9s5v7',
        duration: undefined,
        output: 'json',
      });
    });

    it('[P1] should handle API errors in send action', async () => {
      const mockHandler = { sendQa: jest.fn().mockRejectedValue(new Error('Send failed')) };
      MockQaQuestionnaireHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerQaCommands(program);
      await expect(program.parseAsync(['node', 'test', 'qa', 'send', '-c', '123456', '--question-id', 'gv0uf9s5v7'])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });

  describe('list action', () => {
    it('[P0] should call listQa handler with correct params', async () => {
      const mockHandler = { listQa: jest.fn().mockResolvedValue(undefined) };
      MockQaQuestionnaireHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerQaCommands(program);
      await program.parseAsync(['node', 'test', 'qa', 'list', '-c', '123456']);

      expect(MockQaQuestionnaireHandler).toHaveBeenCalled();
      expect(mockHandler.listQa).toHaveBeenCalledWith({
        channelId: '123456',
        output: 'table',
      });
    });

    it('[P1] should call listQa with json output', async () => {
      const mockHandler = { listQa: jest.fn().mockResolvedValue(undefined) };
      MockQaQuestionnaireHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerQaCommands(program);
      await program.parseAsync(['node', 'test', 'qa', 'list', '-c', '123456', '-o', 'json']);

      expect(mockHandler.listQa).toHaveBeenCalledWith({
        channelId: '123456',
        output: 'json',
      });
    });

    it('[P1] should handle API errors in list action', async () => {
      const mockHandler = { listQa: jest.fn().mockRejectedValue(new Error('List failed')) };
      MockQaQuestionnaireHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerQaCommands(program);
      await expect(program.parseAsync(['node', 'test', 'qa', 'list', '-c', '123456'])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });

  describe('stop action', () => {
    it('[P0] should call stopQa handler with correct params', async () => {
      const mockHandler = { stopQa: jest.fn().mockResolvedValue(undefined) };
      MockQaQuestionnaireHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerQaCommands(program);
      await program.parseAsync(['node', 'test', 'qa', 'stop', '-c', '123456', '--question-id', 'gv0uf9s5v7']);

      expect(MockQaQuestionnaireHandler).toHaveBeenCalled();
      expect(mockHandler.stopQa).toHaveBeenCalledWith({
        channelId: '123456',
        questionId: 'gv0uf9s5v7',
        output: 'table',
      });
    });

    it('[P1] should call stopQa with json output', async () => {
      const mockHandler = { stopQa: jest.fn().mockResolvedValue(undefined) };
      MockQaQuestionnaireHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerQaCommands(program);
      await program.parseAsync(['node', 'test', 'qa', 'stop', '-c', '123456', '--question-id', 'gv0uf9s5v7', '-o', 'json']);

      expect(mockHandler.stopQa).toHaveBeenCalledWith({
        channelId: '123456',
        questionId: 'gv0uf9s5v7',
        output: 'json',
      });
    });

    it('[P1] should handle API errors in stop action', async () => {
      const mockHandler = { stopQa: jest.fn().mockRejectedValue(new Error('Stop failed')) };
      MockQaQuestionnaireHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerQaCommands(program);
      await expect(program.parseAsync(['node', 'test', 'qa', 'stop', '-c', '123456', '--question-id', 'gv0uf9s5v7'])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });
});
