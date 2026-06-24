/**
 * @fileoverview Real-CLI integration tests for whitelist write subcommands.
 *
 * A single channel-scoped CRUD lifecycle executed through the local CLI entry:
 *
 *  - `whitelist add` returns `{ success, message, code, channelId }`.
 *  - `whitelist update` returns `{ success, message, oldCode, newCode, channelId }`.
 *  - `whitelist remove` returns `{ success, message, codes, clear, channelId }`.
 *
 * `whitelist list` (already covered) is used as a verification read between each
 * write so the lifecycle asserts the actual server-side state change, not just
 * exit codes. The whitelist is rank-scoped (1 = 主要条件 / 2 = 次要条件) and
 * works on a freshly created topclass channel without needing any account
 * feature gate. The temporary channel is created as the real test asset and
 * deleted in `finally`; deleting the channel also clears its whitelist.
 *
 * NOTE: packages/cli/tests/integration/whitelist.integration.test.ts drives the
 * SDK service layer directly (WhitelistServiceSdk, 0 runCli calls) and so does
 * NOT count toward real-CLI coverage — this file is the real-CLI counterpart.
 */

import { runCli } from '../helpers/cli-runner';
import {
  createTemporaryChannel,
  deleteTemporaryChannel,
  parseJsonObject,
  runCliSuccess,
} from '../helpers/channel-fixture';
import { hasRealCredentials } from '../helpers/integration-config';

const shouldRunRealChannelTests = hasRealCredentials();

describe('whitelist CLI write lifecycle integration', () => {
  (shouldRunRealChannelTests ? it : it.skip)(
    'runs the whitelist add -> update -> remove lifecycle via real CLI',
    () => {
      let channelId: string | undefined;

      try {
        channelId = createTemporaryChannel('Whitelist Lifecycle');
        const ts = Date.now();
        const oldCode = `wl-add-${ts}`;
        const newCode = `wl-upd-${ts}`;

        // add: inserts a rank-1 whitelist entry scoped to the temp channel.
        const addOutput = runCliSuccess([
          'whitelist',
          'add',
          '--channel-id',
          channelId,
          '--rank',
          '1',
          '--code',
          oldCode,
          '--name',
          'WlAdd',
          '--output',
          'json',
        ]);
        const added = parseJsonObject(addOutput);
        expect(added.success).toBe(true);
        expect(String(added.code)).toBe(oldCode);
        expect(String(added.channelId)).toBe(channelId);

        // verify via list that the entry landed.
        const listAfterAdd = parseJsonObject(
          runCliSuccess([
            'whitelist',
            'list',
            '--channel-id',
            channelId,
            '--rank',
            '1',
            '--output',
            'json',
          ]),
        );
        const contentsAfterAdd = listAfterAdd.contents as Array<{
          phone: string;
          name?: string;
        }>;
        expect(Array.isArray(contentsAfterAdd)).toBe(true);
        expect(contentsAfterAdd.some((c) => c.phone === oldCode)).toBe(true);

        // update: renames the member code from oldCode -> newCode.
        const updateOutput = runCliSuccess([
          'whitelist',
          'update',
          '--channel-id',
          channelId,
          '--rank',
          '1',
          '--old-code',
          oldCode,
          '--code',
          newCode,
          '--name',
          'WlUpdated',
          '--output',
          'json',
        ]);
        const updated = parseJsonObject(updateOutput);
        expect(updated.success).toBe(true);
        expect(String(updated.oldCode)).toBe(oldCode);
        expect(String(updated.newCode)).toBe(newCode);

        // verify via list that oldCode is gone and newCode is present.
        const listAfterUpdate = parseJsonObject(
          runCliSuccess([
            'whitelist',
            'list',
            '--channel-id',
            channelId,
            '--rank',
            '1',
            '--output',
            'json',
          ]),
        );
        const contentsAfterUpdate = listAfterUpdate.contents as Array<{
          phone: string;
        }>;
        expect(contentsAfterUpdate.some((c) => c.phone === newCode)).toBe(true);
        expect(contentsAfterUpdate.some((c) => c.phone === oldCode)).toBe(false);

        // remove: deletes the renamed entry (single code per API limit).
        const removeOutput = runCliSuccess([
          'whitelist',
          'remove',
          '--channel-id',
          channelId,
          '--rank',
          '1',
          '--codes',
          newCode,
          '--output',
          'json',
        ]);
        const removed = parseJsonObject(removeOutput);
        expect(removed.success).toBe(true);
        expect(String(removed.codes)).toBe(newCode);
        expect(removed.clear).toBe(false);

        // verify via list that the whitelist is empty again.
        const listAfterRemove = parseJsonObject(
          runCliSuccess([
            'whitelist',
            'list',
            '--channel-id',
            channelId,
            '--rank',
            '1',
            '--output',
            'json',
          ]),
        );
        expect(Array.isArray(listAfterRemove.contents)).toBe(true);
        expect((listAfterRemove.contents as unknown[]).length).toBe(0);
      } finally {
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
  );

  // Command-surface checks run unconditionally (no real credentials needed).
  it('exposes the whitelist write subcommands via --help', () => {
    const checks: Array<{ args: string[]; text: string }> = [
      { args: ['whitelist', 'add', '--help'], text: '--code' },
      { args: ['whitelist', 'update', '--help'], text: '--old-code' },
      { args: ['whitelist', 'remove', '--help'], text: '--codes' },
    ];

    for (const check of checks) {
      const result = runCli(check.args, { includeTestEnv: false });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain(check.text);
    }
  });
});
