/**
 * @fileoverview Unit tests for LiveInteractionService
 * @module services/live-interaction.service.test
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PolyVClient } from '../client.js';
import { PolyVValidationError } from '../errors/polyv-validation-error.js';
import { LiveInteractionService } from './live-interaction.service.js';

const mockHttpClient = {
  get: vi.fn(),
  post: vi.fn(),
};

const mockClient = {
  httpClient: mockHttpClient,
} as unknown as PolyVClient;

interface EndpointCase {
  name: string;
  call: (service: LiveInteractionService) => Promise<unknown>;
  path: string;
  config?: unknown;
}

describe('LiveInteractionService', () => {
  let service: LiveInteractionService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new LiveInteractionService(mockClient);
  });

  describe('GET APIs', () => {
    const cases: EndpointCase[] = [
      {
        name: 'getCheckinList',
        call: (svc) => svc.getCheckinList({ channelId: '12345678', page: 1, pageSize: 10 }),
        path: '/live/v3/channel/checkin/list',
        config: { params: { channelId: '12345678', page: 1, pageSize: 10 } },
      },
      {
        name: 'getCheckinByCheckinId',
        call: (svc) => svc.getCheckinByCheckinId({ channelId: '12345678', checkinId: 'checkin1' }),
        path: '/live/v3/channel/chat/get-checkins',
        config: { params: { channelId: '12345678', checkinId: 'checkin1' } },
      },
      {
        name: 'getCheckinBySessionId',
        call: (svc) => svc.getCheckinBySessionId({ channelId: '12345678', sessionId: 'session1' }),
        path: '/live/v3/channel/chat/checkin-by-sessionId',
        config: { params: { channelId: '12345678', sessionId: 'session1' } },
      },
      {
        name: 'getCheckinByTime',
        call: (svc) => svc.getCheckinByTime({
          channelId: '12345678',
          startDate: '2026-01-01',
          endDate: '2026-01-31',
        }),
        path: '/live/v3/channel/chat/get-checkin-list',
        config: {
          params: {
            channelId: '12345678',
            startDate: '2026-01-01',
            endDate: '2026-01-31',
          },
        },
      },
      {
        name: 'listQuestionnaire',
        call: (svc) => svc.listQuestionnaire({ channelId: '12345678', page: 1, pageSize: 10 }),
        path: '/live/v3/channel/questionnaire/list',
        config: { params: { channelId: '12345678', page: 1, pageSize: 10 } },
      },
      {
        name: 'listQuestionnaireByPage',
        call: (svc) => svc.listQuestionnaireByPage({ channelId: '12345678', page: 1, pageSize: 10 }),
        path: '/live/v3/channel/questionnaire/list-answer-records',
        config: { params: { channelId: '12345678', page: 1, pageSize: 10 } },
      },
      {
        name: 'getQuestionnaireDetail',
        call: (svc) => svc.getQuestionnaireDetail({ channelId: '12345678', questionnaireId: 'questionnaire1' }),
        path: '/live/v3/channel/questionnaire/detail',
        config: { params: { channelId: '12345678', questionnaireId: 'questionnaire1' } },
      },
      {
        name: 'getQuestionnaireResult',
        call: (svc) => svc.getQuestionnaireResult({ channelId: '12345678', questionnaireId: 'questionnaire1' }),
        path: '/live/v3/channel/questionnaire/answer-records',
        config: { params: { channelId: '12345678', questionnaireId: 'questionnaire1' } },
      },
      {
        name: 'listQuestion',
        call: (svc) => svc.listQuestion({ channelId: '12345678' }),
        path: '/live/v3/channel/interact/question/list-question',
        config: { params: { channelId: '12345678' } },
      },
      {
        name: 'listQuestionSendTime',
        call: (svc) => svc.listQuestionSendTime({ channelId: '12345678' }),
        path: '/live/v3/channel/interact/question/list-send-time',
        config: { params: { channelId: '12345678' } },
      },
      {
        name: 'getAnswerList',
        call: (svc) => svc.getAnswerList({ channelId: '12345678', sessionId: 'session1' }),
        path: '/live/v3/channel/question/answer-records',
        config: { params: { channelId: '12345678', sessionId: 'session1' } },
      },
      {
        name: 'listLottery',
        call: (svc) => svc.listLottery({
          channelId: '12345678',
          startTime: 1767225600000,
          endTime: 1769817600000,
          page: 1,
          limit: 10,
        }),
        path: '/live/v3/channel/lottery/list-lottery',
        config: {
          params: {
            channelId: '12345678',
            startTime: 1767225600000,
            endTime: 1769817600000,
            page: 1,
            limit: 10,
          },
        },
      },
      {
        name: 'listChannelsLottery',
        call: (svc) => svc.listChannelsLottery({
          channelIds: ['12345678', '87654321'],
          startTime: 1767225600000,
          endTime: 1769817600000,
        }),
        path: '/live/v3/channel/lottery/list-channels-lottery',
        config: {
          params: {
            channelIds: '12345678,87654321',
            startTime: 1767225600000,
            endTime: 1769817600000,
          },
        },
      },
      {
        name: 'getWinnerDetail',
        call: (svc) => svc.getWinnerDetail({ channelId: '12345678', lotteryId: 'lottery1', page: 1 }),
        path: '/live/v3/channel/lottery/get-winner-detail',
        config: { params: { channelId: '12345678', lotteryId: 'lottery1', page: 1 } },
      },
      {
        name: 'downloadWinnerDetail',
        call: (svc) => svc.downloadWinnerDetail({ channelId: '12345678', lotteryId: 'lottery1' }),
        path: '/live/v3/channel/lottery/download-winner-detail',
        config: { params: { channelId: '12345678', lotteryId: 'lottery1' } },
      },
      {
        name: 'getQuestionList',
        call: (svc) => svc.getQuestionList('12345678', { begin: 0, end: 20 }),
        path: '/live/v2/chat/12345678/getQuestion',
        config: { params: { begin: 0, end: 20 } },
      },
      {
        name: 'getStudentQuestionWebhook',
        call: (svc) => svc.getStudentQuestionWebhook({ roomId: '12345678' }),
        path: '/live/v5/chat/redirect/channel/student-question-webhook/get',
        config: { params: { roomId: '12345678' } },
      },
    ];

    it.each(cases)('calls $name with documented GET path', async ({ call, path, config }) => {
      const mockResponse = { ok: true };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await call(service);

      expect(mockHttpClient.get).toHaveBeenCalledWith(path, config);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('POST query/form APIs', () => {
    const cases: EndpointCase[] = [
      {
        name: 'addEditQuestion',
        call: (svc) => svc.addEditQuestion({
          channelId: '12345678',
          questionId: 'question1',
          type: 'R',
          answer: 'A',
          name: 'Question',
          itemType: 0,
          option1: 'A',
          option2: 'B',
        }),
        path: '/live/v3/channel/interact/question/add-edit-question',
        config: {
          params: {
            channelId: '12345678',
            questionId: 'question1',
            type: 'R',
            answer: 'A',
            name: 'Question',
            itemType: 0,
            option1: 'A',
            option2: 'B',
          },
        },
      },
      {
        name: 'addEditQuestion without questionId',
        call: (svc) => svc.addEditQuestion({
          channelId: '12345678',
          type: 'R',
          answer: 'A',
          name: 'Question',
          itemType: 0,
          option1: 'A',
          option2: 'B',
        }),
        path: '/live/v3/channel/interact/question/add-edit-question',
        config: {
          params: {
            channelId: '12345678',
            type: 'R',
            answer: 'A',
            name: 'Question',
            itemType: 0,
            option1: 'A',
            option2: 'B',
          },
        },
      },
      {
        name: 'deleteQuestion',
        call: (svc) => svc.deleteQuestion({ channelId: '12345678', questionId: 'question1' }),
        path: '/live/v3/channel/interact/question/delete-question',
        config: { params: { channelId: '12345678', questionId: 'question1' } },
      },
      {
        name: 'sendQuestion',
        call: (svc) => svc.sendQuestion({ channelId: 12345678, questionId: 'question1', duration: 30 }),
        path: '/live/v4/channel/question/send',
        config: { params: { channelId: 12345678, questionId: 'question1', duration: 30 } },
      },
      {
        name: 'stopQuestion',
        call: (svc) => svc.stopQuestion({ channelId: 12345678, questionId: 'question1' }),
        path: '/live/v4/channel/question/stop',
        config: { params: { channelId: 12345678, questionId: 'question1' } },
      },
      {
        name: 'sendQuestionResult',
        call: (svc) => svc.sendQuestionResult({ channelId: 12345678, questionId: 'question1' }),
        path: '/live/v4/channel/question/send-result',
        config: { params: { channelId: 12345678, questionId: 'question1' } },
      },
      {
        name: 'addReceiveInfoV4',
        call: (svc) => svc.addReceiveInfoV4({
          channelId: '12345678',
          lotteryId: 'lottery1',
          winnerCode: 'WIN1',
          viewerId: 'viewer1',
          receiveInfo: [{ field: 'name', value: 'Tester' }],
        }),
        path: '/live/v4/channel/lottery/add-receive-info',
        config: {
          params: {
            channelId: '12345678',
            lotteryId: 'lottery1',
            winnerCode: 'WIN1',
            viewerId: 'viewer1',
            receiveInfo: [{ field: 'name', value: 'Tester' }],
          },
        },
      },
      {
        name: 'sendFavor',
        call: (svc) => svc.sendFavor({ channelId: '12345678', viewerId: 'viewer1', times: 2 }),
        path: '/live/v2/channels/12345678/like',
        config: { params: { viewerId: 'viewer1', times: 2 } },
      },
      {
        name: 'sendRewardMsg',
        call: (svc) => svc.sendRewardMsg({
          channelId: '12345678',
          nickname: 'Tester',
          avatar: 'https://example.com/avatar.png',
          viewerId: 'viewer1',
          donateType: 'cash',
          content: '100',
        }),
        path: '/live/v3/channel/chat/send-reward-msg',
        config: {
          params: {
            channelId: '12345678',
            nickname: 'Tester',
            avatar: 'https://example.com/avatar.png',
            viewerId: 'viewer1',
            donateType: 'cash',
            content: '100',
          },
        },
      },
    ];

    it.each(cases)('calls $name with documented POST query/form path', async ({ call, path, config }) => {
      const mockResponse = { ok: true };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await call(service);

      expect(mockHttpClient.post).toHaveBeenCalledWith(path, null, config);
      expect(result).toEqual(mockResponse);
    });

    it('keeps addReceiveInfo as a v4 addReceiveInfoV4 alias', async () => {
      const mockResponse = { ok: true };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.addReceiveInfo({
        channelId: '12345678',
        lotteryId: 'lottery1',
        winnerCode: 'WIN1',
        viewerId: 'viewer1',
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/channel/lottery/add-receive-info',
        null,
        {
          params: {
            channelId: '12345678',
            lotteryId: 'lottery1',
            winnerCode: 'WIN1',
            viewerId: 'viewer1',
          },
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('POST JSON body APIs', () => {
    it('creates questionnaire with channelId in query and payload in body', async () => {
      const mockResponse = { questionnaireId: 'questionnaire1' };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.createQuestionnaire({
        channelId: 12345678,
        questionnaireTitle: 'Survey',
        questions: [{ name: 'Question', type: 'R', options: ['A', 'B'] }],
        privacyEnabled: 'Y',
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/channel/questionnaire/save',
        {
          questionnaireTitle: 'Survey',
          questions: [{ name: 'Question', type: 'R', options: ['A', 'B'] }],
          privacyEnabled: 'Y',
        },
        { params: { channelId: 12345678 } }
      );
      expect(result).toEqual(mockResponse);
    });

    it('keeps addEditQuestionnaire as a createQuestionnaire alias', async () => {
      const mockResponse = { questionnaireId: 'questionnaire1' };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      await service.addEditQuestionnaire({
        channelId: '12345678',
        questionnaireTitle: 'Survey',
        questions: [{ name: 'Question', type: 'R' }],
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/channel/questionnaire/save',
        {
          questionnaireTitle: 'Survey',
          questions: [{ name: 'Question', type: 'R' }],
        },
        { params: { channelId: '12345678' } }
      );
    });

    it('batch creates questionnaires with JSON body', async () => {
      const mockResponse = { questionnaires: [{ questionnaireId: 'questionnaire1' }] };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);
      const body = {
        questionnaires: [
          {
            channelId: 12345678,
            questionnaireTitle: 'Survey',
            questions: [{ name: 'Question', type: 'R' }],
          },
        ],
      };

      const result = await service.batchCreateQuestionnaire(body);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/channel/questionnaire/create-batch',
        body
      );
      expect(result).toEqual(mockResponse);
    });

    it('sets student question webhook with JSON body', async () => {
      const mockResponse = '';
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);
      const body = {
        roomId: '12345678',
        callbackUrl: 'https://example.com/polyv/student-question',
      };

      const result = await service.setStudentQuestionWebhook(body);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v5/chat/redirect/channel/student-question-webhook/post',
        body
      );
      expect(result).toEqual(mockResponse);
    });

    it('deletes student question webhook with JSON body', async () => {
      const mockResponse = '';
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);
      const body = { roomId: '12345678' };

      const result = await service.deleteStudentQuestionWebhook(body);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v5/chat/redirect/channel/student-question-webhook/delete',
        body
      );
      expect(result).toEqual(mockResponse);
    });

    it('sends teacher answer with JSON body', async () => {
      const mockResponse = { id: 1001 };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);
      const body = {
        roomId: '12345678',
        content: 'Answer',
        viewerUserId: 'viewer1',
        teacherNick: 'Teacher',
      };

      const result = await service.sendTeacherAnswer(body);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v5/chat/redirect/channel/teacher-answer/post',
        body
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('validation', () => {
    it('throws PolyVValidationError when channelId is empty', async () => {
      await expect(service.getCheckinList({ channelId: '' }))
        .rejects.toThrow(PolyVValidationError);
    });

    it('throws PolyVValidationError when question payload is incomplete', async () => {
      await expect(service.addEditQuestion({
        channelId: '12345678',
        questionId: '',
        type: 'R',
        answer: 'A',
        name: 'Question',
        itemType: 0,
      })).rejects.toThrow(PolyVValidationError);
    });

    it('throws PolyVValidationError when questionnaire has no questions', async () => {
      await expect(service.createQuestionnaire({
        channelId: 12345678,
        questionnaireTitle: 'Survey',
        questions: [],
      })).rejects.toThrow(PolyVValidationError);
    });

    it('throws PolyVValidationError when channelIds is empty', async () => {
      await expect(service.listChannelsLottery({
        channelIds: '',
        startTime: 1767225600000,
        endTime: 1769817600000,
      })).rejects.toThrow(PolyVValidationError);
    });

    it('throws PolyVValidationError when callbackUrl is not http or https', async () => {
      await expect(service.setStudentQuestionWebhook({
        roomId: '12345678',
        callbackUrl: 'ftp://example.com/callback',
      })).rejects.toThrow(PolyVValidationError);
    });

    it('throws PolyVValidationError when like times is over the documented maximum', async () => {
      await expect(service.sendFavor({
        channelId: '12345678',
        viewerId: 'viewer1',
        times: 31,
      })).rejects.toThrow(PolyVValidationError);
    });
  });
});
