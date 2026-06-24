import { runCli } from '../helpers/cli-runner';
import {
  createTemporaryChannel,
  deleteTemporaryChannel,
  extractId,
  parseJsonObject,
  parseJsonValue,
  runCliSuccess,
} from '../helpers/channel-fixture';
import { hasRealCredentials } from '../helpers/integration-config';

const shouldRunRealChannelTests = hasRealCredentials();

function expectPagedPayload(payload: Record<string, unknown>): void {
  expect(payload).toEqual(expect.any(Object));
  expect(Object.keys(payload).length).toBeGreaterThan(0);
  if (payload.contents !== undefined) {
    expect(payload.contents).toEqual(expect.any(Array));
  }
}

describe('channel viewer CLI integration', () => {
  it('shows channel viewer command help', () => {
    const checks = [
      { args: ['channel', 'viewer', '--help'], text: 'group-setting' },
      { args: ['channel', 'viewer', 'group', '--help'], text: 'create' },
      { args: ['channel', 'viewer', 'group-setting', '--help'], text: 'update' },
      { args: ['channel', 'viewer', 'list', '--help'], text: '--scope' },
      { args: ['channel', 'viewer', 'unrelated-list', '--help'], text: '--label-ids' },
    ];

    for (const check of checks) {
      const result = runCli(check.args, { includeTestEnv: false });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain(check.text);
    }
  });

  it('shows force and output options for channel viewer write commands', () => {
    const commands = [
      ['channel', 'viewer', 'group', 'create', '--help'],
      ['channel', 'viewer', 'group', 'update', '--help'],
      ['channel', 'viewer', 'group', 'delete', '--help'],
      ['channel', 'viewer', 'group-setting', 'update', '--help'],
      ['channel', 'viewer', 'add', '--help'],
      ['channel', 'viewer', 'delete', '--help'],
      ['channel', 'viewer', 'transfer', '--help'],
      ['channel', 'viewer', 'import', '--help'],
    ];

    for (const args of commands) {
      const result = runCli(args, { includeTestEnv: false });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('--force');
      expect(result.output).toContain('--output');
    }
  });

  (shouldRunRealChannelTests ? it : it.skip)('runs viewer list mutations against a temporary real channel', () => {
    let channelId: string | undefined;
    const viewerId = `cli-viewer-${Date.now()}`;

    try {
      channelId = createTemporaryChannel('Channel Viewer CLI');
      const id = channelId;

      const listOutput = runCliSuccess([
        'channel',
        'viewer',
        'list',
        '--channel-id',
        id,
        '--page',
        '1',
        '--size',
        '10',
        '--output',
        'json',
      ]);
      expectPagedPayload(parseJsonObject(listOutput));

      const addOutput = runCliSuccess([
        'channel',
        'viewer',
        'add',
        '--channel-id',
        id,
        '--viewer-ids',
        viewerId,
        '--force',
        '--output',
        'json',
      ]);
      const addPayload = parseJsonObject(addOutput);
      expect(addPayload.success).toBe(true);
      expect(addPayload.viewerIds).toContain(viewerId);

      const transferOutput = runCliSuccess([
        'channel',
        'viewer',
        'transfer',
        '--channel-id',
        id,
        '--viewer-ids',
        viewerId,
        '--force',
        '--output',
        'json',
      ]);
      const transferPayload = parseJsonObject(transferOutput);
      expect(transferPayload.success).toBe(true);
      expect(transferPayload.viewerIds).toContain(viewerId);

      const unrelatedOutput = runCliSuccess([
        'channel',
        'viewer',
        'unrelated-list',
        '--channel-id',
        id,
        '--viewer-id',
        viewerId,
        '--page',
        '1',
        '--size',
        '10',
        '--output',
        'json',
      ]);
      expectPagedPayload(parseJsonObject(unrelatedOutput));

      const deleteOutput = runCliSuccess([
        'channel',
        'viewer',
        'delete',
        '--channel-id',
        id,
        '--viewer-ids',
        viewerId,
        '--force',
        '--output',
        'json',
      ]);
      const deletePayload = parseJsonObject(deleteOutput);
      expect(deletePayload.success).toBe(true);
      expect(deletePayload.viewerIds).toContain(viewerId);
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  });

  (shouldRunRealChannelTests ? it : it.skip)('manages viewer groups and group settings against a temporary real channel', () => {
    let channelId: string | undefined;
    let groupId: string | undefined;

    try {
      channelId = createTemporaryChannel('Channel Viewer Group CLI');
      const id = channelId;

      const settingOutput = runCliSuccess([
        'channel',
        'viewer',
        'group-setting',
        'get',
        '--channel-id',
        id,
        '--output',
        'json',
      ]);
      const settingPayload = parseJsonObject(settingOutput);
      expect(settingPayload).toEqual(expect.any(Object));

      const updateSettingOutput = runCliSuccess([
        'channel',
        'viewer',
        'group-setting',
        'update',
        '--channel-id',
        id,
        '--channel-viewer-group-enabled',
        'Y',
        '--not-in-group-watch-enabled',
        'Y',
        '--force',
        '--output',
        'json',
      ]);
      expect(parseJsonObject(updateSettingOutput).success).toBe(true);

      const initialListOutput = runCliSuccess([
        'channel',
        'viewer',
        'group',
        'list',
        '--channel-id',
        id,
        '--output',
        'json',
      ]);
      expect(Array.isArray(parseJsonValue(initialListOutput))).toBe(true);

      const createOutput = runCliSuccess([
        'channel',
        'viewer',
        'group',
        'create',
        '--channel-id',
        id,
        '--name',
        `CLI Viewer Group ${Date.now()}`,
        '--force',
        '--output',
        'json',
      ]);
      const createPayload = parseJsonObject(createOutput);
      groupId = extractId(createPayload);
      expect(groupId).toMatch(/^\d+$/);

      const updateOutput = runCliSuccess([
        'channel',
        'viewer',
        'group',
        'update',
        '--channel-id',
        id,
        '--id',
        groupId,
        '--name',
        `CLI Viewer Group Updated ${Date.now()}`,
        '--force',
        '--output',
        'json',
      ]);
      expect(parseJsonObject(updateOutput).success).toBe(true);

      const deleteOutput = runCliSuccess([
        'channel',
        'viewer',
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
      expect(parseJsonObject(deleteOutput).success).toBe(true);
      groupId = undefined;
    } finally {
      if (groupId && channelId) {
        runCliSuccess([
          'channel',
          'viewer',
          'group',
          'delete',
          '--channel-id',
          channelId,
          '--id',
          groupId,
          '--force',
          '--output',
          'json',
        ]);
      }

      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 180000);
});
