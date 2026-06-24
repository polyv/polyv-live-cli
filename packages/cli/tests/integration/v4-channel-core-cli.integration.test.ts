import { runCli } from '../helpers/cli-runner';
import {
  createTemporaryChannel,
  deleteTemporaryChannel,
  parseJsonObject,
  parseJsonValue,
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

function extractChannelIdFromOutput(output: string): string {
  const parsed = parseJsonObject(output);
  const result = parsed.result as Record<string, unknown> | undefined;
  const data = parsed.data as Record<string, unknown> | undefined;
  const channelId = String(parsed.channelId || result?.channelId || data?.channelId || '');

  expect(channelId).toMatch(/^\d+$/);
  return channelId;
}

function collectBatchCreatedChannelIds(output: string): string[] {
  const parsed = parseJsonObject(output);
  const result = parsed.result as Record<string, unknown> | undefined;
  const data = parsed.data as Record<string, unknown> | undefined;
  const channels = parsed.channels || result?.channels || data?.channels || parsed.result || parsed.data;

  if (!Array.isArray(channels)) {
    throw new Error(`Cannot extract batch-created channel IDs from CLI output:\n${output}`);
  }

  const channelIds = channels
    .map((channel) => {
      if (!channel || typeof channel !== 'object') return '';
      return String((channel as Record<string, unknown>).channelId || '');
    })
    .filter((channelId) => /^\d+$/.test(channelId));

  if (channelIds.length === 0) {
    throw new Error(`Cannot extract batch-created channel IDs from CLI output:\n${output}`);
  }

  return channelIds;
}

function deleteCreatedChannels(channelIds: string[]): void {
  const errors: string[] = [];

  for (const channelId of [...new Set(channelIds)].reverse()) {
    try {
      deleteTemporaryChannel(channelId);
    } catch (error) {
      errors.push(`${channelId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Failed to delete temporary channel(s):\n${errors.join('\n')}`);
  }
}

function collectRoleAccounts(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) {
    return payload.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object' && !Array.isArray(item));
  }

  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const record = payload as Record<string, unknown>;
  const nestedKeys = ['accounts', 'contents', 'data', 'result'];
  const directAccount = typeof record.account === 'string' ? [record] : [];

  return [
    ...directAccount,
    ...nestedKeys.flatMap((key) => collectRoleAccounts(record[key])),
  ];
}

function extractRoleAccountId(payload: unknown): string {
  const accountId = collectRoleAccounts(payload)
    .map((account) => String(account.account || account.accountId || '').trim())
    .find((account) => account.length > 0);

  if (!accountId) {
    throw new Error(`Cannot extract role account ID from CLI output: ${JSON.stringify(payload)}`);
  }

  return accountId;
}

function collectObjectValuesByKey(payload: unknown, key: string): Record<string, unknown>[] {
  if (Array.isArray(payload)) {
    return payload.flatMap((item) => collectObjectValuesByKey(item, key));
  }

  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const record = payload as Record<string, unknown>;
  const value = record[key];
  const direct = value && typeof value === 'object' && !Array.isArray(value)
    ? [value as Record<string, unknown>]
    : [];

  return [
    ...direct,
    ...Object.values(record).flatMap((item) => collectObjectValuesByKey(item, key)),
  ];
}

function extractRoleConfig(payload: unknown): Record<string, unknown> {
  // config-get returns the role config either as a nested `config` object or as
  // a flat settings object. Prefer the nested `config`; fall back to the payload
  // itself when it is already a flat settings record.
  const config = collectObjectValuesByKey(payload, 'config')[0];
  if (config) {
    return config;
  }
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    return payload as Record<string, unknown>;
  }
  throw new Error(`Cannot extract role config from CLI output: ${JSON.stringify(payload)}`);
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

  (shouldRunRealChannelTests ? it : it.skip)('creates, lists, gets, and deletes a historical role account through the local CLI', () => {
    let channelId: string | undefined;
    let roleAccount: string | undefined;
    let roleAccountDeleted = false;

    try {
      channelId = createTemporaryChannel('V4 Role Account Smoke');
      const id = channelId;
      const nickname = `CLI Role ${Date.now()}`;
      const accountsJson = JSON.stringify([
        {
          role: 'Assistant',
          nickname,
          passwd: 'Passw0rd123',
        },
      ]);

      const createdOutput = runCliSuccess([
        'channel',
        'role',
        'batch-create',
        '--channel-id',
        id,
        '--accounts-json',
        accountsJson,
        '--force',
        '--output',
        'json',
      ]);
      const createdPayload = parseJsonValue(createdOutput);
      roleAccount = extractRoleAccountId(createdPayload);

      const listOutput = runCliSuccess([
        'channel',
        'role',
        'list',
        '--channel-id',
        id,
        '--output',
        'json',
      ]);
      const listedAccounts = collectRoleAccounts(parseJsonValue(listOutput));
      expect(listedAccounts.some((account) => String(account.account) === roleAccount)).toBe(true);

      const getOutput = runCliSuccess([
        'channel',
        'role',
        'get',
        '--channel-id',
        id,
        '--account-id',
        roleAccount,
        '--output',
        'json',
      ]);
      const fetchedAccount = extractRoleAccountId(parseJsonValue(getOutput));
      expect(fetchedAccount).toBe(roleAccount);

      const deleteOutput = runCliSuccess([
        'channel',
        'role',
        'delete',
        '--channel-id',
        id,
        '--account-id',
        roleAccount,
        '--force',
        '--output',
        'json',
      ]);
      const deletedPayload = parseJsonObject(deleteOutput);
      expect(deletedPayload.success).toBe(true);
      roleAccountDeleted = true;
    } finally {
      if (channelId && roleAccount && !roleAccountDeleted) {
        const cleanup = runCli([
          'channel',
          'role',
          'delete',
          '--channel-id',
          channelId,
          '--account-id',
          roleAccount,
          '--force',
          '--output',
          'json',
        ]);
        if (cleanup.exitCode !== 0) {
          process.stderr.write(`Failed to delete temporary role account ${roleAccount}: ${cleanup.output}\n`);
        }
      }

      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 240000);

  (shouldRunRealChannelTests ? it : it.skip)('creates, updates, batch deletes, and configures a V4 role account through the local CLI', () => {
    let channelId: string | undefined;
    let roleAccount: string | undefined;
    let roleAccountDeleted = false;

    try {
      channelId = createTemporaryChannel('V4 Role Account API');
      const id = channelId;
      const timestamp = Date.now();

      const createOutput = runCliSuccess([
        'channel',
        'role',
        'account-create',
        '--channel-id',
        id,
        '--role',
        'Assistant',
        '--nick-name',
        `CLI Assistant ${timestamp}`,
        '--passwd',
        'Passw0rd123',
        '--force',
        '--output',
        'json',
      ]);
      const createPayload = parseJsonObject(createOutput);
      expect(createPayload.success).toBe(true);
      roleAccount = extractRoleAccountId(createPayload);

      const updateOutput = runCliSuccess([
        'channel',
        'role',
        'account-update',
        '--channel-id',
        id,
        '--account-id',
        roleAccount,
        '--nick-name',
        `CLI Upd ${timestamp}`,
        '--force',
        '--output',
        'json',
      ]);
      const updatePayload = parseJsonObject(updateOutput);
      expect(updatePayload.success).toBe(true);
      expect(extractRoleAccountId(updatePayload)).toBe(roleAccount);

      const configGetOutput = runCliSuccess([
        'channel',
        'role',
        'config-get',
        '--channel-id',
        id,
        '--role',
        'Teacher',
        '--output',
        'json',
      ]);
      const roleConfig = extractRoleConfig(parseJsonValue(configGetOutput));
      expect(roleConfig).toEqual(expect.any(Object));

      const configUpdateOutput = runCliSuccess([
        'channel',
        'role',
        'config-update',
        '--channel-id',
        id,
        '--role',
        'Teacher',
        '--config-json',
        JSON.stringify(roleConfig),
        '--force',
        '--output',
        'json',
      ]);
      const configUpdatePayload = parseJsonObject(configUpdateOutput);
      expect(configUpdatePayload.success).toBe(true);

      const deleteOutput = runCliSuccess([
        'channel',
        'role',
        'accounts-delete',
        '--channel-id',
        id,
        '--accounts',
        roleAccount,
        '--force',
        '--output',
        'json',
      ]);
      const deletePayload = parseJsonObject(deleteOutput);
      expect(deletePayload.success).toBe(true);
      roleAccountDeleted = true;
    } finally {
      if (channelId && roleAccount && !roleAccountDeleted) {
        const cleanup = runCli([
          'channel',
          'role',
          'accounts-delete',
          '--channel-id',
          channelId,
          '--accounts',
          roleAccount,
          '--force',
          '--output',
          'json',
        ]);
        if (cleanup.exitCode !== 0) {
          process.stderr.write(`Failed to batch delete temporary role account ${roleAccount}: ${cleanup.output}\n`);
        }
      }

      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 240000);

  (shouldRunRealChannelTests ? it : it.skip)('creates temporary V4 channels through creation commands and cleans them up', () => {
    const createdChannelIds: string[] = [];
    const timestamp = Date.now();
    const batchChannelsJson = JSON.stringify([
      {
        name: `CLI V4 Batch ${timestamp}`,
        newScene: 'topclass',
        template: 'ppt',
      },
    ]);
    const basicSettingJson = JSON.stringify({
      name: `CLI V4 Create Init ${timestamp}`,
      newScene: 'topclass',
      template: 'ppt',
    });

    try {
      const batchOutput = runCliSuccess([
        'channel',
        'batch-create',
        '--channels-json',
        batchChannelsJson,
        '--force',
        '--output',
        'json',
      ]);
      createdChannelIds.push(...collectBatchCreatedChannelIds(batchOutput));

      const initOutput = runCliSuccess([
        'channel',
        'create-init',
        '--basic-setting-json',
        basicSettingJson,
        '--force',
        '--output',
        'json',
      ]);
      createdChannelIds.push(extractChannelIdFromOutput(initOutput));

      // mr-create requires the account to support the MR (multi-room) newScene.
      // Some test accounts lack that capability ("user not support newScene");
      // tolerate that environmental limitation while still validating the other
      // creation commands above.
      try {
        const mrOutput = runCliSuccess([
          'channel',
          'mr-create',
          '--name',
          `CLI V4 MR ${timestamp}`,
          '--force',
          '--output',
          'json',
        ]);
        createdChannelIds.push(extractChannelIdFromOutput(mrOutput));
      } catch (error: any) {
        const message = (error?.message || '') + '';
        if (!/user not support newScene|not support newScene/i.test(message)) {
          throw error;
        }
      }
    } finally {
      deleteCreatedChannels(createdChannelIds);
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
