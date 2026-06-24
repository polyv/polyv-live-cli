/**
 * @fileoverview Real-CLI integration tests for the account-scoped `user` write
 * subcommands (`user setting footer update`, `user template donate update`,
 * `user template marquee update`, `user template audio-moderation update`,
 * `user template video-moderation update`, `user org create`,
 * `user org delete`, `user child create`, `user child update`,
 * `user child delete`).
 *
 * Each target is exercised through the local CLI entry (dist/index.js). These
 * are account-scoped template/setting writes, so every test follows a strict
 * read → update → verify → restore cycle to leave the account's global config
 * unchanged. The restore is performed in a `finally` block so the account is
 * always returned to its original state even if an assertion fails mid-test
 * (these writes affect every channel account-wide).
 *
 * `user org create` → `user org delete` is an account-scoped CRUD lifecycle:
 * the parent organization is discovered from the existing org tree, the created
 * org is deleted in the same test (with a `finally` fallback) so no orphan
 * organization is left on the account.
 *
 * `user child create` → `update` → `delete` is an account-scoped sub-account
 * CRUD lifecycle: the role-id is discovered from the existing role list, the
 * sub-account is keyed by a unique login email, renamed via update (verified
 * through a filtered list), and deleted in the same test (with a `finally`
 * fallback) so no orphan sub-account is left on the account.
 *
 * Per the integration-test convention, every test still creates (and deletes in
 * `finally`) a temporary channel as the real test asset, even though these
 * account-scoped writes do not take a channel-id argument.
 */

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

interface FooterConfig {
  showFooterEnabled: string;
  footerText: string;
  footTextLinkProtocol: string;
  footTextLinkUrl: string;
}

function readFooterConfig(): FooterConfig {
  const cfg = parseJsonObject(
    runCliSuccess(['user', 'setting', 'footer', 'get', '--output', 'json']),
  );
  return {
    showFooterEnabled: String(cfg.showFooterEnabled ?? 'Y'),
    footerText: String(cfg.footerText ?? ''),
    footTextLinkProtocol: String(cfg.footTextLinkProtocol ?? ''),
    footTextLinkUrl: String(cfg.footTextLinkUrl ?? ''),
  };
}

function restoreFooterConfig(cfg: FooterConfig): void {
  runCliSuccess([
    'user', 'setting', 'footer', 'update',
    '--show-footer-enabled', cfg.showFooterEnabled,
    '--footer-text', cfg.footerText,
    '--foot-text-link-protocol', cfg.footTextLinkProtocol,
    '--foot-text-link-url', cfg.footTextLinkUrl,
    '--force', '--output', 'json',
  ]);
}

describe('user account-scoped CLI writes (reversible read-update-verify-restore)', () => {
  (shouldRunRealChannelTests ? it : it.skip)('updates and restores the global footer setting via real CLI', () => {
    let channelId: string | undefined;
    let original: FooterConfig | undefined;

    try {
      channelId = createTemporaryChannel('User Setting Footer Update');
      original = readFooterConfig();
      const toggled = original.showFooterEnabled === 'Y' ? 'N' : 'Y';

      const updated = parseJsonObject(
        runCliSuccess([
          'user', 'setting', 'footer', 'update',
          '--show-footer-enabled', toggled,
          '--force', '--output', 'json',
        ]),
      );
      expect(updated.success).toBe(true);
      expect(updated.showFooterEnabled).toBe(toggled);

      // Verify persistence through a fresh read.
      expect(readFooterConfig().showFooterEnabled).toBe(toggled);
    } finally {
      if (original) {
        restoreFooterConfig(original);
      }
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }

    // Happy-path assertion that the account was restored.
    expect(readFooterConfig().showFooterEnabled).toBe(original!.showFooterEnabled);
  }, 120000);

  (shouldRunRealChannelTests ? it : it.skip)('updates and restores the donate template via real CLI', () => {
    let channelId: string | undefined;
    let original: string | undefined;

    try {
      channelId = createTemporaryChannel('User Template Donate Update');

      const before = parseJsonObject(
        runCliSuccess(['user', 'template', 'donate', 'get', '--output', 'json']),
      );
      original = String(before.donateGiftEnabled ?? 'Y');
      const toggled = original === 'Y' ? 'N' : 'Y';

      const updated = parseJsonObject(
        runCliSuccess([
          'user', 'template', 'donate', 'update',
          '--donate-gift-enabled', toggled,
          '--force', '--output', 'json',
        ]),
      );
      expect(updated.success).toBe(true);
      expect(updated.donateGiftEnabled).toBe(toggled);

      const afterUpdate = parseJsonObject(
        runCliSuccess(['user', 'template', 'donate', 'get', '--output', 'json']),
      );
      expect(String(afterUpdate.donateGiftEnabled)).toBe(toggled);
    } finally {
      if (original !== undefined) {
        runCliSuccess([
          'user', 'template', 'donate', 'update',
          '--donate-gift-enabled', original,
          '--force', '--output', 'json',
        ]);
      }
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }

    const afterRestore = parseJsonObject(
      runCliSuccess(['user', 'template', 'donate', 'get', '--output', 'json']),
    );
    expect(String(afterRestore.donateGiftEnabled)).toBe(original);
  }, 120000);

  (shouldRunRealChannelTests ? it : it.skip)('updates and restores the marquee (content protection) template via real CLI', () => {
    let channelId: string | undefined;
    let modified = false;

    try {
      channelId = createTemporaryChannel('User Template Marquee Update');

      // The default marquee template has enable=N. When enable=Y the server
      // requires a full content-protection config (antiRecordType + modelType +
      // content), so we submit a complete config.
      const updated = parseJsonObject(
        runCliSuccess([
          'user', 'template', 'marquee', 'update',
          '--enable', 'Y',
          '--anti-record-type', 'marquee',
          '--model-type', 'fixed',
          '--content', 'it-marquee-content',
          '--opacity', '80',
          '--font-size', '20',
          '--font-color', '#ff4d4f',
          '--show-mode', 'flicker',
          '--double-enabled', 'N',
          '--auto-zoom-enabled', 'Y',
          '--force', '--output', 'json',
        ]),
      );
      expect(updated.success).toBe(true);
      modified = true;

      const afterUpdate = parseJsonObject(
        runCliSuccess(['user', 'template', 'marquee', 'get', '--output', 'json']),
      );
      expect(String(afterUpdate.enable)).toBe('Y');
      expect(String(afterUpdate.antiRecordType)).toBe('marquee');
      expect(String(afterUpdate.modelType)).toBe('fixed');
      expect(String(afterUpdate.content)).toBe('it-marquee-content');
    } finally {
      // Restore to the original disabled state (enable=N drops the rest). Always
      // run when we may have enabled the template.
      if (modified) {
        runCliSuccess([
          'user', 'template', 'marquee', 'update',
          '--enable', 'N',
          '--force', '--output', 'json',
        ]);
      }
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }

    const afterRestore = parseJsonObject(
      runCliSuccess(['user', 'template', 'marquee', 'get', '--output', 'json']),
    );
    expect(String(afterRestore.enable)).toBe('N');
  }, 120000);

  (shouldRunRealChannelTests ? it : it.skip)('updates and restores the audio moderation template via real CLI', () => {
    let channelId: string | undefined;
    let original: { enabled: string; strategy: string; badword: string; illegalNotify: object } | undefined;

    try {
      channelId = createTemporaryChannel('User Template Audio Moderation Update');

      const before = parseJsonObject(
        runCliSuccess(['user', 'template', 'audio-moderation', 'get', '--output', 'json']),
      );
      // Capture the originals so the account-wide template is restored exactly.
      original = {
        enabled: String(before.moderationEnabled ?? 'N'),
        strategy: String(before.moderationStrategy ?? 'easy'),
        badword: String(before.badwordEnabled ?? 'N'),
        illegalNotify: (before.illegalNotify as object) ?? {},
      };
      const toggled = original.badword === 'Y' ? 'N' : 'Y';
      const notify = JSON.stringify(original.illegalNotify);

      const updated = parseJsonObject(
        runCliSuccess([
          'user', 'template', 'audio-moderation', 'update',
          '--moderation-enabled', original.enabled,
          '--moderation-strategy', original.strategy,
          '--badword-enabled', toggled,
          '--illegal-notify', notify,
          '--force', '--output', 'json',
        ]),
      );
      expect(updated.success).toBe(true);
      expect(updated.badwordEnabled).toBe(toggled);

      const afterUpdate = parseJsonObject(
        runCliSuccess(['user', 'template', 'audio-moderation', 'get', '--output', 'json']),
      );
      expect(String(afterUpdate.badwordEnabled)).toBe(toggled);
    } finally {
      if (original) {
        const notify = JSON.stringify(original.illegalNotify);
        runCliSuccess([
          'user', 'template', 'audio-moderation', 'update',
          '--moderation-enabled', original.enabled,
          '--moderation-strategy', original.strategy,
          '--badword-enabled', original.badword,
          '--illegal-notify', notify,
          '--force', '--output', 'json',
        ]);
      }
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }

    const afterRestore = parseJsonObject(
      runCliSuccess(['user', 'template', 'audio-moderation', 'get', '--output', 'json']),
    );
    expect(String(afterRestore.badwordEnabled)).toBe(original!.badword);
  }, 120000);

  (shouldRunRealChannelTests ? it : it.skip)('updates and restores the video moderation template via real CLI', () => {
    let channelId: string | undefined;
    let original: { enabled: string; strategy: string; freq: string; illegalNotify: object } | undefined;

    try {
      channelId = createTemporaryChannel('User Template Video Moderation Update');

      const before = parseJsonObject(
        runCliSuccess(['user', 'template', 'video-moderation', 'get', '--output', 'json']),
      );
      // The server only accepts imageFrequency in {5, 20, 60} (per
      // docs/live/api: 截帧时长取值 5/20/60 秒), so toggle between two valid
      // values regardless of the current one.
      const origFreq = String(before.imageFrequency ?? '60');
      original = {
        enabled: String(before.moderationEnabled ?? 'N'),
        strategy: String(before.moderationStrategy ?? 'finance_easy'),
        freq: origFreq,
        illegalNotify: (before.illegalNotify as object) ?? {},
      };
      const toggled = origFreq === '60' ? '5' : '60';
      const notify = JSON.stringify(original.illegalNotify);

      const updated = parseJsonObject(
        runCliSuccess([
          'user', 'template', 'video-moderation', 'update',
          '--moderation-enabled', original.enabled,
          '--moderation-strategy', original.strategy,
          '--image-frequency', toggled,
          '--illegal-notify', notify,
          '--force', '--output', 'json',
        ]),
      );
      expect(updated.success).toBe(true);
      expect(String(updated.imageFrequency)).toBe(toggled);

      const afterUpdate = parseJsonObject(
        runCliSuccess(['user', 'template', 'video-moderation', 'get', '--output', 'json']),
      );
      expect(String(afterUpdate.imageFrequency)).toBe(toggled);
    } finally {
      if (original) {
        const notify = JSON.stringify(original.illegalNotify);
        runCliSuccess([
          'user', 'template', 'video-moderation', 'update',
          '--moderation-enabled', original.enabled,
          '--moderation-strategy', original.strategy,
          '--image-frequency', original.freq,
          '--illegal-notify', notify,
          '--force', '--output', 'json',
        ]);
      }
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }

    const afterRestore = parseJsonObject(
      runCliSuccess(['user', 'template', 'video-moderation', 'get', '--output', 'json']),
    );
    expect(String(afterRestore.imageFrequency)).toBe(original!.freq);
  }, 120000);

  // `user org create` → `user org delete` is an account-scoped CRUD lifecycle.
  // The parent organization is discovered from the existing org tree (the root
  // org has parentId 0), the created org id is captured from the create result,
  // and the new org is deleted in the same test (with a `finally` fallback) so
  // no orphan organization is left on the account.
  (shouldRunRealChannelTests ? it : it.skip)('runs the user organization create→delete lifecycle via real CLI', () => {
    let channelId: string | undefined;
    let createdOrgId: number | undefined;

    try {
      channelId = createTemporaryChannel('User Org Create Delete');

      const orgs = parseJsonValue(
        runCliSuccess(['user', 'org', 'list', '--output', 'json']),
      ) as Array<{ id: number; parentId: number; name: string }>;
      expect(Array.isArray(orgs)).toBe(true);
      expect(orgs.length).toBeGreaterThan(0);
      const root = orgs.find((o) => o.parentId === 0) ?? orgs[0];
      const parentId = root.id;

      const uniqueName = `it-org-${Date.now()}`;
      const created = parseJsonObject(
        runCliSuccess([
          'user', 'org', 'create',
          '--name', uniqueName,
          '--parent-id', String(parentId),
          '--description', 'cli integration test org',
          '--force', '--output', 'json',
        ]),
      );
      expect(created.success).toBe(true);
      const createdResult = created.result as { id: number; name: string };
      expect(createdResult.name).toBe(uniqueName);
      createdOrgId = createdResult.id;

      const deleted = parseJsonObject(
        runCliSuccess([
          'user', 'org', 'delete',
          '--organization-id', String(createdOrgId),
          '--force', '--output', 'json',
        ]),
      );
      expect(deleted.success).toBe(true);
      expect(deleted.organizationId).toBe(createdOrgId);
      createdOrgId = undefined;

      // Verify the new org is actually gone from the account org tree.
      const afterDelete = parseJsonValue(
        runCliSuccess(['user', 'org', 'list', '--output', 'json']),
      ) as Array<{ id: number }>;
      expect(afterDelete.find((o) => o.id === createdResult.id)).toBeUndefined();
    } finally {
      if (createdOrgId !== undefined) {
        try {
          runCliSuccess([
            'user', 'org', 'delete',
            '--organization-id', String(createdOrgId),
            '--force', '--output', 'json',
          ]);
        } catch {
          // best-effort cleanup of an orphan organization
        }
      }
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 120000);

  // `user child create` → `update` → `delete` is an account-scoped CRUD
  // lifecycle. The role-id is discovered from the existing role list (so the
  // test does not assume a fixed role id), the child account is keyed by a
  // unique login email, renamed via update (verified through a filtered list),
  // and deleted in the same test (with a `finally` fallback) so no orphan
  // sub-account is left on the account. The delete endpoint signs childEmail
  // as a query parameter (not a request body), exercised for real here.
  (shouldRunRealChannelTests ? it : it.skip)('runs the user child create→update→delete lifecycle via real CLI', () => {
    let channelId: string | undefined;
    let childEmail: string | undefined;

    try {
      channelId = createTemporaryChannel('User Child Create Update Delete');

      // Discover a real role-id from the account's role list (the list always
      // contains at least the built-in roles). Prefer a non-full-admin role so
      // the transient sub-account never holds platform-wide privileges.
      const roles = parseJsonValue(
        runCliSuccess(['user', 'child', 'roles', '--output', 'json']),
      ) as Array<{ id: number; name: string }>;
      expect(Array.isArray(roles)).toBe(true);
      expect(roles.length).toBeGreaterThan(0);
      const role = roles.find((r) => r.id !== 1) ?? roles[0];
      const roleId = role.id;

      childEmail = `it-child-${Date.now()}@itest.com`;
      const created = parseJsonObject(
        runCliSuccess([
          'user', 'child', 'create',
          '--child-email', childEmail,
          '--child-name', 'ItChildOriginal',
          '--password', 'ItChild1234Pass',
          '--role-id', String(roleId),
          '--description', 'cli integration test child account',
          '--force', '--output', 'json',
        ]),
      );
      expect(created.success).toBe(true);
      const createdResult = created.result as { childUserId: string; childEmail: string; childName: string; roleId: number };
      expect(createdResult.childEmail).toBe(childEmail);
      expect(createdResult.childName).toBe('ItChildOriginal');
      expect(createdResult.childUserId).toBeTruthy();

      // Rename the sub-account and verify the new name persists through a fresh
      // filtered list read.
      const updated = parseJsonObject(
        runCliSuccess([
          'user', 'child', 'update',
          '--child-email', childEmail,
          '--child-name', 'ItChildRenamed',
          '--force', '--output', 'json',
        ]),
      );
      expect(updated.success).toBe(true);
      expect(updated.childName).toBe('ItChildRenamed');

      const listed = parseJsonObject(
        runCliSuccess(['user', 'child', 'list', '--child-email', childEmail, '--output', 'json']),
      );
      expect(listed.totalItems).toBeGreaterThanOrEqual(1);
      const listedChild = (listed.contents as Array<{ childEmail: string; childName: string }>)[0];
      expect(listedChild.childEmail).toBe(childEmail);
      expect(listedChild.childName).toBe('ItChildRenamed');

      const deleted = parseJsonObject(
        runCliSuccess([
          'user', 'child', 'delete',
          '--child-email', childEmail,
          '--force', '--output', 'json',
        ]),
      );
      expect(deleted.success).toBe(true);
      expect(deleted.childEmail).toBe(childEmail);
      childEmail = undefined;

      // Verify the sub-account is actually gone from the account.
      const afterDelete = parseJsonObject(
        runCliSuccess(['user', 'child', 'list', '--child-email', listedChild.childEmail, '--output', 'json']),
      );
      expect(afterDelete.totalItems).toBe(0);
    } finally {
      if (childEmail !== undefined) {
        try {
          runCliSuccess([
            'user', 'child', 'delete',
            '--child-email', childEmail,
            '--force', '--output', 'json',
          ]);
        } catch {
          // best-effort cleanup of an orphan sub-account
        }
      }
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 120000);

  // Sanity check that the CLI surface exists even without real credentials.
  it('exposes the targeted user writes through the real CLI entry', () => {
    const checks: Array<[string[], string]> = [
      [['user', 'setting', 'footer', 'update', '--help'], 'footer'],
      [['user', 'template', 'donate', 'update', '--help'], 'donate'],
      [['user', 'template', 'marquee', 'update', '--help'], 'marquee'],
      [['user', 'template', 'audio-moderation', 'update', '--help'], 'audio-moderation'],
      [['user', 'template', 'video-moderation', 'update', '--help'], 'video-moderation'],
      [['user', 'org', 'create', '--help'], 'organization'],
      [['user', 'org', 'delete', '--help'], 'organization'],
      [['user', 'child', 'create', '--help'], 'child'],
      [['user', 'child', 'update', '--help'], 'child'],
      [['user', 'child', 'delete', '--help'], 'child'],
    ];

    for (const [args, marker] of checks) {
      const result = runCli(args, { includeTestEnv: false, rejectOnError: true });
      expect(result.stdout).toContain(marker);
    }
  });
});
