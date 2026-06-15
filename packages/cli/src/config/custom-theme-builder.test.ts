/**
 * Tests for CustomThemeBuilder
 */

import { CustomThemeBuilder } from './custom-theme-builder';

describe('CustomThemeBuilder', () => {
  let builder: CustomThemeBuilder;

  beforeEach(() => {
    builder = new CustomThemeBuilder();
  });

  afterEach(() => {
    builder.removeAllListeners();
  });

  describe('constructor', () => {
    it('should create builder with default options', () => {
      const defaultBuilder = new CustomThemeBuilder();
      expect(defaultBuilder).toBeInstanceOf(CustomThemeBuilder);
      defaultBuilder.removeAllListeners();
    });

    it('should create builder with custom options', () => {
      const customBuilder = new CustomThemeBuilder({
        enablePreview: false,
        autoValidate: false,
        strictMode: true
      });
      expect(customBuilder).toBeInstanceOf(CustomThemeBuilder);
      customBuilder.removeAllListeners();
    });
  });

  describe('startNew', () => {
    it('should start new theme without template', () => {
      const result = builder.startNew();
      expect(result).toBe(builder);
    });

    it('should start new theme with template', () => {
      const result = builder.startNew('dark');
      expect(result).toBe(builder);
    });

    it('should start new theme with non-existent template (fallback to default)', () => {
      const result = builder.startNew('non-existent-template');
      expect(result).toBe(builder);
    });

    it('should emit theme:started event', (done) => {
      builder.on('theme:started', (theme) => {
        expect(theme).toBeDefined();
        done();
      });
      builder.startNew();
    });
  });

  describe('loadTheme', () => {
    it('should load existing theme', () => {
      const theme = createValidTheme();
      const result = builder.loadTheme(theme);
      expect(result).toBe(builder);
    });

    it('should emit theme:loaded event', (done) => {
      const theme = createValidTheme();
      builder.on('theme:loaded', (loadedTheme) => {
        expect(loadedTheme).toBeDefined();
        done();
      });
      builder.loadTheme(theme);
    });

    it('should validate theme when autoValidate is enabled', () => {
      const validateBuilder = new CustomThemeBuilder({ autoValidate: true });
      const theme = createValidTheme();
      validateBuilder.loadTheme(theme);
      expect(validateBuilder.getValidationErrors().length).toBe(0);
      validateBuilder.removeAllListeners();
    });
  });

  describe('setThemeInfo', () => {
    it('should set theme info with all fields', () => {
      builder.startNew();
      const result = builder.setThemeInfo({
        id: 'test-theme',
        name: 'Test Theme',
        description: 'Test Description',
        author: 'Test Author',
        version: '2.0.0'
      });
      expect(result).toBe(builder);

      const theme = builder.getCurrentTheme();
      expect(theme.id).toBe('test-theme');
      expect(theme.name).toBe('Test Theme');
      expect(theme.description).toBe('Test Description');
      expect(theme.author).toBe('Test Author');
      expect(theme.version).toBe('2.0.0');
    });

    it('should set theme info without optional fields', () => {
      builder.startNew();
      builder.setThemeInfo({
        id: 'minimal-theme',
        name: 'Minimal Theme'
      });

      const theme = builder.getCurrentTheme();
      expect(theme.id).toBe('minimal-theme');
      expect(theme.name).toBe('Minimal Theme');
      expect(theme.version).toBe('1.0.0'); // Default version
    });

    it('should emit theme:info-updated event', (done) => {
      builder.startNew();
      builder.on('theme:info-updated', () => done());
      builder.setThemeInfo({ id: 'test', name: 'Test' });
    });
  });

  describe('setColors', () => {
    it('should set colors using color scheme object', () => {
      builder.startNew();
      const result = builder.setColors({
        primary: '#ff0000',
        secondary: '#00ff00'
      });
      expect(result).toBe(builder);
    });

    it('should set colors using predefined palette name', () => {
      builder.startNew();
      // Get first available palette or use default
      const palettes = builder.getAvailableColorPalettes();
      const paletteName = palettes.length > 0 ? palettes[0] : 'default';
      const result = builder.setColors(paletteName);
      expect(result).toBe(builder);
    });

    it('should throw error for non-existent palette', () => {
      builder.startNew();
      expect(() => builder.setColors('non-existent-palette-xyz')).toThrow();
    });

    it('should emit theme:colors-updated event', (done) => {
      builder.startNew();
      builder.on('theme:colors-updated', () => done());
      builder.setColors({ primary: '#ff0000' });
    });
  });

  describe('setColor', () => {
    it('should set individual color', () => {
      builder.startNew();
      const result = builder.setColor('primary', '#ff0000');
      expect(result).toBe(builder);
    });

    it('should initialize colors if not present', () => {
      builder.startNew();
      builder.setColor('primary', '#ff0000');
      const theme = builder.getCurrentTheme();
      expect(theme.colors?.primary).toBe('#ff0000');
    });

    it('should emit theme:color-updated event', (done) => {
      builder.startNew();
      builder.on('theme:color-updated', (data: any) => {
        expect(data.colorName).toBe('primary');
        expect(data.colorValue).toBe('#ff0000');
        done();
      });
      builder.setColor('primary', '#ff0000');
    });
  });

  describe('setFonts', () => {
    it('should set font configuration', () => {
      builder.startNew();
      const result = builder.setFonts({
        family: 'Arial',
        size: 14
      });
      expect(result).toBe(builder);
    });

    it('should emit theme:fonts-updated event', (done) => {
      builder.startNew();
      builder.on('theme:fonts-updated', () => done());
      builder.setFonts({ size: 14 });
    });
  });

  describe('setBorders', () => {
    it('should set border configuration', () => {
      builder.startNew();
      const result = builder.setBorders({
        type: 'line',
        color: '#ffffff'
      });
      expect(result).toBe(builder);
    });

    it('should emit theme:borders-updated event', (done) => {
      builder.startNew();
      builder.on('theme:borders-updated', () => done());
      builder.setBorders({ color: '#ffffff' });
    });
  });

  describe('getCurrentTheme', () => {
    it('should return current theme state', () => {
      const currentTheme = builder.getCurrentTheme();
      expect(typeof currentTheme).toBe('object');
    });
  });

  describe('getAvailableColorPalettes', () => {
    it('should return array of available color palettes', () => {
      const palettes = builder.getAvailableColorPalettes();
      expect(Array.isArray(palettes)).toBe(true);
    });
  });

  describe('getColorPalette', () => {
    it('should return undefined for non-existent palette', () => {
      const palette = builder.getColorPalette('non-existent');
      expect(palette).toBeUndefined();
    });

    it('should return existing palette', () => {
      const palettes = builder.getAvailableColorPalettes();
      if (palettes.length > 0) {
        const palette = builder.getColorPalette(palettes[0]);
        expect(palette).toBeDefined();
      }
    });
  });

  describe('addColorPalette', () => {
    it('should add custom color palette', () => {
      const customPalette = {
        name: 'custom-test',
        colors: ['#ff0000', '#00ff00', '#0000ff']
      };

      const result = builder.addColorPalette(customPalette);
      expect(result).toBe(builder);

      const retrievedPalette = builder.getColorPalette('custom-test');
      expect(retrievedPalette).toEqual(customPalette);
    });

    it('should add palette with description', () => {
      const customPalette = {
        name: 'described-palette',
        colors: ['#ff0000'],
        description: 'A test palette'
      };

      builder.addColorPalette(customPalette);
      const retrieved = builder.getColorPalette('described-palette');
      expect(retrieved?.description).toBe('A test palette');
    });
  });

  describe('getAvailableTemplates', () => {
    it('should return array of available templates', () => {
      const templates = builder.getAvailableTemplates();
      expect(Array.isArray(templates)).toBe(true);
    });
  });

  describe('getTemplate', () => {
    it('should return undefined for non-existent template', () => {
      const template = builder.getTemplate('non-existent');
      expect(template).toBeUndefined();
    });

    it('should return existing template', () => {
      const templates = builder.getAvailableTemplates();
      if (templates.length > 0) {
        const template = builder.getTemplate(templates[0]);
        expect(template).toBeDefined();
      }
    });
  });

  describe('addTemplate', () => {
    it('should add custom template', () => {
      const customTemplate = {
        id: 'custom-template',
        name: 'Custom Template',
        description: 'Custom test template',
        baseTheme: {},
        category: 'custom' as const
      };

      const result = builder.addTemplate(customTemplate);
      expect(result).toBe(builder);

      const retrievedTemplate = builder.getTemplate('custom-template');
      expect(retrievedTemplate).toEqual(customTemplate);
    });
  });

  describe('getValidationErrors', () => {
    it('should return validation errors array', () => {
      const errors = builder.getValidationErrors();
      expect(Array.isArray(errors)).toBe(true);
    });
  });

  describe('getValidationWarnings', () => {
    it('should return validation warnings array', () => {
      const warnings = builder.getValidationWarnings();
      expect(Array.isArray(warnings)).toBe(true);
    });
  });

  describe('validateCurrentTheme', () => {
    it('should validate and return result', () => {
      builder.startNew();
      const result = builder.validateCurrentTheme();
      expect(typeof result.valid).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
    });
  });

  describe('build', () => {
    it('should build complete theme', () => {
      builder.startNew();
      builder.setThemeInfo({ id: 'test', name: 'Test' });
      builder.setColors({ primary: '#ff0000' });

      const theme = builder.build();
      expect(theme.id).toBe('test');
      expect(theme.name).toBe('Test');
    });

    it('should allow building theme in strict mode with valid data', () => {
      const strictBuilder = new CustomThemeBuilder({ strictMode: true });
      strictBuilder.startNew();

      // Set required fields
      strictBuilder.setThemeInfo({ id: 'test-theme', name: 'Test Theme' });
      strictBuilder.setColors({ primary: '#ff0000' });

      // Building with required fields should work
      const theme = strictBuilder.build();
      expect(theme.id).toBe('test-theme');
      strictBuilder.removeAllListeners();
    });
  });

  describe('reset', () => {
    it('should reset builder state', () => {
      const result = builder.reset();
      expect(result).toBe(builder);
    });
  });

  describe('events', () => {
    it('should emit events during theme operations', (done) => {
      let eventCount = 0;

      builder.on('theme:started', () => {
        eventCount++;
        if (eventCount === 1) done();
      });

      builder.startNew();
    });
  });
});

// Helper function to create a valid theme
function createValidTheme() {
  return {
    id: 'valid-theme',
    name: 'Valid Theme',
    description: 'A valid test theme',
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
      weight: 'normal' as const,
      style: 'normal' as const,
    },
    borders: {
      type: 'line' as const,
      style: 'solid' as const,
      color: '#666666',
    },
    components: {
      header: { fg: '#ffffff', bg: '#0066cc', bold: true },
      content: { fg: '#ffffff', bg: '#000000' },
      status: { fg: '#17a2b8', bg: '#000000' },
      border: { fg: '#666666' },
      scrollbar: { fg: '#666666', bg: '#333333' },
      selection: { fg: '#ffffff', bg: '#0066cc' },
    }
  };
}
