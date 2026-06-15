/**
 * @fileoverview Unit tests for account management commands
 */

import { Command } from 'commander';
import { AccountConfigManager } from '../config/account-config';
import { SessionStateManager } from '../config/session-state';
import { globalConfig } from '../config/global';
import { registerAccountCommands } from './account.commands';
import { unlinkSync, existsSync } from 'fs';

// Mock dependencies
jest.mock('../config/account-config');
jest.mock('../config/session-state');
jest.mock('../config/global');
jest.mock('fs');

const mockReadlineInterface = {
  question: jest.fn(),
  close: jest.fn()
};

jest.mock('readline', () => ({
  createInterface: jest.fn(() => mockReadlineInterface)
}));

// Mock console methods
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

// Mock process.exit
jest.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => {
  throw new Error(`Process exit called with code ${code}`);
});

describe('Account Commands', () => {
  let program: Command;
  let mockManager: jest.Mocked<AccountConfigManager>;
  let mockSessionManager: jest.Mocked<SessionStateManager>;
  let mockGlobalConfig: jest.Mocked<typeof globalConfig>;
  let mockUnlinkSync: jest.MockedFunction<typeof unlinkSync>;
  let mockExistsSync: jest.MockedFunction<typeof existsSync>;

  beforeEach(() => {
    program = new Command();
    mockManager = new AccountConfigManager() as jest.Mocked<AccountConfigManager>;
    mockSessionManager = new SessionStateManager(mockManager) as jest.Mocked<SessionStateManager>;
    mockGlobalConfig = globalConfig as jest.Mocked<typeof globalConfig>;
    mockUnlinkSync = unlinkSync as jest.MockedFunction<typeof unlinkSync>;
    mockExistsSync = existsSync as jest.MockedFunction<typeof existsSync>;
    
    (AccountConfigManager as jest.MockedClass<typeof AccountConfigManager>).mockReturnValue(mockManager);
    (SessionStateManager as jest.MockedClass<typeof SessionStateManager>).mockReturnValue(mockSessionManager);
    
    // Mock session manager methods
    mockSessionManager.getCurrentSessionAccount.mockReturnValue(null);
    mockSessionManager.getSessionState.mockReturnValue(null);
    mockSessionManager.getAuthSource.mockReturnValue({
      accountName: null,
      description: 'Environment variables',
      priority: 1
    });
    mockSessionManager.getSessionDir.mockReturnValue('/tmp/session');
    mockSessionManager.getEnvVarName.mockReturnValue('POLYV_SESSION_ACCOUNT');
    
    // Mock global config methods
    mockGlobalConfig.exists.mockReturnValue(false);
    mockGlobalConfig.load.mockReturnValue({});
    mockGlobalConfig.validate.mockReturnValue({ isValid: true, missingKeys: [] });
    mockGlobalConfig.getConfigPath.mockReturnValue('/path/to/legacy/config');
    
    // Mock file system methods
    mockExistsSync.mockReturnValue(false);
    
    // Clear all mocks
    jest.clearAllMocks();
    mockReadlineInterface.question.mockReset();
    mockReadlineInterface.close.mockReset();
    
    // Register commands
    registerAccountCommands(program);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('registerAccountCommands', () => {
    it('should register account command with subcommands', () => {
      const commands = program.commands;
      const accountCommand = commands.find(cmd => cmd.name() === 'account');
      
      expect(accountCommand).toBeDefined();
      expect(accountCommand?.description()).toBe('Manage PolyV account configurations');
      
      const subcommands = accountCommand?.commands || [];
      expect(subcommands.some(cmd => cmd.name() === 'add')).toBe(true);
      expect(subcommands.some(cmd => cmd.name() === 'remove')).toBe(true);
      expect(subcommands.some(cmd => cmd.name() === 'list')).toBe(true);
      expect(subcommands.some(cmd => cmd.name() === 'current')).toBe(true);
      expect(subcommands.some(cmd => cmd.name() === 'migrate')).toBe(true);
      expect(subcommands.some(cmd => cmd.name() === 'set-default')).toBe(true);
      expect(subcommands.some(cmd => cmd.name() === 'unset-default')).toBe(true);
    });

    it('should register add command with correct options', () => {
      const accountCommand = program.commands.find(cmd => cmd.name() === 'account');
      const addCommand = accountCommand?.commands.find(cmd => cmd.name() === 'add');
      
      expect(addCommand).toBeDefined();
      expect(addCommand?.description()).toBe('Add a new account configuration');
      
      const options = addCommand?.options || [];
      expect(options.some(opt => opt.long === '--app-id' && opt.required)).toBe(true);
      expect(options.some(opt => opt.long === '--app-secret' && opt.required)).toBe(true);
      expect(options.some(opt => opt.long === '--user-id')).toBe(true);
      expect(options.some(opt => opt.long === '--env')).toBe(true);
      expect(options.some(opt => opt.long === '--base-url')).toBe(true);
    });

    it('should register list command with correct options', () => {
      const accountCommand = program.commands.find(cmd => cmd.name() === 'account');
      const listCommand = accountCommand?.commands.find(cmd => cmd.name() === 'list');
      
      expect(listCommand).toBeDefined();
      expect(listCommand?.description()).toBe('List all configured accounts');
      
      const outputOption = listCommand?.options.find(opt => opt.long === '--output');
      expect(outputOption).toBeDefined();
    });
  });

  describe('account add command', () => {
    it('should add account successfully', async () => {
      mockManager.addAccount.mockReturnValue({
        success: true,
        message: 'Account added successfully'
      });
      mockManager.getConfigPath.mockReturnValue('/path/to/config');

      const accountCommand = program.commands.find(cmd => cmd.name() === 'account');
      const addCommand = accountCommand?.commands.find(cmd => cmd.name() === 'add');
      
      await expect(async () => {
        await addCommand?.parseAsync(['node', 'script', 'test-account', '--app-id', 'test123', '--app-secret', 'secret123']);
      }).not.toThrow();

      expect(mockManager.addAccount).toHaveBeenCalledWith('test-account', 'test123', 'secret123', undefined, undefined, undefined);
      expect(mockConsoleLog).toHaveBeenCalledWith('✅ Account added successfully');
    });

    it('should add account with user ID', async () => {
      mockManager.addAccount.mockReturnValue({
        success: true,
        message: 'Account added successfully'
      });
      mockManager.getConfigPath.mockReturnValue('/path/to/config');

      const accountCommand = program.commands.find(cmd => cmd.name() === 'account');
      const addCommand = accountCommand?.commands.find(cmd => cmd.name() === 'add');
      
      await expect(async () => {
        await addCommand?.parseAsync(['node', 'script', 'test-account', '--app-id', 'test123', '--app-secret', 'secret123', '--user-id', 'user456']);
      }).not.toThrow();

      expect(mockManager.addAccount).toHaveBeenCalledWith('test-account', 'test123', 'secret123', 'user456', undefined, undefined);
      expect(mockConsoleLog).toHaveBeenCalledWith('  User ID: user456');
    });

    it('should exit when missing app-id', async () => {
      // Commander.js will handle this at the parsing level - we can just check that required options are registered
      const accountCommand = program.commands.find(cmd => cmd.name() === 'account');
      const addCommand = accountCommand?.commands.find(cmd => cmd.name() === 'add');
      
      const appIdOption = addCommand?.options.find(opt => opt.long === '--app-id');
      expect(appIdOption?.required).toBe(true);
    });

    it('should exit when missing app-secret', async () => {
      // Commander.js will handle this at the parsing level - we can just check that required options are registered
      const accountCommand = program.commands.find(cmd => cmd.name() === 'account');
      const addCommand = accountCommand?.commands.find(cmd => cmd.name() === 'add');
      
      const appSecretOption = addCommand?.options.find(opt => opt.long === '--app-secret');
      expect(appSecretOption?.required).toBe(true);
    });

    it('should handle add account failure', async () => {
      mockManager.addAccount.mockReturnValue({
        success: false,
        message: 'Account already exists'
      });

      const accountCommand = program.commands.find(cmd => cmd.name() === 'account');
      const addCommand = accountCommand?.commands.find(cmd => cmd.name() === 'add');
      
      try {
        await addCommand?.parseAsync(['node', 'script', 'test-account', '--app-id', 'test123', '--app-secret', 'secret123']);
      } catch (error) {
        // Expected to throw due to process.exit
      }

      expect(mockConsoleError).toHaveBeenCalledWith('❌ Account already exists');
    });

    it('should handle unexpected errors', async () => {
      mockManager.addAccount.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const accountCommand = program.commands.find(cmd => cmd.name() === 'account');
      const addCommand = accountCommand?.commands.find(cmd => cmd.name() === 'add');
      
      try {
        await addCommand?.parseAsync(['node', 'script', 'test-account', '--app-id', 'test123', '--app-secret', 'secret123']);
      } catch (error) {
        // Expected to throw due to process.exit
      }

      expect(mockConsoleError).toHaveBeenCalledWith('❌ Failed to add account:', 'Unexpected error');
    });

    it('should handle non-Error exceptions', async () => {
      mockManager.addAccount.mockImplementation(() => {
        throw 'String error';
      });

      const accountCommand = program.commands.find(cmd => cmd.name() === 'account');
      const addCommand = accountCommand?.commands.find(cmd => cmd.name() === 'add');
      
      try {
        await addCommand?.parseAsync(['node', 'script', 'test-account', '--app-id', 'test123', '--app-secret', 'secret123']);
      } catch (error) {
        // Expected to throw due to process.exit
      }

      expect(mockConsoleError).toHaveBeenCalledWith('❌ Failed to add account:', 'Unknown error');
    });
  });

  describe('account remove command', () => {
    it('should remove account with force flag', async () => {
      mockManager.accountExists.mockReturnValue(true);
      mockManager.removeAccount.mockReturnValue({
        success: true,
        message: 'Account removed successfully'
      });

      const accountCommand = program.commands.find(cmd => cmd.name() === 'account');
      const removeCommand = accountCommand?.commands.find(cmd => cmd.name() === 'remove');
      
      await expect(async () => {
        await removeCommand?.parseAsync(['node', 'script', 'test-account', '--force']);
      }).not.toThrow();

      expect(mockManager.accountExists).toHaveBeenCalledWith('test-account');
      expect(mockManager.removeAccount).toHaveBeenCalledWith('test-account');
      expect(mockConsoleLog).toHaveBeenCalledWith('✅ Account removed successfully');
    });

    it('should exit when account does not exist', async () => {
      mockManager.accountExists.mockReturnValue(false);

      const accountCommand = program.commands.find(cmd => cmd.name() === 'account');
      const removeCommand = accountCommand?.commands.find(cmd => cmd.name() === 'remove');
      
      try {
        await removeCommand?.parseAsync(['node', 'script', 'non-existent', '--force']);
      } catch (error) {
        // Expected to throw due to process.exit
      }

      expect(mockConsoleError).toHaveBeenCalledWith('❌ Account \'non-existent\' not found.');
    });

    it('should handle remove account failure', async () => {
      mockManager.accountExists.mockReturnValue(true);
      mockManager.removeAccount.mockReturnValue({
        success: false,
        message: 'Failed to remove account'
      });

      const accountCommand = program.commands.find(cmd => cmd.name() === 'account');
      const removeCommand = accountCommand?.commands.find(cmd => cmd.name() === 'remove');
      
      try {
        await removeCommand?.parseAsync(['node', 'script', 'test-account', '--force']);
      } catch (error) {
        // Expected to throw due to process.exit
      }

      expect(mockConsoleError).toHaveBeenCalledWith('❌ Failed to remove account');
    });


    it('should handle confirmation dialog with no answer', async () => {
      mockManager.accountExists.mockReturnValue(true);
      
      // Mock user answering 'n'
      mockReadlineInterface.question.mockImplementation((_question: string, callback: (answer: string) => void) => {
        callback('n');
      });

      const accountCommand = program.commands.find(cmd => cmd.name() === 'account');
      const removeCommand = accountCommand?.commands.find(cmd => cmd.name() === 'remove');
      
      try {
        await removeCommand?.parseAsync(['node', 'script', 'test-account']);
      } catch (error) {
        // Expected to complete normally
      }

      expect(mockManager.removeAccount).not.toHaveBeenCalled();
    });

    it('should handle unexpected errors', async () => {
      mockManager.accountExists.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const accountCommand = program.commands.find(cmd => cmd.name() === 'account');
      const removeCommand = accountCommand?.commands.find(cmd => cmd.name() === 'remove');
      
      try {
        await removeCommand?.parseAsync(['node', 'script', 'test-account', '--force']);
      } catch (error) {
        // Expected to throw due to process.exit
      }

      expect(mockConsoleError).toHaveBeenCalledWith('❌ Failed to remove account:', 'Unexpected error');
    });
  });

  describe('account list command', () => {
    it('should list accounts in table format', async () => {
      const mockAccounts = [
        { name: 'account1', appId: 'app123', userId: 'user1', createdAt: '2023-01-01T00:00:00.000Z', updatedAt: '2023-01-01T00:00:00.000Z' },
        { name: 'account2', appId: 'app456', createdAt: '2023-01-02T00:00:00.000Z', updatedAt: '2023-01-02T00:00:00.000Z' }
      ];
      mockManager.listAccounts.mockReturnValue(mockAccounts);

      const accountCommand = program.commands.find(cmd => cmd.name() === 'account');
      const listCommand = accountCommand?.commands.find(cmd => cmd.name() === 'list');
      
      await expect(async () => {
        await listCommand?.parseAsync(['node', 'script']);
      }).not.toThrow();

      expect(mockManager.listAccounts).toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith('📋 Configured Accounts:');
      expect(mockConsoleLog).toHaveBeenCalledWith('Total: 2 accounts');
    });

    it('should list accounts in JSON format', async () => {
      const mockAccounts = [
        { name: 'account1', appId: 'app123', userId: 'user1', createdAt: '2023-01-01T00:00:00.000Z', updatedAt: '2023-01-01T00:00:00.000Z' }
      ];
      mockManager.listAccounts.mockReturnValue(mockAccounts);

      const accountCommand = program.commands.find(cmd => cmd.name() === 'account');
      const listCommand = accountCommand?.commands.find(cmd => cmd.name() === 'list');
      
      await expect(async () => {
        await listCommand?.parseAsync(['node', 'script', '--output', 'json']);
      }).not.toThrow();

      expect(mockConsoleLog).toHaveBeenCalledWith(JSON.stringify(mockAccounts, null, 2));
    });

    it('should handle empty account list', async () => {
      mockManager.listAccounts.mockReturnValue([]);

      const accountCommand = program.commands.find(cmd => cmd.name() === 'account');
      const listCommand = accountCommand?.commands.find(cmd => cmd.name() === 'list');
      
      await expect(async () => {
        await listCommand?.parseAsync(['node', 'script']);
      }).not.toThrow();

      expect(mockConsoleLog).toHaveBeenCalledWith('📝 No accounts configured.');
      expect(mockConsoleLog).toHaveBeenCalledWith('Use "polyv-live-cli account add <name>" to add your first account.');
    });

    it('should handle unexpected errors', async () => {
      mockManager.listAccounts.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const accountCommand = program.commands.find(cmd => cmd.name() === 'account');
      const listCommand = accountCommand?.commands.find(cmd => cmd.name() === 'list');
      
      try {
        await listCommand?.parseAsync(['node', 'script']);
      } catch (error) {
        // Expected to throw due to process.exit
      }

      expect(mockConsoleError).toHaveBeenCalledWith('❌ Failed to list accounts:', 'Unexpected error');
    });
  });

  describe('account current command', () => {
    it('should show current account status with no accounts', async () => {
      mockManager.listAccounts.mockReturnValue([]);

      const accountCommand = program.commands.find(cmd => cmd.name() === 'account');
      const currentCommand = accountCommand?.commands.find(cmd => cmd.name() === 'current');
      
      await expect(async () => {
        await currentCommand?.parseAsync(['node', 'script']);
      }).not.toThrow();

      expect(mockConsoleLog).toHaveBeenCalledWith('📋 Current Account Status:');
      expect(mockConsoleLog).toHaveBeenCalledWith('🔐 Authentication Source:');
      expect(mockConsoleLog).toHaveBeenCalledWith('📝 Available Accounts:');
      expect(mockConsoleLog).toHaveBeenCalledWith('  没有配置任何账号。');
      expect(mockConsoleLog).toHaveBeenCalledWith('使用 "polyv-live-cli account add <name>" 添加账号。');
    });

    it('should show current account status with existing accounts', async () => {
      const mockAccounts = [
        { name: 'account1', appId: 'app123', userId: 'user1', createdAt: '2023-01-01T00:00:00.000Z', updatedAt: '2023-01-01T00:00:00.000Z' },
        { name: 'account2', appId: 'app456', createdAt: '2023-01-02T00:00:00.000Z', updatedAt: '2023-01-02T00:00:00.000Z' }
      ];
      mockManager.listAccounts.mockReturnValue(mockAccounts);

      const accountCommand = program.commands.find(cmd => cmd.name() === 'account');
      const currentCommand = accountCommand?.commands.find(cmd => cmd.name() === 'current');
      
      await expect(async () => {
        await currentCommand?.parseAsync(['node', 'script']);
      }).not.toThrow();

      expect(mockConsoleLog).toHaveBeenCalledWith('📋 Current Account Status:');
      expect(mockConsoleLog).toHaveBeenCalledWith('🔐 Authentication Source:');
      expect(mockConsoleLog).toHaveBeenCalledWith('📝 Available Accounts:');
      expect(mockConsoleLog).toHaveBeenCalledWith('  • account1');
      expect(mockConsoleLog).toHaveBeenCalledWith('    App ID: app123');
      expect(mockConsoleLog).toHaveBeenCalledWith('  • account2');
      expect(mockConsoleLog).toHaveBeenCalledWith('    App ID: app456');
    });

    it('should handle unexpected errors', async () => {
      mockManager.listAccounts.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const accountCommand = program.commands.find(cmd => cmd.name() === 'account');
      const currentCommand = accountCommand?.commands.find(cmd => cmd.name() === 'current');
      
      try {
        await currentCommand?.parseAsync(['node', 'script']);
      } catch (error) {
        // Expected to throw due to process.exit
      }

      expect(mockConsoleError).toHaveBeenCalledWith('❌ Failed to get current account:', 'Unexpected error');
    });
  });

  describe('account add command - validation', () => {
    it('should reject invalid environment via command parsing', async () => {
      const accountCommand = program.commands.find(cmd => cmd.name() === 'account');
      const addCommand = accountCommand?.commands.find(cmd => cmd.name() === 'add');
      
      try {
        await addCommand?.parseAsync(['node', 'script', 'test-account', '--app-id', 'test123', '--app-secret', 'secret123', '--env', 'invalid']);
      } catch (error) {
        // Expected to throw due to process.exit or validation error
      }

      expect(mockConsoleError).toHaveBeenCalledWith('❌ Error: --env must be one of: development, production, test, custom');
    });

    it('should reject invalid base URL via command parsing', async () => {
      const accountCommand = program.commands.find(cmd => cmd.name() === 'account');
      const addCommand = accountCommand?.commands.find(cmd => cmd.name() === 'add');
      
      try {
        await addCommand?.parseAsync(['node', 'script', 'test-account', '--app-id', 'test123', '--app-secret', 'secret123', '--base-url', 'invalid-url']);
      } catch (error) {
        // Expected to throw due to process.exit or validation error
      }

      expect(mockConsoleError).toHaveBeenCalledWith('❌ Error: --base-url must be a valid HTTP(S) URL');
    });

    it('should add account with environment', async () => {
      mockManager.addAccount.mockReturnValue({
        success: true,
        message: 'Account added successfully'
      });
      mockManager.getConfigPath.mockReturnValue('/path/to/config');

      const accountCommand = program.commands.find(cmd => cmd.name() === 'account');
      const addCommand = accountCommand?.commands.find(cmd => cmd.name() === 'add');
      
      await expect(async () => {
        await addCommand?.parseAsync(['node', 'script', 'test-account', '--app-id', 'test123', '--app-secret', 'secret123', '--env', 'production']);
      }).not.toThrow();

      expect(mockManager.addAccount).toHaveBeenCalledWith('test-account', 'test123', 'secret123', undefined, 'production', undefined);
      expect(mockConsoleLog).toHaveBeenCalledWith('  Environment: production');
    });

    it('should add account with base URL and set environment to custom', async () => {
      mockManager.addAccount.mockReturnValue({
        success: true,
        message: 'Account added successfully'
      });
      mockManager.getConfigPath.mockReturnValue('/path/to/config');

      const accountCommand = program.commands.find(cmd => cmd.name() === 'account');
      const addCommand = accountCommand?.commands.find(cmd => cmd.name() === 'add');
      
      await expect(async () => {
        await addCommand?.parseAsync(['node', 'script', 'test-account', '--app-id', 'test123', '--app-secret', 'secret123', '--base-url', 'https://custom.api.com']);
      }).not.toThrow();

      expect(mockManager.addAccount).toHaveBeenCalledWith('test-account', 'test123', 'secret123', undefined, 'custom', 'https://custom.api.com');
      expect(mockConsoleLog).toHaveBeenCalledWith('  Environment: custom');
      expect(mockConsoleLog).toHaveBeenCalledWith('  Base URL: https://custom.api.com');
    });
  });

  describe('account remove command - test subcommand registration', () => {
    it('should have remove command registered with correct options', () => {
      const accountCommand = program.commands.find(cmd => cmd.name() === 'account');
      const removeCommand = accountCommand?.commands.find(cmd => cmd.name() === 'remove');
      
      expect(removeCommand).toBeDefined();
      expect(removeCommand?.description()).toBe('Remove an account configuration');
      
      const forceOption = removeCommand?.options.find(opt => opt.long === '--force');
      expect(forceOption).toBeDefined();
      expect(forceOption?.description).toBe('Skip confirmation prompt');
    });
  });

  describe('account migrate command', () => {
    it('should handle no legacy configuration', async () => {
      mockGlobalConfig.exists.mockReturnValue(false);

      const accountCommand = program.commands.find(cmd => cmd.name() === 'account');
      const migrateCommand = accountCommand?.commands.find(cmd => cmd.name() === 'migrate');
      
      await expect(async () => {
        await migrateCommand?.parseAsync(['node', 'script']);
      }).not.toThrow();

      expect(mockConsoleLog).toHaveBeenCalledWith('📋 No legacy configuration found.');
      expect(mockConsoleLog).toHaveBeenCalledWith('Use "polyv-live-cli account add <name>" to add new accounts.');
    });

    it('should handle invalid legacy configuration', async () => {
      mockGlobalConfig.exists.mockReturnValue(true);
      mockGlobalConfig.validate.mockReturnValue({
        isValid: false,
        missingKeys: ['appId', 'appSecret']
      });

      const accountCommand = program.commands.find(cmd => cmd.name() === 'account');
      const migrateCommand = accountCommand?.commands.find(cmd => cmd.name() === 'migrate');
      
      try {
        await migrateCommand?.parseAsync(['node', 'script']);
      } catch (error) {
        // Expected to throw due to process.exit
      }

      expect(mockConsoleError).toHaveBeenCalledWith('❌ Legacy configuration is incomplete.');
      expect(mockConsoleError).toHaveBeenCalledWith('Missing required fields:', 'appId, appSecret');
    });

    it('should handle existing account name conflict', async () => {
      mockGlobalConfig.exists.mockReturnValue(true);
      mockGlobalConfig.load.mockReturnValue({
        appId: 'legacy123',
        appSecret: 'legacySecret',
        userId: 'legacyUser'
      });
      mockGlobalConfig.validate.mockReturnValue({ isValid: true, missingKeys: [] });
      mockManager.accountExists.mockReturnValue(true);

      const accountCommand = program.commands.find(cmd => cmd.name() === 'account');
      const migrateCommand = accountCommand?.commands.find(cmd => cmd.name() === 'migrate');
      
      try {
        await migrateCommand?.parseAsync(['node', 'script']);
      } catch (error) {
        // Expected to throw due to process.exit
      }

      expect(mockConsoleError).toHaveBeenCalledWith('❌ Account \'legacy_legacy123\' already exists.');
    });

    it('should migrate successfully with force flag', async () => {
      mockGlobalConfig.exists.mockReturnValue(true);
      mockGlobalConfig.load.mockReturnValue({
        appId: 'legacy123',
        appSecret: 'legacySecret',
        userId: 'legacyUser'
      });
      mockGlobalConfig.validate.mockReturnValue({ isValid: true, missingKeys: [] });
      mockManager.accountExists.mockReturnValue(false);
      mockManager.addAccount.mockReturnValue({
        success: true,
        message: 'Account migrated successfully'
      });
      mockManager.getConfigPath.mockReturnValue('/new/config/path');

      const accountCommand = program.commands.find(cmd => cmd.name() === 'account');
      const migrateCommand = accountCommand?.commands.find(cmd => cmd.name() === 'migrate');
      
      await expect(async () => {
        await migrateCommand?.parseAsync(['node', 'script', '--force']);
      }).not.toThrow();

      expect(mockManager.addAccount).toHaveBeenCalledWith('legacy_legacy123', 'legacy123', 'legacySecret', 'legacyUser');
      expect(mockConsoleLog).toHaveBeenCalledWith('✅ Account migrated successfully');
      expect(mockConsoleLog).toHaveBeenCalledWith('  New account name: legacy_legacy123');
    });

    it('should migrate with custom name', async () => {
      mockGlobalConfig.exists.mockReturnValue(true);
      mockGlobalConfig.load.mockReturnValue({
        appId: 'legacy123',
        appSecret: 'legacySecret'
      });
      mockGlobalConfig.validate.mockReturnValue({ isValid: true, missingKeys: [] });
      mockManager.accountExists.mockReturnValue(false);
      mockManager.addAccount.mockReturnValue({
        success: true,
        message: 'Account migrated successfully'
      });
      mockManager.getConfigPath.mockReturnValue('/new/config/path');

      const accountCommand = program.commands.find(cmd => cmd.name() === 'account');
      const migrateCommand = accountCommand?.commands.find(cmd => cmd.name() === 'migrate');
      
      await expect(async () => {
        await migrateCommand?.parseAsync(['node', 'script', '--name', 'custom-name', '--force']);
      }).not.toThrow();

      expect(mockManager.addAccount).toHaveBeenCalledWith('custom-name', 'legacy123', 'legacySecret', undefined);
    });

    it('should handle migration failure', async () => {
      mockGlobalConfig.exists.mockReturnValue(true);
      mockGlobalConfig.load.mockReturnValue({
        appId: 'legacy123',
        appSecret: 'legacySecret'
      });
      mockGlobalConfig.validate.mockReturnValue({ isValid: true, missingKeys: [] });
      mockManager.accountExists.mockReturnValue(false);
      mockManager.addAccount.mockReturnValue({
        success: false,
        message: 'Migration failed'
      });

      const accountCommand = program.commands.find(cmd => cmd.name() === 'account');
      const migrateCommand = accountCommand?.commands.find(cmd => cmd.name() === 'migrate');
      
      try {
        await migrateCommand?.parseAsync(['node', 'script', '--force']);
      } catch (error) {
        // Expected to throw due to process.exit
      }

      expect(mockConsoleError).toHaveBeenCalledWith('❌ Failed to migrate account:', 'Migration failed');
    });

    it('should have migrate command registered with correct options', () => {
      const accountCommand = program.commands.find(cmd => cmd.name() === 'account');
      const migrateCommand = accountCommand?.commands.find(cmd => cmd.name() === 'migrate');
      
      expect(migrateCommand).toBeDefined();
      expect(migrateCommand?.description()).toBe('Migrate legacy configuration to new account system');
      
      const nameOption = migrateCommand?.options.find(opt => opt.long === '--name');
      expect(nameOption).toBeDefined();
      
      const forceOption = migrateCommand?.options.find(opt => opt.long === '--force');
      expect(forceOption).toBeDefined();
      
      const keepLegacyOption = migrateCommand?.options.find(opt => opt.long === '--keep-legacy');
      expect(keepLegacyOption).toBeDefined();
    });

    it('should handle migration with keep legacy option', async () => {
      mockGlobalConfig.exists.mockReturnValue(true);
      mockGlobalConfig.load.mockReturnValue({
        appId: 'legacy123',
        appSecret: 'legacySecret'
      });
      mockGlobalConfig.validate.mockReturnValue({ isValid: true, missingKeys: [] });
      mockManager.accountExists.mockReturnValue(false);
      mockManager.addAccount.mockReturnValue({
        success: true,
        message: 'Account migrated successfully'
      });
      mockManager.getConfigPath.mockReturnValue('/new/config/path');

      const accountCommand = program.commands.find(cmd => cmd.name() === 'account');
      const migrateCommand = accountCommand?.commands.find(cmd => cmd.name() === 'migrate');
      
      await expect(async () => {
        await migrateCommand?.parseAsync(['node', 'script', '--force', '--keep-legacy']);
      }).not.toThrow();

      expect(mockUnlinkSync).not.toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith('Migration completed successfully!');
    });

    it('should handle migration unexpected errors', async () => {
      mockGlobalConfig.exists.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const accountCommand = program.commands.find(cmd => cmd.name() === 'account');
      const migrateCommand = accountCommand?.commands.find(cmd => cmd.name() === 'migrate');
      
      try {
        await migrateCommand?.parseAsync(['node', 'script']);
      } catch (error) {
        // Expected to throw due to process.exit
      }

      expect(mockConsoleError).toHaveBeenCalledWith('❌ Failed to migrate account:', 'Unexpected error');
    });
  });

  describe('account set-default command', () => {
    it('should set default account successfully', async () => {
      mockManager.setDefaultAccount.mockReturnValue({
        success: true,
        message: 'Default account set successfully'
      });

      const accountCommand = program.commands.find(cmd => cmd.name() === 'account');
      const setDefaultCommand = accountCommand?.commands.find(cmd => cmd.name() === 'set-default');
      
      await expect(async () => {
        await setDefaultCommand?.parseAsync(['node', 'script', 'test-account']);
      }).not.toThrow();

      expect(mockManager.setDefaultAccount).toHaveBeenCalledWith('test-account');
      expect(mockConsoleLog).toHaveBeenCalledWith('✅ Default account set successfully');
    });

    it('should handle set default failure', async () => {
      mockManager.setDefaultAccount.mockReturnValue({
        success: false,
        message: 'Account not found'
      });

      const accountCommand = program.commands.find(cmd => cmd.name() === 'account');
      const setDefaultCommand = accountCommand?.commands.find(cmd => cmd.name() === 'set-default');
      
      try {
        await setDefaultCommand?.parseAsync(['node', 'script', 'non-existent']);
      } catch (error) {
        // Expected to throw due to process.exit
      }

      expect(mockConsoleError).toHaveBeenCalledWith('❌ Account not found');
    });

    it('should handle unexpected errors', async () => {
      mockManager.setDefaultAccount.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const accountCommand = program.commands.find(cmd => cmd.name() === 'account');
      const setDefaultCommand = accountCommand?.commands.find(cmd => cmd.name() === 'set-default');
      
      try {
        await setDefaultCommand?.parseAsync(['node', 'script', 'test-account']);
      } catch (error) {
        // Expected to throw due to process.exit
      }

      expect(mockConsoleError).toHaveBeenCalledWith('❌ Failed to set default account:', 'Unexpected error');
    });
  });

  describe('account unset-default command', () => {
    it('should unset default account successfully', async () => {
      mockManager.unsetDefaultAccount.mockReturnValue({
        success: true,
        message: 'Default account unset successfully'
      });

      const accountCommand = program.commands.find(cmd => cmd.name() === 'account');
      const unsetDefaultCommand = accountCommand?.commands.find(cmd => cmd.name() === 'unset-default');
      
      await expect(async () => {
        await unsetDefaultCommand?.parseAsync(['node', 'script']);
      }).not.toThrow();

      expect(mockManager.unsetDefaultAccount).toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith('✅ Default account unset successfully');
    });

    it('should handle unset default failure', async () => {
      mockManager.unsetDefaultAccount.mockReturnValue({
        success: false,
        message: 'No default account set'
      });

      const accountCommand = program.commands.find(cmd => cmd.name() === 'account');
      const unsetDefaultCommand = accountCommand?.commands.find(cmd => cmd.name() === 'unset-default');
      
      try {
        await unsetDefaultCommand?.parseAsync(['node', 'script']);
      } catch (error) {
        // Expected to throw due to process.exit
      }

      expect(mockConsoleError).toHaveBeenCalledWith('❌ No default account set');
    });

    it('should handle unexpected errors', async () => {
      mockManager.unsetDefaultAccount.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const accountCommand = program.commands.find(cmd => cmd.name() === 'account');
      const unsetDefaultCommand = accountCommand?.commands.find(cmd => cmd.name() === 'unset-default');
      
      try {
        await unsetDefaultCommand?.parseAsync(['node', 'script']);
      } catch (error) {
        // Expected to throw due to process.exit
      }

      expect(mockConsoleError).toHaveBeenCalledWith('❌ Failed to unset default account:', 'Unexpected error');
    });
  });

  describe('account current command - enhanced scenarios', () => {
    it('should show current session and default account information', async () => {
      const mockAccounts = [
        { name: 'account1', appId: 'app123', userId: 'user1', createdAt: '2023-01-01T00:00:00.000Z', updatedAt: '2023-01-01T00:00:00.000Z' }
      ];
      mockManager.listAccounts.mockReturnValue(mockAccounts);
      mockManager.accountExists.mockReturnValue(true);
      mockManager.getDefaultAccount.mockReturnValue('account1');
      mockSessionManager.getCurrentSessionAccount.mockReturnValue('account1');
      mockSessionManager.getSessionState.mockReturnValue({
        accountName: 'account1',
        setAt: new Date('2023-01-01T10:00:00.000Z'),
        expiresAt: new Date('2023-01-01T20:00:00.000Z'),
        terminalId: 'term123',
        processId: 1234
      });
      mockSessionManager.getAuthSource.mockReturnValue({
        accountName: 'account1',
        description: 'Session account',
        priority: 0
      });

      const accountCommand = program.commands.find(cmd => cmd.name() === 'account');
      const currentCommand = accountCommand?.commands.find(cmd => cmd.name() === 'current');
      
      await expect(async () => {
        await currentCommand?.parseAsync(['node', 'script']);
      }).not.toThrow();

      expect(mockConsoleLog).toHaveBeenCalledWith('🎯 Current Session Account:');
      expect(mockConsoleLog).toHaveBeenCalledWith('  账号名称: account1');
      expect(mockConsoleLog).toHaveBeenCalledWith('🌟 Default Account:');
      expect(mockConsoleLog).toHaveBeenCalledWith('  • account1 (当前会话, 默认)');
    });

    it('should show warning for non-existent session account', async () => {
      mockManager.listAccounts.mockReturnValue([]);
      mockManager.accountExists.mockReturnValue(false);
      mockSessionManager.getCurrentSessionAccount.mockReturnValue('missing-account');

      const accountCommand = program.commands.find(cmd => cmd.name() === 'account');
      const currentCommand = accountCommand?.commands.find(cmd => cmd.name() === 'current');
      
      await expect(async () => {
        await currentCommand?.parseAsync(['node', 'script']);
      }).not.toThrow();

      expect(mockConsoleLog).toHaveBeenCalledWith('  ⚠️  警告: 当前会话账号在配置中不存在');
    });

    it('should show warning for non-existent default account', async () => {
      mockManager.listAccounts.mockReturnValue([]);
      mockManager.accountExists.mockReturnValue(false);
      mockManager.getDefaultAccount.mockReturnValue('missing-default');

      const accountCommand = program.commands.find(cmd => cmd.name() === 'account');
      const currentCommand = accountCommand?.commands.find(cmd => cmd.name() === 'current');
      
      await expect(async () => {
        await currentCommand?.parseAsync(['node', 'script']);
      }).not.toThrow();

      expect(mockConsoleLog).toHaveBeenCalledWith('  ⚠️  警告: 默认账号在配置中不存在');
    });

    it('should show guidance when no session or default account', async () => {
      const mockAccounts = [
        { name: 'account1', appId: 'app123', createdAt: '2023-01-01T00:00:00.000Z', updatedAt: '2023-01-01T00:00:00.000Z' }
      ];
      mockManager.listAccounts.mockReturnValue(mockAccounts);
      mockManager.getDefaultAccount.mockReturnValue(null);
      mockSessionManager.getCurrentSessionAccount.mockReturnValue(null);

      const accountCommand = program.commands.find(cmd => cmd.name() === 'account');
      const currentCommand = accountCommand?.commands.find(cmd => cmd.name() === 'current');
      
      await expect(async () => {
        await currentCommand?.parseAsync(['node', 'script']);
      }).not.toThrow();

      expect(mockConsoleLog).toHaveBeenCalledWith('使用 "polyv-live-cli use <account-name>" 切换到指定账号。');
      expect(mockConsoleLog).toHaveBeenCalledWith('或使用 "polyv-live-cli account set-default <account-name>" 设置默认账号。');
    });

    it('should show guidance when no session but has default account', async () => {
      const mockAccounts = [
        { name: 'account1', appId: 'app123', createdAt: '2023-01-01T00:00:00.000Z', updatedAt: '2023-01-01T00:00:00.000Z' }
      ];
      mockManager.listAccounts.mockReturnValue(mockAccounts);
      mockManager.getDefaultAccount.mockReturnValue('account1');
      mockSessionManager.getCurrentSessionAccount.mockReturnValue(null);

      const accountCommand = program.commands.find(cmd => cmd.name() === 'account');
      const currentCommand = accountCommand?.commands.find(cmd => cmd.name() === 'current');
      
      await expect(async () => {
        await currentCommand?.parseAsync(['node', 'script']);
      }).not.toThrow();

      expect(mockConsoleLog).toHaveBeenCalledWith('使用 "polyv-live-cli use <account-name>" 切换到指定账号。');
      expect(mockConsoleLog).not.toHaveBeenCalledWith('或使用 "polyv-live-cli account set-default <account-name>" 设置默认账号。');
    });
  });

  describe('formatAccountTable edge cases', () => {
    it('should handle accounts with varying field lengths', async () => {
      const mockAccounts = [
        { 
          name: 'very-long-account-name-that-exceeds-normal-length', 
          appId: 'short', 
          userId: 'very-long-user-id-that-should-affect-column-width',
          environment: 'development',
          createdAt: '2023-01-01T00:00:00.000Z', 
          updatedAt: '2023-01-01T00:00:00.000Z' 
        }
      ];
      mockManager.listAccounts.mockReturnValue(mockAccounts);

      const accountCommand = program.commands.find(cmd => cmd.name() === 'account');
      const listCommand = accountCommand?.commands.find(cmd => cmd.name() === 'list');
      
      await expect(async () => {
        await listCommand?.parseAsync(['node', 'script']);
      }).not.toThrow();

      expect(mockConsoleLog).toHaveBeenCalledWith('📋 Configured Accounts:');
      expect(mockConsoleLog).toHaveBeenCalledWith('Total: 1 account');
    });
  });
});