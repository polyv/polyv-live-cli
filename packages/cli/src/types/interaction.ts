/**
 * @fileoverview Type definitions for interactive operations and navigation
 * @author Development Team
 * @since 1.0.0
 */


/**
 * Keyboard event interface for blessed terminal interactions
 */
export interface KeyboardEvent {
  /** Key name (e.g., 'tab', 'f5', 'escape') */
  key: string;
  /** Whether Shift key is pressed */
  shift: boolean;
  /** Whether Ctrl key is pressed */
  ctrl: boolean;
  /** Whether Alt key is pressed */
  alt: boolean;
  /** Whether Meta key is pressed */
  meta: boolean;
  /** Full key combination string */
  full?: string;
  /** Character if printable */
  ch?: string;
}

/**
 * Mouse event interface for blessed terminal interactions
 */
export interface MouseEvent {
  /** Mouse action type */
  action: 'mousedown' | 'mouseup' | 'mousemove' | 'wheelup' | 'wheeldown';
  /** X coordinate */
  x: number;
  /** Y coordinate */
  y: number;
  /** Mouse button pressed */
  button: 'left' | 'right' | 'middle';
  /** Whether Shift key is pressed */
  shift: boolean;
  /** Whether Ctrl key is pressed */
  ctrl: boolean;
}

/**
 * Focus state for components
 */
export interface FocusState {
  /** Whether component has focus */
  focused: boolean;
  /** Whether component can receive focus */
  focusable: boolean;
  /** Tab index for keyboard navigation */
  tabIndex: number;
  /** Focus ring visibility */
  showFocusRing: boolean;
}

/**
 * Focusable component interface
 */
export interface FocusableComponent {
  /** Component unique identifier */
  getId(): string;
  /** Get component type */
  getType(): string;
  /** Check if component can receive focus */
  canFocus(): boolean;
  /** Set focus to this component */
  focus(): void;
  /** Remove focus from this component */
  blur(): void;
  /** Get current focus state */
  getFocusState(): FocusState;
  /** Handle keyboard events when focused */
  handleKeyboard(event: KeyboardEvent): boolean;
  /** Handle mouse events */
  handleMouse(event: MouseEvent): boolean;
}

/**
 * Shortcut key configuration
 */
export interface ShortcutConfig {
  /** Key combination (e.g., 'f5', 'ctrl+r', 'alt+tab') */
  key: string;
  /** Human-readable description */
  description: string;
  /** Action to execute */
  action: string;
  /** Whether shortcut is global or component-specific */
  global: boolean;
  /** Context where shortcut is active */
  context?: string;
}

/**
 * Context menu item configuration
 */
export interface ContextMenuItem {
  /** Menu item unique identifier */
  id: string;
  /** Display text */
  label: string;
  /** Optional keyboard shortcut */
  shortcut?: string;
  /** Whether item is enabled */
  enabled: boolean;
  /** Whether item is visible */
  visible: boolean;
  /** Action to execute when selected */
  action: string;
  /** Optional submenu items */
  submenu?: ContextMenuItem[];
  /** Optional separator before this item */
  separator?: boolean;
}

/**
 * Search configuration and state
 */
export interface SearchConfig {
  /** Search input placeholder text */
  placeholder: string;
  /** Whether search is case-sensitive */
  caseSensitive: boolean;
  /** Search mode: 'fuzzy' | 'exact' | 'contains' */
  mode: 'fuzzy' | 'exact' | 'contains';
  /** Fields to search in */
  searchFields: string[];
  /** Maximum search history entries */
  maxHistory: number;
  /** Whether to show search suggestions */
  showSuggestions: boolean;
}

/**
 * Search result interface
 */
export interface SearchResult {
  /** Item identifier */
  id: string;
  /** Matched text */
  text: string;
  /** Score (for fuzzy search) */
  score: number;
  /** Highlighted text with markup */
  highlighted: string;
  /** Additional data */
  data?: any;
}

/**
 * Panel layout configuration
 */
export interface PanelLayout {
  /** Layout name */
  name: string;
  /** Layout description */
  description: string;
  /** Whether this is the default layout */
  default: boolean;
  /** Minimum terminal size required */
  minTerminalSize: { width: number; height: number };
  /** Panel configurations */
  panels: PanelConfig[];
}

/**
 * Individual panel configuration
 */
export interface PanelConfig {
  /** Panel identifier */
  id: string;
  /** Panel type */
  type: string;
  /** Position in grid */
  position: { x: number; y: number; width: number; height: number };
  /** Whether panel is visible */
  visible: boolean;
  /** Whether panel can be minimized */
  minimizable: boolean;
  /** Whether panel can be maximized */
  maximizable: boolean;
  /** Whether panel can be moved */
  movable: boolean;
  /** Whether panel can be resized */
  resizable: boolean;
}

/**
 * Status bar information
 */
export interface StatusInfo {
  /** Connection status */
  connection: 'connected' | 'disconnected' | 'connecting' | 'error';
  /** Last data update timestamp */
  lastUpdate: Date;
  /** Current memory usage */
  memoryUsage: number;
  /** Current CPU usage */
  cpuUsage: number;
  /** Active operation description */
  currentOperation: string;
  /** Available keyboard shortcuts */
  availableShortcuts: string[];
  /** Error or warning messages */
  messages: Array<{ level: 'info' | 'warning' | 'error'; text: string }>;
}

/**
 * Interaction manager events
 */
export interface InteractionEvents {
  /** Keyboard event occurred */
  'keyboard:event': KeyboardEvent;
  /** Mouse event occurred */
  'mouse:event': MouseEvent;
  /** Focus changed */
  'focus:changed': { previous?: string; current?: string };
  /** Shortcut activated */
  'shortcut:activated': { key: string; action: string };
  /** Context menu requested */
  'contextmenu:requested': { x: number; y: number; context: string };
  /** Search query changed */
  'search:query': { query: string; results: SearchResult[] };
  /** Layout changed */
  'layout:changed': { previous: string; current: string };
  /** Panel state changed */
  'panel:state': { panelId: string; state: 'minimized' | 'maximized' | 'normal' };
}

/**
 * Main interaction manager configuration
 */
export interface InteractionConfig {
  /** Whether mouse support is enabled */
  mouseEnabled: boolean;
  /** Whether keyboard navigation is enabled */
  keyboardEnabled: boolean;
  /** Focus ring configuration */
  focusRing: {
    enabled: boolean;
    style: any;
  };
  /** Shortcut key mappings */
  shortcuts: ShortcutConfig[];
  /** Search configuration */
  search: SearchConfig;
  /** Status bar configuration */
  statusBar: {
    enabled: boolean;
    position: 'top' | 'bottom';
    height: number;
  };
}