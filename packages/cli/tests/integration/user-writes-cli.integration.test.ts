/**
 * @fileoverview Real-CLI integration tests for the account-scoped `user` write
 * subcommands (`user setting footer update`, `user template donate update`,
 * `user template marquee update`, `user template audio-moderation update`,
 * `user template video-moderation update`).
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

  // Sanity check that the CLI surface exists even without real credentials.
  it('exposes the targeted user writes through the real CLI entry', () => {
    const checks: Array<[string[], string]> = [
      [['user', 'setting', 'footer', 'update', '--help'], 'footer'],
      [['user', 'template', 'donate', 'update', '--help'], 'donate'],
      [['user', 'template', 'marquee', 'update', '--help'], 'marquee'],
      [['user', 'template', 'audio-moderation', 'update', '--help'], 'audio-moderation'],
      [['user', 'template', 'video-moderation', 'update', '--help'], 'video-moderation'],
    ];

    for (const [args, marker] of checks) {
      const result = runCli(args, { includeTestEnv: false, rejectOnError: true });
      expect(result.stdout).toContain(marker);
    }
  });
});
