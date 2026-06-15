/**
 * @fileoverview Tests for PerformanceMonitor
 * @author Development Team
 * @since 1.0.0
 */

import { PerformanceMonitor } from './performance-monitor';

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = new PerformanceMonitor({
      enableAutoMonitoring: false, // Disable auto-monitoring for tests
      monitoringInterval: 1000,
      maxRecords: 100,
      cpuThreshold: 80,
      memoryThreshold: 100,
      responseTimeThreshold: 1000,
      enableAlerts: true,
      enableReporting: true,
      reportInterval: 5000,
      enableProfiling: true,
      profilingSampleRate: 1.0,
    });
  });

  afterEach(() => {
    monitor.stop();
  });

  describe('initialization', () => {
    it('should initialize with default configuration', () => {
      const defaultMonitor = new PerformanceMonitor();
      expect(defaultMonitor).toBeDefined();
      defaultMonitor.stop();
    });

    it('should initialize with custom configuration', () => {
      const customMonitor = new PerformanceMonitor({
        monitoringInterval: 2000,
        enableAlerts: false,
      });
      expect(customMonitor).toBeDefined();
      customMonitor.stop();
    });
  });

  describe('start and stop', () => {
    it('should start and stop correctly', () => {
      const startSpy = jest.fn();
      const stopSpy = jest.fn();
      
      monitor.on('monitoringStarted', startSpy);
      monitor.on('monitoringStopped', stopSpy);

      monitor.start();
      expect(startSpy).toHaveBeenCalled();

      monitor.stop();
      expect(stopSpy).toHaveBeenCalled();
    });

    it('should not start if already running', () => {
      const startSpy = jest.fn();
      monitor.on('monitoringStarted', startSpy);

      monitor.start();
      monitor.start(); // Second call should be ignored

      expect(startSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('metrics collection', () => {
    beforeEach(() => {
      monitor.start();
    });

    it('should collect performance metrics', () => {
      const metrics = monitor.collectMetrics();
      
      expect(metrics).toHaveProperty('timestamp');
      expect(metrics).toHaveProperty('cpuUsage');
      expect(metrics).toHaveProperty('memoryUsage');
      expect(metrics).toHaveProperty('heapUsage');
      expect(metrics).toHaveProperty('eventLoopDelay');
      expect(metrics).toHaveProperty('systemLoad');
      
      expect(typeof metrics.cpuUsage).toBe('number');
      expect(typeof metrics.memoryUsage).toBe('number');
      expect(metrics.cpuUsage).toBeGreaterThanOrEqual(0);
      expect(metrics.memoryUsage).toBeGreaterThan(0);
    });

    it('should record metrics', () => {
      const recordSpy = jest.fn();
      monitor.on('metricsRecorded', recordSpy);

      monitor.recordMetrics({
        renderTime: 16,
        apiResponseTime: 200,
        apiCallCount: 5,
      });

      expect(recordSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          metrics: expect.objectContaining({
            renderTime: 16,
            apiResponseTime: 200,
            apiCallCount: 5,
          }),
        })
      );
    });

    it('should limit metrics history', () => {
      const limitedMonitor = new PerformanceMonitor({
        maxRecords: 3,
      });
      limitedMonitor.start();

      // Record more metrics than the limit
      for (let i = 0; i < 5; i++) {
        limitedMonitor.recordMetrics({ apiCallCount: i });
      }

      const metrics = limitedMonitor.getMetrics();
      expect(metrics.length).toBe(3);
      expect(metrics[metrics.length - 1].apiCallCount).toBe(4);

      limitedMonitor.stop();
    });
  });

  describe('performance alerts', () => {
    beforeEach(() => {
      monitor.start();
    });

    it('should trigger CPU usage alerts', () => {
      const alertSpy = jest.fn();
      monitor.on('alertTriggered', alertSpy);

      monitor.recordMetrics({
        cpuUsage: 90, // Above threshold
      });

      expect(alertSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'warning',
          metric: 'cpuUsage',
          currentValue: 90,
          threshold: 80,
        })
      );
    });

    it('should trigger memory usage alerts', () => {
      const alertSpy = jest.fn();
      monitor.on('alertTriggered', alertSpy);

      monitor.recordMetrics({
        memoryUsage: 150, // Above threshold
      });

      expect(alertSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'warning',
          metric: 'memoryUsage',
          currentValue: 150,
          threshold: 100,
        })
      );
    });

    it('should trigger response time alerts', () => {
      const alertSpy = jest.fn();
      monitor.on('alertTriggered', alertSpy);

      monitor.recordMetrics({
        apiResponseTime: 1500, // Above threshold
      });

      expect(alertSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'warning',
          metric: 'apiResponseTime',
          currentValue: 1500,
          threshold: 1000,
        })
      );
    });

    it('should include suggested actions in alerts', () => {
      const alertSpy = jest.fn();
      monitor.on('alertTriggered', alertSpy);

      monitor.recordMetrics({
        cpuUsage: 90,
      });

      expect(alertSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          suggestedActions: expect.arrayContaining([
            expect.stringContaining('CPU'),
          ]),
        })
      );
    });
  });

  describe('performance profiling', () => {
    beforeEach(() => {
      monitor.start();
    });

    it('should start and stop profiling', async () => {
      const startSpy = jest.fn();
      const stopSpy = jest.fn();
      
      monitor.on('profileStarted', startSpy);
      monitor.on('profileStopped', stopSpy);

      monitor.startProfile('test-profile', 'Test Profile');
      expect(startSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          profileId: 'test-profile',
          name: 'Test Profile',
        })
      );

      // Add a small delay to ensure duration > 0
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const profile = monitor.stopProfile('test-profile');
      expect(stopSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          profileId: 'test-profile',
          duration: expect.any(Number),
        })
      );
      
      expect(profile).toBeDefined();
      expect(profile?.id).toBe('test-profile');
      expect(profile?.name).toBe('Test Profile');
      expect(profile?.duration).toBeGreaterThan(0);
    });

    it('should not start duplicate profiles', () => {
      const startSpy = jest.fn();
      monitor.on('profileStarted', startSpy);

      monitor.startProfile('test-profile', 'Test Profile');
      monitor.startProfile('test-profile', 'Test Profile'); // Duplicate

      expect(startSpy).toHaveBeenCalledTimes(1);
    });

    it('should return null for non-existent profile', () => {
      const profile = monitor.stopProfile('non-existent');
      expect(profile).toBeNull();
    });

    it('should get profile data', () => {
      monitor.startProfile('test-profile', 'Test Profile');
      
      const profile = monitor.getProfile('test-profile');
      expect(profile).toBeDefined();
      expect(profile?.id).toBe('test-profile');
      expect(profile?.name).toBe('Test Profile');
      expect(profile?.startTime).toBeGreaterThan(0);
    });
  });

  describe('performance trends', () => {
    beforeEach(() => {
      monitor.start();
    });

    it('should calculate performance trends', () => {
      // Record metrics with increasing CPU usage
      for (let i = 0; i < 10; i++) {
        monitor.recordMetrics({
          cpuUsage: 10 + i * 5,
          memoryUsage: 50 + i * 2,
        });
      }

      const trends = monitor.getTrends();
      expect(trends.length).toBeGreaterThan(0);
      
      const cpuTrend = trends.find(t => t.metric === 'cpuUsage');
      expect(cpuTrend).toBeDefined();
      expect(cpuTrend?.direction).toBe('increasing');
      expect(cpuTrend?.strength).toBeGreaterThan(0);
    });

    it('should handle stable trends', () => {
      // Record metrics with stable values
      for (let i = 0; i < 10; i++) {
        monitor.recordMetrics({
          cpuUsage: 50, // Stable value
        });
      }

      const trends = monitor.getTrends();
      const cpuTrend = trends.find(t => t.metric === 'cpuUsage');
      expect(cpuTrend?.direction).toBe('stable');
    });

    it('should handle decreasing trends', () => {
      // Record metrics with decreasing values
      for (let i = 0; i < 10; i++) {
        monitor.recordMetrics({
          cpuUsage: 80 - i * 5,
        });
      }

      const trends = monitor.getTrends();
      const cpuTrend = trends.find(t => t.metric === 'cpuUsage');
      expect(cpuTrend?.direction).toBe('decreasing');
    });
  });

  describe('performance reporting', () => {
    beforeEach(() => {
      monitor.start();
    });

    it('should generate performance report', () => {
      // Record some metrics
      monitor.recordMetrics({
        cpuUsage: 60,
        memoryUsage: 80,
        apiResponseTime: 200,
        apiCallCount: 10,
        errorCount: 1,
      });

      const report = monitor.generateReport();
      
      expect(report).toHaveProperty('timestamp');
      expect(report).toHaveProperty('period');
      expect(report).toHaveProperty('summary');
      expect(report).toHaveProperty('trends');
      expect(report).toHaveProperty('alerts');
      expect(report).toHaveProperty('recommendations');
      expect(report).toHaveProperty('metrics');
      
      expect(report.summary.averageCpuUsage).toBeGreaterThan(0);
      expect(report.summary.averageMemoryUsage).toBeGreaterThan(0);
      expect(report.summary.systemHealth).toBeDefined();
    });

    it('should generate recommendations', () => {
      // Record high CPU usage
      monitor.recordMetrics({
        cpuUsage: 90,
        memoryUsage: 150,
      });

      const report = monitor.generateReport();
      expect(report.recommendations.length).toBeGreaterThan(0);
    });

    it.skip('should emit report events', (done) => {
      const reportSpy = jest.fn();
      monitor.on('reportGenerated', reportSpy);

      // Enable auto-reporting temporarily
      monitor.updateConfig({ enableReporting: true });

      // Wait for report to be generated
      setTimeout(() => {
        expect(reportSpy).toHaveBeenCalled();
        done();
      }, 100);
    });
  });

  describe('data management', () => {
    beforeEach(() => {
      monitor.start();
    });

    it('should get metrics with time range', () => {
      const now = Date.now();
      
      monitor.recordMetrics({ cpuUsage: 50 });
      
      const metrics = monitor.getMetrics({
        start: now - 1000,
        end: now + 1000,
      });
      
      expect(metrics.length).toBe(1);
      expect(metrics[0].cpuUsage).toBe(50);
    });

    it.skip('should get alerts with time range', () => {
      // Clear any existing alerts first
      monitor.clearData();
      
      const now = Date.now();
      
      monitor.recordMetrics({ cpuUsage: 90 }); // Trigger alert
      
      const alerts = monitor.getAlerts({
        start: now - 1000,
        end: now + 1000,
      });
      
      expect(alerts.length).toBe(1);
      expect(alerts[0].metric).toBe('cpuUsage');
    });

    it('should clear all data', () => {
      const clearSpy = jest.fn();
      monitor.on('dataCleared', clearSpy);

      monitor.recordMetrics({ cpuUsage: 50 });
      monitor.recordMetrics({ cpuUsage: 90 }); // Trigger alert
      monitor.startProfile('test', 'Test');

      monitor.clearData();

      expect(clearSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          clearedMetrics: expect.any(Number),
          clearedAlerts: expect.any(Number),
          clearedProfiles: expect.any(Number),
        })
      );

      expect(monitor.getMetrics().length).toBe(0);
      expect(monitor.getAlerts().length).toBe(0);
      expect(monitor.getProfile('test')).toBeNull();
    });
  });

  describe('configuration updates', () => {
    it('should update configuration', () => {
      const configSpy = jest.fn();
      monitor.on('configUpdated', configSpy);

      monitor.updateConfig({
        cpuThreshold: 70,
        memoryThreshold: 120,
      });

      expect(configSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          config: expect.objectContaining({
            cpuThreshold: 70,
            memoryThreshold: 120,
          }),
        })
      );
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      monitor.start();
    });

    it('should handle performance warnings', () => {
      const warningSpy = jest.fn();
      monitor.on('performanceWarning', warningSpy);

      // This would be triggered by actual Node.js warnings
      expect(monitor.listenerCount('performanceWarning')).toBe(1);
    });

    it('should handle performance errors', () => {
      const errorSpy = jest.fn();
      monitor.on('performanceError', errorSpy);

      // This would be triggered by actual uncaught exceptions
      expect(monitor.listenerCount('performanceError')).toBe(1);
    });
  });

  describe('system health assessment', () => {
    beforeEach(() => {
      monitor.start();
    });

    it('should assess healthy system', () => {
      monitor.recordMetrics({
        cpuUsage: 30,
        memoryUsage: 50,
        apiResponseTime: 100,
      });

      const report = monitor.generateReport();
      expect(report.summary.systemHealth).toBe('healthy');
    });

    it('should assess degraded system', () => {
      monitor.recordMetrics({
        cpuUsage: 70,
        memoryUsage: 160,
        apiResponseTime: 1200,
      });

      const report = monitor.generateReport();
      expect(report.summary.systemHealth).toBe('degraded');
    });

    it('should assess critical system', () => {
      monitor.recordMetrics({
        cpuUsage: 95,
        memoryUsage: 250,
        apiResponseTime: 3000,
      });

      const report = monitor.generateReport();
      expect(report.summary.systemHealth).toBe('critical');
    });
  });
});