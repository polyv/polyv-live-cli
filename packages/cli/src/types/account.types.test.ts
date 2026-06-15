/**
 * Tests for account types and utility functions
 */

import {
  getAccountBaseUrl,
  getEnvironmentLabel,
  ENVIRONMENT_BASE_URLS,
  AccountConfig,
  AccountConfigValidation
} from './account.types';

describe('account.types', () => {
  describe('ENVIRONMENT_BASE_URLS', () => {
    it('should have development URL', () => {
      expect(ENVIRONMENT_BASE_URLS.development).toBe('https://api-dev.polyv.net');
    });

    it('should have production URL', () => {
      expect(ENVIRONMENT_BASE_URLS.production).toBe('https://api.polyv.net');
    });

    it('should have test URL', () => {
      expect(ENVIRONMENT_BASE_URLS.test).toBe('https://develop-3-api.polyv.net');
    });
  });

  describe('AccountConfigValidation', () => {
    it('should have name validation rules', () => {
      expect(AccountConfigValidation.name.required).toBe(true);
      expect(AccountConfigValidation.name.pattern).toBeInstanceOf(RegExp);
      expect(AccountConfigValidation.name.maxLength).toBe(50);
    });

    it('should have appId validation rules', () => {
      expect(AccountConfigValidation.appId.required).toBe(true);
      expect(AccountConfigValidation.appId.minLength).toBe(8);
      expect(AccountConfigValidation.appId.maxLength).toBe(32);
    });

    it('should have appSecret validation rules', () => {
      expect(AccountConfigValidation.appSecret.required).toBe(true);
      expect(AccountConfigValidation.appSecret.minLength).toBe(16);
      expect(AccountConfigValidation.appSecret.maxLength).toBe(128);
    });

    it('should have environment validation rules', () => {
      expect(AccountConfigValidation.environment.required).toBe(false);
      expect(AccountConfigValidation.environment.validValues).toContain('development');
      expect(AccountConfigValidation.environment.validValues).toContain('production');
      expect(AccountConfigValidation.environment.validValues).toContain('test');
      expect(AccountConfigValidation.environment.validValues).toContain('custom');
    });

    it('should have baseUrl validation rules', () => {
      expect(AccountConfigValidation.baseUrl.required).toBe(false);
      expect(AccountConfigValidation.baseUrl.pattern).toBeInstanceOf(RegExp);
      expect(AccountConfigValidation.baseUrl.maxLength).toBe(200);
    });
  });

  describe('getAccountBaseUrl', () => {
    it('should return custom baseUrl when provided', () => {
      const account: AccountConfig = {
        name: 'test',
        appId: 'test1234',
        appSecret: 'secret12345678901',
        baseUrl: 'https://custom.api.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };
      expect(getAccountBaseUrl(account)).toBe('https://custom.api.com');
    });

    it('should return development URL for development environment', () => {
      const account: AccountConfig = {
        name: 'test',
        appId: 'test1234',
        appSecret: 'secret12345678901',
        environment: 'development',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };
      expect(getAccountBaseUrl(account)).toBe('https://api-dev.polyv.net');
    });

    it('should return production URL for production environment', () => {
      const account: AccountConfig = {
        name: 'test',
        appId: 'test1234',
        appSecret: 'secret12345678901',
        environment: 'production',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };
      expect(getAccountBaseUrl(account)).toBe('https://api.polyv.net');
    });

    it('should return test URL for test environment', () => {
      const account: AccountConfig = {
        name: 'test',
        appId: 'test1234',
        appSecret: 'secret12345678901',
        environment: 'test',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };
      expect(getAccountBaseUrl(account)).toBe('https://develop-3-api.polyv.net');
    });

    it('should return production URL for custom environment without baseUrl', () => {
      const account: AccountConfig = {
        name: 'test',
        appId: 'test1234',
        appSecret: 'secret12345678901',
        environment: 'custom',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };
      expect(getAccountBaseUrl(account)).toBe('https://api.polyv.net');
    });

    it('should return production URL when no environment or baseUrl provided', () => {
      const account: AccountConfig = {
        name: 'test',
        appId: 'test1234',
        appSecret: 'secret12345678901',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };
      expect(getAccountBaseUrl(account)).toBe('https://api.polyv.net');
    });

    it('should prioritize custom baseUrl over environment', () => {
      const account: AccountConfig = {
        name: 'test',
        appId: 'test1234',
        appSecret: 'secret12345678901',
        environment: 'development',
        baseUrl: 'https://custom.api.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };
      expect(getAccountBaseUrl(account)).toBe('https://custom.api.com');
    });
  });

  describe('getEnvironmentLabel', () => {
    it('should return "custom" when environment is custom with baseUrl', () => {
      const account: AccountConfig = {
        name: 'test',
        appId: 'test1234',
        appSecret: 'secret12345678901',
        environment: 'custom',
        baseUrl: 'https://custom.api.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };
      expect(getEnvironmentLabel(account)).toBe('custom');
    });

    it('should return environment value when provided and not custom with baseUrl', () => {
      const account: AccountConfig = {
        name: 'test',
        appId: 'test1234',
        appSecret: 'secret12345678901',
        environment: 'development',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };
      expect(getEnvironmentLabel(account)).toBe('development');
    });

    it('should return "production" when no environment provided', () => {
      const account: AccountConfig = {
        name: 'test',
        appId: 'test1234',
        appSecret: 'secret12345678901',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };
      expect(getEnvironmentLabel(account)).toBe('production');
    });

    it('should return "custom" when custom environment with no baseUrl', () => {
      const account: AccountConfig = {
        name: 'test',
        appId: 'test1234',
        appSecret: 'secret12345678901',
        environment: 'custom',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };
      expect(getEnvironmentLabel(account)).toBe('custom');
    });

    it('should return environment when production with baseUrl', () => {
      const account: AccountConfig = {
        name: 'test',
        appId: 'test1234',
        appSecret: 'secret12345678901',
        environment: 'production',
        baseUrl: 'https://custom.api.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };
      expect(getEnvironmentLabel(account)).toBe('production');
    });
  });
});
