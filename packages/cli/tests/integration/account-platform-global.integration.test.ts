/**
 * Lightweight integration checks for account/platform/global CLI command surfaces.
 */

import { runCli } from '../helpers/cli-runner';

describe('Account, platform, and global CLI integration', () => {
  it('should show account api help', () => {
    const result = runCli(['account', 'api', '--help'], { includeTestEnv: false });

    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('channels');
    expect(result.output).toContain('category');
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
});
