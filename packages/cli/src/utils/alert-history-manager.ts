/**
 * @fileoverview Alert history management system
 * @author Development Team
 * @since 1.0.0
 */

import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';
import {
  Alert,
  AlertHistoryEntry,
  AlertFilter,
  AlertLevel,
  AlertType,
  AlertStatus,
  AlertSystemConfig
} from '../types/alert';

/**
 * Alert history manager for storing, retrieving, and managing alert history
 */
export class AlertHistoryManager extends EventEmitter {
  private historyEntries: AlertHistoryEntry[] = [];
  private persistenceFilePath: string;
  private maxHistoryEntries: number;
  private persistenceEnabled: boolean;
  private autoSaveInterval?: NodeJS.Timeout;
  private isDirty = false;

  constructor(config?: Partial<AlertSystemConfig>) {
    super();
    
    this.maxHistoryEntries = config?.maxHistoryEntries || 10000;
    this.persistenceEnabled = config?.persistenceEnabled !== false;
    this.persistenceFilePath = config?.persistenceFile || path.join(process.cwd(), '.polyv-alerts', 'alert-history.json');
    
    this.initializePersistence();
    this.setupAutoSave();
  }

  /**
   * Initialize persistence directory and load existing history
   */
  private async initializePersistence(): Promise<void> {
    if (!this.persistenceEnabled) return;

    try {
      // Ensure directory exists
      const dir = path.dirname(this.persistenceFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Load existing history
      await this.loadHistory();
    } catch (error) {
      console.warn('Failed to initialize alert history persistence:', error);
      this.emit('persistence:error', { action: 'initialize', error });
    }
  }

  /**
   * Setup auto-save mechanism
   */
  private setupAutoSave(): void {
    if (!this.persistenceEnabled) return;

    // Auto-save every 30 seconds if dirty
    this.autoSaveInterval = setInterval(async () => {
      if (this.isDirty) {
        await this.saveHistory();
      }
    }, 30000);
  }

  /**
   * Load history from persistence file
   */
  private async loadHistory(): Promise<void> {
    if (!this.persistenceEnabled || !fs.existsSync(this.persistenceFilePath)) {
      return;
    }

    try {
      const data = fs.readFileSync(this.persistenceFilePath, 'utf8');
      const parsed = JSON.parse(data);
      
      if (Array.isArray(parsed.entries)) {
        this.historyEntries = parsed.entries.map((entry: any) => ({
          ...entry,
          alert: { ...entry.alert },
          timestamp: typeof entry.timestamp === 'string' ? 
            new Date(entry.timestamp).getTime() : entry.timestamp
        }));
        
        // Apply size limit
        if (this.historyEntries.length > this.maxHistoryEntries) {
          this.historyEntries = this.historyEntries
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, this.maxHistoryEntries);
          this.isDirty = true;
        }
      }

      this.emit('history:loaded', { 
        count: this.historyEntries.length,
        file: this.persistenceFilePath 
      });
    } catch (error) {
      console.warn('Failed to load alert history:', error);
      this.emit('persistence:error', { action: 'load', error });
    }
  }

  /**
   * Save history to persistence file
   */
  private async saveHistory(): Promise<void> {
    if (!this.persistenceEnabled || !this.isDirty) return;

    try {
      const data = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        count: this.historyEntries.length,
        entries: this.historyEntries
      };

      const dir = path.dirname(this.persistenceFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(this.persistenceFilePath, JSON.stringify(data, null, 2), 'utf8');
      this.isDirty = false;

      this.emit('history:saved', { 
        count: this.historyEntries.length,
        file: this.persistenceFilePath 
      });
    } catch (error) {
      console.warn('Failed to save alert history:', error);
      this.emit('persistence:error', { action: 'save', error });
    }
  }

  /**
   * Add alert to history
   */
  public addAlert(alert: Alert, action = 'created', user?: string, context?: Record<string, any>): void {
    const entry: AlertHistoryEntry = {
      alert: { ...alert },
      timestamp: Date.now(),
      action,
      ...(user && { user }),
      ...(context && { context })
    };

    this.historyEntries.unshift(entry); // Add to beginning for newest first
    this.enforceMaxSize();
    this.isDirty = true;

    this.emit('entry:added', { entry, alert });
  }

  /**
   * Record alert action (acknowledge, resolve, etc.)
   */
  public recordAction(
    alertId: string, 
    action: string, 
    user?: string, 
    context?: Record<string, any>
  ): AlertHistoryEntry | null {
    // Find the most recent entry for this alert
    const alertEntry = this.historyEntries.find(entry => entry.alert.id === alertId);
    if (!alertEntry) return null;

    const actionEntry: AlertHistoryEntry = {
      alert: { ...alertEntry.alert },
      timestamp: Date.now(),
      action,
      ...(user && { user }),
      ...(context && { context })
    };

    this.historyEntries.unshift(actionEntry);
    this.enforceMaxSize();
    this.isDirty = true;

    this.emit('action:recorded', { entry: actionEntry, alertId, action });
    return actionEntry;
  }

  /**
   * Update alert in history
   */
  public updateAlert(updatedAlert: Alert, user?: string): void {
    // Find all entries for this alert and update the alert data
    let updateCount = 0;
    this.historyEntries.forEach(entry => {
      if (entry.alert.id === updatedAlert.id) {
        entry.alert = { ...updatedAlert };
        updateCount++;
      }
    });

    if (updateCount > 0) {
      // Add an update action entry
      this.recordAction(updatedAlert.id, 'updated', user, {
        updateCount,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Get alert history with optional filtering
   */
  public getHistory(filter?: AlertFilter, limit?: number, offset = 0): AlertHistoryEntry[] {
    let filtered = this.historyEntries;

    if (filter) {
      filtered = this.applyFilter(filtered, filter);
    }

    // Apply pagination
    const start = offset;
    const end = limit ? start + limit : undefined;
    
    return filtered.slice(start, end);
  }

  /**
   * Get history for a specific alert
   */
  public getAlertHistory(alertId: string): AlertHistoryEntry[] {
    return this.historyEntries.filter(entry => entry.alert.id === alertId);
  }

  /**
   * Get history entries by action type
   */
  public getHistoryByAction(action: string): AlertHistoryEntry[] {
    return this.historyEntries.filter(entry => entry.action === action);
  }

  /**
   * Get history entries by user
   */
  public getHistoryByUser(user: string): AlertHistoryEntry[] {
    return this.historyEntries.filter(entry => entry.user === user);
  }

  /**
   * Get history entries within time range
   */
  public getHistoryByTimeRange(startTime: number, endTime: number): AlertHistoryEntry[] {
    return this.historyEntries.filter(entry => 
      entry.timestamp >= startTime && entry.timestamp <= endTime
    );
  }

  /**
   * Apply filter to history entries
   */
  private applyFilter(entries: AlertHistoryEntry[], filter: AlertFilter): AlertHistoryEntry[] {
    return entries.filter(entry => {
      const alert = entry.alert;

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
        if (entry.timestamp < filter.timeRange.start || 
            entry.timestamp > filter.timeRange.end) {
          return false;
        }
      }

      // Search text filter
      if (filter.searchText) {
        const searchText = filter.searchText.toLowerCase();
        return alert.title.toLowerCase().includes(searchText) ||
               alert.message.toLowerCase().includes(searchText) ||
               alert.source.toLowerCase().includes(searchText) ||
               entry.action.toLowerCase().includes(searchText);
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
   * Search history entries
   */
  public searchHistory(
    searchText: string, 
    searchFields: Array<'title' | 'message' | 'source' | 'action' | 'user'> = ['title', 'message'],
    limit = 100
  ): AlertHistoryEntry[] {
    // Return empty array for empty search text
    if (!searchText || searchText.trim() === '') {
      return [];
    }
    
    const searchLower = searchText.toLowerCase();
    
    const matches = this.historyEntries.filter(entry => {
      return searchFields.some(field => {
        switch (field) {
          case 'title':
            return entry.alert.title.toLowerCase().includes(searchLower);
          case 'message':
            return entry.alert.message.toLowerCase().includes(searchLower);
          case 'source':
            return entry.alert.source.toLowerCase().includes(searchLower);
          case 'action':
            return entry.action.toLowerCase().includes(searchLower);
          case 'user':
            return entry.user?.toLowerCase().includes(searchLower) || false;
          default:
            return false;
        }
      });
    });

    return matches.slice(0, limit);
  }

  /**
   * Get history statistics
   */
  public getStatistics(): {
    totalEntries: number;
    uniqueAlerts: number;
    actionCounts: Record<string, number>;
    userCounts: Record<string, number>;
    timeRange: { earliest: number; latest: number } | null;
    levelCounts: Record<AlertLevel, number>;
    typeCounts: Record<AlertType, number>;
    statusCounts: Record<AlertStatus, number>;
  } {
    const stats = {
      totalEntries: this.historyEntries.length,
      uniqueAlerts: new Set(this.historyEntries.map(e => e.alert.id)).size,
      actionCounts: {} as Record<string, number>,
      userCounts: {} as Record<string, number>,
      timeRange: null as { earliest: number; latest: number } | null,
      levelCounts: { info: 0, warning: 0, error: 0, critical: 0 } as Record<AlertLevel, number>,
      typeCounts: { system: 0, stream: 0, channel: 0, network: 0 } as Record<AlertType, number>,
      statusCounts: { active: 0, acknowledged: 0, resolved: 0, ignored: 0 } as Record<AlertStatus, number>
    };

    if (this.historyEntries.length === 0) {
      return stats;
    }

    // Calculate time range
    const timestamps = this.historyEntries.map(e => e.timestamp);
    stats.timeRange = {
      earliest: Math.min(...timestamps),
      latest: Math.max(...timestamps)
    };

    // Count by various dimensions
    this.historyEntries.forEach(entry => {
      // Action counts
      stats.actionCounts[entry.action] = (stats.actionCounts[entry.action] || 0) + 1;

      // User counts
      if (entry.user) {
        stats.userCounts[entry.user] = (stats.userCounts[entry.user] || 0) + 1;
      }

      // Alert level counts
      stats.levelCounts[entry.alert.level]++;

      // Alert type counts
      stats.typeCounts[entry.alert.type]++;

      // Alert status counts
      stats.statusCounts[entry.alert.status]++;
    });

    return stats;
  }

  /**
   * Get recent activity summary
   */
  public getRecentActivity(hours = 24): {
    totalAlerts: number;
    newAlerts: number;
    acknowledgedAlerts: number;
    resolvedAlerts: number;
    activeUsers: string[];
    topAlertTypes: Array<{ type: AlertType; count: number }>;
  } {
    const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
    const recentEntries = this.historyEntries.filter(entry => entry.timestamp >= cutoffTime);

    const summary = {
      totalAlerts: recentEntries.length,
      newAlerts: 0,
      acknowledgedAlerts: 0,
      resolvedAlerts: 0,
      activeUsers: [] as string[],
      topAlertTypes: [] as Array<{ type: AlertType; count: number }>
    };

    const userSet = new Set<string>();
    const typeCounts = new Map<AlertType, number>();

    recentEntries.forEach(entry => {
      switch (entry.action) {
        case 'created':
          summary.newAlerts++;
          break;
        case 'acknowledged':
          summary.acknowledgedAlerts++;
          break;
        case 'resolved':
          summary.resolvedAlerts++;
          break;
      }

      if (entry.user) {
        userSet.add(entry.user);
      }

      const currentCount = typeCounts.get(entry.alert.type) || 0;
      typeCounts.set(entry.alert.type, currentCount + 1);
    });

    summary.activeUsers = Array.from(userSet);
    summary.topAlertTypes = Array.from(typeCounts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    return summary;
  }

  /**
   * Export history data
   */
  public exportHistory(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      return this.exportToCSV();
    } else {
      return JSON.stringify({
        version: '1.0',
        exportedAt: new Date().toISOString(),
        count: this.historyEntries.length,
        entries: this.historyEntries
      }, null, 2);
    }
  }

  /**
   * Export history to CSV format
   */
  private exportToCSV(): string {
    const headers = [
      'Timestamp',
      'Action',
      'User',
      'Alert ID',
      'Alert Level',
      'Alert Type',
      'Alert Status',
      'Alert Title',
      'Alert Message',
      'Alert Source',
      'Channel ID'
    ];

    const rows = this.historyEntries.map(entry => [
      new Date(entry.timestamp).toISOString(),
      entry.action,
      entry.user || '',
      entry.alert.id,
      entry.alert.level,
      entry.alert.type,
      entry.alert.status,
      `"${entry.alert.title.replace(/"/g, '""').replace(/\n/g, '\\n')}"`,
      `"${entry.alert.message.replace(/"/g, '""').replace(/\n/g, '\\n')}"`,
      entry.alert.source,
      entry.alert.channelId || ''
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  /**
   * Import history data
   */
  public importHistory(data: string, format: 'json' = 'json', merge = true): {
    imported: number;
    errors: string[];
  } {
    const result = { imported: 0, errors: [] as string[] };

    try {
      if (format === 'json') {
        const parsed = JSON.parse(data);
        const entries = Array.isArray(parsed.entries) ? parsed.entries : 
                       Array.isArray(parsed) ? parsed : [];

        if (!merge) {
          this.historyEntries = [];
        }

        entries.forEach((entry: any, index: number) => {
          try {
            // Validate required fields
            if (!entry.alert || !entry.action || !entry.timestamp) {
              throw new Error('Missing required fields (alert, action, timestamp)');
            }
            
            if (!entry.alert.id || !entry.alert.level || !entry.alert.type) {
              throw new Error('Invalid alert data');
            }

            const historyEntry: AlertHistoryEntry = {
              alert: entry.alert,
              timestamp: typeof entry.timestamp === 'string' ? 
                new Date(entry.timestamp).getTime() : entry.timestamp,
              action: entry.action,
              user: entry.user,
              context: entry.context
            };

            this.historyEntries.push(historyEntry);
            result.imported++;
          } catch (error) {
            result.errors.push(`Entry ${index}: ${error instanceof Error ? error.message : 'Invalid format'}`);
          }
        });

        // Sort by timestamp (newest first) and enforce size limit
        this.historyEntries.sort((a, b) => b.timestamp - a.timestamp);
        this.enforceMaxSize();
        this.isDirty = true;
      } else {
        result.errors.push('CSV import not yet implemented');
      }
    } catch (error) {
      result.errors.push(`Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    this.emit('history:imported', result);
    return result;
  }

  /**
   * Clear all history
   */
  public clearHistory(): void {
    const count = this.historyEntries.length;
    this.historyEntries = [];
    this.isDirty = true;
    
    this.emit('history:cleared', { count });
  }

  /**
   * Clear history older than specified time
   */
  public clearOldHistory(olderThanMs: number): number {
    const cutoffTime = Date.now() - olderThanMs;
    const initialCount = this.historyEntries.length;
    
    this.historyEntries = this.historyEntries.filter(entry => entry.timestamp >= cutoffTime);
    const clearedCount = initialCount - this.historyEntries.length;
    
    if (clearedCount > 0) {
      this.isDirty = true;
      this.emit('history:pruned', { clearedCount, remaining: this.historyEntries.length });
    }

    return clearedCount;
  }

  /**
   * Enforce maximum history size
   */
  private enforceMaxSize(): void {
    if (this.historyEntries.length > this.maxHistoryEntries) {
      const removedCount = this.historyEntries.length - this.maxHistoryEntries;
      this.historyEntries = this.historyEntries.slice(0, this.maxHistoryEntries);
      
      this.emit('history:trimmed', { 
        removedCount, 
        remaining: this.historyEntries.length 
      });
    }
  }

  /**
   * Get configuration
   */
  public getConfig(): {
    maxHistoryEntries: number;
    persistenceEnabled: boolean;
    persistenceFilePath: string;
    currentSize: number;
  } {
    return {
      maxHistoryEntries: this.maxHistoryEntries,
      persistenceEnabled: this.persistenceEnabled,
      persistenceFilePath: this.persistenceFilePath,
      currentSize: this.historyEntries.length
    };
  }

  /**
   * Update configuration
   */
  public updateConfig(updates: {
    maxHistoryEntries?: number;
    persistenceEnabled?: boolean;
    persistenceFilePath?: string;
  }): void {
    if (updates.maxHistoryEntries !== undefined) {
      this.maxHistoryEntries = updates.maxHistoryEntries;
      this.enforceMaxSize();
    }

    if (updates.persistenceEnabled !== undefined) {
      this.persistenceEnabled = updates.persistenceEnabled;
      if (this.persistenceEnabled) {
        this.setupAutoSave();
      } else if (this.autoSaveInterval) {
        clearInterval(this.autoSaveInterval);
        this.autoSaveInterval = undefined as any;
      }
    }

    if (updates.persistenceFilePath !== undefined) {
      this.persistenceFilePath = updates.persistenceFilePath;
    }

    this.emit('config:updated', updates);
  }

  /**
   * Force save history
   */
  public async forceSave(): Promise<void> {
    this.isDirty = true;
    await this.saveHistory();
  }

  /**
   * Destroy the history manager
   */
  public async destroy(): Promise<void> {
    // Save final state
    if (this.isDirty) {
      await this.saveHistory();
    }

    // Clear auto-save interval
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = undefined as any;
    }

    // Clear data
    this.historyEntries = [];
    this.removeAllListeners();

    this.emit('manager:destroyed');
  }
}