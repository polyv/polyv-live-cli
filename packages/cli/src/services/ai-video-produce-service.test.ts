/**
 * @fileoverview Unit tests for AI video production service
 */

import { AIVideoProduceServiceSdk } from './ai-video-produce-service';
import { AuthConfig } from '../types/auth';

describe('AIVideoProduceServiceSdk', () => {
  let service: AIVideoProduceServiceSdk;
  let mockV4Ai: {
    listTtsVoices: jest.Mock;
    listVideoProduces: jest.Mock;
    getVideoProduce: jest.Mock;
    batchCreateVideoProduces: jest.Mock;
    deleteVideoProduce: jest.Mock;
    listVideoProducePpts: jest.Mock;
    getVideoProducePpt: jest.Mock;
    uploadVideoProducePpt: jest.Mock;
    asyncUploadVideoProducePpt: jest.Mock;
  };

  const authConfig: AuthConfig = {
    appId: 'test-app-id',
    appSecret: 'test-app-secret',
    userId: 'test-user-id',
  };

  beforeEach(() => {
    service = new AIVideoProduceServiceSdk(authConfig);
    mockV4Ai = {
      listTtsVoices: jest.fn(),
      listVideoProduces: jest.fn(),
      getVideoProduce: jest.fn(),
      batchCreateVideoProduces: jest.fn(),
      deleteVideoProduce: jest.fn(),
      listVideoProducePpts: jest.fn(),
      getVideoProducePpt: jest.fn(),
      uploadVideoProducePpt: jest.fn(),
      asyncUploadVideoProducePpt: jest.fn(),
    };
    (service as unknown as { v4Ai: typeof mockV4Ai }).v4Ai = mockV4Ai;
  });

  it('lists TTS voices with pagination', async () => {
    const voices = [{ id: 1, voiceName: 'Xiaoxiao', voiceDemoUrl: 'https://example.com/demo.wav', tag: 'FEMALE_VOICE' }];
    mockV4Ai.listTtsVoices.mockResolvedValue({ data: voices });

    await expect(service.listTtsVoices(2, 20)).resolves.toEqual(voices);
    expect(mockV4Ai.listTtsVoices).toHaveBeenCalledWith({ pageNumber: 2, pageSize: 20 });
  });

  it('lists video production tasks with optional filters', async () => {
    const response = { pageNumber: 1, pageSize: 10, totalPages: 1, totalItems: 0, contents: [] };
    mockV4Ai.listVideoProduces.mockResolvedValue({ data: response });

    await service.listVideoProduces({
      pageNumber: 1,
      pageSize: 10,
      videoName: 'demo',
      status: 20,
      createTimeStart: 1700000000000,
      createTimeEnd: 1700100000000,
      tags: ['tag-a'],
    });

    expect(mockV4Ai.listVideoProduces).toHaveBeenCalledWith({
      pageNumber: 1,
      pageSize: 10,
      videoName: 'demo',
      status: 20,
      createTimeStart: 1700000000000,
      createTimeEnd: 1700100000000,
      tags: ['tag-a'],
    });
  });

  it('gets and deletes video production tasks by id', async () => {
    mockV4Ai.getVideoProduce.mockResolvedValue({ data: { id: 100, videoName: 'demo' } });
    mockV4Ai.deleteVideoProduce.mockResolvedValue(undefined);

    await expect(service.getVideoProduce(100)).resolves.toMatchObject({ id: 100 });
    await expect(service.deleteVideoProduce(100)).resolves.toBe(true);

    expect(mockV4Ai.getVideoProduce).toHaveBeenCalledWith({ id: 100 });
    expect(mockV4Ai.deleteVideoProduce).toHaveBeenCalledWith({ id: 100 });
  });

  it('creates video production tasks in batch', async () => {
    const tasks = [
      {
        videoName: 'demo',
        hasDigitalHuman: false,
        ttsVoiceInfo: { ttsVoiceId: 1, rate: 1 },
        subtitleInfo: { enableSubtitle: true },
        materialInfos: [{ backgroundImage: 'https://example.com/bg.png', remark: 'hello' }],
      },
    ];
    mockV4Ai.batchCreateVideoProduces.mockResolvedValue({ data: { success: true, createdCount: 1 } });

    await expect(service.batchCreateVideoProduces(tasks)).resolves.toEqual({ success: true, createdCount: 1 });
    expect(mockV4Ai.batchCreateVideoProduces).toHaveBeenCalledWith({ tasks });
  });

  it('lists, gets, and uploads PPT files', async () => {
    const page = { pageNumber: 1, pageSize: 10, totalPages: 1, totalItems: 0, contents: [] };
    mockV4Ai.listVideoProducePpts.mockResolvedValue({ data: page });
    mockV4Ai.getVideoProducePpt.mockResolvedValue({ data: { fileId: 'file-1', fileName: 'demo.pptx' } });
    mockV4Ai.uploadVideoProducePpt.mockResolvedValue({ data: { fileId: 'file-1', fileName: 'demo.pptx' } });
    mockV4Ai.asyncUploadVideoProducePpt.mockResolvedValue({ data: { fileId: 'file-2' } });

    await expect(service.listVideoProducePpts(1, 10)).resolves.toEqual(page);
    await expect(service.getVideoProducePpt('file-1')).resolves.toMatchObject({ fileId: 'file-1' });
    await expect(service.uploadVideoProducePpt({ url: 'https://example.com/demo.pptx', docName: 'demo' }))
      .resolves.toMatchObject({ fileId: 'file-1' });
    await expect(service.asyncUploadVideoProducePpt({ url: 'https://example.com/demo.pptx', type: 'common' }))
      .resolves.toMatchObject({ fileId: 'file-2' });
  });

  it('validates pagination, id, and task payloads', async () => {
    await expect(service.listTtsVoices(0, 10)).rejects.toThrow('pageNumber');
    await expect(service.listVideoProducePpts(1, 1001)).rejects.toThrow('pageSize');
    await expect(service.getVideoProduce(0)).rejects.toThrow('id');
    await expect(service.batchCreateVideoProduces([])).rejects.toThrow('tasks');
    await expect(service.getVideoProducePpt('')).rejects.toThrow('fileId');
  });
});
