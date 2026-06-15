/**
 * @fileoverview Tests for ApiAnalytics
 * @author Development Team
 * @since 1.0.0
 */

import { ApiAnalytics } from './api-analytics';

describe('ApiAnalytics', () => {
  let analytics: ApiAnalytics;

  beforeEach(() => {
    analytics = new ApiAnalytics({
      enableDetailedTracking: true,
      maxRequestRecords: 100,
      analyticsWindow: 3600000,
      enablePerformanceMonitoring: true,
      enableErrorTracking: true,
      sampleRate: 1.0,
    });
  });

  afterEach(() => {
    analytics.stop();
  });

  describe('initialization', () => {
    it('should initialize with default configuration', () => {
      const defaultAnalytics = new ApiAnalytics();
      expect(defaultAnalytics).toBeDefined();
      defaultAnalytics.stop();
    });

    it('should initialize with custom configuration', () => {
      const customAnalytics = new ApiAnalytics({
        maxRequestRecords: 50,
        sampleRate: 0.5,
      });
      expect(customAnalytics).toBeDefined();
      customAnalytics.stop();
    });
  });

  describe('start and stop', () => {
    it('should start and stop correctly', () => {
      const startSpy = jest.fn();
      const stopSpy = jest.fn();
      
      analytics.on('analyticsStarted', startSpy);
      analytics.on('analyticsStopped', stopSpy);

      analytics.start();
      expect(startSpy).toHaveBeenCalled();

      analytics.stop();
      expect(stopSpy).toHaveBeenCalled();
    });

    it('should not start if already running', () => {
      const startSpy = jest.fn();
      analytics.on('analyticsStarted', startSpy);

      analytics.start();
      analytics.start(); // Second call should be ignored

      expect(startSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('request recording', () => {
    beforeEach(() => {
      analytics.start();
    });

    it('should record successful requests', () => {
      const recordSpy = jest.fn();
      analytics.on('requestRecorded', recordSpy);

      analytics.recordRequest('req1', 'GET', '/api/users', 150, {
        statusCode: 200,
        requestSize: 100,
        responseSize: 500,
        success: true,
        priority: 'medium',
      });

      expect(recordSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          record: expect.objectContaining({
            id: 'req1',
            method: 'GET',
            url: '/api/users',
            responseTime: 150,
            success: true,
          }),
        })
      );

      const stats = analytics.getOverallStats();
      expect(stats.totalRequests).toBe(1);
      expect(stats.successfulRequests).toBe(1);
    });

    it('should record failed requests', () => {
      analytics.recordRequest('req1', 'POST', '/api/users', 300, {
        statusCode: 500,
        success: false,
        error: 'Internal Server Error',
      });

      const stats = analytics.getOverallStats();
      expect(stats.totalRequests).toBe(1);
      expect(stats.failedRequests).toBe(1);
      expect(stats.successRate).toBe(0);
    });

    it('should handle different request methods', () => {
      analytics.recordRequest('req1', 'get', '/api/users', 100);
      analytics.recordRequest('req2', 'POST', '/api/users', 200);
      analytics.recordRequest('req3', 'PUT', '/api/users/1', 150);
      analytics.recordRequest('req4', 'DELETE', '/api/users/1', 80);

      const patterns = analytics.getUsagePatterns();
      expect(patterns.methodDistribution).toEqual({
        'GET': 1,
        'POST': 1,
        'PUT': 1,
        'DELETE': 1,
      });
    });

    it('should respect sampling rate', () => {
      const sampledAnalytics = new ApiAnalytics({ sampleRate: 0.0 });
      sampledAnalytics.start();

      sampledAnalytics.recordRequest('req1', 'GET', '/api/test', 100);
      
      const stats = sampledAnalytics.getOverallStats();
      expect(stats.totalRequests).toBe(0);

      sampledAnalytics.stop();
    });

    it('should not record when not running', () => {
      analytics.stop();
      
      analytics.recordRequest('req1', 'GET', '/api/test', 100);
      
      const stats = analytics.getOverallStats();
      expect(stats.totalRequests).toBe(0);
    });

    it('should limit maximum records', () => {
      const limitedAnalytics = new ApiAnalytics({ maxRequestRecords: 5 });
      limitedAnalytics.start();

      for (let i = 0; i < 10; i++) {
        limitedAnalytics.recordRequest(`req${i}`, 'GET', `/api/test${i}`, 100);
      }

      const stats = limitedAnalytics.getOverallStats();
      expect(stats.totalRequests).toBe(5); // Should be limited

      limitedAnalytics.stop();
    });
  });

  describe('endpoint statistics', () => {
    beforeEach(() => {
      analytics.start();
    });

    it('should track endpoint statistics', () => {
      analytics.recordRequest('req1', 'GET', '/api/users/123', 100, { success: true });
      analytics.recordRequest('req2', 'GET', '/api/users/456', 150, { success: true });
      analytics.recordRequest('req3', 'GET', '/api/users/789', 200, { success: false });

      const endpointStats = analytics.getEndpointStats();
      expect(endpointStats.length).toBe(1);
      
      const userStats = endpointStats[0];
      expect(userStats?.endpoint).toBe('/api/users/{id}');
      expect(userStats?.totalRequests).toBe(3);
      expect(userStats?.successfulRequests).toBe(2);
      expect(userStats?.failedRequests).toBe(1);
      expect(userStats?.successRate).toBeCloseTo(0.67, 2);
    });

    it('should normalize endpoint URLs', () => {
      analytics.recordRequest('req1', 'GET', '/api/users/123', 100);
      analytics.recordRequest('req2', 'GET', '/api/users/456', 150);
      analytics.recordRequest('req3', 'GET', '/api/posts/789', 200);

      const endpointStats = analytics.getEndpointStats();
      expect(endpointStats.length).toBe(2);
      expect(endpointStats.map(s => s.endpoint)).toContain('/api/users/{id}');
      expect(endpointStats.map(s => s.endpoint)).toContain('/api/posts/{id}');
    });

    it('should calculate response time statistics', () => {
      analytics.recordRequest('req1', 'GET', '/api/test', 100);
      analytics.recordRequest('req2', 'GET', '/api/test', 200);
      analytics.recordRequest('req3', 'GET', '/api/test', 300);

      const endpointStats = analytics.getEndpointStats();
      const testStats = endpointStats[0];
      
      expect(testStats?.averageResponseTime).toBe(200);
      expect(testStats?.minResponseTime).toBe(100);
      expect(testStats?.maxResponseTime).toBe(300);
    });
  });

  describe('performance metrics', () => {
    beforeEach(() => {
      analytics.start();
    });

    it('should calculate performance metrics', () => {
      // Record requests with various response times
      const responseTimes = [50, 100, 150, 200, 250, 300, 350, 400, 450, 500];
      responseTimes.forEach((rt, i) => {
        analytics.recordRequest(`req${i}`, 'GET', '/api/test', rt, {
          success: i < 8, // 80% success rate
          cached: i % 3 === 0, // 33% cache hit rate
          batched: i % 2 === 0, // 50% batch efficiency
        });
      });

      const metrics = analytics.getPerformanceMetrics();
      
      expect(metrics.averageResponseTime).toBe(275);
      expect(metrics.p95ResponseTime).toBe(500);
      expect(metrics.p99ResponseTime).toBe(500);
      expect(metrics.overallSuccessRate).toBe(0.8);
      expect(metrics.cacheHitRate).toBeCloseTo(0.4, 1);
      expect(metrics.batchEfficiency).toBe(0.5);
      expect(metrics.errorRate).toBeCloseTo(0.2, 1);
    });

    it('should handle empty metrics', () => {
      const metrics = analytics.getPerformanceMetrics();
      
      expect(metrics.averageResponseTime).toBe(0);
      expect(metrics.overallSuccessRate).toBe(0);
      expect(metrics.requestsPerSecond).toBe(0);
    });
  });

  describe('error analysis', () => {
    beforeEach(() => {
      analytics.start();
    });

    it('should analyze common errors', () => {
      analytics.recordRequest('req1', 'GET', '/api/users', 100, { 
        success: false, 
        error: 'Network timeout' 
      });
      analytics.recordRequest('req2', 'GET', '/api/posts', 150, { 
        success: false, 
        error: 'Network timeout' 
      });
      analytics.recordRequest('req3', 'GET', '/api/users', 200, { 
        success: false, 
        error: 'Invalid credentials' 
      });

      const errorAnalysis = analytics.getErrorAnalysis();
      
      expect(errorAnalysis.commonErrors.length).toBe(2);
      expect(errorAnalysis.commonErrors[0].error).toBe('Network timeout');
      expect(errorAnalysis.commonErrors[0].count).toBe(2);
      expect(errorAnalysis.commonErrors[0].percentage).toBeCloseTo(66.67, 2);
    });

    it('should analyze errors by endpoint', () => {
      analytics.recordRequest('req1', 'GET', '/api/users', 100, { success: true });
      analytics.recordRequest('req2', 'GET', '/api/users', 150, { 
        success: false, 
        error: 'Error' 
      });
      analytics.recordRequest('req3', 'GET', '/api/posts', 200, { 
        success: false, 
        error: 'Error' 
      });

      const errorAnalysis = analytics.getErrorAnalysis();
      
      expect(errorAnalysis.errorsByEndpoint.length).toBe(2);
      expect(errorAnalysis.errorsByEndpoint).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            endpoint: '/api/users',
            errorCount: 1,
            errorRate: 0.5,
          }),
          expect.objectContaining({
            endpoint: '/api/posts',
            errorCount: 1,
            errorRate: 1.0,
          }),
        ])
      );
    });

    it('should track error trends over time', () => {
      const now = Date.now();
      const hour = 3600000;

      // Mock timestamps for different hours
      jest.spyOn(Date, 'now')
        .mockReturnValueOnce(now - hour * 2)
        .mockReturnValueOnce(now - hour)
        .mockReturnValueOnce(now);

      analytics.recordRequest('req1', 'GET', '/api/test', 100, { success: false, error: 'Error' });
      analytics.recordRequest('req2', 'GET', '/api/test', 100, { success: true });
      analytics.recordRequest('req3', 'GET', '/api/test', 100, { success: false, error: 'Error' });

      const errorAnalysis = analytics.getErrorAnalysis();
      expect(errorAnalysis.errorTrends.length).toBeGreaterThan(0);

      jest.restoreAllMocks();
    });
  });

  describe('usage patterns', () => {
    beforeEach(() => {
      analytics.start();
    });

    it('should analyze peak hours', () => {
      const now = new Date();
      const currentHour = now.getHours();

      // Record requests at different hours
      for (let i = 0; i < 5; i++) {
        const timestamp = new Date(now);
        timestamp.setHours(currentHour);
        
        jest.spyOn(Date, 'now').mockReturnValue(timestamp.getTime());
        analytics.recordRequest(`req${i}`, 'GET', '/api/test', 100);
        jest.restoreAllMocks();
      }

      const patterns = analytics.getUsagePatterns();
      expect(patterns.peakHours.length).toBeGreaterThan(0);
      expect(patterns.peakHours[0].hour).toBe(currentHour);
      expect(patterns.peakHours[0].requestCount).toBe(5);
    });

    it('should analyze active endpoints', () => {
      analytics.recordRequest('req1', 'GET', '/api/users', 100);
      analytics.recordRequest('req2', 'GET', '/api/users', 150);
      analytics.recordRequest('req3', 'GET', '/api/posts', 200);

      const patterns = analytics.getUsagePatterns();
      
      expect(patterns.activeEndpoints.length).toBe(2);
      expect(patterns.activeEndpoints[0].endpoint).toBe('/api/users');
      expect(patterns.activeEndpoints[0].requestCount).toBe(2);
      expect(patterns.activeEndpoints[0].percentage).toBeCloseTo(66.67, 2);
    });

    it('should analyze caching statistics', () => {
      analytics.recordRequest('req1', 'GET', '/api/test', 100, { cached: true });
      analytics.recordRequest('req2', 'GET', '/api/test', 150, { cached: false });
      analytics.recordRequest('req3', 'POST', '/api/test', 200); // Not cacheable

      const patterns = analytics.getUsagePatterns();
      
      expect(patterns.cachingStats.cacheableRequests).toBe(2);
      expect(patterns.cachingStats.cacheHitRate).toBe(0.5);
      expect(patterns.cachingStats.cacheMissRate).toBe(0.5);
    });

    it('should analyze priority distribution', () => {
      analytics.recordRequest('req1', 'GET', '/api/test', 100, { priority: 'high' });
      analytics.recordRequest('req2', 'GET', '/api/test', 150, { priority: 'high' });
      analytics.recordRequest('req3', 'GET', '/api/test', 200, { priority: 'medium' });
      analytics.recordRequest('req4', 'GET', '/api/test', 250, { priority: 'low' });

      const patterns = analytics.getUsagePatterns();
      
      expect(patterns.priorityDistribution).toEqual({
        high: 2,
        medium: 1,
        low: 1,
      });
    });
  });

  describe('report generation', () => {
    beforeEach(() => {
      analytics.start();
    });

    it('should generate comprehensive report', () => {
      // Add some sample data
      analytics.recordRequest('req1', 'GET', '/api/users', 100, { success: true });
      analytics.recordRequest('req2', 'POST', '/api/orders', 200, { success: false, error: 'Error' });

      const report = analytics.generateReport();
      
      expect(report).toHaveProperty('summary');
      expect(report).toHaveProperty('performance');
      expect(report).toHaveProperty('errors');
      expect(report).toHaveProperty('usage');
      expect(report).toHaveProperty('endpoints');
      expect(report).toHaveProperty('generatedAt');
      
      expect(report.summary.totalRequests).toBe(2);
      expect(report.endpoints.length).toBe(2);
    });
  });

  describe('data management', () => {
    beforeEach(() => {
      analytics.start();
    });

    it('should clear all data', () => {
      analytics.recordRequest('req1', 'GET', '/api/test', 100);
      
      let stats = analytics.getOverallStats();
      expect(stats.totalRequests).toBe(1);

      const clearSpy = jest.fn();
      analytics.on('dataCleared', clearSpy);
      
      analytics.clearData();
      
      stats = analytics.getOverallStats();
      expect(stats.totalRequests).toBe(0);
      expect(clearSpy).toHaveBeenCalled();
    });

    it('should update configuration', () => {
      const updateSpy = jest.fn();
      analytics.on('configUpdated', updateSpy);
      
      analytics.updateConfig({
        maxRequestRecords: 200,
        sampleRate: 0.8,
      });
      
      expect(updateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          config: expect.objectContaining({
            maxRequestRecords: 200,
            sampleRate: 0.8,
          }),
        })
      );
    });
  });

  describe('periodic analytics', () => {
    beforeEach(() => {
      analytics.start();
    });

    it('should emit periodic analytics events', (done) => {
      analytics.on('periodicAnalytics', (event) => {
        expect(event.report).toBeDefined();
        expect(event.timestamp).toBeDefined();
        done();
      });

      // Trigger periodic analytics manually for testing
      (analytics as any).performPeriodicAnalytics();
    });
  });

  describe('time window filtering', () => {
    beforeEach(() => {
      analytics.start();
    });

    it('should filter records by time window', () => {
      const shortWindowAnalytics = new ApiAnalytics({
        analyticsWindow: 1000, // 1 second
      });
      shortWindowAnalytics.start();

      const now = Date.now();
      
      // Mock older timestamp
      jest.spyOn(Date, 'now').mockReturnValue(now - 2000);
      shortWindowAnalytics.recordRequest('req1', 'GET', '/api/old', 100);
      
      // Mock current timestamp
      jest.spyOn(Date, 'now').mockReturnValue(now);
      shortWindowAnalytics.recordRequest('req2', 'GET', '/api/new', 150);
      
      const stats = shortWindowAnalytics.getOverallStats();
      expect(stats.totalRequests).toBe(1); // Only recent request should count

      jest.restoreAllMocks();
      shortWindowAnalytics.stop();
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      analytics.start();
    });

    it('should handle requests with missing optional fields', () => {
      analytics.recordRequest('req1', 'GET', '/api/test', 100);
      
      const stats = analytics.getOverallStats();
      expect(stats.totalRequests).toBe(1);
      expect(stats.successfulRequests).toBe(1); // Default should be success
    });

    it('should handle zero response times', () => {
      analytics.recordRequest('req1', 'GET', '/api/test', 0);
      
      const metrics = analytics.getPerformanceMetrics();
      expect(metrics.averageResponseTime).toBe(0);
    });

    it('should handle very large response times', () => {
      analytics.recordRequest('req1', 'GET', '/api/test', 999999);
      
      const metrics = analytics.getPerformanceMetrics();
      expect(metrics.averageResponseTime).toBe(999999);
    });

    it('should handle URLs with query parameters', () => {
      analytics.recordRequest('req1', 'GET', '/api/users?page=1&limit=10', 100);
      analytics.recordRequest('req2', 'GET', '/api/users?page=2&limit=20', 150);

      const endpointStats = analytics.getEndpointStats();
      expect(endpointStats.length).toBe(1);
      expect(endpointStats[0].endpoint).toBe('/api/users');
      expect(endpointStats[0].totalRequests).toBe(2);
    });
  });
});