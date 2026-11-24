#!/usr/bin/env node
/**
 * Maps a release tag to the workspace package it publishes.
 *
 * Used by scripts/release.sh (to compute a tag) and by .github/workflows/release.yml (to find
 * out which package a pushed tag publishes), so both sides share one mapping.
 *
 *   tag <package-key> <version>      prints the tag for that version, e.g. `vod-v0.1.0`
 *   resolve-by-key <package-key>     prints shell assignments for a package key
 *   resolve <tag>                    prints shell assignments for the package behind a tag
 *   package <tag>                    prints the npm package name behind a tag
 *
 * `resolve` and `package` exit with status 1 when the tag does not belong to any package: a tag
 * must never fall through to publishing some other package. Note that a glob such as `v*`
 * also matches `vod-v1.0.0`, so "starts with v" is not a way to tell packages apart.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Release tags, one prefix per published package. Longer prefixes are tried first. */
const PACKAGES = [
  { key: 'vod-sdk', prefix: 'vod-sdk-v', label: 'VOD SDK', install: 'npm install polyv-vod-api-sdk', directory: 'packages/vod-sdk' },
  { key: 'vod', prefix: 'vod-v', label: 'VOD CLI', install: 'npm install -g polyv-vod-cli', directory: 'packages/vod-cli' },
  { key: 'sdk', prefix: 'sdk-v', label: 'SDK', install: 'npm install polyv-live-api-sdk', directory: 'packages/sdk' },
  { key: 'cli', prefix: 'v', label: 'CLI', install: 'npm install -g polyv-live-cli', directory: 'packages/cli' }
];

function packageOf(packageKey) {
  const pkg = PACKAGES.find((entry) => entry.key === packageKey);
  if (!pkg) {
    console.error(`Unknown package "${packageKey}". Available: ${PACKAGES.map((entry) => entry.key).join(', ')}`);
    process.exit(1);
  }
  return pkg;
}

function resolveTag(tag) {
  // Longest prefix first, so that `vod-v1.0.0` is the VOD CLI and not the live CLI at "od-v1.0.0".
  const sorted = [...PACKAGES].sort((a, b) => b.prefix.length - a.prefix.length);
  const pkg = sorted.find((entry) => tag.startsWith(entry.prefix));
  if (!pkg) {
    console.error(`Tag "${tag}" does not start with a known prefix: ${sorted.map((entry) => `${entry.prefix}<version>`).join(', ')}`);
    process.exit(1);
  }
  const version = tag.slice(pkg.prefix.length);
  if (!/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(version)) {
    console.error(`Tag "${tag}" does not carry a version after "${pkg.prefix}": got "${version}"`);
    process.exit(1);
  }
  return { pkg, version };
}

const [command, argument, second] = process.argv.slice(2);

switch (command) {
  case 'tag': {
    const pkg = packageOf(argument);
    if (!second || !/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(second)) {
      console.error('Usage: release-package.js tag <package-key> <version>');
      process.exit(1);
    }
    console.log(`${pkg.prefix}${second}`);
    break;
  }
  case 'resolve-by-key': {
    const pkg = packageOf(argument);
    const manifest = JSON.parse(readFileSync(resolve(repoRoot, pkg.directory, 'package.json'), 'utf8'));
    console.log(`PACKAGE_DIR=${pkg.directory}`);
    console.log(`PACKAGE_KEY=${pkg.key}`);
    console.log(`PACKAGE_LABEL=${pkg.label}`);
    console.log(`PKG_NAME=${manifest.name}`);
    console.log(`INSTALL_COMMAND=${pkg.install}`);
    break;
  }
  case 'resolve': {
    const { pkg, version } = resolveTag(argument);
    const manifest = JSON.parse(readFileSync(resolve(repoRoot, pkg.directory, 'package.json'), 'utf8'));
    console.log(`PACKAGE_DIR=${pkg.directory}`);
    console.log(`PACKAGE_KEY=${pkg.key}`);
    console.log(`PACKAGE_LABEL=${pkg.label}`);
    console.log(`PKG_NAME=${manifest.name}`);
    console.log(`PKG_VERSION=${version}`);
    console.log(`INSTALL_COMMAND=${pkg.install}`);
    break;
  }
  case 'package': {
    const { pkg } = resolveTag(argument);
    const manifest = JSON.parse(readFileSync(resolve(repoRoot, pkg.directory, 'package.json'), 'utf8'));
    console.log(manifest.name);
    break;
  }
  default:
    console.error('Usage: release-package.js <tag|resolve|package> ...');
    process.exit(1);
}
