import { Command } from 'commander';
import { registerUserCommands } from './user.commands';
import { authAdapter } from '../config/auth-adapter';
import { configManager } from '../config/manager';
import { mockAuthSuccess, mockProcessExit, suppressConsole } from '../utils/test-helpers';

jest.mock('../config/auth-adapter');
jest.mock('../config/manager');
jest.mock('../handlers/user-settings.handler');
jest.mock('../utils/errors', () => ({
  logError: jest.fn(),
}));

describe('user settings commands', () => {
  let program: Command;

  beforeEach(() => {
    program = new Command();
    program.exitOverride();
    jest.clearAllMocks();
  });

  function findCommand(root: Command, path: string[]): Command | undefined {
    return path.reduce<Command | undefined>((command, name) => command?.commands.find(child => child.name() === name), root);
  }

  function optionNames(command: Command): string[] {
    return command.options.map(option => option.long);
  }

  it('registers user command groups', () => {
    registerUserCommands(program);

    expect(findCommand(program, ['user', 'child', 'list'])).toBeDefined();
    expect(findCommand(program, ['user', 'child', 'roles'])).toBeDefined();
    expect(findCommand(program, ['user', 'org', 'create'])).toBeDefined();
    expect(findCommand(program, ['user', 'template', 'donate', 'get'])).toBeDefined();
    expect(findCommand(program, ['user', 'template', 'audio-moderation', 'update'])).toBeDefined();
    expect(findCommand(program, ['user', 'setting', 'footer', 'update'])).toBeDefined();
    expect(findCommand(program, ['user', 'setting', 'pv-show', 'update'])).toBeDefined();
    expect(findCommand(program, ['user', 'sms-send'])).toBeDefined();
    expect(findCommand(program, ['user', 'bill', 'use-detail'])).toBeDefined();
    expect(findCommand(program, ['user', 'viewlog', 'detail'])).toBeDefined();
  });

  it('adds force and output options to write commands', () => {
    registerUserCommands(program);
    const writePaths = [
      ['user', 'child', 'create'],
      ['user', 'child', 'update'],
      ['user', 'child', 'delete'],
      ['user', 'org', 'create'],
      ['user', 'org', 'delete'],
      ['user', 'template', 'donate', 'update'],
      ['user', 'template', 'marquee', 'update'],
      ['user', 'template', 'role-config', 'update'],
      ['user', 'template', 'playback', 'update'],
      ['user', 'template', 'audio-moderation', 'update'],
      ['user', 'template', 'video-moderation', 'update'],
      ['user', 'setting', 'footer', 'update'],
      ['user', 'setting', 'pv-show', 'update'],
      ['user', 'sms-send'],
    ];

    for (const path of writePaths) {
      const command = findCommand(program, path)!;
      expect(optionNames(command)).toContain('--force');
      expect(optionNames(command)).toContain('--output');
    }
  });

  it('maps child create options to handler', async () => {
    const restoreConsole = suppressConsole();
    const restoreExit = mockProcessExit();
    const MockHandler = require('../handlers/user-settings.handler').UserSettingsHandler;
    const mockHandler = { createChild: jest.fn().mockResolvedValue(undefined) };
    MockHandler.mockImplementation(() => mockHandler);
    mockAuthSuccess(authAdapter as jest.Mocked<typeof authAdapter>, configManager as jest.Mocked<typeof configManager>);

    registerUserCommands(program);
    await program.parseAsync([
      'node',
      'test',
      'user',
      'child',
      'create',
      '--child-email',
      'child@example.com',
      '--child-name',
      'Child',
      '--password',
      'Password123',
      '--role-id',
      '1',
      '--force',
      '-o',
      'json',
    ]);

    expect(mockHandler.createChild).toHaveBeenCalledWith(expect.objectContaining({
      childEmail: 'child@example.com',
      childName: 'Child',
      password: 'Password123',
      roleId: 1,
      force: true,
      output: 'json',
    }));

    restoreConsole();
    restoreExit();
  });

  it('maps template update JSON options to handler', async () => {
    const restoreConsole = suppressConsole();
    const restoreExit = mockProcessExit();
    const MockHandler = require('../handlers/user-settings.handler').UserSettingsHandler;
    const mockHandler = { updateRoleConfigTemplate: jest.fn().mockResolvedValue(undefined) };
    MockHandler.mockImplementation(() => mockHandler);
    mockAuthSuccess(authAdapter as jest.Mocked<typeof authAdapter>, configManager as jest.Mocked<typeof configManager>);

    registerUserCommands(program);
    await program.parseAsync([
      'node',
      'test',
      'user',
      'template',
      'role-config',
      'update',
      '--config-json',
      '{"teacherConfig":{"webStartCheckInDisplayEnabled":"N"}}',
      '--force',
    ]);

    expect(mockHandler.updateRoleConfigTemplate).toHaveBeenCalledWith(expect.objectContaining({
      config: { teacherConfig: { webStartCheckInDisplayEnabled: 'N' } },
      force: true,
      output: 'table',
    }));

    restoreConsole();
    restoreExit();
  });

  it('accepts legacy --config JSON for template update', async () => {
    const restoreConsole = suppressConsole();
    const restoreExit = mockProcessExit();
    const MockHandler = require('../handlers/user-settings.handler').UserSettingsHandler;
    const mockHandler = { updatePlaybackSetting: jest.fn().mockResolvedValue(undefined) };
    MockHandler.mockImplementation(() => mockHandler);
    mockAuthSuccess(authAdapter as jest.Mocked<typeof authAdapter>, configManager as jest.Mocked<typeof configManager>);

    program.option('--config <path>', 'custom configuration file path');
    registerUserCommands(program);
    await program.parseAsync([
      'node',
      'test',
      'user',
      'template',
      'playback',
      'update',
      '--config',
      '{"productPlaybackEnabled":"Y"}',
      '--force',
    ]);

    expect(mockHandler.updatePlaybackSetting).toHaveBeenCalledWith(expect.objectContaining({
      config: { productPlaybackEnabled: 'Y' },
      force: true,
      output: 'table',
    }));

    restoreConsole();
    restoreExit();
  });

  it('maps SMS parameters to handler', async () => {
    const restoreConsole = suppressConsole();
    const restoreExit = mockProcessExit();
    const MockHandler = require('../handlers/user-settings.handler').UserSettingsHandler;
    const mockHandler = { sendSms: jest.fn().mockResolvedValue(undefined) };
    MockHandler.mockImplementation(() => mockHandler);
    mockAuthSuccess(authAdapter as jest.Mocked<typeof authAdapter>, configManager as jest.Mocked<typeof configManager>);

    registerUserCommands(program);
    await program.parseAsync([
      'node',
      'test',
      'user',
      'sms-send',
      '--phone-numbers',
      '13800138000',
      '--template-param-names',
      'code',
      '--template-param-values',
      '123456',
      '--force',
    ]);

    expect(mockHandler.sendSms).toHaveBeenCalledWith(expect.objectContaining({
      phoneNumbers: '13800138000',
      templateParamNames: 'code',
      templateParamValues: '123456',
      force: true,
      output: 'table',
    }));

    restoreConsole();
    restoreExit();
  });
});
