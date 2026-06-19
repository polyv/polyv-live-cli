/**
 * @fileoverview Questionnaire command definitions for CLI
 * @author Development Team
 * @since 11.4.0
 */

import { Command } from 'commander';
import { QaQuestionnaireHandler } from '../handlers/qa-questionnaire.handler';
import { QaQuestionnaireServiceConfig } from '../types/qa';
import { configManager } from '../config/manager';
import { authAdapter } from '../config/auth-adapter';
import { logError } from '../utils/errors';
import { AuthConfig } from '../types/auth';

/**
 * Validate output format
 * @param value Output format string
 * @returns Validated output format
 */
export function validateOutputFormat(value: string): 'table' | 'json' {
  if (!['table', 'json'].includes(value)) {
    throw new Error('Output format must be either "table" or "json"');
  }
  return value as 'table' | 'json';
}

export function parsePositiveInteger(value: string): number {
  const parsed = parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error('Value must be a positive integer');
  }
  return parsed;
}

export function parsePositiveNumber(value: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error('Value must be a positive number');
  }
  return parsed;
}

/**
 * Registers questionnaire-related commands with the CLI program
 * @param program Commander.js program instance
 */
export function registerQuestionnaireCommands(program: Command): void {
  const questionnaireCmd = program.command('questionnaire');
  questionnaireCmd.description('Manage live streaming questionnaires');

  // ========================================
  // questionnaire create (AC #4)
  // ========================================
  const createCmd = questionnaireCmd
    .command('create')
    .description('Create a new questionnaire')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--title <title>', 'questionnaire title')
    .requiredOption('--questions <json>', 'questions array as JSON string')
    .option('--custom-questionnaire-id <id>', 'custom questionnaire ID')
    .option('--auto-publish-time <timestamp>', 'auto publish time (timestamp)', parseInt)
    .option('--auto-end-time <timestamp>', 'auto end time (timestamp)', parseInt)
    .option('--privacy-enabled', 'enable privacy mode (Y/N)')
    .option('--privacy-content <text>', 'privacy content')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const handler = new QaQuestionnaireHandler(authConfig, serviceConfig);

        // Parse questions JSON
        let questions: any[];
        try {
          questions = JSON.parse(options.questions);
        } catch (parseError) {
          logError(new Error('Invalid JSON format for --questions parameter'));
          process.exit(1);
        }

        await handler.createQuestionnaire({
          channelId: options.channelId,
          title: options.title,
          questions,
          customQuestionnaireId: options.customQuestionnaireId,
          autoPublishTime: options.autoPublishTime,
          autoEndTime: options.autoEndTime,
          ...(options.privacyEnabled ? { privacyEnabled: 'Y' as const } : {}),
          privacyContent: options.privacyContent,
          output: options.output,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  createCmd.addHelpText('after', `
Examples:
  # Create questionnaire with required fields
  $ polyv-live-cli questionnaire create -c "3151318" --title "Survey" \\
    --questions '[{"name":"Your gender?","type":"R","options":["Male","Female"],"required":"Y"}]'

  # Create questionnaire with optional fields
  $ polyv-live-cli questionnaire create -c "3151318" --title "Feedback" \\
    --questions '[{"name":"How would you rate our service?","type":"X","required":"Y"}]' \\
    --custom-questionnaire-id "custom-001"

  # JSON output
  $ polyv-live-cli questionnaire create -c "3151318" --title "Survey" -o json
`);

  // ========================================
  // questionnaire list (AC #5)
  // ========================================
  const listCmd = questionnaireCmd
    .command('list')
    .description('List questionnaires with pagination')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('--page <number>', 'page number', parseInt)
    .option('--size <number>', 'page size', parseInt)
    .option('--session-id <id>', 'filter by session ID')
    .option('--start-date <date>', 'start date filter (yyyy-MM-dd)')
    .option('--end-date <date>', 'end date filter (yyyy-MM-dd)')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const handler = new QaQuestionnaireHandler(authConfig, serviceConfig);

        await handler.listQuestionnaires({
          channelId: options.channelId,
          page: options.page,
          size: options.size,
          sessionId: options.sessionId,
          startDate: options.startDate,
          endDate: options.endDate,
          output: options.output,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  listCmd.addHelpText('after', `
Examples:
  # List all questionnaires
  $ polyv-live-cli questionnaire list -c "3151318"

  # List with pagination
  $ polyv-live-cli questionnaire list -c "3151318" --page 1 --size 20

  # Filter by session ID
  $ polyv-live-cli questionnaire list -c "3151318" --session-id "fwly13xczv"

  # Filter by date range
  $ polyv-live-cli questionnaire list -c "3151318" --start-date "2024-01-01" --end-date "2024-01-31"

  # JSON output
  $ polyv-live-cli questionnaire list -c "3151318" -o json
`);

  // ========================================
  // questionnaire legacy-list
  // ========================================
  const legacyListCmd = questionnaireCmd
    .command('legacy-list')
    .description('List questionnaires through the legacy V3 API')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('--start-time <timestamp>', 'start timestamp', parsePositiveNumber)
    .option('--end-time <timestamp>', 'end timestamp', parsePositiveNumber)
    .option('--page <number>', 'page number', parsePositiveInteger)
    .option('--size <number>', 'page size', parsePositiveInteger)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const handler = new QaQuestionnaireHandler(authConfig, serviceConfig);

        await handler.listQuestionnaire({
          channelId: options.channelId,
          startTime: options.startTime,
          endTime: options.endTime,
          page: options.page,
          size: options.size,
          output: options.output,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  legacyListCmd.addHelpText('after', `
Examples:
  # List questionnaires through legacy API
  $ polyv-live-cli questionnaire legacy-list -c "3151318" --page 1 --size 20

  # List by timestamp range
  $ polyv-live-cli questionnaire legacy-list -c "3151318" --start-time 1704067200000 --end-time 1706745599000
`);

  // ========================================
  // questionnaire detail (AC #6)
  // ========================================
  const detailCmd = questionnaireCmd
    .command('detail')
    .description('Get questionnaire detail with questions')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--questionnaire-id <id>', 'questionnaire ID')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const handler = new QaQuestionnaireHandler(authConfig, serviceConfig);

        await handler.getQuestionnaireDetail({
          channelId: options.channelId,
          questionnaireId: options.questionnaireId,
          output: options.output,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  detailCmd.addHelpText('after', `
Examples:
  # Get questionnaire detail
  $ polyv-live-cli questionnaire detail -c "3151318" --questionnaire-id "fs9v59nq4u"

  # JSON output
  $ polyv-live-cli questionnaire detail -c "3151318" --questionnaire-id "fs9v59nq4u" -o json
`);

  // ========================================
  // questionnaire results
  // ========================================
  const resultsCmd = questionnaireCmd
    .command('results')
    .description('List questionnaire answer records')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('--questionnaire-id <id>', 'questionnaire ID filter')
    .option('--session-id <id>', 'live session ID filter')
    .option('--start-date <date>', 'start date filter (yyyy-MM-dd)')
    .option('--end-date <date>', 'end date filter (yyyy-MM-dd)')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const handler = new QaQuestionnaireHandler(authConfig, serviceConfig);

        await handler.getQuestionnaireResult({
          channelId: options.channelId,
          questionnaireId: options.questionnaireId,
          sessionId: options.sessionId,
          startDate: options.startDate,
          endDate: options.endDate,
          output: options.output,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  resultsCmd.addHelpText('after', `
Examples:
  # List questionnaire answer records
  $ polyv-live-cli questionnaire results -c "3151318" --questionnaire-id "fs9v59nq4u"

  # JSON output
  $ polyv-live-cli questionnaire results -c "3151318" --session-id "fwly13xczv" -o json
`);

  // ========================================
  // questionnaire batch-create
  // ========================================
  const batchCreateCmd = questionnaireCmd
    .command('batch-create')
    .description('Batch create questionnaires')
    .requiredOption('--questionnaires <json>', 'questionnaires array as JSON string')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const handler = new QaQuestionnaireHandler(authConfig, serviceConfig);

        await handler.batchCreateQuestionnaire({
          questionnaires: options.questionnaires,
          force: options.force,
          output: options.output,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  batchCreateCmd.addHelpText('after', `
Examples:
  # Batch create questionnaires
  $ polyv-live-cli questionnaire batch-create --questionnaires '[{"channelId":"3151318","questionnaireTitle":"Survey","questions":[{"name":"Gender","type":"R","options":["Male","Female"]}]}]' --force
`);
}

// ========================================
// Common helper
// ========================================
async function loadAuthAndServiceConfig(parentOptions: any): Promise<{
  authConfig: AuthConfig;
  serviceConfig: QaQuestionnaireServiceConfig;
}> {
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
    // If config loading fails due to auth, use defaults
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

  const serviceConfig: QaQuestionnaireServiceConfig = {
    baseUrl: configResult.config.baseUrl,
    timeout: configResult.config.timeout,
    debug: configResult.config.debug,
  };

  return {
    authConfig: authResult.config,
    serviceConfig,
  };
}
