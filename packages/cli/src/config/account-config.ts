/**
 * Account configuration manager for multi-account management
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { AccountConfig, AccountsStore, AccountOperationResult, AccountDisplayInfo, AccountConfigValidation } from '../types/account.types';
import { AccountCrypto } from './account-crypto';

/**
 * Default configuration values
 */
const DEFAULT_CONFIG = {
  version: '1.0.0',
  configDir: '.polyv',
  configFileName: 'accounts.json',
  filePermissions: 0o600 // 仅用户可读写
} as const;

/**
 * Account configuration manager class
 */
export class AccountConfigManager {
  private configPath: string;
  private crypto: AccountCrypto;

  /**
   * Initialize AccountConfigManager
   * @param configPath Optional custom config directory or file path
   * @param masterKey Optional master key for encryption
   */
  constructor(configPath?: string, masterKey?: string) {
    if (configPath) {
      // If configPath ends with .json, treat it as a file path
      // Otherwise, treat it as a directory and append the default filename
      if (configPath.endsWith('.json')) {
        this.configPath = configPath;
      } else {
        this.configPath = path.join(configPath, DEFAULT_CONFIG.configFileName);
      }
    } else {
      this.configPath = this.getDefaultConfigPath();
    }
    this.crypto = new AccountCrypto(masterKey);
  }

  /**
   * Get default configuration file path
   * @returns Default config file path
   */
  private getDefaultConfigPath(): string {
    // Respect HOME environment variable for testing isolation
    const homeDir = process.env['HOME'] || os.homedir();
    const configDir = path.join(homeDir, DEFAULT_CONFIG.configDir);
    return path.join(configDir, DEFAULT_CONFIG.configFileName);
  }

  /**
   * Ensure configuration directory exists
   */
  private ensureConfigDir(): void {
    const configDir = path.dirname(this.configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true, mode: 0o700 });
    }
  }

  /**
   * Set file permissions to secure mode (600)
   * @param filePath File path to set permissions
   */
  private setSecurePermissions(filePath: string): void {
    try {
      fs.chmodSync(filePath, DEFAULT_CONFIG.filePermissions);
    } catch (error) {
      // On Windows, chmod might not work as expected, but we'll continue
      console.warn(`Warning: Could not set file permissions for ${filePath}`);
    }
  }

  /**
   * Validate account configuration
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

  /**
   * Load accounts store from file
   * @returns Accounts store or empty store if file doesn't exist
   */
  public loadAccountsStore(): AccountsStore {
    try {
      if (!fs.existsSync(this.configPath)) {
        return this.createEmptyStore();
      }

      const fileContent = fs.readFileSync(this.configPath, 'utf8');
      const store: AccountsStore = JSON.parse(fileContent);

      // Validate store structure
      if (!store.version || !store.accounts || !store.metadata) {
        throw new Error('Invalid accounts store format');
      }

      return store;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON in accounts configuration file: ${error.message}`);
      }
      throw new Error(`Failed to load accounts configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Save accounts store to file
   * @param store Accounts store to save
   */
  public saveAccountsStore(store: AccountsStore): void {
    try {
      this.ensureConfigDir();
      
      // Update metadata
      store.metadata.updatedAt = new Date().toISOString();
      
      // Write to temporary file first (atomic operation)
      const tempPath = `${this.configPath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(store, null, 2), 'utf8');
      
      // Set secure permissions on temp file
      this.setSecurePermissions(tempPath);
      
      // Move temp file to final location (atomic on most systems)
      fs.renameSync(tempPath, this.configPath);
      
    } catch (error) {
      throw new Error(`Failed to save accounts configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create empty accounts store
   * @returns Empty accounts store
   */
  private createEmptyStore(): AccountsStore {
    const now = new Date().toISOString();
    return {
      version: DEFAULT_CONFIG.version,
      accounts: {},
      metadata: {
        createdAt: now,
        updatedAt: now
      }
    };
  }

  /**
   * Add new account configuration
   * @param name Account name
   * @param appId Application ID
   * @param appSecret Application secret (will be encrypted)
   * @param userId Optional user ID
   * @param environment Optional environment type
   * @param baseUrl Optional custom base URL
   * @returns Operation result
   */
  public addAccount(name: string, appId: string, appSecret: string, userId?: string, environment?: string, baseUrl?: string): AccountOperationResult {
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

      // Encrypt app secret
      const encryptedSecret = this.crypto.encryptSimple(appSecret);

      // Create account config
      const now = new Date().toISOString();
      const accountConfig: AccountConfig = {
        name,
        appId,
        appSecret: encryptedSecret,
        ...(userId && { userId }),
        ...(environment && { environment: environment as any }),
        ...(baseUrl && { baseUrl }),
        createdAt: now,
        updatedAt: now
      };

      // Add to store
      store.accounts[name] = accountConfig;

      // Save store
      this.saveAccountsStore(store);

      return {
        success: true,
        message: `Account '${name}' added successfully.`,
        account: { ...accountConfig, appSecret: '[encrypted]' } // Don't return actual secret
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
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
   * Get account configuration by name
   * @param name Account name
   * @returns Account configuration with decrypted secret or null if not found
   */
  public getAccount(name: string): AccountConfig | null {
    try {
      const store = this.loadAccountsStore();
      const account = store.accounts[name];

      if (!account) {
        return null;
      }

      // Decrypt app secret
      const decryptedSecret = this.crypto.decryptSimple(account.appSecret);

      return {
        ...account,
        appSecret: decryptedSecret
      };

    } catch (error) {
      throw new Error(`Failed to get account '${name}': ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        ...(account.environment && { environment: account.environment }),
        ...(account.baseUrl && { baseUrl: account.baseUrl }),
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
   * Get configuration file path
   * @returns Configuration file path
   */
  public getConfigPath(): string {
    return this.configPath;
  }

  /**
   * Backup configuration file
   * @param backupPath Optional backup file path
   * @returns Backup file path
   */
  public backupConfig(backupPath?: string): string {
    const backup = backupPath || `${this.configPath}.backup.${Date.now()}`;
    
    if (fs.existsSync(this.configPath)) {
      fs.copyFileSync(this.configPath, backup);
      this.setSecurePermissions(backup);
    }
    
    return backup;
  }

  /**
   * Restore configuration from backup
   * @param backupPath Backup file path
   */
  public restoreConfig(backupPath: string): void {
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup file not found: ${backupPath}`);
    }

    this.ensureConfigDir();
    fs.copyFileSync(backupPath, this.configPath);
    this.setSecurePermissions(this.configPath);
  }

  /**
   * Validate configuration file integrity
   * @returns True if configuration is valid, false otherwise
   */
  public validateConfig(): boolean {
    try {
      const store = this.loadAccountsStore();
      
      // Test decryption of all accounts
      for (const account of Object.values(store.accounts)) {
        this.crypto.decryptSimple(account.appSecret);
      }
      
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Set default account
   * @param accountName Account name to set as default
   * @returns Operation result
   */
  public setDefaultAccount(accountName: string): AccountOperationResult {
    try {
      // Load existing store
      const store = this.loadAccountsStore();

      // Check if account exists
      if (!store.accounts[accountName]) {
        const availableAccounts = Object.keys(store.accounts);
        const suggestion = availableAccounts.length > 0 
          ? `\n\n可用账号: ${availableAccounts.join(', ')}`
          : '\n\n当前没有配置任何账号。使用 \'polyv-live-cli account add <account-name>\' 添加账号。';

        return {
          success: false,
          message: `账号 '${accountName}' 不存在。${suggestion}`
        };
      }

      // Set as default
      store.defaultAccount = accountName;

      // Save store
      this.saveAccountsStore(store);

      return {
        success: true,
        message: `已将账号 '${accountName}' 设置为默认账号。`
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '设置默认账号时发生未知错误'
      };
    }
  }

  /**
   * Unset default account
   * @returns Operation result
   */
  public unsetDefaultAccount(): AccountOperationResult {
    try {
      const store = this.loadAccountsStore();

      if (!store.defaultAccount) {
        return {
          success: false,
          message: '当前没有设置默认账号。'
        };
      }

      const previousDefault = store.defaultAccount;
      delete store.defaultAccount;

      // Save store
      this.saveAccountsStore(store);

      return {
        success: true,
        message: `已取消 '${previousDefault}' 的默认账号设置。`
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '取消默认账号时发生未知错误'
      };
    }
  }

  /**
   * Get default account name
   * @returns Default account name if set, null otherwise
   */
  public getDefaultAccount(): string | null {
    try {
      const store = this.loadAccountsStore();
      return store.defaultAccount || null;
    } catch {
      return null;
    }
  }

  /**
   * Get default account configuration
   * @returns Default account configuration with decrypted secret or null if not set/found
   */
  public getDefaultAccountConfig(): AccountConfig | null {
    try {
      const defaultAccountName = this.getDefaultAccount();
      if (!defaultAccountName) {
        return null;
      }

      return this.getAccount(defaultAccountName);
    } catch {
      return null;
    }
  }
}
