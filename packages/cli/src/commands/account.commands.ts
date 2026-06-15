/**
 * @fileoverview Account management commands for polyv-live-cli
 * @author Development Team  
 * @since 6.1.0
 */

import { Command } from 'commander';
import { AccountConfigManager } from '../config/account-config';
import { SessionStateManager } from '../config/session-state';
import { validateOutputFormat } from '../types/config';
import { AccountListOptions } from '../types/account.types';
import { createInterface } from 'readline';
import { globalConfig } from '../config/global';
import { unlinkSync, existsSync } from 'fs';

/**
 * Create readline interface for interactive input
 */
function createReadlineInterface() {
  return createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

/**
 * Prompt user for confirmation
 */
function promptConfirmation(rl: any, question: string): Promise<boolean> {
  return new Promise((resolve) => {
    rl.question(`${question} (y/N): `, (answer: string) => {
      const trimmed = answer.trim().toLowerCase();
      resolve(trimmed === 'y' || trimmed === 'yes');
    });
  });
}

/**
 * Format account list as table
 */
function formatAccountTable(accounts: any[]): void {
  if (accounts.length === 0) {
    console.log('📝 No accounts configured.');
    console.log('');
    console.log('Use "polyv-live-cli account add <name>" to add your first account.');
    return;
  }

  console.log('📋 Configured Accounts:');
  console.log('');
  
  // Calculate column widths
  const nameWidth = Math.max(4, ...accounts.map(a => a.name.length));
  const appIdWidth = Math.max(6, ...accounts.map(a => a.appId.length));
  const userIdWidth = Math.max(7, ...accounts.map(a => (a.userId || '').length));
  const envWidth = Math.max(11, ...accounts.map(a => (a.environment || '-').length));
  
  // Header
  const header = `${'Name'.padEnd(nameWidth)} | ${'App ID'.padEnd(appIdWidth)} | ${'User ID'.padEnd(userIdWidth)} | ${'Environment'.padEnd(envWidth)} | Created`;
  console.log(header);
  console.log('-'.repeat(header.length));
  
  // Rows
  accounts.forEach(account => {
    const createdDate = new Date(account.createdAt).toLocaleDateString();
    const userId = account.userId || '-';
    const environment = account.environment || '-';
    console.log(`${account.name.padEnd(nameWidth)} | ${account.appId.padEnd(appIdWidth)} | ${userId.padEnd(userIdWidth)} | ${environment.padEnd(envWidth)} | ${createdDate}`);
  });
  
  console.log('');
  console.log(`Total: ${accounts.length} account${accounts.length === 1 ? '' : 's'}`);
}

/**
 * Handle account add command
 */
async function handleAccountAdd(name: string, options: any): Promise<void> {
  try {
    const { appId, appSecret, userId, env: environment, baseUrl } = options;
    
    // Debug output removed
    
    // Validate required parameters
    if (!appId) {
      console.error('❌ Error: --app-id is required');
      console.log('');
      console.log('Usage: polyv-live-cli account add <name> --app-id <id> --app-secret <secret> [options]');
      console.log('Options: --user-id <uid> --env <env> --base-url <url>');
      process.exit(1);
    }
    
    if (!appSecret) {
      console.error('❌ Error: --app-secret is required');
      console.log('');
      console.log('Usage: polyv-live-cli account add <name> --app-id <id> --app-secret <secret> [options]');
      console.log('Options: --user-id <uid> --env <env> --base-url <url>');
      process.exit(1);
    }
    
    // Validate environment if provided
    if (environment && !['development', 'production', 'test', 'custom'].includes(environment)) {
      console.error('❌ Error: --env must be one of: development, production, test, custom');
      process.exit(1);
    }
    
    // Validate baseUrl if provided
    if (baseUrl && !baseUrl.match(/^https?:\/\/.+/)) {
      console.error('❌ Error: --base-url must be a valid HTTP(S) URL');
      process.exit(1);
    }
    
    // If baseUrl is provided, set environment to custom
    const effectiveEnvironment = baseUrl ? 'custom' : environment;

    const manager = new AccountConfigManager();
    const result = manager.addAccount(name, appId, appSecret, userId, effectiveEnvironment, baseUrl);
    
    if (result.success) {
      console.log('✅ ' + result.message);
      console.log('');
      console.log('Account details:');
      console.log(`  Name: ${name}`);
      console.log(`  App ID: ${appId}`);
      if (userId) {
        console.log(`  User ID: ${userId}`);
      }
      if (effectiveEnvironment) {
        console.log(`  Environment: ${effectiveEnvironment}`);
      }
      if (baseUrl) {
        console.log(`  Base URL: ${baseUrl}`);
      } else if (effectiveEnvironment && effectiveEnvironment !== 'custom') {
        // Import environment URLs
        const { ENVIRONMENT_BASE_URLS } = await import('../types/account.types');
        console.log(`  Base URL: ${ENVIRONMENT_BASE_URLS[effectiveEnvironment as keyof typeof ENVIRONMENT_BASE_URLS] || 'https://api.polyv.net'}`);
      }
      console.log(`  Config file: ${manager.getConfigPath()}`);
    } else {
      console.error('❌ ' + result.message);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Failed to add account:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

/**
 * Handle account remove command
 */
async function handleAccountRemove(name: string, options: any): Promise<void> {
  try {
    const manager = new AccountConfigManager();
    
    // Check if account exists
    if (!manager.accountExists(name)) {
      console.error(`❌ Account '${name}' not found.`);
      console.log('');
      console.log('Use "polyv-live-cli account list" to see available accounts.');
      process.exit(1);
    }
    
    // Confirm deletion unless --force is used
    if (!options.force) {
      const rl = createReadlineInterface();
      const confirmed = await promptConfirmation(rl, `Are you sure you want to remove account '${name}'?`);
      rl.close();
      
      if (!confirmed) {
        console.log('❌ Account removal cancelled.');
        return;
      }
    }
    
    const result = manager.removeAccount(name);
    
    if (result.success) {
      console.log('✅ ' + result.message);
    } else {
      console.error('❌ ' + result.message);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Failed to remove account:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

/**
 * Handle account list command
 */
async function handleAccountList(options: AccountListOptions): Promise<void> {
  try {
    const manager = new AccountConfigManager();
    const accounts = manager.listAccounts();
    
    if (options.output === 'json') {
      console.log(JSON.stringify(accounts, null, 2));
    } else {
      formatAccountTable(accounts);
    }
  } catch (error) {
    console.error('❌ Failed to list accounts:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

/**
 * Handle account migrate command
 */
async function handleAccountMigrate(options: any): Promise<void> {
  try {
    const accountManager = new AccountConfigManager();
    
    // Check if old config exists
    if (!globalConfig.exists()) {
      console.log('📋 No legacy configuration found.');
      console.log('');
      console.log('Legacy config file: ' + globalConfig.getConfigPath());
      console.log('Use "polyv-live-cli account add <name>" to add new accounts.');
      return;
    }
    
    // Load old config
    const oldConfig = globalConfig.load();
    
    // Validate old config
    const validation = globalConfig.validate(oldConfig);
    if (!validation.isValid) {
      console.error('❌ Legacy configuration is incomplete.');
      console.error('Missing required fields:', validation.missingKeys.join(', '));
      console.log('');
      console.log('Please fix the legacy configuration first or remove it:');
      console.log(`  Legacy config file: ${globalConfig.getConfigPath()}`);
      process.exit(1);
    }
    
    // Generate account name from appId
    const accountName = options.name || `legacy_${oldConfig.appId}`;
    
    // Check if account already exists
    if (accountManager.accountExists(accountName)) {
      console.error(`❌ Account '${accountName}' already exists.`);
      console.log('');
      console.log('Use a different name with --name option or remove the existing account first:');
      console.log(`  polyv-live-cli account remove ${accountName}`);
      process.exit(1);
    }
    
    // Confirm migration unless --force is used
    if (!options.force) {
      const rl = createReadlineInterface();
      
      console.log('🔄 Legacy Configuration Migration');
      console.log('');
      console.log('Found legacy configuration:');
      console.log(`  App ID: ${oldConfig.appId}`);
      console.log(`  User ID: ${oldConfig.userId || '(not set)'}`);
      console.log(`  Base URL: ${oldConfig.baseUrl || '(default)'}`);
      console.log('');
      console.log(`Will create new account: ${accountName}`);
      console.log('');
      
      const confirmed = await promptConfirmation(rl, 'Do you want to migrate this configuration?');
      rl.close();
      
      if (!confirmed) {
        console.log('❌ Migration cancelled.');
        return;
      }
    }
    
    // Migrate configuration
    const result = accountManager.addAccount(
      accountName,
      oldConfig.appId!,
      oldConfig.appSecret!,
      oldConfig.userId
    );
    
    if (!result.success) {
      console.error('❌ Failed to migrate account:', result.message);
      process.exit(1);
    }
    
    console.log('✅ ' + result.message);
    console.log('');
    console.log('Migration details:');
    console.log(`  New account name: ${accountName}`);
    console.log(`  App ID: ${oldConfig.appId}`);
    if (oldConfig.userId) {
      console.log(`  User ID: ${oldConfig.userId}`);
    }
    console.log(`  Config file: ${accountManager.getConfigPath()}`);
    console.log('');
    
    // Option to remove old config
    if (!options.keepLegacy) {
      const rl = createReadlineInterface();
      const shouldRemove = await promptConfirmation(rl, 'Remove legacy configuration file?');
      rl.close();
      
      if (shouldRemove) {
        const configPath = globalConfig.getConfigPath();
        if (existsSync(configPath)) {
          unlinkSync(configPath);
          console.log('✅ Legacy configuration file removed.');
        } else {
          console.log('✅ Legacy configuration already removed.');
        }
        console.log('');
      }
    }
    
    console.log('Migration completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log(`  1. Use: polyv-live-cli use ${accountName}`);
    console.log('  2. Test: polyv-live-cli account current');
    
  } catch (error) {
    console.error('❌ Failed to migrate account:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

/**
 * Handle account set-default command
 */
async function handleAccountSetDefault(accountName: string): Promise<void> {
  try {
    const accountManager = new AccountConfigManager();
    const result = accountManager.setDefaultAccount(accountName);
    
    if (result.success) {
      console.log('✅ ' + result.message);
    } else {
      console.error('❌ ' + result.message);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Failed to set default account:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

/**
 * Handle account unset-default command
 */
async function handleAccountUnsetDefault(): Promise<void> {
  try {
    const accountManager = new AccountConfigManager();
    const result = accountManager.unsetDefaultAccount();
    
    if (result.success) {
      console.log('✅ ' + result.message);
    } else {
      console.error('❌ ' + result.message);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Failed to unset default account:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

/**
 * Handle account current command
 */
async function handleAccountCurrent(): Promise<void> {
  try {
    const accountManager = new AccountConfigManager();
    const sessionManager = new SessionStateManager(accountManager);
    
    console.log('📋 Current Account Status:');
    console.log('');
    
    // Get current session account
    const sessionAccount = sessionManager.getCurrentSessionAccount();
    const sessionState = sessionManager.getSessionState();
    
    if (sessionAccount) {
      console.log('🎯 Current Session Account:');
      console.log(`  账号名称: ${sessionAccount}`);
      
      if (sessionState) {
        const setTime = sessionState.setAt.toLocaleString('zh-CN');
        console.log(`  设置时间: ${setTime}`);
        
        if (sessionState.expiresAt) {
          const expireTime = sessionState.expiresAt.toLocaleString('zh-CN');
          console.log(`  过期时间: ${expireTime}`);
        }
        
        console.log(`  终端ID: ${sessionState.terminalId}`);
        console.log(`  进程ID: ${sessionState.processId}`);
      }
      
      // Verify account still exists
      if (!accountManager.accountExists(sessionAccount)) {
        console.log('  ⚠️  警告: 当前会话账号在配置中不存在');
      }
      
      console.log('');
    }
    
    // Show authentication source
    const authSource = sessionManager.getAuthSource();
    console.log('🔐 Authentication Source:');
    const sourceDesc = authSource.accountName 
      ? `${authSource.description} (${authSource.accountName})`
      : authSource.description;
    console.log(`  来源: ${sourceDesc}`);
    console.log(`  优先级: ${authSource.priority}`);
    console.log('');
    
    // Show default account
    const defaultAccount = accountManager.getDefaultAccount();
    if (defaultAccount) {
      console.log('🌟 Default Account:');
      console.log(`  账号名称: ${defaultAccount}`);
      
      // Verify default account still exists
      if (!accountManager.accountExists(defaultAccount)) {
        console.log('  ⚠️  警告: 默认账号在配置中不存在');
      }
      
      console.log('');
    }

    // Show available accounts
    const accounts = accountManager.listAccounts();
    console.log('📝 Available Accounts:');
    
    if (accounts.length === 0) {
      console.log('  没有配置任何账号。');
      console.log('');
      console.log('使用 "polyv-live-cli account add <name>" 添加账号。');
    } else {
      accounts.forEach(account => {
        const isCurrent = account.name === sessionAccount;
        const isDefault = account.name === defaultAccount;
        
        let marker = '';
        if (isCurrent && isDefault) {
          marker = ' (当前会话, 默认)';
        } else if (isCurrent) {
          marker = ' (当前会话)';
        } else if (isDefault) {
          marker = ' (默认)';
        }
        
        const createdDate = new Date(account.createdAt).toLocaleDateString('zh-CN');
        console.log(`  • ${account.name}${marker}`);
        console.log(`    App ID: ${account.appId}`);
        if (account.userId) {
          console.log(`    User ID: ${account.userId}`);
        }
        console.log(`    创建时间: ${createdDate}`);
      });
      console.log('');
      
      if (!sessionAccount && !defaultAccount) {
        console.log('使用 "polyv-live-cli use <account-name>" 切换到指定账号。');
        console.log('或使用 "polyv-live-cli account set-default <account-name>" 设置默认账号。');
      } else if (!sessionAccount && defaultAccount) {
        console.log('使用 "polyv-live-cli use <account-name>" 切换到指定账号。');
      }
    }
    
    // Show session directory info
    console.log('📁 Session Information:');
    console.log(`  会话目录: ${sessionManager.getSessionDir()}`);
    console.log(`  环境变量: ${sessionManager.getEnvVarName()}`);
    
  } catch (error) {
    console.error('❌ Failed to get current account:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

/**
 * Register account management commands
 */
export function registerAccountCommands(program: Command): void {
  const accountCmd = program
    .command('account')
    .description('Manage PolyV account configurations');

  // Add account command
  accountCmd
    .command('add <name>')
    .description('Add a new account configuration')
    .requiredOption('--app-id <id>', 'PolyV application ID')
    .requiredOption('--app-secret <secret>', 'PolyV application secret')
    .option('--user-id <uid>', 'Optional user ID')
    .option('--env <env>', 'Environment type (development|production|test|custom)')
    .option('--base-url <url>', 'Custom base URL (sets environment to custom)')
    .action(handleAccountAdd);

  // Remove account command
  accountCmd
    .command('remove <name>')
    .description('Remove an account configuration')
    .option('--force', 'Skip confirmation prompt')
    .action(handleAccountRemove);

  // List accounts command
  accountCmd
    .command('list')
    .description('List all configured accounts')
    .option('--output <format>', 'Output format (table|json)', validateOutputFormat, 'table')
    .action(handleAccountList);

  // Current account command
  accountCmd
    .command('current')
    .description('Show current account information')
    .action(handleAccountCurrent);

  // Migrate command
  accountCmd
    .command('migrate')
    .description('Migrate legacy configuration to new account system')
    .option('--name <name>', 'Name for the migrated account (default: legacy_<appId>)')
    .option('--force', 'Skip confirmation prompts')
    .option('--keep-legacy', 'Keep legacy configuration file after migration')
    .action(handleAccountMigrate);

  // Set default account command
  accountCmd
    .command('set-default <name>')
    .description('Set an account as the default account')
    .action(handleAccountSetDefault);

  // Unset default account command
  accountCmd
    .command('unset-default')
    .description('Remove the current default account setting')
    .action(handleAccountUnsetDefault);
}
