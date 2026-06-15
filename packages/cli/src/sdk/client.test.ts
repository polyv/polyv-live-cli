import { getSdkClient, resetSdkClient, createSdkClient } from './client';

jest.mock('polyv-live-api-sdk', () => ({
  PolyVClient: jest.fn().mockImplementation((config: any) => ({
    config,
    channel: {},
    v4Platform: {},
    statistics: {},
  })),
  PolyVAPIError: class extends Error {},
  PolyVError: class extends Error {},
  PolyVValidationError: class extends Error {},
}));

import { PolyVClient } from 'polyv-live-api-sdk';

const MockPolyVClient = PolyVClient as jest.MockedClass<typeof PolyVClient>;

describe('SDK Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetSdkClient();
  });

  describe('getSdkClient', () => {
    it('should create a new SDK client with auth config', () => {
      const client = getSdkClient({ appId: 'test-app', appSecret: 'test-secret' });
      expect(MockPolyVClient).toHaveBeenCalledWith(
        expect.objectContaining({ appId: 'test-app', appSecret: 'test-secret' })
      );
      expect(client).toBeDefined();
    });

    it('should use default base URL when not provided', () => {
      getSdkClient({ appId: 'a', appSecret: 's' });
      expect(MockPolyVClient).toHaveBeenCalledWith(
        expect.objectContaining({ baseUrl: 'https://api.polyv.net' })
      );
    });

    it('should use custom base URL when provided', () => {
      getSdkClient({ appId: 'a', appSecret: 's' }, 'https://custom.api.com');
      expect(MockPolyVClient).toHaveBeenCalledWith(
        expect.objectContaining({ baseUrl: 'https://custom.api.com' })
      );
    });

    it('should return cached client on subsequent calls', () => {
      const client1 = getSdkClient({ appId: 'a', appSecret: 's' });
      const client2 = getSdkClient({ appId: 'a', appSecret: 's' });
      expect(client1).toBe(client2);
      expect(MockPolyVClient).toHaveBeenCalledTimes(1);
    });
  });

  describe('resetSdkClient', () => {
    it('should allow new client after reset', () => {
      const client1 = getSdkClient({ appId: 'a', appSecret: 's' });
      resetSdkClient();
      const client2 = getSdkClient({ appId: 'a', appSecret: 's' });
      expect(client1).not.toBe(client2);
      expect(MockPolyVClient).toHaveBeenCalledTimes(2);
    });
  });

  describe('createSdkClient', () => {
    it('should always create a new client', () => {
      const client1 = createSdkClient({ appId: 'a', appSecret: 's' });
      const client2 = createSdkClient({ appId: 'a', appSecret: 's' });
      expect(client1).not.toBe(client2);
      expect(MockPolyVClient).toHaveBeenCalledTimes(2);
    });

    it('should use custom base URL', () => {
      const client = createSdkClient({ appId: 'a', appSecret: 's' }, 'https://custom.com');
      expect(MockPolyVClient).toHaveBeenCalledWith(
        expect.objectContaining({ baseUrl: 'https://custom.com' })
      );
      expect(client).toBeDefined();
    });
  });
});
