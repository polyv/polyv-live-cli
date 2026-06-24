import { Command } from 'commander';
import { registerProductCommands } from './product.commands';
import { registerInviteSalesCommands } from './invite-sales.commands';
import { registerCustomFieldCommands } from './custom-field.commands';
import { authAdapter } from '../config/auth-adapter';
import { configManager } from '../config/manager';
import { mockAuthSuccess, mockProcessExit, suppressConsole } from '../utils/test-helpers';

jest.mock('../config/auth-adapter');
jest.mock('../config/manager');
jest.mock('../handlers/product.handler');
jest.mock('../handlers/invite-sales.handler');
jest.mock('../handlers/custom-field.handler');
jest.mock('../utils/errors', () => ({
  logError: jest.fn(),
}));

describe('user business commands', () => {
  let program: Command;

  beforeEach(() => {
    program = new Command();
    program.exitOverride();
    jest.clearAllMocks();
  });

  function optionNames(command: Command): string[] {
    return command.options.map(option => option.long);
  }

  it('registers product library, tag, and order command groups', () => {
    registerProductCommands(program);
    const productCmd = program.commands.find(cmd => cmd.name() === 'product')!;

    expect(productCmd.commands.map(cmd => cmd.name())).toEqual(expect.arrayContaining(['library', 'tag', 'order']));
    expect(productCmd.commands.find(cmd => cmd.name() === 'library')!.commands.map(cmd => cmd.name()))
      .toEqual(expect.arrayContaining(['list', 'create', 'update', 'delete']));
    expect(productCmd.commands.find(cmd => cmd.name() === 'tag')!.commands.map(cmd => cmd.name()))
      .toEqual(expect.arrayContaining(['list', 'create', 'update', 'delete']));
    expect(productCmd.commands.find(cmd => cmd.name() === 'order')!.commands.map(cmd => cmd.name()))
      .toEqual(expect.arrayContaining(['list', 'get', 'batch-status']));
  });

  it('registers invite-sales and custom-field command groups', () => {
    registerInviteSalesCommands(program);
    registerCustomFieldCommands(program);

    const inviteSalesCmd = program.commands.find(cmd => cmd.name() === 'invite-sales')!;
    const customFieldCmd = program.commands.find(cmd => cmd.name() === 'custom-field')!;

    expect(inviteSalesCmd.commands.map(cmd => cmd.name())).toEqual(expect.arrayContaining(['list', 'add', 'update', 'remove', 'follow-viewer']));
    expect(customFieldCmd.commands.map(cmd => cmd.name())).toEqual(expect.arrayContaining(['list', 'add', 'value']));
  });

  it('adds force and output options to write commands', () => {
    registerProductCommands(program);
    registerInviteSalesCommands(program);
    registerCustomFieldCommands(program);

    const productCmd = program.commands.find(cmd => cmd.name() === 'product')!;
    const library = productCmd.commands.find(cmd => cmd.name() === 'library')!;
    const tag = productCmd.commands.find(cmd => cmd.name() === 'tag')!;
    const order = productCmd.commands.find(cmd => cmd.name() === 'order')!;
    const inviteSales = program.commands.find(cmd => cmd.name() === 'invite-sales')!;
    const customField = program.commands.find(cmd => cmd.name() === 'custom-field')!;
    const value = customField.commands.find(cmd => cmd.name() === 'value')!;

    const writeCommands = [
      library.commands.find(cmd => cmd.name() === 'create')!,
      library.commands.find(cmd => cmd.name() === 'update')!,
      library.commands.find(cmd => cmd.name() === 'delete')!,
      tag.commands.find(cmd => cmd.name() === 'create')!,
      tag.commands.find(cmd => cmd.name() === 'update')!,
      tag.commands.find(cmd => cmd.name() === 'delete')!,
      order.commands.find(cmd => cmd.name() === 'batch-status')!,
      inviteSales.commands.find(cmd => cmd.name() === 'add')!,
      inviteSales.commands.find(cmd => cmd.name() === 'update')!,
      inviteSales.commands.find(cmd => cmd.name() === 'remove')!,
      customField.commands.find(cmd => cmd.name() === 'add')!,
      value.commands.find(cmd => cmd.name() === 'save')!,
    ];

    for (const command of writeCommands) {
      expect(optionNames(command)).toContain('--force');
      expect(optionNames(command)).toContain('--output');
    }
  });

  it('documents custom-field add required options in help descriptions', () => {
    registerCustomFieldCommands(program);

    const customField = program.commands.find(cmd => cmd.name() === 'custom-field')!;
    const add = customField.commands.find(cmd => cmd.name() === 'add')!;
    const customFieldId = add.options.find(option => option.long === '--custom-field-id')!;
    const customFieldName = add.options.find(option => option.long === '--custom-field-name')!;
    const customFieldType = add.options.find(option => option.long === '--custom-field-type')!;

    expect(customFieldId.required).toBe(true);
    expect(customFieldId.description).toContain('required');
    expect(customFieldId.description).toContain('max 64');
    expect(customFieldName.description).toContain('required');
    expect(customFieldType.description).toContain('text|image|link');
  });

  it('maps product library create options to handler', async () => {
    const restoreConsole = suppressConsole();
    const restoreExit = mockProcessExit();
    const MockProductHandler = require('../handlers/product.handler').ProductHandler;
    const mockHandler = { createUserProduct: jest.fn().mockResolvedValue(undefined) };
    MockProductHandler.mockImplementation(() => mockHandler);
    mockAuthSuccess(authAdapter as jest.Mocked<typeof authAdapter>, configManager as jest.Mocked<typeof configManager>);

    registerProductCommands(program);
    await program.parseAsync([
      'node',
      'test',
      'product',
      'library',
      'create',
      '--name',
      'Demo',
      '--link-type',
      '10',
      '--link',
      'https://example.com',
      '--tag-ids',
      '1,2',
      '--force',
      '-o',
      'json',
    ]);

    expect(mockHandler.createUserProduct).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Demo',
      linkType: 10,
      link: 'https://example.com',
      tagIds: '1,2',
      force: true,
      output: 'json',
    }));

    restoreConsole();
    restoreExit();
  });

  it('maps invite-sales add options to handler', async () => {
    const restoreConsole = suppressConsole();
    const restoreExit = mockProcessExit();
    const MockInviteSalesHandler = require('../handlers/invite-sales.handler').InviteSalesHandler;
    const mockHandler = { add: jest.fn().mockResolvedValue(undefined) };
    MockInviteSalesHandler.mockImplementation(() => mockHandler);
    mockAuthSuccess(authAdapter as jest.Mocked<typeof authAdapter>, configManager as jest.Mocked<typeof configManager>);

    registerInviteSalesCommands(program);
    await program.parseAsync(['node', 'test', 'invite-sales', 'add', '--viewer-union-ids', 'v1,v2', '--force']);

    expect(mockHandler.add).toHaveBeenCalledWith(expect.objectContaining({
      viewerUnionIds: 'v1,v2',
      force: true,
      output: 'table',
    }));

    restoreConsole();
    restoreExit();
  });

  it('maps custom-field value save options to handler', async () => {
    const restoreConsole = suppressConsole();
    const restoreExit = mockProcessExit();
    const MockCustomFieldHandler = require('../handlers/custom-field.handler').CustomFieldHandler;
    const mockHandler = { saveValues: jest.fn().mockResolvedValue(undefined) };
    MockCustomFieldHandler.mockImplementation(() => mockHandler);
    mockAuthSuccess(authAdapter as jest.Mocked<typeof authAdapter>, configManager as jest.Mocked<typeof configManager>);

    registerCustomFieldCommands(program);
    await program.parseAsync([
      'node',
      'test',
      'custom-field',
      'value',
      'save',
      '--viewer-id',
      'viewer-1',
      '--custom-field-id',
      'PAY_STATUS',
      '--custom-field-value',
      'paid',
      '--force',
    ]);

    expect(mockHandler.saveValues).toHaveBeenCalledWith(expect.objectContaining({
      viewerId: 'viewer-1',
      customFieldId: 'PAY_STATUS',
      customFieldValue: 'paid',
      force: true,
      output: 'table',
    }));

    restoreConsole();
    restoreExit();
  });
});
