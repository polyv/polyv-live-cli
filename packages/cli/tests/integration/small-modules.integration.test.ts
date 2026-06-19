import { runCli } from '../helpers/cli-runner';

describe('small module CLI integration', () => {
  it('shows help for new utility command groups', () => {
    for (const command of ['group', 'finance', 'material', 'webapp', 'robot', 'partner']) {
      const result = runCli([command, '--help'], { includeTestEnv: false });
      expect(result.exitCode).toBe(0);
    }
  });

  it('shows force options for dangerous write commands', () => {
    const commands = [
      ['group', 'resource', 'set-space', '--help'],
      ['finance', 'audio-moderation', 'update', '--help'],
      ['material', 'delete', '--help'],
      ['webapp', 'role', 'delete', '--help'],
      ['robot', 'batch-delete', '--help'],
      ['partner', 'tencent-order', 'create', '--help'],
      ['player', 'anti-record', 'update', '--help'],
      ['channel', 'ccb-focus-reset', '--help'],
    ];

    for (const args of commands) {
      const result = runCli(args, { includeTestEnv: false });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('--force');
    }
  });

  it('shows help for categorized read commands', () => {
    const commands = [
      ['player', 'watch-feedback-list', '--help'],
      ['statistics', 'session-summary-list', '--help'],
      ['monitor', 'tencent-stream-info-list', '--help'],
      ['chat', 'group-login-times', '--help'],
      ['channel', 'status-valid', '--help'],
    ];

    for (const args of commands) {
      const result = runCli(args, { includeTestEnv: false });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('--output');
    }
  });
});
