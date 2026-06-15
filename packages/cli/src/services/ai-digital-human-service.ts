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

    const response = await this.client.httpClient.get<{ data: AIDigitalHumanListResponse }>(
      '/live/v4/ai/digital-human/list',
      {
        params: {
          pageNumber,
          pageSize: cappedPageSize,
        },
      }
    );

    const data = response as unknown as { data: AIDigitalHumanListResponse };
    return data?.data || {
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

    const response = await this.client.httpClient.get<{ data: AIDigitalHumanOrganization[] }>(
      '/live/v4/ai/digital-human/list-organization',
      {
        params: {
          aiDigitalHumanIds,
        },
      }
    );

    const data = response as unknown as { data: AIDigitalHumanOrganization[] };
    return data?.data || [];
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

    await this.client.httpClient.post(
      '/live/v4/ai/digital-human/set-organizations',
      params
    );

    return true;
  }
}
