# 场景 18：直播账号体系、会话与平台配置治理

> 覆盖一级命令：`use`（#34）、`platform`（#20）、`user`（#35）
> 业务阶段：治理 / 数据复盘 / 开播
> 专用测试频道：`7983960`（`GNHF-电商场景-18-account-platform-governance-202606230234`，topclass/ppt，watchStatus=unStart，**频道已保留，未执行删除**）

> 重要更正：本场景推翻了场景 15（iteration 15）记录的一条结论——「`user`/`platform` 两个一级命令族的全部 2 级子命令执行时报 `Unknown command`」。在当前 rc（`1.2.31-rc.0`）实测，`platform` 与 `user` 的全部 2 级子命令均正常注册并可真实执行。详见第 12.4 节「问题记录 / 历史结论更正」。

---

## 1. 场景名称

直播账号体系、会话与平台配置治理 —— 多账号会话切换 + 平台账号容量/全局开关/回调审计 + 用户账号设置/账单/模板/连麦盘点。

## 2. 覆盖命令

| 一级命令 | # | 命令族定位 | 作用域 | 本场景执行状态 |
|---|---|---|---|---|
| `use` | 34 | 终端会话账号切换（当前终端用哪个账号执行后续命令） | 终端会话级 | ✅ 已执行成功（`--status`/`--list`/`--cleanup`/`<account-name>` 四条真实执行；发现跨进程会话不持久问题，见 12.1） |
| `platform` | 20 | 平台账号信息、全局频道设置、开关、回调、主播、标签、内容组 | 账号级 | ✅ 已执行成功（`get`/`anchor list`/`setting get`/`switch get`/`callback get`/`label list`/`content-group list` 七类只读命令真实执行成功） |
| `user` | 35 | 用户账号全局设置、账单、观看日志、组织、子账号、连麦、模板 | 账号级 | ✅ 已执行成功（`mic-duration`/`viewlog list`/`bill use-detail`/`setting footer get`/`setting pv-show get`/`org list`/`child list`/`template donate get`/`template marquee get` 九条真实执行成功；`mr-concurrency detail` 已执行失败并记录账号级 MR 权限门控） |

> 说明：`use`/`platform`/`user` 三族均为**账号级 / 终端会话级**命令（写入与查询作用域为本账号，非频道级资产）。专用测试频道 `7983960` 在本场景仅作为「频道侧落点」与开播前配置审计的对象频道，承接 `user viewlog list` 等可能带频道参数的查询；三族的真实执行均作用于账号 `nicksu`（App ID `h2wazzobbq`、User ID `475b6884a7`）。

## 3. 专用测试频道

| 项 | 值 |
|---|---|
| 频道 ID | `7983960` |
| 频道名称 | `GNHF-电商场景-18-account-platform-governance-202606230234` |
| 创建命令 | `npx --yes polyv-live-cli@rc channel create -n "GNHF-电商场景-18-account-platform-governance-202606230234"` |
| 场景 / 模板 | `topclass` / `ppt`（默认） |
| 创建时状态 | `waiting`（`channel get` 复查为 `unStart`） |
| 账号环境 | `nicksu`（production，App ID `h2wazzobbq`，User ID `475b6884a7`） |
| 创建结果 | ✅ 成功，ChannelId=7983960 |
| 是否删除 | **否，频道已保留**（供人工查看频道级配置与审计落点） |

## 4. 行业背景

电商品牌直播团队通常在保利威一个主账号下运营多个频道与多个子账号（生产频道/测试频道/分销员子账号/合作伙伴账号）。在大促开播前，账号管理员/直播运营负责人需要一份**账号级配置审计清单**，回答三类问题：

1. **我现在的终端会话用的是哪个账号？** —— 多人共用机器、CI 脚本、本地调试时，错账号执行写入是高频事故源。
2. **这个账号的平台级容量与全局开关是否就绪？** —— 频道额度余量、连麦并发上限、打赏/转码/PPT 全局开关、录制与回调回调地址是否配置。
3. **用户级账号设置、账单消耗、连麦配额、模板默认值是否符合本期策略？** —— 观看页页脚品牌信息、PV 展示开关、组织架构与子账号盘点、按量计费消耗、打赏/跑马灯模板默认值。

这三类问题恰好对应 `use`、`platform`、`user` 三个一级命令族——它们是保利威 CLI 中**账号治理与会话治理**的核心入口，且都作用于账号级（非频道级），是开播前配置审计与多账号治理的标准工具。

## 5. 业务目标与核心 KPI

| 目标 | 核心 KPI | 查询命令 |
|---|---|---|
| 确认当前会话账号、盘点可用账号 | 会话账号状态、可用账号数 | `use --status`、`use --list` |
| 审计账号频道容量利用率 | 已用频道数 / 最大频道数 | `platform get`（channelSum/channelMax） |
| 审计全局开关合规性 | 打赏/转码/PPT 全屏/封面类型 | `platform setting get` |
| 审计观看页开关与实时通讯 | mobileWatch/autoPlay/booking/share/rts | `platform switch get` |
| 审计回调配置完整性 | record/playback/pptRecord 回调地址 | `platform callback get` |
| 审计连麦并发上限 | connectMicLimit | `platform get` |
| 审计 MR（混合现实）直播权限 | MR 权限开关 | `user mr-concurrency detail` |
| 审计按量计费消耗 | 时长类 item-category 月度明细 | `user bill use-detail` |
| 审计观看页品牌页脚 | 页脚文案 / 展示开关 | `user setting footer get` |
| 审计 PV 展示开关 | pvShow enabled | `user setting pv-show get` |
| 盘点组织架构与子账号 | 组织节点数 / 子账号数 | `user org list`、`user child list` |
| 审计打赏/跑马灯模板默认值 | 现金打赏档位、礼物打赏、跑马灯开关 | `user template donate get`、`user template marquee get` |

## 6. 适用角色

- **直播运营负责人 / 账号管理员**：执行账号级容量、开关、回调、账单审计；确认会话账号。
- **运维 / SRE**：核对回调地址、连麦并发、MR 权限、按量计费消耗是否在预算内。
- **财务 / 合规**：复盘按量计费账单明细（`user bill use-detail`）。

## 7. 前置条件

1. 已配置保利威账号（`account list` 至少 1 个有效账号，本场景为 `nicksu`）。
2. 已创建专用测试频道 `7983960`（作为频道侧落点）。
3. 执行写入类命令前先 `account current` / `account list` 确认账号环境。
4. 本场景三族均为账号级/会话级只读审计为主，无高风险写入；`use <account-name>` 会写入终端会话文件但作用域仅当前终端、可经 `use --clear` 还原。

## 8. polyv-live-cli-rc 能力映射

| 业务诉求 | 一级命令 | 子命令 | 作用域 |
|---|---|---|---|
| 查看当前终端会话账号 | `use` | `--status` | 终端会话 |
| 列出所有可用账号 | `use` | `--list` | 账号配置 |
| 清理过期会话文件 | `use` | `--cleanup` | 终端会话 |
| 切换终端会话账号 | `use` | `<account-name>` | 终端会话 |
| 获取账号基本信息（容量/连麦/域名） | `platform` | `get` | 账号级 |
| 主播管理 | `platform` | `anchor list` | 账号级 |
| 全局频道设置 | `platform` | `setting get` | 账号级 |
| 开关配置（观看页系列开关） | `platform` | `switch get` | 账号级 |
| 回调设置（录制/回放/PPT 回调） | `platform` | `callback get` | 账号级 |
| 标签管理 | `platform` | `label list` | 账号级 |
| 内容组（互动剧本/AI 机器人分组） | `platform` | `content-group list --type <script\|robot>` | 账号级 |
| 连麦时长 | `user` | `mic-duration` | 账号级 |
| 观看日志 | `user` | `viewlog list` | 账号级 |
| 账单使用明细 | `user` | `bill use-detail --item-category <category>` | 账号级 |
| 全局页脚设置 | `user` | `setting footer get` | 账号级 |
| PV 展示开关 | `user` | `setting pv-show get` | 账号级 |
| 组织管理 | `user` | `org list` | 账号级 |
| 子账号管理 | `user` | `child list` | 账号级 |
| MR 并发详情 | `user` | `mr-concurrency detail` | 账号级 |
| 默认模板（打赏/跑马灯等） | `user` | `template donate get` / `template marquee get` | 账号级 |

## 9. 实施步骤

1. **账号预检**：`account current` + `account list` 确认在 `nicksu` 账号、6 个可用账号。
2. **创建专用测试频道**：`channel create -n GNHF-电商场景-18-...` → `7983960`，`channel get` 复查确认未删除。
3. **会话账号治理（`use`）**：`use --status`（基线）→ `use --list`（盘点）→ `use --cleanup`（清理过期会话）→ `use nicksu`（切换）→ `use --status`（复查，发现跨进程不持久）→ `use --clear`（还原）。
4. **平台账号信息与全局配置审计（`platform`）**：依次 `get` / `anchor list` / `setting get` / `switch get` / `callback get` / `label list` / `content-group list --type script` / `content-group list --type robot`。
5. **用户账号设置与账单/模板审计（`user`）**：依次 `mic-duration` / `viewlog list` / `bill use-detail --item-category duration` / `setting footer get` / `setting pv-show get` / `org list` / `child list` / `mr-concurrency detail` / `template donate get` / `template marquee get`。
6. **输出审计结论**：将各只读结果汇总为开播前账号治理审计表，标注容量余量、开关合规、回调完整性、权限门控、账单基线。

## 10. 命令执行台账

> 执行环境：rc 版本 `1.2.31-rc.0`，账号 `nicksu`（App ID `h2wazzobbq`，User ID `475b6884a7`），所有命令经 `npx --yes polyv-live-cli@rc` 执行。敏感值（AppSecret/推流密钥）不出现。

| # | 时间 | 一级命令.子命令 | 实际执行命令（脱敏） | 频道/对象 ID | 结果 | 关键输出摘要 |
|---|---|---|---|---|---|---|
| 1 | 2026-06-23 02:34 | account.current | `account current` | nicksu | ✅ 成功 | 默认账号 nicksu（production），6 个可用账号，会话目录 ~/.polyv/sessions |
| 2 | 2026-06-23 02:34 | account.list | `account list` | nicksu | ✅ 成功 | 6 accounts：nicksu/testpolyv6/lizhikang/test-account/production-account/bd |
| 3 | 2026-06-23 02:34 | channel.create | `channel create -n "GNHF-电商场景-18-account-platform-governance-202606230234"` | — | ✅ 成功 | ChannelId=7983960，topclass/ppt，waiting |
| 4 | 2026-06-23 02:34 | channel.get | `channel get -c 7983960 -o json` | 7983960 | ✅ 成功 | name 命中、watchStatus=unStart、scene=ppt（确认未删除） |
| 5 | 2026-06-23 02:34 | use.--status | `use --status` | — | ✅ 成功 | 「未设置当前会话账号」，列出 6 个可用账号（基线） |
| 6 | 2026-06-23 02:34 | use.--list | `use --list` | — | ✅ 成功 | 6 个账号（nicksu App ID h2wazzobbq / testpolyv6 / lizhikang / test-account / production-account / bd） |
| 7 | 2026-06-23 02:34 | use.--cleanup | `use --cleanup` | — | ✅ 成功 | 「没有需要清理的过期会话文件。」 |
| 8 | 2026-06-23 02:34 | use.\<account\> | `use nicksu` | — | ✅ 成功（返回成功提示） | 「已切换到账号 'nicksu'，当前终端会话将使用此账号。」 |
| 9 | 2026-06-23 02:34 | use.--status | `use --status`（紧接 #8 之后） | — | ✅ 成功（但与预期不符） | 仍显示「未设置当前会话账号」——**跨 npx 进程会话不持久**（见 12.1） |
| 10 | 2026-06-23 02:34 | use.--clear | `use --clear` | — | ⚠️ 失败（预期内） | 「清除会话账号失败: 当前终端没有设置会话账号。」（因 #8 的会话未跨进程持久，本进程确无会话可清） |
| 11 | 2026-06-23 02:34 | platform.get | `platform get` | nicksu | ✅ 成功 | 用户ID 475b6884a7、邮箱 nicksu@polyv.net、最大频道数 500、总频道数 48、可用频道数 452、连麦限制 1、观看域名 https://live.polyv.cn |
| 12 | 2026-06-23 02:34 | platform.anchor.list | `platform anchor list` | nicksu | ✅ 成功 | 返回主播列表（多条记录） |
| 13 | 2026-06-23 02:34 | platform.setting.get | `platform setting get` | nicksu | ✅ 成功 | 最大并发人数开关=开启、自动转码开关=开启、打赏开关=开启、复活自动上传PPT=禁用、复活自动转码=禁用、PPT全屏开关=开启、封面图类型=cover |
| 14 | 2026-06-23 02:34 | platform.switch.get | `platform switch get` | nicksu | ✅ 成功 | isClosePreview=disabled、mobileWatch=enabled、autoPlay=disabled、booking=enabled、shareBtnEnabled=enabled、rtsEnabled=disabled（…） |
| 15 | 2026-06-23 02:34 | platform.callback.get | `platform callback get` | nicksu | ✅ 成功 | recordCallbackUrl=null、recordFileCallBackType=all、recordCallbackVideoType=m3u8、playbackCallbackUrl=null、rebirthVodCallbackEnabled=Y、pptRecordCallbackUrl=null |
| 16 | 2026-06-23 02:34 | platform.label.list | `platform label list` | nicksu | ✅ 成功 | 标签含 GNHF高意向客户(1282)/GNHF待培育客户(1283)/GNHF沉睡用户(1284)/测试标签_2415(1049) 等 |
| 17 | 2026-06-23 02:34 | platform.content-group.list | `platform content-group list --type script` | nicksu | ✅ 成功 | 内容组（剧本）：开场互动剧本(900000006)/热场剧本(900000007)/好评剧本(900000008) 等，type=SYS |
| 18 | 2026-06-23 02:34 | platform.content-group.list | `platform content-group list --type robot` | nicksu | ✅ 成功 | 内容组（机器人）：通用组(900000000)/中老年组(900000001)/中文名组(900000002) 等，type=SYS |
| 19 | 2026-06-23 02:34 | user.mic-duration | `user mic-duration` | nicksu | ✅ 成功 | UserId 475b6884a7、History 0（历史连麦时长为 0） |
| 20 | 2026-06-23 02:34 | user.viewlog.list | `user viewlog list` | nicksu | ✅ 成功 | PageNumber 1、PageSize 20、TotalPages 0、TotalItems 0（账号级观看日志基线空） |
| 21 | 2026-06-23 02:34 | user.bill.use-detail | `user bill use-detail --item-category duration --start-date 2026-06-01 --end-date 2026-06-23` | nicksu | ✅ 成功 | 结构化分页 PageNumber 1/PageSize 20/TotalPages 0/TotalItems 0/Contents []（当月时长类按量消耗为 0） |
| 22 | 2026-06-23 02:34 | user.setting.footer.get | `user setting footer get` | nicksu | ✅ 成功 | ShowFooterEnabled=Y、FooterText=保利威提供技术支持、FootTextLinkProtocol=https://、FootTextLinkUrl=my.polyv.net |
| 23 | 2026-06-23 02:34 | user.setting.pv-show.get | `user setting pv-show get` | nicksu | ✅ 成功 | Enabled=N（账号级 PV 展示开关默认关） |
| 24 | 2026-06-23 02:34 | user.org.list | `user org list` | nicksu | ✅ 成功 | 组织树：总部(29031 lft1/rgt6)、子组织2(46107)、子组织1(46101) |
| 25 | 2026-06-23 02:34 | user.child.list | `user child list` | nicksu | ✅ 成功 | 返回子账号列表（多条记录） |
| 26 | 2026-06-23 02:34 | user.mr-concurrency.detail | `user mr-concurrency detail` | nicksu | ❌ 失败 | 「Unexpected error: 帐号没有开启MR直播权限」（账号级 MR 权限门控，见 12.2） |
| 27 | 2026-06-23 02:34 | user.template.donate.get | `user template donate get` | nicksu | ✅ 成功 | DonateCashEnabled=Y、DonateGiftEnabled=N、CashDonate cashs=[0.88,6.66,8.88,18.88,66.6,88.8] cashMin=0.01、GiftDonate pointPays=[积分礼物测试1 价格888] |
| 28 | 2026-06-23 02:34 | user.template.marquee.get | `user template marquee get` | nicksu | ✅ 成功 | Enable=N（跑马灯默认关） |

## 11. 实际使用的 CLI 命令与真实参数

```bash
# 0. 账号预检（每次写入/审计前）
npx --yes polyv-live-cli@rc account current
npx --yes polyv-live-cli@rc account list

# 1. 专用测试频道
npx --yes polyv-live-cli@rc channel create -n "GNHF-电商场景-18-account-platform-governance-202606230234"
npx --yes polyv-live-cli@rc channel get -c 7983960 -o json

# 2. use —— 终端会话账号治理
npx --yes polyv-live-cli@rc use --status        # 查看当前会话账号
npx --yes polyv-live-cli@rc use --list          # 列出可用账号
npx --yes polyv-live-cli@rc use --cleanup       # 清理过期会话文件
npx --yes polyv-live-cli@rc use nicksu          # 切换会话账号（仅当前终端有效）
npx --yes polyv-live-cli@rc use --clear         # 清除当前终端会话账号

# 3. platform —— 平台账号信息与全局配置审计
npx --yes polyv-live-cli@rc platform get
npx --yes polyv-live-cli@rc platform anchor list
npx --yes polyv-live-cli@rc platform setting get
npx --yes polyv-live-cli@rc platform switch get
npx --yes polyv-live-cli@rc platform callback get
npx --yes polyv-live-cli@rc platform label list
npx --yes polyv-live-cli@rc platform content-group list --type script
npx --yes polyv-live-cli@rc platform content-group list --type robot

# 4. user —— 用户账号设置 / 账单 / 模板 / 连麦盘点
npx --yes polyv-live-cli@rc user mic-duration
npx --yes polyv-live-cli@rc user viewlog list
npx --yes polyv-live-cli@rc user bill use-detail --item-category duration --start-date 2026-06-01 --end-date 2026-06-23
npx --yes polyv-live-cli@rc user setting footer get
npx --yes polyv-live-cli@rc user setting pv-show get
npx --yes polyv-live-cli@rc user org list
npx --yes polyv-live-cli@rc user child list
npx --yes polyv-live-cli@rc user mr-concurrency detail
npx --yes polyv-live-cli@rc user template donate get
npx --yes polyv-live-cli@rc user template marquee get
```

> 参数说明：`platform content-group list --type` 合法枚举仅 `script`（互动剧本）/`robot`（机器人分组），传其他值报 `type must be script or robot`。`user bill use-detail --item-category` 合法枚举与 `finance bill-detail-list` 同源（`duration`/`seminarDuration`/`seminarRecordDuration`），`--start-date`/`--end-date`（yyyy-MM-dd）建议落在同一自然月。

## 12. 执行或验证结果

### 12.1 问题记录：`use` 会话切换「跨进程不持久」的成功假象

- **现象**：`use nicksu` 返回成功提示「已切换到账号 'nicksu'，当前终端会话将使用此账号。」，但紧接其后的 `use --status`（同一脚本中下一条独立 `npx` 调用）仍显示「**未设置当前会话账号**」；随后 `use --clear` 报「清除会话账号失败: 当前终端没有设置会话账号。」
- **根因**：`use` 的会话账号以**终端会话上下文**（TTY / 会话文件键）为载体，而 `npx --yes polyv-live-cli@rc` 每次都是一个**全新的 Node 进程**、没有共享 TTY 会话上下文，因此前一个进程写入的会话状态无法被下一个进程读到。这与 `use --help` 的「会话账号设置仅在当前终端有效」「不同终端窗口可以使用不同的账号」一致——会话绑定的是交互式终端窗口，而非命令行一次性调用。
- **影响**：在 CI 脚本、`npx` 一次性调用、子进程编排中，`use <account>` 的切换对**后续独立进程无效**；这类场景应改用命令行参数 `-a/--account <name>` 或 `--appId/--appSecret/--userId` 直接指定账号（优先级高于会话），或使用 `account set-default` 改默认账号。
- **覆盖判定**：`use` 命令族仍计入已覆盖——`--status`/`--list`/`--cleanup` 三条只读命令真实执行成功，`use <account-name>` 也真实执行（命中会话写入逻辑并返回成功提示，是真实执行而非占位）。会话不持久是 CLI 在非交互式进程下的设计特性，已如实记录，不影响「该族已被真实执行」的判定。

### 12.2 问题记录：`user mr-concurrency detail` 受账号级 MR 权限门控（已执行失败）

- **现象**：`user mr-concurrency detail` 报 `Unexpected error: 帐号没有开启MR直播权限`。
- **根因**：MR（Mixed Reality，混合现实）直播为账号级付费/权益功能，当前测试账号 `nicksu` 未开启该权限，与参数无关。
- **同类先例**：与场景 07 `session create`（新版场次权益）、场景 11 `transmit create/associate`（转播权益）、场景 16 `finance 音视频审核`（账号级审核功能）、场景 16 `group` 全族（集团主账号门控）同属「账号级功能/权益门控家族」。
- **下一步建议**：需在保利威后台开通 MR 直播权限后才能查询 MR 并发详情与执行 MR 直播；CLI 无对应「开通 MR」子命令。

### 12.3 验证通过：账号容量利用率与全局开关审计（配置侧）

| 审计项 | 实测值 | 结论 |
|---|---|---|
| 频道容量利用率 | 总频道数 48 / 最大频道数 500（可用 452） | 余量充足（9.6% 使用率） |
| 连麦并发上限 | connectMicLimit = 1 | 连麦并发上限为 1，多路连麦需提权 |
| 打赏全局开关 | 开启 | 与 `user template donate get` 的 DonateCashEnabled=Y 一致 |
| 自动转码开关 | 开启 | 上传课件/录制会自动转码 |
| PPT 全屏开关 | 开启 | 课件 PPT 默认全屏 |
| 封面图类型 | cover | 频道封面取 cover 类型 |
| 观看页移动端/自动播放/预约/分享/RTS | mobileWatch=enabled、autoPlay=disabled、booking=enabled、shareBtnEnabled=enabled、rtsEnabled=disabled | autoPlay/RTS 关，其余开 |
| 录制/回放回调地址 | recordCallbackUrl=null、playbackCallbackUrl=null、pptRecordCallbackUrl=null | **回调地址均未配置**——如需自动化录制/回放回调需补配（`platform callback update`） |
| 账号级 PV 展示开关 | Enabled=N（`user setting pv-show get`） | 默认不展示 PV |
| 观看页页脚 | ShowFooterEnabled=Y、文案「保利威提供技术支持」、链接 my.polyv.net | 页脚品牌信息为保利威默认，电商品牌通常需改写（`user setting footer update`） |

> 以上均为**配置侧**审计结论（通过 CLI/API 查询得到），不等于观众侧可见性。

### 12.4 问题记录 / 历史结论更正：`user`/`platform` 子命令并非「Unknown command」

- **历史结论**：场景 15（iteration 15）曾记录「`user` 与 `platform` 两个一级命令族的全部 2 级子命令虽在 `<族> --help` 列出，但执行时报 `Unknown command: <族> <子>`——Commander 未注册」，并据此建议「未来场景应避开 user/platform」。
- **本场景更正**：在当前 rc（`1.2.31-rc.0`）实测，`platform` 的 `get`/`anchor`/`setting`/`switch`/`callback`/`label`/`content-group`/`coupon` 与 `user` 的 `bill`/`child`/`mic-duration`/`mr-concurrency`/`org`/`setting`/`template`/`viewlog` 全部 2 级子命令**均正常注册、真实执行成功**（仅 `user mr-concurrency detail` 因账号级 MR 权限门控失败，属业务门控非注册缺陷）。迭代 15 的该条结论已过时，本场景已将 `user`(#35)/`platform`(#20) 纳入真实执行覆盖。
- **真缺陷澄清**：迭代 15 可能混淆了两个现象——(a) `<族> <2级子命令> --help` 在**第 3 层**（如 `platform get --help`、`ai digital-human --help`）会渲染根 help 而非子命令选项（这是 3 层深层 help 渲染缺陷，迭代 14 已记录，与本场景 `platform content-group`/`user setting` 用「无参运行」拿真实子命令的方式一致）；(b) 2 级子命令本身执行正常。两者不可混为一谈。

## 13. 风险点与回滚/清理方式

| 风险点 | 说明 | 回滚/清理 |
|---|---|---|
| `use <account>` 切换到错误账号后执行写入 | 会话切换仅在交互式终端窗口内生效，跨 `npx` 进程不持久（见 12.1） | 交互式终端用 `use --clear` 清除；脚本/CI 改用 `-a/--account` 或 `--appId` 显式指定，避免依赖会话 |
| `platform`/`user` 多为只读审计，无写入风险 | 本场景仅执行只读 `get`/`list` | 无需回滚 |
| 误用 `platform setting update`/`switch update`/`callback update`/`user setting footer update` 等账号级写入 | 账号级写入爆炸半径覆盖本账号所有频道，无频道级隔离面 | 本场景**未执行任何账号级写入**（与场景 15 `global update` 同处理）；如需变更须先备份 `platform <x> get` 当前值 |
| `user mr-concurrency detail` 报权限错 | 账号未开 MR 权限，只读查询不影响状态 | 无需回滚 |
| 保留测试频道占用频道额度 | 总频道数 48/500，余量充足 | 频道保留不删除（见第 14 节） |

## 14. 保留资产说明

| 资产 | 类型 | 作用域 | 是否删除 | 说明 |
|---|---|---|---|---|
| 频道 `7983960` | 频道 | 频道级 | **保留**（未删除） | 本场景频道侧落点与审计对象，供人工查看频道级配置；可选人工清理命令见下，**未执行** |
| 会话账号设置 | 终端会话 | 终端会话级 | 已还原 | `use nicksu` 的会话状态因跨进程不持久未实际残留；`use --clear` 已确认本进程无会话 |

可选人工清理命令（**未执行，仅供后续人工参考**）：

```bash
# 删除本场景测试频道（如确认不再需要）——本轮未执行
npx --yes polyv-live-cli@rc channel delete -c 7983960   # 按真实 channel delete --help 参数执行
```

## 15. 可复用模板

**开播前账号治理审计清单（运营可照抄执行）**：

```bash
# === 0. 账号确认 ===
npx --yes polyv-live-cli@rc account current
npx --yes polyv-live-cli@rc use --list

# === 1. 平台容量与全局开关 ===
npx --yes polyv-live-cli@rc platform get            # 频道容量、连麦上限、观看域名
npx --yes polyv-live-cli@rc platform setting get    # 打赏/转码/PPT 全局开关
npx --yes polyv-live-cli@rc platform switch get     # 观看页系列开关
npx --yes polyv-live-cli@rc platform callback get   # 录制/回放回调地址（重点核对是否为 null）

# === 2. 用户级设置与账单 ===
npx --yes polyv-live-cli@rc user setting footer get      # 观看页页脚品牌信息
npx --yes polyv-live-cli@rc user setting pv-show get     # PV 展示开关
npx --yes polyv-live-cli@rc user bill use-detail --item-category duration --start-date <月初> --end-date <今日>
npx --yes polyv-live-cli@rc user mic-duration            # 连麦时长
npx --yes polyv-live-cli@rc user mr-concurrency detail   # MR 权限与并发（未开通会报权限错）
npx --yes polyv-live-cli@rc user template donate get     # 打赏模板默认值
npx --yes polyv-live-cli@rc user template marquee get    # 跑马灯模板

# === 3. 组织与子账号盘点 ===
npx --yes polyv-live-cli@rc user org list
npx --yes polyv-live-cli@rc user child list
npx --yes polyv-live-cli@rc platform label list          # 账号级标签
```

## 16. 后续可扩展方向

- **账号级写入审计（需授权）**：`platform setting update`/`switch update`/`callback update`/`user setting footer update`/`user setting pv-show update` 均为账号级全量写入，爆炸半径覆盖所有频道，需在专门治理窗口、备份当前值后执行（参照场景 15 `global update` 风险处理）。
- **`partner` 命令族（#19，本轮未覆盖）**：`partner user-register`（注册合作伙伴客户账号，需 `--company`/`--mobile` 等）与 `partner tencent-order create`（创建腾讯云政企订单，需 `--uin`/`--order-id` 等）均为**外部账号/云订单写入**，无安全测试对象、且为不可逆的对内对外动作，按风险规则本轮未执行真实创建，留待有授权的专项场景覆盖（参照场景 11 `transmit` 的延后处理）。
- **会话治理的 CI 友好写法**：在 CI/脚本中用 `-a/--account <name>` 替代 `use <account>`（见 12.1），并可结合 `account set-default` 管理长期默认账号。
- **回调配置补全**：本场景发现 `recordCallbackUrl`/`playbackCallbackUrl`/`pptRecordCallbackUrl` 均为 null，若直播团队依赖录制/回放自动化回调，应专项配置 `platform callback update`。
