/**
 * @fileoverview Real-CLI integration tests for channel-scoped stream commands.
 *
 * These commands are exercised through the local CLI entry (dist/index.js) against
 * a freshly-created temporary channel, which is deleted in `finally`. Most are
 * read-only and return well-formed JSON even when the channel has never been live;
 * fixture-gated write coverage also cleans up the temporary channel state it adds.
 */

import { runCli } from '../helpers/cli-runner';
import {
  createTemporaryChannel,
  deleteTemporaryChannel,
  parseJsonValue,
  runCliSuccess,
} from '../helpers/channel-fixture';
import { hasRealCredentials } from '../helpers/integration-config';

const shouldRunRealChannelTests = hasRealCredentials();
const streamDiskVideoVodIds = readStreamDiskVideoVodIds();
const shouldRunDiskVideoAddTests = shouldRunRealChannelTests && streamDiskVideoVodIds.length > 0;

function readStreamDiskVideoVodIds(): string[] {
  const ids = [
    ...(process.env['POLYV_TEST_STREAM_DISK_VIDEO_VOD_IDS'] || '').split(','),
    process.env['POLYV_TEST_STREAM_DISK_VIDEO_VOD_ID'] || '',
    ...(process.env['POLYV_TEST_PLAYBACK_VOD_IDS'] || '').split(','),
    process.env['POLYV_TEST_PLAYBACK_VOD_ID'] || '',
  ]
    .map((value) => value.trim())
    .filter(Boolean);

  return Array.from(new Set(ids));
}

describe('stream channel-scoped read CLI integration', () => {
  (shouldRunRealChannelTests ? it : it.skip)('lists pseudo-live disk videos for a temporary channel via real CLI', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Stream DiskVideo List');

      // A brand-new channel has no configured disk videos, so the command returns
      // an empty, well-formed paginated payload — proving the read path works.
      const output = runCliSuccess([
        'stream',
        'disk-video',
        'list',
        '-c',
        channelId,
        '--output',
        'json',
      ]);

      const payload = parseJsonValue(output) as { contents?: unknown; totalItems?: unknown };
      expect(Array.isArray(payload.contents)).toBe(true);
      expect(typeof payload.totalItems).toBe('number');
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 120000);

  (shouldRunDiskVideoAddTests ? it : it.skip)('adds a pseudo-live disk video to a temporary pure-video channel via real CLI', () => {
    const fixtureVodId = streamDiskVideoVodIds[0];
    if (!fixtureVodId) {
      throw new Error('POLYV_TEST_STREAM_DISK_VIDEO_VOD_ID(S) or POLYV_TEST_PLAYBACK_VOD_ID(S) is required');
    }

    let channelId: string | undefined;
    let addedDiskVideo = false;

    try {
      channelId = createTemporaryChannel('Stream DiskVideo Add', {
        scene: 'alone',
        template: 'alone',
      });

      const added = parseJsonValue(runCliSuccess([
        'stream',
        'disk-video',
        'add',
        '-c',
        channelId,
        '--vids',
        fixtureVodId,
        '--origin',
        'vod',
        '--force',
        '--output',
        'json',
      ], 60000)) as { success?: unknown; data?: unknown };
      addedDiskVideo = true;

      expect(added.success).toBe(true);
      expect(Object.prototype.hasOwnProperty.call(added, 'data')).toBe(true);

      const listPayload = parseJsonValue(runCliSuccess([
        'stream',
        'disk-video',
        'list',
        '-c',
        channelId,
        '--output',
        'json',
      ])) as { contents?: unknown; totalItems?: unknown };
      expect(Array.isArray(listPayload.contents)).toBe(true);
      expect(typeof listPayload.totalItems).toBe('number');
    } finally {
      const cleanupErrors: unknown[] = [];

      if (channelId && addedDiskVideo) {
        try {
          runCliSuccess([
            'stream',
            'disk-video',
            'delete',
            '-c',
            channelId,
            '--vids',
            fixtureVodId,
            '--force',
            '--output',
            'json',
          ], 60000);
        } catch (error) {
          cleanupErrors.push(error);
        }
      }

      if (channelId) {
        try {
          deleteTemporaryChannel(channelId);
        } catch (error) {
          cleanupErrors.push(error);
        }
      }

      if (cleanupErrors.length > 0) {
        throw cleanupErrors[0];
      }
    }
  }, 120000);

  (shouldRunRealChannelTests ? it : it.skip)('deletes pseudo-live disk videos idempotently for a temporary channel via real CLI', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Stream DiskVideo Delete');

      // batch-delete is idempotent: removing a never-configured vid is a
      // delete-of-nothing that the server acknowledges with {success:true}
      // (same pattern as channel ppt-record delete / interaction script delete),
      // so it is safe on a throwaway temp channel and needs no state restore.
      const output = runCliSuccess([
        'stream',
        'disk-video',
        'delete',
        '-c',
        channelId,
        '--vids',
        '999999999',
        '--force',
        '--output',
        'json',
      ]);

      const payload = parseJsonValue(output) as { success?: unknown };
      expect(payload.success).toBe(true);
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 120000);

  (shouldRunRealChannelTests ? it : it.skip)('returns stream monitor info for a temporary channel via real CLI', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Stream Streams');

      // The monitor endpoint reports per-channel live state. For a non-live
      // channel it returns `live: false` with a null streamInfo, never an error.
      const output = runCliSuccess([
        'stream',
        'streams',
        '--channel-ids',
        channelId,
        '--output',
        'json',
      ]);

      const payload = parseJsonValue(output) as Array<{ channelId?: unknown; live?: unknown }>;
      expect(Array.isArray(payload)).toBe(true);
      const entry = payload.find((item) => String(item.channelId) === channelId);
      expect(entry).toBeDefined();
      expect(typeof entry!.live).toBe('boolean');
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 120000);

  (shouldRunRealChannelTests ? it : it.skip)('gets the current capture image for a temporary channel via real CLI', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Stream Capture');

      const result = runCli([
        'stream',
        'capture',
        '-c',
        channelId,
        '--output',
        'json',
      ], { timeout: 60000 });

      if (result.exitCode !== 0) {
        expect(result.output.toLowerCase()).toContain('not live');
        return;
      }

      const payload = parseJsonValue(result.output) as { channelId?: unknown; captureImage?: unknown };
      expect(String(payload.channelId)).toBe(channelId);
      expect(Object.prototype.hasOwnProperty.call(payload, 'captureImage')).toBe(true);
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 120000);

  (shouldRunRealChannelTests ? it : it.skip)('gets a one-shot stream monitor status for a temporary channel via real CLI', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Stream Monitor');

      const output = runCliSuccess([
        'stream',
        'monitor',
        '--channelId',
        channelId,
        '--refresh',
        '1',
        '--output',
        'json',
      ]);

      const payload = parseJsonValue(output) as {
        channelId?: unknown;
        status?: unknown;
        statusText?: unknown;
        isLive?: unknown;
        lastUpdated?: unknown;
      };
      expect(String(payload.channelId)).toBe(channelId);
      expect(typeof payload.status).toBe('string');
      expect(typeof payload.statusText).toBe('string');
      expect(typeof payload.isLive).toBe('boolean');
      expect(typeof payload.lastUpdated).toBe('string');
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 120000);

  (shouldRunRealChannelTests ? it : it.skip)('gets live status by stream name for a temporary channel via real CLI', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Stream LiveStatus Get');

      // The stream name for a PolyV channel equals its channel id. For a channel
      // that has never broadcast, the live-status read returns status "end"
      // rather than an error, so the read path is verifiable on a temp channel.
      const output = runCliSuccess([
        'stream',
        'live-status',
        'get',
        '--stream',
        channelId,
        '--output',
        'json',
      ]);

      const payload = parseJsonValue(output) as { stream?: unknown; status?: unknown };
      expect(String(payload.stream)).toBe(channelId);
      expect(typeof payload.status).toBe('string');
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 120000);

  (shouldRunRealChannelTests ? it : it.skip)('returns push stream credentials for a temporary channel via real CLI', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Stream GetKey');

      // get-key returns the RTMP push address and stream key for a channel. Even a
      // brand-new, never-live channel yields a well-formed payload, so the read path
      // is verifiable. We assert only on the non-sensitive structural fields.
      const output = runCliSuccess([
        'stream',
        'get-key',
        '-c',
        channelId,
        '--output',
        'json',
      ]);

      const payload = parseJsonValue(output) as { channelId?: unknown; rtmpUrl?: unknown; streamKey?: unknown };
      expect(String(payload.channelId)).toBe(channelId);
      expect(typeof payload.rtmpUrl).toBe('string');
      expect(typeof payload.streamKey).toBe('string');
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 120000);

  (shouldRunRealChannelTests ? it : it.skip)('verifies stream status for a temporary channel via real CLI', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Stream Verify');

      const output = runCliSuccess([
        'stream',
        'verify',
        '--channelId',
        channelId,
        '--duration',
        '10',
        '--interval',
        '5',
        '--output',
        'json',
      ], 120000);

      const payload = parseJsonValue(output) as {
        channelId?: unknown;
        verificationId?: unknown;
        totalChecks?: unknown;
        summary?: unknown;
      };
      expect(String(payload.channelId)).toBe(channelId);
      expect(typeof payload.verificationId).toBe('string');
      expect(typeof payload.totalChecks).toBe('number');
      expect(payload.summary).toEqual(expect.any(Object));
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 180000);

  // Sanity check that the CLI surface exists even without real credentials.
  it('exposes the disk-video, streams, capture, monitor, live-status and verify subcommands through the real CLI entry', () => {
    const diskVideo = runCli(['stream', 'disk-video', '--help'], {
      includeTestEnv: false,
      rejectOnError: true,
    });
    expect(diskVideo.stdout).toContain('list');

    const streams = runCli(['stream', 'streams', '--help'], {
      includeTestEnv: false,
      rejectOnError: true,
    });
    expect(streams.stdout).toContain('channel-ids');

    const capture = runCli(['stream', 'capture', '--help'], {
      includeTestEnv: false,
      rejectOnError: true,
    });
    expect(capture.stdout).toContain('channel-id');

    const monitor = runCli(['stream', 'monitor', '--help'], {
      includeTestEnv: false,
      rejectOnError: true,
    });
    expect(monitor.stdout).toContain('channelId');

    const liveStatus = runCli(['stream', 'live-status', 'get', '--help'], {
      includeTestEnv: false,
      rejectOnError: true,
    });
    expect(liveStatus.stdout).toContain('stream');

    const getKey = runCli(['stream', 'get-key', '--help'], {
      includeTestEnv: false,
      rejectOnError: true,
    });
    expect(getKey.stdout).toContain('channelId');

    const verify = runCli(['stream', 'verify', '--help'], {
      includeTestEnv: false,
      rejectOnError: true,
    });
    expect(verify.stdout).toContain('duration');
  });
});
