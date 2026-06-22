/**
 * @fileoverview Runtime-coverage for session type placeholders.
 * The `../types/session` module declares both interfaces and same-named runtime
 * `const` placeholders; type-only imports get erased, so this test forces the
 * module to load and exercises its runtime exports.
 */

import * as sessionTypes from './session';

describe('session types runtime placeholders', () => {
  it('exposes defined runtime placeholder constants', () => {
    expect(sessionTypes.SessionServiceConfig).toBeDefined();
    expect(sessionTypes.SessionListOptions).toBeDefined();
    expect(sessionTypes.SessionGetOptions).toBeDefined();
    expect(sessionTypes.SessionDisplayItem).toBeDefined();
  });
});
