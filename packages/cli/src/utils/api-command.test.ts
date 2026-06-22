/**
 * @fileoverview Unit tests for API command utilities (api-command.ts).
 */

import { Command } from 'commander';
import {
  loadApiCommandConfig,
  validateOutputFormat,
  validateYn,
  parsePositiveInteger,
  parseNonNegativeNumber,
  parseTimestamp,
  parseJsonObject,
  parseJsonArray,
  parseStringList,
  parseNumberList,
  compactParams,
  apiParams,
  confirmWrite,
  displayApiResult,
  commandParentOptions,
} from './api-command';
import { authAdapter } from '../config/auth-adapter';
import { configManager } from '../config/manager';
import { confirmDeletion } from './confirmation';

jest.mock('../config/auth-adapter');
jest.mock('../config/manager');
jest.mock('./confirmation');

const mockedAuthAdapter = authAdapter as jest.Mocked<typeof authAdapter>;
const mockedConfigManager = configManager as jest.Mocked<typeof configManager>;

describe('api-command utils', () => {
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    logSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  describe('loadApiCommandConfig', () => {
    it('returns auth + service config on success', async () => {
      mockedAuthAdapter.tryGetAuthConfig.mockReturnValue({
        config: { appId: 'a', appSecret: 's', userId: 'u' },
        source: 'test',
        accountName: 'acct',
      });
      mockedConfigManager.load.mockResolvedValue({
        config: { baseUrl: 'https://api.polyv.net', timeout: 30, maxRetries: 3, debug: true },
      } as any);

      const result = await loadApiCommandConfig({ verbose: true });
      expect(result.authConfig).toEqual({ appId: 'a', appSecret: 's', userId: 'u' });
      expect(result.serviceConfig).toEqual({ baseUrl: 'https://api.polyv.net', timeout: 30, maxRetries: 3, debug: true });
    });

    it('throws when no auth is configured', async () => {
      mockedAuthAdapter.tryGetAuthConfig.mockReturnValue(null);
      mockedAuthAdapter.getStatusMessage.mockReturnValue('no auth');
      await expect(loadApiCommandConfig({})).rejects.toThrow('no auth');
    });

    it('falls back to defaults when config load fails with incomplete-auth error', async () => {
      mockedAuthAdapter.tryGetAuthConfig.mockReturnValue({
        config: { appId: 'a', appSecret: 's', userId: 'u' },
        source: 'test',
        accountName: 'acct',
      });
      mockedConfigManager.load.mockRejectedValue(new Error('Auth configuration is incomplete'));
      const result = await loadApiCommandConfig({});
      expect(result.serviceConfig.baseUrl).toBe('https://api.polyv.net');
      expect(result.serviceConfig.timeout).toBe(30000);
    });

    it('rethrows unrelated config load errors', async () => {
      mockedAuthAdapter.tryGetAuthConfig.mockReturnValue({
        config: { appId: 'a', appSecret: 's', userId: 'u' },
        source: 'test',
        accountName: 'acct',
      });
      mockedConfigManager.load.mockRejectedValue(new Error('disk on fire'));
      await expect(loadApiCommandConfig({})).rejects.toThrow('disk on fire');
    });
  });

  describe('validators and parsers', () => {
    it('validateOutputFormat', () => {
      expect(validateOutputFormat('table')).toBe('table');
      expect(validateOutputFormat('json')).toBe('json');
      expect(() => validateOutputFormat('xml')).toThrow('output must be table or json');
    });

    it('validateYn', () => {
      expect(validateYn('Y')).toBe('Y');
      expect(validateYn('N')).toBe('N');
      expect(() => validateYn('maybe')).toThrow('value must be Y or N');
    });

    it('parsePositiveInteger', () => {
      expect(parsePositiveInteger('42')).toBe(42);
      expect(() => parsePositiveInteger('0')).toThrow('positive integer');
      expect(() => parsePositiveInteger('-3')).toThrow('positive integer');
      expect(() => parsePositiveInteger('1.5')).toThrow('positive integer');
    });

    it('parseNonNegativeNumber', () => {
      expect(parseNonNegativeNumber('0')).toBe(0);
      expect(parseNonNegativeNumber('3.5')).toBe(3.5);
      expect(() => parseNonNegativeNumber('-1')).toThrow('non-negative');
    });

    it('parseTimestamp', () => {
      expect(parseTimestamp('1000')).toBe(1000);
      expect(() => parseTimestamp('0')).toThrow('positive number');
      expect(() => parseTimestamp('-5')).toThrow('positive number');
    });

    it('parseJsonObject', () => {
      expect(parseJsonObject('{"a":1}')).toEqual({ a: 1 });
      expect(() => parseJsonObject('[1,2]')).toThrow('JSON object');
      expect(() => parseJsonObject('"x"')).toThrow('JSON object');
    });

    it('parseJsonArray', () => {
      expect(parseJsonArray('[1,2]')).toEqual([1, 2]);
      expect(() => parseJsonArray('{"a":1}')).toThrow('JSON array');
    });

    it('parseStringList', () => {
      expect(parseStringList('a, b ,c')).toEqual(['a', 'b', 'c']);
      expect(() => parseStringList(' , ')).toThrow('not be empty');
    });

    it('parseNumberList', () => {
      expect(parseNumberList('1,2,3')).toEqual([1, 2, 3]);
      expect(() => parseNumberList('1,x')).toThrow();
    });
  });

  describe('param helpers', () => {
    it('compactParams drops undefined and empty-string values', () => {
      expect(compactParams({ a: 1, b: undefined, c: '', d: 0, e: false })).toEqual({ a: 1, d: 0, e: false });
    });

    it('apiParams strips control fields and compacts', () => {
      expect(apiParams({ channelId: 'ch1', output: 'json', force: true, dryRun: false, name: '' })).toEqual({ channelId: 'ch1' });
    });
  });

  describe('confirmWrite', () => {
    const mockedConfirmDeletion = confirmDeletion as jest.Mock;

    it('resolves immediately when force is true', async () => {
      await expect(confirmWrite(true, 'msg')).resolves.toBeUndefined();
      expect(mockedConfirmDeletion).not.toHaveBeenCalled();
    });

    it('resolves when confirmation is accepted', async () => {
      mockedConfirmDeletion.mockResolvedValue(true);
      await expect(confirmWrite(false, 'msg')).resolves.toBeUndefined();
    });

    it('throws when confirmation is declined', async () => {
      mockedConfirmDeletion.mockResolvedValue(false);
      await expect(confirmWrite(false, 'msg')).rejects.toThrow('Operation cancelled.');
    });
  });

  describe('displayApiResult', () => {
    it('prints JSON when output is json', () => {
      displayApiResult({ a: 1 }, 'json');
      expect(logSpy).toHaveBeenCalled();
    });

    it('renders a table for an array of objects', () => {
      displayApiResult([{ id: 1, name: 'x' }], 'table');
      expect(logSpy).toHaveBeenCalled();
    });

    it('renders a two-column table for a flat object', () => {
      displayApiResult({ id: 1, name: 'x' }, 'table');
      expect(logSpy).toHaveBeenCalled();
    });

    it('falls back to JSON for nested objects', () => {
      displayApiResult({ outer: { inner: 1 } }, 'table');
      expect(logSpy).toHaveBeenCalled();
    });

    it('falls back to JSON for primitives and empty arrays', () => {
      displayApiResult(42, 'table');
      displayApiResult([], 'table');
      displayApiResult(null, 'table');
      expect(logSpy).toHaveBeenCalled();
    });
  });

  describe('commandParentOptions', () => {
    it('returns program opts', () => {
      const program = new Command();
      program.option('--verbose', 'verbose');
      program.parse(['node', 't', '--verbose']);
      expect(commandParentOptions(program)).toEqual({ verbose: true });
    });
  });
});
