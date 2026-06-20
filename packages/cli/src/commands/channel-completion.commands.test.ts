import { Command } from 'commander';
import { registerPlaybackCommands } from './playback.commands';
import { registerDocumentCommands } from './document.commands';
import { registerSessionCommands } from './session.commands';
import { registerRecordCommands } from './record.commands';

function findCommand(program: Command, path: string[]): Command | undefined {
  let current: Command | undefined = program.commands.find((cmd) => cmd.name() === path[0]);
  for (const name of path.slice(1)) {
    current = current?.commands.find((cmd) => cmd.name() === name);
  }
  return current;
}

describe('channel completion command registration', () => {
  let program: Command;

  beforeEach(() => {
    program = new Command();
    program.exitOverride();
    registerPlaybackCommands(program);
    registerDocumentCommands(program);
    registerSessionCommands(program);
    registerRecordCommands(program);
  });

  it('registers playback completion commands', () => {
    expect(findCommand(program, ['playback', 'setting-list'])).toBeDefined();
    expect(findCommand(program, ['playback', 'enabled', 'set'])).toBeDefined();
    expect(findCommand(program, ['playback', 'title', 'update'])).toBeDefined();
    expect(findCommand(program, ['playback', 'sort', 'set'])).toBeDefined();
    expect(findCommand(program, ['playback', 'subtitle', 'update-batch'])).toBeDefined();
  });

  it('registers document media and teacher-doc commands', () => {
    expect(findCommand(program, ['document', 'teacher-doc', 'relation'])).toBeDefined();
    expect(findCommand(program, ['document', 'media', 'vids'])).toBeDefined();
    expect(findCommand(program, ['document', 'media', 'link'])).toBeDefined();
    expect(findCommand(program, ['document', 'media', 'user-delete'])).toBeDefined();
  });

  it('registers session completion commands', () => {
    expect(findCommand(program, ['session', 'legacy-list'])).toBeDefined();
    expect(findCommand(program, ['session', 'data-list'])).toBeDefined();
    expect(findCommand(program, ['session', 'create'])).toBeDefined();
    expect(findCommand(program, ['session', 'delete'])).toBeDefined();
    expect(findCommand(program, ['session', 'external', 'relevance'])).toBeDefined();
  });

  it('registers record completion commands with force on writes', () => {
    const writeCommands = [
      ['record', 'clip'],
      ['record', 'merge-mp4'],
      ['record', 'file', 'merge'],
      ['record', 'file', 'delete'],
      ['record', 'file', 'convert'],
      ['record', 'breakpoint', 'add'],
      ['record', 'outline', 'create'],
      ['record', 'subtitle', 'publish'],
    ];

    for (const path of writeCommands) {
      const command = findCommand(program, path);
      expect(command).toBeDefined();
      expect(command?.options.find((option) => option.long === '--force')).toBeDefined();
    }
  });
});
