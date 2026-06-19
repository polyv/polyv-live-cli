import { runCli } from '../helpers/cli-runner';

describe('live interaction CLI integration', () => {
  it('shows extended live interaction command help', () => {
    const checks = [
      { args: ['checkin', '--help'], text: 'session-result' },
      { args: ['qa', '--help'], text: 'send-times' },
      { args: ['qa', '--help'], text: 'question-list' },
      { args: ['questionnaire', '--help'], text: 'legacy-list' },
      { args: ['lottery', '--help'], text: 'channel-records' },
      { args: ['interaction', '--help'], text: 'teacher-answer' },
    ];

    for (const check of checks) {
      const result = runCli(check.args, { includeTestEnv: false });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain(check.text);
    }
  });

  it('shows force options for write interaction commands', () => {
    const commands = [
      ['qa', 'add-edit', '--help'],
      ['qa', 'delete-question', '--help'],
      ['qa', 'send-result', '--help'],
      ['questionnaire', 'batch-create', '--help'],
      ['lottery', 'receive-info', '--help'],
      ['interaction', 'favor', '--help'],
      ['interaction', 'reward', '--help'],
      ['interaction', 'webhook', 'set', '--help'],
      ['interaction', 'webhook', 'delete', '--help'],
      ['interaction', 'teacher-answer', '--help'],
    ];

    for (const args of commands) {
      const result = runCli(args, { includeTestEnv: false });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('--force');
      expect(result.output).toContain('--output');
    }
  });
});
