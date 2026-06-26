/**
 * @fileoverview Real-CLI integration tests for record subcommands.
 *
 * `record file delete` is exercised through the local CLI entry against a
 * throwaway channel. A freshly-created channel has no historical recordings, so
 * the test uses a unique probe session id and asserts the handler's structured
 * JSON success payload after the backend accepts the delete request.
 */

import {
  createTemporaryChannel,
  deleteTemporaryChannel,
  parseJsonObject,
  runCliSuccess,
} from '../helpers/channel-fixture';
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

        const payload = parseJsonObject(
          runCliSuccess([
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
          ]),
        );

        expect(String(payload.channelId)).toBe(channelId);
        expect(String(payload.sessionId)).toBe(sessionId);
        expect(payload.deleted).toBe(true);
      } finally {
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    120000,
  );
});
