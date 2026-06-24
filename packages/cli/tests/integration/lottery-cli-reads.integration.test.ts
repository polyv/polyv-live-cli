/**
 * @fileoverview Real-CLI integration tests for channel-scoped lottery read commands.
 *
 * The pre-existing `lottery.integration.test.ts` exercises the SDK service layer
 * directly; this file instead drives the target subcommand through the local CLI
 * entry (dist/index.js) against a freshly-created temporary channel, deleted in
 * `finally`, so it counts toward real-execution coverage.
 *
 * These read commands are exercised via `runCli`/`runCliSuccess`; the lottery
 * channel-records read returns a well-formed paginated payload (empty `contents`
 * for a channel that has never held a lottery) and never throws on empty data.
 */

import { runCli } from '../helpers/cli-runner';
import {
  createTemporaryChannel,
  deleteTemporaryChannel,
  parseJsonValue,
  runCliSuccess,
} from '../helpers/channel-fixture';
import { hasRealCredentials } from '../helpers/integration-config';

const shouldRunRealChannelTests = hasRealCredentials();

describe('lottery channel-scoped read CLI integration', () => {
  (shouldRunRealChannelTests ? it : it.skip)('lists lottery channel records for a temporary channel via real CLI', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Lottery Channel Records');

      // channel-records accepts a comma-separated channel id list and a 13-digit
      // millisecond time window. A brand-new channel has no lottery records, so
      // the read returns an empty, well-formed paginated payload.
      const now = Date.now();
      const startTime = String(now - 7 * 24 * 60 * 60 * 1000);
      const endTime = String(now);

      const output = runCliSuccess([
        'lottery',
        'channel-records',
        '--channel-ids',
        channelId,
        '--start-time',
        startTime,
        '--end-time',
        endTime,
        '--output',
        'json',
      ]);

      const payload = parseJsonValue(output) as { contents?: unknown; totalItems?: unknown };
      expect(Array.isArray(payload.contents)).toBe(true);
      expect(typeof payload.totalItems).toBe('number');
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 120000);

  // Sanity check that the CLI surface exists even without real credentials.
  it('exposes the channel-records subcommand through the real CLI entry', () => {
    const result = runCli(['lottery', 'channel-records', '--help'], {
      includeTestEnv: false,
      rejectOnError: true,
    });
    expect(result.stdout).toContain('channel-ids');
  });
});
