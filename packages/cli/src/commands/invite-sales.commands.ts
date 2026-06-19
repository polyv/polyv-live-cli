import { Command } from 'commander';
import { InviteSalesHandler } from '../handlers/invite-sales.handler';
import { logError } from '../utils/errors';
import {
  commandParentOptions,
  loadApiCommandConfig,
  parsePositiveInteger,
  validateOutputFormat,
} from '../utils/api-command';

function withInviteSalesHandler(program: Command, run: (handler: InviteSalesHandler) => Promise<void>): Promise<void> {
  return (async () => {
    try {
      const { authConfig, serviceConfig } = await loadApiCommandConfig(commandParentOptions(program));
      await run(new InviteSalesHandler(authConfig, serviceConfig));
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)));
      process.exit(1);
    }
  })();
}

function addPaging(command: Command): Command {
  return command
    .option('--page <page>', 'page number', parsePositiveInteger)
    .option('--page-size <size>', 'page size', parsePositiveInteger)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table');
}

export function registerInviteSalesCommands(program: Command): void {
  const inviteSalesCmd = program.command('invite-sales').description('Manage user invite sales');

  addPaging(inviteSalesCmd.command('list').description('List invite sales'))
    .option('--viewer-union-id <id>', 'invite sale viewer union ID')
    .option('--mobile <mobile>', 'mobile phone number')
    .option('-k, --keyword <keyword>', 'nickname keyword')
    .option('--organization-id <id>', 'organization ID', parsePositiveInteger)
    .action((options) => withInviteSalesHandler(program, handler => handler.list(options)));

  inviteSalesCmd.command('add')
    .description('Add invite sales')
    .requiredOption('--viewer-union-ids <ids>', 'comma-separated viewer union IDs, max 200')
    .option('--organization-id <id>', 'organization ID', parsePositiveInteger)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withInviteSalesHandler(program, handler => handler.add(options)));

  inviteSalesCmd.command('update')
    .description('Update invite sales organization')
    .requiredOption('--viewer-union-ids <ids>', 'comma-separated viewer union IDs, max 200')
    .requiredOption('--organization-id <id>', 'organization ID', parsePositiveInteger)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withInviteSalesHandler(program, handler => handler.update(options)));

  inviteSalesCmd.command('remove')
    .description('Remove invite sales')
    .requiredOption('--viewer-union-ids <ids>', 'comma-separated viewer union IDs, max 100')
    .option('--new-viewer-union-id <id>', 'new invite sale ID to receive followed viewers')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withInviteSalesHandler(program, handler => handler.remove(options)));

  const followViewerCmd = inviteSalesCmd.command('follow-viewer').description('Manage invite sales follow viewers');

  addPaging(followViewerCmd.command('list').description('List invite sales follow viewers'))
    .option('--invite-customer-id <id>', 'invite sale user ID')
    .option('--invite-customer-nickname <keyword>', 'invite sale nickname keyword')
    .option('--viewer-id <id>', 'viewer ID')
    .option('--username <keyword>', 'viewer nickname keyword')
    .option('--telephone <telephone>', 'viewer telephone')
    .option('--follow-status-list <statuses>', 'comma-separated follow statuses, e.g. 0,1')
    .action((options) => withInviteSalesHandler(program, handler => handler.listFollowViewers(options)));
}
