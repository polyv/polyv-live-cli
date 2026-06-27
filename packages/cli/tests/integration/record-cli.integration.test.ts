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
 *
 * The record write subcommands (`set-default`, `convert`, `file convert`,
 * `file merge`) all resolve a real record/playback resource before mutating
 * state. A freshly-created channel has never broadcast, so any staged-file /
 * session / video reference points at a non-existent resource and the backend
 * deterministically rejects the write up front (exit 1 + fixed business error)
 * before creating any state — a genuine real-API execution of each write path
 * with no cleanup beyond the throwaway channel.
 *
 * `clip`, `merge-mp4` and `merge-mp4-start` likewise resolve the target
 * recordings first (by fileId / creation-time window), so a never-broadcast
 * channel yields "record file not exist" (exit 1). `breakpoint add` controls an
 * in-progress recording by type (pause/resume) and is only effective while
 * live, so it returns "channel in no live" (exit 1) on a fresh channel — a
 * deterministic gate that proves the real endpoint ran. `outline create` and
 * `subtitle publish` look up a staged draft file by id; a non-existent id
 * yields "找不到暂存文件" / "找不到暂存文件字幕" (exit 1). These six paths
 * required SDK fixes (param/body/signature mapping) that were uncovered by
 * probing the real endpoints.
 */

import {
  createTemporaryChannel,
  deleteTemporaryChannel,
  parseJsonObject,
} from '../helpers/channel-fixture';
import { runCli } from '../helpers/cli-runner';
import { getTestConfig, hasRealCredentials } from '../helpers/integration-config';

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

  (shouldRunRealChannelTests ? it : it.skip)(
    'runs record set-default via real CLI (no default playback video on a fresh channel)',
    () => {
      let channelId: string | undefined;

      try {
        channelId = createTemporaryChannel('Record Set Default CLI');

        // A fresh channel has no playback videos, so setting a default for a
        // non-existent video deterministically surfaces
        // "找不到要设置默认的回放视频！" (exit 1) — proving the set-default write
        // path executed against the real V4 record API.
        const result = runCli([
          'record',
          'set-default',
          '-c',
          channelId,
          '--video-id',
          'gnhf-fake-video',
          '--list-type',
          'playback',
          '-o',
          'json',
        ]);

        expect(result.exitCode).toBe(1);
        expect(result.output).toContain('找不到要设置默认的回放视频');
      } finally {
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    120000,
  );

  (shouldRunRealChannelTests ? it : it.skip)(
    'runs record convert via real CLI (async, non-existent file-ids)',
    () => {
      let channelId: string | undefined;
      const fakeFileId = `gnhf-fake-file-${Date.now().toString(36)}`;
      // Precompute the comma-joined file-id list so the runCli array literal
      // stays free of nested brackets (coverage report array matcher).
      const fileIds = `${fakeFileId}a,${fakeFileId}b`;

      try {
        channelId = createTemporaryChannel('Record Convert CLI');

        // Async convert validates file-ids against staged recordings; a fresh
        // channel has none, so the backend deterministically reports
        // "fileId could not be found" (exit 1).
        const result = runCli([
          'record',
          'convert',
          '-c',
          channelId,
          '--file-ids',
          fileIds,
          '--async',
          '--force',
          '-o',
          'json',
        ]);

        expect(result.exitCode).toBe(1);
        expect(result.output).toContain('fileId could not be found');
      } finally {
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    120000,
  );

  (shouldRunRealChannelTests ? it : it.skip)(
    'runs record file convert via real CLI (non-existent session)',
    () => {
      let channelId: string | undefined;
      // Use the real account userId (required param); the convert still fails
      // deterministically because the session does not exist on the channel.
      const userId = getTestConfig().authConfig.userId || 'gnhf-fake-user';

      try {
        channelId = createTemporaryChannel('Record File Convert CLI');

        const result = runCli([
          'record',
          'file',
          'convert',
          '-c',
          channelId,
          '--user-id',
          userId,
          '--file-name',
          'cli-it-record-file-convert',
          '--session-id',
          'gnhf-fake-session',
          '--force',
          '-o',
          'json',
        ]);

        // convertRecordFileToVod looks up the session/file; a non-existent
        // session on a fresh channel deterministically fails with
        // "convet fail" (exit 1).
        expect(result.exitCode).toBe(1);
        expect(result.output).toContain('convet fail');
      } finally {
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    120000,
  );

  (shouldRunRealChannelTests ? it : it.skip)(
    'runs record file merge via real CLI (non-existent file-ids)',
    () => {
      let channelId: string | undefined;
      const fakeFileId = `gnhf-fake-file-${Date.now().toString(36)}`;
      const fileIds = `${fakeFileId}a,${fakeFileId}b`;

      try {
        channelId = createTemporaryChannel('Record File Merge CLI');

        // mergeRecordFiles resolves file-ids to URLs; non-existent ids on a
        // fresh channel deterministically fail with "urls is not exist" (exit 1).
        const result = runCli([
          'record',
          'file',
          'merge',
          '-c',
          channelId,
          '--file-ids',
          fileIds,
          '--file-name',
          'cli-it-record-file-merge',
          '--force',
          '-o',
          'json',
        ]);

        expect(result.exitCode).toBe(1);
        expect(result.output).toContain('urls is not exist');
      } finally {
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    120000,
  );

  (shouldRunRealChannelTests ? it : it.skip)(
    'runs record clip via real CLI (no record file on a fresh channel)',
    () => {
      let channelId: string | undefined;

      try {
        channelId = createTemporaryChannel('Record Clip CLI');

        // clip resolves the target recording by fileId before clipping; a
        // never-broadcast channel has none, so the backend deterministically
        // reports "record file not exist" (exit 1).
        const result = runCli([
          'record',
          'clip',
          '-c',
          channelId,
          '--file-id',
          'gnhf-fake-file',
          '--start-time',
          '0',
          '--end-time',
          '10',
          '--force',
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
    'runs record merge-mp4 via real CLI (no recordings in the time window)',
    () => {
      let channelId: string | undefined;
      // A 1-hour creation-time window far in the past (13-digit ms). The
      // endpoint selects recordings by this window; a fresh channel has none.
      const startTime = '1600000000000';
      const endTime = '1600003600000';

      try {
        channelId = createTemporaryChannel('Record Merge MP4 CLI');

        const result = runCli([
          'record',
          'merge-mp4',
          '-c',
          channelId,
          '--start-time',
          startTime,
          '--end-time',
          endTime,
          '--force',
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
    'runs record merge-mp4-start via real CLI (no recordings in the time window)',
    () => {
      let channelId: string | undefined;
      const startTime = '1600000000000';
      const endTime = '1600003600000';

      try {
        channelId = createTemporaryChannel('Record Merge MP4 Start CLI');

        const result = runCli([
          'record',
          'merge-mp4-start',
          '-c',
          channelId,
          '--start-time',
          startTime,
          '--end-time',
          endTime,
          '--force',
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
    'runs record breakpoint add via real CLI (not-live gate on a fresh channel)',
    () => {
      let channelId: string | undefined;

      try {
        channelId = createTemporaryChannel('Record Breakpoint Add CLI');

        // breakpoint (pause/resume) only applies to an in-progress recording;
        // a fresh channel is not live, so the backend deterministically
        // rejects with "channel in no live" (exit 1) — a real-API gate that
        // proves the endpoint ran without mutating any state.
        const result = runCli([
          'record',
          'breakpoint',
          'add',
          '-c',
          channelId,
          '--type',
          'pause',
          '--force',
          '-o',
          'json',
        ]);

        expect(result.exitCode).toBe(1);
        expect(result.output).toContain('channel in no live');
      } finally {
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    120000,
  );

  (shouldRunRealChannelTests ? it : it.skip)(
    'runs record outline create via real CLI (no draft file)',
    () => {
      // outline create looks up a staged draft file by id; a non-existent id
      // deterministically surfaces "找不到暂存文件" (exit 1). No channel needed.
      const fakeFileId = `gnhf-fake-file-${Date.now().toString(36)}`;

      const result = runCli([
        'record',
        'outline',
        'create',
        '--file-id',
        fakeFileId,
        '--force',
        '-o',
        'json',
      ]);

      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('找不到暂存文件');
    },
    120000,
  );

  (shouldRunRealChannelTests ? it : it.skip)(
    'runs record subtitle publish via real CLI (no draft subtitle)',
    () => {
      // Precompute the subtitles JSON so the runCli array stays free of nested
      // brackets (coverage report array matcher).
      const subtitlesJson = JSON.stringify([{ id: 1, status: 'publish' }]);

      // subtitle publish resolves staged draft subtitles by id; a fake id
      // deterministically surfaces "找不到暂存文件字幕" (exit 1). No channel needed.
      const result = runCli([
        'record',
        'subtitle',
        'publish',
        '--subtitles-json',
        subtitlesJson,
        '--force',
        '-o',
        'json',
      ]);

      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('找不到暂存文件字幕');
    },
    120000,
  );
});
