/**
 * File helpers.
 *
 * @module utils/file
 */

import type { Stats } from 'node:fs';
import { stat } from 'node:fs/promises';

import { PolyVVodError } from '../errors/index.js';

/** File stats, with an unreadable path reported as a validation error. */
export async function fileStats(filePath: string): Promise<Stats> {
  try {
    return await stat(filePath);
  } catch (error) {
    const reason = (error as NodeJS.ErrnoException).code === 'ENOENT' ? 'no such file' : (error as Error).message;
    throw new PolyVVodError('validation', `Cannot read file "${filePath}": ${reason}`, { cause: error });
  }
}
