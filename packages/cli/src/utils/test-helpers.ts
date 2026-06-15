/**
 * @fileoverview Test helpers for CLI commands
 * Provides reusable mock utilities for auth and config mocking
 * @author Development Team
 * @since 1.2.25
 *
 * @example
 * ## Basic Usage
 *
 * ```typescript
 * // At module level - setup mocks
 * jest.mock('../config/auth-adapter', () => ({
 *   authAdapter: {
 *     tryGetAuthConfig: jest.fn(),
 *     getStatusMessage: jest.fn(),
 *   },
 * }));
 *
 * jest.mock('../config/manager', () => ({
 *   configManager: {
 *     load: jest.fn(),
 *   },
 * }));
 *
 * import { authAdapter } from '../config/auth-adapter';
 * import { configManager } from '../config/manager';
 * import { mockAuthSuccess, mockAuthFailure, createTestProgram } from '../utils/test-helpers';
 *
 * describe('my commands', () => {
 *   let program: Command;
 *
 *   beforeEach(() => {
 *     program = createTestProgram();
 *     mockAuthSuccess(authAdapter, configManager);
 *   });
 *
 *   it('should execute command', async () => {
 *     registerMyCommand(program);
 *     await program.parseAsync(['node', 'test', 'my', 'action'], { from: 'user' });
 *     // assertions...
 *   });
 * });
 * ```
 */

import { Command } from 'commander';

/**
 * Standard auth config for testing
 */
export const mockAuthConfig = {
  appId: 'test-app-id',
  appSecret: 'test-app-secret',
  userId: 'test-user-id',
};

/**
 * Standard service config for testing
 */
export const mockServiceConfig = {
  baseUrl: 'https://api.polyv.net',
  timeout: 30000,
  debug: false,
};

/**
 * Auth result returned by tryGetAuthConfig
 */
export interface MockAuthResult {
  config: typeof mockAuthConfig;
  source: string;
  accountName: string | null;
}

/**
 * Config result returned by configManager.load
 */
export interface MockConfigResult {
  config: typeof mockServiceConfig;
}

/**
 * Setup mocks for auth-adapter module
 * Call this at module level (outside describe blocks)
 *
 * @example
 * ```typescript
 * jest.mock('../config/auth-adapter', () => ({
 *   authAdapter: {
 *     tryGetAuthConfig: jest.fn(),
 *     getStatusMessage: jest.fn(),
 *   },
 * }));
 * ```
 */
export function getAuthAdapterMockDefinition() {
  return {
    authAdapter: {
      tryGetAuthConfig: jest.fn(),
      getStatusMessage: jest.fn().mockReturnValue('No authentication configured'),
    },
  };
}

/**
 * Setup mocks for config/manager module
 * Call this at module level (outside describe blocks)
 *
 * @example
 * ```typescript
 * jest.mock('../config/manager', () => ({
 *   configManager: {
 *     load: jest.fn(),
 *   },
 * }));
 * ```
 */
export function getConfigManagerMockDefinition() {
  return {
    configManager: {
      load: jest.fn(),
    },
  };
}

/**
 * Create a fresh program instance for testing
 * Note: Does NOT call exitOverride() by default, as it can interfere
 * with parseAsync. Use mockProcessExit() in beforeEach if needed.
 */
export function createTestProgram(): Command {
  return new Command();
}

/**
 * Mock successful auth configuration
 * Use in beforeEach to set up standard auth mock
 *
 * @param authAdapter - The mocked authAdapter module
 * @param configManager - The mocked configManager module
 * @param options - Optional overrides
 */
export function mockAuthSuccess(
  authAdapter: { tryGetAuthConfig: jest.Mock; getStatusMessage: jest.Mock },
  configManager: { load: jest.Mock },
  options: {
    source?: string;
    accountName?: string | null;
    baseUrl?: string;
    timeout?: number;
    debug?: boolean;
  } = {}
): void {
  const authResult: MockAuthResult = {
    config: mockAuthConfig,
    source: options.source || 'environment',
    accountName: options.accountName ?? null,
  };

  const configResult: MockConfigResult = {
    config: {
      baseUrl: options.baseUrl || mockServiceConfig.baseUrl,
      timeout: options.timeout ?? mockServiceConfig.timeout,
      debug: options.debug ?? mockServiceConfig.debug,
    },
  };

  authAdapter.tryGetAuthConfig.mockReturnValue(authResult);
  configManager.load.mockResolvedValue(configResult);
}

/**
 * Mock failed auth configuration (no auth available)
 *
 * @param authAdapter - The mocked authAdapter module
 * @param message - Optional custom error message
 */
export function mockAuthFailure(
  authAdapter: { tryGetAuthConfig: jest.Mock; getStatusMessage: jest.Mock },
  message: string = 'No authentication configured'
): void {
  authAdapter.tryGetAuthConfig.mockReturnValue(null);
  authAdapter.getStatusMessage.mockReturnValue(message);
}

/**
 * Mock config loading error that triggers fallback
 * This simulates "Auth configuration is incomplete" error
 *
 * @param configManager - The mocked configManager module
 * @param errorMessage - Error message to throw
 */
export function mockConfigError(
  configManager: { load: jest.Mock },
  errorMessage: string
): void {
  configManager.load.mockRejectedValue(new Error(errorMessage));
}

/**
 * Create a mock handler with standard methods
 *
 * @param methods - Object with method names as keys and mock implementations as values
 * @returns Mocked handler object
 *
 * @example
 * ```typescript
 * const mockHandler = createMockHandler({
 *   getAccountInfo: { data: { accountId: '123' } },
 *   updateSwitch: undefined,
 * });
 * ```
 */
export function createMockHandler<T extends Record<string, any>>(
  methods: T
): { [K in keyof T]: jest.Mock } {
  const handler: any = {};
  for (const [key, value] of Object.entries(methods)) {
    handler[key] = jest.fn().mockResolvedValue(value);
  }
  return handler;
}

/**
 * Suppress console output during tests
 * Returns cleanup function to restore console
 */
export function suppressConsole(): () => void {
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();

  return () => {
    console.log = originalLog;
    console.error = originalError;
    console.warn = originalWarn;
  };
}

/**
 * Mock process.exit to throw instead of exiting
 * Returns cleanup function to restore original process.exit
 *
 * @example
 * ```typescript
 * let restoreExit: () => void;
 *
 * beforeEach(() => {
 *   restoreExit = mockProcessExit();
 * });
 *
 * afterEach(() => {
 *   restoreExit();
 * });
 * ```
 */
export function mockProcessExit(): () => void {
  const originalExit = process.exit;
  process.exit = jest.fn().mockImplementation((code?: number) => {
    throw new Error(`process.exit:${code ?? 0}`);
  }) as unknown as typeof process.exit;

  return () => {
    process.exit = originalExit;
  };
}

/**
 * Wait for a short period (useful for async testing)
 */
export function tick(ms: number = 0): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Helper to parse command with async action
 * Handles the Commander.js parseAsync pattern
 *
 * @param program - Commander program instance
 * @param args - Command line arguments (without 'node' and script name)
 */
export async function parseCommandAsync(
  program: Command,
  args: string[]
): Promise<void> {
  await program.parseAsync(['node', 'test', ...args], { from: 'user' });
}

/**
 * Create mock parent options for command testing
 */
export function createMockParentOptions(
  options: Record<string, any> = {}
): Record<string, any> {
  return {
    appId: undefined,
    appSecret: undefined,
    userId: undefined,
    verbose: false,
    ...options,
  };
}
