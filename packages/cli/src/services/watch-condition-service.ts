/**
 * @fileoverview SDK wrapper for watch condition operations
 * @author Development Team
 * @since 12.3.0
 */

import { PolyVClient } from 'polyv-live-api-sdk';
import { AuthConfig } from '../types/auth';
import type { WatchConditionServiceConfig, ConfigAuthSetting } from '../types/watch-condition';
import { PolyVError } from '../utils/errors';

/** Web service interface with watch condition methods */
interface WebServiceWithWatchCondition {
  getWatchCondition(params: { channelId?: string }): Promise<any[]>;
  setWatchCondition(params: { channelId?: string; authSettings: ConfigAuthSetting[] }): Promise<string>;
}

/**
 * SDK wrapper for watch condition operations
 * Encapsulates WebService watch condition methods
 */
export class WatchConditionServiceSdk {
  private readonly client: PolyVClient;
  private readonly web: WebServiceWithWatchCondition;

  /**
   * Creates a new WatchConditionServiceSdk instance
   * @param authConfig Authentication configuration
   * @param _serviceConfig Service configuration (currently unused but required for consistency)
   */
  constructor(authConfig: AuthConfig, _serviceConfig?: WatchConditionServiceConfig) {
    this.client = new PolyVClient(authConfig);
    this.web = this.client.web as unknown as WebServiceWithWatchCondition;
  }

  /**
   * Get watch condition settings
   * @param params Get watch condition parameters
   * @returns Promise resolving to watch condition response array
   */
  async getWatchCondition(params: { channelId?: string }): Promise<any[]> {
    try {
      const result = await this.web.getWatchCondition(params);
      return result;
    } catch (error) {
      throw this.wrapError(error, 'getWatchCondition');
    }
  }

  /**
   * Set watch condition settings
   * @param params Set watch condition parameters
   * @returns Promise resolving to "success" string
   */
  async setWatchCondition(params: { channelId?: string; authSettings: ConfigAuthSetting[] }): Promise<string> {
    try {
      const result = await this.web.setWatchCondition(params);
      return result;
    } catch (error) {
      throw this.wrapError(error, 'setWatchCondition');
    }
  }

  /**
   * Wrap SDK errors with PolyVError for consistent error handling
   */
  private wrapError(error: unknown, operation: string): PolyVError {
    if (error instanceof PolyVError) {
      return error;
    }
    const message = error instanceof Error ? error.message : String(error);
    return new PolyVError(
      `${operation} failed: ${message}`,
      'WATCH_CONDITION_API_ERROR',
      1,
      { originalError: error }
    );
  }
}
