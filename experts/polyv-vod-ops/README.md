# polyv-vod-ops（保利威点播运营专家）

WorkBuddy 专家包：以「保利威点播运营专家」的角色入口，通过内置的
[polyv-vod-cli skill](../../skills/polyv-vod-cli/)（Bash 驱动 `npx --yes polyv-vod-cli@latest`）
帮助用户完成点播运营工作——上传视频并等待转码、视频与分类管理、播放凭证、空间流量与播放数据复盘。

## 目录结构

```text
polyv-vod-ops/
├── .codebuddy-plugin/
│   └── plugin.json          # 专家元信息（市场展示 + agent 挂载）
├── agents/
│   └── polyv-vod-ops.md     # 系统提示词（角色/认证引导/playbook/安全规则）
├── avatars/
│   └── expert.png           # 512×512 头像（当前沿用直播专家的占位图，正式头像请替换）
├── skills/
│   └── polyv-vod-cli/       # 内置技能（由脚本从仓库 skills/polyv-vod-cli 拷贝）
└── README.md
```

## 打包上传

```bash
cd experts/polyv-vod-ops
zip -r ../polyv-vod-ops.zip . -x "*.DS_Store"
```

在 WorkBuddy 开放平台提交 `polyv-vod-ops.zip`，审核通过后进入专家市场。

**⚠️ 版本号规则**：平台要求每次重新提交的 `plugin.json` `version` 必须严格大于线上最新版本
（重复提交同一个版本号会被拒绝）。内容有更新时先递增版本号再打包。

## 注意事项

- **依赖未发布的包**：专家通过 `npx --yes polyv-vod-cli@latest` 运行 CLI。`polyv-vod-cli` 尚未发布到 npm，
  上架本专家前要先发布 CLI，否则专家无法执行任何命令。
- **头像**：`avatars/expert.png` 当前沿用直播专家的占位图，上架前请替换为正式的 512×512 PNG（≤500KB，统一插画风格）。
- **skill 同步**：包内的 `skills/polyv-vod-cli` 是仓库根 `skills/polyv-vod-cli` 的逐字节拷贝，由脚本生成，**不要手工编辑**。
  修改根 skill 后重新生成：

  ```bash
  node scripts/sync-packaged-skills.mjs
  ```

- **本地校验**：提交前运行 `node scripts/check-workbuddy-expert.mjs experts/polyv-vod-ops` 检查格式约束
  （displayDescription 中文字数 40-50、3 个 tags/quickPrompts、defaultInitPrompt 一致性、头像规格、agent frontmatter 等）。
- **升级为依赖连接器的版本**：连接器 `polyv-vod` 上架后，在 plugin.json 中加
  `"dependencies": { "connectors": ["polyv-vod"] }`，即可获得「召唤前引导安装 CLI 并认证」的完整体验。
  那时 agent 的命令前缀要从 npx 形式改成已安装的 `polyv-vod-cli`，与连接器内 skill 的写法保持一致。
- **与直播专家的关系**：两个专家各自独立，凭证不通用。`polyv-live-ops` 管直播，`polyv-vod-ops` 管点播。
