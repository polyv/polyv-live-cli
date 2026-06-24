import { runCli } from '../helpers/cli-runner';
import {
  createTemporaryChannel,
  deleteTemporaryChannel,
  parseJsonObject,
  runCliSuccess,
} from '../helpers/channel-fixture';
import { hasRealCredentials } from '../helpers/integration-config';

const shouldRunRealChannelTests = hasRealCredentials();

describe('user business CLI integration', () => {
  it('shows product library, tag, and order help', () => {
    const checks = [
      { args: ['product', '--help'], text: 'library' },
      { args: ['product', 'library', '--help'], text: 'create' },
      { args: ['product', 'tag', '--help'], text: 'delete' },
      { args: ['product', 'order', '--help'], text: 'batch-status' },
    ];

    for (const check of checks) {
      const result = runCli(check.args, { includeTestEnv: false });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain(check.text);
    }
  });

  it('shows invite-sales and custom-field help', () => {
    const checks = [
      { args: ['invite-sales', '--help'], text: 'follow-viewer' },
      { args: ['invite-sales', 'follow-viewer', '--help'], text: 'list' },
      { args: ['custom-field', '--help'], text: 'value' },
      { args: ['custom-field', 'value', '--help'], text: 'save' },
    ];

    for (const check of checks) {
      const result = runCli(check.args, { includeTestEnv: false });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain(check.text);
    }
  });

  it('shows force and output options for user business write commands', () => {
    const commands = [
      ['product', 'library', 'create', '--help'],
      ['product', 'library', 'update', '--help'],
      ['product', 'library', 'delete', '--help'],
      ['product', 'tag', 'create', '--help'],
      ['product', 'tag', 'update', '--help'],
      ['product', 'tag', 'delete', '--help'],
      ['product', 'order', 'batch-status', '--help'],
      ['invite-sales', 'add', '--help'],
      ['invite-sales', 'update', '--help'],
      ['invite-sales', 'remove', '--help'],
      ['custom-field', 'add', '--help'],
      ['custom-field', 'value', 'save', '--help'],
    ];

    for (const args of commands) {
      const result = runCli(args, { includeTestEnv: false });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('--force');
      expect(result.output).toContain('--output');
    }
  });

  (shouldRunRealChannelTests ? it : it.skip)('runs user business read commands through the real CLI', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('User Business Read Smoke');
      const id = channelId;
      const readCommands = [
        ['product', 'library', 'list', '--page', '1', '--size', '5', '--output', 'json'],
        ['product', 'tag', 'list', '--channel-id', id, '--page', '1', '--size', '5', '--output', 'json'],
        ['product', 'order', 'list', '--page', '1', '--size', '5', '--output', 'json'],
        ['invite-sales', 'follow-viewer', 'list', '--page', '1', '--page-size', '5', '--output', 'json'],
        ['custom-field', 'list', '--output', 'json'],
      ];

      for (const args of readCommands) {
        runCliSuccess(args);
      }
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 240000);

  // invite-sales add/update/remove is account-scoped (no channel-id). The
  // --viewer-union-ids accepts the viewerUnionId returned by `viewer create`,
  // giving a clean add -> update(verify org change) -> remove(verify gone)
  // lifecycle. A temporary channel is still created/removed per convention.
  (shouldRunRealChannelTests ? it : it.skip)(
    'runs the invite-sales add -> update -> remove lifecycle via real CLI',
    () => {
      let channelId: string | undefined;
      let viewerUnionId: string | undefined;

      try {
        channelId = createTemporaryChannel('Invite Sales Lifecycle');
        const ts = Date.now();
        const mobile = `138${String(ts).slice(-8)}`;
        const nickname = `invite-it-${ts}`;

        // Create a real viewer to supply a viewerUnionId for invite-sales.
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
        viewerUnionId = String((created.data as Record<string, unknown>).viewerUnionId);
        expect(viewerUnionId.length).toBeGreaterThan(0);

        // add: registers the viewer as an invite sale.
        const addOutput = runCliSuccess([
          'invite-sales',
          'add',
          '--viewer-union-ids',
          viewerUnionId,
          '--force',
          '--output',
          'json',
        ]);
        const added = parseJsonObject(addOutput);
        expect(added.success).toBe(true);

        // list confirms the viewer was persisted as an invite sale.
        const listAfterAdd = parseJsonObject(
          runCliSuccess(['invite-sales', 'list', '--viewer-union-id', viewerUnionId, '--output', 'json'])
        );
        expect(listAfterAdd.totalItems).toBe(1);

        // update: moves the invite sale to a child organization (46101 = 子组织1).
        const updateOutput = runCliSuccess([
          'invite-sales',
          'update',
          '--viewer-union-ids',
          viewerUnionId,
          '--organization-id',
          '46101',
          '--force',
          '--output',
          'json',
        ]);
        expect(parseJsonObject(updateOutput).success).toBe(true);

        // list confirms the organization change persisted.
        const listAfterUpdate = parseJsonObject(
          runCliSuccess(['invite-sales', 'list', '--viewer-union-id', viewerUnionId, '--output', 'json'])
        );
        const updatedContents = listAfterUpdate.contents as Array<Record<string, unknown>>;
        expect(updatedContents[0].organizationId).toBe(46101);

        // remove: unregisters the invite sale.
        const removeOutput = runCliSuccess([
          'invite-sales',
          'remove',
          '--viewer-union-ids',
          viewerUnionId,
          '--force',
          '--output',
          'json',
        ]);
        expect(parseJsonObject(removeOutput).success).toBe(true);

        // list confirms the invite sale is gone.
        const listAfterRemove = parseJsonObject(
          runCliSuccess(['invite-sales', 'list', '--viewer-union-id', viewerUnionId, '--output', 'json'])
        );
        expect(listAfterRemove.totalItems).toBe(0);
      } finally {
        if (viewerUnionId) {
          try {
            runCliSuccess(['invite-sales', 'remove', '--viewer-union-ids', viewerUnionId, '--force', '--output', 'json']);
          } catch {
            // best-effort: ensure no invite sale lingers if the test failed mid-lifecycle
          }
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
    }, 240000);
});
