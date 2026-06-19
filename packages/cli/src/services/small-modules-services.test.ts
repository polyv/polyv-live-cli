import type { AuthConfig } from '../types/auth';
import * as sdkModule from '../sdk';
import { ChannelServiceSdk } from './channel.service.sdk';
import { ChatServiceSdk } from './chat.service.sdk';
import { FinanceServiceSdk } from './finance-service';
import { GroupServiceSdk } from './group-service';
import { MaterialServiceSdk } from './material-service';
import { MonitorServiceSdk } from './monitor-service';
import { PartnerServiceSdk } from './partner-service';
import { PlayerServiceSdk } from './player.service.sdk';
import { RobotServiceSdk } from './robot-service';
import { StatisticsServiceSdk } from './statistics.service.sdk';
import { WebAppServiceSdk } from './webapp-service';

jest.mock('../sdk', () => ({
  createSdkClient: jest.fn(),
}));

const mockCreateSdkClient = sdkModule.createSdkClient as jest.MockedFunction<typeof sdkModule.createSdkClient>;

describe('small module service SDK proxies', () => {
  const authConfig: AuthConfig = { appId: 'app', appSecret: 'secret' };
  const serviceConfig = {
    baseUrl: 'https://api.polyv.net',
    timeout: 30000,
    debug: false,
  };
  let client: any;

  beforeEach(() => {
    client = {
      group: {
        setSpace: jest.fn().mockResolvedValue('space-ok'),
      },
      v4Group: {
        listGroupUserPackages: jest.fn().mockResolvedValue({ contents: [] }),
      },
      finance: {
        listVideoModerationResults: jest.fn().mockResolvedValue({ contents: [] }),
      },
      v4Material: {
        deleteMaterials: jest.fn().mockResolvedValue(true),
      },
      v4WebApp: {
        updateRole: jest.fn().mockResolvedValue(true),
      },
      v4Robot: {
        batchDeleteRobots: jest.fn().mockResolvedValue(true),
      },
      other: {
        registerUser: jest.fn().mockResolvedValue({ userId: 'u1' }),
        listTencentStreamInfo: jest.fn().mockResolvedValue([{ channelId: '1' }]),
        getInviterPosterList: jest.fn().mockResolvedValue({ contents: [] }),
        getGroupLoginTimes: jest.fn().mockResolvedValue([{ groupId: 1 }]),
        checkChannelStatusValid: jest.fn().mockResolvedValue({ validChannels: ['1'] }),
        resetCcbFocus: jest.fn().mockResolvedValue(null),
      },
      player: {
        setAntiRecordSettings: jest.fn().mockResolvedValue('ok'),
      },
      channel: {
        updatePlayerLogo: jest.fn().mockResolvedValue(true),
      },
      v4Statistics: {
        getSessionStatsSummaryList: jest.fn().mockResolvedValue({ contents: [] }),
      },
    };
    mockCreateSdkClient.mockReturnValue(client);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('proxies newly added group, finance, material, webapp, robot, and partner APIs', async () => {
    await expect(new GroupServiceSdk(authConfig, serviceConfig).setSpace({ email: 'a@example.com' })).resolves.toBe('space-ok');
    await expect(new GroupServiceSdk(authConfig, serviceConfig).listGroupUserPackages({ pageNumber: 1 })).resolves.toEqual({ contents: [] });
    await expect(new FinanceServiceSdk(authConfig, serviceConfig).listVideoModerationResults(123, { pageNumber: 1 })).resolves.toEqual({ contents: [] });
    await expect(new MaterialServiceSdk(authConfig, serviceConfig).deleteMaterials({ materialIds: ['m1'] })).resolves.toBe(true);
    await expect(new WebAppServiceSdk(authConfig, serviceConfig).updateRole({ roleId: 1 })).resolves.toBe(true);
    await expect(new RobotServiceSdk(authConfig, serviceConfig).batchDeleteRobots({ ids: [1] })).resolves.toBe(true);
    await expect(new PartnerServiceSdk(authConfig, serviceConfig).registerUser({ email: 'a@example.com' })).resolves.toEqual({ userId: 'u1' });

    expect(client.group.setSpace).toHaveBeenCalledWith({ email: 'a@example.com' });
    expect(client.v4Group.listGroupUserPackages).toHaveBeenCalledWith({ pageNumber: 1 });
    expect(client.finance.listVideoModerationResults).toHaveBeenCalledWith(123, { pageNumber: 1 });
    expect(client.v4Material.deleteMaterials).toHaveBeenCalledWith({ materialIds: ['m1'] });
    expect(client.v4WebApp.updateRole).toHaveBeenCalledWith({ roleId: 1 });
    expect(client.v4Robot.batchDeleteRobots).toHaveBeenCalledWith({ ids: [1] });
    expect(client.other.registerUser).toHaveBeenCalledWith({ email: 'a@example.com' });
  });

  it('proxies categorized root and uncategorized APIs through their business modules', async () => {
    await expect(new MonitorServiceSdk(authConfig, serviceConfig).listTencentStreamInfo({ channelId: '1' })).resolves.toEqual([{ channelId: '1' }]);
    await expect(new StatisticsServiceSdk(authConfig, serviceConfig).getSessionStatsSummaryList({ pageNumber: 1 })).resolves.toEqual({ contents: [] });
    await expect(new StatisticsServiceSdk(authConfig, serviceConfig).getInviterPosterList({ channelId: '1' })).resolves.toEqual({ contents: [] });
    await expect(new ChatServiceSdk(authConfig, serviceConfig).getGroupLoginTimes({ channelId: '1' })).resolves.toEqual([{ groupId: 1 }]);
    await expect(new ChannelServiceSdk(authConfig, serviceConfig).checkChannelStatusValid({ channels: '1,2' })).resolves.toEqual({ validChannels: ['1'] });
    await expect(new ChannelServiceSdk(authConfig, serviceConfig).resetCcbFocus({ channelIds: '1' })).resolves.toBeNull();

    expect(client.other.listTencentStreamInfo).toHaveBeenCalledWith({ channelId: '1' });
    expect(client.v4Statistics.getSessionStatsSummaryList).toHaveBeenCalledWith({ pageNumber: 1 });
    expect(client.other.getInviterPosterList).toHaveBeenCalledWith({ channelId: '1' });
    expect(client.other.getGroupLoginTimes).toHaveBeenCalledWith({ channelId: '1' });
    expect(client.other.checkChannelStatusValid).toHaveBeenCalledWith({ channels: '1,2' });
    expect(client.other.resetCcbFocus).toHaveBeenCalledWith({ channelIds: '1' });
  });

  it('proxies player utilities through player and channel SDK services', async () => {
    const service = new PlayerServiceSdk(authConfig, serviceConfig);

    await expect(service.setAntiRecordSettings(123, { antiRecordType: 'marquee' })).resolves.toBe('ok');
    await expect(service.updatePlayerLogo(123, { logoImage: 'https://example.com/logo.png' })).resolves.toBe(true);

    expect(client.player.setAntiRecordSettings).toHaveBeenCalledWith(123, { antiRecordType: 'marquee' });
    expect(client.channel.updatePlayerLogo).toHaveBeenCalledWith('123', { logoImage: 'https://example.com/logo.png' });
  });
});
