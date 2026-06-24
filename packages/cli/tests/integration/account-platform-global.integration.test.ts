/**
 * Lightweight integration checks for account/platform/global CLI command surfaces.
 */

import { runCli } from '../helpers/cli-runner';
import {
  createTemporaryChannel,
  deleteTemporaryChannel,
  parseJsonObject,
  parseJsonValue,
  runCliSuccess,
} from '../helpers/channel-fixture';
import { getDefaultCredentials, hasRealCredentials } from '../helpers/integration-config';

const shouldRunRealChannelTests = hasRealCredentials();
const accountCredentials = getDefaultCredentials();

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getResponseField(parsed: Record<string, unknown>, field: string): unknown {
  const data = parsed.data && typeof parsed.data === 'object' ? parsed.data as Record<string, unknown> : undefined;
  const result = parsed.result && typeof parsed.result === 'object' ? parsed.result as Record<string, unknown> : undefined;
  const resultData = result?.data && typeof result.data === 'object'
    ? result.data as Record<string, unknown>
    : undefined;

  return parsed[field] ?? data?.[field] ?? result?.[field] ?? resultData?.[field];
}

function extractCategoryId(output: string): number {
  const parsed = parseJsonObject(output);
  const candidate = getResponseField(parsed, 'categoryId');
  const categoryId = Number(candidate);

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    throw new Error(`Cannot extract categoryId from CLI output:\n${output}`);
  }

  return categoryId;
}

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

  it('should show platform read command help', () => {
    const checks = [
      { args: ['platform', 'callback', 'get', '--help'], text: '--output' },
      { args: ['platform', 'anchor', 'list', '--help'], text: '--page-size' },
      { args: ['platform', 'content-group', 'list', '--help'], text: '--type' },
    ];

    for (const check of checks) {
      const result = runCli(check.args, { includeTestEnv: false });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain(check.text);
    }
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
        ['platform', 'callback', 'get', '--output', 'json'],
        ['platform', 'anchor', 'list', '--page', '1', '--page-size', '5', '--output', 'json'],
        ['platform', 'content-group', 'list', '--type', 'script', '--output', 'json'],
        ['platform', 'content-group', 'list', '--type', 'robot', '--output', 'json'],
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

  (shouldRunRealChannelTests && accountCredentials?.userId ? it : it.skip)('runs account income list through the real CLI', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Account Income List Smoke');
      const endDate = new Date();
      const startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 1);

      const output = runCliSuccess([
        'account',
        'api',
        'income-list',
        '--user-id',
        accountCredentials!.userId!,
        '--start-date',
        formatDate(startDate),
        '--end-date',
        formatDate(endDate),
        '--channel-id',
        channelId,
        '--page',
        '1',
        '--page-size',
        '5',
        '--output',
        'json',
      ]);

      const parsed = parseJsonValue(output);
      expect(parsed).toEqual(expect.objectContaining({
        contents: expect.any(Array),
      }));
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 120000);

  (shouldRunRealChannelTests ? it : it.skip)('runs account category write lifecycle through the real CLI', () => {
    let channelId: string | undefined;
    let categoryId: number | undefined;
    let refCategoryId: number | undefined;
    const ts = Date.now();
    // PolyV categoryName limit is 20 chars; keep names short and unique.
    const uniqueName = `CatA${ts}`;
    const renamedName = `CatAUp${ts}`;
    const refName = `CatB${ts}`;

    const deleteCategory = (id: number | undefined) => {
      if (id === undefined) return;
      try {
        runCliSuccess([
          'account', 'api', 'category', 'delete',
          '--category-id', String(id), '--force', '--output', 'json',
        ]);
      } catch {
        // best-effort cleanup
      }
    };

    try {
      channelId = createTemporaryChannel('Account Category Lifecycle');

      // 1. create the category under test
      const createdOutput = runCliSuccess([
        'account', 'api', 'category', 'create',
        '--name', uniqueName, '--force', '--output', 'json',
      ]);
      const created = parseJsonObject(createdOutput);
      categoryId = extractCategoryId(createdOutput);
      expect(categoryId).toBeGreaterThan(0);
      expect(String(getResponseField(created, 'categoryName') ?? '')).toBe(uniqueName);

      // 2. create a second category to use as the move-after reference
      const refOutput = runCliSuccess([
        'account', 'api', 'category', 'create',
        '--name', refName, '--force', '--output', 'json',
      ]);
      refCategoryId = extractCategoryId(refOutput);
      expect(refCategoryId).toBeGreaterThan(0);

      // 3. rename (runCliSuccess guarantees exit 0)
      const renamed = parseJsonObject(runCliSuccess([
        'account', 'api', 'category', 'update-name',
        '--category-id', String(categoryId),
        '--name', renamedName, '--force', '--output', 'json',
      ]));
      expect(renamed).toBeDefined();

      // 4. update-rank: move the category to AFTER the reference category
      const updatedRank = parseJsonObject(runCliSuccess([
        'account', 'api', 'category', 'update-rank',
        '--category-id', String(categoryId),
        '--after-category-id', String(refCategoryId),
        '--force', '--output', 'json',
      ]));
      expect(updatedRank).toBeDefined();

      // 5. delete the category under test
      const deleted = parseJsonObject(runCliSuccess([
        'account', 'api', 'category', 'delete',
        '--category-id', String(categoryId), '--force', '--output', 'json',
      ]));
      expect(deleted).toBeDefined();
      categoryId = undefined;
    } finally {
      deleteCategory(categoryId);
      deleteCategory(refCategoryId);
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 180000);
});
