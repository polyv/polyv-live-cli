/**
 * Authentication provider implementation for unified authentication operations
 */

import {
  AuthenticationProvider,
  AuthenticationContext,
  AuthenticationSource,
} from '../types/auth-source.types';
import { AuthenticationSourceManager } from './auth-source-manager';
import { SessionStateManager } from './session-state';
import { AccountConfigManager } from './account-config';

/**
 * Default authentication provider implementation
 */
export class DefaultAuthenticationProvider implements AuthenticationProvider {
  private sourceManager: AuthenticationSourceManager;

  constructor(
    sessionManager?: SessionStateManager,
    accountManager?: AccountConfigManager
  ) {
    this.sourceManager = new AuthenticationSourceManager(sessionManager, accountManager);
  }

  /**
   * Get authentication context with priority-based source selection
   * @param options Optional command line options
   * @returns Authentication context or null if no valid authentication found
   */
  public getAuthenticationContext(options?: Record<string, unknown>): AuthenticationContext | null {
    const diagnostics = this.sourceManager.getDiagnostics(options);
    const selectedSource = diagnostics.selectedSource;

    if (!selectedSource || !this.sourceManager.isCompleteAuthentication(selectedSource)) {
      return null;
    }

    return {
      source: selectedSource,
      credentials: {
        appId: selectedSource.appId!,
        appSecret: selectedSource.appSecret!,
        ...(selectedSource.userId && { userId: selectedSource.userId }),
      },
      diagnostics: {
        attemptedSources: diagnostics.availableSources.map(s => s.metadata.source),
        selectedReason: `优先级最高的完整认证源 (优先级 ${selectedSource.priority})`,
        warnings: diagnostics.warnings,
        isComplete: true,
      },
    };
  }

  /**
   * Get authentication credentials directly
   * @param options Optional command line options
   * @returns Authentication credentials or null
   */
  public getCredentials(options?: Record<string, unknown>): {
    appId: string;
    appSecret: string;
    userId?: string;
  } | null {
    return this.sourceManager.getCredentials(options);
  }

  /**
   * Get current authentication source information
   * @param options Optional command line options
   * @returns Authentication source or null
   */
  public getCurrentSource(options?: Record<string, unknown>): AuthenticationSource | null {
    return this.sourceManager.getAuthenticationSource(options);
  }

  /**
   * Validate authentication completeness
   * @param source Authentication source to validate
   * @returns Whether authentication is complete
   */
  public validateAuthentication(source: AuthenticationSource): boolean {
    return this.sourceManager.isCompleteAuthentication(source);
  }

  /**
   * Get user-friendly authentication status message
   * @param options Optional command line options
   * @returns Status message with guidance
   */
  public getStatusMessage(options?: Record<string, unknown>): string {
    return this.sourceManager.getStatusMessage(options);
  }

  /**
   * Get detailed authentication diagnostics
   * @param options Optional command line options
   * @returns Diagnostic information
   */
  public getDiagnostics(options?: Record<string, unknown>): {
    availableSources: AuthenticationSource[];
    selectedSource?: AuthenticationSource;
    errors: string[];
    warnings: string[];
    suggestions: string[];
  } {
    return this.sourceManager.getDiagnostics(options);
  }

  /**
   * Get authentication source by type
   * @param type Source type to get
   * @param options Optional command line options
   * @returns Authentication source or null
   */
  public getSourceByType(type: string, options?: Record<string, unknown>): AuthenticationSource | null {
    return this.sourceManager.getSourceByType(type as any, options);
  }

  /**
   * Check if a specific source type is available
   * @param type Source type to check
   * @param options Optional command line options
   * @returns Whether source type is available
   */
  public isSourceAvailable(type: string, options?: Record<string, unknown>): boolean {
    return this.sourceManager.isSourceAvailable(type as any, options);
  }
}

/**
 * Global authentication provider instance
 */
export const authProvider = new DefaultAuthenticationProvider();
