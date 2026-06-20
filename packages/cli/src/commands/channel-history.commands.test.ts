import { Command } from 'commander';
import { registerChannelCommands } from './channel.commands';
import { registerStreamCommands } from './stream.commands';
import { registerProductCommands } from './product.commands';
import { registerChatCommands } from './chat.commands';
import { registerTransmitCommands } from './transmit.commands';

function findCommand(program: Command, path: string[]): Command | undefined {
  let current: Command | undefined = program.commands.find((cmd) => cmd.name() === path[0]);
  for (const name of path.slice(1)) {
    current = current?.commands.find((cmd) => cmd.name() === name);
  }
  return current;
}

describe('channel historical operate/state/marquee command registration', () => {
  let program: Command;

  beforeEach(() => {
    program = new Command();
    program.exitOverride();
    registerChannelCommands(program);
    registerStreamCommands(program);
    registerProductCommands(program);
    registerChatCommands(program);
    registerTransmitCommands(program);
  });

  it('registers channel operate and marquee commands', () => {
    const paths = [
      ['channel', 'role', 'get'],
      ['channel', 'role', 'list'],
      ['channel', 'role', 'batch-create'],
      ['channel', 'role', 'delete'],
      ['channel', 'advert-list'],
      ['channel', 'callback', 'get'],
      ['channel', 'callback', 'update'],
      ['channel', 'ppt-record', 'setting', 'get'],
      ['channel', 'ppt-record', 'setting', 'update'],
      ['channel', 'ppt-record', 'list'],
      ['channel', 'ppt-record', 'add-task'],
      ['channel', 'ppt-record', 'delete'],
      ['channel', 'copy'],
      ['channel', 'children-list'],
      ['channel', 'token', 'watch-api'],
      ['channel', 'token', 'api'],
      ['channel', 'token', 'login-url'],
      ['channel', 'token', 'chat'],
      ['channel', 'token', 'set'],
      ['channel', 'token', 'set-account'],
      ['channel', 'follow', 'list'],
      ['channel', 'follow', 'update'],
      ['channel', 'submeeting-batch-add'],
      ['channel', 'questionnaire-stop'],
      ['channel', 'danmu-batch-update'],
      ['channel', 'max-viewer-set'],
      ['channel', 'password-update'],
      ['channel', 'marquee-url-set'],
    ];

    for (const path of paths) {
      expect(findCommand(program, path)).toBeDefined();
    }
  });

  it('registers stream state and disk-video commands', () => {
    const paths = [
      ['stream', 'live-status', 'get'],
      ['stream', 'live-status', 'list'],
      ['stream', 'streams'],
      ['stream', 'capture'],
      ['stream', 'disk-video', 'list'],
      ['stream', 'disk-video', 'add'],
      ['stream', 'disk-video', 'delete'],
      ['stream', 'disk-video', 'end'],
      ['stream', 'ban-push'],
      ['stream', 'resume'],
      ['stream', 'type-update'],
    ];

    for (const path of paths) {
      expect(findCommand(program, path)).toBeDefined();
    }
  });

  it('registers product, chat, and transmit historical commands', () => {
    const paths = [
      ['product', 'enabled'],
      ['product', 'batch-add'],
      ['product', 'batch-delete'],
      ['product', 'batch-shelf'],
      ['product', 'shelf'],
      ['product', 'sort'],
      ['product', 'push'],
      ['product', 'cancel-push'],
      ['product', 'reference'],
      ['chat', 'message', 'online-count'],
      ['chat', 'message', 'remove-contents'],
      ['transmit', 'associate'],
    ];

    for (const path of paths) {
      expect(findCommand(program, path)).toBeDefined();
    }
  });

  it('adds --force to historical write commands', () => {
    const writeCommands = [
      ['channel', 'role', 'batch-create'],
      ['channel', 'role', 'delete'],
      ['channel', 'callback', 'update'],
      ['channel', 'ppt-record', 'setting', 'update'],
      ['channel', 'ppt-record', 'add-task'],
      ['channel', 'ppt-record', 'delete'],
      ['channel', 'copy'],
      ['channel', 'token', 'set'],
      ['channel', 'token', 'set-account'],
      ['channel', 'follow', 'update'],
      ['channel', 'submeeting-batch-add'],
      ['channel', 'questionnaire-stop'],
      ['channel', 'danmu-batch-update'],
      ['channel', 'max-viewer-set'],
      ['channel', 'password-update'],
      ['channel', 'marquee-url-set'],
      ['stream', 'disk-video', 'add'],
      ['stream', 'disk-video', 'delete'],
      ['stream', 'disk-video', 'end'],
      ['stream', 'ban-push'],
      ['stream', 'resume'],
      ['stream', 'type-update'],
      ['product', 'batch-add'],
      ['product', 'batch-delete'],
      ['product', 'batch-shelf'],
      ['product', 'shelf'],
      ['product', 'sort'],
      ['product', 'push'],
      ['product', 'cancel-push'],
      ['product', 'reference'],
      ['chat', 'message', 'remove-contents'],
      ['transmit', 'associate'],
    ];

    for (const path of writeCommands) {
      const command = findCommand(program, path);
      expect(command).toBeDefined();
      expect(command?.options.find((option) => option.long === '--force')).toBeDefined();
    }
  });
});
