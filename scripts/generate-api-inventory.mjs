#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const defaultApiDocsRoot = resolve(repoRoot, '../document-center/docs/live/api');
const fallbackApiDocsRoot = resolve(repoRoot, 'docs/api');
const apiDocsRoot = resolve(
  process.env.POLYV_API_DOCS_DIR ||
    (existsSync(defaultApiDocsRoot) ? defaultApiDocsRoot : fallbackApiDocsRoot)
);
const apiDocsRootDisplay = process.env.POLYV_API_DOCS_DIR
  ? process.env.POLYV_API_DOCS_DIR
  : '../document-center/docs/live/api';
const outputDir = resolve(repoRoot, 'docs/api-reference');
const inventoryMarkdownPath = resolve(outputDir, 'API_INVENTORY.md');
const inventoryJsonPath = resolve(outputDir, 'api-inventory.json');
const sdkServicesRoot = resolve(repoRoot, 'packages/sdk/src/services');
const commonRequiredParams = new Set(['appId', 'sign', 'timestamp', 'signatureNonce', 'signatureMethod']);

const moduleLabels = {
  account: '账号与财务',
  callback: '回调通知',
  channel: '频道',
  chat: '聊天',
  donate: '打赏',
  finance: '财务与审核',
  group: '组织与套餐',
  global: '全局设置',
  ai: 'AI 与数字人',
  live_interaction: '直播互动',
  material: '素材库',
  other: '其他',
  platform: '开放平台',
  player: '播放器',
  robot: '数字人与机器人',
  statistics: '数据统计',
  user: '用户与观众',
  web: '观看页与观看条件',
  webapp: 'WebApp',
  uncategorized: '未分类',
  root: '根目录'
};

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

function toPosix(pathValue) {
  return pathValue.split('\\').join('/');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function stripMarkdown(value) {
  return value
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\r/g, '')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

function escapeTableCell(value) {
  return String(value ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, '<br>')
    .trim();
}

function extractTitle(markdown, fallback) {
  const match = markdown.match(/^#\s+(.+?)\s*$/m);
  return stripMarkdown(match?.[1] || fallback);
}

function extractSection(markdown, names) {
  const alternates = names.map(escapeRegExp).join('|');
  const pattern = new RegExp(
    `^#{2,5}[ \\t]*(?:\\d+[.、]?[ \\t]*)?(?:${alternates})(?:[ \\t]*[:：]?.*)?$`,
    'mi'
  );
  const match = pattern.exec(markdown);

  if (!match) return '';

  const start = match.index + match[0].length;
  const rest = markdown.slice(start);
  const nextHeading = /^#{1,5}\s+/m.exec(rest);
  return nextHeading ? rest.slice(0, nextHeading.index) : rest;
}

function extractFirstCodeBlock(section) {
  const fenced = section.match(/```[^\n]*\n([\s\S]*?)```/);
  if (fenced) return stripMarkdown(fenced[1]);

  const htmlCode = section.match(/<code[^>]*>([\s\S]*?)<\/code>/i);
  if (htmlCode) return stripMarkdown(htmlCode[1]);

  return '';
}

function cleanEndpoint(value) {
  return stripMarkdown(value)
    .replace(/^接口URL[:：]?\s*/i, '')
    .replace(/^[`'"]+|[`'"]+$/g, '')
    .replace(/[，,。；;）)\]>\s]+$/g, '')
    .trim();
}

function extractEndpoint(markdown) {
  const section = extractSection(markdown, ['接口URL', '接口地址', '请求URL', '请求地址', 'URL']);
  if (!section) return '';

  const candidates = [extractFirstCodeBlock(section), section].filter(Boolean);
  const endpointPattern =
    /(https?:\/\/[^\s`<>)，,。；;]+|\/\/[^\s`<>)，,。；;]+|api\.polyv\.net\/[^\s`<>)，,。；;]+|\/(?:live\/|v\d+\/)[^\s`<>)，,。；;]+)/i;

  for (const candidate of candidates) {
    const match = endpointPattern.exec(candidate);
    if (match) return cleanEndpoint(match[1]);
  }

  return '';
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

function endpointHost(endpoint) {
  const cleaned = endpoint.trim();
  const urlHost = cleaned.match(/^(?:https?:)?\/\/([^/]+)/i);
  if (urlHost) return urlHost[1].toLowerCase();

  const bareHost = cleaned.match(/^([A-Za-z0-9.-]+\.[A-Za-z]{2,})(?:\/|$)/);
  return bareHost ? bareHost[1].toLowerCase() : '';
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

function extractMethod(markdown) {
  const section = extractSection(markdown, ['请求方式', '请求方法', 'HTTP Method', 'Method']);
  const candidate = extractFirstCodeBlock(section) || section;
  const match = candidate.match(/\b(GET|POST|PUT|DELETE|PATCH)\b/i);
  return match ? match[1].toUpperCase() : '';
}

function extractDescription(markdown, title) {
  const section = extractSection(markdown, ['接口描述', '接口说明', '功能说明', '描述']);
  const code = extractFirstCodeBlock(section);
  const source = code || section;
  const lines = source
    .split('\n')
    .map(stripMarkdown)
    .filter((line) => line && !/^\|?\s*:?-{3,}:?/.test(line) && !line.startsWith('|'));
  return lines[0] || title;
}

function extractRequiredParams(markdown) {
  const sections = [
    extractSection(markdown, ['请求参数描述', '请求参数', 'Query请求参数']),
    extractSection(markdown, ['请求体参数描述', '请求体参数', 'Body请求参数'])
  ].filter(Boolean);

  if (sections.length === 0) {
    sections.push(markdown);
  }

  const required = new Set();

  for (const section of sections) {
    const tables = extractMarkdownTables(section);

    for (const rows of tables) {
      if (rows.length < 2) continue;

      const headers = rows[0]
        .split('|')
        .slice(1, -1)
        .map((header) => stripMarkdown(header).toLowerCase());
      const nameIndex = headers.findIndex((header) => /参数名|字段名|名称|name|key/.test(header));
      const requiredIndex = headers.findIndex((header) => /必选|必填|是否必须|required/.test(header));

      if (nameIndex === -1 || requiredIndex === -1) continue;

      for (const row of rows.slice(2)) {
        if (/^\|\s*:?-{3,}:?\s*\|/.test(row)) continue;

        const cells = row
          .split('|')
          .slice(1, -1)
          .map(stripMarkdown);
        const name = cells[nameIndex];
        const isRequired = cells[requiredIndex];

        if (name && !commonRequiredParams.has(name) && /^(是|yes|true|required|必填)$/i.test(isRequired)) {
          required.add(name);
        }
      }
    }
  }

  return [...required].sort((left, right) => left.localeCompare(right));
}

function extractMarkdownTables(section) {
  const tables = [];
  let current = [];

  for (const rawLine of section.split('\n')) {
    const line = rawLine.trim();

    if (line.startsWith('|') && line.endsWith('|')) {
      current.push(line);
      continue;
    }

    if (current.length > 0) {
      tables.push(current);
      current = [];
    }
  }

  if (current.length > 0) tables.push(current);
  return tables;
}

function inferRequestStyle(markdown, method) {
  if (/application\/json/i.test(markdown)) return 'json-body';
  if (extractSection(markdown, ['请求体参数描述', '请求体参数', 'Body请求参数'])) return 'json-body';
  if (method === 'GET') return 'query';
  return 'query/form';
}

function deriveModule(relativeDocPath, pathValue) {
  const parts = relativeDocPath.split('/');
  if (/^v\d+$/i.test(parts[0])) return parts[1] || 'root';
  if (parts.length > 1) return parts[0];

  const pathParts = pathValue.split('/').filter(Boolean);
  const versionIndex = pathParts.findIndex((part) => /^v\d+$/i.test(part));
  return pathParts[versionIndex + 1] || pathParts[0] || 'root';
}

function extractVersion(relativeDocPath, pathValue) {
  const pathMatch = pathValue.match(/(?:^|\/)(?:live\/)?v(\d+)(?:\/|$)/i);
  if (pathMatch) return Number(pathMatch[1]);

  const docMatch = relativeDocPath.match(/(?:^|\/)v(\d+)(?:\/|$)/i);
  if (docMatch) return Number(docMatch[1]);

  return 0;
}

function normalizeTitleForKey(title) {
  return stripMarkdown(title)
    .replace(/[（(][^）)]*(?:旧版|新版|老版|v\d+|V\d+)[^）)]*[）)]/g, '')
    .replace(/旧版|新版|新版本|老版本|老版|接口|API/gi, '')
    .replace(/v\d+/gi, '')
    .replace(/单个/g, '')
    .replace(/[：:，,。；;、\s"'“”‘’()[\]（）【】]/g, '')
    .toLowerCase();
}

function isApiEndpointPath(pathValue) {
  return Boolean(pathValue && pathValue !== '/' && !pathValue.startsWith('/third_res/'));
}

function makeApiRecord({ markdown, absolutePath, title, description, endpoint, method, sourceDocSuffix = '' }) {
  const relativeDocPath = toPosix(relative(apiDocsRoot, absolutePath));
  const pathValue = endpointPath(endpoint);

  if (!endpoint || !pathValue || !method) return null;
  if (!isApiEndpointPath(pathValue)) return null;

  const module = deriveModule(relativeDocPath, pathValue);
  const version = extractVersion(relativeDocPath, pathValue);
  const sourceDoc = sourceDocSuffix ? `${relativeDocPath}#${sourceDocSuffix}` : relativeDocPath;

  return {
    id: `${method} ${pathValue}`,
    title,
    description,
    module,
    moduleLabel: moduleLabels[module] || module,
    method,
    endpoint,
    endpointHost: endpointHost(endpoint),
    path: pathValue,
    normalizedPath: normalizeEndpointPath(pathValue),
    version,
    sourceDoc,
    actualDocumentPath: `${apiDocsRootDisplay}/${sourceDoc}`,
    requestStyle: inferRequestStyle(markdown, method),
    requiredParams: extractRequiredParams(markdown),
    dedupeKey: `${module}:${normalizeTitleForKey(title) || normalizeEndpointPath(pathValue)}`
  };
}

function parseStandardApiDoc(markdown, absolutePath) {
  const relativeDocPath = toPosix(relative(apiDocsRoot, absolutePath));
  const title = extractTitle(markdown, relativeDocPath.replace(/\.md$/, ''));
  const endpoint = extractEndpoint(markdown);
  const method = extractMethod(markdown);
  const description = extractDescription(markdown, title);

  return makeApiRecord({ markdown, absolutePath, title, description, endpoint, method });
}

function splitSecondLevelSections(markdown) {
  const headingPattern = /^##\s+(.+?)\s*$/gm;
  const headings = [...markdown.matchAll(headingPattern)];
  const sections = [];

  for (let index = 0; index < headings.length; index++) {
    const heading = headings[index];
    const nextHeading = headings[index + 1];
    const start = heading.index;
    const end = nextHeading ? nextHeading.index : markdown.length;
    sections.push({
      heading: stripMarkdown(heading[1]).replace(/^\d+[.、]\s*/, ''),
      index: index + 1,
      markdown: markdown.slice(start, end)
    });
  }

  return sections;
}

function parseInlineEndpointApis(markdown, absolutePath) {
  const relativeDocPath = toPosix(relative(apiDocsRoot, absolutePath));
  const documentTitle = extractTitle(markdown, relativeDocPath.replace(/\.md$/, ''));
  const apis = [];

  for (const section of splitSecondLevelSections(markdown)) {
    if (!/接口地址/.test(section.markdown)) continue;

    const endpointPattern = /`(GET|POST|PUT|DELETE|PATCH)\s+([^`]+?)`/gi;
    for (const match of section.markdown.matchAll(endpointPattern)) {
      const method = match[1].toUpperCase();
      const endpoint = cleanEndpoint(match[2]);
      const title = `${documentTitle} - ${section.heading}`;
      const sourceDocSuffix = section.heading
        .replace(/[^\p{Script=Han}A-Za-z0-9_-]+/gu, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase();

      const api = makeApiRecord({
        markdown: section.markdown,
        absolutePath,
        title,
        description: section.heading,
        endpoint,
        method,
        sourceDocSuffix: sourceDocSuffix || `section-${section.index}`
      });

      if (api) apis.push(api);
    }
  }

  return apis;
}

function parseApiDocs(markdown, absolutePath) {
  const standardApi = parseStandardApiDoc(markdown, absolutePath);
  if (standardApi) return [standardApi];

  return parseInlineEndpointApis(markdown, absolutePath);
}

function dedupeLatestApis(apis) {
  const groups = new Map();

  for (const api of apis) {
    if (!groups.has(api.dedupeKey)) groups.set(api.dedupeKey, []);
    groups.get(api.dedupeKey).push(api);
  }

  const latestApis = [];
  const supersededApis = [];

  for (const group of groups.values()) {
    const versions = new Set(group.map((api) => api.version));

    if (group.length === 1 || versions.size === 1) {
      latestApis.push(...group.map((api) => ({ ...api, supersededBy: [] })));
      continue;
    }

    const sorted = [...group].sort((left, right) => {
      if (right.version !== left.version) return right.version - left.version;
      return right.sourceDoc.localeCompare(left.sourceDoc);
    });
    const winner = sorted[0];
    const supersededBy = sorted.slice(1).map((api) => ({
      title: api.title,
      version: api.version,
      method: api.method,
      path: api.path,
      sourceDoc: api.sourceDoc,
      actualDocumentPath: api.actualDocumentPath
    }));

    latestApis.push({ ...winner, supersededBy });
    supersededApis.push(...supersededBy.map((api) => ({ ...api, replacedBy: winner.sourceDoc })));
  }

  return {
    latestApis: latestApis.sort(sortApis),
    supersededApis: supersededApis.sort((left, right) => left.sourceDoc.localeCompare(right.sourceDoc))
  };
}

function sortApis(left, right) {
  return (
    left.module.localeCompare(right.module) ||
    left.title.localeCompare(right.title, 'zh-Hans-CN') ||
    left.method.localeCompare(right.method) ||
    left.path.localeCompare(right.path)
  );
}

async function collectSdkEndpoints() {
  if (!existsSync(sdkServicesRoot)) return [];

  const files = await walkFiles(
    sdkServicesRoot,
    (file) => file.endsWith('.ts') && !file.endsWith('.test.ts') && !file.endsWith('/index.ts')
  );
  const endpoints = [];

  for (const file of files) {
    const source = await readFile(file, 'utf8');
    const className = source.match(/export\s+class\s+([A-Za-z0-9_]+)/)?.[1] || '';
    collectSdkEndpointsFromSource(source, file, className, endpoints);
  }

  const seen = new Set();
  return endpoints.filter((endpoint) => {
    const key = `${endpoint.method} ${endpoint.path} ${endpoint.file} ${endpoint.methodName}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function collectSdkEndpointsFromSource(source, file, className, endpoints) {
  const callPattern =
    /this\.client\.httpClient\.(get|post|put|delete|patch)\s*(?:<[\s\S]*?>)?\s*\(\s*(['"`])([\s\S]*?)\2/g;

  for (const match of source.matchAll(callPattern)) {
    const method = match[1].toUpperCase();
    const literal = match[3];
    const pathMatch = literal.match(/\/(?:live\/|live_status\/|live-bg\/|v\d+\/|front\/)[^\s'"`,)\]]+/);
    if (!pathMatch) continue;

    const rawPath = pathMatch[0];
    const methodName = inferSdkMethodName(source, match.index);
    const relativeFile = toPosix(relative(repoRoot, file));

    endpoints.push({
      method,
      path: endpointPath(rawPath),
      normalizedPath: normalizeEndpointPath(rawPath),
      file: relativeFile,
      className,
      methodName,
      reference: `${className || relativeFile}${methodName ? `#${methodName}` : ''}`
    });
  }
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

function pathSegments(pathValue) {
  return normalizeEndpointPath(pathValue).split('/').filter(Boolean);
}

function isDynamicSegment(segment) {
  return /^\{[^}]+}$/.test(segment) || /\$\{[^}]+}/.test(segment);
}

function pathsMatch(apiPath, sdkPath) {
  const apiSegments = pathSegments(apiPath);
  const sdkSegments = pathSegments(sdkPath);

  if (apiSegments.length !== sdkSegments.length) return false;

  return apiSegments.every((segment, index) => {
    const sdkSegment = sdkSegments[index];
    return segment === sdkSegment || isDynamicSegment(segment) || isDynamicSegment(sdkSegment);
  });
}

function findSdkImplementation(api, sdkEndpoints) {
  const pathMatches = sdkEndpoints.filter((endpoint) => pathsMatch(api.normalizedPath, endpoint.normalizedPath));
  const exact = pathMatches.find((endpoint) => !endpoint.method || endpoint.method === api.method);

  if (exact) {
    return {
      implemented: true,
      methodMismatch: false,
      sdkMethod: exact.method,
      sdkPath: exact.path,
      reference: exact.reference,
      file: exact.file
    };
  }

  if (pathMatches.length > 0) {
    const mismatch = pathMatches[0];
    return {
      implemented: false,
      methodMismatch: true,
      sdkMethod: mismatch.method,
      sdkPath: mismatch.path,
      reference: mismatch.reference,
      file: mismatch.file
    };
  }

  return {
    implemented: false,
    methodMismatch: false,
    sdkMethod: '',
    sdkPath: '',
    reference: '',
    file: ''
  };
}

function buildSummaries(apis) {
  const modules = new Map();

  for (const api of apis) {
    const entry = modules.get(api.module) || {
      module: api.module,
      label: api.moduleLabel,
      total: 0,
      implemented: 0,
      missing: 0
    };
    entry.total += 1;
    if (api.sdk.implemented) entry.implemented += 1;
    else entry.missing += 1;
    modules.set(api.module, entry);
  }

  return [...modules.values()]
    .map((entry) => ({
      ...entry,
      coverage: entry.total === 0 ? 0 : Number(((entry.implemented / entry.total) * 100).toFixed(1))
    }))
    .sort((left, right) => right.missing - left.missing || left.module.localeCompare(right.module));
}

function formatPercent(value) {
  return `${Number(value).toFixed(Number.isInteger(value) ? 0 : 1)}%`;
}

function formatParams(params) {
  if (!params.length) return '-';
  const visible = params.slice(0, 6);
  return `${visible.join(', ')}${params.length > visible.length ? `, +${params.length - visible.length}` : ''}`;
}

function formatSuperseded(supersededBy) {
  if (!supersededBy.length) return '-';
  return supersededBy
    .map((api) => `v${api.version || '?'} ${api.method} ${api.path} (${api.sourceDoc})`)
    .join('<br>');
}

function formatSdk(api) {
  if (api.sdk.implemented) {
    return `yes: ${api.sdk.reference} (${api.sdk.file})`;
  }

  if (api.sdk.methodMismatch) {
    return `no: path exists as ${api.sdk.sdkMethod || '?'} in ${api.sdk.reference}`;
  }

  return 'no';
}

function formatEndpoint(api) {
  if (api.endpointHost && api.endpointHost !== 'api.polyv.net') {
    return `${api.endpointHost}${api.path}`;
  }

  return api.path;
}

function buildMarkdown({
  allApiCount,
  parsedDocumentFileCount,
  excludedDocumentFileCount,
  latestApis,
  supersededApis,
  moduleSummaries,
  sdkEndpointCount
}) {
  const implemented = latestApis.filter((api) => api.sdk.implemented).length;
  const missing = latestApis.length - implemented;
  const coverage = latestApis.length === 0 ? 0 : (implemented / latestApis.length) * 100;
  const generatedAt = new Date().toISOString();
  const topMissing = moduleSummaries.filter((entry) => entry.missing > 0).slice(0, 8);

  const lines = [
    '# PolyV Live API Inventory',
    '',
    `生成时间：${generatedAt}`,
    '',
    '## 来源与规则',
    '',
    `- 原始 API 文档根目录：\`${apiDocsRootDisplay}\`（相对于本仓库根目录解析，或由 \`POLYV_API_DOCS_DIR\` 覆盖）`,
    '- 本清单只统计能解析出“接口URL”和“请求方式”的服务端 API；签名规则、错误码、回调通知、FAQ 等说明文档不计入 SDK 待实现接口。',
    '- 同一模块内标题规范化后相同、且存在多个版本的接口，只保留最高版本；被替代的旧版接口记录在“替代旧版”列。',
    '- SDK 覆盖状态来自 `packages/sdk/src/services/**/*.ts` 的真实服务源码路径匹配，不使用测试 mock 路径。',
    '- “业务必填参数”列已过滤 `appId`、`sign`、`timestamp` 等公共签名参数，这些参数由 SDK 客户端统一处理。',
    '',
    '## 统计概览',
    '',
    '| 指标 | 数值 |',
    '| --- | ---: |',
    `| 原始 Markdown 文件数 | ${allApiCount} |`,
    `| 含可调用 API 的文档文件数 | ${parsedDocumentFileCount} |`,
    `| 未计入说明/回调文档数 | ${excludedDocumentFileCount} |`,
    `| 可解析 API 数 | ${latestApis.length + supersededApis.length} |`,
    `| 去重后最新 API 数 | ${latestApis.length} |`,
    `| 被旧版去重的 API 数 | ${supersededApis.length} |`,
    `| SDK 源码 API 路径数 | ${sdkEndpointCount} |`,
    `| SDK 已实现最新 API 数 | ${implemented} |`,
    `| SDK 未实现最新 API 数 | ${missing} |`,
    `| SDK 覆盖率 | ${formatPercent(coverage)} |`,
    '',
    '## 模块覆盖率',
    '',
    '| 模块 | 名称 | 最新 API | SDK 已实现 | 待补齐 | 覆盖率 |',
    '| --- | --- | ---: | ---: | ---: | ---: |'
  ];

  for (const summary of moduleSummaries) {
    lines.push(
      `| \`${summary.module}\` | ${escapeTableCell(summary.label)} | ${summary.total} | ${summary.implemented} | ${summary.missing} | ${formatPercent(summary.coverage)} |`
    );
  }

  lines.push('', '## SDK 补齐建议', '');

  if (topMissing.length === 0) {
    lines.push('- 当前清单中的最新 API 已全部在 SDK 源码中找到对应路径。');
  } else {
    lines.push(
      `- 优先补齐缺口最大的模块：${topMissing
        .map((entry) => `\`${entry.module}\` ${entry.missing} 个`)
        .join('、')}。`
    );
    lines.push(
      '- 每个缺口应以本清单的 Method、Path、请求形态和业务必填参数为入口，再回到源文档核对完整请求/响应表，避免只按路径补空方法。'
    );
    lines.push(
      '- v4/v5 接口大多需要 JSON body；v2/v3 历史接口多为 query/form 风格。新增 SDK 方法时应把签名公共参数留给 `PolyVClient` 拦截器处理。'
    );
    lines.push(
      '- 对列表、导出、批量创建、异步任务类接口，建议先抽通用分页/任务状态类型，再补服务方法，减少后续 CLI 命令重复定义。'
    );
  }

  lines.push('', '## 完整 API 清单', '');

  const grouped = new Map();
  for (const api of latestApis) {
    if (!grouped.has(api.module)) grouped.set(api.module, []);
    grouped.get(api.module).push(api);
  }

  for (const [module, apis] of [...grouped.entries()].sort((left, right) => left[0].localeCompare(right[0]))) {
    const label = moduleLabels[module] || module;
    lines.push(`### ${module} - ${label}`, '');
    lines.push(
      '| 功能/用途 | Method | Path | 源文档 | 请求形态 | 业务必填参数 | SDK 实现 | 替代旧版 |'
    );
    lines.push('| --- | --- | --- | --- | --- | --- | --- | --- |');

    for (const api of apis.sort(sortApis)) {
      const purpose =
        api.description && api.description !== api.title
          ? `${api.title}<br><sub>${api.description}</sub>`
          : api.title;

      lines.push(
        [
          escapeTableCell(purpose),
          api.method,
          `\`${formatEndpoint(api)}\``,
          `\`${api.actualDocumentPath}\``,
          api.requestStyle,
          escapeTableCell(formatParams(api.requiredParams)),
          escapeTableCell(formatSdk(api)),
          escapeTableCell(formatSuperseded(api.supersededBy))
        ].join(' | ').replace(/^/, '| ').replace(/$/, ' |')
      );
    }

    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

async function main() {
  if (!existsSync(apiDocsRoot)) {
    throw new Error(`API docs root does not exist: ${apiDocsRoot}`);
  }

  const markdownFiles = await walkFiles(apiDocsRoot, (file) => file.endsWith('.md'));
  const parsedApis = [];

  for (const file of markdownFiles) {
    const markdown = await readFile(file, 'utf8');
    parsedApis.push(...parseApiDocs(markdown, file));
  }

  const { latestApis, supersededApis } = dedupeLatestApis(parsedApis);
  const sdkEndpoints = await collectSdkEndpoints();
  const enrichedApis = latestApis.map((api) => ({
    ...api,
    sdk: findSdkImplementation(api, sdkEndpoints)
  }));
  const moduleSummaries = buildSummaries(enrichedApis);
  const parsedDocumentFileCount = new Set(parsedApis.map((api) => api.sourceDoc.split('#')[0])).size;
  const generatedAt = new Date().toISOString();
  const payload = {
    generatedAt,
    source: {
      apiDocsRoot: apiDocsRootDisplay,
      resolvedApiDocsRoot: apiDocsRoot,
      sdkServicesRoot: toPosix(relative(repoRoot, sdkServicesRoot))
    },
    rules: {
      apiDocFilter: 'Requires both 接口URL and 请求方式.',
      dedupe: 'Within the same module, normalized matching titles across multiple versions keep the highest version.',
      sdkCoverage: 'Matches method and normalized endpoint path from packages/sdk/src/services source files.',
      requiredParams: 'Business required params only; common signature params such as appId, sign, and timestamp are omitted.'
    },
    summary: {
      markdownFiles: markdownFiles.length,
      parsedDocumentFiles: parsedDocumentFileCount,
      excludedDocumentFiles: markdownFiles.length - parsedDocumentFileCount,
      parsedApis: parsedApis.length,
      latestApis: enrichedApis.length,
      supersededApis: supersededApis.length,
      sdkEndpoints: sdkEndpoints.length,
      sdkImplemented: enrichedApis.filter((api) => api.sdk.implemented).length,
      sdkMissing: enrichedApis.filter((api) => !api.sdk.implemented).length
    },
    modules: moduleSummaries,
    apis: enrichedApis,
    supersededApis,
    sdkEndpoints
  };

  await mkdir(outputDir, { recursive: true });
  await writeFile(inventoryJsonPath, `${JSON.stringify(payload, null, 2)}\n`);
  await writeFile(
    inventoryMarkdownPath,
    buildMarkdown({
      allApiCount: markdownFiles.length,
      parsedDocumentFileCount,
      excludedDocumentFileCount: markdownFiles.length - parsedDocumentFileCount,
      latestApis: enrichedApis,
      supersededApis,
      moduleSummaries,
      sdkEndpointCount: sdkEndpoints.length
    })
  );

  console.log(`Parsed API docs: ${parsedApis.length}/${markdownFiles.length}`);
  console.log(`Latest APIs: ${enrichedApis.length}`);
  console.log(`Superseded APIs: ${supersededApis.length}`);
  console.log(`SDK implemented: ${payload.summary.sdkImplemented}/${enrichedApis.length}`);
  console.log(`Wrote ${toPosix(relative(repoRoot, inventoryMarkdownPath))}`);
  console.log(`Wrote ${toPosix(relative(repoRoot, inventoryJsonPath))}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
