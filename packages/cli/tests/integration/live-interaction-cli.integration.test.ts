import { runCli } from '../helpers/cli-runner';
import {
  createTemporaryChannel,
  deleteTemporaryChannel,
  parseJsonObject,
  runCliSuccess,
} from '../helpers/channel-fixture';
import { getAccountCredentials, hasRealCredentials } from '../helpers/integration-config';

const shouldRunRealChannelTests = hasRealCredentials();

describe('live interaction CLI integration', () => {
  it('shows extended live interaction command help', () => {
    const checks = [
      { args: ['checkin', '--help'], text: 'session-result' },
      { args: ['qa', '--help'], text: 'send-times' },
      { args: ['qa', '--help'], text: 'question-list' },
      { args: ['questionnaire', '--help'], text: 'result-list' },
      { args: ['lottery', '--help'], text: 'channel-records' },
      { args: ['interaction', '--help'], text: 'teacher-answer' },
    ];

    for (const check of checks) {
      const result = runCli(check.args, { includeTestEnv: false });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain(check.text);
    }
  });

  it('shows force options for write interaction commands', () => {
    const commands = [
      ['qa', 'add-edit', '--help'],
      ['qa', 'delete-question', '--help'],
      ['qa', 'send-result', '--help'],
      ['questionnaire', 'batch-create', '--help'],
      ['lottery', 'receive-info', '--help'],
      ['interaction', 'favor', '--help'],
      ['interaction', 'reward', '--help'],
      ['interaction', 'webhook', 'set', '--help'],
      ['interaction', 'webhook', 'delete', '--help'],
      ['interaction', 'teacher-answer', '--help'],
    ];

    for (const args of commands) {
      const result = runCli(args, { includeTestEnv: false });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('--force');
      expect(result.output).toContain('--output');
    }
  });

  (shouldRunRealChannelTests ? it : it.skip)('runs live interaction read commands against a temporary real channel', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Interaction Read Smoke');
      const id = channelId;

      const readCommands = [
        ['checkin', 'list', '--channel-id', id, '--page', '1', '--size', '5', '--output', 'json'],
        ['checkin', 'sessions', '--channel-id', id, '--output', 'json'],
        ['qa', 'list', '--channel-id', id, '--output', 'json'],
        ['qa', 'send-times', '--channel-id', id, '--output', 'json'],
        ['qa', 'answers', '--channel-id', id, '--output', 'json'],
        ['qa', 'question-list', '--channel-id', id, '--output', 'json'],
        ['questionnaire', 'list', '--channel-id', id, '--page', '1', '--size', '5', '--output', 'json'],
        ['questionnaire', 'result-list', '--channel-id', id, '--page', '1', '--size', '5', '--output', 'json'],
        ['questionnaire', 'results', '--channel-id', id, '--output', 'json'],
        ['interaction', 'task-reward', 'list', '--channel-id', id, '--page', '1', '--size', '5', '--output', 'json'],
        ['interaction', 'event', 'list', '--room-id', id, '--output', 'json'],
      ];

      for (const args of readCommands) {
        runCliSuccess(args);
      }
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 240000);

  // The student-question webhook is an account-scoped config (validated against
  // roomId belonging to the account). set writes it, get verifies the new
  // callback URL, delete restores the account to its default (no-config) state.
  // Task-reward activities are channel-scoped. create returns the activityId as
  // a bare number; the activity must be "未开始" (startTime in the future) to be
  // updated, and "进行中" (startTime in the past) to be stopped, so the lifecycle
  // uses a near-future startTime and waits past it before stop.
  (shouldRunRealChannelTests ? it : it.skip)('runs the interaction task-reward create -> viewer-detail -> update -> stop -> delete lifecycle against a temporary real channel', async () => {
    let channelId: string | undefined;
    let activityId: string | undefined;

    try {
      channelId = createTemporaryChannel('Task Reward Lifecycle');
      const id = channelId;

      const tasks = JSON.stringify([
        {
          reachCondition: { type: 'sign', amount: 10 },
          rewardSetting: { type: 'cash', amount: 1, limit: 10 },
        },
      ]);
      // startTime slightly in the future so update runs while "未开始"; endTime well ahead.
      const startTime = Date.now() + 8000;
      const endTime = Date.now() + 7200000;

      // create returns the activityId as a bare number payload.
      const createOutput = runCliSuccess([
        'interaction',
        'task-reward',
        'create',
        '--channel-id',
        id,
        '--activity-name',
        'cli-task-reward-activity',
        '--task-rule',
        '1',
        '--start-time',
        String(startTime),
        '--end-time',
        String(endTime),
        '--tasks-json',
        tasks,
        '--force',
        '--output',
        'json',
      ]);
      const idMatch = createOutput.match(/(\d+)\s*$/);
      activityId = idMatch ? idMatch[1] : '';
      expect(activityId).toMatch(/^\d+$/);

      // viewer-detail is a clean read of the just-created activity.
      const detailOutput = runCliSuccess([
        'interaction',
        'task-reward',
        'viewer-detail',
        '--channel-id',
        id,
        '--activity-id',
        activityId,
        '--output',
        'json',
      ]);
      const detail = parseJsonObject(detailOutput);
      expect(Array.isArray(detail.contents)).toBe(true);
      expect(detail.pageNumber).toBe(1);

      // update requires task-rule + start/end-time (server rejects omitting them).
      const updateOutput = runCliSuccess([
        'interaction',
        'task-reward',
        'update',
        '--channel-id',
        id,
        '--activity-id',
        activityId,
        '--task-rule',
        '1',
        '--activity-name',
        'cli-task-reward-activity-updated',
        '--start-time',
        String(startTime),
        '--end-time',
        String(endTime),
        '--tasks-json',
        tasks,
        '--force',
        '--output',
        'json',
      ]);
      expect(parseJsonObject(updateOutput).success).toBe(true);

      // Wait until the activity has "started" (now > startTime) so stop is allowed.
      await new Promise((resolve) => setTimeout(resolve, 6000));

      const stopOutput = runCliSuccess([
        'interaction',
        'task-reward',
        'stop',
        '--activity-id',
        activityId,
        '--force',
        '--output',
        'json',
      ]);
      expect(parseJsonObject(stopOutput).success).toBe(true);

      const deleteOutput = runCliSuccess([
        'interaction',
        'task-reward',
        'delete',
        '--activity-id',
        activityId,
        '--force',
        '--output',
        'json',
      ]);
      expect(parseJsonObject(deleteOutput).success).toBe(true);
      activityId = undefined; // deleted; skip finally cleanup
    } finally {
      if (activityId) {
        // Best-effort cleanup if the lifecycle aborted before delete.
        try {
          runCliSuccess([
            'interaction',
            'task-reward',
            'delete',
            '--activity-id',
            activityId,
            '--force',
            '--output',
            'json',
          ]);
        } catch {
          // activity may already be deleted or never created
        }
      }
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 240000);

  (shouldRunRealChannelTests ? it : it.skip)('runs the interaction webhook set -> get -> delete lifecycle against a temporary real channel', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Interaction Webhook Set Delete');
      const roomId = channelId;
      const callbackUrl = `https://example.com/polyv-it-webhook/${roomId}`;

      // set returns the documented empty-string data payload ("").
      const setOutput = runCliSuccess([
        'interaction',
        'webhook',
        'set',
        '--room-id',
        roomId,
        '--callback-url',
        callbackUrl,
        '--force',
        '--output',
        'json',
      ]);
      expect(JSON.parse(setOutput.trim())).toBe('');

      // get must reflect the callback URL we just saved.
      const getOutput = runCliSuccess([
        'interaction',
        'webhook',
        'get',
        '--room-id',
        roomId,
        '--output',
        'json',
      ]);
      const getConfig = parseJsonObject(getOutput) as { callbackUrl?: string };
      expect(getConfig.callbackUrl).toBe(callbackUrl);

      // delete restores the account config; returns the empty-string payload.
      const deleteOutput = runCliSuccess([
        'interaction',
        'webhook',
        'delete',
        '--room-id',
        roomId,
        '--force',
        '--output',
        'json',
      ]);
      expect(JSON.parse(deleteOutput.trim())).toBe('');
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 240000);

  // favor / teacher-answer / invite-poster create are self-contained
  // channel-scoped writes that work on a freshly created (non-live) channel.
  // The viewer id / viewer-user-id resolve to the account user id; the created
  // answer and invite poster are scoped to the temporary channel, so deleting
  // it in `finally` disposes of them.
  (shouldRunRealChannelTests ? it : it.skip)('runs interaction favor, teacher-answer, and invite-poster create against a temporary real channel', () => {
    const credentials = getAccountCredentials();
    if (!credentials?.userId) {
      // favor / teacher-answer need an account user id; skip cleanly if absent.
      return;
    }
    const viewerId = credentials.userId;
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Interaction Favor Answer Poster');
      const id = channelId;

      // favor sends likes for a viewer; the API returns the like count as a
      // bare JSON number (no object wrapper), so parse directly.
      const favorOutput = runCliSuccess([
        'interaction',
        'favor',
        '-c',
        id,
        '--viewer-id',
        viewerId,
        '--times',
        '2',
        '--force',
        '--output',
        'json',
      ]);
      expect(Number.isInteger(JSON.parse(favorOutput.trim()))).toBe(true);

      // teacher-answer sends a teacher answer to a student question; room-id is
      // the channel id and viewer-user-id is the account user id. Returns {id}.
      const answerOutput = runCliSuccess([
        'interaction',
        'teacher-answer',
        '--room-id',
        id,
        '--viewer-user-id',
        viewerId,
        '--content',
        'cli-integration-answer',
        '--force',
        '--output',
        'json',
      ]);
      const answer = parseJsonObject(answerOutput) as { id?: number };
      expect(Number.isInteger(answer.id)).toBe(true);

      // invite-poster create registers an invite poster inviter for the
      // channel; returns the new poster object with invitePosterId + channelId.
      const posterOutput = runCliSuccess([
        'interaction',
        'invite-poster',
        'create',
        '-c',
        id,
        '--open-id',
        `it-open-${Date.now()}`,
        '--nickname',
        'IT Inviter',
        '--force',
        '--output',
        'json',
      ]);
      const poster = parseJsonObject(posterOutput) as {
        invitePosterId?: string;
        channelId?: number;
        openId?: string;
      };
      expect(typeof poster.invitePosterId).toBe('string');
      expect(poster.invitePosterId?.length).toBeGreaterThan(0);
      expect(String(poster.channelId)).toBe(id);
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 180000);
});
