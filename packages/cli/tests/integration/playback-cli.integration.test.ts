/**
 * @fileoverview Real-CLI integration tests for the `playback` read subcommands.
 *
 * Each target is exercised through the local CLI entry (dist/index.js). The
 * existing packages/cli/tests/integration/playback.integration.test.ts is a
 * service-layer test (0 runCli calls), so it does not count toward real CLI
 * coverage; real coverage lives here.
 *
 * `playback get` on a freshly-created (never-broadcast) channel resolves a
 * non-existent video-id to the displayInfo line "未找到回放视频" with exit 0
 * (empty-data info-line pattern, same as statistics view / donate list /
 * lottery winners), so we assert on exit code + output content rather than
 * parsing JSON.
 *
 * The playback write subcommands (`merge`, `subtitle update-batch`) resolve a
 * real staged record file before mutating state. A fresh channel has none, so
 * referencing non-existent file-ids deterministically rejects the write up
 * front (exit 1 + fixed business error: "record file not exist" / "找不到暂存
 * 文件字幕") before any state is created — a genuine real-API execution of each
 * write path with no cleanup beyond the throwaway channel.
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
const playbackVodIds = readPlaybackVodIds();
const shouldRunPlaybackWriteTests = shouldRunRealChannelTests && playbackVodIds.length >= 2;

function readPlaybackVodIds(): string[] {
  const ids = [
    ...(process.env['POLYV_TEST_PLAYBACK_VOD_IDS'] || '').split(','),
    process.env['POLYV_TEST_PLAYBACK_VOD_ID'] || '',
  ]
    .map((value) => value.trim())
    .filter(Boolean);

  return Array.from(new Set(ids));
}

function extractPlaybackVideoId(value: Record<string, unknown>): string {
  const data = value.data && typeof value.data === 'object' ? value.data as Record<string, unknown> : {};
  const result = value.result && typeof value.result === 'object' ? value.result as Record<string, unknown> : {};
  const candidates = [
    value.videoId,
    value.vid,
    value.id,
    data.videoId,
    data.vid,
    data.id,
    result.videoId,
    result.vid,
    result.id,
  ];
  const videoId = candidates.map((candidate) => String(candidate || '').trim()).find(Boolean);

  if (!videoId) {
    throw new Error(`Cannot extract playback videoId from CLI output: ${JSON.stringify(value)}`);
  }

  return videoId;
}

describe('playback CLI integration (channel-scoped reads)', () => {
  (shouldRunRealChannelTests ? it : it.skip)('gets a single playback video via real CLI (empty-data path)', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Playback Get');

      // A freshly-created channel has never broadcast, so any video-id resolves
      // to the "未找到回放视频" displayInfo line with exit 0 (non-JSON empty-data
      // output, same pattern as statistics view / donate list / lottery winners).
      const result = runCli([
        'playback',
        'get',
        '-c',
        channelId,
        '--video-id',
        'it-nonexistent-video-id',
        '--output',
        'json',
      ]);

      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('未找到回放视频');
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 120000);

  // Sanity check that the CLI surface exists even without real credentials.
  it('exposes the playback get read through the real CLI entry', () => {
    const result = runCli(['playback', 'get', '--help'], { includeTestEnv: false });
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('video-id');
  });

  (shouldRunRealChannelTests ? it : it.skip)(
    'runs playback merge via real CLI (non-existent file-ids)',
    () => {
      let channelId: string | undefined;
      const fakeFileId = `gnhf-fake-file-${Date.now().toString(36)}`;
      const fileIds = `${fakeFileId}a,${fakeFileId}b`;

      try {
        channelId = createTemporaryChannel('Playback Merge CLI');

        // playback merge resolves staged record files; a fresh channel has
        // none, so non-existent file-ids deterministically surface
        // "record file not exist" (exit 1) — proving the merge write path ran.
        const result = runCli([
          'playback',
          'merge',
          '-c',
          channelId,
          '--file-ids',
          fileIds,
          '-o',
          'json',
        ]);

        expect(result.exitCode).toBe(1);
        expect(result.output).toContain('record file not exist');
      } finally {
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    120000,
  );

  (shouldRunRealChannelTests ? it : it.skip)(
    'runs playback subtitle update-batch via real CLI (no draft subtitles)',
    () => {
      let channelId: string | undefined;
      // Precompute the JSON body so the runCli array literal stays free of
      // nested brackets (coverage report array matcher skips bracketed args).
      const bodyJson = JSON.stringify([{ id: 1, status: 'publish' }]);

      try {
        channelId = createTemporaryChannel('Playback Subtitle UpdateBatch CLI');

        // A fresh channel has no staged draft files, so the batch subtitle
        // update deterministically surfaces "找不到暂存文件字幕" (exit 1).
        const result = runCli([
          'playback',
          'subtitle',
          'update-batch',
          '-c',
          channelId,
          '--body-json',
          bodyJson,
          '--force',
          '-o',
          'json',
        ]);

        expect(result.exitCode).toBe(1);
        expect(result.output).toContain('找不到暂存文件字幕');
      } finally {
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    120000,
  );

  (shouldRunPlaybackWriteTests ? it : it.skip)(
    'runs playback VOD write commands through the real CLI with fixture videos',
    () => {
      const firstFixtureVid = playbackVodIds[0];
      const secondFixtureVid = playbackVodIds[1];
      if (!firstFixtureVid || !secondFixtureVid) {
        throw new Error('POLYV_TEST_PLAYBACK_VOD_IDS must contain at least two VOD IDs');
      }

      let channelId: string | undefined;
      const pendingPlaybackDeletes: string[] = [];

      const deleteLinkedPlayback = (targetChannelId: string, videoId: string): Record<string, unknown> => {
        const deleted = parseJsonObject(runCliSuccess([
          'playback',
          'delete',
          '--channel-id',
          targetChannelId,
          '--video-id',
          videoId,
          '--force',
          '--output',
          'json',
        ], 60000));

        expect(deleted.channelId).toBe(targetChannelId);
        expect(deleted.videoId).toBe(videoId);
        expect(deleted.status).toBe('已删除');
        return deleted;
      };

      try {
        channelId = createTemporaryChannel('Playback VOD Writes');
        const targetChannelId = channelId;

        const firstAdded = parseJsonObject(runCliSuccess([
          'playback',
          'add-vod',
          '--channel-id',
          targetChannelId,
          '--vid',
          firstFixtureVid,
          '--set-as-default',
          'N',
          '--force',
          '--output',
          'json',
        ], 60000));
        const firstVideoId = extractPlaybackVideoId(firstAdded);
        pendingPlaybackDeletes.push(firstVideoId);

        const secondAdded = parseJsonObject(runCliSuccess([
          'playback',
          'add-vod',
          '--channel-id',
          targetChannelId,
          '--vid',
          secondFixtureVid,
          '--set-as-default',
          'N',
          '--force',
          '--output',
          'json',
        ], 60000));
        const secondVideoId = extractPlaybackVideoId(secondAdded);
        pendingPlaybackDeletes.push(secondVideoId);

        const title = `CLI Integration Playback ${Date.now()}`;
        const renamed = parseJsonObject(runCliSuccess([
          'playback',
          'title',
          'update',
          '--channel-id',
          targetChannelId,
          '--video-id',
          firstVideoId,
          '--title',
          title,
          '--force',
          '--output',
          'json',
        ], 60000));
        expect(renamed.updated).toBe(true);
        expect(renamed.channelId).toBe(targetChannelId);
        expect(renamed.videoId).toBe(firstVideoId);
        expect(renamed.title).toBe(title);

        const orderedVideoIds = `${secondVideoId},${firstVideoId}`;
        const sorted = parseJsonObject(runCliSuccess([
          'playback',
          'sort',
          'set',
          '--channel-id',
          targetChannelId,
          '--video-ids',
          orderedVideoIds,
          '--force',
          '--output',
          'json',
        ], 60000));
        expect(sorted.sorted).toBe(true);
        expect(sorted.channelId).toBe(targetChannelId);
        expect(sorted.videoIds).toEqual([secondVideoId, firstVideoId]);

        const moved = parseJsonObject(runCliSuccess([
          'playback',
          'sort',
          'move',
          '--channel-id',
          targetChannelId,
          '--video-id',
          firstVideoId,
          '--type',
          'up',
          '--force',
          '--output',
          'json',
        ], 60000));
        expect(moved.moved).toBe(true);
        expect(moved.channelId).toBe(targetChannelId);
        expect(moved.videoId).toBe(firstVideoId);
        expect(moved.type).toBe('up');

        deleteLinkedPlayback(targetChannelId, secondVideoId);
        pendingPlaybackDeletes.splice(pendingPlaybackDeletes.indexOf(secondVideoId), 1);
      } finally {
        const cleanupErrors: string[] = [];

        if (channelId) {
          for (const videoId of [...pendingPlaybackDeletes].reverse()) {
            try {
              deleteLinkedPlayback(channelId, videoId);
            } catch (error) {
              cleanupErrors.push(error instanceof Error ? error.message : String(error));
            }
          }

          try {
            deleteTemporaryChannel(channelId);
          } catch (error) {
            cleanupErrors.push(error instanceof Error ? error.message : String(error));
          }
        }

        if (cleanupErrors.length > 0) {
          throw new Error(`Playback VOD write cleanup failed:\n${cleanupErrors.join('\n')}`);
        }
      }
    },
    240000,
  );
});
