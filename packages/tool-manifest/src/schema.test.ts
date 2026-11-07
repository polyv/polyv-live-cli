import { Command } from 'commander';
import { buildInputSchema, EXCLUDED_FLAGS } from './schema';

function parsePositiveInteger(value: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error('Value must be a positive integer');
  }
  return parsed;
}

function validateOutputFormat(value: string): 'table' | 'json' {
  const validFormats = ['table', 'json'];
  if (!validFormats.includes(value)) {
    throw new Error(`Invalid output format: ${value}. Must be one of: table, json`);
  }
  return value as 'table' | 'json';
}

function validateCallbackType(value: string): 'stream' | 'record' | 'playback' {
  if (!['stream', 'record', 'playback'].includes(value)) {
    throw new Error('type must be one of: stream, record, playback');
  }
  return value as 'stream' | 'record' | 'playback';
}

function getAllowedModes(): string[] {
  return ['fast', 'slow']; // pretend this comes from runtime config
}

describe('inputSchema generation', () => {
  it('maps requiredOption to a required param and records defaults and numeric types', () => {
    const program = new Command();
    const leaf = program
      .command('channel')
      .command('get')
      .requiredOption('-c, --channel-id <id>', 'channel ID')
      .option('-P, --page <number>', 'page number', parsePositiveInteger, 1)
      .description('Get channel');

    const { schema } = buildInputSchema(leaf);
    expect(schema.type).toBe('object');
    expect(schema.additionalProperties).toBe(false);
    expect(schema.required).toEqual(['channelId']);
    expect(schema.properties.channelId).toMatchObject({
      type: 'string',
      flag: '--channel-id',
      origin: 'option',
      description: 'channel ID',
    });
    expect(schema.properties.page).toMatchObject({
      type: 'integer',
      default: 1,
    });
  });

  it('maps positional arguments from .command("add <name>") to required params', () => {
    const program = new Command();
    const leaf = program
      .command('account')
      .command('add <name>')
      .requiredOption('--app-id <id>', 'app id')
      .description('Add account');

    const { schema } = buildInputSchema(leaf);
    expect(schema.properties.name).toMatchObject({
      type: 'string',
      origin: 'positional',
      arg: '<name>',
    });
    expect(schema.required).toEqual(['appId', 'name']);
  });

  it('maps optional positional arguments as non-required', () => {
    const program = new Command();
    const leaf = program
      .command('use')
      .command('switch [name]')
      .description('Switch account');

    const { schema } = buildInputSchema(leaf);
    expect(schema.properties.name).toMatchObject({ origin: 'positional', arg: '[name]' });
    expect(schema.required).toEqual([]);
  });

  it('excludes --source from inputSchema (server-injected / runtime-shadowed)', () => {
    expect(EXCLUDED_FLAGS.has('--source')).toBe(true);

    const program = new Command();
    const leaf = program
      .command('viewer')
      .command('list')
      .option('--source <type>', 'filter by source (IMPORT|WX|MOBILE)')
      .option('--mobile <number>', 'filter by mobile number')
      .description('List viewers');

    const { schema } = buildInputSchema(leaf);
    expect(Object.keys(schema.properties)).toEqual(['mobile']);
    expect(schema.properties.source).toBeUndefined();
  });

  it('infers enums from description "(a|b)" patterns with medium confidence', () => {
    const program = new Command();
    const leaf = program
      .command('watch-condition')
      .command('set')
      .option('--auth-type <type>', '认证类型 (none|code|pay|phone|info|custom|external|direct)')
      .option('--enabled <value>', '是否启用 (Y|N)')
      .description('设置观看条件');

    const { schema } = buildInputSchema(leaf);
    expect(schema.properties.authType).toMatchObject({
      enum: ['none', 'code', 'pay', 'phone', 'info', 'custom', 'external', 'direct'],
      enumConfidence: 'medium',
    });
    expect(schema.properties.enabled).toMatchObject({ enum: ['Y', 'N'], enumConfidence: 'medium' });
  });

  it('infers enums from parser function source with high confidence', () => {
    const program = new Command();
    const leaf = program
      .command('callback')
      .command('set')
      .option('--type <type>', 'callback type', validateCallbackType)
      .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
      .description('Set callback');

    const { schema } = buildInputSchema(leaf);
    expect(schema.properties.type).toMatchObject({
      enum: ['stream', 'record', 'playback'],
      enumConfidence: 'high',
    });
    // parser-inferred enum wins over the description pattern
    expect(schema.properties.output).toMatchObject({
      enum: ['table', 'json'],
      enumConfidence: 'high',
    });
  });

  it('marks set-style validators without extractable enums as low confidence', () => {
    function validateMode(value: string): string {
      const allowed = getAllowedModes(); // dynamic set — values not statically visible
      if (!allowed.includes(value)) {
        throw new Error('mode must be one of the configured modes');
      }
      return value;
    }
    const program = new Command();
    const leaf = program
      .command('mode')
      .command('check <value>')
      .description('Check mode')
      .option('--mode <mode>', 'mode', validateMode);

    const { schema } = buildInputSchema(leaf);
    expect(schema.properties.mode).toMatchObject({ enumConfidence: 'low' });
    expect(schema.properties.mode?.enum).toBeUndefined();
  });

  it('does not flag plain numeric coercions as enum-ish', () => {
    const program = new Command();
    const leaf = program
      .command('page')
      .command('probe')
      .description('Probe')
      .option('--page <number>', 'page number', parsePositiveInteger, 1);

    const { schema } = buildInputSchema(leaf);
    expect(schema.properties.page?.enumConfidence).toBeUndefined();
    expect(schema.properties.page?.type).toBe('integer');
  });

  it('handles boolean flags, variadic options and optional-value flags', () => {
    const program = new Command();
    const leaf = program
      .command('channel')
      .command('batch-delete')
      .requiredOption('--channel-ids <ids...>', 'channel IDs to delete')
      .option('-f, --force', 'skip confirmation')
      .option('--color [color]', 'optional color')
      .description('Batch delete');

    const { schema } = buildInputSchema(leaf);
    expect(schema.properties.channelIds).toMatchObject({
      type: 'array',
      items: { type: 'string' },
    });
    expect(schema.properties.channelIds?.flag).toBe('--channel-ids');
    expect(schema.properties.force?.type).toBe('boolean');
    expect(schema.properties.color?.type).toBe('string');
    expect(schema.required).toEqual(['channelIds']);
  });

  it('sorts properties and required arrays deterministically', () => {
    const build = () => {
      const program = new Command();
      const leaf = program
        .command('zeta')
        .command('alpha')
        .requiredOption('--beta <b>', 'b')
        .requiredOption('--alpha <a>', 'a')
        .option('--zulu <z>', 'z')
        .description('sorting fixture');
      return buildInputSchema(leaf).schema;
    };
    expect(JSON.stringify(build())).toBe(JSON.stringify(build()));
    const { properties, required } = build();
    expect(Object.keys(properties)).toEqual(['alpha', 'beta', 'zulu']);
    expect(required).toEqual(['alpha', 'beta']);
  });

  it('warns instead of overwriting on duplicate parameter names', () => {
    const program = new Command();
    const leaf = program
      .command('dup')
      .command('thing')
      .option('--channel-id <id>', 'first')
      .option('--channelId <id2>', 'second (same attributeName)')
      .description('dup fixture');

    const { schema, warnings } = buildInputSchema(leaf);
    expect(Object.keys(schema.properties)).toEqual(['channelId']);
    expect(warnings.some(warning => warning.includes('duplicate parameter name "channelId"'))).toBe(true);
  });
});
