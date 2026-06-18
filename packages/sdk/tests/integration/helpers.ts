import { expect } from 'vitest';
import { PolyVClient } from '../../src/index.js';

interface IntegrationConfig {
  appId: string;
  appSecret: string;
  userId?: string;
  channelId?: string;
  baseUrl: string;
}

interface ChannelListResponse {
  contents?: Array<{ channelId?: string | number }>;
}

interface PaginatedResponse<T = unknown> {
  pageNumber: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  contents: T[];
}

export function hasRealCredentials(): boolean {
  return Boolean(process.env.POLYV_APP_ID && process.env.POLYV_APP_SECRET);
}

export function getIntegrationConfig(): IntegrationConfig {
  return {
    appId: process.env.POLYV_APP_ID ?? '',
    appSecret: process.env.POLYV_APP_SECRET ?? '',
    userId: process.env.POLYV_USER_ID,
    channelId: process.env.POLYV_CHANNEL_ID ?? process.env.POLYV_TEST_CHANNEL_ID,
    baseUrl: process.env.POLYV_BASE_URL ?? process.env.POLYV_TEST_BASE_URL ?? 'https://api.polyv.net',
  };
}

export function createIntegrationClient(): PolyVClient {
  const config = getIntegrationConfig();

  return new PolyVClient({
    appId: config.appId,
    appSecret: config.appSecret,
    baseUrl: config.baseUrl,
    timeout: 30000,
  });
}

export function expectPaginatedResponse(response: PaginatedResponse): void {
  expect(response).toEqual(expect.objectContaining({
    pageNumber: expect.any(Number),
    pageSize: expect.any(Number),
    totalItems: expect.any(Number),
    totalPages: expect.any(Number),
    contents: expect.any(Array),
  }));
}

export async function discoverChannelId(client: PolyVClient): Promise<string | undefined> {
  const configuredChannelId = getIntegrationConfig().channelId;
  if (configuredChannelId) {
    return configuredChannelId;
  }

  const attempts: Array<() => Promise<ChannelListResponse>> = [
    () => client.v4Channel.channelDetailList({ pageNumber: 1, pageSize: 1 }),
    () => client.account.channels({ page: 1, pageSize: 1 }),
    () => client.account.userChannelBasicList({ page: 1, pageSize: 1 }),
    () => client.account.getSimpleChannelList({ page: 1, pageSize: 1 }),
    () => client.v4Channel.channelSimpleList({ pageNumber: 1, pageSize: 1 }),
    () => client.v4Channel.listChannelBasic({ pageNumber: 1, pageSize: 1 }),
  ];

  for (const attempt of attempts) {
    try {
      const response = await attempt();
      const channelId = response.contents?.[0]?.channelId;
      if (channelId !== undefined && channelId !== null && String(channelId).trim() !== '') {
        return String(channelId);
      }
    } catch {
      // Some accounts or API versions do not expose every channel-list endpoint.
    }
  }

  return undefined;
}
