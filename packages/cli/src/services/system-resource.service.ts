/**
 * @fileoverview System resource monitoring service
 * @author Development Team
 * @since 1.0.0
 */

import * as os from 'os';
import * as fs from 'fs';
import { EventEmitter } from 'events';

/**
 * Network unit conversion utilities
 */
export class NetworkUtils {
  /**
   * Convert bytes per second to human readable format
   */
  static formatBandwidth(bytesPerSecond: number): { value: number; unit: string; formatted: string } {
    const units = ['bps', 'Kbps', 'Mbps', 'Gbps', 'Tbps'];
    let value = bytesPerSecond * 8; // Convert to bits
    let unitIndex = 0;
    
    while (value >= 1000 && unitIndex < units.length - 1) {
      value /= 1000;
      unitIndex++;
    }
    
    const unit = units[unitIndex] || 'bps';
    const formatted = `${value.toFixed(2)} ${unit}`;
    return { value, unit, formatted };
  }
  
  /**
   * Convert bytes to human readable format
   */
  static formatBytes(bytes: number): { value: number; unit: string; formatted: string } {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let value = bytes;
    let unitIndex = 0;
    
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }
    
    const unit = units[unitIndex] || 'B';
    const formatted = `${value.toFixed(2)} ${unit}`;
    return { value, unit, formatted };
  }
  
  /**
   * Calculate network utilization percentage
   */
  static calculateUtilization(currentRate: number, maxRate: number): number {
    if (maxRate === 0) return 0;
    return Math.min(100, (currentRate / maxRate) * 100);
  }
  
  /**
   * Determine connection state based on active interfaces
   */
  static getConnectionState(interfaces: NetworkInterface[]): 'connected' | 'disconnected' | 'limited' {
    const activeInterfaces = interfaces.filter(iface => iface.isUp && !iface.name.startsWith('lo'));
    
    if (activeInterfaces.length === 0) {
      return 'disconnected';
    }
    
    const hasErrors = activeInterfaces.some(iface => iface.errors > 0 || iface.dropped > 0);
    return hasErrors ? 'limited' : 'connected';
  }
}

/**
 * Extended system resources interface with detailed metrics
 */
export interface SystemResourcesDetailed {
  cpu: {
    usage: number;
    cores: number;
    model: string;
    speed: number;
    temperature?: number;
    loadAverage?: number[];
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usage: number;
    available: number;
    percentage: number;
  };
  network: {
    interfaces: NetworkInterface[];
    totalBytesIn: number;
    totalBytesOut: number;
    timestamp: number;
    connections: number;
    // Enhanced network metrics
    totalRateIn: number;  // bytes per second
    totalRateOut: number; // bytes per second
    activeInterfaces: number;
    errorRate: number;
    connectionState: 'connected' | 'disconnected' | 'limited';
  };
  process: {
    pid: number;
    cpuUsage: number;
    memoryUsage: number;
    uptime: number;
    handles?: number;
    connections?: number;
    // Enhanced process monitoring
    fileDescriptors?: number;
    threadCount?: number;
    status: 'running' | 'idle' | 'blocked' | 'zombie';
    heapUsed: number;
    heapTotal: number;
    external: number;
    arrayBuffers: number;
    rss: number;
    // Performance metrics
    avgCpuUsage: number;
    peakMemoryUsage: number;
    performanceRating: 'excellent' | 'good' | 'fair' | 'poor';
  };
  disk?: {
    used: number;
    total: number;
    available: number;
    percentage: number;
  };
}

export interface NetworkInterface {
  name: string;
  isUp: boolean;
  speed?: number;
  bytesIn: number;
  bytesOut: number;
  packetsIn: number;
  packetsOut: number;
  errors: number;
  dropped: number;
  // Add rate information
  rateIn?: number;  // bytes per second
  rateOut?: number; // bytes per second
  utilization?: number; // percentage of interface capacity
}

export interface SystemResourcesHistory {
  timestamp: number;
  cpu: number;
  memory: number;
  network: {
    bytesIn: number;
    bytesOut: number;
  };
  process: {
    cpu: number;
    memory: number;
  };
}

/**
 * System resource monitoring service
 * Provides cross-platform system resource monitoring capabilities
 */
export class SystemResourceService extends EventEmitter {
  private previousCpuUsage: os.CpuInfo[] = [];
  private previousProcessUsage: NodeJS.CpuUsage = process.cpuUsage();
  private history: SystemResourcesHistory[] = [];
  private readonly historyMaxSize = 1000;
  private isWindows = os.platform() === 'win32';
  private isLinux = os.platform() === 'linux';
  private isMacOS = os.platform() === 'darwin';
  
  // Network rate tracking
  private previousNetworkStats: Map<string, { bytesIn: number; bytesOut: number; timestamp: number }> = new Map();
  private networkRates: Map<string, { rateIn: number; rateOut: number }> = new Map();
  
  // Process performance tracking
  private processHistory: Array<{ timestamp: number; cpu: number; memory: number; heapUsed: number }> = [];
  private readonly processHistoryMaxSize = 100;
  private processStartTime = Date.now();
  private peakMemoryUsage = 0;
  private cpuUsageReadings: number[] = [];

  constructor() {
    super();
    this.initializeBaseline();
  }

  /**
   * Initialize baseline measurements for relative calculations
   */
  private initializeBaseline(): void {
    this.previousCpuUsage = os.cpus();
    this.previousProcessUsage = process.cpuUsage();
  }

  /**
   * Get comprehensive system resource information
   * @returns Promise resolving to detailed system resources
   */
  public async getSystemResources(): Promise<SystemResourcesDetailed> {
    try {
      const [cpu, memory, network, processInfo, disk] = await Promise.all([
        this.getCpuUsage(),
        this.getMemoryUsage(),
        this.getNetworkUsage(),
        this.getProcessUsage(),
        this.getDiskUsage(),
      ]);

      const resources: SystemResourcesDetailed = {
        cpu,
        memory,
        network,
        process: processInfo,
        ...(disk && { disk }),
      };

      // Store in history
      this.addToHistory(resources);

      // Emit update event
      this.emit('resourceUpdate', resources);

      return resources;
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error));
      this.emit('error', errorInstance);
      throw errorInstance;
    }
  }

  /**
   * Get CPU usage information
   */
  private async getCpuUsage(): Promise<SystemResourcesDetailed['cpu']> {
    const cpus = os.cpus();
    const currentCpuUsage = cpus;
    
    let totalIdle = 0;
    let totalTick = 0;
    
    if (this.previousCpuUsage.length === cpus.length) {
      for (let i = 0; i < cpus.length; i++) {
        const cpu = cpus[i];
        const prevCpu = this.previousCpuUsage[i];
        
        if (cpu && prevCpu) {
          const idle = cpu.times.idle - prevCpu.times.idle;
          const total = Object.values(cpu.times).reduce((a, b) => a + b, 0) - 
                       Object.values(prevCpu.times).reduce((a, b) => a + b, 0);
          
          totalIdle += idle;
          totalTick += total;
        }
      }
    }
    
    this.previousCpuUsage = currentCpuUsage;
    
    const usage = totalTick > 0 ? Math.round((1 - totalIdle / totalTick) * 100) : 0;
    
    return {
      usage: Math.max(0, Math.min(100, usage)),
      cores: cpus.length,
      model: cpus[0]?.model || 'Unknown',
      speed: cpus[0]?.speed || 0,
      ...(this.isWindows ? {} : { loadAverage: os.loadavg() }),
    };
  }

  /**
   * Get memory usage information
   */
  private async getMemoryUsage(): Promise<SystemResourcesDetailed['memory']> {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const usage = Math.round((usedMem / totalMem) * 100);

    return {
      total: totalMem,
      used: usedMem,
      free: freeMem,
      usage: usedMem,
      available: freeMem,
      percentage: usage,
    };
  }

  /**
   * Get network usage information
   */
  private async getNetworkUsage(): Promise<SystemResourcesDetailed['network']> {
    const interfaces = os.networkInterfaces();
    const networkInterfaces: NetworkInterface[] = [];
    let totalBytesIn = 0;
    let totalBytesOut = 0;
    let totalRateIn = 0;
    let totalRateOut = 0;
    let totalErrors = 0;
    const now = Date.now();

    try {
      for (const [name, addresses] of Object.entries(interfaces)) {
        if (!addresses || addresses.length === 0) continue;
        
        const activeAddress = addresses.find(addr => !addr.internal && addr.family === 'IPv4');
        if (!activeAddress) continue;

        const networkStats = await this.getNetworkStats(name);
        if (networkStats) {
          // Calculate rates
          const previousStats = this.previousNetworkStats.get(name);
          let rateIn = 0;
          let rateOut = 0;
          
          if (previousStats) {
            const timeDiff = (now - previousStats.timestamp) / 1000; // seconds
            if (timeDiff > 0) {
              rateIn = Math.max(0, (networkStats.bytesIn - previousStats.bytesIn) / timeDiff);
              rateOut = Math.max(0, (networkStats.bytesOut - previousStats.bytesOut) / timeDiff);
            }
          }
          
          // Store current stats for next calculation
          this.previousNetworkStats.set(name, {
            bytesIn: networkStats.bytesIn,
            bytesOut: networkStats.bytesOut,
            timestamp: now,
          });
          
          // Store rates
          this.networkRates.set(name, { rateIn, rateOut });
          
          // Add rates to interface stats
          networkStats.rateIn = rateIn;
          networkStats.rateOut = rateOut;
          
          networkInterfaces.push(networkStats);
          totalBytesIn += networkStats.bytesIn;
          totalBytesOut += networkStats.bytesOut;
          totalRateIn += rateIn;
          totalRateOut += rateOut;
          totalErrors += networkStats.errors;
        }
      }
    } catch (error) {
      // Fallback to basic network info if detailed stats fail
      // This ensures the component still works even if network stats are unavailable
    }

    return {
      interfaces: networkInterfaces,
      totalBytesIn,
      totalBytesOut,
      timestamp: now,
      connections: await this.getNetworkConnections(),
      totalRateIn,
      totalRateOut,
      activeInterfaces: networkInterfaces.filter(iface => iface.isUp).length,
      errorRate: totalErrors,
      connectionState: NetworkUtils.getConnectionState(networkInterfaces),
    };
  }

  /**
   * Get network statistics for a specific interface
   */
  private async getNetworkStats(interfaceName: string): Promise<NetworkInterface | null> {
    try {
      if (this.isLinux) {
        return await this.getLinuxNetworkStats(interfaceName);
      } else if (this.isMacOS) {
        return await this.getMacNetworkStats(interfaceName);
      } else if (this.isWindows) {
        return await this.getWindowsNetworkStats(interfaceName);
      }
    } catch (error) {
      // Return null if stats cannot be retrieved
      return null;
    }
    return null;
  }
  
  /**
   * Get network interface rates
   */
  public getNetworkRates(): Map<string, { rateIn: number; rateOut: number }> {
    return new Map(this.networkRates);
  }
  
  /**
   * Get formatted network statistics
   */
  public getFormattedNetworkStats(): {
    totalBandwidth: string;
    totalBytes: string;
    connectionState: string;
  } {
    const history = this.getHistory(60000); // Last minute
    if (history.length === 0) {
      return {
        totalBandwidth: '0 bps',
        totalBytes: '0 B',
        connectionState: 'unknown',
      };
    }
    
    const latest = history[history.length - 1];
    if (!latest) {
      return {
        totalBandwidth: '0 bps',
        totalBytes: '0 B',
        connectionState: 'unknown',
      };
    }
    
    const totalRate = latest.network.bytesIn + latest.network.bytesOut;
    const totalBytes = latest.network.bytesIn + latest.network.bytesOut;
    
    return {
      totalBandwidth: NetworkUtils.formatBandwidth(totalRate).formatted,
      totalBytes: NetworkUtils.formatBytes(totalBytes).formatted,
      connectionState: 'connected', // Simplified for now
    };
  }

  /**
   * Get Linux network statistics
   */
  private async getLinuxNetworkStats(interfaceName: string): Promise<NetworkInterface | null> {
    try {
      const statsPath = `/proc/net/dev`;
      if (!fs.existsSync(statsPath)) return null;

      const data = fs.readFileSync(statsPath, 'utf8');
      const lines = data.split('\n');
      
      for (const line of lines) {
        if (line.includes(interfaceName)) {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 17) {
            return {
              name: interfaceName,
              isUp: true,
              bytesIn: parseInt(parts[1] || '0') || 0,
              bytesOut: parseInt(parts[9] || '0') || 0,
              packetsIn: parseInt(parts[2] || '0') || 0,
              packetsOut: parseInt(parts[10] || '0') || 0,
              errors: (parseInt(parts[3] || '0') || 0) + (parseInt(parts[11] || '0') || 0),
              dropped: (parseInt(parts[4] || '0') || 0) + (parseInt(parts[12] || '0') || 0),
            };
          }
        }
      }
    } catch (error) {
      // Ignore errors and return null
    }
    return null;
  }

  /**
   * Get macOS network statistics
   */
  private async getMacNetworkStats(interfaceName: string): Promise<NetworkInterface | null> {
    try {
      // Basic implementation - can be enhanced with netstat parsing
      return {
        name: interfaceName,
        isUp: true,
        bytesIn: 0,
        bytesOut: 0,
        packetsIn: 0,
        packetsOut: 0,
        errors: 0,
        dropped: 0,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Get Windows network statistics
   */
  private async getWindowsNetworkStats(interfaceName: string): Promise<NetworkInterface | null> {
    try {
      // Basic implementation - can be enhanced with WMI queries
      return {
        name: interfaceName,
        isUp: true,
        bytesIn: 0,
        bytesOut: 0,
        packetsIn: 0,
        packetsOut: 0,
        errors: 0,
        dropped: 0,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Get network connections count
   */
  private async getNetworkConnections(): Promise<number> {
    try {
      if (this.isLinux) {
        const tcpPath = '/proc/net/tcp';
        if (fs.existsSync(tcpPath)) {
          const data = fs.readFileSync(tcpPath, 'utf8');
          return data.split('\n').length - 2; // Subtract header and empty line
        }
      }
      return 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get process usage information
   */
  private async getProcessUsage(): Promise<SystemResourcesDetailed['process']> {
    const currentUsage = process.cpuUsage(this.previousProcessUsage);
    const memoryUsage = process.memoryUsage();
    
    // Calculate CPU usage as percentage
    const cpuUsage = (currentUsage.user + currentUsage.system) / 1000000; // Convert to seconds
    
    this.previousProcessUsage = process.cpuUsage();
    
    // Track peak memory usage
    this.peakMemoryUsage = Math.max(this.peakMemoryUsage, memoryUsage.heapUsed);
    
    // Add to CPU usage readings for averaging
    this.cpuUsageReadings.push(cpuUsage);
    if (this.cpuUsageReadings.length > 50) {
      this.cpuUsageReadings.shift();
    }
    
    // Calculate average CPU usage
    const avgCpuUsage = this.cpuUsageReadings.reduce((sum, usage) => sum + usage, 0) / this.cpuUsageReadings.length;
    
    // Add to process history
    this.processHistory.push({
      timestamp: Date.now(),
      cpu: cpuUsage,
      memory: memoryUsage.heapUsed,
      heapUsed: memoryUsage.heapUsed,
    });
    
    if (this.processHistory.length > this.processHistoryMaxSize) {
      this.processHistory.shift();
    }
    
    // Determine process status
    const status = this.determineProcessStatus(cpuUsage, memoryUsage);
    
    // Calculate performance rating
    const performanceRating = this.calculatePerformanceRating(cpuUsage, memoryUsage.heapUsed);
    
    // Get file descriptors count (Linux/macOS only)
    const fileDescriptors = await this.getFileDescriptorCount();
    
    const result: SystemResourcesDetailed['process'] = {
      pid: process.pid,
      cpuUsage: Math.round(cpuUsage * 100) / 100,
      memoryUsage: memoryUsage.heapUsed,
      uptime: process.uptime(),
      status,
      heapUsed: memoryUsage.heapUsed,
      heapTotal: memoryUsage.heapTotal,
      external: memoryUsage.external,
      arrayBuffers: memoryUsage.arrayBuffers,
      rss: memoryUsage.rss,
      avgCpuUsage: Math.round(avgCpuUsage * 100) / 100,
      peakMemoryUsage: this.peakMemoryUsage,
      performanceRating,
    };
    
    // Add optional properties only if they have values
    if (fileDescriptors !== undefined) {
      result.fileDescriptors = fileDescriptors;
    }
    
    const threadCount = await this.getThreadCount();
    if (threadCount !== undefined) {
      result.threadCount = threadCount;
    }
    
    return result;
  }

  /**
   * Get disk usage information
   */
  private async getDiskUsage(): Promise<SystemResourcesDetailed['disk'] | undefined> {
    try {
      if (this.isLinux || this.isMacOS) {
        fs.statSync('/');
        // Note: Getting actual disk space requires platform-specific implementation
        // This is a simplified version
        return {
          used: 0,
          total: 0,
          available: 0,
          percentage: 0,
        };
      }
    } catch (error) {
      // Disk usage is optional, return undefined if unavailable
    }
    return undefined;
  }
  
  /**
   * Determine process status based on resource usage
   */
  private determineProcessStatus(cpuUsage: number, memoryUsage: NodeJS.MemoryUsage): 'running' | 'idle' | 'blocked' | 'zombie' {
    if (cpuUsage < 0.01) {
      return 'idle';
    } else if (cpuUsage > 0.5) {
      return 'running';
    } else if (memoryUsage.heapUsed > memoryUsage.heapTotal * 0.9) {
      return 'blocked';
    } else {
      return 'running';
    }
  }
  
  /**
   * Calculate performance rating based on resource usage
   */
  private calculatePerformanceRating(cpuUsage: number, memoryUsage: number): 'excellent' | 'good' | 'fair' | 'poor' {
    const memoryMB = memoryUsage / (1024 * 1024);
    
    if (cpuUsage < 0.1 && memoryMB < 50) {
      return 'excellent';
    } else if (cpuUsage < 0.3 && memoryMB < 100) {
      return 'good';
    } else if (cpuUsage < 0.5 && memoryMB < 200) {
      return 'fair';
    } else {
      return 'poor';
    }
  }
  
  /**
   * Get file descriptor count (Linux/macOS only)
   */
  private async getFileDescriptorCount(): Promise<number | undefined> {
    try {
      if (this.isLinux) {
        const fdDir = `/proc/${process.pid}/fd`;
        if (fs.existsSync(fdDir)) {
          const files = fs.readdirSync(fdDir);
          return files.length;
        }
      }
      // macOS implementation would require lsof or similar
      return undefined;
    } catch (error) {
      return undefined;
    }
  }
  
  /**
   * Get thread count (approximate)
   */
  private async getThreadCount(): Promise<number | undefined> {
    try {
      if (this.isLinux) {
        const statusPath = `/proc/${process.pid}/status`;
        if (fs.existsSync(statusPath)) {
          const statusData = fs.readFileSync(statusPath, 'utf8');
          const threadsLine = statusData.split('\n').find(line => line.startsWith('Threads:'));
          if (threadsLine) {
            const threads = parseInt(threadsLine.split('\t')[1] || '0');
            return threads;
          }
        }
      }
      // Fallback - assume single threaded Node.js process
      return 1;
    } catch (error) {
      return undefined;
    }
  }
  
  /**
   * Get process history for trending
   */
  public getProcessHistory(): Array<{ timestamp: number; cpu: number; memory: number; heapUsed: number }> {
    return [...this.processHistory];
  }
  
  /**
   * Get process performance summary
   */
  public getProcessPerformanceSummary(): {
    runtime: number;
    avgCpuUsage: number;
    peakMemoryUsage: number;
    currentMemoryUsage: number;
    performanceRating: 'excellent' | 'good' | 'fair' | 'poor';
  } {
    const runtime = Date.now() - this.processStartTime;
    const avgCpuUsage = this.cpuUsageReadings.reduce((sum, usage) => sum + usage, 0) / this.cpuUsageReadings.length;
    const currentMemoryUsage = process.memoryUsage().heapUsed;
    
    return {
      runtime,
      avgCpuUsage: Math.round(avgCpuUsage * 100) / 100,
      peakMemoryUsage: this.peakMemoryUsage,
      currentMemoryUsage,
      performanceRating: this.calculatePerformanceRating(avgCpuUsage, currentMemoryUsage),
    };
  }

  /**
   * Add resource data to history
   */
  private addToHistory(resources: SystemResourcesDetailed): void {
    const historyEntry: SystemResourcesHistory = {
      timestamp: Date.now(),
      cpu: resources.cpu.usage,
      memory: resources.memory.percentage,
      network: {
        bytesIn: resources.network.totalBytesIn,
        bytesOut: resources.network.totalBytesOut,
      },
      process: {
        cpu: resources.process.cpuUsage,
        memory: resources.process.memoryUsage,
      },
    };

    this.history.push(historyEntry);
    
    if (this.history.length > this.historyMaxSize) {
      this.history.shift();
    }
  }

  /**
   * Get resource usage history
   * @param timeRange Time range in milliseconds
   * @returns Array of historical data points
   */
  public getHistory(timeRange?: number): SystemResourcesHistory[] {
    if (!timeRange) {
      return [...this.history];
    }

    const cutoff = Date.now() - timeRange;
    return this.history.filter(entry => entry.timestamp >= cutoff);
  }

  /**
   * Clear resource usage history
   */
  public clearHistory(): void {
    this.history = [];
  }

  /**
   * Get system information
   */
  public getSystemInfo(): {
    platform: string;
    architecture: string;
    hostname: string;
    uptime: number;
    nodeVersion: string;
  } {
    return {
      platform: os.platform(),
      architecture: os.arch(),
      hostname: os.hostname(),
      uptime: os.uptime(),
      nodeVersion: process.version,
    };
  }

  /**
   * Check if system resources are under stress
   */
  public isResourceStressed(resources: SystemResourcesDetailed): {
    cpu: boolean;
    memory: boolean;
    overall: boolean;
  } {
    const cpuStressed = resources.cpu.usage > 80;
    const memoryStressed = resources.memory.percentage > 85;
    
    return {
      cpu: cpuStressed,
      memory: memoryStressed,
      overall: cpuStressed || memoryStressed,
    };
  }
}