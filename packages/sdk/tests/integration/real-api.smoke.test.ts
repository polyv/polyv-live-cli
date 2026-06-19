import { describe, expect, it } from 'vitest';
import { PolyVAPIError } from '../../src/index.js';
import {
  createIntegrationClient,
  discoverChannelId,
  expectPaginatedResponse,
  getIntegrationConfig,
  hasRealCredentials,
} from './helpers.js';

const describeWithCredentials = hasRealCredentials() ? describe : describe.skip;
const describeWithWriteAccess = process.env.POLYV_RUN_WRITE_INTEGRATION === 'true'
  ? describe
  : describe.skip;

function currentMonthDateRange(): { startDate: string; endDate: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return {
    startDate: `${year}-${month}-01`,
    endDate: `${year}-${month}-${day}`,
  };
}

function currentBillingPeriod(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');

  return `${year}${month}`;
}

function isExpectedGroupAccountRestriction(error: unknown): boolean {
  return error instanceof PolyVAPIError
    && error.statusCode === 400
    && error.message.includes('找不到集团账号');
}

function isExpectedMrPermissionRestriction(error: unknown): boolean {
  return error instanceof PolyVAPIError
    && error.statusCode === 400
    && error.message.includes('没有开启MR直播权限');
}

describeWithCredentials('SDK real API integration smoke', () => {
  const client = createIntegrationClient();

  it('authenticates with the configured production credentials', async () => {
    const config = getIntegrationConfig();
    const userInfo = await client.account.getUserInfo();

    expect(userInfo.userId).toBeTruthy();
    if (config.userId) {
      expect(userInfo.userId).toBe(config.userId);
    }
  });

  it('calls account read-only APIs without mock responses', async () => {
    const userInfo = await client.account.getUserInfo();
    const dateRange = currentMonthDateRange();

    const channelIds = await client.account.channels();
    const simpleChannels = await client.account.getSimpleChannelList({ page: 1, pageSize: 1 });
    const basicChannels = await client.account.userChannelBasicList({ page: 1, pageSize: 1 });
    const userDurations = await client.account.getUserDurations();
    const micDuration = await client.account.micDuration();
    const incomeDetail = await client.account.getIncomeDetail({
      userId: userInfo.userId,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      page: 1,
      pageSize: 1,
    });

    expect(channelIds.channels).toEqual(expect.any(Array));
    expectPaginatedResponse(simpleChannels);
    expectPaginatedResponse(basicChannels);
    expect(userDurations).toEqual(expect.objectContaining({
      userId: expect.any(String),
      available: expect.any(Number),
      used: expect.any(Number),
    }));
    expect(micDuration).toEqual(expect.objectContaining({
      available: expect.any(Number),
      history: expect.any(Number),
    }));
    expectPaginatedResponse(incomeDetail);
  });

  it('calls material label list without mock responses', async () => {
    const materialLabels = await client.v4Material.listMaterialLabels({
      pageNumber: 1,
      pageSize: 10,
    });

    expectPaginatedResponse(materialLabels);
  });

  it('calls V4 user label page without mock responses', async () => {
    const labels = await client.v4User.listLabels({
      pageNumber: 1,
      pageSize: 10,
    });

    expect(labels).toEqual(expect.objectContaining({
      contents: expect.any(Array),
    }));
    expect(Number(labels.pageNumber)).toBeGreaterThanOrEqual(1);
    expect(Number(labels.pageSize)).toBeGreaterThanOrEqual(1);
  });

  it('calls V4 user product and custom-field read-only APIs without mock responses', async () => {
    const products = await client.v4User.listProducts({
      pageNumber: 1,
      pageSize: 10,
    });
    const customFields = await client.v4User.listCustomFields();

    expect(products).toEqual(expect.objectContaining({
      contents: expect.any(Array),
    }));
    expect(Number(products.pageNumber)).toBeGreaterThanOrEqual(1);
    expect(Number(products.pageSize)).toBeGreaterThanOrEqual(1);
    expect(customFields).toEqual(expect.any(Array));
  });

  it('calls V4 user invite-sales read-only APIs without mock responses', async () => {
    const inviteSales = await client.v4User.listInviteSales({
      pageNumber: 1,
      pageSize: 10,
    });
    const followViewers = await client.v4User.listFollowViewers({
      pageNumber: 1,
      pageSize: 10,
    });

    expect(inviteSales).toEqual(expect.objectContaining({
      contents: expect.any(Array),
    }));
    expect(Number(inviteSales.pageNumber)).toBeGreaterThanOrEqual(1);
    expect(Number(inviteSales.pageSize)).toBeGreaterThanOrEqual(1);
    expect(followViewers).toEqual(expect.objectContaining({
      contents: expect.any(Array),
    }));
    expect(Number(followViewers.pageNumber)).toBeGreaterThanOrEqual(1);
    expect(Number(followViewers.pageSize)).toBeGreaterThanOrEqual(1);
  });

  it('calls V4 user settings/template read-only APIs without mock responses', async () => {
    const [
      roles,
      donateTemplate,
      playbackSetting,
      callbackSettings,
      footerSettings,
      pvShow,
      micDuration,
    ] = await Promise.all([
      client.v4User.listChildAccountRoles(),
      client.v4User.getDonateTemplate(),
      client.v4User.getPlaybackSetting(),
      client.v4User.getCallback(),
      client.v4User.getGlobalFooter(),
      client.v4User.getPvShowEnable(),
      client.v4User.getMicDuration(),
    ]);

    expect(roles).toEqual(expect.any(Array));
    expect(donateTemplate).toEqual(expect.any(Object));
    expect(playbackSetting).toEqual(expect.any(Object));
    expect(callbackSettings).toEqual(expect.any(Object));
    expect(footerSettings).toEqual(expect.any(Object));
    expect(pvShow).toEqual(expect.objectContaining({
      enabled: expect.stringMatching(/^[YN]$/),
    }));
    expect(micDuration).toEqual(expect.objectContaining({
      userId: expect.any(String),
    }));
  });

  it('calls MR concurrency detail when the account has MR permissions', async () => {
    try {
      const mrConcurrency = await client.v4User.getMrConcurrencyDetail();

      expect(mrConcurrency).toEqual(expect.objectContaining({
        mrLiveConcurrency: expect.any(Number),
      }));
    } catch (error) {
      if (isExpectedMrPermissionRestriction(error)) {
        console.warn('Skipping MR concurrency assertion: configured account has not enabled MR live permissions.');
        return;
      }

      throw error;
    }
  });

  it('calls V4 user billing and watch-log read-only APIs without mock responses', async () => {
    const dateRange = currentMonthDateRange();
    const useDetails = await client.v4User.getBillUseDetailList({
      itemCategory: 'duration',
      pageNumber: 1,
      pageSize: 10,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    });
    const watchLogs = await client.v4User.getWatchLogList({
      pageNumber: 1,
      pageSize: 10,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    });

    expectPaginatedResponse(useDetails);
    expectPaginatedResponse(watchLogs);
  });

  it('calls invite-customer lookup when a sale identifier is configured', async () => {
    const saleId = process.env.POLYV_SALE_ID;
    const saleCode = process.env.POLYV_SALE_CODE;

    if (!saleId && !saleCode) {
      console.warn('Skipping invite-customer assertion: POLYV_SALE_ID or POLYV_SALE_CODE is not configured.');
      return;
    }

    const result = await client.v4User.getBySale({ saleId, saleCode });

    expect(result).toEqual(expect.objectContaining({
      childUserId: expect.any(String),
    }));
  });

  it('calls viewer lottery win list when a viewer ID is configured', async () => {
    const viewerId = process.env.POLYV_VIEWER_ID;

    if (!viewerId) {
      console.warn('Skipping viewer lottery win assertion: POLYV_VIEWER_ID is not configured.');
      return;
    }

    const wins = await client.v4User.viewerLotteryWin({
      viewerId,
      pageNumber: 1,
      pageSize: 10,
    });

    expect(wins).toEqual(expect.objectContaining({
      contents: expect.any(Array),
    }));
  });

  it('calls viewer watch-log detail when a viewer ID is configured', async () => {
    const viewerId = process.env.POLYV_VIEWER_ID;

    if (!viewerId) {
      console.warn('Skipping viewer watch-log detail assertion: POLYV_VIEWER_ID is not configured.');
      return;
    }

    const dateRange = currentMonthDateRange();
    const details = await client.v4User.getWatchLogDetail({
      viewerId,
      pageNumber: 1,
      pageSize: 10,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    });

    expectPaginatedResponse(details);
  });

  it('calls AI video-produce PPT list without mock responses', async () => {
    const videoProducePpts = await client.v4Ai.listVideoProducePpts({
      pageNumber: 1,
      pageSize: 10,
    });

    expectPaginatedResponse(videoProducePpts);
  });

  it('calls finance bill detail list without mock responses', async () => {
    const dateRange = currentMonthDateRange();
    const billDetails = await client.finance.listBillDetails({
      itemCategory: 'duration',
      pageNumber: 1,
      pageSize: 10,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    });

    expectPaginatedResponse(billDetails);
  });

  it('calls group billing API when the account has group permissions', async () => {
    const billingPeriod = currentBillingPeriod();

    try {
      const result = await client.v4Group.listGroupUserBillingDaily({
        startDate: billingPeriod,
        endDate: billingPeriod,
        pageNumber: 1,
        pageSize: 10,
      });

      expectPaginatedResponse(result);
    } catch (error) {
      if (isExpectedGroupAccountRestriction(error)) {
        console.warn('Skipping group billing assertion: configured account is not a group master account.');
        return;
      }

      throw error;
    }
  });

  it('calls channel-scoped read-only APIs when a channel can be discovered', async () => {
    const channelId = await discoverChannelId(client);

    if (!channelId) {
      console.warn('Skipping channel-scoped API assertions: no POLYV_CHANNEL_ID and no channel found via list APIs.');
      return;
    }

    const onlineCount = await client.chat.countOnlineUser({ channelId });
    const enrollList = await client.web.enrollList({ channelId });
    const switchSettings = await client.account.switchGet({ channelId });
    const receiveList = await client.account.receiveList({ channelId, page: 1, pageSize: 1 });

    expect(typeof onlineCount).toBe('number');
    expect(onlineCount).toBeGreaterThanOrEqual(0);
    expect(enrollList).toEqual(expect.objectContaining({
      auditEnabled: expect.stringMatching(/^[YN]$/),
      list: expect.any(Array),
    }));
    expect(switchSettings).toEqual(expect.any(Array));
    expectPaginatedResponse(receiveList);
  });

  it('calls historical channel playback read-only APIs when a channel can be discovered', async () => {
    const channelId = await discoverChannelId(client);

    if (!channelId) {
      console.warn('Skipping historical playback assertions: no POLYV_CHANNEL_ID and no channel found via list APIs.');
      return;
    }

    const config = getIntegrationConfig();
    const sessions = await client.channel.listChannelSessions({
      channelId,
      page: 1,
      pageSize: 1,
    });

    expectPaginatedResponse(sessions);

    if (!config.userId) {
      console.warn('Skipping historical record-file list assertion: POLYV_USER_ID is not configured.');
      return;
    }

    const recordFiles = await client.channel.listRecordFiles({
      channelId,
      userId: config.userId,
    });

    expect(recordFiles).toEqual(expect.any(Array));
  });

  it('calls live interaction read-only APIs when a channel can be discovered', async () => {
    const channelId = await discoverChannelId(client);

    if (!channelId) {
      console.warn('Skipping live interaction assertions: no POLYV_CHANNEL_ID and no channel found via list APIs.');
      return;
    }

    const now = Date.now();
    const startTime = now - 7 * 24 * 60 * 60 * 1000;

    await client.liveInteraction.getCheckinList({ channelId, page: 1, pageSize: 1 });
    await client.liveInteraction.listQuestion({ channelId });
    await client.liveInteraction.listQuestionSendTime({ channelId });
    await client.liveInteraction.listQuestionnaire({ channelId, page: 1, pageSize: 1 });
    await client.liveInteraction.listLottery({ channelId, startTime, endTime: now, page: 1, limit: 1 });
  });

  describeWithWriteAccess('write API lifecycle', () => {
    it('sends encoded custom chat message with form body', async () => {
      const channelId = await discoverChannelId(client);

      if (!channelId) {
        console.warn('Skipping sendCustomMessageEncode assertion: no POLYV_CHANNEL_ID and no channel found via list APIs.');
        return;
      }

      const content = Buffer
        .from(`SDK integration test ${Date.now()}`, 'utf8')
        .toString('base64url');

      await expect(client.v4Chat.sendCustomMessageEncode({
        channelId,
        content,
        joinHistoryList: 0,
        watchType: '2',
      })).resolves.toBeUndefined();
    });

    it('creates, updates, and deletes a material label with cleanup', async () => {
      const uniqueName = `sdk-it-${Date.now()}`;
      const updatedName = `${uniqueName}-updated`;
      let createdLabelId: number | undefined;

      try {
        await client.v4Material.createMaterialLabel({ name: uniqueName });

        const createdLabels = await client.v4Material.listMaterialLabels({
          keyword: uniqueName,
          pageNumber: 1,
          pageSize: 10,
        });

        createdLabelId = createdLabels.contents.find((label) => label.name === uniqueName)?.id;
        expect(createdLabelId).toEqual(expect.any(Number));

        await client.v4Material.updateMaterialLabel({
          id: createdLabelId,
          name: updatedName,
        });

        const updatedLabels = await client.v4Material.listMaterialLabels({
          keyword: updatedName,
          pageNumber: 1,
          pageSize: 10,
        });

        expect(updatedLabels.contents.some((label) => label.id === createdLabelId)).toBe(true);
      } finally {
        if (createdLabelId !== undefined) {
          await client.v4Material.deleteMaterialLabel({ id: createdLabelId });
        }
      }
    });

    it('creates, updates, and deletes a V4 user label with cleanup', async () => {
      const uniqueName = `sdk-it-${Date.now()}`;
      const updatedName = `${uniqueName}-updated`;
      let createdLabelId: string | undefined;

      try {
        const createdLabel = await client.v4User.createLabel({ labelName: uniqueName });
        createdLabelId = createdLabel.id;
        expect(createdLabelId).toEqual(expect.any(String));

        await client.v4User.updateLabel({
          labelId: createdLabelId,
          labelName: updatedName,
        });
      } finally {
        if (createdLabelId) {
          await client.v4User.deleteLabel({ labelId: createdLabelId });
        }
      }
    });

    it('creates, updates, and deletes viewer labels with cleanup', async () => {
      const uniqueName = `sdk-it-${Date.now()}`;
      const updatedName = `${uniqueName}-updated`;
      let createdLabelId: string | number | undefined;

      try {
        const createdLabels = await client.v4User.createViewerLabel({ labels: [uniqueName] });
        createdLabelId = createdLabels[0]?.id;
        if (createdLabelId === undefined) {
          throw new Error('V4 viewer label creation did not return an id.');
        }

        await client.v4User.updateViewerLabel({
          id: createdLabelId,
          label: updatedName,
        });
      } finally {
        if (createdLabelId !== undefined) {
          await client.v4User.deleteViewerLabel({ id: createdLabelId });
        }
      }
    });
  });
});
