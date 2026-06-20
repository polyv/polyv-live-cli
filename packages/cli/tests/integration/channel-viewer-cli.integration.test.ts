import { runCli } from '../helpers/cli-runner';

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
});
