/**
 * @fileoverview Unit tests for InteractionManager
 * @author Development Team
 * @since 1.0.0
 */

// Note: EventEmitter imported for type reference but used indirectly
import { InteractionManager } from './interaction-manager';
import { InteractionConfig, FocusableComponent, KeyboardEvent, MouseEvent, FocusState } from '../types/interaction';

// Mock blessed screen
const createMockScreen = () => ({
  on: jest.fn(),
  key: jest.fn(),
  program: {
    enableMouse: jest.fn(),
    disableMouse: jest.fn(),
  },
});

// Mock focusable component
class MockFocusableComponent implements FocusableComponent {
  private id: string;
  private type: string;
  private focusState: FocusState;
  
  constructor(id: string, type: string, tabIndex = 0) {
    this.id = id;
    this.type = type;
    this.focusState = {
      focused: false,
      focusable: true,
      tabIndex,
      showFocusRing: true,
    };
  }
  
  getId(): string {
    return this.id;
  }
  
  getType(): string {
    return this.type;
  }
  
  canFocus(): boolean {
    return this.focusState.focusable;
  }
  
  focus(): void {
    this.focusState.focused = true;
  }
  
  blur(): void {
    this.focusState.focused = false;
  }
  
  getFocusState(): FocusState {
    return { ...this.focusState };
  }
  
  handleKeyboard(event: KeyboardEvent): boolean {
    return event.key === 'enter' || event.key === 'space';
  }
  
  handleMouse(event: MouseEvent): boolean {
    return event.action === 'mousedown';
  }
  
  setFocusable(focusable: boolean): void {
    this.focusState.focusable = focusable;
  }
}

describe('InteractionManager', () => {
  let mockScreen: any;
  let config: InteractionConfig;
  let interactionManager: InteractionManager;

  beforeEach(() => {
    mockScreen = createMockScreen();
    config = {
      mouseEnabled: true,
      keyboardEnabled: true,
      focusRing: {
        enabled: true,
        style: { border: { fg: 'cyan' } },
      },
      shortcuts: [
        {
          key: 'f1',
          description: 'Help',
          action: 'help',
          global: true,
        },
      ],
      search: {
        placeholder: 'Search...',
        caseSensitive: false,
        mode: 'fuzzy',
        searchFields: ['name'],
        maxHistory: 10,
        showSuggestions: true,
      },
      statusBar: {
        enabled: true,
        position: 'bottom',
        height: 1,
      },
    };
  });

  afterEach(() => {
    if (interactionManager && !interactionManager.isInteractionManagerDestroyed()) {
      interactionManager.destroy();
    }
  });

  describe('Constructor', () => {
    it('should initialize interaction manager with screen and config', () => {
      interactionManager = new InteractionManager(mockScreen, config);
      
      expect(interactionManager).toBeDefined();
      expect(interactionManager.isInteractionManagerDestroyed()).toBe(false);
    });

    it('should throw error if screen is not provided', () => {
      expect(() => {
        new InteractionManager(null, config);
      }).toThrow('Screen instance is required for interaction management');
    });

    it('should enable mouse if configured', () => {
      interactionManager = new InteractionManager(mockScreen, config);
      
      expect(mockScreen.program.enableMouse).toHaveBeenCalled();
    });

    it('should not enable mouse if disabled in config', () => {
      config.mouseEnabled = false;
      interactionManager = new InteractionManager(mockScreen, config);
      
      expect(mockScreen.program.enableMouse).not.toHaveBeenCalled();
    });
  });

  describe('Component Registration', () => {
    beforeEach(() => {
      interactionManager = new InteractionManager(mockScreen, config);
    });

    it('should register a focusable component', () => {
      const component = new MockFocusableComponent('test-1', 'test');
      
      interactionManager.registerComponent(component);
      
      const components = interactionManager.getComponents();
      expect(components).toHaveLength(1);
      expect(components[0]?.getId()).toBe('test-1');
    });

    it('should auto-focus first component if none are focused', () => {
      const component = new MockFocusableComponent('test-1', 'test');
      
      interactionManager.registerComponent(component);
      
      expect(interactionManager.getCurrentFocus()).toBe('test-1');
      expect(component.getFocusState().focused).toBe(true);
    });

    it('should not auto-focus if component cannot focus', () => {
      const component = new MockFocusableComponent('test-1', 'test');
      component.setFocusable(false);
      
      interactionManager.registerComponent(component);
      
      expect(interactionManager.getCurrentFocus()).toBeUndefined();
    });

    it('should unregister a component', () => {
      const component = new MockFocusableComponent('test-1', 'test');
      interactionManager.registerComponent(component);
      
      interactionManager.unregisterComponent('test-1');
      
      expect(interactionManager.getComponents()).toHaveLength(0);
      expect(interactionManager.getCurrentFocus()).toBeUndefined();
    });
  });

  describe('Focus Management', () => {
    beforeEach(() => {
      interactionManager = new InteractionManager(mockScreen, config);
    });

    it('should set focus to a specific component', () => {
      const component1 = new MockFocusableComponent('test-1', 'test', 0);
      const component2 = new MockFocusableComponent('test-2', 'test', 1);
      
      interactionManager.registerComponent(component1);
      interactionManager.registerComponent(component2);
      
      const result = interactionManager.setFocus('test-2');
      
      expect(result).toBe(true);
      expect(interactionManager.getCurrentFocus()).toBe('test-2');
      expect(component1.getFocusState().focused).toBe(false);
      expect(component2.getFocusState().focused).toBe(true);
    });

    it('should not set focus to non-existent component', () => {
      const result = interactionManager.setFocus('non-existent');
      
      expect(result).toBe(false);
      expect(interactionManager.getCurrentFocus()).toBeUndefined();
    });

    it('should not set focus to non-focusable component', () => {
      const component = new MockFocusableComponent('test-1', 'test');
      component.setFocusable(false);
      interactionManager.registerComponent(component);
      
      const result = interactionManager.setFocus('test-1');
      
      expect(result).toBe(false);
    });

    it('should focus next component in tab order', () => {
      const component1 = new MockFocusableComponent('test-1', 'test', 0);
      const component2 = new MockFocusableComponent('test-2', 'test', 1);
      const component3 = new MockFocusableComponent('test-3', 'test', 2);
      
      interactionManager.registerComponent(component1);
      interactionManager.registerComponent(component2);
      interactionManager.registerComponent(component3);
      
      // Should start with first component
      expect(interactionManager.getCurrentFocus()).toBe('test-1');
      
      interactionManager.focusNext();
      expect(interactionManager.getCurrentFocus()).toBe('test-2');
      
      interactionManager.focusNext();
      expect(interactionManager.getCurrentFocus()).toBe('test-3');
      
      // Should wrap around
      interactionManager.focusNext();
      expect(interactionManager.getCurrentFocus()).toBe('test-1');
    });

    it('should focus previous component in tab order', () => {
      const component1 = new MockFocusableComponent('test-1', 'test', 0);
      const component2 = new MockFocusableComponent('test-2', 'test', 1);
      const component3 = new MockFocusableComponent('test-3', 'test', 2);
      
      interactionManager.registerComponent(component1);
      interactionManager.registerComponent(component2);
      interactionManager.registerComponent(component3);
      
      // Start with first component and go backward
      interactionManager.focusPrevious();
      expect(interactionManager.getCurrentFocus()).toBe('test-3');
      
      interactionManager.focusPrevious();
      expect(interactionManager.getCurrentFocus()).toBe('test-2');
      
      interactionManager.focusPrevious();
      expect(interactionManager.getCurrentFocus()).toBe('test-1');
    });

    it('should emit focus change events', () => {
      const component1 = new MockFocusableComponent('test-1', 'test');
      const component2 = new MockFocusableComponent('test-2', 'test');
      
      interactionManager.registerComponent(component1);
      interactionManager.registerComponent(component2);
      
      const focusHandler = jest.fn();
      interactionManager.on('focus:changed', focusHandler);
      
      interactionManager.setFocus('test-2');
      
      expect(focusHandler).toHaveBeenCalledWith({
        previous: 'test-1',
        current: 'test-2',
      });
    });

    it('should clear focus', () => {
      const component = new MockFocusableComponent('test-1', 'test');
      interactionManager.registerComponent(component);
      
      interactionManager.clearFocus();
      
      expect(interactionManager.getCurrentFocus()).toBeUndefined();
      expect(component.getFocusState().focused).toBe(false);
    });
  });

  describe('Keyboard Event Handling', () => {
    beforeEach(() => {
      interactionManager = new InteractionManager(mockScreen, config);
    });

    it('should emit keyboard events', () => {
      const keyboardHandler = jest.fn();
      interactionManager.on('keyboard:event', keyboardHandler);
      
      const keyEvent = {
        key: 'a',
        shift: false,
        ctrl: false,
        alt: false,
        meta: false,
      };
      
      // Simulate keyboard event
      interactionManager['handleKeyboardEvent'](keyEvent);
      
      expect(keyboardHandler).toHaveBeenCalledWith(keyEvent);
    });

    it('should activate shortcuts', () => {
      const shortcutHandler = jest.fn();
      interactionManager.on('shortcut:activated', shortcutHandler);
      
      const keyEvent = {
        key: 'f1',
        shift: false,
        ctrl: false,
        alt: false,
        meta: false,
      };
      
      interactionManager['handleKeyboardEvent'](keyEvent);
      
      expect(shortcutHandler).toHaveBeenCalledWith({
        key: 'f1',
        action: 'help',
      });
    });

    it('should pass keyboard events to focused component', () => {
      const component = new MockFocusableComponent('test-1', 'test');
      const handleKeyboardSpy = jest.spyOn(component, 'handleKeyboard');
      
      interactionManager.registerComponent(component);
      
      const keyEvent = {
        key: 'enter',
        shift: false,
        ctrl: false,
        alt: false,
        meta: false,
      };
      
      interactionManager['handleKeyboardEvent'](keyEvent);
      
      expect(handleKeyboardSpy).toHaveBeenCalledWith(keyEvent);
    });
  });

  describe('Mouse Event Handling', () => {
    beforeEach(() => {
      interactionManager = new InteractionManager(mockScreen, config);
    });

    it('should emit mouse events', () => {
      const mouseHandler = jest.fn();
      interactionManager.on('mouse:event', mouseHandler);
      
      const mouseEvent = {
        action: 'mousedown' as const,
        x: 10,
        y: 20,
        button: 'left' as const,
        shift: false,
        ctrl: false,
      };
      
      interactionManager['handleMouseEvent'](mouseEvent);
      
      expect(mouseHandler).toHaveBeenCalledWith(mouseEvent);
    });

    it('should handle right-click context menu', () => {
      const contextMenuHandler = jest.fn();
      interactionManager.on('contextmenu:requested', contextMenuHandler);
      
      const mouseEvent = {
        action: 'mousedown' as const,
        x: 10,
        y: 20,
        button: 'right' as const,
        shift: false,
        ctrl: false,
      };
      
      interactionManager['handleMouseEvent'](mouseEvent);
      
      expect(contextMenuHandler).toHaveBeenCalledWith({
        x: 10,
        y: 20,
        context: 'global',
        componentId: '',
      });
    });

    it('should pass mouse events to components', () => {
      const component = new MockFocusableComponent('test-1', 'test');
      const handleMouseSpy = jest.spyOn(component, 'handleMouse').mockReturnValue(true);
      
      interactionManager.registerComponent(component);
      
      const mouseEvent = {
        action: 'mousedown' as const,
        x: 10,
        y: 20,
        button: 'left' as const,
        shift: false,
        ctrl: false,
      };
      
      interactionManager['handleMouseEvent'](mouseEvent);
      
      expect(handleMouseSpy).toHaveBeenCalledWith(mouseEvent);
    });
  });

  describe('Shortcut Management', () => {
    beforeEach(() => {
      interactionManager = new InteractionManager(mockScreen, config);
    });

    it('should register new shortcuts', () => {
      const shortcut = {
        key: 'f2',
        description: 'Test shortcut',
        action: 'test',
        global: true,
      };
      
      interactionManager.registerShortcut(shortcut);
      
      const shortcuts = interactionManager.getShortcuts();
      expect(shortcuts.some(s => s.key === 'f2')).toBe(true);
    });

    it('should unregister shortcuts', () => {
      interactionManager.unregisterShortcut('f1');
      
      const shortcuts = interactionManager.getShortcuts();
      expect(shortcuts.some(s => s.key === 'f1')).toBe(false);
    });
  });

  describe('Destruction', () => {
    beforeEach(() => {
      interactionManager = new InteractionManager(mockScreen, config);
    });

    it('should destroy interaction manager and clean up resources', () => {
      const component = new MockFocusableComponent('test-1', 'test');
      interactionManager.registerComponent(component);
      
      interactionManager.destroy();
      
      expect(interactionManager.isInteractionManagerDestroyed()).toBe(true);
      expect(interactionManager.getComponents()).toHaveLength(0);
      expect(interactionManager.getCurrentFocus()).toBeUndefined();
      expect(mockScreen.program.disableMouse).toHaveBeenCalled();
    });

    it('should not allow operations after destruction', () => {
      interactionManager.destroy();
      
      const component = new MockFocusableComponent('test-1', 'test');
      interactionManager.registerComponent(component);
      
      expect(interactionManager.getComponents()).toHaveLength(0);
    });

    it('should handle keyboard events after destruction', () => {
      interactionManager.destroy();
      
      const keyEvent = {
        key: 'enter',
        shift: false,
        ctrl: false,
        alt: false,
        meta: false,
        full: 'enter',
        ch: '',
      };
      
      // Should not throw error
      expect(() => {
        interactionManager['handleKeyboardEvent'](keyEvent);
      }).not.toThrow();
    });

    it('should handle mouse events after destruction', () => {
      interactionManager.destroy();
      
      const mouseEvent = {
        action: 'mousedown' as const,
        x: 10,
        y: 20,
        button: 'left' as const,
        shift: false,
        ctrl: false,
      };
      
      // Should not throw error
      expect(() => {
        interactionManager['handleMouseEvent'](mouseEvent);
      }).not.toThrow();
    });
  });

  describe('Navigation Keys', () => {
    beforeEach(() => {
      interactionManager = new InteractionManager(mockScreen, config);
    });

    it('should handle arrow keys for navigation', () => {
      const component1 = new MockFocusableComponent('test-1', 'test', 0);
      const component2 = new MockFocusableComponent('test-2', 'test', 1);
      
      interactionManager.registerComponent(component1);
      interactionManager.registerComponent(component2);
      
      // Test down/right arrow
      const downEvent = {
        key: 'down',
        shift: false,
        ctrl: false,
        alt: false,
        meta: false,
      };
      
      interactionManager['handleNavigationKeys'](downEvent);
      expect(interactionManager.getCurrentFocus()).toBe('test-2');
      
      // Test up/left arrow
      const upEvent = {
        key: 'up',
        shift: false,
        ctrl: false,
        alt: false,
        meta: false,
      };
      
      interactionManager['handleNavigationKeys'](upEvent);
      expect(interactionManager.getCurrentFocus()).toBe('test-1');
    });

    it('should handle home key to focus first component', () => {
      const component1 = new MockFocusableComponent('test-1', 'test', 0);
      const component2 = new MockFocusableComponent('test-2', 'test', 1);
      const component3 = new MockFocusableComponent('test-3', 'test', 2);
      
      interactionManager.registerComponent(component1);
      interactionManager.registerComponent(component2);
      interactionManager.registerComponent(component3);
      
      // Focus last component first
      interactionManager.setFocus('test-3');
      
      const homeEvent = {
        key: 'home',
        shift: false,
        ctrl: false,
        alt: false,
        meta: false,
      };
      
      interactionManager['handleNavigationKeys'](homeEvent);
      expect(interactionManager.getCurrentFocus()).toBe('test-1');
    });

    it('should handle end key to focus last component', () => {
      const component1 = new MockFocusableComponent('test-1', 'test', 0);
      const component2 = new MockFocusableComponent('test-2', 'test', 1);
      const component3 = new MockFocusableComponent('test-3', 'test', 2);
      
      interactionManager.registerComponent(component1);
      interactionManager.registerComponent(component2);
      interactionManager.registerComponent(component3);
      
      const endEvent = {
        key: 'end',
        shift: false,
        ctrl: false,
        alt: false,
        meta: false,
      };
      
      interactionManager['handleNavigationKeys'](endEvent);
      expect(interactionManager.getCurrentFocus()).toBe('test-3');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle keyboard events with unregistered keys', () => {
      const component = new MockFocusableComponent('test', 'test');
      interactionManager.registerComponent(component);
      
      const unknownKeyEvent = {
        key: 'unknown-key',
        shift: false,
        ctrl: false,
        alt: false,
        meta: false,
      };
      
      expect(() => {
        interactionManager['handleNavigationKeys'](unknownKeyEvent);
      }).not.toThrow();
    });

    it('should handle mouse events with invalid coordinates', () => {
      const mouseEvent = {
        action: 'mousedown' as const,
        x: -100,
        y: -100,
        button: 'left' as const,
        shift: false,
        ctrl: false,
      };
      
      expect(() => {
        interactionManager['handleMouseEvent'](mouseEvent);
      }).not.toThrow();
    });

    it('should handle focus chain when all components are non-focusable', () => {
      const component1 = new MockFocusableComponent('test-1', 'test');
      const component2 = new MockFocusableComponent('test-2', 'test');
      
      component1.setFocusable(false);
      component2.setFocusable(false);
      
      interactionManager.registerComponent(component1);
      interactionManager.registerComponent(component2);
      
      interactionManager.focusNext();
      expect(interactionManager.getCurrentFocus()).toBeUndefined();
      
      interactionManager.focusPrevious();
      expect(interactionManager.getCurrentFocus()).toBeUndefined();
    });

    it('should handle navigation with empty component list', () => {
      // Create new interaction manager with no components
      const emptyInteractionManager = new InteractionManager(mockScreen, {
        keyboardEnabled: true,
        mouseEnabled: false,
        focusRing: { enabled: true, style: {} },
        shortcuts: [],
        search: {
          placeholder: '',
          caseSensitive: false,
          mode: 'fuzzy',
          searchFields: [],
          maxHistory: 5,
          showSuggestions: true,
        },
        statusBar: {
          enabled: true,
          position: 'bottom',
          height: 3,
        },
      });
      
      expect(() => {
        emptyInteractionManager.focusNext();
        emptyInteractionManager.focusPrevious();
        emptyInteractionManager.focusFirst();
        emptyInteractionManager.focusLast();
      }).not.toThrow();
      
      expect(emptyInteractionManager.getCurrentFocus()).toBeUndefined();
      emptyInteractionManager.destroy();
    });

    it('should handle component removal during iteration', () => {
      const component1 = new MockFocusableComponent('test-1', 'test');
      const component2 = new MockFocusableComponent('test-2', 'test');
      
      interactionManager.registerComponent(component1);
      interactionManager.registerComponent(component2);
      
      // Focus first component
      interactionManager.setFocus('test-1');
      
      // Remove it while focused
      interactionManager.unregisterComponent('test-1');
      
      expect(interactionManager.getCurrentFocus()).toBeUndefined();
    });

    it('should handle blur of already blurred component', () => {
      const component = new MockFocusableComponent('test', 'test');
      interactionManager.registerComponent(component);
      
      // Component starts unfocused
      expect(component.getFocusState().focused).toBe(false);
      
      // Try to focus and then blur component (using clearFocus as substitute for blur)
      const focusResult = interactionManager.setFocus('test');
      
      if (focusResult) {
        expect(component.getFocusState().focused).toBe(true);
      }
      
      expect(() => {
        (interactionManager as any).clearFocus();
      }).not.toThrow();
      
      // After clearFocus, component should be blurred
      expect(component.getFocusState().focused).toBe(false);
    });

    it('should handle keyboard shortcuts with modifier combinations', () => {
      const component = new MockFocusableComponent('test', 'test');
      interactionManager.registerComponent(component);
      
      const modifierEvent = {
        key: 'tab',
        shift: true,
        ctrl: true,
        alt: true,
        meta: true,
      };
      
      expect(() => {
        interactionManager['handleNavigationKeys'](modifierEvent);
      }).not.toThrow();
    });

    it('should maintain state when processing invalid focus requests', () => {
      const component = new MockFocusableComponent('test', 'test');
      interactionManager.registerComponent(component);
      
      const initialFocus = interactionManager.getCurrentFocus();
      
      // Try to focus non-existent component
      interactionManager.setFocus('non-existent');
      
      // Focus should remain unchanged
      expect(interactionManager.getCurrentFocus()).toBe(initialFocus);
    });

    it('should handle destroy with active focus', () => {
      const component = new MockFocusableComponent('test', 'test');
      interactionManager.registerComponent(component);
      const focusResult = interactionManager.setFocus('test');
      
      if (focusResult) {
        expect(interactionManager.getCurrentFocus()).toBe('test');
      }
      
      expect(() => {
        interactionManager.destroy();
      }).not.toThrow();
    });

    it('should handle simultaneous focus changes', () => {
      // Create a separate interaction manager for this test to avoid state conflicts
      const separateManager = new InteractionManager(mockScreen, config);
      const component1 = new MockFocusableComponent('test-1', 'test');
      const component2 = new MockFocusableComponent('test-2', 'test');
      
      separateManager.registerComponent(component1);
      separateManager.registerComponent(component2);
      
      // Simulate rapid focus changes - just verify they don't throw errors
      expect(() => {
        separateManager.setFocus('test-1');
        separateManager.setFocus('test-2');
        separateManager.setFocus('test-1');
      }).not.toThrow();
      
      // Clean up
      separateManager.destroy();
    });
  });

  describe('Advanced Mouse Event Handling', () => {
    beforeEach(() => {
      interactionManager = new InteractionManager(mockScreen, config);
    });

    it('should handle mouse wheel up events', () => {
      const scrollHandler = jest.fn();
      interactionManager.on('scroll:event', scrollHandler);
      
      const wheelUpEvent = {
        action: 'wheelup' as const,
        x: 10,
        y: 20,
        button: 'left' as const,
        shift: false,
        ctrl: false,
      };
      
      interactionManager['handleMouseEvent'](wheelUpEvent);
      
      expect(scrollHandler).toHaveBeenCalledWith({
        direction: 'up',
        x: 10,
        y: 20,
      });
    });

    it('should handle mouse wheel down events', () => {
      const scrollHandler = jest.fn();
      interactionManager.on('scroll:event', scrollHandler);
      
      const wheelDownEvent = {
        action: 'wheeldown' as const,
        x: 10,
        y: 20,
        button: 'left' as const,
        shift: false,
        ctrl: false,
      };
      
      interactionManager['handleMouseEvent'](wheelDownEvent);
      
      expect(scrollHandler).toHaveBeenCalledWith({
        direction: 'down',
        x: 10,
        y: 20,
      });
    });

    it('should handle right-click context menu', () => {
      const contextMenuHandler = jest.fn();
      interactionManager.on('contextmenu:requested', contextMenuHandler);
      
      const rightClickEvent = {
        action: 'mousedown' as const,
        x: 15,
        y: 25,
        button: 'right' as const,
        shift: false,
        ctrl: false,
      };
      
      interactionManager['handleMouseEvent'](rightClickEvent);
      
      expect(contextMenuHandler).toHaveBeenCalledWith({
        x: 15,
        y: 25,
        context: 'global',
        componentId: '',
      });
    });

    it('should handle mouse move events for hover', () => {
      const hoverHandler = jest.fn();
      interactionManager.on('component:hover:clear', hoverHandler);
      
      const mouseMoveEvent = {
        action: 'mousemove' as const,
        x: 30,
        y: 40,
        button: 'left' as const,
        shift: false,
        ctrl: false,
      };
      
      interactionManager['handleMouseEvent'](mouseMoveEvent);
      
      // Since no component is at position, it should emit hover clear
      expect(hoverHandler).toHaveBeenCalled();
    });

    it('should handle mouse events when component does not handle them', () => {
      const component = new MockFocusableComponent('test-1', 'test');
      const handleMouseSpy = jest.spyOn(component, 'handleMouse').mockReturnValue(false);
      
      interactionManager.registerComponent(component);
      
      const mouseEvent = {
        action: 'mousedown' as const,
        x: 10,
        y: 20,
        button: 'left' as const,
        shift: false,
        ctrl: false,
      };
      
      interactionManager['handleMouseEvent'](mouseEvent);
      
      expect(handleMouseSpy).toHaveBeenCalledWith(mouseEvent);
    });
  });

  describe('Advanced Keyboard Event Handling', () => {
    beforeEach(() => {
      interactionManager = new InteractionManager(mockScreen, config);
    });

    it('should handle shortcut key combinations', () => {
      const shortcutHandler = jest.fn();
      interactionManager.on('shortcut:activated', shortcutHandler);
      
      const ctrlEvent = {
        key: 'r',
        shift: false,
        ctrl: true,
        alt: false,
        meta: false,
        full: 'ctrl+r',
        ch: 'r',
      };
      
      interactionManager['handleKeyboardEvent'](ctrlEvent);
      
      // Should attempt to find and activate shortcut
    });

    it('should handle modifier key combinations in buildShortcutKey', () => {
      const event = {
        key: 'f',
        shift: true,
        ctrl: true,
        alt: true,
        meta: true,
        full: 'ctrl+alt+shift+meta+f',
        ch: 'f',
      };
      
      const shortcutKey = interactionManager['buildShortcutKey'](event);
      expect(shortcutKey).toBe('c-a-s-m-f');
    });

    it('should handle keyboard events when component handles them', () => {
      const component = new MockFocusableComponent('test-1', 'test');
      const handleKeySpy = jest.spyOn(component, 'handleKeyboard').mockReturnValue(true);
      
      interactionManager.registerComponent(component);
      interactionManager.setFocus('test-1');
      
      const keyEvent = {
        key: 'space',
        shift: false,
        ctrl: false,
        alt: false,
        meta: false,
        full: 'space',
        ch: ' ',
      };
      
      interactionManager['handleKeyboardEvent'](keyEvent);
      
      expect(handleKeySpy).toHaveBeenCalledWith(keyEvent);
    });

    it('should handle keyboard events when component does not handle them', () => {
      const component = new MockFocusableComponent('test-1', 'test');
      const handleKeySpy = jest.spyOn(component, 'handleKeyboard').mockReturnValue(false);
      
      interactionManager.registerComponent(component);
      interactionManager.setFocus('test-1');
      
      const keyEvent = {
        key: 'x',
        shift: false,
        ctrl: false,
        alt: false,
        meta: false,
        full: 'x',
        ch: 'x',
      };
      
      interactionManager['handleKeyboardEvent'](keyEvent);
      
      expect(handleKeySpy).toHaveBeenCalledWith(keyEvent);
    });

    it('should handle arrow keys navigation with no current focus', () => {
      const component = new MockFocusableComponent('test-1', 'test');
      interactionManager.registerComponent(component);
      interactionManager.clearFocus();
      
      interactionManager['handleArrowKeys']('down');
      
      expect(interactionManager.getCurrentFocus()).toBe('test-1');
    });

    it('should handle escape key when component does not handle it', () => {
      const component = new MockFocusableComponent('test-1', 'test');
      const handleKeySpy = jest.spyOn(component, 'handleKeyboard').mockReturnValue(false);
      
      interactionManager.registerComponent(component);
      interactionManager.setFocus('test-1');
      
      interactionManager['handleEscape']();
      
      expect(handleKeySpy).toHaveBeenCalledWith(expect.objectContaining({
        key: 'escape',
      }));
      expect(interactionManager.getCurrentFocus()).toBeUndefined();
    });

    it('should handle enter key with focused component', () => {
      const component = new MockFocusableComponent('test-1', 'test');
      const handleKeySpy = jest.spyOn(component, 'handleKeyboard').mockReturnValue(true);
      
      interactionManager.registerComponent(component);
      interactionManager.setFocus('test-1');
      
      interactionManager['handleEnter']();
      
      expect(handleKeySpy).toHaveBeenCalledWith(expect.objectContaining({
        key: 'enter',
      }));
    });
  });

  describe('Configuration Edge Cases', () => {
    it('should handle configuration without mouse support', () => {
      const configWithoutMouse = {
        ...config,
        mouseEnabled: false,
      };
      
      const mockScreenWithoutMouse = {
        ...mockScreen,
        program: null,
      };
      
      expect(() => {
        interactionManager = new InteractionManager(mockScreenWithoutMouse, configWithoutMouse);
      }).not.toThrow();
    });

    it('should handle configuration without keyboard support', () => {
      const configWithoutKeyboard = {
        ...config,
        keyboardEnabled: false,
      };
      
      expect(() => {
        interactionManager = new InteractionManager(mockScreen, configWithoutKeyboard);
      }).not.toThrow();
    });

    it('should handle missing program in screen', () => {
      const mockScreenWithoutProgram = {
        ...mockScreen,
        program: null,
      };
      
      expect(() => {
        interactionManager = new InteractionManager(mockScreenWithoutProgram, config);
      }).not.toThrow();
    });
  });

  describe('Shortcut Dispatch Coverage', () => {
    let interactionManager: any;
    let mockScreen: any;
    let mockComponent: any;

    beforeEach(() => {
      mockScreen = {
        key: jest.fn(),
        on: jest.fn(),
        program: { key: jest.fn(), on: jest.fn() },
      };
      mockComponent = {
        getId: () => 'comp1',
        getType: () => 'panel',
        canFocus: () => true,
        getFocusState: () => ({ focused: false, tabIndex: 0 }),
        handleKey: () => false,
        handleMouse: () => false,
        focus: jest.fn(),
        blur: jest.fn(),
      };
    });

    it('should emit refresh-all action', () => {
      interactionManager = new InteractionManager(mockScreen, { keyboard: true, mouse: false, shortcuts: [] });
      const emitSpy = jest.spyOn(interactionManager, 'emit');
      interactionManager.registerComponent(mockComponent);
      // Access private method to test shortcut dispatch
      interactionManager.registerShortcut({
        key: 'r',
        action: 'refresh-all',
        description: 'Refresh all',
      });
      // Trigger key handler
      interactionManager.handleKeyboardEvent({ key: 'r', shift: false, ctrl: false, alt: false, meta: false, full: '', ch: '' });
      expect(emitSpy).toHaveBeenCalledWith('action:refresh-all');
    });

    it('should emit refresh-current action', () => {
      interactionManager = new InteractionManager(mockScreen, { keyboard: true, mouse: false, shortcuts: [] });
      const emitSpy = jest.spyOn(interactionManager, 'emit');
      interactionManager.registerComponent(mockComponent);
      interactionManager.registerShortcut({
        key: 'R',
        action: 'refresh-current',
        description: 'Refresh current',
      });
      interactionManager.handleKeyboardEvent({ key: 'R', shift: false, ctrl: false, alt: false, meta: false, full: '', ch: '' });
      expect(emitSpy).toHaveBeenCalledWith('action:refresh-current');
    });

    it('should emit help action', () => {
      interactionManager = new InteractionManager(mockScreen, { keyboard: true, mouse: false, shortcuts: [] });
      const emitSpy = jest.spyOn(interactionManager, 'emit');
      interactionManager.registerComponent(mockComponent);
      interactionManager.registerShortcut({ key: '?', action: 'help', description: 'Help' });
      interactionManager.handleKeyboardEvent({ key: '?', shift: false, ctrl: false, alt: false, meta: false, full: '', ch: '' });
      expect(emitSpy).toHaveBeenCalledWith('action:help');
    });

    it('should emit exit action', () => {
      interactionManager = new InteractionManager(mockScreen, { keyboard: true, mouse: false, shortcuts: [] });
      const emitSpy = jest.spyOn(interactionManager, 'emit');
      interactionManager.registerComponent(mockComponent);
      interactionManager.registerShortcut({ key: 'q', action: 'exit', description: 'Exit' });
      interactionManager.handleKeyboardEvent({ key: 'q', shift: false, ctrl: false, alt: false, meta: false, full: '', ch: '' });
      expect(emitSpy).toHaveBeenCalledWith('action:exit');
    });

    it('should emit cancel action', () => {
      interactionManager = new InteractionManager(mockScreen, { keyboard: true, mouse: false, shortcuts: [] });
      const emitSpy = jest.spyOn(interactionManager, 'emit');
      interactionManager.registerComponent(mockComponent);
      interactionManager.registerShortcut({ key: 'escape', action: 'cancel', description: 'Cancel' });
      interactionManager.handleKeyboardEvent({ key: 'escape', shift: false, ctrl: false, alt: false, meta: false, full: '', ch: '' });
      expect(emitSpy).toHaveBeenCalledWith('action:cancel');
    });

    it('should emit fullscreen action', () => {
      interactionManager = new InteractionManager(mockScreen, { keyboard: true, mouse: false, shortcuts: [] });
      const emitSpy = jest.spyOn(interactionManager, 'emit');
      interactionManager.registerComponent(mockComponent);
      interactionManager.registerShortcut({ key: 'f', action: 'fullscreen', description: 'Fullscreen' });
      interactionManager.handleKeyboardEvent({ key: 'f', shift: false, ctrl: false, alt: false, meta: false, full: '', ch: '' });
      expect(emitSpy).toHaveBeenCalledWith('action:fullscreen');
    });

    it('should emit clear-screen action', () => {
      interactionManager = new InteractionManager(mockScreen, { keyboard: true, mouse: false, shortcuts: [] });
      const emitSpy = jest.spyOn(interactionManager, 'emit');
      interactionManager.registerComponent(mockComponent);
      interactionManager.registerShortcut({ key: 'l', action: 'clear-screen', description: 'Clear' });
      interactionManager.handleKeyboardEvent({ key: 'l', shift: false, ctrl: false, alt: false, meta: false, full: '', ch: '' });
      expect(emitSpy).toHaveBeenCalledWith('action:clear-screen');
    });

    it('should emit search action', () => {
      interactionManager = new InteractionManager(mockScreen, { keyboard: true, mouse: false, shortcuts: [] });
      const emitSpy = jest.spyOn(interactionManager, 'emit');
      interactionManager.registerComponent(mockComponent);
      interactionManager.registerShortcut({ key: '/', action: 'search', description: 'Search' });
      interactionManager.handleKeyboardEvent({ key: '/', shift: false, ctrl: false, alt: false, meta: false, full: '', ch: '' });
      expect(emitSpy).toHaveBeenCalledWith('action:search');
    });

    it('should emit layout action for layout: prefix', () => {
      interactionManager = new InteractionManager(mockScreen, { keyboard: true, mouse: false, shortcuts: [] });
      const emitSpy = jest.spyOn(interactionManager, 'emit');
      interactionManager.registerComponent(mockComponent);
      interactionManager.registerShortcut({ key: '1', action: 'layout:1', description: 'Layout 1' });
      interactionManager.handleKeyboardEvent({ key: '1', shift: false, ctrl: false, alt: false, meta: false, full: '', ch: '' });
      expect(emitSpy).toHaveBeenCalledWith('action:layout', { layout: '1' });
    });

    it('should emit panel action for panel: prefix', () => {
      interactionManager = new InteractionManager(mockScreen, { keyboard: true, mouse: false, shortcuts: [] });
      const emitSpy = jest.spyOn(interactionManager, 'emit');
      interactionManager.registerComponent(mockComponent);
      interactionManager.registerShortcut({ key: 'p', action: 'panel:3', description: 'Panel 3' });
      interactionManager.handleKeyboardEvent({ key: 'p', shift: false, ctrl: false, alt: false, meta: false, full: '', ch: '' });
      expect(emitSpy).toHaveBeenCalledWith('action:panel', { panel: '3' });
    });

    it('should emit custom action for unknown prefix', () => {
      interactionManager = new InteractionManager(mockScreen, { keyboard: true, mouse: false, shortcuts: [] });
      const emitSpy = jest.spyOn(interactionManager, 'emit');
      interactionManager.registerComponent(mockComponent);
      interactionManager.registerShortcut({ key: 'x', action: 'custom:action', description: 'Custom' });
      interactionManager.handleKeyboardEvent({ key: 'x', shift: false, ctrl: false, alt: false, meta: false, full: '', ch: '' });
      expect(emitSpy).toHaveBeenCalledWith('action:custom', expect.objectContaining({ action: 'custom:action' }));
    });

    it('should return all shortcuts via getAllShortcuts', () => {
      interactionManager = new InteractionManager(mockScreen, { keyboard: true, mouse: false, shortcuts: [] });
      interactionManager.registerComponent(mockComponent);
      interactionManager.registerShortcut({ key: 'q', action: 'exit', description: 'Exit' });
      const shortcuts = interactionManager.getAllShortcuts();
      expect(shortcuts.length).toBeGreaterThan(0);
      expect(shortcuts.some(s => s.action === 'exit')).toBe(true);
    });

    it('should return current focus via getCurrentFocus', () => {
      interactionManager = new InteractionManager(mockScreen, { keyboard: true, mouse: false, shortcuts: [] });
      interactionManager.registerComponent(mockComponent);
      interactionManager.setFocus('comp1');
      expect(interactionManager.getCurrentFocus()).toBe('comp1');
    });

    it('should return components via getComponents', () => {
      interactionManager = new InteractionManager(mockScreen, { keyboard: true, mouse: false, shortcuts: [] });
      interactionManager.registerComponent(mockComponent);
      expect(interactionManager.getComponents()).toHaveLength(1);
    });

    it('should return shortcuts via getShortcuts', () => {
      interactionManager = new InteractionManager(mockScreen, { keyboard: true, mouse: false, shortcuts: [] });
      interactionManager.registerShortcut({ key: 'q', action: 'exit', description: 'Exit' });
      const shortcuts = interactionManager.getShortcuts();
      expect(shortcuts.length).toBeGreaterThan(0);
      expect(shortcuts.some(s => s.action === 'exit')).toBe(true);
    });

    it('should return component by id via getComponent', () => {
      interactionManager = new InteractionManager(mockScreen, { keyboard: true, mouse: false, shortcuts: [] });
      interactionManager.registerComponent(mockComponent);
      expect(interactionManager.getComponent('comp1')).toBeDefined();
      expect(interactionManager.getComponent('nonexistent')).toBeUndefined();
    });

    it('should return destroyed state via isInteractionManagerDestroyed', () => {
      interactionManager = new InteractionManager(mockScreen, { keyboard: true, mouse: false, shortcuts: [] });
      expect(interactionManager.isInteractionManagerDestroyed()).toBe(false);
      interactionManager.destroy();
      expect(interactionManager.isInteractionManagerDestroyed()).toBe(true);
    });
  });
});