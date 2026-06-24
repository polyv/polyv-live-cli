import { runCli } from '../helpers/cli-runner';
import {
  createTemporaryChannel,
  deleteTemporaryChannel,
  parseJsonObject,
  runCliSuccess,
} from '../helpers/channel-fixture';
import { hasRealCredentials } from '../helpers/integration-config';

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
});
