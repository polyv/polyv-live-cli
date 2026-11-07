/**
 * @fileoverview CLI entry for manifest generation.
 *
 * Usage (from repo root or this package):
 *   pnpm --filter @polyv/tool-manifest generate
 *
 * Output: generated/tools.manifest.json inside this package (committed;
 * re-generating and diffing IS the change log, per AD-5).
 */

import fs from 'fs';
import path from 'path';
import { ensureCliBuilt, loadCliTree } from './load-cli';
import { buildManifest, serializeManifest } from './manifest';

const OUTPUT_RELATIVE_PATH = path.join('generated', 'tools.manifest.json');

function main(): void {
  const built = ensureCliBuilt();
  if (built) {
    console.log('[tool-manifest] polyv-live-cli dist was missing — rebuilt it.');
  }

  const tree = loadCliTree();
  const generatedAt = new Date().toISOString();
  const manifest = buildManifest(tree, generatedAt);
  const json = serializeManifest(manifest);

  const outputPath = path.resolve(__dirname, '..', OUTPUT_RELATIVE_PATH);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, json, 'utf8');

  const { stats } = manifest;
  console.log(`[tool-manifest] wrote ${path.relative(process.cwd(), outputPath)}`);
  console.log(
    `[tool-manifest] cli ${manifest.cli.version} | top-level=${stats.topLevelCommands} nodes=${stats.treeNodes} leaves=${stats.leafTools} maxDepth=${stats.maxDepth}`,
  );
  console.log(
    `[tool-manifest] verbs read=${stats.toolsByVerbClass.read} write=${stats.toolsByVerbClass.write} unknown=${stats.toolsByVerbClass.unknown} | enums high=${stats.enumCoverage.high} medium=${stats.enumCoverage.medium} low=${stats.enumCoverage.low} none=${stats.enumCoverage.none}`,
  );
  console.log(
    `[tool-manifest] serverInjected(--source)=${stats.sourceInjectedTools} tools, sourceExempt=${stats.sourceExemptTools} tools, local --source shadowed on ${stats.sourceParamShadowed.length} commands`,
  );
  if (stats.warnings.length > 0) {
    console.log(`[tool-manifest] warnings (${stats.warnings.length}):`);
    for (const warning of stats.warnings) {
      console.log(`  - ${warning}`);
    }
  }
}

main();
