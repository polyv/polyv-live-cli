import { runCli } from '../helpers/cli-runner';

describe('viewer user CLI integration', () => {
  it('shows viewer user command help', () => {
    const checks = [
      { args: ['viewer', '--help'], text: 'lottery-wins' },
      { args: ['viewer', '--help'], text: 'import-external' },
      { args: ['viewer', 'tag', '--help'], text: 'create' },
      { args: ['viewer', 'tag', '--help'], text: 'delete' },
      { args: ['viewer', 'label', '--help'], text: 'channel-ref' },
    ];

    for (const check of checks) {
      const result = runCli(check.args, { includeTestEnv: false });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain(check.text);
    }
  });

  it('shows force and output options for viewer write commands', () => {
    const commands = [
      ['viewer', 'create', '--help'],
      ['viewer', 'update', '--help'],
      ['viewer', 'delete', '--help'],
      ['viewer', 'import-external', '--help'],
      ['viewer', 'config', 'update', '--help'],
      ['viewer', 'tag', 'create', '--help'],
      ['viewer', 'tag', 'update', '--help'],
      ['viewer', 'tag', 'delete', '--help'],
      ['viewer', 'tag', 'add', '--help'],
      ['viewer', 'tag', 'remove', '--help'],
      ['viewer', 'label', 'create', '--help'],
      ['viewer', 'label', 'update', '--help'],
      ['viewer', 'label', 'delete', '--help'],
      ['viewer', 'label', 'channel-ref', 'add', '--help'],
    ];

    for (const args of commands) {
      const result = runCli(args, { includeTestEnv: false });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('--force');
      expect(result.output).toContain('--output');
    }
  });
});
