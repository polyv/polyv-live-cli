/**
 * Global command definitions for CLI.
 */

import { Command } from 'commander';
import { authAdapter } from '../config/auth-adapter';
import { configManager } from '../config/manager';
import { GlobalHandler } from '../handlers/global.handler';
import type { AuthConfig } from '../types/auth';
import { validateOutputFormat } from '../types/config';
import type { GlobalServiceConfig } from '../types/global';
import { logError } from '../utils/errors';

const DEFAULT_TIMEOUT_MS = 30000;

async function loadGlobalConfig(parentOptions: Record<string, unknown>): Promise<{
  authConfig: AuthConfig;
  serviceConfig: GlobalServiceConfig;
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
          timeout: DEFAULT_TIMEOUT_MS,
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
      debug: configResult.config.debug,
    },
  };
}

function parseJsonArray(value: string): unknown[] {
  const parsed = JSON.parse(value);
  if (!Array.isArray(parsed)) {
    throw new Error('settings must be a JSON array');
  }
  return parsed;
}

function parseJsonObject(value: string): Record<string, unknown> {
  const parsed = JSON.parse(value);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('config must be a JSON object');
  }
  return parsed as Record<string, unknown>;
}

function withGlobalHandler(
  program: Command,
  run: (handler: GlobalHandler) => Promise<void>
): Promise<void> {
  return (async () => {
    try {
      const parentOptions = program.opts();
      const { authConfig, serviceConfig } = await loadGlobalConfig(parentOptions);
      const handler = new GlobalHandler(authConfig, serviceConfig);
      await run(handler);
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)));
      process.exit(1);
    }
  })();
}

export function registerGlobalCommands(program: Command): void {
  const globalCmd = program
    .command('global')
    .description('Manage global account settings');

  const authCmd = globalCmd
    .command('auth')
    .description('Global auth settings');

  authCmd
    .command('get')
    .description('Get global auth settings')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withGlobalHandler(program, handler => handler.getAuth({
      output: options.output,
    })));

  authCmd
    .command('update')
    .description('Update global auth settings')
    .requiredOption('--settings <json>', 'auth settings JSON array with exactly 2 items', parseJsonArray)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withGlobalHandler(program, handler => handler.updateAuth({
      authSettings: options.settings,
      force: options.force,
      output: options.output,
    })));

  const pageSettingCmd = globalCmd
    .command('page-setting')
    .description('Global page settings');

  pageSettingCmd
    .command('get')
    .description('Get global page settings')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withGlobalHandler(program, handler => handler.getPageSetting({
      output: options.output,
    })));

  pageSettingCmd
    .command('update')
    .description('Update global page settings')
    .requiredOption('--config <json>', 'page setting JSON object', parseJsonObject)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withGlobalHandler(program, handler => handler.updatePageSetting({
      config: options.config,
      force: options.force,
      output: options.output,
    })));
}
