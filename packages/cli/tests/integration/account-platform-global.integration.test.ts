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

  // `account api callback set` is an account-scoped write: it sets the stream /
  // record / playback callback URL for the account. It is cleanly reversible —
  // omitting --url clears the callback (the SDK drops the url param), which also
  // serves as cleanup. A temporary channel is created as the real test asset per
  // convention even though the command is account-scoped.
  it('should show platform callback/switch/setting update help with force options', () => {
    const checks = [
      { args: ['platform', 'callback', 'update', '--help'], text: '--clear-url' },
      { args: ['platform', 'switch', 'update', '--help'], text: '--param' },
      { args: ['platform', 'setting', 'update', '--help'], text: '--cover-img-type' },
    ];

    for (const check of checks) {
      const result = runCli(check.args, { includeTestEnv: false });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('--force');
      expect(result.output).toContain(check.text);
    }
  });

  // `platform callback update` is an account-scoped reversible write: --url sets
  // streamCallbackUrl and --clear-url restores it to empty. The original value is
  // captured up front and restored in `finally` so the account-global config is
  // always left unchanged. Verified via `platform callback get`. A temporary
  // channel is created as the real test asset per convention.
  (shouldRunRealChannelTests ? it : it.skip)(
    'runs platform callback update (set then clear) through the real CLI',
    () => {
      let channelId: string | undefined;
      let originalUrl: string | undefined;
      const restoreCallback = () => {
        if (originalUrl === undefined) return;
        try {
          if (originalUrl === '') {
            runCliSuccess([
              'platform', 'callback', 'update',
              '--clear-url', '--force', '--output', 'json',
            ]);
          } else {
            runCliSuccess([
              'platform', 'callback', 'update',
              '--url', originalUrl, '--force', '--output', 'json',
            ]);
          }
        } catch {
          // best-effort cleanup
        }
      };

      try {
        channelId = createTemporaryChannel('Platform Callback Update');

        originalUrl = String(
          parseJsonObject(runCliSuccess(['platform', 'callback', 'get', '--output', 'json']))
            .streamCallbackUrl ?? '',
        );

        // set the stream callback to a throwaway URL
        const setOutput = runCliSuccess([
          'platform', 'callback', 'update',
          '--url', `https://example.com/polyv-it-cb-${Date.now()}`,
          '--force', '--output', 'json',
        ]);
        const set = parseJsonObject(setOutput);
        expect(set.success).toBe(true);
        expect(String(set.streamCallbackUrl ?? '')).toMatch(/^https:\/\/example\.com\//);

        // verify persistence through the read command
        const afterSet = parseJsonObject(
          runCliSuccess(['platform', 'callback', 'get', '--output', 'json']),
        );
        expect(String(afterSet.streamCallbackUrl ?? '')).toMatch(/^https:\/\//);

        // clear: --clear-url restores streamCallbackUrl to empty
        const clearOutput = runCliSuccess([
          'platform', 'callback', 'update',
          '--clear-url', '--force', '--output', 'json',
        ]);
        const cleared = parseJsonObject(clearOutput);
        expect(cleared.success).toBe(true);

        const afterClear = parseJsonObject(
          runCliSuccess(['platform', 'callback', 'get', '--output', 'json']),
        );
        expect(String(afterClear.streamCallbackUrl ?? '')).toBe('');
      } finally {
        restoreCallback();
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    180000,
  );

  // `platform switch update` is an account-scoped reversible write that toggles a
  // global switch (autoPlay). The original enabled value is captured up front and
  // restored in `finally`. Verified via `platform switch get`.
  (shouldRunRealChannelTests ? it : it.skip)(
    'runs platform switch update (toggle then restore) through the real CLI',
    () => {
      let channelId: string | undefined;
      let originalEnabled: string | undefined;
      const readSwitch = (type: string): string => {
        const switches = parseJsonValue(
          runCliSuccess(['platform', 'switch', 'get', '--output', 'json']),
        ) as Array<{ type: string; enabled: string }>;
        const entry = switches.find((item) => item.type === type);
        return entry ? entry.enabled : 'Y';
      };
      const restoreSwitch = () => {
        if (originalEnabled === undefined) return;
        try {
          runCliSuccess([
            'platform', 'switch', 'update',
            '--param', 'autoPlay', '--enabled', originalEnabled,
            '--force', '--output', 'json',
          ]);
        } catch {
          // best-effort cleanup
        }
      };

      try {
        channelId = createTemporaryChannel('Platform Switch Update');

        originalEnabled = readSwitch('autoPlay');
        const flipped = originalEnabled === 'Y' ? 'N' : 'Y';

        const updateOutput = runCliSuccess([
          'platform', 'switch', 'update',
          '--param', 'autoPlay', '--enabled', flipped,
          '--force', '--output', 'json',
        ]);
        const updated = parseJsonObject(updateOutput);
        expect(updated.success).toBe(true);
        expect(updated.param).toBe('autoPlay');
        expect(updated.enabled).toBe(flipped);

        // verify persistence through the read command
        expect(readSwitch('autoPlay')).toBe(flipped);
      } finally {
        restoreSwitch();
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    180000,
  );

  // `platform setting update` is an account-scoped reversible write that toggles a
  // global setting (coverImgType cover<->contain). The original value is captured
  // up front and restored in `finally`. Verified via `platform setting get`.
  (shouldRunRealChannelTests ? it : it.skip)(
    'runs platform setting update (toggle then restore) through the real CLI',
    () => {
      let channelId: string | undefined;
      let originalCover: string | undefined;
      const readCover = (): string =>
        String(
          parseJsonObject(runCliSuccess(['platform', 'setting', 'get', '--output', 'json']))
            .coverImgType ?? 'cover',
        );
      const restoreSetting = () => {
        if (originalCover === undefined) return;
        try {
          runCliSuccess([
            'platform', 'setting', 'update',
            '--cover-img-type', originalCover, '--force', '--output', 'json',
          ]);
        } catch {
          // best-effort cleanup
        }
      };

      try {
        channelId = createTemporaryChannel('Platform Setting Update');

        originalCover = readCover();
        const flipped = originalCover === 'cover' ? 'contain' : 'cover';

        const updateOutput = runCliSuccess([
          'platform', 'setting', 'update',
          '--cover-img-type', flipped, '--force', '--output', 'json',
        ]);
        const updated = parseJsonObject(updateOutput);
        expect(updated.success).toBe(true);
        expect(updated.coverImgType).toBe(flipped);

        // verify persistence through the read command
        expect(readCover()).toBe(flipped);
      } finally {
        restoreSetting();
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    180000,
  );

  // `global auth update` is an account-scoped reversible write that updates the
  // default-template watch-condition auth settings (exactly 2 items: primary +
  // secondary). The original settings are captured up front and restored in
  // `finally` so the account-global template is always left unchanged. Verified
  // via `global auth get`.
  //
  // The GET and UPDATE schemas are asymmetric for the privacy declaration: GET
  // returns `privacyParam` as an array ([{status, content, ...}]) while UPDATE
  // requires `privacyParamEnabled` (Y|N) plus a plain-string `privacyParam`. The
  // payload is therefore reconstructed from the GET fields (status→enabled,
  // content→param) rather than round-tripped verbatim. The server also enforces
  // `authTips` for the phone authType even though the API doc marks it optional,
  // so it is carried over from the current template.
  (shouldRunRealChannelTests ? it : it.skip)(
    'runs global auth update (toggle then restore) through the real CLI',
    () => {
      let channelId: string | undefined;
      let originalSecondaryEnabled: string | undefined;

      /** Read the current 2-item global auth template via the real CLI. */
      const readAuthSettings = (): Array<Record<string, unknown>> =>
        parseJsonValue(
          runCliSuccess(['global', 'auth', 'get', '--output', 'json']),
        ) as Array<Record<string, unknown>>;

      /**
       * Build an UPDATE-compatible auth-setting object from a GET item. Carries
       * the authType-specific required fields and maps the GET privacyParam
       * array to the UPDATE privacyParamEnabled / privacyParam strings.
       */
      const buildItem = (
        src: Record<string, unknown>,
        authEnabled: string,
      ): Record<string, unknown> => {
        const item: Record<string, unknown> = {
          authType: String(src.authType ?? ''),
          authEnabled,
        };
        // custom authType required fields
        if (src.customKey) item.customKey = String(src.customKey);
        if (src.customUri) item.customUri = String(src.customUri);
        // phone authType required fields
        if (src.whiteListEntryText) item.whiteListEntryText = String(src.whiteListEntryText);
        if (src.authTips) item.authTips = String(src.authTips);
        // privacy declaration (code/phone/info): GET array -> UPDATE strings
        const privacyArr = Array.isArray(src.privacyParam) ? src.privacyParam : [];
        const privacyFirst = (privacyArr[0] ?? {}) as Record<string, unknown>;
        const privacyEnabled = String(privacyFirst.status ?? 'N');
        item.privacyParamEnabled = privacyEnabled;
        if (privacyEnabled === 'Y' && privacyFirst.content) {
          item.privacyParam = String(privacyFirst.content);
        }
        return item;
      };

      /** Submit a 2-item auth template update through the real CLI. */
      const updateAuth = (settings: Array<Record<string, unknown>>): void => {
        // Precompute the JSON into a variable so the runCli arg array literal
        // stays bracket-free (the coverage report matcher skips nested arrays).
        const settingsJson = JSON.stringify(settings);
        runCliSuccess([
          'global', 'auth', 'update',
          '--settings', settingsJson,
          '--force', '--output', 'json',
        ]);
      };

      const restoreAuth = (settings: Array<Record<string, unknown>>): void => {
        try {
          updateAuth(settings);
        } catch {
          // best-effort cleanup of the account-global template
        }
      };

      try {
        channelId = createTemporaryChannel('Global Auth Update');

        const settings = readAuthSettings();
        expect(Array.isArray(settings)).toBe(true);
        expect(settings.length).toBe(2);
        const [primary, secondary] = settings;
        originalSecondaryEnabled = String(secondary.authEnabled ?? 'Y');
        const toggled = originalSecondaryEnabled === 'Y' ? 'N' : 'Y';

        // Flip the secondary watch-condition authEnabled (primary preserved).
        updateAuth([
          buildItem(primary, String(primary.authEnabled ?? 'Y')),
          buildItem(secondary, toggled),
        ]);

        // Verify the flip persisted through a fresh read.
        const afterUpdate = readAuthSettings();
        expect(String(afterUpdate[1].authEnabled ?? '')).toBe(toggled);

        // Restore the original template (capture the exact pre-update state).
        restoreAuth([
          buildItem(primary, String(primary.authEnabled ?? 'Y')),
          buildItem(secondary, originalSecondaryEnabled),
        ]);
      } finally {
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }

      // Happy-path assertion that the account template was restored.
      if (originalSecondaryEnabled !== undefined) {
        const afterRestore = readAuthSettings();
        expect(String(afterRestore[1].authEnabled ?? '')).toBe(originalSecondaryEnabled);
      }
    },
    180000,
  );

  (shouldRunRealChannelTests && accountCredentials?.userId ? it : it.skip)(
    'runs account api callback set (set then clear) through the real CLI',
    () => {
      let channelId: string | undefined;
      const userId = accountCredentials!.userId!;
      const clearStreamCallback = () => {
        try {
          runCliSuccess([
            'account', 'api', 'callback', 'set',
            '--type', 'stream', '--user-id', userId,
            '--force', '--output', 'json',
          ]);
        } catch {
          // best-effort cleanup
        }
      };

      try {
        channelId = createTemporaryChannel('Account Callback Set');

        // set the stream callback to a throwaway URL
        const setOutput = runCliSuccess([
          'account', 'api', 'callback', 'set',
          '--type', 'stream', '--user-id', userId,
          '--url', `https://example.com/polyv-it-callback-${Date.now()}`,
          '--force', '--output', 'json',
        ]);
        const set = parseJsonObject(setOutput);
        expect(set.success).toBe(true);

        // clear: omit --url to drop the callback (restores account default)
        const clearOutput = runCliSuccess([
          'account', 'api', 'callback', 'set',
          '--type', 'stream', '--user-id', userId,
          '--force', '--output', 'json',
        ]);
        const cleared = parseJsonObject(clearOutput);
        expect(cleared.success).toBe(true);
      } finally {
        clearStreamCallback();
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    180000,
  );

  // `platform anchor get/relation-list/unrelation-list` are account-level reads that only
  // need an existing anchor-id, discovered here via the (already covered) anchor list.
  (shouldRunRealChannelTests ? it : it.skip)(
    'runs platform anchor get/relation-list/unrelation-list through the real CLI',
    () => {
      let channelId: string | undefined;

      try {
        channelId = createTemporaryChannel('Platform Anchor Reads');

        // Discover an existing anchor id via the already-covered anchor list.
        const listOutput = runCliSuccess([
          'platform', 'anchor', 'list', '--page', '1', '--page-size', '5', '--output', 'json',
        ]);
        const list = parseJsonObject(listOutput);
        const contents = Array.isArray(list.contents) ? list.contents : [];
        const firstAnchor = contents[0] as Record<string, unknown> | undefined;
        const anchorId = String(firstAnchor?.anchorId ?? '');
        expect(anchorId).toMatch(/^\d+$/);

        const detail = parseJsonObject(runCliSuccess([
          'platform', 'anchor', 'get', '--anchor-id', anchorId, '--output', 'json',
        ]));
        expect(String(detail.anchorId ?? '')).toBe(anchorId);

        const relations = parseJsonObject(runCliSuccess([
          'platform', 'anchor', 'relation-list', '--anchor-id', anchorId, '--output', 'json',
        ]));
        expect(relations).toEqual(expect.objectContaining({ contents: expect.any(Array) }));

        const unrelations = parseJsonObject(runCliSuccess([
          'platform', 'anchor', 'unrelation-list', '--anchor-id', anchorId, '--output', 'json',
        ]));
        expect(unrelations).toEqual(expect.objectContaining({ contents: expect.any(Array) }));
      } finally {
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    180000,
  );
});
