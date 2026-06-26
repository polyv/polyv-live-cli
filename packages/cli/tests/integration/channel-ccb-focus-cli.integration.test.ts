/**
 * @fileoverview Real-CLI integration coverage for `channel ccb-focus-reset`.
 *
 * The command rewrites the account-level CCB focus channel list, so the real
 * test is guarded by an explicit opt-in environment variable in addition to
 * normal credential checks. When enabled, it uses a temporary channel and clears
 * the focus list before deleting that channel.
 */

import {
  createTemporaryChannel,
  deleteTemporaryChannel,
  parseJsonObject,
  runCliSuccess,
} from '../helpers/channel-fixture';
import { hasRealCredentials } from '../helpers/integration-config';

const shouldRunCcbFocusResetTests =
  hasRealCredentials() && process.env.POLYV_TEST_ALLOW_CCB_FOCUS_RESET === 'true';

describe('channel ccb-focus-reset CLI integration', () => {
  (shouldRunCcbFocusResetTests ? it : it.skip)(
    'resets CCB focus channels through the real CLI with a temporary channel',
    () => {
      let channelId: string | undefined;
      let focusMayPointToTemporaryChannel = false;
      let cleanupError: unknown;

      try {
        channelId = createTemporaryChannel('CCB Focus Reset');

        const resetOutput = parseJsonObject(
          runCliSuccess([
            'channel',
            'ccb-focus-reset',
            '--channel-ids',
            channelId,
            '--force',
            '--output',
            'json',
          ]),
        );
        focusMayPointToTemporaryChannel = true;
        expect(resetOutput.success).toBe(true);
        expect(Object.prototype.hasOwnProperty.call(resetOutput, 'result')).toBe(true);

        const clearOutput = parseJsonObject(
          runCliSuccess([
            'channel',
            'ccb-focus-reset',
            '--force',
            '--output',
            'json',
          ]),
        );
        focusMayPointToTemporaryChannel = false;
        expect(clearOutput.success).toBe(true);
        expect(Object.prototype.hasOwnProperty.call(clearOutput, 'result')).toBe(true);
      } finally {
        if (focusMayPointToTemporaryChannel) {
          try {
            runCliSuccess([
              'channel',
              'ccb-focus-reset',
              '--force',
              '--output',
              'json',
            ]);
          } catch (error) {
            cleanupError = error;
          }
        }

        if (channelId) {
          try {
            deleteTemporaryChannel(channelId);
          } catch (error) {
            cleanupError ??= error;
          }
        }

        if (cleanupError) {
          throw cleanupError;
        }
      }
    },
    120000,
  );
});
