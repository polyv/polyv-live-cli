/**
 * `use`: the account later commands fall back to.
 */
import { Command } from 'commander';

import { CommandError, type CommandContext, executors } from '../core/context';
import { optionsOf, requireValue } from '../core/options';
import { formatJson, isJson, validateOutputFormat } from '../core/output';

export function registerUseCommand(program: Command, ctx: CommandContext): void {
  const { local } = executors(ctx);

  program
    .command('use [name]')
    .description('Choose the account for later commands on this machine')
    .option('--status', 'show the chosen account')
    .option('--clear', 'forget the chosen account')
    .option('--list', 'list the saved accounts')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(function (this: Command, ...args: unknown[]) {
      const options = optionsOf(this, args);
      return local(() => {
        if (options.list === true) {
          const accounts = ctx.store.list();
          ctx.out(isJson(options.output) ? formatJson(accounts.map((item) => ({ name: item.name, userId: item.userId }))) : accounts.map((item) => `${item.name}  ${item.userId}`).join('\n') || 'No accounts saved');
          return;
        }
        if (options.clear === true) {
          ctx.out(ctx.session.clear() ? '✅ Session account cleared' : 'No session account was set');
          return;
        }
        if (options.status === true) {
          const current = ctx.session.get();
          const record = current ? ctx.store.get(current) : undefined;
          if (!current) {
            ctx.out(isJson(options.output) ? formatJson({ account: null }) : 'No account chosen. Choose one with: polyv-vod-cli use <name>');
          } else if (!record) {
            ctx.err(`❌ Account "${current}" is no longer saved; choose another with: polyv-vod-cli use <name>`);
            ctx.fail();
          } else {
            ctx.out(isJson(options.output) ? formatJson({ account: record.name, userId: record.userId }) : `Current account: ${record.name} (userId ${record.userId})`);
          }
          return;
        }
        const target = requireValue(options.name, 'account name');
        const record = ctx.store.get(target);
        if (!record) throw new CommandError(`Account "${target}" is not saved`, 'List the saved accounts with: polyv-vod-cli use --list');
        ctx.session.set(target);
        ctx.out(`✅ Switched to account "${target}"`);
      });
    });
}
