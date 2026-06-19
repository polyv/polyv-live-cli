# PolyV Live CLI API Inventory

生成时间：2026-06-19T16:30:45.610Z

## 来源与规则

- API 总表来自 `docs/api-reference/api-inventory.json`，即去重后的最新服务端 OpenAPI 清单。
- CLI 覆盖状态来自 `packages/cli/src/**/*.ts` 的真实源码扫描，测试文件不计入。
- CLI 通过 SDK service 方法调用、或直接通过 `httpClient` 调用到同一个 Method + Path，均计为 CLI 已使用该最新 API。
- 直接 `httpClient` 调用会在清单中标记为 `http`，方便后续迁移到 SDK service 方法。
- CLI 调到旧路径、非最新清单路径或无法解析的 SDK 方法，会进入“旧版/额外 CLI 调用”列表，不计入最新 API 覆盖率。

## 统计概览

| 指标 | 数值 |
| --- | ---: |
| 最新 API 数 | 578 |
| CLI 已使用最新 API 数 | 97 |
| CLI 未使用最新 API 数 | 481 |
| CLI 最新 API 覆盖率 | 16.8% |
| CLI 调用引用数 | 116 |
| 其中 SDK service 调用 | 101 |
| 其中直接 httpClient 调用 | 14 |
| 未解析 SDK 调用 | 1 |
| 旧版/额外 CLI endpoint 调用 | 11 |
| CLI 命令路径数 | 157 |
| CLI 一级命令数 | 28 |

## 模块覆盖率

| 模块 | 名称 | 最新 API | CLI 已用 | CLI 未用 | 覆盖率 | SDK 调用覆盖 | 直接 HTTP 覆盖 |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `channel` | 频道 | 283 | 48 | 235 | 17% | 37 | 11 |
| `user` | 用户与观众 | 73 | 10 | 63 | 13.7% | 10 | 0 |
| `web` | 观看页与观看条件 | 40 | 6 | 34 | 15% | 6 | 0 |
| `chat` | 聊天 | 45 | 14 | 31 | 31.1% | 14 | 0 |
| `live_interaction` | 直播互动 | 30 | 10 | 20 | 33.3% | 10 | 0 |
| `account` | 账号与财务 | 22 | 3 | 19 | 13.6% | 3 | 0 |
| `group` | 组织与套餐 | 11 | 0 | 11 | 0% | 0 | 0 |
| `platform` | 开放平台 | 14 | 3 | 11 | 21.4% | 3 | 0 |
| `ai` | AI 与数字人 | 13 | 3 | 10 | 23.1% | 0 | 3 |
| `uncategorized` | 未分类 | 10 | 0 | 10 | 0% | 0 | 0 |
| `finance` | 财务与审核 | 7 | 0 | 7 | 0% | 0 | 0 |
| `material` | 素材库 | 7 | 0 | 7 | 0% | 0 | 0 |
| `player` | 播放器 | 7 | 0 | 7 | 0% | 0 | 0 |
| `webapp` | WebApp | 6 | 0 | 6 | 0% | 0 | 0 |
| `global` | 全局设置 | 4 | 0 | 4 | 0% | 0 | 0 |
| `robot` | 数字人与机器人 | 3 | 0 | 3 | 0% | 0 | 0 |
| `root` | 根目录 | 2 | 0 | 2 | 0% | 0 | 0 |
| `statistics` | 数据统计 | 1 | 0 | 1 | 0% | 0 | 0 |

## 补齐建议

- 缺口最大的模块：`channel` 235/283、`user` 63/73、`web` 34/40、`chat` 31/45、`live_interaction` 20/30、`account` 19/22、`group` 11/11、`platform` 11/14、`ai` 10/13、`uncategorized` 10/10。
- 仍有直接 HTTP 调用覆盖的模块：`channel` 11 个、`ai` 3 个；新增命令时建议优先复用 SDK service，并逐步迁移这些 CLI 直连调用。
- 频道高级能力：`channel` 子命令扩展。缺口：`channel` 235/283。API 数量最大，当前 CLI 只覆盖频道 CRUD、开停播、少量回放/录制/文档/营销入口。 建议入口：`channel copy`、`channel batch-create`、`channel auth-token`；`channel role *`、`channel subtitle *`、`channel template update`；`channel distribute *`、`channel task-reward *`、`channel invite *`。
- 账号、组织与资源管理：新增 `user`、`group`，扩展 `platform`。缺口：`user` 63/73、`account` 19/22、`group` 11/11。这些接口更偏运营后台和批量管理，适合给内部自动化脚本使用。 建议入口：`account category *`、`account callback *`、`account duration`；`user product *`、`user viewer-label *`；`group quota *`、`group allocation-log list`。
- 观看页配置：新增 `web` 或扩展 `player`/`watch-condition`。缺口：`web` 34/40。观看页菜单、暖场、点赞、图文、授权、登记表等配置适合 CLI 自动化，但当前只覆盖观看条件和白名单的一部分。 建议入口：`web splash get/set`、`web menu add/update/delete`；`web share get/update`、`web likes get/update`；`web record-field get`、`web enroll list/export`。
- 聊天治理与机器人：扩展 `chat`，新增 `robot`。缺口：`chat` 31/45、`robot` 3/3。当前已有消息、禁言、踢人，但敏感词、公告、审核、角色、机器人配置仍大量缺失。 建议入口：`chat badword *`、`chat notice *`、`chat audit *`；`chat role teacher/admin get/update`；`robot setting get/update`、`robot stats`。
- 后台运维与审核工具：新增 `finance`、`material`、`webapp`、`global`。缺口：`finance` 7/7、`material` 7/7、`webapp` 6/6、`global` 4/4。覆盖量不大，但对审核、素材库、WebApp 权限和全局设置的自动化价值高。 建议入口：`finance audio-moderation *`、`finance video-moderation *`；`material list/delete`、`material bind-channel`；`webapp role *`、`global setting *`。
- 互动活动补齐：扩展 `checkin`、`qa`、`questionnaire`、`lottery`，新增活动子命令。缺口：`live_interaction` 20/30。CLI 已有基础签到/问答/问卷/抽奖，但红包、福袋、邀请、任务奖励、观众分组等活动运营能力仍缺。 建议入口：`lottery group *`、`lottery blacklist *`；`interaction lucky-bag winners`、`interaction red-pack stats`；`interaction task-reward *`。

## CLI 命令面

| 命令路径 | 源码 |
| --- | --- |
| `account` | `packages/cli/src/commands/account.commands.ts:487` |
| `account add` | `packages/cli/src/commands/account.commands.ts:492` |
| `account current` | `packages/cli/src/commands/account.commands.ts:517` |
| `account list` | `packages/cli/src/commands/account.commands.ts:510` |
| `account migrate` | `packages/cli/src/commands/account.commands.ts:523` |
| `account remove` | `packages/cli/src/commands/account.commands.ts:503` |
| `account set-default` | `packages/cli/src/commands/account.commands.ts:532` |
| `account unset-default` | `packages/cli/src/commands/account.commands.ts:538` |
| `ai` | `packages/cli/src/commands/ai.commands.ts:86` |
| `ai digital-human` | `packages/cli/src/commands/ai.commands.ts:91` |
| `ai digital-human list` | `packages/cli/src/commands/ai.commands.ts:96` |
| `ai digital-human list-org` | `packages/cli/src/commands/ai.commands.ts:118` |
| `ai digital-human set-org` | `packages/cli/src/commands/ai.commands.ts:138` |
| `card-push` | `packages/cli/src/commands/card-push.commands.ts:132` |
| `card-push cancel` | `packages/cli/src/commands/card-push.commands.ts:273` |
| `card-push create` | `packages/cli/src/commands/card-push.commands.ts:157` |
| `card-push delete` | `packages/cli/src/commands/card-push.commands.ts:295` |
| `card-push list` | `packages/cli/src/commands/card-push.commands.ts:137` |
| `card-push push` | `packages/cli/src/commands/card-push.commands.ts:251` |
| `card-push update` | `packages/cli/src/commands/card-push.commands.ts:203` |
| `channel` | `packages/cli/src/commands/channel.commands.ts:102` |
| `channel batch-delete` | `packages/cli/src/commands/channel.commands.ts:492` |
| `channel create` | `packages/cli/src/commands/channel.commands.ts:106` |
| `channel delete` | `packages/cli/src/commands/channel.commands.ts:426` |
| `channel get` | `packages/cli/src/commands/channel.commands.ts:276` |
| `channel list` | `packages/cli/src/commands/channel.commands.ts:197` |
| `channel update` | `packages/cli/src/commands/channel.commands.ts:340` |
| `chat` | `packages/cli/src/commands/chat.commands.ts:45` |
| `chat ban` | `packages/cli/src/commands/chat.commands.ts:213` |
| `chat banned` | `packages/cli/src/commands/chat.commands.ts:339` |
| `chat delete` | `packages/cli/src/commands/chat.commands.ts:166` |
| `chat kick` | `packages/cli/src/commands/chat.commands.ts:273` |
| `chat kicked` | `packages/cli/src/commands/chat.commands.ts:369` |
| `chat list` | `packages/cli/src/commands/chat.commands.ts:105` |
| `chat send` | `packages/cli/src/commands/chat.commands.ts:51` |
| `chat unban` | `packages/cli/src/commands/chat.commands.ts:243` |
| `chat unkick` | `packages/cli/src/commands/chat.commands.ts:306` |
| `chat banned list` | `packages/cli/src/commands/chat.commands.ts:342` |
| `chat kicked list` | `packages/cli/src/commands/chat.commands.ts:372` |
| `checkin` | `packages/cli/src/commands/checkin.commands.ts:32` |
| `checkin list` | `packages/cli/src/commands/checkin.commands.ts:93` |
| `checkin result` | `packages/cli/src/commands/checkin.commands.ts:148` |
| `checkin sessions` | `packages/cli/src/commands/checkin.commands.ts:188` |
| `checkin start` | `packages/cli/src/commands/checkin.commands.ts:38` |
| `coupon` | `packages/cli/src/commands/coupon.commands.ts:167` |
| `coupon add` | `packages/cli/src/commands/coupon.commands.ts:173` |
| `coupon delete` | `packages/cli/src/commands/coupon.commands.ts:316` |
| `coupon list` | `packages/cli/src/commands/coupon.commands.ts:258` |
| `document` | `packages/cli/src/commands/document.commands.ts:142` |
| `document delete` | `packages/cli/src/commands/document.commands.ts:319` |
| `document list` | `packages/cli/src/commands/document.commands.ts:146` |
| `document status` | `packages/cli/src/commands/document.commands.ts:401` |
| `document upload` | `packages/cli/src/commands/document.commands.ts:230` |
| `donate` | `packages/cli/src/commands/donate.commands.ts:33` |
| `donate config` | `packages/cli/src/commands/donate.commands.ts:39` |
| `donate list` | `packages/cli/src/commands/donate.commands.ts:132` |
| `donate config get` | `packages/cli/src/commands/donate.commands.ts:45` |
| `donate config update` | `packages/cli/src/commands/donate.commands.ts:83` |
| `lottery` | `packages/cli/src/commands/lottery.commands.ts:33` |
| `lottery create` | `packages/cli/src/commands/lottery.commands.ts:39` |
| `lottery delete` | `packages/cli/src/commands/lottery.commands.ts:225` |
| `lottery get` | `packages/cli/src/commands/lottery.commands.ts:139` |
| `lottery list` | `packages/cli/src/commands/lottery.commands.ts:94` |
| `lottery records` | `packages/cli/src/commands/lottery.commands.ts:306` |
| `lottery update` | `packages/cli/src/commands/lottery.commands.ts:179` |
| `lottery winners` | `packages/cli/src/commands/lottery.commands.ts:262` |
| `monitor` | `packages/cli/src/commands/monitor.commands.ts:15` |
| `monitor config` | `packages/cli/src/commands/monitor.commands.ts:40` |
| `monitor export` | `packages/cli/src/commands/monitor.commands.ts:76` |
| `monitor import` | `packages/cli/src/commands/monitor.commands.ts:84` |
| `monitor layouts` | `packages/cli/src/commands/monitor.commands.ts:49` |
| `monitor status` | `packages/cli/src/commands/monitor.commands.ts:31` |
| `monitor test` | `packages/cli/src/commands/monitor.commands.ts:67` |
| `monitor themes` | `packages/cli/src/commands/monitor.commands.ts:58` |
| `platform` | `packages/cli/src/commands/platform.commands.ts:131` |
| `platform callback` | `packages/cli/src/commands/platform.commands.ts:280` |
| `platform get` | `packages/cli/src/commands/platform.commands.ts:137` |
| `platform setting` | `packages/cli/src/commands/platform.commands.ts:390` |
| `platform switch` | `packages/cli/src/commands/platform.commands.ts:177` |
| `platform callback get` | `packages/cli/src/commands/platform.commands.ts:286` |
| `platform callback update` | `packages/cli/src/commands/platform.commands.ts:326` |
| `platform setting get` | `packages/cli/src/commands/platform.commands.ts:396` |
| `platform setting update` | `packages/cli/src/commands/platform.commands.ts:436` |
| `platform switch get` | `packages/cli/src/commands/platform.commands.ts:183` |
| `platform switch update` | `packages/cli/src/commands/platform.commands.ts:223` |
| `playback` | `packages/cli/src/commands/playback.commands.ts:122` |
| `playback delete` | `packages/cli/src/commands/playback.commands.ts:289` |
| `playback get` | `packages/cli/src/commands/playback.commands.ts:211` |
| `playback list` | `packages/cli/src/commands/playback.commands.ts:126` |
| `playback merge` | `packages/cli/src/commands/playback.commands.ts:375` |
| `player` | `packages/cli/src/commands/player.commands.ts:155` |
| `player config` | `packages/cli/src/commands/player.commands.ts:159` |
| `player config get` | `packages/cli/src/commands/player.commands.ts:163` |
| `player config update` | `packages/cli/src/commands/player.commands.ts:227` |
| `product` | `packages/cli/src/commands/product.commands.ts:199` |
| `product add` | `packages/cli/src/commands/product.commands.ts:296` |
| `product delete` | `packages/cli/src/commands/product.commands.ts:486` |
| `product list` | `packages/cli/src/commands/product.commands.ts:203` |
| `product update` | `packages/cli/src/commands/product.commands.ts:401` |
| `promotion` | `packages/cli/src/commands/promotion.commands.ts:89` |
| `promotion create` | `packages/cli/src/commands/promotion.commands.ts:114` |
| `promotion list` | `packages/cli/src/commands/promotion.commands.ts:94` |
| `qa` | `packages/cli/src/commands/qa.commands.ts:32` |
| `qa list` | `packages/cli/src/commands/qa.commands.ts:83` |
| `qa send` | `packages/cli/src/commands/qa.commands.ts:38` |
| `qa stop` | `packages/cli/src/commands/qa.commands.ts:121` |
| `questionnaire` | `packages/cli/src/commands/questionnaire.commands.ts:32` |
| `questionnaire create` | `packages/cli/src/commands/questionnaire.commands.ts:38` |
| `questionnaire detail` | `packages/cli/src/commands/questionnaire.commands.ts:154` |
| `questionnaire list` | `packages/cli/src/commands/questionnaire.commands.ts:101` |
| `record` | `packages/cli/src/commands/record.commands.ts:168` |
| `record convert` | `packages/cli/src/commands/record.commands.ts:308` |
| `record set-default` | `packages/cli/src/commands/record.commands.ts:388` |
| `record setting` | `packages/cli/src/commands/record.commands.ts:172` |
| `record setting get` | `packages/cli/src/commands/record.commands.ts:176` |
| `record setting set` | `packages/cli/src/commands/record.commands.ts:227` |
| `session` | `packages/cli/src/commands/session.commands.ts:109` |
| `session get` | `packages/cli/src/commands/session.commands.ts:206` |
| `session list` | `packages/cli/src/commands/session.commands.ts:113` |
| `setup` | `packages/cli/src/commands/setup.commands.ts:90` |
| `statistics` | `packages/cli/src/commands/statistics.commands.ts:166` |
| `statistics audience` | `packages/cli/src/commands/statistics.commands.ts:396` |
| `statistics concurrency` | `packages/cli/src/commands/statistics.commands.ts:251` |
| `statistics export` | `packages/cli/src/commands/statistics.commands.export.ts:171` |
| `statistics max-concurrent` | `packages/cli/src/commands/statistics.commands.ts:320` |
| `statistics view` | `packages/cli/src/commands/statistics.commands.ts:170` |
| `statistics audience device` | `packages/cli/src/commands/statistics.commands.ts:483` |
| `statistics audience region` | `packages/cli/src/commands/statistics.commands.ts:400` |
| `statistics export session` | `packages/cli/src/commands/statistics.commands.export.ts:273` |
| `statistics export viewlog` | `packages/cli/src/commands/statistics.commands.export.ts:178` |
| `stream` | `packages/cli/src/commands/stream.commands.ts:101` |
| `stream get-key` | `packages/cli/src/commands/stream.commands.ts:105` |
| `stream monitor` | `packages/cli/src/commands/stream.commands.ts:610` |
| `stream push` | `packages/cli/src/commands/stream.commands.ts:440` |
| `stream start` | `packages/cli/src/commands/stream.commands.ts:182` |
| `stream status` | `packages/cli/src/commands/stream.commands.ts:317` |
| `stream stop` | `packages/cli/src/commands/stream.commands.ts:249` |
| `stream verify` | `packages/cli/src/commands/stream.commands.ts:519` |
| `transmit` | `packages/cli/src/commands/transmit.commands.ts:86` |
| `transmit create` | `packages/cli/src/commands/transmit.commands.ts:91` |
| `transmit list` | `packages/cli/src/commands/transmit.commands.ts:113` |
| `use` | `packages/cli/src/commands/use.commands.ts:66` |
| `viewer` | `packages/cli/src/commands/viewer.commands.ts:33` |
| `viewer get` | `packages/cli/src/commands/viewer.commands.ts:39` |
| `viewer list` | `packages/cli/src/commands/viewer.commands.ts:77` |
| `viewer tag` | `packages/cli/src/commands/viewer.commands.ts:142` |
| `viewer tag add` | `packages/cli/src/commands/viewer.commands.ts:192` |
| `viewer tag list` | `packages/cli/src/commands/viewer.commands.ts:148` |
| `viewer tag remove` | `packages/cli/src/commands/viewer.commands.ts:234` |
| `watch-condition` | `packages/cli/src/commands/watch-condition.commands.ts:33` |
| `watch-condition get` | `packages/cli/src/commands/watch-condition.commands.ts:39` |
| `watch-condition set` | `packages/cli/src/commands/watch-condition.commands.ts:80` |
| `whitelist` | `packages/cli/src/commands/whitelist.commands.ts:33` |
| `whitelist add` | `packages/cli/src/commands/whitelist.commands.ts:91` |
| `whitelist list` | `packages/cli/src/commands/whitelist.commands.ts:39` |
| `whitelist remove` | `packages/cli/src/commands/whitelist.commands.ts:179` |
| `whitelist update` | `packages/cli/src/commands/whitelist.commands.ts:134` |

## 旧版/额外 CLI 调用

| 类型 | Method | Path | 引用 | 源码 | 原因 |
| --- | --- | --- | --- | --- | --- |
| sdk-service | POST | `/live/v4/channel/donate/update` | V4ChannelService#updateDonate | `packages/cli/src/services/donate-service.ts:58` | Endpoint is not in the latest de-duplicated API inventory |
| sdk-service | POST | `/live/v4/channel/lottery-activity/lottery-activity-create` | V4ChannelService#lotteryActivityCreate | `packages/cli/src/services/lottery-service.ts:48` | Endpoint is not in the latest de-duplicated API inventory |
| sdk-service | GET | `/live/v4/channel/lottery-activity/lottery-activity-list` | V4ChannelService#lotteryActivityList | `packages/cli/src/services/lottery-service.ts:62` | Endpoint is not in the latest de-duplicated API inventory |
| sdk-service | GET | `/live/v4/channel/lottery-activity/lottery-activity-get` | V4ChannelService#lotteryActivityGet | `packages/cli/src/services/lottery-service.ts:76` | Endpoint is not in the latest de-duplicated API inventory |
| sdk-service | POST | `/live/v4/channel/lottery-activity/lottery-activity-update` | V4ChannelService#lotteryActivityUpdate | `packages/cli/src/services/lottery-service.ts:90` | Endpoint is not in the latest de-duplicated API inventory |
| sdk-service | POST | `/live/v4/channel/lottery-activity/lottery-activity-delete` | V4ChannelService#lotteryActivityDelete | `packages/cli/src/services/lottery-service.ts:104` | Endpoint is not in the latest de-duplicated API inventory |
| sdk-service | POST | `/live/v3/channel/record/merge-async` | ChannelService#recordFileMergeAsync | `packages/cli/src/services/playback.service.sdk.ts:311` | Endpoint is not in the latest de-duplicated API inventory |
| sdk-unresolved | - | `-` | LiveInteractionService#addEditQuestionnaire | `packages/cli/src/services/qa-questionnaire-service.ts:104` | SDK service usage could not be resolved to an HTTP endpoint |
| sdk-service | POST | `/live/v3/channel/record/convert-async` | ChannelService#recordConvertAsync | `packages/cli/src/services/record.service.sdk.ts:165` | Endpoint is not in the latest de-duplicated API inventory |
| sdk-service | POST | `/live/v3/channel/record/set-default` | ChannelService#setRecordDefault | `packages/cli/src/services/record.service.sdk.ts:188` | Endpoint is not in the latest de-duplicated API inventory |
| sdk-service | POST | `/live/v3/channel/config/update` | ChannelService#updateChannelConfig | `packages/cli/src/setup/resource-handlers.ts:235` | Endpoint is not in the latest de-duplicated API inventory |

## 完整 CLI 覆盖清单

### account - 账号与财务

| 功能/用途 | Method | Path | 请求形态 | 业务必填参数 | SDK 实现 | CLI 使用 |
| --- | --- | --- | --- | --- | --- | --- |
| 查询频道的功能开关状态<br><sub>1、查询开关状态，可查询全局开关状态或频道开关状态</sub> | GET | `/live/v3/channel/switch/get` | query | - | AccountService#switchGet (packages/sdk/src/services/account.service.ts) | sdk: AccountService#switchGet (packages/cli/src/services/platform-service.ts:63) |
| 查询频道列表<br><sub>1、根据分类id和频道名称查询频道号列表</sub> | GET | `/live/v3/user/channels` | query | - | AccountService#channels (packages/sdk/src/services/account.service.ts) | no |
| 查询所有频道的回放视频<br><sub>1、查询账号下回放列表和点播列表, 注意：不包括暂存列表</sub> | GET | `/live/v3/user/playback/list` | query | - | AccountService#userPlaybackList (packages/sdk/src/services/account.service.ts) | no |
| 查询所有频道的基础信息<br><sub>1、查询账号下所有的频道基础信息列表</sub> | GET | `/live/v3/channel/basic/list` | query | - | AccountService#userChannelBasicList (packages/sdk/src/services/account.service.ts) | no |
| 查询所有频道的缩略信息<br><sub>1、查询账号下所有的频道缩略信息列表</sub> | GET | `/live/v3/channel/management/list` | query | - | AccountService#getSimpleChannelList (packages/sdk/src/services/account.service.ts) | no |
| 查询所有频道的详细信息<br><sub>1、查询账号下所有频道详细信息列表</sub> | POST | `/live/v3/channel/management/list-detail` | query/form | - | AccountService#channelDetailList (packages/sdk/src/services/account.service.ts) | no |
| 查询账号可用直播分钟数<br><sub>1、查询账号可用直播分钟数</sub> | POST | `/live/v2/user/get-user-durations` | query/form | - | AccountService#getUserDurations (packages/sdk/src/services/account.service.ts) | no |
| 查询账号连麦分钟数<br><sub>1、查询账号连麦分钟数</sub> | GET | `/live/v3/channel/statistics/mic/get-duration` | query | - | AccountService#micDuration (packages/sdk/src/services/account.service.ts) | no |
| 查询账号收入详情<br><sub>1、接口URL中的{userId}为直播账号ID</sub> | POST | `/live/v2/user/{param}/get-income-detail` | query/form | endDate, startDate | AccountService#getIncomeDetail (packages/sdk/src/services/account.service.ts) | no |
| 查询账号信息<br><sub>1、查询用户账号信息接口</sub> | GET | `/live/v3/user/get-info` | query | - | AccountService#getUserInfo (packages/sdk/src/services/account.service.ts) | sdk: AccountService#getUserInfo (packages/cli/src/services/platform-service.ts:47) |
| 查询直播分类<br><sub>1、查询直播分类信息</sub> | POST | `/live/v3/user/category/list` | query/form | - | AccountService#getCategoryList (packages/sdk/src/services/account.service.ts) | no |
| 创建直播分类<br><sub>1、创建直播分类</sub> | POST | `/live/v3/user/category/create` | query/form | categoryName | AccountService#createCategory (packages/sdk/src/services/account.service.ts) | no |
| 分页查询频道可设置接收转播频道列表<br><sub>1、通过一个（发起转播的）频道分页查询能够被它设置接收转播的频道列表</sub> | GET | `/live/v3/channel/basic/receive/list` | query | channelId | AccountService#receiveList (packages/sdk/src/services/account.service.ts) | no |
| 删除直播分类<br><sub>1、删除直播频道分类</sub> | POST | `/live/v3/user/category/delete` | query/form | categoryId | AccountService#deleteCategory (packages/sdk/src/services/account.service.ts) | no |
| 设置账号单点登录token<br><sub>1、设置账号单点登录的token</sub> | POST | `/live/v3/user/set-sso-token` | query/form | token | AccountService#setUserLoginToken (packages/sdk/src/services/account.service.ts) | no |
| 设置直播子账号单点登录token<br><sub>1、设置直播子账号单点登录的token</sub> | POST | `/live/v3/user/set-sso-token` | query/form | childEmail, token | AccountService#setUserLoginToken (packages/sdk/src/services/account.service.ts) | no |
| 修改录制生成回调设置<br><sub>1、设置账号下录制视频通知回调地址的接口</sub> | POST | `/live/v2/user/{param}/set-record-callback` | query/form | - | AccountService#setRecordCallback (packages/sdk/src/services/account.service.ts) | no |
| 修改频道的功能开关状态<br><sub>1、修改功能开关设置，可修改全局开关设置或频道开关设置</sub> | POST | `/live/v3/channel/switch/update` | query/form | enabled, type | AccountService#switchUpdate (packages/sdk/src/services/account.service.ts) | sdk: AccountService#switchUpdate (packages/cli/src/services/platform-service.ts:87) |
| 修改直播分类名称<br><sub>1、修改直播频道分类的名称</sub> | POST | `/live/v3/user/category/update-name` | query/form | categoryId, categoryName | AccountService#updateCategoryName (packages/sdk/src/services/account.service.ts) | no |
| 修改直播分类顺序<br><sub>1、修改直播频道分类的顺序</sub> | POST | `/live/v3/user/category/update-rank` | query/form | afterCategoryId, categoryId | AccountService#updateCategoryRank (packages/sdk/src/services/account.service.ts) | no |
| 修改直播状态改变回调设置<br><sub>1、设置账号下频道直播状态改变通知回调地址的接口</sub> | POST | `/live/v2/user/{param}/set-stream-callback` | query/form | - | AccountService#setStreamCallback (packages/sdk/src/services/account.service.ts) | no |
| 修改转存成功回调设置<br><sub>1、设置账号下转存回放视频成功通知回调地址的接口</sub> | POST | `/live/v2/user/{param}/set-playback-callback` | query/form | - | AccountService#setPlaybackCallback (packages/sdk/src/services/account.service.ts) | no |

### ai - AI 与数字人

| 功能/用途 | Method | Path | 请求形态 | 业务必填参数 | SDK 实现 | CLI 使用 |
| --- | --- | --- | --- | --- | --- | --- |
| 查询可用于视频创作的声音列表<br><sub>1、查询可用于视频创作的声音列表</sub> | GET | `/live/v4/ai/video-produce/tts-voice/list` | query | pageNumber, pageSize | V4AiService#listTtsVoices (packages/sdk/src/services/v4/ai.service.ts) | no |
| 查询视频创作任务<br><sub>1、查询视频创作任务</sub> | GET | `/live/v4/ai/video-produce/get` | query | aiPPTVideoId | V4AiService#getVideoProduce (packages/sdk/src/services/v4/ai.service.ts) | no |
| 查询视频创作任务列表<br><sub>1、分页查询视频创作任务列表</sub> | GET | `/live/v4/ai/video-produce/list` | query | pageNumber, pageSize | V4AiService#listVideoProduces (packages/sdk/src/services/v4/ai.service.ts) | no |
| 查询数字人<br><sub>1、查询数字人列表</sub> | GET | `/live/v4/ai/digital-human/list` | query | pageNumber, pageSize | V4AiService#listDigitalHumans (packages/sdk/src/services/v4/ai.service.ts) | http: httpClient.get (packages/cli/src/services/ai-digital-human-service.ts:53) |
| 查询数字人组织<br><sub>1、查询数字人关联的组织，最多支持100个数字人ID</sub> | GET | `/live/v4/ai/digital-human/list-organization` | query | aiDigitalHumanIds | V4AiService#listOrganizations (packages/sdk/src/services/v4/ai.service.ts) | http: httpClient.get (packages/cli/src/services/ai-digital-human-service.ts:89) |
| 查询用于视频创作的ppt<br><sub>1、根据ppt文件id查询用于视频创作的ppt信息</sub> | GET | `/live/v4/ai/video-produce/ppt/get` | query | fileId | V4AiService#getVideoProducePpt (packages/sdk/src/services/v4/ai.service.ts) | no |
| 查询用于视频创作的ppt列表<br><sub>1、查询用于视频创作的ppt列表</sub> | GET | `/live/v4/ai/video-produce/ppt/list` | query | pageNumber, pageSize | V4AiService#listVideoProducePpts (packages/sdk/src/services/v4/ai.service.ts) | no |
| 创建视频创作任务<br><sub>1、创建视频创作任务, 接口支持批量创建任务, 单次最多支持20个</sub> | POST | `/live/v4/ai/video-produce/create-batch` | json-body | backgroundImage, enableSubtitle, hasDigitalHuman, rate, subtitleInfo, ttsVoiceId, +2 | V4AiService#batchCreateVideoProduces (packages/sdk/src/services/v4/ai.service.ts) | no |
| 创建视频创作任务<br><sub>1、创建视频创作任务, 接口支持批量创建任务, 单次最多支持20个</sub> | POST | `/live/v4/ai/video-produce/create-batch` | json-body | backgroundImage, enableSubtitle, hasDigitalHuman, rate, subtitleInfo, ttsVoiceId, +2 | V4AiService#batchCreateVideoProduces (packages/sdk/src/services/v4/ai.service.ts) | no |
| 关联数字人组织<br><sub>1、将数字人和组织架构关联，单次请求最多100个数字人，对应子账号</sub> | POST | `/live/v4/ai/digital-human/set-organizations` | json-body | aiDigitalHumanId, organizationIds | V4AiService#setOrganizations (packages/sdk/src/services/v4/ai.service.ts) | http: httpClient.post (packages/cli/src/services/ai-digital-human-service.ts:116) |
| 删除视频创作任务<br><sub>1、接口支持https协议</sub> | POST | `/live/v4/ai/video-produce/delete` | json-body | aiPPTVideoId | V4AiService#deleteVideoProduce (packages/sdk/src/services/v4/ai.service.ts) | no |
| 上传用于视频创作的ppt<br><sub>1、上传用于视频创作的ppt, 等待ppt转码解析完成后, 即可将该ppt用于视频创作</sub> | POST | `/live/v4/ai/video-produce/ppt/upload` | query/form | url | V4AiService#uploadVideoProducePpt (packages/sdk/src/services/v4/ai.service.ts) | no |
| 异步上传用于视频创作的ppt<br><sub>1、异步上传制课ppt, 调用接口后，直接返回结果，异步获取ppt并上传</sub> | POST | `/live/v4/ai/video-produce/ppt/async-upload` | query/form | url | V4AiService#asyncUploadVideoProducePpt (packages/sdk/src/services/v4/ai.service.ts) | no |

### channel - 频道

| 功能/用途 | Method | Path | 请求形态 | 业务必填参数 | SDK 实现 | CLI 使用 |
| --- | --- | --- | --- | --- | --- | --- |
| 裁剪录制文件<br><sub>1、裁剪直播录制视频文件，裁剪文件过程为异步处理过程</sub> | POST | `/live/v3/channel/record/clip` | query/form | channelId, fileId | ChannelService#clipRecordFile (packages/sdk/src/services/channel.service.ts) | no |
| 查询抽奖活动<br><sub>1、查询抽奖活动</sub> | GET | `/live/v4/channel/lottery-activity/get` | query | channelId, id | V4ChannelService#getLotteryActivityExact (packages/sdk/src/services/v4/channel.service.ts) | no |
| 查询抽奖活动列表<br><sub>1、查询抽奖活动列表</sub> | GET | `/live/v4/channel/lottery-activity/list` | query | channelId | V4ChannelService#listLotteryActivitiesExact (packages/sdk/src/services/v4/channel.service.ts) | no |
| 查询单个角色信息<br><sub>1、查询频道内某个助教或嘉宾的具体信息</sub> | GET | `/live/v2/channelAccount/{param}/account` | query | account | ChannelService#getAccount (packages/sdk/src/services/channel.service.ts) | no |
| 查询多个频道概览统计数据<br><sub>1、根据提交的频道号，查询频道有关信息的统计数据，数据会根据频道号进行汇总，返回pc端播放时长、pc端播放流量、移动端播放时长、移动端播放流量等。</sub> | POST | `/live/v2/statistics/{param}/channel_summary` | query/form | endDate, startDate | ChannelService#getChannelPlaySummary (packages/sdk/src/services/channel.service.ts) | no |
| 查询多个频道回放设置<br><sub>1、查询多个频道回放设置</sub> | GET | `/live/v4/channel/playback/list` | query | channelIds | V4ChannelService#listPlaybackSettings (packages/sdk/src/services/v4/channel.service.ts) | no |
| 查询多个频道实时并发数据<br><sub>1、获取多个频道实时在线人数</sub> | GET | `/live/v2/statistics/get-realtime-viewers` | query | channelIds | ChannelService#getRealtimeViewers (packages/sdk/src/services/channel.service.ts) | no |
| 查询分发地址信息<br><sub>1、查询分发地址信息</sub> | GET | `/live/v4/channel/distribute/list` | query | channelId | V4ChannelService#distributeList (packages/sdk/src/services/v4/channel.service.ts) | no |
| 查询分组观众列表<br><sub>1、查询分组观众列表</sub> | GET | `/live/v4/channel/lottery-viewer-list/list` | query | channelId, groupId | V4ChannelService#listLotteryGroupViewers (packages/sdk/src/services/v4/channel.service.ts) | no |
| 查询分组列表<br><sub>1、查询分组列表</sub> | GET | `/live/v4/channel/lottery-viewer-group/whitelist/list` | query | channelId | V4ChannelService#listLotteryViewerGroups (packages/sdk/src/services/v4/channel.service.ts) | no |
| 查询福袋中奖者分页列表<br><sub>1、查询指定福袋活动的中奖者分页列表</sub> | GET | `/live/v4/channel/lucky-bag/winner-page` | query | activityId | V4ChannelService#listLuckyBagWinners (packages/sdk/src/services/v4/channel.service.ts) | no |
| 查询观众中奖记录<br><sub>1、查询观众中奖记录</sub> | GET | `/live/v4/channel/lottery/query-winner-viewer` | query | channelId, lotteryId, viewerId | V4ChannelService#queryWinnerViewer (packages/sdk/src/services/v4/channel.service.ts) | no |
| 查询黑名单观众列表<br><sub>1、查询黑名单观众列表</sub> | GET | `/live/v4/channel/lottery-viewer-list/blacklist/list` | query | channelId | V4ChannelService#listLotteryBlacklistViewers (packages/sdk/src/services/v4/channel.service.ts) | no |
| 查询红包派发数据统计<br><sub>1、分页查询频道红包派发数据统计</sub> | GET | `/live/v4/channel/red-pack/statistics/list` | query | channelId | ChannelService#getRedpackStats (packages/sdk/src/services/channel.service.ts) | no |
| 查询后台频道统计信息<br><sub>1、查询后台频道统计信息</sub> | GET | `/live/v4/channel/statistics/channel-statistic` | query | channelId, endDate, startDate | ChannelService#getChannelStatistic (packages/sdk/src/services/channel.service.ts) | no |
| 查询互动监听事件列表<br><sub>由业务服务端调用，查询指定频道下当前仍挂在监听队列中的互动监听任务列表；</sub> | GET | `/live/v5/chat/redirect/channel/interaction_event/list` | query | roomId | V4ChannelService#listInteractionEvents (packages/sdk/src/services/v4/channel.service.ts) | no |
| 查询批量频道状态(旧版)<br><sub>1、批量查询频道直播状态</sub> | POST | `/live/v2/channels/live-status` | query/form | channelIds | ChannelService#getLiveStatusList (packages/sdk/src/services/channel.service.ts) | no |
| 查询频道场次对应自定义场次ID<br><sub>1、查询频道场次对应自定义场次ID</sub> | GET | `/live/v4/channel/session/external-by-session` | query | channelId, sessionId | V4ChannelService#getSessionExternalBySession (packages/sdk/src/services/v4/channel.service.ts) | no |
| 查询频道场次信息<br><sub>1、查询频道直播场次信息</sub> | GET | `/live/v3/channel/session/data/list` | query | channelId | ChannelService#getSessionDataList (packages/sdk/src/services/channel.service.ts) | no |
| 查询频道场次信息<br><sub>1、查询频道直播场次信息</sub> | GET | `/live/v3/channel/session/list` | query | channelId | ChannelService#listChannelSessions (packages/sdk/src/services/channel.service.ts) | no |
| 查询频道抽奖记录<br><sub>1、查询频道发起抽奖记录</sub> | GET | `/live/v4/channel/lottery/list` | query | channelId | V4ChannelService#listChannelLotteryRecords (packages/sdk/src/services/v4/channel.service.ts) | no |
| 查询频道打赏设置(新版后台)<br><sub>1、查询频道打赏设置，包括现金打赏、礼物打赏，礼物打赏又分为现金支付和积分支付</sub> | GET | `/live/v4/channel/donate/get` | query | channelId | V4ChannelService#getDonate (packages/sdk/src/services/v4/channel.service.ts) | sdk: V4ChannelService#getDonate (packages/cli/src/services/donate-service.ts:44) |
| 查询频道单个直播暂存信息<br><sub>1、通过文件ID查询频道内录制视频文件信息</sub> | GET | `/live/v3/channel/record/get` | query | channelId | ChannelService#getRecordFile (packages/sdk/src/services/channel.service.ts) | no |
| 查询频道地域分布数据统计<br><sub>1、查询频道观看地域分布统计信息</sub> | GET | `/live/v4/channel/statistics/geo-summary-mc` | query | channelId, endTime, startTime | StatisticsService#getRegionDistribution (packages/sdk/src/services/statistics.service.ts) | sdk: StatisticsService#getRegionDistribution (packages/cli/src/services/statistics.service.sdk.ts:296) |
| 查询频道的关联音视频文件<br><sub>1、查询频道的关联音视频文件</sub> | GET | `/live/v4/channel/multimedia/resource/list-vids` | query | channelId | ChannelService#getChannelMultimediaResourceList (packages/sdk/src/services/channel.service.ts) | no |
| 查询频道的关联音视频文件详情<br><sub>1、查询频道的关联音视频文件详情</sub> | GET | `/live/v4/channel/multimedia/resource/list` | query | channelId | ChannelService#getChannelMultimediaResourceDetail (packages/sdk/src/services/channel.service.ts) | no |
| 查询频道多场次概览统计数据<br><sub>1、接口用于统计直播间内多场次的直播的观看数据，数据会根据场次号进行汇总，返回观看UV、观看PV等。</sub> | GET | `/live/v3/channel/statistics/get-session-stats` | query | channelId | ChannelService#getSessionStats (packages/sdk/src/services/channel.service.ts) | no |
| 查询频道广告列表<br><sub>1、查询频道广告列表信息，如频道广告设置了应用通用设置，则获取全局广告</sub> | GET | `/live/v3/channel/advert/list` | query | channelId | ChannelService#getChannelAdverts (packages/sdk/src/services/channel.service.ts) | no |
| 查询频道号下所有角色信息<br><sub>1、查询频道内所有助教和嘉宾的具体信息</sub> | GET | `/live/v2/channelAccount/{param}/accounts` | query | - | ChannelService#getAccounts (packages/sdk/src/services/channel.service.ts) | no |
| 查询频道回调设置<br><sub>1、查询频道回调设置接口</sub> | GET | `/live/v3/channel/callback/get-setting` | query | channelId | ChannelService#getCallbackSetting (packages/sdk/src/services/channel.service.ts) | no |
| 查询频道回放开关<br><sub>1、查询频道的回放开关状态</sub> | GET | `/live/v3/channel/playback/get-enabled` | query | channelId | ChannelService#getPlaybackEnabled (packages/sdk/src/services/channel.service.ts) | no |
| 查询频道回放设置<br><sub>1、查询频道回放设置</sub> | GET | `/live/v3/channel/playback/get-setting` | query | channelId | ChannelService#getPlaybackSetting (packages/sdk/src/services/channel.service.ts) | sdk: ChannelService#getPlaybackSetting (packages/cli/src/services/record.service.sdk.ts:44) |
| 查询频道角色观众设置信息<br><sub>1、查询频道角色观众设置信息</sub> | GET | `/live/v4/channel/account/viewer/get` | query | channelId | V4ChannelService#getAccountViewerConfig (packages/sdk/src/services/v4/channel.service.ts) | no |
| 查询频道角色权限设置<br><sub>1、查询频道角色权限设置</sub> | GET | `/live/v4/channel/role-config/get-by-role` | query | channelId, role | V4ChannelService#getByRole (packages/sdk/src/services/v4/channel.service.ts) | no |
| 查询频道卡片推送<br><sub>1、查询频道卡片推送，对应新版后台的 营销-卡片</sub> | GET | `/live/v4/channel/card-push/list` | query | channelId | V4ChannelService#listCardPushes (packages/sdk/src/services/v4/channel.service.ts) | http: httpClient.get (packages/cli/src/services/card-push-service.ts:49) |
| 查询频道历史并发数据<br><sub>1、获取频道在某个日期区间并发人数</sub> | GET | `/live/v3/channel/statistics/concurrence` | query | channelId, endDate, startDate | ChannelService#getConcurrency (packages/sdk/src/services/channel.service.ts) | sdk: StatisticsService#getConcurrencyData (packages/cli/src/services/statistics.service.sdk.ts:141) |
| 查询频道历史最高并发数据<br><sub>1、获取频道一定时间范围之内的历史最高并发人数</sub> | GET | `/live/v3/channel/statistics/get-max-history-concurrent` | query | channelId, endTime, startTime | ChannelService#getMaxHistoryConcurrent (packages/sdk/src/services/channel.service.ts) | sdk: StatisticsService#getMaxConcurrent (packages/cli/src/services/statistics.service.sdk.ts:212) |
| 查询频道连麦使用量<br><sub>1、分页获取频道连麦使用详情，默认查询账号下的所有频道</sub> | GET | `/live/v3/channel/statistics/mic/list` | query | - | ChannelService#getMicDetailList (packages/sdk/src/services/channel.service.ts) | no |
| 查询频道连麦详情数据<br><sub>1、接口用于查询某个频道的一段时间区间内的连麦详情数据，支持分页</sub> | GET | `/live/v3/channel/mic/log/list-detail` | query | channelId, endDate, startDate | ChannelService#getLinkMicDetailList (packages/sdk/src/services/channel.service.ts) | no |
| 查询频道某段时间的直播观看详情数据<br><sub>1、通过频道号获取该频道某段时间的直播观看的统计数据</sub> | GET | `/live/v2/statistics/{param}/summary` | query | endDay, startDay | ChannelService#getSummary (packages/sdk/src/services/channel.service.ts) | no |
| 查询频道商品点击统计<br><sub>1、分页查询直播频道商品点击数据</sub> | GET | `/live/v4/channel/product/click` | query | channelId | ChannelService#getProductClickStats (packages/sdk/src/services/channel.service.ts) | no |
| 查询频道商品库开关状态<br><sub>1、查询频道商品库开关状态</sub> | GET | `/live/v3/channel/product/get-enabled` | query | channelId | ChannelService#getChannelProductEnabled (packages/sdk/src/services/channel.service.ts) | no |
| 查询频道商品列表<br><sub>1、获取频道商品库商品列表</sub> | GET | `/live/v3/channel/product/list` | query | channelId | ChannelService#listChannelProducts (packages/sdk/src/services/channel.service.ts) | sdk: ChannelService#listChannelProducts (packages/cli/src/services/product.service.sdk.ts:89) |
| 查询频道商品列表点击统计<br><sub>1、分页查询直播频道购物袋展开次数</sub> | GET | `/live/v4/channel/product/click/product-list` | query | channelId | ChannelService#getProductListStats (packages/sdk/src/services/channel.service.ts) | no |
| 查询频道商品配置<br><sub>1、查询频道商品配置</sub> | GET | `/live/v4/channel/product/push/rule` | query | channelId | V4ChannelService#getProductPushRule (packages/sdk/src/services/v4/channel.service.ts) | no |
| 查询频道实时并发数据<br><sub>1、在直播中，查询频道实时在线人数</sub> | GET | `/live/v1/statistics/{param}/realtime` | query | userId | ChannelService#getRealtimeViewersV1 (packages/sdk/src/services/channel.service.ts) | no |
| 查询频道微信分享信息(新版)<br><sub>1、查询频道微信分享信息，对应新版后台的 营销-分享设置</sub> | GET | `/live/v4/channel/share/get` | query | channelId | V4ChannelService#getShareExact (packages/sdk/src/services/v4/channel.service.ts) | no |
| 查询频道文档转码状态<br><sub>1、查询频道文档转换状态接口</sub> | GET | `/live/v3/channel/document/status/get` | query | channelId, fileId | ChannelService#getDocConvertStatus (packages/sdk/src/services/channel.service.ts) | sdk: ChannelService#getDocConvertStatus (packages/cli/src/services/document.service.sdk.ts:216) |
| 查询频道信息<br><sub>1、查询频道基本信息，观看页状态与新版后台一致</sub> | GET | `/live/v4/channel/basic/get` | query | channelId | V4ChannelService#getChannel (packages/sdk/src/services/v4/channel.service.ts) | sdk: V4ChannelService#getChannel (packages/cli/src/services/channel.service.sdk.ts:145)<br>sdk: V4ChannelService#getChannel (packages/cli/src/services/stream.service.sdk.ts:218) |
| 查询频道页面装修<br><sub>1、查询频道的页面装修设置</sub> | GET | `/live/v4/channel/decorate/get` | query | channelId | PlayerService#getChannelDecorate (packages/sdk/src/services/player.service.ts) | sdk: PlayerService#getChannelDecorate (packages/cli/src/services/player.service.sdk.ts:50) |
| 查询频道已上传文档列表<br><sub>1、获取频道文档列表</sub> | GET | `/live/v3/channel/document/doc-list` | query | - | ChannelService#getDocList (packages/sdk/src/services/channel.service.ts) | sdk: ChannelService#getDocList (packages/cli/src/services/document.service.sdk.ts:95) |
| 查询频道优惠券开关状态<br><sub>1、查询频道优惠券开关状态</sub> | GET | `/live/v4/channel/coupon/get-enabled` | query | channelId | V4ChannelService#getCouponEnabled (packages/sdk/src/services/v4/channel.service.ts) | no |
| 查询频道优惠券列表<br><sub>1、查询频道优惠券列表</sub> | GET | `/live/v4/channel/coupon/list` | query | channelId | V4ChannelService#listChannelCoupons (packages/sdk/src/services/v4/channel.service.ts) | no |
| 查询频道直播观看详情数据<br><sub>1、获取频道观看日志</sub> | GET | `/live/v1/statistics/{param}/viewlog` | query | currentDay, userId | ChannelService#getViewlogV1 (packages/sdk/src/services/channel.service.ts) | no |
| 查询频道直播截图<br><sub>1、截图功能，查询当前频道正在直播的截图（截图五分钟更新一次）</sub> | POST | `/live/v2/stream/{param}/capture` | query/form | - | ChannelService#getCaptureImage (packages/sdk/src/services/channel.service.ts) | no |
| 查询频道直播数据<br><sub>1、查询频道直播数据</sub> | GET | `/live/v4/channel/statistics/live-data` | query | channelId | V4ChannelService#getLiveData (packages/sdk/src/services/v4/channel.service.ts) | no |
| 查询频道直播推流信息<br><sub>1、获取频道直播的实时推流信息</sub> | GET | `/live/v3/channel/monitor/get-stream-info` | query | channelId | ChannelService#getStreamInfo (packages/sdk/src/services/channel.service.ts) | sdk: ChannelService#getStreamInfo (packages/cli/src/services/stream.service.sdk.ts:188) |
| 查询频道直播暂存列表<br><sub>1、管理系统频道录制视频信息入口：云直播-我的直播-频道设置-回放管理-视频库-直播暂存</sub> | GET | `/live/v2/channels/{param}/recordFiles` | query | - | ChannelService#listRecordFiles (packages/sdk/src/services/channel.service.ts) | no |
| 查询频道终端分布数据统计<br><sub>1、查询频道观看终端分布统计信息</sub> | GET | `/live/v4/channel/statistics/browser-summary` | query | channelId, endTime, startTime | StatisticsService#getDeviceDistribution (packages/sdk/src/services/statistics.service.ts) | sdk: StatisticsService#getDeviceDistribution (packages/cli/src/services/statistics.service.sdk.ts:378) |
| 查询频道重制课件配置信息<br><sub>1、查询频道重制课件参数设置信息</sub> | GET | `/live/v3/channel/pptRecord/get-setting` | query | - | ChannelService#getPptRecordSetting (packages/sdk/src/services/channel.service.ts) | no |
| 查询频道重制课件设置<br><sub>1、查询频道重制课件设置</sub> | GET | `/live/v3/channel/pptRecord/get-setting` | query | channelId | ChannelService#getPptRecordSetting (packages/sdk/src/services/channel.service.ts) | no |
| 查询频道状态<br><sub>1、查询频道直播状态</sub> | GET | `/live_status/query` | query | stream | ChannelService#getLiveStatus (packages/sdk/src/services/channel.service.ts) | no |
| 查询频道字幕配置信息<br><sub>1、查询频道字幕配置信息</sub> | GET | `/live/v4/channel/subtitle/config/get` | query | channelId | V4ChannelService#getSubtitleConfig (packages/sdk/src/services/v4/channel.service.ts) | no |
| 查询任务奖励活动分页列表<br><sub>1、查询任务奖励活动分页列表</sub> | GET | `/live/v4/channel/task-reward-activity/page` | query | channelId | V4ChannelService#listTaskRewardActivities (packages/sdk/src/services/v4/channel.service.ts) | no |
| 查询任务奖励活动观众奖励明细分页列表<br><sub>1、查询任务奖励活动观众奖励明细分页列表</sub> | GET | `/live/v4/channel/task-reward-activity/viewer-detail` | query | activityId, channelId | V4ChannelService#listTaskRewardViewerDetails (packages/sdk/src/services/v4/channel.service.ts) | no |
| 查询任务奖励活动统计数据分页列表<br><sub>1、查询任务奖励活动统计数据分页列表</sub> | GET | `/live/v4/channel/task-reward-activity/stats` | query | channelId | V4ChannelService#listTaskRewardStats (packages/sdk/src/services/v4/channel.service.ts) | no |
| 查询商品标签列表<br><sub>1、查询商品标签列表</sub> | GET | `/live/v4/channel/product/tag/list` | query | channelId | V4ChannelService#listProductTagsExact (packages/sdk/src/services/v4/channel.service.ts) | no |
| 查询时间范围内频道直播观看详情数据<br><sub>1、通过频道号获取该频道某段时间的直播观看的统计数据</sub> | GET | `/live/v3/channel/statistics/daily/summary` | query | channelId, endDay, startDay | ChannelService#getDailySummary (packages/sdk/src/services/channel.service.ts) | sdk: StatisticsService#getDailyViewStatistics (packages/cli/src/services/statistics.service.sdk.ts:70) |
| 查询时间内直播场次数据<br><sub>1、查询时间内直播场次数据</sub> | POST | `/live/v4/statistics/session-stats/list` | query/form | - | V4ChannelService#listSessionStats (packages/sdk/src/services/v4/channel.service.ts) | no |
| 查询实时字幕语言类型枚举<br><sub>1、查询实时字幕语言类型枚举</sub> | GET | `/live/v4/channel/subtitle/language/list-all` | query | - | V4ChannelService#listSubtitleLanguages (packages/sdk/src/services/v4/channel.service.ts) | no |
| 查询视频库列表<br><sub>1、管理系统视频列表信息入口：云直播-我的直播-频道设置-回放管理-视频库-回放列表/点播列表</sub> | GET | `/live/v2/channel/recordFile/{param}/playback/list` | query | - | ChannelService#getPlaybackList (packages/sdk/src/services/channel.service.ts) | sdk: ChannelService#getPlaybackList (packages/cli/src/services/playback.service.sdk.ts:72) |
| 查询所有频道的基础信息<br><sub>1、查询账号下所有的频道基础信息列表，观看页状态与新版后台一致</sub> | GET | `/live/v4/channel/basic/list` | query | - | V4ChannelService#listChannelBasicExact (packages/sdk/src/services/v4/channel.service.ts) | no |
| 查询所有频道的缩略信息<br><sub>1、查询账号下所有的频道缩略信息列表，观看页状态与新版后台一致</sub> | GET | `/live/v4/channel/simple/list` | query | - | V4ChannelService#listChannelSimple (packages/sdk/src/services/v4/channel.service.ts) | no |
| 查询所有频道的详细信息<br><sub>1、查询账号下所有频道详细信息列表，观看页状态与新版后台一致</sub> | GET | `/live/v4/channel/detail/list` | query | - | V4ChannelService#channelDetailList (packages/sdk/src/services/v4/channel.service.ts) | sdk: V4ChannelService#channelDetailList (packages/cli/src/services/channel.service.sdk.ts:101) |
| 查询微信预约数据<br><sub>1、查询微信预约数据</sub> | GET | `/live/v4/channel/booking/list` | query | channelId | V4ChannelService#listWeixinBookings (packages/sdk/src/services/v4/channel.service.ts) | no |
| 查询伪直播自定义互动脚本<br><sub>1、查询伪直播自定义互动脚本</sub> | GET | `/live/v4/channel/interaction-script/query-disk-video-custom-script` | query | channelId, diskVideoId | V4ChannelService#queryDiskVideoCustomScript (packages/sdk/src/services/v4/channel.service.ts) | no |
| 查询未加入频道分组的观众列表接口 - 查询未加入频道分组的观众列表<br><sub>查询未加入频道分组的观众列表</sub> | GET | `/live-bg/v3/teacher/viewer-record/list-unrelation-channel-viewer` | query | channelId | ChannelService#listUnrelatedChannelViewers (packages/sdk/src/services/channel.service.ts) | no |
| 查询未加入频道分组的观众列表接口 - 查询未加入频道分组的观众列表<br><sub>查询未加入频道分组的观众列表</sub> | GET | `/live-bg/v3/user/viewer-record/list-unrelation-channel-viewer` | query | channelId | ChannelService#listUnrelatedChannelViewers (packages/sdk/src/services/channel.service.ts) | no |
| 查询邀请海报明细数据<br><sub>1、分页查询邀请海报明细数据统计</sub> | GET | `/live/v4/channel/invite/list` | query | channelId | V4ChannelService#listInviteStats (packages/sdk/src/services/v4/channel.service.ts) | no |
| 查询音视频文件详情<br><sub>1、查询音视频文件详情</sub> | GET | `/live/v4/user/multimedia/resource/list` | query | vids | ChannelService#getUserMultimediaResourceDetail (packages/sdk/src/services/channel.service.ts) | no |
| 查询云分发数据信息<br><sub>1、查询频道云分发数据信息</sub> | GET | `/live/v4/channel/distribute/get/statistic` | query | channelId | V4ChannelService#getDistributeStatistic (packages/sdk/src/services/v4/channel.service.ts) | no |
| 查询重制课件任务列表<br><sub>1、查询课件重制任务列表</sub> | GET | `/live/v3/channel/pptRecord/list` | query | channelId | ChannelService#listPptRecordTasks (packages/sdk/src/services/channel.service.ts) | no |
| 查询转播频道信息<br><sub>1、查询账号或频道下的转播列表信息</sub> | GET | `/live/v3/channel/transmit/get-associations` | query | - | ChannelService#getTransmitAssociations (packages/sdk/src/services/channel.service.ts) | http: httpClient.get (packages/cli/src/services/transmit-service.ts:79) |
| 查询子账号频道列表<br><sub>1、查询子账号频道列表</sub> | GET | `/live/v4/channel/channel-user-children/get-channels` | query | childUserId, pageNumber, pageSize | ChannelService#getUserChildrenChannels (packages/sdk/src/services/channel.service.ts) | no |
| 创建并初始化频道<br><sub>1、根据请求参数与默认模板创建频道</sub> | POST | `/live/v4/channel/create-init` | json-body | basicSetting | V4ChannelService#createInit (packages/sdk/src/services/v4/channel.service.ts) | no |
| 创建抽奖活动<br><sub>1、创建抽奖活动</sub> | POST | `/live/v4/channel/lottery-activity/create` | json-body | activityName, amount, channelId, lotteryCondition, prizeName | V4ChannelService#createLotteryActivityExact (packages/sdk/src/services/v4/channel.service.ts) | no |
| 创建互动监听事件<br><sub>1、创建互动监听事件</sub> | POST | `/live/v4/channel/interaction-event/save` | json-body | allDone, channelId, tasks | V4ChannelService#interactionEventSave (packages/sdk/src/services/v4/channel.service.ts) | no |
| 创建角色<br><sub>1、创建频道的助教或嘉宾角色</sub> | POST | `/live/v4/channel/account/create` | json-body | channelId, role | V4ChannelService#createAccount (packages/sdk/src/services/v4/channel.service.ts) | no |
| 创建频道<br><sub>1、根据直播默认模板创建频道</sub> | POST | `/live/v4/channel/create` | json-body | name, newScene, template | ChannelService#createChannelV4 (packages/sdk/src/services/channel.service.ts) | sdk: V4ChannelService#create (packages/cli/src/services/channel.service.sdk.ts:69)<br>sdk: ChannelService#createChannelV4 (packages/cli/src/setup/resource-handlers.ts:67) |
| 创建频道卡片推送<br><sub>1、创建频道卡片推送，对应新版后台的 营销-卡片</sub> | GET | `/live/v4/channel/card-push/create` | query | channelId, duration, imageType, link, showCondition, title | V4ChannelService#createCardPushExact (packages/sdk/src/services/v4/channel.service.ts) | http: httpClient.get (packages/cli/src/services/card-push-service.ts:108) |
| 创建频道新版场次<br><sub>1、创建频道新版场次</sub> | POST | `/live/v4/channel/session/new/create` | json-body | channelId, name, planEndTime, planStartTime | V4ChannelService#sessionCreate (packages/sdk/src/services/v4/channel.service.ts) | no |
| 创建任务奖励活动<br><sub>1、创建任务奖励活动</sub> | POST | `/live/v4/channel/task-reward-activity/save` | json-body | activityName, channelId, endTime, startTime, taskRule, tasks | V4ChannelService#createTaskRewardActivity (packages/sdk/src/services/v4/channel.service.ts) | no |
| 创建商品标签<br><sub>1、创建商品标签</sub> | POST | `/live/v4/channel/product/tag/create` | json-body | channelId, name | V4ChannelService#createProductTagExact (packages/sdk/src/services/v4/channel.service.ts) | no |
| 创建邀请者<br><sub>1、邀请海报-创建邀请者</sub> | POST | `/live/v4/channel/invite/poster/create` | query/form | channelId, nickname, openId | V4ChannelService#createInvitePoster (packages/sdk/src/services/v4/channel.service.ts) | no |
| 创建暂存视频大纲<br><sub>- 用于创建暂存视频的 AI 大纲任务</sub> | POST | `/live/v4/channel/record-file/subtitle/outline/create` | query/form | fileId | V4ChannelService#createRecordFileOutline (packages/sdk/src/services/v4/channel.service.ts) | no |
| 创建重制课件任务<br><sub>1、创建重制课件任务，需等候任务队列执行完成，不是实时重制</sub> | POST | `/live/v3/channel/pptRecord/addRecordTask` | query/form | channelId, videoId | ChannelService#addPptRecordTask (packages/sdk/src/services/channel.service.ts) | no |
| 创建MR频道<br><sub>1、创建MR频道</sub> | POST | `/live/v4/channel/mr/create` | json-body | name | V4ChannelService#createMrChannel (packages/sdk/src/services/v4/channel.service.ts) | no |
| 导出频道场次报表（图表）<br><sub>1、导出频道场次报表（图表）</sub> | GET | `/live/v3/channel/session/stats/export` | query | channelId, sessionId | ChannelService#exportSessionStats (packages/sdk/src/services/channel.service.ts) | sdk: StatisticsService#exportSessionStats (packages/cli/src/services/statistics.service.sdk.ts:574) |
| 分页查询频道抽奖统计记录<br><sub>1、分页查询频道抽奖统计记录</sub> | GET | `/live/v4/channel/lottery/activity-record/list` | query | channelId | V4ChannelService#listLotteryActivityRecords (packages/sdk/src/services/v4/channel.service.ts) | no |
| 分页查询频道打赏记录<br><sub>1、分页查询频道打赏记录</sub> | GET | `/live/v4/channel/reward/gift-list` | query | channelId, end, start | V4ChannelService#listRewardGifts (packages/sdk/src/services/v4/channel.service.ts) | http: httpClient.get (packages/cli/src/services/donate-service.ts:77) |
| 分页查询频道点赞记录<br><sub>1、分页查询频道点赞记录</sub> | GET | `/live/v4/channel/reward/like-list` | query | channelId | V4ChannelService#listRewardLikes (packages/sdk/src/services/v4/channel.service.ts) | no |
| 分页查询频道商品统计列表<br><sub>1、分页查询频道商品统计列表</sub> | GET | `/live/v4/channel/product/stats/page` | query | channelId | V4ChannelService#listProductStats (packages/sdk/src/services/v4/channel.service.ts) | no |
| 分页查询频道直播观看详情数据<br><sub>1、分页获取频道的直播观看日志</sub> | GET | `/live/v2/statistics/{param}/viewlog` | query | - | ChannelService#getViewlog2 (packages/sdk/src/services/channel.service.ts) | no |
| 分页查询素材库频道直播回放列表<br><sub>1、分页查询素材库频道直播回放列表</sub> | GET | `/live/v4/channel/record-file/m-list` | query | channelId | V4ChannelService#listMaterialRecordFiles (packages/sdk/src/services/v4/channel.service.ts) | no |
| 分页查询账号直播观看详情数据<br><sub>1、分页获取账号下所有频道观看详情数据</sub> | GET | `/live/v3/user/statistics/viewlog` | query | endDate, startDate | ChannelService#getUserViewlog (packages/sdk/src/services/channel.service.ts) | sdk: StatisticsService#getViewlog (packages/cli/src/services/statistics.service.sdk.ts:482) |
| 分组删除观众<br><sub>1、分组删除观众</sub> | POST | `/live/v4/channel/lottery-viewer-list/delete-batch` | json-body | channelId, groupId, ids | V4ChannelService#deleteLotteryGroupViewers (packages/sdk/src/services/v4/channel.service.ts) | no |
| 分组添加观众<br><sub>1、分组添加观众</sub> | POST | `/live/v4/channel/lottery-viewer-list/create` | json-body | channelId, groupId, viewerIds | V4ChannelService#createLotteryGroupViewers (packages/sdk/src/services/v4/channel.service.ts) | no |
| 复制频道<br><sub>1、通过一个频道复制出一个新的频道</sub> | POST | `/live/v3/channel/basic/copy` | query/form | channelId | ChannelService#copyChannel (packages/sdk/src/services/channel.service.ts) | no |
| 根据自定义场次ID查询频道暂存文件ID<br><sub>1、根据自定义场次ID查询频道暂存文件ID</sub> | GET | `/live/v3/channel/session/list-file-id-by-external` | query | channelId, externalSessionId | ChannelService#listFileIdByExternal (packages/sdk/src/services/channel.service.ts) | no |
| 根据自定义场次UUID查询直播场次<br><sub>1、查询根据自定义场次UUID查询直播场次</sub> | GET | `/live/v3/channel/session/list-session-by-external` | query | channelId, externalSessionId | ChannelService#getSessionByExternal (packages/sdk/src/services/channel.service.ts) | no |
| 更新抽奖活动<br><sub>1、更新抽奖活动</sub> | POST | `/live/v4/channel/lottery-activity/update` | json-body | activityName, amount, channelId, id, lotteryCondition, prizeName | V4ChannelService#updateLotteryActivityExact (packages/sdk/src/services/v4/channel.service.ts) | no |
| 更新频道新版场次<br><sub>1、更新频道新版场次</sub> | POST | `/live/v4/channel/session/new/update` | json-body | name, planEndTime, planStartTime, sessionId | V4ChannelService#sessionUpdate (packages/sdk/src/services/v4/channel.service.ts) | no |
| 更新频道重制课件设置<br><sub>1、更新频道重制课件设置</sub> | POST | `/live/v3/channel/pptRecord/setting` | query/form | channelId | ChannelService#updatePptRecordSetting (packages/sdk/src/services/channel.service.ts) | no |
| 更新商品标签<br><sub>1、更新商品标签</sub> | POST | `/live/v4/channel/product/tag/update` | json-body | channelId, id, name | V4ChannelService#updateProductTagExact (packages/sdk/src/services/v4/channel.service.ts) | no |
| 关联音视频文件到频道<br><sub>1、关联音视频文件到频道</sub> | POST | `/live/v4/channel/multimedia/resource/save-batch` | query/form | channelId, vids | ChannelService#linkChannelMultimediaResource (packages/sdk/src/services/channel.service.ts) | no |
| 观众查询奖励明细分页列表<br><sub>1、观众查询奖励明细分页列表</sub> | GET | `/live/v4/user/viewer-task-reward/page` | query | viewerId | V4ChannelService#listViewerTaskRewardDetails (packages/sdk/src/services/v4/channel.service.ts) | no |
| 观众提交任务奖励表单<br><sub>1、观众提交任务奖励表单</sub> | POST | `/live/v4/user/viewer-task-reward/submit-accept-info` | json-body | formInfo, id, viewerId | V4ChannelService#submitViewerTaskRewardAcceptInfo (packages/sdk/src/services/v4/channel.service.ts) | no |
| 合并录制文件<br><sub>1、合并频道的录制文件，保存至频道号内视频库</sub> | POST | `/live/v2/channel/recordFile/{param}/merge` | query/form | - | ChannelService#mergeRecordFiles (packages/sdk/src/services/channel.service.ts) | no |
| 合并直播录制<br><sub>1、合并直播录制文件，保存至频道号内视频库，接口合并过程为异步处理过程</sub> | POST | `/live/v3/channel/record/merge` | query/form | channelId, fileIds | ChannelService#recordFileMerge (packages/sdk/src/services/channel.service.ts) | sdk: ChannelService#recordFileMerge (packages/cli/src/services/playback.service.sdk.ts:252) |
| 合并直播录制文件并回调mp4下载地址<br><sub>1、合并直播录制mp4文件，接口合并过程为异步处理过程</sub> | POST | `/live/v3/channel/record/merge-mp4` | query/form | channelId, endTime, startTime | ChannelService#recordMergeMp4 (packages/sdk/src/services/channel.service.ts) | no |
| 合并直播录制文件并回调mp4下载地址<br><sub>1、合并直播录制mp4文件，接口合并过程为异步处理过程</sub> | POST | `/live/v3/channel/record/merge-mp4-start` | query/form | channelId, endTime, startTime | ChannelService#recordMergeMp4Start (packages/sdk/src/services/channel.service.ts) | no |
| 黑名单删除观众<br><sub>1、黑名单删除观众</sub> | POST | `/live/v4/channel/lottery-viewer-list/blacklist/delete-batch` | json-body | channelId, ids | V4ChannelService#deleteLotteryBlacklistViewers (packages/sdk/src/services/v4/channel.service.ts) | no |
| 黑名单添加观众<br><sub>1、黑名单添加观众</sub> | POST | `/live/v4/channel/lottery-viewer-list/blacklist/create` | json-body | channelId, viewerIds | V4ChannelService#createLotteryBlacklistViewers (packages/sdk/src/services/v4/channel.service.ts) | no |
| 获取观看页 SDK 授权令牌<br><sub>1、获取观众观看调用接口token</sub> | POST | `/live/v3/channel/watch/get-watch-api-token` | query/form | channelId, viewerId | ChannelService#getWatchApiToken (packages/sdk/src/services/channel.service.ts) | no |
| 获取观看页测试模式的访问令牌<br><sub>1、接口用于获取观看页测试模式的访问令牌</sub> | POST | `/live/v3/channel/watch/get-test-mode-token` | query/form | channelId | ChannelService#getTestModeToken (packages/sdk/src/services/channel.service.ts) | no |
| 获取观众观看调用接口token<br><sub>1、获取观众观看调用接口token</sub> | POST | `/live/v3/channel/watch/get-api-token` | query/form | channelId, viewerId | ChannelService#getApiToken (packages/sdk/src/services/channel.service.ts) | no |
| 获取频道关注公众号设置信息<br><sub>1、查询关注公众号设置接口</sub> | GET | `/live/v3/channel/promotion/list-channels-follow` | query | channelIds | ChannelService#listChannelsFollow (packages/sdk/src/services/channel.service.ts) | no |
| 获取频道聊天室的在线人数<br><sub>1、获取频道聊天室的在线人数</sub> | GET | `/live/v3/channel/chat/count-online-user` | query | channelId | ChatService#countOnlineUser (packages/sdk/src/services/chat.service.ts) | no |
| 获取频道聊天室在线人数接口<br><sub>1、获取频道聊天室在线人数接口</sub> | POST | `/live/v3/channel/chat/count-online-user` | query/form | channelId | ChannelService#getChatOnlineCount (packages/sdk/src/services/channel.service.ts) | no |
| 获取频道商品统计概览<br><sub>1、查询频道商品整体统计数据概览（点击、下单、成交等指标汇总）</sub> | GET | `/live/v4/channel/product/stats/summary` | query | channelId | V4ChannelService#getProductStatsSummary (packages/sdk/src/services/v4/channel.service.ts) | no |
| 获取频道推流URL<br><sub>1、获取频道推流URL，由于推流地址可能发生变化，所以请在使用时获取</sub> | GET | `/live/v3/channel/stream/get-push-url` | query | channelId | ChannelService#getPushUrl (packages/sdk/src/services/channel.service.ts) | sdk: ChannelService#getPushUrl (packages/cli/src/services/stream.service.sdk.ts:63) |
| 获取频道新版场次列表<br><sub>1、获取频道新版场次列表</sub> | GET | `/live/v4/channel/session/new/list` | query | - | V4ChannelService#sessionList (packages/sdk/src/services/v4/channel.service.ts) | sdk: V4ChannelService#sessionList (packages/cli/src/services/session.service.sdk.ts:74) |
| 获取频道新版场次信息<br><sub>1、获取频道新版场次信息</sub> | GET | `/live/v4/channel/session/new/get` | query | - | V4ChannelService#sessionGet (packages/sdk/src/services/v4/channel.service.ts) | sdk: V4ChannelService#sessionGet (packages/cli/src/services/session.service.sdk.ts:103) |
| 获取频道API的访问令牌<br><sub>1、接口用于获取频道级别的API访问令牌（channel access token），以下简称token</sub> | POST | `/live/v3/common/token/get-channel-token` | query/form | channelId | ChannelService#getChannelApiAccessToken (packages/sdk/src/services/channel.service.ts) | no |
| 获取频道hls协议拉流地址<br><sub>1、获取频道hls协议拉流地址</sub> | GET | `/live/v3/channel/monitor/hls-pull-url` | query | channelId | ChannelService#getHlsPullUrl (packages/sdk/src/services/channel.service.ts) | no |
| 获取硬盘推流(伪直播)视频列表<br><sub>1、获取硬盘推流(伪直播)视频列表</sub> | GET | `/live/v3/channel/disk-video/list` | query | channelId | ChannelService#listDiskVideo (packages/sdk/src/services/channel.service.ts) | no |
| 获取主讲等角色免密登录URL<br><sub>1、获取频道免密登录URL</sub> | POST | `/live/v3/channel/common/token-login-url` | query/form | channelId | ChannelService#getTokenLoginUrl (packages/sdk/src/services/channel.service.ts) | no |
| 获取cdn频道的直播实时推流信息(阿里、腾讯cdn)<br><sub>1、获取cdn频道的直播实时推流信息(阿里、腾讯cdn)</sub> | GET | `/live/v4/channel/monitor/list-stream-info` | query | channelId | V4ChannelService#listMonitorStreamInfo (packages/sdk/src/services/v4/channel.service.ts) | no |
| 将点播视频添加到视频库<br><sub>1、添加账号对应的点播视频到直播频道下的视频库</sub> | POST | `/live/v3/channel/playback/add` | query/form | channelId, vid | ChannelService#addVodPlaybackToLibrary (packages/sdk/src/services/channel.service.ts) | no |
| 讲师文档关系管理<br><sub>1、开启了“讲义库”功能后（如需开通请联系售后），通过此接口将讲师和公共讲义库中的文档关联起来，从而实现在不需要重复上传的情况下，多个讲师共用同一份文档</sub> | POST | `/live/v4/channel/doc/teacher/update-relation` | query/form | fileIds, operation, teacherId | ChannelService#updateTeacherDocRelation (packages/sdk/src/services/channel.service.ts) | no |
| 结束伪直播<br><sub>1、结束当前正在直播中的伪直播</sub> | POST | `/live/v3/channel/stream/end-disk-push` | query/form | channelId | ChannelService#endDiskPush (packages/sdk/src/services/channel.service.ts) | no |
| 批量查询频道单个回放信息<br><sub>1、根据多个频道号查询每个频道设置的回放视频信息（仅支持非直播暂存的单个视频的回放查询）</sub> | GET | `/live/v4/channel/play-back/get` | query | channelIds | V4ChannelService#getPlaybackVideoInfo (packages/sdk/src/services/v4/channel.service.ts) | no |
| 批量查询频道直播推流信息<br><sub>1、批量获取频道直播的实时推流信息</sub> | GET | `/live/v3/channel/monitor/get-streams` | query | channelIds | ChannelService#getStreams (packages/sdk/src/services/channel.service.ts) | no |
| 批量查询频道直播状态<br><sub>1、批量查询频道直播状态（不支持研讨会）</sub> | GET | `/live/v4/channel/live-status/list` | query | channelIds | V4ChannelService#listLiveStatus (packages/sdk/src/services/v4/channel.service.ts) | no |
| 批量查询主讲信息接口<br><sub>1、批量查询主讲信息接口</sub> | POST | `/live/v4/channel/account/teacher-list` | json-body | channelIds | V4ChannelService#teacherList (packages/sdk/src/services/v4/channel.service.ts) | no |
| 批量创建角色<br><sub>1、批量创建角色，角色包括Guest(嘉宾)、Assistant(助教)</sub> | POST | `/live/v3/channel/account/batch-create` | json-body | channelId | ChannelService#batchCreateAccounts (packages/sdk/src/services/channel.service.ts) | no |
| 批量创建接收转播的频道<br><sub>1、根据发起转播的频道，批量创建接收转播的频道</sub> | POST | `/live/v3/channel/transmit/batch-create` | json-body | channelId | ChannelService#batchAddTransmit (packages/sdk/src/services/channel.service.ts) | http: httpClient.post (packages/cli/src/services/transmit-service.ts:54) |
| 批量创建频道<br><sub>1、批量创建频道</sub> | POST | `/live/v4/channel/create-batch` | json-body | name, newScene, template | V4ChannelService#createBatch (packages/sdk/src/services/v4/channel.service.ts) | no |
| 批量创建渠道推广<br><sub>1、支持批量创建渠道推广</sub> | POST | `/live/v4/channel/popularization/create-batch` | json-body | channelId, names | V4ChannelService#createPopularizations (packages/sdk/src/services/v4/channel.service.ts) | http: httpClient.post (packages/cli/src/services/promotion-service.ts:132) |
| 批量关联分会场<br><sub>1、批量关联分会场</sub> | POST | `/live/v3/channel/multi-meeting/batch-save-submeeting` | json-body | channelId, subChannels | ChannelService#batchAddSubmeeting (packages/sdk/src/services/channel.service.ts) | no |
| 批量关联或者取消关联接收转播频道设置<br><sub>1、批量关联或者取消关联接收转播频道设置</sub> | POST | `/live/v3/channel/transmit/associations` | query/form | channelId, receiveChannelIds | ChannelService#associationReceiveChannels (packages/sdk/src/services/channel.service.ts) | no |
| 批量删除分发地址<br><sub>1、批量删除分发地址</sub> | POST | `/live/v4/channel/distribute/delete-batch` | query/form | channelId, distributeIds | V4ChannelService#distributeDeleteBatch (packages/sdk/src/services/v4/channel.service.ts) | no |
| 批量删除角色<br><sub>1、批量删除角色</sub> | POST | `/live/v4/channel/account/delete-batch` | query/form | accounts, channelId | V4ChannelService#deleteAccountsBatch (packages/sdk/src/services/v4/channel.service.ts) | no |
| 批量删除频道<br><sub>1、批量删除直播频道</sub> | POST | `/live/v3/channel/basic/batch-delete` | json-body | channelIds | ChannelService#batchDeleteChannels (packages/sdk/src/services/channel.service.ts) | sdk: ChannelService#batchDeleteChannels (packages/cli/src/services/channel.service.sdk.ts:197)<br>sdk: ChannelService#batchDeleteChannels (packages/cli/src/services/channel.service.sdk.ts:220) |
| 批量删除频道多条聊天记录<br><sub>1、根据聊天的id删除对应聊天记录</sub> | POST | `/live/v3/channel/chat/remove-contents` | query/form | channelId, ids | ChannelService#removeChatContents (packages/sdk/src/services/channel.service.ts) | no |
| 批量删除频道商品<br><sub>1、批量删除频道商品</sub> | POST | `/live/v3/channel/product/batch-delete` | json-body | channelId, productIds | ChannelService#batchDeleteChannelProducts (packages/sdk/src/services/channel.service.ts) | no |
| 批量添加分发地址<br><sub>1、批量添加分发地址</sub> | POST | `/live/v4/channel/distribute/create-batch` | json-body | channelId | V4ChannelService#distributeCreateBatch (packages/sdk/src/services/v4/channel.service.ts) | no |
| 批量添加频道商品<br><sub>1、批量添加频道商品库商品</sub> | POST | `/live/v3/channel/product/batch-add` | json-body | channelId | ChannelService#batchAddChannelProducts (packages/sdk/src/services/channel.service.ts) | no |
| 批量修改分分发地址<br><sub>1、修改分发地址</sub> | POST | `/live/v4/channel/distribute/update-batch` | json-body | channelId | V4ChannelService#distributeUpdateBatch (packages/sdk/src/services/v4/channel.service.ts) | no |
| 批量修改频道弹幕开关<br><sub>1、批量修改频道弹幕开关</sub> | POST | `/live/v3/channel/basic/batchUpdateDanmu` | query/form | channelIds, closeDanmu, showDanmuInfoEnabled | ChannelService#batchUpdateDanmu (packages/sdk/src/services/channel.service.ts) | no |
| 批量修改频道回放字幕<br><sub>1、批量修改频道回放字幕</sub> | POST | `/live/v4/channel/subtitle/update-batch` | json-body | body, channelId | V4ChannelService#updateChannelSubtitleBatch (packages/sdk/src/services/v4/channel.service.ts) | no |
| 批量修改频道皮肤<br><sub>1、批量修改频道装修皮肤</sub> | POST | `/live/v4/channel/decorate/skin/update-batch` | query/form | channelIds, skin | V4ChannelService#updateSkinBatch (packages/sdk/src/services/v4/channel.service.ts) | no |
| 批量修改频道商品库上下架状态<br><sub>1、批量修改频道商品库商品上下架状态</sub> | POST | `/live/v3/channel/product/batch-shelf` | json-body | channelId, productIds | ChannelService#batchShelfChannelProducts (packages/sdk/src/services/channel.service.ts) | no |
| 批量修改频道云分发开关<br><sub>1、批量修改频道云分发开关，该功能需要超管开通才生效</sub> | POST | `/live/v4/channel/distribute/update-switch` | query/form | channelId, distributeIds | V4ChannelService#updateSwitch (packages/sdk/src/services/v4/channel.service.ts) | no |
| 批量转存暂存视频到云点播<br><sub>1、批量转存直播暂存录制视频文件到点播列表，接口转存过程为异步处理过程</sub> | POST | `/live/v3/channel/record/convert` | query/form | channelId | ChannelService#recordConvert (packages/sdk/src/services/channel.service.ts) | sdk: ChannelService#recordConvert (packages/cli/src/services/record.service.sdk.ts:134) |
| 频道观看页观众退出登录<br><sub>1、频道观看页观众退出登录</sub> | POST | `/live/v4/channel/watch/viewer/logout` | json-body | channelId | V4ChannelService#logoutWatchViewer (packages/sdk/src/services/v4/channel.service.ts) | no |
| 频道所属用户列表接口 - 导出频道所属用户列表<br><sub>导出频道所属用户列表</sub> | GET | `/live-bg/v3/teacher/channel-viewer/list/export` | query | channelId | ChannelService#exportChannelViewers (packages/sdk/src/services/channel.service.ts) | no |
| 频道所属用户列表接口 - 导出频道所属用户列表<br><sub>导出频道所属用户列表</sub> | GET | `/live-bg/v3/user/channel-viewer/list/export` | query | channelId | ChannelService#exportChannelViewers (packages/sdk/src/services/channel.service.ts) | no |
| 频道所属用户列表接口 - 导入频道所属用户<br><sub>导入频道所属用户</sub> | POST | `/live-bg/v3/teacher/channel-viewer/list/import` | query/form | channelId, file | ChannelService#importChannelViewers (packages/sdk/src/services/channel.service.ts) | no |
| 频道所属用户列表接口 - 导入频道所属用户<br><sub>导入频道所属用户</sub> | POST | `/live-bg/v3/user/channel-viewer/list/import` | query/form | channelId, file | ChannelService#importChannelViewers (packages/sdk/src/services/channel.service.ts) | no |
| 频道所属用户列表接口 - 分页查询频道所属用户列表<br><sub>分页查询频道所属用户列表</sub> | GET | `/live-bg/v3/teacher/channel-viewer/list/list` | query | channelId | ChannelService#listChannelViewers (packages/sdk/src/services/channel.service.ts) | no |
| 频道所属用户列表接口 - 分页查询频道所属用户列表<br><sub>分页查询频道所属用户列表</sub> | GET | `/live-bg/v3/user/channel-viewer/list/list` | query | channelId | ChannelService#listChannelViewers (packages/sdk/src/services/channel.service.ts) | no |
| 频道所属用户列表接口 - 批量转移频道所属用户到指定分组<br><sub>批量转移频道所属用户到指定分组</sub> | POST | `/live-bg/v3/teacher/channel-viewer/list/transfer` | query/form | channelId, viewerIds | ChannelService#transferChannelViewers (packages/sdk/src/services/channel.service.ts) | no |
| 频道所属用户列表接口 - 批量转移频道所属用户到指定分组<br><sub>批量转移频道所属用户到指定分组</sub> | POST | `/live-bg/v3/user/channel-viewer/list/transfer` | query/form | channelId, viewerIds | ChannelService#transferChannelViewers (packages/sdk/src/services/channel.service.ts) | no |
| 频道所属用户列表接口 - 删除频道所属用户<br><sub>删除频道所属用户</sub> | POST | `/live-bg/v3/teacher/channel-viewer/list/delete` | query/form | channelId, viewerIds | ChannelService#deleteChannelViewers (packages/sdk/src/services/channel.service.ts) | no |
| 频道所属用户列表接口 - 删除频道所属用户<br><sub>删除频道所属用户</sub> | POST | `/live-bg/v3/user/channel-viewer/list/delete` | query/form | channelId, viewerIds | ChannelService#deleteChannelViewers (packages/sdk/src/services/channel.service.ts) | no |
| 频道所属用户列表接口 - 新增频道所属用户<br><sub>新增频道所属用户</sub> | POST | `/live-bg/v3/teacher/channel-viewer/list/save` | query/form | channelId, viewerIds | ChannelService#addChannelViewers (packages/sdk/src/services/channel.service.ts) | no |
| 频道所属用户列表接口 - 新增频道所属用户<br><sub>新增频道所属用户</sub> | POST | `/live-bg/v3/user/channel-viewer/list/save` | query/form | channelId, viewerIds | ChannelService#addChannelViewers (packages/sdk/src/services/channel.service.ts) | no |
| 频道用户分组接口 - 查询频道下的分组列表<br><sub>查询频道下的分组列表</sub> | GET | `/live-bg/v3/teacher/channel-viewer/group/list` | query | channelId | ChannelService#listChannelViewerGroups (packages/sdk/src/services/channel.service.ts) | no |
| 频道用户分组接口 - 查询频道下的分组列表<br><sub>查询频道下的分组列表</sub> | GET | `/live-bg/v3/user/channel-viewer/group/list` | query | channelId | ChannelService#listChannelViewerGroups (packages/sdk/src/services/channel.service.ts) | no |
| 频道用户分组接口 - 更新频道分组<br><sub>更新频道分组</sub> | POST | `/live-bg/v3/teacher/channel-viewer/group/update` | query/form | channelId, id, name | ChannelService#updateChannelViewerGroup (packages/sdk/src/services/channel.service.ts) | no |
| 频道用户分组接口 - 更新频道分组<br><sub>更新频道分组</sub> | POST | `/live-bg/v3/user/channel-viewer/group/update` | query/form | channelId, id, name | ChannelService#updateChannelViewerGroup (packages/sdk/src/services/channel.service.ts) | no |
| 频道用户分组接口 - 删除频道分组<br><sub>删除频道分组</sub> | POST | `/live-bg/v3/teacher/channel-viewer/group/delete` | query/form | channelId, id | ChannelService#deleteChannelViewerGroup (packages/sdk/src/services/channel.service.ts) | no |
| 频道用户分组接口 - 删除频道分组<br><sub>删除频道分组</sub> | POST | `/live-bg/v3/user/channel-viewer/group/delete` | query/form | channelId, id | ChannelService#deleteChannelViewerGroup (packages/sdk/src/services/channel.service.ts) | no |
| 频道用户分组接口 - 新增频道分组<br><sub>新增频道分组</sub> | POST | `/live-bg/v3/teacher/channel-viewer/group/save` | query/form | channelId, name | ChannelService#createChannelViewerGroup (packages/sdk/src/services/channel.service.ts) | no |
| 频道用户分组接口 - 新增频道分组<br><sub>新增频道分组</sub> | POST | `/live-bg/v3/user/channel-viewer/group/save` | query/form | channelId, name | ChannelService#createChannelViewerGroup (packages/sdk/src/services/channel.service.ts) | no |
| 频道用户分组配置接口 - 保存频道用户分组配置<br><sub>保存频道用户分组配置</sub> | POST | `/live-bg/v3/teacher/channel-viewer/group-setting/update` | json-body | channelId | ChannelService#updateChannelViewerGroupSetting (packages/sdk/src/services/channel.service.ts) | no |
| 频道用户分组配置接口 - 保存频道用户分组配置<br><sub>保存频道用户分组配置</sub> | POST | `/live-bg/v3/user/channel-viewer/group-setting/update` | json-body | channelId | ChannelService#updateChannelViewerGroupSetting (packages/sdk/src/services/channel.service.ts) | no |
| 频道用户分组配置接口 - 查询频道用户分组配置<br><sub>查询频道用户分组配置</sub> | GET | `/live-bg/v3/teacher/channel-viewer/group-setting/get` | query | channelId | ChannelService#getChannelViewerGroupSetting (packages/sdk/src/services/channel.service.ts) | no |
| 频道用户分组配置接口 - 查询频道用户分组配置<br><sub>查询频道用户分组配置</sub> | GET | `/live-bg/v3/user/channel-viewer/group-setting/get` | query | channelId | ChannelService#getChannelViewerGroupSetting (packages/sdk/src/services/channel.service.ts) | no |
| 频道直播录制打点功能<br><sub>1、设置直播录制打点</sub> | POST | `/live/v3/channel/record/add-breakpoint` | query/form | channelId, type | ChannelService#recordAddBreakpoint (packages/sdk/src/services/channel.service.ts) | no |
| 渠道推广列表<br><sub>1、查询渠道推广列表</sub> | GET | `/live/v4/channel/popularization/list` | query | channelId | V4ChannelService#listPopularizations (packages/sdk/src/services/v4/channel.service.ts) | http: httpClient.get (packages/cli/src/services/promotion-service.ts:76) |
| 取消频道的关联音视频文件<br><sub>1、取消频道的关联音视频文件</sub> | POST | `/live/v4/channel/multimedia/resource/delete-batch` | query/form | channelId, vids | ChannelService#unlinkChannelMultimediaResource (packages/sdk/src/services/channel.service.ts) | no |
| 取消推送卡片<br><sub>1、取消推送卡片，对应新版后台的 营销-卡片</sub> | POST | `/live/v4/channel/card-push/cancel-push` | query/form | cardPushId, channelId | V4ChannelService#cancelCardPushExact (packages/sdk/src/services/v4/channel.service.ts) | http: httpClient.post (packages/cli/src/services/card-push-service.ts:198) |
| 取消推送频道商品库商品<br><sub>1、取消推送频道商品库商品</sub> | POST | `/live/v3/channel/product/cancel-push-product` | query/form | channelId, productId | ChannelService#cancelPushChannelProduct (packages/sdk/src/services/channel.service.ts) | no |
| 取消置顶频道商品<br><sub>1、取消指定频道商品的置顶状态</sub> | POST | `/live/v4/channel/product/un-topping` | json-body | channelId, productId | V4ChannelService#untoppingChannelProduct (packages/sdk/src/services/v4/channel.service.ts) | no |
| 删除抽奖活动<br><sub>1、删除抽奖活动</sub> | POST | `/live/v4/channel/lottery-activity/delete` | json-body | channelId, id | V4ChannelService#deleteLotteryActivityExact (packages/sdk/src/services/v4/channel.service.ts) | no |
| 删除单个频道<br><sub>1、删除单个直播频道</sub> | POST | `/live/v2/channels/{param}/delete` | query/form | userId | ChannelService#deleteChannel (packages/sdk/src/services/channel.service.ts) | sdk: ChannelService#deleteChannel (packages/cli/src/setup/resource-handlers.ts:89) |
| 删除分组<br><sub>1、删除分组</sub> | POST | `/live/v4/channel/lottery-viewer-group/whitelist/delete` | json-body | channelId, id | V4ChannelService#deleteLotteryViewerGroup (packages/sdk/src/services/v4/channel.service.ts) | no |
| 删除互动监听事件<br><sub>1、删除互动监听事件</sub> | POST | `/live/v4/channel/interaction-event/delete` | json-body | channelId, taskIds | V4ChannelService#interactionEventDelete (packages/sdk/src/services/v4/channel.service.ts) | no |
| 删除互动脚本<br><sub>1、删除互动脚本</sub> | POST | `/live/v4/channel/interaction-script/delete` | json-body | channelId, id | V4ChannelService#deleteInteractionScript (packages/sdk/src/services/v4/channel.service.ts) | no |
| 删除角色<br><sub>1、删除频道内某个助教或嘉宾</sub> | POST | `/live/v2/channelAccount/{param}/delete` | query/form | account | ChannelService#deleteAccount (packages/sdk/src/services/channel.service.ts) | no |
| 删除卡片推送<br><sub>1、删除卡片推送，对应新版后台的 营销-卡片</sub> | POST | `/live/v4/channel/card-push/delete` | query/form | cardPushId, channelId | V4ChannelService#deleteCardPushExact (packages/sdk/src/services/v4/channel.service.ts) | http: httpClient.post (packages/cli/src/services/card-push-service.ts:220) |
| 删除频道商品<br><sub>1、删除频道商品库商品</sub> | POST | `/live/v3/channel/product/delete` | query/form | channelId, productId | ChannelService#deleteChannelProduct (packages/sdk/src/services/channel.service.ts) | sdk: ChannelService#deleteChannelProduct (packages/cli/src/services/product.service.sdk.ts:237)<br>sdk: ChannelService#deleteChannelProduct (packages/cli/src/setup/resource-handlers.ts:175) |
| 删除频道新版场次<br><sub>1、删除频道新版场次</sub> | POST | `/live/v4/channel/session/new/delete` | json-body | channelId, sessionId | V4ChannelService#sessionDelete (packages/sdk/src/services/v4/channel.service.ts) | no |
| 删除频道优惠券<br><sub>1、批量删除频道优惠券</sub> | POST | `/live/v4/channel/coupon/delete` | json-body | channelId, couponIds | V4ChannelService#deleteChannelCoupons (packages/sdk/src/services/v4/channel.service.ts) | no |
| 删除任务奖励活动<br><sub>1、删除任务奖励活动</sub> | GET | `/live/v4/channel/task-reward-activity/delete` | query | activityId | V4ChannelService#deleteTaskRewardActivity (packages/sdk/src/services/v4/channel.service.ts) | no |
| 删除商品标签<br><sub>1、删除商品标签</sub> | POST | `/live/v4/channel/product/tag/delete` | json-body | channelId, id | V4ChannelService#deleteProductTagExact (packages/sdk/src/services/v4/channel.service.ts) | no |
| 删除视频库中的视频<br><sub>1、删除频道回放管理视频库中的某个视频，只是在频道视频库列表删除，点播后台中视频依然存在</sub> | POST | `/live/v2/channel/recordFile/{param}/playback/delete` | query/form | - | ChannelService#deletePlayback (packages/sdk/src/services/channel.service.ts) | sdk: ChannelService#deletePlayback (packages/cli/src/services/playback.service.sdk.ts:180) |
| 删除伪直播视频<br><sub>1、删除伪直播中的视频，不允许删除正在伪直播中的视频</sub> | POST | `/live/v3/channel/stream/delete-disk-videos` | query/form | channelId | ChannelService#deleteDiskVideos (packages/sdk/src/services/channel.service.ts) | no |
| 删除文档<br><sub>1、删除频道文档接口</sub> | POST | `/live/v3/channel/document/delete` | query/form | channelId, fileId, type | ChannelService#deleteDocument (packages/sdk/src/services/channel.service.ts) | sdk: ChannelService#deleteDocument (packages/cli/src/services/document.service.sdk.ts:194) |
| 删除音视频文件<br><sub>1、删除音视频文件</sub> | POST | `/live/v4/user/multimedia/resource/delete-batch` | query/form | vids | ChannelService#deleteUserMultimediaResource (packages/sdk/src/services/channel.service.ts) | no |
| 删除直播暂存中的录制视频<br><sub>1、删除频道视频库中直播暂存的录制视频</sub> | POST | `/live/v2/channel/recordFile/{param}/delete-record` | query/form | - | ChannelService#deleteRecordFile (packages/sdk/src/services/channel.service.ts) | no |
| 删除重制课件任务<br><sub>1、删除重制课件任务, 可批量删除</sub> | POST | `/live/v3/channel/pptRecord/batch-delete` | query/form | channelId, taskIds | ChannelService#deletePptRecord (packages/sdk/src/services/channel.service.ts) | no |
| 上传伪直播互动脚本词条文本<br><sub>1、上传伪直播互动脚本精准发言文件</sub> | POST | `/live/v4/channel/interaction-script/upload-disk-video-custom-script` | query/form | channelId, diskVideoId, file | V4ChannelService#uploadDiskVideoCustomScript (packages/sdk/src/services/v4/channel.service.ts) | no |
| 上传文档到某个频道<br><sub>1、上传频道文档接口</sub> | POST | `/live/v3/channel/document/upload-doc` | query/form | channelId | ChannelService#uploadDoc (packages/sdk/src/services/channel.service.ts) | sdk: ChannelService#uploadDoc (packages/cli/src/services/document.service.sdk.ts:163) |
| 设置播放器片头广告<br><sub>1、接口用于设置某频道播放器的片头广告</sub> | POST | `/live/v2/channelAdvert/{param}/updateHead` | query/form | - | PlayerService#updateHeadAdvert (packages/sdk/src/services/player.service.ts) | no |
| 设置播放器暂停广告<br><sub>1、接口用于设置某频道播放器的暂停广告</sub> | POST | `/live/v2/channelAdvert/{param}/updateStop` | query/form | - | PlayerService#updateStopAdvert (packages/sdk/src/services/player.service.ts) | no |
| 设置播放器自定义url跑马灯<br><sub>1、通过接口可以设置播放器内容保护自定义url跑马灯开关，在开启时需提交url参数。</sub> | GET | `/live/v2/channelRestrict/{param}/set-diyurl-marquee` | query | marqueeRestrict, url | ChannelService#setDiyUrlMarquee (packages/sdk/src/services/channel.service.ts) | no |
| 设置播放器Logo<br><sub>1、修改播放器logo图片</sub> | POST | `/live/v2/channels/{param}/update` | query/form | logoImage, logoOpacity, logoPosition | ChannelService#updatePlayerLogo (packages/sdk/src/services/channel.service.ts) | no |
| 设置频道单点登录token<br><sub>1、设置频道单点登录的token</sub> | POST | `/live/v2/channels/{param}/set-token` | query/form | token | ChannelService#setChannelToken (packages/sdk/src/services/channel.service.ts) | no |
| 设置频道重制课件配置信息<br><sub>1、设置频道重制课件配置信息</sub> | POST | `/live/v3/channel/pptRecord/setting` | query/form | - | ChannelService#updatePptRecordSetting (packages/sdk/src/services/channel.service.ts) | no |
| 设置伪直播<br><sub>1、批量添加伪直播的视频，需预先将视频上传至点播系统或者视频来源于直播暂存录制</sub> | POST | `/live/v3/channel/stream/add-disk-videos` | query/form | channelId, vids | ChannelService#addDiskVideos (packages/sdk/src/services/channel.service.ts) | no |
| 设置伪直播<br><sub>1、批量添加伪直播的视频，需预先将视频上传至点播系统</sub> | POST | `/live/v3/channel/stream/add-disk-videos` | query/form | channelId, vids | ChannelService#addDiskVideos (packages/sdk/src/services/channel.service.ts) | no |
| 设置子频道单点登录token<br><sub>1、设置子频道单点登录的token</sub> | POST | `/live/v2/channels/{param}/set-account-token` | query/form | token | ChannelService#setAccountToken (packages/sdk/src/services/channel.service.ts) | no |
| 手动结束问卷<br><sub>1、手动结束问卷</sub> | POST | `/live/v3/channel/questionnaire/end` | query/form | channelIds | ChannelService#channelsStopQuestionnaire (packages/sdk/src/services/channel.service.ts) | no |
| 授权和连麦token<br><sub>1、获取授权和连麦的token</sub> | POST | `/live/v3/channel/common/get-chat-token` | query/form | channelId, role, userId | ChannelService#getChatToken (packages/sdk/src/services/channel.service.ts) | no |
| 添加频道商品<br><sub>1、添加频道商品库商品</sub> | POST | `/live/v3/channel/product/add` | json-body | channelId, linkType, name, status | ChannelService#addChannelProduct (packages/sdk/src/services/channel.service.ts) | sdk: ChannelService#addChannelProduct (packages/cli/src/services/product.service.sdk.ts:164)<br>sdk: ChannelService#addChannelProduct (packages/cli/src/setup/resource-handlers.ts:154) |
| 停止任务奖励活动<br><sub>1、提前结束正在进行中的任务奖励活动</sub> | GET | `/live/v4/channel/task-reward-activity/stop` | query | activityId | V4ChannelService#stopTaskRewardActivity (packages/sdk/src/services/v4/channel.service.ts) | no |
| 停止硬盘推流<br><sub>1、停止硬盘推流</sub> | POST | `/live/v3/channel/stream/end-disk-push` | query/form | channelId, diskVideoId | ChannelService#endDiskPush (packages/sdk/src/services/channel.service.ts) | no |
| 通过抽奖活动模板发起定时抽奖抽奖<br><sub>1、通过抽奖活动模板发起定时抽奖抽奖</sub> | POST | `/live/v4/channel/condition-lottery/create-wait-lottery` | json-body | channelId, id, lotteryTime | V4ChannelService#createConditionWaitLottery (packages/sdk/src/services/v4/channel.service.ts) | no |
| 通过上移下移修改频道商品库列表顺序<br><sub>1、修改商品库商品列表顺序</sub> | POST | `/live/v3/channel/product/sort` | query/form | channelId, productId, type | ChannelService#sortChannelProduct (packages/sdk/src/services/channel.service.ts) | no |
| 通过序号修改频道商品库列表顺序<br><sub>1、设置频道商品排序</sub> | POST | `/live/v4/channel/product/sort-rank` | query/form | channelId, productId, rank | V4ChannelService#sortChannelProductRank (packages/sdk/src/services/v4/channel.service.ts) | no |
| 同步转存录制文件到点播<br><sub>1、将直播录制文件转存至点播后台中</sub> | POST | `/live/v2/channel/recordFile/{param}/convert` | query/form | - | ChannelService#convertRecordFileToVod (packages/sdk/src/services/channel.service.ts) | no |
| 推送频道卡片<br><sub>1、推送频道卡片，对应新版后台的 营销-卡片</sub> | POST | `/live/v4/channel/card-push/push` | query/form | cardPushId, channelId | V4ChannelService#pushCardPushExact (packages/sdk/src/services/v4/channel.service.ts) | http: httpClient.post (packages/cli/src/services/card-push-service.ts:176) |
| 推送频道商品库商品<br><sub>1、推送频道商品库商品</sub> | POST | `/live/v3/channel/product/push-product` | query/form | channelId, productId | ChannelService#pushChannelProduct (packages/sdk/src/services/channel.service.ts) | no |
| 新建分组<br><sub>1、新建分组</sub> | POST | `/live/v4/channel/lottery-viewer-group/whitelist/create` | json-body | channelId, title | V4ChannelService#createLotteryViewerGroup (packages/sdk/src/services/v4/channel.service.ts) | no |
| 新增频道优惠券<br><sub>1、将平台优惠券添加到频道中</sub> | POST | `/live/v4/channel/coupon/create` | json-body | channelId, couponIds | V4ChannelService#addChannelCoupon (packages/sdk/src/services/v4/channel.service.ts) | no |
| 修改分组<br><sub>1、修改分组</sub> | POST | `/live/v4/channel/lottery-viewer-group/whitelist/update` | json-body | channelId, title | V4ChannelService#updateLotteryViewerGroup (packages/sdk/src/services/v4/channel.service.ts) | no |
| 修改回放视频名称<br><sub>1、修改频道视频库回放列表中某个视频的名称</sub> | POST | `/live/v3/channel/playback/update-title` | query/form | channelId, title, videoId | ChannelService#updatePlaybackTitle (packages/sdk/src/services/channel.service.ts) | no |
| 修改角色观众设置信息<br><sub>1、修改角色观众设置信息</sub> | POST | `/live/v4/channel/account/viewer/update` | json-body | channelId | V4ChannelService#updateAccountViewerConfig (packages/sdk/src/services/v4/channel.service.ts) | no |
| 修改角色信息<br><sub>1、修改助教或嘉宾的信息</sub> | POST | `/live/v4/channel/account/update` | json-body | account, channelId | V4ChannelService#updateAccountInfo (packages/sdk/src/services/v4/channel.service.ts) | no |
| 修改暖场设置开关<br><sub>1、通过频道号，修改暖场开关</sub> | POST | `/live/v3/channel/set-warmup-enabled` | query/form | channelId, warmUpEnabled | ChannelService#updateWarmupSwitch (packages/sdk/src/services/channel.service.ts) | no |
| 修改暖场视频<br><sub>1、通过频道号，修改播放器的暖场视频</sub> | POST | `/live/v2/channels/{param}/update` | query/form | warmUpFlv | ChannelService#updatePlayerLogo (packages/sdk/src/services/channel.service.ts) | no |
| 修改暖场图片<br><sub>1、通过频道号，修改播放器的暖场图片</sub> | POST | `/live/v2/channels/{param}/update` | query/form | coverImage | ChannelService#updatePlayerLogo (packages/sdk/src/services/channel.service.ts) | no |
| 修改频道关注公众号设置信息<br><sub>1、更新关注公众号设置接口</sub> | POST | `/live/v3/channel/promotion/update-channels-follow` | query/form | channelIds, qrCodeUrl | ChannelService#updateChannelsFollow (packages/sdk/src/services/channel.service.ts) | no |
| 修改频道观看人数限制<br><sub>1、设置频道最大观看在线人数</sub> | POST | `/live/v2/channelRestrict/{param}/set-max-viewer` | query/form | maxViewer, userId | ChannelService#setMaxViewer (packages/sdk/src/services/channel.service.ts) | no |
| 修改频道回调设置<br><sub>1、修改频道回调设置接口</sub> | POST | `/live/v3/channel/callback/update-setting` | query/form | channelId | ChannelService#updateCallbackSetting (packages/sdk/src/services/channel.service.ts) | no |
| 修改频道回放开关<br><sub>1、修改单个或全部频道的回放开关</sub> | POST | `/live/v2/channelSetting/{param}/setPlayBackEnabled` | query/form | playBackEnabled | ChannelService#setUserPlaybackEnabled (packages/sdk/src/services/channel.service.ts) | no |
| 修改频道回放设置<br><sub>1、修改频道回放设置</sub> | POST | `/live/v3/channel/playback/set-setting` | query/form | channelId | ChannelService#setPlaybackSetting (packages/sdk/src/services/channel.service.ts) | sdk: ChannelService#setPlaybackSetting (packages/cli/src/services/record.service.sdk.ts:106) |
| 修改频道角色权限设置<br><sub>1、修改频道角色权限设置</sub> | POST | `/live/v4/channel/role-config/update-by-role` | json-body | body, channelId, role | V4ChannelService#updateByRole (packages/sdk/src/services/v4/channel.service.ts) | no |
| 修改频道卡片推送<br><sub>1、修改频道卡片推送，对应新版后台的 营销-卡片</sub> | POST | `/live/v4/channel/card-push/update` | json-body | cardPushId, channelId | V4ChannelService#updateCardPushExact (packages/sdk/src/services/v4/channel.service.ts) | http: httpClient.post (packages/cli/src/services/card-push-service.ts:153) |
| 修改频道拉流码率<br><sub>1、修改频道拉流码率</sub> | POST | `/live/v4/channel/set-pull-bitrate` | query/form | channelId, pullBitRate | V4ChannelService#setPullBitrate (packages/sdk/src/services/v4/channel.service.ts) | no |
| 修改频道礼物打赏设置<br><sub>1、修改频道礼物打赏设置，礼物打赏又分为现金支付和积分支付</sub> | POST | `/live/v4/channel/donate/gift/update` | json-body | channelId, donateGiftEnabled | V4ChannelService#updateDonateGift (packages/sdk/src/services/v4/channel.service.ts) | no |
| 修改频道聊天室发言开关<br><sub>1、修改频道聊天室发言开关</sub> | POST | `/live/v4/channel/chat/update-chatEnabled` | json-body | channelIds, chatEnabled | V4ChannelService#batchUpdateChatEnabled (packages/sdk/src/services/v4/channel.service.ts) | no |
| 修改频道密码<br><sub>1、修改单个频道号的密码，或者修改账号下所有频道号的密码</sub> | POST | `/live/v2/channels/{param}/passwdSetting` | query/form | passwd | ChannelService#updateChannelPassword (packages/sdk/src/services/channel.service.ts) | no |
| 修改频道商品库开关状态<br><sub>1、修改频道商品库开关状态，如果没有开启商品库权限请联系客服</sub> | POST | `/live/v3/channel/product/update-enabled` | query/form | channelId, enabled | ChannelService#updateChannelProductEnabled (packages/sdk/src/services/channel.service.ts) | sdk: ChannelService#updateChannelProductEnabled (packages/cli/src/setup/resource-handlers.ts:199) |
| 修改频道商品库上下架状态<br><sub>1、修改频道商品库商品上下架状态</sub> | POST | `/live/v3/channel/product/shelf` | query/form | channelId, productId | ChannelService#shelfChannelProduct (packages/sdk/src/services/channel.service.ts) | no |
| 修改频道商品配置<br><sub>1、修改频道商品配置</sub> | POST | `/live/v4/channel/product/push/rule` | json-body | channelId | V4ChannelService#updateProductPushRule (packages/sdk/src/services/v4/channel.service.ts) | no |
| 修改频道商品信息<br><sub>1、编辑频道商品库商品信息</sub> | POST | `/live/v3/channel/product/update` | json-body | channelId, linkType, name, productId, status | ChannelService#updateChannelProduct (packages/sdk/src/services/channel.service.ts) | sdk: ChannelService#updateChannelProduct (packages/cli/src/services/product.service.sdk.ts:220) |
| 修改频道设置<br><sub>1、修改频道设置</sub> | POST | `/live/v4/channel/update` | json-body | channelId | V4ChannelService#update (packages/sdk/src/services/v4/channel.service.ts) | no |
| 修改频道推流方式<br><sub>1、修改频道的直播推流方式</sub> | POST | `/live/v3/channel/stream/update` | query/form | channelId, streamType | ChannelService#updateStreamType (packages/sdk/src/services/channel.service.ts) | no |
| 修改频道微信分享信息(新版)<br><sub>1、修改频道微信分享信息，对应新版后台的 营销-分享设置</sub> | GET | `/live/v4/channel/share/update` | query | channelId, shareBtnEnable, titleType | V4ChannelService#updateShareExact (packages/sdk/src/services/v4/channel.service.ts) | no |
| 修改频道信息<br><sub>1、修改频道的相关设置</sub> | POST | `/live/v3/channel/basic/update` | json-body | channelId, enabled, rank | ChannelService#updateChannel (packages/sdk/src/services/channel.service.ts) | sdk: ChannelService#updateChannel (packages/cli/src/services/channel.service.sdk.ts:168) |
| 修改频道优惠券开关状态<br><sub>1、修改频道优惠券开关状态</sub> | POST | `/live/v4/channel/coupon/update-enabled` | json-body | channelId, enabled | V4ChannelService#updateCouponEnabled (packages/sdk/src/services/v4/channel.service.ts) | no |
| 修改频道直播模版<br><sub>1、修改频道直播模板信息</sub> | POST | `/live/v4/channel/update-template` | query/form | channelId, template | V4ChannelService#updateTemplate (packages/sdk/src/services/v4/channel.service.ts) | no |
| 修改频道装修设置<br><sub>1、修改频道的页面装修设置，建议将 查询频道的页面装修设置 接口的返回值进行修改作为入参调用该接口</sub> | POST | `/live/v4/channel/decorate/update` | json-body | channelId | PlayerService#updateChannelDecorate (packages/sdk/src/services/player.service.ts) | sdk: PlayerService#updateChannelDecorate (packages/cli/src/services/player.service.sdk.ts:129) |
| 修改频道状态为禁止直播<br><sub>1、禁止频道的直播推流，禁止有效期为24小时，24小时后会恢复频道推流</sub> | POST | `/live/v2/stream/{param}/cutoff` | query/form | userId | ChannelService#banPush (packages/sdk/src/services/channel.service.ts) | no |
| 修改频道状态为可直播<br><sub>1、恢复频道的直播推流</sub> | POST | `/live/v2/stream/{param}/resume` | query/form | - | ChannelService#resume (packages/sdk/src/services/channel.service.ts) | no |
| 修改频道状态为无直播<br><sub>1、修改频道直播状态为无直播</sub> | POST | `/live/v2/channels/{param}/end` | query/form | - | ChannelService#setStatusEnd (packages/sdk/src/services/channel.service.ts) | sdk: ChannelService#setStatusEnd (packages/cli/src/services/stream.service.sdk.ts:156) |
| 修改频道状态为直播中<br><sub>1、修改频道直播状态为直播中</sub> | POST | `/live/v2/channels/{param}/live` | query/form | - | ChannelService#setStatusStart (packages/sdk/src/services/channel.service.ts) | sdk: ChannelService#setStatusStart (packages/cli/src/services/stream.service.sdk.ts:118) |
| 修改频道字幕配置信息<br><sub>1、修改频道字幕配置信息</sub> | POST | `/live/v4/channel/subtitle/config/update` | json-body | channelId | V4ChannelService#updateSubtitleConfig (packages/sdk/src/services/v4/channel.service.ts) | no |
| 修改任务奖励活动<br><sub>1、修改任务奖励活动</sub> | POST | `/live/v4/channel/task-reward-activity/update` | json-body | activityId, channelId, tasks | V4ChannelService#updateTaskRewardActivity (packages/sdk/src/services/v4/channel.service.ts) | no |
| 修改视频库单个视频的上移、下移（包括点播列表和回放列表）<br><sub>1、修改视频库单个视频的上移、下移（包括点播列表和回放列表）</sub> | POST | `/live/v3/channel/playback/single-sort` | query/form | - | ChannelService#movePlaybackVideo (packages/sdk/src/services/channel.service.ts) | no |
| 修改视频库的默认视频<br><sub>1、将回放列表中的某个视频设置为默认回放视频</sub> | POST | `/live/v2/channel/recordFile/{param}/playback/set-Default` | query/form | - | ChannelService#setDefaultPlaybackVideo (packages/sdk/src/services/channel.service.ts) | no |
| 修改视频库的视频排序<br><sub>1、修改视频库回放列表的视频排序</sub> | POST | `/live/v3/channel/playback/sort` | json-body | - | ChannelService#sortPlaybackVideos (packages/sdk/src/services/channel.service.ts) | no |
| 修改云分发频道总开关<br><sub>1、修改单个频道云分发总开关，该功能需要超管开通才生效</sub> | POST | `/live/v4/channel/distribute/update-master-switch` | query/form | channelId | V4ChannelService#updateMasterSwitch (packages/sdk/src/services/v4/channel.service.ts) | no |
| 引用平台商品到频道商品<br><sub>1、将平台商品引用到指定频道（支持是否同步平台商品标签）</sub> | POST | `/live/v3/channel/product/reference` | json-body | channelId, originId, status | ChannelService#referenceProduct (packages/sdk/src/services/channel.service.ts) | no |
| 暂存视频的字幕文件批量发布<br><sub>1、用于批量设置暂存视频字幕文件的发布状态，控制字幕在观看页是否显示</sub> | POST | `/live/v4/channel/record-file/subtitle/batch-publish` | query/form | subtitles, subtitles[].id, subtitles[].status | V4ChannelService#batchPublishRecordFileSubtitles (packages/sdk/src/services/v4/channel.service.ts) | no |
| 直播场次关联自定义ID<br><sub>1、将直播场次关联自定义的直播场次UUID，关联频道之后开播的场次、以及这些开播场次衍生出来的裁剪和合并视频</sub> | POST | `/live/v3/channel/session/relevance` | query/form | channelId, externalSessionId | ChannelService#relevanceSession (packages/sdk/src/services/channel.service.ts) | no |
| 置顶频道商品<br><sub>1、将指定频道商品置顶</sub> | POST | `/live/v4/channel/product/topping` | json-body | channelId, productId | V4ChannelService#toppingChannelProduct (packages/sdk/src/services/v4/channel.service.ts) | no |
| v4/channel/lottery_viewer/group_create_viewer_name<br><sub>1、分组添加观众支持传昵称</sub> | POST | `/live/v4/channel/lottery-viewer-list/create-viewer-name` | json-body | channelId, groupId, viewerNames | V4ChannelService#createLotteryGroupViewerNames (packages/sdk/src/services/v4/channel.service.ts) | no |
| v4/channel/recordfile/get_record_file_outline<br><sub>- 根据频道ID与暂存文件ID查询AI大纲与答题内容（若已生成）</sub> | GET | `/live/v4/channel/record-file/subtitle/outline/get-by-fileId` | query | channelId, fileId | V4ChannelService#getRecordFileOutline (packages/sdk/src/services/v4/channel.service.ts) | no |

### chat - 聊天

| 功能/用途 | Method | Path | 请求形态 | 业务必填参数 | SDK 实现 | CLI 使用 |
| --- | --- | --- | --- | --- | --- | --- |
| （可隐藏）发送图文信息<br><sub>1、通过聊天室API，发送图文信息</sub> | POST | `/live/v1/channelSetting/{param}/send-chat` | query/form | content/imgUrl, userId | ChatService#sendChat (packages/sdk/src/services/chat.service.ts) | no |
| （可隐藏）以管理员身份发送信息<br><sub>1、通过管理员，发送聊天消息</sub> | POST | `/live/v3/channel/chat/send` | query/form | channelId, content, role | ChatService#sendHiddenByAdmin (packages/sdk/src/services/chat.service.ts) | no |
| 查询管理员身份信息<br><sub>1、通过频道号，查询管理员身份信息</sub> | GET | `/live/v2/channelSetting/{param}/get-chat-admin` | query | - | ChatService#getAdminInfo (packages/sdk/src/services/chat.service.ts) | no |
| 查询聊天室在线人数<br><sub>1、通过频道号，查询频道聊天室当前在线人数</sub> | GET | `/live/v3/channel/chat/count-online-user` | query | channelId | ChatService#countOnlineUser (packages/sdk/src/services/chat.service.ts) | no |
| 查询频道公告列表<br><sub>1、查询频道公告列表</sub> | GET | `/live/v4/chat/list-bullentin` | query | channelId, pageNumber, pageSize | V4ChatService#listBulletins (packages/sdk/src/services/v4/chat.service.ts) | no |
| 查询频道禁言用户Userid/IP<br><sub>1、通过频道号，查询禁言的用户列表或者ip列表</sub> | GET | `/live/v3/channel/chat/get-banned-list` | query | channelId, type | ChatService#getChannelBannedUserList (packages/sdk/src/services/chat.service.ts) | sdk: ChatService#getChannelBannedUserList (packages/cli/src/services/chat.service.sdk.ts:207) |
| 查询频道聊天记录<br><sub>1、通过频道号，查询一段时间内的聊天记录</sub> | GET | `/live/v3/channel/chat/get-history-page` | query | channelId, endDay, startDay | ChatService#getHistoryPage (packages/sdk/src/services/chat.service.ts) | sdk: ChatService#getHistoryPage (packages/cli/src/services/chat.service.sdk.ts:94) |
| 查询频道踢人列表<br><sub>1、通过频道号，查询踢人列表</sub> | POST | `/live/v3/channel/chat/list-kicked` | query/form | channelId | ChatService#getChannelKickedUserList (packages/sdk/src/services/chat.service.ts) | sdk: ChatService#getChannelKickedUserList (packages/cli/src/services/chat.service.sdk.ts:236) |
| 查询频道问答列表<br><sub>1、查询频道问答列表</sub> | GET | `/live/v4/chat/list-qa` | query | channelId, pageNumber, pageSize | V4ChatService#listQa (packages/sdk/src/services/v4/chat.service.ts) | no |
| 查询频道虚拟人数设置<br><sub>1、查询频道的虚拟人数设置</sub> | GET | `/live/v4/channel/robot/setting/get` | query | channelId | V4ChatService#getRobotSetting (packages/sdk/src/services/v4/chat.service.ts) | no |
| 查询频道虚拟人数详情<br><sub>1、查询虚拟人数统计情况</sub> | GET | `/live/v4/channel/robot/stats/get` | query | channelId | V4RobotService#getRobotStats (packages/sdk/src/services/v4/robot.service.ts) | no |
| 查询频道严禁词/禁言ip<br><sub>1、通过频道号，查询严禁词或者禁言ip列表</sub> | GET | `/live/v3/channel/badword/list` | query | channelId | ChatService#getChannelBannedList (packages/sdk/src/services/chat.service.ts) | sdk: ChatService#getChannelBannedList (packages/cli/src/services/chat.service.sdk.ts:226) |
| 查询所有聊天记录<br><sub>1、查询账号下频道聊天记录</sub> | GET | `/live/v3/user/chat/get-speak-list` | query | - | ChatService#getSpeakList (packages/sdk/src/services/chat.service.ts) | no |
| 查询账号禁言列表<br><sub>1、通过账号下的禁言列表</sub> | GET | `/live/v3/user/chat/banned-user/list` | query | - | ChatService#getUserBannedList (packages/sdk/src/services/chat.service.ts) | no |
| 查询账号严禁词<br><sub>1、查询账号下通用设置的严禁词列表</sub> | GET | `/live/v3/user/badword/list` | query | - | ChatService#getUserBadwordList (packages/sdk/src/services/chat.service.ts) | no |
| 发布公告<br><sub>1、发布频道公告</sub> | POST | `/live/v4/chat/add-bullentin` | query/form | channelId, content | V4ChatService#addBulletin (packages/sdk/src/services/v4/chat.service.ts) | no |
| 发送开播端弹窗消息<br><sub>1、用于直播中，给开播讲师以弹窗形式发送特定消息的能力（当前仅支持给讲师触发）</sub> | POST | `/live/v4/chat/alert-to-special` | query/form | channelId, message, title | ChatService#alertToSpecial (packages/sdk/src/services/chat.service.ts) | no |
| 发送审核通过的聊天消息<br><sub>1、发送审核通过的聊天消息</sub> | POST | `/live/v4/chat/message/audit` | json-body | channelId, content, msgId, nickName, viewerId | ChatService#messageAudit (packages/sdk/src/services/chat.service.ts) | no |
| 发送自定义消息<br><sub>1、发送聊天室自定义消息</sub> | GET | `/live/v4/chat/send-custom-message` | query | channelId | V4ChatService#sendCustomMessage (packages/sdk/src/services/v4/chat.service.ts) | no |
| 发送自定义消息<br><sub>1、发送聊天室自定义消息</sub> | POST | `/live/v4/chat/send-custom-message/encode` | query/form | channelId | V4ChatService#sendCustomMessageEncode (packages/sdk/src/services/v4/chat.service.ts) | no |
| 根据用户ID进行广播消息<br><sub>根据用户ID列表向指定频道内的用户广播消息</sub> | POST | `/live/v5/chat/redirect/channel/emit-by-userId/post` | json-body | payload, roomId, userIds | OtherService#emitByUserId (packages/sdk/src/services/other.service.ts) | no |
| 更新聊天审核开关<br><sub>1、更新聊天审核开关</sub> | POST | `/live/v3/channel/chat/update-censor-enabled` | query/form | channelId | ChatService#updateCensorEnabled (packages/sdk/src/services/chat.service.ts) | no |
| 管理员发送聊天信息<br><sub>1、通过HTTP接口发送聊天文本内容，可指定发言者的头像、头衔、昵称，无需连接聊天室</sub> | POST | `/live/v3/channel/chat/send-admin-msg` | query/form | apiVersion, channelId, nickName, pic | ChatService#sendAdminMsg (packages/sdk/src/services/chat.service.ts) | sdk: ChatService#sendAdminMsg (packages/cli/src/services/chat.service.sdk.ts:68) |
| 获取讲师信息<br><sub>1、获取讲师信息</sub> | GET | `/live/v3/channel/account/getTeacher` | query | channelId | ChatService#getTeacherInfo (packages/sdk/src/services/chat.service.ts) | no |
| 获取聊天室在线列表<br><sub>1、通过频道号，获取聊天室在线列表</sub> | GET | `/front/userlistExternal` | query | roomId | ChatService#getUserList (packages/sdk/src/services/chat.service.ts) | no |
| 禁言/解禁用户<br><sub>1、通过登录聊天室的userId，禁言或者解禁用户</sub> | POST | `/live/v3/channel/chat/banned-user` | query/form | channelId, userIds | ChatService#updateBannedUser (packages/sdk/src/services/chat.service.ts) | sdk: ChatService#updateBannedUser (packages/cli/src/services/chat.service.sdk.ts:128) |
| 禁言IP<br><sub>1、修改聊天室禁言ip</sub> | POST | `/live/v2/chat/{param}/addBannedIP` | query/form | ip | ChatService#addBannedIp (packages/sdk/src/services/chat.service.ts) | no |
| 批量导入严禁词<br><sub>1、批量导入频道或者通用的严禁词</sub> | POST | `/live/v2/chat/{param}/addBadWords` | query/form | words | ChatService#addBadwords (packages/sdk/src/services/chat.service.ts) | no |
| 批量设置签到功能<br><sub>1、批量设置签到功能</sub> | POST | `/live/v4/chat/batch-checkin` | json-body | channelId | V4ChatService#batchCheckin (packages/sdk/src/services/v4/chat.service.ts) | sdk: V4ChatService#batchCheckin (packages/cli/src/services/checkin-service.ts:71) |
| 频道内取消踢人<br><sub>1、通过登录聊天室的userId，频道内取消踢出用户</sub> | POST | `/live/v4/chat/channel/forbid/unkick-users` | json-body | channelId, nickNames, viewerIds | ChatService#forbidChannelUnkickUsers (packages/sdk/src/services/chat.service.ts) | sdk: ChatService#forbidChannelUnkickUsers (packages/cli/src/services/chat.service.sdk.ts:181) |
| 频道内踢人<br><sub>1、通过登录聊天室的userId，频道内踢出用户</sub> | POST | `/live/v4/chat/channel/forbid/kick-users` | json-body | channelId, nickNames, viewerIds | ChatService#forbidChannelKickUsers (packages/sdk/src/services/chat.service.ts) | sdk: ChatService#forbidChannelKickUsers (packages/cli/src/services/chat.service.sdk.ts:155) |
| 清空频道公告信息<br><sub>1、清空频道公告信息</sub> | POST | `/live/v4/chat/notice/clean` | query/form | channelId | V4ChatService#cleanNotices (packages/sdk/src/services/v4/chat.service.ts) | no |
| 清空频道聊天记录<br><sub>1、通过频道号，删除全部聊天记录</sub> | GET | `/live/v2/chat/{param}/cleanChat` | query | - | ChatService#cleanChat (packages/sdk/src/services/chat.service.ts) | sdk: ChatService#cleanChat (packages/cli/src/services/chat.service.sdk.ts:110) |
| 全平台封禁用户列表<br><sub>1、全平台（账号下）封禁的聊天室用户列表（包括禁言、踢人等）</sub> | GET | `/live/v4/chat/forbid/list` | query | - | ChatService#getForbidUserList (packages/sdk/src/services/chat.service.ts) | no |
| 全平台取消踢人<br><sub>1、通过登录聊天室的userId，取消踢出用户</sub> | POST | `/live/v4/chat/forbid/unkick-users` | json-body | nickNames, viewerIds | ChatService#forbidUnkickUsers (packages/sdk/src/services/chat.service.ts) | sdk: ChatService#forbidUnkickUsers (packages/cli/src/services/chat.service.sdk.ts:194) |
| 全平台踢人<br><sub>1、通过登录聊天室的userId，踢出用户</sub> | POST | `/live/v4/chat/forbid/kick-users` | json-body | nickNames, viewerIds | ChatService#forbidKickUsers (packages/sdk/src/services/chat.service.ts) | sdk: ChatService#forbidKickUsers (packages/cli/src/services/chat.service.sdk.ts:168) |
| 删除频道单条聊天记录<br><sub>1、通过聊天id，删除聊天记录</sub> | POST | `/live/v2/chat/{param}/delChat` | query/form | id | ChatService#delChat (packages/sdk/src/services/chat.service.ts) | sdk: ChatService#delChat (packages/cli/src/services/chat.service.sdk.ts:114) |
| 删除频道严禁词/禁言ip<br><sub>1、取消被禁言的ip或者删除严禁词</sub> | POST | `/live/v2/chat/{param}/delBanned` | query/form | content, type | ChatService#deleteChannelBanned (packages/sdk/src/services/chat.service.ts) | no |
| 删除账号严禁词<br><sub>1、删除账号通用设置的严禁词，支持批量删除多个严禁词</sub> | POST | `/live/v3/user/badword/delete` | query/form | words | ChatService#deleteUserBadword (packages/sdk/src/services/chat.service.ts) | no |
| 设置频道虚拟人数<br><sub>1、设置频道虚拟人数</sub> | POST | `/live/v4/channel/robot/setting/update` | query/form | addRobotModel, channelId, robotNumber | V4RobotService#updateRobotSetting (packages/sdk/src/services/v4/robot.service.ts) | no |
| 设置频道虚拟人数及虚拟人<br><sub>1、设置频道虚拟人数及自定义虚拟人列表</sub> | POST | `/live/v4/channel/robot/setting-robot-list/update` | json-body | addRobotModel, channelId, robotNumber | V4ChatService#updateRobotListSetting (packages/sdk/src/services/v4/chat.service.ts) | no |
| 停止频道虚拟人数<br><sub>1、设置虚拟人数分时生效后停止虚拟人数增加</sub> | POST | `/live/v4/channel/robot/pause` | query/form | channelId | V4RobotService#pauseRobot (packages/sdk/src/services/v4/robot.service.ts) | no |
| 修改管理员身份信息<br><sub>1、通过频道号，修改管理员信息，提交参数都不能为空</sub> | POST | `/live/v2/channelSetting/{param}/set-chat-admin` | query/form | actor, avatar, nickname | ChatService#updateAdminInfo (packages/sdk/src/services/chat.service.ts) | no |
| 修改讲师身份信息<br><sub>1、通过频道号，修改讲师的相关信息</sub> | POST | `/live/v3/channel/account/updateTeacher` | query/form | channelId | ChatService#updateTeacherInfo (packages/sdk/src/services/chat.service.ts) | no |
| 账号设置禁言/解禁用户<br><sub>1、通过登录聊天室的userId，禁言或者解禁用户</sub> | POST | `/live/v3/user/chat/banned-user/update` | query/form | banned, viewerIds | ChatService#updateBannedViewer (packages/sdk/src/services/chat.service.ts) | sdk: ChatService#updateBannedViewer (packages/cli/src/services/chat.service.sdk.ts:142) |

### finance - 财务与审核

| 功能/用途 | Method | Path | 请求形态 | 业务必填参数 | SDK 实现 | CLI 使用 |
| --- | --- | --- | --- | --- | --- | --- |
| 查询频道视频审核记录列表<br><sub>1、查询频道场次审核记录列表</sub> | GET | `/live/v4/channel/video-moderation/result/list` | query | channelId | FinanceService#listVideoModerationResults (packages/sdk/src/services/finance.service.ts) | no |
| 查询频道视频审核设置（需开通）<br><sub>1、查询频道视频审核设置</sub> | GET | `/live/v4/channel/video-moderation/get` | query | channelId | FinanceService#getVideoModerationSettings (packages/sdk/src/services/finance.service.ts) | no |
| 查询频道音频审核记录<br><sub>1、 查询频道音频审核记录</sub> | GET | `/live/v4/channel/audio-moderation/list` | query | channelId | FinanceService#listAudioModerationRecords (packages/sdk/src/services/finance.service.ts) | no |
| 查询频道音频审核设置（需开通）<br><sub>1、查询频道音频审核设置</sub> | GET | `/live/v4/channel/audio-moderation/get` | query | channelId | FinanceService#getAudioModerationSettings (packages/sdk/src/services/finance.service.ts) | no |
| 查询用户账单详情数据<br><sub>1、查询用户账单详情数据</sub> | GET | `/live/v3/finance/bill/detail` | query | endDate, itemCategory, startDate | FinanceService#listBillDetails (packages/sdk/src/services/finance.service.ts) | no |
| 更新频道视频审核设置（需开通）<br><sub>1、更新频道视频审核设置</sub> | POST | `/live/v4/channel/video-moderation/update` | json-body | channelId, illegalNotify, imageFrequency, moderationEnabled, moderationStrategy | FinanceService#updateVideoModerationSettings (packages/sdk/src/services/finance.service.ts) | no |
| 修改频道音频审核设置<br><sub>1、 更新频道音频审核设置</sub> | POST | `/live/v4/channel/audio-moderation/update` | json-body | channelId | FinanceService#updateAudioModerationSettings (packages/sdk/src/services/finance.service.ts) | no |

### global - 全局设置

| 功能/用途 | Method | Path | 请求形态 | 业务必填参数 | SDK 实现 | CLI 使用 |
| --- | --- | --- | --- | --- | --- | --- |
| 查询观看页默认模板设置<br><sub>1、查询观看页默认模板设置</sub> | GET | `/live/v4/user/template/page-setting/get` | query | - | V4GlobalService#getPageSetting (packages/sdk/src/services/v4/global.service.ts) | no |
| 查询默认模板-观看条件<br><sub>1、查询默认模板-观看条件</sub> | GET | `/live/v4/global/auth/get` | query | - | V4GlobalService#getAuth (packages/sdk/src/services/v4/global.service.ts) | no |
| 修改观看页默认模板设置<br><sub>1、修改观看页默认模板设置</sub> | POST | `/live/v4/user/template/page-setting/update` | query/form | - | V4GlobalService#updatePageSetting (packages/sdk/src/services/v4/global.service.ts) | no |
| 修改默认模板-观看条件<br><sub>1、修改默认模板-观看条件</sub> | POST | `/live/v4/global/auth/update` | json-body | authEnabled, authType | V4GlobalService#updateAuth (packages/sdk/src/services/v4/global.service.ts) | no |

### group - 组织与套餐

| 功能/用途 | Method | Path | 请求形态 | 业务必填参数 | SDK 实现 | CLI 使用 |
| --- | --- | --- | --- | --- | --- | --- |
| 查询分账号的分配记录-集团账号1.0<br><sub>1、查询集团账号给分账号的分配记录</sub> | GET | `/v2/group/account/list-allocate-log` | query | emails | GroupService#listAllocateLog (packages/sdk/src/services/group.service.ts) | no |
| 查询分账号列表及剩余资源<br><sub>1、集团账号查询分账号列表及分账号剩余资源</sub> | GET | `/live/v4/group/user/package/list` | query | - | V4GroupService#listGroupUserPackages (packages/sdk/src/services/v4/group.service.ts) | no |
| 查询分账号账单统计列表<br><sub>1、集团账号查询分账号账单统计列表</sub> | GET | `/live/v4/group/user/billing-daily/list` | query | endDate, startDate | V4GroupService#listGroupUserBillingDaily (packages/sdk/src/services/v4/group.service.ts) | no |
| 查询主账号账单统计<br><sub>1、集团账号查询主账号账单</sub> | GET | `/live/v4/group/account/billing-daily/list` | query | billingDate | V4GroupService#listBillingDaily (packages/sdk/src/services/v4/group.service.ts) | no |
| 创建集团分帐号<br><sub>1、创建集团分帐号</sub> | POST | `/live/v4/group/user/create` | json-body | contacts, email, maxChannels, password, phone | V4GroupService#createGroupUser (packages/sdk/src/services/v4/group.service.ts) | no |
| 分配分帐号资源<br><sub>1、分配分帐号资源</sub> | POST | `/live/v4/group/user/package/update` | json-body | email | V4GroupService#updateGroupUserPackage (packages/sdk/src/services/v4/group.service.ts) | no |
| 分配分账号空间接口-集团账号1.0<br><sub>1、集团账号给分账号分配或回收空间接口</sub> | POST | `/v2/group/vod/set-space` | query/form | email | GroupService#setSpace (packages/sdk/src/services/group.service.ts) | no |
| 分配分账号流量接口-集团账号1.0<br><sub>1、集团账号给分账号分配或回收流量接口</sub> | POST | `/v2/group/vod/set-flow` | query/form | email | GroupService#setFlow (packages/sdk/src/services/group.service.ts) | no |
| 分配直播并发数接口-集团账号1.0<br><sub>1、接口用于分配直播的并发数</sub> | POST | `/v2/group/live/set-concurrences` | query/form | email | GroupService#setConcurrences (packages/sdk/src/services/group.service.ts) | no |
| 分配直播分钟数接口-集团账号1.0<br><sub>1、接口用于分配直播的分钟数</sub> | POST | `/v2/group/live/set-durations` | query/form | duration, email | GroupService#setLiveDurations (packages/sdk/src/services/group.service.ts) | no |
| 获取分配记录<br><sub>1、集团账号给分账号分配资源之后，能够通过接口获取分账号的资源</sub> | GET | `/live/v4/group/account/allocation-log/list` | json-body | - | V4GroupService#listAllocationLogs (packages/sdk/src/services/v4/group.service.ts) | no |

### live_interaction - 直播互动

| 功能/用途 | Method | Path | 请求形态 | 业务必填参数 | SDK 实现 | CLI 使用 |
| --- | --- | --- | --- | --- | --- | --- |
| 查询多个频道抽奖记录<br><sub>1、获取一段时间内的多个直播频道发起抽奖记录列表</sub> | GET | `/live/v3/channel/lottery/list-channels-lottery` | query | channelIds, endTime, startTime | LiveInteractionService#listChannelsLottery (packages/sdk/src/services/live-interaction.service.ts) | no |
| 查询频道抽奖记录(旧版)<br><sub>1、获取一段时间内的直播频道抽奖记录列表</sub> | GET | `/live/v3/channel/lottery/list-lottery` | query | channelId, endTime, startTime | LiveInteractionService#listLottery (packages/sdk/src/services/live-interaction.service.ts) | sdk: LiveInteractionService#listLottery (packages/cli/src/services/lottery-service.ts:132) |
| 查询频道答题卡发送时间列表<br><sub>1、获取频道的答题卡发送时间列表</sub> | GET | `/live/v3/channel/interact/question/list-send-time` | query | channelId | LiveInteractionService#listQuestionSendTime (packages/sdk/src/services/live-interaction.service.ts) | no |
| 查询频道答题卡结果<br><sub>1、通过频道号，查询答题卡答题结果列表</sub> | GET | `/live/v3/channel/question/answer-records` | query | channelId | LiveInteractionService#getAnswerList (packages/sdk/src/services/live-interaction.service.ts) | no |
| 查询频道答题卡列表<br><sub>1、获取频道的答题卡列表</sub> | GET | `/live/v3/channel/interact/question/list-question` | query | channelId | LiveInteractionService#listQuestion (packages/sdk/src/services/live-interaction.service.ts) | sdk: LiveInteractionService#listQuestion (packages/cli/src/services/qa-questionnaire-service.ts:67) |
| 查询频道发起的签到记录<br><sub>1、通过直播场次id，查询签到发起记录</sub> | GET | `/live/v3/channel/chat/checkin-by-sessionId` | query | channelId, sessionId | LiveInteractionService#getCheckinBySessionId (packages/sdk/src/services/live-interaction.service.ts) | no |
| 查询频道签到成功记录<br><sub>1、查询频道号下，某天或某场直播的签到记录（仅返回已签到记录）</sub> | GET | `/live/v3/channel/checkin/list` | query | channelId | LiveInteractionService#getCheckinList (packages/sdk/src/services/live-interaction.service.ts) | sdk: LiveInteractionService#getCheckinList (packages/cli/src/services/checkin-service.ts:85) |
| 查询频道提问记录<br><sub>1、通过频道号，查询咨询提问记录</sub> | GET | `/live/v2/chat/{param}/getQuestion` | query | - | LiveInteractionService#getQuestionList (packages/sdk/src/services/live-interaction.service.ts) | no |
| 查询频道问卷结果<br><sub>1、查询直播问卷的答题结果及统计</sub> | GET | `/live/v3/channel/questionnaire/answer-records` | query | channelId | LiveInteractionService#getQuestionnaireResult (packages/sdk/src/services/live-interaction.service.ts) | no |
| 查询频道问卷列表<br><sub>1、获取频道的问卷列表</sub> | GET | `/live/v3/channel/questionnaire/list` | query | channelId | LiveInteractionService#listQuestionnaire (packages/sdk/src/services/live-interaction.service.ts) | no |
| 查询频道问卷题目与结果<br><sub>1、查询频道问卷题目与结果</sub> | GET | `/live/v3/channel/questionnaire/detail` | query | channelId, questionnaireId | LiveInteractionService#getQuestionnaireDetail (packages/sdk/src/services/live-interaction.service.ts) | sdk: LiveInteractionService#getQuestionnaireDetail (packages/cli/src/services/qa-questionnaire-service.ts:151) |
| 查询频道指定时间范围内发起的签到记录<br><sub>1、通过指定时间范围查询签到发起记录</sub> | GET | `/live/v3/channel/chat/get-checkin-list` | query | channelId, endDate, startDate | LiveInteractionService#getCheckinByTime (packages/sdk/src/services/live-interaction.service.ts) | sdk: LiveInteractionService#getCheckinByTime (packages/cli/src/services/checkin-service.ts:122) |
| 查询频道中奖记录<br><sub>1、通过抽奖ID获取频道的单场抽奖的中奖用户列表</sub> | GET | `/live/v3/channel/lottery/get-winner-detail` | query | channelId, lotteryId | LiveInteractionService#getWinnerDetail (packages/sdk/src/services/live-interaction.service.ts) | sdk: LiveInteractionService#getWinnerDetail (packages/cli/src/services/lottery-service.ts:118) |
| 查询学员提问客户回调地址<br><sub>> 查询当前账号已配置的「学员提问」客户回调 URL；若从未配置或已删除，则 data.callbackUrl 为空字符串。</sub> | GET | `/live/v5/chat/redirect/channel/student-question-webhook/get` | query | - | LiveInteractionService#getStudentQuestionWebhook (packages/sdk/src/services/live-interaction.service.ts) | no |
| 发送答题卡<br><sub>1、发送答题卡</sub> | POST | `/live/v4/channel/question/send` | query/form | channelId, questionId | LiveInteractionService#sendQuestion (packages/sdk/src/services/live-interaction.service.ts) | sdk: LiveInteractionService#sendQuestion (packages/cli/src/services/qa-questionnaire-service.ts:49) |
| 发送答题卡结果<br><sub>1、发送答题卡结果</sub> | POST | `/live/v4/channel/question/send-result` | query/form | channelId, questionId | LiveInteractionService#sendQuestionResult (packages/sdk/src/services/live-interaction.service.ts) | no |
| 发送打赏消息<br><sub>1、发送打赏消息</sub> | POST | `/live/v3/channel/chat/send-reward-msg` | query/form | avatar, channelId, content, donateType, nickname, viewerId | LiveInteractionService#sendRewardMsg (packages/sdk/src/services/live-interaction.service.ts) | no |
| 发送点赞<br><sub>1、实现用户自开发观看页点赞效果，通过调用接口可以进行点赞，默认每次请求都是一次点赞</sub> | POST | `/live/v2/channels/{param}/like` | query/form | viewerId | LiveInteractionService#sendFavor (packages/sdk/src/services/live-interaction.service.ts) | no |
| 分页查询频道问卷结果<br><sub>1、分页查询频道问卷结果</sub> | GET | `/live/v3/channel/questionnaire/list-answer-records` | query | channelId | LiveInteractionService#listQuestionnaireByPage (packages/sdk/src/services/live-interaction.service.ts) | sdk: LiveInteractionService#listQuestionnaireByPage (packages/cli/src/services/qa-questionnaire-service.ts:130) |
| 根据签到ID查询所有签到记录<br><sub>1、通过签到id查询签到记录（包括已签到与未签到记录）</sub> | GET | `/live/v3/channel/chat/get-checkins` | query | channelId, checkinId | LiveInteractionService#getCheckinByCheckinId (packages/sdk/src/services/live-interaction.service.ts) | sdk: LiveInteractionService#getCheckinByCheckinId (packages/cli/src/services/checkin-service.ts:105) |
| 讲师通过 HTTP 回复学员提问<br><sub>> 由业务服务端调用，在指定频道内以讲师身份回复某位观众的「提问私聊」记录；</sub> | POST | `/live/v5/chat/redirect/channel/teacher-answer/post` | json-body | content, roomId, viewerUserId | LiveInteractionService#sendTeacherAnswer (packages/sdk/src/services/live-interaction.service.ts) | no |
| 配置学员提问客户回调地址<br><sub>> 按账号维度保存或更新「学员提问」成功后，服务端异步 POST 通知的客户地址（Webhook URL）。</sub> | POST | `/live/v5/chat/redirect/channel/student-question-webhook/post` | json-body | callbackUrl, roomId | LiveInteractionService#setStudentQuestionWebhook (packages/sdk/src/services/live-interaction.service.ts) | no |
| 批量创建问卷（支持多频道同时创建）<br><sub>1、支持批量创建问卷（支持多频道同时创建）</sub> | POST | `/live/v4/channel/questionnaire/create-batch` | json-body | questionnaires | LiveInteractionService#batchCreateQuestionnaire (packages/sdk/src/services/live-interaction.service.ts) | no |
| 删除频道答题卡<br><sub>1、删除频道答题卡信息</sub> | POST | `/live/v3/channel/interact/question/delete-question` | query/form | channelId, questionId | LiveInteractionService#deleteQuestion (packages/sdk/src/services/live-interaction.service.ts) | no |
| 删除学员提问客户回调地址<br><sub>> 删除当前账号下的「学员提问」客户回调配置；删除后，学员提问成功时不再向原 URL POST 通知。</sub> | POST | `/live/v5/chat/redirect/channel/student-question-webhook/delete` | query/form | roomId | LiveInteractionService#deleteStudentQuestionWebhook (packages/sdk/src/services/live-interaction.service.ts) | no |
| 提交中奖信息<br><sub>1、提交中奖者填写的信息</sub> | POST | `/live/v4/channel/lottery/add-receive-info` | query/form | channelId, lotteryId, viewerId, winnerCode | LiveInteractionService#addReceiveInfoV4 (packages/sdk/src/services/live-interaction.service.ts) | no |
| 停止答题卡<br><sub>1、停止答题卡</sub> | POST | `/live/v4/channel/question/stop` | query/form | channelId, questionId | LiveInteractionService#stopQuestion (packages/sdk/src/services/live-interaction.service.ts) | sdk: LiveInteractionService#stopQuestion (packages/cli/src/services/qa-questionnaire-service.ts:83) |
| 下载频道中奖记录<br><sub>1、导出频道的单抽奖的中奖用户列表的中奖文件</sub> | GET | `/live/v3/channel/lottery/download-winner-detail` | query | channelId, lotteryId | LiveInteractionService#downloadWinnerDetail (packages/sdk/src/services/live-interaction.service.ts) | no |
| 新增或修改频道答题卡<br><sub>1、编辑或添加答题卡信息，为全量增加或修改</sub> | POST | `/live/v3/channel/interact/question/add-edit-question` | query/form | answer, channelId, itemType, name, questionId, type | LiveInteractionService#addEditQuestion (packages/sdk/src/services/live-interaction.service.ts) | no |
| 新增或修改频道问卷<br><sub>1、创建问卷</sub> | POST | `/live/v4/channel/questionnaire/save` | json-body | channelId, questionnaireTitle, questions | LiveInteractionService#createQuestionnaire (packages/sdk/src/services/live-interaction.service.ts) | no |

### material - 素材库

| 功能/用途 | Method | Path | 请求形态 | 业务必填参数 | SDK 实现 | CLI 使用 |
| --- | --- | --- | --- | --- | --- | --- |
| 查询素材库标签列表<br><sub>1、分页查询账号下的素材库标签列表。</sub> | GET | `/live/v4/material/label/list` | query | pageNumber, pageSize | V4MaterialService#listMaterialLabels (packages/sdk/src/services/v4/material.service.ts) | no |
| 查询素材库分类<br><sub>1、查询账号下的素材库分类列表</sub> | GET | `/live/v4/material/category/list` | query | materialType | V4MaterialService#listMaterialCategories (packages/sdk/src/services/v4/material.service.ts) | no |
| 查询素材列表<br><sub>1、查询账号下的素材列表，支持分页，支持按素材类型、分类等条件进行查询。</sub> | GET | `/live/v4/material/list` | query | pageNumber, pageSize, type | V4MaterialService#listMaterials (packages/sdk/src/services/v4/material.service.ts) | no |
| 更新素材库标签<br><sub>1、更新账号下的素材库标签信息。</sub> | POST | `/live/v4/material/label/update` | json-body | id, name | V4MaterialService#updateMaterialLabel (packages/sdk/src/services/v4/material.service.ts) | no |
| 删除素材<br><sub>1、删除账号下的素材，支持批量删除，支持删除到回收站或彻底删除。</sub> | POST | `/live/v4/material/delete` | json-body | materialIds | V4MaterialService#deleteMaterials (packages/sdk/src/services/v4/material.service.ts) | no |
| 删除素材库标签<br><sub>1、删除账号下的素材库标签。</sub> | POST | `/live/v4/material/label/delete` | json-body | id | V4MaterialService#deleteMaterialLabel (packages/sdk/src/services/v4/material.service.ts) | no |
| 新增素材库标签<br><sub>1、在账号下新增一个素材库标签</sub> | POST | `/live/v4/material/label/create` | json-body | name | V4MaterialService#createMaterialLabel (packages/sdk/src/services/v4/material.service.ts) | no |

### platform - 开放平台

| 功能/用途 | Method | Path | 请求形态 | 业务必填参数 | SDK 实现 | CLI 使用 |
| --- | --- | --- | --- | --- | --- | --- |
| 查询未关联主播的频道<br><sub>1、查询未关联主播的频道</sub> | GET | `/live/v4/channel/anchor/list-unrelation` | json-body | - | PlatformService#listAnchorUnrelations (packages/sdk/src/services/platform.service.ts) | no |
| 查询优惠券列表<br><sub>1、查询优惠券列表</sub> | GET | `/live/v4/user/coupon/search` | json-body | - | V4PlatformService#searchCoupons (packages/sdk/src/services/v4/platform.service.ts) | sdk: V4PlatformService#searchCoupons (packages/cli/src/handlers/coupon.handler.ts:194) |
| 查询优惠券领取列表<br><sub>1、查询优惠券领取列表</sub> | GET | `/live/v4/user/coupon/search-viewer` | json-body | couponId | V4PlatformService#searchCouponViewers (packages/sdk/src/services/v4/platform.service.ts) | no |
| 查询主播已关联的频道<br><sub>1、查询主播频道关联关系</sub> | GET | `/live/v4/channel/anchor/list-relation` | json-body | anchorId | PlatformService#listAnchorRelations (packages/sdk/src/services/platform.service.ts) | no |
| 创建优惠券<br><sub>1、创建优惠券</sub> | POST | `/live/v4/user/coupon/create` | json-body | availableAmount, name, receiveEndTime, receiveStartTime, rule, type, +1 | V4PlatformService#createCoupon (packages/sdk/src/services/v4/platform.service.ts) | sdk: V4PlatformService#createCoupon (packages/cli/src/handlers/coupon.handler.ts:158)<br>sdk: V4PlatformService#createCoupon (packages/cli/src/setup/resource-handlers.ts:266) |
| 创建主播<br><sub>1、创建主播</sub> | POST | `/live/v4/channel/anchor/create` | json-body | avatar, nickname, sex | PlatformService#createAnchor (packages/sdk/src/services/platform.service.ts) | no |
| 平台内容库分组列表<br><sub>1、平台内容库分组列表</sub> | GET | `/live/v4/global/robot/label/list` | json-body | type | PlatformService#listContentGroups (packages/sdk/src/services/platform.service.ts) | no |
| 删除优惠券<br><sub>1、删除优惠券</sub> | POST | `/live/v4/user/coupon/delete-batch` | json-body | couponIds | V4PlatformService#deleteCouponsBatch (packages/sdk/src/services/v4/platform.service.ts) | sdk: V4PlatformService#deleteCouponsBatch (packages/cli/src/handlers/coupon.handler.ts:225)<br>sdk: V4PlatformService#deleteCouponsBatch (packages/cli/src/setup/resource-handlers.ts:285) |
| 停止优惠券<br><sub>1、停止优惠券 (修改状态)</sub> | POST | `/live/v4/user/coupon/update-status-batch` | json-body | couponIds | V4PlatformService#updateCouponsStatusBatch (packages/sdk/src/services/v4/platform.service.ts) | no |
| 修改优惠券<br><sub>1、修改优惠券</sub> | POST | `/live/v4/user/coupon/update` | json-body | couponId | V4PlatformService#updateCoupon (packages/sdk/src/services/v4/platform.service.ts) | no |
| 修改主播<br><sub>1、修改主播</sub> | POST | `/live/v4/channel/anchor/update` | json-body | anchorId | PlatformService#updateAnchor (packages/sdk/src/services/platform.service.ts) | no |
| 修改主播状态<br><sub>1、修改直播状态</sub> | POST | `/live/v4/channel/anchor/update-status` | json-body | anchorId, status | PlatformService#updateAnchorStatus (packages/sdk/src/services/platform.service.ts) | no |
| 主播列表<br><sub>1、查询主播列表</sub> | GET | `/live/v4/channel/anchor/list` | json-body | - | PlatformService#listAnchors (packages/sdk/src/services/platform.service.ts) | no |
| 主播详情<br><sub>1、查询主播详情</sub> | GET | `/live/v4/channel/anchor/get` | json-body | anchorId | PlatformService#getAnchor (packages/sdk/src/services/platform.service.ts) | no |

### player - 播放器

| 功能/用途 | Method | Path | 请求形态 | 业务必填参数 | SDK 实现 | CLI 使用 |
| --- | --- | --- | --- | --- | --- | --- |
| 查询频道内容保护（防录屏信息）<br><sub>1、通过频道号，查询频道内容保护（防录屏信息）</sub> | GET | `/live/v3/channel/anti/record/get` | query | - | PlayerService#getAntiRecordSettings (packages/sdk/src/services/player.service.ts) | no |
| 查询投诉反馈<br><sub>1、查询投诉反馈</sub> | GET | `/live/v4/channel/feedback/list` | query | - | PlayerService#getWatchFeedbackList (packages/sdk/src/services/player.service.ts) | no |
| 内容保护（防录屏）设置<br><sub>1、通过频道号，修改播放器内容保护自定义url跑马灯开关，在开启时需提交url参数</sub> | POST | `/live/v2/channelRestrict/{param}/set-diyurl-marquee` | query/form | - | PlayerService#setMarqueeUrl (packages/sdk/src/services/player.service.ts) | no |
| 设置频道内容保护（防录屏信息）<br><sub>1、通过频道号，设置频道内容保护（防录屏信息）</sub> | POST | `/live/v3/channel/anti/record/setting` | query/form | antiRecordType, channelId, content, fontSize, modelType | PlayerService#setAntiRecordSettings (packages/sdk/src/services/player.service.ts) | no |
| 修改频道播放器片头广告<br><sub>1、管理系统设置频道播放器的片头广告：频道管理-观看页设置-营销-广告</sub> | POST | `/live/v2/channelAdvert/{param}/updateHead` | query/form | - | PlayerService#updateHeadAdvert (packages/sdk/src/services/player.service.ts) | no |
| 修改频道播放器暂停广告<br><sub>1、管理系统修改频道播放器的暂停广告：频道管理-观看页设置-营销-广告</sub> | POST | `/live/v2/channelAdvert/{param}/updateStop` | query/form | - | PlayerService#updateStopAdvert (packages/sdk/src/services/player.service.ts) | no |
| 修改频道播放器中显示的logo<br><sub>1、管理系统修改播放器logo图片：频道管理-播放器管理-播放器-logo设置</sub> | POST | `/live/v2/channels/{param}/update` | query/form | - | ChannelService#updatePlayerLogo (packages/sdk/src/services/channel.service.ts) | no |

### robot - 数字人与机器人

| 功能/用途 | Method | Path | 请求形态 | 业务必填参数 | SDK 实现 | CLI 使用 |
| --- | --- | --- | --- | --- | --- | --- |
| 分页查询机器人虚拟昵称<br><sub>1、分页查询机器人虚拟昵称</sub> | GET | `/live/v4/global/robot/list` | query | - | V4RobotService#listRobots (packages/sdk/src/services/v4/robot.service.ts) | no |
| 批量创建机器人虚拟昵称<br><sub>1、批量创建机器人虚拟昵称</sub> | POST | `/live/v4/global/robot/save-batch` | json-body | name | V4RobotService#batchSaveRobots (packages/sdk/src/services/v4/robot.service.ts) | no |
| 批量删除机器人信息<br><sub>1、批量删除机器人信息</sub> | POST | `/live/v4/global/robot/delete-batch` | query/form | ids | V4RobotService#batchDeleteRobots (packages/sdk/src/services/v4/robot.service.ts) | no |

### root - 根目录

| 功能/用途 | Method | Path | 请求形态 | 业务必填参数 | SDK 实现 | CLI 使用 |
| --- | --- | --- | --- | --- | --- | --- |
| 保利威账号注册-渠道使用<br><sub>1、给渠道提供保利威账号注册接口。</sub> | POST | `/live/v4/root/user/register` | query/form | company, contact, email, mobile | OtherService#registerUser (packages/sdk/src/services/other.service.ts) | no |
| 腾讯云政企直播下单接口<br><sub>1、该接口接收用户购买信息，通知保利威工作人员，由工作人员线下开通账号。</sub> | POST | `/live/v4/root/order/create` | json-body | email, mobile, orderId, UIN | OtherService#createTencentOrder (packages/sdk/src/services/other.service.ts) | no |

### statistics - 数据统计

| 功能/用途 | Method | Path | 请求形态 | 业务必填参数 | SDK 实现 | CLI 使用 |
| --- | --- | --- | --- | --- | --- | --- |
| 查询直播场次汇总数据列表<br><sub>1、 查询直播场次汇总数据列表</sub> | GET | `/live/v4/statistics/session-stats/summary/list` | query | - | V4StatisticsService#getSessionStatsSummaryList (packages/sdk/src/services/v4/statistics.service.ts) | no |

### uncategorized - 未分类

| 功能/用途 | Method | Path | 请求形态 | 业务必填参数 | SDK 实现 | CLI 使用 |
| --- | --- | --- | --- | --- | --- | --- |
| 查询分账号剩余资源<br><sub>1、集团账号查询分账号剩余资源</sub> | GET | `/live/v4/group/user/package-validity/list` | query | - | OtherService#getPackageValidityList (packages/sdk/src/services/other.service.ts) | no |
| 查询健康状态<br><sub>1、通过健康检查来判断后端服务的可用性</sub> | GET | `/live/v4/group/health-check` | query | - | OtherService#healthCheck (packages/sdk/src/services/other.service.ts) | no |
| 查询频道的直播推流信息<br><sub>1、查询频道的直播推流信息</sub> | GET | `/live/v3/channel/monitor/list-tencent-stream-info` | query | channelId | OtherService#listTencentStreamInfo (packages/sdk/src/services/other.service.ts) | no |
| 创建集团分帐号<br><sub>1、创建集团分帐号</sub> | POST | `/live/v4/group/user/isolation/create` | json-body | email, password | OtherService#createIsolation (packages/sdk/src/services/other.service.ts) | no |
| 分配分帐号资源<br><sub>1、分配分帐号资源</sub> | POST | `/live/v4/group/user/package-validity/update` | json-body | email | OtherService#updatePackageValidity (packages/sdk/src/services/other.service.ts) | no |
| 分页查询邀请海报邀请数据<br><sub>1、分页查询邀请海报邀请数据</sub> | GET | `/live/v4/statistics/inviter-poster/list` | query | channelId | OtherService#getInviterPosterList (packages/sdk/src/services/other.service.ts) | no |
| 根据频道id和场次id获取用户发言次数统计<br><sub>1、根据频道id和场次id获取用户发言次数统计</sub> | GET | `/live/v4/chat/get-group-login-times` | query | channelId | OtherService#getGroupLoginTimes (packages/sdk/src/services/other.service.ts) | no |
| 频道状态验证<br><sub>1、查询频道合法状态</sub> | GET | `/live/v4/channel/status-valid` | query | channels | OtherService#checkChannelStatusValid (packages/sdk/src/services/other.service.ts) | no |
| 设置重点直播列表<br><sub>1、给部分账号提供设置重点直播列表，仅开通功能的账号可以使用</sub> | POST | `/live/v4/channel/ccb/focus/reset` | query/form | - | OtherService#resetCcbFocus (packages/sdk/src/services/other.service.ts) | no |
| 重置分账号应用密匙<br><sub>1、重置分账号应用密匙</sub> | POST | `/live/v4/group/user/secret/reset` | query/form | email | OtherService#resetAppSecret (packages/sdk/src/services/other.service.ts) | no |

### user - 用户与观众

| 功能/用途 | Method | Path | 请求形态 | 业务必填参数 | SDK 实现 | CLI 使用 |
| --- | --- | --- | --- | --- | --- | --- |
| 编辑标签<br><sub>1、编辑标签</sub> | POST | `/live/v4/user/label/update` | json-body | labelId, labelName | V4UserService#updateLabel (packages/sdk/src/services/v4/user.service.ts) | no |
| 编辑商品<br><sub>1、编辑标签</sub> | POST | `/live/v4/user/product/update` | json-body | link, linkType, name, productId | V4UserService#updateProduct (packages/sdk/src/services/v4/user.service.ts) | no |
| 查询观看次数显示开关<br><sub>1、查询观看页观看次数显示开关</sub> | GET | `/live/v4/user/global-setting/pv-show/get` | query | - | V4UserService#getPvShowEnable (packages/sdk/src/services/v4/user.service.ts) | no |
| 查询观看记录<br><sub>1、查询观看记录</sub> | GET | `/live/v4/user/viewlog/list` | query | - | V4UserService#getWatchLogList (packages/sdk/src/services/v4/user.service.ts) | no |
| 查询观众详情<br><sub>1、查询观众详情</sub> | GET | `/live/v4/user/viewer-record/get` | query | viewerUnionId | V4UserService#getViewerRecord (packages/sdk/src/services/v4/user.service.ts) | sdk: V4UserService#getViewerRecord (packages/cli/src/services/viewer-service.ts:71) |
| 查询角色列表<br><sub>1、查询子账号角色权限列表</sub> | GET | `/live/v4/user/children/role/list` | query | - | V4UserService#listChildAccountRoles (packages/sdk/src/services/v4/user.service.ts) | no |
| 查询默认模板打赏设置<br><sub>1、查询直播模板打赏设置，包括现金打赏、礼物打赏，礼物打赏又分为现金支付和积分支付</sub> | GET | `/live/v4/user/donate/get` | query | - | V4UserService#getDonateTemplate (packages/sdk/src/services/v4/user.service.ts) | no |
| 查询默认模板回放设置<br><sub>1、查询回放默认模板设置</sub> | GET | `/live/v4/user/template/playback-setting/get` | query | - | V4UserService#getPlaybackSetting (packages/sdk/src/services/v4/user.service.ts) | no |
| 查询默认模板角色权限设置<br><sub>1、查询默认模板角色权限设置</sub> | GET | `/live/v4/user/template/role-config/get` | query | - | V4UserService#getRoleConfigTemplate (packages/sdk/src/services/v4/user.service.ts) | no |
| 查询默认模板内容保护（防录屏）设置<br><sub>1、查询内容保护默认模板设置</sub> | GET | `/live/v4/user/template/marquee/get` | query | - | V4UserService#getMarqueeTemplate (packages/sdk/src/services/v4/user.service.ts) | no |
| 查询默认模板视频审核<br><sub>1、查询视频审核默认模板设置</sub> | GET | `/live/v4/user/template/video-moderation/get` | query | - | V4UserService#getVideoModerationSetting (packages/sdk/src/services/v4/user.service.ts) | no |
| 查询默认模板音频审核<br><sub>1、查询音频审核默认模板设置</sub> | GET | `/live/v4/user/template/audio-moderation/get` | query | - | V4UserService#getAudioModerationSetting (packages/sdk/src/services/v4/user.service.ts) | no |
| 查询全局回调设置<br><sub>1、查询全局回调设置</sub> | GET | `/live/v4/user/global-setting/callback/get` | query | - | V4UserService#getCallback (packages/sdk/src/services/v4/user.service.ts) | sdk: V4UserService#getCallback (packages/cli/src/services/platform-service.ts:138) |
| 查询全局频道设置<br><sub>1、查询全局频道设置</sub> | GET | `/live/v4/user/global-setting/switch/get` | query | - | V4UserService#getGlobalChannelSettings (packages/sdk/src/services/v4/user.service.ts) | sdk: V4UserService#getGlobalChannelSettings (packages/cli/src/services/platform-service.ts:223) |
| 查询商品订单列表<br><sub>1、查询商品订单列表</sub> | GET | `/live/v4/user/product/order/list` | query | - | V4UserService#listProductOrders (packages/sdk/src/services/v4/user.service.ts) | no |
| 查询商品订单详情<br><sub>1、查询商品订单详情</sub> | GET | `/live/v4/user/product/order/get` | query | orderNo | V4UserService#getProductOrder (packages/sdk/src/services/v4/user.service.ts) | no |
| 查询页脚设置<br><sub>1、查询全局页脚设置</sub> | GET | `/live/v4/user/global-setting/footer/get` | query | - | V4UserService#getGlobalFooter (packages/sdk/src/services/v4/user.service.ts) | no |
| 查询用户账单使用明细数据<br><sub>1、查询用户账单使用明细数据</sub> | GET | `/live/v4/channel/use-detail/list` | query | endDate, itemCategory, startDate | V4UserService#getBillUseDetailList (packages/sdk/src/services/v4/user.service.ts) | no |
| 查询用户中奖记录<br><sub>1、查询用户中奖记录</sub> | GET | `/live/v4/user/lottery/list-personal-win` | query | pageNumber, pageSize, viewerId | V4UserService#viewerLotteryWin (packages/sdk/src/services/v4/user.service.ts) | no |
| 查询用户子账号列表<br><sub>1、查询用户子账号列表</sub> | GET | `/live/v4/user/children/list` | query | - | V4UserService#listChildAccounts (packages/sdk/src/services/v4/user.service.ts) | no |
| 查询账号时间范围连麦使用量<br><sub>1、查询账号时间范围连麦使用量</sub> | GET | `/live/v4/statistics/mic/history/get` | query | - | V4UserService#getMicDuration (packages/sdk/src/services/v4/user.service.ts) | no |
| 查询组织架构列表<br><sub>1、组织架构列表</sub> | GET | `/live/v4/user/organization/list` | query | - | V4UserService#listOrganizations (packages/sdk/src/services/v4/user.service.ts) | no |
| 创建标签<br><sub>1、创建标签</sub> | POST | `/live/v4/user/label/save` | json-body | labelName | V4UserService#createLabel (packages/sdk/src/services/v4/user.service.ts) | no |
| 创建标签<br><sub>1、创建标签</sub> | POST | `/live/v4/user/viewer-label/create-batch` | json-body | labels | V4UserService#createViewerLabel (packages/sdk/src/services/v4/user.service.ts) | no |
| 创建商品<br><sub>1、创建标签</sub> | POST | `/live/v4/user/product/save` | json-body | link, linkType, name | V4UserService#createProduct (packages/sdk/src/services/v4/user.service.ts) | no |
| 创建商品标签<br><sub>1、创建商品标签</sub> | POST | `/live/v4/user/product/tag/create` | json-body | name | V4UserService#createProductTag (packages/sdk/src/services/v4/user.service.ts) | no |
| 发送阿里云短信通知<br><sub>1、根据用户配置的模板发送短信通知</sub> | POST | `/live/v4/user/sms/send` | json-body | phoneNumbers, templateParamNames, templateParamValues | V4UserService#sendSms (packages/sdk/src/services/v4/user.service.ts) | no |
| 分页查询标签<br><sub>1、分页查询标签</sub> | GET | `/live/v4/user/label/page` | query | pageNumber, pageSize | V4UserService#listLabels (packages/sdk/src/services/v4/user.service.ts) | no |
| 分页查询商品<br><sub>1、分页查询标签</sub> | GET | `/live/v4/user/product/list` | query | pageNumber, pageSize | V4UserService#listProducts (packages/sdk/src/services/v4/user.service.ts) | sdk: V4UserService#listProducts (packages/cli/src/services/product.service.sdk.ts:65) |
| 分页查询商品标签<br><sub>1、分页查询商品标签</sub> | GET | `/live/v4/user/product/tag/list` | query | channelId, pageNumber, pageSize | V4UserService#listProductTags (packages/sdk/src/services/v4/user.service.ts) | no |
| 分页查询自定义字段<br><sub>1、分页查询自定义字段</sub> | GET | `/live/v4/user/custom-field/list` | query | - | V4UserService#listCustomFields (packages/sdk/src/services/v4/user.service.ts) | no |
| 更新标签信息<br><sub>1、更新标签信息</sub> | POST | `/live/v4/user/viewer-label/update` | json-body | id | V4UserService#updateViewerLabel (packages/sdk/src/services/v4/user.service.ts) | no |
| 更新商品标签<br><sub>1、更新商品标签</sub> | POST | `/live/v4/user/product/tag/update` | json-body | id, name | V4UserService#updateProductTag (packages/sdk/src/services/v4/user.service.ts) | no |
| 更新用户身份信息<br><sub>1、更新用户身份信息</sub> | POST | `/live/v4/user/viewer-record/update` | json-body | area, device, email, latestAccessIp, name, viewerUnionId | V4UserService#updateViewerRecord (packages/sdk/src/services/v4/user.service.ts) | no |
| 观众自定义信息同步<br><sub>1、观众自定义信息同步</sub> | POST | `/live/v4/user/custom-field/viewer-value/save` | json-body | - | V4UserService#addCustomFieldValue (packages/sdk/src/services/v4/user.service.ts) | no |
| 获取标签列表<br><sub>1、分页获取标签列表</sub> | GET | `/live/v4/user/viewer-label/list` | query | - | V4UserService#listViewerLabels (packages/sdk/src/services/v4/user.service.ts) | sdk: V4UserService#listViewerLabels (packages/cli/src/services/viewer-service.ts:102) |
| 获取观众观看详情列表<br><sub>1、获取观众观看详情列表</sub> | GET | `/live/v4/user/viewlog/detail` | query | viewerId | V4UserService#getWatchLogDetail (packages/sdk/src/services/v4/user.service.ts) | no |
| 获取观众列表<br><sub>1、分页获取观众列表</sub> | GET | `/live/v4/user/viewer-record/list` | query | - | V4UserService#listViewerRecords (packages/sdk/src/services/v4/user.service.ts) | sdk: V4UserService#listViewerRecords (packages/cli/src/services/viewer-service.ts:85) |
| 获取邀请员的绑定观众列表<br><sub>1、支持按特定的条件去过滤、获取账号下的邀请员的绑定观众列表</sub> | GET | `/live/v4/user/invite-sales/follow-viewer/list` | query | - | V4UserService#listFollowViewers (packages/sdk/src/services/v4/user.service.ts) | no |
| 获取邀请员列表<br><sub>1、支持按特定的条件去过滤、获取账号下的邀请员列表</sub> | GET | `/live/v4/user/invite-sales/list` | query | - | V4UserService#listInviteSales (packages/sdk/src/services/v4/user.service.ts) | no |
| 获取账号MR并发详情信息<br><sub>1、获取账号MR并发详情信息</sub> | GET | `/live/v4/user/mr/concurrency-detail/get` | query | - | V4UserService#getMrConcurrencyDetail (packages/sdk/src/services/v4/user.service.ts) | no |
| 批量更新订单状态<br><sub>1、量更新订单状态</sub> | POST | `/live/v4/user/product/order/update-batch-status` | json-body | orderNos, status | V4UserService#batchUpdateOrderStatus (packages/sdk/src/services/v4/user.service.ts) | no |
| 频道批量添加标签<br><sub>1、频道批量添加标签</sub> | POST | `/live/v4/channel/label-ref/save-batch` | json-body | channelIds, labelIds | V4UserService#addChannelLabelRefs (packages/sdk/src/services/v4/user.service.ts) | no |
| 删除标签<br><sub>1、删除标签</sub> | GET | `/live/v4/user/label/delete` | query | labelId | V4UserService#deleteLabel (packages/sdk/src/services/v4/user.service.ts) | no |
| 删除标签信息<br><sub>1、删除标签信息</sub> | POST | `/live/v4/user/viewer-label/delete` | query/form | id | V4UserService#deleteViewerLabel (packages/sdk/src/services/v4/user.service.ts) | no |
| 删除观众信息<br><sub>1、删除观众信息</sub> | GET | `/live/v4/user/viewer-record/delete` | query | viewerUnionId | V4UserService#deleteViewerRecord (packages/sdk/src/services/v4/user.service.ts) | no |
| 删除商品<br><sub>1、删除标签</sub> | POST | `/live/v4/user/product/delete` | query/form | productId | V4UserService#deleteProduct (packages/sdk/src/services/v4/user.service.ts) | no |
| 删除商品标签<br><sub>1、删除商品标签</sub> | POST | `/live/v4/user/product/tag/delete` | json-body | id | V4UserService#deleteProductTag (packages/sdk/src/services/v4/user.service.ts) | no |
| 删除用户标签关联<br><sub>1、删除用户标签关联</sub> | POST | `/live/v4/user/viewer-label/remove-viewers-label` | json-body | labelIds, viewerUnionIds | V4UserService#deleteViewerLabelRef (packages/sdk/src/services/v4/user.service.ts) | sdk: V4UserService#deleteViewerLabelRef (packages/cli/src/services/viewer-service.ts:147) |
| 删除子账号<br><sub>1、通过子账号登录邮箱删除子账号</sub> | POST | `/live/v4/user/children/delete` | query/form | childEmail | V4UserService#deleteChildAccounts (packages/sdk/src/services/v4/user.service.ts) | no |
| 删除组织<br><sub>1、通过组织ID删除组织</sub> | POST | `/live/v4/user/organization/delete` | query/form | organizationId | V4UserService#deleteOrganization (packages/sdk/src/services/v4/user.service.ts) | no |
| 添加邀请员<br><sub>1、将账号下的某些用户，添加、设置为邀请员</sub> | POST | `/live/v4/user/invite-sales/add` | json-body | viewerUnionIds | V4UserService#addInviteSale (packages/sdk/src/services/v4/user.service.ts) | no |
| 通过手机号导入用户<br><sub>1、通过手机号导入用户</sub> | POST | `/live/v4/user/viewer-record/create` | json-body | mobile, nickname | V4UserService#createViewerRecord (packages/sdk/src/services/v4/user.service.ts) | no |
| 通过外部ID导入用户<br><sub>1、通过外部ID导入用户</sub> | POST | `/live/v4/user/viewer-record/import-external-viewer` | json-body | externalViewerId, nickname | V4UserService#importExternalViewer (packages/sdk/src/services/v4/user.service.ts) | no |
| 新增子账号<br><sub>1、新增子账号</sub> | POST | `/live/v4/user/children/create` | json-body | childEmail, childName, password, roleId | V4UserService#createChildAccount (packages/sdk/src/services/v4/user.service.ts) | no |
| 新增自定义字段<br><sub>1、添加自定义字段</sub> | POST | `/live/v4/user/custom-field/save` | json-body | customFieldId, customFieldName, customFieldType | V4UserService#addCustomField (packages/sdk/src/services/v4/user.service.ts) | no |
| 新增组织<br><sub>1、组织架构新增子节点（排在第一位）</sub> | POST | `/live/v4/user/organization/create` | json-body | name, parentId | V4UserService#createOrganization (packages/sdk/src/services/v4/user.service.ts) | no |
| 修改观看次数显示开关<br><sub>1、修改观看页观看次数显示开关</sub> | POST | `/live/v4/user/global-setting/pv-show/update` | query/form | enabled | V4UserService#updatePvShowEnable (packages/sdk/src/services/v4/user.service.ts) | no |
| 修改默认模板回放设置<br><sub>1、修改回放默认模板设置</sub> | POST | `/live/v4/user/template/playback-setting/update` | json-body | - | V4UserService#updatePlaybackSetting (packages/sdk/src/services/v4/user.service.ts) | no |
| 修改默认模板角色权限设置<br><sub>1、修改角色权限默认模板设置</sub> | POST | `/live/v4/user/template/role-config/update` | json-body | - | V4UserService#updateRoleConfigTemplate (packages/sdk/src/services/v4/user.service.ts) | no |
| 修改默认模板礼物打赏设置<br><sub>1、修改直播模板礼物打赏设置，礼物打赏又分为现金支付和积分支付</sub> | POST | `/live/v4/user/donate/gift/update` | json-body | donateGiftEnabled | V4UserService#updateDonateTemplate (packages/sdk/src/services/v4/user.service.ts) | no |
| 修改默认模板内容保护（防录屏）设置<br><sub>1、更新内容保护默认模板设置</sub> | POST | `/live/v4/user/template/marquee/update` | json-body | enable | V4UserService#updateMarqueeTemplate (packages/sdk/src/services/v4/user.service.ts) | no |
| 修改默认模板视频审核<br><sub>1、修改视频审核默认模板设置</sub> | POST | `/live/v4/user/template/video-moderation/update` | json-body | illegalNotify, imageFrequency, moderationEnabled, moderationStrategy | V4UserService#updateVideoModerationSetting (packages/sdk/src/services/v4/user.service.ts) | no |
| 修改默认模板音频审核<br><sub>1、修改音频审核默认模板设置</sub> | POST | `/live/v4/user/template/audio-moderation/update` | json-body | badwordEnabled, illegalNotify, moderationEnabled, moderationStrategy | V4UserService#updateAudioModerationSetting (packages/sdk/src/services/v4/user.service.ts) | no |
| 修改配置信息<br><sub>1、修改配置信息</sub> | POST | `/live/v4/user/viewer-user-system/update-config` | json-body | mobileLoginEnabled, wxWorkLoginEnabled | V4UserService#updateViewerUserSystemConfig (packages/sdk/src/services/v4/user.service.ts) | no |
| 修改全局回调设置<br><sub>1、修改全局回调设置</sub> | POST | `/live/v4/user/global-setting/callback/update` | json-body | - | V4UserService#updateCallback (packages/sdk/src/services/v4/user.service.ts) | sdk: V4UserService#updateCallback (packages/cli/src/services/platform-service.ts:168) |
| 修改全局频道设置<br><sub>1、修改全局频道设置</sub> | POST | `/live/v4/user/global-setting/switch/update` | json-body | - | V4UserService#updateGlobalChannelSettings (packages/sdk/src/services/v4/user.service.ts) | sdk: V4UserService#updateGlobalChannelSettings (packages/cli/src/services/platform-service.ts:266) |
| 修改邀请员信息<br><sub>1、修改账号下的某些邀请员的信息</sub> | POST | `/live/v4/user/invite-sales/update` | json-body | organizationId, viewerUnionIds | V4UserService#updateInviteSale (packages/sdk/src/services/v4/user.service.ts) | no |
| 修改页脚设置<br><sub>1、修改全局页脚设置</sub> | POST | `/live/v4/user/global-setting/footer/update` | json-body | - | V4UserService#updateGlobalFooter (packages/sdk/src/services/v4/user.service.ts) | no |
| 修改子账号<br><sub>1、通过子账号登录邮箱修改子账号信息</sub> | POST | `/live/v4/user/children/update` | json-body | childEmail | V4UserService#updateChildAccount (packages/sdk/src/services/v4/user.service.ts) | no |
| 一客一码邀请销售信息查询<br><sub>1、一客一码邀请销售信息查询</sub> | GET | `/live/v4/user/invite-customer/get` | query | - | V4UserService#getBySale (packages/sdk/src/services/v4/user.service.ts) | no |
| 移除邀请员<br><sub>1、将账号下的某些邀请员，移除邀请员身份</sub> | POST | `/live/v4/user/invite-sales/remove` | json-body | viewerUnionIds | V4UserService#removeInviteSale (packages/sdk/src/services/v4/user.service.ts) | no |
| 用户关联标签<br><sub>1、用户关联标签</sub> | POST | `/live/v4/user/viewer-label/add-viewers-label` | json-body | labelIds, viewerUnionIds | V4UserService#addViewerLabel (packages/sdk/src/services/v4/user.service.ts) | sdk: V4UserService#addViewerLabel (packages/cli/src/services/viewer-service.ts:125) |

### web - 观看页与观看条件

| 功能/用途 | Method | Path | 请求形态 | 业务必填参数 | SDK 实现 | CLI 使用 |
| --- | --- | --- | --- | --- | --- | --- |
| 查询报名观看记录<br><sub>1、查询报名观看记录</sub> | GET | `/live/v3/channel/enroll/list` | query | channelId | WebService#enrollList (packages/sdk/src/services/web.service.ts) | no |
| 查询频道白名单<br><sub>1、获取全局或频道的观看条件白名单列表</sub> | GET | `/live/v3/channel/auth/get-white-list` | query | rank | WebService#getWhiteList (packages/sdk/src/services/web.service.ts) | sdk: WebService#getWhiteList (packages/cli/src/services/whitelist-service.ts:90) |
| 查询频道打赏设置<br><sub>1、获取全局或当前生效的打赏设置</sub> | GET | `/live/v3/channel/donate/get` | query | - | WebService#getDonate (packages/sdk/src/services/web.service.ts) | no |
| 查询频道登记观看记录<br><sub>1、获取频道的登记观看列表数据内容</sub> | GET | `/live/v3/channel/auth/get-record-info` | query | channelId | WebService#getRecordInfo (packages/sdk/src/services/web.service.ts) | no |
| 查询频道登记观看设置的字段信息<br><sub>1、获取频道或全局的登记观看字段</sub> | GET | `/live/v3/channel/auth/get-record-field` | query | rank | WebService#getRecordField (packages/sdk/src/services/web.service.ts) | no |
| 查询频道点赞数和观看次数<br><sub>1、接口用于获取一个或者多个频道点赞数和观看热度</sub> | GET | `/live/v2/channels/live-likes` | query | channelIds | WebService#liveLikes (packages/sdk/src/services/web.service.ts) | no |
| 查询频道观看条件<br><sub>1、查询频道观看条件</sub> | GET | `/live/v3/channel/auth/get` | query | - | WebService#getWatchCondition (packages/sdk/src/services/web.service.ts) | sdk: WebService#getWatchCondition (packages/cli/src/services/watch-condition-service.ts:43) |
| 查询频道图文直播内容<br><sub>1、查询频道图文直播内容</sub> | GET | `/live/v3/channel/watch/tuwen/list` | query | channelId | WebService#getTuwenList (packages/sdk/src/services/web.service.ts) | no |
| 查询频道微信分享信息(旧版)<br><sub>1、查询频道微信分享信息</sub> | GET | `/live/v3/channel/weixin-share/get` | query | channelId | WebService#getWeixinShare (packages/sdk/src/services/web.service.ts) | no |
| 查询频道页面菜单信息<br><sub>1、查询频道页面菜单信息</sub> | GET | `/live/v3/channel/menu/list` | query | channelId | WebService#getMenuList (packages/sdk/src/services/web.service.ts) | no |
| 查询频道直播开始时间<br><sub>1、接口用于获取倒计时设置的相关信息</sub> | GET | `/live/v2/channelSetting/{param}/get-countdown` | query | - | WebService#getCountdown (packages/sdk/src/services/web.service.ts) | no |
| 查询引导图<br><sub>1、接口用于获取用户频道号引导图开关的状态，以及具体引导图的url</sub> | GET | `/live/v2/channelSetting/{param}/getSplash` | query | - | WebService#getSplash (packages/sdk/src/services/web.service.ts) | no |
| 批量导入频道白名单<br><sub>1、设置频道或全局观看条件中的白名单列表</sub> | POST | `/live/v3/channel/auth/upload-white-list` | query/form | file, rank | WebService#uploadWhiteList (packages/sdk/src/services/web.service.ts) | no |
| 删除频道白名单<br><sub>1、用于删除指定观看白名单（支持一键清空）</sub> | POST | `/live/v3/channel/auth/delete-white-list` | query/form | isClear, rank | WebService#deleteWhiteList (packages/sdk/src/services/web.service.ts) | sdk: WebService#deleteWhiteList (packages/cli/src/services/whitelist-service.ts:133) |
| 删除频道菜单<br><sub>1、删除频道菜单</sub> | POST | `/live/v3/channel/menu/delete` | query/form | menuIds | WebService#deleteMenu (packages/sdk/src/services/web.service.ts) | no |
| 上传频道所有装修图片素材<br><sub>1、接口用于上传图片素材，同时获取图片地址</sub> | POST | `/live/v3/common/upload-image` | query/form | file, type | WebService#uploadImage (packages/sdk/src/services/web.service.ts) | no |
| 设置礼物打赏<br><sub>1、设置礼物打赏-现金支付礼物（旧版后台为：道具打赏）</sub> | POST | `/live/v3/channel/donate/update-good` | json-body | goods | WebService#updateGood (packages/sdk/src/services/web.service.ts) | no |
| 设置频道是否应用通用设置<br><sub>1、接口用于设置〔是否应用通用设置〕，包括的功能有打赏设置，广告设置，观看条件设置，跑马灯，功能开关，播放限制，观看页的皮肤设置</sub> | POST | `/live/v3/channel/common/update-global-enabled` | query/form | channelId, enabled, globalEnabledType | WebService#updateGlobalEnabled (packages/sdk/src/services/web.service.ts) | no |
| 设置现金打赏<br><sub>1、设置频道或者全局现金打赏（带上频道号为设置频道现金打赏，不带频道号默认为全局现金打赏设置）</sub> | POST | `/live/v3/channel/donate/update-cash` | json-body | cashes, cashMin | WebService#updateCash (packages/sdk/src/services/web.service.ts) | no |
| 下载频道白名单<br><sub>1、下载全局或频道的观看条件白名单列表</sub> | GET | `/live/v3/channel/auth/download-white-list` | query | rank | WebService#downloadWhiteList (packages/sdk/src/services/web.service.ts) | no |
| 下载频道登记观看记录<br><sub>1、下载频道的登记观看列表，包含登记观看记录字段和数据内容</sub> | GET | `/live/v3/channel/auth/download-record-info` | query | channelId, rank | WebService#downloadRecordInfo (packages/sdk/src/services/web.service.ts) | no |
| 修改观看条件<br><sub>1、设置频道的观看条件</sub> | POST | `/live/v2/channelSetting/{param}/set-auth-type` | query/form | authType | WebService#setAuthType (packages/sdk/src/services/web.service.ts) | no |
| 修改频道单个白名单<br><sub>1、用于更新观看白名单信息</sub> | POST | `/live/v3/channel/auth/update-white-list` | query/form | code, oldCode, rank | WebService#updateWhiteList (packages/sdk/src/services/web.service.ts) | sdk: WebService#updateWhiteList (packages/cli/src/services/whitelist-service.ts:119) |
| 修改频道点赞数和观看次数<br><sub>1、设置频道的点赞数和观看热度</sub> | GET | `/live/v2/channels/{param}/update-likes` | query | - | WebService#updateLikes (packages/sdk/src/services/web.service.ts) | no |
| 修改频道观看条件<br><sub>1、修改频道或通用设置的观看条件（旧版直播后台-通用设置-观看条件）</sub> | POST | `/live/v3/channel/auth/update` | json-body | authSettings | ChannelService#updateWatchCondition (packages/sdk/src/services/channel.service.ts) | sdk: WebService#setWatchCondition (packages/cli/src/services/watch-condition-service.ts:57)<br>sdk: ChannelService#updateWatchCondition (packages/cli/src/setup/resource-handlers.ts:116) |
| 修改频道名称<br><sub>1、设置频道名称</sub> | POST | `/live/v2/channels/{param}/update` | query/form | name | ChannelService#updatePlayerLogo (packages/sdk/src/services/channel.service.ts) | no |
| 修改频道图标<br><sub>1、设置频道图标</sub> | POST | `/live/v2/channelSetting/{param}/setCoverImg` | query/form | imgfile | WebService#updateChannelLogo (packages/sdk/src/services/web.service.ts) | no |
| 修改频道外部授权设置<br><sub>1、设置直播外部授权</sub> | POST | `/live/v2/channelSetting/{param}/auth-external` | query/form | externalUri | WebService#setExternalAuth (packages/sdk/src/services/web.service.ts) | no |
| 修改频道微信分享信息(旧版)<br><sub>1、修改频道的微信分享相关设置</sub> | POST | `/live/v3/channel/weixin-share/update` | query/form | channelId | WebService#updateWeixinShare (packages/sdk/src/services/web.service.ts) | no |
| 修改频道主持人姓名<br><sub>1、设置单个或者所有频道的主持人姓名</sub> | POST | `/live/v2/channelSetting/{param}/setPublisher` | query/form | publisher | WebService#setPublisher (packages/sdk/src/services/web.service.ts) | no |
| 修改频道自定义授权设置<br><sub>1、修改频道自定义授权设置</sub> | POST | `/live/v2/channelSetting/{param}/oauth-custom` | query/form | customUri | WebService#setAuthorizedAddress (packages/sdk/src/services/web.service.ts) | no |
| 修改设置授权认证URL<br><sub>1、设置频道和全局播放限制的授权认证URL，通过是否传channelId进行频道和全局区分</sub> | POST | `/live/v3/channel/restrict/update-auth-url` | query/form | - | WebService#updateAuthUrl (packages/sdk/src/services/web.service.ts) | no |
| 修改提问功能开关<br><sub>1、开启或关闭咨询提问功能开关</sub> | POST | `/live/v2/channel/menu/{param}/update-consulting-enabled` | query/form | enabled | WebService#updateConsultingEnabled (packages/sdk/src/services/web.service.ts) | no |
| 修改页面菜单排序<br><sub>1、设置直播频道菜单的顺序</sub> | POST | `/live/v3/channel/menu/update-rank` | query/form | channelId, menuIds | WebService#updateRank (packages/sdk/src/services/web.service.ts) | no |
| 修改页面菜单信息<br><sub>1、修改页面菜单信息</sub> | POST | `/live/v3/channel/menu/update` | query/form | content, menuId | WebService#updateMenu (packages/sdk/src/services/web.service.ts) | no |
| 修改引导图<br><sub>1、接口用于设置引导页开关以及引导图</sub> | POST | `/live/v2/channelSetting/{param}/setSplash` | query/form | splashEnabled | WebService#setSplash (packages/sdk/src/services/web.service.ts) | no |
| 修改直播倒计时设置<br><sub>1、接口用于修改频道的倒计时设置</sub> | POST | `/live/v2/channelSetting/{param}/set-countdown` | query/form | - | WebService#setCountdown (packages/sdk/src/services/web.service.ts) | no |
| 修改直播介绍菜单<br><sub>1、设置自定义菜单中用户设置菜单的直播介绍</sub> | POST | `/live/v2/channelSetting/{param}/{param}/set-menu` | query/form | content, menuType | WebService#setMenu (packages/sdk/src/services/web.service.ts) | no |
| 增加频道单个白名单<br><sub>1、接口用于添加单个观看白名单</sub> | POST | `/live/v3/channel/auth/add-white-list` | query/form | code, rank | WebService#addWhiteList (packages/sdk/src/services/web.service.ts) | sdk: WebService#addWhiteList (packages/cli/src/services/whitelist-service.ts:104) |
| 增加页面菜单<br><sub>1、添加一个频道菜单</sub> | POST | `/live/v3/channel/menu/add` | query/form | channelId, name, type | WebService#addMenu (packages/sdk/src/services/web.service.ts) | no |

### webapp - WebApp

| 功能/用途 | Method | Path | 请求形态 | 业务必填参数 | SDK 实现 | CLI 使用 |
| --- | --- | --- | --- | --- | --- | --- |
| 查询应用角色列表<br><sub>1、查询应用角色列表</sub> | GET | `/live/v4/user/webapp-role/list` | query | - | V4WebAppService#listRoles (packages/sdk/src/services/v4/webapp.service.ts) | no |
| 更新应用角色信息<br><sub>1、更新应用角色信息</sub> | POST | `/live/v4/user/webapp-role/update` | query/form | name, roleId, roleType | V4WebAppService#updateRole (packages/sdk/src/services/v4/webapp.service.ts) | no |
| 获取应用角色权限<br><sub>1、获取应用角色权限</sub> | GET | `/live/v4/user/webapp-role/get` | query | roleId | V4WebAppService#getRole (packages/sdk/src/services/v4/webapp.service.ts) | no |
| 删除应用角色<br><sub>1、删除应用角色</sub> | POST | `/live/v4/user/webapp-role/delete` | query/form | id | V4WebAppService#deleteRole (packages/sdk/src/services/v4/webapp.service.ts) | no |
| 添加应用角色<br><sub>1、添加应用角色</sub> | POST | `/live/v4/user/webapp-role/create` | query/form | name, permissionIds, roleType | V4WebAppService#createRole (packages/sdk/src/services/v4/webapp.service.ts) | no |
| 应用权限列表<br><sub>1、应用权限列表</sub> | GET | `/live/v4/user/webapp-role/permission/list` | query | - | V4WebAppService#listPermissions (packages/sdk/src/services/v4/webapp.service.ts) | no |

