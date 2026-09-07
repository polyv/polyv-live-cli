/**
 * Tests for WorkBuddy connector authentication commands (auth / auth status / auth logout)
 */

import { Command } from 'commander';
import { AccountConfigManager } from '../config/account-config';
import { authAdapter } from '../config/auth-adapter';
import { registerAuthCommands, KEY_GUIDE_URL, CONNECTOR_ACCOUNT_NAME } from './auth.commands';

jest.mock('../config/account-config', () => ({
  AccountConfigManager: jest.fn(),
}));

jest.mock('../config/auth-adapter', () => ({
  authAdapter: {
    tryGetAuthConfig: jest.fn(),
    getStatusMessage: jest.fn(),
  },
}));

const mockedManager = {
  accountExists: jest.fn(),
  removeAccount: jest.fn(),
};

let logSpy: jest.SpyInstance;
let errorSpy: jest.SpyInstance;

describe('Auth Commands (WorkBuddy connector)', () => {
  let program: Command;

  beforeEach(() => {
    jest.clearAllMocks();
    process.exitCode = 0;
    (AccountConfigManager as jest.Mock).mockImplementation(() => mockedManager);
    (authAdapter.getStatusMessage as jest.Mock).mockReturnValue('No authentication configured');
    program = new Command();
    registerAuthCommands(program);
    logSpy = jest.spyOn(console, 'log').mockImplementation();
    errorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
    process.exitCode = 0;
  });

  const run = async (...args: string[]) => {
    await program.parseAsync(['node', 'test', ...args]);
  };

  const getOutput = () =>
    (logSpy.mock.calls.map(c => c.join(' ')).join('\n') +
      '\n' +
      errorSpy.mock.calls.map(c => c.join(' ')).join('\n')) as string;

  it('registers auth group with status and logout subcommands', () => {
    const authCmd = program.commands.find(cmd => cmd.name() === 'auth');
    expect(authCmd).toBeDefined();
    const names = authCmd?.commands.map(c => c.name());
    expect(names).toEqual(expect.arrayContaining(['status', 'logout']));
  });

  describe('auth (setup guide)', () => {
    it('prints the official key guide URL and the account add command', async () => {
      await run('auth');

      const output = getOutput();
      expect(output).toContain(KEY_GUIDE_URL);
      expect(output).toContain(`account add ${CONNECTOR_ACCOUNT_NAME}`);
      expect(output).toContain('--app-secret');
      // URL 必须独立成行、不被引号或尖括号包裹
      expect(output).toMatch(new RegExp(`\\n\\s*${KEY_GUIDE_URL.replace(/[#/]/g, m => `\\${m}`)}\\s*\\n`));
      expect(process.exitCode).toBe(0);
    });
  });

  describe('auth status', () => {
    it('reports Logged in with account name when auth resolves', async () => {
      (authAdapter.tryGetAuthConfig as jest.Mock).mockReturnValue({
        config: { appId: 'a', appSecret: 's' },
        source: 'global-config',
        accountName: 'nicksu',
      });

      await run('auth', 'status');

      expect(getOutput()).toContain('Logged in (nicksu)');
      expect(process.exitCode).toBe(0);
    });

    it('reports Logged in without account name when auth resolves globally', async () => {
      (authAdapter.tryGetAuthConfig as jest.Mock).mockReturnValue({
        config: { appId: 'a', appSecret: 's' },
        source: 'global-config',
      });

      await run('auth', 'status');

      const output = getOutput();
      expect(output).toContain('Logged in');
      expect(output).not.toContain('Logged in (');
      expect(process.exitCode).toBe(0);
    });

    it('reports Not logged in with exit code 1 when no auth resolves', async () => {
      (authAdapter.tryGetAuthConfig as jest.Mock).mockReturnValue(null);

      await run('auth', 'status');

      const output = getOutput();
      expect(output).toContain('Not logged in');
      expect(output).toContain('No authentication configured');
      expect(output).toContain('polyv-live-cli auth');
      expect(process.exitCode).toBe(1);
    });
  });

  describe('auth logout', () => {
    it('removes the connector account when it exists', async () => {
      mockedManager.accountExists.mockReturnValue(true);
      mockedManager.removeAccount.mockReturnValue({ success: true, message: 'Account removed' });

      await run('auth', 'logout');

      expect(mockedManager.removeAccount).toHaveBeenCalledWith(CONNECTOR_ACCOUNT_NAME);
      expect(getOutput()).toContain('Logged out');
      expect(process.exitCode).toBe(0);
    });

    it('succeeds silently when the connector account does not exist', async () => {
      mockedManager.accountExists.mockReturnValue(false);

      await run('auth', 'logout');

      expect(mockedManager.removeAccount).not.toHaveBeenCalled();
      expect(getOutput()).toContain('Nothing to remove');
      expect(process.exitCode).toBe(0);
    });

    it('sets exit code 1 when removal fails', async () => {
      mockedManager.accountExists.mockReturnValue(true);
      mockedManager.removeAccount.mockReturnValue({ success: false, message: 'boom' });

      await run('auth', 'logout');

      expect(getOutput()).toContain('boom');
      expect(process.exitCode).toBe(1);
    });
  });
});
