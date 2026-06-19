import { UserSettingsServiceSdk } from './user.service';
import { createSdkClient } from '../sdk';
import { mockAuthConfig, mockServiceConfig } from '../utils/test-helpers';

jest.mock('../sdk', () => ({
  createSdkClient: jest.fn(),
}));

const mockCreateSdkClient = createSdkClient as jest.MockedFunction<typeof createSdkClient>;

describe('user settings service wrapper', () => {
  let mockClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = {
      v4User: {
        listChildAccounts: jest.fn().mockResolvedValue({ contents: [] }),
        listChildAccountRoles: jest.fn().mockResolvedValue([]),
        createChildAccount: jest.fn().mockResolvedValue({ childEmail: 'child@example.com' }),
        updateChildAccount: jest.fn().mockResolvedValue(undefined),
        deleteChildAccounts: jest.fn().mockResolvedValue(undefined),
        getBySale: jest.fn().mockResolvedValue({ childEmail: 'child@example.com' }),
        listOrganizations: jest.fn().mockResolvedValue({ contents: [] }),
        createOrganization: jest.fn().mockResolvedValue({ id: 1 }),
        deleteOrganization: jest.fn().mockResolvedValue(undefined),
        getDonateTemplate: jest.fn().mockResolvedValue({}),
        updateDonateTemplate: jest.fn().mockResolvedValue(undefined),
        getMarqueeTemplate: jest.fn().mockResolvedValue({}),
        updateMarqueeTemplate: jest.fn().mockResolvedValue(undefined),
        getRoleConfigTemplate: jest.fn().mockResolvedValue({}),
        updateRoleConfigTemplate: jest.fn().mockResolvedValue(undefined),
        getPlaybackSetting: jest.fn().mockResolvedValue({}),
        updatePlaybackSetting: jest.fn().mockResolvedValue(undefined),
        getAudioModerationSetting: jest.fn().mockResolvedValue({}),
        updateAudioModerationSetting: jest.fn().mockResolvedValue(undefined),
        getVideoModerationSetting: jest.fn().mockResolvedValue({}),
        updateVideoModerationSetting: jest.fn().mockResolvedValue(undefined),
        getGlobalFooter: jest.fn().mockResolvedValue({}),
        updateGlobalFooter: jest.fn().mockResolvedValue(undefined),
        getPvShowEnable: jest.fn().mockResolvedValue({ enabled: 'Y' }),
        updatePvShowEnable: jest.fn().mockResolvedValue(undefined),
        sendSms: jest.fn().mockResolvedValue(undefined),
        getMicDuration: jest.fn().mockResolvedValue({ history: 10 }),
        getMrConcurrencyDetail: jest.fn().mockResolvedValue({ usedCount: 1 }),
        getBillUseDetailList: jest.fn().mockResolvedValue({ contents: [] }),
        getWatchLogList: jest.fn().mockResolvedValue({ contents: [] }),
        getWatchLogDetail: jest.fn().mockResolvedValue({ contents: [] }),
      },
    };
    mockCreateSdkClient.mockReturnValue(mockClient);
  });

  it('delegates child account and organization methods to V4UserService', async () => {
    const service = new UserSettingsServiceSdk(mockAuthConfig, mockServiceConfig);

    await service.listChildAccounts({ pageNumber: 1, pageSize: 20 });
    await service.listChildAccountRoles();
    await service.createChildAccount({ childEmail: 'child@example.com', childName: 'Child', password: 'Password123', roleId: 1 });
    await service.updateChildAccount({ childEmail: 'child@example.com', childName: 'Updated' });
    await service.deleteChildAccount({ childEmail: 'child@example.com' });
    await service.getChildBySale({ saleId: 'sale-1' });
    await service.listOrganizations();
    await service.createOrganization({ name: 'Org', parentId: 1 });
    await service.deleteOrganization({ organizationId: 2 });

    expect(mockClient.v4User.listChildAccounts).toHaveBeenCalledWith({ pageNumber: 1, pageSize: 20 });
    expect(mockClient.v4User.createChildAccount).toHaveBeenCalledWith(expect.objectContaining({ childEmail: 'child@example.com' }));
    expect(mockClient.v4User.updateChildAccount).toHaveBeenCalledWith(expect.objectContaining({ childEmail: 'child@example.com' }));
    expect(mockClient.v4User.deleteChildAccounts).toHaveBeenCalledWith({ childEmail: 'child@example.com' });
    expect(mockClient.v4User.getBySale).toHaveBeenCalledWith({ saleId: 'sale-1' });
    expect(mockClient.v4User.createOrganization).toHaveBeenCalledWith({ name: 'Org', parentId: 1 });
    expect(mockClient.v4User.deleteOrganization).toHaveBeenCalledWith({ organizationId: 2 });
  });

  it('delegates template and setting methods to V4UserService', async () => {
    const service = new UserSettingsServiceSdk(mockAuthConfig, mockServiceConfig);

    await service.getDonateTemplate();
    await service.updateDonateTemplate({ donateGiftEnabled: 'Y' });
    await service.getMarqueeTemplate();
    await service.updateMarqueeTemplate({ enable: 'Y' });
    await service.getRoleConfigTemplate();
    await service.updateRoleConfigTemplate({ teacherConfig: {} });
    await service.getPlaybackSetting();
    await service.updatePlaybackSetting({ playbackEnabled: 'Y' });
    await service.getAudioModerationSetting();
    await service.updateAudioModerationSetting({ moderationEnabled: 'Y' });
    await service.getVideoModerationSetting();
    await service.updateVideoModerationSetting({ moderationEnabled: 'Y' });
    await service.getGlobalFooter();
    await service.updateGlobalFooter({ footerText: 'PolyV' });
    await service.getPvShowEnable();
    await service.updatePvShowEnable({ enabled: 'N' });

    expect(mockClient.v4User.updateDonateTemplate).toHaveBeenCalledWith({ donateGiftEnabled: 'Y' });
    expect(mockClient.v4User.updateMarqueeTemplate).toHaveBeenCalledWith({ enable: 'Y' });
    expect(mockClient.v4User.updateRoleConfigTemplate).toHaveBeenCalledWith({ teacherConfig: {} });
    expect(mockClient.v4User.updatePlaybackSetting).toHaveBeenCalledWith({ playbackEnabled: 'Y' });
    expect(mockClient.v4User.updateAudioModerationSetting).toHaveBeenCalledWith({ moderationEnabled: 'Y' });
    expect(mockClient.v4User.updateVideoModerationSetting).toHaveBeenCalledWith({ moderationEnabled: 'Y' });
    expect(mockClient.v4User.updateGlobalFooter).toHaveBeenCalledWith({ footerText: 'PolyV' });
    expect(mockClient.v4User.updatePvShowEnable).toHaveBeenCalledWith({ enabled: 'N' });
  });

  it('delegates log, billing, SMS, and statistics methods to V4UserService', async () => {
    const service = new UserSettingsServiceSdk(mockAuthConfig, mockServiceConfig);

    await service.sendSms({ phoneNumbers: ['13800138000'], templateParamNames: ['code'], templateParamValues: ['1234'] });
    await service.getMicDuration({ startTime: 1, endTime: 2 });
    await service.getMrConcurrencyDetail();
    await service.getBillUseDetailList({ itemCategory: 'duration', startDate: '2024-01-01', endDate: '2024-01-31' });
    await service.getWatchLogList({ pageNumber: 1, pageSize: 20 });
    await service.getWatchLogDetail({ viewerId: 'viewer-1' });

    expect(mockClient.v4User.sendSms).toHaveBeenCalledWith({ phoneNumbers: ['13800138000'], templateParamNames: ['code'], templateParamValues: ['1234'] });
    expect(mockClient.v4User.getMicDuration).toHaveBeenCalledWith({ startTime: 1, endTime: 2 });
    expect(mockClient.v4User.getMrConcurrencyDetail).toHaveBeenCalledWith();
    expect(mockClient.v4User.getBillUseDetailList).toHaveBeenCalledWith({ itemCategory: 'duration', startDate: '2024-01-01', endDate: '2024-01-31' });
    expect(mockClient.v4User.getWatchLogList).toHaveBeenCalledWith({ pageNumber: 1, pageSize: 20 });
    expect(mockClient.v4User.getWatchLogDetail).toHaveBeenCalledWith({ viewerId: 'viewer-1' });
  });
});
