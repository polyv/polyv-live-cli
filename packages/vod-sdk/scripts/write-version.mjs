#!/usr/bin/env node
/**
 * Writes `src/version.ts` from `package.json`, so the exported VERSION follows the release
 * instead of drifting from it (the build runs this before bundling).
 *
 * The written file is committed: a dev build without a release only rewrites it to the same
 * content.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const { version } = JSON.parse(readFileSync(resolve(here, '../package.json'), 'utf8'));
const target = resolve(here, '../src/version.ts');
writeFileSync(
  target,
  `/** Package version, reported in the default User-Agent. */\nexport const VERSION = '${version}';\n`
);
console.log(`[write-version] wrote ${target} (version ${version})`);
