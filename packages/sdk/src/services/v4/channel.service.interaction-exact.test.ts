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

const taskRewardTask = {
  reachCondition: { type: 'sign', amount: 1 },
  rewardSetting: { type: 'nothing' },
};

describe('V4ChannelService interaction exact API paths', () => {
  let service: V4ChannelService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new V4ChannelService(mockClient);
  });

  it('calls lottery activity exact endpoints', async () => {
    mockHttpClient.get.mockResolvedValue({ contents: [] });
    mockHttpClient.post.mockResolvedValue({ id: 11 });

    await service.lotteryActivityCreate({
      channelId: '123',
      activityName: 'Lucky draw',
      lotteryCondition: 'none',
      amount: 1,
      prizeName: 'Prize',
    });
    await service.lotteryActivityGet({ channelId: '123', id: '11' });
    await service.lotteryActivityList({ channelId: '123', pageNumber: 1, pageSize: 10 });
    await service.lotteryActivityUpdate({
      channelId: '123',
      id: '11',
      activityName: 'Lucky draw',
      lotteryCondition: 'none',
      amount: 2,
      prizeName: 'Prize',
    });
    await service.lotteryActivityDelete({ channelId: '123', id: '11' });
    await service.createConditionWaitLottery({ channelId: '123', id: '11', lotteryTime: 1730000000000 });
    await service.listLotteryActivityRecords({ channelId: '123', pageNumber: 1, pageSize: 10 });

    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      1,
      '/live/v4/channel/lottery-activity/create',
      {
        activityName: 'Lucky draw',
        lotteryCondition: 'none',
        amount: 1,
        prizeName: 'Prize',
      },
      { params: { channelId: '123' } }
    );
    expect(mockHttpClient.get).toHaveBeenNthCalledWith(
      1,
      '/live/v4/channel/lottery-activity/get',
      { params: { channelId: '123', id: '11' } }
    );
    expect(mockHttpClient.get).toHaveBeenNthCalledWith(
      2,
      '/live/v4/channel/lottery-activity/list',
      { params: { channelId: '123', pageNumber: 1, pageSize: 10 } }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      2,
      '/live/v4/channel/lottery-activity/update',
      {
        id: '11',
        activityName: 'Lucky draw',
        lotteryCondition: 'none',
        amount: 2,
        prizeName: 'Prize',
      },
      { params: { channelId: '123' } }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      3,
      '/live/v4/channel/lottery-activity/delete',
      { id: '11' },
      { params: { channelId: '123' } }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      4,
      '/live/v4/channel/condition-lottery/create-wait-lottery',
      { id: '11', lotteryTime: 1730000000000 },
      { params: { channelId: '123' } }
    );
    expect(mockHttpClient.get).toHaveBeenNthCalledWith(
      3,
      '/live/v4/channel/lottery/activity-record/list',
      { params: { channelId: '123', pageNumber: 1, pageSize: 10 } }
    );
  });

  it('calls lottery viewer group and blacklist exact endpoints', async () => {
    mockHttpClient.get.mockResolvedValue({ contents: [] });
    mockHttpClient.post.mockResolvedValue([{ id: 1 }]);

    await service.createLotteryViewerGroup({ channelId: '123', title: 'VIP' });
    await service.listLotteryViewerGroups({ channelId: '123', pageNumber: 1, pageSize: 10 });
    await service.updateLotteryViewerGroup({ channelId: '123', id: '7', title: 'VIP 2' });
    await service.deleteLotteryViewerGroup({ channelId: '123', id: '7' });
    await service.createLotteryGroupViewers({ channelId: '123', groupId: '7', viewerIds: ['v1', 'v2'] });
    await service.createLotteryGroupViewerNames({
      channelId: '123',
      groupId: '7',
      viewerNames: [{ viewerId: 'v3', viewerName: 'Viewer 3' }],
    });
    await service.listLotteryGroupViewers({ channelId: '123', groupId: '7', pageNumber: 1, pageSize: 10 });
    await service.deleteLotteryGroupViewers({ channelId: '123', groupId: '7', ids: [1, 2] });
    await service.createLotteryBlacklistViewers({ channelId: '123', viewerIds: ['v1'] });
    await service.listLotteryBlacklistViewers({ channelId: '123', pageNumber: 1, pageSize: 10 });
    await service.deleteLotteryBlacklistViewers({ channelId: '123', ids: [3] });

    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      1,
      '/live/v4/channel/lottery-viewer-group/whitelist/create',
      { title: 'VIP' },
      { params: { channelId: '123' } }
    );
    expect(mockHttpClient.get).toHaveBeenNthCalledWith(
      1,
      '/live/v4/channel/lottery-viewer-group/whitelist/list',
      { params: { channelId: '123', pageNumber: 1, pageSize: 10 } }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      2,
      '/live/v4/channel/lottery-viewer-group/whitelist/update',
      { id: '7', title: 'VIP 2' },
      { params: { channelId: '123' } }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      3,
      '/live/v4/channel/lottery-viewer-group/whitelist/delete',
      { id: '7' },
      { params: { channelId: '123' } }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      4,
      '/live/v4/channel/lottery-viewer-list/create',
      { groupId: '7', viewerIds: ['v1', 'v2'] },
      { params: { channelId: '123' } }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      5,
      '/live/v4/channel/lottery-viewer-list/create-viewer-name',
      { groupId: '7', viewerNames: [{ viewerId: 'v3', viewerName: 'Viewer 3' }] },
      { params: { channelId: '123' } }
    );
    expect(mockHttpClient.get).toHaveBeenNthCalledWith(
      2,
      '/live/v4/channel/lottery-viewer-list/list',
      { params: { channelId: '123', groupId: '7', pageNumber: 1, pageSize: 10 } }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      6,
      '/live/v4/channel/lottery-viewer-list/delete-batch',
      { groupId: '7', ids: [1, 2] },
      { params: { channelId: '123' } }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      7,
      '/live/v4/channel/lottery-viewer-list/blacklist/create',
      { viewerIds: ['v1'] },
      { params: { channelId: '123' } }
    );
    expect(mockHttpClient.get).toHaveBeenNthCalledWith(
      3,
      '/live/v4/channel/lottery-viewer-list/blacklist/list',
      { params: { channelId: '123', pageNumber: 1, pageSize: 10 } }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      8,
      '/live/v4/channel/lottery-viewer-list/blacklist/delete-batch',
      { ids: [3] },
      { params: { channelId: '123' } }
    );
  });

  it('calls lucky bag, interaction event, invite poster, and script exact endpoints', async () => {
    mockHttpClient.get.mockResolvedValue({ contents: [] });
    mockHttpClient.post.mockResolvedValue({ id: 'script1' });

    await service.listLuckyBagWinners({ activityId: 'act1', currentPage: 1, pageSize: 10 });
    await service.listInteractionEvents({ roomId: '123' });
    await service.createInvitePoster({ channelId: '123', openId: 'open1', nickname: 'Nick' });
    await service.uploadDiskVideoCustomScript({
      channelId: '123',
      diskVideoId: 'video1',
      labelId: 5,
      file: new Blob(['viewerId,viewerName']),
    });
    await service.queryDiskVideoCustomScript({ channelId: '123', diskVideoId: 'video1' });
    await service.deleteInteractionScript({ channelId: '123', id: 'script1' });

    expect(mockHttpClient.get).toHaveBeenNthCalledWith(
      1,
      '/live/v4/channel/lucky-bag/winner-page',
      { params: { activityId: 'act1', currentPage: 1, pageSize: 10 } }
    );
    expect(mockHttpClient.get).toHaveBeenNthCalledWith(
      2,
      '/live/v5/chat/redirect/channel/interaction_event/list',
      { params: { roomId: '123' } }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      1,
      '/live/v4/channel/invite/poster/create',
      null,
      { params: { channelId: '123', openId: 'open1', nickname: 'Nick' } }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      2,
      '/live/v4/channel/interaction-script/upload-disk-video-custom-script',
      expect.any(FormData),
      {
        params: { channelId: '123', diskVideoId: 'video1', labelId: 5 },
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    expect(mockHttpClient.get).toHaveBeenNthCalledWith(
      3,
      '/live/v4/channel/interaction-script/query-disk-video-custom-script',
      { params: { channelId: '123', diskVideoId: 'video1' } }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      3,
      '/live/v4/channel/interaction-script/delete',
      { channelId: '123', id: 'script1' },
      { params: { channelId: '123' } }
    );
  });

  it('calls reward, task reward, viewer task reward, and donate gift exact endpoints', async () => {
    mockHttpClient.get.mockResolvedValue({ contents: [] });
    mockHttpClient.post.mockResolvedValue(100);

    await service.listRewardGifts({ channelId: '123', start: 1730000000000, end: 1730003600000, pageSize: 10 });
    await service.listRewardLikes({ channelId: '123', pageNumber: 1, pageSize: 10 });
    await service.createTaskRewardActivity({
      channelId: '123',
      activityName: 'Task reward',
      taskRule: 1,
      startTime: 1730000000000,
      endTime: 1730003600000,
      tasks: [taskRewardTask],
    });
    await service.listTaskRewardActivities({ channelId: '123', pageNumber: 1, pageSize: 10 });
    await service.listTaskRewardStats({ channelId: '123', pageNumber: 1, pageSize: 10 });
    await service.listTaskRewardViewerDetails({ channelId: '123', activityId: '100', pageNumber: 1, pageSize: 10 });
    await service.updateTaskRewardActivity({ channelId: '123', activityId: '100', tasks: [taskRewardTask] });
    await service.deleteTaskRewardActivity({ activityId: '100' });
    await service.stopTaskRewardActivity({ activityId: '100' });
    await service.listViewerTaskRewardDetails({ viewerId: 'viewer1', pageNumber: 1, pageSize: 10 });
    await service.submitViewerTaskRewardAcceptInfo({
      id: 'record1',
      viewerId: 'viewer1',
      formInfo: [{ field: 'name', value: 'Nick' }],
    });
    await service.updateDonateGift({ channelId: '123', donateGiftEnabled: 'Y' });

    expect(mockHttpClient.get).toHaveBeenNthCalledWith(
      1,
      '/live/v4/channel/reward/gift-list',
      { params: { channelId: '123', start: 1730000000000, end: 1730003600000, pageSize: 10 } }
    );
    expect(mockHttpClient.get).toHaveBeenNthCalledWith(
      2,
      '/live/v4/channel/reward/like-list',
      { params: { channelId: '123', pageNumber: 1, pageSize: 10 } }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      1,
      '/live/v4/channel/task-reward-activity/save',
      {
        channelId: '123',
        activityName: 'Task reward',
        taskRule: 1,
        startTime: 1730000000000,
        endTime: 1730003600000,
        tasks: [taskRewardTask],
      }
    );
    expect(mockHttpClient.get).toHaveBeenNthCalledWith(
      3,
      '/live/v4/channel/task-reward-activity/page',
      { params: { channelId: '123', pageNumber: 1, pageSize: 10 } }
    );
    expect(mockHttpClient.get).toHaveBeenNthCalledWith(
      4,
      '/live/v4/channel/task-reward-activity/stats',
      { params: { channelId: '123', pageNumber: 1, pageSize: 10 } }
    );
    expect(mockHttpClient.get).toHaveBeenNthCalledWith(
      5,
      '/live/v4/channel/task-reward-activity/viewer-detail',
      { params: { channelId: '123', activityId: '100', pageNumber: 1, pageSize: 10 } }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      2,
      '/live/v4/channel/task-reward-activity/update',
      { channelId: '123', activityId: '100', tasks: [taskRewardTask] }
    );
    expect(mockHttpClient.get).toHaveBeenNthCalledWith(
      6,
      '/live/v4/channel/task-reward-activity/delete',
      { params: { activityId: '100' } }
    );
    expect(mockHttpClient.get).toHaveBeenNthCalledWith(
      7,
      '/live/v4/channel/task-reward-activity/stop',
      { params: { activityId: '100' } }
    );
    expect(mockHttpClient.get).toHaveBeenNthCalledWith(
      8,
      '/live/v4/user/viewer-task-reward/page',
      { params: { viewerId: 'viewer1', pageNumber: 1, pageSize: 10 } }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      3,
      '/live/v4/user/viewer-task-reward/submit-accept-info',
      { id: 'record1', viewerId: 'viewer1', formInfo: [{ field: 'name', value: 'Nick' }] }
    );
    expect(mockHttpClient.post).toHaveBeenNthCalledWith(
      4,
      '/live/v4/channel/donate/gift/update',
      { donateGiftEnabled: 'Y' },
      { params: { channelId: '123' } }
    );
  });

  it('validates required interaction parameters', async () => {
    await expect(service.lotteryActivityCreate({
      channelId: '123',
      activityName: 'Lucky draw',
      lotteryCondition: 'none',
      amount: 0,
      prizeName: 'Prize',
    })).rejects.toThrow(PolyVValidationError);

    await expect(service.createLotteryGroupViewers({
      channelId: '123',
      groupId: '7',
      viewerIds: [],
    })).rejects.toThrow(PolyVValidationError);

    await expect(service.uploadDiskVideoCustomScript({
      channelId: '123',
      diskVideoId: 'video1',
      file: undefined as unknown as Blob,
    })).rejects.toThrow(PolyVValidationError);

    await expect(service.createTaskRewardActivity({
      channelId: '123',
      activityName: 'Task reward',
      taskRule: 1,
      startTime: 1730003600000,
      endTime: 1730000000000,
      tasks: [taskRewardTask],
    })).rejects.toThrow(PolyVValidationError);

    await expect(service.updateDonateGift({
      channelId: '123',
      donateGiftEnabled: 'X',
    })).rejects.toThrow(PolyVValidationError);
  });
});
