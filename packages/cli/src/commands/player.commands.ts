/**
 * @fileoverview Player command definitions for CLI
 * @author Development Team
 * @since 10.5.0
 */

import { Command } from 'commander';
import { PlayerHandler } from '../handlers/player.handler';
import {
  PlayerServiceConfig,
  PlayerConfigGetOptions,
  PlayerConfigUpdateOptions,
} from '../types/player';
import { configManager } from '../config/manager';
import { authAdapter } from '../config/auth-adapter';
import { logError } from '../utils/errors';
import { AuthConfig } from '../types/auth';
import {
  parseNonNegativeNumber,
  parsePositiveInteger,
  parseStringList,
} from '../utils/api-command';

/**
 * Validate watermark position
 * @param value Position string
 * @returns Validated position
 * @throws Error if position is invalid
 */
export function validateWatermarkPosition(value: string): 'tl' | 'tr' | 'bl' | 'br' {
  const validPositions = ['tl', 'tr', 'bl', 'br'];
  if (!validPositions.includes(value)) {
    throw new Error(`watermarkPosition must be one of: ${validPositions.join(', ')}`);
  }
  return value as 'tl' | 'tr' | 'bl' | 'br';
}

/**
 * Validate watermark opacity
 * @param value Opacity string
 * @returns Validated opacity number
 * @throws Error if opacity is invalid
 */
export function validateWatermarkOpacity(value: string): number {
  const opacity = parseFloat(value);
  if (isNaN(opacity) || opacity < 0 || opacity > 1) {
    throw new Error('watermarkOpacity must be a number between 0 and 1');
  }
  return opacity;
}

/**
 * Validate Y/N value
 * @param value Y/N string
 * @returns Validated Y/N value
 * @throws Error if value is invalid
 */
export function validateYNValue(value: string): 'Y' | 'N' {
  if (value !== 'Y' && value !== 'N') {
    throw new Error('Value must be "Y" or "N"');
  }
  return value;
}

function parseFontSize(value: string): number | 'small' | 'middle' | 'large' {
  if (['small', 'middle', 'large'].includes(value)) {
    return value as 'small' | 'middle' | 'large';
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 256) {
    throw new Error('font size must be 1-256 or one of small, middle, large');
  }
  return parsed;
}

function validateAntiRecordType(value: string): 'marquee' | 'watermark' {
  if (value !== 'marquee' && value !== 'watermark') {
    throw new Error('anti-record type must be marquee or watermark');
  }
  return value;
}

function validateAntiRecordModel(value: string): 'fixed' | 'nickname' | 'diyurl' {
  if (!['fixed', 'nickname', 'diyurl'].includes(value)) {
    throw new Error('model type must be fixed, nickname, or diyurl');
  }
  return value as 'fixed' | 'nickname' | 'diyurl';
}

function validateShowMode(value: string): 'roll' | 'flicker' {
  if (value !== 'roll' && value !== 'flicker') {
    throw new Error('show mode must be roll or flicker');
  }
  return value;
}

function validateHeadAdvertType(value: string): 'NONE' | 'IMAGE' | 'FLV' {
  if (!['NONE', 'IMAGE', 'FLV'].includes(value)) {
    throw new Error('head advert type must be NONE, IMAGE, or FLV');
  }
  return value as 'NONE' | 'IMAGE' | 'FLV';
}

/**
 * Validate output format
 * @param value Output format string
 * @returns Validated output format
 * @throws Error if format is invalid
 */
export function validateOutputFormat(value: string): 'table' | 'json' {
  if (!['table', 'json'].includes(value)) {
    throw new Error('Output format must be either "table" or "json"');
  }
  return value as 'table' | 'json';
}

/**
 * Load and prepare authentication and service configuration
 */
async function loadAuthAndServiceConfig(parentOptions: any): Promise<{
  authConfig: AuthConfig;
  serviceConfig: PlayerServiceConfig;
  isVerbose: boolean;
  authSource?: string;
  accountName?: string;
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

  // Create service configuration
  const serviceConfig: PlayerServiceConfig = {
    baseUrl: configResult.config.baseUrl,
    timeout: configResult.config.timeout,
    debug: configResult.config.debug
  };

  // Display authentication source information if verbose
  const isVerbose = !!parentOptions.verbose;
  if (isVerbose) {
    console.log(`🔐 Authentication Source: ${authResult.source}`);
    if (authResult.accountName) {
      console.log(`👤 Account: ${authResult.accountName}`);
    }
    console.log('');
  }

  const result: {
    authConfig: AuthConfig;
    serviceConfig: PlayerServiceConfig;
    isVerbose: boolean;
    authSource?: string;
    accountName?: string;
  } = {
    authConfig: authResult.config,
    serviceConfig,
    isVerbose,
  };

  if (authResult.source) {
    result.authSource = authResult.source;
  }

  if (authResult.accountName) {
    result.accountName = authResult.accountName;
  }

  return result;
}

/**
 * Registers player-related commands with the CLI program
 * @param program Commander.js program instance
 */
export function registerPlayerCommands(program: Command): void {
  // Create player command group
  const playerCmd = program.command('player');
  playerCmd.description('Manage channel player settings');

  // Create player config command group
  const configCmd = playerCmd.command('config');
  configCmd.description('Manage channel player configuration');

  // Player config get command
  const getCmd = configCmd
    .command('get')
    .description('Get player configuration for a channel')
    .requiredOption('-c, --channel-id <channelId>', 'channel ID')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        // Load authentication and service configuration
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        // Create player handler instance
        const playerHandler = new PlayerHandler(authConfig, serviceConfig);

        // Transform commander options to handler options
        const getOptions: PlayerConfigGetOptions = {
          channelId: options.channelId,
          output: options.output
        };

        // Execute player config get
        await playerHandler.getConfig(getOptions);

      } catch (error) {
        // Enhanced error handling with authentication context
        if (error instanceof Error && error.message.includes('Authentication')) {
          const diagnostics = authAdapter.getDiagnostics(program.opts());
          console.error('\n🔍 Authentication Diagnostics:');
          diagnostics.availableSources.forEach(source => {
            const status = source.appId && source.appSecret ? '✅' : '❌';
            console.error(`  ${status} ${source.metadata.source}: ${source.type}`);
          });
          if (diagnostics.errors.length > 0) {
            console.error('\n❌ Errors:');
            diagnostics.errors.forEach(err => console.error(`  - ${err}`));
          }
        }
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Add help text for player config get command
  getCmd.addHelpText('after', `
Examples:
  # Get player configuration for a channel
  $ polyv-live-cli player config get -c "3151318"

  # Output in JSON format
  $ polyv-live-cli player config get -c "3151318" -o json

  # With full parameter names
  $ polyv-live-cli player config get --channel-id "3151318" --output table

Output Formats:
  table          Formatted table output (default)
  json           JSON format for programmatic use

Notes:
  - Channel ID is required for all player config queries
  - Configuration includes watermark, warmup image, and view data settings
`);

  // Player config update command
  const updateCmd = configCmd
    .command('update')
    .description('Update player configuration for a channel')
    .requiredOption('-c, --channel-id <channelId>', 'channel ID')
    .option('--watermark-enabled <enabled>', 'watermark enabled (Y/N)', validateYNValue)
    .option('--watermark-url <url>', 'watermark image URL')
    .option('--watermark-position <position>', 'watermark position (tl/tr/bl/br)', validateWatermarkPosition)
    .option('--watermark-opacity <opacity>', 'watermark opacity (0-1)', validateWatermarkOpacity)
    .option('--warmup-enabled <enabled>', 'warmup enabled (Y/N)', validateYNValue)
    .option('--warmup-image-url <url>', 'warmup image URL')
    .option('--base-pv <count>', 'base page views', parseInt)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        // Load authentication and service configuration
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        // Create player handler instance
        const playerHandler = new PlayerHandler(authConfig, serviceConfig);

        // Transform commander options to handler options
        const updateOptions: PlayerConfigUpdateOptions = {
          channelId: options.channelId,
          output: options.output
        };

        // Add optional parameters
        if (options.watermarkEnabled !== undefined) {
          updateOptions.watermarkEnabled = options.watermarkEnabled;
        }
        if (options.watermarkUrl !== undefined) {
          updateOptions.watermarkUrl = options.watermarkUrl;
        }
        if (options.watermarkPosition !== undefined) {
          updateOptions.watermarkPosition = options.watermarkPosition;
        }
        if (options.watermarkOpacity !== undefined) {
          updateOptions.watermarkOpacity = options.watermarkOpacity;
        }
        if (options.warmupEnabled !== undefined) {
          updateOptions.warmupEnabled = options.warmupEnabled;
        }
        if (options.warmupImageUrl !== undefined) {
          updateOptions.warmupImageUrl = options.warmupImageUrl;
        }
        if (options.basePv !== undefined) {
          updateOptions.basePv = options.basePv;
        }

        // Execute player config update
        await playerHandler.updateConfig(updateOptions);

      } catch (error) {
        // Enhanced error handling with authentication context
        if (error instanceof Error && error.message.includes('Authentication')) {
          const diagnostics = authAdapter.getDiagnostics(program.opts());
          console.error('\n🔍 Authentication Diagnostics:');
          diagnostics.availableSources.forEach(source => {
            const status = source.appId && source.appSecret ? '✅' : '❌';
            console.error(`  ${status} ${source.metadata.source}: ${source.type}`);
          });
          if (diagnostics.errors.length > 0) {
            console.error('\n❌ Errors:');
            diagnostics.errors.forEach(err => console.error(`  - ${err}`));
          }
        }
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Add help text for player config update command
  updateCmd.addHelpText('after', `
Examples:
  # Update watermark settings
  $ polyv-live-cli player config update -c "3151318" --watermark-enabled Y --watermark-url "http://example.com/logo.png" --watermark-position br --watermark-opacity 0.8

  # Update warmup settings
  $ polyv-live-cli player config update -c "3151318" --warmup-enabled Y --warmup-image-url "http://example.com/warmup.jpg"

  # Update base page views
  $ polyv-live-cli player config update -c "3151318" --base-pv 1000

  # Combined update with JSON output
  $ polyv-live-cli player config update -c "3151318" --watermark-enabled Y --base-pv 1000 -o json

Watermark Position:
  --watermark-position    Watermark position on the player
                 tl: Top-left
                 tr: Top-right
                 bl: Bottom-left
                 br: Bottom-right (default)

Watermark Opacity:
  --watermark-opacity     Watermark opacity from 0 (transparent) to 1 (opaque)

Y/N Values:
  --watermark-enabled     Enable/disable watermark (Y or N)
  --warmup-enabled        Enable/disable warmup image (Y or N)

Output Formats:
  table          Formatted output (default)
  json           JSON format for programmatic use
`);

  const skinCmd = playerCmd.command('skin').description('Manage V4 player skin settings');
  skinCmd.command('update-batch')
    .description('Batch update channel player skin')
    .requiredOption('--channel-ids <ids>', 'channel IDs, comma-separated, max 500', parseStringList)
    .requiredOption('--skin <skin>', 'skin: black|red|blue|white|green|golden')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(program.opts());
        await new PlayerHandler(authConfig, serviceConfig).updateSkinBatch(options);
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  const antiRecordCmd = playerCmd.command('anti-record').description('Manage anti-record settings');

  antiRecordCmd.command('get')
    .description('Get anti-record settings')
    .requiredOption('-c, --channel-id <channelId>', 'channel ID')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(program.opts());
        await new PlayerHandler(authConfig, serviceConfig).getAntiRecord(options);
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  antiRecordCmd.command('update')
    .description('Update anti-record settings')
    .requiredOption('-c, --channel-id <channelId>', 'channel ID')
    .requiredOption('--anti-record-type <type>', 'anti-record type (marquee|watermark)', validateAntiRecordType)
    .requiredOption('--model-type <type>', 'model type (fixed|nickname|diyurl)', validateAntiRecordModel)
    .requiredOption('--content <content>', 'content text or DIY URL')
    .requiredOption('--font-size <size>', 'font size', parseFontSize)
    .option('--opacity <opacity>', 'opacity 0-100', parseNonNegativeNumber)
    .option('--font-color <color>', 'font color, hex format')
    .option('--show-mode <mode>', 'show mode (roll|flicker)', validateShowMode)
    .option('--double-enabled <value>', 'double enabled (Y|N)', validateYNValue)
    .option('--auto-zoom-enabled <value>', 'auto zoom enabled (Y|N)', validateYNValue)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(program.opts());
        await new PlayerHandler(authConfig, serviceConfig).updateAntiRecord(options);
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  playerCmd.command('marquee-url')
    .description('Set marquee URL restriction')
    .requiredOption('-c, --channel-id <channelId>', 'channel ID')
    .requiredOption('--marquee-restrict <value>', 'marquee restrict (Y|N)', validateYNValue)
    .option('--url <url>', 'marquee URL')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(program.opts());
        await new PlayerHandler(authConfig, serviceConfig).setMarqueeUrl(options);
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  const advertCmd = playerCmd.command('advert').description('Manage player adverts');
  advertCmd.command('head-update')
    .description('Update player head advert')
    .requiredOption('-c, --channel-id <channelId>', 'channel ID')
    .requiredOption('--head-advert-type <type>', 'head advert type (NONE|IMAGE|FLV)', validateHeadAdvertType)
    .option('--head-advert-image <url>', 'head advert image URL')
    .option('--head-advert-flv <url>', 'head advert FLV URL')
    .option('--head-advert-href <url>', 'head advert click URL')
    .option('--head-advert-duration <seconds>', 'duration seconds', parsePositiveInteger)
    .option('--head-advert-width <width>', 'advert width', parsePositiveInteger)
    .option('--head-advert-height <height>', 'advert height', parsePositiveInteger)
    .option('--enabled <value>', 'enabled (Y|N)', validateYNValue)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(program.opts());
        await new PlayerHandler(authConfig, serviceConfig).updateHeadAdvert(options);
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  advertCmd.command('stop-update')
    .description('Update player stop advert')
    .requiredOption('-c, --channel-id <channelId>', 'channel ID')
    .option('--enabled <value>', 'enabled (Y|N)', validateYNValue)
    .option('--stop-advert-image <url>', 'stop advert image URL')
    .option('--stop-advert-href <url>', 'stop advert click URL')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(program.opts());
        await new PlayerHandler(authConfig, serviceConfig).updateStopAdvert(options);
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  playerCmd.command('logo-update')
    .description('Update player logo settings')
    .requiredOption('-c, --channel-id <channelId>', 'channel ID')
    .requiredOption('--logo-image <url>', 'logo image URL')
    .option('--logo-opacity <opacity>', 'logo opacity', parseNonNegativeNumber)
    .option('--logo-position <position>', 'logo position (tl|tr|bl|br)', validateWatermarkPosition)
    .option('--logo-href <url>', 'logo click URL')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(program.opts());
        await new PlayerHandler(authConfig, serviceConfig).updateLogo(options);
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  playerCmd.command('watch-feedback-list')
    .description('List watch feedback records')
    .option('-c, --channel-id <channelId>', 'channel ID')
    .option('--page-number <page>', 'page number', parsePositiveInteger)
    .option('--page-size <size>', 'page size', parsePositiveInteger)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(program.opts());
        await new PlayerHandler(authConfig, serviceConfig).listWatchFeedback(options);
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });
}
