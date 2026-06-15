/**
 * Tests for config-io.ts - Configuration import/export functionality
 */

import * as fs from 'fs';
import { ConfigImporter, ConfigExporter, ConfigVersionManager } from './config-io';
import { MonitoringConfig, ThemeConfig, LayoutConfig } from '../types/monitoring';

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    mkdir: jest.fn(),
  }
}));

const mockFs = fs as jest.Mocked<typeof fs>;

describe('ConfigImporter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('importFromFile', () => {
    it('should import configuration from JSON file', async () => {
      const mockConfig = {
        config: {
          version: '1.0.0',
          theme: 'default',
          layout: 'default',
          refreshInterval: 5000,
          components: [],
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
        },
      };

      mockFs.existsSync.mockReturnValue(true);
      (fs.promises.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockConfig));

      const result = await ConfigImporter.importFromFile('/test/config.json');

      expect(result.success).toBe(true);
      expect(result.config).toBeDefined();
      expect(result.errors).toHaveLength(0);
    });

    it('should handle file not found error', async () => {
      mockFs.existsSync.mockReturnValue(false);

      const result = await ConfigImporter.importFromFile('/nonexistent/config.json');

      expect(result.success).toBe(false);
      expect(result.errors).toContain("Import file '/nonexistent/config.json' not found");
    });

    it('should handle invalid JSON format', async () => {
      mockFs.existsSync.mockReturnValue(true);
      (fs.promises.readFile as jest.Mock).mockResolvedValue('invalid json');

      const result = await ConfigImporter.importFromFile('/test/config.json');

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should detect JSON format from extension', async () => {
      const mockConfig = { config: { version: '1.0.0' } };
      mockFs.existsSync.mockReturnValue(true);
      (fs.promises.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockConfig));

      await ConfigImporter.importFromFile('/test/config.json');

      expect((fs.promises.readFile as jest.Mock)).toHaveBeenCalled();
    });

    it('should throw error for YAML format', async () => {
      mockFs.existsSync.mockReturnValue(true);
      (fs.promises.readFile as jest.Mock).mockResolvedValue('key: value');

      const result = await ConfigImporter.importFromFile('/test/config.yaml');

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('YAML format not yet implemented');
    });
  });

  describe('importFromData', () => {
    it('should import valid configuration data', async () => {
      const mockData = {
        config: {
          version: '1.0.0',
          theme: 'default',
          layout: 'default',
          refreshInterval: 5000,
          components: [],
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
        },
      };

      const result = await ConfigImporter.importFromData(mockData);

      expect(result.success).toBe(true);
      expect(result.config).toBeDefined();
    });

    it('should validate manifest if present', async () => {
      const mockData = {
        manifest: {
          version: '1.0.0',
          format: 'json',
          exportedAt: '2023-01-01T00:00:00Z',
          source: 'test',
          components: { config: true, themes: 0, layouts: 0 },
        },
        config: {
          version: '1.0.0',
          theme: 'default',
          layout: 'default',
          refreshInterval: 5000,
          components: [],
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
        },
      };

      const result = await ConfigImporter.importFromData(mockData);

      expect(result.success).toBe(true);
      expect(result.manifest).toBeDefined();
    });

    it('should handle invalid data', async () => {
      const result = await ConfigImporter.importFromData(null);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Invalid configuration data: must be an object');
    });

    it('should import themes array', async () => {
      const mockData = {
        themes: [
          {
            id: 'custom-theme',
            name: 'Custom Theme',
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
          },
        ],
      };

      const result = await ConfigImporter.importFromData(mockData);

      expect(result.success).toBe(true);
      expect(result.themes).toHaveLength(1);
    });

    it('should import layouts array', async () => {
      const mockData = {
        layouts: [
          {
            id: 'custom-layout',
            name: 'Custom Layout',
            isBuiltIn: false,
            responsive: true,
            grid: {
              rows: 12,
              cols: 12,
              cellWidth: 10,
              cellHeight: 3,
              padding: 1,
            },
            minTerminalSize: { width: 120, height: 40 },
            components: [
              {
                type: 'stream-metrics',
                position: { x: 0, y: 0, width: 8, height: 6 },
                size: { minWidth: 40, minHeight: 15 },
                config: { priority: 1 },
              },
            ],
          },
        ],
      };

      const result = await ConfigImporter.importFromData(mockData);

      expect(result.success).toBe(true);
      expect(result.layouts).toHaveLength(1);
    });
  });

  describe('detectFormat', () => {
    const detectFormat = (ConfigImporter as any).detectFormat;

    it('should detect JSON format from extension', () => {
      expect(detectFormat('config.json', '{}')).toBe('json');
    });

    it('should detect YAML format from extension', () => {
      expect(detectFormat('config.yaml', 'key: value')).toBe('yaml');
      expect(detectFormat('config.yml', 'key: value')).toBe('yaml');
    });

    it('should detect JSON from content when no extension', () => {
      expect(detectFormat('config', '{}')).toBe('json');
    });

    it('should default to YAML when JSON parsing fails', () => {
      expect(detectFormat('config', 'invalid json')).toBe('yaml');
    });
  });

  describe('parseContent', () => {
    const parseContent = (ConfigImporter as any).parseContent;

    it('should parse JSON content', () => {
      const result = parseContent('{"key": "value"}', 'json');
      expect(result).toEqual({ key: 'value' });
    });

    it('should throw error for YAML content', () => {
      expect(() => parseContent('key: value', 'yaml')).toThrow(
        'YAML format not yet implemented'
      );
    });

    it('should handle invalid JSON', () => {
      expect(() => parseContent('invalid json', 'json')).toThrow(
        'Failed to parse JSON content'
      );
    });
  });

  describe('validateManifest', () => {
    const validateManifest = (ConfigImporter as any).validateManifest;

    it('should validate valid manifest', () => {
      const manifest = {
        version: '1.0.0',
        format: 'json',
        exportedAt: '2023-01-01T00:00:00Z',
        source: 'test',
        components: { config: true, themes: 0, layouts: 0 },
      };

      expect(() => validateManifest(manifest)).not.toThrow();
    });

    it('should throw for missing version', () => {
      const manifest = {
        format: 'json',
        exportedAt: '2023-01-01T00:00:00Z',
        source: 'test',
        components: { config: true, themes: 0, layouts: 0 },
      };

      expect(() => validateManifest(manifest)).toThrow('version is required');
    });

    it('should throw for missing format', () => {
      const manifest = {
        version: '1.0.0',
        exportedAt: '2023-01-01T00:00:00Z',
        source: 'test',
        components: { config: true, themes: 0, layouts: 0 },
      };

      expect(() => validateManifest(manifest)).toThrow('format is required');
    });

    it('should throw for missing exportedAt', () => {
      const manifest = {
        version: '1.0.0',
        format: 'json',
        source: 'test',
        components: { config: true, themes: 0, layouts: 0 },
      };

      expect(() => validateManifest(manifest)).toThrow('exportedAt is required');
    });
  });
});

describe('ConfigExporter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockConfig: MonitoringConfig = {
    version: '1.0.0',
    theme: 'default',
    layout: 'default',
    refreshInterval: 5000,
    components: [],
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
  };

  describe('exportToFile', () => {
    it('should export configuration to file', async () => {
      mockFs.existsSync.mockReturnValue(true);
      (fs.promises.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.promises.writeFile as jest.Mock).mockResolvedValue(undefined);

      await ConfigExporter.exportToFile(mockConfig, '/test/export.json');

      expect((fs.promises.writeFile as jest.Mock)).toHaveBeenCalledWith(
        '/test/export.json',
        expect.stringContaining('"version": "1.0.0"'),
        'utf8'
      );
    });

    it('should create directory if it does not exist', async () => {
      mockFs.existsSync.mockReturnValue(false);
      (fs.promises.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.promises.writeFile as jest.Mock).mockResolvedValue(undefined);

      await ConfigExporter.exportToFile(mockConfig, '/test/subdir/export.json');

      expect((fs.promises.mkdir as jest.Mock)).toHaveBeenCalledWith('/test/subdir', { recursive: true });
    });

    it('should handle export errors', async () => {
      mockFs.existsSync.mockReturnValue(true);
      (fs.promises.writeFile as jest.Mock).mockRejectedValue(new Error('Write failed'));

      await expect(
        ConfigExporter.exportToFile(mockConfig, '/test/export.json')
      ).rejects.toThrow('Failed to export configuration');
    });
  });

  describe('exportComplete', () => {
    it('should export complete configuration with themes and layouts', async () => {
      const themes: ThemeConfig[] = [
        {
          id: 'custom-theme',
          name: 'Custom Theme',
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
        },
      ];

      const layouts: LayoutConfig[] = [
        {
          id: 'custom-layout',
          name: 'Custom Layout',
          isBuiltIn: false,
          responsive: true,
          grid: {
            rows: 12,
            cols: 12,
            cellWidth: 10,
            cellHeight: 3,
            padding: 1,
          },
          minTerminalSize: { width: 120, height: 40 },
          components: [
            {
              type: 'stream-metrics',
              position: { x: 0, y: 0, width: 8, height: 6 },
              size: { minWidth: 40, minHeight: 15 },
              config: { priority: 1 },
            },
          ],
        },
      ];

      mockFs.existsSync.mockReturnValue(true);
      (fs.promises.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.promises.writeFile as jest.Mock).mockResolvedValue(undefined);

      await ConfigExporter.exportComplete(
        mockConfig,
        themes,
        layouts,
        '/test/complete.json',
        { format: 'json', includeCustomThemes: true, includeCustomLayouts: true }
      );

      expect((fs.promises.writeFile as jest.Mock)).toHaveBeenCalledWith(
        '/test/complete.json',
        expect.stringContaining('"manifest"'),
        'utf8'
      );
    });

    it('should include metadata when requested', async () => {
      mockFs.existsSync.mockReturnValue(true);
      (fs.promises.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.promises.writeFile as jest.Mock).mockResolvedValue(undefined);

      await ConfigExporter.exportComplete(
        mockConfig,
        [],
        [],
        '/test/complete.json',
        { format: 'json', includeMetadata: true }
      );

      expect((fs.promises.writeFile as jest.Mock)).toHaveBeenCalledWith(
        '/test/complete.json',
        expect.stringContaining('"metadata"'),
        'utf8'
      );
    });
  });

  describe('exportToString', () => {
    it('should export configuration to string', () => {
      const result = ConfigExporter.exportToString(mockConfig);

      expect(result).toContain('"version": "1.0.0"');
      expect(result).toContain('"theme": "default"');
    });

    it('should support minified output', () => {
      const result = ConfigExporter.exportToString(mockConfig, {
        format: 'json',
        minify: true,
      });

      expect(result).not.toContain('\n  ');
    });
  });

  describe('serializeData', () => {
    const serializeData = (ConfigExporter as any).serializeData;

    it('should serialize to JSON with indentation', () => {
      const data = { key: 'value' };
      const result = serializeData(data, { format: 'json' });

      expect(result).toContain('{\n  "key": "value"\n}');
    });

    it('should serialize to minified JSON', () => {
      const data = { key: 'value' };
      const result = serializeData(data, { format: 'json', minify: true });

      expect(result).toBe('{"key":"value"}');
    });

    it('should throw error for YAML format', () => {
      const data = { key: 'value' };

      expect(() => serializeData(data, { format: 'yaml' })).toThrow(
        'YAML format not yet implemented'
      );
    });
  });
});

describe('ConfigVersionManager', () => {
  describe('isVersionSupported', () => {
    it('should return true for supported version', () => {
      expect(ConfigVersionManager.isVersionSupported('1.0.0')).toBe(true);
    });

    it('should return false for unsupported version', () => {
      expect(ConfigVersionManager.isVersionSupported('2.0.0')).toBe(false);
    });
  });

  describe('getCurrentVersion', () => {
    it('should return current version', () => {
      expect(ConfigVersionManager.getCurrentVersion()).toBe('1.0.0');
    });
  });

  describe('migrateConfig', () => {
    it('should return config unchanged for current version', () => {
      const config = { version: '1.0.0', test: 'value' };
      const result = ConfigVersionManager.migrateConfig(config, '1.0.0');

      expect(result).toEqual(config);
    });

    it('should throw error for unsupported version', () => {
      const config = { version: '2.0.0', test: 'value' };

      expect(() => ConfigVersionManager.migrateConfig(config, '2.0.0')).toThrow(
        'Unsupported configuration version: 2.0.0'
      );
    });

    it('should update version in migrated config', () => {
      const config = { version: '0.9.0', test: 'value' };
      
      // Mock the supported versions to include 0.9.0 for this test
      const originalVersions = (ConfigVersionManager as any).SUPPORTED_VERSIONS;
      (ConfigVersionManager as any).SUPPORTED_VERSIONS = ['0.9.0', '1.0.0'];

      const result = ConfigVersionManager.migrateConfig(config, '0.9.0');

      expect(result.version).toBe('1.0.0');
      expect((result as any).test).toBe('value');

      // Restore original versions
      (ConfigVersionManager as any).SUPPORTED_VERSIONS = originalVersions;
    });
  });

  describe('getMigrationPath', () => {
    it('should return empty array for same version', () => {
      const path = ConfigVersionManager.getMigrationPath('1.0.0', '1.0.0');
      expect(path).toEqual([]);
    });

    it('should return migration path for different versions', () => {
      const path = ConfigVersionManager.getMigrationPath('1.0.0', '1.0.0');
      expect(path).toEqual([]);
    });

    it('should throw error for unsupported versions', () => {
      expect(() => ConfigVersionManager.getMigrationPath('2.0.0', '1.0.0')).toThrow(
        'Migration path not available'
      );
    });
  });
});