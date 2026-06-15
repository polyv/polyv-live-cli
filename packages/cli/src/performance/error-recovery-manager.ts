/**
 * @fileoverview Error recovery and exception handling manager
 * Provides automatic error detection, classification, and recovery mechanisms
 * @author Development Team
 * @since 1.0.0
 */

import { EventEmitter } from 'events';

/**
 * Configuration for error recovery behavior
 */
export interface ErrorRecoveryConfig {
  /** Enable automatic error recovery */
  enableAutoRecovery: boolean;
  /** Maximum retry attempts per error */
  maxRetryAttempts: number;
  /** Base retry delay in milliseconds */
  baseRetryDelay: number;
  /** Retry delay multiplier for exponential backoff */
  retryDelayMultiplier: number;
  /** Maximum retry delay in milliseconds */
  maxRetryDelay: number;
  /** Error history size to keep */
  errorHistorySize: number;
  /** Critical error threshold */
  criticalErrorThreshold: number;
  /** Error recovery timeout in milliseconds */
  recoveryTimeout: number;
  /** Enable error logging */
  enableErrorLogging: boolean;
  /** Enable user notifications */
  enableUserNotifications: boolean;
  /** Fallback mode timeout in milliseconds */
  fallbackModeTimeout: number;
}

/**
 * Error classification types
 */
export type ErrorType = 
  | 'network'
  | 'api'
  | 'render'
  | 'memory'
  | 'configuration'
  | 'validation'
  | 'timeout'
  | 'permission'
  | 'unknown';

/**
 * Error severity levels
 */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Recovery strategy types
 */
export type RecoveryStrategy = 
  | 'retry'
  | 'fallback'
  | 'reset'
  | 'ignore'
  | 'escalate'
  | 'restart';

/**
 * Error record
 */
export interface ErrorRecord {
  /** Error ID */
  id: string;
  /** Error type */
  type: ErrorType;
  /** Error severity */
  severity: ErrorSeverity;
  /** Error message */
  message: string;
  /** Error stack trace */
  stack?: string;
  /** Error context */
  context: {
    component: string;
    operation: string;
    parameters?: Record<string, any>;
    timestamp: number;
  };
  /** Recovery attempts */
  recoveryAttempts: number;
  /** Maximum retry attempts */
  maxRetries: number;
  /** Whether error was recovered */
  recovered: boolean;
  /** Recovery strategy used */
  recoveryStrategy?: RecoveryStrategy;
  /** Recovery time if successful */
  recoveryTime?: number;
  /** First occurrence timestamp */
  firstOccurrence: number;
  /** Last occurrence timestamp */
  lastOccurrence: number;
  /** Occurrence count */
  occurrenceCount: number;
}

/**
 * Error pattern
 */
export interface ErrorPattern {
  /** Pattern ID */
  id: string;
  /** Pattern description */
  description: string;
  /** Error type pattern */
  errorType: ErrorType;
  /** Component pattern */
  componentPattern: string;
  /** Message pattern (regex) */
  messagePattern: RegExp;
  /** Recommended recovery strategy */
  recoveryStrategy: RecoveryStrategy;
  /** Pattern confidence (0-1) */
  confidence: number;
  /** Pattern occurrences */
  occurrences: number;
  /** Last seen timestamp */
  lastSeen: number;
}

/**
 * Recovery result
 */
export interface RecoveryResult {
  /** Whether recovery was successful */
  success: boolean;
  /** Recovery strategy used */
  strategy: RecoveryStrategy;
  /** Recovery time in milliseconds */
  recoveryTime: number;
  /** Error that was recovered */
  error: ErrorRecord;
  /** Recovery details */
  details?: string;
  /** New error if recovery failed */
  newError?: Error;
}

/**
 * Error statistics
 */
export interface ErrorStatistics {
  /** Total errors recorded */
  totalErrors: number;
  /** Errors by type */
  errorsByType: Record<ErrorType, number>;
  /** Errors by severity */
  errorsBySeverity: Record<ErrorSeverity, number>;
  /** Errors by component */
  errorsByComponent: Record<string, number>;
  /** Recovery success rate */
  recoverySuccessRate: number;
  /** Average recovery time */
  averageRecoveryTime: number;
  /** Most common error patterns */
  commonPatterns: ErrorPattern[];
  /** Error trends */
  trends: {
    errorRate: number;
    recoveryRate: number;
    criticalErrors: number;
    recentErrors: number;
  };
}

/**
 * User-friendly error message
 */
export interface UserErrorMessage {
  /** Error ID */
  id: string;
  /** User-friendly title */
  title: string;
  /** User-friendly description */
  description: string;
  /** Suggested user actions */
  suggestedActions: string[];
  /** Error severity for user */
  severity: 'info' | 'warning' | 'error';
  /** Whether error is recoverable */
  recoverable: boolean;
  /** Recovery status */
  recoveryStatus: 'pending' | 'in-progress' | 'completed' | 'failed';
}

/**
 * Error recovery and exception handling manager
 */
export class ErrorRecoveryManager extends EventEmitter {
  private config: ErrorRecoveryConfig;
  private errorHistory: ErrorRecord[] = [];
  private errorPatterns: Map<string, ErrorPattern> = new Map();
  private recoveryStrategies: Map<string, (error: ErrorRecord) => Promise<RecoveryResult>> = new Map();
  private errorIdCounter = 0;
  private patternIdCounter = 0;
  private isRunning = false;
  private criticalErrorCount = 0;
  private fallbackModeActive = false;
  private fallbackModeTimer?: NodeJS.Timeout;

  constructor(config: Partial<ErrorRecoveryConfig> = {}) {
    super();
    
    this.config = {
      enableAutoRecovery: true,
      maxRetryAttempts: 3,
      baseRetryDelay: 1000,
      retryDelayMultiplier: 2,
      maxRetryDelay: 30000,
      errorHistorySize: 1000,
      criticalErrorThreshold: 5,
      recoveryTimeout: 30000,
      enableErrorLogging: true,
      enableUserNotifications: true,
      fallbackModeTimeout: 300000, // 5 minutes
      ...config,
    };

    this.initializeRecoveryStrategies();
    this.initializeErrorPatterns();
    this.setupEventHandlers();
  }

  /**
   * Start error recovery manager
   */
  public start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.criticalErrorCount = 0;
    this.fallbackModeActive = false;

    this.emit('recoveryManagerStarted', {
      timestamp: Date.now(),
      config: this.config,
    });
  }

  /**
   * Stop error recovery manager
   */
  public stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    if (this.fallbackModeTimer) {
      clearTimeout(this.fallbackModeTimer);
      delete this.fallbackModeTimer;
    }

    const finalStats = this.getStatistics();

    this.emit('recoveryManagerStopped', {
      timestamp: Date.now(),
      finalStats,
    });
  }

  /**
   * Report an error for handling
   */
  public async reportError(
    error: Error,
    context: {
      component: string;
      operation: string;
      parameters?: Record<string, any>;
    }
  ): Promise<void> {
    const errorRecord = this.createErrorRecord(error, context);
    
    // Check for existing error pattern
    const existingError = this.findExistingError(errorRecord);
    if (existingError) {
      existingError.occurrenceCount++;
      existingError.lastOccurrence = Date.now();
      this.updateErrorPattern(existingError);
    } else {
      this.errorHistory.push(errorRecord);
      this.learnErrorPattern(errorRecord);
    }

    // Limit error history
    if (this.errorHistory.length > this.config.errorHistorySize) {
      this.errorHistory = this.errorHistory.slice(-this.config.errorHistorySize);
    }

    // Log error if enabled
    if (this.config.enableErrorLogging) {
      this.logError(errorRecord);
    }

    // Emit error event
    this.emit('errorReported', {
      error: errorRecord,
      timestamp: Date.now(),
    });

    // Attempt recovery if enabled
    if (this.config.enableAutoRecovery && this.isRunning) {
      await this.attemptRecovery(errorRecord);
    }

    // Check for critical error threshold
    if (errorRecord.severity === 'critical') {
      this.criticalErrorCount++;
      if (this.criticalErrorCount >= this.config.criticalErrorThreshold) {
        this.activateFallbackMode();
      }
    }
  }

  /**
   * Attempt to recover from an error
   */
  public async attemptRecovery(errorRecord: ErrorRecord): Promise<RecoveryResult> {
    if (errorRecord.recoveryAttempts >= errorRecord.maxRetries) {
      return {
        success: false,
        strategy: 'escalate',
        recoveryTime: 0,
        error: errorRecord,
        details: 'Maximum retry attempts exceeded',
      };
    }

    const startTime = Date.now();
    errorRecord.recoveryAttempts++;

    try {
      // Determine recovery strategy
      const strategy = this.determineRecoveryStrategy(errorRecord);
      
      // Execute recovery strategy
      const recoveryFunction = this.recoveryStrategies.get(strategy);
      if (!recoveryFunction) {
        throw new Error(`Unknown recovery strategy: ${strategy}`);
      }

      const result = await Promise.race([
        recoveryFunction(errorRecord),
        this.createTimeoutPromise(this.config.recoveryTimeout),
      ]);

      // Set recovery strategy regardless of success
      errorRecord.recoveryStrategy = strategy;
      errorRecord.recoveryTime = Date.now() - startTime;
      
      if (result.success) {
        errorRecord.recovered = true;
        
        this.emit('errorRecovered', {
          error: errorRecord,
          result,
          timestamp: Date.now(),
        });
      } else {
        this.emit('recoveryFailed', {
          error: errorRecord,
          result,
          timestamp: Date.now(),
        });
      }

      return result;

    } catch (recoveryError) {
      const result: RecoveryResult = {
        success: false,
        strategy: 'escalate',
        recoveryTime: Date.now() - startTime,
        error: errorRecord,
        details: 'Recovery attempt failed',
        newError: recoveryError instanceof Error ? recoveryError : new Error('Unknown recovery error'),
      };

      this.emit('recoveryFailed', {
        error: errorRecord,
        result,
        timestamp: Date.now(),
      });

      return result;
    }
  }

  /**
   * Get error statistics
   */
  public getStatistics(): ErrorStatistics {
    const totalErrors = this.errorHistory.length;
    const errorsByType: Record<ErrorType, number> = {
      network: 0,
      api: 0,
      render: 0,
      memory: 0,
      configuration: 0,
      validation: 0,
      timeout: 0,
      permission: 0,
      unknown: 0,
    };
    const errorsBySeverity: Record<ErrorSeverity, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };
    const errorsByComponent: Record<string, number> = {};

    let totalRecoveryTime = 0;
    let recoveredErrors = 0;
    let recentErrors = 0;
    const oneHourAgo = Date.now() - 3600000;

    for (const error of this.errorHistory) {
      errorsByType[error.type]++;
      errorsBySeverity[error.severity]++;
      
      const component = error.context.component;
      errorsByComponent[component] = (errorsByComponent[component] || 0) + 1;

      if (error.recovered && error.recoveryTime) {
        totalRecoveryTime += error.recoveryTime;
        recoveredErrors++;
      }

      if (error.lastOccurrence > oneHourAgo) {
        recentErrors++;
      }
    }

    const recoverySuccessRate = totalErrors > 0 ? recoveredErrors / totalErrors : 0;
    const averageRecoveryTime = recoveredErrors > 0 ? totalRecoveryTime / recoveredErrors : 0;

    return {
      totalErrors,
      errorsByType,
      errorsBySeverity,
      errorsByComponent,
      recoverySuccessRate,
      averageRecoveryTime,
      commonPatterns: Array.from(this.errorPatterns.values())
        .sort((a, b) => b.occurrences - a.occurrences)
        .slice(0, 10),
      trends: {
        errorRate: recentErrors / Math.max(1, totalErrors),
        recoveryRate: recoverySuccessRate,
        criticalErrors: errorsBySeverity.critical,
        recentErrors,
      },
    };
  }

  /**
   * Get error history
   */
  public getErrorHistory(timeRange?: { start: number; end: number }): ErrorRecord[] {
    if (!timeRange) {
      return [...this.errorHistory];
    }

    return this.errorHistory.filter(
      error => error.lastOccurrence >= timeRange.start && error.lastOccurrence <= timeRange.end
    );
  }

  /**
   * Get user-friendly error message
   */
  public getUserErrorMessage(errorRecord: ErrorRecord): UserErrorMessage {
    const severity = this.mapSeverityToUser(errorRecord.severity);
    const recoverable = this.isErrorRecoverable(errorRecord);
    const recoveryStatus = this.getRecoveryStatus(errorRecord);

    return {
      id: errorRecord.id,
      title: this.generateUserFriendlyTitle(errorRecord),
      description: this.generateUserFriendlyDescription(errorRecord),
      suggestedActions: this.generateUserActions(errorRecord),
      severity,
      recoverable,
      recoveryStatus,
    };
  }

  /**
   * Clear error history
   */
  public clearErrorHistory(): void {
    const clearedCount = this.errorHistory.length;
    this.errorHistory = [];
    this.errorPatterns.clear();
    this.criticalErrorCount = 0;

    this.emit('errorHistoryCleared', {
      clearedCount,
      timestamp: Date.now(),
    });
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<ErrorRecoveryConfig>): void {
    this.config = { ...this.config, ...newConfig };

    this.emit('configUpdated', {
      config: this.config,
      timestamp: Date.now(),
    });
  }

  /**
   * Register custom recovery strategy
   */
  public registerRecoveryStrategy(
    name: string,
    strategy: (error: ErrorRecord) => Promise<RecoveryResult>
  ): void {
    this.recoveryStrategies.set(name, strategy);

    this.emit('recoveryStrategyRegistered', {
      name,
      timestamp: Date.now(),
    });
  }

  /**
   * Force activate fallback mode
   */
  public activateFallbackMode(): void {
    if (this.fallbackModeActive) {
      return;
    }

    this.fallbackModeActive = true;
    
    this.emit('fallbackModeActivated', {
      reason: 'Critical error threshold exceeded',
      timestamp: Date.now(),
    });

    // Schedule fallback mode deactivation
    this.fallbackModeTimer = setTimeout(() => {
      this.deactivateFallbackMode();
    }, this.config.fallbackModeTimeout);
  }

  /**
   * Deactivate fallback mode
   */
  public deactivateFallbackMode(): void {
    if (!this.fallbackModeActive) {
      return;
    }

    this.fallbackModeActive = false;
    this.criticalErrorCount = 0;

    if (this.fallbackModeTimer) {
      clearTimeout(this.fallbackModeTimer);
      delete this.fallbackModeTimer;
    }

    this.emit('fallbackModeDeactivated', {
      timestamp: Date.now(),
    });
  }

  /**
   * Check if fallback mode is active
   */
  public isFallbackModeActive(): boolean {
    return this.fallbackModeActive;
  }

  /**
   * Create error record from error and context
   */
  private createErrorRecord(error: Error, context: any): ErrorRecord {
    const errorType = this.classifyError(error);
    const severity = this.determineSeverity(error, errorType);
    const maxRetries = this.getMaxRetries(errorType, severity);

    return {
      id: `error_${++this.errorIdCounter}`,
      type: errorType,
      severity,
      message: error.message,
      context: {
        ...context,
        timestamp: Date.now(),
      },
      recoveryAttempts: 0,
      maxRetries,
      recovered: false,
      firstOccurrence: Date.now(),
      lastOccurrence: Date.now(),
      occurrenceCount: 1,
      ...(error.stack && { stack: error.stack }),
    };
  }

  /**
   * Classify error type
   */
  private classifyError(error: Error): ErrorType {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return 'network';
    }
    if (message.includes('api') || message.includes('request') || message.includes('response')) {
      return 'api';
    }
    if (message.includes('render') || message.includes('display') || message.includes('ui')) {
      return 'render';
    }
    if (message.includes('memory') || name.includes('memory')) {
      return 'memory';
    }
    if (message.includes('config') || message.includes('setting')) {
      return 'configuration';
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return 'validation';
    }
    if (message.includes('timeout') || name.includes('timeout')) {
      return 'timeout';
    }
    if (message.includes('permission') || message.includes('unauthorized')) {
      return 'permission';
    }

    return 'unknown';
  }

  /**
   * Determine error severity
   */
  private determineSeverity(error: Error, errorType: ErrorType): ErrorSeverity {
    const message = error.message.toLowerCase();
    
    if (message.includes('critical') || message.includes('fatal') || errorType === 'memory') {
      return 'critical';
    }
    if (message.includes('error') || errorType === 'api' || errorType === 'network') {
      return 'high';
    }
    if (message.includes('warning') || errorType === 'render' || errorType === 'timeout') {
      return 'medium';
    }
    
    return 'low';
  }

  /**
   * Get maximum retries for error type and severity
   */
  private getMaxRetries(errorType: ErrorType, severity: ErrorSeverity): number {
    const baseRetries = this.config.maxRetryAttempts;
    
    if (severity === 'critical') {
      return Math.max(baseRetries + 2, 5);
    }
    if (severity === 'high') {
      return baseRetries + 1;
    }
    if (errorType === 'network' || errorType === 'api') {
      return baseRetries + 1;
    }
    
    return baseRetries;
  }

  /**
   * Find existing error with similar characteristics
   */
  private findExistingError(newError: ErrorRecord): ErrorRecord | null {
    const recentThreshold = Date.now() - 300000; // 5 minutes
    
    return this.errorHistory.find(existing => 
      existing.type === newError.type &&
      existing.context.component === newError.context.component &&
      existing.context.operation === newError.context.operation &&
      existing.message === newError.message &&
      existing.lastOccurrence > recentThreshold
    ) || null;
  }

  /**
   * Learn error pattern from new error
   */
  private learnErrorPattern(errorRecord: ErrorRecord): void {
    const patternId = `${errorRecord.type}_${errorRecord.context.component}`;
    let pattern = this.errorPatterns.get(patternId);
    
    if (!pattern) {
      pattern = {
        id: `pattern_${++this.patternIdCounter}`,
        description: `${errorRecord.type} errors in ${errorRecord.context.component}`,
        errorType: errorRecord.type,
        componentPattern: errorRecord.context.component,
        messagePattern: new RegExp(errorRecord.message.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
        recoveryStrategy: this.determineRecoveryStrategy(errorRecord),
        confidence: 0.1,
        occurrences: 0,
        lastSeen: Date.now(),
      };
      this.errorPatterns.set(patternId, pattern);
    }
    
    pattern.occurrences++;
    pattern.lastSeen = Date.now();
    pattern.confidence = Math.min(pattern.confidence + 0.1, 1.0);
  }

  /**
   * Update error pattern
   */
  private updateErrorPattern(errorRecord: ErrorRecord): void {
    const patternId = `${errorRecord.type}_${errorRecord.context.component}`;
    const pattern = this.errorPatterns.get(patternId);
    
    if (pattern) {
      pattern.occurrences++;
      pattern.lastSeen = Date.now();
      pattern.confidence = Math.min(pattern.confidence + 0.05, 1.0);
    }
  }

  /**
   * Determine recovery strategy
   */
  private determineRecoveryStrategy(errorRecord: ErrorRecord): RecoveryStrategy {
    const patternId = `${errorRecord.type}_${errorRecord.context.component}`;
    const pattern = this.errorPatterns.get(patternId);
    
    if (pattern && pattern.confidence > 0.7) {
      return pattern.recoveryStrategy;
    }
    
    // Default strategy based on error type
    switch (errorRecord.type) {
      case 'network':
      case 'api':
      case 'timeout':
        return 'retry';
      case 'render':
        return 'reset';
      case 'memory':
        return 'fallback';
      case 'configuration':
        return 'reset';
      case 'validation':
        return 'ignore';
      case 'permission':
        return 'escalate';
      default:
        return 'retry';
    }
  }

  /**
   * Initialize recovery strategies
   */
  private initializeRecoveryStrategies(): void {
    this.recoveryStrategies.set('retry', async (error) => {
      const delay = Math.min(
        this.config.baseRetryDelay * Math.pow(this.config.retryDelayMultiplier, error.recoveryAttempts - 1),
        this.config.maxRetryDelay
      );
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return {
        success: true,
        strategy: 'retry',
        recoveryTime: delay,
        error,
        details: `Retry after ${delay}ms delay`,
      };
    });

    this.recoveryStrategies.set('fallback', async (error) => {
      this.activateFallbackMode();
      
      return {
        success: true,
        strategy: 'fallback',
        recoveryTime: 0,
        error,
        details: 'Activated fallback mode',
      };
    });

    this.recoveryStrategies.set('reset', async (error) => {
      // Emit reset event for components to handle
      this.emit('resetRequested', {
        component: error.context.component,
        operation: error.context.operation,
        timestamp: Date.now(),
      });
      
      return {
        success: true,
        strategy: 'reset',
        recoveryTime: 0,
        error,
        details: 'Reset requested',
      };
    });

    this.recoveryStrategies.set('ignore', async (error) => {
      return {
        success: true,
        strategy: 'ignore',
        recoveryTime: 0,
        error,
        details: 'Error ignored',
      };
    });

    this.recoveryStrategies.set('escalate', async (error) => {
      this.emit('errorEscalated', {
        error,
        timestamp: Date.now(),
      });
      
      return {
        success: false,
        strategy: 'escalate',
        recoveryTime: 0,
        error,
        details: 'Error escalated',
      };
    });

    this.recoveryStrategies.set('restart', async (error) => {
      this.emit('restartRequested', {
        component: error.context.component,
        reason: error.message,
        timestamp: Date.now(),
      });
      
      return {
        success: true,
        strategy: 'restart',
        recoveryTime: 0,
        error,
        details: 'Restart requested',
      };
    });
  }

  /**
   * Initialize common error patterns
   */
  private initializeErrorPatterns(): void {
    // Network patterns
    this.errorPatterns.set('network_common', {
      id: 'network_common',
      description: 'Common network errors',
      errorType: 'network',
      componentPattern: '*',
      messagePattern: /(network|connection|fetch|timeout)/i,
      recoveryStrategy: 'retry',
      confidence: 0.8,
      occurrences: 0,
      lastSeen: Date.now(),
    });

    // API patterns
    this.errorPatterns.set('api_common', {
      id: 'api_common',
      description: 'Common API errors',
      errorType: 'api',
      componentPattern: '*',
      messagePattern: /(api|request|response|http)/i,
      recoveryStrategy: 'retry',
      confidence: 0.8,
      occurrences: 0,
      lastSeen: Date.now(),
    });
  }

  /**
   * Create timeout promise
   */
  private createTimeoutPromise(timeout: number): Promise<RecoveryResult> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Recovery timeout after ${timeout}ms`));
      }, timeout);
    });
  }

  /**
   * Log error
   */
  private logError(errorRecord: ErrorRecord): void {
    const logMessage = `[${errorRecord.severity.toUpperCase()}] ${errorRecord.type} error in ${errorRecord.context.component}: ${errorRecord.message}`;
    
    if (errorRecord.severity === 'critical') {
      console.error(logMessage);
    } else if (errorRecord.severity === 'high') {
      console.warn(logMessage);
    } else {
      console.log(logMessage);
    }
  }

  /**
   * Map severity to user-friendly level
   */
  private mapSeverityToUser(severity: ErrorSeverity): 'info' | 'warning' | 'error' {
    switch (severity) {
      case 'low':
        return 'info';
      case 'medium':
        return 'warning';
      case 'high':
      case 'critical':
        return 'error';
      default:
        return 'info';
    }
  }

  /**
   * Check if error is recoverable
   */
  private isErrorRecoverable(errorRecord: ErrorRecord): boolean {
    return errorRecord.recoveryAttempts < errorRecord.maxRetries;
  }

  /**
   * Get recovery status
   */
  private getRecoveryStatus(errorRecord: ErrorRecord): 'pending' | 'in-progress' | 'completed' | 'failed' {
    if (errorRecord.recovered) {
      return 'completed';
    }
    if (errorRecord.recoveryAttempts >= errorRecord.maxRetries) {
      return 'failed';
    }
    if (errorRecord.recoveryAttempts > 0) {
      return 'in-progress';
    }
    return 'pending';
  }

  /**
   * Generate user-friendly title
   */
  private generateUserFriendlyTitle(errorRecord: ErrorRecord): string {
    switch (errorRecord.type) {
      case 'network':
        return 'Network Connection Issue';
      case 'api':
        return 'Service Communication Error';
      case 'render':
        return 'Display Update Problem';
      case 'memory':
        return 'Memory Usage Issue';
      case 'configuration':
        return 'Configuration Problem';
      case 'validation':
        return 'Data Validation Error';
      case 'timeout':
        return 'Operation Timeout';
      case 'permission':
        return 'Permission Denied';
      default:
        return 'Unexpected Error';
    }
  }

  /**
   * Generate user-friendly description
   */
  private generateUserFriendlyDescription(errorRecord: ErrorRecord): string {
    const component = errorRecord.context.component;
    const operation = errorRecord.context.operation;
    
    switch (errorRecord.type) {
      case 'network':
        return `Unable to connect to the monitoring service. This may be due to network connectivity issues or service unavailability.`;
      case 'api':
        return `Failed to communicate with the monitoring API while ${operation} in ${component}. The service may be temporarily unavailable.`;
      case 'render':
        return `There was a problem updating the display for ${component}. Some information may not be showing correctly.`;
      case 'memory':
        return `The application is using more memory than expected. Performance may be affected.`;
      case 'configuration':
        return `There's an issue with the configuration settings for ${component}. Please check your settings.`;
      case 'validation':
        return `The data received from the service doesn't match expected format. This may be temporary.`;
      case 'timeout':
        return `The operation ${operation} in ${component} took too long to complete and was cancelled.`;
      case 'permission':
        return `Access denied while trying to ${operation} in ${component}. Please check your permissions.`;
      default:
        return `An unexpected error occurred in ${component} while ${operation}. The system will attempt to recover automatically.`;
    }
  }

  /**
   * Generate user actions
   */
  private generateUserActions(errorRecord: ErrorRecord): string[] {
    const actions: string[] = [];
    
    switch (errorRecord.type) {
      case 'network':
        actions.push('Check your internet connection');
        actions.push('Try refreshing the application');
        actions.push('Wait a moment and try again');
        break;
      case 'api':
        actions.push('Wait a moment and try again');
        actions.push('Check service status');
        actions.push('Verify your API credentials');
        break;
      case 'render':
        actions.push('Refresh the display');
        actions.push('Restart the application if problems persist');
        break;
      case 'memory':
        actions.push('Close unnecessary applications');
        actions.push('Restart the monitoring tool');
        break;
      case 'configuration':
        actions.push('Check your configuration settings');
        actions.push('Reset to default settings if needed');
        break;
      case 'validation':
        actions.push('Wait for the next update');
        actions.push('Contact support if problems persist');
        break;
      case 'timeout':
        actions.push('Try the operation again');
        actions.push('Check your network connection');
        break;
      case 'permission':
        actions.push('Contact your administrator');
        actions.push('Check your access permissions');
        break;
      default:
        actions.push('Wait for automatic recovery');
        actions.push('Restart the application if problems persist');
        break;
    }
    
    return actions;
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      this.reportError(error, {
        component: 'process',
        operation: 'global',
      });
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason) => {
      const error = reason instanceof Error ? reason : new Error(String(reason));
      this.reportError(error, {
        component: 'process',
        operation: 'promise',
      });
    });
  }
}