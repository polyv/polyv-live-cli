/**
 * @fileoverview Real-CLI integration tests for the `user template` read subcommands.
 *
 * Each target is exercised through the local CLI entry (dist/index.js). These are
 * account-scoped reads that return the default template config for the account; a
 * freshly-created account has well-formed default config, so every read returns
 * structured JSON with predictable keys.
 *
 * Per the integration-test convention, every test creates (and deletes in
 * `finally`) a temporary channel as the real test asset, even though these
 * account-scoped reads do not take a channel-id argument.
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

describe('user template CLI integration (account-scoped reads)', () => {
  (shouldRunRealChannelTests ? it : it.skip)('gets donate template via real CLI', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('User Template Donate Get');

      const payload = parseJsonObject(
        runCliSuccess(['user', 'template', 'donate', 'get', '--output', 'json']),
      );

      // Y/N toggles are always present on a default account template.
      expect(typeof payload.donateCashEnabled).toBe('string');
      expect(typeof payload.donateGiftEnabled).toBe('string');
      expect(typeof payload.cashDonate).toBe('object');
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 120000);

  (shouldRunRealChannelTests ? it : it.skip)('gets marquee (content protection) template via real CLI', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('User Template Marquee Get');

      const payload = parseJsonObject(
        runCliSuccess(['user', 'template', 'marquee', 'get', '--output', 'json']),
      );

      expect(typeof payload.enable).toBe('string');
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 120000);

  (shouldRunRealChannelTests ? it : it.skip)('gets role-config template via real CLI', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('User Template Role Config Get');

      const payload = parseJsonObject(
        runCliSuccess(['user', 'template', 'role-config', 'get', '--output', 'json']),
      );

      // The default role-config template always carries the teacher layout config.
      expect(typeof payload.teacherConfig).toBe('object');
      expect(payload.teacherConfig).not.toBeNull();
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 120000);

  (shouldRunRealChannelTests ? it : it.skip)('gets playback template via real CLI', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('User Template Playback Get');

      const payload = parseJsonObject(
        runCliSuccess(['user', 'template', 'playback', 'get', '--output', 'json']),
      );

      expect(typeof payload.playbackEnabled).toBe('string');
      expect(typeof payload.type).toBe('string');
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 120000);

  (shouldRunRealChannelTests ? it : it.skip)('gets audio-moderation template via real CLI', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('User Template Audio Moderation Get');

      const payload = parseJsonObject(
        runCliSuccess(['user', 'template', 'audio-moderation', 'get', '--output', 'json']),
      );

      // The template read returns the moderation config regardless of whether the
      // account has the paid moderation feature enabled (unlike the finance
      // moderation reads, which gate behind the feature).
      expect(typeof payload.moderationEnabled).toBe('string');
      expect(typeof payload.moderationStrategy).toBe('string');
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 120000);

  (shouldRunRealChannelTests ? it : it.skip)('gets video-moderation template via real CLI', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('User Template Video Moderation Get');

      const payload = parseJsonObject(
        runCliSuccess(['user', 'template', 'video-moderation', 'get', '--output', 'json']),
      );

      expect(typeof payload.moderationEnabled).toBe('string');
      expect(typeof payload.moderationStrategy).toBe('string');
      expect(typeof payload.imageFrequency).toBe('number');
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 120000);

  (shouldRunRealChannelTests ? it : it.skip)('gets setting footer config via real CLI', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('User Setting Footer Get');

      const payload = parseJsonObject(
        runCliSuccess(['user', 'setting', 'footer', 'get', '--output', 'json']),
      );

      // Footer config is account-scoped; the Y/N toggle and footer text always
      // exist on a default account.
      expect(typeof payload.showFooterEnabled).toBe('string');
      expect(typeof payload.footerText).toBe('string');
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 120000);

  (shouldRunRealChannelTests ? it : it.skip)('gets setting pv-show config via real CLI', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('User Setting PvShow Get');

      const payload = parseJsonObject(
        runCliSuccess(['user', 'setting', 'pv-show', 'get', '--output', 'json']),
      );

      expect(typeof payload.enabled).toBe('string');
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 120000);

  // Sanity check that the CLI surface exists even without real credentials.
  it('exposes the targeted user template reads through the real CLI entry', () => {
    const checks: Array<[string[], string]> = [
      [['user', 'template', 'donate', 'get', '--help'], 'donate'],
      [['user', 'template', 'marquee', 'get', '--help'], 'marquee'],
      [['user', 'template', 'role-config', 'get', '--help'], 'role'],
      [['user', 'template', 'playback', 'get', '--help'], 'playback'],
      [['user', 'template', 'audio-moderation', 'get', '--help'], 'audio'],
      [['user', 'template', 'video-moderation', 'get', '--help'], 'video'],
      [['user', 'setting', 'footer', 'get', '--help'], 'footer'],
      [['user', 'setting', 'pv-show', 'get', '--help'], 'pv-show'],
    ];

    for (const [args, marker] of checks) {
      const result = runCli(args, { includeTestEnv: false, rejectOnError: true });
      expect(result.stdout).toContain(marker);
    }
  });
});
