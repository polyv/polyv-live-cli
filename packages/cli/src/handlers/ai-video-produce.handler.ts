/**
 * @fileoverview AI video production command handler for CLI operations
 */

import { BaseHandler, OutputFormat } from './base.handler';
import { AuthConfig } from '../types/auth';
import { PolyVValidationError } from '../utils/errors';
import { confirmDeletion } from '../utils/confirmation';
import { AIVideoProduceServiceSdk, ListVideoProducesServiceParams } from '../services/ai-video-produce-service';
import {
  AITtsVoiceListOptions,
  AIVideoProduceCreateOptions,
  AIVideoProduceCreateTask,
  AIVideoProduceDeleteOptions,
  AIVideoProduceGetOptions,
  AIVideoProduceListOptions,
  AIVideoProducePptAsyncUploadOptions,
  AIVideoProducePptGetOptions,
  AIVideoProducePptListOptions,
  AIVideoProducePptUploadOptions,
  AIVideoProduceServiceConfig,
} from '../types/ai-video-produce';

export class AIVideoProduceHandler extends BaseHandler {
  readonly aiVideoProduceService: AIVideoProduceServiceSdk;

  constructor(authConfig: AuthConfig, serviceConfig?: AIVideoProduceServiceConfig) {
    super();
    this.aiVideoProduceService = new AIVideoProduceServiceSdk(authConfig, serviceConfig);
  }

  async listTtsVoices(options: AITtsVoiceListOptions): Promise<void> {
    const format: OutputFormat = options.output || 'table';
    const page = options.page || 1;
    const size = options.size || 10;
    const voices = await this.aiVideoProduceService.listTtsVoices(page, size);

    if (format === 'json') {
      this.displayData(voices, 'json');
      return;
    }

    if (voices.length === 0) {
      console.log('No TTS voices found (未找到可用声音)');
      return;
    }

    this.displayAsTable(voices.map((voice) => ({
      ID: voice.id,
      '声音名称': voice.voiceName,
      '标签': voice.tag,
      '试听地址': voice.voiceDemoUrl,
    })));
  }

  async listVideoProduces(options: AIVideoProduceListOptions): Promise<void> {
    const format: OutputFormat = options.output || 'table';
    const params: ListVideoProducesServiceParams = {
      pageNumber: options.page || 1,
      pageSize: options.size || 10,
    };

    if (options.videoName) params.videoName = options.videoName;
    if (options.status !== undefined) params.status = options.status;
    if (options.createTimeStart !== undefined) params.createTimeStart = options.createTimeStart;
    if (options.createTimeEnd !== undefined) params.createTimeEnd = options.createTimeEnd;
    const tags = this.parseTags(options.tags);
    if (tags.length > 0) params.tags = tags;

    const response = await this.aiVideoProduceService.listVideoProduces(params);

    if (format === 'json') {
      this.displayData(response, 'json');
      return;
    }

    if (response.contents.length === 0) {
      console.log('No AI video produce tasks found (未找到视频创作任务)');
      return;
    }

    this.displayAsTable(response.contents.map((task) => ({
      ID: task.id,
      '视频名称': task.videoName,
      '类型': task.type,
      '状态': task.status,
      '数字人ID': task.digitalHumanId ?? '-',
      '时长': task.duration ?? '-',
      '创建时间': this.formatTimestamp(task.createTime),
    })));
    this.displayPageFooter(response.pageNumber, response.totalPages, response.totalItems);
  }

  async getVideoProduce(options: AIVideoProduceGetOptions): Promise<void> {
    const format: OutputFormat = options.output || 'table';
    const task = await this.aiVideoProduceService.getVideoProduce(options.id);
    this.displayData(task, format);
  }

  async createVideoProduces(options: AIVideoProduceCreateOptions): Promise<void> {
    const format: OutputFormat = options.output || 'table';
    const tasks = this.parseCreateTasks(options.tasks);

    if (!options.force) {
      const confirmed = await confirmDeletion(
        `Create ${tasks.length} AI video produce task(s)?`,
        'yes'
      );
      if (!confirmed) {
        this.displayCancellation(format);
        return;
      }
    }

    const response = await this.aiVideoProduceService.batchCreateVideoProduces(tasks);
    if (format === 'json') {
      this.displayData(response, 'json');
    } else {
      console.log(`Successfully created ${response.createdCount ?? tasks.length} AI video produce task(s).`);
    }
  }

  async deleteVideoProduce(options: AIVideoProduceDeleteOptions): Promise<void> {
    const format: OutputFormat = options.output || 'table';

    if (!options.force) {
      const confirmed = await confirmDeletion(
        `Delete AI video produce task ${options.id}?`,
        'yes'
      );
      if (!confirmed) {
        this.displayCancellation(format);
        return;
      }
    }

    const success = await this.aiVideoProduceService.deleteVideoProduce(options.id);
    this.displayMutationResult({ success, id: options.id }, format, 'AI video produce task deleted.');
  }

  async listVideoProducePpts(options: AIVideoProducePptListOptions): Promise<void> {
    const format: OutputFormat = options.output || 'table';
    const response = await this.aiVideoProduceService.listVideoProducePpts(options.page || 1, options.size || 10);

    if (format === 'json') {
      this.displayData(response, 'json');
      return;
    }

    if (response.contents.length === 0) {
      console.log('No AI video produce PPT files found (未找到视频创作PPT)');
      return;
    }

    this.displayAsTable(response.contents.map((ppt) => ({
      '文件ID': ppt.fileId,
      '文件名': ppt.fileName,
      '状态': ppt.status,
      '页数': ppt.totalPage ?? '-',
      '转换类型': ppt.convertType,
      '创建时间': this.formatTimestamp(ppt.createTime),
    })));
    this.displayPageFooter(response.pageNumber, response.totalPages, response.totalItems);
  }

  async getVideoProducePpt(options: AIVideoProducePptGetOptions): Promise<void> {
    const format: OutputFormat = options.output || 'table';
    const ppt = await this.aiVideoProduceService.getVideoProducePpt(options.fileId);
    this.displayData(ppt, format);
  }

  async uploadVideoProducePpt(options: AIVideoProducePptUploadOptions): Promise<void> {
    const format: OutputFormat = options.output || 'table';
    if (!options.force) {
      const confirmed = await confirmDeletion(
        `Upload PPT for AI video production from ${options.url}?`,
        'yes'
      );
      if (!confirmed) {
        this.displayCancellation(format);
        return;
      }
    }

    const params: { url: string; docName?: string } = { url: options.url };
    if (options.docName) params.docName = options.docName;
    const response = await this.aiVideoProduceService.uploadVideoProducePpt(params);
    this.displayMutationResult(response, format, 'AI video produce PPT uploaded.');
  }

  async asyncUploadVideoProducePpt(options: AIVideoProducePptAsyncUploadOptions): Promise<void> {
    const format: OutputFormat = options.output || 'table';
    if (!options.force) {
      const confirmed = await confirmDeletion(
        `Start async PPT upload for AI video production from ${options.url}?`,
        'yes'
      );
      if (!confirmed) {
        this.displayCancellation(format);
        return;
      }
    }

    const params: {
      url: string;
      docName?: string;
      type?: 'common' | 'animate';
      callbackUrl?: string;
      childUserId?: string;
    } = { url: options.url };
    if (options.docName) params.docName = options.docName;
    if (options.type) params.type = options.type;
    if (options.callbackUrl) params.callbackUrl = options.callbackUrl;
    if (options.childUserId) params.childUserId = options.childUserId;

    const response = await this.aiVideoProduceService.asyncUploadVideoProducePpt(params);
    this.displayMutationResult(response, format, 'AI video produce PPT async upload started.');
  }

  parseCreateTasks(value: string): AIVideoProduceCreateTask[] {
    if (!value || value.trim() === '') {
      throw new PolyVValidationError('tasks is required', 'tasks', value, 'required');
    }

    let tasks: unknown;
    try {
      tasks = JSON.parse(value);
    } catch {
      throw new PolyVValidationError('tasks must be valid JSON', 'tasks', value, 'invalid');
    }

    if (!Array.isArray(tasks) || tasks.length === 0) {
      throw new PolyVValidationError('tasks must be a non-empty JSON array', 'tasks', value, 'invalid');
    }

    if (tasks.length > 20) {
      throw new PolyVValidationError('tasks cannot contain more than 20 items', 'tasks', tasks.length, 'exceed_maximum');
    }

    return tasks as AIVideoProduceCreateTask[];
  }

  private parseTags(value?: string): string[] {
    if (!value) return [];
    return value
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  }

  private displayMutationResult(data: unknown, format: OutputFormat, message: string): void {
    if (format === 'json') {
      this.displayData(data, 'json');
    } else {
      console.log(message);
    }
  }

  private displayCancellation(format: OutputFormat): void {
    if (format === 'json') {
      this.displayData({ success: false, cancelled: true }, 'json');
    } else {
      console.log('Operation cancelled.');
    }
  }

  private displayPageFooter(pageNumber: number, totalPages: number, totalItems: number): void {
    console.log(`\nPage ${pageNumber}/${totalPages} | Total: ${totalItems} items`);
  }

  private formatTimestamp(timestamp: number): string {
    if (!timestamp) return '-';
    return new Date(timestamp).toISOString().split('T')[0] || '-';
  }
}
