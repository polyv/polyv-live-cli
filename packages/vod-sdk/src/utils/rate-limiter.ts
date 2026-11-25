/**
 * Sliding-window rate limiter.
 *
 * `api.polyv.net` allows 500 requests per 10 seconds per IP; exceeding it blocks the IP for
 * 5 minutes. The client keeps a configurable budget below that limit.
 *
 * @module utils/rate-limiter
 */

import { setTimeout as sleep } from 'node:timers/promises';

export class RateLimiter {
  private readonly issuedAt: number[] = [];

  constructor(
    readonly maxRequests: number,
    readonly windowMs: number
  ) {
    if (!Number.isFinite(maxRequests) || maxRequests <= 0) {
      throw new RangeError('maxRequests must be a positive number');
    }
    if (!Number.isFinite(windowMs) || windowMs <= 0) {
      throw new RangeError('windowMs must be a positive number');
    }
  }

  /** Number of requests issued inside the current window. */
  get used(): number {
    this.prune(Date.now());
    return this.issuedAt.length;
  }

  /** Resolves once a request may be sent, waiting for the window to free up if needed. */
  async acquire(): Promise<void> {
    for (;;) {
      const now = Date.now();
      this.prune(now);
      const oldest = this.issuedAt[0];
      if (this.issuedAt.length < this.maxRequests || oldest === undefined) {
        this.issuedAt.push(now);
        return;
      }
      await sleep(Math.max(oldest + this.windowMs - now, 1));
    }
  }

  private prune(now: number): void {
    while (this.issuedAt.length > 0 && this.issuedAt[0] <= now - this.windowMs) {
      this.issuedAt.shift();
    }
  }
}
