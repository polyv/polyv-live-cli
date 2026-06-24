/**
 * @fileoverview Real-CLI integration tests for three channel-scoped, reversible
 * config writes that share a "set on a throwaway temp channel, verify via the
 * matching read, let channel delete clean up" pattern:
 *
 *  - `record setting set` — sets the channel playback setting
 *    (`--playback-enabled Y --origin playback`), verified with
 *    `record setting get` which echoes `playbackEnabled`/`origin`.
 *  - `playback enabled set` — sets the channel playback switch
 *    (`--user-id <account> -c <channel> --play-back-enabled N`), verified with
 *    `playback enabled get` which returns the bare JSON string `"Y"`/`"N"`.
 *  - `watch-condition set` — sets the channel watch condition
 *    (`--rank 1 --auth-type code --enabled Y --auth-code`), verified with
 *    `watch-condition get` which returns a JSON array whose rank-1 entry echoes
 *    `authType`/`enabled`.
 *
 * All three are channel-scoped on a freshly created topclass temp channel, so
 * deleting the channel in `finally` fully reverts every change (no account-wide
 * state is touched). The pre-existing `record.integration.test.ts`,
 * `playback.integration.test.ts` and `watch-condition.integration.test.ts`
 * exercise the service SDK directly (no `runCli`) and therefore do not count as
 * real CLI coverage; real CLI coverage must live in this `-cli` file.
 */

import { runCli } from '../helpers/cli-runner';
import {
  createTemporaryChannel,
  deleteTemporaryChannel,
  parseJsonObject,
  parseJsonValue,
  runCliSuccess,
} from '../helpers/channel-fixture';
import { getAccountCredentials, hasRealCredentials } from '../helpers/integration-config';

const shouldRunRealChannelTests = hasRealCredentials();

/**
 * `playback enabled get`/`set` emit bare JSON primitives (a quoted `"Y"`/`"N"`
 * string and a bare channel-id number) rather than objects, so they cannot use
 * the brace-based `parseJsonObject`. Parse the raw trimmed output directly.
 */
function parseJsonPrimitive(output: string): unknown {
  return JSON.parse(output.trim());
}

describe('channel-scoped reversible config writes via real CLI', () => {
  (shouldRunRealChannelTests ? it : it.skip)(
    'runs record setting set, playback enabled set, and watch-condition set against a temporary real channel',
    () => {
      const credentials = getAccountCredentials();
      const userId = credentials?.userId;
      if (!userId) {
        throw new Error('POLYV_USER_ID is required for playback enabled set');
      }

      let channelId: string | undefined;

      try {
        channelId = createTemporaryChannel('Channel Config Writes');

        // --- record setting set (channel playback setting) ---
        // Requires --origin alongside --playback-enabled (the API rejects a
        // missing origin with "illegal playback origin"); --type causes an
        // "undefined error" so it is intentionally omitted.
        const recordSetOutput = runCliSuccess([
          'record',
          'setting',
          'set',
          '--channel-id',
          channelId,
          '--playback-enabled',
          'Y',
          '--origin',
          'playback',
          '--output',
          'json',
        ]);
        const recordSet = parseJsonObject(recordSetOutput) as {
          channelId?: string;
          status?: string;
          playbackEnabled?: string;
          origin?: string;
        };
        expect(String(recordSet.channelId)).toBe(channelId);
        expect(recordSet.status).toBe('success');
        expect(recordSet.playbackEnabled).toBe('Y');
        expect(recordSet.origin).toBe('playback');

        // Verify persistence via the read command.
        const recordGetOutput = runCliSuccess([
          'record',
          'setting',
          'get',
          '--channel-id',
          channelId,
          '--output',
          'json',
        ]);
        const recordGet = parseJsonObject(recordGetOutput) as {
          playbackEnabled?: string;
          origin?: string;
        };
        expect(recordGet.playbackEnabled).toBe('Y');
        expect(recordGet.origin).toBe('playback');

        // --- playback enabled set (channel playback switch) ---
        // Channel-scoped via -c; default on a fresh channel is "Y", so setting
        // "N" and observing the read flip to "N" proves it is not a no-op.
        const enabledSetOutput = runCliSuccess([
          'playback',
          'enabled',
          'set',
          '--user-id',
          userId,
          '--channel-id',
          channelId,
          '--play-back-enabled',
          'N',
          '--force',
          '--output',
          'json',
        ]);
        // The set endpoint returns the bare channel id as confirmation.
        expect(String(parseJsonPrimitive(enabledSetOutput))).toBe(channelId);

        const enabledGetOutput = runCliSuccess([
          'playback',
          'enabled',
          'get',
          '--channel-id',
          channelId,
          '--output',
          'json',
        ]);
        expect(parseJsonPrimitive(enabledGetOutput)).toBe('N');

        // --- watch-condition set (channel watch condition) ---
        // A fresh topclass channel defaults to rank 1 authType=custom/enabled=Y.
        // Setting rank 1 to a code auth-type and observing the flip proves the
        // write persisted (auth-type none/enabled N is a server-side no-op that
        // leaves the prior condition untouched, so it cannot demonstrate a
        // change).
        const wcSetOutput = runCliSuccess([
          'watch-condition',
          'set',
          '--channel-id',
          channelId,
          '--rank',
          '1',
          '--auth-type',
          'code',
          '--enabled',
          'Y',
          '--auth-code',
          'itc123',
          '--output',
          'json',
        ]);
        const wcSet = parseJsonObject(wcSetOutput) as {
          success?: boolean;
          channelId?: string;
        };
        expect(wcSet.success).toBe(true);
        expect(String(wcSet.channelId)).toBe(channelId);

        // watch-condition get returns a JSON array; find the rank-1 entry.
        const wcGetOutput = runCliSuccess([
          'watch-condition',
          'get',
          '--channel-id',
          channelId,
          '--output',
          'json',
        ]);
        const wcEntries = parseJsonValue(wcGetOutput) as Array<{
          rank?: number;
          authType?: string;
          enabled?: string;
        }>;
        const rank1 = wcEntries.find((entry) => Number(entry.rank) === 1);
        expect(rank1).toBeDefined();
        expect(rank1?.authType).toBe('code');
        expect(rank1?.enabled).toBe('Y');
      } finally {
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    180000,
  );

  // Sanity check that the CLI surface exists even without real credentials.
  it('exposes the channel-scoped config write subcommands through the real CLI entry', () => {
    const checks: Array<[string[], string]> = [
      [['record', 'setting', 'set', '--help'], '--playback-enabled'],
      [['playback', 'enabled', 'set', '--help'], '--play-back-enabled'],
      [['watch-condition', 'set', '--help'], '--auth-type'],
    ];

    for (const [args, marker] of checks) {
      const result = runCli(args, { includeTestEnv: false, rejectOnError: true });
      expect(result.stdout).toContain(marker);
    }
  });
});
