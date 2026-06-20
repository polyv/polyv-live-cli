import { runCli } from '../helpers/cli-runner';
import {
  createTemporaryChannel,
  deleteTemporaryChannel,
  parseJsonValue,
  runCliSuccess,
} from '../helpers/channel-fixture';
import { getTestConfig, hasRealCredentials } from '../helpers/integration-config';

const shouldRunRealChannelTests = hasRealCredentials();
const testConfig = getTestConfig();

function getDateString(daysOffset = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
}

describe('channel completion CLI integration', () => {
  it('shows playback, document, session, and record completion command help', () => {
    const checks = [
      { args: ['playback', 'setting-list', '--help'], text: '--channel-ids' },
      { args: ['playback', 'subtitle', 'update-batch', '--help'], text: '--body-json' },
      { args: ['document', 'media', 'link', '--help'], text: '--force' },
      { args: ['session', 'legacy-list', '--help'], text: '--page-size' },
      { args: ['session', 'data-list', '--help'], text: '--page-size' },
      { args: ['session', 'external', 'relevance', '--help'], text: '--external-session-id' },
      { args: ['record', 'temp-list', '--help'], text: '--file-id' },
      { args: ['record', 'material-list', '--help'], text: '--page-size' },
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
      const startDate = getDateString(-7);
      const endDate = getDateString(0);

      const readCommands = [
        ['playback', 'list', '--channel-id', id, '--output', 'json'],
        ['playback', 'setting-list', '--channel-ids', id, '--output', 'json'],
        ['playback', 'video-info', '--channel-ids', id, '--output', 'json'],
        ['playback', 'enabled', 'get', '--channel-id', id, '--output', 'json'],
        ['document', 'list', '--channel-id', id, '--output', 'json'],
        ['document', 'media', 'vids', '--channel-id', id, '--output', 'json'],
        ['document', 'media', 'details', '--channel-id', id, '--output', 'json'],
        ['session', 'list', '--channel-id', id, '--output', 'json'],
        ['session', 'legacy-list', '--channel-id', id, '--start-date', startDate, '--end-date', endDate, '--page', '1', '--page-size', '5', '--output', 'json'],
        ['session', 'data-list', '--channel-id', id, '--start-date', startDate, '--end-date', endDate, '--page', '1', '--page-size', '5', '--output', 'json'],
        ['record', 'setting', 'get', '--channel-id', id, '--output', 'json'],
        ['record', 'material-list', '--channel-id', id, '--page', '1', '--page-size', '5', '--output', 'json'],
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

      const missingRecordFile = runCli([
        'record',
        'temp-list',
        '--channel-id',
        id,
        '--file-id',
        `missing-${Date.now()}`,
        '--output',
        'json',
      ], { timeout: 60000 });
      if (missingRecordFile.exitCode === 0) {
        expect(() => parseJsonValue(missingRecordFile.stdout)).not.toThrow();
      } else {
        expect(missingRecordFile.output).not.toContain('param should not be empty: fileId');
        expect(missingRecordFile.output).not.toContain('Missing required option');
        expect(missingRecordFile.output).toMatch(/不存在|not exist|not found|file|record|暂存|录制/i);
      }
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 240000);
});
