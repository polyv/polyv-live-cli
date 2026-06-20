import { ChannelServiceSdk } from './channel.service.sdk';
import { StreamServiceSdk } from './stream.service.sdk';
import { ProductServiceSdk } from './product.service.sdk';
import { ChatServiceSdk } from './chat.service.sdk';
import { TransmitServiceSdk } from './transmit-service';
import { createSdkClient } from '../sdk';

jest.mock('../sdk', () => ({
  createSdkClient: jest.fn(),
}));

const authConfig = { appId: 'app', appSecret: 'secret', userId: 'user' };
const serviceConfig = { baseUrl: 'https://api.polyv.net', timeout: 30000, debug: false };

describe('channel historical operate/state/marquee service wrappers', () => {
  let sdkClient: any;

  beforeEach(() => {
    sdkClient = {
      channel: {
        getAccount: jest.fn().mockResolvedValue({ account: 'a1' }),
        getAccounts: jest.fn().mockResolvedValue([]),
        deleteAccount: jest.fn().mockResolvedValue(true),
        batchCreateAccounts: jest.fn().mockResolvedValue([]),
        getChannelAdverts: jest.fn().mockResolvedValue([]),
        getCallbackSetting: jest.fn().mockResolvedValue({}),
        updateCallbackSetting: jest.fn().mockResolvedValue(true),
        getPptRecordSetting: jest.fn().mockResolvedValue({}),
        listPptRecordTasks: jest.fn().mockResolvedValue({ contents: [] }),
        addPptRecordTask: jest.fn().mockResolvedValue({ taskId: 't1' }),
        updatePptRecordSetting: jest.fn().mockResolvedValue(true),
        deletePptRecord: jest.fn().mockResolvedValue(true),
        copyChannel: jest.fn().mockResolvedValue('copy1'),
        getUserChildrenChannels: jest.fn().mockResolvedValue({ contents: [] }),
        getWatchApiToken: jest.fn().mockResolvedValue('watch-token'),
        getApiToken: jest.fn().mockResolvedValue('api-token'),
        getTokenLoginUrl: jest.fn().mockResolvedValue('https://example.test/login'),
        getChatToken: jest.fn().mockResolvedValue('chat-token'),
        listChannelsFollow: jest.fn().mockResolvedValue([]),
        updateChannelsFollow: jest.fn().mockResolvedValue(true),
        batchAddSubmeeting: jest.fn().mockResolvedValue([]),
        channelsStopQuestionnaire: jest.fn().mockResolvedValue(true),
        batchUpdateDanmu: jest.fn().mockResolvedValue(true),
        setChannelToken: jest.fn().mockResolvedValue(true),
        setAccountToken: jest.fn().mockResolvedValue(true),
        setMaxViewer: jest.fn().mockResolvedValue(true),
        updateChannelPassword: jest.fn().mockResolvedValue(true),
        setDiyUrlMarquee: jest.fn().mockResolvedValue(true),
        getLiveStatus: jest.fn().mockResolvedValue('live'),
        getLiveStatusList: jest.fn().mockResolvedValue([]),
        getStreams: jest.fn().mockResolvedValue([]),
        listDiskVideo: jest.fn().mockResolvedValue({ contents: [] }),
        getCaptureImage: jest.fn().mockResolvedValue('https://example.test/capture.jpg'),
        addDiskVideos: jest.fn().mockResolvedValue(true),
        deleteDiskVideos: jest.fn().mockResolvedValue(true),
        endDiskPush: jest.fn().mockResolvedValue(true),
        banPush: jest.fn().mockResolvedValue(true),
        resume: jest.fn().mockResolvedValue(true),
        updateStreamType: jest.fn().mockResolvedValue(true),
        getChannelProductEnabled: jest.fn().mockResolvedValue({ enabled: 'Y' }),
        batchAddChannelProducts: jest.fn().mockResolvedValue(true),
        batchDeleteChannelProducts: jest.fn().mockResolvedValue(true),
        batchShelfChannelProducts: jest.fn().mockResolvedValue(true),
        shelfChannelProduct: jest.fn().mockResolvedValue(true),
        sortChannelProduct: jest.fn().mockResolvedValue(true),
        pushChannelProduct: jest.fn().mockResolvedValue(true),
        cancelPushChannelProduct: jest.fn().mockResolvedValue(true),
        referenceProduct: jest.fn().mockResolvedValue(true),
        getChatOnlineCount: jest.fn().mockResolvedValue(3),
        removeChatContents: jest.fn().mockResolvedValue(true),
        associationReceiveChannels: jest.fn().mockResolvedValue(['2']),
      },
    };
    (createSdkClient as jest.Mock).mockReturnValue(sdkClient);
  });

  it('delegates channel operate and marquee wrappers to SDK methods', async () => {
    const service = new ChannelServiceSdk(authConfig, serviceConfig);

    await service.getAccount('1', 'a1');
    await service.getAccounts('1');
    await service.deleteAccount('1', 'a1');
    await service.batchCreateAccounts('1', [{ account: 'a1' }]);
    await service.updateCallbackSetting('1', { streamCallbackUrl: 'https://callback.test' });
    await service.addPptRecordTask({ channelId: '1', videoId: 'v1' });
    await service.copyChannel('1', { newChannelName: 'copy' });
    await service.updateChannelsFollow({ channelIds: ['1'], qrCodeUrl: 'https://img.test/qr.png' });
    await service.batchAddSubmeeting({ channelId: '1', subChannels: [{ channelId: '2' }] });
    await service.batchUpdateDanmu({ channelIds: ['1'], closeDanmu: 'Y', showDanmuInfoEnabled: 'N' });
    await service.setChannelToken({ channelId: '1', token: 'token' });
    await service.setAccountToken({ channelId: '1', token: 'token' });
    await service.setMaxViewer('1', 'user', 100);
    await service.updateChannelPassword('user', 'pass123', '1');
    await service.setDiyUrlMarquee({ channelId: '1', marqueeRestrict: 'Y', url: 'https://example.test' });

    expect(sdkClient.channel.getAccount).toHaveBeenCalledWith('1', 'a1');
    expect(sdkClient.channel.batchCreateAccounts).toHaveBeenCalledWith('1', [{ account: 'a1' }]);
    expect(sdkClient.channel.updateCallbackSetting).toHaveBeenCalledWith('1', { streamCallbackUrl: 'https://callback.test' });
    expect(sdkClient.channel.addPptRecordTask).toHaveBeenCalledWith({ channelId: '1', videoId: 'v1' });
    expect(sdkClient.channel.copyChannel).toHaveBeenCalledWith('1', { newChannelName: 'copy' });
    expect(sdkClient.channel.updateChannelsFollow).toHaveBeenCalledWith({ channelIds: ['1'], qrCodeUrl: 'https://img.test/qr.png' });
    expect(sdkClient.channel.batchAddSubmeeting).toHaveBeenCalledWith({ channelId: '1', subChannels: [{ channelId: '2' }] });
    expect(sdkClient.channel.batchUpdateDanmu).toHaveBeenCalledWith({ channelIds: ['1'], closeDanmu: 'Y', showDanmuInfoEnabled: 'N' });
    expect(sdkClient.channel.setChannelToken).toHaveBeenCalledWith({ channelId: '1', token: 'token' });
    expect(sdkClient.channel.setAccountToken).toHaveBeenCalledWith({ channelId: '1', token: 'token' });
    expect(sdkClient.channel.setMaxViewer).toHaveBeenCalledWith('1', 'user', 100);
    expect(sdkClient.channel.updateChannelPassword).toHaveBeenCalledWith('user', 'pass123', '1');
    expect(sdkClient.channel.setDiyUrlMarquee).toHaveBeenCalledWith({ channelId: '1', marqueeRestrict: 'Y', url: 'https://example.test' });
  });

  it('delegates stream state wrappers to channel SDK methods', async () => {
    const service = new StreamServiceSdk(authConfig, serviceConfig);

    await service.getLiveStatus('stream1');
    await service.getLiveStatusList({ channelIds: ['1', '2'] });
    await service.getStreams({ channelIds: ['1', '2'] });
    await service.listDiskVideo({ channelId: '1', page: 1 });
    await service.getCaptureImage('1');
    await service.addDiskVideos({ channelId: '1', vids: ['vid1'], origin: 'vod' });
    await service.deleteDiskVideos({ channelId: '1', vids: ['vid1'] });
    await service.endDiskPush({ channelId: '1', diskVideoId: 'd1' });
    await service.banPush({ channelId: '1', userId: 'user', forbidTime: 60 });
    await service.resume({ channelId: '1', userId: 'user' });
    await service.updateStreamType({ channelId: '1', streamType: 'pull' });

    expect(sdkClient.channel.getLiveStatus).toHaveBeenCalledWith('stream1');
    expect(sdkClient.channel.getLiveStatusList).toHaveBeenCalledWith({ channelIds: ['1', '2'] });
    expect(sdkClient.channel.addDiskVideos).toHaveBeenCalledWith({ channelId: '1', vids: ['vid1'], origin: 'vod' });
    expect(sdkClient.channel.banPush).toHaveBeenCalledWith({ channelId: '1', userId: 'user', forbidTime: 60 });
    expect(sdkClient.channel.resume).toHaveBeenCalledWith({ channelId: '1', userId: 'user' });
    expect(sdkClient.channel.updateStreamType).toHaveBeenCalledWith({ channelId: '1', streamType: 'pull' });
  });

  it('delegates product, chat, and transmit historical wrappers to SDK methods', async () => {
    const product = new ProductServiceSdk(authConfig, serviceConfig);
    const chat = new ChatServiceSdk(authConfig, serviceConfig);
    const transmit = new TransmitServiceSdk(authConfig, serviceConfig);
    const transmitChannel = {
      associationReceiveChannels: jest.fn().mockResolvedValue(['2']),
    };
    (transmit as any).channel = transmitChannel;

    await product.getChannelProductEnabled('1');
    await product.batchAddChannelProducts({ channelId: '1', products: [{ productId: 1 }] });
    await product.batchDeleteChannelProducts({ channelId: '1', productIds: [1] });
    await product.batchShelfChannelProducts({ channelId: '1', productIds: [1], shelf: 1 });
    await product.pushChannelProduct({ channelId: '1', productId: 1 });
    await product.cancelPushChannelProduct({ channelId: '1', productId: 1 });
    await product.referenceProduct({ channelId: '1', originId: 'p1', status: 1 });
    await chat.getChatOnlineCount('1');
    await chat.removeChatContents({ channelId: '1', ids: ['m1'] });
    await transmit.associationReceiveChannels({ channelId: '1', receiveChannelIds: ['2'], type: 'add' });

    expect(sdkClient.channel.getChannelProductEnabled).toHaveBeenCalledWith('1');
    expect(sdkClient.channel.batchAddChannelProducts).toHaveBeenCalledWith({ channelId: '1', products: [{ productId: 1 }] });
    expect(sdkClient.channel.batchDeleteChannelProducts).toHaveBeenCalledWith({ channelId: '1', productIds: [1] });
    expect(sdkClient.channel.batchShelfChannelProducts).toHaveBeenCalledWith({ channelId: '1', productIds: [1], shelf: 1 });
    expect(sdkClient.channel.pushChannelProduct).toHaveBeenCalledWith({ channelId: '1', productId: 1 });
    expect(sdkClient.channel.cancelPushChannelProduct).toHaveBeenCalledWith({ channelId: '1', productId: 1 });
    expect(sdkClient.channel.referenceProduct).toHaveBeenCalledWith({ channelId: '1', originId: 'p1', status: 1 });
    expect(sdkClient.channel.getChatOnlineCount).toHaveBeenCalledWith('1');
    expect(sdkClient.channel.removeChatContents).toHaveBeenCalledWith({ channelId: '1', ids: ['m1'] });
    expect(transmitChannel.associationReceiveChannels).toHaveBeenCalledWith({ channelId: '1', receiveChannelIds: ['2'], type: 'add' });
  });
});
