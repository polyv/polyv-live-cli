/**
 * @fileoverview Tests for PlatformServiceSdk
 * @author Development Team
 * @since 13.1.0
 */

import { PlatformServiceSdk } from './platform-service';
import { AuthConfig } from '../types/auth';
import { PolyVValidationError } from '../utils/errors';
import * as sdkModule from '../sdk';

// Mock the SDK module
jest.mock('../sdk', () => ({
  createSdkClient: jest.fn(),
}));

const mockCreateSdkClient = sdkModule.createSdkClient as jest.MockedFunction<typeof sdkModule.createSdkClient>;

describe('PlatformServiceSdk', () => {
  let service: PlatformServiceSdk;
  let mockSdkClient: {
    account: { [key: string]: jest.Mock };
    platform: { [key: string]: jest.Mock };
    v4Platform: { [key: string]: jest.Mock };
    v4User?: { [key: string]: jest.Mock };
  };
  const mockAuthConfig: AuthConfig = {
    appId: 'test-app-id',
    appSecret: 'test-app-secret',
  };
  const mockServiceConfig = {
    baseUrl: 'https://api.polyv.net',
    timeout: 30000,
    debug: false,
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock SDK client
    mockSdkClient = {
      account: {
        getUserInfo: jest.fn(),
        switchGet: jest.fn(),
        switchUpdate: jest.fn(),
      },
      platform: {
        createAnchor: jest.fn(),
        getAnchor: jest.fn(),
        listAnchors: jest.fn(),
        listAnchorRelations: jest.fn(),
        listAnchorUnrelations: jest.fn(),
        updateAnchor: jest.fn(),
        updateAnchorStatus: jest.fn(),
        listContentGroups: jest.fn(),
      },
      v4Platform: {
        searchCouponViewers: jest.fn(),
        updateCoupon: jest.fn(),
        updateCouponsStatusBatch: jest.fn(),
      },
    };

    mockCreateSdkClient.mockReturnValue(mockSdkClient as any);
    service = new PlatformServiceSdk(mockAuthConfig, mockServiceConfig);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  // ============================================
  // Constructor Tests (SVC-004)
  // ============================================

  describe('constructor', () => {
    it('[P1][SVC-004] should create instance with valid config', () => {
      expect(service).toBeInstanceOf(PlatformServiceSdk);
    });
  });

  // ============================================
  // getUserInfo Tests (AC1, AC6) - SVC-001
  // ============================================

  describe('getUserInfo', () => {
    it('[P0][SVC-001] should return user account info successfully', async () => {
      const mockResponse = {
        userId: 'user123',
        email: 'test@example.com',
        maxChannels: 100,
        totalChannels: 10,
        availableChannels: 90,
        linkMicLimit: 10,
        watchDomain: 'https://live.polyv.net',
      };

      mockSdkClient.account.getUserInfo.mockResolvedValueOnce(mockResponse);

      const result = await service.getUserInfo();

      expect(result).toEqual(mockResponse);
      expect(mockCreateSdkClient).toHaveBeenCalledWith(mockAuthConfig, mockServiceConfig.baseUrl);
      expect(mockSdkClient.account.getUserInfo).toHaveBeenCalled();
    });

    it('[P1] should handle API errors from getUserInfo', async () => {
      const apiError = new Error('API error: Authentication failed');
      mockSdkClient.account.getUserInfo.mockRejectedValueOnce(apiError);

      await expect(service.getUserInfo()).rejects.toThrow('API error: Authentication failed');
    });
  });

  // ============================================
  // getSwitchConfig Tests (AC2, AC6) - SVC-002
  // ============================================

  describe('getSwitchConfig', () => {
    it('[P0][SVC-002] should return switch config successfully', async () => {
      const mockResponse = {
        config: {
          globalSettingEnabled: true,
          authEnabled: false,
          recordEnabled: true,
          playbackEnabled: true,
          danmuEnabled: false,
        },
      };

      mockSdkClient.account.switchGet.mockResolvedValueOnce(mockResponse);

      const result = await service.getSwitchConfig();

      expect(result).toEqual(mockResponse);
      expect(mockSdkClient.account.switchGet).toHaveBeenCalled();
    });

    it('[P1] should handle API errors from switchGet', async () => {
      const apiError = new Error('API error: Permission denied');
      mockSdkClient.account.switchGet.mockRejectedValueOnce(apiError);

      await expect(service.getSwitchConfig()).rejects.toThrow('API error: Permission denied');
    });
  });

  // ============================================
  // updateSwitchConfig Tests (AC3, AC6) - SVC-003
  // ============================================

  describe('updateSwitchConfig', () => {
    const validParams = {
      param: 'chat',
      enabled: 'Y' as const,
    };

    it('[P0][SVC-003] should update switch config with Y value successfully', async () => {
      const mockResponse = { success: true };
      mockSdkClient.account.switchUpdate.mockResolvedValueOnce(mockResponse);

      const result = await service.updateSwitchConfig(validParams);

      expect(result).toEqual(mockResponse);
      expect(mockSdkClient.account.switchUpdate).toHaveBeenCalledWith({
        param: 'chat',
        enabled: 'Y',
      });
    });

    it('[P0] should update switch config with N value successfully', async () => {
      const mockResponse = { success: true };
      mockSdkClient.account.switchUpdate.mockResolvedValueOnce(mockResponse);

      const result = await service.updateSwitchConfig({
        param: 'autoPlay',
        enabled: 'N',
      });

      expect(result).toEqual(mockResponse);
      expect(mockSdkClient.account.switchUpdate).toHaveBeenCalledWith({
        param: 'autoPlay',
        enabled: 'N',
      });
    });

    it('[P1][SVC-005] should throw PolyVValidationError for invalid param name', async () => {
      const invalidParams = {
        param: 'invalidParam',
        enabled: 'Y' as const,
      };

      await expect(service.updateSwitchConfig(invalidParams)).rejects.toThrow(PolyVValidationError);
      expect(mockSdkClient.account.switchUpdate).not.toHaveBeenCalled();
    });

    it('[P1][SVC-006] should throw PolyVValidationError for invalid enabled value', async () => {
      const invalidParams = {
        param: 'chat',
        enabled: 'YES' as any,
      };

      await expect(service.updateSwitchConfig(invalidParams)).rejects.toThrow(PolyVValidationError);
      expect(mockSdkClient.account.switchUpdate).not.toHaveBeenCalled();
    });

    it('[P1] should throw PolyVValidationError for missing param', async () => {
      const invalidParams = {
        param: '',
        enabled: 'Y' as const,
      };

      await expect(service.updateSwitchConfig(invalidParams)).rejects.toThrow(PolyVValidationError);
    });

    it('[P1] should throw PolyVValidationError for missing enabled', async () => {
      const invalidParams = {
        param: 'chat',
        enabled: '' as any,
      };

      await expect(service.updateSwitchConfig(invalidParams)).rejects.toThrow(PolyVValidationError);
    });

    it('[P1] should support all valid switch params', async () => {
      const mockResponse = { success: true };
      mockSdkClient.account.switchUpdate.mockResolvedValue(mockResponse);

      const validParams = [
        'isClosePreview',
        'mobileWatch',
        'mobileAudio',
        'autoPlay',
        'booking',
        'redPack',
        'shareBtnEnabled',
        'chat',
        'chatPlayBack',
        'closeChaterList',
        'consultingMenu',
        'closeDanmu',
        'praise',
        'welcome',
        'viewerSendImgEnabled',
        'sendFlowersEnabled',
        'pushSharingEnabled',
        'qaMenuEnabled',
        'filterManagerMsgEnabled',
        'showCustomMessageEnabled',
        'chatOnlineNumberEnable',
        'pvShowEnabled',
        'rtsEnabled',
      ];

      for (const param of validParams) {
        await service.updateSwitchConfig({ param, enabled: 'Y' });
      }

      expect(mockSdkClient.account.switchUpdate).toHaveBeenCalledTimes(validParams.length);
    });

    it('[P1] should handle API errors from switchUpdate', async () => {
      const apiError = new Error('API error: Update failed');
      mockSdkClient.account.switchUpdate.mockRejectedValueOnce(apiError);

      await expect(service.updateSwitchConfig(validParams)).rejects.toThrow('API error: Update failed');
    });
  });

  describe('anchor and coupon APIs', () => {
    beforeEach(() => {
      mockSdkClient.platform.createAnchor.mockResolvedValue({ anchorId: 1 });
      mockSdkClient.platform.getAnchor.mockResolvedValue({ anchorId: 1 });
      mockSdkClient.platform.listAnchors.mockResolvedValue({ contents: [] });
      mockSdkClient.platform.listAnchorRelations.mockResolvedValue({ contents: [] });
      mockSdkClient.platform.listAnchorUnrelations.mockResolvedValue({ contents: [] });
      mockSdkClient.platform.updateAnchor.mockResolvedValue(undefined);
      mockSdkClient.platform.updateAnchorStatus.mockResolvedValue(undefined);
      mockSdkClient.platform.listContentGroups.mockResolvedValue([]);
      mockSdkClient.v4Platform.searchCouponViewers.mockResolvedValue({ contents: [] });
      mockSdkClient.v4Platform.updateCoupon.mockResolvedValue(undefined);
      mockSdkClient.v4Platform.updateCouponsStatusBatch.mockResolvedValue(undefined);
    });

    it('should call platform anchor APIs', async () => {
      await service.createAnchor({ nickname: 'host', sex: 'M', avatar: 'https://example.com/a.png' });
      await service.getAnchor(1);
      await service.listAnchors({ pageNumber: 1 });
      await service.listAnchorRelations({ anchorId: 1 });
      await service.listAnchorUnrelations({ anchorId: 1 });
      await service.updateAnchor({ anchorId: 1, nickname: 'new host' });
      await service.updateAnchorStatus({ anchorId: 1, status: 1 });

      expect(mockSdkClient.platform.createAnchor).toHaveBeenCalledWith({ nickname: 'host', sex: 'M', avatar: 'https://example.com/a.png' });
      expect(mockSdkClient.platform.getAnchor).toHaveBeenCalledWith(1);
      expect(mockSdkClient.platform.listAnchors).toHaveBeenCalledWith({ pageNumber: 1 });
      expect(mockSdkClient.platform.listAnchorRelations).toHaveBeenCalledWith({ anchorId: 1 });
      expect(mockSdkClient.platform.listAnchorUnrelations).toHaveBeenCalledWith({ anchorId: 1 });
      expect(mockSdkClient.platform.updateAnchor).toHaveBeenCalledWith({ anchorId: 1, nickname: 'new host' });
      expect(mockSdkClient.platform.updateAnchorStatus).toHaveBeenCalledWith({ anchorId: 1, status: 1 });
    });

    it('should call content group and coupon APIs', async () => {
      await service.listContentGroups('script');
      await service.searchCouponViewers({ couponId: 'coupon-1', pageNumber: 1 });
      await service.updateCoupon({ couponId: 'coupon-1', name: 'new coupon' });
      await service.updateCouponsStatusBatch({ couponIds: ['coupon-1'] });

      expect(mockSdkClient.platform.listContentGroups).toHaveBeenCalledWith('script');
      expect(mockSdkClient.v4Platform.searchCouponViewers).toHaveBeenCalledWith({ couponId: 'coupon-1', pageNumber: 1 });
      expect(mockSdkClient.v4Platform.updateCoupon).toHaveBeenCalledWith({ couponId: 'coupon-1', name: 'new coupon' });
      expect(mockSdkClient.v4Platform.updateCouponsStatusBatch).toHaveBeenCalledWith({ couponIds: ['coupon-1'] });
    });
  });

  // ============================================
  // Story 13-2: Callback Settings Tests
  // ============================================

  // ============================================
  // getCallbackSettings Tests (AC1, AC6) - SVC-CB-001
  // ============================================

  describe('getCallbackSettings', () => {
    it('[P0][SVC-CB-001] should get callback settings successfully', async () => {
      const mockResponse = {
        url: 'https://example.com/callback',
        enabled: true,
      };

      // Mock v4User.getCallback on SDK client
      mockSdkClient.v4User = {
        getCallback: jest.fn().mockResolvedValueOnce(mockResponse),
        updateCallback: jest.fn(),
      } as any;

      const result = await service.getCallbackSettings();

      expect(result).toEqual(mockResponse);
      expect(mockSdkClient.v4User.getCallback).toHaveBeenCalled();
    });

    it('[P1] should handle API errors from getCallbackSettings', async () => {
      const apiError = new Error('API error: Authentication failed');
      mockSdkClient.v4User = {
        getCallback: jest.fn().mockRejectedValueOnce(apiError),
        updateCallback: jest.fn(),
      } as any;

      await expect(service.getCallbackSettings()).rejects.toThrow('API error: Authentication failed');
    });
  });

  // ============================================
  // updateCallbackSettings Tests (AC2, AC5, AC6, AC8)
  // ============================================

  describe('updateCallbackSettings', () => {
    beforeEach(() => {
      // Set up v4User mock
      mockSdkClient.v4User = {
        getCallback: jest.fn(),
        updateCallback: jest.fn().mockResolvedValue(undefined),
      } as any;
      mockCreateSdkClient.mockReturnValue(mockSdkClient as any);
    });

    it('[P0][SVC-CB-002] should update callback settings with URL successfully', async () => {
      const params = {
        url: 'https://example.com/new-callback',
      };

      await service.updateCallbackSettings(params);

      expect(mockSdkClient.v4User.updateCallback).toHaveBeenCalledWith({
        streamCallbackUrl: 'https://example.com/new-callback',
      });
    });

    it('[P0] should clear streamCallbackUrl with an empty URL', async () => {
      await service.updateCallbackSettings({ url: '' });

      expect(mockSdkClient.v4User.updateCallback).toHaveBeenCalledWith({
        streamCallbackUrl: '',
      });
    });

    it('[P0][SVC-CB-003] should update callback settings with enabled successfully', async () => {
      const params = {
        enabled: true,
      };

      await service.updateCallbackSettings(params);

      expect(mockSdkClient.v4User.updateCallback).toHaveBeenCalledWith({
        rebirthVodCallbackEnabled: 'Y',
      });
    });

    it('[P0][SVC-CB-004] should update callback settings with both parameters successfully', async () => {
      const params = {
        url: 'https://example.com/new-callback',
        enabled: true,
      };

      await service.updateCallbackSettings(params);

      expect(mockSdkClient.v4User.updateCallback).toHaveBeenCalledWith({
        streamCallbackUrl: 'https://example.com/new-callback',
        rebirthVodCallbackEnabled: 'Y',
      });
    });

    it('[P0] should update callback settings with enabled false', async () => {
      const params = {
        enabled: false,
      };

      await service.updateCallbackSettings(params);

      expect(mockSdkClient.v4User.updateCallback).toHaveBeenCalledWith({
        rebirthVodCallbackEnabled: 'N',
      });
    });

    it('[P1][SVC-CB-005] should throw PolyVValidationError for invalid URL format', async () => {
      const invalidParams = {
        url: 'invalid-url',
      };

      await expect(service.updateCallbackSettings(invalidParams)).rejects.toThrow(PolyVValidationError);
      expect(mockSdkClient.v4User.updateCallback).not.toHaveBeenCalled();
    });

    it('[P1][SVC-CB-006] should throw PolyVValidationError for URL without protocol', async () => {
      const invalidParams = {
        url: 'example.com/callback',
      };

      await expect(service.updateCallbackSettings(invalidParams)).rejects.toThrow(PolyVValidationError);
      expect(mockSdkClient.v4User.updateCallback).not.toHaveBeenCalled();
    });

    it('[P1][SVC-CB-007] should throw PolyVValidationError when no parameters provided', async () => {
      const emptyParams = {};

      await expect(service.updateCallbackSettings(emptyParams)).rejects.toThrow(PolyVValidationError);
      expect(mockSdkClient.v4User.updateCallback).not.toHaveBeenCalled();
    });

    it('[P1] should accept http:// URL', async () => {
      const params = {
        url: 'http://example.com/callback',
      };

      await service.updateCallbackSettings(params);

      expect(mockSdkClient.v4User.updateCallback).toHaveBeenCalledWith({
        streamCallbackUrl: 'http://example.com/callback',
      });
    });

    it('[P1] should accept https:// URL', async () => {
      const params = {
        url: 'https://example.com/callback',
      };

      await service.updateCallbackSettings(params);

      expect(mockSdkClient.v4User.updateCallback).toHaveBeenCalledWith({
        streamCallbackUrl: 'https://example.com/callback',
      });
    });

    it('[P1] should reject ftp:// URL', async () => {
      const invalidParams = {
        url: 'ftp://example.com/callback',
      };

      await expect(service.updateCallbackSettings(invalidParams)).rejects.toThrow(PolyVValidationError);
      expect(mockSdkClient.v4User.updateCallback).not.toHaveBeenCalled();
    });

    it('[P1] should handle API errors from updateCallbackSettings', async () => {
      const apiError = new Error('API error: Update failed');
      mockSdkClient.v4User.updateCallback = jest.fn().mockRejectedValueOnce(apiError);

      const params = {
        url: 'https://example.com/new-callback',
      };

      await expect(service.updateCallbackSettings(params)).rejects.toThrow('API error: Update failed');
    });
  });

  // ============================================
  // Story 13-3: Global Channel Settings Tests
  // ============================================

  // ============================================
  // getGlobalChannelSettings Tests (AC1, AC6)
  // ============================================

  describe('getGlobalChannelSettings', () => {
    it('[P0][SVC-GS-001] should get global channel settings successfully', async () => {
      const mockResponse = {
        channelConcurrencesEnabled: 'Y',
        timelyConvertEnabled: 'Y',
        donateEnabled: 'N',
        rebirthAutoUploadEnabled: 'N',
        rebirthAutoConvertEnabled: 'N',
        pptCoveredEnabled: 'N',
        coverImgType: 'contain',
        testModeButtonEnabled: 'N',
      };

      // Mock v4User.getGlobalChannelSettings on SDK client
      mockSdkClient.v4User = {
        ...mockSdkClient.v4User,
        getGlobalChannelSettings: jest.fn().mockResolvedValueOnce(mockResponse),
        updateGlobalChannelSettings: jest.fn(),
      } as any;

      const result = await service.getGlobalChannelSettings();

      expect(result).toEqual(mockResponse);
      expect(mockSdkClient.v4User.getGlobalChannelSettings).toHaveBeenCalled();
    });

    it('[P1][SVC-GS-007] should handle API errors from getGlobalChannelSettings', async () => {
      const apiError = new Error('API error: Authentication failed');
      mockSdkClient.v4User = {
        ...mockSdkClient.v4User,
        getGlobalChannelSettings: jest.fn().mockRejectedValueOnce(apiError),
        updateGlobalChannelSettings: jest.fn(),
      } as any;

      await expect(service.getGlobalChannelSettings()).rejects.toThrow('API error: Authentication failed');
    });
  });

  // ============================================
  // updateGlobalChannelSettings Tests (AC2, AC6, AC8, AC9)
  // ============================================

  describe('updateGlobalChannelSettings', () => {
    beforeEach(() => {
      // Set up v4User mock
      mockSdkClient.v4User = {
        ...mockSdkClient.v4User,
        getGlobalChannelSettings: jest.fn(),
        updateGlobalChannelSettings: jest.fn().mockResolvedValue(undefined),
      } as any;
      mockCreateSdkClient.mockReturnValue(mockSdkClient as any);
    });

    it('[P0][SVC-GS-002] should update global channel settings with valid params', async () => {
      const params = {
        channelConcurrencesEnabled: 'Y',
        timelyConvertEnabled: 'N',
        donateEnabled: 'Y',
        coverImgType: 'cover',
      };

      await service.updateGlobalChannelSettings(params);

      expect(mockSdkClient.v4User.updateGlobalChannelSettings).toHaveBeenCalledWith(params);
    });

    it('[P1][SVC-GS-003] should validate Y/N values for boolean fields', async () => {
      const params = {
        channelConcurrencesEnabled: 'Y',
      };

      await service.updateGlobalChannelSettings(params);

      expect(mockSdkClient.v4User.updateGlobalChannelSettings).toHaveBeenCalledWith({
        channelConcurrencesEnabled: 'Y',
      });
    });

    it('[P1][SVC-GS-004] should validate coverImgType as contain or cover', async () => {
      const params = {
        coverImgType: 'contain',
      };

      await service.updateGlobalChannelSettings(params);

      expect(mockSdkClient.v4User.updateGlobalChannelSettings).toHaveBeenCalledWith({
        coverImgType: 'contain',
      });
    });

    it('[P1][SVC-GS-005] should throw PolyVValidationError for invalid Y/N value', async () => {
      const invalidParams = {
        channelConcurrencesEnabled: 'yes' as any,
      };

      await expect(service.updateGlobalChannelSettings(invalidParams)).rejects.toThrow(PolyVValidationError);
      expect(mockSdkClient.v4User.updateGlobalChannelSettings).not.toHaveBeenCalled();
    });

    it('[P1][SVC-GS-006] should throw PolyVValidationError for invalid coverImgType', async () => {
      const invalidParams = {
        coverImgType: 'invalid' as any,
      };

      await expect(service.updateGlobalChannelSettings(invalidParams)).rejects.toThrow(PolyVValidationError);
      expect(mockSdkClient.v4User.updateGlobalChannelSettings).not.toHaveBeenCalled();
    });

    it('[P1] should accept coverImgType as contain', async () => {
      const params = {
        coverImgType: 'contain' as const,
      };

      await service.updateGlobalChannelSettings(params);

      expect(mockSdkClient.v4User.updateGlobalChannelSettings).toHaveBeenCalledWith({
        coverImgType: 'contain',
      });
    });

    it('[P1] should accept coverImgType as cover', async () => {
      const params = {
        coverImgType: 'cover' as const,
      };

      await service.updateGlobalChannelSettings(params);

      expect(mockSdkClient.v4User.updateGlobalChannelSettings).toHaveBeenCalledWith({
        coverImgType: 'cover',
      });
    });

    it('[P1] should accept Y value for boolean fields', async () => {
      const params = {
        timelyConvertEnabled: 'Y' as const,
      };

      await service.updateGlobalChannelSettings(params);

      expect(mockSdkClient.v4User.updateGlobalChannelSettings).toHaveBeenCalledWith({
        timelyConvertEnabled: 'Y',
      });
    });

    it('[P1] should accept N value for boolean fields', async () => {
      const params = {
        donateEnabled: 'N' as const,
      };

      await service.updateGlobalChannelSettings(params);

      expect(mockSdkClient.v4User.updateGlobalChannelSettings).toHaveBeenCalledWith({
        donateEnabled: 'N',
      });
    });

    it('[P1] should reject lowercase y value', async () => {
      const invalidParams = {
        channelConcurrencesEnabled: 'y' as any,
      };

      await expect(service.updateGlobalChannelSettings(invalidParams)).rejects.toThrow(PolyVValidationError);
    });

    it('[P1] should reject lowercase n value', async () => {
      const invalidParams = {
        channelConcurrencesEnabled: 'n' as any,
      };

      await expect(service.updateGlobalChannelSettings(invalidParams)).rejects.toThrow(PolyVValidationError);
    });

    it('[P1][SVC-GS-008] should handle API errors from updateGlobalChannelSettings', async () => {
      const apiError = new Error('API error: Update failed');
      mockSdkClient.v4User.updateGlobalChannelSettings = jest.fn().mockRejectedValueOnce(apiError);

      const params = {
        channelConcurrencesEnabled: 'Y' as const,
      };

      await expect(service.updateGlobalChannelSettings(params)).rejects.toThrow('API error: Update failed');
    });
  });
});
