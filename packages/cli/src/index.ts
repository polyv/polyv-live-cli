#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { join } from 'path';
import { handleUncaughtError, handleUnhandledRejection, logError } from './utils/errors';
import { configManager } from './config/manager';
import { AppConfig } from './types/config';
import { CONFIG_CLI_OPTIONS } from './types/config';
import { registerChannelCommands } from './commands/channel.commands';
import { registerStreamCommands } from './commands/stream.commands';
import { registerProductCommands } from './commands/product.commands';
import { registerMonitorCommands } from './commands/monitor.commands';
import { registerAccountCommands } from './commands/account.commands';
import { registerUseCommand } from './commands/use.commands';
import { registerCouponCommands } from './commands/coupon.commands';
import { registerSetupCommand } from './commands/setup.commands';
import { registerStatisticsCommands } from './commands/statistics.commands';
import { registerStatisticsExportCommands } from './commands/statistics.commands.export';
import { registerPlayerCommands } from './commands/player.commands';
import { registerPlaybackCommands } from './commands/playback.commands';
import { registerDocumentCommands } from './commands/document.commands';
import { registerSessionCommands } from './commands/session.commands';
import { registerRecordCommands } from './commands/record.commands';
import { registerChatCommands } from './commands/chat.commands';
import { registerCheckinCommands } from './commands/checkin.commands';
import { registerQaCommands } from './commands/qa.commands';
import { registerQuestionnaireCommands } from './commands/questionnaire.commands';
import { registerLotteryCommands } from './commands/lottery.commands';
import { registerDonateCommands } from './commands/donate.commands';
import { registerViewerCommands } from './commands/viewer.commands';
import { registerWatchConditionCommands } from './commands/watch-condition.commands';
import { registerWhitelistCommands } from './commands/whitelist.commands';
import { registerPlatformCommands } from './commands/platform.commands';
import { registerPromotionCommands } from './commands/promotion.commands';
import { registerCardPushCommands } from './commands/card-push.commands';
import { registerTransmitCommands } from './commands/transmit.commands';
import { registerAiCommands } from './commands/ai.commands';

// Global error handlers
process.on('uncaughtException', handleUncaughtError);
process.on('unhandledRejection', handleUnhandledRejection);

function getVersion(): string {
  try {
    const packagePath = join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
    return packageJson.version;
  } catch (error) {
    console.error('Failed to read version from package.json');
    return '1.0.0';
  }
}

/**
 * Configuration middleware that loads and validates complete app config
 * @param program Commander program instance with parsed options
 * @returns AppConfig if valid, or exits process on error
 */
async function loadAndValidateConfig(program: Command): Promise<AppConfig | null> {
  try {
    const options = program.opts();
    const configResult = await configManager.load({
      cliOptions: options,
    });
    
    // Log config status for debugging (non-sensitive info only)
    if (configResult.config.debug) {
      console.log('Configuration loaded successfully');
      console.log(`Environment: ${configResult.config.environment}`);
      console.log(`Base URL: ${configResult.config.baseUrl}`);
      console.log(`Timeout: ${configResult.config.timeout}ms`);
      console.log(`Max Retries: ${configResult.config.maxRetries}`);
      console.log(`Loaded .env files: ${configResult.loadedEnvFiles.length}`);
      if (configResult.loadedEnvFiles.length > 0) {
        configResult.loadedEnvFiles.forEach(file => console.log(`  - ${file}`));
      }
    }
    
    return configResult.config;
  } catch (error) {
    // Check if this is a help/version command
    const args = process.argv.slice(2);
    const isHelpOrVersion = args.some(arg => 
      arg === '--help' || arg === '-h' || arg === '--version' || arg === '-v'
    );
    
    // For help/version commands, silently return null
    if (isHelpOrVersion) {
      return null;
    }
    
    // For all other cases, re-throw the error to be handled by caller
    throw error;
  }
}

function showQuickHelp(): void {
  console.log(`Usage: polyv-live-cli [options] [command]

CLI tool for managing PolyV live streaming services

Commands:
  account               Manage account configurations
  use                   Switch session account
  channel               Manage live channels
  stream                Stream operations
  product               Manage channel products
  coupon                Manage coupons
  setup                 Initialize a scene with predefined resources
  monitor               Live monitoring dashboard
  statistics            View live streaming statistics data

Quick Start:
  $ polyv-live-cli account add <name> --app-id <id> --app-secret <secret>  # Add account
  $ polyv-live-cli use <name>        # Switch to account
  $ polyv-live-cli channel list -a <name>  # Use specific account (short)
  $ polyv-live-cli channel --help    # Channel operations
  $ polyv-live-cli stream --help     # Stream operations
  $ polyv-live-cli setup e-commerce  # Initialize e-commerce scene

Run 'polyv-live-cli --help' for full help or 'polyv-live-cli <command> --help' for command help.`);
}

async function main(): Promise<void> {
  const program = new Command();

  program
    .name('polyv-live-cli')
    .description('CLI tool for managing PolyV live streaming services')
    .version(getVersion(), '-v, --version', 'display version number')
    .helpOption('-h, --help', 'display help for command');

  // Configure help display
  program.configureHelp({
    helpWidth: 80,
    sortSubcommands: true,
  });

  // Global authentication options
  program
    .option('--appId <id>', 'PolyV application ID')
    .option('--appSecret <secret>', 'PolyV application secret')
    .option('--userId <id>', 'PolyV user ID (optional)')
    .option('-a, --account <name>', 'use specific account configuration')
    .option('--verbose', 'show authentication source information');

  // Global configuration options
  program
    .option(`--${CONFIG_CLI_OPTIONS.ENVIRONMENT} <env>`, 'environment (development|production|test)')
    .option(`--${CONFIG_CLI_OPTIONS.DEBUG}`, 'enable debug mode')
    .option(`--${CONFIG_CLI_OPTIONS.TIMEOUT} <ms>`, 'API timeout in milliseconds')
    .option(`--${CONFIG_CLI_OPTIONS.BASE_URL} <url>`, 'API base URL')
    .option(`--${CONFIG_CLI_OPTIONS.MAX_RETRIES} <num>`, 'maximum retry attempts')
    .option(`--${CONFIG_CLI_OPTIONS.CONFIG_PATH} <path>`, 'custom configuration file path');

  // Register commands
  registerAccountCommands(program);
  registerUseCommand(program);
  registerChannelCommands(program);
  registerStreamCommands(program);
  registerProductCommands(program);
  registerMonitorCommands(program);
  registerCouponCommands(program);
  registerSetupCommand(program);
  registerStatisticsCommands(program);
  registerStatisticsExportCommands(program);
  registerPlayerCommands(program);
  registerPlaybackCommands(program);
  registerDocumentCommands(program);
  registerSessionCommands(program);
  registerRecordCommands(program);
  registerChatCommands(program);
  registerCheckinCommands(program);
  registerQaCommands(program);
  registerQuestionnaireCommands(program);
  registerLotteryCommands(program);
  registerDonateCommands(program);
  registerViewerCommands(program);
  registerWatchConditionCommands(program);
  registerWhitelistCommands(program);
  registerPlatformCommands(program);
  registerPromotionCommands(program);
  registerCardPushCommands(program);
  registerTransmitCommands(program);
  registerAiCommands(program);

  // Helper function to get all registered commands dynamically
  function getAllRegisteredCommands(): { topLevel: string[], subCommands: Map<string, string[]> } {
    const topLevel: string[] = [];
    const subCommands = new Map<string, string[]>();
    
    // Safely check if commands exist
    if (program.commands && Array.isArray(program.commands)) {
      program.commands.forEach(cmd => {
        topLevel.push(cmd.name());
        if (cmd.commands && cmd.commands.length > 0) {
          const subCmdNames = cmd.commands.map((subcmd: any) => subcmd.name());
          subCommands.set(cmd.name(), subCmdNames);
        }
      });
    }
    
    return { topLevel, subCommands };
  }

  // Add concise help text
  program.addHelpText('after', `
Quick Start:
  $ polyv-live-cli account add <name> --app-id <id> --app-secret <secret>  # Add account
  $ polyv-live-cli use <name>        # Switch to account
  $ polyv-live-cli channel --help    # Channel operations
  $ polyv-live-cli stream --help     # Stream operations
  $ polyv-live-cli product --help    # Product operations
  $ polyv-live-cli coupon --help     # Coupon operations
  $ polyv-live-cli setup --list      # List available scenes
  $ polyv-live-cli monitor --help    # Live monitoring dashboard

Authentication:
  - Use 'polyv-live-cli account add' to add accounts
  - Use 'polyv-live-cli use <name>' to switch accounts
  - Or use -a <name> or --account <name> to specify account for single command
  - Or use --appId and --appSecret parameters
  - Or set POLYV_APP_ID and POLYV_APP_SECRET environment variables
`);

  // Store reference for unknown command handling after auth
  let unknownCommand: string | null = null;
  
  // Handle unknown commands - store for later processing
  program.on('command:*', (args: string[]) => {
    unknownCommand = args[0] || null;
  });

  // Always use exitOverride to handle authentication validation
  program.exitOverride();
  
  const args = process.argv.slice(2);
  const isHelpOrVersion = args.some(arg => arg === '--help' || arg === '-h' || arg === '--version' || arg === '-v');
  
  // Handle no arguments case - show quick help and exit
  if (args.length === 0) {
    showQuickHelp();
    return;
  }
  
  // Check if this is a valid command that should execute normally
  const hasValidCommand = args.includes('channel') || args.includes('stream') || args.includes('product') || args.includes('coupon') || args.includes('setup') || args.includes('monitor') || args.includes('account') || args.includes('use') || args.includes('statistics') || args.includes('player') || args.includes('playback') || args.includes('document') || args.includes('session') || args.includes('record') || args.includes('chat') || args.includes('checkin') || args.includes('qa') || args.includes('questionnaire') || args.includes('lottery') || args.includes('donate') || args.includes('viewer') || args.includes('watch-condition') || args.includes('whitelist') || args.includes('platform') || args.includes('promotion') || args.includes('card-push') || args.includes('transmit') || args.includes('ai');
  if (hasValidCommand) {
    // Let Commander.js handle the command execution
    try {
      program.parse();
      return; // Exit here after successful command execution
    } catch (err: any) {
      // Handle commander.js exits
      if (err.code === 'commander.help' || err.code === 'commander.helpDisplayed' || err.code === 'commander.version') {
        process.exit(0);
      }
      
      if (err.code && err.code.startsWith('commander.')) {
        if (err.message && err.message !== '(outputHelp)') {
          console.error(err.message);
        }
        process.exit(err.exitCode || 1);
      }
      
      throw err;
    }
  }
  
  // Pre-parse validation: check for incomplete auth before Commander.js shows help
  if (!isHelpOrVersion && args.length > 0) {
    // Check if only global options are provided (no commands)
    const hasGlobalOptions = args.some(arg => 
      arg.startsWith('--appId') || arg.startsWith('--appSecret') || arg.startsWith('--userId') ||
      arg.startsWith('--environment') || arg.startsWith('--debug') || arg.startsWith('--timeout') ||
      arg.startsWith('--baseUrl') || arg.startsWith('--maxRetries') || arg.startsWith('--config')
    );
    
    const hasCommands = args.some(arg =>
      arg === 'channel' || arg === 'stream' || arg === 'product' || arg === 'coupon' || arg === 'setup' || arg === 'monitor' || arg === 'account' || arg === 'use' || arg === 'statistics' || arg === 'player' || arg === 'playback' || arg === 'document' || arg === 'session' || arg === 'checkin' || arg === 'help' || arg === 'watch-condition' || arg === 'whitelist' || arg === 'transmit'
    );
    
    // Check for any potential command (even unknown ones)
    const hasPotentialCommands = args.some(arg => {
      if (arg.startsWith('-')) return false;
      const argIndex = args.indexOf(arg);
      if (argIndex === 0) return true; // First argument and not an option
      const prevArg = args[argIndex - 1];
      if (!prevArg) return true;
      return !['--appId', '--appSecret', '--userId', '--environment', '--timeout', '--baseUrl', '--maxRetries', '--config'].includes(prevArg);
    });
    
    if (hasGlobalOptions && !hasCommands && !hasPotentialCommands) {
      // Manually parse auth options from args and environment
      let appId = '';
      let appSecret = '';
      let userId = '';
      
      // Parse from command line args
      for (let i = 0; i < args.length; i++) {
        if (args[i] === '--appId' && i + 1 < args.length) {
          appId = args[i + 1] || '';
        } else if (args[i] === '--appSecret' && i + 1 < args.length) {
          appSecret = args[i + 1] || '';
        } else if (args[i] === '--userId' && i + 1 < args.length) {
          userId = args[i + 1] || '';
        }
      }
      
      // Fall back to environment variables if not provided via CLI
      if (!appId) appId = process.env['POLYV_APP_ID'] || '';
      if (!appSecret) appSecret = process.env['POLYV_APP_SECRET'] || '';
      if (!userId) userId = process.env['POLYV_USER_ID'] || '';
      
      const hasAuthOptions = appId || appSecret || userId;
      
      if (hasAuthOptions && (!appId || !appSecret)) {
        // Check new account management system before showing error
        try {
          const { authAdapter } = require('./config/auth-adapter');
          const authResult = authAdapter.tryGetAuthConfig({});
          if (!authResult) {
            const statusMessage = authAdapter.getStatusMessage({});
            console.error(statusMessage);
            process.exit(1);
          }
        } catch (error) {
          console.error('Auth configuration is incomplete');
          process.exit(1);
        }
      }
      
      // If auth is complete or no auth options, continue with normal parsing
    }
  }
  
  // For other cases (no valid commands), parse normally and handle any issues
  try {
    program.parse();
  } catch (err: any) {
    // Handle commander.js exits for version
    if (err.code === 'commander.version') {
      process.exit(0);
    }

    // Handle commander.js exits
    if (err.code === 'commander.help' || err.code === 'commander.helpDisplayed') {
      // For explicit help commands, just show help
      if (isHelpOrVersion) {
        process.exit(0);
      }
      
      // Check if this was caused by an unknown command
      const registeredCommands = getAllRegisteredCommands();
      const allKnownCommands = new Set([
        ...registeredCommands.topLevel,
        ...Array.from(registeredCommands.subCommands.values()).flat(),
        'help' // Always include built-in help
      ]);
      
      const potentialUnknownCommand = args.find((arg, index) => {
        if (arg.startsWith('-')) return false;
        if (allKnownCommands.has(arg)) return false;
        
        // Check if it's a value for any option (including channel command options)
        if (index > 0) {
          const prevArg = args[index - 1];
          if (prevArg && prevArg.startsWith('--')) return false;
        }
        
        return true;
      });
      
      if (potentialUnknownCommand) {
        // For unknown commands, check authentication first
        try {
          await loadAndValidateConfig(program);
        } catch (configError) {
          // Show config error instead of unknown command error
          logError(configError instanceof Error ? configError : new Error(String(configError)));
          process.exit(1);
        }
        
        console.error(`Unknown command: ${potentialUnknownCommand}`);
        console.error('Run --help to see available commands');
        process.exit(1);
      }
      
      // For implicit help (invalid usage), check auth first
      // Check if this was caused by incomplete auth rather than just invalid usage
      const options = program.opts();
      const hasAuthOptions = options['appId'] || options['appSecret'] || options['userId'];
      
      if (hasAuthOptions && (!options['appId'] || !options['appSecret'])) {
        // Check new account management system before showing error
        try {
          const { authAdapter } = require('./config/auth-adapter');
          const authResult = authAdapter.tryGetAuthConfig(options);
          if (!authResult) {
            const statusMessage = authAdapter.getStatusMessage(options);
            console.error(statusMessage);
            process.exit(1);
          }
        } catch (error) {
          console.error('Auth configuration is incomplete');
          process.exit(1);
        }
      }
      
      // Commander.js expects us to handle the help display
      showQuickHelp();
      process.exit(0);
    }
    
    if (err.code === 'commander.version') {
      process.exit(0);
    }
    
    // Handle other commander errors
    if (err.code && err.code.startsWith('commander.')) {
      if (err.message && err.message !== '(outputHelp)') {
        console.error(err.message);
      }
      process.exit(err.exitCode || 1);
    }
    
    throw err;
  }

  // If parsing succeeded, we need to handle the case where no command was matched
  // This happens when there are arguments but no valid command

  // Check if only global options are provided (no commands)
  const hasOnlyGlobalOptions = args.every(arg => {
    // If it's an option flag, check if it's a global option
    if (arg.startsWith('-')) {
      return arg.startsWith('--appId') || arg.startsWith('--appSecret') || arg.startsWith('--userId') ||
             arg.startsWith('--environment') || arg.startsWith('--debug') || arg.startsWith('--timeout') ||
             arg.startsWith('--baseUrl') || arg.startsWith('--maxRetries') || arg.startsWith('--config');
    }
    
    // If it's not an option flag, check if it's a value for a preceding global option
    const argIndex = args.indexOf(arg);
    if (argIndex > 0) {
      const prevArg = args[argIndex - 1];
      return prevArg === '--appId' || prevArg === '--appSecret' || prevArg === '--userId' ||
             prevArg === '--environment' || prevArg === '--timeout' || 
             prevArg === '--baseUrl' || prevArg === '--maxRetries' || prevArg === '--config';
    }
    
    // If it's the first argument and not an option, it's likely a command
    return false;
  });


  // If only global options provided, check auth first then show help
  if (hasOnlyGlobalOptions) {
    // Check if auth is incomplete - if so, show auth error instead of help
    const options = program.opts();
    const hasAuthOptions = options['appId'] || options['appSecret'] || options['userId'];
    
    
    if (hasAuthOptions && (!options['appId'] || !options['appSecret'])) {
      // Check new account management system before showing error
      try {
        const { authAdapter } = require('./config/auth-adapter');
        const authResult = authAdapter.tryGetAuthConfig(options);
        if (!authResult) {
          const statusMessage = authAdapter.getStatusMessage(options);
          console.error(statusMessage);
          process.exit(1);
        }
      } catch (error) {
        console.error('Auth configuration is incomplete');
        process.exit(1);
      }
    }
    
    showQuickHelp();
    return;
  }

  // Check for unknown commands (commands that are not global options)
  // Use dynamic command detection instead of hardcoded lists
  if (!unknownCommand) {
    const registeredCommands = getAllRegisteredCommands();
    
    unknownCommand = args.find((arg, index) => {
      if (arg.startsWith('-')) return false;
      
      // Top-level commands (including built-in help)
      if (registeredCommands.topLevel.includes(arg) || arg === 'help') return false;
      
      // Check if it's a valid subcommand in the correct context
      for (const [parentCmd, subCmds] of registeredCommands.subCommands) {
        if (subCmds.includes(arg)) {
          // Check if this subcommand is in the correct context (preceded by its parent)
          if (index > 0 && args[index - 1] === parentCmd) {
            return false; // Valid subcommand
          }
          // If not preceded by correct parent, it's an unknown top-level command
          return true;
        }
      }
      
      // Check if it's a value for any option (including channel command options)
      if (index > 0) {
        const prevArg = args[index - 1];
        if (prevArg && prevArg.startsWith('--')) return false;
      }
      
      return true;
    }) || null;
  }

  if (unknownCommand) {
    // For unknown commands, check authentication first
    const options = program.opts();
    
    // Check overall auth completeness (combination of CLI and env)
    const appId = options['appId'] || process.env['POLYV_APP_ID'];
    const appSecret = options['appSecret'] || process.env['POLYV_APP_SECRET'];
    
    // If we have any auth-related options but appId or appSecret is missing, show auth error
    const hasAnyAuthOptions = options['appId'] || options['appSecret'] || options['userId'] || 
                             process.env['POLYV_APP_ID'] || process.env['POLYV_APP_SECRET'] || process.env['POLYV_USER_ID'];
    
    if (hasAnyAuthOptions && (!appId || !appSecret)) {
      // Check new account management system before showing error
      try {
        const { authAdapter } = require('./config/auth-adapter');
        const authResult = authAdapter.tryGetAuthConfig(options);
        if (!authResult) {
          const statusMessage = authAdapter.getStatusMessage(options);
          console.error(statusMessage);
          process.exit(1);
        }
      } catch (error) {
        console.error('Auth configuration is incomplete');
        process.exit(1);
      }
    }
    
    // If no auth options at all, check new account management system
    if (!hasAnyAuthOptions) {
      try {
        const { authAdapter } = require('./config/auth-adapter');
        const authResult = authAdapter.tryGetAuthConfig(options);
        if (!authResult) {
          const statusMessage = authAdapter.getStatusMessage(options);
          console.error(statusMessage);
          process.exit(1);
        }
      } catch (error) {
        console.error('Auth configuration is incomplete');
        process.exit(1);
      }
    }
    
    console.error(`Unknown command: ${unknownCommand}`);
    console.error('Run --help to see available commands');
    process.exit(1);
  }

  // Load and validate configuration for non-help commands
  if (!isHelpOrVersion) {
    // Check if we have any actual commands
    const hasActualCommands = args.some(arg =>
      arg === 'channel' || arg === 'stream' || arg === 'product' || arg === 'coupon' || arg === 'setup' || arg === 'monitor' || arg === 'account' || arg === 'use' || arg === 'statistics' || arg === 'player' || arg === 'playback' || arg === 'document' || arg === 'session' || arg === 'checkin' || arg === 'whitelist' ||
      arg.startsWith('channel ') || arg.startsWith('stream ') || arg.startsWith('product ') || arg.startsWith('coupon ') || arg.startsWith('setup ') || arg.startsWith('monitor ') || arg.startsWith('account ') || arg.startsWith('use ') || arg.startsWith('statistics ') || arg.startsWith('player ') || arg.startsWith('playback ') || arg.startsWith('document ') || arg.startsWith('session ') || arg.startsWith('checkin ') || arg.startsWith('whitelist ')
    );
    

    // Check for unknown commands first if no other valid commands
    if (unknownCommand && !hasActualCommands) {
      try {
        // Try to load config for better error messages when possible
        const config = await loadAndValidateConfig(program);
        if (!config) {
          // Config loading failed, but show unknown command error anyway
          console.error(`Unknown command: ${unknownCommand}`);
          console.error('Run --help to see available commands');
          process.exit(1);
        }
      } catch (configError) {
        // Show config error instead of unknown command error
        logError(configError instanceof Error ? configError : new Error(String(configError)));
        process.exit(1);
      }
      
      console.error(`Unknown command: ${unknownCommand}`);
      console.error('Run --help to see available commands');
      process.exit(1);
    }

    // If we have commands that need execution, the commands will handle config loading
    // This is because Commander.js action handlers run after parsing
    if (hasActualCommands) {
      // Commands will handle their own config loading and execution
      return;
    }
    
    // If no actual commands but not help/version, show quick help
    showQuickHelp();
  }
}

if (require.main === module) {
  main().catch(error => {
    logError(error);
    process.exit(1);
  });
}

// Helper function to extract commands for testing
export function extractCommands(program: Command): { topLevel: string[], subCommands: Map<string, string[]> } {
  const topLevel: string[] = [];
  const subCommands = new Map<string, string[]>();
  
  if (program.commands && Array.isArray(program.commands)) {
    program.commands.forEach(cmd => {
      topLevel.push(cmd.name());
      if (cmd.commands && cmd.commands.length > 0) {
        const subCmdNames = cmd.commands.map((subcmd: any) => subcmd.name());
        subCommands.set(cmd.name(), subCmdNames);
      }
    });
  }
  
  return { topLevel, subCommands };
}

export { main, loadAndValidateConfig, getVersion };