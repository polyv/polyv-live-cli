import { PlaybackServiceSdk } from './playback.service.sdk';
import { DocumentServiceSdk } from './document.service.sdk';
import { SessionServiceSdk } from './session.service.sdk';
import { RecordServiceSdk } from './record.service.sdk';
import { createSdkClient } from '../sdk';

jest.mock('../sdk', () => ({
  createSdkClient: jest.fn(),
}));

const authConfig = { appId: 'app', appSecret: 'secret' };
const serviceConfig = { baseUrl: 'https://api.polyv.net', timeout: 30000, debug: false };

describe('channel completion service SDK wrappers', () => {
  let sdkClient: any;

  beforeEach(() => {
    sdkClient = {
      channel: {
        setUserPlaybackEnabled: jest.fn().mockResolvedValue({ ok: true }),
        addVodPlaybackToLibrary: jest.fn().mockResolvedValue({ videoId: 'v1' }),
        updatePlaybackTitle: jest.fn().mockResolvedValue(true),
        movePlaybackVideo: jest.fn().mockResolvedValue(undefined),
        sortPlaybackVideos: jest.fn().mockResolvedValue(undefined),
        updateTeacherDocRelation: jest.fn().mockResolvedValue(true),
        linkChannelMultimediaResource: jest.fn().mockResolvedValue(true),
        getUserMultimediaResourceDetail: jest.fn().mockResolvedValue({ contents: [] }),
        getSessionDataList: jest.fn().mockResolvedValue({ contents: [] }),
        relevanceSession: jest.fn().mockResolvedValue('ok'),
        listFileIdByExternal: jest.fn().mockResolvedValue([]),
        getRecordFile: jest.fn().mockResolvedValue({ contents: [] }),
        mergeRecordFiles: jest.fn().mockResolvedValue('merged'),
        convertRecordFileToVod: jest.fn().mockResolvedValue({ fileId: 'vod1' }),
        recordAddBreakpoint: jest.fn().mockResolvedValue(true),
      },
      v4Channel: {
        listPlaybackSettings: jest.fn().mockResolvedValue([]),
        getPlaybackVideoInfo: jest.fn().mockResolvedValue([]),
        updateChannelSubtitleBatch: jest.fn().mockResolvedValue(undefined),
        sessionCreate: jest.fn().mockResolvedValue({ sessionId: 's1' }),
        sessionDelete: jest.fn().mockResolvedValue(undefined),
        getSessionExternalBySession: jest.fn().mockResolvedValue({ externalSessionId: 'ext' }),
        listMaterialRecordFiles: jest.fn().mockResolvedValue({ contents: [] }),
        createRecordFileOutline: jest.fn().mockResolvedValue({ fileId: 'f1' }),
        batchPublishRecordFileSubtitles: jest.fn().mockResolvedValue(undefined),
      },
    };
    (createSdkClient as jest.Mock).mockReturnValue(sdkClient);
  });

  it('delegates playback completion wrappers to SDK methods', async () => {
    const service = new PlaybackServiceSdk(authConfig, serviceConfig);

    await service.listPlaybackSettings(['1', '2']);
    await service.setPlaybackEnabled({ userId: 'u1', playBackEnabled: 'Y', channelId: '1' });
    await service.addVodPlayback({ channelId: '1', vid: 'vid1', setAsDefault: 'Y' });
    await service.updatePlaybackTitle('1', 'video1', 'title');
    await service.sortPlaybackVideos({ channelId: '1', videoIds: ['video1'] });

    expect(sdkClient.v4Channel.listPlaybackSettings).toHaveBeenCalledWith({ channelIds: ['1', '2'] });
    expect(sdkClient.channel.setUserPlaybackEnabled).toHaveBeenCalledWith({ userId: 'u1', playBackEnabled: 'Y', channelId: '1' });
    expect(sdkClient.channel.addVodPlaybackToLibrary).toHaveBeenCalledWith({ channelId: '1', vid: 'vid1', setAsDefault: 'Y' });
    expect(sdkClient.channel.updatePlaybackTitle).toHaveBeenCalledWith('1', 'video1', 'title');
    expect(sdkClient.channel.sortPlaybackVideos).toHaveBeenCalledWith({ channelId: '1', videoIds: ['video1'] });
  });

  it('delegates document completion wrappers to SDK methods', async () => {
    const service = new DocumentServiceSdk(authConfig, serviceConfig);

    await service.updateTeacherDocRelation('teacher1', 'file1,file2', 1);
    await service.linkChannelMultimediaResource('1', 'vid1');
    await service.getUserMultimediaResourceDetail('vid1,vid2');

    expect(sdkClient.channel.updateTeacherDocRelation).toHaveBeenCalledWith('teacher1', 'file1,file2', 1);
    expect(sdkClient.channel.linkChannelMultimediaResource).toHaveBeenCalledWith('1', 'vid1');
    expect(sdkClient.channel.getUserMultimediaResourceDetail).toHaveBeenCalledWith('vid1,vid2');
  });

  it('delegates session completion wrappers to SDK methods', async () => {
    const service = new SessionServiceSdk(authConfig, serviceConfig);

    await service.getSessionDataList({ channelId: '1', page: 1 });
    await service.createSession({ channelId: '1', name: 'session', planStartTime: 1, planEndTime: 2 });
    await service.getSessionExternalBySession('1', 's1');
    await service.relevanceSession('1', 'ext1');

    expect(sdkClient.channel.getSessionDataList).toHaveBeenCalledWith({ channelId: '1', page: 1 });
    expect(sdkClient.v4Channel.sessionCreate).toHaveBeenCalledWith({ channelId: '1', name: 'session', planStartTime: 1, planEndTime: 2 });
    expect(sdkClient.v4Channel.getSessionExternalBySession).toHaveBeenCalledWith({ channelId: '1', sessionId: 's1' });
    expect(sdkClient.channel.relevanceSession).toHaveBeenCalledWith({ channelId: '1', externalSessionId: 'ext1' });
  });

  it('delegates record completion wrappers to SDK methods', async () => {
    const service = new RecordServiceSdk(authConfig, serviceConfig);

    await service.getRecordFile('1', 'f1');
    await service.mergeRecordFiles({ channelId: '1', fileIds: 'f1,f2' });
    await service.convertRecordFileToVod({ channelId: '1', userId: 'u1', fileName: 'vod', sessionId: 's1' });
    await service.recordAddBreakpoint('1', { fileId: 'f1', time: 10 });
    await service.createRecordFileOutline({ fileId: 'f1', syncToPlaybackDotEnabled: 'Y' });

    expect(sdkClient.channel.getRecordFile).toHaveBeenCalledWith('1', 'f1');
    expect(sdkClient.channel.mergeRecordFiles).toHaveBeenCalledWith({ channelId: '1', fileIds: 'f1,f2' });
    expect(sdkClient.channel.convertRecordFileToVod).toHaveBeenCalledWith({ channelId: '1', userId: 'u1', fileName: 'vod', sessionId: 's1' });
    expect(sdkClient.channel.recordAddBreakpoint).toHaveBeenCalledWith('1', { fileId: 'f1', time: 10 });
    expect(sdkClient.v4Channel.createRecordFileOutline).toHaveBeenCalledWith({ fileId: 'f1', syncToPlaybackDotEnabled: 'Y' });
  });
});
