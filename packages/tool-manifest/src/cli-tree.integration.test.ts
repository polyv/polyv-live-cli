/**
 * Integration test against the real polyv-live-cli dist build.
 * Skipped automatically when the CLI has not been built yet (fresh checkout
 * without `pnpm --filter polyv-live-cli build`), so `pnpm -r test` stays green.
 */

import fs from 'fs';
import path from 'path';
import { loadCliTree, collectLeaves, collectTreeStats, sourceExemptCommandNames } from './load-cli';
import { buildManifest } from './manifest';
import { TOOL_NAME_PREFIX } from './naming';

const distCommands = path.join(__dirname, '..', '..', 'cli', 'dist', 'commands');
const cliDistAvailable = fs.existsSync(distCommands);

const describeIfBuilt = cliDistAvailable ? describe : describe.skip;

describeIfBuilt('real CLI tree (dist)', () => {
  it('builds the expected tree shape: 41 top-level groups / 728 nodes / 572 leaves / depth 4', () => {
    const tree = loadCliTree();
    const stats = collectTreeStats(tree.program);
    expect(stats.topLevelCommands).toBe(41);
    expect(stats.treeNodes).toBe(728);
    expect(stats.leafTools).toBe(572);
    expect(stats.maxDepth).toBe(4);
    // every node carries a non-empty description (728/728 per Story 1 survey)
    const leaves = collectLeaves(tree.program);
    for (const { command, commandPath } of leaves) {
      expect(command.description()).toBeTruthy();
      expect(commandPath.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('includes the documented 4-level path example', () => {
    const leaves = collectLeaves(loadCliTree().program);
    const paths = leaves.map(leaf => leaf.commandPath.join(' '));
    expect(paths).toContain('account api playback list');
  });

  it('mirrors the CLI source-exempt command set', () => {
    expect([...sourceExemptCommandNames()].sort()).toEqual(['account', 'auth', 'config', 'use']);
  });
});

describeIfBuilt('real manifest (dist)', () => {
  it('produces 572 unique mcp_polyv_ tools with --source never in any inputSchema', () => {
    const manifest = buildManifest(loadCliTree(), '2026-11-07T00:00:00.000Z');
    expect(manifest.formatVersion).toBe('1');
    expect(manifest.curatedWhitelist).toEqual([]);
    expect(manifest.tools).toHaveLength(572);

    const names = new Set<string>();
    for (const tool of manifest.tools) {
      expect(tool.name.startsWith(TOOL_NAME_PREFIX)).toBe(true);
      expect(names.has(tool.name)).toBe(false);
      names.add(tool.name);
      expect(tool.inputSchema.properties.source).toBeUndefined();
      expect(tool.inputSchema.required).not.toContain('source');
      expect(tool.description.length).toBeGreaterThan(0);
    }

    // spot checks
    const byName = new Map(manifest.tools.map(tool => [tool.name, tool]));
    expect(byName.get('mcp_polyv_channel_list')).toBeDefined();
    expect(byName.get('mcp_polyv_watch_condition_set')).toBeDefined();
    expect(byName.get('mcp_polyv_account_api_playback_list')).toMatchObject({ sourceExempt: true });

    const verbTotals = manifest.stats.toolsByVerbClass;
    expect(verbTotals.read + verbTotals.write + verbTotals.unknown).toBe(572);
  });

  it('records the two runtime-shadowed local --source commands', () => {
    const manifest = buildManifest(loadCliTree(), '2026-11-07T00:00:00.000Z');
    expect(manifest.stats.sourceParamShadowed).toEqual([
      ['channel', 'viewer', 'unrelated-list'],
      ['viewer', 'list'],
    ]);
  });
});
