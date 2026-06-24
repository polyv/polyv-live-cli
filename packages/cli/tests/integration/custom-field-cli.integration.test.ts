/**
 * @fileoverview Real-CLI integration tests for custom-field subcommands.
 *
 * Lifecycles executed through the local CLI entry:
 *
 *  - `custom-field add` is an upsert (add-or-update): adding an existing
 *    `customFieldId` overwrites its `customFieldName` instead of creating a
 *    duplicate, so it can be exercised as a fully reversible account-level
 *    write — read the current name → rename via `add` → verify the rename
 *    persisted via `list` → restore the original name in `finally`.
 *  - `custom-field value save` writes a viewer's value for a custom field and
 *    returns `{ success: true }` (no value read endpoint). It is exercised
 *    against a temporary viewer created via `viewer create`; the value lives
 *    on that viewer record and is cleaned up by `viewer delete`.
 *
 * These are account-level custom-field operations (no channel-id required);
 * per the integration-test convention a temporary channel is still created as
 * the real test asset and deleted in `finally`. The temp viewer is also
 * deleted in `finally` so the account viewer tables are not polluted, and the
 * renamed custom field is always restored to its original name.
 */

import { runCli } from '../helpers/cli-runner';
import {
  createTemporaryChannel,
  deleteTemporaryChannel,
  parseJsonObject,
  parseJsonValue,
  runCliSuccess,
} from '../helpers/channel-fixture';
import { hasRealCredentials } from '../helpers/integration-config';

const shouldRunRealChannelTests = hasRealCredentials();

function findField(
  list: unknown,
  customFieldId: string,
): Record<string, unknown> | undefined {
  if (!Array.isArray(list)) {
    return undefined;
  }
  return (list as Array<Record<string, unknown>>).find(
    (item) => String(item.customFieldId) === customFieldId,
  );
}

describe('custom-field CLI integration', () => {
  it('shows command help for custom-field commands', () => {
    const checks = [
      { args: ['custom-field', 'list', '--help'], text: '--output' },
      { args: ['custom-field', 'add', '--help'], text: '--custom-field-type' },
      { args: ['custom-field', 'value', 'save', '--help'], text: '--custom-field-value' },
    ];

    for (const check of checks) {
      const result = runCli(check.args, { includeTestEnv: false });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain(check.text);
    }
  });

  (shouldRunRealChannelTests ? it : it.skip)(
    'runs the custom-field add upsert lifecycle via real CLI and restores the field name',
    () => {
      let channelId: string | undefined;

      try {
        channelId = createTemporaryChannel('Custom Field Add Upsert');

        // Discover a real custom field to exercise the upsert on (avoids
        // creating permanent new fields; add on an existing id overwrites).
        const listOutput = runCliSuccess([
          'custom-field', 'list', '--output', 'json',
        ]);
        const fields = parseJsonValue(listOutput);
        expect(Array.isArray(fields)).toBe(true);
        const firstField = (fields as Array<Record<string, unknown>>)[0];
        expect(firstField).toBeDefined();
        const customFieldId = String(firstField.customFieldId);
        const originalName = String(firstField.customFieldName);
        expect(customFieldId).not.toBe('');

        const customFieldType = String(firstField.customFieldType || 'text');
        const renamed = `${originalName}-it`;

        // add (upsert): rename the existing field, expect success.
        const addOutput = runCliSuccess([
          'custom-field', 'add',
          '--custom-field-id', customFieldId,
          '--custom-field-name', renamed,
          '--custom-field-type', customFieldType,
          '--force',
          '--output', 'json',
        ]);
        const added = parseJsonObject(addOutput);
        expect(added.success).toBe(true);

        // Verify the rename persisted via list.
        const afterRename = parseJsonValue(runCliSuccess([
          'custom-field', 'list', '--output', 'json',
        ]));
        const renamedField = findField(afterRename, customFieldId);
        expect(renamedField).toBeDefined();
        expect(String(renamedField?.customFieldName)).toBe(renamed);

        // Restore the original name via the same upsert.
        runCliSuccess([
          'custom-field', 'add',
          '--custom-field-id', customFieldId,
          '--custom-field-name', originalName,
          '--custom-field-type', customFieldType,
          '--force',
          '--output', 'json',
        ]);
        const afterRestore = parseJsonValue(runCliSuccess([
          'custom-field', 'list', '--output', 'json',
        ]));
        const restoredField = findField(afterRestore, customFieldId);
        expect(String(restoredField?.customFieldName)).toBe(originalName);
      } finally {
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    120000,
  );

  (shouldRunRealChannelTests ? it : it.skip)(
    'saves a custom-field value for a temporary viewer via real CLI and cleans it up',
    () => {
      let channelId: string | undefined;
      let viewerUnionId: string | undefined;

      try {
        channelId = createTemporaryChannel('Custom Field Value Save');

        // Discover a real custom field id to write a value for.
        const fields = parseJsonValue(runCliSuccess([
          'custom-field', 'list', '--output', 'json',
        ])) as Array<Record<string, unknown>>;
        const customFieldId = String(fields[0]?.customFieldId ?? '');
        expect(customFieldId).not.toBe('');

        // Create a temporary viewer to hold the value (cleaned in finally).
        const ts = Date.now();
        const mobile = `138${String(ts).slice(-8)}`;
        const createOutput = runCliSuccess([
          'viewer', 'create',
          '--nickname', `cfval-it-${ts}`,
          '--mobile', mobile,
          '--force',
          '--output', 'json',
        ]);
        const created = parseJsonObject(createOutput);
        expect(created.success).toBe(true);
        viewerUnionId = String((created.data as Record<string, unknown>).viewerUnionId);
        expect(viewerUnionId.length).toBeGreaterThan(0);

        // Save the custom-field value for the temporary viewer.
        const saveOutput = runCliSuccess([
          'custom-field', 'value', 'save',
          '--viewer-id', viewerUnionId,
          '--custom-field-id', customFieldId,
          '--custom-field-value', 'it-saved-val',
          '--force',
          '--output', 'json',
        ]);
        const saved = parseJsonObject(saveOutput);
        expect(saved.success).toBe(true);
      } finally {
        if (viewerUnionId) {
          runCliSuccess([
            'viewer', 'delete',
            '--viewer-union-id', viewerUnionId,
            '--force',
            '--output', 'json',
          ]);
        }
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    120000,
  );
});
