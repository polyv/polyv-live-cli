import { runCli } from '../helpers/cli-runner';
import { runCliSuccess } from '../helpers/channel-fixture';
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
});
