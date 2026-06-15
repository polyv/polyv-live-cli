import * as types from './index';

describe('Types Index', () => {
  it('should export auth types', () => {
    // Test that the main types are available from the index
    const config: types.AuthConfig = {
      appId: 'test',
      appSecret: 'test',
    };
    
    expect(config.appId).toBe('test');
    expect(config.appSecret).toBe('test');
  });

  it('should export all auth-related types', () => {
    // Ensure the module exports exist
    expect(typeof types.AUTH_ENV_VARS).toBe('object');
    expect(typeof types.AUTH_CLI_OPTIONS).toBe('object');
    expect(types.AUTH_ENV_VARS.APP_ID).toBe('POLYV_APP_ID');
  });
});