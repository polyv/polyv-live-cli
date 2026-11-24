# 点播 CLI + Skill 开发方案

> 状态：已评审通过，实施中（分支 `feat/vod-cli`）
> 日期：2026-11-24（方案）/ 2026-11-25（决策与尖峰结论）
> 范围：在 polyv-live-cli monorepo 中新增 PolyV 云点播（VOD）的 SDK、CLI 与 Agent Skill
> 参考：官方 API 文档 `../document-center/docs/vod/api`（149 篇）、cuplayer 项目（`/Users/nick/projects/polyv/cuplayer`）、官方 Java SDK 源码（`/Users/nick/projects/polyv/polyv-java-sdk/polyv-java-vod-sdk`）

---

## 1. 结论

在**本仓库**新增两个同级包和一个新 skill，不把点播塞进现有的直播包。

| | 直播（现有） | 点播（新增） |
|---|---|---|
| SDK | `packages/sdk` → `polyv-live-api-sdk` | `packages/vod-sdk` → `polyv-vod-api-sdk` |
| CLI | `packages/cli` → `polyv-live-cli` | `packages/vod-cli` → `polyv-vod-cli` |
| Skill | `skills/polyv-live-cli` | `skills/polyv-vod-cli` |
| 分发 | `connectors/polyv-live`、`experts/polyv-live-ops` | `connectors/polyv-vod`、`experts/polyv-vod-ops` |

不放进现有包的原因：

1. **凭证和签名是两套体系。** 直播用 `appId / appSecret` 加 MD5 首尾包裹；点播用 `userid / secretkey / writeToken` 加 SHA1。直播的 `AuthConfig { appId, appSecret }` 贯穿了 `authAdapter`、`account add` 和 `index.ts` 的入口预校验，扩不成第二套。
2. **名称都带 live 语义。** 包名、User-Agent、MCP 工具名前缀 `mcp_polyv_` 都是。
3. **直播 CLI 已经很大。** 41 个一级命令、572 个叶子命令，`packages/cli/src/index.ts:394` 还有一份硬编码的顶层命令名白名单。
4. **账号相互独立。** 只用点播的用户不该装一个带全部直播命令的 CLI。

代价：CLI 脚手架（输出、确认、账号存储、`--source`）要重写一份，预计 1.5K 行左右。v1 不抽公共包，也不改直播 CLI。

npm 命名核查（2026-11-24）：`polyv-vod-cli`、`polyv-vod-api-sdk` 均未被注册。

---

## 2. 调研事实

### 2.1 cuplayer 能参考的和缺的

cuplayer 的点播用法只有四处：

- **上传签名**（`apps/api/src/modules/upload/upload.service.ts`）：`sign = md5(secretKey + ptime)`、`hash = md5(ptime + writeToken)`，小写 hex，`ptime` 用**毫秒**。cuplayer 设计稿里写秒是笔误，代码与官方 SDK README 均为毫秒，以代码为准。
- **上传本体**由浏览器 SDK `@polyv/vod-upload-js-sdk@1.12.0` 完成，依赖 `File` 和 XHR，CLI 里用不了。
- **回调验签**：只覆盖上传完成、单清晰度转码、审核三类；官方文档列了 9 类。
- **播放器**：浏览器端 `window.polyvPlayer({ vid })`，与 CLI 无关。

cuplayer **没有调用任何点播管理接口**：视频信息存在自己的 Prisma 库，删除只删本地记录。视频、分类、播放凭证、统计等全部要对照官方文档实现，文档在 `../document-center/docs/vod/api`。

### 2.2 点播有三套签名

| 场景 | 算法 | 公共参数 | 依据 |
|---|---|---|---|
| 绝大多数接口（`api.polyv.net/v2、v3、v4/…`） | 参数按 key 排序拼成 `k=v&k=v`，**尾部**接 `secretkey`，SHA1 大写 | `userid`、`ptime`（毫秒，3 分钟有效）、`sign` | `buildSign.md` |
| 播放凭证 `hls.videocc.net/service/v1/token`、子账号模块 | key/value 排序拼接，**首尾**接 `secretkey`，MD5 大写（与直播同构） | 播放凭证用 `ts`（10 分钟有效） | `buildSignMd5.md` |
| 本地文件直传 `v.polyv.net/uc/services/rest?method=uploadfile` | **不签名**，直接带 `writetoken` | 无 | `video_upload/upload_video.md` |

### 2.3 上传有三条路

| 方式 | 接口 | 公开文档 | 限制 |
|---|---|---|---|
| 本地文件直传 | multipart：`writetoken`、`JSONRPC`（JSON：title/tag/desc）、`Filedata`、`cataid`、`luping`、`fileMd5`、`state` 等 | 有 | 单文件 ≤ 2G；请求不能带 cookie |
| 按 URL 异步拉取 | `POST /v2/video/grab/{userid}/upload/multi`（`uploadInfos` 数组 ≤ 100），配套同步任务的查询/导出/删除 | 有 | 结果靠回调或轮询 |
| 分片断点续传 | `POST api.polyv.net/v2/uploadvideo/{userid}/init` → `GET .../token`（OSS STS 临时凭证）→ OSS 分片上传 | **没有**，只存在于官方 Java SDK 源码（`.../v1/upload/`） | 需移植，协议可能变化 |

### 2.4 接口清单概览

`docs/vod/api` 下约 125 个可调用接口，按模块：

- 视频上传（5）：直传、URL 批量、同步任务查询/导出/删除
- 视频管理（约 40）：搜索、信息、修改、删除/恢复、移动分类、禁播、预览时长；分类 CRUD；封面；字幕；智能字幕；视频大纲；打点；弹幕；问答；课件；播放列表；微信分享
- 视频处理（5）：水印、裁剪、合并、截图
- 视频安全（10）：播放凭证、加密设置、授权播放/跑马灯、播放密码、域名限制
- 播放器设置（4）、广告管理（4）
- 数据统计（约 20）：空间流量、播放量、时长、观众、域名/地理/终端分布、热点、完成度、观看日志、高级分析
- 子账号（12，**本期不做**，第二类凭证体系）
- 开发设置（2）：回调设置查询/修改
- 私有接口（3）：临时链接、源文件取回任务

### 2.5 仓库里会挡路的硬编码

| 位置 | 内容 |
|---|---|
| `packages/cli/src/index.ts:394`、`:446` | 顶层命令名白名单 |
| `packages/tool-manifest/src/load-cli.ts:44,166` | 写死 `polyv-live-cli` |
| `scripts/release.sh`、`.github/workflows/release.yml` | tag 只有 `v*`（CLI）和 `sdk-v*`（SDK）两个槽位 |
| `.github/workflows/ci.yml` | 只显式跑 cli 和 sdk 两个包的测试/覆盖率 |
| `scripts/check-skill-regression.mjs` | 写死直播 skill 路径、包名、`allowed-tools` |
| `scripts/update-coverage-badge.mjs` | 写死两份 coverage-summary 路径 |

### 2.6 skill 分发现状

- skill 有三份拷贝：`skills/polyv-live-cli`（源）、`experts/polyv-live-ops/skills/polyv-live-cli`（逐字节镜像）、`connectors/polyv-live/skills/polyv-live`（references 相同、SKILL.md 手工分叉）。
- 同步靠手工 rsync（两个 README 里各有命令），无自动化校验。
- `.claude-plugin/plugin.json` 的 `skills: ["./skills/"]` 是整目录 glob，新 skill 自动纳入。
- `scripts/check-workbuddy-expert.mjs` 按传入目录的 `plugin.json` 校验，无写死名字，可直接复用。

---

## 3. 架构

```
polyv-live-cli/
├── packages/
│   ├── sdk/  cli/  tool-manifest/     现有，本期不动
│   ├── vod-sdk/    polyv-vod-api-sdk  新增
│   └── vod-cli/    polyv-vod-cli      新增，依赖 vod-sdk（workspace:*）
├── skills/polyv-vod-cli/              新增，canonical
├── connectors/polyv-vod/              新增
└── experts/polyv-vod-ops/             新增
```

`vod-cli` 内部分层与直播一致：`commands/` 调 `handlers/`，handler 继承 `BaseHandler` 且服务可注入，再经 `services/*.service.sdk.ts` 调 vod-sdk。沿用现有测试写法。两个 CLI 运行时互不依赖。

---

## 4. v1 范围（约 40 个叶子命令）

| 命令组 | 子命令 | 对应接口 |
|---|---|---|
| `account` | `add`、`list`、`remove`、`set-default`、`current` | 本地 |
| `use` | 会话账号切换、`--status`、`--clear` | 本地 |
| `auth` | `auth`、`auth status`、`auth logout` | 连接器要求 |
| `video` | `search`、`get`、`update`、`delete`、`recover`、`move`、`ban`、`unban`、`size`、`wait` | search-videos、get-video-info、video-info、del-videos、recover-videos、changeCata、forbidden、getSizeByCata |
| `category` | `list`、`add`、`rename`、`update`、`move`、`delete` | cataJson、addCata、updateCata、updateCataProfile、cata/change、deleteCata |
| `upload` | `file`（≤2G 直传；大文件走分片断点续传）、`url`、`tasks`、`task-export`、`task-delete` | uploadfile、grab 系列、uploadvideo/{init,token} |
| `play` | `token` | service/v1/token |
| `stats` | `usage`、`play-times`、`rank`、`video-play-times`、`view-log` | user/main、videoview、ranklist、play-times、viewlog |
| `callback` | `get`、`update`、`verify` | vod/v4/user/setting/callback + 本地验签 |

`video wait` 是 CLI 侧轮询（到已发布 60/61 或失败 40/51），相当于 cuplayer 里用 webhook 驱动的「处理中→完成」，适合 agent 串联后续步骤。

**P1**（按需排期）：字幕、封面、播放列表、打点、弹幕、问答、课件、临时链接、播放安全设置、播放器设置、截图/剪辑、广告、高级分析、本地回调调试服务。

**不做**：子账号模块（需要第二类凭证，单独设计）、MCP tool-manifest 接入、直播 CLI 内部改造。

---

## 5. 设计要点

### 5.1 vod-sdk

- **客户端**：`PolyVVodClient` 支持三个 host（`api.polyv.net`、`hls.videocc.net`、`v.polyv.net`），请求拦截器按端点声明注入签名。
- **响应解包**：统一解 `{ code, status, message, data }`；`uploadfile` 返回旧式 `{ error, data }`，单独处理。
- **签名器**：三个签名器（SHA1 / MD5 / 直传免签）各配单测，用文档示例值做固定向量。
- **限流**：`api.polyv.net` 单 IP 10 秒 500 次，超限封 5 分钟（`limit.md`）。客户端内置节流；瞬时网络错误按 `maxRetries` 重试。
- **分片断点续传（v1 必须，已决策，两条后端均已实测）**：`POST /v2/uploadvideo/{userid}/init` 返回 `vid` 与两种存储的临时凭证；按 `storageType` 选择后端，零依赖手写签名：华为 OBS（V2 签名，虚拟主机域名，`x-obs-callback`）或阿里 OSS（V1 签名，`x-oss-callback`）。断点状态落本地 checkpoint 文件。详见第 11 节。
- **签名参与参数按接口声明（已实测）**：默认规则是「发送的非空参数全部参与签名、取原值」；少数接口走固定字段集的个性化签名（以官方 Java SDK `VodBaseService.commonRequestLogic` 为准，公开文档这部分已过时）。
- **类型生成**：复用直播 SDK 的文档解析生成器。它按 `接口描述 / 接口URL / 请求方式 / 请求参数描述 / 响应参数描述` 标题解析（`packages/sdk/scripts/parsers/markdown-parser.ts`），点播文档标题格式相同。把 `packages/sdk/scripts/` 的解析/生成部分复制进 `packages/vod-sdk/scripts/`，默认路径改为 `../document-center/docs/vod/api`。

### 5.2 vod-cli

- **凭证与存储**：账号存 `~/.polyv-vod/accounts.json`，目录 0700、文件 0600，加密策略参照直播的 `packages/cli/src/config/account-crypto.ts`（AES-256-CBC + PBKDF2）。不复用 `~/.polyv` 和 `~/.polyv-live-cli`。
- **两类凭证**：点播密钥（`userId`、`secretKey`、`writeToken`，`readToken` 预留）用于绝大多数接口；可选的 API 凭证（`appId`、`appSecret`，与直播同源）仅 V4 接口需要（含 P0 的 `callback get/update`）。缺少 API 凭证时这些命令给出明确提示。
- **环境变量**：`POLYV_VOD_USER_ID`、`POLYV_VOD_SECRET_KEY`、`POLYV_VOD_WRITE_TOKEN`；`POLYV_VOD_READ_TOKEN` 预留（P0 不用）。全局参数 `--userId`、`--secretKey`、`--writeToken`、`-a <name>`。
- **不读裸的 `POLYV_USER_ID`**：直播 CLI 已经用它表示直播 userId，cuplayer 又用它表示点播 userid，读它会串。
- **`--source`**：沿用直播的调用方来源标识机制与 `preAction` 钩子。User-Agent：`polyv-vod-cli/<版本> (source=…)`。
- **输出与确认**：`-o table|json`、`--force`，与直播一致。
- **删除保护**：`video delete` 默认进回收站（`deleteType=1`）；彻底删除（`deleteType=2`）必须同时给 `--permanent` 和 `--force`。一次最多 500 个 vid。
- **`callback verify`**：对 stdin 或参数传入的回调做本地验签，覆盖官方文档全部 9 类事件。cuplayer 后端里的三段验签逻辑可迁移至此。

点播回调验签规则（`callBack.md`，均为小写 md5）：

| 事件 | 签名串 |
|---|---|
| 上传完成 | `"upload" + vid + secretkey` |
| 异步上传失败 | `type + fileUrl + secretkey` |
| 同步失败 | `type + vid + secretkey` |
| 单清晰度转码 | `type + format + vid + df + secretkey` |
| 全部转码完成 | `eventType + vid + secretkey`（sign 在 URL 参数） |
| 审核完成 | `"manage" + type + vid + secretkey` |
| 删除完成 | `"DeleteMediaComplete" + secretkey`（sign 在 URL 参数） |
| 内容安全审核不通过 | `"AIContentScanNotPassed" + secretkey`（sign 在 URL 参数） |
| 课件转换完成 | `"CoursewareConvertComplete" + secretkey`（sign 在 URL 参数） |

### 5.3 skill

`skills/polyv-vod-cli/SKILL.md` 沿用直播 skill 的 11 段结构（CLI 前缀 / 入口校验 / 认证预检 / 任务路由 / 风险规则 / 输出规则 / 本地图片 / 参考路由 / 失败处理 / 官方资源），`allowed-tools: Bash(npx --yes polyv-vod-cli@latest:*)`，正文用 `<CLI>` 占位符。references 约 10 篇：

- `task-routing.md`、`command-index.md`、`authentication.md`
- `videos.md`、`categories.md`、`upload.md`、`playback-security.md`、`statistics.md`、`callback.md`
- `scenarios.md`：跨 CLI 流程，如「点播上传转码完成后，用 `polyv-live-cli playback add-vod` 加入频道回放库」。

### 5.4 分发

- **连接器** `connectors/polyv-vod/`：照抄 `connectors/polyv-live` 结构；`cli.json` 里 bin 名 15 处替换；VOD CLI 必须实现 `auth`、`auth status`（输出 `Logged in`）、`auth logout`、`--version`。密钥指引页：`https://help.polyv.net/#/vod/api/getSecretKey`。
- **专家包** `experts/polyv-vod-ops/`：`plugin.json` + agent 文件 + skill 镜像；校验用 `node scripts/check-workbuddy-expert.mjs experts/polyv-vod-ops`。
- **Claude 插件**：无需改 manifest（整目录 glob）。

### 5.5 仓库基础设施

| 项 | 改动 |
|---|---|
| skill 回归检查 | `check-skill-regression.mjs` 参数化（按 skill 名传入路径/包名/allowed-tools），`skill:check` 跑两个 skill |
| 镜像同步 | 新增 sync + 一致性检查脚本，点播从第一天启用；直播可选接入 |
| CI | `ci.yml` 加 vod-sdk/vod-cli 测试与覆盖率、codecov files、`node packages/vod-cli/dist/index.js --version` 冒烟 |
| 发布 | `release.sh` + `release.yml` 加 `vod-v*`（CLI）、`vod-sdk-v*`（SDK）tag 槽位：发布目录、workspace 依赖改写、GitHub Release 命名 |
| 覆盖率徽章 | `update-coverage-badge.mjs` 扩展两份新 coverage |
| 文档 | 根 `README.md`（Skill/包结构/功能模块/相关链接）、`CLAUDE.md`（结构、文档索引加 vod） |
| 工作区 | `pnpm-workspace.yaml` 已是 `packages/*`，自动纳入，提交 lockfile 变更即可 |

---

## 6. 实施计划

| 阶段 | 内容 | 退出标准 |
|---|---|---|
| 0 尖峰 | 真实账号打通三种签名各 ≥1 个接口；验证分片续传 init/token；跑类型生成器；直传一个小文件并清理 | 签名规则与参与参数确认；init/STS 返回有效；P0 接口全部可生成类型；直传拿到 vid |
| 1 SDK | 客户端、三签名器、分片续传客户端（OSS multipart + checkpoint）、P0 服务、生成类型、单测 + 可选集成冒烟 | 覆盖率 ≥ 80%；search/get/delete/token 实测通过；大文件分片上传实测通过 |
| 2 CLI | 脚手架 + P0 命令组 | 覆盖率同直播档（分支 70%，函数/行/语句 80%）；三个端到端场景通过 |
| 3 Skill | canonical skill、references、回归检查参数化 | `pnpm skill:check` 两个 skill 都过 |
| 4 分发发布 | 连接器、专家包、CI、发布脚本、README | CI 全绿；打 tag 可发布 npm |
| 5 P1 | 长尾接口、分片续传、本地回调调试 | 按需排期 |

端到端场景：

1. 新账号：`account add` → `category list` → `upload file` → `video wait` → `video get` → `play token` → `video delete`。
2. URL 批量：`upload url` → `upload tasks` 轮询 → `task-export`。
3. 跨 CLI：点播上传转码后，直播 CLI `playback add-vod` 加入频道回放库。

---

## 7. 测试策略

- **vod-sdk**：vitest。单测覆盖签名固定向量、拦截器注入、响应解包、节流；集成冒烟由环境变量开启，无凭证自动跳过。
- **vod-cli**：jest + ts-jest，阈值同直播（branches 70% / functions·lines·statements 80%）。
  - 命令层 mock handler，参照 `packages/cli/src/commands/action-coverage.test.ts`。
  - handler 层注入 mock 服务，参照 `document.handler` 的 `IDocumentService` 模式。
  - service 层 mock `createSdkClient`。
  - 集成测试参照 `tests/helpers/cli-runner.ts`（隔离 HOME + spawn dist/index.js）。
- **环境**：本地按 `CLAUDE.local.md` `nvm use 23`；CI 是 Node 20。
- 直播的扫描类测试（`low-handlers-coverage` 等）是显式 import 列表，**不会**自动覆盖新命令；点播自带等价测试。

---

## 8. 风险与待确认

| 风险 | 影响 | 处理 |
|---|---|---|
| 签名细节文档未写全：值是否 URL 编码、中文/JSON 数组参数（如 `uploadInfos`）如何参与 | 签名失败 | 尖峰阶段对拍确认 |
| 播放凭证签名字段名文档内有出入：参数表写 `userid`，MD5 规则示例写 `userId` | token 接口失败 | 尖峰阶段确认 |
| 分片续传不在公开文档，协议以 Java SDK 源码反推 | 大文件上传（v1 必须）可能与官方实现有偏差 | 尖峰阶段实测 init/token；OSS 分片签名按 `AliOSSService` 移植；集成测试覆盖 |
| npm 归属 | 发不出去 | 名称当前未被注册；发布前负责人确认 OIDC trusted publishing |
| 新 User-Agent | 来源统计可能丢失 | 确认服务端是否登记 `polyv-vod-cli` |
| 点播 `userid` 与直播 `userId` 是否同值 | 跨 CLI 场景文档写法 | 未验证，默认按两套独立凭证处理 |
| `document-center` 是独立 git 仓库（非 submodule） | 类型生成依赖本机 checkout | 生成产物提交进仓库 |

---

## 9. 决策记录（2026-11-25 已确认）

| 事项 | 决策 |
|---|---|
| 命名 | `polyv-vod-api-sdk` / `polyv-vod-cli` / skill `polyv-vod-cli` / 连接器 `polyv-vod` / 专家包 `polyv-vod-ops` |
| v1 范围 | 第 4 节 P0 的 9 个命令组 |
| 大文件 | >2G 上传 v1 必须 → 分片断点续传纳入 v1（见 5.1） |
| 尖峰凭证 | 测试账号已提供，存于仓库根 `.env.vod-spike`（`.env.*` 已 gitignore；凭证不入库、不入文档） |
| 仓库归属 | 留在本仓库，复用 workspace / CI / 发布基建 |

---

## 10. 顺带发现的现存问题

1. `check-skill-regression.mjs` 有两项检查空转：正则要求 SKILL.md 出现字面量 `npx --yes polyv-live-cli@latest <cmd>`，而 SKILL.md 实际用 `<CLI>` 占位符；必检命令表漏了 `auth`。参数化时一并修掉。
2. connector 镜像的 `references/command-index.md:7` 仍写 npx 前缀，与同目录 SKILL.md「用已安装 CLI」矛盾。
3. 各处版本号不一致：CLI 1.6.0 / skill 1.5.0 / connector-meta 1.0.1 / expert 1.4.0。

---

## 11. 阶段 0 尖峰结论（2026-11-25 真实账号实测）

测试方式：`/tmp/vod-spike/` 下的零依赖 Node 脚本，对测试账号发真实请求；每个探测尝试多种签名字段组合，记录哪种被服务端接受；本次创建的视频均已清理。凭证不入库。

### 11.1 签名规则

| 结论 | 证据 |
|---|---|
| **默认规则**：发送的非空参数**全部**参与签名，值取**原值**（不做 URL 编码） | `search-videos`（带中文 `title=测试`）：全量原值通过；URL 编码后失败；只签公共参数失败 |
| `requestId` 可选；发送则必须参与签名 | 不发送时通过；发送但不签 → `the sign is not right` |
| **个性化签名**：部分接口只签固定字段集，多发的参数不参与。以官方 Java SDK 的特例表为准，公开文档这部分已过时 | `cataJson` → `{userid, ptime}`；`updateCata`（分类改名）→ `{userid, cataname, cataid, ptime}`；`deleteCata` → `{userid, cataid, ptime}`；`changeCata`（移动视频）→ `{userid, vids, cataid, ptime}`；`data/viewlog`（按天观看日志）→ `{userid, day, ptime}`。以上每个都用默认规则和文档写法对拍过，均只有 Java SDK 的字段集通过 |
| 只发送接口认识的参数：服务端只对它认识的参数计算签名 | `viewlog/{userid}/monthly/{month}`（按月观看日志）走默认规则，但分页参数必须叫 `pageSize`（文档写 `numPerPage`），且 `month` 要同时作为参数发送 |
| 走默认规则并已实测通过的 P0 接口 | `search-videos`、`get-video-info`、`video-info`、`recover-videos`、`forbidden`、`getSizeByCata`、`addCata`、`updateCataProfile`、`cata/change`、`del-videos`、`grab/*`、`user/main`、`play-times`、`videoview`、`ranklist`、`uploadvideo/init`、`uploadvideo/token` |
| 播放凭证（MD5）：发送的参数全部参与；`userid` 与 `userId` 两种拼写都被接受；返回的 `appId` 为 `null` | 5 种组合中「发送 requestId 但不签」失败，其余通过 |
| V4 接口（`appId` + `appSecret`）**未测**：测试账号未提供 API 凭证 | — |

实现口径：SDK 每个端点声明签名策略，默认全量；个性化接口按上表的固定字段集登记。

### 11.2 上传

| 项 | 实测结果 |
|---|---|
| 直传（`writetoken`） | 通过。加 `format=json` 返回 JSON；`data[0].vid`、`status=10` |
| 转码耗时 | 1 秒小视频：`10`（等待编码，约 67s）→ `20`（编码中）→ `60`（已发布，约 78s）。`video wait` 默认超时取 10 分钟 |
| `init` | 通过。必须带 `autoid=1` 和 `uploadType`，否则报 `vid不能为空`。响应是**扁平结构**，同时含阿里云凭证、`hwObsInfo`、`callback`（OSS 回调 JSON）、`encodedCallback`、`storageType` |
| `token` | 通过（`ptime` + `requestId`）。凭证有效期 3600 秒 |
| 华为 OBS 分片 | **通过**（4 分片，合并后大小与源文件一致）。必须用虚拟主机域名（路径风格报 `VirtualHostDomainRequired`）；回调头 `x-obs-callback` = Base64(JSON) |
| 阿里 OSS 分片 | **通过**（同一账号，4 分片）。即使 `storageType=hw` 也可用；回调头 `x-oss-callback` = `init` 返回的 `encodedCallback` |
| 上传后可见性 | 回调成功后视频记录**立即**可见，初始 `status=6`，随后 `6 → 10 → 20 → 60`（`6` 不在公开文档的状态码表里） |
| 签名实现 | OBS V2 与 OSS V1 同构：`METHOD\nContent-MD5\nContent-Type\nDate\n` + 排序的 `x-??-` 头 + `/bucket/object` + 排序子资源，`HMAC-SHA1`。**零运行时依赖** |

### 11.3 其它

- **删除的静默跳过**：`del-videos` 带 `ignoreInvalidVids=Y` 时，被跳过的 vid 列在响应的 `data` 里，HTTP 和 `code` 仍是 200。刚上传完（状态 `6`）的视频可能被跳过。`video delete` 必须检查 `data` 并提示未删除的 vid，不能把 200 当成功（尖峰时因此遗留过一个视频，已清理）。
- **批量删除**：不带 `ignoreInvalidVids` 时，`vids` 里只要有一个不存在的 vid，整批失败（`illegal vids`）。只 `init` 未完成上传的 vid 不构成视频记录。
- **类型生成器**：复用直播 SDK 的文档生成器，146 篇文档 146 篇解析成功，产出 13 个文件 4814 行。但类型名是 4 位哈希，同一模块内会重名并在 TypeScript 中静默合并，点播侧改为按文档文件名起名。
- **凭证模型**：V4 接口（含 P0 的 `callback get/update`）需要账号的 API `appId/appSecret`。点播账号记录因此支持可选的 `appId/appSecret`，缺少时相关命令给出明确提示。
- **遗留**：V4 签名需要一组带 API 凭证的测试账号才能对拍。

### 11.4 SDK 集成测试补充确认（2026-11-25）

`packages/vod-sdk/tests/integration/real-api.test.ts` 对真实账号跑通 11 个用例，另外确认了：

- **续传可用**：中断后带检查点再次调用，`init` 以 `autoid=0` + `vid` 重新挂接，复用原 `uploadId` 并只补传缺失分片。
- 从回收站恢复的视频状态码是 `61`（不是 `60`），两者都是已发布。
- `getSizeByCata` 按分类分组返回：`[{ cataid, videos: [{ vid, duration: "hh:mm:ss", filesize1|2|3 }] }]`。
- `viewerId` 接受连字符和下划线，比文档写的「数字字母」宽。
- 回调验签的 4 个文档示例值全部对上；MD5 夹心算法与直播 CLI 测试里的向量一致。

### 11.5 CLI 真实冒烟修正（2026-11-25）

对构建产物跑真实账号时发现并修正的问题，都记在这里作为后续回归用例的来源：

| 问题 | 根因 | 修正 |
|---|---|---|
| `video get <vid>` 等带位置参数的命令报 "vids must contain at least one video id" | Commander 的位置参数不在 `opts()` 里，只作为动作函数的参数传入 | `optionsOf(command, actionArgs)` 按 `registeredArguments` 的名字自动并入位置参数 |
| 所有情况的退出码都是 0 | 失败状态用 getter 持有，上下文对象被展开拷贝（重定向输出时）后 getter 变成了静态值 | 失败状态放进共享的 `state` 对象；只有入口点写 `process.exitCode` |
| `--version` 输出 `0.0.0` | 版本号从 `package.json` 读，而发布包只含 `dist/` | 构建时写入 `dist/version.json` |
| `video wait` 对永远无法发布的视频空等到超时 | SDK 只把 `40`、`51` 当作失败终态 | 状态 `41` 纳入失败终态，`wait` 1 秒内返回 |

**状态码 `41`**：不在公开文档里，本机的 SDK 源码和文档都没有记载。观察到的事实是：上传非视频内容（随机字节）后得到这个状态，时长 0、无格式、无转码结果，且不再变化。CLI 把它当作"不可播放"的终态处理，这是基于观察的判断，不是官方定义。

**测试账号的清理教训**：SDK 集成测试最初用随机字节当视频，平台处理后留下 6 个不可播放的记录；而当时的"账号已清干净"结论是用标题搜索得出的，搜索结果为空并不代表对象不存在（结论是错的，残留后来已删除并逐个核实）。现在集成测试上传真实视频，清理后按 vid 逐个拉取确认，测试结束后再独立核对一次。
