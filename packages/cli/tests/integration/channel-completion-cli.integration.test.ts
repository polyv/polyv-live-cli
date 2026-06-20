import { runCli } from '../helpers/cli-runner';
import {
  createTemporaryChannel,
  deleteTemporaryChannel,
  runCliSuccess,
} from '../helpers/channel-fixture';
import { getTestConfig, hasRealCredentials } from '../helpers/integration-config';

const shouldRunRealChannelTests = hasRealCredentials();
const testConfig = getTestConfig();

describe('channel completion CLI integration', () => {
  it('shows playback, document, session, and record completion command help', () => {
    const checks = [
      { args: ['playback', 'setting-list', '--help'], text: '--channel-ids' },
      { args: ['playback', 'subtitle', 'update-batch', '--help'], text: '--body-json' },
      { args: ['document', 'media', 'link', '--help'], text: '--force' },
      { args: ['session', 'external', 'relevance', '--help'], text: '--external-session-id' },
      { args: ['record', 'file', 'convert', '--help'], text: '--user-id' },
      { args: ['record', 'outline', 'create', '--help'], text: '--sync-to-playback-dot-enabled' },
    ];

    for (const check of checks) {
      const result = runCli(check.args, { includeTestEnv: false });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain(check.text);
    }
  });

  (shouldRunRealChannelTests ? it : it.skip)('runs playback, document, session, and record read commands against a temporary real channel', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('History Resource Read Smoke');
      const id = channelId;
      const userId = testConfig.authConfig.userId;

      const readCommands = [
        ['playback', 'list', '--channel-id', id, '--output', 'json'],
        ['playback', 'setting-list', '--channel-ids', id, '--output', 'json'],
        ['playback', 'video-info', '--channel-ids', id, '--output', 'json'],
        ['playback', 'enabled', 'get', '--channel-id', id, '--output', 'json'],
        ['document', 'list', '--channel-id', id, '--output', 'json'],
        ['document', 'media', 'vids', '--channel-id', id, '--output', 'json'],
        ['document', 'media', 'details', '--channel-id', id, '--output', 'json'],
        ['session', 'list', '--channel-id', id, '--output', 'json'],
        ['record', 'setting', 'get', '--channel-id', id, '--output', 'json'],
      ];

      if (userId) {
        readCommands.push([
          'record',
          'file',
          'list',
          '--channel-id',
          id,
          '--user-id',
          userId,
          '--output',
          'json',
        ]);
      }

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
