/**
 * The SDK client the commands use.
 */
import { PolyVVodClient, type PolyVVodClientConfig } from 'polyv-vod-api-sdk';

import type { VodCredentials } from './accounts';
import { getResolvedSource } from './source';
import { getCliVersion } from './version';

/** `polyv-vod-cli/<version> (source=<id>)`; the platform attributes traffic by this header. */
export function buildUserAgent(): string {
  const source = getResolvedSource();
  return `polyv-vod-cli/${getCliVersion()}${source ? ` (source=${source.source})` : ''}`;
}

export function createClient(credentials: VodCredentials, options: Partial<PolyVVodClientConfig> = {}): PolyVVodClient {
  return new PolyVVodClient({
    userId: credentials.userId,
    secretKey: credentials.secretKey,
    writeToken: credentials.writeToken,
    readToken: credentials.readToken,
    appId: credentials.appId,
    appSecret: credentials.appSecret,
    userAgent: buildUserAgent(),
    ...options
  });
}
