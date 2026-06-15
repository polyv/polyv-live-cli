/**
 * @fileoverview Fallback manager for graceful degradation and fault tolerance
 * Handles API unavailability, network issues, and service degradation
 * @author Development Team
 * @since 1.0.0
 */

import { EventEmitter } from 'events';

/**
 * Configuration for fallback behavior
 */
export interface FallbackManagerConfig {
  /** Enable automatic fallback */
  enableAutoFallback: boolean;
  /** Maximum retry attempts before fallback */
  maxRetryAttempts: number;
  /** Retry delay in milliseconds */
  retryDelay: number;
  /** Retry delay multiplier for exponential backoff */
  retryDelayMultiplier: number;
  /** Maximum retry delay */
  maxRetryDelay: number;
  /** Circuit breaker failure threshold */
  circuitBreakerThreshold: number;
  /** Circuit breaker timeout in milliseconds */
  circuitBreakerTimeout: number;
  /** Health check interval in milliseconds */
  healthCheckInterval: number;
  /** Request timeout in milliseconds */
  requestTimeout: number;
  /** Enable fallback data caching */
  enableFallbackCache: boolean;
  /** Fallback cache TTL in milliseconds */
  fallbackCacheTtl: number;
}

/**
 * Service health status
 */
export type ServiceHealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

/**
 * Circuit breaker state
 */
export type CircuitBreakerState = 'closed' | 'open' | 'half-open';

/**
 * Fallback strategy type
 */
export type FallbackStrategy = 'cache' | 'alternative-endpoint' | 'mock-data' | 'partial-response' | 'offline-mode';

/**
 * Service endpoint configuration
 */
export interface ServiceEndpoint {
  /** Endpoint identifier */
  id: string;
  /** Endpoint URL */
  url: string;
  /** Priority (lower number = higher priority) */
  priority: number;
  /** Whether this is the primary endpoint */
  isPrimary: boolean;
  /** Health status */
  healthStatus: ServiceHealthStatus;
  /** Last health check timestamp */
  lastHealthCheck: number;
  /** Response time in milliseconds */
  responseTime: number;
  /** Success rate (0-1) */
  successRate: number;
  /** Circuit breaker state */
  circuitBreakerState: CircuitBreakerState;
  /** Number of consecutive failures */
  consecutiveFailures: number;
}

/**
 * Fallback rule configuration
 */
export interface FallbackRule {
  /** Rule identifier */
  id: string;
  /** Service identifier */
  serviceId: string;
  /** Trigger conditions */
  triggers: FallbackTrigger[];
  /** Fallback strategy */
  strategy: FallbackStrategy;
  /** Fallback configuration */
  config: Record<string, any>;
  /** Rule priority */
  priority: number;
  /** Whether rule is enabled */
  enabled: boolean;
}

/**
 * Fallback trigger condition
 */
export interface FallbackTrigger {
  /** Trigger type */
  type: 'error-rate' | 'response-time' | 'status-code' | 'timeout' | 'circuit-breaker';
  /** Trigger threshold */
  threshold: number;
  /** Time window for evaluation in milliseconds */
  timeWindow: number;
  /** Minimum sample size */
  minSamples: number;
}

/**
 * Fallback execution result
 */
export interface FallbackResult {
  /** Whether fallback was successful */
  success: boolean;
  /** Strategy used */
  strategy: FallbackStrategy;
  /** Response data */
  data: any;
  /** Response time */
  responseTime: number;
  /** Error if fallback failed */
  error?: Error;
  /** Source of the data */
  source: 'primary' | 'fallback' | 'cache' | 'mock';
}

/**
 * Service health metrics
 */
export interface ServiceHealthMetrics {
  /** Service identifier */
  serviceId: string;
  /** Current health status */
  healthStatus: ServiceHealthStatus;
  /** Available endpoints */
  endpoints: ServiceEndpoint[];
  /** Success rate over time window */
  successRate: number;
  /** Average response time */
  averageResponseTime: number;
  /** Error rate */
  errorRate: number;
  /** Last successful request timestamp */
  lastSuccessful: number;
  /** Total requests */
  totalRequests: number;
  /** Failed requests */
  failedRequests: number;
  /** Circuit breaker status */
  circuitBreakerStatus: Record<string, CircuitBreakerState>;
}

/**
 * Fallback manager statistics
 */
export interface FallbackStats {
  /** Total fallback activations */
  totalFallbacks: number;
  /** Fallbacks by strategy */
  fallbacksByStrategy: Record<FallbackStrategy, number>;
  /** Success rate of fallbacks */
  fallbackSuccessRate: number;
  /** Service health summary */
  serviceHealth: Map<string, ServiceHealthMetrics>;
  /** Active fallback rules */
  activeRules: number;
  /** Circuit breaker activations */
  circuitBreakerActivations: number;
  /** Cache hit rate for fallbacks */
  cacheHitRate: number;
}

/**
 * Fallback manager for graceful degradation and fault tolerance
 */
export class FallbackManager extends EventEmitter {
  private config: FallbackManagerConfig;
  private services: Map<string, ServiceEndpoint[]> = new Map();
  private fallbackRules: Map<string, FallbackRule[]> = new Map();
  private fallbackCache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private healthCheckTimer?: NodeJS.Timeout;
  private stats: FallbackStats;
  private isRunning = false;
  private requestHistory: Map<string, Array<{ timestamp: number; success: boolean; responseTime: number }>> = new Map();

  constructor(config: Partial<FallbackManagerConfig> = {}) {
    super();
    
    this.config = {
      enableAutoFallback: true,
      maxRetryAttempts: 3,
      retryDelay: 1000,
      retryDelayMultiplier: 2,
      maxRetryDelay: 30000,
      circuitBreakerThreshold: 5,
      circuitBreakerTimeout: 60000,
      healthCheckInterval: 30000,
      requestTimeout: 5000,
      enableFallbackCache: true,
      fallbackCacheTtl: 300000, // 5 minutes
      ...config,
    };

    this.stats = {
      totalFallbacks: 0,
      fallbacksByStrategy: {
        'cache': 0,
        'alternative-endpoint': 0,
        'mock-data': 0,
        'partial-response': 0,
        'offline-mode': 0,
      },
      fallbackSuccessRate: 0,
      serviceHealth: new Map(),
      activeRules: 0,
      circuitBreakerActivations: 0,
      cacheHitRate: 0,
    };

    this.setupEventHandlers();
  }

  /**
   * Start fallback manager
   */
  public start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.startHealthChecks();

    this.emit('fallbackManagerStarted', {
      timestamp: Date.now(),
      config: this.config,
    });
  }

  /**
   * Stop fallback manager
   */
  public stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      delete this.healthCheckTimer;
    }

    this.emit('fallbackManagerStopped', {
      timestamp: Date.now(),
      finalStats: this.getStats(),
    });
  }

  /**
   * Register a service with multiple endpoints
   */
  public registerService(serviceId: string, endpoints: Omit<ServiceEndpoint, 'healthStatus' | 'lastHealthCheck' | 'responseTime' | 'successRate' | 'circuitBreakerState' | 'consecutiveFailures'>[]): void {
    const serviceEndpoints: ServiceEndpoint[] = endpoints.map(ep => ({
      ...ep,
      healthStatus: 'unknown' as ServiceHealthStatus,
      lastHealthCheck: 0,
      responseTime: 0,
      successRate: 1,
      circuitBreakerState: 'closed' as CircuitBreakerState,
      consecutiveFailures: 0,
    }));

    this.services.set(serviceId, serviceEndpoints);
    
    // Initialize request history
    this.requestHistory.set(serviceId, []);

    // Initialize health metrics
    this.stats.serviceHealth.set(serviceId, {
      serviceId,
      healthStatus: 'unknown',
      endpoints: serviceEndpoints,
      successRate: 1,
      averageResponseTime: 0,
      errorRate: 0,
      lastSuccessful: 0,
      totalRequests: 0,
      failedRequests: 0,
      circuitBreakerStatus: {},
    });

    this.emit('serviceRegistered', {
      serviceId,
      endpoints: serviceEndpoints.length,
      timestamp: Date.now(),
    });
  }

  /**
   * Add fallback rule for a service
   */
  public addFallbackRule(rule: FallbackRule): void {
    const serviceRules = this.fallbackRules.get(rule.serviceId) || [];
    serviceRules.push(rule);
    serviceRules.sort((a, b) => a.priority - b.priority);
    this.fallbackRules.set(rule.serviceId, serviceRules);

    this.stats.activeRules = Array.from(this.fallbackRules.values())
      .flat()
      .filter(r => r.enabled).length;

    this.emit('fallbackRuleAdded', {
      ruleId: rule.id,
      serviceId: rule.serviceId,
      strategy: rule.strategy,
      timestamp: Date.now(),
    });
  }

  /**
   * Remove fallback rule
   */
  public removeFallbackRule(serviceId: string, ruleId: string): void {
    const serviceRules = this.fallbackRules.get(serviceId) || [];
    const filteredRules = serviceRules.filter(rule => rule.id !== ruleId);
    this.fallbackRules.set(serviceId, filteredRules);

    this.stats.activeRules = Array.from(this.fallbackRules.values())
      .flat()
      .filter(r => r.enabled).length;

    this.emit('fallbackRuleRemoved', {
      ruleId,
      serviceId,
      timestamp: Date.now(),
    });
  }

  /**
   * Execute request with fallback support
   */
  public async executeWithFallback(
    serviceId: string,
    requestFn: (endpoint: ServiceEndpoint) => Promise<any>,
    options: {
      cacheKey?: string;
      enableCache?: boolean;
      mockData?: any;
      timeout?: number;
    } = {}
  ): Promise<FallbackResult> {
    const startTime = Date.now();
    
    try {
      // Check cache first if enabled
      if (options.enableCache !== false && options.cacheKey) {
        const cachedResult = this.getCachedResult(options.cacheKey);
        if (cachedResult) {
          return {
            success: true,
            strategy: 'cache',
            data: cachedResult,
            responseTime: Date.now() - startTime,
            source: 'cache',
          };
        }
      }

      // Get primary endpoint
      const primaryEndpoint = this.getPrimaryEndpoint(serviceId);
      if (primaryEndpoint && this.canUseEndpoint(primaryEndpoint)) {
        try {
          const result = await this.executeRequest(primaryEndpoint, requestFn, options.timeout);
          this.recordSuccess(serviceId, primaryEndpoint.id, Date.now() - startTime);
          
          // Cache successful result
          if (this.config.enableFallbackCache && options.cacheKey) {
            this.cacheResult(options.cacheKey, result);
          }

          return {
            success: true,
            strategy: 'cache', // Using cache as fallback strategy
            data: result,
            responseTime: Date.now() - startTime,
            source: 'primary',
          };
        } catch (error) {
          this.recordFailure(serviceId, primaryEndpoint.id);
          // Continue to fallback logic
        }
      }

      // Execute fallback strategy
      return await this.executeFallback(serviceId, requestFn, options);

    } catch (error) {
      return {
        success: false,
        strategy: 'cache', // Default strategy
        data: null,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error : new Error('Unknown error'),
        source: 'fallback',
      };
    }
  }

  /**
   * Get service health status
   */
  public getServiceHealth(serviceId: string): ServiceHealthMetrics | null {
    return this.stats.serviceHealth.get(serviceId) || null;
  }

  /**
   * Get all fallback statistics
   */
  public getStats(): FallbackStats {
    return { ...this.stats };
  }

  /**
   * Force circuit breaker to open for an endpoint
   */
  public openCircuitBreaker(serviceId: string, endpointId: string): void {
    const endpoints = this.services.get(serviceId);
    if (endpoints) {
      const endpoint = endpoints.find(ep => ep.id === endpointId);
      if (endpoint) {
        endpoint.circuitBreakerState = 'open';
        this.stats.circuitBreakerActivations++;
        
        this.emit('circuitBreakerOpened', {
          serviceId,
          endpointId,
          timestamp: Date.now(),
        });

        // Schedule circuit breaker reset
        setTimeout(() => {
          if (endpoint.circuitBreakerState === 'open') {
            endpoint.circuitBreakerState = 'half-open';
            this.emit('circuitBreakerHalfOpen', {
              serviceId,
              endpointId,
              timestamp: Date.now(),
            });
          }
        }, this.config.circuitBreakerTimeout);
      }
    }
  }

  /**
   * Close circuit breaker for an endpoint
   */
  public closeCircuitBreaker(serviceId: string, endpointId: string): void {
    const endpoints = this.services.get(serviceId);
    if (endpoints) {
      const endpoint = endpoints.find(ep => ep.id === endpointId);
      if (endpoint) {
        endpoint.circuitBreakerState = 'closed';
        endpoint.consecutiveFailures = 0;
        
        this.emit('circuitBreakerClosed', {
          serviceId,
          endpointId,
          timestamp: Date.now(),
        });
      }
    }
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<FallbackManagerConfig>): void {
    this.config = { ...this.config, ...newConfig };

    this.emit('configUpdated', {
      config: this.config,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear fallback cache
   */
  public clearCache(): void {
    const cacheSize = this.fallbackCache.size;
    this.fallbackCache.clear();

    this.emit('cacheCleared', {
      entriesCleared: cacheSize,
      timestamp: Date.now(),
    });
  }

  /**
   * Get primary endpoint for a service
   */
  private getPrimaryEndpoint(serviceId: string): ServiceEndpoint | null {
    const endpoints = this.services.get(serviceId);
    if (!endpoints) return null;

    // Find the primary endpoint with the lowest priority
    return endpoints
      .filter(ep => ep.isPrimary)
      .sort((a, b) => a.priority - b.priority)[0] || null;
  }

  /**
   * Check if endpoint can be used (circuit breaker check)
   */
  private canUseEndpoint(endpoint: ServiceEndpoint): boolean {
    return endpoint.circuitBreakerState !== 'open' && 
           endpoint.healthStatus !== 'unhealthy';
  }

  /**
   * Execute request with timeout
   */
  private async executeRequest(
    endpoint: ServiceEndpoint,
    requestFn: (endpoint: ServiceEndpoint) => Promise<any>,
    timeout?: number
  ): Promise<any> {
    const requestTimeout = timeout || this.config.requestTimeout;
    
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Request timeout after ${requestTimeout}ms`));
      }, requestTimeout);

      requestFn(endpoint)
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  /**
   * Execute fallback strategy
   */
  private async executeFallback(
    serviceId: string,
    requestFn: (endpoint: ServiceEndpoint) => Promise<any>,
    options: any
  ): Promise<FallbackResult> {
    this.stats.totalFallbacks++;
    const startTime = Date.now();

    // Find applicable fallback rules
    const applicableRules = this.getApplicableFallbackRules(serviceId);
    
    for (const rule of applicableRules) {
      try {
        const result = await this.executeFallbackStrategy(rule, serviceId, requestFn, options);
        this.stats.fallbacksByStrategy[rule.strategy]++;
        
        return {
          success: true,
          strategy: rule.strategy,
          data: result,
          responseTime: Date.now() - startTime,
          source: 'fallback',
        };
      } catch (error) {
        // Continue to next rule
        continue;
      }
    }

    throw new Error('All fallback strategies failed');
  }

  /**
   * Get applicable fallback rules for a service
   */
  private getApplicableFallbackRules(serviceId: string): FallbackRule[] {
    const rules = this.fallbackRules.get(serviceId) || [];
    return rules
      .filter(rule => rule.enabled && this.isRuleTriggered(rule))
      .sort((a, b) => a.priority - b.priority);
  }

  /**
   * Check if fallback rule is triggered
   */
  private isRuleTriggered(rule: FallbackRule): boolean {
    const history = this.requestHistory.get(rule.serviceId) || [];
    const now = Date.now();

    for (const trigger of rule.triggers) {
      const relevantHistory = history.filter(
        req => now - req.timestamp <= trigger.timeWindow
      );

      if (relevantHistory.length < trigger.minSamples) {
        continue;
      }

      switch (trigger.type) {
        case 'error-rate': {
          const errorRate = relevantHistory.filter(req => !req.success).length / relevantHistory.length;
          if (errorRate >= trigger.threshold) return true;
          break;
        }
        
        case 'response-time': {
          const avgResponseTime = relevantHistory.reduce((sum, req) => sum + req.responseTime, 0) / relevantHistory.length;
          if (avgResponseTime >= trigger.threshold) return true;
          break;
        }
        
        case 'circuit-breaker': {
          const endpoints = this.services.get(rule.serviceId) || [];
          const openCircuits = endpoints.filter(ep => ep.circuitBreakerState === 'open').length;
          if (openCircuits >= trigger.threshold) return true;
          break;
        }
      }
    }

    return false;
  }

  /**
   * Execute specific fallback strategy
   */
  private async executeFallbackStrategy(
    rule: FallbackRule,
    serviceId: string,
    requestFn: (endpoint: ServiceEndpoint) => Promise<any>,
    options: any
  ): Promise<any> {
    switch (rule.strategy) {
      case 'cache':
        return this.executeCacheFallback(rule, options);
      
      case 'alternative-endpoint':
        return this.executeAlternativeEndpointFallback(rule, serviceId, requestFn, options);
      
      case 'mock-data':
        return this.executeMockDataFallback(rule, options);
      
      case 'partial-response':
        return this.executePartialResponseFallback(rule, options);
      
      case 'offline-mode':
        return this.executeOfflineModeFallback(rule, options);
      
      default:
        throw new Error(`Unknown fallback strategy: ${rule.strategy}`);
    }
  }

  /**
   * Execute cache fallback strategy
   */
  private async executeCacheFallback(_rule: FallbackRule, options: any): Promise<any> {
    if (!options.cacheKey) {
      throw new Error('Cache key required for cache fallback');
    }

    const cachedResult = this.getCachedResult(options.cacheKey, true); // Allow stale cache
    if (cachedResult) {
      return cachedResult;
    }

    throw new Error('No cached data available');
  }

  /**
   * Execute alternative endpoint fallback strategy
   */
  private async executeAlternativeEndpointFallback(
    _rule: FallbackRule,
    serviceId: string,
    requestFn: (endpoint: ServiceEndpoint) => Promise<any>,
    options: any
  ): Promise<any> {
    const endpoints = this.services.get(serviceId) || [];
    const alternativeEndpoints = endpoints
      .filter(ep => !ep.isPrimary && this.canUseEndpoint(ep))
      .sort((a, b) => a.priority - b.priority);

    for (const endpoint of alternativeEndpoints) {
      try {
        const result = await this.executeRequest(endpoint, requestFn, options.timeout);
        this.recordSuccess(serviceId, endpoint.id, 0);
        return result;
      } catch (error) {
        this.recordFailure(serviceId, endpoint.id);
        continue;
      }
    }

    throw new Error('All alternative endpoints failed');
  }

  /**
   * Execute mock data fallback strategy
   */
  private async executeMockDataFallback(rule: FallbackRule, options: any): Promise<any> {
    const mockData = options['mockData'] || rule.config['mockData'];
    if (!mockData) {
      throw new Error('No mock data available');
    }
    return mockData;
  }

  /**
   * Execute partial response fallback strategy
   */
  private async executePartialResponseFallback(rule: FallbackRule, _options: any): Promise<any> {
    // Return a partial response with available data
    return {
      status: 'partial',
      message: 'Some data may be unavailable due to service issues',
      data: rule.config['partialData'] || {},
      timestamp: Date.now(),
    };
  }

  /**
   * Execute offline mode fallback strategy
   */
  private async executeOfflineModeFallback(rule: FallbackRule, _options: any): Promise<any> {
    // Return offline mode response
    return {
      status: 'offline',
      message: 'Operating in offline mode',
      data: rule.config['offlineData'] || null,
      timestamp: Date.now(),
    };
  }

  /**
   * Get cached result
   */
  private getCachedResult(cacheKey: string, allowStale = false): any | null {
    const cached = this.fallbackCache.get(cacheKey);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > cached.ttl;
    if (isExpired && !allowStale) {
      this.fallbackCache.delete(cacheKey);
      return null;
    }

    return cached.data;
  }

  /**
   * Cache result
   */
  private cacheResult(cacheKey: string, data: any, ttl?: number): void {
    this.fallbackCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.fallbackCacheTtl,
    });
  }

  /**
   * Record successful request
   */
  private recordSuccess(serviceId: string, endpointId: string, responseTime: number): void {
    const history = this.requestHistory.get(serviceId) || [];
    history.push({
      timestamp: Date.now(),
      success: true,
      responseTime,
    });

    // Keep only recent history
    this.requestHistory.set(serviceId, history.slice(-100));

    // Update endpoint stats
    const endpoints = this.services.get(serviceId);
    if (endpoints) {
      const endpoint = endpoints.find(ep => ep.id === endpointId);
      if (endpoint) {
        endpoint.consecutiveFailures = 0;
        endpoint.responseTime = responseTime;
        endpoint.lastHealthCheck = Date.now();
        endpoint.healthStatus = 'healthy';
        
        if (endpoint.circuitBreakerState === 'half-open') {
          this.closeCircuitBreaker(serviceId, endpointId);
        }
      }
    }

    this.updateServiceHealthMetrics(serviceId);
  }

  /**
   * Record failed request
   */
  private recordFailure(serviceId: string, endpointId: string): void {
    const history = this.requestHistory.get(serviceId) || [];
    history.push({
      timestamp: Date.now(),
      success: false,
      responseTime: 0,
    });

    // Keep only recent history
    this.requestHistory.set(serviceId, history.slice(-100));

    // Update endpoint stats
    const endpoints = this.services.get(serviceId);
    if (endpoints) {
      const endpoint = endpoints.find(ep => ep.id === endpointId);
      if (endpoint) {
        endpoint.consecutiveFailures++;
        endpoint.healthStatus = 'unhealthy';
        
        if (endpoint.consecutiveFailures >= this.config.circuitBreakerThreshold) {
          this.openCircuitBreaker(serviceId, endpointId);
        }
      }
    }

    this.updateServiceHealthMetrics(serviceId);
  }

  /**
   * Update service health metrics
   */
  private updateServiceHealthMetrics(serviceId: string): void {
    const history = this.requestHistory.get(serviceId) || [];
    const recentHistory = history.filter(req => 
      Date.now() - req.timestamp <= 300000 // Last 5 minutes
    );

    const healthMetrics = this.stats.serviceHealth.get(serviceId);
    if (healthMetrics) {
      healthMetrics.totalRequests = history.length;
      healthMetrics.failedRequests = history.filter(req => !req.success).length;
      healthMetrics.successRate = recentHistory.length > 0 
        ? recentHistory.filter(req => req.success).length / recentHistory.length 
        : 1;
      healthMetrics.errorRate = 1 - healthMetrics.successRate;
      healthMetrics.averageResponseTime = recentHistory.length > 0
        ? recentHistory.reduce((sum, req) => sum + req.responseTime, 0) / recentHistory.length
        : 0;
      
      const lastSuccessful = recentHistory.find(req => req.success);
      if (lastSuccessful) {
        healthMetrics.lastSuccessful = lastSuccessful.timestamp;
      }

      // Determine overall health status
      if (healthMetrics.successRate >= 0.95) {
        healthMetrics.healthStatus = 'healthy';
      } else if (healthMetrics.successRate >= 0.8) {
        healthMetrics.healthStatus = 'degraded';
      } else {
        healthMetrics.healthStatus = 'unhealthy';
      }
    }
  }

  /**
   * Start health checks
   */
  private startHealthChecks(): void {
    this.healthCheckTimer = setInterval(() => {
      this.performHealthChecks();
    }, this.config.healthCheckInterval);
  }

  /**
   * Perform health checks on all endpoints
   */
  private async performHealthChecks(): Promise<void> {
    for (const [serviceId, endpoints] of this.services) {
      for (const endpoint of endpoints) {
        try {
          // Perform basic health check (could be customized)
          const startTime = Date.now();
          // This would be replaced with actual health check logic
          endpoint.responseTime = Date.now() - startTime;
          endpoint.lastHealthCheck = Date.now();
          
          if (endpoint.circuitBreakerState === 'half-open') {
            // Test if service is back online
            endpoint.healthStatus = 'healthy';
            this.closeCircuitBreaker(serviceId, endpoint.id);
          }
        } catch (error) {
          endpoint.healthStatus = 'unhealthy';
        }
      }
    }

    this.emit('healthCheckCompleted', {
      timestamp: Date.now(),
    });
  }

  /**
   * Set up event handlers
   */
  private setupEventHandlers(): void {
    // Clean up expired cache entries periodically
    setInterval(() => {
      this.cleanupExpiredCache();
    }, 60000); // Every minute
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupExpiredCache(): void {
    const now = Date.now();
    for (const [key, cached] of this.fallbackCache) {
      if (now - cached.timestamp > cached.ttl) {
        this.fallbackCache.delete(key);
      }
    }
  }
}