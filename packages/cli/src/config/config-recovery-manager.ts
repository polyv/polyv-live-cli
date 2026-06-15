/**
 * Configuration Recovery Manager for handling corrupted or damaged configuration files
 * 
 * Features:
 * - Configuration file integrity validation
 * - Automatic backup and recovery mechanisms
 * - Step-by-step recovery guidance
 * - Multiple recovery strategies
 * - Configuration reconstruction assistance
 * 
 * @fileoverview Configuration recovery for story 6.4
 * @author Development Team
 * @since 1.0.0
 */

import * as fs from 'fs';
import * as path from 'path';
import { AccountsStore } from '../types/account.types';
import { ConfigVersionManager } from './config-version-manager';
import { FilePermissionManager } from './file-permission-manager';

/**
 * Configuration integrity check result
 */
export interface IntegrityCheckResult {
  /** Whether configuration is valid */
  isValid: boolean;
  /** Check result message */
  message: string;
  /** Detected issues */
  issues: ConfigurationIssue[];
  /** Validation details */
  validationDetails: {
    /** File exists and readable */
    fileAccessible: boolean;
    /** Valid JSON format */
    validJson: boolean;
    /** Has required structure */
    validStructure: boolean;
    /** Encryption data is valid */
    validEncryption: boolean;
    /** File permissions are secure */
    securePermissions: boolean;
  };
}

/**
 * Configuration issue details
 */
export interface ConfigurationIssue {
  /** Issue type */
  type: 'file_access' | 'json_format' | 'structure' | 'encryption' | 'permissions' | 'version';
  /** Issue severity */
  severity: 'critical' | 'warning' | 'info';
  /** Issue description */
  description: string;
  /** Suggested fix */
  suggestedFix: string;
  /** Auto-fixable flag */
  autoFixable: boolean;
}

/**
 * Recovery strategy options
 */
export interface RecoveryStrategy {
  /** Strategy identifier */
  id: string;
  /** Strategy name */
  name: string;
  /** Strategy description */
  description: string;
  /** Recovery steps */
  steps: string[];
  /** Risk level */
  riskLevel: 'low' | 'medium' | 'high';
  /** Data preservation level */
  dataPreservation: 'full' | 'partial' | 'none';
}

/**
 * Recovery execution result
 */
export interface RecoveryResult {
  /** Whether recovery was successful */
  success: boolean;
  /** Recovery message */
  message: string;
  /** Strategy used */
  strategyUsed: string;
  /** Steps executed */
  stepsExecuted: string[];
  /** Warnings during recovery */
  warnings: string[];
  /** Recovered configuration */
  recoveredConfig?: AccountsStore;
  /** Backup file created */
  backupFile?: string;
}

/**
 * Backup information
 */
export interface BackupInfo {
  /** Backup file path */
  path: string;
  /** Creation timestamp */
  createdAt: string;
  /** File size in bytes */
  size: number;
  /** Backup validity */
  isValid: boolean;
  /** Version of backed up config */
  version?: string;
}

/**
 * Configuration Recovery Manager implementation
 */
export class ConfigRecoveryManager {
  private versionManager: ConfigVersionManager;
  private permissionManager: FilePermissionManager;

  /**
   * Initialize ConfigRecoveryManager
   */
  constructor() {
    this.versionManager = new ConfigVersionManager();
    this.permissionManager = new FilePermissionManager();
  }

  /**
   * Perform comprehensive integrity check on configuration file
   * @param configPath Path to configuration file
   * @returns Integrity check result
   */
  public checkIntegrity(configPath: string): IntegrityCheckResult {
    const issues: ConfigurationIssue[] = [];
    const validationDetails = {
      fileAccessible: false,
      validJson: false,
      validStructure: false,
      validEncryption: false,
      securePermissions: false
    };

    try {
      // Check file accessibility
      if (!fs.existsSync(configPath)) {
        issues.push({
          type: 'file_access',
          severity: 'critical',
          description: 'Configuration file does not exist',
          suggestedFix: 'Create a new configuration file or restore from backup',
          autoFixable: false
        });
      } else {
        validationDetails.fileAccessible = true;

        try {
          // Check JSON format
          const fileContent = fs.readFileSync(configPath, 'utf8');
          let config: any;
          
          try {
            config = JSON.parse(fileContent);
            validationDetails.validJson = true;
          } catch (jsonError) {
            issues.push({
              type: 'json_format',
              severity: 'critical',
              description: 'Configuration file contains invalid JSON',
              suggestedFix: 'Restore from backup or recreate configuration file',
              autoFixable: false
            });
            throw jsonError; // Can't continue without valid JSON
          }

          // Check structure
          if (this.validateConfigStructure(config)) {
            validationDetails.validStructure = true;
          } else {
            issues.push({
              type: 'structure',
              severity: 'critical',
              description: 'Configuration file has invalid structure',
              suggestedFix: 'Restore from backup or recreate with correct structure',
              autoFixable: false
            });
          }

          // Check encryption validity
          if (this.validateEncryptionData(config)) {
            validationDetails.validEncryption = true;
          } else {
            issues.push({
              type: 'encryption',
              severity: 'critical',
              description: 'Encrypted data in configuration is corrupted or invalid',
              suggestedFix: 'Check POLYV_MASTER_KEY environment variable or restore from backup',
              autoFixable: false
            });
          }

          // Check version compatibility
          try {
            const versionValidation = this.versionManager.validateVersion(config);
            if (!versionValidation.isValid && versionValidation.compatibility === 'incompatible') {
              issues.push({
                type: 'version',
                severity: 'warning',
                description: `Configuration version is incompatible: ${versionValidation.detectedVersion}`,
                suggestedFix: 'Update CLI or migrate configuration to compatible version',
                autoFixable: false
              });
            }
          } catch (versionError) {
            issues.push({
              type: 'version',
              severity: 'warning',
              description: 'Unable to determine configuration version',
              suggestedFix: 'Check configuration format and structure',
              autoFixable: false
            });
          }

        } catch (readError) {
          issues.push({
            type: 'file_access',
            severity: 'critical',
            description: 'Cannot read configuration file (permission denied or file corrupted)',
            suggestedFix: 'Check file permissions and integrity',
            autoFixable: false
          });
        }

        // Check file permissions
        try {
          const permissionValidation = this.permissionManager.validatePermissions(configPath);
          if (permissionValidation.isValid) {
            validationDetails.securePermissions = true;
          } else {
            issues.push({
              type: 'permissions',
              severity: 'warning',
              description: 'Configuration file has insecure permissions',
              suggestedFix: 'Run: polyv-live-cli config fix-permissions',
              autoFixable: true
            });
          }
        } catch (permError) {
          issues.push({
            type: 'permissions',
            severity: 'warning',
            description: 'Cannot check file permissions',
            suggestedFix: 'Manually verify file permissions are secure (600)',
            autoFixable: false
          });
        }
      }

      const isValid = issues.filter(i => i.severity === 'critical').length === 0;
      const criticalCount = issues.filter(i => i.severity === 'critical').length;
      const warningCount = issues.filter(i => i.severity === 'warning').length;

      let message: string;
      if (isValid && issues.length === 0) {
        message = 'Configuration file is healthy and valid';
      } else if (isValid) {
        message = `Configuration file is valid but has ${warningCount} warning(s)`;
      } else {
        message = `Configuration file is corrupted with ${criticalCount} critical issue(s) and ${warningCount} warning(s)`;
      }

      return {
        isValid,
        message,
        issues,
        validationDetails
      };

    } catch (error) {
      return {
        isValid: false,
        message: `Integrity check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        issues: [{
          type: 'file_access',
          severity: 'critical',
          description: 'Failed to perform integrity check',
          suggestedFix: 'Check file path and permissions',
          autoFixable: false
        }],
        validationDetails
      };
    }
  }

  /**
   * Validate configuration structure
   * @param config Configuration object to validate
   * @returns True if structure is valid
   */
  private validateConfigStructure(config: any): boolean {
    if (!config || typeof config !== 'object') {
      return false;
    }

    // Check required top-level fields
    if (!config.version || typeof config.version !== 'string') {
      return false;
    }

    if (!config.accounts || typeof config.accounts !== 'object') {
      return false;
    }

    if (!config.metadata || typeof config.metadata !== 'object') {
      return false;
    }

    // Check metadata structure
    if (!config.metadata.createdAt || typeof config.metadata.createdAt !== 'string') {
      return false;
    }

    if (!config.metadata.updatedAt || typeof config.metadata.updatedAt !== 'string') {
      return false;
    }

    // Check account structure (if accounts exist)
    for (const accountName in config.accounts) {
      const account = config.accounts[accountName];
      if (!account || typeof account !== 'object') {
        return false;
      }

      if (!account.name || typeof account.name !== 'string') {
        return false;
      }

      if (!account.appId || typeof account.appId !== 'string') {
        return false;
      }

      if (!account.appSecret) {
        return false;
      }

      if (!account.createdAt || typeof account.createdAt !== 'string') {
        return false;
      }

      if (!account.updatedAt || typeof account.updatedAt !== 'string') {
        return false;
      }
    }

    return true;
  }

  /**
   * Validate encryption data in configuration
   * @param config Configuration object to validate
   * @returns True if encryption data is valid
   */
  private validateEncryptionData(config: any): boolean {
    if (!config.accounts) {
      return true; // No accounts to validate
    }

    try {
      // This is a basic structure check
      // Actual decryption testing would require the encryption key
      for (const accountName in config.accounts) {
        const account = config.accounts[accountName];
        if (!account.appSecret) {
          continue;
        }

        // Check if it's new format (object) or old format (string)
        if (typeof account.appSecret === 'object') {
          // New format - check structure
          if (!account.appSecret.algorithm || 
              !account.appSecret.iv || 
              !account.appSecret.authTag || 
              !account.appSecret.encrypted) {
            return false;
          }
        } else if (typeof account.appSecret === 'string') {
          // Old format - check if it's base64 encoded
          try {
            const decoded = Buffer.from(account.appSecret, 'base64').toString('utf8');
            JSON.parse(decoded); // Should be valid JSON
          } catch {
            // Might be plain text (very old format) - still valid structure-wise
          }
        } else {
          return false;
        }
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get available recovery strategies
   * @param integrityResult Integrity check result
   * @returns Array of available recovery strategies
   */
  public getRecoveryStrategies(integrityResult: IntegrityCheckResult): RecoveryStrategy[] {
    const strategies: RecoveryStrategy[] = [];

    // Strategy 1: Auto-fix minor issues
    const autoFixableIssues = integrityResult.issues.filter(i => i.autoFixable);
    if (autoFixableIssues.length > 0) {
      strategies.push({
        id: 'auto_fix',
        name: 'Auto-fix Minor Issues',
        description: 'Automatically fix permission and minor structural issues',
        steps: [
          'Fix file permissions (set to 600)',
          'Repair minor structural issues',
          'Validate configuration after fixes'
        ],
        riskLevel: 'low',
        dataPreservation: 'full'
      });
    }

    // Strategy 2: Restore from backup
    strategies.push({
      id: 'restore_backup',
      name: 'Restore from Backup',
      description: 'Restore configuration from the most recent valid backup',
      steps: [
        'Locate most recent backup file',
        'Validate backup integrity',
        'Replace current configuration with backup',
        'Set secure file permissions'
      ],
      riskLevel: 'low',
      dataPreservation: 'full'
    });

    // Strategy 3: Manual reconstruction
    if (integrityResult.validationDetails.fileAccessible && 
        integrityResult.validationDetails.validJson) {
      strategies.push({
        id: 'manual_fix',
        name: 'Manual Configuration Repair',
        description: 'Manually repair specific issues in the configuration',
        steps: [
          'Create backup of current configuration',
          'Guide through manual repair process',
          'Validate each fixed section',
          'Test encryption/decryption functionality'
        ],
        riskLevel: 'medium',
        dataPreservation: 'partial'
      });
    }

    // Strategy 4: Clean slate
    strategies.push({
      id: 'recreate',
      name: 'Create New Configuration',
      description: 'Create a completely new configuration file (data loss)',
      steps: [
        'Backup existing configuration (if possible)',
        'Create new configuration structure',
        'Guide through account re-addition process',
        'Set secure permissions and encryption'
      ],
      riskLevel: 'high',
      dataPreservation: 'none'
    });

    // Strategy 5: Key recovery
    const hasEncryptionIssues = integrityResult.issues.some(i => i.type === 'encryption');
    if (hasEncryptionIssues) {
      strategies.push({
        id: 'key_recovery',
        name: 'Encryption Key Recovery',
        description: 'Attempt to recover using different encryption keys',
        steps: [
          'Check for POLYV_MASTER_KEY environment variable',
          'Try default key generation',
          'Guide through key recovery process',
          'Test decryption with recovered key'
        ],
        riskLevel: 'medium',
        dataPreservation: 'full'
      });
    }

    return strategies;
  }

  /**
   * Execute recovery strategy
   * @param strategyId Strategy identifier
   * @param configPath Configuration file path
   * @param options Additional recovery options
   * @returns Recovery result
   */
  public executeRecovery(
    strategyId: string, 
    configPath: string, 
    options: { backupPath?: string; newMasterKey?: string } = {}
  ): RecoveryResult {
    const stepsExecuted: string[] = [];
    const warnings: string[] = [];

    try {
      switch (strategyId) {
        case 'auto_fix':
          return this.executeAutoFix(configPath, stepsExecuted, warnings);
          
        case 'restore_backup':
          return this.executeBackupRestore(configPath, options.backupPath, stepsExecuted, warnings);
          
        case 'manual_fix':
          return this.executeManualFix(configPath, stepsExecuted, warnings);
          
        case 'recreate':
          return this.executeRecreate(configPath, stepsExecuted, warnings);
          
        case 'key_recovery':
          return this.executeKeyRecovery(configPath, options.newMasterKey, stepsExecuted, warnings);
          
        default:
          return {
            success: false,
            message: `Unknown recovery strategy: ${strategyId}`,
            strategyUsed: strategyId,
            stepsExecuted,
            warnings
          };
      }
    } catch (error) {
      return {
        success: false,
        message: `Recovery failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        strategyUsed: strategyId,
        stepsExecuted,
        warnings
      };
    }
  }

  /**
   * Execute auto-fix strategy
   */
  private executeAutoFix(configPath: string, stepsExecuted: string[], warnings: string[]): RecoveryResult {
    stepsExecuted.push('Starting auto-fix process');
    
    // Fix file permissions
    const permissionResult = this.permissionManager.repairConfigurationFile(configPath);
    if (permissionResult.success) {
      stepsExecuted.push('Fixed file permissions');
    } else {
      warnings.push(`Could not fix permissions: ${permissionResult.message}`);
    }

    stepsExecuted.push('Auto-fix completed');
    
    return {
      success: true,
      message: 'Auto-fix completed successfully',
      strategyUsed: 'auto_fix',
      stepsExecuted,
      warnings
    };
  }

  /**
   * Execute backup restore strategy
   */
  private executeBackupRestore(
    configPath: string, 
    backupPath: string | undefined, 
    stepsExecuted: string[], 
    warnings: string[]
  ): RecoveryResult {
    stepsExecuted.push('Starting backup restore process');

    if (!backupPath) {
      // Find most recent backup
      const backups = this.findBackupFiles(configPath);
      if (backups.length === 0) {
        return {
          success: false,
          message: 'No backup files found',
          strategyUsed: 'restore_backup',
          stepsExecuted,
          warnings: ['No backup files available for restoration']
        };
      }
      backupPath = backups[0]!.path; // Most recent (safe after length check)
      stepsExecuted.push(`Found backup file: ${backupPath}`);
    }

    // Validate backup
    const backupIntegrity = this.checkIntegrity(backupPath);
    if (!backupIntegrity.isValid) {
      return {
        success: false,
        message: 'Backup file is also corrupted',
        strategyUsed: 'restore_backup',
        stepsExecuted,
        warnings: ['Backup file integrity check failed']
      };
    }
    stepsExecuted.push('Backup integrity validated');

    // Create backup of current file
    const currentBackupPath = `${configPath}.corrupted.${Date.now()}`;
    if (fs.existsSync(configPath)) {
      fs.copyFileSync(configPath, currentBackupPath);
      stepsExecuted.push(`Backed up corrupted file to: ${currentBackupPath}`);
    }

    // Restore from backup
    fs.copyFileSync(backupPath, configPath);
    stepsExecuted.push('Configuration restored from backup');

    // Fix permissions
    this.permissionManager.setSecurePermissions(configPath);
    stepsExecuted.push('Set secure file permissions');

    return {
      success: true,
      message: 'Configuration successfully restored from backup',
      strategyUsed: 'restore_backup',
      stepsExecuted,
      warnings,
      backupFile: currentBackupPath
    };
  }

  /**
   * Execute manual fix strategy (placeholder)
   */
  private executeManualFix(_configPath: string, stepsExecuted: string[], warnings: string[]): RecoveryResult {
    stepsExecuted.push('Manual fix requires interactive process');
    warnings.push('Manual fix must be performed interactively');
    
    return {
      success: false,
      message: 'Manual fix requires interactive CLI process',
      strategyUsed: 'manual_fix',
      stepsExecuted,
      warnings
    };
  }

  /**
   * Execute recreate strategy
   */
  private executeRecreate(configPath: string, stepsExecuted: string[], warnings: string[]): RecoveryResult {
    stepsExecuted.push('Starting configuration recreation');

    // Backup existing file if possible
    let backupFile: string | undefined;
    if (fs.existsSync(configPath)) {
      backupFile = `${configPath}.backup.${Date.now()}`;
      fs.copyFileSync(configPath, backupFile);
      stepsExecuted.push(`Backed up existing configuration to: ${backupFile}`);
    }

    // Create new configuration
    const newConfig = this.versionManager.createNewConfiguration();
    
    // Ensure directory exists
    const configDir = path.dirname(configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true, mode: 0o700 });
      stepsExecuted.push('Created configuration directory');
    }

    // Write new configuration
    fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2), 'utf8');
    stepsExecuted.push('Created new configuration file');

    // Set secure permissions
    this.permissionManager.setSecurePermissions(configPath);
    stepsExecuted.push('Set secure file permissions');

    warnings.push('All previous account data has been lost');
    warnings.push('You will need to re-add your accounts');

    return {
      success: true,
      message: 'New configuration file created successfully',
      strategyUsed: 'recreate',
      stepsExecuted,
      warnings,
      recoveredConfig: newConfig,
      ...(backupFile && { backupFile })
    };
  }

  /**
   * Execute key recovery strategy (placeholder)
   */
  private executeKeyRecovery(
    _configPath: string, 
    _newMasterKey: string | undefined, 
    stepsExecuted: string[], 
    warnings: string[]
  ): RecoveryResult {
    stepsExecuted.push('Key recovery requires encryption key');
    warnings.push('Key recovery must be performed with correct master key');
    
    return {
      success: false,
      message: 'Key recovery requires valid master key',
      strategyUsed: 'key_recovery',
      stepsExecuted,
      warnings
    };
  }

  /**
   * Find backup files for configuration
   * @param configPath Configuration file path
   * @returns Array of backup file info
   */
  public findBackupFiles(configPath: string): BackupInfo[] {
    const backups: BackupInfo[] = [];
    const configDir = path.dirname(configPath);
    const configName = path.basename(configPath);

    try {
      if (!fs.existsSync(configDir)) {
        return backups;
      }

      const files = fs.readdirSync(configDir);
      const backupPattern = new RegExp(`^${configName}\\.backup\\.(\\d+)$`);

      for (const file of files) {
        if (backupPattern.test(file)) {
          const filePath = path.join(configDir, file);
          const stats = fs.statSync(filePath);
          
          const integrity = this.checkIntegrity(filePath);
          
          backups.push({
            path: filePath,
            createdAt: stats.mtime.toISOString(),
            size: stats.size,
            isValid: integrity.isValid
          });
        }
      }

      // Sort by creation time (newest first)
      backups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    } catch (error) {
      // Error reading directory - return empty array
    }

    return backups;
  }

  /**
   * Create backup of configuration file
   * @param configPath Configuration file path
   * @returns Backup file path or null if failed
   */
  public createBackup(configPath: string): string | null {
    try {
      if (!fs.existsSync(configPath)) {
        return null;
      }

      const backupPath = `${configPath}.backup.${Date.now()}`;
      fs.copyFileSync(configPath, backupPath);
      this.permissionManager.setSecurePermissions(backupPath);
      
      return backupPath;
    } catch {
      return null;
    }
  }

  /**
   * Get recovery guidance based on integrity check
   * @param integrityResult Integrity check result
   * @returns Array of recovery guidance steps
   */
  public getRecoveryGuidance(integrityResult: IntegrityCheckResult): string[] {
    const guidance: string[] = [];

    if (integrityResult.isValid) {
      guidance.push('✅ Configuration file is healthy');
      
      if (integrityResult.issues.length > 0) {
        guidance.push('⚠️  Minor issues detected:');
        for (const issue of integrityResult.issues) {
          guidance.push(`   • ${issue.description}`);
          guidance.push(`     Fix: ${issue.suggestedFix}`);
        }
      }
      
      return guidance;
    }

    guidance.push('❌ Configuration file has critical issues');
    guidance.push('');
    guidance.push('Recommended recovery steps:');
    guidance.push('');

    // Group issues by type
    const criticalIssues = integrityResult.issues.filter(i => i.severity === 'critical');
    const warningIssues = integrityResult.issues.filter(i => i.severity === 'warning');

    if (criticalIssues.length > 0) {
      guidance.push('🚨 Critical Issues:');
      for (const issue of criticalIssues) {
        guidance.push(`   • ${issue.description}`);
        guidance.push(`     Solution: ${issue.suggestedFix}`);
      }
      guidance.push('');
    }

    if (warningIssues.length > 0) {
      guidance.push('⚠️  Warnings:');
      for (const issue of warningIssues) {
        guidance.push(`   • ${issue.description}`);
        guidance.push(`     Solution: ${issue.suggestedFix}`);
      }
      guidance.push('');
    }

    // Recovery strategy recommendations
    guidance.push('💡 Recovery Options:');
    guidance.push('   1. Try: polyv-live-cli config recover --strategy auto_fix');
    guidance.push('   2. Try: polyv-live-cli config recover --strategy restore_backup');
    guidance.push('   3. Last resort: polyv-live-cli config recover --strategy recreate');
    guidance.push('');
    guidance.push('⚠️  Always backup your configuration before recovery attempts');

    return guidance;
  }
}

/**
 * Default configuration recovery manager instance
 */
export const defaultConfigRecoveryManager = new ConfigRecoveryManager();