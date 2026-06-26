/**
 * @fileoverview Real-CLI integration tests for session detail reads and the
 * `session external` subcommand family (custom/external session-ID association).
 *
 * The `session external` group drives the v3 channel-session APIs under
 * /live/v3/channel/session/* through the local CLI entry against a throwaway
 * temporary channel:
 *   - `session external relevance`    POST /session/relevance           (write)
 *   - `session external session-list` GET  /session/list-session-by-external (read)
 *   - `session external file-ids`     GET  /session/list-file-id-by-external (read)
 *
 * These v3 external-session endpoints are distinct from the v4 session create
 * family that is gated by "当前用户不允许手动创建场次" — `relevance` only registers a
 * custom UUID against the channel (it binds the channel's *future* broadcast
 * sessions), so it succeeds on a fresh non-live channel and returns
 * `{ channelId, externalSessionId, result: true }`. The two reads then query by
 * that external ID; on a channel with no broadcast sessions yet they surface
 * empty results (`session-list` -> `{ list: [] }`, `file-ids` -> `[]`).
 *
 * `session external get` is NOT covered here: it needs a real PolyV session-id
 * (queries "the custom ID bound to a channel session"), which cannot be created
 * on a temp channel and is rejected with 非法直播场次ID for any fabricated id.
 *
 * NOTE: packages/cli/tests/integration/session.integration.test.ts drives the
 * SDK service layer directly (SessionServiceSdk, 0 runCli calls) and so does
 * NOT count toward real-CLI coverage — this file is the real-CLI counterpart.
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

/**
 * Build a unique 32-char external session UUID (the relevance endpoint requires
 * exactly 32 characters). Hex keeps it alphanumeric and collision-free per run.
 */
function makeExternalSessionId(): string {
  const ts = Date.now().toString(16).slice(-12); // 12 hex chars
  const rand = Math.floor(Math.random() * 0xfffffffff)
    .toString(16)
    .padStart(20, '0')
    .slice(0, 20); // 20 hex chars
  return (ts + rand).slice(0, 32);
}

describe('session get CLI integration', () => {
  (shouldRunRealChannelTests ? it : it.skip)(
    'runs session get via real CLI on a temporary channel (missing new-session path)',
    () => {
      let channelId: string | undefined;

      try {
        channelId = createTemporaryChannel('Session Get CLI');
        const sessionId = `gnhf-missing-${Date.now().toString(36)}`;

        // `session get` queries the v4 session-detail API. A freshly-created
        // channel has no v4 sessions, so a unique probe id reaches the real API
        // and the handler emits a structured JSON error with exit 0.
        const result = runCli([
          'session',
          'get',
          '-c',
          channelId,
          '--session-id',
          sessionId,
          '--output',
          'json',
        ]);

        expect(result.exitCode).toBe(0);
        const payload = parseJsonObject(result.output) as { error?: unknown };
        expect(typeof payload.error).toBe('string');
        expect(String(payload.error).length).toBeGreaterThan(0);
      } finally {
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    120000,
  );
});

describe('session external CLI integration', () => {
  (shouldRunRealChannelTests ? it : it.skip)(
    'binds an external session id via relevance and reads it back via session-list and file-ids',
    () => {
      let channelId: string | undefined;

      try {
        channelId = createTemporaryChannel('Session External CLI');
        const externalSessionId = makeExternalSessionId();

        // 1) relevance (write): bind the 32-char external id to the temp channel.
        //    Returns { channelId, externalSessionId, result: true }.
        const relevanceOutput = parseJsonObject(
          runCliSuccess([
            'session',
            'external',
            'relevance',
            '-c',
            channelId,
            '--external-session-id',
            externalSessionId,
            '--force',
            '--output',
            'json',
          ]),
        );
        expect(String(relevanceOutput.channelId)).toBe(channelId);
        expect(String(relevanceOutput.externalSessionId)).toBe(externalSessionId);
        expect(relevanceOutput.result).toBe(true);

        // 2) session-list (read): query sessions bound to the external id.
        //    Returns { list: [...] }; empty list on a non-live channel.
        const sessionListOutput = parseJsonObject(
          runCliSuccess([
            'session',
            'external',
            'session-list',
            '-c',
            channelId,
            '--external-session-id',
            externalSessionId,
            '--output',
            'json',
          ]),
        );
        expect(Array.isArray(sessionListOutput.list)).toBe(true);

        // 3) file-ids (read): query cached file ids bound to the external id.
        //    Returns a bare JSON array; use parseJsonValue (handles bare arrays).
        const fileIdsOutput = parseJsonValue(
          runCliSuccess([
            'session',
            'external',
            'file-ids',
            '-c',
            channelId,
            '--external-session-id',
            externalSessionId,
            '--output',
            'json',
          ]),
        );
        expect(Array.isArray(fileIdsOutput)).toBe(true);
      } finally {
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    180000,
  );

  // Command-surface validation that runs even without real credentials so the
  // `session external *` paths stay statically referenced.
  it('session external relevance --help documents the expected options', () => {
    const result = runCli(['session', 'external', 'relevance', '--help']);
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('channel-id');
    expect(result.output).toContain('external-session-id');
  });

  it('session external session-list --help documents the expected options', () => {
    const result = runCli(['session', 'external', 'session-list', '--help']);
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('external-session-id');
  });

  it('session external file-ids --help documents the expected options', () => {
    const result = runCli(['session', 'external', 'file-ids', '--help']);
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('external-session-id');
  });
});
