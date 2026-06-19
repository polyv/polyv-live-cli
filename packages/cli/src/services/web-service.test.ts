import type { AuthConfig } from '../types/auth';
import * as sdkModule from '../sdk';
import { WebServiceSdk } from './web-service';

jest.mock('../sdk', () => ({
  createSdkClient: jest.fn(),
}));

jest.mock('fs', () => ({
  readFileSync: jest.fn(() => Buffer.from('file')),
}));

const mockCreateSdkClient = sdkModule.createSdkClient as jest.MockedFunction<typeof sdkModule.createSdkClient>;

describe('WebServiceSdk', () => {
  const authConfig: AuthConfig = { appId: 'app', appSecret: 'secret' };
  const serviceConfig = {
    baseUrl: 'https://api.polyv.net',
    timeout: 30000,
    debug: false,
  };
  let web: Record<string, jest.Mock>;
  let service: WebServiceSdk;

  beforeEach(() => {
    web = {
      getSplash: jest.fn().mockResolvedValue({ splashEnabled: 'Y' }),
      setSplash: jest.fn().mockResolvedValue('success'),
      setPublisher: jest.fn().mockResolvedValue('123'),
      updateChannelName: jest.fn().mockResolvedValue(true),
      updateChannelLogo: jest.fn().mockResolvedValue('https://img.example/logo.png'),
      liveLikes: jest.fn().mockResolvedValue([]),
      updateLikes: jest.fn().mockResolvedValue('success'),
      getCountdown: jest.fn().mockResolvedValue({ countEnabled: 'Y' }),
      setCountdown: jest.fn().mockResolvedValue('success'),
      getMenuList: jest.fn().mockResolvedValue([]),
      addMenu: jest.fn().mockResolvedValue({ menuId: 'm1' }),
      deleteMenu: jest.fn().mockResolvedValue(1),
      updateMenu: jest.fn().mockResolvedValue('success'),
      setMenu: jest.fn().mockResolvedValue('success'),
      updateRank: jest.fn().mockResolvedValue('success'),
      updateConsultingEnabled: jest.fn().mockResolvedValue('success'),
      getTuwenList: jest.fn().mockResolvedValue({ contents: [] }),
      getDonate: jest.fn().mockResolvedValue({ donateCashEnabled: 'Y' }),
      updateCash: jest.fn().mockResolvedValue('success'),
      updateGood: jest.fn().mockResolvedValue('success'),
      getWeixinShare: jest.fn().mockResolvedValue({ channelId: '1' }),
      updateWeixinShare: jest.fn().mockResolvedValue('success'),
      updateGlobalEnabled: jest.fn().mockResolvedValue('success'),
      uploadImage: jest.fn().mockResolvedValue(['https://img.example/a.png']),
      uploadWhiteList: jest.fn().mockResolvedValue('true'),
      downloadWhiteList: jest.fn().mockResolvedValue(new ArrayBuffer(2)),
      setAuthType: jest.fn().mockResolvedValue('success'),
      setExternalAuth: jest.fn().mockResolvedValue([{ channelId: '1' }]),
      setAuthorizedAddress: jest.fn().mockResolvedValue([{ channelId: '1' }]),
      updateAuthUrl: jest.fn().mockResolvedValue('success'),
      getRecordField: jest.fn().mockResolvedValue({ infoFields: [] }),
      getRecordInfo: jest.fn().mockResolvedValue({ contents: [] }),
      enrollList: jest.fn().mockResolvedValue({ list: [] }),
      downloadRecordInfo: jest.fn().mockResolvedValue(new ArrayBuffer(3)),
    };
    mockCreateSdkClient.mockReturnValue({ web } as any);
    service = new WebServiceSdk(authConfig, serviceConfig);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('proxies watch page info APIs', async () => {
    await expect(service.getSplash('123')).resolves.toEqual({ splashEnabled: 'Y' });
    await expect(service.setSplash({ channelId: '123', splashEnabled: 'Y' })).resolves.toBe('success');
    await expect(service.setPublisher({ userId: 'u1', publisher: 'Host' })).resolves.toBe('123');
    await expect(service.updateChannelName({ channelId: '123', name: 'Live' })).resolves.toBe(true);
    await expect(service.updateChannelLogo({ channelId: '123', imgfile: '/tmp/logo.png' })).resolves.toBe('https://img.example/logo.png');
    await expect(service.liveLikes('123,456')).resolves.toEqual([]);
    await expect(service.updateLikes({ channelId: '123', likes: 10 })).resolves.toBe('success');
    await expect(service.getCountdown('123')).resolves.toEqual({ countEnabled: 'Y' });
    await expect(service.setCountdown({ channelId: '123', bookingEnabled: 'Y' })).resolves.toBe('success');

    expect(web.updateChannelLogo).toHaveBeenCalledWith(expect.objectContaining({ channelId: '123', imgfile: expect.any(Blob) }));
  });

  it('proxies menu and page interaction APIs', async () => {
    await expect(service.getMenuList({ channelId: '123' })).resolves.toEqual([]);
    await expect(service.addMenu({ channelId: '123', name: 'Intro', type: 'text' })).resolves.toEqual({ menuId: 'm1' });
    await expect(service.deleteMenu({ menuIds: 'm1' })).resolves.toBe(1);
    await expect(service.updateMenu({ channelId: '123', menuId: 'm1', content: 'content' })).resolves.toBe('success');
    await expect(service.setMenu({ userId: 'u1', channelId: '123', menuType: 'desc', content: 'intro' })).resolves.toBe('success');
    await expect(service.updateRank({ channelId: '123', menuIds: 'm1,m2' })).resolves.toBe('success');
    await expect(service.updateConsultingEnabled({ channelId: '123', enabled: 'Y' })).resolves.toBe('success');
    await expect(service.getTuwenList({ channelId: '123' })).resolves.toEqual({ contents: [] });
    await expect(service.getDonate('123')).resolves.toEqual({ donateCashEnabled: 'Y' });
    await expect(service.updateCash({ cashes: [1, 2, 3, 4, 5, 6], cashMin: 1 })).resolves.toBe('success');
    await expect(service.updateGood({ goods: [{ goodName: 'A', goodImg: 'https://img.example/a.png', goodPrice: 1, goodEnabled: 'Y' }] })).resolves.toBe('success');
    await expect(service.getWeixinShare('123')).resolves.toEqual({ channelId: '1' });
    await expect(service.updateWeixinShare({ channelId: '123' })).resolves.toBe('success');
    await expect(service.updateGlobalEnabled({ channelId: '123', globalEnabledType: 'donate', enabled: 'Y' })).resolves.toBe('success');
    await expect(service.uploadImage({ type: 'coverImage', files: ['/tmp/a.png'] })).resolves.toEqual(['https://img.example/a.png']);

    expect(web.uploadImage).toHaveBeenCalledWith({ type: 'coverImage', files: [expect.any(Blob)] });
  });

  it('proxies watch condition registration and whitelist APIs', async () => {
    await expect(service.uploadWhiteList({ rank: 1, file: '/tmp/white.xlsx' })).resolves.toBe('true');
    await expect(service.downloadWhiteList({ rank: 1 })).resolves.toBeInstanceOf(ArrayBuffer);
    await expect(service.setAuthType({ channelId: '123', authType: 'none' })).resolves.toBe('success');
    await expect(service.setExternalAuth({ userId: 'u1', externalUri: 'https://auth.example' })).resolves.toEqual([{ channelId: '1' }]);
    await expect(service.setAuthorizedAddress({ userId: 'u1', customUri: 'https://auth.example' })).resolves.toEqual([{ channelId: '1' }]);
    await expect(service.updateAuthUrl({ channelId: '123', url: 'https://auth.example' })).resolves.toBe('success');
    await expect(service.getRecordField({ channelId: '123' })).resolves.toEqual({ infoFields: [] });
    await expect(service.getRecordInfo({ channelId: '123' })).resolves.toEqual({ contents: [] });
    await expect(service.enrollList({ channelId: '123' })).resolves.toEqual({ list: [] });
    await expect(service.downloadRecordInfo({ channelId: '123' })).resolves.toBeInstanceOf(ArrayBuffer);

    expect(web.uploadWhiteList).toHaveBeenCalledWith(expect.objectContaining({ rank: 1, file: expect.any(Blob) }));
  });
});
