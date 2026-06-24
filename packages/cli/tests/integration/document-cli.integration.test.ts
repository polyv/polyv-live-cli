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
