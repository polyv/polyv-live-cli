# 视频

搜索、查看、修改、删除与恢复、禁播、等待转码。除 `search`、`get`、`size`、`wait` 外都是写操作，需要 `--force`。

## 搜索

```bash
<CLI> video search --source codex
<CLI> video search --title 关键词 --source codex
<CLI> video search --tag 课程 --cata-id <分类ID> --source codex
<CLI> video search --status 60 --sort creationTimeDesc --page 1 --page-size 50 -o json --source codex
```

| 选项 | 说明 |
|---|---|
| `--title` | 按标题或视频 ID 模糊匹配 |
| `--cata-id` | 限定分类 |
| `--tag` | 按标签模糊匹配 |
| `--status` | 状态码，逗号分隔；`60` 或 `61` 表示已发布 |
| `--sort` | `creationTimeAsc`、`creationTimeDesc`、`playTimesAsc`、`playTimesDesc` |
| `--page` / `--page-size` | 分页，`--page-size` 最大 1000 |

表格输出后有一行总数和页数。JSON 输出的结构：

```json
{
  "totalItems": 20,
  "pageNumber": 1,
  "totalPages": 1,
  "videos": [{ "vid": "…_4", "basicInfo": { "title": "…", "status": 60, "duration": 61, "size": 1048576 }, "metaData": {}, "transcodeInfos": [], "snapshotInfo": {} }]
}
```

`videos[]` 是平台返回的完整记录。`basicInfo.duration` 单位是秒，`basicInfo.size` 单位是字节。

搜索是模糊匹配，结果为空不一定代表对象不存在。要确认某个视频是否存在，用 `video get <视频ID>`。

## 详情

```bash
<CLI> video get <视频ID> --source codex
<CLI> video get <视频ID1> <视频ID2> -o json --source codex
```

一次最多 100 个视频 ID。表格只显示常用列；`-o json` 返回全部字段，包括：

- `basicInfo`：标题、描述、时长、大小、状态、分类、标签、播放次数、创建和更新时间
- `metaData`：格式、码率、帧率、宽高、编码
- `transcodeInfos[]`：各清晰度的播放地址 `playUrl`、清晰度 `definition`、是否加密 `encrypt`
- `snapshotInfo`：封面和截图地址

## 等待转码

```bash
<CLI> video wait <视频ID> --source codex
<CLI> video wait <视频ID> --timeout 900 --interval 10 -o json --source codex
```

轮询到视频已发布或确定失败为止。已发布退出 `0`；转码失败或超时退出 `1`，失败原因在 stderr。

## 状态码

`basicInfo.status` 的取值：

| 状态码 | 含义 | 说明 |
|---|---|---|
| `6` | 处理中 | 刚上传，平台尚未开始转码 |
| `10` | 等待编码 | |
| `20` | 编码中 | |
| `40` | 编码失败 | 终态 |
| `41` | 不可播放 | 终态；文档未记载，见于上传了非视频内容的文件 |
| `50` | 等待审核 | |
| `51` | 审核不通过 | 终态 |
| `60` | 已发布 | 可播放 |
| `61` | 已发布 | 可播放；从回收站恢复的视频是此状态 |
| `-1` | 已删除 | 在回收站中 |

`6`、`41`、`61` 不在公开文档的状态码表里，是实测观察到的。只有 `60` 和 `61` 表示可播放。

## 修改

```bash
<CLI> video update <视频ID> --title "新标题" --force --source codex
<CLI> video update <视频ID> --description "新描述" --tag "a,b" --force --source codex
```

至少给 `--title`、`--description`、`--tag` 中的一个。

## 移动分类

```bash
<CLI> video move <视频ID1> <视频ID2> --cata-id <分类ID> --force --source codex
```

一次最多 500 个视频 ID，可以空格分隔，也可以逗号分隔。

## 禁播与解禁

```bash
<CLI> video ban <视频ID> --force --source codex
<CLI> video unban <视频ID> --force --source codex
```

只有已发布的视频能禁播，只有已禁播的能解禁。

## 删除

```bash
<CLI> video delete <视频ID> --force --source codex
<CLI> video delete <视频ID1> <视频ID2> --force -o json --source codex
<CLI> video delete <视频ID> --permanent --force --source codex
```

- 默认进回收站，可用 `video recover` 恢复。
- `--permanent` 彻底删除，不可恢复。
- 一次最多 500 个视频 ID。

**退出码 `0` 不代表全部删除成功。** JSON 输出：

```json
{ "deleted": ["…_4"], "skipped": ["…_7"] }
```

`skipped` 是平台没能删除的视频：不存在、已删除、或仍在处理中。`skipped` 不为空时，对这些 ID 稍后重试。表格模式下未删除的 ID 以 `Not deleted:` 提示输出到 stderr。

默认会跳过无法删除的视频并继续处理其余的。加 `--strict` 则遇到任何一个无法删除的视频就整批失败、什么都不删。

要确认删除结果，用 `video get <视频ID>` 逐个核对，报“找不到视频信息”才是真的删掉了。

## 恢复

```bash
<CLI> video recover <视频ID> --force --source codex
```

一次最多 100 个。恢复后的视频状态码为 `61`。

## 时长和大小

```bash
<CLI> video size --vid <视频ID1>,<视频ID2> --source codex
<CLI> video size --cata-id <分类ID> --source codex
```

`--vid` 和 `--cata-id` 至少给一个；都给时以 `--vid` 为准。返回时长（`hh:mm:ss`）和各清晰度转码文件的大小。
