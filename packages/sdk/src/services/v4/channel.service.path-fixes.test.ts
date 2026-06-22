import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { PolyVClient } from '../../client.js';
import { V4ChannelService } from './channel.service.js';

const mockHttpClient = {
  get: vi.fn(),
  post: vi.fn(),
};

const mockClient = {
  httpClient: mockHttpClient,
} as unknown as PolyVClient;

describe('V4ChannelService path fixes', () => {
  let service: V4ChannelService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new V4ChannelService(mockClient);
  });

  it('uses the documented lottery activity paths and body/query split', async () => {
    mockHttpClient.get.mockResolvedValue({});
    mockHttpClient.post.mockResolvedValue({});

    const lotteryBody = {
      channelId: '123',
      activityName: 'Sale',
      lotteryCondition: 'duration',
      amount: 1,
      prizeName: 'Coupon',
      activityDuration: '10',
      activityDurationType: 'minute',
    };

    await service.lotteryActivityCreate(lotteryBody);
    await service.lotteryActivityGet({ channelId: '123', id: '7' });
    await service.lotteryActivityList({ channelId: '123', pageNumber: 1, pageSize: 10 });
    await service.lotteryActivityUpdate({ ...lotteryBody, id: '7' });
    await service.lotteryActivityDelete({ channelId: '123', id: '7' });

    expect(mockHttpClient.post).toHaveBeenCalledWith(
      '/live/v4/channel/lottery-activity/create',
      {
        activityName: 'Sale',
        lotteryCondition: 'duration',
        amount: 1,
        prizeName: 'Coupon',
        activityDuration: '10',
        activityDurationType: 'minute',
      },
      { params: { channelId: '123' } }
    );
    expect(mockHttpClient.get).toHaveBeenCalledWith('/live/v4/channel/lottery-activity/get', {
      params: { channelId: '123', id: '7' },
    });
    expect(mockHttpClient.get).toHaveBeenCalledWith('/live/v4/channel/lottery-activity/list', {
      params: { channelId: '123', pageNumber: 1, pageSize: 10 },
    });
    expect(mockHttpClient.post).toHaveBeenCalledWith(
      '/live/v4/channel/lottery-activity/update',
      {
        id: '7',
        activityName: 'Sale',
        lotteryCondition: 'duration',
        amount: 1,
        prizeName: 'Coupon',
        activityDuration: '10',
        activityDurationType: 'minute',
      },
      { params: { channelId: '123' } }
    );
    expect(mockHttpClient.post).toHaveBeenCalledWith(
      '/live/v4/channel/lottery-activity/delete',
      { id: '7' },
      { params: { channelId: '123' } }
    );
  });

  it('uses the documented card-push and share paths', async () => {
    mockHttpClient.get.mockResolvedValue({});
    mockHttpClient.post.mockResolvedValue({});

    await service.listCardPushes({ channelId: '123' });
    await service.cardPushCreate({
      channelId: '123',
      imageType: 'custom',
      title: 'Card',
      link: 'https://example.com',
      duration: 5,
      showCondition: 'PUSH',
    });
    await service.cardPushUpdate({ channelId: '123', cardPushId: '1', title: 'New Card', duration: 10 });
    await service.cardPushDelete({ channelId: '123', cardPushId: '1' });
    await service.cardPushPush({ channelId: '123', cardPushId: '1' });
    await service.cardPushCancelPush({ channelId: '123', cardPushId: '1' });
    await service.shareGet({ channelId: '123' });
    await service.shareUpdate({ channelId: '123', shareBtnEnable: 'Y', titleType: 'follow' });

    expect(mockHttpClient.get).toHaveBeenCalledWith('/live/v4/channel/card-push/list', {
      params: { channelId: '123' },
    });
    expect(mockHttpClient.get).toHaveBeenCalledWith('/live/v4/channel/card-push/create', {
      params: {
        channelId: '123',
        imageType: 'custom',
        title: 'Card',
        link: 'https://example.com',
        duration: 5,
        showCondition: 'PUSH',
      },
    });
    expect(mockHttpClient.post).toHaveBeenCalledWith(
      '/live/v4/channel/card-push/update',
      { title: 'New Card', duration: 10 },
      { params: { channelId: '123', cardPushId: '1' } }
    );
    expect(mockHttpClient.post).toHaveBeenCalledWith(
      '/live/v4/channel/card-push/delete',
      null,
      { params: { channelId: '123', cardPushId: '1' } }
    );
    expect(mockHttpClient.post).toHaveBeenCalledWith(
      '/live/v4/channel/card-push/push',
      null,
      { params: { channelId: '123', cardPushId: '1' } }
    );
    expect(mockHttpClient.post).toHaveBeenCalledWith(
      '/live/v4/channel/card-push/cancel-push',
      null,
      { params: { channelId: '123', cardPushId: '1' } }
    );
    expect(mockHttpClient.get).toHaveBeenCalledWith('/live/v4/channel/share/get', {
      params: { channelId: '123' },
    });
    expect(mockHttpClient.get).toHaveBeenCalledWith('/live/v4/channel/share/update', {
      params: { channelId: '123', shareBtnEnable: 'Y', titleType: 'follow' },
    });
  });

  it('uses the documented channel product tag paths', async () => {
    mockHttpClient.get.mockResolvedValue({});
    mockHttpClient.post.mockResolvedValue({});

    await service.productTagCreate({ channelId: '123', name: 'Hot' });
    await service.productTagList({ channelId: '123', pageNumber: 1, pageSize: 10 });
    await service.productTagUpdate({ channelId: '123', id: '7', name: 'New Hot' });
    await service.productTagDelete({ channelId: '123', id: '7' });

    expect(mockHttpClient.post).toHaveBeenCalledWith(
      '/live/v4/channel/product/tag/create',
      { name: 'Hot' },
      { params: { channelId: '123' } }
    );
    expect(mockHttpClient.get).toHaveBeenCalledWith('/live/v4/channel/product/tag/list', {
      params: { channelId: '123', pageNumber: 1, pageSize: 10 },
    });
    expect(mockHttpClient.post).toHaveBeenCalledWith(
      '/live/v4/channel/product/tag/update',
      { id: '7', name: 'New Hot' },
      { params: { channelId: '123' } }
    );
    expect(mockHttpClient.post).toHaveBeenCalledWith(
      '/live/v4/channel/product/tag/delete',
      { id: '7' },
      { params: { channelId: '123' } }
    );
  });

  it('uses the documented donate gift update and reward record paths', async () => {
    mockHttpClient.get.mockResolvedValue({});
    mockHttpClient.post.mockResolvedValue({});

    await service.updateDonateGift({
      channelId: '123',
      donateGiftEnabled: 'Y',
      giftDonate: {
        payWay: 'CASH',
        cashPays: [{ name: '6.66', enabled: 'Y', imgType: 'STATIC', img: '//example.png', price: 6.66 }],
      },
    });
    await service.updateDonate({
      channelId: '123',
      donateEnabled: 'N',
    });
    await service.listRewardGifts({ channelId: '123', start: 1, end: 2, pageNumber: 1, pageSize: 10 });
    await service.listRewardLikes({ channelId: '123', pageNumber: 1, pageSize: 10 });

    expect(mockHttpClient.post).toHaveBeenCalledWith(
      '/live/v4/channel/donate/gift/update',
      {
        donateGiftEnabled: 'Y',
        giftDonate: {
          payWay: 'CASH',
          cashPays: [{ name: '6.66', enabled: 'Y', imgType: 'STATIC', img: '//example.png', price: 6.66 }],
        },
      },
      { params: { channelId: '123' } }
    );
    expect(mockHttpClient.post).toHaveBeenCalledWith(
      '/live/v4/channel/donate/gift/update',
      { donateGiftEnabled: 'N' },
      { params: { channelId: '123' } }
    );
    expect(mockHttpClient.get).toHaveBeenCalledWith('/live/v4/channel/reward/gift-list', {
      params: { channelId: '123', start: 1, end: 2, pageNumber: 1, pageSize: 10 },
    });
    expect(mockHttpClient.get).toHaveBeenCalledWith('/live/v4/channel/reward/like-list', {
      params: { channelId: '123', pageNumber: 1, pageSize: 10 },
    });
  });
});
