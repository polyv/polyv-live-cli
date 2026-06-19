import { Command } from 'commander';
import { RobotHandler } from '../handlers/robot.handler';
import { logError } from '../utils/errors';
import {
  commandParentOptions,
  loadApiCommandConfig,
  parseJsonArray,
  parseNumberList,
  parsePositiveInteger,
  validateOutputFormat,
} from '../utils/api-command';

function withRobotHandler(program: Command, run: (handler: RobotHandler) => Promise<void>): Promise<void> {
  return (async () => {
    try {
      const { authConfig, serviceConfig } = await loadApiCommandConfig(commandParentOptions(program));
      await run(new RobotHandler(authConfig, serviceConfig));
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)));
      process.exit(1);
    }
  })();
}

export function registerRobotCommands(program: Command): void {
  const robotCmd = program.command('robot').description('Manage global robots');

  robotCmd.command('list')
    .description('List global robots')
    .option('--page-number <page>', 'page number', parsePositiveInteger)
    .option('--page-size <size>', 'page size', parsePositiveInteger)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withRobotHandler(program, handler => handler.listRobots(options)));

  robotCmd.command('batch-save')
    .description('Batch save global robots')
    .requiredOption('--robots <json>', 'robots JSON array', parseJsonArray)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withRobotHandler(program, handler => handler.batchSaveRobots(options)));

  robotCmd.command('batch-delete')
    .description('Batch delete global robots')
    .requiredOption('--ids <ids>', 'robot IDs, comma-separated', parseNumberList)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withRobotHandler(program, handler => handler.batchDeleteRobots(options)));
}
