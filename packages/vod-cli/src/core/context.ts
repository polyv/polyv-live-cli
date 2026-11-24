/**
 * Command context: where commands write, how they get a client, and how they fail.
 */
import type { PolyVVodClient } from 'polyv-vod-api-sdk';
import { isPolyVVodError } from 'polyv-vod-api-sdk';

import { AccountStore, type VodCredentials } from './accounts';
import { AuthError, describeAuthSource, resolveAuth, type ResolvedAuth } from './auth';
import { createClient } from './client';
import { CancelledError } from './confirm';
import type { Options } from './options';
import { SessionStore } from './session';

/** How a command reports to the user and marks the run as failed. */
export interface Reporter {
  out: (line: string) => void;
  err: (line: string) => void;
  /**
   * Marks the invocation as failed (exit code 1) after the command has printed what went wrong.
   * For commands whose outcome is a finding, such as `video wait` on a video that never published.
   */
  fail: () => void;
  /**
   * Whether `fail` was called.
   *
   * Held in a shared object rather than a getter: contexts are copied with object spread (to
   * redirect the output, or in tests), and a spread copies a getter's value once instead of
   * keeping it live.
   */
  readonly state: { failed: boolean };
}

export interface CommandContext extends Reporter {
  store: AccountStore;
  session: SessionStore;
  /** Builds the SDK client; tests replace it with a stand-in. */
  createClient: (credentials: VodCredentials) => PolyVVodClient;
}

/** A command failed with a message meant for the user. */
export class CommandError extends Error {
  constructor(message: string, readonly hint?: string) {
    super(message);
  }
}

/** A reporter that keeps what was printed, so tests can read it back. */
export interface MemoryReporter extends Reporter {
  stdout: string[];
  stderr: string[];
}

/** Collects output in memory and remembers failures; the default for tests. */
export function createReporter(): MemoryReporter {
  const stdout: string[] = [];
  const stderr: string[] = [];
  const state = { failed: false };
  return {
    stdout,
    stderr,
    state,
    out: (line) => {
      stdout.push(line);
    },
    err: (line) => {
      stderr.push(line);
    },
    fail: () => {
      state.failed = true;
    }
  };
}

export function createContext(overrides: Partial<CommandContext> = {}): CommandContext {
  return {
    ...createReporter(),
    store: new AccountStore(),
    session: new SessionStore(),
    createClient,
    ...overrides
  };
}

/** Wires a context's output to the real streams, for the process entry point. */
export function toConsole(ctx: CommandContext): CommandContext {
  return { ...ctx, out: (line) => console.log(line), err: (line) => console.error(line) };
}

/** Whether a command marked the invocation as failed. */
export function hasFailed(ctx: Reporter): boolean {
  return ctx.state.failed;
}

const NO_CREDENTIALS_HINT = [
  'Fix it in one of these ways:',
  '  1. Save an account:  polyv-vod-cli account add <name> --user-id <userId> --secret-key <secretKey> --write-token <writeToken> --default',
  '  2. Environment:       POLYV_VOD_USER_ID and POLYV_VOD_SECRET_KEY',
  '  3. Flags:             --userId <id> --secretKey <key>',
  'The keys are in the PolyV console: 云点播 → 设置 → API接口'
].join('\n');

/** Prints a failure the way every command does. Never prints credentials. */
export function reportError(ctx: Reporter, error: unknown): void {
  if (error instanceof CancelledError) {
    ctx.err(`⚠️  ${error.message}`);
    return;
  }
  if (error instanceof AuthError) {
    ctx.err(`❌ ${error.message}`);
    ctx.err(error.hint ?? NO_CREDENTIALS_HINT);
    return;
  }
  if (error instanceof CommandError) {
    ctx.err(`❌ ${error.message}`);
    if (error.hint) ctx.err(error.hint);
    return;
  }
  if (isPolyVVodError(error)) {
    ctx.err(`❌ ${error.message}`);
    if (error.kind === 'auth') ctx.err('Update the saved credentials with: polyv-vod-cli account add <name> ... --replace');
    if (error.requestId) ctx.err(`request id: ${error.requestId}`);
    return;
  }
  ctx.err(`❌ ${error instanceof Error ? error.message : String(error)}`);
}

export interface Executors {
  /** Runs work that needs no platform access. */
  local(run: () => unknown): Promise<void>;
  /**
   * Resolves the credentials, builds the client and runs the command. Failures are reported on
   * `ctx.err` and mark the run as failed.
   */
  client(options: Options, run: (client: PolyVVodClient, auth: ResolvedAuth, options: Options) => unknown): Promise<void>;
}

export function executors(ctx: Reporter & Pick<CommandContext, 'store' | 'session' | 'createClient'>): Executors {
  const guarded = async (run: () => unknown): Promise<void> => {
    try {
      await run();
    } catch (error) {
      reportError(ctx, error);
      if (!(error instanceof CancelledError)) ctx.fail();
    }
  };
  return {
    local: (run) => guarded(run),
    client: (options, run) =>
      guarded(async () => {
        const auth = resolveAuth(ctx.store, ctx.session, options);
        if (!auth) throw new AuthError('No VOD credentials configured');
        if (options.verbose === true) ctx.err(`🔐 Credentials: ${describeAuthSource(auth)}`);
        await run(ctx.createClient(auth.credentials), auth, options);
      })
  };
}
