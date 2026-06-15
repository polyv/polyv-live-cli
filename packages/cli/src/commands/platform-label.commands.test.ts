/**
 * @fileoverview Tests for platform label command definitions
 * @author Development Team
 * @since 13.4.0
 */

import { Command } from 'commander';
import { registerPlatformLabelCommands, validateOutputFormat, loadAuthAndServiceConfig } from './platform-label.commands';
import { authAdapter } from '../config/auth-adapter';
import { configManager } from '../config/manager';
import { suppressConsole, mockProcessExit, mockAuthSuccess } from '../utils/test-helpers';

// Mock dependencies
jest.mock('../config/auth-adapter');
jest.mock('../config/manager');
jest.mock('../handlers/platform-label.handler');
jest.mock('../utils/errors', () => ({
  logError: jest.fn(),
}));

describe('Platform Label Commands', () => {
  let program: Command;
  let platformCmd: Command;
  let platformLabelCmd: Command;

  beforeEach(() => {
    // Create new program instance
    program = new Command();
    program.exitOverride(); // Prevent process.exit during tests

    // Create platform command first (required parent)
    platformCmd = program.command('platform').description('Platform management commands');

    // Register label commands under platform
    registerPlatformLabelCommands(program);

    // Get label command group from platform
    platformLabelCmd = platformCmd.commands.find((cmd) => cmd.name() === 'label') as Command;
  });

  describe('command structure', () => {
    it('should register label command under platform', () => {
      expect(platformLabelCmd).toBeDefined();
      expect(platformLabelCmd.name()).toBe('label');
      expect(platformLabelCmd.description()).toContain('标签管理');
    });

    it('should register list subcommand', () => {
      const listCmd = platformLabelCmd.commands.find((cmd) => cmd.name() === 'list');
      expect(listCmd).toBeDefined();
      expect(listCmd?.description()).toContain('获取标签列表');
    });

    it('should register create subcommand', () => {
      const createCmd = platformLabelCmd.commands.find((cmd) => cmd.name() === 'create');
      expect(createCmd).toBeDefined();
      expect(createCmd?.description()).toContain('创建标签');
    });

    it('should register update subcommand', () => {
      const updateCmd = platformLabelCmd.commands.find((cmd) => cmd.name() === 'update');
      expect(updateCmd).toBeDefined();
      expect(updateCmd?.description()).toContain('更新标签');
    });

    it('should register delete subcommand', () => {
      const deleteCmd = platformLabelCmd.commands.find((cmd) => cmd.name() === 'delete');
      expect(deleteCmd).toBeDefined();
      expect(deleteCmd?.description()).toContain('删除标签');
    });
  });

  describe('platform label list', () => {
    it('should have -o short form for --output', () => {
      const listCmd = platformLabelCmd.commands.find((cmd) => cmd.name() === 'list');
      const outputOption = listCmd?.options.find((opt) => opt.long === '--output');
      expect(outputOption?.short).toBe('-o');
    });

    it('should default output to table', () => {
      const listCmd = platformLabelCmd.commands.find((cmd) => cmd.name() === 'list');
      const outputOption = listCmd?.options.find((opt) => opt.long === '--output');
      expect(outputOption?.defaultValue).toBe('table');
    });

    it('should validate output format', () => {
      const listCmd = platformLabelCmd.commands.find((cmd) => cmd.name() === 'list');
      expect(listCmd?.options.find((opt) => opt.long === '--output')).toBeDefined();
    });
  });

  describe('platform label create', () => {
    it('should have --name option as required', () => {
      const createCmd = platformLabelCmd.commands.find((cmd) => cmd.name() === 'create');
      const nameOption = createCmd?.options.find((opt) => opt.long === '--name');
      expect(nameOption?.required).toBe(true);
    });

    it('should have -o short form for --output', () => {
      const createCmd = platformLabelCmd.commands.find((cmd) => cmd.name() === 'create');
      const outputOption = createCmd?.options.find((opt) => opt.long === '--output');
      expect(outputOption?.short).toBe('-o');
    });

    it('should default output to table', () => {
      const createCmd = platformLabelCmd.commands.find((cmd) => cmd.name() === 'create');
      const outputOption = createCmd?.options.find((opt) => opt.long === '--output');
      expect(outputOption?.defaultValue).toBe('table');
    });
  });

  describe('platform label update', () => {
    it('should have --id option as required', () => {
      const updateCmd = platformLabelCmd.commands.find((cmd) => cmd.name() === 'update');
      const idOption = updateCmd?.options.find((opt) => opt.long === '--id');
      expect(idOption?.required).toBe(true);
    });

    it('should have --name option as required', () => {
      const updateCmd = platformLabelCmd.commands.find((cmd) => cmd.name() === 'update');
      const nameOption = updateCmd?.options.find((opt) => opt.long === '--name');
      expect(nameOption?.required).toBe(true);
    });

    it('should have -o short form for --output', () => {
      const updateCmd = platformLabelCmd.commands.find((cmd) => cmd.name() === 'update');
      const outputOption = updateCmd?.options.find((opt) => opt.long === '--output');
      expect(outputOption?.short).toBe('-o');
    });

    it('should default output to table', () => {
      const updateCmd = platformLabelCmd.commands.find((cmd) => cmd.name() === 'update');
      const outputOption = updateCmd?.options.find((opt) => opt.long === '--output');
      expect(outputOption?.defaultValue).toBe('table');
    });
  });

  describe('platform label delete', () => {
    it('should have --id option as required', () => {
      const deleteCmd = platformLabelCmd.commands.find((cmd) => cmd.name() === 'delete');
      const idOption = deleteCmd?.options.find((opt) => opt.long === '--id');
      expect(idOption?.required).toBe(true);
    });

    it('should have -o short form for --output', () => {
      const deleteCmd = platformLabelCmd.commands.find((cmd) => cmd.name() === 'delete');
      const outputOption = deleteCmd?.options.find((opt) => opt.long === '--output');
      expect(outputOption?.short).toBe('-o');
    });

    it('should default output to table', () => {
      const deleteCmd = platformLabelCmd.commands.find((cmd) => cmd.name() === 'delete');
      const outputOption = deleteCmd?.options.find((opt) => opt.long === '--output');
      expect(outputOption?.defaultValue).toBe('table');
    });
  });

  describe('help text', () => {
    it('should include description in list command help', () => {
      const listCmd = platformLabelCmd.commands.find((cmd) => cmd.name() === 'list');
      const helpText = listCmd?.helpInformation();
      expect(helpText).toContain('List viewer labels');
    });

    it('should include description in create command help', () => {
      const createCmd = platformLabelCmd.commands.find((cmd) => cmd.name() === 'create');
      const helpText = createCmd?.helpInformation();
      expect(helpText).toContain('Create a viewer label');
    });

    it('should include description in update command help', () => {
      const updateCmd = platformLabelCmd.commands.find((cmd) => cmd.name() === 'update');
      const helpText = updateCmd?.helpInformation();
      expect(helpText).toContain('Update a viewer label');
    });

    it('should include description in delete command help', () => {
      const deleteCmd = platformLabelCmd.commands.find((cmd) => cmd.name() === 'delete');
      const helpText = deleteCmd?.helpInformation();
      expect(helpText).toContain('Delete a viewer label');
    });
  });
});

describe('validateOutputFormat', () => {
  it('should return "table" for valid table format', () => {
    expect(validateOutputFormat('table')).toBe('table');
  });

  it('should return "json" for valid json format', () => {
    expect(validateOutputFormat('json')).toBe('json');
  });

  it('should throw error for invalid format', () => {
    expect(() => validateOutputFormat('xml')).toThrow('Invalid output format. Must be "table" or "json"');
  });

  it('should throw error for invalid csv format', () => {
    expect(() => validateOutputFormat('csv')).toThrow('Invalid output format. Must be "table" or "json"');
  });
});

describe('loadAuthAndServiceConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw error when auth is not configured', async () => {
    (authAdapter.tryGetAuthConfig as jest.Mock).mockReturnValue(null);
    (authAdapter.getStatusMessage as jest.Mock).mockReturnValue('No auth configured');

    await expect(loadAuthAndServiceConfig({})).rejects.toThrow('No auth configured');
  });

  it('should return auth and service config when auth is valid', async () => {
    mockAuthSuccess(authAdapter as jest.Mocked<typeof authAdapter>, configManager as jest.Mocked<typeof configManager>);

    const result = await loadAuthAndServiceConfig({});

    expect(result.authConfig).toEqual({
      appId: 'test-app-id',
      appSecret: 'test-app-secret',
      userId: 'test-user-id',
    });
    expect(result.serviceConfig.baseUrl).toBe('https://api.polyv.net');
    expect(result.serviceConfig.timeout).toBe(30000);
    expect(result.isVerbose).toBe(false);
  });

  it('should use default config when config loading fails with incomplete auth error', async () => {
    (authAdapter.tryGetAuthConfig as jest.Mock).mockReturnValue({
      config: { appId: 'test', appSecret: 'secret', userId: 'user' },
      source: 'test',
    });
    (configManager.load as jest.Mock).mockRejectedValue(new Error('Auth configuration is incomplete'));

    const result = await loadAuthAndServiceConfig({});

    expect(result.serviceConfig.baseUrl).toBe('https://api.polyv.net');
    expect(result.serviceConfig.timeout).toBe(30000);
  });

  it('should rethrow non-auth config errors', async () => {
    (authAdapter.tryGetAuthConfig as jest.Mock).mockReturnValue({
      config: { appId: 'test', appSecret: 'secret', userId: 'user' },
      source: 'test',
    });
    (configManager.load as jest.Mock).mockRejectedValue(new Error('Network error'));

    await expect(loadAuthAndServiceConfig({})).rejects.toThrow('Network error');
  });

  it('should set isVerbose to true when verbose option is set', async () => {
    mockAuthSuccess(authAdapter as jest.Mocked<typeof authAdapter>, configManager as jest.Mocked<typeof configManager>);

    const result = await loadAuthAndServiceConfig({ verbose: true });

    expect(result.isVerbose).toBe(true);
  });

  it('should log verbose info when verbose is true', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    (authAdapter.tryGetAuthConfig as jest.Mock).mockReturnValue({
      config: { appId: 'test', appSecret: 'secret', userId: 'user' },
      source: 'env',
      accountName: 'test-account',
    });
    (configManager.load as jest.Mock).mockResolvedValue({
      config: { baseUrl: 'https://api.polyv.net', timeout: 30000, debug: false },
    });

    await loadAuthAndServiceConfig({ verbose: true });

    expect(consoleSpy).toHaveBeenCalledWith('🔐 Authentication Source: env');
    expect(consoleSpy).toHaveBeenCalledWith('👤 Account: test-account');

    consoleSpy.mockRestore();
  });
});

describe('action execution', () => {
  let restoreConsole: () => void;
  let restoreExit: () => void;
  let MockPlatformLabelHandler: jest.Mock;

  const createTestProgram = (): Command => {
    const program = new Command();
    program.exitOverride();
    program.command('platform').description('Platform management commands');
    return program;
  };

  beforeEach(() => {
    restoreConsole = suppressConsole();
    restoreExit = mockProcessExit();
    MockPlatformLabelHandler = require('../handlers/platform-label.handler').PlatformLabelHandler;
    MockPlatformLabelHandler.mockClear();
    mockAuthSuccess(authAdapter as jest.Mocked<typeof authAdapter>, configManager as jest.Mocked<typeof configManager>);
  });

  afterEach(() => {
    restoreConsole();
    restoreExit();
  });

  describe('list action', () => {
    it('[P0] should call listLabels handler with correct params', async () => {
      const mockHandler = { listLabels: jest.fn().mockResolvedValue(undefined) };
      MockPlatformLabelHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerPlatformLabelCommands(program);
      await program.parseAsync(['node', 'test', 'platform', 'label', 'list']);

      expect(MockPlatformLabelHandler).toHaveBeenCalled();
      expect(mockHandler.listLabels).toHaveBeenCalledWith({ output: 'table' });
    });

    it('[P1] should call listLabels with json output', async () => {
      const mockHandler = { listLabels: jest.fn().mockResolvedValue(undefined) };
      MockPlatformLabelHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerPlatformLabelCommands(program);
      await program.parseAsync(['node', 'test', 'platform', 'label', 'list', '-o', 'json']);

      expect(mockHandler.listLabels).toHaveBeenCalledWith({ output: 'json' });
    });

    it('[P1] should handle API errors in list action', async () => {
      const mockHandler = { listLabels: jest.fn().mockRejectedValue(new Error('API error')) };
      MockPlatformLabelHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerPlatformLabelCommands(program);
      await expect(program.parseAsync(['node', 'test', 'platform', 'label', 'list'])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });

  describe('create action', () => {
    it('[P0] should call createLabel handler with correct params', async () => {
      const mockHandler = { createLabel: jest.fn().mockResolvedValue(undefined) };
      MockPlatformLabelHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerPlatformLabelCommands(program);
      await program.parseAsync(['node', 'test', 'platform', 'label', 'create', '--name', 'VIP用户']);

      expect(MockPlatformLabelHandler).toHaveBeenCalled();
      expect(mockHandler.createLabel).toHaveBeenCalledWith({
        labelName: 'VIP用户',
        output: 'table',
      });
    });

    it('[P1] should call createLabel with json output', async () => {
      const mockHandler = { createLabel: jest.fn().mockResolvedValue(undefined) };
      MockPlatformLabelHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerPlatformLabelCommands(program);
      await program.parseAsync(['node', 'test', 'platform', 'label', 'create', '--name', 'VIP', '-o', 'json']);

      expect(mockHandler.createLabel).toHaveBeenCalledWith({
        labelName: 'VIP',
        output: 'json',
      });
    });

    it('[P1] should handle API errors in create action', async () => {
      const mockHandler = { createLabel: jest.fn().mockRejectedValue(new Error('Create failed')) };
      MockPlatformLabelHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerPlatformLabelCommands(program);
      await expect(program.parseAsync(['node', 'test', 'platform', 'label', 'create', '--name', 'VIP'])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });

  describe('update action', () => {
    it('[P0] should call updateLabel handler with correct params', async () => {
      const mockHandler = { updateLabel: jest.fn().mockResolvedValue(undefined) };
      MockPlatformLabelHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerPlatformLabelCommands(program);
      await program.parseAsync(['node', 'test', 'platform', 'label', 'update', '--id', '1', '--name', 'VIP会员']);

      expect(MockPlatformLabelHandler).toHaveBeenCalled();
      expect(mockHandler.updateLabel).toHaveBeenCalledWith({
        labelId: 1,
        labelName: 'VIP会员',
        output: 'table',
      });
    });

    it('[P1] should call updateLabel with json output', async () => {
      const mockHandler = { updateLabel: jest.fn().mockResolvedValue(undefined) };
      MockPlatformLabelHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerPlatformLabelCommands(program);
      await program.parseAsync(['node', 'test', 'platform', 'label', 'update', '--id', '2', '--name', 'New', '-o', 'json']);

      expect(mockHandler.updateLabel).toHaveBeenCalledWith({
        labelId: 2,
        labelName: 'New',
        output: 'json',
      });
    });

    it('[P1] should handle API errors in update action', async () => {
      const mockHandler = { updateLabel: jest.fn().mockRejectedValue(new Error('Update failed')) };
      MockPlatformLabelHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerPlatformLabelCommands(program);
      await expect(program.parseAsync(['node', 'test', 'platform', 'label', 'update', '--id', '1', '--name', 'VIP'])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });

  describe('delete action', () => {
    it('[P0] should call deleteLabel handler with correct params', async () => {
      const mockHandler = { deleteLabel: jest.fn().mockResolvedValue(undefined) };
      MockPlatformLabelHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerPlatformLabelCommands(program);
      await program.parseAsync(['node', 'test', 'platform', 'label', 'delete', '--id', '1']);

      expect(MockPlatformLabelHandler).toHaveBeenCalled();
      expect(mockHandler.deleteLabel).toHaveBeenCalledWith({
        labelId: 1,
        output: 'table',
      });
    });

    it('[P1] should call deleteLabel with json output', async () => {
      const mockHandler = { deleteLabel: jest.fn().mockResolvedValue(undefined) };
      MockPlatformLabelHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerPlatformLabelCommands(program);
      await program.parseAsync(['node', 'test', 'platform', 'label', 'delete', '--id', '2', '-o', 'json']);

      expect(mockHandler.deleteLabel).toHaveBeenCalledWith({
        labelId: 2,
        output: 'json',
      });
    });

    it('[P1] should handle API errors in delete action', async () => {
      const mockHandler = { deleteLabel: jest.fn().mockRejectedValue(new Error('Delete failed')) };
      MockPlatformLabelHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerPlatformLabelCommands(program);
      await expect(program.parseAsync(['node', 'test', 'platform', 'label', 'delete', '--id', '1'])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });

  describe('platform command validation', () => {
    it('[P1] should throw error when platform command not found', () => {
      const program = new Command();
      program.exitOverride();

      expect(() => {
        registerPlatformLabelCommands(program);
      }).toThrow('Platform command not found');
    });
  });
});
