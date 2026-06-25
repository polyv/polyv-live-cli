import { runCli, sleep } from '../helpers/cli-runner';
import {
  createTemporaryChannel,
  deleteTemporaryChannel,
  parseJsonObject,
  parseJsonValue,
  runCliSuccess,
} from '../helpers/channel-fixture';
import { hasRealCredentials } from '../helpers/integration-config';

const shouldRunRealChannelTests = hasRealCredentials();

describe('coupon CLI integration', () => {
  it('shows coupon write command surface', () => {
    const result = runCli(['coupon', '--help'], { includeTestEnv: false });

    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('add');
    expect(result.output).toContain('delete');
    expect(result.output).toContain('channel');
  });

  // Real-CLI lifecycle: coupon add -> channel add -> channel delete -> coupon delete.
  // A temporary channel is created as the real test asset (and is required by the
  // channel-bind steps); the created coupon is deleted via the CLI in the same test,
  // and any leftover coupon/channel is cleaned up in `finally`.
  (shouldRunRealChannelTests ? it : it.skip)(
    'runs the coupon create/bind/unbind/delete lifecycle against real CLI',
    () => {
      let channelId: string | undefined;
      let couponId: string | undefined;

      try {
        channelId = createTemporaryChannel('Coupon Lifecycle');
        const id = channelId;
        const now = Date.now();
        const day = 24 * 60 * 60 * 1000;

        // coupon add -> { couponId, name, created }
        const addOut = parseJsonObject(
          runCliSuccess([
            'coupon',
            'add',
            '--name',
            `gnhf-coupon-${now}`,
            '--type',
            'MAX_OUT',
            '--availableAmount',
            '5',
            '--receiveStart',
            String(now),
            '--receiveEnd',
            String(now + day * 7),
            '--useTimeType',
            'RANGE',
            '--useStart',
            String(now),
            '--useEnd',
            String(now + day * 30),
            '--condition',
            'FULL_REDUCE',
            '--full',
            '100',
            '--reduce',
            '20',
            '--limitPerPerson',
            '1',
            '--output',
            'json',
          ])
        );
        expect(typeof addOut.couponId).toBe('string');
        expect(String(addOut.couponId).length).toBeGreaterThan(0);
        couponId = String(addOut.couponId);

        // platform coupon viewer-list -> paged viewers that received the coupon. A freshly
        // created coupon has no recipients yet, so this returns an empty paging.
        const viewers = parseJsonObject(
          runCliSuccess([
            'platform',
            'coupon',
            'viewer-list',
            '--coupon-id',
            couponId,
            '--output',
            'json',
          ])
        );
        expect(viewers).toEqual(expect.objectContaining({ contents: expect.any(Array) }));

        // coupon channel add -> { success: true, data: { channelId, couponIds, result } }
        const channelAdd = parseJsonObject(
          runCliSuccess([
            'coupon',
            'channel',
            'add',
            '--channel-id',
            id,
            '--coupon-ids',
            couponId,
            '--force',
            '--output',
            'json',
          ])
        );
        expect(channelAdd.success).toBe(true);
        const channelAddData = channelAdd.data as Record<string, unknown>;
        expect(channelAddData.channelId).toBe(id);

        // coupon channel delete -> { success: true, data: { channelId, couponIds } }
        const channelDelete = parseJsonObject(
          runCliSuccess([
            'coupon',
            'channel',
            'delete',
            '--channel-id',
            id,
            '--coupon-ids',
            couponId,
            '--force',
            '--output',
            'json',
          ])
        );
        expect(channelDelete.success).toBe(true);

        // coupon delete -> { deleted, timestamp }
        const couponDelete = parseJsonObject(
          runCliSuccess([
            'coupon',
            'delete',
            '--couponIds',
            couponId,
            '--output',
            'json',
          ])
        );
        expect(Number(couponDelete.deleted)).toBeGreaterThanOrEqual(1);
        // Mark the coupon as cleaned up so `finally` does not retry the delete.
        couponId = undefined;
      } finally {
        // Best-effort coupon cleanup if the lifecycle aborted before coupon delete.
        if (couponId) {
          try {
            runCliSuccess(['coupon', 'delete', '--couponIds', couponId, '--output', 'json']);
          } catch {
            // Coupon may already be deleted or invalid; ignore cleanup errors.
          }
        }
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    240000
  );

  // Real-CLI lifecycle: coupon add -> platform coupon status-batch (invalidate)
  // -> coupon delete. status-batch stops/invalidates coupons in one call
  // (`/live/v4/user/coupon/update-status-batch`); because the coupon is created
  // and deleted within the same test, the invalidation is self-contained. A
  // temporary channel is created as the real test asset per the convention.
  (shouldRunRealChannelTests ? it : it.skip)(
    'runs the platform coupon status-batch lifecycle against real CLI',
    () => {
      let channelId: string | undefined;
      let couponId: string | undefined;

      try {
        channelId = createTemporaryChannel('Coupon Status Batch');
        const now = Date.now();
        const day = 24 * 60 * 60 * 1000;

        // coupon add -> { couponId, name, created }
        const addOut = parseJsonObject(
          runCliSuccess([
            'coupon',
            'add',
            '--name',
            `gnhf-coupon-sb-${now}`,
            '--type',
            'MAX_OUT',
            '--availableAmount',
            '5',
            '--receiveStart',
            String(now),
            '--receiveEnd',
            String(now + day * 7),
            '--useTimeType',
            'RANGE',
            '--useStart',
            String(now),
            '--useEnd',
            String(now + day * 30),
            '--condition',
            'FULL_REDUCE',
            '--full',
            '100',
            '--reduce',
            '20',
            '--limitPerPerson',
            '1',
            '--output',
            'json',
          ])
        );
        expect(typeof addOut.couponId).toBe('string');
        couponId = String(addOut.couponId);

        // platform coupon status-batch -> { success: true, couponIds: [...] }
        const batchOut = parseJsonObject(
          runCliSuccess([
            'platform',
            'coupon',
            'status-batch',
            '--coupon-ids',
            couponId,
            '--force',
            '--output',
            'json',
          ])
        );
        expect(batchOut.success).toBe(true);
        expect(Array.isArray(batchOut.couponIds)).toBe(true);
        expect(batchOut.couponIds).toContain(couponId);

        // coupon delete closes the create -> invalidate -> delete loop.
        const couponDelete = parseJsonObject(
          runCliSuccess([
            'coupon',
            'delete',
            '--couponIds',
            couponId,
            '--output',
            'json',
          ])
        );
        expect(Number(couponDelete.deleted)).toBeGreaterThanOrEqual(1);
        couponId = undefined;
      } finally {
        if (couponId) {
          try {
            runCliSuccess(['coupon', 'delete', '--couponIds', couponId, '--output', 'json']);
          } catch {
            // Coupon may already be deleted or invalid; ignore cleanup errors.
          }
        }
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    240000
  );

  // Command-surface check for platform coupon status-batch (no credentials).
  it('exposes the platform coupon status-batch command', () => {
    const result = runCli(['platform', 'coupon', 'status-batch', '--help'], {
      includeTestEnv: false,
    });
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('--coupon-ids');
  });

  // Command-surface check for platform coupon update (no credentials).
  // The option is --config-json (not --config) to avoid collision with the
  // program-level global --config <path> option.
  it('exposes the platform coupon update command with --config-json', () => {
    const result = runCli(['platform', 'coupon', 'update', '--help'], {
      includeTestEnv: false,
    });
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('--config-json');
    expect(result.output).toContain('--coupon-id');
  });

  // Real-CLI reversible write: platform coupon update. Builds on the coupon
  // create lifecycle (coupon add returns couponId) to exercise the update
  // endpoint /live/v4/user/coupon/update with a real coupon, then verifies the
  // change persisted by reading the coupon back via `coupon list`, and finally
  // deletes the coupon (and the temporary channel) in `finally`. A freshly
  // created coupon is in NOT_START status, so availableAmount can be freely
  // modified (the API forbids shrinking availableAmount only for GOING coupons).
  (shouldRunRealChannelTests ? it : it.skip)(
    'runs platform coupon update against real CLI',
    () => {
      let channelId: string | undefined;
      let couponId: string | undefined;

      try {
        channelId = createTemporaryChannel('Coupon Update');
        const now = Date.now();
        const day = 24 * 60 * 60 * 1000;

        // coupon add (availableAmount = 5) -> { couponId, ... }
        const addOut = parseJsonObject(
          runCliSuccess([
            'coupon',
            'add',
            '--name',
            `gnhf-coupon-upd-${now}`,
            '--type',
            'MAX_OUT',
            '--availableAmount',
            '5',
            '--receiveStart',
            String(now),
            '--receiveEnd',
            String(now + day * 7),
            '--useTimeType',
            'RANGE',
            '--useStart',
            String(now),
            '--useEnd',
            String(now + day * 30),
            '--condition',
            'FULL_REDUCE',
            '--full',
            '100',
            '--reduce',
            '20',
            '--limitPerPerson',
            '1',
            '--output',
            'json',
          ])
        );
        couponId = String(addOut.couponId);

        // platform coupon update -> { success: true, couponId }
        const updateOut = parseJsonObject(
          runCliSuccess([
            'platform',
            'coupon',
            'update',
            '--coupon-id',
            couponId,
            '--config-json',
            JSON.stringify({ availableAmount: 10 }),
            '--force',
            '--output',
            'json',
          ])
        );
        expect(updateOut.success).toBe(true);
        expect(String(updateOut.couponId)).toBe(couponId);

        // Verify persistence by reading the coupon back. PolyV has a read-replica
        // propagation delay, so poll `coupon list` until the coupon reflects the
        // new availableAmount (bounded retries, not an unbounded block).
        const findCouponAmount = (): number | undefined => {
          const list = parseJsonValue(
            runCliSuccess(['coupon', 'list', '--size', '100', '--output', 'json'])
          ) as Array<Record<string, unknown>>;
          const found = (Array.isArray(list) ? list : []).find(
            (c) => String(c.couponId) === couponId
          );
          return found ? Number(found.availableAmount) : undefined;
        };

        let observed: number | undefined;
        for (let attempt = 0; attempt < 6; attempt += 1) {
          observed = findCouponAmount();
          if (observed === 10) {
            break;
          }
          sleep(1000);
        }
        expect(observed).toBe(10);

        // coupon delete closes the create -> update -> delete loop.
        const couponDelete = parseJsonObject(
          runCliSuccess(['coupon', 'delete', '--couponIds', couponId, '--output', 'json'])
        );
        expect(Number(couponDelete.deleted)).toBeGreaterThanOrEqual(1);
        couponId = undefined;
      } finally {
        if (couponId) {
          try {
            runCliSuccess(['coupon', 'delete', '--couponIds', couponId, '--output', 'json']);
          } catch {
            // Coupon may already be deleted or invalid; ignore cleanup errors.
          }
        }
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    240000
  );
});
