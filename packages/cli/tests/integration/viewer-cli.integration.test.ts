/**
 * @fileoverview Real-CLI integration tests for viewer CRUD subcommands.
 *
 * A single account-scoped create -> get -> update -> delete lifecycle executed
 * through the local CLI entry:
 *
 *  - `viewer create` returns `{ success, data: { viewerUnionId, nickname,
 *    mobile, source, ... } }` with viewerUnionId surfaced in `data`.
 *  - `viewer get` returns the raw viewer object (NOT wrapped in success/data).
 *  - `viewer update` returns `{ success, data: { viewerUnionId, nickname } }`.
 *  - `viewer delete` returns `{ success, data: { viewerUnionId } }`.
 *
 * `viewer create` is an account-level viewer-import operation (no channel-id
 * required); per the integration-test convention a temporary channel is still
 * created as the real test asset and deleted in `finally`. The created viewer
 * is deleted in `finally` so the account viewer table is not polluted.
 *
 * NOTE: packages/cli/tests/integration/viewer.integration.test.ts drives the
 * SDK service layer directly (ViewerServiceSdk, 0 runCli calls) and so does
 * NOT count toward real-CLI coverage — this file is the real-CLI counterpart.
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

        // get: returns the raw viewer object directly.
        const getOutput = runCliSuccess([
          'viewer',
          'get',
          '--viewer-id',
          viewerUnionId,
          '--output',
          'json',
        ]);
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

  // Command-surface checks run unconditionally (no real credentials needed).
  it('exposes the viewer CRUD subcommands via --help', () => {
    const checks: Array<{ args: string[]; text: string }> = [
      { args: ['viewer', 'create', '--help'], text: '--nickname' },
      { args: ['viewer', 'get', '--help'], text: '--viewer-id' },
      { args: ['viewer', 'update', '--help'], text: '--viewer-union-id' },
      { args: ['viewer', 'delete', '--help'], text: '--viewer-union-id' },
    ];

    for (const check of checks) {
      const result = runCli(check.args, { includeTestEnv: false });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain(check.text);
    }
  });
});
