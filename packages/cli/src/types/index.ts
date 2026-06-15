/**
 * Main type definitions export for PolyV CLI
 */

// Authentication types
export * from './auth';

// Configuration types
export * from './config';

// Signature types
export * from './signature';

// Channel types
export * from './channel';

// Stream types
export * from './stream';

// Product types
export * from './product';

// Monitoring types (excluding AlertRule and AlertAction to avoid conflicts with alert.ts)
export type {
  MonitoringConfig,
  ComponentConfig,
  GridPosition,
  GridSize,
  TerminalConfig,
  PerformanceConfig,
  LayoutConfig,
  ComponentLayout,
  ComponentState,
  MonitoringEvent,
  StreamMetrics,
  ChannelStatus,
  SystemResources,
  ThemeConfig
} from './monitoring';

// Interaction types
export * from './interaction';

// Alert types (comprehensive alert system)
export * from './alert';

// Statistics Export types (Story 10.4)
export * from './statistics-export';

// Playback types (Story 9.1)
export * from './playback';

// Transmit types (Story 14.3)
export * from './transmit';

// AI Digital Human types (Story 14.4)
export * from './ai-digital-human';