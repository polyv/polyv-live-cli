/**
 * Authentication adapter for backward compatibility with existing services
 */

import { AuthConfig } from '../types/auth';
import { AuthenticationProvider } from '../types/auth-source.types';
import { DefaultAuthenticationProvider } from './auth-provider';
import { ConfigurationError } from '../utils/errors';

/**
 * Authentication adapter that provides backward compatibility
 * Converts new authentication provider to legacy AuthConfig format
 */
export class AuthenticationAdapter {
  private authProvider: AuthenticationProvider;

  constructor(authProvider?: AuthenticationProvider) {
    this.authProvider = authProvider || new DefaultAuthenticationProvider();
  }

  /**
   * Get authentication configuration in legacy format
   * @param options Optional command line options
   * @returns AuthConfig or throws error if authentication not available
   * @throws {ConfigurationError} When authentication is not available
   */
  public getAuthConfig(options?: Record<string, unknown>): AuthConfig {
    const credentials = this.authProvider.getCredentials(options);
    
    if (!credentials) {
      const statusMessage = this.authProvider.getStatusMessage(options);
      throw new ConfigurationError(statusMessage);
    }

    return {
      appId: credentials.appId,
      appSecret: credentials.appSecret,
      ...(credentials.userId && { userId: credentials.userId }),
    };
  }

  /**
   * Get authentication configuration with source information
   * @param options Optional command line options
   * @returns AuthConfig with source metadata or null if not available
   */
  public tryGetAuthConfig(options?: Record<string, unknown>): {
    config: AuthConfig;
    source: string;
    accountName?: string;
  } | null {
    // Check if CLI auth is explicitly attempted but incomplete
    if (options) {
      const cliAppId = options['appId'] as string | undefined;
      const cliAppSecret = options['appSecret'] as string | undefined;
      const hasCliAuthAttempt = cliAppId || cliAppSecret;
      
      if (hasCliAuthAttempt && (!cliAppId || !cliAppSecret)) {
        // CLI auth was attempted but incomplete - don't fall back to other sources
        return null;
      }
    }
    
    const context = this.authProvider.getAuthenticationContext(options);
    
    if (!context) {
      return null;
    }

    return {
      config: {
        appId: context.credentials.appId,
        appSecret: context.credentials.appSecret,
        ...(context.credentials.userId && { userId: context.credentials.userId }),
      },
      source: context.source.metadata.source,
      ...(context.source.metadata.accountName && { accountName: context.source.metadata.accountName }),
    };
  }

  /**
   * Check if authentication is available
   * @param options Optional command line options
   * @returns Whether authentication is available
   */
  public isAuthenticationAvailable(options?: Record<string, unknown>): boolean {
    return this.authProvider.getCredentials(options) !== null;
  }

  /**
   * Get authentication status message
   * @param options Optional command line options
   * @returns Status message with guidance
   */
  public getStatusMessage(options?: Record<string, unknown>): string {
    // Check if CLI auth is explicitly attempted but incomplete
    if (options) {
      const cliAppId = options['appId'] as string | undefined;
      const cliAppSecret = options['appSecret'] as string | undefined;
      const hasCliAuthAttempt = cliAppId || cliAppSecret;
      
      if (hasCliAuthAttempt && (!cliAppId || !cliAppSecret)) {
        return 'Auth configuration is incomplete';
      }
    }
    
    return this.authProvider.getStatusMessage(options);
  }

  /**
   * Get detailed authentication diagnostics
   * @param options Optional command line options
   * @returns Diagnostic information
   */
  public getDiagnostics(options?: Record<string, unknown>) {
    return this.authProvider.getDiagnostics(options);
  }
}

/**
 * Global authentication adapter instance
 */
export const authAdapter = new AuthenticationAdapter();
