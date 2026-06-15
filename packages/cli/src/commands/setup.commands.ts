/**
 * @fileoverview Setup command definitions for CLI (Story 8-4)
 */

import { Command } from 'commander';
import { SetupHandler } from '../handlers/setup.handler';
import { configManager } from '../config/manager';
import { authAdapter } from '../config/auth-adapter';
import { logError } from '../utils/errors';
import { AuthConfig } from '../types/auth';

/** Default timeout in milliseconds */
const DEFAULT_TIMEOUT_MS = 30000;

/**
 * Load and prepare authentication and service configuration
 */
async function loadAuthAndServiceConfig(parentOptions: Record<string, unknown>): Promise<{
  authConfig: AuthConfig;
  serviceConfig: { baseUrl: string; timeout: number; debug: boolean };
  isVerbose: boolean;
}> {
  // Get authentication using priority system
  const authResult = authAdapter.tryGetAuthConfig(parentOptions);
  if (!authResult) {
    throw new Error(authAdapter.getStatusMessage(parentOptions));
  }

  // Load app configuration for service settings
  let configResult;
  try {
    configResult = await configManager.load({
      cliOptions: parentOptions,
    });
  } catch (error) {
    // If config loading fails, use defaults
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

  const serviceConfig = {
    baseUrl: configResult.config.baseUrl,
    timeout: configResult.config.timeout,
    debug: configResult.config.debug,
  };

  const isVerbose = !!parentOptions['verbose'];
  if (isVerbose) {
    console.log(`🔐 Authentication Source: ${authResult.source}`);
    if (authResult.accountName) {
      console.log(`👤 Account: ${authResult.accountName}`);
    }
    console.log('');
  }

  return {
    authConfig: authResult.config,
    serviceConfig,
    isVerbose,
  };
}

/**
 * Validate output format
 * @param value Output format string
 * @returns Validated output format
 * @throws Error if format is invalid
 */
export function validateOutputFormat(value: string): 'table' | 'json' {
  if (!['table', 'json'].includes(value)) {
    throw new Error('Invalid output format. Must be "table" or "json"');
  }
  return value as 'table' | 'json';
}

/**
 * Registers setup commands with the CLI program
 * @param program Commander.js program instance
 */
export function registerSetupCommand(program: Command): void {
  const setupCmd = program
    .command('setup [scene]')
    .description('Initialize a scene with predefined resources')
    .option('-l, --list', 'List available scenes')
    .option('--detailed', 'Show detailed scene information (with --list)')
    .option('--dry-run', 'Preview what would be created without making changes')
    .option('-o, --output <format>', 'Output format (table|json)', validateOutputFormat, 'table')
    .action(async (scene: string | undefined, options: {
      list?: boolean;
      detailed?: boolean;
      dryRun?: boolean;
      output?: 'table' | 'json';
    }) => {
      try {
        // Load authentication and service configuration
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        // Create setup handler instance
        const setupHandler = new SetupHandler(authConfig, serviceConfig);

        // Handle --list option
        if (options.list) {
          if (options.detailed) {
            await setupHandler.listScenesDetailed({
              output: options.output ?? 'table',
              detailed: true,
            });
          } else {
            await setupHandler.listScenes({
              output: options.output ?? 'table',
              detailed: false,
            });
          }
          return;
        }

        // Require scene name when not listing
        if (!scene) {
          console.error('Error: Scene name is required.');
          console.error('');
          console.error('Usage: polyv-live-cli setup <scene-name>');
          console.error('       polyv-live-cli setup --list');
          console.error('');
          console.error('Example:');
          console.error('  polyv-live-cli setup e-commerce');
          console.error('  polyv-live-cli setup --list');
          process.exit(1);
        }

        // Execute setup
        await setupHandler.setup({
          scene,
          output: options.output ?? 'table',
          dryRun: options.dryRun ?? false,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Add help text
  setupCmd.addHelpText('after', `
Examples:
  # Initialize e-commerce scene
  $ polyv-live-cli setup e-commerce

  # List available scenes
  $ polyv-live-cli setup --list

  # Preview what would be created (dry run)
  $ polyv-live-cli setup e-commerce --dry-run

  # Get detailed scene information
  $ polyv-live-cli setup --list --detailed

Available Scenes:
  e-commerce  - 电商直播场景 (频道、商品、优惠券)

Custom Scenes:
  You can create custom scenes in ~/.polyv/scenes/ directory.
  See documentation for scene configuration format.
`);
}
