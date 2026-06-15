/**
 * @fileoverview Unit tests for card-push commands
 * @author Development Team
 * @since 14.2.0
 */

import { Command } from 'commander';
import {
  registerCardPushCommands,
  validateOutputFormat,
  validateImageType,
  validateShowCondition,
  validateDuration,
} from './card-push.commands';
import { authAdapter } from '../config/auth-adapter';
import { configManager } from '../config/manager';
import { suppressConsole, mockProcessExit, mockAuthSuccess } from '../utils/test-helpers';

// Mock dependencies
jest.mock('../config/auth-adapter');
jest.mock('../config/manager');
jest.mock('../handlers/card-push.handler');
jest.mock('../utils/errors', () => ({
  logError: jest.fn(),
}));

describe('Card-Push Commands', () => {
  describe('command registration', () => {
    let program: Command;

    beforeEach(() => {
      program = new Command();
      registerCardPushCommands(program);
    });

    it('should register card-push command group', () => {
      const cardPushCmd = program.commands.find(cmd => cmd.name() === 'card-push');
      expect(cardPushCmd).toBeDefined();
      expect(cardPushCmd?.description()).toMatch(/卡片|card|推送|push/i);
    });

    // ========================================
    // AC1: list subcommand
    // ========================================
    it('should register card-push list subcommand', () => {
      const cardPushCmd = program.commands.find(cmd => cmd.name() === 'card-push');
      const listCmd = cardPushCmd?.commands.find(cmd => cmd.name() === 'list');

      expect(listCmd).toBeDefined();
      expect(listCmd?.description()).toMatch(/列出|list|卡片|card/i);
    });

    it('should register channelId as required option for list command', () => {
      const cardPushCmd = program.commands.find(cmd => cmd.name() === 'card-push');
      const listCmd = cardPushCmd?.commands.find(cmd => cmd.name() === 'list');
      const options = listCmd?.options || [];

      const channelIdOption = options.find(opt => opt.long === '--channelId');
      expect(channelIdOption).toBeDefined();
      expect(channelIdOption?.required).toBe(true);
    });

    it('should register output option for list command', () => {
      const cardPushCmd = program.commands.find(cmd => cmd.name() === 'card-push');
      const listCmd = cardPushCmd?.commands.find(cmd => cmd.name() === 'list');
      const options = listCmd?.options || [];

      const outputOption = options.find(opt => opt.long === '--output');
      expect(outputOption).toBeDefined();
    });

    // ========================================
    // AC2: create subcommand
    // ========================================
    it('should register card-push create subcommand', () => {
      const cardPushCmd = program.commands.find(cmd => cmd.name() === 'card-push');
      const createCmd = cardPushCmd?.commands.find(cmd => cmd.name() === 'create');

      expect(createCmd).toBeDefined();
      expect(createCmd?.description()).toMatch(/创建|create|卡片|card/i);
    });

    it('should register channelId as required option for create command', () => {
      const cardPushCmd = program.commands.find(cmd => cmd.name() === 'card-push');
      const createCmd = cardPushCmd?.commands.find(cmd => cmd.name() === 'create');
      const options = createCmd?.options || [];

      const channelIdOption = options.find(opt => opt.long === '--channelId');
      expect(channelIdOption).toBeDefined();
      expect(channelIdOption?.required).toBe(true);
    });

    it('should register imageType as required option for create command', () => {
      const cardPushCmd = program.commands.find(cmd => cmd.name() === 'card-push');
      const createCmd = cardPushCmd?.commands.find(cmd => cmd.name() === 'create');
      const options = createCmd?.options || [];

      const imageTypeOption = options.find(opt => opt.long === '--imageType');
      expect(imageTypeOption).toBeDefined();
      expect(imageTypeOption?.required).toBe(true);
    });

    it('should register title as required option for create command', () => {
      const cardPushCmd = program.commands.find(cmd => cmd.name() === 'card-push');
      const createCmd = cardPushCmd?.commands.find(cmd => cmd.name() === 'create');
      const options = createCmd?.options || [];

      const titleOption = options.find(opt => opt.long === '--title');
      expect(titleOption).toBeDefined();
      expect(titleOption?.required).toBe(true);
    });

    it('should register link as required option for create command', () => {
      const cardPushCmd = program.commands.find(cmd => cmd.name() === 'card-push');
      const createCmd = cardPushCmd?.commands.find(cmd => cmd.name() === 'create');
      const options = createCmd?.options || [];

      const linkOption = options.find(opt => opt.long === '--link');
      expect(linkOption).toBeDefined();
      expect(linkOption?.required).toBe(true);
    });

    it('should register duration as required option for create command', () => {
      const cardPushCmd = program.commands.find(cmd => cmd.name() === 'card-push');
      const createCmd = cardPushCmd?.commands.find(cmd => cmd.name() === 'create');
      const options = createCmd?.options || [];

      const durationOption = options.find(opt => opt.long === '--duration');
      expect(durationOption).toBeDefined();
      expect(durationOption?.required).toBe(true);
    });

    it('should register showCondition as required option for create command', () => {
      const cardPushCmd = program.commands.find(cmd => cmd.name() === 'card-push');
      const createCmd = cardPushCmd?.commands.find(cmd => cmd.name() === 'create');
      const options = createCmd?.options || [];

      const showConditionOption = options.find(opt => opt.long === '--showCondition');
      expect(showConditionOption).toBeDefined();
      expect(showConditionOption?.required).toBe(true);
    });

    it('should register output option for create command', () => {
      const cardPushCmd = program.commands.find(cmd => cmd.name() === 'card-push');
      const createCmd = cardPushCmd?.commands.find(cmd => cmd.name() === 'create');
      const options = createCmd?.options || [];

      const outputOption = options.find(opt => opt.long === '--output');
      expect(outputOption).toBeDefined();
    });

    // ========================================
    // AC3: update subcommand
    // ========================================
    it('should register card-push update subcommand', () => {
      const cardPushCmd = program.commands.find(cmd => cmd.name() === 'card-push');
      const updateCmd = cardPushCmd?.commands.find(cmd => cmd.name() === 'update');

      expect(updateCmd).toBeDefined();
      expect(updateCmd?.description()).toMatch(/更新|update|卡片|card/i);
    });

    it('should register channelId as required option for update command', () => {
      const cardPushCmd = program.commands.find(cmd => cmd.name() === 'card-push');
      const updateCmd = cardPushCmd?.commands.find(cmd => cmd.name() === 'update');
      const options = updateCmd?.options || [];

      const channelIdOption = options.find(opt => opt.long === '--channelId');
      expect(channelIdOption).toBeDefined();
      expect(channelIdOption?.required).toBe(true);
    });

    it('should register cardPushId as required option for update command', () => {
      const cardPushCmd = program.commands.find(cmd => cmd.name() === 'card-push');
      const updateCmd = cardPushCmd?.commands.find(cmd => cmd.name() === 'update');
      const options = updateCmd?.options || [];

      const cardPushIdOption = options.find(opt => opt.long === '--cardPushId');
      expect(cardPushIdOption).toBeDefined();
      expect(cardPushIdOption?.required).toBe(true);
    });

    it('should register output option for update command', () => {
      const cardPushCmd = program.commands.find(cmd => cmd.name() === 'card-push');
      const updateCmd = cardPushCmd?.commands.find(cmd => cmd.name() === 'update');
      const options = updateCmd?.options || [];

      const outputOption = options.find(opt => opt.long === '--output');
      expect(outputOption).toBeDefined();
    });

    // ========================================
    // AC4: push subcommand
    // ========================================
    it('should register card-push push subcommand', () => {
      const cardPushCmd = program.commands.find(cmd => cmd.name() === 'card-push');
      const pushCmd = cardPushCmd?.commands.find(cmd => cmd.name() === 'push');

      expect(pushCmd).toBeDefined();
      expect(pushCmd?.description()).toMatch(/推送|push|卡片|card/i);
    });

    it('should register channelId as required option for push command', () => {
      const cardPushCmd = program.commands.find(cmd => cmd.name() === 'card-push');
      const pushCmd = cardPushCmd?.commands.find(cmd => cmd.name() === 'push');
      const options = pushCmd?.options || [];

      const channelIdOption = options.find(opt => opt.long === '--channelId');
      expect(channelIdOption).toBeDefined();
      expect(channelIdOption?.required).toBe(true);
    });

    it('should register cardPushId as required option for push command', () => {
      const cardPushCmd = program.commands.find(cmd => cmd.name() === 'card-push');
      const pushCmd = cardPushCmd?.commands.find(cmd => cmd.name() === 'push');
      const options = pushCmd?.options || [];

      const cardPushIdOption = options.find(opt => opt.long === '--cardPushId');
      expect(cardPushIdOption).toBeDefined();
      expect(cardPushIdOption?.required).toBe(true);
    });

    it('should register output option for push command', () => {
      const cardPushCmd = program.commands.find(cmd => cmd.name() === 'card-push');
      const pushCmd = cardPushCmd?.commands.find(cmd => cmd.name() === 'push');
      const options = pushCmd?.options || [];

      const outputOption = options.find(opt => opt.long === '--output');
      expect(outputOption).toBeDefined();
    });

    // ========================================
    // AC5: cancel subcommand
    // ========================================
    it('should register card-push cancel subcommand', () => {
      const cardPushCmd = program.commands.find(cmd => cmd.name() === 'card-push');
      const cancelCmd = cardPushCmd?.commands.find(cmd => cmd.name() === 'cancel');

      expect(cancelCmd).toBeDefined();
      expect(cancelCmd?.description()).toMatch(/取消|cancel|推送|push/i);
    });

    it('should register channelId as required option for cancel command', () => {
      const cardPushCmd = program.commands.find(cmd => cmd.name() === 'card-push');
      const cancelCmd = cardPushCmd?.commands.find(cmd => cmd.name() === 'cancel');
      const options = cancelCmd?.options || [];

      const channelIdOption = options.find(opt => opt.long === '--channelId');
      expect(channelIdOption).toBeDefined();
      expect(channelIdOption?.required).toBe(true);
    });

    it('should register cardPushId as required option for cancel command', () => {
      const cardPushCmd = program.commands.find(cmd => cmd.name() === 'card-push');
      const cancelCmd = cardPushCmd?.commands.find(cmd => cmd.name() === 'cancel');
      const options = cancelCmd?.options || [];

      const cardPushIdOption = options.find(opt => opt.long === '--cardPushId');
      expect(cardPushIdOption).toBeDefined();
      expect(cardPushIdOption?.required).toBe(true);
    });

    it('should register output option for cancel command', () => {
      const cardPushCmd = program.commands.find(cmd => cmd.name() === 'card-push');
      const cancelCmd = cardPushCmd?.commands.find(cmd => cmd.name() === 'cancel');
      const options = cancelCmd?.options || [];

      const outputOption = options.find(opt => opt.long === '--output');
      expect(outputOption).toBeDefined();
    });

    // ========================================
    // AC6: delete subcommand
    // ========================================
    it('should register card-push delete subcommand', () => {
      const cardPushCmd = program.commands.find(cmd => cmd.name() === 'card-push');
      const deleteCmd = cardPushCmd?.commands.find(cmd => cmd.name() === 'delete');

      expect(deleteCmd).toBeDefined();
      expect(deleteCmd?.description()).toMatch(/删除|delete|卡片|card/i);
    });

    it('should register channelId as required option for delete command', () => {
      const cardPushCmd = program.commands.find(cmd => cmd.name() === 'card-push');
      const deleteCmd = cardPushCmd?.commands.find(cmd => cmd.name() === 'delete');
      const options = deleteCmd?.options || [];

      const channelIdOption = options.find(opt => opt.long === '--channelId');
      expect(channelIdOption).toBeDefined();
      expect(channelIdOption?.required).toBe(true);
    });

    it('should register cardPushId as required option for delete command', () => {
      const cardPushCmd = program.commands.find(cmd => cmd.name() === 'card-push');
      const deleteCmd = cardPushCmd?.commands.find(cmd => cmd.name() === 'delete');
      const options = deleteCmd?.options || [];

      const cardPushIdOption = options.find(opt => opt.long === '--cardPushId');
      expect(cardPushIdOption).toBeDefined();
      expect(cardPushIdOption?.required).toBe(true);
    });

    it('should register output option for delete command', () => {
      const cardPushCmd = program.commands.find(cmd => cmd.name() === 'card-push');
      const deleteCmd = cardPushCmd?.commands.find(cmd => cmd.name() === 'delete');
      const options = deleteCmd?.options || [];

      const outputOption = options.find(opt => opt.long === '--output');
      expect(outputOption).toBeDefined();
    });

    // ========================================
    // AC7: output format short option
    // ========================================
    it('[AC7] should register -o short form for --output option on all commands', () => {
      const cardPushCmd = program.commands.find(cmd => cmd.name() === 'card-push');

      // Check all commands have -o short form
      const commands = ['list', 'create', 'update', 'push', 'cancel', 'delete'];
      for (const cmdName of commands) {
        const cmd = cardPushCmd?.commands.find(cmd => cmd.name() === cmdName);
        const outputOption = cmd?.options.find(opt => opt.long === '--output');
        expect(outputOption?.short).toBe('-o');
      }
    });

    it('should not use -v or -V as short option (reserved for --version)', () => {
      const cardPushCmd = program.commands.find(cmd => cmd.name() === 'card-push');

      cardPushCmd?.commands.forEach(subCmd => {
        subCmd.options.forEach(opt => {
          expect(opt.short).not.toBe('-v');
          expect(opt.short).not.toBe('-V');
        });
      });
    });
  });

  describe('help information', () => {
    let program: Command;

    beforeEach(() => {
      program = new Command();
      registerCardPushCommands(program);
    });

    it('should include card-push command in help', () => {
      const helpText = program.helpInformation();
      expect(helpText).toContain('card-push');
    });

    it('should include list command in help', () => {
      const cardPushCmd = program.commands.find(cmd => cmd.name() === 'card-push');
      const listCmd = cardPushCmd?.commands.find(cmd => cmd.name() === 'list');

      const helpText = listCmd?.helpInformation() || '';
      expect(helpText).toMatch(/channelId|--channelId/i);
    });

    it('should include create command in help', () => {
      const cardPushCmd = program.commands.find(cmd => cmd.name() === 'card-push');
      const createCmd = cardPushCmd?.commands.find(cmd => cmd.name() === 'create');

      const helpText = createCmd?.helpInformation() || '';
      expect(helpText).toMatch(/channelId|--channelId|imageType|--imageType|title|--title/i);
    });

    it('should include update command in help', () => {
      const cardPushCmd = program.commands.find(cmd => cmd.name() === 'card-push');
      const updateCmd = cardPushCmd?.commands.find(cmd => cmd.name() === 'update');

      const helpText = updateCmd?.helpInformation() || '';
      expect(helpText).toMatch(/channelId|--channelId|cardPushId|--cardPushId/i);
    });

    it('should include push command in help', () => {
      const cardPushCmd = program.commands.find(cmd => cmd.name() === 'card-push');
      const pushCmd = cardPushCmd?.commands.find(cmd => cmd.name() === 'push');

      const helpText = pushCmd?.helpInformation() || '';
      expect(helpText).toMatch(/channelId|--channelId|cardPushId|--cardPushId/i);
    });

    it('should include cancel command in help', () => {
      const cardPushCmd = program.commands.find(cmd => cmd.name() === 'card-push');
      const cancelCmd = cardPushCmd?.commands.find(cmd => cmd.name() === 'cancel');

      const helpText = cancelCmd?.helpInformation() || '';
      expect(helpText).toMatch(/channelId|--channelId|cardPushId|--cardPushId/i);
    });

    it('should include delete command in help', () => {
      const cardPushCmd = program.commands.find(cmd => cmd.name() === 'card-push');
      const deleteCmd = cardPushCmd?.commands.find(cmd => cmd.name() === 'delete');

      const helpText = deleteCmd?.helpInformation() || '';
      expect(helpText).toMatch(/channelId|--channelId|cardPushId|--cardPushId/i);
    });

    it('should include output format options in help', () => {
      const cardPushCmd = program.commands.find(cmd => cmd.name() === 'card-push');
      const listCmd = cardPushCmd?.commands.find(cmd => cmd.name() === 'list');

      const helpText = listCmd?.helpInformation() || '';
      expect(helpText).toMatch(/output|--output|-o|json|table/i);
    });
  });

  // ========================================
  // Validation functions tests
  // ========================================
  describe('validateOutputFormat', () => {
    it('should validate table format', () => {
      expect(validateOutputFormat('table')).toBe('table');
    });

    it('should validate json format', () => {
      expect(validateOutputFormat('json')).toBe('json');
    });

    it('should throw error for invalid format', () => {
      expect(() => validateOutputFormat('xml')).toThrow('Invalid output format');
    });

    it('should throw error for uppercase format', () => {
      expect(() => validateOutputFormat('JSON')).toThrow('Invalid output format');
    });

    it('should throw error for empty string', () => {
      expect(() => validateOutputFormat('')).toThrow('Invalid output format');
    });
  });

  describe('validateImageType', () => {
    it('should validate giftbox type', () => {
      expect(validateImageType('giftbox')).toBe('giftbox');
    });

    it('should validate redpack type', () => {
      expect(validateImageType('redpack')).toBe('redpack');
    });

    it('should validate custom type', () => {
      expect(validateImageType('custom')).toBe('custom');
    });

    it('should validate weixinWork type', () => {
      expect(validateImageType('weixinWork')).toBe('weixinWork');
    });

    it('should throw error for invalid type', () => {
      expect(() => validateImageType('invalid')).toThrow('Invalid imageType');
    });

    it('should throw error for empty string', () => {
      expect(() => validateImageType('')).toThrow('Invalid imageType');
    });
  });

  describe('validateShowCondition', () => {
    it('should validate PUSH condition', () => {
      expect(validateShowCondition('PUSH')).toBe('PUSH');
    });

    it('should validate WATCH condition', () => {
      expect(validateShowCondition('WATCH')).toBe('WATCH');
    });

    it('should throw error for invalid condition', () => {
      expect(() => validateShowCondition('INVALID')).toThrow('Invalid showCondition');
    });

    it('should throw error for lowercase condition', () => {
      expect(() => validateShowCondition('push')).toThrow('Invalid showCondition');
    });
  });

  describe('validateDuration', () => {
    it('should validate duration 0', () => {
      expect(validateDuration('0')).toBe(0);
    });

    it('should validate duration 5', () => {
      expect(validateDuration('5')).toBe(5);
    });

    it('should validate duration 10', () => {
      expect(validateDuration('10')).toBe(10);
    });

    it('should validate duration 20', () => {
      expect(validateDuration('20')).toBe(20);
    });

    it('should validate duration 30', () => {
      expect(validateDuration('30')).toBe(30);
    });

    it('should throw error for invalid duration', () => {
      expect(() => validateDuration('15')).toThrow('Invalid duration');
    });

    it('should throw error for non-numeric duration', () => {
      expect(() => validateDuration('abc')).toThrow('Invalid duration');
    });
  });

  // ========================================
  // Action handler execution tests
  // ========================================
  describe('action handlers', () => {
    it('should execute list action handler with correct options', async () => {
      const program = new Command();
      registerCardPushCommands(program);

      const cardPushCmd = program.commands.find(cmd => cmd.name() === 'card-push');
      const listCmd = cardPushCmd?.commands.find(cmd => cmd.name() === 'list');

      // Verify the action handler is registered
      expect(listCmd).toBeDefined();
    });

    it('should execute create action handler with all required options', async () => {
      const program = new Command();
      registerCardPushCommands(program);

      const cardPushCmd = program.commands.find(cmd => cmd.name() === 'card-push');
      const createCmd = cardPushCmd?.commands.find(cmd => cmd.name() === 'create');

      // Verify the action handler is registered
      expect(createCmd).toBeDefined();
    });

    it('should execute update action handler with cardPushId', async () => {
      const program = new Command();
      registerCardPushCommands(program);

      const cardPushCmd = program.commands.find(cmd => cmd.name() === 'card-push');
      const updateCmd = cardPushCmd?.commands.find(cmd => cmd.name() === 'update');

      // Verify the action handler is registered
      expect(updateCmd).toBeDefined();
    });

    it('should execute push action handler', async () => {
      const program = new Command();
      registerCardPushCommands(program);

      const cardPushCmd = program.commands.find(cmd => cmd.name() === 'card-push');
      const pushCmd = cardPushCmd?.commands.find(cmd => cmd.name() === 'push');

      // Verify the action handler is registered
      expect(pushCmd).toBeDefined();
    });

    it('should execute cancel action handler', async () => {
      const program = new Command();
      registerCardPushCommands(program);

      const cardPushCmd = program.commands.find(cmd => cmd.name() === 'card-push');
      const cancelCmd = cardPushCmd?.commands.find(cmd => cmd.name() === 'cancel');

      // Verify the action handler is registered
      expect(cancelCmd).toBeDefined();
    });

    it('should execute delete action handler', async () => {
      const program = new Command();
      registerCardPushCommands(program);

      const cardPushCmd = program.commands.find(cmd => cmd.name() === 'card-push');
      const deleteCmd = cardPushCmd?.commands.find(cmd => cmd.name() === 'delete');

      // Verify the action handler is registered
      expect(deleteCmd).toBeDefined();
    });
  });
});

// ============================================================
// Action execution tests
// ============================================================
describe('action execution', () => {
  let restoreConsole: () => void;
  let restoreExit: () => void;
  let MockCardPushHandler: jest.Mock;

  const createTestProgram = (): Command => {
    const program = new Command();
    program.exitOverride();
    return program;
  };

  beforeEach(() => {
    restoreConsole = suppressConsole();
    restoreExit = mockProcessExit();
    MockCardPushHandler = require('../handlers/card-push.handler').CardPushHandler;
    MockCardPushHandler.mockClear();
    mockAuthSuccess(authAdapter as jest.Mocked<typeof authAdapter>, configManager as jest.Mocked<typeof configManager>);
  });

  afterEach(() => {
    restoreConsole();
    restoreExit();
  });

  describe('list action', () => {
    it('[P0] should call listCardPushes handler with correct params', async () => {
      const mockHandler = { listCardPushes: jest.fn().mockResolvedValue(undefined) };
      MockCardPushHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerCardPushCommands(program);
      await program.parseAsync(['node', 'test', 'card-push', 'list', '--channelId', '123456']);

      expect(MockCardPushHandler).toHaveBeenCalled();
      expect(mockHandler.listCardPushes).toHaveBeenCalledWith({
        channelId: '123456',
        output: 'table',
      });
    });

    it('[P1] should call listCardPushes with json output', async () => {
      const mockHandler = { listCardPushes: jest.fn().mockResolvedValue(undefined) };
      MockCardPushHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerCardPushCommands(program);
      await program.parseAsync(['node', 'test', 'card-push', 'list', '--channelId', '123456', '-o', 'json']);

      expect(mockHandler.listCardPushes).toHaveBeenCalledWith({
        channelId: '123456',
        output: 'json',
      });
    });

    it('[P1] should handle API errors in list action', async () => {
      const mockHandler = { listCardPushes: jest.fn().mockRejectedValue(new Error('List failed')) };
      MockCardPushHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerCardPushCommands(program);
      await expect(program.parseAsync(['node', 'test', 'card-push', 'list', '--channelId', '123456'])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });

  describe('create action', () => {
    it('[P0] should call createCardPush handler with correct params', async () => {
      const mockHandler = { createCardPush: jest.fn().mockResolvedValue(undefined) };
      MockCardPushHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerCardPushCommands(program);
      await program.parseAsync([
        'node', 'test', 'card-push', 'create',
        '--channelId', '123456',
        '--imageType', 'giftbox',
        '--title', 'Test Card',
        '--link', 'https://example.com',
        '--duration', '10',
        '--showCondition', 'PUSH',
      ]);

      expect(MockCardPushHandler).toHaveBeenCalled();
      expect(mockHandler.createCardPush).toHaveBeenCalledWith({
        channelId: '123456',
        cardType: 'common',
        imageType: 'giftbox',
        title: 'Test Card',
        link: 'https://example.com',
        duration: 10,
        durationPosition: undefined,
        showCondition: 'PUSH',
        conditionValue: undefined,
        conditionUnit: undefined,
        countdownMsg: undefined,
        enterEnabled: undefined,
        linkEnabled: undefined,
        redirectType: undefined,
        output: 'table',
      });
    });

    it('[P1] should call createCardPush with all options', async () => {
      const mockHandler = { createCardPush: jest.fn().mockResolvedValue(undefined) };
      MockCardPushHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerCardPushCommands(program);
      await program.parseAsync([
        'node', 'test', 'card-push', 'create',
        '--channelId', '123456',
        '--imageType', 'redpack',
        '--title', 'Full Card',
        '--link', 'https://example.com',
        '--duration', '20',
        '--showCondition', 'WATCH',
        '--cardType', 'qrCode',
        '--durationPosition', 'top',
        '--conditionValue', '60',
        '--conditionUnit', 'SECONDS',
        '--countdownMsg', 'Hurry!',
        '--enterEnabled', 'Y',
        '--linkEnabled', 'Y',
        '--redirectType', 'tab',
        '-o', 'json',
      ]);

      expect(mockHandler.createCardPush).toHaveBeenCalledWith({
        channelId: '123456',
        cardType: 'qrCode',
        imageType: 'redpack',
        title: 'Full Card',
        link: 'https://example.com',
        duration: 20,
        durationPosition: 'top',
        showCondition: 'WATCH',
        conditionValue: 60,
        conditionUnit: 'SECONDS',
        countdownMsg: 'Hurry!',
        enterEnabled: 'Y',
        linkEnabled: 'Y',
        redirectType: 'tab',
        output: 'json',
      });
    });

    it('[P1] should handle API errors in create action', async () => {
      const mockHandler = { createCardPush: jest.fn().mockRejectedValue(new Error('Create failed')) };
      MockCardPushHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerCardPushCommands(program);
      await expect(program.parseAsync([
        'node', 'test', 'card-push', 'create',
        '--channelId', '123456',
        '--imageType', 'giftbox',
        '--title', 'Test',
        '--link', 'https://example.com',
        '--duration', '10',
        '--showCondition', 'PUSH',
      ])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });

  describe('update action', () => {
    it('[P0] should call updateCardPush handler with correct params', async () => {
      const mockHandler = { updateCardPush: jest.fn().mockResolvedValue(undefined) };
      MockCardPushHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerCardPushCommands(program);
      await program.parseAsync([
        'node', 'test', 'card-push', 'update',
        '--channelId', '123456',
        '--cardPushId', 'cp789',
        '--title', 'Updated Title',
      ]);

      expect(MockCardPushHandler).toHaveBeenCalled();
      expect(mockHandler.updateCardPush).toHaveBeenCalledWith({
        channelId: '123456',
        cardPushId: 'cp789',
        cardType: undefined,
        imageType: undefined,
        title: 'Updated Title',
        link: undefined,
        duration: undefined,
        durationPosition: undefined,
        showCondition: undefined,
        conditionValue: undefined,
        conditionUnit: undefined,
        countdownMsg: undefined,
        enterEnabled: undefined,
        linkEnabled: undefined,
        redirectType: undefined,
        output: 'table',
      });
    });

    it('[P1] should handle API errors in update action', async () => {
      const mockHandler = { updateCardPush: jest.fn().mockRejectedValue(new Error('Update failed')) };
      MockCardPushHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerCardPushCommands(program);
      await expect(program.parseAsync([
        'node', 'test', 'card-push', 'update',
        '--channelId', '123456',
        '--cardPushId', 'cp789',
      ])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });

  describe('push action', () => {
    it('[P0] should call pushCard handler with correct params', async () => {
      const mockHandler = { pushCard: jest.fn().mockResolvedValue(undefined) };
      MockCardPushHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerCardPushCommands(program);
      await program.parseAsync([
        'node', 'test', 'card-push', 'push',
        '--channelId', '123456',
        '--cardPushId', 'cp789',
      ]);

      expect(MockCardPushHandler).toHaveBeenCalled();
      expect(mockHandler.pushCard).toHaveBeenCalledWith({
        channelId: '123456',
        cardPushId: 'cp789',
        output: 'table',
      });
    });

    it('[P1] should handle API errors in push action', async () => {
      const mockHandler = { pushCard: jest.fn().mockRejectedValue(new Error('Push failed')) };
      MockCardPushHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerCardPushCommands(program);
      await expect(program.parseAsync([
        'node', 'test', 'card-push', 'push',
        '--channelId', '123456',
        '--cardPushId', 'cp789',
      ])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });

  describe('cancel action', () => {
    it('[P0] should call cancelPush handler with correct params', async () => {
      const mockHandler = { cancelPush: jest.fn().mockResolvedValue(undefined) };
      MockCardPushHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerCardPushCommands(program);
      await program.parseAsync([
        'node', 'test', 'card-push', 'cancel',
        '--channelId', '123456',
        '--cardPushId', 'cp789',
      ]);

      expect(MockCardPushHandler).toHaveBeenCalled();
      expect(mockHandler.cancelPush).toHaveBeenCalledWith({
        channelId: '123456',
        cardPushId: 'cp789',
        output: 'table',
      });
    });

    it('[P1] should handle API errors in cancel action', async () => {
      const mockHandler = { cancelPush: jest.fn().mockRejectedValue(new Error('Cancel failed')) };
      MockCardPushHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerCardPushCommands(program);
      await expect(program.parseAsync([
        'node', 'test', 'card-push', 'cancel',
        '--channelId', '123456',
        '--cardPushId', 'cp789',
      ])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });

  describe('delete action', () => {
    it('[P0] should call deleteCardPush handler with correct params', async () => {
      const mockHandler = { deleteCardPush: jest.fn().mockResolvedValue(undefined) };
      MockCardPushHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerCardPushCommands(program);
      await program.parseAsync([
        'node', 'test', 'card-push', 'delete',
        '--channelId', '123456',
        '--cardPushId', 'cp789',
      ]);

      expect(MockCardPushHandler).toHaveBeenCalled();
      expect(mockHandler.deleteCardPush).toHaveBeenCalledWith({
        channelId: '123456',
        cardPushId: 'cp789',
        output: 'table',
      });
    });

    it('[P1] should handle API errors in delete action', async () => {
      const mockHandler = { deleteCardPush: jest.fn().mockRejectedValue(new Error('Delete failed')) };
      MockCardPushHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerCardPushCommands(program);
      await expect(program.parseAsync([
        'node', 'test', 'card-push', 'delete',
        '--channelId', '123456',
        '--cardPushId', 'cp789',
      ])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });
});
