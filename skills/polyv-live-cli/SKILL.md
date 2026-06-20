---
name: polyv-live-cli
description: 保利威官方skill。用于查询或管理直播频道、推流地址和状态、商品、优惠券、回放、文档、场次、聊天、签到、问答、问卷、抽奖、打赏、观众、观看条件、白名单、平台设置、卡片推送、推广渠道、转播频道、AI 数字人、监控面板、场景初始化和直播统计。
allowed-tools: Bash(npx --yes polyv-live-cli@latest:*)
---

# 保利威云直播 CLI

以 npm 发布版 CLI 为准。不要根据旧示例、缓存文档、历史记忆或其他非发布版资料推断命令语法；只要能访问 npm，就先用发布版 `--help` 校验。

## 认证预检

除 `--help`、`--version` 和 `account` 管理命令外，直播 API 命令通常需要先配置至少一个账号的 AppID 和 AppSecret。

执行频道、推流、商品、优惠券、回放、互动、统计等业务命令前，先检查认证状态：

```bash
npx --yes polyv-live-cli@latest account current
npx --yes polyv-live-cli@latest account list
```

如果没有任何账号，或没有可用默认账号，不要继续执行业务命令。请用户提供凭据后再配置：

```bash
npx --yes polyv-live-cli@latest account add <账号名> --app-id <appId> --app-secret <appSecret> --user-id <userId> --env production
npx --yes polyv-live-cli@latest account set-default <账号名>
```

如果已配置账号但 API 返回 `application not found`、签名错误或无权限，优先按账号凭据、UserID、环境类型不匹配排查，不要先怀疑命令语法。

## 执行规则

1. 所有 CLI 调用都使用 `npx --yes polyv-live-cli@latest ...`。
2. 每次处理某个命令族前，先运行对应 help：
   ```bash
   npx --yes polyv-live-cli@latest <command> --help
   npx --yes polyv-live-cli@latest <command> <subcommand> --help
   ```
3. 执行需要账号的 API 操作前，先运行：
   ```bash
   npx --yes polyv-live-cli@latest account current
   npx --yes polyv-live-cli@latest account list
   ```
4. 做数据提取、脚本处理、对比或报告时，优先使用 `-o json` 或 `--output json`。
5. 不要回显账号 AppSecret。缺少认证时，请用户配置账号，或明确提供所需凭据。
6. 删除、清空、停播、开播、修改配置等影响生产的操作，除非用户已经给出明确命令或明确要求执行，否则先复述目标并等待确认。
7. 如果 `references/` 里的示例和 `npx --yes polyv-live-cli@latest ... --help` 冲突，必须以 npm help 为准。

## 高风险操作

以下操作需要确认后再执行：

- 删除频道、批量删除频道、删除回放、清空聊天消息。
- 开始直播、结束直播、推送本地文件、长时间 watch 或 monitor。
- 新增、更新、删除商品、优惠券、问卷、抽奖、打赏配置、观看条件、白名单、平台设置、回调设置、卡片推送、推广渠道、转播频道、AI 数字人组织关联。
- 全局禁言、全局踢人、清空白名单。
- 未加 `--dry-run` 的 `setup <scene>`。

能预演时先预演：

```bash
npx --yes polyv-live-cli@latest setup e-commerce --dry-run -o json
```

## 账号认证

查看账号配置和当前账号：

```bash
npx --yes polyv-live-cli@latest account list
npx --yes polyv-live-cli@latest account current
```

只有在用户提供凭据或明确要求配置时，才添加或切换账号：

```bash
npx --yes polyv-live-cli@latest account add <账号名> --app-id <appId> --app-secret <appSecret>
npx --yes polyv-live-cli@latest account set-default <账号名>
npx --yes polyv-live-cli@latest use <账号名>
```

单次调用可使用指定账号或显式凭据：

```bash
npx --yes polyv-live-cli@latest channel list -a <账号名> -o json
npx --yes polyv-live-cli@latest channel list --appId <appId> --appSecret <appSecret> -o json
```

## 常用流程

确认 npm 版本和顶层命令：

```bash
npx --yes polyv-live-cli@latest --version
npx --yes polyv-live-cli@latest --help
```

查询频道：

```bash
npx --yes polyv-live-cli@latest channel list -o json
npx --yes polyv-live-cli@latest channel list -P 1 -l 20 --keyword <关键词> -o json
```

创建频道：

```bash
npx --yes polyv-live-cli@latest channel create -n <频道名称> -d <频道描述> --scene topclass --template ppt -o json
```

获取推流信息和直播状态：

```bash
npx --yes polyv-live-cli@latest stream get-key -c <频道ID> -o json
npx --yes polyv-live-cli@latest stream status -c <频道ID> -o json
```

用户明确要求“获取推流密钥”“获取推流地址”时，推流地址和推流密钥就是目标结果，允许完整返回。`stream get-key` 的表格输出会脱敏；需要完整凭证时必须使用 JSON：

```bash
npx --yes polyv-live-cli@latest stream get-key -c <频道ID> -o json
```

不要把推流密钥和账号 AppSecret 混为一类：AppSecret 不回显；推流密钥可在用户明确请求时返回，但提醒只提供给可信推流端，不要发到公开渠道或日志。

只有用户需要长时间监控时，才运行持续命令：

```bash
npx --yes polyv-live-cli@latest stream status -c <频道ID> -w
npx --yes polyv-live-cli@latest stream monitor -c <频道ID> -r 5 --alerts
```

导出统计：

```bash
npx --yes polyv-live-cli@latest statistics export viewlog -c <频道ID> --start-time "2024-01-01 00:00:00" --end-time "2024-01-31 23:59:59" --output-file ./viewlog.csv
npx --yes polyv-live-cli@latest statistics export session -c <频道ID> --session-id <场次ID> -o json
```

## 已知语法差异提示

以下是历史验证过的高频易错点。执行前仍必须以当前 npm 发布版 `--help` 为准。

- `transmit` 使用 `--channelId`，不是 `-c`：
  ```bash
  npx --yes polyv-live-cli@latest transmit create --channelId <频道ID> --names "转播1,转播2" -o json
  npx --yes polyv-live-cli@latest transmit list --channelId <频道ID> -o json
  ```
- `card-push` 使用 camelCase 参数名：
  ```bash
  npx --yes polyv-live-cli@latest card-push create --channelId <频道ID> --imageType giftbox --title <标题> --link <链接> --duration 10 --showCondition PUSH -o json
  npx --yes polyv-live-cli@latest card-push push --channelId <频道ID> --cardPushId <卡片ID> -o json
  ```
- `watch-condition set` 的 JSON 配置文件参数是 `--config-file`：
  ```bash
  npx --yes polyv-live-cli@latest watch-condition set --channel-id <频道ID> --config-file ./watch-condition.json -o json
  ```
- `product` 只有 `add`、`list`、`update`、`delete`；当前 help 没有列出 `product get` 时，不要生成 `product get` 示例。
- `product add` 必须提供状态和链接类型：
  ```bash
  npx --yes polyv-live-cli@latest product add -c <频道ID> -n <商品名> --status 1 --link-type 10 -l <商品链接> --real-price 99.9 --price 199.9 -o json
  ```
- `coupon` 命令不接收 `-c`；创建优惠券使用账号级参数：
  ```bash
  npx --yes polyv-live-cli@latest coupon add --name <优惠券名> --type MAX_OUT --availableAmount 100 --receiveStart <毫秒时间戳> --receiveEnd <毫秒时间戳> --useTimeType RANGE --useStart <毫秒时间戳> --useEnd <毫秒时间戳> --condition FULL_REDUCE --full 100 --reduce 20 --limitPerPerson 1 -o json
  ```
- `statistics export` 有 `viewlog` 和 `session` 子命令；不是扁平的 `statistics export -c ... -f csv`。
- `monitor` 是监控面板命令；如果当前 help 没有列出 `monitor start` 或 `monitor stop`，不要生成这些子命令。
- `setup --help` 当前只列出 `e-commerce`；不要假设存在 `setup education`，除非 help 明确列出。
- `promotion` 和 `ai digital-human` 是真实命令族：
  ```bash
  npx --yes polyv-live-cli@latest promotion create --channelId <频道ID> --names "渠道1,渠道2" -o json
  npx --yes polyv-live-cli@latest ai digital-human list -o json
  ```
- `lottery create` / `lottery update` 使用 `--prize-name`；`lottery winners` 默认查单场中奖名单，需要查某个观众中奖记录时才加 `--viewer-id`：
  ```bash
  npx --yes polyv-live-cli@latest lottery create -c <频道ID> --name <名称> --type none --amount 3 --prize-name <奖品名> --force -o json
  npx --yes polyv-live-cli@latest lottery winners -c <频道ID> --lottery-id <抽奖ID> -o json
  npx --yes polyv-live-cli@latest lottery winners -c <频道ID> --lottery-id <抽奖ID> --viewer-id <观众ID> -o json
  ```
- `player config update` 管理水印、暖场图和基础 PV：
  ```bash
  npx --yes polyv-live-cli@latest player config update -c <频道ID> --watermark-enabled Y --watermark-url <图片URL> --watermark-position br --watermark-opacity 0.8 -o json
  ```

## 参考资料路由

`references/` 下的文件只作为补充背景使用。部分示例可能滞后于 npm 版本。读取它们了解业务含义、API 概念和流程后，执行前必须用 npm help 校验真实语法。

按最小范围读取：

- `authentication.md`：账号配置和认证来源。
- `channel-management.md`、`streaming.md`、`monitor.md`、`scene-setup.md`：频道和推流流程。
- `products.md`、`coupons.md`、`card-push.md`、`transmit.md`：商品、优惠券、卡片推送、转播等营销能力。
- `playback.md`、`record-settings.md`、`documents.md`、`session-management.md`：回放、录制、文档、场次。
- `chat-management.md`、`checkin.md`、`qa-questionnaire.md`、`lottery.md`、`donate.md`：直播互动工具。
- `viewer.md`、`viewer-management.md`、`watch-condition.md`、`whitelist.md`：观众、标签、观看条件、白名单。
- `platform.md`、`player.md`、`statistics.md`：平台设置、播放器配置、统计报表。

## 失败处理

如果命令在参数解析阶段失败：

1. 对最深层命令重新运行 `--help`。
2. 检查 camelCase 和 kebab-case 是否写错。
3. 删除 help 没列出的短参数别名。
4. 修正文档或回复时优先使用完整参数名。

如果命令进入 API 阶段后失败：

1. 运行 `account current` 和 `account list`。
2. 用只读 list/get 命令核对账号、频道 ID 和对象 ID。
3. 报告实际错误和命令形态，不暴露账号 AppSecret。若用户明确请求推流凭证，可返回 `stream get-key -o json` 的推流地址和推流密钥。

## 官方资源与支持

以下入口用于了解产品、查阅业务 API 或联系人工支持；命令语法仍以当前 npm 发布版 `--help` 为准。

- 官网：https://www.polyv.net/
- 保利威直播 API 文档：https://help.polyv.net/#/live/api/
- 邮箱：support@polyv.net
- 技术支持：400-993-9533

## 更新此 Skill

修改命令示例后，必须用 npm help 做回归：

```bash
npx --yes polyv-live-cli@latest --version
npx --yes polyv-live-cli@latest --help
npx --yes polyv-live-cli@latest <command> --help
npx --yes polyv-live-cli@latest <command> <subcommand> --help
```

同时验证已知旧写法是否仍然失败或已被删除。例如，除非 npm help 新增了 `-c`，否则不要出现 `transmit create -c ...` 这种可执行示例。
