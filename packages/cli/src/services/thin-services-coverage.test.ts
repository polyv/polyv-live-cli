/**
 * @fileoverview Delegation coverage for thin SDK-wrapper services.
 *
 * These services (Finance, Group, Material, WebApp, Robot) are pure pass-throughs
 * to the generated SDK client: each method builds a client via `createSdkClient`
 * and forwards to `client.<resource>.<method>(...)`. We mock the client factory
 * and assert every method forwards its arguments to the correct SDK method.
 */

import { FinanceServiceSdk } from './finance-service';
import { GroupServiceSdk } from './group-service';
import { MaterialServiceSdk } from './material-service';
import { PartnerServiceSdk } from './partner-service';
import { WebAppServiceSdk } from './webapp-service';
import { RobotServiceSdk } from './robot-service';

jest.mock('../sdk', () => ({
  createSdkClient: jest.fn(),
}));

const { createSdkClient } = require('../sdk') as { createSdkClient: jest.Mock };

const authConfig = { appId: 'app', appSecret: 'secret', userId: 'user' };
const serviceConfig = { baseUrl: 'https://api.polyv.net', timeout: 30000, debug: false };

function fn() {
  return jest.fn().mockResolvedValue({ ok: true });
}

function buildMockClient() {
  return {
    finance: {
      getAudioModerationSettings: fn(),
      listAudioModerationRecords: fn(),
      updateAudioModerationSettings: fn(),
      getVideoModerationSettings: fn(),
      updateVideoModerationSettings: fn(),
      listVideoModerationResults: fn(),
      listBillDetails: fn(),
    },
    group: {
      listAllocateLog: fn(),
      setConcurrences: fn(),
      setFlow: fn(),
      setLiveDurations: fn(),
      setSpace: fn(),
    },
    v4Group: {
      createGroupUser: fn(),
      listGroupUserPackages: fn(),
      updateGroupUserPackage: fn(),
      listBillingDaily: fn(),
      listGroupUserBillingDaily: fn(),
      listAllocationLogs: fn(),
    },
    other: {
      healthCheck: fn(),
      createIsolation: fn(),
      getPackageValidityList: fn(),
      updatePackageValidity: fn(),
      resetAppSecret: fn(),
      registerUser: fn(),
      createTencentOrder: fn(),
    },
    v4Material: {
      listMaterials: fn(),
      deleteMaterials: fn(),
      listMaterialCategories: fn(),
      listMaterialLabels: fn(),
      createMaterialLabel: fn(),
      updateMaterialLabel: fn(),
      deleteMaterialLabel: fn(),
    },
    v4WebApp: {
      listPermissions: fn(),
      createRole: fn(),
      getRole: fn(),
      listRoles: fn(),
      updateRole: fn(),
      deleteRole: fn(),
    },
    v4Robot: {
      listRobots: fn(),
      batchSaveRobots: fn(),
      batchDeleteRobots: fn(),
    },
  };
}

describe('thin SDK-wrapper services', () => {
  let client: ReturnType<typeof buildMockClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    client = buildMockClient();
    createSdkClient.mockReturnValue(client);
  });

  it('FinanceServiceSdk forwards every method to client.finance', async () => {
    const service = new FinanceServiceSdk(authConfig as any, serviceConfig as any);

    await service.getAudioModerationSettings('ch1');
    expect(client.finance.getAudioModerationSettings).toHaveBeenCalledWith('ch1');

    await service.listAudioModerationRecords('ch1', { page: 1 });
    expect(client.finance.listAudioModerationRecords).toHaveBeenCalledWith('ch1', { page: 1 });

    await service.listAudioModerationRecords('ch1');
    expect(client.finance.listAudioModerationRecords).toHaveBeenLastCalledWith('ch1', {});

    await service.updateAudioModerationSettings('ch1', { enabled: 'Y' });
    expect(client.finance.updateAudioModerationSettings).toHaveBeenCalledWith('ch1', { enabled: 'Y' });

    await service.getVideoModerationSettings('ch1');
    expect(client.finance.getVideoModerationSettings).toHaveBeenCalledWith('ch1');

    await service.updateVideoModerationSettings('ch1', { enabled: 'Y' });
    expect(client.finance.updateVideoModerationSettings).toHaveBeenCalledWith('ch1', { enabled: 'Y' });

    await service.listVideoModerationResults('ch1', { page: 1 });
    expect(client.finance.listVideoModerationResults).toHaveBeenCalledWith('ch1', { page: 1 });

    await service.listVideoModerationResults('ch1');
    expect(client.finance.listVideoModerationResults).toHaveBeenLastCalledWith('ch1', {});

    await service.listBillDetails({ itemCategory: 'live' });
    expect(client.finance.listBillDetails).toHaveBeenCalledWith({ itemCategory: 'live' });
  });

  it('GroupServiceSdk forwards every method to client.group / v4Group / other', async () => {
    const service = new GroupServiceSdk(authConfig as any, serviceConfig as any);

    await service.listAllocateLog({ a: 1 });
    expect(client.group.listAllocateLog).toHaveBeenCalledWith({ a: 1 });

    await service.setConcurrences({ b: 2 });
    expect(client.group.setConcurrences).toHaveBeenCalledWith({ b: 2 });

    await service.setFlow({ c: 3 });
    expect(client.group.setFlow).toHaveBeenCalledWith({ c: 3 });

    await service.setLiveDurations({ d: 4 });
    expect(client.group.setLiveDurations).toHaveBeenCalledWith({ d: 4 });

    await service.setSpace({ e: 5 });
    expect(client.group.setSpace).toHaveBeenCalledWith({ e: 5 });

    await service.createGroupUser({ email: 'a@example.com' });
    expect(client.v4Group.createGroupUser).toHaveBeenCalledWith({ email: 'a@example.com' });

    await service.listGroupUserPackages();
    expect(client.v4Group.listGroupUserPackages).toHaveBeenCalledWith({});

    await service.updateGroupUserPackage({ id: 1 });
    expect(client.v4Group.updateGroupUserPackage).toHaveBeenCalledWith({ id: 1 });

    await service.listBillingDaily({ date: '2026-01-01' });
    expect(client.v4Group.listBillingDaily).toHaveBeenCalledWith({ date: '2026-01-01' });

    await service.listGroupUserBillingDaily({ start: '2026-01-01' });
    expect(client.v4Group.listGroupUserBillingDaily).toHaveBeenCalledWith({ start: '2026-01-01' });

    await service.listAllocationLogs({ emails: ['a@example.com'] });
    expect(client.v4Group.listAllocationLogs).toHaveBeenCalledWith({ emails: ['a@example.com'] });

    await service.healthCheck();
    expect(client.other.healthCheck).toHaveBeenCalledWith();

    await service.createIsolation({ email: 'a@example.com' });
    expect(client.other.createIsolation).toHaveBeenCalledWith({ email: 'a@example.com' });

    await service.getPackageValidityList();
    expect(client.other.getPackageValidityList).toHaveBeenCalledWith({});

    await service.updatePackageValidity({ validDate: '2026-12-31' });
    expect(client.other.updatePackageValidity).toHaveBeenCalledWith({ validDate: '2026-12-31' });

    await service.resetAppSecret({ email: 'a@example.com' });
    expect(client.other.resetAppSecret).toHaveBeenCalledWith({ email: 'a@example.com' });
  });

  it('MaterialServiceSdk forwards every method to client.v4Material', async () => {
    const service = new MaterialServiceSdk(authConfig as any, serviceConfig as any);

    const cases: Array<[string, unknown]> = [
      ['listMaterials', { type: 'image' }],
      ['deleteMaterials', { ids: [1] }],
      ['listMaterialCategories', { type: 'image' }],
      ['listMaterialLabels', { page: 1 }],
      ['createMaterialLabel', { name: 'L' }],
      ['updateMaterialLabel', { id: 1, name: 'L2' }],
      ['deleteMaterialLabel', { id: 1 }],
    ];

    for (const [method, params] of cases) {
      await (service as any)[method](params);
      expect((client.v4Material as any)[method]).toHaveBeenCalledWith(params);
    }
  });

  it('WebAppServiceSdk forwards every method to client.v4WebApp', async () => {
    const service = new WebAppServiceSdk(authConfig as any, serviceConfig as any);

    await service.listPermissions();
    expect(client.v4WebApp.listPermissions).toHaveBeenCalledWith();

    await service.createRole({ name: 'Role' });
    expect(client.v4WebApp.createRole).toHaveBeenCalledWith({ name: 'Role' });

    await service.getRole(7);
    expect(client.v4WebApp.getRole).toHaveBeenCalledWith(7);

    await service.listRoles();
    expect(client.v4WebApp.listRoles).toHaveBeenCalledWith({});

    await service.listRoles({ page: 1 });
    expect(client.v4WebApp.listRoles).toHaveBeenLastCalledWith({ page: 1 });

    await service.updateRole({ id: 1, name: 'R' });
    expect(client.v4WebApp.updateRole).toHaveBeenCalledWith({ id: 1, name: 'R' });

    await service.deleteRole(3);
    expect(client.v4WebApp.deleteRole).toHaveBeenCalledWith(3);
  });

  it('PartnerServiceSdk forwards every method to client.other', async () => {
    const service = new PartnerServiceSdk(authConfig as any, serviceConfig as any);

    await service.registerUser({ company: 'Co' });
    expect(client.other.registerUser).toHaveBeenCalledWith({ company: 'Co' });

    await service.createTencentOrder({ uin: 'uin' });
    expect(client.other.createTencentOrder).toHaveBeenCalledWith({ uin: 'uin' });
  });

  it('RobotServiceSdk forwards every method to client.v4Robot', async () => {
    const service = new RobotServiceSdk(authConfig as any, serviceConfig as any);

    await service.listRobots();
    expect(client.v4Robot.listRobots).toHaveBeenCalledWith({});

    await service.listRobots({ page: 1 });
    expect(client.v4Robot.listRobots).toHaveBeenLastCalledWith({ page: 1 });

    await service.batchSaveRobots({ robots: [{ name: 'bot' }] });
    expect(client.v4Robot.batchSaveRobots).toHaveBeenCalledWith({ robots: [{ name: 'bot' }] });

    await service.batchDeleteRobots({ ids: [1, 2] });
    expect(client.v4Robot.batchDeleteRobots).toHaveBeenCalledWith({ ids: [1, 2] });
  });
});
