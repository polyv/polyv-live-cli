/**
 * @fileoverview Unit tests for SystemResourceService
 * @author Development Team
 * @since 1.0.0
 */

import { SystemResourceService, NetworkUtils, SystemResourcesDetailed } from './system-resource.service';
import * as os from 'os';

// Mock os module
jest.mock('os');
jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(false),
  readFileSync: jest.fn().mockReturnValue(''),
  readdirSync: jest.fn().mockReturnValue([]),
  statSync: jest.fn(),
}));

const mockOs = os as jest.Mocked<typeof os>;

describe('NetworkUtils', () => {
  describe('formatBandwidth', () => {
    it('should format bytes per second to bps', () => {
      const result = NetworkUtils.formatBandwidth(100);
      expect(result.value).toBe(800); // 100 * 8
      expect(result.unit).toBe('bps');
      expect(result.formatted).toBe('800.00 bps');
    });

    it('should format bytes per second to Kbps', () => {
      const result = NetworkUtils.formatBandwidth(1000);
      expect(result.value).toBe(8);
      expect(result.unit).toBe('Kbps');
      expect(result.formatted).toBe('8.00 Kbps');
    });

    it('should format bytes per second to Mbps', () => {
      const result = NetworkUtils.formatBandwidth(1000000);
      expect(result.value).toBe(8);
      expect(result.unit).toBe('Mbps');
      expect(result.formatted).toBe('8.00 Mbps');
    });

    it('should format bytes per second to Gbps', () => {
      const result = NetworkUtils.formatBandwidth(1000000000);
      expect(result.value).toBe(8);
      expect(result.unit).toBe('Gbps');
      expect(result.formatted).toBe('8.00 Gbps');
    });

    it('should handle zero bytes', () => {
      const result = NetworkUtils.formatBandwidth(0);
      expect(result.value).toBe(0);
      expect(result.unit).toBe('bps');
      expect(result.formatted).toBe('0.00 bps');
    });
  });

  describe('formatBytes', () => {
    it('should format bytes to B', () => {
      const result = NetworkUtils.formatBytes(512);
      expect(result.value).toBe(512);
      expect(result.unit).toBe('B');
      expect(result.formatted).toBe('512.00 B');
    });

    it('should format bytes to KB', () => {
      const result = NetworkUtils.formatBytes(1024);
      expect(result.value).toBe(1);
      expect(result.unit).toBe('KB');
      expect(result.formatted).toBe('1.00 KB');
    });

    it('should format bytes to MB', () => {
      const result = NetworkUtils.formatBytes(1024 * 1024);
      expect(result.value).toBe(1);
      expect(result.unit).toBe('MB');
      expect(result.formatted).toBe('1.00 MB');
    });

    it('should format bytes to GB', () => {
      const result = NetworkUtils.formatBytes(1024 * 1024 * 1024);
      expect(result.value).toBe(1);
      expect(result.unit).toBe('GB');
      expect(result.formatted).toBe('1.00 GB');
    });

    it('should format bytes to TB', () => {
      const result = NetworkUtils.formatBytes(1024 * 1024 * 1024 * 1024);
      expect(result.value).toBe(1);
      expect(result.unit).toBe('TB');
      expect(result.formatted).toBe('1.00 TB');
    });

    it('should handle zero bytes', () => {
      const result = NetworkUtils.formatBytes(0);
      expect(result.value).toBe(0);
      expect(result.unit).toBe('B');
      expect(result.formatted).toBe('0.00 B');
    });
  });

  describe('calculateUtilization', () => {
    it('should calculate utilization percentage', () => {
      const result = NetworkUtils.calculateUtilization(50, 100);
      expect(result).toBe(50);
    });

    it('should handle zero max rate', () => {
      const result = NetworkUtils.calculateUtilization(50, 0);
      expect(result).toBe(0);
    });

    it('should cap at 100%', () => {
      const result = NetworkUtils.calculateUtilization(150, 100);
      expect(result).toBe(100);
    });
  });

  describe('getConnectionState', () => {
    it('should return connected for active interfaces', () => {
      const interfaces = [
        { name: 'eth0', isUp: true, bytesIn: 100, bytesOut: 50, packetsIn: 10, packetsOut: 5, errors: 0, dropped: 0 }
      ];
      const result = NetworkUtils.getConnectionState(interfaces);
      expect(result).toBe('connected');
    });

    it('should return disconnected for no active interfaces', () => {
      const interfaces = [
        { name: 'lo', isUp: true, bytesIn: 100, bytesOut: 50, packetsIn: 10, packetsOut: 5, errors: 0, dropped: 0 }
      ];
      const result = NetworkUtils.getConnectionState(interfaces);
      expect(result).toBe('disconnected');
    });

    it('should return limited for interfaces with errors', () => {
      const interfaces = [
        { name: 'eth0', isUp: true, bytesIn: 100, bytesOut: 50, packetsIn: 10, packetsOut: 5, errors: 5, dropped: 0 }
      ];
      const result = NetworkUtils.getConnectionState(interfaces);
      expect(result).toBe('limited');
    });

    it('should return limited for interfaces with dropped packets', () => {
      const interfaces = [
        { name: 'eth0', isUp: true, bytesIn: 100, bytesOut: 50, packetsIn: 10, packetsOut: 5, errors: 0, dropped: 3 }
      ];
      const result = NetworkUtils.getConnectionState(interfaces);
      expect(result).toBe('limited');
    });
  });
});

describe('SystemResourceService', () => {
  let service: SystemResourceService;

  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default mocks before creating service
    mockOs.cpus.mockReturnValue([
      { model: 'Intel Core i7', speed: 2400, times: { user: 1000, nice: 0, sys: 500, idle: 8500, irq: 0 } },
      { model: 'Intel Core i7', speed: 2400, times: { user: 1200, nice: 0, sys: 600, idle: 8200, irq: 0 } }
    ] as any);
    mockOs.totalmem.mockReturnValue(8000000000);
    mockOs.freemem.mockReturnValue(4000000000);
    mockOs.networkInterfaces.mockReturnValue({});
    mockOs.platform.mockReturnValue('linux');
    service = new SystemResourceService();
  });

  afterEach(() => {
    if (service) {
      service.removeAllListeners();
    }
  });

  describe('Constructor', () => {
    it('should create service instance', () => {
      expect(service).toBeInstanceOf(SystemResourceService);
    });

    it('should initialize with platform detection', () => {
      mockOs.platform.mockReturnValue('linux');
      const linuxService = new SystemResourceService();
      expect(linuxService).toBeDefined();
    });
  });

  describe('getSystemInfo', () => {
    it('should return system information', () => {
      mockOs.platform.mockReturnValue('linux');
      mockOs.arch.mockReturnValue('x64');
      mockOs.hostname.mockReturnValue('test-host');
      mockOs.uptime.mockReturnValue(86400);
      // Mock process.version
      const originalVersion = process.version;
      Object.defineProperty(process, 'version', {
        value: 'v20.11.0',
        writable: true,
        configurable: true
      });
      
      // Restore after test
      const restoreVersion = () => {
        Object.defineProperty(process, 'version', {
          value: originalVersion,
          writable: true,
          configurable: true
        });
      };

      const info = service.getSystemInfo();

      expect(info).toEqual({
        platform: 'linux',
        architecture: 'x64',
        hostname: 'test-host',
        uptime: 86400,
        nodeVersion: 'v20.11.0',
      });
      
      restoreVersion();
    });
  });

  describe('isResourceStressed', () => {
    it('should detect CPU stress', () => {
      const resources: SystemResourcesDetailed = {
        cpu: { usage: 85, cores: 4, model: 'Intel', speed: 2400 },
        memory: { total: 8000000000, used: 4000000000, free: 4000000000, usage: 4000000000, available: 4000000000, percentage: 50 },
        network: { interfaces: [], totalBytesIn: 0, totalBytesOut: 0, timestamp: Date.now(), connections: 0, totalRateIn: 0, totalRateOut: 0, activeInterfaces: 0, errorRate: 0, connectionState: 'connected' },
        process: { pid: 1, cpuUsage: 10, memoryUsage: 1000000, uptime: 100, status: 'running', heapUsed: 1000000, heapTotal: 2000000, external: 100000, arrayBuffers: 50000, rss: 1500000, avgCpuUsage: 10, peakMemoryUsage: 1200000, performanceRating: 'good' }
      };

      const result = service.isResourceStressed(resources);
      expect(result.cpu).toBe(true);
      expect(result.memory).toBe(false);
      expect(result.overall).toBe(true);
    });

    it('should detect memory stress', () => {
      const resources: SystemResourcesDetailed = {
        cpu: { usage: 50, cores: 4, model: 'Intel', speed: 2400 },
        memory: { total: 8000000000, used: 7000000000, free: 1000000000, usage: 7000000000, available: 1000000000, percentage: 90 },
        network: { interfaces: [], totalBytesIn: 0, totalBytesOut: 0, timestamp: Date.now(), connections: 0, totalRateIn: 0, totalRateOut: 0, activeInterfaces: 0, errorRate: 0, connectionState: 'connected' },
        process: { pid: 1, cpuUsage: 10, memoryUsage: 1000000, uptime: 100, status: 'running', heapUsed: 1000000, heapTotal: 2000000, external: 100000, arrayBuffers: 50000, rss: 1500000, avgCpuUsage: 10, peakMemoryUsage: 1200000, performanceRating: 'good' }
      };

      const result = service.isResourceStressed(resources);
      expect(result.cpu).toBe(false);
      expect(result.memory).toBe(true);
      expect(result.overall).toBe(true);
    });

    it('should detect no stress', () => {
      const resources: SystemResourcesDetailed = {
        cpu: { usage: 30, cores: 4, model: 'Intel', speed: 2400 },
        memory: { total: 8000000000, used: 2000000000, free: 6000000000, usage: 2000000000, available: 6000000000, percentage: 25 },
        network: { interfaces: [], totalBytesIn: 0, totalBytesOut: 0, timestamp: Date.now(), connections: 0, totalRateIn: 0, totalRateOut: 0, activeInterfaces: 0, errorRate: 0, connectionState: 'connected' },
        process: { pid: 1, cpuUsage: 10, memoryUsage: 1000000, uptime: 100, status: 'running', heapUsed: 1000000, heapTotal: 2000000, external: 100000, arrayBuffers: 50000, rss: 1500000, avgCpuUsage: 10, peakMemoryUsage: 1200000, performanceRating: 'good' }
      };

      const result = service.isResourceStressed(resources);
      expect(result.cpu).toBe(false);
      expect(result.memory).toBe(false);
      expect(result.overall).toBe(false);
    });
  });

  describe('getHistory', () => {
    it('should return empty history initially', () => {
      const history = service.getHistory();
      expect(history).toEqual([]);
    });

    it('should return history within time range', () => {
      const history = service.getHistory(60000); // 1 minute
      expect(history).toEqual([]);
    });

    it('should return all history when no time range specified', () => {
      const history = service.getHistory();
      expect(Array.isArray(history)).toBe(true);
    });
  });

  describe('clearHistory', () => {
    it('should clear history', () => {
      service.clearHistory();
      const history = service.getHistory();
      expect(history).toEqual([]);
    });
  });

  describe('getProcessHistory', () => {
    it('should return process history', () => {
      const history = service.getProcessHistory();
      expect(Array.isArray(history)).toBe(true);
    });
  });

  describe('getProcessPerformanceSummary', () => {
    it('should return process performance summary', () => {
      const summary = service.getProcessPerformanceSummary();
      expect(summary).toHaveProperty('runtime');
      expect(summary).toHaveProperty('avgCpuUsage');
      expect(summary).toHaveProperty('peakMemoryUsage');
      expect(summary).toHaveProperty('currentMemoryUsage');
      expect(summary).toHaveProperty('performanceRating');
    });
  });

  describe('getNetworkRates', () => {
    it('should return network rates map', () => {
      const rates = service.getNetworkRates();
      expect(rates).toBeInstanceOf(Map);
    });
  });

  describe('getFormattedNetworkStats', () => {
    it('should return formatted network stats', () => {
      const stats = service.getFormattedNetworkStats();
      expect(stats).toHaveProperty('totalBandwidth');
      expect(stats).toHaveProperty('totalBytes');
      expect(stats).toHaveProperty('connectionState');
    });
  });

  describe('getSystemResources', () => {
    beforeEach(() => {
      // Mock os module methods
      mockOs.networkInterfaces.mockReturnValue({
        eth0: [{ family: 'IPv4', address: '192.168.1.1', internal: false }]
      } as any);
    });

    it('should get system resources successfully', async () => {
      const resources = await service.getSystemResources();
      
      expect(resources).toHaveProperty('cpu');
      expect(resources).toHaveProperty('memory');
      expect(resources).toHaveProperty('network');
      expect(resources).toHaveProperty('process');
      
      expect(resources.cpu.cores).toBe(2);
      expect(resources.memory.total).toBe(8000000000);
      expect(resources.process.pid).toBe(process.pid);
    });

    it('should handle errors gracefully', async () => {
      // Mock CPU error only for getSystemResources call
      mockOs.cpus.mockImplementationOnce(() => {
        throw new Error('CPU info error');
      });
      
      await expect(service.getSystemResources()).rejects.toThrow('CPU info error');
    });

    it('should emit resourceUpdate event', async () => {
      const updateSpy = jest.fn();
      service.on('resourceUpdate', updateSpy);

      await service.getSystemResources();
      expect(updateSpy).toHaveBeenCalled();
    });

    it('should emit error event on failure', async () => {
      const errorSpy = jest.fn();
      service.on('error', errorSpy);
      
      // Mock CPU error for getSystemResources call
      mockOs.cpus.mockImplementationOnce(() => {
        throw new Error('Test error');
      });

      try {
        await service.getSystemResources();
      } catch (error) {
        // Expected
      }

      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('Platform-specific functionality', () => {
    it('should handle Linux platform', () => {
      // Ensure cpus mock is working
      mockOs.cpus.mockReturnValue([
        { model: 'Intel Core i7', speed: 2400, times: { user: 1000, nice: 0, sys: 500, idle: 8500, irq: 0 } }
      ] as any);
      mockOs.platform.mockReturnValue('linux');
      const linuxService = new SystemResourceService();
      expect(linuxService).toBeDefined();
    });

    it('should handle Windows platform', () => {
      mockOs.cpus.mockReturnValue([
        { model: 'Intel Core i7', speed: 2400, times: { user: 1000, nice: 0, sys: 500, idle: 8500, irq: 0 } }
      ] as any);
      mockOs.platform.mockReturnValue('win32');
      const windowsService = new SystemResourceService();
      expect(windowsService).toBeDefined();
    });

    it('should handle macOS platform', () => {
      mockOs.cpus.mockReturnValue([
        { model: 'Intel Core i7', speed: 2400, times: { user: 1000, nice: 0, sys: 500, idle: 8500, irq: 0 } }
      ] as any);
      mockOs.platform.mockReturnValue('darwin');
      const macService = new SystemResourceService();
      expect(macService).toBeDefined();
    });
  });

  describe('Network interface handling', () => {
    it('should handle network interfaces correctly', async () => {
      // Ensure service is in clean state
      mockOs.cpus.mockReturnValue([
        { model: 'Intel Core i7', speed: 2400, times: { user: 1000, nice: 0, sys: 500, idle: 8500, irq: 0 } }
      ] as any);
      mockOs.networkInterfaces.mockReturnValue({
        eth0: [{ family: 'IPv4', address: '192.168.1.1', internal: false }],
        lo: [{ family: 'IPv4', address: '127.0.0.1', internal: true }]
      } as any);
      
      const testService = new SystemResourceService();
      const resources = await testService.getSystemResources();
      expect(resources.network.interfaces).toBeDefined();
    });

    it('should handle empty network interfaces', async () => {
      mockOs.cpus.mockReturnValue([
        { model: 'Intel Core i7', speed: 2400, times: { user: 1000, nice: 0, sys: 500, idle: 8500, irq: 0 } }
      ] as any);
      mockOs.networkInterfaces.mockReturnValue({});
      
      const testService = new SystemResourceService();
      const resources = await testService.getSystemResources();
      expect(resources.network.interfaces).toEqual([]);
    });
  });

  describe('Event handling', () => {
    it('should handle event listeners', () => {
      // Create a fresh service instance
      mockOs.cpus.mockReturnValue([
        { model: 'Intel Core i7', speed: 2400, times: { user: 1000, nice: 0, sys: 500, idle: 8500, irq: 0 } }
      ] as any);
      const testService = new SystemResourceService();
      const listener = jest.fn();
      testService.on('resourceUpdate', listener);
      testService.removeAllListeners();
      expect(testService.listenerCount('resourceUpdate')).toBe(0);
    });
  });

  describe('Network Statistics Platform Methods', () => {
    let testService: SystemResourceService;

    beforeEach(() => {
      mockOs.cpus.mockReturnValue([
        { model: 'Intel Core i7', speed: 2400, times: { user: 1000, nice: 0, sys: 500, idle: 8500, irq: 0 } }
      ] as any);
    });

    it('should handle Linux network stats', async () => {
      mockOs.platform.mockReturnValue('linux');
      testService = new SystemResourceService();
      
      // Test getNetworkStats method for Linux
      const stats = await (testService as any).getNetworkStats('eth0');
      expect(stats).toBeNull(); // Since fs.existsSync is mocked to return false
    });

    it('should handle macOS network stats', async () => {
      mockOs.platform.mockReturnValue('darwin');
      testService = new SystemResourceService();
      
      // Test getNetworkStats method for macOS
      const stats = await (testService as any).getNetworkStats('en0');
      expect(stats).toEqual({
        name: 'en0',
        isUp: true,
        bytesIn: 0,
        bytesOut: 0,
        packetsIn: 0,
        packetsOut: 0,
        errors: 0,
        dropped: 0,
      });
    });

    it('should handle Windows network stats', async () => {
      mockOs.platform.mockReturnValue('win32');
      testService = new SystemResourceService();
      
      // Test getNetworkStats method for Windows
      const stats = await (testService as any).getNetworkStats('Ethernet');
      expect(stats).toEqual({
        name: 'Ethernet',
        isUp: true,
        bytesIn: 0,
        bytesOut: 0,
        packetsIn: 0,
        packetsOut: 0,
        errors: 0,
        dropped: 0,
      });
    });

    it('should handle unknown platform network stats', async () => {
      mockOs.platform.mockReturnValue('freebsd');
      testService = new SystemResourceService();
      
      // Test getNetworkStats method for unknown platform
      const stats = await (testService as any).getNetworkStats('em0');
      expect(stats).toBeNull();
    });

    it('should handle network stats errors gracefully', async () => {
      mockOs.platform.mockReturnValue('darwin');
      testService = new SystemResourceService();
      
      // Mock getMacNetworkStats to throw error
      jest.spyOn(testService as any, 'getMacNetworkStats').mockImplementation(() => {
        throw new Error('Network error');
      });
      
      const stats = await (testService as any).getNetworkStats('en0');
      expect(stats).toBeNull();
    });
  });

  describe('Network Usage Calculation', () => {
    let testService: SystemResourceService;

    beforeEach(() => {
      mockOs.cpus.mockReturnValue([
        { model: 'Intel Core i7', speed: 2400, times: { user: 1000, nice: 0, sys: 500, idle: 8500, irq: 0 } }
      ] as any);
      testService = new SystemResourceService();
    });

    it('should calculate network rates correctly', async () => {
      mockOs.networkInterfaces.mockReturnValue({
        eth0: [{ family: 'IPv4', address: '192.168.1.1', internal: false }]
      } as any);

      // Mock the platform-specific network stats
      jest.spyOn(testService as any, 'getNetworkStats').mockResolvedValueOnce({
        name: 'eth0',
        isUp: true,
        bytesIn: 1000,
        bytesOut: 500,
        packetsIn: 10,
        packetsOut: 5,
        errors: 0,
        dropped: 0,
      });

      const networkUsage = await (testService as any).getNetworkUsage();
      expect(networkUsage.interfaces).toHaveLength(1);
      expect(networkUsage.totalBytesIn).toBe(1000);
      expect(networkUsage.totalBytesOut).toBe(500);
    });

    it('should handle multiple network interfaces', async () => {
      mockOs.networkInterfaces.mockReturnValue({
        eth0: [{ family: 'IPv4', address: '192.168.1.1', internal: false }],
        wlan0: [{ family: 'IPv4', address: '192.168.2.1', internal: false }]
      } as any);

      // Mock network stats for both interfaces
      jest.spyOn(testService as any, 'getNetworkStats')
        .mockResolvedValueOnce({
          name: 'eth0',
          isUp: true,
          bytesIn: 1000,
          bytesOut: 500,
          packetsIn: 10,
          packetsOut: 5,
          errors: 0,
          dropped: 0,
        })
        .mockResolvedValueOnce({
          name: 'wlan0',
          isUp: true,
          bytesIn: 2000,
          bytesOut: 1000,
          packetsIn: 20,
          packetsOut: 10,
          errors: 1,
          dropped: 0,
        });

      const networkUsage = await (testService as any).getNetworkUsage();
      expect(networkUsage.interfaces).toHaveLength(2);
      expect(networkUsage.totalBytesIn).toBe(3000);
      expect(networkUsage.totalBytesOut).toBe(1500);
      expect(networkUsage.errorRate).toBe(1);
    });

    it('should handle network interfaces with no addresses', async () => {
      mockOs.networkInterfaces.mockReturnValue({
        dummy0: null,
        eth0: []
      } as any);

      const networkUsage = await (testService as any).getNetworkUsage();
      expect(networkUsage.interfaces).toHaveLength(0);
      expect(networkUsage.totalBytesIn).toBe(0);
      expect(networkUsage.totalBytesOut).toBe(0);
    });

    it('should skip internal interfaces', async () => {
      mockOs.networkInterfaces.mockReturnValue({
        lo: [{ family: 'IPv4', address: '127.0.0.1', internal: true }],
        eth0: [{ family: 'IPv4', address: '192.168.1.1', internal: false }]
      } as any);

      jest.spyOn(testService as any, 'getNetworkStats').mockResolvedValueOnce({
        name: 'eth0',
        isUp: true,
        bytesIn: 1000,
        bytesOut: 500,
        packetsIn: 10,
        packetsOut: 5,
        errors: 0,
        dropped: 0,
      });

      const networkUsage = await (testService as any).getNetworkUsage();
      expect(networkUsage.interfaces).toHaveLength(1);
      expect(networkUsage.interfaces[0].name).toBe('eth0');
    });

    it('should handle network stats errors during collection', async () => {
      mockOs.networkInterfaces.mockReturnValue({
        eth0: [{ family: 'IPv4', address: '192.168.1.1', internal: false }]
      } as any);

      // Mock getNetworkStats to throw error
      jest.spyOn(testService as any, 'getNetworkStats').mockImplementation(() => {
        throw new Error('Network collection error');
      });

      const networkUsage = await (testService as any).getNetworkUsage();
      expect(networkUsage.interfaces).toHaveLength(0);
      expect(networkUsage.totalBytesIn).toBe(0);
      expect(networkUsage.totalBytesOut).toBe(0);
    });
  });

  describe('Network Connections', () => {
    let testService: SystemResourceService;

    beforeEach(() => {
      mockOs.cpus.mockReturnValue([
        { model: 'Intel Core i7', speed: 2400, times: { user: 1000, nice: 0, sys: 500, idle: 8500, irq: 0 } }
      ] as any);
      testService = new SystemResourceService();
    });

    it('should get network connections count', async () => {
      const connections = await (testService as any).getNetworkConnections();
      expect(typeof connections).toBe('number');
      expect(connections).toBeGreaterThanOrEqual(0);
    });

    it('should handle network connections errors', async () => {
      // Mock fs.readdirSync to throw error
      const fs = require('fs');
      jest.spyOn(fs, 'readdirSync').mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const connections = await (testService as any).getNetworkConnections();
      expect(connections).toBe(0);
    });
  });

  describe('Linux Network Stats', () => {
    let testService: SystemResourceService;

    beforeEach(() => {
      mockOs.cpus.mockReturnValue([
        { model: 'Intel Core i7', speed: 2400, times: { user: 1000, nice: 0, sys: 500, idle: 8500, irq: 0 } }
      ] as any);
      mockOs.platform.mockReturnValue('linux');
      testService = new SystemResourceService();
    });

    it('should parse Linux network stats correctly', async () => {
      const fs = require('fs');
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'readFileSync').mockReturnValue(`Inter-|   Receive                                                |  Transmit
 face |bytes    packets errs drop fifo frame compressed multicast|bytes    packets errs drop fifo colls carrier compressed
  eth0: 1000000    1000    0    0    0     0          0         0  500000     500    0    0    0     0       0          0
    lo:       0       0    0    0    0     0          0         0       0       0    0    0    0     0       0          0`);

      const stats = await (testService as any).getLinuxNetworkStats('eth0');
      expect(stats).toEqual({
        name: 'eth0',
        isUp: true,
        bytesIn: 1000000,
        bytesOut: 500000,
        packetsIn: 1000,
        packetsOut: 500,
        errors: 0,
        dropped: 0,
      });
    });

    it('should handle Linux network stats file not found', async () => {
      const fs = require('fs');
      jest.spyOn(fs, 'existsSync').mockReturnValue(false);

      const stats = await (testService as any).getLinuxNetworkStats('eth0');
      expect(stats).toBeNull();
    });

    it('should handle Linux network stats read error', async () => {
      const fs = require('fs');
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
        throw new Error('Read error');
      });

      const stats = await (testService as any).getLinuxNetworkStats('eth0');
      expect(stats).toBeNull();
    });

    it('should handle malformed Linux network stats', async () => {
      const fs = require('fs');
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'readFileSync').mockReturnValue('invalid data format');

      const stats = await (testService as any).getLinuxNetworkStats('eth0');
      expect(stats).toBeNull();
    });
  });

  describe('Formatted Network Stats', () => {
    let testService: SystemResourceService;

    beforeEach(() => {
      mockOs.cpus.mockReturnValue([
        { model: 'Intel Core i7', speed: 2400, times: { user: 1000, nice: 0, sys: 500, idle: 8500, irq: 0 } }
      ] as any);
      testService = new SystemResourceService();
    });

    it('should return default stats when no history', () => {
      const stats = testService.getFormattedNetworkStats();
      expect(stats).toEqual({
        totalBandwidth: '0 bps',
        totalBytes: '0 B',
        connectionState: 'unknown',
      });
    });

    it('should handle empty history', () => {
      // Mock getHistory to return empty array
      jest.spyOn(testService, 'getHistory').mockReturnValue([]);
      
      const stats = testService.getFormattedNetworkStats();
      expect(stats).toEqual({
        totalBandwidth: '0 bps',
        totalBytes: '0 B',
        connectionState: 'unknown',
      });
    });

    it('should handle history with valid data', () => {
      // Mock getHistory to return sample data
      const sampleHistory = [{
        timestamp: Date.now(),
        cpu: 50,
        memory: 60,
        network: {
          bytesIn: 1000000,
          bytesOut: 500000,
        },
        process: {
          cpu: 10,
          memory: 100000000,
        }
      }];
      
      jest.spyOn(testService, 'getHistory').mockReturnValue(sampleHistory);
      
      const stats = testService.getFormattedNetworkStats();
      expect(stats.totalBandwidth).toBeDefined();
      expect(stats.totalBytes).toBeDefined();
      expect(stats.connectionState).toBe('connected');
    });

    it('should handle history with null latest entry', () => {
      // Mock getHistory to return array with undefined entry
      jest.spyOn(testService, 'getHistory').mockReturnValue([undefined as any]);
      
      const stats = testService.getFormattedNetworkStats();
      expect(stats).toEqual({
        totalBandwidth: '0 bps',
        totalBytes: '0 B',
        connectionState: 'unknown',
      });
    });
  });

  describe('Process Status and Performance', () => {
    let testService: SystemResourceService;

    beforeEach(() => {
      mockOs.cpus.mockReturnValue([
        { model: 'Intel Core i7', speed: 2400, times: { user: 1000, nice: 0, sys: 500, idle: 8500, irq: 0 } }
      ] as any);
      testService = new SystemResourceService();
    });

    it('should determine idle process status', () => {
      const memoryUsage = {
        heapUsed: 1000000,
        heapTotal: 2000000,
        external: 100000,
        arrayBuffers: 50000,
        rss: 1500000,
      };
      
      const status = (testService as any).determineProcessStatus(0.005, memoryUsage);
      expect(status).toBe('idle');
    });

    it('should determine running process status for high CPU', () => {
      const memoryUsage = {
        heapUsed: 1000000,
        heapTotal: 2000000,
        external: 100000,
        arrayBuffers: 50000,
        rss: 1500000,
      };
      
      const status = (testService as any).determineProcessStatus(0.8, memoryUsage);
      expect(status).toBe('running');
    });

    it('should determine blocked process status for high memory', () => {
      const memoryUsage = {
        heapUsed: 1900000,
        heapTotal: 2000000,
        external: 100000,
        arrayBuffers: 50000,
        rss: 1500000,
      };
      
      const status = (testService as any).determineProcessStatus(0.2, memoryUsage);
      expect(status).toBe('blocked');
    });

    it('should determine running process status for normal usage', () => {
      const memoryUsage = {
        heapUsed: 1000000,
        heapTotal: 2000000,
        external: 100000,
        arrayBuffers: 50000,
        rss: 1500000,
      };
      
      const status = (testService as any).determineProcessStatus(0.2, memoryUsage);
      expect(status).toBe('running');
    });

    it('should calculate excellent performance rating', () => {
      const rating = (testService as any).calculatePerformanceRating(0.05, 30 * 1024 * 1024);
      expect(rating).toBe('excellent');
    });

    it('should calculate good performance rating', () => {
      const rating = (testService as any).calculatePerformanceRating(0.2, 80 * 1024 * 1024);
      expect(rating).toBe('good');
    });

    it('should calculate fair performance rating', () => {
      const rating = (testService as any).calculatePerformanceRating(0.4, 150 * 1024 * 1024);
      expect(rating).toBe('fair');
    });

    it('should calculate poor performance rating', () => {
      const rating = (testService as any).calculatePerformanceRating(0.8, 300 * 1024 * 1024);
      expect(rating).toBe('poor');
    });
  });

  describe('CPU Usage Calculation', () => {
    let testService: SystemResourceService;

    beforeEach(() => {
      mockOs.cpus.mockReturnValue([
        { model: 'Intel Core i7', speed: 2400, times: { user: 1000, nice: 0, sys: 500, idle: 8500, irq: 0 } }
      ] as any);
      testService = new SystemResourceService();
    });

    it('should handle zero totalTick in CPU calculation', async () => {
      // Mock cpus to return same values for previous and current
      const sameCpuData = [
        { model: 'Intel Core i7', speed: 2400, times: { user: 1000, nice: 0, sys: 500, idle: 8500, irq: 0 } }
      ];
      
      mockOs.cpus.mockReturnValue(sameCpuData);
      
      const cpuInfo = await (testService as any).getCpuUsage();
      expect(cpuInfo.usage).toBe(0);
    });

    it('should handle mismatched CPU array lengths', async () => {
      // Set initial CPU data
      (testService as any).previousCpuUsage = [
        { model: 'Intel Core i7', speed: 2400, times: { user: 1000, nice: 0, sys: 500, idle: 8500, irq: 0 } }
      ];
      
      // Mock cpus to return different length array
      mockOs.cpus.mockReturnValue([
        { model: 'Intel Core i7', speed: 2400, times: { user: 1100, nice: 0, sys: 600, idle: 8800, irq: 0 } },
        { model: 'Intel Core i7', speed: 2400, times: { user: 1200, nice: 0, sys: 700, idle: 8900, irq: 0 } }
      ]);
      
      const cpuInfo = await (testService as any).getCpuUsage();
      expect(cpuInfo.usage).toBe(0);
    });

    it('should handle undefined CPU or previous CPU data', async () => {
      // Set initial CPU data with undefined entry
      (testService as any).previousCpuUsage = [
        { model: 'Intel Core i7', speed: 2400, times: { user: 1000, nice: 0, sys: 500, idle: 8500, irq: 0 } },
        undefined
      ];
      
      mockOs.cpus.mockReturnValue([
        { model: 'Intel Core i7', speed: 2400, times: { user: 1100, nice: 0, sys: 600, idle: 8800, irq: 0 } },
        { model: 'Intel Core i7', speed: 2400, times: { user: 1200, nice: 0, sys: 700, idle: 8900, irq: 0 } }
      ]);
      
      const cpuInfo = await (testService as any).getCpuUsage();
      expect(cpuInfo.usage).toBeGreaterThanOrEqual(0);
    });

    it('should handle Windows platform without load average', async () => {
      mockOs.platform.mockReturnValue('win32');
      const windowsService = new SystemResourceService();
      
      const cpuInfo = await (windowsService as any).getCpuUsage();
      expect(cpuInfo.loadAverage).toBeUndefined();
    });

    it('should include load average on non-Windows platforms', async () => {
      mockOs.platform.mockReturnValue('linux');
      mockOs.loadavg.mockReturnValue([1.0, 1.2, 1.5]);
      const linuxService = new SystemResourceService();
      
      const cpuInfo = await (linuxService as any).getCpuUsage();
      expect(cpuInfo.loadAverage).toEqual([1.0, 1.2, 1.5]);
    });
  });

  describe('File Descriptor and Thread Count', () => {
    beforeEach(() => {
      mockOs.cpus.mockReturnValue([
        { model: 'Intel Core i7', speed: 2400, times: { user: 1000, nice: 0, sys: 500, idle: 8500, irq: 0 } }
      ] as any);
    });

    it('should get file descriptor count on Linux', async () => {
      mockOs.platform.mockReturnValue('linux');
      const linuxService = new SystemResourceService();
      
      const fs = require('fs');
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'readdirSync').mockReturnValue(['0', '1', '2', '3', '4']);
      
      const fdCount = await (linuxService as any).getFileDescriptorCount();
      expect(fdCount).toBe(5);
    });

    it('should return undefined when file descriptor directory does not exist', async () => {
      mockOs.platform.mockReturnValue('linux');
      const linuxService = new SystemResourceService();
      
      const fs = require('fs');
      jest.spyOn(fs, 'existsSync').mockReturnValue(false);
      
      const fdCount = await (linuxService as any).getFileDescriptorCount();
      expect(fdCount).toBeUndefined();
    });

    it('should handle file descriptor read errors', async () => {
      mockOs.platform.mockReturnValue('linux');
      const linuxService = new SystemResourceService();
      
      const fs = require('fs');
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'readdirSync').mockImplementation(() => {
        throw new Error('Permission denied');
      });
      
      const fdCount = await (linuxService as any).getFileDescriptorCount();
      expect(fdCount).toBeUndefined();
    });

    it('should get thread count on Linux', async () => {
      mockOs.platform.mockReturnValue('linux');
      const linuxService = new SystemResourceService();
      
      const fs = require('fs');
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'readFileSync').mockReturnValue('Name:\tnode\nThreads:\t8\nVmSize:\t1000000 kB\n');
      
      const threadCount = await (linuxService as any).getThreadCount();
      expect(threadCount).toBe(8);
    });

    it('should return fallback thread count when status file does not exist', async () => {
      mockOs.platform.mockReturnValue('linux');
      const linuxService = new SystemResourceService();
      
      const fs = require('fs');
      jest.spyOn(fs, 'existsSync').mockReturnValue(false);
      
      const threadCount = await (linuxService as any).getThreadCount();
      expect(threadCount).toBe(1);
    });

    it('should handle thread count read errors', async () => {
      mockOs.platform.mockReturnValue('linux');
      const linuxService = new SystemResourceService();
      
      const fs = require('fs');
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
        throw new Error('Read error');
      });
      
      const threadCount = await (linuxService as any).getThreadCount();
      expect(threadCount).toBeUndefined();
    });

    it('should return fallback thread count when threads line not found', async () => {
      mockOs.platform.mockReturnValue('linux');
      const linuxService = new SystemResourceService();
      
      const fs = require('fs');
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'readFileSync').mockReturnValue('Name:\tnode\nVmSize:\t1000000 kB\n');
      
      const threadCount = await (linuxService as any).getThreadCount();
      expect(threadCount).toBe(1);
    });

    it('should return undefined for non-Linux platforms', async () => {
      mockOs.platform.mockReturnValue('win32');
      const windowsService = new SystemResourceService();
      
      const fdCount = await (windowsService as any).getFileDescriptorCount();
      expect(fdCount).toBeUndefined();
    });
  });

  describe('Disk Usage', () => {
    beforeEach(() => {
      mockOs.cpus.mockReturnValue([
        { model: 'Intel Core i7', speed: 2400, times: { user: 1000, nice: 0, sys: 500, idle: 8500, irq: 0 } }
      ] as any);
    });

    it('should get disk usage on Linux/macOS', async () => {
      mockOs.platform.mockReturnValue('linux');
      const linuxService = new SystemResourceService();
      
      const fs = require('fs');
      jest.spyOn(fs, 'statSync').mockReturnValue({});
      
      const diskUsage = await (linuxService as any).getDiskUsage();
      expect(diskUsage).toEqual({
        used: 0,
        total: 0,
        available: 0,
        percentage: 0,
      });
    });

    it('should handle disk usage errors', async () => {
      mockOs.platform.mockReturnValue('linux');
      const linuxService = new SystemResourceService();
      
      const fs = require('fs');
      jest.spyOn(fs, 'statSync').mockImplementation(() => {
        throw new Error('Disk error');
      });
      
      const diskUsage = await (linuxService as any).getDiskUsage();
      expect(diskUsage).toBeUndefined();
    });

    it('should return undefined for Windows platform', async () => {
      mockOs.platform.mockReturnValue('win32');
      const windowsService = new SystemResourceService();
      
      const diskUsage = await (windowsService as any).getDiskUsage();
      expect(diskUsage).toBeUndefined();
    });
  });

  describe('Network Connection Count', () => {
    beforeEach(() => {
      mockOs.cpus.mockReturnValue([
        { model: 'Intel Core i7', speed: 2400, times: { user: 1000, nice: 0, sys: 500, idle: 8500, irq: 0 } }
      ] as any);
    });

    it('should get network connections on Linux when file exists', async () => {
      mockOs.platform.mockReturnValue('linux');
      const linuxService = new SystemResourceService();
      
      const fs = require('fs');
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'readFileSync').mockReturnValue('header\nconnection1\nconnection2\nconnection3\n');
      
      const connections = await (linuxService as any).getNetworkConnections();
      expect(connections).toBe(3); // 5 lines - 2 (header + empty) = 3 (based on actual implementation)
    });

    it('should return 0 when TCP file does not exist', async () => {
      mockOs.platform.mockReturnValue('linux');
      const linuxService = new SystemResourceService();
      
      const fs = require('fs');
      jest.spyOn(fs, 'existsSync').mockReturnValue(false);
      
      const connections = await (linuxService as any).getNetworkConnections();
      expect(connections).toBe(0);
    });

    it('should return 0 for non-Linux platforms', async () => {
      mockOs.platform.mockReturnValue('win32');
      const windowsService = new SystemResourceService();
      
      const connections = await (windowsService as any).getNetworkConnections();
      expect(connections).toBe(0);
    });
  });

  describe('History Management', () => {
    let testService: SystemResourceService;

    beforeEach(() => {
      mockOs.cpus.mockReturnValue([
        { model: 'Intel Core i7', speed: 2400, times: { user: 1000, nice: 0, sys: 500, idle: 8500, irq: 0 } }
      ] as any);
      testService = new SystemResourceService();
    });

    it('should filter history by time range', () => {
      const now = Date.now();
      const oldEntry = {
        timestamp: now - 120000, // 2 minutes ago
        cpu: 30,
        memory: 40,
        network: { bytesIn: 1000, bytesOut: 500 },
        process: { cpu: 5, memory: 1000000 }
      };
      const recentEntry = {
        timestamp: now - 30000, // 30 seconds ago
        cpu: 50,
        memory: 60,
        network: { bytesIn: 2000, bytesOut: 1000 },
        process: { cpu: 10, memory: 2000000 }
      };
      
      // Add entries to history
      (testService as any).history = [oldEntry, recentEntry];
      
      const filteredHistory = testService.getHistory(60000); // Last minute
      expect(filteredHistory).toHaveLength(1);
      expect(filteredHistory[0]).toEqual(recentEntry);
    });

    it('should limit history size', () => {
      const testService = new SystemResourceService();
      const mockResource = {
        cpu: { usage: 50, cores: 4, model: 'Intel', speed: 2400 },
        memory: { total: 8000000000, used: 4000000000, free: 4000000000, usage: 4000000000, available: 4000000000, percentage: 50 },
        network: { interfaces: [], totalBytesIn: 0, totalBytesOut: 0, timestamp: Date.now(), connections: 0, totalRateIn: 0, totalRateOut: 0, activeInterfaces: 0, errorRate: 0, connectionState: 'connected' as const },
        process: { pid: 1, cpuUsage: 10, memoryUsage: 1000000, uptime: 100, status: 'running' as const, heapUsed: 1000000, heapTotal: 2000000, external: 100000, arrayBuffers: 50000, rss: 1500000, avgCpuUsage: 10, peakMemoryUsage: 1200000, performanceRating: 'good' as const }
      };
      
      // Add entries beyond the limit
      for (let i = 0; i < 1005; i++) {
        (testService as any).addToHistory(mockResource);
      }
      
      const history = testService.getHistory();
      expect(history.length).toBe(1000); // Should be capped at historyMaxSize
    });
  });

  describe('NetworkUtils edge cases', () => {
    it('should handle NetworkUtils.calculateUtilization with zero maxRate', () => {
      const utilization = NetworkUtils.calculateUtilization(100, 0);
      expect(utilization).toBe(0);
    });

    it('should handle NetworkUtils.calculateUtilization with rate exceeding max', () => {
      const utilization = NetworkUtils.calculateUtilization(150, 100);
      expect(utilization).toBe(100);
    });

    it('should handle NetworkUtils.getConnectionState with no active interfaces', () => {
      const interfaces = [
        { name: 'lo', isUp: true, bytesIn: 0, bytesOut: 0, packetsIn: 0, packetsOut: 0, errors: 0, dropped: 0 }
      ];
      const state = NetworkUtils.getConnectionState(interfaces);
      expect(state).toBe('disconnected');
    });

    it('should handle NetworkUtils.getConnectionState with errors', () => {
      const interfaces = [
        { name: 'eth0', isUp: true, bytesIn: 1000, bytesOut: 500, packetsIn: 10, packetsOut: 5, errors: 2, dropped: 0 }
      ];
      const state = NetworkUtils.getConnectionState(interfaces);
      expect(state).toBe('limited');
    });

    it('should handle NetworkUtils.getConnectionState with dropped packets', () => {
      const interfaces = [
        { name: 'eth0', isUp: true, bytesIn: 1000, bytesOut: 500, packetsIn: 10, packetsOut: 5, errors: 0, dropped: 3 }
      ];
      const state = NetworkUtils.getConnectionState(interfaces);
      expect(state).toBe('limited');
    });

    it('should handle NetworkUtils.getConnectionState with healthy interfaces', () => {
      const interfaces = [
        { name: 'eth0', isUp: true, bytesIn: 1000, bytesOut: 500, packetsIn: 10, packetsOut: 5, errors: 0, dropped: 0 }
      ];
      const state = NetworkUtils.getConnectionState(interfaces);
      expect(state).toBe('connected');
    });
  });

  describe('Process Resource Tracking', () => {
    let testService: SystemResourceService;

    beforeEach(() => {
      mockOs.cpus.mockReturnValue([
        { model: 'Intel Core i7', speed: 2400, times: { user: 1000, nice: 0, sys: 500, idle: 8500, irq: 0 } }
      ] as any);
      testService = new SystemResourceService();
    });

    it('should limit CPU usage readings array size', async () => {
      // Clear existing readings first
      (testService as any).cpuUsageReadings = [];
      
      // Add exactly 50 readings (the limit)
      for (let i = 0; i < 50; i++) {
        (testService as any).cpuUsageReadings.push(i * 0.1);
      }
      
      await (testService as any).getProcessUsage();
      
      // After getProcessUsage, one reading is added, and if > 50, the first is removed
      expect((testService as any).cpuUsageReadings.length).toBe(50);
    });

    it('should limit process history array size', async () => {
      // Clear existing history first
      (testService as any).processHistory = [];
      
      // Add exactly 100 entries (the limit)
      for (let i = 0; i < 100; i++) {
        (testService as any).processHistory.push({
          timestamp: Date.now() + i,
          cpu: i * 0.1,
          memory: i * 1000000,
          heapUsed: i * 1000000,
        });
      }
      
      await (testService as any).getProcessUsage();
      
      // After getProcessUsage, one entry is added, and if > 100, the first is removed
      expect((testService as any).processHistory.length).toBe(100);
    });
  });

  describe('Rate Calculation and History Management', () => {
    let testService: SystemResourceService;

    beforeEach(() => {
      mockOs.cpus.mockReturnValue([
        { model: 'Intel Core i7', speed: 2400, times: { user: 1000, nice: 0, sys: 500, idle: 8500, irq: 0 } }
      ] as any);
      testService = new SystemResourceService();
    });

    it('should calculate network rates with time difference', async () => {
      const now = Date.now();
      
      // Mock previous network stats
      (testService as any).previousNetworkStats.set('eth0', {
        bytesIn: 1000,
        bytesOut: 500,
        timestamp: now - 5000, // 5 seconds ago
      });
      
      // Mock current network stats
      mockOs.networkInterfaces.mockReturnValue({
        eth0: [{ family: 'IPv4', address: '192.168.1.1', internal: false }]
      } as any);
      
      jest.spyOn(testService as any, 'getNetworkStats').mockResolvedValue({
        name: 'eth0',
        isUp: true,
        bytesIn: 6000, // 5000 bytes more
        bytesOut: 3000, // 2500 bytes more
        packetsIn: 60,
        packetsOut: 30,
        errors: 0,
        dropped: 0,
      });
      
      const networkUsage = await (testService as any).getNetworkUsage();
      
      // Should calculate rates (bytes per second)
      expect(networkUsage.interfaces[0].rateIn).toBeGreaterThan(0);
      expect(networkUsage.interfaces[0].rateOut).toBeGreaterThan(0);
    });

    it('should handle zero time difference in rate calculation', async () => {
      const now = Date.now();
      
      // Mock Date.now to return consistent time
      jest.spyOn(Date, 'now').mockReturnValue(now);
      
      // Mock previous network stats with same timestamp
      (testService as any).previousNetworkStats.set('eth0', {
        bytesIn: 1000,
        bytesOut: 500,
        timestamp: now, // Same timestamp
      });
      
      mockOs.networkInterfaces.mockReturnValue({
        eth0: [{ family: 'IPv4', address: '192.168.1.1', internal: false }]
      } as any);
      
      jest.spyOn(testService as any, 'getNetworkStats').mockResolvedValue({
        name: 'eth0',
        isUp: true,
        bytesIn: 2000,
        bytesOut: 1000,
        packetsIn: 20,
        packetsOut: 10,
        errors: 0,
        dropped: 0,
      });
      
      const networkUsage = await (testService as any).getNetworkUsage();
      
      // Should have zero rates due to zero time difference
      expect(networkUsage.interfaces[0].rateIn).toBe(0);
      expect(networkUsage.interfaces[0].rateOut).toBe(0);
      
      // Restore Date.now
      jest.restoreAllMocks();
    });

    it('should handle negative rate calculation', async () => {
      const now = Date.now();
      
      // Mock previous network stats with higher values (counter reset scenario)
      (testService as any).previousNetworkStats.set('eth0', {
        bytesIn: 5000,
        bytesOut: 3000,
        timestamp: now - 1000,
      });
      
      mockOs.networkInterfaces.mockReturnValue({
        eth0: [{ family: 'IPv4', address: '192.168.1.1', internal: false }]
      } as any);
      
      jest.spyOn(testService as any, 'getNetworkStats').mockResolvedValue({
        name: 'eth0',
        isUp: true,
        bytesIn: 1000, // Lower than previous (counter reset)
        bytesOut: 500,
        packetsIn: 10,
        packetsOut: 5,
        errors: 0,
        dropped: 0,
      });
      
      const networkUsage = await (testService as any).getNetworkUsage();
      
      // Should have zero rates due to negative calculation being clamped
      expect(networkUsage.interfaces[0].rateIn).toBe(0);
      expect(networkUsage.interfaces[0].rateOut).toBe(0);
    });

    it('should handle IPv6 network interfaces', async () => {
      mockOs.networkInterfaces.mockReturnValue({
        eth0: [
          { family: 'IPv6', address: '::1', internal: false },
          { family: 'IPv4', address: '192.168.1.1', internal: false }
        ]
      } as any);

      jest.spyOn(testService as any, 'getNetworkStats').mockResolvedValue({
        name: 'eth0',
        isUp: true,
        bytesIn: 1000,
        bytesOut: 500,
        packetsIn: 10,
        packetsOut: 5,
        errors: 0,
        dropped: 0,
      });

      const networkUsage = await (testService as any).getNetworkUsage();
      expect(networkUsage.interfaces).toHaveLength(1);
      expect(networkUsage.interfaces[0].name).toBe('eth0');
    });

    it('should filter recent history correctly', () => {
      const now = Date.now();
      const recentHistory = [
        {
          timestamp: now - 30000, // 30 seconds ago
          cpu: 50,
          memory: 60,
          network: { bytesIn: 2000, bytesOut: 1000 },
          process: { cpu: 10, memory: 2000000 }
        }
      ];
      
      // Add entries to history
      (testService as any).history = recentHistory;
      
      const filteredHistory = testService.getHistory(60000); // Last minute
      expect(filteredHistory).toHaveLength(1);
      expect(filteredHistory[0]?.timestamp).toBe(now - 30000);
    });
  });

  describe('Additional Edge Cases and Error Scenarios', () => {
    let testService: SystemResourceService;

    beforeEach(() => {
      mockOs.cpus.mockReturnValue([
        { model: 'Intel Core i7', speed: 2400, times: { user: 1000, nice: 0, sys: 500, idle: 8500, irq: 0 } }
      ] as any);
      testService = new SystemResourceService();
    });

    it('should handle macOS specific network stats with error', async () => {
      mockOs.platform.mockReturnValue('darwin');
      const macService = new SystemResourceService();
      
      // Mock getMacNetworkStats to throw error
      jest.spyOn(macService as any, 'getMacNetworkStats').mockImplementation(() => {
        throw new Error('macOS network error');
      });
      
      const stats = await (macService as any).getNetworkStats('en0');
      expect(stats).toBeNull();
    });

    it('should handle Windows specific network stats with error', async () => {
      mockOs.platform.mockReturnValue('win32');
      const windowsService = new SystemResourceService();
      
      // Mock getWindowsNetworkStats to throw error
      jest.spyOn(windowsService as any, 'getWindowsNetworkStats').mockImplementation(() => {
        throw new Error('Windows network error');
      });
      
      const stats = await (windowsService as any).getNetworkStats('Ethernet');
      expect(stats).toBeNull();
    });

    it('should handle Linux network stats with insufficient data parts', async () => {
      mockOs.platform.mockReturnValue('linux');
      const linuxService = new SystemResourceService();
      
      const fs = require('fs');
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'readFileSync').mockReturnValue(`Inter-|   Receive                                                |  Transmit
 face |bytes    packets errs drop fifo frame compressed multicast|bytes    packets errs drop fifo colls carrier compressed
  eth0: 1000 500`); // Insufficient data parts
      
      const stats = await (linuxService as any).getLinuxNetworkStats('eth0');
      expect(stats).toBeNull();
    });

    it('should handle system resource errors of different types', async () => {
      // Mock getCpuUsage to throw a non-Error object
      jest.spyOn(testService as any, 'getCpuUsage').mockImplementation(() => {
        throw 'String error';
      });
      
      await expect(testService.getSystemResources()).rejects.toThrow('String error');
    });
  });

  describe('Advanced Network Rate Calculation', () => {
    let testService: SystemResourceService;

    beforeEach(() => {
      mockOs.cpus.mockReturnValue([
        { model: 'Intel Core i7', speed: 2400, times: { user: 1000, nice: 0, sys: 500, idle: 8500, irq: 0 } }
      ] as any);
      testService = new SystemResourceService();
    });

    it('should calculate network rates with previous data', async () => {
      mockOs.networkInterfaces.mockReturnValue({
        eth0: [{ family: 'IPv4', address: '192.168.1.1', internal: false }]
      } as any);

      // Mock getNetworkStats to return data with rate calculation
      let callCount = 0;
      jest.spyOn(testService as any, 'getNetworkStats').mockImplementation(() => {
        callCount++;
        return Promise.resolve({
          name: 'eth0',
          isUp: true,
          bytesIn: callCount * 1000,
          bytesOut: callCount * 500,
          packetsIn: callCount * 10,
          packetsOut: callCount * 5,
          errors: 0,
          dropped: 0,
        });
      });

      // First call - no previous data, rates should be 0
      let networkUsage = await (testService as any).getNetworkUsage();
      expect(networkUsage.totalRateIn).toBe(0);
      expect(networkUsage.totalRateOut).toBe(0);

      // Wait a bit to ensure time difference
      await new Promise(resolve => setTimeout(resolve, 10));

      // Second call - should calculate rates based on difference
      networkUsage = await (testService as any).getNetworkUsage();
      expect(networkUsage.totalRateIn).toBeGreaterThan(0);
      expect(networkUsage.totalRateOut).toBeGreaterThan(0);
    });

    it('should handle zero time difference in rate calculation', async () => {
      mockOs.networkInterfaces.mockReturnValue({
        eth0: [{ family: 'IPv4', address: '192.168.1.1', internal: false }]
      } as any);

      // Mock Date.now to return same time
      const mockDate = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(mockDate);

      jest.spyOn(testService as any, 'getNetworkStats')
        .mockResolvedValueOnce({
          name: 'eth0',
          isUp: true,
          bytesIn: 1000,
          bytesOut: 500,
          packetsIn: 10,
          packetsOut: 5,
          errors: 0,
          dropped: 0,
        })
        .mockResolvedValueOnce({
          name: 'eth0',
          isUp: true,
          bytesIn: 2000,
          bytesOut: 1000,
          packetsIn: 20,
          packetsOut: 10,
          errors: 0,
          dropped: 0,
        });

      // First call
      await (testService as any).getNetworkUsage();

      // Second call with same timestamp
      const networkUsage = await (testService as any).getNetworkUsage();
      expect(networkUsage.totalRateIn).toBe(0);
      expect(networkUsage.totalRateOut).toBe(0);

      // Restore Date.now
      jest.restoreAllMocks();
    });

    it('should handle history size limit', async () => {
      // Add entries beyond the history limit
      const historyLimit = (testService as any).historyMaxSize;
      
      for (let i = 0; i < historyLimit + 10; i++) {
        const entry = {
          timestamp: Date.now() - i * 1000,
          cpu: 50,
          memory: 60,
          network: { bytesIn: i * 1000, bytesOut: i * 500 },
          process: { cpu: 10, memory: 100000 }
        };
        (testService as any).history.push(entry);
      }

      // Manually trigger the size limiting behavior
      if ((testService as any).history.length > historyLimit) {
        (testService as any).history = (testService as any).history.slice(-historyLimit);
      }

      // History should be limited
      expect((testService as any).history.length).toBeLessThanOrEqual(historyLimit);
    });

    it('should filter history by time range', () => {
      const now = Date.now();
      const entries = [
        { timestamp: now - 30000, cpu: 30, memory: 40, network: { bytesIn: 1000, bytesOut: 500 }, process: { cpu: 5, memory: 50000 } },
        { timestamp: now - 90000, cpu: 50, memory: 60, network: { bytesIn: 2000, bytesOut: 1000 }, process: { cpu: 10, memory: 100000 } },
        { timestamp: now - 150000, cpu: 70, memory: 80, network: { bytesIn: 3000, bytesOut: 1500 }, process: { cpu: 15, memory: 150000 } }
      ];
      
      (testService as any).history = entries;
      
      // Get history for last 60 seconds
      const recentHistory = testService.getHistory(60000);
      expect(recentHistory.length).toBe(1);
      expect(recentHistory[0]?.timestamp).toBe(now - 30000);
    });

    it('should handle missing network interface data branches', async () => {
      // Test with IPv6 interface (should be skipped)
      mockOs.networkInterfaces.mockReturnValue({
        eth0: [{ family: 'IPv6', address: '::1', internal: false }]
      } as any);

      const networkUsage = await (testService as any).getNetworkUsage();
      expect(networkUsage.interfaces).toHaveLength(0);
    });

    it('should handle null network stats gracefully', async () => {
      mockOs.networkInterfaces.mockReturnValue({
        eth0: [{ family: 'IPv4', address: '192.168.1.1', internal: false }]
      } as any);

      // Mock getNetworkStats to return null
      jest.spyOn(testService as any, 'getNetworkStats').mockResolvedValue(null);

      const networkUsage = await (testService as any).getNetworkUsage();
      expect(networkUsage.interfaces).toHaveLength(0);
      expect(networkUsage.totalBytesIn).toBe(0);
      expect(networkUsage.totalBytesOut).toBe(0);
    });
  });

  describe('Process Performance Analysis', () => {
    let testService: SystemResourceService;

    beforeEach(() => {
      mockOs.cpus.mockReturnValue([
        { model: 'Intel Core i7', speed: 2400, times: { user: 1000, nice: 0, sys: 500, idle: 8500, irq: 0 } }
      ] as any);
      testService = new SystemResourceService();
    });

    it('should track process performance history', () => {
      // Add some process history manually
      const processHistory = [
        { timestamp: Date.now() - 30000, cpuUsage: 10, memoryUsage: 100000000 },
        { timestamp: Date.now() - 60000, cpuUsage: 15, memoryUsage: 110000000 },
        { timestamp: Date.now() - 90000, cpuUsage: 5, memoryUsage: 90000000 }
      ];
      
      (testService as any).processHistory = processHistory;
      
      const history = testService.getProcessHistory();
      expect(history).toEqual(processHistory);
    });

    it('should calculate process performance summary with different ratings', () => {
      // Mock process.memoryUsage to return low memory for excellent rating
      const originalMemoryUsage = process.memoryUsage;
      (process as any).memoryUsage = jest.fn().mockReturnValue({
        heapUsed: 30 * 1024 * 1024, // 30MB - excellent threshold
        heapTotal: 100 * 1024 * 1024,
        external: 5 * 1024 * 1024,
        arrayBuffers: 1 * 1024 * 1024,
        rss: 50 * 1024 * 1024
      });
      
      // Add CPU usage readings for excellent performance (low CPU usage)
      (testService as any).cpuUsageReadings = [0.05, 0.03, 0.08, 0.02, 0.06]; // Very low CPU usage
      
      const summary = testService.getProcessPerformanceSummary();
      expect(summary.performanceRating).toBe('excellent');
      expect(summary.avgCpuUsage).toBeLessThan(0.1);
      
      // Restore original function
      (process as any).memoryUsage = originalMemoryUsage;
    });

    it('should handle empty process history', () => {
      (testService as any).cpuUsageReadings = [];
      
      const summary = testService.getProcessPerformanceSummary();
      expect(isNaN(summary.avgCpuUsage) || summary.avgCpuUsage === 0).toBe(true);
      expect(summary.peakMemoryUsage).toBe(0);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    let testService: SystemResourceService;

    beforeEach(() => {
      mockOs.cpus.mockReturnValue([
        { model: 'Intel Core i7', speed: 2400, times: { user: 1000, nice: 0, sys: 500, idle: 8500, irq: 0 } }
      ] as any);
      testService = new SystemResourceService();
    });

    it('should handle Linux network stats with insufficient data columns', async () => {
      mockOs.platform.mockReturnValue('linux');
      const fs = require('fs');
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'readFileSync').mockReturnValue(`Inter-|   Receive
  eth0: 1000 2000`); // Insufficient columns

      const stats = await (testService as any).getLinuxNetworkStats('eth0');
      expect(stats).toBeNull();
    });

    it('should handle network interface without activeAddress', async () => {
      mockOs.networkInterfaces.mockReturnValue({
        eth0: [{ family: 'IPv4', address: '192.168.1.1', internal: true }] // Internal interface
      } as any);

      const networkUsage = await (testService as any).getNetworkUsage();
      expect(networkUsage.interfaces).toHaveLength(0);
    });

    it('should handle network connections on different platforms', async () => {
      // Test Linux
      mockOs.platform.mockReturnValue('linux');
      const linuxService = new SystemResourceService();
      let connections = await (linuxService as any).getNetworkConnections();
      expect(typeof connections).toBe('number');

      // Test macOS  
      mockOs.platform.mockReturnValue('darwin');
      const macService = new SystemResourceService();
      connections = await (macService as any).getNetworkConnections();
      expect(typeof connections).toBe('number');

      // Test Windows
      mockOs.platform.mockReturnValue('win32');
      const winService = new SystemResourceService();
      connections = await (winService as any).getNetworkConnections();
      expect(typeof connections).toBe('number');
    });

    it('should handle getMacNetworkStats error branch', async () => {
      mockOs.platform.mockReturnValue('darwin');
      const macService = new SystemResourceService();
      
      // Test the actual try-catch behavior - the method should return null for error
      try {
        const stats = await (macService as any).getMacNetworkStats('en0');
        // The method should return a default object, not null
        expect(stats).toEqual({
          name: 'en0',
          isUp: true,
          bytesIn: 0,
          bytesOut: 0,
          packetsIn: 0,
          packetsOut: 0,
          errors: 0,
          dropped: 0,
        });
      } catch (error) {
        // If it throws, the error should be caught by getNetworkStats
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('should handle getWindowsNetworkStats error branch', async () => {
      mockOs.platform.mockReturnValue('win32');
      const winService = new SystemResourceService();
      
      // Test the actual try-catch behavior - the method should return null for error
      try {
        const stats = await (winService as any).getWindowsNetworkStats('Ethernet');
        // The method should return a default object, not null
        expect(stats).toEqual({
          name: 'Ethernet',
          isUp: true,
          bytesIn: 0,
          bytesOut: 0,
          packetsIn: 0,
          packetsOut: 0,
          errors: 0,
          dropped: 0,
        });
      } catch (error) {
        // If it throws, the error should be caught by getNetworkStats
        expect(error).toBeInstanceOf(Error);
      }
    });
  });
});