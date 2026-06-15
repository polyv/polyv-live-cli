/**
 * Custom theme builder for creating and editing themes
 * Provides theme creation, editing, validation, and preview functionality
 */

import { EventEmitter } from 'events';
import { ThemeConfig, ColorScheme, FontConfig, BorderConfig, ComponentStyles, StyleConfig } from '../types/monitoring';
import { ConfigValidator } from './config-validator';
import { ConfigurationError } from '../utils/errors';

export interface ThemeBuilderOptions {
  enablePreview?: boolean;
  autoValidate?: boolean;
  strictMode?: boolean;
}

export interface ColorPalette {
  name: string;
  colors: string[];
  description?: string;
}

export interface ThemeTemplate {
  id: string;
  name: string;
  description: string;
  baseTheme: Partial<ThemeConfig>;
  category: 'dark' | 'light' | 'high-contrast' | 'custom';
}

export interface ThemePreviewData {
  themeId: string;
  components: string[];
  screenshot?: string;
  timestamp: Date;
}

/**
 * Custom theme builder class
 * Provides tools for creating and editing custom themes
 */
export class CustomThemeBuilder extends EventEmitter {
  private currentTheme: Partial<ThemeConfig> = {};
  private options: Required<ThemeBuilderOptions>;
  private colorPalettes: Map<string, ColorPalette> = new Map();
  private templates: Map<string, ThemeTemplate> = new Map();
  private validationErrors: string[] = [];
  private validationWarnings: string[] = [];

  constructor(options: ThemeBuilderOptions = {}) {
    super();
    
    this.options = {
      enablePreview: options.enablePreview ?? true,
      autoValidate: options.autoValidate ?? true,
      strictMode: options.strictMode ?? false,
    };

    // Load built-in color palettes
    this.loadBuiltInColorPalettes();
    
    // Load built-in templates
    this.loadBuiltInTemplates();
    
    // Initialize with basic theme structure
    this.initializeTheme();
  }

  /**
   * Starts building a new theme from scratch
   * @param baseTemplate Optional base template
   * @returns Theme builder instance for chaining
   */
  startNew(baseTemplate?: string): this {
    if (baseTemplate && this.templates.has(baseTemplate)) {
      const template = this.templates.get(baseTemplate)!;
      this.currentTheme = JSON.parse(JSON.stringify(template.baseTheme));
    } else {
      this.initializeTheme();
    }
    
    this.emit('theme:started', this.currentTheme);
    return this;
  }

  /**
   * Loads an existing theme for editing
   * @param theme Existing theme configuration
   * @returns Theme builder instance for chaining
   */
  loadTheme(theme: ThemeConfig): this {
    this.currentTheme = JSON.parse(JSON.stringify(theme));
    
    if (this.options.autoValidate) {
      this.validateCurrentTheme();
    }
    
    this.emit('theme:loaded', this.currentTheme);
    return this;
  }

  /**
   * Sets basic theme information
   * @param info Basic theme information
   * @returns Theme builder instance for chaining
   */
  setThemeInfo(info: {
    id: string;
    name: string;
    description?: string;
    author?: string;
    version?: string;
  }): this {
    this.currentTheme.id = info.id;
    this.currentTheme.name = info.name;
    if (info.description !== undefined) {
      this.currentTheme.description = info.description;
    }
    if (info.author !== undefined) {
      this.currentTheme.author = info.author;
    }
    this.currentTheme.version = info.version || '1.0.0';
    this.currentTheme.isBuiltIn = false;
    
    this.validateAndEmit('theme:info-updated');
    return this;
  }

  /**
   * Sets the color scheme
   * @param colors Color scheme or color palette name
   * @returns Theme builder instance for chaining
   */
  setColors(colors: Partial<ColorScheme> | string): this {
    if (typeof colors === 'string') {
      // Use predefined color palette
      const palette = this.colorPalettes.get(colors);
      if (!palette) {
        throw new ConfigurationError(`Color palette '${colors}' not found`);
      }
      
      this.currentTheme.colors = this.paletteToColorScheme(palette);
    } else {
      // Merge with existing colors
      this.currentTheme.colors = {
        ...this.getDefaultColors(),
        ...this.currentTheme.colors,
        ...colors,
      };
    }
    
    this.validateAndEmit('theme:colors-updated');
    return this;
  }

  /**
   * Sets individual color
   * @param colorName Color name
   * @param colorValue Color value
   * @returns Theme builder instance for chaining
   */
  setColor(colorName: keyof ColorScheme, colorValue: string): this {
    if (!this.currentTheme.colors) {
      this.currentTheme.colors = this.getDefaultColors();
    }
    
    this.currentTheme.colors[colorName] = colorValue;
    
    this.validateAndEmit('theme:color-updated', { colorName, colorValue });
    return this;
  }

  /**
   * Sets font configuration
   * @param fonts Font configuration
   * @returns Theme builder instance for chaining
   */
  setFonts(fonts: Partial<FontConfig>): this {
    this.currentTheme.fonts = {
      ...this.getDefaultFonts(),
      ...this.currentTheme.fonts,
      ...fonts,
    };
    
    this.validateAndEmit('theme:fonts-updated');
    return this;
  }

  /**
   * Sets border configuration
   * @param borders Border configuration
   * @returns Theme builder instance for chaining
   */
  setBorders(borders: Partial<BorderConfig>): this {
    this.currentTheme.borders = {
      ...this.getDefaultBorders(),
      ...this.currentTheme.borders,
      ...borders,
    };
    
    this.validateAndEmit('theme:borders-updated');
    return this;
  }

  /**
   * Sets component styles
   * @param componentStyles Component styles configuration
   * @returns Theme builder instance for chaining
   */
  setComponentStyles(componentStyles: Partial<ComponentStyles>): this {
    this.currentTheme.components = {
      ...this.getDefaultComponentStyles(),
      ...this.currentTheme.components,
      ...componentStyles,
    };
    
    this.validateAndEmit('theme:components-updated');
    return this;
  }

  /**
   * Sets style for a specific component
   * @param componentName Component name
   * @param style Style configuration
   * @returns Theme builder instance for chaining
   */
  setComponentStyle(
    componentName: keyof ComponentStyles,
    style: Partial<StyleConfig>
  ): this {
    if (!this.currentTheme.components) {
      this.currentTheme.components = this.getDefaultComponentStyles();
    }
    
    this.currentTheme.components[componentName] = {
      ...this.currentTheme.components[componentName],
      ...style,
    };
    
    this.validateAndEmit('theme:component-style-updated', { componentName, style });
    return this;
  }

  /**
   * Applies a color transformation to all colors
   * @param transformation Transformation function
   * @returns Theme builder instance for chaining
   */
  transformColors(transformation: (color: string) => string): this {
    if (!this.currentTheme.colors) {
      this.currentTheme.colors = this.getDefaultColors();
    }
    
    const transformedColors: Partial<ColorScheme> = {};
    
    for (const [key, value] of Object.entries(this.currentTheme.colors)) {
      transformedColors[key as keyof ColorScheme] = transformation(value);
    }
    
    this.currentTheme.colors = {
      ...this.currentTheme.colors,
      ...transformedColors,
    };
    
    this.validateAndEmit('theme:colors-transformed');
    return this;
  }

  /**
   * Adjusts brightness of all colors
   * @param factor Brightness factor (-1 to 1)
   * @returns Theme builder instance for chaining
   */
  adjustBrightness(factor: number): this {
    return this.transformColors(color => this.adjustColorBrightness(color, factor));
  }

  /**
   * Adjusts saturation of all colors
   * @param factor Saturation factor (-1 to 1)
   * @returns Theme builder instance for chaining
   */
  adjustSaturation(factor: number): this {
    return this.transformColors(color => this.adjustColorSaturation(color, factor));
  }

  /**
   * Generates complementary color scheme
   * @param baseColor Base color for generation
   * @returns Theme builder instance for chaining
   */
  generateComplementaryScheme(baseColor: string): this {
    const complementaryColors = this.generateComplementaryColors(baseColor);
    return this.setColors(complementaryColors);
  }

  /**
   * Validates current theme
   * @returns Validation result
   */
  validateCurrentTheme(): { valid: boolean; errors: string[]; warnings: string[] } {
    try {
      // Create a complete theme for validation
      const completeTheme = this.buildCompleteTheme();
      const validation = ConfigValidator.validateThemeConfig(completeTheme);
      
      this.validationErrors = [...validation.errors, ...validation.critical];
      this.validationWarnings = validation.warnings;
      
      return {
        valid: validation.valid,
        errors: this.validationErrors,
        warnings: this.validationWarnings,
      };
    } catch (error) {
      this.validationErrors = [error instanceof Error ? error.message : String(error)];
      this.validationWarnings = [];
      
      return {
        valid: false,
        errors: this.validationErrors,
        warnings: this.validationWarnings,
      };
    }
  }

  /**
   * Gets current validation errors
   * @returns Array of validation errors
   */
  getValidationErrors(): string[] {
    return [...this.validationErrors];
  }

  /**
   * Gets current validation warnings
   * @returns Array of validation warnings
   */
  getValidationWarnings(): string[] {
    return [...this.validationWarnings];
  }

  /**
   * Builds complete theme configuration
   * @returns Complete theme configuration
   */
  build(): ThemeConfig {
    const validation = this.validateCurrentTheme();
    
    if (!validation.valid) {
      if (this.options.strictMode) {
        throw new ConfigurationError(
          `Cannot build invalid theme: ${validation.errors.join(', ')}`
        );
      } else {
        console.warn('Building theme with validation errors:', validation.errors);
      }
    }
    
    const completeTheme = this.buildCompleteTheme();
    this.emit('theme:built', completeTheme);
    
    return completeTheme;
  }

  /**
   * Gets current theme progress
   * @returns Progress information
   */
  getProgress(): {
    completed: string[];
    missing: string[];
    percentage: number;
  } {
    const requiredFields = [
      'id', 'name', 'colors', 'fonts', 'borders', 'components'
    ];
    
    const completed = requiredFields.filter(field => 
      this.currentTheme[field as keyof ThemeConfig] !== undefined
    );
    
    const missing = requiredFields.filter(field => 
      this.currentTheme[field as keyof ThemeConfig] === undefined
    );
    
    return {
      completed,
      missing,
      percentage: (completed.length / requiredFields.length) * 100,
    };
  }

  /**
   * Gets current theme data
   * @returns Current theme data
   */
  getCurrentTheme(): Partial<ThemeConfig> {
    return JSON.parse(JSON.stringify(this.currentTheme));
  }

  /**
   * Gets available color palettes
   * @returns Array of color palette names
   */
  getAvailableColorPalettes(): string[] {
    return Array.from(this.colorPalettes.keys());
  }

  /**
   * Gets color palette by name
   * @param name Palette name
   * @returns Color palette or undefined
   */
  getColorPalette(name: string): ColorPalette | undefined {
    return this.colorPalettes.get(name);
  }

  /**
   * Adds a custom color palette
   * @param palette Color palette to add
   * @returns Theme builder instance for chaining
   */
  addColorPalette(palette: ColorPalette): this {
    this.colorPalettes.set(palette.name, palette);
    this.emit('palette:added', palette);
    return this;
  }

  /**
   * Gets available theme templates
   * @returns Array of template IDs
   */
  getAvailableTemplates(): string[] {
    return Array.from(this.templates.keys());
  }

  /**
   * Gets theme template by ID
   * @param id Template ID
   * @returns Theme template or undefined
   */
  getTemplate(id: string): ThemeTemplate | undefined {
    return this.templates.get(id);
  }

  /**
   * Adds a custom theme template
   * @param template Theme template to add
   * @returns Theme builder instance for chaining
   */
  addTemplate(template: ThemeTemplate): this {
    this.templates.set(template.id, template);
    this.emit('template:added', template);
    return this;
  }

  /**
   * Resets current theme to initial state
   * @returns Theme builder instance for chaining
   */
  reset(): this {
    this.initializeTheme();
    this.validationErrors = [];
    this.validationWarnings = [];
    this.emit('theme:reset');
    return this;
  }

  /**
   * Initializes theme with default structure
   */
  private initializeTheme(): void {
    this.currentTheme = {
      id: '',
      name: '',
      isBuiltIn: false,
      colors: this.getDefaultColors(),
      fonts: this.getDefaultFonts(),
      borders: this.getDefaultBorders(),
      components: this.getDefaultComponentStyles(),
    };
  }

  /**
   * Validates current theme and emits event
   * @param eventName Event name to emit
   * @param data Optional event data
   */
  private validateAndEmit(eventName: string, data?: any): void {
    if (this.options.autoValidate) {
      this.validateCurrentTheme();
    }
    
    this.emit(eventName, data);
  }

  /**
   * Builds complete theme with all required fields
   * @returns Complete theme configuration
   */
  private buildCompleteTheme(): ThemeConfig {
    return {
      id: this.currentTheme.id || 'custom-theme',
      name: this.currentTheme.name || 'Custom Theme',
      ...(this.currentTheme.description !== undefined && { description: this.currentTheme.description }),
      ...(this.currentTheme.author !== undefined && { author: this.currentTheme.author }),
      version: this.currentTheme.version || '1.0.0',
      isBuiltIn: false,
      colors: {
        ...this.getDefaultColors(),
        ...this.currentTheme.colors,
      },
      fonts: {
        ...this.getDefaultFonts(),
        ...this.currentTheme.fonts,
      },
      borders: {
        ...this.getDefaultBorders(),
        ...this.currentTheme.borders,
      },
      components: {
        ...this.getDefaultComponentStyles(),
        ...this.currentTheme.components,
      },
    };
  }

  /**
   * Gets default color scheme
   */
  private getDefaultColors(): ColorScheme {
    return {
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
    };
  }

  /**
   * Gets default font configuration
   */
  private getDefaultFonts(): FontConfig {
    return {
      family: 'monospace',
      size: 12,
      weight: 'normal',
      style: 'normal',
    };
  }

  /**
   * Gets default border configuration
   */
  private getDefaultBorders(): BorderConfig {
    return {
      type: 'line',
      style: 'solid',
      color: '#666666',
    };
  }

  /**
   * Gets default component styles
   */
  private getDefaultComponentStyles(): ComponentStyles {
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
   * Converts color palette to color scheme
   * @param palette Color palette
   * @returns Color scheme
   */
  private paletteToColorScheme(palette: ColorPalette): ColorScheme {
    const colors = palette.colors;
    return {
      primary: colors[0] || '#0066cc',
      secondary: colors[1] || '#6c757d',
      background: colors[2] || '#000000',
      foreground: colors[3] || '#ffffff',
      accent: colors[4] || '#17a2b8',
      error: colors[5] || '#dc3545',
      warning: colors[6] || '#ffc107',
      success: colors[7] || '#28a745',
      info: colors[8] || '#17a2b8',
      muted: colors[9] || '#6c757d',
      highlight: colors[10] || '#ffff00',
      border: colors[11] || '#666666',
      selection: colors[12] || '#0066cc',
    };
  }

  /**
   * Adjusts color brightness
   * @param color Color to adjust
   * @param factor Brightness factor (-1 to 1)
   * @returns Adjusted color
   */
  private adjustColorBrightness(color: string, factor: number): string {
    // Simple brightness adjustment for hex colors
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      
      const adjust = (c: number) => {
        const adjusted = c + (factor > 0 ? (255 - c) * factor : c * factor);
        return Math.max(0, Math.min(255, Math.round(adjusted)));
      };
      
      const newR = adjust(r).toString(16).padStart(2, '0');
      const newG = adjust(g).toString(16).padStart(2, '0');
      const newB = adjust(b).toString(16).padStart(2, '0');
      
      return `#${newR}${newG}${newB}`;
    }
    
    return color; // Return original if not hex
  }

  /**
   * Adjusts color saturation
   * @param color Color to adjust
   * @param factor Saturation factor (-1 to 1)
   * @returns Adjusted color
   */
  private adjustColorSaturation(color: string, factor: number): string {
    // Simple saturation adjustment for hex colors
    // This is a simplified implementation; a real one would use HSL conversion
    return this.adjustColorBrightness(color, factor * 0.3);
  }

  /**
   * Generates complementary colors from base color
   * @param baseColor Base color
   * @returns Complementary color scheme
   */
  private generateComplementaryColors(baseColor: string): Partial<ColorScheme> {
    // This is a simplified implementation
    // A real implementation would use color theory algorithms
    return {
      primary: baseColor,
      secondary: this.adjustColorBrightness(baseColor, -0.3),
      accent: this.adjustColorBrightness(baseColor, 0.2),
      selection: this.adjustColorBrightness(baseColor, 0.1),
    };
  }

  /**
   * Loads built-in color palettes
   */
  private loadBuiltInColorPalettes(): void {
    const palettes: ColorPalette[] = [
      {
        name: 'modern-dark',
        description: 'Modern dark color palette',
        colors: [
          '#007acc', '#6c7b7f', '#1e1e1e', '#d4d4d4', '#4fc1ff',
          '#f44747', '#ffcc02', '#89d185', '#4fc1ff', '#808080',
          '#ffff00', '#3c3c3c', '#007acc'
        ],
      },
      {
        name: 'vibrant-light',
        description: 'Vibrant light color palette',
        colors: [
          '#0066cc', '#6c757d', '#ffffff', '#000000', '#e83e8c',
          '#dc3545', '#fd7e14', '#28a745', '#17a2b8', '#6c757d',
          '#fff3cd', '#dee2e6', '#0066cc'
        ],
      },
      {
        name: 'high-contrast',
        description: 'High contrast accessibility palette',
        colors: [
          '#ffff00', '#ffffff', '#000000', '#ffffff', '#00ffff',
          '#ff0000', '#ffff00', '#00ff00', '#00ffff', '#808080',
          '#ffff00', '#ffffff', '#ffff00'
        ],
      },
    ];

    palettes.forEach(palette => {
      this.colorPalettes.set(palette.name, palette);
    });
  }

  /**
   * Loads built-in theme templates
   */
  private loadBuiltInTemplates(): void {
    const templates: ThemeTemplate[] = [
      {
        id: 'minimal-dark',
        name: 'Minimal Dark',
        description: 'Clean and minimal dark theme',
        category: 'dark',
        baseTheme: {
          colors: {
            primary: '#007acc',
            secondary: '#6c7b7f',
            background: '#1e1e1e',
            foreground: '#d4d4d4',
            accent: '#4fc1ff',
            error: '#f44747',
            warning: '#ffcc02',
            success: '#89d185',
            info: '#4fc1ff',
            muted: '#808080',
            highlight: '#ffff00',
            border: '#3c3c3c',
            selection: '#007acc',
          },
          fonts: {
            family: 'monospace',
            size: 12,
            weight: 'normal',
            style: 'normal',
          },
        },
      },
      {
        id: 'clean-light',
        name: 'Clean Light',
        description: 'Clean and bright light theme',
        category: 'light',
        baseTheme: {
          colors: {
            primary: '#0066cc',
            secondary: '#6c757d',
            background: '#ffffff',
            foreground: '#212529',
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
        },
      },
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }
}
