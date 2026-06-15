/**
 * @fileoverview Unit tests for CardPushHandler
 * @author Development Team
 * @since 14.2.0
 */

import { CardPushHandler, CardPushListOptions, CardPushCreateOptions, CardPushUpdateOptions, CardPushPushOptions, CardPushCancelOptions, CardPushDeleteOptions } from './card-push.handler';
import { AuthConfig } from '../types/auth';
import { PolyVValidationError } from '../utils/errors';
import { CardPushServiceSdk } from '../services/card-push-service';

// Mock the CardPushServiceSdk module
const mockCardPushService = {
  listCardPushes: jest.fn(),
  createCardPush: jest.fn(),
  updateCardPush: jest.fn(),
  pushCard: jest.fn(),
  cancelPush: jest.fn(),
  deleteCardPush: jest.fn(),
};

jest.mock('../services/card-push-service', () => ({
  CardPushServiceSdk: jest.fn(() => mockCardPushService),
}));

// Mock console methods to suppress output during tests
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});

describe('CardPushHandler', () => {
  let cardPushHandler: CardPushHandler;
  let mockAuthConfig: AuthConfig;
  let mockServiceConfig: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Ensure console methods are properly mocked and silent
    mockConsoleLog.mockImplementation(() => {});
    mockConsoleError.mockImplementation(() => {});
    mockConsoleWarn.mockImplementation(() => {});

    // Mock configs
    mockAuthConfig = {
      appId: 'test-app-id',
      appSecret: 'test-app-secret',
    };

    mockServiceConfig = {
      baseUrl: 'https://api.polyv.net',
      timeout: 30000,
      debug: false,
    };

    // Create handler instance
    cardPushHandler = new CardPushHandler(mockAuthConfig, mockServiceConfig);
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
    mockConsoleWarn.mockRestore();
  });

  // ========================================
  // AC1: listCardPushes - List card push configs
  // ========================================
  describe('listCardPushes', () => {
    const mockCardPushes = [
      {
        id: 123,
        channelId: 3151318,
        title: 'Test Card 1',
        cardType: 'common',
        imageType: 'giftbox',
        duration: 10,
        link: 'https://example.com',
        pushStatus: 'N',
        enterEnabled: 'Y',
        showCondition: 'PUSH',
        linkEnabled: 'Y',
        createdTime: 1616384611000,
      },
      {
        id: 456,
        channelId: 3151318,
        title: 'Test Card 2',
        cardType: 'qrCode',
        imageType: 'redpack',
        duration: 20,
        link: 'https://example.org',
        pushStatus: 'Y',
        enterEnabled: 'Y',
        showCondition: 'WATCH',
        linkEnabled: 'N',
        createdTime: 1616384156000,
      },
    ];

    const defaultOptions: CardPushListOptions = {
      channelId: '3151318',
      output: 'table',
    };

    it('[P0][HDL-001] should create CardPushServiceSdk with correct configuration', () => {
      expect(CardPushServiceSdk).toHaveBeenCalledWith(mockAuthConfig, mockServiceConfig);
    });

    it('[P0][HDL-002] should list card push configs with channelId', async () => {
      mockCardPushService.listCardPushes.mockResolvedValueOnce(mockCardPushes);

      await cardPushHandler.listCardPushes(defaultOptions);

      expect(mockCardPushService.listCardPushes).toHaveBeenCalledWith('3151318');
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('[P0][HDL-003] should output card pushes in JSON format', async () => {
      mockCardPushService.listCardPushes.mockResolvedValueOnce(mockCardPushes);

      const jsonOptions: CardPushListOptions = { channelId: '3151318', output: 'json' };
      await cardPushHandler.listCardPushes(jsonOptions);

      expect(mockCardPushService.listCardPushes).toHaveBeenCalled();
      // Verify JSON output was generated
      const logCalls = mockConsoleLog.mock.calls;
      const jsonOutputCall = logCalls.find((call: any[]) =>
        typeof call[0] === 'string' && call[0].includes('"id"')
      );
      expect(jsonOutputCall).toBeDefined();
    });

    it('[P0][HDL-004] should output card pushes in table format', async () => {
      mockCardPushService.listCardPushes.mockResolvedValueOnce(mockCardPushes);

      await cardPushHandler.listCardPushes(defaultOptions);

      expect(mockCardPushService.listCardPushes).toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('[P0][HDL-005] should handle API errors gracefully', async () => {
      const apiError = new Error('API error: Authentication failed');
      mockCardPushService.listCardPushes.mockRejectedValueOnce(apiError);

      await expect(cardPushHandler.listCardPushes(defaultOptions)).rejects.toThrow();
    });

    it('[P0][HDL-006] should display empty state when no card pushes exist', async () => {
      mockCardPushService.listCardPushes.mockResolvedValueOnce([]);

      await cardPushHandler.listCardPushes(defaultOptions);

      expect(mockCardPushService.listCardPushes).toHaveBeenCalledWith('3151318');
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('[P1] should validate channelId is required', async () => {
      const invalidOptions: CardPushListOptions = {
        channelId: '',
        output: 'table',
      };

      await expect(cardPushHandler.listCardPushes(invalidOptions))
        .rejects
        .toThrow(PolyVValidationError);
    });

    it('[P1] should validate output format must be table or json', async () => {
      const invalidOptions: CardPushListOptions = {
        channelId: '3151318',
        output: 'xml' as any,
      };

      await expect(cardPushHandler.listCardPushes(invalidOptions))
        .rejects
        .toThrow(PolyVValidationError);
    });

    it('[P1] should default to table output', async () => {
      mockCardPushService.listCardPushes.mockResolvedValueOnce(mockCardPushes);

      const optionsWithoutOutput: CardPushListOptions = {
        channelId: '3151318',
        output: 'table',
      };

      await cardPushHandler.listCardPushes(optionsWithoutOutput);

      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('[P1] should display required fields in table output', async () => {
      mockCardPushService.listCardPushes.mockResolvedValueOnce(mockCardPushes);

      await cardPushHandler.listCardPushes(defaultOptions);

      const logOutput = mockConsoleLog.mock.calls.flat().join(' ');
      expect(logOutput).toMatch(/卡片|id|title|pushStatus|showCondition|createdTime/i);
    });
  });

  // ========================================
  // AC2: createCardPush - Create card push config
  // ========================================
  describe('createCardPush', () => {
    const mockCreatedCardPush = {
      id: 123,
      title: 'New Card',
    };

    const validOptions: CardPushCreateOptions = {
      channelId: '3151318',
      imageType: 'giftbox',
      title: 'New Card',
      link: 'https://example.com',
      duration: 10,
      showCondition: 'PUSH',
      output: 'table',
    };

    it('[P0][HDL-007] should create card push with required params', async () => {
      mockCardPushService.createCardPush.mockResolvedValueOnce(mockCreatedCardPush);

      await cardPushHandler.createCardPush(validOptions);

      expect(mockCardPushService.createCardPush).toHaveBeenCalledWith({
        channelId: '3151318',
        imageType: 'giftbox',
        title: 'New Card',
        link: 'https://example.com',
        duration: 10,
        showCondition: 'PUSH',
      });
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('[P0][HDL-008] should validate imageType enum values', async () => {
      const invalidOptions: CardPushCreateOptions = {
        ...validOptions,
        imageType: 'invalid' as any,
      };

      await expect(cardPushHandler.createCardPush(invalidOptions))
        .rejects
        .toThrow(PolyVValidationError);
    });

    it('[P0][HDL-009] should validate title max 16 chars', async () => {
      const invalidOptions: CardPushCreateOptions = {
        ...validOptions,
        title: 'This title is way too long and exceeds 16 chars',
      };

      await expect(cardPushHandler.createCardPush(invalidOptions))
        .rejects
        .toThrow(PolyVValidationError);
    });

    it('[P0][HDL-010] should validate link format (http/https)', async () => {
      const invalidOptions: CardPushCreateOptions = {
        ...validOptions,
        link: 'invalid-url',
      };

      await expect(cardPushHandler.createCardPush(invalidOptions))
        .rejects
        .toThrow(PolyVValidationError);
    });

    it('[P0][HDL-011] should validate duration enum values (0,5,10,20,30)', async () => {
      const invalidOptions: CardPushCreateOptions = {
        ...validOptions,
        duration: 15 as any,
      };

      await expect(cardPushHandler.createCardPush(invalidOptions))
        .rejects
        .toThrow(PolyVValidationError);
    });

    it('[P0][HDL-012] should validate showCondition enum (PUSH/WATCH)', async () => {
      const invalidOptions: CardPushCreateOptions = {
        ...validOptions,
        showCondition: 'INVALID' as any,
      };

      await expect(cardPushHandler.createCardPush(invalidOptions))
        .rejects
        .toThrow(PolyVValidationError);
    });

    it('[P0][HDL-013] should validate channelId is required', async () => {
      const invalidOptions: CardPushCreateOptions = {
        ...validOptions,
        channelId: '',
      };

      await expect(cardPushHandler.createCardPush(invalidOptions))
        .rejects
        .toThrow(PolyVValidationError);

      expect(mockCardPushService.createCardPush).not.toHaveBeenCalled();
    });

    it('[P0][HDL-014] should validate title is required', async () => {
      const invalidOptions: CardPushCreateOptions = {
        ...validOptions,
        title: '',
      };

      await expect(cardPushHandler.createCardPush(invalidOptions))
        .rejects
        .toThrow(PolyVValidationError);
    });

    it('[P1] should include optional params when provided', async () => {
      mockCardPushService.createCardPush.mockResolvedValueOnce(mockCreatedCardPush);

      const optionsWithOptional: CardPushCreateOptions = {
        ...validOptions,
        showCondition: 'WATCH',
        cardType: 'qrCode',
        conditionValue: 30,
        conditionUnit: 'SECONDS',
        countdownMsg: 'Coming',
        enterEnabled: 'N',
        linkEnabled: 'Y',
        redirectType: 'tab',
      };

      await cardPushHandler.createCardPush(optionsWithOptional);

      expect(mockCardPushService.createCardPush).toHaveBeenCalledWith(
        expect.objectContaining({
          cardType: 'qrCode',
          conditionValue: 30,
          conditionUnit: 'SECONDS',
          countdownMsg: 'Coming',
          enterEnabled: 'N',
          linkEnabled: 'Y',
          redirectType: 'tab',
        })
      );
    });

    it('[P1] should validate conditionUnit enum (SECONDS/MINUTES)', async () => {
      const invalidOptions: CardPushCreateOptions = {
        ...validOptions,
        showCondition: 'WATCH',
        conditionUnit: 'HOURS' as any,
        conditionValue: 1,
      };

      await expect(cardPushHandler.createCardPush(invalidOptions))
        .rejects
        .toThrow(PolyVValidationError);
    });

    it('[P1] should validate countdownMsg max 8 chars', async () => {
      const invalidOptions: CardPushCreateOptions = {
        ...validOptions,
        showCondition: 'WATCH',
        conditionValue: 30,
        conditionUnit: 'SECONDS',
        countdownMsg: 'Too long message',
      };

      await expect(cardPushHandler.createCardPush(invalidOptions))
        .rejects
        .toThrow(PolyVValidationError);
    });

    it('[P1] should output created card push info', async () => {
      mockCardPushService.createCardPush.mockResolvedValueOnce(mockCreatedCardPush);

      const jsonOptions: CardPushCreateOptions = {
        ...validOptions,
        output: 'json',
      };
      await cardPushHandler.createCardPush(jsonOptions);

      expect(mockCardPushService.createCardPush).toHaveBeenCalled();
      const logCalls = mockConsoleLog.mock.calls;
      const jsonOutputCall = logCalls.find((call: any[]) =>
        typeof call[0] === 'string' && call[0].includes('"id"')
      );
      expect(jsonOutputCall).toBeDefined();
    });

    it('[P1] should handle API errors gracefully', async () => {
      const apiError = new Error('API error: Create failed');
      mockCardPushService.createCardPush.mockRejectedValueOnce(apiError);

      await expect(cardPushHandler.createCardPush(validOptions)).rejects.toThrow();
    });
  });

  // ========================================
  // AC3: updateCardPush - Update card push config
  // ========================================
  describe('updateCardPush', () => {
    const mockUpdatedCardPush = {
      id: 123,
      title: 'Updated Card',
    };

    const validOptions: CardPushUpdateOptions = {
      channelId: '3151318',
      cardPushId: '123',
      title: 'Updated Card',
      output: 'table',
    };

    it('[P0][HDL-015] should update card push with cardPushId', async () => {
      mockCardPushService.updateCardPush.mockResolvedValueOnce(mockUpdatedCardPush);

      await cardPushHandler.updateCardPush(validOptions);

      expect(mockCardPushService.updateCardPush).toHaveBeenCalledWith({
        channelId: '3151318',
        cardPushId: '123',
        title: 'Updated Card',
      });
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('[P0][HDL-016] should validate cardPushId is required', async () => {
      const invalidOptions: CardPushUpdateOptions = {
        ...validOptions,
        cardPushId: '',
      };

      await expect(cardPushHandler.updateCardPush(invalidOptions))
        .rejects
        .toThrow(PolyVValidationError);

      expect(mockCardPushService.updateCardPush).not.toHaveBeenCalled();
    });

    it('[P1] should validate channelId is required', async () => {
      const invalidOptions: CardPushUpdateOptions = {
        ...validOptions,
        channelId: '',
      };

      await expect(cardPushHandler.updateCardPush(invalidOptions))
        .rejects
        .toThrow(PolyVValidationError);
    });

    it('[P1] should validate title max 16 chars on update', async () => {
      const invalidOptions: CardPushUpdateOptions = {
        ...validOptions,
        title: 'This title is way too long and exceeds 16 chars',
      };

      await expect(cardPushHandler.updateCardPush(invalidOptions))
        .rejects
        .toThrow(PolyVValidationError);
    });

    it('[P1] should output updated card push info', async () => {
      mockCardPushService.updateCardPush.mockResolvedValueOnce(mockUpdatedCardPush);

      const jsonOptions: CardPushUpdateOptions = {
        ...validOptions,
        output: 'json',
      };
      await cardPushHandler.updateCardPush(jsonOptions);

      expect(mockCardPushService.updateCardPush).toHaveBeenCalled();
    });

    it('[P1] should handle API errors gracefully', async () => {
      const apiError = new Error('API error: Update failed');
      mockCardPushService.updateCardPush.mockRejectedValueOnce(apiError);

      await expect(cardPushHandler.updateCardPush(validOptions)).rejects.toThrow();
    });
  });

  // ========================================
  // AC4: pushCard - Push card to viewers
  // ========================================
  describe('pushCard', () => {
    const validOptions: CardPushPushOptions = {
      channelId: '3151318',
      cardPushId: '123',
      output: 'table',
    };

    it('[P0][HDL-017] should push card with cardPushId', async () => {
      mockCardPushService.pushCard.mockResolvedValueOnce(undefined);

      await cardPushHandler.pushCard(validOptions);

      expect(mockCardPushService.pushCard).toHaveBeenCalledWith({
        channelId: '3151318',
        cardPushId: '123',
      });
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('[P0][HDL-018] should validate cardPushId is required for push', async () => {
      const invalidOptions: CardPushPushOptions = {
        ...validOptions,
        cardPushId: '',
      };

      await expect(cardPushHandler.pushCard(invalidOptions))
        .rejects
        .toThrow(PolyVValidationError);

      expect(mockCardPushService.pushCard).not.toHaveBeenCalled();
    });

    it('[P1] should validate channelId is required', async () => {
      const invalidOptions: CardPushPushOptions = {
        ...validOptions,
        channelId: '',
      };

      await expect(cardPushHandler.pushCard(invalidOptions))
        .rejects
        .toThrow(PolyVValidationError);
    });

    it('[P1] should handle API errors gracefully', async () => {
      const apiError = new Error('API error: Push failed');
      mockCardPushService.pushCard.mockRejectedValueOnce(apiError);

      await expect(cardPushHandler.pushCard(validOptions)).rejects.toThrow();
    });

    it('[P1] should output success message', async () => {
      mockCardPushService.pushCard.mockResolvedValueOnce(undefined);

      await cardPushHandler.pushCard(validOptions);

      expect(mockConsoleLog).toHaveBeenCalled();
    });
  });

  // ========================================
  // AC5: cancelPush - Cancel card push
  // ========================================
  describe('cancelPush', () => {
    const validOptions: CardPushCancelOptions = {
      channelId: '3151318',
      cardPushId: '123',
      output: 'table',
    };

    it('[P0][HDL-019] should cancel push with cardPushId', async () => {
      mockCardPushService.cancelPush.mockResolvedValueOnce(undefined);

      await cardPushHandler.cancelPush(validOptions);

      expect(mockCardPushService.cancelPush).toHaveBeenCalledWith({
        channelId: '3151318',
        cardPushId: '123',
      });
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('[P0][HDL-020] should validate cardPushId is required for cancel', async () => {
      const invalidOptions: CardPushCancelOptions = {
        ...validOptions,
        cardPushId: '',
      };

      await expect(cardPushHandler.cancelPush(invalidOptions))
        .rejects
        .toThrow(PolyVValidationError);

      expect(mockCardPushService.cancelPush).not.toHaveBeenCalled();
    });

    it('[P1] should handle API errors gracefully', async () => {
      const apiError = new Error('API error: Cancel failed');
      mockCardPushService.cancelPush.mockRejectedValueOnce(apiError);

      await expect(cardPushHandler.cancelPush(validOptions)).rejects.toThrow();
    });
  });

  // ========================================
  // AC6: deleteCardPush - Delete card push config
  // ========================================
  describe('deleteCardPush', () => {
    const validOptions: CardPushDeleteOptions = {
      channelId: '3151318',
      cardPushId: '123',
      output: 'table',
    };

    it('[P0][HDL-021] should delete card push with cardPushId', async () => {
      mockCardPushService.deleteCardPush.mockResolvedValueOnce(undefined);

      await cardPushHandler.deleteCardPush(validOptions);

      expect(mockCardPushService.deleteCardPush).toHaveBeenCalledWith({
        channelId: '3151318',
        cardPushId: '123',
      });
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('[P0][HDL-022] should validate cardPushId is required for delete', async () => {
      const invalidOptions: CardPushDeleteOptions = {
        ...validOptions,
        cardPushId: '',
      };

      await expect(cardPushHandler.deleteCardPush(invalidOptions))
        .rejects
        .toThrow(PolyVValidationError);

      expect(mockCardPushService.deleteCardPush).not.toHaveBeenCalled();
    });

    it('[P1] should handle API errors gracefully', async () => {
      const apiError = new Error('API error: Delete failed');
      mockCardPushService.deleteCardPush.mockRejectedValueOnce(apiError);

      await expect(cardPushHandler.deleteCardPush(validOptions)).rejects.toThrow();
    });
  });

  // ========================================
  // AC8: Error handling (HDL-023 to HDL-030)
  // ========================================
  describe('Error handling', () => {
    const defaultOptions: CardPushListOptions = {
      channelId: '3151318',
      output: 'table',
    };

    it('[P1][HDL-023] should show friendly error for missing channelId', async () => {
      const invalidOptions: CardPushListOptions = {
        channelId: '',
        output: 'table',
      };

      try {
        await cardPushHandler.listCardPushes(invalidOptions);
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PolyVValidationError);
        const validationError = error as PolyVValidationError;
        expect(validationError.message).toMatch(/channelId|频道.*ID/i);
      }
    });

    it('[P1][HDL-024] should show friendly error for missing cardPushId', async () => {
      const invalidOptions: CardPushUpdateOptions = {
        channelId: '3151318',
        cardPushId: '',
        output: 'table',
      };

      try {
        await cardPushHandler.updateCardPush(invalidOptions);
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PolyVValidationError);
        const validationError = error as PolyVValidationError;
        expect(validationError.message).toMatch(/cardPushId|卡片.*ID/i);
      }
    });

    it('[P1][HDL-025] should show friendly error for invalid imageType', async () => {
      const invalidOptions: CardPushCreateOptions = {
        channelId: '3151318',
        imageType: 'invalid' as any,
        title: 'Test',
        link: 'https://example.com',
        duration: 10,
        showCondition: 'PUSH',
        output: 'table',
      };

      try {
        await cardPushHandler.createCardPush(invalidOptions);
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PolyVValidationError);
        const validationError = error as PolyVValidationError;
        expect(validationError.message).toMatch(/imageType|图片.*类型/i);
      }
    });

    it('[P1][HDL-026] should show friendly error for title too long', async () => {
      const invalidOptions: CardPushCreateOptions = {
        channelId: '3151318',
        imageType: 'giftbox',
        title: 'This title is way too long and exceeds 16 chars',
        link: 'https://example.com',
        duration: 10,
        showCondition: 'PUSH',
        output: 'table',
      };

      try {
        await cardPushHandler.createCardPush(invalidOptions);
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(PolyVValidationError);
        const validationError = error as PolyVValidationError;
        expect(validationError.message).toMatch(/title|标题|16|字符/i);
      }
    });

    it('[P1][HDL-027] should handle API 401 error', async () => {
      const authError = new Error('Authentication failed');
      mockCardPushService.listCardPushes.mockRejectedValueOnce(authError);

      await expect(cardPushHandler.listCardPushes(defaultOptions))
        .rejects
        .toThrow();
    });

    it('[P1][HDL-028] should handle API 403 error', async () => {
      const permissionError = new Error('Permission denied');
      mockCardPushService.listCardPushes.mockRejectedValueOnce(permissionError);

      await expect(cardPushHandler.listCardPushes(defaultOptions))
        .rejects
        .toThrow();
    });

    it('[P1][HDL-029] should handle API 404 error (channel not found)', async () => {
      const notFoundError = new Error('Channel not found');
      mockCardPushService.listCardPushes.mockRejectedValueOnce(notFoundError);

      await expect(cardPushHandler.listCardPushes(defaultOptions))
        .rejects
        .toThrow();
    });

    it('[P1][HDL-030] should handle API 500 error', async () => {
      const serverError = new Error('Internal server error');
      mockCardPushService.listCardPushes.mockRejectedValueOnce(serverError);

      await expect(cardPushHandler.listCardPushes(defaultOptions))
        .rejects
        .toThrow();
    });
  });

  // ========================================
  // AC7: Table Output Format (HDL-031 to HDL-037)
  // ========================================
  describe('Table output format', () => {
    const mockCardPushes = [
      {
        id: 123,
        channelId: 3151318,
        title: 'Test Card',
        cardType: 'common',
        imageType: 'giftbox',
        duration: 10,
        link: 'https://example.com',
        pushStatus: 'N',
        enterEnabled: 'Y',
        showCondition: 'PUSH',
        linkEnabled: 'Y',
        createdTime: 1616384611000,
      },
    ];

    const defaultOptions: CardPushListOptions = {
      channelId: '3151318',
      output: 'table',
    };

    it('[P1][HDL-031] should display card pushes as formatted table', async () => {
      mockCardPushService.listCardPushes.mockResolvedValueOnce(mockCardPushes);

      await cardPushHandler.listCardPushes(defaultOptions);

      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('[P1][HDL-032] should show id column', async () => {
      mockCardPushService.listCardPushes.mockResolvedValueOnce(mockCardPushes);

      await cardPushHandler.listCardPushes(defaultOptions);

      const logOutput = mockConsoleLog.mock.calls.flat().join(' ');
      expect(logOutput).toMatch(/id|ID|卡片.*ID/i);
    });

    it('[P1][HDL-033] should show title column', async () => {
      mockCardPushService.listCardPushes.mockResolvedValueOnce(mockCardPushes);

      await cardPushHandler.listCardPushes(defaultOptions);

      const logOutput = mockConsoleLog.mock.calls.flat().join(' ');
      expect(logOutput).toMatch(/title|标题|卡片.*名/i);
    });

    it('[P1][HDL-034] should show pushStatus column', async () => {
      mockCardPushService.listCardPushes.mockResolvedValueOnce(mockCardPushes);

      await cardPushHandler.listCardPushes(defaultOptions);

      const logOutput = mockConsoleLog.mock.calls.flat().join(' ');
      expect(logOutput).toMatch(/pushStatus|推送.*状态|状态/i);
    });

    it('[P1][HDL-035] should show showCondition column', async () => {
      mockCardPushService.listCardPushes.mockResolvedValueOnce(mockCardPushes);

      await cardPushHandler.listCardPushes(defaultOptions);

      const logOutput = mockConsoleLog.mock.calls.flat().join(' ');
      expect(logOutput).toMatch(/showCondition|弹出.*方式|显示.*条件/i);
    });

    it('[P1][HDL-036] should show createdTime column', async () => {
      mockCardPushService.listCardPushes.mockResolvedValueOnce(mockCardPushes);

      await cardPushHandler.listCardPushes(defaultOptions);

      const logOutput = mockConsoleLog.mock.calls.flat().join(' ');
      expect(logOutput).toMatch(/createdTime|创建.*时间/i);
    });

    it('[P1][HDL-037] should show empty state message when no card pushes', async () => {
      mockCardPushService.listCardPushes.mockResolvedValueOnce([]);

      await cardPushHandler.listCardPushes(defaultOptions);

      const logOutput = mockConsoleLog.mock.calls.flat().join(' ');
      expect(logOutput).toMatch(/没有.*卡片|no.*card|empty|未找到/i);
    });
  });

  // ========================================
  // Output format validation (AC7)
  // ========================================
  describe('Output format validation', () => {
    it('[P0][HDL-038] should validate output must be table or json', async () => {
      const invalidOptions: CardPushListOptions = {
        channelId: '3151318',
        output: 'xml' as any,
      };

      await expect(cardPushHandler.listCardPushes(invalidOptions))
        .rejects
        .toThrow(PolyVValidationError);
    });

    it('[P0][HDL-039] should default to table output', async () => {
      mockCardPushService.listCardPushes.mockResolvedValueOnce([]);

      const optionsWithDefaultOutput: CardPushListOptions = {
        channelId: '3151318',
        output: 'table',
      };

      await cardPushHandler.listCardPushes(optionsWithDefaultOutput);

      expect(mockConsoleLog).toHaveBeenCalled();
    });
  });
});
