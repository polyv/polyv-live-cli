/**
 * @fileoverview Real-CLI integration tests for channel-scoped player write
 * subcommands that need no external resources (no image/video uploads).
 *
 * Two self-contained channel-scoped writes executed through the local CLI entry
 * against a throwaway temporary channel (channel deletion cleans all attached
 * settings, so no separate state restore is required):
 *
 *  - `player anti-record update` sets an anti-record (marquee/watermark) config;
 *    requires `-c`, `--anti-record-type`, `--model-type`, `--content`,
 *    `--font-size` plus simple text/number values. Returns
 *    `{ success: true, result: "SUCCESS" }`.
 *  - `player advert stop-update` updates the player stop advert; with
 *    `--enabled N` it needs only `-c`. Returns `{ success: true, result: true }`.
 *
 * NOTE: packages/cli/tests/integration/player.integration.test.ts drives the
 * SDK service layer directly (PlayerServiceSdk, 0 runCli calls) and so does
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

describe('player CLI channel-scoped writes integration', () => {
  (shouldRunRealChannelTests ? it : it.skip)(
    'runs player anti-record update and advert stop-update via real CLI',
    () => {
      let channelId: string | undefined;

      try {
        channelId = createTemporaryChannel('Player Writes');

        // anti-record update: sets a marquee anti-record config.
        const antiRecordOutput = runCliSuccess([
          'player',
          'anti-record',
          'update',
          '-c',
          channelId,
          '--anti-record-type',
          'marquee',
          '--model-type',
          'fixed',
          '--content',
          'cli-integration',
          '--font-size',
          '14',
          '--force',
          '--output',
          'json',
        ]);
        const antiRecord = parseJsonObject(antiRecordOutput);
        expect(antiRecord.success).toBe(true);
        expect(String(antiRecord.result)).toBe('SUCCESS');

        // advert stop-update: disables the stop advert (only -c required).
        const stopAdvertOutput = runCliSuccess([
          'player',
          'advert',
          'stop-update',
          '-c',
          channelId,
          '--enabled',
          'N',
          '--force',
          '--output',
          'json',
        ]);
        const stopAdvert = parseJsonObject(stopAdvertOutput);
        expect(stopAdvert.success).toBe(true);
        expect(stopAdvert.result).toBe(true);
      } finally {
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    120000,
  );

  (shouldRunRealChannelTests ? it : it.skip)(
    'runs player config update via real CLI',
    () => {
      let channelId: string | undefined;

      try {
        channelId = createTemporaryChannel('Player Config Update');

        // config update: toggle watermark off and set a distinct base PV.
        // Returns { success: true, updatedFields: [...] } listing the fields
        // actually persisted server-side.
        const updateOutput = runCliSuccess([
          'player',
          'config',
          'update',
          '-c',
          channelId,
          '--watermark-enabled',
          'N',
          '--base-pv',
          '123',
          '--output',
          'json',
        ]);
        const updated = parseJsonObject(updateOutput) as {
          success?: boolean;
          updatedFields?: string[];
        };
        expect(updated.success).toBe(true);
        expect(Array.isArray(updated.updatedFields)).toBe(true);
        expect(updated.updatedFields).toContain('watermarkEnabled');
        expect(updated.updatedFields).toContain('basePv');

        // config get verifies the persisted state: basePv reflects the write.
        const getOutput = runCliSuccess([
          'player',
          'config',
          'get',
          '-c',
          channelId,
          '--output',
          'json',
        ]);
        const config = parseJsonObject(getOutput) as { basePv?: number | string };
        expect(Number(config.basePv)).toBe(123);
      } finally {
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    120000,
  );

  // Command-surface checks (no credentials required, always run).
  it('exposes player anti-record update, advert stop-update, and config update commands', () => {
    const commands = [
      ['player', 'anti-record', 'update', '--help'],
      ['player', 'advert', 'stop-update', '--help'],
      ['player', 'config', 'update', '--help'],
    ];
    for (const args of commands) {
      const result = runCli(args, { timeout: 15000 });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('Usage:');
    }
  });
});
