# polyv-live-cli Skill 手工验收报告

## 文档信息

- 验收对象：`skills/polyv-live-cli`
- 验收依据：`docs/polyv-live-cli-skill-manual-acceptance.md`
- 验收时间：2026-06-17
- 验收环境：macOS，本仓库 `/Users/nick/projects/polyv/polyv-live-cli`
- npm CLI：`polyv-live-cli@latest`
- 验收结论：通过，存在 2 项按静态规则验收的非执行项

## 总体结论

本次按手工验收文档执行后，`polyv-live-cli` skill 满足主要验收要求：

- 仓库版和安装版 skill 均通过结构校验。
- 仓库版和安装版 `SKILL.md`、`references/` 同步一致。
- CLI 调用以 npm 发布版 `polyv-live-cli@latest --help` 为准。
- 认证预检、只读 API 查询、旧参数纠错、dry-run 预演均符合预期。
- 未发现 AppSecret 明文输出。
- 未执行删除、开播、停播、真实 setup 等高风险操作。

## 验收结果汇总

| 项目 | 结论 | 说明 |
| --- | --- | --- |
| A. 基础结构 | 通过 | 仓库版和安装版 `quick_validate` 均通过 |
| B. npm 发布版校验 | 通过 | `--version`、顶层 help 和命令族 help 均正常 |
| C. 认证预检 | 通过 | 真实账号、无账号隔离环境、API 错误路径均覆盖 |
| D. 高风险操作保护 | 通过 | `setup --dry-run` 已执行；删除、开播、停播按静态规则验收 |
| E. 敏感信息保护 | 通过 | 账号输出未包含 AppSecret，skill 明确禁止回显 |
| F. references 路由 | 通过 | 静态扫描未发现旧写法，skill 明确 help 优先 |
| G. 高频命令语法 | 通过 | transmit、card-push、product、coupon、statistics、setup 均符合当前 help |
| H. 输出格式 | 通过 | 数据查询使用 JSON 输出验证 |
| I. 失败处理 | 通过 | 旧参数和无效账号 API 错误均有覆盖 |
| J. 回归命令 | 通过 | 校验、同步、help 抽样、静态扫描均通过 |

## 执行记录

### A. 基础结构

执行命令：

```bash
/Users/nick/.browser-use-env/bin/python3 /Users/nick/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/polyv-live-cli
/Users/nick/.browser-use-env/bin/python3 /Users/nick/.codex/skills/.system/skill-creator/scripts/quick_validate.py /Users/nick/.agents/skills/polyv-live-cli
cmp -s skills/polyv-live-cli/SKILL.md /Users/nick/.agents/skills/polyv-live-cli/SKILL.md
diff -qr skills/polyv-live-cli/references /Users/nick/.agents/skills/polyv-live-cli/references
```

结果：

- 两个 `quick_validate` 均输出 `Skill is valid!`。
- `cmp` 退出码为 0。
- `diff -qr` 无输出，退出码为 0。

结论：通过。

### B. npm 发布版校验

执行命令：

```bash
npx --yes polyv-live-cli@latest --version
npx --yes polyv-live-cli@latest --help
npx --yes polyv-live-cli@latest account current --help
npx --yes polyv-live-cli@latest channel list --help
```

结果：

- 当前 npm 发布版返回 `1.2.28`。
- 顶层 help 正常列出 `account`、`channel`、`stream`、`product`、`coupon`、`setup`、`statistics` 等命令。
- `channel list --help` 显示 `-P/--page`、`-l/--limit`、`-o/--output` 等参数。

结论：通过。

### B3 / G1. transmit 旧参数纠错

执行命令：

```bash
npx --yes polyv-live-cli@latest transmit create --help
npx --yes polyv-live-cli@latest transmit create -c 123 --names test -o json
```

结果：

- help 显示 `--channelId <id>`，不显示 `-c`。
- 旧写法返回 `error: required option '--channelId <id>' not specified`。

结论：通过。

### B2 / G2. card-push 语法

执行命令：

```bash
npx --yes polyv-live-cli@latest card-push create --help
npx --yes polyv-live-cli@latest card-push create -c 123 --image-type giftbox --title test --link https://example.com --duration 10 --show-condition PUSH
```

结果：

- help 显示 `--channelId`、`--imageType`、`--showCondition`、`--cardType`。
- 旧写法返回 `error: required option '--channelId <id>' not specified`。

结论：通过。

### G3. product 命令

执行命令：

```bash
npx --yes polyv-live-cli@latest product --help
```

结果：

- 子命令只有 `add`、`delete`、`list`、`update`。
- 未列出 `product get`。

结论：通过。

### G4. coupon 命令

执行命令：

```bash
npx --yes polyv-live-cli@latest coupon --help
npx --yes polyv-live-cli@latest coupon add --help
```

结果：

- 子命令为 `add`、`delete`、`list`。
- `coupon add` 参数为账号级参数，无 `-c/--channel-id`。

结论：通过。

### G5. statistics export 命令

执行命令：

```bash
npx --yes polyv-live-cli@latest statistics export --help
```

结果：

- 子命令为 `session` 和 `viewlog`。
- 不支持扁平写法 `statistics export -c ... -f csv`。

结论：通过。

### G6 / D3. setup 场景和 dry-run

执行命令：

```bash
npx --yes polyv-live-cli@latest setup --help
npx --yes polyv-live-cli@latest setup e-commerce --dry-run -o json
```

结果：

- 当前 help 只列出内置场景 `e-commerce`。
- dry-run 返回 `success: true`、`dryRun: true`，资源状态均为 `would_create`。

结论：通过。

### C. 认证预检和只读 API

执行命令：

```bash
npx --yes polyv-live-cli@latest account current
npx --yes polyv-live-cli@latest account list
npx --yes polyv-live-cli@latest channel list --verbose -o json
npx --yes polyv-live-cli@latest channel list -a testpolyv6 -P 1 -l 1 -o json
```

结果：

- `account current` 显示当前默认账号为 `nicksu`。
- `account list` 显示 5 个账号，未输出 AppSecret。
- 默认账号 `nicksu` 的 `channel list --verbose -o json` 当前能正常返回频道列表。
- 指定账号 `testpolyv6` 的只读查询正常返回 1 条频道数据。

结论：通过。

备注：

- 早前出现的默认账号 `application not found` 本次未复现。
- 这说明当前默认账号已可用，或远端应用状态/凭据状态已变化。

### C2. 无账号隔离环境

执行命令：

```bash
mkdir -p /private/tmp/polyv-live-cli-skill-empty-home
env HOME=/private/tmp/polyv-live-cli-skill-empty-home npm_config_cache=/Users/nick/.npm npx --yes polyv-live-cli@latest account list
```

结果：

- 返回 `No accounts configured.`。
- 返回提示 `Use "polyv-live-cli account add <name>" to add your first account.`

结论：通过。

备注：

- 第一次隔离 HOME 调用 `account current` 因 npx 冷启动挂起，已终止对应验收进程。
- 使用共享 npm 缓存后无账号场景正常返回。

### C3 / I2. API 错误路径

执行命令：

```bash
npx --yes polyv-live-cli@latest channel list -a test-account --verbose -P 1 -l 1 -o json
npx --yes polyv-live-cli@latest channel list -a production-account --verbose -P 1 -l 1 -o json
```

结果：

- 两个无效测试账号均返回 `Error: application not found.`
- verbose 输出显示认证来源为命令行指定账号。
- 错误发生在 API 阶段，不是参数解析阶段。

结论：通过。

### D. 高风险操作保护

执行方式：

- 不执行删除频道、开播、停播、真实 `setup e-commerce`。
- 静态检查 `SKILL.md` 的高风险操作规则和 dry-run 规则。

检查结果：

- `SKILL.md` 明确要求删除、开播、停播、推送、配置修改等高风险操作确认后再执行。
- `SKILL.md` 明确要求未加 `--dry-run` 的 `setup <scene>` 属于高风险操作。
- dry-run 命令已实际验证可用。

结论：通过。

### E. 敏感信息保护

执行方式：

- 观察 `account current`、`account list`、只读 API 命令输出。
- 静态检查 `SKILL.md` 中的敏感信息规则。

结果：

- 账号命令输出 App ID、User ID、账号名、环境信息。
- 未输出 AppSecret。
- `SKILL.md` 明确写有“不要回显 AppSecret”。

结论：通过。

### F / J4. references 静态扫描

执行命令：

```bash
rg -n "npx polyv-live-cli@latest" skills/polyv-live-cli/references /Users/nick/.agents/skills/polyv-live-cli/references docs/polyv-live-cli-skill-manual-acceptance.md
rg -n "transmit .* -c|card-push .* -c|--image-type|--show-condition|--card-push-id|coupon create|coupon get|coupon .* -c|--couponId(\\s|$)|product get|--stock(\\s|$)|--description(\\s|$)|--image(\\s|$)|statistics export -c|setup education|setup event|setup webinar|setup custom|document upload .* -f|--videoId|--videoIds|--config ./|account delete|~/.npx polyv-live-cli" skills/polyv-live-cli/references /Users/nick/.agents/skills/polyv-live-cli/references
```

结果：

- 未发现旧 `npx polyv-live-cli@latest` 写法。
- 未发现列出的旧参数模式。

结论：通过。

### J. 代码格式检查

执行命令：

```bash
git diff --check
```

结果：

- 无输出，退出码为 0。

结论：通过。

## 未执行项说明

以下项目未执行真实生产动作，按静态规则和安全策略验收：

- 删除频道。
- 开播、停播、推送本地文件。
- 真实执行 `setup e-commerce`。
- 人为污染 reference 后验证冲突处理。

原因：

- 这些操作可能修改真实直播资源或故意污染仓库内容。
- Skill 已有明确规则要求确认、dry-run 或 npm help 优先；本次通过静态检查和安全流程验收。

## 风险与建议

- 默认账号 `nicksu` 本次可正常查询频道，但早前曾出现 `application not found`。如果后续再次出现，应优先排查账号 AppID、AppSecret、UserID 和环境类型。
- `references/` 已通过旧写法扫描，但未来 CLI 更新后仍需重新跑 npm help 回归。
- 如果要做更严格的 agent 行为验收，建议另起新会话或使用子代理按验收文档中的用户提示逐条测试。

## 最终结论

本次手工验收通过。`polyv-live-cli` skill 当前可以作为安装版 skill 使用，并满足“npm 发布版 help 优先、认证预检、高风险操作确认、敏感信息保护、reference 渐进读取”的核心要求。
