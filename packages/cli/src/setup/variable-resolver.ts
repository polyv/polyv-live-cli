/**
 * @fileoverview Variable resolver for scene configuration templates (Story 8-4)
 * Supports {timestamp}, {random:n-m}, {now}, {now+Nd}, {resource.field}
 */

import * as crypto from 'crypto';

/** Milliseconds per day constant */
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Maximum allowed random string length */
const MAX_RANDOM_LENGTH = 10000;

/** Maximum allowed day offset for {now+Nd} */
const MAX_DAY_OFFSET = 3650; // 10 years

/**
 * Resource outputs from previous resource creation
 * Key: resource id, Value: output fields
 */
export interface ResourceOutputs {
  [resourceId: string]: Record<string, any>;
}

/**
 * Variable resolver for scene configuration templates
 */
export class VariableResolver {
  private baseTimestamp: number;

  constructor() {
    // Use consistent timestamp within a resolution batch
    this.baseTimestamp = Date.now();
  }

  /**
   * Reset the base timestamp (call at start of scene execution)
   */
  resetTimestamp(): void {
    this.baseTimestamp = Date.now();
  }

  /**
   * Resolve variables in a string
   * @param template String containing variable placeholders
   * @param outputs Resource outputs for reference resolution
   * @returns Resolved string
   */
  resolve(template: string, outputs?: ResourceOutputs): string {
    // Note: baseTimestamp is NOT reset here to ensure consistency across multiple resolve calls

    let result = template;

    // Check for malformed variable syntax (unclosed braces)
    const openBraces = (template.match(/\{/g) || []).length;
    const closeBraces = (template.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      throw new Error('Malformed variable syntax: unclosed braces');
    }

    // Resolve timestamp
    result = result.replace(/\{timestamp\}/g, this.baseTimestamp.toString());

    // Resolve now and now+Nd
    result = this.resolveNowVariables(result);

    // Resolve random:n-m
    result = this.resolveRandomVariables(result);

    // Resolve resource references
    if (outputs) {
      result = this.resolveResourceReferences(result, outputs);
    }

    return result;
  }

  /**
   * Resolve variables in an object (deep resolution)
   * @param obj Object containing variable placeholders
   * @param outputs Resource outputs for reference resolution
   * @returns Resolved object
   */
  resolveObject<T extends Record<string, any>>(obj: T, outputs?: ResourceOutputs): T {
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        result[key] = this.resolve(value, outputs);
      } else if (Array.isArray(value)) {
        result[key] = value.map(item => {
          if (typeof item === 'string') {
            return this.resolve(item, outputs);
          } else if (typeof item === 'object' && item !== null) {
            return this.resolveObject(item, outputs);
          }
          return item;
        });
      } else if (typeof value === 'object' && value !== null) {
        result[key] = this.resolveObject(value, outputs);
      } else {
        // Preserve non-string values (numbers, booleans, null)
        result[key] = value;
      }
    }

    return result as T;
  }

  /**
   * Render a template with resource outputs
   * @param template Template string
   * @param outputs Resource outputs
   * @returns Rendered template
   */
  renderTemplate(template: string, outputs: ResourceOutputs): string {
    return this.resolve(template, outputs);
  }

  /**
   * Resolve {now} and {now+Nd} variables
   */
  private resolveNowVariables(template: string): string {
    // Check for invalid now offset format FIRST (patterns that don't match {now+Nd})
    const invalidNowPattern = /\{now\+([^}]+)\}/g;
    let invalidMatch;
    while ((invalidMatch = invalidNowPattern.exec(template)) !== null) {
      const content = invalidMatch[1];
      // Valid pattern is just digits followed by 'd' (e.g., "30d", "7d")
      if (content && !/^\d+d$/.test(content)) {
        throw new Error(`Invalid now offset format: {now+${content}}`);
      }
    }

    // Match {now+Nd} pattern (e.g., {now+30d}, {now+7d})
    const nowPlusPattern = /\{now\+(\d+)d\}/g;
    let result = template.replace(nowPlusPattern, (_match, days: string) => {
      const dayCount = parseInt(days, 10);
      if (dayCount > MAX_DAY_OFFSET) {
        throw new Error(`Invalid now offset: day count ${dayCount} exceeds maximum ${MAX_DAY_OFFSET}`);
      }
      return (this.baseTimestamp + dayCount * MS_PER_DAY).toString();
    });

    // Match plain {now}
    result = result.replace(/\{now\}/g, this.baseTimestamp.toString());

    return result;
  }

  /**
   * Resolve {random:n-m} variables
   */
  private resolveRandomVariables(template: string): string {
    const randomPattern = /\{random:(\d+)-(\d+)\}/g;

    return template.replace(randomPattern, (_match, minStr: string, maxStr: string) => {
      const min = parseInt(minStr, 10);
      const max = parseInt(maxStr, 10);

      // Validate range
      if (min < 1) {
        throw new Error('Invalid random range: min must be >= 1');
      }
      if (min > max) {
        throw new Error('Invalid random range: min must be <= max');
      }
      if (max > MAX_RANDOM_LENGTH) {
        throw new Error(`Invalid random range: max ${max} exceeds maximum ${MAX_RANDOM_LENGTH}`);
      }

      // Generate random length between min and max
      const length = Math.floor(Math.random() * (max - min + 1)) + min;

      // Generate alphanumeric string
      return this.generateRandomString(length);
    });
  }

  /**
   * Resolve {resource.field} references
   */
  private resolveResourceReferences(template: string, outputs: ResourceOutputs): string {
    const refPattern = /\{([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*))\}/g;

    return template.replace(refPattern, (_match, ref: string) => {
      const parts = ref.split('.');
      const resourceId = parts[0];

      if (!resourceId) {
        throw new Error('Invalid resource reference: empty resource id');
      }

      const fieldPath = parts.slice(1);

      // Check if resource exists
      const resourceOutput = outputs[resourceId];
      if (!resourceOutput) {
        throw new Error(`Resource "${resourceId}" not found in outputs`);
      }

      // Navigate to the field
      let value: any = resourceOutput;
      for (const field of fieldPath) {
        if (value === undefined || value === null) {
          throw new Error(`Field "${field}" not found in resource "${resourceId}" (value is undefined)`);
        }
        if (typeof value !== 'object') {
          throw new Error(`Cannot access field "${field}" on non-object value in resource "${resourceId}"`);
        }
        value = (value as Record<string, any>)[field];
      }

      if (value === undefined) {
        throw new Error(`Field "${fieldPath.join('.')}" not found in resource "${resourceId}"`);
      }

      // Convert to string if it's an object
      if (typeof value === 'object') {
        return JSON.stringify(value);
      }

      return String(value);
    });
  }

  /**
   * Generate a random alphanumeric string
   */
  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const randomBytes = crypto.randomBytes(length);
    let result = '';

    for (let i = 0; i < length; i++) {
      const byte = randomBytes[i];
      if (byte !== undefined) {
        result += chars[byte % chars.length];
      }
    }

    return result;
  }
}
