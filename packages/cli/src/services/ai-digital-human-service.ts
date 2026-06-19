/**
 * @fileoverview AI Digital Human service SDK wrapper
 * @author Development Team
 * @since 14.4.0
 */

import { PolyVClient } from 'polyv-live-api-sdk';
import { AuthConfig } from '../types/auth';
import {
  AIDigitalHumanServiceConfig,
  AIDigitalHumanListResponse,
  AIDigitalHumanOrganization,
  SetOrganizationParams,
} from '../types/ai-digital-human';

/**
 * SDK wrapper for AI Digital Human operations
 */
export class AIDigitalHumanServiceSdk {
  private readonly client: PolyVClient;
  private readonly v4Ai: PolyVClient['v4Ai'];

  /**
   * Creates a new AIDigitalHumanServiceSdk instance
   * @param authConfig Authentication configuration
   * @param config Optional service configuration (defaults to standard PolyV API settings)
   */
  constructor(authConfig: AuthConfig, config?: AIDigitalHumanServiceConfig) {
    this.client = new PolyVClient({
      appId: authConfig.appId,
      appSecret: authConfig.appSecret,
      baseUrl: config?.baseUrl || 'https://api.polyv.net',
    });
    this.v4Ai = this.client.v4Ai;
  }

  /**
   * Lists AI Digital Humans with pagination
   * @param pageNumber Page number (default: 1)
   * @param pageSize Page size (default: 10, max: 1000)
   * @returns Promise that resolves with paginated digital human list
   */
  async listDigitalHumans(pageNumber: number = 1, pageSize: number = 10): Promise<AIDigitalHumanListResponse> {
    if (pageNumber < 1) {
      throw new Error('pageNumber must be greater than 0');
    }

    if (pageSize < 1) {
      throw new Error('pageSize must be greater than 0');
    }

    // Cap pageSize at 1000
    const cappedPageSize = Math.min(pageSize, 1000);

    const result = await this.v4Ai.listDigitalHumans({
      pageNumber,
      pageSize: cappedPageSize,
    });

    return this.unwrapData<AIDigitalHumanListResponse>(result) || {
      pageNumber: 1,
      pageSize: 10,
      totalPages: 0,
      totalItems: 0,
      contents: [],
    };
  }

  /**
   * Lists organization associations for AI Digital Humans
   * @param aiDigitalHumanIds Comma-separated AI Digital Human IDs (max: 100)
   * @returns Promise that resolves with organization associations
   */
  async listOrganizations(aiDigitalHumanIds: string): Promise<AIDigitalHumanOrganization[]> {
    if (!aiDigitalHumanIds || aiDigitalHumanIds.trim() === '') {
      throw new Error('aiDigitalHumanIds is required');
    }

    const ids = aiDigitalHumanIds.split(',').map(id => id.trim()).filter(id => id.length > 0);

    if (ids.length > 100) {
      throw new Error(`aiDigitalHumanIds count (${ids.length}) exceeds maximum of 100`);
    }

    const result = await this.v4Ai.listOrganizations({ aiDigitalHumanIds });
    return this.unwrapData<AIDigitalHumanOrganization[]>(result) || [];
  }

  /**
   * Sets organization associations for AI Digital Humans
   * @param params Array of organization association settings (max: 100 items)
   * @returns Promise that resolves with success status
   */
  async setOrganizations(params: SetOrganizationParams[]): Promise<boolean> {
    if (!params || params.length === 0) {
      throw new Error('config is required');
    }

    if (params.length > 100) {
      throw new Error(`config count (${params.length}) exceeds maximum of 100`);
    }

    await this.v4Ai.setOrganizations({ items: params });

    return true;
  }

  private unwrapData<T>(value: unknown): T | undefined {
    if (value && typeof value === 'object' && 'data' in value) {
      return (value as { data: T }).data;
    }
    return value as T;
  }
}
