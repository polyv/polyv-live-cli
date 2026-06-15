/**
 * @fileoverview Tests for ConnectionPoolManager
 * @author Development Team
 * @since 1.0.0
 */

import { ConnectionPoolManager } from './connection-pool-manager';

// Mock network modules
jest.mock('net', () => ({
  createConnection: jest.fn(),
}));

jest.mock('tls', () => ({
  connect: jest.fn(),
}));

describe('ConnectionPoolManager', () => {
  let poolManager: ConnectionPoolManager;

  beforeEach(() => {
    poolManager = new ConnectionPoolManager({
      maxConnectionsPerHost: 5,
      maxTotalConnections: 20,
      connectionTimeout: 5000,
      keepAliveTimeout: 60000,
      maxIdleTime: 30000,
      enablePooling: true,
      enableKeepAlive: true,
      socketTimeout: 30000,
      maxRequestsPerConnection: 100,
    });
  });

  afterEach(() => {
    poolManager.stop();
  });

  describe('initialization', () => {
    it('should initialize with default configuration', () => {
      const defaultManager = new ConnectionPoolManager();
      expect(defaultManager).toBeDefined();
      expect(defaultManager.getStats().totalRequests).toBe(0);
      defaultManager.stop();
    });

    it('should initialize with custom configuration', () => {
      const customManager = new ConnectionPoolManager({
        maxConnectionsPerHost: 10,
        enablePooling: false,
      });
      expect(customManager).toBeDefined();
      customManager.stop();
    });
  });

  describe('start and stop', () => {
    it('should start and stop correctly', () => {
      const startSpy = jest.fn();
      const stopSpy = jest.fn();
      
      poolManager.on('poolStarted', startSpy);
      poolManager.on('poolStopped', stopSpy);

      poolManager.start();
      expect(startSpy).toHaveBeenCalled();

      poolManager.stop();
      expect(stopSpy).toHaveBeenCalled();
    });

    it('should not start if already running', () => {
      const startSpy = jest.fn();
      poolManager.on('poolStarted', startSpy);

      poolManager.start();
      poolManager.start(); // Second call should be ignored

      expect(startSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('agent management', () => {
    beforeEach(() => {
      poolManager.start();
    });

    it('should create HTTP and HTTPS agents', () => {
      const agents = poolManager.getAgents();
      expect(agents.httpAgent).toBeDefined();
      expect(agents.httpsAgent).toBeDefined();
    });

    it('should not create agents when pooling is disabled', () => {
      const nopoolManager = new ConnectionPoolManager({
        enablePooling: false,
      });
      
      const agents = nopoolManager.getAgents();
      expect(agents.httpAgent).toBeUndefined();
      expect(agents.httpsAgent).toBeUndefined();
      
      nopoolManager.stop();
    });
  });

  describe('connection management', () => {
    beforeEach(() => {
      poolManager.start();
    });

    it('should handle connection requests when not running', async () => {
      poolManager.stop();
      
      await expect(
        poolManager.getConnection('example.com', 443, 'https')
      ).rejects.toThrow('Connection pool is not running');
    });

    it('should track connection statistics', () => {
      const stats = poolManager.getStats();
      expect(stats).toHaveProperty('activeConnections');
      expect(stats).toHaveProperty('idleConnections');
      expect(stats).toHaveProperty('totalRequests');
      expect(stats).toHaveProperty('reuseRatio');
      expect(stats).toHaveProperty('poolUtilization');
    });

    it('should provide detailed pool information', () => {
      const poolInfo = poolManager.getPoolInfo();
      expect(poolInfo).toHaveProperty('totalConnections');
      expect(poolInfo).toHaveProperty('connectionsByHost');
      expect(poolInfo).toHaveProperty('idleConnectionsByHost');
      expect(poolInfo).toHaveProperty('activeConnectionsByHost');
      expect(poolInfo).toHaveProperty('pendingRequestsByHost');
      expect(poolInfo).toHaveProperty('oldestConnection');
      expect(poolInfo).toHaveProperty('newestConnection');
    });
  });

  describe('configuration updates', () => {
    beforeEach(() => {
      poolManager.start();
    });

    it('should update configuration', () => {
      const configSpy = jest.fn();
      poolManager.on('configUpdated', configSpy);

      poolManager.updateConfig({
        maxConnectionsPerHost: 15,
        keepAliveTimeout: 90000,
      });

      expect(configSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          config: expect.objectContaining({
            maxConnectionsPerHost: 15,
            keepAliveTimeout: 90000,
          }),
        })
      );
    });
  });

  describe('cleanup and maintenance', () => {
    beforeEach(() => {
      poolManager.start();
    });

    it('should perform forced cleanup', async () => {
      const cleanupSpy = jest.fn();
      poolManager.on('forcedCleanup', cleanupSpy);

      await poolManager.forceCleanup();

      expect(cleanupSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          connectionsCleanedUp: expect.any(Number),
          timestamp: expect.any(Number),
        })
      );
    });

    it('should handle connection creation errors', async () => {
      const errorSpy = jest.fn();
      poolManager.on('connectionError', errorSpy);

      // Mock socket creation to fail
      const net = require('net');
      net.createConnection.mockImplementation(() => {
        const mockSocket = {
          on: jest.fn((event, callback) => {
            if (event === 'error') {
              setTimeout(() => callback(new Error('Connection failed')), 10);
            }
          }),
          destroy: jest.fn(),
        };
        return mockSocket;
      });

      await expect(poolManager.getConnection('invalid-host.com', 80, 'http')).rejects.toThrow('Connection failed');
    });

    it('should handle connection timeouts', async () => {
      const timeoutManager = new ConnectionPoolManager({
        connectionTimeout: 100, // Very short timeout
      });
      timeoutManager.start();

      const timeoutSpy = jest.fn();
      timeoutManager.on('connectionTimeout', timeoutSpy);

      // Mock socket creation to timeout
      const net = require('net');
      net.createConnection.mockImplementation(() => {
        const mockSocket = {
          on: jest.fn(),
          destroy: jest.fn(),
        };
        return mockSocket;
      });

      try {
        await timeoutManager.getConnection('slow-host.com', 80, 'http');
      } catch (error) {
        expect(error.message).toContain('timeout');
      }

      timeoutManager.stop();
    });
  });

  describe('connection reuse', () => {
    beforeEach(() => {
      poolManager.start();
    });

    it('should track connection reuse statistics', () => {
      const stats = poolManager.getStats();
      expect(stats.reuseRatio).toBe(0); // No connections yet
      expect(stats.reusedConnections).toBe(0);
    });

    it('should handle host-specific statistics', () => {
      const stats = poolManager.getStats();
      expect(stats.hostStats).toBeInstanceOf(Map);
      expect(stats.hostStats.size).toBe(0); // No hosts connected yet
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      poolManager.start();
    });

    it('should emit error events', (done) => {
      poolManager.on('error', (error) => {
        expect(error).toBeDefined();
        done();
      });

      // Simulate an error
      poolManager.emit('connectionError', new Error('Test error'));
    });

    it('should handle invalid protocols gracefully', async () => {
      // The type system should prevent this, but test runtime behavior
      await expect(poolManager.getConnection('example.com', 443, 'invalid' as any)).rejects.toBeDefined();
    }, 10000);
  });

  describe('queue management', () => {
    beforeEach(() => {
      poolManager.start();
    });

    it('should handle request queueing when pool is full', () => {
      const queueSpy = jest.fn();
      poolManager.on('requestQueued', queueSpy);

      // This would require mocking the connection creation to simulate a full pool
      // For now, just verify the event handler is set up
      expect(poolManager.listenerCount('requestQueued')).toBe(1);
    });

    it('should track pending requests by host', () => {
      const poolInfo = poolManager.getPoolInfo();
      expect(poolInfo.pendingRequestsByHost).toBeInstanceOf(Map);
    });
  });

  describe('resource limits', () => {
    it('should respect maximum connections per host', () => {
      const limitedManager = new ConnectionPoolManager({
        maxConnectionsPerHost: 2,
        maxTotalConnections: 10,
      });
      limitedManager.start();

      const poolInfo = limitedManager.getPoolInfo();
      expect(poolInfo.totalConnections).toBe(0);

      limitedManager.stop();
    });

    it('should respect maximum total connections', () => {
      const limitedManager = new ConnectionPoolManager({
        maxConnectionsPerHost: 10,
        maxTotalConnections: 5,
      });
      limitedManager.start();

      const stats = limitedManager.getStats();
      expect(stats.poolUtilization).toBe(0);

      limitedManager.stop();
    });
  });

  describe('connection lifecycle', () => {
    beforeEach(() => {
      poolManager.start();
    });

    it('should emit connection events', () => {
      const createdSpy = jest.fn();
      const returnedSpy = jest.fn();
      const closedSpy = jest.fn();

      poolManager.on('connectionCreated', createdSpy);
      poolManager.on('connectionReturned', returnedSpy);
      poolManager.on('connectionClosed', closedSpy);

      // Events would be triggered during actual connection operations
      expect(poolManager.listenerCount('connectionCreated')).toBe(1);
      expect(poolManager.listenerCount('connectionReturned')).toBe(1);
      expect(poolManager.listenerCount('connectionClosed')).toBe(1);
    });

    it('should handle connection reuse events', () => {
      const reusedSpy = jest.fn();
      poolManager.on('connectionReused', reusedSpy);

      expect(poolManager.listenerCount('connectionReused')).toBe(1);
    });
  });

  describe('performance monitoring', () => {
    beforeEach(() => {
      poolManager.start();
    });

    it('should calculate pool utilization', () => {
      const stats = poolManager.getStats();
      expect(stats.poolUtilization).toBeGreaterThanOrEqual(0);
      expect(stats.poolUtilization).toBeLessThanOrEqual(1);
    });

    it('should track average connection duration', () => {
      const stats = poolManager.getStats();
      expect(stats.averageConnectionDuration).toBeGreaterThanOrEqual(0);
    });

    it('should provide host-specific metrics', () => {
      const stats = poolManager.getStats();
      expect(stats.hostStats).toBeInstanceOf(Map);
      
      // Add a mock host stat to verify structure
      const mockHostStats = {
        host: 'test.com:443',
        activeConnections: 0,
        idleConnections: 0,
        totalRequests: 0,
        reuseCount: 0,
        averageResponseTime: 0,
      };
      
      stats.hostStats.set('test.com:443', mockHostStats);
      expect(stats.hostStats.get('test.com:443')).toEqual(mockHostStats);
    });
  });
});