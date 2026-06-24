/**
 * @fileoverview Real-CLI integration tests for product write subcommands.
 *
 * Two independent CRUD lifecycles, both executed through the local CLI entry:
 *
 *  - `product add` / `update` / `delete` (channel-scoped): `add` returns the
 *    raw object `{ productId, name, channelId, created }` with a numeric id
 *    (NOT wrapped in success/data — the handler calls displayData directly);
 *    `update` echoes `{ productId, channelId, name, status, updated }`;
 *    `delete` echoes `{ productId, channelId, deleted: true, timestamp }`.
 *    The v3 `/live/v3/channel/product/*` endpoints require a fetchable product
 *    cover image (`--cover`) and a `--real-price`, so a real PolyV CDN image
 *    URL is used. Deleting the temporary channel also clears the product.
 *  - `product library create` / `update` / `delete` (account-scoped, user-level
 *    product library): `create` returns `{ success, data: { productId } }`
 *    where productId is a string (snowflake-style id); update/delete echo
 *    `{ success, data: { productId } }`. The v4 `/live/v4/user/product/*`
 *    endpoints accept an unsigned body (2-arg post).
 *
 * Each test runs a create -> update -> delete loop through the real CLI entry
 * and cleans up the created product (plus the temporary channel) in `finally`.
 * Per the integration-test convention a temporary channel is created as the
 * real test asset; the account-scoped library family does not consume it but
 * still creates/deletes one.
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

// A real, fetchable PolyV CDN image. The v3 product add endpoint fetches the
// cover server-side and rejects non-image / unreachable URLs
// ("商品封面图片获取失败"), so a stable PolyV-hosted asset is required.
const REAL_COVER_URL =
  'https://s2.videocc.net/watch-theme/spring/v2/assets/common/player-cover.png';

describe('product CLI write lifecycle integration', () => {
  (shouldRunRealChannelTests ? it : it.skip)(
    'runs the channel product add -> update -> delete lifecycle via real CLI',
    () => {
      let channelId: string | undefined;
      let productId: number | undefined;

      try {
        channelId = createTemporaryChannel('Product Add Lifecycle');
        const ts = Date.now();
        const name = `polyv-it-cprod-${ts}`;
        const renamed = `${name}-renamed`;

        // add surfaces the numeric productId directly in the JSON object.
        const addOutput = runCliSuccess([
          'product',
          'add',
          '--channel-id',
          channelId,
          '--name',
          name,
          '--status',
          '1',
          '--link-type',
          '10',
          '--link',
          `https://example.com/p-${ts}`,
          '--cover',
          REAL_COVER_URL,
          '--real-price',
          '99.9',
          '--output',
          'json',
        ]);
        const added = parseJsonObject(addOutput) as {
          productId?: number;
          name?: string;
          channelId?: string | number;
          created?: string;
        };
        productId = Number(added.productId);
        expect(Number.isInteger(productId) && productId > 0).toBe(true);
        expect(added.name).toBe(name);
        expect(String(added.channelId)).toBe(channelId);
        expect(typeof added.created).toBe('string');

        // update renames the product and flips status to off-shelf (2).
        const updateOutput = runCliSuccess([
          'product',
          'update',
          '--channel-id',
          channelId,
          '--product-id',
          String(productId),
          '--name',
          renamed,
          '--status',
          '2',
          '--link-type',
          '10',
          '--link',
          `https://example.com/p-up-${ts}`,
          '--cover',
          REAL_COVER_URL,
          '--real-price',
          '88.8',
          '--output',
          'json',
        ]);
        const updated = parseJsonObject(updateOutput) as {
          productId?: number;
          channelId?: string | number;
          name?: string;
          status?: string;
          updated?: string;
        };
        expect(Number(updated.productId)).toBe(productId);
        expect(String(updated.channelId)).toBe(channelId);
        expect(updated.name).toBe(renamed);
        expect(typeof updated.updated).toBe('string');

        // delete closes the create->update->delete loop.
        const deleteOutput = runCliSuccess([
          'product',
          'delete',
          '--channel-id',
          channelId,
          '--product-id',
          String(productId),
          '--force',
          '--output',
          'json',
        ]);
        const deleted = parseJsonObject(deleteOutput) as {
          productId?: number;
          channelId?: string | number;
          deleted?: boolean;
          timestamp?: string;
        };
        expect(Number(deleted.productId)).toBe(productId);
        expect(String(deleted.channelId)).toBe(channelId);
        expect(deleted.deleted).toBe(true);
        productId = undefined;
      } finally {
        if (channelId && productId !== undefined) {
          // Safety-net cleanup if a step failed mid-lifecycle.
          try {
            runCliSuccess([
              'product',
              'delete',
              '--channel-id',
              channelId,
              '--product-id',
              String(productId),
              '--force',
              '--output',
              'json',
            ]);
          } catch {
            // Best-effort; the product may already be gone.
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
    'runs the user-level product library create -> update -> delete lifecycle via real CLI',
    () => {
      let channelId: string | undefined;
      let productId: string | undefined;

      try {
        // Account-scoped writes; the temporary channel is the real test asset.
        channelId = createTemporaryChannel('Product Library Lifecycle');
        const ts = Date.now();
        const name = `polyv-it-lib-${ts}`;
        const renamed = `${name}-renamed`;

        // create surfaces the productId (string) directly in data.productId.
        const createOutput = runCliSuccess([
          'product',
          'library',
          'create',
          '--name',
          name,
          '--link-type',
          '10',
          '--link',
          `https://example.com/lib-${ts}`,
          '--force',
          '--output',
          'json',
        ]);
        const created = parseJsonObject(createOutput) as {
          success?: boolean;
          data?: { productId?: string };
        };
        expect(created.success).toBe(true);
        productId = String(created.data?.productId ?? '');
        expect(productId.length).toBeGreaterThan(0);
        expect(typeof productId).toBe('string');

        // update renames the library product and echoes the productId.
        const updateOutput = runCliSuccess([
          'product',
          'library',
          'update',
          '--product-id',
          productId,
          '--name',
          renamed,
          '--link-type',
          '10',
          '--link',
          `https://example.com/lib-up-${ts}`,
          '--force',
          '--output',
          'json',
        ]);
        const updated = parseJsonObject(updateOutput) as {
          success?: boolean;
          data?: { productId?: string };
        };
        expect(updated.success).toBe(true);
        expect(updated.data?.productId).toBe(productId);

        // delete closes the create->update->delete loop.
        const deleteOutput = runCliSuccess([
          'product',
          'library',
          'delete',
          '--product-id',
          productId,
          '--force',
          '--output',
          'json',
        ]);
        const deleted = parseJsonObject(deleteOutput) as {
          success?: boolean;
          data?: { productId?: string };
        };
        expect(deleted.success).toBe(true);
        expect(deleted.data?.productId).toBe(productId);
        productId = undefined;
      } finally {
        if (productId) {
          // Safety-net cleanup if a step failed mid-lifecycle.
          try {
            runCliSuccess([
              'product',
              'library',
              'delete',
              '--product-id',
              productId,
              '--force',
              '--output',
              'json',
            ]);
          } catch {
            // Best-effort; the product may already be gone.
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
  it('exposes the product write subcommands through the real CLI entry', () => {
    const checks: Array<[string[], string]> = [
      [['product', 'add', '--help'], '--channel-id'],
      [['product', 'update', '--help'], '--product-id'],
      [['product', 'delete', '--help'], '--product-id'],
      [['product', 'library', 'create', '--help'], '--link-type'],
      [['product', 'library', 'update', '--help'], '--product-id'],
      [['product', 'library', 'delete', '--help'], '--product-id'],
    ];

    for (const [args, marker] of checks) {
      const result = runCli(args, { includeTestEnv: false, rejectOnError: true });
      expect(result.stdout).toContain(marker);
    }
  });
});
