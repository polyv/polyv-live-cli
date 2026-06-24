import { runCli } from '../helpers/cli-runner';
import {
  createTemporaryChannel,
  deleteTemporaryChannel,
  parseJsonObject,
  runCliSuccess,
} from '../helpers/channel-fixture';
import { hasRealCredentials } from '../helpers/integration-config';

const shouldRunRealChannelTests = hasRealCredentials();

function runCliSuccessOrExpectedFailure(args: string[], expectedFailureText: string, timeout = 60000): string {
  const result = runCli(args, { timeout });
  if (result.exitCode === 0 || result.output.includes(expectedFailureText)) {
    return result.output;
  }

  throw new Error(`CLI command failed: ${args.join(' ')}\n${result.output}`);
}

describe('v4 channel core CLI integration', () => {
  it('shows command help for V4 channel core gaps', () => {
    const checks = [
      { args: ['channel', 'basic-list', '--help'], text: '--channel-ids' },
      { args: ['channel', 'simple-list', '--help'], text: '--keyword' },
      { args: ['channel', 'live-status-list', '--help'], text: '--channel-ids' },
      { args: ['channel', 'create-init', '--help'], text: '--force' },
      { args: ['channel', 'mr-create', '--help'], text: '--force' },
      { args: ['channel', 'pull-bitrate-set', '--help'], text: '--force' },
      { args: ['channel', 'template-update', '--help'], text: '--force' },
      { args: ['channel', 'role', 'account-create', '--help'], text: '--force' },
      { args: ['channel', 'role', 'account-update', '--help'], text: '--force' },
      { args: ['channel', 'role', 'accounts-delete', '--help'], text: '--force' },
      { args: ['channel', 'role', 'teacher-list', '--help'], text: '--channel-ids' },
      { args: ['channel', 'role', 'viewer-get', '--help'], text: '--channel-id' },
      { args: ['channel', 'role', 'viewer-update', '--help'], text: '--force' },
      { args: ['channel', 'role', 'config-get', '--help'], text: '--role' },
      { args: ['channel', 'role', 'config-update', '--help'], text: '--force' },
      { args: ['channel', 'subtitle', 'config-get', '--help'], text: '--channel-id' },
      { args: ['channel', 'subtitle', 'config-update', '--help'], text: '--force' },
      { args: ['channel', 'subtitle', 'languages', '--help'], text: '--output' },
      { args: ['channel', 'distribute', 'list', '--help'], text: '--channel-id' },
      { args: ['channel', 'distribute', 'create-batch', '--help'], text: '--force' },
      { args: ['channel', 'distribute', 'update-batch', '--help'], text: '--force' },
      { args: ['channel', 'distribute', 'delete-batch', '--help'], text: '--force' },
      { args: ['channel', 'distribute', 'statistic', '--help'], text: '--session-ids' },
      { args: ['channel', 'distribute', 'master-switch', '--help'], text: '--force' },
      { args: ['channel', 'distribute', 'switch', '--help'], text: '--force' },
      { args: ['monitor', 'stream-info-list', '--help'], text: '--channel-id' },
      { args: ['statistics', 'lottery-list', '--help'], text: '--channel-id' },
      { args: ['statistics', 'live-data', '--help'], text: '--channel-id' },
      { args: ['statistics', 'live-session-list', '--help'], text: '--start-time' },
      { args: ['statistics', 'weixin-booking-list', '--help'], text: '--channel-id' },
      { args: ['statistics', 'invite-list', '--help'], text: '--channel-id' },
      { args: ['player', 'skin', 'update-batch', '--help'], text: '--force' },
    ];

    for (const check of checks) {
      const result = runCli(check.args, { includeTestEnv: false });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain(check.text);
    }
  });

  (shouldRunRealChannelTests ? it : it.skip)('uses a temporary real channel for V4 read smoke commands and cleans it up', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('V4 Core Read Smoke');
      const id = channelId;
      const endTime = String(Date.now());
      const startTime = String(Date.now() - 24 * 60 * 60 * 1000);

      const readCommands = [
        ['channel', 'basic-list', '--channel-ids', id, '--output', 'json'],
        ['channel', 'simple-list', '--keyword', 'V4 Core', '--output', 'json'],
        ['channel', 'live-status-list', '--channel-ids', id, '--output', 'json'],
        ['channel', 'role', 'teacher-list', '--channel-ids', id, '--output', 'json'],
        ['channel', 'role', 'viewer-get', '--channel-id', id, '--output', 'json'],
        ['channel', 'subtitle', 'config-get', '--channel-id', id, '--output', 'json'],
        ['channel', 'subtitle', 'languages', '--output', 'json'],
        ['channel', 'distribute', 'list', '--channel-id', id, '--output', 'json'],
        ['statistics', 'live-data', '--channel-id', id, '--start-time', startTime, '--end-time', endTime, '--output', 'json'],
        ['statistics', 'lottery-list', '--channel-id', id, '--start-time', startTime, '--end-time', endTime, '--output', 'json'],
        ['statistics', 'weixin-booking-list', '--channel-id', id, '--start-time', startTime, '--end-time', endTime, '--output', 'json'],
        ['statistics', 'invite-list', '--channel-id', id, '--start-time', startTime, '--end-time', endTime, '--output', 'json'],
      ];

      for (const args of readCommands) {
        runCliSuccess(args);
      }

      runCliSuccessOrExpectedFailure(
        ['monitor', 'stream-info-list', '--channel-id', id, '--output', 'json'],
        '\u672a\u68c0\u6d4b\u5230\u76f4\u64ad\u63a8\u6d41'
      );
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 240000);

  (shouldRunRealChannelTests ? it : it.skip)('uses a temporary real channel for V4 write smoke commands and cleans it up', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('V4 Core Write Smoke');
      const id = channelId;

      const writeCommands = [
        [
          'channel',
          'role',
          'viewer-update',
          '--channel-id',
          id,
          '--actor-enabled',
          'Y',
          '--actor',
          'Teacher',
          '--question-student-title',
          'Student',
          '--question-student-title-enabled',
          'Y',
          '--force',
          '--output',
          'json',
        ],
        [
          'channel',
          'template-update',
          '--channel-id',
          id,
          '--template',
          'ppt',
          '--force',
          '--output',
          'json',
        ],
        [
          'channel',
          'pull-bitrate-set',
          '--channel-id',
          id,
          '--pull-bit-rate',
          '-1',
          '--force',
          '--output',
          'json',
        ],
        [
          'channel',
          'subtitle',
          'config-update',
          '--channel-id',
          id,
          '--real-time-subtitle-enabled',
          'N',
          '--force',
          '--output',
          'json',
        ],
        [
          'player',
          'skin',
          'update-batch',
          '--channel-ids',
          id,
          '--skin',
          'black',
          '--force',
          '--output',
          'json',
        ],
      ];

      for (const args of writeCommands) {
        runCliSuccess(args);
      }
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 240000);

  (shouldRunRealChannelTests ? it : it.skip)('copies a temporary real channel through the local CLI and deletes the copy', () => {
    let sourceChannelId: string | undefined;
    let copiedChannelId: string | undefined;

    try {
      sourceChannelId = createTemporaryChannel('V4 Core Copy Source');
      const copyOutput = runCliSuccess([
        'channel',
        'copy',
        '--channel-id',
        sourceChannelId,
        '--name',
        `CLI Copy ${Date.now()}`,
        '--force',
        '--output',
        'json',
      ]);

      const copied = parseJsonObject(copyOutput);
      copiedChannelId = String(copied.channelId || '');
      expect(copiedChannelId).toMatch(/^\d+$/);
      expect(copiedChannelId).not.toBe(sourceChannelId);
    } finally {
      if (copiedChannelId) {
        deleteTemporaryChannel(copiedChannelId);
      }
      if (sourceChannelId) {
        deleteTemporaryChannel(sourceChannelId);
      }
    }
  }, 240000);
});
