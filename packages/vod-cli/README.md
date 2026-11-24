# polyv-vod-cli

保利威云点播的命令行工具。为 AI Agent 和自动化场景设计：每个命令都有完整帮助，支持 JSON 输出，错误信息带解决建议。

基于 [polyv-vod-api-sdk](https://www.npmjs.com/package/polyv-vod-api-sdk)。

## 安装

```bash
npm install -g polyv-vod-cli
polyv-vod-cli --help
```

或直接运行：

```bash
npx --yes polyv-vod-cli@latest --help
```

要求 Node.js 18 或更高。

## 配置凭证

点播用 `userId`、`secretKey` 和 `writeToken`，在云点播后台的「设置 → API接口」获取。它们与直播 CLI 的 `appId` / `appSecret` 不通用。

```bash
# 保存账号并设为默认
polyv-vod-cli account add myaccount --user-id <userId> --secret-key <secretKey> --write-token <writeToken> --default

# 查看当前用的是哪个账号（不显示密钥）
polyv-vod-cli account current
```

凭证按以下顺序查找，先找到的生效：命令行参数（`--userId` + `--secretKey`）、`--account <账号名>`、`use` 选定的账号、环境变量（`POLYV_VOD_USER_ID` + `POLYV_VOD_SECRET_KEY`）、默认账号。

账号保存在 `~/.polyv-vod/`，密钥加密存储，与直播 CLI 的配置分开。

## --source

除 `account`、`use`、`auth`、`callback verify` 和 `--help`、`--version` 外，每条命令都必须带 `--source <标识>`。它标明调用方，用于平台侧统计；不带时命令不执行。

标识是小写字母、数字、连字符，不超过 32 个字符。官方平台连接器传平台名（如 `--source workbuddy`），其它程序传自己的名字（如 `--source codex`）。

## 常用命令

```bash
# 上传并等转码完成，输出 JSON
polyv-vod-cli upload file ./intro.mp4 --wait -o json --source codex

# 搜索视频
polyv-vod-cli video search --title 关键词 --page-size 50 -o json --source codex

# 查看视频详情（含播放地址）
polyv-vod-cli video get <视频ID> -o json --source codex

# 改标题
polyv-vod-cli video update <视频ID> --title "新标题" --force --source codex

# 查看分类树
polyv-vod-cli category list --source codex

# 播放排行
polyv-vod-cli stats rank --dr 7days --source codex

# 生成加密视频的播放凭证
polyv-vod-cli play token --vid <视频ID> --viewer-id <观看者ID> --source codex
```

## 命令

| 命令 | 说明 |
|---|---|
| `video` | 搜索、详情、修改、删除、恢复、移动分类、禁播与解禁、时长大小、等转码完成 |
| `category` | 分类树、新建、改名、设置、移动、删除 |
| `upload` | 本地上传、按 URL 上传、同步任务、放弃中断的上传 |
| `play token` | 加密视频的播放凭证 |
| `stats` | 空间与流量、播放量趋势、播放排行、观看日志 |
| `callback` | 回调地址的查询与设置、校验回调签名 |
| `account` | 保存、列出、移除账号，设置默认账号 |
| `use` | 切换当前会话使用的账号 |
| `auth` | 平台连接器的认证流程（指引、状态、登出） |

运行 `polyv-vod-cli <命令> --help` 查看参数。

## 输出

- 结果输出到 stdout。加 `-o json` 输出 JSON，便于程序处理。
- 进度和错误输出到 stderr，所以 JSON 输出可以直接解析。
- 退出码：成功 `0`；失败、被拒绝、或 `video wait` 没等到发布为 `1`。

## 会改变平台状态的命令

修改、删除、移动、禁播等命令在不带 `--force` 时会拒绝执行（没有终端可供确认）。用户明确授权后再加上 `--force`：

```bash
polyv-vod-cli video delete <视频ID> --force --source codex
```

`video delete` 默认进回收站，可以用 `video recover` 恢复。`--permanent` 彻底删除，不可恢复。

**删除的退出码为 0 不代表全部删除成功。** 加 `-o json`，检查输出里的 `skipped`：这些是平台没能删除的视频（不存在、已删除或仍在处理中）。

```bash
polyv-vod-cli video delete <视频ID1> <视频ID2> --force -o json --source codex
# { "deleted": ["…_4"], "skipped": ["…_7"] }
```

## 上传

- 2 GB 以内的文件一次请求直传。更大的文件自动改用分片续传。
- 分片续传中断后，重跑同一条命令即可从断点继续。
- 上传成功只表示文件已送达，平台随后转码。小视频约 80 秒后可播放，大视频更久。用 `--wait` 或 `video wait` 等待。

```bash
# 从公网网址拉取视频
polyv-vod-cli upload url --upload-infos '[{"fileUrl":"https://example.com/a.mp4","title":"视频A"}]' --force --source codex

# 放弃一次中断的分片上传
polyv-vod-cli upload abort ./movie.mp4 --force --source codex
```

## AI Agent Skill

仓库提供官方 Skill，让 AI Agent 学会使用本工具：[`skills/polyv-vod-cli`](https://github.com/polyv/polyv-live-cli/tree/main/skills/polyv-vod-cli)。

```bash
npx skills add polyv/polyv-live-cli --skill polyv-vod-cli
```

## 开发

```bash
pnpm --filter polyv-vod-cli build     # 构建
pnpm --filter polyv-vod-cli test:unit # 单元测试
node packages/vod-cli/dist/index.js --help
```

## License

MIT
