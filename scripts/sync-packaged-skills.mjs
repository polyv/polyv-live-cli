#!/usr/bin/env node
/**
 * Builds the packaged copies of a skill from the canonical one under skills/.
 *
 * Two packages embed each skill, and they run the CLI differently:
 *
 * - experts/<name>-ops/skills/<skill>/ : a byte-for-byte copy. The expert runs the CLI through
 *   npx, like the canonical skill.
 * - connectors/<connector>/skills/<skill>/ : a fork. The connector installs the CLI globally, so
 *   every command runs as `<bin> ...` instead of `npx --yes <pkg>@latest`, the skill is known by
 *   the connector's name, and it gains a "连接与认证" section.
 *
 * Generating the forks (instead of syncing them by hand) keeps the references consistent with
 * SKILL.md: a hand-synced connector copy once kept the npx prefix in command-index.md while its
 * SKILL.md told the agent never to use npx.
 *
 * Usage: node scripts/sync-packaged-skills.mjs [--check]
 *        --check  exit 1 if any packaged copy differs from what would be generated; write nothing
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const checkOnly = process.argv.includes('--check');

/** How each packaged copy of a skill is produced. */
const TARGETS = [
  {
    id: 'expert copy',
    skill: 'polyv-live-cli',
    directory: 'experts/polyv-live-ops/skills/polyv-live-cli',
    transform: null
  },
  {
    id: 'expert copy',
    skill: 'polyv-vod-cli',
    directory: 'experts/polyv-vod-ops/skills/polyv-vod-cli',
    transform: null
  },
  {
    id: 'connector copy',
    skill: 'polyv-live-cli',
    directory: 'connectors/polyv-live/skills/polyv-live',
    // Kept as the hand-written fork it has always been; listed so that --check reports drift.
    transform: null,
    handWritten: true
  },
  {
    id: 'connector copy',
    skill: 'polyv-vod-cli',
    directory: 'connectors/polyv-vod/skills/polyv-vod',
    transform: connectorTransform({
      name: 'polyv-vod',
      bin: 'polyv-vod-cli',
      npmPackage: 'polyv-vod-cli',
      keyGuide: 'https://help.polyv.net/#/vod/api/getSecretKey',
      connect: [
        '- 首次连接：执行 `polyv-vod-cli auth`，浏览器会打开官方「获取密钥」指引页（https://help.polyv.net/#/vod/api/getSecretKey ）；按页面指引取得 userId / secretKey / writeToken 后，执行 `polyv-vod-cli account add workbuddy --user-id <userId> --secret-key <secretKey> --write-token <writeToken> --default` 完成配置（用户在对话中直接提供凭证时，由你代为执行此命令）。',
        '- 状态检查：`polyv-vod-cli auth status`，输出 `Logged in` 表示凭证可用；`Not logged in` 表示未配置。',
        '- 安全约定：不要在回答、示例或日志中回显用户的 secretKey、writeToken；签名与凭证管理由 CLI 负责。',
        '- 认证失效（签名错误/凭证缺失）：先运行 `polyv-vod-cli auth status` 与 `account current` 诊断，必要时引导用户重新执行 `account add`。',
        '- 点播凭证与直播凭证是两套：直播连接器配置过的 appId / appSecret 不能用于点播，需要单独配置 userId / secretKey / writeToken。'
      ]
    })
  }
];

/**
 * The changes that turn the canonical skill into a connector's copy.
 *
 * @param {object} options
 * @param {string} options.name       Skill name inside the connector
 * @param {string} options.bin        Command the connector installed
 * @param {string} options.npmPackage Package the canonical skill runs through npx
 * @param {string[]} options.connect  Lines of the "连接与认证" section
 */
function connectorTransform({ name, bin, npmPackage, keyGuide, connect }) {
  const npx = `npx --yes ${npmPackage}@latest`;
  return (text, file) => {
    let next = text;
    const replaceOnce = (from, to) => {
      const count = next.split(from).length - 1;
      if (count !== 1) throw new Error(`${file}: expected exactly one ${JSON.stringify(from.slice(0, 60))}, found ${count}`);
      next = next.replace(from, () => to);
    };

    if (file === 'SKILL.md') {
      replaceOnce(`name: ${npmPackage}\n`, `name: ${name}\n`);
      replaceOnce(`allowed-tools: Bash(${npx}:*)`, `allowed-tools: Bash(${bin}:*)`);
      replaceOnce('以 npm 发布版 CLI 为准。', '以已安装的发布版 CLI 为准。');
      replaceOnce('只要能访问 npm，就先用发布版 `--help` 校验。', '先用 `--help` 校验。');
      replaceOnce('通过 npm 发布版 polyv-vod-cli 管理', '通过 polyv-vod-cli 管理');
      replaceOnce('via the npm-published polyv-vod-cli', 'via the polyv-vod-cli');
      // The connector section sits right before the CLI prefix definition.
      replaceOnce('## CLI 前缀\n', `## 连接与认证\n\n${connect.join('\n')}\n\n## CLI 前缀\n`);
      // The code block that defines <CLI> stays, naming the installed command.
      replaceOnce(`${npx}\n`, `${bin}\n`);
      replaceOnce(
        '执行命令前必须把 `<CLI>` 展开为上面的真实命令；不要直接执行字面量 `<CLI>`。',
        `执行命令前必须把 \`<CLI>\` 展开为 \`${bin}\`，不要直接执行字面量 \`<CLI>\`，也不要改用 \`npx\` 形式。`
      );
      replaceOnce('如果 npm latest help 与 reference 冲突，必须以 npm latest 的 `<CLI> ... --help` 为准。', '如果 CLI help 与 reference 冲突，必须以 `<CLI> ... --help` 为准。');
      replaceOnce('不要根据本地源码、旧示例、缓存文档或记忆推断 npm latest 语法。', '不要根据本地源码、旧示例、缓存文档或记忆推断 CLI 语法。');
      replaceOnce('- `command-index.md`：npm latest help 生成的命令和参数索引。', '- `command-index.md`：CLI help 生成的命令和参数索引。');
      replaceOnce('新增 npm latest 命令若没有专门 reference', '新增命令若没有专门 reference');
      replaceOnce('先确认 npm 发布版命令面：', '先确认已安装的 CLI 命令面：');
      replaceOnce('命令语法仍以当前 npm 发布版 `--help` 为准。', '命令语法仍以当前已安装 CLI 的 `--help` 为准。');
    }
    // Every file: the definition of <CLI>, wherever it is spelled out.
    next = next.split(`\`${npx}\``).join(`\`${bin}\``);
    next = next.split(npx).join(bin);
    if (next.includes('npm latest')) {
      throw new Error(`${file}: still mentions "npm latest" after the transform`);
    }
    return next;
  };
}

/** Every file of a directory as a map of relative path to contents. */
function readTree(directory) {
  const files = {};
  const walk = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      if (entry.name === '.DS_Store') continue;
      const path = join(current, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.isFile()) files[relative(directory, path)] = readFileSync(path, 'utf8');
    }
  };
  walk(directory);
  return files;
}

let written = 0;
let drifted = 0;

for (const target of TARGETS) {
  const source = resolve(repoRoot, 'skills', target.skill);
  const destination = resolve(repoRoot, target.directory);
  if (!existsSync(source)) throw new Error(`canonical skill not found: ${source}`);

  const expected = {};
  for (const [file, text] of Object.entries(readTree(source))) {
    expected[file] = target.transform ? target.transform(text, file) : text;
  }

  const current = existsSync(destination) ? readTree(destination) : {};
  const files = new Set([...Object.keys(expected), ...Object.keys(current)]);
  const differences = [...files].filter((file) => expected[file] !== current[file]).sort();

  // A hand-written fork is expected to differ from its skill; it is reported, never counted as
  // out of date, because this script does not produce it.
  if (target.handWritten) {
    if (differences.length > 0) {
      console.log(`NOTE ${target.id} ${target.directory} is a hand-written fork and differs from skills/${target.skill} in ${differences.length} file(s); review by hand.`);
    }
    continue;
  }

  if (differences.length === 0) {
    console.log(`ok    ${target.id} ${target.directory} is up to date`);
    continue;
  }

  if (checkOnly) {
    drifted += 1;
    console.log(`DIFF  ${target.id} ${target.directory}:`);
    for (const file of differences) console.log(`        ${expected[file] === undefined ? 'not in the skill, only in the package' : current[file] === undefined ? 'missing in the package' : 'differs'}: ${file}`);
    continue;
  }

  for (const file of Object.keys(current)) {
    if (expected[file] === undefined) rmSync(resolve(destination, file));
  }
  for (const [file, text] of Object.entries(expected)) {
    mkdirSync(dirname(resolve(destination, file)), { recursive: true });
    if (!existsSync(resolve(destination, file)) || readFileSync(resolve(destination, file), 'utf8') !== text) {
      writeFileSync(resolve(destination, file), text);
      written += 1;
    }
  }
  console.log(`wrote ${target.id} ${target.directory} (${differences.length} file(s) updated)`);
}

if (checkOnly) {
  if (drifted > 0) {
    console.error(`\n${drifted} packaged skill(s) out of date. Run: node scripts/sync-packaged-skills.mjs`);
    process.exit(1);
  }
  console.log('\nPackaged skills are in sync.');
} else {
  console.log(`\n${written} file(s) written.`);
}
