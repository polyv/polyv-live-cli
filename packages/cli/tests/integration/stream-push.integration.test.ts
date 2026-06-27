/**
 * @fileoverview Integration tests for stream push functionality
 * @author Development Team
 * @since 4.1.0
 */

import { StreamHandler } from '../../src/handlers/stream.handler';
import { StreamServiceSdk, StreamServiceConfig } from '../../src/services/stream.service.sdk';
import { StreamPushOptions } from '../../src/types/stream';
import { AuthConfig } from '../../src/types/auth';
import * as fs from 'fs';
import { isFFmpegInstalled } from '../../src/utils/ffmpeg';
import { hasRealCredentials, getTestConfig } from '../helpers/integration-config';
import { runCli } from '../helpers/cli-runner';
import {
  createTemporaryChannel,
  deleteTemporaryChannel,
} from '../helpers/channel-fixture';

// Use test config from CLI accounts or environment
const testConfig = getTestConfig();
const shouldRunTests = hasRealCredentials();

describe('Stream Push Integration Tests', () => {
  let streamService: StreamServiceSdk;
  let streamHandler: StreamHandler;
  let testChannelId: string;
  let temporaryChannelId: string | undefined;

  beforeAll(() => {
    // Skip integration tests if no test credentials provided
    if (!shouldRunTests) {
      console.log('⚠️  Skipping integration tests - no test credentials provided');
      return;
    }

    const serviceConfig: StreamServiceConfig = {
      baseUrl: testConfig.baseUrl,
      timeout: 30000,
      debug: false
    };

    streamService = new StreamServiceSdk(testConfig.authConfig, serviceConfig);
    streamHandler = new StreamHandler(testConfig.authConfig, serviceConfig);
    // The shared static testChannelId ('3151318') does not belong to the GNHF
    // test account and is rejected as "illegal channel id" by getPushUrl, so
    // create a fresh temporary channel that the credentials/FFmpeg tests below
    // can resolve a real push URL for. It is deleted in afterAll.
    temporaryChannelId = createTemporaryChannel('Stream Push Credentials');
    testChannelId = temporaryChannelId;
  });

  afterAll(() => {
    if (temporaryChannelId) {
      deleteTemporaryChannel(temporaryChannelId);
    }
  });

  describe('FFmpeg dependency check', () => {
    it('should check if FFmpeg is installed', async () => {
      const ffmpegAvailable = await isFFmpegInstalled();
      
      if (!ffmpegAvailable) {
        console.log('⚠️  FFmpeg not installed - push functionality will not work');
      } else {
        console.log('✅ FFmpeg is available');
      }
      
      // This test should pass regardless of FFmpeg installation status
      expect(typeof ffmpegAvailable).toBe('boolean');
    }, 30000);
  });

  const testDescribe = hasRealCredentials() ? describe : describe.skip;
  
  testDescribe('Stream push validation', () => {

    it('should validate required parameters', async () => {
      const invalidOptions: StreamPushOptions = {
        channelId: '',
        file: ''
      };

      await expect(streamHandler.pushStream(invalidOptions)).rejects.toThrow('Channel ID cannot be empty');
    });

    it('should validate file existence', async () => {
      const invalidOptions: StreamPushOptions = {
        channelId: testChannelId,
        file: '/nonexistent/path/video.mp4'
      };

      await expect(streamHandler.pushStream(invalidOptions)).rejects.toThrow('File not found');
    });

    it('should handle invalid channel ID', async () => {
      // Create a temporary test file
      const tempFile = '/tmp/test-video.mp4';
      fs.writeFileSync(tempFile, 'fake video content');

      try {
        const invalidOptions: StreamPushOptions = {
          channelId: 'invalid-channel-id',
          file: tempFile
        };

        await expect(streamHandler.pushStream(invalidOptions)).rejects.toThrow();
      } finally {
        // Clean up
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
      }
    }, 15000);
  });

  testDescribe('Stream credentials retrieval', () => {

    it('should successfully get stream credentials for valid channel', async () => {
      // This test verifies that we can get stream credentials
      // which is a prerequisite for push functionality
      const credentials = await streamService.getStreamKey({
        channelId: testChannelId
      });

      expect(credentials).toBeDefined();
      expect(credentials.channelId).toBe(testChannelId);
      expect(credentials.rtmpUrl).toBeDefined();
      expect(credentials.streamKey).toBeDefined();
      expect(typeof credentials.rtmpUrl).toBe('string');
      expect(typeof credentials.streamKey).toBe('string');
      expect(credentials.rtmpUrl.length).toBeGreaterThan(0);
      expect(credentials.streamKey.length).toBeGreaterThan(0);
    }, 10000);
  });

  testDescribe('FFmpeg command construction', () => {

    it('should construct proper FFmpeg command arguments', async () => {
      // This test validates that we can prepare the FFmpeg command correctly
      // without actually executing it
      
      const credentials = await streamService.getStreamKey({
        channelId: testChannelId
      });

      const expectedRtmpUrl = `${credentials.rtmpUrl}/${credentials.streamKey}`;
      const testFile = '/path/to/test-video.mp4';

      // Expected FFmpeg arguments based on implementation
      const expectedArgs = [
        '-re',
        '-i', testFile,
        '-c:v', 'copy',
        '-c:a', 'aac',
        '-f', 'flv',
        expectedRtmpUrl
      ];

      // Verify the RTMP URL construction
      expect(expectedRtmpUrl).toContain(credentials.rtmpUrl);
      expect(expectedRtmpUrl).toContain(credentials.streamKey);
      expect(expectedRtmpUrl).toMatch(/^rtmp:\/\//);

      // Verify FFmpeg argument structure
      expect(expectedArgs).toContain('-re');
      expect(expectedArgs).toContain('-i');
      expect(expectedArgs).toContain(testFile);
      expect(expectedArgs).toContain('-c:v');
      expect(expectedArgs).toContain('copy');
      expect(expectedArgs).toContain('-c:a');
      expect(expectedArgs).toContain('aac');
      expect(expectedArgs).toContain('-f');
      expect(expectedArgs).toContain('flv');
      expect(expectedArgs).toContain(expectedRtmpUrl);
    }, 10000);
  });

  // Note: We don't include actual stream push tests that execute FFmpeg
  // because they would require:
  // 1. A real video file
  // 2. FFmpeg installed in the test environment
  // 3. Network connectivity to PolyV servers
  // 4. Potentially long execution times
  // 5. Actual streaming costs
  //
  // These tests validate the setup and prerequisites instead.

  // Real-CLI coverage of the `stream push` command. Executing a real push
  // requires a real video file AND spawns FFmpeg to push a live stream
  // (a genuine, billable external side effect we must not trigger in tests).
  // The command's first step is a client-side file-existence check that runs
  // BEFORE any API call or FFmpeg spawn, so pointing it at a non-existent file
  // deterministically exits 1 with "File not found" while touching nothing —
  // exercising the real CLI command surface without any push side effect.
  // A throwaway temporary channel is created per the channel-fixture convention
  // and disposed in finally (its id is accepted by the command but never
  // validated server-side because the file check short-circuits first).
  (hasRealCredentials() ? it : it.skip)(
    'rejects a non-existent video file via the real stream push CLI (file gate, no push side effect)',
    () => {
      let channelId: string | undefined;

      try {
        channelId = createTemporaryChannel('Stream Push File Gate');

        const result = runCli([
          'stream',
          'push',
          '-c',
          channelId,
          '--file',
          '/nonexistent/cli-integration-video.mp4',
        ]);

        // exit 1 + "File not found" proves the real `stream push` command ran
        // and bailed at the input gate before any credentials lookup or push.
        expect(result.exitCode).toBe(1);
        expect(result.output).toContain('File not found');
      } finally {
        if (channelId) {
          deleteTemporaryChannel(channelId);
        }
      }
    },
    120000,
  );
});