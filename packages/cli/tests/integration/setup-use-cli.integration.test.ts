import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { runCli } from '../helpers/cli-runner';

describe('setup and use real CLI integration', () => {
  let homeDir: string;

  beforeEach(() => {
    homeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'polyv-setup-use-cli-'));
  });

  afterEach(() => {
    if (fs.existsSync(homeDir)) {
      fs.rmSync(homeDir, { recursive: true, force: true });
    }
  });

  function runLocalCli(args: string[]) {
    return runCli(args, {
      homeDir,
      includeTestEnv: false,
      env: {
        POLYV_APP_ID: '',
        POLYV_APP_SECRET: '',
        POLYV_USER_ID: '',
        POLYV_TEST_APP_ID: '',
        POLYV_TEST_APP_SECRET: '',
        POLYV_TEST_USER_ID: '',
        TERM: 'xterm-test',
        SHELL: '/bin/zsh',
      },
    });
  }

  function runSetupCli(args: string[]) {
    return runCli(args, {
      homeDir,
      includeTestEnv: false,
      env: {
        POLYV_APP_ID: 'setupappid12345',
        POLYV_APP_SECRET: 'setupsecret123456789',
        POLYV_USER_ID: 'setupuser',
        POLYV_TEST_APP_ID: '',
        POLYV_TEST_APP_SECRET: '',
        POLYV_TEST_USER_ID: '',
      },
    });
  }

  it('lists setup scenes through the real CLI in JSON format', () => {
    const result = runSetupCli(['setup', '--list', '--output', 'json']);

    expect(result.exitCode).toBe(0);
    const payload = JSON.parse(result.stdout);
    expect(Array.isArray(payload.builtin)).toBe(true);
    expect(payload.builtin).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'e-commerce',
          resources: expect.any(Number),
        }),
      ])
    );
    expect(Array.isArray(payload.user)).toBe(true);
  });

  it('runs the e-commerce setup dry-run through the real CLI', () => {
    const result = runSetupCli(['setup', 'e-commerce', '--dry-run', '--output', 'json']);

    expect(result.exitCode).toBe(0);
    const payload = JSON.parse(result.stdout);
    expect(payload).toEqual(
      expect.objectContaining({
        success: true,
        scene: 'e-commerce',
        dryRun: true,
      })
    );
    expect(payload.resources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'channel', status: 'would_create' }),
        expect.objectContaining({ id: 'product', status: 'would_create' }),
        expect.objectContaining({ id: 'coupon', status: 'would_create' }),
      ])
    );
  });

  it('fails setup without a scene name when not listing', () => {
    const result = runSetupCli(['setup']);

    expect(result.exitCode).toBe(1);
    expect(result.output).toContain('Scene name is required');
    expect(result.output).toContain('polyv-live-cli setup <scene-name>');
  });

  it('runs account session switching through the real use command', () => {
    const addFirst = runLocalCli([
      'account',
      'add',
      'session-one',
      '--app-id',
      'sessionappid123',
      '--app-secret',
      'sessionsecret123456',
      '--user-id',
      'session-user',
    ]);
    expect(addFirst.exitCode).toBe(0);

    const addSecond = runLocalCli([
      'account',
      'add',
      'session-two',
      '--app-id',
      'sessionappid456',
      '--app-secret',
      'sessionsecret456789',
    ]);
    expect(addSecond.exitCode).toBe(0);

    const listBeforeSwitch = runLocalCli(['use', '--list']);
    expect(listBeforeSwitch.exitCode).toBe(0);
    expect(listBeforeSwitch.output).toContain('session-one');
    expect(listBeforeSwitch.output).toContain('session-two');
    expect(listBeforeSwitch.output).toContain("polyv-live-cli use <account-name>");

    const switchResult = runLocalCli(['use', 'session-one']);
    expect(switchResult.exitCode).toBe(0);
    expect(switchResult.output).toContain("已切换到账号 'session-one'");

    const statusResult = runLocalCli(['use', '--status']);
    expect(statusResult.exitCode).toBe(0);
    expect(statusResult.output).toContain('当前会话账号: session-one');
    expect(statusResult.output).toContain('终端ID:');

    const listAfterSwitch = runLocalCli(['use', '--list']);
    expect(listAfterSwitch.exitCode).toBe(0);
    expect(listAfterSwitch.output).toContain('session-one (当前会话)');

    const clearResult = runLocalCli(['use', '--clear']);
    expect(clearResult.exitCode).toBe(0);
    expect(clearResult.output).toContain("已清除会话账号 'session-one'");

    const statusAfterClear = runLocalCli(['use', '--status']);
    expect(statusAfterClear.exitCode).toBe(0);
    expect(statusAfterClear.output).toContain('未设置当前会话账号');

    const cleanupResult = runLocalCli(['use', '--cleanup']);
    expect(cleanupResult.exitCode).toBe(0);
    expect(cleanupResult.output).toContain('没有需要清理的过期会话文件');
  });
});
