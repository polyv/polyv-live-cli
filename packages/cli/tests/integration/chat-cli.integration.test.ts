import { runCli } from '../helpers/cli-runner';
import {
  createTemporaryChannel,
  deleteTemporaryChannel,
  runCliSuccess,
} from '../helpers/channel-fixture';
import { hasRealCredentials } from '../helpers/integration-config';

const shouldRunRealChannelTests = hasRealCredentials();

describe('chat CLI integration', () => {
  it('shows extended chat command groups', () => {
    const result = runCli(['chat', '--help'], { includeTestEnv: false });

    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('message');
    expect(result.output).toContain('badword');
    expect(result.output).toContain('notice');
    expect(result.output).toContain('robot');
  });

  it('shows force options for dangerous chat commands', () => {
    const commands = [
      ['chat', 'message', 'alert-special', '--help'],
      ['chat', 'badword', 'add', '--help'],
      ['chat', 'badword', 'delete', '--help'],
      ['chat', 'banned', 'ip-add', '--help'],
      ['chat', 'banned', 'delete', '--help'],
      ['chat', 'notice', 'clean', '--help'],
      ['chat', 'censor', 'update', '--help'],
      ['chat', 'role', 'admin-update', '--help'],
      ['chat', 'robot', 'setting-update', '--help'],
      ['chat', 'robot', 'pause', '--help'],
    ];

    for (const args of commands) {
      const result = runCli(args, { includeTestEnv: false });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('--force');
      expect(result.output).toContain('--output');
    }
  });

  it('shows json-capable read command help', () => {
    const commands = [
      ['chat', 'message', 'online-count', '--help'],
      ['chat', 'message', 'speak-list', '--help'],
      ['chat', 'badword', 'list', '--help'],
      ['chat', 'banned', 'forbid-list', '--help'],
      ['chat', 'notice', 'list', '--help'],
      ['chat', 'qa', 'list', '--help'],
      ['chat', 'role', 'teacher-get', '--help'],
      ['chat', 'robot', 'stats', '--help'],
    ];

    for (const args of commands) {
      const result = runCli(args, { includeTestEnv: false });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('--output');
    }
  });

  (shouldRunRealChannelTests ? it : it.skip)('runs chat read commands against a temporary real channel', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Chat Read Smoke');
      const id = channelId;

      const readCommands = [
        ['chat', 'list', '--channel-id', id, '--page', '1', '--size', '5', '--output', 'json'],
        ['chat', 'banned', 'list', '--channel-id', id, '--type', 'badword', '--output', 'json'],
        ['chat', 'kicked', 'list', '--channel-id', id, '--output', 'json'],
        ['chat', 'message', 'online-count', '--channel-id', id, '--output', 'json'],
        ['chat', 'message', 'speak-list', '--size', '5', '--output', 'json'],
        ['chat', 'badword', 'list', '--output', 'json'],
        ['chat', 'banned', 'forbid-list', '--page-number', '1', '--page-size', '5', '--output', 'json'],
        ['chat', 'notice', 'list', '--channel-id', id, '--page-number', '1', '--page-size', '5', '--output', 'json'],
        ['chat', 'qa', 'list', '--channel-id', id, '--page-number', '1', '--page-size', '5', '--output', 'json'],
        ['chat', 'role', 'teacher-get', '--channel-id', id, '--output', 'json'],
        ['chat', 'robot', 'setting-get', '--channel-id', id, '--output', 'json'],
        ['chat', 'robot', 'stats', '--channel-id', id, '--output', 'json'],
      ];

      for (const args of readCommands) {
        runCliSuccess(args);
      }
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 240000);
});
