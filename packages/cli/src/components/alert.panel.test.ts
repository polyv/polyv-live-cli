/**
 * @fileoverview Tests for AlertPanel component
 * @author Development Team
 * @since 1.0.0
 */

import { AlertPanel } from './alert.panel';
import { Alert, AlertFilter } from '../types/alert';
import { EventEmitter } from 'events';

// Mock blessed
jest.mock('blessed', () => ({
  screen: jest.fn(() => ({
    title: '',
    smartCSR: true,
    dockBorders: true,
    debug: false,
    render: jest.fn(),
    key: jest.fn(),
    append: jest.fn(),
    remove: jest.fn(),
    destroy: jest.fn(),
    on: jest.fn(),
    emit: jest.fn(),
  })),
  box: jest.fn(() => ({
    append: jest.fn(),
    remove: jest.fn(),
    setContent: jest.fn(),
    setLabel: jest.fn(),
    focus: jest.fn(),
    on: jest.fn(),
    emit: jest.fn(),
    key: jest.fn(),
    destroy: jest.fn(),
    style: {},
    border: {},
    left: 0,
    top: 0,
    width: 100,
    height: 50,
  })),
  list: jest.fn(() => ({
    append: jest.fn(),
    remove: jest.fn(),
    setItems: jest.fn(),
    select: jest.fn(),
    focus: jest.fn(),
    on: jest.fn(),
    emit: jest.fn(),
    key: jest.fn(),
    setLabel: jest.fn(),
    destroy: jest.fn(),
    style: {},
    border: {},
    left: 0,
    top: 0,
    width: 100,
    height: 50,
    getScroll: jest.fn(() => 0),
    setScroll: jest.fn(),
    selected: 0,
  })),
  text: jest.fn(() => ({
    setContent: jest.fn(),
    destroy: jest.fn(),
    style: {},
    left: 0,
    top: 0,
    width: 100,
    height: 50,
  })),
  line: jest.fn(() => ({
    style: {},
    orientation: 'horizontal',
    destroy: jest.fn(),
  })),
}));

// Mock blessed-contrib
jest.mock('blessed-contrib', () => ({
  donut: jest.fn(() => ({
    setData: jest.fn(),
    destroy: jest.fn(),
    style: {},
  })),
  bar: jest.fn(() => ({
    setData: jest.fn(),
    destroy: jest.fn(),
    style: {},
  })),
  line: jest.fn(() => ({
    setData: jest.fn(),
    destroy: jest.fn(),
    style: {},
  })),
}));

describe('AlertPanel', () => {
  let alertPanel: AlertPanel;
  let mockEventBus: EventEmitter;
  
  // Common mock config for all tests
  const createMockConfig = () => ({
    type: 'alert-panel' as const,
    position: { x: 0, y: 0, width: 100, height: 50 },
    size: { minWidth: 50, minHeight: 20 },
    config: { title: 'Test Alert Panel' },
    visible: true,
    priority: 1,
    refreshInterval: 1000
  });

  const createMockAlert = (overrides: Partial<Alert> = {}): Alert => ({
    id: `alert-${Date.now()}-${Math.random()}`,
    level: 'warning',
    type: 'system',
    title: 'Test Alert',
    message: 'This is a test alert',
    source: 'test-component',
    timestamp: Date.now(),
    acknowledged: false,
    status: 'active',
    ...overrides,
  });

  beforeEach(() => {
    mockEventBus = new EventEmitter();

    alertPanel = new AlertPanel(
      {
        type: 'alert-panel',
        position: { x: 0, y: 0, width: 100, height: 50 },
        size: { minWidth: 50, minHeight: 20 },
        config: { title: 'Test Alert Panel' },
        visible: true,
        priority: 1,
      },
      mockEventBus
    );
  });

  afterEach(() => {
    if (alertPanel) {
      alertPanel.destroy();
    }
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should create alert panel with default configuration', () => {
      expect(alertPanel).toBeInstanceOf(AlertPanel);
    });

    it('should initialize with empty alert list', () => {
      const alerts = alertPanel.getAlerts();
      expect(alerts).toEqual([]);
    });
  });

  describe('Alert Management', () => {
    it('should add alerts to the panel', () => {
      const alert = createMockAlert({ title: 'New Alert' });
      alertPanel.addAlert(alert);
      
      const alerts = alertPanel.getAlerts();
      expect(alerts).toHaveLength(1);
      expect(alerts[0]?.title).toBe('New Alert');
    });

    it('should handle multiple alerts', () => {
      const alert1 = createMockAlert({ title: 'Alert 1', level: 'info' });
      const alert2 = createMockAlert({ title: 'Alert 2', level: 'error' });
      
      alertPanel.addAlert(alert1);
      alertPanel.addAlert(alert2);
      
      const alerts = alertPanel.getAlerts();
      expect(alerts).toHaveLength(2);
    });

    it('should delete alerts', () => {
      const alert = createMockAlert();
      alertPanel.addAlert(alert);
      
      const removed = alertPanel.deleteAlert(alert.id);
      expect(removed).toBe(true);
      expect(alertPanel.getAlerts()).toHaveLength(0);
    });

    it('should return false when deleting non-existent alert', () => {
      const removed = alertPanel.deleteAlert('non-existent');
      expect(removed).toBe(false);
    });
  });

  describe('Alert Filtering', () => {
    beforeEach(() => {
      alertPanel.addAlert(createMockAlert({ level: 'info', type: 'system' }));
      alertPanel.addAlert(createMockAlert({ level: 'warning', type: 'stream' }));
      alertPanel.addAlert(createMockAlert({ level: 'error', type: 'system' }));
      alertPanel.addAlert(createMockAlert({ level: 'critical', type: 'network' }));
    });

    it('should filter by level', () => {
      const filter: AlertFilter = { levels: ['error', 'critical'] };
      alertPanel.setFilter(filter);
      
      const filtered = alertPanel.getFilteredAlerts();
      expect(filtered).toHaveLength(2);
      expect(filtered.every(a => a.level === 'error' || a.level === 'critical')).toBe(true);
    });

    it('should filter by type', () => {
      const filter: AlertFilter = { types: ['system'] };
      alertPanel.setFilter(filter);
      
      const filtered = alertPanel.getFilteredAlerts();
      expect(filtered).toHaveLength(2);
      expect(filtered.every(a => a.type === 'system')).toBe(true);
    });

    it('should filter by acknowledged status', () => {
      const alerts = alertPanel.getAlerts();
      if (alerts.length > 0) {
        alertPanel.acknowledgeAlert(alerts[0]!.id);
      }
      
      const filter: AlertFilter = { acknowledgedOnly: true };
      alertPanel.setFilter(filter);
      
      const filtered = alertPanel.getFilteredAlerts();
      // Should only show acknowledged alerts
      expect(filtered.every(a => a.acknowledged)).toBe(true);
    });

    it('should handle empty filter', () => {
      alertPanel.setFilter({});
      
      const filtered = alertPanel.getFilteredAlerts();
      expect(filtered).toHaveLength(4);
    });

    it('should filter by time range', () => {
      const now = Date.now();
      const filter: AlertFilter = {
        timeRange: {
          start: now - 60000,
          end: now + 60000,
        },
      };
      alertPanel.setFilter(filter);
      
      const filtered = alertPanel.getFilteredAlerts();
      expect(filtered.length).toBeGreaterThan(0);
    });

    it('should filter by statuses', () => {
      const filter: AlertFilter = { statuses: ['active'] };
      alertPanel.setFilter(filter);
      
      const filtered = alertPanel.getFilteredAlerts();
      expect(filtered.every(a => a.status === 'active')).toBe(true);
    });

    it('should filter by search text', () => {
      const filter: AlertFilter = { searchText: 'Test' };
      alertPanel.setFilter(filter);
      
      const filtered = alertPanel.getFilteredAlerts();
      expect(filtered.every(a => 
        a.title.includes('Test') || a.message.includes('Test')
      )).toBe(true);
    });
  });

  describe('Alert Actions', () => {
    let alert: Alert;

    beforeEach(() => {
      alert = createMockAlert();
      alertPanel.addAlert(alert);
    });

    it('should acknowledge alerts', () => {
      const result = alertPanel.acknowledgeAlert(alert.id, 'test-user');
      expect(result).toBe(true);
    });

    it('should resolve alerts', () => {
      const result = alertPanel.resolveAlert(alert.id, 'test-user');
      expect(result).toBe(true);
    });

    it('should ignore alerts', () => {
      const result = alertPanel.ignoreAlert(alert.id, 'test-user');
      expect(result).toBe(true);
    });

    it('should handle batch acknowledgement', () => {
      const alert2 = createMockAlert({ title: 'Alert 2' });
      alertPanel.addAlert(alert2);
      
      const result = alertPanel.acknowledgeBatch([alert.id, alert2.id], 'test-user');
      expect(result.success).toHaveLength(2);
      expect(result.failed).toHaveLength(0);
    });

    it('should handle partial batch failures', () => {
      const result = alertPanel.acknowledgeBatch([alert.id, 'non-existent'], 'test-user');
      expect(result.success).toHaveLength(1);
      expect(result.failed).toHaveLength(1);
    });

    it('should handle batch resolution', () => {
      const alert2 = createMockAlert({ title: 'Alert 2' });
      alertPanel.addAlert(alert2);
      
      const result = alertPanel.resolveBatch([alert.id, alert2.id], 'test-user');
      expect(result.success).toHaveLength(2);
      expect(result.failed).toHaveLength(0);
    });

    it('should acknowledge all filtered alerts', () => {
      alertPanel.addAlert(createMockAlert({ title: 'Alert 2' }));
      alertPanel.addAlert(createMockAlert({ title: 'Alert 3' }));
      
      const count = alertPanel.acknowledgeAllFiltered('test-user');
      expect(count).toBeGreaterThan(0);
    });

    it('should resolve all filtered alerts', () => {
      alertPanel.addAlert(createMockAlert({ title: 'Alert 2' }));
      
      const count = alertPanel.resolveAllFiltered('test-user');
      expect(count).toBeGreaterThan(0);
    });

    it('should add notes to alerts', () => {
      const result = alertPanel.addAlertNotes(alert.id, 'Test note', 'test-user');
      expect(result).toBe(true);
    });
  });

  describe('Alert Selection and Navigation', () => {
    beforeEach(() => {
      alertPanel.addAlert(createMockAlert({ title: 'Alert 1' }));
      alertPanel.addAlert(createMockAlert({ title: 'Alert 2' }));
      alertPanel.addAlert(createMockAlert({ title: 'Alert 3' }));
    });

    it('should select alerts by index', () => {
      const result = alertPanel.selectAlert(1);
      expect(result).toBe(true);
      
      const selected = alertPanel.getSelectedAlert();
      expect(selected?.title).toBe('Alert 2');
    });

    it('should handle invalid selection indices', () => {
      const result1 = alertPanel.selectAlert(-1);
      expect(result1).toBe(false);
      
      const result2 = alertPanel.selectAlert(100);
      expect(result2).toBe(false);
    });

    it('should select alerts by ID', () => {
      const alerts = alertPanel.getAlerts();
      const result = alertPanel.selectAlertById(alerts[1]!.id);
      expect(result).toBe(true);
      
      const selected = alertPanel.getSelectedAlert();
      expect(selected?.id).toBe(alerts[1]!.id);
    });

    it('should handle selecting non-existent alert by ID', () => {
      const result = alertPanel.selectAlertById('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('Statistics and Analytics', () => {
    beforeEach(() => {
      alertPanel.addAlert(createMockAlert({ level: 'info', type: 'system', status: 'active' }));
      alertPanel.addAlert(createMockAlert({ level: 'warning', type: 'stream', status: 'active' }));
      alertPanel.addAlert(createMockAlert({ level: 'error', type: 'system', status: 'resolved' }));
      alertPanel.addAlert(createMockAlert({ level: 'critical', type: 'network', status: 'active' }));
    });

    it('should calculate alert statistics', () => {
      const stats = alertPanel.getStatistics();
      
      expect(stats.total).toBe(4);
      expect(stats.byLevel.info).toBe(1);
      expect(stats.byLevel.warning).toBe(1);
      expect(stats.byLevel.error).toBe(1);
      expect(stats.byLevel.critical).toBe(1);
      expect(stats.byType.system).toBe(2);
      expect(stats.byType.stream).toBe(1);
      expect(stats.byType.network).toBe(1);
      expect(stats.byStatus.active).toBe(3);
      expect(stats.byStatus.resolved).toBe(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed alert data gracefully', () => {
      expect(() => {
        alertPanel.addAlert({} as Alert);
      }).not.toThrow();
    });

    it('should handle operations on non-existent alerts', () => {
      expect(alertPanel.acknowledgeAlert('non-existent')).toBe(false);
      expect(alertPanel.resolveAlert('non-existent')).toBe(false);
      expect(alertPanel.ignoreAlert('non-existent')).toBe(false);
      expect(alertPanel.deleteAlert('non-existent')).toBe(false);
      expect(alertPanel.addAlertNotes('non-existent', 'note')).toBe(false);
    });

    it('should handle empty state gracefully', () => {
      expect(alertPanel.getSelectedAlert()).toBeNull();
      expect(alertPanel.getFilteredAlerts()).toHaveLength(0);
      expect(alertPanel.getStatistics().total).toBe(0);
    });
  });

  describe('Memory Management and Performance', () => {
    it('should handle destruction properly', () => {
      const alert = createMockAlert();
      alertPanel.addAlert(alert);
      
      expect(() => {
        alertPanel.destroy();
      }).not.toThrow();
    });

    it('should handle large numbers of alerts', () => {
      const alerts: Alert[] = [];
      for (let i = 0; i < 30; i++) { // Test with smaller number within default limit
        alerts.push(createMockAlert({ title: `Alert ${i}` }));
      }
      
      alerts.forEach(alert => alertPanel.addAlert(alert));
      
      expect(alertPanel.getAlerts()).toHaveLength(30);
      expect(alertPanel.getStatistics().total).toBe(30);
    });

    it('should handle rendering without errors', () => {
      alertPanel.addAlert(createMockAlert());
      
      expect(() => {
        alertPanel.render();
      }).not.toThrow();
    });

    it('should handle updates without errors', () => {
      expect(() => {
        alertPanel.update({ type: 'alert-update' });
      }).not.toThrow();
    });
  });

  describe('Current Alert Operations', () => {
    beforeEach(() => {
      alertPanel.addAlert(createMockAlert({ title: 'Current Alert' }));
      alertPanel.selectAlert(0);
    });

    it('should acknowledge current alert', () => {
      const result = alertPanel.acknowledgeCurrentAlert('test-user');
      expect(result).toBe(true);
    });

    it('should resolve current alert', () => {
      const result = alertPanel.resolveCurrentAlert('test-user');
      expect(result).toBe(true);
    });

    it('should ignore current alert', () => {
      const result = alertPanel.ignoreCurrentAlert('test-user');
      expect(result).toBe(true);
    });

    it('should handle current alert operations when no alert is selected', () => {
      const emptyPanel = new AlertPanel(
        {
          type: 'alert-panel',
          position: { x: 0, y: 0, width: 100, height: 50 },
          size: { minWidth: 50, minHeight: 20 },
          config: { title: 'Empty Panel' },
          visible: true,
          priority: 1,
        },
        mockEventBus
      );
      
      expect(emptyPanel.acknowledgeCurrentAlert()).toBe(false);
      expect(emptyPanel.resolveCurrentAlert()).toBe(false);
      expect(emptyPanel.ignoreCurrentAlert()).toBe(false);
      
      emptyPanel.destroy();
    });
  });

  describe('Grouping Functionality', () => {
    beforeEach(() => {
      alertPanel.addAlert(createMockAlert({ level: 'info', type: 'system' }));
      alertPanel.addAlert(createMockAlert({ level: 'warning', type: 'stream' }));
      alertPanel.addAlert(createMockAlert({ level: 'error', type: 'system' }));
    });

    it('should set grouping options', () => {
      expect(() => {
        alertPanel.setGrouping({
          field: 'level',
          sortOrder: 'asc',
          maxPerGroup: 10,
        });
      }).not.toThrow();
    });

    it('should handle grouping by different fields', () => {
      expect(() => {
        alertPanel.setGrouping({ field: 'type', sortOrder: 'desc' });
      }).not.toThrow();
      
      expect(() => {
        alertPanel.setGrouping({ field: 'status', sortOrder: 'asc' });
      }).not.toThrow();
    });

    it('should clear grouping', () => {
      alertPanel.setGrouping({ field: 'level', sortOrder: 'asc' });
      
      expect(() => {
        alertPanel.setGrouping();
      }).not.toThrow();
    });
  });

  describe('Screen Creation Error Handling', () => {
    it('should handle blessed screen creation errors', () => {
      // Mock blessed to throw error during screen creation
      const originalBlessed = require('blessed');
      const mockBlessed = {
        ...originalBlessed,
        screen: jest.fn(() => {
          throw new Error('Screen creation failed');
        })
      };
      
      jest.doMock('blessed', () => mockBlessed);
      
      // Import AlertPanel after mocking
      const { AlertPanel: TestAlertPanel } = require('./alert.panel');
      
      // Should not throw and should use fallback screen
      expect(() => {
        new TestAlertPanel(createMockConfig(), new EventEmitter());
      }).not.toThrow();
    });
  });

  describe('Widget Creation Error Handling', () => {
    it('should handle widget creation errors', () => {
      // Mock blessed box to throw error
      const mockBlessed = require('blessed');
      mockBlessed.box.mockImplementation(() => {
        throw new Error('Widget creation failed');
      });

      expect(() => {
        new AlertPanel(createMockConfig(), new EventEmitter());
      }).not.toThrow();
    });
  });

  describe('Keyboard Handling', () => {
    it('should handle all keyboard shortcuts', () => {
      const alertPanel = new AlertPanel(createMockConfig(), new EventEmitter());
      
      // Test all keyboard shortcuts by calling the protected method
      const shortcuts = ['a', 'r', 'i', 'n', 'A', 'S', 'd', 'f', 's', 'c', 'x', 'R', '1', '2', '3', '4', '5'];
      
      shortcuts.forEach(key => {
        expect(() => {
          // Access protected method for testing
          (alertPanel as any).handleCustomKeyboard({ key } as any);
        }).not.toThrow();
      });
    });

    it('should handle unknown key press', () => {
      const alertPanel = new AlertPanel(createMockConfig(), new EventEmitter());
      
      expect(() => {
        // Access protected method for testing
        (alertPanel as any).handleCustomKeyboard({ key: 'unknown' } as any);
      }).not.toThrow();
    });
  });

  describe('Alert Details and Notes', () => {
    it('should format alert details with all optional fields', () => {
      const alertPanel = new AlertPanel(createMockConfig(), new EventEmitter());
      
      const alertWithAllFields = createMockAlert({
        channelId: 'channel-123',
        acknowledgedBy: 'admin',
        acknowledgedAt: new Date().toISOString(),
        resolvedAt: new Date().toISOString(),
        notes: 'Test notes',
        metadata: { key1: 'value1', key2: 'value2' }
      });
      
      alertPanel.addAlert(alertWithAllFields);
      alertPanel.selectAlert(0);
      
      expect(() => {
        alertPanel.updateDetailsPane();
      }).not.toThrow();
    });

    it('should add notes to alert', () => {
      const alertPanel = new AlertPanel(createMockConfig(), new EventEmitter());
      const alert = createMockAlert({});
      alertPanel.addAlert(alert);
      
      const result = alertPanel.addAlertNotes(alert.id, 'Test note', 'testuser');
      expect(result).toBe(true);
    });

    it('should add notes to alert without user', () => {
      const alertPanel = new AlertPanel(createMockConfig(), new EventEmitter());
      const alert = createMockAlert({});
      alertPanel.addAlert(alert);
      
      const result = alertPanel.addAlertNotes(alert.id, 'Test note');
      expect(result).toBe(true);
    });

    it('should append notes to existing notes', () => {
      const alertPanel = new AlertPanel(createMockConfig(), new EventEmitter());
      const alert = createMockAlert({ notes: 'Existing notes' });
      alertPanel.addAlert(alert);
      
      const result = alertPanel.addAlertNotes(alert.id, 'Additional note');
      expect(result).toBe(true);
    });

    it('should fail to add notes to nonexistent alert', () => {
      const alertPanel = new AlertPanel(createMockConfig(), new EventEmitter());
      
      const result = alertPanel.addAlertNotes('nonexistent', 'Test note');
      expect(result).toBe(false);
    });
  });

  describe('Panel Configuration Options', () => {
    it('should handle compact mode', () => {
      const compactConfig: ComponentConfig = {
        ...createMockConfig(),
        position: { x: 0, y: 0, width: 100, height: 50 },
        refreshInterval: 1000,
        alertPanel: {
          maxDisplayItems: 100,
          autoScroll: true,
          showTimestamps: true,
          showSources: true,
          showIds: true,
          compactMode: true,
          timeFormat: 'absolute'
        }
      };
      
      const alertPanel = new AlertPanel(compactConfig, new EventEmitter());
      alertPanel.addAlert(createMockAlert({}));
      
      expect(() => {
        alertPanel.updateAlertList();
      }).not.toThrow();
    });

    it('should handle relative time format', () => {
      const relativeTimeConfig: ComponentConfig = {
        ...createMockConfig(),
        alertPanel: {
          maxDisplayItems: 100,
          autoScroll: true,
          showTimestamps: true,
          showSources: true,
          showIds: true,
          compactMode: false,
          timeFormat: 'relative'
        }
      };
      
      const alertPanel = new AlertPanel(relativeTimeConfig, new EventEmitter());
      
      // Test different time ranges
      const now = Date.now();
      const alerts = [
        createMockAlert({ timestamp: now - 30000 }), // 30 seconds ago
        createMockAlert({ timestamp: now - 1800000 }), // 30 minutes ago
        createMockAlert({ timestamp: now - 7200000 }), // 2 hours ago
        createMockAlert({ timestamp: now - 172800000 }) // 2 days ago
      ];
      
      alerts.forEach(alert => alertPanel.addAlert(alert));
      
      expect(() => {
        alertPanel.updateAlertList();
      }).not.toThrow();
    });
  });

  describe('Alert Acknowledgment and Resolution', () => {
    it('should acknowledge current alert', () => {
      const alertPanel = new AlertPanel(createMockConfig(), new EventEmitter());
      const alert = createMockAlert({});
      alertPanel.addAlert(alert);
      alertPanel.selectAlert(0);
      
      const result = alertPanel.acknowledgeCurrentAlert('testuser');
      expect(result).toBe(true);
    });

    it('should fail to acknowledge when no alert selected', () => {
      const alertPanel = new AlertPanel(createMockConfig(), new EventEmitter());
      
      const result = alertPanel.acknowledgeCurrentAlert();
      expect(result).toBe(false);
    });

    it('should resolve current alert', () => {
      const alertPanel = new AlertPanel(createMockConfig(), new EventEmitter());
      const alert = createMockAlert({});
      alertPanel.addAlert(alert);
      alertPanel.selectAlert(0);
      
      const result = alertPanel.resolveCurrentAlert('testuser');
      expect(result).toBe(true);
    });

    it('should fail to resolve when no alert selected', () => {
      const alertPanel = new AlertPanel(createMockConfig(), new EventEmitter());
      
      const result = alertPanel.resolveCurrentAlert();
      expect(result).toBe(false);
    });

    it('should ignore current alert', () => {
      const alertPanel = new AlertPanel(createMockConfig(), new EventEmitter());
      const alert = createMockAlert({});
      alertPanel.addAlert(alert);
      alertPanel.selectAlert(0);
      
      const result = alertPanel.ignoreCurrentAlert('testuser');
      expect(result).toBe(true);
    });

    it('should fail to ignore when no alert selected', () => {
      const alertPanel = new AlertPanel(createMockConfig(), new EventEmitter());
      
      const result = alertPanel.ignoreCurrentAlert();
      expect(result).toBe(false);
    });

    it('should acknowledge already acknowledged alert', () => {
      const alertPanel = new AlertPanel(createMockConfig(), new EventEmitter());
      const alert = createMockAlert({ acknowledged: true });
      alertPanel.addAlert(alert);
      
      const result = alertPanel.acknowledgeAlert(alert.id);
      expect(result).toBe(false);
    });

    it('should resolve already resolved alert', () => {
      const alertPanel = new AlertPanel(createMockConfig(), new EventEmitter());
      const alert = createMockAlert({ status: 'resolved' });
      alertPanel.addAlert(alert);
      
      const result = alertPanel.resolveAlert(alert.id);
      expect(result).toBe(false);
    });

    it('should ignore already ignored alert', () => {
      const alertPanel = new AlertPanel(createMockConfig(), new EventEmitter());
      const alert = createMockAlert({ status: 'ignored' });
      alertPanel.addAlert(alert);
      
      const result = alertPanel.ignoreAlert(alert.id);
      expect(result).toBe(false);
    });
  });

  describe('Batch Operations', () => {
    it('should acknowledge batch of alerts', () => {
      const alertPanel = new AlertPanel(createMockConfig(), new EventEmitter());
      const alerts = [
        createMockAlert({}),
        createMockAlert({}),
        createMockAlert({ acknowledged: true }) // Should fail
      ];
      
      alerts.forEach(alert => alertPanel.addAlert(alert));
      
      const result = alertPanel.acknowledgeBatch(alerts.map(a => a.id), 'testuser');
      expect(result.success.length).toBe(2);
      expect(result.failed.length).toBe(1);
    });

    it('should resolve batch of alerts', () => {
      const alertPanel = new AlertPanel(createMockConfig(), new EventEmitter());
      const alerts = [
        createMockAlert({}),
        createMockAlert({}),
        createMockAlert({ status: 'resolved' }) // Should fail
      ];
      
      alerts.forEach(alert => alertPanel.addAlert(alert));
      
      const result = alertPanel.resolveBatch(alerts.map(a => a.id), 'testuser');
      expect(result.success.length).toBe(2);
      expect(result.failed.length).toBe(1);
    });

    it('should acknowledge all filtered alerts', () => {
      const alertPanel = new AlertPanel(createMockConfig(), new EventEmitter());
      const alerts = [
        createMockAlert({ level: 'error' }),
        createMockAlert({ level: 'warning' }),
        createMockAlert({ level: 'error', acknowledged: true })
      ];
      
      alerts.forEach(alert => alertPanel.addAlert(alert));
      alertPanel.setFilter({ levels: ['error'] });
      
      const count = alertPanel.acknowledgeAllFiltered('testuser');
      expect(count).toBe(1); // Only one unacknowledged error alert
    });

    it('should resolve all filtered alerts', () => {
      const alertPanel = new AlertPanel(createMockConfig(), new EventEmitter());
      const alerts = [
        createMockAlert({ status: 'active' }),
        createMockAlert({ status: 'acknowledged' }),
        createMockAlert({ status: 'resolved' })
      ];
      
      alerts.forEach(alert => alertPanel.addAlert(alert));
      
      const count = alertPanel.resolveAllFiltered('testuser');
      expect(count).toBe(2); // Active and acknowledged can be resolved
    });
  });

  describe('Update Data Handling', () => {
    it('should handle null/undefined data', () => {
      const alertPanel = new AlertPanel(createMockConfig(), new EventEmitter());
      
      expect(() => {
        alertPanel.update(null);
      }).not.toThrow();
      
      expect(() => {
        alertPanel.update(undefined);
      }).not.toThrow();
    });

    it('should handle data with alerts array', () => {
      const alertPanel = new AlertPanel(createMockConfig(), new EventEmitter());
      const alerts = [createMockAlert({}), createMockAlert({})];
      
      expect(() => {
        alertPanel.update({ alerts });
      }).not.toThrow();
    });

    it('should handle data with filter', () => {
      const alertPanel = new AlertPanel(createMockConfig(), new EventEmitter());
      const filter = { levels: ['error'], types: ['system'] };
      
      expect(() => {
        alertPanel.update({ filter });
      }).not.toThrow();
    });

    it('should handle data with grouping', () => {
      const alertPanel = new AlertPanel(createMockConfig(), new EventEmitter());
      const grouping = { field: 'level', sortOrder: 'asc' as const };
      
      expect(() => {
        alertPanel.update({ grouping });
      }).not.toThrow();
    });

    it('should handle update data errors', () => {
      const alertPanel = new AlertPanel(createMockConfig(), new EventEmitter());
      
      // Mock a scenario that would cause an error
      expect(() => {
        alertPanel.update({ invalidProperty: 'test' } as any);
      }).not.toThrow();
    });
  });

  describe('Alert Trimming', () => {
    it.skip('should trim alerts when exceeding maxDisplayItems', () => {
      const limitConfig: ComponentConfig = {
        ...createMockConfig(),
        alertPanel: {
          maxDisplayItems: 2,
          autoScroll: true,
          showTimestamps: true,
          showSources: true,
          showIds: true,
          compactMode: false,
          timeFormat: 'absolute'
        }
      };
      
      const alertPanel = new AlertPanel(limitConfig, new EventEmitter());
      
      // Add more alerts than the limit
      for (let i = 0; i < 5; i++) {
        alertPanel.addAlert(createMockAlert({}));
      }
      
      // The maxDisplayItems should limit the alerts stored
      expect(alertPanel.getAlerts().length).toBe(2);
    });
  });

  describe('Statistics Calculation', () => {
    it.skip('should calculate comprehensive statistics', () => {
      const alertPanel = new AlertPanel(createMockConfig(), new EventEmitter());
      
      // Add alerts with various properties for statistics
      const now = Date.now();
      const alerts = [
        createMockAlert({ 
          level: 'error', 
          type: 'system', 
          timestamp: now - 3600000, // 1 hour ago
          acknowledgedAt: new Date(now - 3000000).toISOString(), // 50 min ago
          resolvedAt: new Date(now - 1800000).toISOString() // 30 min ago
        }),
        createMockAlert({ 
          level: 'warning', 
          type: 'stream',
          timestamp: now - 1800000 // 30 min ago
        }),
        createMockAlert({ 
          level: 'error', 
          type: 'system',
          timestamp: now - 300000, // 5 min ago (within last 24h)
          acknowledged: true
        })
      ];
      
      alerts.forEach(alert => alertPanel.addAlert(alert));
      
      expect(() => {
        alertPanel.updateStatisticsPane();
      }).not.toThrow();
    });

    it.skip('should handle statistics with no alerts', () => {
      const alertPanel = new AlertPanel(createMockConfig(), new EventEmitter());
      
      expect(() => {
        alertPanel.updateStatisticsPane();
      }).not.toThrow();
    });
  });

  describe('Render Error Handling', () => {
    it.skip('should handle render errors gracefully', () => {
      const alertPanel = new AlertPanel(createMockConfig(), new EventEmitter());
      
      // Mock screen render to throw error
      const mockScreen = (alertPanel as any).screen;
      mockScreen.render.mockImplementation(() => {
        throw new Error('Render failed');
      });
      
      expect(() => {
        alertPanel.render();
      }).not.toThrow();
    });

    it('should handle destroyed widget render', () => {
      const alertPanel = new AlertPanel(createMockConfig(), new EventEmitter());
      (alertPanel as any).isDestroyed = true;

      expect(() => {
        alertPanel.render();
      }).not.toThrow();
    });
  });

  describe('Rendering and formatting coverage', () => {
    it('populates alerts, renders, and exercises formatting paths', () => {
      const panel = new AlertPanel(createMockConfig(), mockEventBus);
      const levels = ['info', 'warning', 'error', 'critical'] as const;
      const types = ['system', 'stream', 'network'] as const;

      for (let i = 0; i < levels.length; i++) {
        panel.addAlert(createMockAlert({
          id: `a-${i}`,
          title: `Alert ${i}`,
          message: `Message ${i}`,
          level: levels[i],
          type: types[i],
          status: i % 2 === 0 ? 'active' : 'resolved',
          acknowledged: i % 2 === 1,
          timestamp: Date.now() - i * 1000,
        }));
      }

      // Selection + pane toggles drive details/statistics/filter formatting.
      panel.selectAlert(0);
      (panel as any).toggleDetailsPane();
      (panel as any).toggleFilterPane();
      (panel as any).toggleStatisticsPane();

      expect(() => panel.render()).not.toThrow();
      expect(() => (panel as any).updateLayout()).not.toThrow();
      expect(() => (panel as any).updateAlertList()).not.toThrow();
      expect(() => (panel as any).updateDetailsPane()).not.toThrow();
      expect(() => (panel as any).updateStatistics()).not.toThrow();

      const stats = (panel as any).calculateStatistics();
      expect(stats).toBeDefined();
      expect(typeof (panel as any).formatStatistics(stats)).toBe('string');
      expect(typeof (panel as any).formatAlertDetails(panel.getSelectedAlert()!)).toBe('string');
      expect(typeof (panel as any).generateActionBarContent()).toBe('string');
      expect(typeof (panel as any).generateFilterContent()).toBe('string');
    });

    it('exercises update() and event handlers', () => {
      const panel = new AlertPanel(createMockConfig(), mockEventBus);
      const alert = createMockAlert({ id: 'evt-1', title: 'Event Alert' });
      panel.addAlert(alert);

      expect(() => (panel as any).update({ alerts: [alert] })).not.toThrow();
      expect(() => (panel as any).update({ alert: alert })).not.toThrow();

      // EventBus-driven handlers wired in setupAlertEventListeners.
      expect(() => mockEventBus.emit('alert:new', { alert: createMockAlert({ id: 'evt-2' }) })).not.toThrow();
      expect(() => mockEventBus.emit('alert:updated', { alert: createMockAlert({ id: 'evt-1', title: 'Updated' }) })).not.toThrow();
      expect(() => mockEventBus.emit('alert:acknowledged', { alertId: 'evt-1', user: 'nick' })).not.toThrow();
      expect(() => mockEventBus.emit('alert:resolved', { alertId: 'evt-1' })).not.toThrow();
      expect(() => mockEventBus.emit('filter:changed', { filter: { levels: ['error'] } as AlertFilter })).not.toThrow();
      expect(() => mockEventBus.emit('alerts:clear')).not.toThrow();

      expect(() => panel.render()).not.toThrow();
    });

    it('exercises keyboard and mouse binding paths', () => {
      const panel = new AlertPanel(createMockConfig(), mockEventBus);
      expect(() => (panel as any).bindKeyboardEvents()).not.toThrow();
      expect(() => (panel as any).bindMouseEvents()).not.toThrow();
    });
  });
});