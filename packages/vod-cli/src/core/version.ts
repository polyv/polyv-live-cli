/**
 * Where the CLI reports its version from.
 *
 * The published package only ships `dist/`, so the version is written into `dist/version.json`
 * at build time (`scripts/write-version.mjs`). This file compiles to `dist/core/version.js`,
 * hence the `..`. Reading `package.json` from disk works in the repository but would silently
 * report `0.0.0` once installed, which also breaks the connector's minimum-version check.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let cachedVersion: string | null = null;

export function getCliVersion(): string {
  if (cachedVersion === null) {
    cachedVersion = readJson(join(__dirname, '..', 'version.json')) ?? readJson(join(__dirname, '..', '..', 'package.json')) ?? '0.0.0';
  }
  return cachedVersion;
}

/** `version` field of a JSON file, or null when the file is missing or has none. */
function readJson(path: string): string | null {
  try {
    const parsed = JSON.parse(readFileSync(path, 'utf8')) as { version?: unknown };
    return typeof parsed.version === 'string' && parsed.version ? parsed.version : null;
  } catch {
    return null;
  }
}
