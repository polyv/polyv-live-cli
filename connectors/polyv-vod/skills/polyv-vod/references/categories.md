# 分类

分类是一棵树，根分类（“默认分类”）的 ID 是 `1`。除 `list` 外都是写操作，需要 `--force`。

## 查看分类树

```bash
<CLI> category list --source codex
<CLI> category list <分类ID> --source codex
<CLI> category list -o json --source codex
```

不带参数时从根分类开始。表格模式按层级缩进，每行是 `分类ID  分类名  (视频数)`，视频数包含子分类。

JSON 模式返回嵌套结构：

```json
[
  {
    "id": 1,
    "name": "默认分类",
    "parentId": 0,
    "path": "1",
    "videos": 14,
    "children": [{ "id": 1600000000001, "name": "课程", "parentId": 1, "path": "1,1600000000001", "videos": 3 }]
  }
]
```

`path` 是从根到该分类的 ID 链。`settings` 字段（存在时）是一级分类的设置。

## 新建分类

```bash
<CLI> category add "新课程" --parent-id 1 --force --source codex
<CLI> category add "子分类" --parent-id <父分类ID> --force -o json --source codex
```

`--parent-id` 必填，`1` 表示建在根下。分类名不超过 40 个字符。JSON 输出：

```json
{ "id": 1600000000002, "name": "新课程", "parentId": "1", "path": "1,1600000000002" }
```

## 改名

```bash
<CLI> category rename <分类ID> "新名字" --force --source codex
```

## 移动分类

```bash
<CLI> category move <分类ID> --dest-id <目标父分类ID> --force --source codex
```

`--dest-id` 是新的父分类，`1` 表示移到根下。

## 删除分类

```bash
<CLI> category delete <分类ID> --force --source codex
```

分类必须为空。先把其中的视频移走（`video move`）或删除，子分类也要先处理。

## 分类设置

只对**设置之后新上传**到该分类的视频生效，且只能设置一级分类。

```bash
<CLI> category setting <分类ID> --encrypt --force --source codex
<CLI> category setting <分类ID> --no-encrypt --no-edu --hls-level app --player-id <播放器ID> --force --source codex
```

| 选项 | 含义 |
|---|---|
| `--encrypt` / `--no-encrypt` | 新视频是否加密 |
| `--keep-source` / `--no-keep-source` | 源文件播放（不转码） |
| `--edu` / `--no-edu` | 录屏视频优化 |
| `--aac` / `--no-aac` | 同时生成音频文件 |
| `--hls-level <级别>` | 移动端授权级别：`open`、`web`、`app`、`wxa_app` |
| `--player-id <ID>` | 该分类视频使用的播放器 |

`--x` 表示开启，`--no-x` 表示关闭，不给则不改动。至少给一个设置。开启了 `--keep-source` 时，加密和 `--hls-level` 不生效。
