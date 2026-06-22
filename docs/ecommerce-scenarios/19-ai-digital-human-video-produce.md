# 场景 19：AI 数字人主播与短视频批量生产

> 覆盖一级命令：`ai`（#2）
> 业务阶段：预热 / 复购 / 治理
> 专用测试频道：`7983961`（`GNHF-电商场景-19-ai-digital-human-videoproduce-202606231230`，topclass/ppt，watchStatus=unStart，**频道已保留，未执行删除**）

> 说明：`ai` 命令族下的数字人（digital-human）、AI 视频制作任务（video-produce）、TTS 音色、视频制作 PPT 均为**账号级**资产（绑定账号 `nicksu` 的 User ID `475b6884a7`，`channelId=null`）。专用测试频道 `7983961` 在本场景作为「场景落地频道」与频道侧落点承接（数字人话术课件可挂载到该频道开播），`ai` 族真实执行作用域为本账号。

---

## 1. 场景名称

AI 数字人主播与短视频批量生产 —— 账号级数字人形象/TTS 音色资源盘点 + 商品话术课件上传 + AI 视频制作任务复盘 + 数字人组织级授权治理。

## 2. 覆盖命令

| 一级命令 | # | 命令族定位 | 作用域 | 本场景执行状态 |
|---|---|---|---|---|
| `ai` | 2 | AI 数字人形象、AI 视频制作任务、视频制作 PPT、TTS 音色 | 账号级 | ✅ 已执行成功（`digital-human list`/`digital-human list-org`、`video-produce list`/`tts-voice list`/`ppt list`/`ppt get` 六条只读命令真实执行成功；`ppt upload` **真实写入**新建测试课件并经 `ppt list`（1→2）+ `ppt get` 前后对比交叉验证持久化；`video-produce get` 已执行失败并记录 CLI 参数映射缺陷） |

> 本轮覆盖 `ai`（#2）。`ai` 命令族直接子命令为 `digital-human`（数字人形象）与 `video-produce`（AI 视频制作任务 / PPT / TTS 音色）。`digital-human set-org` 为账号级授权写入、且账号下无 CLI 可创建的「测试数字人」隔离对象（59 个数字人均为账号存量共享资产），按风险规则本轮不执行写入，仅记录能力与适用场景（见第 12.3 节）。

## 3. 专用测试频道

| 项 | 值 |
|---|---|
| 频道 ID | `7983961` |
| 频道名称 | `GNHF-电商场景-19-ai-digital-human-videoproduce-202606231230` |
| 创建命令 | `npx --yes polyv-live-cli@rc channel create -n "GNHF-电商场景-19-ai-digital-human-videoproduce-202606231230" -o json` |
| 场景 / 模板 | `topclass` / `ppt`（默认） |
| 创建时状态 | `waiting`（`channel get` 复查 `watchStatus` 为 `unStart`） |
| 账号环境 | `nicksu`（production，App ID `h2wazzobbq`，User ID `475b6884a7`） |
| 创建结果 | ✅ 成功，ChannelId=7983961 |
| 是否删除 | **否，频道已保留**（供人工查看频道级配置与数字人课件挂载落点） |

## 4. 行业背景

电商品牌直播团队在大促期间面临两类「真人主播」产能瓶颈：

1. **直播时段覆盖不足**：黄金时段（晚 8–11 点）真人主播档期有限，非黄金时段（早间、深夜）无人值守导致流量空转。AI 数字人主播可 7×24 小时接力直播，承接非黄金时段的品类讲解与挂机。
2. **短视频素材产能不足**：每场直播后需要把「商品讲解话术」剪成短视频用于私域社群召回、抖音/视频号投放、直播间预热轮播，真人录制成本高、产能低。AI 视频制作（PPT 课件 + TTS 音色 + 数字人形象）可批量把一份话术课件转成带数字人主播的讲解短视频。

保利威 `ai` 命令族正是这两类诉求的 CLI 入口：`digital-human` 管理账号下可用的数字人形象库（性别/服装/默认音色），`video-produce` 管理「PPT 课件 → AI 视频」的生产任务、可用 TTS 音色与课件素材库。运营通过 CLI 完成数字人选型、话术课件上传、生产任务复盘与数字人组织级授权，即可编排一条「话术课件上传 → 选数字人+音色 → 批量生产短视频 → 投放/挂载到直播间」的 AI 内容生产闭环。

## 5. 业务目标与核心 KPI

| 目标 | 核心 KPI | 查询/写入命令 |
|---|---|---|
| 盘点账号下可用数字人形象 | 数字人总数 / 性别 / 服装 / 默认音色 | `ai digital-human list` |
| 查询数字人组织级授权现状 | 数字人关联的组织列表 | `ai digital-human list-org` |
| 盘点可用 TTS 音色 | 音色总数 / 语种 / 性别标签 | `ai video-produce tts-voice list` |
| 上传商品话术课件 | 课件 fileId / 转码状态 / 页数 | `ai video-produce ppt upload`、`ppt get` |
| 复盘 AI 视频制作任务 | 任务数 / 任务类型 / 数字人挂载 / 状态 | `ai video-produce list` |
| 查询 AI 视频制作任务详情 | 任务字段（视频路径/数字人/字幕） | `ai video-produce get` |
| 数字人组织级授权治理（授权范围） | 数字人 → 组织映射 | `ai digital-human set-org`（本轮不执行，见 12.3） |

## 6. 适用角色

- **直播运营 / 内容运营**：盘点数字人形象与 TTS 音色选型；上传商品话术课件；复盘短视频产出。
- **短视频编导**：基于数字人 + PPT 课件 + TTS 音色组合批量产出讲解短视频。
- **账号管理员 / 直播运营负责人**：数字人组织级授权治理（set-org），限制跨部门误用数字人形象。

## 7. 前置条件

1. 已配置保利威账号（`account list` 至少 1 个有效账号，本场景为 `nicksu`）。
2. 已创建专用测试频道 `7983961`（作为场景落地频道与课件挂载落点）。
3. 账号已开通 AI 数字人 / AI 视频制作功能（实测账号 `nicksu` 已有 59 个数字人、107 个 TTS 音色、13 个视频制作任务、1 个存量课件，功能已开通）。
4. 课件上传需公网可访问的 `.ppt`/`.pptx` 源 URL（服务端按 URL 抓取转码）。
5. 执行写入类命令前先 `account current` / `account list` 确认账号环境。

## 8. polyv-live-cli-rc 能力映射

| 业务诉求 | 一级命令 | 子命令 | 作用域 | 本轮执行 |
|---|---|---|---|---|
| 列出账号下数字人形象 | `ai` | `digital-human list` | 账号级 | ✅ |
| 查询数字人关联的组织 | `ai` | `digital-human list-org` | 账号级 | ✅ |
| 设置数字人关联的组织 | `ai` | `digital-human set-org` | 账号级 | ⏳ 不执行（见 12.3） |
| 列出 AI 视频制作任务 | `ai` | `video-produce list` | 账号级 | ✅ |
| 查询 AI 视频制作任务详情 | `ai` | `video-produce get` | 账号级 | ❌ CLI 缺陷（见 12.1） |
| 批量创建 AI 视频制作任务 | `ai` | `video-produce create` | 账号级 | ⏳ 不执行（见 12.2） |
| 删除 AI 视频制作任务 | `ai` | `video-produce delete` | 账号级 | ⏳ 不执行 |
| 列出视频制作 PPT 课件 | `ai` | `video-produce ppt list` | 账号级 | ✅ |
| 查询视频制作 PPT 课件 | `ai` | `video-produce ppt get` | 账号级 | ✅ |
| 上传视频制作 PPT 课件 | `ai` | `video-produce ppt upload` | 账号级 | ✅ 写入 |
| 异步上传视频制作 PPT 课件 | `ai` | `video-produce ppt async-upload` | 账号级 | ⏳ 不执行 |
| 列出可用 TTS 音色 | `ai` | `video-produce tts-voice list` | 账号级 | ✅ |

> `ai` 全族参数风格为 camelCase + kebab-case 混用：`--page`/`--size`/`-o` 分页与输出用 kebab，`--aiDigitalHumanId`/`--organizationIds`（digital-human set-org）用 camelCase，配置时以各子命令 `--help` 为准。

## 9. 实施步骤

1. **账号与会话预检**：`account current` / `account list` 确认账号环境为 `nicksu`。
2. **创建专用测试频道**：`channel create` 建频道 `7983961` 作为场景落地频道。
3. **数字人形象盘点**：`ai digital-human list` 拉取账号下全部数字人（分页），按性别/服装/默认音色选型，圈定适合电商讲解的形象（如男声正装「高辰」、女声白衣「郑羽」）。
4. **数字人组织授权现状查询**：`ai digital-human list-org --ids <候选数字人ID>` 查询其当前关联的组织，确认是否已被某部门独占。
5. **TTS 音色盘点**：`ai video-produce tts-voice list` 拉取可用音色，按语种/性别标签匹配品牌声线。
6. **话术课件上传（写入）**：`ai video-produce ppt upload` 上传公网 `.pptx` 商品话术课件，拿到 `fileId`。
7. **课件转码状态复核**：`ai video-produce ppt get --file-id <fileId>` 复查 `waitConvert → normal` 转码完成。
8. **课件库复查**：`ai video-produce ppt list` 复查账号课件库 `1 → 2`，确认新课件落库。
9. **AI 视频制作任务复盘**：`ai video-produce list` 拉取历史制作任务，分析「有/无数字人」两种产出形态（`type=1` 无数字人 / `type=3` 有数字人，含 `digitalHumanId`、`videoPath`、`subtitlePath`）。

## 10. 命令执行台账

> 执行时间：2026-06-23；账号 `nicksu`（App ID `h2wazzobbq`，User ID `475b6884a7`）；敏感值（AppSecret/推流密钥）脱敏。

| # | 时间 | 一级命令.子命令 | 实际执行命令（脱敏） | 频道/对象 ID | 结果 | 关键输出摘要 |
|---|---|---|---|---|---|---|
| 1 | 06-23 02:45 | — | `npx --yes polyv-live-cli@rc --version` | — | ✅ 成功 | `1.2.31-rc.0` |
| 2 | 06-23 02:45 | ai（校验） | `… ai --help` / `… ai digital-human --help` / `… ai video-produce --help` 及各 leaf `--help` | — | ✅ 成功 | 命令面：digital-human(list/list-org/set-org)、video-produce(create/delete/get/list/ppt/tts-voice) |
| 3 | 06-23 02:46 | account.current | `… account current` | — | ✅ 成功 | 默认账号 `nicksu` |
| 4 | 06-23 02:46 | account.list | `… account list` | — | ✅ 成功 | 6 个账号，`nicksu` 为默认 |
| 5 | 06-23 02:48 | channel.create | `… channel create -n "GNHF-电商场景-19-ai-digital-human-videoproduce-202606231230" -o json` | 7983961 | ✅ 成功 | channelId=7983961，topclass/ppt，waiting |
| 6 | 06-23 02:49 | channel.get | `… channel get -c 7983961 -o json` | 7983961 | ✅ 成功 | scene=ppt，newScene=topclass，watchStatus=unStart，pageView=0 |
| 7 | 06-23 02:50 | ai.digital-human.list | `… ai digital-human list -o json` | 账号级 | ✅ 成功 | totalItems=**59**，totalPages=6；首页 10 个：郑羽1186/高辰1184/阮妍1183/乔然1180/罗川1177/秦微1174/白宁1173/苏悦1171/陆平1165/孟佳1163 |
| 8 | 06-23 02:51 | ai.digital-human.list-org | `… ai digital-human list-org --ids 1186,1184 -o json` | 数字人 1186/1184 | ✅ 成功 | 返回 `[]`（两个数字人当前无组织级授权，账号内可见） |
| 9 | 06-23 02:52 | ai.video-produce.tts-voice.list | `… ai video-produce tts-voice list -o json` | 账号级 | ✅ 成功 | totalItems=**107**，totalPages=11；中文音色：阿龙751(男)/阿芸752(女)/小婉755(女)/小威756(男)/文博996(男)/可欣997(女)；含阿拉伯/德语等多语种，tag=FEMALE_VOICE/MALE_VOICE/OTHERS |
| 10 | 06-23 02:53 | ai.video-produce.ppt.list（前） | `… ai video-produce ppt list -o json` | 账号级 | ✅ 成功 | totalItems=**1**；存量课件 `bf36fe7a…pptVideocommon`「test.ppt」normal/1 页 |
| 11 | 06-23 02:53 | ai.video-produce.ppt.upload（**写入**） | `… ai video-produce ppt upload --url "<公网 minimal.pptx URL>" --doc-name "GNHF-AI-电商数字人话术课件" --force -o json` | 账号级 | ✅ 成功 | 返回新 `fileId=d3a5786c488311408f8ee64cf308170c475b6884a7pptVideocommon` |
| 12 | 06-23 02:54 | ai.video-produce.ppt.list（后） | `… ai video-produce ppt list -o json` | 账号级 | ✅ 成功 | totalItems=**1→2**；新增 `d3a5786c…pptVideocommon`「GNHF-AI-电商数字人话术课件」status=waitConvert |
| 13 | 06-23 02:54 | ai.video-produce.ppt.get | `… ai video-produce ppt get --file-id d3a5786c…pptVideocommon -o json` | 课件 d3a5786c… | ✅ 成功 | fileUrl=doc-2.polyv.net/sources/20260623/…pptx，fileType=.pptx，convertType=common，status=waitConvert |
| 14 | 06-23 02:55 | ai.video-produce.ppt.get（复查转码） | `… ai video-produce ppt get --file-id d3a5786c…pptVideocommon -o json`（sleep 8s 后） | 课件 d3a5786c… | ✅ 成功 | status=**waitConvert→normal**，totalPage=0（minimal.pptx 内容为空但转码成功） |
| 15 | 06-23 02:51 | ai.video-produce.list | `… ai video-produce list -o json` | 账号级 | ✅ 成功 | totalItems=**13**，totalPages=2；含 type=1 无数字人（22991/22954/22951 等）与 type=3 有数字人（23005/22992/22955/22952/22945 等，digitalHumanId=45，含 videoPath/subtitlePath.srt） |
| 16 | 06-23 02:51 | ai.video-produce.get | `… ai video-produce get --id 23005` / `--id 22991` / `--id 37138` | 任务 23005/22991/37138 | ❌ 失败 | 三个 ID 均报 `Unexpected error: aiPPTVideoId不能为空`，详见 12.1 |
| 17 | 06-23 02:56 | ai.digital-human.set-org | （未执行） | — | ⏳ 不执行 | 账号级授权写入、无 CLI 可创建的测试数字人，按风险规则不执行，详见 12.3 |

## 11. 实际使用的 CLI 命令与真实参数

```bash
# 0. 账号预检
npx --yes polyv-live-cli@rc account current
npx --yes polyv-live-cli@rc account list

# 1. 创建专用测试频道
npx --yes polyv-live-cli@rc channel create -n "GNHF-电商场景-19-ai-digital-human-videoproduce-202606231230" -o json
# → channelId=7983961

# 2. 数字人形象盘点（账号级，59 个）
npx --yes polyv-live-cli@rc ai digital-human list -o json

# 3. 数字人组织授权现状查询
npx --yes polyv-live-cli@rc ai digital-human list-org --ids 1186,1184 -o json
# → []

# 4. TTS 音色盘点（账号级，107 个）
npx --yes polyv-live-cli@rc ai video-produce tts-voice list -o json

# 5. 视频制作 PPT 课件库基线（账号级）
npx --yes polyv-live-cli@rc ai video-produce ppt list -o json
# → totalItems=1

# 6. 上传商品话术课件（写入，公网 .pptx 源 URL）
npx --yes polyv-live-cli@rc ai video-produce ppt upload \
  --url "https://raw.githubusercontent.com/scanny/python-pptx/master/tests/test_files/minimal.pptx" \
  --doc-name "GNHF-AI-电商数字人话术课件" --force -o json
# → fileId=d3a5786c488311408f8ee64cf308170c475b6884a7pptVideocommon

# 7. 复查课件落库（1→2）+ 转码状态
npx --yes polyv-live-cli@rc ai video-produce ppt list -o json
npx --yes polyv-live-cli@rc ai video-produce ppt get --file-id d3a5786c488311408f8ee64cf308170c475b6884a7pptVideocommon -o json
# → status: waitConvert → normal

# 8. AI 视频制作任务复盘（账号级，13 个）
npx --yes polyv-live-cli@rc ai video-produce list -o json
```

> 课件上传源 URL 为公网可达的测试 `.pptx`（python-pptx 仓库的 `minimal.pptx`），仅用于验证上传/转码链路，非真实商品话术；真实运营应替换为品牌话术课件公网地址。

## 12. 执行或验证结果

### 12.1 问题记录：`video-produce get --id` CLI 参数映射缺陷（已执行失败）

- **现象**：`ai video-produce get --id <id>` 对三个真实任务 ID（`23005` 有数字人 / `22991` 无数字人 / `37138` 草稿态）**全部报** `Unexpected error: aiPPTVideoId不能为空`（exit 非 0），与 ID 取值、是否含数字人、任务状态均无关。
- **根因**：CLI 的 `--id` 选项未被映射到后端接口的 `aiPPTVideoId` 字段（后端字段名带 `aiPPT` 前缀），导致请求体中 `aiPPTVideoId` 为空、被后端非空校验拒绝。这是与场景 03 lottery `comment` 的 `activityDuration` 未透传、场景 09 player `anti-record` 的 `modelType` 未透传同源的「CLI 选项 → 后端字段映射缺失」缺陷。
- **影响**：无法用 CLI 查询单个 AI 视频制作任务的完整字段（视频路径/数字人/字幕等），只能靠 `video-produce list` 的列表字段（已含 `videoPath`/`digitalHumanId`/`subtitlePath`/`status`）替代。
- **已做排查**：换不同 ID、换 table/json 输出格式均同报错；`list` 同族只读命令正常返回，排除账号/鉴权问题。
- **下一步建议**：上报 CLI 团队修复 `video-produce get` 的 `--id → aiPPTVideoId` 字段映射；在修复前，单任务详情查询用 `video-produce list --video-name` 过滤替代。

### 12.2 问题记录：`video-produce create` 本轮未执行（资源消耗 + 契约复杂）

- **现象**：`ai video-produce create --tasks <json>`（JSON 数组，max 20）是「真正触发 AI 视频渲染生产」的写入命令，会消耗账号的 AI 视频制作渲染配额/费用，并生成无法经 CLI 一键清理的产物任务（`video-produce delete` 需逐个 `--id`，而 `get` 缺陷导致难以核对产物 ID）。
- **决策**：本轮**不执行 `create`**。`create` 的 `--tasks` 载荷结构 help 未给出（仅 `JSON array of task payloads, max 20`），真实编排需要数字人 ID + 课件 fileId + TTS 音色 ID + 文案等多字段组合，盲猜载荷会真实触发渲染并留下孤儿任务。
- **替代验证路径**：本轮用「课件上传（ppt upload）」这条**可创建、可读回、可核对的低风险写入**验证 `ai` 族的写入链路（1→2 + 转码状态流转），并经 `video-produce list` 复盘账号既有 13 个生产任务（含 type=3 有数字人的真实产出形态）佐证「PPT 课件 + 数字人 + TTS」组合的可行性，无需真实触发渲染。
- **下一步建议**：业务真正需要批量生产时，先用后台或单个 `create` 探明 `--tasks` 载荷结构（数字人 ID 来自 `digital-human list`、课件 fileId 来自 `ppt upload`、音色 ID 来自 `tts-voice list`），确认字段后再批量。

### 12.3 问题记录：`digital-human set-org` 本轮未执行（账号级授权写入 + 无隔离测试对象）

- **现象**：`ai digital-human set-org --aiDigitalHumanId <id> --organizationIds <ids>` 是账号级授权写入，把数字人形象绑定到指定组织（限制哪些部门能选用该数字人）。
- **决策依据（按风险规则不执行）**：
  1. **无 CLI 可创建的测试数字人**：`ai` 族无 `digital-human create` 子命令，账号下 59 个数字人全部是账号存量共享资产（后台/历史创建），无本轮新建的隔离测试对象。风险规则要求「所有真实写入必须使用本轮新建的专用测试频道/测试对象」，set-org 无可用隔离对象。
  2. **爆炸半径跨账号全部门**：set-org 改写数字人的组织可见范围，会直接影响其他部门/团队成员能否继续选用该数字人，属账号级生产配置写入。
  3. **`list-org` 已验证只读链路**：本轮 `digital-human list-org --ids 1186,1184` 返回 `[]`（两个候选数字人当前无组织独占、账号内可见），证明只读查询链路正常，授权治理写入可在后台或明确授权后执行。
- **下一步建议**：若需做数字人组织级授权治理，应先经后台或专用治理流程，在确认目标组织 ID（`user org list`：总部 29031 / 子组织1 46101 / 子组织2 46107）与可回滚方案后再用 `set-org` 执行，并用 `list-org` 前后对比验证。

### 12.4 已验证持久化的写入前后对比

| 写入 | 变更前查询 | 写入命令 | 变更后查询 | 验证结论 |
|---|---|---|---|---|
| 上传话术课件 | `ppt list` totalItems=**1**（存量「test.ppt」normal） | `ppt upload --url <minimal.pptx> --doc-name "GNHF-AI-电商数字人话术课件" --force` → fileId `d3a5786c…` | `ppt list` totalItems=**2**（新增 `d3a5786c…`「GNHF-AI-电商数字人话术课件」）+ `ppt get` status **waitConvert→normal** | ✅ 真实写入并持久化，经 list 前后对比 + get 转码状态双重验证 |

### 12.5 配置侧 vs 观众侧验证

- **配置侧已满足**：`ai digital-human list` 返回 59 个数字人形象（含 fullBodyPhoto/coverPhoto/defaultTtsVoiceId/clothesDesc）、`tts-voice list` 返回 107 个音色、`ppt upload` 落库课件并转码 normal、`video-produce list` 返回 13 个含 `videoPath`/`subtitlePath` 的生产任务——这些是账号级 AI 内容生产资源的配置侧盘点。
- **观众侧未验证（需直播态/播放态）**：数字人是否能在直播间实际出镜直播、AI 短视频在观众侧的实际播放效果与音画同步，均需开播或播放视频才能验证，本轮未做观众侧验证，文档不声称「观众侧可见」。

## 13. 风险点与回滚/清理方式

| 风险 | 说明 | 回滚/清理 |
|---|---|---|
| `ppt upload` 产生账号级课件残留 | 本轮新增课件 `d3a5786c…`「GNHF-AI-电商数字人话术课件」作为保留资产留存 | CLI 无 `ppt delete` 子命令，需后台清理；本轮**未删除**（见第 14 节） |
| `digital-human set-org` 误改数字人可见范围 | 账号级授权写入，可能影响跨部门选用 | **本轮未执行**；如误执行，用 `set-org` 把 `organizationIds` 清空并 `list-org` 复核 |
| `video-produce create` 触发渲染消耗配额 | 真实触发 AI 渲染，产生费用与孤儿任务 | **本轮未执行**；如误执行，用 `video-produce delete --id <id>` 逐个清理（受 `get` 缺陷影响需先 `list` 核对 ID） |
| 课件源 URL 失效 | `ppt upload` 依赖公网源 URL 可达，源失效会转码失败 | 上传后用 `ppt get` 复查 `status` 是否 normal |

## 14. 保留资产说明

本场景保留以下资产，**均未删除**（CLI 无对应删除子命令或按风险规则不执行删除）：

| 资产 | ID / 标识 | 说明 | 人工清理方式（未执行） |
|---|---|---|---|
| 专用测试频道 | `7983961` | `GNHF-电商场景-19-ai-digital-human-videoproduce-202606231230`，topclass/ppt | 后台删除（CLI `channel delete` 若可用，**未执行**） |
| AI 话术课件 | `d3a5786c488311408f8ee64cf308170c475b6884a7pptVideocommon` | 「GNHF-AI-电商数字人话术课件」，normal | 后台清理（CLI 无 `ppt delete`，**未执行**） |

> 数字人形象（59 个）、TTS 音色（107 个）、AI 视频制作任务（13 个）、存量课件（test.ppt）均为账号存量共享资产，**本轮未做任何修改**，不属于本轮保留资产。

## 15. 可复用模板

### 15.1 AI 数字人电商主播选型清单（运营填表）

| 数字人 ID | 名称 | 默认音色 ID/名 | 服装 | 适配品类 | 组织授权 |
|---|---|---|---|---|---|
| 1184 | 高辰 | 751/阿龙（男） | 黑色西装 | 3C/家电/男装 | 无（账号可见） |
| 1186 | 郑羽 | 752/阿芸（女） | 白色衣服 | 美妆/服饰/母婴 | 无（账号可见） |
| 1183 | 阮妍 | 752/阿芸（女） | 白衣黑裙 | 食品/日百 | 无（账号可见） |
| … | （由 `ai digital-human list` 拉取填充） | … | … | … | （由 `list-org` 查询） |

### 15.2 商品话术课件生产 SOP（CLI 编排）

```bash
# 1. 选数字人 + 音色
npx --yes polyv-live-cli@rc ai digital-human list -o json        # 选 digitalHumanId
npx --yes polyv-live-cli@rc ai video-produce tts-voice list -o json  # 选 ttsVoiceId

# 2. 上传商品话术课件
FILE_ID=$(npx --yes polyv-live-cli@rc ai video-produce ppt upload \
  --url "<品牌话术课件公网 URL>" --doc-name "<商品名>-话术" --force -o json \
  | jq -r .fileId)

# 3. 复查转码完成（轮询至 normal）
npx --yes polyv-live-cli@rc ai video-produce ppt get --file-id "$FILE_ID" -o json

# 4. 复盘生产任务（含数字人的 type=3 产出）
npx --yes polyv-live-cli@rc ai video-produce list -o json
```

> 注：第 4 步 `video-produce create`（真实触发渲染）的 `--tasks` 载荷结构需先探明，见 12.2。

## 16. 后续可扩展方向

1. **真实触发 `video-produce create` 批量生产**：在探明 `--tasks` 载荷结构后，用「数字人 ID（digital-human list）+ 课件 fileId（ppt upload）+ TTS 音色 ID（tts-voice list）」组合批量生产商品讲解短视频，产出 `videoPath`/`subtitlePath` 用于投放与直播挂机。
2. **数字人组织级授权治理**：经后台或治理流程确认组织 ID 后，用 `digital-human set-org` 把数字人按事业部/品类授权，配合 `list-org` 前后对比验证。
3. **AI 视频挂载到直播频道**：把生产出的 AI 短视频作为频道暖场/挂机素材（结合 `player warmup`、`document` 课件、伪直播场景），承接非黄金时段。
4. **修复 `video-produce get` 缺陷后补做单任务详情查询**：上报 CLI 团队修复 `--id → aiPPTVideoId` 映射，使单任务详情查询可用，丰富复盘粒度。
5. **`partner`（#19）与 `transmit`（#33）专项覆盖**：剩余两个未覆盖一级命令中，`transmit`（转播/分会场）受账号级转播权益门控（场景 11 已探明 `create`/`associate` 报 access forbidden），`partner`（合作伙伴账号/腾讯云订单）为对外不可逆写入、无安全测试对象，需后台开通权益或专项授权后专项覆盖。
