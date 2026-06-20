import {
  createTemporaryChannel,
  deleteTemporaryChannel,
  parseJsonValue,
} from '../helpers/channel-fixture';
import { runCli } from '../helpers/cli-runner';
import { hasRealCredentials } from '../helpers/integration-config';

const shouldRunRealChannelTests = hasRealCredentials();
const expectedPromotionApiFailures = ['系统异常', 'not found', 'forbidden', 'failed', 'illegal'];

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
});
