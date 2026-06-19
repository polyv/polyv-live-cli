import { runCli } from '../helpers/cli-runner';

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
});
