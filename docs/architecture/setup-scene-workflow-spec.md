# Setup Scene Workflow Specification

## Status

- Status: proposed
- Scope: `polyv-live-cli setup <scene>` scene workflow commands
- Current baseline: one built-in `e-commerce` scene backed by YAML resources, `SceneConfigLoader`, `SceneExecutor`, `resource-handlers`, and `OutputRenderer`
- Primary goal: make complex business workflows safer, more predictable, and easier for AI agents to execute correctly

## Problem Statement

The CLI now exposes many first-level commands and deep subcommands. A user often describes a business outcome in natural language, such as "initialize an e-commerce live room" or "publish a replay-ready event", while the CLI surface is resource and API oriented. Without workflow commands, an AI agent must infer multiple command paths, sequence them correctly, pass all required IDs, and handle failures across several APIs.

The existing `setup e-commerce` command is a useful first workflow command, but it is not yet strong enough to serve as the standard pattern for future workflows:

- Real execution can create or modify multiple resources without a built-in `--force` or confirmation gate.
- `--list` and `--dry-run` currently pass through authentication setup before the user sees local-only information.
- Dry-run output only lists `would_create` resources and does not show a resolved execution plan.
- Some resource changes are not reversible, or their rollback behavior is implicit.
- Scene resource types are hardcoded in the loader and handler registry.
- The built-in e-commerce scene contains fixed demo data and is not parameterized enough for real repeated use.
- Output schema is useful but not complete enough for stable AI consumption.

## Goals

1. Preserve the existing `setup <scene>` user model.
2. Make write workflows safe by default through confirmation or `--force`.
3. Make dry-run a useful business plan preview without requiring credentials.
4. Produce stable JSON output that AI agents and scripts can consume.
5. Define explicit resource actions, risk, rollback support, and dependency behavior.
6. Support parameterized scenes so built-in workflows do not hardcode business data.
7. Keep existing `e-commerce` scene compatible during migration.
8. Establish a test standard before adding more built-in scenes.

## Non-Goals

- Do not replace lower-level commands such as `channel`, `product`, `coupon`, `web`, or `player`.
- Do not implement a generic transaction system across PolyV APIs.
- Do not require every API mutation to be reversible before it can be used in a scene.
- Do not add new built-in scenes until the workflow safety and output contract are in place.

## User-Facing Command Contract

### Command Shape

Keep the existing command:

```bash
polyv-live-cli setup [scene]
```

Add or standardize these options:

```bash
polyv-live-cli setup --list
polyv-live-cli setup --list --detailed
polyv-live-cli setup <scene> --dry-run -o json
polyv-live-cli setup <scene> --force -o json
polyv-live-cli setup <scene> --set key=value --set nested.key=value
polyv-live-cli setup <scene> --vars-file ./scene-vars.json
```

### Authentication Rules

- `setup --list` must not require authentication.
- `setup --list --detailed` must not require authentication.
- `setup <scene> --dry-run` must not require authentication unless a future scene explicitly declares a dry-run API validation step.
- `setup <scene>` without `--dry-run` requires authentication.

### Confirmation Rules

`setup <scene>` without `--dry-run` is a write workflow.

- If `--force` is present, execute after validating the plan.
- If running in an interactive TTY and `--force` is absent, show the plan summary and ask for confirmation.
- If running in a non-interactive environment and `--force` is absent, fail with a message explaining that `--dry-run` or `--force` is required.
- The confirmation prompt must include scene name, target account, number of resources, high-risk steps, and non-reversible steps.

### Dry-Run Rules

Dry-run must compile the scene into a plan without calling write APIs.

Dry-run JSON must include:

- execution order
- resource id, type, action, description
- dependency list
- risk level
- rollback support
- resolved static parameters
- unresolved resource references
- redacted sensitive fields

Dry-run must not claim a resource can be created successfully. It should use `planned` or `would_create` only.

## Scene DSL

### Current DSL Compatibility

The current YAML shape must continue to work:

```yaml
name: e-commerce
version: "1.0"
resources:
  - id: channel
    type: channel
    dependsOn: otherResource
    params:
      name: "demo-{timestamp}"
    output:
      channelId: channelId
```

During migration, the loader should normalize this into the new internal model.

### Proposed DSL v2

New scenes should use explicit actions and inputs:

```yaml
name: e-commerce
version: "2.0"
description: E-commerce live scene

inputs:
  channelName:
    type: string
    required: false
    default: "电商直播-{timestamp}"
  productName:
    type: string
    required: false
    default: "示例商品"
  productLink:
    type: string
    required: true
  couponName:
    type: string
    required: false
    default: "新人优惠券"

resources:
  - id: channel
    type: channel
    action: create
    description: Create e-commerce channel
    risk: high
    rollback:
      supported: true
      action: delete
    params:
      name: "{input.channelName}"
      newScene: alone
      template: portrait_alone
    output:
      channelId: channelId
      channelName: name

  - id: product
    type: product
    action: create
    description: Add product to channel
    dependsOn: channel
    risk: high
    rollback:
      supported: true
      action: delete
    params:
      channelId: "{channel.channelId}"
      name: "{input.productName}"
      link: "{input.productLink}"
    output:
      productId: productId
```

### Required Resource Fields

- `id`: unique resource id in the scene
- `type`: registered resource type
- `action`: `create`, `update`, `associate`, `enable`, `disable`, `delete`, `send`, `push`, `import`, `merge`, `transcode`, or another registered action
- `params`: object passed to the handler after variable resolution

### Recommended Resource Fields

- `description`: human-readable step description
- `dependsOn`: resource id or list of ids
- `risk`: `low`, `medium`, `high`
- `rollback.supported`: boolean
- `rollback.action`: compensating action name
- `rollback.note`: explanation when rollback is unsupported or partial
- `output`: mapping from exposed output fields to API response paths

### Variables

Support these variable namespaces:

- `{timestamp}`
- `{now}`
- `{now+Nd}`
- `{random:n-m}`
- `{input.name}`
- `{resourceId.field}`

Rules:

- Input variables are resolved before execution.
- Resource output variables are resolved only after the dependency resource is created.
- Dry-run must preserve unresolved resource references in the plan rather than failing, as long as the referenced resource and field are declared.
- Sensitive variables and parameters must be redacted in dry-run and final output.

## Resource Handler Contract

Handlers should move from a simple `create` shape to an action-aware shape.

```ts
interface SceneResourceHandler {
  type: string;
  actions: Record<string, SceneResourceActionHandler>;
}

interface SceneResourceActionHandler {
  risk: 'low' | 'medium' | 'high';
  supportsDryRun: boolean;
  rollback?: SceneRollbackHandler;
  validate(params: Record<string, unknown>): Promise<void> | void;
  execute(params: Record<string, unknown>, outputConfig?: Record<string, string>): Promise<Record<string, unknown>>;
  preview?(params: Record<string, unknown>): Promise<Record<string, unknown>> | Record<string, unknown>;
}
```

Implementation can keep the current `createResourceHandlers()` compatibility layer while adding the richer metadata internally.

## Plan Compilation

Before execution, compile a `SceneExecutionPlan`:

1. Load scene config.
2. Normalize v1 config to v2 internal model.
3. Validate required scene fields.
4. Merge defaults, `--set`, and `--vars-file`.
5. Validate declared inputs.
6. Validate resource ids and dependency graph.
7. Validate resource types and actions against the handler registry.
8. Resolve static variables.
9. Build execution order.
10. Redact sensitive fields.
11. Return plan.

The same compiled plan must be used for dry-run and real execution.

## Output Contract

JSON output should use a stable schema for both dry-run and real execution.

```json
{
  "success": true,
  "scene": "e-commerce",
  "dryRun": true,
  "confirmed": false,
  "duration": 0,
  "inputs": {
    "channelName": "电商直播-1710960000000"
  },
  "resources": [
    {
      "id": "channel",
      "type": "channel",
      "action": "create",
      "description": "Create e-commerce channel",
      "status": "planned",
      "dependsOn": [],
      "risk": "high",
      "rollback": {
        "supported": true,
        "action": "delete"
      },
      "paramsPreview": {
        "name": "电商直播-1710960000000",
        "newScene": "alone",
        "template": "portrait_alone"
      },
      "output": {},
      "timingMs": 0,
      "error": null
    }
  ],
  "rollback": {
    "attempted": false,
    "succeeded": [],
    "failed": []
  },
  "nextSteps": []
}
```

### Status Values

Resource status values:

- `planned`: dry-run step
- `created`: create action succeeded
- `updated`: update action succeeded
- `associated`: association action succeeded
- `enabled`: enable action succeeded
- `disabled`: disable action succeeded
- `skipped`: step intentionally skipped
- `failed`: step failed
- `rolled_back`: rollback succeeded
- `rollback_failed`: rollback failed

### Redaction Rules

Redact fields whose names match:

- `secret`
- `passwd`
- `password`
- `token`
- `key`
- `appSecret`

Do not redact user-requested stream push credentials returned by `stream get-key` in unrelated commands. For `setup`, default to redaction unless the scene explicitly declares a safe public output field.

## Error and Rollback Behavior

On failure:

1. Mark the failed resource with `status: failed`.
2. Attempt rollback in reverse creation order for resources with supported rollback.
3. Continue rollback even if one rollback fails.
4. Include rollback results in JSON output.
5. Return non-zero exit code.

For update or association steps:

- If rollback is supported, the handler must either snapshot previous state before execution or declare a deterministic compensating action.
- If rollback is unsupported, the resource must declare `rollback.supported: false` and a `rollback.note`.
- Plans with unsupported rollback can still execute, but confirmation must call out non-reversible steps.

## E-Commerce Scene Migration

The current `e-commerce` scene should migrate in stages.

### Stage 1

- Keep existing v1 YAML working.
- Add command-level `--force` and confirmation.
- Make `--list` and dry-run auth-free.
- Add richer dry-run plan output without changing the real execution behavior.

### Stage 2

- Add v2 inputs.
- Replace hardcoded product and coupon data with inputs and defaults.
- Add `--set` and `--vars-file`.
- Decide whether to wire `outputTemplate` into final table output or remove it from the scene config.

### Stage 3

- Convert `e-commerce.yaml` to v2.
- Mark every resource action with risk and rollback metadata.
- Add full real-command integration coverage.

## Implementation Phases

### Phase 1: Safety and CLI UX

- Add `--force` to `setup`.
- Add confirmation prompt for real execution.
- Require `--force` in non-interactive mode.
- Move auth loading after `--list` and dry-run planning.
- Preserve current `setup e-commerce --dry-run -o json` compatibility.

Acceptance criteria:

- `setup --list` succeeds without credentials.
- `setup e-commerce --dry-run -o json` succeeds without credentials.
- `setup e-commerce` without `--force` prompts in TTY.
- `setup e-commerce` without `--force` fails in non-TTY.
- `setup e-commerce --force` executes after validating plan.

### Phase 2: Plan Compiler and Output Contract

- Add `ScenePlanCompiler`.
- Normalize v1 scenes into internal plan model.
- Add stable JSON schema.
- Add redaction.
- Include resolved static params and unresolved resource references in dry-run.

Acceptance criteria:

- Dry-run output includes resource action, risk, rollback, dependencies, and `paramsPreview`.
- JSON schema is snapshot-tested.
- Existing scene tests continue to pass.

### Phase 3: DSL v2 and Parameterization

- Add `inputs` schema support.
- Add `--set key=value`.
- Add `--vars-file`.
- Add input validation and clear error messages.
- Keep v1 scene compatibility.

Acceptance criteria:

- Missing required input fails before API calls.
- `--set productLink=...` overrides the scene input.
- `--vars-file` and `--set` precedence is documented and tested.

Precedence:

1. CLI `--set`
2. `--vars-file`
3. scene input default

### Phase 4: Action-Aware Resource Registry

- Replace hardcoded supported resource types with handler registry metadata.
- Add action metadata, risk, and rollback support.
- Keep compatibility wrappers for existing handlers.

Acceptance criteria:

- Loader validates resource type and action through registry metadata.
- Adding a new resource action does not require editing a separate hardcoded type list.

### Phase 5: Rollback Semantics

- Add rollback result collection to `ExecutionResult`.
- Add unsupported rollback metadata.
- Add optional read-before-update snapshot hook for reversible updates.

Acceptance criteria:

- Failure output includes attempted rollback steps.
- Unsupported rollback steps are visible in dry-run and confirmation.
- Rollback failures are reported but do not hide the original failure.

### Phase 6: Integration Tests

Add real-command integration tests using temporary resources.

Required tests:

- `setup --list -o json`
- `setup e-commerce --dry-run -o json`
- `setup e-commerce --force -o json` happy path with cleanup
- failure rollback path using a controlled invalid later step
- non-interactive execution without `--force`

Rules:

- Tests that mutate channel-scoped state must create a temporary channel or scene-owned channel and clean it up in teardown.
- Do not rely on a preconfigured shared channel.
- Cleanup must run even when assertions fail.

### Phase 7: New Built-In Scenes

Only add more scenes after phases 1-6 are complete.

Candidate scenes:

- `training`: channel, document, checkin, qa, replay defaults
- `webinar`: public watch page, share settings, chat, replay
- `private-live`: watch condition, whitelist, auth, chat controls
- `replay-ready`: record settings, playback switch, title/order/transcode checks
- `interaction`: lottery, checkin, questionnaire, donate, interaction event defaults

Each new scene must have:

- v2 YAML
- input schema
- dry-run snapshot test
- real-command integration test when safe
- cleanup strategy
- rollback metadata

## Test Plan

### Unit Tests

- `SceneConfigLoader`
  - v1 normalization
  - v2 input validation
  - resource action validation
  - dependency validation
  - circular dependency errors
- `ScenePlanCompiler`
  - variable resolution
  - redaction
  - `--set` and `--vars-file` precedence
  - dry-run plan shape
- `SceneExecutor`
  - action execution order
  - rollback collection
  - unsupported rollback reporting
  - non-reversible step handling
- `OutputRenderer`
  - stable JSON schema
  - table summary
  - confirmation summary

### CLI Tests

- option registration
- auth-free list and dry-run
- non-TTY `--force` requirement
- invalid output format
- missing required input

### Integration Tests

- use real CLI binary from `dist/index.js`
- provision temporary channel/resources where needed
- cleanup all resources in teardown
- verify JSON schema and critical output fields

## Migration Notes

- Existing user scenes in `~/.polyv/scenes` should continue to load as v1 scenes.
- v1 scenes should emit a deprecation notice only in `--detailed` output at first, not during normal execution.
- Do not remove v1 support until at least one release after v2 scenes are documented.
- Update skill references only after npm publishes the changed command behavior.

## Open Questions

1. Should dry-run support optional live validation with credentials, for example `--validate-remote`?
2. Should execution write a local state file for crash recovery and later cleanup?
3. Should `setup` support `--channel-id` as a top-level shortcut, or should all overrides go through `--set channelId=...`?
4. Should `outputTemplate` be retained for table output, or replaced by structured `nextSteps` only?
5. Should rollback unsupported steps block execution unless `--allow-partial-rollback` is present?

## Definition of Done

The workflow system is ready for additional built-in scenes when all of the following are true:

- `setup` real execution is protected by confirmation or `--force`.
- `setup --list` and dry-run do not require credentials.
- Dry-run output is detailed enough for a user or AI agent to review planned mutations.
- JSON output schema is stable and tested.
- Every scene resource declares action, risk, and rollback semantics.
- Full `e-commerce` happy path has a real-command integration test with cleanup.
- Failure rollback behavior has a real or controlled integration test.
- The implementation remains backward compatible with existing v1 scene YAML.
