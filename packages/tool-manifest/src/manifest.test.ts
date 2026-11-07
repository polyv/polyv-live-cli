import { Command } from 'commander';
import { FORMAT_VERSION, buildManifest, serializeManifest } from './manifest';
import { LoadedCliTree } from './load-cli';
import { ToolEntry } from './types';

function fixtureTree(): LoadedCliTree {
  const program = new Command();
  program.name('polyv-live-cli');

  const channel = program.command('channel').description('Manage channels');
  channel
    .command('list')
    .description('List channels')
    .option('-P, --page <number>', 'page number')
    .option('--watch-status <status>', 'filter by watch page status (live|playback|end)');
  channel
    .command('create')
    .description('Create a channel')
    .requiredOption('--name <name>', 'channel name')
    .requiredOption('--source <ignored>', 'should never surface');

  const account = program.command('account').description('Manage accounts');
  account
    .command('add <name>')
    .description('Add an account')
    .requiredOption('--app-id <id>', 'app id');
  account
    .command('api')
    .description('Account API')
    .command('playback')
    .description('Playback API')
    .command('list')
    .description('List playback records');

  const viewer = program.command('viewer').description('Manage viewers');
  viewer
    .command('list')
    .description('List viewers')
    .option('--source <type>', 'local source filter (shadowed at runtime)');

  return {
    program,
    cliVersion: '0.0.0-test',
    commanderVersion: '11.1.0',
    registrationOrder: ['fixture'],
    unusedRegisterFunctions: [],
    sourceParamShadowed: [['viewer', 'list']],
    warnings: [],
  };
}

describe('manifest assembly', () => {
  it('carries formatVersion "1" and an explicit empty curatedWhitelist', () => {
    const manifest = buildManifest(fixtureTree(), '2026-11-07T00:00:00.000Z', { curation: false });
    expect(manifest.formatVersion).toBe(FORMAT_VERSION);
    expect(manifest.formatVersion).toBe('1');
    expect(manifest.curatedWhitelist).toEqual([]);
  });

  it('records generator and cli metadata', () => {
    const manifest = buildManifest(fixtureTree(), '2026-11-07T00:00:00.000Z', { curation: false });
    expect(manifest.generator.name).toBe('@polyv/tool-manifest');
    expect(manifest.cli.package).toBe('polyv-live-cli');
    expect(manifest.cli.version).toBe('0.0.0-test');
  });

  it('names tools after full command paths and includes 4-level paths', () => {
    const manifest = buildManifest(fixtureTree(), '2026-11-07T00:00:00.000Z', { curation: false });
    const names = manifest.tools.map((tool: ToolEntry) => tool.name);
    expect(names).toContain('mcp_polyv_channel_list');
    expect(names).toContain('mcp_polyv_account_api_playback_list');
    expect(names).toContain('mcp_polyv_account_add');
  });

  it('marks API-bound tools serverInjected=["source"] and exempt paths not', () => {
    const manifest = buildManifest(fixtureTree(), '2026-11-07T00:00:00.000Z', { curation: false });
    const byName = new Map(manifest.tools.map(tool => [tool.name, tool]));
    expect(byName.get('mcp_polyv_channel_list')).toMatchObject({ serverInjected: ['source'], sourceExempt: false });
    // account/* is in the CLI's SOURCE_EXEMPT_COMMANDS
    expect(byName.get('mcp_polyv_account_add')).toMatchObject({ serverInjected: [], sourceExempt: true });
    expect(manifest.stats.sourceExemptTools).toBe(2); // account add + account api playback list
    expect(manifest.stats.sourceInjectedTools).toBe(3);
  });

  it('never exposes source as an inputSchema property, even for commands that declare their own --source', () => {
    const manifest = buildManifest(fixtureTree(), '2026-11-07T00:00:00.000Z', { curation: false });
    for (const tool of manifest.tools) {
      expect(tool.inputSchema.properties.source).toBeUndefined();
      expect(tool.inputSchema.required).not.toContain('source');
    }
    // the shadowed local --source is still recorded for operators
    expect(manifest.stats.sourceParamShadowed).toEqual([['viewer', 'list']]);
  });

  it('computes verb distribution and enum coverage', () => {
    const manifest = buildManifest(fixtureTree(), '2026-11-07T00:00:00.000Z', { curation: false });
    expect(manifest.stats.leafTools).toBe(5);
    expect(manifest.stats.toolsByVerbClass).toEqual({ read: 3, write: 2, unknown: 0 });
    expect(manifest.stats.enumCoverage).toEqual({ high: 0, medium: 1, low: 0, none: 4 });
  });

  it('is deterministic apart from generatedAt (stable serialization)', () => {
    const first = buildManifest(fixtureTree(), '2026-11-07T00:00:00.000Z', { curation: false });
    const second = buildManifest(fixtureTree(), '2026-11-08T00:00:00.000Z', { curation: false });
    const strip = (json: string): string => json.replace(/"generatedAt": "[^"]+"/, '"generatedAt": "X"');
    expect(strip(serializeManifest(first))).toBe(strip(serializeManifest(second)));
    expect(serializeManifest(first).endsWith('\n')).toBe(true);
  });
});
