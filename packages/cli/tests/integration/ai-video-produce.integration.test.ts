/**
 * @fileoverview Integration tests for AI video production CLI commands.
 */

import { runCli } from '../helpers/cli-runner';
import { hasRealCredentials } from '../helpers/integration-config';

describe('AI video production CLI integration', () => {
  it('shows video-produce help through the real CLI entry', () => {
    const result = runCli(['ai', 'video-produce', '--help'], {
      includeTestEnv: false,
      rejectOnError: true,
    });

    expect(result.stdout).toContain('tts-voice');
    expect(result.stdout).toContain('ppt');
    expect(result.stdout).toContain('create');
  });

  it('requires --force for create in non-interactive mode', () => {
    const tasks = JSON.stringify([{ videoName: 'demo' }]);
    const result = runCli(['ai', 'video-produce', 'create', '--tasks', tasks], {
      includeTestEnv: false,
      env: {
        POLYV_APP_ID: 'testapp0123456789',
        POLYV_APP_SECRET: '1234567890abcdef1234567890abcdef',
      },
    });

    expect(result.exitCode).not.toBe(0);
    expect(result.output).toContain('Interactive confirmation not available');
  });

  (hasRealCredentials() ? it : it.skip)('lists TTS voices with JSON output through the real CLI', () => {
    const result = runCli(['ai', 'video-produce', 'tts-voice', 'list', '--page', '1', '--size', '5', '-o', 'json'], {
      rejectOnError: true,
      timeout: 30000,
    });

    expect(() => JSON.parse(result.stdout)).not.toThrow();
  }, 30000);
});
