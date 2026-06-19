import { BaseHandler, OutputFormat } from './base.handler';
import type { AuthConfig } from '../types/auth';
import { PolyVValidationError } from '../utils/errors';
import {
  apiParams,
  compactParams,
  confirmWrite,
  parseStringList,
  type ApiServiceConfig,
} from '../utils/api-command';
import { UserSettingsServiceSdk } from '../services/user.service';

type Options = Record<string, any>;

export class UserSettingsHandler extends BaseHandler {
  private readonly service: UserSettingsServiceSdk;

  constructor(authConfig: AuthConfig, serviceConfig: ApiServiceConfig) {
    super();
    this.service = new UserSettingsServiceSdk(authConfig, serviceConfig);
  }

  async listChildren(options: Options): Promise<void> {
    this.show(await this.service.listChildAccounts(this.pagingParams(options)), options.output);
  }

  async listChildRoles(options: Options): Promise<void> {
    this.show(await this.service.listChildAccountRoles(), options.output);
  }

  async createChild(options: Options): Promise<void> {
    await confirmWrite(options.force, `Create child account ${options.childEmail}?`);
    this.show({
      success: true,
      result: await this.service.createChildAccount(apiParams({
        childEmail: options.childEmail,
        childName: options.childName,
        password: options.password,
        roleId: options.roleId,
        organizationId: options.organizationId,
        telephone: options.telephone,
        description: options.description,
      })),
    }, options.output);
  }

  async updateChild(options: Options): Promise<void> {
    const params = apiParams({
      childEmail: options.childEmail,
      childName: options.childName,
      password: options.password,
      roleId: options.roleId,
      organizationId: options.organizationId,
      telephone: options.telephone,
      description: options.description,
    });
    this.requireNonEmptyUpdate(params, 'child update');
    await confirmWrite(options.force, `Update child account ${options.childEmail}?`);
    await this.service.updateChildAccount(params);
    this.show({ success: true, ...params }, options.output);
  }

  async deleteChild(options: Options): Promise<void> {
    await confirmWrite(options.force, `Delete child account ${options.childEmail}?`);
    await this.service.deleteChildAccount({ childEmail: options.childEmail });
    this.show({ success: true, childEmail: options.childEmail }, options.output);
  }

  async getChildBySale(options: Options): Promise<void> {
    if (!options.saleId && !options.saleCode) {
      throw this.validationError('saleId or saleCode is required', 'sale', options);
    }
    this.show(await this.service.getChildBySale(apiParams({
      saleId: options.saleId,
      saleCode: options.saleCode,
    })), options.output);
  }

  async listOrganizations(options: Options): Promise<void> {
    this.show(await this.service.listOrganizations(), options.output);
  }

  async createOrganization(options: Options): Promise<void> {
    await confirmWrite(options.force, `Create organization ${options.name}?`);
    this.show({
      success: true,
      result: await this.service.createOrganization(apiParams({
        name: options.name,
        parentId: options.parentId,
        description: options.description,
      })),
    }, options.output);
  }

  async deleteOrganization(options: Options): Promise<void> {
    await confirmWrite(options.force, `Delete organization ${options.organizationId}?`);
    await this.service.deleteOrganization({ organizationId: options.organizationId });
    this.show({ success: true, organizationId: options.organizationId }, options.output);
  }

  async getDonateTemplate(options: Options): Promise<void> {
    this.show(await this.service.getDonateTemplate(), options.output);
  }

  async updateDonateTemplate(options: Options): Promise<void> {
    const params = apiParams({
      donateGiftEnabled: options.donateGiftEnabled,
      giftDonate: options.giftDonate,
    });
    await confirmWrite(options.force, 'Update donate template?');
    await this.service.updateDonateTemplate(params);
    this.show({ success: true, ...params }, options.output);
  }

  async getMarqueeTemplate(options: Options): Promise<void> {
    this.show(await this.service.getMarqueeTemplate(), options.output);
  }

  async updateMarqueeTemplate(options: Options): Promise<void> {
    const params = apiParams({
      enable: options.enable,
      antiRecordType: options.antiRecordType,
      modelType: options.modelType,
      content: options.content,
      opacity: options.opacity,
      fontSize: options.fontSize,
      fontColor: options.fontColor,
      showMode: options.showMode,
      doubleEnabled: options.doubleEnabled,
      autoZoomEnabled: options.autoZoomEnabled,
    });
    await confirmWrite(options.force, 'Update marquee template?');
    await this.service.updateMarqueeTemplate(params);
    this.show({ success: true, ...params }, options.output);
  }

  async getRoleConfigTemplate(options: Options): Promise<void> {
    this.show(await this.service.getRoleConfigTemplate(), options.output);
  }

  async updateRoleConfigTemplate(options: Options): Promise<void> {
    this.requireNonEmptyUpdate(options.config, 'role config template');
    await confirmWrite(options.force, 'Update role config template?');
    await this.service.updateRoleConfigTemplate(options.config);
    this.show({ success: true, ...options.config }, options.output);
  }

  async getPlaybackSetting(options: Options): Promise<void> {
    this.show(await this.service.getPlaybackSetting(), options.output);
  }

  async updatePlaybackSetting(options: Options): Promise<void> {
    this.requireNonEmptyUpdate(options.config, 'playback setting');
    await confirmWrite(options.force, 'Update playback setting?');
    await this.service.updatePlaybackSetting(options.config);
    this.show({ success: true, ...options.config }, options.output);
  }

  async getAudioModerationSetting(options: Options): Promise<void> {
    this.show(await this.service.getAudioModerationSetting(), options.output);
  }

  async updateAudioModerationSetting(options: Options): Promise<void> {
    const params = apiParams({
      moderationEnabled: options.moderationEnabled,
      moderationStrategy: options.moderationStrategy,
      badwordEnabled: options.badwordEnabled,
      illegalNotify: options.illegalNotify,
    });
    await confirmWrite(options.force, 'Update audio moderation setting?');
    await this.service.updateAudioModerationSetting(params);
    this.show({ success: true, ...params }, options.output);
  }

  async getVideoModerationSetting(options: Options): Promise<void> {
    this.show(await this.service.getVideoModerationSetting(), options.output);
  }

  async updateVideoModerationSetting(options: Options): Promise<void> {
    const params = apiParams({
      moderationEnabled: options.moderationEnabled,
      moderationStrategy: options.moderationStrategy,
      imageFrequency: options.imageFrequency,
      illegalNotify: options.illegalNotify,
    });
    await confirmWrite(options.force, 'Update video moderation setting?');
    await this.service.updateVideoModerationSetting(params);
    this.show({ success: true, ...params }, options.output);
  }

  async getGlobalFooter(options: Options): Promise<void> {
    this.show(await this.service.getGlobalFooter(), options.output);
  }

  async updateGlobalFooter(options: Options): Promise<void> {
    const params = apiParams({
      showFooterEnabled: options.showFooterEnabled,
      footerText: options.footerText,
      footTextLinkProtocol: options.footTextLinkProtocol,
      footTextLinkUrl: options.footTextLinkUrl,
    });
    this.requireNonEmptyUpdate(params, 'global footer');
    await confirmWrite(options.force, 'Update global footer?');
    await this.service.updateGlobalFooter(params);
    this.show({ success: true, ...params }, options.output);
  }

  async getPvShowEnable(options: Options): Promise<void> {
    this.show(await this.service.getPvShowEnable(), options.output);
  }

  async updatePvShowEnable(options: Options): Promise<void> {
    await confirmWrite(options.force, 'Update PV show setting?');
    await this.service.updatePvShowEnable({ enabled: options.enabled });
    this.show({ success: true, enabled: options.enabled }, options.output);
  }

  async sendSms(options: Options): Promise<void> {
    const phoneNumbers = parseStringList(options.phoneNumbers);
    if (phoneNumbers.length > 200) {
      throw this.validationError('phoneNumbers cannot exceed 200 items', 'phoneNumbers', options.phoneNumbers);
    }
    const templateParamNames = parseStringList(options.templateParamNames);
    const templateParamValues = parseStringList(options.templateParamValues);
    if (templateParamNames.length !== templateParamValues.length) {
      throw this.validationError('templateParamNames and templateParamValues must have the same length', 'templateParamValues', options.templateParamValues);
    }
    const params = { phoneNumbers, templateParamNames, templateParamValues };
    await confirmWrite(options.force, `Send SMS to ${phoneNumbers.length} phone number(s)?`);
    await this.service.sendSms(params);
    this.show({ success: true, ...params }, options.output);
  }

  async getMicDuration(options: Options): Promise<void> {
    this.show(await this.service.getMicDuration(apiParams({
      startTime: options.startTime,
      endTime: options.endTime,
    })), options.output);
  }

  async getMrConcurrencyDetail(options: Options): Promise<void> {
    this.show(await this.service.getMrConcurrencyDetail(), options.output);
  }

  async getBillUseDetailList(options: Options): Promise<void> {
    this.show(await this.service.getBillUseDetailList(this.pagingParams({
      ...options,
      itemCategory: options.itemCategory,
      startDate: options.startDate,
      endDate: options.endDate,
      channelId: options.channelId,
    })), options.output);
  }

  async listWatchLogs(options: Options): Promise<void> {
    this.show(await this.service.getWatchLogList(this.pagingParams(options)), options.output);
  }

  async getWatchLogDetail(options: Options): Promise<void> {
    this.show(await this.service.getWatchLogDetail(this.pagingParams({
      ...options,
      viewerId: options.viewerId,
    })), options.output);
  }

  private pagingParams(options: Options): Record<string, unknown> {
    const { page, size, pageNumber, pageSize, output, force, ...rest } = options;
    void output;
    void force;
    return compactParams({
      ...rest,
      pageNumber: page ?? pageNumber,
      pageSize: size ?? pageSize,
    });
  }

  private requireNonEmptyUpdate(params: Record<string, unknown> | undefined, label: string): void {
    if (!params || Object.keys(params).length === 0) {
      throw this.validationError(`${label} update payload must not be empty`, 'config', params);
    }
  }

  private validationError(message: string, field: string, value: unknown): PolyVValidationError {
    return new PolyVValidationError(message, field, value, 'validation_failed');
  }

  private show(data: unknown, output: OutputFormat = 'table'): void {
    this.displayData(data, output);
  }
}
