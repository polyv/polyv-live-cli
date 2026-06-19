import { Command } from 'commander';
import { registerChannelCommands } from './channel.commands';
import { registerChatCommands } from './chat.commands';
import { registerFinanceCommands } from './finance.commands';
import { registerGroupCommands } from './group.commands';
import { registerMaterialCommands } from './material.commands';
import { registerMonitorCommands } from './monitor.commands';
import { registerPartnerCommands } from './partner.commands';
import { registerPlayerCommands } from './player.commands';
import { registerRobotCommands } from './robot.commands';
import { registerStatisticsCommands } from './statistics.commands';
import { registerWebAppCommands } from './webapp.commands';

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

describe('small module command registration', () => {
  let program: Command;

  beforeEach(() => {
    program = new Command();
    registerGroupCommands(program);
    registerFinanceCommands(program);
    registerMaterialCommands(program);
    registerWebAppCommands(program);
    registerRobotCommands(program);
    registerPartnerCommands(program);
    registerPlayerCommands(program);
    registerStatisticsCommands(program);
    registerMonitorCommands(program);
    registerChatCommands(program);
    registerChannelCommands(program);
  });

  it('registers new top-level utility command groups', () => {
    for (const name of ['group', 'finance', 'material', 'webapp', 'robot', 'partner']) {
      expect(program.commands.some((cmd) => cmd.name() === name)).toBe(true);
    }
  });

  it('registers read/list command surfaces for the small modules', () => {
    expect(findCommand(program, ['finance', 'bill-detail-list'])).toBeDefined();
    expect(findCommand(program, ['material', 'label', 'list'])).toBeDefined();
    expect(findCommand(program, ['webapp', 'permission-list'])).toBeDefined();
    expect(findCommand(program, ['robot', 'list'])).toBeDefined();
    expect(findCommand(program, ['player', 'watch-feedback-list'])).toBeDefined();
    expect(findCommand(program, ['statistics', 'session-summary-list'])).toBeDefined();
    expect(findCommand(program, ['monitor', 'tencent-stream-info-list'])).toBeDefined();
    expect(findCommand(program, ['chat', 'group-login-times'])).toBeDefined();
    expect(findCommand(program, ['channel', 'status-valid'])).toBeDefined();
  });

  it('adds force protection to write/delete command surfaces', () => {
    const commands = [
      findCommand(program, ['group', 'resource', 'set-concurrences']),
      findCommand(program, ['finance', 'audio-moderation', 'update']),
      findCommand(program, ['material', 'delete']),
      findCommand(program, ['webapp', 'role', 'create']),
      findCommand(program, ['robot', 'batch-delete']),
      findCommand(program, ['partner', 'tencent-order', 'create']),
      findCommand(program, ['player', 'anti-record', 'update']),
      findCommand(program, ['channel', 'ccb-focus-reset']),
    ];

    for (const command of commands) {
      expect(hasOption(command, '--force')).toBe(true);
    }
  });

  it('keeps list commands pageable and json-capable', () => {
    const commands = [
      findCommand(program, ['finance', 'bill-detail-list']),
      findCommand(program, ['material', 'label', 'list']),
      findCommand(program, ['webapp', 'role', 'list']),
      findCommand(program, ['robot', 'list']),
      findCommand(program, ['player', 'watch-feedback-list']),
      findCommand(program, ['statistics', 'session-summary-list']),
    ];

    for (const command of commands) {
      expect(hasOption(command, '--output')).toBe(true);
      expect(hasOption(command, '--page-number') || hasOption(command, '--page')).toBe(true);
    }
  });
});
