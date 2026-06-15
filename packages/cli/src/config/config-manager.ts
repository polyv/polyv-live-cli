/**
 * Enhanced configuration management system for monitoring interface
 * Supports themes, layouts, import/export, and real-time updates
 */

import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { MonitoringConfig } from '../types/monitoring';
import { ConfigurationError } from '../utils/errors';

export interface ConfigManagerOptions {
  configDir?: string;
  autoSave?: boolean;
  backupConfig?: boolean;
  watchFiles?: boolean;
}

export interface ConfigBackup {
  timestamp: Date;
  version: string;
  config: MonitoringConfig;
  reason: string;
}

export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ConfigWatcher {
  event: string;
  handler: (config: MonitoringConfig) => void;
}

/**
 * Enhanced configuration manager for monitoring interface
 * Provides configuration persistence, validation, hot-reloading, and backup/restore
 */
export class ConfigManager extends EventEmitter {
  private config: MonitoringConfig;
  private configDir: string;
  private configFile: string;
  private backupDir: string;
  private options: Required<ConfigManagerOptions>;
  // private watchers: Map<string, ConfigWatcher[]> = new Map();
  private fileWatcher?: fs.FSWatcher;
  private lastSaveTime: number = 0;
  private saveDebounceTimer?: NodeJS.Timeout;

  constructor(options: ConfigManagerOptions = {}) {
    super();
    
    this.options = {
      configDir: options.configDir || path.join(os.homedir(), '.polyv-live-cli'),
      autoSave: options.autoSave ?? true,
      backupConfig: options.backupConfig ?? true,
      watchFiles: options.watchFiles ?? true,
    };

    this.configDir = this.options.configDir;
    this.configFile = path.join(this.configDir, 'monitoring.json');
    this.backupDir = path.join(this.configDir, 'backups');
    
    // Initialize with default config
    this.config = this.getDefaultConfig();
    
    // Ensure directories exist
    this.ensureDirectories();
    
    // Set up file watching if enabled
    if (this.options.watchFiles) {
      this.setupFileWatcher();
    }
  }

  /**
   * Loads configuration from file system
   * @returns Promise resolving to the loaded configuration
   */
  async load(): Promise<MonitoringConfig> {
    try {
      if (fs.existsSync(this.configFile)) {
        const fileContent = await fs.promises.readFile(this.configFile, 'utf8');
        const loadedConfig = JSON.parse(fileContent) as MonitoringConfig;
        
        // Validate loaded configuration
        const validation = this.validate(loadedConfig);
        if (!validation.valid) {
          throw new ConfigurationError(
            `Invalid configuration: ${validation.errors.join(', ')}`
          );
        }
        
        // Merge with defaults to ensure all required fields are present
        this.config = this.mergeWithDefaults(loadedConfig);
        
        // Check if migration is needed
        await this.migrateIfNeeded();
        
        this.emit('config:loaded', this.config);
        return this.config;
      } else {
        // No config file exists, use defaults and save
        await this.save(this.config);
        this.emit('config:created', this.config);
        return this.config;
      }
    } catch (error) {
      if (error instanceof ConfigurationError) {
        throw error;
      }
      throw new ConfigurationError(
        `Failed to load configuration: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Saves configuration to file system
   * @param config Configuration to save
   * @returns Promise resolving when save is complete
   */
  async save(config?: MonitoringConfig): Promise<void> {
    const configToSave = config || this.config;
    
    try {
      // Validate before saving
      const validation = this.validate(configToSave);
      if (!validation.valid) {
        throw new ConfigurationError(
          `Cannot save invalid configuration: ${validation.errors.join(', ')}`
        );
      }
      
      // Create backup if enabled
      if (this.options.backupConfig && fs.existsSync(this.configFile)) {
        await this.createBackup('auto-save');
      }
      
      // Update internal config
      this.config = configToSave;
      
      // Save to file
      const configJson = JSON.stringify(configToSave, null, 2);
      await fs.promises.writeFile(this.configFile, configJson, 'utf8');
      
      this.lastSaveTime = Date.now();
      this.emit('config:saved', configToSave);
      
    } catch (error) {
      if (error instanceof ConfigurationError) {
        throw error;
      }
      throw new ConfigurationError(
        `Failed to save configuration: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Updates configuration with partial changes
   * @param updates Partial configuration updates
   * @returns Promise resolving when update is complete
   */
  async update(updates: Partial<MonitoringConfig>): Promise<void> {
    const newConfig = this.merge(this.config, updates);
    
    // Validate merged configuration
    const validation = this.validate(newConfig);
    if (!validation.valid) {
      throw new ConfigurationError(
        `Invalid configuration update: ${validation.errors.join(', ')}`
      );
    }
    
    // Apply update
    const previousConfig = { ...this.config };
    this.config = newConfig;
    
    // Auto-save if enabled
    if (this.options.autoSave) {
      // Debounce saves to avoid excessive file I/O
      if (this.saveDebounceTimer) {
        clearTimeout(this.saveDebounceTimer);
      }
      
      this.saveDebounceTimer = setTimeout(async () => {
        try {
          await this.save();
        } catch (error) {
          this.emit('error', error);
          // Rollback on save failure
          this.config = previousConfig;
          throw error;
        }
      }, 500); // 500ms debounce
    }
    
    this.emit('config:updated', newConfig, updates);
  }

  /**
   * Resets configuration to default values
   * @param selective Optional array of keys to reset (resets all if not provided)
   * @returns Promise resolving when reset is complete
   */
  async reset(selective?: string[]): Promise<void> {
    try {
      // Create backup before reset
      if (this.options.backupConfig) {
        await this.createBackup('reset');
      }
      
      const defaultConfig = this.getDefaultConfig();
      
      if (selective && selective.length > 0) {
        // Selective reset
        const newConfig = { ...this.config };
        for (const key of selective) {
          if (key in defaultConfig) {
            (newConfig as any)[key] = (defaultConfig as any)[key];
          }
        }
        await this.update(newConfig);
      } else {
        // Full reset
        this.config = defaultConfig;
        await this.save();
      }
      
      this.emit('config:reset', this.config, selective);
      
    } catch (error) {
      throw new ConfigurationError(
        `Failed to reset configuration: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Gets current configuration
   * @returns Current configuration (deep copy)
   */
  getConfig(): MonitoringConfig {
    return JSON.parse(JSON.stringify(this.config));
  }

  /**
   * Validates configuration object
   * @param config Configuration to validate
   * @returns Validation result
   */
  validate(config: MonitoringConfig): ConfigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Version validation
    if (!config.version || typeof config.version !== 'string') {
      errors.push('Configuration version is required and must be a string');
    }

    // Theme validation
    if (!config.theme || typeof config.theme !== 'string') {
      errors.push('Theme is required and must be a string');
    }

    // Layout validation
    if (!config.layout || typeof config.layout !== 'string') {
      errors.push('Layout is required and must be a string');
    }

    // Refresh interval validation
    if (typeof config.refreshInterval !== 'number' || config.refreshInterval < 1000) {
      errors.push('Refresh interval must be a number >= 1000ms');
    }

    // Components validation
    if (!Array.isArray(config.components)) {
      errors.push('Components must be an array');
    } else {
      config.components.forEach((component, index) => {
        if (!component.type || typeof component.type !== 'string') {
          errors.push(`Component ${index}: type is required and must be a string`);
        }
        if (!component.position || typeof component.position !== 'object') {
          errors.push(`Component ${index}: position is required and must be an object`);
        }
        if (typeof component.visible !== 'boolean') {
          errors.push(`Component ${index}: visible must be a boolean`);
        }
      });
    }

    // Custom themes validation
    if (config.customThemes && !Array.isArray(config.customThemes)) {
      errors.push('Custom themes must be an array');
    }

    // Custom layouts validation
    if (config.customLayouts && !Array.isArray(config.customLayouts)) {
      errors.push('Custom layouts must be an array');
    }

    // Preferences validation
    if (config.preferences && typeof config.preferences !== 'object') {
      errors.push('Preferences must be an object');
    }

    // Performance warnings
    if (config.refreshInterval < 2000) {
      warnings.push('Refresh interval below 2000ms may impact performance');
    }

    if (config.components && config.components.length > 10) {
      warnings.push('More than 10 components may impact performance');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Merges configuration objects deeply
   * @param target Target configuration
   * @param source Source configuration to merge
   * @returns Merged configuration
   */
  private merge<T extends Record<string, any>>(
    target: T,
    source: Partial<T>
  ): T {
    const result = { ...target };
    
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        const sourceValue = source[key];
        const targetValue = result[key];
        
        if (
          sourceValue &&
          typeof sourceValue === 'object' &&
          !Array.isArray(sourceValue) &&
          targetValue &&
          typeof targetValue === 'object' &&
          !Array.isArray(targetValue)
        ) {
          // Deep merge objects
          result[key] = this.merge(targetValue, sourceValue);
        } else {
          // Direct assignment for primitives and arrays
          result[key] = sourceValue as any;
        }
      }
    }
    
    return result;
  }

  /**
   * Creates backup of current configuration
   * @param reason Reason for creating backup
   * @returns Promise resolving to backup info
   */
  private async createBackup(reason: string): Promise<ConfigBackup> {
    const timestamp = new Date();
    const backupFileName = `monitoring-${timestamp.toISOString().replace(/[:.]/g, '-')}.json`;
    const backupFilePath = path.join(this.backupDir, backupFileName);
    
    const backup: ConfigBackup = {
      timestamp,
      version: this.config.version,
      config: this.config,
      reason,
    };
    
    await fs.promises.writeFile(
      backupFilePath,
      JSON.stringify(backup, null, 2),
      'utf8'
    );
    
    // Clean up old backups (keep last 10)
    await this.cleanupBackups();
    
    this.emit('config:backup-created', backup);
    return backup;
  }

  /**
   * Cleans up old backup files
   */
  private async cleanupBackups(): Promise<void> {
    try {
      const files = await fs.promises.readdir(this.backupDir);
      const backupFiles = files
        .filter(file => file.startsWith('monitoring-') && file.endsWith('.json'))
        .map(file => ({
          name: file,
          path: path.join(this.backupDir, file),
          stat: fs.statSync(path.join(this.backupDir, file)),
        }))
        .sort((a, b) => b.stat.mtime.getTime() - a.stat.mtime.getTime());
      
      // Keep only the 10 most recent backups
      const filesToDelete = backupFiles.slice(10);
      
      for (const file of filesToDelete) {
        await fs.promises.unlink(file.path);
      }
    } catch (error) {
      // Log error but don't fail the operation
      this.emit('error', new Error(`Failed to cleanup backups: ${error}`));
    }
  }

  /**
   * Ensures required directories exist
   */
  private ensureDirectories(): void {
    try {
      if (!fs.existsSync(this.configDir)) {
        fs.mkdirSync(this.configDir, { recursive: true });
      }
      
      if (!fs.existsSync(this.backupDir)) {
        fs.mkdirSync(this.backupDir, { recursive: true });
      }
    } catch (error) {
      throw new ConfigurationError(
        `Failed to create configuration directories: ${error}`
      );
    }
  }

  /**
   * Sets up file system watcher for configuration file
   */
  private setupFileWatcher(): void {
    try {
      this.fileWatcher = fs.watch(this.configFile, (eventType) => {
        if (eventType === 'change') {
          // Debounce file changes to avoid rapid reloads
          const now = Date.now();
          if (now - this.lastSaveTime > 1000) {
            this.load().catch(error => {
              this.emit('error', new Error(`Failed to reload config: ${error}`));
            });
          }
        }
      });
    } catch (error) {
      // File watching is optional, don't fail if it's not available
      this.emit('warning', new Error(`File watching not available: ${error}`));
    }
  }

  /**
   * Performs configuration migration if needed
   */
  private async migrateIfNeeded(): Promise<void> {
    const currentVersion = this.config.version;
    const latestVersion = this.getDefaultConfig().version;
    
    if (currentVersion !== latestVersion) {
      // Create backup before migration
      await this.createBackup(`migration-from-${currentVersion}-to-${latestVersion}`);
      
      // Perform migration logic here
      this.config = this.mergeWithDefaults(this.config);
      this.config.version = latestVersion;
      
      await this.save();
      this.emit('config:migrated', currentVersion, latestVersion);
    }
  }

  /**
   * Merges configuration with defaults to ensure all required fields
   * @param config Configuration to merge
   * @returns Merged configuration with defaults
   */
  private mergeWithDefaults(config: Partial<MonitoringConfig>): MonitoringConfig {
    return this.merge(this.getDefaultConfig(), config);
  }

  /**
   * Gets default configuration
   * @returns Default monitoring configuration
   */
  private getDefaultConfig(): MonitoringConfig {
    return {
      version: '1.0.0',
      theme: 'default',
      layout: 'default',
      refreshInterval: 5000,
      components: [
        {
          type: 'stream-metrics',
          position: { x: 0, y: 0, width: 8, height: 6 },
          size: { minWidth: 40, minHeight: 15 },
          config: {
            showBitrate: true,
            showFps: true,
            showViewers: true,
            showUptime: true,
            refreshInterval: 5000,
          },
          visible: true,
          priority: 1,
        },
        {
          type: 'channel-status',
          position: { x: 8, y: 0, width: 4, height: 6 },
          size: { minWidth: 30, minHeight: 15 },
          config: {
            showInactive: true,
            maxChannels: 20,
            sortBy: 'activity',
            refreshInterval: 10000,
          },
          visible: true,
          priority: 2,
        },
        {
          type: 'system-resources',
          position: { x: 0, y: 6, width: 6, height: 6 },
          size: { minWidth: 30, minHeight: 15 },
          config: {
            showCpu: true,
            showMemory: true,
            showNetwork: true,
            showDisk: false,
            refreshInterval: 2000,
          },
          visible: true,
          priority: 3,
        },
        {
          type: 'alert-panel',
          position: { x: 6, y: 6, width: 6, height: 6 },
          size: { minWidth: 30, minHeight: 15 },
          config: {
            maxAlerts: 50,
            showTimestamp: true,
            autoScroll: true,
          },
          visible: true,
          priority: 4,
        },
      ],
      customThemes: [],
      customLayouts: [],
      preferences: {
        autoSave: true,
        confirmActions: true,
        showHelp: true,
        keyboardShortcuts: true,
        animationSpeed: 'normal',
        soundEnabled: false,
        compactMode: false,
        showTimestamps: true,
        maxHistoryItems: 100,
      },
    };
  }

  /**
   * Destroys the configuration manager and cleans up resources
   */
  destroy(): void {
    if (this.fileWatcher) {
      this.fileWatcher.close();
    }
    
    if (this.saveDebounceTimer) {
      clearTimeout(this.saveDebounceTimer);
    }
    
    this.removeAllListeners();
  }
}

/**
 * Default configuration manager instance
 */
export const configManager = new ConfigManager();
