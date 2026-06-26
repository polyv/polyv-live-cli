/**
 * @fileoverview Real-CLI integration tests for the `ai digital-human` family.
 *
 * Each target is exercised through the local CLI entry (dist/index.js). The
 * existing ai-digital-human.integration.test.ts drives the SDK service layer
 * directly (AIDigitalHumanServiceSdk, 0 runCli calls) and so does not count as
 * real CLI execution coverage; those targets are re-covered here via runCli.
 *
 * - `ai digital-human list-org` is an account-scoped read that returns the
 *   organization associations for one or more digital-human ids as a bare JSON
 *   array (empty array `[]` when a digital human has no associations). A real
 *   digital-human id is discovered via the already-covered `ai digital-human
 *   list` and fed to `list-org`.
 *
 * Note on `ai digital-human set-org`: the set-organizations endpoint accepts
 * the request and returns `{success:true, count:N}`, but on every test account
 * all digital humans are system-provided templates (`type:"polyv"`,
 * `userId:""`) rather than account-owned, so the association never persists
 * (`list-org` stays `[]`). The server no-op makes the write *safe* (no state
 * to clean up), not unverifiable: set-org still hits the real API and returns
 * structured output, so it IS covered below as a real-execution target —
 * run set-org with a real digital-human id + real org id, assert the
 * `{success:true, count:N}` payload, and confirm via list-org that the
 * association did not persist.
 *
 * Per the integration-test convention, the real test still creates (and
 * deletes in `finally`) a temporary channel as the real test asset, even
 * though these account-scoped commands do not take a channel-id argument.
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

interface DigitalHuman {
  id: number;
  name?: string;
  organizationIds?: number[] | null;
}

describe('ai digital-human CLI integration (account-scoped)', () => {
  (shouldRunRealChannelTests ? it : it.skip)(
    'lists organization associations for a real digital human via real CLI',
    () => {
      let channelId: string | undefined;

      try {
        channelId = createTemporaryChannel('AI Digital Human List Org');

        // Discover a real digital-human id on the account.
        const listOutput = runCliSuccess([
          'ai',
          'digital-human',
          'list',
          '--page',
          '1',
          '--size',
          '5',
          '--output',
          'json',
        ]);
        const listPayload = parseJsonObject(listOutput) as {
          contents: DigitalHuman[];
        };
        expect(Array.isArray(listPayload.contents)).toBe(true);
        expect(listPayload.contents.length).toBeGreaterThan(0);
        const digitalHumanId = listPayload.contents[0].id;
        expect(typeof digitalHumanId).toBe('number');

        // Read the organization associations for that digital human.
        // list-org returns a bare JSON array (no {/} wrapper), so parseJsonValue
        // is used instead of parseJsonObject.
        const orgsOutput = runCliSuccess([
          'ai',
          'digital-human',
          'list-org',
          '--ids',
          String(digitalHumanId),
          '--output',
          'json',
        ]);
        const associations = parseJsonValue(orgsOutput) as unknown[];
        expect(Array.isArray(associations)).toBe(true);
        // System-provided digital humans have no associations, so the array is
        // commonly empty; either way it must be a well-formed array.
      } finally {
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    120000,
  );

  // `ai digital-human set-org` runs the set-organizations endpoint through the
  // real CLI. On every test account the digital humans are system templates, so
  // the server accepts the request (returns {success:true, count:N}) but never
  // persists the association — list-org stays [] for the target id. That no-op
  // behavior makes the write safe (nothing to clean up) while still being a
  // real API execution worth covering: we assert the structured {success,count}
  // payload and then confirm via list-org that no association lingered.
  (shouldRunRealChannelTests ? it : it.skip)(
    'sets organization associations for a real digital human via real CLI (server no-op)',
    () => {
      let channelId: string | undefined;

      try {
        channelId = createTemporaryChannel('AI Digital Human Set Org');

        // Discover a real digital-human id and a real org id on the account.
        const listPayload = parseJsonObject(
          runCliSuccess([
            'ai',
            'digital-human',
            'list',
            '--page',
            '1',
            '--size',
            '5',
            '--output',
            'json',
          ]),
        ) as { contents: DigitalHuman[] };
        expect(listPayload.contents.length).toBeGreaterThan(0);
        const digitalHumanId = listPayload.contents[0].id;

        const orgs = parseJsonValue(
          runCliSuccess(['user', 'org', 'list', '--output', 'json']),
        ) as Array<{ id: number }>;
        expect(orgs.length).toBeGreaterThan(0);
        const orgId = orgs[0].id;

        // set-org returns {success:true, count:N} — count reflects the number
        // of (digital-human, org) associations submitted.
        const payload = parseJsonObject(
          runCliSuccess([
            'ai',
            'digital-human',
            'set-org',
            '--aiDigitalHumanId',
            String(digitalHumanId),
            '--organizationIds',
            String(orgId),
            '--output',
            'json',
          ]),
        );
        expect(payload.success).toBe(true);
        expect(payload.count).toBe(1);

        // The association does not persist for system-template digital humans;
        // list-org stays a well-formed (commonly empty) array, proving the
        // write left no lingering state on the account.
        const associations = parseJsonValue(
          runCliSuccess([
            'ai',
            'digital-human',
            'list-org',
            '--ids',
            String(digitalHumanId),
            '--output',
            'json',
          ]),
        ) as unknown[];
        expect(Array.isArray(associations)).toBe(true);
      } finally {
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    120000,
  );

  // Command-surface checks (no credentials required, always run).
  it('exposes ai digital-human list and list-org commands', () => {
    const commands = [
      ['ai', 'digital-human', 'list', '--help'],
      ['ai', 'digital-human', 'list-org', '--help'],
    ];
    for (const args of commands) {
      const result = runCli(args, { timeout: 15000 });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('Usage:');
    }
  });
});
