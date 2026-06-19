import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { PolyVClient } from '../client.js';
import { ChannelService } from './channel.service.js';
import { PolyVValidationError } from '../errors/polyv-validation-error.js';
import type {
  ChannelAdvert,
  ChannelProductEnabledResponse,
  GetUserChildrenChannelsResponse,
  ListChannelsFollowResponse,
  ListPptRecordTasksResponse,
  PptRecordSettingResponse,
  TransmitAssociation,
} from '../types/channel.js';

vi.mock('axios', () => ({
  default: {
    create: vi.fn(),
    isCancel: vi.fn(),
    isAxiosError: vi.fn(),
  },
}));

const testConfig = {
  appId: 'test-app-id',
  appSecret: 'test-app-secret',
};

describe('ChannelService historical read-only APIs', () => {
  let mockAxiosInstance: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
    request: ReturnType<typeof vi.fn>;
    interceptors: {
      request: { use: ReturnType<typeof vi.fn> };
      response: { use: ReturnType<typeof vi.fn> };
    };
    defaults: {
      baseURL: string;
      timeout: number;
      headers: Record<string, string>;
    };
  };
  let channelService: ChannelService;

  beforeEach(() => {
    vi.clearAllMocks();

    mockAxiosInstance = {
      get: vi.fn().mockResolvedValue({}),
      post: vi.fn().mockResolvedValue({}),
      put: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({}),
      patch: vi.fn().mockResolvedValue({}),
      request: vi.fn().mockResolvedValue({}),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
      defaults: {
        baseURL: 'https://api.polyv.net/live/v3',
        timeout: 30000,
        headers: {},
      },
    };

    (axios.create as ReturnType<typeof vi.fn>).mockReturnValue(mockAxiosInstance);
    channelService = new ChannelService(new PolyVClient(testConfig));
  });

  it('gets channel adverts', async () => {
    const mockResponse: ChannelAdvert[] = [
      { text: 'ad text', img: '', href: 'https://example.com' },
    ];
    mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

    const result = await channelService.getChannelAdverts('123456');

    expect(mockAxiosInstance.get).toHaveBeenCalledWith(
      '/live/v3/channel/advert/list',
      { params: { channelId: '123456' } }
    );
    expect(result).toEqual(mockResponse);
  });

  it('gets channel product library enabled status', async () => {
    const mockResponse: ChannelProductEnabledResponse = { enabled: 'N' };
    mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

    const result = await channelService.getChannelProductEnabled('123456');

    expect(mockAxiosInstance.get).toHaveBeenCalledWith(
      '/live/v3/channel/product/get-enabled',
      { params: { channelId: '123456' } }
    );
    expect(result.enabled).toBe('N');
  });

  it('gets PPT record setting', async () => {
    const mockResponse: PptRecordSettingResponse = {
      channelId: 123456,
      userId: 'user123',
      type: 0,
      globalSettingEnabled: 'N',
      videoRatio: '0',
      backgroundImg: 'https://example.com/bg.jpg',
      brandImg: '',
      actionPosition: 'right',
    };
    mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

    const result = await channelService.getPptRecordSetting('123456');

    expect(mockAxiosInstance.get).toHaveBeenCalledWith(
      '/live/v3/channel/pptRecord/get-setting',
      { params: { channelId: '123456' } }
    );
    expect(result.channelId).toBe(123456);
  });

  it('lists PPT record tasks with optional filters', async () => {
    const mockResponse: ListPptRecordTasksResponse = {
      pageNumber: 1,
      totalPages: 1,
      pageSize: 2,
      contents: [
        {
          taskId: 1,
          channelId: 123456,
          title: 'Playback',
          sessionId: 'session1',
          startTime: '20240101000000',
          status: 'success',
          remainDay: 1,
          duration: 60,
          videoId: 'video1',
          vid: null,
        },
      ],
    };
    mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

    const result = await channelService.listPptRecordTasks({
      channelId: '123456',
      sessionId: 'session1',
      status: 'success',
      startTime: '20240101000000',
      endTime: '20240102000000',
      page: 1,
      pageSize: 2,
    });

    expect(mockAxiosInstance.get).toHaveBeenCalledWith(
      '/live/v3/channel/pptRecord/list',
      {
        params: {
          channelId: '123456',
          sessionId: 'session1',
          status: 'success',
          startTime: '20240101000000',
          endTime: '20240102000000',
          page: 1,
          pageSize: 2,
        },
      }
    );
    expect(result.contents).toHaveLength(1);
  });

  it('gets transmit associations with and without channel filter', async () => {
    const mockResponse: TransmitAssociation[] = [
      { channelId: null, receiveChannelId: 654321 },
    ];
    mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

    const accountResult = await channelService.getTransmitAssociations();

    expect(mockAxiosInstance.get).toHaveBeenCalledWith(
      '/live/v3/channel/transmit/get-associations',
      { params: {} }
    );
    expect(accountResult).toEqual(mockResponse);

    mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);
    await channelService.getTransmitAssociations({ channelId: '123456' });

    expect(mockAxiosInstance.get).toHaveBeenLastCalledWith(
      '/live/v3/channel/transmit/get-associations',
      { params: { channelId: '123456' } }
    );
  });

  it('gets child account channel list', async () => {
    const mockResponse: GetUserChildrenChannelsResponse = {
      pageNumber: 1,
      pageSize: 10,
      totalPages: 1,
      totalItems: 1,
      contents: [{ channelId: 123456, organizationId: 'org1', createdTime: 1710000000000 }],
    };
    mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

    const result = await channelService.getUserChildrenChannels({
      childUserId: 'child-user',
      startTime: 1700000000000,
      endTime: 1710000000000,
      pageNumber: 1,
      pageSize: 10,
    });

    expect(mockAxiosInstance.get).toHaveBeenCalledWith(
      '/live/v4/channel/channel-user-children/get-channels',
      {
        params: {
          childUserId: 'child-user',
          startTime: 1700000000000,
          endTime: 1710000000000,
          pageNumber: 1,
          pageSize: 10,
        },
      }
    );
    expect(result.totalItems).toBe(1);
  });

  it('lists channel follow settings with array and string channel IDs', async () => {
    const mockResponse: ListChannelsFollowResponse = {
      list: [
        {
          channelId: 123456,
          enabled: 'N',
          autoShowEnabled: 'N',
          qrCodeUrl: '//liveimages.videocc.net/example.jpg',
          entranceText: 'welcome',
          tips: 'tips',
        },
      ],
    };
    mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

    const result = await channelService.listChannelsFollow({ channelIds: ['123456', 654321] });

    expect(mockAxiosInstance.get).toHaveBeenCalledWith(
      '/live/v3/channel/promotion/list-channels-follow',
      { params: { channelIds: '123456,654321' } }
    );
    expect(result.list).toHaveLength(1);

    mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);
    await channelService.listChannelsFollow({ channelIds: '123456,654321' });

    expect(mockAxiosInstance.get).toHaveBeenLastCalledWith(
      '/live/v3/channel/promotion/list-channels-follow',
      { params: { channelIds: '123456,654321' } }
    );
  });

  it('validates required parameters', async () => {
    await expect(channelService.getChannelAdverts('')).rejects.toThrow(PolyVValidationError);
    await expect(channelService.getChannelProductEnabled('')).rejects.toThrow(PolyVValidationError);
    await expect(channelService.getPptRecordSetting('')).rejects.toThrow(PolyVValidationError);
    await expect(channelService.listPptRecordTasks({ channelId: '' })).rejects.toThrow(PolyVValidationError);
    await expect(channelService.getTransmitAssociations({ channelId: '' })).rejects.toThrow(PolyVValidationError);
    await expect(channelService.getUserChildrenChannels({
      childUserId: '',
      pageNumber: 1,
      pageSize: 10,
    })).rejects.toThrow(PolyVValidationError);
    await expect(channelService.getUserChildrenChannels({
      childUserId: 'child-user',
      pageNumber: 0,
      pageSize: 10,
    })).rejects.toThrow(PolyVValidationError);
    await expect(channelService.listChannelsFollow({ channelIds: [] })).rejects.toThrow(PolyVValidationError);
  });
});
