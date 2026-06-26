import { runCli, sleep } from '../helpers/cli-runner';
import {
  createTemporaryChannel,
  deleteTemporaryChannel,
  parseJsonObject,
  parseJsonValue,
  runCliSuccess,
} from '../helpers/channel-fixture';
import { getAccountCredentials, hasRealCredentials } from '../helpers/integration-config';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const shouldRunRealChannelTests = hasRealCredentials();

// 1x1 transparent PNG used as a real upload fixture for image-upload endpoints.
const FIXTURE_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

/**
 * Create a temporary directory containing a small PNG fixture and return its
 * path. The caller is responsible for removing the returned directory.
 */
function createTemporaryImageFile(): string {
  const dir = mkdtempSync(join(tmpdir(), 'polyv-web-upload-'));
  const filePath = join(dir, 'logo.png');
  writeFileSync(filePath, Buffer.from(FIXTURE_PNG_BASE64, 'base64'));
  return filePath;
}

// A minimal .xls (BIFF/OLE2 — NOT .xlsx) watch-condition whitelist fixture,
// committed at tests/fixtures/whitelist-template.xls. The upload-white-list
// server parser (POI HSSF) reads sheet "白名单", skips the first two rows
// (title + header) and imports column 0 as 会员码, column 1 as 昵称 from row
// index 2 onward. .xlsx uploads are rejected with "whitelist excel no data", so
// the fixture must be the legacy .xls binary format. Generated once offline.
const FIXTURE_WHITELIST_XLS_PATH = join(__dirname, '..', 'fixtures', 'whitelist-template.xls');

/**
 * Copy the committed whitelist .xls fixture into a temp file and return that
 * path. The caller is responsible for removing the returned file.
 */
function createTemporaryWhitelistFile(): string {
  const dir = mkdtempSync(join(tmpdir(), 'polyv-web-wl-'));
  const filePath = join(dir, 'whitelist.xls');
  writeFileSync(filePath, readFileSync(FIXTURE_WHITELIST_XLS_PATH));
  return filePath;
}

describe('web CLI integration', () => {
  it('shows web command group help', () => {
    const result = runCli(['web', '--help'], { includeTestEnv: false });

    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('info');
    expect(result.output).toContain('menu');
    expect(result.output).toContain('auth');
  });

  it('shows force options for web configuration changes', () => {
    const commands = [
      ['web', 'info', 'splash-set', '--help'],
      ['web', 'menu', 'add', '--help'],
      ['web', 'donate', 'cash-update', '--help'],
      ['web', 'share', 'update', '--help'],
      ['web', 'setting', 'global-enabled-update', '--help'],
      ['web', 'auth', 'external-set', '--help'],
      ['web', 'auth', 'authorized-address-set', '--help'],
      ['web', 'auth', 'whitelist', 'upload', '--help'],
    ];

    for (const args of commands) {
      const result = runCli(args, { includeTestEnv: false });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('--force');
      expect(result.output).toContain('--output');
    }
  });

  it('shows json-capable read command help', () => {
    const commands = [
      ['web', 'info', 'splash-get', '--help'],
      ['web', 'menu', 'list', '--help'],
      ['web', 'donate', 'get', '--help'],
      ['web', 'auth', 'record-info-list', '--help'],
      ['web', 'auth', 'whitelist', 'download', '--help'],
    ];

    for (const args of commands) {
      const result = runCli(args, { includeTestEnv: false });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('--output');
    }
  });

  (shouldRunRealChannelTests ? it : it.skip)('runs web read commands against a temporary real channel', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Web Read Smoke');
      const id = channelId;

      const readCommands = [
        ['web', 'info', 'splash-get', '--channel-id', id, '--output', 'json'],
        ['web', 'info', 'likes-get', '--channel-ids', id, '--output', 'json'],
        ['web', 'info', 'countdown-get', '--channel-id', id, '--output', 'json'],
        ['web', 'menu', 'list', '--channel-id', id, '--output', 'json'],
        ['web', 'menu', 'tuwen-list', '--channel-id', id, '--output', 'json'],
        ['web', 'donate', 'get', '--channel-id', id, '--output', 'json'],
        ['web', 'share', 'get', '--channel-id', id, '--output', 'json'],
        ['web', 'auth', 'record-info-list', '--channel-id', id, '--output', 'json'],
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

  (shouldRunRealChannelTests ? it : it.skip)('runs web auth enroll-list and whitelist download against a temporary real channel', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Web Auth Reads');

      // enroll-list returns the enrollment audit toggle and a (possibly empty)
      // viewer list as structured JSON, even for a brand-new channel.
      const enrollPayload = parseJsonObject(
        runCliSuccess(['web', 'auth', 'enroll-list', '--channel-id', channelId, '--output', 'json']),
      );
      expect(typeof enrollPayload.auditEnabled).toBe('string');
      expect(Array.isArray(enrollPayload.list)).toBe(true);

      // whitelist download streams the whitelist template; with no --output-file
      // it writes nothing to disk and reports the byte count as JSON.
      const whitelistPayload = parseJsonObject(
        runCliSuccess(['web', 'auth', 'whitelist', 'download', '--rank', '1', '--channel-id', channelId, '--output', 'json']),
      );
      expect(whitelistPayload.success).toBe(true);
      expect(typeof whitelistPayload.bytes).toBe('number');
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 180000);

  // Exercises the self-contained web info write subcommands against a throwaway
  // channel. Each write takes only the channel id (plus trivial values such as a
  // splash toggle, a new name, or like/viewer counts) and reports { success: true };
  // the channel is deleted in `finally`, so the writes have no lasting side effect.
  (shouldRunRealChannelTests ? it : it.skip)('runs web info writes against a temporary real channel', () => {
    const credentials = getAccountCredentials();
    const userId = credentials?.userId;
    if (!userId) {
      throw new Error('POLYV_USER_ID is required for web info publisher-set');
    }

    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Web Info Writes');
      const id = channelId;

      const splashPayload = parseJsonObject(
        runCliSuccess(['web', 'info', 'splash-set', '--channel-id', id, '--splash-enabled', 'Y', '--force', '--output', 'json']),
      );
      expect(splashPayload.success).toBe(true);

      const namePayload = parseJsonObject(
        runCliSuccess(['web', 'info', 'channel-name-update', '--channel-id', id, '--name', `Web Info Renamed ${id}`, '--force', '--output', 'json']),
      );
      expect(namePayload.success).toBe(true);
      expect(String(namePayload.channelId)).toBe(id);

      const likesPayload = parseJsonObject(
        runCliSuccess(['web', 'info', 'likes-update', '--channel-id', id, '--likes', '42', '--viewers', '7', '--force', '--output', 'json']),
      );
      expect(likesPayload.success).toBe(true);

      const countdownPayload = parseJsonObject(
        runCliSuccess(['web', 'info', 'countdown-set', '--channel-id', id, '--booking-enabled', 'Y', '--start-time', '2026-07-01 10:00:00', '--force', '--output', 'json']),
      );
      expect(countdownPayload.success).toBe(true);

      const publisherPayload = parseJsonObject(
        runCliSuccess(['web', 'info', 'publisher-set', '--channel-id', id, '--user-id', userId, '--publisher', 'Web Info Host', '--force', '--output', 'json']),
      );
      expect(publisherPayload.success).toBe(true);
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 240000);

  // Exercises the web menu CRUD lifecycle (add -> update -> delete) against a
  // throwaway channel. add returns the created menu (including menuId), update
  // changes its content, list confirms the new content persisted, and delete
  // removes it; the channel is deleted in `finally`, so no lasting side effect.
  (shouldRunRealChannelTests ? it : it.skip)('runs web menu add/update/delete lifecycle against a temporary real channel', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Web Menu Writes');
      const id = channelId;

      const added = parseJsonObject(
        runCliSuccess(['web', 'menu', 'add', '--channel-id', id, '--name', 'probe-menu', '--type', 'text', '--content', 'hello', '--force', '--output', 'json']),
      );
      expect(typeof added.menuId).toBe('string');
      expect(added.menuId).not.toBe('');
      expect(added.menuType).toBe('text');
      expect(added.name).toBe('probe-menu');
      const menuId = String(added.menuId);

      const updated = parseJsonObject(
        runCliSuccess(['web', 'menu', 'update', '--menu-id', menuId, '--channel-id', id, '--content', 'updated content', '--force', '--output', 'json']),
      );
      expect(updated.success).toBe(true);

      // list reflects the updated content for the created menu.
      const menus = parseJsonValue(
        runCliSuccess(['web', 'menu', 'list', '--channel-id', id, '--output', 'json']),
      );
      const found = (menus as Array<{ menuId: string; content: string | null }>).find((item) => item.menuId === menuId);
      expect(found).toBeDefined();
      expect(found?.content).toBe('updated content');

      const deleted = parseJsonObject(
        runCliSuccess(['web', 'menu', 'delete', '--menu-ids', menuId, '--force', '--output', 'json']),
      );
      expect(deleted.success).toBe(true);
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 240000);

  // Exercises two self-contained channel-scoped writes against a throwaway
  // channel: web share update (sets WeChat share title/desc, verified via share
  // get) and web auth auth-url-update (sets then clears the playback restrict
  // auth URL). Both report { success: true }; the channel is deleted in
  // `finally`, so the writes have no lasting side effect.
  (shouldRunRealChannelTests ? it : it.skip)('runs web share update and auth auth-url-update against a temporary real channel', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Web Share Auth Writes');
      const id = channelId;

      const sharePayload = parseJsonObject(
        runCliSuccess(['web', 'share', 'update', '--channel-id', id, '--weixin-share-title', 'Share Title', '--weixin-share-desc', 'Share Desc', '--force', '--output', 'json']),
      );
      expect(sharePayload.success).toBe(true);

      const shareGet = parseJsonObject(
        runCliSuccess(['web', 'share', 'get', '--channel-id', id, '--output', 'json']),
      );
      // share get returns the channel share settings object; structure sanity check only.
      expect(typeof shareGet).toBe('object');
      expect(shareGet).not.toBeNull();

      const authUrlSet = parseJsonObject(
        runCliSuccess(['web', 'auth', 'auth-url-update', '--channel-id', id, '--url', 'https://example.com/auth', '--force', '--output', 'json']),
      );
      expect(authUrlSet.success).toBe(true);

      // Omitting --url clears the auth URL (reversible), returning the same shape.
      const authUrlClear = parseJsonObject(
        runCliSuccess(['web', 'auth', 'auth-url-update', '--channel-id', id, '--force', '--output', 'json']),
      );
      expect(authUrlClear.success).toBe(true);
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 240000);

  // Exercises three self-contained channel-scoped writes against a throwaway
  // channel: web menu consulting-update (toggle consulting menu on), web menu
  // intro-set (set the live introduction/desc menu content, needs the account
  // userId), and web auth type-set (set watch auth type to none). Each reports
  // { success: true }; the channel is deleted in `finally`, so no lasting side
  // effect.
  (shouldRunRealChannelTests ? it : it.skip)('runs web menu consulting-update, intro-set, and auth type-set against a temporary real channel', () => {
    const credentials = getAccountCredentials();
    const userId = credentials?.userId;
    if (!userId) {
      throw new Error('POLYV_USER_ID is required for web menu intro-set');
    }

    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Web Menu Auth Writes');
      const id = channelId;

      const consultingPayload = parseJsonObject(
        runCliSuccess(['web', 'menu', 'consulting-update', '--channel-id', id, '--enabled', 'Y', '--force', '--output', 'json']),
      );
      expect(consultingPayload.success).toBe(true);

      const introPayload = parseJsonObject(
        runCliSuccess(['web', 'menu', 'intro-set', '--user-id', userId, '--channel-id', id, '--content', '<p>intro content</p>', '--force', '--output', 'json']),
      );
      expect(introPayload.success).toBe(true);
      expect(typeof introPayload.result).toBe('string');

      const authTypePayload = parseJsonObject(
        runCliSuccess(['web', 'auth', 'type-set', '--channel-id', id, '--auth-type', 'none', '--force', '--output', 'json']),
      );
      expect(authTypePayload.success).toBe(true);
      expect(typeof authTypePayload.result).toBe('string');
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 240000);

  // Exercises two channel-scoped authorization writes against a throwaway
  // channel: web auth external-set (registers an external authorization URL)
  // and web auth authorized-address-set (registers a custom authorized
  // address). Because --channel-id is supplied, each applies only to the
  // throwaway channel — the server echoes the channelId back — and the channel
  // is deleted in `finally`, so the writes have no lasting side effect. Both
  // endpoints return a top-level JSON array of { channelId, secretKey };
  // secretKey is a sensitive auth secret, so we assert only its shape (non-empty
  // string) and never log its value.
  (shouldRunRealChannelTests ? it : it.skip)('runs web auth external-set and authorized-address-set against a temporary real channel', () => {
    const credentials = getAccountCredentials();
    const userId = credentials?.userId;
    if (!userId) {
      throw new Error('POLYV_USER_ID is required for web auth external-set');
    }

    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Web Auth External Writes');
      const id = channelId;

      const external = parseJsonValue(
        runCliSuccess(['web', 'auth', 'external-set', '--user-id', userId, '--channel-id', id, '--external-uri', 'https://example.com/auth-callback', '--force', '--output', 'json']),
      ) as Array<{ channelId: unknown; secretKey: unknown }>;
      expect(Array.isArray(external)).toBe(true);
      expect(external.length).toBeGreaterThan(0);
      expect(String(external[0].channelId)).toBe(id);
      expect(typeof external[0].secretKey).toBe('string');
      expect((external[0].secretKey as string).length).toBeGreaterThan(0);

      const custom = parseJsonValue(
        runCliSuccess(['web', 'auth', 'authorized-address-set', '--user-id', userId, '--channel-id', id, '--custom-uri', 'https://example.com/custom-auth', '--force', '--output', 'json']),
      ) as Array<{ channelId: unknown; secretKey: unknown }>;
      expect(Array.isArray(custom)).toBe(true);
      expect(custom.length).toBeGreaterThan(0);
      expect(String(custom[0].channelId)).toBe(id);
      expect(typeof custom[0].secretKey).toBe('string');
      expect((custom[0].secretKey as string).length).toBeGreaterThan(0);
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 240000);

  // Exercises web menu rank-update against a throwaway channel. The reorder
  // endpoint requires the complete, comma-separated list of the channel's menu
  // IDs, so we add a menu, list all menus, reverse their order, and submit the
  // full reversed list. It reports { success: true }; the channel (and its
  // menus) are deleted in `finally`, so no lasting side effect.
  (shouldRunRealChannelTests ? it : it.skip)('runs web menu rank-update against a temporary real channel', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Web Menu Rank');
      const id = channelId;

      runCliSuccess(['web', 'menu', 'add', '--channel-id', id, '--name', 'rank-probe', '--type', 'text', '--content', 'rank content', '--force', '--output', 'json']);

      const menus = parseJsonValue(
        runCliSuccess(['web', 'menu', 'list', '--channel-id', id, '--output', 'json']),
      ) as Array<{ menuId: string }>;
      expect(Array.isArray(menus)).toBe(true);
      expect(menus.length).toBeGreaterThan(0);
      const menuIds = menus.map((menu) => menu.menuId);
      expect(menuIds.every((menuId) => typeof menuId === 'string' && menuId !== '')).toBe(true);

      const reversedIds = menuIds.slice().reverse().join(',');
      const rankPayload = parseJsonObject(
        runCliSuccess(['web', 'menu', 'rank-update', '--channel-id', id, '--menu-ids', reversedIds, '--force', '--output', 'json']),
      );
      expect(rankPayload.success).toBe(true);
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 240000);

  // Exercises two registration-watch read subcommands that previously failed
  // under real execution: web auth record-field-get and record-info-download.
  // Both GET endpoints require a `rank` (1|2) query param that the SDK was not
  // sending ("param should not be empty: rank" / HTTP 400) — fixed by adding
  // --rank to the CLI command and rank to the SDK call. Both run against a
  // throwaway channel deleted in `finally`.
  (shouldRunRealChannelTests ? it : it.skip)('runs web auth record-field-get and record-info-download against a temporary real channel', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Web Record Reads');
      const id = channelId;

      // record-field-get returns the registration watch info-fields for the
      // given condition rank as a bare JSON array (empty for a fresh channel).
      const fields = parseJsonValue(
        runCliSuccess(['web', 'auth', 'record-field-get', '--channel-id', id, '--rank', '1', '--output', 'json']),
      );
      expect(Array.isArray(fields)).toBe(true);

      // record-info-download streams the registration records export; with no
      // --output-file it writes nothing to disk and reports the byte count.
      const downloadPayload = parseJsonObject(
        runCliSuccess(['web', 'auth', 'record-info-download', '--channel-id', id, '--rank', '1', '--output', 'json']),
      );
      expect(downloadPayload.success).toBe(true);
      expect(typeof downloadPayload.bytes).toBe('number');
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 240000);

  // Exercises the image asset upload endpoint. The SDK previously sent `type` in
  // the unsigned multipart body (→ "invalid signature") and used the wrong file
  // field name; both are fixed, and uploads must carry a filename or PolyV
  // rejects the part with a generic "undefined error". Account-scoped: no
  // channel needed, it only returns the uploaded image URL(s).
  (shouldRunRealChannelTests ? it : it.skip)(
    'runs web setting image-upload and returns uploaded image URLs',
    () => {
      const logoPath = createTemporaryImageFile();

      try {
        const urls = parseJsonValue(
          runCliSuccess([
            'web',
            'setting',
            'image-upload',
            '--type',
            'logoImage',
            '--files',
            logoPath,
            '--force',
            '--output',
            'json',
          ]),
        );

        // The endpoint returns an array of uploaded image URLs.
        expect(Array.isArray(urls)).toBe(true);
        expect(urls.length).toBeGreaterThan(0);
        expect(typeof urls[0]).toBe('string');
        expect(urls[0]).toMatch(/\/\//);
      } finally {
        rmSync(join(logoPath, '..'), { recursive: true, force: true });
      }
    },
    120000,
  );

  // Exercises the channel cover-logo upload endpoint against a throwaway
  // channel. The SDK previously passed the image Blob as a query param (body
  // was null) so nothing was uploaded; it now builds a signed multipart body
  // with the file (carrying a filename). Channel-scoped; the channel is
  // deleted in `finally`.
  (shouldRunRealChannelTests ? it : it.skip)(
    'runs web info channel-logo-update against a temporary real channel',
    () => {
      let channelId: string | undefined;
      const logoPath = createTemporaryImageFile();

      try {
        channelId = createTemporaryChannel('Web Logo Upload');
        const id = channelId;

        const payload = parseJsonObject(
          runCliSuccess([
            'web',
            'info',
            'channel-logo-update',
            '--channel-id',
            id,
            '--imgfile',
            logoPath,
            '--force',
            '--output',
            'json',
          ]),
        );

        expect(payload.success).toBe(true);
        expect(typeof payload.result).toBe('string');
        expect(payload.result).toMatch(/\/\//);
      } finally {
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
        rmSync(join(logoPath, '..'), { recursive: true, force: true });
      }
    },
    240000,
  );

  // Exercises the channel watch-condition whitelist batch import. The SDK
  // previously posted an unsigned multipart body (server returned "invalid
  // signature"); it now signs (channelId, rank, timestamp, appId) and posts the
  // file as a binary stream with X-Skip-Auth. The server parser only accepts the
  // legacy .xls (HSSF) format and skips the first two rows, so the fixture is a
  // committed .xls with data starting at row index 2. Channel-scoped: the imported
  // whitelist entries are removed with the channel in `finally`.
  (shouldRunRealChannelTests ? it : it.skip)(
    'runs web auth whitelist upload against a temporary real channel',
    () => {
      let channelId: string | undefined;
      const whitelistPath = createTemporaryWhitelistFile();

      try {
        channelId = createTemporaryChannel('Web Whitelist Upload');
        const id = channelId;

        const payload = parseJsonObject(
          runCliSuccess([
            'web',
            'auth',
            'whitelist',
            'upload',
            '--rank',
            '1',
            '--channel-id',
            id,
            '--file',
            whitelistPath,
            '--force',
            '--output',
            'json',
          ]),
        );

        expect(payload.success).toBe(true);
        expect(payload.result).toBe(true);
      } finally {
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
        rmSync(join(whitelistPath, '..'), { recursive: true, force: true });
      }
    },
    180000,
  );

  // Exercises the channel gift-donate (good) update endpoint. The SDK
  // previously put channelId inside the unsigned JSON body; per update_good.md
  // channelId is a *signed URL query* parameter, so the server did not see it
  // and silently applied the update to the account-wide "通用" settings instead
  // of the channel. The fix routes channelId through config.params (signed),
  // leaving only {goods, enabled} in the body. This test verifies the update
  // now persists on the channel: read → update with a real uploaded image →
  // poll donate get (read-replica aware) → assert the good landed on the
  // channel. The good is channel-scoped and is removed with the channel in
  // `finally`; a real image URL is obtained via the account-level image-upload.
  (shouldRunRealChannelTests ? it : it.skip)(
    'runs web donate good-update against a temporary real channel',
    () => {
      let channelId: string | undefined;
      const logoPath = createTemporaryImageFile();

      try {
        channelId = createTemporaryChannel('Web Donate Good Update');
        const id = channelId;

        // A fresh channel starts with gift-donate disabled and no goods.
        const readChannelGoods = () => {
          const donate = parseJsonValue(
            runCliSuccess(['web', 'donate', 'get', '--channel-id', id, '--output', 'json']),
          ) as { donateGoodEnabled?: string; goods?: Array<{ goodName?: string }> };
          return donate;
        };

        const before = readChannelGoods();
        expect(before.goods ?? []).toEqual([]);

        // Obtain a real, fetchable PolyV CDN image URL (fake URLs are rejected
        // by the server with "upload goods image failure").
        const imgUrl = String(
          (parseJsonValue(
            runCliSuccess([
              'web',
              'setting',
              'image-upload',
              '--type',
              'logoImage',
              '--files',
              logoPath,
              '--force',
              '--output',
              'json',
            ]),
          ) as string[])[0],
        );
        expect(imgUrl).toMatch(/\/\//);

        const goods = JSON.stringify([
          { goodName: '玫瑰', goodImg: imgUrl, goodPrice: 10, goodEnabled: 'Y' },
        ]);

        const payload = parseJsonObject(
          runCliSuccess([
            'web',
            'donate',
            'good-update',
            '--channel-id',
            id,
            '--goods',
            goods,
            '--enabled',
            'Y',
            '--force',
            '--output',
            'json',
          ]),
        );
        expect(payload.success).toBe(true);
        expect(payload.result).toBe(true);

        // PolyV has an eventually-consistent read replica: poll until the
        // newly-configured good is readable on the channel.
        let persisted = false;
        for (let attempt = 0; attempt < 8; attempt += 1) {
          const after = readChannelGoods();
          const names = (after.goods ?? []).map((g) => g.goodName);
          if (after.donateGoodEnabled === 'Y' && names.includes('玫瑰')) {
            persisted = true;
            break;
          }
          sleep(1500);
        }
        expect(persisted).toBe(true);
      } finally {
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
        rmSync(join(logoPath, '..'), { recursive: true, force: true });
      }
    },
    240000,
  );

  // Exercises the channel cash-donate update endpoint through the real CLI.
  // Unlike gift-donate (good-update) above, the cash-donate update is a server
  // no-op on this account: the endpoint accepts the request and returns
  // {success:true, result:true}, but a `donate get` read-back still shows the
  // account default cash ladder (the submitted amounts never persist to the
  // channel). The no-op makes the write *safe* — nothing to clean up beyond
  // the throwaway channel — while still being a real API execution worth
  // covering. We assert the structured {success,result} payload and confirm
  // via a donate get that the channel cash ladder is unchanged.
  (shouldRunRealChannelTests ? it : it.skip)(
    'runs web donate cash-update against a temporary real channel (server no-op)',
    () => {
      let channelId: string | undefined;

      try {
        channelId = createTemporaryChannel('Web Donate Cash Update');
        const id = channelId;

        const readCashes = () => {
          const donate = parseJsonValue(
            runCliSuccess(['web', 'donate', 'get', '--channel-id', id, '--output', 'json']),
          ) as { cashes?: number[] };
          return donate.cashes ?? [];
        };

        const before = readCashes();
        expect(before.length).toBe(6);

        const payload = parseJsonObject(
          runCliSuccess([
            'web',
            'donate',
            'cash-update',
            '--channel-id',
            id,
            '--cashes',
            '1,5,10,50,100,200',
            '--cash-min',
            '1',
            '--enabled',
            'Y',
            '--force',
            '--output',
            'json',
          ]),
        );
        expect(payload.success).toBe(true);
        expect(payload.result).toBe(true);

        // The submitted cash ladder does not persist (server no-op); the
        // channel still reports its default ladder, proving no harmful state
        // change leaked to the channel or the account-wide defaults.
        const after = readCashes();
        expect(after).toEqual(before);
        expect(after).not.toContain(1);
      } finally {
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    180000,
  );
});
