/**
 * @fileoverview Tests for AccountConfigManager
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { AccountConfigManager } from './account-config';
import { AccountsStore } from '../types/account.types';

describe('AccountConfigManager', () => {
  let manager: AccountConfigManager;
  let tempConfigPath: string;
  let tempDir: string;

  beforeEach(() => {
    // Create temporary directory for tests
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'polyv-test-'));
    tempConfigPath = path.join(tempDir, 'test-accounts.json');
    manager = new AccountConfigManager(tempConfigPath);
  });

  afterEach(() => {
    // Clean up temporary files
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('constructor', () => {
    it('should initialize with custom config path', () => {
      expect(manager.getConfigPath()).toBe(tempConfigPath);
    });

    it('should initialize with default config path', () => {
      const defaultManager = new AccountConfigManager();
      const expectedPath = path.join(os.homedir(), '.polyv', 'accounts.json');
      expect(defaultManager.getConfigPath()).toBe(expectedPath);
    });
  });

  describe('loadAccountsStore', () => {
    it('should create empty store if file does not exist', () => {
      const store = manager.loadAccountsStore();
      
      expect(store.version).toBe('1.0.0');
      expect(store.accounts).toEqual({});
      expect(store.metadata.createdAt).toBeDefined();
      expect(store.metadata.updatedAt).toBeDefined();
    });

    it('should load existing store from file', () => {
      const testStore: AccountsStore = {
        version: '1.0.0',
        accounts: {
          'test-account': {
            name: 'test-account',
            appId: 'test-app-id',
            appSecret: 'encrypted-secret',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          }
        },
        metadata: {
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      };

      fs.writeFileSync(tempConfigPath, JSON.stringify(testStore));
      const loadedStore = manager.loadAccountsStore();
      
      expect(loadedStore).toEqual(testStore);
    });

    it('should throw error for invalid JSON', () => {
      fs.writeFileSync(tempConfigPath, 'invalid-json');
      
      expect(() => {
        manager.loadAccountsStore();
      }).toThrow('Invalid JSON in accounts configuration file');
    });

    it('should throw error for invalid store format', () => {
      fs.writeFileSync(tempConfigPath, JSON.stringify({ invalid: 'format' }));
      
      expect(() => {
        manager.loadAccountsStore();
      }).toThrow('Invalid accounts store format');
    });
  });

  describe('addAccount', () => {
    it('should add new account successfully', () => {
      const result = manager.addAccount('test-account', 'testappid123', 'testsecret123456');
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('added successfully');
      expect(result.account).toBeDefined();
      expect(result.account?.name).toBe('test-account');
      expect(result.account?.appId).toBe('testappid123');
      expect(result.account?.appSecret).toBe('[encrypted]');
    });

    it('should add account with optional userId', () => {
      const result = manager.addAccount('test-account', 'testappid123', 'testsecret123456', 'user123');
      
      expect(result.success).toBe(true);
      expect(result.account?.userId).toBe('user123');
    });

    it('should reject duplicate account names', () => {
      manager.addAccount('test-account', 'testappid123', 'testsecret123456');
      const result = manager.addAccount('test-account', 'otherappid456789', 'othersecret789012345');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('already exists');
    });

    it('should validate account name format', () => {
      const result = manager.addAccount('invalid name!', 'testappid123', 'testsecret123456');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('can only contain letters, numbers, underscores, and hyphens');
    });

    it('should validate appId format', () => {
      const result = manager.addAccount('test-account', 'invalid-app-id!', 'testsecret123456');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('can only contain letters and numbers');
    });

    it('should validate appSecret length', () => {
      const result = manager.addAccount('test-account', 'testappid123', 'short');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('must be between 16 and 128 characters');
    });

    it('should require account name', () => {
      const result = manager.addAccount('', 'testappid123', 'testsecret123456');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Account name is required');
    });

    it('should require appId', () => {
      const result = manager.addAccount('test-account', '', 'testsecret123456');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('App ID is required');
    });

    it('should require appSecret', () => {
      const result = manager.addAccount('test-account', 'testappid123', '');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('App Secret is required');
    });
  });

  describe('removeAccount', () => {
    beforeEach(() => {
      manager.addAccount('test-account', 'testappid123', 'testsecret123456');
    });

    it('should remove existing account', () => {
      const result = manager.removeAccount('test-account');
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('removed successfully');
      expect(manager.accountExists('test-account')).toBe(false);
    });

    it('should return error for non-existent account', () => {
      const result = manager.removeAccount('non-existent');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('not found');
    });
  });

  describe('getAccount', () => {
    beforeEach(() => {
      manager.addAccount('test-account', 'testappid123', 'testsecret123456', 'user123');
    });

    it('should return account with decrypted secret', () => {
      const account = manager.getAccount('test-account');
      
      expect(account).toBeDefined();
      expect(account?.name).toBe('test-account');
      expect(account?.appId).toBe('testappid123');
      expect(account?.appSecret).toBe('testsecret123456');
      expect(account?.userId).toBe('user123');
    });

    it('should return null for non-existent account', () => {
      const account = manager.getAccount('non-existent');
      expect(account).toBeNull();
    });
  });

  describe('listAccounts', () => {
    it('should return empty array when no accounts', () => {
      const accounts = manager.listAccounts();
      expect(accounts).toEqual([]);
    });

    it('should list accounts without sensitive information', () => {
      const result1 = manager.addAccount('account1', 'appid12345', 'secret1234567890', 'user1');
      const result2 = manager.addAccount('account2', 'appid67890', 'secret0987654321');
      
      if (!result1.success) {
        console.log('Result1 failed:', result1.message);
      }
      if (!result2.success) {
        console.log('Result2 failed:', result2.message);
      }
      
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      
      const accounts = manager.listAccounts();
      
      expect(accounts).toHaveLength(2);
      expect(accounts[0]).toHaveProperty('name');
      expect(accounts[0]).toHaveProperty('appId');
      expect(accounts[0]).toHaveProperty('createdAt');
      expect(accounts[0]).toHaveProperty('updatedAt');
      expect(accounts[0]).not.toHaveProperty('appSecret');
      
      // Check that userId is included when present
      const accountWithUserId = accounts.find(a => a.name === 'account1');
      const accountWithoutUserId = accounts.find(a => a.name === 'account2');
      expect(accountWithUserId).toHaveProperty('userId', 'user1');
      expect(accountWithoutUserId).not.toHaveProperty('userId');
    });
  });

  describe('accountExists', () => {
    it('should return false for non-existent account', () => {
      expect(manager.accountExists('non-existent')).toBe(false);
    });

    it('should return true for existing account', () => {
      manager.addAccount('test-account', 'testappid123', 'testsecret123456');
      expect(manager.accountExists('test-account')).toBe(true);
    });
  });

  describe('backupConfig', () => {
    beforeEach(() => {
      manager.addAccount('test-account', 'testappid123', 'testsecret123456');
    });

    it('should create backup file', () => {
      const backupPath = manager.backupConfig();
      
      expect(fs.existsSync(backupPath)).toBe(true);
      expect(backupPath).toContain('.backup.');
      
      // Verify backup content
      const backupContent = fs.readFileSync(backupPath, 'utf8');
      const originalContent = fs.readFileSync(tempConfigPath, 'utf8');
      expect(backupContent).toBe(originalContent);
    });

    it('should create backup with custom path', () => {
      const customBackupPath = path.join(tempDir, 'custom-backup.json');
      const backupPath = manager.backupConfig(customBackupPath);
      
      expect(backupPath).toBe(customBackupPath);
      expect(fs.existsSync(customBackupPath)).toBe(true);
    });
  });

  describe('restoreConfig', () => {
    it('should restore from backup', () => {
      // Create initial config
      manager.addAccount('test-account', 'testappid123', 'testsecret123456');
      const backupPath = manager.backupConfig();
      
      // Modify config
      manager.addAccount('another-account', 'otherappid456789', 'othersecret789012345');
      expect(manager.listAccounts()).toHaveLength(2);
      
      // Restore from backup
      manager.restoreConfig(backupPath);
      expect(manager.listAccounts()).toHaveLength(1);
      expect(manager.accountExists('test-account')).toBe(true);
      expect(manager.accountExists('another-account')).toBe(false);
    });

    it('should throw error for non-existent backup', () => {
      expect(() => {
        manager.restoreConfig('/non/existent/backup.json');
      }).toThrow('Backup file not found');
    });
  });

  describe('validateConfig', () => {
    it('should return true for valid config', () => {
      manager.addAccount('test-account', 'testappid123', 'testsecret123456');
      expect(manager.validateConfig()).toBe(true);
    });

    it('should return true for empty config', () => {
      expect(manager.validateConfig()).toBe(true);
    });

    it('should return false for corrupted config', () => {
      // Create account first
      manager.addAccount('test-account', 'testappid123', 'testsecret123456');
      
      // Corrupt the config file
      fs.writeFileSync(tempConfigPath, JSON.stringify({
        version: '1.0.0',
        accounts: {
          'test-account': {
            name: 'test-account',
            appId: 'testappid123',
            appSecret: 'invalid-encrypted-data',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          }
        },
        metadata: {
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      }));
      
      expect(manager.validateConfig()).toBe(false);
    });
  });

  // ============================================
  // setDefaultAccount / unsetDefaultAccount / getDefaultAccount / getDefaultAccountConfig
  // ============================================

  describe('setDefaultAccount', () => {
    it('should set an existing account as default', () => {
      manager.addAccount('test-account', 'testappid123', 'testsecret123456');
      const result = manager.setDefaultAccount('test-account');
      expect(result.success).toBe(true);
      expect(result.message).toContain('默认账号');
    });

    it('should fail for non-existent account', () => {
      const result = manager.setDefaultAccount('nonexistent');
      expect(result.success).toBe(false);
      expect(result.message).toContain('不存在');
    });

    it('should suggest available accounts when account not found', () => {
      manager.addAccount('prod-account', 'testappid123', 'testsecret123456');
      const result = manager.setDefaultAccount('wrong');
      expect(result.message).toContain('prod-account');
    });

    it('should show add-account message when no accounts exist', () => {
      const result = manager.setDefaultAccount('any');
      expect(result.message).toContain('没有配置任何账号');
    });
  });

  describe('unsetDefaultAccount', () => {
    it('should unset default account', () => {
      manager.addAccount('test-account', 'testappid123', 'testsecret123456');
      manager.setDefaultAccount('test-account');
      const result = manager.unsetDefaultAccount();
      expect(result.success).toBe(true);
      expect(result.message).toContain('取消');
    });

    it('should fail when no default account is set', () => {
      const result = manager.unsetDefaultAccount();
      expect(result.success).toBe(false);
      expect(result.message).toContain('没有设置默认账号');
    });
  });

  describe('getDefaultAccount', () => {
    it('should return null when no default is set', () => {
      expect(manager.getDefaultAccount()).toBeNull();
    });

    it('should return default account name', () => {
      manager.addAccount('test-account', 'testappid123', 'testsecret123456');
      manager.setDefaultAccount('test-account');
      expect(manager.getDefaultAccount()).toBe('test-account');
    });
  });

  describe('getDefaultAccountConfig', () => {
    it('should return null when no default account', () => {
      expect(manager.getDefaultAccountConfig()).toBeNull();
    });

    it('should return account config for default account', () => {
      manager.addAccount('my-account', 'testappid123', 'testsecret123456');
      manager.setDefaultAccount('my-account');
      const config = manager.getDefaultAccountConfig();
      expect(config).not.toBeNull();
      expect(config!.appId).toBe('testappid123');
    });
  });
});
