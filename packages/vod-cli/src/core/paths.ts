/**
 * Where the CLI keeps its local state.
 *
 * Everything lives under one directory, separate from the live CLI's (`~/.polyv`,
 * `~/.polyv-live-cli`), so the two never read each other's accounts.
 */
import { homedir } from 'node:os';
import { join } from 'node:path';

export const CONFIG_DIR_ENV = 'POLYV_VOD_HOME';
export const DEFAULT_CONFIG_DIR_NAME = '.polyv-vod';

export function configDir(): string {
  const override = process.env[CONFIG_DIR_ENV];
  if (override && override.trim()) return override;
  return join(homedir(), DEFAULT_CONFIG_DIR_NAME);
}

export const accountsFile = (dir: string = configDir()): string => join(dir, 'accounts.json');
export const sessionFile = (dir: string = configDir()): string => join(dir, 'session.json');
