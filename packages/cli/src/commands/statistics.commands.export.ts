/**
 * @fileoverview Statistics export command definitions for CLI
 * @author Development Team
 * @since 10.4.0
 */

import { Command } from 'commander';
import { StatisticsHandler } from '../handlers/statistics.handler';
import {
  StatisticsServiceConfig,
} from '../types/statistics';
import {
  StatisticsExportViewlogOptions,
  StatisticsExportSessionOptions,
} from '../types/statistics-export';
import { configManager } from '../config/manager';
import { authAdapter } from '../config/auth-adapter';
import { logError } from '../utils/errors';
import { AuthConfig } from '../types/auth';

/**
 * Load and prepare authentication and service configuration
 */
async function loadAuthAndServiceConfig(parentOptions: any): Promise<{
  authConfig: AuthConfig;
  serviceConfig: StatisticsServiceConfig;
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
  const serviceConfig: StatisticsServiceConfig = {
    baseUrl: configResult.config.baseUrl,
    timeout: configResult.config.timeout,
    debug: configResult.config.debug
  };

  // Display authentication source information if verbose
  const isVerbose = !!parentOptions.verbose;
  if (isVerbose) {
    console.log(`Authentication Source: ${authResult.source}`);
    if (authResult.accountName) {
      console.log(`Account: ${authResult.accountName}`);
    }
    console.log('');
  }

  const result: {
    authConfig: AuthConfig;
    serviceConfig: StatisticsServiceConfig;
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
 * Validate date time format (yyyy-MM-dd HH:mm:ss)
 * @param value Date time string
 * @returns Validated date time string
 * @throws Error if format is invalid
 */
export function validateDateTimeFormat(value: string): string {
  const regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
  if (!regex.test(value)) {
    throw new Error('DateTime format must be yyyy-MM-dd HH:mm:ss');
  }

  // Check if it's a valid date
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid datetime: ${value}`);
  }

  return value;
}

/**
 * Validate watch type
 * @param value Watch type string
 * @returns Validated watch type
 * @throws Error if type is invalid
 */
export function validateWatchType(value: string): 'live' | 'vod' {
  if (!['live', 'vod'].includes(value)) {
    throw new Error('watchType must be either "live" or "vod"');
  }
  return value as 'live' | 'vod';
}

/**
 * Validate that two date times are in the same month
 * @param startDate Start date time string
 * @param endDate End date time string
 * @throws Error if dates are not in the same month
 */
export function validateSameMonth(startDate: string, endDate: string): void {
  const startMonth = startDate.substring(0, 7); // "yyyy-MM"
  const endMonth = endDate.substring(0, 7);
  if (startMonth !== endMonth) {
    throw new Error('startDate and endDate must be in the same month');
  }
}

/**
 * Registers statistics export commands with the CLI program
 * @param program Commander.js program instance
 */
export function registerStatisticsExportCommands(program: Command): void {
  // Find the statistics command (should already be registered)
  const statisticsCmd = program.commands.find((cmd) => cmd.name() === 'statistics');
  if (!statisticsCmd) {
    // If statistics command doesn't exist, skip registration
    return;
  }

  // Create export command group under statistics
  const exportCmd = statisticsCmd.command('export');
  exportCmd.description('export statistics data');

  // ============================================
  // AC1: statistics export viewlog command
  // ============================================

  const viewlogCmd = exportCmd
    .command('viewlog')
    .description('Export channel viewlog (观看日志) data')
    .requiredOption('-c, --channel-id <channelId>', 'Channel ID')
    .requiredOption('--start-time <datetime>', 'Start time (yyyy-MM-dd HH:mm:ss)', validateDateTimeFormat)
    .requiredOption('--end-time <datetime>', 'End time (yyyy-MM-dd HH:mm:ss)', validateDateTimeFormat)
    .option('--watch-type <type>', 'Watch type filter (live or vod)', validateWatchType)
    .option('-o, --output <format>', 'Output format (table or json)', validateOutputFormat, 'table')
    .option('--output-file <path>', 'Output CSV file path for export')
    .action(async (options) => {
      try {
        // Validate same month constraint
        validateSameMonth(options.startTime, options.endTime);

        // Load authentication and service configuration
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        // Create statistics handler instance
        const statisticsHandler = new StatisticsHandler(authConfig, serviceConfig);

        // Transform commander options to handler options
        const viewlogOptions: StatisticsExportViewlogOptions = {
          channelId: options.channelId,
          startTime: options.startTime,
          endTime: options.endTime,
          output: options.output,
        };

        // Add optional parameters
        if (options.watchType) {
          viewlogOptions.watchType = options.watchType;
        }
        if (options.outputFile) {
          viewlogOptions.outputFile = options.outputFile;
        }

        // Execute export viewlog
        await statisticsHandler.exportViewlog(viewlogOptions);

      } catch (error) {
        // Enhanced error handling with authentication context
        if (error instanceof Error && error.message.includes('Authentication')) {
          const diagnostics = authAdapter.getDiagnostics(program.opts());
          console.error('\nAuthentication Diagnostics:');
          diagnostics.availableSources.forEach(source => {
            const status = source.appId && source.appSecret ? 'OK' : 'X';
            console.error(`  ${status} ${source.metadata.source}: ${source.type}`);
          });
          if (diagnostics.errors.length > 0) {
            console.error('\nErrors:');
            diagnostics.errors.forEach(err => console.error(`  - ${err}`));
          }
        }
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Add help text for viewlog command
  viewlogCmd.addHelpText('after', `
Examples:
  # Export viewlog data for a channel
  $ polyv-live-cli statistics export viewlog -c "3151318" --start-time "2024-01-01 00:00:00" --end-time "2024-01-31 23:59:59"

  # Export with watch type filter
  $ polyv-live-cli statistics export viewlog -c "3151318" --start-time "2024-01-01 00:00:00" --end-time "2024-01-31 23:59:59" --watch-type live

  # Export to CSV file
  $ polyv-live-cli statistics export viewlog -c "3151318" --start-time "2024-01-01 00:00:00" --end-time "2024-01-31 23:59:59" --output-file ./viewlog.csv

  # Output in JSON format
  $ polyv-live-cli statistics export viewlog -c "3151318" --start-time "2024-01-01 00:00:00" --end-time "2024-01-31 23:59:59" --output json

DateTime Format:
  --start-time    Start time in yyyy-MM-dd HH:mm:ss format (required)
  --end-time      End time in yyyy-MM-dd HH:mm:ss format (required)
                 Note: Start and end time must be in the same month

Watch Types:
  live            Live streaming
  vod             Video on demand (playback)

Output Formats:
  table           Formatted table output (default)
  json            JSON format for programmatic use

Output Options:
  --output-file   Path to save CSV file with Chinese headers
`);

  // ============================================
  // AC2: statistics export session command
  // ============================================

  const sessionCmd = exportCmd
    .command('session')
    .description('Export channel session statistics report - 场次报表 (returns download link)')
    .requiredOption('-c, --channel-id <channelId>', 'Channel ID')
    .requiredOption('--session-id <sessionId>', 'Session ID')
    .option('-o, --output <format>', 'Output format (table or json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        // Load authentication and service configuration
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        // Create statistics handler instance
        const statisticsHandler = new StatisticsHandler(authConfig, serviceConfig);

        // Transform commander options to handler options
        const sessionOptions: StatisticsExportSessionOptions = {
          channelId: options.channelId,
          sessionId: options.sessionId,
          output: options.output,
        };

        // Execute export session stats
        await statisticsHandler.exportSessionStats(sessionOptions);

      } catch (error) {
        // Enhanced error handling with authentication context
        if (error instanceof Error && error.message.includes('Authentication')) {
          const diagnostics = authAdapter.getDiagnostics(program.opts());
          console.error('\nAuthentication Diagnostics:');
          diagnostics.availableSources.forEach(source => {
            const status = source.appId && source.appSecret ? '[OK]' : '[FAIL]';
            console.error(`  ${status} ${source.metadata.source}: ${source.type}`);
          });
          if (diagnostics.errors.length > 0) {
            console.error('\nErrors:');
            diagnostics.errors.forEach(err => console.error(`  - ${err}`));
          }
        }
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Add help text for session command
  sessionCmd.addHelpText('after', `
Examples:
  # Export session statistics report
  $ polyv-live-cli statistics export session -c "3151318" --session-id "fv3ma84e63"

  # Output in JSON format
  $ polyv-live-cli statistics export session -c "3151318" --session-id "fv3ma84e63" --output json

Parameters:
  --channel-id    Channel ID (required)
  --session-id     Session ID (required)

Output Formats:
  table            Formatted table output (default)
  json             JSON format for programmatic use

Notes:
  - Returns a download URL for the session report
  - Download link is valid for 60 days
`);
}
