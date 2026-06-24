/**
 * @fileoverview Real-CLI integration tests for product tag write subcommands.
 *
 * Two CRUD families, both of which surface the created id directly in the
 * `create` response (no list-and-discover step needed):
 *
 *  - `product tag` (user-level / account-scoped product tags): create returns
 *    `{ success, data: { id, name, type, createTime, ... } }` with a numeric id;
 *    update echoes `{ success, data: { id, name } }`; delete echoes
 *    `{ success, data: { id } }`.
 *  - `product channel-tag` (channel-scoped product tags): create returns
 *    `{ success, data: { id, name, ... } }`; update echoes
 *    `{ success, data: { channelId, id, name } }`; delete echoes
 *    `{ success, data: { channelId, id } }`.
 *
 * Each test runs a create -> update -> delete loop through the real CLI entry
 * and cleans up the created tag (plus the temporary channel) in `finally`.
 * Per the integration-test convention a temporary channel is created as the
 * real test asset; the account-scoped family does not consume it but still
 * creates/deletes one.
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

describe('product tag CLI write lifecycle integration', () => {
  (shouldRunRealChannelTests ? it : it.skip)(
    'runs the user-level product tag create -> update -> delete lifecycle via real CLI',
    () => {
      let channelId: string | undefined;
      let tagId: number | undefined;

      try {
        // Account-scoped writes; the temporary channel is the real test asset.
        channelId = createTemporaryChannel('Product Tag Lifecycle');
        const tagName = `polyv-it-ptag-${Date.now()}`;
        const renamed = `${tagName}-renamed`;

        // create surfaces the numeric tag id directly in data.id.
        const createOutput = runCliSuccess([
          'product',
          'tag',
          'create',
          '--name',
          tagName,
          '--force',
          '--output',
          'json',
        ]);
        const created = parseJsonObject(createOutput) as {
          success?: boolean;
          data?: { id?: number; name?: string };
        };
        expect(created.success).toBe(true);
        tagId = Number(created.data?.id);
        expect(Number.isInteger(tagId) && tagId > 0).toBe(true);
        expect(created.data?.name).toBe(tagName);

        // update renames the tag and echoes the id.
        const updateOutput = runCliSuccess([
          'product',
          'tag',
          'update',
          '--id',
          String(tagId),
          '--name',
          renamed,
          '--force',
          '--output',
          'json',
        ]);
        const updated = parseJsonObject(updateOutput) as {
          success?: boolean;
          data?: { id?: number; name?: string };
        };
        expect(updated.success).toBe(true);
        expect(Number(updated.data?.id)).toBe(tagId);
        expect(updated.data?.name).toBe(renamed);

        // delete closes the create->update->delete loop.
        const deleteOutput = runCliSuccess([
          'product',
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
              'product',
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
    'runs the channel product tag create -> update -> delete lifecycle via real CLI',
    () => {
      let channelId: string | undefined;
      let tagId: number | undefined;

      try {
        channelId = createTemporaryChannel('Product Channel Tag Lifecycle');
        const tagName = `polyv-it-ctag-${Date.now()}`;
        const renamed = `${tagName}-renamed`;

        // create surfaces the numeric tag id directly in data.id (channel-scoped).
        const createOutput = runCliSuccess([
          'product',
          'channel-tag',
          'create',
          '--channel-id',
          channelId,
          '--name',
          tagName,
          '--force',
          '--output',
          'json',
        ]);
        const created = parseJsonObject(createOutput) as {
          success?: boolean;
          data?: { id?: number; name?: string };
        };
        expect(created.success).toBe(true);
        tagId = Number(created.data?.id);
        expect(Number.isInteger(tagId) && tagId > 0).toBe(true);
        expect(created.data?.name).toBe(tagName);

        // update renames the channel tag and echoes channelId + id + name.
        const updateOutput = runCliSuccess([
          'product',
          'channel-tag',
          'update',
          '--channel-id',
          channelId,
          '--id',
          String(tagId),
          '--name',
          renamed,
          '--force',
          '--output',
          'json',
        ]);
        const updated = parseJsonObject(updateOutput) as {
          success?: boolean;
          data?: { channelId?: string; id?: number; name?: string };
        };
        expect(updated.success).toBe(true);
        expect(Number(updated.data?.id)).toBe(tagId);
        expect(updated.data?.name).toBe(renamed);

        // delete closes the create->update->delete loop (channel-scoped).
        const deleteOutput = runCliSuccess([
          'product',
          'channel-tag',
          'delete',
          '--channel-id',
          channelId,
          '--id',
          String(tagId),
          '--force',
          '--output',
          'json',
        ]);
        const deleted = parseJsonObject(deleteOutput) as {
          success?: boolean;
          data?: { channelId?: string; id?: number };
        };
        expect(deleted.success).toBe(true);
        expect(Number(deleted.data?.id)).toBe(tagId);
        tagId = undefined;
      } finally {
        if (channelId && tagId !== undefined) {
          // Safety-net cleanup if a step failed mid-lifecycle.
          try {
            runCliSuccess([
              'product',
              'channel-tag',
              'delete',
              '--channel-id',
              channelId,
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

  // Sanity check that the CLI surface exists even without real credentials.
  it('exposes the product tag & channel-tag write subcommands through the real CLI entry', () => {
    const checks: Array<[string[], string]> = [
      [['product', 'tag', 'create', '--help'], '--name'],
      [['product', 'tag', 'update', '--help'], '--id'],
      [['product', 'tag', 'delete', '--help'], '--id'],
      [['product', 'channel-tag', 'create', '--help'], '--channel-id'],
      [['product', 'channel-tag', 'update', '--help'], '--channel-id'],
      [['product', 'channel-tag', 'delete', '--help'], '--channel-id'],
    ];

    for (const [args, marker] of checks) {
      const result = runCli(args, { includeTestEnv: false, rejectOnError: true });
      expect(result.stdout).toContain(marker);
    }
  });
});
