import { Command } from 'commander';
import { MonitorHandler } from '../handlers/monitor.handler';
import { MonitorServiceSdk } from '../services/monitor-service';
import { logError } from '../utils/errors';
import {
  apiParams,
  commandParentOptions,
  loadApiCommandConfig,
  validateOutputFormat,
} from '../utils/api-command';
import { formatJSON, formatTable } from '../utils/formatter';

export interface MonitorOptions {
  refresh?: string;
  layout?: string;
  theme?: string;
  config?: string;
  output?: string;
  verbose?: boolean;
  debug?: boolean;
}

function displayApiResult(data: any, output = 'table'): void {
  if (output === 'json') {
    console.log(formatJSON(data));
    return;
  }

  if (!Array.isArray(data) || data.length === 0 || typeof data[0] !== 'object') {
    console.log(formatJSON(data));
    return;
  }

  const headers = Object.keys(data[0]);
  const rows = data.map((item) => headers.map((header) => {
    const value = item?.[header];
    return typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value ?? '');
  }));
  console.log(formatTable({ headers, data: rows }));
}

function resolveOutputOption(options: { output?: string }, command?: Command): string {
  const parentOutputSource = command?.parent?.getOptionValueSource('output');
  const commandOutputSource = command?.getOptionValueSource('output');
  if (
    parentOutputSource &&
    parentOutputSource !== 'default' &&
    (!commandOutputSource || commandOutputSource === 'default')
  ) {
    return String(command?.parent?.getOptionValue('output') ?? options.output ?? 'table');
  }

  return String(options.output ?? 'table');
}

export function registerMonitorCommands(program: Command): void {
  const monitorCommand = program
    .command('monitor')
    .description('Start live streaming monitoring dashboard')
    .option('-r, --refresh <seconds>', 'Refresh interval in seconds', '5')
    .option('-l, --layout <layout>', 'Dashboard layout (default, compact, single)', 'default')
    .option('-t, --theme <theme>', 'Color theme (default, dark)', 'default')
    .option('-c, --config <path>', 'Configuration file path')
    .option('-o, --output <format>', 'Output format for status commands', 'table')
    .option('-v, --verbose', 'Enable verbose logging', false)
    .option('-d, --debug', 'Enable debug mode', false)
    .action(async (options: MonitorOptions) => {
      const handler = new MonitorHandler();
      await handler.startMonitoring(options);
    });

  // Subcommands for monitoring
  monitorCommand
    .command('tencent-stream-info-list')
    .description('List Tencent stream monitoring info')
    .requiredOption('--channel-id <id>', 'channel ID')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options, command: Command) => {
      try {
        const { authConfig, serviceConfig } = await loadApiCommandConfig(commandParentOptions(program));
        const service = new MonitorServiceSdk(authConfig, serviceConfig);
        displayApiResult(await service.listTencentStreamInfo(apiParams(options)), resolveOutputOption(options, command));
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  monitorCommand
    .command('stream-info-list')
    .description('List V4 channel realtime stream monitoring info')
    .requiredOption('--channel-id <id>', 'channel ID')
    .option('--start-time <timestamp>', 'start timestamp')
    .option('--end-time <timestamp>', 'end timestamp')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options, command: Command) => {
      try {
        const { authConfig, serviceConfig } = await loadApiCommandConfig(commandParentOptions(program));
        const service = new MonitorServiceSdk(authConfig, serviceConfig);
        displayApiResult(await service.listMonitorStreamInfo(apiParams(options)), resolveOutputOption(options, command));
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  monitorCommand
    .command('status')
    .description('Show monitoring dashboard status')
    .option('-o, --output <format>', 'Output format (table, json)', 'table')
    .action(async (options: Pick<MonitorOptions, 'output'>, command: Command) => {
      const handler = new MonitorHandler();
      await handler.showStatus({ ...options, output: resolveOutputOption(options, command) });
    });

  monitorCommand
    .command('config')
    .description('Manage monitoring configuration')
    .option('-o, --output <format>', 'Output format (table, json)', 'table')
    .action(async (options: Pick<MonitorOptions, 'output'>, command: Command) => {
      const handler = new MonitorHandler();
      await handler.showConfig({ ...options, output: resolveOutputOption(options, command) });
    });

  monitorCommand
    .command('layouts')
    .description('List available dashboard layouts')
    .option('-o, --output <format>', 'Output format (table, json)', 'table')
    .action(async (options: Pick<MonitorOptions, 'output'>, command: Command) => {
      const handler = new MonitorHandler();
      await handler.listLayouts({ ...options, output: resolveOutputOption(options, command) });
    });

  monitorCommand
    .command('themes')
    .description('List available themes')
    .option('-o, --output <format>', 'Output format (table, json)', 'table')
    .action(async (options: Pick<MonitorOptions, 'output'>, command: Command) => {
      const handler = new MonitorHandler();
      await handler.listThemes({ ...options, output: resolveOutputOption(options, command) });
    });

  monitorCommand
    .command('test')
    .description('Test monitoring dashboard compatibility')
    .option('-o, --output <format>', 'Output format (table, json)', 'table')
    .action(async (options: Pick<MonitorOptions, 'output'>, command: Command) => {
      const handler = new MonitorHandler();
      await handler.testCompatibility({ ...options, output: resolveOutputOption(options, command) });
    });

  monitorCommand
    .command('export <filepath>')
    .description('Export monitoring configuration')
    .action(async (filepath: string) => {
      const handler = new MonitorHandler();
      await handler.exportConfig(filepath);
    });

  monitorCommand
    .command('import <filepath>')
    .description('Import monitoring configuration')
    .action(async (filepath: string) => {
      const handler = new MonitorHandler();
      await handler.importConfig(filepath);
    });
}
