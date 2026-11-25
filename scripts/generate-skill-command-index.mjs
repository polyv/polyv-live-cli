#!/usr/bin/env node
/**
 * Generates `skills/<name>/references/command-index.md` from the CLI's command tree.
 *
 * It loads the CLI's compiled `buildProgram()` and walks the Commander tree, so the index
 * carries the very descriptions, options and required flags the CLI runs with — nothing is
 * parsed from help text. Re-run it (and commit the result) whenever the CLI's commands or
 * options change.
 *
 * Usage: node scripts/generate-skill-command-index.mjs [skill-name ...]
 *        (no argument: every skill in SKILLS)
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);

/** Skills whose command index this script maintains: skill name -> CLI workspace package. */
const SKILLS = {
  'polyv-vod-cli': 'polyv-vod-cli'
};

/** Options that every command has and that the skill explains once, in its global section. */
const GLOBAL_OPTION_FLAGS = new Set(['-h, --help', '--source <id>', '--verbose', '-v, --version']);

function packageDir(cliPackage) {
  for (const entry of readdirSync(resolve(repoRoot, 'packages'), { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const manifest = resolve(repoRoot, 'packages', entry.name, 'package.json');
    if (existsSync(manifest) && JSON.parse(readFileSync(manifest, 'utf8')).name === cliPackage) return entry.name;
  }
  throw new Error(`No workspace package named ${cliPackage}`);
}

/** Loads the CLI's Commander tree from its build, without running the process entry point. */
function loadProgram(cliPackage) {
  const dir = packageDir(cliPackage);
  const programModule = resolve(repoRoot, 'packages', dir, 'dist', 'program.js');
  if (!existsSync(programModule)) {
    throw new Error(`CLI build not found: ${programModule}. Run pnpm --filter ${cliPackage} build first.`);
  }
  const { buildProgram } = require(programModule);
  return { program: buildProgram(), version: JSON.parse(readFileSync(resolve(repoRoot, 'packages', dir, 'package.json'), 'utf8')).version };
}

const flagsOf = (option) => [option.short, option.long].filter(Boolean).join(', ');
// Commander's `Argument.name()` is a method while `required` and `variadic` are properties. On
// `Option`, `required` only means the option takes a value; "must be given" is `mandatory`.
const argOf = (argument) => {
  const name = argument.variadic ? `${argument.name()}...` : argument.name();
  return argument.required ? `<${name}>` : `[${name}]`;
};
const escapeCell = (text) => String(text).replace(/\|/g, '\\|').replace(/\n/g, ' ').trim();

/** `Usage: name group sub [options] [args]`, as Commander itself prints it. */
function usageOf(program, command) {
  const path = [];
  for (let current = command; current && current !== program; current = current.parent) path.unshift(current.name());
  const parts = [program.name(), ...path];
  if (command.options.some((option) => !GLOBAL_OPTION_FLAGS.has(flagsOf(option)))) parts.push('[options]');
  for (const argument of command.registeredArguments) parts.push(argOf(argument));
  return `Usage: ${parts.join(' ')}`;
}

function optionRows(command) {
  return command.options
    .filter((option) => !GLOBAL_OPTION_FLAGS.has(flagsOf(option)))
    .map((option) => {
      const required = option.mandatory ? ' **（必填）**' : '';
      const defaultValue = option.defaultValue !== undefined ? `（默认：\`${option.defaultValue}\`）` : '';
      return `| \`${flagsOf(option)}\` | ${escapeCell(option.description)}${required}${defaultValue} |`;
    });
}

function section(program, command) {
  const lines = [`${usageOf(program, command)}`, ''];
  const rows = optionRows(command);
  if (rows.length > 0) lines.push('| 选项 | 说明 |', '|---|---|', ...rows, '');
  else lines.push('_没有专属选项。_', '');
  return lines.join('\n');
}

function generate(skillName) {
  const cliPackage = SKILLS[skillName];
  if (!cliPackage) throw new Error(`Unknown skill "${skillName}"; known: ${Object.keys(SKILLS).join(', ')}`);
  const { program, version } = loadProgram(cliPackage);

  const lines = [
    '# 命令索引',
    '',
    `由 \`${cliPackage}@${version}\` 的命令树生成，不要手工编辑。命令或参数变动后运行 \`node scripts/generate-skill-command-index.mjs ${skillName}\` 重新生成。`,
    '',
    `本文档和其它 reference 中的 \`<CLI>\` 表示 \`npx --yes ${cliPackage}@latest\`。标 **（必填）** 的选项不给时命令不执行。`,
    '',
    '## 全局选项',
    '',
    '这些选项可以放在任何命令上。',
    '',
    '| 选项 | 说明 |',
    '|---|---|',
    ...program.options
      .filter((option) => option.long !== '--help' && option.long !== '--version')
      .map((option) => `| \`${flagsOf(option)}\` | ${escapeCell(option.description)} |`),
    ''
  ];

  let subcommandCount = 0;
  for (const group of program.commands) {
    lines.push(`## ${group.name()}`, '', group.description(), '');
    const subs = group.commands.filter((sub) => sub.name() !== 'help');
    if (subs.length === 0) {
      lines.push(section(program, group), '');
      continue;
    }
    for (const sub of subs) {
      subcommandCount += 1;
      lines.push(`### ${group.name()} ${sub.name()}`, '', sub.description(), '', section(program, sub), '');
    }
  }

  const commandCount = program.commands.filter((command) => command.name() !== 'help').length;
  lines.push(`共 ${commandCount} 个一级命令、${subcommandCount} 个子命令。`, '', '<!-- generated by scripts/generate-skill-command-index.mjs -->', '');

  const target = resolve(repoRoot, 'skills', skillName, 'references', 'command-index.md');
  writeFileSync(target, lines.join('\n'));
  console.log(`[command-index] wrote ${target.replace(`${repoRoot}/`, '')} (${commandCount} commands, ${subcommandCount} subcommands, from ${cliPackage} ${version})`);
}

for (const name of process.argv.slice(2).length > 0 ? process.argv.slice(2) : Object.keys(SKILLS)) {
  generate(name);
}
