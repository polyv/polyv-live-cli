import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { PolyVClient } from '../client.js';
import { PolyVValidationError } from '../errors/polyv-validation-error.js';
import { ChannelService } from './channel.service.js';

const mockHttpClient = {
  get: vi.fn(),
  post: vi.fn(),
};

const mockClient = {
  httpClient: mockHttpClient,
  config: {
    liveBgBaseUrl: 'https://live.polyv.net',
  },
} as unknown as PolyVClient;

describe('ChannelService channel viewer backend APIs', () => {
  let service: ChannelService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ChannelService(mockClient);
  });

  it('lists channel viewer groups with default user scope and skip-auth', async () => {
    const mockResponse = [{ id: 1, channelId: 123456, name: 'VIP', viewerCount: 2 }];
    mockHttpClient.get.mockResolvedValueOnce(mockResponse);

    const result = await service.listChannelViewerGroups({ channelId: 123456 });

    expect(result).toEqual(mockResponse);
    expect(mockHttpClient.get).toHaveBeenCalledWith(
      '/live-bg/v3/user/channel-viewer/group/list',
      {
        params: { channelId: 123456 },
        baseURL: 'https://live.polyv.net',
        headers: { 'X-Skip-Auth': 'true' },
      }
    );
  });

  it('creates channel viewer group with teacher scope', async () => {
    const mockResponse = { id: 1, channelId: 123456, name: 'VIP', viewerCount: 0 };
    mockHttpClient.post.mockResolvedValueOnce(mockResponse);

    const result = await service.createChannelViewerGroup({
      scope: 'teacher',
      channelId: 123456,
      name: 'VIP',
    });

    expect(result).toEqual(mockResponse);
    expect(mockHttpClient.post).toHaveBeenCalledWith(
      '/live-bg/v3/teacher/channel-viewer/group/save',
      { channelId: 123456, name: 'VIP' },
      {
        baseURL: 'https://live.polyv.net',
        headers: { 'X-Skip-Auth': 'true' },
      }
    );
  });

  it('updates and deletes channel viewer groups with body params', async () => {
    mockHttpClient.post.mockResolvedValue({});

    await service.updateChannelViewerGroup({ channelId: 123456, id: 1, name: 'Core' });
    await service.deleteChannelViewerGroup({ scope: 'teacher', channelId: 123456, id: 1 });

    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      1,
      '/live-bg/v3/user/channel-viewer/group/update',
      { channelId: 123456, id: 1, name: 'Core' },
      {
        baseURL: 'https://live.polyv.net',
        headers: { 'X-Skip-Auth': 'true' },
      }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      2,
      '/live-bg/v3/teacher/channel-viewer/group/delete',
      { channelId: 123456, id: 1 },
      {
        baseURL: 'https://live.polyv.net',
        headers: { 'X-Skip-Auth': 'true' },
      }
    );
  });

  it('gets and updates channel viewer group setting', async () => {
    const mockSetting = {
      channelViewerGroupEnabled: 'Y' as const,
      notInGroupWatchEnabled: 'N' as const,
    };
    mockHttpClient.get.mockResolvedValueOnce(mockSetting);
    mockHttpClient.post.mockResolvedValueOnce({});

    const result = await service.getChannelViewerGroupSetting({
      scope: 'teacher',
      channelId: 123456,
    });
    await service.updateChannelViewerGroupSetting({
      channelId: 123456,
      channelViewerGroupEnabled: 'Y',
      notInGroupWatchEnabled: 'N',
    });

    expect(result).toEqual(mockSetting);
    expect(mockHttpClient.get).toHaveBeenCalledWith(
      '/live-bg/v3/teacher/channel-viewer/group-setting/get',
      {
        params: { channelId: 123456 },
        baseURL: 'https://live.polyv.net',
        headers: { 'X-Skip-Auth': 'true' },
      }
    );
    expect(mockHttpClient.post).toHaveBeenCalledWith(
      '/live-bg/v3/user/channel-viewer/group-setting/update',
      {
        channelViewerGroupEnabled: 'Y',
        notInGroupWatchEnabled: 'N',
      },
      {
        params: { channelId: 123456 },
        baseURL: 'https://live.polyv.net',
        headers: { 'X-Skip-Auth': 'true' },
      }
    );
  });

  it('lists and exports channel viewers with query params', async () => {
    const mockList = {
      pageNumber: 1,
      pageSize: 20,
      totalPages: 1,
      totalItems: 1,
      contents: [{ id: 1, channelId: 123456, viewerId: 'viewer_001' }],
    };
    mockHttpClient.get.mockResolvedValueOnce(mockList).mockResolvedValueOnce('task_001');

    const listResult = await service.listChannelViewers({
      scope: 'teacher',
      channelId: 123456,
      groupId: 1,
      nickname: 'Alice',
      pageNumber: 1,
      pageSize: 20,
    });
    const exportResult = await service.exportChannelViewers({ channelId: 123456, groupId: 1 });

    expect(listResult).toEqual(mockList);
    expect(exportResult).toBe('task_001');
    expect(mockHttpClient.get).toHaveBeenNthCalledWith(
      1,
      '/live-bg/v3/teacher/channel-viewer/list/list',
      {
        params: {
          channelId: 123456,
          groupId: 1,
          nickname: 'Alice',
          pageNumber: 1,
          pageSize: 20,
        },
        baseURL: 'https://live.polyv.net',
        headers: { 'X-Skip-Auth': 'true' },
      }
    );
    expect(mockHttpClient.get).toHaveBeenNthCalledWith(
      2,
      '/live-bg/v3/user/channel-viewer/list/export',
      {
        params: { channelId: 123456, groupId: 1 },
        baseURL: 'https://live.polyv.net',
        headers: { 'X-Skip-Auth': 'true' },
      }
    );
  });

  it('adds, deletes, and transfers channel viewers with JSON body params', async () => {
    mockHttpClient.post.mockResolvedValue({});

    await service.addChannelViewers({
      channelId: 123456,
      groupId: 1,
      viewerIds: ['viewer_001'],
    });
    await service.deleteChannelViewers({
      scope: 'teacher',
      channelId: 123456,
      viewerIds: ['viewer_001'],
    });
    await service.transferChannelViewers({
      channelId: 123456,
      targetGroupId: 2,
      viewerIds: ['viewer_001'],
    });

    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      1,
      '/live-bg/v3/user/channel-viewer/list/save',
      { channelId: 123456, groupId: 1, viewerIds: ['viewer_001'] },
      {
        baseURL: 'https://live.polyv.net',
        headers: { 'X-Skip-Auth': 'true' },
      }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      2,
      '/live-bg/v3/teacher/channel-viewer/list/delete',
      { channelId: 123456, viewerIds: ['viewer_001'] },
      {
        baseURL: 'https://live.polyv.net',
        headers: { 'X-Skip-Auth': 'true' },
      }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      3,
      '/live-bg/v3/user/channel-viewer/list/transfer',
      { channelId: 123456, targetGroupId: 2, viewerIds: ['viewer_001'] },
      {
        baseURL: 'https://live.polyv.net',
        headers: { 'X-Skip-Auth': 'true' },
      }
    );
  });

  it('imports channel viewers with multipart form data and query params', async () => {
    const mockResponse = { successCount: 1, failCount: 0 };
    mockHttpClient.post.mockResolvedValueOnce(mockResponse);

    const result = await service.importChannelViewers({
      scope: 'teacher',
      channelId: 123456,
      groupId: 1,
      file: new Blob(['mobile']),
    });

    expect(result).toEqual(mockResponse);
    expect(mockHttpClient.post).toHaveBeenCalledWith(
      '/live-bg/v3/teacher/channel-viewer/list/import',
      expect.any(FormData),
      {
        params: { channelId: 123456, groupId: 1 },
        baseURL: 'https://live.polyv.net',
        headers: {
          'X-Skip-Auth': 'true',
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  });

  it('lists unrelated channel viewers with filters', async () => {
    const mockResponse = {
      pageNumber: 1,
      pageSize: 20,
      totalPages: 1,
      totalItems: 1,
      contents: [{ viewerUnionId: 'viewer_union_001', nickname: 'Alice' }],
    };
    mockHttpClient.get.mockResolvedValueOnce(mockResponse);

    const result = await service.listUnrelatedChannelViewers({
      channelId: 123456,
      searchKeyword: 'Alice',
      labelIds: [1, 2],
      pageNumber: 1,
      pageSize: 20,
    });

    expect(result).toEqual(mockResponse);
    expect(mockHttpClient.get).toHaveBeenCalledWith(
      '/live-bg/v3/user/viewer-record/list-unrelation-channel-viewer',
      {
        params: {
          channelId: 123456,
          searchKeyword: 'Alice',
          labelIds: [1, 2],
          pageNumber: 1,
          pageSize: 20,
        },
        baseURL: 'https://live.polyv.net',
        headers: { 'X-Skip-Auth': 'true' },
      }
    );
  });

  it('validates required and bounded channel viewer params', async () => {
    await expect(service.listChannelViewerGroups({ channelId: '' })).rejects.toThrow(PolyVValidationError);
    await expect(service.createChannelViewerGroup({
      channelId: 123456,
      name: 'x'.repeat(129),
    })).rejects.toThrow(PolyVValidationError);
    await expect(service.addChannelViewers({
      channelId: 123456,
      viewerIds: [],
    })).rejects.toThrow(PolyVValidationError);
    await expect(service.listChannelViewers({
      channelId: 123456,
      pageSize: 1001,
    })).rejects.toThrow(PolyVValidationError);
    await expect(service.listUnrelatedChannelViewers({
      channelId: 123456,
      labelIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    })).rejects.toThrow(PolyVValidationError);
    await expect(service.updateChannelViewerGroupSetting({
      channelId: 123456,
      channelViewerGroupEnabled: 'INVALID' as 'Y',
    })).rejects.toThrow(PolyVValidationError);
  });
});
