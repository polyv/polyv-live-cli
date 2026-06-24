/**
 * @fileoverview Real-CLI integration tests for viewer tag and viewer label
 * write subcommands.
 *
 * Both families are account-scoped CRUD lifecycles that surface the created id
 * directly in the `create` response (no list-and-discover step needed):
 *
 *  - `viewer tag` (PolyV "viewer-label" tags): create returns
 *    `{ success, data: [{ id, label }] }` with a numeric id; update/delete echo
 *    `{ success, data: { id, ... } }`.
 *  - `viewer label` (account labels): create returns
 *    `{ success, data: { id, name } }` with a string id; update/delete echo
 *    `{ success, data: { labelId, labelName } }`.
 *
 * Each test runs a create -> update -> delete loop through the real CLI entry
 * and cleans up the created tag/label (plus the temporary channel) in
 * `finally`. Per the integration-test convention, a temporary channel is still
 * created as the real test asset even though these commands are account-scoped
 * and do not take a channel-id.
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

/** Account-label names are capped at 8 characters — derive a unique short name. */
function uniqueAccountLabelName(prefix: string): string {
  // Date.now() ms timestamp; take the last 7 digits and prefix to stay <= 8 chars.
  const stamp = String(Date.now()).slice(-7);
  return `${prefix}${stamp}`.slice(0, 8);
}

describe('viewer tag & label CLI write lifecycle integration', () => {
  (shouldRunRealChannelTests ? it : it.skip)(
    'runs the viewer tag create -> update -> delete lifecycle via real CLI',
    () => {
      let channelId: string | undefined;
      let tagId: number | undefined;

      try {
        // Account-scoped writes; the temporary channel is the real test asset.
        channelId = createTemporaryChannel('Viewer Tag Lifecycle');
        const tagName = `polyv-it-vtag-${Date.now()}`;
        const renamed = `${tagName}-renamed`;

        // create surfaces the numeric tag id directly in data[0].id.
        const createOutput = runCliSuccess([
          'viewer',
          'tag',
          'create',
          '--labels',
          tagName,
          '--force',
          '--output',
          'json',
        ]);
        const created = parseJsonObject(createOutput) as {
          success?: boolean;
          data?: Array<{ id?: number; label?: string }>;
        };
        expect(created.success).toBe(true);
        const createdTag = (created.data || [])[0];
        tagId = Number(createdTag?.id);
        expect(Number.isInteger(tagId) && tagId > 0).toBe(true);

        // update renames the tag and echoes the id.
        const updateOutput = runCliSuccess([
          'viewer',
          'tag',
          'update',
          '--id',
          String(tagId),
          '--label',
          renamed,
          '--force',
          '--output',
          'json',
        ]);
        const updated = parseJsonObject(updateOutput) as {
          success?: boolean;
          data?: { id?: number; label?: string };
        };
        expect(updated.success).toBe(true);
        expect(Number(updated.data?.id)).toBe(tagId);

        // delete closes the create->update->delete loop.
        const deleteOutput = runCliSuccess([
          'viewer',
          'tag',
          'delete',
          '--id',
          String(tagId),
          '--force',
          '--output',
          'json',
        ]);
        const deleted = parseJsonObject(deleteOutput) as {
          success?: boolean;
          data?: { id?: number };
        };
        expect(deleted.success).toBe(true);
        expect(Number(deleted.data?.id)).toBe(tagId);
        tagId = undefined;
      } finally {
        if (tagId !== undefined) {
          // Safety-net cleanup if a step failed mid-lifecycle.
          try {
            runCliSuccess([
              'viewer',
              'tag',
              'delete',
              '--id',
              String(tagId),
              '--force',
              '--output',
              'json',
            ]);
          } catch {
            // Best-effort; the tag may already be gone.
          }
        }
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    180000,
  );

  (shouldRunRealChannelTests ? it : it.skip)(
    'runs the viewer label create -> update -> delete lifecycle via real CLI',
    () => {
      let channelId: string | undefined;
      let labelId: string | undefined;

      try {
        // Account-scoped writes; the temporary channel is the real test asset.
        channelId = createTemporaryChannel('Viewer Label Lifecycle');
        const labelName = uniqueAccountLabelName('it');
        const renamed = uniqueAccountLabelName('up');

        // create surfaces the string label id directly in data.id.
        const createOutput = runCliSuccess([
          'viewer',
          'label',
          'create',
          '--label-name',
          labelName,
          '--force',
          '--output',
          'json',
        ]);
        const created = parseJsonObject(createOutput) as {
          success?: boolean;
          data?: { id?: string; name?: string };
        };
        expect(created.success).toBe(true);
        labelId = String(created.data?.id || '');
        expect(labelId.length).toBeGreaterThan(0);

        // update renames the account label and echoes the labelId.
        const updateOutput = runCliSuccess([
          'viewer',
          'label',
          'update',
          '--label-id',
          labelId,
          '--label-name',
          renamed,
          '--force',
          '--output',
          'json',
        ]);
        const updated = parseJsonObject(updateOutput) as {
          success?: boolean;
          data?: { labelId?: string; labelName?: string };
        };
        expect(updated.success).toBe(true);
        expect(String(updated.data?.labelId)).toBe(labelId);

        // delete closes the create->update->delete loop.
        const deleteOutput = runCliSuccess([
          'viewer',
          'label',
          'delete',
          '--label-id',
          labelId,
          '--force',
          '--output',
          'json',
        ]);
        const deleted = parseJsonObject(deleteOutput) as {
          success?: boolean;
          data?: { labelId?: string };
        };
        expect(deleted.success).toBe(true);
        expect(String(deleted.data?.labelId)).toBe(labelId);
        labelId = undefined;
      } finally {
        if (labelId) {
          // Safety-net cleanup if a step failed mid-lifecycle.
          try {
            runCliSuccess([
              'viewer',
              'label',
              'delete',
              '--label-id',
              labelId,
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
    },
    180000,
  );

  // Sanity check that the CLI surface exists even without real credentials.
  it('exposes the viewer tag & label write subcommands through the real CLI entry', () => {
    const checks: Array<[string[], string]> = [
      [['viewer', 'tag', 'create', '--help'], '--labels'],
      [['viewer', 'tag', 'update', '--help'], '--id'],
      [['viewer', 'tag', 'delete', '--help'], '--id'],
      [['viewer', 'label', 'create', '--help'], '--label-name'],
      [['viewer', 'label', 'update', '--help'], '--label-id'],
      [['viewer', 'label', 'delete', '--help'], '--label-id'],
    ];

    for (const [args, marker] of checks) {
      const result = runCli(args, { includeTestEnv: false, rejectOnError: true });
      expect(result.stdout).toContain(marker);
    }
  });
});
