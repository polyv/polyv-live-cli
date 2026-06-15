/**
 * Unit tests for ffmpeg utilities
 */

import { exec } from 'child_process';
import { isFFmpegInstalled } from './ffmpeg';

// Mock child_process
jest.mock('child_process');

const mockExec = exec as jest.MockedFunction<typeof exec>;

describe('FFmpeg Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isFFmpegInstalled', () => {
    it('should return true when ffmpeg is installed', async () => {
      // Mock successful exec call (no error)
      mockExec.mockImplementation((_command, callback) => {
        if (callback) {
          (callback as any)(null, 'ffmpeg version 4.4.0', '');
        }
        return {} as any;
      });

      const result = await isFFmpegInstalled();
      expect(result).toBe(true);
      expect(mockExec).toHaveBeenCalledWith('ffmpeg -version', expect.any(Function));
    });

    it('should return false when ffmpeg is not installed', async () => {
      // Mock failed exec call (with error)
      const mockError = new Error('ffmpeg: command not found');
      mockExec.mockImplementation((_command, callback) => {
        if (callback) {
          (callback as any)(mockError, '', '');
        }
        return {} as any;
      });

      const result = await isFFmpegInstalled();
      expect(result).toBe(false);
      expect(mockExec).toHaveBeenCalledWith('ffmpeg -version', expect.any(Function));
    });

    it('should return false when exec encounters any error', async () => {
      // Mock various error scenarios
      const mockError = new Error('Permission denied');
      mockExec.mockImplementation((_command, callback) => {
        if (callback) {
          (callback as any)(mockError, '', '');
        }
        return {} as any;
      });

      const result = await isFFmpegInstalled();
      expect(result).toBe(false);
    });

    it('should handle exec callback being called without error', async () => {
      // Test the specific line 11 case where error is falsy
      mockExec.mockImplementation((_command, callback) => {
        if (callback) {
          // Explicitly pass null/undefined error to test line 11
          (callback as any)(null, 'ffmpeg version info', '');
        }
        return {} as any;
      });

      const result = await isFFmpegInstalled();
      expect(result).toBe(true);
    });

    it('should handle exec callback with falsy error values', async () => {
      // Test with undefined error
      mockExec.mockImplementation((_command, callback) => {
        if (callback) {
          (callback as any)(undefined as any, 'output', '');
        }
        return {} as any;
      });

      const result = await isFFmpegInstalled();
      expect(result).toBe(true);
    });
  });
});