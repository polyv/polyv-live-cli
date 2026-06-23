# 场景 09：直播间品牌化装修 — 观看页品牌物料 + 播放器水印 / 防录屏

> 业务阶段：**预热 / 治理**（品牌曝光、开播前物料落地）
> 覆盖一级命令：`web`、`player`、`channel`、`account`
> 真实执行状态：**已执行成功**（`web`、`player` 两族均有业务命令在真实账号 + 真实测试频道上真实执行成功；其中 `player config update` 的 Y/N 开关类参数、`player anti-record update` 真实执行失败，作为问题发现记录）

---

## 1. 场景名称

直播间品牌化装修 —— 把一场电商直播的**观看页**与**播放器**两层「门面」，统一装修成品牌一致、可被微信生态承接的物料形态，覆盖开播前必须落地的品牌曝光动作。

电商直播的观看页是观众进入直播间的第一屏，播放器是观众停留时间最长的区域。但很多团队的观看页停留在默认 PolyV 皮肤：默认开屏图、默认微信分享文案「正在直播，非常不错哦」、播放器无品牌水印、无防录屏。本场景用 `polyv-live-cli-rc` 的 `web` 与 `player` 两族命令，串成一个可照着执行的品牌化装修闭环：

- **观看页侧（web）**：开屏图开关、开播倒计时 / 预约、主播名、直播间介绍菜单、微信分享标题与描述，建立「**观众第一眼看到的就是品牌**」的物料底盘。
- **播放器侧（player）**：品牌水印（位置 / 透明度）、暖场封面开关、播放器 Logo、防录屏（跑马灯 / 水印）、基础访问量，建立「**播放器即品牌广告位**」的播放体验。

> ⚠️ 本场景发现两个**真实执行问题**（均不影响覆盖结论）：
> 1. `player config update` 的 Y/N 开关类参数（`--watermark-enabled`、`--warmup-enabled`）返回 `success:true` 并把字段列入 `updatedFields`，但 `player config get` 复查显示这些开关**并未真正持久化**（`watermarkEnabled` 始终为 `null`，`--warmup-enabled Y` 后仍为 `N`）。而同一命令的**标量参数**（`--watermark-url`/`--watermark-position`/`--watermark-opacity`/`--base-pv`）则正常持久化。播放器水印 / 暖场的真正开关应使用独立子命令 `player warmup switch-update`（已验证可持久化）与后台水印开关。
> 2. `player anti-record update` 真实执行失败：CLI 的 `--model-type` 参数**未被映射到后端 `modelType` 字段**，无论传 `fixed`/`nickname`/`diyurl` 均报 `param should not be empty: modelType`；且 `--font-size` 在 help 中未标 required 但 CLI 强制必填。
>
> 两个问题均不影响本场景命令覆盖结论：`player` 族的 `config get`（基线 + 多次复查）、`config update`（标量参数真实持久化）、`warmup switch-update`（已验证持久化）、`logo-update`、`watch-feedback-list`、`anti-record get`（真实执行，未开时返回错误）均真实执行；`web` 族的 `info likes-get`/`splash-get`/`splash-set`（前后对比验证持久化）/`countdown-get`/`countdown-set`（前后对比验证持久化）/`publisher-set`（经 `channel get` 复查持久化）/`menu list`/`menu intro-set`（经 `menu list` 复查持久化）/`share get`/`share update`（前后对比验证持久化）全部真实执行成功。`web`/`player` 两族均已真实执行覆盖。详见第 12 节问题记录。

## 2. 覆盖命令

| 一级命令 | 子命令 | 执行状态 | 说明 |
|---|---|---|---|
| `account` | `account current`、`account list` | 已执行成功 | 写入前账号预检（`nicksu`，production，User ID `475b6884a7`） |
| `channel` | `channel create`、`channel get` | 已执行成功 | 创建专用测试频道 `7983934` 并验证频道存在与 watchStatus；并用于**交叉验证 `publisher-set` 是否持久化** |
| `player` | `player config get`（基线 + 3 次复查） | 已执行成功 | 播放器水印 / 暖场 / 基础访问量配置查询；建立基线并复查标量参数持久化 |
| `player` | `player config update`（`--watermark-*` 标量） | 已执行成功 | 水印 URL/位置/透明度**真实持久化**（get 复查 url/position=br/opacity=0.8 全部命中）；Y/N 开关未持久化（见 12.1） |
| `player` | `player config update`（`--base-pv 1000`） | 已执行成功 | 基础访问量真实持久化，且经 `web info likes-get` 的 `viewers=1000` **观众侧交叉验证** |
| `player` | `player config update`（`--warmup-enabled Y`） | 已执行失败（成功假象） | 返回 success + 列入 updatedFields，但 get 复查 warmupEnabled 仍为 N。见 12.1 |
| `player` | `player warmup switch-update`（`--warm-up-enabled Y`） | 已执行成功 | 暖场开关**真实持久化**（get 复查 warmupEnabled 由 N→Y）。这是暖场开关的正确入口 |
| `player` | `player logo-update`（`--logo-image`/`--logo-position`/`--logo-opacity`） | 已执行成功 | 播放器 Logo 更新返回 success（图片由保利威服务端抓取并 re-host 到 `liveimages.videocc.net`） |
| `player` | `player anti-record get` | 已执行成功 | 防录屏配置查询；未开启时返回 `Anti-screen recording is not turned on`（读出错误而非空数据） |
| `player` | `player anti-record update`（`--anti-record-type marquee`） | 已执行失败 | CLI `--model-type` 未映射到后端 `modelType`，报 `param should not be empty: modelType`。见 12.2 |
| `player` | `player watch-feedback-list` | 已执行成功 | 观看反馈记录查询（totalItems=0，结构完整分页 JSON） |
| `web` | `web info likes-get`（`--channel-ids`） | 已执行成功 | 点赞 / 观看数查询（likes=0、viewers=1000）；并交叉验证 player `base-pv` |
| `web` | `web info splash-get` | 已执行成功 | 开屏图配置查询（基线 splashEnabled=Y） |
| `web` | `web info splash-set`（`--splash-enabled N`/`Y`） | 已执行成功 | 开屏开关 Y→N→Y 前后对比**验证持久化** |
| `web` | `web info countdown-get` | 已执行成功 | 倒计时 / 预约配置查询（基线 bookingEnabled=Y、countEnabled=N） |
| `web` | `web info countdown-set`（`--booking-enabled`/`--start-time`） | 已执行成功 | 倒计时真实持久化（get 复查 countEnabled N→Y、startTime 写入 `2026-06-23 20:00:00`） |
| `web` | `web info publisher-set`（`--publisher`） | 已执行成功 | 主播名「GNHF09品牌主播小妮」经 `channel get` 的 `publisher` 字段**复查持久化** |
| `web` | `web menu list` | 已执行成功 | 观看页菜单列表（默认 desc 直播介绍 / chat 聊天 / quiz 提问 三菜单） |
| `web` | `web menu intro-set`（`--content`） | 已执行成功 | 直播介绍菜单文案真实持久化，经 `web menu list` 复查 menuType=desc 内容已写入 |
| `web` | `web share get` | 已执行成功 | 微信分享配置查询（默认标题=频道名、默认描述） |
| `web` | `web share update`（`--weixin-share-title`/`--weixin-share-desc`） | 已执行成功 | 微信分享标题 / 描述真实持久化，get 复查前后对比验证 |

> 说明：本场景所有「已执行成功」命令均使用真实账号（`nicksu`）与真实测试频道（`7983934`）真实执行过，下文「命令执行台账」逐条记录。仅做 `--help` 校验、未真实执行的命令不计入覆盖。`player config update` 的 Y/N 开关与 `player anti-record update` 真实执行失败，按「已执行失败」记录于第 12 节。`web`/`player` 两族均因各自多条业务命令真实执行成功（且 splash-set / countdown-set / share update / menu intro-set / publisher-set / player 标量水印 / warmup switch-update 均经只读复查确认持久化）而计入「已覆盖」。

## 3. 专用测试频道

| 项 | 值 |
|---|---|
| 频道名称 | `GNHF-电商场景-09-brand-watchpage-player-202606230032` |
| 频道 ID | `7983934` |
| 账号环境 | `nicksu`（App ID `h2wazzobbq`，User ID `475b6884a7`，production） |
| 场景类型 | `alone`（活动营销） |
| 模板 | `alone`（纯视频-横屏） |
| 创建结果 | 成功（status=waiting / watchStatus=unStart / 未开始） |
| 创建时间 | 2026-06-23 00:32:49 CST |
| 是否删除 | **否，频道已保留**，供人工查看观看页 / 播放器品牌物料配置 |

> 创建命令：`npx --yes polyv-live-cli@rc channel create -n "GNHF-电商场景-09-brand-watchpage-player-202606230032" -d "..." --scene alone --template alone -o json`，返回 `channelId=7983934`。`channel get` 复核 name 一致、scene/template=alone、watchStatus=unStart。
>
> **频道已保留，未执行删除。** 可选的人工清理命令（**未执行**）：
> ```bash
> # 仅作清理参考，本轮未执行；频道保留用于人工查看品牌物料落库
> npx --yes polyv-live-cli@rc channel delete -c 7983934 --force   # 需先校验 channel delete --help 是否存在该子命令
> ```

## 4. 行业背景

电商直播进入「品牌化 + 私域化」阶段后，观看页与播放器不再是 PolyV 默认皮肤就够用：

- **微信生态承接**：观众多从公众号 / 社群 / 朋友圈点进直播间，分享卡片的标题与描述直接决定点击率。默认分享文案「正在直播，非常不错哦，快来看看吧！」毫无品牌信息与促销钩子，转化损失明显。
- **品牌曝光一致性**：连锁品牌 / 品牌方要求所有直播间露出统一 Logo、统一水印、统一主播名，避免代播方擅自改皮。
- **开播前预热物料**：新品首发场需要开播倒计时 + 预约入口 + 开屏主视觉，让预约观众在开播前就锁住心智。
- **内容版权与防搬运**：付费课程直播、品牌首发直播需要防录屏跑马灯，防止竞品录屏搬运。
- **基础数据初始化**：新频道真实观看为 0 会劝退路人观众，需要基础访问量（basePv）做心理锚定。

保利威 `web`（观看页）与 `player`（播放器）两族命令，正是覆盖上述需求的配置入口。

## 5. 业务目标与核心 KPI

| 目标 | 衡量 KPI | 对应命令 |
|---|---|---|
| 微信分享卡片品牌化 | 分享标题 / 描述自定义率 100% | `web share update` |
| 开播倒计时与预约上线 | countEnabled=Y、startTime 落地 | `web info countdown-set` |
| 主播名与介绍文案落地 | publisher、直播介绍菜单内容非空 | `web info publisher-set`、`web menu intro-set` |
| 播放器品牌水印上线 | 水印 URL/位置/透明度落库 | `player config update`（标量参数） |
| 暖场封面上线 | warmupEnabled=Y | `player warmup switch-update` |
| 防录屏跑马灯上线 | anti-record 开启 | `player anti-record update`（**当前 CLI 路径失败，需后台开通**） |
| 基础访问量锚定 | basePv 落地并在观看侧体现 | `player config update --base-pv` |

## 6. 适用角色

- **直播运营 / 主播助理**：开播前按本手册逐条落地观看页与播放器品牌物料。
- **品牌 / 市场负责人**：核对所有直播间物料是否品牌一致。
- **电商私域操盘手**：配置微信分享钩子文案、倒计时预约，承接私域流量。

## 7. 前置条件

1. 已用 `polyv-live-cli-rc` 配置可用的 PolyV 账号（本场景用 `nicksu`，production）。
2. 已创建本场景专用测试频道 `7983934`（alone / alone）。
3. 品牌物料图片已上传到**保利威白名单图片域名**（实测 `placehold.co` 等非保利威域名会被拒「非法图片域名」；`s2.videocc.net` / `liveimages.videocc.net` 等保利威自有 CDN 域名可用，且服务端会 re-host）。
4. 防录屏功能需账号 / 频道侧已开通该权益（当前 CLI `anti-record update` 因参数映射问题无法开启，见 12.2）。

## 8. polyv-live-cli-rc 能力映射

| 业务动作 | 命令族 | 关键命令 |
|---|---|---|
| 查询 / 配置播放器水印、暖场、基础访问量 | `player` | `player config get`、`player config update` |
| 暖场开关（独立子命令，可靠入口） | `player` | `player warmup switch-update` |
| 播放器 Logo | `player` | `player logo-update` |
| 防录屏跑马灯 / 水印 | `player` | `player anti-record get`、`player anti-record update` |
| 观看反馈记录 | `player` | `player watch-feedback-list` |
| 开屏图开关 | `web` | `web info splash-get`、`web info splash-set` |
| 开播倒计时 / 预约 | `web` | `web info countdown-get`、`web info countdown-set` |
| 主播名 | `web` | `web info publisher-set` |
| 点赞 / 观看数 | `web` | `web info likes-get` |
| 直播间介绍菜单 | `web` | `web menu list`、`web menu intro-set` |
| 微信分享标题 / 描述 | `web` | `web share get`、`web share update` |

## 9. 实施步骤

1. **账号预检**：`account current` / `account list` 确认 `nicksu`（production）。
2. **创建专用测试频道**：`channel create` 建 `7983934`，`channel get` 复核。
3. **播放器基线**：`player config get` 记录水印 / 暖场 / basePv 初始值。
4. **播放器水印上线**：`player config update --watermark-enabled Y --watermark-url <白名单域名图> --watermark-position br --watermark-opacity 0.8`，`player config get` 复查标量参数。
5. **基础访问量锚定**：`player config update --base-pv 1000`，并用 `web info likes-get` 交叉验证 viewers=1000。
6. **暖场封面上线**：`player warmup switch-update --warm-up-enabled Y`（**不要用** `player config update --warmup-enabled`，那是 no-op），`player config get` 复查 warmupEnabled=Y。
7. **播放器 Logo**：`player logo-update --logo-image <白名单域名图> --logo-position br --logo-opacity 0.8`。
8. **防录屏（尝试）**：`player anti-record update ...`（**当前 CLI 失败**，记录问题，需后台开通）。
9. **观看页开屏**：`web info splash-set --splash-enabled Y`，前后 `splash-get` 对比。
10. **开播倒计时**：`web info countdown-set --booking-enabled Y --start-time "2026-06-23 20:00:00"`，前后 `countdown-get` 对比。
11. **主播名**：`web info publisher-set --user-id <uid> --publisher "品牌主播名"`，`channel get` 复查 publisher。
12. **直播介绍**：`web menu intro-set --user-id <uid> --content "促销文案"`，`web menu list` 复查。
13. **微信分享**：`web share update --weixin-share-title "..." --weixin-share-desc "..."`，前后 `share get` 对比。

## 10. 命令执行台账

> 账号：`nicksu`（production）；频道：`7983934`；执行日期：2026-06-23；敏感值（pushSecret 等）已脱敏。

| # | 执行时间 | 一级命令 / 子命令 | 实际执行命令（脱敏） | 频道 / 对象 ID | 结果 | 关键输出摘要 |
|---|---|---|---|---|---|---|
| 1 | 00:30 | `account current` | `npx --yes polyv-live-cli@rc account current` | — | 成功 | 默认账号 `nicksu`，全局配置来源 |
| 2 | 00:30 | `account list` | `npx --yes polyv-live-cli@rc account list` | — | 成功 | 6 个账号，`nicksu` App ID `h2wazzobbq` |
| 3 | 00:32 | `channel create` | `channel create -n "GNHF-电商场景-09-..." -d "..." --scene alone --template alone -o json` | 新建 → `7983934` | 成功 | channelId=7983934、status=waiting、watchStatus=unStart |
| 4 | 00:33 | `channel get` | `channel get -c 7983934 -o json` | 7983934 | 成功 | name 一致、scene=alone、watchStatus=unStart |
| 5 | 00:33 | `player config get`（基线） | `player config get -c 7983934 -o json` | 7983934 | 成功 | watermarkEnabled=null、watermarkUrl=""、warmupEnabled=Y（默认封面）、basePv=0 |
| 6 | 00:34 | `player anti-record get`（基线） | `player anti-record get -c 7983934 -o json` | 7983934 | 成功（读出错误） | `Anti-screen recording is not turned on`（未开时返回错误） |
| 7 | 00:34 | `player watch-feedback-list`（基线） | `player watch-feedback-list -c 7983934 -o json` | 7983934 | 成功 | totalItems=0，分页结构完整 |
| 8 | 00:35 | `player config update`（水印·非白名单域名） | `player config update -c 7983934 --watermark-enabled Y --watermark-url "https://placehold.co/300x100.png" --watermark-position br --watermark-opacity 0.8 -o json` | 7983934 | **失败** | `非法图片域名`（placehold.co 非白名单） |
| 9 | 00:35 | `player config update`（水印·白名单域名） | `player config update -c 7983934 --watermark-enabled Y --watermark-url "https://s2.videocc.net/.../player-cover.png" --watermark-position br --watermark-opacity 0.8 -o json` | 7983934 | 成功 | success=true、updatedFields=[watermarkEnabled,watermarkUrl,watermarkPosition,watermarkOpacity] |
| 10 | 00:36 | `player config get`（复查水印） | `player config get -c 7983934 -o json` | 7983934 | 成功 | watermarkUrl 已写入（服务端 re-host 到 liveimages.videocc.net）、position=br、opacity=0.8；**watermarkEnabled 仍 null**；warmupEnabled 由 Y 翻转为 N（副作用） |
| 11 | 00:36 | `player config update`（basePv + warmup） | `player config update -c 7983934 --base-pv 1000 --warmup-enabled Y -o json` | 7983934 | 成功 | success=true、updatedFields=[warmupEnabled,basePv] |
| 12 | 00:37 | `player config get`（复查 basePv/warmup） | `player config get -c 7983934 -o json` | 7983934 | 成功 | basePv=1000 已持久化；**warmupEnabled 仍 N**（--warmup-enabled Y 未生效） |
| 13 | 00:37 | `player warmup switch-update` | `player warmup switch-update -c 7983934 --warm-up-enabled Y -f -o json` | 7983934 | 成功 | success=true、result=success |
| 14 | 00:37 | `player config get`（复查 warmup） | `player config get -c 7983934 -o json` | 7983934 | 成功 | **warmupEnabled=Y**（switch-update 才是真正暖场开关） |
| 15 | 00:38 | `player logo-update` | `player logo-update -c 7983934 --logo-image "https://s2.videocc.net/.../player-cover.png" --logo-position br --logo-opacity 0.8 -f -o json` | 7983934 | 成功 | success=true、channelId=7983934（图片服务端抓取） |
| 16 | 00:38 | `player anti-record update`（尝试） | `player anti-record update -c 7983934 --anti-record-type marquee --model-type nickname --content "..." --font-size 30 --opacity 60 --font-color "#FFFFFF" --show-mode roll --double-enabled Y -f -o json` | 7983934 | **失败** | `param should not be empty: modelType`（见 12.2） |
| 17 | 00:39 | `web info likes-get` | `web info likes-get --channel-ids 7983934 -o json` | 7983934 | 成功 | likes=0、**viewers=1000**（交叉验证 basePv 已在观看侧体现） |
| 18 | 00:39 | `web info splash-get`（基线） | `web info splash-get -c 7983934 -o json` | 7983934 | 成功 | splashEnabled=Y、splashImg=默认封面 |
| 19 | 00:40 | `web info splash-set`（关） | `web info splash-set -c 7983934 --splash-enabled N -f -o json` | 7983934 | 成功 | success=true |
| 20 | 00:40 | `web info splash-get`（复查 N） | `web info splash-get -c 7983934 -o json` | 7983934 | 成功 | **splashEnabled=N**（已持久化） |
| 21 | 00:40 | `web info splash-set`（恢复 Y） | `web info splash-set -c 7983934 --splash-enabled Y -f -o json` | 7983934 | 成功 | success=true |
| 22 | 00:40 | `web info splash-get`（复查 Y） | `web info splash-get -c 7983934 -o json` | 7983934 | 成功 | splashEnabled=Y（已恢复，前后对比验证持久化） |
| 23 | 00:41 | `web info countdown-get`（基线） | `web info countdown-get -c 7983934 -o json` | 7983934 | 成功 | bookingEnabled=Y、countEnabled=N、startTime=null |
| 24 | 00:41 | `web info countdown-set` | `web info countdown-set -c 7983934 --booking-enabled Y --start-time "2026-06-23 20:00:00" -f -o json` | 7983934 | 成功 | success=true |
| 25 | 00:41 | `web info countdown-get`（复查） | `web info countdown-get -c 7983934 -o json` | 7983934 | 成功 | **countEnabled=Y、startTime="2026-06-23 20:00:00"**（已持久化） |
| 26 | 00:42 | `web info publisher-set` | `web info publisher-set --user-id 475b6884a7 -c 7983934 --publisher "GNHF09品牌主播小妮" -f -o json` | 7983934 | 成功 | success=true、result=7983934 |
| 27 | 00:42 | `channel get`（复查 publisher） | `channel get -c 7983934 -o json` | 7983934 | 成功 | **publisher="GNHF09品牌主播小妮"**（已持久化） |
| 28 | 00:43 | `web menu list`（基线） | `web menu list -c 7983934 -o json` | 7983934 | 成功 | 3 菜单：直播介绍(desc) / 聊天(chat) / 提问(quiz) |
| 29 | 00:43 | `web menu intro-set` | `web menu intro-set --user-id 475b6884a7 -c 7983934 --content "GNHF09 新品首发直播间｜全场满300减50，整点抽免单..." -f -o json` | 7983934 | 成功 | success=true、result=success |
| 30 | 00:43 | `web menu list`（复查 intro） | `web menu list -c 7983934 -o json` | 7983934 | 成功 | menuType=desc「直播介绍」content 已写入文案（已持久化） |
| 31 | 00:44 | `web share get`（基线） | `web share get -c 7983934 -o json` | 7983934 | 成功 | weixinShareTitle=频道名、weixinShareDesc=「正在直播，非常不错哦…」 |
| 32 | 00:44 | `web share update` | `web share update -c 7983934 --weixin-share-title "GNHF09新品首发｜满300减50" --weixin-share-desc "整点抽免单，锁定直播间福利" -f -o json` | 7983934 | 成功 | success=true |
| 33 | 00:44 | `web share get`（复查） | `web share get -c 7983934 -o json` | 7983934 | 成功 | **weixinShareTitle/weixinShareDesc 已更新为自定义文案**（已持久化） |

## 11. 实际使用的 CLI 命令与真实参数

```bash
# 0. 账号预检
npx --yes polyv-live-cli@rc account current
npx --yes polyv-live-cli@rc account list

# 1. 创建专用测试频道
npx --yes polyv-live-cli@rc channel create \
  -n "GNHF-电商场景-09-brand-watchpage-player-202606230032" \
  -d "GNHF电商场景09 直播间品牌化装修 web player 命令真实执行覆盖测试" \
  --scene alone --template alone -o json

# 2. 播放器品牌水印（标量参数真实持久化；图片必须用保利威白名单域名）
npx --yes polyv-live-cli@rc player config update -c 7983934 \
  --watermark-enabled Y \
  --watermark-url "https://s2.videocc.net/watch-theme/spring/v2/assets/common/player-cover.png" \
  --watermark-position br --watermark-opacity 0.8 -o json
npx --yes polyv-live-cli@rc player config get -c 7983934 -o json   # 复查

# 3. 基础访问量锚定（basePv 真实持久化，并在观看侧 viewers 体现）
npx --yes polyv-live-cli@rc player config update -c 7983934 --base-pv 1000 -o json
npx --yes polyv-live-cli@rc web info likes-get --channel-ids 7983934 -o json   # viewers=1000 交叉验证

# 4. 暖场封面（必须用独立子命令 switch-update，config update 的 --warmup-enabled 是 no-op）
npx --yes polyv-live-cli@rc player warmup switch-update -c 7983934 --warm-up-enabled Y -f -o json
npx --yes polyv-live-cli@rc player config get -c 7983934 -o json   # 复查 warmupEnabled=Y

# 5. 播放器 Logo
npx --yes polyv-live-cli@rc player logo-update -c 7983934 \
  --logo-image "https://s2.videocc.net/watch-theme/spring/v2/assets/common/player-cover.png" \
  --logo-position br --logo-opacity 0.8 -f -o json

# 6. 观看页开屏（前后对比验证持久化）
npx --yes polyv-live-cli@rc web info splash-set -c 7983934 --splash-enabled N -f -o json
npx --yes polyv-live-cli@rc web info splash-get -c 7983934 -o json
npx --yes polyv-live-cli@rc web info splash-set -c 7983934 --splash-enabled Y -f -o json

# 7. 开播倒计时 / 预约（前后对比验证持久化）
npx --yes polyv-live-cli@rc web info countdown-set -c 7983934 \
  --booking-enabled Y --start-time "2026-06-23 20:00:00" -f -o json
npx --yes polyv-live-cli@rc web info countdown-get -c 7983934 -o json   # countEnabled=Y、startTime 已写入

# 8. 主播名（经 channel get 复查 publisher 字段）
npx --yes polyv-live-cli@rc web info publisher-set \
  --user-id 475b6884a7 -c 7983934 --publisher "GNHF09品牌主播小妮" -f -o json
npx --yes polyv-live-cli@rc channel get -c 7983934 -o json

# 9. 直播间介绍菜单（经 web menu list 复查）
npx --yes polyv-live-cli@rc web menu intro-set \
  --user-id 475b6884a7 -c 7983934 \
  --content "GNHF09 新品首发直播间｜全场满300减50，整点抽免单，关注主播不错过福利" -f -o json
npx --yes polyv-live-cli@rc web menu list -c 7983934 -o json

# 10. 微信分享标题 / 描述（前后对比验证持久化）
npx --yes polyv-live-cli@rc web share update -c 7983934 \
  --weixin-share-title "GNHF09新品首发｜满300减50" \
  --weixin-share-desc "整点抽免单，锁定直播间福利" -f -o json
npx --yes polyv-live-cli@rc web share get -c 7983934 -o json
```

## 12. 执行或验证结果

### 12.1 问题记录：`player config update` 的 Y/N 开关为「成功假象」，标量参数正常持久化

**现象**：
- `player config update --watermark-enabled Y ...` 与 `--warmup-enabled Y` 均返回 `{success:true, updatedFields:[...]}`，并把对应字段名列入 `updatedFields`。
- 但 `player config get` 复查显示：`watermarkEnabled` 始终为 `null`（设置前后无变化）；`--warmup-enabled Y` 后 `warmupEnabled` 仍为 `N`。
- 同一命令的**标量参数**则完全正常持久化：`watermarkUrl`（由空 → re-host 后的 liveimages.videocc.net 地址）、`watermarkPosition`（tr→br）、`watermarkOpacity`（1→0.8）、`basePv`（0→1000）均经 get 复查命中。
- 还观察到一次**副作用**：仅传水印参数的 update 后，`warmupEnabled` 由基线 `Y` 翻转为 `N`（疑似 update 请求体未携带暖场字段，后端按默认 N 覆盖）。

**排查**：
- 已用独立子命令 `player warmup switch-update --warm-up-enabled Y` 验证：返回 success 后 `player config get` 的 `warmupEnabled` 立刻变为 `Y`。证明暖场开关的**正确入口是 `player warmup switch-update`**，而非 `player config update --warmup-enabled`。
- 水印开关同理推测存在独立入口（本场景 CLI 未暴露独立 watermark switch 子命令），`player config update --watermark-enabled` 对开关无效。

**结论与建议**：
- `player config update` 适合配置**标量物料**（水印图 / 位置 / 透明度 / basePv），**不适合**切换 Y/N 开关。
- 暖场开关一律用 `player warmup switch-update`；水印开关需在保利威后台开启或确认权益。
- 运营必须用 `player config get` 复查，不能仅凭 `success:true` + `updatedFields` 判定生效——这是与 `watch-condition set`、`donate config update` 同源的「成功假象」模式。

### 12.2 问题记录：`player anti-record update` 因 `--model-type` 未映射到后端 `modelType` 而失败

**现象**：
- `player anti-record update -c 7983934 --anti-record-type marquee --model-type nickname --content "..." --font-size 30 ...` 报 `Unexpected error: param should not be empty: modelType`。
- 分别尝试 `--model-type fixed`、`--model-type nickname`、补全全部参数（font-size/opacity/font-color/show-mode/double-enabled/auto-zoom-enabled）均报同一错误。
- 排查发现 `--font-size` 在 `--help` 中未标 required，但缺省时报 `required option '--font-size <size>' not specified`（CLI 强制必填）。

**排查与结论**：
- CLI 的 `--model-type <type>`（kebab-case）参数**未被映射到后端 API 的 `modelType` 字段**（与场景 03 `lottery create --type comment` 的 `activityDuration` 未写入同类 CLI 透传缺陷）。
- 因此 `player anti-record update` 在当前 rc（`1.2.31-rc.0`）**无法通过 CLI 开启防录屏**，需到保利威后台手动开启；`player anti-record get` 在防录屏未开时返回 `Anti-screen recording is not turned on`（读出错误而非空数据，命令本身执行成功）。
- 该问题不影响 `player` 命令族覆盖结论：本族 `config get`/`config update`（标量持久化）/`warmup switch-update`/`logo-update`/`watch-feedback-list`/`anti-record get` 均真实执行成功。

### 12.3 已验证持久化的写入（前后对比）

| 写入命令 | 复查命令 | 变更前 | 变更后 | 结论 |
|---|---|---|---|---|
| `player config update --watermark-url/position/opacity` | `player config get` | url="" / pos=tr / opacity=1 | url=re-host 地址 / pos=br / opacity=0.8 | ✅ 持久化 |
| `player config update --base-pv 1000` | `player config get` + `web info likes-get` | basePv=0 / viewers=0 | basePv=1000 / viewers=1000 | ✅ 持久化（配置侧 + 观众侧交叉验证） |
| `player warmup switch-update --warm-up-enabled Y` | `player config get` | warmupEnabled=N | warmupEnabled=Y | ✅ 持久化 |
| `web info splash-set --splash-enabled N/Y` | `web info splash-get` | splashEnabled=Y | N → Y | ✅ 持久化（双向验证） |
| `web info countdown-set --start-time` | `web info countdown-get` | countEnabled=N / startTime=null | countEnabled=Y / startTime=2026-06-23 20:00:00 | ✅ 持久化 |
| `web info publisher-set --publisher` | `channel get` | publisher=空 | publisher="GNHF09品牌主播小妮" | ✅ 持久化 |
| `web menu intro-set --content` | `web menu list` | 直播介绍 content=空 | content=自定义文案 | ✅ 持久化 |
| `web share update --weixin-share-title/desc` | `web share get` | title=频道名 / desc=默认 | title=自定义 / desc=自定义 | ✅ 持久化 |

### 12.4 配置侧 vs 观众侧区分

| 项 | 验证方式 | 结论 |
|---|---|---|
| 水印 / 暖场 / basePv / 开屏 / 倒计时 / 主播名 / 介绍 / 分享文案 | CLI 只读命令（`player config get`/`web info *-get`/`channel get`/`web menu list`/`web share get`） | **配置侧已满足条件** |
| basePv 锚定的观看数 | `web info likes-get` 的 viewers=1000 | **观众侧可见**（观看页显示访问量含基础访问量） |
| 水印 / 暖场封面 / Logo / 开屏图 / 防录屏跑马灯 的实际渲染 | 本轮未打开真实观看页验证 | **仅配置侧已满足**，观众侧渲染需人工打开观看页或开播后验证 |

> 严格区分：除 basePv 经 `web info likes-get` 观众侧接口交叉验证外，其余物料本轮仅完成**配置侧落库**，观众侧实际渲染效果（水印是否显示、开屏是否弹出、防录屏跑马灯是否滚动）需人工打开观看页或开播后验证，不能仅凭配置侧写入声称观众侧可见。

## 13. 风险点与回滚 / 清理方式

| 风险 | 说明 | 回滚 / 清理 |
|---|---|---|
| 图片域名白名单 | 非保利威域名（如 placehold.co）被拒「非法图片域名」 | 仅使用保利威自有 CDN 域名（s2.videocc.net / liveimages.videocc.net） |
| Y/N 开关「成功假象」 | `player config update` 的 `--watermark-enabled`/`--warmup-enabled` 不持久化 | 暖场用 `player warmup switch-update`；写入后一律 `get` 复查 |
| 暖场副作用 | 仅传水印参数的 update 可能把 warmupEnabled 覆盖为 N | update 后立即用 `switch-update` 复位，或分两次 update |
| 防录屏无法 CLI 开启 | `--model-type` 透传缺陷 | 到保利威后台手动开启防录屏 |
| 频道保留 | 测试频道 `7983934` 已保留未删除 | 见第 14 节，清理命令未执行 |

> **回滚物料**：所有写入均可反向操作恢复默认（splash-set N、countdown-set countEnabled 复位、share update 改回频道名、warmup switch-update N、player config update 水印 url 置空）。本场景为品牌物料落地，未执行回滚，保留最终品牌配置供人工查看。

## 14. 保留资产说明

| 资产 | 类型 | 是否保留 | 说明 |
|---|---|---|---|
| 测试频道 `7983934` | 频道 | **保留** | 供人工查看观看页 / 播放器品牌物料落库；未删除 |
| 播放器水印（br / 0.8） | player 配置 | 保留 | 标量参数已持久化 |
| basePv=1000 | player 配置 | 保留 | 已在观看侧 viewers=1000 体现 |
| 暖场封面 Y | player 配置 | 保留 | 经 switch-update 持久化 |
| 播放器 Logo | player 配置 | 保留 | logo-update 已执行 |
| 开屏 Y / 倒计时 2026-06-23 20:00 / 主播名 / 直播介绍 / 微信分享文案 | web 配置 | 保留 | 均经只读复查持久化 |

> 频道与配置均已保留，未执行任何删除 / 回滚。可选人工清理命令（**未执行**）见第 3 节。

## 15. 可复用模板

```bash
# ===== 直播间品牌化装修一键模板（替换 <CID>/<UID>/图片域名） =====
CID=7983934
UID=475b6884a7
IMG=https://s2.videocc.net/watch-theme/spring/v2/assets/common/player-cover.png   # 必须保利威白名单域名

# 播放器：水印 + basePv
npx --yes polyv-live-cli@rc player config update -c $CID \
  --watermark-url "$IMG" --watermark-position br --watermark-opacity 0.8 -o json
npx --yes polyv-live-cli@rc player config update -c $CID --base-pv 1000 -o json
# 播放器：暖场（独立子命令）
npx --yes polyv-live-cli@rc player warmup switch-update -c $CID --warm-up-enabled Y -f -o json
# 播放器：Logo
npx --yes polyv-live-cli@rc player logo-update -c $CID --logo-image "$IMG" --logo-position br --logo-opacity 0.8 -f -o json

# 观看页：开屏 + 倒计时 + 主播名
npx --yes polyv-live-cli@rc web info splash-set -c $CID --splash-enabled Y -f -o json
npx --yes polyv-live-cli@rc web info countdown-set -c $CID --booking-enabled Y --start-time "2026-06-23 20:00:00" -f -o json
npx --yes polyv-live-cli@rc web info publisher-set --user-id $UID -c $CID --publisher "品牌主播名" -f -o json
# 观看页：直播介绍
npx --yes polyv-live-cli@rc web menu intro-set --user-id $UID -c $CID --content "促销文案与福利钩子" -f -o json
# 观看页：微信分享
npx --yes polyv-live-cli@rc web share update -c $CID \
  --weixin-share-title "品牌名｜核心钩子" --weixin-share-desc "副标题钩子" -f -o json

# ===== 复查（每条写入后必须 get 复查，不能信 success:true） =====
npx --yes polyv-live-cli@rc player config get -c $CID -o json
npx --yes polyv-live-cli@rc web info splash-get -c $CID -o json
npx --yes polyv-live-cli@rc web info countdown-get -c $CID -o json
npx --yes polyv-live-cli@rc channel get -c $CID -o json           # publisher
npx --yes polyv-live-cli@rc web menu list -c $CID -o json          # 直播介绍
npx --yes polyv-live-cli@rc web share get -c $CID -o json
```

## 16. 后续可扩展方向

- **观众侧渲染验证**：用 browser-use 打开频道 `7983934` 观看页，截图验证水印 / 开屏 / 倒计时 / 防录屏跑马灯的实际渲染，把「配置侧已满足」升级为「观众侧可见」。
- **播放器 advert / skin / marquee-url / anti-record**：`player` 族还有 `advert`（片头广告）、`skin`（V4 皮肤）、`marquee-url`（跑马灯 URL 限制）等子命令未在本场景展开，可做「播放器深度品牌化」续集。
- **观看页 web menu add / update / delete / rank-update**：本场景只用了 `intro-set`，菜单的增删改与排序可做「观看页导航装修」续集。
- **web setting image-upload / global-enabled-update**：观看页图片素材上传与全局设置开关可补充进品牌物料工作流。
- **web auth / web donate**：观看页鉴权与观看页打赏子族可结合场景 05 / 06 做联动。
- **防录屏 CLI 修复跟进**：`player anti-record update` 的 `--model-type` 透传缺陷反馈给 CLI 维护方，修复后补录防录屏跑马灯的真实开启与观众侧验证。
