import { AccountApiHandler } from './account-api.handler';
import { CustomFieldHandler } from './custom-field.handler';
import { FinanceHandler } from './finance.handler';
import { GlobalHandler } from './global.handler';
import { GroupHandler } from './group.handler';
import { InteractionHandler } from './interaction.handler';
import { InviteSalesHandler } from './invite-sales.handler';
import { MaterialHandler } from './material.handler';
import { PartnerHandler } from './partner.handler';
import { RobotHandler } from './robot.handler';
import { UserSettingsHandler } from './user-settings.handler';
import { WebAppHandler } from './webapp.handler';
import { WebHandler } from './web.handler';
import { AccountServiceSdk } from '../services/account-service';
import { CustomFieldServiceSdk } from '../services/custom-field-service';
import { FinanceServiceSdk } from '../services/finance-service';
import { GlobalServiceSdk } from '../services/global-service';
import { GroupServiceSdk } from '../services/group-service';
import { InteractionServiceSdk } from '../services/interaction-service';
import { InviteSalesServiceSdk } from '../services/invite-sales-service';
import { MaterialServiceSdk } from '../services/material-service';
import { PartnerServiceSdk } from '../services/partner-service';
import { RobotServiceSdk } from '../services/robot-service';
import { UserSettingsServiceSdk } from '../services/user.service';
import { WebAppServiceSdk } from '../services/webapp-service';
import { WebServiceSdk } from '../services/web-service';

jest.mock('../services/account-service');
jest.mock('../services/custom-field-service');
jest.mock('../services/finance-service');
jest.mock('../services/global-service');
jest.mock('../services/group-service');
jest.mock('../services/interaction-service');
jest.mock('../services/invite-sales-service');
jest.mock('../services/material-service');
jest.mock('../services/partner-service');
jest.mock('../services/robot-service');
jest.mock('../services/user.service');
jest.mock('../services/webapp-service');
jest.mock('../services/web-service');

const authConfig = { appId: 'app', appSecret: 'secret', userId: 'user' };
const serviceConfig = { baseUrl: 'https://api.polyv.net', timeout: 30000, debug: false };

function createService(methods: string[]): Record<string, jest.Mock> {
  return Object.fromEntries(
    methods.map((method) => [method, jest.fn().mockResolvedValue({ ok: method })])
  );
}

describe('API surface handlers', () => {
  let consoleLog: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLog = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleLog.mockRestore();
  });

  it('executes cross-cutting interaction operations', async () => {
    const service = createService([
      'sendFavor',
      'sendRewardMsg',
      'getStudentQuestionWebhook',
      'setStudentQuestionWebhook',
      'deleteStudentQuestionWebhook',
      'sendTeacherAnswer',
      'listInteractionEvents',
      'saveInteractionEvent',
      'deleteInteractionEvent',
      'createInvitePoster',
      'queryDiskVideoCustomScript',
      'uploadDiskVideoCustomScript',
      'deleteInteractionScript',
      'createTaskRewardActivity',
      'listTaskRewardActivities',
      'listTaskRewardStats',
      'listTaskRewardViewerDetails',
      'updateTaskRewardActivity',
      'deleteTaskRewardActivity',
      'stopTaskRewardActivity',
      'listViewerTaskRewardDetails',
      'submitViewerTaskRewardAcceptInfo',
    ]);
    (InteractionServiceSdk as jest.MockedClass<typeof InteractionServiceSdk>).mockImplementation(() => service as any);
    const handler = new InteractionHandler(authConfig, serviceConfig);
    const base = { output: 'json', force: true };

    const cases: Array<[string, string, Record<string, unknown>]> = [
      ['sendFavor', 'sendFavor', { channelId: 'ch1', viewerId: 'viewer1', times: 1 }],
      ['sendRewardMsg', 'sendRewardMsg', {
        channelId: 'ch1',
        nickname: 'nick',
        avatar: 'https://img.test/a.png',
        viewerId: 'viewer1',
        donateType: 'cash',
        content: 'reward',
        goodImage: 'https://img.test/g.png',
        sessionId: 's1',
        goodNum: 2,
        needUserImage: 'Y',
      }],
      ['getStudentQuestionWebhook', 'getStudentQuestionWebhook', { roomId: 'room1' }],
      ['setStudentQuestionWebhook', 'setStudentQuestionWebhook', { roomId: 'room1', callbackUrl: 'https://example.com/hook' }],
      ['deleteStudentQuestionWebhook', 'deleteStudentQuestionWebhook', { roomId: 'room1' }],
      ['sendTeacherAnswer', 'sendTeacherAnswer', { roomId: 'room1', content: 'answer', viewerUserId: 'viewer1', teacherNick: 'teacher' }],
      ['listInteractionEvents', 'listInteractionEvents', { roomId: 'room1', page: 1, size: 10 }],
      ['saveInteractionEvent', 'saveInteractionEvent', { channelId: 'ch1', tasks: [{ type: 'signCount', signCount: 1, startTime: 1000, endTime: 2000 }], allDone: 'Y' }],
      ['deleteInteractionEvent', 'deleteInteractionEvent', { channelId: 'ch1', taskIds: ['evt1'] }],
      ['createInvitePoster', 'createInvitePoster', { channelId: 'ch1', openId: 'openid', nickname: 'nick' }],
      ['queryDiskVideoCustomScript', 'queryDiskVideoCustomScript', { channelId: 'ch1', diskVideoId: 'video1' }],
      ['uploadDiskVideoCustomScript', 'uploadDiskVideoCustomScript', { channelId: 'ch1', diskVideoId: 'video1', filePath: '/tmp/script.js' }],
      ['deleteInteractionScript', 'deleteInteractionScript', { channelId: 'ch1', id: 'script1' }],
      ['createTaskRewardActivity', 'createTaskRewardActivity', {
        channelId: 'ch1',
        activityName: 'activity',
        taskRule: 'daily',
        startTime: 1000,
        endTime: 2000,
        tasks: [{ name: 'watch', score: 1 }],
      }],
      ['listTaskRewardActivities', 'listTaskRewardActivities', { channelId: 'ch1', page: 1, size: 10 }],
      ['listTaskRewardStats', 'listTaskRewardStats', { channelId: 'ch1', page: 1, size: 10 }],
      ['listTaskRewardViewerDetails', 'listTaskRewardViewerDetails', { channelId: 'ch1', activityId: 'act1', page: 1, size: 10 }],
      ['updateTaskRewardActivity', 'updateTaskRewardActivity', { channelId: 'ch1', activityId: 'act1', tasks: [{ name: 'watch' }] }],
      ['deleteTaskRewardActivity', 'deleteTaskRewardActivity', { activityId: 'act1' }],
      ['stopTaskRewardActivity', 'stopTaskRewardActivity', { activityId: 'act1' }],
      ['listViewerTaskRewardDetails', 'listViewerTaskRewardDetails', { viewerId: 'viewer1', page: 1, size: 10 }],
      ['submitViewerTaskRewardAcceptInfo', 'submitViewerTaskRewardAcceptInfo', { id: 'accept1', viewerId: 'viewer1', formInfo: [{ key: 'name', value: 'Nick' }] }],
    ];

    for (const [method, serviceMethod, options] of cases) {
      await (handler as any)[method]({ ...base, ...options });
      expect(service[serviceMethod]).toHaveBeenCalled();
    }
  });

  it('executes user settings operations', async () => {
    const service = createService([
      'listChildAccounts',
      'listChildAccountRoles',
      'createChildAccount',
      'updateChildAccount',
      'deleteChildAccount',
      'getChildBySale',
      'listOrganizations',
      'createOrganization',
      'deleteOrganization',
      'getDonateTemplate',
      'updateDonateTemplate',
      'getMarqueeTemplate',
      'updateMarqueeTemplate',
      'getRoleConfigTemplate',
      'updateRoleConfigTemplate',
      'getPlaybackSetting',
      'updatePlaybackSetting',
      'getAudioModerationSetting',
      'updateAudioModerationSetting',
      'getVideoModerationSetting',
      'updateVideoModerationSetting',
      'getGlobalFooter',
      'updateGlobalFooter',
      'getPvShowEnable',
      'updatePvShowEnable',
      'sendSms',
      'getMicDuration',
      'getMrConcurrencyDetail',
      'getBillUseDetailList',
      'getWatchLogList',
      'getWatchLogDetail',
    ]);
    (UserSettingsServiceSdk as jest.MockedClass<typeof UserSettingsServiceSdk>).mockImplementation(() => service as any);
    const handler = new UserSettingsHandler(authConfig, serviceConfig);
    const base = { output: 'json', force: true };

    const cases: Array<[string, string, Record<string, unknown>]> = [
      ['listChildren', 'listChildAccounts', { page: 1, size: 10 }],
      ['listChildRoles', 'listChildAccountRoles', {}],
      ['createChild', 'createChildAccount', { childEmail: 'child@example.com', childName: 'Child', password: 'Password1', roleId: 1 }],
      ['updateChild', 'updateChildAccount', { childEmail: 'child@example.com', childName: 'Updated' }],
      ['deleteChild', 'deleteChildAccount', { childEmail: 'child@example.com' }],
      ['getChildBySale', 'getChildBySale', { saleId: 'sale1' }],
      ['listOrganizations', 'listOrganizations', {}],
      ['createOrganization', 'createOrganization', { name: 'Org', parentId: 0 }],
      ['deleteOrganization', 'deleteOrganization', { organizationId: 1 }],
      ['getDonateTemplate', 'getDonateTemplate', {}],
      ['updateDonateTemplate', 'updateDonateTemplate', { donateGiftEnabled: 'Y', giftDonate: [{ name: 'gift' }] }],
      ['getMarqueeTemplate', 'getMarqueeTemplate', {}],
      ['updateMarqueeTemplate', 'updateMarqueeTemplate', { enable: 'Y', content: 'hello' }],
      ['getRoleConfigTemplate', 'getRoleConfigTemplate', {}],
      ['updateRoleConfigTemplate', 'updateRoleConfigTemplate', { config: { role: 'host' } }],
      ['getPlaybackSetting', 'getPlaybackSetting', {}],
      ['updatePlaybackSetting', 'updatePlaybackSetting', { config: { enabled: true } }],
      ['getAudioModerationSetting', 'getAudioModerationSetting', {}],
      ['updateAudioModerationSetting', 'updateAudioModerationSetting', { moderationEnabled: 'Y' }],
      ['getVideoModerationSetting', 'getVideoModerationSetting', {}],
      ['updateVideoModerationSetting', 'updateVideoModerationSetting', { moderationEnabled: 'Y', imageFrequency: 10 }],
      ['getGlobalFooter', 'getGlobalFooter', {}],
      ['updateGlobalFooter', 'updateGlobalFooter', { showFooterEnabled: 'Y', footerText: 'footer' }],
      ['getPvShowEnable', 'getPvShowEnable', {}],
      ['updatePvShowEnable', 'updatePvShowEnable', { enabled: 'Y' }],
      ['sendSms', 'sendSms', { phoneNumbers: '13800000000,13900000000', templateParamNames: 'name,code', templateParamValues: 'nick,1234' }],
      ['getMicDuration', 'getMicDuration', { startTime: '2026-01-01', endTime: '2026-01-02' }],
      ['getMrConcurrencyDetail', 'getMrConcurrencyDetail', {}],
      ['getBillUseDetailList', 'getBillUseDetailList', { itemCategory: 'live', startDate: '2026-01-01', endDate: '2026-01-02' }],
      ['listWatchLogs', 'getWatchLogList', { page: 1, size: 10 }],
      ['getWatchLogDetail', 'getWatchLogDetail', { viewerId: 'viewer1', page: 1, size: 10 }],
    ];

    for (const [method, serviceMethod, options] of cases) {
      await (handler as any)[method]({ ...base, ...options });
      expect(service[serviceMethod]).toHaveBeenCalled();
    }
  });

  it('executes account API operations', async () => {
    const service = createService([
      'channels',
      'userPlaybackList',
      'userChannelBasicList',
      'getSimpleChannelList',
      'channelDetailList',
      'getUserDurations',
      'micDuration',
      'getIncomeDetail',
      'getCategoryList',
      'createCategory',
      'deleteCategory',
      'updateCategoryName',
      'updateCategoryRank',
      'receiveList',
      'setUserChildrenLoginToken',
      'setUserLoginToken',
      'setStreamCallback',
      'setRecordCallback',
      'setPlaybackCallback',
    ]);
    (AccountServiceSdk as jest.MockedClass<typeof AccountServiceSdk>).mockImplementation(() => service as any);
    const handler = new AccountApiHandler(authConfig, serviceConfig);
    const base = { output: 'json', force: true };

    const cases: Array<[string, string, Record<string, unknown>]> = [
      ['listChannels', 'channels', { categoryId: 1, keyword: 'demo' }],
      ['listPlayback', 'userPlaybackList', { page: 1, pageSize: 10, startDate: '2026-01-01', endDate: '2026-01-02' }],
      ['listChannelBasic', 'userChannelBasicList', { categoryIds: '1,2', page: 1, pageSize: 10 }],
      ['listSimpleChannels', 'getSimpleChannelList', { page: 1, pageSize: 10, watchStatus: 'live' }],
      ['listChannelDetails', 'channelDetailList', { page: 1, pageSize: 10, watchStatus: 'live' }],
      ['getUserDurations', 'getUserDurations', {}],
      ['getMicDuration', 'micDuration', {}],
      ['listIncome', 'getIncomeDetail', { userId: 'user', startDate: '2026-01-01', endDate: '2026-01-02', page: 1, pageSize: 10 }],
      ['listCategories', 'getCategoryList', {}],
      ['createCategory', 'createCategory', { name: 'Category' }],
      ['deleteCategory', 'deleteCategory', { categoryId: 1 }],
      ['updateCategoryName', 'updateCategoryName', { categoryId: 1, name: 'New Name' }],
      ['updateCategoryRank', 'updateCategoryRank', { categoryId: 1, afterCategoryId: 2 }],
      ['listReceiveChannels', 'receiveList', { channelId: 'ch1', page: 1, pageSize: 10 }],
      ['setSsoToken', 'setUserChildrenLoginToken', { childEmail: 'child@example.com', token: 'token' }],
      ['setSsoToken', 'setUserLoginToken', { token: 'token' }],
      ['setCallback', 'setStreamCallback', { type: 'stream', userId: 'user', url: 'https://example.com/stream' }],
      ['setCallback', 'setRecordCallback', { type: 'record', userId: 'user', url: 'https://example.com/record' }],
      ['setCallback', 'setPlaybackCallback', { type: 'playback', userId: 'user', url: 'https://example.com/playback' }],
    ];

    for (const [method, serviceMethod, options] of cases) {
      await (handler as any)[method]({ ...base, ...options });
      expect(service[serviceMethod]).toHaveBeenCalled();
    }
  });

  it('executes group account operations', async () => {
    const service = createService([
      'listAllocateLog',
      'setConcurrences',
      'setFlow',
      'setLiveDurations',
      'setSpace',
      'createGroupUser',
      'listGroupUserPackages',
      'updateGroupUserPackage',
      'listBillingDaily',
      'listGroupUserBillingDaily',
      'listAllocationLogs',
      'healthCheck',
      'createIsolation',
      'getPackageValidityList',
      'updatePackageValidity',
      'resetAppSecret',
    ]);
    service.updateGroupUserPackage.mockResolvedValue(true);
    service.updatePackageValidity.mockResolvedValue(true);
    (GroupServiceSdk as jest.MockedClass<typeof GroupServiceSdk>).mockImplementation(() => service as any);
    const handler = new GroupHandler(authConfig, serviceConfig);
    const base = { output: 'json', force: true };

    const cases: Array<[string, string, Record<string, unknown>]> = [
      ['listAllocateLog', 'listAllocateLog', { emails: ['a@example.com'] }],
      ['setConcurrences', 'setConcurrences', { email: 'a@example.com', concurrences: 10 }],
      ['setFlow', 'setFlow', { email: 'a@example.com', flow: 100 }],
      ['setLiveDurations', 'setLiveDurations', { email: 'a@example.com', duration: 100 }],
      ['setSpace', 'setSpace', { email: 'a@example.com', space: 100 }],
      ['createUser', 'createGroupUser', { email: 'a@example.com', password: 'Password1', contacts: 'Nick', phone: '13800000000', maxChannels: 10 }],
      ['listUserPackages', 'listGroupUserPackages', { email: 'a@example.com' }],
      ['updateUserPackage', 'updateGroupUserPackage', { email: 'a@example.com', packageId: 1 }],
      ['listBillingDaily', 'listBillingDaily', { billingDate: '2026-01-01' }],
      ['listUserBillingDaily', 'listGroupUserBillingDaily', { startDate: '2026-01-01', endDate: '2026-01-02' }],
      ['listAllocationLogs', 'listAllocationLogs', { emails: ['a@example.com'] }],
      ['healthCheck', 'healthCheck', {}],
      ['createIsolation', 'createIsolation', { email: 'a@example.com', password: 'Password1' }],
      ['listPackageValidity', 'getPackageValidityList', { email: 'a@example.com' }],
      ['updatePackageValidity', 'updatePackageValidity', { email: 'a@example.com', validDate: '2026-12-31' }],
      ['resetAppSecret', 'resetAppSecret', { email: 'a@example.com' }],
    ];

    for (const [method, serviceMethod, options] of cases) {
      await (handler as any)[method]({ ...base, ...options });
      expect(service[serviceMethod]).toHaveBeenCalled();
    }
  });

  it('executes global API resource handlers', async () => {
    const customFieldService = createService(['listCustomFields', 'addCustomField', 'addCustomFieldValue']);
    const financeService = createService([
      'getAudioModerationSettings',
      'listAudioModerationRecords',
      'updateAudioModerationSettings',
      'getVideoModerationSettings',
      'updateVideoModerationSettings',
      'listVideoModerationResults',
      'listBillDetails',
    ]);
    const inviteSalesService = createService(['listInviteSales', 'addInviteSale', 'updateInviteSale', 'removeInviteSale', 'listFollowViewers']);
    const materialService = createService([
      'listMaterials',
      'deleteMaterials',
      'listMaterialCategories',
      'listMaterialLabels',
      'createMaterialLabel',
      'updateMaterialLabel',
      'deleteMaterialLabel',
    ]);
    const partnerService = createService(['registerUser', 'createTencentOrder']);
    const robotService = createService(['listRobots', 'batchSaveRobots', 'batchDeleteRobots']);
    const webAppService = createService(['listPermissions', 'listRoles', 'getRole', 'createRole', 'updateRole', 'deleteRole']);

    (CustomFieldServiceSdk as jest.MockedClass<typeof CustomFieldServiceSdk>).mockImplementation(() => customFieldService as any);
    (FinanceServiceSdk as jest.MockedClass<typeof FinanceServiceSdk>).mockImplementation(() => financeService as any);
    (InviteSalesServiceSdk as jest.MockedClass<typeof InviteSalesServiceSdk>).mockImplementation(() => inviteSalesService as any);
    (MaterialServiceSdk as jest.MockedClass<typeof MaterialServiceSdk>).mockImplementation(() => materialService as any);
    (PartnerServiceSdk as jest.MockedClass<typeof PartnerServiceSdk>).mockImplementation(() => partnerService as any);
    (RobotServiceSdk as jest.MockedClass<typeof RobotServiceSdk>).mockImplementation(() => robotService as any);
    (WebAppServiceSdk as jest.MockedClass<typeof WebAppServiceSdk>).mockImplementation(() => webAppService as any);

    const base = { output: 'json', force: true };

    const customField = new CustomFieldHandler(authConfig, serviceConfig);
    await customField.list(base);
    await customField.add({ ...base, customFieldId: 'field1', customFieldName: 'Field', customFieldType: 'text' });
    await customField.saveValues({ ...base, viewerId: 'viewer1', customFieldId: 'field1', customFieldValue: 'value' });
    await customField.saveValues({
      ...base,
      values: JSON.stringify([{ viewerId: 'viewer2', customFieldId: 'field1', customFieldValue: 'value2' }]),
    });
    expect(customFieldService.addCustomFieldValue).toHaveBeenCalledTimes(2);

    const finance = new FinanceHandler(authConfig, serviceConfig);
    await finance.getAudioSettings({ ...base, channelId: 'ch1' });
    await finance.listAudioRecords({ ...base, channelId: 'ch1', page: 1 });
    await finance.updateAudioSettings({ ...base, channelId: 'ch1', enabled: 'Y' });
    await finance.getVideoSettings({ ...base, channelId: 'ch1' });
    await finance.updateVideoSettings({ ...base, channelId: 'ch1', enabled: 'Y' });
    await finance.listVideoResults({ ...base, channelId: 'ch1', page: 1 });
    await finance.listBillDetails({ ...base, itemCategory: 'live', startDate: '2026-01-01', endDate: '2026-01-02' });
    expect(financeService.listBillDetails).toHaveBeenCalled();

    const inviteSales = new InviteSalesHandler(authConfig, serviceConfig);
    await inviteSales.list({ ...base, page: 1, size: 10 });
    await inviteSales.add({ ...base, viewerUnionIds: 'u1,u1,u2', organizationId: 1 });
    await inviteSales.update({ ...base, viewerUnionIds: 'u1,u2', organizationId: 1 });
    await inviteSales.remove({ ...base, viewerUnionIds: 'u1,u2', newViewerUnionId: 'u3' });
    await inviteSales.listFollowViewers({ ...base, pageNumber: 1, pageSize: 10 });
    expect(inviteSalesService.addInviteSale).toHaveBeenCalledWith({ viewerUnionIds: ['u1', 'u2'], organizationId: 1 });

    const material = new MaterialHandler(authConfig, serviceConfig);
    await material.listMaterials({ ...base, type: 'image', pageNumber: 1, pageSize: 10 });
    await material.deleteMaterials({ ...base, materialIds: ['m1'] });
    await material.listCategories({ ...base, materialType: 'image' });
    await material.listLabels({ ...base, pageNumber: 1, pageSize: 10 });
    await material.createLabel({ ...base, name: 'Label' });
    await material.updateLabel({ ...base, id: 1, name: 'Renamed' });
    await material.deleteLabel({ ...base, id: 1 });
    expect(materialService.deleteMaterialLabel).toHaveBeenCalled();

    const partner = new PartnerHandler(authConfig, serviceConfig);
    await partner.registerUser({ ...base, company: 'Co', mobile: '13800000000', contact: 'Nick', email: 'n@example.com' });
    await partner.createTencentOrder({ ...base, uin: 'uin', orderId: 'order1', email: 'n@example.com', mobile: '13800000000', basicService: 'Y' });
    expect(partnerService.createTencentOrder).toHaveBeenCalled();

    const robot = new RobotHandler(authConfig, serviceConfig);
    await robot.listRobots({ ...base, page: 1 });
    await robot.batchSaveRobots({ ...base, robots: [{ name: 'bot' }] });
    await robot.batchDeleteRobots({ ...base, ids: [1, 2] });
    expect(robotService.batchDeleteRobots).toHaveBeenCalled();

    const webApp = new WebAppHandler(authConfig, serviceConfig);
    await webApp.listPermissions(base);
    await webApp.listRoles({ ...base, page: 1 });
    await webApp.getRole({ ...base, roleId: 1 });
    await webApp.createRole({ ...base, name: 'Role', roleType: 'custom', permissionIds: [1] });
    await webApp.updateRole({ ...base, roleId: 1, name: 'Role', roleType: 'custom' });
    await webApp.deleteRole({ ...base, roleId: 1 });
    expect(webAppService.deleteRole).toHaveBeenCalledWith(1);
  });

  it('executes global API operations', async () => {
    const service = createService(['getAuth', 'updateAuth', 'getPageSetting', 'updatePageSetting']);
    (GlobalServiceSdk as jest.MockedClass<typeof GlobalServiceSdk>).mockImplementation(() => service as any);
    const handler = new GlobalHandler(authConfig, serviceConfig);
    const base = { output: 'json', force: true };

    await handler.getAuth(base);
    expect(service.getAuth).toHaveBeenCalled();

    await handler.updateAuth({ ...base, authSettings: [{ type: 'phone' }, { type: 'code' }] });
    expect(service.updateAuth).toHaveBeenCalledWith({ authSettings: [{ type: 'phone' }, { type: 'code' }] });

    await handler.getPageSetting(base);
    expect(service.getPageSetting).toHaveBeenCalled();

    await handler.updatePageSetting({ ...base, config: { footerText: 'hi' } });
    expect(service.updatePageSetting).toHaveBeenCalledWith({ footerText: 'hi' });
  });

  it('executes web channel operations', async () => {
    const methods = [
      'getSplash', 'setSplash', 'setPublisher', 'updateChannelName', 'updateChannelLogo',
      'liveLikes', 'updateLikes', 'getCountdown', 'setCountdown', 'getMenuList', 'addMenu',
      'deleteMenu', 'updateMenu', 'setMenu', 'updateRank', 'updateConsultingEnabled',
      'getTuwenList', 'getDonate', 'updateCash', 'updateGood', 'getWeixinShare',
      'updateWeixinShare', 'updateGlobalEnabled', 'uploadImage', 'uploadWhiteList',
      'downloadWhiteList', 'setAuthType', 'setExternalAuth', 'setAuthorizedAddress',
      'updateAuthUrl', 'getRecordField', 'getRecordInfo', 'enrollList', 'downloadRecordInfo',
    ];
    const service = createService(methods);
    service.downloadWhiteList.mockResolvedValue(new ArrayBuffer(8));
    service.downloadRecordInfo.mockResolvedValue(new ArrayBuffer(8));
    (WebServiceSdk as jest.MockedClass<typeof WebServiceSdk>).mockImplementation(() => service as any);
    const handler = new WebHandler(authConfig, serviceConfig);

    const base: Record<string, unknown> = {
      output: 'json',
      force: true,
      channelId: 'ch1',
      channelIds: ['ch1', 'ch2'],
      userId: 'user1',
      splashEnabled: 'Y',
      publisher: 'Pub',
      name: 'Name',
      imgfile: '/tmp/logo.png',
      menuId: 1,
      menuIds: [1, 2],
      content: 'content',
      type: 'image',
      enabled: 'Y',
      globalEnabledType: 'marquee',
      cashes: [1, 2],
      cashMin: 1,
      goods: [{ name: 'gift' }],
      files: ['/tmp/a.png'],
      rank: 1,
      file: '/tmp/list.csv',
      outputFile: '/tmp/out.bin',
      authType: 'none',
      externalUri: 'https://example.com/ext',
      customUri: 'https://example.com/auth',
    };

    const calls: Array<[string, string]> = [
      ['getSplash', 'getSplash'],
      ['setSplash', 'setSplash'],
      ['setPublisher', 'setPublisher'],
      ['updateChannelName', 'updateChannelName'],
      ['updateChannelLogo', 'updateChannelLogo'],
      ['getLikes', 'liveLikes'],
      ['updateLikes', 'updateLikes'],
      ['getCountdown', 'getCountdown'],
      ['setCountdown', 'setCountdown'],
      ['listMenus', 'getMenuList'],
      ['addMenu', 'addMenu'],
      ['deleteMenu', 'deleteMenu'],
      ['updateMenu', 'updateMenu'],
      ['setMenu', 'setMenu'],
      ['updateRank', 'updateRank'],
      ['updateConsultingEnabled', 'updateConsultingEnabled'],
      ['listTuwen', 'getTuwenList'],
      ['getDonate', 'getDonate'],
      ['updateCash', 'updateCash'],
      ['updateGood', 'updateGood'],
      ['getWeixinShare', 'getWeixinShare'],
      ['updateWeixinShare', 'updateWeixinShare'],
      ['updateGlobalEnabled', 'updateGlobalEnabled'],
      ['uploadImage', 'uploadImage'],
      ['uploadWhiteList', 'uploadWhiteList'],
      ['downloadWhiteList', 'downloadWhiteList'],
      ['setAuthType', 'setAuthType'],
      ['setExternalAuth', 'setExternalAuth'],
      ['setAuthorizedAddress', 'setAuthorizedAddress'],
      ['updateAuthUrl', 'updateAuthUrl'],
      ['getRecordField', 'getRecordField'],
      ['listRecordInfo', 'getRecordInfo'],
      ['listEnroll', 'enrollList'],
      ['downloadRecordInfo', 'downloadRecordInfo'],
    ];

    for (const [method, serviceMethod] of calls) {
      await (handler as any)[method]({ ...base });
      expect((service as any)[serviceMethod]).toHaveBeenCalled();
    }
  });

  it('rejects invalid handler options before calling services', async () => {
    (PartnerServiceSdk as jest.MockedClass<typeof PartnerServiceSdk>).mockImplementation(() => createService(['createTencentOrder']) as any);
    const partner = new PartnerHandler(authConfig, serviceConfig);
    await expect(partner.createTencentOrder({
      output: 'json',
      force: true,
      uin: 'uin',
      orderId: 'order1',
      email: 'n@example.com',
      mobile: '13800000000',
    })).rejects.toThrow('basicService or premiumService');

    (InviteSalesServiceSdk as jest.MockedClass<typeof InviteSalesServiceSdk>).mockImplementation(() => createService(['addInviteSale']) as any);
    const inviteSales = new InviteSalesHandler(authConfig, serviceConfig);
    await expect(inviteSales.add({ output: 'json', force: true, viewerUnionIds: '   ' })).rejects.toThrow('viewerUnionIds');
  });
});
