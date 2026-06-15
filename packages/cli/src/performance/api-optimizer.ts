/**
 * @fileoverview API call optimization strategies
 * Reduces duplicate and unnecessary requests through caching and deduplication
 * @author Development Team
 * @since 1.0.0
 */

import { EventEmitter } from 'events';
import { createHash } from 'crypto';

/**
 * Configuration for API optimization
 */
export interface ApiOptimizerConfig {
  /** Enable request caching */
  enableCaching: boolean;
  /** Cache TTL in milliseconds */
  cacheTtl: number;
  /** Maximum cache size in entries */
  maxCacheSize: number;
  /** Enable request deduplication */
  enableDeduplication: boolean;
  /** Deduplication window in milliseconds */
  deduplicationWindow: number;
  /** Enable request coalescing */
  enableCoalescing: boolean;
  /** Coalescing window in milliseconds */
  coalescingWindow: number;
  /** Enable response compression */
  enableCompression: boolean;
  /** Compression threshold in bytes */
  compressionThreshold: number;
}

/**
 * Cache entry for API responses
 */
interface CacheEntry {
  /** Response data */
  data: any;
  /** Timestamp when cached */
  timestamp: number;
  /** Cache TTL */
  ttl: number;
  /** Request hash for identification */
  hash: string;
  /** Hit count */
  hitCount: number;
  /** Size in bytes */
  size: number;
}

/**
 * Request signature for deduplication
 */
interface RequestSignature {
  /** Request method */
  method: string;
  /** Request URL */
  url: string;
  /** Request parameters hash */
  paramsHash: string;
  /** Request body hash */
  bodyHash?: string;
}

/**
 * Pending request for coalescing
 */
interface PendingRequest {
  /** Request signature */
  signature: RequestSignature;
  /** Request timestamp */
  timestamp: number;
  /** Promise resolvers */
  resolvers: Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }>;
  /** Request priority */
  priority: 'low' | 'medium' | 'high';
}

/**
 * Optimization statistics
 */
export interface OptimizationStats {
  /** Total requests made */
  totalRequests: number;
  /** Cached requests served */
  cachedRequests: number;
  /** Deduplicated requests */
  deduplicatedRequests: number;
  /** Coalesced requests */
  coalescedRequests: number;
  /** Cache hit ratio */
  cacheHitRatio: number;
  /** Average response time */
  averageResponseTime: number;
  /** Bytes saved through optimization */
  bytesSaved: number;
  /** Current cache size */
  currentCacheSize: number;
}

/**
 * API request optimizer with caching, deduplication, and coalescing
 */
export class ApiOptimizer extends EventEmitter {
  private config: ApiOptimizerConfig;
  private cache: Map<string, CacheEntry> = new Map();
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private recentRequests: Map<string, number> = new Map();
  private stats: OptimizationStats;
  private coalescingTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(config: Partial<ApiOptimizerConfig> = {}) {
    super();
    
    this.config = {
      enableCaching: true,
      cacheTtl: 30000, // 30 seconds
      maxCacheSize: 1000,
      enableDeduplication: true,
      deduplicationWindow: 1000, // 1 second
      enableCoalescing: true,
      coalescingWindow: 100, // 100ms
      enableCompression: true,
      compressionThreshold: 1024, // 1KB
      ...config,
    };

    this.stats = {
      totalRequests: 0,
      cachedRequests: 0,
      deduplicatedRequests: 0,
      coalescedRequests: 0,
      cacheHitRatio: 0,
      averageResponseTime: 0,
      bytesSaved: 0,
      currentCacheSize: 0,
    };

    this.setupCacheCleanup();
  }

  /**
   * Optimize an API request
   */
  public async optimizeRequest(
    method: string,
    url: string,
    params: Record<string, any> = {},
    body?: any,
    options: {
      priority?: 'low' | 'medium' | 'high';
      bypassCache?: boolean;
      ttl?: number;
    } = {}
  ): Promise<any> {
    const startTime = Date.now();
    this.stats.totalRequests++;

    // Create request signature
    const signature = this.createRequestSignature(method, url, params, body);
    const requestHash = this.hashSignature(signature);

    try {
      // Check cache first (if enabled and not bypassed)
      if (this.config.enableCaching && !options.bypassCache) {
        const cachedResponse = this.getCachedResponse(requestHash);
        if (cachedResponse) {
          this.stats.cachedRequests++;
          this.updateStats(startTime);
          
          this.emit('cacheHit', {
            signature,
            timestamp: Date.now(),
            size: cachedResponse.size,
          });
          
          return cachedResponse.data;
        }
      }

      // Check for duplicate requests (if enabled)
      if (this.config.enableDeduplication) {
        const duplicateResponse = this.checkForDuplicate(signature, requestHash);
        if (duplicateResponse) {
          this.stats.deduplicatedRequests++;
          this.updateStats(startTime);
          
          this.emit('requestDeduplicated', {
            signature,
            timestamp: Date.now(),
          });
          
          return duplicateResponse;
        }
      }

      // Check for coalescing opportunity (if enabled)
      if (this.config.enableCoalescing) {
        const coalescedResponse = await this.coalesceRequest(
          signature,
          requestHash,
          options.priority || 'medium'
        );
        if (coalescedResponse !== null) {
          this.stats.coalescedRequests++;
          this.updateStats(startTime);
          
          this.emit('requestCoalesced', {
            signature,
            timestamp: Date.now(),
          });
          
          return coalescedResponse;
        }
      }

      // Execute the actual request
      const response = await this.executeRequest(method, url, params, body);

      // Cache the response (if enabled)
      if (this.config.enableCaching) {
        this.cacheResponse(requestHash, response, options.ttl);
      }

      // Update recent requests for deduplication
      this.recentRequests.set(requestHash, Date.now());

      this.updateStats(startTime);
      
      this.emit('requestCompleted', {
        signature,
        responseTime: Date.now() - startTime,
        timestamp: Date.now(),
      });

      return response;

    } catch (error) {
      this.updateStats(startTime);
      
      this.emit('requestError', {
        signature,
        error,
        timestamp: Date.now(),
      });
      
      throw error;
    }
  }

  /**
   * Invalidate cache entries
   */
  public invalidateCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      this.stats.currentCacheSize = 0;
      this.emit('cacheCleared', { timestamp: Date.now() });
      return;
    }

    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache) {
      if (regex.test(key) || regex.test(entry.hash)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
    }

    this.stats.currentCacheSize = this.cache.size;
    
    this.emit('cacheInvalidated', {
      pattern,
      entriesRemoved: keysToDelete.length,
      timestamp: Date.now(),
    });
  }

  /**
   * Get optimization statistics
   */
  public getStats(): OptimizationStats {
    return { ...this.stats };
  }

  /**
   * Get cache information
   */
  public getCacheInfo(): {
    size: number;
    entries: Array<{
      hash: string;
      timestamp: number;
      ttl: number;
      hitCount: number;
      size: number;
    }>;
  } {
    const entries = Array.from(this.cache.entries()).map(([hash, entry]) => ({
      hash,
      timestamp: entry.timestamp,
      ttl: entry.ttl,
      hitCount: entry.hitCount,
      size: entry.size,
    }));

    return {
      size: this.cache.size,
      entries,
    };
  }

  /**
   * Configure optimizer settings
   */
  public updateConfig(newConfig: Partial<ApiOptimizerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    this.emit('configUpdated', {
      config: this.config,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear all optimization data
   */
  public reset(): void {
    this.cache.clear();
    this.pendingRequests.clear();
    this.recentRequests.clear();
    
    // Clear timers
    for (const timer of this.coalescingTimers.values()) {
      clearTimeout(timer);
    }
    this.coalescingTimers.clear();

    // Reset stats
    this.stats = {
      totalRequests: 0,
      cachedRequests: 0,
      deduplicatedRequests: 0,
      coalescedRequests: 0,
      cacheHitRatio: 0,
      averageResponseTime: 0,
      bytesSaved: 0,
      currentCacheSize: 0,
    };

    this.emit('optimizerReset', { timestamp: Date.now() });
  }

  /**
   * Create a request signature for identification
   */
  private createRequestSignature(
    method: string,
    url: string,
    params: Record<string, any>,
    body?: any
  ): RequestSignature {
    const paramsHash = this.hashObject(params);
    const bodyHash = body ? this.hashObject(body) : undefined;

    return {
      method: method.toUpperCase(),
      url,
      paramsHash,
      bodyHash: bodyHash || '',
    };
  }

  /**
   * Hash a request signature
   */
  private hashSignature(signature: RequestSignature): string {
    const combined = `${signature.method}:${signature.url}:${signature.paramsHash}:${signature.bodyHash || ''}`;
    return createHash('md5').update(combined).digest('hex');
  }

  /**
   * Hash an object for comparison
   */
  private hashObject(obj: any): string {
    const serialized = JSON.stringify(obj, Object.keys(obj).sort());
    return createHash('md5').update(serialized).digest('hex');
  }

  /**
   * Get cached response if available and valid
   */
  private getCachedResponse(requestHash: string): CacheEntry | null {
    const entry = this.cache.get(requestHash);
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(requestHash);
      this.stats.currentCacheSize = this.cache.size;
      return null;
    }

    // Update hit count
    entry.hitCount++;
    
    return entry;
  }

  /**
   * Check for duplicate requests in the deduplication window
   */
  private checkForDuplicate(_signature: RequestSignature, requestHash: string): Promise<any> | null {
    const lastRequestTime = this.recentRequests.get(requestHash);
    if (!lastRequestTime) {
      return null;
    }

    const now = Date.now();
    if (now - lastRequestTime > this.config.deduplicationWindow) {
      this.recentRequests.delete(requestHash);
      return null;
    }

    // Check if there's a pending request for the same signature
    const pendingRequest = this.pendingRequests.get(requestHash);
    if (pendingRequest) {
      return new Promise((resolve, reject) => {
        pendingRequest.resolvers.push({ resolve, reject });
      });
    }

    return null;
  }

  /**
   * Handle request coalescing
   */
  private async coalesceRequest(
    signature: RequestSignature,
    requestHash: string,
    priority: 'low' | 'medium' | 'high'
  ): Promise<any> {
    const existingPending = this.pendingRequests.get(requestHash);
    
    if (existingPending) {
      // Add to existing pending request
      return new Promise((resolve, reject) => {
        existingPending.resolvers.push({ resolve, reject });
        
        // Update priority if higher
        if (this.getPriorityValue(priority) > this.getPriorityValue(existingPending.priority)) {
          existingPending.priority = priority;
        }
      });
    }

    // Create new pending request
    const pendingRequest: PendingRequest = {
      signature,
      timestamp: Date.now(),
      resolvers: [],
      priority,
    };

    this.pendingRequests.set(requestHash, pendingRequest);

    // Set up coalescing timer
    const timer = setTimeout(() => {
      this.executePendingRequest(requestHash);
    }, this.config.coalescingWindow);

    this.coalescingTimers.set(requestHash, timer);

    return new Promise((resolve, reject) => {
      pendingRequest.resolvers.push({ resolve, reject });
    });
  }

  /**
   * Execute a pending coalesced request
   */
  private async executePendingRequest(requestHash: string): Promise<void> {
    const pendingRequest = this.pendingRequests.get(requestHash);
    if (!pendingRequest) {
      return;
    }

    // Clear timer
    const timer = this.coalescingTimers.get(requestHash);
    if (timer) {
      clearTimeout(timer);
      this.coalescingTimers.delete(requestHash);
    }

    // Remove from pending requests
    this.pendingRequests.delete(requestHash);

    try {
      const { signature } = pendingRequest;
      const response = await this.executeRequest(
        signature.method,
        signature.url,
        {}, // TODO: Reconstruct params from signature
        undefined // TODO: Reconstruct body from signature
      );

      // Resolve all pending promises
      for (const { resolve } of pendingRequest.resolvers) {
        resolve(response);
      }

      // Cache the response
      if (this.config.enableCaching) {
        this.cacheResponse(requestHash, response);
      }

    } catch (error) {
      // Reject all pending promises
      for (const { reject } of pendingRequest.resolvers) {
        reject(error);
      }
    }
  }

  /**
   * Execute the actual API request
   */
  private async executeRequest(
    method: string,
    url: string,
    params: Record<string, any>,
    body?: any
  ): Promise<any> {
    // This is a placeholder - in real implementation, this would make the actual HTTP request
    // using axios, fetch, or another HTTP client
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 200));
    
    // Simulate response based on request
    const response = {
      method,
      url,
      params,
      body,
      timestamp: Date.now(),
      data: `Mock response for ${method} ${url}`,
    };

    return response;
  }

  /**
   * Cache a response
   */
  private cacheResponse(requestHash: string, response: any, ttl?: number): void {
    const now = Date.now();
    const responseSize = this.estimateSize(response);
    
    const entry: CacheEntry = {
      data: response,
      timestamp: now,
      ttl: ttl || this.config.cacheTtl,
      hash: requestHash,
      hitCount: 0,
      size: responseSize,
    };

    // Check cache size limit
    if (this.cache.size >= this.config.maxCacheSize) {
      this.evictOldestEntry();
    }

    this.cache.set(requestHash, entry);
    this.stats.currentCacheSize = this.cache.size;
    
    this.emit('responseCached', {
      hash: requestHash,
      size: responseSize,
      timestamp: now,
    });
  }

  /**
   * Evict oldest cache entry
   */
  private evictOldestEntry(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      
      this.emit('cacheEvicted', {
        hash: oldestKey,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Estimate response size in bytes
   */
  private estimateSize(data: any): number {
    return JSON.stringify(data).length;
  }

  /**
   * Get numeric priority value
   */
  private getPriorityValue(priority: 'low' | 'medium' | 'high'): number {
    switch (priority) {
      case 'low': return 1;
      case 'medium': return 2;
      case 'high': return 3;
      default: return 2;
    }
  }

  /**
   * Update statistics
   */
  private updateStats(startTime: number): void {
    const responseTime = Date.now() - startTime;
    
    // Update average response time
    this.stats.averageResponseTime = (
      (this.stats.averageResponseTime * (this.stats.totalRequests - 1)) + responseTime
    ) / this.stats.totalRequests;

    // Update cache hit ratio
    this.stats.cacheHitRatio = this.stats.totalRequests > 0 
      ? this.stats.cachedRequests / this.stats.totalRequests 
      : 0;

    // Update current cache size
    this.stats.currentCacheSize = this.cache.size;
  }

  /**
   * Set up periodic cache cleanup
   */
  private setupCacheCleanup(): void {
    setInterval(() => {
      this.cleanupExpiredEntries();
    }, 60000); // Clean every minute
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
    }

    if (keysToDelete.length > 0) {
      this.stats.currentCacheSize = this.cache.size;
      
      this.emit('cacheCleanup', {
        entriesRemoved: keysToDelete.length,
        timestamp: now,
      });
    }
  }
}