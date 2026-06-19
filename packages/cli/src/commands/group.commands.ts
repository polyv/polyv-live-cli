import { Command } from 'commander';
import { GroupHandler } from '../handlers/group.handler';
import { logError } from '../utils/errors';
import {
  commandParentOptions,
  loadApiCommandConfig,
  parseNonNegativeNumber,
  parsePositiveInteger,
  parseTimestamp,
  validateOutputFormat,
} from '../utils/api-command';

function withGroupHandler(program: Command, run: (handler: GroupHandler) => Promise<void>): Promise<void> {
  return (async () => {
    try {
      const { authConfig, serviceConfig } = await loadApiCommandConfig(commandParentOptions(program));
      await run(new GroupHandler(authConfig, serviceConfig));
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)));
      process.exit(1);
    }
  })();
}

function addPaging(command: Command): Command {
  return command
    .option('--page <page>', 'page number', parsePositiveInteger)
    .option('--page-number <pageNumber>', 'page number', parsePositiveInteger)
    .option('--page-size <size>', 'page size', parsePositiveInteger)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table');
}

export function registerGroupCommands(program: Command): void {
  const groupCmd = program.command('group').description('Manage group account resources');

  addPaging(groupCmd.command('allocate-log').description('List legacy group allocation logs'))
    .requiredOption('--emails <emails>', 'sub-account emails, comma-separated')
    .option('--type <type>', 'log type (all|live|vod)')
    .option('--start-time <time>', 'start time, yyyy-MM-dd HH:mm:ss')
    .option('--end-time <time>', 'end time, yyyy-MM-dd HH:mm:ss')
    .action((options) => withGroupHandler(program, handler => handler.listAllocateLog(options)));

  const resourceCmd = groupCmd.command('resource').description('Legacy resource allocation APIs');

  resourceCmd.command('set-concurrences')
    .description('Allocate or recover live concurrences')
    .requiredOption('--email <email>', 'sub-account email')
    .requiredOption('--concurrences <count>', 'concurrency count', parsePositiveInteger)
    .option('--type <type>', 'allocation type (add|recover)')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withGroupHandler(program, handler => handler.setConcurrences(options)));

  resourceCmd.command('set-flow')
    .description('Allocate or recover VOD flow')
    .requiredOption('--email <email>', 'sub-account email')
    .option('--type <type>', 'allocation type (add|recover)')
    .option('--all', 'recover all flow')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withGroupHandler(program, handler => handler.setFlow({
      ...options,
      all: options.all ? 1 : undefined,
    })));

  resourceCmd.command('set-live-durations')
    .description('Allocate or recover live durations')
    .requiredOption('--email <email>', 'sub-account email')
    .requiredOption('--duration <minutes>', 'duration minutes', parsePositiveInteger)
    .option('--type <type>', 'allocation type (add|recover)')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withGroupHandler(program, handler => handler.setLiveDurations(options)));

  resourceCmd.command('set-space')
    .description('Allocate or recover VOD space')
    .requiredOption('--email <email>', 'sub-account email')
    .option('--space <gb>', 'space in GB', parsePositiveInteger)
    .option('--type <type>', 'allocation type (add|recover)')
    .option('--all', 'recover all space')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withGroupHandler(program, handler => handler.setSpace({
      ...options,
      all: options.all ? 1 : undefined,
    })));

  const userCmd = groupCmd.command('user').description('Group sub-account APIs');

  userCmd.command('create')
    .description('Create a group sub-account')
    .requiredOption('--email <email>', 'sub-account email')
    .requiredOption('--password <password>', 'password')
    .requiredOption('--contacts <contacts>', 'contact name')
    .requiredOption('--phone <phone>', 'phone number')
    .requiredOption('--max-channels <count>', 'max channels', parsePositiveInteger)
    .option('--minutes <minutes>', 'initial live minutes', parsePositiveInteger)
    .option('--concurrent <count>', 'initial concurrences', parsePositiveInteger)
    .option('--link-mic-minutes <minutes>', 'link mic minutes', parsePositiveInteger)
    .option('--guide-minutes <minutes>', 'guide minutes', parsePositiveInteger)
    .option('--link-mic-limit <count>', 'link mic limit', parsePositiveInteger)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withGroupHandler(program, handler => handler.createUser(options)));

  addPaging(userCmd.command('package-list').description('List group sub-account packages'))
    .option('--emails <emails>', 'sub-account emails, comma-separated')
    .action((options) => withGroupHandler(program, handler => handler.listUserPackages(options)));

  userCmd.command('package-update')
    .description('Update group sub-account package')
    .requiredOption('--email <email>', 'sub-account email')
    .option('--balance <amount>', 'balance amount', parseNonNegativeNumber)
    .option('--concurrent <count>', 'concurrences', parsePositiveInteger)
    .option('--minutes <minutes>', 'live minutes', parsePositiveInteger)
    .option('--link-mic-minutes <minutes>', 'link mic minutes', parsePositiveInteger)
    .option('--guide-minutes <minutes>', 'guide minutes', parsePositiveInteger)
    .option('--link-mic-limit <count>', 'link mic limit', parsePositiveInteger)
    .option('--flow <gb>', 'VOD flow in GB', parsePositiveInteger)
    .option('--space <gb>', 'VOD space in GB', parsePositiveInteger)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withGroupHandler(program, handler => handler.updateUserPackage(options)));

  addPaging(userCmd.command('billing-daily').description('List group sub-account daily billing'))
    .requiredOption('--start-date <yyyyMM>', 'start billing period, yyyyMM')
    .requiredOption('--end-date <yyyyMM>', 'end billing period, yyyyMM')
    .option('--email <email>', 'sub-account email')
    .action((options) => withGroupHandler(program, handler => handler.listUserBillingDaily(options)));

  addPaging(groupCmd.command('billing-daily').description('List group account daily billing'))
    .requiredOption('--billing-date <yyyyMM>', 'billing period, yyyyMM')
    .action((options) => withGroupHandler(program, handler => handler.listBillingDaily(options)));

  addPaging(userCmd.command('allocation-log').description('List group user allocation logs'))
    .requiredOption('--emails <emails>', 'sub-account emails, comma-separated')
    .option('--deposit-start-time <timestamp>', 'deposit start timestamp', parseTimestamp)
    .option('--deposit-end-time <timestamp>', 'deposit end timestamp', parseTimestamp)
    .option('--resource-code <code>', 'resource code')
    .option('--alteration-type <type>', 'alteration type')
    .action((options) => withGroupHandler(program, handler => handler.listAllocationLogs(options)));

  groupCmd.command('health-check')
    .description('Check group backend health')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withGroupHandler(program, handler => handler.healthCheck(options)));

  userCmd.command('isolation-create')
    .description('Create isolated group sub-account')
    .requiredOption('--email <email>', 'sub-account email')
    .requiredOption('--password <password>', 'password')
    .option('--contacts <contacts>', 'contact name')
    .option('--phone <phone>', 'phone number')
    .option('--max-channels <count>', 'max channels', parsePositiveInteger)
    .option('--minutes <minutes>', 'live minutes', parsePositiveInteger)
    .option('--concurrent <count>', 'concurrences', parsePositiveInteger)
    .option('--balance <amount>', 'balance amount', parseNonNegativeNumber)
    .option('--memo <memo>', 'memo')
    .option('--expire-type <type>', 'expire type (group|custom)')
    .option('--expire-date <date>', 'expire date, yyyyMMdd')
    .option('--remain-flow <gb>', 'VOD flow in GB', parsePositiveInteger)
    .option('--remain-space <gb>', 'VOD space in GB', parsePositiveInteger)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withGroupHandler(program, handler => handler.createIsolation(options)));

  addPaging(userCmd.command('package-validity-list').description('List group user remaining package validity'))
    .option('--emails <emails>', 'sub-account emails, comma-separated')
    .action((options) => withGroupHandler(program, handler => handler.listPackageValidity(options)));

  userCmd.command('package-validity-update')
    .description('Update group user package validity')
    .requiredOption('--email <email>', 'sub-account email')
    .option('--balance <amount>', 'balance amount', parseNonNegativeNumber)
    .option('--concurrent <count>', 'concurrences', parsePositiveInteger)
    .option('--concurrent-activate-date <timestamp>', 'concurrent activate date', parseTimestamp)
    .option('--concurrent-end-date <timestamp>', 'concurrent end date', parseTimestamp)
    .option('--minutes <minutes>', 'live minutes', parsePositiveInteger)
    .option('--minutes-activate-date <timestamp>', 'minutes activate date', parseTimestamp)
    .option('--minutes-end-date <timestamp>', 'minutes end date', parseTimestamp)
    .option('--remain-flow <gb>', 'VOD flow in GB', parsePositiveInteger)
    .option('--remain-flow-activate-date <timestamp>', 'flow activate date', parseTimestamp)
    .option('--remain-flow-end-date <timestamp>', 'flow end date', parseTimestamp)
    .option('--remain-space <gb>', 'VOD space in GB', parsePositiveInteger)
    .option('--remain-space-activate-date <timestamp>', 'space activate date', parseTimestamp)
    .option('--remain-space-end-date <timestamp>', 'space end date', parseTimestamp)
    .option('--link-mic-limit <count>', 'link mic limit', parsePositiveInteger)
    .option('--link-mic-minutes <minutes>', 'link mic minutes', parsePositiveInteger)
    .option('--guide-minutes <minutes>', 'guide minutes', parsePositiveInteger)
    .option('--max-channels <count>', 'max channels', parsePositiveInteger)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withGroupHandler(program, handler => handler.updatePackageValidity(options)));

  userCmd.command('secret-reset')
    .description('Reset group sub-account app secret')
    .requiredOption('--email <email>', 'sub-account email')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withGroupHandler(program, handler => handler.resetAppSecret(options)));
}
