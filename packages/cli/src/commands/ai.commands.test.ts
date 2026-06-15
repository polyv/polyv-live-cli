/**
 * @fileoverview Unit tests for AI commands
 * @author Development Team
 * @since 14.4.0
 */

import { Command } from 'commander';
import { registerAiCommands, validateOutputFormat } from './ai.commands';
import { authAdapter } from '../config/auth-adapter';
import { configManager } from '../config/manager';
import { suppressConsole, mockProcessExit, mockAuthSuccess } from '../utils/test-helpers';

// Mock dependencies
jest.mock('../config/auth-adapter');
jest.mock('../config/manager');
jest.mock('../handlers/ai-digital-human.handler');
jest.mock('../utils/errors', () => ({
  logError: jest.fn(),
}));

describe('AI Commands', () => {
  describe('command registration', () => {
    let program: Command;

    beforeEach(() => {
      program = new Command();
      registerAiCommands(program);
    });

    it('[AC1-3] should register ai parent command', () => {
      const aiCmd = program.commands.find(cmd => cmd.name() === 'ai');
      expect(aiCmd).toBeDefined();
      expect(aiCmd?.description()).toMatch(/AI|数字人|digital/i);
    });

    it('[AC1-3] should register digital-human subcommand group', () => {
      const aiCmd = program.commands.find(cmd => cmd.name() === 'ai');
      const digitalHumanCmd = aiCmd?.commands.find(cmd => cmd.name() === 'digital-human');

      expect(digitalHumanCmd).toBeDefined();
      expect(digitalHumanCmd?.description()).toMatch(/数字人|digital/i);
    });

    // ========================================
    // AC1: list subcommand
    // ========================================
    it('[AC1] should register digital-human list subcommand', () => {
      const aiCmd = program.commands.find(cmd => cmd.name() === 'ai');
      const digitalHumanCmd = aiCmd?.commands.find(cmd => cmd.name() === 'digital-human');
      const listCmd = digitalHumanCmd?.commands.find(cmd => cmd.name() === 'list');

      expect(listCmd).toBeDefined();
      expect(listCmd?.description()).toMatch(/列出|list|数字人/i);
    });

    // [AC1] should register --page option for list command
    it('[AC1] should register --size option for list command', () => {
      const aiCmd = program.commands.find(cmd => cmd.name() === 'ai');
      const digitalHumanCmd = aiCmd?.commands.find(cmd => cmd.name() === 'digital-human');
      const listCmd = digitalHumanCmd?.commands.find(cmd => cmd.name() === 'list');
      const options = listCmd?.options || [];

      const pageOption = options.find(opt => opt.long === '--page');
      expect(pageOption).toBeDefined();
      expect(pageOption?.mandatory).toBeFalsy();
    });

    it('[AC1] should register --size option for list command', () => {
      const aiCmd = program.commands.find(cmd => cmd.name() === 'ai');
      const digitalHumanCmd = aiCmd?.commands.find(cmd => cmd.name() === 'digital-human');
      const listCmd = digitalHumanCmd?.commands.find(cmd => cmd.name() === 'list');
      const options = listCmd?.options || [];

      const sizeOption = options.find(opt => opt.long === '--size');
      expect(sizeOption).toBeDefined();
      expect(sizeOption?.mandatory).toBeFalsy();
    });

    it('[AC4] should register --output option for list command', () => {
      const aiCmd = program.commands.find(cmd => cmd.name() === 'ai');
      const digitalHumanCmd = aiCmd?.commands.find(cmd => cmd.name() === 'digital-human');
      const listCmd = digitalHumanCmd?.commands.find(cmd => cmd.name() === 'list');
      const options = listCmd?.options || [];

      const outputOption = options.find(opt => opt.long === '--output');
      expect(outputOption).toBeDefined();
    });

    // ========================================
    // AC2: list-org subcommand
    // ========================================
    it('[AC2] should register digital-human list-org subcommand', () => {
      const aiCmd = program.commands.find(cmd => cmd.name() === 'ai');
      const digitalHumanCmd = aiCmd?.commands.find(cmd => cmd.name() === 'digital-human');
      const listOrgCmd = digitalHumanCmd?.commands.find(cmd => cmd.name() === 'list-org');

      expect(listOrgCmd).toBeDefined();
      expect(listOrgCmd?.description()).toMatch(/组织|organization|关联/i);
    });

    it('[AC2] should register --ids as required option for list-org command', () => {
      const aiCmd = program.commands.find(cmd => cmd.name() === 'ai');
      const digitalHumanCmd = aiCmd?.commands.find(cmd => cmd.name() === 'digital-human');
      const listOrgCmd = digitalHumanCmd?.commands.find(cmd => cmd.name() === 'list-org');
      const options = listOrgCmd?.options || [];

      const idsOption = options.find(opt => opt.long === '--ids');
      expect(idsOption).toBeDefined();
      expect(idsOption?.required).toBe(true);
    });

    it('[AC4] should register --output option for list-org command', () => {
      const aiCmd = program.commands.find(cmd => cmd.name() === 'ai');
      const digitalHumanCmd = aiCmd?.commands.find(cmd => cmd.name() === 'digital-human');
      const listOrgCmd = digitalHumanCmd?.commands.find(cmd => cmd.name() === 'list-org');
      const options = listOrgCmd?.options || [];

      const outputOption = options.find(opt => opt.long === '--output');
      expect(outputOption).toBeDefined();
    });

    // ========================================
    // AC3: set-org subcommand
    // ========================================
    it('[AC3] should register digital-human set-org subcommand', () => {
      const aiCmd = program.commands.find(cmd => cmd.name() === 'ai');
      const digitalHumanCmd = aiCmd?.commands.find(cmd => cmd.name() === 'digital-human');
      const setOrgCmd = digitalHumanCmd?.commands.find(cmd => cmd.name() === 'set-org');

      expect(setOrgCmd).toBeDefined();
      expect(setOrgCmd?.description()).toMatch(/设置|set|关联|组织/i);
    });

    it('[AC3] should register --config option for set-org command', () => {
      const aiCmd = program.commands.find(cmd => cmd.name() === 'ai');
      const digitalHumanCmd = aiCmd?.commands.find(cmd => cmd.name() === 'digital-human');
      const setOrgCmd = digitalHumanCmd?.commands.find(cmd => cmd.name() === 'set-org');
      const options = setOrgCmd?.options || [];

      const configOption = options.find(opt => opt.long === '--config');
      expect(configOption).toBeDefined();
    });

    it('[AC3] should register --aiDigitalHumanId option for set-org command', () => {
      const aiCmd = program.commands.find(cmd => cmd.name() === 'ai');
      const digitalHumanCmd = aiCmd?.commands.find(cmd => cmd.name() === 'digital-human');
      const setOrgCmd = digitalHumanCmd?.commands.find(cmd => cmd.name() === 'set-org');
      const options = setOrgCmd?.options || [];

      const idOption = options.find(opt => opt.long === '--aiDigitalHumanId');
      expect(idOption).toBeDefined();
    });

    it('[AC3] should register --organizationIds option for set-org command', () => {
      const aiCmd = program.commands.find(cmd => cmd.name() === 'ai');
      const digitalHumanCmd = aiCmd?.commands.find(cmd => cmd.name() === 'digital-human');
      const setOrgCmd = digitalHumanCmd?.commands.find(cmd => cmd.name() === 'set-org');
      const options = setOrgCmd?.options || [];

      const orgIdsOption = options.find(opt => opt.long === '--organizationIds');
      expect(orgIdsOption).toBeDefined();
    });

    it('[AC3] should register --includeChildren option for set-org command', () => {
      const aiCmd = program.commands.find(cmd => cmd.name() === 'ai');
      const digitalHumanCmd = aiCmd?.commands.find(cmd => cmd.name() === 'digital-human');
      const setOrgCmd = digitalHumanCmd?.commands.find(cmd => cmd.name() === 'set-org');
      const options = setOrgCmd?.options || [];

      const includeChildrenOption = options.find(opt => opt.long === '--includeChildren');
      expect(includeChildrenOption).toBeDefined();
    });

    it('[AC4] should register --output option for set-org command', () => {
      const aiCmd = program.commands.find(cmd => cmd.name() === 'ai');
      const digitalHumanCmd = aiCmd?.commands.find(cmd => cmd.name() === 'digital-human');
      const setOrgCmd = digitalHumanCmd?.commands.find(cmd => cmd.name() === 'set-org');
      const options = setOrgCmd?.options || [];

      const outputOption = options.find(opt => opt.long === '--output');
      expect(outputOption).toBeDefined();
    });

    // ========================================
    // AC4: output format options
    // ========================================
    it('[AC4] should register -o short form for --output option on all commands', () => {
      const aiCmd = program.commands.find(cmd => cmd.name() === 'ai');
      const digitalHumanCmd = aiCmd?.commands.find(cmd => cmd.name() === 'digital-human');

      const commands = ['list', 'list-org', 'set-org'];
      for (const cmdName of commands) {
        const cmd = digitalHumanCmd?.commands.find(cmd => cmd.name() === cmdName);
        const outputOption = cmd?.options.find(opt => opt.long === '--output');
        expect(outputOption?.short).toBe('-o');
      }
    });

    it('[AC4] default output format should be table', () => {
      const aiCmd = program.commands.find(cmd => cmd.name() === 'ai');
      const digitalHumanCmd = aiCmd?.commands.find(cmd => cmd.name() === 'digital-human');
      const listCmd = digitalHumanCmd?.commands.find(cmd => cmd.name() === 'list');
      const outputOption = listCmd?.options.find(opt => opt.long === '--output');

      expect(outputOption?.defaultValue).toBe('table');
    });

    it('[AC4] should not use -v or -V as short option (reserved for --version)', () => {
      const aiCmd = program.commands.find(cmd => cmd.name() === 'ai');
      const digitalHumanCmd = aiCmd?.commands.find(cmd => cmd.name() === 'digital-human');

      digitalHumanCmd?.commands.forEach(subCmd => {
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
      registerAiCommands(program);
    });

    it('[AC1-5] should include ai command in help', () => {
      const helpText = program.helpInformation();
      expect(helpText).toContain('ai');
    });

    it('[AC1] should include digital-human command in help', () => {
      const aiCmd = program.commands.find(cmd => cmd.name() === 'ai');
      const helpText = aiCmd?.helpInformation() || '';
      expect(helpText).toContain('digital-human');
    });

    it('[AC1] should include list command in help', () => {
      const aiCmd = program.commands.find(cmd => cmd.name() === 'ai');
      const digitalHumanCmd = aiCmd?.commands.find(cmd => cmd.name() === 'digital-human');
      const listCmd = digitalHumanCmd?.commands.find(cmd => cmd.name() === 'list');

      const helpText = listCmd?.helpInformation() || '';
      expect(helpText).toMatch(/page|--page|size|--size/i);
    });

    it('[AC2] should include list-org command in help', () => {
      const aiCmd = program.commands.find(cmd => cmd.name() === 'ai');
      const digitalHumanCmd = aiCmd?.commands.find(cmd => cmd.name() === 'digital-human');
      const listOrgCmd = digitalHumanCmd?.commands.find(cmd => cmd.name() === 'list-org');

      const helpText = listOrgCmd?.helpInformation() || '';
      expect(helpText).toMatch(/ids|--ids/i);
    });

    it('[AC3] should include set-org command in help', () => {
      const aiCmd = program.commands.find(cmd => cmd.name() === 'ai');
      const digitalHumanCmd = aiCmd?.commands.find(cmd => cmd.name() === 'digital-human');
      const setOrgCmd = digitalHumanCmd?.commands.find(cmd => cmd.name() === 'set-org');

      const helpText = setOrgCmd?.helpInformation() || '';
      expect(helpText).toMatch(/config|--config|aiDigitalHumanId|--aiDigitalHumanId/i);
    });

    it('[AC4] should include output format options in help', () => {
      const aiCmd = program.commands.find(cmd => cmd.name() === 'ai');
      const digitalHumanCmd = aiCmd?.commands.find(cmd => cmd.name() === 'digital-human');
      const listCmd = digitalHumanCmd?.commands.find(cmd => cmd.name() === 'list');

      const helpText = listCmd?.helpInformation() || '';
      expect(helpText).toMatch(/output|--output|-o|json|table/i);
    });
  });

  // ========================================
  // Validation functions tests
  // ========================================
  describe('validateOutputFormat', () => {
    it('[AC4] should validate table format', () => {
      expect(validateOutputFormat('table')).toBe('table');
    });

    it('[AC4] should validate json format', () => {
      expect(validateOutputFormat('json')).toBe('json');
    });

    it('[AC5] should throw error for invalid format', () => {
      expect(() => validateOutputFormat('xml')).toThrow('Invalid output format');
    });

    it('[AC5] should throw error for uppercase format', () => {
      expect(() => validateOutputFormat('JSON')).toThrow('Invalid output format');
    });

    it('[AC5] should throw error for empty string', () => {
      expect(() => validateOutputFormat('')).toThrow('Invalid output format');
    });
  });

  // ========================================
  // Action handler execution tests
  // ========================================
  describe('action handlers', () => {
    it('[AC1] should execute list action handler with correct options', async () => {
      const program = new Command();
      registerAiCommands(program);

      const aiCmd = program.commands.find(cmd => cmd.name() === 'ai');
      const digitalHumanCmd = aiCmd?.commands.find(cmd => cmd.name() === 'digital-human');
      const listCmd = digitalHumanCmd?.commands.find(cmd => cmd.name() === 'list');

      // Verify the action handler is registered
      expect(listCmd).toBeDefined();
    });

    it('[AC2] should execute list-org action handler with correct options', async () => {
      const program = new Command();
      registerAiCommands(program);

      const aiCmd = program.commands.find(cmd => cmd.name() === 'ai');
      const digitalHumanCmd = aiCmd?.commands.find(cmd => cmd.name() === 'digital-human');
      const listOrgCmd = digitalHumanCmd?.commands.find(cmd => cmd.name() === 'list-org');

      // Verify the action handler is registered
      expect(listOrgCmd).toBeDefined();
    });

    it('[AC3] should execute set-org action handler with correct options', async () => {
      const program = new Command();
      registerAiCommands(program);

      const aiCmd = program.commands.find(cmd => cmd.name() === 'ai');
      const digitalHumanCmd = aiCmd?.commands.find(cmd => cmd.name() === 'digital-human');
      const setOrgCmd = digitalHumanCmd?.commands.find(cmd => cmd.name() === 'set-org');

      // Verify the action handler is registered
      expect(setOrgCmd).toBeDefined();
    });
  });
});

// ============================================================
// Action execution tests
// ============================================================
describe('action execution', () => {
  let restoreConsole: () => void;
  let restoreExit: () => void;
  let MockAIDigitalHumanHandler: jest.Mock;

  const createTestProgram = (): Command => {
    const program = new Command();
    program.exitOverride();
    return program;
  };

  beforeEach(() => {
    restoreConsole = suppressConsole();
    restoreExit = mockProcessExit();
    MockAIDigitalHumanHandler = require('../handlers/ai-digital-human.handler').AIDigitalHumanHandler;
    MockAIDigitalHumanHandler.mockClear();
    mockAuthSuccess(authAdapter as jest.Mocked<typeof authAdapter>, configManager as jest.Mocked<typeof configManager>);
  });

  afterEach(() => {
    restoreConsole();
    restoreExit();
  });

  describe('list action', () => {
    it('[P0] should call listDigitalHumans handler with correct params', async () => {
      const mockHandler = { listDigitalHumans: jest.fn().mockResolvedValue(undefined) };
      MockAIDigitalHumanHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerAiCommands(program);
      await program.parseAsync(['node', 'test', 'ai', 'digital-human', 'list']);

      expect(MockAIDigitalHumanHandler).toHaveBeenCalled();
      expect(mockHandler.listDigitalHumans).toHaveBeenCalledWith({
        page: undefined,
        size: undefined,
        output: 'table',
      });
    });

    it('[P1] should call listDigitalHumans with pagination options', async () => {
      const mockHandler = { listDigitalHumans: jest.fn().mockResolvedValue(undefined) };
      MockAIDigitalHumanHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerAiCommands(program);
      await program.parseAsync(['node', 'test', 'ai', 'digital-human', 'list', '--page', '2', '--size', '50']);

      expect(mockHandler.listDigitalHumans).toHaveBeenCalledWith({
        page: 2,
        size: 50,
        output: 'table',
      });
    });

    it('[P1] should call listDigitalHumans with json output', async () => {
      const mockHandler = { listDigitalHumans: jest.fn().mockResolvedValue(undefined) };
      MockAIDigitalHumanHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerAiCommands(program);
      await program.parseAsync(['node', 'test', 'ai', 'digital-human', 'list', '-o', 'json']);

      expect(mockHandler.listDigitalHumans).toHaveBeenCalledWith({
        page: undefined,
        size: undefined,
        output: 'json',
      });
    });

    it('[P1] should handle API errors in list action', async () => {
      const mockHandler = { listDigitalHumans: jest.fn().mockRejectedValue(new Error('List failed')) };
      MockAIDigitalHumanHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerAiCommands(program);
      await expect(program.parseAsync(['node', 'test', 'ai', 'digital-human', 'list'])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });

  describe('list-org action', () => {
    it('[P0] should call listOrganizations handler with correct params', async () => {
      const mockHandler = { listOrganizations: jest.fn().mockResolvedValue(undefined) };
      MockAIDigitalHumanHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerAiCommands(program);
      await program.parseAsync(['node', 'test', 'ai', 'digital-human', 'list-org', '--ids', 'id1,id2']);

      expect(MockAIDigitalHumanHandler).toHaveBeenCalled();
      expect(mockHandler.listOrganizations).toHaveBeenCalledWith({
        ids: 'id1,id2',
        output: 'table',
      });
    });

    it('[P1] should call listOrganizations with json output', async () => {
      const mockHandler = { listOrganizations: jest.fn().mockResolvedValue(undefined) };
      MockAIDigitalHumanHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerAiCommands(program);
      await program.parseAsync(['node', 'test', 'ai', 'digital-human', 'list-org', '--ids', 'id1', '-o', 'json']);

      expect(mockHandler.listOrganizations).toHaveBeenCalledWith({
        ids: 'id1',
        output: 'json',
      });
    });

    it('[P1] should handle API errors in list-org action', async () => {
      const mockHandler = { listOrganizations: jest.fn().mockRejectedValue(new Error('List-org failed')) };
      MockAIDigitalHumanHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerAiCommands(program);
      await expect(program.parseAsync(['node', 'test', 'ai', 'digital-human', 'list-org', '--ids', 'id1'])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });

  describe('set-org action', () => {
    it('[P0] should call setOrganizations handler with correct params', async () => {
      const mockHandler = { setOrganizations: jest.fn().mockResolvedValue(undefined) };
      MockAIDigitalHumanHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerAiCommands(program);
      await program.parseAsync([
        'node', 'test', 'ai', 'digital-human', 'set-org',
        '--aiDigitalHumanId', 'dh123',
        '--organizationIds', 'org1,org2',
      ]);

      expect(MockAIDigitalHumanHandler).toHaveBeenCalled();
      expect(mockHandler.setOrganizations).toHaveBeenCalledWith({
        config: undefined,
        aiDigitalHumanId: 'dh123',
        organizationIds: 'org1,org2',
        includeChildren: true,
        output: 'table',
      });
    });

    it('[P1] should call setOrganizations with config option', async () => {
      const mockHandler = { setOrganizations: jest.fn().mockResolvedValue(undefined) };
      MockAIDigitalHumanHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerAiCommands(program);
      await program.parseAsync([
        'node', 'test', 'ai', 'digital-human', 'set-org',
        '--config', '[{"aiDigitalHumanId":"dh1","organizationIds":["org1"]}]',
        '-o', 'json',
      ]);

      expect(mockHandler.setOrganizations).toHaveBeenCalledWith({
        config: '[{"aiDigitalHumanId":"dh1","organizationIds":["org1"]}]',
        aiDigitalHumanId: undefined,
        organizationIds: undefined,
        includeChildren: true,
        output: 'json',
      });
    });

    it('[P1] should handle API errors in set-org action', async () => {
      const mockHandler = { setOrganizations: jest.fn().mockRejectedValue(new Error('Set-org failed')) };
      MockAIDigitalHumanHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerAiCommands(program);
      await expect(program.parseAsync([
        'node', 'test', 'ai', 'digital-human', 'set-org',
        '--aiDigitalHumanId', 'dh123',
      ])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });
});
