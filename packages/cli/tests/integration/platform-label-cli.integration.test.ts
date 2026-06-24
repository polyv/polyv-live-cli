/**
 * @fileoverview Real-CLI integration tests for the `platform label` write
 * subcommands (create / update / delete).
 *
 * `platform label` is an account-scoped viewer-label CRUD lifecycle. The
 * `create` response surfaces the new numeric label id directly
 * (`{ labelId, labelName }`), so no list-and-discover step is needed; update
 * and delete echo `{ success: true }`.
 *
 * The existing `platform-label.integration.test.ts` drives PlatformLabelServiceSdk
 * directly (service-layer), so it does not count as real CLI execution coverage.
 * This file exercises the local CLI entry (`polyv-live-cli platform label ...`)
 * end-to-end so the create/update/delete leaf commands count as real-execution
 * integration coverage.
 *
 * The test runs a create -> update -> delete loop through the real CLI and cleans
 * up the created label (plus the temporary channel) in `finally`. Per the
 * integration-test convention, a temporary channel is still created as the real
 * test asset even though these commands are account-scoped and take no channel-id.
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

describe('platform label CLI write lifecycle integration', () => {
  (shouldRunRealChannelTests ? it : it.skip)(
    'runs the platform label create -> update -> delete lifecycle via real CLI',
    () => {
      let channelId: string | undefined;
      let labelId: number | undefined;

      try {
        // Account-scoped writes; the temporary channel is the real test asset.
        channelId = createTemporaryChannel('Platform Label Lifecycle');
        const labelName = `polyv-it-plbl-${Date.now()}`;
        const renamed = `${labelName}-up`;

        // create surfaces the numeric label id directly in labelId.
        const createOutput = runCliSuccess([
          'platform',
          'label',
          'create',
          '--name',
          labelName,
          '--output',
          'json',
        ]);
        const created = parseJsonObject(createOutput) as {
          labelId?: number;
          labelName?: string;
        };
        labelId = Number(created.labelId);
        expect(Number.isInteger(labelId) && labelId > 0).toBe(true);
        expect(String(created.labelName)).toBe(labelName);

        // update renames the label and reports success.
        const updateOutput = runCliSuccess([
          'platform',
          'label',
          'update',
          '--id',
          String(labelId),
          '--name',
          renamed,
          '--output',
          'json',
        ]);
        const updated = parseJsonObject(updateOutput) as { success?: boolean };
        expect(updated.success).toBe(true);

        // delete closes the create->update->delete loop.
        const deleteOutput = runCliSuccess([
          'platform',
          'label',
          'delete',
          '--id',
          String(labelId),
          '--output',
          'json',
        ]);
        const deleted = parseJsonObject(deleteOutput) as { success?: boolean };
        expect(deleted.success).toBe(true);
        labelId = undefined;
      } finally {
        if (labelId !== undefined) {
          // Safety-net cleanup if a step failed mid-lifecycle.
          try {
            runCliSuccess([
              'platform',
              'label',
              'delete',
              '--id',
              String(labelId),
              '--output',
              'json',
            ]);
          } catch {
            // Best-effort; the label may already be gone.
          }
        }
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    180000,
  );

  // Sanity check that the CLI surface exists even without real credentials.
  it('exposes the platform label write subcommands through the real CLI entry', () => {
    const checks: Array<[string[], string]> = [
      [['platform', 'label', 'create', '--help'], '--name'],
      [['platform', 'label', 'update', '--help'], '--id'],
      [['platform', 'label', 'delete', '--help'], '--id'],
    ];

    for (const [args, marker] of checks) {
      const result = runCli(args, { includeTestEnv: false, rejectOnError: true });
      expect(result.stdout).toContain(marker);
    }
  });
});
