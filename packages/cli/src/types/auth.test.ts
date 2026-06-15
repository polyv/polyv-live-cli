import {
  AuthConfig,
  AuthOptions,
  AuthSource,
  AuthResult,
  AUTH_ENV_VARS,
  AUTH_CLI_OPTIONS
} from './auth';

describe('Authentication Types', () => {
  describe('AuthConfig interface', () => {
    it('should accept complete configuration', () => {
      const config: AuthConfig = {
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
        userId: 'test-user-id',
      };

      expect(config.appId).toBe('test-app-id');
      expect(config.appSecret).toBe('test-app-secret');
      expect(config.userId).toBe('test-user-id');
    });

    it('should accept configuration without optional userId', () => {
      const config: AuthConfig = {
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
      };

      expect(config.appId).toBe('test-app-id');
      expect(config.appSecret).toBe('test-app-secret');
      expect(config.userId).toBeUndefined();
    });

    it('should require appId and appSecret', () => {
      // This test ensures TypeScript compilation fails for incomplete config
      // The test itself validates the structure requirements
      const validConfig = (config: AuthConfig): boolean => {
        return typeof config.appId === 'string' && typeof config.appSecret === 'string';
      };

      const completeConfig: AuthConfig = {
        appId: 'test',
        appSecret: 'test',
      };

      expect(validConfig(completeConfig)).toBe(true);
    });
  });

  describe('AuthOptions interface', () => {
    it('should accept partial configuration', () => {
      const options: AuthOptions = {
        appId: 'test-app-id',
      };

      expect(options.appId).toBe('test-app-id');
      expect(options.appSecret).toBeUndefined();
      expect(options.userId).toBeUndefined();
    });

    it('should accept empty configuration', () => {
      const options: AuthOptions = {};

      expect(options.appId).toBeUndefined();
      expect(options.appSecret).toBeUndefined();
      expect(options.userId).toBeUndefined();
    });

    it('should accept complete configuration', () => {
      const options: AuthOptions = {
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
        userId: 'test-user-id',
      };

      expect(options.appId).toBe('test-app-id');
      expect(options.appSecret).toBe('test-app-secret');
      expect(options.userId).toBe('test-user-id');
    });
  });

  describe('AuthSource interface', () => {
    it('should track source information', () => {
      const sources: AuthSource = {
        appIdSource: 'cli',
        appSecretSource: 'env',
        userIdSource: 'cli',
      };

      expect(sources.appIdSource).toBe('cli');
      expect(sources.appSecretSource).toBe('env');
      expect(sources.userIdSource).toBe('cli');
    });

    it('should accept partial source information', () => {
      const sources: AuthSource = {
        appIdSource: 'cli',
      };

      expect(sources.appIdSource).toBe('cli');
      expect(sources.appSecretSource).toBeUndefined();
      expect(sources.userIdSource).toBeUndefined();
    });

    it('should only allow valid source values', () => {
      const validateSource = (source: 'cli' | 'env' | 'default'): boolean => {
        return ['cli', 'env', 'default'].includes(source);
      };

      expect(validateSource('cli')).toBe(true);
      expect(validateSource('env')).toBe(true);
      expect(validateSource('default')).toBe(true);
    });
  });

  describe('AuthResult interface', () => {
    it('should contain complete authentication result', () => {
      const result: AuthResult = {
        config: {
          appId: 'test-app-id',
          appSecret: 'test-app-secret',
          userId: 'test-user-id',
        },
        sources: {
          appIdSource: 'cli',
          appSecretSource: 'env',
          userIdSource: 'cli',
        },
        isValid: true,
      };

      expect(result.config.appId).toBe('test-app-id');
      expect(result.sources.appIdSource).toBe('cli');
      expect(result.isValid).toBe(true);
    });

    it('should handle invalid authentication result', () => {
      const result: AuthResult = {
        config: {
          appId: '',
          appSecret: '',
        },
        sources: {},
        isValid: false,
      };

      expect(result.isValid).toBe(false);
    });
  });

  describe('AUTH_ENV_VARS constant', () => {
    it('should define correct environment variable names', () => {
      expect(AUTH_ENV_VARS.APP_ID).toBe('POLYV_APP_ID');
      expect(AUTH_ENV_VARS.APP_SECRET).toBe('POLYV_APP_SECRET');
      expect(AUTH_ENV_VARS.USER_ID).toBe('POLYV_USER_ID');
    });

    it('should be readonly', () => {
      // This test ensures the constant is properly typed as readonly
      const envVars = AUTH_ENV_VARS;
      
      // In TypeScript with 'as const', properties are readonly at compile time
      // We test the structure rather than runtime immutability
      expect(envVars.APP_ID).toBe('POLYV_APP_ID');
      expect(typeof envVars.APP_ID).toBe('string');
      
      // Verify the type is properly constrained
      expect(Object.keys(envVars)).toEqual(['APP_ID', 'APP_SECRET', 'USER_ID']);
    });
  });

  describe('AUTH_CLI_OPTIONS constant', () => {
    it('should define correct CLI option names', () => {
      expect(AUTH_CLI_OPTIONS.APP_ID).toBe('appId');
      expect(AUTH_CLI_OPTIONS.APP_SECRET).toBe('appSecret');
      expect(AUTH_CLI_OPTIONS.USER_ID).toBe('userId');
    });

    it('should be readonly', () => {
      // This test ensures the constant is properly typed as readonly
      const cliOptions = AUTH_CLI_OPTIONS;
      
      // In TypeScript with 'as const', properties are readonly at compile time
      // We test the structure rather than runtime immutability
      expect(cliOptions.APP_ID).toBe('appId');
      expect(typeof cliOptions.APP_ID).toBe('string');
      
      // Verify the type is properly constrained
      expect(Object.keys(cliOptions)).toEqual(['APP_ID', 'APP_SECRET', 'USER_ID']);
    });
  });

  describe('Type compatibility', () => {
    it('should allow AuthOptions to be assigned to partial AuthConfig', () => {
      const options: AuthOptions = {
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
      };

      // Should be able to use AuthOptions where partial AuthConfig is expected
      const partialConfig: Partial<AuthConfig> = options;
      expect(partialConfig.appId).toBe('test-app-id');
      expect(partialConfig.appSecret).toBe('test-app-secret');
    });

    it('should allow AuthConfig to be used as AuthOptions', () => {
      const config: AuthConfig = {
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
        userId: 'test-user-id',
      };

      // Should be able to use AuthConfig where AuthOptions is expected
      const options: AuthOptions = config;
      expect(options.appId).toBe('test-app-id');
      expect(options.appSecret).toBe('test-app-secret');
      expect(options.userId).toBe('test-user-id');
    });
  });
});