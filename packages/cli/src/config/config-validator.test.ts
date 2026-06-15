/**
 * Tests for config-validator.ts - Configuration validation utilities
 */

import { ConfigValidator } from './config-validator';
import { MonitoringConfig, ThemeConfig, LayoutConfig, ComponentConfig, ComponentLayout, UserPreferences } from '../types/monitoring';

describe('ConfigValidator', () => {
  describe('validateMonitoringConfig', () => {
    const createValidConfig = (): MonitoringConfig => ({
      version: '1.0.0',
      theme: 'default',
      layout: 'default',
      refreshInterval: 5000,
      components: [
        {
          type: 'stream-metrics',
          position: { x: 0, y: 0, width: 8, height: 6 },
          size: { minWidth: 40, minHeight: 15 },
          visible: true,
          priority: 1,
          config: { priority: 1 },
        },
      ],
      customThemes: [],
      customLayouts: [],
      preferences: {
        autoSave: true,
        confirmActions: true,
        showHelp: true,
        keyboardShortcuts: true,
        soundEnabled: false,
        compactMode: false,
        showTimestamps: true,
        animationSpeed: 'normal',
        maxHistoryItems: 100,
      },
    });

    it('should validate valid monitoring configuration', () => {
      const config = createValidConfig();
      const result = ConfigValidator.validateMonitoringConfig(config);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.critical).toHaveLength(0);
    });

    it('should reject config without version', () => {
      const config = createValidConfig();
      delete (config as any).version;

      const result = ConfigValidator.validateMonitoringConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Configuration version is required and must be a string');
    });

    it('should warn about non-standard version format', () => {
      const config = createValidConfig();
      config.version = 'invalid-version';

      const result = ConfigValidator.validateMonitoringConfig(config);

      expect(result.warnings).toContain(
        "Configuration version 'invalid-version' format is not standard (expected x.y.z)"
      );
    });

    it('should reject config without theme', () => {
      const config = createValidConfig();
      delete (config as any).theme;

      const result = ConfigValidator.validateMonitoringConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Theme is required and must be a string');
    });

    it('should reject config without layout', () => {
      const config = createValidConfig();
      delete (config as any).layout;

      const result = ConfigValidator.validateMonitoringConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Layout is required and must be a string');
    });

    it('should reject config with invalid refresh interval', () => {
      const config = createValidConfig();
      config.refreshInterval = 500;

      const result = ConfigValidator.validateMonitoringConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Refresh interval must be at least 1000ms');
    });

    it('should warn about low refresh interval', () => {
      const config = createValidConfig();
      config.refreshInterval = 1500;

      const result = ConfigValidator.validateMonitoringConfig(config);

      expect(result.warnings).toContain('Refresh interval below 2000ms may impact performance');
    });

    it('should reject config with non-array components', () => {
      const config = createValidConfig();
      (config as any).components = 'not-an-array';

      const result = ConfigValidator.validateMonitoringConfig(config);

      expect(result.valid).toBe(false);
      expect(result.critical).toContain('Components must be an array');
    });

    it('should warn about empty components array', () => {
      const config = createValidConfig();
      config.components = [];

      const result = ConfigValidator.validateMonitoringConfig(config);

      expect(result.warnings).toContain('No components configured - interface will be empty');
    });

    it('should warn about too many components', () => {
      const config = createValidConfig();
      config.components = new Array(15).fill(0).map(() => ({
        type: 'stream-metrics',
        position: { x: 0, y: 0, width: 8, height: 6 },
        size: { minWidth: 40, minHeight: 15 },
        visible: true,
        priority: 1,
        config: { priority: 1 },
      }));

      const result = ConfigValidator.validateMonitoringConfig(config);

      expect(result.warnings).toContain('More than 10 components may impact performance');
    });

    it('should reject config with invalid custom themes', () => {
      const config = createValidConfig();
      (config as any).customThemes = 'not-an-array';

      const result = ConfigValidator.validateMonitoringConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Custom themes must be an array');
    });

    it('should reject config with invalid custom layouts', () => {
      const config = createValidConfig();
      (config as any).customLayouts = 'not-an-array';

      const result = ConfigValidator.validateMonitoringConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Custom layouts must be an array');
    });

    it('should reject config without preferences', () => {
      const config = createValidConfig();
      delete (config as any).preferences;

      const result = ConfigValidator.validateMonitoringConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('User preferences are required');
    });
  });

  describe('validateComponentConfig', () => {
    const createValidComponent = (): ComponentConfig => ({
      type: 'stream-metrics',
      position: { x: 0, y: 0, width: 8, height: 6 },
      size: { minWidth: 40, minHeight: 15 },
      visible: true,
      priority: 1,
      config: { priority: 1 },
    });

    it('should validate valid component configuration', () => {
      const component = createValidComponent();
      const result = ConfigValidator.validateComponentConfig(component);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject component without type', () => {
      const component = createValidComponent();
      delete (component as any).type;

      const result = ConfigValidator.validateComponentConfig(component);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Component: type is required and must be a string');
    });

    it('should warn about unrecognized component type', () => {
      const component = createValidComponent();
      component.type = 'unknown-type';

      const result = ConfigValidator.validateComponentConfig(component);

      expect(result.warnings).toContain(
        "Component: type 'unknown-type' is not a recognized component type"
      );
    });

    it('should reject component with invalid position', () => {
      const component = createValidComponent();
      (component as any).position = 'invalid';

      const result = ConfigValidator.validateComponentConfig(component);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Component: position is required and must be an object');
    });

    it('should reject component with negative position values', () => {
      const component = createValidComponent();
      component.position.x = -1;
      component.position.y = -1;

      const result = ConfigValidator.validateComponentConfig(component);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Component: position.x must be a non-negative number');
      expect(result.errors).toContain('Component: position.y must be a non-negative number');
    });

    it('should reject component with invalid size', () => {
      const component = createValidComponent();
      component.size.minWidth = 0;
      component.size.minHeight = 0;

      const result = ConfigValidator.validateComponentConfig(component);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Component: size.minWidth must be a positive number');
      expect(result.errors).toContain('Component: size.minHeight must be a positive number');
    });

    it('should reject component with invalid max size', () => {
      const component = createValidComponent();
      component.size.maxWidth = 30; // less than minWidth
      component.size.maxHeight = 10; // less than minHeight

      const result = ConfigValidator.validateComponentConfig(component);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Component: size.maxWidth must be a number >= minWidth');
      expect(result.errors).toContain('Component: size.maxHeight must be a number >= minHeight');
    });

    it('should reject component with invalid visible property', () => {
      const component = createValidComponent();
      (component as any).visible = 'true';

      const result = ConfigValidator.validateComponentConfig(component);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Component: visible must be a boolean');
    });

    it('should reject component with invalid priority', () => {
      const component = createValidComponent();
      component.priority = 15;

      const result = ConfigValidator.validateComponentConfig(component);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Component: priority must be between 1 and 10');
    });

    it('should reject component without config', () => {
      const component = createValidComponent();
      delete (component as any).config;

      const result = ConfigValidator.validateComponentConfig(component);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Component: config is required and must be an object');
    });
  });

  describe('validateComponentLayout', () => {
    const createValidComponentLayout = (): ComponentLayout => ({
      type: 'stream-metrics',
      position: { x: 0, y: 0, width: 8, height: 6 },
      size: { minWidth: 40, minHeight: 15 },
      config: { priority: 1 },
    });

    it('should validate valid component layout', () => {
      const component = createValidComponentLayout();
      const result = ConfigValidator.validateComponentLayout(component);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject component layout without type', () => {
      const component = createValidComponentLayout();
      delete (component as any).type;

      const result = ConfigValidator.validateComponentLayout(component);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('component: type is required and must be a string');
    });

    it('should reject component layout with invalid position', () => {
      const component = createValidComponentLayout();
      component.position.x = -1;

      const result = ConfigValidator.validateComponentLayout(component);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('component: position.x must be a non-negative number');
    });

    it('should reject component layout with invalid size', () => {
      const component = createValidComponentLayout();
      component.size.minWidth = 0;

      const result = ConfigValidator.validateComponentLayout(component);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('component: size.minWidth must be a positive number');
    });

    it('should reject component layout without config', () => {
      const component = createValidComponentLayout();
      delete (component as any).config;

      const result = ConfigValidator.validateComponentLayout(component);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('component: config is required and must be an object');
    });
  });

  describe('validateThemeConfig', () => {
    const createValidTheme = (): ThemeConfig => ({
      id: 'test-theme',
      name: 'Test Theme',
      isBuiltIn: false,
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
      components: {
        header: { fg: '#ffffff', bg: '#0066cc', bold: true },
        content: { fg: '#ffffff', bg: '#000000' },
        status: { fg: '#17a2b8', bg: '#000000' },
        border: { fg: '#666666' },
        scrollbar: { fg: '#666666', bg: '#333333' },
        selection: { fg: '#ffffff', bg: '#0066cc' },
      },
    });

    it('should validate valid theme configuration', () => {
      const theme = createValidTheme();
      const result = ConfigValidator.validateThemeConfig(theme);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject theme without id', () => {
      const theme = createValidTheme();
      delete (theme as any).id;

      const result = ConfigValidator.validateThemeConfig(theme);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Theme: id is required and must be a string');
    });

    it('should reject theme with invalid id format', () => {
      const theme = createValidTheme();
      theme.id = 'invalid id with spaces';

      const result = ConfigValidator.validateThemeConfig(theme);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'Theme: id must contain only alphanumeric characters, underscore, and dash'
      );
    });

    it('should reject theme without name', () => {
      const theme = createValidTheme();
      delete (theme as any).name;

      const result = ConfigValidator.validateThemeConfig(theme);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Theme: name is required and must be a string');
    });

    it('should reject theme with invalid isBuiltIn flag', () => {
      const theme = createValidTheme();
      (theme as any).isBuiltIn = 'true';

      const result = ConfigValidator.validateThemeConfig(theme);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Theme: isBuiltIn must be a boolean');
    });

    it('should reject theme without colors', () => {
      const theme = createValidTheme();
      delete (theme as any).colors;

      const result = ConfigValidator.validateThemeConfig(theme);

      expect(result.valid).toBe(false);
      expect(result.critical).toContain('Theme: colors is required and must be an object');
    });

    it('should reject theme with missing required colors', () => {
      const theme = createValidTheme();
      (theme.colors as any).primary = undefined;

      const result = ConfigValidator.validateThemeConfig(theme);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Theme: colors.primary is required');
    });

    it('should warn about invalid color values', () => {
      const theme = createValidTheme();
      theme.colors.primary = 'invalid-color';

      const result = ConfigValidator.validateThemeConfig(theme);

      expect(result.warnings).toContain(
        'Theme: colors.primary does not appear to be a valid color'
      );
    });

    it('should reject theme without fonts', () => {
      const theme = createValidTheme();
      delete (theme as any).fonts;

      const result = ConfigValidator.validateThemeConfig(theme);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Theme: fonts is required and must be an object');
    });

    it('should reject theme with invalid font size', () => {
      const theme = createValidTheme();
      theme.fonts.size = 0;

      const result = ConfigValidator.validateThemeConfig(theme);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Theme: fonts.size must be a positive number');
    });

    it('should reject theme with invalid font weight', () => {
      const theme = createValidTheme();
      theme.fonts.weight = 'invalid' as any;

      const result = ConfigValidator.validateThemeConfig(theme);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Theme: fonts.weight must be 'normal' or 'bold'");
    });

    it('should reject theme with invalid font style', () => {
      const theme = createValidTheme();
      theme.fonts.style = 'invalid' as any;

      const result = ConfigValidator.validateThemeConfig(theme);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Theme: fonts.style must be 'normal' or 'italic'");
    });

    it('should reject theme without borders', () => {
      const theme = createValidTheme();
      delete (theme as any).borders;

      const result = ConfigValidator.validateThemeConfig(theme);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Theme: borders is required and must be an object');
    });

    it('should reject theme with invalid border type', () => {
      const theme = createValidTheme();
      theme.borders.type = 'invalid' as any;

      const result = ConfigValidator.validateThemeConfig(theme);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Theme: borders.type must be 'line', 'bg', or 'none'");
    });

    it('should reject theme with invalid border style', () => {
      const theme = createValidTheme();
      theme.borders.style = 'invalid' as any;

      const result = ConfigValidator.validateThemeConfig(theme);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Theme: borders.style must be 'solid', 'dashed', or 'dotted'");
    });

    it('should reject theme without components', () => {
      const theme = createValidTheme();
      delete (theme as any).components;

      const result = ConfigValidator.validateThemeConfig(theme);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Theme: components is required and must be an object');
    });

    it('should reject theme with missing component styles', () => {
      const theme = createValidTheme();
      (theme.components as any).header = undefined;

      const result = ConfigValidator.validateThemeConfig(theme);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Theme: components.header is required');
    });
  });

  describe('validateLayoutConfig', () => {
    const createValidLayout = (): LayoutConfig => ({
      id: 'test-layout',
      name: 'Test Layout',
      isBuiltIn: false,
      responsive: true,
      grid: {
        rows: 12,
        cols: 12,
        cellWidth: 10,
        cellHeight: 3,
        padding: 1,
      },
      components: [
        {
          type: 'stream-metrics',
          position: { x: 0, y: 0, width: 8, height: 6 },
          size: { minWidth: 40, minHeight: 15 },
          config: { priority: 1 },
        },
      ],
      minTerminalSize: { width: 120, height: 40 },
    });

    it('should validate valid layout configuration', () => {
      const layout = createValidLayout();
      const result = ConfigValidator.validateLayoutConfig(layout);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject layout without id', () => {
      const layout = createValidLayout();
      delete (layout as any).id;

      const result = ConfigValidator.validateLayoutConfig(layout);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Layout: id is required and must be a string');
    });

    it('should reject layout with invalid id format', () => {
      const layout = createValidLayout();
      layout.id = 'invalid id with spaces';

      const result = ConfigValidator.validateLayoutConfig(layout);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'Layout: id must contain only alphanumeric characters, underscore, and dash'
      );
    });

    it('should reject layout without name', () => {
      const layout = createValidLayout();
      delete (layout as any).name;

      const result = ConfigValidator.validateLayoutConfig(layout);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Layout: name is required and must be a string');
    });

    it('should reject layout with invalid responsive flag', () => {
      const layout = createValidLayout();
      (layout as any).responsive = 'true';

      const result = ConfigValidator.validateLayoutConfig(layout);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Layout: responsive must be a boolean');
    });

    it('should reject layout without grid', () => {
      const layout = createValidLayout();
      delete (layout as any).grid;

      const result = ConfigValidator.validateLayoutConfig(layout);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Layout: grid is required and must be an object');
    });

    it('should reject layout with invalid grid properties', () => {
      const layout = createValidLayout();
      layout.grid.rows = 0;
      layout.grid.cols = 0;
      layout.grid.cellWidth = 0;
      layout.grid.cellHeight = 0;
      layout.grid.padding = -1;

      const result = ConfigValidator.validateLayoutConfig(layout);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Layout: grid.rows must be a positive number');
      expect(result.errors).toContain('Layout: grid.cols must be a positive number');
      expect(result.errors).toContain('Layout: grid.cellWidth must be a positive number');
      expect(result.errors).toContain('Layout: grid.cellHeight must be a positive number');
      expect(result.errors).toContain('Layout: grid.padding must be a non-negative number');
    });

    it('should reject layout with non-array components', () => {
      const layout = createValidLayout();
      (layout as any).components = 'not-an-array';

      const result = ConfigValidator.validateLayoutConfig(layout);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Layout: components must be an array');
    });

    it('should reject layout without minTerminalSize', () => {
      const layout = createValidLayout();
      delete (layout as any).minTerminalSize;

      const result = ConfigValidator.validateLayoutConfig(layout);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Layout: minTerminalSize is required and must be an object');
    });

    it('should reject layout with invalid minTerminalSize', () => {
      const layout = createValidLayout();
      layout.minTerminalSize.width = 50;
      layout.minTerminalSize.height = 10;

      const result = ConfigValidator.validateLayoutConfig(layout);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Layout: minTerminalSize.width must be at least 60');
      expect(result.errors).toContain('Layout: minTerminalSize.height must be at least 20');
    });
  });

  describe('validateUserPreferences', () => {
    const createValidPreferences = (): UserPreferences => ({
      autoSave: true,
      confirmActions: true,
      showHelp: true,
      keyboardShortcuts: true,
      soundEnabled: false,
      compactMode: false,
      showTimestamps: true,
      animationSpeed: 'normal',
      maxHistoryItems: 100,
    });

    it('should validate valid user preferences', () => {
      const preferences = createValidPreferences();
      const result = ConfigValidator.validateUserPreferences(preferences);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject preferences with invalid boolean fields', () => {
      const preferences = createValidPreferences();
      (preferences as any).autoSave = 'true';
      (preferences as any).confirmActions = 'false';

      const result = ConfigValidator.validateUserPreferences(preferences);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('preferences.autoSave must be a boolean');
      expect(result.errors).toContain('preferences.confirmActions must be a boolean');
    });

    it('should reject preferences with invalid animation speed', () => {
      const preferences = createValidPreferences();
      preferences.animationSpeed = 'invalid' as any;

      const result = ConfigValidator.validateUserPreferences(preferences);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('preferences.animationSpeed must be "slow", "normal", or "fast"');
    });

    it('should reject preferences with invalid maxHistoryItems', () => {
      const preferences = createValidPreferences();
      preferences.maxHistoryItems = 5;

      const result = ConfigValidator.validateUserPreferences(preferences);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('preferences.maxHistoryItems must be a number >= 10');
    });

    it('should warn about high maxHistoryItems', () => {
      const preferences = createValidPreferences();
      preferences.maxHistoryItems = 15000;

      const result = ConfigValidator.validateUserPreferences(preferences);

      expect(result.warnings).toContain('preferences.maxHistoryItems > 10000 may impact memory usage');
    });
  });

  describe('isValidVersion', () => {
    const isValidVersion = (ConfigValidator as any).isValidVersion;

    it('should validate standard semantic versions', () => {
      expect(isValidVersion('1.0.0')).toBe(true);
      expect(isValidVersion('2.1.3')).toBe(true);
      expect(isValidVersion('10.20.30')).toBe(true);
    });

    it('should validate versions with pre-release identifiers', () => {
      expect(isValidVersion('1.0.0-alpha')).toBe(true);
      expect(isValidVersion('1.0.0-beta.1')).toBe(true);
      expect(isValidVersion('1.0.0-rc.1')).toBe(true);
    });

    it('should validate versions with build metadata', () => {
      expect(isValidVersion('1.0.0+build.1')).toBe(true);
      expect(isValidVersion('1.0.0-alpha+build.1')).toBe(true);
    });

    it('should reject invalid version formats', () => {
      expect(isValidVersion('1.0')).toBe(false);
      expect(isValidVersion('1')).toBe(false);
      expect(isValidVersion('v1.0.0')).toBe(false);
      expect(isValidVersion('1.0.0.0')).toBe(false);
      expect(isValidVersion('invalid')).toBe(false);
    });
  });

  describe('isValidColor', () => {
    const isValidColor = (ConfigValidator as any).isValidColor;

    it('should validate hex colors', () => {
      expect(isValidColor('#ffffff')).toBe(true);
      expect(isValidColor('#000000')).toBe(true);
      expect(isValidColor('#0066cc')).toBe(true);
      expect(isValidColor('#FFF')).toBe(true);
      expect(isValidColor('#000')).toBe(true);
    });

    it('should validate named colors', () => {
      expect(isValidColor('red')).toBe(true);
      expect(isValidColor('blue')).toBe(true);
      expect(isValidColor('green')).toBe(true);
      expect(isValidColor('white')).toBe(true);
      expect(isValidColor('black')).toBe(true);
      expect(isValidColor('transparent')).toBe(true);
    });

    it('should validate RGB colors', () => {
      expect(isValidColor('rgb(255, 255, 255)')).toBe(true);
      expect(isValidColor('rgb(0, 0, 0)')).toBe(true);
      expect(isValidColor('rgb(100, 150, 200)')).toBe(true);
    });

    it('should validate RGBA colors', () => {
      expect(isValidColor('rgba(255, 255, 255, 1)')).toBe(true);
      expect(isValidColor('rgba(0, 0, 0, 0.5)')).toBe(true);
      expect(isValidColor('rgba(100, 150, 200, 0.8)')).toBe(true);
    });

    it('should reject invalid colors', () => {
      expect(isValidColor('invalid')).toBe(false);
      expect(isValidColor('#gggggg')).toBe(false);
      expect(isValidColor('#12345')).toBe(false);
      expect(isValidColor('rgb(256, 256, 256)')).toBe(false);
      expect(isValidColor('rgba(100, 100, 100, 2)')).toBe(false);
    });
  });

  describe('createErrorMessage', () => {
    it('should create formatted error message with all error types', () => {
      const result = {
        valid: false,
        errors: ['Error 1', 'Error 2'],
        warnings: ['Warning 1', 'Warning 2'],
        critical: ['Critical 1', 'Critical 2'],
      };

      const message = ConfigValidator.createErrorMessage(result);

      expect(message).toContain('Critical errors:');
      expect(message).toContain('  • Critical 1');
      expect(message).toContain('  • Critical 2');
      expect(message).toContain('Errors:');
      expect(message).toContain('  • Error 1');
      expect(message).toContain('  • Error 2');
      expect(message).toContain('Warnings:');
      expect(message).toContain('  • Warning 1');
      expect(message).toContain('  • Warning 2');
    });

    it('should create message with only errors', () => {
      const result = {
        valid: false,
        errors: ['Error 1'],
        warnings: [],
        critical: [],
      };

      const message = ConfigValidator.createErrorMessage(result);

      expect(message).toContain('Errors:');
      expect(message).toContain('  • Error 1');
      expect(message).not.toContain('Critical errors:');
      expect(message).not.toContain('Warnings:');
    });

    it('should create message with only warnings', () => {
      const result = {
        valid: true,
        errors: [],
        warnings: ['Warning 1'],
        critical: [],
      };

      const message = ConfigValidator.createErrorMessage(result);

      expect(message).toContain('Warnings:');
      expect(message).toContain('  • Warning 1');
      expect(message).not.toContain('Errors:');
      expect(message).not.toContain('Critical errors:');
    });

    it('should create empty message when no errors or warnings', () => {
      const result = {
        valid: true,
        errors: [],
        warnings: [],
        critical: [],
      };

      const message = ConfigValidator.createErrorMessage(result);

      expect(message).toBe('');
    });
  });
});