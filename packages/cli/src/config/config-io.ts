/**
 * Configuration import/export functionality
 * Supports JSON and YAML formats with validation and version compatibility
 */

import * as fs from 'fs';
import * as path from 'path';
import { MonitoringConfig, ThemeConfig, LayoutConfig } from '../types/monitoring';
import { ConfigValidator } from './config-validator';
import { ConfigurationError } from '../utils/errors';

export type ConfigFormat = 'json' | 'yaml';

export interface ExportOptions {
  format: ConfigFormat;
  includeMetadata?: boolean;
  includeCustomThemes?: boolean;
  includeCustomLayouts?: boolean;
  minify?: boolean;
}

export interface ImportOptions {
  format?: ConfigFormat; // Auto-detect if not specified
  validateOnly?: boolean;
  mergeMode?: 'replace' | 'merge' | 'selective';
  backupOriginal?: boolean;
}

export interface ExportManifest {
  exportedAt: string;
  version: string;
  format: ConfigFormat;
  source: string;
  components: {
    config: boolean;
    themes: number;
    layouts: number;
  };
  metadata?: Record<string, any>;
}

export interface ImportResult {
  success: boolean;
  config?: MonitoringConfig | undefined;
  themes?: ThemeConfig[];
  layouts?: LayoutConfig[];
  manifest?: ExportManifest;
  warnings: string[];
  errors: string[];
}

/**
 * Configuration importer class
 */
export class ConfigImporter {
  /**
   * Imports configuration from file
   * @param filePath File path to import from
   * @param options Import options
   * @returns Import result
   */
  static async importFromFile(
    filePath: string,
    options: ImportOptions = {}
  ): Promise<ImportResult> {
    try {
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new ConfigurationError(`Import file '${filePath}' not found`);
      }

      // Read file content
      const fileContent = await fs.promises.readFile(filePath, 'utf8');
      
      // Determine format
      const format = options.format || this.detectFormat(filePath, fileContent);
      
      // Parse content
      const parsedData = this.parseContent(fileContent, format);
      
      // Import configuration
      return await this.importFromData(parsedData, options);
      
    } catch (error) {
      return {
        success: false,
        warnings: [],
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  /**
   * Imports configuration from data object
   * @param data Configuration data
   * @param options Import options
   * @returns Import result
   */
  static async importFromData(
    data: any,
    _options: ImportOptions = {}
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      warnings: [],
      errors: [],
    };

    try {
      // Validate data structure
      if (!data || typeof data !== 'object') {
        throw new ConfigurationError('Invalid configuration data: must be an object');
      }

      // Check for manifest
      if (data.manifest) {
        result.manifest = data.manifest as ExportManifest;
        this.validateManifest(result.manifest);
      }

      // Import main configuration
      if (data.config) {
        const configResult = this.importConfig(data.config);
        if (configResult.success) {
          result.config = configResult.config;
        } else {
          result.errors.push(...configResult.errors);
          result.warnings.push(...configResult.warnings);
        }
      }

      // Import themes
      if (data.themes && Array.isArray(data.themes)) {
        const themesResult = this.importThemes(data.themes);
        result.themes = themesResult.themes;
        result.warnings.push(...themesResult.warnings);
        result.errors.push(...themesResult.errors);
      }

      // Import layouts
      if (data.layouts && Array.isArray(data.layouts)) {
        const layoutsResult = this.importLayouts(data.layouts);
        result.layouts = layoutsResult.layouts;
        result.warnings.push(...layoutsResult.warnings);
        result.errors.push(...layoutsResult.errors);
      }

      // Determine overall success
      result.success = result.errors.length === 0 && !!(
        result.config !== undefined ||
        (result.themes && result.themes.length > 0) ||
        (result.layouts && result.layouts.length > 0)
      );

      return result;
      
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : String(error));
      return result;
    }
  }

  /**
   * Detects configuration format from file path and content
   * @param filePath File path
   * @param content File content
   * @returns Detected format
   */
  private static detectFormat(filePath: string, content: string): ConfigFormat {
    const ext = path.extname(filePath).toLowerCase();
    
    if (ext === '.yaml' || ext === '.yml') {
      return 'yaml';
    }
    
    if (ext === '.json') {
      return 'json';
    }
    
    // Try to detect from content
    try {
      JSON.parse(content);
      return 'json';
    } catch {
      // Assume YAML if JSON parsing fails
      return 'yaml';
    }
  }

  /**
   * Parses content based on format
   * @param content Content to parse
   * @param format Content format
   * @returns Parsed data
   */
  private static parseContent(content: string, format: ConfigFormat): any {
    try {
      if (format === 'json') {
        return JSON.parse(content);
      } else {
        // For YAML, we'll use a simple implementation or throw an error
        // In a real implementation, you'd use a YAML parser like 'yaml' package
        throw new ConfigurationError('YAML format not yet implemented. Please use JSON format.');
      }
    } catch (error) {
      throw new ConfigurationError(
        `Failed to parse ${format.toUpperCase()} content: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Validates import manifest
   * @param manifest Manifest to validate
   */
  private static validateManifest(manifest: ExportManifest): void {
    if (!manifest.version) {
      throw new ConfigurationError('Invalid manifest: version is required');
    }
    
    if (!manifest.format) {
      throw new ConfigurationError('Invalid manifest: format is required');
    }
    
    if (!manifest.exportedAt) {
      throw new ConfigurationError('Invalid manifest: exportedAt is required');
    }
  }

  /**
   * Imports main configuration
   * @param configData Configuration data
   * @returns Import result
   */
  private static importConfig(configData: any): {
    success: boolean;
    config?: MonitoringConfig;
    errors: string[];
    warnings: string[];
  } {
    const result = {
      success: false,
      errors: [] as string[],
      warnings: [] as string[],
    };

    try {
      // Validate configuration
      const validation = ConfigValidator.validateMonitoringConfig(configData);
      
      if (!validation.valid) {
        result.errors.push(...validation.errors);
        result.errors.push(...validation.critical);
        result.warnings.push(...validation.warnings);
        return result;
      }

      result.success = true;
      return {
        ...result,
        config: configData as MonitoringConfig,
      };
      
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : String(error));
      return result;
    }
  }

  /**
   * Imports themes
   * @param themesData Themes data
   * @returns Import result
   */
  private static importThemes(themesData: any[]): {
    themes: ThemeConfig[];
    errors: string[];
    warnings: string[];
  } {
    const result = {
      themes: [] as ThemeConfig[],
      errors: [] as string[],
      warnings: [] as string[],
    };

    themesData.forEach((themeData, index) => {
      try {
        const validation = ConfigValidator.validateThemeConfig(themeData, `themes[${index}]`);
        
        if (validation.valid) {
          result.themes.push(themeData as ThemeConfig);
        } else {
          result.errors.push(...validation.errors);
          result.errors.push(...validation.critical);
          result.warnings.push(...validation.warnings);
        }
        
      } catch (error) {
        result.errors.push(`Theme ${index}: ${error instanceof Error ? error.message : String(error)}`);
      }
    });

    return result;
  }

  /**
   * Imports layouts
   * @param layoutsData Layouts data
   * @returns Import result
   */
  private static importLayouts(layoutsData: any[]): {
    layouts: LayoutConfig[];
    errors: string[];
    warnings: string[];
  } {
    const result = {
      layouts: [] as LayoutConfig[],
      errors: [] as string[],
      warnings: [] as string[],
    };

    layoutsData.forEach((layoutData, index) => {
      try {
        const validation = ConfigValidator.validateLayoutConfig(layoutData, `layouts[${index}]`);
        
        if (validation.valid) {
          result.layouts.push(layoutData as LayoutConfig);
        } else {
          result.errors.push(...validation.errors);
          result.errors.push(...validation.critical);
          result.warnings.push(...validation.warnings);
        }
        
      } catch (error) {
        result.errors.push(`Layout ${index}: ${error instanceof Error ? error.message : String(error)}`);
      }
    });

    return result;
  }
}

/**
 * Configuration exporter class
 */
export class ConfigExporter {
  /**
   * Exports configuration to file
   * @param config Configuration to export
   * @param filePath File path to export to
   * @param options Export options
   * @returns Promise resolving when export is complete
   */
  static async exportToFile(
    config: MonitoringConfig,
    filePath: string,
    options: ExportOptions = { format: 'json' }
  ): Promise<void> {
    try {
      // Create export data
      const exportData = this.createExportData(config, options);
      
      // Serialize data
      const serializedData = this.serializeData(exportData, options);
      
      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        await fs.promises.mkdir(dir, { recursive: true });
      }
      
      // Write file
      await fs.promises.writeFile(filePath, serializedData, 'utf8');
      
    } catch (error) {
      throw new ConfigurationError(
        `Failed to export configuration to '${filePath}': ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Exports configuration with themes and layouts
   * @param config Main configuration
   * @param themes Custom themes
   * @param layouts Custom layouts
   * @param filePath Export file path
   * @param options Export options
   * @returns Promise resolving when export is complete
   */
  static async exportComplete(
    config: MonitoringConfig,
    themes: ThemeConfig[],
    layouts: LayoutConfig[],
    filePath: string,
    options: ExportOptions = { format: 'json' }
  ): Promise<void> {
    try {
      // Create comprehensive export data
      const exportData = {
        manifest: this.createManifest(config, themes, layouts, options),
        config,
        themes: options.includeCustomThemes ? themes.filter(t => !t.isBuiltIn) : [],
        layouts: options.includeCustomLayouts ? layouts.filter(l => !l.isBuiltIn) : [],
      };
      
      // Add metadata if requested
      if (options.includeMetadata) {
        exportData.manifest.metadata = {
          exportedBy: 'polyv-live-cli',
          exportedFrom: process.platform,
          nodeVersion: process.version,
          timestamp: new Date().toISOString(),
        };
      }
      
      // Serialize data
      const serializedData = this.serializeData(exportData, options);
      
      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        await fs.promises.mkdir(dir, { recursive: true });
      }
      
      // Write file
      await fs.promises.writeFile(filePath, serializedData, 'utf8');
      
    } catch (error) {
      throw new ConfigurationError(
        `Failed to export complete configuration to '${filePath}': ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Exports configuration to string
   * @param config Configuration to export
   * @param options Export options
   * @returns Serialized configuration string
   */
  static exportToString(
    config: MonitoringConfig,
    options: ExportOptions = { format: 'json' }
  ): string {
    const exportData = this.createExportData(config, options);
    return this.serializeData(exportData, options);
  }

  /**
   * Creates export data structure
   * @param config Configuration to export
   * @param options Export options
   * @returns Export data
   */
  private static createExportData(
    config: MonitoringConfig,
    options: ExportOptions
  ): any {
    const exportData: any = {
      manifest: {
        version: config.version,
        format: options.format,
        exportedAt: new Date().toISOString(),
        source: 'polyv-live-cli-config-manager',
        components: {
          config: true,
          themes: options.includeCustomThemes ? config.customThemes.length : 0,
          layouts: options.includeCustomLayouts ? config.customLayouts.length : 0,
        },
      },
      config,
    };

    if (options.includeCustomThemes && config.customThemes.length > 0) {
      exportData.themes = config.customThemes;
    }

    if (options.includeCustomLayouts && config.customLayouts.length > 0) {
      exportData.layouts = config.customLayouts;
    }

    if (options.includeMetadata) {
      exportData.manifest.metadata = {
        exportedBy: 'polyv-live-cli',
        exportedFrom: process.platform,
        nodeVersion: process.version,
      };
    }

    return exportData;
  }

  /**
   * Creates export manifest
   * @param config Main configuration
   * @param themes Themes to include
   * @param layouts Layouts to include
   * @param options Export options
   * @returns Export manifest
   */
  private static createManifest(
    config: MonitoringConfig,
    themes: ThemeConfig[],
    layouts: LayoutConfig[],
    options: ExportOptions
  ): ExportManifest {
    return {
      version: config.version,
      format: options.format,
      exportedAt: new Date().toISOString(),
      source: 'polyv-live-cli-config-manager',
      components: {
        config: true,
        themes: themes.length,
        layouts: layouts.length,
      },
    };
  }

  /**
   * Serializes data based on format
   * @param data Data to serialize
   * @param options Export options
   * @returns Serialized string
   */
  private static serializeData(data: any, options: ExportOptions): string {
    if (options.format === 'json') {
      const indent = options.minify ? 0 : 2;
      return JSON.stringify(data, null, indent);
    } else {
      // For YAML, we'll use a simple implementation or throw an error
      // In a real implementation, you'd use a YAML serializer like 'yaml' package
      throw new ConfigurationError('YAML format not yet implemented. Please use JSON format.');
    }
  }
}

/**
 * Configuration version compatibility manager
 */
export class ConfigVersionManager {
  private static readonly SUPPORTED_VERSIONS = ['1.0.0'];
  private static readonly CURRENT_VERSION = '1.0.0';

  /**
   * Checks if a configuration version is supported
   * @param version Version to check
   * @returns True if supported
   */
  static isVersionSupported(version: string): boolean {
    return this.SUPPORTED_VERSIONS.includes(version);
  }

  /**
   * Gets current configuration version
   * @returns Current version
   */
  static getCurrentVersion(): string {
    return this.CURRENT_VERSION;
  }

  /**
   * Migrates configuration to current version
   * @param config Configuration to migrate
   * @param fromVersion Source version
   * @returns Migrated configuration
   */
  static migrateConfig(
    config: any,
    fromVersion: string
  ): MonitoringConfig {
    if (!this.isVersionSupported(fromVersion)) {
      throw new ConfigurationError(
        `Unsupported configuration version: ${fromVersion}. Supported versions: ${this.SUPPORTED_VERSIONS.join(', ')}`
      );
    }

    if (fromVersion === this.CURRENT_VERSION) {
      return config as MonitoringConfig;
    }

    // Perform version-specific migrations here
    // For now, we only support 1.0.0, so no migration is needed
    const migratedConfig = { ...config };
    
    // Update version
    migratedConfig.version = this.CURRENT_VERSION;
    
    return migratedConfig as MonitoringConfig;
  }

  /**
   * Gets migration path between versions
   * @param fromVersion Source version
   * @param toVersion Target version
   * @returns Array of intermediate versions
   */
  static getMigrationPath(fromVersion: string, toVersion: string): string[] {
    // For now, direct migration is supported
    if (fromVersion === toVersion) {
      return [];
    }
    
    if (!this.isVersionSupported(fromVersion) || !this.isVersionSupported(toVersion)) {
      throw new ConfigurationError(
        `Migration path not available from ${fromVersion} to ${toVersion}`
      );
    }
    
    return [toVersion];
  }
}
