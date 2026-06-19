import type { AuthConfig } from '../types/auth';
import { createSdkClient } from '../sdk';
import type { ApiServiceConfig } from '../utils/api-command';

export class UserSettingsServiceSdk {
  private readonly client: ReturnType<typeof createSdkClient>;

  constructor(
    private readonly authConfig: AuthConfig,
    private readonly config: ApiServiceConfig
  ) {
    this.client = createSdkClient(this.authConfig, this.config.baseUrl);
  }

  listChildAccounts(params: Record<string, unknown>) {
    return this.client.v4User.listChildAccounts(params as any);
  }

  listChildAccountRoles() {
    return this.client.v4User.listChildAccountRoles();
  }

  createChildAccount(params: Record<string, unknown>) {
    return this.client.v4User.createChildAccount(params as any);
  }

  updateChildAccount(params: Record<string, unknown>) {
    return this.client.v4User.updateChildAccount(params as any);
  }

  deleteChildAccount(params: Record<string, unknown>) {
    return this.client.v4User.deleteChildAccounts(params as any);
  }

  getChildBySale(params: Record<string, unknown>) {
    return this.client.v4User.getBySale(params as any);
  }

  listOrganizations() {
    return this.client.v4User.listOrganizations();
  }

  createOrganization(params: Record<string, unknown>) {
    return this.client.v4User.createOrganization(params as any);
  }

  deleteOrganization(params: Record<string, unknown>) {
    return this.client.v4User.deleteOrganization(params as any);
  }

  getDonateTemplate() {
    return this.client.v4User.getDonateTemplate();
  }

  updateDonateTemplate(params: Record<string, unknown>) {
    return this.client.v4User.updateDonateTemplate(params as any);
  }

  getMarqueeTemplate() {
    return this.client.v4User.getMarqueeTemplate();
  }

  updateMarqueeTemplate(params: Record<string, unknown>) {
    return this.client.v4User.updateMarqueeTemplate(params as any);
  }

  getRoleConfigTemplate() {
    return this.client.v4User.getRoleConfigTemplate();
  }

  updateRoleConfigTemplate(params: Record<string, unknown>) {
    return this.client.v4User.updateRoleConfigTemplate(params as any);
  }

  getPlaybackSetting() {
    return this.client.v4User.getPlaybackSetting();
  }

  updatePlaybackSetting(params: Record<string, unknown>) {
    return this.client.v4User.updatePlaybackSetting(params as any);
  }

  getAudioModerationSetting() {
    return this.client.v4User.getAudioModerationSetting();
  }

  updateAudioModerationSetting(params: Record<string, unknown>) {
    return this.client.v4User.updateAudioModerationSetting(params as any);
  }

  getVideoModerationSetting() {
    return this.client.v4User.getVideoModerationSetting();
  }

  updateVideoModerationSetting(params: Record<string, unknown>) {
    return this.client.v4User.updateVideoModerationSetting(params as any);
  }

  getGlobalFooter() {
    return this.client.v4User.getGlobalFooter();
  }

  updateGlobalFooter(params: Record<string, unknown>) {
    return this.client.v4User.updateGlobalFooter(params as any);
  }

  getPvShowEnable() {
    return this.client.v4User.getPvShowEnable();
  }

  updatePvShowEnable(params: Record<string, unknown>) {
    return this.client.v4User.updatePvShowEnable(params as any);
  }

  sendSms(params: Record<string, unknown>) {
    return this.client.v4User.sendSms(params as any);
  }

  getMicDuration(params: Record<string, unknown>) {
    return this.client.v4User.getMicDuration(params as any);
  }

  getMrConcurrencyDetail() {
    return this.client.v4User.getMrConcurrencyDetail();
  }

  getBillUseDetailList(params: Record<string, unknown>) {
    return this.client.v4User.getBillUseDetailList(params as any);
  }

  getWatchLogList(params: Record<string, unknown>) {
    return this.client.v4User.getWatchLogList(params as any);
  }

  getWatchLogDetail(params: Record<string, unknown>) {
    return this.client.v4User.getWatchLogDetail(params as any);
  }
}
