/**
 * @fileoverview Unit tests for AI video production handler
 */

import { AIVideoProduceHandler } from './ai-video-produce.handler';
import { AIVideoProduceServiceSdk } from '../services/ai-video-produce-service';
import { confirmDeletion } from '../utils/confirmation';

jest.mock('../services/ai-video-produce-service');
jest.mock('../utils/confirmation', () => ({
  confirmDeletion: jest.fn(),
}));

const mockConfirmDeletion = confirmDeletion as jest.MockedFunction<typeof confirmDeletion>;

describe('AIVideoProduceHandler', () => {
  let handler: AIVideoProduceHandler;
  let mockService: jest.Mocked<AIVideoProduceServiceSdk>;

  const mockAuthConfig = {
    appId: 'test-app-id',
    appSecret: 'test-app-secret',
    userId: 'test-user-id',
  };

  beforeEach(() => {
    handler = new AIVideoProduceHandler(mockAuthConfig);
    mockService = {
      listTtsVoices: jest.fn(),
      listVideoProduces: jest.fn(),
      getVideoProduce: jest.fn(),
      batchCreateVideoProduces: jest.fn(),
      deleteVideoProduce: jest.fn(),
      listVideoProducePpts: jest.fn(),
      getVideoProducePpt: jest.fn(),
      uploadVideoProducePpt: jest.fn(),
      asyncUploadVideoProducePpt: jest.fn(),
    } as unknown as jest.Mocked<AIVideoProduceServiceSdk>;
    (handler as unknown as { aiVideoProduceService: typeof mockService }).aiVideoProduceService = mockService;
    mockConfirmDeletion.mockResolvedValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('lists TTS voices in JSON output', async () => {
    mockService.listTtsVoices.mockResolvedValue([
      { id: 1, voiceName: 'Xiaoxiao', voiceDemoUrl: 'https://example.com/demo.wav', tag: 'FEMALE_VOICE' as any },
    ]);
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    await handler.listTtsVoices({ page: 1, size: 10, output: 'json' });

    expect(mockService.listTtsVoices).toHaveBeenCalledWith(1, 10);
    expect(() => JSON.parse(consoleSpy.mock.calls[0][0])).not.toThrow();
  });

  it('lists video production tasks with filters', async () => {
    mockService.listVideoProduces.mockResolvedValue({
      pageNumber: 1,
      pageSize: 10,
      totalPages: 1,
      totalItems: 1,
      contents: [{
        id: 100,
        videoName: 'demo',
        type: 1,
        status: 20 as any,
        videoPath: null,
        videoImage: null,
        videoFileSize: null,
        duration: null,
        digitalHumanId: null,
        dealTime: null,
        createTime: 1700000000000,
        modifyTime: 1700000000000,
        subtitlePath: null,
        tags: [],
      }],
    });
    jest.spyOn(console, 'log').mockImplementation();

    await handler.listVideoProduces({
      page: 1,
      size: 10,
      status: 20,
      tags: 'tag-a,tag-b',
      output: 'table',
    });

    expect(mockService.listVideoProduces).toHaveBeenCalledWith({
      pageNumber: 1,
      pageSize: 10,
      status: 20,
      tags: ['tag-a', 'tag-b'],
    });
  });

  it('gets a video production task', async () => {
    mockService.getVideoProduce.mockResolvedValue({ id: 100, videoName: 'demo' } as any);
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    await handler.getVideoProduce({ id: 100, output: 'json' });

    expect(mockService.getVideoProduce).toHaveBeenCalledWith(100);
    expect(() => JSON.parse(consoleSpy.mock.calls[0][0])).not.toThrow();
  });

  it('creates video production tasks with force', async () => {
    mockService.batchCreateVideoProduces.mockResolvedValue({ success: true, createdCount: 1 });
    jest.spyOn(console, 'log').mockImplementation();
    const tasks = JSON.stringify([{
      videoName: 'demo',
      hasDigitalHuman: false,
      ttsVoiceInfo: { ttsVoiceId: 1, rate: 1 },
      subtitleInfo: { enableSubtitle: true },
    }]);

    await handler.createVideoProduces({ tasks, force: true, output: 'table' });

    expect(mockConfirmDeletion).not.toHaveBeenCalled();
    expect(mockService.batchCreateVideoProduces).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ videoName: 'demo' }),
    ]));
  });

  it('cancels create when confirmation is declined', async () => {
    mockConfirmDeletion.mockResolvedValue(false);
    jest.spyOn(console, 'log').mockImplementation();

    await handler.createVideoProduces({
      tasks: JSON.stringify([{ videoName: 'demo' }]),
      output: 'json',
    });

    expect(mockService.batchCreateVideoProduces).not.toHaveBeenCalled();
  });

  it('deletes video production task with confirmation', async () => {
    mockService.deleteVideoProduce.mockResolvedValue(true);
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    await handler.deleteVideoProduce({ id: 100, output: 'json' });

    expect(mockConfirmDeletion).toHaveBeenCalled();
    expect(mockService.deleteVideoProduce).toHaveBeenCalledWith(100);
    expect(() => JSON.parse(consoleSpy.mock.calls[0][0])).not.toThrow();
  });

  it('handles PPT list, get, upload, and async upload', async () => {
    mockService.listVideoProducePpts.mockResolvedValue({
      pageNumber: 1,
      pageSize: 10,
      totalPages: 0,
      totalItems: 0,
      contents: [],
    });
    mockService.getVideoProducePpt.mockResolvedValue({ fileId: 'file-1' } as any);
    mockService.uploadVideoProducePpt.mockResolvedValue({ fileId: 'file-1', fileName: 'demo.pptx' });
    mockService.asyncUploadVideoProducePpt.mockResolvedValue({ fileId: 'file-2' });
    jest.spyOn(console, 'log').mockImplementation();

    await handler.listVideoProducePpts({ page: 1, size: 10, output: 'table' });
    await handler.getVideoProducePpt({ fileId: 'file-1', output: 'json' });
    await handler.uploadVideoProducePpt({ url: 'https://example.com/demo.pptx', docName: 'demo', force: true, output: 'json' });
    await handler.asyncUploadVideoProducePpt({
      url: 'https://example.com/demo.pptx',
      type: 'animate',
      callbackUrl: 'https://example.com/callback',
      childUserId: 'child-1',
      force: true,
      output: 'json',
    });

    expect(mockService.listVideoProducePpts).toHaveBeenCalledWith(1, 10);
    expect(mockService.getVideoProducePpt).toHaveBeenCalledWith('file-1');
    expect(mockService.uploadVideoProducePpt).toHaveBeenCalledWith({
      url: 'https://example.com/demo.pptx',
      docName: 'demo',
    });
    expect(mockService.asyncUploadVideoProducePpt).toHaveBeenCalledWith({
      url: 'https://example.com/demo.pptx',
      type: 'animate',
      callbackUrl: 'https://example.com/callback',
      childUserId: 'child-1',
    });
  });

  it('validates create task JSON', () => {
    expect(() => handler.parseCreateTasks('not-json')).toThrow();
    expect(() => handler.parseCreateTasks('[]')).toThrow();
    expect(handler.parseCreateTasks('[{"videoName":"demo"}]')).toHaveLength(1);
  });
});
