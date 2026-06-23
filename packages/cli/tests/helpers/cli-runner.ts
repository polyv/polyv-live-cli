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
  retries?: number;
  retryDelayMs?: number;
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

const transientFailurePatterns = [
  /No response from server/i,
  /Request timeout/i,
  /timeout of \d+ms exceeded/i,
  /\bECONNRESET\b/i,
  /\bETIMEDOUT\b/i,
  /\bECONNABORTED\b/i,
  /socket hang up/i,
];

function sleep(ms: number): void {
  const buffer = new SharedArrayBuffer(4);
  Atomics.wait(new Int32Array(buffer), 0, 0, ms);
}

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

function isTransientCliFailure(result: CliRunResult): boolean {
  if (result.exitCode === 0) {
    return false;
  }

  const text = `${result.output}\n${result.error?.message || ''}`;
  return transientFailurePatterns.some((pattern) => pattern.test(text));
}

export function runCli(args: string[], options: CliRunOptions = {}): CliRunResult {
  if (!fs.existsSync(cliEntryPath)) {
    throw new Error(`CLI entry not found: ${cliEntryPath}. Run npm run build before integration tests.`);
  }

  const maxRetries = options.retries ?? 2;
  const retryDelayMs = options.retryDelayMs ?? 1000;
  let runResult: CliRunResult | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
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
    runResult = {
      stdout,
      stderr,
      output: `${stdout}${stderr}`,
      exitCode,
      signal: result.signal,
      ...(result.error && { error: result.error }),
    };

    if (!isTransientCliFailure(runResult) || attempt === maxRetries) {
      break;
    }

    sleep(retryDelayMs * (attempt + 1));
  }

  if (!runResult) {
    throw new Error(`CLI did not run: ${args.join(' ')}`);
  }

  if (options.rejectOnError && runResult.exitCode !== 0) {
    throw new Error(
      `CLI failed with exit code ${runResult.exitCode}: ${args.join(' ')}\nSTDOUT:\n${runResult.stdout}\nSTDERR:\n${runResult.stderr}`
    );
  }

  return runResult;
}
