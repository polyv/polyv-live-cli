/**
 * Tests for GlobalServiceSdk.
 */

import { GlobalServiceSdk } from './global-service';
import * as sdkModule from '../sdk';
import type { AuthConfig } from '../types/auth';

jest.mock('../sdk', () => ({
  createSdkClient: jest.fn(),
}));

const mockCreateSdkClient = sdkModule.createSdkClient as jest.MockedFunction<typeof sdkModule.createSdkClient>;

describe('GlobalServiceSdk', () => {
  const authConfig: AuthConfig = {
    appId: 'app-id',
    appSecret: 'app-secret',
  };
  const serviceConfig = {
    baseUrl: 'https://api.polyv.net',
    timeout: 30000,
    debug: false,
  };
  let v4Global: Record<string, jest.Mock>;
  let service: GlobalServiceSdk;

  beforeEach(() => {
    v4Global = {
      getAuth: jest.fn().mockResolvedValue({ authSettings: [] }),
      updateAuth: jest.fn().mockResolvedValue(undefined),
      getPageSetting: jest.fn().mockResolvedValue({ pvShowEnabled: 'Y' }),
      updatePageSetting: jest.fn().mockResolvedValue(undefined),
    };
    mockCreateSdkClient.mockReturnValue({ v4Global } as any);
    service = new GlobalServiceSdk(authConfig, serviceConfig);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call v4Global auth APIs', async () => {
    await service.getAuth();
    await service.updateAuth({
      authSettings: [
        { authEnabled: 'N', authType: 'none' },
        { authEnabled: 'N', authType: 'none' },
      ],
    });

    expect(v4Global.getAuth).toHaveBeenCalled();
    expect(v4Global.updateAuth).toHaveBeenCalledWith({
      authSettings: [
        { authEnabled: 'N', authType: 'none' },
        { authEnabled: 'N', authType: 'none' },
      ],
    });
  });

  it('should call v4Global page setting APIs', async () => {
    await service.getPageSetting();
    await service.updatePageSetting({ pvShowEnabled: 'Y' });

    expect(v4Global.getPageSetting).toHaveBeenCalled();
    expect(v4Global.updatePageSetting).toHaveBeenCalledWith({ pvShowEnabled: 'Y' });
  });
});
