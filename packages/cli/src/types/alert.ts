/**
 * @fileoverview Alert system type definitions
 * @author Development Team
 * @since 1.0.0
 */

/**
 * Alert severity levels
 */
export type AlertLevel = 'info' | 'warning' | 'error' | 'critical';

/**
 * Alert type categories
 */
export type AlertType = 'system' | 'stream' | 'channel' | 'network';

/**
 * Alert status states
 */
export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'ignored';

/**
 * Core alert interface
 */
export interface Alert {
  /** Unique alert identifier */
  id: string;
  /** Alert severity level */
  level: AlertLevel;
  /** Alert category type */
  type: AlertType;
  /** Alert title/summary */
  title: string;
  /** Detailed alert message */
  message: string;
  /** Source component or service that generated the alert */
  source: string;
  /** Associated channel ID (if applicable) */
  channelId?: string;
  /** Timestamp when alert was generated */
  timestamp: number;
  /** Whether alert has been acknowledged */
  acknowledged: boolean;
  /** Current alert status */
  status: AlertStatus;
  /** Additional metadata */
  metadata?: Record<string, any>;
  /** Alert acknowledgment timestamp */
  acknowledgedAt?: number;
  /** User who acknowledged the alert */
  acknowledgedBy?: string;
  /** Alert resolution timestamp */
  resolvedAt?: number;
  /** Alert notes/comments */
  notes?: string;
}

/**
 * Alert rule condition operators
 */
export type AlertOperator = '>' | '<' | '=' | '>=' | '<=' | '!=' | 'contains' | 'regex';

/**
 * Alert rule condition types
 */
export type AlertConditionType = 'threshold' | 'state_change' | 'time_window' | 'pattern';

/**
 * Alert rule condition
 */
export interface AlertCondition {
  /** Condition type */
  type: AlertConditionType;
  /** Field/metric to evaluate */
  field: string;
  /** Comparison operator */
  operator: AlertOperator;
  /** Threshold value */
  value: any;
  /** Time window for evaluation (in milliseconds) */
  timeWindow?: number;
  /** Logical operator for combining with other conditions */
  logicalOperator?: 'AND' | 'OR';
}

/**
 * Alert action types
 */
export type AlertActionType = 'log' | 'notification' | 'email' | 'webhook' | 'sound';

/**
 * Alert action configuration
 */
export interface AlertAction {
  /** Action type */
  type: AlertActionType;
  /** Action configuration parameters */
  config: Record<string, any>;
  /** Whether action is enabled */
  enabled: boolean;
}

/**
 * Alert rule definition
 */
export interface AlertRule {
  /** Unique rule identifier */
  id: string;
  /** Rule name */
  name: string;
  /** Rule description */
  description?: string;
  /** Whether rule is enabled */
  enabled: boolean;
  /** Alert level to generate */
  level: AlertLevel;
  /** Alert type category */
  type: AlertType;
  /** Rule conditions (all must be met) */
  conditions: AlertCondition[];
  /** Actions to execute when rule triggers */
  actions: AlertAction[];
  /** Cooldown period to prevent duplicate alerts (in milliseconds) */
  cooldown: number;
  /** Rule priority (higher number = higher priority) */
  priority: number;
  /** Rule tags for organization */
  tags?: string[];
  /** Rule creation timestamp */
  createdAt: number;
  /** Rule last modification timestamp */
  updatedAt: number;
  /** Last time rule was triggered */
  lastTriggered?: number;
  /** Number of times rule has been triggered */
  triggerCount: number;
}

/**
 * Alert history entry
 */
export interface AlertHistoryEntry {
  /** Alert data */
  alert: Alert;
  /** History entry timestamp */
  timestamp: number;
  /** Action performed (created, acknowledged, resolved, etc.) */
  action: string;
  /** User who performed the action */
  user?: string;
  /** Additional context */
  context?: Record<string, any>;
}

/**
 * Alert filter criteria
 */
export interface AlertFilter {
  /** Filter by alert levels */
  levels?: AlertLevel[];
  /** Filter by alert types */
  types?: AlertType[];
  /** Filter by alert status */
  statuses?: AlertStatus[];
  /** Filter by source */
  sources?: string[];
  /** Filter by channel ID */
  channelIds?: string[];
  /** Filter by time range */
  timeRange?: {
    start: number;
    end: number;
  };
  /** Filter by search text */
  searchText?: string;
  /** Show only acknowledged alerts */
  acknowledgedOnly?: boolean;
  /** Show only unacknowledged alerts */
  unacknowledgedOnly?: boolean;
}

/**
 * Alert grouping options
 */
export interface AlertGrouping {
  /** Group by field */
  field: keyof Alert;
  /** Sort order within groups */
  sortOrder: 'asc' | 'desc';
  /** Maximum items per group */
  maxPerGroup?: number;
}

/**
 * Alert statistics
 */
export interface AlertStatistics {
  /** Total alert count */
  total: number;
  /** Count by level */
  byLevel: Record<AlertLevel, number>;
  /** Count by type */
  byType: Record<AlertType, number>;
  /** Count by status */
  byStatus: Record<AlertStatus, number>;
  /** Count by source */
  bySource: Record<string, number>;
  /** Alerts in last 24 hours */
  last24Hours: number;
  /** Most frequent alert type */
  mostFrequentType: AlertType;
  /** Average time to acknowledgment (in milliseconds) */
  avgTimeToAck?: number;
  /** Average time to resolution (in milliseconds) */
  avgTimeToResolve?: number;
}

/**
 * Alert trend data point
 */
export interface AlertTrendPoint {
  /** Timestamp */
  timestamp: number;
  /** Alert count */
  count: number;
  /** Count by level */
  byLevel: Record<AlertLevel, number>;
}

/**
 * Alert notification configuration
 */
export interface AlertNotificationConfig {
  /** Sound notifications enabled */
  soundEnabled: boolean;
  /** Visual notifications enabled */
  visualEnabled: boolean;
  /** Desktop notifications enabled */
  desktopEnabled: boolean;
  /** Email notifications enabled */
  emailEnabled: boolean;
  /** Notification sound file path */
  soundFile?: string;
  /** Notification volume (0-1) */
  volume: number;
  /** Minimum level for notifications */
  minLevel: AlertLevel;
}

/**
 * Alert system configuration
 */
export interface AlertSystemConfig {
  /** Maximum number of alerts to keep in memory */
  maxAlertsInMemory: number;
  /** Maximum number of history entries to keep */
  maxHistoryEntries: number;
  /** Auto-acknowledgment timeout (in milliseconds) */
  autoAckTimeout?: number;
  /** Auto-resolution timeout (in milliseconds) */
  autoResolveTimeout?: number;
  /** Alert persistence enabled */
  persistenceEnabled: boolean;
  /** Alert persistence file path */
  persistenceFile: string;
  /** Notification configuration */
  notifications: AlertNotificationConfig;
  /** Default alert cooldown (in milliseconds) */
  defaultCooldown: number;
  /** Performance optimization settings */
  performance: {
    /** Maximum processing rate (alerts per second) */
    maxProcessingRate: number;
    /** Batch processing size */
    batchSize: number;
    /** Processing interval (in milliseconds) */
    processingInterval: number;
  };
}

/**
 * Alert panel display configuration
 */
export interface AlertPanelConfig {
  /** Maximum alerts to display */
  maxDisplayItems: number;
  /** Auto-scroll to new alerts */
  autoScroll: boolean;
  /** Show timestamps */
  showTimestamps: boolean;
  /** Show sources */
  showSources: boolean;
  /** Show alert IDs */
  showIds: boolean;
  /** Time format */
  timeFormat: 'relative' | 'absolute';
  /** Color coding enabled */
  colorCoding: boolean;
  /** Compact display mode */
  compactMode: boolean;
}

/**
 * Alert context for rule evaluation
 */
export interface AlertEvaluationContext {
  /** Current timestamp */
  timestamp: number;
  /** System metrics */
  systemMetrics?: any;
  /** Stream metrics */
  streamMetrics?: any;
  /** Channel status */
  channelStatus?: any;
  /** Network metrics */
  networkMetrics?: any;
  /** Previous alert states */
  alertHistory?: Alert[];
  /** Custom context data */
  custom?: Record<string, any>;
}

/**
 * Alert rule evaluation result
 */
export interface AlertRuleEvaluationResult {
  /** Rule ID that was evaluated */
  ruleId: string;
  /** Whether rule conditions were met */
  triggered: boolean;
  /** Alert to be created (if triggered) */
  alert?: Omit<Alert, 'id' | 'timestamp'>;
  /** Evaluation context used */
  context: AlertEvaluationContext;
  /** Evaluation timestamp */
  evaluatedAt: number;
  /** Evaluation details/debugging info */
  details?: Record<string, any>;
}