/**
 * `account` commands: the saved VOD accounts.
 */
import { Command } from 'commander';

import { type VodCredentials } from '../core/accounts';
import { describeAuthSource, resolveAuth } from '../core/auth';
import { CommandError, type CommandContext, executors } from '../core/context';
import { confirmWrite } from '../core/confirm';
import { optionsOf, optionalString, requireValue } from '../core/options';
import { formatJson, isJson, printObject, printRows, validateOutputFormat } from '../core/output';

export function registerAccountCommands(program: Command, ctx: CommandContext): void {
  const { local } = executors(ctx);
  const account = program.command('account').description('Manage saved VOD accounts');

  account
    .command('add <name>')
    .description('Save a VOD account')
    .requiredOption('--user-id <id>', 'VOD user id')
    .requiredOption('--secret-key <key>', 'VOD secretkey')
    .option('--write-token <token>', 'VOD writetoken; uploads need it')
    .option('--read-token <token>', 'VOD readtoken')
    .option('--app-id <id>', 'Account API appId; only V4 endpoints such as "callback" need it')
    .option('--app-secret <secret>', 'Account API appSecret')
    .option('--default', 'Make it the default account')
    .option('--replace', 'Overwrite an account saved under the same name')
    .action(function (this: Command, ...args: unknown[]) {
      const options = optionsOf(this, args);
      return local(() => {
        const name = requireValue(options.name, 'account name');
        const credentials: VodCredentials = {
          userId: requireValue(options.userId, '--user-id'),
          secretKey: requireValue(options.secretKey, '--secret-key'),
          ...(optionalString(options.writeToken) ? { writeToken: optionalString(options.writeToken) } : {}),
          ...(optionalString(options.readToken) ? { readToken: optionalString(options.readToken) } : {}),
          ...(optionalString(options.appId) ? { appId: optionalString(options.appId) } : {}),
          ...(optionalString(options.appSecret) ? { appSecret: optionalString(options.appSecret) } : {})
        };
        if ((credentials.appId === undefined) !== (credentials.appSecret === undefined)) {
          throw new CommandError('--app-id and --app-secret must be given together');
        }
        ctx.store.add(name, credentials, { replace: options.replace === true });
        if (options.default === true) ctx.store.setDefault(name);
        ctx.out(`✅ Account "${name}" saved${options.default === true ? ' and set as default' : ''}`);
        if (!credentials.writeToken) {
          ctx.err('⚠️  No --write-token given: uploads need it. Add it with: polyv-vod-cli account add <name> ... --write-token <token> --replace');
        }
      });
    });

  account
    .command('list')
    .description('List saved accounts')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(function (this: Command, ...args: unknown[]) {
      const options = optionsOf(this, args);
      return local(() => {
        const defaultName = ctx.store.defaultName();
        const rows = ctx.store.list().map((item) => ({
          name: item.name,
          userId: item.userId,
          default: item.name === defaultName ? 'yes' : '',
          writeToken: item.writeToken ? 'yes' : 'no',
          apiCredentials: item.appId && item.appSecret ? 'yes' : 'no',
          createdAt: item.createdAt
        }));
        if (rows.length === 0 && isJson(options.output)) {
          ctx.out(formatJson([]));
          return;
        }
        if (rows.length === 0) {
          ctx.out('No accounts saved. Add one with: polyv-vod-cli account add <name> --user-id <userId> --secret-key <secretKey> --write-token <writeToken>');
          return;
        }
        printRows(ctx.out, rows, ['name', 'userId', 'default', 'writeToken', 'apiCredentials', 'createdAt'], options.output);      });
    });

  account
    .command('current')
    .description('Show which credentials commands would use (never the secrets)')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(function (this: Command, ...args: unknown[]) {
      const options = optionsOf(this, args);
      return local(() => {
        const auth = resolveAuth(ctx.store, ctx.session, options);
        if (!auth) {
          ctx.out(isJson(options.output) ? formatJson({ configured: false }) : 'No VOD credentials configured. Add an account with: polyv-vod-cli account add <name> ...');
          ctx.fail();
          return;
        }
        const view = {
          configured: true,
          source: describeAuthSource(auth),
          account: auth.accountName ?? null,
          userId: auth.credentials.userId,
          hasWriteToken: Boolean(auth.credentials.writeToken),
          hasApiCredentials: Boolean(auth.credentials.appId && auth.credentials.appSecret)
        };
        printObject(ctx.out, view, ['configured', 'source', 'account', 'userId', 'hasWriteToken', 'hasApiCredentials'], options.output);
      });
    });

  account
    .command('remove <name>')
    .description('Remove a saved account')
    .option('--force', 'skip the confirmation prompt')
    .action(function (this: Command, ...args: unknown[]) {
      const options = optionsOf(this, args);
      return local(async () => {
        const name = requireValue(options.name, 'account name');
        if (!ctx.store.exists(name)) throw new CommandError(`Account "${name}" is not saved`);
        await confirmWrite(`remove account "${name}"`, { force: options.force === true });
        ctx.store.remove(name);
        if (ctx.session.get() === name) ctx.session.clear();
        ctx.out(`✅ Account "${name}" removed`);
      });
    });

  account
    .command('set-default <name>')
    .description('Make a saved account the default')
    .action(function (this: Command, ...args: unknown[]) {
      const options = optionsOf(this, args);
      return local(() => {
        const name = requireValue(options.name, 'account name');
        ctx.store.setDefault(name);
        ctx.out(`✅ Default account is now "${name}"`);
      });
    });

  account
    .command('unset-default')
    .description('Drop the default account')
    .action(() => local(() => ctx.out(ctx.store.unsetDefault() ? '✅ No default account anymore' : 'No default account was set')));
}
