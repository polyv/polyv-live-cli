/**
 * @fileoverview Document command definitions for CLI
 * @author Development Team
 * @since 9.5.0
 */

import { Command } from 'commander';
import {
  DocumentServiceConfig,
  DocumentListOptions,
  DocumentUploadOptions,
  DocumentDeleteOptions,
  DocumentStatusOptions,
} from '../types/document';
import { configManager } from '../config/manager';
import { authAdapter } from '../config/auth-adapter';
import { logError } from '../utils/errors';
import { AuthConfig } from '../types/auth';
import { parsePositiveInteger, parseStringList } from '../utils/api-command';

/**
 * Load and prepare authentication and service configuration
 */
async function loadAuthAndServiceConfig(parentOptions: any): Promise<{
  authConfig: AuthConfig;
  serviceConfig: DocumentServiceConfig;
  isVerbose: boolean;
  authSource?: string;
  accountName?: string;
}> {
  // Get authentication using priority system
  const authResult = authAdapter.tryGetAuthConfig(parentOptions);
  if (!authResult) {
    throw new Error(authAdapter.getStatusMessage(parentOptions));
  }

  // Load app configuration for service settings
  let configResult;
  try {
    configResult = await configManager.load({
      cliOptions: parentOptions,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Auth configuration is incomplete')) {
      configResult = {
        config: {
          baseUrl: 'https://api.polyv.net',
          timeout: 30000,
          debug: false,
        },
      };
    } else {
      throw error;
    }
  }

  // Create service configuration
  const serviceConfig: DocumentServiceConfig = {
    baseUrl: configResult.config.baseUrl,
    timeout: configResult.config.timeout,
    debug: configResult.config.debug,
  };

  // Display authentication source information if verbose
  const isVerbose = !!parentOptions.verbose;
  if (isVerbose) {
    console.log(`🔐 Authentication Source: ${authResult.source}`);
    if (authResult.accountName) {
      console.log(`👤 Account: ${authResult.accountName}`);
    }
    console.log('');
  }

  const result: {
    authConfig: AuthConfig;
    serviceConfig: DocumentServiceConfig;
    isVerbose: boolean;
    authSource?: string;
    accountName?: string;
  } = {
    authConfig: authResult.config,
    serviceConfig,
    isVerbose,
  };

  if (authResult.source) {
    result.authSource = authResult.source;
  }

  if (authResult.accountName) {
    result.accountName = authResult.accountName;
  }

  return result;
}

/**
 * Validate output format
 * @param value Output format string
 * @returns Validated output format
 * @throws Error if format is invalid
 */
export function validateOutputFormat(value: string): 'table' | 'json' {
  if (!['table', 'json'].includes(value)) {
    throw new Error('Output format must be either "table" or "json"');
  }
  return value as 'table' | 'json';
}

/**
 * Validate document status
 * @param value Status string
 * @returns Validated status
 * @throws Error if status is invalid
 */
export function validateStatus(value: string): 'normal' | 'waitUpload' | 'failUpload' | 'waitConvert' | 'failConvert' {
  const validStatuses = ['normal', 'waitUpload', 'failUpload', 'waitConvert', 'failConvert'];
  if (!validStatuses.includes(value)) {
    throw new Error(`Status must be one of: ${validStatuses.join(', ')}`);
  }
  return value as 'normal' | 'waitUpload' | 'failUpload' | 'waitConvert' | 'failConvert';
}

/**
 * Validate document type (convert type)
 * @param value Document type string
 * @returns Validated document type
 * @throws Error if type is invalid
 */
export function validateDocType(value: string): 'common' | 'animate' {
  if (!['common', 'animate'].includes(value)) {
    throw new Error('Document type must be either "common" or "animate"');
  }
  return value as 'common' | 'animate';
}

function validateRelationOperation(value: string): 1 | 2 {
  const parsed = parsePositiveInteger(value);
  if (parsed !== 1 && parsed !== 2) {
    throw new Error('operation must be 1 or 2');
  }
  return parsed as 1 | 2;
}

async function runDocumentAction(
  program: Command,
  action: (handler: import('../handlers/document.handler').DocumentHandler) => Promise<void>
): Promise<void> {
  try {
    const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(program.opts());
    const { DocumentHandler } = await import('../handlers/document.handler');
    await action(new DocumentHandler(authConfig, serviceConfig));
  } catch (error) {
    logError(error instanceof Error ? error : new Error(String(error)));
    process.exit(1);
  }
}

/**
 * Registers document-related commands with the CLI program
 * @param program Commander.js program instance
 */
export function registerDocumentCommands(program: Command): void {
  // Create document command group
  const documentCmd = program.command('document');
  documentCmd.description('课件管理命令');

  // Document list command
  const listCmd = documentCmd
    .command('list')
    .description(`获取频道课件文档列表

Examples:
  $ polyv-live-cli document list -c "3151318"
  $ polyv-live-cli document list -c "3151318" --status normal
  $ polyv-live-cli document list -c "3151318" --page 2 --page-size 20 -o json`)
    .requiredOption('-c, --channel-id <channelId>', '频道ID')
    .option('--status <status>', '文档状态 (normal|waitUpload|failUpload|waitConvert|failConvert)', validateStatus)
    .option('--page <number>', '页码，默认为1', (value) => parseInt(value, 10), 1)
    .option('--page-size <number>', '每页数量，默认为10', (value) => parseInt(value, 10), 10)
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action(async function(this: Command, options) {
      try {
        // Load authentication and service configuration
        const parentOptions = this.optsWithGlobals();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        // Dynamically import to allow mocking in tests
        const { DocumentHandler } = await import('../handlers/document.handler');

        // Create document handler instance
        const documentHandler = new DocumentHandler(authConfig, serviceConfig);

        // Transform commander options to handler options
        const listOptions: DocumentListOptions = {
          channelId: options.channelId,
          status: options.status,
          page: options.page,
          pageSize: options.pageSize,
          output: options.output,
        };

        // Execute document list
        await documentHandler.listDocuments(listOptions);

      } catch (error) {
        // Enhanced error handling with authentication context
        if (error instanceof Error && error.message.includes('Authentication')) {
          const diagnostics = authAdapter.getDiagnostics(program.opts());
          console.error('\n🔍 Authentication Diagnostics:');
          diagnostics.availableSources.forEach(source => {
            const status = source.appId && source.appSecret ? '✅' : '❌';
            console.error(`  ${status} ${source.metadata.source}: ${source.type}`);
          });
          if (diagnostics.errors.length > 0) {
            console.error('\n❌ Errors:');
            diagnostics.errors.forEach(err => console.error(`  - ${err}`));
          }
        }
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Add help text for document list command
  listCmd.addHelpText('after', `
Examples:
  # 获取频道课件列表
  $ polyv-live-cli document list -c "3151318"

  # 按状态过滤
  $ polyv-live-cli document list -c "3151318" --status normal

  # 指定分页参数
  $ polyv-live-cli document list -c "3151318" --page 2 --page-size 20

  # JSON格式输出
  $ polyv-live-cli document list -c "3151318" -o json

Options:
  -c, --channel-id    频道ID (必填)
  --status            文档状态过滤: normal(正常)|waitUpload(等待上传)|failUpload(上传失败)|waitConvert(转换中)|failConvert(转换失败)
  --page              页码，默认为1
  --page-size         每页数量，默认为10
  -o, --output        输出格式: table 或 json，默认为table

Notes:
  - 频道ID是必填参数
  - 课件文档包含PPT、PDF等教学资料
`);

  // Document upload command
  const uploadCmd = documentCmd
    .command('upload')
    .description(`上传课件文档到频道

Examples:
  $ polyv-live-cli document upload -c "3151318" --url "https://example.com/doc.pdf"
  $ polyv-live-cli document upload -c "3151318" --url "https://example.com/ppt.pptx" --type animate
  $ polyv-live-cli document upload -c "3151318" --url "..." --doc-name "培训课件" --callback-url "http://example.com/callback"
  $ polyv-live-cli document upload -c "3151318" --url "..." -o json`)
    .requiredOption('-c, --channel-id <channelId>', '频道ID')
    .requiredOption('--url <url>', '文件URL')
    .option('--type <type>', '转换类型 (common|animate)', validateDocType, 'common')
    .option('--doc-name [name]', '文档名称')
    .option('--callback-url [url]', '文档转换完成回调地址')
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action(async function(this: Command, options) {
      try {
        // Load authentication and service configuration
        const parentOptions = this.optsWithGlobals();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        // Dynamically import to allow mocking in tests
        const { DocumentHandler } = await import('../handlers/document.handler');

        // Create document handler instance
        const documentHandler = new DocumentHandler(authConfig, serviceConfig);

        // Transform commander options to handler options
        const uploadOptions: DocumentUploadOptions = {
          channelId: options.channelId,
          url: options.url,
          type: options.type,
          docName: options.docName,
          callbackUrl: options.callbackUrl,
          output: options.output,
        };

        // Execute document upload
        await documentHandler.uploadDocument(uploadOptions);

      } catch (error) {
        // Enhanced error handling with authentication context
        if (error instanceof Error && error.message.includes('Authentication')) {
          const diagnostics = authAdapter.getDiagnostics(program.opts());
          console.error('\n🔍 Authentication Diagnostics:');
          diagnostics.availableSources.forEach(source => {
            const status = source.appId && source.appSecret ? '✅' : '❌';
            console.error(`  ${status} ${source.metadata.source}: ${source.type}`);
          });
          if (diagnostics.errors.length > 0) {
            console.error('\n❌ Errors:');
            diagnostics.errors.forEach(err => console.error(`  - ${err}`));
          }
        }
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Add help text for document upload command
  uploadCmd.addHelpText('after', `
Examples:
  # 通过URL上传课件
  $ polyv-live-cli document upload -c "3151318" --url "https://example.com/doc.pdf"

  # 指定转换类型为动画PPT
  $ polyv-live-cli document upload -c "3151318" --url "https://example.com/ppt.pptx" --type animate

  # 设置文档名称和回调URL
  $ polyv-live-cli document upload -c "3151318" --url "..." --doc-name "培训课件" --callback-url "http://example.com/callback"

  # JSON格式输出
  $ polyv-live-cli document upload -c "3151318" --url "..." -o json

Options:
  -c, --channel-id    频道ID (必填)
  --url               文件URL (必填)
  --type              转换类型: common(普通)|animate(动画)，默认为common
  --doc-name          文档名称
  --callback-url      文档转换完成回调地址
  -o, --output        输出格式: table 或 json，默认为table

Notes:
  - 频道ID和文件URL是必填参数
  - 支持的文件格式: ppt/pdf/pptx/doc/docx/wps
  - 文件大小不超过200M
`);

  // Document delete command
  const deleteCmd = documentCmd
    .command('delete')
    .description(`删除课件文档

Examples:
  $ polyv-live-cli document delete -c "3151318" --file-id "abc123"
  $ polyv-live-cli document delete -c "3151318" --file-id "abc123" --force
  $ polyv-live-cli document delete -c "3151318" --file-id "abc123" --force -o json`)
    .requiredOption('-c, --channel-id <channelId>', '频道ID')
    .requiredOption('--file-id <fileId>', '文件ID')
    .option('--type [type]', '文档类型 (old|new)')
    .option('--force', '跳过确认提示，直接删除', false)
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action(async function(this: Command, options) {
      try {
        // Load authentication and service configuration
        const parentOptions = this.optsWithGlobals();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        // Dynamically import to allow mocking in tests
        const { DocumentHandler } = await import('../handlers/document.handler');

        // Create document handler instance
        const documentHandler = new DocumentHandler(authConfig, serviceConfig);

        // Transform commander options to handler options
        const deleteOptions: DocumentDeleteOptions = {
          channelId: options.channelId,
          fileId: options.fileId,
          type: options.type,
          force: options.force,
          output: options.output,
        };

        // Execute document delete
        await documentHandler.deleteDocument(deleteOptions);

      } catch (error) {
        // Enhanced error handling with authentication context
        if (error instanceof Error && error.message.includes('Authentication')) {
          const diagnostics = authAdapter.getDiagnostics(program.opts());
          console.error('\n🔍 Authentication Diagnostics:');
          diagnostics.availableSources.forEach(source => {
            const status = source.appId && source.appSecret ? '✅' : '❌';
            console.error(`  ${status} ${source.metadata.source}: ${source.type}`);
          });
          if (diagnostics.errors.length > 0) {
            console.error('\n❌ Errors:');
            diagnostics.errors.forEach(err => console.error(`  - ${err}`));
          }
        }
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Add help text for document delete command
  deleteCmd.addHelpText('after', `
Examples:
  # 删除课件文档（需要确认）
  $ polyv-live-cli document delete -c "3151318" --file-id "abc123"

  # 跳过确认直接删除
  $ polyv-live-cli document delete -c "3151318" --file-id "abc123" --force

  # JSON格式输出
  $ polyv-live-cli document delete -c "3151318" --file-id "abc123" --force -o json

Options:
  -c, --channel-id    频道ID (必填)
  --file-id           文件ID (必填)
  --type              文档类型: old(旧版)|new(新版)
  --force             跳过确认提示，直接删除
  -o, --output        输出格式: table 或 json，默认为table

Notes:
  - 频道ID和文件ID是必填参数
  - 默认需要确认，使用 --force 可以跳过确认
  - 此操作不可撤销，请谨慎使用
`);

  // Document status command
  const statusCmd = documentCmd
    .command('status')
    .description(`查询文档转码状态

Examples:
  $ polyv-live-cli document status -c "3151318" --file-id "abc123"
  $ polyv-live-cli document status -c "3151318" --file-id "id1,id2"
  $ polyv-live-cli document status -c "3151318" --file-id "abc123" -o json`)
    .requiredOption('-c, --channel-id <channelId>', '频道ID')
    .requiredOption('--file-id <fileId>', '文件ID（多个用逗号分隔）')
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action(async function(this: Command, options) {
      try {
        // Load authentication and service configuration
        const parentOptions = this.optsWithGlobals();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        // Dynamically import to allow mocking in tests
        const { DocumentHandler } = await import('../handlers/document.handler');

        // Create document handler instance
        const documentHandler = new DocumentHandler(authConfig, serviceConfig);

        // Transform commander options to handler options
        const statusOptions: DocumentStatusOptions = {
          channelId: options.channelId,
          fileId: options.fileId,
          output: options.output,
        };

        // Execute document status
        await documentHandler.getDocumentStatus(statusOptions);

      } catch (error) {
        // Enhanced error handling with authentication context
        if (error instanceof Error && error.message.includes('Authentication')) {
          const diagnostics = authAdapter.getDiagnostics(program.opts());
          console.error('\n🔍 Authentication Diagnostics:');
          diagnostics.availableSources.forEach(source => {
            const status = source.appId && source.appSecret ? '✅' : '❌';
            console.error(`  ${status} ${source.metadata.source}: ${source.type}`);
          });
          if (diagnostics.errors.length > 0) {
            console.error('\n❌ Errors:');
            diagnostics.errors.forEach(err => console.error(`  - ${err}`));
          }
        }
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Add help text for document status command
  statusCmd.addHelpText('after', `
Examples:
  # 查询单个文档转码状态
  $ polyv-live-cli document status -c "3151318" --file-id "abc123"

  # 查询多个文档转码状态
  $ polyv-live-cli document status -c "3151318" --file-id "id1,id2"

  # JSON格式输出
  $ polyv-live-cli document status -c "3151318" --file-id "abc123" -o json

Options:
  -c, --channel-id    频道ID (必填)
  --file-id           文件ID（多个用逗号分隔） (必填)
  -o, --output        输出格式: table 或 json，默认为table

Notes:
  - 频道ID和文件ID是必填参数
  - 文件ID可以用英文逗号分隔来查询多个文档
`);

  const teacherDocCmd = documentCmd
    .command('teacher-doc')
    .description('管理讲师与文档关系');

  teacherDocCmd
    .command('relation')
    .description('新增或移除讲师文档关系')
    .requiredOption('--teacher-id <teacherId>', '讲师ID')
    .requiredOption('--file-ids <fileIds>', '文档ID，逗号分隔', parseStringList)
    .requiredOption('--operation <operation>', '操作类型：1 新增关系，2 移除关系', validateRelationOperation)
    .option('-f, --force', '跳过确认提示')
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action((options) => runDocumentAction(program, (handler) => handler.updateTeacherDocRelation(options)));

  const mediaCmd = documentCmd
    .command('media')
    .description('管理频道关联音视频资源');

  mediaCmd
    .command('vids')
    .description('查询频道关联音视频 VID 列表')
    .requiredOption('-c, --channel-id <channelId>', '频道ID')
    .option('--page <number>', '页码', parsePositiveInteger)
    .option('--page-size <number>', '每页数量', parsePositiveInteger)
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action((options) => runDocumentAction(program, (handler) => handler.listChannelMultimediaResourceVids(options)));

  mediaCmd
    .command('details')
    .description('查询频道关联音视频文件详情')
    .requiredOption('-c, --channel-id <channelId>', '频道ID')
    .option('--page <number>', '页码', parsePositiveInteger)
    .option('--page-size <number>', '每页数量', parsePositiveInteger)
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action((options) => runDocumentAction(program, (handler) => handler.listChannelMultimediaResourceDetails(options)));

  mediaCmd
    .command('link')
    .description('关联音视频文件到频道')
    .requiredOption('-c, --channel-id <channelId>', '频道ID')
    .requiredOption('--vids <vids>', '音视频 VID，逗号分隔', parseStringList)
    .option('-f, --force', '跳过确认提示')
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action((options) => runDocumentAction(program, (handler) => handler.linkChannelMultimediaResource(options)));

  mediaCmd
    .command('unlink')
    .description('取消频道关联音视频文件')
    .requiredOption('-c, --channel-id <channelId>', '频道ID')
    .requiredOption('--vids <vids>', '音视频 VID，逗号分隔', parseStringList)
    .option('-f, --force', '跳过确认提示')
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action((options) => runDocumentAction(program, (handler) => handler.unlinkChannelMultimediaResource(options)));

  mediaCmd
    .command('user-detail')
    .description('查询用户音视频文件详情')
    .requiredOption('--vids <vids>', '音视频 VID，逗号分隔，最多100个', parseStringList)
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action((options) => runDocumentAction(program, (handler) => handler.getUserMultimediaResourceDetail(options)));

  mediaCmd
    .command('user-delete')
    .description('删除用户音视频文件')
    .requiredOption('--vids <vids>', '音视频 VID，逗号分隔，最多100个', parseStringList)
    .option('-f, --force', '跳过确认提示')
    .option('-o, --output <format>', '输出格式 (table|json)', validateOutputFormat, 'table')
    .action((options) => runDocumentAction(program, (handler) => handler.deleteUserMultimediaResource(options)));
}
