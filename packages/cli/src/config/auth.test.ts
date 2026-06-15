import {
  loadAuthFromCLI,
  loadAuthFromEnv,
  mergeAuthOptions,
  validateAuthConfig,
  createAuthErrorMessage,
  loadAuthConfig
} from './auth';
import { AuthOptions, AUTH_ENV_VARS, AUTH_CLI_OPTIONS } from '../types/auth';
import { ConfigurationError } from '../utils/errors';

describe('Authentication Configuration', () => {
  // Store original environment
  const originalEnv = process.env;

  beforeEach(() => {
    // Clear environment variables before each test
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env[AUTH_ENV_VARS.APP_ID];
    delete process.env[AUTH_ENV_VARS.APP_SECRET];
    delete process.env[AUTH_ENV_VARS.USER_ID];
  });

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('loadAuthFromCLI', () => {
    it('should load all authentication options from CLI', () => {
      const cliOptions = {
        [AUTH_CLI_OPTIONS.APP_ID]: 'test-app-id',
        [AUTH_CLI_OPTIONS.APP_SECRET]: 'test-app-secret',
        [AUTH_CLI_OPTIONS.USER_ID]: 'test-user-id',
      };

      const result = loadAuthFromCLI(cliOptions);

      expect(result).toEqual({
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
        userId: 'test-user-id',
      });
    });

    it('should handle partial CLI options', () => {
      const cliOptions = {
        [AUTH_CLI_OPTIONS.APP_ID]: 'test-app-id',
        // Missing appSecret and userId
      };

      const result = loadAuthFromCLI(cliOptions);

      expect(result).toEqual({
        appId: 'test-app-id',
      });
    });

    it('should handle empty CLI options', () => {
      const result = loadAuthFromCLI({});
      expect(result).toEqual({});
    });

    it('should ignore non-string values', () => {
      const cliOptions = {
        [AUTH_CLI_OPTIONS.APP_ID]: 123, // number instead of string
        [AUTH_CLI_OPTIONS.APP_SECRET]: true, // boolean instead of string
        [AUTH_CLI_OPTIONS.USER_ID]: 'valid-user-id',
      };

      const result = loadAuthFromCLI(cliOptions);

      expect(result).toEqual({
        userId: 'valid-user-id',
      });
    });
  });

  describe('loadAuthFromEnv', () => {
    it('should load all authentication options from environment variables', () => {
      process.env[AUTH_ENV_VARS.APP_ID] = 'env-app-id';
      process.env[AUTH_ENV_VARS.APP_SECRET] = 'env-app-secret';
      process.env[AUTH_ENV_VARS.USER_ID] = 'env-user-id';

      const result = loadAuthFromEnv();

      expect(result).toEqual({
        appId: 'env-app-id',
        appSecret: 'env-app-secret',
        userId: 'env-user-id',
      });
    });

    it('should handle partial environment variables', () => {
      process.env[AUTH_ENV_VARS.APP_ID] = 'env-app-id';
      // Missing APP_SECRET and USER_ID

      const result = loadAuthFromEnv();

      expect(result).toEqual({
        appId: 'env-app-id',
      });
    });

    it('should handle empty environment variables', () => {
      const result = loadAuthFromEnv();
      expect(result).toEqual({});
    });

    it('should trim whitespace from environment variables', () => {
      process.env[AUTH_ENV_VARS.APP_ID] = '  env-app-id  ';
      process.env[AUTH_ENV_VARS.APP_SECRET] = '\tenv-app-secret\t';
      process.env[AUTH_ENV_VARS.USER_ID] = '\nenv-user-id\n';

      const result = loadAuthFromEnv();

      expect(result).toEqual({
        appId: 'env-app-id',
        appSecret: 'env-app-secret',
        userId: 'env-user-id',
      });
    });

    it('should include empty strings and trim whitespace-only environment variables', () => {
      process.env[AUTH_ENV_VARS.APP_ID] = '';
      process.env[AUTH_ENV_VARS.APP_SECRET] = '   ';
      process.env[AUTH_ENV_VARS.USER_ID] = 'valid-user-id';

      const result = loadAuthFromEnv();

      expect(result).toEqual({
        appId: '',
        appSecret: '',
        userId: 'valid-user-id',
      });
    });

    it('should not include undefined environment variables', () => {
      // Explicitly unset environment variables
      delete process.env[AUTH_ENV_VARS.APP_ID];
      delete process.env[AUTH_ENV_VARS.APP_SECRET];
      process.env[AUTH_ENV_VARS.USER_ID] = 'valid-user-id';

      const result = loadAuthFromEnv();

      expect(result).toEqual({
        userId: 'valid-user-id',
      });
    });
  });

  describe('mergeAuthOptions', () => {
    it('should prioritize CLI options over environment variables', () => {
      const cliOptions: AuthOptions = {
        appId: 'cli-app-id',
        appSecret: 'cli-app-secret',
      };

      const envOptions: AuthOptions = {
        appId: 'env-app-id',
        appSecret: 'env-app-secret',
        userId: 'env-user-id',
      };

      const result = mergeAuthOptions(cliOptions, envOptions);

      expect(result.options).toEqual({
        appId: 'cli-app-id',
        appSecret: 'cli-app-secret',
        userId: 'env-user-id',
      });

      expect(result.sources).toEqual({
        appIdSource: 'cli',
        appSecretSource: 'cli',
        userIdSource: 'env',
      });
    });

    it('should use environment variables when CLI options are missing', () => {
      const cliOptions: AuthOptions = {
        userId: 'cli-user-id',
      };

      const envOptions: AuthOptions = {
        appId: 'env-app-id',
        appSecret: 'env-app-secret',
      };

      const result = mergeAuthOptions(cliOptions, envOptions);

      expect(result.options).toEqual({
        appId: 'env-app-id',
        appSecret: 'env-app-secret',
        userId: 'cli-user-id',
      });

      expect(result.sources).toEqual({
        appIdSource: 'env',
        appSecretSource: 'env',
        userIdSource: 'cli',
      });
    });

    it('should handle empty options', () => {
      const result = mergeAuthOptions({}, {});

      expect(result.options).toEqual({});
      expect(result.sources).toEqual({});
    });

    it('should prioritize empty strings in CLI over non-empty env values', () => {
      const cliOptions: AuthOptions = {
        appId: '',
        appSecret: '',
      };

      const envOptions: AuthOptions = {
        appId: 'env-app-id',
        appSecret: 'env-app-secret',
        userId: 'env-user-id',
      };

      const result = mergeAuthOptions(cliOptions, envOptions);

      expect(result.options).toEqual({
        appId: '',
        appSecret: '',
        userId: 'env-user-id',
      });

      expect(result.sources).toEqual({
        appIdSource: 'cli',
        appSecretSource: 'cli',
        userIdSource: 'env',
      });
    });
  });

  describe('validateAuthConfig', () => {
    it('should validate complete configuration', () => {
      const authOptions: AuthOptions = {
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
        userId: 'test-user-id',
      };

      expect(validateAuthConfig(authOptions)).toBe(true);
    });

    it('should validate configuration without optional userId', () => {
      const authOptions: AuthOptions = {
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
      };

      expect(validateAuthConfig(authOptions)).toBe(true);
    });

    it('should reject configuration missing appId', () => {
      const authOptions: AuthOptions = {
        appSecret: 'test-app-secret',
        userId: 'test-user-id',
      };

      expect(validateAuthConfig(authOptions)).toBe(false);
    });

    it('should reject configuration missing appSecret', () => {
      const authOptions: AuthOptions = {
        appId: 'test-app-id',
        userId: 'test-user-id',
      };

      expect(validateAuthConfig(authOptions)).toBe(false);
    });

    it('should reject completely empty configuration', () => {
      expect(validateAuthConfig({})).toBe(false);
    });
  });

  describe('createAuthErrorMessage', () => {
    it('should create error message for missing appId', () => {
      const authOptions: AuthOptions = {
        appSecret: 'test-secret',
      };
      const sources = { appSecretSource: 'cli' as const };

      const message = createAuthErrorMessage(authOptions, sources);

      expect(message).toContain('Missing required authentication parameters: appId');
      expect(message).toContain('Command line: --appId');
      expect(message).toContain('Environment variables: POLYV_APP_ID');
    });

    it('should create error message for missing appSecret', () => {
      const authOptions: AuthOptions = {
        appId: 'test-id',
      };
      const sources = { appIdSource: 'env' as const };

      const message = createAuthErrorMessage(authOptions, sources);

      expect(message).toContain('Missing required authentication parameters: appSecret');
    });

    it('should create error message for multiple missing parameters', () => {
      const authOptions: AuthOptions = {};
      const sources = {};

      const message = createAuthErrorMessage(authOptions, sources);

      expect(message).toContain('Missing required authentication parameters: appId, appSecret');
    });

    it('should show current configuration sources when available', () => {
      const authOptions: AuthOptions = {
        userId: 'test-user',
      };
      const sources = { userIdSource: 'cli' as const };

      const message = createAuthErrorMessage(authOptions, sources);

      expect(message).toContain('Current configuration sources:');
      expect(message).toContain('userId: cli');
    });

    it('should return valid message when authentication is complete', () => {
      const authOptions: AuthOptions = {
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
      };
      const sources = {
        appIdSource: 'cli' as const,
        appSecretSource: 'env' as const,
      };

      const message = createAuthErrorMessage(authOptions, sources);

      expect(message).toBe('Authentication configuration is valid');
    });
  });

  describe('loadAuthConfig', () => {
    it('should successfully load valid configuration from CLI', () => {
      const cliOptions = {
        [AUTH_CLI_OPTIONS.APP_ID]: 'test-app-id',
        [AUTH_CLI_OPTIONS.APP_SECRET]: 'test-app-secret',
        [AUTH_CLI_OPTIONS.USER_ID]: 'test-user-id',
      };

      const result = loadAuthConfig(cliOptions);

      expect(result.isValid).toBe(true);
      expect(result.config).toEqual({
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
        userId: 'test-user-id',
      });
      expect(result.sources).toEqual({
        appIdSource: 'cli',
        appSecretSource: 'cli',
        userIdSource: 'cli',
      });
    });

    it('should successfully load valid configuration from environment', () => {
      process.env[AUTH_ENV_VARS.APP_ID] = 'env-app-id';
      process.env[AUTH_ENV_VARS.APP_SECRET] = 'env-app-secret';

      const result = loadAuthConfig({});

      expect(result.isValid).toBe(true);
      expect(result.config).toEqual({
        appId: 'env-app-id',
        appSecret: 'env-app-secret',
        userId: undefined,
      });
      expect(result.sources).toEqual({
        appIdSource: 'env',
        appSecretSource: 'env',
      });
    });

    it('should prioritize CLI over environment variables', () => {
      process.env[AUTH_ENV_VARS.APP_ID] = 'env-app-id';
      process.env[AUTH_ENV_VARS.APP_SECRET] = 'env-app-secret';
      process.env[AUTH_ENV_VARS.USER_ID] = 'env-user-id';

      const cliOptions = {
        [AUTH_CLI_OPTIONS.APP_ID]: 'cli-app-id',
        [AUTH_CLI_OPTIONS.APP_SECRET]: 'cli-app-secret',
      };

      const result = loadAuthConfig(cliOptions);

      expect(result.config).toEqual({
        appId: 'cli-app-id',
        appSecret: 'cli-app-secret',
        userId: 'env-user-id',
      });
      expect(result.sources).toEqual({
        appIdSource: 'cli',
        appSecretSource: 'cli',
        userIdSource: 'env',
      });
    });

    it('should throw ConfigurationError for invalid configuration', () => {
      const cliOptions = {
        [AUTH_CLI_OPTIONS.APP_ID]: 'test-app-id',
        // Missing appSecret
      };

      expect(() => loadAuthConfig(cliOptions)).toThrow(ConfigurationError);
      expect(() => loadAuthConfig(cliOptions)).toThrow(/Missing required authentication parameters/);
    });

    it('should handle empty configuration gracefully', () => {
      expect(() => loadAuthConfig({})).toThrow(ConfigurationError);
    });
  });
});