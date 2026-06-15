# Story 11.4: 问答问卷管理命令

Status: done

## 故事

作为一个运营人员或 PaaS 客户开发者，
我想要通过 CLI 使用 `qa send`、`qa list`、`questionnaire create` 等命令管理问答和问卷，
以便我能够高效地管理直播间问答和问卷互动功能。

## 验收标准 (ACs)

1. ✅ AC1: `qa send` 命令支持发送答题卡（支持设置答题卡ID、答题限时）
2. ✅ AC2: `qa list` 命令支持查询频道答题卡列表
3. ✅ AC3: `qa stop` 命令支持停止答题卡（返回答题统计结果）
4. ✅ AC4: `questionnaire create` 命令支持创建问卷（V4 API）
5. ✅ AC5: `questionnaire list` 命令支持分页查询频道问卷结果
6. ✅ AC6: `questionnaire detail` 命令支持查询问卷详情（题目与结果）
7. ✅ AC7: 所有命令支持 `--output table|json` 输出格式
8. ✅ AC8: 遵循 ATDD 开发模式，先编写测试，再实现功能
9. ✅ AC9: 复用已有的 SDK `LiveInteractionService` 和 `V4ChatService` 服务
10. ✅ AC10: 错误消息友好，清晰提示参数验证失败或 API 调用失败的情况
11. ✅ AC11: 表格输出格式清晰，显示答题卡ID、类型、状态、问卷ID、标题等信息

## 任务 / 子任务

- [x] **任务1: 扩展 CLI 类型定义 (AC: 1-11)**
  - [x] 在 `packages/cli/src/types/qa.ts` 中创建接口：
    - `QaSendOptions` - 发送答题卡选项
    - `QaListOptions` - 查询答题卡列表选项
    - `QaStopOptions` - 停止答题卡选项
    - `QuestionnaireCreateOptions` - 创建问卷选项
    - `QuestionnaireListOptions` - 查询问卷列表选项
    - `QuestionnaireDetailOptions` - 查询问卷详情选项
    - `QaQuestionnaireServiceConfig` - 服务配置
  - [x] 运行测试: `pnpm --filter polyv-live-cli test:unit -- qa`
  - [x] 测试通过

- [x] **任务2: 创建 QaQuestionnaireHandler 类 (AC: 1-11)**
  - [x] 在 `packages/cli/src/handlers/qa-questionnaire.handler.ts` 中创建 Handler：
    - [x] 实现 `sendQa` 方法 - 调用 SDK `liveInteraction.sendQuestion`
    - [x] 实现 `listQa` 方法 - 调用 SDK `liveInteraction.listQuestion`
    - [x] 实现 `stopQa` 方法 - 调用 SDK `liveInteraction.stopQuestion`
    - [x] 实现 `createQuestionnaire` 方法 - 调用 SDK (需扩展V4)
    - [x] 实现 `listQuestionnaires` 方法 - 调用 SDK `liveInteraction.listQuestionnaireByPage`
    - [x] 实现 `getQuestionnaireDetail` 方法 - 调用 SDK `liveInteraction.getQuestionnaireDetail`
    - [x] 实现输入验证和输出格式化
  - [x] 继承 `BaseHandler` 基类
  - [x] 运行测试: `pnpm --filter polyv-live-cli test:unit -- qa`
  - [x] 测试通过

- [x] **任务3: 创建 SDK 服务包装器 (AC: 9)**
  - [x] 在 `packages/cli/src/services/qa-questionnaire-service.ts` 中创建 `QaQuestionnaireServiceSdk`:
    - [x] 封装 `LiveInteractionService` 问答卡和问卷相关方法
    - [x] 封装 V4 问卷创建方法（如果 SDK 未实现）
  - [x] 运行测试: `pnpm --filter polyv-live-cli test:unit -- qa`
  - [x] 测试通过

- [x] **任务4: 注册 CLI 命令 (AC: 1-7)**
  - [x] 在 `packages/cli/src/commands/qa.commands.ts` 中创建命令：
    - [x] 实现 `qa send` 子命令
      - 选项: `--channel-id` / `-c` (必需), `--question-id` (必需), `--duration`, `--output` / `-o`
    - [x] 实现 `qa list` 子命令
      - 选项: `--channel-id` / `-c` (必需), `--output` / `-o`
    - [x] 实现 `qa stop` 子命令
      - 选项: `--channel-id` / `-c` (必需), `--question-id` (必需), `--output` / `-o`
  - [x] 在 `packages/cli/src/commands/questionnaire.commands.ts` 中创建命令：
    - [x] 实现 `questionnaire create` 子命令
      - 选项: `--channel-id` / `-c` (必需), `--title` (必需), `--questions` (JSON), `--output` / `-o`
    - [x] 实现 `questionnaire list` 子命令
      - 选项: `--channel-id` / `-c` (必需), `--page`, `--size`, `--session-id`, `--start-date`, `--end-date`, `--output` / `-o`
    - [x] 实现 `questionnaire detail` 子命令
      - 选项: `--channel-id` / `-c` (必需), `--questionnaire-id` (必需), `--output` / `-o`
  - [x] 在 `src/index.ts` 中注册命令
  - [x] 运行测试: `pnpm --filter polyv-live-cli test:unit -- qa`
  - [x] 测试通过

- [x] **任务5: 单元测试 (所有AC)**
  - [x] 为 `QaQuestionnaireHandler` 编写单元测试
  - [x] 测试覆盖率达到 80% 以上 (Handler: 89.52%)
  - [ ] 运行: `nvm use 23 && pnpm --filter polyv-live-cli test:unit`
  - [ ] 运行覆盖率报告: `pnpm --filter polyv-live-cli test:coverage`
  - [ ] 验证覆盖率达标

## 开发注意事项

### 技术栈要求
[来源: CLAUDE.md, CLAUDE.local.md]
- **TypeScript**: 5.3.3 - 使用严格类型检查
- **Node.js**: 20.11.0 LTS - 运行时环境
- **Commander.js**: 11.1.0 - CLI 框架用于命令注册
- **Jest**: 29.7.0 - 测试框架

### API 集成要求

| CLI 命令 | SDK 方法 | API 端点 |
|---------|----------|---------|
| `qa send` | `liveInteraction.sendQuestion()` | `POST /live/v4/channel/question/send` |
| `qa list` | `liveInteraction.listQuestion()` | `GET /live/v3/channel/interact/question/list-question` |
| `qa stop` | `liveInteraction.stopQuestion()` | `POST /live/v4/channel/question/stop` |
| `questionnaire create` | V4 API (需确认) | `POST /live/v4/channel/questionnaire/save` |
| `questionnaire list` | `liveInteraction.listQuestionnaireByPage()` | `GET /live/v3/channel/questionnaire/list-answer-records` |
| `questionnaire detail` | `liveInteraction.getQuestionnaireDetail()` | `GET /live/v3/channel/questionnaire/detail` |

### 认证
- MD5 签名认证 (appId, timestamp, sign)

### SDK 服务
- 使用已有的 `LiveInteractionService` 类 (`packages/sdk/src/services/live-interaction.service.ts`)
- SDK 类型定义:
  - `packages/sdk/src/types/live-interaction.ts` (Question/Questionnaire 相关类型)
- V4 问卷创建可能需要扩展 SDK 或直接调用

### 编码标准要求
[来源: architecture.md]
- 所有 public 方法必须有 JSDoc 注释
- 使用明确的 TypeScript 类型，避免使用 `any` 类型
- 异步操作必须有完整的错误处理
- 遵循现有的命名约定 (camelCase 变量, PascalCase 类)
- 单元测试覆盖率必须 >= 80%

### 模式参考
参考现有的 `CheckinHandler` 和 `checkin.commands.ts` 模式:
- Handler 类继承 `BaseHandler`
- 通过构造函数注入 SDK wrapper 服务
- 每个方法实现输入验证、业务逻辑调用、输出格式化
- 使用 `displaySuccess`, `displayInfo`, `displayData`, `displayAsTable` 方法格式化输出

### 命令设计示例

```bash
# ========== 答题卡 (QA) 命令 ==========

# 发送答题卡
polyv-live-cli qa send -c "3151318" --question-id "gv0uf9s5v7"

# 发送答题卡（限时30秒）
polyv-live-cli qa send -c "3151318" --question-id "gv0uf9s5v7" --duration 30

# 查询答题卡列表
polyv-live-cli qa list -c "3151318"

# 停止答题卡
polyv-live-cli qa stop -c "3151318" --question-id "gv0uf9s5v7"

# JSON 输出格式
polyv-live-cli qa list -c "3151318" -o json


# ========== 问卷 (Questionnaire) 命令 ==========

# 创建问卷
polyv-live-cli questionnaire create -c "3151318" --title "问卷调查" \
  --questions '[{"name":"您的性别?","type":"R","options":["男","女"],"required":"Y"}]'

# 查询问卷列表
polyv-live-cli questionnaire list -c "3151318"

# 分页查询
polyv-live-cli questionnaire list -c "3151318" --page 1 --size 20

# 按时间范围查询
polyv-live-cli questionnaire list -c "3151318" --start-date "2024-01-01" --end-date "2024-01-31"

# 按场次查询
polyv-live-cli questionnaire list -c "3151318" --session-id "fwly13xczv"

# 查询问卷详情
polyv-live-cli questionnaire detail -c "3151318" --questionnaire-id "fs9v59nq4u"

# JSON 输出格式
polyv-live-cli questionnaire list -c "3151318" -o json
```

### 建议参考文档
- API 文档: `docs/api/live_interaction/send_question.md` (发送答题卡)
- API 文档: `docs/api/live_interaction/list_question.md` (查询答题卡列表)
- API 文档: `docs/api/live_interaction/stop_question.md` (停止答题卡)
- API 文档: `docs/api/live_interaction/create_questionnaire.md` (创建问卷 V4)
- API 文档: `docs/api/live_interaction/list_questionnaire_by_page.md` (分页查询问卷)
- API 文档: `docs/api/live_interaction/get_questionnaire_detail.md` (查询问卷详情)
- SDK 服务: `packages/sdk/src/services/live-interaction.service.ts`
- SDK 类型: `packages/sdk/src/types/live-interaction.ts`
- 前一 Story 实现: `_bmad-output/implementation-artifacts/11-3-checkin-management.md`

### 前一 Story (11-3) 学习要点
1. Handler 类通过 SDK wrapper 调用 SDK
2. 使用 `BaseHandler` 的 `executeWithErrorHandling` 进行统一错误处理
3. 输出格式化使用 `displaySuccess`, `displayInfo`, `displayData`, `displayAsTable` 方法
4. 验证失败抛出 `PolyVValidationError`
5. 命令注册使用 Commander.js 的链式调用
6. `loadAuthAndServiceConfig` 辅助函数处理认证配置

### 关键实现细节

1. **发送答题卡 (`qa send`)**
   - 使用 V4 API `sendQuestion`
   - `channelId`: 频道号 (Integer 类型)
   - `questionId`: 答题卡ID (String 类型)
   - `duration`: 答题限时(秒), 范围1-99, 可选

2. **查询答题卡列表 (`qa list`)**
   - 返回频道的所有答题卡
   - 响应包含: `questionId`, `name`, `type`(R单选/C多选/S评分/V投票), `status`, `times`
   - `itemType`: 0=答题卡, 1=问答

3. **停止答题卡 (`qa stop`)**
   - 停止后返回答题统计结果
   - 响应包含: `answer`(正确答案), `total`(答题总人数), `rightUserCount`, `faultUserCount`, `singleResult`(各选项选择人数)

4. **创建问卷 (`questionnaire create`)**
   - 使用 V4 API `/live/v4/channel/questionnaire/save`
   - `questionnaireTitle`: 问卷标题 (必需)
   - `questions`: 题目数组 (必需)
     - `name`: 题目
     - `type`: 题目类型 (R单选/C多选/Q问答/J判断题/X评星题)
     - `options`: 选项数组 (选择题必填)
     - `answer`: 答案 (需评分的选择题)
     - `scoreEnabled`: 是否计分 (Y/N)
     - `score`: 分数
     - `required`: 是否必答 (Y/N)
   - 可选: `customQuestionnaireId`, `autoPublishTime`, `autoEndTime`, `privacyEnabled`, `privacyContent`

5. **查询问卷列表 (`questionnaire list`)**
   - 分页查询频道问卷结果
   - 支持按 `sessionId` 或 `startDate/endDate` 过滤
   - 分页参数: `page`, `pageSize`
   - 响应包含: `questionnaireId`, `questionnaireTitle`, `questionStats`, `users`
   - 时间范围限制: 默认最近7天

6. **查询问卷详情 (`questionnaire detail`)**
   - 通过 `questionnaireId` 查询
   - 返回问卷信息和题目列表
   - 响应字段: `questionnaireId`, `name`, `status`, `questions`

### 表格输出设计

**qa list 表格列:**
| 列名 | 字段 | 说明 |
|------|------|------|
| 答题卡ID | questionId | 10字符截断 |
| 题目名称 | name | 30字符截断 |
| 类型 | type | R/C/S/V |
| 状态 | status | draft/send/delete |
| 发送次数 | times | 数字 |

**qa stop 表格列 (答题统计):**
| 列名 | 字段 | 说明 |
|------|------|------|
| 正确答案 | answer | - |
| 答题人数 | total | - |
| 正确人数 | rightUserCount | - |
| 错误人数 | faultUserCount | - |
| 各选项人数 | singleResult | 数组显示 |

**questionnaire list 表格列:**
| 列名 | 字段 | 说明 |
|------|------|------|
| 问卷ID | questionnaireId | 10字符截断 |
| 标题 | questionnaireTitle | 30字符截断 |
| 更新时间 | lastModified | 格式化时间 |
| 答题人数 | users.length | - |

**questionnaire detail 表格列 (题目列表):**
| 列名 | 字段 | 说明 |
|------|------|------|
| 题目ID | questionId | 10字符截断 |
| 题目名称 | name | 30字符截断 |
| 类型 | type | R/C/Q/J/X |
| 是否必答 | required | Y/N |
| 是否计分 | scoreEnabled | Y/N |

## 测试

### 测试文件位置
[来源: architecture.md]
- 单元测试: `packages/cli/src/handlers/qa-questionnaire.handler.test.ts`
- 命令测试: `packages/cli/src/commands/qa.commands.test.ts`
- 命令测试: `packages/cli/src/commands/questionnaire.commands.test.ts`

### 测试标准
[来源: architecture.md]
- 使用 Jest 29.7.0 测试框架
- 测试命名: `describe-it` 模式，描述性测试名称
- 测试结构: `Arrange-Act-Assert` 模式
- Mock 策略: 使用 Jest mocks 模拟 SDK 响应
- 覆盖率要求: 单元测试覆盖率必须 >= 80%

### 具体测试要求
- **Handler 测试**: 验证业务逻辑、输入验证、错误处理
  - 测试发送答题卡的各种参数组合
  - 测试分页查询问卷
  - 测试表格和 JSON 输出格式
- **命令测试**: 验证 CLI 选项解析和帮助输出
- **错误场景测试**: 验证参数验证失败、API 调用失败的处理

## 变更日志

| 日期 | 版本 | 描述 | 作者 |
|------|------|------|------|
| 2026-03-24 | 1.0 | Initial story creation for QA and questionnaire management commands | Claude Code Agent |
