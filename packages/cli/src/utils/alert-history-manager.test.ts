/**
 * @fileoverview Tests for AlertHistoryManager
 * @author Development Team
 * @since 1.0.0
 */

import * as fs from 'fs';
import * as path from 'path';
import { AlertHistoryManager } from './alert-history-manager';
import { Alert, AlertFilter, AlertSystemConfig } from '../types/alert';

// Mock fs module
jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('AlertHistoryManager', () => {
  let historyManager: AlertHistoryManager;
  let tempDir: string;

  const createMockAlert = (overrides: Partial<Alert> = {}): Alert => ({
    id: `alert-${Date.now()}-${Math.random()}`,
    level: 'warning',
    type: 'system',
    title: 'Test Alert',
    message: 'This is a test alert message',
    source: 'test-component',
    timestamp: Date.now(),
    acknowledged: false,
    status: 'active',
    ...overrides,
  });

  const createMockConfig = (overrides: Partial<AlertSystemConfig> = {}): Partial<AlertSystemConfig> => ({
    maxHistoryEntries: 1000,
    persistenceEnabled: false, // Disable persistence for most tests
    persistenceFile: path.join(tempDir, 'test-history.json'),
    ...overrides,
  });

  beforeEach(() => {
    tempDir = '/tmp/test-alerts';
    mockFs.existsSync.mockReturnValue(false);
    mockFs.mkdirSync.mockReturnValue(undefined);
    mockFs.readFileSync.mockReturnValue('{"entries": []}');
    mockFs.writeFileSync.mockReturnValue(undefined);
    
    const config = createMockConfig();
    historyManager = new AlertHistoryManager(config);
  });

  afterEach(() => {
    if (historyManager) {
      historyManager.destroy();
    }
    jest.clearAllMocks();
  });

  describe('Basic History Management', () => {
    it('should add alert to history', () => {
      const alert = createMockAlert();
      
      historyManager.addAlert(alert, 'created', 'test-user');
      
      const history = historyManager.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0]?.alert.id).toBe(alert.id);
      expect(history[0]?.action).toBe('created');
      expect(history[0]?.user).toBe('test-user');
    });

    it('should record alert actions', () => {
      const alert = createMockAlert();
      historyManager.addAlert(alert);
      
      const actionEntry = historyManager.recordAction(alert.id, 'acknowledged', 'admin');
      
      expect(actionEntry).toBeDefined();
      expect(actionEntry?.action).toBe('acknowledged');
      expect(actionEntry?.user).toBe('admin');
      
      const history = historyManager.getHistory();
      expect(history).toHaveLength(2); // Original add + action
    });

    it('should return null when recording action for non-existent alert', () => {
      const result = historyManager.recordAction('non-existent', 'acknowledged');
      expect(result).toBeNull();
    });

    it('should update alert in history', () => {
      const alert = createMockAlert();
      historyManager.addAlert(alert);
      
      const updatedAlert = { ...alert, title: 'Updated Title', acknowledged: true };
      historyManager.updateAlert(updatedAlert, 'admin');
      
      const history = historyManager.getHistory();
      expect(history).toHaveLength(2); // Original + update action
      
      // Check that both entries have updated alert data
      history.forEach(entry => {
        expect(entry.alert.title).toBe('Updated Title');
        expect(entry.alert.acknowledged).toBe(true);
      });
    });

    it('should get history with pagination', () => {
      // Add multiple alerts
      for (let i = 0; i < 10; i++) {
        historyManager.addAlert(createMockAlert({ title: `Alert ${i}` }));
      }
      
      const page1 = historyManager.getHistory(undefined, 5, 0);
      const page2 = historyManager.getHistory(undefined, 5, 5);
      
      expect(page1).toHaveLength(5);
      expect(page2).toHaveLength(5);
      expect(page1[0]?.alert.title).not.toBe(page2[0]?.alert.title);
    });

    it('should maintain newest-first order', () => {
      const alert1 = createMockAlert({ title: 'First Alert', timestamp: 1000 });
      const alert2 = createMockAlert({ title: 'Second Alert', timestamp: 2000 });
      
      historyManager.addAlert(alert1);
      historyManager.addAlert(alert2);
      
      const history = historyManager.getHistory();
      expect(history[0]?.alert.title).toBe('Second Alert');
      expect(history[1]?.alert.title).toBe('First Alert');
    });
  });

  describe('History Filtering', () => {
    beforeEach(() => {
      // Add test data
      historyManager.addAlert(createMockAlert({ 
        level: 'info', 
        type: 'system', 
        status: 'active',
        source: 'source-a',
        channelId: 'channel-1',
        title: 'Info alert'
      }));
      historyManager.addAlert(createMockAlert({ 
        level: 'warning', 
        type: 'stream', 
        status: 'acknowledged',
        acknowledged: true,
        source: 'source-b',
        channelId: 'channel-2',
        title: 'Warning alert'
      }));
      historyManager.addAlert(createMockAlert({ 
        level: 'error', 
        type: 'channel', 
        status: 'resolved',
        source: 'source-a',
        channelId: 'channel-1',
        title: 'Error alert'
      }));
    });

    it('should filter by alert levels', () => {
      const filter: AlertFilter = { levels: ['error', 'warning'] };
      const filtered = historyManager.getHistory(filter);
      
      expect(filtered).toHaveLength(2);
      expect(filtered.every(e => ['error', 'warning'].includes(e.alert.level))).toBe(true);
    });

    it('should filter by alert types', () => {
      const filter: AlertFilter = { types: ['system', 'channel'] };
      const filtered = historyManager.getHistory(filter);
      
      expect(filtered).toHaveLength(2);
      expect(filtered.every(e => ['system', 'channel'].includes(e.alert.type))).toBe(true);
    });

    it('should filter by alert status', () => {
      const filter: AlertFilter = { statuses: ['active'] };
      const filtered = historyManager.getHistory(filter);
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.alert.status).toBe('active');
    });

    it('should filter by sources', () => {
      const filter: AlertFilter = { sources: ['source-a'] };
      const filtered = historyManager.getHistory(filter);
      
      expect(filtered).toHaveLength(2);
      expect(filtered.every(e => e.alert.source === 'source-a')).toBe(true);
    });

    it('should filter by channel IDs', () => {
      const filter: AlertFilter = { channelIds: ['channel-1'] };
      const filtered = historyManager.getHistory(filter);
      
      expect(filtered).toHaveLength(2);
      expect(filtered.every(e => e.alert.channelId === 'channel-1')).toBe(true);
    });

    it('should filter by search text', () => {
      const filter: AlertFilter = { searchText: 'warning' };
      const filtered = historyManager.getHistory(filter);
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.alert.title.toLowerCase()).toContain('warning');
    });

    it('should filter by time range', () => {
      const now = Date.now();
      const filter: AlertFilter = { 
        timeRange: { 
          start: now - 10000, 
          end: now + 10000 
        } 
      };
      const filtered = historyManager.getHistory(filter);
      
      expect(filtered.length).toBeGreaterThan(0);
    });

    it('should filter by acknowledged status', () => {
      const filter: AlertFilter = { acknowledgedOnly: true };
      const filtered = historyManager.getHistory(filter);
      
      expect(filtered).toHaveLength(1);
      expect(filtered.every(e => e.alert.acknowledged)).toBe(true);
    });

    it('should filter by unacknowledged status', () => {
      const filter: AlertFilter = { unacknowledgedOnly: true };
      const filtered = historyManager.getHistory(filter);
      
      expect(filtered).toHaveLength(2);
      expect(filtered.every(e => !e.alert.acknowledged)).toBe(true);
    });
  });

  describe('History Search', () => {
    beforeEach(() => {
      historyManager.addAlert(createMockAlert({ 
        title: 'Network Connection Error',
        message: 'Failed to connect to server',
        source: 'network-monitor'
      }), 'created', 'system');
      
      historyManager.addAlert(createMockAlert({ 
        title: 'High CPU Usage',
        message: 'CPU usage exceeded threshold',
        source: 'cpu-monitor'
      }), 'created', 'admin');
    });

    it('should search by title', () => {
      const results = historyManager.searchHistory('network', ['title']);
      
      expect(results).toHaveLength(1);
      expect(results[0]?.alert.title).toContain('Network');
    });

    it('should search by message', () => {
      const results = historyManager.searchHistory('cpu', ['message']);
      
      expect(results).toHaveLength(1);
      expect(results[0]?.alert.message).toContain('CPU');
    });

    it('should search by source', () => {
      const results = historyManager.searchHistory('network-monitor', ['source']);
      
      expect(results).toHaveLength(1);
      expect(results[0]?.alert.source).toBe('network-monitor');
    });

    it('should search by user', () => {
      const results = historyManager.searchHistory('admin', ['user']);
      
      expect(results).toHaveLength(1);
      expect(results[0]?.user).toBe('admin');
    });

    it('should search across multiple fields', () => {
      const results = historyManager.searchHistory('network', ['title', 'source']);
      
      expect(results).toHaveLength(1);
    });

    it('should limit search results', () => {
      // Add many alerts
      for (let i = 0; i < 10; i++) {
        historyManager.addAlert(createMockAlert({ title: `Network Alert ${i}` }));
      }
      
      const results = historyManager.searchHistory('network', ['title'], 5);
      expect(results).toHaveLength(5);
    });
  });

  describe('History Retrieval Methods', () => {
    beforeEach(() => {
      // Add test data for various operations
      
      historyManager.addAlert(createMockAlert({ id: 'alert-1' }), 'created');
      historyManager.addAlert(createMockAlert({ id: 'alert-2' }), 'created');
      historyManager.recordAction('alert-1', 'acknowledged', 'user1');
      historyManager.recordAction('alert-1', 'resolved', 'user2');
    });

    it('should get history for specific alert', () => {
      const alertHistory = historyManager.getAlertHistory('alert-1');
      
      expect(alertHistory).toHaveLength(3); // created + acknowledged + resolved
      expect(alertHistory.every(e => e.alert.id === 'alert-1')).toBe(true);
    });

    it('should get history by action type', () => {
      const acknowledgedHistory = historyManager.getHistoryByAction('acknowledged');
      
      expect(acknowledgedHistory).toHaveLength(1);
      expect(acknowledgedHistory[0]?.action).toBe('acknowledged');
    });

    it('should get history by user', () => {
      const user1History = historyManager.getHistoryByUser('user1');
      
      expect(user1History).toHaveLength(1);
      expect(user1History[0]?.user).toBe('user1');
    });

    it('should get history by time range', () => {
      const now = Date.now();
      const rangeHistory = historyManager.getHistoryByTimeRange(now - 10000, now + 10000);
      
      expect(rangeHistory.length).toBeGreaterThan(0);
    });
  });

  describe('Statistics', () => {
    beforeEach(() => {
      // Add diverse test data
      historyManager.addAlert(createMockAlert({ level: 'info', type: 'system', status: 'active' }), 'created', 'user1');
      historyManager.addAlert(createMockAlert({ level: 'warning', type: 'stream', status: 'acknowledged' }), 'created', 'user2');
      historyManager.addAlert(createMockAlert({ level: 'error', type: 'channel', status: 'resolved' }), 'created', 'user1');
      
      // Add some actions
      const alerts = historyManager.getHistory();
      historyManager.recordAction(alerts[0]?.alert.id || '', 'acknowledged', 'user2');
    });

    it('should calculate basic statistics', () => {
      const stats = historyManager.getStatistics();
      
      expect(stats.totalEntries).toBe(4); // 3 creates + 1 action
      expect(stats.uniqueAlerts).toBe(3);
      expect(stats.actionCounts['created']).toBe(3);
      expect(stats.actionCounts['acknowledged']).toBe(1);
      expect(stats.userCounts['user1']).toBe(2);
      expect(stats.userCounts['user2']).toBe(2);
    });

    it('should calculate level counts', () => {
      const stats = historyManager.getStatistics();
      
      expect(stats.levelCounts.info).toBe(1);
      expect(stats.levelCounts.warning).toBe(1);
      expect(stats.levelCounts.error).toBe(2); // Original + action entry
    });

    it('should calculate time range', () => {
      const stats = historyManager.getStatistics();
      
      expect(stats.timeRange).not.toBeNull();
      expect(stats.timeRange?.earliest).toBeLessThanOrEqual(stats.timeRange?.latest || 0);
    });

    it('should handle empty history statistics', () => {
      const emptyManager = new AlertHistoryManager({ persistenceEnabled: false });
      const stats = emptyManager.getStatistics();
      
      expect(stats.totalEntries).toBe(0);
      expect(stats.uniqueAlerts).toBe(0);
      expect(stats.timeRange).toBeNull();
      
      emptyManager.destroy();
    });
  });

  describe('Recent Activity', () => {
    beforeEach(() => {
      const now = Date.now();
      const hourAgo = now - (60 * 60 * 1000);
      const oldTime = now - (25 * 60 * 60 * 1000); // 25 hours ago (outside 24h window)
      
      // Create recent alerts
      const alert1 = createMockAlert({ type: 'system' });
      const alert2 = createMockAlert({ type: 'system' });
      
      // Manually create recent entries
      historyManager['historyEntries'] = [
        {
          alert: { ...alert1 },
          timestamp: now + 1000, // acknowledged action
          action: 'acknowledged',
          user: 'user1'
        },
        {
          alert: { ...alert2 },
          timestamp: hourAgo + 1000, // resolved action  
          action: 'resolved',
          user: 'user2'
        },
        {
          alert: { ...alert1 },
          timestamp: now, // created alert1
          action: 'created',
          user: 'user1'
        },
        {
          alert: { ...alert2 },
          timestamp: hourAgo, // created alert2
          action: 'created',
          user: 'user2'
        },
        {
          alert: createMockAlert({ type: 'network' }),
          timestamp: oldTime, // old alert (excluded)
          action: 'created',
          user: 'user3'
        }
      ];
    });

    it('should get recent activity summary', () => {
      const activity = historyManager.getRecentActivity(24);
      
      expect(activity.totalAlerts).toBe(4); // 2 creates + 2 actions (old alert excluded)
      expect(activity.newAlerts).toBe(2);
      expect(activity.acknowledgedAlerts).toBe(1);
      expect(activity.resolvedAlerts).toBe(1);
      expect(activity.activeUsers).toContain('user1');
      expect(activity.activeUsers).toContain('user2');
      expect(activity.activeUsers).not.toContain('user3');
    });

    it('should calculate top alert types', () => {
      const activity = historyManager.getRecentActivity(24);
      
      expect(activity.topAlertTypes).toHaveLength(1);
      expect(activity.topAlertTypes[0]?.type).toBe('system');
      expect(activity.topAlertTypes[0]?.count).toBe(4); // 2 original + 2 actions
    });
  });

  describe('Export and Import', () => {
    beforeEach(() => {
      historyManager.addAlert(createMockAlert({ title: 'Export Test Alert 1' }), 'created', 'user1');
      historyManager.addAlert(createMockAlert({ title: 'Export Test Alert 2' }), 'created', 'user2');
    });

    it('should export history as JSON', () => {
      const exported = historyManager.exportHistory('json');
      const parsed = JSON.parse(exported);
      
      expect(parsed.version).toBe('1.0');
      expect(parsed.count).toBe(2);
      expect(parsed.entries).toHaveLength(2);
      expect(parsed.exportedAt).toBeDefined();
    });

    it('should export history as CSV', () => {
      const exported = historyManager.exportHistory('csv');
      const lines = exported.split('\n');
      
      expect(lines[0]).toContain('Timestamp,Action,User'); // Header
      expect(lines).toHaveLength(3); // Header + 2 data rows
      expect(lines[1]).toContain('user2'); // Most recent first
      expect(lines[2]).toContain('user1');
    });

    it('should import history from JSON', () => {
      const exportData = historyManager.exportHistory('json');
      
      // Clear current history
      historyManager.clearHistory();
      expect(historyManager.getHistory()).toHaveLength(0);
      
      // Import
      const result = historyManager.importHistory(exportData, 'json', false);
      
      expect(result.imported).toBe(2);
      expect(result.errors).toHaveLength(0);
      expect(historyManager.getHistory()).toHaveLength(2);
    });

    it('should merge imported history', () => {
      const originalCount = historyManager.getHistory().length;
      const exportData = historyManager.exportHistory('json');
      
      // Import with merge=true (default)
      const result = historyManager.importHistory(exportData, 'json', true);
      
      expect(result.imported).toBe(2);
      expect(historyManager.getHistory()).toHaveLength(originalCount + 2);
    });

    it('should handle import errors gracefully', () => {
      const invalidData = '{"entries": [{"invalid": "data"}]}';
      const result = historyManager.importHistory(invalidData, 'json');
      
      expect(result.imported).toBe(0);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Configuration Management', () => {
    it('should get current configuration', () => {
      const config = historyManager.getConfig();
      
      expect(config.maxHistoryEntries).toBe(1000);
      expect(config.persistenceEnabled).toBe(false);
      expect(config.currentSize).toBe(0);
      expect(config.persistenceFilePath).toContain('test-history.json');
    });

    it('should update configuration', () => {
      historyManager.updateConfig({
        maxHistoryEntries: 500,
        persistenceEnabled: true
      });
      
      const config = historyManager.getConfig();
      expect(config.maxHistoryEntries).toBe(500);
      expect(config.persistenceEnabled).toBe(true);
    });

    it('should enforce max entries when updated', () => {
      // Add more alerts than new limit
      for (let i = 0; i < 10; i++) {
        historyManager.addAlert(createMockAlert());
      }
      
      // Update to smaller limit
      historyManager.updateConfig({ maxHistoryEntries: 5 });
      
      expect(historyManager.getHistory()).toHaveLength(5);
    });
  });

  describe('History Maintenance', () => {
    it('should clear all history', () => {
      historyManager.addAlert(createMockAlert());
      historyManager.addAlert(createMockAlert());
      
      historyManager.clearHistory();
      
      expect(historyManager.getHistory()).toHaveLength(0);
    });

    it('should clear old history', () => {
      const now = Date.now();
      const oldTime = now - (48 * 60 * 60 * 1000); // 48 hours ago
      
      // Add old and recent alerts
      historyManager.addAlert(createMockAlert({ timestamp: oldTime }));
      historyManager.addAlert(createMockAlert({ timestamp: now }));
      
      // Set timestamps on entries
      const history = historyManager.getHistory();
      if (history[0]) history[0].timestamp = now;
      if (history[1]) history[1].timestamp = oldTime;
      
      const clearedCount = historyManager.clearOldHistory(24 * 60 * 60 * 1000); // 24 hours
      
      expect(clearedCount).toBe(1);
      expect(historyManager.getHistory()).toHaveLength(1);
    });

    it('should enforce maximum size automatically', () => {
      const smallManager = new AlertHistoryManager({ 
        maxHistoryEntries: 3,
        persistenceEnabled: false 
      });
      
      // Add more than max
      for (let i = 0; i < 5; i++) {
        smallManager.addAlert(createMockAlert({ title: `Alert ${i}` }));
      }
      
      expect(smallManager.getHistory()).toHaveLength(3);
      smallManager.destroy();
    });
  });

  describe('Event Emission', () => {
    it('should emit entry:added event', (done) => {
      const alert = createMockAlert();
      
      historyManager.on('entry:added', (data) => {
        expect(data.alert.id).toBe(alert.id);
        done();
      });
      
      historyManager.addAlert(alert);
    });

    it('should emit action:recorded event', (done) => {
      const alert = createMockAlert();
      historyManager.addAlert(alert);
      
      historyManager.on('action:recorded', (data) => {
        expect(data.alertId).toBe(alert.id);
        expect(data.action).toBe('acknowledged');
        done();
      });
      
      historyManager.recordAction(alert.id, 'acknowledged');
    });

    it('should emit history:cleared event', (done) => {
      historyManager.addAlert(createMockAlert());
      
      historyManager.on('history:cleared', (data) => {
        expect(data.count).toBe(1);
        done();
      });
      
      historyManager.clearHistory();
    });

    it('should emit config:updated event', (done) => {
      historyManager.on('config:updated', (data) => {
        expect(data.maxHistoryEntries).toBe(500);
        done();
      });
      
      historyManager.updateConfig({ maxHistoryEntries: 500 });
    });
  });

  describe('Persistence (Mocked)', () => {
    beforeEach(() => {
      // Reset mock to enable persistence
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({
        entries: [
          {
            alert: createMockAlert({ title: 'Persisted Alert' }),
            timestamp: Date.now(),
            action: 'created',
            user: 'system'
          }
        ]
      }));
    });

    it('should attempt to load history on initialization', async () => {
      const persistentManager = new AlertHistoryManager({
        persistenceEnabled: true,
        persistenceFile: '/tmp/test.json'
      });
      
      // Give time for async initialization
      await new Promise(resolve => setTimeout(resolve, 1));
      
      expect(mockFs.readFileSync).toHaveBeenCalledWith('/tmp/test.json', 'utf8');
      
      persistentManager.destroy();
    });

    it('should handle persistence errors gracefully', async () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('File read error');
      });
      
      const persistentManager = new AlertHistoryManager({
        persistenceEnabled: true,
        persistenceFile: '/tmp/test.json'
      });
      
      // Should not throw
      expect(persistentManager).toBeDefined();
      
      persistentManager.destroy();
    });

    it('should force save when requested', async () => {
      const persistentManager = new AlertHistoryManager({
        persistenceEnabled: true,
        persistenceFile: '/tmp/test.json'
      });
      
      persistentManager.addAlert(createMockAlert());
      await persistentManager.forceSave();
      
      expect(mockFs.writeFileSync).toHaveBeenCalled();
      
      persistentManager.destroy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty search queries', () => {
      historyManager.addAlert(createMockAlert());
      
      const results = historyManager.searchHistory('', ['title']);
      expect(results).toHaveLength(0);
    });

    it('should handle invalid time ranges', () => {
      historyManager.addAlert(createMockAlert());
      
      const results = historyManager.getHistoryByTimeRange(Date.now() + 1000, Date.now() - 1000);
      expect(results).toHaveLength(0);
    });

    it('should handle CSV export with special characters', () => {
      historyManager.addAlert(createMockAlert({ 
        title: 'Alert with "quotes" and, commas',
        message: 'Message with\nnewlines'
      }));
      
      const csv = historyManager.exportHistory('csv');
      expect(csv).toContain('""quotes""'); // Escaped quotes
      expect(csv).not.toContain('Message with\nnewlines'); // Should be escaped
    });

    it('should handle destruction gracefully', async () => {
      historyManager.addAlert(createMockAlert());
      
      await historyManager.destroy();
      
      expect(historyManager.getHistory()).toHaveLength(0);
    });
  });
});