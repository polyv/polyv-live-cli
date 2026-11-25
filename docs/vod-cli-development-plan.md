# 点播 CLI + Skill 开发方案

> 状态：v1 范围已实现（分支 `feat/vod-cli`）；尚未发布到 npm
> 日期：2026-11-24（方案）/ 2026-11-25（决策、尖峰结论与实施记录）
> 范围：在 polyv-live-cli monorepo 中新增 PolyV 云点播（VOD）的 SDK、CLI 与 Agent Skill
> 参考：官方 API 文档 `../document-center/docs/vod/api`（149 篇）、cuplayer 项目（`/Users/nick/projects/polyv/cuplayer`）、官方 Java SDK 源码（`/Users/nick/projects/polyv/polyv-java-sdk/polyv-java-vod-sdk`）
>
> **实施结果见第 12 节**：做了什么、验证了什么、还缺什么。

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
  - 集成测试参照 `tests/helpers/cli-runner.ts`（隔离 HOME + spawn dist/index.js）。已做，见 12.7。
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
| 尖峰凭证 | 测试账号已提供。凭证只存于 `packages/vod-sdk/.env.test`（`.env.*` 已 gitignore；不入库、不入文档），供真实接口测试使用 |
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

- **删除的跳过**：`del-videos` 带 `ignoreInvalidVids=Y` 时，平台不认识的 vid 列在响应的 `data` 里，HTTP 和 `code` 仍是 200。`video delete` 必须检查 `data` 并提示未删除的 vid，不能把 200 当成功（尖峰时因此遗留过一个视频，已清理）。当时在这里写的是「刚上传完（状态 `6`）的视频可能被跳过」，那是推断，后来实测不成立：`data` 的格式是 `invalidVids: [v_1, v_2]`，里面只有平台不认识的 vid，还在转码的视频照常删除。更正见 12.7。
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

---

## 12. 实施记录（2026-11-25）

v1 范围（第 4 节的 9 个命令组，含分片续传）已全部实现。分支 `feat/vod-cli`，未推送、未发布。

### 12.1 测试

| 包 | 结果 |
|---|---|
| `polyv-vod-api-sdk` | 129 个单元测试；14 个真实账号集成测试，分两个文件（11 个上传并清理临时视频和分类，67 秒；3 个验证回调设置） |
| `polyv-vod-cli` | 116 个单元测试，覆盖率 95% 语句 / 84% 分支 |
| skill `polyv-vod-cli` | `pnpm skill:check` 通过；文档里 48 条只读示例原样执行成功 |
| 现有的直播两个包 | 测试结果未变（6470 + 1608 通过） |

另外做过的验证：CLI 对真实账号跑完一遍 17 步流程（上传、等转码、改标题、移动分类、禁播解禁、播放凭证、统计、回收、恢复、彻底删除）；按发布工作流的做法本地演练了一次发布（改写依赖、打包、全新安装、真实调用）；连接器的 `auth` / `auth status` / `auth logout` 在干净环境里符合约定。其中对真实账号的流程验证后来改写成了入库的集成测试，见 12.7；那一轮也查出并修了几处问题，所以现在的数字是 SDK 131 个单元测试、CLI 127 个单元测试（覆盖率 96% 语句 / 85% 分支）加 42 个集成测试（25 个真实账号 + 17 个离线）。

### 12.2 与方案的差异

| 方案里写的 | 实际 | 原因 |
|---|---|---|
| 分片续传只实现阿里 OSS | 华为 OBS 和阿里 OSS 都实现 | 尖峰发现测试账号的存储是华为 OBS；两条路径都实测通过 |
| SDK 签名“默认全量 + 按接口声明白名单” | 相同，另外发现 5 个接口走固定字段集 | 尖峰逐接口对拍的结果，见 11.1 |
| skill 的 references 手工维护 | `command-index.md` 由脚本从 CLI 命令树生成 | 手写的索引容易和 CLI 脱节 |
| 连接器里的 skill 靠 rsync 同步 | 由 `scripts/sync-packaged-skills.mjs` 生成 | 直播连接器的那份手工副本里，`command-index.md` 仍写 npx 前缀，与同目录 SKILL.md 矛盾 |
| CLI 分 commands / handlers / services 三层 | commands + `core/context.ts` 两层 | 点播命令少，三层是多余的 |

### 12.3 发布流程里的隐患（已修）

原来的 Release 工作流用“不是 `sdk-v*` 就当直播 CLI”来判断发布哪个包。GitHub Actions 的 tag 过滤 `v*` 会匹配 `vod-v0.1.0`，shell 里的 `refs/tags/v*` 也一样。所以按本方案打 `vod-v*` tag 会触发工作流，并把**直播 CLI** 当成新版本发布。

现在 `scripts/release-package.mjs` 是 tag 前缀到包的唯一映射，`release.sh` 和工作流都读它；映射不到的 tag 让工作流在第一步就失败。工作流里的 tag 逻辑对着真实 git 历史用临时 tag 测过（10 项通过，临时 tag 已清理）。

`release.sh` 原来会删除远程已有的同名 tag 再重推，现在对已存在的 tag 直接拒绝。

### 12.4 尚未完成或未验证

| 事项 | 说明 |
|---|---|
| npm 发布权限未确认 | 包名已确认用 `polyv-vod-cli` 和 `polyv-vod-api-sdk`；发布前需要在 npm 上配好 trusted publishing |
| 类型生成器的改动没有单测 | 点播 SDK 复用并改了直播 SDK 的文档生成器（类型按文档文件名起名、字段去重、保留字模块名），只验证了「146 篇文档解析成功、产出一致」，没有针对生成器本身的测试；直播 SDK 有 5 个 |
| 连接器和专家包未提交到平台 | 清单和格式校验通过；图标和头像沿用直播的（头像是占位图） |
| 分支未推送、未提 PR | `feat/vod-cli` 上的提交都只在本地 |
| 状态码 `41` 的官方含义 | 按观察当作“不可播放”的终态，未找到官方定义 |

### 12.5 顺带发现的现有问题（未改动）

- **直播 SDK 的生成类型落后于文档**：`pnpm build` 会触发直播 SDK 的 `prebuild`，从本机的 `../document-center` 重新生成类型，结果比仓库里提交的多约 2000 行（新接口和新字段）。本次没有把这组变更带进点播的提交，已恢复原状。要不要更新直播的生成类型需要单独决定。
- **直播 skill 没有演示 `auth` 和 `use`**：`pnpm skill:check` 会提示这一点，但不阻断。
- **直播连接器的 skill 副本与根 skill 不一致**（`command-index.md` 仍是 npx 前缀）：`pnpm skill:sync:check` 会提示，这份副本仍是手工维护的。
- **`npx skills add polyv/polyv-live-cli` 会安装仓库里的全部 skill**：这个仓库原本就有 3 个 skill，所以这是既有行为，不是本次引入的；现在会多装一个点播 skill。README 里补了 `--skill` 和 `--list` 的用法。

### 12.6 回调设置的补验记录（2026-11-25）

`callback get` / `callback set` 用的是账号的 API 凭证（`appId` / `appSecret`），此前未在真实平台验证。测试账号有这一对凭证，在保利威控制台的「云直播 → 设置 → 开发设置 → 开发者信息」里；点播文档的密钥页只列了 userId、secretKey 和两个 token，没有提这一对。现已验证：

| 结论 | 依据 |
|---|---|
| 签名方式：`appId` + `timestamp` + `requestId`（加业务参数），MD5 首尾接 `appSecret`，参数放在 URL 里。SDK 现有实现正确 | `callback get` 和 `callback set` 都返回 HTTP 200 |
| 平台对收到的全部参数计算签名 | `requestId` 发了但不参与签名，返回 HTTP 403「签名错误」 |
| 密钥不对时报错明确 | CLI 输出 `签名错误`，退出码 1 |
| 平台先验签名再执行 | 用错误的 `appSecret` 调 `callback set`，设置没有被改动 |
| “未设置”有两种表示 | 从未设置过是 `null`，清空之后是 `""` |

SDK 新增 `tests/integration/callback.test.ts`，3 个用例：读取、设置后恢复原状、错误密钥被拒；缺少 API 凭证时跳过。验证后测试账号的回调地址已恢复为未设置。

**新发现，已决定不在 CLI 里处理：Node 的 `fetch` 在这台机器上连不上 `api.polyv.net`。** Node 用系统解析器，它给这个域名返回的是海外 CDN 节点。Node 对每个地址只给 250 毫秒的连接尝试窗口，而其中 IPv4 节点握手约需 260 毫秒、IPv6 节点无响应，所以所有地址都失败。直接向公共 DNS 查询得到的是国内节点，0.17 秒就能完成一次请求。

原因只查到一半。实测：`dig` 直接问 8.8.8.8 时，Google 报告的查询方是本机的公网地址，返回国内节点；系统解析器发同一个查询时，Google 报告的查询方在 Cloudflare 的地址段（AS13335），连查三次都一样，所以返回海外节点。也就是系统解析器的 DNS 查询走了另一条出口。

已排除的方向：Wi-Fi 上配置的 DNS 就是 8.8.8.8 / 8.8.4.4；系统代理是 Clash Verge（`127.0.0.1:7890`），没有证据表明它接管了系统 DNS；本机 53 端口上的本地 DNS 返回的是国内节点，不是它在回答系统解析器；本机没有带地址的隧道接口。是哪个环节改了这条路径，没有查清。

临时办法是给 Node 加两个运行参数，这次验证就是这样跑的：

```bash
NODE_OPTIONS="--dns-result-order=ipv4first --network-family-autoselection-attempt-timeout=3000" polyv-vod-cli ...
```

直播 CLI 用的是 axios，同样直连，可能受同样影响，未验证。

决定（2026-11-25）：这是本机网络环境造成的个别情况，别的用户未必遇到，所以不在 CLI 里改默认值，也不写进使用文档。在这台机器上跑测试时，用上面两个参数临时处理。

### 12.7 CLI 集成测试入库，以及由此查出的更正（2026-11-25）

第 7 节写了 CLI 的集成测试要参照直播 CLI 的做法（隔离 HOME、直接跑 `dist/index.js`），之前没有写，对真实账号的验证是用一次性脚本做的。现在已入库，在 `packages/vod-cli/tests/integration`：

| 文件 | 覆盖 | 何时运行 |
|---|---|---|
| `binary.integration.test.ts`，17 个 | 退出码、帮助、`--source` 拦截、离线验签、账号的保存 / 切换 / 删除（跨进程读写账号文件）、连接器的 `auth` 约定 | 不需要凭证，CI 里也跑 |
| `vod-cli.integration.test.ts`，25 个（其中 1 个可选） | 真实账号走完整流程：从环境变量和 flags 取凭证、保存账号、分类的增改移删、直传、分片上传的中断 / 放弃 / 续传、等转码、搜索、修改、移动、禁播、播放凭证、统计、URL 上传任务、回调设置读写、回收 / 恢复 / 彻底删除 | 读 `.env.test`（本包的，没有则读 `packages/vod-sdk/.env.test`）；缺凭证时整组跳过。URL 上传抓取成功的那一条依赖平台以外的公网地址，设了 `POLYV_VOD_TEST_PUBLIC_MP4` 才跑 |

运行：`pnpm --filter polyv-vod-cli test:integration`，会先构建 SDK 和 CLI。可选的那条 URL 上传用例这次用的是 MDN 的公开样例 `https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4`（1.1 MB，2026-11-25 当天可用）。

做法：每个测试用独立的 `POLYV_VOD_HOME`（`tests/helpers/cli-runner.ts`），在子进程里跑构建产物。清理走 SDK 而不是被测的 CLI，每个对象删除后逐个拉取确认，有残留则整组失败并列出残留项。分片续传的状态存在系统临时目录下，不在 `POLYV_VOD_HOME` 里，所以测试显式传 `--checkpoint-dir`，免得碰到开发者自己的中断上传。

**写这些测试时查出的错误。** 第一轮 24 条里 7 条失败，多数不是断言写错，而是实现和文档本身有问题。下表每一行都另外用探针脚本在真实平台上单独测过：

| 当时的说法或行为 | 实测 | 改动 |
|---|---|---|
| `category delete` 的帮助和 skill 都写「分类必须为空」 | 平台不要求为空。删除一个分类会**连带删掉它下面所有层级的子分类**；里面的视频不被删，而是移到默认分类（ID `1`） | 帮助改写。删除前先读子树，确认提示和结果都写明会删几个子分类、移走几个视频；根分类直接拒绝。skill、README、`CLAUDE.md` 同步更正 |
| SDK 把 `deleteVideos` 返回的 `data` 当纯列表解析 | 平台的格式是 `invalidVids: [v_1, v_2]`，被拆成 `invalidVids:` 和 `[zzz_0]` 两个「vid」，CLI 于是把不存在的 vid 算进「已删除」 | SDK 修正解析并加单测。原有单测用的是猜的格式，已换成平台真实格式 |
| 「刚上传、仍在处理的视频可能被删除跳过，稍后重试」 | 不成立。还在转码的视频照常删除，一次成功；`skipped` 里只会有平台不认识的 vid | CLI 的警告改成「平台不认识这些 ID」，不再建议重试；11.3 的对应说法已更正 |
| 整批 vid 都不认识时，CLI 只输出平台原话 `all vids illegal` | 平台整批拒绝，什么都不删。`--strict` 下混有不认识的 vid 时拒绝为 `illegal vids`，同样什么都不删 | 两种情况各给一句说明和下一步（核对 ID，或去掉 `--strict`） |
| 分片续传完成后返回的 `title` 是这次调用给的 | 续传完成的是中断前已登记的那个视频，平台上的标题是上一次的 | SDK 返回平台上的标题；CLI 在续传时提示标题、简介、分类、标签沿用上一次的 |
| `upload task-export` 输出到 stdout | 按「行」输出：空 CSV 时多一个换行，非空时末尾多一个空行 | stdout 与平台给的内容一致；导出为空时在 stderr 说明原因 |

顺带确认的平台行为，已写进 `CLAUDE.md`：

- URL 上传任务导出的 CSV **没有表头**，每个抓取成功的视频一行：`源地址,标题,视频ID,上传时间`。任务未结束时导出为空；任务里的地址全部抓取失败时，任务结束（`taskstatus=FINISHED`）后也为空。官方文档示例里的地址 `oss.polyv.net/uploads/2023/12/27YlLZVCM_test.mp4` 已经解析不出域名，不能用来测试。
- `category list <不存在的 ID>` 报 `cataId不存在`；`category delete <不存在的 ID>` 报 `cataid is not belong to userid …`；根分类（`1`）不能删。
- 分类树里每个分类的 `videos` 是整棵子树的视频数：视频只放在孙分类里时，它和它的父分类、祖父分类都显示 `1`。

另外修了一处 SDK 集成测试自身的问题：`real-api.test.ts` 用 `workDir ??= …` 建临时目录，而 `workDir` 的初始值是空字符串，`??=` 对它不起作用，于是两个 248 KB 的测试视频被写进了 `packages/vod-sdk/` 目录且没有清理。已改成 `||=`，并在复跑后确认包目录和临时目录都没有残留。

**验证「没有凭证时跳过」时又查出两处。** 这条路径之前在两个包里都没有实际验证过：

| 问题 | 原因 | 改动 |
|---|---|---|
| 没有凭证时，CLI 的真实账号测试文件**失败**而不是跳过（CI 新加的那一步会直接红）；SDK 的 `real-api.test.ts` 同样如此，而且从写出来起就是这样，所以第 7 节「无凭证自动跳过」对它一直不成立 | Jest 和 Vitest 的 `describe.skip` **都会执行用例组的函数体**（为了收集里面的用例再标成跳过），函数体一进来就用到凭证，于是抛错。另外文件里一条用例都没有也算失败 | 两个文件开头加守卫：没有凭证时注册一条显式跳过的用例然后返回。把 `.env.test` 挪开后实测，两个包都正确跳过（CLI：1 条跳过 + 17 条通过；SDK：两个文件 4 条全跳过），退出码为 0 |
| `typecheck` 实际上**没有检查任何测试文件**：两个包的 `tsconfig.test.json` 都继承了基础配置里的 `exclude`（`**/*.test.ts`、`src/__tests__`），CLI 检查到的测试文件是 0 个，SDK 也是 0 个。`CLAUDE.md` 里「typecheck 包含测试」的说法从一开始就不准确 | `tsc --listFilesOnly` 显示匹配数 | 两个 `tsconfig.test.json` 覆盖 `exclude`。第一次真正检查测试文件就暴露出 CLI 6 个、SDK 9 个类型错误（都是测试代码自己的类型问题：传了运行时会被忽略的参数、局部变量推断出的 Buffer 类型过窄、`selectStorage` 的参数类型要求了它并不读取的字段、集成测试里 `string \| undefined` 直接传给了必填项），已全部修正 |

顺带补全了 SDK 的 `SyncTask` 类型：加上文档里有而类型里缺的 `status`、`createtime`，以及平台会返回但文档没有的 `taskstatus`（`SYNCHRONIZING` / `FINISHED`，表示任务是否结束）。

### 12.8 skill 写操作示例的原样演练（2026-11-25）

12.4 曾记「写操作示例未逐条演练」，现已做完。从 skill 的 23 个写操作示例块原样抽出 57 条命令（含块内的只读伴随命令），`<占位符>` 换成测试账号里的真实值、本地文件名（`./intro.mp4` 等）保持原样、`--source codex` 保持原样、`<CLI>` 用本地构建产物（发布前 npx 形式无从验证），逐条执行并核对文档对输出的声明。固定装置（SDK 上传的已发布视频、分类、中断的分片上传、URL 任务）结束时全部删除并逐个核实，账号回到基线（14 视频 / 21 分类节点 / 0 任务 / 回调空）。

最终一轮 **0 失败**。查出的文档更正：

| 文档说法 | 实测 | 更正 |
|---|---|---|
| 「恢复后的视频状态码为 61」（videos.md、task-routing.md） | 三次恢复：两次返回 `60`、一次返回 `61`。「已发布」是稳定事实，具体码不是 | 改为「回到已发布（状态码 60 或 61，都是可播放）」；SDK 集成测试的注释同步 |
| `category setting --player-id <播放器ID>` 示例 | 不存在的播放器 ID 平台拒绝：`❌ 播放器id参数有误` | 表格里写明 ID 要用点播后台「播放器管理」里的真实播放器 ID；去掉 `--player-id` 的同款示例可正常执行 |
| 续传状态「按源文件路径区分」（upload.md） | 断点文件名由路径字符串算出：macOS 上 `/tmp` 是 `/private/tmp` 的别名，同一文件用两种写法就是两个断点 | 补一句：以路径的实际写法为准，不同写法不算同一个进度 |

其余声明逐条与实际行为一致：删除的 JSON 形状与两种拒绝的提示、`video recover` / `ban` / `unban` / `move`、分类的增删改移设置、`callback set` 前后的输出与离线验签、账号的保存 / 切换 / 删除、`upload file --wait` 的 JSON、分片上传与 `upload abort`、URL 任务与导出。SKILL.md 的优先级描述（flags > `--account` > `use` > 环境变量 > 默认账号）也用环境变量与账号并存的场景验证过。

前两轮的失败都是演练装置自身的 bug（异步钩子未等待导致清理阶段崩溃、成功命令的 stderr 未捕获、退出码检查漏了预期失败的步骤），与 CLI 无关，已在第三轮修正。
