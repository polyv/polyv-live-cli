import { runCli } from '../helpers/cli-runner';

describe('user business CLI integration', () => {
  it('shows product library, tag, and order help', () => {
    const checks = [
      { args: ['product', '--help'], text: 'library' },
      { args: ['product', 'library', '--help'], text: 'create' },
      { args: ['product', 'tag', '--help'], text: 'delete' },
      { args: ['product', 'order', '--help'], text: 'batch-status' },
    ];

    for (const check of checks) {
      const result = runCli(check.args, { includeTestEnv: false });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain(check.text);
    }
  });

  it('shows invite-sales and custom-field help', () => {
    const checks = [
      { args: ['invite-sales', '--help'], text: 'follow-viewer' },
      { args: ['invite-sales', 'follow-viewer', '--help'], text: 'list' },
      { args: ['custom-field', '--help'], text: 'value' },
      { args: ['custom-field', 'value', '--help'], text: 'save' },
    ];

    for (const check of checks) {
      const result = runCli(check.args, { includeTestEnv: false });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain(check.text);
    }
  });

  it('shows force and output options for user business write commands', () => {
    const commands = [
      ['product', 'library', 'create', '--help'],
      ['product', 'library', 'update', '--help'],
      ['product', 'library', 'delete', '--help'],
      ['product', 'tag', 'create', '--help'],
      ['product', 'tag', 'update', '--help'],
      ['product', 'tag', 'delete', '--help'],
      ['product', 'order', 'batch-status', '--help'],
      ['invite-sales', 'add', '--help'],
      ['invite-sales', 'update', '--help'],
      ['invite-sales', 'remove', '--help'],
      ['custom-field', 'add', '--help'],
      ['custom-field', 'value', 'save', '--help'],
    ];

    for (const args of commands) {
      const result = runCli(args, { includeTestEnv: false });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('--force');
      expect(result.output).toContain('--output');
    }
  });
});
