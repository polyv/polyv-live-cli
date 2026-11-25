/**
 * The built binary without the platform: exit codes, the help, and the saved accounts.
 *
 * These need no credentials and run wherever the package is built, CI included. What the binary
 * does against the real platform is in `vod-cli.integration.test.ts`.
 */
import { createHash } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { Cli } from '../helpers/cli-runner';

const packageVersion: string = JSON.parse(readFileSync(resolve(__dirname, '../../package.json'), 'utf8')).version;
const COMMAND_GROUPS = ['account', 'use', 'auth', 'video', 'category', 'upload', 'play', 'stats', 'callback'];
/** A saved account whose secrets must never show up in any output. */
const SECRET = 's3cret-key-of-demo';
const TOKEN = 'tok3n-of-demo';
const DEMO = ['account', 'add', 'demo', '--user-id', 'user-1', '--secret-key', SECRET, '--write-token', TOKEN];

describe('polyv-vod-cli, the built binary', () => {
  let cli: Cli;

  /** What `account list -o json` prints. */
  const savedAccounts = (): Record<string, unknown>[] => cli.json(['account', 'list']) as Record<string, unknown>[];

  beforeEach(() => {
    cli = Cli.isolated();
  });

  afterEach(() => {
    cli.cleanup();
  });

  it('prints the version of its package', () => {
    const result = cli.run(['--version']);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe(`${packageVersion}\n`);
  });

  it('shows the help when called without arguments', () => {
    const result = cli.run([]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Usage: polyv-vod-cli');
    expect(result.stdout).toContain('Quick Start');
  });

  it('lists every command group in the help', () => {
    const help = cli.run(['--help']).stdout;
    for (const group of COMMAND_GROUPS) {
      expect(help).toMatch(new RegExp(`^  ${group}\\b`, 'm'));
    }
  });

  it('fails an unknown command or option with exit code 1', () => {
    for (const args of [['nope'], ['video', 'nope'], ['video', 'search', '--nope'], ['video', 'get']]) {
      const result = cli.run(args);
      expect(result.exitCode).toBe(1);
      expect(result.stderr).not.toBe('');
    }
  });

  it('refuses to call the platform without --source, before anything else', () => {
    const missing = cli.run(['video', 'search']);
    expect(missing.exitCode).toBe(1);
    expect(missing.stderr).toContain('--source');
    expect(missing.stdout).toBe('');

    const malformed = cli.run(['video', 'search', '--source', 'Not Valid']);
    expect(malformed.exitCode).toBe(1);
    expect(malformed.stderr).toContain('--source');
  });

  it('repeats --source in the help of a command that needs it', () => {
    expect(cli.run(['video', 'search', '--help']).stdout).toContain('--source <id>');
  });

  it('reports an option value it cannot parse', () => {
    const result = cli.run(['video', 'search', '--page', '0', '--source', 'it']);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('value must be a positive integer, got "0"');
  });

  it('says how to get credentials when there are none', () => {
    const status = cli.run(['auth', 'status']);
    expect(status.exitCode).toBe(1);
    expect(status.stdout).toContain('Not logged in.');

    const search = cli.run(['video', 'search', '--source', 'it']);
    expect(search.exitCode).toBe(1);
    expect(search.stderr).toContain('No VOD credentials configured');
    expect(search.stderr).toContain('polyv-vod-cli account add');
    expect(search.stdout).toBe('');
  });

  it('rejects credentials given halfway', () => {
    const result = cli.run(['account', 'current'], { credentials: { userId: 'user-1', secretKey: '' } });
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('POLYV_VOD_USER_ID and POLYV_VOD_SECRET_KEY must be set together');
  });

  it('checks a callback signature offline, without --source', () => {
    const missing = cli.run(['callback', 'verify', '--sign', 'abc']);
    // Nothing is saved yet, so the complaint is about the secretkey, not about --source.
    expect(missing.exitCode).toBe(1);
    expect(missing.stderr).toContain('No secretkey to check against');

    // The documented rule for an `upload` event: MD5 of `upload` + vid + secretkey.
    const sign = createHash('md5').update(`uploadabc_123${SECRET}`).digest('hex');
    const args = ['callback', 'verify', '--type', 'upload', '--vid', 'abc_123', '--secret-key', SECRET];

    const valid = cli.json([...args, '--sign', sign]);
    expect(valid).toEqual({ valid: true });
    const table = cli.run([...args, '--sign', sign]);
    expect(table.stdout).toContain('Signature valid');

    const tampered = cli.run([...args, '--vid', 'abc_456', '--sign', sign, '-o', 'json']);
    expect(tampered.exitCode).toBe(1);
    expect(JSON.parse(tampered.stdout)).toEqual({ valid: false });
    expect(tampered.stderr).toContain('Signature invalid');
  });

  describe('saved accounts', () => {
    it('saves an account encrypted and lists it without its secrets', () => {
      const saved = cli.run(DEMO);
      expect(saved.exitCode).toBe(0);
      expect(saved.stdout).toBe('✅ Account "demo" saved\n');

      const file = join(cli.homeDir, 'accounts.json');
      const stored = readFileSync(file, 'utf8');
      expect(stored).toContain('"enc:v1:');
      expect(stored).not.toContain(SECRET);
      expect(stored).not.toContain(TOKEN);
      expect(statSync(file).mode & 0o777).toBe(0o600);

      const list = cli.json(['account', 'list']);
      expect(list).toEqual([
        { name: 'demo', userId: 'user-1', default: '', writeToken: 'yes', apiCredentials: 'no', createdAt: expect.any(String) }
      ]);
      const table = cli.run(['account', 'list']);
      expect(table.exitCode).toBe(0);
      expect(table.stdout).toContain('demo');
      expect(table.stdout).not.toContain(SECRET);
      expect(table.stdout).not.toContain(TOKEN);
    });

    it('warns when an account cannot upload', () => {
      const saved = cli.run(['account', 'add', 'bare', '--user-id', 'user-1', '--secret-key', SECRET]);
      expect(saved.exitCode).toBe(0);
      expect(saved.stderr).toContain('No --write-token given');
      expect(savedAccounts()).toMatchObject([{ name: 'bare', writeToken: 'no' }]);
    });

    it('refuses to overwrite an account, and to remove one that is not saved', () => {
      cli.run(DEMO);

      const again = cli.run(DEMO);
      expect(again.exitCode).toBe(1);
      expect(again.stderr).toContain('already exists; pass --replace to overwrite it');

      const replaced = cli.run([...DEMO, '--user-id', 'user-9', '--replace']);
      expect(replaced.exitCode).toBe(0);
      expect(savedAccounts()).toMatchObject([{ userId: 'user-9' }]);

      const missing = cli.run(['account', 'remove', 'nobody', '--force']);
      expect(missing.exitCode).toBe(1);
      expect(missing.stderr).toContain('Account "nobody" is not saved');
    });

    it('removes an account only with --force', () => {
      cli.run(DEMO);

      const refused = cli.run(['account', 'remove', 'demo']);
      expect(refused.exitCode).toBe(1);
      expect(refused.stderr).toContain('Re-run it with --force');
      expect(cli.json(['account', 'list'])).toHaveLength(1);

      const removed = cli.run(['account', 'remove', 'demo', '--force']);
      expect(removed.exitCode).toBe(0);
      expect(removed.stdout).toBe('✅ Account "demo" removed\n');
      expect(cli.json(['account', 'list'])).toEqual([]);
      // Nothing is saved now: the table says how to add one.
      expect(cli.run(['account', 'list']).stdout).toContain('No accounts saved');
    });

    it('is logged in once an account is the default or was chosen with use', () => {
      expect(cli.run(['auth', 'status']).exitCode).toBe(1);
      cli.run(DEMO);
      // Saved, but neither the default nor chosen: commands have no credentials to use.
      const notYet = cli.run(['auth', 'status']);
      expect(notYet.exitCode).toBe(1);
      expect(notYet.stdout).toContain('Not logged in.');
      // Not configured is a finding, so `account current` says so and exits with 1.
      const current = cli.run(['account', 'current', '-o', 'json']);
      expect(current.exitCode).toBe(1);
      expect(JSON.parse(current.stdout)).toEqual({ configured: false });

      expect(cli.run(['use', 'demo']).stdout).toContain('Switched to account "demo"');
      expect(cli.json(['account', 'current'])).toEqual({
        configured: true,
        source: 'account "demo" (selected with "use")',
        account: 'demo',
        userId: 'user-1',
        hasWriteToken: true,
        hasApiCredentials: false
      });
      expect(cli.run(['auth', 'status']).stdout).toBe('Logged in (demo)\n');
      expect(cli.json(['use', '--status'])).toEqual({ account: 'demo', userId: 'user-1' });

      expect(cli.run(['account', 'set-default', 'demo']).stdout).toContain('Default account is now "demo"');
      expect(cli.run(['use', '--clear']).stdout).toContain('Session account cleared');
      expect(cli.run(['use', '--status']).stdout).toContain('No account chosen');
      expect(cli.json(['account', 'current'])).toMatchObject({ source: 'default account "demo"' });
      expect(cli.run(['auth', 'status']).stdout).toBe('Logged in (demo)\n');

      expect(cli.run(['account', 'unset-default']).stdout).toContain('No default account anymore');
      expect(cli.run(['account', 'unset-default']).stdout).toBe('No default account was set\n');
      expect(cli.run(['auth', 'status']).exitCode).toBe(1);
    });

    it('switches between saved accounts', () => {
      cli.run(DEMO);
      cli.run(['account', 'add', 'second', '--user-id', 'user-2', '--secret-key', SECRET]);

      expect(cli.json(['use', '--list'])).toEqual([
        { name: 'demo', userId: 'user-1' },
        { name: 'second', userId: 'user-2' }
      ]);
      expect(cli.run(['use', 'second']).exitCode).toBe(0);
      expect(cli.json(['use', '--status'])).toEqual({ account: 'second', userId: 'user-2' });

      const missing = cli.run(['use', 'nobody']);
      expect(missing.exitCode).toBe(1);
      expect(missing.stderr).toContain('Account "nobody" is not saved');

      // Removing the chosen account forgets the choice with it.
      cli.run(['use', 'demo']);
      cli.run(['account', 'remove', 'demo', '--force']);
      expect(cli.run(['use', '--status']).stdout).toContain('No account chosen');
    });

    it('follows the connector flow: guide, account named workbuddy, status, logout', () => {
      const guide = cli.run(['auth']);
      expect(guide.exitCode).toBe(0);
      expect(guide.stdout).toContain(
        'polyv-vod-cli account add workbuddy --user-id <userId> --secret-key <secretKey> --write-token <writeToken> --default'
      );
      expect(cli.run(['auth', 'logout']).stdout).toBe('Not logged in. Nothing to remove.\n');

      cli.run(['account', 'add', 'workbuddy', '--user-id', 'user-1', '--secret-key', SECRET, '--default']);
      expect(cli.run(['auth', 'status']).stdout).toBe('Logged in (workbuddy)\n');
      expect(cli.run(['auth', 'logout']).stdout).toBe('✅ Logged out (removed account "workbuddy")\n');
      expect(cli.run(['auth', 'logout']).stdout).toBe('Not logged in. Nothing to remove.\n');
      expect(cli.run(['auth', 'status']).exitCode).toBe(1);
    });
  });
});
