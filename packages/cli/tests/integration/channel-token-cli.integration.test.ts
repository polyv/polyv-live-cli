import { runCli } from '../helpers/cli-runner';
import {
  createTemporaryChannel,
  deleteTemporaryChannel,
  parseJsonObject,
  runCliSuccess,
} from '../helpers/channel-fixture';
import { hasRealCredentials } from '../helpers/integration-config';

const shouldRunRealChannelTests = hasRealCredentials();

function parseJsonOutput(output: string): unknown {
  const trimmed = output.trim();
  if (!trimmed) {
    throw new Error('Empty CLI output');
  }

  return JSON.parse(trimmed);
}

function collectRoleAccounts(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) {
    return payload.filter(
      (item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object' && !Array.isArray(item)
    );
  }

  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const record = payload as Record<string, unknown>;
  const directAccount = typeof record.account === 'string' || typeof record.accountId === 'string' ? [record] : [];

  return [
    ...directAccount,
    ...Object.values(record).flatMap((value) => collectRoleAccounts(value)),
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

function findStringByKey(payload: unknown, keys: string[]): string | undefined {
  if (typeof payload === 'string') {
    return payload;
  }

  if (Array.isArray(payload)) {
    for (const item of payload) {
      const match = findStringByKey(item, keys);
      if (match) return match;
    }
    return undefined;
  }

  if (!payload || typeof payload !== 'object') {
    return undefined;
  }

  const record = payload as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }

  for (const value of Object.values(record)) {
    const match = findStringByKey(value, keys);
    if (match) return match;
  }

  return undefined;
}

function expectNonEmptyTokenPayload(payload: unknown, keys: string[] = ['token']): void {
  const token = findStringByKey(payload, keys);
  expect(token).toEqual(expect.any(String));
  expect(token?.trim().length).toBeGreaterThan(0);
}

function expectNonEmptyMutationPayload(payload: unknown): void {
  if (typeof payload === 'string') {
    expect(payload.trim().length).toBeGreaterThan(0);
    return;
  }

  if (payload && typeof payload === 'object') {
    expect(Object.keys(payload as Record<string, unknown>).length).toBeGreaterThan(0);
    return;
  }

  expect(payload).toBeTruthy();
}

describe('channel token CLI integration', () => {
  (shouldRunRealChannelTests ? it : it.skip)('runs channel token commands against a temporary real channel', () => {
    let channelId: string | undefined;
    let roleAccount: string | undefined;
    let roleAccountDeleted = false;

    try {
      channelId = createTemporaryChannel('Channel Token CLI');
      const id = channelId;
      const timestamp = Date.now();
      const viewerId = `cli-token-viewer-${timestamp}`;

      const createRoleOutput = runCliSuccess([
        'channel',
        'role',
        'account-create',
        '--channel-id',
        id,
        '--role',
        'Assistant',
        '--nick-name',
        `CLI Token Assistant ${timestamp}`,
        '--passwd',
        'Passw0rd123',
        '--force',
        '--output',
        'json',
      ]);
      const createRolePayload = parseJsonObject(createRoleOutput);
      expect(createRolePayload.success).toBe(true);
      roleAccount = extractRoleAccountId(createRolePayload);

      const watchApiOutput = runCliSuccess([
        'channel',
        'token',
        'watch-api',
        '--channel-id',
        id,
        '--viewer-id',
        viewerId,
        '--nickname',
        'CLI Token Viewer',
        '--actor',
        'viewer',
        '--output',
        'json',
      ]);
      expectNonEmptyTokenPayload(parseJsonOutput(watchApiOutput));

      const apiOutput = runCliSuccess([
        'channel',
        'token',
        'api',
        '--channel-id',
        id,
        '--viewer-id',
        viewerId,
        '--nickname',
        'CLI Token Viewer',
        '--output',
        'json',
      ]);
      expectNonEmptyTokenPayload(parseJsonOutput(apiOutput));

      const loginUrlOutput = runCliSuccess([
        'channel',
        'token',
        'login-url',
        '--channel-id',
        id,
        '--account-id',
        roleAccount,
        '--output',
        'json',
      ]);
      expectNonEmptyTokenPayload(parseJsonOutput(loginUrlOutput), ['token', 'loginUrl', 'url']);

      const chatOutput = runCliSuccess([
        'channel',
        'token',
        'chat',
        '--channel-id',
        id,
        '--user-id',
        viewerId,
        '--role',
        'viewer',
        '--origin',
        'https://live.polyv.net',
        '--output',
        'json',
      ]);
      expectNonEmptyTokenPayload(parseJsonOutput(chatOutput));

      const setAccountOutput = runCliSuccess([
        'channel',
        'token',
        'set-account',
        '--channel-id',
        id,
        '--token',
        `cli-token-${timestamp}`,
        '--force',
        '--output',
        'json',
      ]);
      expectNonEmptyMutationPayload(parseJsonOutput(setAccountOutput));

      const deleteRoleOutput = runCliSuccess([
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
      expect(parseJsonObject(deleteRoleOutput).success).toBe(true);
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
          process.stderr.write(`Failed to delete temporary role account ${roleAccount}: ${cleanup.output}\n`);
        }
      }

      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 240000);
});
