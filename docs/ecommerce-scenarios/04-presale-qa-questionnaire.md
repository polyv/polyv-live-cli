# 场景 04：售前答疑与问卷收集 — 新品首发购买意向摸底与答疑卡编排

> 业务阶段：**预热 / 互动 / 数据复盘**
> 覆盖一级命令：`questionnaire`、`qa`、`channel`、`account`
> 真实执行状态：**已发布并用 `polyv-live-cli@latest` 1.2.35 完整复测通过**。本轮复测确认 `questionnaire list` 已改为查询问卷列表，`questionnaire result-list` 已改为查询问卷结果；不再保留 `questionnaire legacy-list` 兼容别名。`questionnaire list` 可直接列出新建的 2 张 `saved` 问卷。

---

## 1. 场景名称

售前答疑与问卷收集 —— 在新品直播**开播前**，用「问卷」做购买意向与价格预期摸底、用「答题卡（QA）」把核心卖点编成答题互动，为开播当天的转化蓄水：

- **购买意向调研问卷**：单选（最关注的卖点）+ 单选（预期购买数量）+ 填空（留手机号领首发提醒）。
- **价格心理预期摸底问卷**：单选（可接受价格区间），用于判断首发定价是否命中观众心理账户。
- **售前答题卡（QA）**：把「新品首发到手价是多少？」编成单选答题卡，新建时省略 `--question-id`。

## 2. 覆盖命令与复测状态

| 一级命令 | 子命令 | latest 1.2.35 复测状态 | 说明 |
|---|---|---|---|
| `account` | `account current`、`account list` | 成功 | 默认账号 `nicksu` 可用 |
| `channel` | `channel create`、`channel get` | 成功 | 创建专用 latest 复测频道 `7987540` |
| `questionnaire` | `questionnaire create` | 成功 | 建 2 张售前问卷 |
| `questionnaire` | `questionnaire detail` | 成功 | 3 道题与选项完整落库 |
| `questionnaire` | `questionnaire list` | 成功 | 可查到 2 张 `saved` 问卷 |
| `questionnaire` | `questionnaire result-list` | 成功（无答题结果） | 未发布/未回收问卷时返回 `No questionnaire results found`，符合预期 |
| `qa` | `qa add-edit`（新建答题卡） | 成功 | 省略 `--question-id` 后真实创建 QA `hjqpl563p3` |
| `qa` | `qa list` | 成功 | 返回 count=1，可查到 `hjqpl563p3` |

## 3. 专用测试频道

| 项 | 值 |
|---|---|
| 频道名称 | `GNHF-电商场景-04-qa-questionnaire-latest-1.2.35` |
| 频道 ID | `7987540` |
| 账号环境 | `nicksu`（App ID `h2wazzobbq`，User ID `475b6884a7`，production） |
| 场景类型 | `alone`（活动营销） |
| 模板 | `alone`（纯视频-横屏） |
| 创建结果 | 成功（status=waiting） |
| 创建时间 | 2026-06-23 19:17:45 CST |
| 是否删除 | **否，频道已保留**，供人工查看配置 |

## 4. 行业背景

新品直播首发的转化，很大程度取决于开播前的「蓄水」质量。成熟电商直播间通常会在预热期做两件事：

- **问卷摸底**：用轻量问卷收集购买意向、关注卖点、价格预期和联系方式，据此决定开播讲解顺序、库存分配和逼单话术。
- **答题卡强化**：把最关键的卖点编成答题卡，在讲解高峰推送，让观众通过互动记住首发价、限量权益和购买理由。

本场景把「建售前问卷 -> 列表/详情验证 -> 建答题卡 -> 列表复查」串成一个可照着执行的配置闭环，全部用 npm latest 发布版和真实测试频道验证。

## 5. 业务目标与核心 KPI

- 开播前完成售前问卷配置，并用只读命令验证落库。
- 意向调研问卷含 3 道题：2 道单选 + 1 道填空，必答/选答属性正确。
- 价格预期问卷含 1 道单选。
- 用 `questionnaire list` 和 `questionnaire detail` 验证问卷存在。
- 用 `questionnaire result-list` 查询问卷结果；未发布/未回收时无结果是预期。
- 用 `qa add-edit` 省略 `--question-id` 新建答题卡，再用 `qa list` 复查可见。

## 6. 适用角色

- 电商运营 / 直播运营：负责售前问卷题目设计、卖点拆解、答题卡编排。
- 场控 / 助播：在直播中按节奏推送答题卡、回收问卷数据。
- 工程 / 平台支持：负责复核 CLI 行为、定位接口或 SDK/CLI 契约差异。

## 7. 前置条件

1. 使用 npm 最新发布版：`npx --yes polyv-live-cli@latest`。
2. 当前 latest 版本为 `1.2.35`，依赖 `polyv-live-api-sdk@1.0.15`。
3. 已配置可用账号且为默认账号（本场景使用 `nicksu`）。
4. 已明确每张问卷和答题卡的标题、题型、题干、选项和必答属性。

## 8. latest 能力映射

| 业务动作 | CLI 一级命令 | 子命令 | 关键参数 |
|---|---|---|---|
| 写入前账号预检 | `account` | `current` / `list` | 无 |
| 创建专用测试频道 | `channel` | `create` | `-n`、`--scene alone`、`--template alone` |
| 建售前问卷 | `questionnaire` | `create` | `-c`、`--title`、`--questions` |
| 查问卷详情 | `questionnaire` | `detail` | `-c`、`--questionnaire-id` |
| 列问卷 | `questionnaire` | `list` | `-c`、`--page`、`--size`、`--start-time`、`--end-time` |
| 查问卷结果 | `questionnaire` | `result-list` | `-c`、`--page`、`--size`、`--session-id`、`--start-date`、`--end-date` |
| 新建/编辑答题卡 | `qa` | `add-edit` | `-c`、`--type`、`--item-type`、`--option`、`--answer`；新建时省略 `--question-id` |
| 列答题卡 | `qa` | `list` | `-c` |

## 9. 实施步骤

1. 发布 `polyv-live-cli@1.2.35`。
2. 确认 `polyv-live-cli@latest` 指向 `1.2.35`，且依赖 SDK `1.0.15`。
3. 账号预检：执行 `account current` 与 `account list`。
4. 创建专用测试频道，记录频道 ID。
5. 基线查询：`qa list`、`questionnaire list`、`questionnaire result-list`。
6. 创建购买意向调研问卷，记录 questionnaireId。
7. 创建价格心理预期问卷，记录 questionnaireId。
8. 用 `questionnaire detail` 验证题目/选项/必答属性。
9. 用 `questionnaire list` 验证 2 张问卷均可见。
10. 用 `questionnaire result-list` 验证未发布/未回收问卷暂无答题结果。
11. 省略 `--question-id` 执行 `qa add-edit`，确认真实新建 QA。
12. 用 `qa list` 验证新建 QA 可见。

## 10. 命令执行台账

> 时间均为 2026-06-23 CST；敏感值（AppSecret、频道密码、推流密钥）已脱敏。
> 问卷验证口径：`questionnaire list` 是确认 `saved` 问卷存在的列表命令；`questionnaire result-list` 是问卷结果命令，未回收答卷时返回空结果不算失败。

| # | 执行时间 | 命令 | 频道/对象 ID | 结果 | 关键输出摘要 |
|---|---|---|---|---|---|
| 1 | 19:13 | `npm view polyv-live-cli dist-tags --json` | npm | 成功 | `latest=1.2.35` |
| 2 | 19:13 | `npx --yes polyv-live-cli@latest --version` | latest | 成功 | `1.2.35` |
| 3 | 19:13 | `npm view polyv-live-cli@1.2.35 dependencies --json` | npm | 成功 | `polyv-live-api-sdk=1.0.15` |
| 4 | 19:13 | `npx --yes polyv-live-cli@latest questionnaire --help` | latest | 成功 | 子命令包含 `list`、`result-list`；不包含 `legacy-list` |
| 5 | 19:13 | `npx --yes polyv-live-cli@latest questionnaire list --help` | latest | 成功 | `list` 支持 `--start-time/--end-time`，不支持结果筛选参数 |
| 6 | 19:13 | `npx --yes polyv-live-cli@latest questionnaire result-list --help` | latest | 成功 | `result-list` 支持 `--session-id/--start-date/--end-date` |
| 7 | 19:17 | `npx --yes polyv-live-cli@latest channel create -n "GNHF-电商场景-04-qa-questionnaire-latest-1.2.35" ... -o json` | 新建 `7987540` | 成功 | status=waiting，created=2026-06-23 19:17:45 |
| 8 | 19:17 | `npx --yes polyv-live-cli@latest qa list -c 7987540 -o json` | 频道 `7987540` | 成功 | `No QA found`（基线为空） |
| 9 | 19:17 | `npx --yes polyv-live-cli@latest questionnaire list -c 7987540 -o json` | 频道 `7987540` | 成功 | totalItems=0（创建前为空） |
| 10 | 19:17 | `npx --yes polyv-live-cli@latest questionnaire result-list -c 7987540 -o json` | 频道 `7987540` | 成功 | `No questionnaire results found for channel 7987540`（创建前无答题结果） |
| 11 | 19:18 | `npx --yes polyv-live-cli@latest questionnaire create -c 7987540 --title "新品首发-购买意向调研-1.2.35" --questions '[...]' -o json` | 新建 `hjqpkq8dfl` | 成功 | questionsCount=3，questionIds=[337bf2e3fe,87396d52f7,25f1bd0644] |
| 12 | 19:18 | `npx --yes polyv-live-cli@latest questionnaire create -c 7987540 --title "新品首发-价格心理预期-1.2.35" --questions '[...]' -o json` | 新建 `hjqpkqer8i` | 成功 | questionsCount=1，questionIds=[66884e0b70] |
| 13 | 19:18 | `npx --yes polyv-live-cli@latest questionnaire detail -c 7987540 --questionnaire-id hjqpkq8dfl -o json` | 问卷 `hjqpkq8dfl` | 成功 | 返回 3 道题；两道单选 required=Y，手机号填空 required=N |
| 14 | 19:18 | `npx --yes polyv-live-cli@latest questionnaire list -c 7987540 -o json` | 频道 `7987540` | 成功 | totalItems=2，contents=[hjqpkqer8i,hjqpkq8dfl]，均 status=saved |
| 15 | 19:18 | `npx --yes polyv-live-cli@latest questionnaire result-list -c 7987540 -o json` | 频道 `7987540` | 成功 | `No questionnaire results found for channel 7987540`，符合未回收答卷状态 |
| 16 | 19:18 | `npx --yes polyv-live-cli@latest qa add-edit -c 7987540 --name "新品首发到手价是多少？-1.2.35" ... -f -o json` | 新建 `hjqpl563p3` | 成功 | 省略 `--question-id`，后端返回 QA ID `hjqpl563p3` |
| 17 | 19:18 | `npx --yes polyv-live-cli@latest qa list -c 7987540 -o json` | QA `hjqpl563p3` | 成功 | count=1，status=draft，answer=A，itemType=0 |
| 18 | 19:18 | `npx --yes polyv-live-cli@latest channel get -c 7987540 -o json` | 频道 `7987540` | 成功 | watchStatus=unStart，频道密码/推流密钥已脱敏 |

## 11. 实际使用的 CLI 命令与真实参数

```bash
# 1) 账号与版本预检
npx --yes polyv-live-cli@latest --version
npx --yes polyv-live-cli@latest account current
npx --yes polyv-live-cli@latest account list
npx --yes polyv-live-cli@latest questionnaire --help
npx --yes polyv-live-cli@latest questionnaire list --help
npx --yes polyv-live-cli@latest questionnaire result-list --help

# 2) 创建专用测试频道
npx --yes polyv-live-cli@latest channel create \
  -n "GNHF-电商场景-04-qa-questionnaire-latest-1.2.35" \
  -d "电商营销场景04：售前答疑与问卷收集 latest 1.2.35 复测频道，GNHF 创建保留不删除" \
  --scene alone --template alone -o json

# 3) 基线查询
npx --yes polyv-live-cli@latest qa list -c 7987540 -o json
npx --yes polyv-live-cli@latest questionnaire list -c 7987540 -o json
npx --yes polyv-live-cli@latest questionnaire result-list -c 7987540 -o json

# 4) 建购买意向调研问卷
npx --yes polyv-live-cli@latest questionnaire create \
  -c 7987540 --title "新品首发-购买意向调研-1.2.35" \
  --questions '[{"name":"您最关注本款新品的哪个卖点?","type":"R","options":["首发到手价","核心功效","品牌口碑","包装颜值"],"required":"Y"},{"name":"您预期的购买数量?","type":"R","options":["1件尝鲜","2-3件自用囤货","5件以上分销"],"required":"Y"},{"name":"留下您的手机号，首发开抢前10分钟短信提醒(选填)","type":"Q","required":"N"}]' \
  -o json
# => questionnaireId=hjqpkq8dfl

# 5) 建价格心理预期问卷
npx --yes polyv-live-cli@latest questionnaire create \
  -c 7987540 --title "新品首发-价格心理预期-1.2.35" \
  --questions '[{"name":"您觉得本款新品到手价在哪个区间最愿意下单?","type":"R","options":["200元以内","200-300元","300-400元","400元以上"],"required":"Y"}]' \
  -o json
# => questionnaireId=hjqpkqer8i

# 6) 查问卷详情、问卷列表、问卷结果
npx --yes polyv-live-cli@latest questionnaire detail -c 7987540 --questionnaire-id hjqpkq8dfl -o json
npx --yes polyv-live-cli@latest questionnaire list -c 7987540 -o json
npx --yes polyv-live-cli@latest questionnaire result-list -c 7987540 -o json

# 7) 新建 QA 并复查
npx --yes polyv-live-cli@latest qa add-edit \
  -c 7987540 \
  --name "新品首发到手价是多少？-1.2.35" --type R --item-type 0 \
  --option "299元(首发到手价)" --option "399元(日常原价)" --option "499元(吊牌价)" \
  --answer A --tip "正确答案是299元，今晚直播间首发到手价，限量500份" -f -o json
# => hjqpl563p3

npx --yes polyv-live-cli@latest qa list -c 7987540 -o json
npx --yes polyv-live-cli@latest channel get -c 7987540 -o json
```

## 12. 执行或验证结果

- ✅ `polyv-live-cli@1.2.35` 已发布，npm `latest` 指向 `1.2.35`。
- ✅ `polyv-live-cli@latest --version` 返回 `1.2.35`。
- ✅ `polyv-live-cli@1.2.35` 依赖 `polyv-live-api-sdk@1.0.15`。
- ✅ `questionnaire --help` 不再包含 `legacy-list`。
- ✅ `questionnaire list` 是问卷列表命令，创建后返回 totalItems=2。
- ✅ `questionnaire result-list` 是问卷结果命令，未回收答卷时返回空结果且文案为 `No questionnaire results found`。
- ✅ 测试频道 `7987540` 创建成功，归属 nicksu。
- ✅ 意向调研问卷 `hjqpkq8dfl` 创建成功（3 题）。
- ✅ 价格预期问卷 `hjqpkqer8i` 创建成功（1 题）。
- ✅ `questionnaire detail` 返回完整题目、选项和必答属性。
- ✅ `qa add-edit` 省略 `--question-id` 已真实创建答题卡 `hjqpl563p3`。
- ✅ `qa list` 可列出该答题卡，count=1，status=draft，answer=A，itemType=0。

## 13. 根因与修复说明

### 13.1 `legacy-list` 与 `list` 的设计问题

旧版 CLI 把两个不同业务语义的接口命名错位了：

| 旧命令 | 实际接口 | 实际语义 | 问题 |
|---|---|---|---|
| `questionnaire legacy-list` | `GET /live/v3/channel/questionnaire/list` | 查询频道问卷列表 | 用户真正想要的 `list` 被命名成 legacy |
| `questionnaire list` | `GET /live/v3/channel/questionnaire/list-answer-records` | 分页查询频道问卷结果 | 名字像问卷列表，但实际是问卷结果 |

1.2.35 的最终命名：

| 新命令 | 语义 | 关键参数 |
|---|---|---|
| `questionnaire list` | 查询频道问卷列表 | `--start-time`、`--end-time`、`--page`、`--size` |
| `questionnaire result-list` | 分页查询频道问卷结果 | `--session-id`、`--start-date`、`--end-date`、`--page`、`--size` |

本次按要求**不保留** `questionnaire legacy-list` 兼容别名，避免继续扩大歧义。

### 13.2 `qa add-edit` 新建路径

后端接口 `/live/v3/channel/interact/question/add-edit-question` 的契约是：`questionId` 修改时必填，不填则新增答题卡。

latest 已修复为：

- `qa add-edit --question-id` 从必填改为可选。
- Handler 允许省略 `questionId`，但显式空字符串仍报错。
- SDK 只在传入 `questionId` 时校验非空。
- CLI service 省略 `questionId` 时不向 SDK 传该字段。
- `qa list` 兼容 SDK 原始返回的顶层 `list` 结构。

1.2.35 真实验证：省略 `--question-id` 创建 QA `hjqpl563p3` 成功，`qa list` 可查回。

## 14. 风险点与处理方式

| 风险 | 说明 | 处理方式 |
|---|---|---|
| 问卷列表与问卷结果混淆 | `list` 与 `result-list` 分别对应不同接口 | 运营验证问卷是否创建成功用 `questionnaire list` 或 `detail`；查回收结果用 `result-list` |
| 问卷结果为空 | 当前问卷为 `saved`，未发布且无答题回收 | `result-list` 返回空结果是预期，不算失败 |
| QA 编辑与新建语义不同 | 传 `--question-id` 表示编辑已有答题卡 | 新建时省略 `--question-id`，编辑时传真实 QA ID |
| 残留测试资产 | 频道、问卷、QA 会保留 | 本轮按约定不删除，供人工查看 |

## 15. 保留资产说明

| 资产 | ID | 说明 |
|---|---|---|
| 测试频道 | `7987540` | `GNHF-电商场景-04-qa-questionnaire-latest-1.2.35`，活动营销/纯视频横屏 |
| 意向调研问卷 | `hjqpkq8dfl` | 新品首发-购买意向调研-1.2.35，3 题，status=saved |
| 价格预期问卷 | `hjqpkqer8i` | 新品首发-价格心理预期-1.2.35，1 题，status=saved |
| 售前答题卡 | `hjqpl563p3` | latest 1.2.35 创建，status=draft，answer=A，itemType=0 |

> 频道、问卷、QA 均已保留，未执行删除。

## 16. 可复用模板

```bash
# 建售前摸底问卷
npx --yes polyv-live-cli@latest questionnaire create \
  -c <频道ID> --title "<问卷标题>" \
  --questions '[{"name":"<单选题干>","type":"R","options":["<选项1>","<选项2>","<选项3>"],"required":"Y"},{"name":"<填空题干>","type":"Q","required":"N"}]' \
  -o json

# 验证问卷落库
npx --yes polyv-live-cli@latest questionnaire list -c <频道ID> -o json
npx --yes polyv-live-cli@latest questionnaire detail -c <频道ID> --questionnaire-id <问卷ID> -o json

# 查询问卷结果
npx --yes polyv-live-cli@latest questionnaire result-list -c <频道ID> -o json

# 新建 QA：省略 --question-id
npx --yes polyv-live-cli@latest qa add-edit \
  -c <频道ID> \
  --name "<答题卡标题>" --type R --item-type 0 \
  --option "<选项A>" --option "<选项B>" \
  --answer A --tip "<答案说明>" -f -o json

# 查询、推送、停止 QA
npx --yes polyv-live-cli@latest qa list -c <频道ID> -o json
npx --yes polyv-live-cli@latest qa send -c <频道ID> --question-id <真实问答卡ID> --duration 30 -o json
npx --yes polyv-live-cli@latest qa stop -c <频道ID> --question-id <真实问答卡ID> -o json
```

## 17. 后续动作

- 后续如果要覆盖发布态问卷，可在直播测试窗口追加 `questionnaire publish`/回收结果链路，不在本轮预热配置复测范围内执行。
- `questionnaire result-list` 当前只验证了无答题结果的空状态；有真实观众提交后应追加结果结构样例。
