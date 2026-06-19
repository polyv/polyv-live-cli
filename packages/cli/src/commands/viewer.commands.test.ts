/**
 * @fileoverview Unit tests for viewer CLI commands
 * @author Development Team
 * @since 12.1.0
 *
 * ATDD RED PHASE - These tests will fail until viewer.commands.ts is implemented
 */

import { Command } from 'commander';
// @ts-expect-error - Module not implemented yet
import { registerViewerCommands, validateOutputFormat } from './viewer.commands';
import { authAdapter } from '../config/auth-adapter';
import { configManager } from '../config/manager';
import { suppressConsole, mockProcessExit, mockAuthSuccess } from '../utils/test-helpers';

// Mock dependencies
jest.mock('../config/auth-adapter');
jest.mock('../config/manager');
jest.mock('../handlers/viewer.handler');
jest.mock('../utils/errors', () => ({
  logError: jest.fn(),
}));

describe('Viewer Commands Registration (ATDD RED PHASE)', () => {
  let program: Command;

  beforeEach(() => {
    program = new Command();
    jest.clearAllMocks();
  });

  // ============================================================
  // Main command registration
  // ============================================================
  describe('12.1-CMD-001: should register viewer main command', () => {
    it('should register viewer command with correct description', () => {
      registerViewerCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'viewer');
      expect(command).toBeDefined();
      expect(command?.description().toLowerCase()).toContain('viewer');
    });
  });

  // ============================================================
  // AC #1: viewer get command
  // ============================================================
  describe('12.1-CMD-002: should register viewer get command', () => {
    it('should register get subcommand with correct options', () => {
      registerViewerCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'viewer');
      const getSubcommand = command?.commands.find(cmd => cmd.name() === 'get');
      expect(getSubcommand).toBeDefined();

      const options = getSubcommand?.options || [];
      expect(options.some(opt => opt.long === '--viewer-id')).toBe(true);
      expect(options.some(opt => opt.long === '--output')).toBe(true);
    });

    it('should have short form -i for --viewer-id', () => {
      registerViewerCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'viewer');
      const getSubcommand = command?.commands.find(cmd => cmd.name() === 'get');

      const viewerIdOption = getSubcommand?.options.find(opt => opt.long === '--viewer-id');
      expect(viewerIdOption?.short).toBe('-i');
    });

    it('should have short form -o for --output', () => {
      registerViewerCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'viewer');
      const getSubcommand = command?.commands.find(cmd => cmd.name() === 'get');

      const outputOption = getSubcommand?.options.find(opt => opt.long === '--output');
      expect(outputOption?.short).toBe('-o');
      expect(outputOption?.defaultValue).toBe('table');
    });

    it('should mark viewer-id as required', () => {
      registerViewerCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'viewer');
      const getSubcommand = command?.commands.find(cmd => cmd.name() === 'get');

      const viewerIdOption = getSubcommand?.options.find(opt => opt.long === '--viewer-id');
      expect(viewerIdOption?.required).toBe(true);
    });

    it('should have description for get command', () => {
      registerViewerCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'viewer');
      const getSubcommand = command?.commands.find(cmd => cmd.name() === 'get');
      expect(getSubcommand?.description().toLowerCase()).toContain('get');
    });
  });

  // ============================================================
  // AC #2: viewer list command
  // ============================================================
  describe('12.1-CMD-003: should register viewer list command', () => {
    it('should register list subcommand with correct options', () => {
      registerViewerCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'viewer');
      const listSubcommand = command?.commands.find(cmd => cmd.name() === 'list');
      expect(listSubcommand).toBeDefined();

      const options = listSubcommand?.options || [];
      expect(options.some(opt => opt.long === '--source')).toBe(true);
      expect(options.some(opt => opt.long === '--mobile')).toBe(true);
      expect(options.some(opt => opt.long === '--email')).toBe(true);
      expect(options.some(opt => opt.long === '--area')).toBe(true);
      expect(options.some(opt => opt.long === '--page')).toBe(true);
      expect(options.some(opt => opt.long === '--size')).toBe(true);
      expect(options.some(opt => opt.long === '--output')).toBe(true);
    });

    it('should have short form -o for --output', () => {
      registerViewerCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'viewer');
      const listSubcommand = command?.commands.find(cmd => cmd.name() === 'list');

      const outputOption = listSubcommand?.options.find(opt => opt.long === '--output');
      expect(outputOption?.short).toBe('-o');
      expect(outputOption?.defaultValue).toBe('table');
    });

    it('should have description for list command', () => {
      registerViewerCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'viewer');
      const listSubcommand = command?.commands.find(cmd => cmd.name() === 'list');
      expect(listSubcommand?.description().toLowerCase()).toContain('list');
    });
  });

  // ============================================================
  // AC #4: Output format validation
  // ============================================================
  describe('12.1-CMD-004: validateOutputFormat', () => {
    it('should return "table" for valid input "table"', () => {
      expect(validateOutputFormat('table')).toBe('table');
    });

    it('should return "json" for valid input "json"', () => {
      expect(validateOutputFormat('json')).toBe('json');
    });

    it('should throw error for invalid format', () => {
      expect(() => validateOutputFormat('invalid')).toThrow(
        'Output format must be either "table" or "json"'
      );
    });

    it('should throw error for empty string', () => {
      expect(() => validateOutputFormat('')).toThrow(
        'Output format must be either "table" or "json"'
      );
    });

    it('should throw error for case-sensitive mismatch', () => {
      expect(() => validateOutputFormat('TABLE')).toThrow(
        'Output format must be either "table" or "json"'
      );
    });

    it('should throw error for XML format', () => {
      expect(() => validateOutputFormat('xml')).toThrow(
        'Output format must be either "table" or "json"'
      );
    });

    it('should throw error for CSV format', () => {
      expect(() => validateOutputFormat('csv')).toThrow(
        'Output format must be either "table" or "json"'
      );
    });
  });

  // ============================================================
  // Help text tests
  // ============================================================
  describe('12.1-CMD-005: should show help for viewer commands', () => {
    it('should have help text for get command with examples', () => {
      registerViewerCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'viewer');
      const getSubcommand = command?.commands.find(cmd => cmd.name() === 'get');

      // Check that help text exists
      expect(getSubcommand).toBeDefined();
    });

    it('should have help text for list command with examples', () => {
      registerViewerCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'viewer');
      const listSubcommand = command?.commands.find(cmd => cmd.name() === 'list');

      expect(listSubcommand).toBeDefined();
    });
  });

  // ============================================================
  // All subcommands overview
  // ============================================================
  describe('12.1-CMD-006: should register all subcommands', () => {
    it('should register get and list subcommands', () => {
      registerViewerCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'viewer');
      const subcommandNames = command?.commands.map(cmd => cmd.name()) || [];

      expect(subcommandNames).toContain('get');
      expect(subcommandNames).toContain('list');
    });
  });

  // ============================================================
  // Story 12-2: Viewer Tag Commands
  // ============================================================
  describe('12.2-CMD-001: should register viewer tag subcommand group', () => {
    it('should register tag subcommand under viewer', () => {
      registerViewerCommands(program);

      const viewerCommand = program.commands.find(cmd => cmd.name() === 'viewer');
      const tagCommand = viewerCommand?.commands.find(cmd => cmd.name() === 'tag');

      expect(tagCommand).toBeDefined();
      expect(tagCommand?.description().toLowerCase()).toContain('tag');
    });
  });

  describe('12.2-CMD-002: should register viewer tag list command', () => {
    it('should register tag list subcommand with options', () => {
      registerViewerCommands(program);

      const viewerCommand = program.commands.find(cmd => cmd.name() === 'viewer');
      const tagCommand = viewerCommand?.commands.find(cmd => cmd.name() === 'tag');
      const listSubcommand = tagCommand?.commands.find(cmd => cmd.name() === 'list');

      expect(listSubcommand).toBeDefined();

      const options = listSubcommand?.options || [];
      expect(options.some(opt => opt.long === '--keyword')).toBe(true);
      expect(options.some(opt => opt.long === '--page')).toBe(true);
      expect(options.some(opt => opt.long === '--size')).toBe(true);
      expect(options.some(opt => opt.long === '--output')).toBe(true);
    });

    it('should have short form -k for --keyword', () => {
      registerViewerCommands(program);

      const viewerCommand = program.commands.find(cmd => cmd.name() === 'viewer');
      const tagCommand = viewerCommand?.commands.find(cmd => cmd.name() === 'tag');
      const listSubcommand = tagCommand?.commands.find(cmd => cmd.name() === 'list');

      const keywordOption = listSubcommand?.options.find(opt => opt.long === '--keyword');
      expect(keywordOption?.short).toBe('-k');
    });

    it('should have short form -o for --output', () => {
      registerViewerCommands(program);

      const viewerCommand = program.commands.find(cmd => cmd.name() === 'viewer');
      const tagCommand = viewerCommand?.commands.find(cmd => cmd.name() === 'tag');
      const listSubcommand = tagCommand?.commands.find(cmd => cmd.name() === 'list');

      const outputOption = listSubcommand?.options.find(opt => opt.long === '--output');
      expect(outputOption?.short).toBe('-o');
      expect(outputOption?.defaultValue).toBe('table');
    });

    it('should have description for tag list command', () => {
      registerViewerCommands(program);

      const viewerCommand = program.commands.find(cmd => cmd.name() === 'viewer');
      const tagCommand = viewerCommand?.commands.find(cmd => cmd.name() === 'tag');
      const listSubcommand = tagCommand?.commands.find(cmd => cmd.name() === 'list');

      expect(listSubcommand?.description().toLowerCase()).toContain('list');
    });
  });

  describe('12.2-CMD-003: should register viewer tag add command', () => {
    it('should register tag add subcommand with required options', () => {
      registerViewerCommands(program);

      const viewerCommand = program.commands.find(cmd => cmd.name() === 'viewer');
      const tagCommand = viewerCommand?.commands.find(cmd => cmd.name() === 'tag');
      const addSubcommand = tagCommand?.commands.find(cmd => cmd.name() === 'add');

      expect(addSubcommand).toBeDefined();

      const options = addSubcommand?.options || [];
      expect(options.some(opt => opt.long === '--viewer-ids')).toBe(true);
      expect(options.some(opt => opt.long === '--label-ids')).toBe(true);
      expect(options.some(opt => opt.long === '--output')).toBe(true);
    });

    it('should have short form -V for --viewer-ids', () => {
      registerViewerCommands(program);

      const viewerCommand = program.commands.find(cmd => cmd.name() === 'viewer');
      const tagCommand = viewerCommand?.commands.find(cmd => cmd.name() === 'tag');
      const addSubcommand = tagCommand?.commands.find(cmd => cmd.name() === 'add');

      const viewerIdsOption = addSubcommand?.options.find(opt => opt.long === '--viewer-ids');
      expect(viewerIdsOption?.short).toBe('-V');
    });

    it('should have short form -l for --label-ids', () => {
      registerViewerCommands(program);

      const viewerCommand = program.commands.find(cmd => cmd.name() === 'viewer');
      const tagCommand = viewerCommand?.commands.find(cmd => cmd.name() === 'tag');
      const addSubcommand = tagCommand?.commands.find(cmd => cmd.name() === 'add');

      const labelIdsOption = addSubcommand?.options.find(opt => opt.long === '--label-ids');
      expect(labelIdsOption?.short).toBe('-l');
    });

    it('should mark viewer-ids as required', () => {
      registerViewerCommands(program);

      const viewerCommand = program.commands.find(cmd => cmd.name() === 'viewer');
      const tagCommand = viewerCommand?.commands.find(cmd => cmd.name() === 'tag');
      const addSubcommand = tagCommand?.commands.find(cmd => cmd.name() === 'add');

      const viewerIdsOption = addSubcommand?.options.find(opt => opt.long === '--viewer-ids');
      expect(viewerIdsOption?.required).toBe(true);
    });

    it('should mark label-ids as required', () => {
      registerViewerCommands(program);

      const viewerCommand = program.commands.find(cmd => cmd.name() === 'viewer');
      const tagCommand = viewerCommand?.commands.find(cmd => cmd.name() === 'tag');
      const addSubcommand = tagCommand?.commands.find(cmd => cmd.name() === 'add');

      const labelIdsOption = addSubcommand?.options.find(opt => opt.long === '--label-ids');
      expect(labelIdsOption?.required).toBe(true);
    });

    it('should have description for tag add command', () => {
      registerViewerCommands(program);

      const viewerCommand = program.commands.find(cmd => cmd.name() === 'viewer');
      const tagCommand = viewerCommand?.commands.find(cmd => cmd.name() === 'tag');
      const addSubcommand = tagCommand?.commands.find(cmd => cmd.name() === 'add');

      expect(addSubcommand?.description().toLowerCase()).toContain('add');
    });
  });

  describe('12.2-CMD-004: should register viewer tag remove command', () => {
    it('should register tag remove subcommand with required options', () => {
      registerViewerCommands(program);

      const viewerCommand = program.commands.find(cmd => cmd.name() === 'viewer');
      const tagCommand = viewerCommand?.commands.find(cmd => cmd.name() === 'tag');
      const removeSubcommand = tagCommand?.commands.find(cmd => cmd.name() === 'remove');

      expect(removeSubcommand).toBeDefined();

      const options = removeSubcommand?.options || [];
      expect(options.some(opt => opt.long === '--viewer-ids')).toBe(true);
      expect(options.some(opt => opt.long === '--label-ids')).toBe(true);
      expect(options.some(opt => opt.long === '--output')).toBe(true);
    });

    it('should have short form -V for --viewer-ids', () => {
      registerViewerCommands(program);

      const viewerCommand = program.commands.find(cmd => cmd.name() === 'viewer');
      const tagCommand = viewerCommand?.commands.find(cmd => cmd.name() === 'tag');
      const removeSubcommand = tagCommand?.commands.find(cmd => cmd.name() === 'remove');

      const viewerIdsOption = removeSubcommand?.options.find(opt => opt.long === '--viewer-ids');
      expect(viewerIdsOption?.short).toBe('-V');
    });

    it('should have short form -l for --label-ids', () => {
      registerViewerCommands(program);

      const viewerCommand = program.commands.find(cmd => cmd.name() === 'viewer');
      const tagCommand = viewerCommand?.commands.find(cmd => cmd.name() === 'tag');
      const removeSubcommand = tagCommand?.commands.find(cmd => cmd.name() === 'remove');

      const labelIdsOption = removeSubcommand?.options.find(opt => opt.long === '--label-ids');
      expect(labelIdsOption?.short).toBe('-l');
    });

    it('should mark viewer-ids as required', () => {
      registerViewerCommands(program);

      const viewerCommand = program.commands.find(cmd => cmd.name() === 'viewer');
      const tagCommand = viewerCommand?.commands.find(cmd => cmd.name() === 'tag');
      const removeSubcommand = tagCommand?.commands.find(cmd => cmd.name() === 'remove');

      const viewerIdsOption = removeSubcommand?.options.find(opt => opt.long === '--viewer-ids');
      expect(viewerIdsOption?.required).toBe(true);
    });

    it('should mark label-ids as required', () => {
      registerViewerCommands(program);

      const viewerCommand = program.commands.find(cmd => cmd.name() === 'viewer');
      const tagCommand = viewerCommand?.commands.find(cmd => cmd.name() === 'tag');
      const removeSubcommand = tagCommand?.commands.find(cmd => cmd.name() === 'remove');

      const labelIdsOption = removeSubcommand?.options.find(opt => opt.long === '--label-ids');
      expect(labelIdsOption?.required).toBe(true);
    });

    it('should have description for tag remove command', () => {
      registerViewerCommands(program);

      const viewerCommand = program.commands.find(cmd => cmd.name() === 'viewer');
      const tagCommand = viewerCommand?.commands.find(cmd => cmd.name() === 'tag');
      const removeSubcommand = tagCommand?.commands.find(cmd => cmd.name() === 'remove');

      expect(removeSubcommand?.description().toLowerCase()).toContain('remove');
    });
  });

  describe('12.2-CMD-005: should register all tag subcommands', () => {
    it('should register list, add, and remove subcommands under tag', () => {
      registerViewerCommands(program);

      const viewerCommand = program.commands.find(cmd => cmd.name() === 'viewer');
      const tagCommand = viewerCommand?.commands.find(cmd => cmd.name() === 'tag');
      const subcommandNames = tagCommand?.commands.map(cmd => cmd.name()) || [];

      expect(subcommandNames).toContain('list');
      expect(subcommandNames).toContain('add');
      expect(subcommandNames).toContain('remove');
    });
  });

  // ============================================================
  // Source filter options
  // ============================================================
  describe('12.1-CMD-007: source filter options', () => {
    it('should accept source values IMPORT, WX, MOBILE', () => {
      registerViewerCommands(program);

      const command = program.commands.find(cmd => cmd.name() === 'viewer');
      const listSubcommand = command?.commands.find(cmd => cmd.name() === 'list');

      const sourceOption = listSubcommand?.options.find(opt => opt.long === '--source');
      expect(sourceOption).toBeDefined();
    });
  });
});

// ============================================================
// Action execution tests
// ============================================================
describe('action execution', () => {
  let restoreConsole: () => void;
  let restoreExit: () => void;
  let MockViewerHandler: jest.Mock;

  const createTestProgram = (): Command => {
    const program = new Command();
    program.exitOverride();
    return program;
  };

  beforeEach(() => {
    restoreConsole = suppressConsole();
    restoreExit = mockProcessExit();
    MockViewerHandler = require('../handlers/viewer.handler').ViewerHandler;
    MockViewerHandler.mockClear();
    mockAuthSuccess(authAdapter as jest.Mocked<typeof authAdapter>, configManager as jest.Mocked<typeof configManager>);
  });

  afterEach(() => {
    restoreConsole();
    restoreExit();
  });

  describe('get action', () => {
    it('[P0] should call getViewer handler with correct params', async () => {
      const mockHandler = { getViewer: jest.fn().mockResolvedValue(undefined) };
      MockViewerHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerViewerCommands(program);
      await program.parseAsync(['node', 'test', 'viewer', 'get', '-i', 'viewer123']);

      expect(MockViewerHandler).toHaveBeenCalled();
      expect(mockHandler.getViewer).toHaveBeenCalledWith({
        viewerId: 'viewer123',
        output: 'table',
      });
    });

    it('[P1] should call getViewer with json output', async () => {
      const mockHandler = { getViewer: jest.fn().mockResolvedValue(undefined) };
      MockViewerHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerViewerCommands(program);
      await program.parseAsync(['node', 'test', 'viewer', 'get', '-i', 'viewer123', '-o', 'json']);

      expect(mockHandler.getViewer).toHaveBeenCalledWith({
        viewerId: 'viewer123',
        output: 'json',
      });
    });

    it('[P1] should handle API errors in get action', async () => {
      const mockHandler = { getViewer: jest.fn().mockRejectedValue(new Error('Get failed')) };
      MockViewerHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerViewerCommands(program);
      await expect(program.parseAsync(['node', 'test', 'viewer', 'get', '-i', 'viewer123'])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });

  describe('list action', () => {
    it('[P0] should call listViewers handler with correct params', async () => {
      const mockHandler = { listViewers: jest.fn().mockResolvedValue(undefined) };
      MockViewerHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerViewerCommands(program);
      await program.parseAsync(['node', 'test', 'viewer', 'list']);

      expect(MockViewerHandler).toHaveBeenCalled();
      expect(mockHandler.listViewers).toHaveBeenCalledWith({
        source: undefined,
        mobile: undefined,
        email: undefined,
        area: undefined,
        page: undefined,
        size: undefined,
        output: 'table',
      });
    });

    it('[P1] should call listViewers with filter options', async () => {
      const mockHandler = { listViewers: jest.fn().mockResolvedValue(undefined) };
      MockViewerHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerViewerCommands(program);
      await program.parseAsync([
        'node', 'test', 'viewer', 'list',
        '--source', 'IMPORT',
        '--mobile', '13800138000',
        '--email', 'test@example.com',
        '--area', 'Beijing',
        '--page', '1',
        '--size', '20',
        '-o', 'json',
      ]);

      expect(mockHandler.listViewers).toHaveBeenCalledWith({
        source: 'IMPORT',
        mobile: '13800138000',
        email: 'test@example.com',
        area: 'Beijing',
        page: 1,
        size: 20,
        output: 'json',
      });
    });

    it('[P1] should handle API errors in list action', async () => {
      const mockHandler = { listViewers: jest.fn().mockRejectedValue(new Error('List failed')) };
      MockViewerHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerViewerCommands(program);
      await expect(program.parseAsync(['node', 'test', 'viewer', 'list'])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });

  describe('tag list action', () => {
    it('[P0] should call listViewerTags handler with correct params', async () => {
      const mockHandler = { listViewerTags: jest.fn().mockResolvedValue(undefined) };
      MockViewerHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerViewerCommands(program);
      await program.parseAsync(['node', 'test', 'viewer', 'tag', 'list']);

      expect(MockViewerHandler).toHaveBeenCalled();
      expect(mockHandler.listViewerTags).toHaveBeenCalledWith({
        keyword: undefined,
        page: undefined,
        size: undefined,
        output: 'table',
      });
    });

    it('[P1] should call listViewerTags with options', async () => {
      const mockHandler = { listViewerTags: jest.fn().mockResolvedValue(undefined) };
      MockViewerHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerViewerCommands(program);
      await program.parseAsync([
        'node', 'test', 'viewer', 'tag', 'list',
        '-k', 'VIP',
        '--page', '2',
        '--size', '50',
        '-o', 'json',
      ]);

      expect(mockHandler.listViewerTags).toHaveBeenCalledWith({
        keyword: 'VIP',
        page: 2,
        size: 50,
        output: 'json',
      });
    });

    it('[P1] should handle API errors in tag list action', async () => {
      const mockHandler = { listViewerTags: jest.fn().mockRejectedValue(new Error('Tag list failed')) };
      MockViewerHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerViewerCommands(program);
      await expect(program.parseAsync(['node', 'test', 'viewer', 'tag', 'list'])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });

  describe('tag add action', () => {
    it('[P0] should call addViewerTag handler with correct params', async () => {
      const mockHandler = { addViewerTag: jest.fn().mockResolvedValue(undefined) };
      MockViewerHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerViewerCommands(program);
      await program.parseAsync([
        'node', 'test', 'viewer', 'tag', 'add',
        '-V', 'viewer1,viewer2',
        '-l', '1,2',
      ]);

      expect(MockViewerHandler).toHaveBeenCalled();
      expect(mockHandler.addViewerTag).toHaveBeenCalledWith({
        viewerIds: 'viewer1,viewer2',
        labelIds: '1,2',
        force: undefined,
        output: 'table',
      });
    });

    it('[P1] should call addViewerTag with json output', async () => {
      const mockHandler = { addViewerTag: jest.fn().mockResolvedValue(undefined) };
      MockViewerHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerViewerCommands(program);
      await program.parseAsync([
        'node', 'test', 'viewer', 'tag', 'add',
        '-V', 'viewer1',
        '-l', '1',
        '-o', 'json',
      ]);

      expect(mockHandler.addViewerTag).toHaveBeenCalledWith({
        viewerIds: 'viewer1',
        labelIds: '1',
        force: undefined,
        output: 'json',
      });
    });

    it('[P1] should handle API errors in tag add action', async () => {
      const mockHandler = { addViewerTag: jest.fn().mockRejectedValue(new Error('Tag add failed')) };
      MockViewerHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerViewerCommands(program);
      await expect(program.parseAsync([
        'node', 'test', 'viewer', 'tag', 'add',
        '-V', 'viewer1',
        '-l', '1',
      ])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });

  describe('tag remove action', () => {
    it('[P0] should call removeViewerTag handler with correct params', async () => {
      const mockHandler = { removeViewerTag: jest.fn().mockResolvedValue(undefined) };
      MockViewerHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerViewerCommands(program);
      await program.parseAsync([
        'node', 'test', 'viewer', 'tag', 'remove',
        '-V', 'viewer1,viewer2',
        '-l', '1,2',
      ]);

      expect(MockViewerHandler).toHaveBeenCalled();
      expect(mockHandler.removeViewerTag).toHaveBeenCalledWith({
        viewerIds: 'viewer1,viewer2',
        labelIds: '1,2',
        force: undefined,
        output: 'table',
      });
    });

    it('[P1] should call removeViewerTag with json output', async () => {
      const mockHandler = { removeViewerTag: jest.fn().mockResolvedValue(undefined) };
      MockViewerHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerViewerCommands(program);
      await program.parseAsync([
        'node', 'test', 'viewer', 'tag', 'remove',
        '-V', 'viewer1',
        '-l', '1',
        '-o', 'json',
      ]);

      expect(mockHandler.removeViewerTag).toHaveBeenCalledWith({
        viewerIds: 'viewer1',
        labelIds: '1',
        force: undefined,
        output: 'json',
      });
    });

    it('[P1] should handle API errors in tag remove action', async () => {
      const mockHandler = { removeViewerTag: jest.fn().mockRejectedValue(new Error('Tag remove failed')) };
      MockViewerHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerViewerCommands(program);
      await expect(program.parseAsync([
        'node', 'test', 'viewer', 'tag', 'remove',
        '-V', 'viewer1',
        '-l', '1',
      ])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });
});
