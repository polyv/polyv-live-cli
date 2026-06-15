/**
 * Configuration validation utilities for monitoring interface
 */

import { MonitoringConfig, ThemeConfig, LayoutConfig, ComponentConfig, ComponentLayout, UserPreferences } from '../types/monitoring';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  critical: string[];
}

export interface ValidationRule<T> {
  name: string;
  validator: (value: T) => ValidationResult;
  description: string;
}

/**
 * Configuration validator class
 * Provides comprehensive validation for all configuration objects
 */
export class ConfigValidator {
  private static readonly REQUIRED_THEME_COLORS = [
    'primary', 'secondary', 'background', 'foreground', 'accent',
    'error', 'warning', 'success', 'info', 'muted', 'highlight',
    'border', 'selection'
  ];

  private static readonly REQUIRED_COMPONENT_STYLES = [
    'header', 'content', 'status', 'border', 'scrollbar', 'selection'
  ];

  private static readonly VALID_COMPONENT_TYPES = [
    'stream-metrics', 'channel-status', 'system-resources', 'alert-panel',
    'help-panel', 'status-bar', 'search-panel'
  ];

  /**
   * Validates complete monitoring configuration
   * @param config Configuration to validate
   * @returns Validation result
   */
  static validateMonitoringConfig(config: MonitoringConfig): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      critical: []
    };

    // Version validation
    if (!config.version || typeof config.version !== 'string') {
      result.errors.push('Configuration version is required and must be a string');
    } else if (!this.isValidVersion(config.version)) {
      result.warnings.push(`Configuration version '${config.version}' format is not standard (expected x.y.z)`);
    }

    // Theme validation
    if (!config.theme || typeof config.theme !== 'string') {
      result.errors.push('Theme is required and must be a string');
    }

    // Layout validation
    if (!config.layout || typeof config.layout !== 'string') {
      result.errors.push('Layout is required and must be a string');
    }

    // Refresh interval validation
    if (typeof config.refreshInterval !== 'number') {
      result.errors.push('Refresh interval must be a number');
    } else if (config.refreshInterval < 1000) {
      result.errors.push('Refresh interval must be at least 1000ms');
    } else if (config.refreshInterval < 2000) {
      result.warnings.push('Refresh interval below 2000ms may impact performance');
    }

    // Components validation
    if (!Array.isArray(config.components)) {
      result.critical.push('Components must be an array');
    } else {
      config.components.forEach((component, index) => {
        const componentResult = this.validateComponentConfig(component, index);
        result.errors.push(...componentResult.errors);
        result.warnings.push(...componentResult.warnings);
        result.critical.push(...componentResult.critical);
      });

      if (config.components.length === 0) {
        result.warnings.push('No components configured - interface will be empty');
      } else if (config.components.length > 10) {
        result.warnings.push('More than 10 components may impact performance');
      }
    }

    // Custom themes validation
    if (config.customThemes && !Array.isArray(config.customThemes)) {
      result.errors.push('Custom themes must be an array');
    } else if (config.customThemes) {
      config.customThemes.forEach((theme, index) => {
        const themeResult = this.validateThemeConfig(theme, `customThemes[${index}]`);
        result.errors.push(...themeResult.errors);
        result.warnings.push(...themeResult.warnings);
        result.critical.push(...themeResult.critical);
      });
    }

    // Custom layouts validation
    if (config.customLayouts && !Array.isArray(config.customLayouts)) {
      result.errors.push('Custom layouts must be an array');
    } else if (config.customLayouts) {
      config.customLayouts.forEach((layout, index) => {
        const layoutResult = this.validateLayoutConfig(layout, `customLayouts[${index}]`);
        result.errors.push(...layoutResult.errors);
        result.warnings.push(...layoutResult.warnings);
        result.critical.push(...layoutResult.critical);
      });
    }

    // Preferences validation
    if (!config.preferences) {
      result.errors.push('User preferences are required');
    } else {
      const preferencesResult = this.validateUserPreferences(config.preferences);
      result.errors.push(...preferencesResult.errors);
      result.warnings.push(...preferencesResult.warnings);
      result.critical.push(...preferencesResult.critical);
    }

    // Set overall validity
    result.valid = result.errors.length === 0 && result.critical.length === 0;

    return result;
  }

  /**
   * Validates component configuration
   * @param component Component configuration to validate
   * @param index Component index for error messages
   * @returns Validation result
   */
  static validateComponentConfig(component: ComponentConfig, index?: number): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      critical: []
    };

    const prefix = index !== undefined ? `Component[${index}]` : 'Component';

    // Type validation
    if (!component.type || typeof component.type !== 'string') {
      result.errors.push(`${prefix}: type is required and must be a string`);
    } else if (!this.VALID_COMPONENT_TYPES.includes(component.type)) {
      result.warnings.push(`${prefix}: type '${component.type}' is not a recognized component type`);
    }

    // Position validation
    if (!component.position || typeof component.position !== 'object') {
      result.errors.push(`${prefix}: position is required and must be an object`);
    } else {
      const { x, y, width, height } = component.position;
      
      if (typeof x !== 'number' || x < 0) {
        result.errors.push(`${prefix}: position.x must be a non-negative number`);
      }
      
      if (typeof y !== 'number' || y < 0) {
        result.errors.push(`${prefix}: position.y must be a non-negative number`);
      }
      
      if (typeof width !== 'number' || width <= 0) {
        result.errors.push(`${prefix}: position.width must be a positive number`);
      }
      
      if (typeof height !== 'number' || height <= 0) {
        result.errors.push(`${prefix}: position.height must be a positive number`);
      }
    }

    // Size validation
    if (!component.size || typeof component.size !== 'object') {
      result.errors.push(`${prefix}: size is required and must be an object`);
    } else {
      const { minWidth, minHeight, maxWidth, maxHeight } = component.size;
      
      if (typeof minWidth !== 'number' || minWidth <= 0) {
        result.errors.push(`${prefix}: size.minWidth must be a positive number`);
      }
      
      if (typeof minHeight !== 'number' || minHeight <= 0) {
        result.errors.push(`${prefix}: size.minHeight must be a positive number`);
      }
      
      if (maxWidth !== undefined && (typeof maxWidth !== 'number' || maxWidth < minWidth)) {
        result.errors.push(`${prefix}: size.maxWidth must be a number >= minWidth`);
      }
      
      if (maxHeight !== undefined && (typeof maxHeight !== 'number' || maxHeight < minHeight)) {
        result.errors.push(`${prefix}: size.maxHeight must be a number >= minHeight`);
      }
    }

    // Visibility validation
    if (typeof component.visible !== 'boolean') {
      result.errors.push(`${prefix}: visible must be a boolean`);
    }

    // Priority validation
    if (typeof component.priority !== 'number') {
      result.errors.push(`${prefix}: priority must be a number`);
    } else if (component.priority < 1 || component.priority > 10) {
      result.errors.push(`${prefix}: priority must be between 1 and 10`);
    }

    // Config validation
    if (!component.config || typeof component.config !== 'object') {
      result.errors.push(`${prefix}: config is required and must be an object`);
    }

    result.valid = result.errors.length === 0 && result.critical.length === 0;
    return result;
  }

  /**
   * Validates component layout configuration
   * @param component Component layout to validate
   * @param index Optional index for error messages
   * @returns Validation result
   */
  static validateComponentLayout(component: ComponentLayout, index?: number): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      critical: []
    };

    const prefix = index !== undefined ? `components[${index}]` : 'component';

    // Type validation
    if (!component.type || typeof component.type !== 'string') {
      result.errors.push(`${prefix}: type is required and must be a string`);
    }

    // Position validation
    if (!component.position || typeof component.position !== 'object') {
      result.errors.push(`${prefix}: position is required and must be an object`);
    } else {
      const { x, y } = component.position;
      if (typeof x !== 'number' || x < 0) {
        result.errors.push(`${prefix}: position.x must be a non-negative number`);
      }
      if (typeof y !== 'number' || y < 0) {
        result.errors.push(`${prefix}: position.y must be a non-negative number`);
      }
    }

    // Size validation
    if (!component.size || typeof component.size !== 'object') {
      result.errors.push(`${prefix}: size is required and must be an object`);
    } else {
      const { minWidth, minHeight } = component.size;
      if (typeof minWidth !== 'number' || minWidth <= 0) {
        result.errors.push(`${prefix}: size.minWidth must be a positive number`);
      }
      if (typeof minHeight !== 'number' || minHeight <= 0) {
        result.errors.push(`${prefix}: size.minHeight must be a positive number`);
      }
    }

    // Config validation
    if (!component.config || typeof component.config !== 'object') {
      result.errors.push(`${prefix}: config is required and must be an object`);
    }

    result.valid = result.errors.length === 0 && result.critical.length === 0;
    return result;
  }

  /**
   * Validates theme configuration
   * @param theme Theme configuration to validate
   * @param context Context for error messages
   * @returns Validation result
   */
  static validateThemeConfig(theme: ThemeConfig, context = 'Theme'): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      critical: []
    };

    // ID validation
    if (!theme.id || typeof theme.id !== 'string') {
      result.errors.push(`${context}: id is required and must be a string`);
    } else if (!/^[a-zA-Z0-9_-]+$/.test(theme.id)) {
      result.errors.push(`${context}: id must contain only alphanumeric characters, underscore, and dash`);
    }

    // Name validation
    if (!theme.name || typeof theme.name !== 'string') {
      result.errors.push(`${context}: name is required and must be a string`);
    }

    // Built-in flag validation
    if (typeof theme.isBuiltIn !== 'boolean') {
      result.errors.push(`${context}: isBuiltIn must be a boolean`);
    }

    // Colors validation
    if (!theme.colors || typeof theme.colors !== 'object') {
      result.critical.push(`${context}: colors is required and must be an object`);
    } else {
      for (const colorName of this.REQUIRED_THEME_COLORS) {
        if (!theme.colors[colorName as keyof typeof theme.colors]) {
          result.errors.push(`${context}: colors.${colorName} is required`);
        } else if (!this.isValidColor(theme.colors[colorName as keyof typeof theme.colors])) {
          result.warnings.push(`${context}: colors.${colorName} does not appear to be a valid color`);
        }
      }
    }

    // Fonts validation
    if (!theme.fonts || typeof theme.fonts !== 'object') {
      result.errors.push(`${context}: fonts is required and must be an object`);
    } else {
      if (!theme.fonts.family || typeof theme.fonts.family !== 'string') {
        result.errors.push(`${context}: fonts.family is required and must be a string`);
      }
      
      if (typeof theme.fonts.size !== 'number' || theme.fonts.size <= 0) {
        result.errors.push(`${context}: fonts.size must be a positive number`);
      }
      
      if (!['normal', 'bold'].includes(theme.fonts.weight)) {
        result.errors.push(`${context}: fonts.weight must be 'normal' or 'bold'`);
      }
      
      if (!['normal', 'italic'].includes(theme.fonts.style)) {
        result.errors.push(`${context}: fonts.style must be 'normal' or 'italic'`);
      }
    }

    // Borders validation
    if (!theme.borders || typeof theme.borders !== 'object') {
      result.errors.push(`${context}: borders is required and must be an object`);
    } else {
      if (!['line', 'bg', 'none'].includes(theme.borders.type)) {
        result.errors.push(`${context}: borders.type must be 'line', 'bg', or 'none'`);
      }
      
      if (!['solid', 'dashed', 'dotted'].includes(theme.borders.style)) {
        result.errors.push(`${context}: borders.style must be 'solid', 'dashed', or 'dotted'`);
      }
    }

    // Component styles validation
    if (!theme.components || typeof theme.components !== 'object') {
      result.errors.push(`${context}: components is required and must be an object`);
    } else {
      for (const styleName of this.REQUIRED_COMPONENT_STYLES) {
        if (!theme.components[styleName as keyof typeof theme.components]) {
          result.errors.push(`${context}: components.${styleName} is required`);
        }
      }
    }

    result.valid = result.errors.length === 0 && result.critical.length === 0;
    return result;
  }

  /**
   * Validates layout configuration
   * @param layout Layout configuration to validate
   * @param context Context for error messages
   * @returns Validation result
   */
  static validateLayoutConfig(layout: LayoutConfig, context = 'Layout'): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      critical: []
    };

    // ID validation
    if (!layout.id || typeof layout.id !== 'string') {
      result.errors.push(`${context}: id is required and must be a string`);
    } else if (!/^[a-zA-Z0-9_-]+$/.test(layout.id)) {
      result.errors.push(`${context}: id must contain only alphanumeric characters, underscore, and dash`);
    }

    // Name validation
    if (!layout.name || typeof layout.name !== 'string') {
      result.errors.push(`${context}: name is required and must be a string`);
    }

    // Built-in flag validation
    if (typeof layout.isBuiltIn !== 'boolean') {
      result.errors.push(`${context}: isBuiltIn must be a boolean`);
    }

    // Responsive flag validation
    if (typeof layout.responsive !== 'boolean') {
      result.errors.push(`${context}: responsive must be a boolean`);
    }

    // Grid validation
    if (!layout.grid || typeof layout.grid !== 'object') {
      result.errors.push(`${context}: grid is required and must be an object`);
    } else {
      const { rows, cols, cellWidth, cellHeight, padding } = layout.grid;
      
      if (typeof rows !== 'number' || rows <= 0) {
        result.errors.push(`${context}: grid.rows must be a positive number`);
      }
      
      if (typeof cols !== 'number' || cols <= 0) {
        result.errors.push(`${context}: grid.cols must be a positive number`);
      }
      
      if (typeof cellWidth !== 'number' || cellWidth <= 0) {
        result.errors.push(`${context}: grid.cellWidth must be a positive number`);
      }
      
      if (typeof cellHeight !== 'number' || cellHeight <= 0) {
        result.errors.push(`${context}: grid.cellHeight must be a positive number`);
      }
      
      if (typeof padding !== 'number' || padding < 0) {
        result.errors.push(`${context}: grid.padding must be a non-negative number`);
      }
    }

    // Components validation
    if (!Array.isArray(layout.components)) {
      result.errors.push(`${context}: components must be an array`);
    } else {
      layout.components.forEach((component, index) => {
        const componentResult = this.validateComponentLayout(component, index);
        result.errors.push(...componentResult.errors.map(e => `${context}.${e}`));
        result.warnings.push(...componentResult.warnings.map(w => `${context}.${w}`));
        result.critical.push(...componentResult.critical.map(c => `${context}.${c}`));
      });
    }

    // Min terminal size validation
    if (!layout.minTerminalSize || typeof layout.minTerminalSize !== 'object') {
      result.errors.push(`${context}: minTerminalSize is required and must be an object`);
    } else {
      if (typeof layout.minTerminalSize.width !== 'number' || layout.minTerminalSize.width < 60) {
        result.errors.push(`${context}: minTerminalSize.width must be at least 60`);
      }
      
      if (typeof layout.minTerminalSize.height !== 'number' || layout.minTerminalSize.height < 20) {
        result.errors.push(`${context}: minTerminalSize.height must be at least 20`);
      }
    }

    result.valid = result.errors.length === 0 && result.critical.length === 0;
    return result;
  }

  /**
   * Validates user preferences
   * @param preferences User preferences to validate
   * @returns Validation result
   */
  static validateUserPreferences(preferences: UserPreferences): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      critical: []
    };

    const booleanFields = [
      'autoSave', 'confirmActions', 'showHelp', 'keyboardShortcuts',
      'soundEnabled', 'compactMode', 'showTimestamps'
    ];

    for (const field of booleanFields) {
      if (typeof preferences[field as keyof UserPreferences] !== 'boolean') {
        result.errors.push(`preferences.${field} must be a boolean`);
      }
    }

    // Animation speed validation
    if (!['slow', 'normal', 'fast'].includes(preferences.animationSpeed)) {
      result.errors.push('preferences.animationSpeed must be "slow", "normal", or "fast"');
    }

    // Max history items validation
    if (typeof preferences.maxHistoryItems !== 'number' || preferences.maxHistoryItems < 10) {
      result.errors.push('preferences.maxHistoryItems must be a number >= 10');
    } else if (preferences.maxHistoryItems > 10000) {
      result.warnings.push('preferences.maxHistoryItems > 10000 may impact memory usage');
    }

    result.valid = result.errors.length === 0 && result.critical.length === 0;
    return result;
  }

  /**
   * Validates if a version string follows semantic versioning
   * @param version Version string to validate
   * @returns True if valid version format
   */
  private static isValidVersion(version: string): boolean {
    const versionRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9-.]+)?(\+[a-zA-Z0-9-.]+)?$/;
    return versionRegex.test(version);
  }

  /**
   * Validates if a string is a valid color value
   * @param color Color string to validate
   * @returns True if valid color
   */
  private static isValidColor(color: string): boolean {
    // Check for hex colors
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
      return true;
    }
    
    // Check for named colors (basic set)
    const namedColors = [
      'black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white',
      'gray', 'grey', 'transparent', 'inherit', 'initial', 'unset'
    ];
    
    if (namedColors.includes(color.toLowerCase())) {
      return true;
    }
    
    // Check for RGB/RGBA with value validation
    const rgbMatch = color.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
    if (rgbMatch && rgbMatch[1] && rgbMatch[2] && rgbMatch[3]) {
      const r = parseInt(rgbMatch[1]);
      const g = parseInt(rgbMatch[2]);
      const b = parseInt(rgbMatch[3]);
      return r <= 255 && g <= 255 && b <= 255;
    }
    
    const rgbaMatch = color.match(/^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([01]?(?:\.\d+)?)\s*\)$/);
    if (rgbaMatch && rgbaMatch[1] && rgbaMatch[2] && rgbaMatch[3] && rgbaMatch[4] !== undefined) {
      const r = parseInt(rgbaMatch[1]);
      const g = parseInt(rgbaMatch[2]);
      const b = parseInt(rgbaMatch[3]);
      const a = parseFloat(rgbaMatch[4]);
      return r <= 255 && g <= 255 && b <= 255 && a >= 0 && a <= 1;
    }
    
    return false;
  }

  /**
   * Creates error message from validation result
   * @param result Validation result
   * @returns Formatted error message
   */
  static createErrorMessage(result: ValidationResult): string {
    const messages: string[] = [];
    
    if (result.critical.length > 0) {
      messages.push('Critical errors:');
      messages.push(...result.critical.map(e => `  • ${e}`));
    }
    
    if (result.errors.length > 0) {
      messages.push('Errors:');
      messages.push(...result.errors.map(e => `  • ${e}`));
    }
    
    if (result.warnings.length > 0) {
      messages.push('Warnings:');
      messages.push(...result.warnings.map(w => `  • ${w}`));
    }
    
    return messages.join('\n');
  }
}
