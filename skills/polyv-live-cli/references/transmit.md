# 转播管理

用于为主频道批量创建转播频道，并查询频道的转播关联。

## 当前 npm 命令面

npm 版 `polyv-live-cli@latest` 的转播命令使用 `--channelId`，没有 `-c` 简写。

```bash
npx --yes polyv-live-cli@latest transmit create --channelId <主频道ID> --names "转播频道1,转播频道2"
npx --yes polyv-live-cli@latest transmit list --channelId <频道ID>
```

输出格式使用 `-o table` 或 `-o json`，默认为表格。

## 创建转播频道

```bash
npx --yes polyv-live-cli@latest transmit create \
  --channelId 3151318 \
  --names "北京分会场,上海分会场,广州分会场"
```

JSON 输出：

```bash
npx --yes polyv-live-cli@latest transmit create \
  --channelId 3151318 \
  --names "北京分会场,上海分会场" \
  -o json
```

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `--channelId` | 是 | 主频道 ID |
| `--names` | 是 | 转播频道名称，多个名称用英文逗号分隔 |
| `-o, --output` | 否 | `table` 或 `json` |

## 查询转播关联

```bash
npx --yes polyv-live-cli@latest transmit list --channelId 3151318
npx --yes polyv-live-cli@latest transmit list --channelId 3151318 -o json
```

## 使用注意

- `--names` 使用英文逗号分隔，频道名称本身不要包含逗号。
- 批量创建前先和客户确认主频道 ID，避免把转播频道挂到错误直播间。
- 需要脚本处理时使用 `-o json`，不要解析表格输出。
