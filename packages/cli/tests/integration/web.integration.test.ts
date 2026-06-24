import { runCli } from '../helpers/cli-runner';
import {
  createTemporaryChannel,
  deleteTemporaryChannel,
  parseJsonObject,
  runCliSuccess,
} from '../helpers/channel-fixture';
import { hasRealCredentials } from '../helpers/integration-config';

const shouldRunRealChannelTests = hasRealCredentials();

describe('web CLI integration', () => {
  it('shows web command group help', () => {
    const result = runCli(['web', '--help'], { includeTestEnv: false });

    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('info');
    expect(result.output).toContain('menu');
    expect(result.output).toContain('auth');
  });

  it('shows force options for web configuration changes', () => {
    const commands = [
      ['web', 'info', 'splash-set', '--help'],
      ['web', 'menu', 'add', '--help'],
      ['web', 'donate', 'cash-update', '--help'],
      ['web', 'share', 'update', '--help'],
      ['web', 'setting', 'global-enabled-update', '--help'],
      ['web', 'auth', 'external-set', '--help'],
      ['web', 'auth', 'whitelist', 'upload', '--help'],
    ];

    for (const args of commands) {
      const result = runCli(args, { includeTestEnv: false });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('--force');
      expect(result.output).toContain('--output');
    }
  });

  it('shows json-capable read command help', () => {
    const commands = [
      ['web', 'info', 'splash-get', '--help'],
      ['web', 'menu', 'list', '--help'],
      ['web', 'donate', 'get', '--help'],
      ['web', 'auth', 'record-info-list', '--help'],
      ['web', 'auth', 'whitelist', 'download', '--help'],
    ];

    for (const args of commands) {
      const result = runCli(args, { includeTestEnv: false });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('--output');
    }
  });

  (shouldRunRealChannelTests ? it : it.skip)('runs web read commands against a temporary real channel', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Web Read Smoke');
      const id = channelId;

      const readCommands = [
        ['web', 'info', 'splash-get', '--channel-id', id, '--output', 'json'],
        ['web', 'info', 'likes-get', '--channel-ids', id, '--output', 'json'],
        ['web', 'info', 'countdown-get', '--channel-id', id, '--output', 'json'],
        ['web', 'menu', 'list', '--channel-id', id, '--output', 'json'],
        ['web', 'menu', 'tuwen-list', '--channel-id', id, '--output', 'json'],
        ['web', 'donate', 'get', '--channel-id', id, '--output', 'json'],
        ['web', 'share', 'get', '--channel-id', id, '--output', 'json'],
        ['web', 'auth', 'record-info-list', '--channel-id', id, '--output', 'json'],
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

  (shouldRunRealChannelTests ? it : it.skip)('runs web auth enroll-list and whitelist download against a temporary real channel', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Web Auth Reads');

      // enroll-list returns the enrollment audit toggle and a (possibly empty)
      // viewer list as structured JSON, even for a brand-new channel.
      const enrollPayload = parseJsonObject(
        runCliSuccess(['web', 'auth', 'enroll-list', '--channel-id', channelId, '--output', 'json']),
      );
      expect(typeof enrollPayload.auditEnabled).toBe('string');
      expect(Array.isArray(enrollPayload.list)).toBe(true);

      // whitelist download streams the whitelist template; with no --output-file
      // it writes nothing to disk and reports the byte count as JSON.
      const whitelistPayload = parseJsonObject(
        runCliSuccess(['web', 'auth', 'whitelist', 'download', '--rank', '1', '--channel-id', channelId, '--output', 'json']),
      );
      expect(whitelistPayload.success).toBe(true);
      expect(typeof whitelistPayload.bytes).toBe('number');
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 180000);
});
