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
} as unknown as PolyVClient;

describe('ChannelService historical write APIs', () => {
  let service: ChannelService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ChannelService(mockClient);
  });

  it('calls PPT record and capture write endpoints', async () => {
    mockHttpClient.post
      .mockResolvedValueOnce('https://img.example.com/capture.jpg')
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce({ result: true })
      .mockResolvedValueOnce({ result: true });

    await expect(service.getCaptureImage('123456')).resolves.toBe('https://img.example.com/capture.jpg');
    await expect(service.addPptRecordTask({ channelId: '123456', videoId: 'vid001' })).resolves.toBe(true);
    await expect(
      service.updatePptRecordSetting({
        channelId: '123456',
        globalSettingEnabled: 'N',
        type: 0,
        videoRatio: 1,
      })
    ).resolves.toEqual({ result: true });
    await expect(service.deletePptRecord({ channelId: '123456', taskIds: [1, 2] })).resolves.toEqual({
      result: true,
    });

    expect(mockHttpClient.post).toHaveBeenNthCalledWith(1, '/live/v2/stream/123456/capture', null);
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      2,
      '/live/v3/channel/pptRecord/addRecordTask',
      null,
      { params: { channelId: '123456', videoId: 'vid001' } }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      3,
      '/live/v3/channel/pptRecord/setting',
      null,
      {
        params: {
          channelId: '123456',
          globalSettingEnabled: 'N',
          type: 0,
          videoRatio: 1,
        },
      }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      4,
      '/live/v3/channel/pptRecord/batch-delete',
      null,
      { params: { channelId: '123456', taskIds: '1,2' } }
    );
  });

  it('calls viewer token, chat token, online count, and token-login endpoints', async () => {
    mockHttpClient.post
      .mockResolvedValueOnce({ token: 'watch-token' })
      .mockResolvedValueOnce({ token: 'api-token' })
      .mockResolvedValueOnce(12)
      .mockResolvedValueOnce({ token: 'https://live.polyv.net/login' })
      .mockResolvedValueOnce({ token: 'chat-token', roomId: 'room1' });

    await service.getWatchApiToken({
      channelId: '123456',
      viewerId: 'viewer1',
      nickname: 'Viewer',
    });
    await service.getApiToken({ channelId: '123456', viewerId: 'viewer1' });
    await expect(service.getChatOnlineCount('123456')).resolves.toBe(12);
    await service.getTokenLoginUrl({ channelId: '123456', accountId: 'teacher1' });
    await service.getChatToken({ channelId: '123456', userId: 'viewer1', role: 'viewer' });

    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      1,
      '/live/v3/channel/watch/get-watch-api-token',
      null,
      { params: { channelId: '123456', viewerId: 'viewer1', nickname: 'Viewer' } }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      2,
      '/live/v3/channel/watch/get-api-token',
      null,
      { params: { channelId: '123456', viewerId: 'viewer1' } }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      3,
      '/live/v3/channel/chat/count-online-user',
      null,
      { params: { channelId: '123456' } }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      4,
      '/live/v3/channel/common/token-login-url',
      null,
      { params: { channelId: '123456', accountId: 'teacher1' } }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      5,
      '/live/v3/channel/common/get-chat-token',
      null,
      { params: { channelId: '123456', userId: 'viewer1', role: 'viewer' } }
    );
  });

  it('falls back to GET for online count when historical POST is not allowed', async () => {
    mockHttpClient.post.mockRejectedValueOnce(new Error('method not allowed'));
    mockHttpClient.get.mockResolvedValueOnce(7);

    await expect(service.getChatOnlineCount('123456')).resolves.toBe(7);

    expect(mockHttpClient.post).toHaveBeenCalledWith(
      '/live/v3/channel/chat/count-online-user',
      null,
      { params: { channelId: '123456' } }
    );
    expect(mockHttpClient.get).toHaveBeenCalledWith(
      '/live/v3/channel/chat/count-online-user',
      { params: { channelId: '123456' } }
    );
  });

  it('calls transmit, submeeting, association, and chat cleanup endpoints', async () => {
    mockHttpClient.post
      .mockResolvedValueOnce([{ channelId: 1001, name: 'Receiver A' }])
      .mockResolvedValueOnce([2001, 2002])
      .mockResolvedValueOnce(['3001', '3002'])
      .mockResolvedValueOnce('remove chat contents success');

    await service.batchAddTransmit({ channelId: '123456', names: ['Receiver A'] });
    await service.batchAddSubmeeting({
      channelId: '123456',
      subChannels: [{ channelId: '2001', name: 'Room A' }],
    });
    await service.associationReceiveChannels({
      channelId: '123456',
      receiveChannelIds: ['3001', '3002'],
      type: 'cancel',
    });
    await service.removeChatContents({ channelId: '123456', ids: ['msg1', 'msg2'] });

    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      1,
      '/live/v3/channel/transmit/batch-create',
      ['Receiver A'],
      { params: { channelId: '123456' } }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      2,
      '/live/v3/channel/multi-meeting/batch-save-submeeting',
      { subChannels: [{ channelId: '2001', name: 'Room A' }] },
      { params: { channelId: '123456' } }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      3,
      '/live/v3/channel/transmit/associations',
      null,
      {
        params: {
          channelId: '123456',
          receiveChannelIds: '3001,3002',
          type: 'cancel',
        },
      }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      4,
      '/live/v3/channel/chat/remove-contents',
      null,
      { params: { channelId: '123456', ids: 'msg1,msg2' } }
    );
  });

  it('calls channel product batch and action endpoints', async () => {
    const product = {
      name: 'Product',
      status: 1 as const,
      linkType: 10 as const,
      link: 'https://example.com',
    };

    mockHttpClient.post.mockResolvedValue('SUCCESS');

    await service.batchDeleteChannelProducts({ channelId: '123456', productIds: [1, 2] });
    await service.batchAddChannelProducts({ channelId: '123456', products: [product] });
    await service.batchShelfChannelProducts({ channelId: '123456', productIds: [1, 2], shelf: 2 });
    await service.cancelPushChannelProduct({ channelId: '123456', productId: 1 });
    await service.pushChannelProduct({
      channelId: '123456',
      productId: 1,
      pushCardType: 'bigCard',
    });
    await service.shelfChannelProduct({ channelId: '123456', productId: 1, shelf: 1 });
    await service.sortChannelProduct({ channelId: '123456', productId: 1, type: 50, sort: 3 });
    await service.referenceProduct({
      channelId: '123456',
      originId: 'platform-product-1',
      status: 1,
      withTags: true,
    });

    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      1,
      '/live/v3/channel/product/batch-delete',
      { productIds: [1, 2] },
      { params: { channelId: '123456' } }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      2,
      '/live/v3/channel/product/batch-add',
      [product],
      { params: { channelId: '123456' } }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      3,
      '/live/v3/channel/product/batch-shelf',
      { productIds: [1, 2] },
      { params: { channelId: '123456', shelf: 2 } }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      4,
      '/live/v3/channel/product/cancel-push-product',
      null,
      { params: { channelId: '123456', productId: 1 } }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      5,
      '/live/v3/channel/product/push-product',
      null,
      { params: { channelId: '123456', productId: 1, pushCardType: 'bigCard' } }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      6,
      '/live/v3/channel/product/shelf',
      null,
      { params: { channelId: '123456', productId: 1, shelf: 1 } }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      7,
      '/live/v3/channel/product/sort',
      null,
      { params: { channelId: '123456', productId: 1, type: 50, sort: 3 } }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      8,
      '/live/v3/channel/product/reference',
      { originId: 'platform-product-1', status: 1, withTags: true },
      { params: { channelId: '123456' } }
    );
  });

  it('calls disk video, token, questionnaire, danmu, follow, and stream endpoints', async () => {
    mockHttpClient.post.mockResolvedValue('success');

    await service.deleteDiskVideos({ channelId: '123456', vids: ['vid1'], videoIds: ['disk1'] });
    await service.setChannelToken({ channelId: '123456', token: 'login-token' });
    await service.setAccountToken({ channelId: '123456', token: 'account-token' });
    await service.channelsStopQuestionnaire({ channelIds: ['123456', '234567'] });
    await service.batchUpdateDanmu({
      channelIds: ['123456', '234567'],
      closeDanmu: 'Y',
      showDanmuInfoEnabled: 'N',
    });
    await service.updateChannelsFollow({
      channelIds: ['123456'],
      qrCodeUrl: 'https://example.com/qrcode.png',
      enabled: 'Y',
      autoShowEnabled: 'N',
      entranceText: 'Follow',
      tips: 'Scan QR to follow',
      pcFollowTips: 'Scan QR to follow',
    });
    await service.updateStreamType({
      channelId: '123456',
      streamType: 'pull',
      pullUrl: 'rtmp://pull.example.com/live',
      pullStreamTime: 1710000000000,
    });
    await service.addDiskVideos({
      channelId: '123456',
      vids: ['record-file-1'],
      origin: 'record',
      startTimes: [1710000000000],
    });

    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      1,
      '/live/v3/channel/stream/delete-disk-videos',
      null,
      { params: { channelId: '123456', vids: 'vid1', videoIds: 'disk1' } }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      2,
      '/live/v2/channels/123456/set-token',
      null,
      { params: { token: 'login-token' } }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      3,
      '/live/v2/channels/123456/set-account-token',
      null,
      { params: { token: 'account-token' } }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      4,
      '/live/v3/channel/questionnaire/end',
      null,
      { params: { channelIds: '123456,234567' } }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      5,
      '/live/v3/channel/basic/batchUpdateDanmu',
      null,
      {
        params: {
          channelIds: '123456,234567',
          closeDanmu: 'Y',
          showDanmuInfoEnabled: 'N',
        },
      }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      6,
      '/live/v3/channel/promotion/update-channels-follow',
      null,
      {
        params: {
          channelIds: '123456',
          qrCodeUrl: 'https://example.com/qrcode.png',
          enabled: 'Y',
          autoShowEnabled: 'N',
          entranceText: 'Follow',
          tips: 'Scan QR to follow',
          pcFollowTips: 'Scan QR to follow',
        },
      }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      7,
      '/live/v3/channel/stream/update',
      null,
      {
        params: {
          channelId: '123456',
          streamType: 'pull',
          pullUrl: 'rtmp://pull.example.com/live',
          pullStreamTime: 1710000000000,
        },
      }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      8,
      '/live/v3/channel/stream/add-disk-videos',
      null,
      {
        params: {
          channelId: '123456',
          vids: 'record-file-1',
          origin: 'record',
          startTimes: '1710000000000',
        },
      }
    );
  });

  it('rejects dangerous write calls with incomplete or invalid parameters', async () => {
    await expect(service.deleteDiskVideos({ channelId: '123456' })).rejects.toBeInstanceOf(
      PolyVValidationError
    );
    await expect(
      service.batchDeleteChannelProducts({
        channelId: '123456',
        productIds: Array.from({ length: 101 }, (_, index) => index + 1),
      })
    ).rejects.toBeInstanceOf(PolyVValidationError);
    await expect(
      service.updateStreamType({ channelId: '123456', streamType: 'pull' })
    ).rejects.toBeInstanceOf(PolyVValidationError);
    await expect(
      service.addDiskVideos({ channelId: '123456', vids: ['record-file-1'], origin: 'record' })
    ).rejects.toBeInstanceOf(PolyVValidationError);
    await expect(
      service.sortChannelProduct({ channelId: '123456', productId: 1, type: 50 })
    ).rejects.toBeInstanceOf(PolyVValidationError);

    expect(mockHttpClient.post).not.toHaveBeenCalled();
  });
});
