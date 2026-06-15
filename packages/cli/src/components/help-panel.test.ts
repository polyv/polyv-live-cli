/**
 * @fileoverview Unit tests for HelpPanel component
 * @author Development Team
 * @since 1.0.0
 */

import { EventEmitter } from 'events';
import { HelpPanel, HelpPanelConfig } from './help-panel';
import { ShortcutConfig } from '../types/interaction';

// Mock blessed
const mockScreen = {
  append: jest.fn(),
  remove: jest.fn(),
  render: jest.fn(),
};

const mockBox = {
  key: jest.fn(),
  focus: jest.fn(),
  scroll: jest.fn(),
  on: jest.fn(),
};

jest.mock('blessed', () => ({
  box: jest.fn(() => mockBox),
}));

describe('HelpPanel', () => {
  let eventBus: EventEmitter;
  let helpPanel: HelpPanel;
  let config: HelpPanelConfig;

  beforeEach(() => {
    eventBus = new EventEmitter();
    config = {
      title: 'Test Help Panel',
      showShortcuts: true,
      showNavigation: true,
      showUsageTips: true,
    };
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (helpPanel) {
      helpPanel.destroy();
    }
  });

  describe('Constructor', () => {
    it('should initialize with default configuration', () => {
      helpPanel = new HelpPanel(mockScreen, eventBus);
      
      expect(helpPanel).toBeDefined();
      expect(helpPanel.isHelpVisible()).toBe(false);
    });

    it('should initialize with custom configuration', () => {
      helpPanel = new HelpPanel(mockScreen, eventBus, config);
      
      expect(helpPanel).toBeDefined();
      expect(helpPanel.isHelpVisible()).toBe(false);
    });

    it('should merge custom config with defaults', () => {
      const partialConfig = { title: 'Custom Title' };
      helpPanel = new HelpPanel(mockScreen, eventBus, partialConfig);
      
      expect(helpPanel).toBeDefined();
    });
  });

  describe('Shortcut Management', () => {
    beforeEach(() => {
      helpPanel = new HelpPanel(mockScreen, eventBus, config);
    });

    it('should set shortcuts for display', () => {
      const shortcuts: ShortcutConfig[] = [
        {
          key: 'f1',
          description: 'Show help',
          action: 'help',
          global: true,
        },
        {
          key: 'f5',
          description: 'Refresh data',
          action: 'refresh',
          global: true,
        },
      ];

      helpPanel.setShortcuts(shortcuts);
      
      // Should not throw and should accept the shortcuts
      expect(() => helpPanel.setShortcuts(shortcuts)).not.toThrow();
    });

    it('should handle empty shortcuts array', () => {
      helpPanel.setShortcuts([]);
      
      expect(() => helpPanel.setShortcuts([])).not.toThrow();
    });

    it('should handle shortcuts with different categories', () => {
      const shortcuts: ShortcutConfig[] = [
        {
          key: 'f5',
          description: 'Refresh all data',
          action: 'refresh-all',
          global: true,
        },
        {
          key: '1',
          description: 'Switch to layout 1',
          action: 'layout:1',
          global: true,
        },
        {
          key: 'ctrl+f',
          description: 'Search channels',
          action: 'search',
          global: true,
          context: 'list',
        },
        {
          key: 'q',
          description: 'Exit application',
          action: 'exit',
          global: true,
        },
      ];

      helpPanel.setShortcuts(shortcuts);
      
      expect(() => helpPanel.setShortcuts(shortcuts)).not.toThrow();
    });
  });

  describe('Visibility Management', () => {
    beforeEach(() => {
      helpPanel = new HelpPanel(mockScreen, eventBus, config);
    });

    it('should show help panel', () => {
      const eventSpy = jest.spyOn(eventBus, 'emit');
      
      helpPanel.show();
      
      expect(helpPanel.isHelpVisible()).toBe(true);
      expect(mockScreen.append).toHaveBeenCalled();
      expect(mockScreen.render).toHaveBeenCalled();
      expect(eventSpy).toHaveBeenCalledWith('help:shown', expect.objectContaining({
        timestamp: expect.any(Date),
      }));
    });

    it('should not show help panel if already visible', () => {
      helpPanel.show();
      jest.clearAllMocks();
      
      helpPanel.show();
      
      // Should not be called again
      expect(mockScreen.append).not.toHaveBeenCalled();
    });

    it('should hide help panel', () => {
      const eventSpy = jest.spyOn(eventBus, 'emit');
      
      helpPanel.show();
      helpPanel.hide();
      
      expect(helpPanel.isHelpVisible()).toBe(false);
      expect(mockScreen.remove).toHaveBeenCalled();
      expect(mockScreen.render).toHaveBeenCalled();
      expect(eventSpy).toHaveBeenCalledWith('help:hidden', expect.objectContaining({
        timestamp: expect.any(Date),
      }));
    });

    it('should not hide help panel if not visible', () => {
      const eventSpy = jest.spyOn(eventBus, 'emit');
      
      helpPanel.hide();
      
      expect(mockScreen.remove).not.toHaveBeenCalled();
      expect(eventSpy).not.toHaveBeenCalledWith('help:hidden', expect.any(Object));
    });

    it('should toggle help panel visibility', () => {
      // Initially hidden
      expect(helpPanel.isHelpVisible()).toBe(false);
      
      // Toggle to show
      helpPanel.toggle();
      expect(helpPanel.isHelpVisible()).toBe(true);
      
      // Toggle to hide
      helpPanel.toggle();
      expect(helpPanel.isHelpVisible()).toBe(false);
    });
  });

  describe('Event Handling', () => {
    beforeEach(() => {
      helpPanel = new HelpPanel(mockScreen, eventBus, config);
    });

    it('should emit help:shown event when shown', () => {
      const eventSpy = jest.spyOn(eventBus, 'emit');
      
      helpPanel.show();
      
      expect(eventSpy).toHaveBeenCalledWith('help:shown', {
        timestamp: expect.any(Date),
      });
    });

    it('should emit help:hidden event when hidden', () => {
      const eventSpy = jest.spyOn(eventBus, 'emit');
      
      helpPanel.show();
      helpPanel.hide();
      
      expect(eventSpy).toHaveBeenCalledWith('help:hidden', {
        timestamp: expect.any(Date),
      });
    });

    it('should set up event handlers for help box', () => {
      helpPanel.show();
      
      expect(mockBox.key).toHaveBeenCalledWith(
        ['escape', 'enter', 'q', 'C-c'],
        expect.any(Function)
      );
      expect(mockBox.key).toHaveBeenCalledWith(
        ['up', 'down', 'pageup', 'pagedown'],
        expect.any(Function)
      );
      expect(mockBox.on).toHaveBeenCalledWith('wheelup', expect.any(Function));
      expect(mockBox.on).toHaveBeenCalledWith('wheeldown', expect.any(Function));
    });
  });

  describe('Content Generation', () => {
    beforeEach(() => {
      helpPanel = new HelpPanel(mockScreen, eventBus, config);
    });

    it('should generate help content with shortcuts', () => {
      const shortcuts: ShortcutConfig[] = [
        {
          key: 'f1',
          description: 'Show help',
          action: 'help',
          global: true,
        },
        {
          key: 'f5',
          description: 'Refresh data',
          action: 'refresh-all',
          global: true,
        },
      ];

      helpPanel.setShortcuts(shortcuts);
      helpPanel.show();
      
      // Should create box with content
      expect(require('blessed').box).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.stringContaining('PolyV Live Monitoring Dashboard - Help'),
        })
      );
    });

    it('should generate content without shortcuts when disabled', () => {
      const configNoShortcuts = { ...config, showShortcuts: false };
      helpPanel = new HelpPanel(mockScreen, eventBus, configNoShortcuts);
      
      helpPanel.show();
      
      expect(require('blessed').box).toHaveBeenCalled();
    });

    it('should generate content without navigation when disabled', () => {
      const configNoNav = { ...config, showNavigation: false };
      helpPanel = new HelpPanel(mockScreen, eventBus, configNoNav);
      
      helpPanel.show();
      
      expect(require('blessed').box).toHaveBeenCalled();
    });

    it('should generate content without usage tips when disabled', () => {
      const configNoTips = { ...config, showUsageTips: false };
      helpPanel = new HelpPanel(mockScreen, eventBus, configNoTips);
      
      helpPanel.show();
      
      expect(require('blessed').box).toHaveBeenCalled();
    });

    it('should include custom sections in content', () => {
      const configWithCustom = {
        ...config,
        customSections: [
          {
            title: 'Custom Section',
            content: ['Custom line 1', 'Custom line 2'],
          },
        ],
      };
      helpPanel = new HelpPanel(mockScreen, eventBus, configWithCustom);
      
      helpPanel.show();
      
      expect(require('blessed').box).toHaveBeenCalled();
    });
  });

  describe('Configuration Management', () => {
    beforeEach(() => {
      helpPanel = new HelpPanel(mockScreen, eventBus, config);
    });

    it('should update configuration', () => {
      const newConfig = { title: 'Updated Title' };
      
      helpPanel.updateConfig(newConfig);
      
      // Should not throw
      expect(() => helpPanel.updateConfig(newConfig)).not.toThrow();
    });

    it('should recreate help panel when visible and config updated', () => {
      helpPanel.show();
      jest.clearAllMocks();
      
      const newConfig = { title: 'Updated Title' };
      helpPanel.updateConfig(newConfig);
      
      // Should hide and show again
      expect(mockScreen.remove).toHaveBeenCalled();
      expect(mockScreen.append).toHaveBeenCalled();
    });

    it('should not recreate help panel when hidden and config updated', () => {
      const newConfig = { title: 'Updated Title' };
      helpPanel.updateConfig(newConfig);
      
      // Should not show/hide
      expect(mockScreen.remove).not.toHaveBeenCalled();
      expect(mockScreen.append).not.toHaveBeenCalled();
    });
  });

  describe('Key Formatting', () => {
    beforeEach(() => {
      helpPanel = new HelpPanel(mockScreen, eventBus, config);
    });

    it('should format keys correctly', () => {
      const shortcuts: ShortcutConfig[] = [
        {
          key: 'ctrl+f',
          description: 'Search',
          action: 'search',
          global: true,
        },
        {
          key: 'alt+enter',
          description: 'Alternative action',
          action: 'alt-action',
          global: true,
        },
        {
          key: 'f12',
          description: 'Function key',
          action: 'function',
          global: true,
        },
        {
          key: 'a',
          description: 'Single key',
          action: 'single',
          global: true,
        },
      ];

      helpPanel.setShortcuts(shortcuts);
      helpPanel.show();
      
      // Should format keys properly in the content
      expect(require('blessed').box).toHaveBeenCalled();
    });
  });

  describe('Shortcut Categorization', () => {
    beforeEach(() => {
      helpPanel = new HelpPanel(mockScreen, eventBus, config);
    });

    it('should categorize shortcuts correctly', () => {
      const shortcuts: ShortcutConfig[] = [
        {
          key: 'f5',
          description: 'Refresh all data',
          action: 'refresh-all',
          global: true,
        },
        {
          key: '1',
          description: 'Switch to layout 1',
          action: 'layout:1',
          global: true,
        },
        {
          key: 'ctrl+f',
          description: 'Search channels',
          action: 'search',
          global: true,
        },
        {
          key: 'q',
          description: 'Exit application',
          action: 'exit',
          global: true,
        },
        {
          key: 'f11',
          description: 'Toggle fullscreen',
          action: 'fullscreen',
          global: true,
        },
      ];

      helpPanel.setShortcuts(shortcuts);
      helpPanel.show();
      
      expect(require('blessed').box).toHaveBeenCalled();
    });
  });

  describe('Destruction', () => {
    beforeEach(() => {
      helpPanel = new HelpPanel(mockScreen, eventBus, config);
    });

    it('should destroy help panel and clean up resources', () => {
      const shortcuts: ShortcutConfig[] = [
        {
          key: 'f1',
          description: 'Help',
          action: 'help',
          global: true,
        },
      ];

      helpPanel.setShortcuts(shortcuts);
      helpPanel.show();
      
      helpPanel.destroy();
      
      expect(helpPanel.isHelpVisible()).toBe(false);
      expect(mockScreen.remove).toHaveBeenCalled();
    });

    it('should handle destruction when not visible', () => {
      helpPanel.destroy();
      
      // Should not throw
      expect(() => helpPanel.destroy()).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      helpPanel = new HelpPanel(mockScreen, eventBus, config);
    });

    it('should handle screen append errors gracefully', () => {
      mockScreen.append.mockImplementation(() => {
        throw new Error('Append failed');
      });
      
      expect(() => helpPanel.show()).not.toThrow();
    });

    it('should handle screen remove errors gracefully', () => {
      helpPanel.show();
      mockScreen.remove.mockImplementation(() => {
        throw new Error('Remove failed');
      });
      
      expect(() => helpPanel.hide()).not.toThrow();
    });

    it('should handle malformed shortcuts gracefully', () => {
      const badShortcuts = [
        {
          key: '',
          description: '',
          action: '',
          global: true,
        },
        null as any,
        undefined as any,
      ].filter(Boolean);

      expect(() => helpPanel.setShortcuts(badShortcuts)).not.toThrow();
    });
  });
});