/**
 * @fileoverview Real-CLI integration tests for the QA question-card write family.
 *
 * The QA family is a self-contained channel-scoped write lifecycle that works
 * against a freshly created (non-live) temporary channel:
 *
 *  - `qa add-edit` (create, omitting `--question-id`) returns the new
 *    `questionId` as a bare JSON string (e.g. `"hjs6yfdaw9"`).
 *  - `qa list` (already covered elsewhere) is used here only to verify the
 *    created card is present (`{ channelId, count, data: [...] }`).
 *  - `qa send` pushes the card to the channel and echoes
 *    `{ channelId, questionId, duration, result }` even on a non-live channel.
 *  - `qa stop` stops the in-flight card and returns answer statistics
 *    (`{ channelId, questionId, result: { answer, type, total, ... } }`).
 *  - `qa delete-question` removes the card definition and returns the bare
 *    empty-string JSON `""`.
 *
 * The create -> verify -> send -> stop -> delete loop runs entirely through
 * the real CLI entry and cleans up the created question (plus the temporary
 * channel) in `finally`.
 *
 * `qa send-result` publishes a question's answer statistics. Passing a real
 * (existing) question-id on a non-live channel fails at the chatroom step
 * ("调用聊天室接口失败:..."), but passing a *non-existent* question-id is
 * rejected earlier — the server looks up the question first and deterministically
 * reports "数据不存在" (exit 1) before any chatroom call. That missing-resource
 * path is covered here as a genuine real-API read, mirroring the covered
 * `session get` / `record outline get` pattern.
 *
 * Note: the pre-existing `qa.integration.test.ts` exercises the service SDK
 * directly (no `runCli`) and therefore does not count as real CLI coverage;
 * real CLI coverage must live in this `-cli` file.
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

/**
 * `qa add-edit` (create) and `qa delete-question` emit bare JSON primitives
 * (a quoted questionId string / an empty string) rather than objects, so they
 * cannot use the brace-based `parseJsonObject`. Parse the raw trimmed output
 * directly instead.
 */
function parseJsonPrimitive(output: string): unknown {
  return JSON.parse(output.trim());
}

describe('qa question-card CLI write lifecycle integration', () => {
  (shouldRunRealChannelTests ? it : it.skip)(
    'runs the qa add-edit -> send -> stop -> delete-question lifecycle via real CLI',
    () => {
      let channelId: string | undefined;
      let questionId: string | undefined;

      try {
        channelId = createTemporaryChannel('QA Card Lifecycle');
        const questionName = `polyv-it-qa-${Date.now()}`;

        // add-edit (create, no --question-id) returns the new questionId as a
        // bare quoted JSON string. Type R (single choice) with two options.
        const createOutput = runCliSuccess([
          'qa',
          'add-edit',
          '--channel-id',
          channelId,
          '--type',
          'R',
          '--answer',
          'A',
          '--name',
          questionName,
          '--item-type',
          '0',
          '--option',
          'A',
          '--option',
          'B',
          '--force',
          '--output',
          'json',
        ]);
        questionId = String(parseJsonPrimitive(createOutput));
        expect(questionId.length).toBeGreaterThan(0);

        // qa list verifies the card landed server-side (returns clean JSON
        // while at least one card exists).
        const listOutput = runCliSuccess([
          'qa',
          'list',
          '--channel-id',
          channelId,
          '--output',
          'json',
        ]);
        const listed = parseJsonObject(listOutput) as {
          channelId?: string;
          count?: number;
          data?: Array<{ questionId?: string }>;
        };
        expect(Number(listed.count)).toBeGreaterThanOrEqual(1);
        expect(
          (listed.data || []).some((item) => item.questionId === questionId),
        ).toBe(true);

        // qa send pushes the card to the channel and echoes the questionId.
        const sendOutput = runCliSuccess([
          'qa',
          'send',
          '--channel-id',
          channelId,
          '--question-id',
          questionId,
          '--duration',
          '30',
          '--output',
          'json',
        ]);
        const sent = parseJsonObject(sendOutput) as {
          channelId?: string;
          questionId?: string;
          duration?: number;
        };
        expect(sent.questionId).toBe(questionId);
        expect(Number(sent.duration)).toBe(30);

        // qa stop stops the in-flight card and returns answer statistics.
        const stopOutput = runCliSuccess([
          'qa',
          'stop',
          '--channel-id',
          channelId,
          '--question-id',
          questionId,
          '--output',
          'json',
        ]);
        const stopped = parseJsonObject(stopOutput) as {
          channelId?: string;
          questionId?: string;
          result?: { answer?: string; total?: number };
        };
        expect(stopped.questionId).toBe(questionId);
        expect(stopped.result).toBeDefined();
        expect(stopped.result?.answer).toBe('A');

        // delete-question removes the card definition (bare empty-string JSON).
        const deleteOutput = runCliSuccess([
          'qa',
          'delete-question',
          '--channel-id',
          channelId,
          '--question-id',
          questionId,
          '--force',
          '--output',
          'json',
        ]);
        expect(parseJsonPrimitive(deleteOutput)).toBe('');
        questionId = undefined;
      } finally {
        if (channelId && questionId) {
          // Safety-net cleanup if a step failed mid-lifecycle.
          try {
            runCliSuccess([
              'qa',
              'delete-question',
              '--channel-id',
              channelId,
              '--question-id',
              questionId,
              '--force',
              '--output',
              'json',
            ]);
          } catch {
            // Best-effort; the card may already be gone.
          }
        }
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    180000,
  );

  // `qa send-result` publishes answer statistics for a question. On a fresh
  // (non-live) channel a *non-existent* question-id is rejected before any
  // chatroom call with the deterministic business error "数据不存在" (exit 1) —
  // a real V4 read, mirroring the covered `session get` missing-resource path.
  // Nothing is created server-side, so only the temporary channel is cleaned up.
  (shouldRunRealChannelTests ? it : it.skip)(
    'runs qa send-result via real CLI (question-existence check on a probe id)',
    () => {
      let channelId: string | undefined;

      try {
        channelId = createTemporaryChannel('QA Send Result CLI');
        const fakeQuestionId = `gnhf-fake-question-${Date.now().toString(36)}`;

        const result = runCli([
          'qa',
          'send-result',
          '--channel-id',
          channelId,
          '--question-id',
          fakeQuestionId,
          '--force',
          '--output',
          'json',
        ]);

        // exit 1 + "数据不存在" proves the real endpoint was hit with the
        // requested channel/question ids and rejected the unknown question.
        expect(result.exitCode).toBe(1);
        expect(result.output).toContain('数据不存在');
      } finally {
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    120000,
  );

  // Sanity check that the CLI surface exists even without real credentials.
  it('exposes the qa write subcommands through the real CLI entry', () => {
    const checks: Array<[string[], string]> = [
      [['qa', 'add-edit', '--help'], '--type'],
      [['qa', 'send', '--help'], '--question-id'],
      [['qa', 'stop', '--help'], '--question-id'],
      [['qa', 'delete-question', '--help'], '--question-id'],
    ];

    for (const [args, marker] of checks) {
      const result = runCli(args, { includeTestEnv: false, rejectOnError: true });
      expect(result.stdout).toContain(marker);
    }
  });
});
