/**
 * @fileoverview Tests for PlatformLabelServiceSdk
 * @author Development Team
 * @since 13.4.0
 */

import { PlatformLabelServiceSdk } from './platform-label-service';
import { AuthConfig } from '../types/auth';
import { createSdkClient } from '../sdk';

// Mock the SDK client factory
jest.mock('../sdk', () => ({
  createSdkClient: jest.fn(),
}));

describe('PlatformLabelServiceSdk', () => {
  let service: PlatformLabelServiceSdk;
  let mockClient: { v4User: { [key: string]: jest.Mock } };
  let authConfig: AuthConfig;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup auth config
    authConfig = {
      appId: 'test-app-id',
      appSecret: 'test-app-secret',
      userId: 'test-user-id',
    };

    // Create mock client
    mockClient = {
      v4User: {
        listViewerLabels: jest.fn(),
        createViewerLabel: jest.fn(),
        updateViewerLabel: jest.fn(),
        deleteViewerLabel: jest.fn(),
      },
    };

    // Mock createSdkClient to return mock client
    (createSdkClient as jest.Mock).mockReturnValue(mockClient);

    // Create service instance
    service = new PlatformLabelServiceSdk(authConfig);
  });

  describe('constructor', () => {
    it('should create service with auth config', () => {
      expect(service).toBeDefined();
    });

    it('should accept optional service config', () => {
      const serviceWithConfig = new PlatformLabelServiceSdk(authConfig, {
        baseUrl: 'https://custom.api.com',
        timeout: 60000,
        debug: true,
      });
      expect(serviceWithConfig).toBeDefined();
    });
  });

  describe('listViewerLabels', () => {
    it('should call v4User.listViewerLabels', async () => {
      // Arrange
      const mockLabels = [
        { id: 1, label: 'VIP' },
        { id: 2, label: 'SVIP' },
      ];
      mockClient.v4User.listViewerLabels.mockResolvedValue({ contents: mockLabels });

      // Act
      const result = await service.listViewerLabels();

      // Assert
      expect(mockClient.v4User.listViewerLabels).toHaveBeenCalled();
      expect(result).toEqual([
        { labelId: 1, labelName: 'VIP' },
        { labelId: 2, labelName: 'SVIP' },
      ]);
    });

    it('should return empty array when no labels exist', async () => {
      // Arrange
      mockClient.v4User.listViewerLabels.mockResolvedValue({ contents: [] });

      // Act
      const result = await service.listViewerLabels();

      // Assert
      expect(result).toEqual([]);
    });

    it('should propagate API errors', async () => {
      // Arrange
      const error = new Error('API Error');
      mockClient.v4User.listViewerLabels.mockRejectedValue(error);

      // Act & Assert
      await expect(service.listViewerLabels()).rejects.toThrow('API Error');
    });
  });

  describe('createViewerLabel', () => {
    it('should call v4User.createViewerLabel with correct params', async () => {
      // Arrange
      const mockLabel = { id: 1, label: 'VIP' };
      mockClient.v4User.createViewerLabel.mockResolvedValue([mockLabel]);

      // Act
      const result = await service.createViewerLabel({ labelName: 'VIP' });

      // Assert
      expect(mockClient.v4User.createViewerLabel).toHaveBeenCalledWith({
        labels: ['VIP'],
      });
      expect(result).toEqual({ labelId: 1, labelName: 'VIP' });
    });

    it('should validate labelName is not empty', async () => {
      // Act & Assert
      await expect(service.createViewerLabel({ labelName: '' })).rejects.toThrow(
        'labelName 不能为空'
      );
    });

    it('should propagate API errors', async () => {
      // Arrange
      const error = new Error('API Error');
      mockClient.v4User.createViewerLabel.mockRejectedValue(error);

      // Act & Assert
      await expect(service.createViewerLabel({ labelName: 'VIP' })).rejects.toThrow('API Error');
    });
  });

  describe('updateViewerLabel', () => {
    it('should call v4User.updateViewerLabel with correct params', async () => {
      // Arrange
      mockClient.v4User.updateViewerLabel.mockResolvedValue(undefined);

      // Act
      await service.updateViewerLabel({ labelId: 1, labelName: 'Updated VIP' });

      // Assert
      expect(mockClient.v4User.updateViewerLabel).toHaveBeenCalledWith({
        id: 1,
        label: 'Updated VIP',
      });
    });

    it('should validate labelId is positive', async () => {
      // Act & Assert
      await expect(
        service.updateViewerLabel({ labelId: 0, labelName: 'VIP' })
      ).rejects.toThrow('labelId 必须是正整数');
    });

    it('should validate labelName is not empty', async () => {
      // Act & Assert
      await expect(
        service.updateViewerLabel({ labelId: 1, labelName: '' })
      ).rejects.toThrow('labelName 不能为空');
    });

    it('should propagate API errors', async () => {
      // Arrange
      const error = new Error('API Error');
      mockClient.v4User.updateViewerLabel.mockRejectedValue(error);

      // Act & Assert
      await expect(
        service.updateViewerLabel({ labelId: 1, labelName: 'VIP' })
      ).rejects.toThrow('API Error');
    });
  });

  describe('deleteViewerLabel', () => {
    it('should call v4User.deleteViewerLabel with correct params', async () => {
      // Arrange
      mockClient.v4User.deleteViewerLabel.mockResolvedValue(undefined);

      // Act
      await service.deleteViewerLabel({ labelId: 1 });

      // Assert
      expect(mockClient.v4User.deleteViewerLabel).toHaveBeenCalledWith({
        id: 1,
      });
    });

    it('should validate labelId is positive', async () => {
      // Act & Assert
      await expect(service.deleteViewerLabel({ labelId: -1 })).rejects.toThrow(
        'labelId 必须是正整数'
      );
    });

    it('should propagate API errors', async () => {
      // Arrange
      const error = new Error('API Error');
      mockClient.v4User.deleteViewerLabel.mockRejectedValue(error);

      // Act & Assert
      await expect(service.deleteViewerLabel({ labelId: 1 })).rejects.toThrow('API Error');
    });
  });
});
