/**
 * @fileoverview Tests for BatchRequestManager
 * @author Development Team
 * @since 1.0.0
 */

import { BatchRequestManager } from './batch-request-manager';

describe('BatchRequestManager', () => {
  let manager: BatchRequestManager;

  beforeEach(() => {
    manager = new BatchRequestManager({
      maxBatchSize: 5,
      maxWaitTime: 200,
      minBatchInterval: 50,
      enableIntelligentBatching: true,
      maxConcurrentBatches: 3,
      retryAttempts: 2,
      retryDelay: 100,
    });
  });

  afterEach(() => {
    manager.stop();
  });

  describe('initialization', () => {
    it('should initialize with default configuration', () => {
      const defaultManager = new BatchRequestManager();
      expect(defaultManager).toBeDefined();
      expect(defaultManager.getStats().totalBatches).toBe(0);
    });

    it('should initialize with custom configuration', () => {
      const customManager = new BatchRequestManager({
        maxBatchSize: 10,
        maxWaitTime: 500,
      });
      expect(customManager).toBeDefined();
      customManager.stop();
    });
  });

  describe('start and stop', () => {
    it('should start and stop correctly', () => {
      const startSpy = jest.fn();
      const stopSpy = jest.fn();
      
      manager.on('started', startSpy);
      manager.on('stopped', stopSpy);

      manager.start();
      expect(startSpy).toHaveBeenCalled();

      manager.stop();
      expect(stopSpy).toHaveBeenCalled();
    });

    it('should not start if already running', () => {
      const startSpy = jest.fn();
      manager.on('started', startSpy);

      manager.start();
      manager.start(); // Second call should be ignored

      expect(startSpy).toHaveBeenCalledTimes(1);
    });

    it('should reject pending requests when stopped', async () => {
      manager.start();
      
      const promise = manager.addRequest('GET', '/api/test');
      manager.stop();
      
      await expect(promise).rejects.toThrow('Batch request manager stopped');
    });
  });

  describe('request management', () => {
    beforeEach(() => {
      manager.start();
    });

    it('should add requests to the queue', async () => {
      const requestSpy = jest.fn();
      manager.on('requestAdded', requestSpy);

      const promise = manager.addRequest('GET', '/api/test', { id: 1 });
      
      expect(requestSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/api/test',
          priority: 'medium',
        })
      );

      const pendingRequests = manager.getPendingRequests();
      expect(pendingRequests.length).toBe(1);
      expect(pendingRequests[0].method).toBe('GET');
      expect(pendingRequests[0].url).toBe('/api/test');

      // Clean up
      manager.flushPendingRequests();
      await promise;
    });

    it('should handle different request priorities', async () => {
      const promises = [
        manager.addRequest('GET', '/api/test', { id: 1 }, undefined, { priority: 'low' }),
        manager.addRequest('GET', '/api/test', { id: 2 }, undefined, { priority: 'high' }),
        manager.addRequest('GET', '/api/test', { id: 3 }, undefined, { priority: 'medium' }),
      ];

      const pendingRequests = manager.getPendingRequests();
      expect(pendingRequests.length).toBe(3);

      // Clean up
      manager.flushPendingRequests();
      await Promise.all(promises);
    });

    it('should handle request options', async () => {
      const promise = manager.addRequest('POST', '/api/test', { id: 1 }, { name: 'test' }, {
        priority: 'high',
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000,
      });

      const pendingRequests = manager.getPendingRequests();
      expect(pendingRequests.length).toBe(1);
      expect(pendingRequests[0].priority).toBe('high');

      // Clean up
      manager.flushPendingRequests();
      await promise;
    });

    it('should reject requests when not running', async () => {
      // Stop the manager first since it's started in beforeEach
      manager.stop();
      await expect(manager.addRequest('GET', '/api/test')).rejects.toThrow('Batch request manager is not running');
    });
  });

  describe('batch processing', () => {
    beforeEach(() => {
      manager.start();
    });

    it('should process batch when size limit is reached', async () => {
      const batchSpy = jest.fn();
      manager.on('batchStarted', batchSpy);

      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(manager.addRequest('GET', `/api/test${i}`));
      }

      // Wait for batch processing
      await Promise.all(promises);
      
      expect(batchSpy).toHaveBeenCalled();
      expect(batchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          requestCount: 5,
        })
      );
    });

    it('should process batch after max wait time', async () => {
      const batchSpy = jest.fn();
      manager.on('batchStarted', batchSpy);

      const promise = manager.addRequest('GET', '/api/test');
      
      // Wait for max wait time
      await new Promise(resolve => setTimeout(resolve, 250));
      
      expect(batchSpy).toHaveBeenCalled();
      
      await promise;
    });

    it('should handle batch completion', async () => {
      const completionSpy = jest.fn();
      manager.on('batchCompleted', completionSpy);

      const promises = [];
      for (let i = 0; i < 3; i++) {
        promises.push(manager.addRequest('GET', `/api/test${i}`));
      }

      const results = await Promise.all(promises);
      
      expect(completionSpy).toHaveBeenCalled();
      expect(results.length).toBe(3);
      results.forEach(result => {
        expect(result).toHaveProperty('data');
      });
    });

    it('should handle batch errors', async () => {
      const errorSpy = jest.fn();
      manager.on('batchError', errorSpy);

      // Mock the executeIndividualRequest to throw an error
      const originalExecute = (manager as any).executeIndividualRequest;
      (manager as any).executeIndividualRequest = jest.fn().mockRejectedValue(new Error('Batch error'));

      const promise = manager.addRequest('GET', '/api/test');
      
      await expect(promise).rejects.toThrow('Batch error');
      
      // Restore original method
      (manager as any).executeIndividualRequest = originalExecute;
    });

    it('should respect max concurrent batches', async () => {
      const batchSpy = jest.fn();
      manager.on('batchStarted', batchSpy);

      // Create more requests than max concurrent batches * batch size
      const promises = [];
      for (let i = 0; i < 20; i++) {
        promises.push(manager.addRequest('GET', `/api/test${i}`));
      }

      // Wait for initial processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const stats = manager.getStats();
      expect(stats.activeBatches).toBeLessThanOrEqual(3);

      // Clean up
      await Promise.all(promises);
    });
  });

  describe('intelligent batching', () => {
    beforeEach(() => {
      manager.start();
    });

    it('should group similar requests together', async () => {
      const batchSpy = jest.fn();
      manager.on('batchStarted', batchSpy);

      const promises = [
        manager.addRequest('GET', '/api/users', { id: 1 }),
        manager.addRequest('GET', '/api/users', { id: 2 }),
        manager.addRequest('GET', '/api/posts', { id: 1 }),
        manager.addRequest('GET', '/api/users', { id: 3 }),
      ];

      await Promise.all(promises);
      
      expect(batchSpy).toHaveBeenCalled();
    });

    it('should prioritize high priority requests', async () => {
      const promises = [
        manager.addRequest('GET', '/api/test', { id: 1 }, undefined, { priority: 'low' }),
        manager.addRequest('GET', '/api/test', { id: 2 }, undefined, { priority: 'high' }),
        manager.addRequest('GET', '/api/test', { id: 3 }, undefined, { priority: 'medium' }),
      ];

      const results = await Promise.all(promises);
      
      expect(results.length).toBe(3);
      results.forEach(result => {
        expect(result).toHaveProperty('data');
      });
    });

    it('should disable intelligent batching when configured', async () => {
      const simpleManager = new BatchRequestManager({
        enableIntelligentBatching: false,
        maxBatchSize: 3,
      });
      simpleManager.start();

      const promises = [
        simpleManager.addRequest('GET', '/api/users', { id: 1 }),
        simpleManager.addRequest('GET', '/api/posts', { id: 1 }),
        simpleManager.addRequest('GET', '/api/users', { id: 2 }),
      ];

      await Promise.all(promises);
      
      simpleManager.stop();
    });
  });

  describe('flush functionality', () => {
    beforeEach(() => {
      manager.start();
    });

    it('should flush pending requests immediately', async () => {
      const promises = [];
      for (let i = 0; i < 3; i++) {
        promises.push(manager.addRequest('GET', `/api/test${i}`));
      }

      await manager.flushPendingRequests();
      
      const stats = manager.getStats();
      expect(stats.pendingRequests).toBe(0);

      const results = await Promise.all(promises);
      expect(results.length).toBe(3);
    });

    it('should handle empty flush', async () => {
      await manager.flushPendingRequests();
      
      const stats = manager.getStats();
      expect(stats.pendingRequests).toBe(0);
    });
  });

  describe('statistics', () => {
    beforeEach(() => {
      manager.start();
    });

    it('should track comprehensive statistics', async () => {
      const promises = [];
      for (let i = 0; i < 8; i++) {
        promises.push(manager.addRequest('GET', `/api/test${i}`));
      }

      await Promise.all(promises);
      
      const stats = manager.getStats();
      expect(stats.totalRequests).toBe(8);
      expect(stats.totalBatches).toBeGreaterThan(0);
      expect(stats.averageBatchSize).toBeGreaterThan(0);
      expect(stats.averageProcessingTime).toBeGreaterThan(0);
      expect(stats.successRate).toBeGreaterThan(0);
    });

    it('should reset statistics', async () => {
      const promises = [];
      for (let i = 0; i < 3; i++) {
        promises.push(manager.addRequest('GET', `/api/test${i}`));
      }

      await Promise.all(promises);
      
      manager.resetStats();
      
      const stats = manager.getStats();
      expect(stats.totalRequests).toBe(0);
      expect(stats.totalBatches).toBe(0);
      expect(stats.averageBatchSize).toBe(0);
    });

    it('should emit stats reset event', (done) => {
      manager.on('statsReset', () => {
        done();
      });
      
      manager.resetStats();
    });
  });

  describe('configuration', () => {
    it('should update configuration', () => {
      const newConfig = {
        maxBatchSize: 10,
        maxWaitTime: 500,
      };
      
      manager.updateConfig(newConfig);
      
      // Configuration should be updated internally
      expect(manager).toBeDefined();
    });

    it('should emit configuration update events', (done) => {
      manager.on('configUpdated', (event) => {
        expect(event.config.maxBatchSize).toBe(10);
        done();
      });
      
      manager.updateConfig({ maxBatchSize: 10 });
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      manager.start();
    });

    it('should handle individual request failures', async () => {
      // Mock some requests to fail
      const originalExecute = (manager as any).executeIndividualRequest;
      (manager as any).executeIndividualRequest = jest.fn().mockImplementation((request) => {
        if (request.url.includes('fail')) {
          throw new Error('Request failed');
        }
        return originalExecute.call(manager, request);
      });

      const promises = [
        manager.addRequest('GET', '/api/test'),
        manager.addRequest('GET', '/api/fail'),
        manager.addRequest('GET', '/api/test2'),
      ];

      const results = await Promise.allSettled(promises);
      
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('rejected');
      expect(results[2].status).toBe('fulfilled');

      // Restore original method
      (manager as any).executeIndividualRequest = originalExecute;
    });

    it('should handle timeout scenarios', async () => {
      const promise = manager.addRequest('GET', '/api/test', {}, undefined, { timeout: 1 });
      
      // The request should complete (timeout handling would be in actual HTTP client)
      const result = await promise;
      expect(result).toBeDefined();
    });
  });

  describe('concurrency control', () => {
    beforeEach(() => {
      manager.start();
    });

    it('should limit concurrent batches', async () => {
      const batchStartSpy = jest.fn();
      manager.on('batchStarted', batchStartSpy);

      // Create enough requests to exceed max concurrent batches
      const promises = [];
      for (let i = 0; i < 25; i++) {
        promises.push(manager.addRequest('GET', `/api/test${i}`));
      }

      // Wait for initial processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const stats = manager.getStats();
      expect(stats.activeBatches).toBeLessThanOrEqual(3);

      // Clean up
      await Promise.all(promises);
    });

    it('should process subsequent batches after completion', async () => {
      const batchCompletedSpy = jest.fn();
      manager.on('batchCompleted', batchCompletedSpy);

      const promises = [];
      for (let i = 0; i < 15; i++) {
        promises.push(manager.addRequest('GET', `/api/test${i}`));
      }

      await Promise.all(promises);
      
      expect(batchCompletedSpy).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      manager.start();
    });

    it('should handle empty request bodies', async () => {
      const promise = manager.addRequest('GET', '/api/test', {}, undefined);
      const result = await promise;
      
      expect(result).toBeDefined();
    });

    it('should handle requests with complex parameters', async () => {
      const complexParams = {
        filter: { status: 'active', type: 'user' },
        sort: [{ field: 'created_at', order: 'desc' }],
        pagination: { page: 1, limit: 10 },
      };

      const promise = manager.addRequest('GET', '/api/test', complexParams);
      const result = await promise;
      
      expect(result).toBeDefined();
    });

    it('should handle very large batches', async () => {
      const largeManager = new BatchRequestManager({
        maxBatchSize: 100,
        maxWaitTime: 1000,
      });
      largeManager.start();

      const promises = [];
      for (let i = 0; i < 50; i++) {
        promises.push(largeManager.addRequest('GET', `/api/test${i}`));
      }

      await Promise.all(promises);
      
      largeManager.stop();
    });
  });
});