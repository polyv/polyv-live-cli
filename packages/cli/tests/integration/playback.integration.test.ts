/**
 * @fileoverview Integration tests for playback commands
 * @author Development Team
 * @since 9.1.0
 */

import { PlaybackServiceSdk } from '../../src/services/playback.service.sdk';
import { hasRealCredentials, getTestConfig } from '../helpers/integration-config';

const testConfig = getTestConfig();
const shouldRunTests = hasRealCredentials();

(shouldRunTests ? describe : describe.skip)('Playback Integration Tests', () => {
  let playbackService: PlaybackServiceSdk;
  let testChannelId: string;

  beforeAll(() => {
    playbackService = new PlaybackServiceSdk(testConfig.authConfig, {
      baseUrl: testConfig.baseUrl,
      timeout: 30000,
      debug: false
    });
    testChannelId = testConfig.testChannelId;
  });

  // ========================================
  // Playback List Tests
  // ========================================

  describe('playback list', () => {
    it('should list playback videos for a channel', async () => {
      const result = await playbackService.getPlaybackList({
        channelId: testChannelId,
        page: 1,
        pageSize: 10
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result.contents)).toBe(true);
      expect(typeof result.pageNumber).toBe('number');
      expect(typeof result.pageSize).toBe('number');
      expect(typeof result.totalItems).toBe('number');

      if (result.contents.length > 0) {
        const playback = result.contents[0];
        expect(playback.videoId).toBeDefined();
        expect(playback.channelId).toBe(testChannelId);
      }
    }, 15000);

    it('should handle pagination', async () => {
      const result = await playbackService.getPlaybackList({
        channelId: testChannelId,
        page: 1,
        pageSize: 5
      });

      expect(result.pageSize).toBe(5);
      expect(result.contents.length).toBeLessThanOrEqual(5);
    }, 15000);

    it('should filter by listType', async () => {
      const result = await playbackService.getPlaybackList({
        channelId: testChannelId,
        listType: 'playback',
        page: 1,
        pageSize: 10
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result.contents)).toBe(true);
    }, 15000);

    it('should validate required channelId', async () => {
      await expect(
        playbackService.getPlaybackList({
          channelId: ''
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate page parameter', async () => {
      await expect(
        playbackService.getPlaybackList({
          channelId: testChannelId,
          page: 0
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate listType parameter', async () => {
      await expect(
        playbackService.getPlaybackList({
          channelId: testChannelId,
          listType: 'invalid' as any
        })
      ).rejects.toThrow();
    }, 10000);

    it('should handle large page numbers', async () => {
      const result = await playbackService.getPlaybackList({
        channelId: testChannelId,
        page: 9999,
        pageSize: 10
      });

      expect(result).toBeDefined();
      expect(result.contents).toEqual([]);
    }, 15000);
  });

  // ========================================
  // Playback Delete Tests
  // ========================================

  describe('playback delete', () => {
    it('should validate required parameters', async () => {
      await expect(
        playbackService.deletePlayback('', 'video123')
      ).rejects.toThrow();

      await expect(
        playbackService.deletePlayback(testChannelId, '')
      ).rejects.toThrow();
    }, 10000);

    it('should validate listType parameter', async () => {
      await expect(
        playbackService.deletePlayback(testChannelId, 'video123', 'invalid' as any)
      ).rejects.toThrow();
    }, 10000);

    it('should fail for non-existent video', async () => {
      await expect(
        playbackService.deletePlayback(testChannelId, 'nonexistentvideo12345')
      ).rejects.toThrow();
    }, 15000);
  });

  // ========================================
  // Playback Merge Tests
  // ========================================

  describe('playback merge', () => {
    it('should validate required channelId', async () => {
      await expect(
        playbackService.mergePlayback('', ['file1', 'file2'])
      ).rejects.toThrow();
    }, 10000);

    it('should validate required fileIds', async () => {
      await expect(
        playbackService.mergePlayback(testChannelId, [])
      ).rejects.toThrow();

      await expect(
        playbackService.mergePlayback(testChannelId, [''])
      ).rejects.toThrow();
    }, 10000);

    it('should validate fileIds are non-empty strings', async () => {
      await expect(
        playbackService.mergePlayback(testChannelId, ['file1', ''])
      ).rejects.toThrow();
    }, 10000);

    it('should fail for non-existent file IDs', async () => {
      await expect(
        playbackService.mergePlayback(testChannelId, ['nonexistentfile1', 'nonexistentfile2'])
      ).rejects.toThrow();
    }, 15000);
  });

  // ========================================
  // Playback Merge Async Tests
  // ========================================

  describe('playback merge async', () => {
    it('should validate required channelId', async () => {
      await expect(
        playbackService.mergePlaybackAsync('', ['file1', 'file2'])
      ).rejects.toThrow();
    }, 10000);

    it('should validate required fileIds', async () => {
      await expect(
        playbackService.mergePlaybackAsync(testChannelId, [])
      ).rejects.toThrow();
    }, 10000);

    it('should fail for non-existent file IDs', async () => {
      await expect(
        playbackService.mergePlaybackAsync(
          testChannelId,
          ['nonexistentfile1', 'nonexistentfile2'],
          { fileName: 'Test Merge' }
        )
      ).rejects.toThrow();
    }, 15000);
  });
});
