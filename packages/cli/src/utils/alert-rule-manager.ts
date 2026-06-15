/**
 * @fileoverview Alert rule management system
 * @author Development Team
 * @since 1.0.0
 */

import { EventEmitter } from 'events';
import {
  AlertRule,
  AlertCondition,
  AlertAction,
  AlertType,
  AlertEvaluationContext,
  AlertRuleEvaluationResult,
  Alert
} from '../types/alert';

/**
 * Alert rule manager for creating, managing, and evaluating alert rules
 */
export class AlertRuleManager extends EventEmitter {
  private rules: Map<string, AlertRule> = new Map();
  private lastTriggerTimes: Map<string, number> = new Map();
  private evaluationInterval?: NodeJS.Timeout;
  private readonly evaluationIntervalMs: number = 5000; // 5 seconds
  private isRunning = false;

  constructor() {
    super();
    this.setupDefaultRules();
  }

  /**
   * Set up default alert rules
   */
  private setupDefaultRules(): void {
    // CPU usage alert rule
    const cpuRule: AlertRule = {
      id: 'cpu-high-usage',
      name: 'High CPU Usage',
      description: 'Alert when CPU usage exceeds threshold',
      enabled: true,
      level: 'warning',
      type: 'system',
      conditions: [
        {
          type: 'threshold',
          field: 'cpu.usage',
          operator: '>',
          value: 80,
          timeWindow: 30000, // 30 seconds
        }
      ],
      actions: [
        {
          type: 'log',
          config: { level: 'warn' },
          enabled: true,
        }
      ],
      cooldown: 60000, // 1 minute
      priority: 2,
      tags: ['system', 'performance'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      triggerCount: 0,
    };

    // Memory usage alert rule
    const memoryRule: AlertRule = {
      id: 'memory-high-usage',
      name: 'High Memory Usage',
      description: 'Alert when memory usage exceeds threshold',
      enabled: true,
      level: 'warning',
      type: 'system',
      conditions: [
        {
          type: 'threshold',
          field: 'memory.percentage',
          operator: '>',
          value: 85,
          timeWindow: 30000,
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
      priority: 2,
      tags: ['system', 'memory'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      triggerCount: 0,
    };

    // Critical CPU usage alert rule
    const criticalCpuRule: AlertRule = {
      id: 'cpu-critical-usage',
      name: 'Critical CPU Usage',
      description: 'Alert when CPU usage is critically high',
      enabled: true,
      level: 'critical',
      type: 'system',
      conditions: [
        {
          type: 'threshold',
          field: 'cpu.usage',
          operator: '>',
          value: 95,
          timeWindow: 10000, // 10 seconds
        }
      ],
      actions: [
        {
          type: 'log',
          config: { level: 'error' },
          enabled: true,
        },
        {
          type: 'notification',
          config: { title: 'Critical CPU Alert', urgent: true },
          enabled: true,
        }
      ],
      cooldown: 30000, // 30 seconds
      priority: 1,
      tags: ['system', 'critical'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      triggerCount: 0,
    };

    // Stream disconnection alert rule
    const streamDisconnectRule: AlertRule = {
      id: 'stream-disconnected',
      name: 'Stream Disconnected',
      description: 'Alert when a stream goes offline unexpectedly',
      enabled: true,
      level: 'error',
      type: 'stream',
      conditions: [
        {
          type: 'state_change',
          field: 'stream.status',
          operator: '=',
          value: 'offline',
        }
      ],
      actions: [
        {
          type: 'log',
          config: { level: 'error' },
          enabled: true,
        }
      ],
      cooldown: 10000,
      priority: 2,
      tags: ['stream', 'connection'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      triggerCount: 0,
    };

    // Add default rules
    this.addRule(cpuRule);
    this.addRule(memoryRule);
    this.addRule(criticalCpuRule);
    this.addRule(streamDisconnectRule);
  }

  /**
   * Add a new alert rule
   */
  public addRule(rule: AlertRule): void {
    this.validateRule(rule);
    rule.updatedAt = Date.now();
    this.rules.set(rule.id, rule);
    this.emit('rule:added', { rule });
  }

  /**
   * Update an existing alert rule
   */
  public updateRule(ruleId: string, updates: Partial<AlertRule>): boolean {
    const existingRule = this.rules.get(ruleId);
    if (!existingRule) return false;

    const updatedRule: AlertRule = {
      ...existingRule,
      ...updates,
      id: ruleId, // Prevent ID changes
      updatedAt: Date.now(),
    };

    this.validateRule(updatedRule);
    this.rules.set(ruleId, updatedRule);
    this.emit('rule:updated', { rule: updatedRule });
    return true;
  }

  /**
   * Delete an alert rule
   */
  public deleteRule(ruleId: string): boolean {
    const rule = this.rules.get(ruleId);
    if (!rule) return false;

    this.rules.delete(ruleId);
    this.lastTriggerTimes.delete(ruleId);
    this.emit('rule:deleted', { ruleId });
    return true;
  }

  /**
   * Get a specific alert rule
   */
  public getRule(ruleId: string): AlertRule | undefined {
    return this.rules.get(ruleId);
  }

  /**
   * Get all alert rules
   */
  public getAllRules(): AlertRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Get enabled alert rules
   */
  public getEnabledRules(): AlertRule[] {
    return Array.from(this.rules.values()).filter(rule => rule.enabled);
  }

  /**
   * Get rules by type
   */
  public getRulesByType(type: AlertType): AlertRule[] {
    return Array.from(this.rules.values()).filter(rule => rule.type === type);
  }

  /**
   * Get rules by tag
   */
  public getRulesByTag(tag: string): AlertRule[] {
    return Array.from(this.rules.values()).filter(rule => 
      rule.tags && rule.tags.includes(tag)
    );
  }

  /**
   * Enable or disable a rule
   */
  public setRuleEnabled(ruleId: string, enabled: boolean): boolean {
    const rule = this.rules.get(ruleId);
    if (!rule) return false;

    rule.enabled = enabled;
    rule.updatedAt = Date.now();
    this.emit('rule:toggled', { ruleId, enabled });
    return true;
  }

  /**
   * Validate alert rule
   */
  private validateRule(rule: AlertRule): void {
    if (!rule.id || typeof rule.id !== 'string') {
      throw new Error('Rule must have a valid ID');
    }

    if (!rule.name || typeof rule.name !== 'string') {
      throw new Error('Rule must have a valid name');
    }

    if (!rule.conditions || !Array.isArray(rule.conditions) || rule.conditions.length === 0) {
      throw new Error('Rule must have at least one condition');
    }

    if (!rule.actions || !Array.isArray(rule.actions) || rule.actions.length === 0) {
      throw new Error('Rule must have at least one action');
    }

    // Validate conditions
    rule.conditions.forEach((condition, index) => {
      this.validateCondition(condition, `Condition ${index + 1}`);
    });

    // Validate actions
    rule.actions.forEach((action, index) => {
      this.validateAction(action, `Action ${index + 1}`);
    });

    if (typeof rule.cooldown !== 'number' || rule.cooldown < 0) {
      throw new Error('Rule cooldown must be a non-negative number');
    }

    if (typeof rule.priority !== 'number' || rule.priority < 1) {
      throw new Error('Rule priority must be a positive number');
    }
  }

  /**
   * Validate alert condition
   */
  private validateCondition(condition: AlertCondition, context: string): void {
    if (!condition.type || !['threshold', 'state_change', 'time_window', 'pattern'].includes(condition.type)) {
      throw new Error(`${context}: Invalid condition type`);
    }

    if (!condition.field || typeof condition.field !== 'string') {
      throw new Error(`${context}: Invalid field`);
    }

    if (!condition.operator || !['>', '<', '=', '>=', '<=', '!=', 'contains', 'regex'].includes(condition.operator)) {
      throw new Error(`${context}: Invalid operator`);
    }

    if (condition.value === undefined || condition.value === null) {
      throw new Error(`${context}: Value is required`);
    }

    if (condition.timeWindow && (typeof condition.timeWindow !== 'number' || condition.timeWindow <= 0)) {
      throw new Error(`${context}: Time window must be a positive number`);
    }
  }

  /**
   * Validate alert action
   */
  private validateAction(action: AlertAction, context: string): void {
    if (!action.type || !['log', 'notification', 'email', 'webhook', 'sound'].includes(action.type)) {
      throw new Error(`${context}: Invalid action type`);
    }

    if (!action.config || typeof action.config !== 'object') {
      throw new Error(`${context}: Action config is required`);
    }

    if (typeof action.enabled !== 'boolean') {
      throw new Error(`${context}: Action enabled flag is required`);
    }
  }

  /**
   * Start rule evaluation engine
   */
  public start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.evaluationInterval = setInterval(() => {
      this.evaluateRules();
    }, this.evaluationIntervalMs);

    this.emit('manager:started');
  }

  /**
   * Stop rule evaluation engine
   */
  public stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    if (this.evaluationInterval) {
      clearInterval(this.evaluationInterval);
      this.evaluationInterval = undefined as any;
    }

    this.emit('manager:stopped');
  }

  /**
   * Evaluate all enabled rules against current context
   */
  public evaluateRules(context?: AlertEvaluationContext): AlertRuleEvaluationResult[] {
    if (!context) {
      // Default context for automated evaluation
      context = {
        timestamp: Date.now(),
      };
    }

    const results: AlertRuleEvaluationResult[] = [];
    const enabledRules = this.getEnabledRules();

    for (const rule of enabledRules) {
      const result = this.evaluateRule(rule, context);
      results.push(result);

      if (result.triggered && result.alert) {
        this.handleTriggeredRule(rule, result);
      }
    }

    return results;
  }

  /**
   * Evaluate a single rule against context
   */
  public evaluateRule(rule: AlertRule, context: AlertEvaluationContext): AlertRuleEvaluationResult {
    const result: AlertRuleEvaluationResult = {
      ruleId: rule.id,
      triggered: false,
      context,
      evaluatedAt: Date.now(),
      details: {},
    };

    try {
      // Check cooldown
      const lastTrigger = this.lastTriggerTimes.get(rule.id);
      if (lastTrigger && (Date.now() - lastTrigger) < rule.cooldown) {
        result.details = result.details || {};
        result.details['skipped'] = 'cooldown';
        return result;
      }

      // Evaluate all conditions
      const conditionResults = rule.conditions.map(condition => 
        this.evaluateCondition(condition, context)
      );

      // All conditions must be true (AND logic)
      const allConditionsMet = conditionResults.every(condResult => condResult.met);

      if (allConditionsMet) {
        result.triggered = true;
        result.alert = this.createAlertFromRule(rule, context, conditionResults);
        result.details = result.details || {};
        result.details['conditionResults'] = conditionResults;
      }

    } catch (error) {
      result.details = result.details || {};
      result.details['error'] = error instanceof Error ? error.message : 'Evaluation error';
    }

    return result;
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(condition: AlertCondition, context: AlertEvaluationContext): { met: boolean; value?: any; details?: any } {
    const fieldValue = this.getFieldValue(condition.field, context);
    
    if (fieldValue === undefined || fieldValue === null) {
      return { met: false, details: 'Field not found or null' };
    }

    let met = false;
    const details: any = { fieldValue, operator: condition.operator, threshold: condition.value };

    switch (condition.operator) {
      case '>':
        met = Number(fieldValue) > Number(condition.value);
        break;
      case '<':
        met = Number(fieldValue) < Number(condition.value);
        break;
      case '>=':
        met = Number(fieldValue) >= Number(condition.value);
        break;
      case '<=':
        met = Number(fieldValue) <= Number(condition.value);
        break;
      case '=':
        met = fieldValue === condition.value;
        break;
      case '!=':
        met = fieldValue !== condition.value;
        break;
      case 'contains':
        met = String(fieldValue).includes(String(condition.value));
        break;
      case 'regex': {
        const regex = new RegExp(String(condition.value));
        met = regex.test(String(fieldValue));
        break;
      }
      default:
        details.error = 'Unknown operator';
    }

    return { met, value: fieldValue, details };
  }

  /**
   * Get field value from context using dot notation
   */
  private getFieldValue(fieldPath: string, context: AlertEvaluationContext): any {
    const parts = fieldPath.split('.');
    let current: any = context;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }

    return current;
  }

  /**
   * Create alert from triggered rule
   */
  private createAlertFromRule(
    rule: AlertRule, 
    context: AlertEvaluationContext, 
    conditionResults: any[]
  ): Omit<Alert, 'id' | 'timestamp'> {
    const conditionsSummary = conditionResults
      .filter(cr => cr.met)
      .map(cr => `${cr.details?.fieldValue} ${cr.details?.operator} ${cr.details?.threshold}`)
      .join(', ');

    return {
      level: rule.level,
      type: rule.type,
      title: rule.name,
      message: `${rule.description || rule.name}: ${conditionsSummary}`,
      source: 'alert-rule-manager',
      acknowledged: false,
      status: 'active',
      metadata: {
        ruleId: rule.id,
        ruleName: rule.name,
        conditionResults,
        context: {
          timestamp: context.timestamp,
        },
      },
    };
  }

  /**
   * Handle a triggered rule
   */
  private handleTriggeredRule(rule: AlertRule, result: AlertRuleEvaluationResult): void {
    // Update trigger tracking
    this.lastTriggerTimes.set(rule.id, Date.now());
    rule.triggerCount++;
    rule.lastTriggered = Date.now();

    // Execute actions
    for (const action of rule.actions) {
      if (action.enabled) {
        this.executeAction(action, rule, result);
      }
    }

    // Emit rule triggered event
    this.emit('rule:triggered', { rule, result });
  }

  /**
   * Execute an alert action
   */
  private executeAction(action: AlertAction, rule: AlertRule, result: AlertRuleEvaluationResult): void {
    try {
      switch (action.type) {
        case 'log':
          this.executeLogAction(action, rule, result);
          break;
        case 'notification':
          this.executeNotificationAction(action, rule, result);
          break;
        case 'email':
          this.executeEmailAction(action, rule, result);
          break;
        case 'webhook':
          this.executeWebhookAction(action, rule, result);
          break;
        case 'sound':
          this.executeSoundAction(action, rule);
          break;
        default:
          console.warn(`Unknown action type: ${action.type}`);
      }
    } catch (error) {
      console.error(`Failed to execute action ${action.type} for rule ${rule.id}:`, error);
      this.emit('action:error', { action, rule, error });
    }
  }

  /**
   * Execute log action
   */
  private executeLogAction(action: AlertAction, rule: AlertRule, result: AlertRuleEvaluationResult): void {
    const level = action.config['level'] || 'info';
    const message = `[Alert] ${rule.name}: ${result.alert?.message}`;
    
    if (level === 'info') console.info(message);
    else if (level === 'warn') console.warn(message);
    else if (level === 'error') console.error(message);
    else console.log(message);
    this.emit('action:executed', { action, rule, type: 'log' });
  }

  /**
   * Execute notification action
   */
  private executeNotificationAction(action: AlertAction, rule: AlertRule, result: AlertRuleEvaluationResult): void {
    const notification = {
      title: action.config['title'] || rule.name,
      message: result.alert?.message || '',
      level: rule.level,
      urgent: action.config['urgent'] || false,
    };

    this.emit('notification:show', notification);
    this.emit('action:executed', { action, rule, type: 'notification' });
  }

  /**
   * Execute email action
   */
  private executeEmailAction(action: AlertAction, rule: AlertRule, result: AlertRuleEvaluationResult): void {
    // Email implementation would go here
    console.log(`[Email Alert] ${rule.name}: ${result.alert?.message}`);
    this.emit('action:executed', { action, rule, type: 'email' });
  }

  /**
   * Execute webhook action
   */
  private executeWebhookAction(action: AlertAction, rule: AlertRule, result: AlertRuleEvaluationResult): void {
    // Webhook implementation would go here
    console.log(`[Webhook Alert] ${rule.name}: ${result.alert?.message}`);
    this.emit('action:executed', { action, rule, type: 'webhook' });
  }

  /**
   * Execute sound action
   */
  private executeSoundAction(action: AlertAction, rule: AlertRule, ): void {
    // Sound implementation would go here (terminal bell, etc.)
    process.stdout.write('\x07'); // Terminal bell
    this.emit('action:executed', { action, rule, type: 'sound' });
  }

  /**
   * Get rule statistics
   */
  public getRuleStatistics(): { total: number; enabled: number; triggered: number; byType: Record<AlertType, number> } {
    const rules = this.getAllRules();
    const stats = {
      total: rules.length,
      enabled: rules.filter(r => r.enabled).length,
      triggered: rules.filter(r => r.triggerCount > 0).length,
      byType: { system: 0, stream: 0, channel: 0, network: 0 } as Record<AlertType, number>,
    };

    rules.forEach(rule => {
      stats.byType[rule.type]++;
    });

    return stats;
  }

  /**
   * Export rules configuration
   */
  public exportRules(): AlertRule[] {
    return this.getAllRules();
  }

  /**
   * Import rules configuration
   */
  public importRules(rules: AlertRule[], replace = false): { imported: number; errors: string[] } {
    const errors: string[] = [];
    let imported = 0;

    if (replace) {
      this.rules.clear();
      this.lastTriggerTimes.clear();
    }

    for (const rule of rules) {
      try {
        this.validateRule(rule);
        this.rules.set(rule.id, rule);
        imported++;
      } catch (error) {
        errors.push(`Rule ${rule.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    this.emit('rules:imported', { imported, errors });
    return { imported, errors };
  }

  /**
   * Clear all rules
   */
  public clearRules(): void {
    this.rules.clear();
    this.lastTriggerTimes.clear();
    this.emit('rules:cleared');
  }

  /**
   * Destroy the manager
   */
  public destroy(): void {
    this.stop();
    this.removeAllListeners();
    this.rules.clear();
    this.lastTriggerTimes.clear();
  }
}