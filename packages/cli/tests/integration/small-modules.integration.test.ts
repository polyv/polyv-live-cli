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
const groupAllocationEmails = (
  process.env['POLYV_TEST_GROUP_EMAILS'] ||
  process.env['POLYV_TEST_GROUP_EMAIL'] ||
  ''
).trim();
const shouldRunGroupAllocationLogTests = shouldRunRealChannelTests && groupAllocationEmails.length > 0;
const groupResourceEmail = (process.env['POLYV_TEST_GROUP_RESOURCE_EMAIL'] || '').trim();
const groupResourceConcurrences = readPositiveIntegerEnv('POLYV_TEST_GROUP_RESOURCE_CONCURRENCES');
const groupResourceLiveDuration = readPositiveIntegerEnv('POLYV_TEST_GROUP_RESOURCE_LIVE_DURATION');
const groupResourceSpace = readPositiveIntegerEnv('POLYV_TEST_GROUP_RESOURCE_SPACE');
const shouldRunGroupResourceWriteTests = shouldRunRealChannelTests &&
  process.env['POLYV_TEST_ALLOW_GROUP_RESOURCE_WRITES'] === 'true' &&
  groupResourceEmail.length > 0 &&
  groupResourceConcurrences !== undefined &&
  groupResourceLiveDuration !== undefined &&
  groupResourceSpace !== undefined;

function readPositiveIntegerEnv(name: string): string | undefined {
  const value = (process.env[name] || '').trim();
  return /^[1-9]\d*$/.test(value) ? value : undefined;
}

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

function isExpectedGroupCapabilityFailure(output: string): boolean {
  return expectedGroupCapabilityFailures.some((text) => output.includes(text));
}

function expectSuccessfulGroupResourceWrite(output: string): void {
  const parsed = parseJsonObject(output);
  expect(parsed.success).toBe(true);
  expect(parsed).toHaveProperty('result');
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
        expect(isExpectedGroupCapabilityFailure(groupResult.output)).toBe(true);
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
          const result = runCli(args, { timeout: 60000 });
          if (result.exitCode !== 0) {
            expect(isExpectedGroupCapabilityFailure(result.output)).toBe(true);
          } else {
            expectPaginatedObject(result.output);
          }
        }
      } finally {
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    240000,
  );

  (shouldRunGroupAllocationLogTests ? it : it.skip)(
    'runs group allocation log reads through the real CLI with a fixture sub-account email',
    () => {
      let channelId: string | undefined;

      try {
        // Allocation-log reads are account-scoped and require a real group
        // sub-account email fixture. The temporary channel keeps the integration
        // run aligned with the disposable-test-asset convention.
        channelId = createTemporaryChannel('Group Allocation Logs');

        const legacyAllocation = runCliSuccess([
          'group',
          'allocate-log',
          '--emails',
          groupAllocationEmails,
          '--type',
          'all',
          '--page',
          '1',
          '--page-size',
          '5',
          '--output',
          'json',
        ]);
        expectPaginatedObject(legacyAllocation);

        const v4Allocation = runCliSuccess([
          'group',
          'user',
          'allocation-log',
          '--emails',
          groupAllocationEmails,
          '--page-number',
          '1',
          '--page-size',
          '5',
          '--output',
          'json',
        ]);
        expectPaginatedObject(v4Allocation);
      } finally {
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    180000,
  );

  (shouldRunGroupResourceWriteTests ? it : it.skip)(
    'runs reversible group resource write commands through the real CLI',
    () => {
      let channelId: string | undefined;
      const pendingRecoveries: string[][] = [];

      const runResourceWrite = (args: string[]): void => {
        expectSuccessfulGroupResourceWrite(runCliSuccess(args, 60000));
      };

      const recover = (args: string[]): void => {
        runResourceWrite(args);
        const index = pendingRecoveries.findIndex((pending) => pending.join('\0') === args.join('\0'));
        if (index !== -1) {
          pendingRecoveries.splice(index, 1);
        }
      };

      try {
        // Group resource writes are account-scoped. The temporary channel keeps
        // the suite aligned with the disposable-test-asset convention.
        channelId = createTemporaryChannel('Group Resource Writes');

        const recoverConcurrences = [
          'group',
          'resource',
          'set-concurrences',
          '--email',
          groupResourceEmail,
          '--concurrences',
          groupResourceConcurrences!,
          '--type',
          'recover',
          '--force',
          '--output',
          'json',
        ];
        runResourceWrite([
          'group',
          'resource',
          'set-concurrences',
          '--email',
          groupResourceEmail,
          '--concurrences',
          groupResourceConcurrences!,
          '--type',
          'add',
          '--force',
          '--output',
          'json',
        ]);
        pendingRecoveries.push(recoverConcurrences);
        recover(recoverConcurrences);

        const recoverLiveDurations = [
          'group',
          'resource',
          'set-live-durations',
          '--email',
          groupResourceEmail,
          '--duration',
          groupResourceLiveDuration!,
          '--type',
          'recover',
          '--force',
          '--output',
          'json',
        ];
        runResourceWrite([
          'group',
          'resource',
          'set-live-durations',
          '--email',
          groupResourceEmail,
          '--duration',
          groupResourceLiveDuration!,
          '--type',
          'add',
          '--force',
          '--output',
          'json',
        ]);
        pendingRecoveries.push(recoverLiveDurations);
        recover(recoverLiveDurations);

        const recoverSpace = [
          'group',
          'resource',
          'set-space',
          '--email',
          groupResourceEmail,
          '--space',
          groupResourceSpace!,
          '--type',
          'recover',
          '--force',
          '--output',
          'json',
        ];
        runResourceWrite([
          'group',
          'resource',
          'set-space',
          '--email',
          groupResourceEmail,
          '--space',
          groupResourceSpace!,
          '--type',
          'add',
          '--force',
          '--output',
          'json',
        ]);
        pendingRecoveries.push(recoverSpace);
        recover(recoverSpace);
      } finally {
        const cleanupErrors: string[] = [];

        for (const args of pendingRecoveries.reverse()) {
          try {
            runResourceWrite(args);
          } catch (error) {
            cleanupErrors.push(error instanceof Error ? error.message : String(error));
          }
        }

        if (channelId) {
          try {
            deleteTemporaryChannel(channelId);
          } catch (error) {
            cleanupErrors.push(error instanceof Error ? error.message : String(error));
          }
        }

        if (cleanupErrors.length > 0) {
          throw new Error(`Group resource write cleanup failed:\n${cleanupErrors.join('\n')}`);
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

        const tencentResult = runCli([
          'monitor',
          'tencent-stream-info-list',
          '--channel-id',
          channelId,
          '--output',
          'json',
        ], { timeout: 60000 });
        if (tencentResult.exitCode !== 0) {
          expect(tencentResult.output.toLowerCase()).toContain('not live');
        } else {
          const tencentStreams = parseJsonValue(tencentResult.output);
          expect(Array.isArray(tencentStreams)).toBe(true);
        }

        const inviterPosterResult = runCli([
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
        ], { timeout: 60000 });
        if (inviterPosterResult.exitCode !== 0) {
          expect(inviterPosterResult.output).toContain('Request failed with status code 404');
        } else {
          const inviterPoster = parseJsonObject(inviterPosterResult.output);
          expect(typeof inviterPoster.pageNumber).toBe('number');
          expect(typeof inviterPoster.pageSize).toBe('number');
          expect(Array.isArray(inviterPoster.contents)).toBe(true);
        }
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

        const audioUpdateResult = runCli([
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
        ], { timeout: 60000 });
        if (audioUpdateResult.exitCode !== 0) {
          expect(audioUpdateResult.output).toMatch(/账号未开启.*审核功能/);
          return;
        }

        const audioUpdate = parseJsonObject(audioUpdateResult.output);
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

        const videoUpdateResult = runCli([
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
        ], { timeout: 60000 });
        if (videoUpdateResult.exitCode !== 0) {
          expect(videoUpdateResult.output).toMatch(/账号未开启.*审核功能/);
          return;
        }

        const videoUpdate = parseJsonObject(videoUpdateResult.output);
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
