/**
 * Real-account test for the callback settings: the two endpoints that need the account's API
 * credentials (POLYV_VOD_APP_ID and POLYV_VOD_APP_SECRET) rather than the VOD keys.
 *
 * Skipped unless those are set (copy `.env.example` to `.env.test`). It reads the setting, sets
 * it and puts it back, so the account ends with the callback it started with.
 */
import { fileURLToPath } from 'node:url';
import { config as loadDotenv } from 'dotenv';
import { describe, expect, it } from 'vitest';

import { PolyVVodClient } from '../../src/index.js';

loadDotenv({ path: fileURLToPath(new URL('../../.env.test', import.meta.url)) });

const appId = process.env.POLYV_VOD_APP_ID;
const appSecret = process.env.POLYV_VOD_APP_SECRET;
const real = appId && appSecret ? describe.sequential : describe.skip;

const PLACEHOLDER = 'https://example.com/polyv-vod-sdk-callback-test';

/** The platform reports "no callback" as `null` (never set) or `""` (cleared). */
const isUnset = (value: string | null | undefined): boolean =>
  value === null || value === undefined || value === '';

const client = (overrides: { appSecret?: string } = {}) =>
  new PolyVVodClient({
    // These two endpoints do not use the VOD keys; the client requires them anyway.
    userId: process.env.POLYV_VOD_USER_ID || 'unused',
    secretKey: process.env.POLYV_VOD_SECRET_KEY || 'unused',
    appId,
    appSecret,
    rateLimit: false,
    ...overrides
  });

const currentUrl = async (): Promise<string | null | undefined> =>
  (await client().callback.getCallbackSetting()).callbackUrl;

real('callback settings against the real platform', () => {
  it('reads the callback setting', async () => {
    const setting = await client().callback.getCallbackSetting();
    const url = setting.callbackUrl;
    expect(url === null || url === undefined || typeof url === 'string').toBe(true);
  });

  it('sets a callback URL and leaves the setting as it found it', async () => {
    const before = await currentUrl();
    // Write back what is there; set a placeholder only when nothing is configured.
    const target = isUnset(before) ? PLACEHOLDER : (before as string);
    try {
      await client().callback.updateCallbackSetting({ callbackUrl: target });
      expect(await currentUrl()).toBe(target);
    } finally {
      // Clearing leaves "" rather than the null of an account that never had a callback.
      await client().callback.updateCallbackSetting(isUnset(before) ? {} : { callbackUrl: before as string });
    }
    const after = await currentUrl();
    if (isUnset(before)) expect(isUnset(after)).toBe(true);
    else expect(after).toBe(before);
  });

  it('rejects a wrong AppSecret with the platform signature error', async () => {
    // The platform checks the signature before it acts, so nothing is changed by this call.
    await expect(client({ appSecret: `${appSecret}0` }).callback.getCallbackSetting()).rejects.toMatchObject({
      kind: 'api',
      code: 403,
      retryable: false
    });
  });
});
