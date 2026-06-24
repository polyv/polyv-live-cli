import { runCli } from '../helpers/cli-runner';
import {
  createTemporaryChannel,
  deleteTemporaryChannel,
  parseJsonObject,
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
});
