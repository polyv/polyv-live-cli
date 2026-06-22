/**
 * @fileoverview Channel service using PolyV Live API SDK
 * @author Development Team
 * @since 3.0.0
 */

import {
  ChannelCreateRequest,
  ChannelModel,
  ChannelServiceConfig,
  ChannelListRequest,
  ChannelListItem,
  ChannelDetailRequest,
  ChannelDetailModel,
  ChannelUpdateRequest,
  ChannelUpdateResponse,
  ChannelDeleteResponse,
  ChannelBatchDeleteRequest,
  ChannelBatchDeleteResponse,
  BasicSetting,
} from '../types/channel';
import { AuthConfig } from '../types/auth';
import { PolyVError, PolyVAPIError, PolyVValidationError } from '../utils/errors';
import { createSdkClient } from '../sdk';

// V4 API 原生场景值（不做映射，直接使用）
// newScene: topclass(大班课) | alone(活动营销) | seminar(研讨会) | train(企业培训) | double(双师课,需开通) | guide(导播,需开通)
// template: ppt(三分屏-横屏) | portrait_ppt(三分屏-竖屏) | alone(纯视频-横屏) | portrait_alone(纯视频-竖屏) | topclass(纯视频极速-横屏) | portrait_topclass(纯视频极速-竖屏) | seminar(研讨会)

/**
 * Channel service for managing PolyV live streaming channels using SDK
 */
export class ChannelServiceSdk {
  private readonly config: ChannelServiceConfig;
  private readonly authConfig: AuthConfig;

  /**
   * Creates a new ChannelServiceSdk instance
   * @param authConfig Authentication configuration
   * @param serviceConfig Service configuration
   */
  constructor(authConfig: AuthConfig, serviceConfig: ChannelServiceConfig) {
    this.authConfig = authConfig;
    this.config = serviceConfig;
  }

  /**
   * Creates a new live streaming channel
   * @param request Channel creation request parameters
   * @returns Promise resolving to the created channel model
   */
  async createChannel(request: ChannelCreateRequest): Promise<ChannelModel> {
    try {
      this.validateCreateRequest(request);

      const client = createSdkClient(this.authConfig, this.config.baseUrl);

      // 直接使用 V4 API 原生值，默认 topclass/ppt
      const createParams: any = {
        name: request.name,
        newScene: request.newScene || 'topclass',
        template: request.template || 'ppt',
        channelPasswd: request.channelPasswd,
        linkMicLimit: request.linkMicLimit,
        startTime: request.startTime,
        endTime: request.endTime,
      };

      const result = await client.v4Channel.create(createParams);

      return {
        channelId: String(result.channelId),
        name: request.name,
        userId: result.userId || this.authConfig.userId || '',
        channelPasswd: request.channelPasswd || '',
        newScene: request.newScene,
        template: request.template,
        status: 'waiting',
        createdAt: new Date(),
      };
    } catch (error) {
      throw this.handleError(error, 'createChannel');
    }
  }

  /**
   * Lists live streaming channels with pagination
   * @param request Channel list request parameters
   * @returns Promise resolving to array of channel list items
   */
  async listChannels(request: ChannelListRequest = {}): Promise<ChannelListItem[]> {
    try {
      this.validateListRequest(request);

      const client = createSdkClient(this.authConfig, this.config.baseUrl);

      const pageNumber = request.page ?? 1;
      const pageSize = request.limit ?? 20;

      // Use v4 channel detail list
      const result = await client.v4Channel.channelDetailList({
        pageNumber,
        pageSize,
      });

      if (!result?.contents || result.contents.length === 0) {
        return [];
      }

      // Filter by keyword if provided (client-side filtering)
      let channels = result.contents;
      if (request.keyword) {
        channels = channels.filter((ch) =>
          ch.name?.toLowerCase().includes(request.keyword!.toLowerCase())
        );
      }

      return channels.map((channel) => ({
        channelId: String(channel.channelId),
        name: channel.name,
        status: this.mapWatchStatus(channel.watchStatus),
        createdAt: new Date(channel.startTime || Date.now()),
        scene: channel.newScene || channel.scene,
        template: channel.template,
        description: '',
        ...(channel.maxViewer && channel.maxViewer > 0 && { maxViewers: channel.maxViewer }),
      }));
    } catch (error) {
      throw this.handleError(error, 'listChannels');
    }
  }

  /**
   * Gets detailed information for a specific channel
   * @param request Channel detail request parameters
   * @returns Promise resolving to the channel detail model
   */
  async getChannelDetail(request: ChannelDetailRequest): Promise<ChannelDetailModel> {
    try {
      this.validateChannelDetailRequest(request);

      const client = createSdkClient(this.authConfig, this.config.baseUrl);

      // Use v4 channel get
      const result = await client.v4Channel.getChannel({
        channelId: request.channelId,
      });

      return result as unknown as ChannelDetailModel;
    } catch (error) {
      throw this.handleError(error, 'getChannelDetail');
    }
  }

  /**
   * Updates channel basic settings and authentication settings
   * @param request Channel update request parameters
   * @returns Promise resolving to the update response
   */
  async updateChannel(request: ChannelUpdateRequest): Promise<ChannelUpdateResponse> {
    try {
      this.validateChannelUpdateRequest(request);

      const client = createSdkClient(this.authConfig, this.config.baseUrl);

      // Map basicSetting to SDK format
      if (request.basicSetting) {
        await client.channel.updateChannel(
          request.channelId,
          this.mapBasicSetting(request.basicSetting)
        );
      }

      return {
        code: 200,
        status: 'success',
        success: true,
        data: null,
      };
    } catch (error) {
      throw this.handleError(error, 'updateChannel');
    }
  }

  /**
   * Deletes a single live streaming channel
   * @param channelId Channel ID to delete
   * @returns Promise resolving to the delete response
   */
  async deleteChannel(channelId: string): Promise<ChannelDeleteResponse> {
    try {
      this.validateChannelId(channelId);

      const client = createSdkClient(this.authConfig, this.config.baseUrl);

      // Use v3 batch delete with single channel
      await client.channel.batchDeleteChannels([channelId]);

      return {
        code: 200,
        status: 'success',
        data: true as unknown as string,
      };
    } catch (error) {
      throw this.handleError(error, 'deleteChannel');
    }
  }

  /**
   * Batch deletes multiple live streaming channels
   * @param request Channel batch delete request parameters
   * @returns Promise resolving to the delete response
   */
  async batchDeleteChannels(request: ChannelBatchDeleteRequest): Promise<ChannelBatchDeleteResponse> {
    try {
      this.validateBatchDeleteRequest(request);

      const client = createSdkClient(this.authConfig, this.config.baseUrl);

      await client.channel.batchDeleteChannels(request.channelIds);

      return {
        code: 200,
        status: 'success',
        data: true as unknown as string,
      };
    } catch (error) {
      throw this.handleError(error, 'batchDeleteChannels');
    }
  }

  async checkChannelStatusValid(params: any): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.other.checkChannelStatusValid(params);
    } catch (error) {
      throw this.handleError(error, 'checkChannelStatusValid');
    }
  }

  async resetCcbFocus(params: any): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.other.resetCcbFocus(params);
    } catch (error) {
      throw this.handleError(error, 'resetCcbFocus');
    }
  }

  async listChannelViewerGroups(params: any): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.listChannelViewerGroups(params);
    } catch (error) {
      throw this.handleError(error, 'listChannelViewerGroups');
    }
  }

  async createChannelViewerGroup(params: any): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.createChannelViewerGroup(params);
    } catch (error) {
      throw this.handleError(error, 'createChannelViewerGroup');
    }
  }

  async updateChannelViewerGroup(params: any): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.updateChannelViewerGroup(params);
    } catch (error) {
      throw this.handleError(error, 'updateChannelViewerGroup');
    }
  }

  async deleteChannelViewerGroup(params: any): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.deleteChannelViewerGroup(params);
    } catch (error) {
      throw this.handleError(error, 'deleteChannelViewerGroup');
    }
  }

  async getChannelViewerGroupSetting(params: any): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.getChannelViewerGroupSetting(params);
    } catch (error) {
      throw this.handleError(error, 'getChannelViewerGroupSetting');
    }
  }

  async updateChannelViewerGroupSetting(params: any): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.updateChannelViewerGroupSetting(params);
    } catch (error) {
      throw this.handleError(error, 'updateChannelViewerGroupSetting');
    }
  }

  async listChannelViewers(params: any): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.listChannelViewers(params);
    } catch (error) {
      throw this.handleError(error, 'listChannelViewers');
    }
  }

  async exportChannelViewers(params: any): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.exportChannelViewers(params);
    } catch (error) {
      throw this.handleError(error, 'exportChannelViewers');
    }
  }

  async addChannelViewers(params: any): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.addChannelViewers(params);
    } catch (error) {
      throw this.handleError(error, 'addChannelViewers');
    }
  }

  async deleteChannelViewers(params: any): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.deleteChannelViewers(params);
    } catch (error) {
      throw this.handleError(error, 'deleteChannelViewers');
    }
  }

  async transferChannelViewers(params: any): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.transferChannelViewers(params);
    } catch (error) {
      throw this.handleError(error, 'transferChannelViewers');
    }
  }

  async importChannelViewers(params: any): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.importChannelViewers(params);
    } catch (error) {
      throw this.handleError(error, 'importChannelViewers');
    }
  }

  async listUnrelatedChannelViewers(params: any): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.listUnrelatedChannelViewers(params);
    } catch (error) {
      throw this.handleError(error, 'listUnrelatedChannelViewers');
    }
  }

  async getAccount(channelId: string, account: string): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.getAccount(channelId, account);
    } catch (error) {
      throw this.handleError(error, 'getAccount');
    }
  }

  async getAccounts(channelId: string): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.getAccounts(channelId);
    } catch (error) {
      throw this.handleError(error, 'getAccounts');
    }
  }

  async deleteAccount(channelId: string, account: string): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.deleteAccount(channelId, account);
    } catch (error) {
      throw this.handleError(error, 'deleteAccount');
    }
  }

  async batchCreateAccounts(channelId: string, accounts: any[]): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.batchCreateAccounts(channelId, accounts);
    } catch (error) {
      throw this.handleError(error, 'batchCreateAccounts');
    }
  }

  async getChannelAdverts(channelId: string): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.getChannelAdverts(channelId);
    } catch (error) {
      throw this.handleError(error, 'getChannelAdverts');
    }
  }

  async getCallbackSetting(channelId: string): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.getCallbackSetting(channelId);
    } catch (error) {
      throw this.handleError(error, 'getCallbackSetting');
    }
  }

  async updateCallbackSetting(channelId: string, options: any): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.updateCallbackSetting(channelId, options);
    } catch (error) {
      throw this.handleError(error, 'updateCallbackSetting');
    }
  }

  async getPptRecordSetting(channelId: string): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.getPptRecordSetting(channelId);
    } catch (error) {
      throw this.handleError(error, 'getPptRecordSetting');
    }
  }

  async listPptRecordTasks(params: any): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.listPptRecordTasks(params);
    } catch (error) {
      throw this.handleError(error, 'listPptRecordTasks');
    }
  }

  async addPptRecordTask(params: any): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.addPptRecordTask(params);
    } catch (error) {
      throw this.handleError(error, 'addPptRecordTask');
    }
  }

  async updatePptRecordSetting(params: any): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.updatePptRecordSetting(params);
    } catch (error) {
      throw this.handleError(error, 'updatePptRecordSetting');
    }
  }

  async deletePptRecord(params: any): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.deletePptRecord(params);
    } catch (error) {
      throw this.handleError(error, 'deletePptRecord');
    }
  }

  async copyChannel(channelId: string, options: any): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.copyChannel(channelId, options);
    } catch (error) {
      throw this.handleError(error, 'copyChannel');
    }
  }

  async getUserChildrenChannels(params: any): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.getUserChildrenChannels(params);
    } catch (error) {
      throw this.handleError(error, 'getUserChildrenChannels');
    }
  }

  async getWatchApiToken(params: any): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.getWatchApiToken(params);
    } catch (error) {
      throw this.handleError(error, 'getWatchApiToken');
    }
  }

  async getApiToken(params: any): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.getApiToken(params);
    } catch (error) {
      throw this.handleError(error, 'getApiToken');
    }
  }

  async getTokenLoginUrl(params: any): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.getTokenLoginUrl(params);
    } catch (error) {
      throw this.handleError(error, 'getTokenLoginUrl');
    }
  }

  async getChatToken(params: any): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.getChatToken(params);
    } catch (error) {
      throw this.handleError(error, 'getChatToken');
    }
  }

  async listChannelsFollow(params: any): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.listChannelsFollow(params);
    } catch (error) {
      throw this.handleError(error, 'listChannelsFollow');
    }
  }

  async updateChannelsFollow(params: any): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.updateChannelsFollow(params);
    } catch (error) {
      throw this.handleError(error, 'updateChannelsFollow');
    }
  }

  async batchAddSubmeeting(params: any): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.batchAddSubmeeting(params);
    } catch (error) {
      throw this.handleError(error, 'batchAddSubmeeting');
    }
  }

  async channelsStopQuestionnaire(params: any): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.channelsStopQuestionnaire(params);
    } catch (error) {
      throw this.handleError(error, 'channelsStopQuestionnaire');
    }
  }

  async batchUpdateDanmu(params: any): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.batchUpdateDanmu(params);
    } catch (error) {
      throw this.handleError(error, 'batchUpdateDanmu');
    }
  }

  async setChannelToken(params: any): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.setChannelToken(params);
    } catch (error) {
      throw this.handleError(error, 'setChannelToken');
    }
  }

  async setAccountToken(params: any): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.setAccountToken(params);
    } catch (error) {
      throw this.handleError(error, 'setAccountToken');
    }
  }

  async setMaxViewer(channelId: string, userId: string, maxViewer: number): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.setMaxViewer(channelId, userId, maxViewer);
    } catch (error) {
      throw this.handleError(error, 'setMaxViewer');
    }
  }

  async updateChannelPassword(userId: string, passwd: string, channelId?: string): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.updateChannelPassword(userId, passwd, channelId);
    } catch (error) {
      throw this.handleError(error, 'updateChannelPassword');
    }
  }

  async setDiyUrlMarquee(params: any): Promise<any> {
    try {
      const client = createSdkClient(this.authConfig, this.config.baseUrl);
      return await client.channel.setDiyUrlMarquee(params);
    } catch (error) {
      throw this.handleError(error, 'setDiyUrlMarquee');
    }
  }

  async listAllChannelBasic(params: any = {}): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Channel.listAllChannelBasic(params);
  }

  async listChannelSimple(params: any = {}): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Channel.listChannelSimple(params);
  }

  async listLiveStatus(params: any): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Channel.listLiveStatus(params);
  }

  async getAccountViewerConfig(params: any): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Channel.getAccountViewerConfig(params);
  }

  async updateAccountViewerConfig(params: any): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Channel.updateAccountViewerConfig(params);
  }

  async getByRole(params: any): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Channel.getByRole(params);
  }

  async updateByRole(params: any): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Channel.updateByRole(params);
  }

  async createAccount(params: any): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Channel.createAccount(params);
  }

  async updateAccountInfo(params: any): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Channel.updateAccountInfo(params);
  }

  async deleteAccountsBatch(params: any): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Channel.deleteAccountsBatch(params);
  }

  async teacherList(params: any): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Channel.teacherList(params);
  }

  async getSubtitleConfig(params: any): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Channel.getSubtitleConfig(params);
  }

  async updateSubtitleConfig(params: any): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Channel.updateSubtitleConfig(params);
  }

  async listSubtitleLanguages(): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Channel.listSubtitleLanguages();
  }

  async distributeList(params: any): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Channel.distributeList(params);
  }

  async distributeCreateBatch(params: any): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Channel.distributeCreateBatch(params);
  }

  async distributeUpdateBatch(params: any): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Channel.distributeUpdateBatch(params);
  }

  async distributeDeleteBatch(params: any): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Channel.distributeDeleteBatch(params);
  }

  async getDistributeStatistic(params: any): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Channel.getDistributeStatistic(params);
  }

  async updateMasterSwitch(params: any): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Channel.updateMasterSwitch(params);
  }

  async updateSwitch(params: any): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Channel.updateSwitch(params);
  }

  async createInit(params: any): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Channel.createInit(params);
  }

  async createMrChannel(params: any): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Channel.createMrChannel(params);
  }

  async setPullBitrate(params: any): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Channel.setPullBitrate(params);
  }

  async updateTemplate(params: any): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Channel.updateTemplate(params);
  }

  async getChannelApiAccessToken(params: any): Promise<any> {
    const { channelId, ...options } = params;
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.channel.getChannelApiAccessToken(channelId, this.compactOptions(options));
  }

  async getTestModeToken(params: any): Promise<any> {
    const { channelId, ...options } = params;
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.channel.getTestModeToken(channelId, this.compactOptions(options));
  }

  async createBatch(params: any): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Channel.createBatch(params);
  }

  async updateV4(params: any): Promise<any> {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.v4Channel.update(params);
  }

  // ===== Validation Methods =====

  private validateCreateRequest(request: ChannelCreateRequest): void {
    const errors: string[] = [];

    if (!request.name || typeof request.name !== 'string') {
      errors.push('Channel name is required and must be a string');
    } else if (request.name.length === 0) {
      errors.push('Channel name cannot be empty');
    } else if (request.name.length > 100) {
      errors.push('Channel name cannot exceed 100 characters');
    }

    if (!request.newScene || !['topclass', 'alone', 'seminar', 'train', 'double', 'guide'].includes(request.newScene)) {
      errors.push('newScene must be one of: topclass, alone, seminar, train, double, guide');
    }

    if (!request.template || !['ppt', 'portrait_ppt', 'alone', 'portrait_alone', 'topclass', 'portrait_topclass', 'seminar'].includes(request.template)) {
      errors.push('template must be one of: ppt, portrait_ppt, alone, portrait_alone, topclass, portrait_topclass, seminar');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Channel creation request validation failed: ${errors.join(', ')}`,
        'request',
        request,
        'validation_failed'
      );
    }
  }

  private validateListRequest(request: ChannelListRequest): void {
    const errors: string[] = [];

    if (request.page !== undefined && (typeof request.page !== 'number' || request.page < 1)) {
      errors.push('page must be a positive integer (minimum 1)');
    }

    if (request.limit !== undefined && (typeof request.limit !== 'number' || request.limit < 1 || request.limit > 100)) {
      errors.push('limit must be an integer between 1 and 100');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Channel list request validation failed: ${errors.join(', ')}`,
        'request',
        request,
        'validation_failed'
      );
    }
  }

  private validateChannelDetailRequest(request: ChannelDetailRequest): void {
    if (!request.channelId || typeof request.channelId !== 'string') {
      throw new PolyVValidationError(
        'channelId is required and must be a string',
        'channelId',
        request,
        'validation_failed'
      );
    }
  }

  private validateChannelUpdateRequest(request: ChannelUpdateRequest): void {
    const errors: string[] = [];

    if (!request.channelId || typeof request.channelId !== 'string') {
      errors.push('channelId is required and must be a string');
    }

    if (!request.basicSetting && !request.authSettings) {
      errors.push('at least one update field must be provided');
    }

    if (errors.length > 0) {
      throw new PolyVValidationError(
        `Channel update request validation failed: ${errors.join(', ')}`,
        'request',
        request,
        'validation_failed'
      );
    }
  }

  private validateChannelId(channelId: string): void {
    if (!channelId || typeof channelId !== 'string') {
      throw new PolyVValidationError(
        'channelId is required and must be a string',
        'channelId',
        channelId,
        'validation_failed'
      );
    }
  }

  private validateBatchDeleteRequest(request: ChannelBatchDeleteRequest): void {
    if (!request.channelIds || !Array.isArray(request.channelIds) || request.channelIds.length === 0) {
      throw new PolyVValidationError(
        'channelIds is required and must be a non-empty array',
        'channelIds',
        request,
        'validation_failed'
      );
    }
  }

  // ===== Helper Methods =====

  private mapWatchStatus(status: string): 'waiting' | 'live' | 'end' | 'unStart' {
    const statusMap: Record<string, 'waiting' | 'live' | 'end' | 'unStart'> = {
      'waiting': 'waiting',
      'living': 'live',
      'live': 'live',
      'end': 'end',
      'ended': 'end',
      'unStart': 'unStart',
    };
    return statusMap[status] || 'waiting';
  }

  private mapBasicSetting(setting: BasicSetting): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    if ('name' in setting && setting.name !== undefined) result['name'] = setting['name'];
    if ('channelPasswd' in setting && setting['channelPasswd'] !== undefined) result['channelPasswd'] = setting['channelPasswd'];
    if ('publisher' in setting && setting['publisher'] !== undefined) result['publisher'] = setting['publisher'];
    if ('desc' in setting && setting['desc'] !== undefined) result['desc'] = setting['desc'];
    if ('startTime' in setting && setting['startTime'] !== undefined) result['startTime'] = setting['startTime'];
    if ('endTime' in setting && setting['endTime'] !== undefined) result['endTime'] = setting['endTime'];
    if ('pageView' in setting && setting['pageView'] !== undefined) result['pageView'] = setting['pageView'];
    if ('likes' in setting && setting['likes'] !== undefined) result['likes'] = setting['likes'];
    if ('coverImg' in setting && setting['coverImg'] !== undefined) result['coverImg'] = setting['coverImg'];
    if ('splashImg' in setting && setting['splashImg'] !== undefined) result['splashImg'] = setting['splashImg'];
    if ('maxViewer' in setting && setting['maxViewer'] !== undefined) result['maxViewer'] = setting['maxViewer'];
    if ('maxViewerRestrict' in setting && setting['maxViewerRestrict'] !== undefined) result['maxViewerRestrict'] = setting['maxViewerRestrict'];

    return result;
  }

  private compactOptions<T extends Record<string, unknown>>(params: T): Partial<T> {
    return Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
    ) as Partial<T>;
  }

  private handleError(error: unknown, operation: string): Error {
    if (this.config.debug) {
      console.error(`[ChannelServiceSdk] Error in ${operation}:`, error);
    }

    if (error instanceof PolyVError || error instanceof PolyVAPIError || error instanceof PolyVValidationError) {
      return error;
    }

    if (error instanceof Error) {
      // Check if it's an SDK API error
      const anyError = error as any;
      if (anyError.polyvCode || anyError.code) {
        return new PolyVAPIError(
          error.message,
          anyError.code || 'API_ERROR',
          anyError.status || 500,
          {
            polyvCode: anyError.polyvCode,
            polyvMessage: anyError.polyvMessage || error.message,
          }
        );
      }

      return new PolyVError(
        `Failed to ${operation}: ${error.message}`,
        'CHANNEL_SERVICE_ERROR',
        500,
        { originalError: error.message }
      );
    }

    return new PolyVError(
      `Failed to ${operation}: Unknown error`,
      'UNKNOWN_ERROR',
      500,
      { originalError: String(error) }
    );
  }
}
