/**
 * Lightweight integration checks for account/platform/global CLI command surfaces.
 */

import { runCli } from '../helpers/cli-runner';
import {
  createTemporaryChannel,
  deleteTemporaryChannel,
  runCliSuccess,
} from '../helpers/channel-fixture';
import { hasRealCredentials } from '../helpers/integration-config';

const shouldRunRealChannelTests = hasRealCredentials();

describe('Account, platform, and global CLI integration', () => {
  it('should show account api help', () => {
    const result = runCli(['account', 'api', '--help'], { includeTestEnv: false });

    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('channels');
    expect(result.output).toContain('category');
  });

  it('should show platform label help', () => {
    const result = runCli(['platform', 'label', 'list', '--help'], { includeTestEnv: false });

    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('--output');
  });

  it('should show platform anchor and coupon help with force options', () => {
    const anchorCreate = runCli(['platform', 'anchor', 'create', '--help'], { includeTestEnv: false });
    const couponUpdate = runCli(['platform', 'coupon', 'update', '--help'], { includeTestEnv: false });

    expect(anchorCreate.exitCode).toBe(0);
    expect(anchorCreate.output).toContain('--force');
    expect(couponUpdate.exitCode).toBe(0);
    expect(couponUpdate.output).toContain('--force');
  });

  it('should show global update help with force options', () => {
    const authUpdate = runCli(['global', 'auth', 'update', '--help'], { includeTestEnv: false });
    const pageSettingUpdate = runCli(['global', 'page-setting', 'update', '--help'], { includeTestEnv: false });

    expect(authUpdate.exitCode).toBe(0);
    expect(authUpdate.output).toContain('--force');
    expect(pageSettingUpdate.exitCode).toBe(0);
    expect(pageSettingUpdate.output).toContain('--force');
  });

  (shouldRunRealChannelTests ? it : it.skip)('runs account, platform, and global read commands through the real CLI', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Account Platform Read Smoke');
      const id = channelId;
      const readCommands = [
        ['account', 'api', 'channels', '--output', 'json'],
        ['account', 'api', 'playback', 'list', '--page', '1', '--page-size', '5', '--output', 'json'],
        ['account', 'api', 'channel', 'basic-list', '--page', '1', '--page-size', '5', '--output', 'json'],
        ['account', 'api', 'channel', 'list', '--page', '1', '--page-size', '5', '--output', 'json'],
        ['account', 'api', 'channel', 'detail-list', '--page', '1', '--page-size', '5', '--output', 'json'],
        ['account', 'api', 'durations', '--output', 'json'],
        ['account', 'api', 'mic-duration', '--output', 'json'],
        ['account', 'api', 'receive-list', '--channel-id', id, '--page', '1', '--page-size', '5', '--output', 'json'],
        ['account', 'api', 'category', 'list', '--output', 'json'],
        ['platform', 'get', '--output', 'json'],
        ['platform', 'switch', 'get', '--output', 'json'],
        ['platform', 'setting', 'get', '--output', 'json'],
        ['platform', 'label', 'list', '--output', 'json'],
        ['global', 'auth', 'get', '--output', 'json'],
        ['global', 'page-setting', 'get', '--output', 'json'],
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
