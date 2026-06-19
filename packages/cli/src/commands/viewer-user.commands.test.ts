/**
 * @fileoverview Unit tests for user viewer CLI gap commands
 */

import { Command } from 'commander';
import { registerViewerCommands } from './viewer.commands';
import { authAdapter } from '../config/auth-adapter';
import { configManager } from '../config/manager';
import { mockAuthSuccess, mockProcessExit, suppressConsole } from '../utils/test-helpers';

jest.mock('../config/auth-adapter');
jest.mock('../config/manager');
jest.mock('../handlers/viewer.handler');
jest.mock('../utils/errors', () => ({
  logError: jest.fn(),
}));

describe('viewer user gap commands', () => {
  let program: Command;

  beforeEach(() => {
    program = new Command();
    program.exitOverride();
    jest.clearAllMocks();
  });

  function viewerCommand(): Command {
    registerViewerCommands(program);
    return program.commands.find(cmd => cmd.name() === 'viewer')!;
  }

  function optionNames(command: Command): string[] {
    return command.options.map(option => option.long);
  }

  it('registers viewer record, config, lottery, tag CRUD, and label commands', () => {
    const viewer = viewerCommand();
    const subcommands = viewer.commands.map(cmd => cmd.name());

    expect(subcommands).toEqual(expect.arrayContaining([
      'create',
      'update',
      'delete',
      'import-external',
      'config',
      'lottery-wins',
      'tag',
      'label',
    ]));

    const tag = viewer.commands.find(cmd => cmd.name() === 'tag')!;
    expect(tag.commands.map(cmd => cmd.name())).toEqual(expect.arrayContaining([
      'create',
      'update',
      'delete',
      'add',
      'remove',
    ]));

    const label = viewer.commands.find(cmd => cmd.name() === 'label')!;
    expect(label.commands.map(cmd => cmd.name())).toEqual(expect.arrayContaining([
      'list',
      'create',
      'update',
      'delete',
      'channel-ref',
    ]));
  });

  it('adds force and json output options to write commands', () => {
    const viewer = viewerCommand();
    const writeCommands = [
      viewer.commands.find(cmd => cmd.name() === 'create')!,
      viewer.commands.find(cmd => cmd.name() === 'update')!,
      viewer.commands.find(cmd => cmd.name() === 'delete')!,
      viewer.commands.find(cmd => cmd.name() === 'import-external')!,
      viewer.commands.find(cmd => cmd.name() === 'config')!.commands.find(cmd => cmd.name() === 'update')!,
      viewer.commands.find(cmd => cmd.name() === 'tag')!.commands.find(cmd => cmd.name() === 'create')!,
      viewer.commands.find(cmd => cmd.name() === 'tag')!.commands.find(cmd => cmd.name() === 'update')!,
      viewer.commands.find(cmd => cmd.name() === 'tag')!.commands.find(cmd => cmd.name() === 'delete')!,
      viewer.commands.find(cmd => cmd.name() === 'tag')!.commands.find(cmd => cmd.name() === 'add')!,
      viewer.commands.find(cmd => cmd.name() === 'tag')!.commands.find(cmd => cmd.name() === 'remove')!,
      viewer.commands.find(cmd => cmd.name() === 'label')!.commands.find(cmd => cmd.name() === 'create')!,
      viewer.commands.find(cmd => cmd.name() === 'label')!.commands.find(cmd => cmd.name() === 'update')!,
      viewer.commands.find(cmd => cmd.name() === 'label')!.commands.find(cmd => cmd.name() === 'delete')!,
      viewer.commands.find(cmd => cmd.name() === 'label')!.commands.find(cmd => cmd.name() === 'channel-ref')!.commands.find(cmd => cmd.name() === 'add')!,
    ];

    for (const command of writeCommands) {
      expect(optionNames(command)).toContain('--force');
      expect(optionNames(command)).toContain('--output');
    }
  });

  it('maps viewer create options to handler', async () => {
    const restoreConsole = suppressConsole();
    const restoreExit = mockProcessExit();
    const MockViewerHandler = require('../handlers/viewer.handler').ViewerHandler;
    const mockHandler = { createViewer: jest.fn().mockResolvedValue(undefined) };
    MockViewerHandler.mockImplementation(() => mockHandler);
    mockAuthSuccess(authAdapter as jest.Mocked<typeof authAdapter>, configManager as jest.Mocked<typeof configManager>);

    registerViewerCommands(program);
    await program.parseAsync([
      'node',
      'test',
      'viewer',
      'create',
      '--nickname',
      'Demo',
      '--mobile',
      '13800138000',
      '--force',
      '-o',
      'json',
    ]);

    expect(mockHandler.createViewer).toHaveBeenCalledWith(expect.objectContaining({
      nickname: 'Demo',
      mobile: '13800138000',
      force: true,
      output: 'json',
    }));

    restoreConsole();
    restoreExit();
  });

  it('maps account label channel-ref add options to handler', async () => {
    const restoreConsole = suppressConsole();
    const restoreExit = mockProcessExit();
    const MockViewerHandler = require('../handlers/viewer.handler').ViewerHandler;
    const mockHandler = { addChannelLabelRefs: jest.fn().mockResolvedValue(undefined) };
    MockViewerHandler.mockImplementation(() => mockHandler);
    mockAuthSuccess(authAdapter as jest.Mocked<typeof authAdapter>, configManager as jest.Mocked<typeof configManager>);

    registerViewerCommands(program);
    await program.parseAsync([
      'node',
      'test',
      'viewer',
      'label',
      'channel-ref',
      'add',
      '--channel-ids',
      '3151318,3151319',
      '--label-ids',
      '1,2',
      '--force',
    ]);

    expect(mockHandler.addChannelLabelRefs).toHaveBeenCalledWith({
      channelIds: '3151318,3151319',
      labelIds: '1,2',
      force: true,
      output: 'table',
    });

    restoreConsole();
    restoreExit();
  });
});
