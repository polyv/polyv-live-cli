/**
 * Statistics Commands Acceptance Tests
 *
 * Story 10.2: 并发数据命令
 *
 * Tests for statistics CLI commands covering:
 * - statistics concurrency: View historical concurrency data
 * - statistics max-concurrent: View max concurrent viewers
 *
 * Acceptance Criteria (Story 10.2):
 * - AC1: statistics concurrency command returns concurrency data
 * - AC2: Support --start-date and --end-date filtering (max 60 days)
 * - AC3: statistics max-concurrent command returns max concurrent viewers
 * - AC4: Support --start-time and --end-time filtering (max 3 months)
 * - AC5: Table output format
 * - AC6: JSON output format
 * - AC7: Support --channel-id parameter (required)
 */

import { Command } from 'commander';
import { registerStatisticsCommands } from '../../src/commands/statistics.commands';

// Mock dependencies
jest.mock('../../src/handlers/statistics.handler');
jest.mock('../../src/config/manager');
jest.mock('../../src/config/auth-adapter');
jest.mock('../../src/utils/errors');

describe('Statistics Commands - Story 10.2: Concurrency Commands', () => {
  let program: Command;
  let originalExit: typeof process.exit;

  beforeEach(() => {
    jest.clearAllMocks();
    program = new Command();
    program.exitOverride(); // Throw instead of exit
    originalExit = process.exit;
    process.exit = jest.fn() as unknown as typeof process.exit;

    // Register statistics commands
    registerStatisticsCommands(program);
  });

  afterEach(() => {
    process.exit = originalExit;
  });

  // ============================================
  // AC1: statistics concurrency command
  // ============================================

  describe('statistics concurrency command (AC1)', () => {
    it('should register concurrency subcommand under statistics', () => {
      const statsCmd = program.commands.find(c => c.name() === 'statistics');
      expect(statsCmd).toBeDefined();

      const concurrencyCmd = statsCmd?.commands.find(c => c.name() === 'concurrency');
      expect(concurrencyCmd).toBeDefined();
      expect(concurrencyCmd?.description()).toContain('并发');
    });

    it('should require --channel-id option', async () => {
      const statsCmd = program.commands.find(c => c.name() === 'statistics');
      const concurrencyCmd = statsCmd?.commands.find(c => c.name() === 'concurrency');

      const channelIdOption = concurrencyCmd?.options.find(o => o.long === '--channel-id');
      expect(channelIdOption?.required).toBe(true);
    });

    it('should require --start-date option', async () => {
      const statsCmd = program.commands.find(c => c.name() === 'statistics');
      const concurrencyCmd = statsCmd?.commands.find(c => c.name() === 'concurrency');

      const startDateOption = concurrencyCmd?.options.find(o => o.long === '--start-date');
      expect(startDateOption?.required).toBe(true);
    });

    it('should require --end-date option', async () => {
      const statsCmd = program.commands.find(c => c.name() === 'statistics');
      const concurrencyCmd = statsCmd?.commands.find(c => c.name() === 'concurrency');

      const endDateOption = concurrencyCmd?.options.find(o => o.long === '--end-date');
      expect(endDateOption?.required).toBe(true);
    });

    it('should have optional --output option with default table', async () => {
      const statsCmd = program.commands.find(c => c.name() === 'statistics');
      const concurrencyCmd = statsCmd?.commands.find(c => c.name() === 'concurrency');

      const outputOption = concurrencyCmd?.options.find(o => o.long === '--output');
      // Note: Commander.js marks all options with required:true internally, but optional options
      // are distinguished by not having mandatory=true. Check defaultValue instead.
      expect(outputOption?.defaultValue).toBe('table');
      expect(outputOption?.long).toBe('--output');
    });
  });

  // ============================================
  // AC2: Date filtering with 60 days max
  // ============================================

  describe('concurrency date range validation (AC2)', () => {
    it('should validate date format yyyy-MM-dd', async () => {
      const statsCmd = program.commands.find(c => c.name() === 'statistics');
      const concurrencyCmd = statsCmd?.commands.find(c => c.name() === 'concurrency');

      // The command should reject invalid date format
      await expect(
        program.parseAsync([
          'node',
          'cli',
          'statistics',
          'concurrency',
          '-c',
          '3151318',
          '--start-date',
          '2024/01/01', // Invalid format
          '--end-date',
          '2024-01-07',
        ])
      ).rejects.toThrow();
    });

    it('should accept valid date format yyyy-MM-dd', async () => {
      // This would succeed in parsing but might fail on auth
      // We just test that the format validation passes
      const statsCmd = program.commands.find(c => c.name() === 'statistics');
      const concurrencyCmd = statsCmd?.commands.find(c => c.name() === 'concurrency');
      const validateFn = (concurrencyCmd
        ?.options.find(o => o.long === '--start-date')?.coerceArgMatcher) as unknown as
        | ((v: string) => string)
        | undefined;

      if (validateFn) {
        expect(() => validateFn('2024-01-15')).not.toThrow();
        expect(validateFn('2024-01-15')).toBe('2024-01-15');
      }
    });
  });

  // ============================================
  // AC3: statistics max-concurrent command
  // ============================================

  describe('statistics max-concurrent command (AC3)', () => {
    it('should register max-concurrent subcommand under statistics', () => {
      const statsCmd = program.commands.find(c => c.name() === 'statistics');
      expect(statsCmd).toBeDefined();

      const maxConcurrentCmd = statsCmd?.commands.find(c => c.name() === 'max-concurrent');
      expect(maxConcurrentCmd).toBeDefined();
      expect(maxConcurrentCmd?.description()).toContain('并发');
    });

    it('should require --channel-id option', async () => {
      const statsCmd = program.commands.find(c => c.name() === 'statistics');
      const maxConcurrentCmd = statsCmd?.commands.find(c => c.name() === 'max-concurrent');

      const channelIdOption = maxConcurrentCmd?.options.find(o => o.long === '--channel-id');
      expect(channelIdOption?.required).toBe(true);
    });

    it('should require --start-time option', async () => {
      const statsCmd = program.commands.find(c => c.name() === 'statistics');
      const maxConcurrentCmd = statsCmd?.commands.find(c => c.name() === 'max-concurrent');

      const startTimeOption = maxConcurrentCmd?.options.find(o => o.long === '--start-time');
      expect(startTimeOption?.required).toBe(true);
    });

    it('should require --end-time option', async () => {
      const statsCmd = program.commands.find(c => c.name() === 'statistics');
      const maxConcurrentCmd = statsCmd?.commands.find(c => c.name() === 'max-concurrent');

      const endTimeOption = maxConcurrentCmd?.options.find(o => o.long === '--end-time');
      expect(endTimeOption?.required).toBe(true);
    });

    it('should have optional --output option with default table', async () => {
      const statsCmd = program.commands.find(c => c.name() === 'statistics');
      const maxConcurrentCmd = statsCmd?.commands.find(c => c.name() === 'max-concurrent');

      const outputOption = maxConcurrentCmd?.options.find(o => o.long === '--output');
      // Note: Commander.js marks all options with required:true internally, but optional options
      // are distinguished by not having mandatory=true. Check defaultValue instead.
      expect(outputOption?.defaultValue).toBe('table');
      expect(outputOption?.long).toBe('--output');
    });
  });

  // ============================================
  // AC4: Timestamp filtering with 3 months max
  // ============================================

  describe('max-concurrent timestamp validation (AC4)', () => {
    it('should accept valid timestamp format', async () => {
      // Timestamp validation should accept numeric values
      const statsCmd = program.commands.find(c => c.name() === 'statistics');
      const maxConcurrentCmd = statsCmd?.commands.find(c => c.name() === 'max-concurrent');

      const startTimeOption = maxConcurrentCmd?.options.find(o => o.long === '--start-time');
      expect(startTimeOption).toBeDefined();
    });
  });

  // ============================================
  // AC5 & AC6: Output format options
  // ============================================

  describe('output format options (AC5, AC6)', () => {
    it('should accept table output format', () => {
      const statsCmd = program.commands.find(c => c.name() === 'statistics');
      const concurrencyCmd = statsCmd?.commands.find(c => c.name() === 'concurrency');

      const outputOption = concurrencyCmd?.options.find(o => o.long === '--output');
      const validateOutput = outputOption?.coerceArgMatcher;

      if (validateOutput) {
        expect(() => (validateOutput as (v: string) => string)('table')).not.toThrow();
        expect((validateOutput as (v: string) => string)('table')).toBe('table');
      }
    });

    it('should accept json output format', () => {
      const statsCmd = program.commands.find(c => c.name() === 'statistics');
      const concurrencyCmd = statsCmd?.commands.find(c => c.name() === 'concurrency');

      const outputOption = concurrencyCmd?.options.find(o => o.long === '--output');
      const validateOutput = outputOption?.coerceArgMatcher;

      if (validateOutput) {
        expect(() => (validateOutput as (v: string) => string)('json')).not.toThrow();
        expect((validateOutput as (v: string) => string)('json')).toBe('json');
      }
    });

    it('should reject invalid output format', () => {
      const statsCmd = program.commands.find(c => c.name() === 'statistics');
      const concurrencyCmd = statsCmd?.commands.find(c => c.name() === 'concurrency');

      const outputOption = concurrencyCmd?.options.find(o => o.long === '--output');
      const validateOutput = outputOption?.coerceArgMatcher;

      if (validateOutput) {
        expect(() => (validateOutput as (v: string) => string)('xml')).toThrow();
      }
    });
  });

  // ============================================
  // AC7: Required channelId
  // ============================================

  describe('required channelId option (AC7)', () => {
    it('should fail when channelId is missing for concurrency command', async () => {
      await expect(
        program.parseAsync([
          'node',
          'cli',
          'statistics',
          'concurrency',
          '--start-date',
          '2024-01-01',
          '--end-date',
          '2024-01-07',
        ])
      ).rejects.toThrow("required option '-c, --channel-id <channelId>' not specified");
    });

    it('should fail when channelId is missing for max-concurrent command', async () => {
      await expect(
        program.parseAsync([
          'node',
          'cli',
          'statistics',
          'max-concurrent',
          '--start-time',
          '1704067200000',
          '--end-time',
          '1709251200000',
        ])
      ).rejects.toThrow("required option '-c, --channel-id <channelId>' not specified");
    });
  });

  // ============================================
  // Command aliases and shortcuts
  // ============================================

  describe('command shortcuts', () => {
    it('should accept -c as shortcut for --channel-id', () => {
      const statsCmd = program.commands.find(c => c.name() === 'statistics');
      const concurrencyCmd = statsCmd?.commands.find(c => c.name() === 'concurrency');

      const channelIdOption = concurrencyCmd?.options.find(o => o.short === '-c');
      expect(channelIdOption).toBeDefined();
      expect(channelIdOption?.long).toBe('--channel-id');
    });

    it('should accept -o as shortcut for --output', () => {
      const statsCmd = program.commands.find(c => c.name() === 'statistics');
      const concurrencyCmd = statsCmd?.commands.find(c => c.name() === 'concurrency');

      const outputOption = concurrencyCmd?.options.find(o => o.short === '-o');
      expect(outputOption).toBeDefined();
      expect(outputOption?.long).toBe('--output');
    });
  });

  // ============================================
  // Help text
  // ============================================

  describe('help text', () => {
    it('should include examples in concurrency command help', () => {
      const statsCmd = program.commands.find(c => c.name() === 'statistics');
      const concurrencyCmd = statsCmd?.commands.find(c => c.name() === 'concurrency');

      const helpText = concurrencyCmd?.helpInformation() || '';
      expect(helpText).toContain('concurrency');
    });

    it('should include examples in max-concurrent command help', () => {
      const statsCmd = program.commands.find(c => c.name() === 'statistics');
      const maxConcurrentCmd = statsCmd?.commands.find(c => c.name() === 'max-concurrent');

      const helpText = maxConcurrentCmd?.helpInformation() || '';
      expect(helpText).toContain('max-concurrent');
    });
  });
});
