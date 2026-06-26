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
const expectedGroupCapabilityFailures = ['找不到集团账号', 'not found', 'forbidden', 'failed', 'illegal'];

function formatBillingMonth(date = new Date()): string {
  const previousMonth = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 1, 1));
  const year = previousMonth.getUTCFullYear();
  const month = String(previousMonth.getUTCMonth() + 1).padStart(2, '0');
  return `${year}${month}`;
}

function expectPaginatedObject(output: string): void {
  const parsed = parseJsonObject(output);
  expect(Array.isArray(parsed.contents)).toBe(true);

  if (parsed.pageNumber !== undefined) {
    expect(typeof parsed.pageNumber).toBe('number');
  }

  if (parsed.pageSize !== undefined) {
    expect(typeof parsed.pageSize).toBe('number');
  }
}

describe('small module CLI integration', () => {
  function runCliWithDummyAuth(args: string[]) {
    return runCli(args, {
      includeTestEnv: false,
      env: {
        POLYV_APP_ID: 'dummyappid12345',
        POLYV_APP_SECRET: 'dummysecret123456789',
        POLYV_USER_ID: '',
        POLYV_TEST_APP_ID: '',
        POLYV_TEST_APP_SECRET: '',
        POLYV_TEST_USER_ID: '',
      },
    });
  }

  it('shows help for new utility command groups', () => {
    for (const command of ['group', 'finance', 'material', 'webapp', 'robot', 'partner']) {
      const result = runCli([command, '--help'], { includeTestEnv: false });
      expect(result.exitCode).toBe(0);
    }
  });

  it('shows force options for dangerous write commands', () => {
    const commands = [
      ['group', 'resource', 'set-space', '--help'],
      ['finance', 'audio-moderation', 'update', '--help'],
      ['material', 'delete', '--help'],
      ['webapp', 'role', 'delete', '--help'],
      ['robot', 'batch-delete', '--help'],
      ['partner', 'tencent-order', 'create', '--help'],
      ['player', 'anti-record', 'update', '--help'],
      ['channel', 'ccb-focus-reset', '--help'],
    ];

    for (const args of commands) {
      const result = runCli(args, { includeTestEnv: false });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('--force');
    }
  });

  it('shows help for categorized read commands', () => {
    const commands = [
      ['player', 'watch-feedback-list', '--help'],
      ['statistics', 'session-summary-list', '--help'],
      ['monitor', 'tencent-stream-info-list', '--help'],
      ['chat', 'group-login-times', '--help'],
      ['channel', 'status-valid', '--help'],
    ];

    for (const args of commands) {
      const result = runCli(args, { includeTestEnv: false });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('--output');
    }
  });

  (shouldRunRealChannelTests ? it : it.skip)('runs small module read commands through the real CLI', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Small Module Read Smoke');
      const id = channelId;
      const readCommands = [
        ['finance', 'bill-detail-list', '--item-category', 'duration', '--start-date', '2026-06-01', '--end-date', '2026-06-20', '--page-number', '1', '--page-size', '5', '--output', 'json'],
        ['material', 'label', 'list', '--page-number', '1', '--page-size', '5', '--output', 'json'],
        ['webapp', 'permission-list', '--output', 'json'],
        ['webapp', 'role', 'list', '--page-number', '1', '--page-size', '5', '--output', 'json'],
        ['robot', 'list', '--page-number', '1', '--page-size', '5', '--output', 'json'],
        ['player', 'watch-feedback-list', '--channel-id', id, '--output', 'json'],
        ['statistics', 'session-summary-list', '--channel-id', id, '--page-number', '1', '--page-size', '5', '--output', 'json'],
        ['channel', 'status-valid', '--channels', id, '--output', 'json'],
      ];

      for (const args of readCommands) {
        runCliSuccess(args);
      }

      const groupResult = runCli(['group', 'health-check', '--output', 'json'], { timeout: 60000 });
      if (groupResult.exitCode !== 0) {
        expect(expectedGroupCapabilityFailures.some((text) => groupResult.output.includes(text))).toBe(true);
      } else {
        expect(groupResult.output).toContain('{');
      }
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 240000);

  (shouldRunRealChannelTests ? it : it.skip)(
    'runs material list through the real CLI and asserts pagination structure',
    () => {
      let channelId: string | undefined;

      try {
        channelId = createTemporaryChannel('Material List Smoke');

        const output = runCliSuccess([
          'material',
          'list',
          '--type',
          'image',
          '--page-number',
          '1',
          '--page-size',
          '5',
          '--output',
          'json',
        ]);

        const parsed = parseJsonObject(output);
        expect(parsed.pageNumber).toBe(1);
        expect(parsed.pageSize).toBe(5);
        expect(Array.isArray(parsed.contents)).toBe(true);
      } finally {
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    180000,
  );

  (shouldRunRealChannelTests ? it : it.skip)(
    'runs group read commands through the real CLI and asserts pagination structure',
    () => {
      let channelId: string | undefined;

      try {
        // Group reads are account-scoped; the temporary channel is the disposable
        // real test asset required by the integration-test convention.
        channelId = createTemporaryChannel('Group Read Smoke');
        const billingMonth = formatBillingMonth();
        const readCommands = [
          [
            'group',
            'billing-daily',
            '--billing-date',
            billingMonth,
            '--page-number',
            '1',
            '--page-size',
            '5',
            '--output',
            'json',
          ],
          [
            'group',
            'user',
            'billing-daily',
            '--start-date',
            billingMonth,
            '--end-date',
            billingMonth,
            '--page-number',
            '1',
            '--page-size',
            '5',
            '--output',
            'json',
          ],
          [
            'group',
            'user',
            'package-list',
            '--page-number',
            '1',
            '--page-size',
            '5',
            '--output',
            'json',
          ],
          [
            'group',
            'user',
            'package-validity-list',
            '--page-number',
            '1',
            '--page-size',
            '5',
            '--output',
            'json',
          ],
        ];

        for (const args of readCommands) {
          expectPaginatedObject(runCliSuccess(args, 60000));
        }
      } finally {
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    240000,
  );

  (shouldRunRealChannelTests ? it : it.skip)(
    'runs uncovered channel-scoped monitor and statistics reads through the real CLI',
    () => {
      let channelId: string | undefined;

      try {
        channelId = createTemporaryChannel('Small Module Read Gaps');

        const tencentStreams = parseJsonValue(
          runCliSuccess([
            'monitor',
            'tencent-stream-info-list',
            '--channel-id',
            channelId,
            '--output',
            'json',
          ]),
        );
        expect(Array.isArray(tencentStreams)).toBe(true);

        const inviterPoster = parseJsonObject(
          runCliSuccess([
            'statistics',
            'inviter-poster-list',
            '--channel-id',
            channelId,
            '--page-number',
            '1',
            '--page-size',
            '5',
            '--output',
            'json',
          ]),
        );
        expect(typeof inviterPoster.pageNumber).toBe('number');
        expect(typeof inviterPoster.pageSize).toBe('number');
        expect(Array.isArray(inviterPoster.contents)).toBe(true);
      } finally {
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    180000,
  );

  (shouldRunRealChannelTests ? it : it.skip)(
    'runs finance moderation channel commands through the real CLI',
    () => {
      let channelId: string | undefined;

      try {
        channelId = createTemporaryChannel('Finance Moderation Smoke');

        const audioUpdate = parseJsonObject(
          runCliSuccess([
            'finance',
            'audio-moderation',
            'update',
            '--channel-id',
            channelId,
            '--moderation-enabled',
            'N',
            '--moderation-strategy',
            'normal',
            '--badword-enabled',
            'N',
            '--illegal-notify',
            '{"platformEnabled":"N"}',
            '--force',
            '--output',
            'json',
          ]),
        );
        expect(audioUpdate.success).toBe(true);
        expect(audioUpdate.channelId).toBe(channelId);

        const audioSettings = parseJsonObject(
          runCliSuccess([
            'finance',
            'audio-moderation',
            'get',
            '--channel-id',
            channelId,
            '--output',
            'json',
          ]),
        );
        expect(String(audioSettings.channelId)).toBe(channelId);
        expect(typeof audioSettings.moderationEnabled).toBe('string');
        expect(typeof audioSettings.moderationStrategy).toBe('string');

        const audioRecords = parseJsonObject(
          runCliSuccess([
            'finance',
            'audio-moderation',
            'list',
            '--channel-id',
            channelId,
            '--page-number',
            '1',
            '--page-size',
            '5',
            '--output',
            'json',
          ]),
        );
        expect(Array.isArray(audioRecords.contents)).toBe(true);
        expect(typeof audioRecords.pageNumber).toBe('number');
        expect(typeof audioRecords.pageSize).toBe('number');

        const videoUpdate = parseJsonObject(
          runCliSuccess([
            'finance',
            'video-moderation',
            'update',
            '--channel-id',
            channelId,
            '--moderation-enabled',
            'N',
            '--moderation-strategy',
            'finance_easy',
            '--image-frequency',
            '60',
            '--illegal-notify',
            '{"platformEnabled":"N"}',
            '--force',
            '--output',
            'json',
          ]),
        );
        expect(videoUpdate.success).toBe(true);
        expect(videoUpdate.channelId).toBe(channelId);

        const videoSettings = parseJsonObject(
          runCliSuccess([
            'finance',
            'video-moderation',
            'get',
            '--channel-id',
            channelId,
            '--output',
            'json',
          ]),
        );
        expect(String(videoSettings.channelId)).toBe(channelId);
        expect(typeof videoSettings.moderationEnabled).toBe('string');
        expect(typeof videoSettings.moderationStrategy).toBe('string');

        const videoResults = parseJsonObject(
          runCliSuccess([
            'finance',
            'video-moderation',
            'result-list',
            '--channel-id',
            channelId,
            '--page-number',
            '1',
            '--page-size',
            '5',
            '--output',
            'json',
          ]),
        );
        expect(Array.isArray(videoResults.contents)).toBe(true);
        expect(typeof videoResults.pageNumber).toBe('number');
        expect(typeof videoResults.pageSize).toBe('number');
      } finally {
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    240000,
  );

  it('runs monitor layouts through the real CLI and cleans up a disposable channel when available', () => {
    let channelId: string | undefined;

    try {
      if (shouldRunRealChannelTests) {
        channelId = createTemporaryChannel('Monitor Layouts Smoke');
      }

      const output = runCliSuccess(['monitor', 'layouts', '--output', 'json']);
      const layouts = parseJsonValue(output);
      if (!Array.isArray(layouts)) {
        throw new Error(`Expected monitor layouts to return a JSON array:\n${output}`);
      }

      expect(layouts).toEqual(expect.arrayContaining([
        expect.objectContaining({
          name: 'default',
          minSize: '120x30',
          components: 4,
        }),
        expect.objectContaining({
          name: 'compact',
          minSize: '80x24',
          components: 2,
        }),
        expect.objectContaining({
          name: 'single',
          minSize: '60x20',
          components: 1,
        }),
      ]));
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 120000);

  it('requires confirmation or force for partner write commands in non-TTY mode', () => {
    const commands = [
      [
        'partner',
        'user-register',
        '--company',
        'Test Company',
        '--mobile',
        '13800138000',
        '--contact',
        'Test User',
        '--email',
        'test@example.com',
        '--output',
        'json',
      ],
      [
        'partner',
        'tencent-order',
        'create',
        '--uin',
        '100000000001',
        '--order-id',
        `cli-order-${Date.now()}`,
        '--email',
        'test@example.com',
        '--mobile',
        '13800138000',
        '--basic-service',
        '[{"product":"live","quantity":1}]',
        '--output',
        'json',
      ],
    ];

    for (const args of commands) {
      const result = runCliWithDummyAuth(args);
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('Interactive confirmation not available in non-TTY environment');
      expect(result.output).toContain('--force');
    }
  });
});
