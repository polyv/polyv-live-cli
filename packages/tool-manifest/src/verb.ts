/**
 * @fileoverview Leaf verb classification (read / write / unknown).
 *
 * Primary signal: the leaf command name (last path segment). Compound
 * kebab verbs fall back to their last hyphen part, then first hyphen part
 * (e.g. "batch-delete" -> delete -> write; "create-init" -> create -> write).
 * Final fallback: the first word of the description ("Get ..." -> read).
 */

import { VerbClass } from './types';

const READ_VERBS = new Set([
  'list', 'lists', 'get', 'gets', 'show', 'view', 'search', 'find', 'query',
  'detail', 'details', 'info', 'statistics', 'statistic', 'summary', 'summaries',
  'export', 'download', 'check', 'status', 'data', 'describe',
]);

const WRITE_VERBS = new Set([
  'create', 'add', 'new', 'update', 'set', 'modify', 'edit', 'delete', 'del',
  'remove', 'rm', 'import', 'upload', 'transfer', 'move', 'merge', 'push',
  'send', 'publish', 'clear', 'reset', 'enable', 'disable', 'open', 'close',
  'start', 'stop', 'cancel', 'revoke', 'bind', 'unbind', 'sort', 'switch',
  'apply', 'confirm', 'shelf', 'migrate',
]);

const DESCRIPTION_FIRST_WORD: Record<string, VerbClass> = {
  get: 'read', list: 'read', show: 'read', view: 'read', find: 'read',
  search: 'read', query: 'read', fetch: 'read', retrieve: 'read', check: 'read',
  create: 'write', add: 'write', update: 'write', set: 'write', modify: 'write',
  delete: 'write', remove: 'write', import: 'write', upload: 'write', send: 'write',
  push: 'write', merge: 'write', transfer: 'write',
};

/**
 * Chinese descriptions are not whitespace-delimited, so first-word splitting
 * does not apply — match known verb prefixes instead (longest first).
 */
const CN_VERB_PREFIXES: ReadonlyArray<readonly [string, VerbClass]> = [
  ['批量查询', 'read'],
  ['批量导出', 'read'],
  ['查看', 'read'],
  ['获取', 'read'],
  ['查询', 'read'],
  ['导出', 'read'],
  ['下载', 'read'],
  ['新增', 'write'],
  ['添加', 'write'],
  ['创建', 'write'],
  ['修改', 'write'],
  ['设置', 'write'],
  ['删除', 'write'],
  ['上传', 'write'],
  ['推送', 'write'],
  ['开启', 'write'],
  ['关闭', 'write'],
];

function classifyToken(token: string): VerbClass | undefined {
  if (READ_VERBS.has(token)) {
    return 'read';
  }
  if (WRITE_VERBS.has(token)) {
    return 'write';
  }
  return undefined;
}

/** Classify a leaf command as read / write / unknown. */
export function classifyVerb(leafName: string, description: string | undefined): VerbClass {
  const name = leafName.trim().toLowerCase();

  // 1. exact leaf name
  const exact = classifyToken(name);
  if (exact) {
    return exact;
  }

  // 2. last hyphen part ("basic-list" -> "list", "batch-delete" -> "delete")
  if (name.includes('-')) {
    const parts = name.split('-').filter(part => part.length > 0);
    const last = parts[parts.length - 1] ?? '';
    const byLast = classifyToken(last);
    if (byLast) {
      return byLast;
    }
    // 3. first hyphen part ("create-init" -> "create")
    const first = parts[0] ?? '';
    const byFirst = classifyToken(first);
    if (byFirst) {
      return byFirst;
    }
  }

  // 4. description fallback: first word for ASCII ("Get channel ..."), verb
  //    prefixes for Chinese ("查看历史并发数据" -> read)
  const trimmed = description?.trim() ?? '';
  if (trimmed) {
    const firstWord = trimmed.split(/[\s,，。:：]+/, 1)[0]?.toLowerCase() ?? '';
    const byFirstWord = DESCRIPTION_FIRST_WORD[firstWord];
    if (byFirstWord) {
      return byFirstWord;
    }
    for (const [prefix, verbClass] of CN_VERB_PREFIXES) {
      if (trimmed.startsWith(prefix)) {
        return verbClass;
      }
    }
  }
  return 'unknown';
}
