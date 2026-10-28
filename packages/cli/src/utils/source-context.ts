/**
 * Per-invocation source declaration (--source).
 *
 * Single mechanism, no fallback layers: every API-bound command requires
 * --source; whoever calls declares themselves. Omitting it fails with a
 * teaching error (help/format guidance) — under-declaration is impossible
 * to turn into a mis-declaration, and the value is never persisted anywhere.
 */

export interface SourceResolution {
  source: string;
}

/** Lowercase letters/digits/dashes, must start alphanumeric, ≤ 32 chars. */
export function isValidSourceFormat(value: string): boolean {
  return /^[a-z0-9][a-z0-9-]{0,31}$/.test(value);
}

export function normalizeSource(value: string): string {
  return value.trim().toLowerCase();
}

export const SOURCE_REQUIRED_MESSAGE = [
  '缺少调用方来源标识，请添加 --source <标识> 重试（小写字母/数字/连字符，≤32 字符）。',
  '- 官方平台连接器传平台名，如: --source workbuddy',
  '- 其它 agent 传自身名称，如: --source codex',
].join('\n');

/**
 * Bootstrap/management command names exempt from source declaration — they
 * never hit the live API (connector cli.json bootstrap flows depend on this).
 */
export const SOURCE_EXEMPT_COMMANDS = new Set(['auth', 'account', 'use', 'config']);

/** True when any command name on the invocation path is exempt. */
export function isExemptInvocation(names: string[]): boolean {
  return names.some(name => SOURCE_EXEMPT_COMMANDS.has(name));
}

/**
 * Resolve the invocation source from the --source option.
 * Returns { source } or { error } when missing/invalid.
 */
export function resolveSource(opts: { source?: string }): SourceResolution | { error: string } {
  if (opts.source === undefined || opts.source === '') {
    return { error: SOURCE_REQUIRED_MESSAGE };
  }
  const normalized = normalizeSource(opts.source);
  if (!isValidSourceFormat(normalized)) {
    return { error: `--source 值无效: "${opts.source}"。仅允许小写字母/数字/连字符（≤32 字符）` };
  }
  return { source: normalized };
}

// --- Per-process resolved source (read by the SDK client for the UA) ---

let resolved: SourceResolution | null = null;

export function setResolvedSource(resolution: SourceResolution): void {
  resolved = resolution;
}

export function getResolvedSource(): SourceResolution | null {
  return resolved;
}

export function resetResolvedSource(): void {
  resolved = null;
}
