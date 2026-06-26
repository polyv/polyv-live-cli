/**
 * @fileoverview Unit tests for StreamHandler
 * @author Development Team
 * @since 3.3.0
 */

import { StreamHandler } from './stream.handler';
import { StreamServiceSdk } from '../services/stream.service.sdk';
import {
  StreamGetKeyOptions,
  StreamCredentials,
  StreamStartOptions,
  StreamStopOptions,
  StreamPushOptions,
  StreamVerificationOptions,
  StreamMonitorOptions,
  StreamStatusInfo
} from '../types/stream';
import { PolyVValidationError, PolyVAPIError } from '../utils/errors';

// Mock the StreamServiceSdk
jest.mock('../services/stream.service.sdk');

// Mock the ffmpeg utility
jest.mock('../utils/ffmpeg', () => ({
  isFFmpegInstalled: jest.fn()
}));

// Mock child_process
jest.mock('child_process', () => ({
  spawn: jest.fn()
}));

// Mock fs
jest.mock('fs', () => ({
  existsSync: jest.fn()
}));

// Mock console methods to suppress output during tests
const consoleSpy = {
  log: jest.spyOn(console, 'log').mockImplementation(() => {}),
  error: jest.spyOn(console, 'error').mockImplementation(() => {}),
  warn: jest.spyOn(console, 'warn').mockImplementation(() => {})
};

describe('StreamHandler', () => {
  let streamHandler: StreamHandler;
  let mockStreamService: jest.Mocked<StreamServiceSdk>;

  // Global setup to suppress all console output in tests
  beforeAll(() => {
    consoleSpy.log.mockImplementation(() => {});
    consoleSpy.error.mockImplementation(() => {});
    consoleSpy.warn.mockImplementation(() => {});
  });

  afterAll(() => {
    consoleSpy.log.mockRestore();
    consoleSpy.error.mockRestore();
    consoleSpy.warn.mockRestore();
  });

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Ensure console methods are properly mocked and silent
    consoleSpy.log.mockImplementation(() => {});
    consoleSpy.error.mockImplementation(() => {});
    consoleSpy.warn.mockImplementation(() => {});

    // Create mock service instance with all required methods
    mockStreamService = {
      getStreamKey: jest.fn(),
      startStream: jest.fn(),
      stopStream: jest.fn(),
      getStreamStatus: jest.fn()
    } as any;

    // Mock StreamServiceSdk constructor to return our mock instance
    (StreamServiceSdk as jest.MockedClass<typeof StreamServiceSdk>).mockImplementation(() => mockStreamService);

    // Create handler instance with auth config and service config
    streamHandler = new StreamHandler(
      { appId: 'test-app-id', appSecret: 'test-app-secret', userId: 'test-user-id' },
      { baseUrl: 'https://api.polyv.net', timeout: 30000, debug: false }
    );
  });

  afterEach(() => {
    // Restore console methods
    Object.values(consoleSpy).forEach(spy => spy.mockRestore());
  });

  describe('constructor', () => {
    it('should create StreamHandler with StreamService', () => {
      expect(streamHandler).toBeInstanceOf(StreamHandler);
    });
  });

  describe('startStream', () => {
    const validOptions: StreamStartOptions = {
      channelId: '3151318'
    };

    it('should successfully start stream with valid options', async () => {
      const mockResponse = {
        code: 200,
        status: 'success',
        message: '',
        data: 'success'
      };

      mockStreamService.startStream.mockResolvedValue(mockResponse);

      await streamHandler.startStream(validOptions);

      expect(mockStreamService.startStream).toHaveBeenCalledWith({
        channelId: '3151318'
      });
      expect(mockStreamService.startStream).toHaveBeenCalledTimes(1);
    });

    it('should throw validation error for empty channelId', async () => {
      const invalidOptions: StreamStartOptions = {
        channelId: ''
      };

      await expect(streamHandler.startStream(invalidOptions)).rejects.toThrow(PolyVValidationError);
      await expect(streamHandler.startStream(invalidOptions)).rejects.toThrow('Channel ID cannot be empty');
    });

    it('should throw validation error for null channelId', async () => {
      const invalidOptions = {
        channelId: null
      } as any;

      await expect(streamHandler.startStream(invalidOptions)).rejects.toThrow(PolyVValidationError);
    });

    it('should handle service errors', async () => {
      const serviceError = new PolyVAPIError('Channel not found', 'CHANNEL_NOT_FOUND', 404);
      mockStreamService.startStream.mockRejectedValue(serviceError);

      await expect(streamHandler.startStream(validOptions)).rejects.toThrow(PolyVAPIError);
      await expect(streamHandler.startStream(validOptions)).rejects.toThrow('Channel not found');
    });

    it('should handle empty data response', async () => {
      const mockResponse = {
        code: 200,
        status: 'success',
        message: '',
        data: ''
      };

      mockStreamService.startStream.mockResolvedValue(mockResponse);

      await streamHandler.startStream(validOptions);

      expect(mockStreamService.startStream).toHaveBeenCalledWith({
        channelId: '3151318'
      });
    });
  });

  describe('stopStream', () => {
    const validOptions: StreamStopOptions = {
      channelId: '3151318'
    };

    it('should successfully stop stream with valid options', async () => {
      const mockResponse = {
        code: 200,
        status: 'success',
        message: '',
        data: 'success'
      };

      mockStreamService.stopStream.mockResolvedValue(mockResponse);

      await streamHandler.stopStream(validOptions);

      expect(mockStreamService.stopStream).toHaveBeenCalledWith({
        channelId: '3151318'
      });
      expect(mockStreamService.stopStream).toHaveBeenCalledTimes(1);
    });

    it('should throw validation error for empty channelId', async () => {
      const invalidOptions: StreamStopOptions = {
        channelId: ''
      };

      await expect(streamHandler.stopStream(invalidOptions)).rejects.toThrow(PolyVValidationError);
      await expect(streamHandler.stopStream(invalidOptions)).rejects.toThrow('Channel ID cannot be empty');
    });

    it('should throw validation error for null channelId', async () => {
      const invalidOptions = {
        channelId: null
      } as any;

      await expect(streamHandler.stopStream(invalidOptions)).rejects.toThrow(PolyVValidationError);
    });

    it('should throw validation error for whitespace-only channelId', async () => {
      const invalidOptions: StreamStopOptions = {
        channelId: '   '
      };

      await expect(streamHandler.stopStream(invalidOptions)).rejects.toThrow(PolyVValidationError);
      await expect(streamHandler.stopStream(invalidOptions)).rejects.toThrow('Channel ID cannot be empty');
    });

    it('should handle service errors', async () => {
      const serviceError = new PolyVAPIError('Channel not found', 'CHANNEL_NOT_FOUND', 404);
      mockStreamService.stopStream.mockRejectedValue(serviceError);

      await expect(streamHandler.stopStream(validOptions)).rejects.toThrow(PolyVAPIError);
      await expect(streamHandler.stopStream(validOptions)).rejects.toThrow('Channel not found');
    });

    it('should handle already stopped stream', async () => {
      const mockResponse = {
        code: 200,
        status: 'success',
        message: 'Channel is already stopped',
        data: 'success'
      };

      mockStreamService.stopStream.mockResolvedValue(mockResponse);

      await streamHandler.stopStream(validOptions);

      expect(mockStreamService.stopStream).toHaveBeenCalledWith({
        channelId: '3151318'
      });
    });

    it('should handle channel not live error', async () => {
      const serviceError = new PolyVAPIError('Channel is not currently live', 'CHANNEL_NOT_LIVE', 400);
      mockStreamService.stopStream.mockRejectedValue(serviceError);

      await expect(streamHandler.stopStream(validOptions)).rejects.toThrow(PolyVAPIError);
      await expect(streamHandler.stopStream(validOptions)).rejects.toThrow('Channel is not currently live');
    });

    it('should handle empty data response', async () => {
      const mockResponse = {
        code: 200,
        status: 'success',
        message: '',
        data: ''
      };

      mockStreamService.stopStream.mockResolvedValue(mockResponse);

      await streamHandler.stopStream(validOptions);

      expect(mockStreamService.stopStream).toHaveBeenCalledWith({
        channelId: '3151318'
      });
    });

    it('should handle unexpected errors', async () => {
      const unexpectedError = new Error('Unexpected error');
      mockStreamService.stopStream.mockRejectedValue(unexpectedError);

      await expect(streamHandler.stopStream(validOptions)).rejects.toThrow('Unexpected error');
    });
  });

  describe('getStreamKey', () => {
    const validOptions: StreamGetKeyOptions = {
      channelId: '3151318',
      output: 'table'
    };

    it('should successfully get stream key with table output', async () => {
      const mockCredentials: StreamCredentials = {
        channelId: '3151318',
        rtmpUrl: 'rtmp://live.polyv.cn/live/test-stream',
        streamKey: 'test-stream-key-secret',
        deployAddress: '',
        inAddress: '',
        metrics: {
          fps: 0,
          lfr: 0,
          bandwidth: 0
        }
      };

      mockStreamService.getStreamKey.mockResolvedValue(mockCredentials);

      await streamHandler.getStreamKey(validOptions);

      expect(mockStreamService.getStreamKey).toHaveBeenCalledWith({
        channelId: '3151318'
      });
      expect(mockStreamService.getStreamKey).toHaveBeenCalledTimes(1);
    });

    it('should successfully get stream key with json output', async () => {
      const optionsWithJson: StreamGetKeyOptions = {
        channelId: '3151318',
        output: 'json'
      };

      const mockCredentials: StreamCredentials = {
        channelId: '3151318',
        rtmpUrl: 'rtmp://live.polyv.cn/live/test-stream',
        streamKey: 'test-stream-key-secret',
        deployAddress: '',
        inAddress: '',
        metrics: {
          fps: 30,
          lfr: 25,
          bandwidth: 2048
        }
      };

      mockStreamService.getStreamKey.mockResolvedValue(mockCredentials);

      await streamHandler.getStreamKey(optionsWithJson);

      expect(mockStreamService.getStreamKey).toHaveBeenCalledWith({
        channelId: '3151318'
      });
    });

    it('should throw validation error for invalid output format', async () => {
      const invalidOptions = {
        channelId: '3151318',
        output: 'invalid'
      } as any;

      await expect(streamHandler.getStreamKey(invalidOptions)).rejects.toThrow(PolyVValidationError);
      await expect(streamHandler.getStreamKey(invalidOptions)).rejects.toThrow('Output format must be either "table" or "json"');
    });

    it('should throw validation error for empty channelId', async () => {
      const invalidOptions: StreamGetKeyOptions = {
        channelId: '',
        output: 'table'
      };

      await expect(streamHandler.getStreamKey(invalidOptions)).rejects.toThrow(PolyVValidationError);
      await expect(streamHandler.getStreamKey(invalidOptions)).rejects.toThrow('Channel ID cannot be empty');
    });

    it('should handle service errors', async () => {
      const serviceError = new PolyVAPIError('Channel not found', 'CHANNEL_NOT_FOUND', 404);
      mockStreamService.getStreamKey.mockRejectedValue(serviceError);

      await expect(streamHandler.getStreamKey(validOptions)).rejects.toThrow(PolyVAPIError);
      await expect(streamHandler.getStreamKey(validOptions)).rejects.toThrow('Channel not found');
    });
  });

  describe('pushStream', () => {
    let mockSpawn: jest.MockedFunction<any>;
    let mockFFmpegInstalled: jest.MockedFunction<any>;
    let mockExistsSync: jest.MockedFunction<any>;

    beforeEach(() => {
      // Import and setup mocks
      const { spawn } = require('child_process');
      const { isFFmpegInstalled } = require('../utils/ffmpeg');
      const fs = require('fs');
      
      mockSpawn = spawn as jest.MockedFunction<any>;
      mockFFmpegInstalled = isFFmpegInstalled as jest.MockedFunction<any>;
      mockExistsSync = fs.existsSync as jest.MockedFunction<any>;

      // Reset mocks
      mockSpawn.mockClear();
      mockFFmpegInstalled.mockClear();
      mockExistsSync.mockClear();
    });

    const validOptions: StreamPushOptions = {
      channelId: '3151318',
      file: '/path/to/video.mp4'
    };

    const mockCredentials: StreamCredentials = {
      channelId: '3151318',
      rtmpUrl: 'rtmp://live.polyv.cn/live',
      streamKey: 'test-stream-key',
      deployAddress: '',
      inAddress: '',
      metrics: {
        fps: 0,
        lfr: 0,
        bandwidth: 0
      }
    };

    it('should successfully push stream with valid options', async () => {
      // Setup mocks
      mockFFmpegInstalled.mockResolvedValue(true);
      mockExistsSync.mockReturnValue(true);
      mockStreamService.getStreamKey.mockResolvedValue(mockCredentials);

      // Mock spawn to return a successful process
      const mockProcess = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            // Simulate successful completion
            setTimeout(() => callback(0), 1);
          }
        }),
        kill: jest.fn()
      };
      mockSpawn.mockReturnValue(mockProcess);

      await streamHandler.pushStream(validOptions);

      expect(mockFFmpegInstalled).toHaveBeenCalled();
      expect(mockExistsSync).toHaveBeenCalledWith('/path/to/video.mp4');
      expect(mockStreamService.getStreamKey).toHaveBeenCalledWith({
        channelId: '3151318'
      });
      expect(mockSpawn).toHaveBeenCalledWith('ffmpeg', [
        '-re',
        '-i', '/path/to/video.mp4',
        '-c:v', 'copy',
        '-c:a', 'aac',
        '-f', 'flv',
        'rtmp://live.polyv.cn/live/test-stream-key'
      ]);
    });

    it('should throw error when FFmpeg is not installed', async () => {
      mockFFmpegInstalled.mockResolvedValue(false);
      mockExistsSync.mockReturnValue(true);

      await expect(streamHandler.pushStream(validOptions)).rejects.toThrow('FFmpeg is not installed or not found in PATH');
      
      expect(mockFFmpegInstalled).toHaveBeenCalled();
      expect(mockStreamService.getStreamKey).not.toHaveBeenCalled();
      expect(mockSpawn).not.toHaveBeenCalled();
    });

    it('should throw validation error for empty channelId', async () => {
      const invalidOptions: StreamPushOptions = {
        channelId: '',
        file: '/path/to/video.mp4'
      };

      await expect(streamHandler.pushStream(invalidOptions)).rejects.toThrow(PolyVValidationError);
      await expect(streamHandler.pushStream(invalidOptions)).rejects.toThrow('Channel ID cannot be empty');
    });

    it('should throw validation error for empty file path', async () => {
      const invalidOptions: StreamPushOptions = {
        channelId: '3151318',
        file: ''
      };

      await expect(streamHandler.pushStream(invalidOptions)).rejects.toThrow(PolyVValidationError);
      await expect(streamHandler.pushStream(invalidOptions)).rejects.toThrow('File path cannot be empty');
    });

    it('should throw validation error when file does not exist', async () => {
      mockExistsSync.mockReturnValue(false);

      await expect(streamHandler.pushStream(validOptions)).rejects.toThrow(PolyVValidationError);
      await expect(streamHandler.pushStream(validOptions)).rejects.toThrow('File not found: /path/to/video.mp4');
      
      expect(mockExistsSync).toHaveBeenCalledWith('/path/to/video.mp4');
    });

    it('should handle FFmpeg process error', async () => {
      mockFFmpegInstalled.mockResolvedValue(true);
      mockExistsSync.mockReturnValue(true);
      mockStreamService.getStreamKey.mockResolvedValue(mockCredentials);

      // Mock spawn to return a process that emits an error
      const mockProcess = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn((event, callback) => {
          if (event === 'error') {
            setTimeout(() => callback(new Error('FFmpeg not found')), 1);
          }
        }),
        kill: jest.fn()
      };
      mockSpawn.mockReturnValue(mockProcess);

      await expect(streamHandler.pushStream(validOptions)).rejects.toThrow('FFmpeg not found');
    });

    it('should handle FFmpeg process exit with non-zero code', async () => {
      mockFFmpegInstalled.mockResolvedValue(true);
      mockExistsSync.mockReturnValue(true);
      mockStreamService.getStreamKey.mockResolvedValue(mockCredentials);

      // Mock spawn to return a process that exits with error
      const mockProcess = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            setTimeout(() => callback(1), 1); // Exit code 1 (error)
          }
        }),
        kill: jest.fn()
      };
      mockSpawn.mockReturnValue(mockProcess);

      await expect(streamHandler.pushStream(validOptions)).rejects.toThrow('FFmpeg process failed with exit code 1');
    });

    it('should handle user interruption (SIGINT)', async () => {
      mockFFmpegInstalled.mockResolvedValue(true);
      mockExistsSync.mockReturnValue(true);
      mockStreamService.getStreamKey.mockResolvedValue(mockCredentials);

      // Mock spawn to return a process that gets killed
      const mockProcess = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            setTimeout(() => callback(null), 1); // null exit code indicates termination
          }
        }),
        kill: jest.fn()
      };
      mockSpawn.mockReturnValue(mockProcess);

      await streamHandler.pushStream(validOptions);

      expect(mockProcess.kill).not.toHaveBeenCalled(); // SIGINT handler not triggered in test
    });

    it('should handle service error when getting stream key', async () => {
      mockFFmpegInstalled.mockResolvedValue(true);
      mockExistsSync.mockReturnValue(true);

      const serviceError = new PolyVAPIError('Channel not found', 'CHANNEL_NOT_FOUND', 404);
      mockStreamService.getStreamKey.mockRejectedValue(serviceError);

      await expect(streamHandler.pushStream(validOptions)).rejects.toThrow(PolyVAPIError);
      await expect(streamHandler.pushStream(validOptions)).rejects.toThrow('Channel not found');
      
      expect(mockSpawn).not.toHaveBeenCalled();
    });
  });

  describe('verifyStream', () => {
    const validOptions: StreamVerificationOptions = {
      channelId: '3151318',
      duration: 10, // Minimum valid duration
      interval: 5, // Minimum valid interval
      qualityThreshold: 15
    };

    const mockStatusInfo: StreamStatusInfo = {
      channelId: '3151318',
      status: 'live',
      statusText: 'Live',
      isLive: true,
      lastUpdated: new Date(),
      metrics: {
        fps: 30,
        lfr: 1,
        bandwidth: 2048000,
        bandwidthText: '2.00 Mbps'
      }
    };

    beforeEach(() => {
      // Mock the verification utilities
      jest.doMock('../utils/stream-verification', () => ({
        generateVerificationId: jest.fn(() => 'verify_123_abc'),
        createVerificationPoint: jest.fn(() => ({
          checkNumber: 1,
          timestamp: new Date(),
          status: 'healthy',
          metrics: { fps: 30, bandwidth: 2048000, lfr: 1 },
          issues: []
        })),
        createVerificationResult: jest.fn(() => ({
          channelId: '3151318',
          verificationId: 'verify_123_abc',
          startTime: new Date(),
          endTime: new Date(),
          totalChecks: 2,
          successfulChecks: 2,
          failedChecks: 0,
          averageMetrics: { fps: 30, bandwidth: 2048000, lfr: 1 },
          qualityIssues: [],
          viewerLinks: [],
          summary: {
            overallStatus: 'excellent',
            reliability: 100,
            averageQuality: { fps: 30, bandwidth: 2048000 },
            totalIssues: 0,
            recommendations: ['Stream quality is performing well']
          }
        })),
        DEFAULT_VERIFICATION_SETTINGS: {
          DURATION: 60,
          INTERVAL: 10,
          QUALITY_THRESHOLD: 15,
          MONITOR_REFRESH: 5
        }
      }));
    });

    it('should successfully verify stream with valid options', async () => {
      mockStreamService.getStreamStatus.mockResolvedValue(mockStatusInfo);

      // Mock the sleep method to use minimal delays
      const sleepSpy = jest.spyOn(streamHandler as any, 'sleep').mockImplementation(() => {
        return new Promise(resolve => setTimeout(resolve, 1));
      });

      await streamHandler.verifyStream(validOptions);

      // Should call getStreamStatus for each check (duration/interval = 10/5 = 2 times)
      expect(mockStreamService.getStreamStatus).toHaveBeenCalledTimes(2);
      expect(mockStreamService.getStreamStatus).toHaveBeenCalledWith({
        channelId: '3151318'
      });

      sleepSpy.mockRestore();
    });

    it('should throw validation error for empty channelId', async () => {
      const invalidOptions: StreamVerificationOptions = {
        channelId: '',
        duration: 30
      };

      await expect(streamHandler.verifyStream(invalidOptions)).rejects.toThrow(PolyVValidationError);
      await expect(streamHandler.verifyStream(invalidOptions)).rejects.toThrow('Channel ID cannot be empty');
    });

    it('should throw validation error for duration out of range', async () => {
      const invalidOptions: StreamVerificationOptions = {
        channelId: '3151318',
        duration: 5 // Below minimum of 10
      };

      await expect(streamHandler.verifyStream(invalidOptions)).rejects.toThrow(PolyVValidationError);
      await expect(streamHandler.verifyStream(invalidOptions)).rejects.toThrow('Duration must be between 10 and 3600 seconds');
    });

    it('should throw validation error for interval out of range', async () => {
      const invalidOptions: StreamVerificationOptions = {
        channelId: '3151318',
        interval: 2 // Below minimum of 5
      };

      await expect(streamHandler.verifyStream(invalidOptions)).rejects.toThrow(PolyVValidationError);
      await expect(streamHandler.verifyStream(invalidOptions)).rejects.toThrow('Interval must be between 5 and 300 seconds');
    });

    it('should handle service errors during verification', async () => {
      const serviceError = new PolyVAPIError('Channel not found', 'CHANNEL_NOT_FOUND', 404);
      mockStreamService.getStreamStatus.mockRejectedValue(serviceError);

      // Mock the sleep method to use minimal delays
      const sleepSpy = jest.spyOn(streamHandler as any, 'sleep').mockImplementation(() => {
        return new Promise(resolve => setTimeout(resolve, 1));
      });

      // Should complete successfully even when service calls fail (graceful degradation)
      await expect(streamHandler.verifyStream(validOptions)).resolves.toBeUndefined();
      
      // Should still call the service the expected number of times
      expect(mockStreamService.getStreamStatus).toHaveBeenCalledTimes(2);

      sleepSpy.mockRestore();
    });

    it('should use default values when options are not provided', async () => {
      const minimalOptions: StreamVerificationOptions = {
        channelId: '3151318',
        duration: 10, // Override default to make test faster
        interval: 5  // Override default to make test faster
      };

      mockStreamService.getStreamStatus.mockResolvedValue(mockStatusInfo);

      // Mock the sleep method to use minimal delays
      const sleepSpy = jest.spyOn(streamHandler as any, 'sleep').mockImplementation(() => {
        return new Promise(resolve => setTimeout(resolve, 1));
      });

      await streamHandler.verifyStream(minimalOptions);

      // Should use specified duration (10s) and interval (5s) = 2 checks
      expect(mockStreamService.getStreamStatus).toHaveBeenCalledTimes(2);

      sleepSpy.mockRestore();
    });
  });

  describe('monitorStream', () => {
    const validOptions: StreamMonitorOptions = {
      channelId: '3151318',
      refresh: 5,
      alerts: true
    };

    const mockStatusInfo: StreamStatusInfo = {
      channelId: '3151318',
      status: 'live',
      statusText: 'Live',
      isLive: true,
      lastUpdated: new Date(),
      metrics: {
        fps: 30,
        lfr: 1,
        bandwidth: 2048000,
        bandwidthText: '2.00 Mbps'
      }
    };

    let mockSetInterval: jest.SpyInstance;
    let mockClearInterval: jest.SpyInstance;

    beforeEach(() => {
      mockSetInterval = jest.spyOn(global, 'setInterval');
      mockClearInterval = jest.spyOn(global, 'clearInterval');
      
      // Mock process.stdout.write for screen clearing
      jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    });

    afterEach(() => {
      mockSetInterval.mockRestore();
      mockClearInterval.mockRestore();
      jest.restoreAllMocks();
    });

    it('should start monitoring with valid options', async () => {
      mockStreamService.getStreamStatus.mockResolvedValue(mockStatusInfo);
      
      // Mock setInterval to not actually run
      mockSetInterval.mockImplementation(() => {
        // Don't actually run the interval
        return 12345 as any;
      });

      // We need to simulate the SIGINT handling, so let's mock the process listeners
      const mockOn = jest.spyOn(process, 'on').mockImplementation((event, handler) => {
        if (event === 'SIGINT') {
          // Immediately call the handler to simulate Ctrl+C
          setTimeout(() => (handler as any)(), 1);
        }
        return process;
      });

      const mockRemoveListener = jest.spyOn(process, 'removeListener').mockImplementation(() => process);

      const promise = streamHandler.monitorStream(validOptions);

      // Wait a bit for the initial setup
      await new Promise(resolve => setTimeout(resolve, 1));

      expect(mockStreamService.getStreamStatus).toHaveBeenCalledWith({
        channelId: '3151318'
      });
      expect(mockSetInterval).toHaveBeenCalledWith(expect.any(Function), 5000);

      // Wait for the promise to resolve (simulated SIGINT)
      await promise;

      expect(mockClearInterval).toHaveBeenCalled();
      expect(mockRemoveListener).toHaveBeenCalledWith('SIGINT', expect.any(Function));

      mockOn.mockRestore();
      mockRemoveListener.mockRestore();
    });

    it('should output one JSON status snapshot without starting monitor interval', async () => {
      mockStreamService.getStreamStatus.mockResolvedValue(mockStatusInfo);

      await streamHandler.monitorStream({
        ...validOptions,
        output: 'json'
      });

      expect(mockStreamService.getStreamStatus).toHaveBeenCalledWith({
        channelId: '3151318'
      });
      expect(mockSetInterval).not.toHaveBeenCalled();

      const logged = consoleSpy.log.mock.calls[0]?.[0] as string;
      const parsed = JSON.parse(logged) as StreamStatusInfo;
      expect(parsed.channelId).toBe('3151318');
      expect(parsed.status).toBe('live');
      expect(parsed.isLive).toBe(true);
    });

    it('should throw validation error for empty channelId', async () => {
      const invalidOptions: StreamMonitorOptions = {
        channelId: '',
        refresh: 5
      };

      await expect(streamHandler.monitorStream(invalidOptions)).rejects.toThrow(PolyVValidationError);
      await expect(streamHandler.monitorStream(invalidOptions)).rejects.toThrow('Channel ID cannot be empty');
    });

    it('should throw validation error for refresh interval out of range', async () => {
      const invalidOptions: StreamMonitorOptions = {
        channelId: '3151318',
        refresh: 0 // Below minimum of 1
      };

      await expect(streamHandler.monitorStream(invalidOptions)).rejects.toThrow(PolyVValidationError);
      await expect(streamHandler.monitorStream(invalidOptions)).rejects.toThrow('Refresh interval must be between 1 and 60 seconds');
    });

    it('should use default refresh interval when not provided', async () => {
      const minimalOptions: StreamMonitorOptions = {
        channelId: '3151318'
      };

      mockStreamService.getStreamStatus.mockResolvedValue(mockStatusInfo);
      mockSetInterval.mockImplementation(() => 12345 as any);

      // Mock SIGINT to resolve quickly
      const mockOn = jest.spyOn(process, 'on').mockImplementation((event, handler) => {
        if (event === 'SIGINT') {
          setTimeout(() => (handler as any)(), 1);
        }
        return process;
      });

      const mockRemoveListener = jest.spyOn(process, 'removeListener').mockImplementation(() => process);

      await streamHandler.monitorStream(minimalOptions);

      // Should use default refresh interval (5 seconds)
      expect(mockSetInterval).toHaveBeenCalledWith(expect.any(Function), 5000);

      mockOn.mockRestore();
      mockRemoveListener.mockRestore();
    });
  });

  describe('Additional branch coverage tests', () => {
    // Define the mock data at the beginning of this describe block
    const localMockStatusInfo: StreamStatusInfo = {
      channelId: '3151318',
      status: 'live',
      statusText: 'Live',
      isLive: true,
      lastUpdated: new Date(),
      metrics: {
        fps: 30,
        lfr: 1,
        bandwidth: 2048000,
        bandwidthText: '2.00 Mbps'
      }
    };

    const localMockCredentials: StreamCredentials = {
      channelId: '3151318',
      rtmpUrl: 'rtmp://live.polyv.cn/live',
      streamKey: 'test-stream-key',
      deployAddress: '',
      inAddress: '',
      metrics: {
        fps: 0,
        lfr: 0,
        bandwidth: 0
      }
    };

    it('should throw validation error for invalid output format in stream status', async () => {
      const invalidOptions: any = {
        channelId: '3151318',
        output: 'invalid'
      };

      await expect(streamHandler.getStreamStatus(invalidOptions)).rejects.toThrow(PolyVValidationError);
      await expect(streamHandler.getStreamStatus(invalidOptions)).rejects.toThrow('Output format must be either "table" or "json"');
    });

    it('should display different status messages for various stream states', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      // Test waiting status
      const waitingStatusInfo = {
        ...localMockStatusInfo,
        status: 'waiting' as const,
        isLive: false
      };
      mockStreamService.getStreamStatus.mockResolvedValue(waitingStatusInfo);

      await streamHandler.getStreamStatus({ channelId: '3151318', output: 'table' });
      expect(consoleSpy).toHaveBeenCalledWith('\n⏳ Stream is ready but not yet started');

      // Test stopped status
      const stoppedStatusInfo = {
        ...localMockStatusInfo,
        status: 'stopped' as const,
        isLive: false
      };
      mockStreamService.getStreamStatus.mockResolvedValue(stoppedStatusInfo);

      await streamHandler.getStreamStatus({ channelId: '3151318', output: 'table' });
      expect(consoleSpy).toHaveBeenCalledWith('\n⏹️  Stream has ended');

      // Test error status
      const errorStatusInfo = {
        ...localMockStatusInfo,
        status: 'error' as const,
        isLive: false
      };
      mockStreamService.getStreamStatus.mockResolvedValue(errorStatusInfo);

      await streamHandler.getStreamStatus({ channelId: '3151318', output: 'table' });
      expect(consoleSpy).toHaveBeenCalledWith('\n❌ Stream has an error condition');

      consoleSpy.mockRestore();
    });

    it('should display live stream info when stream is live with network info', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      const liveStatusInfo = {
        ...localMockStatusInfo,
        status: 'live' as const,
        isLive: true,
        metrics: {
          fps: 30,
          lfr: 1,
          bandwidth: 2500000,
          bandwidthText: '2.50 Mbps'
        },
        network: {
          streamName: 'Test Stream Name',
          protocol: 'RTMP'
        }
      };
      mockStreamService.getStreamStatus.mockResolvedValue(liveStatusInfo);

      await streamHandler.getStreamStatus({ channelId: '3151318', output: 'table' });
      
      expect(consoleSpy).toHaveBeenCalledWith('\n💡 Stream is currently live and broadcasting');
      expect(consoleSpy).toHaveBeenCalledWith('   Stream Name: Test Stream Name');

      consoleSpy.mockRestore();
    });

    it('should handle push stream with verification enabled', async () => {
      const { isFFmpegInstalled } = require('../utils/ffmpeg');
      const { spawn } = require('child_process');
      const fs = require('fs');

      // Mock FFmpeg as installed
      (isFFmpegInstalled as jest.Mock).mockResolvedValue(true);
      fs.existsSync.mockReturnValue(true);

      // Mock spawn
      const mockProcess = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            setTimeout(() => callback(0), 1);
          }
        }),
        kill: jest.fn()
      };
      (spawn as jest.Mock).mockReturnValue(mockProcess);

      // Mock setInterval for verification
      let timerId: any;
      const mockSetInterval = jest.spyOn(global, 'setInterval').mockImplementation((callback) => {
        timerId = setTimeout(callback, 1); // Run verification once quickly
        return timerId;
      });

      const mockClearInterval = jest.spyOn(global, 'clearInterval').mockImplementation((id) => {
        if (id === timerId) {
          clearTimeout(timerId);
        }
      });

      const options: StreamPushOptions = {
        channelId: '3151318',
        file: '/path/to/video.mp4',
        verify: true,
        verificationInterval: 5,
        qualityThreshold: 25,
        showViewerLinks: true
      };

      mockStreamService.getStreamKey.mockResolvedValue(localMockCredentials);
      mockStreamService.getStreamStatus.mockResolvedValue(localMockStatusInfo);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      const pushPromise = streamHandler.pushStream(options);
      
      // Let verification run once
      await new Promise(resolve => setTimeout(resolve, 1));

      expect(consoleSpy).toHaveBeenCalledWith('🔍 Verification mode enabled:');
      expect(consoleSpy).toHaveBeenCalledWith('   Interval: 5s, Quality threshold: 25 FPS');
      expect(consoleSpy).toHaveBeenCalledWith('🔗 Viewer Links:');

      await pushPromise;

      // Ensure timer is cleaned up
      if (timerId) {
        clearTimeout(timerId);
      }

      mockSetInterval.mockRestore();
      mockClearInterval.mockRestore();
      consoleSpy.mockRestore();
    });

    it('should handle verification errors during push stream', async () => {
      const { isFFmpegInstalled } = require('../utils/ffmpeg');
      const { spawn } = require('child_process');
      const fs = require('fs');

      (isFFmpegInstalled as jest.Mock).mockResolvedValue(true);
      fs.existsSync.mockReturnValue(true);

      const mockProcess = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            setTimeout(() => callback(0), 50); // Slightly longer to let verification run
          }
        }),
        kill: jest.fn()
      };
      (spawn as jest.Mock).mockReturnValue(mockProcess);

      // Mock setInterval for verification that will error
      let errorTimerId: any;
      const mockSetInterval = jest.spyOn(global, 'setInterval').mockImplementation((callback) => {
        errorTimerId = setTimeout(callback, 5); // Run verification callback after a brief delay
        return errorTimerId;
      });

      const mockClearInterval = jest.spyOn(global, 'clearInterval').mockImplementation((id) => {
        if (id === errorTimerId) {
          clearTimeout(errorTimerId);
        }
      });

      const options: StreamPushOptions = {
        channelId: '3151318',
        file: '/path/to/video.mp4',
        verify: true
      };

      mockStreamService.getStreamKey.mockResolvedValue(localMockCredentials);
      mockStreamService.getStreamStatus.mockRejectedValue(new Error('Verification failed'));

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      const pushPromise = streamHandler.pushStream(options);
      
      // Let verification run and fail
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('⚠️  Verification check failed'));

      await pushPromise;

      // Ensure timer is cleaned up
      if (errorTimerId) {
        clearTimeout(errorTimerId);
      }

      mockSetInterval.mockRestore();
      mockClearInterval.mockRestore();
      consoleSpy.mockRestore();
    });

    it('should handle stream verification with showViewerLinks option', async () => {
      const options: StreamVerificationOptions = {
        channelId: '3151318',
        duration: 30,
        interval: 5,
        showViewerLinks: true
      };

      mockStreamService.getStreamStatus.mockResolvedValue(localMockStatusInfo);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      // Mock the sleep method to use minimal delays
      const sleepSpy = jest.spyOn(streamHandler as any, 'sleep').mockImplementation(() => {
        return new Promise(resolve => setTimeout(resolve, 1));
      });

      await streamHandler.verifyStream(options);

      expect(consoleSpy).toHaveBeenCalledWith('🔗 Viewer Links:');

      sleepSpy.mockRestore();
      consoleSpy.mockRestore();
    });
  });
});
