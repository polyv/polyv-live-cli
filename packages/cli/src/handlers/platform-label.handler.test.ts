/**
 * @fileoverview Tests for PlatformLabelHandler
 * @author Development Team
 * @since 13.4.0
 */

import { PlatformLabelHandler } from './platform-label.handler';
import { PlatformLabelServiceSdk } from '../services/platform-label-service';
import { AuthConfig } from '../types/auth';
import { PlatformLabelServiceConfig } from '../types/platform-label';

// Mock the service
jest.mock('../services/platform-label-service');

describe('PlatformLabelHandler', () => {
  let handler: PlatformLabelHandler;
  let mockService: jest.Mocked<PlatformLabelServiceSdk>;
  let authConfig: AuthConfig;
  let serviceConfig: PlatformLabelServiceConfig;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup configs
    authConfig = {
      appId: 'test-app-id',
      appSecret: 'test-app-secret',
      userId: 'test-user-id',
    };

    serviceConfig = {
      baseUrl: 'https://api.polyv.net',
      timeout: 30000,
      debug: false,
    };

    // Create mock service
    mockService = {
      listViewerLabels: jest.fn(),
      createViewerLabel: jest.fn(),
      updateViewerLabel: jest.fn(),
      deleteViewerLabel: jest.fn(),
    } as any;

    // Mock service constructor
    (PlatformLabelServiceSdk as jest.MockedClass<typeof PlatformLabelServiceSdk>).mockImplementation(
      () => mockService
    );

    // Create handler instance
    handler = new PlatformLabelHandler(authConfig, serviceConfig);

    // Spy on console.log
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe('constructor', () => {
    it('should create PlatformLabelServiceSdk with correct config', () => {
      expect(PlatformLabelServiceSdk).toHaveBeenCalledWith(authConfig, serviceConfig);
    });
  });

  describe('listLabels', () => {
    it('should list labels and output in table format', async () => {
      // Arrange
      const mockLabels = [
        { labelId: 1, labelName: 'VIP', createdTime: '2024-01-01 00:00:00' },
        { labelId: 2, labelName: 'Staff', createdTime: '2024-01-02 00:00:00' },
      ];
      mockService.listViewerLabels.mockResolvedValue(mockLabels);

      // Act
      await handler.listLabels({ output: 'table' });

      // Assert
      expect(mockService.listViewerLabels).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should list labels and output in JSON format', async () => {
      // Arrange
      const mockLabels = [
        { labelId: 1, labelName: 'VIP', createdTime: '2024-01-01 00:00:00' },
        { labelId: 2, labelName: 'Staff', createdTime: '2024-01-02 00:00:00' },
      ];
      mockService.listViewerLabels.mockResolvedValue(mockLabels);

      // Act
      await handler.listLabels({ output: 'json' });

      // Assert
      expect(mockService.listViewerLabels).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith(JSON.stringify(mockLabels, null, 2));
    });

    it('should show empty state when no labels', async () => {
      // Arrange
      mockService.listViewerLabels.mockResolvedValue([]);

      // Act
      await handler.listLabels({ output: 'table' });

      // Assert
      expect(consoleLogSpy).toHaveBeenCalledWith('暂无标签数据');
    });

    it('should default to table output', async () => {
      // Arrange
      const mockLabels = [{ labelId: 1, labelName: 'VIP' }];
      mockService.listViewerLabels.mockResolvedValue(mockLabels);

      // Act
      await handler.listLabels({ output: 'table' });

      // Assert
      expect(mockService.listViewerLabels).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should validate output format', async () => {
      // Act & Assert
      await expect(
        handler.listLabels({ output: 'invalid' as any })
      ).rejects.toThrow('output 格式必须是 table 或 json');
    });

    it('should handle API errors gracefully', async () => {
      // Arrange
      const error = new Error('API Error');
      mockService.listViewerLabels.mockRejectedValue(error);

      // Act & Assert
      await expect(handler.listLabels({ output: 'table' })).rejects.toThrow('API Error');
    });
  });

  describe('createLabel', () => {
    it('should create label and output in table format', async () => {
      // Arrange
      const mockLabel = { labelId: 1, labelName: 'VIP', createdTime: '2024-01-01 00:00:00' };
      mockService.createViewerLabel.mockResolvedValue(mockLabel);

      // Act
      await handler.createLabel({ labelName: 'VIP', output: 'table' });

      // Assert
      expect(mockService.createViewerLabel).toHaveBeenCalledWith({ labelName: 'VIP' });
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should create label and output in JSON format', async () => {
      // Arrange
      const mockLabel = { labelId: 1, labelName: 'VIP', createdTime: '2024-01-01 00:00:00' };
      mockService.createViewerLabel.mockResolvedValue(mockLabel);

      // Act
      await handler.createLabel({ labelName: 'VIP', output: 'json' });

      // Assert
      expect(mockService.createViewerLabel).toHaveBeenCalledWith({ labelName: 'VIP' });
      expect(consoleLogSpy).toHaveBeenCalledWith(JSON.stringify(mockLabel, null, 2));
    });

    it('should validate labelName is required', async () => {
      // Act & Assert
      await expect(
        handler.createLabel({ labelName: '', output: 'table' })
      ).rejects.toThrow('labelName 不能为空');
    });

    it('should validate labelName is not empty string', async () => {
      // Act & Assert
      await expect(
        handler.createLabel({ labelName: '   ', output: 'table' })
      ).rejects.toThrow('labelName 不能为空');
    });

    it('should validate output format', async () => {
      // Act & Assert
      await expect(
        handler.createLabel({ labelName: 'VIP', output: 'invalid' as any })
      ).rejects.toThrow('output 格式必须是 table 或 json');
    });

    it('should handle API errors gracefully', async () => {
      // Arrange
      const error = new Error('API Error');
      mockService.createViewerLabel.mockRejectedValue(error);

      // Act & Assert
      await expect(
        handler.createLabel({ labelName: 'VIP', output: 'table' })
      ).rejects.toThrow('API Error');
    });
  });

  describe('updateLabel', () => {
    it('should update label and output in table format', async () => {
      // Arrange
      mockService.updateViewerLabel.mockResolvedValue(undefined);

      // Act
      await handler.updateLabel({ labelId: 1, labelName: 'VIP Updated', output: 'table' });

      // Assert
      expect(mockService.updateViewerLabel).toHaveBeenCalledWith({
        labelId: 1,
        labelName: 'VIP Updated',
      });
      expect(consoleLogSpy).toHaveBeenCalledWith('标签更新成功');
    });

    it('should update label and output in JSON format', async () => {
      // Arrange
      mockService.updateViewerLabel.mockResolvedValue(undefined);

      // Act
      await handler.updateLabel({ labelId: 1, labelName: 'VIP Updated', output: 'json' });

      // Assert
      expect(mockService.updateViewerLabel).toHaveBeenCalledWith({
        labelId: 1,
        labelName: 'VIP Updated',
      });
      expect(consoleLogSpy).toHaveBeenCalledWith(JSON.stringify({ success: true }, null, 2));
    });

    it('should validate labelId is required', async () => {
      // Act & Assert
      await expect(
        handler.updateLabel({ labelId: undefined as any, labelName: 'VIP', output: 'table' })
      ).rejects.toThrow('labelId 必须是正整数');
    });

    it('should validate labelName is required', async () => {
      // Act & Assert
      await expect(
        handler.updateLabel({ labelId: 1, labelName: '', output: 'table' })
      ).rejects.toThrow('labelName 不能为空');
    });

    it('should validate labelId is positive', async () => {
      // Act & Assert
      await expect(
        handler.updateLabel({ labelId: -1, labelName: 'VIP', output: 'table' })
      ).rejects.toThrow('labelId 必须是正整数');
    });

    it('should validate output format', async () => {
      // Act & Assert
      await expect(
        handler.updateLabel({ labelId: 1, labelName: 'VIP', output: 'invalid' as any })
      ).rejects.toThrow('output 格式必须是 table 或 json');
    });

    it('should handle API errors gracefully', async () => {
      // Arrange
      const error = new Error('API Error');
      mockService.updateViewerLabel.mockRejectedValue(error);

      // Act & Assert
      await expect(
        handler.updateLabel({ labelId: 1, labelName: 'VIP', output: 'table' })
      ).rejects.toThrow('API Error');
    });
  });

  describe('deleteLabel', () => {
    it('should delete label and output success message in table format', async () => {
      // Arrange
      mockService.deleteViewerLabel.mockResolvedValue(undefined);

      // Act
      await handler.deleteLabel({ labelId: 1, output: 'table' });

      // Assert
      expect(mockService.deleteViewerLabel).toHaveBeenCalledWith({ labelId: 1 });
      expect(consoleLogSpy).toHaveBeenCalledWith('标签删除成功');
    });

    it('should delete label and output in JSON format', async () => {
      // Arrange
      mockService.deleteViewerLabel.mockResolvedValue(undefined);

      // Act
      await handler.deleteLabel({ labelId: 1, output: 'json' });

      // Assert
      expect(mockService.deleteViewerLabel).toHaveBeenCalledWith({ labelId: 1 });
      expect(consoleLogSpy).toHaveBeenCalledWith(JSON.stringify({ success: true }, null, 2));
    });

    it('should validate labelId is required', async () => {
      // Act & Assert
      await expect(
        handler.deleteLabel({ labelId: undefined as any, output: 'table' })
      ).rejects.toThrow('labelId 必须是正整数');
    });

    it('should validate labelId is positive', async () => {
      // Act & Assert
      await expect(
        handler.deleteLabel({ labelId: -1, output: 'table' })
      ).rejects.toThrow('labelId 必须是正整数');
    });

    it('should validate output format', async () => {
      // Act & Assert
      await expect(
        handler.deleteLabel({ labelId: 1, output: 'invalid' as any })
      ).rejects.toThrow('output 格式必须是 table 或 json');
    });

    it('should handle API errors gracefully', async () => {
      // Arrange
      const error = new Error('API Error');
      mockService.deleteViewerLabel.mockRejectedValue(error);

      // Act & Assert
      await expect(handler.deleteLabel({ labelId: 1, output: 'table' })).rejects.toThrow(
        'API Error'
      );
    });
  });
});
