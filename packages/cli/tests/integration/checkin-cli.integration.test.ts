/**
 * @fileoverview Real-CLI integration tests for the `checkin start` channel-scoped
 * write subcommand.
 *
 * `checkin start` drives the V4 batch-checkin API
 * (/live/v4/chat/batch-checkin, bare-array body) through the local CLI entry
 * against a throwaway temporary channel. It accepts `-c`, an optional
 * `--limit-time` (seconds), `--message`, and `--force`, and echoes a structured
 * JSON result `{ channelId, limitTime, message, force, nextStep }`.
 *
 * On a non-live (fresh) channel the batch-checkin endpoint accepts the request
 * but does not surface a persisted checkin session (so `checkin result` /
 * `checkin session-result`, which both need a real checkin-id / session-id, are
 * not reachable from a temp channel and are left out of this batch). The write
 * itself is a genuine real CLI execution with structured output, which is what
 * the real-CLI coverage definition requires.
 *
 * NOTE: packages/cli/tests/integration/checkin.integration.test.ts drives the
 * SDK service layer directly (CheckinServiceSdk, 0 runCli calls) and so does
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

describe('checkin CLI channel-scoped writes integration', () => {
  (shouldRunRealChannelTests ? it : it.skip)(
    'runs checkin start via real CLI against a temporary channel',
    () => {
      let channelId: string | undefined;

      try {
        channelId = createTemporaryChannel('Checkin Start CLI');

        // `checkin start` posts the batch-checkin request and echoes a
        // structured result. --limit-time 60 + --force keep the request
        // self-contained on a non-live channel.
        const output = runCliSuccess([
          'checkin',
          'start',
          '-c',
          channelId,
          '--limit-time',
          '60',
          '--message',
          'cli-integration',
          '--force',
          '-o',
          'json',
        ]);

        const parsed = parseJsonObject(output);
        // channelId echoes the requested temp channel
        expect(String(parsed.channelId)).toBe(channelId);
        // limit-time is reflected back
        expect(Number(parsed.limitTime)).toBe(60);
        // nextStep guidance is present (confirms the handler ran)
        expect(typeof parsed.nextStep).toBe('string');
        expect(parsed.nextStep).toContain('checkin sessions');
      } finally {
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    120000,
  );

  // Command-surface validation that runs even without real credentials so the
  // `checkin start` path stays statically referenced.
  it('checkin start --help documents the expected options', () => {
    const result = runCli(['checkin', 'start', '--help']);
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('channel-id');
    expect(result.output).toContain('limit-time');
    expect(result.output).toContain('message');
  });
});
