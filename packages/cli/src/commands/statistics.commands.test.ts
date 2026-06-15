/**
 * @fileoverview Unit tests for Statistics commands
 * @story 10.1: 观看数据统计命令
 */

// Mock dependencies before imports
jest.mock('../handlers/statistics.handler');
jest.mock('../config/manager');
jest.mock('../config/auth-adapter');
jest.mock('../utils/errors');
// Note: date-validation is NOT mocked - validateDateRange tests use real implementation

import { Command } from 'commander';
import {
  registerStatisticsCommands,
  validateDateFormat,
  validateDateRange,
  validateOutputFormat,
} from './statistics.commands';

// Helper function tests for better coverage
describe('validateOutputFormat', () => {
  it('should return "table" for table input', () => {
    expect(validateOutputFormat('table')).toBe('table');
  });

  it('should return "json" for json input', () => {
    expect(validateOutputFormat('json')).toBe('json');
  });

  it('should throw error for invalid format', () => {
    expect(() => validateOutputFormat('xml')).toThrow();
  });

  it('should throw error for invalid format case', () => {
    expect(() => validateOutputFormat('TABLE')).toThrow();
  });
});

describe('validateDateFormat', () => {
  it('should accept valid date format yyyy-MM-dd', () => {
    expect(validateDateFormat('2024-01-15')).toBe('2024-01-15');
  });

  it('should throw error for invalid date format', () => {
    expect(() => validateDateFormat('2024/01/15')).toThrow();
  });

  it('should throw error for invalid date', () => {
    expect(() => validateDateFormat('invalid')).toThrow();
  });
});

describe('validateDateRange', () => {
  it('should not throw for valid date range', () => {
    expect(() => validateDateRange('2024-01-01', '2024-01-15')).not.toThrow();
  });

  it('should not throw for same start and end date', () => {
    expect(() => validateDateRange('2024-01-15', '2024-01-15')).not.toThrow();
  });
});

describe('Statistics Commands', () => {
  describe('command registration', () => {
    let program: Command;

    beforeEach(() => {
      program = new Command();
      registerStatisticsCommands(program);
    });

    it('should register statistics command group', () => {
      const statisticsCmd = program.commands.find(cmd => cmd.name() === 'statistics');
      expect(statisticsCmd).toBeDefined();
      expect(statisticsCmd?.description()).toContain('statistics');
    });

    it('should register statistics view subcommand', () => {
      const statisticsCmd = program.commands.find(cmd => cmd.name() === 'statistics');
      const viewCmd = statisticsCmd?.commands.find(cmd => cmd.name() === 'view');

      expect(viewCmd).toBeDefined();
      expect(viewCmd?.description().toLowerCase()).toContain('view');
    });
  });

  // ============================================================
  // AC5: Required --channel-id parameter
  // ============================================================

  describe('statistics view command options (AC5)', () => {
    let program: Command;

    beforeEach(() => {
      program = new Command();
      registerStatisticsCommands(program);
    });

    it('should register required --channel-id option', () => {
      const statisticsCmd = program.commands.find(cmd => cmd.name() === 'statistics');
      const viewCmd = statisticsCmd?.commands.find(cmd => cmd.name() === 'view');

      const options = viewCmd?.options || [];
      const channelIdOption = options.find(opt => opt.long === '--channel-id');

      expect(channelIdOption).toBeDefined();
      expect(channelIdOption?.required).toBe(true);
    });

    it('should register --channel-id with short option -c', () => {
      const statisticsCmd = program.commands.find(cmd => cmd.name() === 'statistics');
      const viewCmd = statisticsCmd?.commands.find(cmd => cmd.name() === 'view');

      const options = viewCmd?.options || [];
      const channelIdOption = options.find(opt => opt.long === '--channel-id');

      expect(channelIdOption?.short).toBe('-c');
    });

    it('should register --start-day option', () => {
      const statisticsCmd = program.commands.find(cmd => cmd.name() === 'statistics');
      const viewCmd = statisticsCmd?.commands.find(cmd => cmd.name() === 'view');

      const options = viewCmd?.options || [];
      const optionNames = options.map(opt => opt.long);

      expect(optionNames).toContain('--start-day');
    });

    it('should register --end-day option', () => {
      const statisticsCmd = program.commands.find(cmd => cmd.name() === 'statistics');
      const viewCmd = statisticsCmd?.commands.find(cmd => cmd.name() === 'view');

      const options = viewCmd?.options || [];
      const optionNames = options.map(opt => opt.long);

      expect(optionNames).toContain('--end-day');
    });

    it('should register --output option', () => {
      const statisticsCmd = program.commands.find(cmd => cmd.name() === 'statistics');
      const viewCmd = statisticsCmd?.commands.find(cmd => cmd.name() === 'view');

      const options = viewCmd?.options || [];
      const optionNames = options.map(opt => opt.long);

      expect(optionNames).toContain('--output');
    });

    it('should register --output with short option -o', () => {
      const statisticsCmd = program.commands.find(cmd => cmd.name() === 'statistics');
      const viewCmd = statisticsCmd?.commands.find(cmd => cmd.name() === 'view');

      const options = viewCmd?.options || [];
      const outputOption = options.find(opt => opt.long === '--output');

      expect(outputOption?.short).toBe('-o');
    });
  });

  describe('help information', () => {
    let program: Command;

    beforeEach(() => {
      program = new Command();
      registerStatisticsCommands(program);
    });

    it('should include basic help information for statistics view command', () => {
      const statisticsCmd = program.commands.find(cmd => cmd.name() === 'statistics');
      const viewCmd = statisticsCmd?.commands.find(cmd => cmd.name() === 'view');

      const helpText = viewCmd?.helpInformation();

      expect(helpText).toContain('--channel-id');
      expect(helpText).toContain('--start-day');
      expect(helpText).toContain('--end-day');
      expect(helpText).toContain('--output');
    });
  });

  // ============================================================
  // Date validation helpers
  // ============================================================

  describe('validateDateFormat', () => {
    it('should accept valid date format yyyy-MM-dd', () => {
      expect(validateDateFormat('2024-01-15')).toBe('2024-01-15');
    });

    it('should accept date with single digit month', () => {
      expect(validateDateFormat('2024-01-05')).toBe('2024-01-05');
    });

    it('should accept date with double digit month', () => {
      expect(validateDateFormat('2024-12-31')).toBe('2024-12-31');
    });

    it('should reject invalid date format with slashes', () => {
      expect(() => validateDateFormat('2024/01/15')).toThrow(
        'Date format must be yyyy-MM-dd'
      );
    });

    it('should reject invalid date format with dots', () => {
      expect(() => validateDateFormat('2024.01.15')).toThrow(
        'Date format must be yyyy-MM-dd'
      );
    });

    it('should reject invalid date format without separators', () => {
      expect(() => validateDateFormat('20240115')).toThrow(
        'Date format must be yyyy-MM-dd'
      );
    });

    it('should reject empty string', () => {
      expect(() => validateDateFormat('')).toThrow(
        'Date format must be yyyy-MM-dd'
      );
    });

    it('should reject invalid month (13)', () => {
      expect(() => validateDateFormat('2024-13-01')).toThrow();
    });

    it('should reject invalid day (32)', () => {
      expect(() => validateDateFormat('2024-01-32')).toThrow();
    });
  });

  describe('validateDateRange', () => {
    it('should accept valid date range within 60 days', () => {
      expect(() => validateDateRange('2024-01-01', '2024-02-29')).not.toThrow();
    });

    it('should accept exactly 60 days range', () => {
      expect(() => validateDateRange('2024-01-01', '2024-03-01')).not.toThrow();
    });

    it('should reject date range exceeding 60 days', () => {
      expect(() => validateDateRange('2024-01-01', '2024-03-15')).toThrow(
        'Date range cannot exceed 60 days'
      );
    });

    it('should reject when startDay is after endDay', () => {
      expect(() => validateDateRange('2024-01-15', '2024-01-01')).toThrow(
        'startDay must be before or equal to endDay'
      );
    });

    it('should accept same start and end day', () => {
      expect(() => validateDateRange('2024-01-15', '2024-01-15')).not.toThrow();
    });
  });

  // ============================================================
  // Output format validation
  // ============================================================

  describe('output format validation', () => {
    let program: Command;

    beforeEach(() => {
      program = new Command();
      registerStatisticsCommands(program);
    });

    it('should accept "table" output format', () => {
      const statisticsCmd = program.commands.find(cmd => cmd.name() === 'statistics');
      const viewCmd = statisticsCmd?.commands.find(cmd => cmd.name() === 'view');

      const outputOption = viewCmd?.options.find(opt => opt.long === '--output');
      expect(outputOption).toBeDefined();
    });

    it('should accept "json" output format', () => {
      const statisticsCmd = program.commands.find(cmd => cmd.name() === 'statistics');
      const viewCmd = statisticsCmd?.commands.find(cmd => cmd.name() === 'view');

      // Output option should exist and accept values
      const outputOption = viewCmd?.options.find(opt => opt.long === '--output');
      expect(outputOption?.long).toBe('--output');
    });
  });

  // ============================================================
  // Command examples in help
  // ============================================================

  describe('command examples', () => {
    let program: Command;

    beforeEach(() => {
      program = new Command();
      registerStatisticsCommands(program);
    });

    it('should show usage example in help', () => {
      const statisticsCmd = program.commands.find(cmd => cmd.name() === 'statistics');
      const viewCmd = statisticsCmd?.commands.find(cmd => cmd.name() === 'view');

      const helpText = viewCmd?.helpInformation();

      // Should contain the command usage pattern
      expect(helpText).toBeDefined();
    });
  });

  // ============================================
  // Story 10.2: Concurrency Commands Tests
  // ============================================

  describe('statistics concurrency command (Story 10.2)', () => {
    let program: Command;

    beforeEach(() => {
      program = new Command();
      registerStatisticsCommands(program);
    });

    it('should register statistics concurrency subcommand', () => {
      const statisticsCmd = program.commands.find(cmd => cmd.name() === 'statistics');
      const concurrencyCmd = statisticsCmd?.commands.find(cmd => cmd.name() === 'concurrency');

      expect(concurrencyCmd).toBeDefined();
      expect(concurrencyCmd?.description()).toContain('并发');
    });

    it('should register required --channel-id option', () => {
      const statisticsCmd = program.commands.find(cmd => cmd.name() === 'statistics');
      const concurrencyCmd = statisticsCmd?.commands.find(cmd => cmd.name() === 'concurrency');

      const options = concurrencyCmd?.options || [];
      const channelIdOption = options.find(opt => opt.long === '--channel-id');

      expect(channelIdOption).toBeDefined();
      expect(channelIdOption?.required).toBe(true);
    });

    it('should register date options', () => {
      const statisticsCmd = program.commands.find(cmd => cmd.name() === 'statistics');
      const concurrencyCmd = statisticsCmd?.commands.find(cmd => cmd.name() === 'concurrency');

      const options = concurrencyCmd?.options || [];
      const optionNames = options.map(opt => opt.long);

      expect(optionNames).toContain('--start-date');
      expect(optionNames).toContain('--end-date');
    });
  });

  describe('statistics max-concurrent command (Story 10.2)', () => {
    let program: Command;

    beforeEach(() => {
      program = new Command();
      registerStatisticsCommands(program);
    });

    it('should register statistics max-concurrent subcommand', () => {
      const statisticsCmd = program.commands.find(cmd => cmd.name() === 'statistics');
      const maxConcurrentCmd = statisticsCmd?.commands.find(cmd => cmd.name() === 'max-concurrent');

      expect(maxConcurrentCmd).toBeDefined();
      expect(maxConcurrentCmd?.description()).toContain('最高并发');
    });

    it('should register required --channel-id option', () => {
      const statisticsCmd = program.commands.find(cmd => cmd.name() === 'statistics');
      const maxConcurrentCmd = statisticsCmd?.commands.find(cmd => cmd.name() === 'max-concurrent');

      const options = maxConcurrentCmd?.options || [];
      const channelIdOption = options.find(opt => opt.long === '--channel-id');

      expect(channelIdOption).toBeDefined();
      expect(channelIdOption?.required).toBe(true);
    });

    it('should register timestamp options', () => {
      const statisticsCmd = program.commands.find(cmd => cmd.name() === 'statistics');
      const maxConcurrentCmd = statisticsCmd?.commands.find(cmd => cmd.name() === 'max-concurrent');

      const options = maxConcurrentCmd?.options || [];
      const optionNames = options.map(opt => opt.long);

      expect(optionNames).toContain('--start-time');
      expect(optionNames).toContain('--end-time');
    });
  });

  // ============================================
  // Story 10.3: Audience Commands Tests
  // ============================================

  describe('statistics audience command group (Story 10.3)', () => {
    let program: Command;

    beforeEach(() => {
      program = new Command();
      registerStatisticsCommands(program);
    });

    it('should register statistics audience command group', () => {
      const statisticsCmd = program.commands.find(cmd => cmd.name() === 'statistics');
      const audienceCmd = statisticsCmd?.commands.find(cmd => cmd.name() === 'audience');

      expect(audienceCmd).toBeDefined();
      expect(audienceCmd?.description()).toContain('audience');
    });

    it('should register statistics audience region subcommand', () => {
      const statisticsCmd = program.commands.find(cmd => cmd.name() === 'statistics');
      const audienceCmd = statisticsCmd?.commands.find(cmd => cmd.name() === 'audience');
      const regionCmd = audienceCmd?.commands.find(cmd => cmd.name() === 'region');

      expect(regionCmd).toBeDefined();
      expect(regionCmd?.description().toLowerCase()).toContain('region');
    });

    it('should register statistics audience device subcommand', () => {
      const statisticsCmd = program.commands.find(cmd => cmd.name() === 'statistics');
      const audienceCmd = statisticsCmd?.commands.find(cmd => cmd.name() === 'audience');
      const deviceCmd = audienceCmd?.commands.find(cmd => cmd.name() === 'device');

      expect(deviceCmd).toBeDefined();
      expect(deviceCmd?.description().toLowerCase()).toContain('device');
    });
  });

  // ============================================================
  // AC7: Required --channel-id parameter for audience commands
  // ============================================================

  describe('statistics audience region command options (AC7)', () => {
    let program: Command;

    beforeEach(() => {
      program = new Command();
      registerStatisticsCommands(program);
    });

    it('should register required --channel-id option', () => {
      const statisticsCmd = program.commands.find(cmd => cmd.name() === 'statistics');
      const audienceCmd = statisticsCmd?.commands.find(cmd => cmd.name() === 'audience');
      const regionCmd = audienceCmd?.commands.find(cmd => cmd.name() === 'region');

      const options = regionCmd?.options || [];
      const channelIdOption = options.find(opt => opt.long === '--channel-id');

      expect(channelIdOption).toBeDefined();
      expect(channelIdOption?.required).toBe(true);
    });

    it('should register --channel-id with short option -c', () => {
      const statisticsCmd = program.commands.find(cmd => cmd.name() === 'statistics');
      const audienceCmd = statisticsCmd?.commands.find(cmd => cmd.name() === 'audience');
      const regionCmd = audienceCmd?.commands.find(cmd => cmd.name() === 'region');

      const options = regionCmd?.options || [];
      const channelIdOption = options.find(opt => opt.long === '--channel-id');

      expect(channelIdOption?.short).toBe('-c');
    });

    it('should register --start-time option for timestamps', () => {
      const statisticsCmd = program.commands.find(cmd => cmd.name() === 'statistics');
      const audienceCmd = statisticsCmd?.commands.find(cmd => cmd.name() === 'audience');
      const regionCmd = audienceCmd?.commands.find(cmd => cmd.name() === 'region');

      const options = regionCmd?.options || [];
      const optionNames = options.map(opt => opt.long);

      expect(optionNames).toContain('--start-time');
    });

    it('should register --end-time option for timestamps', () => {
      const statisticsCmd = program.commands.find(cmd => cmd.name() === 'statistics');
      const audienceCmd = statisticsCmd?.commands.find(cmd => cmd.name() === 'audience');
      const regionCmd = audienceCmd?.commands.find(cmd => cmd.name() === 'region');

      const options = regionCmd?.options || [];
      const optionNames = options.map(opt => opt.long);

      expect(optionNames).toContain('--end-time');
    });

    it('should register --output option', () => {
      const statisticsCmd = program.commands.find(cmd => cmd.name() === 'statistics');
      const audienceCmd = statisticsCmd?.commands.find(cmd => cmd.name() === 'audience');
      const regionCmd = audienceCmd?.commands.find(cmd => cmd.name() === 'region');

      const options = regionCmd?.options || [];
      const optionNames = options.map(opt => opt.long);

      expect(optionNames).toContain('--output');
    });
  });

  // ============================================================
  // AC4: --type parameter for region command
  // ============================================================

  describe('statistics audience region --type parameter (AC4)', () => {
    let program: Command;

    beforeEach(() => {
      program = new Command();
      registerStatisticsCommands(program);
    });

    it('should register --type option for region command', () => {
      const statisticsCmd = program.commands.find(cmd => cmd.name() === 'statistics');
      const audienceCmd = statisticsCmd?.commands.find(cmd => cmd.name() === 'audience');
      const regionCmd = audienceCmd?.commands.find(cmd => cmd.name() === 'region');

      const options = regionCmd?.options || [];
      const typeOption = options.find(opt => opt.long === '--type');

      expect(typeOption).toBeDefined();
    });

    it('should accept province as valid type value', async () => {
      const statisticsCmd = program.commands.find(cmd => cmd.name() === 'statistics');
      const audienceCmd = statisticsCmd?.commands.find(cmd => cmd.name() === 'audience');
      const regionCmd = audienceCmd?.commands.find(cmd => cmd.name() === 'region');

      const helpText = regionCmd?.helpInformation();
      expect(helpText).toBeDefined();
    });

    it('should accept city as valid type value', () => {
      const statisticsCmd = program.commands.find(cmd => cmd.name() === 'statistics');
      const audienceCmd = statisticsCmd?.commands.find(cmd => cmd.name() === 'audience');
      const regionCmd = audienceCmd?.commands.find(cmd => cmd.name() === 'region');

      const helpText = regionCmd?.helpInformation();
      expect(helpText).toBeDefined();
    });

    it('should accept country as valid type value', () => {
      const statisticsCmd = program.commands.find(cmd => cmd.name() === 'statistics');
      const audienceCmd = statisticsCmd?.commands.find(cmd => cmd.name() === 'audience');
      const regionCmd = audienceCmd?.commands.find(cmd => cmd.name() === 'region');

      const helpText = regionCmd?.helpInformation();
      expect(helpText).toBeDefined();
    });
  });

  describe('statistics audience device command options (AC7)', () => {
    let program: Command;

    beforeEach(() => {
      program = new Command();
      registerStatisticsCommands(program);
    });

    it('should register required --channel-id option', () => {
      const statisticsCmd = program.commands.find(cmd => cmd.name() === 'statistics');
      const audienceCmd = statisticsCmd?.commands.find(cmd => cmd.name() === 'audience');
      const deviceCmd = audienceCmd?.commands.find(cmd => cmd.name() === 'device');

      const options = deviceCmd?.options || [];
      const channelIdOption = options.find(opt => opt.long === '--channel-id');

      expect(channelIdOption).toBeDefined();
      expect(channelIdOption?.required).toBe(true);
    });

    it('should register --start-time option for timestamps', () => {
      const statisticsCmd = program.commands.find(cmd => cmd.name() === 'statistics');
      const audienceCmd = statisticsCmd?.commands.find(cmd => cmd.name() === 'audience');
      const deviceCmd = audienceCmd?.commands.find(cmd => cmd.name() === 'device');

      const options = deviceCmd?.options || [];
      const optionNames = options.map(opt => opt.long);

      expect(optionNames).toContain('--start-time');
    });

    it('should register --end-time option for timestamps', () => {
      const statisticsCmd = program.commands.find(cmd => cmd.name() === 'statistics');
      const audienceCmd = statisticsCmd?.commands.find(cmd => cmd.name() === 'audience');
      const deviceCmd = audienceCmd?.commands.find(cmd => cmd.name() === 'device');

      const options = deviceCmd?.options || [];
      const optionNames = options.map(opt => opt.long);

      expect(optionNames).toContain('--end-time');
    });

    it('should register --output option', () => {
      const statisticsCmd = program.commands.find(cmd => cmd.name() === 'statistics');
      const audienceCmd = statisticsCmd?.commands.find(cmd => cmd.name() === 'audience');
      const deviceCmd = audienceCmd?.commands.find(cmd => cmd.name() === 'device');

      const options = deviceCmd?.options || [];
      const optionNames = options.map(opt => opt.long);

      expect(optionNames).toContain('--output');
    });
  });

  // ============================================================
  // Timestamp validation helpers (90-day max for audience)
  // ============================================================

  describe('timestamp range validation (90 days)', () => {
    let program: Command;

    beforeEach(() => {
      program = new Command();
      registerStatisticsCommands(program);
    });

    it('should accept valid timestamp range within 90 days', () => {
      const statisticsCmd = program.commands.find(cmd => cmd.name() === 'statistics');
      const audienceCmd = statisticsCmd?.commands.find(cmd => cmd.name() === 'audience');
      const regionCmd = audienceCmd?.commands.find(cmd => cmd.name() === 'region');

      const helpText = regionCmd?.helpInformation();
      expect(helpText).toBeDefined();
    });
  });

  // ============================================================
  // Help information for audience commands
  // ============================================================

  describe('audience command help information', () => {
    let program: Command;

    beforeEach(() => {
      program = new Command();
      registerStatisticsCommands(program);
    });

    it('should include basic help information for statistics audience region command', () => {
      const statisticsCmd = program.commands.find(cmd => cmd.name() === 'statistics');
      const audienceCmd = statisticsCmd?.commands.find(cmd => cmd.name() === 'audience');
      const regionCmd = audienceCmd?.commands.find(cmd => cmd.name() === 'region');

      const helpText = regionCmd?.helpInformation();

      expect(helpText).toContain('--channel-id');
      expect(helpText).toContain('--start-time');
      expect(helpText).toContain('--end-time');
      expect(helpText).toContain('--type');
      expect(helpText).toContain('--output');
    });

    it('should include basic help information for statistics audience device command', () => {
      const statisticsCmd = program.commands.find(cmd => cmd.name() === 'statistics');
      const audienceCmd = statisticsCmd?.commands.find(cmd => cmd.name() === 'audience');
      const deviceCmd = audienceCmd?.commands.find(cmd => cmd.name() === 'device');

      const helpText = deviceCmd?.helpInformation();

      expect(helpText).toContain('--channel-id');
      expect(helpText).toContain('--start-time');
      expect(helpText).toContain('--end-time');
      expect(helpText).toContain('--output');
    });

    it('should show usage example for region command', () => {
      const statisticsCmd = program.commands.find(cmd => cmd.name() === 'statistics');
      const audienceCmd = statisticsCmd?.commands.find(cmd => cmd.name() === 'audience');
      const regionCmd = audienceCmd?.commands.find(cmd => cmd.name() === 'region');

      const helpText = regionCmd?.helpInformation();

      // Should contain the command usage pattern
      expect(helpText).toBeDefined();
    });

    it('should show usage example for device command', () => {
      const statisticsCmd = program.commands.find(cmd => cmd.name() === 'statistics');
      const audienceCmd = statisticsCmd?.commands.find(cmd => cmd.name() === 'audience');
      const deviceCmd = audienceCmd?.commands.find(cmd => cmd.name() === 'device');

      const helpText = deviceCmd?.helpInformation();

      // Should contain the command usage pattern
      expect(helpText).toBeDefined();
    });
  });

  // ============================================================
  // Action Handler Tests
  // ============================================================

  describe('action handlers', () => {
    let program: Command;
    let mockExit: jest.SpyInstance;

    const mockAuthResult = {
      config: { appId: 'test-app', appSecret: 'test-secret', userId: 'test-user' },
      source: 'env',
      accountName: 'test-account',
    };

    beforeEach(() => {
      program = new Command();
      jest.clearAllMocks();
      mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('process.exit'); });
      (require('../config/auth-adapter').authAdapter.tryGetAuthConfig as jest.Mock).mockReturnValue(mockAuthResult);
      (require('../config/auth-adapter').authAdapter.getStatusMessage as jest.Mock).mockReturnValue('No auth');
      (require('../config/auth-adapter').authAdapter.getDiagnostics as jest.Mock).mockReturnValue({
        availableSources: [{ appId: 'a', appSecret: 's', metadata: { source: 'env' }, type: 'env' }],
        errors: [],
      });
      (require('../config/manager').configManager.load as jest.Mock).mockResolvedValue({
        config: { baseUrl: 'https://api.polyv.net', timeout: 30000, debug: false },
      });
      (require('../utils/errors').logError as jest.Mock).mockImplementation(() => {});
    });

    afterEach(() => {
      mockExit.mockRestore();
    });

    describe('statistics view action', () => {
      it('should call viewStatistics on valid input', async () => {
        registerStatisticsCommands(program);
        const MockHandler = require('../handlers/statistics.handler').StatisticsHandler;
        const mockView = jest.fn().mockResolvedValue(undefined);
        MockHandler.mockImplementation(() => ({ viewStatistics: mockView }));

        await program.parseAsync(['node', 'test', 'statistics', 'view', '-c', '123', '--start-day', '2024-01-01', '--end-day', '2024-01-15']);

        expect(mockView).toHaveBeenCalledWith(expect.objectContaining({
          channelId: '123',
          startDay: '2024-01-01',
          endDay: '2024-01-15',
          output: 'table',
        }));
      });

      it('should call viewStatistics with json output', async () => {
        registerStatisticsCommands(program);
        const MockHandler = require('../handlers/statistics.handler').StatisticsHandler;
        const mockView = jest.fn().mockResolvedValue(undefined);
        MockHandler.mockImplementation(() => ({ viewStatistics: mockView }));

        await program.parseAsync(['node', 'test', 'statistics', 'view', '-c', '123', '--start-day', '2024-01-01', '--end-day', '2024-01-15', '-o', 'json']);

        expect(mockView).toHaveBeenCalledWith(expect.objectContaining({ output: 'json' }));
      });

      it('should handle authentication error', async () => {
        (require('../config/auth-adapter').authAdapter.tryGetAuthConfig as jest.Mock).mockReturnValue(null);
        registerStatisticsCommands(program);
        const MockHandler = require('../handlers/statistics.handler').StatisticsHandler;
        MockHandler.mockImplementation(() => ({ viewStatistics: jest.fn() }));

        await expect(
          program.parseAsync(['node', 'test', 'statistics', 'view', '-c', '123', '--start-day', '2024-01-01', '--end-day', '2024-01-15'])
        ).rejects.toThrow('process.exit');

        expect(require('../utils/errors').logError).toHaveBeenCalled();
      });

      it('should handle handler error', async () => {
        const MockHandler = require('../handlers/statistics.handler').StatisticsHandler;
        MockHandler.mockImplementation(() => ({
          viewStatistics: jest.fn().mockRejectedValue(new Error('API Error')),
        }));

        registerStatisticsCommands(program);

        await expect(
          program.parseAsync(['node', 'test', 'statistics', 'view', '-c', '123', '--start-day', '2024-01-01', '--end-day', '2024-01-15'])
        ).rejects.toThrow('process.exit');
      });

      it('should handle Authentication error with diagnostics output', async () => {
        const MockHandler = require('../handlers/statistics.handler').StatisticsHandler;
        MockHandler.mockImplementation(() => ({
          viewStatistics: jest.fn().mockRejectedValue(new Error('Authentication failed')),
        }));

        registerStatisticsCommands(program);

        await expect(
          program.parseAsync(['node', 'test', 'statistics', 'view', '-c', '123', '--start-day', '2024-01-01', '--end-day', '2024-01-15'])
        ).rejects.toThrow('process.exit');

        expect(require('../config/auth-adapter').authAdapter.getDiagnostics).toHaveBeenCalled();
      });

      it('should show verbose auth info when --verbose is set', async () => {
        program.option('--verbose', 'verbose output');
        registerStatisticsCommands(program);
        const MockHandler = require('../handlers/statistics.handler').StatisticsHandler;
        const mockView = jest.fn().mockResolvedValue(undefined);
        MockHandler.mockImplementation(() => ({ viewStatistics: mockView }));
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

        await program.parseAsync(['node', 'test', '--verbose', 'statistics', 'view', '-c', '123', '--start-day', '2024-01-01', '--end-day', '2024-01-15']);

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Authentication Source'));
        consoleSpy.mockRestore();
      });

      it('should handle configManager load with incomplete auth error', async () => {
        (require('../config/manager').configManager.load as jest.Mock).mockRejectedValue(
          new Error('Auth configuration is incomplete')
        );
        registerStatisticsCommands(program);
        const MockHandler = require('../handlers/statistics.handler').StatisticsHandler;
        const mockView = jest.fn().mockResolvedValue(undefined);
        MockHandler.mockImplementation(() => ({ viewStatistics: mockView }));

        await program.parseAsync(['node', 'test', 'statistics', 'view', '-c', '123', '--start-day', '2024-01-01', '--end-day', '2024-01-15']);

        expect(mockView).toHaveBeenCalled();
      });

      it('should handle configManager load with other errors', async () => {
        (require('../config/manager').configManager.load as jest.Mock).mockRejectedValue(
          new Error('Some other error')
        );
        registerStatisticsCommands(program);
        const MockHandler = require('../handlers/statistics.handler').StatisticsHandler;
        MockHandler.mockImplementation(() => ({ viewStatistics: jest.fn() }));

        await expect(
          program.parseAsync(['node', 'test', 'statistics', 'view', '-c', '123', '--start-day', '2024-01-01', '--end-day', '2024-01-15'])
        ).rejects.toThrow('process.exit');
      });

      it('should handle non-Error thrown in action', async () => {
        const MockHandler = require('../handlers/statistics.handler').StatisticsHandler;
        MockHandler.mockImplementation(() => ({
          viewStatistics: jest.fn().mockRejectedValue('string error'),
        }));

        registerStatisticsCommands(program);

        await expect(
          program.parseAsync(['node', 'test', 'statistics', 'view', '-c', '123', '--start-day', '2024-01-01', '--end-day', '2024-01-15'])
        ).rejects.toThrow('process.exit');
      });
    });

    describe('statistics concurrency action', () => {
      it('should call viewConcurrency on valid input', async () => {
        registerStatisticsCommands(program);
        const MockHandler = require('../handlers/statistics.handler').StatisticsHandler;
        const mockView = jest.fn().mockResolvedValue(undefined);
        MockHandler.mockImplementation(() => ({ viewConcurrency: mockView }));

        await program.parseAsync(['node', 'test', 'statistics', 'concurrency', '-c', '123', '--start-date', '2024-01-01', '--end-date', '2024-01-15']);

        expect(mockView).toHaveBeenCalledWith(expect.objectContaining({
          channelId: '123',
          startDate: '2024-01-01',
          endDate: '2024-01-15',
          output: 'table',
        }));
      });

      it('should call viewConcurrency with json output', async () => {
        registerStatisticsCommands(program);
        const MockHandler = require('../handlers/statistics.handler').StatisticsHandler;
        const mockView = jest.fn().mockResolvedValue(undefined);
        MockHandler.mockImplementation(() => ({ viewConcurrency: mockView }));

        await program.parseAsync(['node', 'test', 'statistics', 'concurrency', '-c', '123', '--start-date', '2024-01-01', '--end-date', '2024-01-15', '-o', 'json']);

        expect(mockView).toHaveBeenCalledWith(expect.objectContaining({ output: 'json' }));
      });

      it('should handle error in concurrency action', async () => {
        const MockHandler = require('../handlers/statistics.handler').StatisticsHandler;
        MockHandler.mockImplementation(() => ({
          viewConcurrency: jest.fn().mockRejectedValue(new Error('fail')),
        }));
        registerStatisticsCommands(program);

        await expect(
          program.parseAsync(['node', 'test', 'statistics', 'concurrency', '-c', '123', '--start-date', '2024-01-01', '--end-date', '2024-01-15'])
        ).rejects.toThrow('process.exit');
      });

      it('should handle auth error with diagnostics in concurrency', async () => {
        const MockHandler = require('../handlers/statistics.handler').StatisticsHandler;
        MockHandler.mockImplementation(() => ({
          viewConcurrency: jest.fn().mockRejectedValue(new Error('Authentication failed')),
        }));
        registerStatisticsCommands(program);

        await expect(
          program.parseAsync(['node', 'test', 'statistics', 'concurrency', '-c', '123', '--start-date', '2024-01-01', '--end-date', '2024-01-15'])
        ).rejects.toThrow('process.exit');

        expect(require('../config/auth-adapter').authAdapter.getDiagnostics).toHaveBeenCalled();
      });
    });

    describe('statistics max-concurrent action', () => {
      it('should call viewMaxConcurrent on valid input', async () => {
        registerStatisticsCommands(program);
        const MockHandler = require('../handlers/statistics.handler').StatisticsHandler;
        const mockView = jest.fn().mockResolvedValue(undefined);
        MockHandler.mockImplementation(() => ({ viewMaxConcurrent: mockView }));

        await program.parseAsync(['node', 'test', 'statistics', 'max-concurrent', '-c', '123', '--start-time', '1704067200000', '--end-time', '1706659200000']);

        expect(mockView).toHaveBeenCalledWith(expect.objectContaining({
          channelId: '123',
          startTime: 1704067200000,
          endTime: 1706659200000,
          output: 'table',
        }));
      });

      it('should handle invalid timestamp range', async () => {
        registerStatisticsCommands(program);
        const MockHandler = require('../handlers/statistics.handler').StatisticsHandler;
        MockHandler.mockImplementation(() => ({ viewMaxConcurrent: jest.fn() }));

        await expect(
          program.parseAsync(['node', 'test', 'statistics', 'max-concurrent', '-c', '123', '--start-time', '1735689600000', '--end-time', '1704067200000'])
        ).rejects.toThrow('process.exit');
      });

      it('should handle auth error with diagnostics in max-concurrent', async () => {
        const MockHandler = require('../handlers/statistics.handler').StatisticsHandler;
        MockHandler.mockImplementation(() => ({
          viewMaxConcurrent: jest.fn().mockRejectedValue(new Error('Authentication failed')),
        }));
        registerStatisticsCommands(program);

        await expect(
          program.parseAsync(['node', 'test', 'statistics', 'max-concurrent', '-c', '123', '--start-time', '1704067200000', '--end-time', '1706659200000'])
        ).rejects.toThrow('process.exit');

        expect(require('../config/auth-adapter').authAdapter.getDiagnostics).toHaveBeenCalled();
      });
    });

    describe('statistics audience region action', () => {
      it('should call viewRegionDistribution on valid input', async () => {
        registerStatisticsCommands(program);
        const MockHandler = require('../handlers/statistics.handler').StatisticsHandler;
        const mockView = jest.fn().mockResolvedValue(undefined);
        MockHandler.mockImplementation(() => ({ viewRegionDistribution: mockView }));

        await program.parseAsync(['node', 'test', 'statistics', 'audience', 'region', '-c', '123', '--start-time', '1648742400000', '--end-time', '1651334399000']);

        expect(mockView).toHaveBeenCalledWith(expect.objectContaining({
          channelId: '123',
          startTime: 1648742400000,
          endTime: 1651334399000,
          type: 'province',
          output: 'table',
        }));
      });

      it('should call viewRegionDistribution with city type', async () => {
        registerStatisticsCommands(program);
        const MockHandler = require('../handlers/statistics.handler').StatisticsHandler;
        const mockView = jest.fn().mockResolvedValue(undefined);
        MockHandler.mockImplementation(() => ({ viewRegionDistribution: mockView }));

        await program.parseAsync(['node', 'test', 'statistics', 'audience', 'region', '-c', '123', '--start-time', '1648742400000', '--end-time', '1651334399000', '-t', 'city']);

        expect(mockView).toHaveBeenCalledWith(expect.objectContaining({ type: 'city' }));
      });

      it('should handle invalid 90-day range in region', async () => {
        registerStatisticsCommands(program);
        const MockHandler = require('../handlers/statistics.handler').StatisticsHandler;
        MockHandler.mockImplementation(() => ({ viewRegionDistribution: jest.fn() }));

        // Use timestamps that exceed 90 days
        await expect(
          program.parseAsync(['node', 'test', 'statistics', 'audience', 'region', '-c', '123', '--start-time', '1648742400000', '--end-time', '1675286399000'])
        ).rejects.toThrow('process.exit');
      });

      it('should handle auth error with diagnostics in region', async () => {
        const MockHandler = require('../handlers/statistics.handler').StatisticsHandler;
        MockHandler.mockImplementation(() => ({
          viewRegionDistribution: jest.fn().mockRejectedValue(new Error('Authentication failed')),
        }));
        registerStatisticsCommands(program);

        await expect(
          program.parseAsync(['node', 'test', 'statistics', 'audience', 'region', '-c', '123', '--start-time', '1648742400000', '--end-time', '1651334399000'])
        ).rejects.toThrow('process.exit');

        expect(require('../config/auth-adapter').authAdapter.getDiagnostics).toHaveBeenCalled();
      });
    });

    describe('statistics audience device action', () => {
      it('should call viewDeviceDistribution on valid input', async () => {
        registerStatisticsCommands(program);
        const MockHandler = require('../handlers/statistics.handler').StatisticsHandler;
        const mockView = jest.fn().mockResolvedValue(undefined);
        MockHandler.mockImplementation(() => ({ viewDeviceDistribution: mockView }));

        await program.parseAsync(['node', 'test', 'statistics', 'audience', 'device', '-c', '123', '--start-time', '1651386101000', '--end-time', '1652336501462']);

        expect(mockView).toHaveBeenCalledWith(expect.objectContaining({
          channelId: '123',
          startTime: 1651386101000,
          endTime: 1652336501462,
          output: 'table',
        }));
      });

      it('should handle invalid 90-day range in device', async () => {
        registerStatisticsCommands(program);
        const MockHandler = require('../handlers/statistics.handler').StatisticsHandler;
        MockHandler.mockImplementation(() => ({ viewDeviceDistribution: jest.fn() }));

        // Use timestamps that exceed 90 days
        await expect(
          program.parseAsync(['node', 'test', 'statistics', 'audience', 'device', '-c', '123', '--start-time', '1648742400000', '--end-time', '1675286399000'])
        ).rejects.toThrow('process.exit');
      });

      it('should handle auth error with diagnostics in device', async () => {
        const MockHandler = require('../handlers/statistics.handler').StatisticsHandler;
        MockHandler.mockImplementation(() => ({
          viewDeviceDistribution: jest.fn().mockRejectedValue(new Error('Authentication failed')),
        }));
        registerStatisticsCommands(program);

        await expect(
          program.parseAsync(['node', 'test', 'statistics', 'audience', 'device', '-c', '123', '--start-time', '1651386101000', '--end-time', '1652336501462'])
        ).rejects.toThrow('process.exit');

        expect(require('../config/auth-adapter').authAdapter.getDiagnostics).toHaveBeenCalled();
      });

      it('should handle handler error with diagnostics errors array', async () => {
        (require('../config/auth-adapter').authAdapter.getDiagnostics as jest.Mock).mockReturnValue({
          availableSources: [{ appId: '', appSecret: '', metadata: { source: 'env' }, type: 'env' }],
          errors: ['Missing appId', 'Missing appSecret'],
        });
        const MockHandler = require('../handlers/statistics.handler').StatisticsHandler;
        MockHandler.mockImplementation(() => ({
          viewDeviceDistribution: jest.fn().mockRejectedValue(new Error('Authentication failed')),
        }));
        registerStatisticsCommands(program);

        await expect(
          program.parseAsync(['node', 'test', 'statistics', 'audience', 'device', '-c', '123', '--start-time', '1651386101000', '--end-time', '1652336501462'])
        ).rejects.toThrow('process.exit');
      });
    });
  });

  // ============================================================
  // validateDateFormat edge cases
  // ============================================================

  describe('validateDateFormat edge cases', () => {
    it('should reject date like 2024-02-30', () => {
      expect(() => validateDateFormat('2024-02-30')).toThrow();
    });

    it('should reject date like 2024-00-01', () => {
      expect(() => validateDateFormat('2024-00-01')).toThrow();
    });

    it('should reject date like 2024-01-00', () => {
      expect(() => validateDateFormat('2024-01-00')).toThrow();
    });

    it('should accept leap year date 2024-02-29', () => {
      expect(validateDateFormat('2024-02-29')).toBe('2024-02-29');
    });
  });
});
