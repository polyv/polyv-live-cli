import { runCli } from '../helpers/cli-runner';

describe('chat CLI integration', () => {
  it('shows extended chat command groups', () => {
    const result = runCli(['chat', '--help'], { includeTestEnv: false });

    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('message');
    expect(result.output).toContain('badword');
    expect(result.output).toContain('notice');
    expect(result.output).toContain('robot');
  });

  it('shows force options for dangerous chat commands', () => {
    const commands = [
      ['chat', 'message', 'alert-special', '--help'],
      ['chat', 'badword', 'add', '--help'],
      ['chat', 'badword', 'delete', '--help'],
      ['chat', 'banned', 'ip-add', '--help'],
      ['chat', 'banned', 'delete', '--help'],
      ['chat', 'notice', 'clean', '--help'],
      ['chat', 'censor', 'update', '--help'],
      ['chat', 'role', 'admin-update', '--help'],
      ['chat', 'robot', 'setting-update', '--help'],
      ['chat', 'robot', 'pause', '--help'],
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
      ['chat', 'message', 'online-count', '--help'],
      ['chat', 'message', 'speak-list', '--help'],
      ['chat', 'badword', 'list', '--help'],
      ['chat', 'banned', 'forbid-list', '--help'],
      ['chat', 'notice', 'list', '--help'],
      ['chat', 'qa', 'list', '--help'],
      ['chat', 'role', 'teacher-get', '--help'],
      ['chat', 'robot', 'stats', '--help'],
    ];

    for (const args of commands) {
      const result = runCli(args, { includeTestEnv: false });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('--output');
    }
  });
});
