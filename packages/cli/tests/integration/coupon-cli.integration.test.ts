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
});
