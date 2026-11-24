# 播放凭证

加密视频播放前需要向平台换取一个播放凭证（Playsafe token），播放器凭它才能解密播放。

## 生成凭证

```bash
<CLI> play token --vid <视频ID> --viewer-id <观看者ID> --source codex
<CLI> play token --vid <视频ID> --viewer-id user1001 --viewer-name "张三" --expires 3600 --source codex
<CLI> play token --vid <视频ID> --viewer-id user1001 -o json --source codex
```

| 选项 | 必填 | 说明 |
|---|---|---|
| `--vid` | 是 | 视频 ID |
| `--viewer-id` | 是 | 观看者 ID，字母、数字、`-`、`_` |
| `--viewer-name` | 否 | 观看者名称 |
| `--viewer-ip` | 否 | 观看者 IP，不传则取调用方 IP |
| `--expires` | 否 | 有效秒数，默认 600，最长 86400 |
| `--disposable` | 否 | 只能验证一次 |

**每个观看者要用不同的 `--viewer-id`。** 相同的 `vid` + `viewer-id`（外加 `viewer-ip`）在上一个凭证仍未过期时再次请求，会延长原凭证的有效期，而不是签发新的。

输出：

```
videoId     <视频ID>
viewerId    user1001
token       203793b5-…
ttlSeconds  3600
expiresAt   2026-11-25T06:00:00.000Z
```

JSON 模式：

```json
{
  "token": "…",
  "videoId": "…_4",
  "viewerId": "user1001",
  "ttlSeconds": 3600,
  "expiresAt": "2026-11-25T06:00:00.000Z",
  "ttl": 3600000,
  "createdTime": 1795551600000,
  "expiredTime": 1795555200000,
  "disposable": false
}
```

## 使用凭证

把 `token` 连同 `vid` 和 `viewerId` 交给播放器。网页播放器（`//player.polyv.net/resp/vod-player/latest/player.js`）的用法以点播播放器文档为准，不在本 skill 范围内。

## 注意

- 凭证是敏感信息，等同于观看授权。不要在日志或回复中回显，不要硬编码。
- 生成凭证不需要 `--force`。
- 未加密的视频不需要播放凭证，直接用 `video get <视频ID> -o json` 里 `transcodeInfos[].playUrl` 即可。
