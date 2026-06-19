/**
 * @fileoverview AI video production service SDK wrapper
 */

import {
  PolyVClient,
  VideoProduceStatus,
  type AsyncUploadVideoProducePptParams,
  type BatchCreateVideoProducesItem,
  type DeleteVideoProduceParams,
  type ListVideoProducesParams,
  type UploadVideoProducePptParams,
} from 'polyv-live-api-sdk';
import { AuthConfig } from '../types/auth';
import {
  AIVideoProduceCreateResponse,
  AIVideoProducePpt,
  AIVideoProducePptAsyncUploadResponse,
  AIVideoProducePptListResponse,
  AIVideoProducePptUploadResponse,
  AIVideoProduceServiceConfig,
  AIVideoProduceTask,
  AIVideoProduceTaskListResponse,
  AIVideoProduceTtsVoice,
} from '../types/ai-video-produce';

export interface ListVideoProducesServiceParams {
  pageNumber?: number;
  pageSize?: number;
  videoName?: string;
  status?: number;
  createTimeStart?: number;
  createTimeEnd?: number;
  tags?: string[];
}

/**
 * SDK wrapper for AI video production operations.
 */
export class AIVideoProduceServiceSdk {
  private readonly client: PolyVClient;
  private readonly v4Ai: PolyVClient['v4Ai'];

  constructor(authConfig: AuthConfig, config?: AIVideoProduceServiceConfig) {
    this.client = new PolyVClient({
      appId: authConfig.appId,
      appSecret: authConfig.appSecret,
      baseUrl: config?.baseUrl || 'https://api.polyv.net',
    });
    this.v4Ai = this.client.v4Ai;
  }

  async listTtsVoices(pageNumber: number = 1, pageSize: number = 10): Promise<AIVideoProduceTtsVoice[]> {
    this.validatePagination(pageNumber, pageSize);
    const result = await this.v4Ai.listTtsVoices({ pageNumber, pageSize });
    return this.unwrapData<AIVideoProduceTtsVoice[]>(result) || [];
  }

  async listVideoProduces(params: ListVideoProducesServiceParams = {}): Promise<AIVideoProduceTaskListResponse> {
    const pageNumber = params.pageNumber || 1;
    const pageSize = params.pageSize || 10;
    this.validatePagination(pageNumber, pageSize);

    const request: ListVideoProducesParams = {
      pageNumber,
      pageSize,
    };

    if (params.videoName) request.videoName = params.videoName;
    if (params.status !== undefined) request.status = params.status as VideoProduceStatus;
    if (params.createTimeStart !== undefined) request.createTimeStart = params.createTimeStart;
    if (params.createTimeEnd !== undefined) request.createTimeEnd = params.createTimeEnd;
    if (params.tags && params.tags.length > 0) request.tags = params.tags;

    const result = await this.v4Ai.listVideoProduces(request);
    return this.unwrapData<AIVideoProduceTaskListResponse>(result) || this.emptyPage(pageNumber, pageSize);
  }

  async getVideoProduce(id: number): Promise<AIVideoProduceTask> {
    this.validatePositiveInteger(id, 'id');
    const result = await this.v4Ai.getVideoProduce({ id });
    return this.unwrapData<AIVideoProduceTask>(result) as AIVideoProduceTask;
  }

  async batchCreateVideoProduces(tasks: BatchCreateVideoProducesItem[]): Promise<AIVideoProduceCreateResponse> {
    if (!Array.isArray(tasks) || tasks.length === 0) {
      throw new Error('tasks must be a non-empty array');
    }
    if (tasks.length > 20) {
      throw new Error('tasks cannot contain more than 20 items');
    }

    const result = await this.v4Ai.batchCreateVideoProduces({ tasks });
    return this.unwrapData<AIVideoProduceCreateResponse>(result) || {
      success: true,
      createdCount: tasks.length,
    };
  }

  async deleteVideoProduce(id: number): Promise<boolean> {
    this.validatePositiveInteger(id, 'id');
    const params: DeleteVideoProduceParams = { id };
    await this.v4Ai.deleteVideoProduce(params);
    return true;
  }

  async listVideoProducePpts(pageNumber: number = 1, pageSize: number = 10): Promise<AIVideoProducePptListResponse> {
    this.validatePagination(pageNumber, pageSize);
    const result = await this.v4Ai.listVideoProducePpts({ pageNumber, pageSize });
    return this.unwrapData<AIVideoProducePptListResponse>(result) || this.emptyPage(pageNumber, pageSize);
  }

  async getVideoProducePpt(fileId: string): Promise<AIVideoProducePpt> {
    this.validateNonEmptyString(fileId, 'fileId');
    const result = await this.v4Ai.getVideoProducePpt({ fileId });
    return this.unwrapData<AIVideoProducePpt>(result) as AIVideoProducePpt;
  }

  async uploadVideoProducePpt(params: UploadVideoProducePptParams): Promise<AIVideoProducePptUploadResponse> {
    this.validateNonEmptyString(params.url, 'url');
    const result = await this.v4Ai.uploadVideoProducePpt(params);
    return this.unwrapData<AIVideoProducePptUploadResponse>(result) as AIVideoProducePptUploadResponse;
  }

  async asyncUploadVideoProducePpt(
    params: AsyncUploadVideoProducePptParams
  ): Promise<AIVideoProducePptAsyncUploadResponse> {
    this.validateNonEmptyString(params.url, 'url');
    const result = await this.v4Ai.asyncUploadVideoProducePpt(params);
    return this.unwrapData<AIVideoProducePptAsyncUploadResponse>(result) as AIVideoProducePptAsyncUploadResponse;
  }

  private validatePagination(pageNumber: number, pageSize: number): void {
    this.validatePositiveInteger(pageNumber, 'pageNumber');
    this.validatePositiveInteger(pageSize, 'pageSize');
    if (pageSize > 1000) {
      throw new Error('pageSize must be between 1 and 1000');
    }
  }

  private validatePositiveInteger(value: number, field: string): void {
    if (!Number.isInteger(value) || value < 1) {
      throw new Error(`${field} must be a positive integer`);
    }
  }

  private validateNonEmptyString(value: string, field: string): void {
    if (!value || value.trim() === '') {
      throw new Error(`${field} is required`);
    }
  }

  private emptyPage<T>(pageNumber: number, pageSize: number): T {
    return {
      pageNumber,
      pageSize,
      totalPages: 0,
      totalItems: 0,
      contents: [],
    } as T;
  }

  private unwrapData<T>(value: unknown): T | undefined {
    if (value && typeof value === 'object' && 'data' in value) {
      return (value as { data: T }).data;
    }
    return value as T;
  }
}
