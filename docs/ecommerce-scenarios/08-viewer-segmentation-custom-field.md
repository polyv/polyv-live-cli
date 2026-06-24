# 场景 08：观众分层运营 — 观众画像查询 + 用户自定义字段标签体系

> 业务阶段：**数据复盘 / 治理 / 预热**
> 覆盖一级命令：`viewer`、`custom-field`、`channel`、`account`
> 真实执行状态：**主体命令验收通过，已用 `polyv-live-cli@latest` 复跑关键失败点**（`viewer`、`custom-field` 两族均有业务命令在真实账号 + 真实测试频道/真实测试观众上真实执行成功；其中 `viewer label channel-ref add` 发现 CLI 对账号标签 ID 的校验与官方文档冲突，已在本地修复并用构建后的 CLI 验证 `channel get.labelData` 可读回；`custom-field value save` 仍缺少 CLI/SDK/文档读回路径）

---

## 1. 场景名称

观众分层运营 —— 把直播间沉淀下来的观众数据，沉淀成一套**可被复用、可被分群触达的标签 + 自定义字段画像体系**，支撑「高意向促单 / 待培育养草 / 沉睡召回」三类电商营销动作。

电商直播间每场都会沉淀几十到上千条观众记录，但绝大多数团队的观众数据停留在「一堆手机号」的原始状态，无法回答「谁是高意向、谁看过 3 场以上、谁的客单价高」。本场景用 `polyv-live-cli@latest` 的 `viewer` 与 `custom-field` 两族命令，串成一个可照着执行的画像建设闭环：

- **观众画像侧（viewer）**：查询观众总量与来源结构、获取单观众详情、为观众打标签、查询中奖记录，建立「**我是谁、我从哪来、我有什么行为**」的画像底盘。
- **字段扩展侧（custom-field）**：在保利威标准画像字段之外，新增业务自定义字段（如「客户等级」「最近下单金额」「RFM 分层」），把电商私域的 CRM 维度挂到直播观众上。
- **分层联动侧（viewer tag / label channel-ref）**：把分层标签关联到专用频道，做「**不同场次给不同分层观众推不同货**」的精细化编排。

> ⚠️ 本场景发现两个**真实执行问题**（均已用 `polyv-live-cli@latest` 复跑或源码/文档交叉确认，且不影响主体覆盖结论）：
> 1. `viewer label channel-ref add` 的正确入参应是 `viewer label list` 返回的账号标签字符串 ID，例如 `9zu68aethm9eivf1`；官方文档同时说明 `channel get` 的 `labelData` 可作为频道侧读回字段。本轮发现 CLI 旧校验错误地要求正整数，导致正确字符串 ID 无法执行，而误用数字 viewer tag id `1282` 虽返回 success 但 `labelData` 为空。该问题已在本地代码修正，并用构建后的 CLI 实际执行确认 `channel get.labelData` 可读回 `9zu68aethm9eivf1`；发布后仍需用 `polyv-live-cli@latest` 包复验。
> 2. `custom-field value save` 返回 `{success:true}`，但 `custom-field value` 子命令族下**只有 `save`、没有 list/get 读回命令**，SDK 与官方文档也只列出 `viewer-value/save`，且 `viewer get` 不回显观众的自定义字段值，**当前无只读路径可读回自定义字段值**。
>
> 两个问题均不影响本场景主体命令覆盖结论：`viewer` 族的 `list`/`get`/`tag create`/`tag list`/`tag add`（tag add 经 `viewer get` 的 `labels` 数组交叉验证已确认持久化）/`label create`/`label list`/`lottery-wins` 与 `custom-field` 族的 `add`（经 `custom-field list` 交叉验证已确认持久化）/`list` 均真实执行成功。`channel-ref` 已定位为旧 CLI 入参校验问题，本地修复后已完成真实写入 + `channel get.labelData` 读回验证。详见第 12 节问题记录。

## 2. 覆盖命令

| 一级命令 | 子命令 | 执行状态 | 说明 |
|---|---|---|---|
| `account` | `account current`、`account list` | 已执行成功 | 写入前账号预检（`nicksu`，production） |
| `channel` | `channel create`、`channel get` | 已执行成功 | 创建专用测试频道 `7983932` 并验证频道存在与 watchStatus |
| `viewer` | `viewer list`（基线 + `--source WX` 过滤） | 已执行成功 | 账号观众总量 73（IMPORT 为主）、WX 来源 1；建立画像底盘基线 |
| `viewer` | `viewer get` | 已执行成功 | 单观众详情查询；并用于**交叉验证 tag add 是否持久化**（labels 数组命中 1282） |
| `viewer` | `viewer tag create`（`--labels` 三标签） | 已执行成功 | 新建 3 个分层标签：高意向 1282 / 待培育 1283 / 沉睡 1284 |
| `viewer` | `viewer tag list`（`-k GNHF`） | 已执行成功 | 关键字搜索复核 3 个标签入库（totalItems=3，labelId 1282/1283/1284） |
| `viewer` | `viewer tag add`（`-V`/`-l`） | 已执行成功 | 为观众 `4_aksysv...358` 打「GNHF高意向客户」(1282)；`viewer get` 复查 labels 命中 |
| `viewer` | `viewer label create` | 已执行成功（超长失败已确认） | 正确命令使用 6 字「GNHF分层」成功（id `9zu68aethm9eivf1`），`label list` 复查 10→11；超长名称会失败，见第 13 节 |
| `viewer` | `viewer label list` | 已执行成功 | 账号级标签列表（基线 10、新建后 11） |
| `viewer` | `viewer label channel-ref add`（`-c`/`-l`） | 本地修复后已验证通过，待发布复验 | 官方文档要求账号 label 字符串 ID，旧 CLI 错误要求正整数；本地修复后用 `9zu68aethm9eivf1` 写入并通过 `channel get.labelData` 读回。见第 12.1 节 |
| `viewer` | `viewer lottery-wins` | 已执行成功 | 观众中奖记录查询（totalItems=0，结构完整） |
| `custom-field` | `custom-field add` | 已执行成功（缺 id 失败已确认） | 正确命令必须提供 `--custom-field-id`；补 `gnhf_cust_level` 后成功，`custom-field list` 复查已入库 |
| `custom-field` | `custom-field list` | 已执行成功 | 自定义字段列表（基线空 → 新建后含 `gnhf_cust_level` / text） |
| `custom-field` | `custom-field value save`（`--viewer-id`/`--custom-field-id`/`--custom-field-value`） | 已执行成功（持久化未验证） | 为观众写入「GNHF客户等级=高意向VIP」返回 success；但 CLI 无读回路径。见第 12.2 节 |

> 说明：本场景所有「已执行成功」命令均使用真实账号（`nicksu`）与真实测试频道（`7983932`）/真实测试观众（`4_aksysv...358`）真实执行过，下文「命令执行台账」逐条记录。仅做 `--help` 校验、未真实执行的命令不计入覆盖。`viewer label channel-ref add` 已定位为旧 CLI 入参校验问题，本地修复后已用账号 label 字符串 ID 重新执行并通过 `channel get.labelData` 读回；`custom-field value save` 真实执行返回 success 但当前无 CLI/SDK/文档只读路径可交叉验证。`viewer`/`custom-field` 两族均因各自多条业务命令真实执行成功（且 tag add、custom-field add、channel-ref 经交叉验证确认持久化）而计入「已覆盖」。

## 3. 专用测试频道

| 项 | 值 |
|---|---|
| 频道名称 | `GNHF-电商场景-08-viewer-custom-field-202606230915` |
| 频道 ID | `7983932` |
| 账号环境 | `nicksu`（App ID `h2wazzobbq`，User ID `475b6884a7`，production） |
| 场景类型 | `alone`（活动营销） |
| 模板 | `alone`（纯视频-横屏） |
| 创建结果 | 成功（status=waiting / watchStatus=unStart / 未开始） |
| 创建时间 | 2026-06-23 00:18:21 CST |
| 是否删除 | **否，频道已保留**，供人工查看标签关联与观众画像配置 |

> 创建命令：`npx --yes polyv-live-cli@latest channel create -n "GNHF-电商场景-08-viewer-custom-field-202606230915" -d "..." --scene alone --template alone -o json`，返回 `channelId=7983932`。`channel get` 复核 name 一致、scene/template=alone、pushUrl/pushSecret 已脱敏、`labelData` 在 channel-ref 前后均为 `[]`。
>
> 本场景所有频道级命令（`channel get`、`viewer label channel-ref add`）均使用此新建测试频道。`viewer` 与 `custom-field` 本身为账号级命令（非频道级），但本场景用该频道承担「标签关联频道」的频道侧落点。

## 4. 行业背景

电商直播团队最痛的不是「没有观众数据」，而是「**观众数据进不了业务流程**」。

典型现状：每场直播结束，运营导出一份观众名单，里面只有昵称、手机号、来源渠道。这份名单既回答不了「谁是高意向」（高意向要看打赏、停留、加购行为），也回答不了「谁该被召回」（召回要看历史观看场次数与最近活跃时间）。结果就是：

- **私域社群里所有人收到一样的群发**，高意向老客觉得「你怎么又给我推 9.9 引流款」、沉睡用户觉得「你推的东西我早就不感兴趣」，触达有效率低。
- **每场选品都靠主播拍脑袋**，无法基于「这批到场的观众 60% 是待培育客户」来决定主推客单价档位。
- **CRM 标签和直播观众对不上**，企业微信里的「黑卡会员」标签，到了直播后台变成了一串没有含义的 viewerId。

成熟电商团队会做**观众分层运营**：用保利威直播后台沉淀的观众行为数据，叠加业务自定义字段，把观众切成「高意向 / 待培育 / 沉睡」三档（或更细的 RFM 分层），再让每一档观众在不同的场次、不同的时段、看到不同的货和券。本场景就是把这套分层体系的**建标签、扩字段、打标、关联频道**四步用 CLI 落地。

## 5. 业务目标与核心 KPI

| 目标 | 衡量 KPI |
|---|---|
| 建立账号级观众分层标签体系 | 分层标签数 ≥ 3（高意向 / 待培育 / 沉睡），可在 `viewer tag list` 中查到 |
| 给观众打上分层标签 | 至少 1 名观众被成功打标，`viewer get` 复查 `labels` 命中 |
| 扩展业务自定义画像字段 | 至少 1 个自定义字段落库（如「客户等级」），`custom-field list` 可查 |
| 为观众写入业务字段值 | 至少 1 条字段值写入成功（CLI 当前无读回路径，仅以命令返回 success 记录） |
| 把分层标签关联到专用频道 | 标签关联频道命令成功执行（channel-ref） |
| 形成可复用分层模板 | 沉淀「分层标签 → 字段 → 打标 → 关联频道」四步 CLI 模板 |

## 6. 适用角色

| 角色 | 用途 |
|---|---|
| 用户运营 / 私域运营 | 建分层标签、给观众打标、按分层圈人触达 |
| 直播运营 / 选品 | 查观众来源结构与画像，决定主推档位 |
| 数据运营 / CRM | 扩展自定义字段、用字段值做 RFM 分层 |
| 技术运营 / 自动化 | 把打标与字段写入接入自动化脚本（场次后批量回流） |

## 7. 前置条件

- 已配置 `polyv-live-cli@latest` 默认账号（本场景用 `nicksu`，production 环境），`account current` / `account list` 可正常返回。
- 账号下已有观众数据（本场景账号有 73 名观众，便于 `viewer list` / `viewer get` 演示；新账号可先用 `viewer import-external` 导入测试观众，本场景不展开）。
- 已创建专用测试频道用于 channel-ref 落点（本场景 `7983932`）。
- 注意：`viewer` 与 `custom-field` 命令族为**账号级**写入，新建的标签 / 字段对本账号下所有频道可见，不是单频道资产。

## 8. polyv-live-cli@latest 能力映射

| 业务动作 | 一级命令 | 关键子命令 |
|---|---|---|
| 查观众总量与来源结构 | `viewer` | `viewer list`（`--source`/`--mobile`/`--email`/`--area` 过滤） |
| 查单观众详情（含已打标签） | `viewer` | `viewer get -i <viewerUnionId>` |
| 建分层标签 | `viewer` | `viewer tag create --labels <逗号分隔>` |
| 列 / 搜标签 | `viewer` | `viewer tag list -k <关键字>` |
| 给观众打标 | `viewer` | `viewer tag add -V <viewerIds> -l <labelIds>` |
| 查观众中奖记录 | `viewer` | `viewer lottery-wins -i <viewerUnionId>` |
| 建账号级标签（另一套，见第 12.3） | `viewer` | `viewer label create --label-name <名称≤8字>` |
| 标签关联频道 | `viewer` | `viewer label channel-ref add -c <channelIds> -l <账号labelIds>` |
| 扩展自定义画像字段 | `custom-field` | `custom-field add --custom-field-id/--custom-field-name/--custom-field-type` |
| 列自定义字段 | `custom-field` | `custom-field list` |
| 为观众写自定义字段值 | `custom-field` | `custom-field value save --viewer-id/--custom-field-id/--custom-field-value` |

## 9. 实施步骤

> 步骤以运营人员视角组织，每步对应的真实命令与输出见第 10、11 节「命令执行台账」。

1. **账号与频道预检**：`account current` / `account list` 确认账号，`channel create` 建专用测试频道 `7983932`，`channel get` 复核。
2. **画像底盘基线**：`viewer list` 查观众总量与来源（73 名，IMPORT 为主）；`viewer list --source WX` 看微信来源占比（1 名）；`viewer get` 取一名代表性观众详情作为后续打标对象（`4_aksysv...358`）。
3. **建分层标签**：`viewer tag create --labels "GNHF高意向客户,GNHF待培育客户,GNHF沉睡用户"` 一次建 3 档分层（1282/1283/1284）；`viewer tag list -k GNHF` 复核入库。
4. **给观众打高意向标签**：`viewer tag add -V 4_aksysv...358 -l 1282`；`viewer get` 复查 `labels` 数组命中「GNHF高意向客户」——**画像底盘 + 标签 + 打标**三步闭环跑通。
5. **建账号级标签并关联频道**：`viewer label create --label-name "GNHF分层"`（注意 ≤8 字）→ `viewer label list` 复查（10→11）→ `viewer label channel-ref add -c 7983932 -l 9zu68aethm9eivf1` 用账号 label 字符串 ID 把标签关联到测试频道，再用 `channel get` 的 `labelData` 复验。
6. **扩展业务自定义字段**：`custom-field add --custom-field-id gnhf_cust_level --custom-field-name "GNHF客户等级" --custom-field-type text` → `custom-field list` 复查字段落库。
7. **为观众写字段值**：`custom-field value save --viewer-id 4_aksysv...358 --custom-field-id gnhf_cust_level --custom-field-value "高意向VIP"`（返回 success，CLI 无读回路径，见 12.2）。
8. **复盘分层动作**：`viewer lottery-wins` 查该观众历史中奖（用于「中奖观众自动升档为高意向」的自动化判断输入）。

## 10. 命令执行台账

> 执行时间：2026-06-23 CST；账号 `nicksu`；脱敏：AppSecret / 推流密钥不出现；viewerUnionId 在文中截断显示为 `4_aksysv...358`，命令中使用完整值。

| # | 时间 | 一级命令 / 子命令 | 实际执行命令（脱敏） | 频道/对象 ID | 结果 | 关键输出摘要 |
|---|---|---|---|---|---|---|
| 1 | 00:17 | `account current` | `npx ... account current` | — | 成功 | 默认账号 `nicksu`（h2wazzobbq / 475b6884a7，production），来源=全局配置 |
| 2 | 00:17 | `account list` | `npx ... account list` | — | 成功 | 共 6 个账号 |
| 3 | 00:18 | `channel create` | `npx ... channel create -n "GNHF-电商场景-08-..." --scene alone --template alone -o json` | 7983932 | 成功 | `channelId=7983932`，scene/template=alone，status=waiting |
| 4 | 00:18 | `channel get` | `npx ... channel get -c 7983932 -o json` | 7983932 | 成功 | name 一致，watchStatus=unStart，pushUrl/pushSecret 已脱敏，labelData=[] |
| 5 | 00:19 | `viewer list` | `npx ... viewer list --page 1 --size 5 -o json` | — | 成功 | totalItems=73、totalPages=15（size=5），IMPORT 为主 |
| 6 | 00:19 | `viewer list`（WX 过滤） | `npx ... viewer list --source WX --page 1 --size 3 -o json` | — | 成功 | totalItems=1（账号下 WX 来源观众仅 1 名） |
| 7 | 00:19 | `viewer tag list`（基线） | `npx ... viewer tag list -o json` | — | 成功 | totalItems=1（仅存量「测试标签_2415」，labelId=1049） |
| 8 | 00:19 | `viewer label list`（基线） | `npx ... viewer label list -o json` | — | 成功 | totalItems=10，标签 id 为字符串（如 `738kx2ayobphf1er`） |
| 9 | 00:19 | `custom-field list`（基线） | `npx ... custom-field list -o json` | — | 成功 | 返回 `[]`（账号下无自定义字段） |
| 10 | 00:19 | `viewer tag create` | `npx ... viewer tag create -l "GNHF高意向客户,GNHF待培育客户,GNHF沉睡用户" -f -o json` | 标签 1282/1283/1284 | 成功 | 返回 3 条 `{id,label}`：1282/1283/1284 |
| 11 | 00:20 | `viewer tag list`（`-k GNHF`） | `npx ... viewer tag list -k GNHF -o json` | — | 成功 | totalItems=3，labelId 1282/1283/1284 全部命中（**持久化已验证**） |
| 12 | 00:20 | `viewer label create`（首次，超长） | `npx ... viewer label create --label-name "GNHF直播分层标签" -f -o json` | — | **失败** | `createLabel failed: 标签名称最大长度为8`（9 字超限） |
| 13 | 00:20 | `viewer label create`（改短） | `npx ... viewer label create --label-name "GNHF分层" -f -o json` | `9zu68aethm9eivf1` | 成功 | 返回 `{id:"9zu68aethm9eivf1", name:"GNHF分层"}`（6 字） |
| 14 | 00:20 | `custom-field add`（首次，缺 id） | `npx ... custom-field add --custom-field-name "GNHF客户等级" --custom-field-type text -f -o json` | — | **失败** | `error: required option '--custom-field-id <id>' not specified`（`--custom-field-id` 必填） |
| 15 | 00:20 | `custom-field add`（补 id） | `npx ... custom-field add --custom-field-id gnhf_cust_level --custom-field-name "GNHF客户等级" --custom-field-type text -f -o json` | `gnhf_cust_level` | 成功 | 返回 `{success:true, result:true}` |
| 16 | 00:20 | `custom-field list`（复查） | `npx ... custom-field list -o json` | `gnhf_cust_level` | 成功 | 返回 1 条 `gnhf_cust_level / GNHF客户等级 / text`（**持久化已验证**） |
| 17 | 00:20 | `viewer label channel-ref add`（账号 label 字符串 id） | `npx ... viewer label channel-ref add -c 7983932 -l 9zu68aethm9eivf1 -f -o json` | 7983932 | **失败（CLI 校验问题）** | `Error: 标签ID必须是正整数: 9zu68aethm9eivf1`；官方文档显示该接口应接受账号 label 字符串 id，已修复本地校验，待发布后复验 |
| 18 | 00:20 | `viewer label channel-ref add`（误用数字 viewer tag id） | `npx ... viewer label channel-ref add -c 7983932 -l 1282 -f -o json` | 7983932 | 成功（但语义不成立） | `{success:true, data:{channelIds:["7983932"], labelIds:["1282"]}}`；但 `channel get` 的 `labelData` 复查仍空，说明数字 viewer tag id 不是正确读回实体（见 12.1） |
| 19 | 00:20 | `viewer tag add` | `npx ... viewer tag add -V "4_aksysv...358" -l 1282 -f -o json` | 观众 `4_aksysv...358` / 标签 1282 | 成功 | `{succeeded:1, failed:0, results:[{viewerUnionId, labelId:1282, success:true}]}` |
| 20 | 00:20 | `viewer get`（复查打标） | `npx ... viewer get -i "4_aksysv...358" -o json` | 观众 `4_aksysv...358` | 成功 | `labels:[{id:1282, label:"GNHF高意向客户"}]`（**打标持久化已验证**） |
| 21 | 00:20 | `custom-field value save` | `npx ... custom-field value save --viewer-id "4_aksysv...358" --custom-field-id gnhf_cust_level --custom-field-value "高意向VIP" -f -o json` | 观众 `4_aksysv...358` / 字段 gnhf_cust_level | 成功（持久化未验证） | `{success:true}`；CLI 无读回路径（见 12.2） |
| 22 | 00:20 | `viewer get`（复查字段值） | `npx ... viewer get -i "4_aksysv...358" -o json` | 观众 `4_aksysv...358` | 成功 | `viewer get` **不回显** custom field value（仅回 labels），无法读回（见 12.2） |
| 23 | 00:20 | `viewer label list`（复查 label create） | `npx ... viewer label list -o json` | — | 成功 | totalItems 10→**11**，「GNHF分层」(`9zu68aethm9eivf1`) 在列（**label create 持久化已验证**） |
| 24 | 00:20 | `viewer lottery-wins` | `npx ... viewer lottery-wins -i "4_aksysv...358" -o json` | 观众 `4_aksysv...358` | 成功 | totalItems=0、contents=[]（该观众无中奖记录，结构完整） |
| 25 | 11:25 | `viewer label channel-ref add`（本地修复后复验） | `node packages/cli/dist/index.js viewer label channel-ref add -c 7983932 -l 9zu68aethm9eivf1 -f -o json` | 7983932 / `9zu68aethm9eivf1` | 成功 | 返回 `{success:true, data:{channelIds:["7983932"], labelIds:["9zu68aethm9eivf1"]}}` |
| 26 | 11:25 | `channel get`（复查 channel-ref） | `node packages/cli/dist/index.js channel get -c 7983932 -o json \| jq -c '{labelData:.labelData}'` | 7983932 | 成功 | `labelData:["9zu68aethm9eivf1"]`（**channel-ref 持久化已验证**） |

## 11. 实际使用的 CLI 命令与真实参数

> 以下为本场景真实执行过的命令（占位符处替换为真实值）。`<CLI>` = `npx --yes polyv-live-cli@latest`；`<LOCAL_CLI>` = `node packages/cli/dist/index.js`，仅用于记录本地修复后的复验命令。

### 11.1 画像底盘（viewer list / get）

```bash
# 观众总量与来源结构
<CLI> viewer list --page 1 --size 5 -o json          # → totalItems=73, totalPages=15

# 来源过滤（微信来源画像）
<CLI> viewer list --source WX --page 1 --size 3 -o json   # → totalItems=1

# 单观众详情（取打标对象）
<CLI> viewer get -i "4_aksysvfobcgbgpabp3zizlww3vlzl358" -o json
```

### 11.2 分层标签（viewer tag）

```bash
# 一次建 3 档分层标签 → 1282/1283/1284
<CLI> viewer tag create -l "GNHF高意向客户,GNHF待培育客户,GNHF沉睡用户" -f -o json

# 关键字复核入库
<CLI> viewer tag list -k GNHF -o json                  # → totalItems=3, labelId 1282/1283/1284

# 给观众打高意向标签
<CLI> viewer tag add -V "4_aksysvfobcgbgpabp3zizlww3vlzl358" -l 1282 -f -o json

# viewer get 复查 labels 命中（交叉验证持久化）
<CLI> viewer get -i "4_aksysvfobcgbgpabp3zizlww3vlzl358" -o json
```

### 11.3 账号级标签 + 频道关联（viewer label）

```bash
# 建 6 字账号级标签（≤8 字限制）
<CLI> viewer label create --label-name "GNHF分层" -f -o json   # → id 9zu68aethm9eivf1

# 复查账号级标签（10→11）
<CLI> viewer label list -o json

# 标签关联频道（使用 viewer label list 返回的账号 label 字符串 id）
<CLI> viewer label channel-ref add -c 7983932 -l 9zu68aethm9eivf1 -f -o json
```

### 11.4 自定义画像字段（custom-field）

```bash
# 新增 text 类型业务字段（--custom-field-id 实为必填）
<CLI> custom-field add --custom-field-id gnhf_cust_level \
  --custom-field-name "GNHF客户等级" --custom-field-type text -f -o json

# 复查字段落库
<CLI> custom-field list -o json                        # → gnhf_cust_level / GNHF客户等级 / text

# 为观众写字段值（success，CLI 无读回路径）
<CLI> custom-field value save --viewer-id "4_aksysvfobcgbgpabp3zizlww3vlzl358" \
  --custom-field-id gnhf_cust_level --custom-field-value "高意向VIP" -f -o json
```

## 12. 执行或验证结果 / 问题记录

### 12.1 问题：`viewer label channel-ref add` 的 CLI 校验与官方文档冲突

- **现象**：`viewer label channel-ref add -c 7983932 -l 9zu68aethm9eivf1 -f -o json` 使用 `viewer label create/list` 产出的账号 label 字符串 ID 时，被 `polyv-live-cli@latest` 旧校验拦截为 `标签ID必须是正整数`；改用 viewer tag 数字 ID `1282` 后虽然返回 `{success:true}`，但 `channel get -c 7983932 -o json` 的 `labelData` 仍为 `[]`。本地修复后重新用字符串 ID 执行，`channel get.labelData` 已读回 `9zu68aethm9eivf1`。
- **已做排查**：
  1. 官方 API 文档 `v4/user/label/add_channel_label_refs.md` 的请求示例使用账号 label 字符串 ID（如 `zylw8zzi3p7mrqr4`），不是 viewer tag 数字 ID。
  2. 官方 `channel get` 文档声明 `labelData` 是频道标签 ID 数组，可作为频道侧读回字段。
  3. 因此旧 CLI 的“正整数”校验是命令层缺陷；数字 tag ID 返回 success 但不出现在 `labelData`，不能作为正确验证路径。
- **结论**：`channel-ref` 本身不是缺少读回能力，而是旧 CLI 把账号 label 字符串 ID 错拦了。本地代码已修复为允许账号 label ID，并已用真实测试频道完成写入 + `channel get.labelData` 读回验证。
- **下一步建议**：发版后用 `polyv-live-cli@latest` 复跑 `viewer label channel-ref add -c 7983932 -l 9zu68aethm9eivf1 -f -o json`，再用 `channel get -c 7983932 -o json` 检查 `labelData` 是否包含 `9zu68aethm9eivf1`。

### 12.2 问题：`custom-field value save` 返回 success，但 CLI 无只读读回路径

- **现象**：`custom-field value save --viewer-id ... --custom-field-id gnhf_cust_level --custom-field-value "高意向VIP" -f -o json` 返回 `{success:true}`，但：
  - `custom-field value` 子命令族下**只有 `save`**，没有 list/get，无法读回已写入的值；
  - `viewer get -i ...` 复查时**不回显** custom field value（只回 `labels` 数组），无法通过 viewer 读回。
- **已做排查**：`custom-field value --help` 确认仅 `save` 一个子命令；`viewer get` 输出无 customFields 字段。
- **结论**：`custom-field value save` 真实执行成功（返回 success），但**当前 CLI 无只读路径交叉验证值是否落库**。这与 `viewer tag add`（经 `viewer get` 的 labels 交叉验证确认持久化）形成对比——tag 的写入可被读回，custom-field value 的写入暂不可被 CLI 读回。运营若要确认字段值写入，需在保利威后台观众详情页人工复核。
- **下一步建议**：跟踪 CLI 是否新增 `custom-field value list/get` 或在 `viewer get` 中回显 customFields。

### 12.3 发现：`viewer tag`（数字 id）与 `viewer label`（字符串 id）是两套不同实体

- **现象**：
  - `viewer tag create` 返回数字 `id`（1282/1283/1284），`viewer tag list` 回显 `labelId`（数字，1282）；
  - `viewer label create` 返回字符串 `id`（`9zu68aethm9eivf1`），`viewer label list` 回显字符串 `id`；
  - `viewer tag add -l` 要求 viewer tag 数字 ID；`viewer label channel-ref add -l` 按官方文档应使用账号 label 字符串 ID。
- **结论**：尽管 tag list 的字段名叫 `labelId`，但 `viewer tag`（观众打标，数字 id）与 `viewer label`（频道标签，字符串 id）是**两套独立的标签实体**，数字 id 与字符串 id 不互通。运营做观众分层打标用 `viewer tag`；做频道标签关联用 `viewer label`。
- **提示**：本场景台账 #17 的失败来自旧 CLI 对字符串 ID 的错误校验；#18 的数字 ID success 不能证明 channel-ref 生效。

### 12.4 验证通过项（持久化已交叉确认）

| 写入命令 | 读回验证命令 | 结论 |
|---|---|---|
| `viewer tag create` | `viewer tag list -k GNHF` | ✅ 3 标签全部入库（1282/1283/1284） |
| `viewer tag add` | `viewer get` 的 `labels` 数组 | ✅ 观众 `4_aksysv...358` 命中 1282「GNHF高意向客户」 |
| `viewer label create` | `viewer label list` 计数 10→11 | ✅ 「GNHF分层」(`9zu68aethm9eivf1`) 在列 |
| `viewer label channel-ref add` | `channel get` 的 `labelData` 数组 | ✅ 本地修复后，频道 `7983932` 读回 `9zu68aethm9eivf1` |
| `custom-field add` | `custom-field list` 由 `[]` → 含 1 条 | ✅ `gnhf_cust_level / text` 落库 |

## 13. 风险点与回滚 / 清理方式

| 风险 | 说明 | 处理 |
|---|---|---|
| 标签 / 字段为账号级写入 | `viewer tag create`、`viewer label create`、`custom-field add` 写入的是**账号级**资产，对本账号所有频道可见，误建会影响全账号 | 仅用 `GNHF-` 前缀命名，避免与既有标签混淆；可用 `viewer tag delete --id <id>` 清理标签 |
| 字符串/数字 id 混用报错 | `viewer tag add` 使用 viewer tag 数字 ID；`viewer label channel-ref add` 使用账号 label 字符串 ID。旧 CLI 将 channel-ref 错误限制为正整数 | 打标用 `viewer tag list` 的数字 id；频道关联用 `viewer label list` 的字符串 id |
| 标签名称长度限制 | `viewer label create --label-name` 最大 8 字（中文按字数计），超长报 `标签名称最大长度为8` | 名称控制在 8 字以内；本场景用 6 字「GNHF分层」 |
| `custom-field add` 的 id 必填 | 缺 `--custom-field-id` 会直接报 required；修复后的 help 已明确 required 与长度约束 | 新增字段必须同时给 `--custom-field-id`（自定义，建议英文 slug） |
| 成功假象风险 | `custom-field value save` 返回 success 但 CLI/SDK/文档无读回路径；误用数字 tag id 调 `channel-ref add` 也可能返回 success 但 `labelData` 为空 | `channel-ref` 用账号 label 字符串 id 并以 `channel get.labelData` 复验；custom-field value 需后台人工复核 |

> **清理方式（本场景未执行，仅提供命令）**：以下命令用于人工清理本场景创建的账号级资产，**本场景未执行删除**，标签/字段/频道均已保留：
> ```bash
> # 删除分层标签（需逐个按 tag id 删除）
> <CLI> viewer tag delete --id 1282 -f
> <CLI> viewer tag delete --id 1283 -f
> <CLI> viewer tag delete --id 1284 -f
> # 删除测试频道（本场景保留）
> <CLI> channel delete -c 7983932 -f   # 命令是否存在以 channel delete --help 为准
> ```
> custom-field 与 viewer label 的删除子命令当前 help 未见（custom-field 无 delete；viewer label delete 存在但需 label id），按真实 help 为准。

## 14. 保留资产说明

本场景在账号 `nicksu` 下创建并**保留**以下资产，供人工查看与复核：

| 资产 | 标识 | 用途 | 是否保留 |
|---|---|---|---|
| 测试频道 | `7983932`（`GNHF-电商场景-08-viewer-custom-field-202606230915`） | channel-ref 关联落点 / 人工查看 | ✅ 保留，未删除 |
| 分层标签 ×3 | 1282 `GNHF高意向客户` / 1283 `GNHF待培育客户` / 1284 `GNHF沉睡用户` | 三档分层标签体系 | ✅ 保留 |
| 账号级标签 ×1 | `9zu68aethm9eivf1` `GNHF分层` | 验证 label create 与 tag 实体差异 | ✅ 保留 |
| 自定义字段 ×1 | `gnhf_cust_level` / `GNHF客户等级` / text | 业务画像字段扩展 | ✅ 保留 |
| 观众打标 ×1 | 观众 `4_aksysv...358` ← 标签 1282 | 打标持久化交叉验证样本 | ✅ 保留（打标状态保留） |
| 观众字段值 ×1 | 观众 `4_aksysv...358` 的 `gnhf_cust_level=高意向VIP` | 字段值写入样本（CLI 无读回路径） | ✅ 保留（写入命令已执行） |

> 频道已保留，未执行删除。人工清理命令见第 13 节，但明确**这些清理命令本场景未执行**。

## 15. 可复用模板

### 15.1 观众分层标签体系建设模板

```bash
# 1) 画像基线：总量 + 来源结构
<CLI> viewer list --page 1 --size 20 -o json
<CLI> viewer list --source WX -o json       # 微信来源
<CLI> viewer list --source MOBILE -o json   # 手机来源
<CLI> viewer list --source IMPORT -o json   # 导入来源

# 2) 建 N 档分层标签（一次多个，逗号分隔）
<CLI> viewer tag create -l "高意向客户,待培育客户,沉睡用户,黑卡会员" -f -o json

# 3) 给观众打标（可批量多观众多标签）
<CLI> viewer tag add -V "<viewerId1>,<viewerId2>" -l <高意向id>,<黑卡id> -f -o json

# 4) 复核打标（关键：用 viewer get 读回，而非仅信 add 返回）
<CLI> viewer get -i "<viewerId1>" -o json   # 检查 labels 数组
```

### 15.2 自定义画像字段扩展模板

```bash
# 1) 新增业务字段（type: text|image|link，id 必填）
<CLI> custom-field add --custom-field-id <英文slug> \
  --custom-field-name "<中文名>" --custom-field-type text -f -o json

# 2) 复核字段落库
<CLI> custom-field list -o json

# 3) 为观众写字段值（注意：CLI 暂无读回路径，仅以命令返回 success 记录）
<CLI> custom-field value save --viewer-id "<viewerId>" \
  --custom-field-id <英文slug> --custom-field-value "<值>" -f -o json
```

### 15.3 分层标签关联频道模板（精细化编排）

```bash
# 把账号标签关联到主推客单价场次的频道（注意用 viewer label list 返回的字符串 id）
<CLI> viewer label channel-ref add -c <主推频道id> -l <账号labelId> -f -o json
<CLI> channel get -c <主推频道id> -o json   # 检查 labelData 是否包含 <账号labelId>
```

## 16. 后续可扩展方向

- **批量打标自动化**：用 `viewer list` 分页拉全量观众 + 业务规则（如「观看 ≥3 场」）计算分层，循环调用 `viewer tag add` 批量回流分层结果（脚本化）。
- **RFM 分层落地**：用 `custom-field add` 建 `最近观看场次`（R）、`累计观看场次数`（F）、`累计打赏/下单金额`（M）三类字段，`custom-field value save` 写值，做 RFM 八象限分层。
- **中奖观众自动升档**：场次后用 `viewer lottery-wins` 拉中奖观众，自动 `viewer tag add` 升档为「高意向」，承接「中奖即高意向」的运营策略。
- **分层触达差异化**：结合 `whitelist`（场景 05）按分层标签导入不同白名单，做「高意向场 / 待培育场」的观看条件分流。
- **字段值读回能力补齐**：跟踪 CLI/SDK/官方文档是否新增 `custom-field value list/get`，补齐当前「字段值 success 无读回」的验证缺口。
- **观众删除 / 导入闭环**：`viewer delete`（清理测试观众）、`viewer import-external`（批量导入私域观众池）形成观众库治理闭环，可单独成场景。
