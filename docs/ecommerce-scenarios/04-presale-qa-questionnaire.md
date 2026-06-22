# 场景 04：售前答疑与问卷收集 — 新品首发购买意向摸底与答疑卡编排

> 业务阶段：**预热 / 互动 / 数据复盘**
> 覆盖一级命令：`questionnaire`、`qa`、`channel`、`account`
> 真实执行状态：**已执行成功**（含 `qa add-edit` 1 条已执行失败记录、`questionnaire list`(V4) 1 条查询结果与预期不一致的问题记录）

---

## 1. 场景名称

售前答疑与问卷收集 —— 在新品直播**开播前**，用「问卷」做购买意向与价格预期摸底、用「问答卡（QA）」把核心卖点编成答题互动，为开播当天的转化蓄水：

- **购买意向调研问卷**：单选（最关注的卖点）+ 单选（预期购买数量）+ 填空（留手机号领首发提醒），开播前挂载到观看页，收集真实意向数据用于排品与逼单话术。
- **价格心理预期摸底问卷**：单选（可接受价格区间），用于判断首发定价是否命中观众心理账户。
- **售前答疑卡（QA）**：把「新品首发到手价是多少？」编成单选答题卡，计划在讲解高峰期推送，用答题强化价格记忆、放大首发紧迫感（本场景此项**真实执行失败**，作为问题发现记录）。

同时演练问卷的创建、列表、详情全生命周期，使运营在真实直播中能按节奏挂卷/查卷。

## 2. 覆盖命令

| 一级命令 | 子命令 | 执行状态 | 说明 |
|---|---|---|---|
| `account` | `account current`、`account list` | 已执行成功 | 写入前账号预检 |
| `channel` | `channel create`、`channel get` | 已执行成功 | 创建专用测试频道并验证频道存在 |
| `questionnaire` | `questionnaire create` | 已执行成功 | 建 2 张售前问卷（意向调研 3 题 / 价格预期 1 题） |
| `questionnaire` | `questionnaire detail` | 已执行成功 | 查问卷详情，验证 3 道题与选项完整落库 |
| `questionnaire` | `questionnaire legacy-list`（V3） | 已执行成功 | 列出 2 张问卷，totalItems=2 |
| `questionnaire` | `questionnaire list`（V4 分页） | 已执行成功（**结果异常**） | 命令执行成功但返回空，与 `legacy-list`/`detail` 不一致，见第 12 节问题记录 |
| `qa` | `qa list` | 已执行成功 | 基线查询，确认新频道无答题卡 |
| `qa` | `qa add-edit`（新建答题卡） | 已执行失败 | 报「答题卡记录不存在」，见第 12 节问题记录（CLI 限制） |

> 说明：本场景所有「已执行成功」命令均使用真实账号（`nicksu`）与真实测试频道（`7983889`）真实执行过，下文「命令执行台账」逐条记录。仅做 `--help` 校验、未真实执行的命令不计入覆盖；`qa add-edit` 真实执行但失败，按「已执行失败」记录；`questionnaire list`(V4) 真实执行成功但返回结果与预期不一致，按问题发现记录（命令本身仍计入覆盖）。

## 3. 专用测试频道

| 项 | 值 |
|---|---|
| 频道名称 | `GNHF-电商场景-04-qa-questionnaire-202606222306` |
| 频道 ID | `7983889` |
| 账号环境 | `nicksu`（App ID `h2wazzobbq`，User ID `475b6884a7`，production） |
| 场景类型 | `alone`（活动营销） |
| 模板 | `alone`（纯视频-横屏） |
| 创建结果 | 成功（watchStatus=unStart / 未开始） |
| 创建时间 | 2026-06-22 23:06:55 CST |
| 是否删除 | **否，频道已保留**，供人工查看配置 |

## 4. 行业背景

新品直播首发的转化，很大程度取决于开播前的「蓄水」质量。成熟电商直播间普遍在预热期做两件事：

- **问卷摸底**：用一张轻量问卷收集观众的购买意向、关注卖点、价格预期、联系方式，据此决定开播讲解顺序、库存分配和逼单话术；留资字段还能用于「首发开抢前 10 分钟短信提醒」，把预热流量精准导流到开播峰值。
- **答疑卡强化**：把最关键的卖点（如「首发到手价 299，限量 500 份」）编成答题卡，在讲解高峰推送，让观众「答一遍 = 记一遍」，既拉互动又强化价格心智、放大首发紧迫感。

保利威把这两块分别做成 `questionnaire`（问卷，多题型、可挂观看页、可统计）和 `qa`（答题卡，直播中推送/停止、可统计答题分布）两个一级命令。本场景把「建售前问卷 → 列表/详情验证 → 尝试建答疑卡」串成一个可照着执行的操作闭环，全部用真实测试频道验证。

## 5. 业务目标与核心 KPI

- **业务目标**：开播前完成售前问卷配置并经只读命令验证落库；尝试配置答疑卡并记录 CLI 限制。
- **核心 KPI**：
  - 至少 1 张售前问卷创建成功，`questionnaire detail` 能查到完整的题目与选项。
  - 意向调研问卷含 3 道题：2 道单选（卖点 / 购买数量）+ 1 道填空（留资），必答/选答属性正确。
  - `questionnaire legacy-list` 能列出本轮创建的全部问卷（本场景为 2 张）。
  - 记录 `questionnaire list`(V4) 返回空的问题、记录 `qa add-edit` 无法新建答题卡的 CLI 限制及排查过程。

## 6. 适用角色

- 电商运营 / 直播运营：负责售前问卷题目设计、卖点拆解、答疑卡编排。
- 场控 / 助播：在直播中按节奏推送答疑卡、回收问卷数据（本场景覆盖配置与只读验证，不涉及真实直播推送与回收）。

## 7. 前置条件

1. 已安装可访问 npm rc 发布版的 Node 环境，可用 `npx --yes polyv-live-cli@rc`。
2. 已配置可用账号且为默认账号（本场景使用 `nicksu`）。
3. 已创建专用测试频道（本场景为本轮新建的测试频道 `7983889`）。
4. 已明确每张问卷的：标题、题目（题型/题干/选项/必答）。
5. **已知限制**：
   - `qa add-edit` 在当前 rc 版本无法新建答题卡（CLI 三层强制要求 `--question-id` 非空，但 API 新建要求该字段为空），见第 12 节。如需答疑卡，建议在保利威后台创建。
   - `questionnaire list`(V4 分页) 对新建未发布（status=saved）问卷返回空，需用 `questionnaire legacy-list`(V3) 或 `questionnaire detail` 验证，见第 12 节。

## 8. polyv-live-cli-rc 能力映射

| 业务动作 | CLI 一级命令 | 子命令 | 关键参数 |
|---|---|---|---|
| 写入前账号预检 | `account` | `current` / `list` | 无 |
| 创建专用测试频道 | `channel` | `create` | `-n`、`--scene alone`、`--template alone` |
| 建售前问卷 | `questionnaire` | `create` | `-c`、`--title`、`--questions`（JSON） |
| 查问卷详情（含题目） | `questionnaire` | `detail` | `-c`、`--questionnaire-id` |
| 列问卷（V3 legacy，推荐验证用） | `questionnaire` | `legacy-list` | `-c` |
| 列问卷（V4 分页，已知异常） | `questionnaire` | `list` | `-c` |
| 列答题卡（只读） | `qa` | `list` | `-c` |
| 新建/编辑答题卡（当前受限） | `qa` | `add-edit` | `-c`、`--question-id`、`--type`、`--item-type`、`--option`、`--answer` |

## 9. 实施步骤

1. **账号预检**：执行 `account current` 与 `account list`，确认当前默认账号。
2. **创建专用测试频道**：用反映场景的名称创建活动营销频道，记录频道 ID。
3. **基线查询**：执行 `qa list`、`questionnaire list`、`questionnaire legacy-list` 确认新频道无问卷/答题卡。
4. **校验建问卷 help**：运行 `questionnaire create --help`，确认 `--title`、`--questions`、`--custom-questionnaire-id` 等参数真实存在（注意：`create` 无 `-f/--force`，且实测不会弹确认）。
5. **建意向调研问卷**：`questionnaire create` 传入 3 道题（2 单选 + 1 填空），记录 questionnaireId。
6. **建价格预期问卷**：`questionnaire create` 传入 1 道单选，记录 questionnaireId。
7. **详情验证**：`questionnaire detail` 取意向调研问卷，确认题目/选项/必答属性完整落库。
8. **列表验证（V3）**：`questionnaire legacy-list` 确认 2 张问卷可见。
9. **列表验证（V4，记录异常）**：`questionnaire list` 执行，记录返回空与预期不一致。
10. **校验建答题卡 help**：运行 `qa add-edit --help`，确认 `--question-id`、`--type`、`--item-type`、`--option`、`--answer`、`--tip` 等参数。
11. **尝试建答疑卡**：`qa add-edit`（**预期失败**，记录错误与三层强制校验排查）。
12. **频道留存核验**：`channel get` 确认频道存在、未删除。

## 10. 命令执行台账

> 时间均为 2026-06-22 CST；敏感值（AppSecret、频道密码）已脱敏，下文不出现。

| # | 执行时间 | 一级命令 / 子命令 | 实际执行命令（脱敏） | 频道/对象 ID | 结果 | 关键输出摘要 |
|---|---|---|---|---|---|---|
| 1 | 23:06 | `account current` | `npx --yes polyv-live-cli@rc account current` | 账号 `nicksu` | 成功 | 默认账号 nicksu，来源全局配置 |
| 2 | 23:06 | `account list` | `npx --yes polyv-live-cli@rc account list` | 共 6 个账号 | 成功 | nicksu/testpolyv6/lizhikang/bd 等可用 |
| 3 | 23:06 | `channel create` | `npx --yes polyv-live-cli@rc channel create -n "GNHF-电商场景-04-qa-questionnaire-202606222306" -d "..." --scene alone --template alone -o json` | 新建 `7983889` | 成功 | channelId=7983889，watchStatus=unStart |
| 4 | 23:07 | `qa list`（基线） | `npx --yes polyv-live-cli@rc qa list -c 7983889 -o json` | 频道 `7983889` | 成功 | `No QA found`（空） |
| 5 | 23:07 | `questionnaire list`（基线，V4） | `npx --yes polyv-live-cli@rc questionnaire list -c 7983889 -o json` | 频道 `7983889` | 成功 | `No questionnaires found`（空） |
| 6 | 23:08 | `questionnaire create`（意向调研） | `npx --yes polyv-live-cli@rc questionnaire create -c 7983889 --title "新品首发-购买意向调研" --questions '[{...2单选+1填空...}]' -o json` | 新建 `hjpscjr163` | 成功 | questionnaireId=hjpscjr163，questionsCount=3，questionIds=[b108bcbe62,226fe20072,d2b41dd747] |
| 7 | 23:09 | `questionnaire create`（价格预期） | `npx --yes polyv-live-cli@rc questionnaire create -c 7983889 --title "新品首发-价格心理预期摸底" --questions '[{...1单选...}]' -o json` | 新建 `hjpscvdgce` | 成功 | questionnaireId=hjpscvdgce，questionsCount=1，questionIds=[52df4a0077] |
| 8 | 23:09 | `questionnaire list`（创建后，V4） | `npx --yes polyv-live-cli@rc questionnaire list -c 7983889 -o json` | 频道 `7983889` | 成功（**结果异常**） | 仍返回 `No questionnaires found`，但 detail/legacy-list 证实 2 张存在（见问题记录） |
| 9 | 23:09 | `questionnaire detail` | `npx --yes polyv-live-cli@rc questionnaire detail -c 7983889 --questionnaire-id hjpscjr163 -o json` | 问卷 `hjpscjr163` | 成功 | 返回 3 道题：卖点单选(4 选项)/数量单选(3 选项)/手机号填空；status=saved，required 属性正确 |
| 10 | 23:09 | `questionnaire legacy-list`（V3） | `npx --yes polyv-live-cli@rc questionnaire legacy-list -c 7983889 -o json` | 频道 `7983889` | 成功 | totalItems=2，contents=[hjpscvdgce, hjpscjr163]，均 status=saved |
| 11 | 23:08 | `qa add-edit`（尝试新建答题卡，自定义 id） | `npx --yes polyv-live-cli@rc qa add-edit -c 7983889 --question-id qa-price-001 --name "新品首发到手价是多少？" --type R --item-type 0 --option "299元(首发到手价)" --option "399元(日常原价)" --option "499元(吊牌价)" --answer A --tip "..." -f -o json` | — | **失败** | `addEditQuestion failed: 答题卡记录不存在` |
| 12 | 23:08 | `qa add-edit`（PolyV 风格 10 位 id） | `... --question-id gnhfqa0001 --type R --item-type 0 ... -f -o json` | — | **失败** | 同上 `答题卡记录不存在`（与 id 格式无关） |
| 13 | 23:09 | `channel get` | `npx --yes polyv-live-cli@rc channel get -c 7983889 -o json` | 频道 `7983889` | 成功 | 频道存在，watchStatus=unStart，未删除 |

## 11. 实际使用的 CLI 命令与真实参数

```bash
# 1) 账号预检
npx --yes polyv-live-cli@rc account current
npx --yes polyv-live-cli@rc account list

# 2) 创建专用测试频道（活动营销 / 纯视频横屏）
npx --yes polyv-live-cli@rc channel create \
  -n "GNHF-电商场景-04-qa-questionnaire-202606222306" \
  -d "电商营销场景04：售前答疑与问卷收集专用测试频道，GNHF 创建保留不删除" \
  --scene alone --template alone -o json

# 3) 基线查询（新频道应均为空）
npx --yes polyv-live-cli@rc qa list -c 7983889 -o json
npx --yes polyv-live-cli@rc questionnaire list -c 7983889 -o json

# 4) 建购买意向调研问卷（2 单选 + 1 填空，必答/选答混搭）
#    注意：questionnaire create 无 -f 参数；实测不会弹写确认
npx --yes polyv-live-cli@rc questionnaire create \
  -c 7983889 --title "新品首发-购买意向调研" \
  --questions '[{"name":"您最关注本款新品的哪个卖点?","type":"R","options":["首发到手价","核心功效","品牌口碑","包装颜值"],"required":"Y"},{"name":"您预期的购买数量?","type":"R","options":["1件尝鲜","2-3件自用囤货","5件以上分销"],"required":"Y"},{"name":"留下您的手机号，首发开抢前10分钟短信提醒(选填)","type":"Q","required":"N"}]' \
  -o json
# => questionnaireId=hjpscjr163, questionsCount=3

# 5) 建价格心理预期摸底问卷（1 单选）
npx --yes polyv-live-cli@rc questionnaire create \
  -c 7983889 --title "新品首发-价格心理预期摸底" \
  --questions '[{"name":"您觉得本款新品到手价在哪个区间最愿意下单?","type":"R","options":["200元以内","200-300元","300-400元","400元以上"],"required":"Y"}]' \
  -o json
# => questionnaireId=hjpscvdgce, questionsCount=1

# 6) 查问卷详情（验证题目/选项/必答完整落库）
npx --yes polyv-live-cli@rc questionnaire detail -c 7983889 --questionnaire-id hjpscjr163 -o json

# 7) 列问卷 —— 必须用 V3 legacy-list 才能查到新建未发布问卷
npx --yes polyv-live-cli@rc questionnaire legacy-list -c 7983889 -o json   # => totalItems=2

# 8) V4 分页 list 对新建未发布问卷返回空（问题记录，命令本身成功）
npx --yes polyv-live-cli@rc questionnaire list -c 7983889 -o json          # => No questionnaires found

# 9) 尝试新建答疑卡 —— 当前 rc 受限，必失败（CLI 三层强制 question-id 非空，API 新建要求空）
npx --yes polyv-live-cli@rc qa add-edit \
  -c 7983889 --question-id gnhfqa0001 \
  --name "新品首发到手价是多少？" --type R --item-type 0 \
  --option "299元(首发到手价)" --option "399元(日常原价)" --option "499元(吊牌价)" \
  --answer A --tip "正确答案是299元，今晚直播间首发到手价，限量500份" -f -o json
# => Error: addEditQuestion failed: 答题卡记录不存在
```

> 参数风格：`qa` 全族用 kebab-case（`-c/--channel-id`、`--question-id`、`--item-type`、`--option`、`--tip`）；`questionnaire` 全族用 kebab-case（`-c`、`--title`、`--questions`、`--questionnaire-id`）。`questionnaire create` 不支持 `-f/--force`（与 `lottery`/`card-push` 不同），实测直接写入不弹确认。

## 12. 执行或验证结果

- ✅ 测试频道 `7983889` 创建成功，watchStatus=unStart，归属 nicksu。
- ✅ 意向调研问卷 `hjpscjr163` 创建成功（3 题）、价格预期问卷 `hjpscvdgce` 创建成功（1 题）。
- ✅ **详情验证落库完整**：`questionnaire detail` 返回 `hjpscjr163` 的 3 道题——卖点单选（4 选项 option1-4 + optionJson）、数量单选（3 选项）、手机号填空（type=Q、optionJson=[]）；两道单选 `required=Y`、填空 `required=N`，属性与传入一致；两问卷 `status=saved`（新建未发布）。
- ✅ **V3 列表可查**：`questionnaire legacy-list` 返回 totalItems=2，contents=[hjpscvdgce, hjpscjr163]，均 status=saved，与创建结果一致。

**关键排查发现 / 问题记录**：

1. **【V4 `questionnaire list` 对新建未发布问卷返回空 — 结果与预期不一致】** 创建 2 张问卷后，`questionnaire list -c 7983889 -o json`（V4 分页 API `/live/v4/channel/questionnaire/page`）仍返回 `No questionnaires found for channel 7983889`；而同一频道 `questionnaire legacy-list`（V3 `/live/v3/channel/questionnaire/list`）返回 totalItems=2、`questionnaire detail` 也能完整查到 `hjpscjr163`。
   - **已做排查**：① 同频道、同账号、同时间三次查询互相印证，排除创建未落库的可能；② 两问卷 `status` 均为 `saved`（未发布），怀疑 V4 分页接口默认只返回已发布问卷或对 `saved` 状态有过滤。
   - **下一步建议**：① 运营若需用 V4 `list` 验证，应先用后台或 `send` 类命令把问卷发布后再查；② 临时验证新建问卷一律用 `questionnaire legacy-list`(V3) 或 `questionnaire detail`；③ 上报 V4 分页接口与 V3 列表行为不一致的问题。
2. **【`qa add-edit` 无法新建答题卡 — CLI/rc 三层限制】** `qa add-edit` 在 CLI 三层都强制要求 `--question-id` 非空：① Commander 层 `qa.commands.ts` 用 `.requiredOption('--question-id <id>', ...)`；② handler 层 `qa-questionnaire.handler.ts` 用 `validateRequiredOptions(options, ['channelId','questionId','type','answer','name','itemType'])`；③ SDK 层 `live-interaction.service.ts` 用 `validateRequiredString(params.questionId, 'questionId')`（空串/纯空格直接抛 `questionId is required`）。但 PolyV 后端 API `/live/v3/channel/interact/question/add-edit-question` 的契约是「`questionId` **修改时必填，不填则新增**」（见 document-center 该接口文档）。两者冲突，导致 CLI 永远走「修改」分支，传入任何自定义 id（实测 `qa-price-001`、`gnhfqa0001`）后端都报 `addEditQuestion failed: 答题卡记录不存在`，**与 id 格式、`--item-type`(0 答题卡) 取值无关**。
   - **已做排查**：① 确认 `--question-id ""` 在 CLI 第一层即被拒（requiredOption）；② 改用 PolyV 风格 10 位字母数字 id 仍报同一错误；③ 查 SDK 源码与后端接口文档确认「新建需 questionId 为空」。
   - **下一步建议**：① 升级到修复该冲突的 rc 版本（CLI 应在新建时允许 questionId 为空/缺省）后重试；② 临时在保利威后台手动创建答疑卡，再用 `qa list` 取到真实 questionId，之后用 `qa send`/`qa stop` 走直播推送闭环；③ 若必须用 CLI 新建，本场景暂不可行。
3. **【`questionnaire create` 无 `-f` 且不弹确认】** 与 `lottery`/`card-push` 不同，`questionnaire create` 不支持 `-f/--force`，实测直接写入、不弹确认提示；首次误带 `-f` 会报 `unknown option '-f'`。
4. **【问卷题型语义】** `--questions` JSON 中 `type=R`（单选）必须带 `options`，`type=Q`（填空）无需 `options`；`required` 取值字符串 `"Y"/"N"`。`detail` 返回的每题 `itemType=0`（答题卡型题目），与 `qa` 命令的 `--item-type` 同名但分属两套系统。
5. **【频道描述未持久化】** `channel create` 传入了 `-d` 描述，但 `channel get` 回填 `desc:""`（与场景 01/02/03 一致的已知现象），不属于本场景执行失败。

> ⚠️ 配置侧 vs 观众侧（依规则区分）：本场景「问卷创建成功 / 题目落库完整 / 列表(V3) 可查」均为通过 CLI/API 查询到的**配置侧已满足条件**。问卷 `status=saved`（未发布），**未打开观看页、未做观众侧验证**，因此不写「观众侧可见/可答」。`questionnaire results`（答题记录）与 `qa answers`（答题记录）需在有真实观众答题数据后才有意义，本场景频道未开播、无答题数据，未执行这两条只读命令以避免空查询误导。

## 13. 风险点与回滚/清理方式

| 风险 | 说明 | 回滚/清理 |
|---|---|---|
| V4 `list` 查不到新建问卷 | 易误判「创建失败」重复建卷 | 用 `legacy-list`(V3) 或 `detail` 验证；勿据 V4 `list` 判定 |
| 答题卡建不出来 | CLI 限制，`qa add-edit` 必失败 | 改在保利威后台创建；上报 CLI 修复 |
| 问卷题目/选项配错 | 影响真实回收数据 | 重新 `questionnaire create` 覆盖（同 title 新建一张），或在后台编辑 |
| 问卷建错频道 | 影响真实直播回收 | 仅使用本轮新建测试频道 `7983889`；执行时务必 `-c` 指向正确频道 |
| 残留测试问卷 | 占用频道问卷位 | 后台删除（CLI rc 暂无 `questionnaire delete` 子命令） |

**可选的人工清理命令（未执行，仅备查）**：

```bash
# CLI rc 当前版本无 questionnaire delete 子命令；如需删除保留的测试问卷，
# 请到保利威后台「互动管理-问卷」手动删除 hjpscjr163、hjpscvdgce（本轮未执行）。
# 删除测试频道（未执行，频道按约定保留）
npx --yes polyv-live-cli@rc channel delete -c 7983889 -f
```

> 上述清理命令**均未执行**，仅作为人工清理参考。

## 14. 保留资产说明

本轮保留以下资产用于人工查看配置，**未执行任何删除**：

| 资产 | ID | 说明 |
|---|---|---|
| 测试频道 | `7983889` | `GNHF-电商场景-04-qa-questionnaire-202606222306`，活动营销/纯视频横屏，watchStatus=unStart |
| 意向调研问卷 | `hjpscjr163` | 新品首发-购买意向调研，3 题（卖点单选/数量单选/手机号填空），status=saved，questionIds=[b108bcbe62,226fe20072,d2b41dd747] |
| 价格预期问卷 | `hjpscvdgce` | 新品首发-价格心理预期摸底，1 题（价格区间单选），status=saved，questionIds=[52df4a0077] |

> 频道与 2 张问卷均已保留，未删除。CLI rc 当前版本无 `questionnaire delete` 子命令，如需清理问卷请到保利威后台操作；频道清理命令见上文「可选的人工清理命令」，但该清理命令本轮未执行。

## 15. 可复用模板

运营在真实直播中复用时，替换占位符即可（`<频道ID>`、`<问卷标题>`、`<题干>`、`<选项>`）：

```bash
# 1) 建售前摸底问卷（单选 + 填空留资混搭；create 无 -f、不弹确认）
npx --yes polyv-live-cli@rc questionnaire create \
  -c <频道ID> --title "<问卷标题>" \
  --questions '[{"name":"<单选题干>","type":"R","options":["<选项1>","<选项2>","<选项3>"],"required":"Y"},{"name":"<填空题干(留资)>","type":"Q","required":"N"}]' \
  -o json

# 2) 验证问卷落库（推荐用 detail 逐张查，题目/选项最全）
npx --yes polyv-live-cli@rc questionnaire detail -c <频道ID> --questionnaire-id <问卷ID> -o json

# 3) 列出频道问卷 —— 务必用 V3 legacy-list（V4 list 对未发布问卷返回空）
npx --yes polyv-live-cli@rc questionnaire legacy-list -c <频道ID> -o json

# 4) 复盘：直播后回收答题数据（需有真实观众答题数据）
npx --yes polyv-live-cli@rc questionnaire results -c <频道ID> --questionnaire-id <问卷ID> -o json

# 5) 答疑卡 —— 当前 rc 无法用 CLI 新建；需在后台建好后用 qa list 取真实 questionId
npx --yes polyv-live-cli@rc qa list -c <频道ID> -o json
# 直播中推送/停止答疑卡（questionId 来自后台或 qa list）
npx --yes polyv-live-cli@rc qa send -c <频道ID> --question-id <真实问答卡ID> --duration 30 -o json
npx --yes polyv-live-cli@rc qa stop -c <频道ID> --question-id <真实问答卡ID> -o json
```

> 注意：`qa add-edit` 当前 rc 版本无法新建答题卡（见第 12 节），模板中答疑卡的创建步骤改走保利威后台；`questionnaire list`(V4) 对未发布问卷返回空，验证用 `legacy-list`(V3)。

## 16. 后续可扩展方向

- **答疑卡闭环**：待 CLI 修复 `qa add-edit` 新建路径（允许 `questionId` 为空）后，补一轮真实执行覆盖 `qa add-edit`/`qa send`/`qa stop`/`qa delete-question`/`qa send-result` 的直播答题闭环，把「售前答疑卡 → 直播中推送 → 答题分布复盘」补全。
- **问卷发布与回收**：频道真实开播并发布问卷后，用 `questionnaire results` 回收答题数据、`questionnaire list`(V4) 复验发布后是否可见，验证「V4 list 仅返回已发布问卷」的假设。
- **问卷批量创建**：`questionnaire batch-create` 可一次性挂多张问卷，适合大促多场次预热（后续场景覆盖）。
- **学生提问与答题记录**：`qa question-list`（学生提问记录）、`qa answers`（答题记录）、`qa send-times`（发送次数）可在有真实互动数据后补覆盖。
- **与签到/抽奖联动**：把问卷与 `checkin`（签到）、`lottery`（抽奖）组合，做「签到填问卷 → 答题抽 → 留资召回」的连贯蓄水剧本（后续场景覆盖）。
- **隐私模式问卷**：`questionnaire create --privacy-enabled --privacy-content` 适用于需收集手机号/地址的留资问卷，做合规留资承接（后续场景覆盖）。
