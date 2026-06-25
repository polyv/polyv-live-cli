import { PolyVClient } from 'polyv-live-api-sdk';
import { CheckinServiceSdk } from './checkin-service';
import { InteractionServiceSdk } from './interaction-service';
import { LotteryServiceSdk } from './lottery-service';
import { QaQuestionnaireServiceSdk } from './qa-questionnaire-service';
import type { AuthConfig } from '../types/auth';

jest.mock('polyv-live-api-sdk', () => ({
  PolyVClient: jest.fn(),
}));

const MockPolyVClient = PolyVClient as jest.MockedClass<typeof PolyVClient>;

describe('live_interaction CLI service wrappers', () => {
  const authConfig: AuthConfig = {
    appId: 'test-app-id',
    appSecret: 'test-app-secret',
  };

  let liveInteraction: Record<string, jest.Mock>;
  let v4Channel: Record<string, jest.Mock>;

  beforeEach(() => {
    jest.clearAllMocks();
    liveInteraction = {
      getCheckinBySessionId: jest.fn().mockResolvedValue({ code: 200 }),
      listQuestionSendTime: jest.fn().mockResolvedValue({ code: 200 }),
      getAnswerList: jest.fn().mockResolvedValue({ code: 200 }),
      getQuestionList: jest.fn().mockResolvedValue({ code: 200 }),
      addEditQuestion: jest.fn().mockResolvedValue({ code: 200 }),
      deleteQuestion: jest.fn().mockResolvedValue({ code: 200 }),
      sendQuestionResult: jest.fn().mockResolvedValue({ code: 200 }),
      listQuestionnaire: jest.fn().mockResolvedValue({ code: 200 }),
      getQuestionnaireResult: jest.fn().mockResolvedValue({ code: 200 }),
      batchCreateQuestionnaire: jest.fn().mockResolvedValue({ code: 200 }),
      listChannelsLottery: jest.fn().mockResolvedValue({ code: 200 }),
      downloadWinnerDetail: jest.fn().mockResolvedValue({ code: 200 }),
      addReceiveInfoV4: jest.fn().mockResolvedValue({ code: 200 }),
      sendFavor: jest.fn().mockResolvedValue({ code: 200 }),
      sendRewardMsg: jest.fn().mockResolvedValue({ code: 200 }),
      getStudentQuestionWebhook: jest.fn().mockResolvedValue({ code: 200 }),
      setStudentQuestionWebhook: jest.fn().mockResolvedValue({ code: 200 }),
      deleteStudentQuestionWebhook: jest.fn().mockResolvedValue({ code: 200 }),
      sendTeacherAnswer: jest.fn().mockResolvedValue({ code: 200 }),
    };
    v4Channel = {
      listInteractionEvents: jest.fn().mockResolvedValue({ code: 200 }),
      interactionEventSave: jest.fn().mockResolvedValue(undefined),
      interactionEventDelete: jest.fn().mockResolvedValue(undefined),
      createInvitePoster: jest.fn().mockResolvedValue({ code: 200 }),
      queryDiskVideoCustomScript: jest.fn().mockResolvedValue({ code: 200 }),
      uploadDiskVideoCustomScript: jest.fn().mockResolvedValue({ id: 1 }),
      deleteInteractionScript: jest.fn().mockResolvedValue(undefined),
      createTaskRewardActivity: jest.fn().mockResolvedValue(123),
      listTaskRewardActivities: jest.fn().mockResolvedValue({ code: 200 }),
      listTaskRewardStats: jest.fn().mockResolvedValue({ code: 200 }),
      listTaskRewardViewerDetails: jest.fn().mockResolvedValue({ code: 200 }),
      updateTaskRewardActivity: jest.fn().mockResolvedValue(undefined),
      deleteTaskRewardActivity: jest.fn().mockResolvedValue(undefined),
      stopTaskRewardActivity: jest.fn().mockResolvedValue(undefined),
      listViewerTaskRewardDetails: jest.fn().mockResolvedValue({ code: 200 }),
      submitViewerTaskRewardAcceptInfo: jest.fn().mockResolvedValue(undefined),
    };

    MockPolyVClient.mockImplementation(() => ({
      liveInteraction,
      v4Chat: { batchCheckin: jest.fn() },
      v4Channel,
    }) as any);
  });

  it('maps checkin session result to LiveInteractionService', async () => {
    const service = new CheckinServiceSdk(authConfig);
    await service.getCheckinBySessionId({ channelId: '3151318', sessionId: 'session-1' });

    expect(liveInteraction.getCheckinBySessionId).toHaveBeenCalledWith({
      channelId: '3151318',
      sessionId: 'session-1',
    });
  });

  it('maps QA and questionnaire methods to LiveInteractionService', async () => {
    const service = new QaQuestionnaireServiceSdk(authConfig);

    await service.listQuestionSendTime({ channelId: '3151318' });
    await service.getAnswerList({ channelId: '3151318', sessionId: 'session-1' });
    await service.getQuestionList({ channelId: '3151318', begin: 1, end: 2 });
    await service.addEditQuestion({
      channelId: '3151318',
      questionId: 'q-1',
      type: 'R',
      answer: 'A',
      name: 'Question',
      itemType: 0,
      options: ['A', 'B'],
      tips: ['tip'],
    });
    await service.deleteQuestion({ channelId: '3151318', questionId: 'q-1' });
    await service.sendQuestionResult({ channelId: '3151318', questionId: 'q-1' });
    await service.listQuestionnaire({ channelId: '3151318', page: 1, pageSize: 20 });
    await service.getQuestionnaireResult({ channelId: '3151318', questionnaireId: 'qn-1' });
    await service.batchCreateQuestionnaire({ questionnaires: [{ channelId: '3151318', questionnaireTitle: 'Survey', questions: [] }] });

    expect(liveInteraction.listQuestionSendTime).toHaveBeenCalledWith({ channelId: '3151318' });
    expect(liveInteraction.getAnswerList).toHaveBeenCalledWith(expect.objectContaining({ sessionId: 'session-1' }));
    expect(liveInteraction.getQuestionList).toHaveBeenCalledWith('3151318', { begin: 1, end: 2 });
    expect(liveInteraction.addEditQuestion).toHaveBeenCalledWith(expect.objectContaining({ option1: 'A', tips1: 'tip' }));
    expect(liveInteraction.deleteQuestion).toHaveBeenCalledWith({ channelId: '3151318', questionId: 'q-1' });
    expect(liveInteraction.sendQuestionResult).toHaveBeenCalledWith({ channelId: '3151318', questionId: 'q-1' });
    expect(liveInteraction.listQuestionnaire).toHaveBeenCalledWith(expect.objectContaining({ pageSize: 20 }));
    expect(liveInteraction.getQuestionnaireResult).toHaveBeenCalledWith(expect.objectContaining({ questionnaireId: 'qn-1' }));
    expect(liveInteraction.batchCreateQuestionnaire).toHaveBeenCalledWith(expect.objectContaining({ questionnaires: expect.any(Array) }));
  });

  it('maps lottery gap methods to LiveInteractionService', async () => {
    const service = new LotteryServiceSdk(authConfig);

    await service.listChannelsLottery({
      channelIds: ['3151318', '3151319'],
      startTime: 1704067200000,
      endTime: 1706745599000,
      page: 1,
      limit: 20,
    });
    await service.downloadWinnerDetail({ channelId: '3151318', lotteryId: 'lottery-1' });
    await service.addReceiveInfoV4({
      channelId: '3151318',
      lotteryId: 'lottery-1',
      winnerCode: 'ABC123',
      viewerId: 'viewer-1',
      receiveInfo: { name: 'Nick' },
    });

    expect(liveInteraction.listChannelsLottery).toHaveBeenCalledWith(expect.objectContaining({ channelIds: ['3151318', '3151319'] }));
    expect(liveInteraction.downloadWinnerDetail).toHaveBeenCalledWith({ channelId: '3151318', lotteryId: 'lottery-1' });
    expect(liveInteraction.addReceiveInfoV4).toHaveBeenCalledWith(expect.objectContaining({ winnerCode: 'ABC123' }));
  });

  it('maps cross-cutting interaction methods to LiveInteractionService', async () => {
    const service = new InteractionServiceSdk(authConfig);

    await service.sendFavor({ channelId: '3151318', viewerId: 'viewer-1', times: 10 });
    await service.sendRewardMsg({
      channelId: '3151318',
      nickname: 'Nick',
      avatar: 'https://example.com/a.png',
      viewerId: 'viewer-1',
      donateType: 'good',
      content: 'Gift',
    });
    await service.getStudentQuestionWebhook({ roomId: 'room-1' });
    await service.setStudentQuestionWebhook({ roomId: 'room-1', callbackUrl: 'https://example.com/callback' });
    await service.deleteStudentQuestionWebhook({ roomId: 'room-1' });
    await service.sendTeacherAnswer({ roomId: 'room-1', content: 'Answer', viewerUserId: 'viewer-1' });

    expect(liveInteraction.sendFavor).toHaveBeenCalledWith(expect.objectContaining({ times: 10 }));
    expect(liveInteraction.sendRewardMsg).toHaveBeenCalledWith(expect.objectContaining({ donateType: 'good' }));
    expect(liveInteraction.getStudentQuestionWebhook).toHaveBeenCalledWith({ roomId: 'room-1' });
    expect(liveInteraction.setStudentQuestionWebhook).toHaveBeenCalledWith({ roomId: 'room-1', callbackUrl: 'https://example.com/callback' });
    expect(liveInteraction.deleteStudentQuestionWebhook).toHaveBeenCalledWith({ roomId: 'room-1' });
    expect(liveInteraction.sendTeacherAnswer).toHaveBeenCalledWith(expect.objectContaining({ viewerUserId: 'viewer-1' }));
  });

  it('maps v4 channel interaction event and script methods to V4ChannelService', async () => {
    const service = new InteractionServiceSdk(authConfig);

    await service.listInteractionEvents({ roomId: 'room-1' });
    await service.saveInteractionEvent({ channelId: '3151318', tasks: [{ type: 'signCount', signCount: 1, startTime: 1000, endTime: 2000 }], allDone: 'Y' });
    await service.deleteInteractionEvent({ channelId: '3151318', taskIds: ['event-1'] });
    await service.createInvitePoster({ channelId: '3151318', openId: 'open-1', nickname: 'Nick' });
    await service.queryDiskVideoCustomScript({ channelId: '3151318', diskVideoId: 'video-1' });
    await service.uploadDiskVideoCustomScript({ channelId: '3151318', diskVideoId: 'video-1', filePath: __filename });
    await service.deleteInteractionScript({ channelId: '3151318', id: 1 });

    expect(v4Channel.listInteractionEvents).toHaveBeenCalledWith({ roomId: 'room-1' });
    expect(v4Channel.interactionEventSave).toHaveBeenCalledWith({ channelId: '3151318', tasks: [{ type: 'signCount', signCount: 1, startTime: 1000, endTime: 2000 }], allDone: 'Y' });
    expect(v4Channel.interactionEventDelete).toHaveBeenCalledWith({ channelId: '3151318', taskIds: ['event-1'] });
    expect(v4Channel.createInvitePoster).toHaveBeenCalledWith({ channelId: '3151318', openId: 'open-1', nickname: 'Nick' });
    expect(v4Channel.queryDiskVideoCustomScript).toHaveBeenCalledWith({ channelId: '3151318', diskVideoId: 'video-1' });
    expect(v4Channel.uploadDiskVideoCustomScript).toHaveBeenCalledWith(expect.objectContaining({
      channelId: '3151318',
      diskVideoId: 'video-1',
      file: expect.any(Blob),
    }));
    expect(v4Channel.deleteInteractionScript).toHaveBeenCalledWith({ channelId: '3151318', id: 1 });
  });

  it('maps task reward methods to V4ChannelService', async () => {
    const service = new InteractionServiceSdk(authConfig);
    const tasks = [{
      reachCondition: { type: 'sign', amount: 1 },
      rewardSetting: { type: 'nothing' },
    }];

    await service.createTaskRewardActivity({
      channelId: '3151318',
      activityName: 'Task reward',
      taskRule: 1,
      startTime: 1704067200000,
      endTime: 1704153600000,
      tasks,
    });
    await service.listTaskRewardActivities({ channelId: '3151318' });
    await service.listTaskRewardStats({ channelId: '3151318' });
    await service.listTaskRewardViewerDetails({ channelId: '3151318', activityId: 123 });
    await service.updateTaskRewardActivity({ channelId: '3151318', activityId: 123, tasks });
    await service.deleteTaskRewardActivity({ activityId: 123 });
    await service.stopTaskRewardActivity({ activityId: 123 });
    await service.listViewerTaskRewardDetails({ viewerId: 'viewer-1' });
    await service.submitViewerTaskRewardAcceptInfo({
      id: 1,
      viewerId: 'viewer-1',
      formInfo: [{ field: 'name', value: 'Nick' }],
    });

    expect(v4Channel.createTaskRewardActivity).toHaveBeenCalledWith(expect.objectContaining({ activityName: 'Task reward' }));
    expect(v4Channel.listTaskRewardActivities).toHaveBeenCalledWith({ channelId: '3151318' });
    expect(v4Channel.listTaskRewardStats).toHaveBeenCalledWith({ channelId: '3151318' });
    expect(v4Channel.listTaskRewardViewerDetails).toHaveBeenCalledWith({ channelId: '3151318', activityId: 123 });
    expect(v4Channel.updateTaskRewardActivity).toHaveBeenCalledWith(expect.objectContaining({ activityId: 123 }));
    expect(v4Channel.deleteTaskRewardActivity).toHaveBeenCalledWith({ activityId: 123 });
    expect(v4Channel.stopTaskRewardActivity).toHaveBeenCalledWith({ activityId: 123 });
    expect(v4Channel.listViewerTaskRewardDetails).toHaveBeenCalledWith({ viewerId: 'viewer-1' });
    expect(v4Channel.submitViewerTaskRewardAcceptInfo).toHaveBeenCalledWith(expect.objectContaining({ viewerId: 'viewer-1' }));
  });
});
