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
        name: 'Test Questionnaire',
        questions: [{ question: 'Q1', type: 'S', option: ['A', 'B'] }],
      });

      expect(result).toEqual(mockResponse);
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

      const result = await service.listLottery({ channelId: '12345678' });

      expect(result).toEqual(mockResponse);
    });
  });

  // ============================================
  // listChannelsLottery Tests
  // ============================================

  describe('listChannelsLottery', () => {
    it('[P0] should list channels lottery successfully', async () => {
      const mockResponse = { contents: [{ lotteryId: 'lottery1' }], total: 1 };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await service.listChannelsLottery({ channelIds: '12345678' });

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
});
