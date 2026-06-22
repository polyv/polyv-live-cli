import { PolyVClient } from 'polyv-live-api-sdk';
import { createSdkClient } from '../sdk';
import { CardPushServiceSdk } from './card-push-service';
import { ProductServiceSdk } from './product.service.sdk';
import { ChatServiceSdk } from './chat.service.sdk';
import { CouponHandler } from '../handlers/coupon.handler';
import type { AuthConfig } from '../types/auth';

jest.mock('polyv-live-api-sdk', () => ({
  PolyVClient: jest.fn(),
}));

jest.mock('../sdk', () => ({
  createSdkClient: jest.fn(),
}));

const MockPolyVClient = PolyVClient as jest.MockedClass<typeof PolyVClient>;
const mockCreateSdkClient = createSdkClient as jest.MockedFunction<typeof createSdkClient>;

describe('v4 channel marketing/content CLI wrappers', () => {
  const authConfig: AuthConfig = { appId: 'app', appSecret: 'secret' };
  const serviceConfig = { baseUrl: 'https://api.polyv.net', timeout: 30000, debug: false };
  let v4Channel: Record<string, jest.Mock>;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    v4Channel = {
      shareGet: jest.fn().mockResolvedValue({ shareBtnEnable: 'Y' }),
      shareUpdate: jest.fn().mockResolvedValue({ shareBtnEnable: 'N' }),
      getCouponEnabled: jest.fn().mockResolvedValue({ enabled: 'Y' }),
      updateCouponEnabled: jest.fn().mockResolvedValue(undefined),
      listChannelCoupons: jest.fn().mockResolvedValue({ contents: [], total: 0 }),
      addChannelCoupon: jest.fn().mockResolvedValue(true),
      deleteChannelCoupons: jest.fn().mockResolvedValue(undefined),
      getProductPushRule: jest.fn().mockResolvedValue({ productPushRule: 'smallCard' }),
      updateProductPushRule: jest.fn().mockResolvedValue(undefined),
      productTagList: jest.fn().mockResolvedValue({ contents: [], total: 0 }),
      productTagCreate: jest.fn().mockResolvedValue({ id: 1, name: 'tag' }),
      productTagUpdate: jest.fn().mockResolvedValue(undefined),
      productTagDelete: jest.fn().mockResolvedValue(undefined),
      listProductStats: jest.fn().mockResolvedValue({ contents: [], total: 0 }),
      getProductStatsSummary: jest.fn().mockResolvedValue({ clicks: 0 }),
      sortChannelProductRank: jest.fn().mockResolvedValue(undefined),
      toppingChannelProduct: jest.fn().mockResolvedValue(undefined),
      untoppingChannelProduct: jest.fn().mockResolvedValue(undefined),
      batchUpdateChatEnabled: jest.fn().mockResolvedValue(undefined),
      logoutWatchViewer: jest.fn().mockResolvedValue(undefined),
    };
    MockPolyVClient.mockImplementation(() => ({ v4Channel }) as any);
    mockCreateSdkClient.mockReturnValue({ v4Channel } as any);
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('delegates channel share commands through V4ChannelService', async () => {
    const service = new CardPushServiceSdk(authConfig, serviceConfig);

    await service.getShare('3151318');
    await service.updateShare({
      channelId: '3151318',
      shareBtnEnable: 'N',
      titleType: 'follow',
      weixinShareTitle: 'Share title',
    });

    expect(v4Channel.shareGet).toHaveBeenCalledWith({ channelId: '3151318' });
    expect(v4Channel.shareUpdate).toHaveBeenCalledWith({
      channelId: '3151318',
      shareBtnEnable: 'N',
      titleType: 'follow',
      weixinShareTitle: 'Share title',
    });
  });

  it('delegates product setting, tags, stats, and rank actions through V4ChannelService', async () => {
    const service = new ProductServiceSdk(authConfig, serviceConfig);

    await service.getProductPushRule({ channelId: '3151318' });
    await service.updateProductPushRule({
      channelId: '3151318',
      productExplainEnabled: 'Y',
      productPushRule: 'bigCard',
      productTagSortOrderIds: [1, 2],
    });
    await service.listChannelProductTags({ channelId: '3151318', page: 2, size: 10 });
    await service.createChannelProductTag({ channelId: '3151318', name: 'tag' });
    await service.updateChannelProductTag({ channelId: '3151318', id: 1, name: 'tag2' });
    await service.deleteChannelProductTag({ channelId: '3151318', id: 1 });
    await service.listProductStats({ channelId: '3151318', productId: '100', sessionId: 'session-1' });
    await service.getProductStatsSummary({ channelId: '3151318', sessionId: 'session-1' });
    await service.sortChannelProductRank({ channelId: '3151318', productId: 100, rank: 1 });
    await service.toppingChannelProduct({ channelId: '3151318', productId: 100 });
    await service.untoppingChannelProduct({ channelId: '3151318', productId: 100 });

    expect(v4Channel.getProductPushRule).toHaveBeenCalledWith({ channelId: '3151318' });
    expect(v4Channel.updateProductPushRule).toHaveBeenCalledWith(expect.objectContaining({
      channelId: '3151318',
      productExplainEnabled: 'Y',
      productPushRule: 'bigCard',
      productTagSortOrderIds: [1, 2],
    }));
    expect(v4Channel.productTagList).toHaveBeenCalledWith({ channelId: '3151318', pageNumber: 2, pageSize: 10 });
    expect(v4Channel.productTagCreate).toHaveBeenCalledWith({ channelId: '3151318', name: 'tag' });
    expect(v4Channel.productTagUpdate).toHaveBeenCalledWith({ channelId: '3151318', id: 1, name: 'tag2' });
    expect(v4Channel.productTagDelete).toHaveBeenCalledWith({ channelId: '3151318', id: 1 });
    expect(v4Channel.listProductStats).toHaveBeenCalledWith(expect.objectContaining({ channelId: '3151318', productId: '100', sessionId: 'session-1' }));
    expect(v4Channel.getProductStatsSummary).toHaveBeenCalledWith({ channelId: '3151318', sessionId: 'session-1' });
    expect(v4Channel.sortChannelProductRank).toHaveBeenCalledWith({ channelId: '3151318', productId: 100, rank: 1 });
    expect(v4Channel.toppingChannelProduct).toHaveBeenCalledWith({ channelId: '3151318', productId: 100 });
    expect(v4Channel.untoppingChannelProduct).toHaveBeenCalledWith({ channelId: '3151318', productId: 100 });
  });

  it('delegates channel coupon commands through V4ChannelService', async () => {
    const handler = new CouponHandler(authConfig, serviceConfig);

    await handler.getChannelCouponEnabled({ channelId: '3151318', output: 'json' });
    await handler.updateChannelCouponEnabled({ channelId: '3151318', enabled: 'N', force: true, output: 'json' });
    await handler.listChannelCoupons({ channelId: '3151318', page: 1, size: 10, name: 'coupon', output: 'json' });
    await handler.addChannelCoupons({ channelId: '3151318', couponIds: ['coupon-1'], force: true, output: 'json' });
    await handler.deleteChannelCoupons({ channelId: '3151318', couponIds: ['coupon-1'], force: true, output: 'json' });

    expect(v4Channel.getCouponEnabled).toHaveBeenCalledWith({ channelId: '3151318' });
    expect(v4Channel.updateCouponEnabled).toHaveBeenCalledWith({ channelId: '3151318', enabled: 'N' });
    expect(v4Channel.listChannelCoupons).toHaveBeenCalledWith({ channelId: '3151318', pageNumber: 1, pageSize: 10, name: 'coupon' });
    expect(v4Channel.addChannelCoupon).toHaveBeenCalledWith({ channelId: '3151318', couponIds: ['coupon-1'] });
    expect(v4Channel.deleteChannelCoupons).toHaveBeenCalledWith({ channelId: '3151318', couponIds: ['coupon-1'] });
  });

  it('delegates chat switch and watch logout through V4ChannelService', async () => {
    const service = new ChatServiceSdk(authConfig, serviceConfig);

    await service.batchUpdateChatEnabled({ channelIds: ['3151318'], chatEnabled: 'N' });
    await service.logoutWatchViewer({ channelId: '3151318', token: 'viewer-token' });

    expect(v4Channel.batchUpdateChatEnabled).toHaveBeenCalledWith({ channelIds: ['3151318'], chatEnabled: 'N' });
    expect(v4Channel.logoutWatchViewer).toHaveBeenCalledWith({ channelId: '3151318', token: 'viewer-token' });
  });
});
