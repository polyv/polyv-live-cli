/**
 * @fileoverview Global configuration management for CLI
 * @author Development Team
 * @since 1.1.0
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

export interface GlobalConfig {
  appId?: string;
  appSecret?: string;
  userId?: string;
  baseUrl?: string;
}

/**
 * Global configuration manager for polyv-live-cli
 */
export class GlobalConfigManager {
  private configDir: string;
  private configFile: string;

  constructor() {
    // Store config in user home directory
    this.configDir = join(homedir(), '.polyv-live-cli');
    this.configFile = join(this.configDir, 'config.json');
  }

  /**
   * Ensure config directory exists
   */
  private ensureConfigDir(): void {
    if (!existsSync(this.configDir)) {
      mkdirSync(this.configDir, { recursive: true });
    }
  }

  /**
   * Load configuration from file
   */
  load(): GlobalConfig {
    try {
      if (!existsSync(this.configFile)) {
        return {};
      }
      
      const content = readFileSync(this.configFile, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.warn('⚠️  Failed to load config file, using empty config');
      return {};
    }
  }

  /**
   * Save configuration to file
   */
  save(config: GlobalConfig): void {
    try {
      this.ensureConfigDir();
      
      // Merge with existing config
      const existingConfig = this.load();
      const newConfig = { ...existingConfig, ...config };
      
      // Remove undefined values
      Object.keys(newConfig).forEach(key => {
        if (newConfig[key as keyof GlobalConfig] === undefined) {
          delete newConfig[key as keyof GlobalConfig];
        }
      });
      
      writeFileSync(this.configFile, JSON.stringify(newConfig, null, 2));
      console.log('✅ Configuration saved successfully');
    } catch (error) {
      throw new Error(`Failed to save configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get a specific config value
   */
  get(key: keyof GlobalConfig): string | undefined {
    const config = this.load();
    return config[key];
  }

  /**
   * Set a specific config value
   */
  set(key: keyof GlobalConfig, value: string): void {
    const config = this.load();
    config[key] = value;
    this.save(config);
  }

  /**
   * Remove a specific config value
   */
  unset(key: keyof GlobalConfig): void {
    const config = this.load();
    delete config[key];
    this.save(config);
  }

  /**
   * Clear all configuration
   */
  clear(): void {
    this.save({});
    console.log('✅ Configuration cleared');
  }

  /**
   * Get config file path
   */
  getConfigPath(): string {
    return this.configFile;
  }

  /**
   * Check if config file exists
   */
  exists(): boolean {
    return existsSync(this.configFile);
  }

  /**
   * Validate configuration
   */
  validate(config?: GlobalConfig): { isValid: boolean; missingKeys: string[] } {
    const cfg = config || this.load();
    const requiredKeys = ['appId', 'appSecret'];
    const missingKeys = requiredKeys.filter(key => !cfg[key as keyof GlobalConfig]);
    
    return {
      isValid: missingKeys.length === 0,
      missingKeys
    };
  }
}

// Export singleton instance
export const globalConfig = new GlobalConfigManager();