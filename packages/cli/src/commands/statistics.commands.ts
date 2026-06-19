/**
 * @fileoverview Statistics command definitions for CLI
 * @author Development Team
 * @since 10.1.0
 */

import { Command } from 'commander';
import { StatisticsHandler } from '../handlers/statistics.handler';
import {
  StatisticsServiceConfig,
  StatisticsViewOptions,
  StatisticsConcurrencyOptions,
  StatisticsMaxConcurrentOptions,
  StatisticsAudienceRegionOptions,
  StatisticsAudienceDeviceOptions,
} from '../types/statistics';
import { configManager } from '../config/manager';
import { authAdapter } from '../config/auth-adapter';
import { logError } from '../utils/errors';
import { AuthConfig } from '../types/auth';
import {
  validateDateRange as validateDateRangeUtil,
  validateTimestampRange as validateTimestampRangeUtil,
  validate90DayTimestampRange as validate90DayTimestampRangeUtil,
} from '../utils/date-validation';

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
    console.log(`🔐 Authentication Source: ${authResult.source}`);
    if (authResult.accountName) {
      console.log(`👤 Account: ${authResult.accountName}`);
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
 * Validate date format (yyyy-MM-dd)
 * @param value Date string
 * @returns Validated date string
 * @throws Error if format is invalid
 */
export function validateDateFormat(value: string): string {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(value)) {
    throw new Error('Date format must be yyyy-MM-dd');
  }

  // Check if it's a valid date
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${value}`);
  }

  // Check if the parsed date matches the input
  const [year, month, day] = value.split('-').map(Number);
  if (
    date.getFullYear() !== year ||
    date.getMonth() + 1 !== month ||
    date.getDate() !== day
  ) {
    throw new Error(`Invalid date: ${value}`);
  }

  return value;
}

/**
 * Validate date range does not exceed 60 days and startDay is before endDay
 * @param startDay Start date string (yyyy-MM-dd)
 * @param endDay End date string (yyyy-MM-dd)
 * @throws Error if range is invalid
 */
export function validateDateRange(startDay: string, endDay: string): void {
  const result = validateDateRangeUtil(startDay, endDay);
  if (!result.valid) {
    throw new Error(result.error || 'Invalid date range');
  }
}

/**
 * Registers statistics-related commands with the CLI program
 * @param program Commander.js program instance
 */
export function registerStatisticsCommands(program: Command): void {
  // Create statistics command group
  const statisticsCmd = program.command('statistics');
  statisticsCmd.description('View live streaming statistics data');

  statisticsCmd.command('session-summary-list')
    .description('List V4 session statistics summaries')
    .option('-c, --channel-id <channelId>', 'channel ID')
    .option('--keyword <keyword>', 'keyword')
    .option('--start-time <timestamp>', 'start timestamp', parseInt)
    .option('--end-time <timestamp>', 'end timestamp', parseInt)
    .option('--page-number <page>', 'page number', parseInt)
    .option('--page-size <size>', 'page size', parseInt)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);
        await new StatisticsHandler(authConfig, serviceConfig).listSessionSummary(options);
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  statisticsCmd.command('inviter-poster-list')
    .description('List inviter poster statistics')
    .requiredOption('-c, --channel-id <channelId>', 'channel ID')
    .option('--page-number <page>', 'page number', parseInt)
    .option('--page-size <size>', 'page size', parseInt)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);
        await new StatisticsHandler(authConfig, serviceConfig).listInviterPoster(options);
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Statistics view command
  const viewCmd = statisticsCmd
    .command('view')
    .description('View daily statistics for a channel')
    .requiredOption('-c, --channel-id <channelId>', 'channel ID')
    .requiredOption('--start-day <date>', 'start date (yyyy-MM-dd)', validateDateFormat)
    .requiredOption('--end-day <date>', 'end date (yyyy-MM-dd)', validateDateFormat)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        // Validate date range before making any API calls
        validateDateRange(options.startDay, options.endDay);

        // Load authentication and service configuration
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        // Create statistics handler instance
        const statisticsHandler = new StatisticsHandler(authConfig, serviceConfig);

        // Transform commander options to handler options
        const viewOptions: StatisticsViewOptions = {
          channelId: options.channelId,
          startDay: options.startDay,
          endDay: options.endDay,
          output: options.output
        };

        // Execute statistics view
        await statisticsHandler.viewStatistics(viewOptions);

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

  // Add help text for statistics view command
  viewCmd.addHelpText('after', `
Examples:
  # View daily statistics for a channel
  $ polyv-live-cli statistics view -c "3151318" --start-day "2024-01-01" --end-day "2024-01-31"

  # Output in JSON format
  $ polyv-live-cli statistics view -c "3151318" --start-day "2024-01-01" --end-day "2024-01-31" -o json

  # With full parameter names
  $ polyv-live-cli statistics view --channel-id "3151318" --start-day "2024-01-01" --end-day "2024-01-31" --output table

Date Range:
  --start-day    Start date in yyyy-MM-dd format (required)
  --end-day      End date in yyyy-MM-dd format (required)
                 Note: Date range cannot exceed 60 days

Output Formats:
  table          Formatted table output (default)
  json           JSON format for programmatic use

Notes:
  - Channel ID is required for all statistics queries
  - Date range cannot exceed 60 days
  - Statistics include PC and mobile view data
`);

  // ============================================
  // Story 10.2: Concurrency Commands
  // ============================================

  // Statistics concurrency command
  const concurrencyCmd = statisticsCmd
    .command('concurrency')
    .description('查看历史并发数据')
    .requiredOption('-c, --channel-id <channelId>', '频道ID')
    .requiredOption('--start-date <date>', '开始日期 (yyyy-MM-dd)', validateDateFormat)
    .requiredOption('--end-date <date>', '结束日期 (yyyy-MM-dd)', validateDateFormat)
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        // Validate date range before making any API calls
        validateDateRange(options.startDate, options.endDate);

        // Load authentication and service configuration
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        // Create statistics handler instance
        const statisticsHandler = new StatisticsHandler(authConfig, serviceConfig);

        // Transform commander options to handler options
        const concurrencyOptions: StatisticsConcurrencyOptions = {
          channelId: options.channelId,
          startDate: options.startDate,
          endDate: options.endDate,
          output: options.output
        };

        // Execute statistics concurrency view
        await statisticsHandler.viewConcurrency(concurrencyOptions);

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

  // Add help text for concurrency command
  concurrencyCmd.addHelpText('after', `
Examples:
  # View historical concurrency data
  $ polyv-live-cli statistics concurrency -c "3151318" --start-date "2024-01-01" --end-date "2024-01-31"

  # Output in JSON format
  $ polyv-live-cli statistics concurrency -c "3151318" --start-date "2024-01-01" --end-date "2024-01-31" -o json

Date Range:
  --start-date    Start date in yyyy-MM-dd format (required)
  --end-date      End date in yyyy-MM-dd format (required)
                 Note: Date range cannot exceed 60 days

Output Formats:
  table          Formatted table output (default)
  json           JSON format for programmatic use
`);

  // Statistics max-concurrent command
  const maxConcurrentCmd = statisticsCmd
    .command('max-concurrent')
    .description('查看历史最高并发人数')
    .requiredOption('-c, --channel-id <channelId>', '频道ID')
    .requiredOption('--start-time <timestamp>', '开始时间戳 (13位毫秒)', parseInt)
    .requiredOption('--end-time <timestamp>', '结束时间戳 (13位毫秒)', parseInt)
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        // Validate timestamp range
        const rangeValidation = validateTimestampRangeUtil(options.startTime, options.endTime);
        if (!rangeValidation.valid) {
          throw new Error(rangeValidation.error || 'Invalid time range');
        }

        // Load authentication and service configuration
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        // Create statistics handler instance
        const statisticsHandler = new StatisticsHandler(authConfig, serviceConfig);

        // Transform commander options to handler options
        const maxConcurrentOptions: StatisticsMaxConcurrentOptions = {
          channelId: options.channelId,
          startTime: options.startTime,
          endTime: options.endTime,
          output: options.output
        };

        // Execute statistics max-concurrent view
        await statisticsHandler.viewMaxConcurrent(maxConcurrentOptions);

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

  // Add help text for max-concurrent command
  maxConcurrentCmd.addHelpText('after', `
Examples:
  # View maximum historical concurrent viewers
  $ polyv-live-cli statistics max-concurrent -c "3151318" --start-time 1704067200000 --end-time 1735689600000

  # Output in JSON format
  $ polyv-live-cli statistics max-concurrent -c "3151318" --start-time 1704067200000 --end-time 1735689600000 -o json

Timestamp Range:
  --start-time    Start timestamp in 13-digit milliseconds (required)
  --end-time      End timestamp in 13-digit milliseconds (required)
                 Note: Time range cannot exceed 3 months

Output Formats:
  table          Formatted output (default)
  json           JSON format for programmatic use
`);

  // ============================================
  // Story 10.3: Audience Commands
  // ============================================

  // Create audience command group
  const audienceCmd = statisticsCmd.command('audience');
  audienceCmd.description('View audience statistics');

  // Statistics audience region command
  const regionCmd = audienceCmd
    .command('region')
    .description('View audience region distribution')
    .requiredOption('-c, --channel-id <channelId>', '频道ID')
    .requiredOption('--start-time <timestamp>', '开始时间戳 (13位毫秒)', parseInt)
    .requiredOption('--end-time <timestamp>', '结束时间戳 (13位毫秒)', parseInt)
    .option('-t, --type <type>', '地域类型 (country/province/city)', 'province')
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        // Validate timestamp range (90 days max)
        const rangeValidation = validate90DayTimestampRangeUtil(options.startTime, options.endTime);
        if (!rangeValidation.valid) {
          throw new Error(rangeValidation.error || 'Invalid time range');
        }

        // Load authentication and service configuration
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        // Create statistics handler instance
        const statisticsHandler = new StatisticsHandler(authConfig, serviceConfig);

        // Transform commander options to handler options
        const regionOptions: StatisticsAudienceRegionOptions = {
          channelId: options.channelId,
          startTime: options.startTime,
          endTime: options.endTime,
          type: options.type,
          output: options.output
        };

        // Execute statistics audience region view
        await statisticsHandler.viewRegionDistribution(regionOptions);

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

  // Add help text for region command
  regionCmd.addHelpText('after', `
Examples:
  # View region distribution
  $ polyv-live-cli statistics audience region -c "3151318" --start-time 1648742400000 --end-time 1651334399000

  # With city type
  $ polyv-live-cli statistics audience region -c "3151318" --start-time 1648742400000 --end-time 1651334399000 --type city

  # Output in JSON format
  $ polyv-live-cli statistics audience region -c "3151318" --start-time 1648742400000 --end-time 1651334399000 -o json

Timestamp Range:
  --start-time    Start timestamp in 13-digit milliseconds (required)
  --end-time      End timestamp in 13-digit milliseconds (required)
                 Note: Time range cannot exceed 90 days

Region Types:
  --type    Region type (default: province)
                 country: View by country
                 province: View by province (default)
                 city: View by city

Output Formats:
  table          Formatted table output (default)
  json           JSON format for programmatic use
`);

  // Statistics audience device command
  const deviceCmd = audienceCmd
    .command('device')
    .description('View audience device distribution')
    .requiredOption('-c, --channel-id <channelId>', '频道ID')
    .requiredOption('--start-time <timestamp>', '开始时间戳 (13位毫秒)', parseInt)
    .requiredOption('--end-time <timestamp>', '结束时间戳 (13位毫秒)', parseInt)
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        // Validate timestamp range (90 days max)
        const rangeValidation = validate90DayTimestampRangeUtil(options.startTime, options.endTime);
        if (!rangeValidation.valid) {
          throw new Error(rangeValidation.error || 'Invalid time range');
        }

        // Load authentication and service configuration
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        // Create statistics handler instance
        const statisticsHandler = new StatisticsHandler(authConfig, serviceConfig);

        // Transform commander options to handler options
        const deviceOptions: StatisticsAudienceDeviceOptions = {
          channelId: options.channelId,
          startTime: options.startTime,
          endTime: options.endTime,
          output: options.output
        };

        // Execute statistics audience device view
        await statisticsHandler.viewDeviceDistribution(deviceOptions);

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

  // Add help text for device command
  deviceCmd.addHelpText('after', `
Examples:
  # View device distribution
  $ polyv-live-cli statistics audience device -c "3151318" --start-time 1651386101000 --end-time 1652336501462

  # Output in JSON format
  $ polyv-live-cli statistics audience device -c "3151318" --start-time 1651386101000 --end-time 1652336501462 -o json

Timestamp Range:
  --start-time    Start timestamp in 13-digit milliseconds (required)
  --end-time      End timestamp in 13-digit milliseconds (required)
                 Note: Time range cannot exceed 90 days

Output Formats:
  table          Formatted table output (default)
  json           JSON format for programmatic use
`);
}
