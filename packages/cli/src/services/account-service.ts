/**
 * Server-side account API service using the PolyV Live API SDK.
 */

import type { AuthConfig } from '../types/auth';
import type { PlatformServiceConfig } from '../types/platform';
import { createSdkClient } from '../sdk';
import type {
  ChannelDetailListParams,
  ChannelsParams,
  GetIncomeDetailParams,
  GetSimpleChannelListParams,
  ReceiveListParams,
  SetPlaybackCallbackParams,
  SetRecordCallbackParams,
  SetStreamCallbackParams,
  SetUserChildrenLoginTokenParams,
  SetUserLoginTokenParams,
  UserChannelBasicListParams,
  UserPlaybackListParams,
} from 'polyv-live-api-sdk';

export class AccountServiceSdk {
  constructor(
    private readonly authConfig: AuthConfig,
    private readonly config: PlatformServiceConfig
  ) {}

  async channels(params: ChannelsParams = {}) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.account.channels(params);
  }

  async userPlaybackList(params: UserPlaybackListParams = {}) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.account.userPlaybackList(params);
  }

  async userChannelBasicList(params: UserChannelBasicListParams = {}) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.account.userChannelBasicList(params);
  }

  async getSimpleChannelList(params: GetSimpleChannelListParams = {}) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.account.getSimpleChannelList(params);
  }

  async channelDetailList(params: ChannelDetailListParams = {}) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.account.channelDetailList(params);
  }

  async getUserDurations() {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.account.getUserDurations();
  }

  async micDuration() {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.account.micDuration();
  }

  async getIncomeDetail(params: GetIncomeDetailParams) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.account.getIncomeDetail(params);
  }

  async getCategoryList() {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.account.getCategoryList();
  }

  async createCategory(categoryName: string) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.account.createCategory({ categoryName });
  }

  async receiveList(params: ReceiveListParams) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.account.receiveList(params);
  }

  async deleteCategory(categoryId: number) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.account.deleteCategory({ categoryId });
  }

  async updateCategoryName(categoryId: number, categoryName: string) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.account.updateCategoryName({ categoryId, categoryName });
  }

  async updateCategoryRank(categoryId: number, afterCategoryId: number) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.account.updateCategoryRank({ categoryId, afterCategoryId });
  }

  async setUserLoginToken(params: SetUserLoginTokenParams) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.account.setUserLoginToken(params);
  }

  async setUserChildrenLoginToken(params: SetUserChildrenLoginTokenParams) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.account.setUserChildrenLoginToken(params);
  }

  async setStreamCallback(params: SetStreamCallbackParams) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.account.setStreamCallback(params);
  }

  async setRecordCallback(params: SetRecordCallbackParams) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.account.setRecordCallback(params);
  }

  async setPlaybackCallback(params: SetPlaybackCallbackParams) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.account.setPlaybackCallback(params);
  }
}
