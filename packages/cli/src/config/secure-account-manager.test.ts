/**
 * Unit tests for SecureAccountManager
 * Tests integrated security features and account management
 */

import { SecureAccountManager } from './secure-account-manager';
import { AccountEncryptionImpl } from './account-encryption';
import { FilePermissionManager } from './file-permission-manager';
import { ConfigVersionManager } from './config-version-manager';
import { ConfigRecoveryManager } from './config-recovery-manager';
import * as fs from 'fs';
import * as os from 'os';

// Mock dependencies
jest.mock('fs');
jest.mock('os');
jest.mock('./account-encryption');
jest.mock('./file-permission-manager');
jest.mock('./config-version-manager');
jest.mock('./config-recovery-manager');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockOs = os as jest.Mocked<typeof os>;
const MockAccountEncryption = AccountEncryptionImpl as jest.MockedClass<typeof AccountEncryptionImpl>;
const MockFilePermissionManager = FilePermissionManager as jest.MockedClass<typeof FilePermissionManager>;
const MockConfigVersionManager = ConfigVersionManager as jest.MockedClass<typeof ConfigVersionManager>;
const MockConfigRecoveryManager = ConfigRecoveryManager as jest.MockedClass<typeof ConfigRecoveryManager>;

describe('SecureAccountManager', () => {
  let manager: SecureAccountManager;
  let mockEncryption: jest.Mocked<AccountEncryptionImpl>;
  let mockPermissionManager: jest.Mocked<FilePermissionManager>;
  let mockVersionManager: jest.Mocked<ConfigVersionManager>;
  let mockRecoveryManager: jest.Mocked<ConfigRecoveryManager>;

  const testConfigPath = '/test/.polyv/accounts.json';
  const testMasterKey = 'test-master-key-123';

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mocks
    mockEncryption = new MockAccountEncryption() as jest.Mocked<AccountEncryptionImpl>;
    mockPermissionManager = new MockFilePermissionManager() as jest.Mocked<FilePermissionManager>;
    mockVersionManager = new MockConfigVersionManager() as jest.Mocked<ConfigVersionManager>;
    mockRecoveryManager = new MockConfigRecoveryManager() as jest.Mocked<ConfigRecoveryManager>;

    // Default mock implementations
    mockOs.homedir.mockReturnValue('/test');
    mockEncryption.getKeySource.mockReturnValue('environment');
    mockEncryption.testEncryption.mockReturnValue(true);
    mockPermissionManager.ensureSecureDirectory.mockReturnValue({
      success: true,
      message: 'Directory secured'
    } as any);
    mockPermissionManager.setSecurePermissions.mockReturnValue({
      success: true,
      message: 'Permissions set'
    } as any);
    mockVersionManager.getCurrentVersion.mockReturnValue('1.0');
    mockVersionManager.detectVersion.mockReturnValue('1.0');
    mockVersionManager.validateVersion.mockReturnValue({
      isValid: true,
      compatibility: 'compatible',
      requiredActions: []
    } as any);
    mockVersionManager.isMigrationRequired.mockReturnValue(false);
    mockRecoveryManager.checkIntegrity.mockReturnValue({
      isValid: true,
      message: 'Configuration is valid',
      issues: [],
      validationDetails: {
        fileAccessible: true,
        validJson: true,
        validStructure: true,
        validEncryption: true,
        securePermissions: true
      }
    } as any);

    manager = new SecureAccountManager(testConfigPath, testMasterKey);
    
    // Replace internal instances
    (manager as any).encryption = mockEncryption;
    (manager as any).permissionManager = mockPermissionManager;
    (manager as any).versionManager = mockVersionManager;
    (manager as any).recoveryManager = mockRecoveryManager;
  });

  describe('constructor', () => {
    it('should initialize with custom config path', () => {
      const customManager = new SecureAccountManager('/custom/path/config.json', testMasterKey);
      expect(customManager.getConfigPath()).toBe('/custom/path/config.json');
    });

    it('should initialize with directory path', () => {
      const customManager = new SecureAccountManager('/custom/path', testMasterKey);
      expect(customManager.getConfigPath()).toBe('/custom/path/accounts.json');
    });

    it('should use default path when none provided', () => {
      // Mock home directory
      const originalHome = process.env['HOME'];
      process.env['HOME'] = '/test';
      
      const defaultManager = new SecureAccountManager();
      expect(defaultManager.getConfigPath()).toBe('/test/.polyv/accounts.json');
      
      // Restore original
      if (originalHome) {
        process.env['HOME'] = originalHome;
      } else {
        delete process.env['HOME'];
      }
    });
  });

  describe('loadAccountsStore', () => {
    it('should create empty store when file does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);

      const store = manager.loadAccountsStore();

      expect(store.version).toBe('1.0');
      expect(store.accounts).toEqual({});
      expect(store.metadata).toBeDefined();
      expect(store.metadata.security).toBeDefined();
      expect(store.metadata.keySource).toBe('environment');
    });

    it('should load existing valid store', () => {
      const existingStore = {
        version: '1.0',
        accounts: {
          test: {
            name: 'test',
            appId: 'testId',
            appSecret: {
              algorithm: 'aes-256-gcm',
              iv: 'testIv',
              authTag: 'testTag',
              encrypted: 'testData'
            },
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          }
        },
        metadata: {
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(existingStore));

      const store = manager.loadAccountsStore();

      expect(store.version).toBe('1.0');
      expect(store.accounts.test).toBeDefined();
      expect(store.metadata.security).toBeDefined();
    });

    it('should handle integrity check failure', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockRecoveryManager.checkIntegrity.mockReturnValue({
        isValid: false,
        message: 'File is corrupted',
        issues: [],
        validationDetails: {} as any
      });

      expect(() => manager.loadAccountsStore()).toThrow('Configuration file integrity check failed');
    });

    it('should handle version incompatibility', () => {
      const futureStore = {
        version: '999.0',
        accounts: {},
        metadata: {
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(futureStore));
      mockVersionManager.validateVersion.mockReturnValue({
        isValid: false,
        compatibility: 'incompatible',
        message: 'Version too new',
        requiredActions: []
      } as any);

      expect(() => manager.loadAccountsStore()).toThrow('Incompatible configuration version');
    });

    it('should handle migration required', () => {
      const oldStore = {
        version: '0.9',
        accounts: {},
        metadata: {
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(oldStore));
      mockVersionManager.isMigrationRequired.mockReturnValue(true);
      mockVersionManager.detectVersion.mockReturnValue('0.9');
      mockVersionManager.migrateConfiguration.mockReturnValue({
        success: true,
        message: 'Migrated successfully',
        fromVersion: '0.9',
        toVersion: '1.0',
        steps: [],
        warnings: [],
        migratedConfig: {
          version: '1.0',
          accounts: {},
          metadata: {
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          }
        }
      } as any);

      const store = manager.loadAccountsStore();

      expect(store.version).toBe('1.0');
      expect(mockVersionManager.migrateConfiguration).toHaveBeenCalled();
    });

    it('should handle JSON parsing errors', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('invalid json {');

      expect(() => manager.loadAccountsStore()).toThrow('Invalid JSON in accounts configuration file');
    });
  });

  describe('saveAccountsStore', () => {
    it('should save store with security measures', () => {
      const store = {
        version: '1.0',
        accounts: {},
        metadata: {
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      };

      mockFs.existsSync.mockReturnValue(false); // No existing file to backup
      mockFs.writeFileSync.mockImplementation(() => {});
      mockFs.renameSync.mockImplementation(() => {});
      mockRecoveryManager.createBackup.mockReturnValue('/test/backup/path');

      manager.saveAccountsStore(store as any);

      expect(mockPermissionManager.ensureSecureDirectory).toHaveBeenCalled();
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        testConfigPath + '.tmp',
        expect.stringContaining('"version": "1.0"'),
        'utf8'
      );
      expect(mockPermissionManager.setSecurePermissions).toHaveBeenCalledWith(testConfigPath + '.tmp', false);
      expect(mockFs.renameSync).toHaveBeenCalledWith(testConfigPath + '.tmp', testConfigPath);
    });

    it('should handle permission setting failure', () => {
      const store = {
        version: '1.0',
        accounts: {},
        metadata: {
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      };

      mockFs.writeFileSync.mockImplementation(() => {});
      mockFs.unlinkSync.mockImplementation(() => {});
      mockPermissionManager.setSecurePermissions.mockReturnValue({
        success: false,
        message: 'Permission denied'
      } as any);

      expect(() => manager.saveAccountsStore(store as any)).toThrow('Failed to set secure permissions');
      expect(mockFs.unlinkSync).toHaveBeenCalledWith(testConfigPath + '.tmp');
    });
  });

  describe('addAccount', () => {
    beforeEach(() => {
      // Mock empty store
      mockFs.existsSync.mockReturnValue(false);
      mockEncryption.encrypt.mockReturnValue({
        algorithm: 'aes-256-gcm',
        iv: 'testIv',
        authTag: 'testTag',
        encrypted: 'encryptedSecret'
      });
    });

    it('should add new account successfully', () => {
      const result = manager.addAccount('test-account', 'testAppId123', 'testSecret123456789', 'testUser');

      expect(result.success).toBe(true);
      expect(result.message).toContain('added successfully with enhanced security');
      expect(result.account).toBeDefined();
      expect(result.account!.name).toBe('test-account');
      expect(result.account!.appSecret).toBe('[encrypted]');
      expect(mockEncryption.encrypt).toHaveBeenCalledWith('testSecret123456789');
    });

    it('should reject duplicate account names', () => {
      const existingStore = {
        version: '1.0',
        accounts: {
          'existing-account': {
            name: 'existing-account',
            appId: 'existingId',
            appSecret: { algorithm: 'aes-256-gcm', iv: '', authTag: '', encrypted: '' },
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          }
        },
        metadata: {
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(existingStore));

      const result = manager.addAccount('existing-account', 'testAppId123', 'testSecret123456789');

      expect(result.success).toBe(false);
      expect(result.message).toContain('already exists');
    });

    it('should validate account input', () => {
      const result = manager.addAccount('', 'testAppId123', 'testSecret123');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Account name is required');
    });

    it('should validate app ID format', () => {
      const result = manager.addAccount('test-account', 'invalid-id!', 'testSecret123');

      expect(result.success).toBe(false);
      expect(result.message).toContain('App ID can only contain letters and numbers');
    });

    it('should validate app secret length', () => {
      const result = manager.addAccount('test-account', 'testAppId123', 'short');

      expect(result.success).toBe(false);
      expect(result.message).toContain('App Secret must be between');
    });
  });

  describe('getAccount', () => {
    it('should decrypt and return account', () => {
      const encryptedStore = {
        version: '1.0',
        accounts: {
          'test-account': {
            name: 'test-account',
            appId: 'testAppId123',
            appSecret: {
              algorithm: 'aes-256-gcm',
              iv: 'testIv',
              authTag: 'testTag',
              encrypted: 'encryptedSecret'
            },
            userId: 'testUser',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          }
        },
        metadata: {
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(encryptedStore));
      mockEncryption.decrypt.mockReturnValue('decryptedSecret123');

      const account = manager.getAccount('test-account');

      expect(account).toBeDefined();
      expect(account!.name).toBe('test-account');
      expect(account!.appSecret).toBe('decryptedSecret123');
      expect(account!.userId).toBe('testUser');
      expect(mockEncryption.decrypt).toHaveBeenCalled();
    });

    it('should return null for non-existent account', () => {
      mockFs.existsSync.mockReturnValue(false);

      const account = manager.getAccount('non-existent');

      expect(account).toBeNull();
    });

    it('should handle migration required accounts', () => {
      const migrationStore = {
        version: '1.0',
        accounts: {
          'migration-account': {
            name: 'migration-account',
            appId: 'testAppId123',
            appSecret: {
              algorithm: 'aes-256-gcm',
              iv: 'testIv',
              authTag: 'testTag',
              encrypted: 'encryptedSecret'
            },
            _migrationRequired: true,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          }
        },
        metadata: {
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(migrationStore));

      expect(() => manager.getAccount('migration-account')).toThrow('requires migration');
    });

    it('should handle legacy format gracefully', () => {
      const legacyStore = {
        version: '1.0',
        accounts: {
          'legacy-account': {
            name: 'legacy-account',
            appId: 'testAppId123',
            appSecret: 'legacy-encrypted-string',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          }
        },
        metadata: {
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(legacyStore));

      expect(() => manager.getAccount('legacy-account')).toThrow('uses legacy encryption format');
    });
  });

  describe('removeAccount', () => {
    it('should remove existing account', () => {
      const storeWithAccount = {
        version: '1.0',
        accounts: {
          'test-account': {
            name: 'test-account',
            appId: 'testAppId123',
            appSecret: { algorithm: 'aes-256-gcm', iv: '', authTag: '', encrypted: '' },
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          }
        },
        metadata: {
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(storeWithAccount));
      mockFs.writeFileSync.mockImplementation(() => {});
      mockFs.renameSync.mockImplementation(() => {});

      const result = manager.removeAccount('test-account');

      expect(result.success).toBe(true);
      expect(result.message).toContain('removed successfully');
    });

    it('should handle non-existent account removal', () => {
      mockFs.existsSync.mockReturnValue(false);

      const result = manager.removeAccount('non-existent');

      expect(result.success).toBe(false);
      expect(result.message).toContain('not found');
    });
  });

  describe('security features', () => {
    it('should get security context', () => {
      mockFs.existsSync.mockReturnValue(false);
      mockPermissionManager.validatePermissions.mockReturnValue({
        isValid: true,
        message: 'Secure',
        recommendations: []
      } as any);

      const context = manager.getSecurityContext();

      expect(context.encryptionEnabled).toBe(true);
      expect(context.keySource).toBe('environment');
      expect(context.configVersion).toBe('1.0');
      expect(context.permissionsValid).toBe(true);
    });

    it('should validate security', () => {
      mockFs.existsSync.mockReturnValue(false);
      mockPermissionManager.validatePermissions.mockReturnValue({
        isValid: true,
        message: 'Secure',
        recommendations: []
      } as any);

      const validation = manager.validateSecurity();

      expect(validation.isSecure).toBe(true);
      expect(validation.issues).toHaveLength(0);
      expect(validation.recommendations).toHaveLength(0);
    });

    it('should detect security issues', () => {
      mockRecoveryManager.checkIntegrity.mockReturnValue({
        isValid: false,
        message: 'File corrupted',
        issues: [],
        validationDetails: {} as any
      });
      mockPermissionManager.validatePermissions.mockReturnValue({
        isValid: false,
        message: 'Insecure permissions',
        recommendations: ['Fix permissions']
      } as any);

      const validation = manager.validateSecurity();

      expect(validation.isSecure).toBe(false);
      expect(validation.issues.length).toBeGreaterThan(0);
      expect(validation.recommendations.length).toBeGreaterThan(0);
    });

    it('should perform security maintenance', () => {
      mockFs.existsSync.mockReturnValue(false);
      mockPermissionManager.repairConfigurationFile.mockReturnValue({
        success: true,
        message: 'Repaired'
      } as any);
      mockRecoveryManager.createBackup.mockReturnValue('/backup/path');

      const result = manager.performSecurityMaintenance();

      expect(result.success).toBe(true);
      expect(result.actionsPerformed).toContain('Fixed file permissions');
      expect(result.actionsPerformed).toContain('Created backup: /backup/path');
    });
  });

  describe('listAccounts', () => {
    it('should list accounts without sensitive data', () => {
      const storeWithAccounts = {
        version: '1.0',
        accounts: {
          'account1': {
            name: 'account1',
            appId: 'appId1',
            appSecret: { algorithm: 'aes-256-gcm', iv: '', authTag: '', encrypted: '' },
            userId: 'user1',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          },
          'account2': {
            name: 'account2',
            appId: 'appId2',
            appSecret: { algorithm: 'aes-256-gcm', iv: '', authTag: '', encrypted: '' },
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          }
        },
        metadata: {
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(storeWithAccounts));

      const accounts = manager.listAccounts();

      expect(accounts).toHaveLength(2);
      expect(accounts[0].name).toBe('account1');
      expect(accounts[0].userId).toBe('user1');
      expect(accounts[1].name).toBe('account2');
      expect(accounts[1]).not.toHaveProperty('userId'); // Optional field not present
      
      // Ensure no appSecret is included
      accounts.forEach(account => {
        expect(account).not.toHaveProperty('appSecret');
      });
    });
  });

  describe('accountExists', () => {
    it('should return true for existing account', () => {
      const storeWithAccount = {
        version: '1.0',
        accounts: {
          'existing-account': {}
        },
        metadata: {
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(storeWithAccount));

      expect(manager.accountExists('existing-account')).toBe(true);
      expect(manager.accountExists('non-existent')).toBe(false);
    });

    it('should return false on errors', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('Read error');
      });

      expect(manager.accountExists('any-account')).toBe(false);
    });
  });
});