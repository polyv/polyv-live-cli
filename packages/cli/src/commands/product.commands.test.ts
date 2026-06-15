/**
 * @fileoverview Unit tests for Product commands
 * @author Development Team
 * @since 7.1.0
 */

import { Command } from 'commander';
import {
  registerProductCommands,
  parseInteger,
  validateSize,
  validateOutputFormat,
  validateProductType,
  validateProductStatus,
  validateLinkType,
  validatePrice
} from './product.commands';
import { authAdapter } from '../config/auth-adapter';
import { configManager } from '../config/manager';
import { suppressConsole, mockProcessExit, mockAuthSuccess } from '../utils/test-helpers';

// Mock dependencies
jest.mock('../config/auth-adapter');
jest.mock('../config/manager');
jest.mock('../handlers/product.handler');
jest.mock('../utils/errors', () => ({
  logError: jest.fn(),
}));

describe('Product Commands', () => {
  describe('command registration', () => {
    let program: Command;

    beforeEach(() => {
      program = new Command();
      registerProductCommands(program);
    });

    it('should register product command group', () => {
      const productCmd = program.commands.find(cmd => cmd.name() === 'product');
      expect(productCmd).toBeDefined();
      expect(productCmd?.description()).toBe('Manage live streaming channel products');
    });

    it('should register product list subcommand', () => {
      const productCmd = program.commands.find(cmd => cmd.name() === 'product');
      const listCmd = productCmd?.commands.find(cmd => cmd.name() === 'list');

      expect(listCmd).toBeDefined();
      expect(listCmd?.description()).toBe('List products with pagination');
    });

    it('should register correct options for list command', () => {
      const productCmd = program.commands.find(cmd => cmd.name() === 'product');
      const listCmd = productCmd?.commands.find(cmd => cmd.name() === 'list');

      const options = listCmd?.options || [];
      const optionNames = options.map(opt => opt.long);

      expect(optionNames).toContain('--page');
      expect(optionNames).toContain('--size');
      expect(optionNames).toContain('--channel-id');
      expect(optionNames).toContain('--output');
    });

    it('should have correct short options', () => {
      const productCmd = program.commands.find(cmd => cmd.name() === 'product');
      const listCmd = productCmd?.commands.find(cmd => cmd.name() === 'list');

      const options = listCmd?.options || [];
      const shortOptions = options.map(opt => opt.short).filter(Boolean);

      expect(shortOptions).toContain('-P');
      expect(shortOptions).toContain('-s');
      expect(shortOptions).toContain('-c');
      expect(shortOptions).toContain('-o');
    });
  });

  describe('help information', () => {
    let program: Command;

    beforeEach(() => {
      program = new Command();
      registerProductCommands(program);
    });

    it('should include basic help information for product list command', () => {
      const productCmd = program.commands.find(cmd => cmd.name() === 'product');
      const listCmd = productCmd?.commands.find(cmd => cmd.name() === 'list');

      const helpText = listCmd?.helpInformation();

      expect(helpText).toContain('List products with pagination');
      expect(helpText).toContain('--page');
      expect(helpText).toContain('--size');
      expect(helpText).toContain('--channel-id');
      expect(helpText).toContain('--output');
    });
  });

  describe('parseInteger', () => {
    it('should parse valid integer string', () => {
      expect(parseInteger('42')).toBe(42);
    });

    it('should parse zero', () => {
      expect(parseInteger('0')).toBe(0);
    });

    it('should parse negative number', () => {
      expect(parseInteger('-5')).toBe(-5);
    });

    it('should throw error for non-numeric string', () => {
      expect(() => parseInteger('not-a-number')).toThrow('"not-a-number" is not a valid integer');
    });

    it('should throw error for NaN string', () => {
      expect(() => parseInteger('NaN')).toThrow('"NaN" is not a valid integer');
    });

    it('should parse floating point as integer (truncate)', () => {
      expect(parseInteger('3.14')).toBe(3);
    });
  });

  describe('validateSize', () => {
    it('should accept valid size value', () => {
      expect(validateSize('50')).toBe(50);
    });

    it('should accept minimum size value (1)', () => {
      expect(validateSize('1')).toBe(1);
    });

    it('should accept maximum size value (100)', () => {
      expect(validateSize('100')).toBe(100);
    });

    it('should reject size value below minimum (0)', () => {
      expect(() => validateSize('0')).toThrow('Size must be between 1 and 100');
    });

    it('should reject size value above maximum (101)', () => {
      expect(() => validateSize('101')).toThrow('Size must be between 1 and 100');
    });

    it('should reject negative size value', () => {
      expect(() => validateSize('-5')).toThrow('Size must be between 1 and 100');
    });
  });

  describe('validateOutputFormat', () => {
    it('should accept "table" format', () => {
      expect(validateOutputFormat('table')).toBe('table');
    });

    it('should accept "json" format', () => {
      expect(validateOutputFormat('json')).toBe('json');
    });

    it('should reject invalid format', () => {
      expect(() => validateOutputFormat('xml')).toThrow('Output format must be either "table" or "json"');
    });

    it('should reject invalid format "csv"', () => {
      expect(() => validateOutputFormat('csv')).toThrow('Output format must be either "table" or "json"');
    });

    it('should reject empty string', () => {
      expect(() => validateOutputFormat('')).toThrow('Output format must be either "table" or "json"');
    });
  });

  // ============================================================
  // ATDD FAILING TESTS - Story 8-2: product add/update/delete
  // These tests will FAIL until the feature is implemented (TDD red phase)
  // ============================================================

  describe('product add command (AC #1)', () => {
    let program: Command;

    beforeEach(() => {
      program = new Command();
      registerProductCommands(program);
    });

    it('should register product add subcommand', () => {
      const productCmd = program.commands.find(cmd => cmd.name() === 'product');
      const addCmd = productCmd?.commands.find(cmd => cmd.name() === 'add');

      expect(addCmd).toBeDefined();
      expect(addCmd?.description()).toContain('Add a new product');
    });

    it('should register required options for add command', () => {
      const productCmd = program.commands.find(cmd => cmd.name() === 'product');
      const addCmd = productCmd?.commands.find(cmd => cmd.name() === 'add');

      const options = addCmd?.options || [];
      const optionNames = options.map(opt => opt.long);

      expect(optionNames).toContain('--channel-id');
      expect(optionNames).toContain('--name');
      expect(optionNames).toContain('--status');
      expect(optionNames).toContain('--link-type');
      expect(optionNames).toContain('--product-type');
      expect(optionNames).toContain('--output');
    });

    it('should support --product-type with normal/finance/position values', () => {
      const productCmd = program.commands.find(cmd => cmd.name() === 'product');
      const addCmd = productCmd?.commands.find(cmd => cmd.name() === 'add');

      const productTypeOption = addCmd?.options.find(opt => opt.long === '--product-type');
      expect(productTypeOption).toBeDefined();
    });
  });

  describe('product update command (AC #2)', () => {
    let program: Command;

    beforeEach(() => {
      program = new Command();
      registerProductCommands(program);
    });

    it('should register product update subcommand', () => {
      const productCmd = program.commands.find(cmd => cmd.name() === 'product');
      const updateCmd = productCmd?.commands.find(cmd => cmd.name() === 'update');

      expect(updateCmd).toBeDefined();
      expect(updateCmd?.description()).toContain('Update an existing product');
    });

    it('should register required options for update command', () => {
      const productCmd = program.commands.find(cmd => cmd.name() === 'product');
      const updateCmd = productCmd?.commands.find(cmd => cmd.name() === 'update');

      const options = updateCmd?.options || [];
      const optionNames = options.map(opt => opt.long);

      // Required options
      expect(optionNames).toContain('--channel-id');
      expect(optionNames).toContain('--product-id');
      expect(optionNames).toContain('--output');
    });

    it('should support selective field updates (all fields optional except ids)', () => {
      const productCmd = program.commands.find(cmd => cmd.name() === 'product');
      const updateCmd = productCmd?.commands.find(cmd => cmd.name() === 'update');

      const options = updateCmd?.options || [];
      const optionNames = options.map(opt => opt.long);

      // Optional fields for selective update
      expect(optionNames).toContain('--name');
      expect(optionNames).toContain('--status');
      expect(optionNames).toContain('--link-type');
    });
  });

  describe('product delete command (AC #3)', () => {
    let program: Command;

    beforeEach(() => {
      program = new Command();
      registerProductCommands(program);
    });

    it('should register product delete subcommand', () => {
      const productCmd = program.commands.find(cmd => cmd.name() === 'product');
      const deleteCmd = productCmd?.commands.find(cmd => cmd.name() === 'delete');

      expect(deleteCmd).toBeDefined();
      expect(deleteCmd?.description()).toContain('Delete a product');
    });

    it('should register required options for delete command', () => {
      const productCmd = program.commands.find(cmd => cmd.name() === 'product');
      const deleteCmd = productCmd?.commands.find(cmd => cmd.name() === 'delete');

      const options = deleteCmd?.options || [];
      const optionNames = options.map(opt => opt.long);

      expect(optionNames).toContain('--channel-id');
      expect(optionNames).toContain('--product-id');
    });

    it('should support --force option to skip confirmation', () => {
      const productCmd = program.commands.find(cmd => cmd.name() === 'product');
      const deleteCmd = productCmd?.commands.find(cmd => cmd.name() === 'delete');

      const options = deleteCmd?.options || [];
      const optionNames = options.map(opt => opt.long);

      expect(optionNames).toContain('--force');
    });
  });

  describe('output format support (AC #4)', () => {
    let program: Command;

    beforeEach(() => {
      program = new Command();
      registerProductCommands(program);
    });

    it('add command should support --output table|json', () => {
      const productCmd = program.commands.find(cmd => cmd.name() === 'product');
      const addCmd = productCmd?.commands.find(cmd => cmd.name() === 'add');

      const outputOption = addCmd?.options.find(opt => opt.long === '--output');
      expect(outputOption).toBeDefined();
    });

    it('update command should support --output table|json', () => {
      const productCmd = program.commands.find(cmd => cmd.name() === 'product');
      const updateCmd = productCmd?.commands.find(cmd => cmd.name() === 'update');

      const outputOption = updateCmd?.options.find(opt => opt.long === '--output');
      expect(outputOption).toBeDefined();
    });

    it('delete command should support --output table|json', () => {
      const productCmd = program.commands.find(cmd => cmd.name() === 'product');
      const deleteCmd = productCmd?.commands.find(cmd => cmd.name() === 'delete');

      const outputOption = deleteCmd?.options.find(opt => opt.long === '--output');
      expect(outputOption).toBeDefined();
    });
  });

  describe('validateProductType (AC #1, #5)', () => {
    it('should accept "normal" product type', () => {
      expect(validateProductType('normal')).toBe('normal');
    });

    it('should accept "finance" product type', () => {
      expect(validateProductType('finance')).toBe('finance');
    });

    it('should accept "position" product type', () => {
      expect(validateProductType('position')).toBe('position');
    });

    it('should reject invalid product type', () => {
      expect(() => validateProductType('invalid')).toThrow(
        'Product type must be one of: normal, finance, position'
      );
    });

    it('should reject empty string', () => {
      expect(() => validateProductType('')).toThrow(
        'Product type must be one of: normal, finance, position'
      );
    });
  });

  describe('validateProductStatus (AC #5)', () => {
    it('should accept status 1 (上架/Active)', () => {
      expect(validateProductStatus('1')).toBe(1);
    });

    it('should accept status 2 (下架/Inactive)', () => {
      expect(validateProductStatus('2')).toBe(2);
    });

    it('should reject invalid status', () => {
      expect(() => validateProductStatus('3')).toThrow(
        'Product status must be 1 (上架) or 2 (下架)'
      );
    });

    it('should reject non-numeric status', () => {
      expect(() => validateProductStatus('active')).toThrow(
        'Product status must be 1 (上架) or 2 (下架)'
      );
    });
  });

  describe('validateLinkType (AC #5)', () => {
    it('should accept link type 10 (通用链接)', () => {
      expect(validateLinkType('10')).toBe(10);
    });

    it('should accept link type 11 (多平台链接)', () => {
      expect(validateLinkType('11')).toBe(11);
    });

    it('should reject invalid link type', () => {
      expect(() => validateLinkType('12')).toThrow(
        'Link type must be 10 (通用链接) or 11 (多平台链接)'
      );
    });

    it('should reject non-numeric link type', () => {
      expect(() => validateLinkType('abc')).toThrow(
        'Link type must be 10 (通用链接) or 11 (多平台链接)'
      );
    });
  });

  describe('parameter validation for add command (AC #5)', () => {
    let program: Command;

    beforeEach(() => {
      program = new Command();
      registerProductCommands(program);
    });

    it('should require --channel-id for add', () => {
      const productCmd = program.commands.find(cmd => cmd.name() === 'product');
      const addCmd = productCmd?.commands.find(cmd => cmd.name() === 'add');

      // channelId should be required
      const channelIdOption = addCmd?.options.find(opt => opt.long === '--channel-id');
      expect(channelIdOption?.required).toBe(true);
    });

    it('should require --name for add', () => {
      const productCmd = program.commands.find(cmd => cmd.name() === 'product');
      const addCmd = productCmd?.commands.find(cmd => cmd.name() === 'add');

      const nameOption = addCmd?.options.find(opt => opt.long === '--name');
      expect(nameOption?.required).toBe(true);
    });

    it('should require --status for add', () => {
      const productCmd = program.commands.find(cmd => cmd.name() === 'product');
      const addCmd = productCmd?.commands.find(cmd => cmd.name() === 'add');

      const statusOption = addCmd?.options.find(opt => opt.long === '--status');
      expect(statusOption?.required).toBe(true);
    });

    it('should require --link-type for add', () => {
      const productCmd = program.commands.find(cmd => cmd.name() === 'product');
      const addCmd = productCmd?.commands.find(cmd => cmd.name() === 'add');

      const linkTypeOption = addCmd?.options.find(opt => opt.long === '--link-type');
      expect(linkTypeOption?.required).toBe(true);
    });
  });
});

describe('validatePrice', () => {
  it('should accept valid price', () => {
    expect(validatePrice('99.99')).toBe(99.99);
  });

  it('should accept zero price', () => {
    expect(validatePrice('0')).toBe(0);
  });

  it('should accept integer price', () => {
    expect(validatePrice('100')).toBe(100);
  });

  it('should reject negative price', () => {
    expect(() => validatePrice('-10')).toThrow('Price cannot be negative');
  });

  it('should reject non-numeric price', () => {
    expect(() => validatePrice('abc')).toThrow('"abc" is not a valid price');
  });

  it('should reject NaN', () => {
    expect(() => validatePrice('NaN')).toThrow('"NaN" is not a valid price');
  });
});

// ============================================================
// Action execution tests
// ============================================================
describe('action execution', () => {
  let restoreConsole: () => void;
  let restoreExit: () => void;
  let MockProductHandler: jest.Mock;

  const createTestProgram = (): Command => {
    const program = new Command();
    program.exitOverride();
    return program;
  };

  beforeEach(() => {
    restoreConsole = suppressConsole();
    restoreExit = mockProcessExit();
    MockProductHandler = require('../handlers/product.handler').ProductHandler;
    MockProductHandler.mockClear();
    mockAuthSuccess(authAdapter as jest.Mocked<typeof authAdapter>, configManager as jest.Mocked<typeof configManager>);
  });

  afterEach(() => {
    restoreConsole();
    restoreExit();
  });

  describe('list action', () => {
    it('[P0] should call listProducts handler with correct params', async () => {
      const mockHandler = { listProducts: jest.fn().mockResolvedValue(undefined) };
      MockProductHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerProductCommands(program);
      await program.parseAsync(['node', 'test', 'product', 'list', '-c', '123456']);

      expect(MockProductHandler).toHaveBeenCalled();
      expect(mockHandler.listProducts).toHaveBeenCalledWith({
        page: 1,
        size: 20,
        channelId: '123456',
        platform: undefined,
        output: 'table',
      });
    });

    it('[P1] should call listProducts with pagination options', async () => {
      const mockHandler = { listProducts: jest.fn().mockResolvedValue(undefined) };
      MockProductHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerProductCommands(program);
      await program.parseAsync([
        'node', 'test', 'product', 'list',
        '-c', '123456',
        '-P', '2',
        '-s', '50',
        '-o', 'json',
      ]);

      expect(mockHandler.listProducts).toHaveBeenCalledWith({
        page: 2,
        size: 50,
        channelId: '123456',
        platform: undefined,
        output: 'json',
      });
    });

    it('[P1] should call listProducts with platform option', async () => {
      const mockHandler = { listProducts: jest.fn().mockResolvedValue(undefined) };
      MockProductHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerProductCommands(program);
      await program.parseAsync(['node', 'test', 'product', 'list', '--platform']);

      expect(mockHandler.listProducts).toHaveBeenCalledWith({
        page: 1,
        size: 20,
        channelId: undefined,
        platform: true,
        output: 'table',
      });
    });

    it('[P1] should handle API errors in list action', async () => {
      const mockHandler = { listProducts: jest.fn().mockRejectedValue(new Error('List failed')) };
      MockProductHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerProductCommands(program);
      await expect(program.parseAsync(['node', 'test', 'product', 'list', '-c', '123456'])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });

  describe('add action', () => {
    it('[P0] should call addProduct handler with correct params', async () => {
      const mockHandler = { addProduct: jest.fn().mockResolvedValue(undefined) };
      MockProductHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerProductCommands(program);
      await program.parseAsync([
        'node', 'test', 'product', 'add',
        '-c', '123456',
        '-n', 'Test Product',
        '--status', '1',
        '--link-type', '10',
        '-l', 'https://example.com',
      ]);

      expect(MockProductHandler).toHaveBeenCalled();
      expect(mockHandler.addProduct).toHaveBeenCalledWith({
        channelId: '123456',
        name: 'Test Product',
        status: 1,
        linkType: 10,
        productType: 'normal',
        cover: undefined,
        link: 'https://example.com',
        pcLink: undefined,
        mobileLink: undefined,
        wxMiniprogramLink: undefined,
        wxMiniprogramOriginalId: undefined,
        mobileAppLink: undefined,
        androidLink: undefined,
        iosLink: undefined,
        params: undefined,
        productDesc: undefined,
        features: undefined,
        btnShow: undefined,
        yield: undefined,
        priceType: undefined,
        realPrice: undefined,
        customPrice: undefined,
        originalPriceType: undefined,
        price: undefined,
        customOrignalPrice: undefined,
        output: 'table',
      });
    });

    it('[P1] should call addProduct with all options', async () => {
      const mockHandler = { addProduct: jest.fn().mockResolvedValue(undefined) };
      MockProductHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerProductCommands(program);
      await program.parseAsync([
        'node', 'test', 'product', 'add',
        '-c', '123456',
        '-n', 'Full Product',
        '--status', '1',
        '--link-type', '11',
        '-t', 'finance',
        '--cover', 'https://example.com/cover.jpg',
        '--pc-link', 'https://pc.example.com',
        '--mobile-link', 'https://m.example.com',
        '--real-price', '99.99',
        '--price', '199.99',
        '-o', 'json',
      ]);

      expect(mockHandler.addProduct).toHaveBeenCalledWith({
        channelId: '123456',
        name: 'Full Product',
        status: 1,
        linkType: 11,
        productType: 'finance',
        cover: 'https://example.com/cover.jpg',
        link: undefined,
        pcLink: 'https://pc.example.com',
        mobileLink: 'https://m.example.com',
        wxMiniprogramLink: undefined,
        wxMiniprogramOriginalId: undefined,
        mobileAppLink: undefined,
        androidLink: undefined,
        iosLink: undefined,
        params: undefined,
        productDesc: undefined,
        features: undefined,
        btnShow: undefined,
        yield: undefined,
        priceType: undefined,
        realPrice: 99.99,
        customPrice: undefined,
        originalPriceType: undefined,
        price: 199.99,
        customOrignalPrice: undefined,
        output: 'json',
      });
    });

    it('[P1] should handle API errors in add action', async () => {
      const mockHandler = { addProduct: jest.fn().mockRejectedValue(new Error('Add failed')) };
      MockProductHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerProductCommands(program);
      await expect(program.parseAsync([
        'node', 'test', 'product', 'add',
        '-c', '123456',
        '-n', 'Test',
        '--status', '1',
        '--link-type', '10',
      ])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });

  describe('update action', () => {
    it('[P0] should call updateProduct handler with correct params', async () => {
      const mockHandler = { updateProduct: jest.fn().mockResolvedValue(undefined) };
      MockProductHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerProductCommands(program);
      await program.parseAsync([
        'node', 'test', 'product', 'update',
        '-c', '123456',
        '-p', '789',
        '-n', 'Updated Product',
        '--status', '2',
        '--link-type', '10',
      ]);

      expect(MockProductHandler).toHaveBeenCalled();
      expect(mockHandler.updateProduct).toHaveBeenCalledWith({
        channelId: '123456',
        productId: 789,
        name: 'Updated Product',
        status: 2,
        linkType: 10,
        productType: undefined,
        cover: undefined,
        link: undefined,
        pcLink: undefined,
        mobileLink: undefined,
        wxMiniprogramLink: undefined,
        wxMiniprogramOriginalId: undefined,
        mobileAppLink: undefined,
        androidLink: undefined,
        iosLink: undefined,
        params: undefined,
        productDesc: undefined,
        features: undefined,
        btnShow: undefined,
        yield: undefined,
        priceType: undefined,
        realPrice: undefined,
        customPrice: undefined,
        originalPriceType: undefined,
        price: undefined,
        customOrignalPrice: undefined,
        output: 'table',
      });
    });

    it('[P1] should handle API errors in update action', async () => {
      const mockHandler = { updateProduct: jest.fn().mockRejectedValue(new Error('Update failed')) };
      MockProductHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerProductCommands(program);
      await expect(program.parseAsync([
        'node', 'test', 'product', 'update',
        '-c', '123456',
        '-p', '789',
      ])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });

  describe('delete action', () => {
    it('[P0] should call deleteProduct handler with correct params', async () => {
      const mockHandler = { deleteProduct: jest.fn().mockResolvedValue(undefined) };
      MockProductHandler.mockImplementation(() => mockHandler);

      const program = createTestProgram();
      registerProductCommands(program);
      await program.parseAsync([
        'node', 'test', 'product', 'delete',
        '-c', '123456',
        '-p', '789',
        '--force',
      ]);

      expect(MockProductHandler).toHaveBeenCalled();
      expect(mockHandler.deleteProduct).toHaveBeenCalledWith({
        channelId: '123456',
        productId: 789,
        force: true,
        output: 'table',
      });
    });

    it('[P1] should handle API errors in delete action', async () => {
      const mockHandler = { deleteProduct: jest.fn().mockRejectedValue(new Error('Delete failed')) };
      MockProductHandler.mockImplementation(() => mockHandler);
      const { logError } = require('../utils/errors');

      const program = createTestProgram();
      registerProductCommands(program);
      await expect(program.parseAsync([
        'node', 'test', 'product', 'delete',
        '-c', '123456',
        '-p', '789',
      ])).rejects.toThrow('process.exit:1');

      expect(logError).toHaveBeenCalled();
    });
  });
});
