import { runCli } from '../helpers/cli-runner';
import {
  createTemporaryChannel,
  deleteTemporaryChannel,
  runCliSuccess,
} from '../helpers/channel-fixture';
import { hasRealCredentials } from '../helpers/integration-config';

const shouldRunRealChannelTests = hasRealCredentials();

describe('small module CLI integration', () => {
  it('shows help for new utility command groups', () => {
    for (const command of ['group', 'finance', 'material', 'webapp', 'robot', 'partner']) {
      const result = runCli([command, '--help'], { includeTestEnv: false });
      expect(result.exitCode).toBe(0);
    }
  });

  it('shows force options for dangerous write commands', () => {
    const commands = [
      ['group', 'resource', 'set-space', '--help'],
      ['finance', 'audio-moderation', 'update', '--help'],
      ['material', 'delete', '--help'],
      ['webapp', 'role', 'delete', '--help'],
      ['robot', 'batch-delete', '--help'],
      ['partner', 'tencent-order', 'create', '--help'],
      ['player', 'anti-record', 'update', '--help'],
      ['channel', 'ccb-focus-reset', '--help'],
    ];

    for (const args of commands) {
      const result = runCli(args, { includeTestEnv: false });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('--force');
    }
  });

  it('shows help for categorized read commands', () => {
    const commands = [
      ['player', 'watch-feedback-list', '--help'],
      ['statistics', 'session-summary-list', '--help'],
      ['monitor', 'tencent-stream-info-list', '--help'],
      ['chat', 'group-login-times', '--help'],
      ['channel', 'status-valid', '--help'],
    ];

    for (const args of commands) {
      const result = runCli(args, { includeTestEnv: false });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('--output');
    }
  });

  (shouldRunRealChannelTests ? it : it.skip)('runs small module read commands through the real CLI', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Small Module Read Smoke');
      const id = channelId;
      const readCommands = [
        ['finance', 'bill-detail-list', '--item-category', 'duration', '--start-date', '2026-06-01', '--end-date', '2026-06-20', '--page-number', '1', '--page-size', '5', '--output', 'json'],
        ['material', 'label', 'list', '--page-number', '1', '--page-size', '5', '--output', 'json'],
        ['webapp', 'permission-list', '--output', 'json'],
        ['webapp', 'role', 'list', '--page-number', '1', '--page-size', '5', '--output', 'json'],
        ['robot', 'list', '--page-number', '1', '--page-size', '5', '--output', 'json'],
        ['player', 'watch-feedback-list', '--channel-id', id, '--output', 'json'],
        ['statistics', 'session-summary-list', '--channel-id', id, '--page-number', '1', '--page-size', '5', '--output', 'json'],
        ['channel', 'status-valid', '--channels', id, '--output', 'json'],
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
