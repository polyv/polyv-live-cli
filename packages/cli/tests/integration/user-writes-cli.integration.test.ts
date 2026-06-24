/**
 * @fileoverview Real-CLI integration tests for the account-scoped `user` write
 * subcommands (`user setting footer update`, `user template donate update`,
 * `user template marquee update`).
 *
 * Each target is exercised through the local CLI entry (dist/index.js). These
 * are account-scoped template/setting writes, so every test follows a strict
 * read → update → verify → restore cycle to leave the account's global config
 * unchanged. The restore is performed in a `finally` block so the account is
 * always returned to its original state even if an assertion fails mid-test
 * (these writes affect every channel account-wide).
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

  // Sanity check that the CLI surface exists even without real credentials.
  it('exposes the targeted user writes through the real CLI entry', () => {
    const checks: Array<[string[], string]> = [
      [['user', 'setting', 'footer', 'update', '--help'], 'footer'],
      [['user', 'template', 'donate', 'update', '--help'], 'donate'],
      [['user', 'template', 'marquee', 'update', '--help'], 'marquee'],
    ];

    for (const [args, marker] of checks) {
      const result = runCli(args, { includeTestEnv: false, rejectOnError: true });
      expect(result.stdout).toContain(marker);
    }
  });
});
