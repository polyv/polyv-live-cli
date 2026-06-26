/**
 * @fileoverview Real-CLI integration tests for viewer subcommands.
 *
 * Lifecycles executed through the local CLI entry:
 *
 *  - `viewer create` returns `{ success, data: { viewerUnionId, nickname,
 *    mobile, source, ... } }` with viewerUnionId surfaced in `data`.
 *  - `viewer get` returns the raw viewer object (NOT wrapped in success/data).
 *  - `viewer update` returns `{ success, data: { viewerUnionId, nickname } }`.
 *  - `viewer delete` returns `{ success, data: { viewerUnionId } }`.
 *  - `viewer import-external` returns `{ success, data: [{ viewerUnionId,
 *    source: 'IMPORT', ... }] }`; the imported viewer is cleaned up via
 *    `viewer delete`.
 *  - `viewer tag create` returns `{ success, data: [{ id, label }] }` (numeric
 *    tag id at `data[0].id`); `viewer tag add` / `tag remove` return the batch
 *    summary `{ action, succeeded, failed, total, results: [{ viewerUnionId,
 *    labelId, success }] }` (NOT wrapped in success/data).
 *  - `viewer label channel-ref add` returns `{ success, data: { channelIds,
 *    labelIds } }`; the account label is created via `viewer label create`
 *    (string label id at `data.id`, name limited to 8 chars) and deleted in
 *    `finally`.
 *
 * These are account-level viewer operations (no channel-id required for
 * create/import/tag); per the integration-test convention a temporary channel
 * is still created as the real test asset and deleted in `finally`. Created
 * viewers/tags/labels are deleted in `finally` so the account tables are not
 * polluted.
 *
 * NOTE: packages/cli/tests/integration/viewer.integration.test.ts drives the
 * SDK service layer directly (ViewerServiceSdk, 0 runCli calls) and so does
 * NOT count toward real-CLI coverage — this file is the real-CLI counterpart.
 */

import { runCli, sleep } from '../helpers/cli-runner';
import {
  createTemporaryChannel,
  deleteTemporaryChannel,
  parseJsonObject,
  runCliSuccess,
} from '../helpers/channel-fixture';
import { hasRealCredentials } from '../helpers/integration-config';

const shouldRunRealChannelTests = hasRealCredentials();
const viewerConfigMobileLoginEnabled = process.env.POLYV_TEST_VIEWER_CONFIG_MOBILE_LOGIN_ENABLED;
const viewerConfigWxWorkLoginEnabled = process.env.POLYV_TEST_VIEWER_CONFIG_WX_WORK_LOGIN_ENABLED;
const shouldRunViewerConfigUpdateTest =
  shouldRunRealChannelTests &&
  process.env.POLYV_TEST_ALLOW_VIEWER_CONFIG_UPDATE === 'true' &&
  ['Y', 'N'].includes(viewerConfigMobileLoginEnabled || '') &&
  ['Y', 'N'].includes(viewerConfigWxWorkLoginEnabled || '');

describe('viewer CLI CRUD lifecycle integration', () => {
  (shouldRunRealChannelTests ? it : it.skip)(
    'runs the viewer create -> get -> update -> delete lifecycle via real CLI',
    () => {
      let channelId: string | undefined;
      let viewerUnionId: string | undefined;

      try {
        channelId = createTemporaryChannel('Viewer CRUD Lifecycle');
        const ts = Date.now();
        const mobile = `138${String(ts).slice(-8)}`;
        const nickname = `viewer-it-${ts}`;
        const updatedNickname = `${nickname}-upd`;

        // create: imports a viewer record; viewerUnionId is in data.
        const createOutput = runCliSuccess([
          'viewer',
          'create',
          '--nickname',
          nickname,
          '--mobile',
          mobile,
          '--force',
          '--output',
          'json',
        ]);
        const created = parseJsonObject(createOutput);
        expect(created.success).toBe(true);
        const createdData = created.data as Record<string, unknown>;
        viewerUnionId = String(createdData.viewerUnionId);
        expect(viewerUnionId.length).toBeGreaterThan(0);
        expect(String(createdData.nickname)).toBe(nickname);
        expect(String(createdData.mobile)).toBe(mobile);

        // get: returns the raw viewer object directly. The imported viewer
        // record is eventually consistent — for a second or two after create
        // the get returns 未知用户信息 (unknown user) until it replicates, so
        // retry until it resolves (bounded, not a real-error mask).
        const getArgs = ['viewer', 'get', '--viewer-id', viewerUnionId, '--output', 'json'];
        let getOutput: string | undefined;
        let lastGetOutput = '';
        for (let attempt = 0; attempt < 5 && getOutput === undefined; attempt++) {
          const result = runCli(getArgs, {});
          lastGetOutput = result.output;
          if (result.exitCode === 0) {
            getOutput = result.output;
          } else {
            sleep(1000);
          }
        }
        if (getOutput === undefined) {
          throw new Error(`viewer get did not succeed after retries:\n${lastGetOutput}`);
        }
        const fetched = parseJsonObject(getOutput);
        expect(String(fetched.viewerUnionId)).toBe(viewerUnionId);
        expect(String(fetched.nickname)).toBe(nickname);

        // update: renames the viewer nickname.
        const updateOutput = runCliSuccess([
          'viewer',
          'update',
          '--viewer-union-id',
          viewerUnionId,
          '--nickname',
          updatedNickname,
          '--force',
          '--output',
          'json',
        ]);
        const updated = parseJsonObject(updateOutput);
        expect(updated.success).toBe(true);
        const updatedData = updated.data as Record<string, unknown>;
        expect(String(updatedData.viewerUnionId)).toBe(viewerUnionId);
        expect(String(updatedData.nickname)).toBe(updatedNickname);

        // delete: removes the viewer record.
        const deleteOutput = runCliSuccess([
          'viewer',
          'delete',
          '--viewer-union-id',
          viewerUnionId,
          '--force',
          '--output',
          'json',
        ]);
        const deleted = parseJsonObject(deleteOutput);
        expect(deleted.success).toBe(true);
        const deletedData = deleted.data as Record<string, unknown>;
        expect(String(deletedData.viewerUnionId)).toBe(viewerUnionId);
        // Mark cleared so finally does not retry.
        viewerUnionId = undefined;
      } finally {
        // Best-effort viewer cleanup if the test failed before delete.
        if (viewerUnionId) {
          try {
            runCliSuccess([
              'viewer',
              'delete',
              '--viewer-union-id',
              viewerUnionId,
              '--force',
              '--output',
              'json',
            ]);
          } catch {
            // ignore — channel deletion is the primary cleanup.
          }
        }
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
  );

  (shouldRunRealChannelTests ? it : it.skip)(
    'runs viewer import-external -> delete via real CLI',
    () => {
      let channelId: string | undefined;
      let viewerUnionId: string | undefined;

      try {
        channelId = createTemporaryChannel('Viewer ImportExternal');
        const ts = Date.now();

        // import-external: imports an external viewer record; the imported
        // viewerUnionId is surfaced in data[0].viewerUnionId.
        const importOutput = runCliSuccess([
          'viewer',
          'import-external',
          '--external-viewer-id',
          `ext-${ts}`,
          '--nickname',
          `imp-${ts}`,
          '--force',
          '--output',
          'json',
        ]);
        const imported = parseJsonObject(importOutput);
        expect(imported.success).toBe(true);
        const importedData = imported.data as Array<Record<string, unknown>>;
        expect(Array.isArray(importedData)).toBe(true);
        expect(importedData.length).toBeGreaterThan(0);
        viewerUnionId = String(importedData[0].viewerUnionId);
        expect(viewerUnionId.length).toBeGreaterThan(0);
        expect(String(importedData[0].source)).toBe('IMPORT');

        // delete: removes the imported viewer record (cleanup).
        const deleteOutput = runCliSuccess([
          'viewer',
          'delete',
          '--viewer-union-id',
          viewerUnionId,
          '--force',
          '--output',
          'json',
        ]);
        const deleted = parseJsonObject(deleteOutput);
        expect(deleted.success).toBe(true);
        viewerUnionId = undefined;
      } finally {
        if (viewerUnionId) {
          try {
            runCliSuccess([
              'viewer',
              'delete',
              '--viewer-union-id',
              viewerUnionId,
              '--force',
              '--output',
              'json',
            ]);
          } catch {
            // ignore — channel deletion is the primary cleanup.
          }
        }
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
  );

  (shouldRunRealChannelTests ? it : it.skip)(
    'runs the viewer tag add -> remove lifecycle via real CLI',
    () => {
      let channelId: string | undefined;
      let viewerUnionId: string | undefined;
      let tagId: number | undefined;

      try {
        channelId = createTemporaryChannel('Viewer Tag Add/Remove');
        const ts = Date.now();
        const mobile = `138${String(ts).slice(-8)}`;

        // Create a viewer record to tag (viewerUnionId is the viewer-id the
        // tag add/remove batch endpoint expects).
        const createOutput = runCliSuccess([
          'viewer',
          'create',
          '--nickname',
          `vtag-${ts}`,
          '--mobile',
          mobile,
          '--force',
          '--output',
          'json',
        ]);
        const created = parseJsonObject(createOutput);
        expect(created.success).toBe(true);
        viewerUnionId = String((created.data as Record<string, unknown>).viewerUnionId);
        expect(viewerUnionId.length).toBeGreaterThan(0);

        // Create a viewer tag; numeric tag id is in data[0].id.
        const tagOutput = runCliSuccess([
          'viewer',
          'tag',
          'create',
          '-l',
          `vtag-${ts}`,
          '--force',
          '--output',
          'json',
        ]);
        const tagCreated = parseJsonObject(tagOutput);
        expect(tagCreated.success).toBe(true);
        const tagData = tagCreated.data as Array<Record<string, unknown>>;
        expect(Array.isArray(tagData)).toBe(true);
        expect(tagData.length).toBeGreaterThan(0);
        tagId = Number(tagData[0].id);
        expect(Number.isInteger(tagId)).toBe(true);

        // tag add: batch add the tag to the viewer. Output is the batch
        // summary (NOT wrapped in success/data): action/succeeded/results.
        const addOutput = runCliSuccess([
          'viewer',
          'tag',
          'add',
          '-V',
          viewerUnionId,
          '-l',
          String(tagId),
          '--force',
          '--output',
          'json',
        ]);
        const added = parseJsonObject(addOutput);
        expect(String(added.action)).toBe('添加');
        expect(Number(added.succeeded)).toBeGreaterThanOrEqual(1);
        const addResults = added.results as Array<Record<string, unknown>>;
        expect(addResults.length).toBeGreaterThan(0);
        expect(addResults[0].success).toBe(true);
        expect(String(addResults[0].viewerUnionId)).toBe(viewerUnionId);
        expect(Number(addResults[0].labelId)).toBe(tagId);

        // tag remove: batch remove the tag from the viewer (reversible).
        const removeOutput = runCliSuccess([
          'viewer',
          'tag',
          'remove',
          '-V',
          viewerUnionId,
          '-l',
          String(tagId),
          '--force',
          '--output',
          'json',
        ]);
        const removed = parseJsonObject(removeOutput);
        expect(String(removed.action)).toBe('移除');
        expect(Number(removed.succeeded)).toBeGreaterThanOrEqual(1);
        const removeResults = removed.results as Array<Record<string, unknown>>;
        expect(removeResults.length).toBeGreaterThan(0);
        expect(removeResults[0].success).toBe(true);

        // Cleanup the tag and viewer.
        runCliSuccess([
          'viewer',
          'tag',
          'delete',
          '--id',
          String(tagId),
          '--force',
          '--output',
          'json',
        ]);
        tagId = undefined;
        runCliSuccess([
          'viewer',
          'delete',
          '--viewer-union-id',
          viewerUnionId,
          '--force',
          '--output',
          'json',
        ]);
        viewerUnionId = undefined;
      } finally {
        if (tagId) {
          try {
            runCliSuccess([
              'viewer',
              'tag',
              'delete',
              '--id',
              String(tagId),
              '--force',
              '--output',
              'json',
            ]);
          } catch {
            // ignore
          }
        }
        if (viewerUnionId) {
          try {
            runCliSuccess([
              'viewer',
              'delete',
              '--viewer-union-id',
              viewerUnionId,
              '--force',
              '--output',
              'json',
            ]);
          } catch {
            // ignore
          }
        }
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
  );

  (shouldRunRealChannelTests ? it : it.skip)(
    'runs viewer label channel-ref add via real CLI',
    () => {
      let channelId: string | undefined;
      let labelId: string | undefined;

      try {
        channelId = createTemporaryChannel('Viewer Label ChannelRef');
        const ts = Date.now();

        // Create an account label (name limited to 8 chars); string label id
        // is in data.id.
        const labelOutput = runCliSuccess([
          'viewer',
          'label',
          'create',
          '--label-name',
          `r${String(ts).slice(-7)}`,
          '--force',
          '--output',
          'json',
        ]);
        const labelCreated = parseJsonObject(labelOutput);
        expect(labelCreated.success).toBe(true);
        const labelData = labelCreated.data as Record<string, unknown>;
        labelId = String(labelData.id);
        expect(labelId.length).toBeGreaterThan(0);

        // channel-ref add: bind the account label to the temp channel.
        // Channel-scoped write — temp channel deletion cleans the binding.
        const refOutput = runCliSuccess([
          'viewer',
          'label',
          'channel-ref',
          'add',
          '-c',
          channelId,
          '-l',
          labelId,
          '--force',
          '--output',
          'json',
        ]);
        const refAdded = parseJsonObject(refOutput);
        expect(refAdded.success).toBe(true);
        const refData = refAdded.data as Record<string, unknown>;
        expect((refData.channelIds as string[]).includes(channelId)).toBe(true);
        expect((refData.labelIds as string[]).includes(labelId)).toBe(true);

        // Cleanup the account label.
        runCliSuccess([
          'viewer',
          'label',
          'delete',
          '--label-id',
          labelId,
          '--force',
          '--output',
          'json',
        ]);
        labelId = undefined;
      } finally {
        if (labelId) {
          try {
            runCliSuccess([
              'viewer',
              'label',
              'delete',
              '--label-id',
              labelId,
              '--force',
              '--output',
              'json',
            ]);
          } catch {
            // ignore
          }
        }
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
  );

  // lottery-wins takes a viewer-id; a freshly imported viewer (no lottery
  // activity) returns a well-formed empty page rather than an error.
  (shouldRunRealChannelTests ? it : it.skip)(
    'lists viewer lottery wins via real CLI',
    () => {
      let channelId: string | undefined;
      let viewerUnionId: string | undefined;

      try {
        channelId = createTemporaryChannel('Viewer Lottery Wins');
        const ts = Date.now();
        const mobile = `138${String(ts).slice(-8)}`;

        const createOutput = runCliSuccess([
          'viewer', 'create',
          '--nickname', `lottery-it-${ts}`,
          '--mobile', mobile,
          '--force', '--output', 'json',
        ]);
        viewerUnionId = String(
          (parseJsonObject(createOutput).data as Record<string, unknown>).viewerUnionId,
        );
        expect(viewerUnionId.length).toBeGreaterThan(0);

        const payload = parseJsonObject(
          runCliSuccess(['viewer', 'lottery-wins', '--viewer-id', viewerUnionId, '--output', 'json']),
        );

        expect(typeof payload.pageNumber).toBe('number');
        expect(typeof payload.pageSize).toBe('number');
        expect(payload.totalItems).toBe(0);
        expect(Array.isArray(payload.contents)).toBe(true);
      } finally {
        if (viewerUnionId) {
          try {
            runCliSuccess(['viewer', 'delete', '--viewer-union-id', viewerUnionId, '--force', '--output', 'json']);
          } catch {
            // best-effort viewer cleanup
          }
        }
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
  );

  // `viewer config update` is an account-level write with no paired CLI read
  // command to snapshot and restore the previous values. Keep real execution
  // behind an explicit opt-in and explicit target values; still create/delete a
  // temporary channel so the test has an isolated real asset per convention.
  (shouldRunViewerConfigUpdateTest ? it : it.skip)(
    'updates viewer user-system config via real CLI when explicitly allowed',
    () => {
      let channelId: string | undefined;

      try {
        channelId = createTemporaryChannel('Viewer Config Update');

        const payload = parseJsonObject(
          runCliSuccess([
            'viewer',
            'config',
            'update',
            '--mobile-login-enabled',
            viewerConfigMobileLoginEnabled as string,
            '--wx-work-login-enabled',
            viewerConfigWxWorkLoginEnabled as string,
            '--force',
            '--output',
            'json',
          ]),
        );

        expect(payload.success).toBe(true);
        const data = payload.data as Record<string, unknown>;
        expect(data.mobileLoginEnabled).toBe(viewerConfigMobileLoginEnabled);
        expect(data.wxWorkLoginEnabled).toBe(viewerConfigWxWorkLoginEnabled);
      } finally {
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    120000,
  );

  // Command-surface checks run unconditionally (no real credentials needed).
  it('exposes the viewer CRUD subcommands via --help', () => {
    const checks: Array<{ args: string[]; text: string }> = [
      { args: ['viewer', 'create', '--help'], text: '--nickname' },
      { args: ['viewer', 'get', '--help'], text: '--viewer-id' },
      { args: ['viewer', 'update', '--help'], text: '--viewer-union-id' },
      { args: ['viewer', 'delete', '--help'], text: '--viewer-union-id' },
      { args: ['viewer', 'import-external', '--help'], text: '--external-viewer-id' },
      { args: ['viewer', 'tag', 'add', '--help'], text: '--viewer-ids' },
      { args: ['viewer', 'tag', 'remove', '--help'], text: '--viewer-ids' },
      { args: ['viewer', 'label', 'channel-ref', 'add', '--help'], text: '--channel-ids' },
    ];

    for (const check of checks) {
      const result = runCli(check.args, { includeTestEnv: false });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain(check.text);
    }
  });
});
