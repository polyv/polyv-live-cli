# 场景 14：直播物料与课件资源治理（素材库分类/标签 + 频道课件文档上传/转码/清理）

## 1. 场景名称

直播物料与课件资源治理 —— 素材库分类与标签体系运营 + 频道课件文档（产品手册/PPT）上传、转码状态监控与生命周期清理。

## 2. 覆盖命令

| 一级命令 | 覆盖状态 | 说明 |
|---|---|---|
| `material`（素材库） | ✅ 已执行成功 | `category list`（image/video/document 三类成功、audio 报「系统异常」已执行失败）、`label list` 基线、`label create`×2、`label update` 改名、`label delete` 清理全生命周期并经 `label list` 前后对比验证；`material list` 多类型遍历只读基线 |
| `document`（课件文档） | ✅ 已执行成功 | `list` 基线/复查、`upload` 真实上传公网 PDF 课件并落库 doc-2.polyv.net、`status` 转码状态（转换中→normal）、`delete --force` 清理、`media vids` 只读基线，全生命周期在专用测试频道真实执行 |

> 同时复用：`account`（写入前预检）、`channel`（新建并验证专用测试频道 7983948）。

## 3. 专用测试频道

- **频道 ID**：`7983948`
- **频道名称**：`GNHF-电商场景-14-material-document-202606230200`
- **创建命令**：`npx --yes polyv-live-cli@rc channel create -n "GNHF-电商场景-14-material-document-202606230200" --scene alone --template alone -o json`
- **账号环境**：`nicksu`（App ID `h2wazzobbq`，User ID `475b6884a7`，production），默认账号
- **场景/模板**：`alone` / `alone`（活动营销）
- **watchStatus**：`unStart`（新建未开播，频道级 document 命令不受开播态限制）
- **创建结果**：成功，`status=waiting`，`created=6/23/2026, 1:43:04 AM`
- **频道已保留，未执行删除**（见第 13 节保留资产说明）。

## 4. 行业背景

电商直播运营在开播前要准备两类「物料」资源：

1. **账号级素材库**：商品封面图、贴片广告、片头片尾视频、品牌片头等可复用素材，需要按业务线/品类打「标签」并归类到「分类」（如「商品讲解」视频分类），方便多个直播间复用同一批品牌物料。
2. **频道级课件文档**：每场直播专属的产品手册 PDF、培训 PPT、秒杀规则文档等，需上传到具体频道、等待服务端转码（PPT/DOC→可在线翻页的图片集），开播时讲师在观看页调出讲解。

这两类资源分别由 `material`（账号级素材库）与 `document`（频道级课件文档）两个命令族管理，是「预热/开播」阶段的标准物料治理动作。

## 5. 业务目标与核心 KPI

- **业务目标**：在开播前完成「素材可检索、课件可讲解」的物料就绪。
- **核心 KPI**：
  - 素材库标签/分类体系建立完成率（账号级标签数、各类型分类数）
  - 频道课件文档上传成功率与转码完成率（`status=normal`）
  - 课件文档可用页数（`totalPage`/`imageCount`，决定观看页可翻页数）
  - 物料治理的写入→验证→清理闭环可用性

## 6. 适用角色

- 直播运营/场控：上传本场课件文档、监控转码状态。
- 内容/设计中台：维护账号级素材库的分类与标签体系，供各直播间复用。
- 电商主播/讲师：开播时在观看页调出课件讲解产品。

## 7. 前置条件

- 已配置默认账号（`nicksu`，production 环境）。
- 已新建专用测试频道 `7983948`（未开播即可上传课件文档）。
- 课件文档上传需一个公网可访问、PolyV 服务端可抓取的源文件 URL（支持 ppt/pdf/pptx/doc/docx/wps，≤200M）。
- 写入类命令（`material label create/update/delete`、`document upload/delete`）在非交互终端需带 `-f`/`--force`。

## 8. polyv-live-cli-rc 能力映射

| 业务动作 | 一级命令 | 子命令 | 作用域 |
|---|---|---|---|
| 查素材库分类体系 | `material` | `category list --material-type <type>` | 账号级 |
| 建素材库标签 | `material` | `label create --name <name> -f` | 账号级 |
| 改/删/查标签 | `material` | `label update --id <id> --name` / `label delete --id <id>` / `label list` | 账号级 |
| 遍历素材列表 | `material` | `list --type <type>` | 账号级 |
| 上传频道课件文档 | `document` | `upload -c <ch> --url <url> [--doc-name] [--type]` | 频道级 |
| 查课件列表/转码状态 | `document` | `list -c <ch>` / `status -c <ch> --file-id <id>` | 频道级 |
| 删除课件文档 | `document` | `delete -c <ch> --file-id <id> --force` | 频道级 |
| 查频道关联音视频 VID | `document` | `media vids -c <ch>` | 频道级 |

> `material` 标签为**账号级**（对本账号所有频道可见，与场景 08 viewer/custom-field、场景 11 invite-sales 同为账号级）；`document` 课件为**频道级**（每频道独立列表）。

## 9. 实施步骤

1. **预检账号**：`account current` / `account list` 确认默认账号 `nicksu`。
2. **建专用测试频道**：`channel create` 得到 `7983948`，`channel get` 复核。
3. **盘点账号级素材库**（只读基线）：
   - `material category list --material-type image|video|document` 摸清分类体系；
   - `material label list --page-number 1 --page-size 20` 摸清已有标签；
   - `material list --type <type>` 摸清各类型素材存量。
4. **建立/治理素材库标签体系**（写入→验证→清理闭环）：
   - `material label create --name "GNHF物料标签"` + `material label create --name "GNHF电商封面"` 建两个标签；
   - `material label list` 复查 0→2 确认持久化；
   - `material label update --id 296 --name "GNHF片头片尾"` 改名并 `list` 复查确认改名；
   - `material label delete --id 297` 清理一个并 `list` 复查 2→1。
5. **上传频道课件文档**（写入→转码→验证→清理→保留）：
   - `document upload -c 7983948 --url <公网PDF> --doc-name "GNHF电商产品手册"` 真实上传；
   - `document list` 复查落库、`document status` 复查转码 normal；
   - `document delete --force` 清理（演示生命周期）；
   - 再次 `document upload --doc-name "GNHF-保留-开播须知"` 保留一份在频道上供查看；
   - `document media vids` 查频道关联音视频 VID（与课件文档是两套资源）。
6. **收尾**：保留测试频道 `7983948`、保留素材标签 `296`、保留课件文档 `GNHF-保留-开播须知`，不删除。

## 10. 命令执行台账

> 账号：`nicksu`（production）；CLI：`polyv-live-cli@rc 1.2.31-rc.0`；执行时间：2026-06-23 01:43–01:46 CST。
> 敏感值已脱敏（AppSecret/推流密钥不出现；此处仅展示公网测试 PDF 源 URL 与脱敏后的 fileId/分类 id）。

| # | 时间 | 一级命令·子命令 | 实际执行命令（脱敏） | 对象/频道 | 结果 | 关键输出摘要 |
|---|---|---|---|---|---|---|
| 1 | 01:43 | channel·create | `channel create -n "GNHF-电商场景-14-material-document-202606230200" --scene alone --template alone -o json` | — | ✅ 成功 | channelId `7983948`，status `waiting` |
| 2 | 01:43 | channel·get | `channel get -c 7983948 -o json` | 7983948 | ✅ 成功 | scene `alone`，watchStatus `unStart` |
| 3 | 01:44 | material·category list | `material category list --material-type image -o json` | 账号级 | ✅ 成功 | totalItems 3：默认(DEFAULT)/自定义(CUSTOM)/网页开播(WEB_START) |
| 4 | 01:44 | material·category list | `material category list --material-type video -o json` | 账号级 | ✅ 成功 | totalItems 8：含「商品讲解」(PRODUCT_EXPLAIN 48666)、「AI视频」「伪直播视频」「视频回放」「小班课录制」等 |
| 5 | 01:44 | material·category list | `material category list --material-type document -o json` | 账号级 | ✅ 成功 | totalItems 2：默认/自定义 |
| 6 | 01:44 | material·category list | `material category list --material-type audio -o json` | 账号级 | ❌ 失败 | `Unexpected error: 系统异常`（见 12.1） |
| 7 | 01:44 | material·label list | `material label list --page-number 1 --page-size 20 -o json` | 账号级 | ✅ 成功 | totalItems 0（userLabelCount=0）基线 |
| 8 | 01:44 | material·list | `material list --type image --page-number 1 --page-size 5 -o json` | 账号级 | ✅ 成功 | totalItems 0 |
| 9 | 01:44 | material·list | `material list --type video --page-number 1 --page-size 3 -o json` | 账号级 | ✅ 成功 | totalItems 0 |
| 10 | 01:44 | material·list | `material list --type document --page-number 1 --page-size 3 -o json` | 账号级 | ✅ 成功 | totalItems 0 |
| 11 | 01:45 | material·label create | `material label create --name "GNHF物料标签" -f` | 账号级 | ✅ 成功 | Success=Yes（id 296，经 list 反查） |
| 12 | 01:45 | material·label create | `material label create --name "GNHF电商封面" -f -o json` | 账号级 | ✅ 成功 | `{success:true}`（id 297） |
| 13 | 01:45 | material·label list | `material label list --page-number 1 --page-size 20 -o json` | 账号级 | ✅ 成功 | totalItems **0→2**（296 GNHF物料标签、297 GNHF电商封面），确认持久化 |
| 14 | 01:45 | material·label update | `material label update --id 296 --name "GNHF片头片尾" -f` | 标签 296 | ✅ 成功 | Success=Yes |
| 15 | 01:45 | material·label list | `material label list --page-number 1 --page-size 20 -o json` | 账号级 | ✅ 成功 | 296 名由「GNHF物料标签」→「**GNHF片头片尾**」，确认改名持久化 |
| 16 | 01:45 | material·label delete | `material label delete --id 297 -f` | 标签 297 | ✅ 成功 | Success=Yes |
| 17 | 01:46 | material·label list | `material label list --page-number 1 --page-size 20 -o json` | 账号级 | ✅ 成功 | totalItems **2→1**（仅 296 GNHF片头片尾），确认删除持久化 |
| 18 | 01:45 | document·list | `document list -c 7983948 -o json` | 7983948 | ✅ 成功 | 暂无课件文档（基线） |
| 19 | 01:45 | document·upload | `document upload -c 7983948 --url "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" --doc-name "GNHF电商产品手册" -o json` | 7983948 | ✅ 成功 | fileId `2942bfabb3...7983948common`，convertType common，status `转换中` |
| 20 | 01:45 | document·list | `document list -c 7983948 -o json` | 7983948 | ✅ 成功 | 共 1 文档：fileUrl `http://doc-2.polyv.net/sources/20260623/2942...common.pdf`，fileType `.pdf`，totalPage 1，status `normal` |
| 21 | 01:45 | document·status | `document status -c 7983948 --file-id 2942bfabb3...common -o json` | 7983948 | ✅ 成功 | convertStatus `normal`，type common，totalPage 1，imageCount 1（1 页 PDF→1 张翻页图） |
| 22 | 01:46 | document·delete | `document delete -c 7983948 --file-id 2942bfabb3...common --force -o json` | 7983948 | ✅ 成功 | `删除成功`，status `已删除`（注：`-f` 报 unknown option，须用 `--force`） |
| 23 | 01:46 | document·list | `document list -c 7983948 -o json` | 7983948 | ✅ 成功 | 暂无课件文档（删除后回归空） |
| 24 | 01:46 | document·upload | `document upload -c 7983948 --url "<同上公网PDF>" --doc-name "GNHF-保留-开播须知" -o json` | 7983948 | ✅ 成功 | **同源 URL 复用同一 fileId** `2942bfabb3...7983948common`，status `转换中`（见 12.2） |
| 25 | 01:46 | document·list | `document list -c 7983948 -o json` | 7983948 | ✅ 成功 | 1 文档，fileName `GNHF-保留-开播须知`（覆盖了原 fileName），status normal |
| 26 | 01:46 | document·status | `document status -c 7983948 --file-id 2942...common -o json` | 7983948 | ✅ 成功 | convertStatus `normal`，imageCount 1 |
| 27 | 01:46 | document·media vids | `document media vids -c 7983948 -o json` | 7983948 | ✅ 成功 | totalItems 0（频道未关联音视频 VID，与课件文档是两套资源） |

## 11. 实际使用的 CLI 命令与真实参数

```bash
# 0) 预检
npx --yes polyv-live-cli@rc account current
npx --yes polyv-live-cli@rc account list

# 1) 建专用测试频道（保留未删除）
npx --yes polyv-live-cli@rc channel create \
  -n "GNHF-电商场景-14-material-document-202606230200" \
  --scene alone --template alone -o json
# -> channelId 7983948
npx --yes polyv-live-cli@rc channel get -c 7983948 -o json

# 2) 素材库分类盘点（账号级，只读）
npx --yes polyv-live-cli@rc material category list --material-type image -o json   # 3 类
npx --yes polyv-live-cli@rc material category list --material-type video -o json   # 8 类，含「商品讲解」
npx --yes polyv-live-cli@rc material category list --material-type document -o json # 2 类
# 注：--material-type audio 报「系统异常」

# 3) 素材库标签生命周期（账号级，写入须 -f）
npx --yes polyv-live-cli@rc material label list --page-number 1 --page-size 20 -o json   # 基线 0
npx --yes polyv-live-cli@rc material label create --name "GNHF物料标签" -f                 # id 296
npx --yes polyv-live-cli@rc material label create --name "GNHF电商封面" -f -o json         # id 297
npx --yes polyv-live-cli@rc material label list --page-number 1 --page-size 20 -o json    # 0->2 验证
npx --yes polyv-live-cli@rc material label update --id 296 --name "GNHF片头片尾" -f        # 改名
npx --yes polyv-live-cli@rc material label list --page-number 1 --page-size 20 -o json    # 改名验证
npx --yes polyv-live-cli@rc material label delete --id 297 -f                              # 清理
npx --yes polyv-live-cli@rc material label list --page-number 1 --page-size 20 -o json    # 2->1 验证

# 4) 素材列表遍历（账号级，只读）
npx --yes polyv-live-cli@rc material list --type image   --page-number 1 --page-size 5 -o json
npx --yes polyv-live-cli@rc material list --type video   --page-number 1 --page-size 3 -o json
npx --yes polyv-live-cli@rc material list --type document --page-number 1 --page-size 3 -o json

# 5) 频道课件文档生命周期（频道级，delete 须 --force）
npx --yes polyv-live-cli@rc document list -c 7983948 -o json   # 基线空
npx --yes polyv-live-cli@rc document upload -c 7983948 \
  --url "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" \
  --doc-name "GNHF电商产品手册" -o json
# -> fileId 2942bfabb3d05332b66eb128e0842cff7983948common，status 转换中
npx --yes polyv-live-cli@rc document list   -c 7983948 -o json          # 1 文档落库
npx --yes polyv-live-cli@rc document status -c 7983948 \
  --file-id 2942bfabb3d05332b66eb128e0842cff7983948common -o json        # convertStatus normal
npx --yes polyv-live-cli@rc document delete -c 7983948 \
  --file-id 2942bfabb3d05332b66eb128e0842cff7983948common --force -o json # 删除成功
npx --yes polyv-live-cli@rc document list   -c 7983948 -o json          # 回归空

# 6) 保留一份课件在频道（同源 URL 复用 fileId，fileName 被覆盖）
npx --yes polyv-live-cli@rc document upload -c 7983948 \
  --url "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" \
  --doc-name "GNHF-保留-开播须知" -o json
npx --yes polyv-live-cli@rc document list   -c 7983948 -o json
npx --yes polyv-live-cli@rc document media vids -c 7983948 -o json       # 关联音视频 VID 0
```

## 12. 执行或验证结果

### 12.1 问题记录：`material category list --material-type audio` 报「系统异常」

- **现象**：`material category list --material-type audio -o json` 返回 `Unexpected error: 系统异常`（exit 非 0），而 `image`(3)/`video`(8)/`document`(2) 三类均正常返回结构化分类列表。
- **根因推断**：与场景 11 `promotion list` 对零推广渠道频道报「系统异常」同源——后端对「该类型无分类配置/空集合」未返回 `[]` 而抛异常，是后端 list 接口空集合处理缺陷，非命令参数或账号问题。
- **排查**：四类同账号同命令，仅 `audio` 报错，排除鉴权/参数问题；`image/video/document` 均返回合法 JSON 排除命令本身缺陷。
- **下一步建议**：运营盘点音频素材分类应改用后台或绕过；CLI 该缺陷可向保利威反馈「audio 分类空集合应返回 `[]`」。
- **覆盖口径**：`material` 族已由 `category list`(image/video/document)、`label list/create/update/delete`、`material list` 多条业务命令真实执行成功而计入已覆盖；`audio` 这一条记为已执行失败。

### 12.2 问题发现：`document upload` 同源 URL 复用同一 fileId、覆盖 fileName

- **现象**：删除课件后，用**同一公网 PDF URL** 再次 `document upload` 到**同一频道** `7983948`，新 fileName 为 `GNHF-保留-开播须知`，但返回的 fileId 与首次上传**完全相同** `2942bfabb3d05332b66eb128e0842cff7983948common`；`document list` 复查 fileName 已由 `GNHF电商产品手册` 被覆盖为 `GNHF-保留-开播须知`。
- **根因推断**：fileId 由「源 URL + channelId + convertType」决定（fileId 末尾即拼接了 `7983948common`），同源同频道同转换类型视为同一份资源，fileName 被后者覆盖而非新增第二条。
- **运营影响**：若同一频道需要「同名源文件但不同展示名」的多份课件，必须使用**不同源 URL**（或不同 convertType），否则会互相覆盖。
- **覆盖口径**：两次 `document upload` 均真实写入成功并落库 doc-2.polyv.net，计入已覆盖；此条记为问题发现/注意事项。

### 12.3 已验证持久化的写入（前后对比）

| 写入 | 变更前查询 | 变更后查询 | 结论 |
|---|---|---|---|
| `material label create`×2 | `label list` totalItems=0 | `label list` totalItems=2（296/297） | ✅ 持久化 |
| `material label update --id 296 --name "GNHF片头片尾"` | 296 名=「GNHF物料标签」 | 296 名=「GNHF片头片尾」 | ✅ 改名持久化 |
| `material label delete --id 297` | totalItems=2 | totalItems=1（仅 296） | ✅ 删除持久化 |
| `document upload`（首次） | `document list` 空 | `document list` 1 文档，status normal | ✅ 持久化（落库 doc-2.polyv.net） |
| `document status` | upload 返 status=转换中 | `status` convertStatus=normal，imageCount=1 | ✅ 转码完成可验证 |
| `document delete --force` | `document list` 1 文档 | `document list` 空 | ✅ 删除持久化 |

### 12.4 配置侧 vs 观众侧

- **配置侧已满足条件**：`material label`/`category`/`document list`/`status` 均经 CLI/API 只读复查确认标签与课件落库、转码 normal。
- **观众侧可见性未验证**：课件文档是否能在观看页被讲师调出翻页、素材库标签是否在后台素材筛选器可见，本轮未打开观看页/后台验证，**不能声称「观众侧可见/可用」**。`document status` 的 imageCount=1 仅证明服务端转码产出 1 张翻页图（配置侧），不等同于观看页翻页交互可用。

## 13. 风险点与回滚/清理方式

| 风险 | 说明 | 回滚/清理 |
|---|---|---|
| 账号级标签污染 | `material label` 为账号级写入，建错的标签对本账号所有频道可见 | `material label delete --id <id> -f` 逐个删除（本轮已删 297，仅保留 296） |
| 课件文档同源覆盖 | 同频道同源 URL 上传会复用 fileId 并覆盖 fileName，误覆盖既有课件 | 上传前 `document list -c <ch>` 核对；需多份用不同源 URL |
| 误删课件 | `document delete --force` 不可逆 | 删除前 `document list`/`status` 确认 fileId；保留源 URL 可重新 upload |
| 公网源 URL 失效 | 服务端抓取源文件，源 URL 失效则上传/转码失败 | 选用稳定公网源；转码失败用 `document list --status failConvert` 复核 |
| 写入命令无确认 | 非 TTY 下须显式 `-f`/`--force`，等同跳过确认 | 谨慎核对频道 ID/fileId/标签 id 后再带 `-f`/`--force` |

**可选人工清理命令（均未执行，频道与资产按规则保留）**：

```bash
# 清理保留的账号级素材标签（未执行）
npx --yes polyv-live-cli@rc material label delete --id 296 -f
# 清理保留的频道课件文档（未执行）
npx --yes polyv-live-cli@rc document delete -c 7983948 \
  --file-id 2942bfabb3d05332b66eb128e0842cff7983948common --force
# 删除测试频道（未执行，按规则保留）
npx --yes polyv-live-cli@rc channel delete -c 7983948   # 若该子命令存在
```

## 14. 保留资产说明

本轮创建/写入的资产**均保留未删除**，供人工查看配置：

| 资产 | 类型 | 标识 | 作用域 | 状态 |
|---|---|---|---|---|
| 测试频道 | channel | `7983948`（GNHF-电商场景-14-material-document-202606230200） | 频道级 | 保留，watchStatus=unStart |
| 素材标签 | material label | `296`「GNHF片头片尾」 | **账号级** | 保留 |
| 课件文档 | document | fileId `2942bfabb3d05332b66eb128e0842cff7983948common`「GNHF-保留-开播须知」 | 频道级（7983948） | 保留，status=normal，totalPage 1 |

> 演示用的临时标签 `297`「GNHF电商封面」与首轮课件「GNHF电商产品手册」已在生命周期演练中**清理删除**，未保留。

## 15. 可复用模板

```bash
# === 素材库标签体系运营（账号级）===
# 盘点
material label list --page-number 1 --page-size 50 -o json
material category list --material-type video -o json      # 找「商品讲解」等业务分类
# 建标签（按业务线命名，如 品牌片头/商品讲解/秒杀贴片）
material label create --name "<标签名≤8字建议>" -f
material label list --page-number 1 --page-size 50 -o json   # 复核
material label update --id <id> --name "<新名>" -f           # 改名
material label delete --id <id> -f                           # 清理

# === 频道课件文档治理（频道级）===
# 上传本场产品手册/PPT（源 URL 须公网可访问、≤200M）
document upload -c <频道ID> --url "<公网文件URL>" --doc-name "<课件名>" --type common -o json
# 等待并复核转码（status=normal 才能在观看页翻页）
document list   -c <频道ID> -o json
document status -c <频道ID> --file-id <fileId> -o json
# 直播后清理过期课件
document delete -c <频道ID> --file-id <fileId> --force
```

## 16. 后续可扩展方向

- **多类型素材上传**：本轮 `material list` 各类型均为空（账号素材库暂无存量），未来可在后台/通过上传 API 补充视频/图片素材后，演练 `material list --category-id/--title` 检索与 `material delete` 批量清理。
- **课件转码类型对比**：本轮用 common（普通）转码；可对真实 PPT 演练 `--type animate`（动画 PPT，翻页带动画）并对比转码耗时与 imageCount。
- **document media 关联音视频**：`document media link/unlink` 可把账号下点播音视频 VID 关联到频道做「伪直播/插播」，本轮仅 `media vids` 只读基线（0），可后续在有点播资产的频道演练 link→vids→unlink。
- **document teacher-doc 讲师文档关系**：`document teacher-doc relation` 可把课件绑定到讲师，做多讲师分课表，留待讲师体系场景。
- **观众侧验证**：开播后打开观看页确认课件可被讲师调出翻页、imageCount 与实际可翻页数一致，补齐观众侧可见性证据。
