import { Command } from 'commander';
import { MonitorHandler } from '../handlers/monitor.handler';

export interface MonitorOptions {
  refresh?: string;
  layout?: string;
  theme?: string;
  config?: string;
  output?: string;
  verbose?: boolean;
  debug?: boolean;
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
    .command('status')
    .description('Show monitoring dashboard status')
    .option('-o, --output <format>', 'Output format (table, json)', 'table')
    .action(async (options: Pick<MonitorOptions, 'output'>) => {
      const handler = new MonitorHandler();
      await handler.showStatus(options);
    });

  monitorCommand
    .command('config')
    .description('Manage monitoring configuration')
    .option('-o, --output <format>', 'Output format (table, json)', 'table')
    .action(async (options: Pick<MonitorOptions, 'output'>) => {
      const handler = new MonitorHandler();
      await handler.showConfig(options);
    });

  monitorCommand
    .command('layouts')
    .description('List available dashboard layouts')
    .option('-o, --output <format>', 'Output format (table, json)', 'table')
    .action(async (options: Pick<MonitorOptions, 'output'>) => {
      const handler = new MonitorHandler();
      await handler.listLayouts(options);
    });

  monitorCommand
    .command('themes')
    .description('List available themes')
    .option('-o, --output <format>', 'Output format (table, json)', 'table')
    .action(async (options: Pick<MonitorOptions, 'output'>) => {
      const handler = new MonitorHandler();
      await handler.listThemes(options);
    });

  monitorCommand
    .command('test')
    .description('Test monitoring dashboard compatibility')
    .option('-o, --output <format>', 'Output format (table, json)', 'table')
    .action(async (options: Pick<MonitorOptions, 'output'>) => {
      const handler = new MonitorHandler();
      await handler.testCompatibility(options);
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