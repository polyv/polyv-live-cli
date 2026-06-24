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
TARGET_BATCH_SIZE="${TARGET_BATCH_SIZE:-5}"
export TARGET_BATCH_SIZE
STOP_WHEN="node scripts/report-cli-subcommand-integration-coverage.mjs 统计显示 missingRealExecutionLeafTargets 为 0；docs/api-reference/cli-inventory.json 中的所有可执行 CLI 子命令，都有 packages/cli/tests/integration 下真实执行本地 CLI 的集成测试覆盖；每个需要账号或频道上下文的测试都创建临时测试频道并在测试结束删除；补充的集成测试全部通过"

gnhf \
  --agent "$GNHF_AGENT" \
  --worktree \
  --max-iterations "$MAX_ITERATIONS" \
  --stop-when "$STOP_WHEN" <<'GNHF_PROMPT'
你正在 polyv-live-cli 仓库中执行一个长期 GNHF 任务。目标是把 CLI 的全部子命令逐步补齐真实集成测试覆盖，而不是只做 help 校验、单元测试覆盖或文档记录。

每一轮从覆盖报告的 `missingRealExecutionTargets` 直接取一批尚未覆盖的 CLI 子命令，补高质量、可重复、可清理的真实集成测试。默认批量大小来自环境变量 `TARGET_BATCH_SIZE`，脚本默认值为 5；如果目标明显有共享 fixture、同属一个命令族或同一测试文件，可以少量超过；如果目标涉及危险写操作、复杂清理或 API 能力不确定，可以缩小到 1-2 个。

覆盖口径：

- `真实集成测试覆盖`：`packages/cli/tests/integration/**/*.test.ts` 中通过本地 CLI 入口真实执行目标命令，例如 `runCli(...)`、`runCliSuccess(...)` 或等价的 `node dist/index.js ...`，且目标命令不是 `--help`、不是纯 mock、不是只测 SDK service。
- `help 校验`：只能证明命令面存在，不能计入真实集成测试覆盖。
- `服务层测试`：SDK/service 测试有价值，但不能代替 CLI 子命令真实执行覆盖。
- `目标子命令`：优先选择命令树里的叶子命令；如果某个非叶子命令本身也有 action，才把它视为独立目标。

每轮必须执行以下流程：

1. 刷新并读取覆盖报告：
   - 默认不要运行 `node scripts/generate-cli-inventory.mjs`；每轮只补集成测试时，命令树不会变化，直接使用现有 `docs/api-reference/cli-inventory.json` 即可。
   - 只有在本轮修改了 `packages/cli/src/commands/**`、命令注册、命令路径/参数，或发现 `docs/api-reference/cli-inventory.json` 缺失/明显过期时，才运行 `node scripts/generate-cli-inventory.mjs` 刷新 `docs/api-reference/cli-inventory.json` 和 `docs/api-reference/CLI_INVENTORY.md`。
   - 运行 `node scripts/report-cli-subcommand-integration-coverage.mjs` 刷新 `docs/api-reference/cli-integration-coverage.json` 和 `docs/api-reference/CLI_INTEGRATION_COVERAGE.md`。
   - 读取 `docs/api-reference/cli-integration-coverage.json` 的 `summary.missingRealExecutionLeafTargets` 和 `missingRealExecutionTargets`：
     - 如果 `summary.missingRealExecutionLeafTargets === 0`，说明已经没有未真实执行覆盖的目标子命令，本轮不要再改代码，直接停止并报告覆盖完成。
     - 如果仍大于 0，本轮目标只能来自 `missingRealExecutionTargets`；不要靠人工猜测、help 覆盖或全仓扫描重新判断缺口。
   - 可以用下面命令快速查看候选池，直接以报告内容为准：
     `node -e "const r=require('./docs/api-reference/cli-integration-coverage.json'); console.log(r.summary); console.table(r.missingRealExecutionTargets.slice(0, Number(process.env.TARGET_BATCH_SIZE || 5) * 3).map(t => ({ command: t.command, file: t.file, line: t.line })))"`
2. 选择本轮批次：
   - 从 `missingRealExecutionTargets` 中选择一批目标，优先选择同一 top-level、同一源码文件、同一现有 integration 测试文件可承载、能复用同一临时频道或同一测试数据闭环的目标。
   - 批量上限默认按 `TARGET_BATCH_SIZE` 控制；每轮通常覆盖 3-5 个目标，除非缺口不足、目标风险较高或清理成本很大。
   - 优先补读命令；写命令必须有明确创建/更新/删除闭环。
   - 不要选择需要修改用户长期使用频道、生产对象或不可可靠清理的目标。
   - 对每个入选目标，读取 `missingRealExecutionTargets` 给出的 `file`/`line` 附近源码、对应 handler/service、现有 integration 测试和 helper，确认参数、测试落点和清理方式。
   - 不需要扫描全量 `packages/cli/tests/integration/**/*.test.ts` 来寻找缺口；覆盖报告已经完成静态覆盖判断。只在为本轮目标选择落点或排查异常时查看相关测试文件。
3. 覆盖口径必须保持严格：
   - 新增覆盖必须通过本地 CLI 入口真实执行目标命令，例如 `runCli(...)`、`runCliSuccess(...)` 或等价的 `node dist/index.js ...`。
   - `--help`、纯 mock、只测 command 注册、只测 handler/service、只通过 SDK service 调 API，都不能算本轮目标的真实执行覆盖。
   - 如果覆盖报告没有识别到新增命令，优先调整测试写法，让命令路径以静态字符串数组或可识别的本地 CLI 命令字符串出现；不要把报告改宽松来掩盖动态构造。
4. 所有新增真实集成测试都必须使用临时新建的频道：
   - 默认复用 `packages/cli/tests/helpers/channel-fixture.ts` 中的 `createTemporaryChannel`、`deleteTemporaryChannel`、`runCliSuccess`、`parseJsonObject` 等 helper。
   - 即使目标命令本身不是频道命令，只要测试需要真实账号/API 上下文，也要在测试开始创建一个临时频道作为本轮真实测试资产，并在 `finally` 或 `afterAll` 删除。
   - 目标命令如果需要 channel id，必须使用本轮新建的临时频道 id。
   - 目标命令如果会创建额外对象，必须记录 ID 并在测试结束清理；清理也要走真实 CLI 或现有安全 helper。
   - 测试失败路径也必须尽最大可能删除临时频道和额外测试对象。
5. 写测试前必须校验真实命令面：
   - 运行 `cd packages/cli && npm run build`。
   - 对批次中的每个目标运行 `node packages/cli/dist/index.js <target command path> --help`，确认参数名称、必填项、`--output json`、`--force` 等。
   - 不要凭旧文档或记忆猜参数。
6. 如果目标命令执行失败：
   - 不要把失败包装成“预期通过”来凑覆盖。
   - 查阅本地文档和源码，包括但不限于：
     - `docs/api-reference/CLI_INVENTORY.md`
     - `docs/api-reference/API_INVENTORY.md`
     - `docs/api-reference/CLI_COMMANDS_GUIDE.md`
     - 对应 `docs/api-reference` 模块文档
     - `packages/cli/src/commands/**`
     - `packages/cli/src/handlers/**`
     - `packages/cli/src/services/**`
     - `packages/sdk/src/services/**`
   - 根据真实失败原因修复测试、CLI 参数映射、handler/service 问题或 SDK 调用问题。
   - 重新运行目标测试，直到通过才结束本轮。
7. 集成测试实现要求：
   - 测试文件放在 `packages/cli/tests/integration/`。
   - 优先补到现有同命令族 integration 文件；只有现有结构不合适时才新增文件。
   - 使用 `hasRealCredentials()` 跳过无真实凭据环境。
   - 通过 `runCli`/`runCliSuccess` 执行本地 CLI，而不是直接调 handler 或 service。
   - 对 JSON 输出做最低限度结构断言，避免只断言 exit code。
   - 写命令使用 `--force`，避免非 TTY confirmation 阻塞。
   - 不在输出、日志、文档或测试名里泄露 AppSecret、token、推流密钥等敏感信息。
8. 每轮验证必须运行并通过：
   - `cd packages/cli && npm run build`
   - `cd packages/cli && RUN_INTEGRATION_TESTS=true POLYV_INTEGRATION_TESTS=true npx jest --config=jest.integration.config.js --runTestsByPath <本轮修改的 integration 测试文件...>`
   - `cd packages/cli && npm run cleanup:test-channels`
   - 如修改了共享 helper、handler、service 或命令注册，再运行受影响的单元测试或更宽的 integration 子集。
9. 每轮完成前检查：
   - 批次中每个目标子命令都已经被真实 CLI 集成测试执行，且不是 `--help`。
   - 再次运行 `node scripts/report-cli-subcommand-integration-coverage.mjs` 刷新覆盖报告，并确认本轮批次目标都已不在 `missingRealExecutionTargets` 中。
   - 本轮新增或修改测试使用临时频道，并在测试结束删除。
   - 测试通过后没有遗留临时频道；如清理命令报告失败，必须继续修复或记录明确原因，不要沉默。
   - 没有引入无关源码改动。
   - `git diff` 只包含本轮测试、必要修复，以及覆盖统计报告更新；只有本轮确实改了命令树时，才应包含由 `node scripts/generate-cli-inventory.mjs` 产生的清单更新。
10. 每轮由 GNHF 提交本轮改动。提交信息要点明新增覆盖的子命令路径；如果批次较多，按命令族概括并在正文列出具体路径。

可用上下文和约定：

- 当前 CLI 覆盖清单来源：`docs/api-reference/cli-inventory.json`，其中 summary 目前应显示约 40 个一级命令、约 724 条命令路径、578 个 OpenAPI CLI 映射。
- 当前真实集成测试覆盖报告来源：`docs/api-reference/cli-integration-coverage.json`，由 `node scripts/report-cli-subcommand-integration-coverage.mjs` 生成；以 `summary.missingRealExecutionLeafTargets` 和 `missingRealExecutionTargets` 作为每轮唯一选题依据。
- 真实 CLI 测试入口 helper：`packages/cli/tests/helpers/cli-runner.ts`。
- 临时频道 fixture：`packages/cli/tests/helpers/channel-fixture.ts`。
- 现有可参考测试：
  - `packages/cli/tests/integration/web.integration.test.ts`
  - `packages/cli/tests/integration/account-platform-global.integration.test.ts`
  - `packages/cli/tests/integration/small-modules.integration.test.ts`
  - `packages/cli/tests/integration/channel-remaining-cli.integration.test.ts`

约束：

- 遵守 AGENTS.md：如果需要 Python，必须使用 `/Users/nick/.browser-use-env/bin/python3`，不要使用 `python` 或 `python3`。
- 不要使用浏览器或 Playwright；本任务是 CLI 集成测试。
- 不要只新增 help 测试来声称真实覆盖。
- 不要跳过失败的真实目标命令；失败必须查文档、看源码并修复到测试通过。
- 不要依赖共享的 `POLYV_TEST_CHANNEL_ID` 来覆盖频道级命令。
- 不要删除或回滚用户已有改动；如果工作区不干净，脚本入口已经会拒绝运行。
- 不要无上限扩大批次；每轮覆盖一批相关、可验证、可清理的明确缺口，优先保证质量和可回滚性。
- 文档和提交说明使用中文。

停止条件：

当 `docs/api-reference/cli-inventory.json` 中所有可执行 CLI 子命令，都能在 `packages/cli/tests/integration` 下找到真实本地 CLI 执行测试覆盖，并且这些测试遵守临时频道创建/删除约定、目标集成测试全部通过时停止。
具体停止判定以 `node scripts/report-cli-subcommand-integration-coverage.mjs` 生成的 `docs/api-reference/cli-integration-coverage.json` 为准：当 `summary.missingRealExecutionLeafTargets` 为 0 时停止。
GNHF_PROMPT
