/**
 * @fileoverview Unit tests for LiveInteractionService
 * @module services/live-interaction.service.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LiveInteractionService } from './live-interaction.service.js';
import type { PolyVClient } from '../client.js';

// Mock the PolyVClient
const mockHttpClient = {
  get: vi.fn(),
  post: vi.fn(),
};

const mockClient = {
  httpClient: mockHttpClient,
} as unknown as PolyVClient;

describe('LiveInteractionService', () => {
  let service: LiveInteractionService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new LiveInteractionService(mockClient);
  });

  // ============================================
  // getCheckinList Tests
  // ============================================

  describe('getCheckinList', () => {
    it('[P0] should get checkin list successfully', async () => {
      const mockResponse = { contents: [{ checkinId: 'checkin1' }], total: 1 };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getCheckinList({ channelId: '12345678', pageNumber: 1, pageSize: 10 });

      expect(result).toEqual(mockResponse);
    });

    it('[P1] should throw error when channelId is empty', async () => {
      await expect(
        service.getCheckinList({ channelId: '', pageNumber: 1, pageSize: 10 })
      ).rejects.toThrow('channelId is required');
    });
  });

  // ============================================
  // getCheckinByCheckinId Tests
  // ============================================

  describe('getCheckinByCheckinId', () => {
    it('[P0] should get checkin by checkinId successfully', async () => {
      const mockResponse = { checkinId: 'checkin1', count: 100 };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getCheckinByCheckinId({ channelId: '12345678', checkinId: 'checkin1' });

      expect(result).toEqual(mockResponse);
    });
  });

  // ============================================
  // createQuestionnaire Tests
  // ============================================

  describe('createQuestionnaire', () => {
    it('[P0] should create questionnaire successfully', async () => {
      const mockResponse = { questionnaireId: 'q1' };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.createQuestionnaire({
        channelId: '12345678',
        questionnaireTitle: 'Test Questionnaire',
        questions: [{ name: 'Q1', type: 'R', options: ['A', 'B'] }],
      });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/live/v4/channel/questionnaire/save',
        {
          questionnaireTitle: 'Test Questionnaire',
          questions: [{ name: 'Q1', type: 'R', options: ['A', 'B'] }],
        },
        { params: { channelId: '12345678' } }
      );
    });
  });

  // ============================================
  // listQuestionnaire Tests
  // ============================================

  describe('listQuestionnaire', () => {
    it('[P0] should list questionnaire successfully', async () => {
      const mockResponse = { contents: [{ questionnaireId: 'q1' }], total: 1 };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.listQuestionnaire({ channelId: '12345678' });

      expect(result).toEqual(mockResponse);
    });
  });

  // ============================================
  // listQuestionnaireByPage Tests
  // ============================================

  describe('listQuestionnaireByPage', () => {
    it('[P0] should list questionnaire by page successfully', async () => {
      const mockResponse = { contents: [{ questionnaireId: 'q1' }], total: 1 };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.listQuestionnaireByPage({ channelId: '12345678', pageNumber: 1, pageSize: 10 });

      expect(result).toEqual(mockResponse);
    });
  });

  // ============================================
  // getQuestionnaireDetail Tests
  // ============================================

  describe('getQuestionnaireDetail', () => {
    it('[P0] should get questionnaire detail successfully', async () => {
      const mockResponse = { questionnaireId: 'q1', name: 'Test' };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getQuestionnaireDetail({ channelId: '12345678', questionnaireId: 'q1' });

      expect(result).toEqual(mockResponse);
    });
  });

  // ============================================
  // listQuestion Tests
  // ============================================

  describe('listQuestion', () => {
    it('[P0] should list questions successfully', async () => {
      const mockResponse = { contents: [{ questionId: 'q1' }], total: 1 };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.listQuestion({ channelId: '12345678' });

      expect(result).toEqual(mockResponse);
    });
  });

  // ============================================
  // addEditQuestion Tests
  // ============================================

  describe('addEditQuestion', () => {
    it('[P0] should add/edit question successfully', async () => {
      const mockResponse = { questionId: 'q1' };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.addEditQuestion({
        channelId: '12345678',
        questionnaireId: 'q1',
        question: 'Test Question',
        type: 'S',
        option: ['A', 'B'],
      });

      expect(result).toEqual(mockResponse);
    });
  });

  // ============================================
  // deleteQuestion Tests
  // ============================================

  describe('deleteQuestion', () => {
    it('[P0] should delete question successfully', async () => {
      const mockResponse = { status: 'success' };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.deleteQuestion({
        channelId: '12345678',
        questionnaireId: 'q1',
        questionIds: ['q1'],
      });

      expect(result).toEqual(mockResponse);
    });
  });

  // ============================================
  // sendQuestion Tests
  // ============================================

  describe('sendQuestion', () => {
    it('[P0] should send question successfully', async () => {
      const mockResponse = { status: 'success' };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.sendQuestion({
        channelId: '12345678',
        questionnaireId: 'q1',
        questionIds: ['q1'],
      });

      expect(result).toEqual(mockResponse);
    });
  });

  // ============================================
  // stopQuestion Tests
  // ============================================

  describe('stopQuestion', () => {
    it('[P0] should stop question successfully', async () => {
      const mockResponse = { status: 'success' };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.stopQuestion({
        channelId: '12345678',
        questionnaireId: 'q1',
        questionIds: ['q1'],
      });

      expect(result).toEqual(mockResponse);
    });
  });

  // ============================================
  // listLottery Tests
  // ============================================

  describe('listLottery', () => {
    it('[P0] should list lottery successfully', async () => {
      const mockResponse = { contents: [{ lotteryId: 'lottery1' }], total: 1 };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.listLottery({
        channelId: '12345678',
        startTime: 1601481600000,
        endTime: 1615357743000,
      });

      expect(result).toEqual(mockResponse);
    });

    it('[P1] should require startTime and endTime', async () => {
      await expect(
        service.listLottery({ channelId: '12345678' } as never)
      ).rejects.toThrow('startTime is required');
    });
  });

  // ============================================
  // listChannelsLottery Tests
  // ============================================

  describe('listChannelsLottery', () => {
    it('[P0] should list channels lottery successfully', async () => {
      const mockResponse = { contents: [{ lotteryId: 'lottery1' }], total: 1 };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.listChannelsLottery({
        channelIds: '12345678',
        startTime: 1601481600000,
        endTime: 1615357743000,
      });

      expect(result).toEqual(mockResponse);
    });
  });

  // ============================================
  // getWinnerDetail Tests
  // ============================================

  describe('getWinnerDetail', () => {
    it('[P0] should get winner detail successfully', async () => {
      const mockResponse = { contents: [{ viewerId: 'viewer1' }], total: 1 };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getWinnerDetail({ channelId: '12345678', lotteryId: 'lottery1' });

      expect(result).toEqual(mockResponse);
    });
  });

  // ============================================
  // addReceiveInfo Tests
  // ============================================

  describe('addReceiveInfo', () => {
    it('[P0] should add receive info successfully', async () => {
      const mockResponse = { status: 'success' };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.addReceiveInfo({
        channelId: '12345678',
        lotteryId: 'lottery1',
        viewerId: 'viewer1',
        name: 'Test',
        mobile: '13800138000',
      });

      expect(result).toEqual(mockResponse);
    });
  });

  // ============================================
  // sendFavor Tests
  // ============================================

  describe('sendFavor', () => {
    it('[P0] should send favor successfully', async () => {
      const mockResponse = { status: 'success' };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.sendFavor({
        channelId: '12345678',
        favorId: 'favor1',
      });

      expect(result).toEqual(mockResponse);
    });
  });

  // ============================================
  // sendRewardMsg Tests
  // ============================================

  describe('sendRewardMsg', () => {
    it('[P0] should send reward message successfully', async () => {
      const mockResponse = { status: 'success' };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.sendRewardMsg({
        channelId: '12345678',
        rewardId: 'reward1',
        reward: 'Test Reward',
        viewerId: 'viewer1',
      });

      expect(result).toEqual(mockResponse);
    });
  });

  // ============================================
  // getQuestionList Tests
  // ============================================

  describe('getQuestionList', () => {
    it('[P0] should get question list successfully', async () => {
      const mockResponse = { questions: [{ questionId: 'q1' }] };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getQuestionList('12345678');

      expect(result).toEqual(mockResponse);
    });
  });

  describe('documented exact paths', () => {
    it('uses v3/v4 paths for checkin, QA, questionnaire, and lottery APIs', async () => {
      mockHttpClient.get.mockResolvedValue({});
      mockHttpClient.post.mockResolvedValue({});

      await service.getCheckinList({ channelId: '12345678', page: 1, pageSize: 10 });
      await service.getCheckinByCheckinId({ channelId: '12345678', checkinId: 'checkin1' });
      await service.getCheckinBySessionId({ channelId: '12345678', sessionId: 'session1' });
      await service.getCheckinByTime({ channelId: '12345678', startDate: '2026-06-01', endDate: '2026-06-22' });
      await service.listQuestion({ channelId: '12345678' });
      await service.sendQuestion({ channelId: '12345678', questionId: 'question1', duration: 30 });
      await service.stopQuestion({ channelId: '12345678', questionId: 'question1' });
      await service.listQuestionnaireByPage({ channelId: '12345678', page: 1, pageSize: 10 });
      await service.getQuestionnaireDetail({ channelId: '12345678', questionnaireId: 'questionnaire1' });
      await service.listLottery({ channelId: '12345678', startTime: 1, endTime: 2 });
      await service.getWinnerDetail({ channelId: '12345678', lotteryId: 'lottery1' });

      expect(mockHttpClient.get).toHaveBeenCalledWith('/live/v3/channel/checkin/list', {
        params: { channelId: '12345678', page: 1, pageSize: 10 },
      });
      expect(mockHttpClient.get).toHaveBeenCalledWith('/live/v3/channel/chat/get-checkins', {
        params: { channelId: '12345678', checkinId: 'checkin1' },
      });
      expect(mockHttpClient.get).toHaveBeenCalledWith('/live/v3/channel/chat/checkin-by-sessionId', {
        params: { channelId: '12345678', sessionId: 'session1' },
      });
      expect(mockHttpClient.get).toHaveBeenCalledWith('/live/v3/channel/chat/get-checkin-list', {
        params: { channelId: '12345678', startDate: '2026-06-01', endDate: '2026-06-22' },
      });
      expect(mockHttpClient.get).toHaveBeenCalledWith('/live/v3/channel/interact/question/list-question', {
        params: { channelId: '12345678' },
      });
      expect(mockHttpClient.post).toHaveBeenCalledWith('/live/v4/channel/question/send', null, {
        params: { channelId: '12345678', questionId: 'question1', duration: 30 },
      });
      expect(mockHttpClient.post).toHaveBeenCalledWith('/live/v4/channel/question/stop', null, {
        params: { channelId: '12345678', questionId: 'question1' },
      });
      expect(mockHttpClient.get).toHaveBeenCalledWith('/live/v3/channel/questionnaire/list-answer-records', {
        params: { channelId: '12345678', page: 1, pageSize: 10 },
      });
      expect(mockHttpClient.get).toHaveBeenCalledWith('/live/v3/channel/questionnaire/detail', {
        params: { channelId: '12345678', questionnaireId: 'questionnaire1' },
      });
      expect(mockHttpClient.get).toHaveBeenCalledWith('/live/v3/channel/lottery/list-lottery', {
        params: { channelId: '12345678', startTime: 1, endTime: 2 },
      });
      expect(mockHttpClient.get).toHaveBeenCalledWith('/live/v3/channel/lottery/get-winner-detail', {
        params: { channelId: '12345678', lotteryId: 'lottery1' },
      });
    });
  });
});
