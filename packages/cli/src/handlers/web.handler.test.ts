import { WebHandler } from './web.handler';
import { WebServiceSdk } from '../services/web-service';

jest.mock('../services/web-service');

const MockWebService = WebServiceSdk as jest.MockedClass<typeof WebServiceSdk>;

describe('WebHandler', () => {
  const authConfig = { appId: 'app', appSecret: 'secret' };
  const serviceConfig = { baseUrl: 'https://api.polyv.net', timeout: 30000, debug: false };
  let service: jest.Mocked<WebServiceSdk>;
  let consoleLog: jest.SpyInstance;

  beforeEach(() => {
    service = {
      getSplash: jest.fn().mockResolvedValue({ splashEnabled: 'Y' }),
      setSplash: jest.fn().mockResolvedValue('success'),
      updateCash: jest.fn().mockResolvedValue('success'),
      downloadWhiteList: jest.fn().mockResolvedValue(new Uint8Array([1, 2]).buffer),
    } as any;
    MockWebService.mockImplementation(() => service);
    consoleLog = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('prints read results as json', async () => {
    const handler = new WebHandler(authConfig, serviceConfig);

    await handler.getSplash({ channelId: '123', output: 'json' });

    expect(service.getSplash).toHaveBeenCalledWith('123');
    expect(consoleLog).toHaveBeenCalledWith(JSON.stringify({ splashEnabled: 'Y' }, null, 2));
  });

  it('skips confirmation with force for configuration updates', async () => {
    const handler = new WebHandler(authConfig, serviceConfig);

    await handler.setSplash({ channelId: '123', splashEnabled: 'Y', force: true, output: 'json' });

    expect(service.setSplash).toHaveBeenCalledWith({ channelId: '123', splashEnabled: 'Y' });
    expect(consoleLog).toHaveBeenCalledWith(JSON.stringify({ success: true, result: 'success' }, null, 2));
  });

  it('prints download metadata as json', async () => {
    const handler = new WebHandler(authConfig, serviceConfig);

    await handler.downloadWhiteList({ rank: 1, output: 'json' });

    expect(service.downloadWhiteList).toHaveBeenCalledWith({ rank: 1 });
    expect(consoleLog).toHaveBeenCalledWith(JSON.stringify({ success: true, bytes: 2, outputFile: undefined }, null, 2));
  });
});
