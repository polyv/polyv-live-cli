/**
 * @fileoverview Load the real polyv-live-cli Commander tree from its dist build.
 *
 * Zero-intrusion approach (Story 1 / AD-5): we never import the CLI entry
 * (it installs process-level handlers); instead we
 *  1. read `dist/index.js` and extract the exact `registerXxx(program)` call
 *     order — this mirrors the tree the real binary builds (43 calls; the
 *     dead-code `registerConfigCommands` is never called there, and ordering
 *     matters: platform-label must run after platform),
 *  2. require every `dist/commands/*.commands.js` (+ `*.commands.export.js`)
 *     module and invoke only those register functions, in that order.
 *
 * The implicit global `--source <id>` lives on the program root (never on
 * subcommand option lists), so it can never leak into a tool inputSchema.
 * Two commands declare their own `--source` (`viewer list`,
 * `channel viewer unrelated-list`); at runtime the program-level option
 * consumes the flag first (verified against commander 11.1 parse behavior),
 * so those locals are shadowed and are excluded from inputSchema too, and
 * recorded in stats.sourceParamShadowed.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { Command } from 'commander';

/** Matches compiled `(0, xxx_commands_1.registerX)(program);` call sites. */
const REGISTER_CALL_RE = /(register\w+)\s*\)\s*\(\s*program\s*\)/g;

const COMMAND_MODULE_SUFFIXES = ['.commands.js', '.commands.export.js'];

export interface LoadedCliTree {
  program: Command;
  cliVersion: string;
  commanderVersion: string;
  registrationOrder: string[];
  /** Register functions exported by command modules but not wired into the CLI entry. */
  unusedRegisterFunctions: string[];
  /** Command paths (string[]) whose own --source option is shadowed by the global one. */
  sourceParamShadowed: string[][];
  warnings: string[];
}

export function resolveCliPackageDir(): string {
  const packageJsonPath = require.resolve('polyv-live-cli/package.json');
  return path.dirname(packageJsonPath);
}

export function cliDistDir(): string {
  return path.join(resolveCliPackageDir(), 'dist');
}

/**
 * commander v11 has an `exports` map that hides ./package.json from require —
 * resolve its entry file and climb up to the nearest package.json.
 */
function resolveCommanderPackageJson(): string {
  let dir = path.dirname(require.resolve('commander'));
  for (let depth = 0; depth < 5; depth += 1) {
    const candidate = path.join(dir, 'package.json');
    if (fs.existsSync(candidate)) {
      const parsed = JSON.parse(fs.readFileSync(candidate, 'utf8')) as { name?: string };
      if (parsed.name === 'commander') {
        return candidate;
      }
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      break;
    }
    dir = parent;
  }
  throw new Error('could not locate commander package.json');
}

function commandModuleFiles(distCommands: string): string[] {
  return fs
    .readdirSync(distCommands)
    .filter(file => COMMAND_MODULE_SUFFIXES.some(suffix => file.endsWith(suffix)))
    .sort();
}

function extractRegistrationOrder(distRoot: string): string[] {
  const indexSource = fs.readFileSync(path.join(distRoot, 'index.js'), 'utf8');
  const order: string[] = [];
  for (const match of indexSource.matchAll(REGISTER_CALL_RE)) {
    const name = match[1] ?? '';
    if (name && !order.includes(name)) {
      order.push(name);
    }
  }
  return order;
}

/** Run the CLI package build when dist command modules are missing. */
export function ensureCliBuilt(): boolean {
  const distCommands = path.join(cliDistDir(), 'commands');
  if (fs.existsSync(distCommands) && commandModuleFiles(distCommands).length > 0) {
    return false;
  }
  const repoRoot = path.resolve(resolveCliPackageDir(), '..', '..');
  execSync('pnpm --filter polyv-live-cli build', { cwd: repoRoot, stdio: 'inherit' });
  return true;
}

/**
 * Command names exempt from the implicit global --source requirement.
 * Imported from the CLI's own dist (single source of truth: src/utils/source-context.ts);
 * the fallback mirrors that module if the export is ever renamed.
 */
export function sourceExemptCommandNames(): Set<string> {
  try {
    const sourceContext = require(path.join(cliDistDir(), 'utils', 'source-context.js')) as {
      SOURCE_EXEMPT_COMMANDS?: unknown;
    };
    if (sourceContext.SOURCE_EXEMPT_COMMANDS instanceof Set) {
      return new Set([...sourceContext.SOURCE_EXEMPT_COMMANDS].map(String));
    }
  } catch {
    // fall through to the mirrored fallback below
  }
  return new Set(['auth', 'account', 'use', 'config']);
}

/**
 * Build the full Commander tree exactly as the CLI binary does.
 * Throws loudly when the dist build is stale or a register function is missing.
 */
export function loadCliTree(): LoadedCliTree {
  const distRoot = cliDistDir();
  const distCommands = path.join(distRoot, 'commands');
  if (!fs.existsSync(distCommands)) {
    throw new Error(`CLI dist not found at ${distCommands}; run "pnpm --filter polyv-live-cli build" first`);
  }

  const registrationOrder = extractRegistrationOrder(distRoot);
  if (registrationOrder.length === 0) {
    throw new Error('No register*(program) calls found in dist/index.js — CLI build layout changed?');
  }

  const registerFns = new Map<string, (program: Command) => void>();
  for (const file of commandModuleFiles(distCommands)) {
    const mod = require(path.join(distCommands, file)) as Record<string, unknown>;
    for (const key of Object.keys(mod)) {
      if (/^register/.test(key) && typeof mod[key] === 'function' && !registerFns.has(key)) {
        registerFns.set(key, mod[key] as (program: Command) => void);
      }
    }
  }

  const warnings: string[] = [];
  const missing = registrationOrder.filter(name => !registerFns.has(name));
  if (missing.length > 0) {
    throw new Error(`Register functions referenced by dist/index.js but not exported by command modules: ${missing.join(', ')}`);
  }
  const unusedRegisterFunctions = [...registerFns.keys()]
    .filter(name => !registrationOrder.includes(name))
    .sort();
  if (unusedRegisterFunctions.length > 0) {
    warnings.push(
      `register functions not wired into the CLI entry (dead code, excluded from the tree): ${unusedRegisterFunctions.join(', ')}`,
    );
  }

  const program = new Command();
  program.name('polyv-live-cli');
  for (const name of registrationOrder) {
    const fn = registerFns.get(name);
    if (fn) {
      fn(program);
    }
  }

  // Detect command-local --source options (shadowed at runtime by the global one).
  const sourceParamShadowed: string[][] = [];
  const walk = (command: Command, prefix: string[]): void => {
    const currentPath = prefix.concat(command.name());
    const hasLocalSource = (command.options ?? []).some(
      option => option.long === '--source',
    );
    if (hasLocalSource) {
      sourceParamShadowed.push(currentPath);
    }
    for (const child of command.commands ?? []) {
      walk(child, currentPath);
    }
  };
  for (const top of program.commands ?? []) {
    walk(top, []);
  }

  const cliPackageJson = require(path.join(resolveCliPackageDir(), 'package.json')) as { version?: string };
  const commanderPackageJson = JSON.parse(
    fs.readFileSync(resolveCommanderPackageJson(), 'utf8'),
  ) as { version?: string };

  return {
    program,
    cliVersion: cliPackageJson.version ?? 'unknown',
    commanderVersion: commanderPackageJson.version ?? 'unknown',
    registrationOrder,
    unusedRegisterFunctions,
    sourceParamShadowed,
    warnings,
  };
}

export interface TreeStats {
  topLevelCommands: number;
  treeNodes: number;
  leafTools: number;
  maxDepth: number;
}

/** Leaf = a node without subcommands. Stats cover the whole tree (all nodes have descriptions). */
export function collectTreeStats(program: Command): TreeStats {
  let treeNodes = 0;
  let leafTools = 0;
  let maxDepth = 0;
  const walk = (command: Command, depth: number): void => {
    treeNodes += 1;
    const children = command.commands ?? [];
    if (children.length === 0) {
      leafTools += 1;
      maxDepth = Math.max(maxDepth, depth);
    } else {
      for (const child of children) {
        walk(child, depth + 1);
      }
    }
  };
  for (const top of program.commands ?? []) {
    walk(top, 1);
  }
  return { topLevelCommands: (program.commands ?? []).length, treeNodes, leafTools, maxDepth };
}

/** All leaf commands with their full command paths, deterministically ordered. */
export function collectLeaves(program: Command): { command: Command; commandPath: string[] }[] {
  const leaves: { command: Command; commandPath: string[] }[] = [];
  const walk = (command: Command, prefix: string[]): void => {
    const currentPath = prefix.concat(command.name());
    const children = command.commands ?? [];
    if (children.length === 0) {
      leaves.push({ command, commandPath: currentPath });
    } else {
      for (const child of children) {
        walk(child, currentPath);
      }
    }
  };
  for (const top of program.commands ?? []) {
    walk(top, []);
  }
  leaves.sort((a, b) => a.commandPath.join('\u0000').localeCompare(b.commandPath.join('\u0000')));
  return leaves;
}
