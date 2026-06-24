/**
 * Tests for AccountServiceSdk.
 */

import { AccountServiceSdk } from './account-service';
import * as sdkModule from '../sdk';
import type { AuthConfig } from '../types/auth';

jest.mock('../sdk', () => ({
  createSdkClient: jest.fn(),
}));

const mockCreateSdkClient = sdkModule.createSdkClient as jest.MockedFunction<typeof sdkModule.createSdkClient>;

describe('AccountServiceSdk', () => {
  const authConfig: AuthConfig = {
    appId: 'app-id',
    appSecret: 'app-secret',
  };
  const serviceConfig = {
    baseUrl: 'https://api.polyv.net',
    timeout: 30000,
    debug: false,
  };
  let account: Record<string, jest.Mock>;
  let service: AccountServiceSdk;

  beforeEach(() => {
    account = {
      channels: jest.fn().mockResolvedValue({ channels: ['1'] }),
      userPlaybackList: jest.fn().mockResolvedValue({ contents: [], total: 0 }),
      userChannelBasicList: jest.fn().mockResolvedValue({ contents: [] }),
      getSimpleChannelList: jest.fn().mockResolvedValue({ contents: [] }),
      channelDetailList: jest.fn().mockResolvedValue({ contents: [] }),
      getUserDurations: jest.fn().mockResolvedValue({ available: 1, used: 0 }),
      micDuration: jest.fn().mockResolvedValue({ available: 1, history: 0 }),
      getIncomeDetail: jest.fn().mockResolvedValue({ contents: [] }),
      getCategoryList: jest.fn().mockResolvedValue({ categories: [] }),
      createCategory: jest.fn().mockResolvedValue({ categoryId: 1 }),
      receiveList: jest.fn().mockResolvedValue({ contents: [] }),
      deleteCategory: jest.fn().mockResolvedValue({ success: true }),
      updateCategoryName: jest.fn().mockResolvedValue({ success: true }),
      updateCategoryRank: jest.fn().mockResolvedValue({ success: true }),
      setUserLoginToken: jest.fn().mockResolvedValue({ success: true }),
      setUserChildrenLoginToken: jest.fn().mockResolvedValue({ success: true }),
      setStreamCallback: jest.fn().mockResolvedValue({ success: true }),
      setRecordCallback: jest.fn().mockResolvedValue({ success: true }),
      setPlaybackCallback: jest.fn().mockResolvedValue({ success: true }),
    };
    mockCreateSdkClient.mockReturnValue({ account } as any);
    service = new AccountServiceSdk(authConfig, serviceConfig);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call account read APIs', async () => {
    await service.channels({ keyword: 'demo' });
    await service.userPlaybackList({ page: 1 });
    await service.userChannelBasicList({ pageSize: 20 });
    await service.getSimpleChannelList({ categoryId: '1' });
    await service.channelDetailList({ watchStatus: 'live' });
    await service.getUserDurations();
    await service.micDuration();
    await service.getIncomeDetail({ userId: 'u1', startDate: '2026-01-01', endDate: '2026-01-31' });
    await service.getCategoryList();
    await service.receiveList({ channelId: '3151318' });

    expect(account.channels).toHaveBeenCalledWith({ keyword: 'demo' });
    expect(account.userPlaybackList).toHaveBeenCalledWith({ page: 1 });
    expect(account.userChannelBasicList).toHaveBeenCalledWith({ pageSize: 20 });
    expect(account.getSimpleChannelList).toHaveBeenCalledWith({ categoryId: '1' });
    expect(account.channelDetailList).toHaveBeenCalledWith({ watchStatus: 'live' });
    expect(account.getUserDurations).toHaveBeenCalled();
    expect(account.micDuration).toHaveBeenCalled();
    expect(account.getIncomeDetail).toHaveBeenCalledWith({ userId: 'u1', startDate: '2026-01-01', endDate: '2026-01-31' });
    expect(account.getCategoryList).toHaveBeenCalled();
    expect(account.receiveList).toHaveBeenCalledWith({ channelId: '3151318' });
  });

  it('should call account write APIs', async () => {
    await service.createCategory('category');
    await service.deleteCategory(1);
    await service.updateCategoryName(1, 'new name');
    await service.updateCategoryRank(1, 10);
    // note: 2nd arg is afterCategoryId (move category 1 to after category 10)
    await service.setUserLoginToken({ token: 'token' });
    await service.setUserChildrenLoginToken({ childEmail: 'child@example.com', token: 'token' });
    await service.setStreamCallback({ userId: 'u1', url: 'https://example.com/stream' });
    await service.setRecordCallback({ userId: 'u1', url: 'https://example.com/record' });
    await service.setPlaybackCallback({ userId: 'u1', url: 'https://example.com/playback' });

    expect(account.createCategory).toHaveBeenCalledWith({ categoryName: 'category' });
    expect(account.deleteCategory).toHaveBeenCalledWith({ categoryId: 1 });
    expect(account.updateCategoryName).toHaveBeenCalledWith({ categoryId: 1, categoryName: 'new name' });
    expect(account.updateCategoryRank).toHaveBeenCalledWith({ categoryId: 1, afterCategoryId: 10 });
    expect(account.setUserLoginToken).toHaveBeenCalledWith({ token: 'token' });
    expect(account.setUserChildrenLoginToken).toHaveBeenCalledWith({ childEmail: 'child@example.com', token: 'token' });
    expect(account.setStreamCallback).toHaveBeenCalledWith({ userId: 'u1', url: 'https://example.com/stream' });
    expect(account.setRecordCallback).toHaveBeenCalledWith({ userId: 'u1', url: 'https://example.com/record' });
    expect(account.setPlaybackCallback).toHaveBeenCalledWith({ userId: 'u1', url: 'https://example.com/playback' });
  });
});
