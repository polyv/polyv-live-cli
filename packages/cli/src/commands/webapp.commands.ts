import { Command } from 'commander';
import { WebAppHandler } from '../handlers/webapp.handler';
import { logError } from '../utils/errors';
import {
  commandParentOptions,
  loadApiCommandConfig,
  parseNumberList,
  parsePositiveInteger,
  validateOutputFormat,
} from '../utils/api-command';

function withWebAppHandler(program: Command, run: (handler: WebAppHandler) => Promise<void>): Promise<void> {
  return (async () => {
    try {
      const { authConfig, serviceConfig } = await loadApiCommandConfig(commandParentOptions(program));
      await run(new WebAppHandler(authConfig, serviceConfig));
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)));
      process.exit(1);
    }
  })();
}

function validateRoleType(value: string): 'root' | 'child' {
  if (value !== 'root' && value !== 'child') {
    throw new Error('role-type must be root or child');
  }
  return value;
}

export function registerWebAppCommands(program: Command): void {
  const webappCmd = program.command('webapp').description('Manage WebApp roles and permissions');

  webappCmd.command('permission-list')
    .description('List WebApp permissions')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withWebAppHandler(program, handler => handler.listPermissions(options)));

  const roleCmd = webappCmd.command('role').description('WebApp role APIs');

  roleCmd.command('list')
    .description('List WebApp roles')
    .option('--page-number <page>', 'page number', parsePositiveInteger)
    .option('--page-size <size>', 'page size', parsePositiveInteger)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withWebAppHandler(program, handler => handler.listRoles(options)));

  roleCmd.command('get')
    .description('Get WebApp role detail')
    .requiredOption('--role-id <id>', 'role ID', parsePositiveInteger)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withWebAppHandler(program, handler => handler.getRole(options)));

  roleCmd.command('create')
    .description('Create WebApp role')
    .requiredOption('--name <name>', 'role name')
    .option('--desc <desc>', 'role description')
    .requiredOption('--role-type <type>', 'role type (root|child)', validateRoleType)
    .requiredOption('--permission-ids <ids>', 'permission IDs, comma-separated', parseNumberList)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withWebAppHandler(program, handler => handler.createRole(options)));

  roleCmd.command('update')
    .description('Update WebApp role')
    .requiredOption('--role-id <id>', 'role ID', parsePositiveInteger)
    .requiredOption('--name <name>', 'role name')
    .option('--desc <desc>', 'role description')
    .requiredOption('--role-type <type>', 'role type (root|child)', validateRoleType)
    .option('--permission-ids <ids>', 'permission IDs, comma-separated', parseNumberList)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withWebAppHandler(program, handler => handler.updateRole(options)));

  roleCmd.command('delete')
    .description('Delete WebApp role')
    .requiredOption('--role-id <id>', 'role ID', parsePositiveInteger)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withWebAppHandler(program, handler => handler.deleteRole(options)));
}
