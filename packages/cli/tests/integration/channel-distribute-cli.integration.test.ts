import { runCli, sleep } from '../helpers/cli-runner';
import {
  createTemporaryChannel,
  deleteTemporaryChannel,
  parseJsonValue,
  runCliSuccess,
} from '../helpers/channel-fixture';
import { hasRealCredentials } from '../helpers/integration-config';

const shouldRunRealChannelTests = hasRealCredentials();

interface DistributeWriteResult {
  output: string;
  restricted: boolean;
}

/**
 * Execute a real CLI command and accept either a clean success or a documented
 * business-level restriction. Cloud distribution (云分发) is an account/channel
 * capability that may not be enabled on every test account, so commands that
 * toggle or create distribution endpoints can legitimately return
 * "频道不支持开启云分发" while still exercising the real API end-to-end.
 */
function isDistributeCapabilityRestriction(output: string): boolean {
  return [
    /不支持开启云分发/,
    /(频道|模板).*不支持.*云分发/,
    /(账号|当前账号).*未开通.*云分发/,
    /未开通云分发/,
    /云分发功能.*未开通/,
    /云分发功能未启用/,
  ].some((pattern) => pattern.test(output));
}

function runDistributeWrite(args: string[], timeout = 60000): DistributeWriteResult {
  const result = runCli(args, { timeout });
  if (result.exitCode === 0) {
    return { output: result.output, restricted: false };
  }

  if (isDistributeCapabilityRestriction(result.output)) {
    return { output: result.output, restricted: true };
  }

  throw new Error(`CLI command failed: ${args.join(' ')}\n${result.output}`);
}

function expectDistributeWriteAccepted(result: DistributeWriteResult): void {
  if (result.restricted) {
    expect(isDistributeCapabilityRestriction(result.output)).toBe(true);
    return;
  }

  const parsed = parseJsonValue(result.output) as { success?: unknown; result?: unknown };
  expect(parsed).toEqual(expect.objectContaining({ success: true }));
}

function findDistributeId(channelId: string, name: string): number | undefined {
  const output = runCliSuccess([
    'channel',
    'distribute',
    'list',
    '--channel-id',
    channelId,
    '--output',
    'json',
  ]);
  const list = parseJsonValue(output) as { result?: Array<{ id?: unknown; name?: unknown }> };
  const matched = list.result?.find((item) => item.name === name);
  const id = Number(matched?.id);
  return Number.isInteger(id) && id > 0 ? id : undefined;
}

function waitForDistributeId(channelId: string, name: string): number {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const id = findDistributeId(channelId, name);
    if (id !== undefined) {
      return id;
    }
    sleep(1000);
  }

  throw new Error(`Cannot find created distribute endpoint ${name} for channel ${channelId}`);
}

describe('channel distribute CLI integration', () => {
  (shouldRunRealChannelTests ? it : it.skip)('queries distribute list and statistics for a temporary channel via real CLI', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Distribute Statistic');
      const id = channelId;
      const now = Date.now();
      const startTime = String(now - 7 * 24 * 60 * 60 * 1000);
      const endTime = String(now);

      // List returns the master-switch state and any existing endpoints.
      const listOutput = runCliSuccess([
        'channel',
        'distribute',
        'list',
        '--channel-id',
        id,
        '--output',
        'json',
      ]);
      const list = parseJsonValue(listOutput) as { distributeEnable?: unknown; result?: unknown };
      expect(typeof list.distributeEnable).toBe('string');
      expect(Array.isArray(list.result)).toBe(true);

      // Statistic accepts a time window and returns the (possibly empty) data set.
      const statisticOutput = runCliSuccess([
        'channel',
        'distribute',
        'statistic',
        '--channel-id',
        id,
        '--start-time',
        startTime,
        '--end-time',
        endTime,
        '--output',
        'json',
      ]);
      const statistic = parseJsonValue(statisticOutput);
      expect(Array.isArray(statistic) || (typeof statistic === 'object' && statistic !== null)).toBe(true);
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 120000);

  (shouldRunRealChannelTests ? it : it.skip)('toggles the distribute master switch for a temporary channel via real CLI', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Distribute Master Switch');

      // The master switch is a standalone toggle. On accounts with cloud
      // distribution enabled the command succeeds; otherwise the API returns the
      // documented capability restriction, which is a valid end-to-end response.
      const writeResult = runDistributeWrite([
        'channel',
        'distribute',
        'master-switch',
        '--channel-id',
        channelId,
        '--enabled',
        'Y',
        '--force',
        '--output',
        'json',
      ]);
      expectDistributeWriteAccepted(writeResult);
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 120000);

  (shouldRunRealChannelTests ? it : it.skip)('creates, updates, switches, and deletes a distribute endpoint for a temporary channel via real CLI', () => {
    let channelId: string | undefined;
    let distributeId: number | undefined;

    try {
      channelId = createTemporaryChannel('Distribute Lifecycle', {
        scene: 'alone',
        template: 'alone',
      });
      const suffix = String(Date.now()).slice(-8);
      const name = `ITD${suffix}`;
      const updatedName = `ITD${suffix}U`;
      const createPayload = JSON.stringify([{
        name,
        distributeUrl: `rtmp://polyv-cli-it.example.com/live/${suffix}`,
        distributeLiveCode: `live${suffix}`,
        status: 'N',
      }]);

      const createResult = runDistributeWrite([
        'channel',
        'distribute',
        'create-batch',
        '--channel-id',
        channelId,
        '--distributes-json',
        createPayload,
        '--force',
        '--output',
        'json',
      ]);
      expectDistributeWriteAccepted(createResult);

      if (createResult.restricted) {
        // No endpoint exists when create is rejected by the cloud-distribution
        // capability gate; continuing with a fake id only validates id parsing.
        return;
      }

      distributeId = waitForDistributeId(channelId, name);
      expect(distributeId).toBeGreaterThan(0);

      expectDistributeWriteAccepted(runDistributeWrite([
        'channel',
        'distribute',
        'update-batch',
        '--channel-id',
        channelId,
        '--distributes-json',
        JSON.stringify([{ id: distributeId, name: updatedName }]),
        '--force',
        '--output',
        'json',
      ]));
      expect(findDistributeId(channelId, updatedName)).toBe(distributeId);

      expectDistributeWriteAccepted(runDistributeWrite([
        'channel',
        'distribute',
        'switch',
        '--channel-id',
        channelId,
        '--distribute-id',
        String(distributeId),
        '--enabled',
        'N',
        '--force',
        '--output',
        'json',
      ]));

      expectDistributeWriteAccepted(runDistributeWrite([
        'channel',
        'distribute',
        'delete-batch',
        '--channel-id',
        channelId,
        '--ids',
        String(distributeId),
        '--force',
        '--output',
        'json',
      ]));
      distributeId = undefined;
    } finally {
      if (channelId && distributeId !== undefined) {
        runDistributeWrite([
          'channel',
          'distribute',
          'delete-batch',
          '--channel-id',
          channelId,
          '--ids',
          String(distributeId),
          '--force',
          '--output',
          'json',
        ]);
      }
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 180000);
});
