/**
 * Resume state for the chunked upload.
 *
 * One JSON file per source file records the reserved vid, the storage upload id and the parts
 * already stored, so an interrupted upload continues instead of starting over. The file holds no
 * credentials: those are re-issued by the platform on resume.
 *
 * @module upload/checkpoint
 */

import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, resolve } from 'node:path';

import { PolyVVodError } from '../errors/index.js';
import type { ObjectStorageKind, ObjectStoragePart } from './object-storage.js';

export interface UploadCheckpoint {
  version: 1;
  vid: string;
  title?: string;
  /** Object key the parts are written to. */
  key: string;
  storage: ObjectStorageKind;
  uploadId: string;
  fileSize: number;
  fileModifiedMs: number;
  partSize: number;
  createdAt: number;
  parts: ObjectStoragePart[];
}

export const defaultCheckpointDir = (): string => resolve(tmpdir(), 'polyv-vod-upload');

/** Checkpoint file for a source file: its absolute path hashed, so the name is filesystem-safe. */
export function checkpointPath(checkpointDir: string, filePath: string): string {
  const digest = createHash('sha1').update(resolve(filePath)).digest('hex').slice(0, 32);
  return resolve(checkpointDir, `${digest}-${basename(filePath)}.json`);
}

/** Whether the checkpoint still describes this file (same size and modification time). */
export function isCheckpointFor(checkpoint: UploadCheckpoint, file: { size: number; mtimeMs: number }): boolean {
  return checkpoint.fileSize === file.size && checkpoint.fileModifiedMs === file.mtimeMs;
}

export async function readCheckpoint(path: string): Promise<UploadCheckpoint | null> {
  let text: string;
  try {
    text = await readFile(path, 'utf8');
  } catch (error) {
    if (isMissing(error)) return null;
    throw error;
  }
  try {
    const parsed = JSON.parse(text) as UploadCheckpoint;
    if (parsed?.version !== 1 || typeof parsed.vid !== 'string' || typeof parsed.uploadId !== 'string') return null;
    return parsed;
  } catch {
    // An unreadable checkpoint only costs the resume; the upload restarts from scratch.
    return null;
  }
}

/**
 * Writes atomically so an interrupted write never leaves a half-written checkpoint.
 *
 * Parallel part uploads each record their part, so the temporary name is unique per call:
 * a shared one would be renamed away by the first writer and break the others.
 */
export async function writeCheckpoint(path: string, checkpoint: UploadCheckpoint): Promise<void> {
  await mkdir(dirname(path), { recursive: true, mode: 0o700 });
  const temporary = `${path}.${process.pid}.${randomUUID().slice(0, 8)}.tmp`;
  try {
    await writeFile(temporary, `${JSON.stringify(checkpoint, null, 2)}\n`, { mode: 0o600 });
    await rename(temporary, path);
  } catch (error) {
    await removeCheckpoint(temporary);
    throw error;
  }
}

export async function removeCheckpoint(path: string): Promise<void> {
  try {
    await unlink(path);
  } catch (error) {
    if (!isMissing(error)) throw error;
  }
}

function isMissing(error: unknown): boolean {
  return (error as NodeJS.ErrnoException).code === 'ENOENT';
}

export function checkpointError(message: string, cause?: unknown): PolyVVodError {
  return new PolyVVodError('upload', message, { cause });
}
