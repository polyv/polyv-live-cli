/**
 * @fileoverview Stream handler for CLI command operations
 * @author Development Team
 * @since 3.1.0
 */

import { BaseHandler } from './base.handler';
import { StreamServiceSdk, StreamServiceConfig } from '../services/stream.service.sdk';
import { AuthConfig } from '../types/auth';
import {
  StreamGetKeyOptions,
  StreamCredentials,
  StreamKeyDisplayModel,
  StreamStartOptions,
  StreamStopOptions,
  StreamStatusInfo,
  StreamStatusOptions,
  StreamPushOptions,
  StreamVerificationOptions,
  StreamMonitorOptions,
  VerificationPoint
} from '../types/stream';
import { PolyVValidationError } from '../utils/errors';
import {
  formatStreamStatusForTable,
  formatStreamStatusForJson,
  formatCompactStatus
} from '../utils/formatter';
import { isFFmpegInstalled } from '../utils/ffmpeg';
import {
  DEFAULT_VERIFICATION_SETTINGS,
  generateVerificationId,
  createVerificationPoint,
  generateViewerLinks,
  createVerificationResult,
  formatFPS,
  getStatusEmoji,
  analyzeQualityMetrics,
  getSeverityEmoji
} from '../utils/stream-verification';
import { formatBandwidth } from '../utils/formatter';
import { spawn } from 'child_process';
import * as fs from 'fs';

/**
 * Stream handler for managing stream-related CLI operations
 */
export class StreamHandler extends BaseHandler {
  private readonly streamService: StreamServiceSdk;

  /**
   * Creates a new StreamHandler instance
   * @param authConfig Authentication configuration
   * @param serviceConfig Service configuration
   */
  constructor(authConfig: AuthConfig, serviceConfig: StreamServiceConfig) {
    super();
    this.streamService = new StreamServiceSdk(authConfig, serviceConfig);
  }

  /**
   * Gets stream key and RTMP URL for a channel
   * @param options Stream get key options
   * @returns Promise that resolves when operation completes
   */
  async getStreamKey(options: StreamGetKeyOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate input parameters
      this.validateGetStreamKeyOptions(options);

      // Get stream credentials from service
      const credentials = await this.streamService.getStreamKey({
        channelId: options.channelId
      });

      // Get and display status information
      try {
        const statusInfo = await this.streamService.getStreamStatus({
          channelId: options.channelId
        });
        
        console.log('\n📊 Stream Status:');
        console.log(`   ${formatCompactStatus(statusInfo)}`);
        if (statusInfo.isLive && statusInfo.metrics) {
          console.log(`   Performance: ${statusInfo.metrics.fps.toFixed(1)} FPS, ${statusInfo.metrics.bandwidthText}`);
        }
      } catch (error) {
        // Status error shouldn't block the main operation
        console.log('\n⚠️  Status: Unable to retrieve current status');
      }

      // Display results based on output format
      const outputFormat = options.output || 'table';
      
      if (outputFormat === 'json') {
        this.displayStreamCredentialsAsJson(credentials);
      } else {
        this.displayStreamCredentialsAsTable(credentials);
      }

      // Display security warning
      this.displaySecurityWarning();

    }, 'stream.getStreamKey');
  }

  /**
   * Validates stream get key options
   * @param options Options to validate
   * @throws {PolyVValidationError} When validation fails
   */
  private validateGetStreamKeyOptions(options: StreamGetKeyOptions): void {
    if (!options.channelId || typeof options.channelId !== 'string' || options.channelId.trim() === '') {
      throw new PolyVValidationError(
        'Channel ID cannot be empty',
        'channelId',
        options.channelId,
        'required'
      );
    }

    if (options.output && !['table', 'json'].includes(options.output)) {
      throw new PolyVValidationError(
        'Output format must be either "table" or "json"',
        'output',
        options.output,
        'invalid_value'
      );
    }
  }

  /**
   * Displays stream credentials as a formatted table with masked stream key
   * @param credentials Stream credentials to display
   */
  private displayStreamCredentialsAsTable(credentials: StreamCredentials): void {
    const displayModel = this.createSecureDisplayModel(credentials);
    
    // Main stream information
    const streamInfo = {
      'Channel ID': credentials.channelId,
      'RTMP URL': credentials.rtmpUrl,
      'Stream Key': displayModel.streamKey,
      'Deploy Address': credentials.deployAddress || '-',
      'Input Address': credentials.inAddress || '-'
    };

    console.log('\n📡 Stream Information:');
    this.displayData(streamInfo, 'table');

    // Performance metrics if available
    if (credentials.metrics.fps > 0 || credentials.metrics.bandwidth > 0) {
      const performanceInfo = {
        'FPS': credentials.metrics.fps.toFixed(2),
        'LFR': credentials.metrics.lfr.toFixed(2),
        'Bandwidth': formatBandwidth(credentials.metrics.bandwidth)
      };
      console.log('\n📊 Performance Metrics:');
      this.displayData(performanceInfo, 'table');
    }
    
    if (displayModel.isMasked) {
      console.log('\n💡 Stream key is partially hidden for security. Use --output json to see full credentials.');
    }
  }

  /**
   * Displays stream credentials as JSON with full information
   * @param credentials Stream credentials to display
   */
  private displayStreamCredentialsAsJson(credentials: StreamCredentials): void {
    console.log('\n📡 Stream Information (Full):');
    console.log(JSON.stringify(credentials, null, 2));
  }

  /**
   * Creates a secure display model with masked stream key
   * @param credentials Original stream credentials
   * @returns Display model with masked sensitive data
   */
  private createSecureDisplayModel(credentials: StreamCredentials): StreamKeyDisplayModel {
    const streamKey = credentials.streamKey;
    let maskedStreamKey = streamKey;
    let isMasked = false;

    // Mask stream key if it's longer than 8 characters
    if (streamKey && streamKey.length > 8) {
      const prefix = streamKey.substring(0, 4);
      const suffix = streamKey.substring(streamKey.length - 4);
      const maskLength = streamKey.length - 8;
      const mask = '*'.repeat(maskLength);
      maskedStreamKey = `${prefix}${mask}${suffix}`;
      isMasked = true;
    }

    return {
      channelId: credentials.channelId,
      rtmpUrl: credentials.rtmpUrl,
      streamKey: maskedStreamKey,
      isMasked,
      streamInfo: {
        fps: credentials.metrics.fps,
        bandwidth: credentials.metrics.bandwidth
      }
    };
  }


  /**
   * Starts streaming for a channel
   * @param options Stream start options
   * @returns Promise that resolves when operation completes
   */
  async startStream(options: StreamStartOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate input parameters
      this.validateStartStreamOptions(options);

      // Start stream through service
      const response = await this.streamService.startStream({
        channelId: options.channelId
      });

      // Display results based on response
      if (response.data === 'success') {
        this.displaySuccess(`Stream started successfully for channel ${options.channelId}`);
        
        // Get and display enhanced status after starting
        try {
          await this.displayEnhancedStatus(options.channelId);
        } catch (error) {
          // Fallback to simple status display
          this.displayStreamStatus(options.channelId, 'live');
        }
      } else {
        this.displayError(`Failed to start stream for channel ${options.channelId}`);
      }

    }, 'stream.startStream');
  }

  /**
   * Validates stream start options
   * @param options Options to validate
   * @throws {PolyVValidationError} When validation fails
   */
  private validateStartStreamOptions(options: StreamStartOptions): void {
    if (!options.channelId || typeof options.channelId !== 'string' || options.channelId.trim() === '') {
      throw new PolyVValidationError(
        'Channel ID cannot be empty',
        'channelId',
        options.channelId,
        'required'
      );
    }
  }

  /**
   * Displays stream status information
   * @param channelId Channel ID
   * @param status Stream status
   */
  private displayStreamStatus(channelId: string, status: string): void {
    const statusInfo = {
      'Channel ID': channelId,
      'Stream Status': status,
      'Timestamp': new Date().toISOString()
    };

    console.log('\n📊 Stream Status:');
    this.displayData(statusInfo, 'table');
  }

  /**
   * Stops streaming for a channel
   * @param options Stream stop options
   * @returns Promise that resolves when operation completes
   */
  async stopStream(options: StreamStopOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate input parameters
      this.validateStopStreamOptions(options);

      // Stop stream through service
      const response = await this.streamService.stopStream({
        channelId: options.channelId
      });

      // Display results based on response
      if (response.data === 'success') {
        this.displaySuccess(`Stream stopped successfully for channel ${options.channelId}`);
        
        // Get and display enhanced status after stopping
        try {
          await this.displayEnhancedStatus(options.channelId);
        } catch (error) {
          // Fallback to simple status display
          this.displayStreamStatus(options.channelId, 'stopped');
        }
      } else {
        this.displayError(`Failed to stop stream for channel ${options.channelId}`);
      }

    }, 'stream.stopStream');
  }

  /**
   * Validates stream stop options
   * @param options Options to validate
   * @throws {PolyVValidationError} When validation fails
   */
  private validateStopStreamOptions(options: StreamStopOptions): void {
    if (!options.channelId || typeof options.channelId !== 'string' || options.channelId.trim() === '') {
      throw new PolyVValidationError(
        'Channel ID cannot be empty',
        'channelId',
        options.channelId,
        'required'
      );
    }
  }

  /**
   * Gets and displays stream status information for a channel
   * @param options Stream status options
   * @returns Promise that resolves when operation completes
   */
  async getStreamStatus(options: StreamStatusOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Validate input parameters
      this.validateStreamStatusOptions(options);

      // Get stream status from service
      const statusInfo = await this.streamService.getStreamStatus({
        channelId: options.channelId
      });

      // Display results based on output format
      const outputFormat = options.output || 'table';
      
      if (outputFormat === 'json') {
        this.displayStreamStatusAsJson(statusInfo);
      } else {
        this.displayStreamStatusAsTable(statusInfo);
      }

    }, 'stream.getStreamStatus');
  }

  /**
   * Validates stream status options
   * @param options Options to validate
   * @throws {PolyVValidationError} When validation fails
   */
  private validateStreamStatusOptions(options: StreamStatusOptions): void {
    if (!options.channelId || typeof options.channelId !== 'string' || options.channelId.trim() === '') {
      throw new PolyVValidationError(
        'Channel ID cannot be empty',
        'channelId',
        options.channelId,
        'required'
      );
    }

    if (options.output && !['table', 'json'].includes(options.output)) {
      throw new PolyVValidationError(
        'Output format must be either "table" or "json"',
        'output',
        options.output,
        'invalid_value'
      );
    }
  }

  /**
   * Displays stream status as a formatted table
   * @param statusInfo Stream status information
   */
  private displayStreamStatusAsTable(statusInfo: StreamStatusInfo): void {
    console.log('\n📊 Stream Status Information:');
    
    const formattedStatus = formatStreamStatusForTable(statusInfo);
    this.displayData(formattedStatus, 'table');

    // Show additional info for live streams
    if (statusInfo.isLive && statusInfo.metrics) {
      console.log('\n💡 Stream is currently live and broadcasting');
      if (statusInfo.network && statusInfo.network.streamName) {
        console.log(`   Stream Name: ${statusInfo.network.streamName}`);
      }
    } else if (statusInfo.status === 'waiting') {
      console.log('\n⏳ Stream is ready but not yet started');
    } else if (statusInfo.status === 'stopped') {
      console.log('\n⏹️  Stream has ended');
    } else if (statusInfo.status === 'error') {
      console.log('\n❌ Stream has an error condition');
    }
  }

  /**
   * Displays stream status as JSON
   * @param statusInfo Stream status information
   */
  private displayStreamStatusAsJson(statusInfo: StreamStatusInfo): void {
    console.log('\n📊 Stream Status Information (Full):');
    const formattedStatus = formatStreamStatusForJson(statusInfo);
    console.log(JSON.stringify(formattedStatus, null, 2));
  }

  /**
   * Displays enhanced status information inline
   * @param channelId Channel ID
   */
  private async displayEnhancedStatus(channelId: string): Promise<void> {
    const statusInfo = await this.streamService.getStreamStatus({
      channelId
    });

    console.log('\n📊 Current Status:');
    const compactStatus = formatCompactStatus(statusInfo);
    console.log(`   ${compactStatus}`);

    if (statusInfo.isLive && statusInfo.metrics) {
      console.log(`   Performance: ${statusInfo.metrics.fps.toFixed(1)} FPS, ${statusInfo.metrics.bandwidthText}`);
    }

    if (statusInfo.error) {
      console.log(`   ⚠️  Error: ${statusInfo.error.message}`);
    }
  }

  /**
   * Displays security warning for sensitive data
   */
  private displaySecurityWarning(): void {
    console.log('\n🔒 Security Notice:');
    console.log('   • Keep your stream key confidential');
    console.log('   • Do not share stream credentials in public channels');
    console.log('   • Regenerate stream key if compromised');
  }

  async pushStream(options: StreamPushOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validatePushStreamOptions(options);

      console.log('🔍 Checking FFmpeg installation...');
      const ffmpegInstalled = await isFFmpegInstalled();
      if (!ffmpegInstalled) {
        throw new Error('FFmpeg is not installed or not found in PATH. Please install FFmpeg to use this feature.');
      }
      console.log('✅ FFmpeg is available');

      console.log('🔑 Getting stream credentials...');
      const credentials = await this.streamService.getStreamKey({
        channelId: options.channelId
      });
      console.log('✅ Stream credentials retrieved');

      // Display verification settings if enabled
      if (options.verify) {
        const interval = options.verificationInterval || DEFAULT_VERIFICATION_SETTINGS.INTERVAL;
        const threshold = options.qualityThreshold || DEFAULT_VERIFICATION_SETTINGS.QUALITY_THRESHOLD;
        console.log('🔍 Verification mode enabled:');
        console.log(`   Interval: ${interval}s, Quality threshold: ${threshold} FPS`);
      }

      // Display viewer links if requested
      if (options.showViewerLinks || options.verify) {
        console.log('🔗 Viewer Links:');
        const viewerLinks = generateViewerLinks(options.channelId);
        viewerLinks.forEach(link => {
          console.log(`   • ${link.protocol}: ${link.url}`);
        });
        console.log('');
      }

      const rtmpUrl = `${credentials.rtmpUrl}/${credentials.streamKey}`;
      const ffmpegArgs = [
        '-re',
        '-i', options.file,
        '-c:v', 'copy',
        '-c:a', 'aac',
        '-f', 'flv',
        rtmpUrl
      ];

      console.log('🎬 Starting stream push...');
      console.log(`   File: ${options.file}`);
      console.log(`   Channel: ${options.channelId}`);
      console.log('   Press Ctrl+C to stop streaming');
      console.log('');

      const ffmpegProcess = spawn('ffmpeg', ffmpegArgs);

      // Setup verification if enabled
      let verificationInterval: NodeJS.Timeout | null = null;
      let verificationCheckCount = 0;
      
      if (options.verify) {
        const interval = (options.verificationInterval || DEFAULT_VERIFICATION_SETTINGS.INTERVAL) * 1000;
        const threshold = options.qualityThreshold || DEFAULT_VERIFICATION_SETTINGS.QUALITY_THRESHOLD;
        
        verificationInterval = setInterval(async () => {
          try {
            verificationCheckCount++;
            const statusInfo = await this.streamService.getStreamStatus({
              channelId: options.channelId
            });
            
            const verificationPoint = createVerificationPoint(verificationCheckCount, statusInfo, threshold);
            const statusEmoji = getStatusEmoji(verificationPoint.status);
            
            console.log(`\n⏱️  Verification Check #${verificationCheckCount} (${this.formatDuration(verificationCheckCount * interval / 1000)}):`);
            console.log(`   Status: ${statusEmoji} ${verificationPoint.status} | FPS: ${formatFPS(verificationPoint.metrics.fps)} | Bandwidth: ${formatBandwidth(verificationPoint.metrics.bandwidth)}`);
            
            // Display issues if any
            if (verificationPoint.issues.length > 0) {
              verificationPoint.issues.forEach(issue => {
                console.log(`   Issue: ${issue.message}`);
              });
            }
            
          } catch (error) {
            console.log(`   ⚠️  Verification check failed: ${error instanceof Error ? error.message : String(error)}`);
          }
        }, interval);
        // Prevent timer from keeping process alive in production
        if (process.env['NODE_ENV'] !== 'test' && verificationInterval?.unref) {
          verificationInterval.unref();
        }
      }

      // Handle process output
      ffmpegProcess.stdout.on('data', (data) => {
        process.stdout.write(data);
      });

      ffmpegProcess.stderr.on('data', (data) => {
        process.stderr.write(data);
      });

      // Handle process completion
      return new Promise<void>((resolve, reject) => {
        ffmpegProcess.on('close', (code) => {
          // Clear verification interval
          if (verificationInterval) {
            clearInterval(verificationInterval);
          }

          if (code === 0) {
            console.log('\n✅ Stream completed successfully');
            if (options.verify && verificationCheckCount > 0) {
              console.log(`📊 Verification Summary: ${verificationCheckCount} checks performed`);
            }
            resolve();
          } else if (code === null) {
            console.log('\n⏹️  Stream stopped by user');
            if (options.verify && verificationCheckCount > 0) {
              console.log(`📊 Verification Summary: ${verificationCheckCount} checks performed`);
            }
            resolve();
          } else {
            console.log(`\n❌ FFmpeg process exited with code ${code}`);
            reject(new Error(`FFmpeg process failed with exit code ${code}`));
          }
        });

        ffmpegProcess.on('error', (error) => {
          // Clear verification interval
          if (verificationInterval) {
            clearInterval(verificationInterval);
          }
          console.log(`\n❌ FFmpeg process error: ${error.message}`);
          reject(error);
        });

        // Handle Ctrl+C gracefully
        const sigintHandler = () => {
          console.log('\n⏹️  Stopping stream...');
          if (verificationInterval) {
            clearInterval(verificationInterval);
          }
          ffmpegProcess.kill('SIGINT');
          process.removeListener('SIGINT', sigintHandler);
        };

        process.on('SIGINT', sigintHandler);
      });

    }, 'stream.pushStream');
  }

  private validatePushStreamOptions(options: StreamPushOptions): void {
    if (!options.channelId || typeof options.channelId !== 'string' || options.channelId.trim() === '') {
      throw new PolyVValidationError(
        'Channel ID cannot be empty',
        'channelId',
        options.channelId,
        'required'
      );
    }

    if (!options.file || typeof options.file !== 'string' || options.file.trim() === '') {
      throw new PolyVValidationError(
        'File path cannot be empty',
        'file',
        options.file,
        'required'
      );
    }

    if (!fs.existsSync(options.file)) {
      throw new PolyVValidationError(
        `File not found: ${options.file}`,
        'file',
        options.file,
        'not_found'
      );
    }
  }

  /**
   * Performs stream verification for a channel
   * @param options Stream verification options
   * @returns Promise that resolves when verification completes
   */
  async verifyStream(options: StreamVerificationOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateVerifyStreamOptions(options);

      const duration = options.duration || DEFAULT_VERIFICATION_SETTINGS.DURATION;
      const interval = options.interval || DEFAULT_VERIFICATION_SETTINGS.INTERVAL;
      const threshold = options.qualityThreshold || DEFAULT_VERIFICATION_SETTINGS.QUALITY_THRESHOLD;
      const expectedChecks = Math.floor(duration / interval);

      console.log(`🔍 Starting stream verification for channel ${options.channelId}...`);
      console.log(`   Duration: ${duration}s | Interval: ${interval}s | Expected checks: ${expectedChecks}`);
      console.log('');

      const verificationId = generateVerificationId();
      const startTime = new Date();
      const verificationPoints: VerificationPoint[] = [];

      // Display viewer links if requested
      if (options.showViewerLinks) {
        console.log('🔗 Viewer Links:');
        const viewerLinks = generateViewerLinks(options.channelId);
        viewerLinks.forEach(link => {
          console.log(`   • ${link.protocol}: ${link.url}`);
        });
        console.log('');
      }

      console.log('📊 Verification Progress:');
      
      // Perform verification checks
      for (let i = 0; i < expectedChecks; i++) {
        const checkNumber = i + 1;
        const elapsedTime = checkNumber * interval;

        try {
          const statusInfo = await this.streamService.getStreamStatus({
            channelId: options.channelId
          });

          const verificationPoint = createVerificationPoint(checkNumber, statusInfo, threshold);
          verificationPoints.push(verificationPoint);

          const statusEmoji = getStatusEmoji(verificationPoint.status);
          const timeStr = this.formatDuration(elapsedTime);
          
          console.log(`   ${checkNumber.toString().padStart(2)}. ${timeStr} | ${statusEmoji} ${verificationPoint.status.padEnd(7)} | FPS: ${formatFPS(verificationPoint.metrics.fps).padEnd(8)} | Bandwidth: ${formatBandwidth(verificationPoint.metrics.bandwidth).padEnd(10)} | ${statusEmoji}`);

          // Display issues if any
          if (verificationPoint.issues.length > 0) {
            verificationPoint.issues.forEach(issue => {
              console.log(`       Issue: ${issue.message}`);
            });
          }

        } catch (error) {
          console.log(`   ${checkNumber.toString().padStart(2)}. ${this.formatDuration(elapsedTime)} | ❌ Error   | Failed to get status: ${error instanceof Error ? error.message : String(error)}`);
        }

        // Wait for next check (except for the last one)
        if (i < expectedChecks - 1) {
          await this.sleep(interval * 1000);
        }
      }

      // Generate and display results
      const result = createVerificationResult(options.channelId, verificationId, startTime, verificationPoints, threshold);
      
      console.log('\n📈 Verification Summary:');
      console.log(`   • Overall Status: ${result.summary.overallStatus} (${result.summary.reliability.toFixed(0)}% reliability)`);
      console.log(`   • Average FPS: ${formatFPS(result.averageMetrics.fps)} (Target: >${threshold} FPS)`);
      console.log(`   • Average Bandwidth: ${formatBandwidth(result.averageMetrics.bandwidth)}`);
      console.log(`   • Issues Found: ${result.summary.totalIssues}`);
      
      if (result.summary.recommendations.length > 0) {
        console.log('   • Recommendations:');
        result.summary.recommendations.forEach(rec => {
          console.log(`     - ${rec}`);
        });
      }

      // Save report if requested
      if (options.saveReport) {
        const { saveVerificationReport, createVerificationReport } = await import('../utils/stream-verification');
        const report = createVerificationReport(result, duration, interval);
        report.timeline = verificationPoints;
        
        await saveVerificationReport(report, options.saveReport);
        console.log(`\n💾 Verification report saved to: ${options.saveReport}`);
      }

      // Output JSON if requested
      if (options.output === 'json') {
        console.log('\n📄 JSON Report:');
        console.log(JSON.stringify(result, null, 2));
      }

    }, 'stream.verifyStream');
  }

  /**
   * Monitors stream status in real-time
   * @param options Stream monitor options
   * @returns Promise that resolves when monitoring stops
   */
  async monitorStream(options: StreamMonitorOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      this.validateMonitorStreamOptions(options);

      const refresh = options.refresh || DEFAULT_VERIFICATION_SETTINGS.MONITOR_REFRESH;
      
      console.log(`📊 Stream Monitor - Channel: ${options.channelId} (Refreshing every ${refresh}s)`);
      console.log('Press Ctrl+C to stop monitoring\n');

      let monitorInterval: NodeJS.Timeout | null = null;
      let activityLog: string[] = [];

      // Function to perform monitoring check
      const performCheck = async () => {
        try {
          const statusInfo = await this.streamService.getStreamStatus({
            channelId: options.channelId
          });

          // Clear screen for better readability
          process.stdout.write('\x1Bc');
          
          console.log(`📊 Stream Monitor - Channel: ${options.channelId} (Refreshing every ${refresh}s)`);
          console.log('Press Ctrl+C to stop monitoring\n');

          // Current status display
          const statusEmoji = statusInfo.isLive ? '✅' : '⏸️';
          const status = statusInfo.isLive ? 'Live and Healthy' : statusInfo.statusText;
          
          console.log('┌─────────────────────────────────────────────────────────────┐');
          console.log(`│ Current Status: ${statusEmoji} ${status.padEnd(40)} │`);
          
          if (statusInfo.isLive && statusInfo.metrics) {
            const duration = statusInfo.durationText || 'Unknown';
            const fps = formatFPS(statusInfo.metrics.fps);
            const bandwidth = formatBandwidth(statusInfo.metrics.bandwidth);
            const latency = statusInfo.metrics.lfr ? `${statusInfo.metrics.lfr.toFixed(1)}% LFR` : 'N/A';
            
            console.log(`│ Uptime: ${duration.padEnd(20)} | Viewers: Unknown${' '.padEnd(14)} │`);
            console.log(`│ FPS: ${fps.padEnd(8)} | Bandwidth: ${bandwidth.padEnd(10)} | Latency: ${latency.padEnd(8)} │`);
          } else {
            console.log(`│ Stream is not currently live${' '.padEnd(32)} │`);
          }
          
          console.log('└─────────────────────────────────────────────────────────────┘\n');

          // Quality alerts if enabled
          if (options.alerts && statusInfo.isLive && statusInfo.metrics) {
            const qualityIssues = analyzeQualityMetrics({
              fps: statusInfo.metrics.fps,
              bandwidth: statusInfo.metrics.bandwidth,
              lfr: statusInfo.metrics.lfr
            });

            if (qualityIssues.length > 0) {
              console.log('⚠️  Quality Alerts:');
              qualityIssues.forEach(issue => {
                const severityEmoji = getSeverityEmoji(issue.severity);
                console.log(`   ${severityEmoji} ${issue.message}`);
              });
              console.log('');
            }
          }

          // Recent activity log
          console.log('Recent Activity:');
          const currentTime = new Date().toLocaleTimeString();
          const newActivity = `   ${currentTime} - Stream status: ${status}`;
          
          activityLog.unshift(newActivity);
          if (activityLog.length > 5) {
            activityLog = activityLog.slice(0, 5);
          }
          
          activityLog.forEach(activity => console.log(activity));

          console.log(`\n⏱️  Last updated: ${currentTime}`);
          console.log(`🔄 Refreshing in ${refresh} seconds...`);

        } catch (error) {
          console.log(`❌ Error monitoring stream: ${error instanceof Error ? error.message : String(error)}`);
        }
      };

      // Initial check
      await performCheck();

      // Setup monitoring interval
      monitorInterval = setInterval(performCheck, refresh * 1000);
      // Prevent timer from keeping process alive in production
      if (process.env['NODE_ENV'] !== 'test' && monitorInterval?.unref) {
        monitorInterval.unref();
      }

      // Handle Ctrl+C gracefully
      return new Promise<void>((resolve) => {
        const sigintHandler = () => {
          if (monitorInterval) {
            clearInterval(monitorInterval);
          }
          console.log('\n\n👋 Monitoring stopped. Goodbye!');
          process.removeListener('SIGINT', sigintHandler);
          resolve();
        };

        process.on('SIGINT', sigintHandler);
      });

    }, 'stream.monitorStream');
  }

  /**
   * Validates stream verification options
   */
  private validateVerifyStreamOptions(options: StreamVerificationOptions): void {
    if (!options.channelId || typeof options.channelId !== 'string' || options.channelId.trim() === '') {
      throw new PolyVValidationError(
        'Channel ID cannot be empty',
        'channelId',
        options.channelId,
        'required'
      );
    }

    if (options.duration && (options.duration < 10 || options.duration > 3600)) {
      throw new PolyVValidationError(
        'Duration must be between 10 and 3600 seconds',
        'duration',
        options.duration,
        'out_of_range'
      );
    }

    if (options.interval && (options.interval < 5 || options.interval > 300)) {
      throw new PolyVValidationError(
        'Interval must be between 5 and 300 seconds',
        'interval',
        options.interval,
        'out_of_range'
      );
    }
  }

  /**
   * Validates stream monitor options
   */
  private validateMonitorStreamOptions(options: StreamMonitorOptions): void {
    if (!options.channelId || typeof options.channelId !== 'string' || options.channelId.trim() === '') {
      throw new PolyVValidationError(
        'Channel ID cannot be empty',
        'channelId',
        options.channelId,
        'required'
      );
    }

    if (options.refresh !== undefined && (options.refresh < 1 || options.refresh > 60)) {
      throw new PolyVValidationError(
        'Refresh interval must be between 1 and 60 seconds',
        'refresh',
        options.refresh,
        'out_of_range'
      );
    }
  }

  /**
   * Sleep utility function
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Formats duration in seconds to MM:SS format
   */
  private formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
} 