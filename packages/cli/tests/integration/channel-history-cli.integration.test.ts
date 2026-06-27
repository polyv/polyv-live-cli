import { runCli } from '../helpers/cli-runner';
import { getTestConfig, hasRealCredentials } from '../helpers/integration-config';

const shouldRunRealChannelTests = hasRealCredentials();
const testConfig = getTestConfig();

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

function expectCliSuccess(args: string[], timeout = 60000): void {
  const result = runCli(args, { timeout });
  if (result.exitCode !== 0) {
    throw new Error(`CLI command failed: ${args.join(' ')}\n${result.output}`);
  }
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
    `CLI History ${label} ${Date.now()}`,
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

describe('channel historical operate/state/marquee CLI integration', () => {
  it('shows command help for operate, state, marquee, product, chat, and transmit gaps', () => {
    const checks = [
      { args: ['channel', 'role', 'batch-create', '--help'], text: '--accounts-json' },
      { args: ['channel', 'callback', 'update', '--help'], text: '--force' },
      { args: ['channel', 'ppt-record', 'add-task', '--help'], text: '--video-id' },
      { args: ['channel', 'token', 'chat', '--help'], text: '--role' },
      { args: ['channel', 'marquee-url-set', '--help'], text: '--marquee-restrict' },
      { args: ['stream', 'live-status', 'list', '--help'], text: '--channel-ids' },
      { args: ['stream', 'disk-video', 'delete', '--help'], text: '--force' },
      { args: ['stream', 'ban-push', '--help'], text: '--user-id' },
      { args: ['product', 'batch-add', '--help'], text: '--products-json' },
      { args: ['product', 'push', '--help'], text: '--push-card-type' },
      { args: ['chat', 'message', 'remove-contents', '--help'], text: '--ids' },
      { args: ['transmit', 'associate', '--help'], text: '--receive-channel-ids' },
    ];

    for (const check of checks) {
      const result = runCli(check.args, { includeTestEnv: false });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain(check.text);
    }
  });

  (shouldRunRealChannelTests ? it : it.skip)('creates a temporary real channel for historical read smoke commands and cleans it up', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Read Smoke');
      const id = channelId;

      const readCommands = [
        ['channel', 'get', '--channelId', id, '--output', 'json'],
        ['channel', 'advert-list', '--channel-id', id, '--output', 'json'],
        ['channel', 'callback', 'get', '--channel-id', id, '--output', 'json'],
        ['stream', 'live-status', 'list', '--channel-ids', id, '--output', 'json'],
        ['product', 'enabled', '--channel-id', id, '--output', 'json'],
        ['chat', 'message', 'online-count', '--channel-id', id, '--output', 'json'],
        ['transmit', 'list', '--channelId', id, '--output', 'json'],
      ];

      for (const args of readCommands) {
        expectCliSuccess(args);
      }
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 240000);

  (shouldRunRealChannelTests ? it : it.skip)('creates temporary real channels for historical write smoke commands and cleans them up', () => {
    const createdChannelIds: string[] = [];
    const userId = testConfig.authConfig.userId;
    expect(userId).toBeTruthy();

    try {
      const sourceChannelId = createTemporaryChannel('Write Source');
      const receiveChannelId = createTemporaryChannel('Write Receiver');
      createdChannelIds.push(sourceChannelId, receiveChannelId);
      const forbidEndTime = String(Date.now() + 60 * 60 * 1000);
      let transmitChannelId: string | undefined;
      const transmitCreateResult = runCli([
        'transmit',
        'create',
        '--channelId',
        sourceChannelId,
        '--names',
        `CLI History Transmit ${Date.now()}`,
        '--output',
        'json',
      ]);
      if (transmitCreateResult.exitCode === 0) {
        const transmitChannels = parseJsonValue(transmitCreateResult.output) as Array<{ channelId?: string | number }>;
        transmitChannelId = String(transmitChannels[0]?.channelId || '');
        expect(transmitChannelId).toMatch(/^\d+$/);
        createdChannelIds.push(transmitChannelId);
      } else if (transmitCreateResult.output.includes('access forbidden')) {
        console.warn('Skipping transmit association write smoke: account cannot create transmit channels.');
      } else {
        throw new Error(`CLI command failed: transmit create --channelId ${sourceChannelId}\n${transmitCreateResult.output}`);
      }

      const writeCommands = [
        [
          'channel',
          'callback',
          'update',
          '--channel-id',
          sourceChannelId,
          '--stream-callback-url',
          'https://example.com/polyv/stream-callback',
          '--force',
          '--output',
          'json',
        ],
        [
          'channel',
          'marquee-url-set',
          '--channel-id',
          sourceChannelId,
          '--marquee-restrict',
          'Y',
          '--url',
          'https://example.com/polyv/marquee',
          '--force',
          '--output',
          'json',
        ],
        [
          'channel',
          'danmu-batch-update',
          '--channel-ids',
          sourceChannelId,
          '--close-danmu',
          'N',
          '--show-danmu-info-enabled',
          'Y',
          '--force',
          '--output',
          'json',
        ],
        [
          'channel',
          'max-viewer-set',
          '--channel-id',
          sourceChannelId,
          '--user-id',
          userId as string,
          '--max-viewer',
          '100',
          '--force',
          '--output',
          'json',
        ],
        [
          'channel',
          'password-update',
          '--channel-id',
          sourceChannelId,
          '--user-id',
          userId as string,
          '--passwd',
          'abc123',
          '--force',
          '--output',
          'json',
        ],
        [
          'channel',
          'token',
          'set',
          '--channel-id',
          sourceChannelId,
          '--token',
          `cli-history-token-${Date.now()}`,
          '--force',
          '--output',
          'json',
        ],
        [
          'stream',
          'type-update',
          '--channel-id',
          sourceChannelId,
          '--stream-type',
          'client',
          '--force',
          '--output',
          'json',
        ],
        [
          'stream',
          'ban-push',
          '--channel-id',
          sourceChannelId,
          '--user-id',
          userId as string,
          '--forbid-time',
          forbidEndTime,
          '--playback-forbidden',
          'N',
          '--force',
          '--output',
          'json',
        ],
        [
          'stream',
          'resume',
          '--channel-id',
          sourceChannelId,
          '--user-id',
          userId as string,
          '--force',
          '--output',
          'json',
        ],
      ];
      if (transmitChannelId) {
        writeCommands.push(
          [
            'transmit',
            'associate',
            '--channelId',
            transmitChannelId,
            '--receive-channel-ids',
            receiveChannelId,
            '--type',
            'add',
            '--force',
            '--output',
            'json',
          ],
          [
            'transmit',
            'associate',
            '--channelId',
            transmitChannelId,
            '--receive-channel-ids',
            receiveChannelId,
            '--type',
            'cancel',
            '--force',
            '--output',
            'json',
          ]
        );
      }

      for (const args of writeCommands) {
        expectCliSuccess(args);
      }

      // Missing-resource-error coverage: these two writes pre-validate a real
      // resource before mutating state, so a never-live temp channel has none
      // and the write is deterministically rejected (exit 1) before any state
      // is created — only the temp channel needs cleanup.
      const addTaskResult = runCli([
        'channel',
        'ppt-record',
        'add-task',
        '--channel-id',
        sourceChannelId,
        '--video-id',
        `fake-vid-${Date.now()}`,
        '--force',
        '--output',
        'json',
      ]);
      expect(addTaskResult.exitCode).toBe(1);
      expect(addTaskResult.output).toContain('record file not exist');

      const endDiskResult = runCli([
        'stream',
        'disk-video',
        'end',
        '--channel-id',
        sourceChannelId,
        '--disk-video-id',
        `fake-dvid-${Date.now()}`,
        '--force',
        '--output',
        'json',
      ]);
      expect(endDiskResult.exitCode).toBe(1);
      expect(endDiskResult.output).toContain('找不到该伪直播');

      const productOutput = runCliSuccess([
        'product',
        'batch-add',
        '--channel-id',
        sourceChannelId,
        '--products-json',
        JSON.stringify([
          {
            productType: 'normal',
            name: `CLI History Product ${Date.now()}`,
            status: 2,
            linkType: 10,
            link: 'https://example.com/product',
            cover: '//liveimages.videocc.net/uploaded/images/2023/11/gqzaoq7pk3.png',
            realPrice: 9.99,
            price: 19.99,
            btnShow: 'Buy',
          },
        ]),
        '--force',
        '--output',
        'json',
      ]);
      const productResult = parseJsonObject(productOutput) as { data?: Array<{ productId?: number }> };
      const productId = productResult.data?.[0]?.productId;
      expect(productId).toEqual(expect.any(Number));

      expectCliSuccess([
        'product',
        'shelf',
        '--channel-id',
        sourceChannelId,
        '--product-id',
        String(productId),
        '--shelf',
        '1',
        '--force',
        '--output',
        'json',
      ]);
      expectCliSuccess([
        'product',
        'batch-delete',
        '--channel-id',
        sourceChannelId,
        '--product-ids',
        String(productId),
        '--force',
        '--output',
        'json',
      ]);
    } finally {
      for (const channelId of createdChannelIds.reverse()) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 360000);
});
