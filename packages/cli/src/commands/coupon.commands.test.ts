/**
 * @fileoverview Unit tests for coupon commands
 * @author Development Team
 * @since 8.1.0
 */

import { Command } from 'commander';
import {
  registerCouponCommands,
  validateCouponType,
  validateCouponStatus,
  validateOutputFormat,
  validateSize,
  parseInteger
} from './coupon.commands';
import { authAdapter } from '../config/auth-adapter';
import { configManager } from '../config/manager';
import { suppressConsole, mockProcessExit, mockAuthSuccess } from '../utils/test-helpers';

// Mock dependencies
jest.mock('../config/auth-adapter');
jest.mock('../config/manager');
jest.mock('../handlers/coupon.handler');
jest.mock('../utils/errors', () => ({
  logError: jest.fn(),
}));

describe('Coupon Commands', () => {
  describe('command registration', () => {
    let program: Command;

    beforeEach(() => {
      program = new Command();
      registerCouponCommands(program);
    });

    it('should register coupon command group', () => {
      const couponCmd = program.commands.find(cmd => cmd.name() === 'coupon');
      expect(couponCmd).toBeDefined();
      expect(couponCmd?.description()).toBe('Manage coupons');
    });

    it('should register coupon add subcommand', () => {
      const couponCmd = program.commands.find(cmd => cmd.name() === 'coupon');
      const addCmd = couponCmd?.commands.find(cmd => cmd.name() === 'add');

      expect(addCmd).toBeDefined();
      expect(addCmd?.description()).toContain('Create a new coupon');
    });

    it('should register coupon list subcommand', () => {
      const couponCmd = program.commands.find(cmd => cmd.name() === 'coupon');
      const listCmd = couponCmd?.commands.find(cmd => cmd.name() === 'list');

      expect(listCmd).toBeDefined();
      expect(listCmd?.description()).toContain('List coupons');
    });

    it('should register coupon delete subcommand', () => {
      const couponCmd = program.commands.find(cmd => cmd.name() === 'coupon');
      const deleteCmd = couponCmd?.commands.find(cmd => cmd.name() === 'delete');

      expect(deleteCmd).toBeDefined();
      expect(deleteCmd?.description()).toContain('Delete coupons');
    });

    it('should register correct required options for add command', () => {
      const couponCmd = program.commands.find(cmd => cmd.name() === 'coupon');
      const addCmd = couponCmd?.commands.find(cmd => cmd.name() === 'add');
      const options = addCmd?.options || [];

      const requiredOptions = ['--name', '--type', '--availableAmount', '--receiveStart', '--receiveEnd', '--useTimeType'];

      requiredOptions.forEach(optionName => {
        const option = options.find(opt => opt.long === optionName);
        expect(option).toBeDefined();
        expect(option?.required).toBe(true);
      });
    });

    it('should register correct options for list command', () => {
      const couponCmd = program.commands.find(cmd => cmd.name() === 'coupon');
      const listCmd = couponCmd?.commands.find(cmd => cmd.name() === 'list');
      const options = listCmd?.options || [];

      const expectedOptions = ['--page', '--size', '--status', '--output'];

      expectedOptions.forEach(optionName => {
        const option = options.find(opt => opt.long === optionName);
        expect(option).toBeDefined();
      });
    });

    it('should register required option for delete command', () => {
      const couponCmd = program.commands.find(cmd => cmd.name() === 'coupon');
      const deleteCmd = couponCmd?.commands.find(cmd => cmd.name() === 'delete');
      const options = deleteCmd?.options || [];

      const couponIdsOption = options.find(opt => opt.long === '--couponIds');
      expect(couponIdsOption).toBeDefined();
      expect(couponIdsOption?.required).toBe(true);
    });

    it('should register output option for all commands', () => {
      const couponCmd = program.commands.find(cmd => cmd.name() === 'coupon');

      ['add', 'list', 'delete'].forEach(subCmdName => {
        const subCmd = couponCmd?.commands.find(cmd => cmd.name() === subCmdName);
        const outputOption = subCmd?.options.find(opt => opt.long === '--output');
        expect(outputOption).toBeDefined();
      });
    });
  });

  describe('help information', () => {
    let program: Command;

    beforeEach(() => {
      program = new Command();
      registerCouponCommands(program);
    });

    it('should include coupon command in help', () => {
      const helpText = program.helpInformation();
      expect(helpText).toContain('coupon');
      expect(helpText).toContain('Manage coupons');
    });

    it('should include add command examples in help', () => {
      const couponCmd = program.commands.find(cmd => cmd.name() === 'coupon');
      const addCmd = couponCmd?.commands.find(cmd => cmd.name() === 'add');

      const helpText = addCmd?.helpInformation() || '';
      expect(helpText).toContain('MAX_OUT');
      expect(helpText).toContain('DISCOUNT');
      expect(helpText).toContain('FULL_REDUCE');
    });

    it('should include list command status filters in help', () => {
      const couponCmd = program.commands.find(cmd => cmd.name() === 'coupon');
      const listCmd = couponCmd?.commands.find(cmd => cmd.name() === 'list');

      const helpText = listCmd?.helpInformation() || '';
      expect(helpText).toContain('NOT_START');
      expect(helpText).toContain('GOING');
      expect(helpText).toContain('FINISHED');
      expect(helpText).toContain('INVALID');
    });
  });

  // ========================================
  // Validation functions tests
  // ========================================
  describe('validateCouponType', () => {
    it('should validate MAX_OUT type', () => {
      expect(validateCouponType('MAX_OUT')).toBe('MAX_OUT');
    });

    it('should validate DISCOUNT type', () => {
      expect(validateCouponType('DISCOUNT')).toBe('DISCOUNT');
    });

    it('should throw error for invalid type', () => {
      expect(() => validateCouponType('INVALID')).toThrow('Invalid coupon type');
    });

    it('should throw error for lowercase type', () => {
      expect(() => validateCouponType('max_out')).toThrow('Invalid coupon type');
    });

    it('should throw error for empty string', () => {
      expect(() => validateCouponType('')).toThrow('Invalid coupon type');
    });
  });

  describe('validateCouponStatus', () => {
    it('should validate NOT_START status', () => {
      expect(validateCouponStatus('NOT_START')).toBe('NOT_START');
    });

    it('should validate GOING status', () => {
      expect(validateCouponStatus('GOING')).toBe('GOING');
    });

    it('should validate FINISHED status', () => {
      expect(validateCouponStatus('FINISHED')).toBe('FINISHED');
    });

    it('should validate INVALID status', () => {
      expect(validateCouponStatus('INVALID')).toBe('INVALID');
    });

    it('should throw error for unknown status', () => {
      expect(() => validateCouponStatus('UNKNOWN')).toThrow('Invalid coupon status');
    });

    it('should throw error for empty string', () => {
      expect(() => validateCouponStatus('')).toThrow('Invalid coupon status');
    });
  });

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
  });

  describe('validateSize', () => {
    it('should validate valid size within range', () => {
      expect(validateSize('10')).toBe(10);
      expect(validateSize('1')).toBe(1);
      expect(validateSize('1000')).toBe(1000);
    });

    it('should throw error for size below minimum', () => {
      expect(() => validateSize('0')).toThrow('Size must be between 1 and 1000');
    });

    it('should throw error for size above maximum', () => {
      expect(() => validateSize('1001')).toThrow('Size must be between 1 and 1000');
    });

    it('should throw error for non-numeric input', () => {
      expect(() => validateSize('abc')).toThrow('"abc" is not a valid integer');
    });
  });

  describe('parseInteger', () => {
    it('should parse valid integer string', () => {
      expect(parseInteger('42')).toBe(42);
    });

    it('should parse zero', () => {
      expect(parseInteger('0')).toBe(0);
    });

    it('should parse negative numbers', () => {
      expect(parseInteger('-5')).toBe(-5);
    });

    it('should throw error for non-numeric string', () => {
      expect(() => parseInteger('not-a-number')).toThrow('"not-a-number" is not a valid integer');
    });

    it('should throw error for float string (strict parsing)', () => {
      // Strict parsing: "3.14" is not a valid integer format
      expect(() => parseInteger('3.14')).toThrow('"3.14" is not a valid integer');
    });

    it('should parse large numbers', () => {
      expect(parseInteger('1704067200000')).toBe(1704067200000);
    });
  });
});

// ============================================================
// Action execution tests
// ============================================================
describe('action execution', () => {
  let restoreConsole: () => void;
  let restoreExit: () => void;
  let MockCouponHandler: jest.Mock;

  const createTestProgram = (): Command => {
    const program = new Command();
    program.exitOverride();
    return program;
  };

  beforeEach(() => {
    restoreConsole = suppressConsole();
    restoreExit = mockProcessExit();
    MockCouponHandler = require('../handlers/coupon.handler').CouponHandler;
    MockCouponHandler.mockClear();
    mockAuthSuccess(authAdapter as jest.Mocked<typeof authAdapter>, configManager as jest.Mocked<typeof configManager>);
  });

  afterEach(() => {
    restoreConsole();
    restoreExit();
  });

  describe('add action', () => {
    it('[P0] should call addCoupon handler with correct params', async () => {
      const mockHandler = { addCoupon: jest.fn().mockResolvedValue(undefined) };
      MockCouponHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerCouponCommands(program);
      await program.parseAsync([
        'node', 'test', 'coupon', 'add',
        '--name', 'Test Coupon',
        '--type', 'MAX_OUT',
        '--availableAmount', '100',
        '--receiveStart', '1704067200000',
        '--receiveEnd', '1704153600000',
        '--useTimeType', 'RANGE',
        '--useStart', '1704067200000',
        '--useEnd', '1704758400000',
        '--condition', 'FULL_REDUCE',
        '--full', '100',
        '--reduce', '20',
        '--limitPerPerson', '1',
      ]);

      expect(MockCouponHandler).toHaveBeenCalled();
      expect(mockHandler.addCoupon).toHaveBeenCalledWith({
        name: 'Test Coupon',
        type: 'MAX_OUT',
        availableAmount: 100,
        receiveStart: 1704067200000,
        receiveEnd: 1704153600000,
        useTimeType: 'RANGE',
        useStart: 1704067200000,
        useEnd: 1704758400000,
        dayOfUse: undefined,
        condition: 'FULL_REDUCE',
        discount: undefined,
        full: 100,
        reduce: 20,
        limitPerPerson: 1,
        output: 'table',
      });
    });

    it('[P1] should call addCoupon with DISCOUNT type', async () => {
      const mockHandler = { addCoupon: jest.fn().mockResolvedValue(undefined) };
      MockCouponHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerCouponCommands(program);
      await program.parseAsync([
        'node', 'test', 'coupon', 'add',
        '--name', 'Discount Coupon',
        '--type', 'DISCOUNT',
        '--availableAmount', '200',
        '--receiveStart', '1704067200000',
        '--receiveEnd', '1704153600000',
        '--useTimeType', 'DAY',
        '--dayOfUse', '7',
        '--condition', 'UNCONDITIONAL',
        '--discount', '80',
        '--limitPerPerson', '1',
        '-o', 'json',
      ]);

      expect(mockHandler.addCoupon).toHaveBeenCalledWith({
        name: 'Discount Coupon',
        type: 'DISCOUNT',
        availableAmount: 200,
        receiveStart: 1704067200000,
        receiveEnd: 1704153600000,
        useTimeType: 'DAY',
        useStart: undefined,
        useEnd: undefined,
        dayOfUse: 7,
        condition: 'UNCONDITIONAL',
        discount: 80,
        full: undefined,
        reduce: undefined,
        limitPerPerson: 1,
        output: 'json',
      });
    });

    it('[P1] should handle API errors in add action', async () => {
      const mockHandler = { addCoupon: jest.fn().mockRejectedValue(new Error('Add failed')) };
      MockCouponHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerCouponCommands(program);
      await expect(program.parseAsync([
        'node', 'test', 'coupon', 'add',
        '--name', 'Test',
        '--type', 'MAX_OUT',
        '--availableAmount', '100',
        '--receiveStart', '1704067200000',
        '--receiveEnd', '1704153600000',
        '--useTimeType', 'RANGE',
        '--useStart', '1704067200000',
        '--useEnd', '1704758400000',
        '--condition', 'UNCONDITIONAL',
        '--limitPerPerson', '1',
      ])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });

  describe('list action', () => {
    it('[P0] should call listCoupons handler with correct params', async () => {
      const mockHandler = { listCoupons: jest.fn().mockResolvedValue(undefined) };
      MockCouponHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerCouponCommands(program);
      await program.parseAsync(['node', 'test', 'coupon', 'list']);

      expect(MockCouponHandler).toHaveBeenCalled();
      expect(mockHandler.listCoupons).toHaveBeenCalledWith({
        page: 1,
        size: 10,
        status: undefined,
        output: 'table',
      });
    });

    it('[P1] should call listCoupons with pagination and status', async () => {
      const mockHandler = { listCoupons: jest.fn().mockResolvedValue(undefined) };
      MockCouponHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerCouponCommands(program);
      await program.parseAsync([
        'node', 'test', 'coupon', 'list',
        '-p', '2',
        '-s', '20',
        '--status', 'GOING',
        '-o', 'json',
      ]);

      expect(mockHandler.listCoupons).toHaveBeenCalledWith({
        page: 2,
        size: 20,
        status: 'GOING',
        output: 'json',
      });
    });

    it('[P1] should handle API errors in list action', async () => {
      const mockHandler = { listCoupons: jest.fn().mockRejectedValue(new Error('List failed')) };
      MockCouponHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerCouponCommands(program);
      await expect(program.parseAsync(['node', 'test', 'coupon', 'list'])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });

  describe('delete action', () => {
    it('[P0] should call deleteCoupons handler with correct params', async () => {
      const mockHandler = { deleteCoupons: jest.fn().mockResolvedValue(undefined) };
      MockCouponHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerCouponCommands(program);
      await program.parseAsync([
        'node', 'test', 'coupon', 'delete',
        '--couponIds', 'coupon001', 'coupon002',
      ]);

      expect(MockCouponHandler).toHaveBeenCalled();
      expect(mockHandler.deleteCoupons).toHaveBeenCalledWith({
        couponIds: ['coupon001', 'coupon002'],
        output: 'table',
      });
    });

    it('[P1] should call deleteCoupons with json output', async () => {
      const mockHandler = { deleteCoupons: jest.fn().mockResolvedValue(undefined) };
      MockCouponHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerCouponCommands(program);
      await program.parseAsync([
        'node', 'test', 'coupon', 'delete',
        '--couponIds', 'coupon001',
        '-o', 'json',
      ]);

      expect(mockHandler.deleteCoupons).toHaveBeenCalledWith({
        couponIds: ['coupon001'],
        output: 'json',
      });
    });

    it('[P1] should handle API errors in delete action', async () => {
      const mockHandler = { deleteCoupons: jest.fn().mockRejectedValue(new Error('Delete failed')) };
      MockCouponHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerCouponCommands(program);
      await expect(program.parseAsync([
        'node', 'test', 'coupon', 'delete',
        '--couponIds', 'coupon001',
      ])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });
});
