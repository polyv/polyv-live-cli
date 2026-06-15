/**
 * Tests for ThemeManager
 */

import { ThemeManager, ThemeManagerOptions } from './theme-manager';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

// Mock modules
jest.mock('fs', () => {
  const actualFs = jest.requireActual('fs');
  return {
    ...actualFs,
    existsSync: jest.fn().mockReturnValue(true),
    mkdirSync: jest.fn(),
    readdirSync: jest.fn().mockReturnValue([]),
    readFileSync: jest.fn().mockReturnValue('{}'),
    writeFileSync: jest.fn(),
    unlinkSync: jest.fn(),
    promises: {
      writeFile: jest.fn().mockResolvedValue(undefined),
      readFile: jest.fn().mockResolvedValue('{}'),
      unlink: jest.fn().mockResolvedValue(undefined),
      readdir: jest.fn().mockResolvedValue([])
    }
  };
});
jest.mock('os', () => ({
  homedir: jest.fn().mockReturnValue('/mock/home')
}));
jest.mock('path', () => ({
  join: jest.fn().mockImplementation((...args: string[]) => args.join('/'))
}));

const mockFs = fs as jest.Mocked<typeof fs>;
const mockOs = os as jest.Mocked<typeof os>;
const mockPath = path as jest.Mocked<typeof path>;

// Helper to create a valid theme config
function createValidTheme(overrides: Record<string, unknown> = {}) {
  return {
    id: 'test-theme',
    name: 'Test Theme',
    description: 'A test theme',
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
    },
    ...overrides
  };
}

describe('ThemeManager', () => {
  let manager: ThemeManager;

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mock implementations for fs.promises
    (fs.promises.writeFile as jest.Mock).mockResolvedValue(undefined);
    (fs.promises.readFile as jest.Mock).mockResolvedValue(JSON.stringify(createValidTheme()));
    (fs.promises.unlink as jest.Mock).mockResolvedValue(undefined);
    (fs.promises.readdir as jest.Mock).mockResolvedValue([]);

    // Mock fs synchronous operations
    mockFs.existsSync.mockReturnValue(true);
    mockFs.mkdirSync.mockImplementation();
    mockFs.readdirSync.mockReturnValue([]);
    mockFs.readFileSync.mockReturnValue(JSON.stringify(createValidTheme()));
    mockFs.writeFileSync.mockImplementation();
    mockFs.unlinkSync.mockImplementation();

    manager = new ThemeManager();
  });

  afterEach(() => {
    manager.destroy();
  });

  describe('constructor', () => {
    it('should create ThemeManager with default options', () => {
      expect(manager).toBeInstanceOf(ThemeManager);
    });

    it('should create ThemeManager with custom options', () => {
      const customManager = new ThemeManager({
        themesDir: '/custom/themes',
        autoSave: false,
        enablePreview: false
      });
      expect(customManager).toBeInstanceOf(ThemeManager);
      customManager.destroy();
    });

    it('should create themes directory if it does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);
      const newManager = new ThemeManager();
      expect(mockFs.mkdirSync).toHaveBeenCalled();
      newManager.destroy();
    });

    it('should throw error if themes directory creation fails', () => {
      mockFs.existsSync.mockReturnValue(false);
      mockFs.mkdirSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      expect(() => new ThemeManager()).toThrow();
    });
  });

  describe('getAvailableThemes', () => {
    it('should return available theme IDs', () => {
      const themes = manager.getAvailableThemes();
      expect(themes).toContain('default');
      expect(themes).toContain('dark');
      expect(themes).toContain('light');
      expect(themes).toContain('high-contrast');
    });
  });

  describe('getTheme', () => {
    it('should return theme config for valid ID', () => {
      const theme = manager.getTheme('default');
      expect(theme).toBeDefined();
      expect(theme?.id).toBe('default');
    });

    it('should return undefined for invalid ID', () => {
      const theme = manager.getTheme('nonexistent');
      expect(theme).toBeUndefined();
    });
  });

  describe('getCurrentTheme', () => {
    it('should return current theme', () => {
      const currentTheme = manager.getCurrentTheme();
      expect(currentTheme.id).toBe('default');
    });
  });

  describe('getCurrentThemeId', () => {
    it('should return current theme ID', () => {
      expect(manager.getCurrentThemeId()).toBe('default');
    });
  });

  describe('getCustomThemes', () => {
    it('should return custom themes', () => {
      const customThemes = manager.getCustomThemes();
      expect(Array.isArray(customThemes)).toBe(true);
    });
  });

  describe('getBuiltInThemes', () => {
    it('should return built-in themes', () => {
      const builtInThemes = manager.getBuiltInThemes();
      expect(builtInThemes.length).toBe(4);
    });
  });

  describe('isInPreviewMode', () => {
    it('should return false initially', () => {
      expect(manager.isInPreviewMode()).toBe(false);
    });
  });

  describe('applyTheme', () => {
    it('should apply theme by ID', async () => {
      await manager.applyTheme('dark');
      expect(manager.getCurrentThemeId()).toBe('dark');
    });

    it('should throw error for non-existent theme', async () => {
      await expect(manager.applyTheme('nonexistent')).rejects.toThrow();
    });

    it('should emit theme:applied event', async () => {
      const listener = jest.fn();
      manager.on('theme:applied', listener);
      await manager.applyTheme('dark');
      expect(listener).toHaveBeenCalled();
    });
  });

  describe('createCustomTheme', () => {
    it('should create a new custom theme', async () => {
      const theme = createValidTheme({ id: 'my-custom-theme' });
      await manager.createCustomTheme(theme);
      expect(manager.getTheme('my-custom-theme')).toBeDefined();
    });

    it('should throw error for duplicate theme ID', async () => {
      const theme = createValidTheme({ id: 'default' });
      await expect(manager.createCustomTheme(theme)).rejects.toThrow();
    });

    it('should emit theme:created event', async () => {
      const listener = jest.fn();
      manager.on('theme:created', listener);
      const theme = createValidTheme({ id: 'new-theme' });
      await manager.createCustomTheme(theme);
      expect(listener).toHaveBeenCalled();
    });
  });

  describe('updateCustomTheme', () => {
    it('should update an existing custom theme', async () => {
      const theme = createValidTheme({ id: 'updatable-theme' });
      await manager.createCustomTheme(theme);
      await manager.updateCustomTheme('updatable-theme', { name: 'Updated Theme' });
      expect(manager.getTheme('updatable-theme')?.name).toBe('Updated Theme');
    });

    it('should throw error for non-existent custom theme', async () => {
      await expect(manager.updateCustomTheme('nonexistent', { name: 'Updated' }))
        .rejects.toThrow();
    });

    it('should throw error when trying to update built-in theme', async () => {
      await expect(manager.updateCustomTheme('default', { name: 'Updated' }))
        .rejects.toThrow();
    });
  });

  describe('deleteCustomTheme', () => {
    it('should delete an existing custom theme', async () => {
      const theme = createValidTheme({ id: 'deletable-theme' });
      await manager.createCustomTheme(theme);
      expect(manager.getTheme('deletable-theme')).toBeDefined();
      await manager.deleteCustomTheme('deletable-theme');
      expect(manager.getTheme('deletable-theme')).toBeUndefined();
    });

    it('should throw error for non-existent custom theme', async () => {
      await expect(manager.deleteCustomTheme('nonexistent')).rejects.toThrow();
    });

    it('should throw error when trying to delete built-in theme', async () => {
      await expect(manager.deleteCustomTheme('default')).rejects.toThrow();
    });
  });

  describe('exportTheme', () => {
    it('should export a theme to a file', async () => {
      const listener = jest.fn();
      manager.on('theme:exported', listener);
      await manager.exportTheme('default', '/path/to/theme.json');
      expect(fs.promises.writeFile as jest.Mock).toHaveBeenCalled();
      expect(listener).toHaveBeenCalled();
    });

    it('should throw error for non-existent theme', async () => {
      await expect(manager.exportTheme('nonexistent', '/path/to/theme.json'))
        .rejects.toThrow();
    });

    it('should throw error on write failure', async () => {
      (fs.promises.writeFile as jest.Mock).mockRejectedValue(new Error('Write error'));
      await expect(manager.exportTheme('default', '/path/to/theme.json'))
        .rejects.toThrow();
    });
  });

  describe('importTheme', () => {
    it('should import a valid theme', async () => {
      const theme = createValidTheme({ id: 'imported-theme' });
      (fs.promises.readFile as jest.Mock).mockResolvedValue(JSON.stringify(theme));
      const result = await manager.importTheme('/path/to/theme.json');
      expect(result.id).toBe('imported-theme');
    });

    it('should generate unique ID for conflicting theme ID', async () => {
      const theme = createValidTheme({ id: 'default' });
      (fs.promises.readFile as jest.Mock).mockResolvedValue(JSON.stringify(theme));
      const result = await manager.importTheme('/path/to/theme.json');
      expect(result.id).toBe('default-1');
    });

    it('should throw error for read failure', async () => {
      (fs.promises.readFile as jest.Mock).mockRejectedValue(new Error('Read error'));
      await expect(manager.importTheme('/path/to/theme.json')).rejects.toThrow();
    });
  });

  describe('startPreview', () => {
    it('should start preview mode for a theme', async () => {
      const listener = jest.fn();
      manager.on('theme:preview-started', listener);
      await manager.startPreview('dark');
      expect(manager.isInPreviewMode()).toBe(true);
      expect(listener).toHaveBeenCalled();
    });

    it('should throw error when preview is disabled', async () => {
      const noPreviewManager = new ThemeManager({ enablePreview: false } as ThemeManagerOptions);
      await expect(noPreviewManager.startPreview('dark')).rejects.toThrow();
      noPreviewManager.destroy();
    });

    it('should throw error for non-existent theme', async () => {
      await expect(manager.startPreview('nonexistent')).rejects.toThrow();
    });
  });

  describe('endPreview', () => {
    it('should end preview mode', async () => {
      await manager.startPreview('dark');
      await manager.endPreview();
      expect(manager.isInPreviewMode()).toBe(false);
    });

    it('should do nothing when not in preview mode', async () => {
      await manager.endPreview();
      expect(manager.isInPreviewMode()).toBe(false);
    });

    it('should emit theme:preview-ended event', async () => {
      const listener = jest.fn();
      manager.on('theme:preview-ended', listener);
      await manager.startPreview('dark');
      await manager.endPreview();
      expect(listener).toHaveBeenCalled();
    });
  });

  describe('destroy', () => {
    it('should cleanup resources', () => {
      const testManager = new ThemeManager();
      expect(() => testManager.destroy()).not.toThrow();
    });

    it('should remove all listeners', () => {
      const testManager = new ThemeManager();
      const listener = jest.fn();
      testManager.on('theme:applied', listener);
      testManager.destroy();
      testManager.emit('theme:applied', {}, 'default');
      expect(listener).not.toHaveBeenCalled();
    });
  });
});
