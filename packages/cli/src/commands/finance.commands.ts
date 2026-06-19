import { Command } from 'commander';
import { FinanceHandler } from '../handlers/finance.handler';
import { logError } from '../utils/errors';
import {
  commandParentOptions,
  loadApiCommandConfig,
  parseJsonObject,
  parsePositiveInteger,
  parseTimestamp,
  validateOutputFormat,
  validateYn,
} from '../utils/api-command';

function withFinanceHandler(program: Command, run: (handler: FinanceHandler) => Promise<void>): Promise<void> {
  return (async () => {
    try {
      const { authConfig, serviceConfig } = await loadApiCommandConfig(commandParentOptions(program));
      await run(new FinanceHandler(authConfig, serviceConfig));
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)));
      process.exit(1);
    }
  })();
}

function addModerationListOptions(command: Command): Command {
  return command
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('--page <page>', 'page number', parsePositiveInteger)
    .option('--page-number <page>', 'page number', parsePositiveInteger)
    .option('--page-size <size>', 'page size', parsePositiveInteger)
    .option('--session-id <id>', 'session ID')
    .option('--start-time <timestamp>', 'start timestamp', parseTimestamp)
    .option('--end-time <timestamp>', 'end timestamp', parseTimestamp)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table');
}

export function registerFinanceCommands(program: Command): void {
  const financeCmd = program.command('finance').description('Manage finance, billing, and moderation APIs');

  const audioCmd = financeCmd.command('audio-moderation').description('Audio moderation APIs');
  audioCmd.command('get')
    .description('Get audio moderation settings')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withFinanceHandler(program, handler => handler.getAudioSettings(options)));

  addModerationListOptions(audioCmd.command('list').description('List audio moderation records'))
    .option('--moderation-strategy <strategy>', 'moderation strategy filter')
    .option('--result-type <type>', 'result type', parsePositiveInteger)
    .action((options) => withFinanceHandler(program, handler => handler.listAudioRecords(options)));

  audioCmd.command('update')
    .description('Update audio moderation settings')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('--moderation-enabled <value>', 'moderation enabled (Y|N)', validateYn)
    .option('--moderation-strategy <strategy>', 'strategy (easy|normal|strict)')
    .option('--badword-enabled <value>', 'badword enabled (Y|N)', validateYn)
    .option('--illegal-notify <json>', 'illegal notification JSON object', parseJsonObject)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withFinanceHandler(program, handler => handler.updateAudioSettings({
      ...options,
      illegalNotify: options.illegalNotify,
    })));

  const videoCmd = financeCmd.command('video-moderation').description('Video moderation APIs');
  videoCmd.command('get')
    .description('Get video moderation settings')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withFinanceHandler(program, handler => handler.getVideoSettings(options)));

  addModerationListOptions(videoCmd.command('result-list').description('List video moderation results'))
    .option('--label <label>', 'label filter')
    .option('--result-type <type>', 'result type filter, comma-separated')
    .action((options) => withFinanceHandler(program, handler => handler.listVideoResults(options)));

  videoCmd.command('update')
    .description('Update video moderation settings')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--moderation-enabled <value>', 'moderation enabled (Y|N)', validateYn)
    .requiredOption('--moderation-strategy <strategy>', 'strategy (finance_easy|finance_normal|finance_serious)')
    .requiredOption('--image-frequency <seconds>', 'image frequency (5|20|60)', parsePositiveInteger)
    .requiredOption('--illegal-notify <json>', 'illegal notification JSON object', parseJsonObject)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withFinanceHandler(program, handler => handler.updateVideoSettings({
      ...options,
      illegalNotify: options.illegalNotify,
    })));

  financeCmd.command('bill-detail-list')
    .description('List finance bill details')
    .requiredOption('--item-category <category>', 'item category')
    .requiredOption('--start-date <date>', 'start date, yyyy-MM-dd')
    .requiredOption('--end-date <date>', 'end date, yyyy-MM-dd')
    .option('--page <page>', 'page number', parsePositiveInteger)
    .option('--page-number <page>', 'page number', parsePositiveInteger)
    .option('--page-size <size>', 'page size', parsePositiveInteger)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withFinanceHandler(program, handler => handler.listBillDetails(options)));
}
