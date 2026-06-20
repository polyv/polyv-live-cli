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
  const start = Math.min(...starts);
  const end = Math.max(output.lastIndexOf('}'), output.lastIndexOf(']'));
  if (start === -1 || end === -1 || end < start) {
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

function createTemporaryChannel(label: string): string {
  const output = runCliSuccess([
    'channel',
    'create',
    '--name',
    `CLI V4 Marketing ${label} ${Date.now()}`,
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

describe('v4 channel marketing/content CLI integration', () => {
  it('shows command help for V4 channel marketing/content gaps', () => {
    const checks = [
      { args: ['card-push', 'share', 'get', '--help'], text: '--channelId' },
      { args: ['card-push', 'share', 'update', '--help'], text: '--force' },
      { args: ['coupon', 'channel', 'enabled', '--help'], text: '--channel-id' },
      { args: ['coupon', 'channel', 'update-enabled', '--help'], text: '--force' },
      { args: ['coupon', 'channel', 'list', '--help'], text: '--channel-id' },
      { args: ['coupon', 'channel', 'add', '--help'], text: '--coupon-ids' },
      { args: ['coupon', 'channel', 'delete', '--help'], text: '--force' },
      { args: ['product', 'push-rule', 'get', '--help'], text: '--channel-id' },
      { args: ['product', 'push-rule', 'update', '--help'], text: '--force' },
      { args: ['product', 'channel-tag', 'list', '--help'], text: '--channel-id' },
      { args: ['product', 'channel-tag', 'create', '--help'], text: '--force' },
      { args: ['product', 'stats', 'list', '--help'], text: '--product-id' },
      { args: ['product', 'stats', 'summary', '--help'], text: '--session-id' },
      { args: ['product', 'rank', '--help'], text: '--rank' },
      { args: ['product', 'topping', '--help'], text: '--force' },
      { args: ['product', 'untopping', '--help'], text: '--force' },
      { args: ['chat', 'enabled', 'update', '--help'], text: '--chat-enabled' },
      { args: ['chat', 'viewer-logout', '--help'], text: '--force' },
    ];

    for (const check of checks) {
      const result = runCli(check.args, { includeTestEnv: false });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain(check.text);
    }
  });

  (shouldRunRealChannelTests ? it : it.skip)('uses a temporary real channel for marketing/content read smoke commands and cleans it up', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Read Smoke');
      const id = channelId;

      const readCommands = [
        ['card-push', 'share', 'get', '--channelId', id, '--output', 'json'],
        ['coupon', 'channel', 'enabled', '--channel-id', id, '--output', 'json'],
        ['coupon', 'channel', 'list', '--channel-id', id, '--output', 'json'],
        ['product', 'push-rule', 'get', '--channel-id', id, '--output', 'json'],
        ['product', 'channel-tag', 'list', '--channel-id', id, '--output', 'json'],
        ['product', 'stats', 'list', '--channel-id', id, '--output', 'json'],
        ['product', 'stats', 'summary', '--channel-id', id, '--output', 'json'],
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

  (shouldRunRealChannelTests ? it : it.skip)('uses a temporary real channel for marketing/content write smoke commands and cleans it up', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Write Smoke');
      const id = channelId;

      const writeCommands = [
        [
          'card-push',
          'share',
          'update',
          '--channelId',
          id,
          '--share-btn-enable',
          'Y',
          '--title-type',
          'follow',
          '--force',
          '--output',
          'json',
        ],
        [
          'coupon',
          'channel',
          'update-enabled',
          '--channel-id',
          id,
          '--enabled',
          'Y',
          '--force',
          '--output',
          'json',
        ],
        [
          'product',
          'push-rule',
          'update',
          '--channel-id',
          id,
          '--product-explain-enabled',
          'N',
          '--force',
          '--output',
          'json',
        ],
        [
          'chat',
          'enabled',
          'update',
          '--channel-ids',
          id,
          '--chat-enabled',
          'Y',
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
});
