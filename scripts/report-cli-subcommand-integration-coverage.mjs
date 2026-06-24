#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const inventoryPath = resolve(repoRoot, 'docs/api-reference/cli-inventory.json');
const integrationRoot = resolve(repoRoot, 'packages/cli/tests/integration');
const outputDir = resolve(repoRoot, 'docs/api-reference');
const reportJsonPath = resolve(outputDir, 'cli-integration-coverage.json');
const reportMarkdownPath = resolve(outputDir, 'CLI_INTEGRATION_COVERAGE.md');

const args = new Set(process.argv.slice(2));
const failOnMissing = args.has('--fail-on-missing');
const jsonOnly = args.has('--json');

async function main() {
  if (!existsSync(inventoryPath)) {
    throw new Error(`Missing CLI inventory: ${toPosix(relative(repoRoot, inventoryPath))}`);
  }

  if (!existsSync(integrationRoot)) {
    throw new Error(`Missing integration test directory: ${toPosix(relative(repoRoot, integrationRoot))}`);
  }

  const inventory = JSON.parse(await readFile(inventoryPath, 'utf8'));
  const commands = inventory.commands.map((command) => ({
    command: command.command,
    path: command.path,
    depth: command.depth,
    file: command.file,
    line: command.line
  }));
  const commandNames = commands.map((command) => command.command);
  const commandSet = new Set(commandNames);
  const topLevelCommands = new Set(commands.filter((command) => command.depth === 1).map((command) => command.command));
  const leafTargets = commands
    .filter((command) => command.depth >= 2)
    .filter((command) => !commandNames.some((candidate) => candidate !== command.command && candidate.startsWith(`${command.command} `)));

  const integrationFiles = await walkFiles(integrationRoot, (file) => /\.(test|spec)\.ts$/.test(file));
  const references = await collectIntegrationReferences({
    commandSet,
    topLevelCommands,
    integrationFiles
  });

  const realCoveredCommands = new Set(references.filter((reference) => !reference.isHelp).map((reference) => reference.command));
  const anyCoveredCommands = new Set(references.map((reference) => reference.command));

  const realCoveredTargets = leafTargets.filter((target) => realCoveredCommands.has(target.command));
  const anyCoveredTargets = leafTargets.filter((target) => anyCoveredCommands.has(target.command));
  const missingRealExecutionTargets = leafTargets.filter((target) => !realCoveredCommands.has(target.command));
  const missingIncludingHelpTargets = leafTargets.filter((target) => !anyCoveredCommands.has(target.command));
  const byTopLevel = buildTopLevelSummary(leafTargets, realCoveredCommands, anyCoveredCommands);

  const reportContent = {
    source: {
      cliInventory: 'docs/api-reference/cli-inventory.json',
      integrationTests: 'packages/cli/tests/integration/**/*.test.ts',
      generatedReports: [
        'docs/api-reference/cli-integration-coverage.json',
        'docs/api-reference/CLI_INTEGRATION_COVERAGE.md'
      ]
    },
    rules: {
      targetUniverse:
        'Counts leaf CLI command paths from docs/api-reference/cli-inventory.json with depth >= 2. Non-leaf command groups are not counted unless they are leaves.',
      realExecutionCoverage:
        'Counts static integration-test invocations through local CLI argument arrays or node dist/index.js command strings, excluding --help/-h invocations.',
      helpCoverage:
        'Help invocations are tracked separately and do not count as real execution coverage.',
      staticAnalysis:
        'This report is static analysis of integration test source. Dynamic command construction may require manual review if it is not visible as string literals.'
    },
    summary: {
      inventoryGeneratedAt: inventory.generatedAt ?? null,
      integrationFiles: integrationFiles.length,
      cliCommandPaths: commands.length,
      cliTopLevelCommands: topLevelCommands.size,
      targetLeafCommands: leafTargets.length,
      referencedCommandPathsIncludingHelp: anyCoveredCommands.size,
      referencedCommandPathsExcludingHelp: realCoveredCommands.size,
      coveredLeafTargetsIncludingHelp: anyCoveredTargets.length,
      missingLeafTargetsIncludingHelp: missingIncludingHelpTargets.length,
      coveredRealExecutionLeafTargets: realCoveredTargets.length,
      missingRealExecutionLeafTargets: missingRealExecutionTargets.length,
      realExecutionCoveragePercent: percent(realCoveredTargets.length, leafTargets.length),
      includingHelpCoveragePercent: percent(anyCoveredTargets.length, leafTargets.length),
      integrationReferences: references.length,
      realExecutionReferences: references.filter((reference) => !reference.isHelp).length,
      helpReferences: references.filter((reference) => reference.isHelp).length
    },
    byTopLevel,
    missingRealExecutionTargets,
    missingIncludingHelpTargets,
    coveredRealExecutionTargets: realCoveredTargets,
    referenceSummaryByCommand: buildReferenceSummary(references)
  };

  const generatedAt = await resolveGeneratedAt(reportContent);
  const report = { generatedAt, ...reportContent };

  await mkdir(outputDir, { recursive: true });
  const wroteJson = await writeIfChanged(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`);
  const wroteMarkdown = await writeIfChanged(reportMarkdownPath, buildMarkdown(report));

  if (jsonOnly) {
    process.stdout.write(`${JSON.stringify(report.summary, null, 2)}\n`);
  } else {
    printSummary(report, wroteJson, wroteMarkdown);
  }

  if (failOnMissing && report.summary.missingRealExecutionLeafTargets > 0) {
    process.exitCode = 1;
  }
}

async function walkFiles(rootDir, predicate = () => true) {
  const results = [];

  async function visit(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const absolutePath = resolve(dir, entry.name);
      if (entry.isDirectory()) {
        await visit(absolutePath);
      } else if (entry.isFile() && predicate(absolutePath)) {
        results.push(absolutePath);
      }
    }
  }

  await visit(rootDir);
  return results.sort((left, right) => toPosix(left).localeCompare(toPosix(right)));
}

async function collectIntegrationReferences({ commandSet, topLevelCommands, integrationFiles }) {
  const references = [];
  const seen = new Set();

  for (const file of integrationFiles) {
    const source = await readFile(file, 'utf8');
    const relativeFile = toPosix(relative(repoRoot, file));
    const candidates = [
      ...extractArrayCandidates(source),
      ...extractShellCommandCandidates(source)
    ];

    for (const candidate of candidates) {
      if (!candidate.args.length || !topLevelCommands.has(candidate.args[0])) continue;

      const command = matchCommand(candidate.args, commandSet);
      if (!command) continue;

      const isHelp = candidate.args.includes('--help') || candidate.args.includes('-h');
      const key = `${relativeFile}:${candidate.line}:${command}:${isHelp}:${candidate.args.join('\u0000')}`;
      if (seen.has(key)) continue;
      seen.add(key);

      references.push({
        command,
        args: candidate.args,
        isHelp,
        file: relativeFile,
        line: candidate.line,
        source: candidate.source
      });
    }
  }

  return references.sort(
    (left, right) =>
      left.command.localeCompare(right.command) ||
      left.file.localeCompare(right.file) ||
      left.line - right.line
  );
}

function extractArrayCandidates(source) {
  const candidates = [];
  const arrayPattern = /\[((?:[^\[\]]|\n){0,2500})\]/g;

  for (const match of source.matchAll(arrayPattern)) {
    const args = extractQuotedStrings(match[1]);
    if (!args.length) continue;
    candidates.push({
      args,
      line: lineNumberAt(source, match.index),
      source: 'array-literal'
    });
  }

  return candidates;
}

function extractShellCommandCandidates(source) {
  const candidates = [];
  const shellPattern = /node\s+(?:\$\{cliPath\}|dist\/index\.js|[^`'"\n\s]*dist\/index\.js)\s+([^`'"\n]+)/g;

  for (const match of source.matchAll(shellPattern)) {
    const args = splitShellWords(match[1]);
    if (!args.length) continue;
    candidates.push({
      args,
      line: lineNumberAt(source, match.index),
      source: 'node-command-string'
    });
  }

  return candidates;
}

function extractQuotedStrings(value) {
  const strings = [];
  const stringPattern = /(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g;

  for (const match of value.matchAll(stringPattern)) {
    strings.push(match[2].replace(/\\(['"`\\])/g, '$1'));
  }

  return strings;
}

function splitShellWords(value) {
  const words = [];
  let current = '';
  let quote = null;

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];

    if (quote) {
      if (char === quote) {
        quote = null;
      } else {
        current += char;
      }
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }

    if (/\s/.test(char)) {
      if (current) {
        words.push(current);
        current = '';
      }
      continue;
    }

    current += char;
  }

  if (current) words.push(current);

  return words.filter((word) => word && !word.includes('${'));
}

function matchCommand(args, commandSet) {
  const tokens = [];

  for (const arg of args) {
    if (!arg || arg.startsWith('-')) break;
    tokens.push(arg);
    const current = tokens.join(' ');
    const hasPrefix = [...commandSet].some((command) => command === current || command.startsWith(`${current} `));
    if (!hasPrefix) break;
  }

  for (let length = tokens.length; length >= 1; length -= 1) {
    const candidate = tokens.slice(0, length).join(' ');
    if (commandSet.has(candidate)) return candidate;
  }

  return null;
}

function buildTopLevelSummary(leafTargets, realCoveredCommands, anyCoveredCommands) {
  const byTopLevel = new Map();

  for (const target of leafTargets) {
    const topLevel = target.path[0];
    if (!byTopLevel.has(topLevel)) {
      byTopLevel.set(topLevel, {
        command: topLevel,
        targetLeafCommands: 0,
        coveredRealExecutionLeafTargets: 0,
        missingRealExecutionLeafTargets: 0,
        coveredLeafTargetsIncludingHelp: 0,
        missingLeafTargetsIncludingHelp: 0,
        realExecutionCoveragePercent: 0,
        includingHelpCoveragePercent: 0
      });
    }

    const summary = byTopLevel.get(topLevel);
    summary.targetLeafCommands += 1;
    if (realCoveredCommands.has(target.command)) {
      summary.coveredRealExecutionLeafTargets += 1;
    } else {
      summary.missingRealExecutionLeafTargets += 1;
    }

    if (anyCoveredCommands.has(target.command)) {
      summary.coveredLeafTargetsIncludingHelp += 1;
    } else {
      summary.missingLeafTargetsIncludingHelp += 1;
    }
  }

  return [...byTopLevel.values()]
    .map((summary) => ({
      ...summary,
      realExecutionCoveragePercent: percent(summary.coveredRealExecutionLeafTargets, summary.targetLeafCommands),
      includingHelpCoveragePercent: percent(summary.coveredLeafTargetsIncludingHelp, summary.targetLeafCommands)
    }))
    .sort((left, right) => left.command.localeCompare(right.command));
}

function buildReferenceSummary(references) {
  const byCommand = new Map();

  for (const reference of references) {
    if (!byCommand.has(reference.command)) {
      byCommand.set(reference.command, {
        command: reference.command,
        realExecutionReferences: 0,
        helpReferences: 0,
        firstRealExecutionReference: null,
        firstHelpReference: null
      });
    }

    const summary = byCommand.get(reference.command);
    const compactReference = {
      file: reference.file,
      line: reference.line,
      source: reference.source
    };

    if (reference.isHelp) {
      summary.helpReferences += 1;
      if (!summary.firstHelpReference) summary.firstHelpReference = compactReference;
    } else {
      summary.realExecutionReferences += 1;
      if (!summary.firstRealExecutionReference) summary.firstRealExecutionReference = compactReference;
    }
  }

  return [...byCommand.values()].sort((left, right) => left.command.localeCompare(right.command));
}

async function resolveGeneratedAt(reportContent) {
  try {
    if (!existsSync(reportJsonPath)) return new Date().toISOString();
    const existing = JSON.parse(await readFile(reportJsonPath, 'utf8'));
    if (contentMatches(existing, reportContent)) return existing.generatedAt;
  } catch {
    // Ignore read or parse errors and fall back to a fresh timestamp.
  }

  return new Date().toISOString();
}

function contentMatches(existing, reportContent) {
  if (!existing || typeof existing !== 'object') return false;
  return Object.keys(reportContent).every((key) => isDeepStrictEqual(existing[key], reportContent[key]));
}

async function writeIfChanged(filePath, nextContent) {
  let previous = null;
  try {
    previous = await readFile(filePath, 'utf8');
  } catch {
    // File may not exist yet.
  }

  if (previous === nextContent) return false;
  await writeFile(filePath, nextContent, 'utf8');
  return true;
}

function buildMarkdown(report) {
  const summary = report.summary;
  const missingRows = report.missingRealExecutionTargets
    .map((target) => `| \`${escapeTableCell(target.command)}\` | \`${escapeTableCell(target.file)}:${target.line}\` |`)
    .join('\n') || '| _None_ | _All target leaf commands have real integration execution coverage._ |';

  const topLevelRows = report.byTopLevel
    .map((item) =>
      `| \`${escapeTableCell(item.command)}\` | ${item.targetLeafCommands} | ${item.coveredRealExecutionLeafTargets} | ${item.missingRealExecutionLeafTargets} | ${formatPercent(item.realExecutionCoveragePercent)} | ${item.coveredLeafTargetsIncludingHelp} | ${item.missingLeafTargetsIncludingHelp} |`
    )
    .join('\n');

  return `# CLI Integration Coverage

Generated at: ${report.generatedAt}

This report measures real local CLI execution coverage in \`packages/cli/tests/integration\`.
Help-only invocations are tracked separately and do not count as real execution coverage.

## Summary

| Metric | Value |
|--------|-------|
| Integration files scanned | ${summary.integrationFiles} |
| CLI command paths | ${summary.cliCommandPaths} |
| Target leaf subcommands | ${summary.targetLeafCommands} |
| Real-executed leaf subcommands | ${summary.coveredRealExecutionLeafTargets} |
| Missing real-execution leaf subcommands | ${summary.missingRealExecutionLeafTargets} |
| Real-execution coverage | ${formatPercent(summary.realExecutionCoveragePercent)} |
| Leaf subcommands referenced including help | ${summary.coveredLeafTargetsIncludingHelp} |
| Missing including help | ${summary.missingLeafTargetsIncludingHelp} |

## By Top-Level Command

| Command | Targets | Real Covered | Real Missing | Real Coverage | Covered Including Help | Missing Including Help |
|---------|---------|--------------|--------------|---------------|------------------------|------------------------|
${topLevelRows}

## Missing Real-Execution Targets

| Command | Source |
|---------|--------|
${missingRows}
`;
}

function printSummary(report, wroteJson, wroteMarkdown) {
  const summary = report.summary;
  console.log('CLI integration subcommand coverage');
  console.log('-----------------------------------');
  console.log(`Target leaf subcommands: ${summary.targetLeafCommands}`);
  console.log(
    `Real execution covered: ${summary.coveredRealExecutionLeafTargets}/${summary.targetLeafCommands} (${formatPercent(
      summary.realExecutionCoveragePercent
    )})`
  );
  console.log(`Missing real execution coverage: ${summary.missingRealExecutionLeafTargets}`);
  console.log(
    `Including help references: ${summary.coveredLeafTargetsIncludingHelp}/${summary.targetLeafCommands} (${formatPercent(
      summary.includingHelpCoveragePercent
    )})`
  );
  console.log(`${wroteJson ? 'Generated' : 'Skipped'} ${toPosix(relative(repoRoot, reportJsonPath))}${wroteJson ? '' : ' (unchanged)'}`);
  console.log(
    `${wroteMarkdown ? 'Generated' : 'Skipped'} ${toPosix(relative(repoRoot, reportMarkdownPath))}${
      wroteMarkdown ? '' : ' (unchanged)'
    }`
  );

  if (summary.missingRealExecutionLeafTargets > 0) {
    console.log('First missing targets:');
    for (const target of report.missingRealExecutionTargets.slice(0, 10)) {
      console.log(`- ${target.command}`);
    }
  }
}

function lineNumberAt(source, index) {
  return source.slice(0, index).split('\n').length;
}

function percent(numerator, denominator) {
  if (!denominator) return 100;
  return Number(((numerator / denominator) * 100).toFixed(2));
}

function formatPercent(value) {
  return `${value.toFixed(2)}%`;
}

function escapeTableCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|');
}

function toPosix(pathValue) {
  return pathValue.split('\\').join('/');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
