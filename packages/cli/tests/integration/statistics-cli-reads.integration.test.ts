/**
 * @fileoverview Real-CLI integration tests for statistics read commands.
 *
 * Each target is exercised through the local CLI entry (dist/index.js). Per the
 * integration-test convention, every test creates a temporary channel as the
 * real test asset and deletes it in `finally`, even for account-scoped reads.
 */

import {
  createTemporaryChannel,
  deleteTemporaryChannel,
  parseJsonValue,
  runCliSuccess,
} from '../helpers/channel-fixture';
import { runCli } from '../helpers/cli-runner';
import { hasRealCredentials } from '../helpers/integration-config';

const shouldRunRealChannelTests = hasRealCredentials();

/** Format a Date as yyyy-MM-dd in UTC (matches the CLI date validator). */
function toDay(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Format a Date as "yyyy-MM-dd HH:mm:ss" in UTC (matches the CLI datetime
 * validator used by `statistics export viewlog`).
 */
function toDateTime(date: Date): string {
  return date.toISOString().replace('T', ' ').substring(0, 19);
}

describe('statistics read CLI integration', () => {
  (shouldRunRealChannelTests ? it : it.skip)('queries concurrency and max-concurrent for a temporary channel via real CLI', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Statistics Channel Reads');

      // Concurrency accepts a yyyy-MM-dd window and returns one record per day
      // (0 viewers for a brand-new channel).
      const now = Date.now();
      const startDay = toDay(new Date(now - 3 * 24 * 60 * 60 * 1000));
      const endDay = toDay(new Date(now));

      const concurrencyOutput = runCliSuccess([
        'statistics',
        'concurrency',
        '-c',
        channelId,
        '--start-date',
        startDay,
        '--end-date',
        endDay,
        '--output',
        'json',
      ]);
      const concurrency = parseJsonValue(concurrencyOutput);
      expect(Array.isArray(concurrency)).toBe(true);

      // Max-concurrent accepts 13-digit millisecond timestamps and returns the
      // peak concurrent count (0 for a channel that has never broadcast).
      const startTime = String(now - 7 * 24 * 60 * 60 * 1000);
      const endTime = String(now);
      const maxOutput = runCliSuccess([
        'statistics',
        'max-concurrent',
        '-c',
        channelId,
        '--start-time',
        startTime,
        '--end-time',
        endTime,
        '--output',
        'json',
      ]);
      const maxPayload = parseJsonValue(maxOutput) as { channelId?: unknown; maxConcurrent?: unknown };
      expect(String(maxPayload.channelId)).toBe(channelId);
      expect(typeof maxPayload.maxConcurrent).toBe('number');
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 120000);

  (shouldRunRealChannelTests ? it : it.skip)('lists live session statistics via real CLI', () => {
    let channelId: string | undefined;

    try {
      // live-session-list is account-scoped, but the convention still requires a
      // temporary channel as the real test asset for this round.
      channelId = createTemporaryChannel('Statistics LiveSessionList');

      // The endpoint caps the query window at 24 hours, so use a 23-hour window.
      const now = Date.now();
      const startTime = String(now - 23 * 60 * 60 * 1000);
      const endTime = String(now);

      const output = runCliSuccess([
        'statistics',
        'live-session-list',
        '--start-time',
        startTime,
        '--end-time',
        endTime,
        '--page-number',
        '1',
        '--page-size',
        '5',
        '--output',
        'json',
      ]);

      const payload = parseJsonValue(output) as { contents?: unknown; totalItems?: unknown };
      expect(Array.isArray(payload.contents)).toBe(true);
      expect(typeof payload.totalItems).toBe('number');
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 120000);

  // statistics view / audience region / audience device / export viewlog all use
  // displayInfo to print a non-JSON "No ... data found" line and exit 0 when a
  // brand-new channel has no viewing data (the same shape as `lottery winners`
  // and `donate list`). They are real CLI executions; the empty-data info line
  // is the meaningful observable, so they are asserted via runCli + exitCode/0
  // and output-contains rather than a JSON parser.
  (shouldRunRealChannelTests ? it : it.skip)('runs empty-data statistics reads (view / audience region / audience device / export viewlog) via real CLI', () => {
    let channelId: string | undefined;

    try {
      channelId = createTemporaryChannel('Statistics Empty Reads');

      const now = Date.now();
      const startDay = toDay(new Date(now - 3 * 24 * 60 * 60 * 1000));
      const endDay = toDay(new Date(now));

      // statistics view — yyyy-MM-dd window (max 60 days).
      const viewResult = runCli([
        'statistics',
        'view',
        '-c',
        channelId,
        '--start-day',
        startDay,
        '--end-day',
        endDay,
        '--output',
        'json',
      ]);
      expect(viewResult.exitCode).toBe(0);
      expect(viewResult.output).toContain('No statistics data found');

      // audience region / device — 13-digit millisecond window (max 90 days).
      const startTime = String(now - 7 * 24 * 60 * 60 * 1000);
      const endTime = String(now);

      const regionResult = runCli([
        'statistics',
        'audience',
        'region',
        '-c',
        channelId,
        '--start-time',
        startTime,
        '--end-time',
        endTime,
        '--output',
        'json',
      ]);
      expect(regionResult.exitCode).toBe(0);
      expect(regionResult.output).toContain('No region distribution data found');

      const deviceResult = runCli([
        'statistics',
        'audience',
        'device',
        '-c',
        channelId,
        '--start-time',
        startTime,
        '--end-time',
        endTime,
        '--output',
        'json',
      ]);
      expect(deviceResult.exitCode).toBe(0);
      expect(deviceResult.output).toContain('No device distribution data found');

      // export viewlog — "yyyy-MM-dd HH:mm:ss" window; the validator requires
      // start and end to fall in the same month, so pin both to today (UTC).
      const viewlogStart = toDateTime(new Date(now));
      const viewlogEnd = toDateTime(new Date(now));

      const viewlogResult = runCli([
        'statistics',
        'export',
        'viewlog',
        '-c',
        channelId,
        '--start-time',
        viewlogStart,
        '--end-time',
        viewlogEnd,
        '--output',
        'json',
      ]);
      expect(viewlogResult.exitCode).toBe(0);
      expect(viewlogResult.output).toContain('No viewlog data found');
    } finally {
      if (channelId) {
        deleteTemporaryChannel(channelId);
      }
    }
  }, 120000);
});
