import type { Command } from 'commander';
import { authAdapter } from '../config/auth-adapter';
import { configManager } from '../config/manager';
import type { AuthConfig } from '../types/auth';
import { confirmDeletion } from './confirmation';

export interface ApiServiceConfig {
  baseUrl: string;
  timeout?: number;
  debug?: boolean;
  maxRetries?: number;
}

export async function loadApiCommandConfig(parentOptions: Record<string, unknown>): Promise<{
  authConfig: AuthConfig;
  serviceConfig: ApiServiceConfig;
}> {
  const authResult = authAdapter.tryGetAuthConfig(parentOptions);
  if (!authResult) {
    throw new Error(authAdapter.getStatusMessage(parentOptions));
  }

  let configResult;
  try {
    configResult = await configManager.load({ cliOptions: parentOptions });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Auth configuration is incomplete')) {
      configResult = {
        config: {
          baseUrl: 'https://api.polyv.net',
          timeout: 30000,
          maxRetries: 3,
          debug: false,
        },
      };
    } else {
      throw error;
    }
  }

  return {
    authConfig: authResult.config,
    serviceConfig: {
      baseUrl: configResult.config.baseUrl,
      timeout: configResult.config.timeout,
      maxRetries: configResult.config.maxRetries,
      debug: configResult.config.debug,
    },
  };
}

export function validateOutputFormat(value: string): 'table' | 'json' {
  if (value !== 'table' && value !== 'json') {
    throw new Error('output must be table or json');
  }
  return value;
}

export function validateYn(value: string): 'Y' | 'N' {
  if (value !== 'Y' && value !== 'N') {
    throw new Error('value must be Y or N');
  }
  return value;
}

export function parsePositiveInteger(value: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error('value must be a positive integer');
  }
  return parsed;
}

export function parseNonNegativeNumber(value: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error('value must be a non-negative number');
  }
  return parsed;
}

export function parseTimestamp(value: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error('timestamp must be a positive number');
  }
  return parsed;
}

export function parseJsonObject(value: string): Record<string, unknown> {
  const parsed = JSON.parse(value);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('value must be a JSON object');
  }
  return parsed as Record<string, unknown>;
}

export function parseJsonArray(value: string): unknown[] {
  const parsed = JSON.parse(value);
  if (!Array.isArray(parsed)) {
    throw new Error('value must be a JSON array');
  }
  return parsed;
}

export function parseStringList(value: string): string[] {
  const list = value.split(',').map((item) => item.trim()).filter(Boolean);
  if (list.length === 0) {
    throw new Error('list must not be empty');
  }
  return list;
}

export function parseNumberList(value: string): number[] {
  return parseStringList(value).map((item) => parsePositiveInteger(item));
}

export function compactParams<T extends Record<string, unknown>>(params: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
  ) as Partial<T>;
}

export function apiParams<T extends Record<string, unknown>>(params: T): Partial<T> {
  const { output, force, dryRun, ...rest } = params;
  void output;
  void force;
  void dryRun;
  return compactParams(rest as T);
}

export async function confirmWrite(force: boolean | undefined, message: string): Promise<void> {
  if (force) return;
  const confirmed = await confirmDeletion(message);
  if (!confirmed) {
    throw new Error('Operation cancelled.');
  }
}

export function commandParentOptions(program: Command): Record<string, unknown> {
  return program.opts() as Record<string, unknown>;
}
