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
import { parsePositiveInteger, validateYn } from '../utils/api-command';

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
  // viewer create/update/delete/import/config/lottery-wins
  // ========================================
  viewerCmd
    .command('create')
    .description('Create a viewer record')
    .requiredOption('--nickname <nickname>', 'viewer nickname')
    .requiredOption('--mobile <mobile>', 'viewer mobile number')
    .option('--name <name>', 'viewer real name')
    .option('--last-collect-mobile <mobile>', 'last collected mobile number')
    .option('--email <email>', 'viewer email')
    .option('--area <area>', 'viewer area')
    .option('--latest-access-ip <ip>', 'latest access IP')
    .option('--device <device>', 'viewer device')
    .option('--follow-users <json>', 'follow users JSON object')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      await executeViewerCommand(program, (viewerHandler) => viewerHandler.createViewer({
        nickname: options.nickname,
        mobile: options.mobile,
        name: options.name,
        lastCollectMobile: options.lastCollectMobile,
        email: options.email,
        area: options.area,
        latestAccessIp: options.latestAccessIp,
        device: options.device,
        followUsers: options.followUsers,
        force: options.force,
        output: options.output,
      }));
    });

  viewerCmd
    .command('update')
    .description('Update a viewer record')
    .requiredOption('-u, --viewer-union-id <id>', 'viewer union ID')
    .option('--nickname <nickname>', 'viewer nickname')
    .option('--mobile <mobile>', 'viewer mobile number')
    .option('--name <name>', 'viewer real name')
    .option('--last-collect-mobile <mobile>', 'last collected mobile number')
    .option('--email <email>', 'viewer email')
    .option('--area <area>', 'viewer area')
    .option('--latest-access-ip <ip>', 'latest access IP')
    .option('--device <device>', 'viewer device')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      await executeViewerCommand(program, (viewerHandler) => viewerHandler.updateViewer({
        viewerUnionId: options.viewerUnionId,
        nickname: options.nickname,
        mobile: options.mobile,
        name: options.name,
        lastCollectMobile: options.lastCollectMobile,
        email: options.email,
        area: options.area,
        latestAccessIp: options.latestAccessIp,
        device: options.device,
        force: options.force,
        output: options.output,
      }));
    });

  viewerCmd
    .command('delete')
    .description('Delete a viewer record')
    .requiredOption('-u, --viewer-union-id <id>', 'viewer union ID')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      await executeViewerCommand(program, (viewerHandler) => viewerHandler.deleteViewer({
        viewerUnionId: options.viewerUnionId,
        force: options.force,
        output: options.output,
      }));
    });

  viewerCmd
    .command('import-external')
    .description('Import external viewer records')
    .option('--viewers <json>', 'JSON array of external viewer objects')
    .option('--external-viewer-id <id>', 'external viewer ID for single import')
    .option('--nickname <nickname>', 'viewer nickname for single import')
    .option('--label-ids <ids>', 'comma-separated label IDs for single import')
    .option('--follow-user-id <id>', 'follow user ID for single import')
    .option('--follow-user-type <type>', 'follow user type for single import')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      await executeViewerCommand(program, (viewerHandler) => viewerHandler.importExternalViewers({
        viewers: options.viewers,
        externalViewerId: options.externalViewerId,
        nickname: options.nickname,
        labelIds: options.labelIds,
        followUserId: options.followUserId,
        followUserType: options.followUserType,
        force: options.force,
        output: options.output,
      }));
    });

  const configCmd = viewerCmd.command('config');
  configCmd.description('Manage viewer user system config');
  configCmd
    .command('update')
    .description('Update viewer user system config')
    .requiredOption('--mobile-login-enabled <Y|N>', 'mobile login enabled', validateYn)
    .requiredOption('--wx-work-login-enabled <Y|N>', 'WeCom login enabled', validateYn)
    .option('--viewer-weixin-auth-expired <days>', 'WeChat auth expiry days (0-180)', parseZeroBasedInteger)
    .option('--collect-mobile-enabled <Y|N>', 'collect mobile enabled', validateYn)
    .option('--guest-mode-enabled <Y|N>', 'guest mode enabled', validateYn)
    .option('--tourist-external-href-enabled <Y|N>', 'external tourist link enabled', validateYn)
    .option('--tourist-external-href-config <json>', 'external tourist link config JSON object')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      await executeViewerCommand(program, (viewerHandler) => viewerHandler.updateViewerConfig({
        mobileLoginEnabled: options.mobileLoginEnabled,
        wxWorkLoginEnabled: options.wxWorkLoginEnabled,
        viewerWeixinAuthExpired: options.viewerWeixinAuthExpired,
        collectMobileEnabled: options.collectMobileEnabled,
        guestModeEnabled: options.guestModeEnabled,
        touristExternalHrefEnabled: options.touristExternalHrefEnabled,
        touristExternalHrefConfig: options.touristExternalHrefConfig,
        force: options.force,
        output: options.output,
      }));
    });

  viewerCmd
    .command('lottery-wins')
    .description('List viewer lottery win records')
    .requiredOption('-i, --viewer-id <id>', 'viewer ID')
    .option('--page <number>', 'page number', parsePositiveInteger)
    .option('--size <number>', 'page size', parsePositiveInteger)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      await executeViewerCommand(program, (viewerHandler) => viewerHandler.listViewerLotteryWins({
        viewerId: options.viewerId,
        page: options.page,
        size: options.size,
        output: options.output,
      }));
    });

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
  // viewer tag create/update/delete
  // ========================================
  tagCmd
    .command('create')
    .description('Create viewer tags')
    .requiredOption('-l, --labels <names>', 'comma-separated tag names')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      await executeViewerCommand(program, (viewerHandler) => viewerHandler.createViewerTag({
        labels: options.labels,
        force: options.force,
        output: options.output,
      }));
    });

  tagCmd
    .command('update')
    .description('Update a viewer tag')
    .requiredOption('--id <id>', 'viewer tag ID', parsePositiveInteger)
    .option('-l, --label <name>', 'new tag name')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      await executeViewerCommand(program, (viewerHandler) => viewerHandler.updateViewerTag({
        id: options.id,
        label: options.label,
        force: options.force,
        output: options.output,
      }));
    });

  tagCmd
    .command('delete')
    .description('Delete a viewer tag')
    .requiredOption('--id <id>', 'viewer tag ID', parsePositiveInteger)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      await executeViewerCommand(program, (viewerHandler) => viewerHandler.deleteViewerTag({
        id: options.id,
        force: options.force,
        output: options.output,
      }));
    });

  // ========================================
  // viewer tag add (AC #1)
  // ========================================
  const tagAddCmd = tagCmd
    .command('add')
    .description('Add tags to viewers')
    .requiredOption('-V, --viewer-ids <ids>', 'comma-separated viewer IDs')
    .requiredOption('-l, --label-ids <ids>', 'comma-separated label IDs')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const viewerHandler = new ViewerHandler(authConfig, serviceConfig);

        await viewerHandler.addViewerTag({
          viewerIds: options.viewerIds,
          labelIds: options.labelIds,
          force: options.force,
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
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const viewerHandler = new ViewerHandler(authConfig, serviceConfig);

        await viewerHandler.removeViewerTag({
          viewerIds: options.viewerIds,
          labelIds: options.labelIds,
          force: options.force,
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

  // ========================================
  // viewer label: account labels and channel refs
  // ========================================
  const labelCmd = viewerCmd.command('label');
  labelCmd.description('Manage account labels and channel label refs');

  labelCmd
    .command('list')
    .description('List account labels')
    .option('--page <number>', 'page number', parsePositiveInteger)
    .option('--size <number>', 'page size', parsePositiveInteger)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      await executeViewerCommand(program, (viewerHandler) => viewerHandler.listLabels({
        page: options.page,
        size: options.size,
        output: options.output,
      }));
    });

  labelCmd
    .command('create')
    .description('Create an account label')
    .requiredOption('--label-name <name>', 'account label name (required, max 8 characters)')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      await executeViewerCommand(program, (viewerHandler) => viewerHandler.createLabel({
        labelName: options.labelName,
        force: options.force,
        output: options.output,
      }));
    });

  labelCmd
    .command('update')
    .description('Update an account label')
    .requiredOption('--label-id <id>', 'account label ID (string, from `viewer label list`)')
    .requiredOption('--label-name <name>', 'account label name')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      await executeViewerCommand(program, (viewerHandler) => viewerHandler.updateLabel({
        labelId: options.labelId,
        labelName: options.labelName,
        force: options.force,
        output: options.output,
      }));
    });

  labelCmd
    .command('delete')
    .description('Delete an account label')
    .requiredOption('--label-id <id>', 'account label ID (string, from `viewer label list`)')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      await executeViewerCommand(program, (viewerHandler) => viewerHandler.deleteLabel({
        labelId: options.labelId,
        force: options.force,
        output: options.output,
      }));
    });

  const channelRefCmd = labelCmd.command('channel-ref');
  channelRefCmd.description('Manage channel label refs');
  channelRefCmd
    .command('add')
    .description('Add account label refs to channels')
    .requiredOption('-c, --channel-ids <ids>', 'comma-separated channel IDs')
    .requiredOption('-l, --label-ids <ids>', 'comma-separated account label IDs from viewer label list')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      await executeViewerCommand(program, (viewerHandler) => viewerHandler.addChannelLabelRefs({
        channelIds: options.channelIds,
        labelIds: options.labelIds,
        force: options.force,
        output: options.output,
      }));
    });
}

// ========================================
// Common helper
// ========================================
function parseZeroBasedInteger(value: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error('value must be a non-negative integer');
  }
  return parsed;
}

async function executeViewerCommand(
  program: Command,
  action: (viewerHandler: ViewerHandler) => Promise<void>
): Promise<void> {
  try {
    const parentOptions = program.opts();
    const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);
    const viewerHandler = new ViewerHandler(authConfig, serviceConfig);
    await action(viewerHandler);
  } catch (error) {
    logError(error instanceof Error ? error : new Error(String(error)));
    process.exit(1);
  }
}

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
