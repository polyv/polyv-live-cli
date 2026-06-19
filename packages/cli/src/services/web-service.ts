import { readFileSync } from 'fs';
import { Blob } from 'buffer';
import type { AuthConfig } from '../types/auth';
import type { ApiServiceConfig } from '../utils/api-command';
import { createSdkClient } from '../sdk';

export class WebServiceSdk {
  constructor(
    private readonly authConfig: AuthConfig,
    private readonly config: ApiServiceConfig
  ) {}

  async getSplash(channelId: string) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.web.getSplash(channelId);
  }

  async setSplash(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.web.setSplash(params);
  }

  async setPublisher(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.web.setPublisher(params);
  }

  async updateChannelName(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.web.updateChannelName(params);
  }

  async updateChannelLogo(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.web.updateChannelLogo({
      ...params,
      imgfile: this.readFile(params.imgfile),
    });
  }

  async liveLikes(channelIds: string) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.web.liveLikes(channelIds);
  }

  async updateLikes(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.web.updateLikes(params);
  }

  async getCountdown(channelId: string) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.web.getCountdown(channelId);
  }

  async setCountdown(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.web.setCountdown(params);
  }

  async getMenuList(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.web.getMenuList(params);
  }

  async addMenu(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.web.addMenu(params);
  }

  async deleteMenu(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.web.deleteMenu(params);
  }

  async updateMenu(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.web.updateMenu(params);
  }

  async setMenu(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.web.setMenu(params);
  }

  async updateRank(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.web.updateRank(params);
  }

  async updateConsultingEnabled(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.web.updateConsultingEnabled(params);
  }

  async getTuwenList(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.web.getTuwenList(params);
  }

  async getDonate(channelId?: string) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.web.getDonate(channelId);
  }

  async updateCash(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.web.updateCash(params);
  }

  async updateGood(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.web.updateGood(params);
  }

  async getWeixinShare(channelId: string) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.web.getWeixinShare(channelId);
  }

  async updateWeixinShare(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.web.updateWeixinShare(params);
  }

  async updateGlobalEnabled(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.web.updateGlobalEnabled(params);
  }

  async uploadImage(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.web.uploadImage({
      type: params.type,
      files: params.files.map((filePath: string) => this.readFile(filePath)),
    });
  }

  async uploadWhiteList(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.web.uploadWhiteList({
      ...params,
      file: this.readFile(params.file),
    });
  }

  async downloadWhiteList(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.web.downloadWhiteList(params);
  }

  async setAuthType(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.web.setAuthType(params);
  }

  async setExternalAuth(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.web.setExternalAuth(params);
  }

  async setAuthorizedAddress(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.web.setAuthorizedAddress(params);
  }

  async updateAuthUrl(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.web.updateAuthUrl(params);
  }

  async getRecordField(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.web.getRecordField(params);
  }

  async getRecordInfo(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.web.getRecordInfo(params);
  }

  async enrollList(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.web.enrollList(params);
  }

  async downloadRecordInfo(params: any) {
    const client = createSdkClient(this.authConfig, this.config.baseUrl);
    return client.web.downloadRecordInfo(params);
  }

  private readFile(filePath: string) {
    return new Blob([readFileSync(filePath)]) as any;
  }
}
