import { Command } from 'commander';
import { MaterialHandler } from '../handlers/material.handler';
import { logError } from '../utils/errors';
import {
  commandParentOptions,
  loadApiCommandConfig,
  parsePositiveInteger,
  parseTimestamp,
  validateOutputFormat,
} from '../utils/api-command';

function withMaterialHandler(program: Command, run: (handler: MaterialHandler) => Promise<void>): Promise<void> {
  return (async () => {
    try {
      const { authConfig, serviceConfig } = await loadApiCommandConfig(commandParentOptions(program));
      await run(new MaterialHandler(authConfig, serviceConfig));
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)));
      process.exit(1);
    }
  })();
}

export function registerMaterialCommands(program: Command): void {
  const materialCmd = program.command('material').description('Manage material library');

  materialCmd.command('list')
    .description('List materials')
    .requiredOption('--type <type>', 'material type (video|image|audio|document)')
    .requiredOption('--page-number <page>', 'page number', parsePositiveInteger)
    .requiredOption('--page-size <size>', 'page size', parsePositiveInteger)
    .option('--category-id <id>', 'category ID', parsePositiveInteger)
    .option('--title <title>', 'title keyword')
    .option('--start-create-time <timestamp>', 'start create timestamp', parseTimestamp)
    .option('--end-create-time <timestamp>', 'end create timestamp', parseTimestamp)
    .option('--expire-second <seconds>', 'URL expire seconds', parsePositiveInteger)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withMaterialHandler(program, handler => handler.listMaterials(options)));

  materialCmd.command('delete')
    .description('Delete materials')
    .requiredOption('--material-ids <ids>', 'material IDs, comma-separated', (value) => value.split(',').map((item) => item.trim()).filter(Boolean))
    .option('--delete-completely <value>', 'permanent delete flag')
    .option('--allow-partial-delete <value>', 'allow partial delete flag')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withMaterialHandler(program, handler => handler.deleteMaterials(options)));

  const categoryCmd = materialCmd.command('category').description('Material category APIs');
  categoryCmd.command('list')
    .description('List material categories')
    .requiredOption('--material-type <type>', 'material type')
    .option('--parent-id <id>', 'parent category ID', parsePositiveInteger)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withMaterialHandler(program, handler => handler.listCategories(options)));

  const labelCmd = materialCmd.command('label').description('Material label APIs');
  labelCmd.command('list')
    .description('List material labels')
    .requiredOption('--page-number <page>', 'page number', parsePositiveInteger)
    .requiredOption('--page-size <size>', 'page size', parsePositiveInteger)
    .option('--keyword <keyword>', 'label keyword')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withMaterialHandler(program, handler => handler.listLabels(options)));

  labelCmd.command('create')
    .description('Create material label')
    .requiredOption('--name <name>', 'label name')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withMaterialHandler(program, handler => handler.createLabel(options)));

  labelCmd.command('update')
    .description('Update material label')
    .requiredOption('--id <id>', 'label ID', parsePositiveInteger)
    .requiredOption('--name <name>', 'label name')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withMaterialHandler(program, handler => handler.updateLabel(options)));

  labelCmd.command('delete')
    .description('Delete material label')
    .requiredOption('--id <id>', 'label ID', parsePositiveInteger)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withMaterialHandler(program, handler => handler.deleteLabel(options)));
}
