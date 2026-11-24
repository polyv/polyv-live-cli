# polyv-vod 连接器（CLI + Skill）

WorkBuddy 连接器：以 CLI + Skill 方式接入保利威云点播。WorkBuddy 负责安装并托管
`polyv-vod-cli`（npm 发布版）的运行时；用户通过 `auth` 命令完成凭证配置；AI 依据内置
skill 驱动 CLI 完成视频上传与转码等待、视频与分类管理、播放凭证、播放统计、事件回调等能力。

## 目录结构

```text
polyv-vod/
├── connector-meta.json      # 连接器元信息（type: cli, source: polyv-vod）
├── cli.json                 # init / auth / unAuth / status 命令与 runtime 声明
├── icon.png                 # 市场图标（64×64，保利威官方标识）
├── skills/
│   └── polyv-vod/           # AI 使用说明（SKILL.md + references/），由脚本从仓库根 skill 生成
│       ├── SKILL.md
│       └── references/
└── README.md
```

## 认证说明

- `polyv-vod-cli auth`：10 秒内输出官方「获取密钥」指引页 URL（WorkBuddy 自动打开浏览器），
  并打印可复制的 `account add workbuddy ...` 配置命令；不进行交互式输入。
- `polyv-vod-cli auth status`：无副作用检查；输出 `Logged in` 时 WorkBuddy 视为已连接
  （cli.json `statusMatch`）。
- `polyv-vod-cli auth logout`：移除连接器专用账号 `workbuddy`（不影响其它账号），未登录时也正常返回。
- 凭证由 CLI 自行加密存储在 `~/.polyv-vod/`（与安装目录、与直播 CLI 的 `~/.polyv` 分开），
  不在任何连接器文件中出现。

点播凭证与直播是两套：点播用 `userId / secretKey / writeToken`，直播用 `appId / appSecret`。
已安装 `polyv-live` 连接器的用户仍需为点播单独配置凭证。

## 打包提交

```bash
cd connectors/polyv-vod
zip -r ../polyv-vod.zip . -x "*.DS_Store"
```

在 WorkBuddy 开放平台提交 `polyv-vod.zip`，审核通过后进入连接器市场。

## 版本要求

- `minWorkbuddyVersion: 4.24.0`（examples 双语、versionCheck、statusMatch 等字段的最低版本）。
- `cli.json` 的 `versionCheck`：通过 `polyv-vod-cli --version` 读取本机版本，`minVersion: 0.1.0`
  是具备 `auth` 命令组的第一个版本，版本过低时 WorkBuddy 会重新执行安装。
- `polyv-vod-cli` 尚未发布到 npm。上架本连接器前要先发布 CLI，否则 `init` 的安装会失败。

## skill 同步

包内 `skills/polyv-vod/` 由仓库根 `skills/polyv-vod-cli` 生成，**不要手工编辑**。连接器把 CLI
全局安装，所以生成时把 `<CLI>` 的定义从 npx 形式改成 `polyv-vod-cli`，并加上「连接与认证」
章节。修改根 skill 后重新生成：

```bash
node scripts/sync-packaged-skills.mjs
```

检查 packaged 副本是否与根 skill 一致（CI 用）：

```bash
node scripts/sync-packaged-skills.mjs --check
```
