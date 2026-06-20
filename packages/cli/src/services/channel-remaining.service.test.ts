import { ChannelServiceSdk } from './channel.service.sdk';
import { PlayerServiceSdk } from './player.service.sdk';
import { StatisticsServiceSdk } from './statistics.service.sdk';
import { StreamServiceSdk } from './stream.service.sdk';
import { createSdkClient } from '../sdk';

jest.mock('../sdk', () => ({
  createSdkClient: jest.fn(),
}));

const authConfig = {
  appId: 'app',
  appSecret: 'secret',
  userId: 'user123',
};

const serviceConfig = {
  baseUrl: 'https://api.polyv.net',
  timeout: 30000,
  debug: false,
};

describe('remaining channel CLI service wrappers', () => {
  let channel: Record<string, jest.Mock>;
  let v4Channel: Record<string, jest.Mock>;

  beforeEach(() => {
    channel = {
      getChannelPlaySummary: jest.fn().mockResolvedValue([]),
      getRealtimeViewers: jest.fn().mockResolvedValue([]),
      getRedpackStats: jest.fn().mockResolvedValue({ contents: [] }),
      getChannelStatistic: jest.fn().mockResolvedValue({}),
      getSessionStats: jest.fn().mockResolvedValue([]),
      getMicDetailList: jest.fn().mockResolvedValue({ contents: [] }),
      getLinkMicDetailList: jest.fn().mockResolvedValue({ contents: [] }),
      getSummary: jest.fn().mockResolvedValue({}),
      getProductClickStats: jest.fn().mockResolvedValue({ contents: [] }),
      getProductListStats: jest.fn().mockResolvedValue({ contents: [] }),
      getRealtimeViewersV1: jest.fn().mockResolvedValue([]),
      getViewlogV1: jest.fn().mockResolvedValue([]),
      getViewlog2: jest.fn().mockResolvedValue({ contents: [] }),
      getChannelApiAccessToken: jest.fn().mockResolvedValue({ channelToken: 'token' }),
      getTestModeToken: jest.fn().mockResolvedValue('test-token'),
      getHlsPullUrl: jest.fn().mockResolvedValue('https://example.com/live.m3u8'),
      updateWarmupSwitch: jest.fn().mockResolvedValue('success'),
    };
    v4Channel = {
      createBatch: jest.fn().mockResolvedValue({ channels: [{ channelId: 1 }] }),
      update: jest.fn().mockResolvedValue(undefined),
    };

    (createSdkClient as jest.Mock).mockReturnValue({ channel, v4Channel });
  });

  it('delegates remaining statistics commands to ChannelService methods', async () => {
    const service = new StatisticsServiceSdk(authConfig, serviceConfig);

    await service.getChannelPlaySummary({ startDate: '2026-06-01', endDate: '2026-06-20', channelIds: '1,2' });
    await service.getRealtimeViewers({ channelIds: '1,2' });
    await service.getRedpackStats({ channelId: '1', pageNumber: 1 });
    await service.getChannelStatistic({ channelId: '1', startDate: '2026-06-01', endDate: '2026-06-20' });
    await service.getSessionStats({ channelId: '1', sessionIds: 's1' });
    await service.getMicDetailList({ channelIds: '1', startDay: '2026-06-01', endDay: '2026-06-20' });
    await service.getLinkMicDetailList({ channelId: '1', startDate: '2026-06-01', endDate: '2026-06-20' });
    await service.getSummary({ channelId: '1', startDay: '2026-06-01', endDay: '2026-06-20' });
    await service.getProductClickStats({ channelId: '1', pageSize: 20 });
    await service.getProductListStats({ channelId: '1', pageSize: 20 });
    await service.getRealtimeViewersV1({ channelId: '1' });
    await service.getViewlogV1({ channelId: '1', currentDay: '2026-06-20' });
    await service.getViewlog2({ channelId: '1', currentDay: '2026-06-20', page: 1 });

    expect(channel.getChannelPlaySummary).toHaveBeenCalledWith('user123', {
      startDate: '2026-06-01',
      endDate: '2026-06-20',
      channelIds: '1,2',
    });
    expect(channel.getRealtimeViewers).toHaveBeenCalledWith({ channelIds: '1,2' });
    expect(channel.getRedpackStats).toHaveBeenCalledWith({ channelId: '1', pageNumber: 1 });
    expect(channel.getChannelStatistic).toHaveBeenCalledWith({
      channelId: '1',
      startDate: '2026-06-01',
      endDate: '2026-06-20',
    });
    expect(channel.getSessionStats).toHaveBeenCalledWith({ channelId: '1', sessionIds: 's1' });
    expect(channel.getMicDetailList).toHaveBeenCalledWith({
      channelIds: '1',
      startDay: '2026-06-01',
      endDay: '2026-06-20',
    });
    expect(channel.getLinkMicDetailList).toHaveBeenCalledWith({
      channelId: '1',
      startDate: '2026-06-01',
      endDate: '2026-06-20',
    });
    expect(channel.getSummary).toHaveBeenCalledWith('1', {
      startDay: '2026-06-01',
      endDay: '2026-06-20',
    });
    expect(channel.getProductClickStats).toHaveBeenCalledWith({ channelId: '1', pageSize: 20 });
    expect(channel.getProductListStats).toHaveBeenCalledWith({ channelId: '1', pageSize: 20 });
    expect(channel.getRealtimeViewersV1).toHaveBeenCalledWith('1', 'user123');
    expect(channel.getViewlogV1).toHaveBeenCalledWith('1', {
      currentDay: '2026-06-20',
      userId: 'user123',
    });
    expect(channel.getViewlog2).toHaveBeenCalledWith('1', {
      currentDay: '2026-06-20',
      page: 1,
    });
  });

  it('delegates auth and V4 channel commands to their SDK methods', async () => {
    const service = new ChannelServiceSdk(authConfig, serviceConfig);

    await service.getChannelApiAccessToken({ channelId: '1', disposable: true, expireSeconds: 1800 });
    await service.getTestModeToken({ channelId: '1', expireTime: 3600 });
    await service.createBatch({ channels: [{ name: 'demo', newScene: 'topclass', template: 'ppt' }] });
    await service.updateV4({ channelId: '1', name: 'updated' });

    expect(channel.getChannelApiAccessToken).toHaveBeenCalledWith('1', {
      disposable: true,
      expireSeconds: 1800,
    });
    expect(channel.getTestModeToken).toHaveBeenCalledWith('1', {
      expireTime: 3600,
    });
    expect(v4Channel.createBatch).toHaveBeenCalledWith({
      channels: [{ name: 'demo', newScene: 'topclass', template: 'ppt' }],
    });
    expect(v4Channel.update).toHaveBeenCalledWith({ channelId: '1', name: 'updated' });
  });

  it('delegates stream and player remaining commands to ChannelService methods', async () => {
    const stream = new StreamServiceSdk(authConfig, serviceConfig);
    const player = new PlayerServiceSdk(authConfig, serviceConfig);

    await stream.getHlsPullUrl('1');
    await player.updateWarmupSwitch({ channelId: '1', warmUpEnabled: 'Y' });

    expect(channel.getHlsPullUrl).toHaveBeenCalledWith('1');
    expect(channel.updateWarmupSwitch).toHaveBeenCalledWith({
      channelId: '1',
      warmUpEnabled: 'Y',
    });
  });
});
