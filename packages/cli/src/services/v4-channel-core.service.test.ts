import { ChannelServiceSdk } from './channel.service.sdk';
import { MonitorServiceSdk } from './monitor-service';
import { PlayerServiceSdk } from './player.service.sdk';
import { StatisticsServiceSdk } from './statistics.service.sdk';
import { createSdkClient } from '../sdk';

jest.mock('../sdk', () => ({
  createSdkClient: jest.fn(),
}));

const authConfig = { appId: 'app', appSecret: 'secret' };
const serviceConfig = { baseUrl: 'https://api.polyv.net', timeout: 30000, debug: false };

describe('V4 channel core CLI service wrappers', () => {
  let v4Channel: Record<string, jest.Mock>;

  beforeEach(() => {
    v4Channel = {
      distributeList: jest.fn().mockResolvedValue({ result: [] }),
      listChannelLotteryRecords: jest.fn().mockResolvedValue({ contents: [] }),
      getAccountViewerConfig: jest.fn().mockResolvedValue({ actorEnabled: 'Y' }),
      getByRole: jest.fn().mockResolvedValue({ role: 'Teacher', config: {} }),
      getLiveData: jest.fn().mockResolvedValue({ watchData: {} }),
      getSubtitleConfig: jest.fn().mockResolvedValue({ realTimeSubtitleEnabled: 'N' }),
      listSessionStats: jest.fn().mockResolvedValue({ contents: [] }),
      listSubtitleLanguages: jest.fn().mockResolvedValue([]),
      listChannelBasicExact: jest.fn().mockResolvedValue({ contents: [] }),
      listChannelSimple: jest.fn().mockResolvedValue({ contents: [] }),
      listWeixinBookings: jest.fn().mockResolvedValue({ contents: [] }),
      listInviteStats: jest.fn().mockResolvedValue({ contents: [] }),
      getDistributeStatistic: jest.fn().mockResolvedValue([]),
      createInit: jest.fn().mockResolvedValue({ channelId: 1 }),
      createAccount: jest.fn().mockResolvedValue({ account: 'a1' }),
      createMrChannel: jest.fn().mockResolvedValue({ channelId: '1' }),
      listMonitorStreamInfo: jest.fn().mockResolvedValue([]),
      listLiveStatus: jest.fn().mockResolvedValue([]),
      teacherList: jest.fn().mockResolvedValue([]),
      distributeDeleteBatch: jest.fn().mockResolvedValue(undefined),
      deleteAccountsBatch: jest.fn().mockResolvedValue(true),
      distributeCreateBatch: jest.fn().mockResolvedValue(undefined),
      distributeUpdateBatch: jest.fn().mockResolvedValue(undefined),
      updateSkinBatch: jest.fn().mockResolvedValue(true),
      updateSwitch: jest.fn().mockResolvedValue(undefined),
      updateAccountViewerConfig: jest.fn().mockResolvedValue(undefined),
      updateAccountInfo: jest.fn().mockResolvedValue({ account: 'a1' }),
      updateByRole: jest.fn().mockResolvedValue(undefined),
      setPullBitrate: jest.fn().mockResolvedValue(undefined),
      updateTemplate: jest.fn().mockResolvedValue(undefined),
      updateSubtitleConfig: jest.fn().mockResolvedValue({ realTimeSubtitleEnabled: 'Y' }),
      updateMasterSwitch: jest.fn().mockResolvedValue(undefined),
    };

    (createSdkClient as jest.Mock).mockReturnValue({ v4Channel });
  });

  it('delegates channel command wrappers to V4ChannelService methods', async () => {
    const service = new ChannelServiceSdk(authConfig, serviceConfig);

    await service.distributeList({ channelId: '1' });
    await service.getAccountViewerConfig({ channelId: '1' });
    await service.getByRole({ channelId: '1', role: 'Teacher' });
    await service.getSubtitleConfig({ channelId: '1' });
    await service.listSubtitleLanguages();
    await service.listChannelBasicExact({ pageNumber: 1 });
    await service.listChannelSimple({ keyword: 'demo' });
    await service.listLiveStatus({ channelIds: ['1'] });
    await service.getDistributeStatistic({ channelId: '1', sessionIds: ['s1'] });
    await service.createInit({ basicSetting: { name: 'demo', newScene: 'topclass', template: 'ppt' } });
    await service.createAccount({ channelId: '1', role: 'Assistant' });
    await service.createMrChannel({ name: 'mr' });
    await service.teacherList({ channelIds: ['1'] });
    await service.deleteAccountsBatch({ channelId: '1', accounts: ['a1'] });
    await service.distributeDeleteBatch({ channelId: '1', ids: [1] });
    await service.distributeCreateBatch({ channelId: '1', distributes: [] });
    await service.distributeUpdateBatch({ channelId: '1', distributes: [] });
    await service.updateSwitch({ channelId: '1', distributeId: 1, enabled: 'Y' });
    await service.updateMasterSwitch({ channelId: '1', enabled: 'Y' });
    await service.updateAccountViewerConfig({ channelId: '1', actorEnabled: 'Y' });
    await service.updateAccountInfo({ channelId: '1', account: 'a1' });
    await service.updateByRole({ channelId: '1', role: 'Teacher', config: {} });
    await service.setPullBitrate({ channelId: '1', pullBitRate: 400 });
    await service.updateTemplate({ channelId: '1', template: 'ppt' });
    await service.updateSubtitleConfig({ channelId: '1', realTimeSubtitleEnabled: 'Y' });

    expect(v4Channel.distributeList).toHaveBeenCalledWith({ channelId: '1' });
    expect(v4Channel.getAccountViewerConfig).toHaveBeenCalledWith({ channelId: '1' });
    expect(v4Channel.getByRole).toHaveBeenCalledWith({ channelId: '1', role: 'Teacher' });
    expect(v4Channel.getSubtitleConfig).toHaveBeenCalledWith({ channelId: '1' });
    expect(v4Channel.listSubtitleLanguages).toHaveBeenCalledWith();
    expect(v4Channel.listChannelBasicExact).toHaveBeenCalledWith({ pageNumber: 1 });
    expect(v4Channel.listChannelSimple).toHaveBeenCalledWith({ keyword: 'demo' });
    expect(v4Channel.listLiveStatus).toHaveBeenCalledWith({ channelIds: ['1'] });
    expect(v4Channel.getDistributeStatistic).toHaveBeenCalledWith({ channelId: '1', sessionIds: ['s1'] });
    expect(v4Channel.createInit).toHaveBeenCalledWith({ basicSetting: { name: 'demo', newScene: 'topclass', template: 'ppt' } });
    expect(v4Channel.createAccount).toHaveBeenCalledWith({ channelId: '1', role: 'Assistant' });
    expect(v4Channel.createMrChannel).toHaveBeenCalledWith({ name: 'mr' });
    expect(v4Channel.teacherList).toHaveBeenCalledWith({ channelIds: ['1'] });
    expect(v4Channel.deleteAccountsBatch).toHaveBeenCalledWith({ channelId: '1', accounts: ['a1'] });
    expect(v4Channel.distributeDeleteBatch).toHaveBeenCalledWith({ channelId: '1', ids: [1] });
    expect(v4Channel.distributeCreateBatch).toHaveBeenCalledWith({ channelId: '1', distributes: [] });
    expect(v4Channel.distributeUpdateBatch).toHaveBeenCalledWith({ channelId: '1', distributes: [] });
    expect(v4Channel.updateSwitch).toHaveBeenCalledWith({ channelId: '1', distributeId: 1, enabled: 'Y' });
    expect(v4Channel.updateMasterSwitch).toHaveBeenCalledWith({ channelId: '1', enabled: 'Y' });
    expect(v4Channel.updateAccountViewerConfig).toHaveBeenCalledWith({ channelId: '1', actorEnabled: 'Y' });
    expect(v4Channel.updateAccountInfo).toHaveBeenCalledWith({ channelId: '1', account: 'a1' });
    expect(v4Channel.updateByRole).toHaveBeenCalledWith({ channelId: '1', role: 'Teacher', config: {} });
    expect(v4Channel.setPullBitrate).toHaveBeenCalledWith({ channelId: '1', pullBitRate: 400 });
    expect(v4Channel.updateTemplate).toHaveBeenCalledWith({ channelId: '1', template: 'ppt' });
    expect(v4Channel.updateSubtitleConfig).toHaveBeenCalledWith({ channelId: '1', realTimeSubtitleEnabled: 'Y' });
  });

  it('delegates monitor, statistics, and player wrappers to V4ChannelService methods', async () => {
    const monitor = new MonitorServiceSdk(authConfig, serviceConfig);
    const statistics = new StatisticsServiceSdk(authConfig, serviceConfig);
    const player = new PlayerServiceSdk(authConfig, serviceConfig);

    await monitor.listMonitorStreamInfo({ channelId: '1' });
    await statistics.listChannelLotteryRecords({ channelId: '1' });
    await statistics.getLiveData({ channelId: '1' });
    await statistics.listSessionStats({ pageNumber: 1 });
    await statistics.listWeixinBookings({ channelId: '1' });
    await statistics.listInviteStats({ channelId: '1' });
    await player.updateSkinBatch({ channelIds: ['1'], skin: 'black' });

    expect(v4Channel.listMonitorStreamInfo).toHaveBeenCalledWith({ channelId: '1' });
    expect(v4Channel.listChannelLotteryRecords).toHaveBeenCalledWith({ channelId: '1' });
    expect(v4Channel.getLiveData).toHaveBeenCalledWith({ channelId: '1' });
    expect(v4Channel.listSessionStats).toHaveBeenCalledWith({ pageNumber: 1 });
    expect(v4Channel.listWeixinBookings).toHaveBeenCalledWith({ channelId: '1' });
    expect(v4Channel.listInviteStats).toHaveBeenCalledWith({ channelId: '1' });
    expect(v4Channel.updateSkinBatch).toHaveBeenCalledWith({ channelIds: ['1'], skin: 'black' });
  });
});
