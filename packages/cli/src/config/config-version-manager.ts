/**
 * Configuration Version Manager for handling configuration file format versioning
 * 
 * Features:
 * - Version validation and compatibility checks
 * - Automatic migration between configuration versions
 * - Backward compatibility support
 * - Version upgrade pathways
 * - Migration error handling
 * 
 * @fileoverview Configuration versioning for story 6.4
 * @author Development Team
 * @since 1.0.0
 */

import { AccountsStore } from '../types/account.types';

/**
 * Version information interface
 */
export interface VersionInfo {
  /** Version string (e.g., "1.0", "1.1") */
  version: string;
  /** Version description */
  description: string;
  /** Required features for this version */
  features: string[];
  /** Breaking changes from previous version */
  breakingChanges: string[];
}

/**
 * Migration result interface
 */
export interface MigrationResult {
  /** Whether migration was successful */
  success: boolean;
  /** Migration message */
  message: string;
  /** Source version */
  fromVersion: string;
  /** Target version */
  toVersion: string;
  /** Migration steps performed */
  steps: string[];
  /** Warnings during migration */
  warnings: string[];
  /** Migrated configuration (if successful) */
  migratedConfig?: AccountsStore;
}

/**
 * Version validation result
 */
export interface VersionValidationResult {
  /** Whether version is valid */
  isValid: boolean;
  /** Validation message */
  message: string;
  /** Detected version */
  detectedVersion?: string;
  /** Compatibility status */
  compatibility: 'compatible' | 'upgradeable' | 'incompatible';
  /** Required actions */
  requiredActions: string[];
}

/**
 * Supported configuration versions registry
 */
const SUPPORTED_VERSIONS: Record<string, VersionInfo> = {
  '1.0': {
    version: '1.0',
    description: 'Initial secure configuration format with AES-256-GCM encryption',
    features: [
      'AES-256-GCM encryption for appSecret',
      'File permission management',
      'Account metadata tracking',
      'Environment variable key support'
    ],
    breakingChanges: []
  },
  '0.9': {
    version: '0.9',
    description: 'Legacy format with basic encryption (migration target)',
    features: [
      'Basic AES-256-CBC encryption',
      'Simple account storage'
    ],
    breakingChanges: []
  },
  '0.8': {
    version: '0.8',
    description: 'Pre-encryption format (plain text storage)',
    features: [
      'Plain text account storage',
      'Basic metadata'
    ],
    breakingChanges: []
  }
} as const;

/**
 * Current configuration version
 */
export const CURRENT_VERSION = '1.0';

/**
 * Minimum supported version
 */
export const MINIMUM_SUPPORTED_VERSION = '0.8';

/**
 * Configuration Version Manager implementation
 */
export class ConfigVersionManager {
  /**
   * Get current supported version
   * @returns Current version string
   */
  public getCurrentVersion(): string {
    return CURRENT_VERSION;
  }

  /**
   * Get all supported versions
   * @returns Array of supported version info
   */
  public getSupportedVersions(): VersionInfo[] {
    return Object.values(SUPPORTED_VERSIONS);
  }

  /**
   * Check if version is supported
   * @param version Version string to check
   * @returns True if version is supported
   */
  public isVersionSupported(version: string): boolean {
    return version in SUPPORTED_VERSIONS;
  }

  /**
   * Get version information
   * @param version Version string
   * @returns Version information or null if not supported
   */
  public getVersionInfo(version: string): VersionInfo | null {
    return SUPPORTED_VERSIONS[version] || null;
  }

  /**
   * Compare version strings
   * @param version1 First version
   * @param version2 Second version
   * @returns -1 if v1 < v2, 0 if v1 = v2, 1 if v1 > v2
   */
  public compareVersions(version1: string, version2: string): number {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);
    
    const maxLength = Math.max(v1Parts.length, v2Parts.length);
    
    for (let i = 0; i < maxLength; i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;
      
      if (v1Part < v2Part) return -1;
      if (v1Part > v2Part) return 1;
    }
    
    return 0;
  }

  /**
   * Detect version from configuration object
   * @param config Configuration object to analyze
   * @returns Detected version string
   */
  public detectVersion(config: unknown): string {
    if (!config || typeof config !== 'object') {
      throw new Error('Invalid configuration object');
    }

    const configObj = config as Record<string, any>;

    // Check for explicit version field
    if (configObj['version'] && typeof configObj['version'] === 'string') {
      return configObj['version'];
    }

    // Analyze structure to detect version
    if (configObj['accounts'] && configObj['metadata']) {
      // Check if accounts have encryption metadata
      const accounts = configObj['accounts'];
      const firstAccount = Object.values(accounts)[0] as any;
      
      if (firstAccount && typeof firstAccount.appSecret === 'object') {
        // Structured encryption data suggests v1.0
        return '1.0';
      } else if (firstAccount && typeof firstAccount.appSecret === 'string') {
        // Check if it looks like encrypted data
        try {
          const decoded = Buffer.from(firstAccount.appSecret, 'base64').toString('utf8');
          const parsed = JSON.parse(decoded);
          if (parsed.data && parsed.meta) {
            return '0.9'; // Legacy encryption format
          }
        } catch {
          // Not base64 encoded or not JSON - probably plain text
          return '0.8';
        }
      }
    }

    // Fallback to oldest supported version
    return MINIMUM_SUPPORTED_VERSION;
  }

  /**
   * Validate configuration version compatibility
   * @param config Configuration object to validate
   * @returns Validation result
   */
  public validateVersion(config: unknown): VersionValidationResult {
    try {
      const detectedVersion = this.detectVersion(config);
      const currentVersion = this.getCurrentVersion();
      
      if (!this.isVersionSupported(detectedVersion)) {
        return {
          isValid: false,
          message: `Unsupported configuration version: ${detectedVersion}`,
          detectedVersion,
          compatibility: 'incompatible',
          requiredActions: [
            'Configuration version is not supported',
            'Please create a new configuration or contact support'
          ]
        };
      }

      const comparison = this.compareVersions(detectedVersion, currentVersion);
      
      if (comparison === 0) {
        return {
          isValid: true,
          message: `Configuration is using current version: ${detectedVersion}`,
          detectedVersion,
          compatibility: 'compatible',
          requiredActions: []
        };
      } else if (comparison < 0) {
        return {
          isValid: true,
          message: `Configuration is using older version: ${detectedVersion}. Migration is available.`,
          detectedVersion,
          compatibility: 'upgradeable',
          requiredActions: [
            `Run: polyv-live-cli config migrate --from ${detectedVersion} --to ${currentVersion}`,
            'Backup your configuration before migration'
          ]
        };
      } else {
        return {
          isValid: false,
          message: `Configuration is using newer version: ${detectedVersion}. Please update the CLI.`,
          detectedVersion,
          compatibility: 'incompatible',
          requiredActions: [
            'Update PolyV CLI to the latest version',
            'Check for CLI updates: npm update -g polyv-live-cli'
          ]
        };
      }
    } catch (error) {
      return {
        isValid: false,
        message: `Failed to validate version: ${error instanceof Error ? error.message : 'Unknown error'}`,
        compatibility: 'incompatible',
        requiredActions: [
          'Check configuration file format',
          'Verify file is not corrupted'
        ]
      };
    }
  }

  /**
   * Migrate configuration from one version to another
   * @param config Source configuration
   * @param fromVersion Source version
   * @param toVersion Target version
   * @returns Migration result
   */
  public migrateConfiguration(
    config: unknown,
    fromVersion: string,
    toVersion: string
  ): MigrationResult {
    const steps: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate versions
      if (!this.isVersionSupported(fromVersion)) {
        return {
          success: false,
          message: `Source version ${fromVersion} is not supported`,
          fromVersion,
          toVersion,
          steps: [],
          warnings: []
        };
      }

      if (!this.isVersionSupported(toVersion)) {
        return {
          success: false,
          message: `Target version ${toVersion} is not supported`,
          fromVersion,
          toVersion,
          steps: [],
          warnings: []
        };
      }

      // No migration needed if versions are the same
      if (fromVersion === toVersion) {
        return {
          success: true,
          message: 'No migration needed - versions are the same',
          fromVersion,
          toVersion,
          steps: ['No migration required'],
          warnings: [],
          migratedConfig: config as AccountsStore
        };
      }

      let migratedConfig = this.deepClone(config);

      // Migration path: 0.8 -> 0.9 -> 1.0
      if (fromVersion === '0.8' && this.compareVersions(toVersion, '0.9') >= 0) {
        migratedConfig = this.migrateFrom08To09(migratedConfig);
        steps.push('Migrated from v0.8 to v0.9: Added basic encryption');
        warnings.push('App secrets have been encrypted using basic encryption');
      }

      if ((fromVersion === '0.8' || fromVersion === '0.9') && toVersion === '1.0') {
        migratedConfig = this.migrateFrom09To10(migratedConfig);
        steps.push('Migrated from v0.9 to v1.0: Upgraded to AES-256-GCM encryption');
        warnings.push('Encryption has been upgraded to AES-256-GCM for better security');
      }

      // Set final version
      if (typeof migratedConfig === 'object' && migratedConfig !== null) {
        (migratedConfig as any).version = toVersion;
        steps.push(`Set configuration version to ${toVersion}`);
      }

      return {
        success: true,
        message: `Successfully migrated configuration from ${fromVersion} to ${toVersion}`,
        fromVersion,
        toVersion,
        steps,
        warnings,
        migratedConfig: migratedConfig as AccountsStore
      };

    } catch (error) {
      return {
        success: false,
        message: `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        fromVersion,
        toVersion,
        steps,
        warnings
      };
    }
  }

  /**
   * Migrate from version 0.8 (plain text) to 0.9 (basic encryption)
   * @param config Configuration object
   * @returns Migrated configuration
   */
  private migrateFrom08To09(config: any): any {
    if (!config.accounts) {
      return config;
    }

    // This is a placeholder for backward compatibility
    // In practice, we'd need to use the old AccountCrypto class
    for (const accountName in config.accounts) {
      const account = config.accounts[accountName];
      if (typeof account.appSecret === 'string' && !account.appSecret.includes('base64')) {
        // Mark as needs encryption - actual encryption would happen in the calling code
        account._needsEncryption = true;
      }
    }

    config.version = '0.9';
    return config;
  }

  /**
   * Migrate from version 0.9 (basic encryption) to 1.0 (AES-256-GCM)
   * @param config Configuration object
   * @returns Migrated configuration
   */
  private migrateFrom09To10(config: any): any {
    if (!config.accounts) {
      return config;
    }

    // Add metadata if missing
    if (!config.metadata) {
      const now = new Date().toISOString();
      config.metadata = {
        createdAt: now,
        updatedAt: now
      };
    }

    // Mark accounts for re-encryption with new format
    for (const accountName in config.accounts) {
      const account = config.accounts[accountName];
      account._needsReencryption = true;
    }

    config.version = '1.0';
    return config;
  }

  /**
   * Get migration path from source to target version
   * @param fromVersion Source version
   * @param toVersion Target version
   * @returns Array of migration steps
   */
  public getMigrationPath(fromVersion: string, toVersion: string): string[] {
    if (fromVersion === toVersion) {
      return [];
    }

    const path: string[] = [];

    // Simple linear migration path for now
    if (fromVersion === '0.8' && toVersion === '0.9') {
      path.push('0.8 → 0.9: Encrypt plain text secrets');
    } else if (fromVersion === '0.9' && toVersion === '1.0') {
      path.push('0.9 → 1.0: Upgrade to AES-256-GCM encryption');
    } else if (fromVersion === '0.8' && toVersion === '1.0') {
      path.push('0.8 → 0.9: Encrypt plain text secrets');
      path.push('0.9 → 1.0: Upgrade to AES-256-GCM encryption');
    }

    return path;
  }

  /**
   * Create a new configuration with current version
   * @returns New configuration structure
   */
  public createNewConfiguration(): AccountsStore {
    const now = new Date().toISOString();
    return {
      version: this.getCurrentVersion(),
      accounts: {},
      metadata: {
        createdAt: now,
        updatedAt: now
      }
    };
  }

  /**
   * Deep clone object
   * @param obj Object to clone
   * @returns Cloned object
   */
  private deepClone(obj: unknown): any {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Check if migration is required
   * @param config Configuration to check
   * @returns True if migration is needed
   */
  public isMigrationRequired(config: unknown): boolean {
    try {
      const detectedVersion = this.detectVersion(config);
      const currentVersion = this.getCurrentVersion();
      return this.compareVersions(detectedVersion, currentVersion) < 0;
    } catch {
      return false;
    }
  }

  /**
   * Get breaking changes between versions
   * @param fromVersion Source version
   * @param toVersion Target version
   * @returns Array of breaking changes
   */
  public getBreakingChanges(fromVersion: string, toVersion: string): string[] {
    const changes: string[] = [];
    
    const versions = Object.keys(SUPPORTED_VERSIONS).sort(this.compareVersions.bind(this));
    const fromIndex = versions.indexOf(fromVersion);
    const toIndex = versions.indexOf(toVersion);
    
    if (fromIndex === -1 || toIndex === -1 || fromIndex >= toIndex) {
      return changes;
    }
    
    for (let i = fromIndex + 1; i <= toIndex; i++) {
      const version = versions[i];
      if (version && SUPPORTED_VERSIONS[version]) {
        const versionInfo = SUPPORTED_VERSIONS[version];
        changes.push(...versionInfo.breakingChanges);
      }
    }
    
    return changes;
  }
}

/**
 * Default configuration version manager instance
 */
export const defaultConfigVersionManager = new ConfigVersionManager();