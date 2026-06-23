#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const skillPath = 'skills/polyv-live-cli/SKILL.md';
const readmePath = 'README.md';
const npxPackage = 'polyv-live-cli@latest';
const cliMode = process.env.POLYV_SKILL_CHECK_CLI || 'local';
const localCliEntry = resolve(repoRoot, 'packages/cli/dist/index.js');
const cliLabel = cliMode === 'local' ? 'local packages/cli/dist/index.js' : `npx --yes ${npxPackage}`;

const failures = [];
const passes = [];

function fail(message) {
  failures.push(message);
}

function pass(message) {
  passes.push(message);
}

function readText(relativePath) {
  return readFileSync(resolve(repoRoot, relativePath), 'utf8');
}

function runCli(args) {
  if (cliMode === 'local') {
    if (!existsSync(localCliEntry)) {
      throw new Error(`Local CLI entry does not exist: ${localCliEntry}. Run pnpm --filter polyv-live-cli build first.`);
    }

    try {
      return execFileSync('node', [localCliEntry, ...args], {
        cwd: repoRoot,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
        timeout: 60_000
      });
    } catch (error) {
      const stderr = error.stderr ? `\n${String(error.stderr).trim()}` : '';
      throw new Error(`node ${localCliEntry} ${args.join(' ')} failed${stderr}`);
    }
  }

  try {
    return execFileSync('npx', ['--yes', npxPackage, ...args], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 60_000
    });
  } catch (error) {
    const stderr = error.stderr ? `\n${String(error.stderr).trim()}` : '';
    throw new Error(`npx --yes ${npxPackage} ${args.join(' ')} failed${stderr}`);
  }
}

function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return {};

  return Object.fromEntries(
    match[1]
      .split('\n')
      .map((line) => line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/))
      .filter(Boolean)
      .map((matchLine) => [matchLine[1], matchLine[2].trim()])
  );
}

function parseTopLevelCommands(helpOutput) {
  const commandsBlock = helpOutput.match(/\nCommands:\n([\s\S]*?)(?:\n\n[A-Z][^\n]*:|\nQuick Start:|$)/);
  if (!commandsBlock) {
    fail(`Unable to parse the Commands block from ${cliLabel} --help output.`);
    return new Set();
  }

  const commands = new Set();
  for (const line of commandsBlock[1].split('\n')) {
    const match = line.match(/^ {2}([a-z][a-z0-9-]*)(?:\s|\[|$)/);
    if (match && match[1] !== 'help') commands.add(match[1]);
  }

  return commands;
}

function extractCliCommandTokens(markdown) {
  const tokens = new Set();
  const commandRegex = /npx\s+--yes\s+polyv-live-cli@latest\s+([^\s`]+)/g;

  for (const match of markdown.matchAll(commandRegex)) {
    const token = match[1];
    if (token.startsWith('-')) continue;
    if (token.startsWith('<')) continue;
    if (token === '...') continue;
    tokens.add(token);
  }

  return tokens;
}

function extractCodeBlocks(markdown) {
  const codeBlocks = [];
  const codeBlockRegex = /```[^\n]*\n([\s\S]*?)```/g;

  for (const match of markdown.matchAll(codeBlockRegex)) {
    codeBlocks.push(match[1]);
  }

  return codeBlocks;
}

function assertNoBadExecutableExamples(markdown) {
  const code = extractCodeBlocks(markdown).join('\n');
  const badPatterns = [
    {
      pattern: /npx\s+--yes\s+polyv-live-cli@latest\s+transmit\s+[^\n]*\s-c(?:\s|$)/,
      message: 'transmit executable examples must use --channelId, not -c.'
    },
    {
      pattern: /npx\s+--yes\s+polyv-live-cli@latest\s+card-push\s+[^\n]*--(?:image-type|show-condition|card-push-id)(?:\s|$)/,
      message: 'card-push executable examples must use camelCase option names.'
    },
    {
      pattern: /npx\s+--yes\s+polyv-live-cli@latest\s+watch-condition\s+set\s+[^\n]*--configFile(?:\s|$)/,
      message: 'watch-condition set executable examples must use --config-file.'
    },
    {
      pattern: /npx\s+--yes\s+polyv-live-cli@latest\s+product\s+get(?:\s|$)/,
      message: 'product executable examples must not use removed product get syntax.'
    },
    {
      pattern: /npx\s+--yes\s+polyv-live-cli@latest\s+coupon\s+(?:create|get)(?:\s|$)/,
      message: 'coupon executable examples must use current coupon subcommands.'
    },
    {
      pattern: /npx\s+--yes\s+polyv-live-cli@latest\s+coupon\s+[^\n]*\s-c(?:\s|$)/,
      message: 'coupon executable examples must not pass channel -c.'
    },
    {
      pattern: /npx\s+--yes\s+polyv-live-cli@latest\s+statistics\s+export\s+-c(?:\s|$)/,
      message: 'statistics export examples must include the export subcommand, such as viewlog or session.'
    },
    {
      pattern: /npx\s+--yes\s+polyv-live-cli@latest\s+monitor\s+(?:start|stop)(?:\s|$)/,
      message: 'monitor executable examples must not invent start or stop subcommands.'
    },
    {
      pattern: /npx\s+--yes\s+polyv-live-cli@latest\s+setup\s+(?:education|webinar|marketing|event|custom)(?:\s|$)/,
      message: 'setup executable examples must not invent scene names not listed by current help.'
    }
  ];

  for (const { pattern, message } of badPatterns) {
    if (pattern.test(code)) fail(message);
  }

  if (!failures.some((message) => message.includes('executable examples'))) {
    pass('Known stale CLI examples are absent from executable skill snippets.');
  }
}

function assertReferencedFilesExist(markdown) {
  const referenceFiles = new Set(
    [...markdown.matchAll(/`([^`]+\.md)`/g)]
      .map((match) => match[1])
      .filter((file) => !file.includes('/'))
  );

  for (const file of referenceFiles) {
    const relativePath = `skills/polyv-live-cli/references/${file}`;
    if (!existsSync(resolve(repoRoot, relativePath))) {
      fail(`Skill references ${file}, but ${relativePath} does not exist.`);
    }
  }

  if (referenceFiles.size > 0) {
    pass(`Skill reference routes point to existing files (${referenceFiles.size} files).`);
  }
}

const skill = readText(skillPath);
const readme = readText(readmePath);
const frontmatter = parseFrontmatter(skill);

if (frontmatter.name === 'polyv-live-cli') {
  pass('Skill frontmatter name is polyv-live-cli.');
} else {
  fail(`Skill frontmatter name must be polyv-live-cli, got ${frontmatter.name || '(missing)'}.`);
}

if (frontmatter.description) {
  pass('Skill frontmatter description is present.');
} else {
  fail('Skill frontmatter description is missing.');
}

if (frontmatter['allowed-tools'] === 'Bash(npx --yes polyv-live-cli@latest:*)') {
  pass('Skill allowed-tools is restricted to the npm latest CLI command.');
} else {
  fail(`Skill allowed-tools must be Bash(npx --yes polyv-live-cli@latest:*), got ${frontmatter['allowed-tools'] || '(missing)'}.`);
}

if (readme.includes('npx skills add polyv/polyv-live-cli')) {
  pass('README keeps the recommended GitHub skill install command.');
} else {
  fail('README must contain the recommended install command: npx skills add polyv/polyv-live-cli.');
}

for (const [label, content] of [
  [readmePath, readme],
  [skillPath, skill]
]) {
  if (content.includes('terryso/polyv-live-cli')) {
    fail(`${label} still references the old private repository terryso/polyv-live-cli.`);
  }
}

const version = runCli(['--version']).trim();
if (version) {
  pass(`Resolved ${cliLabel} version ${version}.`);
} else {
  fail(`${cliLabel} --version returned an empty version.`);
}

const help = runCli(['--help']);
const topLevelCommands = parseTopLevelCommands(help);
if (topLevelCommands.size > 0) {
  pass(`Parsed ${topLevelCommands.size} top-level commands from ${cliLabel} --help.`);
}

const requiredCommands = [
  'account',
  'ai',
  'card-push',
  'channel',
  'chat',
  'checkin',
  'coupon',
  'custom-field',
  'document',
  'donate',
  'finance',
  'global',
  'group',
  'interaction',
  'invite-sales',
  'lottery',
  'material',
  'monitor',
  'partner',
  'platform',
  'playback',
  'player',
  'product',
  'promotion',
  'qa',
  'questionnaire',
  'record',
  'robot',
  'session',
  'setup',
  'statistics',
  'stream',
  'transmit',
  'use',
  'user',
  'viewer',
  'watch-condition',
  'web',
  'webapp',
  'whitelist'
];

for (const command of requiredCommands) {
  if (!topLevelCommands.has(command)) {
    fail(`${cliLabel} --help does not list required command: ${command}.`);
  }
}

const usedCommands = extractCliCommandTokens(skill);
for (const command of usedCommands) {
  if (!topLevelCommands.has(command)) {
    fail(`Skill uses top-level command "${command}", but latest --help does not list it.`);
  }
}

if (usedCommands.size > 0) {
  pass(`Skill executable examples use published top-level commands (${[...usedCommands].sort().join(', ')}).`);
}

assertNoBadExecutableExamples(skill);
assertReferencedFilesExist(skill);

for (const message of passes) {
  console.log(`PASS ${message}`);
}

if (failures.length > 0) {
  console.error('\nSkill regression check failed:');
  for (const message of failures) {
    console.error(`- ${message}`);
  }
  process.exit(1);
}

console.log('\nSkill regression check passed.');
