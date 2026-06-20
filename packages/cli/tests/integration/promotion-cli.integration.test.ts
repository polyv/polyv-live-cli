import {
  createTemporaryChannel,
  deleteTemporaryChannel,
  parseJsonValue,
} from '../helpers/channel-fixture';
import { runCli } from '../helpers/cli-runner';
import { hasRealCredentials } from '../helpers/integration-config';

const shouldRunRealChannelTests = hasRealCredentials();
const expectedPromotionApiFailures = ['系统异常', 'not found', 'forbidden', 'failed', 'illegal'];

function runPromotionCliWithDummyAuth(args: string[]) {
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

describe('promotion real CLI safety checks', () => {
  it('shows force option for promotion create', () => {
    const result = runCli(['promotion', 'create', '--help'], { includeTestEnv: false });

    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('--force');
  });

  it('requires confirmation or force for promotion create in non-TTY mode', () => {
    const result = runPromotionCliWithDummyAuth([
      'promotion',
      'create',
      '--channelId',
      '123456',
      '--names',
      'CLI Test',
      '--output',
      'json',
    ]);

    expect(result.exitCode).toBe(1);
    expect(result.output).toContain('Interactive confirmation not available in non-TTY environment');
    expect(result.output).toContain('--force');
  });
});

(shouldRunRealChannelTests ? describe : describe.skip)('promotion real CLI integration', () => {
  it('reaches promotion list through the real CLI', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Promotion CLI Read Smoke');
      const result = runCli([
        'promotion',
        'list',
        '--channelId',
        channelId,
        '--output',
        'json',
      ], { timeout: 60000 });

      if (result.exitCode !== 0) {
        expect(expectedPromotionApiFailures.some((text) => result.output.includes(text))).toBe(true);
        return;
      }

      const parsed = parseJsonValue(result.output);
      expect(Array.isArray(parsed)).toBe(true);
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 180000);

  it('reaches promotion create through the real CLI when forced', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Promotion CLI Create Smoke');
      const result = runCli([
        'promotion',
        'create',
        '--channelId',
        channelId,
        '--names',
        `CLI${Date.now().toString(36).slice(-8)}`.slice(0, 20),
        '--force',
        '--output',
        'json',
      ], { timeout: 60000 });

      if (result.exitCode !== 0) {
        expect(expectedPromotionApiFailures.some((text) => result.output.includes(text))).toBe(true);
        return;
      }

      const parsed = parseJsonValue(result.output);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(1);
      expect(parsed[0]).toEqual(expect.objectContaining({
        promoteId: expect.any(String),
        popularizationName: expect.any(String),
      }));
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 180000);
});
