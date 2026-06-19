/**
 * @fileoverview AI command definitions for CLI
 * @author Development Team
 * @since 14.4.0
 */

import { Command } from 'commander';
import { AIDigitalHumanHandler } from '../handlers/ai-digital-human.handler';
import { AIVideoProduceHandler } from '../handlers/ai-video-produce.handler';
import { authAdapter } from '../config/auth-adapter';
import { configManager } from '../config/manager';
import { logError } from '../utils/errors';
import { AuthConfig } from '../types/auth';
import { OutputFormat } from '../types/platform';
import { AIDigitalHumanServiceConfig } from '../types/ai-digital-human';
import { AIVideoProduceServiceConfig } from '../types/ai-video-produce';

/** Default timeout in milliseconds */
const DEFAULT_TIMEOUT_MS = 30000;

/**
 * Load and prepare authentication and service configuration
 * @internal Exported for testing purposes
 */
export async function loadAuthAndServiceConfig(parentOptions: Record<string, unknown>): Promise<{
  authConfig: AuthConfig;
  serviceConfig: AIDigitalHumanServiceConfig & AIVideoProduceServiceConfig;
  isVerbose: boolean;
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
    // If config loading fails, use defaults
    if (error instanceof Error && error.message.includes('Auth configuration is incomplete')) {
      configResult = {
        config: {
          baseUrl: 'https://api.polyv.net',
          timeout: DEFAULT_TIMEOUT_MS,
          debug: false,
        },
      };
    } else {
      throw error;
    }
  }

  const serviceConfig: AIDigitalHumanServiceConfig & AIVideoProduceServiceConfig = {
    baseUrl: configResult.config.baseUrl,
    timeout: configResult.config.timeout,
    debug: configResult.config.debug,
  };

  const isVerbose = !!parentOptions['verbose'];
  if (isVerbose) {
    console.log('Using authentication from:', authResult.source);
  }

  return { authConfig: authResult.config, serviceConfig, isVerbose };
}

/**
 * Validates output format
 * @param format Output format to validate
 * @returns Validated format
 * @throws {Error} When format is invalid
 */
export function validateOutputFormat(format: string): OutputFormat {
  if (format !== 'table' && format !== 'json') {
    throw new Error('Invalid output format. Must be table or json');
  }
  return format;
}

/**
 * Parse a positive integer option.
 */
export function parsePositiveInteger(value: string): number {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${value} is not a positive integer`);
  }
  return parsed;
}

/**
 * Parse a non-negative integer timestamp option.
 */
export function parseNonNegativeInteger(value: string): number {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${value} is not a non-negative integer`);
  }
  return parsed;
}

function validatePptConvertType(value: string): 'common' | 'animate' {
  if (value !== 'common' && value !== 'animate') {
    throw new Error('PPT convert type must be common or animate');
  }
  return value;
}

async function createDigitalHumanHandler(
  program: Command,
  commandOptions: Record<string, unknown>
): Promise<AIDigitalHumanHandler> {
  const { authConfig, serviceConfig } = await loadAuthAndServiceConfig({
    ...program.opts(),
    ...commandOptions,
  });
  return new AIDigitalHumanHandler(authConfig, serviceConfig);
}

async function createVideoProduceHandler(
  program: Command,
  commandOptions: Record<string, unknown>
): Promise<AIVideoProduceHandler> {
  const { authConfig, serviceConfig } = await loadAuthAndServiceConfig({
    ...program.opts(),
    ...commandOptions,
  });
  return new AIVideoProduceHandler(authConfig, serviceConfig);
}

/**
 * Register AI commands
 */
export function registerAiCommands(program: Command): void {
  const aiCmd = program
    .command('ai')
    .description('Manage AI features for live streaming (管理AI功能)');

  // Digital Human subcommand group
  const digitalHumanCmd = aiCmd
    .command('digital-human')
    .description('Manage AI Digital Humans (管理AI数字人)');

  // list subcommand
  digitalHumanCmd
    .command('list')
    .description('List AI Digital Humans (列出AI数字人)')
    .option('--page <number>', 'Page number (default: 1)', parseInt)
    .option('--size <number>', 'Page size (default: 10, max: 1000)', parseInt)
    .option('-o, --output <format>', 'Output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const handler = await createDigitalHumanHandler(program, options);
        await handler.listDigitalHumans({
          page: options.page,
          size: options.size,
          output: options.output as OutputFormat,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // list-org subcommand
  digitalHumanCmd
    .command('list-org')
    .description('List organization associations for AI Digital Humans (查询AI数字人关联的组织)')
    .requiredOption('--ids <ids>', 'AI Digital Human IDs, comma-separated (数字人ID，逗号分隔)')
    .option('-o, --output <format>', 'Output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const handler = await createDigitalHumanHandler(program, options);
        await handler.listOrganizations({
          ids: options.ids,
          output: options.output as OutputFormat,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // set-org subcommand
  digitalHumanCmd
    .command('set-org')
    .description('Set organization associations for AI Digital Humans (设置AI数字人关联的组织)')
    .option('--config <json>', 'JSON array config (JSON数组配置)')
    .option('--aiDigitalHumanId <id>', 'AI Digital Human ID (数字人ID)')
    .option('--organizationIds <ids>', 'Organization IDs, comma-separated (组织ID，逗号分隔)')
    .option('--includeChildren', 'Include child organizations (包含子组织)', true)
    .option('-o, --output <format>', 'Output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const handler = await createDigitalHumanHandler(program, options);
        await handler.setOrganizations({
          config: options.config,
          aiDigitalHumanId: options.aiDigitalHumanId,
          organizationIds: options.organizationIds,
          includeChildren: options.includeChildren,
          output: options.output as OutputFormat,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // AI video production subcommand group
  const videoProduceCmd = aiCmd
    .command('video-produce')
    .description('Manage AI video production tasks, PPT files, and TTS voices (管理AI视频制作)');

  const ttsVoiceCmd = videoProduceCmd
    .command('tts-voice')
    .description('Manage TTS voices for AI video production (管理视频制作声音)');

  ttsVoiceCmd
    .command('list')
    .description('List TTS voices for AI video production (列出可用声音)')
    .option('--page <number>', 'Page number (default: 1)', parsePositiveInteger, 1)
    .option('--size <number>', 'Page size (default: 10, max: 1000)', parsePositiveInteger, 10)
    .option('-o, --output <format>', 'Output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const handler = await createVideoProduceHandler(program, options);
        await handler.listTtsVoices({
          page: options.page,
          size: options.size,
          output: options.output as OutputFormat,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  videoProduceCmd
    .command('list')
    .description('List AI video production tasks (列出AI视频制作任务)')
    .option('--page <number>', 'Page number (default: 1)', parsePositiveInteger, 1)
    .option('--size <number>', 'Page size (default: 10, max: 1000)', parsePositiveInteger, 10)
    .option('--video-name <name>', 'Filter by video name')
    .option('--status <number>', 'Filter by task status', parsePositiveInteger)
    .option('--create-time-start <timestamp>', 'Creation start timestamp in milliseconds', parseNonNegativeInteger)
    .option('--create-time-end <timestamp>', 'Creation end timestamp in milliseconds', parseNonNegativeInteger)
    .option('--tags <tags>', 'Comma-separated tags')
    .option('-o, --output <format>', 'Output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const handler = await createVideoProduceHandler(program, options);
        await handler.listVideoProduces({
          page: options.page,
          size: options.size,
          videoName: options.videoName,
          status: options.status,
          createTimeStart: options.createTimeStart,
          createTimeEnd: options.createTimeEnd,
          tags: options.tags,
          output: options.output as OutputFormat,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  videoProduceCmd
    .command('get')
    .description('Get an AI video production task (查询AI视频制作任务)')
    .requiredOption('--id <id>', 'AI video production task ID', parsePositiveInteger)
    .option('-o, --output <format>', 'Output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const handler = await createVideoProduceHandler(program, options);
        await handler.getVideoProduce({
          id: options.id,
          output: options.output as OutputFormat,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  videoProduceCmd
    .command('create')
    .description('Create AI video production tasks in batch (批量创建AI视频制作任务)')
    .requiredOption('--tasks <json>', 'JSON array of task payloads, max 20')
    .option('--force', 'Create without confirmation')
    .option('-o, --output <format>', 'Output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const handler = await createVideoProduceHandler(program, options);
        await handler.createVideoProduces({
          tasks: options.tasks,
          force: options.force || false,
          output: options.output as OutputFormat,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  videoProduceCmd
    .command('delete')
    .description('Delete an AI video production task (删除AI视频制作任务)')
    .requiredOption('--id <id>', 'AI video production task ID', parsePositiveInteger)
    .option('--force', 'Delete without confirmation')
    .option('-o, --output <format>', 'Output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const handler = await createVideoProduceHandler(program, options);
        await handler.deleteVideoProduce({
          id: options.id,
          force: options.force || false,
          output: options.output as OutputFormat,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  const pptCmd = videoProduceCmd
    .command('ppt')
    .description('Manage PPT files for AI video production (管理视频制作PPT)');

  pptCmd
    .command('list')
    .description('List PPT files for AI video production (列出视频制作PPT)')
    .option('--page <number>', 'Page number (default: 1)', parsePositiveInteger, 1)
    .option('--size <number>', 'Page size (default: 10, max: 1000)', parsePositiveInteger, 10)
    .option('-o, --output <format>', 'Output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const handler = await createVideoProduceHandler(program, options);
        await handler.listVideoProducePpts({
          page: options.page,
          size: options.size,
          output: options.output as OutputFormat,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  pptCmd
    .command('get')
    .description('Get a PPT file for AI video production (查询视频制作PPT)')
    .requiredOption('--file-id <fileId>', 'PPT file ID')
    .option('-o, --output <format>', 'Output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const handler = await createVideoProduceHandler(program, options);
        await handler.getVideoProducePpt({
          fileId: options.fileId,
          output: options.output as OutputFormat,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  pptCmd
    .command('upload')
    .description('Upload a PPT by URL for AI video production (上传视频制作PPT)')
    .requiredOption('--url <url>', 'PPT file URL')
    .option('--doc-name <name>', 'Custom PPT file name')
    .option('--force', 'Upload without confirmation')
    .option('-o, --output <format>', 'Output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const handler = await createVideoProduceHandler(program, options);
        await handler.uploadVideoProducePpt({
          url: options.url,
          docName: options.docName,
          force: options.force || false,
          output: options.output as OutputFormat,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  pptCmd
    .command('async-upload')
    .description('Start async PPT upload by URL for AI video production (异步上传视频制作PPT)')
    .requiredOption('--url <url>', 'PPT file URL')
    .option('--doc-name <name>', 'Custom PPT file name')
    .option('--type <type>', 'PPT conversion type (common|animate)', validatePptConvertType)
    .option('--callback-url <url>', 'Callback URL for upload/convert status')
    .option('--child-user-id <id>', 'Child account user ID for PPT isolation')
    .option('--force', 'Start async upload without confirmation')
    .option('-o, --output <format>', 'Output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const handler = await createVideoProduceHandler(program, options);
        await handler.asyncUploadVideoProducePpt({
          url: options.url,
          docName: options.docName,
          type: options.type,
          callbackUrl: options.callbackUrl,
          childUserId: options.childUserId,
          force: options.force || false,
          output: options.output as OutputFormat,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });
}
