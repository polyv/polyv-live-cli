/**
 * @fileoverview Tests for ErrorRecoveryManager
 * @author Development Team
 * @since 1.0.0
 */

import { ErrorRecoveryManager } from './error-recovery-manager';

describe('ErrorRecoveryManager', () => {
  let manager: ErrorRecoveryManager;

  beforeEach(() => {
    manager = new ErrorRecoveryManager({
      enableAutoRecovery: true,
      maxRetryAttempts: 3,
      baseRetryDelay: 100,
      retryDelayMultiplier: 2,
      maxRetryDelay: 1000,
      errorHistorySize: 100,
      criticalErrorThreshold: 3,
      recoveryTimeout: 5000,
      enableErrorLogging: false, // Disable logging for tests
      enableUserNotifications: true,
      fallbackModeTimeout: 10000,
    });
  });

  afterEach(() => {
    manager.stop();
  });

  describe('initialization', () => {
    it('should initialize with default configuration', () => {
      const defaultManager = new ErrorRecoveryManager();
      expect(defaultManager).toBeDefined();
      defaultManager.stop();
    });

    it('should initialize with custom configuration', () => {
      const customManager = new ErrorRecoveryManager({
        maxRetryAttempts: 5,
        enableAutoRecovery: false,
      });
      expect(customManager).toBeDefined();
      customManager.stop();
    });
  });

  describe('start and stop', () => {
    it('should start and stop correctly', () => {
      const startSpy = jest.fn();
      const stopSpy = jest.fn();
      
      manager.on('recoveryManagerStarted', startSpy);
      manager.on('recoveryManagerStopped', stopSpy);

      manager.start();
      expect(startSpy).toHaveBeenCalled();

      manager.stop();
      expect(stopSpy).toHaveBeenCalled();
    });

    it('should not start if already running', () => {
      const startSpy = jest.fn();
      manager.on('recoveryManagerStarted', startSpy);

      manager.start();
      manager.start(); // Second call should be ignored

      expect(startSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('error reporting', () => {
    beforeEach(() => {
      manager.start();
    });

    it('should report and classify errors', async () => {
      const errorSpy = jest.fn();
      manager.on('errorReported', errorSpy);

      const error = new Error('Network connection failed');
      await manager.reportError(error, {
        component: 'api-client',
        operation: 'fetch-data',
        parameters: { url: 'https://api.example.com' },
      });

      expect(errorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            type: 'network',
            message: 'Network connection failed',
            context: expect.objectContaining({
              component: 'api-client',
              operation: 'fetch-data',
            }),
          }),
        })
      );
    });

    it('should classify different error types', async () => {
      const testCases = [
        { message: 'Network timeout', expectedType: 'network' },
        { message: 'API request failed', expectedType: 'api' },
        { message: 'Render error in component', expectedType: 'render' },
        { message: 'Memory allocation failed', expectedType: 'memory' },
        { message: 'Configuration invalid', expectedType: 'configuration' },
        { message: 'Validation failed', expectedType: 'validation' },
        { message: 'Operation timeout', expectedType: 'timeout' },
        { message: 'Permission denied', expectedType: 'permission' },
        { message: 'Unknown error', expectedType: 'unknown' },
      ];

      for (const testCase of testCases) {
        const error = new Error(testCase.message);
        await manager.reportError(error, {
          component: 'test',
          operation: 'test',
        });
      }

      const history = manager.getErrorHistory();
      expect(history).toHaveLength(testCases.length);
      
      testCases.forEach((testCase, index) => {
        expect(history[index].type).toBe(testCase.expectedType);
      });
    });

    it('should determine error severity', async () => {
      const testCases = [
        { message: 'Critical system failure', expectedSeverity: 'critical' },
        { message: 'API error occurred', expectedSeverity: 'high' },
        { message: 'Warning: timeout detected', expectedSeverity: 'medium' },
        { message: 'Info: validation notice', expectedSeverity: 'low' },
      ];

      for (const testCase of testCases) {
        const error = new Error(testCase.message);
        await manager.reportError(error, {
          component: 'test',
          operation: 'test',
        });
      }

      const history = manager.getErrorHistory();
      testCases.forEach((testCase, index) => {
        expect(history[index].severity).toBe(testCase.expectedSeverity);
      });
    });

    it('should handle duplicate errors', async () => {
      const error = new Error('Duplicate error');
      const context = {
        component: 'test',
        operation: 'test',
      };

      await manager.reportError(error, context);
      await manager.reportError(error, context);

      const history = manager.getErrorHistory();
      expect(history).toHaveLength(1);
      expect(history[0].occurrenceCount).toBe(2);
    });

    it.skip('should limit error history size', async () => {
      const limitedManager = new ErrorRecoveryManager({
        errorHistorySize: 3,
      });
      limitedManager.start();

      // Report more errors than the limit
      for (let i = 0; i < 5; i++) {
        const error = new Error(`Error ${i}`);
        await limitedManager.reportError(error, {
          component: 'test',
          operation: 'test',
        });
      }

      const history = limitedManager.getErrorHistory();
      expect(history).toHaveLength(3);
      expect(history[history.length - 1].message).toBe('Error 4');

      limitedManager.stop();
    });
  });

  describe('error recovery', () => {
    beforeEach(() => {
      manager.start();
    });

    it('should attempt automatic recovery', async () => {
      const recoverySpy = jest.fn();
      manager.on('errorRecovered', recoverySpy);

      const error = new Error('Network error');
      await manager.reportError(error, {
        component: 'network',
        operation: 'request',
      });

      expect(recoverySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            recovered: true,
            recoveryStrategy: 'retry',
          }),
        })
      );
    });

    it('should respect maximum retry attempts', async () => {
      const failedSpy = jest.fn();
      manager.on('recoveryFailed', failedSpy);

      // Create a custom recovery strategy that always fails
      manager.registerRecoveryStrategy('always-fail', async (error) => ({
        success: false,
        strategy: 'escalate',
        recoveryTime: 0,
        error,
        details: 'Test failure',
      }));

      const error = new Error('Test error');
      await manager.reportError(error, {
        component: 'test',
        operation: 'test',
      });

      const history = manager.getErrorHistory();
      const errorRecord = history[0];
      expect(errorRecord).toBeDefined();

      // Manually attempt recovery multiple times
      for (let i = 0; i < 5; i++) {
        await manager.attemptRecovery(errorRecord!);
      }

      expect(errorRecord!.recoveryAttempts).toBe(4); // Should stop at max attempts (includes the final attempt)
    });

    it('should use different recovery strategies', async () => {
      const strategies = [
        { errorType: 'network', expectedStrategy: 'retry' },
        { errorType: 'render', expectedStrategy: 'reset' },
        { errorType: 'memory', expectedStrategy: 'fallback' },
        { errorType: 'configuration', expectedStrategy: 'reset' },
        { errorType: 'validation', expectedStrategy: 'ignore' },
        { errorType: 'permission', expectedStrategy: 'escalate' },
      ];

      for (const strategy of strategies) {
        const error = new Error(`${strategy.errorType} error`);
        await manager.reportError(error, {
          component: 'test',
          operation: 'test',
        });
      }

      const history = manager.getErrorHistory();
      
      // Attempt recovery for each error to trigger strategy determination
      for (let i = 0; i < history.length; i++) {
        await manager.attemptRecovery(history[i]);
      }

      strategies.forEach((strategy, index) => {
        expect(history[index].recoveryStrategy).toBe(strategy.expectedStrategy);
      });
    });

    it('should register custom recovery strategies', () => {
      const customStrategy = jest.fn().mockResolvedValue({
        success: true,
        strategy: 'custom',
        recoveryTime: 0,
        error: {} as any,
      });

      const strategySpy = jest.fn();
      manager.on('recoveryStrategyRegistered', strategySpy);

      manager.registerRecoveryStrategy('custom', customStrategy);

      expect(strategySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'custom',
        })
      );
    });
  });

  describe('fallback mode', () => {
    beforeEach(() => {
      manager.start();
    });

    it('should activate fallback mode on critical errors', async () => {
      const fallbackSpy = jest.fn();
      manager.on('fallbackModeActivated', fallbackSpy);

      // Report critical errors to trigger fallback mode
      for (let i = 0; i < 3; i++) {
        const error = new Error('Critical system failure');
        await manager.reportError(error, {
          component: 'system',
          operation: 'critical',
        });
      }

      expect(fallbackSpy).toHaveBeenCalled();
      expect(manager.isFallbackModeActive()).toBe(true);
    });

    it('should deactivate fallback mode after timeout', (done) => {
      // Create manager with shorter timeout for testing
      const shortTimeoutManager = new ErrorRecoveryManager({
        enableAutoRecovery: true,
        maxRetryAttempts: 3,
        fallbackModeTimeout: 100, // Short timeout for testing
      });
      shortTimeoutManager.start();
      
      const deactivateSpy = jest.fn();
      shortTimeoutManager.on('fallbackModeDeactivated', deactivateSpy);

      shortTimeoutManager.activateFallbackMode();
      expect(shortTimeoutManager.isFallbackModeActive()).toBe(true);

      setTimeout(() => {
        expect(deactivateSpy).toHaveBeenCalled();
        expect(shortTimeoutManager.isFallbackModeActive()).toBe(false);
        shortTimeoutManager.stop();
        done();
      }, 150);
    }, 1000);

    it('should manually activate and deactivate fallback mode', () => {
      const activateSpy = jest.fn();
      const deactivateSpy = jest.fn();
      
      manager.on('fallbackModeActivated', activateSpy);
      manager.on('fallbackModeDeactivated', deactivateSpy);

      manager.activateFallbackMode();
      expect(activateSpy).toHaveBeenCalled();
      expect(manager.isFallbackModeActive()).toBe(true);

      manager.deactivateFallbackMode();
      expect(deactivateSpy).toHaveBeenCalled();
      expect(manager.isFallbackModeActive()).toBe(false);
    });
  });

  describe('error statistics', () => {
    beforeEach(() => {
      manager.start();
    });

    it('should provide comprehensive error statistics', async () => {
      // Report various errors
      const errors = [
        { message: 'Network error', type: 'network', severity: 'high' },
        { message: 'API failure', type: 'api', severity: 'high' },
        { message: 'Render issue', type: 'render', severity: 'medium' },
        { message: 'Critical memory failure', type: 'memory', severity: 'critical' },
      ];

      for (const errorData of errors) {
        const error = new Error(errorData.message);
        await manager.reportError(error, {
          component: 'test',
          operation: 'test',
        });
      }

      const stats = manager.getStatistics();
      
      expect(stats.totalErrors).toBe(4);
      expect(stats.errorsByType.network).toBe(1);
      expect(stats.errorsByType.api).toBe(1);
      expect(stats.errorsByType.render).toBe(1);
      expect(stats.errorsByType.memory).toBe(1);
      expect(stats.errorsBySeverity.critical).toBe(1);
      expect(stats.errorsBySeverity.high).toBe(2);
      expect(stats.errorsBySeverity.medium).toBe(1);
      expect(stats.errorsByComponent.test).toBe(4);
    });

    it('should calculate recovery success rate', async () => {
      // Report errors that will be recovered
      for (let i = 0; i < 5; i++) {
        const error = new Error('Network error');
        await manager.reportError(error, {
          component: 'network',
          operation: 'request',
        });
      }

      const stats = manager.getStatistics();
      expect(stats.recoverySuccessRate).toBeGreaterThan(0);
    });

    it('should track error trends', async () => {
      const error = new Error('Recent error');
      await manager.reportError(error, {
        component: 'test',
        operation: 'test',
      });

      const stats = manager.getStatistics();
      expect(stats.trends.recentErrors).toBe(1);
      expect(stats.trends.errorRate).toBe(1);
    });
  });

  describe('user-friendly messages', () => {
    beforeEach(() => {
      manager.start();
    });

    it('should generate user-friendly error messages', async () => {
      const error = new Error('Network connection failed');
      await manager.reportError(error, {
        component: 'api-client',
        operation: 'fetch-data',
      });

      const history = manager.getErrorHistory();
      const userMessage = manager.getUserErrorMessage(history[0]);

      expect(userMessage).toHaveProperty('title');
      expect(userMessage).toHaveProperty('description');
      expect(userMessage).toHaveProperty('suggestedActions');
      expect(userMessage).toHaveProperty('severity');
      expect(userMessage).toHaveProperty('recoverable');
      expect(userMessage).toHaveProperty('recoveryStatus');

      expect(userMessage.title).toBe('Network Connection Issue');
      expect(userMessage.description).toContain('network connectivity');
      expect(userMessage.suggestedActions).toContain('Check your internet connection');
      expect(userMessage.severity).toBe('error');
      expect(userMessage.recoverable).toBe(true);
    });

    it('should provide appropriate suggested actions', async () => {
      const testCases = [
        {
          message: 'Network timeout',
          expectedActions: ['Check your internet connection', 'Try refreshing the application'],
        },
        {
          message: 'API request failed',
          expectedActions: ['Wait a moment and try again', 'Check service status'],
        },
        {
          message: 'Permission denied',
          expectedActions: ['Contact your administrator', 'Check your access permissions'],
        },
      ];

      for (const testCase of testCases) {
        const error = new Error(testCase.message);
        await manager.reportError(error, {
          component: 'test',
          operation: 'test',
        });
      }

      const history = manager.getErrorHistory();
      testCases.forEach((testCase, index) => {
        const userMessage = manager.getUserErrorMessage(history[index]);
        testCase.expectedActions.forEach(action => {
          expect(userMessage.suggestedActions).toContain(action);
        });
      });
    });
  });

  describe('error history management', () => {
    beforeEach(() => {
      manager.start();
    });

    it('should get error history with time range', async () => {
      const now = Date.now();
      
      const error = new Error('Test error');
      await manager.reportError(error, {
        component: 'test',
        operation: 'test',
      });

      const history = manager.getErrorHistory({
        start: now - 1000,
        end: now + 1000,
      });

      expect(history).toHaveLength(1);
      expect(history[0].message).toBe('Test error');
    });

    it('should clear error history', async () => {
      const clearSpy = jest.fn();
      manager.on('errorHistoryCleared', clearSpy);

      const error = new Error('Test error');
      await manager.reportError(error, {
        component: 'test',
        operation: 'test',
      });

      expect(manager.getErrorHistory()).toHaveLength(1);

      manager.clearErrorHistory();
      
      expect(clearSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          clearedCount: 1,
        })
      );
      expect(manager.getErrorHistory()).toHaveLength(0);
    });
  });

  describe('configuration updates', () => {
    it('should update configuration', () => {
      const configSpy = jest.fn();
      manager.on('configUpdated', configSpy);

      manager.updateConfig({
        maxRetryAttempts: 5,
        criticalErrorThreshold: 10,
      });

      expect(configSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          config: expect.objectContaining({
            maxRetryAttempts: 5,
            criticalErrorThreshold: 10,
          }),
        })
      );
    });
  });

  describe('recovery events', () => {
    beforeEach(() => {
      manager.start();
    });

    it('should emit reset requested events', async () => {
      const resetSpy = jest.fn();
      manager.on('resetRequested', resetSpy);

      const error = new Error('Render error');
      await manager.reportError(error, {
        component: 'render',
        operation: 'update',
      });

      expect(resetSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          component: 'render',
          operation: 'update',
        })
      );
    });

    it('should emit escalation events', async () => {
      const escalateSpy = jest.fn();
      manager.on('errorEscalated', escalateSpy);

      const error = new Error('Permission denied');
      await manager.reportError(error, {
        component: 'auth',
        operation: 'login',
      });

      expect(escalateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            message: 'Permission denied',
          }),
        })
      );
    });

    it('should emit restart requested events', (done) => {
      manager.on('restartRequested', (event) => {
        expect(event).toEqual(
          expect.objectContaining({
            component: 'system',
            reason: 'Critical system error',
          })
        );
        done();
      });

      const error = new Error('Critical system error');
      manager.reportError(error, {
        component: 'system',
        operation: 'critical',
      }).then(() => {
        // Manually trigger restart strategy using the built-in one
        const history = manager.getErrorHistory();
        const restartStrategy = manager['recoveryStrategies'].get('restart');
        if (restartStrategy) {
          restartStrategy(history[0]);
        }
      });
    });
  });
});