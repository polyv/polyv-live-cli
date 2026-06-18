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
  });
});
