import { Command } from 'commander';
import { registerWebCommands } from './web.commands';

function findCommand(root: Command, path: string[]): Command {
  let current: Command | undefined = root;
  for (const name of path) {
    current = current.commands.find((cmd) => cmd.name() === name);
  }
  expect(current).toBeDefined();
  return current!;
}

function hasOption(command: Command, long: string): boolean {
  return command.options.some((option) => option.long === long);
}

describe('web commands', () => {
  let program: Command;

  beforeEach(() => {
    program = new Command();
    registerWebCommands(program);
  });

  it('registers web command groups', () => {
    const web = findCommand(program, ['web']);

    for (const name of ['info', 'menu', 'donate', 'share', 'setting', 'auth']) {
      expect(web.commands.some((command) => command.name() === name)).toBe(true);
    }
  });

  it('registers read commands with json output support', () => {
    const commands = [
      findCommand(program, ['web', 'info', 'splash-get']),
      findCommand(program, ['web', 'info', 'likes-get']),
      findCommand(program, ['web', 'menu', 'list']),
      findCommand(program, ['web', 'donate', 'get']),
      findCommand(program, ['web', 'share', 'get']),
      findCommand(program, ['web', 'auth', 'record-field-get']),
      findCommand(program, ['web', 'auth', 'whitelist', 'download']),
    ];

    for (const command of commands) {
      expect(hasOption(command, '--output')).toBe(true);
    }
  });

  it('adds force protection to configuration-changing commands', () => {
    const commands = [
      findCommand(program, ['web', 'info', 'splash-set']),
      findCommand(program, ['web', 'info', 'publisher-set']),
      findCommand(program, ['web', 'info', 'channel-name-update']),
      findCommand(program, ['web', 'info', 'channel-logo-update']),
      findCommand(program, ['web', 'info', 'likes-update']),
      findCommand(program, ['web', 'menu', 'add']),
      findCommand(program, ['web', 'menu', 'update']),
      findCommand(program, ['web', 'menu', 'delete']),
      findCommand(program, ['web', 'donate', 'cash-update']),
      findCommand(program, ['web', 'share', 'update']),
      findCommand(program, ['web', 'setting', 'global-enabled-update']),
      findCommand(program, ['web', 'auth', 'type-set']),
      findCommand(program, ['web', 'auth', 'external-set']),
      findCommand(program, ['web', 'auth', 'auth-url-update']),
      findCommand(program, ['web', 'auth', 'whitelist', 'upload']),
    ];

    for (const command of commands) {
      expect(hasOption(command, '--force')).toBe(true);
      expect(hasOption(command, '--output')).toBe(true);
    }
  });
});
