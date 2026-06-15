/**
 * Secure Account Configuration Manager
 * Integrates all security components for comprehensive account management
 * 
 * Features:
 * - AES-256-GCM encryption for sensitive data
 * - File permission management
 * - Configuration versioning and migration
 * - Recovery and backup mechanisms
 * - Security context tracking
 * 
 * @fileoverview Secure account management integration for story 6.4
 * @author Development Team
 * @since 1.0.0
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { 
  AccountConfig, 
  AccountsStore, 
  AccountOperationResult, 
  AccountDisplayInfo, 
  AccountConfigValidation,
  SecurityContext
} from '../types/account.types';
import { AccountEncryptionImpl, EncryptedData } from './account-encryption';
import { FilePermissionManager } from './file-permission-manager';
import { ConfigVersionManager } from './config-version-manager';
import { ConfigRecoveryManager } from './config-recovery-manager';

/**
 * Enhanced account configuration for secure storage
 */
interface SecureAccountConfig extends Omit<AccountConfig, 'appSecret'> {
  /** Encrypted app secret using new format */
  appSecret: EncryptedData | string; // Support both new and legacy formats
}

/**
 * Secure accounts store with enhanced metadata
 */
interface SecureAccountsStore extends Omit<AccountsStore, 'accounts'> {
  accounts: Record<string, SecureAccountConfig>;
  metadata: AccountsStore['metadata'] & {
    /** Security metadata */
    security?: {
      encryptionVersion: string;
      keySource: 'environment' | 'generated';
      lastSecurityCheck?: string;
      lastBackup?: string;
    };
  };
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG = {
  version: '1.0',
  configDir: '.polyv',
  configFileName: 'accounts.json',
  filePermissions: 0o600,
  dirPermissions: 0o700
} as const;

/**
 * Secure Account Configuration Manager
 */
export class SecureAccountManager {
  private configPath: string;
  private encryption: AccountEncryptionImpl;
  private permissionManager: FilePermissionManager;
  private versionManager: ConfigVersionManager;
  private recoveryManager: ConfigRecoveryManager;

  /**
   * Initialize SecureAccountManager
   * @param configPath Optional custom config directory or file path
   * @param masterKey Optional master key for encryption
   */
  constructor(configPath?: string, masterKey?: string) {
    // Initialize configuration path
    if (configPath) {
      this.configPath = configPath.endsWith('.json') 
        ? configPath 
        : path.join(configPath, DEFAULT_CONFIG.configFileName);
    } else {
      this.configPath = this.getDefaultConfigPath();
    }

    // Initialize security components
    this.encryption = new AccountEncryptionImpl(masterKey);
    this.permissionManager = new FilePermissionManager();
    this.versionManager = new ConfigVersionManager();
    this.recoveryManager = new ConfigRecoveryManager();
  }

  /**
   * Get default configuration file path
   * @returns Default config file path
   */
  private getDefaultConfigPath(): string {
    const homeDir = process.env['HOME'] || os.homedir();
    const configDir = path.join(homeDir, DEFAULT_CONFIG.configDir);
    return path.join(configDir, DEFAULT_CONFIG.configFileName);
  }

  /**
   * Ensure configuration directory exists with secure permissions
   */
  private ensureSecureConfigDir(): void {
    const configDir = path.dirname(this.configPath);
    const dirResult = this.permissionManager.ensureSecureDirectory(configDir);
    
    if (!dirResult.success) {
      throw new Error(`Failed to create secure configuration directory: ${dirResult.message}`);
    }
  }

  /**
   * Load and validate accounts store
   * @returns Secure accounts store
   */
  public loadAccountsStore(): SecureAccountsStore {
    try {
      if (!fs.existsSync(this.configPath)) {
        return this.createEmptySecureStore();
      }

      // Check file integrity first
      const integrity = this.recoveryManager.checkIntegrity(this.configPath);
      if (!integrity.isValid) {
        throw new Error(`Configuration file integrity check failed: ${integrity.message}`);
      }

      const fileContent = fs.readFileSync(this.configPath, 'utf8');
      const store: SecureAccountsStore = JSON.parse(fileContent);

      // Validate version compatibility
      const versionCheck = this.versionManager.validateVersion(store);
      if (!versionCheck.isValid && versionCheck.compatibility === 'incompatible') {
        throw new Error(`Incompatible configuration version: ${versionCheck.message}`);
      }

      // Migrate if needed
      if (this.versionManager.isMigrationRequired(store)) {
        return this.migrateConfiguration(store);
      }

      // Update security metadata
      this.updateSecurityMetadata(store);

      return store;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON in accounts configuration file: ${error.message}`);
      }
      throw new Error(`Failed to load accounts configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Save accounts store with security measures
   * @param store Secure accounts store to save
   */
  public saveAccountsStore(store: SecureAccountsStore): void {
    try {
      this.ensureSecureConfigDir();

      // Update metadata
      store.metadata.updatedAt = new Date().toISOString();
      this.updateSecurityMetadata(store);

      // Create backup before saving
      if (fs.existsSync(this.configPath)) {
        const backupPath = this.recoveryManager.createBackup(this.configPath);
        if (backupPath) {
          store.metadata.lastBackup = new Date().toISOString();
        }
      }

      // Write to temporary file first (atomic operation)
      const tempPath = `${this.configPath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(store, null, 2), 'utf8');

      // Set secure permissions on temp file
      const permissionResult = this.permissionManager.setSecurePermissions(tempPath, false);
      if (!permissionResult.success) {
        fs.unlinkSync(tempPath); // Clean up temp file
        throw new Error(`Failed to set secure permissions: ${permissionResult.message}`);
      }

      // Move temp file to final location (atomic on most systems)
      fs.renameSync(tempPath, this.configPath);

    } catch (error) {
      throw new Error(`Failed to save accounts configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create empty secure accounts store
   * @returns Empty secure store
   */
  private createEmptySecureStore(): SecureAccountsStore {
    const now = new Date().toISOString();
    return {
      version: DEFAULT_CONFIG.version,
      accounts: {},
      metadata: {
        createdAt: now,
        updatedAt: now,
        keySource: this.encryption.getKeySource(),
        security: {
          encryptionVersion: '1.0',
          keySource: this.encryption.getKeySource(),
          lastSecurityCheck: now
        }
      }
    };
  }

  /**
   * Update security metadata in store
   * @param store Store to update
   */
  private updateSecurityMetadata(store: SecureAccountsStore): void {
    if (!store.metadata.security) {
      store.metadata.security = {
        encryptionVersion: '1.0',
        keySource: this.encryption.getKeySource()
      };
    }
    store.metadata.security.lastSecurityCheck = new Date().toISOString();
    store.metadata.keySource = this.encryption.getKeySource();
  }

  /**
   * Migrate configuration to current version
   * @param store Old configuration store
   * @returns Migrated secure store
   */
  private migrateConfiguration(store: any): SecureAccountsStore {
    const currentVersion = this.versionManager.getCurrentVersion();
    const detectedVersion = this.versionManager.detectVersion(store);
    
    const migrationResult = this.versionManager.migrateConfiguration(
      store,
      detectedVersion,
      currentVersion
    );

    if (!migrationResult.success) {
      throw new Error(`Configuration migration failed: ${migrationResult.message}`);
    }

    const migratedStore = migrationResult.migratedConfig as SecureAccountsStore;
    
    // Re-encrypt accounts if needed
    if (migrationResult.steps.some(step => step.includes('encryption'))) {
      this.reencryptAccounts(migratedStore);
    }

    return migratedStore;
  }

  /**
   * Re-encrypt accounts with new encryption format
   * @param store Store to re-encrypt
   */
  private reencryptAccounts(store: SecureAccountsStore): void {
    for (const accountName in store.accounts) {
      const account = store.accounts[accountName];
      
      if (account && ((account as any)._needsReencryption || (account as any)._needsEncryption)) {
        // This would require the old encryption system to decrypt first
        // For now, we'll mark it as needing manual re-entry
        account.appSecret = {
          algorithm: 'aes-256-gcm',
          iv: '',
          authTag: '',
          encrypted: ''
        } as EncryptedData;
        
        // Add migration flag
        (account as any)._migrationRequired = true;
      }
    }
  }

  /**
   * Add new account with enhanced security
   * @param name Account name
   * @param appId Application ID
   * @param appSecret Application secret (will be encrypted)
   * @param userId Optional user ID
   * @returns Operation result
   */
  public addAccount(name: string, appId: string, appSecret: string, userId?: string): AccountOperationResult {
    try {
      // Validate input
      this.validateAccountConfig({ name, appId, appSecret });

      // Load existing store
      const store = this.loadAccountsStore();

      // Check if account already exists
      if (store.accounts[name]) {
        return {
          success: false,
          message: `Account '${name}' already exists. Use a different name or remove the existing account first.`
        };
      }

      // Encrypt app secret with new format
      const encryptedSecret = this.encryption.encrypt(appSecret);

      // Create secure account config
      const now = new Date().toISOString();
      const accountConfig: SecureAccountConfig = {
        name,
        appId,
        appSecret: encryptedSecret,
        ...(userId && { userId }),
        createdAt: now,
        updatedAt: now
      };

      // Add to store
      store.accounts[name] = accountConfig;

      // Save store with security measures
      this.saveAccountsStore(store);

      // Return success without actual secret
      const displayAccount: AccountConfig = {
        ...accountConfig,
        appSecret: '[encrypted]'
      };

      return {
        success: true,
        message: `Account '${name}' added successfully with enhanced security.`,
        account: displayAccount
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get account configuration with decryption
   * @param name Account name
   * @returns Decrypted account configuration or null if not found
   */
  public getAccount(name: string): AccountConfig | null {
    try {
      const store = this.loadAccountsStore();
      const account = store.accounts[name];

      if (!account) {
        return null;
      }

      // Check if account needs migration
      if ((account as any)._migrationRequired) {
        throw new Error(`Account '${name}' requires migration. Please re-add this account.`);
      }

      // Decrypt app secret
      let decryptedSecret: string;
      if (typeof account.appSecret === 'object' && account.appSecret.algorithm === 'aes-256-gcm') {
        // New format
        decryptedSecret = this.encryption.decrypt(account.appSecret);
      } else if (typeof account.appSecret === 'string') {
        // Legacy format - try to handle gracefully
        throw new Error(`Account '${name}' uses legacy encryption format. Please re-add this account.`);
      } else {
        throw new Error(`Account '${name}' has invalid encryption format.`);
      }

      return {
        name: account.name,
        appId: account.appId,
        appSecret: decryptedSecret,
        ...(account.userId && { userId: account.userId }),
        createdAt: account.createdAt,
        updatedAt: account.updatedAt
      };

    } catch (error) {
      throw new Error(`Failed to get account '${name}': ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Remove account configuration
   * @param name Account name to remove
   * @returns Operation result
   */
  public removeAccount(name: string): AccountOperationResult {
    try {
      const store = this.loadAccountsStore();

      if (!store.accounts[name]) {
        return {
          success: false,
          message: `Account '${name}' not found.`
        };
      }

      // Remove account
      delete store.accounts[name];

      // Save store
      this.saveAccountsStore(store);

      return {
        success: true,
        message: `Account '${name}' removed successfully.`
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * List all accounts (without sensitive information)
   * @returns Array of account display information
   */
  public listAccounts(): AccountDisplayInfo[] {
    try {
      const store = this.loadAccountsStore();
      
      return Object.values(store.accounts).map(account => ({
        name: account.name,
        appId: account.appId,
        ...(account.userId && { userId: account.userId }),
        createdAt: account.createdAt,
        updatedAt: account.updatedAt
      }));

    } catch (error) {
      throw new Error(`Failed to list accounts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if account exists
   * @param name Account name
   * @returns True if account exists, false otherwise
   */
  public accountExists(name: string): boolean {
    try {
      const store = this.loadAccountsStore();
      return name in store.accounts;
    } catch {
      return false;
    }
  }

  /**
   * Get security context for current configuration
   * @returns Security context information
   */
  public getSecurityContext(): SecurityContext {
    try {
      const store = this.loadAccountsStore();
      const permissionValidation = this.permissionManager.validatePermissions(this.configPath);
      
      return {
        encryptionEnabled: true,
        keySource: this.encryption.getKeySource(),
        configVersion: store.version,
        lastSecurityCheck: new Date(),
        permissionsValid: permissionValidation.isValid
      };
    } catch {
      return {
        encryptionEnabled: false,
        keySource: 'generated',
        configVersion: 'unknown',
        lastSecurityCheck: new Date(),
        permissionsValid: false
      };
    }
  }

  /**
   * Validate configuration security
   * @returns Security validation result
   */
  public validateSecurity(): {
    isSecure: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // Check file integrity
      const integrity = this.recoveryManager.checkIntegrity(this.configPath);
      if (!integrity.isValid) {
        issues.push(`Configuration integrity: ${integrity.message}`);
        recommendations.push('Run: polyv-live-cli config recover');
      }

      // Check permissions
      const permissionValidation = this.permissionManager.validatePermissions(this.configPath);
      if (!permissionValidation.isValid) {
        issues.push(`File permissions: ${permissionValidation.message}`);
        recommendations.push(...permissionValidation.recommendations);
      }

      // Check encryption
      if (!this.encryption.testEncryption()) {
        issues.push('Encryption system is not functioning properly');
        recommendations.push('Check POLYV_MASTER_KEY environment variable');
      }

      // Check version compatibility
      const store = this.loadAccountsStore();
      const versionCheck = this.versionManager.validateVersion(store);
      if (!versionCheck.isValid) {
        issues.push(`Version compatibility: ${versionCheck.message}`);
        recommendations.push(...versionCheck.requiredActions);
      }

    } catch (error) {
      issues.push(`Security validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      recommendations.push('Check configuration file and permissions');
    }

    return {
      isSecure: issues.length === 0,
      issues,
      recommendations
    };
  }

  /**
   * Get configuration file path
   * @returns Configuration file path
   */
  public getConfigPath(): string {
    return this.configPath;
  }

  /**
   * Perform security maintenance
   * @returns Maintenance result
   */
  public performSecurityMaintenance(): {
    success: boolean;
    actionsPerformed: string[];
    warnings: string[];
  } {
    const actionsPerformed: string[] = [];
    const warnings: string[] = [];

    try {
      // Fix permissions if needed
      const permissionResult = this.permissionManager.repairConfigurationFile(this.configPath);
      if (permissionResult.success) {
        actionsPerformed.push('Fixed file permissions');
      } else {
        warnings.push(`Could not fix permissions: ${permissionResult.message}`);
      }

      // Create backup
      const backupPath = this.recoveryManager.createBackup(this.configPath);
      if (backupPath) {
        actionsPerformed.push(`Created backup: ${backupPath}`);
      } else {
        warnings.push('Could not create backup');
      }

      // Update security metadata
      if (fs.existsSync(this.configPath)) {
        const store = this.loadAccountsStore();
        this.updateSecurityMetadata(store);
        this.saveAccountsStore(store);
        actionsPerformed.push('Updated security metadata');
      }

      return {
        success: true,
        actionsPerformed,
        warnings
      };

    } catch (error) {
      return {
        success: false,
        actionsPerformed,
        warnings: [`Security maintenance failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Validate account configuration input
   * @param config Account configuration to validate
   * @throws Error if validation fails
   */
  private validateAccountConfig(config: Partial<AccountConfig>): void {
    const { name, appId, appSecret } = config;

    // Validate name
    if (!name || typeof name !== 'string') {
      throw new Error('Account name is required and must be a string');
    }
    if (!AccountConfigValidation.name.pattern.test(name)) {
      throw new Error('Account name can only contain letters, numbers, underscores, and hyphens');
    }
    if (name.length > AccountConfigValidation.name.maxLength) {
      throw new Error(`Account name must be ${AccountConfigValidation.name.maxLength} characters or less`);
    }

    // Validate appId
    if (!appId || typeof appId !== 'string') {
      throw new Error('App ID is required and must be a string');
    }
    if (!AccountConfigValidation.appId.pattern.test(appId)) {
      throw new Error('App ID can only contain letters and numbers');
    }
    if (appId.length < AccountConfigValidation.appId.minLength || 
        appId.length > AccountConfigValidation.appId.maxLength) {
      throw new Error(`App ID must be between ${AccountConfigValidation.appId.minLength} and ${AccountConfigValidation.appId.maxLength} characters`);
    }

    // Validate appSecret
    if (!appSecret || typeof appSecret !== 'string') {
      throw new Error('App Secret is required and must be a string');
    }
    if (appSecret.length < AccountConfigValidation.appSecret.minLength || 
        appSecret.length > AccountConfigValidation.appSecret.maxLength) {
      throw new Error(`App Secret must be between ${AccountConfigValidation.appSecret.minLength} and ${AccountConfigValidation.appSecret.maxLength} characters`);
    }
  }
}

/**
 * Create secure account manager instance
 * @param configPath Optional config path
 * @param masterKey Optional master key
 * @returns SecureAccountManager instance
 */
export function createSecureAccountManager(configPath?: string, masterKey?: string): SecureAccountManager {
  return new SecureAccountManager(configPath, masterKey);
}

/**
 * Default secure account manager instance
 */
export const defaultSecureAccountManager = createSecureAccountManager();