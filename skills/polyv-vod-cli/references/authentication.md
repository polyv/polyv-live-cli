# 身份认证配置

点播 CLI 的凭证与直播 CLI 是**两套互不通用的凭证**：直播用 `appId / appSecret`，点播用 `userId / secretKey / writeToken`。不要把直播凭证填进点播 CLI，反之亦然。

**本文的示例是按需选用的，不是依次执行的步骤。** 每一节解决一个问题：用户要保存账号就看“保存账号”，要换账号就看“切换账号”。不要从头到尾逐条执行，否则会新建多余的账号、取消已有的默认账号。执行任何账号管理命令前，先运行 `account list` 和 `account current` 了解现状。

## 凭证种类

| 凭证 | 必需性 | 用途 |
|---|---|---|
| `userId` | 必需 | 点播账号 ID |
| `secretKey` | 必需 | 接口签名 |
| `writeToken` | 上传必需 | 上传本地文件 |
| `readToken` | 可选 | 本版 CLI 的命令都不需要 |
| `appId` + `appSecret` | 可选 | 仅 `callback get` 和 `callback set` |

`appId / appSecret` 是账号的 API 凭证，与直播 API 用的是同一对，在直播后台的开发设置里获取。

## 凭证来源（先匹配到的生效）

1. 命令行参数：`--userId` + `--secretKey`（可加 `--writeToken`、`--appId`、`--appSecret`）
2. `--account <账号名>` 或 `-a <账号名>`
3. 用 `use <账号名>` 选定的会话账号
4. 环境变量：`POLYV_VOD_USER_ID` + `POLYV_VOD_SECRET_KEY`
5. 保存的默认账号

注意环境变量名带 `VOD`：是 `POLYV_VOD_USER_ID`，不是直播 CLI 的 `POLYV_USER_ID`。两者可以同时设置，互不影响。

## 保存账号

```bash
<CLI> account add production --user-id <userId> --secret-key <secretKey> --write-token <writeToken> --default
<CLI> account list
<CLI> account current
```

- `--default` 把它设为默认账号。
- 账号已存在时要加 `--replace` 才会覆盖。
- 没有 `--write-token` 时能查询但不能上传；之后补上：

```bash
<CLI> account add production --user-id <userId> --secret-key <secretKey> --write-token <writeToken> --replace
```

- 账号保存在 `~/.polyv-vod/accounts.json`，密钥加密存储，与直播 CLI 的 `~/.polyv` 分开。设置环境变量 `POLYV_VOD_MASTER_KEY` 可更换加密密钥。

## 切换账号

```bash
<CLI> use staging
<CLI> use --status
<CLI> use --list
<CLI> use --clear
```

`use` 选定的账号对同一台机器上的后续命令生效，优先级高于默认账号。

## 默认账号

```bash
<CLI> account set-default staging
<CLI> account unset-default
```

## 移除账号

```bash
<CLI> account remove old-account --force
```

## 单次命令指定凭证

```bash
<CLI> video search -a staging --source codex
<CLI> video search --userId <userId> --secretKey <secretKey> --source codex
```

凭证参数放在业务命令前或后都可以；`-a/--account` 指向已保存的账号。

加 `--verbose` 可看到凭证来自哪里（不显示凭证内容）：

```bash
<CLI> video search --verbose --source codex
```

## --source 来源标识

除 `account`、`use`、`auth`、`callback verify`、`--help`、`--version` 外，每条命令都必须带 `--source <标识>`。缺少时命令不执行并以退出码 `1` 结束。

- 格式：小写字母、数字、连字符，以字母或数字开头，不超过 32 个字符。
- 官方平台连接器传平台名，如 `--source workbuddy`；其它 agent 传自身名称，如 `--source codex`。
- 它只用于平台侧统计调用来源，不会被保存。每次调用都要带。

## 连接器登录状态

```bash
<CLI> auth status
```

凭证可用时输出 `Logged in`、退出码 `0`；否则输出 `Not logged in`、退出码 `1`。`auth` 打印配置指引，`auth logout` 删除名为 `workbuddy` 的账号。

## 安全

不要在回复、日志或文档中写出 `secretKey`、`writeToken`、`appSecret`。需要用户配置时，给出命令形态并让其自行填入。
