/**
 * @fileoverview Integration tests for AI video production CLI commands.
 */

import { runCli } from '../helpers/cli-runner';
import { hasRealCredentials } from '../helpers/integration-config';

const shouldRunRealAccountTests = hasRealCredentials();

describe('AI CLI integration', () => {
  it('shows video-produce help through the real CLI entry', () => {
    const result = runCli(['ai', 'video-produce', '--help'], {
      includeTestEnv: false,
      rejectOnError: true,
    });

    expect(result.stdout).toContain('tts-voice');
    expect(result.stdout).toContain('ppt');
    expect(result.stdout).toContain('create');
  });

  it('shows digital-human help through the real CLI entry', () => {
    const result = runCli(['ai', 'digital-human', '--help'], {
      includeTestEnv: false,
      rejectOnError: true,
    });

    expect(result.stdout).toContain('list');
    expect(result.stdout).toContain('list-org');
    expect(result.stdout).toContain('set-org');
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

  (shouldRunRealAccountTests ? it : it.skip)('lists AI resources with JSON output through the real CLI', () => {
    const commands = [
      ['ai', 'digital-human', 'list', '--page', '1', '--size', '5', '-o', 'json'],
      ['ai', 'video-produce', 'tts-voice', 'list', '--page', '1', '--size', '5', '-o', 'json'],
      ['ai', 'video-produce', 'list', '--page', '1', '--size', '5', '-o', 'json'],
      ['ai', 'video-produce', 'ppt', 'list', '--page', '1', '--size', '5', '-o', 'json'],
    ];

    for (const args of commands) {
      const result = runCli(args, {
        rejectOnError: true,
        timeout: 30000,
      });

      expect(() => JSON.parse(result.stdout)).not.toThrow();
    }
  }, 120000);
});
