# 场景 10：直播后回放复购 — 回放开关 + 回放/录制设置复盘

> 业务阶段：**复购 / 数据复盘**
> 覆盖一级命令：`playback`、`record`、`channel`、`account`
> 真实执行状态：**已执行成功**（`playback`、`record` 两族均有业务命令在真实测试频道上真实执行成功；其中 `record setting set` 与 `record convert` 已执行失败并作为问题发现记录）

---

## 1. 场景名称

直播后回放复购 —— 把「直播结束后的回放资产」变成二次转化的入口：开播后开启频道回放开关、配置回放来源与观看体验（倍速/进度条/商品库/聊天重现），直播后查询录制暂存、把录制文件转存为点播回放，供错过的观众随时回看并二次下单。

核心是把「查回放设置 → 开回放开关 → 查录制暂存 → 转存录制为点播 → 复盘回放列表」串成一个可照着执行的操作闭环：

- **回放配置侧（`record setting` + `playback enabled`）**：查询频道回放设置（开关/来源/类型/倍速/进度条/商品库/聊天重现），开启频道回放总开关，配置回放观看体验。
- **回放资产侧（`playback list` + `record file/material-list` + `record convert`）**：查询回放列表、查询录制暂存与素材库回放、把录制文件转存为点播。

> ⚠️ 本场景发现两个**真实执行问题**（均不影响命令覆盖结论）：
> 1. `record setting set` 对专用测试频道 `7983937` 的**所有取值组合**（含单独改 `--playback-enabled`、`--origin`、`--product-playback-enabled`）均报 `Unexpected error: illegal playback origin`（部分 `--origin record` 报 `unsupported record list`）。根因：新建未开播频道的默认回放配置 `origin=vod` 且 `videoId=null`，后端在每次 set 时重新校验「来源 + 视频」组合，因频道无任何录制/点播视频，该校验恒失败，导致 `record setting set` 在新建频道上**完全无法写入**。
> 2. `record convert` 报 `param should not be empty: fileIds`——转存需要真实录制文件 ID（来自已开播场次），新建未开播频道无录制文件，转存无法执行。
>
> 两个问题均不影响覆盖结论：`record` 族的 `setting get`/`file list`/`material-list` 三条业务命令在真实测试频道上真实执行成功；`playback` 族的 `list`/`enabled get`/`setting-list`/`video-info` 四条只读命令真实执行成功，且 `playback enabled set` 完成 N→Y→N 真实持久化写入（已前后对比 + 跨频道作用域验证）。两个命令族均已真实执行覆盖。详见第 12 节问题记录。

## 2. 覆盖命令

| 一级命令 | 子命令 | 执行状态 | 说明 |
|---|---|---|---|
| `account` | `account current`、`account list` | 已执行成功 | 写入前账号预检（`nicksu`，production，User ID `475b6884a7`） |
| `channel` | `channel create`、`channel get` | 已执行成功 | 创建专用测试频道 `7983937` 并复核 watchStatus=unStart、频道保留 |
| `playback` | `playback enabled get`（4 次：基线/写后/回滚后/作用域对照） | 已执行成功 | 频道回放总开关查询，7983937 基线 N→写后 Y→回滚 N，7983934 对照恒 N |
| `playback` | `playback enabled set --play-back-enabled Y/N` | 已执行成功 | **真实写入**：回放总开关 N→Y→N 全周期，`enabled get` 前后对比验证持久化，且 7983934 未受影响（确认频道级作用域） |
| `playback` | `playback list`（playback/vod 两种 list-type） | 已执行成功 | 回放列表 / 点播列表查询（频道未开播，无回放，符合预期） |
| `playback` | `playback setting-list`（批量 3 频道） | 已执行成功 | 批量回放设置查询，7983937/7983934/7983902 均返回 playBackEnabled=N、origin=vod、videoList=[] |
| `playback` | `playback video-info`（批量 2 频道） | 已执行成功 | 批量单个回放信息查询，videoId/vid 均 null |
| `record` | `record setting get`（基线 + 多次复查） | 已执行成功 | 频道回放设置全量字段查询（playbackEnabled/origin/type/各播放体验开关） |
| `record` | `record setting set`（6 种取值组合） | 已执行失败 | 全部报 `illegal playback origin`（`--origin record` 报 `unsupported record list`），新建未开播频道默认 origin=vod/videoId=null 被后端校验拒绝，无法写入。见第 12 节 |
| `record` | `record file list --user-id` | 已执行成功 | 频道直播暂存列表查询（频道未开播，返回 `[]`，符合预期） |
| `record` | `record material-list` | 已执行成功 | 素材库频道回放分页查询（totalItems=0，结构完整） |
| `record` | `record convert`（带 `--force`） | 已执行失败 | 报 `param should not be empty: fileIds`，转存需真实录制文件 ID，新建未开播频道无录制文件。见第 12 节 |

> 说明：本场景所有「已执行成功」命令均使用真实账号（`nicksu`）与真实测试频道（`7983937`）真实执行过，下文「命令执行台账」逐条记录。`record setting set` 与 `record convert` 真实执行但未达预期效果，按「已执行失败」并作为问题发现记录。`playback` 族因 `enabled set` 真实写入成功（且 `enabled get` 前后对比 + 跨频道作用域验证）+ 四条只读命令真实执行成功而计入「已覆盖」；`record` 族因 `setting get`/`file list`/`material-list` 三条业务命令真实执行成功而计入「已覆盖」（与场景 06/07 只读命令计入覆盖的先例一致）。

## 3. 专用测试频道

| 项 | 值 |
|---|---|
| 频道名称 | `GNHF-电商场景-10-playback-record-replay-202606230046` |
| 频道 ID | `7983937` |
| 账号环境 | `nicksu`（App ID `h2wazzobbq`，User ID `475b6884a7`，production） |
| 场景类型 | `alone`（活动营销） |
| 模板 | `alone`（纯视频-横屏） |
| 创建结果 | 成功（status=waiting / watchStatus=unStart / 未开始） |
| 创建时间 | 2026-06-23 00:46:25 CST |
| 是否删除 | **否，频道已保留**，供人工在后台查看回放设置与录制暂存 |

> 创建命令：`npx --yes polyv-live-cli@rc channel create -n "GNHF-电商场景-10-playback-record-replay-202606230046" -d "GNHF电商场景10：直播后回放复购 — 回放设置+录制转存" --scene alone --template alone -o json`，返回 `channelId=7983937`。`channel get` 复核 watchStatus=unStart、name 一致。

## 4. 行业背景

电商直播的「**直播结束后的 24～72 小时**」是二次转化的黄金窗口：直播场观有限，但回放可以被反复分发到私域社群、商品详情页、公众号，触达**错过直播但已种草**的潜在买家。成熟直播间的回放复购 SOP 通常包括：

- **开回放 + 配观看体验**：开启频道回放总开关，配置倍速播放、进度条拖拽、商品库重现、聊天互动重现等，让回放观众也能看到「商品弹窗 + 实时互动氛围」，把回放从「单纯看录像」升级为「近似直播的转化场」。
- **录制转存为点播回放**：把单场直播的录制文件转存为点播视频，设为默认回放，供长期分发。商品库、优惠券、卡片推送等营销组件在回放中同步重现，实现「回放即二次直播间」。

保利威的 `record`（回放设置管理 + 录制暂存/转存）与 `playback`（回放列表/开关/批量查询）就是支撑这套 SOP 的标准能力。本场景把「查回放设置 → 开回放总开关 → 查录制暂存 → 尝试转存录制 → 复盘回放列表」串成一个真实可执行的操作手册，全部用真实测试频道验证，并如实记录 `record setting set` 因新建频道默认配置非法而无法写入、`record convert` 因无录制文件而无法执行两个问题。

## 5. 业务目标与核心 KPI

**业务目标**：把直播结束后的回放资产配置成可二次转化的「近似直播」观看场，用回放开关 + 回放观看体验 + 录制转存点播，承接错过直播的潜在买家，拉升回放复购 GMV。

**核心 KPI**：

| KPI | 定义 | 配置侧可观测手段 |
|---|---|---|
| 回放开播率 | 直播结束后开启回放的场次占比 | `playback enabled get` 确认回放总开关=Y；`record setting get` 确认 playbackEnabled=Y |
| 回放观看体验完整度 | 倍速/进度条/商品库/聊天重现开关齐全 | `record setting get` 的 playbackMultiplierEnabled/playbackProgressBarEnabled/productPlaybackEnabled/chatPlaybackEnabled |
| 录制转存成功率 | 当场录制成功转存为点播回放的比例 | `record convert` 返回 vid + `playback list` 复核（本场景因未开播转存失败） |
| 回放复购转化 | 回放观众中产生下单/领券的比例 | `playback list` 回放视频 × 优惠券/商品点击统计交叉（跨场景） |

> 配置侧 vs 观众侧：本场景 `record setting set` 写入失败、`record convert` 无录制文件无法执行，**回放观看体验与转存均未在观众侧验证**。`playback enabled set` 的回放总开关 N→Y 已在配置侧（`enabled get`）验证持久化，但因频道未开播，观众侧回放页是否真正可看未验证。文档不声称「观众侧可见/可用」。

## 6. 适用角色

| 角色 | 在本场景的职责 |
|---|---|
| 直播运营 | 直播前/后配置回放开关与观看体验（倍速/进度条/商品库/聊天重现），决定是否开启回放 |
| 中控 / 场控 | 直播结束后发起录制转存，把当场录制设为默认回放 |
| 数据复盘 | 直播后用 `playback list` / `record setting-list` 复盘各频道回放开播率与观看体验配置 |

## 7. 前置条件

1. 已配置 PolyV 账号并有可用 App ID / App Secret（本场景用 `nicksu`，production）。
2. 有一个**专用测试频道**承载回放配置（本场景新建 `7983937`，**勿在长期主频道上直接改回放设置**）。
3. **回放来源需合法内容**：`record setting set` 的后端校验要求「来源（origin）+ 视频（videoId）」组合合法——`origin=vod/playback` 需真实 videoId、`origin=record` 需有录制文件、`origin=material` 需素材库回放。新建未开播频道三者皆无，`record setting set` 无法写入（详见第 12 节问题 1）。
4. **录制转存需已开播场次**：`record convert` 需真实录制文件 ID（fileIds），来自已推流开播的场次；未开播频道无录制文件，转存无法执行（详见第 12 节问题 2）。
5. `record file list` 必填 `--user-id`（用户级查询），`record temp-list` 必填 `--file-id`（暂存文件 ID）。
6. `playback enabled set` 必填 `--user-id`，配合 `-c` 时为**频道级**写入（本场景已验证仅影响指定频道，不影响同账号其他频道）。

## 8. polyv-live-cli-rc 能力映射

| 业务动作 | 一级命令 | 子命令 | 真实 help 关键参数 |
|---|---|---|---|
| 查频道回放总开关 | `playback` | `enabled get` | `-c/--channel-id`、`-o/--output` |
| 改频道/用户回放总开关 | `playback` | `enabled set` | `--user-id`（必填）、`-c`（频道级时传）、`--play-back-enabled <Y\|N>`、`-f/--force`、`-o` |
| 查回放/点播列表 | `playback` | `list` | `-c`、`--list-type <playback\|vod>`、`--page`、`--page-size`、`-o` |
| 查单个回放详情 | `playback` | `get` | `-c`、`--video-id`（必填）、`--list-type`、`-o`（本场景无视频，未执行） |
| 批量查回放设置 | `playback` | `setting-list` | `--channel-ids <逗号分隔>`、`-o` |
| 批量查单个回放信息 | `playback` | `video-info` | `--channel-ids <逗号分隔>`、`-o` |
| 查频道回放设置全量 | `record` | `setting get` | `-c`、`-o` |
| 改频道回放设置 | `record` | `setting set` | `-c`、`--playback-enabled`、`--type`、`--origin`、`--video-id`、`--playback-multiplier-enabled`、`--playback-progress-bar-enabled`、`--chat-playback-enabled`、`--product-playback-enabled`、`-o`（本场景写入全部失败，见问题 1） |
| 查频道直播暂存列表 | `record` | `file list` | `-c`、`--user-id`（必填）、`--start-date/--end-date`、`--session-ids`、`-o` |
| 查单个暂存信息 | `record` | `temp-list` | `-c`、`--file-id`（必填）、`-o`（本场景无暂存，未执行） |
| 查素材库回放列表 | `record` | `material-list` | `-c`、`--page`、`--page-size`、`-o` |
| 转存录制为点播 | `record` | `convert` | `-c`、`--file-name`（必填）、`--session-id`、`--to-play-list`、`--set-as-default`、`--async`、`--callback-url`、`-f`、`-o`（本场景无录制文件，失败） |
| 设默认回放视频 | `record` | `set-default` | `-c`、`--video-id`（必填）、`--list-type`、`-o`（本场景无视频，未执行） |

> ⚠️ 真实 help 与 reference `record-settings.md` 差异：reference 列出的 `--section-enabled`（章节开关）、`--global-setting-enabled`（通用设置）**在 rc(1.2.31-rc.0) 真实 `record setting set --help` 中不存在**；真实 help 的开关参数为 `--playback-enabled`、`--type`、`--origin`、`--video-id`、`--playback-multiplier-enabled`、`--playback-progress-bar-enabled`、`--chat-playback-enabled`、`--product-playback-enabled`（多了商品库开关）。本场景以真实 help 为准。真实 `record` 子命令面也比 reference 丰富：含 `breakpoint`（打点）、`clip`（裁剪）、`file`（历史录制）、`merge-mp4`/`merge-mp4-start`（MP4 合并）、`outline`（暂存大纲）、`subtitle`（暂存字幕）等。

## 9. 实施步骤

### 步骤 1：账号预检 + 建专用测试频道

```bash
npx --yes polyv-live-cli@rc account current
npx --yes polyv-live-cli@rc account list
npx --yes polyv-live-cli@rc channel create -n "GNHF-电商场景-10-playback-record-replay-202606230046" -d "GNHF电商场景10：直播后回放复购" --scene alone --template alone -o json
npx --yes polyv-live-cli@rc channel get -c 7983937 -o json   # 复核 watchStatus=unStart
```

### 步骤 2：查回放设置基线（配置侧）

```bash
npx --yes polyv-live-cli@rc record setting get -c 7983937 -o json
# 基线：playbackEnabled=N、origin=vod、videoId=null、productPlaybackEnabled=N、
#       playbackMultiplierEnabled=Y、chatPlaybackEnabled=Y、playbackProgressBarEnabled=Y
npx --yes polyv-live-cli@rc playback enabled get -c 7983937 -o json   # "N"（回放总开关关）
```

### 步骤 3：开启频道回放总开关（真实写入，前后对比 + 作用域验证）

```bash
npx --yes polyv-live-cli@rc playback enabled set -c 7983937 --user-id 475b6884a7 --play-back-enabled Y -f -o json
# 返回 7983937
npx --yes polyv-live-cli@rc playback enabled get -c 7983937 -o json   # "Y" ✅ 持久化
npx --yes polyv-live-cli@rc playback enabled get -c 7983934 -o json   # "N"（作用域对照，未受影响）
```

### 步骤 4：回滚回放总开关（演示 N→Y→N 全周期）

```bash
npx --yes polyv-live-cli@rc playback enabled set -c 7983937 --user-id 475b6884a7 --play-back-enabled N -f -o json
npx --yes polyv-live-cli@rc playback enabled get -c 7983937 -o json   # "N"（已回滚默认态）
```

### 步骤 5：尝试改回放设置（新建频道默认配置非法，预期失败）

```bash
# 以下 6 种组合全部失败，根因：默认 origin=vod/videoId=null 被后端校验拒绝
npx --yes polyv-live-cli@rc record setting set -c 7983937 --playback-enabled Y -o json
# Unexpected error: illegal playback origin
npx --yes polyv-live-cli@rc record setting set -c 7983937 --playback-enabled Y --origin record -o json
# Unexpected error: unsupported record list
npx --yes polyv-live-cli@rc record setting set -c 7983937 --origin material -o json
# Unexpected error: illegal playback origin
# …其余组合（--product-playback-enabled Y、--playback-enabled N 等）同样报 illegal playback origin
# 详见第 12 节问题 1
```

### 步骤 6：查录制暂存与素材库回放（频道未开播，预期空）

```bash
npx --yes polyv-live-cli@rc record file list -c 7983937 --user-id 475b6884a7 -o json   # []
npx --yes polyv-live-cli@rc record material-list -c 7983937 -o json   # {totalItems:0,contents:[]}
```

### 步骤 7：尝试转存录制为点播（无录制文件，预期失败）

```bash
npx --yes polyv-live-cli@rc record convert -c 7983937 --session-id "gnhf-no-session-001" --file-name "GNHF回放复购测试转存" --force -o json
# Unexpected error: param should not be empty: fileIds（需真实录制文件 ID，见第 12 节问题 2）
```

### 步骤 8：批量复盘回放列表与回放设置（跨频道）

```bash
npx --yes polyv-live-cli@rc playback list -c 7983937 -o json   # 暂无回放视频
npx --yes polyv-live-cli@rc playback setting-list --channel-ids "7983937,7983934,7983902" -o json   # 3 频道均 playBackEnabled=N
npx --yes polyv-live-cli@rc playback video-info --channel-ids "7983937,7983934" -o json   # videoId/vid 均 null
```

### 步骤 9：保留频道，记录清理命令（未执行）

```bash
# 人工清理（本场景未执行，频道已保留）：
# npx --yes polyv-live-cli@rc channel delete -c 7983937   # 仅人工需要时执行
```

## 10. 命令执行台账

| # | 执行时间 (CST) | 一级命令.子命令 | 实际执行命令（敏感值脱敏） | 频道/对象 ID | 结果 | 关键输出摘要 |
|---|---|---|---|---|---|---|
| 1 | 2026-06-23 00:46 | account.current | `account current` | — | 成功 | 默认账号 nicksu（App ID h2wazzobbq，production） |
| 2 | 2026-06-23 00:46 | account.list | `account list` | — | 成功 | 共 6 个账号，默认 nicksu |
| 3 | 2026-06-23 00:46 | channel.create | `channel create -n "GNHF-电商场景-10-…" --scene alone --template alone -o json` | 7983937 | 成功 | channelId=7983937，status=waiting，created=6/23/2026 12:46:25 AM |
| 4 | 2026-06-23 00:46 | record.setting.get | `record setting get -c 7983937 -o json` | 7983937 | 成功 | playbackEnabled=N、origin=vod、videoId=null、productPlaybackEnabled=N、playbackMultiplierEnabled=Y、chatPlaybackEnabled=Y（基线全量） |
| 5 | 2026-06-23 00:47 | playback.enabled.get | `playback enabled get -c 7983937 -o json` | 7983937 | 成功 | `"N"`（回放总开关基线） |
| 6 | 2026-06-23 00:47 | playback.list | `playback list -c 7983937 -o json` | 7983937 | 成功 | `暂无回放视频`（频道未开播，符合预期） |
| 7 | 2026-06-23 00:47 | record.setting.set | `record setting set -c 7983937 --playback-enabled Y -o json` | 7983937 | **执行失败** | `Unexpected error: illegal playback origin`（默认 origin=vod/videoId=null 被拒，见问题 1） |
| 8 | 2026-06-23 00:47 | record.setting.set | `record setting set -c 7983937 --playback-enabled Y --origin record -o json` | 7983937 | **执行失败** | `Unexpected error: unsupported record list`（origin=record 需录制文件，见问题 1） |
| 9 | 2026-06-23 00:47 | record.setting.set | `record setting set -c 7983937 --product-playback-enabled Y -o json` | 7983937 | **执行失败** | `illegal playback origin`（纯开关也无法绕过 origin 校验） |
| 10 | 2026-06-23 00:47 | record.setting.set | `record setting set -c 7983937 --origin material -o json` | 7983937 | **执行失败** | `illegal playback origin` |
| 11 | 2026-06-23 00:47 | record.setting.set | `record setting set -c 7983937 --playback-enabled N -o json` | 7983937 | **执行失败** | `illegal playback origin`（即便显式 N 也被校验拦截） |
| 12 | 2026-06-23 00:47 | record.setting.set | `record setting set -c 7983937 --playback-enabled N --product-playback-enabled Y -o json` | 7983937 | **执行失败** | `illegal playback origin` |
| 13 | 2026-06-23 00:47 | playback.enabled.set | `playback enabled set -c 7983937 --user-id 475b6884a7 --play-back-enabled Y -f -o json` | 7983937 | 成功 | 返回 `7983937`；写后 enabled get=`"Y"`（见台账 #14），确认持久化 |
| 14 | 2026-06-23 00:47 | playback.enabled.get | `playback enabled get -c 7983937 -o json`（写后复查） | 7983937 | 成功 | `"Y"` ✅ 与基线 `"N"` 对比确认 N→Y 持久化 |
| 15 | 2026-06-23 00:47 | playback.enabled.get | `playback enabled get -c 7983934 -o json`（作用域对照） | 7983934 | 成功 | `"N"`（7983934 未受 7983937 写入影响，确认频道级作用域） |
| 16 | 2026-06-23 00:47 | playback.enabled.set | `playback enabled set -c 7983937 --user-id 475b6884a7 --play-back-enabled N -f -o json`（回滚） | 7983937 | 成功 | 返回 `7983937`；回滚后 enabled get=`"N"`（见台账 #17） |
| 17 | 2026-06-23 00:47 | playback.enabled.get | `playback enabled get -c 7983937 -o json`（回滚后复查） | 7983937 | 成功 | `"N"` ✅ Y→N 回滚完成，频道恢复默认态 |
| 18 | 2026-06-23 00:48 | playback.setting-list | `playback setting-list --channel-ids "7983937,7983934,7983902" -o json` | 多频道 | 成功 | 3 频道均 playBackEnabled=N、origin=vod、type=list、videoList=[]、globalSettingEnabled=N |
| 19 | 2026-06-23 00:48 | playback.video-info | `playback video-info --channel-ids "7983937,7983934" -o json` | 多频道 | 成功 | 两频道 videoId/videoPoolId/videoName/duration/vid 均 null |
| 20 | 2026-06-23 00:48 | record.file.list | `record file list -c 7983937 --user-id 475b6884a7 -o json` | 7983937 | 成功 | `[]`（频道未开播，无录制暂存，符合预期） |
| 21 | 2026-06-23 00:48 | record.material-list | `record material-list -c 7983937 -o json` | 7983937 | 成功 | `{pageNumber:1,pageSize:10,totalPages:0,totalItems:0,contents:[]}` |
| 22 | 2026-06-23 00:48 | record.convert | `record convert -c 7983937 --session-id "gnhf-no-session-001" --file-name "GNHF回放复购测试转存" --force -o json` | 7983937 | **执行失败** | `Unexpected error: param should not be empty: fileIds`（需真实录制文件 ID，见问题 2） |
| 23 | 2026-06-23 00:48 | playback.list | `playback list -c 7983937 --list-type vod -o json` | 7983937 | 成功 | `暂无回放视频`（点播列表亦空） |
| 24 | 2026-06-23 00:48 | record.setting.get | `record setting get -c 7983937 -o json`（收尾复核） | 7983937 | 成功 | playbackEnabled=N、origin=vod、productPlaybackEnabled=N（与基线一致，频道恢复默认） |
| 25 | 2026-06-23 00:48 | channel.get | `channel get -c 7983937 -o json`（收尾复核频道未被删除） | 7983937 | 成功 | watchStatus=unStart，name 一致，频道保留 |

> 变更前/后查询对比（规则 15）：
> - **回放总开关（`playback enabled`）**：变更前（台账 #5）`"N"` → 写入 Y（台账 #13）→ 变更后（台账 #14）`"Y"` ✅ → 回滚 N（台账 #16）→ 复查（台账 #17）`"N"`。完整 N→Y→N 周期，`playback enabled get` 前后对比确认持久化。
> - **回放设置（`record setting`）**：变更前（台账 #4）playbackEnabled=N/origin=vod/productPlaybackEnabled=N → 6 次 set 全部报错（台账 #7~#12）→ 变更后（台账 #24）仍 playbackEnabled=N/origin=vod/productPlaybackEnabled=N。`record setting set` **未产生任何可在 `record setting get` 观测到的状态变化**，无法证明任何配置变更。

## 11. 实际使用的 CLI 命令与真实参数

> 所有命令均以 `npx --yes polyv-live-cli@rc` 为前缀（rc 版本 1.2.31-rc.0），频道 ID `7983937`、账号 `nicksu`（production，User ID `475b6884a7`）。AppSecret / pushSecret / token 等敏感值在输出中均已脱敏。

```bash
# 账号预检
npx --yes polyv-live-cli@rc account current
npx --yes polyv-live-cli@rc account list

# 建专用测试频道
npx --yes polyv-live-cli@rc channel create -n "GNHF-电商场景-10-playback-record-replay-202606230046" -d "GNHF电商场景10：直播后回放复购" --scene alone --template alone -o json
npx --yes polyv-live-cli@rc channel get -c 7983937 -o json

# 回放设置基线
npx --yes polyv-live-cli@rc record setting get -c 7983937 -o json
npx --yes polyv-live-cli@rc playback enabled get -c 7983937 -o json

# 开启回放总开关（真实写入，频道级）+ 前后对比 + 作用域对照
npx --yes polyv-live-cli@rc playback enabled set -c 7983937 --user-id 475b6884a7 --play-back-enabled Y -f -o json
npx --yes polyv-live-cli@rc playback enabled get -c 7983937 -o json
npx --yes polyv-live-cli@rc playback enabled get -c 7983934 -o json   # 作用域对照
# 回滚
npx --yes polyv-live-cli@rc playback enabled set -c 7983937 --user-id 475b6884a7 --play-back-enabled N -f -o json
npx --yes polyv-live-cli@rc playback enabled get -c 7983937 -o json

# 尝试改回放设置（新建频道默认配置非法，失败）
npx --yes polyv-live-cli@rc record setting set -c 7983937 --playback-enabled Y -o json
npx --yes polyv-live-cli@rc record setting set -c 7983937 --playback-enabled Y --origin record -o json
npx --yes polyv-live-cli@rc record setting set -c 7983937 --product-playback-enabled Y -o json
npx --yes polyv-live-cli@rc record setting set -c 7983937 --origin material -o json

# 录制暂存与素材库回放查询
npx --yes polyv-live-cli@rc record file list -c 7983937 --user-id 475b6884a7 -o json
npx --yes polyv-live-cli@rc record material-list -c 7983937 -o json

# 尝试转存录制为点播（无录制文件，失败）
npx --yes polyv-live-cli@rc record convert -c 7983937 --session-id "gnhf-no-session-001" --file-name "GNHF回放复购测试转存" --force -o json

# 批量复盘回放列表与回放设置
npx --yes polyv-live-cli@rc playback list -c 7983937 -o json
npx --yes polyv-live-cli@rc playback setting-list --channel-ids "7983937,7983934,7983902" -o json
npx --yes polyv-live-cli@rc playback video-info --channel-ids "7983937,7983934" -o json
```

## 12. 执行或验证结果（含问题记录）

### 12.1 已执行成功的命令（配置侧）

| 命令 | 结果 | 结论 |
|---|---|---|
| `record setting get`（基线 + 收尾，2 次） | 全量回放设置字段（playbackEnabled/origin/type/各播放体验开关/各营销组件回放开关） | 命令真实执行成功，API 返回有效响应。作为「回放配置基线 / 变更前/后查询」原语工作正常 |
| `playback enabled get`（4 次） | 7983937 基线 `"N"` → 写后 `"Y"` → 回滚 `"N"`；7983934 对照 `"N"` | 命令真实执行成功，是验证回放总开关持久化的可靠原语 |
| `playback enabled set`（Y/N 各 1 次） | 返回频道 ID；写后 enabled get 确认 N→Y→N | **真实写入成功**，频道级作用域（7983934 未受影响） |
| `playback list`（playback/vod 各 1 次） | 暂无回放视频 | 命令真实执行成功，list-type 参数被正确接受（频道未开播无回放，预期） |
| `playback setting-list`（批量 3 频道） | 3 频道均 playBackEnabled=N、origin=vod、videoList=[] | 命令真实执行成功，批量 channel-ids 参数被正确接受，适合跨频道复盘回放开播率 |
| `playback video-info`（批量 2 频道） | 两频道 videoId/vid 均 null | 命令真实执行成功，批量查询原语工作正常 |
| `record file list --user-id` | `[]` | 命令真实执行成功，user-id 必填参数被接受（频道未开播无暂存，预期） |
| `record material-list` | `{totalItems:0,contents:[]}` | 命令真实执行成功，分页结构完整（无素材库回放，预期） |
| `channel create / channel get` | 频道 7983937 创建并复核一致 | 专用测试频道就绪，watchStatus=unStart，频道保留 |

### 12.2 问题记录 1：`record setting set` 因新建频道默认回放配置非法而无法写入

- **现象**：对专用测试频道 `7983937` 执行 6 种取值组合的 `record setting set`，**全部失败**：
  - `--playback-enabled Y` → `Unexpected error: illegal playback origin`
  - `--playback-enabled Y --origin record` → `Unexpected error: unsupported record list`
  - `--product-playback-enabled Y`（纯开关） → `illegal playback origin`
  - `--origin material` → `illegal playback origin`
  - `--playback-enabled N`（显式关） → `illegal playback origin`
  - `--playback-enabled N --product-playback-enabled Y` → `illegal playback origin`
- **根因分析**：新建未开播频道 `record setting get` 返回的默认配置是 `origin=vod`、`videoId=null`。后端在每次 `set` 时会**重新校验「来源 + 视频」组合的合法性**：
  - `origin=vod` 必须配真实 videoId（点播视频），但新建频道无任何点播视频 → `illegal playback origin`；
  - `origin=record` 必须有录制文件 → `unsupported record list`；
  - `origin=material` 必须有素材库回放 → 同样非法。
  - 由于频道从未推流开播，三类来源对应的真实内容（点播视频/录制文件/素材库回放）**三者皆无**，无论传哪个开关/来源都被校验拦截。即便显式 `--playback-enabled N` 也无法绕过——后端仍校验当前 origin 合法性。
- **交叉验证**：对场景 09 的既有测试频道 `7983934` 执行 `record setting get`，**返回完全相同的默认配置**（playbackEnabled=N、origin=vod、videoId=null）。即新建未开播频道的默认回放配置对 `record setting set` 是**普遍非法**的，并非 `7983937` 独有。
- **结论**：**在未开播频道上无法用 `record setting set` 修改任何回放设置**。要让 `record setting set` 可写入，频道必须先具备合法的回放来源内容——即「先推流开播产生录制，或先有可用点播/素材视频」。
- **运营结论**：回放观看体验配置（倍速/进度条/商品库/聊天重现）应在**直播结束后、已有录制/点播内容**时配置，新建空频道阶段配置会静默失败。运营若要确认回放设置是否生效，必须用 `record setting get` 复查（注意默认 origin=vod/videoId=null 本身就是「未配置合法来源」的状态）。
- **下一步排查建议**：在一个**真实推流开播过**的测试频道上重跑 `record setting set`（此时 origin=record 已有录制文件，或可切到 vod 配合真实 videoId），验证 set 是否在合法来源下可正常写入各播放体验开关。

### 12.3 问题记录 2：`record convert` 无录制文件无法转存

- **现象**：`record convert -c 7983937 --session-id "gnhf-no-session-001" --file-name "GNHF回放复购测试转存" --force -o json` 报 `Unexpected error: param should not be empty: fileIds`。
- **根因**：`record convert` 的后端契约需要**真实录制文件 ID 列表（fileIds）**，来自已推流开播场次产生的录制。`session-id` 只是场次标识，CLI 未从 session 自动解析出 fileIds；新建未开播频道无任何录制文件，转存必然缺 fileIds。
- **佐证**：`session list -c 7983937` 返回 `totalItems=0`（无场次），`record file list` 返回 `[]`（无录制暂存）——频道从未开播，确实没有可转存的录制内容。
- **结论**：录制转存点播是「直播后」动作，必须在频道真实开播、产生录制文件后执行。本场景不推流开播（避免占用真实推流资源），转存失败属预期。
- **运营结论**：运营编排「直播后回放复购」SOP 时，录制转存步骤必须挂在「直播结束、录制文件落库」之后，并先 `record file list` 取到真实 fileIds 再转存（而非仅传 session-id）。
- **下一步排查建议**：在一个真实开播过的测试频道上执行 `record file list` 取 fileIds，再用 `record convert --file-name … --to-play-list Y --set-as-default Y` 转存并设为默认回放，补全转存成功路径。

### 12.4 配置侧 vs 观众侧

| 能力 | 配置侧 | 观众侧 |
|---|---|---|
| 回放总开关是否生效 | ✅ `playback enabled set` N→Y 经 `enabled get` 验证持久化（频道级） | 未验证（频道未开播，无回放页可看） |
| 回放观看体验（倍速/进度条/商品库/聊天重现） | ❌ `record setting set` 写入失败（问题 1），无法配置 | 未验证 |
| 录制转存点播 | ❌ `record convert` 无录制文件失败（问题 2） | 未验证 |
| 回放列表 / 录制暂存查询 | ✅ `playback list`/`record file list`/`material-list` 可查（频道未开播故为空） | — |
| 回放观看页是否可看 | — | 未验证（需开播 + 产生回放后开观看页） |

> 本场景所有「已执行成功」结论均限**配置侧 / 指令侧**。观众侧真实效果（回放页是否可看、倍速/商品库是否重现）未验证，文档不声称「观众侧可见/可用」。

## 13. 风险点与回滚/清理方式

| 风险 | 影响 | 缓解 / 回滚 |
|---|---|---|
| `record setting set` 在新建频道静默失败（问题 1） | 运营误以为回放体验已配置，开播后回放页实际无倍速/商品库 | **必须**用 `record setting get` 复查；回放体验配置应在直播后（已有录制/点播内容）进行；不能信任 set 不报错即生效 |
| `record convert` 缺 fileIds 失败（问题 2） | 录制转存脚本漏传录制文件 ID 会静默失败 | 转存前先 `record file list` 取真实 fileIds；转存挂在直播结束后 |
| `playback enabled set` 误传 `--user-id` 不带 `-c` | 可能改为**用户级**（影响同账号所有频道）回放开关 | 频道级写入必须同时带 `-c` 与 `--user-id`；本场景已用 7983934 作用域对照确认仅影响指定频道 |
| 误在长期主频道改回放设置 | 影响线上直播间的回放开播与观看体验 | **所有回放配置一律用专用测试频道**；本场景用新建 `7983937`，未触碰任何既有频道 |
| 测试频道残留 | 占用频道配额 | 频道已保留供人工查看（见第 14 节）；如需清理用 `channel delete -c 7983937`（**本场景未执行**） |

## 14. 保留资产说明

| 资产 | 状态 | 用途 |
|---|---|---|
| 测试频道 `7983937`（GNHF-电商场景-10-playback-record-replay-202606230046） | **已保留，未删除** | 供人工在保利威后台查看回放默认配置（验证问题 1 的 origin=vod/videoId=null 假设）、查看录制暂存状态 |
| 回放总开关（`playback enabled` N→Y→N） | 已回滚至默认 N | 无残留（最终态=基线） |
| 回放设置（6 次 `record setting set`） | 全部失败，未持久化 | 无残留（`record setting get` 仍为基线） |
| 录制转存（1 次 `record convert`） | 失败，未产生点播视频 | 无残留 |

> **频道已保留，未执行删除**。可选的人工清理命令（**本场景未执行**）：
> ```bash
> npx --yes polyv-live-cli@rc channel delete -c 7983937   # 仅人工确认需要清理时执行
> ```

## 15. 可复用模板

### 15.1 直播后开启回放总开关模板（频道级，前后对比）

```bash
CHANNEL_ID="<你的频道ID>"
USER_ID="<你的用户ID>"
# 1. 查基线
npx --yes polyv-live-cli@rc playback enabled get -c "$CHANNEL_ID" -o json
# 2. 开启回放总开关（频道级，必须带 -c 与 --user-id）
npx --yes polyv-live-cli@rc playback enabled set -c "$CHANNEL_ID" --user-id "$USER_ID" --play-back-enabled Y -f -o json
# 3. 复查确认持久化
npx --yes polyv-live-cli@rc playback enabled get -c "$CHANNEL_ID" -o json   # 应为 "Y"
```

### 15.2 直播后配置回放观看体验模板（需已有录制/点播内容）

```bash
CHANNEL_ID="<你的频道ID>"
# ⚠️ 新建未开播频道 origin=vod/videoId=null 默认非法，record setting set 会报 illegal playback origin
# 必须在频道已有录制/点播内容后配置。先查基线：
npx --yes polyv-live-cli@rc record setting get -c "$CHANNEL_ID" -o json
# 开回放 + 倍速 + 进度条 + 商品库 + 聊天重现（origin 需指向已有合法内容）
npx --yes polyv-live-cli@rc record setting set -c "$CHANNEL_ID" \
  --playback-enabled Y --playback-multiplier-enabled Y \
  --playback-progress-bar-enabled Y --product-playback-enabled Y \
  --chat-playback-enabled Y -o json
# 复查
npx --yes polyv-live-cli@rc record setting get -c "$CHANNEL_ID" -o json
```

### 15.3 直播后录制转存点播模板（需先取真实 fileIds）

```bash
CHANNEL_ID="<你的频道ID>"
# 1. 查录制暂存取真实 fileIds（必填 --user-id）
npx --yes polyv-live-cli@rc record file list -c "$CHANNEL_ID" --user-id "<用户ID>" -o json
# 2. 转存为点播（用真实 fileIds，非 session-id；同一账号至少间隔 5 分钟）
npx --yes polyv-live-cli@rc record convert -c "$CHANNEL_ID" \
  --file-name "<回放名称>" --to-play-list Y --set-as-default Y --force -o json
# 3. 复盘回放列表
npx --yes polyv-live-cli@rc playback list -c "$CHANNEL_ID" -o json
```

### 15.4 跨频道回放开播率复盘模板

```bash
CHANNEL_IDS="<频道A>,<频道B>,<频道C>"
npx --yes polyv-live-cli@rc playback setting-list --channel-ids "$CHANNEL_IDS" -o json
# 输出每频道的 playBackEnabled/origin/videoList/globalSettingEnabled，用于统计回放开播率
```

## 16. 后续可扩展方向

- **观众侧验证补全**：在一个真实推流开播过的测试频道上重跑 `record setting set`（此时 origin=record 已有录制文件）验证播放体验开关可正常写入；并执行 `record convert` 取真实 fileIds 转存，用 `playback list` 复核默认回放设成功；开观看页验证倍速/进度条/商品库/聊天重现是否对回放观众可见，补全问题 1、2 的成功路径与观众侧证据。
- **回放 → 复购转化闭环**：把 `playback list` 回放视频 × 场景 01 的 `coupon` 优惠券 / 场景 02 的 `product` 商品点击统计交叉，量化回放观众的领券/下单转化（跨场景数据复盘）。
- **录制深加工**：`record` 族还有 `breakpoint`（打点）、`clip`（裁剪）、`merge-mp4`/`merge-mp4-start`（MP4 合并）、`outline`（大纲）、`subtitle`（字幕）、`playback merge`（合并回放）等子命令，可扩展「直播后剪辑高光片段分发私域」场景，本场景未覆盖这些写入类子命令。
- **覆盖剩余复购/资产命令**：`playback`/`record` 已覆盖，复购与频道资产域剩余 `document`（文档/课件关联）可在后续场景补全。
