/**
 * @fileoverview Real local CLI integration tests for authentication source selection.
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { hasRealCredentials } from '../helpers/integration-config';
import { runCli } from '../helpers/cli-runner';

const shouldRunTests = hasRealCredentials();

(shouldRunTests ? describe : describe.skip)('CLI auth source integration', () => {
  let homeDir: string;

  beforeEach(() => {
    homeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'polyv-cli-auth-it-'));
  });

  afterEach(() => {
    if (fs.existsSync(homeDir)) {
      fs.rmSync(homeDir, { recursive: true, force: true });
    }
  });

  function addLocalDefaultAccount(): void {
    runCli([
      'account',
      'add',
      'local-default',
      '--app-id',
      'localappid123',
      '--app-secret',
      'localappsecret123456',
      '--user-id',
      'local-user-id',
    ], {
      homeDir,
      includeTestEnv: false,
      rejectOnError: true,
    });

    runCli(['account', 'set-default', 'local-default'], {
      homeDir,
      includeTestEnv: false,
      rejectOnError: true,
    });
  }

  it('uses .env.test credentials over a local default account for business commands', () => {
    addLocalDefaultAccount();

    const result = runCli([
      '--verbose',
      'channel',
      'list',
      '--limit',
      '1',
      '--output',
      'json',
    ], {
      homeDir,
      timeout: 45000,
    });

    expect(result.output).toContain('Authentication Source: 环境变量');
    expect(result.output).not.toContain('Account: local-default');
  }, 60000);

  it('still lets --account explicitly override .env.test credentials', () => {
    addLocalDefaultAccount();

    const result = runCli([
      '--verbose',
      '--account',
      'local-default',
      'channel',
      'list',
      '--limit',
      '1',
      '--output',
      'json',
    ], {
      homeDir,
      timeout: 45000,
    });

    expect(result.output).toContain('Authentication Source: 命令行指定账号');
    expect(result.output).toContain('Account: local-default');
  }, 60000);
});
