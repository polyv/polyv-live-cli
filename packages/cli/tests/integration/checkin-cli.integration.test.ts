/**
 * @fileoverview Real-CLI integration tests for the `checkin start` channel-scoped
 * write subcommand and the `checkin result` channel-scoped read subcommand.
 *
 * `checkin start` drives the V4 batch-checkin API
 * (/live/v4/chat/batch-checkin, bare-array body) through the local CLI entry
 * against a throwaway temporary channel. It accepts `-c`, an optional
 * `--limit-time` (seconds), `--message`, and `--force`, and echoes a structured
 * JSON result `{ channelId, limitTime, message, force, nextStep }`.
 *
 * On a non-live (fresh) channel the batch-checkin endpoint accepts the request
 * but does not surface a persisted checkin session (so `checkin session-result`,
 * which needs a real live session-id, errors with `channel session stats can not
 * be found` and is left out). `checkin result`, however, drives the V4
 * checkin-result GET endpoint for any checkin-id and returns the structured
 * "no result" info message with exit code 0 on a fresh channel — a genuine
 * real-CLI read in the same empty-result pattern as the covered `donate list` /
 * `checkin list` reads.
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

describe('checkin CLI channel-scoped reads integration', () => {
  (shouldRunRealChannelTests ? it : it.skip)(
    'runs checkin result via real CLI (empty result on a fresh channel)',
    () => {
      let channelId: string | undefined;
      // A clearly fake checkin-id (UUID-shaped, matching the help example). On a
      // fresh non-live channel no checkin session is persisted, so the V4
      // checkin-result endpoint accepts the id and reports no data with exit 0.
      const fakeCheckinId = '00000000-0000-0000-0000-000000000000';

      try {
        channelId = createTemporaryChannel('Checkin Result CLI');

        const output = runCliSuccess([
          'checkin',
          'result',
          '-c',
          channelId,
          '--checkin-id',
          fakeCheckinId,
          '-o',
          'json',
        ]);

        // The handler echoes the requested checkin-id inside its structured
        // no-data info message, proving the real API call ran with that id.
        expect(output).toContain('No checkin result found');
        expect(output).toContain(fakeCheckinId);
      } finally {
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    120000,
  );

  // Command-surface validation that runs even without real credentials so the
  // `checkin result` path stays statically referenced.
  it('checkin result --help documents the expected options', () => {
    const result = runCli(['checkin', 'result', '--help']);
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('checkin-id');
    expect(result.output).toContain('channel-id');
  });
});
