/**
 * @fileoverview Real-CLI integration tests for material label write subcommands.
 *
 * The material-label family (create/update/delete) is an account-scoped CRUD
 * lifecycle. `create` only returns `{ success: true }` (the label id is not
 * surfaced), so the test lists labels by a unique keyword to discover the id,
 * then exercises update and delete against it. The label is deleted in the flow
 * and again in `finally` as a safety net.
 *
 * Per the integration-test convention, every test still creates (and deletes) a
 * temporary channel as the real test asset, even though these commands are
 * account-scoped and do not take a channel-id.
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

function findLabelIdByName(output: string, name: string): number {
  const payload = parseJsonObject(output) as {
    contents?: Array<{ id?: number; name?: string }>;
  };
  const match = (payload.contents || []).find((label) => label.name === name);
  if (!match || typeof match.id !== 'number') {
    throw new Error(`Cannot find material label "${name}" in CLI output:\n${output}`);
  }

  return match.id;
}

describe('material label CLI write lifecycle integration', () => {
  (shouldRunRealChannelTests ? it : it.skip)('runs material delete via real CLI with a non-existent material id', () => {
    let channelId: string | undefined;

    try {
      // Account-scoped write; the temporary channel is the real test asset.
      channelId = createTemporaryChannel('Material Delete Probe');
      const materialId = `polyv-it-missing-material-${Date.now()}`;

      const result = runCli([
        'material',
        'delete',
        '--material-ids',
        materialId,
        '--delete-completely',
        'N',
        '--allow-partial-delete',
        'Y',
        '--force',
        '--output',
        'json',
      ], { timeout: 60000 });

      if (result.exitCode !== 0) {
        expect(result.output).toContain('素材不存在');
        return;
      }

      const payload = parseJsonObject(result.output) as {
        failedMaterialIds?: unknown;
      };
      expect(Array.isArray(payload.failedMaterialIds)).toBe(true);
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 120000);

  (shouldRunRealChannelTests ? it : it.skip)('runs the material label create -> update -> delete lifecycle via real CLI', () => {
    let channelId: string | undefined;
    let labelId: number | undefined;

    try {
      // Account-scoped writes; the temporary channel is the real test asset.
      channelId = createTemporaryChannel('Material Label Lifecycle');
      const uniqueName = `polyv-it-label-${Date.now()}`;
      const renamed = `${uniqueName}-renamed`;

      // create only surfaces { success: true }; the id must be discovered via list.
      const createOutput = runCliSuccess([
        'material',
        'label',
        'create',
        '--name',
        uniqueName,
        '--force',
        '--output',
        'json',
      ]);
      expect(parseJsonObject(createOutput)).toEqual({ success: true });

      const listOutput = runCliSuccess([
        'material',
        'label',
        'list',
        '--page-number',
        '1',
        '--page-size',
        '50',
        '--keyword',
        uniqueName,
        '--output',
        'json',
      ]);
      labelId = findLabelIdByName(listOutput, uniqueName);

      // update renames the discovered label.
      const updateOutput = runCliSuccess([
        'material',
        'label',
        'update',
        '--id',
        String(labelId),
        '--name',
        renamed,
        '--force',
        '--output',
        'json',
      ]);
      expect(parseJsonObject(updateOutput)).toEqual({ success: true });

      // delete removes the label, closing the create->update->delete loop.
      const deleteOutput = runCliSuccess([
        'material',
        'label',
        'delete',
        '--id',
        String(labelId),
        '--force',
        '--output',
        'json',
      ]);
      expect(parseJsonObject(deleteOutput)).toEqual({ success: true });
      labelId = undefined;
    } finally {
      if (labelId !== undefined) {
        // Safety-net cleanup if a step failed mid-lifecycle.
        try {
          runCliSuccess([
            'material',
            'label',
            'delete',
            '--id',
            String(labelId),
            '--force',
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
  }, 180000);

  // Sanity check that the CLI surface exists even without real credentials.
  it('exposes the material label write subcommands through the real CLI entry', () => {
    const checks: Array<[string[], string]> = [
      [['material', 'label', 'create', '--help'], '--name'],
      [['material', 'label', 'update', '--help'], '--id'],
      [['material', 'label', 'delete', '--help'], '--id'],
    ];

    for (const [args, marker] of checks) {
      const result = runCli(args, { includeTestEnv: false, rejectOnError: true });
      expect(result.stdout).toContain(marker);
    }
  });
});
