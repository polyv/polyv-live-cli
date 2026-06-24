/**
 * @fileoverview Real-CLI integration tests for the questionnaire write family.
 *
 * The questionnaire family is a self-contained channel-scoped lifecycle that
 * works against a freshly created (non-live) temporary channel:
 *
 *  - `questionnaire create` (V4 /live/v4/channel/questionnaire/save) returns
 *    `{ channelId, questionnaireId, title, questionsCount, result: { questionnaireId, questionIds, ... } }`.
 *  - `questionnaire detail` (V3 /live/v3/channel/questionnaire/detail) reads
 *    the created questionnaire back as `{ channelId, questionnaireId, data: { questionnaireId, name, status, questions: [...] } }`.
 *  - `questionnaire batch-create` (V4 /live/v4/channel/questionnaire/create-batch)
 *    creates one or more questionnaires and returns
 *    `{ questionnaires: [{ channelId, questionnaireId, questionIds, questionnaireTitle }] }`.
 *
 * The create -> detail -> batch-create loop runs entirely through the real CLI
 * entry. There is no questionnaire delete endpoint, but every questionnaire is
 * scoped to the temporary channel, so deleting the channel in `finally`
 * disposes of all created questionnaires.
 *
 * Note: the pre-existing `qa.integration.test.ts` exercises the service SDK
 * directly (no `runCli`) and covers the QA question-card family, not these
 * questionnaire subcommands; real CLI coverage must live in this `-cli` file.
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

describe('questionnaire CLI write lifecycle integration', () => {
  (shouldRunRealChannelTests ? it : it.skip)(
    'runs the questionnaire create -> detail -> batch-create lifecycle via real CLI',
    () => {
      let channelId: string | undefined;

      try {
        channelId = createTemporaryChannel('Questionnaire Lifecycle');
        const title = `IT Survey ${Date.now()}`;

        // Precompute the JSON payloads into variables so the runCliSuccess arg
        // arrays stay free of nested `[` / `]` characters (the coverage
        // report's array matcher skips arrays whose text contains brackets).
        const questionsJson = JSON.stringify([
          { name: 'Favorite color', type: 'R', options: ['Red', 'Blue'] },
        ]);

        // create returns the new questionnaireId at the top level and inside
        // `result`. Type R (single choice) with two options.
        const createOutput = runCliSuccess([
          'questionnaire',
          'create',
          '-c',
          channelId,
          '--title',
          title,
          '--questions',
          questionsJson,
          '--output',
          'json',
        ]);
        const created = parseJsonObject(createOutput) as {
          channelId?: string;
          questionnaireId?: string;
          questionsCount?: number;
          result?: { questionnaireId?: string; questionIds?: string[] };
        };
        expect(created.channelId).toBe(channelId);
        expect(typeof created.questionnaireId).toBe('string');
        expect(created.questionnaireId?.length).toBeGreaterThan(0);
        expect(Number(created.questionsCount)).toBe(1);
        const questionnaireId = String(created.questionnaireId);

        // detail reads the created questionnaire back, echoing the id and the
        // saved questions array.
        const detailOutput = runCliSuccess([
          'questionnaire',
          'detail',
          '-c',
          channelId,
          '--questionnaire-id',
          questionnaireId,
          '--output',
          'json',
        ]);
        const detailed = parseJsonObject(detailOutput) as {
          questionnaireId?: string;
          data?: { questionnaireId?: string; name?: string; status?: string; questions?: unknown[] };
        };
        expect(detailed.questionnaireId).toBe(questionnaireId);
        expect(detailed.data?.questionnaireId).toBe(questionnaireId);
        expect(detailed.data?.name).toBe(title);
        expect(Array.isArray(detailed.data?.questions)).toBe(true);
        expect((detailed.data?.questions || []).length).toBe(1);

        // batch-create accepts one or more full questionnaire payloads and
        // returns the created ids.
        const batchJson = JSON.stringify([
          {
            channelId,
            questionnaireTitle: `Batch Survey ${Date.now()}`,
            questions: [{ name: 'Rate the session', type: 'X', required: 'Y' }],
          },
        ]);
        const batchOutput = runCliSuccess([
          'questionnaire',
          'batch-create',
          '--questionnaires',
          batchJson,
          '--force',
          '--output',
          'json',
        ]);
        const batched = parseJsonObject(batchOutput) as {
          questionnaires?: Array<{ channelId?: number; questionnaireId?: string; questionIds?: string[] }>;
        };
        expect(Array.isArray(batched.questionnaires)).toBe(true);
        expect(batched.questionnaires?.length).toBe(1);
        expect(batched.questionnaires?.[0].questionnaireId?.length).toBeGreaterThan(0);
        expect(String(batched.questionnaires?.[0].channelId)).toBe(channelId);
      } finally {
        // No questionnaire delete endpoint exists; channel deletion disposes
        // of every questionnaire scoped to the temporary channel.
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    180000,
  );

  // Sanity check that the CLI surface exists even without real credentials.
  it('exposes the questionnaire subcommands through the real CLI entry', () => {
    const checks: Array<[string[], string]> = [
      [['questionnaire', 'create', '--help'], '--questions'],
      [['questionnaire', 'detail', '--help'], '--questionnaire-id'],
      [['questionnaire', 'batch-create', '--help'], '--questionnaires'],
    ];

    for (const [args, marker] of checks) {
      const result = runCli(args, { includeTestEnv: false, rejectOnError: true });
      expect(result.stdout).toContain(marker);
    }
  });
});
