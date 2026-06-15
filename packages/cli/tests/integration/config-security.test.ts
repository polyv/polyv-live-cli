/**
 * Integration tests for configuration file security
 * Tests the complete security system with real file operations
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { SecureAccountManager } from '../../src/config/secure-account-manager';
import { AccountEncryptionImpl } from '../../src/config/account-encryption';
import { FilePermissionManager } from '../../src/config/file-permission-manager';
import { ConfigVersionManager } from '../../src/config/config-version-manager';
import { ConfigRecoveryManager } from '../../src/config/config-recovery-manager';

describe('Configuration Security Integration Tests', () => {
  let tempDir: string;
  let configPath: string;
  let manager: SecureAccountManager;

  beforeEach(() => {
    // Create temporary directory for tests
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'polyv-security-test-'));
    configPath = path.join(tempDir, 'accounts.json');
    
    // Set test environment variable
    process.env['POLYV_MASTER_KEY'] = 'test-master-key-for-integration-tests-2024';
    
    // Create manager instance
    manager = new SecureAccountManager(configPath);
  });

  afterEach(() => {
    // Clean up temporary directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    
    // Clean up environment
    delete process.env['POLYV_MASTER_KEY'];
  });

  describe('end-to-end secure account management', () => {
    it('should create, read, and manage accounts securely', () => {
      // Add first account
      const result1 = manager.addAccount('account1', 'testAppId123', 'secretKey123456789', 'user1');
      expect(result1.success).toBe(true);
      expect(result1.message).toContain('enhanced security');

      // Add second account
      const result2 = manager.addAccount('account2', 'testAppId456', 'secretKey456789012');
      expect(result2.success).toBe(true);

      // Verify accounts exist
      expect(manager.accountExists('account1')).toBe(true);
      expect(manager.accountExists('account2')).toBe(true);
      expect(manager.accountExists('nonexistent')).toBe(false);

      // List accounts (should not contain secrets)
      const accounts = manager.listAccounts();
      expect(accounts).toHaveLength(2);
      expect(accounts[0].name).toBe('account1');
      expect(accounts[0].appId).toBe('testAppId123');
      expect(accounts[0].userId).toBe('user1');
      expect(accounts[1].name).toBe('account2');
      expect(accounts[1].appId).toBe('testAppId456');
      expect(accounts[1]).not.toHaveProperty('userId');

      // No secrets should be exposed
      accounts.forEach(account => {
        expect(account).not.toHaveProperty('appSecret');
      });

      // Retrieve individual accounts (with decryption)
      const account1 = manager.getAccount('account1');
      expect(account1).not.toBeNull();
      expect(account1!.name).toBe('account1');
      expect(account1!.appId).toBe('testAppId123');
      expect(account1!.appSecret).toBe('secretKey123456789');
      expect(account1!.userId).toBe('user1');

      const account2 = manager.getAccount('account2');
      expect(account2).not.toBeNull();
      expect(account2!.name).toBe('account2');
      expect(account2!.appId).toBe('testAppId456');
      expect(account2!.appSecret).toBe('secretKey456789012');
      expect(account2!).not.toHaveProperty('userId');

      // Remove account
      const removeResult = manager.removeAccount('account1');
      expect(removeResult.success).toBe(true);
      expect(manager.accountExists('account1')).toBe(false);
      expect(manager.accountExists('account2')).toBe(true);

      // Verify account is really gone
      expect(manager.getAccount('account1')).toBeNull();
    });

    it('should handle duplicate account names', () => {
      // Add account  
      const result1 = manager.addAccount('duplicate', 'appId123', 'secret1234567890123');
      expect(result1.success).toBe(true);

      // Try to add with same name
      const result2 = manager.addAccount('duplicate', 'appId456', 'secret2345678901234');
      expect(result2.success).toBe(false);
      expect(result2.message).toContain('already exists');

      // Original account should be unchanged
      const account = manager.getAccount('duplicate');
      expect(account!.appId).toBe('appId123');
      expect(account!.appSecret).toBe('secret1234567890123');
    });

    it('should validate input parameters', () => {
      // Invalid account name
      const result1 = manager.addAccount('', 'validAppId123', 'secret1234567890123');
      expect(result1.success).toBe(false);
      expect(result1.message).toContain('Account name is required');

      // Invalid app ID
      const result2 = manager.addAccount('test', 'invalid!', 'secret1234567890123');
      expect(result2.success).toBe(false);
      expect(result2.message).toContain('App ID can only contain letters and numbers');

      // Too short secret
      const result3 = manager.addAccount('test', 'validAppId123', 'short');
      expect(result3.success).toBe(false);
      expect(result3.message).toContain('App Secret must be between');
    });
  });

  describe('file encryption and security', () => {
    it('should store secrets encrypted on disk', () => {
      // Add account
      manager.addAccount('encrypted-test', 'testAppId123', 'plainTextSecret1234567890');

      // Read raw file content
      expect(fs.existsSync(configPath)).toBe(true);
      const rawContent = fs.readFileSync(configPath, 'utf8');
      const parsed = JSON.parse(rawContent);

      // Verify structure
      expect(parsed.version).toBe('1.0');
      expect(parsed.accounts['encrypted-test']).toBeDefined();
      expect(parsed.metadata).toBeDefined();

      // Verify secret is encrypted
      const account = parsed.accounts['encrypted-test'];
      expect(account.appSecret).toEqual({
        algorithm: 'aes-256-gcm',
        iv: expect.any(String),
        authTag: expect.any(String),
        encrypted: expect.any(String)
      });

      // Verify plain text secret is not in file
      expect(rawContent).not.toContain('plainTextSecret1234567890');

      // Verify decryption works
      const decryptedAccount = manager.getAccount('encrypted-test');
      expect(decryptedAccount!.appSecret).toBe('plainTextSecret1234567890');
    });

    it('should work with different encryption keys', () => {
      // Add account with first key
      manager.addAccount('key-test', 'appId123', 'secret1234567890123456');
      
      // Verify it works
      const account = manager.getAccount('key-test');
      expect(account!.appSecret).toBe('secret1234567890123456');

      // Create manager with different key
      const differentKeyManager = new SecureAccountManager(configPath, 'different-key-456');
      
      // Should fail to decrypt
      expect(() => differentKeyManager.getAccount('key-test')).toThrow(/decrypt|key/i);
    });

    it('should handle missing encryption key gracefully', () => {
      // Remove environment variable
      delete process.env['POLYV_MASTER_KEY'];
      
      // Create manager without explicit key (should use generated key)
      const generatedKeyManager = new SecureAccountManager(configPath);
      
      // Should still work (uses generated key)
      const result = generatedKeyManager.addAccount('generated-key-test', 'appId123', 'secret1234567890123456');
      expect(result.success).toBe(true);
      
      const account = generatedKeyManager.getAccount('generated-key-test');
      expect(account!.appSecret).toBe('secret1234567890123456');
    });
  });

  describe('file permission management', () => {
    it('should set secure file permissions', () => {
      // Add account to create file
      manager.addAccount('permission-test', 'appId123', 'secret1234567890123456');

      // Check file exists
      expect(fs.existsSync(configPath)).toBe(true);

      // On Unix systems, check permissions
      if (os.platform() !== 'win32') {
        const stats = fs.statSync(configPath);
        const mode = stats.mode & parseInt('777', 8);
        expect(mode).toBe(0o600); // Owner read/write only
      }
    });

    it('should create secure directory structure', () => {
      const deepConfigPath = path.join(tempDir, 'deep', 'nested', 'accounts.json');
      const deepManager = new SecureAccountManager(deepConfigPath);

      // Add account to trigger directory creation
      const result = deepManager.addAccount('deep-test', 'appId123', 'secret1234567890123456');
      expect(result.success).toBe(true);

      // Verify directory structure exists
      expect(fs.existsSync(path.dirname(deepConfigPath))).toBe(true);
      expect(fs.existsSync(deepConfigPath)).toBe(true);

      // On Unix systems, check directory permissions
      if (os.platform() !== 'win32') {
        const dirStats = fs.statSync(path.dirname(deepConfigPath));
        const dirMode = dirStats.mode & parseInt('777', 8);
        expect(dirMode).toBe(0o700); // Owner access only
      }
    });
  });

  describe('configuration versioning and migration', () => {
    it('should handle version compatibility', () => {
      // Create current version config
      manager.addAccount('version-test', 'appId123', 'secret1234567890123456');

      // Verify version is set correctly
      const rawContent = fs.readFileSync(configPath, 'utf8');
      const parsed = JSON.parse(rawContent);
      expect(parsed.version).toBe('1.0');
    });

    it('should include security metadata', () => {
      manager.addAccount('metadata-test', 'appId123', 'secret1234567890123456');

      const rawContent = fs.readFileSync(configPath, 'utf8');
      const parsed = JSON.parse(rawContent);
      
      expect(parsed.metadata).toBeDefined();
      expect(parsed.metadata.createdAt).toBeDefined();
      expect(parsed.metadata.updatedAt).toBeDefined();
      expect(parsed.metadata.keySource).toBe('environment');
      expect(parsed.metadata.security).toBeDefined();
      expect(parsed.metadata.security.encryptionVersion).toBe('1.0');
      expect(parsed.metadata.security.keySource).toBe('environment');
      expect(parsed.metadata.security.lastSecurityCheck).toBeDefined();
    });
  });

  describe('backup and recovery', () => {
    it('should create backups when saving', () => {
      // Add initial account
      manager.addAccount('backup-test', 'appId123', 'secret1234567890123456');
      
      // Add another account (should trigger backup)
      manager.addAccount('backup-test2', 'appId456', 'secret4567890123456');

      // Check for backup files
      const configDir = path.dirname(configPath);
      const files = fs.readdirSync(configDir);
      const backupFiles = files.filter(f => f.includes('.backup.'));
      
      expect(backupFiles.length).toBeGreaterThan(0);
      
      // Verify backup is valid
      const backupPath = path.join(configDir, backupFiles[0]);
      const backupContent = fs.readFileSync(backupPath, 'utf8');
      const backupParsed = JSON.parse(backupContent);
      
      expect(backupParsed.accounts).toBeDefined();
      expect(backupParsed.version).toBeDefined();
    });
  });

  describe('security validation', () => {
    it('should validate overall security', () => {
      // Add account
      manager.addAccount('security-test', 'appId123', 'secret1234567890123456');

      // Check security context
      const context = manager.getSecurityContext();
      expect(context.encryptionEnabled).toBe(true);
      expect(context.keySource).toBe('environment');
      expect(context.configVersion).toBe('1.0');
      expect(context.permissionsValid).toBe(true);

      // Validate security
      const validation = manager.validateSecurity();
      expect(validation.isSecure).toBe(true);
      expect(validation.issues).toHaveLength(0);
      expect(validation.recommendations).toHaveLength(0);
    });

    it('should perform security maintenance', () => {
      // Add account
      manager.addAccount('maintenance-test', 'appId123', 'secret1234567890123456');

      // Perform maintenance
      const result = manager.performSecurityMaintenance();
      expect(result.success).toBe(true);
      expect(result.actionsPerformed.length).toBeGreaterThan(0);
    });
  });

  describe('error handling and recovery', () => {
    it('should handle corrupted configuration gracefully', () => {
      // Create corrupted file
      fs.writeFileSync(configPath, 'invalid json {', 'utf8');

      // Should throw appropriate error about configuration corruption
      expect(() => manager.loadAccountsStore()).toThrow(/Configuration file.*corrupted/);
    });

    it('should handle missing configuration file', () => {
      // Try to load non-existent config
      const store = manager.loadAccountsStore();
      
      // Should create empty store
      expect(store.version).toBe('1.0');
      expect(store.accounts).toEqual({});
      expect(store.metadata).toBeDefined();
    });

    it('should handle permission errors gracefully', () => {
      // This test is platform-specific and may not work on all systems
      // but it demonstrates the error handling approach
      if (os.platform() !== 'win32') {
        // Create file with wrong permissions
        fs.writeFileSync(configPath, '{}', 'utf8');
        fs.chmodSync(configPath, 0o000); // No permissions

        try {
          // This might fail due to permissions
          manager.loadAccountsStore();
        } catch (error) {
          // Should provide helpful error message
          expect(error).toBeInstanceOf(Error);
          expect((error as Error).message).toContain('Failed to load');
        } finally {
          // Restore permissions for cleanup
          fs.chmodSync(configPath, 0o600);
        }
      }
    });
  });

  describe('encryption component integration', () => {
    it('should work with AccountEncryption directly', () => {
      const encryption = new AccountEncryptionImpl('test-encryption-key-123');
      
      // Test encryption
      const plaintext = 'test-secret-data';
      const encrypted = encryption.encrypt(plaintext);
      
      expect(encrypted.algorithm).toBe('aes-256-gcm');
      expect(encrypted.iv).toBeTruthy();
      expect(encrypted.authTag).toBeTruthy();
      expect(encrypted.encrypted).toBeTruthy();
      
      // Test decryption
      const decrypted = encryption.decrypt(encrypted);
      expect(decrypted).toBe(plaintext);
      
      // Test with different instance (same key)
      const encryption2 = new AccountEncryptionImpl('test-encryption-key-123');
      const decrypted2 = encryption2.decrypt(encrypted);
      expect(decrypted2).toBe(plaintext);
    });

    it('should work with FilePermissionManager directly', () => {
      const permissionManager = new FilePermissionManager();
      
      // Create test file
      fs.writeFileSync(configPath, 'test content', 'utf8');
      
      // Check permissions
      const validation = permissionManager.validatePermissions(configPath);
      
      if (os.platform() !== 'win32') {
        // On Unix systems, we can test actual permission validation
        expect(validation.isValid).toBeDefined();
        expect(validation.message).toBeTruthy();
      } else {
        // On Windows, should handle gracefully
        expect(validation).toBeDefined();
      }
    });

    it('should work with ConfigVersionManager directly', () => {
      const versionManager = new ConfigVersionManager();
      
      // Test version detection
      const config = {
        version: '1.0',
        accounts: {},
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };
      
      const detectedVersion = versionManager.detectVersion(config);
      expect(detectedVersion).toBe('1.0');
      
      const validation = versionManager.validateVersion(config);
      expect(validation.isValid).toBe(true);
      expect(validation.compatibility).toBe('compatible');
    });

    it('should work with ConfigRecoveryManager directly', () => {
      const recoveryManager = new ConfigRecoveryManager();
      
      // Create valid config file
      const validConfig = {
        version: '1.0',
        accounts: {},
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };
      fs.writeFileSync(configPath, JSON.stringify(validConfig, null, 2), 'utf8');
      
      // Check integrity
      const integrity = recoveryManager.checkIntegrity(configPath);
      expect(integrity.isValid).toBe(true);
      expect(integrity.validationDetails.fileAccessible).toBe(true);
      expect(integrity.validationDetails.validJson).toBe(true);
      expect(integrity.validationDetails.validStructure).toBe(true);
    });
  });

  describe('cross-platform compatibility', () => {
    it('should work on current platform', () => {
      // Add account
      const result = manager.addAccount('platform-test', 'appId123', 'secret1234567890123456');
      expect(result.success).toBe(true);

      // Verify it works
      const account = manager.getAccount('platform-test');
      expect(account).not.toBeNull();
      expect(account!.appSecret).toBe('secret1234567890123456');

      // Verify file exists and is readable
      expect(fs.existsSync(configPath)).toBe(true);
      const content = fs.readFileSync(configPath, 'utf8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it('should handle platform-specific path separators', () => {
      const platformPath = path.join(tempDir, 'subdir', 'accounts.json');
      const platformManager = new SecureAccountManager(platformPath);

      const result = platformManager.addAccount('path-test', 'appId123', 'secret1234567890123456');
      expect(result.success).toBe(true);

      expect(fs.existsSync(platformPath)).toBe(true);
    });
  });
});