/**
 * @fileoverview Real-CLI integration tests for the `playback` read subcommands.
 *
 * Each target is exercised through the local CLI entry (dist/index.js). The
 * existing packages/cli/tests/integration/playback.integration.test.ts is a
 * service-layer test (0 runCli calls), so it does not count toward real CLI
 * coverage; real coverage lives here.
 *
 * `playback get` on a freshly-created (never-broadcast) channel resolves a
 * non-existent video-id to the displayInfo line "未找到回放视频" with exit 0
 * (empty-data info-line pattern, same as statistics view / donate list /
 * lottery winners), so we assert on exit code + output content rather than
 * parsing JSON.
 */

import { runCli } from '../helpers/cli-runner';
import {
  createTemporaryChannel,
  deleteTemporaryChannel,
} from '../helpers/channel-fixture';
import { hasRealCredentials } from '../helpers/integration-config';

const shouldRunRealChannelTests = hasRealCredentials();

describe('playback CLI integration (channel-scoped reads)', () => {
  (shouldRunRealChannelTests ? it : it.skip)('gets a single playback video via real CLI (empty-data path)', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Playback Get');

      // A freshly-created channel has never broadcast, so any video-id resolves
      // to the "未找到回放视频" displayInfo line with exit 0 (non-JSON empty-data
      // output, same pattern as statistics view / donate list / lottery winners).
      const result = runCli([
        'playback',
        'get',
        '-c',
        channelId,
        '--video-id',
        'it-nonexistent-video-id',
        '--output',
        'json',
      ]);

      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('未找到回放视频');
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 120000);

  // Sanity check that the CLI surface exists even without real credentials.
  it('exposes the playback get read through the real CLI entry', () => {
    const result = runCli(['playback', 'get', '--help'], { includeTestEnv: false });
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('video-id');
  });
});
