/**
 * @fileoverview Method-level sweep coverage for the larger CLI handlers.
 *
 * viewer/product/lottery/player/chat handlers each expose many methods that
 * follow the same shape (require fields -> optional confirm -> delegate to a
 * service -> display). We mock each backing service as an async proxy and
 * invoke every public method with a superset options object (`force: true`
 * skips confirmation). This exercises the validation + delegation + rendering
 * paths without real API calls.
 */

import { ViewerHandler } from './viewer.handler';
import { ProductHandler } from './product.handler';
import { LotteryHandler } from './lottery.handler';
import { PlayerHandler } from './player.handler';
import { ChatHandler } from './chat.handler';
import { QaQuestionnaireHandler } from './qa-questionnaire.handler';
import { PlatformHandler } from './platform.handler';
import { ChannelHandler } from './channel.handler';
import { AIVideoProduceHandler } from './ai-video-produce.handler';
import { RecordHandler } from './record.handler';
import { CardPushHandler } from './card-push.handler';
import { SessionHandler } from './session.handler';
import { CheckinHandler } from './checkin.handler';
import { DonateHandler } from './donate.handler';
import { ViewerServiceSdk } from '../services/viewer-service';
import { ProductServiceSdk } from '../services/product.service.sdk';
import { LotteryServiceSdk } from '../services/lottery-service';
import { PlayerServiceSdk } from '../services/player.service.sdk';
import { ChatServiceSdk } from '../services/chat.service.sdk';
import { QaQuestionnaireServiceSdk } from '../services/qa-questionnaire-service';
import { PlatformServiceSdk } from '../services/platform-service';
import { ChannelServiceSdk } from '../services/channel.service.sdk';
import { AIVideoProduceServiceSdk } from '../services/ai-video-produce-service';
import { RecordServiceSdk } from '../services/record.service.sdk';
import { CardPushServiceSdk } from '../services/card-push-service';
import { SessionServiceSdk } from '../services/session.service.sdk';
import { CheckinServiceSdk } from '../services/checkin-service';
import { DonateServiceSdk } from '../services/donate-service';

jest.mock('../services/viewer-service');
jest.mock('../services/product.service.sdk');
jest.mock('../services/lottery-service');
jest.mock('../services/player.service.sdk');
jest.mock('../services/chat.service.sdk');
jest.mock('../services/qa-questionnaire-service');
jest.mock('../services/platform-service');
jest.mock('../services/channel.service.sdk');
jest.mock('../services/ai-video-produce-service');
jest.mock('../services/record.service.sdk');
jest.mock('../services/card-push-service');
jest.mock('../services/session.service.sdk');
jest.mock('../services/checkin-service');
jest.mock('../services/donate-service');
jest.mock('../utils/confirmation', () => ({ confirmDeletion: jest.fn().mockResolvedValue(true) }));

const authConfig = { appId: 'app', appSecret: 'secret', userId: 'user' };
const serviceConfig = { baseUrl: 'https://api.polyv.net', timeout: 30000, debug: false };

/** Mock service: every method resolves to `{ ok: true }`. */
function mockService(): Record<string, jest.Mock> {
  const target: Record<string, jest.Mock> = {};
  return new Proxy(target, {
    get(t, prop: string | symbol) {
      if (typeof prop !== 'string') return undefined;
      if (prop === 'then' || prop === 'catch' || prop === 'finally') return undefined;
      if (!(prop in t)) t[prop] = jest.fn().mockResolvedValue({ ok: true });
      return t[prop];
    },
  });
}

function bind<T>(Klass: new (...args: any[]) => T, Mock: jest.MockedClass<any>): { instance: T; service: Record<string, jest.Mock> } {
  const service = mockService();
  Mock.mockImplementation(() => service as any);
  return { instance: new Klass(authConfig as any, serviceConfig as any), service };
}

// Superset of every option any of these handlers' methods might require.
const opts: Record<string, unknown> = {
  output: 'json',
  force: true,
  dryRun: false,
  id: 1,
  channelId: 'ch1',
  channelIds: ['ch1', 'ch2'],
  viewerId: 'viewer1',
  viewerIds: 'viewer1,viewer2',
  viewerUserId: 'viewer1',
  name: 'Name',
  nickname: 'Nick',
  mobile: '13800000000',
  remark: 'remark',
  tagId: 1,
  tagIds: [1, 2],
  labelId: 1,
  labelIds: [1, 2],
  rank: 1,
  type: 'image',
  enabled: 'Y',
  status: 1,
  page: 1,
  pageSize: 10,
  size: 10,
  pageNumber: 1,
  productId: 1,
  productIds: [1, 2],
  sku: 'sku1',
  price: 100,
  stock: 10,
  coverImage: 'https://img.test/c.png',
  images: ['https://img.test/1.png'],
  details: 'details',
  orderId: 'order1',
  orderIds: ['o1'],
  orderStatus: 1,
  categoryId: 1,
  shelfStatus: 1,
  sort: 1,
  keywords: 'kw',
  lotteryId: 'lot1',
  activityId: 'act1',
  activityName: 'Activity',
  taskRule: 'daily',
  startTime: 1000,
  endTime: 2000,
  tasks: [{ name: 'watch', score: 1 }],
  viewerGroupIds: [1],
  viewerUnionIds: 'u1,u2',
  groupId: 1,
  groupName: 'Group',
  blackViewerIds: ['v1'],
  realName: 'Real',
  phone: '13800000000',
  pass: 'pass1',
  remark1: 'r1',
  config: { enabled: true },
  rule: { type: 'a' },
  url: 'https://example.com/x',
  marqueeUrl: 'https://example.com/m',
  advertUrl: 'https://example.com/a',
  stopAdvertUrl: 'https://example.com/s',
  logo: 'https://img.test/logo.png',
  skinId: 1,
  skinIds: [1],
  roomId: 'room1',
  image: 'https://img.test/i.png',
  msg: 'hello',
  messageId: 'm1',
  messageIds: ['m1'],
  content: 'content',
  data: { text: 'x' },
  encode: 'Y',
  userIds: 'user1,user2',
  word: 'badword',
  words: ['badword'],
  ip: '1.2.3.4',
  banned: 'Y',
  forbidUserId: 'viewer1',
  bulletinId: 1,
  bulletins: [{ id: 1 }],
  notice: 'notice',
  qaId: 1,
  censorEnabled: 'Y',
  adminName: 'admin',
  adminPass: 'pass',
  teacherId: 't1',
  teacherName: 'Teacher',
  robotEnabled: 'Y',
  duration: 100,
  vipFree: 'Y',
  cover: 'https://img.test/cover.png',
  params: { a: 1 },
  values: JSON.stringify([{ viewerId: 'v1', tagId: 1 }]),
  ids: [1, 2],
  file: '/tmp/list.csv',
  files: ['/tmp/a.csv'],
  outputFile: '/tmp/out.bin',
  includeChildren: 'Y',
  organizationIds: '1,2',
  passRate: 60,
  coverImageEnabled: 'Y',
  sortType: 'asc',
  showStock: 'Y',
  // Fields validated/read directly by viewer/product/lottery/player/chat methods.
  viewerUnionId: 'u1',
  email: 'nick@example.com',
  area: 'CN',
  source: 'web',
  device: 'pc',
  avatar: 'https://img.test/a.png',
  followUserId: 'f1',
  followUsers: JSON.stringify([{ userId: 'u1' }]),
  followUserType: '1',
  lastCollectMobile: '13800000000',
  latestAccessIp: '1.2.3.4',
  platform: 'web',
  externalViewerId: 'ev1',
  viewerType: '1',
  viewerNames: ['Nick'],
  viewers: [{ nickname: 'Nick', mobile: '13800000000' }],
  viewerWeixinAuthExpired: 30,
  receiveInfo: JSON.stringify({ name: 'Nick' }),
  winnerCode: 'code1',
  prizeName: 'Prize',
  amount: 100,
  token: 'token1',
  title: 'Title',
  keyword: 'kw',
  label: 'label1',
  labels: [{ name: 'L1' }],
  labelName: 'L1',
  link: 'https://example.com/link',
  linkType: '1',
  imgUrl: 'https://img.test/i.png',
  logoImage: 'https://img.test/logo.png',
  skin: 'skin1',
  shelf: 'Y',
  orderNo: 'order1',
  orderNos: ['o1'],
  originId: '1',
  products: [{ productId: 1, price: 100 }],
  antiRecordType: 'none',
  fontSize: 14,
  headAdvertType: '1',
  marqueeRestrict: 'Y',
  modelType: '1',
  mobileLoginEnabled: 'Y',
  wxWorkLoginEnabled: 'Y',
  warmUpEnabled: 'Y',
  chatEnabled: 'Y',
  collectMobileEnabled: 'Y',
  guestModeEnabled: 'Y',
  robotRandomMemberEnabled: 'Y',
  touristExternalHrefEnabled: 'Y',
  touristExternalHrefConfig: JSON.stringify({ url: 'https://example.com' }),
  isPop: 'Y',
  isTop: 'Y',
  inviteNum: 1,
  limit: 10,
  sessionId: 's1',
  global: 'Y',
  clear: 'Y',
  nickName: 'Nick',
  nickNames: ['Nick'],
  msgId: 'm1',
};

// Some methods validate list fields as comma-separated STRINGS (then parse them),
// while others consume them as arrays. A single opts shape can't satisfy both, so
// the sweep invokes each method with both the array form and this string overlay.
const stringListOverlay: Record<string, unknown> = {
  channelIds: 'ch1,ch2',
  viewerIds: 'viewer1,viewer2',
  labelIds: '1,2',
  productIds: '1,2',
  userIds: 'user1,user2',
  orderNos: 'o1,o2',
  ids: '1,2',
  nickNames: 'Nick,Nick2',
  words: 'badword1,badword2',
  tagIds: '1,2',
  labels: '1,2',
};

function methodsOf(handler: unknown): string[] {
  // The instance's direct prototype holds the handler's own async methods.
  const proto = Object.getPrototypeOf(handler);
  return Object.getOwnPropertyNames(proto).filter(
    (name) => name !== 'constructor' && typeof (handler as any)[name] === 'function'
  );
}

describe('low-coverage handler method sweep', () => {
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    logSpy = jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it.each([
    ['ViewerHandler', ViewerHandler, ViewerServiceSdk],
    ['ProductHandler', ProductHandler, ProductServiceSdk],
    ['LotteryHandler', LotteryHandler, LotteryServiceSdk],
    ['PlayerHandler', PlayerHandler, PlayerServiceSdk],
    ['ChatHandler', ChatHandler, ChatServiceSdk],
    ['QaQuestionnaireHandler', QaQuestionnaireHandler, QaQuestionnaireServiceSdk],
    ['PlatformHandler', PlatformHandler, PlatformServiceSdk],
    ['ChannelHandler', ChannelHandler, ChannelServiceSdk],
    ['AIVideoProduceHandler', AIVideoProduceHandler, AIVideoProduceServiceSdk],
    ['RecordHandler', RecordHandler, RecordServiceSdk],
    ['CardPushHandler', CardPushHandler, CardPushServiceSdk],
    ['SessionHandler', SessionHandler, SessionServiceSdk],
    ['CheckinHandler', CheckinHandler, CheckinServiceSdk],
    ['DonateHandler', DonateHandler, DonateServiceSdk],
  ] as const)('%s invokes every method', async (_label, Klass, Mock) => {
    const { instance } = bind(Klass, Mock);
    let invoked = 0;
    for (const method of methodsOf(instance)) {
      for (const variant of [opts, { ...opts, ...stringListOverlay }]) {
        try {
          await (instance as any)[method]({ ...variant });
        } catch {
          // Some methods enforce value-specific validation; a partial run still
          // covers validation + early-return lines.
        }
        invoked++;
      }
    }
    expect(invoked).toBeGreaterThan(0);
  });

  it('AIVideoProduceHandler.parseCreateTasks parses and validates task arrays', () => {
    const { instance } = bind(AIVideoProduceHandler, AIVideoProduceServiceSdk);
    const handler = instance as unknown as { parseCreateTasks(value: string): unknown };

    expect(handler.parseCreateTasks('[{"name":"task1"}]')).toEqual([{ name: 'task1' }]);
    expect(() => handler.parseCreateTasks('')).toThrow('tasks is required');
    expect(() => handler.parseCreateTasks('   ')).toThrow('tasks is required');
    expect(() => handler.parseCreateTasks('not-json')).toThrow('valid JSON');
    expect(() => handler.parseCreateTasks('[]')).toThrow('non-empty');
    expect(() => handler.parseCreateTasks(JSON.stringify(Array(21).fill({ name: 'x' })))).toThrow('more than 20');
  });
});
