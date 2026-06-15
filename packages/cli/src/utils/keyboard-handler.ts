/**
 * @fileoverview Keyboard handling utilities for terminal interactions
 * @author Development Team
 * @since 1.0.0
 */

import { KeyboardEvent, ShortcutConfig } from '../types/interaction';

/**
 * Utility class for keyboard event processing and shortcut management
 */
export class KeyboardHandler {
  private shortcuts: Map<string, ShortcutConfig> = new Map();
  private keySequences: Map<string, string[]> = new Map();
  private currentSequence: string[] = [];
  private sequenceTimeout?: NodeJS.Timeout | undefined;
  private readonly SEQUENCE_TIMEOUT_MS = 1000;

  /**
   * Normalize key event to standard format
   */
  public static normalizeKeyEvent(rawKey: any, rawCh?: any): KeyboardEvent {
    if (!rawKey) {
      return {
        key: '',
        shift: false,
        ctrl: false,
        alt: false,
        meta: false,
        ch: rawCh || '',
      };
    }

    return {
      key: rawKey.name || rawKey.key || '',
      shift: !!rawKey.shift,
      ctrl: !!rawKey.ctrl,
      alt: !!rawKey.meta || !!rawKey.alt,
      meta: !!rawKey.meta,
      full: rawKey.full || '',
      ch: rawCh || rawKey.ch || '',
    };
  }

  /**
   * Build a shortcut key string from keyboard event
   */
  public static buildShortcutKey(event: KeyboardEvent): string {
    const parts: string[] = [];
    
    // Add modifiers in consistent order
    if (event.ctrl) parts.push('ctrl');
    if (event.alt) parts.push('alt');
    if (event.shift) parts.push('shift');
    if (event.meta) parts.push('meta');
    
    // Add the main key
    if (event.key) {
      parts.push(event.key.toLowerCase());
    }
    
    return parts.join('+');
  }

  /**
   * Parse shortcut string into components
   */
  public static parseShortcutKey(shortcut: string): {
    ctrl: boolean;
    alt: boolean;
    shift: boolean;
    meta: boolean;
    key: string;
  } {
    const parts = shortcut.toLowerCase().split('+');
    const key = parts[parts.length - 1] || '';
    
    return {
      ctrl: parts.includes('ctrl') || parts.includes('c'),
      alt: parts.includes('alt') || parts.includes('a'),
      shift: parts.includes('shift') || parts.includes('s'),
      meta: parts.includes('meta') || parts.includes('m'),
      key,
    };
  }

  /**
   * Check if keyboard event matches shortcut
   */
  public static matchesShortcut(event: KeyboardEvent, shortcut: string): boolean {
    const expected = KeyboardHandler.parseShortcutKey(shortcut);
    const actual = KeyboardHandler.buildShortcutKey(event);
    const expectedKey = KeyboardHandler.buildShortcutKey({
      key: expected.key,
      ctrl: expected.ctrl,
      alt: expected.alt,
      shift: expected.shift,
      meta: expected.meta,
    });
    
    return actual === expectedKey;
  }

  /**
   * Register a shortcut key combination
   */
  public registerShortcut(config: ShortcutConfig): void {
    const key = config.key.toLowerCase();
    this.shortcuts.set(key, config);
  }

  /**
   * Unregister a shortcut
   */
  public unregisterShortcut(key: string): void {
    this.shortcuts.delete(key.toLowerCase());
  }

  /**
   * Find matching shortcut for keyboard event
   */
  public findMatchingShortcut(event: KeyboardEvent): ShortcutConfig | undefined {
    // Check direct matches first
    for (const [key, config] of this.shortcuts) {
      if (KeyboardHandler.matchesShortcut(event, key)) {
        return config;
      }
    }

    // Check sequence matches
    return this.checkSequenceMatch(event);
  }

  /**
   * Register a key sequence (e.g., 'g g' for vim-like navigation)
   */
  public registerKeySequence(sequence: string[], action: string): void {
    const key = sequence.join(' ');
    this.keySequences.set(key, sequence);
    
    // Also register as shortcut
    this.registerShortcut({
      key,
      description: `Key sequence: ${sequence.join(' ')}`,
      action,
      global: true,
    });
  }

  /**
   * Check if current event continues or completes a sequence
   */
  private checkSequenceMatch(event: KeyboardEvent): ShortcutConfig | undefined {
    const eventKey = event.key.toLowerCase();
    
    // Add current key to sequence
    this.currentSequence.push(eventKey);
    
    // Reset sequence timeout
    if (this.sequenceTimeout) {
      clearTimeout(this.sequenceTimeout);
    }
    
    this.sequenceTimeout = setTimeout(() => {
      this.currentSequence = [];
    }, this.SEQUENCE_TIMEOUT_MS);

    // Check if current sequence matches any registered sequences
    const currentSequenceKey = this.currentSequence.join(' ');
    
    for (const [sequenceKey, _sequence] of this.keySequences) {
      if (sequenceKey === currentSequenceKey) {
        // Complete match found
        this.currentSequence = [];
        if (this.sequenceTimeout) {
          clearTimeout(this.sequenceTimeout);
        }
        return this.shortcuts.get(sequenceKey);
      } else if (sequenceKey.startsWith(currentSequenceKey + ' ')) {
        // Partial match, continue sequence
        return undefined;
      }
    }

    // No match found, reset sequence
    this.currentSequence = [];
    if (this.sequenceTimeout) {
      clearTimeout(this.sequenceTimeout);
    }
    
    return undefined;
  }

  /**
   * Check if key is a navigation key
   */
  public static isNavigationKey(key: string): boolean {
    const navigationKeys = [
      'up', 'down', 'left', 'right',
      'home', 'end', 'pageup', 'pagedown',
      'tab', 'enter', 'escape', 'space',
    ];
    
    return navigationKeys.includes(key.toLowerCase());
  }

  /**
   * Check if key is a function key
   */
  public static isFunctionKey(key: string): boolean {
    return /^f\d+$/.test(key.toLowerCase());
  }

  /**
   * Check if key is printable character
   */
  public static isPrintableKey(event: KeyboardEvent): boolean {
    // Function keys, navigation keys, and modified keys are not printable
    if (KeyboardHandler.isFunctionKey(event.key) ||
        KeyboardHandler.isNavigationKey(event.key) ||
        event.ctrl || event.alt || event.meta) {
      return false;
    }

    // Single character keys are printable
    return event.ch !== undefined && event.ch.length === 1;
  }

  /**
   * Get human-readable description of key combination
   */
  public static getKeyDescription(event: KeyboardEvent): string {
    const parts: string[] = [];
    
    if (event.ctrl) parts.push('Ctrl');
    if (event.alt) parts.push('Alt');
    if (event.shift) parts.push('Shift');
    if (event.meta) parts.push('Meta');
    
    // Format key name
    let keyName = event.key;
    if (keyName) {
      // Capitalize first letter for display
      keyName = keyName.charAt(0).toUpperCase() + keyName.slice(1);
      
      // Special key name mappings
      const keyMappings: Record<string, string> = {
        'Escape': 'Esc',
        'Enter': '↵',
        'Tab': '⇥',
        'Space': '␣',
        'Up': '↑',
        'Down': '↓',
        'Left': '←',
        'Right': '→',
        'Pageup': 'PgUp',
        'Pagedown': 'PgDn',
      };
      
      keyName = keyMappings[keyName] || keyName;
    }
    
    parts.push(keyName);
    
    return parts.join('+');
  }

  /**
   * Get all registered shortcuts
   */
  public getShortcuts(): ShortcutConfig[] {
    return Array.from(this.shortcuts.values());
  }

  /**
   * Get shortcuts by context
   */
  public getShortcutsByContext(context: string): ShortcutConfig[] {
    return Array.from(this.shortcuts.values())
      .filter(shortcut => shortcut.context === context || shortcut.global);
  }

  /**
   * Clear all shortcuts and sequences
   */
  public clear(): void {
    this.shortcuts.clear();
    this.keySequences.clear();
    this.currentSequence = [];
    
    if (this.sequenceTimeout) {
      clearTimeout(this.sequenceTimeout);
      this.sequenceTimeout = undefined;
    }
  }

  /**
   * Destroy the keyboard handler
   */
  public destroy(): void {
    this.clear();
  }
}