/**
 * @fileoverview Unit tests for Document Commands - ATDD Failing Tests (RED Phase)
 * @story 9.5: 课件文档管理命令
 *
 * These tests will FAIL until the feature is implemented (TDD red phase)
 *
 * Acceptance Criteria:
 * - AC1: `document list` 命令支持 `--channel-id` 参数获取频道课件列表
 * - AC2: `document list` 命令支持 `--status` 参数过滤文档状态
 * - AC3: `document list` 命令支持分页参数（`--page`, `--page-size`）
 * - AC4: `document upload` 命令支持通过 `--url` 参数上传远程文件
 * - AC5: `document upload` 命令支持 `--type` 参数设置转换类型
 * - AC6: `document upload` 命令支持 `--doc-name` 参数设置文档名称
 * - AC7: `document upload` 命令支持 `--callback-url` 参数设置回调地址
 * - AC8: `document delete` 命令支持 `--file-id` 参数删除指定文档
 * - AC9: `document delete` 命令需要确认提示（可通过 `--force` 跳过）
 * - AC10: `document status` 命令支持查询文档转码状态
 * - AC11: 所有命令支持 `--output` 参数选择 table 或 json 输出格式
 * - AC12: 表格输出格式清晰，显示文档信息
 */

import { Command } from 'commander';
import { registerDocumentCommands, validateStatus, validateOutputFormat, validateDocType } from './document.commands';
import { authAdapter } from '../config/auth-adapter';

// Mock the DocumentHandler
jest.mock('../handlers/document.handler', () => ({
  DocumentHandler: jest.fn().mockImplementation(() => ({
    listDocuments: jest.fn().mockResolvedValue(undefined),
    uploadDocument: jest.fn().mockResolvedValue(undefined),
    deleteDocument: jest.fn().mockResolvedValue(undefined),
    getDocumentStatus: jest.fn().mockResolvedValue(undefined),
  })),
}));

// Mock the auth adapter
jest.mock('../config/auth-adapter', () => ({
  authAdapter: {
    tryGetAuthConfig: jest.fn().mockReturnValue({
      config: { appId: 'test-app-id', appSecret: 'test-app-secret' },
      source: 'environment',
    }),
    getStatusMessage: jest.fn().mockReturnValue('No authentication configured'),
    getDiagnostics: jest.fn().mockReturnValue({
      availableSources: [],
      errors: [],
    }),
  },
}));

// Mock the config manager
jest.mock('../config/manager', () => ({
  configManager: {
    load: jest.fn().mockResolvedValue({
      config: {
        baseUrl: 'https://api.polyv.net',
        timeout: 30000,
        debug: false,
      },
    }),
  },
}));

describe('Document Commands (Story 9.5 - ATDD RED Phase)', () => {
  let program: Command;
  let mockExit: jest.SpyInstance;

  beforeEach(() => {
    program = new Command();
    program.exitOverride();
    mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit');
    });
  });

  afterEach(() => {
    mockExit.mockRestore();
    jest.clearAllMocks();
  });

  // ============================================
  // document command group
  // ============================================

  describe('document command group', () => {
    it('should register document command group', () => {
      registerDocumentCommands(program);

      const commands = program.commands;
      const documentCmd = commands.find(cmd => cmd.name() === 'document');

      expect(documentCmd).toBeDefined();
      expect(documentCmd?.description()).toContain('课件');
    });
  });

  // ============================================
  // document list command
  // ============================================

  describe('document list command', () => {
    it('should have document list subcommand', () => {
      registerDocumentCommands(program);

      const documentCmd = program.commands.find(cmd => cmd.name() === 'document');
      const listCmd = documentCmd?.commands.find(cmd => cmd.name() === 'list');

      expect(listCmd).toBeDefined();
      expect(listCmd?.description()).toContain('列表');
    });

    it('should require --channel-id option', async () => {
      registerDocumentCommands(program);

      await expect(
        program.parseAsync(['node', 'test', 'document', 'list'], { from: 'user' })
      ).rejects.toThrow();
    });

    it('should accept --channel-id with short form -c', () => {
      registerDocumentCommands(program);

      const documentCmd = program.commands.find(cmd => cmd.name() === 'document');
      const listCmd = documentCmd?.commands.find(cmd => cmd.name() === 'list');

      const channelIdOption = listCmd?.options.find(opt =>
        opt.long === '--channel-id' || opt.short === '-c'
      );

      expect(channelIdOption).toBeDefined();
    });

    it('should have required --channel-id option', () => {
      registerDocumentCommands(program);

      const documentCmd = program.commands.find(cmd => cmd.name() === 'document');
      const listCmd = documentCmd?.commands.find(cmd => cmd.name() === 'list');

      const channelIdOption = listCmd?.options.find(opt => opt.long === '--channel-id');
      expect(channelIdOption?.required).toBe(true);
    });
  });

  // ============================================
  // AC2: --status option for list
  // ============================================

  describe('AC2: --status option for list', () => {
    it('should have --status option', () => {
      registerDocumentCommands(program);

      const documentCmd = program.commands.find(cmd => cmd.name() === 'document');
      const listCmd = documentCmd?.commands.find(cmd => cmd.name() === 'list');

      const statusOption = listCmd?.options.find(opt => opt.long === '--status');

      expect(statusOption).toBeDefined();
    });

    it('should accept valid status values', () => {
      const validStatuses = ['normal', 'waitUpload', 'failUpload', 'waitConvert', 'failConvert'];

      validStatuses.forEach((status) => {
        expect(validateStatus(status)).toBe(status);
      });
    });

    it('should reject invalid status values', () => {
      expect(() => validateStatus('invalid')).toThrow();
    });
  });

  // ============================================
  // AC3: Pagination options for list
  // ============================================

  describe('AC3: Pagination options for list', () => {
    it('should have --page option with default value 1', () => {
      registerDocumentCommands(program);

      const documentCmd = program.commands.find(cmd => cmd.name() === 'document');
      const listCmd = documentCmd?.commands.find(cmd => cmd.name() === 'list');

      const pageOption = listCmd?.options.find(opt => opt.long === '--page');

      expect(pageOption).toBeDefined();
      expect(pageOption?.defaultValue).toBe(1);
    });

    it('should have --page-size option with default value 10', () => {
      registerDocumentCommands(program);

      const documentCmd = program.commands.find(cmd => cmd.name() === 'document');
      const listCmd = documentCmd?.commands.find(cmd => cmd.name() === 'list');

      const pageSizeOption = listCmd?.options.find(opt => opt.long === '--page-size');

      expect(pageSizeOption).toBeDefined();
      expect(pageSizeOption?.defaultValue).toBe(10);
    });
  });

  // ============================================
  // AC11: --output option for list
  // ============================================

  describe('AC11: --output option for list', () => {
    it('should have --output option with short form -o', () => {
      registerDocumentCommands(program);

      const documentCmd = program.commands.find(cmd => cmd.name() === 'document');
      const listCmd = documentCmd?.commands.find(cmd => cmd.name() === 'list');

      const outputOption = listCmd?.options.find(opt =>
        opt.long === '--output' || opt.short === '-o'
      );

      expect(outputOption).toBeDefined();
    });

    it('should have default output value of table', () => {
      registerDocumentCommands(program);

      const documentCmd = program.commands.find(cmd => cmd.name() === 'document');
      const listCmd = documentCmd?.commands.find(cmd => cmd.name() === 'list');

      const outputOption = listCmd?.options.find(opt => opt.long === '--output');

      expect(outputOption?.defaultValue).toBe('table');
    });

    it('should accept table value', () => {
      expect(validateOutputFormat('table')).toBe('table');
    });

    it('should accept json value', () => {
      expect(validateOutputFormat('json')).toBe('json');
    });

    it('should reject invalid output values', () => {
      expect(() => validateOutputFormat('xml')).toThrow();
    });
  });

  // ============================================
  // document list - Help Text
  // ============================================

  describe('document list - Help Text', () => {
    it('should include examples in help text', () => {
      registerDocumentCommands(program);

      const documentCmd = program.commands.find(cmd => cmd.name() === 'document');
      const listCmd = documentCmd?.commands.find(cmd => cmd.name() === 'list');

      const helpText = listCmd?.helpInformation() || '';

      expect(helpText).toContain('Examples');
      expect(helpText).toContain('document list');
      expect(helpText).toContain('channel-id');
    });

    it('should describe all options in help text', () => {
      registerDocumentCommands(program);

      const documentCmd = program.commands.find(cmd => cmd.name() === 'document');
      const listCmd = documentCmd?.commands.find(cmd => cmd.name() === 'list');

      const helpText = listCmd?.helpInformation() || '';

      expect(helpText).toContain('--channel-id');
      expect(helpText).toContain('--status');
      expect(helpText).toContain('--page');
      expect(helpText).toContain('--page-size');
      expect(helpText).toContain('--output');
    });
  });

  // ============================================
  // document upload command
  // ============================================

  describe('document upload command', () => {
    it('should have document upload subcommand', () => {
      registerDocumentCommands(program);

      const documentCmd = program.commands.find(cmd => cmd.name() === 'document');
      const uploadCmd = documentCmd?.commands.find(cmd => cmd.name() === 'upload');

      expect(uploadCmd).toBeDefined();
      expect(uploadCmd?.description()).toContain('上传');
    });

    it('should require --channel-id option', async () => {
      registerDocumentCommands(program);

      await expect(
        program.parseAsync(['node', 'test', 'document', 'upload', '--url', 'https://example.com/doc.pdf'], { from: 'user' })
      ).rejects.toThrow();
    });

    it('should require --url option', async () => {
      registerDocumentCommands(program);

      await expect(
        program.parseAsync(['node', 'test', 'document', 'upload', '-c', '3151318'], { from: 'user' })
      ).rejects.toThrow();
    });

    it('should have required --url option', () => {
      registerDocumentCommands(program);

      const documentCmd = program.commands.find(cmd => cmd.name() === 'document');
      const uploadCmd = documentCmd?.commands.find(cmd => cmd.name() === 'upload');

      const urlOption = uploadCmd?.options.find(opt => opt.long === '--url');
      expect(urlOption?.required).toBe(true);
    });
  });

  // ============================================
  // AC5: --type option for upload
  // ============================================

  describe('AC5: --type option for upload', () => {
    it('should have --type option', () => {
      registerDocumentCommands(program);

      const documentCmd = program.commands.find(cmd => cmd.name() === 'document');
      const uploadCmd = documentCmd?.commands.find(cmd => cmd.name() === 'upload');

      const typeOption = uploadCmd?.options.find(opt => opt.long === '--type');

      expect(typeOption).toBeDefined();
    });

    it('should have default type value of common', () => {
      registerDocumentCommands(program);

      const documentCmd = program.commands.find(cmd => cmd.name() === 'document');
      const uploadCmd = documentCmd?.commands.find(cmd => cmd.name() === 'upload');

      const typeOption = uploadCmd?.options.find(opt => opt.long === '--type');
      expect(typeOption?.defaultValue).toBe('common');
    });

    it('should accept valid type values', () => {
      expect(validateDocType('common')).toBe('common');
      expect(validateDocType('animate')).toBe('animate');
    });

    it('should reject invalid type values', () => {
      expect(() => validateDocType('invalid')).toThrow();
    });
  });

  // ============================================
  // AC6: --doc-name option for upload
  // ============================================

  describe('AC6: --doc-name option for upload', () => {
    it('should have --doc-name option', () => {
      registerDocumentCommands(program);

      const documentCmd = program.commands.find(cmd => cmd.name() === 'document');
      const uploadCmd = documentCmd?.commands.find(cmd => cmd.name() === 'upload');

      const docNameOption = uploadCmd?.options.find(opt => opt.long === '--doc-name');

      expect(docNameOption).toBeDefined();
    });

    it('should be optional', () => {
      registerDocumentCommands(program);

      const documentCmd = program.commands.find(cmd => cmd.name() === 'document');
      const uploadCmd = documentCmd?.commands.find(cmd => cmd.name() === 'upload');

      const docNameOption = uploadCmd?.options.find(opt => opt.long === '--doc-name');
      expect(docNameOption?.required).toBeFalsy();
    });
  });

  // ============================================
  // AC7: --callback-url option for upload
  // ============================================

  describe('AC7: --callback-url option for upload', () => {
    it('should have --callback-url option', () => {
      registerDocumentCommands(program);

      const documentCmd = program.commands.find(cmd => cmd.name() === 'document');
      const uploadCmd = documentCmd?.commands.find(cmd => cmd.name() === 'upload');

      const callbackUrlOption = uploadCmd?.options.find(opt => opt.long === '--callback-url');

      expect(callbackUrlOption).toBeDefined();
    });

    it('should be optional', () => {
      registerDocumentCommands(program);

      const documentCmd = program.commands.find(cmd => cmd.name() === 'document');
      const uploadCmd = documentCmd?.commands.find(cmd => cmd.name() === 'upload');

      const callbackUrlOption = uploadCmd?.options.find(opt => opt.long === '--callback-url');
      expect(callbackUrlOption?.required).toBeFalsy();
    });
  });

  // ============================================
  // document upload - Help Text
  // ============================================

  describe('document upload - Help Text', () => {
    it('should include examples in help text', () => {
      registerDocumentCommands(program);

      const documentCmd = program.commands.find(cmd => cmd.name() === 'document');
      const uploadCmd = documentCmd?.commands.find(cmd => cmd.name() === 'upload');

      const helpText = uploadCmd?.helpInformation() || '';

      expect(helpText).toContain('Examples');
      expect(helpText).toContain('document upload');
      expect(helpText).toContain('url');
    });

    it('should describe all options in help text', () => {
      registerDocumentCommands(program);

      const documentCmd = program.commands.find(cmd => cmd.name() === 'document');
      const uploadCmd = documentCmd?.commands.find(cmd => cmd.name() === 'upload');

      const helpText = uploadCmd?.helpInformation() || '';

      expect(helpText).toContain('--channel-id');
      expect(helpText).toContain('--url');
      expect(helpText).toContain('--type');
      expect(helpText).toContain('--doc-name');
      expect(helpText).toContain('--callback-url');
      expect(helpText).toContain('--output');
    });
  });

  // ============================================
  // document delete command
  // ============================================

  describe('document delete command', () => {
    it('should have document delete subcommand', () => {
      registerDocumentCommands(program);

      const documentCmd = program.commands.find(cmd => cmd.name() === 'document');
      const deleteCmd = documentCmd?.commands.find(cmd => cmd.name() === 'delete');

      expect(deleteCmd).toBeDefined();
      expect(deleteCmd?.description()).toContain('删除');
    });

    it('should require --channel-id option', async () => {
      registerDocumentCommands(program);

      await expect(
        program.parseAsync(['node', 'test', 'document', 'delete', '--file-id', 'abc123'], { from: 'user' })
      ).rejects.toThrow();
    });

    it('should require --file-id option', async () => {
      registerDocumentCommands(program);

      await expect(
        program.parseAsync(['node', 'test', 'document', 'delete', '-c', '3151318'], { from: 'user' })
      ).rejects.toThrow();
    });

    it('should have required --file-id option', () => {
      registerDocumentCommands(program);

      const documentCmd = program.commands.find(cmd => cmd.name() === 'document');
      const deleteCmd = documentCmd?.commands.find(cmd => cmd.name() === 'delete');

      const fileIdOption = deleteCmd?.options.find(opt => opt.long === '--file-id');
      expect(fileIdOption?.required).toBe(true);
    });
  });

  // ============================================
  // --type option for delete (old/new)
  // ============================================

  describe('--type option for delete', () => {
    it('should have --type option', () => {
      registerDocumentCommands(program);

      const documentCmd = program.commands.find(cmd => cmd.name() === 'document');
      const deleteCmd = documentCmd?.commands.find(cmd => cmd.name() === 'delete');

      const typeOption = deleteCmd?.options.find(opt => opt.long === '--type');

      expect(typeOption).toBeDefined();
    });

    it('should be optional', () => {
      registerDocumentCommands(program);

      const documentCmd = program.commands.find(cmd => cmd.name() === 'document');
      const deleteCmd = documentCmd?.commands.find(cmd => cmd.name() === 'delete');

      const typeOption = deleteCmd?.options.find(opt => opt.long === '--type');
      expect(typeOption?.required).toBeFalsy();
    });
  });

  // ============================================
  // AC9: --force flag for delete
  // ============================================

  describe('AC9: --force flag for delete', () => {
    it('should have --force flag option', () => {
      registerDocumentCommands(program);

      const documentCmd = program.commands.find(cmd => cmd.name() === 'document');
      const deleteCmd = documentCmd?.commands.find(cmd => cmd.name() === 'delete');

      const forceOption = deleteCmd?.options.find(opt => opt.long === '--force');

      expect(forceOption).toBeDefined();
    });

    it('should have default force value of false', () => {
      registerDocumentCommands(program);

      const documentCmd = program.commands.find(cmd => cmd.name() === 'document');
      const deleteCmd = documentCmd?.commands.find(cmd => cmd.name() === 'delete');

      const forceOption = deleteCmd?.options.find(opt => opt.long === '--force');
      expect(forceOption?.defaultValue).toBe(false);
    });
  });

  // ============================================
  // document delete - Help Text
  // ============================================

  describe('document delete - Help Text', () => {
    it('should include examples in help text', () => {
      registerDocumentCommands(program);

      const documentCmd = program.commands.find(cmd => cmd.name() === 'document');
      const deleteCmd = documentCmd?.commands.find(cmd => cmd.name() === 'delete');

      const helpText = deleteCmd?.helpInformation() || '';

      expect(helpText).toContain('Examples');
      expect(helpText).toContain('document delete');
      expect(helpText).toContain('file-id');
    });

    it('should describe all options in help text', () => {
      registerDocumentCommands(program);

      const documentCmd = program.commands.find(cmd => cmd.name() === 'document');
      const deleteCmd = documentCmd?.commands.find(cmd => cmd.name() === 'delete');

      const helpText = deleteCmd?.helpInformation() || '';

      expect(helpText).toContain('--channel-id');
      expect(helpText).toContain('--file-id');
      expect(helpText).toContain('--type');
      expect(helpText).toContain('--force');
      expect(helpText).toContain('--output');
    });

    it('should include force flag in help text', () => {
      registerDocumentCommands(program);

      const documentCmd = program.commands.find(cmd => cmd.name() === 'document');
      const deleteCmd = documentCmd?.commands.find(cmd => cmd.name() === 'delete');

      const helpText = deleteCmd?.helpInformation() || '';

      expect(helpText).toContain('--force');
    });
  });

  // ============================================
  // document status command
  // ============================================

  describe('document status command', () => {
    it('should have document status subcommand', () => {
      registerDocumentCommands(program);

      const documentCmd = program.commands.find(cmd => cmd.name() === 'document');
      const statusCmd = documentCmd?.commands.find(cmd => cmd.name() === 'status');

      expect(statusCmd).toBeDefined();
      expect(statusCmd?.description()).toContain('转码状态');
    });

    it('should require --channel-id option', async () => {
      registerDocumentCommands(program);

      await expect(
        program.parseAsync(['node', 'test', 'document', 'status', '--file-id', 'abc123'], { from: 'user' })
      ).rejects.toThrow();
    });

    it('should require --file-id option', async () => {
      registerDocumentCommands(program);

      await expect(
        program.parseAsync(['node', 'test', 'document', 'status', '-c', '3151318'], { from: 'user' })
      ).rejects.toThrow();
    });

    it('should have required --file-id option', () => {
      registerDocumentCommands(program);

      const documentCmd = program.commands.find(cmd => cmd.name() === 'document');
      const statusCmd = documentCmd?.commands.find(cmd => cmd.name() === 'status');

      const fileIdOption = statusCmd?.options.find(opt => opt.long === '--file-id');
      expect(fileIdOption?.required).toBe(true);
    });
  });

  // ============================================
  // document status - Help Text
  // ============================================

  describe('document status - Help Text', () => {
    it('should include examples in help text', () => {
      registerDocumentCommands(program);

      const documentCmd = program.commands.find(cmd => cmd.name() === 'document');
      const statusCmd = documentCmd?.commands.find(cmd => cmd.name() === 'status');

      const helpText = statusCmd?.helpInformation() || '';

      expect(helpText).toContain('Examples');
      expect(helpText).toContain('document status');
      expect(helpText).toContain('file-id');
    });

    it('should describe all options in help text', () => {
      registerDocumentCommands(program);

      const documentCmd = program.commands.find(cmd => cmd.name() === 'document');
      const statusCmd = documentCmd?.commands.find(cmd => cmd.name() === 'status');

      const helpText = statusCmd?.helpInformation() || '';

      expect(helpText).toContain('--channel-id');
      expect(helpText).toContain('--file-id');
      expect(helpText).toContain('--output');
    });
  });

  // ============================================
  // Command Execution - Options Parsing
  // ============================================

  describe('Command Execution - Options Parsing', () => {
    it('should parse all options correctly for list command', () => {
      registerDocumentCommands(program);

      const documentCmd = program.commands.find(cmd => cmd.name() === 'document');
      const listCmd = documentCmd?.commands.find(cmd => cmd.name() === 'list');

      const options = listCmd?.options || [];

      const channelIdOpt = options.find(o => o.long === '--channel-id');
      expect(channelIdOpt?.required).toBe(true);

      const statusOpt = options.find(o => o.long === '--status');
      expect(statusOpt).toBeDefined();

      const pageOpt = options.find(o => o.long === '--page');
      expect(pageOpt?.defaultValue).toBe(1);

      const pageSizeOpt = options.find(o => o.long === '--page-size');
      expect(pageSizeOpt?.defaultValue).toBe(10);

      const outputOpt = options.find(o => o.long === '--output');
      expect(outputOpt?.defaultValue).toBe('table');
    });

    it('should parse all options correctly for upload command', () => {
      registerDocumentCommands(program);

      const documentCmd = program.commands.find(cmd => cmd.name() === 'document');
      const uploadCmd = documentCmd?.commands.find(cmd => cmd.name() === 'upload');

      const options = uploadCmd?.options || [];

      const channelIdOpt = options.find(o => o.long === '--channel-id');
      expect(channelIdOpt?.required).toBe(true);

      const urlOpt = options.find(o => o.long === '--url');
      expect(urlOpt?.required).toBe(true);

      const typeOpt = options.find(o => o.long === '--type');
      expect(typeOpt?.defaultValue).toBe('common');

      const docNameOpt = options.find(o => o.long === '--doc-name');
      expect(docNameOpt?.required).toBeFalsy();

      const callbackUrlOpt = options.find(o => o.long === '--callback-url');
      expect(callbackUrlOpt?.required).toBeFalsy();

      const outputOpt = options.find(o => o.long === '--output');
      expect(outputOpt?.defaultValue).toBe('table');
    });

    it('should parse all options correctly for delete command', () => {
      registerDocumentCommands(program);

      const documentCmd = program.commands.find(cmd => cmd.name() === 'document');
      const deleteCmd = documentCmd?.commands.find(cmd => cmd.name() === 'delete');

      const options = deleteCmd?.options || [];

      const channelIdOpt = options.find(o => o.long === '--channel-id');
      expect(channelIdOpt?.required).toBe(true);

      const fileIdOpt = options.find(o => o.long === '--file-id');
      expect(fileIdOpt?.required).toBe(true);

      const typeOpt = options.find(o => o.long === '--type');
      expect(typeOpt?.required).toBeFalsy();

      const forceOpt = options.find(o => o.long === '--force');
      expect(forceOpt?.defaultValue).toBe(false);

      const outputOpt = options.find(o => o.long === '--output');
      expect(outputOpt?.defaultValue).toBe('table');
    });

    it('should parse all options correctly for status command', () => {
      registerDocumentCommands(program);

      const documentCmd = program.commands.find(cmd => cmd.name() === 'document');
      const statusCmd = documentCmd?.commands.find(cmd => cmd.name() === 'status');

      const options = statusCmd?.options || [];

      const channelIdOpt = options.find(o => o.long === '--channel-id');
      expect(channelIdOpt?.required).toBe(true);

      const fileIdOpt = options.find(o => o.long === '--file-id');
      expect(fileIdOpt?.required).toBe(true);

      const outputOpt = options.find(o => o.long === '--output');
      expect(outputOpt?.defaultValue).toBe('table');
    });
  });

  // ============================================
  // Action Execution Tests
  // ============================================
  describe('action execution', () => {
    it('[P0] should call listDocuments handler with correct params', async () => {
      const { DocumentHandler } = await import('../handlers/document.handler');
      const mockHandler = {
        listDocuments: jest.fn().mockResolvedValue(undefined),
      };
      (DocumentHandler as jest.Mock).mockImplementation(() => mockHandler);

      const program = new Command();
      registerDocumentCommands(program);
      await program.parseAsync(['node', 'test', 'document', 'list', '-c', '123456']);

      expect(mockHandler.listDocuments).toHaveBeenCalledWith(
        expect.objectContaining({ channelId: '123456' })
      );
    });

    it('[P0] should call uploadDocument handler with correct params', async () => {
      const { DocumentHandler } = await import('../handlers/document.handler');
      const mockHandler = {
        uploadDocument: jest.fn().mockResolvedValue(undefined),
      };
      (DocumentHandler as jest.Mock).mockImplementation(() => mockHandler);

      const program = new Command();
      registerDocumentCommands(program);
      await program.parseAsync([
        'node', 'test', 'document', 'upload',
        '-c', '123456',
        '--url', 'https://example.com/doc.pdf',
      ]);

      expect(mockHandler.uploadDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '123456',
          url: 'https://example.com/doc.pdf',
        })
      );
    });

    it('[P0] should call deleteDocument handler with correct params', async () => {
      const { DocumentHandler } = await import('../handlers/document.handler');
      const mockHandler = {
        deleteDocument: jest.fn().mockResolvedValue(undefined),
      };
      (DocumentHandler as jest.Mock).mockImplementation(() => mockHandler);

      const program = new Command();
      registerDocumentCommands(program);
      await program.parseAsync([
        'node', 'test', 'document', 'delete',
        '-c', '123456',
        '--file-id', 'file789',
        '--force',
      ]);

      expect(mockHandler.deleteDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '123456',
          fileId: 'file789',
        })
      );
    });

    it('[P0] should call getDocumentStatus handler with correct params', async () => {
      const { DocumentHandler } = await import('../handlers/document.handler');
      const mockHandler = {
        getDocumentStatus: jest.fn().mockResolvedValue(undefined),
      };
      (DocumentHandler as jest.Mock).mockImplementation(() => mockHandler);

      const program = new Command();
      registerDocumentCommands(program);
      await program.parseAsync([
        'node', 'test', 'document', 'status',
        '-c', '123456',
        '--file-id', 'file789',
      ]);

      expect(mockHandler.getDocumentStatus).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: '123456',
          fileId: 'file789',
        })
      );
    });

    it('[P1] should pass pagination options to listDocuments', async () => {
      const { DocumentHandler } = await import('../handlers/document.handler');
      const mockHandler = {
        listDocuments: jest.fn().mockResolvedValue(undefined),
      };
      (DocumentHandler as jest.Mock).mockImplementation(() => mockHandler);

      const program = new Command();
      registerDocumentCommands(program);
      await program.parseAsync([
        'node', 'test', 'document', 'list',
        '-c', '123456',
        '--page', '2',
        '--page-size', '20',
      ]);

      expect(mockHandler.listDocuments).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          pageSize: 20,
        })
      );
    });

    it('[P1] should pass status filter to listDocuments', async () => {
      const { DocumentHandler } = await import('../handlers/document.handler');
      const mockHandler = {
        listDocuments: jest.fn().mockResolvedValue(undefined),
      };
      (DocumentHandler as jest.Mock).mockImplementation(() => mockHandler);

      const program = new Command();
      registerDocumentCommands(program);
      await program.parseAsync([
        'node', 'test', 'document', 'list',
        '-c', '123456',
        '--status', 'normal',
      ]);

      expect(mockHandler.listDocuments).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'normal' })
      );
    });

    it('[P1] should pass output option to handlers', async () => {
      const { DocumentHandler } = await import('../handlers/document.handler');
      const mockHandler = {
        listDocuments: jest.fn().mockResolvedValue(undefined),
      };
      (DocumentHandler as jest.Mock).mockImplementation(() => mockHandler);

      const program = new Command();
      registerDocumentCommands(program);
      await program.parseAsync(['node', 'test', 'document', 'list', '-c', '123456', '-o', 'json']);

      expect(mockHandler.listDocuments).toHaveBeenCalledWith(
        expect.objectContaining({ output: 'json' })
      );
    });

    it('[P1] should pass docName and callbackUrl to uploadDocument', async () => {
      const { DocumentHandler } = await import('../handlers/document.handler');
      const mockHandler = {
        uploadDocument: jest.fn().mockResolvedValue(undefined),
      };
      (DocumentHandler as jest.Mock).mockImplementation(() => mockHandler);

      const program = new Command();
      registerDocumentCommands(program);
      await program.parseAsync([
        'node', 'test', 'document', 'upload',
        '-c', '123456',
        '--url', 'https://example.com/doc.pdf',
        '--doc-name', 'My Document',
        '--callback-url', 'https://example.com/callback',
      ]);

      expect(mockHandler.uploadDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          docName: 'My Document',
          callbackUrl: 'https://example.com/callback',
        })
      );
    });

    it('[P1] should handle handler errors gracefully', async () => {
      const { DocumentHandler } = await import('../handlers/document.handler');
      const mockHandler = {
        listDocuments: jest.fn().mockRejectedValue(new Error('API Error')),
      };
      (DocumentHandler as jest.Mock).mockImplementation(() => mockHandler);

      const program = new Command();
      program.exitOverride();
      jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit');
      });
      registerDocumentCommands(program);

      await expect(
        program.parseAsync(['node', 'test', 'document', 'list', '-c', '123456'])
      ).rejects.toThrow();
    });
  });

  // ============================================
  // Verbose Logging Tests
  // ============================================
  describe('verbose logging', () => {
    it('[P1] should display auth source when verbose is enabled for list', async () => {
      const { DocumentHandler } = await import('../handlers/document.handler');
      const mockHandler = {
        listDocuments: jest.fn().mockResolvedValue(undefined),
      };
      (DocumentHandler as jest.Mock).mockImplementation(() => mockHandler);

      // Mock auth with accountName
      const mockAuthResult = {
        config: { appId: 'test-app-id', appSecret: 'test-app-secret' },
        source: 'session',
        accountName: 'test-account',
      };
      (authAdapter.tryGetAuthConfig as jest.Mock).mockReturnValue(mockAuthResult);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const program = new Command();
      program
        .option('--verbose', 'Enable verbose logging')
        .exitOverride();
      registerDocumentCommands(program);

      await program.parseAsync([
        'node', 'test',
        '--verbose',
        'document', 'list',
        '-c', '123456',
      ]);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Authentication Source'));
      consoleSpy.mockRestore();
    });

    it('[P1] should not display auth source when verbose is disabled', async () => {
      const { DocumentHandler } = await import('../handlers/document.handler');
      const mockHandler = {
        listDocuments: jest.fn().mockResolvedValue(undefined),
      };
      (DocumentHandler as jest.Mock).mockImplementation(() => mockHandler);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const program = new Command();
      program.exitOverride();
      registerDocumentCommands(program);

      await program.parseAsync(['node', 'test', 'document', 'list', '-c', '123456']);

      expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('Authentication Source'));
      consoleSpy.mockRestore();
    });
  });

  // ============================================
  // Error Handling Path Tests
  // ============================================
  describe('error handling paths', () => {
    it('[P1] should handle authentication error with diagnostics for list', async () => {
      const { DocumentHandler } = await import('../handlers/document.handler');
      const mockHandler = {
        listDocuments: jest.fn().mockRejectedValue(new Error('Authentication failed')),
      };
      (DocumentHandler as jest.Mock).mockImplementation(() => mockHandler);

      // Mock getDiagnostics
      (authAdapter.getDiagnostics as jest.Mock).mockReturnValue({
        availableSources: [
          { appId: 'test', appSecret: 'test', type: 'session', metadata: { source: 'session' } },
        ],
        errors: [],
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const program = new Command();
      program.exitOverride();
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit:1');
      });
      registerDocumentCommands(program);

      await expect(
        program.parseAsync(['node', 'test', 'document', 'list', '-c', '123456'])
      ).rejects.toThrow('process.exit:1');

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
      mockExit.mockRestore();
    });

    it('[P1] should handle upload authentication error with diagnostics', async () => {
      const { DocumentHandler } = await import('../handlers/document.handler');
      const mockHandler = {
        uploadDocument: jest.fn().mockRejectedValue(new Error('Authentication failed')),
      };
      (DocumentHandler as jest.Mock).mockImplementation(() => mockHandler);

      (authAdapter.getDiagnostics as jest.Mock).mockReturnValue({
        availableSources: [],
        errors: ['No auth configured'],
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const program = new Command();
      program.exitOverride();
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit:1');
      });
      registerDocumentCommands(program);

      await expect(
        program.parseAsync([
          'node', 'test', 'document', 'upload',
          '-c', '123456',
          '--url', 'https://example.com/doc.pdf',
        ])
      ).rejects.toThrow('process.exit:1');

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
      mockExit.mockRestore();
    });

    it('[P1] should handle delete authentication error with diagnostics', async () => {
      const { DocumentHandler } = await import('../handlers/document.handler');
      const mockHandler = {
        deleteDocument: jest.fn().mockRejectedValue(new Error('Authentication failed')),
      };
      (DocumentHandler as jest.Mock).mockImplementation(() => mockHandler);

      (authAdapter.getDiagnostics as jest.Mock).mockReturnValue({
        availableSources: [],
        errors: ['No auth configured'],
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const program = new Command();
      program.exitOverride();
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit:1');
      });
      registerDocumentCommands(program);

      await expect(
        program.parseAsync([
          'node', 'test', 'document', 'delete',
          '-c', '123456',
          '--file-id', 'file123',
        ])
      ).rejects.toThrow('process.exit:1');

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
      mockExit.mockRestore();
    });

    it('[P1] should handle status authentication error with diagnostics', async () => {
      const { DocumentHandler } = await import('../handlers/document.handler');
      const mockHandler = {
        getDocumentStatus: jest.fn().mockRejectedValue(new Error('Authentication failed')),
      };
      (DocumentHandler as jest.Mock).mockImplementation(() => mockHandler);

      (authAdapter.getDiagnostics as jest.Mock).mockReturnValue({
        availableSources: [],
        errors: ['No auth configured'],
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const program = new Command();
      program.exitOverride();
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit:1');
      });
      registerDocumentCommands(program);

      await expect(
        program.parseAsync([
          'node', 'test', 'document', 'status',
          '-c', '123456',
          '--file-id', 'file123',
        ])
      ).rejects.toThrow('process.exit:1');

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
      mockExit.mockRestore();
    });
  });
});
