import { PlaybackHandler } from './playback.handler';
import { DocumentHandler } from './document.handler';
import { SessionHandler } from './session.handler';
import { RecordHandler } from './record.handler';

const authConfig = { appId: 'app', appSecret: 'secret' };
const serviceConfig = { baseUrl: 'https://api.polyv.net', timeout: 30000, debug: false };

describe('channel completion handlers', () => {
  let consoleLog: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLog = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleLog.mockRestore();
  });

  it('handles playback write completions with force', async () => {
    const service = {
      addVodPlayback: jest.fn().mockResolvedValue({ videoId: 'v1' }),
      updatePlaybackTitle: jest.fn().mockResolvedValue(true),
      sortPlaybackVideos: jest.fn().mockResolvedValue(undefined),
    };
    const handler = new PlaybackHandler(authConfig, serviceConfig, service as any);

    await handler.addVodPlayback({ channelId: '1', vid: 'vid1', setAsDefault: 'Y', force: true, output: 'json' });
    await handler.updatePlaybackTitle({ channelId: '1', videoId: 'v1', title: 'New', force: true, output: 'json' });
    await handler.sortPlaybackVideos({ channelId: '1', videoIds: 'v1,v2', force: true, output: 'json' });

    expect(service.addVodPlayback).toHaveBeenCalledWith({ channelId: '1', vid: 'vid1', setAsDefault: 'Y', listType: undefined });
    expect(service.updatePlaybackTitle).toHaveBeenCalledWith('1', 'v1', 'New');
    expect(service.sortPlaybackVideos).toHaveBeenCalledWith({ channelId: '1', videoIds: ['v1', 'v2'], listType: undefined });
  });

  it('handles document media write completions with force', async () => {
    const service = {
      linkChannelMultimediaResource: jest.fn().mockResolvedValue(true),
      deleteUserMultimediaResource: jest.fn().mockResolvedValue(true),
    };
    const handler = new DocumentHandler(authConfig, serviceConfig, service as any);

    await handler.linkChannelMultimediaResource({ channelId: '1', vids: 'vid1,vid2', force: true, output: 'json' });
    await handler.deleteUserMultimediaResource({ vids: ['vid1'], force: true, output: 'json' });

    expect(service.linkChannelMultimediaResource).toHaveBeenCalledWith('1', 'vid1,vid2');
    expect(service.deleteUserMultimediaResource).toHaveBeenCalledWith('vid1');
  });

  it('handles session write completions with force', async () => {
    const service = {
      createSession: jest.fn().mockResolvedValue({ sessionId: 's1' }),
      deleteSession: jest.fn().mockResolvedValue(undefined),
      relevanceSession: jest.fn().mockResolvedValue('ok'),
    };
    const handler = new SessionHandler(authConfig, serviceConfig, service as any);

    await handler.createSession({ channelId: '1', name: 's', planStartTime: 1, planEndTime: 2, force: true, output: 'json' });
    await handler.deleteSession({ channelId: '1', sessionId: 's1', force: true, output: 'json' });
    await handler.relevanceSession({ channelId: '1', externalSessionId: 'ext1', force: true, output: 'json' });

    expect(service.createSession).toHaveBeenCalledWith({ channelId: '1', name: 's', planStartTime: 1, planEndTime: 2 });
    expect(service.deleteSession).toHaveBeenCalledWith('1', 's1');
    expect(service.relevanceSession).toHaveBeenCalledWith('1', 'ext1');
  });

  it('handles record write completions with force', async () => {
    const service = {
      recordAddBreakpoint: jest.fn().mockResolvedValue(true),
      mergeRecordFiles: jest.fn().mockResolvedValue('merged'),
      createRecordFileOutline: jest.fn().mockResolvedValue({ fileId: 'f1' }),
      batchPublishRecordFileSubtitles: jest.fn().mockResolvedValue(undefined),
    };
    const handler = new RecordHandler(authConfig, serviceConfig, service as any);

    await handler.recordAddBreakpoint({ channelId: '1', fileId: 'f1', time: 10, force: true, output: 'json' });
    await handler.mergeRecordFiles({ channelId: '1', fileIds: 'f1,f2', force: true, output: 'json' });
    await handler.createRecordFileOutline({ fileId: 'f1', syncToPlaybackDotEnabled: 'Y', force: true, output: 'json' });
    await handler.batchPublishRecordFileSubtitles({ subtitles: [{ id: 1, status: 'publish' }], force: true, output: 'json' });

    expect(service.recordAddBreakpoint).toHaveBeenCalledWith('1', { fileId: 'f1', time: 10 });
    expect(service.mergeRecordFiles).toHaveBeenCalledWith({ channelId: '1', fileIds: 'f1,f2' });
    expect(service.createRecordFileOutline).toHaveBeenCalledWith({ fileId: 'f1', syncToPlaybackDotEnabled: 'Y' });
    expect(service.batchPublishRecordFileSubtitles).toHaveBeenCalledWith([{ id: 1, status: 'publish' }]);
  });
});
