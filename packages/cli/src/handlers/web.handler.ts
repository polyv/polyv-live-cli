import { writeFileSync } from 'fs';
import { BaseHandler, OutputFormat } from './base.handler';
import type { AuthConfig } from '../types/auth';
import { PolyVValidationError } from '../utils/errors';
import { apiParams, confirmWrite, type ApiServiceConfig } from '../utils/api-command';
import { WebServiceSdk } from '../services/web-service';

export class WebHandler extends BaseHandler {
  private readonly service: WebServiceSdk;

  constructor(authConfig: AuthConfig, serviceConfig: ApiServiceConfig) {
    super();
    this.service = new WebServiceSdk(authConfig, serviceConfig);
  }

  async getSplash(options: any): Promise<void> {
    this.requireFields(options, ['channelId']);
    this.show(await this.service.getSplash(options.channelId), options.output);
  }

  async setSplash(options: any): Promise<void> {
    this.requireFields(options, ['channelId', 'splashEnabled']);
    await this.confirm(options, `Update splash settings for channel ${options.channelId}?`);
    this.show({ success: true, result: await this.service.setSplash(apiParams(options)) }, options.output);
  }

  async setPublisher(options: any): Promise<void> {
    this.requireFields(options, ['userId', 'publisher']);
    await this.confirm(options, `Update publisher for ${options.channelId || 'all channels'}?`);
    this.show({ success: true, result: await this.service.setPublisher(apiParams(options)) }, options.output);
  }

  async updateChannelName(options: any): Promise<void> {
    this.requireFields(options, ['channelId', 'name']);
    await this.confirm(options, `Update channel name for ${options.channelId}?`);
    this.show({ success: await this.service.updateChannelName(apiParams(options)), channelId: options.channelId }, options.output);
  }

  async updateChannelLogo(options: any): Promise<void> {
    this.requireFields(options, ['channelId', 'imgfile']);
    await this.confirm(options, `Update channel logo for ${options.channelId}?`);
    this.show({ success: true, result: await this.service.updateChannelLogo(apiParams(options)) }, options.output);
  }

  async getLikes(options: any): Promise<void> {
    this.requireFields(options, ['channelIds']);
    this.show(await this.service.liveLikes(options.channelIds), options.output);
  }

  async updateLikes(options: any): Promise<void> {
    this.requireFields(options, ['channelId']);
    await this.confirm(options, `Update likes/viewers for channel ${options.channelId}?`);
    this.show({ success: true, result: await this.service.updateLikes(apiParams(options)) }, options.output);
  }

  async getCountdown(options: any): Promise<void> {
    this.requireFields(options, ['channelId']);
    this.show(await this.service.getCountdown(options.channelId), options.output);
  }

  async setCountdown(options: any): Promise<void> {
    this.requireFields(options, ['channelId']);
    await this.confirm(options, `Update countdown settings for channel ${options.channelId}?`);
    this.show({ success: true, result: await this.service.setCountdown(apiParams(options)) }, options.output);
  }

  async listMenus(options: any): Promise<void> {
    this.requireFields(options, ['channelId']);
    this.show(await this.service.getMenuList(apiParams(options)), options.output);
  }

  async addMenu(options: any): Promise<void> {
    this.requireFields(options, ['channelId', 'name', 'type']);
    await this.confirm(options, `Add menu ${options.name} to channel ${options.channelId}?`);
    this.show(await this.service.addMenu(apiParams(options)), options.output);
  }

  async deleteMenu(options: any): Promise<void> {
    this.requireFields(options, ['menuIds']);
    await this.confirm(options, `Delete menu(s) ${options.menuIds}?`);
    this.show({ success: true, result: await this.service.deleteMenu(apiParams(options)) }, options.output);
  }

  async updateMenu(options: any): Promise<void> {
    this.requireFields(options, ['menuId', 'channelId', 'content']);
    await this.confirm(options, `Update menu ${options.menuId}?`);
    this.show({ success: true, result: await this.service.updateMenu(apiParams(options)) }, options.output);
  }

  async setMenu(options: any): Promise<void> {
    this.requireFields(options, ['userId', 'channelId', 'content']);
    await this.confirm(options, `Update live intro menu for channel ${options.channelId}?`);
    this.show({ success: true, result: await this.service.setMenu(apiParams({ ...options, menuType: 'desc' })) }, options.output);
  }

  async updateRank(options: any): Promise<void> {
    this.requireFields(options, ['channelId', 'menuIds']);
    await this.confirm(options, `Update menu rank for channel ${options.channelId}?`);
    this.show({ success: true, result: await this.service.updateRank(apiParams(options)) }, options.output);
  }

  async updateConsultingEnabled(options: any): Promise<void> {
    this.requireFields(options, ['channelId', 'enabled']);
    await this.confirm(options, `Update consulting switch for channel ${options.channelId}?`);
    this.show({ success: true, result: await this.service.updateConsultingEnabled(apiParams(options)) }, options.output);
  }

  async listTuwen(options: any): Promise<void> {
    this.requireFields(options, ['channelId']);
    this.show(await this.service.getTuwenList(apiParams(options)), options.output);
  }

  async getDonate(options: any): Promise<void> {
    this.show(await this.service.getDonate(options.channelId), options.output);
  }

  async updateCash(options: any): Promise<void> {
    this.requireFields(options, ['cashes', 'cashMin']);
    await this.confirm(options, `Update cash donate settings for ${options.channelId || 'global settings'}?`);
    this.show({ success: true, result: await this.service.updateCash(apiParams(options)) }, options.output);
  }

  async updateGood(options: any): Promise<void> {
    this.requireFields(options, ['goods']);
    await this.confirm(options, `Update gift donate settings for ${options.channelId || 'global settings'}?`);
    this.show({ success: true, result: await this.service.updateGood(apiParams(options)) }, options.output);
  }

  async getWeixinShare(options: any): Promise<void> {
    this.requireFields(options, ['channelId']);
    this.show(await this.service.getWeixinShare(options.channelId), options.output);
  }

  async updateWeixinShare(options: any): Promise<void> {
    this.requireFields(options, ['channelId']);
    await this.confirm(options, `Update WeChat share settings for channel ${options.channelId}?`);
    this.show({ success: true, result: await this.service.updateWeixinShare(apiParams(options)) }, options.output);
  }

  async updateGlobalEnabled(options: any): Promise<void> {
    this.requireFields(options, ['channelId', 'globalEnabledType', 'enabled']);
    await this.confirm(options, `Update ${options.globalEnabledType} global-enabled for channel ${options.channelId}?`);
    this.show({ success: true, result: await this.service.updateGlobalEnabled(apiParams(options)) }, options.output);
  }

  async uploadImage(options: any): Promise<void> {
    this.requireFields(options, ['type', 'files']);
    await this.confirm(options, `Upload ${options.files.length} image file(s)?`);
    this.show(await this.service.uploadImage(apiParams(options)), options.output);
  }

  async uploadWhiteList(options: any): Promise<void> {
    this.requireFields(options, ['rank', 'file']);
    await this.confirm(options, `Upload whitelist file for rank ${options.rank}?`);
    this.show({ success: true, result: await this.service.uploadWhiteList(apiParams(options)) }, options.output);
  }

  async downloadWhiteList(options: any): Promise<void> {
    this.requireFields(options, ['rank']);
    await this.downloadResult(await this.service.downloadWhiteList(apiParams(options)), options);
  }

  async setAuthType(options: any): Promise<void> {
    this.requireFields(options, ['channelId', 'authType']);
    await this.confirm(options, `Update auth type for channel ${options.channelId}?`);
    this.show({ success: true, result: await this.service.setAuthType(apiParams(options)) }, options.output);
  }

  async setExternalAuth(options: any): Promise<void> {
    this.requireFields(options, ['userId', 'externalUri']);
    await this.confirm(options, `Update external auth for ${options.channelId || 'all channels'}?`);
    this.show(await this.service.setExternalAuth(apiParams(options)), options.output);
  }

  async setAuthorizedAddress(options: any): Promise<void> {
    this.requireFields(options, ['userId', 'customUri']);
    await this.confirm(options, `Update custom authorized address for ${options.channelId || 'all channels'}?`);
    this.show(await this.service.setAuthorizedAddress(apiParams(options)), options.output);
  }

  async updateAuthUrl(options: any): Promise<void> {
    await this.confirm(options, `Update restrict auth URL for ${options.channelId || 'global settings'}?`);
    this.show({ success: true, result: await this.service.updateAuthUrl(apiParams(options)) }, options.output);
  }

  async getRecordField(options: any): Promise<void> {
    this.requireFields(options, ['channelId']);
    this.show(await this.service.getRecordField(apiParams(options)), options.output);
  }

  async listRecordInfo(options: any): Promise<void> {
    this.requireFields(options, ['channelId']);
    this.show(await this.service.getRecordInfo(apiParams(options)), options.output);
  }

  async listEnroll(options: any): Promise<void> {
    this.requireFields(options, ['channelId']);
    this.show(await this.service.enrollList(apiParams(options)), options.output);
  }

  async downloadRecordInfo(options: any): Promise<void> {
    this.requireFields(options, ['channelId']);
    await this.downloadResult(await this.service.downloadRecordInfo(apiParams(options)), options);
  }

  private async confirm(options: any, message: string): Promise<void> {
    await confirmWrite(options.force, message);
  }

  private async downloadResult(data: ArrayBuffer, options: any): Promise<void> {
    const buffer = Buffer.from(data);
    if (options.outputFile) {
      writeFileSync(options.outputFile, buffer);
    }
    this.show({ success: true, bytes: buffer.byteLength, outputFile: options.outputFile }, options.output);
  }

  private show(data: unknown, output: OutputFormat = 'table'): void {
    this.displayData(data, output);
  }

  private requireFields(options: Record<string, unknown>, fields: string[]): void {
    const missing = fields.filter((field) => {
      const value = options[field];
      return value === undefined || value === null || value === '';
    });
    if (missing.length > 0) {
      throw new PolyVValidationError(
        `Missing required option(s): ${missing.join(', ')}`,
        'options',
        options,
        'validation_failed'
      );
    }
  }
}
