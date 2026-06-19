/**
 * Handler for server-side account API CLI operations.
 */

import { BaseHandler, OutputFormat } from './base.handler';
import type { AuthConfig } from '../types/auth';
import type { PlatformServiceConfig } from '../types/platform';
import { PolyVValidationError } from '../utils/errors';
import { confirmDeletion } from '../utils/confirmation';
import { AccountServiceSdk } from '../services/account-service';
import type {
  AccountApiBaseOptions,
  AccountApiCallbackSetOptions,
  AccountApiChannelBasicListOptions,
  AccountApiChannelListOptions,
  AccountApiChannelsOptions,
  AccountApiCategoryCreateOptions,
  AccountApiCategoryDeleteOptions,
  AccountApiCategoryUpdateNameOptions,
  AccountApiCategoryUpdateRankOptions,
  AccountApiIncomeListOptions,
  AccountApiPlaybackListOptions,
  AccountApiReceiveListOptions,
  AccountApiSsoSetOptions,
} from '../types/account-api';

export class AccountApiHandler extends BaseHandler {
  private readonly accountService: AccountServiceSdk;

  constructor(authConfig: AuthConfig, serviceConfig: PlatformServiceConfig) {
    super();
    this.accountService = new AccountServiceSdk(authConfig, serviceConfig);
  }

  async listChannels(options: AccountApiChannelsOptions): Promise<void> {
    return this.show(await this.accountService.channels(this.compact({
      categoryId: options.categoryId,
      keyword: options.keyword,
      labelId: options.labelId,
    }) as any), options);
  }

  async listPlayback(options: AccountApiPlaybackListOptions): Promise<void> {
    return this.show(await this.accountService.userPlaybackList(this.compact({
      page: options.page,
      pageSize: options.pageSize,
      startDate: options.startDate,
      endDate: options.endDate,
      keyword: options.keyword,
    }) as any), options);
  }

  async listChannelBasic(options: AccountApiChannelBasicListOptions): Promise<void> {
    return this.show(await this.accountService.userChannelBasicList(this.compact({
      categoryIds: options.categoryIds,
      page: options.page,
      pageSize: options.pageSize,
      keyword: options.keyword,
    }) as any), options);
  }

  async listSimpleChannels(options: AccountApiChannelListOptions): Promise<void> {
    return this.show(await this.accountService.getSimpleChannelList(this.compact({
      page: options.page,
      pageSize: options.pageSize,
      categoryId: options.categoryId,
      watchStatus: options.watchStatus,
      keyword: options.keyword,
    }) as any), options);
  }

  async listChannelDetails(options: AccountApiChannelListOptions): Promise<void> {
    return this.show(await this.accountService.channelDetailList(this.compact({
      page: options.page,
      pageSize: options.pageSize,
      categoryId: options.categoryId,
      watchStatus: options.watchStatus,
      keyword: options.keyword,
    }) as any), options);
  }

  async getUserDurations(options: AccountApiBaseOptions): Promise<void> {
    return this.show(await this.accountService.getUserDurations(), options);
  }

  async getMicDuration(options: AccountApiBaseOptions): Promise<void> {
    return this.show(await this.accountService.micDuration(), options);
  }

  async listIncome(options: AccountApiIncomeListOptions): Promise<void> {
    this.requireFields(options, ['userId', 'startDate', 'endDate']);
    return this.show(await this.accountService.getIncomeDetail(this.compact({
      userId: options.userId,
      startDate: options.startDate,
      endDate: options.endDate,
      channelId: options.channelId,
      page: options.page,
      pageSize: options.pageSize,
    }) as any), options);
  }

  async listCategories(options: AccountApiBaseOptions): Promise<void> {
    return this.show(await this.accountService.getCategoryList(), options);
  }

  async createCategory(options: AccountApiCategoryCreateOptions): Promise<void> {
    this.requireFields(options, ['name']);
    await this.confirmWrite(options.force, `Create live category "${options.name}"?`);
    const result = await this.accountService.createCategory(options.name);
    return this.show(result, options);
  }

  async deleteCategory(options: AccountApiCategoryDeleteOptions): Promise<void> {
    this.requirePositiveNumber(options.categoryId, 'categoryId');
    await this.confirmWrite(options.force, `Delete live category ${options.categoryId}?`);
    const result = await this.accountService.deleteCategory(options.categoryId);
    return this.show(result, options);
  }

  async updateCategoryName(options: AccountApiCategoryUpdateNameOptions): Promise<void> {
    this.requirePositiveNumber(options.categoryId, 'categoryId');
    this.requireFields(options, ['name']);
    await this.confirmWrite(options.force, `Rename live category ${options.categoryId}?`);
    const result = await this.accountService.updateCategoryName(options.categoryId, options.name);
    return this.show(result, options);
  }

  async updateCategoryRank(options: AccountApiCategoryUpdateRankOptions): Promise<void> {
    this.requirePositiveNumber(options.categoryId, 'categoryId');
    this.requirePositiveNumber(options.rank, 'rank');
    await this.confirmWrite(options.force, `Update rank for live category ${options.categoryId}?`);
    const result = await this.accountService.updateCategoryRank(options.categoryId, options.rank);
    return this.show(result, options);
  }

  async listReceiveChannels(options: AccountApiReceiveListOptions): Promise<void> {
    this.requireFields(options, ['channelId']);
    return this.show(await this.accountService.receiveList(this.compact({
      channelId: options.channelId,
      keyword: options.keyword,
      page: options.page,
      pageSize: options.pageSize,
    }) as any), options);
  }

  async setSsoToken(options: AccountApiSsoSetOptions): Promise<void> {
    this.requireFields(options, ['token']);
    await this.confirmWrite(options.force, options.childEmail ? 'Set child account SSO token?' : 'Set account SSO token?');

    const result = options.childEmail
      ? await this.accountService.setUserChildrenLoginToken({
        childEmail: options.childEmail,
        token: options.token,
      })
      : await this.accountService.setUserLoginToken({ token: options.token });

    return this.show(result, options);
  }

  async setCallback(options: AccountApiCallbackSetOptions): Promise<void> {
    this.requireFields(options, ['type', 'userId']);
    await this.confirmWrite(options.force, `Set ${options.type} callback for user ${options.userId}?`);

    const params = this.compact({ userId: options.userId, url: options.url }) as { userId: string; url?: string };
    const result = options.type === 'stream'
      ? await this.accountService.setStreamCallback(params)
      : options.type === 'record'
        ? await this.accountService.setRecordCallback(params)
        : await this.accountService.setPlaybackCallback(params);

    return this.show(result, options);
  }

  private show(data: unknown, options: AccountApiBaseOptions): void {
    this.displayData(data, (options.output || 'table') as OutputFormat);
  }

  private requireFields(options: object, fields: string[]): void {
    const values = options as Record<string, unknown>;
    const missing = fields.filter((field) => {
      const value = values[field];
      return value === undefined || value === null || value === '';
    });

    if (missing.length > 0) {
      throw this.validationError(`Missing required option(s): ${missing.join(', ')}`, 'options', options);
    }
  }

  private requirePositiveNumber(value: number | undefined, field: string): void {
    if (!Number.isFinite(value) || Number(value) <= 0) {
      throw this.validationError(`${field} must be a positive number`, field, value);
    }
  }

  private compact<T extends Record<string, unknown>>(params: T): Partial<T> {
    return Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined)
    ) as Partial<T>;
  }

  private validationError(message: string, field: string, value: unknown): PolyVValidationError {
    return new PolyVValidationError(message, field, value, 'validation_failed');
  }

  private async confirmWrite(force: boolean | undefined, message: string): Promise<void> {
    if (force) return;
    const confirmed = await confirmDeletion(message);
    if (!confirmed) {
      throw new Error('Operation cancelled.');
    }
  }
}
