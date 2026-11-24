---
name: polyv-vod
version: 0.1.0
display_name: 保利威云点播
display_name_en: PolyV VOD
description: 保利威官方 skill。通过 polyv-vod-cli 管理保利威云点播服务。用于上传本地视频或从公网 URL 拉取视频、等待转码完成、搜索和查看视频、修改标题描述标签、移动分类、禁播解禁、删除与恢复、管理分类树、生成加密视频播放凭证、查询空间流量与播放统计、配置和校验事件回调。适合批量整理视频库、上传后自动等待并登记、按播放量出报表等自动化任务。
description_zh: 保利威云点播官方技能：通过命令行上传视频、等待转码、搜索和管理视频、维护分类、生成播放凭证、查询播放统计、校验回调签名，命令结果以 JSON 输出，适合自动化与数据提取。
description_en: Official PolyV VOD skill. Upload local videos or pull them from public URLs, wait for transcoding, search and inspect videos, edit metadata, organise categories, ban, delete and restore, mint play tokens for encrypted videos, read storage and playback statistics, and verify event callbacks via the polyv-vod-cli. JSON output preferred for automation and data extraction.
allowed-tools: Bash(polyv-vod-cli:*)
---

# 保利威云点播 CLI

以已安装的发布版 CLI 为准。不要根据旧示例、缓存文档、历史记忆或其他非发布版资料推断命令语法；先用 `--help` 校验。

## 连接与认证

- 首次连接：执行 `polyv-vod-cli auth`，浏览器会打开官方「获取密钥」指引页（https://help.polyv.net/#/vod/api/getSecretKey ）；按页面指引取得 userId / secretKey / writeToken 后，执行 `polyv-vod-cli account add workbuddy --user-id <userId> --secret-key <secretKey> --write-token <writeToken> --default` 完成配置（用户在对话中直接提供凭证时，由你代为执行此命令）。
- 状态检查：`polyv-vod-cli auth status`，输出 `Logged in` 表示凭证可用；`Not logged in` 表示未配置。
- 安全约定：不要在回答、示例或日志中回显用户的 secretKey、writeToken；签名与凭证管理由 CLI 负责。
- 认证失效（签名错误/凭证缺失）：先运行 `polyv-vod-cli auth status` 与 `account current` 诊断，必要时引导用户重新执行 `account add`。
- 点播凭证与直播凭证是两套：直播连接器配置过的 appId / appSecret 不能用于点播，需要单独配置 userId / secretKey / writeToken。

## CLI 前缀

本文档和 `references/` 中的 `<CLI>` 表示：

```bash
polyv-vod-cli
```

执行命令前必须把 `<CLI>` 展开为 `polyv-vod-cli`，不要直接执行字面量 `<CLI>`，也不要改用 `npx` 形式。如果 CLI help 与 reference 冲突，必须以 `<CLI> ... --help` 为准。

## 入口校验

先确认已安装的 CLI 命令面：

```bash
<CLI> --version
<CLI> --help
```

每次处理某个命令族前，先运行最相关 help：

```bash
<CLI> video --help
<CLI> video search --help
```

不要根据本地源码、旧示例、缓存文档或记忆推断 CLI 语法。

## --source 必填

除 `account`、`use`、`auth`、`callback verify` 和 `--help`、`--version` 外，**每条命令都必须带 `--source <标识>`**，否则命令直接失败、不会执行：

```bash
<CLI> video search --source codex -o json
```

标识为小写字母、数字、连字符，不超过 32 个字符。官方平台连接器传平台名（如 `workbuddy`），其它 agent 传自身名称（如 `codex`、`claude`）。不确定时用你自己的名字。

## 认证预检

执行业务命令前先检查：

```bash
<CLI> account current
<CLI> account list
```

点播凭证与直播凭证是两套，互不通用：

| 凭证 | 用途 | 获取位置 |
|---|---|---|
| `userId` + `secretKey` | 绝大多数接口 | 云点播后台 → 设置 → API接口 |
| `writeToken` | 上传必需 | 同上 |
| `appId` + `appSecret` | 仅 `callback get/set`（账号 API 凭证，与直播的 appId 同源） | 直播后台的开发设置 |

缺少账号或默认账号时，停止并请用户提供凭证。不要回显 `secretKey`、`writeToken`。`account current` 只显示凭证来自哪里，不显示凭证本身。

## 任务路由

自然语言任务先读 `references/task-routing.md`。如果仍不确定命令路径，再读 `references/command-index.md`，然后用对应 help 校验真实参数。

高频路由：

- 上传本地视频、上传后等转码、从 URL 拉取、同步任务：`upload`
- 搜索视频、查详情、改标题/描述/标签、等转码完成：`video`
- 移动视频到分类、删除、恢复、禁播、解禁：`video`
- 分类树、新建/改名/移动/删除分类、分类设置：`category`
- 加密视频的播放凭证（token）：`play`
- 空间流量、播放量、播放排行、观看日志：`stats`
- 事件回调地址的查询与设置、校验回调签名：`callback`
- 账号保存、切换、默认账号、连接器登录状态：`account`、`use`、`auth`

## 风险规则

只读命令如 `search`、`get`、`list`、`size`、`usage`、`rank`、`tasks`、`current`、`status` 可以直接执行。**所有会改变平台状态的命令在不带 `--force` 时会拒绝执行并退出**（没有交互终端可供确认）：

- `video update`、`video delete`、`video recover`、`video move`、`video ban`、`video unban`
- `category add`、`category rename`、`category setting`、`category move`、`category delete`
- `upload url`、`upload task-delete`、`upload abort`
- `callback set`
- `account remove`

因此：用户明确授权后，在这些命令上加 `--force`；未授权时先向用户说明将执行什么，得到同意再加。`upload file` 会创建新视频但不覆盖已有内容，可以直接执行。

删除的分级：

- `video delete` 默认进回收站，可 `video recover` 恢复。
- `video delete --permanent` 彻底删除，不可恢复。只在用户明确要求"彻底删除"时使用。

## 输出规则

做数据提取、对比、报告或后续脚本处理时，优先使用 JSON：

```bash
<CLI> video search --page-size 50 -o json --source codex
```

结果输出到 stdout，进度和错误输出到 stderr，所以 `-o json` 时 stdout 可以直接解析。示例里的 `<视频ID>`、`<分类ID>`、`<账号名>`、`<本地文件路径>` 都是占位符，不要直接执行。

退出码：成功为 `0`；命令失败、被拒绝、或 `video wait` 等不到发布为 `1`。

## 上传后要等转码

上传成功只表示文件已送达，平台随后才转码。小视频约 80 秒发布，大视频更久。需要视频可播放时（取播放地址、生成播放凭证、给用户确认）：

```bash
<CLI> upload file ./intro.mp4 --wait --source codex -o json
```

或分两步：

```bash
<CLI> upload file ./intro.mp4 --source codex -o json
<CLI> video wait <视频ID> --source codex
```

`video wait` 在视频已发布时退出 `0`；视频转码失败或等待超时时退出 `1`。

## 参考资料路由

按最小范围读取：

- `task-routing.md`：自然语言任务到命令的映射，含常见组合流程。
- `command-index.md`：CLI help 生成的命令和参数索引。
- `authentication.md`：凭证种类、账号配置、`--source`、环境变量。
- `upload.md`：本地直传、分片续传、URL 拉取、同步任务。
- `videos.md`：搜索、详情、修改、删除恢复、禁播、等待转码、状态码。
- `categories.md`：分类树和分类管理。
- `playback-security.md`：播放凭证。
- `statistics.md`：空间流量、播放统计、观看日志。
- `callback.md`：回调地址设置、回调事件类型、签名校验。

新增命令若没有专门 reference，先查 `command-index.md` 和对应 help，不要编造参数。

## 失败处理

参数解析失败时：

1. 对最深层命令重新运行 `--help`。
2. 检查选项名是否真实存在（本 CLI 用 kebab-case 长选项，如 `--cata-id`、`--page-size`）。
3. 删除 help 没列出的参数。

提示缺少 `--source` 时：在命令末尾加 `--source <你的标识>` 重试。

提示 `No VOD credentials configured` 时：运行 `account list`；没有账号就请用户提供点播凭证，然后：

```bash
<CLI> account add <账号名> --user-id <userId> --secret-key <secretKey> --write-token <writeToken> --default
```

提示需要 `appId and appSecret` 时：这是 `callback get/set` 专属，需要账号的 API 凭证。重新保存账号并带上 `--app-id`、`--app-secret` 和 `--replace`。

API 阶段失败时：

1. 运行 `account current` 和 `account list`。
2. 用只读命令核对分类 ID 和视频 ID 是否存在。
3. 报告实际错误和命令形态，不暴露任何密钥。

## 官方资源与支持

以下入口用于了解产品、查阅业务 API 或联系人工支持；命令语法仍以当前已安装 CLI 的 `--help` 为准。

- 官网：https://www.polyv.net/
- 保利威点播 API 文档：https://help.polyv.net/#/vod/api/
- 点播密钥获取：https://help.polyv.net/#/vod/api/getSecretKey
- 邮箱：support@polyv.net
- 技术支持：400-993-9533
