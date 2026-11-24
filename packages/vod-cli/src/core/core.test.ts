import { mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { AccountStore, AccountStoreError, assertAccountName, type VodCredentials } from './accounts';
import { AuthError, describeAuthSource, resolveAuth } from './auth';
import { decryptSecret, encryptSecret } from './crypto';
import { SessionStore } from './session';

const KEY: VodCredentials = { userId: 'user-1', secretKey: 'secret-1', writeToken: 'write-1' };
const OTHER: VodCredentials = { userId: 'user-2', secretKey: 'secret-2' };

let dir: string;
let store: AccountStore;
let session: SessionStore;
beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'polyv-vod-core-'));
  store = new AccountStore(join(dir, 'accounts.json'));
  session = new SessionStore(join(dir, 'session.json'));
});
afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe('AccountStore', () => {
  it('round-trips an account', () => {
    store.add('main', { ...KEY, readToken: 'read-1', appId: 'app-1', appSecret: 'app-secret' });
    expect(store.get('main')).toMatchObject({ name: 'main', ...KEY, readToken: 'read-1', appId: 'app-1', appSecret: 'app-secret' });
    expect(store.get('main')?.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(store.get('nope')).toBeUndefined();
    expect(store.exists('main')).toBe(true);
    expect(store.exists('nope')).toBe(false);
  });

  it('omits the optional credentials that were not given', () => {
    store.add('bare', { userId: 'u', secretKey: 's' });
    const record = store.get('bare');
    expect(Object.keys(record ?? {}).sort()).toEqual(['createdAt', 'name', 'secretKey', 'userId']);
  });

  it('never stores a secret in plain text', async () => {
    store.add('main', { ...KEY, readToken: 'read-1', appSecret: 'app-secret' });
    const text = await readFile(store.filePath, 'utf8');
    for (const secret of ['secret-1', 'write-1', 'read-1', 'app-secret']) {
      expect(text).not.toContain(secret);
    }
    expect((text.match(/"enc:v1:/g) ?? []).length).toBe(4);
    expect(text).toContain('user-1');
    // The API appId is an identifier and is stored as is.
    expect(text).not.toContain('app-secret');
  });

  it('creates the directory and the file for the owner only', async () => {
    store.add('main', KEY);
    const fileMode = (await stat(store.filePath)).mode & 0o777;
    const dirMode = (await stat(dir)).mode & 0o777;
    expect(fileMode).toBe(0o600);
    expect(dirMode & 0o077).toBe(0);
  });

  it('refuses to overwrite an account unless asked', () => {
    store.add('main', KEY);
    expect(() => store.add('main', OTHER)).toThrow(AccountStoreError);
    expect(() => store.add('main', OTHER)).toThrow('--replace');
    store.add('main', OTHER, { replace: true });
    expect(store.get('main')?.userId).toBe('user-2');
  });

  it('keeps the creation date when an account is replaced', () => {
    store.add('main', KEY);
    const createdAt = store.get('main')?.createdAt;
    store.add('main', OTHER, { replace: true });
    expect(store.get('main')?.createdAt).toBe(createdAt);
  });

  it('rejects account names that cannot be typed safely', () => {
    for (const bad of ['', ' lead', '../x', 'a b', 'a/b', 'a'.repeat(65), '-lead']) {
      expect(() => store.add(bad, KEY)).toThrow(AccountStoreError);
    }
    for (const good of ['a', 'A-1_b', 'x'.repeat(64)]) expect(() => assertAccountName(good)).not.toThrow();
  });

  it('lists the accounts sorted by name', () => {
    store.add('zeta', KEY);
    store.add('alpha', KEY);
    store.add('Mid', KEY);
    expect(store.list().map((item) => item.name)).toEqual(['Mid', 'alpha', 'zeta']);
  });

  it('removes an account and drops it as default', () => {
    store.add('main', KEY);
    store.setDefault('main');
    expect(store.remove('main')).toBe(true);
    expect(store.remove('main')).toBe(false);
    expect(store.defaultName()).toBeUndefined();
  });

  it('manages the default account', () => {
    expect(store.defaultName()).toBeUndefined();
    store.add('main', KEY);
    expect(() => store.setDefault('nope')).toThrow('not saved');
    store.setDefault('main');
    expect(store.defaultName()).toBe('main');
    expect(store.unsetDefault()).toBe(true);
    expect(store.unsetDefault()).toBe(false);
  });

  it('leaves no temporary file behind', async () => {
    store.add('main', KEY);
    expect(await readdir(dir)).toEqual(['accounts.json']);
  });

  it('reports a corrupted file instead of silently dropping the accounts', async () => {
    await writeFile(store.filePath, '{ not json');
    expect(() => store.list()).toThrow(AccountStoreError);
    expect(() => store.list()).toThrow('Cannot read the account file');
    await writeFile(store.filePath, JSON.stringify({ version: 99, accounts: {} }));
    expect(() => store.list()).toThrow('Cannot read the account file');
  });

  it('says which key is wrong when a stored credential cannot be decrypted', async () => {
    store.add('main', KEY);
    const previous = process.env.POLYV_VOD_MASTER_KEY;
    process.env.POLYV_VOD_MASTER_KEY = 'another-master-key';
    try {
      expect(() => store.get('main')).toThrow('different POLYV_VOD_MASTER_KEY');
      expect(() => store.get('main')).toThrow('add the account again');
      // A key change must not destroy anything: the original key still reads the account.
      delete process.env.POLYV_VOD_MASTER_KEY;
      expect(store.get('main')?.userId).toBe('user-1');
    } finally {
      if (previous === undefined) delete process.env.POLYV_VOD_MASTER_KEY;
      else process.env.POLYV_VOD_MASTER_KEY = previous;
    }
  });
});

describe('crypto', () => {
  it('encrypts to a different value each time and decrypts back', () => {
    const first = encryptSecret('value');
    const second = encryptSecret('value');
    expect(first).not.toBe(second);
    expect(first).toMatch(/^enc:v1:[0-9a-f]{32}:/);
    expect(decryptSecret(first)).toBe('value');
    expect(decryptSecret(second)).toBe('value');
  });

  it('passes through values that are not encrypted and handles empty strings', () => {
    expect(decryptSecret('plain')).toBe('plain');
    expect(decryptSecret(encryptSecret(''))).toBe('');
    expect(decryptSecret(encryptSecret('中文 🔑'))).toBe('中文 🔑');
  });

  it('rejects a malformed encrypted value', () => {
    expect(() => decryptSecret('enc:v1:zz:oops')).toThrow();
    expect(() => decryptSecret('enc:v1:only-one-part')).toThrow('malformed');
  });
});

describe('SessionStore', () => {
  it('starts empty, then remembers and forgets an account', () => {
    expect(session.get()).toBeUndefined();
    session.set('main');
    expect(session.get()).toBe('main');
    expect(new SessionStore(session.filePath).get()).toBe('main');
    expect(session.clear()).toBe(true);
    expect(session.get()).toBeUndefined();
    expect(session.clear()).toBe(false);
  });

  it('ignores an unreadable session file', async () => {
    await writeFile(session.filePath, 'not json');
    expect(session.get()).toBeUndefined();
    await writeFile(session.filePath, JSON.stringify({ account: '' }));
    expect(session.get()).toBeUndefined();
  });
});

describe('resolveAuth', () => {
  it('returns null when nothing is configured', () => {
    expect(resolveAuth(store, session, {}, {})).toBeNull();
  });

  it('takes the flags over everything else', () => {
    store.add('main', KEY);
    const resolved = resolveAuth(store, session, { userId: ' flag-user ', secretKey: ' flag-secret', writeToken: 'w', appId: 'a', appSecret: 's' }, {});
    expect(resolved).toEqual({
      source: 'cli',
      credentials: { userId: 'flag-user', secretKey: 'flag-secret', writeToken: 'w', appId: 'a', appSecret: 's' }
    });
    expect(describeAuthSource(resolved!)).toBe('command-line flags');
  });

  it('ignores blank flags', () => {
    store.add('main', KEY);
    store.setDefault('main');
    expect(resolveAuth(store, session, { userId: '  ', secretKey: '' }, {})?.source).toBe('default');
  });

  it('refuses half-given flags and half-given environment variables', () => {
    expect(() => resolveAuth(store, session, { userId: 'u' }, {})).toThrow('--userId and --secretKey must be given together');
    expect(() => resolveAuth(store, session, { secretKey: 's' }, {})).toThrow(AuthError);
    expect(() => resolveAuth(store, session, {}, { POLYV_VOD_USER_ID: 'u' })).toThrow('must be set together');
    expect(() => resolveAuth(store, session, {}, { POLYV_VOD_SECRET_KEY: 's' })).toThrow(AuthError);
  });

  it('takes the account named with --account over the session and the default', () => {
    store.add('main', KEY);
    store.add('other', OTHER);
    session.set('main');
    const resolved = resolveAuth(store, session, { account: ' other ' }, {});
    expect(resolved).toMatchObject({ source: 'account', accountName: 'other', credentials: { userId: 'user-2' } });
    expect(describeAuthSource(resolved!)).toBe('account "other" (--account)');
  });

  it('fails clearly when the named account is not saved', () => {
    expect(() => resolveAuth(store, session, { account: 'nope' }, {})).toThrow('Account "nope" is not saved');
  });

  it('falls back to the account chosen with use, even without a default', () => {
    store.add('other', OTHER);
    store.unsetDefault();
    session.set('other');
    const resolved = resolveAuth(store, session, {}, {});
    expect(resolved).toMatchObject({ source: 'session', accountName: 'other' });
    expect(describeAuthSource(resolved!)).toBe('account "other" (selected with "use")');
  });

  it('skips a session account that was removed', () => {
    store.add('main', KEY);
    store.add('other', OTHER);
    store.setDefault('main');
    store.remove('other');
    session.set('other');
    expect(resolveAuth(store, session, {}, {})?.source).toBe('default');
  });

  it('takes the environment over the default account', () => {
    store.add('main', KEY);
    const resolved = resolveAuth(store, session, {}, {
      POLYV_VOD_USER_ID: ' env-user ',
      POLYV_VOD_SECRET_KEY: 'env-secret',
      POLYV_VOD_WRITE_TOKEN: 'env-write',
      POLYV_VOD_READ_TOKEN: 'env-read',
      POLYV_VOD_APP_ID: 'env-app',
      POLYV_VOD_APP_SECRET: 'env-app-secret'
    });
    expect(resolved).toEqual({
      source: 'env',
      credentials: {
        userId: 'env-user',
        secretKey: 'env-secret',
        writeToken: 'env-write',
        readToken: 'env-read',
        appId: 'env-app',
        appSecret: 'env-app-secret'
      }
    });
    expect(describeAuthSource(resolved!)).toBe('environment variables');
  });

  it('uses the default account last', () => {
    store.add('main', KEY);
    store.add('other', OTHER);
    store.setDefault('other');
    const resolved = resolveAuth(store, session, {}, {});
    expect(resolved).toMatchObject({ source: 'default', accountName: 'other' });
    expect(describeAuthSource(resolved!)).toBe('default account "other"');
  });

  it('ignores an environment variable that is blank', () => {
    store.add('main', KEY);
    store.setDefault('main');
    expect(resolveAuth(store, session, {}, { POLYV_VOD_USER_ID: '  ' })?.source).toBe('default');
  });
});
