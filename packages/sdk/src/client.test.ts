/**
 * @fileoverview Unit tests for PolyVClient
 * @module client.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PolyVClient } from './client.js';
import axios from 'axios';

// Mock axios
vi.mock('axios', () => {
  const mockAxiosInstance = {
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
    get: vi.fn().mockResolvedValue({ data: { code: 200, data: {} } }),
    post: vi.fn().mockResolvedValue({ data: { code: 200, data: {} } }),
    put: vi.fn().mockResolvedValue({ data: { code: 200, data: {} } }),
    delete: vi.fn().mockResolvedValue({ data: { code: 200, data: {} } }),
    patch: vi.fn().mockResolvedValue({ data: { code: 200, data: {} } }),
    request: vi.fn().mockResolvedValue({ data: { code: 200, data: {} } }),
  };

  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
      isCancel: vi.fn(),
      isAxiosError: vi.fn(),
    },
    create: vi.fn(() => mockAxiosInstance),
    isCancel: vi.fn(),
    isAxiosError: vi.fn(),
  };
});

describe('PolyVClient', () => {
  const mockConfig = {
    appId: 'test-app-id',
    appSecret: 'test-app-secret',
  };

  let client: PolyVClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new PolyVClient(mockConfig);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('[P0] should create client with required config', () => {
      const testClient = new PolyVClient(mockConfig);

      expect(testClient.config.appId).toBe('test-app-id');
      expect(testClient.config.appSecret).toBe('test-app-secret');
      expect(testClient.config.baseUrl).toBe('https://api.polyv.net');
      expect(testClient.config.liveBgBaseUrl).toBe('https://live.polyv.net');
      expect(testClient.config.timeout).toBe(30000);
    });

    it('[P0] should create client with custom config', () => {
      const testClient = new PolyVClient({
        ...mockConfig,
        baseUrl: 'https://custom.api.com',
        liveBgBaseUrl: 'https://custom.live-bg.com',
        timeout: 60000,
        headers: { 'X-Custom': 'value' },
        version: 'v4',
      });

      expect(testClient.config.baseUrl).toBe('https://custom.api.com');
      expect(testClient.config.liveBgBaseUrl).toBe('https://custom.live-bg.com');
      expect(testClient.config.timeout).toBe(60000);
      expect(testClient.config.headers).toMatchObject({ 'X-Custom': 'value' });
      expect(testClient.config.version).toBe('v4');
    });

    it('[P0] should initialize all services', () => {
      // V3 services
      expect(client.channel).toBeDefined();
      expect(client.chat).toBeDefined();
      expect(client.statistics).toBeDefined();
      expect(client.liveInteraction).toBeDefined();
      expect(client.account).toBeDefined();
      expect(client.web).toBeDefined();
      expect(client.platform).toBeDefined();
      expect(client.finance).toBeDefined();
      expect(client.group).toBeDefined();
      expect(client.player).toBeDefined();
      expect(client.other).toBeDefined();

      // V4 services
      expect(client.v4Ai).toBeDefined();
      expect(client.v4Robot).toBeDefined();
      expect(client.v4Channel).toBeDefined();
      expect(client.v4Chat).toBeDefined();
      expect(client.v4Statistics).toBeDefined();
      expect(client.v4User).toBeDefined();
      expect(client.v4Global).toBeDefined();
      expect(client.v4Group).toBeDefined();
      expect(client.v4Material).toBeDefined();
      expect(client.v4Platform).toBeDefined();
      expect(client.v4WebApp).toBeDefined();
    });
  });

  describe('config', () => {
    it('[P0] should have default headers', () => {
      expect(client.config.headers).toMatchObject({
        'Content-Type': 'application/json',
        'User-Agent': 'polyv-live-api-sdk/1.0.0',
      });
    });

    it('[P0] should merge custom headers with defaults', () => {
      const testClient = new PolyVClient({
        ...mockConfig,
        headers: { 'X-Custom': 'custom-value' },
      });

      expect(testClient.config.headers).toMatchObject({
        'Content-Type': 'application/json',
        'User-Agent': 'polyv-live-api-sdk/1.0.0',
        'X-Custom': 'custom-value',
      });
    });
  });

  describe('httpClient', () => {
    it('[P0] should expose httpClient', () => {
      expect(client.httpClient).toBeDefined();
    });
  });

  describe('interceptors', () => {
    it('[P0] should setup request interceptor', () => {
      const mockAxiosCreate = vi.mocked(axios.create);
      new PolyVClient(mockConfig);

      const mockInstance = mockAxiosCreate();
      expect(mockInstance.interceptors.request.use).toHaveBeenCalled();
    });

    it('[P0] should setup response interceptor', () => {
      const mockAxiosCreate = vi.mocked(axios.create);
      new PolyVClient(mockConfig);

      const mockInstance = mockAxiosCreate();
      expect(mockInstance.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('HTTP methods', () => {
    it('[P0] should make GET request', async () => {
      const result = await client.get('/test', { param: 'value' });

      expect(client.httpClient.get).toHaveBeenCalled();
    });

    it('[P0] should make POST request', async () => {
      const result = await client.post('/test', { data: 'value' });

      expect(client.httpClient.post).toHaveBeenCalled();
    });

    it('[P0] should make PUT request', async () => {
      const result = await client.put('/test', { data: 'value' });

      expect(client.httpClient.put).toHaveBeenCalled();
    });

    it('[P0] should make DELETE request', async () => {
      const result = await client.delete('/test', { param: 'value' });

      expect(client.httpClient.delete).toHaveBeenCalled();
    });

    it('[P0] should make PATCH request', async () => {
      const result = await client.patch('/test', { data: 'value' });

      expect(client.httpClient.patch).toHaveBeenCalled();
    });

    it('[P0] should make generic request', async () => {
      const result = await client.request({ method: 'GET', url: '/test' });

      expect(client.httpClient.request).toHaveBeenCalled();
    });

    it('[P1] should pass request options', async () => {
      const signal = new AbortController().signal;
      await client.get('/test', {}, { signal, timeout: 5000 });

      expect(client.httpClient.get).toHaveBeenCalledWith(
        '/test',
        expect.objectContaining({
          params: {},
          signal,
          timeout: 5000,
        })
      );
    });
  });

  describe('error handling', () => {
    it('[P1] should handle request cancellation', () => {
      const mockAxiosCreate = vi.mocked(axios.create);
      const mockInstance = mockAxiosCreate();
      const responseInterceptorCalls = vi.mocked(mockInstance.interceptors.response.use).mock.calls;
      const errorHandler = responseInterceptorCalls[0][1];

      const cancelError = { __CANCEL__: true, message: 'Request cancelled' };
      vi.mocked(axios.isCancel).mockReturnValueOnce(true);

      // Error handler throws synchronously
      expect(() => errorHandler(cancelError)).toThrow('Request cancelled');
    });

    it('[P1] should handle axios error with response', () => {
      const mockAxiosCreate = vi.mocked(axios.create);
      const mockInstance = mockAxiosCreate();
      const responseInterceptorCalls = vi.mocked(mockInstance.interceptors.response.use).mock.calls;
      const errorHandler = responseInterceptorCalls[0][1];

      const axiosError = {
        response: {
          status: 400,
          data: { message: 'Bad request', error: { code: 'INVALID_PARAM' } },
        },
        message: 'Request failed',
      };
      vi.mocked(axios.isAxiosError).mockReturnValueOnce(true);
      vi.mocked(axios.isCancel).mockReturnValueOnce(false);

      expect(() => errorHandler(axiosError)).toThrow('Bad request');
    });

    it('[P1] should handle axios error with timeout', () => {
      const mockAxiosCreate = vi.mocked(axios.create);
      const mockInstance = mockAxiosCreate();
      const responseInterceptorCalls = vi.mocked(mockInstance.interceptors.response.use).mock.calls;
      const errorHandler = responseInterceptorCalls[0][1];

      const axiosError = {
        code: 'ECONNABORTED',
        message: 'timeout of 30000ms exceeded',
        request: {},
      };
      vi.mocked(axios.isAxiosError).mockReturnValueOnce(true);
      vi.mocked(axios.isCancel).mockReturnValueOnce(false);

      expect(() => errorHandler(axiosError)).toThrow('Request timeout');
    });

    it('[P1] should handle axios error with no response', () => {
      const mockAxiosCreate = vi.mocked(axios.create);
      const mockInstance = mockAxiosCreate();
      const responseInterceptorCalls = vi.mocked(mockInstance.interceptors.response.use).mock.calls;
      const errorHandler = responseInterceptorCalls[0][1];

      const axiosError = {
        message: 'Network error',
        request: {},
      };
      vi.mocked(axios.isAxiosError).mockReturnValueOnce(true);
      vi.mocked(axios.isCancel).mockReturnValueOnce(false);

      expect(() => errorHandler(axiosError)).toThrow('No response from server');
    });

    it('[P1] should handle non-axios errors', () => {
      const mockAxiosCreate = vi.mocked(axios.create);
      const mockInstance = mockAxiosCreate();
      const responseInterceptorCalls = vi.mocked(mockInstance.interceptors.response.use).mock.calls;
      const errorHandler = responseInterceptorCalls[0][1];

      const genericError = new Error('Unknown error');
      vi.mocked(axios.isAxiosError).mockReturnValueOnce(false);
      vi.mocked(axios.isCancel).mockReturnValueOnce(false);

      expect(() => errorHandler(genericError)).toThrow('Unknown error');
    });

    it('[P1] should handle non-Error objects', () => {
      const mockAxiosCreate = vi.mocked(axios.create);
      const mockInstance = mockAxiosCreate();
      const responseInterceptorCalls = vi.mocked(mockInstance.interceptors.response.use).mock.calls;
      const errorHandler = responseInterceptorCalls[0][1];

      vi.mocked(axios.isAxiosError).mockReturnValueOnce(false);
      vi.mocked(axios.isCancel).mockReturnValueOnce(false);

      expect(() => errorHandler('string error')).toThrow('Unknown error');
    });
  });

  describe('request interceptor', () => {
    it('[P1] should skip auth when X-Skip-Auth header is set', async () => {
      const mockAxiosCreate = vi.mocked(axios.create);
      const mockInstance = mockAxiosCreate();
      const requestInterceptorCalls = vi.mocked(mockInstance.interceptors.request.use).mock.calls;
      const requestHandler = requestInterceptorCalls[0][0];

      const config = {
        headers: { 'X-Skip-Auth': true },
        params: { customParam: 'value' },
      };

      const result = requestHandler(config);

      expect(result.headers['X-Skip-Auth']).toBeUndefined();
    });

    it('[P0] should inject signature params', async () => {
      const mockAxiosCreate = vi.mocked(axios.create);
      const mockInstance = mockAxiosCreate();
      const requestInterceptorCalls = vi.mocked(mockInstance.interceptors.request.use).mock.calls;
      const requestHandler = requestInterceptorCalls[0][0];

      const config = {
        headers: {},
        params: { customParam: 'value' },
      };

      const result = requestHandler(config);

      expect(result.params.appId).toBe('test-app-id');
      expect(result.params.timestamp).toBeDefined();
      expect(result.params.sign).toBeDefined();
    });

    it('[P1] should handle request interceptor error', async () => {
      const mockAxiosCreate = vi.mocked(axios.create);
      const mockInstance = mockAxiosCreate();
      const requestInterceptorCalls = vi.mocked(mockInstance.interceptors.request.use).mock.calls;
      const errorHandler = requestInterceptorCalls[0][1];

      const error = new Error('Request setup failed');

      await expect(errorHandler(error)).rejects.toThrow('Request setup failed');
    });
  });

  describe('response interceptor success', () => {
    it('[P0] should extract data from successful response', async () => {
      const mockAxiosCreate = vi.mocked(axios.create);
      const mockInstance = mockAxiosCreate();
      const responseInterceptorCalls = vi.mocked(mockInstance.interceptors.response.use).mock.calls;
      const successHandler = responseInterceptorCalls[0][0];

      const response = {
        data: {
          code: 200,
          data: { id: '123', name: 'test' },
        },
      };

      const result = successHandler(response);

      expect(result).toEqual({ id: '123', name: 'test' });
    });

    it('[P1] should throw API error for non-200 code', async () => {
      const mockAxiosCreate = vi.mocked(axios.create);
      const mockInstance = mockAxiosCreate();
      const responseInterceptorCalls = vi.mocked(mockInstance.interceptors.response.use).mock.calls;
      const successHandler = responseInterceptorCalls[0][0];

      const response = {
        data: {
          code: 400,
          message: 'Bad request',
          error: { code: 'INVALID_PARAM', desc: 'Invalid parameter' },
        },
        status: 400,
      };

      expect(() => successHandler(response)).toThrow('Invalid parameter');
    });

    it('[P1] should use message when error.desc is not available', async () => {
      const mockAxiosCreate = vi.mocked(axios.create);
      const mockInstance = mockAxiosCreate();
      const responseInterceptorCalls = vi.mocked(mockInstance.interceptors.response.use).mock.calls;
      const successHandler = responseInterceptorCalls[0][0];

      const response = {
        data: {
          code: 500,
          message: 'Internal server error',
        },
        status: 500,
      };

      expect(() => successHandler(response)).toThrow('Internal server error');
    });
  });
});
