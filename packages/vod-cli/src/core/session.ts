/**
 * The account the current user switched to with `polyv-vod-cli use <name>`.
 *
 * One choice per machine user, kept in `~/.polyv-vod/session.json`.
 */
import { mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import { sessionFile } from './paths';

interface SessionFile {
  account?: string;
  updatedAt?: string;
}

export class SessionStore {
  constructor(readonly filePath: string = sessionFile()) {}

  /** Name of the account chosen with `use`, when there is one and it is still saved. */
  get(): string | undefined {
    let text: string;
    try {
      text = readFileSync(this.filePath, 'utf8');
    } catch {
      return undefined;
    }
    try {
      const parsed = JSON.parse(text) as SessionFile;
      return typeof parsed.account === 'string' && parsed.account ? parsed.account : undefined;
    } catch {
      return undefined;
    }
  }

  set(accountName: string): void {
    mkdirSync(dirname(this.filePath), { recursive: true, mode: 0o700 });
    const temporary = `${this.filePath}.${process.pid}.tmp`;
    const content = `${JSON.stringify({ account: accountName, updatedAt: new Date().toISOString() }, null, 2)}\n`;
    writeFileSync(temporary, content, { mode: 0o600 });
    renameSync(temporary, this.filePath);
  }

  /** Resolves to false when no account was selected. */
  clear(): boolean {
    if (this.get() === undefined) return false;
    rmSync(this.filePath, { force: true });
    return true;
  }
}
