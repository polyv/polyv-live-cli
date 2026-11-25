/**
 * `auth` commands, shaped by the WorkBuddy connector spec:
 *
 * - `auth`: prints an https setup guide and exits; no interactive input (no TTY there).
 * - `auth status`: prints a `Logged in` line when credentials are usable, exit code 1 otherwise.
 * - `auth logout`: removes the account the connector created; succeeds even when logged out.
 */
import { Command } from 'commander';

import { resolveAuth } from '../core/auth';
import { type CommandContext, executors } from '../core/context';

/** Account name the connector flow uses. */
export const CONNECTOR_ACCOUNT_NAME = 'workbuddy';
/** Console guide for the VOD keys. */
export const KEY_GUIDE_URL = 'https://help.polyv.net/#/vod/api/getSecretKey';
export const STATUS_LOGGED_IN = 'Logged in';
export const STATUS_NOT_LOGGED_IN = 'Not logged in';

export function registerAuthCommands(program: Command, ctx: CommandContext): void {
  const { local } = executors(ctx);
  const auth = program.command('auth').description('Connector authentication (setup guide / status / logout)');

  auth
    .description('Show how to connect to PolyV VOD: the key guide page and the setup command')
    .action(() =>
      local(() => {
        ctx.out('📲 连接保利威云点播需要先配置点播开发凭证（userId / secretKey / writeToken）。\n');
        ctx.out('1. 在浏览器打开以下页面获取凭证（官网登录 → 云点播 → 设置 → API接口）：\n');
        ctx.out(`${KEY_GUIDE_URL}\n`);
        ctx.out('2. 执行以下命令完成连接（把尖括号内容替换为真实凭证）：\n');
        ctx.out(
          `polyv-vod-cli account add ${CONNECTOR_ACCOUNT_NAME} --user-id <userId> --secret-key <secretKey> --write-token <writeToken> --default\n`
        );
        ctx.out('3. 执行完成后连接器会自动检测连接状态；也可随时运行 `polyv-vod-cli auth status` 查看。');
      })
    );

  auth
    .command('status')
    .description('Check whether credentials are usable (exit 0 when logged in)')
    .action(() =>
      local(() => {
        let loggedInAs: string | null = null;
        try {
          const resolved = resolveAuth(ctx.store, ctx.session, {});
          loggedInAs = resolved ? (resolved.accountName ?? 'environment') : null;
        } catch {
          // Unreadable credentials count as not logged in; `auth` says how to set them up.
        }
        if (loggedInAs) {
          const suffix = loggedInAs === 'environment' ? '' : ` (${loggedInAs})`;
          ctx.out(`${STATUS_LOGGED_IN}${suffix}`);
          return;
        }
        ctx.out(`${STATUS_NOT_LOGGED_IN}. No usable VOD credentials.`);
        ctx.out('Run `polyv-vod-cli auth` for setup instructions.');
        ctx.fail();
      })
    );

  auth
    .command('logout')
    .description(`Remove the connector account ("${CONNECTOR_ACCOUNT_NAME}")`)
    .action(() =>
      local(() => {
        if (!ctx.store.exists(CONNECTOR_ACCOUNT_NAME)) {
          ctx.out('Not logged in. Nothing to remove.');
          return;
        }
        ctx.store.remove(CONNECTOR_ACCOUNT_NAME);
        if (ctx.session.get() === CONNECTOR_ACCOUNT_NAME) ctx.session.clear();
        ctx.out(`✅ Logged out (removed account "${CONNECTOR_ACCOUNT_NAME}")`);
      })
    );
}
