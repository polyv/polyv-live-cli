#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const coverageReports = [
  {
    label: 'CLI',
    path: 'packages/cli/coverage/coverage-summary.json'
  },
  {
    label: 'SDK',
    path: 'packages/sdk/coverage/coverage-summary.json'
  }
];

function colorForCoverage(percent) {
  if (percent >= 90) return 'brightgreen';
  if (percent >= 80) return 'green';
  if (percent >= 70) return 'yellowgreen';
  if (percent >= 60) return 'yellow';
  if (percent >= 50) return 'orange';
  return 'red';
}

function formatPercent(percent) {
  const rounded = Math.round(percent * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

async function readCoverageReport(report) {
  const absolutePath = resolve(repoRoot, report.path);

  try {
    const raw = await readFile(absolutePath, 'utf8');
    const summary = JSON.parse(raw);
    const lines = summary?.total?.lines;

    if (!lines || typeof lines.covered !== 'number' || typeof lines.total !== 'number') {
      throw new Error(`missing total.lines coverage data in ${report.path}`);
    }

    return {
      label: report.label,
      covered: lines.covered,
      total: lines.total,
      percent: lines.total === 0 ? 0 : (lines.covered / lines.total) * 100
    };
  } catch (error) {
    throw new Error(`Unable to read ${report.path}: ${error.message}`);
  }
}

function replaceBadge(readme, badge) {
  const coverageBadgePattern = /^\[!\[Coverage\]\([^\n]+\)\]\([^\n]+\)$/m;
  const codecovBadgePattern = /^\[!\[codecov\]\([^\n]+\)\]\([^\n]+\)$/m;
  const npmDownloadsPattern = /^\[!\[NPM Downloads\]\([^\n]+\)\]\([^\n]+\)$/m;

  if (coverageBadgePattern.test(readme)) {
    return readme.replace(coverageBadgePattern, badge);
  }

  if (codecovBadgePattern.test(readme)) {
    return readme.replace(codecovBadgePattern, badge);
  }

  if (npmDownloadsPattern.test(readme)) {
    return readme.replace(npmDownloadsPattern, `$&\n${badge}`);
  }

  throw new Error('Unable to find a README badge insertion point');
}

const reports = await Promise.all(coverageReports.map(readCoverageReport));
const total = reports.reduce(
  (acc, report) => ({
    covered: acc.covered + report.covered,
    total: acc.total + report.total
  }),
  { covered: 0, total: 0 }
);

if (total.total === 0) {
  throw new Error('Coverage reports contain zero total lines');
}

const percent = (total.covered / total.total) * 100;
const percentText = formatPercent(percent);
const color = colorForCoverage(percent);
const badge = `[![Coverage](https://img.shields.io/badge/coverage-${encodeURIComponent(`${percentText}%`)}-${color}?style=flat-square)](https://github.com/polyv/polyv-live-cli/actions/workflows/ci.yml)`;

const readmePath = resolve(repoRoot, 'README.md');
const readme = await readFile(readmePath, 'utf8');
const nextReadme = replaceBadge(readme, badge);

if (nextReadme !== readme) {
  await writeFile(readmePath, nextReadme);
}

console.log(`Updated coverage badge to ${percentText}% (${total.covered}/${total.total} lines)`);
for (const report of reports) {
  console.log(`- ${report.label}: ${formatPercent(report.percent)}% (${report.covered}/${report.total} lines)`);
}
