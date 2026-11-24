# 回调

平台在视频处理的关键节点（上传完成、转码完成、审核完成、删除完成等）向你配置的地址发送通知。本 CLI 能查看和设置回调地址，也能离线校验一个回调请求是否确实来自平台。

## 前提：回调设置需要 API 凭证

`callback get` 和 `callback set` 用的是账号的 API 凭证（`appId` + `appSecret`，与直播 API 同源），不是点播的 `userId` + `secretKey`。保存账号时要一并提供：

```bash
<CLI> account add <账号名> --user-id <userId> --secret-key <secretKey> --write-token <writeToken> --app-id <appId> --app-secret <appSecret> --replace
```

`--app-id` 和 `--app-secret` 必须同时给。账号里没有它们时，这两个命令会报 `This endpoint needs the account API credentials`。

## 查看回调地址

```bash
<CLI> callback get --source codex
<CLI> callback get -o json --source codex
```

没有设置时表格显示 `(not set)`。JSON 是 `{ "callbackUrl": "https://…" }`。

## 设置回调地址

```bash
<CLI> callback set --url https://example.com/polyv/callback --force --source codex
```

必须是 HTTP(S) 地址。这是写操作，需要 `--force`。

## 清空回调地址

```bash
<CLI> callback set --force --source codex
```

不给 `--url` 即清空。

## 回调事件类型

| 事件 | 触发时机 | 关键字段 |
|---|---|---|
| 上传完成 | 平台收完上传的文件 | `type=upload`、`vid` |
| 异步上传失败 | 按 URL 拉取失败 | `type=async_upload`、`fileUrl` |
| 视频同步失败 | 同步任务失败 | `type=videoSyncedFail`、`vid` |
| 单个清晰度转码完成 | 某个清晰度转码完成 | `type=encode` 或 `encode_failed`、`format`、`df` |
| 全部清晰度转码完成 | 所有清晰度转码完成 | JSON 请求体，`eventType`、`status` |
| 审核完成 | 审核通过或不通过 | `type=pass` 或 `nopass`、`vid` |
| 删除完成 | 视频删除完成 | `eventType=DeleteMediaComplete` |
| 内容安全审核不通过 | 智能审核拦截 | `eventType=AIContentScanNotPassed` |
| 课件转换完成 | 课件转换结束 | `eventType=CoursewareConvertComplete` |

任一清晰度转码完成且审核通过后视频即可播放。

## 校验回调签名

你的回调接口收到请求后，应验证 `sign` 参数，确认请求来自平台。此命令在本地完成校验，不访问网络，也不需要 `--source`：

```bash
<CLI> callback verify --sign <sign> --type upload --vid <视频ID>
<CLI> callback verify --json '<回调请求体和查询参数合并后的 JSON>'
<CLI> callback verify --json '<JSON>' -o json
```

`--json` 里可以放请求体和查询参数的全部字段，命令会从中取 `sign`、`type`、`eventType`、`vid`、`format`、`df`、`fileUrl`。也可以用 `--sign`、`--type`、`--event-type`、`--vid`、`--format`、`--df`、`--file-url` 分开传。

校验用的是账号的 `secretKey`。想用别的密钥校验时加 `--secret-key <key>`。

输出：

- 签名有效：`✅ Signature valid: the callback comes from the platform`，退出码 `0`
- 签名无效：`❌ Signature invalid`（在 stderr），退出码 `1`

JSON 模式 stdout 只有 `{ "valid": true }` 或 `{ "valid": false }`。

## 各事件的签名算法

平台用账号的 `secretKey` 做 MD5（小写）。不同事件的拼接规则不同：

| 事件 | 拼接规则 |
|---|---|
| 上传完成 | `"upload"` + `vid` + `secretKey` |
| 异步上传失败 | `type` + `fileUrl` + `secretKey` |
| 视频同步失败 | `type` + `vid` + `secretKey` |
| 单个清晰度转码 | `type` + `format` + `vid` + `df` + `secretKey` |
| 全部清晰度转码完成 | `eventType` + `vid` + `secretKey`（`sign` 在 URL 参数里，不在请求体里） |
| 审核完成 | `"manage"` + `type` + `vid` + `secretKey` |
| 删除完成、内容安全审核不通过、课件转换完成 | `eventType` + `secretKey`（`sign` 在 URL 参数里） |

`callback verify` 已实现全部规则，传入对应字段即可，不需要自己拼接。
