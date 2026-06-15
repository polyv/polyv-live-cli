/**
 * Tests for LayoutManager
 */

// Must hoist mock factories
const mockFsPromises = {
  writeFile: jest.fn().mockResolvedValue(undefined),
  readFile: jest.fn().mockResolvedValue('{"id":"test","name":"Test Layout"}'),
  unlink: jest.fn().mockResolvedValue(undefined),
  readdir: jest.fn().mockResolvedValue([]),
};

jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
  readdirSync: jest.fn().mockReturnValue([]),
  readFileSync: jest.fn().mockReturnValue('{"id":"test"}'),
  writeFileSync: jest.fn(),
  unlinkSync: jest.fn(),
  promises: mockFsPromises,
  statSync: jest.fn(),
  accessSync: jest.fn(),
}));

jest.mock('os', () => ({
  homedir: jest.fn().mockReturnValue('/mock/home'),
  tmpdir: jest.fn().mockReturnValue('/tmp'),
  platform: jest.fn().mockReturnValue('darwin'),
  arch: jest.fn().mockReturnValue('arm64'),
}));

jest.mock('path', () => ({
  join: (...args: string[]) => args.join('/'),
  basename: (p: string) => p.split('/').pop() || '',
  dirname: (p: string) => p.split('/').slice(0, -1).join('/') || '.',
  extname: (p: string) => {
    const parts = p.split('.');
    return parts.length > 1 ? '.' + parts.pop() : '';
  },
  sep: '/',
  resolve: (...args: string[]) => args.join('/'),
}));

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { LayoutManager } from './layout-manager';
import { ConfigurationError } from '../utils/errors';

const mockFs = fs as any;
const mockOs = os as any;
const mockPath = path as any;

describe('LayoutManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockFs.existsSync.mockReturnValue(true);
    mockFs.mkdirSync.mockImplementation();
    mockFsPromises.writeFile.mockResolvedValue(undefined);
    mockFsPromises.readFile.mockResolvedValue('{"id":"test","name":"Test Layout"}');
    mockFsPromises.unlink.mockResolvedValue(undefined);
    mockFsPromises.readdir.mockResolvedValue([]);
  });

  describe('constructor', () => {
    it('should create with default options', () => {
      const m = new LayoutManager();
      expect(m).toBeInstanceOf(LayoutManager);
      m.destroy();
    });

    it('should create with custom options', () => {
      const m = new LayoutManager({ layoutsDir: '/custom', autoSave: false, enableResponsive: false });
      expect(m).toBeInstanceOf(LayoutManager);
      m.destroy();
    });

    it('should throw if directory creation fails', () => {
      mockFs.existsSync.mockReturnValue(false);
      mockFs.mkdirSync.mockImplementation(() => { throw new Error('EACCES'); });
      expect(() => new LayoutManager()).toThrow('Failed to create layouts directory');
    });
  });

  describe('getAvailableLayouts', () => {
    it('should return all layout IDs', () => {
      const m = new LayoutManager();
      expect(m.getAvailableLayouts().length).toBeGreaterThanOrEqual(4);
      m.destroy();
    });
  });

  describe('getLayout', () => {
    it('should return layout for valid ID', () => {
      const m = new LayoutManager();
      expect(m.getLayout('default')?.id).toBe('default');
      m.destroy();
    });

    it('should return undefined for invalid ID', () => {
      const m = new LayoutManager();
      expect(m.getLayout('nope')).toBeUndefined();
      m.destroy();
    });
  });

  describe('getCurrentLayout', () => {
    it('should return current layout', () => {
      const m = new LayoutManager();
      expect(m.getCurrentLayout()).toBeDefined();
      m.destroy();
    });

    it('should throw for corrupted current layout ID', () => {
      const m = new LayoutManager();
      (m as any).currentLayoutId = 'missing';
      expect(() => m.getCurrentLayout()).toThrow('not found');
      m.destroy();
    });
  });

  describe('getCurrentLayoutId', () => {
    it('should return string', () => {
      const m = new LayoutManager();
      expect(typeof m.getCurrentLayoutId()).toBe('string');
      m.destroy();
    });
  });

  describe('applyLayout', () => {
    it('should apply layout', async () => {
      const m = new LayoutManager();
      await m.applyLayout('default');
      expect(m.getCurrentLayoutId()).toBe('default');
      m.destroy();
    });

    it('should throw for non-existent layout', async () => {
      const m = new LayoutManager();
      await expect(m.applyLayout('nope')).rejects.toThrow('not found');
      m.destroy();
    });

    it('should throw when terminal too small', async () => {
      const m = new LayoutManager();
      (m as any).currentTerminalSize = { width: 10, height: 10 };
      await expect(m.applyLayout('widescreen')).rejects.toThrow('smaller than layout minimum');
      m.destroy();
    });

    it('should rollback on interface failure', async () => {
      const m = new LayoutManager();
      (m as any).applyLayoutToInterface = jest.fn().mockRejectedValue(new Error('boom'));
      const prev = m.getCurrentLayoutId();
      await expect(m.applyLayout('compact')).rejects.toThrow('Failed to apply');
      expect(m.getCurrentLayoutId()).toBe(prev);
      m.destroy();
    });

    it('should skip responsive when disabled', async () => {
      const m = new LayoutManager({ enableResponsive: false });
      const spy = jest.spyOn(m as any, 'applyResponsiveAdjustments');
      await m.applyLayout('default');
      expect(spy).not.toHaveBeenCalled();
      m.destroy();
    });

    it('should emit layout:applied', async () => {
      const m = new LayoutManager();
      const listener = jest.fn();
      m.on('layout:applied', listener);
      await m.applyLayout('compact');
      expect(listener).toHaveBeenCalledTimes(1);
      m.destroy();
    });
  });

  describe('updateTerminalSize', () => {
    it('should update with responsive enabled', async () => {
      const m = new LayoutManager();
      await m.updateTerminalSize({ width: 200, height: 60 });
      m.destroy();
    });

    it('should emit size-warning when too small', async () => {
      const m = new LayoutManager();
      const listener = jest.fn();
      m.on('layout:size-warning', listener);
      await m.updateTerminalSize({ width: 10, height: 10 });
      expect(listener).toHaveBeenCalledTimes(1);
      m.destroy();
    });

    it('should skip responsive when disabled', async () => {
      const m = new LayoutManager({ enableResponsive: false });
      const spy = jest.spyOn(m as any, 'applyLayoutToInterface');
      await m.updateTerminalSize({ width: 200, height: 60 });
      expect(spy).not.toHaveBeenCalled();
      m.destroy();
    });

    it('should emit terminal-resized', async () => {
      const m = new LayoutManager();
      const listener = jest.fn();
      m.on('layout:terminal-resized', listener);
      await m.updateTerminalSize({ width: 140, height: 50 });
      expect(listener).toHaveBeenCalledTimes(1);
      m.destroy();
    });
  });

  describe('getLayoutMetrics', () => {
    it('should return metrics for current layout', () => {
      const m = new LayoutManager();
      const metrics = m.getLayoutMetrics();
      expect(metrics).toHaveProperty('totalComponents');
      expect(metrics).toHaveProperty('activeComponents');
      expect(metrics).toHaveProperty('gridUtilization');
      expect(metrics).toHaveProperty('overlappingComponents');
      m.destroy();
    });

    it('should return metrics for specific layout', () => {
      const m = new LayoutManager();
      expect(m.getLayoutMetrics('compact').totalComponents).toBeGreaterThan(0);
      m.destroy();
    });

    it('should throw for non-existent layout', () => {
      const m = new LayoutManager();
      expect(() => m.getLayoutMetrics('nope')).toThrow('not found');
      m.destroy();
    });
  });

  describe('findOverlappingComponents', () => {
    it('should find no overlaps in default layout', () => {
      const m = new LayoutManager();
      expect(m.findOverlappingComponents(m.getCurrentLayout())).toEqual([]);
      m.destroy();
    });

    it('should detect overlapping components', () => {
      const m = new LayoutManager();
      const layout = JSON.parse(JSON.stringify(m.getCurrentLayout()));
      layout.components[0].position = { x: 0, y: 0, width: 5, height: 5 };
      layout.components[1].position = { x: 4, y: 4, width: 5, height: 5 };
      expect(m.findOverlappingComponents(layout).length).toBeGreaterThan(0);
      m.destroy();
    });
  });

  describe('optimizeLayout', () => {
    it('should return new layout object', () => {
      const m = new LayoutManager();
      const layout = m.getCurrentLayout();
      const optimized = m.optimizeLayout(layout);
      expect(optimized).not.toBe(layout);
      m.destroy();
    });

    it('should resolve overlaps', () => {
      const m = new LayoutManager();
      const layout = JSON.parse(JSON.stringify(m.getCurrentLayout()));
      // Create small overlaps that can be resolved
      layout.components[0].position = { x: 0, y: 0, width: 6, height: 6 };
      layout.components[1].position = { x: 5, y: 5, width: 6, height: 6 };
      const optimized = m.optimizeLayout(layout);
      expect(m.findOverlappingComponents(optimized).length).toBe(0);
      m.destroy();
    });
  });

  describe('createCustomLayout', () => {
    const makeCustom = (m: LayoutManager, id: string) => {
      const base = JSON.parse(JSON.stringify(m.getLayout('default')));
      base.id = id;
      return base;
    };

    it('should create custom layout', async () => {
      const m = new LayoutManager();
      const listener = jest.fn();
      m.on('layout:created', listener);
      await m.createCustomLayout(makeCustom(m, 'my-custom'));
      expect(m.getLayout('my-custom')).toBeDefined();
      expect(m.getCustomLayouts().length).toBe(1);
      expect(listener).toHaveBeenCalledTimes(1);
      m.destroy();
    });

    it('should throw when ID exists', async () => {
      const m = new LayoutManager();
      await expect(m.createCustomLayout(makeCustom(m, 'default'))).rejects.toThrow('already exists');
      m.destroy();
    });

    it('should throw on save failure', async () => {
      const m = new LayoutManager();
      mockFsPromises.writeFile.mockRejectedValue(new Error('disk full'));
      await expect(m.createCustomLayout(makeCustom(m, 'save-fail'))).rejects.toThrow('Failed to save');
      m.destroy();
    });
  });

  describe('updateCustomLayout', () => {
    it('should update custom layout', async () => {
      const m = new LayoutManager();
      const base = JSON.parse(JSON.stringify(m.getLayout('default')));
      base.id = 'updatable';
      await m.createCustomLayout(base);
      const listener = jest.fn();
      m.on('layout:updated', listener);
      await m.updateCustomLayout('updatable', { name: 'Updated' });
      expect(m.getLayout('updatable')!.name).toBe('Updated');
      expect(listener).toHaveBeenCalledTimes(1);
      m.destroy();
    });

    it('should throw for non-existent layout', async () => {
      const m = new LayoutManager();
      await expect(m.updateCustomLayout('nope', { name: 'x' })).rejects.toThrow('not found');
      m.destroy();
    });

    it('should re-apply if current layout', async () => {
      const m = new LayoutManager();
      const base = JSON.parse(JSON.stringify(m.getLayout('default')));
      base.id = 'cur-upd';
      await m.createCustomLayout(base);
      await m.applyLayout('cur-upd');
      const spy = jest.spyOn(m as any, 'applyLayoutToInterface');
      await m.updateCustomLayout('cur-upd', { name: 'New' });
      expect(spy).toHaveBeenCalled();
      m.destroy();
    });
  });

  describe('deleteCustomLayout', () => {
    const setup = async (id: string) => {
      const m = new LayoutManager();
      const base = JSON.parse(JSON.stringify(m.getLayout('default')));
      base.id = id;
      await m.createCustomLayout(base);
      return m;
    };

    it('should delete custom layout', async () => {
      const m = await setup('deletable');
      const listener = jest.fn();
      m.on('layout:deleted', listener);
      await m.deleteCustomLayout('deletable');
      expect(m.getLayout('deletable')).toBeUndefined();
      expect(listener).toHaveBeenCalledTimes(1);
      m.destroy();
    });

    it('should throw for non-existent layout', async () => {
      const m = new LayoutManager();
      await expect(m.deleteCustomLayout('nope')).rejects.toThrow('not found');
      m.destroy();
    });

    it('should switch to default if deleting current', async () => {
      const m = await setup('cur-del');
      await m.applyLayout('cur-del');
      await m.deleteCustomLayout('cur-del');
      expect(m.getCurrentLayoutId()).toBe('default');
      m.destroy();
    });

    it('should handle missing layout file', async () => {
      const m = await setup('nofile');
      mockFs.existsSync.mockImplementation((p: any) => {
        if (typeof p === 'string' && p.includes('nofile.json')) return false;
        return true;
      });
      await m.deleteCustomLayout('nofile');
      expect(m.getLayout('nofile')).toBeUndefined();
      m.destroy();
    });
  });

  describe('exportLayout', () => {
    it('should export to file', async () => {
      const m = new LayoutManager();
      const listener = jest.fn();
      m.on('layout:exported', listener);
      await m.exportLayout('default', '/tmp/exported.json');
      expect(mockFsPromises.writeFile).toHaveBeenCalledWith('/tmp/exported.json', expect.any(String), 'utf8');
      expect(listener).toHaveBeenCalledTimes(1);
      m.destroy();
    });

    it('should throw for non-existent layout', async () => {
      const m = new LayoutManager();
      await expect(m.exportLayout('nope', '/tmp/x.json')).rejects.toThrow('not found');
      m.destroy();
    });

    it('should throw on write failure', async () => {
      const m = new LayoutManager();
      mockFsPromises.writeFile.mockRejectedValue(new Error('write failed'));
      await expect(m.exportLayout('default', '/tmp/fail.json')).rejects.toThrow('Failed to export');
      m.destroy();
    });
  });

  describe('importLayout', () => {
    const validJson = JSON.stringify({
      id: 'imported', name: 'Imported', description: 'test', isBuiltIn: false, responsive: true,
      grid: { rows: 12, cols: 12, cellWidth: 10, cellHeight: 3, padding: 1 },
      minTerminalSize: { width: 80, height: 24 },
      components: [{ type: 'stream-metrics', position: { x: 0, y: 0, width: 6, height: 6 }, size: { minWidth: 30, minHeight: 10 }, config: {} }],
    });

    it('should import from file', async () => {
      const m = new LayoutManager();
      mockFsPromises.readFile.mockResolvedValue(validJson);
      const listener = jest.fn();
      m.on('layout:imported', listener);
      const layout = await m.importLayout('/tmp/import.json');
      expect(layout.id).toBe('imported');
      expect(listener).toHaveBeenCalledTimes(1);
      m.destroy();
    });

    it('should generate unique ID on conflict', async () => {
      const m = new LayoutManager();
      mockFsPromises.readFile.mockResolvedValue(validJson.replace('"imported"', '"default"'));
      const layout = await m.importLayout('/tmp/conflict.json');
      expect(layout.id).toBe('default-1');
      m.destroy();
    });

    it('should throw on invalid JSON', async () => {
      const m = new LayoutManager();
      mockFsPromises.readFile.mockResolvedValue('not json');
      await expect(m.importLayout('/tmp/bad.json')).rejects.toThrow('Failed to import');
      m.destroy();
    });

    it('should throw on read failure', async () => {
      const m = new LayoutManager();
      mockFsPromises.readFile.mockRejectedValue(new Error('read error'));
      await expect(m.importLayout('/tmp/miss.json')).rejects.toThrow('Failed to import');
      m.destroy();
    });
  });

  describe('loadCustomLayouts', () => {
    const validCustomJson = JSON.stringify({
      id: 'file-custom', name: 'File Custom', description: 'test', isBuiltIn: false, responsive: true,
      grid: { rows: 12, cols: 12, cellWidth: 10, cellHeight: 3, padding: 1 },
      minTerminalSize: { width: 80, height: 24 },
      components: [{ type: 'stream-metrics', position: { x: 0, y: 0, width: 6, height: 6 }, size: { minWidth: 30, minHeight: 10 }, config: {} }],
    });

    it('should load valid custom layouts', async () => {
      mockFsPromises.readdir.mockResolvedValue(['file-custom.json']);
      mockFsPromises.readFile.mockResolvedValue(validCustomJson);
      const m = new LayoutManager();
      await new Promise(r => setTimeout(r, 10));
      expect(m.getLayout('file-custom')).toBeDefined();
      m.destroy();
    });

    it('should skip non-JSON files', async () => {
      mockFsPromises.readdir.mockResolvedValue(['readme.txt']);
      const m = new LayoutManager();
      await new Promise(r => setTimeout(r, 10));
      m.destroy();
    });

    it('should handle invalid layout files', async () => {
      mockFsPromises.readdir.mockResolvedValue(['bad.json']);
      mockFsPromises.readFile.mockResolvedValue('not json');
      const m = new LayoutManager();
      await new Promise(r => setTimeout(r, 10));
      m.destroy();
    });

    it('should skip if layouts dir does not exist', async () => {
      mockFs.existsSync.mockReturnValue(false);
      mockFs.mkdirSync.mockImplementation();
      const m = new LayoutManager();
      await new Promise(r => setTimeout(r, 10));
      m.destroy();
    });
  });

  describe('getCustomLayouts', () => {
    it('should return empty array initially', () => {
      const m = new LayoutManager();
      expect(m.getCustomLayouts()).toEqual([]);
      m.destroy();
    });
  });

  describe('getBuiltInLayouts', () => {
    it('should return all 4 built-in layouts', () => {
      const m = new LayoutManager();
      const bi = m.getBuiltInLayouts();
      expect(bi.length).toBe(4);
      expect(bi.every(l => l.isBuiltIn)).toBe(true);
      m.destroy();
    });
  });

  describe('responsive adjustments', () => {
    it('should return unchanged for non-responsive layout', async () => {
      const m = new LayoutManager({ enableResponsive: true });
      await m.updateTerminalSize({ width: 80, height: 60 });
      const spy = jest.spyOn(m as any, 'applyResponsiveAdjustments');
      await m.applyLayout('single-column');
      expect(spy).toHaveBeenCalled();
      m.destroy();
    });

    it('should scale components for responsive layout', async () => {
      const m = new LayoutManager({ enableResponsive: true });
      await m.applyLayout('default');
      const listener = jest.fn();
      m.on('layout:interface-update', listener);
      await m.updateTerminalSize({ width: 240, height: 80 });
      expect(listener).toHaveBeenCalledTimes(1);
      m.destroy();
    });
  });

  describe('private helpers', () => {
    it('applyLayoutToInterface emits event', async () => {
      const m = new LayoutManager();
      const listener = jest.fn();
      m.on('layout:interface-update', listener);
      await (m as any).applyLayoutToInterface(m.getCurrentLayout());
      expect(listener).toHaveBeenCalledTimes(1);
      m.destroy();
    });

    it('componentsOverlap detects overlap', () => {
      const m = new LayoutManager();
      const c1 = { type: 'a', position: { x: 0, y: 0, width: 5, height: 5 }, size: { minWidth: 1, minHeight: 1 }, config: {} };
      const c2 = { type: 'b', position: { x: 4, y: 4, width: 5, height: 5 }, size: { minWidth: 1, minHeight: 1 }, config: {} };
      expect((m as any).componentsOverlap(c1, c2)).toBe(true);
      m.destroy();
    });

    it('calculateGridUtilization returns valid percentage', () => {
      const m = new LayoutManager();
      const util = (m as any).calculateGridUtilization(m.getCurrentLayout());
      expect(util).toBeGreaterThan(0);
      expect(util).toBeLessThanOrEqual(100);
      m.destroy();
    });
  });

  describe('destroy', () => {
    it('should cleanup', () => {
      expect(() => new LayoutManager().destroy()).not.toThrow();
    });
  });
});
