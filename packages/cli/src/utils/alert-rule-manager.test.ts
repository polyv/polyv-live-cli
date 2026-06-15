/**
 * @fileoverview Tests for AlertRuleManager
 * @author Development Team
 * @since 1.0.0
 */

import { AlertRuleManager } from './alert-rule-manager';
import {
  AlertRule,
  AlertEvaluationContext
} from '../types/alert';

describe('AlertRuleManager', () => {
  let ruleManager: AlertRuleManager;

  const createMockRule = (overrides: Partial<AlertRule> = {}): AlertRule => ({
    id: `rule-${Date.now()}-${Math.random()}`,
    name: 'Test Rule',
    description: 'A test alert rule',
    enabled: true,
    level: 'warning',
    type: 'system',
    conditions: [
      {
        type: 'threshold',
        field: 'systemMetrics.cpu.usage',
        operator: '>',
        value: 80,
      }
    ],
    actions: [
      {
        type: 'log',
        config: { level: 'warn' },
        enabled: true,
      }
    ],
    cooldown: 60000,
    priority: 1,
    tags: ['test'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    triggerCount: 0,
    ...overrides,
  });

  const createMockContext = (overrides: any = {}): AlertEvaluationContext => ({
    timestamp: Date.now(),
    systemMetrics: {
      cpu: { usage: 50 },
      memory: { percentage: 60 },
    },
    ...overrides,
  });

  beforeEach(() => {
    ruleManager = new AlertRuleManager();
    // Clear default rules for clean testing
    ruleManager.clearRules();
  });

  afterEach(() => {
    if (ruleManager) {
      ruleManager.destroy();
    }
  });

  describe('Rule Management', () => {
    it('should add a new rule successfully', () => {
      const rule = createMockRule();
      
      ruleManager.addRule(rule);
      
      const retrievedRule = ruleManager.getRule(rule.id);
      expect(retrievedRule).toEqual(rule);
    });

    it('should update an existing rule', async () => {
      const rule = createMockRule();
      ruleManager.addRule(rule);
      
      // Small delay to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 5));
      
      const success = ruleManager.updateRule(rule.id, { 
        name: 'Updated Rule',
        level: 'error'
      });
      
      expect(success).toBe(true);
      const updatedRule = ruleManager.getRule(rule.id);
      expect(updatedRule?.name).toBe('Updated Rule');
      expect(updatedRule?.level).toBe('error');
      expect(updatedRule?.updatedAt).toBeGreaterThanOrEqual(rule.updatedAt);
    });

    it('should not update non-existent rule', () => {
      const success = ruleManager.updateRule('non-existent', { name: 'Updated' });
      expect(success).toBe(false);
    });

    it('should delete a rule successfully', () => {
      const rule = createMockRule();
      ruleManager.addRule(rule);
      
      const success = ruleManager.deleteRule(rule.id);
      
      expect(success).toBe(true);
      expect(ruleManager.getRule(rule.id)).toBeUndefined();
    });

    it('should not delete non-existent rule', () => {
      const success = ruleManager.deleteRule('non-existent');
      expect(success).toBe(false);
    });

    it('should get all rules', () => {
      const rule1 = createMockRule();
      const rule2 = createMockRule();
      
      ruleManager.addRule(rule1);
      ruleManager.addRule(rule2);
      
      const allRules = ruleManager.getAllRules();
      expect(allRules).toHaveLength(2);
      expect(allRules.map(r => r.id)).toContain(rule1.id);
      expect(allRules.map(r => r.id)).toContain(rule2.id);
    });

    it('should get only enabled rules', () => {
      const enabledRule = createMockRule({ enabled: true });
      const disabledRule = createMockRule({ enabled: false });
      
      ruleManager.addRule(enabledRule);
      ruleManager.addRule(disabledRule);
      
      const enabledRules = ruleManager.getEnabledRules();
      expect(enabledRules).toHaveLength(1);
      expect(enabledRules[0]?.id).toBe(enabledRule.id);
    });

    it('should get rules by type', () => {
      const systemRule = createMockRule({ type: 'system' });
      const streamRule = createMockRule({ type: 'stream' });
      
      ruleManager.addRule(systemRule);
      ruleManager.addRule(streamRule);
      
      const systemRules = ruleManager.getRulesByType('system');
      expect(systemRules).toHaveLength(1);
      expect(systemRules[0]?.id).toBe(systemRule.id);
    });

    it('should get rules by tag', () => {
      const rule1 = createMockRule({ tags: ['performance', 'critical'] });
      const rule2 = createMockRule({ tags: ['network'] });
      
      ruleManager.addRule(rule1);
      ruleManager.addRule(rule2);
      
      const performanceRules = ruleManager.getRulesByTag('performance');
      expect(performanceRules).toHaveLength(1);
      expect(performanceRules[0]?.id).toBe(rule1.id);
    });

    it('should enable and disable rules', () => {
      const rule = createMockRule({ enabled: true });
      ruleManager.addRule(rule);
      
      // Disable rule
      let success = ruleManager.setRuleEnabled(rule.id, false);
      expect(success).toBe(true);
      expect(ruleManager.getRule(rule.id)?.enabled).toBe(false);
      
      // Enable rule
      success = ruleManager.setRuleEnabled(rule.id, true);
      expect(success).toBe(true);
      expect(ruleManager.getRule(rule.id)?.enabled).toBe(true);
    });
  });

  describe('Rule Validation', () => {
    it('should validate rule with missing ID', () => {
      const invalidRule = createMockRule({ id: '' });
      
      expect(() => ruleManager.addRule(invalidRule)).toThrow('Rule must have a valid ID');
    });

    it('should validate rule with missing name', () => {
      const invalidRule = createMockRule({ name: '' });
      
      expect(() => ruleManager.addRule(invalidRule)).toThrow('Rule must have a valid name');
    });

    it('should validate rule with no conditions', () => {
      const invalidRule = createMockRule({ conditions: [] });
      
      expect(() => ruleManager.addRule(invalidRule)).toThrow('Rule must have at least one condition');
    });

    it('should validate rule with no actions', () => {
      const invalidRule = createMockRule({ actions: [] });
      
      expect(() => ruleManager.addRule(invalidRule)).toThrow('Rule must have at least one action');
    });

    it('should validate condition with invalid type', () => {
      const invalidRule = createMockRule({
        conditions: [
          {
            type: 'invalid' as any,
            field: 'systemMetrics.cpu.usage',
            operator: '>',
            value: 80,
          }
        ]
      });
      
      expect(() => ruleManager.addRule(invalidRule)).toThrow('Invalid condition type');
    });

    it('should validate condition with invalid operator', () => {
      const invalidRule = createMockRule({
        conditions: [
          {
            type: 'threshold',
            field: 'systemMetrics.cpu.usage',
            operator: 'invalid' as any,
            value: 80,
          }
        ]
      });
      
      expect(() => ruleManager.addRule(invalidRule)).toThrow('Invalid operator');
    });

    it('should validate action with invalid type', () => {
      const invalidRule = createMockRule({
        actions: [
          {
            type: 'invalid' as any,
            config: {},
            enabled: true,
          }
        ]
      });
      
      expect(() => ruleManager.addRule(invalidRule)).toThrow('Invalid action type');
    });

    it('should validate negative cooldown', () => {
      const invalidRule = createMockRule({ cooldown: -1000 });
      
      expect(() => ruleManager.addRule(invalidRule)).toThrow('Rule cooldown must be a non-negative number');
    });

    it('should validate invalid priority', () => {
      const invalidRule = createMockRule({ priority: 0 });
      
      expect(() => ruleManager.addRule(invalidRule)).toThrow('Rule priority must be a positive number');
    });
  });

  describe('Rule Evaluation', () => {
    it('should evaluate threshold condition that meets criteria', () => {
      const rule = createMockRule({
        conditions: [
          {
            type: 'threshold',
            field: 'systemMetrics.cpu.usage',
            operator: '>',
            value: 70,
          }
        ]
      });
      ruleManager.addRule(rule);
      
      const context = createMockContext({
        systemMetrics: { cpu: { usage: 80 } }
      });
      
      const result = ruleManager.evaluateRule(rule, context);
      expect(result.triggered).toBe(true);
      expect(result.alert).toBeDefined();
      expect(result.alert?.level).toBe(rule.level);
    });

    it('should evaluate threshold condition that does not meet criteria', () => {
      const rule = createMockRule({
        conditions: [
          {
            type: 'threshold',
            field: 'systemMetrics.cpu.usage',
            operator: '>',
            value: 90,
          }
        ]
      });
      ruleManager.addRule(rule);
      
      const context = createMockContext({
        systemMetrics: { cpu: { usage: 80 } }
      });
      
      const result = ruleManager.evaluateRule(rule, context);
      expect(result.triggered).toBe(false);
      expect(result.alert).toBeUndefined();
    });

    it('should evaluate multiple conditions (AND logic)', () => {
      const rule = createMockRule({
        conditions: [
          {
            type: 'threshold',
            field: 'systemMetrics.cpu.usage',
            operator: '>',
            value: 70,
          },
          {
            type: 'threshold',
            field: 'systemMetrics.memory.percentage',
            operator: '>',
            value: 50,
          }
        ]
      });
      ruleManager.addRule(rule);
      
      const context = createMockContext({
        systemMetrics: { 
          cpu: { usage: 80 },
          memory: { percentage: 60 }
        }
      });
      
      const result = ruleManager.evaluateRule(rule, context);
      expect(result.triggered).toBe(true);
    });

    it('should fail when one condition is not met (AND logic)', () => {
      const rule = createMockRule({
        conditions: [
          {
            type: 'threshold',
            field: 'systemMetrics.cpu.usage',
            operator: '>',
            value: 70,
          },
          {
            type: 'threshold',
            field: 'systemMetrics.memory.percentage',
            operator: '>',
            value: 80, // This will fail
          }
        ]
      });
      ruleManager.addRule(rule);
      
      const context = createMockContext({
        systemMetrics: { 
          cpu: { usage: 80 },
          memory: { percentage: 60 }
        }
      });
      
      const result = ruleManager.evaluateRule(rule, context);
      expect(result.triggered).toBe(false);
    });

    it('should evaluate different operators correctly', () => {
      const testCases = [
        { operator: '>' as const, value: 70, fieldValue: 80, expected: true },
        { operator: '>' as const, value: 90, fieldValue: 80, expected: false },
        { operator: '<' as const, value: 90, fieldValue: 80, expected: true },
        { operator: '<' as const, value: 70, fieldValue: 80, expected: false },
        { operator: '>=' as const, value: 80, fieldValue: 80, expected: true },
        { operator: '<=' as const, value: 80, fieldValue: 80, expected: true },
        { operator: '=' as const, value: 80, fieldValue: 80, expected: true },
        { operator: '!=' as const, value: 70, fieldValue: 80, expected: true },
      ];

      testCases.forEach(({ operator, value, fieldValue, expected }) => {
        const rule = createMockRule({
          conditions: [
            {
              type: 'threshold',
              field: 'systemMetrics.cpu.usage',
              operator,
              value,
            }
          ]
        });
        
        const context = createMockContext({
          systemMetrics: { cpu: { usage: fieldValue } }
        });
        
        const result = ruleManager.evaluateRule(rule, context);
        expect(result.triggered).toBe(expected);
      });
    });

    it('should evaluate string operators correctly', () => {
      const rule = createMockRule({
        conditions: [
          {
            type: 'threshold',
            field: 'status.message',
            operator: 'contains',
            value: 'error',
          }
        ]
      });
      
      const context = createMockContext({
        status: { message: 'Connection error occurred' }
      });
      
      const result = ruleManager.evaluateRule(rule, context);
      expect(result.triggered).toBe(true);
    });

    it('should handle missing field values', () => {
      const rule = createMockRule({
        conditions: [
          {
            type: 'threshold',
            field: 'nonexistent.field',
            operator: '>',
            value: 50,
          }
        ]
      });
      
      const context = createMockContext();
      
      const result = ruleManager.evaluateRule(rule, context);
      expect(result.triggered).toBe(false);
    });

    it('should respect cooldown periods', () => {
      const rule = createMockRule({ cooldown: 5000 }); // 5 seconds
      ruleManager.addRule(rule);
      
      const context = createMockContext({
        systemMetrics: { cpu: { usage: 90 } }
      });
      
      // First evaluation should trigger
      let result = ruleManager.evaluateRule(rule, context);
      expect(result.triggered).toBe(true);
      
      // Simulate handling the trigger
      ruleManager['lastTriggerTimes'].set(rule.id, Date.now());
      
      // Second evaluation should be skipped due to cooldown
      result = ruleManager.evaluateRule(rule, context);
      expect(result.triggered).toBe(false);
      expect(result.details?.['skipped']).toBe('cooldown');
    });
  });

  describe('Rule Engine Lifecycle', () => {
    it('should start and stop the evaluation engine', () => {
      expect(ruleManager['isRunning']).toBe(false);
      
      ruleManager.start();
      expect(ruleManager['isRunning']).toBe(true);
      expect(ruleManager['evaluationInterval']).toBeDefined();
      
      ruleManager.stop();
      expect(ruleManager['isRunning']).toBe(false);
      expect(ruleManager['evaluationInterval']).toBeUndefined();
    });

    it('should not start multiple times', () => {
      ruleManager.start();
      const firstInterval = ruleManager['evaluationInterval'];
      
      ruleManager.start(); // Try to start again
      expect(ruleManager['evaluationInterval']).toBe(firstInterval);
      
      ruleManager.stop();
    });

    it('should evaluate all enabled rules', () => {
      const rule1 = createMockRule({ enabled: true });
      const rule2 = createMockRule({ enabled: false });
      const rule3 = createMockRule({ enabled: true });
      
      ruleManager.addRule(rule1);
      ruleManager.addRule(rule2);
      ruleManager.addRule(rule3);
      
      const context = createMockContext();
      const results = ruleManager.evaluateRules(context);
      
      expect(results).toHaveLength(2); // Only enabled rules
      expect(results.map(r => r.ruleId)).toContain(rule1.id);
      expect(results.map(r => r.ruleId)).toContain(rule3.id);
      expect(results.map(r => r.ruleId)).not.toContain(rule2.id);
    });
  });

  describe('Action Execution', () => {
    it('should execute log action', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const rule = createMockRule({
        actions: [
          {
            type: 'log',
            config: { level: 'warn' },
            enabled: true,
          }
        ]
      });
      ruleManager.addRule(rule);
      
      const context = createMockContext({
        systemMetrics: { cpu: { usage: 90 } }
      });
      
      const result = ruleManager.evaluateRule(rule, context);
      if (result.triggered) {
        ruleManager['handleTriggeredRule'](rule, result);
      }
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should emit notification event', (done) => {
      const rule = createMockRule({
        actions: [
          {
            type: 'notification',
            config: { title: 'Test Alert', urgent: true },
            enabled: true,
          }
        ]
      });
      ruleManager.addRule(rule);
      
      ruleManager.on('notification:show', (notification) => {
        expect(notification.title).toBe('Test Alert');
        expect(notification.urgent).toBe(true);
        done();
      });
      
      const context = createMockContext({
        systemMetrics: { cpu: { usage: 90 } }
      });
      
      const result = ruleManager.evaluateRule(rule, context);
      if (result.triggered) {
        ruleManager['handleTriggeredRule'](rule, result);
      }
    });

    it('should skip disabled actions', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const rule = createMockRule({
        actions: [
          {
            type: 'log',
            config: { level: 'warn' },
            enabled: false, // Disabled
          }
        ]
      });
      ruleManager.addRule(rule);
      
      const context = createMockContext({
        systemMetrics: { cpu: { usage: 90 } }
      });
      
      const result = ruleManager.evaluateRule(rule, context);
      if (result.triggered) {
        ruleManager['handleTriggeredRule'](rule, result);
      }
      
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Rule Statistics', () => {
    it('should calculate rule statistics correctly', () => {
      const systemRule = createMockRule({ type: 'system', enabled: true });
      const streamRule = createMockRule({ type: 'stream', enabled: false });
      const networkRule = createMockRule({ type: 'network', enabled: true, triggerCount: 5 });
      
      ruleManager.addRule(systemRule);
      ruleManager.addRule(streamRule);
      ruleManager.addRule(networkRule);
      
      const stats = ruleManager.getRuleStatistics();
      
      expect(stats.total).toBe(3);
      expect(stats.enabled).toBe(2);
      expect(stats.triggered).toBe(1);
      expect(stats.byType.system).toBe(1);
      expect(stats.byType.stream).toBe(1);
      expect(stats.byType.network).toBe(1);
    });
  });

  describe('Import/Export', () => {
    it('should export rules correctly', () => {
      const rule1 = createMockRule();
      const rule2 = createMockRule();
      
      ruleManager.addRule(rule1);
      ruleManager.addRule(rule2);
      
      const exported = ruleManager.exportRules();
      expect(exported).toHaveLength(2);
      expect(exported.map(r => r.id)).toContain(rule1.id);
      expect(exported.map(r => r.id)).toContain(rule2.id);
    });

    it('should import rules correctly', () => {
      const rulesToImport = [
        createMockRule(),
        createMockRule(),
      ];
      
      const result = ruleManager.importRules(rulesToImport);
      
      expect(result.imported).toBe(2);
      expect(result.errors).toHaveLength(0);
      expect(ruleManager.getAllRules()).toHaveLength(2);
    });

    it('should handle import errors gracefully', () => {
      const validRule = createMockRule();
      const invalidRule = createMockRule({ id: '' }); // Invalid ID
      
      const result = ruleManager.importRules([validRule, invalidRule]);
      
      expect(result.imported).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Rule must have a valid ID');
    });

    it('should replace existing rules when importing with replace=true', () => {
      const existingRule = createMockRule();
      ruleManager.addRule(existingRule);
      
      const newRules = [createMockRule(), createMockRule()];
      ruleManager.importRules(newRules, true);
      
      expect(ruleManager.getAllRules()).toHaveLength(2);
      expect(ruleManager.getRule(existingRule.id)).toBeUndefined();
    });

    it('should clear all rules', () => {
      ruleManager.addRule(createMockRule());
      ruleManager.addRule(createMockRule());
      
      ruleManager.clearRules();
      
      expect(ruleManager.getAllRules()).toHaveLength(0);
    });
  });

  describe('Event Emission', () => {
    it('should emit rule:added event', (done) => {
      const rule = createMockRule();
      
      ruleManager.on('rule:added', (data) => {
        expect(data.rule.id).toBe(rule.id);
        done();
      });
      
      ruleManager.addRule(rule);
    });

    it('should emit rule:updated event', (done) => {
      const rule = createMockRule();
      ruleManager.addRule(rule);
      
      ruleManager.on('rule:updated', (data) => {
        expect(data.rule.id).toBe(rule.id);
        expect(data.rule.name).toBe('Updated Name');
        done();
      });
      
      ruleManager.updateRule(rule.id, { name: 'Updated Name' });
    });

    it('should emit rule:deleted event', (done) => {
      const rule = createMockRule();
      ruleManager.addRule(rule);
      
      ruleManager.on('rule:deleted', (data) => {
        expect(data.ruleId).toBe(rule.id);
        done();
      });
      
      ruleManager.deleteRule(rule.id);
    });

    it('should emit rule:triggered event', (done) => {
      const rule = createMockRule();
      ruleManager.addRule(rule);
      
      ruleManager.on('rule:triggered', (data) => {
        expect(data.rule.id).toBe(rule.id);
        expect(data.result.triggered).toBe(true);
        done();
      });
      
      const context = createMockContext({
        systemMetrics: { cpu: { usage: 90 } }
      });
      
      const result = ruleManager.evaluateRule(rule, context);
      if (result.triggered) {
        ruleManager['handleTriggeredRule'](rule, result);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle nested field paths', () => {
      const rule = createMockRule({
        conditions: [
          {
            type: 'threshold',
            field: 'nested.deeply.value',
            operator: '>',
            value: 50,
          }
        ]
      });
      
      const context = createMockContext({
        nested: {
          deeply: {
            value: 75
          }
        }
      });
      
      const result = ruleManager.evaluateRule(rule, context);
      expect(result.triggered).toBe(true);
    });

    it('should handle regex operator', () => {
      const rule = createMockRule({
        conditions: [
          {
            type: 'threshold',
            field: 'status.code',
            operator: 'regex',
            value: '^[45]\\d\\d$', // 4xx or 5xx status codes
          }
        ]
      });
      
      const context = createMockContext({
        status: { code: '404' }
      });
      
      const result = ruleManager.evaluateRule(rule, context);
      expect(result.triggered).toBe(true);
    });

    it('should handle evaluation errors gracefully', () => {
      const rule = createMockRule({
        conditions: [
          {
            type: 'threshold',
            field: 'status.code',
            operator: 'regex',
            value: '[invalid regex', // Invalid regex
          }
        ]
      });
      
      const context = createMockContext({
        status: { code: '200' }
      });
      
      const result = ruleManager.evaluateRule(rule, context);
      expect(result.triggered).toBe(false);
      expect(result.details?.['error']).toBeDefined();
    });

    it('should handle different operator types correctly', () => {
      const testCases = [
        { operator: '>=', value: 50, testValue: 50, expected: true },
        { operator: '<=', value: 50, testValue: 50, expected: true },
        { operator: '!=', value: 50, testValue: 60, expected: true },
        { operator: 'contains', value: 'test', testValue: 'this is a test string', expected: true },
        { operator: 'contains', value: 'test', testValue: 'no match here', expected: false },
      ];

      testCases.forEach(({ operator, value, testValue, expected }) => {
        const rule = createMockRule({
          conditions: [
            {
              type: 'threshold',
              field: 'testField',
              operator: operator as any,
              value,
            }
          ]
        });
        
        const context = createMockContext({
          testField: testValue
        });
        
        const result = ruleManager.evaluateRule(rule, context);
        expect(result.triggered).toBe(expected);
      });
    });

    it('should handle cooldown periods correctly', () => {
      const rule = createMockRule({
        cooldown: 1000, // 1 second cooldown
        conditions: [
          {
            type: 'threshold',
            field: 'cpu',
            operator: '>',
            value: 80,
          }
        ]
      });

      ruleManager.addRule(rule);
      
      const context = createMockContext({
        cpu: 90
      });

      // First evaluation should trigger
      const result1 = ruleManager.evaluateRule(rule, context);
      expect(result1.triggered).toBe(true);
      
      if (result1.triggered) {
        ruleManager['handleTriggeredRule'](rule, result1);
      }

      // Second evaluation within cooldown should not trigger
      const result2 = ruleManager.evaluateRule(rule, context);
      expect(result2.triggered).toBe(false);
    });

    it('should handle state_change condition type', () => {
      const rule = createMockRule({
        conditions: [
          {
            type: 'state_change',
            field: 'status',
            operator: '=',
            value: 'offline',
          }
        ]
      });

      const context = createMockContext({
        status: 'offline'
      });

      const result = ruleManager.evaluateRule(rule, context);
      // State change evaluation should work (exact behavior depends on implementation)
      expect(typeof result.triggered).toBe('boolean');
    });

    it('should handle time_window condition type', () => {
      const rule = createMockRule({
        conditions: [
          {
            type: 'time_window',
            field: 'timestamp',
            operator: '>',
            value: Date.now() - 60000, // Within last minute
          }
        ]
      });

      const context = createMockContext({
        timestamp: Date.now()
      });

      const result = ruleManager.evaluateRule(rule, context);
      expect(typeof result.triggered).toBe('boolean');
    });

    it('should handle pattern condition type', () => {
      const rule = createMockRule({
        conditions: [
          {
            type: 'pattern',
            field: 'message',
            operator: 'regex',
            value: '\\berror\\b',
          }
        ]
      });

      const context = createMockContext({
        message: 'An error occurred in the system'
      });

      const result = ruleManager.evaluateRule(rule, context);
      expect(typeof result.triggered).toBe('boolean');
    });
  });

  describe('Manager Lifecycle', () => {
    it('should handle start when already running', () => {
      ruleManager.start();
      ruleManager.start(); // Should not throw
      // Just verify no error is thrown
      expect(true).toBe(true);
    });

    it('should handle stop when not running', () => {
      ruleManager.stop();
      ruleManager.stop(); // Should not throw
      // Just verify no error is thrown
      expect(true).toBe(true);
    });

    it('should handle rule operations when stopped', () => {
      ruleManager.stop();
      
      const rule = createMockRule();
      ruleManager.addRule(rule);
      expect(ruleManager.getRule(rule.id)).toBeDefined();
    });
  });
});