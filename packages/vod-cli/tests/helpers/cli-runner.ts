/**
 * Runs the built CLI (`dist/index.js`) in a child process, the way a shell or an agent does.
 *
 * Each runner has a state directory of its own (`POLYV_VOD_HOME`), so tests never read or write
 * the developer's `~/.polyv-vod`. The child gets no `POLYV_*` variable from the parent: tests
 * pass credentials explicitly, or save an account first.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import type { TestCredentials } from './credentials';

const CLI_ENTRY = resolve(__dirname, '../../dist/index.js');
/** A `video wait`, or an upload with `--wait`, may legitimately take minutes. */
const RUN_TIMEOUT_MS = 10 * 60_000;

export interface CliRunOptions {
  /** The account as `POLYV_VOD_*` environment variables; none by default. */
  credentials?: TestCredentials;
}

export interface CliRunResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export class Cli {
  private constructor(readonly homeDir: string) {}

  /** A runner with an empty state directory of its own, under the OS temp directory. */
  static isolated(): Cli {
    return new Cli(mkdtempSync(join(tmpdir(), 'polyv-vod-cli-it-')));
  }

  run(args: string[], options: CliRunOptions = {}): CliRunResult {
    if (!existsSync(CLI_ENTRY)) {
      throw new Error(`The CLI is not built (${CLI_ENTRY} is missing). Run: pnpm --filter polyv-vod-cli build`);
    }
    const env: NodeJS.ProcessEnv = {};
    for (const [key, value] of Object.entries(process.env)) {
      // Not the developer's own PolyV settings: accounts directory, master key, live CLI keys.
      if (value !== undefined && !key.startsWith('POLYV_')) env[key] = value;
    }
    // The home and the working directory are the state directory too, so neither a `.env` file
    // nor a home setting of the developer's leaks into the run.
    env['POLYV_VOD_HOME'] = this.homeDir;
    env['HOME'] = this.homeDir;
    const account = options.credentials;
    if (account) {
      env['POLYV_VOD_USER_ID'] = account.userId;
      env['POLYV_VOD_SECRET_KEY'] = account.secretKey;
      if (account.writeToken !== undefined) env['POLYV_VOD_WRITE_TOKEN'] = account.writeToken;
      if (account.appId !== undefined) env['POLYV_VOD_APP_ID'] = account.appId;
      if (account.appSecret !== undefined) env['POLYV_VOD_APP_SECRET'] = account.appSecret;
    }

    // No terminal on any stream, so a command that changes something asks for --force instead
    // of prompting; the empty input closes stdin right away.
    const result = spawnSync(process.execPath, [CLI_ENTRY, ...args], {
      cwd: this.homeDir,
      env,
      encoding: 'utf8',
      input: '',
      timeout: RUN_TIMEOUT_MS,
      maxBuffer: 64 * 1024 * 1024
    });
    if (result.error) throw result.error;
    return {
      exitCode: result.status ?? 1,
      stdout: result.stdout,
      stderr: result.stderr
    };
  }

  /** Runs a command that must succeed, with `-o json`, and returns what it printed. */
  json(args: string[], options: CliRunOptions = {}): unknown {
    const command = args.join(' ');
    const result = this.run([...args, '-o', 'json'], options);
    if (result.exitCode !== 0) {
      throw new Error(`\`${command}\` exited with ${result.exitCode}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
    }
    try {
      return JSON.parse(result.stdout);
    } catch {
      throw new Error(`\`${command}\` did not print JSON\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
    }
  }

  /** Removes the state directory. */
  cleanup(): void {
    rmSync(this.homeDir, { recursive: true, force: true });
  }
}
