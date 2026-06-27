/**
 * @fileoverview Real-CLI integration tests for the `partner` family of
 * subcommands.
 *
 * `partner tencent-order create` drives the Tencent enterprise order endpoint
 * (/live/v4/root/order/create), whose documented side effect is "通知保利威
 * 工作人员，由工作人员线下开通账号" — i.e. it notifies PolyV staff to provision
 * the account offline. That is an outward, irreversible, human-in-the-loop
 * action, so the command must NOT be exercised on its success path with real
 * credentials.
 *
 * The command is instead covered via its deterministic **client-side validation
 * gate**: the handler (`PartnerHandler.createTencentOrder`) requires that at
 * least one of `--basic-service` / `--premium-service` be supplied, and throws
 * `PolyVValidationError('Missing required option(s): basicService or premiumService')`
 * before `confirmWrite` and before any API call. Running the real CLI with the
 * other required fields but NEITHER service option therefore exits 1 with that
 * message and never reaches the order endpoint — provably no staff notification,
 * no order record, no outward side effect. This is the same client-guard
 * coverage pattern used for `stream push` (fake-file guard) and the
 * group-account-gated writes.
 *
 * The `--help` checks run unconditionally so the command paths stay statically
 * referenced even in CI environments without real credentials.
 */

import { runCli } from '../helpers/cli-runner';
import {
  createTemporaryChannel,
  deleteTemporaryChannel,
} from '../helpers/channel-fixture';
import { hasRealCredentials } from '../helpers/integration-config';

const shouldRunRealChannelTests = hasRealCredentials();

// The handler rejects with this message before any API call when neither
// --basic-service nor --premium-service is supplied.
const MISSING_SERVICE_OPTION = 'Missing required option(s): basicService or premiumService';

describe('partner CLI integration', () => {
  let channelId: string | undefined;

  // The partner command is account-scoped and the order endpoint is never
  // reached (the client gate throws first), but we still provision a throwaway
  // temporary channel as the real-account test asset for this iteration and
  // delete it once the suite finishes.
  beforeAll(() => {
    if (!shouldRunRealChannelTests) return;
    channelId = createTemporaryChannel('Partner Tencent Order Gate');
  });

  afterAll(() => {
    if (channelId) {
      deleteTemporaryChannel(channelId);
      channelId = undefined;
    }
  });

  (shouldRunRealChannelTests ? it : it.skip)(
    'runs partner tencent-order create via real CLI (rejected: no service option, before any API call)',
    () => {
      // Supply every other required field plus --force (skip confirmation), but
      // OMIT both --basic-service and --premium-service so the handler throws at
      // its client-side gate before constructing/confirming/calling the order
      // endpoint. No order record and no staff notification can occur.
      const result = runCli([
        'partner',
        'tencent-order',
        'create',
        '--uin',
        'gnhf-test-uin',
        '--order-id',
        `gnhf-cli-order-${Date.now()}`,
        '--email',
        'gnhf-test@example.com',
        '--mobile',
        '13800000000',
        '--force',
        '--output',
        'json',
      ]);

      expect(result.exitCode).toBe(1);
      expect(result.output).toContain(MISSING_SERVICE_OPTION);
    },
    120000,
  );

  // Command-surface validation that runs even without real credentials so the
  // command paths stay statically referenced.
  it('partner tencent-order create --help documents the expected options', () => {
    const result = runCli(['partner', 'tencent-order', 'create', '--help']);
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('--uin');
    expect(result.output).toContain('--order-id');
    expect(result.output).toContain('--basic-service');
    expect(result.output).toContain('--premium-service');
  });

  it('partner user-register --help documents the expected options', () => {
    const result = runCli(['partner', 'user-register', '--help']);
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('--company');
    expect(result.output).toContain('--mobile');
  });
});
