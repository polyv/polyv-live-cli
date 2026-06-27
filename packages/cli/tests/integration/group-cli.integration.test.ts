/**
 * @fileoverview Real-CLI integration tests for the `group` family of account
 * subcommands that are gated behind a group-account prerequisite.
 *
 * The test account (h2wazzobbq) is a regular PolyV account, not a group/集团
 * account. Every `group/*` write therefore hits the real PolyV group backend
 * and is rejected with a deterministic business error before any state is
 * created:
 *
 *   - `group user create` / `group user isolation-create` /
 *     `group user package-update` / `group user package-validity-update` /
 *     `group user secret-reset` → `找不到集团账号` (the caller is not a group
 *     account, so no sub-account is ever created, allocated, or modified).
 *   - `group resource set-flow` → `account not found.` (the VOD flow endpoint
 *     validates the sub-account email first; a non-existent email is rejected
 *     before any allocation).
 *
 * These are genuine real-API executions through the local CLI entry — they
 * prove each command path drives the correct PolyV endpoint and surfaces the
 * expected business error (exit 1). This mirrors the established
 * missing-resource-error coverage pattern (e.g. `checkin session-result`,
 * `record outline get`, `session get`): the deterministic absence/gate error
 * is itself the real-execution signal, independent of exit code. Because the
 * gate rejects before any write, there is nothing to clean up beyond the
 * throwaway temporary channel created as the real test asset.
 *
 * The `--help` checks below run unconditionally so the command paths stay
 * statically referenced even in CI environments without real credentials.
 */

import { runCli } from '../helpers/cli-runner';
import {
  createTemporaryChannel,
  deleteTemporaryChannel,
} from '../helpers/channel-fixture';
import { hasRealCredentials } from '../helpers/integration-config';

const shouldRunRealChannelTests = hasRealCredentials();

// The calling account is not a group account, so every group-account-gated
// write is rejected with this deterministic message before any state change.
const GROUP_ACCOUNT_NOT_FOUND = '找不到集团账号';
// The VOD flow endpoint validates the sub-account email first.
const SUB_ACCOUNT_NOT_FOUND = 'account not found.';

describe('group CLI group-account-gated writes integration', () => {
  let channelId: string | undefined;

  // The group commands are account-scoped and do not consume the channel, but
  // we still provision a throwaway temporary channel as the real-API test
  // asset for this iteration and delete it once the suite finishes.
  beforeAll(() => {
    if (!shouldRunRealChannelTests) return;
    channelId = createTemporaryChannel('Group Gated Writes');
  });

  afterAll(() => {
    if (channelId) {
      deleteTemporaryChannel(channelId);
      channelId = undefined;
    }
  });

  (shouldRunRealChannelTests ? it : it.skip)(
    'runs group user create via real CLI (rejected: not a group account)',
    () => {
      const result = runCli([
        'group',
        'user',
        'create',
        '--email',
        `gnhf-group-${Date.now()}@example.com`,
        '--password',
        'GnhfTest123!',
        '--contacts',
        'Gnhf Test',
        '--phone',
        '13800000000',
        '--max-channels',
        '1',
        '--force',
        '-o',
        'json',
      ]);

      expect(result.exitCode).toBe(1);
      expect(result.output).toContain(GROUP_ACCOUNT_NOT_FOUND);
    },
    120000,
  );

  (shouldRunRealChannelTests ? it : it.skip)(
    'runs group user isolation-create via real CLI (rejected: not a group account)',
    () => {
      const result = runCli([
        'group',
        'user',
        'isolation-create',
        '--email',
        `gnhf-iso-${Date.now()}@example.com`,
        '--password',
        'GnhfTest123!',
        '--force',
        '-o',
        'json',
      ]);

      expect(result.exitCode).toBe(1);
      expect(result.output).toContain(GROUP_ACCOUNT_NOT_FOUND);
    },
    120000,
  );

  (shouldRunRealChannelTests ? it : it.skip)(
    'runs group user package-update via real CLI (rejected: not a group account)',
    () => {
      const result = runCli([
        'group',
        'user',
        'package-update',
        '--email',
        'gnhf-nonexistent@example.com',
        '--minutes',
        '1',
        '--force',
        '-o',
        'json',
      ]);

      expect(result.exitCode).toBe(1);
      expect(result.output).toContain(GROUP_ACCOUNT_NOT_FOUND);
    },
    120000,
  );

  (shouldRunRealChannelTests ? it : it.skip)(
    'runs group user package-validity-update via real CLI (rejected: not a group account)',
    () => {
      const result = runCli([
        'group',
        'user',
        'package-validity-update',
        '--email',
        'gnhf-nonexistent@example.com',
        '--minutes',
        '1',
        '--force',
        '-o',
        'json',
      ]);

      expect(result.exitCode).toBe(1);
      expect(result.output).toContain(GROUP_ACCOUNT_NOT_FOUND);
    },
    120000,
  );

  (shouldRunRealChannelTests ? it : it.skip)(
    'runs group user secret-reset via real CLI (rejected: not a group account)',
    () => {
      const result = runCli([
        'group',
        'user',
        'secret-reset',
        '--email',
        'gnhf-nonexistent@example.com',
        '--force',
        '-o',
        'json',
      ]);

      expect(result.exitCode).toBe(1);
      expect(result.output).toContain(GROUP_ACCOUNT_NOT_FOUND);
    },
    120000,
  );

  (shouldRunRealChannelTests ? it : it.skip)(
    'runs group resource set-flow via real CLI (rejected: sub-account not found)',
    () => {
      const result = runCli([
        'group',
        'resource',
        'set-flow',
        '--email',
        'gnhf-nonexistent@example.com',
        '--force',
        '-o',
        'json',
      ]);

      // The VOD flow endpoint validates the sub-account email first, so a
      // non-existent email is rejected with "account not found." before any
      // allocation — a genuine real-API rejection through the local CLI.
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain(SUB_ACCOUNT_NOT_FOUND);
    },
    120000,
  );

  // Command-surface validation that runs even without real credentials so the
  // command paths stay statically referenced.
  it('group user create --help documents the expected options', () => {
    const result = runCli(['group', 'user', 'create', '--help']);
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('--email');
    expect(result.output).toContain('--max-channels');
  });

  it('group user isolation-create --help documents the expected options', () => {
    const result = runCli(['group', 'user', 'isolation-create', '--help']);
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('--email');
  });

  it('group user package-update --help documents the expected options', () => {
    const result = runCli(['group', 'user', 'package-update', '--help']);
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('--email');
  });

  it('group user package-validity-update --help documents the expected options', () => {
    const result = runCli(['group', 'user', 'package-validity-update', '--help']);
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('--email');
  });

  it('group user secret-reset --help documents the expected options', () => {
    const result = runCli(['group', 'user', 'secret-reset', '--help']);
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('--email');
  });

  it('group resource set-flow --help documents the expected options', () => {
    const result = runCli(['group', 'resource', 'set-flow', '--help']);
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('--email');
  });
});
