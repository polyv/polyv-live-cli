import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { PolyVClient } from '../../client.js';
import { PolyVValidationError } from '../../errors/polyv-validation-error.js';
import { V4ChannelService } from './channel.service.js';

const mockHttpClient = {
  get: vi.fn(),
  post: vi.fn(),
};

const mockClient = {
  httpClient: mockHttpClient,
} as unknown as PolyVClient;

describe('V4ChannelService marketing and content exact API paths', () => {
  let service: V4ChannelService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new V4ChannelService(mockClient);
  });

  it('calls card push and share exact endpoints', async () => {
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
      { channelId: '123', cardPushId: '1', title: 'New Card', duration: 10 }
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

  it('calls coupon, product setting, tag, stats, and action exact endpoints', async () => {
    mockHttpClient.get.mockResolvedValue({ contents: [] });
    mockHttpClient.post.mockResolvedValue({});

    await service.getCouponEnabled({ channelId: '123' });
    await service.updateCouponEnabled({ channelId: '123', enabled: 'Y' });
    await service.listChannelCoupons({ channelId: '123', pageNumber: 1, pageSize: 10, name: 'coupon' });
    await service.deleteChannelCoupons({ channelId: '123', couponIds: ['c1', 'c2'] });
    await service.getProductPushRule({ channelId: '123' });
    await service.updateProductPushRule({
      channelId: '123',
      productExplainEnabled: 'Y',
      productListSortType: 'DESC',
      productTagSortOrderIds: [1, 2],
    });
    await service.productTagList({ channelId: '123', pageNumber: 1, pageSize: 10 });
    await service.productTagCreate({ channelId: '123', name: 'Hot' });
    await service.productTagUpdate({ channelId: '123', id: '7', name: 'New Hot' });
    await service.productTagDelete({ channelId: '123', id: '7' });
    await service.listProductStats({ channelId: '123', pageNumber: 1, pageSize: 10, productName: 'Book' });
    await service.getProductStatsSummary({ channelId: '123', sessionId: 'session1' });
    await service.sortChannelProductRank({ channelId: '123', productId: '9', rank: 2 });
    await service.toppingChannelProduct({ channelId: '123', productId: '9' });
    await service.untoppingChannelProduct({ channelId: '123', productId: '9' });

    expect(mockHttpClient.get).toHaveBeenCalledWith('/live/v4/channel/coupon/get-enabled', {
      params: { channelId: '123' },
    });
    expect(mockHttpClient.post).toHaveBeenCalledWith(
      '/live/v4/channel/coupon/update-enabled',
      { enabled: 'Y' },
      { params: { channelId: '123' } }
    );
    expect(mockHttpClient.get).toHaveBeenCalledWith('/live/v4/channel/coupon/list', {
      params: { channelId: '123', pageNumber: 1, pageSize: 10, name: 'coupon' },
    });
    expect(mockHttpClient.post).toHaveBeenCalledWith('/live/v4/channel/coupon/delete', {
      channelId: '123',
      couponIds: ['c1', 'c2'],
    });
    expect(mockHttpClient.get).toHaveBeenCalledWith('/live/v4/channel/product/push/rule', {
      params: { channelId: '123' },
    });
    expect(mockHttpClient.post).toHaveBeenCalledWith(
      '/live/v4/channel/product/push/rule',
      {
        productExplainEnabled: 'Y',
        productListSortType: 'DESC',
        productTagSortOrderIds: [1, 2],
      },
      { params: { channelId: '123' } }
    );
    expect(mockHttpClient.get).toHaveBeenCalledWith('/live/v4/channel/product/tag/list', {
      params: { channelId: '123', pageNumber: 1, pageSize: 10 },
    });
    expect(mockHttpClient.post).toHaveBeenCalledWith(
      '/live/v4/channel/product/tag/create',
      { name: 'Hot' },
      { params: { channelId: '123' } }
    );
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
    expect(mockHttpClient.get).toHaveBeenCalledWith('/live/v4/channel/product/stats/page', {
      params: { channelId: '123', pageNumber: 1, pageSize: 10, productName: 'Book' },
    });
    expect(mockHttpClient.get).toHaveBeenCalledWith('/live/v4/channel/product/stats/summary', {
      params: { channelId: '123', sessionId: 'session1' },
    });
    expect(mockHttpClient.post).toHaveBeenCalledWith(
      '/live/v4/channel/product/sort-rank',
      null,
      { params: { channelId: '123', productId: '9', rank: 2 } }
    );
    expect(mockHttpClient.post).toHaveBeenCalledWith(
      '/live/v4/channel/product/topping',
      { productId: '9' },
      { params: { channelId: '123' } }
    );
    expect(mockHttpClient.post).toHaveBeenCalledWith(
      '/live/v4/channel/product/un-topping',
      { productId: '9' },
      { params: { channelId: '123' } }
    );
  });

  it('calls popularization, record-file, watch, and chat exact endpoints', async () => {
    mockHttpClient.get.mockResolvedValue({ contents: [] });
    mockHttpClient.post.mockResolvedValue({});

    await service.createPopularizations({ channelId: '123', names: ['Promo'] });
    await service.listPopularizations({ channelId: '123' });
    await service.listMaterialRecordFiles({ channelId: '123', pageNumber: 1, pageSize: 10 });
    await service.createRecordFileOutline({
      fileId: 'file1',
      aiKnowledgeQuizEnabled: 'Y',
      aiSummaryAuditEnabled: 'N',
      syncToPlaybackDotEnabled: 'Y',
    });
    await service.getRecordFileOutline({ channelId: '123', fileId: 'file1' });
    await service.batchPublishRecordFileSubtitles({
      subtitles: [{ id: '1', status: 'publish' }],
    });
    await service.logoutWatchViewer({ channelId: '123', token: 'token1' });
    await service.batchUpdateChatEnabled({ channelIds: ['123', '456'], chatEnabled: 'N' });

    expect(mockHttpClient.post).toHaveBeenCalledWith('/live/v4/channel/popularization/create-batch', {
      channelId: '123',
      names: ['Promo'],
    });
    expect(mockHttpClient.get).toHaveBeenCalledWith('/live/v4/channel/popularization/list', {
      params: { channelId: '123' },
    });
    expect(mockHttpClient.get).toHaveBeenCalledWith('/live/v4/channel/record-file/m-list', {
      params: { channelId: '123', pageNumber: 1, pageSize: 10 },
    });
    expect(mockHttpClient.post).toHaveBeenCalledWith(
      '/live/v4/channel/record-file/subtitle/outline/create',
      null,
      {
        params: {
          fileId: 'file1',
          aiKnowledgeQuizEnabled: 'Y',
          aiSummaryAuditEnabled: 'N',
          syncToPlaybackDotEnabled: 'Y',
        },
      }
    );
    expect(mockHttpClient.get).toHaveBeenCalledWith(
      '/live/v4/channel/record-file/subtitle/outline/get-by-fileId',
      { params: { channelId: '123', fileId: 'file1' } }
    );
    expect(mockHttpClient.post).toHaveBeenCalledWith(
      '/live/v4/channel/record-file/subtitle/batch-publish',
      null,
      { params: { subtitles: [{ id: '1', status: 'publish' }] } }
    );
    expect(mockHttpClient.post).toHaveBeenCalledWith(
      '/live/v4/channel/watch/viewer/logout',
      { token: 'token1' },
      { params: { channelId: '123' } }
    );
    expect(mockHttpClient.post).toHaveBeenCalledWith('/live/v4/channel/chat/update-chatEnabled', {
      channelIds: ['123', '456'],
      chatEnabled: 'N',
    });
  });

  it('validates marketing and content exact parameters', async () => {
    await expect(service.cardPushCreate({
      channelId: '123',
      imageType: 'custom',
      title: 'Card',
      link: 'https://example.com',
      duration: 15,
      showCondition: 'PUSH',
    })).rejects.toThrow(PolyVValidationError);

    await expect(service.deleteChannelCoupons({
      channelId: '123',
      couponIds: [],
    })).rejects.toThrow(PolyVValidationError);

    await expect(service.sortChannelProductRank({
      channelId: '123',
      productId: '9',
      rank: 0,
    })).rejects.toThrow(PolyVValidationError);

    await expect(service.createPopularizations({
      channelId: '123',
      names: ['this-name-is-longer-than-twenty-chars'],
    })).rejects.toThrow(PolyVValidationError);

    await expect(service.batchUpdateChatEnabled({
      channelIds: ['123'],
      chatEnabled: 'X',
    })).rejects.toThrow(PolyVValidationError);
  });
});
