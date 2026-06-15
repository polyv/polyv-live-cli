/**
 * @fileoverview Coupon command definitions for CLI
 * @author Development Team
 * @since 8.1.0
 */

import { Command } from 'commander';

// ========================================
// Constants
// ========================================

/** Maximum length for coupon name */
const COUPON_NAME_MAX_LENGTH = 50;

/** Maximum number of coupon IDs for batch deletion */
const BATCH_DELETE_MAX_IDS = 200;

/** Maximum page size for list queries */
const PAGE_SIZE_MAX = 1000;

/** Default timeout in milliseconds */
const DEFAULT_TIMEOUT_MS = 30000;
import { CouponHandler, CouponAddOptions, CouponListOptions, CouponDeleteOptions } from '../handlers/coupon.handler';
import { configManager } from '../config/manager';
import { authAdapter } from '../config/auth-adapter';
import { logError } from '../utils/errors';
import { AuthConfig } from '../types/auth';

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
 * Parse integer string to number with validation
 * Uses regex to ensure the entire string is a valid integer (not partial parsing)
 * @param value String value to parse
 * @returns Parsed integer
 * @throws Error if value is not a valid integer
 */
export function parseInteger(value: string): number {
  // Use regex to ensure entire string is numeric (handles "123abc" case)
  if (!/^-?\d+$/.test(value)) {
    throw new Error(`"${value}" is not a valid integer`);
  }
  const parsed = parseInt(value, 10);
  // Check for safe integer range
  if (!Number.isSafeInteger(parsed)) {
    throw new Error(`"${value}" is outside safe integer range`);
  }
  return parsed;
}

/**
 * Validate coupon type
 * @param value Coupon type string
 * @returns Validated coupon type
 * @throws Error if type is invalid
 */
export function validateCouponType(value: string): 'MAX_OUT' | 'DISCOUNT' {
  if (!['MAX_OUT', 'DISCOUNT'].includes(value)) {
    throw new Error('Invalid coupon type. Must be MAX_OUT or DISCOUNT');
  }
  return value as 'MAX_OUT' | 'DISCOUNT';
}

/**
 * Validate coupon status
 * @param value Coupon status string
 * @returns Validated coupon status
 * @throws Error if status is invalid
 */
export function validateCouponStatus(value: string): 'NOT_START' | 'GOING' | 'FINISHED' | 'INVALID' {
  const validStatuses = ['NOT_START', 'GOING', 'FINISHED', 'INVALID'];
  if (!validStatuses.includes(value)) {
    throw new Error(`Invalid coupon status. Must be one of: ${validStatuses.join(', ')}`);
  }
  return value as 'NOT_START' | 'GOING' | 'FINISHED' | 'INVALID';
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
 * Validate page size limit
 * @param value String value to validate
 * @returns Parsed and validated limit
 * @throws Error if value is out of range
 */
export function validateSize(value: string): number {
  const parsed = parseInteger(value);
  if (parsed < 1 || parsed > PAGE_SIZE_MAX) {
    throw new Error(`Size must be between 1 and ${PAGE_SIZE_MAX}`);
  }
  return parsed;
}

/**
 * Registers coupon-related commands with the CLI program
 * @param program Commander.js program instance
 */
export function registerCouponCommands(program: Command): void {
  // Create coupon command group
  const couponCmd = program.command('coupon');
  couponCmd.description('Manage coupons');

  // ========================================
  // coupon add - 创建优惠券
  // ========================================
  const addCmd = couponCmd
    .command('add')
    .description('Create a new coupon (满减券 or 折扣券)')
    .requiredOption('--name <name>', `coupon name (max ${COUPON_NAME_MAX_LENGTH} characters)`)
    .requiredOption('--type <type>', 'coupon type (MAX_OUT | DISCOUNT)', validateCouponType)
    .requiredOption('--availableAmount <number>', 'issue quantity (>= 0)', parseInteger)
    .requiredOption('--receiveStart <timestamp>', 'receive start time (13-bit ms timestamp)', parseInteger)
    .requiredOption('--receiveEnd <timestamp>', 'receive end time (13-bit ms timestamp)', parseInteger)
    .requiredOption('--useTimeType <type>', 'use time type (RANGE | DAY)')
    .option('--useStart <timestamp>', 'use start time (required when useTimeType=RANGE)', parseInteger)
    .option('--useEnd <timestamp>', 'use end time (required when useTimeType=RANGE)', parseInteger)
    .option('--dayOfUse <days>', 'days available (required when useTimeType=DAY)', parseInteger)
    .requiredOption('--condition <type>', 'rule condition (UNCONDITIONAL | FULL_REDUCE)')
    .option('--discount <value>', 'discount value for UNCONDITIONAL rule', parseInteger)
    .option('--full <amount>', 'minimum spend for FULL_REDUCE rule', parseInteger)
    .option('--reduce <amount>', 'discount amount for FULL_REDUCE rule', parseInteger)
    .requiredOption('--limitPerPerson <number>', 'max claims per person (-1 for unlimited)', parseInteger)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        // Load authentication and service configuration
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        // Create coupon handler instance
        const couponHandler = new CouponHandler(authConfig, serviceConfig);

        // Transform commander options to handler options
        const addOptions: CouponAddOptions = {
          name: options.name,
          type: options.type,
          availableAmount: options.availableAmount,
          receiveStart: options.receiveStart,
          receiveEnd: options.receiveEnd,
          useTimeType: options.useTimeType,
          useStart: options.useStart,
          useEnd: options.useEnd,
          dayOfUse: options.dayOfUse,
          condition: options.condition,
          discount: options.discount,
          full: options.full,
          reduce: options.reduce,
          limitPerPerson: options.limitPerPerson,
          output: options.output,
        };

        // Execute coupon creation
        await couponHandler.addCoupon(addOptions);
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Add help text for coupon add command
  addCmd.addHelpText('after', `
Examples:
  # Create a MAX_OUT coupon (满减券) with FULL_REDUCE condition
  $ polyv-live-cli coupon add --name "满100减20" --type MAX_OUT --availableAmount 100 \\
      --receiveStart 1704067200000 --receiveEnd 1704153600000 \\
      --useTimeType RANGE --useStart 1704067200000 --useEnd 1704758400000 \\
      --condition FULL_REDUCE --full 100 --reduce 20 --limitPerPerson 1

  # Create a DISCOUNT coupon (折扣券) with UNCONDITIONAL condition
  $ polyv-live-cli coupon add --name "8折优惠券" --type DISCOUNT --availableAmount 200 \\
      --receiveStart 1704067200000 --receiveEnd 1704153600000 \\
      --useTimeType DAY --dayOfUse 7 \\
      --condition UNCONDITIONAL --discount 80 --limitPerPerson 1

Coupon Types:
  MAX_OUT    - Fixed amount discount (满减券)
  DISCOUNT   - Percentage discount (折扣券)

Use Time Types:
  RANGE      - Specific time range (requires --useStart and --useEnd)
  DAY        - Days after receive (requires --dayOfUse)

Rule Conditions:
  UNCONDITIONAL - No minimum spend required (use --discount)
  FULL_REDUCE   - Minimum spend required (use --full and --reduce)
`);

  // ========================================
  // coupon list - 查询优惠券列表
  // ========================================
  const listCmd = couponCmd
    .command('list')
    .description('List coupons with pagination and status filter')
    .option('-p, --page <number>', 'page number (minimum 1)', parseInteger, 1)
    .option('-s, --size <number>', 'items per page (1-1000)', validateSize, 10)
    .option('--status <status>', 'filter by status (NOT_START|GOING|FINISHED|INVALID)', validateCouponStatus)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        // Load authentication and service configuration
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        // Create coupon handler instance
        const couponHandler = new CouponHandler(authConfig, serviceConfig);

        // Transform commander options to handler options
        const listOptions: CouponListOptions = {
          page: options.page,
          size: options.size,
          status: options.status,
          output: options.output,
        };

        // Execute coupon listing
        await couponHandler.listCoupons(listOptions);
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Add help text for coupon list command
  listCmd.addHelpText('after', `
Examples:
  $ polyv-live-cli coupon list
  $ polyv-live-cli coupon list -p 2 -s 20
  $ polyv-live-cli coupon list --status GOING
  $ polyv-live-cli coupon list -o json

Pagination:
  --page, -p    Page number (minimum 1, default 1)
  --size, -s    Items per page (1-1000, default 10)

Status Filters:
  NOT_START  - Coupons not yet started
  GOING      - Active coupons
  FINISHED   - Finished coupons
  INVALID    - Invalid/disabled coupons

Output Formats:
  table  - Formatted table output (default)
  json   - JSON format for programmatic use
`);

  // ========================================
  // coupon delete - 批量删除优惠券
  // ========================================
  const deleteCmd = couponCmd
    .command('delete')
    .description(`Delete coupons in batch (max ${BATCH_DELETE_MAX_IDS} IDs)`)
    .requiredOption('--couponIds <ids...>', `coupon IDs to delete (max ${BATCH_DELETE_MAX_IDS})`, (value: string, previous: string[] = []) => {
      return previous.concat([value]);
    })
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        // Validate max IDs limit
        if (options.couponIds.length > BATCH_DELETE_MAX_IDS) {
          throw new Error(`Maximum ${BATCH_DELETE_MAX_IDS} coupon IDs allowed for batch delete`);
        }

        // Load authentication and service configuration
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        // Create coupon handler instance
        const couponHandler = new CouponHandler(authConfig, serviceConfig);

        // Transform commander options to handler options
        const deleteOptions: CouponDeleteOptions = {
          couponIds: options.couponIds,
          output: options.output,
        };

        // Execute coupon deletion
        await couponHandler.deleteCoupons(deleteOptions);
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Add help text for coupon delete command
  deleteCmd.addHelpText('after', `
Examples:
  # Delete single coupon
  $ polyv-live-cli coupon delete --couponIds coupon001

  # Delete multiple coupons
  $ polyv-live-cli coupon delete --couponIds coupon001 coupon002 coupon003

Notes:
  - Maximum ${BATCH_DELETE_MAX_IDS} coupon IDs can be deleted in one batch
  - Deletion is permanent and cannot be undone
`);
}
