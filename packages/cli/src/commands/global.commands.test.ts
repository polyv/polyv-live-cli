/**
 * Unit tests for global commands.
 */

import { Command } from 'commander';
import { registerGlobalCommands } from './global.commands';
import { GlobalHandler } from '../handlers/global.handler';
import { authAdapter } from '../config/auth-adapter';
import { configManager } from '../config/manager';

jest.mock('../handlers/global.handler');
jest.mock('../config/auth-adapter');
jest.mock('../config/manager');

describe('Global Commands', () => {
  let program: Command;

  beforeEach(() => {
    program = new Command();
    registerGlobalCommands(program);
  });

  it('should register global command group', () => {
    const globalCmd = program.commands.find(cmd => cmd.name() === 'global');
    expect(globalCmd).toBeDefined();
    expect(globalCmd?.description()).toContain('global');
  });

  it('should register auth commands with output and force options', () => {
    const globalCmd = program.commands.find(cmd => cmd.name() === 'global');
    const authCmd = globalCmd?.commands.find(cmd => cmd.name() === 'auth');
    const getCmd = authCmd?.commands.find(cmd => cmd.name() === 'get');
    const updateCmd = authCmd?.commands.find(cmd => cmd.name() === 'update');

    expect(getCmd).toBeDefined();
    expect(getCmd?.options.some(opt => opt.long === '--output')).toBe(true);
    expect(updateCmd).toBeDefined();
    expect(updateCmd?.options.some(opt => opt.long === '--settings' && opt.required)).toBe(true);
    expect(updateCmd?.options.some(opt => opt.long === '--force')).toBe(true);
  });

  it('should register page-setting commands with output and force options', () => {
    const globalCmd = program.commands.find(cmd => cmd.name() === 'global');
    const pageSettingCmd = globalCmd?.commands.find(cmd => cmd.name() === 'page-setting');
    const getCmd = pageSettingCmd?.commands.find(cmd => cmd.name() === 'get');
    const updateCmd = pageSettingCmd?.commands.find(cmd => cmd.name() === 'update');

    expect(getCmd).toBeDefined();
    expect(getCmd?.options.some(opt => opt.long === '--output')).toBe(true);
    expect(updateCmd).toBeDefined();
    expect(updateCmd?.options.some(opt => opt.long === '--config-json' && opt.required)).toBe(true);
    expect(updateCmd?.options.some(opt => opt.long === '--force')).toBe(true);
  });
});

describe('Global Commands actions', () => {
  let program: Command;
  const mockHandler = {
    getAuth: jest.fn().mockResolvedValue(undefined),
    updateAuth: jest.fn().mockResolvedValue(undefined),
    getPageSetting: jest.fn().mockResolvedValue(undefined),
    updatePageSetting: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (GlobalHandler as jest.Mock).mockImplementation(() => mockHandler);
    (authAdapter.tryGetAuthConfig as jest.Mock).mockReturnValue({
      config: { appId: 'a', appSecret: 's', userId: 'u' },
      source: 'test',
      accountName: 'acct',
    });
    (authAdapter.getStatusMessage as jest.Mock).mockReturnValue('No auth');
    (configManager.load as jest.Mock).mockResolvedValue({
      config: { baseUrl: 'https://api.polyv.net', timeout: 30, debug: false },
    });
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    program = new Command();
    program.exitOverride();
    registerGlobalCommands(program);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('coerces --settings via parseJsonArray and runs updateAuth', async () => {
    await program.parseAsync(['node', 't', 'global', 'auth', 'update', '--settings', '[{"a":1},{"b":2}]', '--force']);
    expect(mockHandler.updateAuth).toHaveBeenCalled();
  });

  it('coerces --config-json via parseJsonObject and runs updatePageSetting', async () => {
    await program.parseAsync(['node', 't', 'global', 'page-setting', 'update', '--config-json', '{"x":1}', '--force']);
    expect(mockHandler.updatePageSetting).toHaveBeenCalled();
  });

  it('rejects non-array --settings', async () => {
    await expect(
      program.parseAsync(['node', 't', 'global', 'auth', 'update', '--settings', '{"a":1}', '--force'])
    ).rejects.toThrow();
  });

  it('rejects non-object --config-json', async () => {
    await expect(
      program.parseAsync(['node', 't', 'global', 'page-setting', 'update', '--config-json', '[1,2]', '--force'])
    ).rejects.toThrow();
  });

  it('falls back to default config when config load reports incomplete auth', async () => {
    (configManager.load as jest.Mock).mockRejectedValue(new Error('Auth configuration is incomplete'));
    await program.parseAsync(['node', 't', 'global', 'auth', 'get']);
    expect(mockHandler.getAuth).toHaveBeenCalled();
  });

  it('runs getPageSetting', async () => {
    await program.parseAsync(['node', 't', 'global', 'page-setting', 'get']);
    expect(mockHandler.getPageSetting).toHaveBeenCalled();
  });
});
