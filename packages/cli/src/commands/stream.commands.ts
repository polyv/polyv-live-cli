/**
 * @fileoverview Stream command definitions for CLI
 * @author Development Team
 * @since 3.1.0
 */

import { Command } from 'commander';
import { StreamHandler } from '../handlers/stream.handler';
import { StreamServiceConfig } from '../services/stream.service.sdk';
import { StreamGetKeyOptions, StreamPushOptions, StreamStartOptions, StreamStopOptions, StreamStatusOptions, StreamVerificationOptions, StreamMonitorOptions } from '../types/stream';
import { configManager } from '../config/manager';
import { authAdapter } from '../config/auth-adapter';
import { logError } from '../utils/errors';
import { AuthConfig } from '../types/auth';
import { parseStringList, validateYn } from '../utils/api-command';

/**
 * Load and prepare authentication and service configuration for stream commands
 */
async function loadAuthAndServiceConfig(parentOptions: any): Promise<{
  authConfig: any;
  serviceConfig: StreamServiceConfig;
  isVerbose: boolean;
  authSource?: string;
  accountName?: string;
}> {
  // Get authentication using new priority system first
  const authResult = authAdapter.tryGetAuthConfig(parentOptions);
  if (!authResult) {
    // Throw error with authentication guidance
    throw new Error(authAdapter.getStatusMessage(parentOptions));
  }

  // Load app configuration for service settings (try-catch to handle missing auth in old config)
  let configResult;
  try {
    configResult = await configManager.load({
      cliOptions: parentOptions,
    });
  } catch (error) {
    // If config loading fails due to auth, use defaults for service config
    if (error instanceof Error && error.message.includes('Auth configuration is incomplete')) {
      configResult = {
        config: {
          baseUrl: 'https://api.polyv.net',
          timeout: 30000,
          debug: false
        }
      };
    } else {
      throw error;
    }
  }

  // Create service configuration
  const serviceConfig: StreamServiceConfig = {
    baseUrl: configResult.config.baseUrl,
    timeout: configResult.config.timeout,
    debug: configResult.config.debug
  };

  // Display authentication source information if verbose
  const isVerbose = !!parentOptions.verbose;
  if (isVerbose) {
    console.log(`✅ Using authentication from: ${authResult.source}`);
    if (authResult.accountName) {
      console.log(`📋 Account: ${authResult.accountName}`);
    }
    console.log(''); // Empty line for spacing
  }

  const result: {
    authConfig: AuthConfig;
    serviceConfig: StreamServiceConfig;
    isVerbose: boolean;
    authSource?: string;
    accountName?: string;
  } = {
    authConfig: authResult.config,
    serviceConfig,
    isVerbose,
  };

  if (authResult.source) {
    result.authSource = authResult.source;
  }

  if (authResult.accountName) {
    result.accountName = authResult.accountName;
  }

  return result;
}

/**
 * Registers stream-related commands with the CLI program
 * @param program Commander.js program instance
 */
export function registerStreamCommands(program: Command): void {

  // Create stream command group
  const streamCmd = program.command('stream');
  streamCmd.description('Manage live streaming operations');

  async function withStreamHandler(action: (handler: StreamHandler) => Promise<void>): Promise<void> {
    try {
      const parentOptions = program.opts();
      const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(parentOptions);
      await action(new StreamHandler(authConfig, serviceConfig));
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)));
      process.exit(1);
    }
  }

  // Stream get-key command
  const getKeyCmd = streamCmd
    .command('get-key')
    .description('Get RTMP URL and stream key for a live channel')
    .requiredOption('-c, --channelId <id>', 'channel ID (required, must be a live channel)')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .option('-v, --verbose', 'show detailed authentication information')
    .action(async (options) => {
      try {
        // Load authentication and service configuration
        const parentOptions = program.opts();
        const combinedOptions = { ...parentOptions, ...options };
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(combinedOptions);

        // Create stream handler instance
        const streamHandler = new StreamHandler(authConfig, serviceConfig);

        // Transform commander options to handler options
        const streamOptions: StreamGetKeyOptions = {
          channelId: options.channelId,
          output: options.output
        };

        // Execute stream get-key operation
        await streamHandler.getStreamKey(streamOptions);

      } catch (error) {
        // Enhanced error handling with authentication context
        if (error instanceof Error && error.message.includes('Authentication')) {
          // Add authentication diagnostics for auth-related errors
          const diagnostics = authAdapter.getDiagnostics(program.opts());
          console.error('\n🔍 Authentication Diagnostics:');
          diagnostics.availableSources.forEach(source => {
            const status = source.appId && source.appSecret ? '✅' : '❌';
            console.error(`  ${status} ${source.metadata.source}: ${source.type}`);
          });
          if (diagnostics.errors.length > 0) {
            console.error('\n❌ Errors:');
            diagnostics.errors.forEach(error => console.error(`  - ${error}`));
          }
        }
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Add help text for stream get-key command
  getKeyCmd.addHelpText('after', `
Examples:
  $ polyv-live-cli stream get-key -c 3151318
  $ polyv-live-cli stream get-key -c 3151318 -o json
  $ polyv-live-cli stream get-key -c 3151318 -o table
  
Alternative (full parameter names):
  $ polyv-live-cli stream get-key -c 3151318 -o json

Requirements:
  • Channel must be in live streaming state
  • Valid authentication credentials required
  • Channel ID must exist and be accessible

Output Formats:
  table       Formatted table output with masked stream key (default)
  json        JSON format with full credentials (for programmatic use)

Security Notes:
  • Stream keys are sensitive credentials - keep them secure
  • Table format masks the stream key for security
  • JSON format shows full credentials - use carefully
  • Do not share stream keys in public channels or logs

Usage in OBS/Streaming Software:
  1. Copy the RTMP URL to your streaming software's server field
  2. Copy the stream key to your streaming software's key field
  3. Start streaming to begin live broadcast
`);

  streamCmd.command('hls-pull-url')
    .description('Get the channel monitor HLS pull URL')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withStreamHandler((handler) => handler.getHlsPullUrl(options)));

  // Stream start command
  const startCmd = streamCmd
    .command('start')
    .description('Start live streaming for a channel')
    .requiredOption('-c, --channelId <id>', 'channel ID (required)')
    .action(async (options) => {
      try {
        // Load authentication and service configuration
        const parentOptions = program.opts();
        const combinedOptions = { ...parentOptions, ...options };
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(combinedOptions);

        // Create stream handler instance
        const streamHandler = new StreamHandler(authConfig, serviceConfig);

        // Transform commander options to handler options
        const streamOptions: StreamStartOptions = {
          channelId: options.channelId
        };

        // Execute stream start operation
        await streamHandler.startStream(streamOptions);

      } catch (error) {
        // Enhanced error handling with authentication context
        if (error instanceof Error && error.message.includes('Authentication')) {
          // Add authentication diagnostics for auth-related errors
          const diagnostics = authAdapter.getDiagnostics(program.opts());
          console.error('\n🔍 Authentication Diagnostics:');
          diagnostics.availableSources.forEach(source => {
            const status = source.appId && source.appSecret ? '✅' : '❌';
            console.error(`  ${status} ${source.metadata.source}: ${source.type}`);
          });
          if (diagnostics.errors.length > 0) {
            console.error('\n❌ Errors:');
            diagnostics.errors.forEach(error => console.error(`  - ${error}`));
          }
        }
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Add help text for stream start command
  startCmd.addHelpText('after', `
Examples:
  $ polyv-live-cli stream start -c 3151318
  $ polyv-live-cli stream start -c 3151318 --appId <id> --appSecret <secret>

Requirements:
  • Channel must exist and be accessible
  • Valid authentication credentials required
  • User must have permission to start streams for the channel

Usage Notes:
  • This command sets the channel status to "live"
  • The actual streaming still requires OBS or other streaming software
  • Use 'stream get-key' to obtain streaming credentials after starting
  • Stream status changes do not trigger automatic callbacks

Expected Behavior:
  • Success: Channel status changes to live, confirmation displayed
  • Already Started: Command completes with informational message
  • Channel Not Found: Error message displayed with specific details
  • Permission Denied: Authentication or authorization error displayed
`);

  // Stream stop command
  const stopCmd = streamCmd
    .command('stop')
    .description('Stop live streaming for a channel')
    .requiredOption('-c, --channelId <id>', 'channel ID (required)')
    .action(async (options) => {
      try {
        // Load authentication and service configuration
        const parentOptions = program.opts();
        const combinedOptions = { ...parentOptions, ...options };
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(combinedOptions);

        // Create stream handler instance
        const streamHandler = new StreamHandler(authConfig, serviceConfig);

        // Transform commander options to handler options
        const streamOptions: StreamStopOptions = {
          channelId: options.channelId
        };

        // Execute stream stop operation
        await streamHandler.stopStream(streamOptions);

      } catch (error) {
        // Enhanced error handling with authentication context
        if (error instanceof Error && error.message.includes('Authentication')) {
          // Add authentication diagnostics for auth-related errors
          const diagnostics = authAdapter.getDiagnostics(program.opts());
          console.error('\n🔍 Authentication Diagnostics:');
          diagnostics.availableSources.forEach(source => {
            const status = source.appId && source.appSecret ? '✅' : '❌';
            console.error(`  ${status} ${source.metadata.source}: ${source.type}`);
          });
          if (diagnostics.errors.length > 0) {
            console.error('\n❌ Errors:');
            diagnostics.errors.forEach(error => console.error(`  - ${error}`));
          }
        }
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Add help text for stream stop command
  stopCmd.addHelpText('after', `
Examples:
  $ polyv-live-cli stream stop -c 3151318
  $ polyv-live-cli stream stop -c 3151318 --appId <id> --appSecret <secret>

Requirements:
  • Channel must exist and be accessible
  • Valid authentication credentials required
  • User must have permission to stop streams for the channel

Usage Notes:
  • This command sets the channel status to "stopped"
  • The streaming session will be terminated immediately
  • Use this command to end live broadcasts cleanly
  • Stream status changes do not trigger automatic callbacks

Expected Behavior:
  • Success: Channel status changes to stopped, confirmation displayed
  • Already Stopped: Command completes with informational message
  • Channel Not Found: Error message displayed with specific details
  • Permission Denied: Authentication or authorization error displayed
  • Not Live: Error if channel is not currently streaming
`);

  // Stream status command
  const statusCmd = streamCmd
    .command('status')
    .description('Get real-time status information for a live channel')
    .requiredOption('-c, --channelId <id>', 'channel ID (required)')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .option('-w, --watch', 'enable continuous monitoring (updates every 5 seconds)')
    .action(async (options) => {
      try {
        // Load authentication and service configuration
        const parentOptions = program.opts();
        const combinedOptions = { ...parentOptions, ...options };
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(combinedOptions);

        // Create stream handler instance
        const streamHandler = new StreamHandler(authConfig, serviceConfig);

        // Transform commander options to handler options
        const streamOptions: StreamStatusOptions = {
          channelId: options.channelId,
          output: options.output,
          watch: options.watch
        };

        // Execute stream status operation
        if (options.watch) {
          console.log('📺 Starting continuous monitoring (Press Ctrl+C to stop)...\n');
          
          // Set up continuous monitoring
          const updateInterval = setInterval(async () => {
            try {
              // Clear screen for better readability
              process.stdout.write('\x1Bc');
              console.log('📺 Live Stream Monitor - Press Ctrl+C to stop\n');
              
              await streamHandler.getStreamStatus(streamOptions);
              
              console.log(`\n⏱️  Last updated: ${new Date().toLocaleTimeString()}`);
              console.log('🔄 Updating in 5 seconds...');
            } catch (error) {
              console.error('❌ Error updating status:', error instanceof Error ? error.message : String(error));
            }
          }, 5000);

          // Handle Ctrl+C gracefully
          process.on('SIGINT', () => {
            clearInterval(updateInterval);
            console.log('\n\n👋 Monitoring stopped. Goodbye!');
            process.exit(0);
          });

          // Show initial status
          await streamHandler.getStreamStatus(streamOptions);
          console.log(`\n⏱️  Last updated: ${new Date().toLocaleTimeString()}`);
          console.log('🔄 Updating in 5 seconds...');
        } else {
          // One-time status check
          await streamHandler.getStreamStatus(streamOptions);
        }

      } catch (error) {
        // Enhanced error handling with authentication context
        if (error instanceof Error && error.message.includes('Authentication')) {
          // Add authentication diagnostics for auth-related errors
          const diagnostics = authAdapter.getDiagnostics(program.opts());
          console.error('\n🔍 Authentication Diagnostics:');
          diagnostics.availableSources.forEach(source => {
            const status = source.appId && source.appSecret ? '✅' : '❌';
            console.error(`  ${status} ${source.metadata.source}: ${source.type}`);
          });
          if (diagnostics.errors.length > 0) {
            console.error('\n❌ Errors:');
            diagnostics.errors.forEach(error => console.error(`  - ${error}`));
          }
        }
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Add help text for stream status command
  statusCmd.addHelpText('after', `
Examples:
  $ polyv-live-cli stream status -c 3151318
  $ polyv-live-cli stream status -c 3151318 -o json
  $ polyv-live-cli stream status -c 3151318 -w
  $ polyv-live-cli stream status -c 3151318 -w -o table
  
Alternative (full parameter names):
  $ polyv-live-cli stream status --channelId 3151318 --output json --watch

Requirements:
  • Channel must exist and be accessible
  • Valid authentication credentials required
  • No special permissions needed for status checking

Usage Notes:
  • Status command works for channels in any state (live, waiting, stopped)
  • Live channels show detailed performance metrics and network information
  • Watch mode refreshes status every 5 seconds automatically
  • Use Ctrl+C to stop watch mode
  • JSON output provides complete status data for programmatic use

Status Information Displayed:
  • Current streaming status (Live, Waiting, Stopped, Error)
  • Stream duration (for live streams)
  • Performance metrics (FPS, bandwidth, frame loss rate)
  • Network information (deploy address, input address, stream name)
  • Error details (if applicable)
  • Last update timestamp

Output Formats:
  table       Formatted table output with status icons (default)
  json        Complete JSON data for programmatic use

Watch Mode:
  • Continuously monitors stream status
  • Updates every 5 seconds automatically
  • Shows live performance metrics
  • Perfect for monitoring active streams
  • Press Ctrl+C to exit
`);

  const liveStatusCmd = streamCmd.command('live-status').description('Use historical live status APIs');
  liveStatusCmd.command('get')
    .description('Get live status by stream name')
    .requiredOption('--stream <stream>', 'stream name')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withStreamHandler(handler => handler.getLiveStatus(options)));
  liveStatusCmd.command('list')
    .description('Get live status for channel IDs')
    .requiredOption('--channel-ids <ids>', 'channel IDs, comma-separated', parseStringList)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withStreamHandler(handler => handler.getLiveStatusList(options)));

  streamCmd.command('streams')
    .description('Get stream monitor info for channel IDs')
    .requiredOption('--channel-ids <ids>', 'channel IDs, comma-separated', parseStringList)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withStreamHandler(handler => handler.getStreams(options)));

  streamCmd.command('capture')
    .description('Get current live capture image')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withStreamHandler(handler => handler.getCaptureImage(options)));

  const diskVideoCmd = streamCmd.command('disk-video').description('Manage pseudo-live disk videos');
  diskVideoCmd.command('list')
    .description('List pseudo-live disk videos')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('--page <page>', 'page number', parsePositiveInteger)
    .option('--page-size <size>', 'page size', parsePositiveInteger)
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withStreamHandler(handler => handler.listDiskVideo(options)));
  diskVideoCmd.command('add')
    .description('Configure pseudo-live disk videos')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--vids <ids>', 'VOD/material/record IDs, comma-separated', parseStringList)
    .option('--origin <origin>', 'video origin: vod|material|record', validateDiskVideoOrigin)
    .option('--start-times <times>', 'record start times, comma-separated', parseStringList)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withStreamHandler(handler => handler.addDiskVideos(options)));
  diskVideoCmd.command('delete')
    .description('Delete pseudo-live disk videos')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('--vids <ids>', 'VOD/material IDs, comma-separated', parseStringList)
    .option('--video-ids <ids>', 'disk video IDs, comma-separated', parseStringList)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withStreamHandler(handler => handler.deleteDiskVideos(options)));
  diskVideoCmd.command('end')
    .description('Stop current pseudo-live disk push')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--disk-video-id <id>', 'disk video ID')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withStreamHandler(handler => handler.endDiskPush(options)));

  streamCmd.command('ban-push')
    .description('Ban/cut off push stream')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--user-id <id>', 'user ID')
    .option('--forbid-time <timestamp>', 'forbid end time as 13-digit timestamp', parsePositiveInteger)
    .option('--playback-forbidden <Y|N>', 'whether playback is forbidden', validateYn)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withStreamHandler(handler => handler.banPush(options)));

  streamCmd.command('resume')
    .description('Resume push stream')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--user-id <id>', 'user ID')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withStreamHandler(handler => handler.resumePush(options)));

  streamCmd.command('type-update')
    .description('Update channel stream type')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--stream-type <type>', 'stream type: client|pull|thirdpull|disk|audio', validateHistoricalStreamType)
    .option('--pull-url <url>', 'pull URL when stream type is pull')
    .option('--pull-stream-time <timestamp>', 'pull stream start timestamp', parsePositiveInteger)
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withStreamHandler(handler => handler.updateStreamType(options)));

  // Stream push command
  const pushCmd = streamCmd
    .command('push')
    .description('Push a local video file to a live channel')
    .requiredOption('-c, --channelId <id>', 'channel ID (required)')
    .requiredOption('-f, --file <path>', 'path to the video file (required)')
    .option('--verify', 'enable real-time stream verification')
    .option('--verification-interval <seconds>', 'verification check interval in seconds (default: 10)', parseFloat, 10)
    .option('--quality-threshold <fps>', 'quality threshold for FPS warnings (default: 15)', parseFloat, 15)
    .option('--show-viewer-links', 'show viewer links during streaming')
    .action(async (options) => {
      try {
        // Load authentication and service configuration
        const parentOptions = program.opts();
        const combinedOptions = { ...parentOptions, ...options };
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(combinedOptions);

        // Create stream handler instance
        const streamHandler = new StreamHandler(authConfig, serviceConfig);

        // Transform commander options to handler options
        const streamOptions: StreamPushOptions = {
          channelId: options.channelId,
          file: options.file,
          verify: options.verify,
          verificationInterval: options.verificationInterval,
          qualityThreshold: options.qualityThreshold,
          showViewerLinks: options.showViewerLinks
        };

        // Execute stream push operation
        await streamHandler.pushStream(streamOptions);

      } catch (error) {
        // Enhanced error handling with authentication context
        if (error instanceof Error && error.message.includes('Authentication')) {
          // Add authentication diagnostics for auth-related errors
          const diagnostics = authAdapter.getDiagnostics(program.opts());
          console.error('\n🔍 Authentication Diagnostics:');
          diagnostics.availableSources.forEach(source => {
            const status = source.appId && source.appSecret ? '✅' : '❌';
            console.error(`  ${status} ${source.metadata.source}: ${source.type}`);
          });
          if (diagnostics.errors.length > 0) {
            console.error('\n❌ Errors:');
            diagnostics.errors.forEach(error => console.error(`  - ${error}`));
          }
        }
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  pushCmd.addHelpText('after', `
Examples:
  $ polyv-live-cli stream push -c 3151318 -f /path/to/video.mp4
  $ polyv-live-cli stream push -c 3151318 -f /path/to/video.mp4 --verify
  $ polyv-live-cli stream push -c 3151318 -f /path/to/video.mp4 --verify --verification-interval 5 --quality-threshold 20
  $ polyv-live-cli stream push -c 3151318 -f /path/to/video.mp4 --show-viewer-links

Requirements:
  • FFmpeg must be installed and in the system's PATH
  • Channel must exist and be accessible
  • Valid authentication credentials required

Usage Notes:
  • This command uses FFmpeg to push the stream
  • The command will terminate when the video finishes streaming
  • Press Ctrl+C to stop the stream manually
  • Use --verify to enable real-time quality monitoring
  • Use --show-viewer-links to display playback URLs

Verification Options:
  --verify                     Enable real-time stream verification
  --verification-interval      Check interval in seconds (default: 10)
  --quality-threshold         FPS threshold for warnings (default: 15)
  --show-viewer-links         Display viewer links during streaming
`);

  // Stream verify command
  const verifyCmd = streamCmd
    .command('verify')
    .description('Verify stream quality and performance for a live channel')
    .requiredOption('-c, --channelId <id>', 'channel ID (required)')
    .option('-d, --duration <seconds>', 'verification duration in seconds (default: 60)', parseFloat, 60)
    .option('-i, --interval <seconds>', 'check interval in seconds (default: 10)', parseFloat, 10)
    .option('-t, --quality-threshold <fps>', 'quality threshold for FPS warnings (default: 15)', parseFloat, 15)
    .option('--show-viewer-links', 'show viewer links before verification')
    .option('-s, --save-report <path>', 'save verification report to file')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        // Load authentication and service configuration
        const parentOptions = program.opts();
        const combinedOptions = { ...parentOptions, ...options };
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(combinedOptions);

        // Create stream handler instance
        const streamHandler = new StreamHandler(authConfig, serviceConfig);

        // Transform commander options to handler options
        const verifyOptions: StreamVerificationOptions = {
          channelId: options.channelId,
          duration: options.duration,
          interval: options.interval,
          qualityThreshold: options.qualityThreshold,
          showViewerLinks: options.showViewerLinks,
          saveReport: options.saveReport,
          output: options.output
        };

        // Execute stream verification operation
        await streamHandler.verifyStream(verifyOptions);

      } catch (error) {
        // Enhanced error handling with authentication context
        if (error instanceof Error && error.message.includes('Authentication')) {
          // Add authentication diagnostics for auth-related errors
          const diagnostics = authAdapter.getDiagnostics(program.opts());
          console.error('\n🔍 Authentication Diagnostics:');
          diagnostics.availableSources.forEach(source => {
            const status = source.appId && source.appSecret ? '✅' : '❌';
            console.error(`  ${status} ${source.metadata.source}: ${source.type}`);
          });
          if (diagnostics.errors.length > 0) {
            console.error('\n❌ Errors:');
            diagnostics.errors.forEach(error => console.error(`  - ${error}`));
          }
        }
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Add help text for stream verify command
  verifyCmd.addHelpText('after', `
Examples:
  $ polyv-live-cli stream verify -c 3151318
  $ polyv-live-cli stream verify -c 3151318 -d 120 -i 5
  $ polyv-live-cli stream verify -c 3151318 -t 20 --show-viewer-links
  $ polyv-live-cli stream verify -c 3151318 -s report.json -o json

Requirements:
  • Channel must be in live streaming state
  • Valid authentication credentials required
  • Channel must be actively streaming for meaningful results

Usage Notes:
  • Performs systematic quality checks over specified duration
  • Monitors FPS, bandwidth, and connection stability
  • Generates detailed performance reports
  • Ideal for troubleshooting streaming issues
  • Use before important live broadcasts

Verification Options:
  -d, --duration              Test duration in seconds (10-3600, default: 60)
  -i, --interval              Check interval in seconds (5-300, default: 10)
  -t, --quality-threshold     FPS threshold for warnings (default: 15)
  --show-viewer-links         Display viewer links before starting
  -s, --save-report          Save detailed report to JSON file
  -o, --output               Output format (table|json, default: table)

Report Contents:
  • Performance timeline with timestamps
  • Quality metrics (FPS, bandwidth, latency)
  • Issue detection and severity levels
  • Reliability percentage and recommendations
  • Viewer links for testing different protocols
`);

  // Stream monitor command
  const monitorCmd = streamCmd
    .command('monitor')
    .description('Monitor stream status in real-time with live dashboard')
    .requiredOption('-c, --channelId <id>', 'channel ID (required)')
    .option('-r, --refresh <seconds>', 'refresh interval in seconds (default: 5)', parseFloat, 5)
    .option('--alerts', 'enable quality alerts and notifications')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(async (options) => {
      try {
        // Load authentication and service configuration
        const parentOptions = program.opts();
        const combinedOptions = { ...parentOptions, ...options };
        const { authConfig, serviceConfig } = await loadAuthAndServiceConfig(combinedOptions);

        // Create stream handler instance
        const streamHandler = new StreamHandler(authConfig, serviceConfig);

        // Transform commander options to handler options
        const monitorOptions: StreamMonitorOptions = {
          channelId: options.channelId,
          refresh: options.refresh,
          alerts: options.alerts,
          output: options.output
        };

        // Execute stream monitoring operation
        await streamHandler.monitorStream(monitorOptions);

      } catch (error) {
        // Enhanced error handling with authentication context
        if (error instanceof Error && error.message.includes('Authentication')) {
          // Add authentication diagnostics for auth-related errors
          const diagnostics = authAdapter.getDiagnostics(program.opts());
          console.error('\n🔍 Authentication Diagnostics:');
          diagnostics.availableSources.forEach(source => {
            const status = source.appId && source.appSecret ? '✅' : '❌';
            console.error(`  ${status} ${source.metadata.source}: ${source.type}`);
          });
          if (diagnostics.errors.length > 0) {
            console.error('\n❌ Errors:');
            diagnostics.errors.forEach(error => console.error(`  - ${error}`));
          }
        }
        logError(error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    });

  // Add help text for stream monitor command
  monitorCmd.addHelpText('after', `
Examples:
  $ polyv-live-cli stream monitor -c 3151318
  $ polyv-live-cli stream monitor -c 3151318 -r 3 --alerts
  $ polyv-live-cli stream monitor -c 3151318 -o json

Requirements:
  • Channel must exist and be accessible
  • Valid authentication credentials required
  • Works with channels in any state (live, waiting, stopped)

Usage Notes:
  • Provides real-time dashboard view of stream status
  • Automatically refreshes at specified intervals
  • Shows performance metrics, uptime, and quality indicators
  • Perfect for monitoring active live streams
  • Press Ctrl+C to stop monitoring

Monitoring Features:
  • Live status display with visual indicators
  • Performance metrics (FPS, bandwidth, latency)
  • Stream uptime and duration tracking
  • Quality alerts when issues are detected
  • Activity log with recent status changes
  • Clean, refreshing dashboard interface

Monitor Options:
  -r, --refresh              Refresh interval in seconds (1-60, default: 5)
  --alerts                   Enable quality alerts and notifications
  -o, --output              Output format (table|json, default: table)

Perfect For:
  • Monitoring live broadcasts
  • Troubleshooting connection issues
  • Ensuring consistent stream quality
  • Keeping track of stream performance
`);
}

/**
 * Validates output format parameter
 * @param value Output format string
 * @returns Validated output format
 * @throws Error if format is invalid
 */
function validateOutputFormat(value: string): 'table' | 'json' {
  if (value !== 'table' && value !== 'json') {
    throw new Error(`Invalid output format: ${value}. Must be 'table' or 'json'`);
  }
  return value;
}

function parsePositiveInteger(value: string): number {
  const parsed = parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error('value must be a positive integer');
  }
  return parsed;
}

function validateDiskVideoOrigin(value: string): 'vod' | 'material' | 'record' {
  if (value !== 'vod' && value !== 'material' && value !== 'record') {
    throw new Error('origin must be vod, material, or record');
  }
  return value;
}

function validateHistoricalStreamType(value: string): 'client' | 'pull' | 'thirdpull' | 'disk' | 'audio' {
  const validTypes = ['client', 'pull', 'thirdpull', 'disk', 'audio'] as const;
  if (!validTypes.includes(value as any)) {
    throw new Error(`stream type must be one of: ${validTypes.join(', ')}`);
  }
  return value as 'client' | 'pull' | 'thirdpull' | 'disk' | 'audio';
}
