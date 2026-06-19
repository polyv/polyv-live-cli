/**
 * @fileoverview Unit tests for viewer service methods that cover user CLI gaps
 */

import { ViewerServiceSdk } from './viewer-service';
import { AuthConfig } from '../types/auth';
import { ViewerServiceConfig } from '../types/viewer';

const mockV4User = {
  getViewerRecord: jest.fn(),
  listViewerRecords: jest.fn(),
  createViewerRecord: jest.fn(),
  updateViewerRecord: jest.fn(),
  deleteViewerRecord: jest.fn(),
  importExternalViewer: jest.fn(),
  updateViewerUserSystemConfig: jest.fn(),
  listViewerLabels: jest.fn(),
  createViewerLabel: jest.fn(),
  updateViewerLabel: jest.fn(),
  deleteViewerLabel: jest.fn(),
  addViewerLabel: jest.fn(),
  deleteViewerLabelRef: jest.fn(),
  listLabels: jest.fn(),
  createLabel: jest.fn(),
  updateLabel: jest.fn(),
  deleteLabel: jest.fn(),
  addChannelLabelRefs: jest.fn(),
  viewerLotteryWin: jest.fn(),
};

jest.mock('polyv-live-api-sdk', () => ({
  PolyVClient: jest.fn().mockImplementation(() => ({
    v4User: mockV4User,
  })),
}));

describe('ViewerServiceSdk user gap methods', () => {
  let service: ViewerServiceSdk;
  const authConfig: AuthConfig = {
    appId: 'app-id',
    appSecret: 'app-secret',
    userId: 'user-id',
  };
  const serviceConfig: ViewerServiceConfig = {
    baseUrl: 'https://api.polyv.net',
    timeout: 30000,
    debug: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ViewerServiceSdk(authConfig, serviceConfig);
  });

  it('delegates viewer record CRUD and config methods to V4UserService', async () => {
    mockV4User.createViewerRecord.mockResolvedValue({ viewerUnionId: 'viewer-1' });
    mockV4User.updateViewerRecord.mockResolvedValue(undefined);
    mockV4User.deleteViewerRecord.mockResolvedValue(undefined);
    mockV4User.importExternalViewer.mockResolvedValue([{ viewerUnionId: 'viewer-2' }]);
    mockV4User.updateViewerUserSystemConfig.mockResolvedValue(undefined);

    await service.createViewerRecord({ nickname: 'Demo', mobile: '13800138000' });
    await service.updateViewerRecord({ viewerUnionId: 'viewer-1', name: 'Demo' });
    await service.deleteViewerRecord({ viewerUnionId: 'viewer-1' });
    await service.importExternalViewer([{ externalViewerId: 'external-1', nickname: 'Ext' }]);
    await service.updateViewerUserSystemConfig({ mobileLoginEnabled: 'Y', wxWorkLoginEnabled: 'N' });

    expect(mockV4User.createViewerRecord).toHaveBeenCalledWith({ nickname: 'Demo', mobile: '13800138000' });
    expect(mockV4User.updateViewerRecord).toHaveBeenCalledWith({ viewerUnionId: 'viewer-1', name: 'Demo' });
    expect(mockV4User.deleteViewerRecord).toHaveBeenCalledWith({ viewerUnionId: 'viewer-1' });
    expect(mockV4User.importExternalViewer).toHaveBeenCalledWith([{ externalViewerId: 'external-1', nickname: 'Ext' }]);
    expect(mockV4User.updateViewerUserSystemConfig).toHaveBeenCalledWith({ mobileLoginEnabled: 'Y', wxWorkLoginEnabled: 'N' });
  });

  it('delegates viewer tag CRUD methods to V4UserService', async () => {
    mockV4User.createViewerLabel.mockResolvedValue([{ id: 1, label: 'VIP' }]);
    mockV4User.updateViewerLabel.mockResolvedValue(undefined);
    mockV4User.deleteViewerLabel.mockResolvedValue(undefined);

    await service.createViewerLabel({ labels: ['VIP'] });
    await service.updateViewerLabel({ id: 1, label: 'VIP2' });
    await service.deleteViewerLabel({ id: 1 });

    expect(mockV4User.createViewerLabel).toHaveBeenCalledWith({ labels: ['VIP'] });
    expect(mockV4User.updateViewerLabel).toHaveBeenCalledWith({ id: 1, label: 'VIP2' });
    expect(mockV4User.deleteViewerLabel).toHaveBeenCalledWith({ id: 1 });
  });

  it('delegates account label, channel ref, and lottery win methods to V4UserService', async () => {
    mockV4User.listLabels.mockResolvedValue({ contents: [], totalItems: 0 });
    mockV4User.createLabel.mockResolvedValue({ id: '1', name: 'VIP' });
    mockV4User.updateLabel.mockResolvedValue(undefined);
    mockV4User.deleteLabel.mockResolvedValue(undefined);
    mockV4User.addChannelLabelRefs.mockResolvedValue(undefined);
    mockV4User.viewerLotteryWin.mockResolvedValue({ contents: [], totalItems: 0 });

    await service.listLabels({ pageNumber: 1, pageSize: 10 });
    await service.createLabel({ labelName: 'VIP' });
    await service.updateLabel({ labelId: '1', labelName: 'VIP2' });
    await service.deleteLabel({ labelId: '1' });
    await service.addChannelLabelRefs({ channelIds: ['3151318'], labelIds: ['1'] });
    await service.viewerLotteryWin({ viewerId: 'viewer-1', pageNumber: 1, pageSize: 10 });

    expect(mockV4User.listLabels).toHaveBeenCalledWith({ pageNumber: 1, pageSize: 10 });
    expect(mockV4User.createLabel).toHaveBeenCalledWith({ labelName: 'VIP' });
    expect(mockV4User.updateLabel).toHaveBeenCalledWith({ labelId: '1', labelName: 'VIP2' });
    expect(mockV4User.deleteLabel).toHaveBeenCalledWith({ labelId: '1' });
    expect(mockV4User.addChannelLabelRefs).toHaveBeenCalledWith({ channelIds: ['3151318'], labelIds: ['1'] });
    expect(mockV4User.viewerLotteryWin).toHaveBeenCalledWith({ viewerId: 'viewer-1', pageNumber: 1, pageSize: 10 });
  });
});
