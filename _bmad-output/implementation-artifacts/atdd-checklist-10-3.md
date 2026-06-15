---
stepsCompleted: ['step-01-preflight-and-context']
lastStep: 'step-01-preflight-and-context'
lastSaved: '2026-03-22'
story_id: '10-3'
inputDocuments:
  - '_bmad-output/implementation-artifacts/10-3-statistics-audience.md'
  - '_bmad/tea/testarch/knowledge/data-factories.md'
---

# ATDD Checklist - Story 10.3: Statistics Audience Commands

## Preflight Verification

### Stack Detection
- **Detected Stack**: `backend` (CLI/Node.js project)
- **Test Framework**: Jest (CLI), Vitest (SDK)
- **No browser automation required**

### Prerequisites Verified
- [x] Story approved with clear acceptance criteria (7 ACs)
- [x] Test framework configured (Jest + Vitest)
- [x] Development environment available
- [x] Existing test patterns identified (statistics.commands.test.ts, statistics.handler.test.ts)

## Acceptance Criteria Mapping

| AC | Description | Test Location |
|----|-------------|---------------|
| AC1 | `statistics audience region` returns region distribution (province/city/country) | SDK Service + CLI Handler |
| AC2 | `statistics audience device` returns device distribution (PC/mobile) | SDK Service + CLI Handler |
| AC3 | Support `--start-time` and `--end-time` filtering (90-day max) | SDK Service + CLI Handler |
| AC4 | `region` command supports `--type` parameter (country/province/city) | CLI Commands |
| AC5 | Table output format with clear columns | CLI Handler |
| AC6 | JSON output with complete fields | CLI Handler |
| AC7 | Required `--channel-id` parameter | CLI Commands |

## Test Files to Update/Create

### 1. SDK Service Tests (Vitest)
- **Path**: `packages/sdk/src/services/statistics.service.test.ts`
- **Coverage**: AC1, AC2, AC3
- **New Methods**:
  - `getRegionDistribution(params: GetRegionDistributionParams): Promise<RegionDistributionItem[]>`
  - `getDeviceDistribution(params: GetDeviceDistributionParams): Promise<DeviceDistributionItem[]>`

### 2. CLI Handler Tests (Jest)
- **Path**: `packages/cli/src/handlers/statistics.handler.test.ts`
- **Coverage**: AC1, AC2, AC3, AC5, AC6
- **New Methods**:
  - `viewRegionDistribution(options: StatisticsAudienceRegionOptions): Promise<void>`
  - `viewDeviceDistribution(options: StatisticsAudienceDeviceOptions): Promise<void>`

### 3. CLI Commands Tests (Jest)
- **Path**: `packages/cli/src/commands/statistics.commands.test.ts`
- **Coverage**: AC4, AC7, command registration
- **New Commands**:
  - `statistics audience` (command group)
  - `statistics audience region` (subcommand)
  - `statistics audience device` (subcommand)

## Test Design Patterns

Based on existing test patterns:
- Mock service dependencies using IStatisticsService interface
- Test validation errors for invalid inputs (90-day range, type validation)
- Test both table and JSON output formats
- Test required parameter validation (--channel-id)
- Test timestamp validation (--start-time, --end-time)

## Expected Interface Signatures

### SDK Types (packages/sdk/src/types/statistics.ts)

```typescript
// Region distribution types
export interface RegionDistributionItem {
  plays: number;
  viewers: number;
  ips: number;
  playDuration: number;
  country: string | null;
  province: string | null;
  city: string | null;
  percent: number;
}

export interface GetRegionDistributionParams {
  channelId: string;
  startTime: number;
  endTime: number;
  type?: 'country' | 'province' | 'city';
}

export interface GetRegionDistributionResponse {
  code: number;
  status: string;
  success: boolean;
  requestId: string;
  data: RegionDistributionItem[];
}

// Device distribution types
export interface DeviceDistributionItem {
  name: string;
  platform: string;
  plays: number;
  viewers: number;
  ips: number;
  playDuration: number;
  percent: number;
}

export interface GetDeviceDistributionParams {
  channelId: string;
  startTime: number;
  endTime: number;
}

export interface GetDeviceDistributionResponse {
  code: number;
  status: string;
  success: boolean;
  requestId: string;
  data: DeviceDistributionItem[];
}
```

### CLI Types (packages/cli/src/types/statistics.ts)

```typescript
// Region distribution options
export interface StatisticsAudienceRegionOptions {
  channelId: string;
  startTime: number;
  endTime: number;
  type?: 'country' | 'province' | 'city';
  output?: 'table' | 'json';
}

// Device distribution options
export interface StatisticsAudienceDeviceOptions {
  channelId: string;
  startTime: number;
  endTime: number;
  output?: 'table' | 'json';
}

// CLI display types
export interface RegionDistributionDisplayItem {
  region: string;
  plays: number;
  viewers: number;
  ips: number;
  playDuration: number;
  percent: string;
}

export interface DeviceDistributionDisplayItem {
  name: string;
  platform: string;
  plays: number;
  viewers: number;
  playDuration: number;
  percent: string;
}
```

### SDK Service Methods (packages/sdk/src/services/statistics.service.ts)

```typescript
// Extend StatisticsService class
async getRegionDistribution(
  params: GetRegionDistributionParams
): Promise<GetRegionDistributionResponse>;

async getDeviceDistribution(
  params: GetDeviceDistributionParams
): Promise<GetDeviceDistributionResponse>;
```

### CLI Service SDK Methods (packages/cli/src/services/statistics.service.sdk.ts)

```typescript
// Extend StatisticsServiceSdk class
async getRegionDistribution(
  options: StatisticsAudienceRegionOptions
): Promise<RegionDistributionDisplayItem[]>;

async getDeviceDistribution(
  options: StatisticsAudienceDeviceOptions
): Promise<DeviceDistributionDisplayItem[]>;
```

### CLI Handler Methods (packages/cli/src/handlers/statistics.handler.ts)

```typescript
// Extend StatisticsHandler class
async viewRegionDistribution(
  options: StatisticsAudienceRegionOptions
): Promise<void>;

async viewDeviceDistribution(
  options: StatisticsAudienceDeviceOptions
): Promise<void>;
```

### IStatisticsService Interface (packages/cli/src/handlers/statistics.handler.ts)

```typescript
// Extend interface
export interface IStatisticsService {
  // Existing methods...
  getDailyViewStatistics(options: StatisticsViewOptions): Promise<DailyViewStatisticsItem[]>;
  getConcurrencyData(options: StatisticsConcurrencyOptions): Promise<ConcurrencyDataPointItem[]>;
  getMaxConcurrent(options: StatisticsMaxConcurrentOptions): Promise<number>;
  // New methods
  getRegionDistribution(options: StatisticsAudienceRegionOptions): Promise<RegionDistributionDisplayItem[]>;
  getDeviceDistribution(options: StatisticsAudienceDeviceOptions): Promise<DeviceDistributionDisplayItem[]>;
}
```

## Test Execution Results (TDD Red Phase)

### Expected Failures

All new tests should fail because the implementation doesn't exist yet.

#### SDK Tests (Vitest)
- `getRegionDistribution` method does not exist
- `getDeviceDistribution` method does not exist
- 90-day validation logic not implemented
- Type parameter validation not implemented

#### CLI Handler Tests (Jest)
- `viewRegionDistribution` method does not exist
- `viewDeviceDistribution` method does not exist
- Table formatting for region/device not implemented
- IStatisticsService interface not extended

#### CLI Commands Tests (Jest)
- `statistics audience` command group not registered
- `statistics audience region` subcommand not registered
- `statistics audience device` subcommand not registered
- `--type` parameter not implemented
- `--start-time`/`--end-time` timestamp parameters not implemented

## Implementation Files Required

### SDK (packages/sdk/src/)
1. `types/statistics.ts` - Add new type definitions
2. `services/statistics.service.ts` - Add new SDK methods

### CLI (packages/cli/src/)
1. `types/statistics.ts` - Add CLI options and display types
2. `services/statistics.service.sdk.ts` - Add SDK wrapper methods
3. `handlers/statistics.handler.ts` - Add handler methods and extend IStatisticsService
4. `commands/statistics.commands.ts` - Register new commands
5. `utils/date-validation.ts` - Add 90-day validation function

## Key Validation Rules

### Time Range Validation (90 days)
- Time format: 13-digit millisecond timestamp
- Range: startTime to endTime must not exceed 90 days
- Error message: "Time range cannot exceed 90 days"

### Type Parameter Validation (region command)
- Valid values: `country`, `province`, `city`
- Default: `province`
- Error message: "Type must be one of: country, province, city"

### Required Parameters
- `--channel-id` (required for both commands)
- `--start-time` (required, 13-digit timestamp)
- `--end-time` (required, 13-digit timestamp)
- `--type` (optional, for region command only)

## Next Step

After creating failing tests, proceed to implementation (TDD green phase).

## Test Execution Results (TDD Red Phase)

### SDK Tests (Vitest)

```
 FAIL  src/services/statistics.service.test.ts (80 tests | 36 failed)
   - getRegionDistribution: "statisticsService.getRegionDistribution is not a function"
   - getDeviceDistribution: "statisticsService.getDeviceDistribution is not a function"

 36 tests failed (as expected - methods don't exist yet)
 44 tests passed (existing tests)
```

### CLI Handler Tests (Jest)

```
FAIL src/handlers/statistics.handler.test.ts
  StatisticsHandler
    viewRegionDistribution (Story 10.3 - AC1, AC5, AC6)
      - should call StatisticsService with correct parameters: "statisticsHandler.viewRegionDistribution is not a function"
      - should display region distribution in JSON format: "statisticsHandler.viewRegionDistribution is not a function"
      - should display region distribution table by default: "statisticsHandler.viewRegionDistribution is not a function"
      - should handle empty region data: "statisticsHandler.viewRegionDistribution is not a function"
      - should handle service errors: "statisticsHandler.viewRegionDistribution is not a function"
    viewDeviceDistribution (Story 10.3 - AC2, AC5, AC6)
      - should call StatisticsService with correct parameters: "statisticsHandler.viewDeviceDistribution is not a function"
      - should display device distribution in JSON format: "statisticsHandler.viewDeviceDistribution is not a function"
      - should display device distribution table by default: "statisticsHandler.viewDeviceDistribution is not a function"
      - should handle empty device data: "statisticsHandler.viewDeviceDistribution is not a function"
      - should handle service errors: "statisticsHandler.viewDeviceDistribution is not a function"

 10 tests failed (as expected - methods don't exist yet)
 9 tests passed (existing tests)
```

### CLI Commands Tests (Jest)

```
FAIL src/commands/statistics.commands.test.ts
  Statistics Commands
    statistics audience command group (Story 10.3)
      - should register statistics audience command group: "audienceCmd is undefined"
      - should register statistics audience region subcommand: "regionCmd is undefined"
      - should register statistics audience device subcommand: "deviceCmd is undefined"
    statistics audience region command options (AC7)
      - should register required --channel-id option: "channelIdOption is undefined"
      - should register --channel-id with short option -c: "expected '-c', received undefined"
      - should register --start-time option for timestamps: "--start-time not in option names"
      - should register --end-time option for timestamps: "--end-time not in option names"
      - should register --output option: "--output not in option names"
    statistics audience region --type parameter (AC4)
      - should register --type option for region command: "typeOption is undefined"
      - (other tests fail due to missing commands)
    statistics audience device command options (AC7)
      - (all tests fail due to missing commands)
    audience command help information
      - (all tests fail due to missing commands)

 26 tests failed (as expected - commands not registered yet)
 27 tests passed (existing tests)
```

### Status: RED PHASE COMPLETE

All 72 new tests fail as expected because implementation files don't exist yet:
- SDK: 36 failing tests for `getRegionDistribution` and `getDeviceDistribution`
- CLI Handler: 10 failing tests for `viewRegionDistribution` and `viewDeviceDistribution`
- CLI Commands: 26 failing tests for `statistics audience` command group

Total new tests: 72
All failing as expected (TDD red phase)
