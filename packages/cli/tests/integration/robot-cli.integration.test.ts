/**
 * @fileoverview Real-CLI integration tests for global robot CRUD subcommands.
 *
 * An account-scoped create -> list -> delete lifecycle executed through the
 * local CLI entry:
 *
 *  - `robot batch-save --robots <json>` creates global virtual-nickname robots.
 *    The /live/v4/global/robot/save-batch endpoint returns no data (the handler
 *    prints `null`), so creation is verified by re-listing and matching the
 *    unique robot name (same list-by-keyword pattern used by material label).
 *  - `robot list` returns `{ contents: [{ id, name, avatar, ... }], ... }`.
 *  - `robot batch-delete --ids <ids>` returns `{ success: true, ids: [...] }`.
 *
 * `robot batch-save` is account-scoped (global robots, no channel-id required);
 * per the integration-test convention a temporary channel is still created as
 * the real test asset and deleted in `finally`. The created robot is deleted in
 * `finally` (and verified gone) so the account robot table is not polluted.
 */

import { runCli } from '../helpers/cli-runner';
import {
  createTemporaryChannel,
  deleteTemporaryChannel,
  parseJsonObject,
  parseJsonValue,
  runCliSuccess,
} from '../helpers/channel-fixture';
import { hasRealCredentials } from '../helpers/integration-config';

const shouldRunRealChannelTests = hasRealCredentials();

describe('robot CLI batch-save -> list -> delete lifecycle integration', () => {
  (shouldRunRealChannelTests ? it : it.skip)(
    'runs the robot batch-save -> list -> batch-delete lifecycle via real CLI',
    () => {
      let channelId: string | undefined;
      let robotId: string | undefined;

      try {
        channelId = createTemporaryChannel('Robot CRUD Lifecycle');
        // Robot names are capped at 20 chars and must not contain emoji.
        const robotName = `gnhf-robot-${String(Date.now()).slice(-8)}`;

        // batch-save: creates the robot. Endpoint returns no data (handler prints
        // `null`), so we assert exit-code success and verify creation via list.
        // The robots JSON is precomputed so the CLI arg array stays bracket-free
        // (the coverage report's array matcher skips arrays with nested []).
        const robotsJson = JSON.stringify([{ name: robotName }]);
        runCliSuccess([
          'robot',
          'batch-save',
          '--robots',
          robotsJson,
          '--force',
          '--output',
          'json',
        ]);

        // list: discover the freshly-created robot's id by matching the name.
        const listOutput = runCliSuccess([
          'robot',
          'list',
          '--page-number',
          '1',
          '--page-size',
          '200',
          '--output',
          'json',
        ]);
        const listed = parseJsonObject(listOutput);
        const contents = (listed.contents as Array<Record<string, unknown>>) ?? [];
        const found = contents.find((robot) => String(robot.name) === robotName);
        expect(found).toBeDefined();
        robotId = String(found?.id);
        expect(robotId).toMatch(/^\d+$/);

        // batch-delete: removes the robot and echoes the id.
        const deleteOutput = runCliSuccess([
          'robot',
          'batch-delete',
          '--ids',
          robotId,
          '--force',
          '--output',
          'json',
        ]);
        const deleted = parseJsonObject(deleteOutput);
        expect(deleted.success).toBe(true);
        expect(deleted.ids).toEqual([Number(robotId)]);

        // Verify the robot is gone from the account.
        const afterListOutput = runCliSuccess([
          'robot',
          'list',
          '--page-number',
          '1',
          '--page-size',
          '200',
          '--output',
          'json',
        ]);
        const afterListed = parseJsonValue(afterListOutput) as Record<string, unknown>;
        const afterContents = (afterListed.contents as Array<Record<string, unknown>>) ?? [];
        expect(afterContents.some((robot) => String(robot.name) === robotName)).toBe(false);

        // Mark cleared so finally does not retry.
        robotId = undefined;
      } finally {
        // Best-effort robot cleanup if the test failed before delete.
        if (robotId) {
          try {
            runCliSuccess([
              'robot',
              'batch-delete',
              '--ids',
              robotId,
              '--force',
              '--output',
              'json',
            ]);
          } catch {
            // ignore — best-effort cleanup.
          }
        }

        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    120000,
  );

  // Command-surface checks (no credentials required, always run).
  it('exposes robot batch-save / list / batch-delete commands', () => {
    const commands = [
      ['robot', 'batch-save', '--help'],
      ['robot', 'list', '--help'],
      ['robot', 'batch-delete', '--help'],
    ];
    for (const args of commands) {
      const result = runCli(args, { timeout: 15000 });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('Usage:');
    }
  });
});
