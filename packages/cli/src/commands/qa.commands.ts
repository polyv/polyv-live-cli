/**
 * @fileoverview QA command definitions for CLI
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

/**
 * Registers QA-related commands with the CLI program
 * @param program Commander.js program instance
 */
export function registerQaCommands(program: Command): void {
  const qaCmd = program.command('qa');
  qaCmd.description('Manage live streaming QA question cards');

  // ========================================
  // qa send (AC #1)
  // ========================================
  const sendCmd = qaCmd
    .command('send')
    .description('Send a QA question card to the channel')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--question-id <id>', 'question ID')
    .option('--duration <seconds>', 'answer duration in seconds (1-99)', parseInt)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const handler = new QaQuestionnaireHandler(authConfig, serviceConfig);

        await handler.sendQa({
          channelId: options.channelId,
          questionId: options.questionId,
          duration: options.duration,
          output: options.output,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  sendCmd.addHelpText('after', `
Examples:
  # Send a QA question card
  $ polyv-live-cli qa send -c "3151318" --question-id "gv0uf9s5v7"

  # Send with time limit (30 seconds)
  $ polyv-live-cli qa send -c "3151318" --question-id "gv0uf9s5v7" --duration 30

  # JSON output
  $ polyv-live-cli qa send -c "3151318" --question-id "gv0uf9s5v7" -o json

Output Formats:
  table       - Formatted table output (default)
  json        - JSON format for programmatic use
`);

  // ========================================
  // qa list (AC #2)
  // ========================================
  const listCmd = qaCmd
    .command('list')
    .description('List QA question cards for the channel')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const handler = new QaQuestionnaireHandler(authConfig, serviceConfig);

        await handler.listQa({
          channelId: options.channelId,
          output: options.output,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  listCmd.addHelpText('after', `
Examples:
  # List all QA question cards
  $ polyv-live-cli qa list -c "3151318"

  # JSON output
  $ polyv-live-cli qa list -c "3151318" -o json

Output Formats:
  table       - Formatted table output (default)
  json        - JSON format for programmatic use
`);

  // ========================================
  // qa stop (AC #3)
  // ========================================
  const stopCmd = qaCmd
    .command('stop')
    .description('Stop a QA question card and get answer statistics')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--question-id <id>', 'question ID')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);

        const handler = new QaQuestionnaireHandler(authConfig, serviceConfig);

        await handler.stopQa({
          channelId: options.channelId,
          questionId: options.questionId,
          output: options.output,
        });
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  stopCmd.addHelpText('after', `
Examples:
  # Stop a QA question card
  $ polyv-live-cli qa stop -c "3151318" --question-id "gv0uf9s5v7"

  # JSON output
  $ polyv-live-cli qa stop -c "3151318" --question-id "gv0uf9s5v7" -o json

Output Formats:
  table       - Formatted table output (default)
  json        - JSON format for programmatic use
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
          debug: false
        }
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
