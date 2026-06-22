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
STOP_WHEN="docs/ecommerce-scenarios/README.md 显示 polyv-live-cli-rc 的 40 个一级命令全部至少被一个电商营销场景覆盖，并且每个场景文档都包含完整的业务描述、命令链路、验证结果、风险与回滚说明"

gnhf \
  --agent "$GNHF_AGENT" \
  --worktree \
  --max-iterations "$MAX_ITERATIONS" \
  --stop-when "$STOP_WHEN" <<'GNHF_PROMPT'
你正在 polyv-live-cli 仓库中执行一个长期 GNHF 任务。目标不是泛泛补文档，而是把 polyv-live-cli-rc skill 的 40 个一级命令，转化为电商营销行业可落地的业务应用场景，并逐轮沉淀成文档。

每一轮只完成一个高质量场景。不要一次性铺很多空泛内容。

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
4. 从电商营销业务运作中选择一个真实场景，例如：
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
5. 本轮至少覆盖一个尚未覆盖的一级命令。可以组合多个命令完成一个业务闭环，但必须在索引中标记覆盖关系。
6. 写入或可能影响生产状态的命令必须按 skill 风险规则处理：
   - 先执行 `npx --yes polyv-live-cli@rc account current`
   - 先执行 `npx --yes polyv-live-cli@rc account list`
   - 没有账号或默认账号时，不要伪造执行结果；改为沉淀“命令已通过 help 校验，业务执行因缺少账号未执行”的文档
   - 不要修改用户长期使用的频道
   - 如需真实写入，必须使用临时测试频道/临时测试对象，并在文档中写清清理方式
   - 不要在文档中暴露 AppSecret、推流密钥、token 等敏感信息
7. 文档沉淀规则：
   - `docs/ecommerce-scenarios/README.md` 只做总索引和覆盖矩阵，不承载完整场景正文
   - 每个业务场景必须单独创建一个 Markdown 文件：`docs/ecommerce-scenarios/<两位序号>-<场景英文slug>.md`
   - 每轮只新增或完善一个场景文档，并同步更新 README 索引
   - README 中必须链接到每个场景文档，并维护 40 个一级命令的覆盖状态
8. 每个场景文档必须包含以下章节：
   - 场景名称
   - 覆盖命令
   - 行业背景
   - 业务目标与核心 KPI
   - 适用角色
   - 前置条件
   - polyv-live-cli-rc 能力映射
   - 实施步骤
   - 实际使用的 CLI 命令
   - 执行或验证结果
   - 风险点与回滚/清理方式
   - 可复用模板
   - 后续可扩展方向
9. `docs/ecommerce-scenarios/README.md` 必须维护总索引：
   - 场景列表
   - 已覆盖一级命令
   - 未覆盖一级命令
   - 每个场景对应的业务阶段：预热、开播、转化、互动、复购、数据复盘、治理
   - 命令覆盖矩阵：一级命令、覆盖场景、状态、文档链接
10. 每轮结束前做最小验证：
   - Markdown 链接可读
   - 本轮引用的命令都经过 `--help` 校验
   - README 覆盖统计与场景文档一致
   - 没有引入无关源码改动
11. 每轮成功后提交一个清晰 commit，commit 只包含本轮场景文档和索引更新。
12. 如果发现当前场景无法真实执行，不要失败退出；只要已经完成 help 校验、风险说明和可执行文档沉淀，就可以作为本轮成功。

约束：

- 遵守 AGENTS.md：如果需要 Python，必须使用 `/Users/nick/.browser-use-env/bin/python3`，不要使用 `python` 或 `python3`。
- 不要使用 npm latest、本地源码猜测 rc 语法；以 `npx --yes polyv-live-cli@rc ... --help` 为准。
- 不要改动无关测试、源码或配置。
- 不要把场景写成产品宣传稿，要写成运营人员能照着执行的业务操作手册。
- 不要重复已经覆盖过的命令，除非它服务于新的业务闭环。
- 文档使用中文。

停止条件：

当 `docs/ecommerce-scenarios/README.md` 显示 polyv-live-cli-rc 的 40 个一级命令全部至少被一个电商营销场景覆盖，并且每个场景文档都包含完整的业务描述、命令链路、验证结果、风险与回滚说明时停止。
GNHF_PROMPT
