/**
 * @fileoverview Real-CLI integration tests for the `webapp role` write
 * subcommands (create / get / update / delete).
 *
 * `webapp role` is an account-scoped application-role CRUD lifecycle. The
 * `create` response only surfaces `{ success: true }` (the role id is not
 * echoed), so the new role's id is discovered by listing roles and matching on
 * the unique name; `get` returns the role + permission tree; `update` and
 * `delete` echo `{ success: true, roleId }`.
 *
 * The test runs a create -> get -> update -> delete loop through the real CLI
 * and cleans up the created role (plus the temporary channel) in `finally`.
 * Per the integration-test convention, a temporary channel is still created as
 * the real test asset even though these commands are account-scoped and take no
 * channel-id.
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

// 104 = a real leaf WebApp permission (live-create-channel) returned by
// `webapp permission-list`; used as the assigned permission for the test role.
const LEAF_PERMISSION_ID = '104';

function discoverRoleIdByName(name: string): number {
  const output = runCliSuccess([
    'webapp',
    'role',
    'list',
    '--page-number',
    '1',
    '--page-size',
    '100',
    '--output',
    'json',
  ]);
  const parsed = parseJsonObject(output) as { contents?: Array<{ id?: number; name?: string }> };
  const contents = Array.isArray(parsed.contents) ? parsed.contents : [];
  const match = contents.find((role) => role && role.name === name);
  if (!match || !Number.isInteger(Number(match.id))) {
    throw new Error(`Could not discover roleId for name "${name}" in:\n${output}`);
  }

  return Number(match.id);
}

describe('webapp role CLI write lifecycle integration', () => {
  (shouldRunRealChannelTests ? it : it.skip)(
    'runs the webapp role create -> get -> update -> delete lifecycle via real CLI',
    () => {
      let channelId: string | undefined;
      let roleId: number | undefined;

      try {
        // Account-scoped writes; the temporary channel is the real test asset.
        channelId = createTemporaryChannel('WebApp Role Lifecycle');
        // Role names are capped at 20 characters server-side.
        const roleName = `pwa${Date.now().toString().slice(-10)}`;
        const renamed = `${roleName}u`;

        // create only surfaces { success: true }; discover the id via list.
        const createOutput = runCliSuccess([
          'webapp',
          'role',
          'create',
          '--name',
          roleName,
          '--desc',
          'cli it',
          '--role-type',
          'child',
          '--permission-ids',
          LEAF_PERMISSION_ID,
          '--force',
          '--output',
          'json',
        ]);
        const created = parseJsonObject(createOutput) as { success?: boolean };
        expect(created.success).toBe(true);

        roleId = discoverRoleIdByName(roleName);
        expect(roleId).toBeGreaterThan(0);

        // get returns the role detail with the assigned name.
        const getOutput = runCliSuccess([
          'webapp',
          'role',
          'get',
          '--role-id',
          String(roleId),
          '--output',
          'json',
        ]);
        const detail = parseJsonObject(getOutput) as {
          role?: { id?: number; name?: string };
          permissions?: unknown;
        };
        expect(Number(detail.role?.id)).toBe(roleId);
        expect(detail.role?.name).toBe(roleName);
        expect(Array.isArray(detail.permissions)).toBe(true);

        // update renames the role and reports success.
        const updateOutput = runCliSuccess([
          'webapp',
          'role',
          'update',
          '--role-id',
          String(roleId),
          '--name',
          renamed,
          '--desc',
          'cli it updated',
          '--role-type',
          'child',
          '--permission-ids',
          LEAF_PERMISSION_ID,
          '--force',
          '--output',
          'json',
        ]);
        const updated = parseJsonObject(updateOutput) as {
          success?: boolean;
          roleId?: number;
        };
        expect(updated.success).toBe(true);
        expect(Number(updated.roleId)).toBe(roleId);

        // delete closes the create -> update -> delete loop.
        const deleteOutput = runCliSuccess([
          'webapp',
          'role',
          'delete',
          '--role-id',
          String(roleId),
          '--force',
          '--output',
          'json',
        ]);
        const deleted = parseJsonObject(deleteOutput) as {
          success?: boolean;
          roleId?: number;
        };
        expect(deleted.success).toBe(true);
        expect(Number(deleted.roleId)).toBe(roleId);
        roleId = undefined;
      } finally {
        if (roleId !== undefined) {
          // Safety-net cleanup if a step failed mid-lifecycle.
          try {
            runCliSuccess([
              'webapp',
              'role',
              'delete',
              '--role-id',
              String(roleId),
              '--force',
              '--output',
              'json',
            ]);
          } catch {
            // Best-effort; the role may already be gone.
          }
        }
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    240000,
  );

  // Sanity check that the CLI surface exists even without real credentials.
  it('exposes the webapp role subcommands through the real CLI entry', () => {
    const checks: Array<[string[], string]> = [
      [['webapp', 'role', 'create', '--help'], '--permission-ids'],
      [['webapp', 'role', 'get', '--help'], '--role-id'],
      [['webapp', 'role', 'update', '--help'], '--role-id'],
      [['webapp', 'role', 'delete', '--help'], '--role-id'],
    ];

    for (const [args, marker] of checks) {
      const result = runCli(args, { includeTestEnv: false, rejectOnError: true });
      expect(result.stdout).toContain(marker);
    }
  });
});
