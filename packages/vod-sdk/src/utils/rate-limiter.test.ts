import { describe, expect, it } from 'vitest';

import { RateLimiter } from './rate-limiter.js';

describe('RateLimiter', () => {
  it('rejects a non-positive budget', () => {
    expect(() => new RateLimiter(0, 100)).toThrow(RangeError);
    expect(() => new RateLimiter(1, -1)).toThrow(RangeError);
  });

  it('admits up to maxRequests at once, then waits for the window to free up', async () => {
    const limiter = new RateLimiter(2, 60);
    const started = Date.now();
    await Promise.all([limiter.acquire(), limiter.acquire()]);
    expect(limiter.used).toBe(2);
    expect(Date.now() - started).toBeLessThan(30);
    await limiter.acquire();
    expect(Date.now() - started).toBeGreaterThanOrEqual(50);
    expect(limiter.used).toBeLessThanOrEqual(2);
  });

  it('queues a burst instead of rejecting it', async () => {
    const limiter = new RateLimiter(3, 40);
    const done = await Promise.all(Array.from({ length: 8 }, () => limiter.acquire()));
    expect(done).toHaveLength(8);
  });
});
