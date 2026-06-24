/**
 * @fileoverview Real-CLI integration tests for a batch of clean read subcommands.
 *
 * Each target is exercised through the local CLI entry (dist/index.js) against a
 * freshly-created temporary channel, which is deleted in `finally`. The targets
 * span a few command families but share two traits: they are read-only and they
 * return well-formed JSON even on a brand-new account/channel with no activity.
 *
 * Per the integration-test convention, every test creates (and deletes) a
 * temporary channel as the real test asset, even the account-scoped reads that
 * do not take a channel-id.
 */

import { runCli } from '../helpers/cli-runner';
import {
  createTemporaryChannel,
  deleteTemporaryChannel,
  parseJsonValue,
  runCliSuccess,
} from '../helpers/channel-fixture';
import { hasRealCredentials } from '../helpers/integration-config';

const shouldRunRealChannelTests = hasRealCredentials();

describe('misc clean-read CLI integration', () => {
  (shouldRunRealChannelTests ? it : it.skip)('lists invite sales for the account via real CLI', () => {
    let channelId: string | undefined;

    try {
      // Account-scoped read; the temporary channel is the real test asset.
      channelId = createTemporaryChannel('InviteSales List');

      const output = runCliSuccess(['invite-sales', 'list', '--output', 'json']);

      const payload = parseJsonValue(output) as {
        contents?: unknown;
        totalItems?: unknown;
      };
      expect(Array.isArray(payload.contents)).toBe(true);
      expect(typeof payload.totalItems).toBe('number');
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 120000);

  (shouldRunRealChannelTests ? it : it.skip)('lists material categories for the account via real CLI', () => {
    let channelId: string | undefined;

    try {
      // Account-scoped read; the temporary channel is the real test asset.
      channelId = createTemporaryChannel('Material Category List');

      const output = runCliSuccess([
        'material',
        'category',
        'list',
        '--material-type',
        'video',
        '--output',
        'json',
      ]);

      const payload = parseJsonValue(output) as {
        contents?: unknown;
        totalItems?: unknown;
      };
      expect(Array.isArray(payload.contents)).toBe(true);
      expect(typeof payload.totalItems).toBe('number');
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 120000);

  (shouldRunRealChannelTests ? it : it.skip)('gets chat admin role for a temporary channel via real CLI', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Chat Role Admin Get');

      // A fresh channel returns the default admin role (actor/nickname/avatar),
      // never an error, proving the read path works end-to-end.
      const output = runCliSuccess([
        'chat',
        'role',
        'admin-get',
        '-c',
        channelId,
        '--output',
        'json',
      ]);

      const payload = parseJsonValue(output) as { actor?: unknown; nickname?: unknown };
      expect(typeof payload.actor).toBe('string');
      expect(typeof payload.nickname).toBe('string');
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 120000);

  (shouldRunRealChannelTests ? it : it.skip)('gets interaction webhook config for a temporary channel via real CLI', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Interaction Webhook Get');

      // The webhook config is keyed by room-id (the channel's chat room). A fresh
      // channel has no configured callback, so it returns an empty callbackUrl.
      const output = runCliSuccess([
        'interaction',
        'webhook',
        'get',
        '--room-id',
        channelId,
        '--output',
        'json',
      ]);

      const payload = parseJsonValue(output) as { callbackUrl?: unknown };
      expect(typeof payload.callbackUrl).toBe('string');
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 120000);

  // Sanity check that the CLI surface exists even without real credentials.
  it('exposes the targeted read subcommands through the real CLI entry', () => {
    const checks: Array<[string[], string]> = [
      [['invite-sales', 'list', '--help'], 'invite-sales'],
      [['material', 'category', 'list', '--help'], 'material-type'],
      [['chat', 'role', 'admin-get', '--help'], 'channel-id'],
      [['interaction', 'webhook', 'get', '--help'], 'room-id'],
    ];

    for (const [args, marker] of checks) {
      const result = runCli(args, { includeTestEnv: false, rejectOnError: true });
      expect(result.stdout).toContain(marker);
    }
  });
});
