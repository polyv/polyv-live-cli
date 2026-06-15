/**
 * @fileoverview Connection pool manager for HTTP connection reuse
 * Manages connection pooling to reduce connection overhead and improve performance
 * @author Development Team
 * @since 1.0.0
 */

import { EventEmitter } from 'events';
import http from 'http';
import https from 'https';

/**
 * Configuration for connection pool behavior
 */
export interface ConnectionPoolConfig {
  /** Maximum number of connections per host */
  maxConnectionsPerHost: number;
  /** Maximum total number of connections */
  maxTotalConnections: number;
  /** Connection timeout in milliseconds */
  connectionTimeout: number;
  /** Connection keep-alive timeout in milliseconds */
  keepAliveTimeout: number;
  /** Maximum idle time before closing connection */
  maxIdleTime: number;
  /** Enable connection pooling */
  enablePooling: boolean;
  /** Enable keep-alive */
  enableKeepAlive: boolean;
  /** Socket timeout in milliseconds */
  socketTimeout: number;
  /** Maximum number of requests per connection */
  maxRequestsPerConnection: number;
}

/**
 * Connection statistics for monitoring
 */
export interface ConnectionStats {
  /** Total number of active connections */
  activeConnections: number;
  /** Total number of idle connections */
  idleConnections: number;
  /** Total number of connection requests */
  totalRequests: number;
  /** Total number of reused connections */
  reusedConnections: number;
  /** Connection reuse ratio */
  reuseRatio: number;
  /** Average connection duration */
  averageConnectionDuration: number;
  /** Connection pool utilization */
  poolUtilization: number;
  /** Per-host connection statistics */
  hostStats: Map<string, HostConnectionStats>;
}

/**
 * Per-host connection statistics
 */
export interface HostConnectionStats {
  /** Host identifier */
  host: string;
  /** Active connections for this host */
  activeConnections: number;
  /** Idle connections for this host */
  idleConnections: number;
  /** Total requests for this host */
  totalRequests: number;
  /** Connection reuse count */
  reuseCount: number;
  /** Average response time */
  averageResponseTime: number;
}

/**
 * Connection pool entry
 */
interface PooledConnection {
  /** Connection ID */
  id: string;
  /** Host identifier */
  host: string;
  /** Port number */
  port: number;
  /** Protocol (http/https) */
  protocol: 'http' | 'https';
  /** Node.js socket/agent */
  socket: any;
  /** Connection creation time */
  createdAt: number;
  /** Last used time */
  lastUsed: number;
  /** Number of requests made on this connection */
  requestCount: number;
  /** Whether connection is currently active */
  isActive: boolean;
  /** Connection state */
  state: 'connecting' | 'connected' | 'idle' | 'closing' | 'closed';
}

/**
 * Connection request in queue
 */
interface ConnectionRequest {
  /** Request ID */
  id: string;
  /** Host to connect to */
  host: string;
  /** Port number */
  port: number;
  /** Protocol */
  protocol: 'http' | 'https';
  /** Request timestamp */
  timestamp: number;
  /** Request callback */
  callback: (error: Error | null, connection?: PooledConnection) => void;
  /** Request timeout */
  timeout: number;
}

/**
 * Connection pool manager for HTTP/HTTPS connections
 */
export class ConnectionPoolManager extends EventEmitter {
  private config: ConnectionPoolConfig;
  private connectionPool: Map<string, PooledConnection[]> = new Map();
  private activeConnections: Map<string, PooledConnection> = new Map();
  private pendingRequests: Map<string, ConnectionRequest[]> = new Map();
  private stats: ConnectionStats;
  private cleanupTimer?: NodeJS.Timeout;
  private requestIdCounter = 0;
  private connectionIdCounter = 0;
  private httpAgent?: http.Agent;
  private httpsAgent?: https.Agent;
  private isRunning = false;

  constructor(config: Partial<ConnectionPoolConfig> = {}) {
    super();
    
    this.config = {
      maxConnectionsPerHost: 10,
      maxTotalConnections: 100,
      connectionTimeout: 5000,
      keepAliveTimeout: 60000,
      maxIdleTime: 30000,
      enablePooling: true,
      enableKeepAlive: true,
      socketTimeout: 30000,
      maxRequestsPerConnection: 100,
      ...config,
    };

    this.stats = {
      activeConnections: 0,
      idleConnections: 0,
      totalRequests: 0,
      reusedConnections: 0,
      reuseRatio: 0,
      averageConnectionDuration: 0,
      poolUtilization: 0,
      hostStats: new Map(),
    };

    this.initializeAgents();
    this.setupEventHandlers();
  }

  /**
   * Start connection pool manager
   */
  public start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.startCleanupTimer();

    this.emit('poolStarted', {
      timestamp: Date.now(),
      config: this.config,
    });
  }

  /**
   * Stop connection pool manager
   */
  public stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    // Stop cleanup timer
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      delete this.cleanupTimer;
    }

    // Close all connections
    this.closeAllConnections();

    // Destroy agents
    if (this.httpAgent) {
      this.httpAgent.destroy();
    }
    if (this.httpsAgent) {
      this.httpsAgent.destroy();
    }

    this.emit('poolStopped', {
      timestamp: Date.now(),
      finalStats: this.getStats(),
    });
  }

  /**
   * Get a connection from the pool
   */
  public async getConnection(
    host: string,
    port: number,
    protocol: 'http' | 'https' = 'https'
  ): Promise<PooledConnection> {
    if (!this.isRunning) {
      throw new Error('Connection pool is not running');
    }

    const hostKey = `${protocol}://${host}:${port}`;
    this.stats.totalRequests++;

    // Update host stats
    this.updateHostStats(hostKey, 'request');

    // Try to get an idle connection first
    const idleConnection = this.getIdleConnection(hostKey);
    if (idleConnection) {
      this.activateConnection(idleConnection);
      this.stats.reusedConnections++;
      this.updateReuseRatio();
      
      this.emit('connectionReused', {
        connectionId: idleConnection.id,
        host: hostKey,
        reuseCount: idleConnection.requestCount,
        timestamp: Date.now(),
      });

      return idleConnection;
    }

    // Check if we can create a new connection
    if (this.canCreateNewConnection(hostKey)) {
      return this.createNewConnection(host, port, protocol);
    }

    // Queue the request
    return this.queueConnectionRequest(host, port, protocol);
  }

  /**
   * Return a connection to the pool
   */
  public returnConnection(connection: PooledConnection): void {
    const hostKey = `${connection.protocol}://${connection.host}:${connection.port}`;
    
    // Update connection state
    connection.isActive = false;
    connection.lastUsed = Date.now();
    connection.state = 'idle';

    // Remove from active connections
    this.activeConnections.delete(connection.id);

    // Check if connection should be reused
    if (this.shouldReuseConnection(connection)) {
      // Add to idle pool
      const hostConnections = this.connectionPool.get(hostKey) || [];
      hostConnections.push(connection);
      this.connectionPool.set(hostKey, hostConnections);

      this.stats.idleConnections++;
      this.stats.activeConnections--;

      this.emit('connectionReturned', {
        connectionId: connection.id,
        host: hostKey,
        requestCount: connection.requestCount,
        timestamp: Date.now(),
      });

      // Process pending requests for this host
      this.processPendingRequests(hostKey);
    } else {
      // Close the connection
      this.closeConnection(connection);
    }

    this.updatePoolStats();
  }

  /**
   * Get connection pool statistics
   */
  public getStats(): ConnectionStats {
    this.updatePoolStats();
    return { ...this.stats };
  }

  /**
   * Get detailed pool information
   */
  public getPoolInfo(): {
    totalConnections: number;
    connectionsByHost: Map<string, number>;
    idleConnectionsByHost: Map<string, number>;
    activeConnectionsByHost: Map<string, number>;
    pendingRequestsByHost: Map<string, number>;
    oldestConnection: PooledConnection | null;
    newestConnection: PooledConnection | null;
  } {
    const connectionsByHost = new Map<string, number>();
    const idleConnectionsByHost = new Map<string, number>();
    const activeConnectionsByHost = new Map<string, number>();
    const pendingRequestsByHost = new Map<string, number>();

    let oldestConnection: PooledConnection | null = null;
    let newestConnection: PooledConnection | null = null;

    // Count connections by host
    for (const [hostKey, connections] of this.connectionPool) {
      connectionsByHost.set(hostKey, connections.length);
      idleConnectionsByHost.set(hostKey, connections.length);

      // Find oldest and newest connections
      for (const conn of connections) {
        if (!oldestConnection || conn.createdAt < oldestConnection.createdAt) {
          oldestConnection = conn;
        }
        if (!newestConnection || conn.createdAt > newestConnection.createdAt) {
          newestConnection = conn;
        }
      }
    }

    // Count active connections by host
    for (const [, connection] of this.activeConnections) {
      const hostKey = `${connection.protocol}://${connection.host}:${connection.port}`;
      const current = activeConnectionsByHost.get(hostKey) || 0;
      activeConnectionsByHost.set(hostKey, current + 1);

      const total = connectionsByHost.get(hostKey) || 0;
      connectionsByHost.set(hostKey, total + 1);
    }

    // Count pending requests by host
    for (const [hostKey, requests] of this.pendingRequests) {
      pendingRequestsByHost.set(hostKey, requests.length);
    }

    return {
      totalConnections: this.stats.activeConnections + this.stats.idleConnections,
      connectionsByHost,
      idleConnectionsByHost,
      activeConnectionsByHost,
      pendingRequestsByHost,
      oldestConnection,
      newestConnection,
    };
  }

  /**
   * Force cleanup of idle connections
   */
  public async forceCleanup(): Promise<void> {
    const cleanedUp = this.cleanupIdleConnections();
    
    this.emit('forcedCleanup', {
      connectionsCleanedUp: cleanedUp,
      timestamp: Date.now(),
    });

    this.updatePoolStats();
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<ConnectionPoolConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Update agents if needed
    this.initializeAgents();

    this.emit('configUpdated', {
      config: this.config,
      timestamp: Date.now(),
    });
  }

  /**
   * Get HTTP/HTTPS agents
   */
  public getAgents(): { httpAgent?: http.Agent; httpsAgent?: https.Agent } {
    return {
      ...(this.httpAgent && { httpAgent: this.httpAgent }),
      ...(this.httpsAgent && { httpsAgent: this.httpsAgent }),
    };
  }

  /**
   * Initialize HTTP and HTTPS agents
   */
  private initializeAgents(): void {
    if (this.config.enablePooling) {
      this.httpAgent = new http.Agent({
        keepAlive: this.config.enableKeepAlive,
        keepAliveMsecs: this.config.keepAliveTimeout,
        maxSockets: this.config.maxConnectionsPerHost,
        maxTotalSockets: this.config.maxTotalConnections,
        timeout: this.config.connectionTimeout,
      });

      this.httpsAgent = new https.Agent({
        keepAlive: this.config.enableKeepAlive,
        keepAliveMsecs: this.config.keepAliveTimeout,
        maxSockets: this.config.maxConnectionsPerHost,
        maxTotalSockets: this.config.maxTotalConnections,
        timeout: this.config.connectionTimeout,
      });
    }
  }

  /**
   * Set up event handlers
   */
  private setupEventHandlers(): void {
    // Handle socket errors
    this.on('connectionError', (error) => {
      this.emit('error', error);
    });

    // Handle connection timeouts
    this.on('connectionTimeout', (connectionId) => {
      const connection = this.activeConnections.get(connectionId);
      if (connection) {
        this.closeConnection(connection);
      }
    });
  }

  /**
   * Get an idle connection for the host
   */
  private getIdleConnection(hostKey: string): PooledConnection | null {
    const hostConnections = this.connectionPool.get(hostKey);
    if (!hostConnections || hostConnections.length === 0) {
      return null;
    }

    // Get the most recently used connection
    const connection = hostConnections.pop();
    if (connection) {
      this.connectionPool.set(hostKey, hostConnections);
      this.stats.idleConnections--;
    }

    return connection || null;
  }

  /**
   * Check if we can create a new connection
   */
  private canCreateNewConnection(hostKey: string): boolean {
    const hostConnections = this.getHostConnectionCount(hostKey);
    const totalConnections = this.stats.activeConnections + this.stats.idleConnections;

    return (
      hostConnections < this.config.maxConnectionsPerHost &&
      totalConnections < this.config.maxTotalConnections
    );
  }

  /**
   * Create a new connection
   */
  private async createNewConnection(
    host: string,
    port: number,
    protocol: 'http' | 'https'
  ): Promise<PooledConnection> {
    const connectionId = `conn_${++this.connectionIdCounter}`;
    const connection: PooledConnection = {
      id: connectionId,
      host,
      port,
      protocol,
      socket: null,
      createdAt: Date.now(),
      lastUsed: Date.now(),
      requestCount: 0,
      isActive: true,
      state: 'connecting',
    };

    try {
      // Create the actual socket/connection
      connection.socket = await this.createSocket(host, port, protocol);
      connection.state = 'connected';

      this.activateConnection(connection);

      this.emit('connectionCreated', {
        connectionId,
        host: `${protocol}://${host}:${port}`,
        timestamp: Date.now(),
      });

      return connection;
    } catch (error) {
      connection.state = 'closed';
      this.emit('connectionError', {
        connectionId,
        host: `${protocol}://${host}:${port}`,
        error,
        timestamp: Date.now(),
      });
      throw error;
    }
  }

  /**
   * Create the actual socket
   */
  private createSocket(host: string, port: number, protocol: 'http' | 'https'): Promise<any> {
    return new Promise((resolve, reject) => {
      const options = {
        host,
        port,
        timeout: this.config.connectionTimeout,
      };

      const socket = protocol === 'https' 
        ? require('tls').connect(options)
        : require('net').createConnection(options);

      const timeout = setTimeout(() => {
        socket.destroy();
        reject(new Error(`Connection timeout after ${this.config.connectionTimeout}ms`));
      }, this.config.connectionTimeout);

      socket.on('connect', () => {
        clearTimeout(timeout);
        resolve(socket);
      });

      socket.on('error', (error: Error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  /**
   * Queue a connection request
   */
  private queueConnectionRequest(
    host: string,
    port: number,
    protocol: 'http' | 'https'
  ): Promise<PooledConnection> {
    const hostKey = `${protocol}://${host}:${port}`;
    const requestId = `req_${++this.requestIdCounter}`;

    return new Promise((resolve, reject) => {
      const request: ConnectionRequest = {
        id: requestId,
        host,
        port,
        protocol,
        timestamp: Date.now(),
        callback: (error, connection) => {
          if (error) {
            reject(error);
          } else if (connection) {
            resolve(connection);
          }
        },
        timeout: this.config.connectionTimeout,
      };

      const hostRequests = this.pendingRequests.get(hostKey) || [];
      hostRequests.push(request);
      this.pendingRequests.set(hostKey, hostRequests);

      this.emit('requestQueued', {
        requestId,
        host: hostKey,
        queueLength: hostRequests.length,
        timestamp: Date.now(),
      });

      // Set up timeout for the request
      setTimeout(() => {
        this.removePendingRequest(hostKey, requestId);
        request.callback(new Error(`Connection request timeout after ${this.config.connectionTimeout}ms`));
      }, this.config.connectionTimeout);
    });
  }

  /**
   * Activate a connection
   */
  private activateConnection(connection: PooledConnection): void {
    connection.isActive = true;
    connection.lastUsed = Date.now();
    connection.requestCount++;
    connection.state = 'connected';

    this.activeConnections.set(connection.id, connection);
    this.stats.activeConnections++;
  }

  /**
   * Check if connection should be reused
   */
  private shouldReuseConnection(connection: PooledConnection): boolean {
    const age = Date.now() - connection.createdAt;
    return (
      connection.requestCount < this.config.maxRequestsPerConnection &&
      age < this.config.keepAliveTimeout &&
      connection.state === 'idle'
    );
  }

  /**
   * Process pending requests for a host
   */
  private processPendingRequests(hostKey: string): void {
    const pendingRequests = this.pendingRequests.get(hostKey);
    if (!pendingRequests || pendingRequests.length === 0) {
      return;
    }

    // Try to satisfy pending requests
    while (pendingRequests.length > 0 && this.canCreateNewConnection(hostKey)) {
      const request = pendingRequests.shift();
      if (request) {
        this.createNewConnection(request.host, request.port, request.protocol)
          .then(connection => request.callback(null, connection))
          .catch(error => request.callback(error));
      }
    }

    this.pendingRequests.set(hostKey, pendingRequests);
  }

  /**
   * Remove a pending request
   */
  private removePendingRequest(hostKey: string, requestId: string): void {
    const requests = this.pendingRequests.get(hostKey) || [];
    const filtered = requests.filter(req => req.id !== requestId);
    this.pendingRequests.set(hostKey, filtered);
  }

  /**
   * Get connection count for a host
   */
  private getHostConnectionCount(hostKey: string): number {
    const idleCount = (this.connectionPool.get(hostKey) || []).length;
    let activeCount = 0;
    
    for (const [, connection] of this.activeConnections) {
      const connHostKey = `${connection.protocol}://${connection.host}:${connection.port}`;
      if (connHostKey === hostKey) {
        activeCount++;
      }
    }

    return idleCount + activeCount;
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupIdleConnections();
      this.updatePoolStats();
    }, this.config.maxIdleTime);
  }

  /**
   * Clean up idle connections
   */
  private cleanupIdleConnections(): number {
    let cleanedUp = 0;
    const now = Date.now();

    for (const [hostKey, connections] of this.connectionPool) {
      const validConnections = connections.filter(connection => {
        const idleTime = now - connection.lastUsed;
        if (idleTime > this.config.maxIdleTime) {
          this.closeConnection(connection);
          cleanedUp++;
          return false;
        }
        return true;
      });

      this.connectionPool.set(hostKey, validConnections);
    }

    this.stats.idleConnections -= cleanedUp;
    return cleanedUp;
  }

  /**
   * Close a connection
   */
  private closeConnection(connection: PooledConnection): void {
    if (connection.socket) {
      connection.socket.destroy();
    }
    
    connection.state = 'closed';
    this.activeConnections.delete(connection.id);

    this.emit('connectionClosed', {
      connectionId: connection.id,
      host: `${connection.protocol}://${connection.host}:${connection.port}`,
      duration: Date.now() - connection.createdAt,
      requestCount: connection.requestCount,
      timestamp: Date.now(),
    });
  }

  /**
   * Close all connections
   */
  private closeAllConnections(): void {
    // Close active connections
    for (const [, connection] of this.activeConnections) {
      this.closeConnection(connection);
    }

    // Close idle connections
    for (const [, connections] of this.connectionPool) {
      for (const connection of connections) {
        this.closeConnection(connection);
      }
    }

    this.connectionPool.clear();
    this.activeConnections.clear();
    this.pendingRequests.clear();
  }

  /**
   * Update host statistics
   */
  private updateHostStats(hostKey: string, event: 'request' | 'reuse' | 'response'): void {
    let hostStats = this.stats.hostStats.get(hostKey);
    if (!hostStats) {
      hostStats = {
        host: hostKey,
        activeConnections: 0,
        idleConnections: 0,
        totalRequests: 0,
        reuseCount: 0,
        averageResponseTime: 0,
      };
      this.stats.hostStats.set(hostKey, hostStats);
    }

    switch (event) {
      case 'request':
        hostStats.totalRequests++;
        break;
      case 'reuse':
        hostStats.reuseCount++;
        break;
    }
  }

  /**
   * Update reuse ratio
   */
  private updateReuseRatio(): void {
    this.stats.reuseRatio = this.stats.totalRequests > 0 
      ? this.stats.reusedConnections / this.stats.totalRequests 
      : 0;
  }

  /**
   * Update pool statistics
   */
  private updatePoolStats(): void {
    const totalConnections = this.stats.activeConnections + this.stats.idleConnections;
    this.stats.poolUtilization = this.config.maxTotalConnections > 0 
      ? totalConnections / this.config.maxTotalConnections 
      : 0;

    // Update host connection counts
    for (const [hostKey, hostStats] of this.stats.hostStats) {
      hostStats.activeConnections = 0;
      hostStats.idleConnections = (this.connectionPool.get(hostKey) || []).length;

      for (const [, connection] of this.activeConnections) {
        const connHostKey = `${connection.protocol}://${connection.host}:${connection.port}`;
        if (connHostKey === hostKey) {
          hostStats.activeConnections++;
        }
      }
    }
  }
}