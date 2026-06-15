/**
 * @fileoverview Viewer command definitions for CLI
 * @author Development Team
 * @since 12.1.0
 */

import { Command } from 'commander';
import { ViewerHandler } from '../handlers/viewer.handler';
import { ViewerServiceConfig } from '../types/viewer';
import { configManager } from '../config/manager';
import { authAdapter } from '../config/auth-adapter';
import { logError } from '../utils/errors';
import { AuthConfig } from '../types/auth';
import { OutputFormat } from '../handlers/base.handler';

/**
 * Validate output format
 * @param value Output format string
 * @returns Validated output format
 */
export function validateOutputFormat(value: string): OutputFormat {
  if (!['table', 'json'].includes(value)) {
    throw new Error('Output format must be either "table" or "json"');
  }
  return value as OutputFormat;
}

/**
 * Registers viewer-related commands with the CLI program
 * @param program Commander.js program instance
 */
export function registerViewerCommands(program: Command): void {
  const viewerCmd = program.command('viewer');
  viewerCmd.description('Manage viewer information queries');

  // ========================================
  // viewer get (AC #1)
  // ========================================
  const getCmd = viewerCmd
    .command('get')
    .description('Get single viewer details')
    .requiredOption('-i, --viewer-id <id>', 'viewer unique ID')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const viewerHandler = new ViewerHandler(authConfig, serviceConfig);

        await viewerHandler.getViewer({
          viewerId: options.viewerId,
          output: options.output,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  getCmd.addHelpText('after', `
Examples:
  # Get viewer details
  $ polyv-live-cli viewer get -i "2_v378gn997yovtl3p8h77db9e224t6hg9"

  # JSON output
  $ polyv-live-cli viewer get -i "2_v378gn997yovtl3p8h77db9e224t6hg9" -o json

Output Formats:
  table       - Formatted table output (default)
  json        - JSON format for programmatic use
`);

  // ========================================
  // viewer list (AC #2, #3)
  // ========================================
  const listCmd = viewerCmd
    .command('list')
    .description('List viewers with pagination and filters')
    .option('--source <type>', 'filter by source (IMPORT|WX|MOBILE)')
    .option('--mobile <number>', 'filter by mobile number')
    .option('--email <email>', 'filter by email')
    .option('--area <area>', 'filter by area')
    .option('--page <number>', 'page number', parseInt)
    .option('--size <number>', 'page size', parseInt)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const viewerHandler = new ViewerHandler(authConfig, serviceConfig);

        await viewerHandler.listViewers({
          source: options.source,
          mobile: options.mobile,
          email: options.email,
          area: options.area,
          page: options.page,
          size: options.size,
          output: options.output,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  listCmd.addHelpText('after', `
Examples:
  # List all viewers (default pagination)
  $ polyv-live-cli viewer list

  # List with custom pagination
  $ polyv-live-cli viewer list --page 1 --size 20

  # Filter by source
  $ polyv-live-cli viewer list --source IMPORT
  $ polyv-live-cli viewer list --source WX
  $ polyv-live-cli viewer list --source MOBILE

  # Filter by mobile number
  $ polyv-live-cli viewer list --mobile "13800138000"

  # Filter by email
  $ polyv-live-cli viewer list --email "user@example.com"

  # Filter by area
  $ polyv-live-cli viewer list --area "Beijing"

  # Combine multiple filters
  $ polyv-live-cli viewer list --source IMPORT --page 1 --size 50 -o json

Output Formats:
  table       - Formatted table output (default)
  json        - JSON format for programmatic use
`);

  // ========================================
  // viewer tag (Story 12-2)
  // ========================================
  const tagCmd = viewerCmd.command('tag');
  tagCmd.description('Manage viewer tags');

  // ========================================
  // viewer tag list (AC #3)
  // ========================================
  const tagListCmd = tagCmd
    .command('list')
    .description('List all viewer tags')
    .option('-k, --keyword <keyword>', 'keyword to search tag name')
    .option('--page <number>', 'page number', parseInt)
    .option('--size <number>', 'page size', parseInt)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const viewerHandler = new ViewerHandler(authConfig, serviceConfig);

        await viewerHandler.listViewerTags({
          keyword: options.keyword,
          page: options.page,
          size: options.size,
          output: options.output,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  tagListCmd.addHelpText('after', `
Examples:
  # List all tags
  $ polyv-live-cli viewer tag list

  # Search tags by keyword
  $ polyv-live-cli viewer tag list -k "VIP"

  # Paginated list
  $ polyv-live-cli viewer tag list --page 1 --size 20

  # JSON output
  $ polyv-live-cli viewer tag list -o json
`);

  // ========================================
  // viewer tag add (AC #1)
  // ========================================
  const tagAddCmd = tagCmd
    .command('add')
    .description('Add tags to viewers')
    .requiredOption('-V, --viewer-ids <ids>', 'comma-separated viewer IDs')
    .requiredOption('-l, --label-ids <ids>', 'comma-separated label IDs')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const viewerHandler = new ViewerHandler(authConfig, serviceConfig);

        await viewerHandler.addViewerTag({
          viewerIds: options.viewerIds,
          labelIds: options.labelIds,
          output: options.output,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  tagAddCmd.addHelpText('after', `
Examples:
  # Add single tag to single viewer
  $ polyv-live-cli viewer tag add -V "viewer1" -l 1

  # Add multiple tags to single viewer
  $ polyv-live-cli viewer tag add -V "viewer1" -l 1,2,3

  # Add tags to multiple viewers
  $ polyv-live-cli viewer tag add -V "viewer1,viewer2,viewer3" -l 1,2

  # JSON output
  $ polyv-live-cli viewer tag add -V "viewer1" -l 1 -o json
`);

  // ========================================
  // viewer tag remove (AC #2)
  // ========================================
  const tagRemoveCmd = tagCmd
    .command('remove')
    .description('Remove tags from viewers')
    .requiredOption('-V, --viewer-ids <ids>', 'comma-separated viewer IDs')
    .requiredOption('-l, --label-ids <ids>', 'comma-separated label IDs')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const viewerHandler = new ViewerHandler(authConfig, serviceConfig);

        await viewerHandler.removeViewerTag({
          viewerIds: options.viewerIds,
          labelIds: options.labelIds,
          output: options.output,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  tagRemoveCmd.addHelpText('after', `
Examples:
  # Remove single tag from single viewer
  $ polyv-live-cli viewer tag remove -V "viewer1" -l 1

  # Remove multiple tags from single viewer
  $ polyv-live-cli viewer tag remove -V "viewer1" -l 1,2,3

  # Remove tags from multiple viewers
  $ polyv-live-cli viewer tag remove -V "viewer1,viewer2" -l 1,2

  # JSON output
  $ polyv-live-cli viewer tag remove -V "viewer1" -l 1 -o json
`);
}

// ========================================
// Common helper
// ========================================
async function loadAuthAndServiceConfig(parentOptions: any): Promise<{
  authConfig: AuthConfig;
  serviceConfig: ViewerServiceConfig;
}> {
  const authResult = authAdapter.tryGetAuthConfig(parentOptions);
  if (!authResult) {
    throw new Error(authAdapter.getStatusMessage(parentOptions));
  }

  // Load app configuration for service settings (try-catch to handle missing auth in old config)
  let configResult;
  try {
    configResult = await configManager.load({
      cliOptions: parentOptions,
    });
  } catch (error) {
    // If config loading fails due to auth, use defaults for service config
    if (error instanceof Error && error.message.includes('Auth configuration is incomplete')) {
      configResult = {
        config: {
          baseUrl: 'https://api.polyv.net',
          timeout: 30000,
          debug: false
        }
      };
    } else {
      throw error;
    }
  }

  const serviceConfig: ViewerServiceConfig = {
    baseUrl: configResult.config.baseUrl,
    timeout: configResult.config.timeout,
    debug: configResult.config.debug,
  };

  return {
    authConfig: authResult.config,
    serviceConfig,
  };
}
