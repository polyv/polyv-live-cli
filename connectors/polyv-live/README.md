# polyv-live 连接器（CLI + Skill）

WorkBuddy 连接器：以 CLI + Skill 方式接入保利威云直播。WorkBuddy 负责安装并托管
`polyv-live-cli`（npm 发布版）的运行时；用户通过 `auth` 命令完成凭证配置；AI 依据内置
skill 驱动 CLI 完成直播频道、推流、回放、商品、优惠券、观看数据等全量运营能力。

## 目录结构

```text
polyv-live/
├── connector-meta.json      # 连接器元信息（type: cli, source: polyv-live）
├── cli.json                 # init / auth / unAuth / status 命令与 runtime 声明
├── icon.png                 # 市场图标（64×64，保利威官方标识）
├── skills/
│   └── polyv-live/          # AI 使用说明（SKILL.md + references/）
│       ├── SKILL.md
│       └── references/
└── README.md
```

## 认证说明

- `polyv-live-cli auth`：10 秒内输出官方「获取密钥」指引页 URL（WorkBuddy 自动打开浏览器），
  并打印可复制的 `account add workbuddy ...` 配置命令；不进行交互式输入。
- `polyv-live-cli auth status`：无副作用检查；输出 `Logged in` 时 WorkBuddy 视为已连接
  （cli.json `statusMatch`）。
- `polyv-live-cli auth logout`：移除连接器专用账号 `workbuddy`（不影响其它账号），未登录时也正常返回。
- 凭证由 CLI 自行加密存储（与安装目录分离），不在任何连接器文件中出现。

## 打包提交

```bash
cd connectors/polyv-live
zip -r ../polyv-live.zip . -x "*.DS_Store"
```

在 WorkBuddy 开放平台提交 `polyv-live.zip`，审核通过后进入连接器市场（通常 10~15 分钟生效）。

## 版本要求

- `minWorkbuddyVersion: 4.24.0`（examples 双语、versionCheck、statusMatch 等字段的最低版本）。
- `cli.json` 的 `versionCheck: 1.4.0`：要求 CLI 具备 `auth` 命令组（1.4.0 引入），版本过低时
  WorkBuddy 会重新执行安装。

## skill 同步

包内 `skills/polyv-live/` 源自仓库根 `skills/polyv-live-cli`，修改根 skill 后需重新同步并
按本连接器的「CLI 前缀」（`polyv-live-cli`）与「连接与认证」章节校对差异：

```bash
rsync -a --delete skills/polyv-live-cli/references/ connectors/polyv-live/skills/polyv-live/references/
```
