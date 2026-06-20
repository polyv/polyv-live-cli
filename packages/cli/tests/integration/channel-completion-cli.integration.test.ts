import { runCli } from '../helpers/cli-runner';

describe('channel completion CLI integration', () => {
  it('shows playback, document, session, and record completion command help', () => {
    const checks = [
      { args: ['playback', 'setting-list', '--help'], text: '--channel-ids' },
      { args: ['playback', 'subtitle', 'update-batch', '--help'], text: '--body-json' },
      { args: ['document', 'media', 'link', '--help'], text: '--force' },
      { args: ['session', 'external', 'relevance', '--help'], text: '--external-session-id' },
      { args: ['record', 'file', 'convert', '--help'], text: '--user-id' },
      { args: ['record', 'outline', 'create', '--help'], text: '--sync-to-playback-dot-enabled' },
    ];

    for (const check of checks) {
      const result = runCli(check.args, { includeTestEnv: false });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain(check.text);
    }
  });
});
