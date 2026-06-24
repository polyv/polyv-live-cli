/**
 * @fileoverview Real-CLI integration tests for the local `monitor` subcommands.
 *
 * The `monitor status | config | themes | test | export | import` subcommands are
 * local CLI utilities: they read host/terminal info and a static default monitor
 * configuration, never call `loadApiCommandConfig`, never hit the PolyV API, and
 * take no account/channel argument. Because they need neither account nor channel
 * context, the temp-channel convention (scoped to "tests that need real
 * account/API context") does not apply here, so no temporary channel is created.
 *
 * `monitor export` writes the config to a file under os.tmpdir(); that temp file is
 * removed in `finally`. `monitor import` only loads the file into a per-process
 * handler instance (no persisted global state), so it needs no extra cleanup.
 *
 * Each target is exercised through the local CLI entry (dist/index.js).
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { runCli } from '../helpers/cli-runner';
import { parseJsonObject, parseJsonValue, runCliSuccess } from '../helpers/channel-fixture';

// `monitor test` spins up a blessed screen, which emits VT escapes (alt-screen,
// cursor visibility, etc.) into stdout. Those stray `[` bytes confuse the JSON
// array-start detection in parseJsonValue, so strip ANSI/VT escapes first.
// Pattern adapted from the `ansi-regex` package (covers CSI, OSC, and bare ESC
// sequences such as ESC = and ESC >).
const ANSI_PATTERN = new RegExp(
  [
    '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
    '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))',
  ].join('|'),
  'g',
);

function stripAnsi(input: string): string {
  return input.replace(ANSI_PATTERN, '');
}

describe('monitor local CLI integration (no API context)', () => {
  it('shows dashboard status via real CLI', () => {
    const payload = parseJsonObject(runCliSuccess(['monitor', 'status', '--output', 'json']));

    expect(typeof payload.isRunning).toBe('boolean');
    expect(typeof payload.configuration).toBe('object');
    expect(typeof payload.configuration?.layout).toBe('string');
    expect(typeof payload.terminal).toBe('object');
    expect(typeof payload.performance).toBe('object');
  }, 60000);

  it('shows monitor configuration via real CLI', () => {
    const payload = parseJsonObject(runCliSuccess(['monitor', 'config', '--output', 'json']));

    expect(typeof payload.version).toBe('string');
    expect(typeof payload.refreshInterval).toBe('number');
    expect(typeof payload.layout).toBe('string');
    expect(typeof payload.theme).toBe('string');
    expect(Array.isArray(payload.components)).toBe(true);
    expect(payload.components.length).toBeGreaterThan(0);
  }, 60000);

  it('lists available themes via real CLI', () => {
    const payload = parseJsonValue(runCliSuccess(['monitor', 'themes', '--output', 'json']));

    expect(Array.isArray(payload)).toBe(true);
    expect(payload.length).toBeGreaterThan(0);
    for (const theme of payload as Array<Record<string, unknown>>) {
      expect(typeof theme.name).toBe('string');
      expect(typeof theme.description).toBe('string');
    }
  }, 60000);

  it('runs compatibility test via real CLI', () => {
    const payload = parseJsonObject(stripAnsi(runCliSuccess(['monitor', 'test', '--output', 'json'])));

    expect(['pass', 'fail', 'warn']).toContain(payload.overall);
    expect(Array.isArray(payload.tests)).toBe(true);
    expect(payload.tests.length).toBeGreaterThan(0);
    for (const test of payload.tests as Array<Record<string, unknown>>) {
      expect(['pass', 'fail', 'warn']).toContain(test.status);
    }
  }, 60000);

  it('exports and imports monitor configuration via real CLI', () => {
    const exportPath = path.join(os.tmpdir(), `polyv-monitor-export-${process.pid}-${Date.now()}.json`);

    try {
      const exportOutput = runCliSuccess(['monitor', 'export', exportPath]);
      expect(exportOutput).toContain('Configuration exported to');
      expect(fs.existsSync(exportPath)).toBe(true);

      // The exported file must be valid JSON with the monitor config shape.
      const exported = parseJsonObject(fs.readFileSync(exportPath, 'utf8'));
      expect(typeof exported.version).toBe('string');
      expect(typeof exported.refreshInterval).toBe('number');

      // `import` loads the exported file into the per-process handler and prints a
      // confirmation; it is a real execution of the import subcommand.
      const importOutput = runCliSuccess(['monitor', 'import', exportPath]);
      expect(importOutput).toContain('Configuration imported from');
    } finally {
      if (fs.existsSync(exportPath)) {
        fs.unlinkSync(exportPath);
      }
    }
  }, 60000);

  // Sanity check that the CLI surface exists even without real credentials.
  it('exposes the targeted monitor subcommands through the real CLI entry', () => {
    const checks: Array<[string[], string]> = [
      [['monitor', 'status', '--help'], 'status'],
      [['monitor', 'config', '--help'], 'config'],
      [['monitor', 'themes', '--help'], 'theme'],
      [['monitor', 'test', '--help'], 'compat'],
      [['monitor', 'export', '--help'], 'export'],
      [['monitor', 'import', '--help'], 'import'],
    ];

    for (const [args, marker] of checks) {
      const result = runCli(args, { includeTestEnv: false, rejectOnError: true });
      expect(result.stdout).toContain(marker);
    }
  });
});
