/**
 * @fileoverview Configuration commands for polyv-live-cli
 * @author Development Team  
 * @since 1.1.0
 */

import { Command } from 'commander';
import { globalConfig, GlobalConfig } from '../config/global';
import { createInterface } from 'readline';
import { validateOutputFormat } from '../types/config';

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
 * Prompt user for input with validation
 */
function promptInput(rl: any, question: string, required: boolean = false): Promise<string> {
  return new Promise((resolve) => {
    const ask = () => {
      rl.question(question, (answer: string) => {
        const trimmed = answer.trim();
        if (required && !trimmed) {
          console.log('❌ This field is required. Please try again.');
          ask();
        } else {
          resolve(trimmed);
        }
      });
    };
    ask();
  });
}

/**
 * Interactive configuration setup
 */
async function interactiveConfig(): Promise<void> {
  const rl = createReadlineInterface();
  
  console.log('🔧 PolyV Live CLI Configuration');
  console.log('Please provide your PolyV API credentials:');
  console.log('');
  
  try {
    // Load existing config
    const existingConfig = globalConfig.load();
    
    // App ID (required)
    const currentAppId = existingConfig.appId ? ` (current: ${existingConfig.appId})` : '';
    const appId = await promptInput(
      rl, 
      `📱 App ID${currentAppId}: `, 
      !existingConfig.appId
    ) || existingConfig.appId;
    
    // App Secret (required)
    const currentAppSecret = existingConfig.appSecret ? ' (current: ***hidden***)' : '';
    const appSecret = await promptInput(
      rl, 
      `🔐 App Secret${currentAppSecret}: `, 
      !existingConfig.appSecret
    ) || existingConfig.appSecret;
    
    // User ID (optional)
    const currentUserId = existingConfig.userId ? ` (current: ${existingConfig.userId})` : '';
    const userId = await promptInput(
      rl, 
      `👤 User ID (optional)${currentUserId}: `, 
      false
    ) || existingConfig.userId;
    
    // Base URL (optional)
    const currentBaseUrl = existingConfig.baseUrl ? ` (current: ${existingConfig.baseUrl})` : '';
    const baseUrl = await promptInput(
      rl, 
      `🌐 Base URL (optional)${currentBaseUrl}: `, 
      false
    ) || existingConfig.baseUrl;
    
    rl.close();
    
    // Save configuration
    const newConfig: GlobalConfig = {};
    if (appId) newConfig.appId = appId;
    if (appSecret) newConfig.appSecret = appSecret;
    if (userId) newConfig.userId = userId;
    if (baseUrl) newConfig.baseUrl = baseUrl;
    
    globalConfig.save(newConfig);
    
    console.log('');
    console.log('✅ Configuration saved successfully!');
    console.log(`📁 Config file: ${globalConfig.getConfigPath()}`);
    
    // Validate configuration
    const validation = globalConfig.validate();
    if (validation.isValid) {
      console.log('✅ Configuration is valid and ready to use!');
    } else {
      console.log('⚠️  Configuration is incomplete. Missing:', validation.missingKeys.join(', '));
    }
    
  } catch (error) {
    rl.close();
    throw error;
  }
}

/**
 * Show current configuration
 */
function showConfig(options: { output?: string }): void {
  const config = globalConfig.load();
  const configPath = globalConfig.getConfigPath();
  
  if (options.output === 'json') {
    // For JSON output, mask sensitive data
    const maskedConfig = {
      ...config,
      appSecret: config.appSecret ? '***hidden***' : undefined
    };
    console.log(JSON.stringify(maskedConfig, null, 2));
    return;
  }
  
  // Table format
  console.log('🔧 PolyV Live CLI Configuration');
  console.log('');
  console.log(`📁 Config file: ${configPath}`);
  console.log('');
  
  if (Object.keys(config).length === 0) {
    console.log('⚠️  No configuration found. Run `polyv-live-cli config set` to configure.');
    return;
  }
  
  console.log('Current settings:');
  console.log(`📱 App ID: ${config.appId || '(not set)'}`);
  console.log(`🔐 App Secret: ${config.appSecret ? '***hidden***' : '(not set)'}`);
  console.log(`👤 User ID: ${config.userId || '(not set)'}`);
  console.log(`🌐 Base URL: ${config.baseUrl || '(default)'}`);
  
  // Validation status
  const validation = globalConfig.validate();
  console.log('');
  if (validation.isValid) {
    console.log('✅ Configuration is valid and ready to use!');
  } else {
    console.log('❌ Configuration is incomplete. Missing:', validation.missingKeys.join(', '));
    console.log('Run `polyv-live-cli config set` to complete configuration.');
  }
}

/**
 * Set a specific configuration value
 */
function setConfigValue(key: string, value: string): void {
  const validKeys = ['appId', 'appSecret', 'userId', 'baseUrl'];
  
  if (!validKeys.includes(key)) {
    console.error(`❌ Invalid config key: ${key}`);
    console.error(`Valid keys are: ${validKeys.join(', ')}`);
    process.exit(1);
  }
  
  globalConfig.set(key as keyof GlobalConfig, value);
  console.log(`✅ Set ${key} = ${key === 'appSecret' ? '***hidden***' : value}`);
}

/**
 * Get a specific configuration value
 */
function getConfigValue(key: string): void {
  const validKeys = ['appId', 'appSecret', 'userId', 'baseUrl'];
  
  if (!validKeys.includes(key)) {
    console.error(`❌ Invalid config key: ${key}`);
    console.error(`Valid keys are: ${validKeys.join(', ')}`);
    process.exit(1);
  }
  
  const value = globalConfig.get(key as keyof GlobalConfig);
  if (value === undefined) {
    console.log(`${key}: (not set)`);
  } else {
    console.log(`${key}: ${key === 'appSecret' ? '***hidden***' : value}`);
  }
}

/**
 * Remove a specific configuration value
 */
function unsetConfigValue(key: string): void {
  const validKeys = ['appId', 'appSecret', 'userId', 'baseUrl'];
  
  if (!validKeys.includes(key)) {
    console.error(`❌ Invalid config key: ${key}`);
    console.error(`Valid keys are: ${validKeys.join(', ')}`);
    process.exit(1);
  }
  
  globalConfig.unset(key as keyof GlobalConfig);
  console.log(`✅ Unset ${key}`);
}

/**
 * Clear all configuration
 */
function clearConfig(): void {
  globalConfig.clear();
}

/**
 * Register config commands
 */
export function registerConfigCommands(program: Command): void {
  const config = program
    .command('config')
    .description('Manage PolyV API configuration');

  // Interactive configuration
  config
    .command('set')
    .description('Set configuration interactively')
    .action(async () => {
      try {
        await interactiveConfig();
      } catch (error) {
        console.error('❌ Configuration failed:', error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
      }
    });

  // Show configuration
  config
    .command('show')
    .description('Show current configuration')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => {
      try {
        showConfig(options);
      } catch (error) {
        console.error('❌ Failed to show configuration:', error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
      }
    });

  // Set specific value
  config
    .command('get <key>')
    .description('Get a specific configuration value')
    .action((key) => {
      try {
        getConfigValue(key);
      } catch (error) {
        console.error('❌ Failed to get configuration:', error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
      }
    });

  // Set specific value
  config
    .command('put <key> <value>')
    .description('Set a specific configuration value')
    .action((key, value) => {
      try {
        setConfigValue(key, value);
      } catch (error) {
        console.error('❌ Failed to set configuration:', error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
      }
    });

  // Unset specific value
  config
    .command('unset <key>')
    .description('Remove a specific configuration value')
    .action((key) => {
      try {
        unsetConfigValue(key);
      } catch (error) {
        console.error('❌ Failed to unset configuration:', error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
      }
    });

  // Clear all configuration
  config
    .command('clear')
    .description('Clear all configuration')
    .action(() => {
      try {
        clearConfig();
      } catch (error) {
        console.error('❌ Failed to clear configuration:', error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
      }
    });

  // Add help examples
  config.addHelpText('after', `
Examples:
  polyv-live-cli config set                    # Interactive configuration setup
  polyv-live-cli config show                   # Show current configuration
  polyv-live-cli config show --output json     # Show configuration in JSON format
  polyv-live-cli config get appId              # Get specific configuration value
  polyv-live-cli config put appId your_app_id  # Set specific configuration value
  polyv-live-cli config unset userId           # Remove specific configuration value
  polyv-live-cli config clear                  # Clear all configuration
`);
}