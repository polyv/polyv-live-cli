import { Command } from 'commander';
import { CustomFieldHandler } from '../handlers/custom-field.handler';
import { logError } from '../utils/errors';
import {
  commandParentOptions,
  loadApiCommandConfig,
  validateOutputFormat,
} from '../utils/api-command';

function withCustomFieldHandler(program: Command, run: (handler: CustomFieldHandler) => Promise<void>): Promise<void> {
  return (async () => {
    try {
      const { authConfig, serviceConfig } = await loadApiCommandConfig(commandParentOptions(program));
      await run(new CustomFieldHandler(authConfig, serviceConfig));
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)));
      process.exit(1);
    }
  })();
}

export function registerCustomFieldCommands(program: Command): void {
  const customFieldCmd = program.command('custom-field').description('Manage user custom fields');

  customFieldCmd.command('list')
    .description('List custom fields')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withCustomFieldHandler(program, handler => handler.list(options)));

  customFieldCmd.command('add')
    .description('Add a custom field')
    .requiredOption('--custom-field-id <id>', 'custom field ID (required, max 64 chars)')
    .requiredOption('--custom-field-name <name>', 'custom field name (required, max 64 chars)')
    .requiredOption('--custom-field-type <type>', 'custom field type (required: text|image|link)')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withCustomFieldHandler(program, handler => handler.add(options)));

  const valueCmd = customFieldCmd.command('value').description('Manage custom field viewer values');

  valueCmd.command('save')
    .description('Save custom field viewer values')
    .option('--values <json>', 'JSON array of {viewerId,customFieldId,customFieldValue}')
    .option('--viewer-id <id>', 'viewer ID for single value')
    .option('--custom-field-id <id>', 'custom field ID for single value')
    .option('--custom-field-value <value>', 'custom field value for single value')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withCustomFieldHandler(program, handler => handler.saveValues(options)));
}
