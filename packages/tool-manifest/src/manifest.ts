/**
 * @fileoverview Manifest assembly: walk the loaded CLI tree into the full
 * tool inventory with deterministic ordering and reproducible output.
 */

import { Command } from 'commander';
import { LoadedCliTree, collectLeaves, collectTreeStats, sourceExemptCommandNames } from './load-cli';
import { findNameCollisions, toolNameFromPath } from './naming';
import { buildInputSchema } from './schema';
import { classifyVerb } from './verb';
import { ToolEntry, ToolManifest } from './types';

export const FORMAT_VERSION = '1';

function generatorPackageInfo(): { name: string; version: string } {
  const packageJson = require('../package.json') as { name: string; version: string };
  return { name: packageJson.name, version: packageJson.version };
}

/** Build the full tool inventory + stats from a loaded CLI tree. */
export function buildManifest(tree: LoadedCliTree, generatedAt: string): ToolManifest {
  const warnings = [...tree.warnings];
  const exemptNames = sourceExemptCommandNames();
  const stats = collectTreeStats(tree.program);
  const leaves = collectLeaves(tree.program);

  // Name collisions would break the manifest contract — fail loudly.
  const collisions = findNameCollisions(leaves.map(leaf => leaf.commandPath));
  if (collisions.size > 0) {
    throw new Error(`Tool name collisions after normalization: ${[...collisions.keys()].join(', ')}`);
  }

  const tools: ToolEntry[] = leaves.map(({ command, commandPath }) =>
    buildToolEntry(command, commandPath, exemptNames, warnings),
  );

  const toolsByVerbClass = countBy(tools);
  const enumCoverage = { high: 0, medium: 0, low: 0, none: 0 };
  for (const tool of tools) {
    const confidences = Object.values(tool.inputSchema.properties)
      .map(param => param.enumConfidence)
      .filter((value): value is 'high' | 'medium' | 'low' => Boolean(value));
    // A tool counts at the highest confidence any of its params reached.
    if (confidences.includes('high')) {
      enumCoverage.high += 1;
    } else if (confidences.includes('medium')) {
      enumCoverage.medium += 1;
    } else if (confidences.includes('low')) {
      enumCoverage.low += 1;
    } else {
      enumCoverage.none += 1;
    }
  }

  return {
    formatVersion: FORMAT_VERSION,
    generator: generatorPackageInfo(),
    cli: {
      package: 'polyv-live-cli',
      version: tree.cliVersion,
      commanderVersion: tree.commanderVersion,
    },
    stats: {
      topLevelCommands: stats.topLevelCommands,
      treeNodes: stats.treeNodes,
      leafTools: stats.leafTools,
      maxDepth: stats.maxDepth,
      toolsByVerbClass: {
        read: toolsByVerbClass.get('read') ?? 0,
        write: toolsByVerbClass.get('write') ?? 0,
        unknown: toolsByVerbClass.get('unknown') ?? 0,
      },
      enumCoverage,
      sourceInjectedTools: tools.filter(tool => tool.serverInjected.length > 0).length,
      sourceExemptTools: tools.filter(tool => tool.sourceExempt).length,
      sourceParamShadowed: tree.sourceParamShadowed,
      warnings,
    },
    curatedWhitelist: [],
    tools,
    generatedAt,
  };
}

function buildToolEntry(
  command: Command,
  commandPath: string[],
  exemptNames: Set<string>,
  warnings: string[],
): ToolEntry {
  const description = command.description() ?? '';
  if (!description) {
    warnings.push(`command without description: ${commandPath.join(' ')}`);
  }
  const { schema, warnings: schemaWarnings } = buildInputSchema(command);
  warnings.push(...schemaWarnings);

  // Mirror the CLI's own exemption rule: any path segment in {auth, account, use, config}.
  const sourceExempt = commandPath.some(segment => exemptNames.has(segment));

  return {
    name: toolNameFromPath(commandPath),
    description,
    commandPath,
    verbClass: classifyVerb(commandPath[commandPath.length - 1] ?? '', description),
    sourceExempt,
    serverInjected: sourceExempt ? [] : ['source'],
    inputSchema: schema,
  };
}

function countBy<T extends string>(items: { verbClass: T }[]): Map<T, number> {
  const counts = new Map<T, number>();
  for (const item of items) {
    counts.set(item.verbClass, (counts.get(item.verbClass) ?? 0) + 1);
  }
  return counts;
}

/** Stable JSON serialization: key order is fixed by construction; 2-space indent + trailing newline. */
export function serializeManifest(manifest: ToolManifest): string {
  return JSON.stringify(manifest, null, 2) + '\n';
}
