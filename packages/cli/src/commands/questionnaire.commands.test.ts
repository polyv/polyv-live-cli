/**
 * @fileoverview Unit tests for Questionnaire CLI commands
 * @author Development Team
 * @since 11.4.0
 */

import { Command } from 'commander';
import { registerQuestionnaireCommands, validateOutputFormat } from './questionnaire.commands';
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

describe('Questionnaire Commands Registration', () => {
  let program: Command;
  let mockAction: jest.Mock;

  beforeEach(() => {
    program = new Command();
    mockAction = jest.fn();
    jest.clearAllMocks();
  });

  describe('11.4-UNIT-055: should register questionnaire create command', () => {
    it('should register questionnaire create command with correct options', () => {
      registerQuestionnaireCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'questionnaire');
      expect(command).toBeDefined();

      const createSubcommand = command?.commands.find(cmd => cmd.name() === 'create');
      expect(createSubcommand).toBeDefined();

      const options = createSubcommand?.options || [];
      expect(options.some(opt => opt.long === '--channel-id')).toBe(true);
      expect(options.some(opt => opt.long === '--title')).toBe(true);
      expect(options.some(opt => opt.long === '--questions')).toBe(true);
      expect(options.some(opt => opt.long === '--output')).toBe(true);
    });
  });

  describe('11.4-UNIT-056: should register questionnaire list command', () => {
    it('should register questionnaire list command with correct options', () => {
      registerQuestionnaireCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'questionnaire');
      const listSubcommand = command?.commands.find(cmd => cmd.name() === 'list');
      expect(listSubcommand).toBeDefined();

      const options = listSubcommand?.options || [];
      expect(options.some(opt => opt.long === '--channel-id')).toBe(true);
      expect(options.some(opt => opt.long === '--page')).toBe(true);
      expect(options.some(opt => opt.long === '--size')).toBe(true);
      expect(options.some(opt => opt.long === '--start-time')).toBe(true);
      expect(options.some(opt => opt.long === '--end-time')).toBe(true);
      expect(options.some(opt => opt.long === '--session-id')).toBe(false);
      expect(options.some(opt => opt.long === '--start-date')).toBe(false);
      expect(options.some(opt => opt.long === '--end-date')).toBe(false);
      expect(options.some(opt => opt.long === '--output')).toBe(true);
    });

    it('should register questionnaire result-list command with correct options', () => {
      registerQuestionnaireCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'questionnaire');
      const resultListSubcommand = command?.commands.find(cmd => cmd.name() === 'result-list');
      expect(resultListSubcommand).toBeDefined();

      const options = resultListSubcommand?.options || [];
      expect(options.some(opt => opt.long === '--channel-id')).toBe(true);
      expect(options.some(opt => opt.long === '--page')).toBe(true);
      expect(options.some(opt => opt.long === '--size')).toBe(true);
      expect(options.some(opt => opt.long === '--session-id')).toBe(true);
      expect(options.some(opt => opt.long === '--start-date')).toBe(true);
      expect(options.some(opt => opt.long === '--end-date')).toBe(true);
      expect(options.some(opt => opt.long === '--output')).toBe(true);
    });
  });

  describe('11.4-UNIT-057: should register questionnaire detail command', () => {
    it('should register questionnaire detail command with correct options', () => {
      registerQuestionnaireCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'questionnaire');
      const detailSubcommand = command?.commands.find(cmd => cmd.name() === 'detail');
      expect(detailSubcommand).toBeDefined();

      const options = detailSubcommand?.options || [];
      expect(options.some(opt => opt.long === '--channel-id')).toBe(true);
      expect(options.some(opt => opt.long === '--questionnaire-id')).toBe(true);
      expect(options.some(opt => opt.long === '--output')).toBe(true);
    });
  });

  describe('11.4-UNIT-058: should parse --channel-id option correctly', () => {
    it('should parse --channel-id option with short form -c', () => {
      registerQuestionnaireCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'questionnaire');
      const createSubcommand = command?.commands.find(cmd => cmd.name() === 'create');

      const channelIdOption = createSubcommand?.options.find(opt => opt.long === '--channel-id');
      expect(channelIdOption?.short).toBe('-c');
    });
  });

  describe('11.4-UNIT-059: should parse --title option correctly', () => {
    it('should have --title option in questionnaire create command', () => {
      registerQuestionnaireCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'questionnaire');
      const createSubcommand = command?.commands.find(cmd => cmd.name() === 'create');

      const titleOption = createSubcommand?.options.find(opt => opt.long === '--title');
      expect(titleOption).toBeDefined();
    });
  });

  describe('11.4-UNIT-060: should parse --questions option correctly', () => {
    it('should have --questions option in questionnaire create command', () => {
      registerQuestionnaireCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'questionnaire');
      const createSubcommand = command?.commands.find(cmd => cmd.name() === 'create');

      const questionsOption = createSubcommand?.options.find(opt => opt.long === '--questions');
      expect(questionsOption).toBeDefined();
    });
  });

  describe('11.4-UNIT-061: should parse --questionnaire-id option correctly', () => {
    it('should have --questionnaire-id option in questionnaire detail command', () => {
      registerQuestionnaireCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'questionnaire');
      const detailSubcommand = command?.commands.find(cmd => cmd.name() === 'detail');

      const questionnaireIdOption = detailSubcommand?.options.find(opt => opt.long === '--questionnaire-id');
      expect(questionnaireIdOption).toBeDefined();
    });
  });

  describe('11.4-UNIT-062: should parse pagination options (page, size)', () => {
    it('should have --page option in questionnaire list command', () => {
      registerQuestionnaireCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'questionnaire');
      const listSubcommand = command?.commands.find(cmd => cmd.name() === 'list');

      const pageOption = listSubcommand?.options.find(opt => opt.long === '--page');
      expect(pageOption).toBeDefined();
    });

    it('should have --size option in questionnaire list command', () => {
      registerQuestionnaireCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'questionnaire');
      const listSubcommand = command?.commands.find(cmd => cmd.name() === 'list');

      const sizeOption = listSubcommand?.options.find(opt => opt.long === '--size');
      expect(sizeOption).toBeDefined();
    });
  });

  describe('11.4-UNIT-063: should parse date range options', () => {
    it('should have --start-time option in questionnaire list command', () => {
      registerQuestionnaireCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'questionnaire');
      const listSubcommand = command?.commands.find(cmd => cmd.name() === 'list');

      const startTimeOption = listSubcommand?.options.find(opt => opt.long === '--start-time');
      expect(startTimeOption).toBeDefined();
    });

    it('should have --end-time option in questionnaire list command', () => {
      registerQuestionnaireCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'questionnaire');
      const listSubcommand = command?.commands.find(cmd => cmd.name() === 'list');

      const endTimeOption = listSubcommand?.options.find(opt => opt.long === '--end-time');
      expect(endTimeOption).toBeDefined();
    });

    it('should have --start-date and --end-date options in questionnaire result-list command', () => {
      registerQuestionnaireCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'questionnaire');
      const resultListSubcommand = command?.commands.find(cmd => cmd.name() === 'result-list');

      expect(resultListSubcommand?.options.find(opt => opt.long === '--start-date')).toBeDefined();
      expect(resultListSubcommand?.options.find(opt => opt.long === '--end-date')).toBeDefined();
    });
  });

  describe('11.4-UNIT-064: should parse --output option (table/json)', () => {
    it('should have --output option with short form -o', () => {
      registerQuestionnaireCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'questionnaire');
      const createSubcommand = command?.commands.find(cmd => cmd.name() === 'create');

      const outputOption = createSubcommand?.options.find(opt => opt.long === '--output');
      expect(outputOption?.short).toBe('-o');
      expect(outputOption?.defaultValue).toBe('table');
    });
  });

  describe('11.4-UNIT-065: should show help for questionnaire create command', () => {
    it('should have description for questionnaire create command', () => {
      registerQuestionnaireCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'questionnaire');
      const createSubcommand = command?.commands.find(cmd => cmd.name() === 'create');
      expect(createSubcommand?.description().toLowerCase()).toContain('create');
    });
  });

  describe('11.4-UNIT-066: should show help for questionnaire list command', () => {
    it('should have description for questionnaire list command', () => {
      registerQuestionnaireCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'questionnaire');
      const listSubcommand = command?.commands.find(cmd => cmd.name() === 'list');
      expect(listSubcommand?.description().toLowerCase()).toContain('list');
    });
  });

  describe('11.4-UNIT-067: should show help for questionnaire detail command', () => {
    it('should have description for questionnaire detail command', () => {
      registerQuestionnaireCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'questionnaire');
      const detailSubcommand = command?.commands.find(cmd => cmd.name() === 'detail');
      expect(detailSubcommand?.description().toLowerCase()).toContain('detail');
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

  describe('create action', () => {
    it('[P0] should call createQuestionnaire handler with correct params', async () => {
      const mockHandler = { createQuestionnaire: jest.fn().mockResolvedValue(undefined) };
      MockQaQuestionnaireHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerQuestionnaireCommands(program);
      await program.parseAsync([
        'node', 'test', 'questionnaire', 'create',
        '-c', '123456',
        '--title', 'Survey',
        '--questions', '[{"name":"Q1","type":"X","required":"Y"}]',
      ]);

      expect(MockQaQuestionnaireHandler).toHaveBeenCalled();
      expect(mockHandler.createQuestionnaire).toHaveBeenCalledWith(expect.objectContaining({
        channelId: '123456',
        title: 'Survey',
        questions: [{ name: 'Q1', type: 'X', required: 'Y' }],
        output: 'table',
      }));
    });

    it('[P1] should handle invalid JSON in questions parameter', async () => {
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerQuestionnaireCommands(program);
      await expect(program.parseAsync([
        'node', 'test', 'questionnaire', 'create',
        '-c', '123456',
        '--title', 'Survey',
        '--questions', 'invalid-json',
      ])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Invalid JSON format for --questions parameter',
      }));
    });

    it('[P1] should call createQuestionnaire with optional params', async () => {
      const mockHandler = { createQuestionnaire: jest.fn().mockResolvedValue(undefined) };
      MockQaQuestionnaireHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerQuestionnaireCommands(program);
      await program.parseAsync([
        'node', 'test', 'questionnaire', 'create',
        '-c', '123456',
        '--title', 'Survey',
        '--questions', '[{"name":"Q1","type":"X"}]',
        '--custom-questionnaire-id', 'custom-001',
        '--auto-publish-time', '1700000000',
        '--auto-end-time', '1700100000',
        '--privacy-enabled',
        '--privacy-content', 'Agree to terms',
        '-o', 'json',
      ]);

      expect(mockHandler.createQuestionnaire).toHaveBeenCalledWith(expect.objectContaining({
        channelId: '123456',
        title: 'Survey',
        questions: [{ name: 'Q1', type: 'X' }],
        customQuestionnaireId: 'custom-001',
        autoPublishTime: 1700000000,
        autoEndTime: 1700100000,
        privacyEnabled: 'Y',
        privacyContent: 'Agree to terms',
        output: 'json',
      }));
    });

    it('[P1] should handle API errors in create action', async () => {
      const mockHandler = { createQuestionnaire: jest.fn().mockRejectedValue(new Error('Create failed')) };
      MockQaQuestionnaireHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerQuestionnaireCommands(program);
      await expect(program.parseAsync([
        'node', 'test', 'questionnaire', 'create',
        '-c', '123456',
        '--title', 'Survey',
        '--questions', '[{"name":"Q1","type":"X"}]',
      ])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });

  describe('list action', () => {
    it('[P0] should call listQuestionnaire handler with correct params', async () => {
      const mockHandler = { listQuestionnaire: jest.fn().mockResolvedValue(undefined) };
      MockQaQuestionnaireHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerQuestionnaireCommands(program);
      await program.parseAsync(['node', 'test', 'questionnaire', 'list', '-c', '123456']);

      expect(MockQaQuestionnaireHandler).toHaveBeenCalled();
      expect(mockHandler.listQuestionnaire).toHaveBeenCalledWith({
        channelId: '123456',
        startTime: undefined,
        endTime: undefined,
        page: undefined,
        size: undefined,
        output: 'table',
      });
    });

    it('[P1] should call listQuestionnaire with all options', async () => {
      const mockHandler = { listQuestionnaire: jest.fn().mockResolvedValue(undefined) };
      MockQaQuestionnaireHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerQuestionnaireCommands(program);
      await program.parseAsync([
        'node', 'test', 'questionnaire', 'list',
        '-c', '123456',
        '--page', '2',
        '--size', '50',
        '--start-time', '1704067200000',
        '--end-time', '1706745599000',
        '-o', 'json',
      ]);

      expect(mockHandler.listQuestionnaire).toHaveBeenCalledWith({
        channelId: '123456',
        startTime: 1704067200000,
        endTime: 1706745599000,
        page: 2,
        size: 50,
        output: 'json',
      });
    });

    it('[P1] should handle API errors in list action', async () => {
      const mockHandler = { listQuestionnaire: jest.fn().mockRejectedValue(new Error('List failed')) };
      MockQaQuestionnaireHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerQuestionnaireCommands(program);
      await expect(program.parseAsync(['node', 'test', 'questionnaire', 'list', '-c', '123456'])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });

  describe('result-list action', () => {
    it('[P0] should call listQuestionnaires handler with correct params', async () => {
      const mockHandler = { listQuestionnaires: jest.fn().mockResolvedValue(undefined) };
      MockQaQuestionnaireHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerQuestionnaireCommands(program);
      await program.parseAsync(['node', 'test', 'questionnaire', 'result-list', '-c', '123456']);

      expect(MockQaQuestionnaireHandler).toHaveBeenCalled();
      expect(mockHandler.listQuestionnaires).toHaveBeenCalledWith({
        channelId: '123456',
        page: undefined,
        size: undefined,
        sessionId: undefined,
        startDate: undefined,
        endDate: undefined,
        output: 'table',
      });
    });

    it('[P1] should call listQuestionnaires with all options', async () => {
      const mockHandler = { listQuestionnaires: jest.fn().mockResolvedValue(undefined) };
      MockQaQuestionnaireHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerQuestionnaireCommands(program);
      await program.parseAsync([
        'node', 'test', 'questionnaire', 'result-list',
        '-c', '123456',
        '--page', '2',
        '--size', '50',
        '--session-id', 'session-123',
        '--start-date', '2024-01-01',
        '--end-date', '2024-01-31',
        '-o', 'json',
      ]);

      expect(mockHandler.listQuestionnaires).toHaveBeenCalledWith({
        channelId: '123456',
        page: 2,
        size: 50,
        sessionId: 'session-123',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        output: 'json',
      });
    });
  });

  describe('detail action', () => {
    it('[P0] should call getQuestionnaireDetail handler with correct params', async () => {
      const mockHandler = { getQuestionnaireDetail: jest.fn().mockResolvedValue(undefined) };
      MockQaQuestionnaireHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerQuestionnaireCommands(program);
      await program.parseAsync([
        'node', 'test', 'questionnaire', 'detail',
        '-c', '123456',
        '--questionnaire-id', 'fs9v59nq4u',
      ]);

      expect(MockQaQuestionnaireHandler).toHaveBeenCalled();
      expect(mockHandler.getQuestionnaireDetail).toHaveBeenCalledWith({
        channelId: '123456',
        questionnaireId: 'fs9v59nq4u',
        output: 'table',
      });
    });

    it('[P1] should call getQuestionnaireDetail with json output', async () => {
      const mockHandler = { getQuestionnaireDetail: jest.fn().mockResolvedValue(undefined) };
      MockQaQuestionnaireHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerQuestionnaireCommands(program);
      await program.parseAsync([
        'node', 'test', 'questionnaire', 'detail',
        '-c', '123456',
        '--questionnaire-id', 'fs9v59nq4u',
        '-o', 'json',
      ]);

      expect(mockHandler.getQuestionnaireDetail).toHaveBeenCalledWith({
        channelId: '123456',
        questionnaireId: 'fs9v59nq4u',
        output: 'json',
      });
    });

    it('[P1] should handle API errors in detail action', async () => {
      const mockHandler = { getQuestionnaireDetail: jest.fn().mockRejectedValue(new Error('Detail failed')) };
      MockQaQuestionnaireHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerQuestionnaireCommands(program);
      await expect(program.parseAsync([
        'node', 'test', 'questionnaire', 'detail',
        '-c', '123456',
        '--questionnaire-id', 'fs9v59nq4u',
      ])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });
});
