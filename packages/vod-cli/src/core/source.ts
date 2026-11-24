/**
 * Per-invocation source declaration (`--source`).
 *
 * Same contract as the live CLI: every API-bound command requires `--source`, so the caller
 * declares itself on each call and the platform can attribute traffic. Omitting it fails with
 * guidance; the value is never persisted.
 */

export interface SourceResolution {
  source: string;
}

/** Lowercase letters/digits/dashes, must start alphanumeric, at most 32 characters. */
export function isValidSourceFormat(value: string): boolean {
  return /^[a-z0-9][a-z0-9-]{0,31}$/.test(value);
}

export function normalizeSource(value: string): string {
  return value.trim().toLowerCase();
}

export const SOURCE_REQUIRED_MESSAGE = [
  '缺少调用方来源标识，请添加 --source <标识> 重试（小写字母/数字/连字符，≤32 字符）。',
  '- 官方平台连接器传平台名，如: --source workbuddy',
  '- 其它 agent 传自身名称，如: --source codex'
].join('\n');

/** Command names that never call the platform, so they are exempt. */
export const SOURCE_EXEMPT_COMMANDS = new Set(['auth', 'account', 'use']);

/**
 * Invocations that work offline although their command group calls the platform, written from
 * the group down: `callback verify` checks a signature locally, while `callback get` and
 * `callback set` do call the platform.
 */
export const SOURCE_EXEMPT_PATHS: ReadonlySet<string> = new Set(['callback/verify']);

/**
 * True when the invocation is exempt.
 *
 * @param names Command names from the invoked command up to the root, as Commander walks them
 */
export function isExemptInvocation(names: string[]): boolean {
  if (names.some((name) => SOURCE_EXEMPT_COMMANDS.has(name))) return true;
  const path = names.slice(0, 2).reverse().join('/');
  return SOURCE_EXEMPT_PATHS.has(path);
}

/** Resolves the invocation source; `{ error }` when it is missing or malformed. */
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
