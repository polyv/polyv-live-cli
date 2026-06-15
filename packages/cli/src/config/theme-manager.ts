/**
 * Theme management system for monitoring interface
 * Handles theme loading, switching, and custom theme creation
 */

import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { ThemeConfig, ComponentStyles } from '../types/monitoring';
import { ConfigValidator } from './config-validator';
import { ConfigurationError } from '../utils/errors';

export interface ThemeManagerOptions {
  themesDir?: string;
  autoSave?: boolean;
  enablePreview?: boolean;
}

export interface ThemePreview {
  themeId: string;
  components: string[];
  timestamp: Date;
}

/**
 * Theme manager class for handling theme operations
 * Provides theme loading, switching, creation, and management
 */
export class ThemeManager extends EventEmitter {
  private themes: Map<string, ThemeConfig> = new Map();
  private currentThemeId: string = 'default';
  private customThemes: Map<string, ThemeConfig> = new Map();
  private themesDir: string;
  private options: Required<ThemeManagerOptions>;
  private previewMode: boolean = false;
  private originalThemeId: string | undefined;

  constructor(options: ThemeManagerOptions = {}) {
    super();
    
    this.options = {
      themesDir: options.themesDir || path.join(os.homedir(), '.polyv-live-cli', 'themes'),
      autoSave: options.autoSave ?? true,
      enablePreview: options.enablePreview ?? true,
    };

    this.themesDir = this.options.themesDir;
    
    // Ensure themes directory exists
    this.ensureThemesDirectory();
    
    // Load built-in themes
    this.loadBuiltInThemes();
    
    // Load custom themes
    this.loadCustomThemes();
  }

  /**
   * Gets available theme IDs
   * @returns Array of theme IDs
   */
  getAvailableThemes(): string[] {
    return Array.from(this.themes.keys());
  }

  /**
   * Gets theme configuration by ID
   * @param themeId Theme ID
   * @returns Theme configuration or undefined
   */
  getTheme(themeId: string): ThemeConfig | undefined {
    return this.themes.get(themeId);
  }

  /**
   * Gets current active theme
   * @returns Current theme configuration
   */
  getCurrentTheme(): ThemeConfig {
    const theme = this.themes.get(this.currentThemeId);
    if (!theme) {
      throw new ConfigurationError(`Current theme '${this.currentThemeId}' not found`);
    }
    return theme;
  }

  /**
   * Gets current theme ID
   * @returns Current theme ID
   */
  getCurrentThemeId(): string {
    return this.currentThemeId;
  }

  /**
   * Applies a theme by ID
   * @param themeId Theme ID to apply
   * @returns Promise resolving when theme is applied
   */
  async applyTheme(themeId: string): Promise<void> {
    const theme = this.themes.get(themeId);
    if (!theme) {
      throw new ConfigurationError(`Theme '${themeId}' not found`);
    }

    // Validate theme before applying
    const validation = ConfigValidator.validateThemeConfig(theme);
    if (!validation.valid) {
      throw new ConfigurationError(
        `Cannot apply invalid theme: ${ConfigValidator.createErrorMessage(validation)}`
      );
    }

    const previousThemeId = this.currentThemeId;
    this.currentThemeId = themeId;

    try {
      // Apply theme to interface
      await this.applyThemeToInterface(theme);
      
      this.emit('theme:applied', theme, previousThemeId);
      
    } catch (error) {
      // Rollback on failure
      this.currentThemeId = previousThemeId;
      throw new ConfigurationError(
        `Failed to apply theme '${themeId}': ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Creates a new custom theme
   * @param theme Theme configuration
   * @returns Promise resolving when theme is created
   */
  async createCustomTheme(theme: ThemeConfig): Promise<void> {
    // Validate theme
    const validation = ConfigValidator.validateThemeConfig(theme);
    if (!validation.valid) {
      throw new ConfigurationError(
        `Cannot create invalid theme: ${ConfigValidator.createErrorMessage(validation)}`
      );
    }

    // Check if theme ID already exists
    if (this.themes.has(theme.id)) {
      throw new ConfigurationError(`Theme with ID '${theme.id}' already exists`);
    }

    // Ensure it's marked as custom theme
    const customTheme: ThemeConfig = {
      ...theme,
      isBuiltIn: false,
    };

    // Save theme to file
    await this.saveCustomTheme(customTheme);
    
    // Add to collections
    this.themes.set(customTheme.id, customTheme);
    this.customThemes.set(customTheme.id, customTheme);
    
    this.emit('theme:created', customTheme);
  }

  /**
   * Updates an existing custom theme
   * @param themeId Theme ID to update
   * @param updates Theme updates
   * @returns Promise resolving when theme is updated
   */
  async updateCustomTheme(themeId: string, updates: Partial<ThemeConfig>): Promise<void> {
    const existingTheme = this.customThemes.get(themeId);
    if (!existingTheme) {
      throw new ConfigurationError(`Custom theme '${themeId}' not found`);
    }

    if (existingTheme.isBuiltIn) {
      throw new ConfigurationError(`Cannot update built-in theme '${themeId}'`);
    }

    // Merge updates
    const updatedTheme: ThemeConfig = {
      ...existingTheme,
      ...updates,
      id: themeId, // Prevent ID changes
      isBuiltIn: false, // Ensure it remains custom
    };

    // Validate updated theme
    const validation = ConfigValidator.validateThemeConfig(updatedTheme);
    if (!validation.valid) {
      throw new ConfigurationError(
        `Cannot update to invalid theme: ${ConfigValidator.createErrorMessage(validation)}`
      );
    }

    // Save updated theme
    await this.saveCustomTheme(updatedTheme);
    
    // Update collections
    this.themes.set(themeId, updatedTheme);
    this.customThemes.set(themeId, updatedTheme);
    
    // If this is the current theme, re-apply it
    if (this.currentThemeId === themeId) {
      await this.applyThemeToInterface(updatedTheme);
    }
    
    this.emit('theme:updated', updatedTheme, existingTheme);
  }

  /**
   * Deletes a custom theme
   * @param themeId Theme ID to delete
   * @returns Promise resolving when theme is deleted
   */
  async deleteCustomTheme(themeId: string): Promise<void> {
    const theme = this.customThemes.get(themeId);
    if (!theme) {
      throw new ConfigurationError(`Custom theme '${themeId}' not found`);
    }

    if (theme.isBuiltIn) {
      throw new ConfigurationError(`Cannot delete built-in theme '${themeId}'`);
    }

    // If this is the current theme, switch to default first
    if (this.currentThemeId === themeId) {
      await this.applyTheme('default');
    }

    // Remove theme file
    const themeFile = path.join(this.themesDir, `${themeId}.json`);
    if (fs.existsSync(themeFile)) {
      await fs.promises.unlink(themeFile);
    }
    
    // Remove from collections
    this.themes.delete(themeId);
    this.customThemes.delete(themeId);
    
    this.emit('theme:deleted', theme);
  }

  /**
   * Exports a theme to a file
   * @param themeId Theme ID to export
   * @param filePath Export file path
   * @returns Promise resolving when export is complete
   */
  async exportTheme(themeId: string, filePath: string): Promise<void> {
    const theme = this.themes.get(themeId);
    if (!theme) {
      throw new ConfigurationError(`Theme '${themeId}' not found`);
    }

    try {
      const themeJson = JSON.stringify(theme, null, 2);
      await fs.promises.writeFile(filePath, themeJson, 'utf8');
      
      this.emit('theme:exported', theme, filePath);
      
    } catch (error) {
      throw new ConfigurationError(
        `Failed to export theme to '${filePath}': ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Imports a theme from a file
   * @param filePath Import file path
   * @returns Promise resolving to imported theme
   */
  async importTheme(filePath: string): Promise<ThemeConfig> {
    try {
      const fileContent = await fs.promises.readFile(filePath, 'utf8');
      const theme = JSON.parse(fileContent) as ThemeConfig;
      
      // Validate imported theme
      const validation = ConfigValidator.validateThemeConfig(theme);
      if (!validation.valid) {
        throw new ConfigurationError(
          `Invalid theme file: ${ConfigValidator.createErrorMessage(validation)}`
        );
      }

      // Check for ID conflicts
      if (this.themes.has(theme.id)) {
        // Generate unique ID
        const originalId = theme.id;
        let counter = 1;
        while (this.themes.has(`${originalId}-${counter}`)) {
          counter++;
        }
        theme.id = `${originalId}-${counter}`;
      }

      // Mark as custom theme
      theme.isBuiltIn = false;
      
      // Create the theme
      await this.createCustomTheme(theme);
      
      this.emit('theme:imported', theme, filePath);
      
      return theme;
      
    } catch (error) {
      if (error instanceof ConfigurationError) {
        throw error;
      }
      throw new ConfigurationError(
        `Failed to import theme from '${filePath}': ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Starts theme preview mode
   * @param themeId Theme ID to preview
   * @returns Promise resolving when preview starts
   */
  async startPreview(themeId: string): Promise<void> {
    if (!this.options.enablePreview) {
      throw new ConfigurationError('Theme preview is disabled');
    }

    const theme = this.themes.get(themeId);
    if (!theme) {
      throw new ConfigurationError(`Theme '${themeId}' not found`);
    }

    if (!this.previewMode) {
      this.originalThemeId = this.currentThemeId;
    }

    this.previewMode = true;
    await this.applyThemeToInterface(theme);
    
    this.emit('theme:preview-started', theme);
  }

  /**
   * Ends theme preview mode
   * @returns Promise resolving when preview ends
   */
  async endPreview(): Promise<void> {
    if (!this.previewMode) {
      return;
    }

    this.previewMode = false;
    
    if (this.originalThemeId) {
      const originalTheme = this.themes.get(this.originalThemeId);
      if (originalTheme) {
        await this.applyThemeToInterface(originalTheme);
      }
      this.originalThemeId = undefined;
    }
    
    this.emit('theme:preview-ended');
  }

  /**
   * Gets all custom themes
   * @returns Array of custom theme configurations
   */
  getCustomThemes(): ThemeConfig[] {
    return Array.from(this.customThemes.values());
  }

  /**
   * Gets all built-in themes
   * @returns Array of built-in theme configurations
   */
  getBuiltInThemes(): ThemeConfig[] {
    return Array.from(this.themes.values()).filter(theme => theme.isBuiltIn);
  }

  /**
   * Checks if currently in preview mode
   * @returns True if in preview mode
   */
  isInPreviewMode(): boolean {
    return this.previewMode;
  }

  /**
   * Ensures themes directory exists
   */
  private ensureThemesDirectory(): void {
    try {
      if (!fs.existsSync(this.themesDir)) {
        fs.mkdirSync(this.themesDir, { recursive: true });
      }
    } catch (error) {
      throw new ConfigurationError(
        `Failed to create themes directory: ${error}`
      );
    }
  }

  /**
   * Loads built-in themes
   */
  private loadBuiltInThemes(): void {
    // Default theme
    const defaultTheme = this.createDefaultTheme();
    this.themes.set(defaultTheme.id, defaultTheme);
    
    // Dark theme
    const darkTheme = this.createDarkTheme();
    this.themes.set(darkTheme.id, darkTheme);
    
    // Light theme
    const lightTheme = this.createLightTheme();
    this.themes.set(lightTheme.id, lightTheme);
    
    // High contrast theme
    const highContrastTheme = this.createHighContrastTheme();
    this.themes.set(highContrastTheme.id, highContrastTheme);
  }

  /**
   * Loads custom themes from files
   */
  private async loadCustomThemes(): Promise<void> {
    try {
      if (!fs.existsSync(this.themesDir)) {
        return;
      }

      const files = await fs.promises.readdir(this.themesDir);
      const themeFiles = files.filter(file => file.endsWith('.json'));
      
      for (const file of themeFiles) {
        try {
          const filePath = path.join(this.themesDir, file);
          const fileContent = await fs.promises.readFile(filePath, 'utf8');
          const theme = JSON.parse(fileContent) as ThemeConfig;
          
          // Validate theme
          const validation = ConfigValidator.validateThemeConfig(theme);
          if (validation.valid) {
            this.themes.set(theme.id, theme);
            this.customThemes.set(theme.id, theme);
          } else {
            console.warn(`Invalid theme file ${file}: ${validation.errors.join(', ')}`);
          }
          
        } catch (error) {
          console.warn(`Failed to load theme file ${file}: ${error}`);
        }
      }
      
    } catch (error) {
      console.warn(`Failed to load custom themes: ${error}`);
    }
  }

  /**
   * Saves a custom theme to file
   * @param theme Theme to save
   */
  private async saveCustomTheme(theme: ThemeConfig): Promise<void> {
    const themeFile = path.join(this.themesDir, `${theme.id}.json`);
    const themeJson = JSON.stringify(theme, null, 2);
    
    try {
      await fs.promises.writeFile(themeFile, themeJson, 'utf8');
    } catch (error) {
      throw new ConfigurationError(
        `Failed to save theme '${theme.id}': ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Applies theme to the interface
   * @param theme Theme to apply
   */
  private async applyThemeToInterface(theme: ThemeConfig): Promise<void> {
    // This method would integrate with the blessed-contrib interface
    // For now, we'll emit an event that the monitoring dashboard can listen to
    this.emit('theme:interface-update', theme);
    
    // Add a small delay to simulate theme application
    // Use shorter delay in test environment
    const delay = process.env['NODE_ENV'] === 'test' ? 1 : 100;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Creates default theme configuration
   */
  private createDefaultTheme(): ThemeConfig {
    return {
      id: 'default',
      name: 'Default',
      description: 'Default monitoring interface theme',
      isBuiltIn: true,
      colors: {
        primary: '#0066cc',
        secondary: '#6c757d',
        background: '#000000',
        foreground: '#ffffff',
        accent: '#17a2b8',
        error: '#dc3545',
        warning: '#ffc107',
        success: '#28a745',
        info: '#17a2b8',
        muted: '#6c757d',
        highlight: '#ffff00',
        border: '#666666',
        selection: '#0066cc',
      },
      fonts: {
        family: 'monospace',
        size: 12,
        weight: 'normal',
        style: 'normal',
      },
      borders: {
        type: 'line',
        style: 'solid',
        color: '#666666',
      },
      components: this.createDefaultComponentStyles(),
    };
  }

  /**
   * Creates dark theme configuration
   */
  private createDarkTheme(): ThemeConfig {
    return {
      id: 'dark',
      name: 'Dark',
      description: 'Dark theme optimized for low-light environments',
      isBuiltIn: true,
      colors: {
        primary: '#0d6efd',
        secondary: '#6c757d',
        background: '#121212',
        foreground: '#e0e0e0',
        accent: '#bb86fc',
        error: '#cf6679',
        warning: '#f9c74f',
        success: '#4caf50',
        info: '#2196f3',
        muted: '#757575',
        highlight: '#ffeb3b',
        border: '#333333',
        selection: '#bb86fc',
      },
      fonts: {
        family: 'monospace',
        size: 12,
        weight: 'normal',
        style: 'normal',
      },
      borders: {
        type: 'line',
        style: 'solid',
        color: '#333333',
      },
      components: this.createDarkComponentStyles(),
    };
  }

  /**
   * Creates light theme configuration
   */
  private createLightTheme(): ThemeConfig {
    return {
      id: 'light',
      name: 'Light',
      description: 'Light theme for bright environments',
      isBuiltIn: true,
      colors: {
        primary: '#0066cc',
        secondary: '#6c757d',
        background: '#ffffff',
        foreground: '#000000',
        accent: '#6f42c1',
        error: '#dc3545',
        warning: '#fd7e14',
        success: '#198754',
        info: '#0dcaf0',
        muted: '#6c757d',
        highlight: '#fff3cd',
        border: '#dee2e6',
        selection: '#0066cc',
      },
      fonts: {
        family: 'monospace',
        size: 12,
        weight: 'normal',
        style: 'normal',
      },
      borders: {
        type: 'line',
        style: 'solid',
        color: '#dee2e6',
      },
      components: this.createLightComponentStyles(),
    };
  }

  /**
   * Creates high contrast theme configuration
   */
  private createHighContrastTheme(): ThemeConfig {
    return {
      id: 'high-contrast',
      name: 'High Contrast',
      description: 'High contrast theme for accessibility',
      isBuiltIn: true,
      colors: {
        primary: '#ffff00',
        secondary: '#ffffff',
        background: '#000000',
        foreground: '#ffffff',
        accent: '#00ffff',
        error: '#ff0000',
        warning: '#ffff00',
        success: '#00ff00',
        info: '#00ffff',
        muted: '#808080',
        highlight: '#ffff00',
        border: '#ffffff',
        selection: '#ffff00',
      },
      fonts: {
        family: 'monospace',
        size: 14,
        weight: 'bold',
        style: 'normal',
      },
      borders: {
        type: 'line',
        style: 'solid',
        color: '#ffffff',
      },
      components: this.createHighContrastComponentStyles(),
    };
  }

  /**
   * Creates default component styles
   */
  private createDefaultComponentStyles(): ComponentStyles {
    return {
      header: { fg: '#ffffff', bg: '#0066cc', bold: true },
      content: { fg: '#ffffff', bg: '#000000' },
      status: { fg: '#17a2b8', bg: '#000000' },
      border: { fg: '#666666' },
      scrollbar: { fg: '#666666', bg: '#333333' },
      selection: { fg: '#ffffff', bg: '#0066cc' },
    };
  }

  /**
   * Creates dark component styles
   */
  private createDarkComponentStyles(): ComponentStyles {
    return {
      header: { fg: '#e0e0e0', bg: '#333333', bold: true },
      content: { fg: '#e0e0e0', bg: '#121212' },
      status: { fg: '#bb86fc', bg: '#121212' },
      border: { fg: '#333333' },
      scrollbar: { fg: '#555555', bg: '#222222' },
      selection: { fg: '#000000', bg: '#bb86fc' },
    };
  }

  /**
   * Creates light component styles
   */
  private createLightComponentStyles(): ComponentStyles {
    return {
      header: { fg: '#000000', bg: '#f8f9fa', bold: true },
      content: { fg: '#000000', bg: '#ffffff' },
      status: { fg: '#6f42c1', bg: '#ffffff' },
      border: { fg: '#dee2e6' },
      scrollbar: { fg: '#adb5bd', bg: '#f8f9fa' },
      selection: { fg: '#ffffff', bg: '#0066cc' },
    };
  }

  /**
   * Creates high contrast component styles
   */
  private createHighContrastComponentStyles(): ComponentStyles {
    return {
      header: { fg: '#000000', bg: '#ffff00', bold: true },
      content: { fg: '#ffffff', bg: '#000000' },
      status: { fg: '#00ffff', bg: '#000000', bold: true },
      border: { fg: '#ffffff' },
      scrollbar: { fg: '#ffffff', bg: '#000000' },
      selection: { fg: '#000000', bg: '#ffff00' },
    };
  }

  /**
   * Destroys the theme manager and cleans up resources
   */
  destroy(): void {
    this.removeAllListeners();
    this.themes.clear();
    this.customThemes.clear();
  }
}

/**
 * Default theme manager instance
 */
export const themeManager = new ThemeManager();
