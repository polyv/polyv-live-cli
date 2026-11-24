// Writes the package version into dist/version.json, the only place the published package
// keeps it (the package ships dist/ alone). Run after `tsc` (see "build" in package.json).
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'));

if (typeof pkg.version !== 'string' || !/^\d+\.\d+\.\d+/.test(pkg.version)) {
  console.error(`[write-version] package.json has no valid version: ${JSON.stringify(pkg.version)}`);
  process.exit(1);
}

const target = join(packageRoot, 'dist', 'version.json');
writeFileSync(target, `${JSON.stringify({ version: pkg.version, name: pkg.name }, null, 2)}\n`);
console.log(`[write-version] wrote ${target} (version ${pkg.version})`);
