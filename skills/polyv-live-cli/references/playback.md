# 回放管理

用于查询、删除和合并直播回放文件。

## 回放列表

```bash
npx --yes polyv-live-cli@latest playback list -c 3151318
npx --yes polyv-live-cli@latest playback list -c 3151318 -o json
```

## 获取回放详情

```bash
npx --yes polyv-live-cli@latest playback get -c 3151318 --video-id 1b96d90bf5
npx --yes polyv-live-cli@latest playback get -c 3151318 --video-id 1b96d90bf5 -o json
```

## 删除回放

```bash
npx --yes polyv-live-cli@latest playback delete -c 3151318 --video-id 1b96d90bf5
npx --yes polyv-live-cli@latest playback delete -c 3151318 --video-id 1b96d90bf5 --force
npx --yes polyv-live-cli@latest playback delete -c 3151318 --video-id 1b96d90bf5 --list-type vod --force
```

| 参数 | 说明 |
| --- | --- |
| `-c, --channel-id` | 频道 ID |
| `--video-id` | 视频 ID |
| `--list-type` | `playback` 或 `vod`，默认 `playback` |
| `--force` | 跳过确认 |
| `-o, --output` | `table` 或 `json` |

## 合并录制文件

同步合并：

```bash
npx --yes polyv-live-cli@latest playback merge \
  -c 3151318 \
  --file-ids "file1,file2,file3"
```

指定合并后文件名：

```bash
npx --yes polyv-live-cli@latest playback merge \
  -c 3151318 \
  --file-ids "file1,file2" \
  --file-name "合并回放"
```

异步合并并配置回调：

```bash
npx --yes polyv-live-cli@latest playback merge \
  -c 3151318 \
  --file-ids "file1,file2" \
  --async \
  --callback-url "https://example.com/callback" \
  --auto-convert \
  --merge-mp4
```

| 参数 | 说明 |
| --- | --- |
| `--file-ids` | 要合并的录制文件 ID，多个 ID 用英文逗号分隔 |
| `--file-name` | 合并后的文件名 |
| `--async` | 使用异步合并 |
| `--callback-url` | 异步合并完成后的回调 URL |
| `--auto-convert` | 异步模式下自动转存点播 |
| `--merge-mp4` | 异步模式下合并为 MP4 |

## 使用注意

- 删除操作不可撤销，生产环境建议先不带 `--force` 运行。
- 合并使用录制文件 ID，不是视频 ID；多个文件 ID 放在一个逗号分隔字符串里。
- 脚本处理优先使用 `-o json`。
