import { ChannelHandler } from './channel.handler';
import { StreamHandler } from './stream.handler';
import { ProductHandler } from './product.handler';
import { ChatHandler } from './chat.handler';
import { TransmitHandler } from './transmit.handler';

const authConfig = { appId: 'app', appSecret: 'secret', userId: 'user' };
const serviceConfig = { baseUrl: 'https://api.polyv.net', timeout: 30000, debug: false };

describe('channel historical operate/state/marquee handlers', () => {
  let consoleLog: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLog = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleLog.mockRestore();
  });

  it('forwards channel historical writes after force confirmation', async () => {
    const service = {
      updateCallbackSetting: jest.fn().mockResolvedValue(true),
      setDiyUrlMarquee: jest.fn().mockResolvedValue(true),
      batchAddSubmeeting: jest.fn().mockResolvedValue(['2']),
      setMaxViewer: jest.fn().mockResolvedValue(true),
    };
    const handler = new ChannelHandler(authConfig, serviceConfig as any);
    (handler as any).channelService = service;

    await handler.updateCallbackSetting({
      channelId: '1',
      streamCallbackUrl: 'https://callback.test',
      force: true,
      output: 'json',
    });
    await handler.setDiyUrlMarquee({
      channelId: '1',
      marqueeRestrict: 'Y',
      url: 'https://example.test',
      force: true,
      output: 'json',
    });
    await handler.batchAddSubmeeting({
      channelId: '1',
      subChannels: [{ channelId: '2' }],
      force: true,
      output: 'json',
    });
    await handler.setMaxViewer({
      channelId: '1',
      userId: 'user',
      maxViewer: 100,
      force: true,
      output: 'json',
    });

    expect(service.updateCallbackSetting).toHaveBeenCalledWith('1', { streamCallbackUrl: 'https://callback.test' });
    expect(service.setDiyUrlMarquee).toHaveBeenCalledWith({ channelId: '1', marqueeRestrict: 'Y', url: 'https://example.test' });
    expect(service.batchAddSubmeeting).toHaveBeenCalledWith({ channelId: '1', subChannels: [{ channelId: '2' }] });
    expect(service.setMaxViewer).toHaveBeenCalledWith('1', 'user', 100);
  });

  it('forwards stream state writes after force confirmation', async () => {
    const service = {
      addDiskVideos: jest.fn().mockResolvedValue(true),
      deleteDiskVideos: jest.fn().mockResolvedValue(true),
      endDiskPush: jest.fn().mockResolvedValue(true),
      banPush: jest.fn().mockResolvedValue(true),
      resume: jest.fn().mockResolvedValue(true),
      updateStreamType: jest.fn().mockResolvedValue(true),
    };
    const handler = new StreamHandler(authConfig, serviceConfig as any);
    (handler as any).streamService = service;

    await handler.addDiskVideos({ channelId: '1', vids: ['vid1'], origin: 'vod', force: true, output: 'json' });
    await handler.deleteDiskVideos({ channelId: '1', vids: ['vid1'], force: true, output: 'json' });
    await handler.endDiskPush({ channelId: '1', diskVideoId: 'd1', force: true, output: 'json' });
    await handler.banPush({ channelId: '1', userId: 'user', forbidTime: 60, force: true, output: 'json' });
    await handler.resumePush({ channelId: '1', userId: 'user', force: true, output: 'json' });
    await handler.updateStreamType({ channelId: '1', streamType: 'pull', force: true, output: 'json' });

    expect(service.addDiskVideos).toHaveBeenCalledWith({ channelId: '1', vids: ['vid1'], origin: 'vod' });
    expect(service.deleteDiskVideos).toHaveBeenCalledWith({ channelId: '1', vids: ['vid1'] });
    expect(service.endDiskPush).toHaveBeenCalledWith({ channelId: '1', diskVideoId: 'd1' });
    expect(service.banPush).toHaveBeenCalledWith({ channelId: '1', userId: 'user', forbidTime: 60 });
    expect(service.resume).toHaveBeenCalledWith({ channelId: '1', userId: 'user' });
    expect(service.updateStreamType).toHaveBeenCalledWith({ channelId: '1', streamType: 'pull' });
  });

  it('forwards product, chat, and transmit historical writes after force confirmation', async () => {
    const productService = {
      batchAddChannelProducts: jest.fn().mockResolvedValue(true),
      batchDeleteChannelProducts: jest.fn().mockResolvedValue(true),
      pushChannelProduct: jest.fn().mockResolvedValue(true),
      referenceProduct: jest.fn().mockResolvedValue(true),
    };
    const productHandler = new ProductHandler(authConfig, serviceConfig as any);
    (productHandler as any).productService = productService;

    await productHandler.batchAddChannelProducts({ channelId: '1', products: [{ productId: 1 }], force: true, output: 'json' });
    await productHandler.batchDeleteChannelProducts({ channelId: '1', productIds: [1], force: true, output: 'json' });
    await productHandler.pushChannelProduct({ channelId: '1', productId: 1, force: true, output: 'json' });
    await productHandler.referenceProduct({ channelId: '1', originId: 'p1', status: 1, force: true, output: 'json' });

    expect(productService.batchAddChannelProducts).toHaveBeenCalledWith({ channelId: '1', products: [{ productId: 1 }] });
    expect(productService.batchDeleteChannelProducts).toHaveBeenCalledWith({ channelId: '1', productIds: [1] });
    expect(productService.pushChannelProduct).toHaveBeenCalledWith({ channelId: '1', productId: 1, force: true, output: 'json' });
    expect(productService.referenceProduct).toHaveBeenCalledWith({ channelId: '1', originId: 'p1', status: 1, force: true, output: 'json' });

    const chatService = {
      removeChatContents: jest.fn().mockResolvedValue(true),
    };
    const chatHandler = new ChatHandler(authConfig, serviceConfig as any);
    (chatHandler as any).chatService = chatService;

    await chatHandler.removeChatContents({ channelId: '1', ids: ['m1'], force: true, output: 'json' });
    expect(chatService.removeChatContents).toHaveBeenCalledWith({ channelId: '1', ids: ['m1'] });

    const transmitService = {
      associationReceiveChannels: jest.fn().mockResolvedValue(['2']),
    };
    const transmitHandler = new TransmitHandler(authConfig, serviceConfig as any);
    (transmitHandler as any).transmitService = transmitService;

    await transmitHandler.associationReceiveChannels({
      channelId: '1',
      receiveChannelIds: ['2'],
      type: 'add',
      force: true,
      output: 'json',
    });
    expect(transmitService.associationReceiveChannels).toHaveBeenCalledWith({
      channelId: '1',
      receiveChannelIds: ['2'],
      type: 'add',
    });
  });
});
