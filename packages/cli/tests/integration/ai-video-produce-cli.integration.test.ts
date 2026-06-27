/**
 * @fileoverview Real-CLI integration tests for the `ai video-produce` family.
 *
 * Each target is exercised through the local CLI entry (dist/index.js). These
 * are account-scoped commands (no channel-id argument), so they operate on the
 * real AI video-production data of the test account:
 *
 * - `ai video-produce get` reads a real task by id. The SDK previously sent the
 *   query param as `id`, but the server expects `aiPPTVideoId` (see
 *   video-produce-get.md); the SDK now maps `id` -> `aiPPTVideoId`, so this read
 *   succeeds against a real task discovered via `video-produce list`.
 * - `ai video-produce ppt get` reads a real PPT by file-id discovered via
 *   `video-produce ppt list`.
 * - `ai video-produce ppt upload` re-uploads an existing PPT's URL. PolyV
 *   dedupes identical PPT content (returns the same fileId, no new record), so
 *   this is an idempotent write with no orphan data and no cleanup needed.
 * - `ai video-produce ppt async-upload` starts the async URL upload path against
 *   an existing PPT URL. It is gated by POLYV_TEST_ALLOW_AI_PPT_ASYNC_UPLOAD
 *   because the API has no PPT delete command if dedupe behavior changes.
 *
 * Per the integration-test convention, every real test still creates (and
 * deletes in `finally`) a temporary channel as the real test asset, even though
 * these account-scoped commands do not take a channel-id argument.
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
const shouldRunAsyncUploadTest =
  shouldRunRealChannelTests && process.env.POLYV_TEST_ALLOW_AI_PPT_ASYNC_UPLOAD === 'true';

interface VideoProduceTask {
  id: number;
  videoName?: string;
}

interface VideoProducePpt {
  fileId: string;
  fileName?: string;
  fileUrl?: string;
}

describe('ai video-produce CLI integration (account-scoped)', () => {
  (shouldRunRealChannelTests ? it : it.skip)(
    'gets a video produce task by id via real CLI',
    () => {
      let channelId: string | undefined;

      try {
        channelId = createTemporaryChannel('AI Video Produce Get');

        // Discover a real task id on the account.
        const listOutput = runCliSuccess([
          'ai',
          'video-produce',
          'list',
          '--page',
          '1',
          '--size',
          '5',
          '--output',
          'json',
        ]);
        const listPayload = parseJsonObject(listOutput) as {
          contents: VideoProduceTask[];
        };
        expect(Array.isArray(listPayload.contents)).toBe(true);
        expect(listPayload.contents.length).toBeGreaterThan(0);
        const taskId = listPayload.contents[0].id;
        expect(typeof taskId).toBe('number');

        const task = parseJsonObject(
          runCliSuccess([
            'ai',
            'video-produce',
            'get',
            '--id',
            String(taskId),
            '--output',
            'json',
          ]),
        ) as VideoProduceTask;

        expect(task.id).toBe(taskId);
        expect(typeof task.videoName).toBe('string');
      } finally {
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    120000,
  );

  (shouldRunRealChannelTests ? it : it.skip)(
    'gets a ppt and re-uploads it idempotently via real CLI',
    () => {
      let channelId: string | undefined;

      try {
        channelId = createTemporaryChannel('AI Video Produce Ppt');

        // Discover the existing PPTs (fileId + fileUrl) on the account and
        // snapshot their fileIds before the re-upload.
        const listOutput = runCliSuccess([
          'ai',
          'video-produce',
          'ppt',
          'list',
          '--page',
          '1',
          '--size',
          '50',
          '--output',
          'json',
        ]);
        const listPayload = parseJsonObject(listOutput) as {
          contents: VideoProducePpt[];
        };
        expect(Array.isArray(listPayload.contents)).toBe(true);
        expect(listPayload.contents.length).toBeGreaterThan(0);
        const ppt = listPayload.contents[0];
        expect(typeof ppt.fileId).toBe('string');
        expect(ppt.fileId.length).toBeGreaterThan(0);
        expect(typeof ppt.fileUrl).toBe('string');
        const existingFileIds = new Set(
          listPayload.contents.map((item) => item.fileId),
        );

        // Read the PPT by file-id.
        const fetched = parseJsonObject(
          runCliSuccess([
            'ai',
            'video-produce',
            'ppt',
            'get',
            '--file-id',
            ppt.fileId,
            '--output',
            'json',
          ]),
        ) as VideoProducePpt;
        expect(fetched.fileId).toBe(ppt.fileId);

        // Re-upload an existing PPT's URL. PolyV dedupes identical content and
        // returns an already-existing fileId, so no new PPT record is created.
        // (Dedup is by content, not by upload path, so the returned fileId is
        // the content hash — assert it already exists in the account.)
        const reuploaded = parseJsonObject(
          runCliSuccess([
            'ai',
            'video-produce',
            'ppt',
            'upload',
            '--url',
            String(ppt.fileUrl),
            '--force',
            '--output',
            'json',
          ]),
        ) as { fileId: string };
        expect(typeof reuploaded.fileId).toBe('string');
        expect(reuploaded.fileId.length).toBeGreaterThan(0);
        expect(existingFileIds.has(reuploaded.fileId)).toBe(true);
      } finally {
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    120000,
  );

  (shouldRunAsyncUploadTest ? it : it.skip)(
    'starts async ppt upload via real CLI against an existing PPT URL',
    () => {
      let channelId: string | undefined;

      try {
        channelId = createTemporaryChannel('AI Video Produce Ppt Async');

        const listOutput = runCliSuccess([
          'ai',
          'video-produce',
          'ppt',
          'list',
          '--page',
          '1',
          '--size',
          '50',
          '--output',
          'json',
        ]);
        const listPayload = parseJsonObject(listOutput) as {
          contents: VideoProducePpt[];
        };
        expect(Array.isArray(listPayload.contents)).toBe(true);
        expect(listPayload.contents.length).toBeGreaterThan(0);
        const ppt = listPayload.contents[0];
        expect(typeof ppt.fileUrl).toBe('string');
        expect(String(ppt.fileUrl).length).toBeGreaterThan(0);
        const existingFileIds = new Set(
          listPayload.contents.map((item) => item.fileId),
        );

        const asyncUploaded = parseJsonObject(
          runCliSuccess([
            'ai',
            'video-produce',
            'ppt',
            'async-upload',
            '--url',
            String(ppt.fileUrl),
            '--type',
            'common',
            '--force',
            '--output',
            'json',
          ]),
        ) as { fileId: string };

        expect(typeof asyncUploaded.fileId).toBe('string');
        expect(asyncUploaded.fileId.length).toBeGreaterThan(0);
        expect(existingFileIds.has(asyncUploaded.fileId)).toBe(true);
      } finally {
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    120000,
  );

  (shouldRunRealChannelTests ? it : it.skip)(
    'deletes a video produce task via real CLI (missing-resource error on fake id)',
    () => {
      let channelId: string | undefined;

      try {
        channelId = createTemporaryChannel('AI Video Produce Delete');

        // The SDK previously sent the JSON body field as `id`, but the server
        // expects `aiPPTVideoId` (see video-produce-delete.md); the SDK now maps
        // `id` -> `aiPPTVideoId`. A non-existent id is deterministically
        // rejected before any state changes — exit 1 with a fixed message — so
        // only the temp channel needs cleanup.
        const result = runCli([
          'ai',
          'video-produce',
          'delete',
          '--id',
          '999999999',
          '--force',
          '--output',
          'json',
        ]);

        expect(result.exitCode).toBe(1);
        expect(result.output).toContain(
          '删除失败, 任务不存在或任务当前状态不支持被删除',
        );
      } finally {
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    120000,
  );

  // Sanity check that the CLI surface exists even without real credentials.
  it('exposes the targeted ai video-produce subcommands through the real CLI entry', () => {
    const checks: Array<[string[], string]> = [
      [['ai', 'video-produce', 'get', '--help'], '查询AI视频制作任务'],
      [['ai', 'video-produce', 'ppt', 'get', '--help'], '查询视频制作PPT'],
      [['ai', 'video-produce', 'ppt', 'upload', '--help'], '上传视频制作PPT'],
      [['ai', 'video-produce', 'ppt', 'async-upload', '--help'], '异步上传视频制作PPT'],
    ];

    for (const [args, marker] of checks) {
      const result = runCli(args, { includeTestEnv: false, rejectOnError: true });
      expect(result.stdout).toContain(marker);
    }
  });
});
