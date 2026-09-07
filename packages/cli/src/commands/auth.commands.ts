/**
 * @fileoverview WorkBuddy connector authentication commands (auth / auth status / auth logout)
 *
 * Design constraints come from the WorkBuddy connector spec
 * (https://open.workbuddy.cn/docs/connector):
 * - `auth`: must print a full https:// auth/guide URL within 10 seconds and exit;
 *   interactive input is forbidden (no TTY in the execution environment).
 * - `auth status`: must be side-effect free, exit 0 with a `statusMatch`-able
 *   output when the CLI is usable.
 * - `auth logout`: must clean up the credentials created by this connector and
 *   succeed even when not logged in.
 */

import { Command } from 'commander';
import { AccountConfigManager } from '../config/account-config';
import { authAdapter } from '../config/auth-adapter';

/** Dedicated account name used by the WorkBuddy connector flow. */
export const CONNECTOR_ACCOUNT_NAME = 'workbuddy';

/** Official PolyV guide page for obtaining appId/appSecret/userId. */
export const KEY_GUIDE_URL = 'https://help.polyv.net/#/live/api/getSecretKey';

/** Marker printed by `auth status` when credentials are usable (cli.json statusMatch). */
export const STATUS_LOGGED_IN = 'Logged in';
/** Marker printed when no usable credentials exist (exit code 1). */
export const STATUS_NOT_LOGGED_IN = 'Not logged in';

/**
 * Register WorkBuddy connector authentication commands.
 */
export function registerAuthCommands(program: Command): void {
  const authCmd = program
    .command('auth')
    .description('WorkBuddy connector authentication (setup guide / status / logout)');

  authCmd
    .description(
      'Show how to connect WorkBuddy to PolyV Live: open the key guide page and copy the setup command'
    )
    .action(() => {
      console.log('📲 连接保利威云直播需要先配置直播开发凭证（appId / appSecret / userId）。\n');
      console.log('1. 在浏览器打开以下页面获取凭证（官网登录 → 直播 → 开发设置）：\n');
      console.log(`${KEY_GUIDE_URL}\n`);
      console.log('2. 执行以下命令完成连接（把尖括号内容替换为真实凭证）：\n');
      console.log(
        `polyv-live-cli account add ${CONNECTOR_ACCOUNT_NAME} --app-id <appId> --app-secret <appSecret> --user-id <userId>\n`
      );
      console.log('3. 执行完成后 WorkBuddy 会自动检测连接状态；也可随时运行 `polyv-live-cli auth status` 查看。');
    });

  authCmd
    .command('status')
    .description('Check connector authentication status (exit 0 when logged in)')
    .action(() => {
      let authResult: ReturnType<typeof authAdapter.tryGetAuthConfig> = null;
      try {
        authResult = authAdapter.tryGetAuthConfig({});
      } catch {
        // 配置读取异常按未连接处理，引导用户重新配置
        authResult = null;
      }
      if (authResult) {
        const who = authResult.accountName ? ` (${authResult.accountName})` : '';
        console.log(`${STATUS_LOGGED_IN}${who}`);
        return;
      }
      console.log(`${STATUS_NOT_LOGGED_IN}. ${authAdapter.getStatusMessage({})}`);
      console.log('Run `polyv-live-cli auth` for setup instructions.');
      process.exitCode = 1;
    });

  authCmd
    .command('logout')
    .description('Remove the WorkBuddy connector account (workbuddy)')
    .action(() => {
      try {
        const accountManager = new AccountConfigManager();
        if (!accountManager.accountExists(CONNECTOR_ACCOUNT_NAME)) {
          console.log('Not logged in. Nothing to remove.');
          return;
        }
        const result = accountManager.removeAccount(CONNECTOR_ACCOUNT_NAME);
        if (result.success) {
          console.log('Logged out. WorkBuddy connector credentials removed.');
        } else {
          console.error(`Failed to remove account: ${result.message}`);
          process.exitCode = 1;
        }
      } catch (error) {
        console.error(`Failed to logout: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exitCode = 1;
      }
    });
}
