/**
 * @fileoverview Alert manager for coordinating alert operations and integrations
 * @author Development Team
 * @since 1.0.0
 */

import { EventEmitter } from 'events';
import { AlertHistoryManager } from './alert-history-manager';
import { AlertRuleManager } from './alert-rule-manager';
import {
  Alert,
  AlertFilter,
  AlertEvaluationContext,
  AlertSystemConfig
} from '../types/alert';

/**
 * Comprehensive alert manager that coordinates all alert operations
 */
export class AlertManager extends EventEmitter {
  private alerts: Map<string, Alert> = new Map();
  private historyManager: AlertHistoryManager;
  private ruleManager: AlertRuleManager;
  private config: AlertSystemConfig;
  private isRunning = false;
  private evaluationInterval: NodeJS.Timeout | undefined;
  private cleanupInterval: NodeJS.Timeout | undefined;

  constructor(config?: Partial<AlertSystemConfig>) {
    super();

    // Initialize configuration with defaults
    this.config = {
      maxAlertsInMemory: 1000,
      maxHistoryEntries: 10000,
      autoAckTimeout: 24 * 60 * 60 * 1000, // 24 hours
      autoResolveTimeout: 7 * 24 * 60 * 60 * 1000, // 7 days
      persistenceEnabled: true,
      persistenceFile: '.polyv-alerts/alerts.json',
      notifications: {
        soundEnabled: true,
        visualEnabled: true,
        desktopEnabled: false,
        emailEnabled: false,
        volume: 0.7,
        minLevel: 'warning'
      },
      defaultCooldown: 5 * 60 * 1000, // 5 minutes
      performance: {
        maxProcessingRate: 100,
        batchSize: 10,
        processingInterval: 1000
      },
      ...config
    };

    // Initialize sub-managers
    this.historyManager = new AlertHistoryManager(this.config);
    this.ruleManager = new AlertRuleManager();

    this.setupEventHandlers();
    this.setupCleanupInterval();
  }

  /**
   * Set up event handlers between components
   */
  private setupEventHandlers(): void {
    // Forward rule manager events
    this.ruleManager.on('rule:triggered', (data) => {
      if (data.result.alert) {
        this.createAlert(data.result.alert);
      }
      this.emit('rule:triggered', data);
    });

    // Forward history manager events
    this.historyManager.on('entry:added', (data) => {
      this.emit('alert:history-updated', data);
    });

    this.historyManager.on('action:recorded', (data) => {
      this.emit('alert:action-recorded', data);
    });
  }

  /**
   * Set up automatic cleanup interval
   */
  private setupCleanupInterval(): void {
    // Clean up old alerts every hour
    this.cleanupInterval = setInterval(() => {
      this.performAutomaticCleanup();
    }, 60 * 60 * 1000);
  }

  /**
   * Start the alert manager
   */
  public start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.ruleManager.start();

    // Start evaluation interval
    this.evaluationInterval = setInterval(() => {
      this.evaluateAlerts();
    }, this.config.performance.processingInterval);

    this.emit('manager:started');
  }

  /**
   * Stop the alert manager
   */
  public stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    this.ruleManager.stop();

    if (this.evaluationInterval) {
      clearInterval(this.evaluationInterval);
      this.evaluationInterval = undefined;
    }

    this.emit('manager:stopped');
  }

  /**
   * Create a new alert
   */
  public createAlert(alertData: Omit<Alert, 'id' | 'timestamp' | 'acknowledged' | 'status'>): Alert {
    const alert: Alert = {
      id: this.generateAlertId(),
      timestamp: Date.now(),
      acknowledged: false,
      status: 'active',
      ...alertData
    };

    // Add to memory
    this.alerts.set(alert.id, alert);

    // Add to history
    this.historyManager.addAlert(alert, 'created');

    // Enforce memory limits
    this.enforceMemoryLimits();

    // Emit events
    this.emit('alert:created', { alert });
    this.emit('alert:new', { alert });

    return alert;
  }

  /**
   * Acknowledge an alert
   */
  public acknowledgeAlert(alertId: string, user?: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert || alert.acknowledged) return false;

    // Update alert
    alert.acknowledged = true;
    alert.acknowledgedAt = Date.now();
    if (user) {
      alert.acknowledgedBy = user;
    }
    
    if (alert.status === 'active') {
      alert.status = 'acknowledged';
    }

    // Record in history
    this.historyManager.recordAction(alertId, 'acknowledged', user);

    // Emit events
    this.emit('alert:acknowledged', { alertId, alert, user });

    return true;
  }

  /**
   * Resolve an alert
   */
  public resolveAlert(alertId: string, user?: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert || alert.status === 'resolved') return false;

    // Update alert
    alert.status = 'resolved';
    alert.resolvedAt = Date.now();

    // Auto-acknowledge if not already acknowledged
    if (!alert.acknowledged) {
      alert.acknowledged = true;
      alert.acknowledgedAt = Date.now();
      if (user) {
        alert.acknowledgedBy = user;
      }
    }

    // Record in history
    this.historyManager.recordAction(alertId, 'resolved', user);

    // Emit events
    this.emit('alert:resolved', { alertId, alert, user });

    return true;
  }

  /**
   * Ignore an alert
   */
  public ignoreAlert(alertId: string, user?: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;

    // Update alert
    alert.status = 'ignored';
    alert.acknowledgedAt = Date.now();
    if (user) {
      alert.acknowledgedBy = user;
    }

    // Record in history
    this.historyManager.recordAction(alertId, 'ignored', user);

    // Emit events
    this.emit('alert:ignored', { alertId, alert, user });

    return true;
  }

  /**
   * Delete an alert
   */
  public deleteAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;

    // Remove from memory
    this.alerts.delete(alertId);

    // Record in history
    this.historyManager.recordAction(alertId, 'deleted');

    // Emit events
    this.emit('alert:deleted', { alertId, alert });

    return true;
  }

  /**
   * Add notes to an alert
   */
  public addAlertNotes(alertId: string, notes: string, user?: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;

    // Update alert notes
    const timestamp = new Date().toISOString();
    const noteEntry = user ? `[${timestamp}] ${user}: ${notes}` : `[${timestamp}] ${notes}`;
    
    if (alert.notes) {
      alert.notes += '\n' + noteEntry;
    } else {
      alert.notes = noteEntry;
    }

    // Record in history
    this.historyManager.recordAction(alertId, 'notes-added', user, { notes });

    // Emit events
    this.emit('alert:notes-added', { alertId, alert, notes, user });

    return true;
  }

  /**
   * Get all alerts
   */
  public getAlerts(): Alert[] {
    return Array.from(this.alerts.values());
  }

  /**
   * Get alert by ID
   */
  public getAlert(alertId: string): Alert | undefined {
    return this.alerts.get(alertId);
  }

  /**
   * Get alerts by filter
   */
  public getFilteredAlerts(filter?: AlertFilter): Alert[] {
    const alerts = this.getAlerts();

    if (!filter) return alerts;

    return alerts.filter(alert => {
      // Level filter
      if (filter.levels?.length && !filter.levels.includes(alert.level)) {
        return false;
      }

      // Type filter
      if (filter.types?.length && !filter.types.includes(alert.type)) {
        return false;
      }

      // Status filter
      if (filter.statuses?.length && !filter.statuses.includes(alert.status)) {
        return false;
      }

      // Source filter
      if (filter.sources?.length && !filter.sources.includes(alert.source)) {
        return false;
      }

      // Channel filter
      if (filter.channelIds?.length && !filter.channelIds.includes(alert.channelId || '')) {
        return false;
      }

      // Time range filter
      if (filter.timeRange) {
        if (alert.timestamp < filter.timeRange.start || 
            alert.timestamp > filter.timeRange.end) {
          return false;
        }
      }

      // Search text filter
      if (filter.searchText) {
        const searchText = filter.searchText.toLowerCase();
        return alert.title.toLowerCase().includes(searchText) ||
               alert.message.toLowerCase().includes(searchText) ||
               alert.source.toLowerCase().includes(searchText);
      }

      // Acknowledged filter
      if (filter.acknowledgedOnly && !alert.acknowledged) {
        return false;
      }

      if (filter.unacknowledgedOnly && alert.acknowledged) {
        return false;
      }

      return true;
    });
  }

  /**
   * Batch acknowledge alerts
   */
  public acknowledgeBatch(alertIds: string[], user?: string): { success: string[]; failed: string[] } {
    const result = { success: [] as string[], failed: [] as string[] };

    alertIds.forEach(alertId => {
      if (this.acknowledgeAlert(alertId, user)) {
        result.success.push(alertId);
      } else {
        result.failed.push(alertId);
      }
    });

    this.emit('alert:batch-acknowledged', { success: result.success, failed: result.failed, user });
    return result;
  }

  /**
   * Batch resolve alerts
   */
  public resolveBatch(alertIds: string[], user?: string): { success: string[]; failed: string[] } {
    const result = { success: [] as string[], failed: [] as string[] };

    alertIds.forEach(alertId => {
      if (this.resolveAlert(alertId, user)) {
        result.success.push(alertId);
      } else {
        result.failed.push(alertId);
      }
    });

    this.emit('alert:batch-resolved', { success: result.success, failed: result.failed, user });
    return result;
  }

  /**
   * Clear all alerts
   */
  public clearAllAlerts(): number {
    const count = this.alerts.size;
    this.alerts.clear();

    // Record in history
    this.historyManager.recordAction('all', 'cleared');

    this.emit('alert:all-cleared', { count });
    return count;
  }

  /**
   * Evaluate alerts against rules
   */
  public evaluateAlerts(context?: AlertEvaluationContext): void {
    if (!context) {
      context = {
        timestamp: Date.now(),
        alertHistory: this.getAlerts()
      };
    }

    const results = this.ruleManager.evaluateRules(context);
    
    results.forEach(result => {
      if (result.triggered && result.alert) {
        this.createAlert(result.alert);
      }
    });
  }

  /**
   * Get alert statistics
   */
  public getStatistics() {
    return this.historyManager.getStatistics();
  }

  /**
   * Get recent activity
   */
  public getRecentActivity(hours = 24) {
    return this.historyManager.getRecentActivity(hours);
  }

  /**
   * Export alert data
   */
  public exportAlerts(format: 'json' | 'csv' = 'json'): string {
    return this.historyManager.exportHistory(format);
  }

  /**
   * Import alert data
   */
  public importAlerts(data: string, format: 'json' = 'json', merge = true) {
    return this.historyManager.importHistory(data, format, merge);
  }

  /**
   * Get alert history
   */
  public getAlertHistory(filter?: AlertFilter, limit?: number, offset = 0) {
    return this.historyManager.getHistory(filter, limit, offset);
  }

  /**
   * Search alert history
   */
  public searchAlertHistory(
    searchText: string, 
    searchFields: Array<'title' | 'message' | 'source' | 'action' | 'user'> = ['title', 'message'],
    limit = 100
  ) {
    return this.historyManager.searchHistory(searchText, searchFields, limit);
  }

  /**
   * Access rule manager
   */
  public getRuleManager(): AlertRuleManager {
    return this.ruleManager;
  }

  /**
   * Access history manager
   */
  public getHistoryManager(): AlertHistoryManager {
    return this.historyManager;
  }

  /**
   * Perform automatic cleanup
   */
  private performAutomaticCleanup(): void {
    const now = Date.now();

    // Auto-acknowledge old alerts
    if (this.config.autoAckTimeout) {
      const autoAckCutoff = now - this.config.autoAckTimeout;
      this.alerts.forEach(alert => {
        if (!alert.acknowledged && alert.timestamp < autoAckCutoff) {
          this.acknowledgeAlert(alert.id, 'system');
        }
      });
    }

    // Auto-resolve very old alerts
    if (this.config.autoResolveTimeout) {
      const autoResolveCutoff = now - this.config.autoResolveTimeout;
      this.alerts.forEach(alert => {
        if (alert.status !== 'resolved' && alert.timestamp < autoResolveCutoff) {
          this.resolveAlert(alert.id, 'system');
        }
      });
    }

    // Clean up old resolved alerts from memory
    const resolvedCutoff = now - (24 * 60 * 60 * 1000); // 24 hours
    const alertsToRemove: string[] = [];
    
    this.alerts.forEach((alert, id) => {
      if (alert.status === 'resolved' && alert.resolvedAt && alert.resolvedAt < resolvedCutoff) {
        alertsToRemove.push(id);
      }
    });

    alertsToRemove.forEach(id => this.alerts.delete(id));

    if (alertsToRemove.length > 0) {
      this.emit('alert:cleanup', { removedCount: alertsToRemove.length });
    }
  }

  /**
   * Enforce memory limits
   */
  private enforceMemoryLimits(): void {
    if (this.alerts.size <= this.config.maxAlertsInMemory) return;

    // Remove oldest resolved alerts first
    const sortedAlerts = Array.from(this.alerts.entries())
      .sort((a, b) => {
        // Prioritize resolved alerts for removal
        if (a[1].status === 'resolved' && b[1].status !== 'resolved') return -1;
        if (a[1].status !== 'resolved' && b[1].status === 'resolved') return 1;
        
        // Then sort by timestamp (oldest first)
        return a[1].timestamp - b[1].timestamp;
      });

    const toRemove = sortedAlerts.slice(0, this.alerts.size - this.config.maxAlertsInMemory);
    toRemove.forEach(([id]) => this.alerts.delete(id));

    if (toRemove.length > 0) {
      this.emit('alert:memory-cleanup', { removedCount: toRemove.length });
    }
  }

  /**
   * Generate unique alert ID
   */
  private generateAlertId(): string {
    return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Destroy the alert manager
   */
  public async destroy(): Promise<void> {
    this.stop();

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }

    await this.historyManager.destroy();
    await this.ruleManager.destroy();

    this.alerts.clear();
    this.removeAllListeners();

    this.emit('manager:destroyed');
  }
}