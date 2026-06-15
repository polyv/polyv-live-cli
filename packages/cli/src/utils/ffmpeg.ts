import { exec } from 'child_process';

/**
 * Checks if ffmpeg is installed and available in the system's PATH.
 * @returns {Promise<boolean>} A promise that resolves to true if ffmpeg is found, false otherwise.
 */
export function isFFmpegInstalled(): Promise<boolean> {
  return new Promise((resolve) => {
    exec('ffmpeg -version', (error) => {
      if (error) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}
