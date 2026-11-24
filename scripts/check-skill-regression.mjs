#!/usr/bin/env node
/**
 * Checks that each Agent skill matches the CLI it documents.
 *
 * One run checks every entry of SKILLS. Each entry names the skill, the npm package its
 * commands run, and the CLI package in this repository whose build stands in for that package.
 *
 * For every skill it checks that
 * - the frontmatter name, description and allowed-tools are the expected ones,
 * - the CLI answers --version and lists its top-level commands,
 * - every command the skill's code blocks invoke exists in the CLI (resolved through the
 *   skill's <CLI> prefix or spelled out with npx),
 * - the reference files the skill routes to exist,
 * - none of the skill's known stale examples is back,
 * - the README keeps the skill install command.
 *
 * Set POLYV_SKILL_CHECK_CLI=latest to check the published npm packages instead of the local
 * builds. Set POLYV_SKILL_CHECK_ONLY=<skill name> to check a single skill.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cliMode = process.env.POLYV_SKILL_CHECK_CLI || 'local';
const only = process.env.POLYV_SKILL_CHECK_ONLY || '';

/**
 * @typedef {object} SkillSpec
 * @property {string} name        Skill directory and frontmatter name
 * @property {string} npmPackage  Package the skill runs, with tag
 * @property {string} cliPackage  Workspace package that provides the CLI
 * @property {string[]} commands  Top-level commands the CLI must list
 * @property {string[]} [undocumentedCommands] Commands the skill is known not to show yet
 * @property {{pattern: RegExp, message: string}[]} staleExamples  Examples that must not come back
 */

/** @type {SkillSpec[]} */
const SKILLS = [
  {
    name: 'polyv-live-cli',
    npmPackage: 'polyv-live-cli@latest',
    cliPackage: 'polyv-live-cli',
    // Existing gap in the live skill, reported but not blocking: `auth` (connector login) and
    // `use` (switch account) have no example anywhere in it.
    undocumentedCommands: ['auth', 'use'],
    commands: [
      'account', 'ai', 'auth', 'card-push', 'channel', 'chat', 'checkin', 'coupon', 'custom-field', 'document', 'donate',
      'finance', 'global', 'group', 'interaction', 'invite-sales', 'lottery', 'material', 'monitor', 'partner', 'platform',
      'playback', 'player', 'product', 'promotion', 'qa', 'questionnaire', 'record', 'robot', 'session', 'setup',
      'statistics', 'stream', 'transmit', 'use', 'user', 'viewer', 'watch-condition', 'web', 'webapp', 'whitelist'
    ],
    staleExamples: [
      {
        pattern: /transmit\s+[^\n]*\s-c(?:\s|$)/,
        message: 'transmit executable examples must use --channelId, not -c.'
      },
      {
        pattern: /card-push\s+[^\n]*--(?:image-type|show-condition|card-push-id)(?:\s|$)/,
        message: 'card-push executable examples must use camelCase option names.'
      },
      {
        pattern: /watch-condition\s+set\s+[^\n]*--configFile(?:\s|$)/,
        message: 'watch-condition set executable examples must use --config-file.'
      },
      {
        pattern: /product\s+get(?:\s|$)/,
        message: 'product executable examples must not use removed product get syntax.'
      },
      {
        pattern: /coupon\s+(?:create|get)(?:\s|$)/,
        message: 'coupon executable examples must use current coupon subcommands.'
      },
      {
        // `coupon add` and `coupon list` take no channel; `coupon channel ...` does take `-c`.
        pattern: /coupon\s+(?!channel(?:\s|$))[^\n]*\s-c(?:\s|$)/,
        message: 'coupon executable examples must not pass channel -c.'
      },
      {
        pattern: /statistics\s+export\s+-c(?:\s|$)/,
        message: 'statistics export examples must include the export subcommand, such as viewlog or session.'
      },
      {
        pattern: /monitor\s+(?:start|stop)(?:\s|$)/,
        message: 'monitor executable examples must not invent start or stop subcommands.'
      },
      {
        pattern: /setup\s+(?:education|webinar|marketing|event|custom)(?:\s|$)/,
        message: 'setup executable examples must not invent scene names not listed by current help.'
      }
    ]
  },
  {
    name: 'polyv-vod-cli',
    npmPackage: 'polyv-vod-cli@latest',
    cliPackage: 'polyv-vod-cli',
    commands: ['account', 'auth', 'callback', 'category', 'play', 'stats', 'upload', 'use', 'video'],
    staleExamples: []
  }
];

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

/** Runs the CLI of a skill: the local build, or the published package. */
function makeRunner(spec) {
  if (cliMode === 'latest') {
    const label = `npx --yes ${spec.npmPackage}`;
    return {
      label,
      run: (args) => {
        try {
          return execFileSync('npx', ['--yes', spec.npmPackage, ...args], {
            cwd: repoRoot,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'pipe'],
            timeout: 120_000
          });
        } catch (error) {
          const stderr = error.stderr ? `\n${String(error.stderr).trim()}` : '';
          throw new Error(`${label} ${args.join(' ')} failed${stderr}`);
        }
      }
    };
  }
  const entry = resolve(repoRoot, 'packages', packageDir(spec.cliPackage), 'dist', 'index.js');
  const label = `local packages/${packageDir(spec.cliPackage)}/dist/index.js`;
  return {
    label,
    run: (args) => {
      if (!existsSync(entry)) {
        throw new Error(`Local CLI entry does not exist: ${entry}. Run pnpm --filter ${spec.cliPackage} build first.`);
      }
      try {
        return execFileSync('node', [entry, ...args], {
          cwd: repoRoot,
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'pipe'],
          timeout: 60_000
        });
      } catch (error) {
        const stderr = error.stderr ? `\n${String(error.stderr).trim()}` : '';
        throw new Error(`${label} ${args.join(' ')} failed${stderr}`);
      }
    }
  };
}

/** Directory of a workspace package under packages/. */
function packageDir(cliPackage) {
  for (const entry of readdirSync(resolve(repoRoot, 'packages'), { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const manifest = resolve(repoRoot, 'packages', entry.name, 'package.json');
    if (existsSync(manifest) && JSON.parse(readFileSync(manifest, 'utf8')).name === cliPackage) return entry.name;
  }
  throw new Error(`No workspace package named ${cliPackage}`);
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
  const commandsBlock = helpOutput.match(/\nCommands:\n([\s\S]*?)(?:\n\n[A-Z][^\n]*:|\nQuick Start:|\nCredentials|$)/);
  if (!commandsBlock) {
    return new Set();
  }

  const commands = new Set();
  for (const line of commandsBlock[1].split('\n')) {
    const match = line.match(/^ {2}([a-z][a-z0-9-]*)(?:\s|\[|$)/);
    if (match && match[1] !== 'help') commands.add(match[1]);
  }

  return commands;
}

/** Fenced code blocks of a markdown document. */
function extractCodeBlocks(markdown) {
  const codeBlocks = [];
  for (const match of markdown.matchAll(/```[^\n]*\n([\s\S]*?)```/g)) {
    codeBlocks.push(match[1]);
  }
  return codeBlocks;
}

/**
 * CLI invocations in code blocks, each as the arguments that follow the CLI, with line
 * continuations joined. A skill runs its CLI either through a `<CLI>` prefix or spelled out as
 * `npx --yes <package>`.
 */
export function extractInvocations(markdown, npmPackage) {
  const spelledOut = `npx --yes ${npmPackage}`;
  const pattern = new RegExp(`^(?:<CLI>|${spelledOut.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})[ \\t]+([^\\n]*(?:\\\\\\n[^\\n]*)*)`, 'gm');
  const invocations = [];
  for (const match of markdown.matchAll(pattern)) {
    invocations.push(match[1].replace(/\\\n/g, ' ').trim());
  }
  return invocations;
}

/** First word of an invocation when it is a command rather than a flag or a placeholder. */
function commandOf(invocation) {
  const token = invocation.split(/\s+/)[0] ?? '';
  if (!token || token.startsWith('-') || token.startsWith('<') || token.startsWith('$')) return null;
  return token;
}

/** Every markdown file of a skill: its SKILL.md and its references. */
function skillMarkdownFiles(spec) {
  const skillDir = resolve(repoRoot, 'skills', spec.name);
  const files = [join(skillDir, 'SKILL.md')];
  const references = join(skillDir, 'references');
  if (existsSync(references)) {
    for (const entry of readdirSync(references, { withFileTypes: true })) {
      if (entry.isFile() && entry.name.endsWith('.md')) files.push(join(references, entry.name));
    }
  }
  return files;
}

function checkSkill(spec) {
  const skillPath = `skills/${spec.name}/SKILL.md`;
  const referencesDir = `skills/${spec.name}/references`;
  if (!existsSync(resolve(repoRoot, skillPath))) {
    fail(`${spec.name}: ${skillPath} does not exist.`);
    return;
  }
  const cli = makeRunner(spec);
  const skill = readText(skillPath);
  const readme = readText('README.md');
  const frontmatter = parseFrontmatter(skill);

  if (frontmatter.name === spec.name) {
    pass(`${spec.name}: frontmatter name is ${spec.name}.`);
  } else {
    fail(`${spec.name}: frontmatter name must be ${spec.name}, got ${frontmatter.name || '(missing)'}.`);
  }

  if (frontmatter.description) {
    pass(`${spec.name}: frontmatter description is present.`);
  } else {
    fail(`${spec.name}: frontmatter description is missing.`);
  }

  const allowedTools = `Bash(npx --yes ${spec.npmPackage}:*)`;
  if (frontmatter['allowed-tools'] === allowedTools) {
    pass(`${spec.name}: allowed-tools is restricted to the npm latest CLI command.`);
  } else {
    fail(`${spec.name}: allowed-tools must be ${allowedTools}, got ${frontmatter['allowed-tools'] || '(missing)'}.`);
  }

  // The repository hosts several skills, so an install command for one of them names it with
  // `--skill`. (`npx skills add polyv/polyv-live-cli` alone installs every skill in the repo.)
  const installRepository = 'npx skills add polyv/polyv-live-cli';
  const installCommands = [`${installRepository} --skill ${spec.name}`, `${installRepository} --skill=${spec.name}`];
  if (installCommands.some((command) => readme.includes(command))) {
    pass(`${spec.name}: README has an install command that selects this skill.`);
  } else {
    fail(`${spec.name}: README must contain an install command for this skill: ${installCommands[0]}.`);
  }

  for (const [label, content] of [
    ['README.md', readme],
    [skillPath, skill]
  ]) {
    if (content.includes('terryso/polyv-live-cli')) {
      fail(`${label} still references the old private repository terryso/polyv-live-cli.`);
    }
  }

  const skillFiles = skillMarkdownFiles(spec);
  const markdown = skillFiles.map((file) => readText(file)).join('\n');
  const code = skillFiles.flatMap((file) => extractCodeBlocks(readText(file))).join('\n');
  const invocations = skillFiles.flatMap((file) =>
    extractCodeBlocks(readText(file)).flatMap((block) => extractInvocations(block, spec.npmPackage))
  );
  const usedCommands = new Set(invocations.map(commandOf).filter(Boolean));

  let version = '';
  try {
    version = cli.run(['--version']).trim();
  } catch (error) {
    fail(`${spec.name}: ${error.message}`);
  }
  if (version) {
    pass(`${spec.name}: resolved ${cli.label} version ${version}.`);
  } else {
    fail(`${spec.name}: ${cli.label} --version returned an empty version.`);
  }

  let topLevelCommands = new Set();
  try {
    topLevelCommands = parseTopLevelCommands(cli.run(['--help']));
  } catch (error) {
    fail(`${spec.name}: ${error.message}`);
  }
  if (topLevelCommands.size > 0) {
    pass(`${spec.name}: parsed ${topLevelCommands.size} top-level commands from ${cli.label} --help.`);
  } else if (failures.length === 0) {
    fail(`${spec.name}: unable to parse the Commands block from ${cli.label} --help output.`);
  }

  for (const command of spec.commands) {
    if (!topLevelCommands.has(command)) {
      fail(`${spec.name}: ${cli.label} --help does not list required command: ${command}.`);
    }
  }

  // Only the top-level command name of each invocation is checked; whether a subcommand or an
  // option exists is left to the reader following the skill's own advice to run `--help`.
  const existing = [...usedCommands].filter((command) => topLevelCommands.has(command)).sort();
  const unknown = [...usedCommands].filter((command) => !topLevelCommands.has(command)).sort();
  for (const command of unknown) {
    fail(`${spec.name}: the skill invokes top-level command "${command}", but ${cli.label} --help does not list it.`);
  }
  if (usedCommands.size > 0) {
    // Commands the CLI lists that the skill never shows. Reported as a failure unless the skill
    // is known to have such a gap (see `undocumentedCommands`), so the gap stays visible
    // without blocking the check on a decision about the skill's content.
    const missing = spec.commands.filter((command) => !usedCommands.has(command) && !spec.undocumentedCommands?.includes(command));
    const known = spec.commands.filter((command) => !usedCommands.has(command) && spec.undocumentedCommands?.includes(command));
    pass(`${spec.name}: the skill invokes ${existing.length} existing top-level commands (${existing.join(', ')}).`);
    if (missing.length > 0) {
      fail(`${spec.name}: the CLI lists commands the skill never invokes: ${missing.join(', ')}.`);
    }
    if (known.length > 0) {
      console.log(`NOTE ${spec.name}: the CLI lists commands the skill does not document yet (known gap): ${known.join(', ')}.`);
    }
  } else {
    fail(`${spec.name}: found no CLI invocation in the skill's code blocks.`);
  }

  for (const { pattern, message } of spec.staleExamples) {
    if (pattern.test(code)) fail(`${spec.name}: ${message}`);
  }
  if (!failures.some((message) => message.startsWith(`${spec.name}: `) && message.includes('executable examples'))) {
    pass(`${spec.name}: known stale CLI examples are absent from executable skill snippets.`);
  }

  const referenceFiles = new Set(
    [...skill.matchAll(/`([^`]+\.md)`/g)].map((match) => match[1]).filter((file) => !file.includes('/'))
  );
  for (const file of referenceFiles) {
    if (!existsSync(resolve(repoRoot, referencesDir, file))) {
      fail(`${spec.name}: the skill references ${file}, but ${referencesDir}/${file} does not exist.`);
    }
  }
  if (referenceFiles.size > 0) {
    pass(`${spec.name}: reference routes point to existing files (${referenceFiles.size} files).`);
  }

  // A reference that the skill never routes to cannot be found by an agent reading it.
  for (const file of skillFiles.slice(1)) {
    const name = file.slice(file.lastIndexOf('/') + 1);
    if (!referenceFiles.has(name)) {
      fail(`${spec.name}: ${referencesDir}/${name} exists but the skill never routes to it.`);
    }
  }
}

for (const spec of SKILLS) {
  if (only && spec.name !== only) continue;
  checkSkill(spec);
}

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
