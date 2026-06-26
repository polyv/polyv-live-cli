/**
 * @fileoverview Real-CLI integration tests for channel-scoped document
 * subcommands (upload/status/delete).
 *
 * A self-contained create→read→delete loop executed through the local CLI
 * entry against a throwaway temporary channel:
 *
 *  - `document upload` uploads a courseware doc by URL; the server fetches the
 *    file and returns `{ channelId, fileName, fileId, convertType, status }`.
 *  - `document status` reads the transcode status for a file-id (previously
 *    considered fragile because it needs a file-id, but upload supplies one);
 *    returns an array `[{ fileId, convertStatus, type, totalPage, imageCount }]`.
 *  - `document delete` removes the doc by file-id; returns
 *    `{ channelId, fileId, fileName, status: "已删除" }`.
 *
 * NOTE: packages/cli/tests/integration/document.integration.test.ts drives the
 * SDK service layer directly (DocumentServiceSdk, 0 runCli calls) and so does
 * NOT count toward real-CLI coverage — this file is the real-CLI counterpart.
 */

import { runCli } from '../helpers/cli-runner';
import {
  createTemporaryChannel,
  deleteTemporaryChannel,
  parseJsonValue,
  parseJsonObject,
  runCliSuccess,
} from '../helpers/channel-fixture';
import { hasRealCredentials } from '../helpers/integration-config';

const shouldRunRealDocTests = hasRealCredentials();
const documentMediaVid = process.env.POLYV_TEST_DOCUMENT_MEDIA_VID?.trim();
const shouldRunDocumentMediaLinkTest = shouldRunRealDocTests && Boolean(documentMediaVid);

// Server-fetchable image URL (PolyV CDN); reused from the player/product write
// families. The document service accepts it as a courseware file.
const DOC_URL = 'https://s2.videocc.net/watch-theme/spring/v2/assets/common/player-cover.png';

describe('document CLI channel-scoped lifecycle integration', () => {
  (shouldRunRealDocTests ? it : it.skip)(
    'runs document upload, status, and delete via real CLI on a temporary channel',
    () => {
      let channelId: string | undefined;
      let fileId: string | undefined;

      try {
        channelId = createTemporaryChannel('Doc Lifecycle');

        // upload: server fetches the URL and returns a fileId synchronously.
        const uploadOutput = runCliSuccess([
          'document',
          'upload',
          '-c',
          channelId,
          '--url',
          DOC_URL,
          '--doc-name',
          'it-doc',
          '--output',
          'json',
        ]);
        const uploaded = parseJsonObject(uploadOutput) as {
          channelId?: string;
          fileId?: string;
          fileName?: string;
        };
        expect(String(uploaded.channelId)).toBe(channelId);
        expect(typeof uploaded.fileId).toBe('string');
        expect(uploaded.fileId).not.toBe('');
        fileId = String(uploaded.fileId);

        // status: read transcode status for the uploaded file-id (returns an array).
        const statusOutput = runCliSuccess([
          'document',
          'status',
          '-c',
          channelId,
          '--file-id',
          fileId,
          '--output',
          'json',
        ]);
        const statusArr = parseJsonValue(statusOutput);
        expect(Array.isArray(statusArr)).toBe(true);
        const matching = (statusArr as Array<Record<string, unknown>>).find(
          (item) => String(item?.fileId) === fileId
        );
        expect(matching).toBeDefined();
        expect(typeof matching?.convertStatus).toBe('string');

        // delete: remove the doc by file-id.
        const deleteOutput = runCliSuccess([
          'document',
          'delete',
          '-c',
          channelId,
          '--file-id',
          fileId,
          '--force',
          '--output',
          'json',
        ]);
        const deleted = parseJsonObject(deleteOutput) as {
          fileId?: string;
          status?: string;
        };
        expect(String(deleted.fileId)).toBe(fileId);
        expect(String(deleted.status)).toBe('已删除');
        fileId = undefined; // cleaned up
      } finally {
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    120000,
  );

  // `document media unlink` (/live/v4/channel/multimedia/resource/delete-batch) is an
  // idempotent batch-delete: unlinking vid ids that were never linked to the channel
  // resolves with { channelId, vids, success } (real server response, exit 0). The link
  // counterpart needs a real fetchable vid ("找不到视频信息"), so it stays uncovered, but
  // unlink processes gracefully on a probe vid — analogous to the interaction script
  // delete probe. Nothing is linked, so nothing needs cleanup.
  (shouldRunRealDocTests ? it : it.skip)(
    'runs document media unlink via real CLI on a temporary channel (idempotent on a probe vid)',
    () => {
      let channelId: string | undefined;

      try {
        channelId = createTemporaryChannel('Doc Media Unlink');
        const probeVid = 'cli-it-media-unlink-probe-0001';

        const output = parseJsonObject(
          runCliSuccess([
            'document',
            'media',
            'unlink',
            '-c',
            channelId,
            '--vids',
            probeVid,
            '--force',
            '--output',
            'json',
          ]),
        ) as { channelId?: string; vids?: string; success?: unknown };

        // The server echoes back the requested channel + vids (delete-batch of a
        // non-existent vid is a no-op returning null data), proving the real endpoint
        // was reached beyond the exit code.
        expect(String(output.channelId)).toBe(channelId);
        expect(String(output.vids)).toBe(probeVid);
      } finally {
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    120000,
  );

  (shouldRunDocumentMediaLinkTest ? it : it.skip)(
    'links and unlinks a document media vid via real CLI on a temporary channel',
    () => {
      let channelId: string | undefined;
      let linked = false;
      const cleanupErrors: string[] = [];

      try {
        channelId = createTemporaryChannel('Doc Media Link');
        const vid = documentMediaVid as string;

        const linkOutput = parseJsonObject(
          runCliSuccess([
            'document',
            'media',
            'link',
            '-c',
            channelId,
            '--vids',
            vid,
            '--force',
            '--output',
            'json',
          ]),
        ) as { channelId?: string; vids?: string; success?: unknown };
        linked = true;

        expect(String(linkOutput.channelId)).toBe(channelId);
        expect(String(linkOutput.vids)).toBe(vid);
        expect(Object.prototype.hasOwnProperty.call(linkOutput, 'success')).toBe(true);

        const unlinkOutput = parseJsonObject(
          runCliSuccess([
            'document',
            'media',
            'unlink',
            '-c',
            channelId,
            '--vids',
            vid,
            '--force',
            '--output',
            'json',
          ]),
        ) as { channelId?: string; vids?: string; success?: unknown };
        linked = false;

        expect(String(unlinkOutput.channelId)).toBe(channelId);
        expect(String(unlinkOutput.vids)).toBe(vid);
        expect(Object.prototype.hasOwnProperty.call(unlinkOutput, 'success')).toBe(true);
      } finally {
        if (channelId && linked && documentMediaVid) {
          try {
            runCliSuccess([
              'document',
              'media',
              'unlink',
              '-c',
              channelId,
              '--vids',
              documentMediaVid,
              '--force',
              '--output',
              'json',
            ]);
          } catch (error) {
            cleanupErrors.push(error instanceof Error ? error.message : String(error));
          }
        }

        if (channelId) {
          try {
            deleteTemporaryChannel(channelId);
          } catch (error) {
            cleanupErrors.push(error instanceof Error ? error.message : String(error));
          }
        }

        if (cleanupErrors.length > 0) {
          throw new Error(`Document media link cleanup failed:\n${cleanupErrors.join('\n')}`);
        }
      }
    },
    120000,
  );

  (shouldRunRealDocTests ? it : it.skip)(
    'runs document media user-detail and user-delete via real CLI with temporary channel context',
    () => {
      let channelId: string | undefined;
      const probeVid = 'cli-it-media-user-probe-0001';

      try {
        channelId = createTemporaryChannel('Doc Media User');

        const detailOutput = runCliSuccess([
          'document',
          'media',
          'user-detail',
          '--vids',
          probeVid,
          '--output',
          'json',
        ]);
        const detail = parseJsonValue(detailOutput);
        expect(Array.isArray(detail)).toBe(true);

        const deleteOutput = parseJsonObject(
          runCliSuccess([
            'document',
            'media',
            'user-delete',
            '--vids',
            probeVid,
            '--force',
            '--output',
            'json',
          ]),
        ) as { vids?: string; success?: unknown };
        expect(String(deleteOutput.vids)).toBe(probeVid);
        expect(Object.prototype.hasOwnProperty.call(deleteOutput, 'success')).toBe(true);
      } finally {
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    120000,
  );

  // Command-surface checks (no credentials required, always run).
  it('exposes document upload, status, and delete commands', () => {
    const commands = [
      ['document', 'upload', '--help'],
      ['document', 'status', '--help'],
      ['document', 'delete', '--help'],
    ];
    for (const args of commands) {
      const result = runCli(args, { timeout: 15000 });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('Usage:');
    }
  });
});
