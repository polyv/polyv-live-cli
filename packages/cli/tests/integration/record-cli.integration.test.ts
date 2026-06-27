/**
 * @fileoverview Real-CLI integration tests for record subcommands.
 *
 * `record file delete` is exercised through the local CLI entry against a
 * throwaway channel. A freshly-created channel has no historical recordings, so
 * the delete target is a non-existent record file. The backend either
 * idempotently accepts the delete (structured `{ channelId, sessionId, deleted:
 * true }`, exit 0) or rejects the missing record with the business error
 * "record file not exist." (exit 1); both are legitimate real-API outcomes and
 * the test asserts whichever the server returns, proving the delete path ran.
 *
 * `record outline get` is a channel-scoped read of a staged-video outline. A
 * fresh channel has no staged draft files, so querying a non-existent file-id
 * deterministically surfaces the business error "找不到暂存文件" (draft file
 * not found, exit 1) — a genuine real-API read of the missing-resource path,
 * mirroring the covered `session get`.
 */

import {
  createTemporaryChannel,
  deleteTemporaryChannel,
  parseJsonObject,
} from '../helpers/channel-fixture';
import { runCli } from '../helpers/cli-runner';
import { hasRealCredentials } from '../helpers/integration-config';

const shouldRunRealChannelTests = hasRealCredentials();

describe('record CLI real execution integration', () => {
  (shouldRunRealChannelTests ? it : it.skip)(
    'runs record file delete via real CLI against a temporary channel',
    () => {
      let channelId: string | undefined;

      try {
        channelId = createTemporaryChannel('Record File Delete');
        const sessionId = `cli-it-record-delete-${Date.now().toString(36)}`;

        // The real CLI delete call runs against the V4 record API. The backend
        // either idempotently accepts the delete of a non-existent record
        // (exit 0, structured payload) or rejects it as "record file not
        // exist." (exit 1) — assert whichever deterministic path the server
        // takes, both prove the delete path executed end-to-end.
        const result = runCli([
          'record',
          'file',
          'delete',
          '--channel-id',
          channelId,
          '--session-id',
          sessionId,
          '--force',
          '--output',
          'json',
        ]);

        if (result.exitCode === 0) {
          const payload = parseJsonObject(result.output);
          expect(String(payload.channelId)).toBe(channelId);
          expect(String(payload.sessionId)).toBe(sessionId);
          expect(payload.deleted).toBe(true);
        } else {
          expect(result.exitCode).toBe(1);
          expect(result.output).toContain('record file not exist');
        }
      } finally {
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    120000,
  );

  (shouldRunRealChannelTests ? it : it.skip)(
    'runs record outline get via real CLI (no draft file on a fresh channel)',
    () => {
      let channelId: string | undefined;
      // A fresh channel has no staged/draft recordings, so the outline of a
      // non-existent draft file-id is deterministically reported as
      // "找不到暂存文件" (draft file not found, exit 1) — a genuine real-API
      // read of the missing-resource path.
      const fakeFileId = `gnhf-fake-file-${Date.now().toString(36)}`;

      try {
        channelId = createTemporaryChannel('Record Outline Get CLI');

        const result = runCli([
          'record',
          'outline',
          'get',
          '-c',
          channelId,
          '--file-id',
          fakeFileId,
          '-o',
          'json',
        ]);

        // exit 1 + the deterministic business error proves the real outline
        // endpoint was hit with the requested channel/file ids.
        expect(result.exitCode).toBe(1);
        expect(result.output).toContain('找不到暂存文件');
      } finally {
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    120000,
  );
});
