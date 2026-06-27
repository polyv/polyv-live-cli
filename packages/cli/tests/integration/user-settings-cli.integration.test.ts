import { runCli } from '../helpers/cli-runner';
import {
  createTemporaryChannel,
  deleteTemporaryChannel,
  parseJsonObject,
  runCliSuccess,
} from '../helpers/channel-fixture';
import { hasRealCredentials } from '../helpers/integration-config';

const shouldRunRealAccountTests = hasRealCredentials();

describe('user settings CLI integration', () => {
  it('shows user settings command help', () => {
    const checks = [
      { args: ['user', '--help'], text: 'child' },
      { args: ['user', 'child', '--help'], text: 'roles' },
      { args: ['user', 'org', '--help'], text: 'create' },
      { args: ['user', 'template', '--help'], text: 'audio-moderation' },
      { args: ['user', 'setting', '--help'], text: 'pv-show' },
      { args: ['user', 'bill', '--help'], text: 'use-detail' },
      { args: ['user', 'viewlog', '--help'], text: 'detail' },
      { args: ['user', 'mr-concurrency', '--help'], text: 'detail' },
    ];

    for (const check of checks) {
      const result = runCli(check.args, { includeTestEnv: false });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain(check.text);
    }
  });

  it('shows force and output options for user setting write commands', () => {
    const commands = [
      ['user', 'child', 'create', '--help'],
      ['user', 'child', 'update', '--help'],
      ['user', 'child', 'delete', '--help'],
      ['user', 'org', 'create', '--help'],
      ['user', 'org', 'delete', '--help'],
      ['user', 'template', 'donate', 'update', '--help'],
      ['user', 'template', 'marquee', 'update', '--help'],
      ['user', 'template', 'role-config', 'update', '--help'],
      ['user', 'template', 'playback', 'update', '--help'],
      ['user', 'template', 'audio-moderation', 'update', '--help'],
      ['user', 'template', 'video-moderation', 'update', '--help'],
      ['user', 'setting', 'footer', 'update', '--help'],
      ['user', 'setting', 'pv-show', 'update', '--help'],
      ['user', 'sms-send', '--help'],
    ];

    for (const args of commands) {
      const result = runCli(args, { includeTestEnv: false });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('--force');
      expect(result.output).toContain('--output');
    }
  });

  (shouldRunRealAccountTests ? it : it.skip)('runs user setting read commands through the real CLI', () => {
    const readCommands = [
      ['user', 'child', 'list', '--page', '1', '--size', '5', '--output', 'json'],
      ['user', 'org', 'list', '--output', 'json'],
    ];

    for (const args of readCommands) {
      runCliSuccess(args);
    }
  }, 120000);

  // `user setting pv-show update` toggles the account-level PV-display switch
  // through the real CLI. The endpoint accepts the request and echoes
  // {success:true, enabled:<Y|N>}, but on this account the write is a server
  // no-op: `pv-show get` keeps returning the same value regardless of the
  // submitted flag. That no-op makes the write *safe* (nothing to restore)
  // while still being a real API execution worth covering. We capture the
  // original value, flip it, assert the structured {success,enabled} payload,
  // and defensively restore the original in `finally`. Per the integration
  // convention a throwaway temp channel is created (and deleted) even though
  // this account-scoped command takes no channel id.
  (shouldRunRealAccountTests ? it : it.skip)(
    'runs user setting pv-show update through the real CLI (server no-op)',
    () => {
      let channelId: string | undefined;

      try {
        channelId = createTemporaryChannel('User PvShow Update');

        const readEnabled = () =>
          (
            parseJsonObject(
              runCliSuccess(['user', 'setting', 'pv-show', 'get', '--output', 'json']),
            ) as { enabled: string }
          ).enabled;

        const original = readEnabled();
        const flipped = original === 'Y' ? 'N' : 'Y';

        const payload = parseJsonObject(
          runCliSuccess([
            'user',
            'setting',
            'pv-show',
            'update',
            '--enabled',
            flipped,
            '--force',
            '--output',
            'json',
          ]),
        );
        expect(payload.success).toBe(true);
        expect(payload.enabled).toBe(flipped);

        // The write is a server no-op on this account; defensively restore the
        // original value (the restore call itself is a no-op but keeps the
        // account in its discovered state).
        runCliSuccess([
          'user',
          'setting',
          'pv-show',
          'update',
          '--enabled',
          original,
          '--force',
          '--output',
          'json',
        ]);
      } finally {
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    120000,
  );

  // `user sms-send` posts to the real V4 SMS endpoint through the CLI. On this
  // account SMS is disabled entirely, so the server returns a deterministic
  // `短信功能未启用` (SMS feature not enabled) account-feature gate before any
  // SMS can be dispatched — the same pre-side-effect gate pattern as the group
  // (`找不到集团账号`) and finance (`账号未开启审核功能`) families. This makes
  // the write safe: no SMS is ever sent, regardless of the phone number. We
  // additionally pass a structurally-illegal phone number (`12345`, only 5
  // digits — Chinese mobile numbers are 11 digits) as belt-and-suspenders: even
  // in the hypothetical that SMS were enabled, the documented per-phone status
  // would be -2 (send failed: illegal number) with `serialNo: null`, i.e. still
  // no SMS dispatched. No real SMS can be sent under any account state. Per the
  // integration convention a throwaway temp channel is created (and deleted)
  // even though this account-scoped command takes no channel id.
  (shouldRunRealAccountTests ? it : it.skip)(
    'runs user sms-send through the real CLI (account SMS-disabled gate)',
    () => {
      let channelId: string | undefined;

      try {
        channelId = createTemporaryChannel('User SmsSend Gate');

        const result = runCli(
          [
            'user',
            'sms-send',
            '--phone-numbers',
            '12345',
            '--template-param-names',
            'code',
            '--template-param-values',
            '000000',
            '--force',
            '--output',
            'json',
          ],
          { includeTestEnv: true },
        );

        // Account has SMS disabled → deterministic pre-dispatch gate; no SMS
        // is sent (the illegal number also guarantees this even if enabled).
        expect(result.exitCode).toBe(1);
        expect(result.output).toContain('短信功能未启用');
      } finally {
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    120000,
  );
});
