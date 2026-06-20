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
    `CLI V4 Interaction ${label} ${Date.now()}`,
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

function extractId(value: unknown): string {
  if (!value || typeof value !== 'object') {
    throw new Error(`Cannot extract id from value: ${JSON.stringify(value)}`);
  }

  const obj = value as Record<string, any>;
  const candidates = [
    obj.id,
    obj.groupId,
    obj.data?.id,
    obj.data?.groupId,
    obj.result?.id,
    obj.result?.data?.id,
  ];
  const id = candidates.find((item) => item !== undefined && item !== null && String(item).trim() !== '');
  if (id === undefined) {
    throw new Error(`Cannot extract id from value: ${JSON.stringify(value)}`);
  }

  return String(id);
}

describe('v4 channel interaction CLI integration', () => {
  it('shows command help for V4 channel interaction gaps', () => {
    const checks = [
      { args: ['lottery', 'winners', '--help'], text: '--lottery-id' },
      { args: ['lottery', 'records', '--help'], text: '--start-time' },
      { args: ['lottery', 'wait', 'create', '--help'], text: '--force' },
      { args: ['lottery', 'group', 'list', '--help'], text: '--channel-id' },
      { args: ['lottery', 'group', 'create', '--help'], text: '--force' },
      { args: ['lottery', 'group-viewer', 'add-names', '--help'], text: '--viewer-names' },
      { args: ['lottery', 'blacklist', 'add', '--help'], text: '--force' },
      { args: ['lottery', 'lucky-bag', 'winners', '--help'], text: '--activity-id' },
      { args: ['donate', 'config', 'update', '--help'], text: '--force' },
      { args: ['donate', 'likes', '--help'], text: '--channel-id' },
      { args: ['interaction', 'event', 'list', '--help'], text: '--room-id' },
      { args: ['interaction', 'event', 'save', '--help'], text: '--force' },
      { args: ['interaction', 'invite-poster', 'create', '--help'], text: '--force' },
      { args: ['interaction', 'script', 'upload', '--help'], text: '--force' },
      { args: ['interaction', 'task-reward', 'create', '--help'], text: '--tasks-json' },
      { args: ['interaction', 'task-reward', 'delete', '--help'], text: '--force' },
      { args: ['interaction', 'task-reward', 'submit-accept-info', '--help'], text: '--form-info-json' },
    ];

    for (const check of checks) {
      const result = runCli(check.args, { includeTestEnv: false });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain(check.text);
    }
  });

  (shouldRunRealChannelTests ? it : it.skip)('uses a temporary real channel for V4 interaction read smoke commands and cleans it up', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Read Smoke');
      const id = channelId;
      const endTime = String(Date.now());
      const startTime = String(Date.now() - 24 * 60 * 60 * 1000);

      const readCommands = [
        ['lottery', 'list', '--channel-id', id, '--output', 'json'],
        ['lottery', 'records', '--channel-id', id, '--start-time', startTime, '--end-time', endTime, '--output', 'json'],
        ['lottery', 'group', 'list', '--channel-id', id, '--output', 'json'],
        ['lottery', 'blacklist', 'list', '--channel-id', id, '--output', 'json'],
        ['donate', 'likes', '--channel-id', id, '--start', startTime, '--end', endTime, '--output', 'json'],
        ['interaction', 'event', 'list', '--room-id', id, '--output', 'json'],
        ['interaction', 'task-reward', 'list', '--channel-id', id, '--output', 'json'],
        ['interaction', 'task-reward', 'stats', '--channel-id', id, '--output', 'json'],
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

  (shouldRunRealChannelTests ? it : it.skip)('uses a temporary real channel for lottery viewer group writes and cleans it up', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Write Smoke');
      const id = channelId;
      const title = `CLI V4 Interaction Group ${Date.now()}`;
      const createdOutput = runCliSuccess([
        'lottery',
        'group',
        'create',
        '--channel-id',
        id,
        '--title',
        title,
        '--force',
        '--output',
        'json',
      ]);
      const groupId = extractId(parseJsonValue(createdOutput));

      runCliSuccess([
        'lottery',
        'group',
        'update',
        '--channel-id',
        id,
        '--id',
        groupId,
        '--title',
        `${title} Updated`,
        '--force',
        '--output',
        'json',
      ]);

      runCliSuccess([
        'lottery',
        'group',
        'delete',
        '--channel-id',
        id,
        '--id',
        groupId,
        '--force',
        '--output',
        'json',
      ]);
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 240000);
});
