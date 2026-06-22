#!/bin/bash

set -euo pipefail

if ! command -v gnhf >/dev/null 2>&1; then
  echo "ERROR: gnhf is not available on PATH."
  exit 1
fi

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "ERROR: working tree is not clean. Commit or stash current changes before running gnhf."
  git status --short
  exit 1
fi

GNHF_AGENT="${GNHF_AGENT:-claude}"
MAX_ITERATIONS="${MAX_ITERATIONS:-1}"
STOP_WHEN="docs/ecommerce-scenarios/README.md 显示 polyv-live-cli-rc 的 40 个一级命令全部至少被一个电商营销场景真实执行覆盖，并且每个场景文档都包含专用测试频道、命令执行台账、执行结果或失败记录、风险说明与保留资产说明"

gnhf \
  --agent "$GNHF_AGENT" \
  --worktree \
  --max-iterations "$MAX_ITERATIONS" \
  --stop-when "$STOP_WHEN" <<'GNHF_PROMPT'
你正在 polyv-live-cli 仓库中执行一个长期 GNHF 任务。目标不是泛泛补文档，而是把 polyv-live-cli-rc skill 的 40 个一级命令，转化为电商营销行业可落地的业务应用场景，并逐轮沉淀成文档。

每一轮只完成一个高质量场景。不要一次性铺很多空泛内容。

本任务以真实执行为准，不接受只做 help 校验的场景覆盖。文档中列入“覆盖命令”的所有一级命令，必须至少有一个该命令族下的业务命令使用真实账号、真实测试频道或真实测试对象执行过。执行失败也要记录，但不能写成已执行成功；README 中可标为“已执行失败”，并保留错误、排查过程和下一步建议。

每轮必须执行以下流程：

1. 重新阅读 `/Users/nick/.agents/skills/polyv-live-cli-rc/SKILL.md`。
2. 根据本轮选择的业务场景，按 skill 的路由规则读取最相关 reference，例如：
   - 商品/优惠券/卡片推送/推广渠道：products.md、coupons.md、card-push.md、promotion.md
   - 直播互动：checkin.md、lottery.md、qa-questionnaire.md、donate.md、interaction.md
   - 观看页/播放器/访问控制：web.md、player.md、watch-condition.md、whitelist.md
   - 观众/用户/统计：viewer.md、custom-field.md、invite-sales.md、statistics.md
   - 频道/推流/场次/回放：channel-management.md、streaming.md、session-management.md、playback.md、record-settings.md
3. 运行真实 help 校验命令面，不能凭旧文档或记忆猜参数：
   - `npx --yes polyv-live-cli@rc --version`
   - `npx --yes polyv-live-cli@rc --help`
   - `npx --yes polyv-live-cli@rc <command> --help`
   - 必要时继续运行深层 `<subcommand> --help`
4. 每个场景都必须先创建一个专用测试频道：
   - 先执行 `npx --yes polyv-live-cli@rc account current`
   - 先执行 `npx --yes polyv-live-cli@rc account list`
   - 校验 `channel create` 或 `channel create-init` 的真实 help 后再创建频道
   - 频道名称必须能反映场景，例如 `GNHF-电商场景-01-coupon-redemption-<YYYYMMDDHHmm>`
   - 记录创建命令、频道 ID、频道名称、创建结果、账号环境
   - 本场景所有频道级命令都必须使用这个新建测试频道
   - 场景测试结束后不要删除这个频道；保留频道用于人工查看配置
   - 文档中必须写明“频道已保留，未执行删除”，并提供可选的人工清理命令，但明确这些清理命令未执行
   - 如果测试频道创建失败，本轮不能把场景记为成功覆盖；必须在文档或 GNHF notes 中记录失败原因、实际命令和错误输出
5. 从电商营销业务运作中选择一个真实场景，例如：
   - 新品直播首发
   - 限时秒杀转化
   - 会员专享直播
   - 私域社群召回
   - 达人分销推广
   - 直播间优惠券承接
   - 商品卡片节奏推送
   - 预约预热到直播转化
   - 直播后回放复购
   - 观众分层运营
   - 邀请榜单裂变
   - 售前答疑与问卷收集
   - 直播互动抽奖促活
   - 多渠道推广效果追踪
6. 本轮至少覆盖一个尚未真实执行覆盖的一级命令。可以组合多个命令完成一个业务闭环，但必须在索引中标记覆盖关系。覆盖口径如下：
   - `已执行成功`：使用真实测试频道/真实测试对象执行成功
   - `已执行失败`：使用真实测试频道/真实测试对象执行了命令，但 API 或参数报错；必须记录错误和下一步排查
   - `仅 help 校验`：只能放在“待执行/未覆盖”中，不能计入已覆盖命令
   - 不允许把只写了占位符的命令计入覆盖
7. 写入或可能影响生产状态的命令必须按 skill 风险规则处理：
   - 先执行 `npx --yes polyv-live-cli@rc account current`
   - 先执行 `npx --yes polyv-live-cli@rc account list`
   - 没有账号或默认账号时，不要伪造执行结果；本轮不能标记为成功覆盖，必须记录阻塞原因
   - 不要修改用户长期使用的频道
   - 所有真实写入必须使用本轮新建的专用测试频道/测试对象
   - 不要删除本轮新建测试频道；保留它供之后查看频道配置
   - 不要在文档中暴露 AppSecret、推流密钥、token 等敏感信息
8. 文档沉淀规则：
   - `docs/ecommerce-scenarios/README.md` 只做总索引和覆盖矩阵，不承载完整场景正文
   - 每个业务场景必须单独创建一个 Markdown 文件：`docs/ecommerce-scenarios/<两位序号>-<场景英文slug>.md`
   - 每轮只新增或完善一个场景文档，并同步更新 README 索引
   - README 中必须链接到每个场景文档，并维护 40 个一级命令的覆盖状态
   - README 的覆盖矩阵必须区分 `已执行成功`、`已执行失败`、`仅 help 校验`、`未覆盖`
9. 每个场景文档必须包含以下章节：
   - 场景名称
   - 覆盖命令
   - 专用测试频道
   - 行业背景
   - 业务目标与核心 KPI
   - 适用角色
   - 前置条件
   - polyv-live-cli-rc 能力映射
   - 实施步骤
   - 命令执行台账
   - 实际使用的 CLI 命令与真实参数
   - 执行或验证结果
   - 风险点与回滚/清理方式
   - 保留资产说明
   - 可复用模板
   - 后续可扩展方向
10. `docs/ecommerce-scenarios/README.md` 必须维护总索引：
   - 场景列表
   - 已覆盖一级命令
   - 未覆盖一级命令
   - 每个场景对应的业务阶段：预热、开播、转化、互动、复购、数据复盘、治理
   - 命令覆盖矩阵：一级命令、覆盖场景、执行状态、测试频道 ID、文档链接
11. 命令执行台账必须逐条记录：
   - 执行时间
   - 一级命令和子命令
   - 实际执行命令，敏感值脱敏
   - 使用的频道 ID 或对象 ID
   - 执行结果：成功/失败
   - 关键输出摘要
   - 如果失败，记录错误原文摘要、已做排查、下一步建议
12. 每轮结束前做最小验证：
   - Markdown 链接可读
   - 本轮引用的命令都经过 `--help` 校验且文档中列为覆盖的命令都真实执行过
   - README 覆盖统计与场景文档一致
   - 场景文档中的测试频道 ID 可在只读查询命令中查到
   - 测试频道没有被删除
   - 没有引入无关源码改动
13. 每轮完成后确保只留下本轮场景文档和索引更新，由 GNHF 负责提交本轮改动。
14. 如果某个命令真实执行失败，不要失败退出；记录到命令执行台账和问题记录中，然后继续完成本场景文档。但如果没有创建出专用测试频道，或文档列出的覆盖命令没有真实执行过，本轮不能声明成功覆盖。
15. 如果文档声称某个配置发生了“从 A 到 B”的变化，必须在命令执行台账中记录变更前查询和变更后查询。不能只记录变更后的结果。
16. 区分“配置侧验证”和“观众侧验证”：
   - 只通过 CLI/API 查询到配置正确时，只能写“配置侧已满足条件”。
   - 只有实际打开观看页、或通过明确的观看页/观众侧接口验证后，才能写“观众侧可见/可用”。
17. 如果执行结果和预期不一致，必须记录为问题发现。例如：创建频道时传入了描述字段，但 `channel get` 未返回该描述，就要写入“执行或验证结果”或“问题记录”，不能忽略。

约束：

- 遵守 AGENTS.md：如果需要 Python，必须使用 `/Users/nick/.browser-use-env/bin/python3`，不要使用 `python` 或 `python3`。
- 不要使用 npm latest、本地源码猜测 rc 语法；以 `npx --yes polyv-live-cli@rc ... --help` 为准。
- 不要改动无关测试、源码或配置。
- 不要把场景写成产品宣传稿，要写成运营人员能照着执行的业务操作手册。
- 不要重复已经真实执行覆盖过的命令，除非它服务于新的业务闭环。
- 不要在“覆盖命令”中列入没有真实执行的命令；仅 help 校验的命令只能放入待执行或后续扩展。
- 不要删除本轮创建的测试频道。
- 文档中的业务结论必须能在命令执行台账中找到证据；没有证据支撑的结论要降级为假设、待验证或问题记录。
- 文档使用中文。

停止条件：

当 `docs/ecommerce-scenarios/README.md` 显示 polyv-live-cli-rc 的 40 个一级命令全部至少被一个电商营销场景真实执行覆盖，并且每个场景文档都包含专用测试频道、命令执行台账、执行结果或失败记录、风险说明与保留资产说明时停止。
GNHF_PROMPT
