import { runCli } from '../helpers/cli-runner';
import {
  createTemporaryChannel,
  deleteTemporaryChannel,
  runCliSuccess,
} from '../helpers/channel-fixture';
import { hasRealCredentials } from '../helpers/integration-config';

const shouldRunRealChannelTests = hasRealCredentials();

describe('legacy read CLI integration', () => {
  it('shows help for legacy read commands', () => {
    const checks = [
      { args: ['product', 'list', '--help'], text: '--channel-id' },
      { args: ['player', 'config', 'get', '--help'], text: '--channel-id' },
      { args: ['stream', 'status', '--help'], text: '--channelId' },
      { args: ['coupon', 'list', '--help'], text: '--status' },
      { args: ['card-push', 'list', '--help'], text: '--channelId' },
      { args: ['watch-condition', 'get', '--help'], text: '--channel-id' },
      { args: ['whitelist', 'list', '--help'], text: '--rank' },
    ];

    for (const check of checks) {
      const result = runCli(check.args, { includeTestEnv: false });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain(check.text);
    }
  });

  (shouldRunRealChannelTests ? it : it.skip)('runs legacy read commands through the real CLI', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Legacy Read Smoke');
      const id = channelId;
      const readCommands = [
        ['product', 'list', '--channel-id', id, '--page', '1', '--size', '5', '--output', 'json'],
        ['product', 'list', '--platform', '--page', '1', '--size', '5', '--output', 'json'],
        ['player', 'config', 'get', '--channel-id', id, '--output', 'json'],
        ['stream', 'status', '--channelId', id, '--output', 'json'],
        ['coupon', 'list', '--page', '1', '--size', '5', '--output', 'json'],
        ['card-push', 'list', '--channelId', id, '--output', 'json'],
        ['watch-condition', 'get', '--channel-id', id, '--output', 'json'],
        ['whitelist', 'list', '--channel-id', id, '--rank', '1', '--page', '1', '--page-size', '5', '--output', 'json'],
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
});
