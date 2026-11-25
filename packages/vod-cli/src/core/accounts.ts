/**
 * Saved accounts, kept in `~/.polyv-vod/accounts.json` with the secrets encrypted.
 */
import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import { decryptSecret, encryptSecret } from './crypto';
import { accountsFile } from './paths';

/** Everything the CLI needs to call the platform. */
export interface VodCredentials {
  userId: string;
  secretKey: string;
  writeToken?: string;
  readToken?: string;
  /** Account API credentials; only the V4 endpoints need them. */
  appId?: string;
  appSecret?: string;
}

/** One account as it is stored on disk; secrets are encrypted. */
interface StoredAccount {
  userId: string;
  secretKey: string;
  writeToken?: string;
  readToken?: string;
  appId?: string;
  appSecret?: string;
  createdAt: string;
}

interface StoreFile {
  version: 1;
  defaultAccount?: string;
  accounts: Record<string, StoredAccount>;
}

/** One account with its secrets decrypted. */
export interface AccountRecord extends VodCredentials {
  name: string;
  createdAt: string;
}

export class AccountStoreError extends Error {}

export const ACCOUNT_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/;

export function assertAccountName(name: string): void {
  if (!ACCOUNT_NAME_PATTERN.test(name)) {
    throw new AccountStoreError(`Account name "${name}" is invalid: use letters, digits, "-" or "_", starting with a letter or digit (max 64 characters)`);
  }
}

export class AccountStore {
  constructor(readonly filePath: string = accountsFile()) {}

  list(): AccountRecord[] {
    const { accounts } = this.read();
    return Object.keys(accounts)
      .sort()
      .map((name) => this.toRecord(name, accounts[name]));
  }

  get(name: string): AccountRecord | undefined {
    const stored = this.read().accounts[name];
    return stored ? this.toRecord(name, stored) : undefined;
  }

  exists(name: string): boolean {
    return Object.prototype.hasOwnProperty.call(this.read().accounts, name);
  }

  add(name: string, credentials: VodCredentials, options: { replace?: boolean } = {}): AccountRecord {
    assertAccountName(name);
    const file = this.read();
    const exists = Object.prototype.hasOwnProperty.call(file.accounts, name);
    if (exists && !options.replace) {
      throw new AccountStoreError(`Account "${name}" already exists; pass --replace to overwrite it`);
    }
    const record: StoredAccount = {
      userId: credentials.userId,
      secretKey: encryptSecret(credentials.secretKey),
      createdAt: file.accounts[name]?.createdAt ?? new Date().toISOString(),
      ...(credentials.writeToken ? { writeToken: encryptSecret(credentials.writeToken) } : {}),
      ...(credentials.readToken ? { readToken: encryptSecret(credentials.readToken) } : {}),
      ...(credentials.appId ? { appId: credentials.appId } : {}),
      ...(credentials.appSecret ? { appSecret: encryptSecret(credentials.appSecret) } : {})
    };
    file.accounts[name] = record;
    this.write(file);
    return this.toRecord(name, record);
  }

  /** Removes an account; resolves to false when there was none. */
  remove(name: string): boolean {
    const file = this.read();
    if (!this.exists(name)) return false;
    delete file.accounts[name];
    if (file.defaultAccount === name) delete file.defaultAccount;
    this.write(file);
    return true;
  }

  defaultName(): string | undefined {
    return this.read().defaultAccount;
  }

  setDefault(name: string): void {
    const file = this.read();
    if (!this.exists(name)) throw new AccountStoreError(`Account "${name}" is not saved`);
    file.defaultAccount = name;
    this.write(file);
  }

  unsetDefault(): boolean {
    const file = this.read();
    if (!file.defaultAccount) return false;
    delete file.defaultAccount;
    this.write(file);
    return true;
  }

  private read(): StoreFile {
    let text: string;
    try {
      text = readFileSync(this.filePath, 'utf8');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { version: 1, accounts: {} };
      throw error;
    }
    try {
      const parsed = JSON.parse(text) as Partial<StoreFile>;
      if (parsed.version !== 1 || typeof parsed.accounts !== 'object' || parsed.accounts === null) {
        throw new Error('unsupported format');
      }
      return { version: 1, defaultAccount: parsed.defaultAccount, accounts: parsed.accounts };
    } catch (error) {
      throw new AccountStoreError(
        `Cannot read the account file ${this.filePath}: ${(error as Error).message}. Fix or remove the file, then add the accounts again.`
      );
    }
  }

  private write(file: StoreFile): void {
    mkdirSync(dirname(this.filePath), { recursive: true, mode: 0o700 });
    const temporary = `${this.filePath}.${process.pid}.tmp`;
    writeFileSync(temporary, `${JSON.stringify(file, null, 2)}\n`, { mode: 0o600 });
    // Written next to the target and renamed, so an interrupted write never truncates the file.
    renameSync(temporary, this.filePath);
  }

  private toRecord(name: string, stored: StoredAccount): AccountRecord {
    return {
      name,
      userId: stored.userId,
      secretKey: decryptSecret(stored.secretKey),
      createdAt: stored.createdAt,
      ...(stored.writeToken ? { writeToken: decryptSecret(stored.writeToken) } : {}),
      ...(stored.readToken ? { readToken: decryptSecret(stored.readToken) } : {}),
      ...(stored.appId ? { appId: stored.appId } : {}),
      ...(stored.appSecret ? { appSecret: decryptSecret(stored.appSecret) } : {})
    };
  }
}
