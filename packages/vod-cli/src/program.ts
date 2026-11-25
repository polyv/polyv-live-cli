/**
 * The Commander program. Kept apart from the process entry point so tests can drive it.
 */
import { Command, CommanderError } from 'commander';

import { registerAccountCommands } from './commands/account.commands';
import { registerAuthCommands } from './commands/auth.commands';
import { registerCallbackCommands } from './commands/callback.commands';
import { registerCategoryCommands } from './commands/category.commands';
import { registerPlayCommands } from './commands/play.commands';
import { registerStatsCommands } from './commands/stats.commands';
import { registerUploadCommands } from './commands/upload.commands';
import { registerUseCommand } from './commands/use.commands';
import { registerVideoCommands } from './commands/video.commands';
import { getCliVersion } from './core/version';
import { type CommandContext, createContext, hasFailed } from './core/context';
import { ValidationError } from './core/options';
import { isExemptInvocation, resetResolvedSource, resolveSource, setResolvedSource } from './core/source';

/** Thrown by the pre-action hook when an API-bound command runs without a valid `--source`. */
export class SourceError extends Error {}

export const SOURCE_HELP = '--source <id>  调用方来源标识（API 命令必填）：官方平台连接器传平台名（如 workbuddy），其它 agent 传自身名称（如 codex）';

/** Outcome of a run, for the entry point and the tests. */
export interface RunResult {
  exitCode: number;
}

/** Builds the program with every command registered. */
export function buildProgram(ctx: CommandContext = createContext()): Command {
  // Commander prints and calls process.exit by default; throwing keeps tests alive.
  const program = new Command().exitOverride();
  program
    .name('polyv-vod-cli')
    .description('CLI tool for managing PolyV VOD (video on-demand) services')
    .version(getCliVersion(), '-v, --version', 'display version number')
    .helpOption('-h, --help', 'display help for command')
    .configureHelp({ helpWidth: 80, sortSubcommands: true });

  program
    .option('--userId <id>', 'VOD user id (with --secretKey)')
    .option('--secretKey <key>', 'VOD secretkey (with --userId)')
    .option('--writeToken <token>', 'VOD writetoken')
    .option('--appId <id>', 'Account API appId; only V4 endpoints need it')
    .option('--appSecret <secret>', 'Account API appSecret; only V4 endpoints need it')
    .option('-a, --account <name>', 'use a saved account')
    .option('--verbose', 'show where the credentials come from')
    .option('--source <id>', '调用方来源标识（API 命令必填）：官方平台连接器传平台名（如 workbuddy），其它 agent 传自身名称（如 codex）');

  registerAccountCommands(program, ctx);
  registerUseCommand(program, ctx);
  registerAuthCommands(program, ctx);
  registerVideoCommands(program, ctx);
  registerCategoryCommands(program, ctx);
  registerUploadCommands(program, ctx);
  registerPlayCommands(program, ctx);
  registerStatsCommands(program, ctx);
  registerCallbackCommands(program, ctx);

  // Every API-bound command has to declare who is calling.
  program.hook('preAction', (_command, actionCommand) => {
    const names: string[] = [];
    let current: Command | undefined = actionCommand;
    while (current) {
      names.push(current.name());
      current = current.parent ?? undefined;
    }
    if (isExemptInvocation(names)) return;
    const outcome = resolveSource(program.opts());
    if ('error' in outcome) throw new SourceError(outcome.error);
    setResolvedSource(outcome);
  });

  // Per-command help only lists the command's own options; repeat the global one agents forget.
  const addSourceHint = (command: Command): void => {
    command.addHelpText('after', `\nGlobal Options:\n  ${SOURCE_HELP}\n`);
    command.commands.forEach(addSourceHint);
  };
  program.commands.forEach(addSourceHint);

  program.addHelpText(
    'after',
    `
Quick Start:
  $ polyv-vod-cli account add <name> --user-id <userId> --secret-key <secretKey> --write-token <writeToken> --default
  $ polyv-vod-cli video search --source <id>
  $ polyv-vod-cli upload file ./intro.mp4 --source <id>
  $ polyv-vod-cli video wait <vid> --source <id>

Credentials (first match wins): --userId/--secretKey flags, --account <name>, "use <name>",
POLYV_VOD_USER_ID and POLYV_VOD_SECRET_KEY, the default account. Never prints secretkey or writetoken.
`
  );

  return program;
}

/**
 * Runs one invocation and returns its exit code: 0 on success (and for help and version), 1 when
 * the command failed, was cancelled, ran without a valid `--source`, or the command line itself
 * was invalid.
 *
 * The outcome lives in the context, never in `process.exitCode`, so runs do not leak into each
 * other and the entry point decides what to do with the code.
 */
export async function run(argv: string[], ctx: CommandContext = createContext()): Promise<number> {
  resetResolvedSource();
  // Each call is one invocation: a failure from an earlier run on the same context must not stick.
  ctx.state.failed = false;
  const program = buildProgram(ctx);
  // Commander writes help and usage errors itself; route both through the context.
  program.configureOutput({
    writeOut: (text) => ctx.out(text.replace(/\n$/, '')),
    writeErr: (text) => ctx.err(text.replace(/\n$/, ''))
  });
  try {
    await program.parseAsync(argv, { from: 'user' });
  } catch (error) {
    if (error instanceof SourceError) {
      ctx.err(error.message);
      ctx.fail();
    } else if (error instanceof ValidationError) {
      // Thrown by an option parser (e.g. `--page 0`), which runs before a command's own
      // error handling is in place.
      ctx.err(`❌ ${error.message}`);
      ctx.fail();
    } else if (error instanceof CommanderError) {
      // Help and version are not failures; anything else (unknown option, missing argument) is.
      const printed = error.code === 'commander.help' || error.code === 'commander.helpDisplayed' || error.code === 'commander.version';
      if (!printed) ctx.fail();
    } else {
      throw error;
    }
  }
  return hasFailed(ctx) ? 1 : 0;
}
