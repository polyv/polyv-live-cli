#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const apiInventoryPath = resolve(repoRoot, 'docs/api-reference/api-inventory.json');
const outputDir = resolve(repoRoot, 'docs/api-reference');
const cliSrcRoot = resolve(repoRoot, 'packages/cli/src');
const sdkServicesRoot = resolve(repoRoot, 'packages/sdk/src/services');
const cliInventoryMarkdownPath = resolve(outputDir, 'CLI_INVENTORY.md');
const cliInventoryJsonPath = resolve(outputDir, 'cli-inventory.json');

const clientServiceClasses = {
  account: 'AccountService',
  channel: 'ChannelService',
  chat: 'ChatService',
  finance: 'FinanceService',
  group: 'GroupService',
  liveInteraction: 'LiveInteractionService',
  other: 'OtherService',
  platform: 'PlatformService',
  player: 'PlayerService',
  statistics: 'StatisticsService',
  v4Ai: 'V4AiService',
  v4Channel: 'V4ChannelService',
  v4Chat: 'V4ChatService',
  v4Global: 'V4GlobalService',
  v4Group: 'V4GroupService',
  v4Material: 'V4MaterialService',
  v4Platform: 'V4PlatformService',
  v4Robot: 'V4RobotService',
  v4Statistics: 'V4StatisticsService',
  v4User: 'V4UserService',
  v4WebApp: 'V4WebAppService',
  web: 'WebService'
};

const recommendationCatalog = [
  {
    modules: ['channel'],
    title: '频道高级能力',
    command: '`channel` 子命令扩展',
    rationale: 'API 数量最大，当前 CLI 只覆盖频道 CRUD、开停播、少量回放/录制/文档/营销入口。',
    examples: [
      '`channel copy`、`channel batch-create`、`channel auth-token`',
      '`channel role *`、`channel subtitle *`、`channel template update`',
      '`channel distribute *`、`channel task-reward *`、`channel invite *`'
    ]
  },
  {
    modules: ['web'],
    title: '观看页配置',
    command: '新增 `web` 或扩展 `player`/`watch-condition`',
    rationale: '观看页菜单、暖场、点赞、图文、授权、登记表等配置适合 CLI 自动化，但当前只覆盖观看条件和白名单的一部分。',
    examples: [
      '`web splash get/set`、`web menu add/update/delete`',
      '`web share get/update`、`web likes get/update`',
      '`web record-field get`、`web enroll list/export`'
    ]
  },
  {
    modules: ['chat', 'robot'],
    title: '聊天治理与机器人',
    command: '扩展 `chat`，新增 `robot`',
    rationale: '当前已有消息、禁言、踢人，但敏感词、公告、审核、角色、机器人配置仍大量缺失。',
    examples: [
      '`chat badword *`、`chat notice *`、`chat audit *`',
      '`chat role teacher/admin get/update`',
      '`robot setting get/update`、`robot stats`'
    ]
  },
  {
    modules: ['user', 'account', 'group'],
    title: '账号、组织与资源管理',
    command: '新增 `user`、`group`，扩展 `platform`',
    rationale: '这些接口更偏运营后台和批量管理，适合给内部自动化脚本使用。',
    examples: [
      '`account category *`、`account callback *`、`account duration`',
      '`user product *`、`user viewer-label *`',
      '`group quota *`、`group allocation-log list`'
    ]
  },
  {
    modules: ['live_interaction'],
    title: '互动活动补齐',
    command: '扩展 `checkin`、`qa`、`questionnaire`、`lottery`，新增活动子命令',
    rationale: 'CLI 已有基础签到/问答/问卷/抽奖，但红包、福袋、邀请、任务奖励、观众分组等活动运营能力仍缺。',
    examples: [
      '`lottery group *`、`lottery blacklist *`',
      '`interaction lucky-bag winners`、`interaction red-pack stats`',
      '`interaction task-reward *`'
    ]
  },
  {
    modules: ['finance', 'material', 'webapp', 'global'],
    title: '后台运维与审核工具',
    command: '新增 `finance`、`material`、`webapp`、`global`',
    rationale: '覆盖量不大，但对审核、素材库、WebApp 权限和全局设置的自动化价值高。',
    examples: [
      '`finance audio-moderation *`、`finance video-moderation *`',
      '`material list/delete`、`material bind-channel`',
      '`webapp role *`、`global setting *`'
    ]
  }
];

async function main() {
  if (!existsSync(apiInventoryPath)) {
    throw new Error(`Missing API inventory: ${toPosix(relative(repoRoot, apiInventoryPath))}`);
  }

  const apiInventory = JSON.parse(await readFile(apiInventoryPath, 'utf8'));
  const latestApis = apiInventory.apis.map((api) => ({
    ...api,
    cli: {
      used: false,
      usages: []
    }
  }));

  const sdkEndpointIndex = await collectSdkEndpointIndex();
  const activeCommandFiles = await collectActiveCommandFiles();
  const commandInventory = await collectCommandInventory(activeCommandFiles);
  const activeCommandModules = new Set(commandInventory.map((command) => command.path[0]));
  const cliUsages = await collectCliUsages(sdkEndpointIndex, activeCommandModules);
  const { matchedApis, unmatchedUsages } = applyCliCoverage(latestApis, cliUsages);
  const moduleSummaries = buildModuleSummaries(latestApis);
  const recommendations = buildRecommendations(moduleSummaries);
  const inventoryContent = {
    source: {
      apiInventory: 'docs/api-reference/api-inventory.json',
      cliSourceRoot: 'packages/cli/src',
      sdkServicesRoot: 'packages/sdk/src/services'
    },
    rules: {
      apiUniverse: 'Uses latest de-duplicated API records from docs/api-reference/api-inventory.json.',
      cliCoverage:
        'Matches CLI SDK service calls and direct CLI httpClient calls to latest APIs by HTTP method and normalized endpoint path.',
      directHttp:
        'Direct CLI httpClient calls are counted as CLI usage, but are kept distinguishable from SDK service calls.',
      unmatched:
        'CLI usages that resolve to SDK/raw endpoints outside the latest API universe are reported as legacy or extra usages.'
    },
    summary: buildSummary({
      latestApis,
      cliUsages,
      matchedApis,
      unmatchedUsages,
      commandInventory,
      sdkEndpointIndex
    }),
    modules: moduleSummaries,
    commands: commandInventory,
    recommendations,
    unmatchedUsages,
    apis: latestApis.map((api) => ({
      id: api.id,
      title: api.title,
      description: api.description,
      module: api.module,
      moduleLabel: api.moduleLabel,
      method: api.method,
      path: api.path,
      normalizedPath: api.normalizedPath,
      sourceDoc: api.sourceDoc,
      actualDocumentPath: api.actualDocumentPath,
      requestStyle: api.requestStyle,
      requiredParams: api.requiredParams,
      sdk: api.sdk,
      cli: api.cli
    }))
  };

  // Reuse the previous generatedAt when the inventory content hasn't changed,
  // so reruns that produce no substantive change yield an empty diff.
  const generatedAt = await resolveGeneratedAt(inventoryContent);
  const inventory = { generatedAt, ...inventoryContent };

  await mkdir(outputDir, { recursive: true });
  const wroteMarkdown = await writeIfChanged(cliInventoryMarkdownPath, buildMarkdown(inventory));
  const wroteJson = await writeIfChanged(cliInventoryJsonPath, `${JSON.stringify(inventory, null, 2)}\n`);

  const label = (pathValue, wrote) =>
    `${toPosix(relative(repoRoot, pathValue))}${wrote ? '' : ' (unchanged, no diff)'}`;
  console.log(`${wroteMarkdown ? 'Generated' : 'Skipped'} ${label(cliInventoryMarkdownPath, wroteMarkdown)}`);
  console.log(`${wroteJson ? 'Generated' : 'Skipped'} ${label(cliInventoryJsonPath, wroteJson)}`);
  console.log(
    `CLI coverage: ${inventory.summary.cliUsedLatestApis}/${inventory.summary.latestApis} (${formatPercent(
      inventory.summary.cliCoverage
    )})`
  );
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

function contentMatches(existing, nextContent) {
  if (!existing || typeof existing !== 'object') return false;
  // Compare every content field of the freshly built inventory against the
  // previously generated one. The generatedAt timestamp (present only on the
  // parsed existing object) is deliberately ignored.
  return Object.keys(nextContent).every((key) => isDeepStrictEqual(existing[key], nextContent[key]));
}

async function resolveGeneratedAt(inventoryContent) {
  try {
    if (!existsSync(cliInventoryJsonPath)) return new Date().toISOString();
    const existing = JSON.parse(await readFile(cliInventoryJsonPath, 'utf8'));
    if (contentMatches(existing, inventoryContent)) return existing.generatedAt;
  } catch {
    // Ignore read/parse errors and fall back to a fresh timestamp.
  }
  return new Date().toISOString();
}

async function writeIfChanged(filePath, nextContent) {
  let previous = null;
  try {
    previous = await readFile(filePath, 'utf8');
  } catch {
    // File may not exist yet; proceed to write.
  }
  if (previous === nextContent) return false;
  await writeFile(filePath, nextContent, 'utf8');
  return true;
}

function toPosix(pathValue) {
  return pathValue.split('\\').join('/');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeTableCell(value) {
  return String(value ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, '<br>')
    .trim();
}

function stripCommandSignature(value) {
  return value
    .replace(/\s+/g, ' ')
    .replace(/\s*\[[^\]]+]|\s*<[^>]+>/g, '')
    .trim();
}

function normalizeEndpointPath(pathValue) {
  const rawPath = pathValue
    .replace(/^https?:\/\/[^/]+/i, '')
    .replace(/^\/\/[^/]+/i, '')
    .replace(/^api\.polyv\.net/i, '')
    .split(/[?#]/)[0]
    .replace(/\$\{[^}]+}/g, '{param}')
    .replace(/:([A-Za-z0-9_]+)/g, '{param}');

  return rawPath
    .split('/')
    .filter(Boolean)
    .map((segment) => {
      const cleaned = segment.replace(/%7B/gi, '{').replace(/%7D/gi, '}');
      return /^\{[^}]+}$/.test(cleaned) ? '{param}' : cleaned;
    })
    .join('/')
    .replace(/^/, '/')
    .replace(/\/+$/, '');
}

function endpointPath(endpoint) {
  const withoutDomain = endpoint
    .replace(/^https?:\/\/[^/]+/i, '')
    .replace(/^\/\/[^/]+/i, '')
    .replace(/^api\.polyv\.net/i, '');
  const path = withoutDomain.split(/[?#]/)[0];
  if (!path) return '';
  return normalizeEndpointPath(path.startsWith('/') ? path : `/${path}`);
}

function pathSegments(pathValue) {
  return normalizeEndpointPath(pathValue).split('/').filter(Boolean);
}

function isDynamicSegment(segment) {
  return /^\{[^}]+}$/.test(segment) || /\$\{[^}]+}/.test(segment);
}

function pathsMatch(apiPath, usagePath) {
  const apiSegments = pathSegments(apiPath);
  const usageSegments = pathSegments(usagePath);

  if (apiSegments.length !== usageSegments.length) return false;

  return apiSegments.every((segment, index) => {
    const usageSegment = usageSegments[index];
    return segment === usageSegment || isDynamicSegment(segment) || isDynamicSegment(usageSegment);
  });
}

function lineNumberAt(source, index) {
  return source.slice(0, index).split('\n').length;
}

async function collectSdkEndpointIndex() {
  const files = await walkFiles(
    sdkServicesRoot,
    (file) => file.endsWith('.ts') && !file.endsWith('.test.ts') && !file.endsWith('/index.ts')
  );
  const endpoints = [];

  for (const file of files) {
    const source = await readFile(file, 'utf8');
    const className = source.match(/export\s+class\s+([A-Za-z0-9_]+)/)?.[1] || '';
    const callPattern =
      /this\.client\.httpClient\.(get|post|put|delete|patch)\s*(?:<[\s\S]*?>)?\s*\(\s*(['"`])([\s\S]*?)\2/g;

    for (const match of source.matchAll(callPattern)) {
      const rawPath = extractApiPath(match[3]);
      if (!rawPath) continue;

      const methodName = inferSdkMethodName(source, match.index);
      const relativeFile = toPosix(relative(repoRoot, file));
      endpoints.push({
        method: match[1].toUpperCase(),
        path: endpointPath(rawPath),
        normalizedPath: normalizeEndpointPath(rawPath),
        className,
        methodName,
        reference: `${className || relativeFile}${methodName ? `#${methodName}` : ''}`,
        file: relativeFile
      });
    }
  }

  const byReference = new Map();
  const seen = new Set();
  for (const endpoint of endpoints) {
    const key = `${endpoint.reference} ${endpoint.method} ${endpoint.normalizedPath}`;
    if (seen.has(key)) continue;
    seen.add(key);

    if (!byReference.has(endpoint.reference)) byReference.set(endpoint.reference, []);
    byReference.get(endpoint.reference).push(endpoint);
  }

  return {
    count: seen.size,
    byReference,
    endpoints: [...seen].length
  };
}

function inferSdkMethodName(source, index) {
  const before = source.slice(0, index);
  const matches = [
    ...before.matchAll(
      /(?:^|\n)\s*(?:public\s+|private\s+|protected\s+)?async\s+([A-Za-z_$][\w$]*)\s*\(/g
    )
  ];
  return matches.length > 0 ? matches[matches.length - 1][1] : '';
}

async function collectCliUsages(sdkEndpointIndex, activeCommandModules) {
  const files = await walkFiles(
    cliSrcRoot,
    (file) => file.endsWith('.ts') && !file.endsWith('.test.ts') && !file.endsWith('.d.ts')
  );
  const usages = [];
  const propsPattern = Object.keys(clientServiceClasses).map(escapeRegExp).join('|');

  for (const file of files) {
    const source = await readFile(file, 'utf8');
    const relativeFile = toPosix(relative(repoRoot, file));
    const cliModule = inferCliModule(relativeFile);
    if (!isActiveCliModule(cliModule, activeCommandModules)) continue;

    const aliases = collectServiceAliases(source);

    const directSdkPattern = new RegExp(
      `(?:\\bclient|this\\.client)\\.(${propsPattern})\\.([A-Za-z_$][\\w$]*)\\s*\\(`,
      'g'
    );
    for (const match of source.matchAll(directSdkPattern)) {
      addSdkUsage({
        usages,
        sdkEndpointIndex,
        serviceProp: match[1],
        methodName: match[2],
        source,
        index: match.index,
        relativeFile,
        cliModule
      });
    }

    for (const [alias, serviceProp] of aliases.entries()) {
      const aliasPattern = new RegExp(`this\\.${escapeRegExp(alias)}\\.([A-Za-z_$][\\w$]*)\\s*\\(`, 'g');
      for (const match of source.matchAll(aliasPattern)) {
        addSdkUsage({
          usages,
          sdkEndpointIndex,
          serviceProp,
          methodName: match[1],
          source,
          index: match.index,
          relativeFile,
          cliModule
        });
      }
    }

    const rawHttpPattern =
      /httpClient\.(get|post|put|delete|patch)\s*(?:<[\s\S]*?>)?\s*\(\s*(['"`])([\s\S]*?)\2/g;
    for (const match of source.matchAll(rawHttpPattern)) {
      const rawPath = extractApiPath(match[3]);
      if (!rawPath) continue;

      usages.push({
        usageType: 'direct-http',
        method: match[1].toUpperCase(),
        path: endpointPath(rawPath),
        normalizedPath: normalizeEndpointPath(rawPath),
        reference: `httpClient.${match[1]}`,
        file: relativeFile,
        line: lineNumberAt(source, match.index),
        cliModule
      });
    }
  }

  return dedupeUsages(usages);
}

function collectServiceAliases(source) {
  const aliases = new Map();
  const propsPattern = Object.keys(clientServiceClasses).map(escapeRegExp).join('|');
  const thisAliasPattern = new RegExp(`this\\.([A-Za-z_$][\\w$]*)\\s*=\\s*this\\.client\\.(${propsPattern})`, 'g');
  const constAliasPattern = new RegExp(`const\\s+([A-Za-z_$][\\w$]*)\\s*=\\s*(?:this\\.)?client\\.(${propsPattern})`, 'g');

  for (const match of source.matchAll(thisAliasPattern)) {
    aliases.set(match[1], match[2]);
  }

  for (const match of source.matchAll(constAliasPattern)) {
    aliases.set(match[1], match[2]);
  }

  return aliases;
}

function addSdkUsage({
  usages,
  sdkEndpointIndex,
  serviceProp,
  methodName,
  source,
  index,
  relativeFile,
  cliModule
}) {
  const className = clientServiceClasses[serviceProp];
  if (!className) return;

  const reference = `${className}#${methodName}`;
  const sdkEndpoints = sdkEndpointIndex.byReference.get(reference) || [];

  if (sdkEndpoints.length === 0) {
    usages.push({
      usageType: 'sdk-unresolved',
      reference,
      serviceProp,
      methodName,
      file: relativeFile,
      line: lineNumberAt(source, index),
      cliModule
    });
    return;
  }

  for (const endpoint of sdkEndpoints) {
    usages.push({
      usageType: 'sdk-service',
      method: endpoint.method,
      path: endpoint.path,
      normalizedPath: endpoint.normalizedPath,
      reference,
      serviceProp,
      sdkFile: endpoint.file,
      file: relativeFile,
      line: lineNumberAt(source, index),
      cliModule
    });
  }
}

function extractApiPath(value) {
  const match = value.match(/\/(?:live\/|live_status\/|live-bg\/|v\d+\/|front\/)[^\s'"`,)\]]+/);
  return match ? match[0] : '';
}

function dedupeUsages(usages) {
  const seen = new Set();
  return usages.filter((usage) => {
    const key = [
      usage.usageType,
      usage.method || '',
      usage.normalizedPath || '',
      usage.reference || '',
      usage.file,
      usage.line
    ].join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function applyCliCoverage(latestApis, cliUsages) {
  const matchedApis = new Set();
  const unmatchedUsages = [];

  for (const usage of cliUsages) {
    if (!usage.method || !usage.normalizedPath) {
      unmatchedUsages.push({
        ...usage,
        reason: 'SDK service usage could not be resolved to an HTTP endpoint'
      });
      continue;
    }

    const matches = latestApis.filter(
      (api) => api.method === usage.method && pathsMatch(api.normalizedPath, usage.normalizedPath)
    );

    if (matches.length === 0) {
      unmatchedUsages.push({
        ...usage,
        reason: 'Endpoint is not in the latest de-duplicated API inventory'
      });
      continue;
    }

    for (const api of matches) {
      api.cli.used = true;
      api.cli.usages.push({
        usageType: usage.usageType,
        reference: usage.reference,
        cliModule: usage.cliModule,
        file: usage.file,
        line: usage.line,
        sdkFile: usage.sdkFile
      });
      matchedApis.add(api.id);
    }
  }

  for (const api of latestApis) {
    api.cli.usages = dedupeApiUsages(api.cli.usages);
  }

  return { matchedApis, unmatchedUsages: dedupeUnmatchedUsages(unmatchedUsages) };
}

function dedupeApiUsages(usages) {
  const seen = new Set();
  return usages.filter((usage) => {
    const key = [usage.usageType, usage.reference, usage.file, usage.line].join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function dedupeUnmatchedUsages(usages) {
  const seen = new Set();
  return usages.filter((usage) => {
    const key = [
      usage.usageType,
      usage.method || '',
      usage.normalizedPath || '',
      usage.reference || '',
      usage.file,
      usage.line
    ].join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildSummary({ latestApis, cliUsages, matchedApis, unmatchedUsages, commandInventory, sdkEndpointIndex }) {
  const cliUsedLatestApis = latestApis.filter((api) => api.cli.used).length;
  const cliCoverage = latestApis.length === 0 ? 0 : Number(((cliUsedLatestApis / latestApis.length) * 100).toFixed(1));
  const topLevelCommands = new Set(commandInventory.map((command) => command.path[0]));

  return {
    latestApis: latestApis.length,
    cliUsedLatestApis,
    cliMissingLatestApis: latestApis.length - cliUsedLatestApis,
    cliCoverage,
    cliUsageReferences: cliUsages.length,
    cliSdkServiceUsages: cliUsages.filter((usage) => usage.usageType === 'sdk-service').length,
    cliDirectHttpUsages: cliUsages.filter((usage) => usage.usageType === 'direct-http').length,
    cliUnresolvedSdkUsages: cliUsages.filter((usage) => usage.usageType === 'sdk-unresolved').length,
    cliUnmatchedEndpointUsages: unmatchedUsages.length,
    matchedApiIds: matchedApis.size,
    sdkEndpointReferences: sdkEndpointIndex.count,
    cliCommandPaths: commandInventory.length,
    cliTopLevelCommands: topLevelCommands.size
  };
}

function buildModuleSummaries(latestApis) {
  const modules = new Map();

  for (const api of latestApis) {
    const entry = modules.get(api.module) || {
      module: api.module,
      label: api.moduleLabel,
      total: 0,
      cliUsed: 0,
      cliMissing: 0,
      directHttpUsed: 0,
      sdkServiceUsed: 0
    };

    entry.total += 1;
    if (api.cli.used) {
      entry.cliUsed += 1;
      if (api.cli.usages.some((usage) => usage.usageType === 'direct-http')) entry.directHttpUsed += 1;
      if (api.cli.usages.some((usage) => usage.usageType === 'sdk-service')) entry.sdkServiceUsed += 1;
    } else {
      entry.cliMissing += 1;
    }

    modules.set(api.module, entry);
  }

  return [...modules.values()]
    .map((entry) => ({
      ...entry,
      cliCoverage: entry.total === 0 ? 0 : Number(((entry.cliUsed / entry.total) * 100).toFixed(1))
    }))
    .sort((left, right) => right.cliMissing - left.cliMissing || left.module.localeCompare(right.module));
}

function buildRecommendations(moduleSummaries) {
  const moduleByName = new Map(moduleSummaries.map((summary) => [summary.module, summary]));

  return recommendationCatalog
    .map((item) => {
      const relatedModules = item.modules
        .map((module) => moduleByName.get(module))
        .filter(Boolean)
        .map((summary) => ({
          module: summary.module,
          label: summary.label,
          missing: summary.cliMissing,
          total: summary.total,
          coverage: summary.cliCoverage
        }));
      const missing = relatedModules.reduce((sum, module) => sum + module.missing, 0);
      const total = relatedModules.reduce((sum, module) => sum + module.total, 0);

      return {
        ...item,
        relatedModules,
        missing,
        total,
        coverage: total === 0 ? 0 : Number((((total - missing) / total) * 100).toFixed(1))
      };
    })
    .filter((item) => item.missing > 0)
    .sort((left, right) => right.missing - left.missing || left.title.localeCompare(right.title, 'zh-Hans-CN'));
}

async function collectActiveCommandFiles() {
  const indexPath = resolve(cliSrcRoot, 'index.ts');
  const source = await readFile(indexPath, 'utf8');
  const importByRegisterFunction = new Map();
  const importPattern = /import\s+\{\s*(register[A-Za-z0-9_]+Commands?)\s*\}\s+from\s+['"]\.\/commands\/([^'"]+)['"]/g;

  for (const match of source.matchAll(importPattern)) {
    importByRegisterFunction.set(
      match[1],
      toPosix(resolve(cliSrcRoot, 'commands', `${match[2]}.ts`))
    );
  }

  const activeFiles = new Set();
  const callPattern = /\b(register[A-Za-z0-9_]+Commands?)\s*\(\s*program\s*\)/g;
  for (const match of source.matchAll(callPattern)) {
    const file = importByRegisterFunction.get(match[1]);
    if (file) activeFiles.add(file);
  }

  return activeFiles;
}

async function collectCommandInventory(activeCommandFiles) {
  const files = [...activeCommandFiles]
    .map((file) => resolve(file))
    .filter((file) => existsSync(file))
    .sort((left, right) => toPosix(left).localeCompare(toPosix(right)));
  const commands = [];
  const seen = new Set();

  for (const file of files) {
    const source = await readFile(file, 'utf8');
    const relativeFile = toPosix(relative(repoRoot, file));
    const varPaths = new Map([['program', []]]);
    const existingCommandPattern =
      /const\s+([A-Za-z_$][\w$]*)\s*=\s*program\.commands\.find\s*\([\s\S]*?\.name\(\)\s*===\s*(['"`])([^'"`]+)\2[\s\S]*?\);/g;

    for (const match of source.matchAll(existingCommandPattern)) {
      varPaths.set(match[1], [match[3]]);
    }

    const commandCallPattern =
      /(?:const\s+([A-Za-z_$][\w$]*)\s*=\s*)?([A-Za-z_$][\w$]*)\s*\.command\s*\(\s*(['"`])([^'"`]+)\3\s*\)/g;

    for (const match of source.matchAll(commandCallPattern)) {
      const assignedVar = match[1] || '';
      const parentVar = match[2];
      const signature = match[4].trim();
      const commandName = stripCommandSignature(signature);
      if (!commandName) continue;

      const parentPath = varPaths.get(parentVar) || [];
      const commandPath = [...parentPath, commandName];
      if (assignedVar) {
        varPaths.set(assignedVar, commandPath);
      }

      const key = commandPath.join(' ');
      if (seen.has(key)) continue;
      seen.add(key);
      commands.push({
        command: key,
        path: commandPath,
        depth: commandPath.length,
        signature,
        file: relativeFile,
        line: lineNumberAt(source, match.index)
      });
    }
  }

  return commands.sort(
    (left, right) =>
      left.path[0].localeCompare(right.path[0]) ||
      left.depth - right.depth ||
      left.command.localeCompare(right.command)
  );
}

function inferCliModule(relativeFile) {
  const fileName = relativeFile.split('/').pop() || '';
  const withoutExt = fileName.replace(/\.ts$/, '');

  if (relativeFile.includes('/setup/')) return 'setup';
  if (relativeFile.includes('/commands/')) return withoutExt.replace(/\.commands$/, '');
  if (relativeFile.includes('/handlers/')) return withoutExt.replace(/\.handler$/, '');
  if (relativeFile.includes('/services/')) {
    return withoutExt
      .replace(/\.service\.sdk$/, '')
      .replace(/\.service$/, '')
      .replace(/-service$/, '');
  }

  return relativeFile.split('/')[2] || 'unknown';
}

function isActiveCliModule(cliModule, activeCommandModules) {
  if (activeCommandModules.has(cliModule)) return true;

  const aliases = {
    'ai-digital-human': ['ai'],
    'ai-video-produce': ['ai'],
    'qa-questionnaire': ['qa', 'questionnaire'],
    setup: ['setup']
  };

  return (aliases[cliModule] || []).some((alias) => activeCommandModules.has(alias));
}

function formatPercent(value) {
  return `${Number(value).toFixed(Number.isInteger(value) ? 0 : 1)}%`;
}

function formatParams(params) {
  if (!params?.length) return '-';
  const visible = params.slice(0, 6);
  return `${visible.join(', ')}${params.length > visible.length ? `, +${params.length - visible.length}` : ''}`;
}

function formatCliUsage(api) {
  if (!api.cli.used) return 'no';
  return api.cli.usages
    .slice(0, 4)
    .map((usage) => {
      const type = usage.usageType === 'direct-http' ? 'http' : 'sdk';
      return `${type}: ${usage.reference} (${usage.file}:${usage.line})`;
    })
    .join('<br>');
}

function buildMarkdown(inventory) {
  const { summary, modules, recommendations, commands, unmatchedUsages, apis, generatedAt } = inventory;
  const topMissingModules = modules.filter((module) => module.cliMissing > 0).slice(0, 10);
  const directHttpModules = modules.filter((module) => module.directHttpUsed > 0);

  const lines = [
    '# PolyV Live CLI API Inventory',
    '',
    `生成时间：${generatedAt}`,
    '',
    '## 来源与规则',
    '',
    '- API 总表来自 `docs/api-reference/api-inventory.json`，即去重后的最新服务端 OpenAPI 清单。',
    '- CLI 覆盖状态来自 `packages/cli/src/**/*.ts` 的真实源码扫描，测试文件不计入。',
    '- CLI 通过 SDK service 方法调用、或直接通过 `httpClient` 调用到同一个 Method + Path，均计为 CLI 已使用该最新 API。',
    '- 直接 `httpClient` 调用会在清单中标记为 `http`，方便后续迁移到 SDK service 方法。',
    '- CLI 调到旧路径、非最新清单路径或无法解析的 SDK 方法，会进入“旧版/额外 CLI 调用”列表，不计入最新 API 覆盖率。',
    '',
    '## 统计概览',
    '',
    '| 指标 | 数值 |',
    '| --- | ---: |',
    `| 最新 API 数 | ${summary.latestApis} |`,
    `| CLI 已使用最新 API 数 | ${summary.cliUsedLatestApis} |`,
    `| CLI 未使用最新 API 数 | ${summary.cliMissingLatestApis} |`,
    `| CLI 最新 API 覆盖率 | ${formatPercent(summary.cliCoverage)} |`,
    `| CLI 调用引用数 | ${summary.cliUsageReferences} |`,
    `| 其中 SDK service 调用 | ${summary.cliSdkServiceUsages} |`,
    `| 其中直接 httpClient 调用 | ${summary.cliDirectHttpUsages} |`,
    `| 未解析 SDK 调用 | ${summary.cliUnresolvedSdkUsages} |`,
    `| 旧版/额外 CLI endpoint 调用 | ${summary.cliUnmatchedEndpointUsages} |`,
    `| CLI 命令路径数 | ${summary.cliCommandPaths} |`,
    `| CLI 一级命令数 | ${summary.cliTopLevelCommands} |`,
    '',
    '## 模块覆盖率',
    '',
    '| 模块 | 名称 | 最新 API | CLI 已用 | CLI 未用 | 覆盖率 | SDK 调用覆盖 | 直接 HTTP 覆盖 |',
    '| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |'
  ];

  for (const module of modules) {
    lines.push(
      `| \`${module.module}\` | ${escapeTableCell(module.label)} | ${module.total} | ${module.cliUsed} | ${module.cliMissing} | ${formatPercent(module.cliCoverage)} | ${module.sdkServiceUsed} | ${module.directHttpUsed} |`
    );
  }

  lines.push('', '## 补齐建议', '');

  if (topMissingModules.length > 0) {
    lines.push(
      `- 缺口最大的模块：${topMissingModules
        .map((module) => `\`${module.module}\` ${module.cliMissing}/${module.total}`)
        .join('、')}。`
    );
  }

  if (directHttpModules.length > 0) {
    lines.push(
      `- 仍有直接 HTTP 调用覆盖的模块：${directHttpModules
        .map((module) => `\`${module.module}\` ${module.directHttpUsed} 个`)
        .join('、')}；新增命令时建议优先复用 SDK service，并逐步迁移这些 CLI 直连调用。`
    );
  }

  for (const item of recommendations) {
    const modulesText = item.relatedModules
      .map((module) => `\`${module.module}\` ${module.missing}/${module.total}`)
      .join('、');
    lines.push(
      `- ${item.title}：${item.command}。缺口：${modulesText}。${item.rationale} 建议入口：${item.examples.join('；')}。`
    );
  }

  lines.push('', '## CLI 命令面', '');
  lines.push('| 命令路径 | 源码 |');
  lines.push('| --- | --- |');
  for (const command of commands) {
    lines.push(`| \`${command.command}\` | \`${command.file}:${command.line}\` |`);
  }

  lines.push('', '## 旧版/额外 CLI 调用', '');

  if (unmatchedUsages.length === 0) {
    lines.push('- 没有发现旧版、额外或无法解析的 CLI API 调用。');
  } else {
    lines.push('| 类型 | Method | Path | 引用 | 源码 | 原因 |');
    lines.push('| --- | --- | --- | --- | --- | --- |');
    for (const usage of unmatchedUsages.slice(0, 100)) {
      lines.push(
        `| ${usage.usageType} | ${usage.method || '-'} | \`${usage.path || usage.normalizedPath || '-'}\` | ${escapeTableCell(
          usage.reference || '-'
        )} | \`${usage.file}:${usage.line}\` | ${escapeTableCell(usage.reason)} |`
      );
    }
    if (unmatchedUsages.length > 100) {
      lines.push(`| ... | ... | ... | ... | ... | 另有 ${unmatchedUsages.length - 100} 条见 JSON |`);
    }
  }

  lines.push('', '## 完整 CLI 覆盖清单', '');

  const grouped = new Map();
  for (const api of apis) {
    if (!grouped.has(api.module)) grouped.set(api.module, []);
    grouped.get(api.module).push(api);
  }

  for (const [module, moduleApis] of [...grouped.entries()].sort((left, right) => left[0].localeCompare(right[0]))) {
    const label = moduleApis[0]?.moduleLabel || module;
    lines.push(`### ${module} - ${label}`, '');
    lines.push('| 功能/用途 | Method | Path | 请求形态 | 业务必填参数 | SDK 实现 | CLI 使用 |');
    lines.push('| --- | --- | --- | --- | --- | --- | --- |');

    for (const api of moduleApis.sort(sortApis)) {
      const purpose =
        api.description && api.description !== api.title
          ? `${api.title}<br><sub>${api.description}</sub>`
          : api.title;
      const sdk = api.sdk?.implemented ? `${api.sdk.reference} (${api.sdk.file})` : 'no';
      lines.push(
        [
          escapeTableCell(purpose),
          api.method,
          `\`${api.path}\``,
          api.requestStyle,
          escapeTableCell(formatParams(api.requiredParams)),
          escapeTableCell(sdk),
          escapeTableCell(formatCliUsage(api))
        ].join(' | ').replace(/^/, '| ').replace(/$/, ' |')
      );
    }

    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

function sortApis(left, right) {
  return (
    left.module.localeCompare(right.module) ||
    left.title.localeCompare(right.title, 'zh-Hans-CN') ||
    left.method.localeCompare(right.method) ||
    left.path.localeCompare(right.path)
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
