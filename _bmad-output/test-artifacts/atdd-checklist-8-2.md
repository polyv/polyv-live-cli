---
stepsCompleted:
  - step-01-preflight-and-context
  - step-02-generation-mode
  - step-03-test-strategy
  - step-04-generate-tests
lastStep: step-04-generate-tests
lastSaved: '2026-03-20'
storyId: '8-2'
storyTitle: 'CLI 商品命令补全'
tddPhase: 'RED'
---

# ATDD Checklist - Story 8-2: CLI Product Commands

## Story Summary

**As a** user (developer or operations staff),
**I want to** add, update, and delete products through the CLI,
**so that I can** fully manage channel products for e-commerce live streaming scenarios.

## Acceptance Criteria

1. `product add` 支持创建普通商品（normal）、金融商品（finance）、职位商品（position）
2. `product update` 支持选择性字段更新
3. `product delete` 带安全确认机制（支持 `--force` 跳过确认）
4. 所有命令支持 `--output table|json` 输出格式
5. 参数验证完善，错误消息用户友好

---

## Test Strategy

### Stack Detection
- **Type:** Backend (Node.js CLI)
- **Framework:** Jest with ts-jest
- **Test Levels:** Unit, Handler, Integration (no E2E needed)

### Generation Mode
- **Mode:** AI Generation (backend project)
- **Reason:** No browser-based testing needed for CLI

---

## Test Coverage Matrix

| AC | Test File | Test Level | Priority | Status |
|----|-----------|------------|----------|--------|
| #1 | product.commands.test.ts | Unit | P0 | 🔴 Failing |
| #1 | product.handler.test.ts | Handler | P0 | 🔴 Failing |
| #2 | product.commands.test.ts | Unit | P0 | 🔴 Failing |
| #2 | product.handler.test.ts | Handler | P0 | 🔴 Failing |
| #3 | product.commands.test.ts | Unit | P0 | 🔴 Failing |
| #3 | product.handler.test.ts | Handler | P0 | 🔴 Failing |
| #4 | product.commands.test.ts | Unit | P1 | 🔴 Failing |
| #5 | product.commands.test.ts | Unit | P0 | 🔴 Failing |
| #5 | product.handler.test.ts | Handler | P0 | 🔴 Failing |

---

## Generated Test Cases

### Commands Tests (`product.commands.test.ts`)

#### AC #1: product add command
- [ ] `should register product add subcommand`
- [ ] `should register required options for add command`
- [ ] `should support --product-type with normal/finance/position values`

#### AC #2: product update command
- [ ] `should register product update subcommand`
- [ ] `should register required options for update command`
- [ ] `should support selective field updates (all fields optional except ids)`

#### AC #3: product delete command
- [ ] `should register product delete subcommand`
- [ ] `should register required options for delete command`
- [ ] `should support --force option to skip confirmation`

#### AC #4: output format support
- [ ] `add command should support --output table|json`
- [ ] `update command should support --output table|json`
- [ ] `delete command should support --output table|json`

#### AC #5: parameter validation
- [ ] `validateProductType - should accept "normal"`
- [ ] `validateProductType - should accept "finance"`
- [ ] `validateProductType - should accept "position"`
- [ ] `validateProductType - should reject invalid type`
- [ ] `validateProductStatus - should accept 1`
- [ ] `validateProductStatus - should accept 2`
- [ ] `validateProductStatus - should reject invalid`
- [ ] `validateLinkType - should accept 10`
- [ ] `validateLinkType - should accept 11`
- [ ] `validateLinkType - should reject invalid`

### Handler Tests (`product.handler.test.ts`)

#### AC #1: addProduct
- [ ] `should add a normal product successfully`
- [ ] `should add a finance product with yield field`
- [ ] `should add a position product with required fields`
- [ ] `should throw validation error when required fields are missing`
- [ ] `should throw validation error for invalid status`
- [ ] `should display result in table format`
- [ ] `should display result in JSON format`

#### AC #2: updateProduct
- [ ] `should update product name only`
- [ ] `should update multiple fields`
- [ ] `should throw validation error when productId is missing`
- [ ] `should throw validation error when channelId is missing`
- [ ] `should display success message in table format`
- [ ] `should display result in JSON format`

#### AC #3: deleteProduct
- [ ] `should delete product with confirmation when force is false`
- [ ] `should skip confirmation when force is true`
- [ ] `should cancel operation when user declines confirmation`
- [ ] `should throw validation error when productId is missing`
- [ ] `should display success message after deletion`
- [ ] `should display result in JSON format`

#### AC #5: validation helpers
- [ ] `should validate required fields for add operation`
- [ ] `should provide user-friendly error messages`

---

## TDD Red Phase Summary

### Status: 🔴 RED PHASE

All tests are **intentionally marked with `.skip`** and will **FAIL** until the feature is implemented.

This follows the TDD (Test-Driven Development) red-green-refactor cycle:
1. **RED** (current): Write failing tests that define expected behavior
2. **GREEN**: Implement minimal code to make tests pass
3. **REFACTOR**: Clean up and optimize code while keeping tests green

### Next Steps (Implementation Phase)

1. Add validation functions to `product.commands.ts`:
   - `validateProductType()`
   - `validateProductStatus()`
   - `validateLinkType()`

2. Add command handlers to `product.commands.ts`:
   - `product add` command registration
   - `product update` command registration
   - `product delete` command registration with `--force` option

3. Add handler methods to `product.handler.ts`:
   - `addProduct()`
   - `updateProduct()`
   - `deleteProduct()` with inquirer confirmation

4. Add service methods to SDK (if not exists):
   - `addChannelProduct()`
   - `updateChannelProduct()`
   - `deleteChannelProduct()`

5. Remove `.skip` from tests as features are implemented

6. Run tests to verify: `pnpm test:unit`

---

## Files Modified

| File | Changes |
|------|---------|
| `packages/cli/src/commands/product.commands.test.ts` | Added 30+ failing tests for AC #1-#5 |
| `packages/cli/src/handlers/product.handler.test.ts` | Added 25+ failing tests for AC #1-#5 |
| `_bmad-output/test-artifacts/atdd-checklist-8-2.md` | This checklist file |

---

## Statistics

- **Total Test Cases:** 55
- **Commands Tests:** 30
- **Handler Tests:** 25
- **Failing (Red):** 55
- **Passing (Green):** 0

---

## References

- Story File: `_bmad-output/implementation-artifacts/8-2-product-commands-complete.md`
- API Docs: `docs/api/channel/operate/`
- Related Story 8-1: Coupon commands implementation pattern
