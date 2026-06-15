---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-generation-mode', 'step-03-test-strategy', 'step-04-generate-tests', 'step-05-validate-complete']
lastStep: 'step-05-validate-complete'
lastSaved: '2026-03-20'
storyId: '8-1'
storyFile: '_bmad-output/implementation-artifacts/8-1-coupon-commands.md'
inputDocuments:
  - '_bmad-output/implementation-artifacts/8-1-coupon-commands.md'
  - '_bmad/tea/testarch/knowledge/test-quality.md'
  - '_bmad/tea/testarch/knowledge/component-tdd.md'
  - 'packages/cli/src/commands/channel.commands.test.ts'
---

# ATDD Checklist: Story 8-1 优惠券命令

## Preflight & Context Summary

### Stack Detection
- **Detected Stack**: backend (Node.js CLI)
- **Test Framework**: Vitest
- **Project Type**: TypeScript monorepo

### Story Context
- **Story ID**: 8-1
- **Title**: CLI 优惠券命令
- **Status**: ready-for-dev

### Acceptance Criteria
1. `coupon add` 支持创建满减券（MAX_OUT）和折扣券（DISCOUNT）
2. `coupon list` 支持分页和状态过滤（NOT_START, GOING, FINISHED, INVALID）
3. `coupon delete` 支持批量删除（最多200个）
4. 所有命令支持 `--output table|json` 输出格式
5. 参数验证完善，错误消息用户友好

### Target Test Files
- `packages/cli/src/commands/coupon.commands.test.ts`
- `packages/cli/src/handlers/coupon.handler.test.ts`

### Existing Patterns Reference
- Command tests pattern: `packages/cli/src/commands/channel.commands.test.ts`
- Handler tests pattern: `packages/cli/src/handlers/channel.handler.test.ts`

## Step Progress
- [x] Step 1: Preflight & Context Loading
- [x] Step 2: Generation Mode (AI Generation - backend CLI)
- [ ] Step 3: Test Strategy
- [ ] Step 4: Generate Tests
- [ ] Step 5: Validate & Complete

## Generation Mode
- **Selected Mode**: AI Generation
- **Reason**: Backend CLI project, no browser UI recording needed
- **Source Material**: Story spec, API docs, existing command patterns

## Test Strategy

### Test Level Selection
| Level | Usage | Target Files |
|-------|-------|--------------|
| **Unit** | Command registration, validation functions, handler logic | `coupon.commands.test.ts`, `coupon.handler.test.ts` |
| **Integration** | SDK service calls (mocked), full command execution | `coupon.handler.test.ts` |

### Test Scenarios

#### coupon add (AC1)
- [P0] Create MAX_OUT (满减券) with valid params
- [P0] Create DISCOUNT (折扣券) with valid params
- [P0] Validate required fields (name, type, timestamps)
- [P1] Validate useTimeType RANGE requires useStart/useEnd
- [P1] Validate useTimeType DAY requires dayOfUse
- [P1] Validate rule.condition UNCONDITIONAL
- [P1] Validate rule.condition FULL_REDUCE (full, reduce)
- [P0] Error: missing required params
- [P1] Error: invalid type

#### coupon list (AC2)
- [P0] List with default pagination
- [P0] List with status filter (NOT_START, GOING, FINISHED, INVALID)
- [P1] List with custom page/size
- [P1] Output table format
- [P1] Output json format

#### coupon delete (AC3)
- [P0] Delete single coupon
- [P0] Delete batch (multiple IDs)
- [P1] Validate max 200 IDs limit
- [P1] Error: empty couponIds
- [P1] Error: exceed 200 limit

#### output formats (AC4)
- [P1] Table output formatting
- [P1] JSON output formatting

#### parameter validation (AC5)
- [P1] Invalid output format error
- [P1] Invalid status filter error
- [P0] User-friendly error messages

### Priority Summary
- **P0**: 10 tests (critical path)
- **P1**: 11 tests (edge cases & validation)
- **Total**: 21 test scenarios

## Generated Test Files

### coupon.commands.test.ts
- **Location**: `packages/cli/src/commands/coupon.commands.test.ts`
- **Test Count**: 25+ test cases
- **Coverage**:
  - coupon add 命令注册和执行 (MAX_OUT, DISCOUNT)
  - coupon list 命令注册和执行 (分页、状态过滤)
  - coupon delete 命令注册和执行 (批量删除)
  - 参数验证函数
  - 错误处理

### coupon.handler.test.ts
- **Location**: `packages/cli/src/handlers/coupon.handler.test.ts`
- **Test Count**: 30+ test cases
- **Coverage**:
  - addCoupon 方法 (创建优惠券)
  - listCoupons 方法 (查询列表)
  - deleteCoupons 方法 (批量删除)
  - 参数验证
  - 错误处理

## TDD Red Phase Status

🔴 **ALL TESTS WILL FAIL** - Implementation does not exist yet

| File | Status | Reason |
|------|--------|--------|
| `coupon.commands.test.ts` | ❌ FAIL | Module `./coupon.commands` not found |
| `coupon.handler.test.ts` | ❌ FAIL | Module `./coupon.handler` not found |

## Next Steps (Green Phase)

1. Create `packages/cli/src/commands/coupon.commands.ts`
2. Create `packages/cli/src/handlers/coupon.handler.ts`
3. Register coupon commands in CLI entry point
4. Run tests: `pnpm --filter polyv-live-cli test:unit`
5. Remove `test.skip()` to enable tests
6. Ensure 80%+ coverage
