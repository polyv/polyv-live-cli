/**
 * @fileoverview Helpers for integration tests that execute the real local CLI.
 */

import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { integrationEnv } from './integration-config';

export interface CliRunOptions {
  env?: NodeJS.ProcessEnv;
  homeDir?: string;
  input?: string;
  includeTestEnv?: boolean;
  isolatedHome?: boolean;
  rejectOnError?: boolean;
  timeout?: number;
}

export interface CliRunResult {
  stdout: string;
  stderr: string;
  output: string;
  exitCode: number;
  signal: NodeJS.Signals | null;
  error?: Error;
}

const cliPackageRoot = path.resolve(__dirname, '../..');
const cliEntryPath = path.join(cliPackageRoot, 'dist', 'index.js');
let sharedIsolatedHome: string | null = null;

function resolveSharedIsolatedHome(): string {
  if (!sharedIsolatedHome) {
    sharedIsolatedHome = fs.mkdtempSync(path.join(os.tmpdir(), 'polyv-cli-it-home-'));
  }

  return sharedIsolatedHome;
}

function buildTestEnv(): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...integrationEnv, ...process.env };

  if (!env['POLYV_APP_ID'] && env['POLYV_TEST_APP_ID']) {
    env['POLYV_APP_ID'] = env['POLYV_TEST_APP_ID'];
  }

  if (!env['POLYV_APP_SECRET'] && env['POLYV_TEST_APP_SECRET']) {
    env['POLYV_APP_SECRET'] = env['POLYV_TEST_APP_SECRET'];
  }

  if (!env['POLYV_USER_ID'] && env['POLYV_TEST_USER_ID']) {
    env['POLYV_USER_ID'] = env['POLYV_TEST_USER_ID'];
  }

  if (!env['POLYV_BASE_URL'] && env['POLYV_TEST_BASE_URL']) {
    env['POLYV_BASE_URL'] = env['POLYV_TEST_BASE_URL'];
  }

  return env;
}

export function getCliTestEnv(options: CliRunOptions = {}): NodeJS.ProcessEnv {
  const env = options.includeTestEnv === false ? { ...process.env } : buildTestEnv();

  delete env['POLYV_SESSION_ACCOUNT'];
  delete env['POLYV_CLI_SESSION_ACCOUNT'];
  delete env['POLYV_CONFIG_PATH'];

  if (options.isolatedHome !== false) {
    env['HOME'] = options.homeDir || resolveSharedIsolatedHome();
  } else if (options.homeDir) {
    env['HOME'] = options.homeDir;
  }

  return {
    ...env,
    ...options.env,
  };
}

export function cleanupCliTestHome(): void {
  if (sharedIsolatedHome && fs.existsSync(sharedIsolatedHome)) {
    fs.rmSync(sharedIsolatedHome, { recursive: true, force: true });
  }

  sharedIsolatedHome = null;
}

export function getCliEntryPath(): string {
  return cliEntryPath;
}

export function runCli(args: string[], options: CliRunOptions = {}): CliRunResult {
  if (!fs.existsSync(cliEntryPath)) {
    throw new Error(`CLI entry not found: ${cliEntryPath}. Run npm run build before integration tests.`);
  }

  const result = spawnSync(process.execPath, [cliEntryPath, ...args], {
    cwd: cliPackageRoot,
    encoding: 'utf8',
    env: getCliTestEnv(options),
    input: options.input,
    timeout: options.timeout || 30000,
  });

  const stdout = result.stdout || '';
  const stderr = result.stderr || '';
  const exitCode = result.status ?? (result.error ? 1 : 0);
  const runResult: CliRunResult = {
    stdout,
    stderr,
    output: `${stdout}${stderr}`,
    exitCode,
    signal: result.signal,
    ...(result.error && { error: result.error }),
  };

  if (options.rejectOnError && exitCode !== 0) {
    throw new Error(
      `CLI failed with exit code ${exitCode}: ${args.join(' ')}\nSTDOUT:\n${stdout}\nSTDERR:\n${stderr}`
    );
  }

  return runResult;
}
