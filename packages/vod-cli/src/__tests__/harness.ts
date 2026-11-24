/**
 * Drives the CLI the way the binary does, with the platform replaced by a stand-in.
 *
 * Not part of the published package.
 */
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { type PolyVVodClient } from 'polyv-vod-api-sdk';

import { AccountStore, type AccountRecord, type VodCredentials } from '../core/accounts';
import { type CommandContext, createContext } from '../core/context';
import { SessionStore } from '../core/session';
import { run } from '../program';

/** Deep stand-in for the SDK client: every method is a jest mock that resolves to `undefined`. */
export type SdkMock = Record<string, Record<string, jest.Mock>>;

const SERVICES = ['video', 'category', 'upload', 'playSafe', 'statistics', 'callback'];

/** A client whose every service method is a `jest.fn()`, e.g. `sdk.video.searchVideos`. */
export function createSdkMock(): SdkMock {
  const sdk: SdkMock = {};
  for (const service of SERVICES) {
    sdk[service] = new Proxy<Record<string, jest.Mock>>(
      {},
      {
        get: (target, property: string) => {
          if (typeof property !== 'string') return undefined;
          if (!(property in target)) target[property] = jest.fn().mockResolvedValue(undefined);
          return target[property];
        }
      }
    );
  }
  return sdk;
}

/** Calls recorded on a mock: `[args]` per call, with a mark for the caller's `this`. */
export function callsOf(mock: jest.Mock): unknown[][] {
  return mock.mock.calls;
}

export interface Harness {
  /** Runs one invocation; resolves to its exit code. */
  run: (...argv: string[]) => Promise<number>;
  /** Everything written to stdout, one entry per line. */
  stdout: string[];
  /** Everything written to stderr, one entry per line. */
  stderr: string[];
  sdk: SdkMock;
  store: AccountStore;
  session: SessionStore;
  ctx: CommandContext;
  /** Credentials handed to the client factory, one entry per invocation that needed them. */
  credentialsUsed: unknown[];
  /** Frees the temporary state directory. */
  cleanup: () => Promise<void>;
}

export interface HarnessOptions {
  /** Environment variables the commands see; defaults to none of the POLYV_VOD_* ones. */
  env?: NodeJS.ProcessEnv;
  /**
   * Prepares saved accounts and the session before the first run.
   * @param store Accounts; `add` also makes the account the default unless passed `{ default: false }`
   */
  setup?: (store: HarnessStore, session: SessionStore) => void;
}

/** The store as the setup hook sees it: adding an account also makes it the default. */
export interface HarnessStore extends AccountStore {
  add(name: string, credentials: VodCredentials, options?: { replace?: boolean; default?: boolean }): AccountRecord;
}

/**
 * A CLI with its state in a temporary directory and the platform replaced by `sdk`.
 *
 * Commands find credentials through the saved default account, as after `account add --default`.
 */
export async function createHarness(options: HarnessOptions = {}): Promise<Harness> {
  const dir = await mkdtemp(join(tmpdir(), 'polyv-vod-cli-test-'));
  const store = new AccountStore(join(dir, 'accounts.json'));
  const session = new SessionStore(join(dir, 'session.json'));
  const setupStore: HarnessStore = Object.assign(Object.create(Object.getPrototypeOf(store)), store, {
    add(name: string, credentials: VodCredentials, addOptions: { replace?: boolean; default?: boolean } = {}): AccountRecord {
      const record = store.add(name, credentials, { replace: addOptions.replace });
      if (addOptions.default !== false) store.setDefault(name);
      return record;
    }
  });
  options.setup?.(setupStore, session);
  const sdk = createSdkMock();
  const credentialsUsed: unknown[] = [];
  const ctx = createContext({
    store,
    session,
    createClient: (credentials) => {
      credentialsUsed.push(credentials);
      return sdk as unknown as PolyVVodClient;
    }
  });
  const savedEnv: Record<string, string | undefined> = {};
  for (const name of Object.keys(process.env)) {
    if (name.startsWith('POLYV_VOD_')) {
      savedEnv[name] = process.env[name];
      delete process.env[name];
    }
  }
  for (const [name, value] of Object.entries(options.env ?? {})) {
    if (value !== undefined) process.env[name] = value;
  }
  return {
    sdk,
    store,
    session,
    ctx,
    credentialsUsed,
    stdout: (ctx as unknown as { stdout: string[] }).stdout,
    stderr: (ctx as unknown as { stderr: string[] }).stderr,
    run: async (...argv: string[]): Promise<number> => run(argv, ctx),
    cleanup: async () => {
      for (const [name, value] of Object.entries(savedEnv)) {
        if (value === undefined) delete process.env[name];
        else process.env[name] = value;
      }
      await rm(dir, { recursive: true, force: true });
    }
  };
}

export const ACCOUNT = {
  name: 'main',
  userId: 'user-1',
  secretKey: 'secret-1',
  writeToken: 'write-1'
};

export const OTHER_ACCOUNT = { name: 'other', userId: 'user-2', secretKey: 'secret-2' };

/** One `video` row as the platform returns it. */
export function videoItem(vid: string, overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    vid,
    basicInfo: {
      title: `title of ${vid}`,
      description: '',
      duration: 61,
      thumbnailURL: '',
      coverURL: '',
      creationTime: '2026-11-25 10:00:00',
      updateTime: '2026-11-25 10:00:00',
      size: 1_048_576,
      status: 60,
      cateId: 1,
      cateName: '默认分类',
      tags: '',
      uploader: 'API',
      playTimes: 3,
      ...overrides
    },
    metaData: { size: 1_048_576, format: 'mp4', duration: 61, bitrate: 500, fps: 25, height: 720, width: 1280, codec: 'h264' },
    transcodeInfos: [{ playUrl: `https://example.com/${vid}.mp4`, definition: 'HD', status: 'normal' }],
    snapshotInfo: { imageUrl: [] }
  };
}

/** Parses the JSON a command printed on stdout. */
export function json(stdout: string[]): unknown {
  return JSON.parse(stdout.join('\n'));
}
