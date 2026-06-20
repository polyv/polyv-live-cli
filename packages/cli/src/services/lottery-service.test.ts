/**
 * @fileoverview Unit tests for LotteryServiceSdk
 * @author Development Team
 * @since 11.5.0
 */

import { LotteryServiceSdk } from './lottery-service';
import { PolyVClient } from 'polyv-live-api-sdk';
import { AuthConfig } from '../types/auth';
import { LotteryServiceConfig, CreateLotteryActivityParams } from '../types/lottery';
import { PolyVError } from '../utils/errors';

// Mock PolyVClient
jest.mock('polyv-live-api-sdk');
const MockedPolyVClient = PolyVClient as jest.MockedClass<typeof PolyVClient>;

describe('LotteryServiceSdk', () => {
  let lotteryService: LotteryServiceSdk;
  let mockAuthConfig: AuthConfig;
  let mockServiceConfig: LotteryServiceConfig;
  let mockPolyVClient: jest.Mocked<PolyVClient>;
  let mockV4ChannelService: any;
  let mockLiveInteractionService: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAuthConfig = {
      appId: 'test-app-id',
      appSecret: 'test-app-secret',
      userId: 'test-user-id',
    };

    mockServiceConfig = {
      baseUrl: 'https://api.polyv.net',
      timeout: 30000,
      debug: false,
    };

    // Create mock services
    mockV4ChannelService = {
      createLotteryActivityExact: jest.fn(),
      listLotteryActivitiesExact: jest.fn(),
      getLotteryActivityExact: jest.fn(),
      updateLotteryActivityExact: jest.fn(),
      deleteLotteryActivityExact: jest.fn(),
      queryWinnerViewer: jest.fn(),
      listLotteryActivityRecords: jest.fn(),
      createConditionWaitLottery: jest.fn(),
      listLotteryViewerGroups: jest.fn(),
      createLotteryViewerGroup: jest.fn(),
      updateLotteryViewerGroup: jest.fn(),
      deleteLotteryViewerGroup: jest.fn(),
      listLotteryGroupViewers: jest.fn(),
      createLotteryGroupViewers: jest.fn(),
      createLotteryGroupViewerNames: jest.fn(),
      deleteLotteryGroupViewers: jest.fn(),
      listLotteryBlacklistViewers: jest.fn(),
      createLotteryBlacklistViewers: jest.fn(),
      deleteLotteryBlacklistViewers: jest.fn(),
      listLuckyBagWinners: jest.fn(),
    };

    mockLiveInteractionService = {
      getWinnerDetail: jest.fn(),
      listLottery: jest.fn(),
    };

    // Create mock PolyVClient
    mockPolyVClient = {
      v4Channel: mockV4ChannelService,
      liveInteraction: mockLiveInteractionService,
    } as any;

    MockedPolyVClient.mockImplementation(() => mockPolyVClient);

    lotteryService = new LotteryServiceSdk(mockAuthConfig, mockServiceConfig);
  });

  describe('constructor', () => {
    it('11.5-SVC-001: should create LotteryServiceSdk with correct configuration', () => {
      expect(lotteryService).toBeDefined();
    });
  });

  // ============================================================
  // AC #1: createLotteryActivity (V4 API)
  // ============================================================
  describe('createLotteryActivity (AC #1)', () => {
    it('11.5-SVC-002: should create lottery activity with minimal parameters', async () => {
      const params: CreateLotteryActivityParams = {
        channelId: '3151318',
        activityName: 'Test Lottery',
        lotteryCondition: 'none',
        amount: 3,
        prizeName: 'Test Prize',
      };

      mockV4ChannelService.createLotteryActivityExact.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          id: '20521',
        },
      });

      const result = await lotteryService.createLotteryActivity(params);

      expect(mockV4ChannelService.createLotteryActivityExact).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '3151318',
          activityName: 'Test Lottery',
          lotteryCondition: 'none',
          amount: 3,
          prizeName: 'Test Prize',
        })
      );
      expect(result.data.id).toBe('20521');
    });

    it('11.5-SVC-003: should create lottery activity with receiveInfo', async () => {
      const params: CreateLotteryActivityParams = {
        channelId: '3151318',
        activityName: 'Test Lottery',
        lotteryCondition: 'none',
        amount: 3,
        prizeName: 'Test Prize',
        receiveEnabled: 'Y',
        receiveInfo: JSON.stringify([
          { type: 'userName', field: 'Name', tips: 'Please enter name', required: true },
        ]),
      };

      mockV4ChannelService.createLotteryActivityExact.mockResolvedValue({
        code: 200,
        status: 'success',
        data: { id: '20521' },
      });

      await lotteryService.createLotteryActivity(params);

      expect(mockV4ChannelService.createLotteryActivityExact).toHaveBeenCalledWith(
        expect.objectContaining({
          receiveEnabled: 'Y',
        })
      );
    });

    it('11.5-SVC-004: should create invite-type lottery activity', async () => {
      const params: CreateLotteryActivityParams = {
        channelId: '3151318',
        activityName: 'Invite Lottery',
        lotteryCondition: 'invite',
        amount: 5,
        prizeName: 'Invite Prize',
        duration: 30,
        inviteNum: 3,
      };

      mockV4ChannelService.createLotteryActivityExact.mockResolvedValue({
        code: 200,
        status: 'success',
        data: { id: '20522' },
      });

      await lotteryService.createLotteryActivity(params);

      expect(mockV4ChannelService.createLotteryActivityExact).toHaveBeenCalledWith(
        expect.objectContaining({
          lotteryCondition: 'invite',
          duration: 30,
          inviteNum: 3,
        })
      );
    });

    it('11.5-SVC-005: should create duration-type lottery activity', async () => {
      const params: CreateLotteryActivityParams = {
        channelId: '3151318',
        activityName: 'Duration Lottery',
        lotteryCondition: 'duration',
        amount: 2,
        prizeName: 'Duration Prize',
        duration: 10,
      };

      mockV4ChannelService.createLotteryActivityExact.mockResolvedValue({
        code: 200,
        status: 'success',
        data: { id: '20523' },
      });

      await lotteryService.createLotteryActivity(params);

      expect(mockV4ChannelService.createLotteryActivityExact).toHaveBeenCalledWith(
        expect.objectContaining({
          lotteryCondition: 'duration',
          duration: 10,
        })
      );
    });

    it('11.5-SVC-006: should handle API errors', async () => {
      const params: CreateLotteryActivityParams = {
        channelId: '3151318',
        activityName: 'Test Lottery',
        lotteryCondition: 'none',
        amount: 3,
        prizeName: 'Test Prize',
      };

      mockV4ChannelService.createLotteryActivityExact.mockRejectedValue(
        new Error('API Error: Authentication failed')
      );

      await expect(lotteryService.createLotteryActivity(params)).rejects.toThrow();
    });
  });

  // ============================================================
  // AC #2: listLotteryActivities (V4 API)
  // ============================================================
  describe('listLotteryActivities (AC #2)', () => {
    it('11.5-SVC-007: should list lottery activities with minimal parameters', async () => {
      mockV4ChannelService.listLotteryActivitiesExact.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          contents: [
            {
              id: '20521',
              activityName: 'Test Lottery',
              lotteryCondition: 'none',
              status: 'ended',
              amount: 3,
              prizeName: 'Test Prize',
            },
          ],
          pageSize: 10,
          pageNumber: 1,
          totalItems: 1,
          totalPages: 1,
        },
      });

      const result = await lotteryService.listLotteryActivities({
        channelId: '3151318',
      });

      expect(mockV4ChannelService.listLotteryActivitiesExact).toHaveBeenCalledWith({
        channelId: '3151318',
      });
      expect(result.data.contents).toHaveLength(1);
    });

    it('11.5-SVC-008: should list lottery activities with pagination', async () => {
      mockV4ChannelService.listLotteryActivitiesExact.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          contents: [],
          pageSize: 20,
          pageNumber: 1,
          totalItems: 0,
          totalPages: 0,
        },
      });

      await lotteryService.listLotteryActivities({
        channelId: '3151318',
        pageNumber: 1,
        pageSize: 20,
      });

      expect(mockV4ChannelService.listLotteryActivitiesExact).toHaveBeenCalledWith(
        expect.objectContaining({
          pageNumber: 1,
          pageSize: 20,
        })
      );
    });
  });

  // ============================================================
  // AC #3: getLotteryActivity (V4 API)
  // ============================================================
  describe('getLotteryActivity (AC #3)', () => {
    it('11.5-SVC-009: should get lottery activity details', async () => {
      mockV4ChannelService.getLotteryActivityExact.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {
          id: '20521',
          activityName: 'Test Lottery',
          lotteryCondition: 'none',
          status: 'ended',
          amount: 3,
          prizeName: 'Test Prize',
        },
      });

      const result = await lotteryService.getLotteryActivity({
        channelId: '3151318',
        id: '20521',
      });

      expect(mockV4ChannelService.getLotteryActivityExact).toHaveBeenCalledWith({
        channelId: '3151318',
        id: '20521',
      });
      expect(result.data.id).toBe('20521');
    });
  });

  // ============================================================
  // AC #4: updateLotteryActivity (V4 API)
  // ============================================================
  describe('updateLotteryActivity (AC #4)', () => {
    it('11.5-SVC-010: should update lottery activity', async () => {
      mockV4ChannelService.getLotteryActivityExact.mockResolvedValue({
        activityName: 'Original Name',
        lotteryCondition: 'none',
        amount: 3,
        prizeName: 'Original Prize',
      });
      mockV4ChannelService.updateLotteryActivityExact.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {},
      });

      await lotteryService.updateLotteryActivity({
        channelId: '3151318',
        id: '20521',
        activityName: 'Updated Name',
        amount: 5,
        prizeName: 'Updated Prize',
      });

      expect(mockV4ChannelService.getLotteryActivityExact).toHaveBeenCalledWith({
        channelId: '3151318',
        id: '20521',
      });
      expect(mockV4ChannelService.updateLotteryActivityExact).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '3151318',
          id: '20521',
          activityName: 'Updated Name',
          lotteryCondition: 'none',
          amount: 5,
          prizeName: 'Updated Prize',
        })
      );
    });
  });

  // ============================================================
  // AC #5: deleteLotteryActivity (V4 API)
  // ============================================================
  describe('deleteLotteryActivity (AC #5)', () => {
    it('11.5-SVC-011: should delete lottery activity', async () => {
      mockV4ChannelService.deleteLotteryActivityExact.mockResolvedValue({
        code: 200,
        status: 'success',
        data: {},
      });

      await lotteryService.deleteLotteryActivity({
        channelId: '3151318',
        id: '20521',
      });

      expect(mockV4ChannelService.deleteLotteryActivityExact).toHaveBeenCalledWith({
        channelId: '3151318',
        id: '20521',
      });
    });
  });

  // ============================================================
  // AC #6: getWinnerDetail
  // ============================================================
  describe('getWinnerDetail (AC #6)', () => {
    it('11.5-SVC-012: should get winner detail list', async () => {
      mockLiveInteractionService.getWinnerDetail.mockResolvedValue({
        code: 200,
        status: 'success',
        data: [
          {
            viewerId: 'viewer123',
            nick: 'Winner1',
            winnerCode: 'ABC123',
            winTime: 1616150400000,
          },
        ],
      });

      const result = await lotteryService.getWinnerDetail({
        channelId: '3151318',
        lotteryId: 'fv3mao43u6',
      });

      expect(mockLiveInteractionService.getWinnerDetail).toHaveBeenCalledWith({
        channelId: '3151318',
        lotteryId: 'fv3mao43u6',
        page: undefined,
        limit: undefined,
      });
      expect(result.data).toHaveLength(1);
    });

    it('11.5-SVC-013: should get winner detail with pagination', async () => {
      mockLiveInteractionService.getWinnerDetail.mockResolvedValue({
        code: 200,
        status: 'success',
        data: [],
      });

      await lotteryService.getWinnerDetail({
        channelId: '3151318',
        lotteryId: 'fv3mao43u6',
        page: 1,
        limit: 20,
      });

      expect(mockLiveInteractionService.getWinnerDetail).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 20,
        })
      );
    });

    it('11.5-SVC-013b: should query viewer-specific winner record when viewerId is provided', async () => {
      mockV4ChannelService.queryWinnerViewer.mockResolvedValue({
        code: 200,
        status: 'success',
        data: [],
      });

      await lotteryService.getWinnerDetail({
        channelId: '3151318',
        lotteryId: 'fv3mao43u6',
        viewerId: 'viewer123',
        page: 1,
        limit: 20,
      });

      expect(mockV4ChannelService.queryWinnerViewer).toHaveBeenCalledWith({
        channelId: '3151318',
        lotteryId: 'fv3mao43u6',
        viewerId: 'viewer123',
        pageNumber: 1,
        pageSize: 20,
      });
    });
  });

  // ============================================================
  // AC #7: listLottery (V4 Channel API)
  // ============================================================
  describe('listLottery (AC #7)', () => {
    it('11.5-SVC-014: should list lottery records', async () => {
      mockV4ChannelService.listLotteryActivityRecords.mockResolvedValue({
        code: 200,
        status: 'success',
        data: [
          {
            lotteryId: 'fv3mao43u6',
            channelId: '3151318',
            sessionId: 'fwly13xczv',
            prize: 'Test Prize',
            amount: 3,
            winnerCount: 3,
            createdTime: 1616150400000,
          },
        ],
      });

      const result = await lotteryService.listLottery({
        channelId: '3151318',
      });

      expect(mockV4ChannelService.listLotteryActivityRecords).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '3151318',
          startTimeBegin: expect.any(Number),
          startTimeEnd: expect.any(Number),
        })
      );
      expect(result.data).toHaveLength(1);
    });

    it('11.5-SVC-015: should list lottery records with time range', async () => {
      mockV4ChannelService.listLotteryActivityRecords.mockResolvedValue({
        code: 200,
        status: 'success',
        data: [],
      });

      await lotteryService.listLottery({
        channelId: '3151318',
        startTime: 1615772426000,
        endTime: 1615773566000,
      });

      expect(mockV4ChannelService.listLotteryActivityRecords).toHaveBeenCalledWith(
        expect.objectContaining({
          startTimeBegin: 1615772426000,
          startTimeEnd: 1615773566000,
        })
      );
    });

    it('11.5-SVC-016: should list lottery records with sessionId filter', async () => {
      mockV4ChannelService.listLotteryActivityRecords.mockResolvedValue({
        code: 200,
        status: 'success',
        data: [],
      });

      await lotteryService.listLottery({
        channelId: '3151318',
        sessionId: 'fwly13xczv',
      });

      expect(mockV4ChannelService.listLotteryActivityRecords).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: 'fwly13xczv',
        })
      );
    });

    it('11.5-SVC-017: should list lottery records with pagination', async () => {
      mockV4ChannelService.listLotteryActivityRecords.mockResolvedValue({
        code: 200,
        status: 'success',
        data: [],
      });

      await lotteryService.listLottery({
        channelId: '3151318',
        page: 1,
        limit: 20,
      });

      expect(mockV4ChannelService.listLotteryActivityRecords).toHaveBeenCalledWith(
        expect.objectContaining({
          pageNumber: 1,
          pageSize: 20,
        })
      );
    });
  });

  describe('v4 channel interaction lottery helpers', () => {
    it('maps viewer group and member methods to V4ChannelService', async () => {
      mockV4ChannelService.listLotteryViewerGroups.mockResolvedValue({ data: { contents: [] } });
      mockV4ChannelService.createLotteryViewerGroup.mockResolvedValue({ id: 1 });
      mockV4ChannelService.updateLotteryViewerGroup.mockResolvedValue({ id: 1 });
      mockV4ChannelService.deleteLotteryViewerGroup.mockResolvedValue(undefined);
      mockV4ChannelService.listLotteryGroupViewers.mockResolvedValue({ data: { contents: [] } });
      mockV4ChannelService.createLotteryGroupViewers.mockResolvedValue([]);
      mockV4ChannelService.createLotteryGroupViewerNames.mockResolvedValue([]);
      mockV4ChannelService.deleteLotteryGroupViewers.mockResolvedValue(undefined);

      await lotteryService.listLotteryViewerGroups({ channelId: '3151318' });
      await lotteryService.createLotteryViewerGroup({ channelId: '3151318', title: 'VIP' });
      await lotteryService.updateLotteryViewerGroup({ channelId: '3151318', id: 1, title: 'VIP 2' });
      await lotteryService.deleteLotteryViewerGroup({ channelId: '3151318', id: 1 });
      await lotteryService.listLotteryGroupViewers({ channelId: '3151318', groupId: 1 });
      await lotteryService.createLotteryGroupViewers({ channelId: '3151318', groupId: 1, viewerIds: ['viewer-1'] });
      await lotteryService.createLotteryGroupViewerNames({
        channelId: '3151318',
        groupId: 1,
        viewerNames: [{ viewerId: 'viewer-1', viewerName: 'Nick' }],
      });
      await lotteryService.deleteLotteryGroupViewers({ channelId: '3151318', groupId: 1, ids: [1] });

      expect(mockV4ChannelService.listLotteryViewerGroups).toHaveBeenCalledWith({ channelId: '3151318' });
      expect(mockV4ChannelService.createLotteryViewerGroup).toHaveBeenCalledWith({ channelId: '3151318', title: 'VIP' });
      expect(mockV4ChannelService.updateLotteryViewerGroup).toHaveBeenCalledWith({ channelId: '3151318', id: 1, title: 'VIP 2' });
      expect(mockV4ChannelService.deleteLotteryViewerGroup).toHaveBeenCalledWith({ channelId: '3151318', id: 1 });
      expect(mockV4ChannelService.listLotteryGroupViewers).toHaveBeenCalledWith({ channelId: '3151318', groupId: 1 });
      expect(mockV4ChannelService.createLotteryGroupViewers).toHaveBeenCalledWith({ channelId: '3151318', groupId: 1, viewerIds: ['viewer-1'] });
      expect(mockV4ChannelService.createLotteryGroupViewerNames).toHaveBeenCalledWith(expect.objectContaining({ viewerNames: expect.any(Array) }));
      expect(mockV4ChannelService.deleteLotteryGroupViewers).toHaveBeenCalledWith({ channelId: '3151318', groupId: 1, ids: [1] });
    });

    it('maps blacklist, lucky bag, and wait lottery methods to V4ChannelService', async () => {
      mockV4ChannelService.listLotteryBlacklistViewers.mockResolvedValue({ data: { contents: [] } });
      mockV4ChannelService.createLotteryBlacklistViewers.mockResolvedValue([]);
      mockV4ChannelService.deleteLotteryBlacklistViewers.mockResolvedValue(undefined);
      mockV4ChannelService.listLuckyBagWinners.mockResolvedValue({ data: { contents: [] } });
      mockV4ChannelService.createConditionWaitLottery.mockResolvedValue({ success: true });

      await lotteryService.listLotteryBlacklistViewers({ channelId: '3151318' });
      await lotteryService.createLotteryBlacklistViewers({ channelId: '3151318', viewerIds: ['viewer-1'] });
      await lotteryService.deleteLotteryBlacklistViewers({ channelId: '3151318', ids: [1] });
      await lotteryService.listLuckyBagWinners({ activityId: 123, currentPage: 1, pageSize: 10 });
      await lotteryService.createConditionWaitLottery({ channelId: '3151318', id: 1, lotteryTime: 1704067200000 });

      expect(mockV4ChannelService.listLotteryBlacklistViewers).toHaveBeenCalledWith({ channelId: '3151318' });
      expect(mockV4ChannelService.createLotteryBlacklistViewers).toHaveBeenCalledWith({ channelId: '3151318', viewerIds: ['viewer-1'] });
      expect(mockV4ChannelService.deleteLotteryBlacklistViewers).toHaveBeenCalledWith({ channelId: '3151318', ids: [1] });
      expect(mockV4ChannelService.listLuckyBagWinners).toHaveBeenCalledWith({ activityId: 123, currentPage: 1, pageSize: 10 });
      expect(mockV4ChannelService.createConditionWaitLottery).toHaveBeenCalledWith({ channelId: '3151318', id: 1, lotteryTime: 1704067200000 });
    });
  });

  // ============================================================
  // Error Handling
  // ============================================================
  describe('Error Handling', () => {
    it('11.5-SVC-018: should wrap SDK errors with PolyVError', async () => {
      mockV4ChannelService.createLotteryActivityExact.mockRejectedValue(
        new Error('Network error')
      );

      await expect(
        lotteryService.createLotteryActivity({
          channelId: '3151318',
          activityName: 'Test',
          lotteryCondition: 'none',
          amount: 1,
          prizeName: 'Prize',
        })
      ).rejects.toThrow(PolyVError);
    });
  });
});
