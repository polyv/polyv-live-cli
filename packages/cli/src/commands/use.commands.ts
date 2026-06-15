/**
 * Use command definitions for session account management
 */

import { Command } from 'commander';
import { UseHandler } from '../handlers/use.handler';

/**
 * Handle use command with account name
 */
export async function handleUse(accountName: string, options: {
  clear?: boolean;
  status?: boolean;
  list?: boolean;
  cleanup?: boolean;
}): Promise<void> {
  try {
    const useHandler = new UseHandler();
    
    // Handle options first
    if (options.clear) {
      const result = await useHandler.handleUseClear();
      console.log(result);
      return;
    }

    if (options.status) {
      const result = await useHandler.handleUseStatus();
      console.log(result);
      return;
    }

    if (options.list) {
      const result = await useHandler.handleUseList();
      console.log(result);
      return;
    }

    if (options.cleanup) {
      const result = await useHandler.handleCleanup();
      console.log(result);
      return;
    }

    // Handle account switching
    if (!accountName) {
      console.error('错误: 请指定要切换到的账号名称');
      console.log('使用 \'polyv-live-cli use --list\' 查看可用账号');
      console.log('使用 \'polyv-live-cli use --help\' 查看帮助信息');
      process.exit(1);
    }

    const result = await useHandler.handleUse(accountName);
    console.log(result);

  } catch (error) {
    console.error(error instanceof Error ? error.message : '未知错误');
    process.exit(1);
  }
}

/**
 * Register use command
 */
export function registerUseCommand(program: Command): void {
  program
    .command('use [account-name]')
    .description('管理当前终端会话的账号设置')
    .option('--clear', '清除当前会话账号设置')
    .option('--status', '显示当前会话状态')
    .option('--list', '列出所有可用账号')
    .option('--cleanup', '清理过期的会话文件')
    .addHelpText('after', `
示例:
  $ polyv-live-cli use my-account          # 切换到指定账号
  $ polyv-live-cli use --clear             # 清除当前会话账号
  $ polyv-live-cli use --status            # 显示当前会话状态
  $ polyv-live-cli use --list              # 列出可用账号
  $ polyv-live-cli use --cleanup           # 清理过期会话文件

注意:
  - 会话账号设置仅在当前终端有效
  - 不同终端窗口可以使用不同的账号
  - 会话账号优先级高于全局配置但低于命令行参数
`)
    .action(handleUse);
}
