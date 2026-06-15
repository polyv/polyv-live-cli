/**
 * @fileoverview Tests for AlertManager
 * @author Development Team
 * @since 1.0.0
 */

import { AlertManager } from './alert-manager';
import {
  Alert,
  AlertFilter,
  AlertSystemConfig
} from '../types/alert';

// Mock file system for history manager
jest.mock('fs');

describe('AlertManager', () => {
  let alertManager: AlertManager;

  const createMockAlert = (overrides: Partial<Alert> = {}): Omit<Alert, 'id' | 'timestamp' | 'acknowledged' | 'status'> => ({
    level: 'warning',
    type: 'system',
    title: 'Test Alert',
    message: 'This is a test alert',
    source: 'test-component',
    ...overrides,
  });

  const createMockConfig = (overrides: Partial<AlertSystemConfig> = {}): Partial<AlertSystemConfig> => ({
    maxAlertsInMemory: 100,
    maxHistoryEntries: 1000,
    persistenceEnabled: false, // Disable for tests
    autoAckTimeout: process.env['NODE_ENV'] === 'test' ? 1 : 60000, // Fast for tests
    autoResolveTimeout: process.env['NODE_ENV'] === 'test' ? 2 : 120000, // Fast for tests
    ...overrides,
  });

  beforeEach(() => {
    const config = createMockConfig();
    alertManager = new AlertManager(config);
  });

  afterEach(async () => {
    if (alertManager) {
      await alertManager.destroy();
    }
    jest.clearAllMocks();
  });

  describe('Lifecycle Management', () => {
    it('should start and stop correctly', () => {
      expect(alertManager['isRunning']).toBe(false);
      
      alertManager.start();
      expect(alertManager['isRunning']).toBe(true);
      expect(alertManager['evaluationInterval']).toBeDefined();
      
      alertManager.stop();
      expect(alertManager['isRunning']).toBe(false);
      expect(alertManager['evaluationInterval']).toBeUndefined();
    });

    it('should not start multiple times', () => {
      alertManager.start();
      const firstInterval = alertManager['evaluationInterval'];
      
      alertManager.start(); // Try to start again
      expect(alertManager['evaluationInterval']).toBe(firstInterval);
      
      alertManager.stop();
    });

    it('should emit lifecycle events', (done) => {
      let eventCount = 0;
      
      alertManager.on('manager:started', () => {
        eventCount++;
        if (eventCount === 1) {
          alertManager.stop();
        }
      });
      
      alertManager.on('manager:stopped', () => {
        eventCount++;
        if (eventCount === 2) {
          done();
        }
      });
      
      alertManager.start();
    });
  });

  describe('Alert Creation and Management', () => {
    it('should create a new alert', () => {
      const alertData = createMockAlert();
      const alert = alertManager.createAlert(alertData);
      
      expect(alert.id).toBeDefined();
      expect(alert.timestamp).toBeDefined();
      expect(alert.acknowledged).toBe(false);
      expect(alert.status).toBe('active');
      expect(alert.title).toBe(alertData.title);
      expect(alert.level).toBe(alertData.level);
    });

    it('should emit alert:created event', (done) => {
      alertManager.on('alert:created', (data) => {
        expect(data.alert).toBeDefined();
        expect(data.alert.title).toBe('Test Alert');
        done();
      });
      
      alertManager.createAlert(createMockAlert());
    });

    it('should store alerts in memory', () => {
      alertManager.createAlert(createMockAlert({ title: 'Alert 1' }));
      alertManager.createAlert(createMockAlert({ title: 'Alert 2' }));
      
      const alerts = alertManager.getAlerts();
      expect(alerts).toHaveLength(2);
      expect(alerts.map(a => a.title)).toContain('Alert 1');
      expect(alerts.map(a => a.title)).toContain('Alert 2');
    });

    it('should retrieve alert by ID', () => {
      const alert = alertManager.createAlert(createMockAlert());
      const retrieved = alertManager.getAlert(alert.id);
      
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(alert.id);
    });
  });

  describe('Alert Acknowledgment', () => {
    it('should acknowledge an alert', () => {
      const alert = alertManager.createAlert(createMockAlert());
      const success = alertManager.acknowledgeAlert(alert.id, 'test-user');
      
      expect(success).toBe(true);
      
      const updated = alertManager.getAlert(alert.id);
      expect(updated?.acknowledged).toBe(true);
      expect(updated?.acknowledgedBy).toBe('test-user');
      expect(updated?.acknowledgedAt).toBeDefined();
      expect(updated?.status).toBe('acknowledged');
    });

    it('should not acknowledge already acknowledged alert', () => {
      const alert = alertManager.createAlert(createMockAlert());
      alertManager.acknowledgeAlert(alert.id, 'user1');
      
      const success = alertManager.acknowledgeAlert(alert.id, 'user2');
      expect(success).toBe(false);
      
      const updated = alertManager.getAlert(alert.id);
      expect(updated?.acknowledgedBy).toBe('user1'); // Should remain first user
    });

    it('should emit alert:acknowledged event', (done) => {
      const alert = alertManager.createAlert(createMockAlert());
      
      alertManager.on('alert:acknowledged', (data) => {
        expect(data.alertId).toBe(alert.id);
        expect(data.user).toBe('test-user');
        done();
      });
      
      alertManager.acknowledgeAlert(alert.id, 'test-user');
    });

    it('should handle non-existent alert gracefully', () => {
      const success = alertManager.acknowledgeAlert('non-existent', 'user');
      expect(success).toBe(false);
    });
  });

  describe('Alert Resolution', () => {
    it('should resolve an alert', () => {
      const alert = alertManager.createAlert(createMockAlert());
      const success = alertManager.resolveAlert(alert.id, 'test-user');
      
      expect(success).toBe(true);
      
      const updated = alertManager.getAlert(alert.id);
      expect(updated?.status).toBe('resolved');
      expect(updated?.resolvedAt).toBeDefined();
      expect(updated?.acknowledged).toBe(true); // Auto-acknowledged
      expect(updated?.acknowledgedBy).toBe('test-user');
    });

    it('should not resolve already resolved alert', () => {
      const alert = alertManager.createAlert(createMockAlert());
      alertManager.resolveAlert(alert.id, 'user1');
      
      const success = alertManager.resolveAlert(alert.id, 'user2');
      expect(success).toBe(false);
    });

    it('should emit alert:resolved event', (done) => {
      const alert = alertManager.createAlert(createMockAlert());
      
      alertManager.on('alert:resolved', (data) => {
        expect(data.alertId).toBe(alert.id);
        expect(data.user).toBe('test-user');
        done();
      });
      
      alertManager.resolveAlert(alert.id, 'test-user');
    });

    it('should preserve existing acknowledgment when resolving', () => {
      const alert = alertManager.createAlert(createMockAlert());
      alertManager.acknowledgeAlert(alert.id, 'acker');
      alertManager.resolveAlert(alert.id, 'resolver');
      
      const updated = alertManager.getAlert(alert.id);
      expect(updated?.acknowledgedBy).toBe('acker'); // Should preserve original acknowledger
      expect(updated?.status).toBe('resolved');
    });
  });

  describe('Alert Ignoring', () => {
    it('should ignore an alert', () => {
      const alert = alertManager.createAlert(createMockAlert());
      const success = alertManager.ignoreAlert(alert.id, 'test-user');
      
      expect(success).toBe(true);
      
      const updated = alertManager.getAlert(alert.id);
      expect(updated?.status).toBe('ignored');
      expect(updated?.acknowledgedBy).toBe('test-user');
      expect(updated?.acknowledgedAt).toBeDefined();
    });

    it('should emit alert:ignored event', (done) => {
      const alert = alertManager.createAlert(createMockAlert());
      
      alertManager.on('alert:ignored', (data) => {
        expect(data.alertId).toBe(alert.id);
        expect(data.user).toBe('test-user');
        done();
      });
      
      alertManager.ignoreAlert(alert.id, 'test-user');
    });
  });

  describe('Alert Deletion', () => {
    it('should delete an alert', () => {
      const alert = alertManager.createAlert(createMockAlert());
      const success = alertManager.deleteAlert(alert.id);
      
      expect(success).toBe(true);
      expect(alertManager.getAlert(alert.id)).toBeUndefined();
      expect(alertManager.getAlerts()).toHaveLength(0);
    });

    it('should emit alert:deleted event', (done) => {
      const alert = alertManager.createAlert(createMockAlert());
      
      alertManager.on('alert:deleted', (data) => {
        expect(data.alertId).toBe(alert.id);
        done();
      });
      
      alertManager.deleteAlert(alert.id);
    });

    it('should handle non-existent alert gracefully', () => {
      const success = alertManager.deleteAlert('non-existent');
      expect(success).toBe(false);
    });
  });

  describe('Alert Notes', () => {
    it('should add notes to an alert', () => {
      const alert = alertManager.createAlert(createMockAlert());
      const success = alertManager.addAlertNotes(alert.id, 'Test note', 'test-user');
      
      expect(success).toBe(true);
      
      const updated = alertManager.getAlert(alert.id);
      expect(updated?.notes).toContain('Test note');
      expect(updated?.notes).toContain('test-user');
    });

    it('should append multiple notes', () => {
      const alert = alertManager.createAlert(createMockAlert());
      alertManager.addAlertNotes(alert.id, 'First note', 'user1');
      alertManager.addAlertNotes(alert.id, 'Second note', 'user2');
      
      const updated = alertManager.getAlert(alert.id);
      expect(updated?.notes).toContain('First note');
      expect(updated?.notes).toContain('Second note');
      expect(updated?.notes).toContain('user1');
      expect(updated?.notes).toContain('user2');
    });

    it('should emit alert:notes-added event', (done) => {
      const alert = alertManager.createAlert(createMockAlert());
      
      alertManager.on('alert:notes-added', (data) => {
        expect(data.alertId).toBe(alert.id);
        expect(data.notes).toBe('Test note');
        expect(data.user).toBe('test-user');
        done();
      });
      
      alertManager.addAlertNotes(alert.id, 'Test note', 'test-user');
    });
  });

  describe('Batch Operations', () => {
    it('should acknowledge multiple alerts', () => {
      const alert1 = alertManager.createAlert(createMockAlert({ title: 'Alert 1' }));
      const alert2 = alertManager.createAlert(createMockAlert({ title: 'Alert 2' }));
      const alert3 = alertManager.createAlert(createMockAlert({ title: 'Alert 3' }));
      
      // Pre-acknowledge one alert
      alertManager.acknowledgeAlert(alert3.id);
      
      const result = alertManager.acknowledgeBatch([alert1.id, alert2.id, alert3.id, 'non-existent'], 'batch-user');
      
      expect(result.success).toContain(alert1.id);
      expect(result.success).toContain(alert2.id);
      expect(result.failed).toContain(alert3.id); // Already acknowledged
      expect(result.failed).toContain('non-existent');
    });

    it('should resolve multiple alerts', () => {
      const alert1 = alertManager.createAlert(createMockAlert({ title: 'Alert 1' }));
      const alert2 = alertManager.createAlert(createMockAlert({ title: 'Alert 2' }));
      
      const result = alertManager.resolveBatch([alert1.id, alert2.id, 'non-existent'], 'batch-user');
      
      expect(result.success).toContain(alert1.id);
      expect(result.success).toContain(alert2.id);
      expect(result.failed).toContain('non-existent');
      
      expect(alertManager.getAlert(alert1.id)?.status).toBe('resolved');
      expect(alertManager.getAlert(alert2.id)?.status).toBe('resolved');
    });

    it('should emit batch events', (done) => {
      const alert1 = alertManager.createAlert(createMockAlert());
      const alert2 = alertManager.createAlert(createMockAlert());
      
      alertManager.on('alert:batch-acknowledged', (data) => {
        expect(data.success).toHaveLength(2);
        expect(data.failed).toHaveLength(0);
        expect(data.user).toBe('batch-user');
        done();
      });
      
      alertManager.acknowledgeBatch([alert1.id, alert2.id], 'batch-user');
    });
  });

  describe('Filtering', () => {
    beforeEach(() => {
      // Create test alerts
      alertManager.createAlert(createMockAlert({ 
        level: 'info', 
        type: 'system', 
        source: 'source-a',
        title: 'Info alert'
      }));
      alertManager.createAlert(createMockAlert({ 
        level: 'warning', 
        type: 'stream', 
        source: 'source-b',
        title: 'Warning alert'
      }));
      alertManager.createAlert(createMockAlert({ 
        level: 'error', 
        type: 'channel', 
        source: 'source-a',
        title: 'Error alert'
      }));
    });

    it('should filter by alert levels', () => {
      const filter: AlertFilter = { levels: ['error', 'warning'] };
      const filtered = alertManager.getFilteredAlerts(filter);
      
      expect(filtered).toHaveLength(2);
      expect(filtered.every(a => ['error', 'warning'].includes(a.level))).toBe(true);
    });

    it('should filter by alert types', () => {
      const filter: AlertFilter = { types: ['system', 'channel'] };
      const filtered = alertManager.getFilteredAlerts(filter);
      
      expect(filtered).toHaveLength(2);
      expect(filtered.every(a => ['system', 'channel'].includes(a.type))).toBe(true);
    });

    it('should filter by search text', () => {
      const filter: AlertFilter = { searchText: 'warning' };
      const filtered = alertManager.getFilteredAlerts(filter);
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.title.toLowerCase()).toContain('warning');
    });

    it('should filter by acknowledged status', () => {
      const alerts = alertManager.getAlerts();
      alertManager.acknowledgeAlert(alerts[0]?.id || '');
      
      const acknowledgedFilter: AlertFilter = { acknowledgedOnly: true };
      const unacknowledgedFilter: AlertFilter = { unacknowledgedOnly: true };
      
      const acknowledged = alertManager.getFilteredAlerts(acknowledgedFilter);
      const unacknowledged = alertManager.getFilteredAlerts(unacknowledgedFilter);
      
      expect(acknowledged).toHaveLength(1);
      expect(unacknowledged).toHaveLength(2);
    });

    it('should return all alerts when no filter provided', () => {
      const filtered = alertManager.getFilteredAlerts();
      expect(filtered).toHaveLength(3);
    });
  });

  describe('Memory Management', () => {
    it('should enforce memory limits', () => {
      const config = createMockConfig({ maxAlertsInMemory: 2 });
      const limitedManager = new AlertManager(config);
      
      // Create more alerts than the limit
      limitedManager.createAlert(createMockAlert({ title: 'Alert 1' }));
      limitedManager.createAlert(createMockAlert({ title: 'Alert 2' }));
      limitedManager.createAlert(createMockAlert({ title: 'Alert 3' }));
      
      expect(limitedManager.getAlerts()).toHaveLength(2);
      
      limitedManager.destroy();
    });

    it('should prioritize removing resolved alerts', () => {
      const config = createMockConfig({ maxAlertsInMemory: 2 });
      const limitedManager = new AlertManager(config);
      
      const alert1 = limitedManager.createAlert(createMockAlert({ title: 'Alert 1' }));
      limitedManager.createAlert(createMockAlert({ title: 'Alert 2' }));
      
      // Resolve first alert
      limitedManager.resolveAlert(alert1.id);
      
      // Add third alert, should remove resolved one
      limitedManager.createAlert(createMockAlert({ title: 'Alert 3' }));
      
      const remaining = limitedManager.getAlerts();
      expect(remaining).toHaveLength(2);
      expect(remaining.find(a => a.id === alert1.id)).toBeUndefined();
      
      limitedManager.destroy();
    });
  });

  describe('Automatic Cleanup', () => {
    it('should perform automatic cleanup', async () => {
      const config = createMockConfig({
        autoAckTimeout: 50, // 50ms for testing
        autoResolveTimeout: 100 // 100ms for testing
      });
      const cleanupManager = new AlertManager(config);
      
      const alert = cleanupManager.createAlert(createMockAlert());
      
      // Wait for auto-acknowledge
      await new Promise(resolve => setTimeout(resolve, 60));
      cleanupManager['performAutomaticCleanup']();
      
      let updated = cleanupManager.getAlert(alert.id);
      expect(updated?.acknowledged).toBe(true);
      expect(updated?.acknowledgedBy).toBe('system');
      
      // Wait for auto-resolve
      await new Promise(resolve => setTimeout(resolve, 110));
      cleanupManager['performAutomaticCleanup']();
      
      updated = cleanupManager.getAlert(alert.id);
      expect(updated?.status).toBe('resolved');
      
      cleanupManager.destroy();
    });
  });

  describe('Statistics and Analytics', () => {
    beforeEach(() => {
      // Create diverse test data
      alertManager.createAlert(createMockAlert({ level: 'info', type: 'system' }));
      const alert2 = alertManager.createAlert(createMockAlert({ level: 'warning', type: 'stream' }));
      const alert3 = alertManager.createAlert(createMockAlert({ level: 'error', type: 'system' }));
      
      alertManager.acknowledgeAlert(alert2.id);
      alertManager.resolveAlert(alert3.id);
    });

    it('should get statistics', () => {
      const stats = alertManager.getStatistics();
      
      expect(stats.totalEntries).toBeGreaterThan(0);
      expect(stats.uniqueAlerts).toBe(3);
      expect(stats.levelCounts.info).toBeGreaterThan(0);
      expect(stats.levelCounts.warning).toBeGreaterThan(0);
      expect(stats.levelCounts.error).toBeGreaterThan(0);
    });

    it('should get recent activity', () => {
      const activity = alertManager.getRecentActivity(24);
      
      expect(activity.totalAlerts).toBeGreaterThan(0);
      expect(activity.newAlerts).toBe(3);
      expect(activity.acknowledgedAlerts).toBe(1);
      expect(activity.resolvedAlerts).toBe(1);
    });
  });

  describe('Data Export/Import', () => {
    beforeEach(() => {
      alertManager.createAlert(createMockAlert({ title: 'Export Test 1' }));
      alertManager.createAlert(createMockAlert({ title: 'Export Test 2' }));
    });

    it('should export alerts as JSON', () => {
      const exported = alertManager.exportAlerts('json');
      const parsed = JSON.parse(exported);
      
      expect(parsed.version).toBe('1.0');
      expect(parsed.entries).toBeDefined();
      expect(Array.isArray(parsed.entries)).toBe(true);
    });

    it('should export alerts as CSV', () => {
      const exported = alertManager.exportAlerts('csv');
      const lines = exported.split('\n');
      
      expect(lines[0]).toContain('Timestamp'); // Header
      expect(lines.length).toBeGreaterThan(1); // Header + data
    });

    it('should import alerts', () => {
      const exported = alertManager.exportAlerts('json');
      alertManager.clearAllAlerts();
      
      const result = alertManager.importAlerts(exported, 'json', false);
      expect(result.imported).toBeGreaterThan(0);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Integration with Sub-managers', () => {
    it('should provide access to rule manager', () => {
      const ruleManager = alertManager.getRuleManager();
      expect(ruleManager).toBeDefined();
      expect(typeof ruleManager.addRule).toBe('function');
    });

    it('should provide access to history manager', () => {
      const historyManager = alertManager.getHistoryManager();
      expect(historyManager).toBeDefined();
      expect(typeof historyManager.getHistory).toBe('function');
    });

    it('should forward rule triggered events', (done) => {
      alertManager.on('rule:triggered', (data) => {
        expect(data).toBeDefined();
        done();
      });

      // Trigger rule manager event
      const ruleManager = alertManager.getRuleManager();
      ruleManager.emit('rule:triggered', { 
        rule: { id: 'test' },
        result: { 
          ruleId: 'test',
          triggered: true,
          alert: createMockAlert(),
          context: { timestamp: Date.now() },
          evaluatedAt: Date.now()
        }
      });
    });
  });

  describe('Clear Operations', () => {
    beforeEach(() => {
      alertManager.createAlert(createMockAlert({ title: 'Alert 1' }));
      alertManager.createAlert(createMockAlert({ title: 'Alert 2' }));
      alertManager.createAlert(createMockAlert({ title: 'Alert 3' }));
    });

    it('should clear all alerts', () => {
      const count = alertManager.clearAllAlerts();
      
      expect(count).toBe(3);
      expect(alertManager.getAlerts()).toHaveLength(0);
    });

    it('should emit alert:all-cleared event', (done) => {
      alertManager.on('alert:all-cleared', (data) => {
        expect(data.count).toBe(3);
        done();
      });
      
      alertManager.clearAllAlerts();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid alert data gracefully', () => {
      // This should not throw
      expect(() => {
        alertManager.createAlert({} as any);
      }).not.toThrow();
    });

    it('should handle operations on non-existent alerts', () => {
      expect(alertManager.acknowledgeAlert('invalid')).toBe(false);
      expect(alertManager.resolveAlert('invalid')).toBe(false);
      expect(alertManager.ignoreAlert('invalid')).toBe(false);
      expect(alertManager.deleteAlert('invalid')).toBe(false);
      expect(alertManager.addAlertNotes('invalid', 'note')).toBe(false);
    });
  });

  describe('Start/Stop Edge Cases', () => {
    it('should handle multiple start calls', () => {
      alertManager.start();
      alertManager.start(); // Should not throw
      // Just verify no error is thrown
      expect(true).toBe(true);
    });

    it('should handle stop when not running', () => {
      alertManager.stop();
      alertManager.stop(); // Should not throw
      // Just verify no error is thrown
      expect(true).toBe(true);
    });
  });

  describe('Alert Acknowledgement Edge Cases', () => {
    it('should handle acknowledging already acknowledged alerts', () => {
      const alert = alertManager.createAlert(createMockAlert());
      
      // First acknowledgement should succeed
      expect(alertManager.acknowledgeAlert(alert.id, 'user1')).toBe(true);
      
      // Second acknowledgement should fail
      expect(alertManager.acknowledgeAlert(alert.id, 'user2')).toBe(false);
    });

    it('should handle resolving already resolved alerts', () => {
      const alert = alertManager.createAlert(createMockAlert());
      
      // First resolution should succeed
      expect(alertManager.resolveAlert(alert.id, 'user1')).toBe(true);
      
      // Second resolution should fail
      expect(alertManager.resolveAlert(alert.id, 'user2')).toBe(false);
    });
  });

  describe('Evaluation and Cleanup', () => {
    it('should handle evaluation when no alerts exist', () => {
      // Should not throw when evaluating empty alert list
      expect(() => {
        (alertManager as any).evaluateAlerts();
      }).not.toThrow();
    });

    it('should handle cleanup with different alert states', () => {
      alertManager.createAlert(createMockAlert({ title: 'Active Alert' }));
      const alert2 = alertManager.createAlert(createMockAlert({ title: 'Resolved Alert' }));
      
      // Resolve one alert
      alertManager.resolveAlert(alert2.id);
      
      // Should not throw during cleanup
      expect(() => {
        (alertManager as any).performAutomaticCleanup();
      }).not.toThrow();
    });
  });

  describe('Memory Limits and Cleanup', () => {
    it('should handle memory limit edge cases', () => {
      const config = createMockConfig({ 
        maxAlertsInMemory: 2,
        autoResolveTimeout: 100 // Very short timeout
      });
      const limitedManager = new AlertManager(config);
      
      // Create alerts beyond limit
      const alert1 = limitedManager.createAlert(createMockAlert({ title: 'Alert 1' }));
      limitedManager.createAlert(createMockAlert({ title: 'Alert 2' }));
      
      // Acknowledge one to test priority removal
      limitedManager.acknowledgeAlert(alert1.id);
      
      // Add third alert - should trigger cleanup
      limitedManager.createAlert(createMockAlert({ title: 'Alert 3' }));
      
      const remaining = limitedManager.getAlerts();
      expect(remaining.length).toBeLessThanOrEqual(2);
      
      limitedManager.destroy();
    });
  });
});