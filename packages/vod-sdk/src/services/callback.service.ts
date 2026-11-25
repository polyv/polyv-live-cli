/**
 * Callback settings and callback signature verification.
 *
 * The settings endpoints are V4: they need the account's API credentials (`appId` /
 * `appSecret`), the same ones the PolyV Live API uses.
 *
 * @module services/callback
 */

import type { PolyVVodClient } from '../client.js';
import type { CallbackSignInput } from '../auth/signature.js';
import { verifyCallbackSignature } from '../auth/signature.js';
import type { CallbackSetting } from '../types/playsafe.js';

export class CallbackService {
  constructor(private readonly client: PolyVVodClient) {}

  getCallbackSetting(): Promise<CallbackSetting> {
    return this.client.request({ method: 'GET', path: '/vod/v4/user/setting/callback/get', auth: 'v4', in: 'query' });
  }

  /** Sets the callback URL; omitting it clears the setting. */
  updateCallbackSetting(params: CallbackSetting = {}): Promise<unknown> {
    return this.client.request({
      method: 'POST',
      path: '/vod/v4/user/setting/callback/update',
      auth: 'v4',
      in: 'query',
      params: { callbackUrl: params.callbackUrl },
      idempotent: false
    });
  }

  /**
   * Whether an event callback really comes from the platform, for the events listed in
   * `docs/vod/api/callBack.md`. Feed it the callback's query and body fields.
   */
  verifySignature(input: CallbackSignInput): boolean {
    return verifyCallbackSignature(input, this.client.config.secretKey);
  }
}
