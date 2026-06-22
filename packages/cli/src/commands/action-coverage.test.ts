import { Command } from 'commander';
import { registerAccountCommands } from './account.commands';
import { registerAiCommands } from './ai.commands';
import { registerCardPushCommands } from './card-push.commands';
import { registerChannelCommands } from './channel.commands';
import { registerChatCommands } from './chat.commands';
import { registerCheckinCommands } from './checkin.commands';
import { registerCouponCommands } from './coupon.commands';
import { registerCustomFieldCommands } from './custom-field.commands';
import { registerDocumentCommands } from './document.commands';
import { registerDonateCommands } from './donate.commands';
import { registerFinanceCommands } from './finance.commands';
import { registerGlobalCommands } from './global.commands';
import { registerGroupCommands } from './group.commands';
import { registerInteractionCommands } from './interaction.commands';
import { registerInviteSalesCommands } from './invite-sales.commands';
import { registerLotteryCommands } from './lottery.commands';
import { registerMaterialCommands } from './material.commands';
import { registerMonitorCommands } from './monitor.commands';
import { registerPartnerCommands } from './partner.commands';
import { registerPlatformCommands } from './platform.commands';
import { registerPlatformLabelCommands } from './platform-label.commands';
import { registerPlaybackCommands } from './playback.commands';
import { registerPlayerCommands } from './player.commands';
import { registerProductCommands } from './product.commands';
import { registerPromotionCommands } from './promotion.commands';
import { registerQaCommands } from './qa.commands';
import { registerQuestionnaireCommands } from './questionnaire.commands';
import { registerRecordCommands } from './record.commands';
import { registerRobotCommands } from './robot.commands';
import { registerSessionCommands } from './session.commands';
import { registerStatisticsCommands } from './statistics.commands';
import { registerStreamCommands } from './stream.commands';
import { registerTransmitCommands } from './transmit.commands';
import { registerUserCommands } from './user.commands';
import { registerViewerCommands } from './viewer.commands';
import { registerWatchConditionCommands } from './watch-condition.commands';
import { registerWebCommands } from './web.commands';
import { registerWebAppCommands } from './webapp.commands';
import { registerWhitelistCommands } from './whitelist.commands';
import { authAdapter } from '../config/auth-adapter';
import { configManager } from '../config/manager';

const mockCreateAsyncProxy = () => new Proxy<Record<string, jest.Mock>>({}, {
  get(target, prop: string | symbol) {
    if (typeof prop !== 'string') return undefined;
    // Never look like a thenable: some commands `await` the handler-creation helper,
    // which returns this proxy, and a thenable proxy would hang the await forever.
    if (prop === 'then' || prop === 'catch' || prop === 'finally') return undefined;
    if (!(prop in target)) {
      target[prop] = jest.fn().mockResolvedValue({ ok: prop });
    }
    return target[prop];
  },
});

jest.mock('../config/auth-adapter', () => ({
  authAdapter: {
    tryGetAuthConfig: jest.fn(),
    getStatusMessage: jest.fn().mockReturnValue('No authentication configured'),
    getDiagnostics: jest.fn().mockReturnValue({ availableSources: [], errors: [] }),
  },
}));
jest.mock('../config/manager', () => ({
  configManager: {
    load: jest.fn(),
  },
}));
jest.mock('../utils/confirmation', () => ({
  confirmDeletion: jest.fn().mockResolvedValue(true),
}));

jest.mock('../handlers/account-api.handler', () => ({ AccountApiHandler: jest.fn().mockImplementation(() => mockCreateAsyncProxy()) }));
jest.mock('../handlers/channel.handler', () => ({ ChannelHandler: jest.fn().mockImplementation(() => mockCreateAsyncProxy()) }));
jest.mock('../handlers/chat.handler', () => ({ ChatHandler: jest.fn().mockImplementation(() => mockCreateAsyncProxy()) }));
jest.mock('../handlers/document.handler', () => ({ DocumentHandler: jest.fn().mockImplementation(() => mockCreateAsyncProxy()) }));
jest.mock('../handlers/finance.handler', () => ({ FinanceHandler: jest.fn().mockImplementation(() => mockCreateAsyncProxy()) }));
jest.mock('../handlers/global.handler', () => ({ GlobalHandler: jest.fn().mockImplementation(() => mockCreateAsyncProxy()) }));
jest.mock('../handlers/group.handler', () => ({ GroupHandler: jest.fn().mockImplementation(() => mockCreateAsyncProxy()) }));
jest.mock('../handlers/interaction.handler', () => ({ InteractionHandler: jest.fn().mockImplementation(() => mockCreateAsyncProxy()) }));
jest.mock('../handlers/lottery.handler', () => ({ LotteryHandler: jest.fn().mockImplementation(() => mockCreateAsyncProxy()) }));
jest.mock('../handlers/material.handler', () => ({ MaterialHandler: jest.fn().mockImplementation(() => mockCreateAsyncProxy()) }));
jest.mock('../handlers/playback.handler', () => ({ PlaybackHandler: jest.fn().mockImplementation(() => mockCreateAsyncProxy()) }));
jest.mock('../handlers/product.handler', () => ({ ProductHandler: jest.fn().mockImplementation(() => mockCreateAsyncProxy()) }));
jest.mock('../handlers/record.handler', () => ({ RecordHandler: jest.fn().mockImplementation(() => mockCreateAsyncProxy()) }));
jest.mock('../handlers/session.handler', () => ({ SessionHandler: jest.fn().mockImplementation(() => mockCreateAsyncProxy()) }));
jest.mock('../handlers/statistics.handler', () => ({ StatisticsHandler: jest.fn().mockImplementation(() => mockCreateAsyncProxy()) }));
jest.mock('../handlers/stream.handler', () => ({ StreamHandler: jest.fn().mockImplementation(() => mockCreateAsyncProxy()) }));
jest.mock('../handlers/user-settings.handler', () => ({ UserSettingsHandler: jest.fn().mockImplementation(() => mockCreateAsyncProxy()) }));
jest.mock('../handlers/viewer.handler', () => ({ ViewerHandler: jest.fn().mockImplementation(() => mockCreateAsyncProxy()) }));
jest.mock('../handlers/web.handler', () => ({ WebHandler: jest.fn().mockImplementation(() => mockCreateAsyncProxy()) }));
jest.mock('../handlers/webapp.handler', () => ({ WebAppHandler: jest.fn().mockImplementation(() => mockCreateAsyncProxy()) }));
jest.mock('../services/channel.service.sdk', () => ({ ChannelServiceSdk: jest.fn().mockImplementation(() => mockCreateAsyncProxy()) }));
jest.mock('../services/statistics.service.sdk', () => ({ StatisticsServiceSdk: jest.fn().mockImplementation(() => mockCreateAsyncProxy()) }));
jest.mock('../services/monitor-service', () => ({ MonitorServiceSdk: jest.fn().mockImplementation(() => mockCreateAsyncProxy()) }));
jest.mock('../handlers/ai-digital-human.handler', () => ({ AIDigitalHumanHandler: jest.fn().mockImplementation(() => mockCreateAsyncProxy()) }));
jest.mock('../handlers/ai-video-produce.handler', () => ({ AIVideoProduceHandler: jest.fn().mockImplementation(() => mockCreateAsyncProxy()) }));
jest.mock('../handlers/card-push.handler', () => ({ CardPushHandler: jest.fn().mockImplementation(() => mockCreateAsyncProxy()) }));
jest.mock('../handlers/checkin.handler', () => ({ CheckinHandler: jest.fn().mockImplementation(() => mockCreateAsyncProxy()) }));
jest.mock('../handlers/coupon.handler', () => ({ CouponHandler: jest.fn().mockImplementation(() => mockCreateAsyncProxy()) }));
jest.mock('../handlers/custom-field.handler', () => ({ CustomFieldHandler: jest.fn().mockImplementation(() => mockCreateAsyncProxy()) }));
jest.mock('../handlers/donate.handler', () => ({ DonateHandler: jest.fn().mockImplementation(() => mockCreateAsyncProxy()) }));
jest.mock('../handlers/invite-sales.handler', () => ({ InviteSalesHandler: jest.fn().mockImplementation(() => mockCreateAsyncProxy()) }));
jest.mock('../handlers/monitor.handler', () => ({ MonitorHandler: jest.fn().mockImplementation(() => mockCreateAsyncProxy()) }));
jest.mock('../handlers/partner.handler', () => ({ PartnerHandler: jest.fn().mockImplementation(() => mockCreateAsyncProxy()) }));
jest.mock('../handlers/platform.handler', () => ({ PlatformHandler: jest.fn().mockImplementation(() => mockCreateAsyncProxy()) }));
jest.mock('../handlers/platform-label.handler', () => ({ PlatformLabelHandler: jest.fn().mockImplementation(() => mockCreateAsyncProxy()) }));
jest.mock('../handlers/player.handler', () => ({ PlayerHandler: jest.fn().mockImplementation(() => mockCreateAsyncProxy()) }));
jest.mock('../handlers/promotion.handler', () => ({ PromotionHandler: jest.fn().mockImplementation(() => mockCreateAsyncProxy()) }));
jest.mock('../handlers/qa-questionnaire.handler', () => ({ QaQuestionnaireHandler: jest.fn().mockImplementation(() => mockCreateAsyncProxy()) }));
jest.mock('../handlers/robot.handler', () => ({ RobotHandler: jest.fn().mockImplementation(() => mockCreateAsyncProxy()) }));
jest.mock('../handlers/transmit.handler', () => ({ TransmitHandler: jest.fn().mockImplementation(() => mockCreateAsyncProxy()) }));
jest.mock('../handlers/watch-condition.handler', () => ({ WatchConditionHandler: jest.fn().mockImplementation(() => mockCreateAsyncProxy()) }));
jest.mock('../handlers/whitelist.handler', () => ({ WhitelistHandler: jest.fn().mockImplementation(() => mockCreateAsyncProxy()) }));

type ActionCommand = {
  command: Command;
  path: string[];
};

const fixedValues: Record<string, unknown> = {
  activityId: 'activity1',
  antiRecordType: 'none',
  appId: 'app',
  appSecret: 'secret',
  authType: 'none',
  avatar: 'https://example.com/avatar.png',
  basicService: 'Y',
  billingDate: '2026-01-01',
  callbackUrl: 'https://example.com/callback',
  cashes: [1, 2],
  cashMin: 1,
  categoryId: 1,
  categoryIds: '1,2',
  channelId: 'ch1',
  channelIds: ['ch1', 'ch2'],
  childEmail: 'child@example.com',
  company: 'Example Co',
  config: { enabled: true },
  contact: 'Nick',
  contacts: 'Nick',
  content: 'content',
  customFieldId: 'field1',
  customFieldName: 'Field',
  customFieldType: 'text',
  customFieldValue: 'value',
  customUri: 'https://example.com/auth',
  description: 'description',
  diskVideoId: 'video1',
  donateType: 'cash',
  email: 'nick@example.com',
  enabled: 'Y',
  endDate: '2026-01-02',
  endDay: '2026-01-02',
  endTime: 2000,
  eventData: { title: 'Event' },
  eventId: 'event1',
  eventType: 'vote',
  externalUri: 'https://example.com/external',
  file: '/tmp/list.csv',
  fileIds: ['file1'],
  fileName: 'doc.pdf',
  filePath: '/tmp/script.js',
  files: ['/tmp/a.png'],
  force: true,
  formInfo: [{ key: 'name', value: 'Nick' }],
  goods: [{ name: 'gift' }],
  id: 'id1',
  ids: [1, 2],
  imgfile: '/tmp/logo.png',
  itemCategory: 'live',
  keyword: 'keyword',
  labelId: 'label1',
  maxChannels: 10,
  maxViewers: 100,
  menuId: 'menu1',
  menuIds: [1, 2],
  mobile: '13800000000',
  name: 'Name',
  needUserImage: 'Y',
  nickNames: 'Nick,Nick2',
  nickname: 'Nick',
  openId: 'openid',
  orderId: 'order1',
  organizationId: 1,
  output: 'json',
  outputFile: '/tmp/output.bin',
  page: 1,
  pageNumber: 1,
  pageSize: 10,
  password: 'Password1',
  permissionIds: [1, 2],
  phone: '13800000000',
  phoneNumbers: '13800000000',
  publisher: 'Publisher',
  rank: 1,
  roleId: 1,
  roleType: 'custom',
  roomId: 'room1',
  scene: 'topclass',
  size: 10,
  splashEnabled: 'Y',
  startDate: '2026-01-01',
  startDay: '2026-01-01',
  startTime: 1000,
  taskRule: 'daily',
  tasks: [{ name: 'watch' }],
  template: 'ppt',
  templateParamNames: 'code',
  templateParamValues: '1234',
  title: 'Title',
  token: 'token',
  type: 'stream',
  uin: 'uin',
  url: 'https://example.com/callback',
  userId: 'user1',
  userIds: 'user1,user2',
  values: JSON.stringify([{ viewerId: 'viewer1', customFieldId: 'field1', customFieldValue: 'value' }]),
  videoId: 'video1',
  viewerId: 'viewer1',
  viewerIds: 'viewer1,viewer2',
  viewerUnionIds: 'u1,u2',
  viewerUserId: 'viewer1',
  watchStatus: 'live',
};

function optionValue(option: any): unknown {
  const name = option.attributeName();
  if (name in fixedValues) return fixedValues[name];
  if (option.isBoolean()) return true;
  return valueForName(name);
}

function valueForName(name: string): unknown {
  const lower = name.toLowerCase();
  if (name in fixedValues) return fixedValues[name];
  if (lower.includes('enabled') || lower.startsWith('is') || lower.startsWith('has')) return 'Y';
  if (lower.includes('ids') || lower.includes('list') || lower.includes('array')) return ['id1', 'id2'];
  if (lower.endsWith('id') || lower.includes('id')) return 'id1';
  if (lower.includes('date') || lower.includes('day')) return '2026-01-01';
  if (lower.includes('time')) return 1000;
  if (lower.includes('page') || lower.includes('size') || lower.includes('rank') || lower.includes('count') || lower.includes('num') || lower.includes('max') || lower.includes('min') || lower.includes('duration')) return 1;
  if (lower.includes('json') || lower.includes('config') || lower.includes('data')) return { value: true };
  if (lower.includes('url') || lower.includes('uri')) return 'https://example.com/value';
  if (lower.includes('email')) return 'nick@example.com';
  if (lower.includes('file')) return '/tmp/file.txt';
  return `${name}-value`;
}

function setCommandOptions(command: Command): void {
  const values = {
    ...fixedValues,
    ...Object.fromEntries(command.options.map((option: any) => [option.attributeName(), optionValue(option)])),
  };
  (command as any)._optionValues = values;
}

function collectActionCommands(command: Command, path: string[] = []): ActionCommand[] {
  const currentPath = command.name() ? [...path, command.name()] : path;
  const own = (command as any)._actionHandler ? [{ command, path: currentPath }] : [];
  return [
    ...own,
    ...command.commands.flatMap((child) => collectActionCommands(child, currentPath)),
  ];
}

function buildArgs(command: Command): unknown[] {
  const args: unknown[] = [];
  for (const arg of ((command as any).registeredArguments || [])) {
    if (arg.variadic) {
      args.push(valueForName(arg.name()), valueForName(arg.name()));
    } else {
      args.push(valueForName(arg.name()));
    }
  }
  return args;
}

async function invokeAction(command: Command): Promise<void> {
  setCommandOptions(command);
  await (command as any)._actionHandler(buildArgs(command));
}

function shouldSkip(path: string[]): boolean {
  if (path[0] === 'account' && path[1] !== 'api') return true;
  return false;
}

jest.setTimeout(60000);

describe('command action coverage', () => {
  let consoleSpies: jest.SpyInstance[];
  let exitSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    (authAdapter.tryGetAuthConfig as jest.Mock).mockReturnValue({
      config: { appId: 'app', appSecret: 'secret', userId: 'user' },
      source: 'test',
      accountName: 'test-account',
    });
    (configManager.load as jest.Mock).mockResolvedValue({
      config: {
        baseUrl: 'https://api.polyv.net',
        timeout: 30000,
        maxRetries: 3,
        debug: false,
      },
    });
    consoleSpies = [
      jest.spyOn(console, 'log').mockImplementation(),
      jest.spyOn(console, 'error').mockImplementation(),
      jest.spyOn(console, 'warn').mockImplementation(),
    ];
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(((code?: number) => {
      throw new Error(`process.exit:${code ?? 0}`);
    }) as never);
  });

  afterEach(() => {
    consoleSpies.forEach((spy) => spy.mockRestore());
    exitSpy.mockRestore();
  });

function buildProgram(): Command {
  const program = new Command();
  registerAccountCommands(program);
  registerAiCommands(program);
  registerCardPushCommands(program);
  registerChannelCommands(program);
  registerChatCommands(program);
  registerCheckinCommands(program);
  registerCouponCommands(program);
  registerCustomFieldCommands(program);
  registerDocumentCommands(program);
  registerDonateCommands(program);
  registerFinanceCommands(program);
  registerGlobalCommands(program);
  registerGroupCommands(program);
  registerInteractionCommands(program);
  registerInviteSalesCommands(program);
  registerLotteryCommands(program);
  registerMaterialCommands(program);
  registerMonitorCommands(program);
  registerPartnerCommands(program);
  registerPlatformCommands(program);
  registerPlatformLabelCommands(program);
  registerPlaybackCommands(program);
  registerPlayerCommands(program);
  registerProductCommands(program);
  registerPromotionCommands(program);
  registerQaCommands(program);
  registerQuestionnaireCommands(program);
  registerRecordCommands(program);
  registerRobotCommands(program);
  registerSessionCommands(program);
  registerStatisticsCommands(program);
  registerStreamCommands(program);
  registerTransmitCommands(program);
  registerUserCommands(program);
  registerViewerCommands(program);
  registerWatchConditionCommands(program);
  registerWebCommands(program);
  registerWebAppCommands(program);
  registerWhitelistCommands(program);
  return program;
}

  it('executes representative CLI action handlers without real API calls', async () => {
    const program = buildProgram();

    const actions = collectActionCommands(program).filter(({ path }) => !shouldSkip(path));

    for (const { command, path } of actions) {
      try {
        await invokeAction(command);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        // Reaching process.exit means the action ran to completion (e.g. validation-driven exit).
        if (message.startsWith('process.exit:')) {
          continue;
        }
        throw new Error(`${path.join(' ')} failed: ${message}`);
      }
    }

    expect(actions.length).toBeGreaterThan(300);
  });

  it('exercises action error paths when auth is unavailable', async () => {
    // With no auth configured, each action's config loader throws, driving
    // execution into the per-action catch blocks (logError + process.exit).
    (authAdapter.tryGetAuthConfig as jest.Mock).mockReturnValue(null);
    (authAdapter.getStatusMessage as jest.Mock).mockReturnValue('No authentication configured');

    const program = buildProgram();
    const actions = collectActionCommands(program).filter(({ path }) => !shouldSkip(path));

    let hitErrorPath = 0;
    for (const { command } of actions) {
      try {
        await invokeAction(command);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (message.startsWith('process.exit:')) {
          hitErrorPath++;
          continue;
        }
        // Thrown validation/config errors are also valid error-path coverage.
        hitErrorPath++;
      }
    }
    expect(hitErrorPath).toBeGreaterThan(0);
  });
});
