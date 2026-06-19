/**
 * PolyV Client
 *
 * The main client class for interacting with the PolyV Live API.
 * Provides automatic signature injection, error handling, and request management.
 *
 * @module client
 */

import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosError } from 'axios';
import { generateSignature } from './auth/signature.js';
import { PolyVAPIError } from './errors/polyv-api-error.js';
import { ChannelService } from './services/channel.service.js';
import { ChatService } from './services/chat.service.js';
import { LiveInteractionService } from './services/live-interaction.service.js';
import { AccountService } from './services/account.service.js';
import { WebService } from './services/web.service.js';
import { PlatformService } from './services/platform.service.js';
import { FinanceService } from './services/finance.service.js';
import { GroupService } from './services/group.service.js';
import { PlayerService } from './services/player.service.js';
import { OtherService } from './services/other.service.js';
import { V4AiService } from './services/v4/ai.service.js';
import { V4RobotService } from './services/v4/robot.service.js';
import { V4ChannelService } from './services/v4/channel.service.js';
import { V4ChatService } from './services/v4/chat.service.js';
import { V4StatisticsService } from './services/v4/statistics.service.js';
import { V4UserService } from './services/v4/user.service.js';
import { V4GlobalService } from './services/v4/global.service.js';
import { V4GroupService } from './services/v4/group.service.js';
import { V4MaterialService } from './services/v4/material.service.js';
import { V4PlatformService } from './services/v4/platform.service.js';
import { V4WebAppService } from './services/v4/webapp.service.js';
import { StatisticsService } from './services/statistics.service.js';
import type { RequestOptions } from './types/request.js';
import type { ApiVersion } from './types/version.js';
import type { PolyVClientConfig, ResolvedClientConfig } from './types/client.js';

/**
 * Version-specific base URLs (for reference, services should include version in their paths)
 */
const VERSION_BASE_URLS: Record<ApiVersion, string> = {
  v3: 'https://api.polyv.net/live/v3',
  v4: 'https://api.polyv.net/live/v4',
};

/**
 * Default client configuration
 */
const DEFAULT_CONFIG: Omit<ResolvedClientConfig, 'appId' | 'appSecret'> = {
  baseUrl: 'https://api.polyv.net',
  liveBgBaseUrl: 'https://live.polyv.net',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'polyv-live-api-sdk/1.0.0',
  },
  version: 'v3',
};

/**
 * PolyVClient
 *
 * The main client for interacting with PolyV Live API.
 *
 * @example
 * ```typescript
 * const client = new PolyVClient({
 *   appId: 'your-app-id',
 *   appSecret: 'your-app-secret'
 * });
 *
 * // Make a request
 * const channels = await client.get('/channel/list', { page: 1 });
 * ```
 */
export class PolyVClient {
  /**
   * Resolved configuration with defaults applied
   */
  readonly config: ResolvedClientConfig;

  /**
   * Axios HTTP client instance
   */
  readonly httpClient: AxiosInstance;

  /**
   * Channel service for managing live channels
   */
  readonly channel: ChannelService;

  /**
   * Statistics service for managing statistics operations
   */
  readonly statistics: StatisticsService;

  /**
   * Chat service for managing chat messages
   */
  readonly chat: ChatService;

  /**
   * Live interaction service for managing interactions (lottery, questionnaire, checkin, questions)
   */
  readonly liveInteraction!: LiveInteractionService;

  /**
   * Account service for managing account operations
   */
  readonly account!: AccountService;

  /**
   * Web service for managing web page operations
   */
  readonly web!: WebService;

  /**
   * Platform service for managing platform operations
   */
  readonly platform!: PlatformService;

  /**
   * V4 AI service for managing AI and digital human operations
   */
  readonly v4Ai!: V4AiService;

  /**
   * V4 Robot service for managing robot operations
   */
  readonly v4Robot!: V4RobotService;

  /**
   * V4 Channel service for managing channel operations
   */
  readonly v4Channel!: V4ChannelService;

  /**
   * V4 Chat service for managing chat operations
   */
  readonly v4Chat!: V4ChatService;

  /**
   * V4 Statistics service for managing statistics operations
   */
  readonly v4Statistics!: V4StatisticsService;

  /**
   * V4 User service for managing user operations
   */
  readonly v4User!: V4UserService;

  /**
   * V4 Global service for managing global settings
   */
  readonly v4Global!: V4GlobalService;

  /**
   * V4 Group service for managing group operations
   */
  readonly v4Group!: V4GroupService;

  /**
   * V4 Material service for managing material library
   */
  readonly v4Material!: V4MaterialService;

  /**
   * V4 Platform service for managing coupons
   */
  readonly v4Platform!: V4PlatformService;

  /**
   * V4 WebApp service for managing permissions and roles
   */
  readonly v4WebApp!: V4WebAppService;

  /**
   * Finance service for managing audio/video moderation
   */
  readonly finance!: FinanceService;

  /**
   * Group service for managing group account resources
   */
  readonly group!: GroupService;

  /**
   * Player service for managing player settings (anti-record, adverts, logo, watch feedback)
   */
  readonly player!: PlayerService;

  /**
   * Other service for managing miscellaneous operations
   */
  readonly other!: OtherService;

  /**
   * Create a new PolyVClient instance
   *
   * @param config - Client configuration options
   */
  constructor(config: PolyVClientConfig) {
    // Resolve configuration with defaults
    this.config = {
      appId: config.appId,
      appSecret: config.appSecret,
      baseUrl: config.baseUrl ?? DEFAULT_CONFIG.baseUrl,
      liveBgBaseUrl: config.liveBgBaseUrl ?? DEFAULT_CONFIG.liveBgBaseUrl,
      timeout: config.timeout ?? DEFAULT_CONFIG.timeout,
      headers: {
        ...DEFAULT_CONFIG.headers,
        ...config.headers,
      },
      version: config.version ?? DEFAULT_CONFIG.version,
    };

    // Create HTTP client with interceptors
    this.httpClient = this.createHttpClient();

    // Initialize services
    this.channel = new ChannelService(this);
    this.statistics = new StatisticsService(this);
    this.chat = new ChatService(this);
    this.liveInteraction = new LiveInteractionService(this);
    this.account = new AccountService(this);
    this.web = new WebService(this);
    this.platform = new PlatformService(this);
    this.v4Ai = new V4AiService(this);
    this.v4Robot = new V4RobotService(this);
    this.v4Channel = new V4ChannelService(this);
    this.v4Chat = new V4ChatService(this);
    this.v4Statistics = new V4StatisticsService(this);
    this.v4User = new V4UserService(this);
    this.v4Global = new V4GlobalService(this);
    this.v4Group = new V4GroupService(this);
    this.v4Material = new V4MaterialService(this);
    this.v4Platform = new V4PlatformService(this);
    this.v4WebApp = new V4WebAppService(this);
    this.finance = new FinanceService(this);
    this.group = new GroupService(this);
    this.player = new PlayerService(this);
    this.other = new OtherService(this);
  }

  /**
   * Create and configure the Axios HTTP client with interceptors
   */
  private createHttpClient(): AxiosInstance {
    const client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: this.config.headers,
    });

    // Request interceptor - auto-inject signature
    client.interceptors.request.use(
      (config) => {
        // Skip auth injection if requested (for multipart/form-data)
        if (config.headers?.['X-Skip-Auth']) {
          delete config.headers['X-Skip-Auth'];
          return config;
        }

        const timestamp = Date.now();

        // Build signature params from existing params
        const signatureParams: Record<string, unknown> = {
          appId: this.config.appId,
          timestamp,
          ...config.params,
        };

        // Generate signature
        const { sign } = generateSignature(signatureParams, {
          appSecret: this.config.appSecret,
        });

        // Inject auth params
        config.params = {
          ...config.params,
          appId: this.config.appId,
          timestamp,
          sign,
        };

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - extract data and handle errors
    // Note: We use 'as any' here because the interceptor transforms the response type
    // from AxiosResponse to the extracted data, which TypeScript can't express in the type system
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    client.interceptors.response.use(
      (response: any): any => {
        // Some historical endpoints return a raw text body instead of the standard
        // { code, data } envelope. /live_status/query returns exactly "live" or "end".
        if (typeof response.data === 'string') {
          const rawStatus = response.data.trim();
          if (rawStatus === 'live' || rawStatus === 'end') {
            return rawStatus;
          }
        }

        // Check for API success
        if (response.data?.code === 200) {
          // Extract and return data field directly
          return response.data.data;
        }

        // API returned an error response
        throw new PolyVAPIError(
          response.data?.error?.desc || response.data?.message || 'API Error',
          response.data?.code ?? response.status,
          {
            polyvCode: response.data?.error?.code,
            polyvMessage: response.data?.error?.desc,
          }
        );
      },
      (error: AxiosError | Error): never => {
        // Transform axios errors to PolyVAPIError
        throw this.transformAxiosError(error);
      }
    );

    return client;
  }

  /**
   * Transform Axios errors to PolyVAPIError
   */
  private transformAxiosError(error: unknown): PolyVAPIError {
    // Handle request cancellation
    if (axios.isCancel(error)) {
      return new PolyVAPIError('Request cancelled', 0, {
        code: 'REQUEST_CANCELLED',
      });
    }

    // Handle Axios errors
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with non-2xx status
        const { status, data } = error.response;
        return new PolyVAPIError(
          data?.message || data?.error?.desc || error.message || 'API Error',
          status,
          {
            polyvCode: data?.error?.code,
            polyvMessage: data?.error?.desc,
          }
        );
      } else if (error.request) {
        // Request was made but no response received
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
          return new PolyVAPIError('Request timeout', 0, {
            code: 'TIMEOUT',
          });
        }
        return new PolyVAPIError('No response from server', 0, {
          code: 'NO_RESPONSE',
        });
      }
    }

    // Handle other errors
    return new PolyVAPIError(
      error instanceof Error ? error.message : 'Unknown error',
      0,
      { code: 'UNKNOWN_ERROR' }
    );
  }

  /**
   * Make a generic HTTP request
   *
   * @param config - Axios request configuration
   * @returns Response data (extracted from API response)
   */
  async request<T = unknown>(config: AxiosRequestConfig & RequestOptions): Promise<T> {
    const axiosConfig: AxiosRequestConfig = {
      ...config,
      signal: config.signal,
      timeout: config.timeout,
      headers: config.headers ? { ...config.headers } : undefined,
    };

    return this.httpClient.request(axiosConfig) as Promise<T>;
  }

  /**
   * Make a GET request
   *
   * @param url - Request URL path
   * @param params - Query parameters
   * @param options - Additional request options
   * @returns Response data
   */
  async get<T = unknown>(
    url: string,
    params?: Record<string, unknown>,
    options?: RequestOptions
  ): Promise<T> {
    return this.httpClient.get(url, {
      params,
      signal: options?.signal,
      timeout: options?.timeout,
      headers: options?.headers,
    }) as Promise<T>;
  }

  /**
   * Make a POST request
   *
   * @param url - Request URL path
   * @param data - Request body data
   * @param options - Additional request options
   * @returns Response data
   */
  async post<T = unknown>(
    url: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.httpClient.post(url, data, {
      signal: options?.signal,
      timeout: options?.timeout,
      headers: options?.headers,
    }) as Promise<T>;
  }

  /**
   * Make a PUT request
   *
   * @param url - Request URL path
   * @param data - Request body data
   * @param options - Additional request options
   * @returns Response data
   */
  async put<T = unknown>(
    url: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.httpClient.put(url, data, {
      signal: options?.signal,
      timeout: options?.timeout,
      headers: options?.headers,
    }) as Promise<T>;
  }

  /**
   * Make a DELETE request
   *
   * @param url - Request URL path
   * @param params - Query parameters
   * @param options - Additional request options
   * @returns Response data
   */
  async delete<T = unknown>(
    url: string,
    params?: Record<string, unknown>,
    options?: RequestOptions
  ): Promise<T> {
    return this.httpClient.delete(url, {
      params,
      signal: options?.signal,
      timeout: options?.timeout,
      headers: options?.headers,
    }) as Promise<T>;
  }

  /**
   * Make a PATCH request
   *
   * @param url - Request URL path
   * @param data - Request body data
   * @param options - Additional request options
   * @returns Response data
   */
  async patch<T = unknown>(
    url: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.httpClient.patch(url, data, {
      signal: options?.signal,
      timeout: options?.timeout,
      headers: options?.headers,
    }) as Promise<T>;
  }
}
