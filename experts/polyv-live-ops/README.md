# polyv-live-ops（保利威直播运营专家）

WorkBuddy 专家包：以「保利威直播运营专家」的角色入口，通过内置的
[polyv-live-cli skill](../../skills/polyv-live-cli/)（Bash 驱动 `npx --yes polyv-live-cli@latest`）
帮助用户完成直播运营工作——频道管理、推流与开播状态、观看数据复盘、商品与优惠券、电商开播检查等。

## 目录结构

```text
polyv-live-ops/
├── .codebuddy-plugin/
│   └── plugin.json          # 专家元信息（市场展示 + agent 挂载）
├── agents/
│   └── polyv-live-ops.md    # 系统提示词（角色/认证引导/playbook/安全规则）
├── avatars/
│   └── expert.png           # 512×512 头像（当前为占位图，正式头像请替换）
├── skills/
│   └── polyv-live-cli/      # 内置技能（与仓库 skills/polyv-live-cli 保持同步）
└── README.md
```

## 打包上传

```bash
cd experts/polyv-live-ops
zip -r ../polyv-live-ops.zip . -x "*.DS_Store"
```

在 WorkBuddy 开放平台提交 `polyv-live-ops.zip`，审核通过后进入专家市场（通常 10~15 分钟生效）。

**⚠️ 版本号规则**：平台要求每次重新提交的 `plugin.json` `version` 必须严格大于线上最新版本
（重复提交 1.0.0 会被拒绝：「包内版本号必须大于当前最新版本」）。内容有更新时先递增版本号再打包。

## 注意事项

- **头像**：`avatars/expert.png` 当前是占位图，上架前请替换为正式的 512×512 PNG（≤500KB，统一插画风格）。
- **skill 同步**：包内的 `skills/polyv-live-cli` 来自仓库根的 `skills/polyv-live-cli`，修改根 skill 后需要重新同步：

  ```bash
  rsync -a --delete --exclude='.DS_Store' skills/polyv-live-cli/ experts/polyv-live-ops/skills/polyv-live-cli/
  ```

- **本地校验**：提交前运行 `node scripts/check-workbuddy-expert.mjs` 检查格式约束（displayDescription 中文字数 40-50、3 个 tags/quickPrompts、defaultInitPrompt 一致性、头像规格、agent frontmatter 等）。
- **升级为依赖连接器的版本**：连接器上架后，在 plugin.json 中加
  `"dependencies": { "connectors": ["polyv-live"] }`，即可获得「召唤前引导安装 CLI 并认证」的完整体验。
