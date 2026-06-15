/**
 * @fileoverview Unit tests for KeyboardHandler utility
 * @author Development Team
 * @since 1.0.0
 */

import { KeyboardHandler } from './keyboard-handler';
import { KeyboardEvent, ShortcutConfig } from '../types/interaction';

describe('KeyboardHandler', () => {
  let keyboardHandler: KeyboardHandler;

  beforeEach(() => {
    keyboardHandler = new KeyboardHandler();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('normalizeKeyEvent', () => {
    it('should normalize basic key event', () => {
      const rawKey = {
        name: 'enter',
        shift: false,
        ctrl: false,
        meta: false,
        alt: false,
      };

      const result = KeyboardHandler.normalizeKeyEvent(rawKey, '\r');

      expect(result.key).toBe('enter');
      expect(result.shift).toBe(false);
      expect(result.ctrl).toBe(false);
      expect(result.alt).toBe(false);
      expect(result.meta).toBe(false);
      expect(result.ch).toBe('\r');
    });

    it('should handle key event with modifiers', () => {
      const rawKey = {
        name: 'c',
        shift: true,
        ctrl: true,
        meta: true,
        alt: true,
      };

      const result = KeyboardHandler.normalizeKeyEvent(rawKey, 'C');

      expect(result.key).toBe('c');
      expect(result.shift).toBe(true);
      expect(result.ctrl).toBe(true);
      expect(result.alt).toBe(true);
      expect(result.meta).toBe(true);
      expect(result.ch).toBe('C');
    });

    it('should handle null/undefined key events', () => {
      const result = KeyboardHandler.normalizeKeyEvent(null);

      expect(result.key).toBe('');
      expect(result.shift).toBe(false);
      expect(result.ctrl).toBe(false);
      expect(result.alt).toBe(false);
      expect(result.meta).toBe(false);
      expect(result.ch).toBe('');
    });

    it('should handle key event without name property', () => {
      const rawKey = {
        key: 'space',
        shift: false,
        ctrl: false,
      };

      const result = KeyboardHandler.normalizeKeyEvent(rawKey);

      expect(result.key).toBe('space');
    });

    it('should handle key event with full property', () => {
      const rawKey = {
        name: 'a',
        full: 'ctrl+a',
        shift: false,
        ctrl: true,
      };

      const result = KeyboardHandler.normalizeKeyEvent(rawKey, 'a');

      expect(result.key).toBe('a');
      expect(result.full).toBe('ctrl+a');
      expect(result.ctrl).toBe(true);
    });
  });

  describe('buildShortcutKey', () => {
    it('should build shortcut key with modifiers', () => {
      const event: KeyboardEvent = {
        key: 'c',
        shift: false,
        ctrl: true,
        alt: false,
        meta: false,
        ch: 'c',
      };

      const result = KeyboardHandler.buildShortcutKey(event);

      expect(result).toBe('ctrl+c');
    });

    it('should build shortcut key with multiple modifiers', () => {
      const event: KeyboardEvent = {
        key: 'z',
        shift: true,
        ctrl: true,
        alt: false,
        meta: false,
        ch: 'Z',
      };

      const result = KeyboardHandler.buildShortcutKey(event);

      expect(result).toBe('ctrl+shift+z');
    });

    it('should handle key without modifiers', () => {
      const event: KeyboardEvent = {
        key: 'enter',
        shift: false,
        ctrl: false,
        alt: false,
        meta: false,
        ch: '\r',
      };

      const result = KeyboardHandler.buildShortcutKey(event);

      expect(result).toBe('enter');
    });

    it('should handle all modifiers', () => {
      const event: KeyboardEvent = {
        key: 'f1',
        shift: true,
        ctrl: true,
        alt: true,
        meta: true,
        ch: '',
      };

      const result = KeyboardHandler.buildShortcutKey(event);

      expect(result).toBe('ctrl+alt+shift+meta+f1');
    });
  });

  describe('matchesShortcut', () => {
    it('should match shortcut correctly', () => {
      const event: KeyboardEvent = {
        key: 'enter',
        shift: false,
        ctrl: false,
        alt: false,
        meta: false,
        ch: '\r',
      };

      const result = KeyboardHandler.matchesShortcut(event, 'enter');

      expect(result).toBe(true);
    });

    it('should not match incorrect shortcut', () => {
      const event: KeyboardEvent = {
        key: 's',
        shift: false,
        ctrl: false,
        alt: false,
        meta: false,
        ch: 's',
      };

      const result = KeyboardHandler.matchesShortcut(event, 'ctrl+s');

      expect(result).toBe(false);
    });
  });

  describe('registerShortcut', () => {
    it('should register basic shortcut', () => {
      const config: ShortcutConfig = {
        key: 'ctrl+s',
        description: 'Save file',
        action: 'save',
        global: true,
      };

      expect(() => keyboardHandler.registerShortcut(config)).not.toThrow();
    });

    it('should register key sequence', () => {
      expect(() => {
        keyboardHandler.registerKeySequence(['g', 'g'], 'go-to-top');
      }).not.toThrow();
    });
  });

  describe('findMatchingShortcut', () => {
    it('should find matching shortcut', () => {
      const config: ShortcutConfig = {
        key: 'ctrl+c',
        description: 'Copy',
        action: 'copy',
        global: true,
      };

      keyboardHandler.registerShortcut(config);

      const event: KeyboardEvent = {
        key: 'c',
        shift: false,
        ctrl: true,
        alt: false,
        meta: false,
        ch: 'c',
      };

      const result = keyboardHandler.findMatchingShortcut(event);

      expect(result).toBeDefined();
      expect(result?.action).toBe('copy');
    });

    it('should return undefined for unmatched shortcut', () => {
      const event: KeyboardEvent = {
        key: 'x',
        shift: false,
        ctrl: true,
        alt: false,
        meta: false,
        ch: 'x',
      };

      const result = keyboardHandler.findMatchingShortcut(event);

      expect(result).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty key event', () => {
      const event: KeyboardEvent = {
        key: '',
        shift: false,
        ctrl: false,
        alt: false,
        meta: false,
        ch: '',
      };

      const result = keyboardHandler.findMatchingShortcut(event);

      expect(result).toBeUndefined();
    });

    it('should handle malformed shortcut config', () => {
      const config = {
        key: '',
        description: '',
        action: '',
        global: true,
      } as ShortcutConfig;

      expect(() => keyboardHandler.registerShortcut(config)).not.toThrow();
    });

    it('should handle unregister shortcut', () => {
      const config: ShortcutConfig = {
        key: 'ctrl+t',
        description: 'Test',
        action: 'test',
        global: true,
      };

      keyboardHandler.registerShortcut(config);
      
      expect(() => keyboardHandler.unregisterShortcut('ctrl+t')).not.toThrow();
    });

    it('should handle unregister non-existent shortcut', () => {
      expect(() => keyboardHandler.unregisterShortcut('ctrl+nonexistent')).not.toThrow();
    });

    it('should handle sequence timeout', () => {
      keyboardHandler.registerKeySequence(['g', 'g'], 'go-to-top');

      // Start sequence
      const firstEvent: KeyboardEvent = {
        key: 'g',
        shift: false,
        ctrl: false,
        alt: false,
        meta: false,
        ch: 'g',
      };

      keyboardHandler.findMatchingShortcut(firstEvent);

      // Advance timer to trigger timeout
      jest.advanceTimersByTime(1001);

      // Try to complete sequence after timeout
      const secondEvent: KeyboardEvent = {
        key: 'g',
        shift: false,
        ctrl: false,
        alt: false,
        meta: false,
        ch: 'g',
      };

      const result = keyboardHandler.findMatchingShortcut(secondEvent);
      
      // Should not complete the sequence due to timeout
      expect(result).toBeUndefined();
    });

    it('should handle parseShortcutKey', () => {
      const result = KeyboardHandler.parseShortcutKey('ctrl+alt+s');

      expect(result.key).toBe('s');
      expect(result.ctrl).toBe(true);
      expect(result.alt).toBe(true);
      expect(result.shift).toBe(true); // 's' is treated as both shift and key
      expect(result.meta).toBe(false);
    });

    it('should handle parseShortcutKey with abbreviations', () => {
      const result = KeyboardHandler.parseShortcutKey('c+a+s+m+x');

      expect(result.key).toBe('x');
      expect(result.ctrl).toBe(true);
      expect(result.alt).toBe(true);
      expect(result.shift).toBe(true);
      expect(result.meta).toBe(true);
    });

    it('should handle parseShortcutKey with no modifiers', () => {
      const result = KeyboardHandler.parseShortcutKey('enter');

      expect(result.key).toBe('enter');
      expect(result.ctrl).toBe(false);
      expect(result.alt).toBe(false);
      expect(result.shift).toBe(false);
      expect(result.meta).toBe(false);
    });
  });

  describe('static helper methods', () => {
    describe('isNavigationKey', () => {
      it('should identify navigation keys', () => {
        expect(KeyboardHandler.isNavigationKey('up')).toBe(true);
        expect(KeyboardHandler.isNavigationKey('DOWN')).toBe(true);
        expect(KeyboardHandler.isNavigationKey('left')).toBe(true);
        expect(KeyboardHandler.isNavigationKey('right')).toBe(true);
        expect(KeyboardHandler.isNavigationKey('home')).toBe(true);
        expect(KeyboardHandler.isNavigationKey('end')).toBe(true);
        expect(KeyboardHandler.isNavigationKey('pageup')).toBe(true);
        expect(KeyboardHandler.isNavigationKey('pagedown')).toBe(true);
        expect(KeyboardHandler.isNavigationKey('tab')).toBe(true);
        expect(KeyboardHandler.isNavigationKey('enter')).toBe(true);
        expect(KeyboardHandler.isNavigationKey('escape')).toBe(true);
        expect(KeyboardHandler.isNavigationKey('space')).toBe(true);
      });

      it('should not identify non-navigation keys', () => {
        expect(KeyboardHandler.isNavigationKey('a')).toBe(false);
        expect(KeyboardHandler.isNavigationKey('1')).toBe(false);
        expect(KeyboardHandler.isNavigationKey('f1')).toBe(false);
        expect(KeyboardHandler.isNavigationKey('ctrl')).toBe(false);
      });
    });

    describe('isFunctionKey', () => {
      it('should identify function keys', () => {
        expect(KeyboardHandler.isFunctionKey('f1')).toBe(true);
        expect(KeyboardHandler.isFunctionKey('F12')).toBe(true);
        expect(KeyboardHandler.isFunctionKey('f24')).toBe(true);
      });

      it('should not identify non-function keys', () => {
        expect(KeyboardHandler.isFunctionKey('a')).toBe(false);
        expect(KeyboardHandler.isFunctionKey('enter')).toBe(false);
        expect(KeyboardHandler.isFunctionKey('f')).toBe(false);
        expect(KeyboardHandler.isFunctionKey('1f')).toBe(false);
      });
    });

    describe('isPrintableKey', () => {
      it('should identify printable keys', () => {
        const event: KeyboardEvent = {
          key: 'a',
          shift: false,
          ctrl: false,
          alt: false,
          meta: false,
          ch: 'a',
        };
        expect(KeyboardHandler.isPrintableKey(event)).toBe(true);
      });

      it('should not identify function keys as printable', () => {
        const event: KeyboardEvent = {
          key: 'f1',
          shift: false,
          ctrl: false,
          alt: false,
          meta: false,
        };
        expect(KeyboardHandler.isPrintableKey(event)).toBe(false);
      });

      it('should not identify navigation keys as printable', () => {
        const event: KeyboardEvent = {
          key: 'enter',
          shift: false,
          ctrl: false,
          alt: false,
          meta: false,
        };
        expect(KeyboardHandler.isPrintableKey(event)).toBe(false);
      });

      it('should not identify modified keys as printable', () => {
        const event1: KeyboardEvent = {
          key: 'a',
          shift: false,
          ctrl: true,
          alt: false,
          meta: false,
          ch: 'a',
        };
        expect(KeyboardHandler.isPrintableKey(event1)).toBe(false);

        const event2: KeyboardEvent = {
          key: 'a',
          shift: false,
          ctrl: false,
          alt: true,
          meta: false,
          ch: 'a',
        };
        expect(KeyboardHandler.isPrintableKey(event2)).toBe(false);

        const event3: KeyboardEvent = {
          key: 'a',
          shift: false,
          ctrl: false,
          alt: false,
          meta: true,
          ch: 'a',
        };
        expect(KeyboardHandler.isPrintableKey(event3)).toBe(false);
      });
    });

    describe('getKeyDescription', () => {
      it('should format key descriptions with modifiers', () => {
        const event: KeyboardEvent = {
          key: 'c',
          shift: true,
          ctrl: true,
          alt: true,
          meta: true,
          ch: 'c',
        };
        expect(KeyboardHandler.getKeyDescription(event)).toBe('Ctrl+Alt+Shift+Meta+C');
      });

      it('should format special key descriptions', () => {
        const escapeEvent: KeyboardEvent = {
          key: 'Escape',
          shift: false,
          ctrl: false,
          alt: false,
          meta: false,
        };
        expect(KeyboardHandler.getKeyDescription(escapeEvent)).toBe('Esc');

        const enterEvent: KeyboardEvent = {
          key: 'Enter',
          shift: false,
          ctrl: false,
          alt: false,
          meta: false,
        };
        expect(KeyboardHandler.getKeyDescription(enterEvent)).toBe('↵');

        const tabEvent: KeyboardEvent = {
          key: 'Tab',
          shift: false,
          ctrl: false,
          alt: false,
          meta: false,
        };
        expect(KeyboardHandler.getKeyDescription(tabEvent)).toBe('⇥');

        const spaceEvent: KeyboardEvent = {
          key: 'Space',
          shift: false,
          ctrl: false,
          alt: false,
          meta: false,
        };
        expect(KeyboardHandler.getKeyDescription(spaceEvent)).toBe('␣');

        const upEvent: KeyboardEvent = {
          key: 'Up',
          shift: false,
          ctrl: false,
          alt: false,
          meta: false,
        };
        expect(KeyboardHandler.getKeyDescription(upEvent)).toBe('↑');

        const pgUpEvent: KeyboardEvent = {
          key: 'Pageup',
          shift: false,
          ctrl: false,
          alt: false,
          meta: false,
        };
        expect(KeyboardHandler.getKeyDescription(pgUpEvent)).toBe('PgUp');
      });

      it('should handle unmapped key names', () => {
        const event: KeyboardEvent = {
          key: 'customkey',
          shift: false,
          ctrl: false,
          alt: false,
          meta: false,
        };
        expect(KeyboardHandler.getKeyDescription(event)).toBe('Customkey');
      });
    });
  });

  describe('instance methods', () => {
    describe('getShortcuts', () => {
      it('should return all registered shortcuts', () => {
        const config1: ShortcutConfig = {
          key: 'ctrl+c',
          description: 'Copy',
          action: 'copy',
          global: true,
        };
        const config2: ShortcutConfig = {
          key: 'ctrl+v',
          description: 'Paste',
          action: 'paste',
          global: true,
        };

        keyboardHandler.registerShortcut(config1);
        keyboardHandler.registerShortcut(config2);

        const shortcuts = keyboardHandler.getShortcuts();
        expect(shortcuts).toHaveLength(2);
        expect(shortcuts.some(s => s.action === 'copy')).toBe(true);
        expect(shortcuts.some(s => s.action === 'paste')).toBe(true);
      });
    });

    describe('getShortcutsByContext', () => {
      it('should return shortcuts for specific context', () => {
        const config1: ShortcutConfig = {
          key: 'ctrl+c',
          description: 'Copy',
          action: 'copy',
          context: 'editor',
          global: false,
        };
        const config2: ShortcutConfig = {
          key: 'ctrl+v',
          description: 'Paste',
          action: 'paste',
          global: true,
        };
        const config3: ShortcutConfig = {
          key: 'ctrl+z',
          description: 'Undo',
          action: 'undo',
          context: 'viewer',
          global: false,
        };

        keyboardHandler.registerShortcut(config1);
        keyboardHandler.registerShortcut(config2);
        keyboardHandler.registerShortcut(config3);

        const editorShortcuts = keyboardHandler.getShortcutsByContext('editor');
        expect(editorShortcuts).toHaveLength(2); // editor-specific + global
        expect(editorShortcuts.some(s => s.action === 'copy')).toBe(true);
        expect(editorShortcuts.some(s => s.action === 'paste')).toBe(true);

        const viewerShortcuts = keyboardHandler.getShortcutsByContext('viewer');
        expect(viewerShortcuts).toHaveLength(2); // viewer-specific + global
        expect(viewerShortcuts.some(s => s.action === 'undo')).toBe(true);
        expect(viewerShortcuts.some(s => s.action === 'paste')).toBe(true);
      });
    });

    describe('clear', () => {
      it('should clear all shortcuts and sequences', () => {
        // Register some shortcuts and sequences
        const config: ShortcutConfig = {
          key: 'ctrl+c',
          description: 'Copy',
          action: 'copy',
          global: true,
        };
        keyboardHandler.registerShortcut(config);
        keyboardHandler.registerKeySequence(['g', 'g'], 'go-to-top');

        // Start a sequence
        keyboardHandler['currentSequence'] = ['g'];
        keyboardHandler['sequenceTimeout'] = setTimeout(() => {}, 1000);

        expect(keyboardHandler.getShortcuts()).toHaveLength(2); // shortcut + sequence
        expect(keyboardHandler['keySequences'].size).toBe(1);

        keyboardHandler.clear();

        expect(keyboardHandler.getShortcuts()).toHaveLength(0);
        expect(keyboardHandler['keySequences'].size).toBe(0);
        expect(keyboardHandler['currentSequence']).toHaveLength(0);
        expect(keyboardHandler['sequenceTimeout']).toBeUndefined();
      });
    });

    describe('destroy', () => {
      it('should destroy the keyboard handler', () => {
        const config: ShortcutConfig = {
          key: 'ctrl+c',
          description: 'Copy',
          action: 'copy',
          global: true,
        };
        keyboardHandler.registerShortcut(config);

        expect(keyboardHandler.getShortcuts()).toHaveLength(1);

        keyboardHandler.destroy();

        expect(keyboardHandler.getShortcuts()).toHaveLength(0);
      });
    });
  });

  describe('key sequence handling', () => {
    beforeEach(() => {
      keyboardHandler.registerKeySequence(['g', 'g'], 'go-to-top');
      keyboardHandler.registerKeySequence(['g', 'h'], 'go-to-home');
    });

    it('should handle complete sequence match', () => {
      // First key in sequence
      const firstEvent: KeyboardEvent = {
        key: 'g',
        shift: false,
        ctrl: false,
        alt: false,
        meta: false,
        ch: 'g',
      };
      let result = keyboardHandler.findMatchingShortcut(firstEvent);
      expect(result).toBeUndefined(); // Partial match

      // Second key completes sequence
      const secondEvent: KeyboardEvent = {
        key: 'g',
        shift: false,
        ctrl: false,
        alt: false,
        meta: false,
        ch: 'g',
      };
      result = keyboardHandler.findMatchingShortcut(secondEvent);
      expect(result).toBeDefined();
      expect(result?.action).toBe('go-to-top');
      expect(keyboardHandler['currentSequence']).toHaveLength(0); // Reset after match
    });

    it('should reset sequence on no match', () => {
      // Start sequence
      const firstEvent: KeyboardEvent = {
        key: 'g',
        shift: false,
        ctrl: false,
        alt: false,
        meta: false,
        ch: 'g',
      };
      keyboardHandler.findMatchingShortcut(firstEvent);
      expect(keyboardHandler['currentSequence']).toHaveLength(1);

      // Invalid second key
      const invalidEvent: KeyboardEvent = {
        key: 'x',
        shift: false,
        ctrl: false,
        alt: false,
        meta: false,
        ch: 'x',
      };
      const result = keyboardHandler.findMatchingShortcut(invalidEvent);
      expect(result).toBeUndefined();
      expect(keyboardHandler['currentSequence']).toHaveLength(0); // Reset
    });

    it('should handle partial sequence with timeout reset', () => {
      // Start sequence
      const firstEvent: KeyboardEvent = {
        key: 'g',
        shift: false,
        ctrl: false,
        alt: false,
        meta: false,
        ch: 'g',
      };
      keyboardHandler.findMatchingShortcut(firstEvent);
      expect(keyboardHandler['currentSequence']).toHaveLength(1);
      expect(keyboardHandler['sequenceTimeout']).toBeDefined();

      // Advance timers to trigger timeout
      jest.advanceTimersByTime(2000);
      expect(keyboardHandler['currentSequence']).toHaveLength(0); // Reset by timeout
    });
  });
});