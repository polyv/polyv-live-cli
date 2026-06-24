import { runCli } from '../helpers/cli-runner';
import { hasRealCredentials } from '../helpers/integration-config';

const shouldRunRealChannelTests = hasRealCredentials();

function parseJsonObject(output: string): Record<string, unknown> {
  const parsed = parseJsonValue(output);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`No JSON object found in CLI output:\n${output}`);
  }

  return parsed as Record<string, unknown>;
}

function parseJsonValue(output: string): unknown {
  const objectStart = output.indexOf('{');
  const arrayStart = output.indexOf('[');
  const starts = [objectStart, arrayStart].filter((index) => index !== -1);
  if (starts.length === 0) {
    throw new Error(`No JSON found in CLI output:\n${output}`);
  }

  const start = Math.min(...starts);
  const end = Math.max(output.lastIndexOf('}'), output.lastIndexOf(']'));
  if (end < start) {
    throw new Error(`No JSON found in CLI output:\n${output}`);
  }

  return JSON.parse(output.slice(start, end + 1));
}

function runCliSuccess(args: string[], timeout = 60000): string {
  const result = runCli(args, { timeout });
  if (result.exitCode !== 0) {
    throw new Error(`CLI command failed: ${args.join(' ')}\n${result.output}`);
  }
  return result.output;
}

function runCliSuccessOrBusinessFailure(args: string[], timeout = 60000): string {
  const result = runCli(args, { timeout });
  if (result.exitCode === 0) {
    return result.output;
  }

  const expectedTexts = [
    '未检测到直播推流',
    'not live',
    'not streaming',
    'no live stream',
    'No live stream',
    '不存在',
    'not exist',
    'forbidden',
  ];
  if (expectedTexts.some((text) => result.output.includes(text))) {
    return result.output;
  }

  throw new Error(`CLI command failed: ${args.join(' ')}\n${result.output}`);
}

function getDateString(daysOffset = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
}

function createTemporaryChannel(label: string): string {
  const output = runCliSuccess([
    'channel',
    'create',
    '--name',
    `CLI Channel Remaining ${label} ${Date.now()}`,
    '--scene',
    'topclass',
    '--template',
    'ppt',
    '--output',
    'json',
  ]);

  const created = parseJsonObject(output);
  const channelId = String(created.channelId || '');
  expect(channelId).toMatch(/^\d+$/);
  return channelId;
}

function deleteTemporaryChannel(channelId: string): void {
  runCliSuccess([
    'channel',
    'delete',
    '--channelId',
    channelId,
    '--force',
    '--output',
    'json',
  ]);
}

function collectBatchCreatedChannelIds(output: string): string[] {
  const parsed = parseJsonObject(output);
  const result = parsed.result as Record<string, unknown> | undefined;
  const channels = Array.isArray(parsed.result) ? parsed.result : result?.channels;
  if (!Array.isArray(channels)) return [];

  return channels
    .map((channel) => {
      if (!channel || typeof channel !== 'object') return '';
      return String((channel as Record<string, unknown>).channelId || '');
    })
    .filter((channelId) => /^\d+$/.test(channelId));
}

describe('remaining channel CLI integration', () => {
  it('shows command help for remaining channel gaps', () => {
    const checks = [
      { args: ['statistics', 'channel-play-summary', '--help'], text: '--channel-ids' },
      { args: ['statistics', 'realtime-viewers', '--help'], text: '--channel-ids' },
      { args: ['statistics', 'channel-statistic', '--help'], text: '--start-date' },
      { args: ['statistics', 'channel-session-stats', '--help'], text: '--session-ids' },
      { args: ['statistics', 'mic-list', '--help'], text: '--channel-ids' },
      { args: ['statistics', 'link-mic-list', '--help'], text: '--start-date' },
      { args: ['statistics', 'channel-summary', '--help'], text: '--start-day' },
      { args: ['statistics', 'product-click', '--help'], text: '--page-number' },
      { args: ['statistics', 'product-list-click', '--help'], text: '--page-number' },
      { args: ['statistics', 'redpack-list', '--help'], text: '--page-number' },
      { args: ['statistics', 'realtime-v1', '--help'], text: '--user-id' },
      { args: ['statistics', 'viewlog-v1', '--help'], text: '--current-day' },
      { args: ['statistics', 'viewlog-v2', '--help'], text: '--current-day' },
      { args: ['channel', 'auth', 'api-token', '--help'], text: '--expire-seconds' },
      { args: ['channel', 'auth', 'test-mode-token', '--help'], text: '--expire-time' },
      { args: ['channel', 'batch-create', '--help'], text: '--force' },
      { args: ['channel', 'v4-update', '--help'], text: '--force' },
      { args: ['stream', 'hls-pull-url', '--help'], text: '--channel-id' },
      { args: ['player', 'warmup', 'switch-update', '--help'], text: '--force' },
    ];

    for (const check of checks) {
      const result = runCli(check.args, { includeTestEnv: false });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain(check.text);
    }
  });

  (shouldRunRealChannelTests ? it : it.skip)('uses a temporary real channel for remaining read smoke commands and cleans it up', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Read Smoke');
      const id = channelId;
      const today = getDateString(0);
      const startDay = getDateString(-7);
      const endTime = String(Date.now());
      const startTime = String(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const readCommands = [
        ['statistics', 'channel-play-summary', '--start-date', startDay, '--end-date', today, '--channel-ids', id, '--output', 'json'],
        ['statistics', 'realtime-viewers', '--channel-ids', id, '--output', 'json'],
        ['statistics', 'channel-statistic', '--channel-id', id, '--start-date', startDay, '--end-date', today, '--output', 'json'],
        ['statistics', 'channel-session-stats', '--channel-id', id, '--start-time', startTime, '--end-time', endTime, '--output', 'json'],
        ['statistics', 'mic-list', '--channel-ids', id, '--start-day', startDay, '--end-day', today, '--output', 'json'],
        ['statistics', 'link-mic-list', '--channel-id', id, '--start-date', startDay, '--end-date', today, '--output', 'json'],
        ['statistics', 'channel-summary', '--channel-id', id, '--start-day', startDay, '--end-day', today, '--output', 'json'],
        ['statistics', 'product-click', '--channel-id', id, '--start-time', startTime, '--end-time', endTime, '--output', 'json'],
        ['statistics', 'product-list-click', '--channel-id', id, '--start-time', startTime, '--end-time', endTime, '--output', 'json'],
        ['statistics', 'redpack-list', '--channel-id', id, '--start-time', startTime, '--end-time', endTime, '--output', 'json'],
        ['statistics', 'realtime-v1', '--channel-id', id, '--output', 'json'],
        ['statistics', 'viewlog-v1', '--channel-id', id, '--current-day', today, '--output', 'json'],
        ['statistics', 'viewlog-v2', '--channel-id', id, '--current-day', today, '--output', 'json'],
        ['channel', 'auth', 'api-token', '--channel-id', id, '--disposable', 'true', '--expire-seconds', '1800', '--output', 'json'],
        ['channel', 'auth', 'test-mode-token', '--channel-id', id, '--expire-time', '3600', '--output', 'json'],
      ];

      for (const args of readCommands) {
        runCliSuccess(args);
      }

      runCliSuccessOrBusinessFailure(['stream', 'hls-pull-url', '--channel-id', id, '--output', 'json']);
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 300000);

  (shouldRunRealChannelTests ? it : it.skip)('uses temporary real channels for remaining write smoke commands and cleans them up', () => {
    const createdChannelIds: string[] = [];

    try {
      const channelId = createTemporaryChannel('Write Smoke');
      createdChannelIds.push(channelId);

      runCliSuccess([
        'channel',
        'v4-update',
        '--channel-id',
        channelId,
        '--name',
        `CLI Channel Remaining Updated ${Date.now()}`,
        '--force',
        '--output',
        'json',
      ]);

      runCliSuccess([
        'player',
        'warmup',
        'switch-update',
        '--channel-id',
        channelId,
        '--warm-up-enabled',
        'N',
        '--force',
        '--output',
        'json',
      ]);

      const batchOutput = runCliSuccess([
        'channel',
        'batch-create',
        '--channels-json',
        JSON.stringify([
          {
            name: `CLI Channel Remaining Batch ${Date.now()}`,
            newScene: 'topclass',
            template: 'ppt',
          },
        ]),
        '--force',
        '--output',
        'json',
      ]);

      createdChannelIds.push(...collectBatchCreatedChannelIds(batchOutput));
    } finally {
      for (const channelId of [...new Set(createdChannelIds)].reverse()) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 300000);

  (shouldRunRealChannelTests ? it : it.skip)('lists follow-public-account settings for a temporary channel via real CLI and cleans it up', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Follow List');
      const output = runCliSuccess([
        'channel',
        'follow',
        'list',
        '--channel-ids',
        channelId,
        '--output',
        'json',
      ]);

      const parsed = parseJsonObject(output) as { list?: unknown };
      expect(Array.isArray(parsed.list)).toBe(true);
      const matching = (parsed.list as Array<Record<string, unknown>>).find(
        (item) => String(item?.channelId) === channelId
      );
      expect(matching).toBeDefined();
      expect(typeof matching?.enabled).toBe('string');
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 120000);
});
