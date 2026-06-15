/**
 * Additional branch coverage tests
 */

import { LayoutManager } from '../config/layout-manager';
import { ThemeManager } from '../config/theme-manager';

describe('Branch Coverage Tests', () => {
  describe('LayoutManager edge cases', () => {
    it('should handle layout with different terminal size requirements', async () => {
      const manager = new LayoutManager();
      
      // Test different terminal sizes
      await manager.updateTerminalSize({ width: 80, height: 24 });
      await manager.updateTerminalSize({ width: 160, height: 60 });
      
      // Test layout switching
      await manager.applyLayout('compact');
      await manager.applyLayout('default');
      
      manager.destroy();
    });

    it('should handle empty layouts list', () => {
      const manager = new LayoutManager();
      
      // Test error handling
      expect(() => manager.getLayout('nonexistent')).not.toThrow();
      expect(manager.getLayout('nonexistent')).toBeUndefined();
      
      manager.destroy();
    });

    it('should handle layout metrics calculation', () => {
      const manager = new LayoutManager();
      
      // Test metrics with different layouts
      const metrics1 = manager.getLayoutMetrics();
      expect(metrics1.totalComponents).toBeGreaterThanOrEqual(0);
      
      const metrics2 = manager.getLayoutMetrics('default');
      expect(metrics2.totalComponents).toBeGreaterThanOrEqual(0);
      
      manager.destroy();
    });

    it('should handle layout optimization', () => {
      const manager = new LayoutManager();
      
      // Test optimization with different layouts
      const currentLayout = manager.getCurrentLayout();
      const optimized = manager.optimizeLayout(currentLayout);
      
      expect(optimized).toHaveProperty('id');
      expect(optimized).toHaveProperty('components');
      expect(optimized.id).toBe(currentLayout.id);
      
      manager.destroy();
    });

    it('should handle overlapping component detection', () => {
      const manager = new LayoutManager();
      
      // Test overlapping components detection
      const currentLayout = manager.getCurrentLayout();
      const overlapping = manager.findOverlappingComponents(currentLayout);
      
      expect(Array.isArray(overlapping)).toBe(true);
      expect(overlapping.length).toBeGreaterThanOrEqual(0);
      
      manager.destroy();
    });
  });

  describe('ThemeManager edge cases', () => {
    it('should handle theme with different configurations', async () => {
      const manager = new ThemeManager();
      
      // Test different themes
      const defaultTheme = manager.getTheme('default');
      expect(defaultTheme).toBeDefined();
      
      const nonExistentTheme = manager.getTheme('nonexistent');
      expect(nonExistentTheme).toBeUndefined();
      
      // Test theme lists
      const customThemes = manager.getCustomThemes();
      expect(Array.isArray(customThemes)).toBe(true);
      
      const builtInThemes = manager.getBuiltInThemes();
      expect(Array.isArray(builtInThemes)).toBe(true);
      
      // Test preview mode
      expect(manager.isInPreviewMode()).toBe(false);
      
      manager.destroy();
    });

    it('should handle theme application', async () => {
      const manager = new ThemeManager();
      
      // Test theme application
      await manager.applyTheme('default');
      expect(manager.getCurrentThemeId()).toBe('default');
      
      // Test non-existent theme
      try {
        await manager.applyTheme('nonexistent');
        expect(false).toBe(true); // Should not reach here
      } catch (error) {
        expect(error).toBeDefined();
      }
      
      manager.destroy();
    });

    it('should handle theme options', () => {
      const manager1 = new ThemeManager();
      const manager2 = new ThemeManager({
        autoSave: false,
        enablePreview: false
      });
      
      expect(manager1).toBeInstanceOf(ThemeManager);
      expect(manager2).toBeInstanceOf(ThemeManager);
      
      // Test available themes
      const themes1 = manager1.getAvailableThemes();
      const themes2 = manager2.getAvailableThemes();
      
      expect(Array.isArray(themes1)).toBe(true);
      expect(Array.isArray(themes2)).toBe(true);
      
      manager1.destroy();
      manager2.destroy();
    });
  });

  describe('LayoutManager options', () => {
    it('should handle different constructor options', () => {
      const manager1 = new LayoutManager();
      const manager2 = new LayoutManager({
        autoSave: false,
        enableResponsive: false
      });
      
      expect(manager1).toBeInstanceOf(LayoutManager);
      expect(manager2).toBeInstanceOf(LayoutManager);
      
      // Test with different options
      const layouts1 = manager1.getAvailableLayouts();
      const layouts2 = manager2.getAvailableLayouts();
      
      expect(Array.isArray(layouts1)).toBe(true);
      expect(Array.isArray(layouts2)).toBe(true);
      
      manager1.destroy();
      manager2.destroy();
    });

    it('should handle layout ID validation', () => {
      const manager = new LayoutManager();
      
      // Test current layout ID
      const currentId = manager.getCurrentLayoutId();
      expect(typeof currentId).toBe('string');
      expect(currentId.length).toBeGreaterThan(0);
      
      // Test current layout
      const currentLayout = manager.getCurrentLayout();
      expect(currentLayout).toBeDefined();
      expect(currentLayout.id).toBe(currentId);
      
      manager.destroy();
    });
  });
});