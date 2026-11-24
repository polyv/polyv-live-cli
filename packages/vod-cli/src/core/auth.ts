/**
 * Which credentials a command uses.
 *
 * Resolution order, first match wins:
 * 1. Command-line flags: `--userId` with `--secretKey` (plus `--writeToken`, `--appId`, `--appSecret`).
 * 2. A saved account named with `--account <name>`.
 * 3. The account chosen with `polyv-vod-cli use <name>`.
 * 4. Environment variables: `POLYV_VOD_USER_ID` with `POLYV_VOD_SECRET_KEY`
 *    (plus `POLYV_VOD_WRITE_TOKEN`, `POLYV_VOD_READ_TOKEN`, `POLYV_VOD_APP_ID`, `POLYV_VOD_APP_SECRET`).
 * 5. The saved account marked as default.
 */
import type { AccountRecord, VodCredentials } from './accounts';
import { AccountStore } from './accounts';
import { SessionStore } from './session';

export type AuthSource = 'cli' | 'account' | 'session' | 'env' | 'default';

export interface AuthOptions {
  userId?: string;
  secretKey?: string;
  writeToken?: string;
  appId?: string;
  appSecret?: string;
  account?: string;
}

export interface ResolvedAuth {
  credentials: VodCredentials;
  source: AuthSource;
  /** Set when the credentials come from a saved account. */
  accountName?: string;
}

/** Names of the environment variables, kept in one place for messages and tests. */
export const AUTH_ENV_VARS = {
  userId: 'POLYV_VOD_USER_ID',
  secretKey: 'POLYV_VOD_SECRET_KEY',
  writeToken: 'POLYV_VOD_WRITE_TOKEN',
  readToken: 'POLYV_VOD_READ_TOKEN',
  appId: 'POLYV_VOD_APP_ID',
  appSecret: 'POLYV_VOD_APP_SECRET'
} as const;

export class AuthError extends Error {
  constructor(message: string, readonly hint?: string) {
    super(message);
  }
}

function flag(options: AuthOptions, key: 'userId' | 'secretKey' | 'writeToken' | 'appId' | 'appSecret'): string | undefined {
  const value = options[key];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

/** Credentials of a saved account, without the bookkeeping fields. */
function credentialsOf(record: VodCredentials): VodCredentials {
  return {
    userId: record.userId,
    secretKey: record.secretKey,
    ...(record.writeToken ? { writeToken: record.writeToken } : {}),
    ...(record.readToken ? { readToken: record.readToken } : {}),
    ...(record.appId ? { appId: record.appId } : {}),
    ...(record.appSecret ? { appSecret: record.appSecret } : {})
  };
}

function fromAccount(record: AccountRecord, source: 'account' | 'session' | 'default'): ResolvedAuth {
  return { credentials: credentialsOf(record), source, accountName: record.name };
}

/**
 * Picks the credentials for a command.
 *
 * @throws {AuthError} When credentials were given but are incomplete, or a named account is missing
 */
export function resolveAuth(store: AccountStore, session: SessionStore, options: AuthOptions, env: NodeJS.ProcessEnv = process.env): ResolvedAuth | null {
  const cli = {
    userId: flag(options, 'userId'),
    secretKey: flag(options, 'secretKey'),
    writeToken: flag(options, 'writeToken'),
    appId: flag(options, 'appId'),
    appSecret: flag(options, 'appSecret')
  };
  if (cli.userId !== undefined || cli.secretKey !== undefined) {
    if (!cli.userId || !cli.secretKey) {
      throw new AuthError('--userId and --secretKey must be given together');
    }
    const { userId, secretKey, writeToken, appId, appSecret } = cli;
    return { source: 'cli', credentials: credentialsOf({ userId, secretKey, writeToken, appId, appSecret }) };
  }

  const named = typeof options.account === 'string' && options.account.trim() ? options.account.trim() : undefined;
  if (named) {
    const record = store.get(named);
    if (!record) throw new AuthError(`Account "${named}" is not saved`, 'List the saved accounts with: polyv-vod-cli account list');
    return fromAccount(record, 'account');
  }

  const sessionName = session.get();
  if (sessionName) {
    const record = store.get(sessionName);
    if (record) return fromAccount(record, 'session');
  }

    const fromEnv = (name: (typeof AUTH_ENV_VARS)[keyof typeof AUTH_ENV_VARS]): string | undefined => {
      const value = env[name]?.trim();
      return value ? value : undefined;
    };
    const envUserId = fromEnv(AUTH_ENV_VARS.userId);
    const envSecretKey = fromEnv(AUTH_ENV_VARS.secretKey);
    if (envUserId !== undefined || envSecretKey !== undefined) {
      if (!envUserId || !envSecretKey) {
        throw new AuthError(`${AUTH_ENV_VARS.userId} and ${AUTH_ENV_VARS.secretKey} must be set together`);
      }
      return {
        source: 'env',
        credentials: credentialsOf({
          userId: envUserId,
          secretKey: envSecretKey,
          writeToken: fromEnv(AUTH_ENV_VARS.writeToken),
          readToken: fromEnv(AUTH_ENV_VARS.readToken),
          appId: fromEnv(AUTH_ENV_VARS.appId),
          appSecret: fromEnv(AUTH_ENV_VARS.appSecret)
        })
      };
    }

  const defaultName = store.defaultName();
  if (defaultName) {
    const record = store.get(defaultName);
    if (record) return fromAccount(record, 'default');
  }
  return null;
}

/** Human-readable name of where the credentials came from. */
export function describeAuthSource(auth: ResolvedAuth): string {
  switch (auth.source) {
    case 'cli':
      return 'command-line flags';
    case 'account':
      return `account "${auth.accountName}" (--account)`;
    case 'session':
      return `account "${auth.accountName}" (selected with "use")`;
    case 'env':
      return 'environment variables';
    case 'default':
      return `default account "${auth.accountName}"`;
  }
}
