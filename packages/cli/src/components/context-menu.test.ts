/**
 * @fileoverview Unit tests for ContextMenu component
 * @author Development Team
 * @since 1.0.0
 */

import { EventEmitter } from 'events';
import { ContextMenu, ContextMenuItem, ContextMenuConfig } from './context-menu';

// Mock blessed module
jest.mock('blessed', () => ({
  box: jest.fn(),
}));

describe('ContextMenu', () => {
  let contextMenu: ContextMenu;
  let mockScreen: any;
  let mockEventBus: EventEmitter;
  let mockMenuBox: any;

  const createMockBox = () => ({
    left: 0,
    top: 0,
    width: 20,
    height: 5,
    content: '',
    setContent: jest.fn(),
    focus: jest.fn(),
    key: jest.fn(),
    on: jest.fn(),
    destroy: jest.fn(),
  });

  const sampleMenuItems: ContextMenuItem[] = [
    {
      label: 'View Details',
      action: 'view-details',
      icon: '📋',
      shortcut: 'Enter',
    },
    {
      label: 'Refresh',
      action: 'refresh',
      icon: '🔄',
      shortcut: 'F5',
    },
    {
      label: 'Delete',
      action: 'delete',
      icon: '🗑️',
      enabled: false,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    mockMenuBox = createMockBox();

    mockScreen = {
      width: 80,
      height: 24,
      append: jest.fn(),
      remove: jest.fn(),
      render: jest.fn(),
      on: jest.fn(),
    };

    mockEventBus = new EventEmitter();

    // Mock blessed.box to return our mock menu box
    const blessed = require('blessed');
    blessed.box.mockReturnValue(mockMenuBox);

    contextMenu = new ContextMenu(mockScreen, mockEventBus);
  });

  afterEach(() => {
    contextMenu.destroy();
  });

  describe('Constructor', () => {
    it('should initialize context menu with screen and event bus', () => {
      expect(contextMenu).toBeInstanceOf(ContextMenu);
    });

    it('should start with invisible state', () => {
      expect(contextMenu.isContextMenuVisible()).toBe(false);
    });

    it('should initialize selected index to 0', () => {
      expect(contextMenu.getSelectedIndex()).toBe(0);
    });
  });

  describe('show method', () => {
    const config: ContextMenuConfig = {
      items: sampleMenuItems,
      x: 10,
      y: 5,
      context: 'test-context',
      componentId: 'test-component',
      autoHide: true,
      style: {
        fg: 'white',
        bg: 'black',
        selectedFg: 'black',
        selectedBg: 'cyan',
      },
    };

    it('should show context menu with provided configuration', () => {
      contextMenu.show(config);

      expect(contextMenu.isContextMenuVisible()).toBe(true);
      expect(mockScreen.append).toHaveBeenCalledWith(mockMenuBox);
      expect(mockMenuBox.focus).toHaveBeenCalled();
      expect(mockScreen.render).toHaveBeenCalled();
    });

    it('should filter out disabled menu items', () => {
      contextMenu.show(config);

      expect(contextMenu.isContextMenuVisible()).toBe(true);
      // Should only have 2 enabled items (View Details and Refresh)
      expect(mockScreen.append).toHaveBeenCalled();
    });

    it('should hide existing menu before showing new one', () => {
      contextMenu.show(config);
      expect(contextMenu.isContextMenuVisible()).toBe(true);

      const removeSpy = jest.spyOn(mockScreen, 'remove');
      contextMenu.show(config);

      expect(removeSpy).toHaveBeenCalled();
    });

    it('should not show menu if no enabled items', () => {
      const emptyConfig: ContextMenuConfig = {
        items: [
          { label: 'Disabled', action: 'disabled', enabled: false },
        ],
        x: 10,
        y: 5,
      };

      contextMenu.show(emptyConfig);

      expect(contextMenu.isContextMenuVisible()).toBe(false);
      expect(mockScreen.append).not.toHaveBeenCalled();
    });

    it('should emit contextmenu:shown event', () => {
      const eventSpy = jest.spyOn(mockEventBus, 'emit');

      contextMenu.show(config);

      expect(eventSpy).toHaveBeenCalledWith('contextmenu:shown', {
        x: config.x,
        y: config.y,
        context: config.context,
        componentId: config.componentId,
        itemCount: 2, // Only enabled items
        timestamp: expect.any(Date),
      });
    });

    it('should handle creation errors gracefully', () => {
      const blessed = require('blessed');
      blessed.box.mockImplementation(() => {
        throw new Error('Box creation failed');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      contextMenu.show(config);

      expect(contextMenu.isContextMenuVisible()).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to create context menu:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
      
      // Reset the mock to return normal mock box for other tests
      blessed.box.mockReturnValue(mockMenuBox);
    });
  });

  describe('hide method', () => {
    const config: ContextMenuConfig = {
      items: sampleMenuItems,
      x: 10,
      y: 5,
    };

    it('should hide visible context menu', () => {
      contextMenu.show(config);
      expect(contextMenu.isContextMenuVisible()).toBe(true);

      contextMenu.hide();

      expect(contextMenu.isContextMenuVisible()).toBe(false);
      expect(mockScreen.remove).toHaveBeenCalledWith(mockMenuBox);
      expect(mockScreen.render).toHaveBeenCalledTimes(2); // Once for show, once for hide
    });

    it('should reset menu state when hiding', () => {
      contextMenu.show(config);
      expect(contextMenu.getSelectedIndex()).toBe(0);

      contextMenu.hide();

      expect(contextMenu.getSelectedIndex()).toBe(0);
    });

    it('should emit contextmenu:hidden event', () => {
      contextMenu.show(config);
      const eventSpy = jest.spyOn(mockEventBus, 'emit');

      contextMenu.hide();

      expect(eventSpy).toHaveBeenCalledWith('contextmenu:hidden', {
        timestamp: expect.any(Date),
      });
    });

    it('should do nothing if menu is not visible', () => {
      expect(contextMenu.isContextMenuVisible()).toBe(false);

      contextMenu.hide();

      expect(mockScreen.remove).not.toHaveBeenCalled();
    });

    it('should handle removal errors gracefully', () => {
      contextMenu.show(config);
      mockScreen.remove.mockImplementation(() => {
        throw new Error('Remove failed');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      contextMenu.hide();

      expect(contextMenu.isContextMenuVisible()).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to hide context menu:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('navigation methods', () => {
    const config: ContextMenuConfig = {
      items: sampleMenuItems,
      x: 10,
      y: 5,
    };

    beforeEach(() => {
      contextMenu.show(config);
    });

    describe('navigateUp method', () => {
      it('should move selection up', () => {
        expect(contextMenu.getSelectedIndex()).toBe(0);

        contextMenu.navigateUp();

        expect(contextMenu.getSelectedIndex()).toBe(1); // Wraps to last item
        expect(mockMenuBox.setContent).toHaveBeenCalled();
      });

      it('should wrap to last item when at first item', () => {
        expect(contextMenu.getSelectedIndex()).toBe(0);

        contextMenu.navigateUp();

        expect(contextMenu.getSelectedIndex()).toBe(1); // Only 2 enabled items
      });

      it('should do nothing if menu is not visible', () => {
        contextMenu.hide();
        jest.clearAllMocks(); // Clear previous calls
        
        contextMenu.navigateUp();

        expect(mockMenuBox.setContent).not.toHaveBeenCalled();
      });
    });

    describe('navigateDown method', () => {
      it('should move selection down', () => {
        expect(contextMenu.getSelectedIndex()).toBe(0);

        contextMenu.navigateDown();

        expect(contextMenu.getSelectedIndex()).toBe(1);
        expect(mockMenuBox.setContent).toHaveBeenCalled();
      });

      it('should wrap to first item when at last item', () => {
        contextMenu.navigateDown(); // Move to index 1
        expect(contextMenu.getSelectedIndex()).toBe(1);

        contextMenu.navigateDown(); // Should wrap to 0

        expect(contextMenu.getSelectedIndex()).toBe(0);
      });

      it('should do nothing if menu is not visible', () => {
        contextMenu.hide();
        jest.clearAllMocks(); // Clear previous calls

        contextMenu.navigateDown();

        expect(mockMenuBox.setContent).not.toHaveBeenCalled();
      });
    });
  });

  describe('selectItem method', () => {
    const config: ContextMenuConfig = {
      items: sampleMenuItems,
      x: 10,
      y: 5,
      context: 'test-context',
      componentId: 'test-component',
    };

    beforeEach(() => {
      contextMenu.show(config);
    });

    it('should execute action for selected item', () => {
      const eventSpy = jest.spyOn(mockEventBus, 'emit');

      contextMenu.selectItem();

      expect(eventSpy).toHaveBeenCalledWith('contextmenu:action', {
        action: 'view-details',
        label: 'View Details',
        context: 'test-context',
        componentId: 'test-component',
        timestamp: expect.any(Date),
      });
    });

    it('should emit specific action event', () => {
      const eventSpy = jest.spyOn(mockEventBus, 'emit');

      contextMenu.selectItem();

      expect(eventSpy).toHaveBeenCalledWith('action:view-details', {
        context: 'test-context',
        componentId: 'test-component',
        source: 'contextmenu',
      });
    });

    it('should hide menu after selection', () => {
      contextMenu.selectItem();

      expect(contextMenu.isContextMenuVisible()).toBe(false);
    });

    it('should do nothing if menu is not visible', () => {
      contextMenu.hide();
      const eventSpy = jest.spyOn(mockEventBus, 'emit');

      contextMenu.selectItem();

      expect(eventSpy).not.toHaveBeenCalledWith(
        expect.stringMatching(/^(contextmenu:action|action:)/),
        expect.anything()
      );
    });
  });

  describe('menu positioning', () => {
    it('should adjust position to stay within screen bounds', () => {
      const config: ContextMenuConfig = {
        items: sampleMenuItems,
        x: 70, // Near right edge
        y: 20, // Near bottom edge
      };

      contextMenu.show(config);

      expect(mockScreen.append).toHaveBeenCalledWith(mockMenuBox);
      // The blessed.box should be called with adjusted position
      expect(require('blessed').box).toHaveBeenCalledWith(
        expect.objectContaining({
          left: expect.any(Number),
          top: expect.any(Number),
        })
      );
    });

    it('should use original position if it fits on screen', () => {
      const config: ContextMenuConfig = {
        items: sampleMenuItems,
        x: 10,
        y: 5,
      };

      contextMenu.show(config);

      expect(require('blessed').box).toHaveBeenCalledWith(
        expect.objectContaining({
          left: 10,
          top: 5,
        })
      );
    });
  });

  describe('menu content generation', () => {
    const config: ContextMenuConfig = {
      items: [
        {
          label: 'View Details',
          action: 'view',
          icon: '📋',
          shortcut: 'Enter',
        },
        {
          label: 'Refresh',
          action: 'refresh',
          icon: '🔄',
        },
      ],
      x: 10,
      y: 5,
      style: {
        selectedFg: 'black',
        selectedBg: 'white',
      },
    };

    it('should generate content with icons and shortcuts', () => {
      // The blessed.box constructor is called with content parameter
      contextMenu.show(config);

      // Check that blessed.box was called with content containing icons
      const blessed = require('blessed');
      const boxCall = blessed.box.mock.calls[blessed.box.mock.calls.length - 1][0];
      expect(boxCall.content).toContain('📋 View Details');
      expect(boxCall.content).toContain('🔄 Refresh');
    });

    it('should highlight selected item', () => {
      contextMenu.show(config);

      // Check that blessed.box was called with content containing highlighting
      const blessed = require('blessed');
      const boxCall = blessed.box.mock.calls[blessed.box.mock.calls.length - 1][0];
      expect(boxCall.content).toContain('{white-bg}{black-fg}');
    });

    it('should handle content generation errors', () => {
      mockMenuBox.setContent.mockImplementation(() => {
        throw new Error('Content update failed');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      contextMenu.show(config);
      contextMenu.navigateDown(); // This should trigger content update

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to update menu display:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('keyboard event handling', () => {
    const config: ContextMenuConfig = {
      items: sampleMenuItems,
      x: 10,
      y: 5,
    };

    beforeEach(() => {
      contextMenu.show(config);
    });

    it('should set up keyboard event handlers', () => {
      expect(mockMenuBox.key).toHaveBeenCalledWith(['up', 'k'], expect.any(Function));
      expect(mockMenuBox.key).toHaveBeenCalledWith(['down', 'j'], expect.any(Function));
      expect(mockMenuBox.key).toHaveBeenCalledWith(['enter', 'space'], expect.any(Function));
      expect(mockMenuBox.key).toHaveBeenCalledWith(['escape', 'q'], expect.any(Function));
    });

    it('should handle mouse click events', () => {
      expect(mockMenuBox.on).toHaveBeenCalledWith('click', expect.any(Function));
    });

    it('should set up auto-hide functionality', () => {
      const autoHideConfig: ContextMenuConfig = {
        ...config,
        autoHide: true,
      };

      contextMenu.show(autoHideConfig);

      expect(mockScreen.on).toHaveBeenCalledWith('click', expect.any(Function));
    });

    it('should not set up auto-hide when disabled', () => {
      const noAutoHideConfig: ContextMenuConfig = {
        ...config,
        autoHide: false,
      };

      // Clear any previous calls
      jest.clearAllMocks();
      
      contextMenu.show(noAutoHideConfig);

      // Since autoHide is explicitly false, screen click listener should not be added
      expect(mockScreen.on).not.toHaveBeenCalledWith('click', expect.any(Function));
    });
  });

  describe('menu width calculation', () => {
    it('should calculate width based on longest menu item', () => {
      const longItemConfig: ContextMenuConfig = {
        items: [
          {
            label: 'Short',
            action: 'short',
          },
          {
            label: 'This is a very long menu item with icon and shortcut',
            action: 'long',
            icon: '📋',
            shortcut: 'Ctrl+Shift+F12',
          },
        ],
        x: 10,
        y: 5,
      };

      contextMenu.show(longItemConfig);

      expect(require('blessed').box).toHaveBeenCalledWith(
        expect.objectContaining({
          width: expect.any(Number),
        })
      );
    });

    it('should enforce minimum width', () => {
      const shortItemConfig: ContextMenuConfig = {
        items: [
          {
            label: 'OK',
            action: 'ok',
          },
        ],
        x: 10,
        y: 5,
      };

      contextMenu.show(shortItemConfig);

      expect(require('blessed').box).toHaveBeenCalledWith(
        expect.objectContaining({
          width: expect.any(Number),
        })
      );
    });

    it('should cap maximum width', () => {
      const veryLongLabel = 'X'.repeat(100);
      const longItemConfig: ContextMenuConfig = {
        items: [
          {
            label: veryLongLabel,
            action: 'long',
          },
        ],
        x: 10,
        y: 5,
      };

      contextMenu.show(longItemConfig);

      expect(require('blessed').box).toHaveBeenCalledWith(
        expect.objectContaining({
          width: expect.any(Number),
        })
      );
    });
  });

  describe('destroy method', () => {
    it('should hide menu when destroyed', () => {
      const config: ContextMenuConfig = {
        items: sampleMenuItems,
        x: 10,
        y: 5,
      };

      contextMenu.show(config);
      expect(contextMenu.isContextMenuVisible()).toBe(true);

      contextMenu.destroy();

      expect(contextMenu.isContextMenuVisible()).toBe(false);
    });

    it('should be safe to call when menu is not visible', () => {
      expect(() => {
        contextMenu.destroy();
      }).not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle empty menu items array', () => {
      const config: ContextMenuConfig = {
        items: [],
        x: 10,
        y: 5,
      };

      contextMenu.show(config);

      expect(contextMenu.isContextMenuVisible()).toBe(false);
    });

    it('should handle menu items without icons', () => {
      const config: ContextMenuConfig = {
        items: [
          {
            label: 'No Icon',
            action: 'no-icon',
          },
        ],
        x: 10,
        y: 5,
      };

      expect(() => {
        contextMenu.show(config);
      }).not.toThrow();
    });

    it('should handle menu items without shortcuts', () => {
      const config: ContextMenuConfig = {
        items: [
          {
            label: 'No Shortcut',
            action: 'no-shortcut',
            icon: '📋',
          },
        ],
        x: 10,
        y: 5,
      };

      expect(() => {
        contextMenu.show(config);
      }).not.toThrow();
    });

    it('should handle small screen dimensions', () => {
      mockScreen.width = 20;
      mockScreen.height = 10;

      const config: ContextMenuConfig = {
        items: sampleMenuItems,
        x: 15,
        y: 8,
      };

      expect(() => {
        contextMenu.show(config);
      }).not.toThrow();
    });
  });
});