/**
 * Test credentials, and how they reach the CLI.
 *
 * The real-account tests need a VOD test account: `POLYV_VOD_USER_ID`, `POLYV_VOD_SECRET_KEY`
 * and `POLYV_VOD_WRITE_TOKEN`, plus `POLYV_VOD_APP_ID` / `POLYV_VOD_APP_SECRET` for the
 * `callback` commands. They come from the environment or from a gitignored `.env.test`: the one
 * in this package if it exists, otherwise the one the SDK's own tests read
 * (`packages/vod-sdk/.env.test`; `packages/vod-sdk/.env.example` shows the keys). Without the
 * first three the real-account tests are skipped.
 *
 * Use a test account. Those tests upload and delete videos and change settings on the platform.
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { config as loadDotenv } from 'dotenv';

/** What a VOD account needs: the keys for everything, the API pair for the V4 endpoints. */
export interface TestCredentials {
  userId: string;
  secretKey: string;
  /** Uploads need it. */
  writeToken?: string;
  appId?: string;
  appSecret?: string;
}

/** A test account that can upload. */
export type UploadCredentials = TestCredentials & { writeToken: string };

for (const file of [resolve(__dirname, '../../.env.test'), resolve(__dirname, '../../../vod-sdk/.env.test')]) {
  // dotenv leaves variables that are already set alone, so the environment wins over both files.
  if (existsSync(file)) loadDotenv({ path: file, quiet: true });
}

function read(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

/** The test account, or null when its userId, secretKey or writeToken is not configured. */
export function readCredentials(): UploadCredentials | null {
  const userId = read('POLYV_VOD_USER_ID');
  const secretKey = read('POLYV_VOD_SECRET_KEY');
  const writeToken = read('POLYV_VOD_WRITE_TOKEN');
  if (!userId || !secretKey || !writeToken) return null;
  return { userId, secretKey, writeToken, appId: read('POLYV_VOD_APP_ID'), appSecret: read('POLYV_VOD_APP_SECRET') };
}
