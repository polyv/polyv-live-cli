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

**删的是整棵子树。** 平台不要求分类为空：该分类下所有层级的子分类一起删除。其中的视频不会被删，而是移到根分类（默认分类，ID `1`）。根分类本身不能删。

删除前先看清范围：

```bash
<CLI> category list <分类ID> -o json --source codex
```

不带 `--force` 时命令拒绝执行，提示里写明会删除几个子分类、移走几个视频：

```
This command will delete category 1600000000001 "旧课程" (with 2 sub-categories; 3 videos move to the default category). Re-run it with --force to confirm.
```

删除后的输出写明同样的范围。要让视频留在别的分类，删之前先用 `video move` 移走。

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
| `--player-id <ID>` | 该分类视频使用的播放器；`<ID>` 要用点播后台「播放器管理」里的真实播放器 ID，不存在的 ID 平台会报 `播放器id参数有误` |

`--x` 表示开启，`--no-x` 表示关闭，不给则不改动。至少给一个设置。开启了 `--keep-source` 时，加密和 `--hls-level` 不生效。
