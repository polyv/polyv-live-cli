import { Command } from 'commander';
import { registerCheckinCommands } from './checkin.commands';
import { registerInteractionCommands } from './interaction.commands';
import { registerLotteryCommands } from './lottery.commands';
import { registerQaCommands } from './qa.commands';
import { registerQuestionnaireCommands } from './questionnaire.commands';

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

describe('live interaction command registration', () => {
  let program: Command;

  beforeEach(() => {
    program = new Command();
    registerCheckinCommands(program);
    registerQaCommands(program);
    registerQuestionnaireCommands(program);
    registerLotteryCommands(program);
    registerInteractionCommands(program);
  });

  it('registers read/list command surfaces for live_interaction gaps', () => {
    const commands = [
      findCommand(program, ['checkin', 'session-result']),
      findCommand(program, ['qa', 'send-times']),
      findCommand(program, ['qa', 'answers']),
      findCommand(program, ['qa', 'question-list']),
      findCommand(program, ['questionnaire', 'legacy-list']),
      findCommand(program, ['questionnaire', 'results']),
      findCommand(program, ['lottery', 'channel-records']),
      findCommand(program, ['lottery', 'download-winners']),
      findCommand(program, ['interaction', 'webhook', 'get']),
    ];

    for (const command of commands) {
      expect(hasOption(command, '--output')).toBe(true);
    }
  });

  it('adds force protection to live_interaction write command surfaces', () => {
    const commands = [
      findCommand(program, ['qa', 'add-edit']),
      findCommand(program, ['qa', 'delete-question']),
      findCommand(program, ['qa', 'send-result']),
      findCommand(program, ['questionnaire', 'batch-create']),
      findCommand(program, ['lottery', 'receive-info']),
      findCommand(program, ['interaction', 'favor']),
      findCommand(program, ['interaction', 'reward']),
      findCommand(program, ['interaction', 'webhook', 'set']),
      findCommand(program, ['interaction', 'webhook', 'delete']),
      findCommand(program, ['interaction', 'teacher-answer']),
    ];

    for (const command of commands) {
      expect(hasOption(command, '--force')).toBe(true);
      expect(hasOption(command, '--output')).toBe(true);
    }
  });
});
