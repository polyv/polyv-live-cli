/**
 * Play-safety endpoints.
 *
 * @module services/playsafe
 */

import type { PolyVVodClient } from '../client.js';
import { PolyVVodError } from '../errors/index.js';
import type { CreatePlayTokenParams, PlayToken } from '../types/playsafe.js';

export class PlaySafeService {
  constructor(private readonly client: PolyVVodClient) {}

  /**
   * Creates a Playsafe token for playing an encrypted video.
   *
   * Reusing the same `videoId`, `viewerId`, `viewerIp` and `iswxa` while a token is still valid
   * extends that token instead of issuing a new one.
   */
  async createPlayToken(params: CreatePlayTokenParams): Promise<PlayToken> {
    if (!params.videoId) throw new PolyVVodError('validation', 'videoId is required');
    if (!params.viewerId) throw new PolyVVodError('validation', 'viewerId is required');
    if (!/^[A-Za-z0-9_-]+$/.test(params.viewerId)) {
      throw new PolyVVodError('validation', 'viewerId must consist of letters, digits, "-" and "_"');
    }
    if (params.expires !== undefined && (params.expires <= 0 || params.expires > 24 * 3600)) {
      throw new PolyVVodError('validation', 'expires must be between 1 second and 24 hours');
    }
    return this.client.request({
      method: 'POST',
      host: 'hls',
      path: '/service/v1/token',
      // This endpoint signs with MD5 over every parameter sent, `userid` included.
      auth: 'md5',
      in: 'body',
      params: {
        userid: this.client.config.userId,
        videoId: params.videoId,
        ts: Date.now(),
        viewerId: params.viewerId,
        viewerIp: params.viewerIp,
        viewerName: params.viewerName,
        expires: params.expires,
        disposable: params.disposable === undefined ? undefined : String(params.disposable),
        iswxa: params.iswxa === undefined ? undefined : params.iswxa ? 1 : 0,
        type: params.type,
        extraParams: params.extraParams,
        securitySeed: params.securitySeed
      },
      idempotent: false
    });
  }
}
