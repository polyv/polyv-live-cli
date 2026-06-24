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
 *  - channel-scoped product operations `topping` / `untopping` / `rank` /
 *    `sort` / `push` / `cancel-push` / `update-enabled`: all seven are
 *    reversible writes that share a single `product add` fixture. The
 *    product-id ops return `{ success, data: { channelId, productId[, rank] } }`,
 *    `sort` returns `{ success, data: 'SUCCESS' }`, `push`/`cancel-push`
 *    return `{ success, data: null }`, and `update-enabled` returns
 *    `{ success, data: { channelId, enabled } }`. The fixture is closed by a
 *    single `product delete` at the end.
 *  - `product batch-add` / `batch-shelf` (channel-scoped): `batch-add` takes a
 *    `--products-json` array (each item is an `AddChannelProductParams` minus
 *    `channelId`, so a fetchable `cover` + `realPrice` are required) and returns
 *    `{ success, data: [{ productId, ... }] }` with the created ids echoed
 *    directly. `batch-shelf` takes those ids plus `--shelf 1|2` and returns
 *    `{ success, data: 'SUCCESS' }`; toggling off (2) then on (1) is reversible.
 *    The loop is closed by `product batch-delete`.
 *  - `product reference` (channel-scoped): references a user-level library
 *    product into a channel. The `--origin-id` is the platform library
 *    `productId` (string) produced by `product library create`; `reference`
 *    posts to `/live/v3/channel/product/reference` (channelId signed in params)
 *    and returns `{ success, data: { productId (numeric channel id), channelId,
 *    name, originId, status, ... } }`. The account-scoped library product must
 *    be deleted explicitly (it survives channel deletion); the referenced
 *    channel product is cleared by `product delete` and/or channel deletion.
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

  (shouldRunRealChannelTests ? it : it.skip)(
    'references a platform library product into a channel via real CLI',
    () => {
      let channelId: string | undefined;
      // Account-scoped platform library product id; must be deleted explicitly
      // (it is NOT cleared by deleting the temporary channel).
      let originId: string | undefined;
      // Channel-scoped referenced product id; cleared by deleting the channel
      // but deleted explicitly for a deterministic cleanup.
      let channelProductId: number | undefined;

      try {
        channelId = createTemporaryChannel('Product Reference');
        const ts = Date.now();
        const name = `polyv-it-ref-${ts}`;

        // 1. Create a platform library product; its productId is the origin-id.
        const createOutput = runCliSuccess([
          'product',
          'library',
          'create',
          '--name',
          name,
          '--link-type',
          '10',
          '--link',
          `https://example.com/ref-${ts}`,
          '--cover',
          REAL_COVER_URL,
          '--real-price',
          '12.3',
          '--force',
          '--output',
          'json',
        ]);
        const created = parseJsonObject(createOutput) as {
          success?: boolean;
          data?: { productId?: string };
        };
        expect(created.success).toBe(true);
        originId = String(created.data?.productId ?? '');
        expect(originId.length).toBeGreaterThan(0);

        // 2. Reference the platform product into the channel (on-shelf, status 1).
        //    `reference` echoes the new channel-scoped product object directly in
        //    data, including a numeric productId and the originId it was built from.
        const referenceOutput = runCliSuccess([
          'product',
          'reference',
          '--channel-id',
          channelId,
          '--origin-id',
          originId,
          '--status',
          '1',
          '--force',
          '--output',
          'json',
        ]);
        const referenced = parseJsonObject(referenceOutput) as {
          success?: boolean;
          data?: {
            productId?: number;
            channelId?: string | number;
            name?: string;
            originId?: string;
            status?: number;
          };
        };
        expect(referenced.success).toBe(true);
        channelProductId = Number(referenced.data?.productId);
        expect(Number.isInteger(channelProductId) && channelProductId > 0).toBe(true);
        expect(String(referenced.data?.channelId)).toBe(channelId);
        expect(referenced.data?.name).toBe(name);
        expect(String(referenced.data?.originId)).toBe(originId);
        expect(referenced.data?.status).toBe(1);

        // 3. The referenced product now appears in the channel product list.
        const listOutput = runCliSuccess([
          'product',
          'list',
          '--channel-id',
          channelId,
          '--output',
          'json',
        ]);
        expect(listOutput).toContain(String(channelProductId));
      } finally {
        // Delete the referenced channel product first (best-effort).
        if (channelId && channelProductId !== undefined) {
          try {
            runCliSuccess([
              'product',
              'delete',
              '--channel-id',
              channelId,
              '--product-id',
              String(channelProductId),
              '--force',
              '--output',
              'json',
            ]);
          } catch {
            // Best-effort; deleting the channel below also clears it.
          }
        }
        // The platform library product is account-scoped and must be removed
        // explicitly — it survives channel deletion.
        if (originId) {
          try {
            runCliSuccess([
              'product',
              'library',
              'delete',
              '--product-id',
              originId,
              '--force',
              '--output',
              'json',
            ]);
          } catch {
            // Best-effort cleanup.
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
    'runs the channel product topping / untopping / rank / sort / push / cancel-push / update-enabled operations via real CLI',
    () => {
      // All seven operations are channel-scoped reversible writes that operate
      // on (or for) a single channel product, so they share one temporary
      // channel + one `product add` fixture and are closed by a single
      // `product delete` at the end. update-enabled flips the channel product
      // library switch (N then Y restore); the product-id ops return
      // { success, data: { channelId, productId[, rank] } }, sort returns
      // { success, data: 'SUCCESS' }, push/cancel-push return
      // { success, data: null }.
      let channelId: string | undefined;
      let productId: number | undefined;

      try {
        channelId = createTemporaryChannel('Product Ops Lifecycle');
        const ts = Date.now();
        const name = `polyv-it-ops-${ts}`;

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
          '12.3',
          '--output',
          'json',
        ]);
        const added = parseJsonObject(addOutput) as { productId?: number };
        productId = Number(added.productId);
        expect(Number.isInteger(productId) && productId > 0).toBe(true);

        const topOut = runCliSuccess([
          'product',
          'topping',
          '--channel-id',
          channelId,
          '--product-id',
          String(productId),
          '--force',
          '--output',
          'json',
        ]);
        const topped = parseJsonObject(topOut) as {
          success?: boolean;
          data?: { channelId?: string | number; productId?: number };
        };
        expect(topped.success).toBe(true);
        expect(Number(topped.data?.productId)).toBe(productId);

        const untopOut = runCliSuccess([
          'product',
          'untopping',
          '--channel-id',
          channelId,
          '--product-id',
          String(productId),
          '--force',
          '--output',
          'json',
        ]);
        const untopped = parseJsonObject(untopOut) as {
          success?: boolean;
          data?: { productId?: number };
        };
        expect(untopped.success).toBe(true);
        expect(Number(untopped.data?.productId)).toBe(productId);

        const rankOut = runCliSuccess([
          'product',
          'rank',
          '--channel-id',
          channelId,
          '--product-id',
          String(productId),
          '--rank',
          '1',
          '--force',
          '--output',
          'json',
        ]);
        const ranked = parseJsonObject(rankOut) as {
          success?: boolean;
          data?: { productId?: number; rank?: number };
        };
        expect(ranked.success).toBe(true);
        expect(Number(ranked.data?.productId)).toBe(productId);
        expect(ranked.data?.rank).toBe(1);

        const sortOut = runCliSuccess([
          'product',
          'sort',
          '--channel-id',
          channelId,
          '--product-id',
          String(productId),
          '--type',
          '50',
          '--sort',
          '1',
          '--force',
          '--output',
          'json',
        ]);
        const sorted = parseJsonObject(sortOut) as {
          success?: boolean;
          data?: unknown;
        };
        expect(sorted.success).toBe(true);
        expect(sorted.data).toBe('SUCCESS');

        const pushOut = runCliSuccess([
          'product',
          'push',
          '--channel-id',
          channelId,
          '--product-id',
          String(productId),
          '--push-card-type',
          'smallCard',
          '--force',
          '--output',
          'json',
        ]);
        const pushed = parseJsonObject(pushOut) as { success?: boolean };
        expect(pushed.success).toBe(true);

        const cancelOut = runCliSuccess([
          'product',
          'cancel-push',
          '--channel-id',
          channelId,
          '--product-id',
          String(productId),
          '--force',
          '--output',
          'json',
        ]);
        const cancelled = parseJsonObject(cancelOut) as { success?: boolean };
        expect(cancelled.success).toBe(true);

        const enabledNOut = runCliSuccess([
          'product',
          'update-enabled',
          '--channel-id',
          channelId,
          '--enabled',
          'N',
          '--force',
          '--output',
          'json',
        ]);
        const disabled = parseJsonObject(enabledNOut) as {
          success?: boolean;
          data?: { channelId?: string | number; enabled?: string };
        };
        expect(disabled.success).toBe(true);
        expect(disabled.data?.enabled).toBe('N');

        // Restore the channel product library switch to enabled.
        runCliSuccess([
          'product',
          'update-enabled',
          '--channel-id',
          channelId,
          '--enabled',
          'Y',
          '--force',
          '--output',
          'json',
        ]);

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
        const deleted = parseJsonObject(deleteOutput) as { deleted?: boolean };
        expect(deleted.deleted).toBe(true);
        productId = undefined;
      } finally {
        if (channelId && productId !== undefined) {
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

  // Real-CLI lifecycle: product batch-add -> batch-shelf (off -> on reversible)
  // -> batch-delete cleanup. batch-add returns the created productIds directly
  // in data[], so no list-by-keyword lookup is needed. The created products are
  // removed via product batch-delete in the same test; any leftover plus the
  // temporary channel are cleaned up in `finally`.
  (shouldRunRealChannelTests ? it : it.skip)(
    'runs the channel product batch-add -> batch-shelf lifecycle via real CLI',
    () => {
      let channelId: string | undefined;
      let productIds: number[] = [];

      try {
        channelId = createTemporaryChannel('Product Batch Lifecycle');
        const ts = Date.now();

        // Build the products payload as a JSON string in a variable so the
        // runCliSuccess argument array stays free of nested [] (the coverage
        // report's array matcher skips argument arrays containing nested
        // brackets).
        const products = [
          {
            name: `polyv-it-batch-a-${ts}`,
            status: 1,
            linkType: 10,
            link: `https://example.com/ba-${ts}`,
            cover: REAL_COVER_URL,
            realPrice: '11.1',
          },
          {
            name: `polyv-it-batch-b-${ts}`,
            status: 1,
            linkType: 10,
            link: `https://example.com/bb-${ts}`,
            cover: REAL_COVER_URL,
            realPrice: '22.2',
          },
        ];
        const productsJson = JSON.stringify(products);

        // batch-add -> { success: true, data: [{ productId, ... }] }
        const addOutput = runCliSuccess([
          'product',
          'batch-add',
          '--channel-id',
          channelId,
          '--products-json',
          productsJson,
          '--force',
          '--output',
          'json',
        ]);
        const added = parseJsonObject(addOutput) as {
          success?: boolean;
          data?: Array<{ productId?: number; channelId?: string | number }>;
        };
        expect(added.success).toBe(true);
        expect(Array.isArray(added.data)).toBe(true);
        expect(added.data?.length).toBeGreaterThanOrEqual(2);
        productIds = (added.data || [])
          .map((item) => Number(item.productId))
          .filter((id) => Number.isInteger(id) && id > 0);
        expect(productIds.length).toBeGreaterThanOrEqual(2);
        for (const item of added.data || []) {
          expect(String(item.channelId)).toBe(channelId);
        }

        const idsArg = productIds.join(',');

        // batch-shelf off (2) -> { success: true, data: "SUCCESS" }
        const offOutput = runCliSuccess([
          'product',
          'batch-shelf',
          '--channel-id',
          channelId,
          '--product-ids',
          idsArg,
          '--shelf',
          '2',
          '--force',
          '--output',
          'json',
        ]);
        const offShelf = parseJsonObject(offOutput) as {
          success?: boolean;
          data?: unknown;
        };
        expect(offShelf.success).toBe(true);
        expect(offShelf.data).toBe('SUCCESS');

        // batch-shelf on (1) — reversible toggle -> { success: true, data: "SUCCESS" }
        const onOutput = runCliSuccess([
          'product',
          'batch-shelf',
          '--channel-id',
          channelId,
          '--product-ids',
          idsArg,
          '--shelf',
          '1',
          '--force',
          '--output',
          'json',
        ]);
        const onShelf = parseJsonObject(onOutput) as {
          success?: boolean;
          data?: unknown;
        };
        expect(onShelf.success).toBe(true);
        expect(onShelf.data).toBe('SUCCESS');

        // batch-delete closes the create -> shelf -> delete loop.
        const deleteOutput = runCliSuccess([
          'product',
          'batch-delete',
          '--channel-id',
          channelId,
          '--product-ids',
          idsArg,
          '--force',
          '--output',
          'json',
        ]);
        const deleted = parseJsonObject(deleteOutput) as {
          success?: boolean;
          data?: unknown;
        };
        expect(deleted.success).toBe(true);
        expect(deleted.data).toBe('SUCCESS');
        productIds = [];
      } finally {
        if (channelId && productIds.length > 0) {
          try {
            runCliSuccess([
              'product',
              'batch-delete',
              '--channel-id',
              channelId,
              '--product-ids',
              productIds.join(','),
              '--force',
              '--output',
              'json',
            ]);
          } catch {
            // Best-effort; the products may already be gone.
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
      [['product', 'topping', '--help'], '--product-id'],
      [['product', 'untopping', '--help'], '--product-id'],
      [['product', 'rank', '--help'], '--rank'],
      [['product', 'sort', '--help'], '--type'],
      [['product', 'push', '--help'], '--product-id'],
      [['product', 'cancel-push', '--help'], '--product-id'],
      [['product', 'update-enabled', '--help'], '--enabled'],
      [['product', 'batch-add', '--help'], '--products-json'],
      [['product', 'batch-shelf', '--help'], '--shelf'],
      [['product', 'reference', '--help'], '--origin-id'],
    ];

    for (const [args, marker] of checks) {
      const result = runCli(args, { includeTestEnv: false, rejectOnError: true });
      expect(result.stdout).toContain(marker);
    }
  });
});
