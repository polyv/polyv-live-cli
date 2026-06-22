import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { PolyVClient } from '../../client.js';
import { PolyVValidationError } from '../../errors/polyv-validation-error.js';
import { V4ChannelService } from './channel.service.js';

const mockHttpClient = {
  get: vi.fn(),
  post: vi.fn(),
};

const mockClient = {
  httpClient: mockHttpClient,
} as unknown as PolyVClient;

describe('V4ChannelService core exact API paths', () => {
  let service: V4ChannelService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new V4ChannelService(mockClient);
  });

  it('calls playback, session, status, monitor, and subtitle read endpoints', async () => {
    mockHttpClient.get.mockResolvedValue([]);
    mockHttpClient.post.mockResolvedValue({ contents: [] });

    await service.listPlaybackSettings({ channelIds: ['123', '456'] });
    await service.getSessionExternalBySession({ channelId: '123', sessionId: 'session1' });
    await service.getSubtitleConfig({ channelId: '123' });
    await service.listSubtitleLanguages();
    await service.listMonitorStreamInfo({ channelId: '123', startTime: '2025-01-01', endTime: '2025-01-02' });
    await service.getPlaybackVideoInfo({ channelIds: ['123', '456'] });
    await service.listLiveStatus({ channelIds: ['123', '456'] });
    await service.listSessionStats({ pageNumber: 1, pageSize: 10 });

    expect(mockHttpClient.get).toHaveBeenNthCalledWith(
      1,
      '/live/v4/channel/playback/list',
      { params: { channelIds: '123,456' } }
    );
    expect(mockHttpClient.get).toHaveBeenNthCalledWith(
      2,
      '/live/v4/channel/session/external-by-session',
      { params: { channelId: '123', sessionId: 'session1' } }
    );
    expect(mockHttpClient.get).toHaveBeenNthCalledWith(
      3,
      '/live/v4/channel/subtitle/config/get',
      { params: { channelId: '123' } }
    );
    expect(mockHttpClient.get).toHaveBeenNthCalledWith(
      4,
      '/live/v4/channel/subtitle/language/list-all'
    );
    expect(mockHttpClient.get).toHaveBeenNthCalledWith(
      5,
      '/live/v4/channel/monitor/list-stream-info',
      { params: { channelId: '123', startTime: '2025-01-01', endTime: '2025-01-02' } }
    );
    expect(mockHttpClient.get).toHaveBeenNthCalledWith(
      6,
      '/live/v4/channel/play-back/get',
      { params: { channelIds: '123,456' } }
    );
    expect(mockHttpClient.get).toHaveBeenNthCalledWith(
      7,
      '/live/v4/channel/live-status/list',
      { params: { channelIds: '123,456' } }
    );
    expect(mockHttpClient.post).toHaveBeenCalledWith(
      '/live/v4/statistics/session-stats/list',
      null,
      { params: { pageNumber: 1, pageSize: 10 } }
    );
  });

  it('calls operate and statistics list endpoints', async () => {
    mockHttpClient.get.mockResolvedValue({ contents: [] });

    await service.listAllChannelBasic({
      categoryIds: ['1', '2'],
      channelIds: ['123', '456'],
      watchStatus: 'live',
      pageNumber: 1,
      pageSize: 20,
    });
    await service.listChannelSimple({ categoryId: '1', keyword: 'demo', pageNumber: 1, pageSize: 10 });
    await service.listChannelLotteryRecords({ channelId: '123', pageNumber: 1, pageSize: 10 });
    await service.getLiveData({ channelId: '123', startTime: 1710000000000, endTime: 1710100000000 });
    await service.listWeixinBookings({ channelId: '123', pageNumber: 1, pageSize: 10 });
    await service.listInviteStats({ channelId: '123', senderViewerId: 'viewer1', pageNumber: 1, pageSize: 10 });
    await service.getDistributeStatistic({ channelId: '123', sessionIds: ['session1', 'session2'] });

    expect(mockHttpClient.get).toHaveBeenNthCalledWith(
      1,
      '/live/v4/channel/basic/list',
      {
        params: {
          categoryIds: '1,2',
          channelIds: '123,456',
          watchStatus: 'live',
          pageNumber: 1,
          pageSize: 20,
        },
      }
    );
    expect(mockHttpClient.get).toHaveBeenNthCalledWith(
      2,
      '/live/v4/channel/simple/list',
      { params: { categoryId: '1', keyword: 'demo', pageNumber: 1, pageSize: 10 } }
    );
    expect(mockHttpClient.get).toHaveBeenNthCalledWith(
      3,
      '/live/v4/channel/lottery/list',
      { params: { channelId: '123', pageNumber: 1, pageSize: 10 } }
    );
    expect(mockHttpClient.get).toHaveBeenNthCalledWith(
      4,
      '/live/v4/channel/statistics/live-data',
      { params: { channelId: '123', startTime: 1710000000000, endTime: 1710100000000 } }
    );
    expect(mockHttpClient.get).toHaveBeenNthCalledWith(
      5,
      '/live/v4/channel/booking/list',
      { params: { channelId: '123', pageNumber: 1, pageSize: 10 } }
    );
    expect(mockHttpClient.get).toHaveBeenNthCalledWith(
      6,
      '/live/v4/channel/invite/list',
      { params: { channelId: '123', senderViewerId: 'viewer1', pageNumber: 1, pageSize: 10 } }
    );
    expect(mockHttpClient.get).toHaveBeenNthCalledWith(
      7,
      '/live/v4/channel/distribute/get/statistic',
      { params: { channelId: '123', sessionIds: 'session1,session2' } }
    );
  });

  it('calls channel creation and role account write endpoints', async () => {
    mockHttpClient.post.mockResolvedValue({});

    await service.createInit({
      basicSetting: { name: 'Core Channel', newScene: 'topclass', template: 'ppt' },
    });
    await service.createMrChannel({ name: 'MR Channel', categoryId: 1 });
    await service.createAccount({
      channelId: '123',
      role: 'Assistant',
      nickName: 'Assistant A',
      purviewList: [{ code: 'chatListEnabled', enabled: 'Y' }],
    });
    await service.updateAccountInfo({ channelId: '123', account: 'account1', nickName: 'Updated' });
    await service.deleteAccountsBatch({ channelId: '123', accounts: ['account1', 'account2'] });
    await service.teacherList({ channelIds: ['123', '456'] });

    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      1,
      '/live/v4/channel/create-init',
      { basicSetting: { name: 'Core Channel', newScene: 'topclass', template: 'ppt' } }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      2,
      '/live/v4/channel/mr/create',
      { name: 'MR Channel', categoryId: 1 }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      3,
      '/live/v4/channel/account/create',
      {
        role: 'Assistant',
        nickName: 'Assistant A',
        purviewList: [{ code: 'chatListEnabled', enabled: 'Y' }],
      },
      { params: { channelId: '123' } }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      4,
      '/live/v4/channel/account/update',
      { account: 'account1', nickName: 'Updated' },
      { params: { channelId: '123' } }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      5,
      '/live/v4/channel/account/delete-batch',
      null,
      { params: { channelId: '123', accounts: 'account1,account2' } }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      6,
      '/live/v4/channel/account/teacher-list',
      { channelIds: ['123', '456'] }
    );
  });

  it('calls channel config write endpoints', async () => {
    mockHttpClient.post.mockResolvedValue({});

    await service.updateChannelSubtitleBatch({
      channelId: '123',
      body: [{ id: 1, name: 'Chinese', status: 'publish' }],
    });
    await service.updateSkinBatch({ channelIds: ['123', '456'], skin: 'blue' });
    await service.getAccountViewerConfig({ channelId: '123' });
    await service.updateAccountViewerConfig({
      channelId: '123',
      actor: 'Guest',
      actorEnabled: 'Y',
      questionStudentTitleEnabled: 'N',
    });
    await service.setPullBitrate({ channelId: '123', pullBitRate: 1000 });
    await service.updateTemplate({ channelId: '123', template: 'portrait_ppt' });
    await service.updateSubtitleConfig({
      channelId: '123',
      realTimeSubtitleEnabled: 'Y',
      translationLanguages: ['English'],
    });

    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      1,
      '/live/v4/channel/subtitle/update-batch',
      [{ id: 1, name: 'Chinese', status: 'publish' }],
      { params: { channelId: '123' } }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      2,
      '/live/v4/channel/decorate/skin/update-batch',
      null,
      { params: { channelIds: '123,456', skin: 'blue' } }
    );
    expect(mockHttpClient.get).toHaveBeenCalledWith(
      '/live/v4/channel/account/viewer/get',
      { params: { channelId: '123' } }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      3,
      '/live/v4/channel/account/viewer/update',
      { actor: 'Guest', actorEnabled: 'Y', questionStudentTitleEnabled: 'N' },
      { params: { channelId: '123' } }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      4,
      '/live/v4/channel/set-pull-bitrate',
      null,
      { params: { channelId: '123', pullBitRate: 1000 } }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      5,
      '/live/v4/channel/update-template',
      null,
      { params: { channelId: '123', template: 'portrait_ppt' } }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      6,
      '/live/v4/channel/subtitle/config/update',
      { channelId: '123', realTimeSubtitleEnabled: 'Y', translationLanguages: ['English'] }
    );
  });

  it('rejects invalid core write parameters', async () => {
    await expect(service.listLiveStatus({ channelIds: [] })).rejects.toBeInstanceOf(PolyVValidationError);
    await expect(service.createInit({} as any)).rejects.toBeInstanceOf(PolyVValidationError);
    await expect(
      service.getDistributeStatistic({ channelId: '123' })
    ).rejects.toBeInstanceOf(PolyVValidationError);
    await expect(
      service.updateChannelSubtitleBatch({ channelId: '123', body: [] })
    ).rejects.toBeInstanceOf(PolyVValidationError);
    await expect(
      service.setPullBitrate({ channelId: '123', pullBitRate: 123 })
    ).rejects.toBeInstanceOf(PolyVValidationError);

    expect(mockHttpClient.get).not.toHaveBeenCalled();
    expect(mockHttpClient.post).not.toHaveBeenCalled();
  });
});
