# 场景 12：直播间互动治理与促活 — 聊天消息审计/公告 + 互动点赞/奖励

> 覆盖一级命令：`chat`、`interaction`（本轮新增）
> 业务阶段：互动 / 治理 / 转化
> 专用测试频道：`7983941`（已保留，未删除）

---

## 1. 场景名称

**直播间互动治理与促活**：品牌电商直播中，运营/场控团队对聊天区做**消息审计、官方公告发布、违规词与禁言治理**（`chat`），同时通过**点赞、奖励消息**驱动观众情绪与互动氛围（`interaction`）。

---

## 2. 覆盖命令

| 一级命令 | 覆盖口径 | 说明 |
|---|---|---|
| `chat` | ✅ 已执行成功 | `list`、`message online-count`、`send`（写入并经 list 交叉验证）、`notice add`（写入并经 `notice list` 验证）、`badword add`（写入并经 `badword list` 验证）+ `badword delete` 清理回归、`banned list`（userId/ip/badword 三类）、`banned user-list` 真实执行成功；`role user-list` 已执行失败并记录 |
| `interaction` | ✅ 已执行成功 | `task-reward list`、`event list`、`webhook get` 三条只读命令真实执行成功；`favor` 真实写入并经 `channel get` 的 `likes` 字段交叉验证（0→10→15）；`reward` 已执行失败并记录 |

> 共享预检命令 `account`、`channel` 在本场景中真实执行（建测试频道 + 验证），已在场景 01 起计入覆盖。

---

## 3. 专用测试频道

| 项 | 值 |
|---|---|
| 频道 ID | `7983941` |
| 频道名称 | `GNHF-电商场景-12-chat-interaction-engagement-202606230116` |
| 创建命令 | `npx --yes polyv-live-cli@rc channel create -n "GNHF-电商场景-12-chat-interaction-engagement-202606230116" --scene alone --template alone -o json` |
| 账号环境 | `nicksu`（App ID `h2wazzobbq`，User ID `475b6884a7`，production） |
| scene / template | `alone` / `alone`（活动营销-纯视频横屏） |
| 初始 watchStatus | `unStart`（未开播） |
| 创建结果 | 成功，返回 `channelId=7983941`、`status=waiting` |
| 是否删除 | **否**，频道已保留供人工查看配置 |

---

## 4. 行业背景

电商直播的转化与复购高度依赖**互动氛围**。一场大促直播往往伴随海量观众评论：求链接、问尺码、催上新、刷竞品、甚至违规导流。场控团队需要：

1. **消息审计**：实时回看聊天历史，定位高频问题与敏感言论。
2. **官方公告**：用管理员身份发布开抢提醒、优惠码、下单备注规则，置顶 + 弹窗强提示。
3. **违规治理**：维护禁言词库（违禁词），对刷屏/导流用户禁言/踢人。
4. **氛围促活**：在冷场或关键节点用点赞、奖励消息（礼物动效）拉升观众情绪，带动停留时长与下单。

保利威把上述能力拆在两个一级命令里：`chat`（聊天消息、公告、禁言词、禁言/踢人列表、聊天开关）与 `interaction`（跨互动能力的点赞、奖励消息、任务奖励、互动监听事件、问答 webhook）。

---

## 5. 业务目标与核心 KPI

- **消息审计覆盖率**：能用 CLI 拉取指定日期范围内的聊天历史，作为合规留痕。
- **公告触达**：开播前/中至少配置 1 条置顶 + 弹窗公告，确保下单规则被看到。
- **违禁治理**：维护账号级禁言词库，违规词命中即自动屏蔽，降低人工审核成本。
- **互动氛围**：在关键节点注入点赞/奖励，拉升频道 `likes` 计数与观众停留。
- **审计闭环**：所有写入（公告、禁言词、点赞）均能用只读命令交叉验证持久化，不留「成功假象」。

---

## 6. 适用角色

- **直播场控 / 运营助理**：发公告、审评论、禁言/踢人、点赞暖场。
- **内容合规**：维护禁言词库、做直播后聊天留痕审计。
- **电商运营负责人**：复盘互动数据（在线人数、点赞量、公告触达）。

---

## 7. 前置条件

- 已配置保利威账号（`account current` / `account list` 通过），默认账号 `nicksu`。
- 已创建本轮专用测试频道 `7983941`（未开播即可审计配置与消息历史；点赞/奖励等实时推送类命令在未开播频道的行为见第 12 节）。
- CLI 版本：`polyv-live-cli@rc 1.2.31-rc.0`（以 `--help` 为准，不依赖 reference 旧描述）。

---

## 8. polyv-live-cli-rc 能力映射

| 业务动作 | 一级命令 | 子命令 | 读/写 |
|---|---|---|---|
| 查看聊天历史（审计） | `chat` | `chat list`（**必须带 `--start-day/--end-day`**） | 只读 |
| 当前聊天在线人数 | `chat` | `chat message online-count` | 只读 |
| 发管理员消息/公告 | `chat` | `chat send` | 写 |
| 置顶+弹窗公告 | `chat` | `chat notice add` / `chat notice list` | 写 + 读 |
| 账号级禁言词库 | `chat` | `chat badword add` / `chat badword list` / `chat badword delete` | 写 + 读 + 写 |
| 频道禁言/禁 IP/禁言词列表 | `chat` | `chat banned list -t userId/ip/badword` | 只读 |
| 账号禁言用户名册 | `chat` | `chat banned user-list` | 只读 |
| 在线聊天室用户 | `chat` | `chat role user-list`（需活跃 room） | 只读 |
| 观众点赞（氛围） | `interaction` | `interaction favor` | 写 |
| 奖励/礼物消息 | `interaction` | `interaction reward` | 写 |
| 任务奖励活动 | `interaction` | `interaction task-reward list` | 只读 |
| 互动监听事件 | `interaction` | `interaction event list` | 只读 |
| 问答 webhook 配置 | `interaction` | `interaction webhook get` | 只读 |

> `chat ban`/`unban`/`kick`/`unkick`（禁言/踢人）属高风险写入，需真实 viewer/user 且对生产观众有影响，本轮仅在测试频道未开播、无真实在线观众的条件下，以只读 `banned list`/`user-list` 建立治理基线，未对真实观众执行禁言/踢人；写入禁言词后即清理回归，避免污染账号配置。

---

## 9. 实施步骤

1. **账号预检**：`account current` / `account list` 确认 `nicksu`。
2. **建专用测试频道**：`channel create --scene alone --template alone`，得到 `7983941`，`channel get` 复核 `watchStatus=unStart`、`likes=0`。
3. **聊天侧基线**：`chat list`、`chat message online-count` 建立空基线。
4. **发公告消息**：`chat send` 发 2 条管理员消息（开播公告 + 互动测试），用 `chat list --start-day/--end-day` 交叉验证落库。
5. **置顶弹窗公告**：`chat notice add`（is-top Y、is-pop Y），`chat notice list` 验证。
6. **禁言词治理**：`chat badword add` 建账号级测试违禁词，`chat badword list` 验证，`chat badword delete` 清理回归。
7. **禁言/踢人名册基线**：`chat banned list`（userId/ip/badword）+ `chat banned user-list` 建立空基线。
8. **互动促活**：`interaction favor` 多次点赞，用 `channel get` 的 `likes` 字段交叉验证累计；`interaction reward` 尝试发奖励消息并记录失败。
9. **互动只读基线**：`interaction task-reward list`、`event list`、`webhook get` 建立空基线。
10. **收尾**：复核频道最终态、公告保留、违禁词已清理、测试频道保留未删除。

---

## 10. 命令执行台账

> 执行时间：2026-06-23 01:16–01:19（UTC+8）。账号 `nicksu`，频道 `7983941`。敏感值已脱敏。

| # | 时间 | 一级命令 / 子命令 | 实际命令（脱敏） | 对象 ID | 结果 | 关键输出摘要 |
|---|---|---|---|---|---|---|
| 1 | 01:16 | channel create | `channel create -n "GNHF-电商场景-12-…-202606230116" --scene alone --template alone -o json` | — | ✅ 成功 | `channelId=7983941`, status=waiting |
| 2 | 01:16 | channel get | `channel get -c 7983941 -o json` | 7983941 | ✅ 成功 | watchStatus=unStart, likes=0, publisher=主持人 |
| 3 | 01:16 | chat list | `chat list -c 7983941 -o json`（默认日期） | 7983941 | ✅ 成功（空） | `No chat messages found`（基线为空，符合预期） |
| 4 | 01:16 | chat message online-count | `chat message online-count -c 7983941 -o json` | 7983941 | ✅ 成功 | `onlineUserCount=0` |
| 5 | 01:16 | chat send | `chat send -c 7983941 -m "GNHF场景12-开播公告：今晚20:00新品首发，前100名下单赠周边" -n "品牌官方" -a "管理员" -o json` | 7983941 | ✅ 成功 | 返回 `{}`；消息 id `29a079c0-6e5e-11f1-b519-214569874387`（见 #7） |
| 6 | 01:16 | chat list | `chat list -c 7983941 -o json`（默认日期） | 7983941 | ⚠️ 问题 | 仍返回 `No chat messages found`（默认日期范围缺陷，见 12.1） |
| 7 | 01:17 | chat list | `chat list -c 7983941 --start-day 2026-06-23 --end-day 2026-06-23 -o json` | 7983941 | ✅ 成功 | 返回 msg1（id `29a079c0…`，content 匹配，status=pass，nickname=品牌官方）—— **交叉验证 #5 写入持久化** |
| 8 | 01:17 | chat send | `chat send -c 7983941 -m "GNHF场景12-互动测试消息2" -o json` | 7983941 | ✅ 成功 | 返回 `{}`；消息 id `36980670-6e5e-11f1-bda2-3d5c355e8ab9`（见 #9） |
| 9 | 01:17 | chat list | `chat list -c 7983941 --start-day 2026-06-22 --end-day 2026-06-23 -o json` | 7983941 | ✅ 成功 | 返回 msg1+msg2 共 2 条（ids `29a079c0`/`36980670`，均 status=pass）—— **交叉验证 #5/#8 写入持久化** |
| 10 | 01:18 | chat notice add | `chat notice add -c 7983941 --content "GNHF场景12-直播间公告：下单请备注GNHF，享专属赠品" --is-top Y --is-pop Y -f -o json` | 7983941 | ✅ 成功 | 返回 `true` |
| 11 | 01:18 | chat notice list | `chat notice list -c 7983941 -o json` | 7983941 | ✅ 成功 | `totalItems=1`，id=`301652`，content 匹配，`isTop=1`、`isPop=1`、`canClose=1` —— **交叉验证 #10 写入持久化** |
| 12 | 01:18 | chat badword add | `chat badword add --user-id 475b6884a7 --words "gnhf测试违禁词A,gnhf测试违禁词B" -f -o json` | 账号 475b6884a7 | ✅ 成功 | 返回 `{userId, count:2}` |
| 13 | 01:18 | chat badword list | `chat badword list -o json` | 账号级 | ✅ 成功 | `["gnhf测试违禁词A","gnhf测试违禁词B"]` —— **交叉验证 #12 写入持久化** |
| 14 | 01:18 | chat banned list | `chat banned list -c 7983941 -t userId -o json` | 7983941 | ✅ 成功（空） | `data=[]`（频道无禁言用户，基线） |
| 15 | 01:18 | chat banned list | `chat banned list -c 7983941 -t ip -o json` | 7983941 | ✅ 成功（空） | `data=[]`（频道无禁 IP，基线） |
| 16 | 01:18 | chat banned list | `chat banned list -c 7983941 -t badword -o json` | 7983941 | ✅ 成功（空） | `data=[]`（频道级无禁言词；账号级禁言词见 #13） |
| 17 | 01:18 | chat banned user-list | `chat banned user-list -o json` | 账号级 | ✅ 成功（空） | `totalItems=0`（账号无禁言用户，基线） |
| 18 | 01:18 | chat role user-list | `chat role user-list -r 7983941 -o json` | room 7983941 | ❌ 失败 | `Unexpected error: API Error`（未开播无活跃聊天室，见 12.2） |
| 19 | 01:19 | chat badword delete | `chat badword delete --words "gnhf测试违禁词A,gnhf测试违禁词B" -f -o json` | 账号级 | ✅ 成功 | 返回 `[]` |
| 20 | 01:19 | chat badword list | `chat badword list -o json` | 账号级 | ✅ 成功 | `[]` —— **交叉验证 #19 清理回归** |
| 21 | 01:17 | interaction task-reward list | `interaction task-reward list -c 7983941 -o json` | 7983941 | ✅ 成功（空） | `totalItems=0`（无任务奖励活动，基线） |
| 22 | 01:17 | interaction event list | `interaction event list --room-id 7983941 -o json` | room 7983941 | ✅ 成功（空） | `{list:[]}`（无互动监听事件，基线） |
| 23 | 01:17 | interaction webhook get | `interaction webhook get --room-id 7983941 -o json` | room 7983941 | ✅ 成功 | `{callbackUrl:""}`（未配置问答 webhook，基线） |
| 24 | 01:18 | interaction favor | `interaction favor -c 7983941 --viewer-id 4_611…gln6 --times 10 -f -o json` | 7983941 / viewer 批量测试用户1 | ✅ 成功 | 返回 `10`；`channel get` 复查 `likes` 由 0→10 |
| 25 | 01:18 | interaction favor | `interaction favor -c 7983941 --viewer-id 4_611…gln6 --times 5 -f -o json` | 7983941 / viewer 批量测试用户1 | ✅ 成功 | 返回 `15`；`channel get` 复查 `likes` 由 10→15 —— **交叉验证 favor 累计写入持久化** |
| 26 | 01:18 | interaction reward | `interaction reward -c 7983941 --viewer-id … --nickname … --content … --good-num 1 -f -o json` | 7983941 | ❌ 失败（CLI） | `required option '--avatar <url>' not specified`（见 12.3） |
| 27 | 01:18 | interaction reward | 同 #26 + `--avatar …` | 7983941 | ❌ 失败（CLI） | `required option '--donate-type <type>' not specified` |
| 28 | 01:18 | interaction reward | 同 #27 + `--donate-type 1` | 7983941 | ❌ 失败（API） | `sendRewardMsg failed: invalid donate type` |
| 29 | 01:18 | interaction reward | 同 #27 + `--donate-type good` | 7983941 | ❌ 失败（API） | `param should not be empty: goodImage`（good 类型需 --good-image） |
| 30 | 01:18 | interaction reward | #29 + `--good-image <videocc CDN 图>` | 7983941 | ❌ 失败（API） | `sendRewardMsg failed: send message failure`（疑似需活跃聊天室/直播态，见 12.3） |
| 31 | 01:19 | channel get（收尾） | `channel get -c 7983941 -o json` | 7983941 | ✅ 成功 | watchStatus=unStart, likes=15, pageView=0（频道保留） |

---

## 11. 实际使用的 CLI 命令与真实参数

```bash
# 0) 账号预检
npx --yes polyv-live-cli@rc account current
npx --yes polyv-live-cli@rc account list

# 1) 建专用测试频道（保留，不删除）
npx --yes polyv-live-cli@rc channel create \
  -n "GNHF-电商场景-12-chat-interaction-engagement-202606230116" \
  --scene alone --template alone -o json
# => channelId 7983941

# 2) chat：发管理员消息并交叉验证（注意：必须带 --start-day/--end-day）
npx --yes polyv-live-cli@rc chat send -c 7983941 \
  -m "GNHF场景12-开播公告：今晚20:00新品首发，前100名下单赠周边" \
  -n "品牌官方" -a "管理员" -o json
npx --yes polyv-live-cli@rc chat list -c 7983941 \
  --start-day 2026-06-23 --end-day 2026-06-23 -o json

# 3) chat：置顶+弹窗公告（写入 + 读回）
npx --yes polyv-live-cli@rc chat notice add -c 7983941 \
  --content "GNHF场景12-直播间公告：下单请备注GNHF，享专属赠品" \
  --is-top Y --is-pop Y -f -o json
npx --yes polyv-live-cli@rc chat notice list -c 7983941 -o json

# 4) chat：账号级禁言词治理（写入 + 读回 + 清理）
npx --yes polyv-live-cli@rc chat badword add \
  --user-id 475b6884a7 \
  --words "gnhf测试违禁词A,gnhf测试违禁词B" -f -o json
npx --yes polyv-live-cli@rc chat badword list -o json
npx --yes polyv-live-cli@rc chat badword delete \
  --words "gnhf测试违禁词A,gnhf测试违禁词B" -f -o json   # 清理回归

# 5) chat：禁言/禁IP/禁言词/账号禁言名册（只读基线）
npx --yes polyv-live-cli@rc chat banned list -c 7983941 -t userId -o json
npx --yes polyv-live-cli@rc chat banned list -c 7983941 -t ip -o json
npx --yes polyv-live-cli@rc chat banned list -c 7983941 -t badword -o json
npx --yes polyv-live-cli@rc chat banned user-list -o json
npx --yes polyv-live-cli@rc chat message online-count -c 7983941 -o json

# 6) interaction：点赞促活（写入 + channel get 交叉验证累计 likes）
npx --yes polyv-live-cli@rc interaction favor -c 7983941 \
  --viewer-id <viewerUnionId> --times 10 -f -o json
npx --yes polyv-live-cli@rc channel get -c 7983941 -o json   # 复核 likes 字段

# 7) interaction：只读基线
npx --yes polyv-live-cli@rc interaction task-reward list -c 7983941 -o json
npx --yes polyv-live-cli@rc interaction event list --room-id 7983941 -o json
npx --yes polyv-live-cli@rc interaction webhook get --room-id 7983941 -o json
```

---

## 12. 执行或验证结果 / 问题记录

### 12.1【问题】`chat list` 默认日期范围返回空，显式同日 `--start-day/--end-day` 才返回消息

- **现象**：`chat send` 两次均返回 `{}`（无报错）；但随后 `chat list -c 7983941`（**不带**日期参数，文档称默认 today）连续两次返回 `No chat messages found`。改用 `chat list -c 7983941 --start-day 2026-06-23 --end-day 2026-06-23`（与默认应等价的同日）立即返回 2 条消息（ids `29a079c0`/`36980670`，status=pass，content 与 send 一一对应）；宽窗口 `--start-day 2026-06-22 --end-day 2026-06-23` 同样返回 2 条。
- **结论**：消息**确实已落库**（send 成功且持久化），问题出在 `chat list` 的「默认日期范围」查询窗口与显式同日不一致——默认分支命不中当日消息，显式同日才命中。根因疑似 CLI 默认日期的服务端时区/边界计算缺陷（凌晨 01:1x 发送、客户端本地为 6/23，默认窗口可能落在前一自然日）。
- **运营影响与建议**：**做聊天审计/留痕时必须显式传 `--start-day` 与 `--end-day`**，不能依赖默认 today，否则会误判为「无聊天记录」。排查时已排除「send 未持久化」假设（显式同日能查到）。

### 12.2【问题】`chat role user-list` 在未开播频道返回 `Unexpected error: API Error`

- **现象**：`chat role user-list -r 7983941 -o json` 返回 `Unexpected error: API Error`（重复两行，exit 非 0）。
- **结论**：`role user-list` 查询的是**在线聊天室用户**，未开播频道（watchStatus=unStart）无活跃聊天室/room session，后端直接抛 API Error。与场景 06 `checkin start`「签到需开播」、`chat` 实时推送类命令同属「面向活跃直播态」家族。`-r/--room-id` 取频道 ID 即主聊天室。
- **运营建议**：编排在线观众名册/实时场控脚本必须挂在确认开播之后；未开播时该命令不可用，不作为覆盖失败（命令本身被真实执行、返回明确错误）。

### 12.3【问题】`interaction reward` 多个未标 required 的必填项 + 最终需活跃聊天室

- **现象与排查链**：
  1. 不带 `--avatar` → CLI 报 `required option '--avatar <url>' not specified`（help 中 `--avatar` 未标 required）。
  2. 补 `--avatar` 后报 `required option '--donate-type <type>' not specified`（同样未标 required）。
  3. `--donate-type 1` → API 报 `invalid donate type`（数值非法）。
  4. `--donate-type good` → API 报 `param should not be empty: goodImage`（`good` 类型为合法值，但强制要 `--good-image`，且图片须为保利威白名单域名）。
  5. 补 `--good-image`（videocc CDN 图）→ API 报 `sendRewardMsg failed: send message failure`（通用失败）。
- **结论**：`interaction reward` 的 `--avatar`、`--donate-type`、（`good` 类型下）`--good-image` 都是**真实必填但 help 未标注**，且最终发奖消息是面向活跃聊天室的实时推送，未开播频道无法成功（与 12.2 同根因）。`donate-type` 的合法枚举值 help 未列出（实测 `good` 合法、`1` 非法）。
- **运营建议**：发奖励消息需在直播中、且 viewer 已进入聊天室时执行；`--avatar` 用保利威默认头像、`--donate-type good` 配 `--good-image`（保利威 CDN 图）。help 标注缺陷已记录，配置时以逐层 `--help` + 实测为准。

### 12.4【验证通过】`interaction favor` 经 `channel get` 的 `likes` 字段交叉确认累计持久化

| 步骤 | favor 调用 | favor 返回 | `channel get` 的 `likes` |
|---|---|---|---|
| 建频道基线 | — | — | **0** |
| 第 1 次点赞 | `--times 10` | `10` | **10** |
| 第 2 次点赞 | `--times 5` | `15` | **15** |

- **结论**：`interaction favor` 每次按 `--times` **累加**频道点赞计数，返回值是**累计总数**（第 2 次传 5 返回 15，而非 5）；`channel get` 的 `likes` 字段同步从 0→10→15，**配置侧已确认持久化**。这是 `interaction` 族少有的「写入→频道级只读交叉验证」原语。
- **观众侧说明**：点赞计数会在观看页显示并参与氛围动效，但本轮未打开观看页做观众侧截图核验，仅声明**配置侧已满足**（likes 累计写入并经 `channel get` 读回）。

### 12.5【验证通过】`chat` 三类写入均经只读读回确认持久化

| 写入 | 读回验证 | 结果 |
|---|---|---|
| `chat send` ×2 | `chat list --start-day/--end-day` | 返回 2 条，id/content/nickname 一一对应 ✅ |
| `chat notice add` | `chat notice list` | `totalItems=1`，id=301652，isTop=1/isPop=1 ✅ |
| `chat badword add` | `chat badword list` | 返回 `[词A,词B]` ✅；`badword delete` 后回归 `[]` ✅ |

---

## 13. 风险点与回滚/清理方式

| 风险 | 说明 | 回滚/清理 |
|---|---|---|
| 账号级禁言词污染 | `chat badword add --user-id` 是**账号级**写入，命中后影响本账号**所有频道**的评论过滤 | 本轮已用 `chat badword delete --words …` 清理回归（`badword list` 复查为 `[]`）；生产维护禁言词务必先评估对全部直播间的副作用 |
| 禁言/踢人误伤真实观众 | `chat ban`/`kick`/`ip-add` 对生产观众即时生效 | 本轮**未对真实观众执行**，仅以 `banned list`/`user-list` 建只读基线；需禁言/踢人时务必先用 `viewer list` 核对 viewerId |
| 聊天消息/公告留痕 | `chat send`/`notice add` 会写入频道聊天历史与公告 | 公告与消息保留在测试频道 `7983941`（已保留）；可用 `chat notice clean -c <id>` 与 `chat delete -c <id> -m <id>` 清理 |
| 点赞计数被改写 | `interaction favor` 直接累加频道 `likes`，无法回减 | 测试频道 `likes` 已被改为 15 并保留；生产场控点赞需谨慎频次 |
| 奖励消息误发 | `interaction reward` 成功时会在聊天室公屏推送礼物动效 | 本轮未成功（需直播态）；生产需在直播中、确认 viewer 在线时发 |

### 可选人工清理命令（**未执行**，仅备查）

```bash
# 清空测试频道公告（未执行）
npx --yes polyv-live-cli@rc chat notice clean -c 7983941 -f
# 清空测试频道聊天消息（未执行）
npx --yes polyv-live-cli@rc chat delete -c 7983941 --clear -f
# 删除测试频道（未执行；频道已保留供人工查看配置）
# npx --yes polyv-live-cli@rc channel delete -c 7983941 -f
```

> 上述清理命令**均未执行**。频道 `7983941`、公告 id 301652、2 条聊天消息、likes=15 均保留。

---

## 14. 保留资产说明

| 资产 | 状态 | 说明 |
|---|---|---|
| 测试频道 `7983941` | **保留** | 未执行删除，供人工查看聊天/公告/点赞配置 |
| 管理员聊天消息 ×2 | 保留 | ids `29a079c0-…` / `36980670-…`（经 `chat list --start-day 2026-06-23 --end-day 2026-06-23` 可查） |
| 频道公告 | 保留 | id `301652`（置顶 + 弹窗，经 `chat notice list` 可查） |
| 账号级禁言词 | **已清理** | `gnhf测试违禁词A/B` 已 `badword delete`，`badword list` 复查为 `[]` |
| 频道 `likes` 计数 | 保留为 15 | 由 `interaction favor` 累加，`channel get` 可查 |

---

## 15. 可复用模板

### 电商直播「互动治理 + 促活」一键编排（直播中执行效果最佳）

```bash
CHANNEL=<频道ID>
USER=<账号userId>
VIEWER=<viewerUnionId>
DAY=$(date +%Y-%m-%d)

# ① 发开播公告（管理员身份）
polyv-live-cli chat send -c "$CHANNEL" -m "下单备注【品牌名】享专属赠品，前100名加赠周边" -n "品牌官方" -a "管理员"

# ② 置顶+弹窗公告（下单规则强提示）
polyv-live-cli chat notice add -c "$CHANNEL" --content "满399减50，限时秒杀20:00开抢" --is-top Y --is-pop Y -f

# ③ 维护账号级违禁词库（账号级，影响所有频道，谨慎）
polyv-live-cli chat badword add --user-id "$USER" --words "竞品A,外链导流,加微信" -f
polyv-live-cli chat badword list            # 复核

# ④ 审计当日聊天（必须显式日期！默认 today 不可靠）
polyv-live-cli chat list -c "$CHANNEL" --start-day "$DAY" --end-day "$DAY" -o json

# ⑤ 在线人数 / 在线观众名册（需直播中）
polyv-live-cli chat message online-count -c "$CHANNEL"
polyv-live-cli chat role user-list -r "$CHANNEL"

# ⑥ 关键节点点赞暖场（累计写入频道 likes）
polyv-live-cli interaction favor -c "$CHANNEL" --viewer-id "$VIEWER" --times 50 -f
polyv-live-cli channel get -c "$CHANNEL" -o json   # 复核 likes

# ⑦ 发奖励/礼物消息（需直播中 + viewer 在线 + donate-type good + 保利威 CDN 礼物图）
polyv-live-cli interaction reward -c "$CHANNEL" --viewer-id "$VIEWER" \
  --nickname "幸运观众" --avatar "<保利威默认头像>" --donate-type good \
  --good-image "<保利威CDN礼物图>" --content "恭喜中奖！" --good-num 1 -f
```

---

## 16. 后续可扩展方向

- **真实禁言/踢人闭环**：在有真实在线观众的直播中，演练 `chat ban`/`unban`/`kick`/`unkick` + `chat banned ip-add` 全生命周期，并用 `banned list`/`kicked list`/`forbid-list` 前后对比验证（本轮因无在线观众仅建只读基线）。
- **`chat enabled update` 频道聊天开关**：批量 `--channel-ids --chat-enabled Y/N` 写入；当前 CLI 无 `chat enabled get` 读回路径，需结合观看页或后台复核，避免「成功假象」（与场景 05 `watch-condition set` 同类风险）。
- **`interaction task-reward create` 任务奖励活动**：需 `--activity-name`/`--task-rule`/`--tasks-json`/`start-time`/`end-time`，其中 `--tasks-json` 结构 help 未给出，需以最深层 `--help` 或后台导出样例为准后再写入（本轮未猜参数）。
- **`interaction event save` 互动监听事件 / `interaction script upload` 伪直播盘视频互动脚本 / `interaction invite-poster create` 邀请海报**：均为写入类，可结合对应业务（互动监听埋点、伪直播互动、邀请裂变）专项覆盖。
- **聊天消息高级能力**：`chat message custom-send`（自定义消息）、`audit`（消息审核项）、`emit-by-user-id`（按 user 定向广播）、`speak-list`（发言记录）等子命令，可扩展为「直播后合规审计」专项。
- **`chat censor`（聊天审核设置）/ `chat qa`（聊天问答记录）/ `chat robot`（聊天机器人）**：未在本轮触达的 `chat` 子命令族，可作为下一轮「智能客服/自动应答」场景。
