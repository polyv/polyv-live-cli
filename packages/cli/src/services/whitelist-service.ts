/**
 * @fileoverview SDK wrapper for whitelist operations
 * @author Development Team
 * @since 12.4.0
 */

import { PolyVClient } from 'polyv-live-api-sdk';
import { AuthConfig } from '../types/auth';
import type { WhitelistServiceConfig } from '../types/whitelist';
import { PolyVError } from '../utils/errors';

// Define types locally since SDK may not export them
interface LocalGetWhiteListParams {
  rank: 1 | 2;
  channelId?: string;
  page?: number;
  pageSize?: number;
  keyword?: string;
}

interface LocalGetWhiteListResponse {
  pageNumber: number;
  totalPages: number;
  pageSize: number;
  contents: LocalWhiteListItem[];
}

interface LocalWhiteListItem {
  name: string;
  phone: string;
}

interface LocalAddWhiteListParams {
  rank: 1 | 2;
  code: string;
  name?: string;
  channelId?: string;
}

/** Extended update params with oldCode for API */
interface LocalUpdateWhiteListParams {
  rank: 1 | 2;
  code: string;
  name?: string;
  channelId?: string;
  oldCode: string;
}

/** Extended delete params with isClear for clear-all functionality */
interface LocalDeleteWhiteListParams {
  rank: 1 | 2;
  isClear: 'Y' | 'N';
  codes?: string;
  channelId?: string;
}

/** Web service interface with whitelist methods */
interface WebServiceWithWhitelist {
  getWhiteList(params: LocalGetWhiteListParams): Promise<LocalGetWhiteListResponse>;
  addWhiteList(params: LocalAddWhiteListParams): Promise<string>;
  updateWhiteList(params: LocalUpdateWhiteListParams): Promise<string>;
  deleteWhiteList(params: LocalDeleteWhiteListParams): Promise<string>;
}

/**
 * SDK wrapper for whitelist operations
 * Encapsulates WebService whitelist methods
 */
export class WhitelistServiceSdk {
  private readonly client: PolyVClient;
  private readonly web: WebServiceWithWhitelist;

  /**
   * Creates a new WhitelistServiceSdk instance
   * @param authConfig Authentication configuration
   * @param _serviceConfig Service configuration (currently unused but required for consistency)
   */
  constructor(authConfig: AuthConfig, _serviceConfig?: WhitelistServiceConfig) {
    this.client = new PolyVClient(authConfig);
    this.web = this.client.web as unknown as WebServiceWithWhitelist;
  }

  /**
   * Get whitelist with pagination
   * @param params Get whitelist parameters
   * @returns Promise resolving to whitelist response
   */
  async getWhiteList(params: LocalGetWhiteListParams): Promise<LocalGetWhiteListResponse> {
    try {
      const result = await this.web.getWhiteList(params);
      return result;
    } catch (error) {
      throw this.wrapError(error, 'getWhiteList');
    }
  }

  /**
   * Add whitelist item
   * @param params Add whitelist parameters
   * @returns Promise resolving to "success" string
   */
  async addWhiteList(params: LocalAddWhiteListParams): Promise<string> {
    try {
      const result = await this.web.addWhiteList(params);
      return result;
    } catch (error) {
      throw this.wrapError(error, 'addWhiteList');
    }
  }

  /**
   * Update whitelist item
   * Note: API requires oldCode parameter to identify the record to update
   * @param params Update whitelist parameters (includes oldCode)
   * @returns Promise resolving to "success" string
   */
  async updateWhiteList(params: LocalUpdateWhiteListParams): Promise<string> {
    try {
      const result = await this.web.updateWhiteList(params);
      return result;
    } catch (error) {
      throw this.wrapError(error, 'updateWhiteList');
    }
  }

  /**
   * Delete whitelist items
   * @param params Delete whitelist parameters (includes isClear for clear-all)
   * @returns Promise resolving to "success" string
   */
  async deleteWhiteList(params: LocalDeleteWhiteListParams): Promise<string> {
    try {
      const result = await this.web.deleteWhiteList(params);
      return result;
    } catch (error) {
      throw this.wrapError(error, 'deleteWhiteList');
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
      'WHITELIST_API_ERROR',
      1,
      { originalError: error }
    );
  }
}
