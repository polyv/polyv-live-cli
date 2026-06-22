# 场景 15：直播运营驾驶舱（实时监控大盘 + 账号全局配置治理）

## 1. 场景名称

直播运营驾驶舱 —— 多频道实时监控大盘（终端仪表盘就绪检查 + 实时推流监测 + 监控配置可移植）与账号级全局配置治理（账号级观看鉴权基线 + 账号级观看页默认设置基线）。

## 2. 覆盖命令

| 一级命令 | 覆盖状态 | 说明 |
|---|---|---|
| `monitor`（监控驾驶舱） | ✅ 已执行成功 | `status`（驾驶舱状态 Stopped）、`config`（监控配置表）、`layouts`（3 种布局）、`themes`（2 种主题）、`test`（兼容性测试 PASS）、`export`/`import`（监控配置导出/导入可移植）真实执行成功；`stream-info-list`/`tencent-stream-info-list` 在专用测试频道 7983952 真实执行但因频道未开播返回「未检测到直播推流 / channel status not live」，已执行失败并记录（属「面向活跃直播态」实时监测家族） |
| `global`（账号全局设置） | ✅ 已执行成功 | `auth get` 返回账号级观看鉴权基线（custom + phone 两套 authType、whiteListEntryText=白名单验证入口、privacyParam 隐私声明）、`page-setting get` 返回账号级观看页默认设置基线（20 个字段：watchLayout=video、mobileWatchEnabled=Y、barrageEnabled=Y、pvShowEnabled=Y 等）真实执行成功；`auth update`/`page-setting update` 经参数探测确认存在（`--settings <json>`/`--config <json>`），因属账号级全量写入、爆炸半径覆盖本账号所有频道，按风险规则未执行写入，已记录 |

> 同时复用：`account`（写入前预检）、`channel`（新建并验证专用测试频道 7983952）。

## 3. 专用测试频道

- **频道 ID**：`7983952`
- **频道名称**：`GNHF-电商场景-15-monitor-global-dashboard-202606230200`
- **创建命令**：`npx --yes polyv-live-cli@rc channel create -n "GNHF-电商场景-15-monitor-global-dashboard-202606230200" -o json`
  - 说明：当前 rc（1.2.31-rc.0）的 `channel create` 仅 `--name` 必填；`--category` 为 unknown option（与早期文档/旧 rc 的 `--scene alone --category alone` 写法不同），仅传 `--name` 时默认 `scene=topclass`、`template=ppt`。
- **账号环境**：`nicksu`（App ID `h2wazzobbq`，User ID `475b6884a7`，production），默认账号
- **场景/模板**：`topclass` / `ppt`（`--name` 默认产物）
- **watchStatus**：`waiting`（新建未开播）—— `global` 为账号级命令不依赖频道；`monitor` 的实时推流监测子命令需直播态，未开播频道用于验证「无推流」基线响应
- **创建结果**：成功，`channelId=7983952`，`status=waiting`，`created=6/23/2026, 02:00:17`（`createdAccountId=475b6884a7`、`createdAccountEmail=nicksu@polyv.net`，经 `channel get` 复核）
- **频道已保留，未执行删除**（见第 13 节保留资产说明）。

> 附：参数探测阶段另创建了一个探测频道 `7983949`（`GNHF-probe-do-not-use`，`--name` 单参默认产物，scene=topclass），按本轮不删除规则一并保留（见第 13 节）。

## 4. 行业背景

电商直播进入规模化运营后，单账号下往往同时跑多个直播间（主推直播间 + 引流直播间 + 分销转播间），运营负责人需要两类「驾驶舱」能力：

1. **实时监控驾驶舱**：在大屏/终端上一屏看全所有在播频道的实时推流质量（码率、帧率、断流）、在线人数、互动热度，开播前先做仪表盘「就绪检查」（终端尺寸、配色、内存、兼容性），并把这套监控配置导出成文件分发给场控团队统一使用。这是「开播 / 数据复盘」阶段的指挥中枢。
2. **账号级全局配置治理**：在动任何单频道配置之前，先盘点账号级的「全局观看鉴权基线」（哪些 authType 默认开启、白名单入口文案、隐私声明）与「全局观看页默认设置基线」（默认布局、弹幕开关、移动端观看、预约、PV 展示等）—— 这些账号级默认值会被新建频道继承，是所有频道配置的「源头」，属「治理」阶段。

这两类能力分别由 `monitor`（实时监控驾驶舱）与 `global`（账号全局设置）两个命令族管理。`global` 为账号级（影响本账号所有频道），`monitor` 的状态/配置类命令为终端本地态、实时推流监测类为频道级。

## 5. 业务目标与核心 KPI

- **业务目标**：开播前完成「驾驶舱可看、全局基线可查」的运营就绪；直播中通过实时推流监测保障画质与可用性。
- **核心 KPI**：
  - 监控驾驶舱就绪检查通过率（`monitor test` 全绿）
  - 实时推流监测覆盖率（在播频道均能被 `stream-info-list` 采到推流指标）
  - 监控配置可移植性（`export`/`import` 文件可在团队间复用）
  - 账号级全局基线可查性（`global auth get` / `global page-setting get` 返回结构化配置）

## 6. 适用角色

- 直播运营负责人/大屏场控：用 `monitor` 搭建实时监控驾驶舱、分发监控配置。
- 平台/账号管理员：用 `global` 盘点与治理账号级观看鉴权与观看页默认基线。
- SRE/技术保障：开播中根据 `stream-info-list` 实时推流指标定位画质/断流问题。

## 7. 前置条件

- 已配置默认账号（`nicksu`，production 环境）。
- 已新建专用测试频道 `7983952`（未开播即可用于 `global` 查询与 `monitor` 状态/配置类命令；实时推流监测需直播态）。
- `monitor` 的状态/配置/兼容性类命令为终端本地计算，不消耗直播 API 配额；`monitor stream-info-list`/`tencent-stream-info-list` 为 V4 实时推流 API，需频道处于直播推流态。
- `global` 全部为账号级命令，`get` 为只读、`update` 为账号级全量写入（爆炸半径覆盖本账号所有频道，本轮按风险规则不执行写入）。

## 8. polyv-live-cli-rc 能力映射

| 业务动作 | 一级命令 | 子命令 | 作用域 |
|---|---|---|---|
| 查驾驶舱当前状态 | `monitor` | `status` | 终端本地 |
| 查监控配置 | `monitor` | `config` | 终端本地 |
| 列可用布局/主题 | `monitor` | `layouts` / `themes` | 终端本地 |
| 仪表盘兼容性自检 | `monitor` | `test` | 终端本地 |
| 导出/导入监控配置 | `monitor` | `export <filepath>` / `import <filepath>` | 终端本地 |
| 实时推流监测（V4） | `monitor` | `stream-info-list --channel-id <id>` | 频道级（需直播态） |
| 腾讯云实时推流监测 | `monitor` | `tencent-stream-info-list --channel-id <id>` | 频道级（需直播态） |
| 查账号级观看鉴权基线 | `global` | `auth get` | 账号级 |
| 查账号级观看页默认设置 | `global` | `page-setting get` | 账号级 |
| 改账号级观看鉴权/观看页 | `global` | `auth update --settings <json>` / `page-setting update --config <json>` | 账号级（本轮未执行） |

## 9. 实施步骤

1. **写入前预检**：`account current` / `account list` 确认默认账号 `nicksu`。
2. **建专用测试频道**：`channel create -n "..."` 建频道 7983952，`channel get` 复核。
3. **驾驶舱就绪检查**：`monitor test` 自检终端兼容性；`monitor layouts`/`themes` 盘点可用外观；`monitor status`/`config` 确认驾驶舱当前态与配置。
4. **监控配置可移植演练**：`monitor export` 导出配置文件 → `monitor import` 导回，验证团队分发链路。
5. **实时推流监测**：`monitor stream-info-list --channel-id 7983952`（V4）/ `tencent-stream-info-list`（腾讯云）在测试频道上执行，记录「未开播」基线响应。
6. **账号全局基线盘点**：`global auth get` 查账号级鉴权基线、`global page-setting get` 查账号级观看页默认设置，记录作为所有频道配置的源头默认值。
7. **收尾**：复核测试频道仍在、未被删除；`global update` 类账号级写入按风险规则不执行。

## 10. 命令执行台账

> 执行时间：2026-06-23 凌晨（账号 `nicksu`，production）。敏感值已脱敏。

| # | 时间 | 一级命令 / 子命令 | 实际执行命令（脱敏） | 频道/对象 ID | 结果 | 关键输出摘要 |
|---|---|---|---|---|---|---|
| 1 | 02:00 前 | `account current` | `npx ... account current` | — | ✅ 成功 | 默认账号 `nicksu`（App ID `h2wazzobbq`，User ID `475b6884a7`） |
| 2 | 02:00 前 | `account list` | `npx ... account list` | — | ✅ 成功 | 共 6 个账号，`nicksu` 为 production 默认 |
| 3 | 01:59 | `channel create`（探测） | `channel create -n "GNHF-probe-do-not-use"` | 7983949 | ✅ 成功 | 探测 `--name` 单参默认产物，scene=topclass/template=ppt，status=waiting；**按不删除规则保留** |
| 4 | 02:00 | `channel create`（场景） | `channel create -n "GNHF-电商场景-15-monitor-global-dashboard-202606230200" -o json` | 7983952 | ✅ 成功 | channelId=7983952，scene=topclass，status=waiting，created=6/23/2026 02:00:17 |
| 5 | 02:00 | `channel get`（复核） | `channel get -c 7983952 -o json` | 7983952 | ✅ 成功 | 命中；createdAccountId=475b6884a7，createdAccountEmail=nicksu@polyv.net，whiteListEntryText=白名单验证入口 |
| 6 | 02:01 | `monitor layouts` | `monitor layouts` | — | ✅ 成功 | 3 布局：default(120x30,4 组件)/compact(80x24,2)/single(60x20,1) |
| 7 | 02:01 | `monitor themes` | `monitor themes` | — | ✅ 成功 | 2 主题：default(Blue/White/Black)/dark(Cyan/White/Black) |
| 8 | 02:01 | `monitor test` | `monitor test` | — | ✅ 成功 | Compatibility Test Results: PASS（Terminal Size 120x30、24-bit colors、blessed 兼容、内存 97MB/100MB 全绿） |
| 9 | 02:01 | `monitor status` | `monitor status -o json` | — | ✅ 成功 | Status=Stopped，Layout=default，Theme=default，Refresh=5000ms，Terminal=120x30，ColorDepth=24-bit，Platform=darwin |
| 10 | 02:01 | `monitor config` | `monitor config` | — | ✅ 成功 | Refresh=5000ms，Layout=default，Theme=default，MinTerminal=80x24，ColorSupport/Mouse/Unicode=Yes |
| 11 | 02:02 | `monitor stream-info-list` | `monitor stream-info-list --channel-id 7983952` | 7983952 | ❌ 失败 | `Unexpected error: 未检测到直播推流`——频道未开播无实时推流，属「面向活跃直播态」家族（详见 12.1） |
| 12 | 02:02 | `monitor tencent-stream-info-list` | `monitor tencent-stream-info-list --channel-id 7983952` | 7983952 | ❌ 失败 | `Unexpected error: channel status not live`——同属需直播态的实时推流监测（详见 12.1） |
| 13 | 02:02 | `monitor export` | `monitor export /tmp/gnhf15-mon.json` | — | ✅ 成功 | 导出 JSON：version=1.0.0、refreshInterval=5000、layout/theme=default、performance(maxMemory 104857600/maxCpu 5)、components(stream-metrics 等) |
| 14 | 02:02 | `monitor import` | `monitor import /tmp/gnhf15-mon.json` | — | ✅ 成功 | `Configuration imported from /tmp/gnhf15-mon.json`——监控配置可在团队间分发复用 |
| 15 | 02:03 | `global auth get` | `global auth get -o json` | 账号级 | ✅ 成功 | 返回 2 套 authType：`custom`（authEnabled=Y，customKey=custom_auth_key，customUri=https://www.example.com/auth）+ `phone`（authEnabled=Y，authTips=请输入手机号码进行验证，whiteListEntryText=白名单验证入口，privacyParam 含隐私声明内容） |
| 16 | 02:03 | `global page-setting get` | `global page-setting get -o json` | 账号级 | ✅ 成功 | 返回 20 字段：watchLayout=video、watchLangType=zh_CN、mobileWatchEnabled=Y、mobileAudioEnabled=Y、bookingEnabled=Y、barrageEnabled=Y、barrageSpeed=200、autoPlayEnabled=Y、showCountdownEnabled=Y、pvShowEnabled=Y、recordingProtectEnabled=N、closePreviewEnabled=N 等 |
| 17 | 02:03 | `global auth update`（仅探测参数，未写入） | `global auth update`（无参） | 账号级 | ⏸ 未执行写入 | 探测得必填 `--settings <json>`；属账号级全量写入，按风险规则不执行（详见 12.2） |
| 18 | 02:03 | `global page-setting update`（仅探测参数，未写入） | `global page-setting update`（无参） | 账号级 | ⏸ 未执行写入 | 探测得必填 `--config <json>`；同上不执行 |

## 11. 实际使用的 CLI 命令与真实参数

```bash
# 0) 写入前预检
npx --yes polyv-live-cli@rc account current
npx --yes polyv-live-cli@rc account list

# 1) 建专用测试频道（仅 --name 必填，--category 在本 rc 为 unknown option）
npx --yes polyv-live-cli@rc channel create \
  -n "GNHF-电商场景-15-monitor-global-dashboard-202606230200" -o json
# -> channelId 7983952

# 2) 驾驶舱就绪检查（终端本地态，不消耗直播 API）
npx --yes polyv-live-cli@rc monitor test            # 兼容性自检
npx --yes polyv-live-cli@rc monitor layouts         # 可用布局
npx --yes polyv-live-cli@rc monitor themes          # 可用主题
npx --yes polyv-live-cli@rc monitor status -o json  # 驾驶舱当前状态
npx --yes polyv-live-cli@rc monitor config          # 监控配置

# 3) 监控配置可移植（导出/导入，团队分发）
npx --yes polyv-live-cli@rc monitor export /tmp/gnhf15-mon.json
npx --yes polyv-live-cli@rc monitor import /tmp/gnhf15-mon.json

# 4) 实时推流监测（需频道直播态；注意 monitor 的 -c 是 --config，频道要用 --channel-id）
npx --yes polyv-live-cli@rc monitor stream-info-list --channel-id 7983952
npx --yes polyv-live-cli@rc monitor tencent-stream-info-list --channel-id 7983952

# 5) 账号级全局基线盘点（只读）
npx --yes polyv-live-cli@rc global auth get -o json
npx --yes polyv-live-cli@rc global page-setting get -o json
```

> 写入类（`global auth update --settings <json>` / `global page-setting update --config <json>`）本轮**未执行**，理由见第 12.2 节。

## 12. 执行或验证结果

### 12.1 `monitor stream-info-list` / `tencent-stream-info-list` 已执行失败（属「面向活跃直播态」家族）

两条实时推流监测命令在专用测试频道 7983952（未开播）上真实执行：

- `monitor stream-info-list --channel-id 7983952` → `Unexpected error: 未检测到直播推流`
- `monitor tencent-stream-info-list --channel-id 7983952` → `Unexpected error: channel status not live`

排查：与场景 06 `checkin start`、场景 12 `interaction reward` / `chat role user-list`、场景 13 `stream capture` 同属「面向活跃直播态」实时家族——实时推流监测依赖频道正在推流（V4 实时流接口 / 腾讯云流接口），未开播频道无推流即无数据，属预期。要让这两条返回真实推流指标（码率、帧率、断流等），需先用 OBS 按 `stream get-key` 取得的 RTMP 凭证推流，使频道进入 live 态后再调用。

下一步建议：未来如做「直播中实时监控」专项，可在已开播频道上补跑 `stream-info-list` 采集真实推流指标；本轮 `monitor` 族因 `status`/`config`/`layouts`/`themes`/`test`/`export`/`import` 七条命令真实执行成功而计入已覆盖（与场景 06/07/10/11/12/13 只读命令计入覆盖的先例一致）。

### 12.2 `global auth update` / `global page-setting update` 未执行写入（账号级全量写入爆炸半径）

参数探测（无参运行，Commander 报必填项，**不产生写入**）确认：

- `global auth update` 必填 `--settings <json>`（账号级观看鉴权全量 JSON）
- `global page-setting update` 必填 `--config <json>`（账号级观看页默认设置全量 JSON）

不执行写入的理由：`global` 为**账号级**命令，`update` 是对账号级全量配置的写入，**爆炸半径覆盖本账号（`nicksu`）所有频道**——包括此前各场景真实创建并保留的 14 个测试频道与账号下既有生产频道。这与「所有真实写入必须使用本轮新建的专用测试频道/测试对象」「不要修改用户长期使用的频道」的风险规则冲突：账号级写入不存在「频道级测试对象」隔离面，任何字段翻转都会即时影响全账号。

参照场景 11 `transmit create`/`associate`（账号级转播权益门控）、场景 07 `session create`（账号级场次权益门控）的处理先例：账号级/权益门控类写入**不计入本轮覆盖**，仅以只读 `get` 命令覆盖该族。运营如需修改账号级全局基线，应在保利威后台或明确授权后逐字段小步修改并即时用 `global auth get`/`global page-setting get` 复核（注意该类全量 update 易出现「回显成功但未持久化」的成功假象，须以 `get` 复查为准）。

### 12.3 `monitor` 配置侧 vs 观众侧区分

- `monitor` 全族为**运营/技术侧**能力（终端驾驶舱 + 实时推流指标），不经观众侧验证；`monitor status`/`config` 为终端本地态，`stream-info-list` 为频道实时推流态，均不涉及观众可见效果。
- `global auth get`/`page-setting get` 返回的是**账号级配置侧基线**（配置已落库可查），仅说明「账号级默认配置已满足条件」；观众侧实际可见效果（鉴权弹窗、观看页布局、弹幕等）需打开具体频道观看页验证，本轮未做观众侧验证。

### 12.4 已验证事实

- `global auth get` 返回的账号级 `phone` authType（authEnabled=Y、whiteListEntryText=白名单验证入口）与场景 05/09 新建频道 `channel get` 的 `authSettings` rank2 默认值一致——印证「新建频道的观看条件默认值继承自账号级 `global auth` 基线」，`global auth get` 是频道级观看条件的源头。
- `global page-setting get` 的账号级默认（watchLayout=video、barrageEnabled=Y、mobileWatchEnabled=Y、pvShowEnabled=Y）与场景 09 `web` 装修前的频道默认观看页表现一致——印证「账号级观看页默认设置是各频道观看页装修的起点」。
- `monitor export`/`import` 闭环验证监控配置可序列化为 JSON 文件并在终端间复用，是团队分发驾驶舱配置的可靠原语。

## 13. 风险点与回滚/清理方式

- **风险①：`global auth update` / `global page-setting update` 账号级全量写入**——爆炸半径覆盖本账号所有频道，误改会影响全账号观看鉴权/观看页默认。**本轮未执行**；如需修改应在后台或明确授权后小步进行并即时 `get` 复核。
- **风险②：`monitor` 实时推流监测需直播态**——`stream-info-list`/`tencent-stream-info-list` 在未开播频道返回错误属预期，勿误判为配置问题。
- **风险③：`monitor` 顶层 `-c` 是 `--config`（配置文件路径）而非频道**——实时推流监测的频道须用长参 `--channel-id`，混用 `-c` 会被当作配置文件路径导致「required option --channel-id not specified」。
- **回滚/清理**：
  - 本轮未对账号级 `global` 做任何写入，无需回滚。
  - `monitor export` 仅在本地 `/tmp` 产生一个 JSON 文件（`/tmp/gnhf15-mon.json`），可随时删除，不影响任何线上配置。
  - 测试频道**未删除**（见第 14 节）；如需人工清理可执行（**未执行**）：
    - `npx --yes polyv-live-cli@rc channel delete -c 7983952`（场景频道）
    - `npx --yes polyv-live-cli@rc channel delete -c 7983949`（探测频道）

## 14. 保留资产说明

本轮保留以下资产，**均未删除**，供人工查看配置：

| 资产 | ID / 标识 | 说明 |
|---|---|---|
| 场景测试频道 | `7983952` | `GNHF-电商场景-15-monitor-global-dashboard-202606230200`，scene=topclass，未开播，用于 `global` 查询与 `monitor` 实时推流监测基线验证 |
| 探测频道 | `7983949` | `GNHF-probe-do-not-use`，参数探测阶段 `--name` 单参默认产物，按本轮不删除规则一并保留 |
| 监控配置文件 | `/tmp/gnhf15-mon.json` | `monitor export` 产物（本地临时文件，可随时删除） |

> `global` 命令为账号级只读查询，未产生任何账号级写入；`monitor` 状态/配置/兼容性类命令为终端本地计算，未变更任何线上配置。

## 15. 可复用模板

### 15.1 开播前驾驶舱就绪检查模板

```bash
# 1) 终端兼容性自检（必须全绿才能跑驾驶舱）
npx --yes polyv-live-cli@rc monitor test
# 2) 选定布局/主题
npx --yes polyv-live-cli@rc monitor layouts   # default/compact/single
npx --yes polyv-live-cli@rc monitor themes    # default/dark
# 3) 确认驾驶舱状态与配置
npx --yes polyv-live-cli@rc monitor status
npx --yes polyv-live-cli@rc monitor config
# 4) 导出监控配置分发给场控团队
npx --yes polyv-live-cli@rc monitor export ~/live-ops-dashboard.json
# 团队成员：npx ... monitor import ~/live-ops-dashboard.json
```

### 15.2 直播中实时推流监测模板（需频道已开播）

```bash
# 取推流凭证并用 OBS 推流使频道进入 live 态后：
npx --yes polyv-live-cli@rc monitor stream-info-list --channel-id <频道ID>
npx --yes polyv-live-cli@rc monitor tencent-stream-info-list --channel-id <频道ID>
```

### 15.3 账号级全局基线盘点模板（只读）

```bash
# 账号级观看鉴权基线（custom/phone/code 等 authType 默认开启情况、白名单入口、隐私声明）
npx --yes polyv-live-cli@rc global auth get -o json
# 账号级观看页默认设置基线（布局/弹幕/移动端/预约/PV 等 20 字段）
npx --yes polyv-live-cli@rc global page-setting get -o json
```

## 16. 后续可扩展方向

- **直播中实时监控专项**：在已开播频道上补跑 `monitor stream-info-list`/`tencent-stream-info-list`，采集真实推流指标（码率、帧率、断流），完善「直播中」阶段覆盖。
- **`global update` 账号级治理**：在明确授权 + 后台双重复核的前提下，演练 `global auth update --settings` / `global page-setting update --config` 的可逆字段翻转（如 `pictureInPictureEnabled` N→Y→N）并经 `get` 前后对比验证持久化，补齐 `global` 写入侧覆盖（当前因爆炸半径未执行）。
- **`monitor` 驾驶舱实跑**：在足够大的终端（≥120x30）上实跑交互式 `monitor`（带 `--layout`/`--theme`/`--refresh`）观察多面板实时渲染（本轮只验证了状态/配置/兼容性等非交互子命令）。
- **关联族联动**：`global auth` 基线 ↔ 场景 05 `watch-condition`/`whitelist` 频道级鉴权、`global page-setting` 基线 ↔ 场景 09 `web`/`player` 频道级装修，可串成「账号级默认 → 频道级覆盖」的完整配置继承链文档。
