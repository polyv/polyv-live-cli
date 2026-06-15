import { EventEmitter } from 'events';

export interface MonitoringConfig {
  version: string;                    // Configuration version for migration
  theme: string;                      // Current theme ID
  layout: string;                     // Current layout ID
  refreshInterval: number;            // Refresh interval (milliseconds)
  components: ComponentConfig[];      // Component configurations
  terminal?: TerminalConfig;          // Terminal configuration (optional for backward compatibility)
  performance?: PerformanceConfig;    // Performance configuration (optional for backward compatibility)
  customThemes: ThemeConfig[];        // Custom theme definitions
  customLayouts: LayoutConfig[];      // Custom layout definitions
  preferences: UserPreferences;       // User preference settings
}

export interface ComponentConfig {
  type: string;
  position: GridPosition;
  size: GridSize;
  config: Record<string, any>;
  visible: boolean;
  priority: number;
}

export interface GridPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GridSize {
  minWidth: number;
  minHeight: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface TerminalConfig {
  minWidth: number;
  minHeight: number;
  colorSupport: boolean;
  mouseSupport: boolean;
  unicodeSupport: boolean;
}

export interface PerformanceConfig {
  maxMemoryUsage: number;
  maxCpuUsage: number;
  renderThrottleMs: number;
  dataBufferSize: number;
}

export interface LayoutConfig {
  id: string;                         // Layout unique ID
  name: string;                       // Layout display name
  description?: string;               // Layout description
  author?: string;                    // Layout author
  version?: string;                   // Layout version
  isBuiltIn: boolean;                 // Whether this is a built-in layout
  grid: GridConfig;                   // Grid configuration
  components: ComponentLayout[];      // Component layouts
  responsive: boolean;                // Whether layout is responsive
  minTerminalSize: { width: number; height: number };
}

export interface GridConfig {
  rows: number;                       // Number of grid rows
  cols: number;                       // Number of grid columns
  cellWidth: number;                  // Cell width in characters
  cellHeight: number;                 // Cell height in lines
  padding: number;                    // Padding between cells
}

export interface ComponentLayout {
  type: string;
  position: GridPosition;
  size: GridSize;
  config: Record<string, any>;
}

export interface ComponentState {
  id: string;
  type: string;
  status: 'initializing' | 'running' | 'paused' | 'error' | 'destroyed';
  lastUpdate: Date;
  error?: Error;
  data?: any;
}

export interface MonitoringEvent {
  type: string;
  timestamp: Date;
  source: string;
  data: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface StreamMetrics {
  channelId: string;
  bitrate: number;
  fps: number;
  resolution: string;
  viewerCount: number;
  status: 'live' | 'offline' | 'error';
  uptime: number;
  bandwidth: number;
  lastUpdate: Date;
}

export interface ChannelStatus {
  channelId: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  streamKey: string;
  rtmpUrl: string;
  viewerCount: number;
  lastActivity: Date;
  created: Date;
}

export interface SystemResources {
  cpu: {
    usage: number;
    cores: number;
    temperature?: number;
  };
  memory: {
    used: number;
    total: number;
    available: number;
    percentage: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
    connections: number;
  };
  disk?: {
    used: number;
    total: number;
    available: number;
    percentage: number;
  };
}

export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  operator: '>' | '<' | '=' | '>=' | '<=';
  enabled: boolean;
  cooldown: number;
  actions: AlertAction[];
}

export interface AlertAction {
  type: 'log' | 'notification' | 'email' | 'webhook';
  config: Record<string, any>;
}

export interface ThemeConfig {
  id: string;                         // Theme unique ID
  name: string;                       // Theme display name
  description?: string;               // Theme description
  author?: string;                    // Theme author
  version?: string;                   // Theme version
  isBuiltIn: boolean;                 // Whether this is a built-in theme
  colors: ColorScheme;                // Color scheme
  fonts: FontConfig;                  // Font configuration
  borders: BorderConfig;              // Border styles
  components: ComponentStyles;        // Component-specific styles
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  background: string;
  foreground: string;
  accent: string;
  error: string;
  warning: string;
  success: string;
  info: string;
  muted: string;
  highlight: string;
  border: string;
  selection: string;
}

export interface FontConfig {
  family: string;
  size: number;
  weight: 'normal' | 'bold';
  style: 'normal' | 'italic';
}

export interface BorderConfig {
  type: 'line' | 'bg' | 'none';
  style: 'solid' | 'dashed' | 'dotted';
  color?: string;
}

export interface ComponentStyles {
  header: StyleConfig;
  content: StyleConfig;
  status: StyleConfig;
  border: StyleConfig;
  scrollbar: StyleConfig;
  selection: StyleConfig;
}

export interface StyleConfig {
  fg?: string;
  bg?: string;
  bold?: boolean;
  underline?: boolean;
  blink?: boolean;
  inverse?: boolean;
}

export interface UserPreferences {
  autoSave: boolean;                  // Auto-save configuration changes
  confirmActions: boolean;            // Show confirmation dialogs
  showHelp: boolean;                  // Show help tooltips
  keyboardShortcuts: boolean;         // Enable keyboard shortcuts
  animationSpeed: 'slow' | 'normal' | 'fast'; // Animation speed preference
  soundEnabled: boolean;              // Enable sound notifications
  compactMode: boolean;               // Use compact display mode
  showTimestamps: boolean;            // Show timestamps in logs
  maxHistoryItems: number;            // Maximum history items to keep
}

export abstract class Component {
  protected widget: any;
  protected config: ComponentConfig;
  protected eventBus: EventEmitter;
  protected state: ComponentState;

  constructor(config: ComponentConfig, eventBus: EventEmitter) {
    this.config = config;
    this.eventBus = eventBus;
    this.state = {
      id: this.generateId(),
      type: config.type,
      status: 'initializing',
      lastUpdate: new Date(),
    };
  }

  abstract render(): void;
  abstract update(data: any): void;
  abstract destroy(): void;
  abstract resize(size: GridSize): void;

  protected emit(event: string, data: any): void {
    this.eventBus.emit(event, { ...data, source: this.state.id });
  }

  protected subscribe(event: string, handler: (data: any) => void): void {
    this.eventBus.on(event, handler);
  }

  protected unsubscribe(event: string, handler: (data: any) => void): void {
    this.eventBus.off(event, handler);
  }

  public getState(): ComponentState {
    return { ...this.state };
  }

  public getWidget(): any {
    return this.widget;
  }

  private generateId(): string {
    return `${this.config.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}