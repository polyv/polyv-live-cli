/**
 * @fileoverview Unit tests for confirmation utilities
 * @author Development Team
 * @since 2.5.0
 */

// Mock readline module at the top level
jest.mock('readline');

import { 
  isInteractiveEnvironment, 
  validateConfirmationEnvironment,
  confirmDeletion,
  promptConfirmation,
  confirmDangerousOperation
} from './confirmation';
import * as readline from 'readline';

describe('Confirmation Utilities', () => {
  
  // Mock process.stdin.isTTY
  let originalIsTTY: boolean | undefined;

  beforeEach(() => {
    // Save original value
    originalIsTTY = process.stdin.isTTY;
  });

  afterEach(() => {
    // Restore original value
    (process.stdin as any).isTTY = originalIsTTY;
  });

  describe('isInteractiveEnvironment', () => {
    it('should return true when process.stdin.isTTY is true', () => {
      (process.stdin as any).isTTY = true;
      expect(isInteractiveEnvironment()).toBe(true);
    });

    it('should return false when process.stdin.isTTY is false', () => {
      (process.stdin as any).isTTY = false;
      expect(isInteractiveEnvironment()).toBe(false);
    });

    it('should return false when process.stdin.isTTY is undefined', () => {
      (process.stdin as any).isTTY = undefined;
      expect(isInteractiveEnvironment()).toBe(false);
    });
  });

  describe('validateConfirmationEnvironment', () => {
    describe('when requireForce is true', () => {
      it('should not throw when in interactive environment', () => {
        (process.stdin as any).isTTY = true;
        expect(() => validateConfirmationEnvironment(true, false)).not.toThrow();
      });

      it('should not throw when force flag is set', () => {
        (process.stdin as any).isTTY = false;
        expect(() => validateConfirmationEnvironment(true, true)).not.toThrow();
      });

      it('should throw when in non-interactive environment without force flag', () => {
        (process.stdin as any).isTTY = false;
        expect(() => validateConfirmationEnvironment(true, false)).toThrow(
          'Interactive confirmation not available in non-TTY environment. Use --force flag to bypass confirmation.'
        );
      });
    });

    describe('when requireForce is false', () => {
      it('should not throw regardless of environment or force flag', () => {
        (process.stdin as any).isTTY = false;
        expect(() => validateConfirmationEnvironment(false, false)).not.toThrow();
        
        (process.stdin as any).isTTY = true;
        expect(() => validateConfirmationEnvironment(false, false)).not.toThrow();
        expect(() => validateConfirmationEnvironment(false, true)).not.toThrow();
      });
    });

    describe('default parameters', () => {
      it('should use default requireForce=true when no parameters provided', () => {
        (process.stdin as any).isTTY = false;
        expect(() => validateConfirmationEnvironment()).toThrow(
          'Interactive confirmation not available in non-TTY environment. Use --force flag to bypass confirmation.'
        );
      });

      it('should use default forceFlag=false when only requireForce provided', () => {
        (process.stdin as any).isTTY = false;
        expect(() => validateConfirmationEnvironment(true)).toThrow(
          'Interactive confirmation not available in non-TTY environment. Use --force flag to bypass confirmation.'
        );
      });
    });
  });

  describe('confirmDeletion', () => {
    beforeEach(() => {
      (process.stdin as any).isTTY = false;
    });

    it('should throw error in non-TTY environment', async () => {
      await expect(confirmDeletion('Test message'))
        .rejects
        .toThrow('Interactive confirmation not available in non-TTY environment. Use --force flag to bypass confirmation.');
    });

    it('should accept custom expected input and timeout', async () => {
      // Test that function accepts parameters without throwing immediately
      const promise = confirmDeletion('Test message', 'confirm', 1000);
      await expect(promise)
        .rejects
        .toThrow('Interactive confirmation not available in non-TTY environment');
    });
  });

  describe('promptConfirmation', () => {
    beforeEach(() => {
      (process.stdin as any).isTTY = false;
    });

    it('should throw error in non-TTY environment', async () => {
      await expect(promptConfirmation('Test message'))
        .rejects
        .toThrow('Interactive confirmation not available in non-TTY environment.');
    });

    it('should accept custom options', async () => {
      const options = {
        acceptedInputs: ['ok', 'proceed'],
        rejectedInputs: ['cancel', 'abort'],
        timeout: 5000,
        caseSensitive: true
      };
      
      const promise = promptConfirmation('Test message', options);
      await expect(promise)
        .rejects
        .toThrow('Interactive confirmation not available in non-TTY environment');
    });
  });

  describe('confirmDangerousOperation', () => {
    let consoleLogSpy: jest.SpyInstance;

    beforeEach(() => {
      (process.stdin as any).isTTY = false;
      // Mock console.log to suppress warning output during tests
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
    });

    it('should throw error in non-TTY environment', async () => {
      await expect(confirmDangerousOperation('delete operation', 'resource-123'))
        .rejects
        .toThrow('Interactive confirmation not available in non-TTY environment');
    });

    it('should accept additional warnings parameter', async () => {
      const warnings = ['Warning 1', 'Warning 2'];
      const promise = confirmDangerousOperation('delete operation', 'resource-123', warnings);
      await expect(promise)
        .rejects
        .toThrow('Interactive confirmation not available in non-TTY environment');
    });
  });

  describe('function signatures and defaults', () => {
    it('should export all expected functions', () => {
      const confirmationModule = require('./confirmation');
      
      expect(confirmationModule.confirmDeletion).toBeDefined();
      expect(confirmationModule.promptConfirmation).toBeDefined();
      expect(confirmationModule.isInteractiveEnvironment).toBeDefined();
      expect(confirmationModule.validateConfirmationEnvironment).toBeDefined();
      expect(confirmationModule.confirmDangerousOperation).toBeDefined();
    });
  });

  describe('confirmation functions parameter handling', () => {
    beforeEach(() => {
      (process.stdin as any).isTTY = false; // Keep non-TTY to avoid readline issues
    });

    it('should handle confirmDeletion with different parameters', async () => {
      // Test default parameters
      await expect(confirmDeletion('Test message'))
        .rejects.toThrow('Interactive confirmation not available');
      
      // Test custom expected input
      await expect(confirmDeletion('Test message', 'confirm'))
        .rejects.toThrow('Interactive confirmation not available');
      
      // Test custom timeout
      await expect(confirmDeletion('Test message', 'yes', 5000))
        .rejects.toThrow('Interactive confirmation not available');
    });

    it('should handle promptConfirmation with different options', async () => {
      // Test with minimal options
      await expect(promptConfirmation('Test message'))
        .rejects.toThrow('Interactive confirmation not available');
      
      // Test with all options
      const fullOptions = {
        acceptedInputs: ['ok', 'proceed', 'confirm'],
        rejectedInputs: ['cancel', 'abort', 'no'],
        timeout: 10000,
        caseSensitive: true
      };
      
      await expect(promptConfirmation('Test message', fullOptions))
        .rejects.toThrow('Interactive confirmation not available');
      
      // Test with partial options
      await expect(promptConfirmation('Test message', { timeout: 15000 }))
        .rejects.toThrow('Interactive confirmation not available');
    });

    it('should handle confirmDangerousOperation with warnings', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Test without warnings
      await expect(confirmDangerousOperation('delete operation', 'resource-123'))
        .rejects.toThrow('Interactive confirmation not available');
      
      // Test with warnings
      const warnings = [
        'This will permanently delete all data',
        'Backups will also be removed',
        'This action cannot be undone'
      ];
      
      await expect(confirmDangerousOperation('delete operation', 'resource-456', warnings))
        .rejects.toThrow('Interactive confirmation not available');
      
      // Verify that warning display code was reached
      expect(consoleLogSpy).toHaveBeenCalled();
      
      consoleLogSpy.mockRestore();
    });
  });

  describe('TTY environment interactive tests', () => {
    let mockReadlineInterface: any;
    let mockQuestion: jest.Mock;
    let mockClose: jest.Mock;
    let mockOn: jest.Mock;
    let consoleLogSpy: jest.SpyInstance;
    const mockedReadline = readline as jest.Mocked<typeof readline>;

    beforeEach(() => {
      // Set TTY to true for these tests
      (process.stdin as any).isTTY = true;
      
      // Mock console.log to capture output
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Create mocks for readline interface
      mockQuestion = jest.fn();
      mockClose = jest.fn();
      mockOn = jest.fn();
      
      mockReadlineInterface = {
        question: mockQuestion,
        close: mockClose,
        on: mockOn
      };
      
      // Set up the mocked readline.createInterface
      mockedReadline.createInterface.mockReturnValue(mockReadlineInterface);
    });

    afterEach(() => {
      jest.clearAllMocks();
      consoleLogSpy.mockRestore();
    });

    describe('confirmDeletion TTY tests', () => {
      it('should resolve true when user types "yes"', async () => {
        // Mock user typing "yes"
        mockQuestion.mockImplementation((_prompt, callback) => {
          // Simulate async user input
          setTimeout(() => callback('yes'), 1);
        });

        const promise = confirmDeletion('Delete this?', 'yes', 1000);
        const result = await promise;

        expect(result).toBe(true);
        expect(mockQuestion).toHaveBeenCalled();
        expect(mockClose).toHaveBeenCalled();
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('🚨 Delete this?'));
        expect(consoleLogSpy).toHaveBeenCalledWith('✅ Confirmed. Proceeding with operation...\n');
      });

      it('should resolve true when user types "y"', async () => {
        mockQuestion.mockImplementation((_prompt, callback) => {
          setTimeout(() => callback('y'), 1);
        });

        const result = await confirmDeletion('Delete this?');
        expect(result).toBe(true);
      });

      it('should resolve false when user types "no"', async () => {
        mockQuestion.mockImplementation((_prompt, callback) => {
          setTimeout(() => callback('no'), 1);
        });

        const result = await confirmDeletion('Delete this?');
        expect(result).toBe(false);
        expect(consoleLogSpy).toHaveBeenCalledWith('❌ Cancelled. Operation aborted.\n');
      });

      it('should resolve false when user types unexpected input', async () => {
        mockQuestion.mockImplementation((_prompt, callback) => {
          setTimeout(() => callback('maybe'), 1);
        });

        const result = await confirmDeletion('Delete this?');
        expect(result).toBe(false);
      });

      it('should handle SIGINT (Ctrl+C)', async () => {
        let sigintHandler: () => void;
        
        mockOn.mockImplementation((event, handler) => {
          if (event === 'SIGINT') {
            sigintHandler = handler;
          }
        });
        
        mockQuestion.mockImplementation(() => {
          // Simulate user pressing Ctrl+C
          setTimeout(() => sigintHandler(), 1);
        });

        const result = await confirmDeletion('Delete this?');
        expect(result).toBe(false);
        expect(consoleLogSpy).toHaveBeenCalledWith('\n❌ Operation cancelled by user (Ctrl+C)\n');
      });

      it('should timeout after specified time', async () => {
        // Don't call the callback to simulate timeout
        mockQuestion.mockImplementation(() => {
          // Do nothing - let timeout occur
        });

        await expect(confirmDeletion('Delete this?', 'yes', 100))
          .rejects
          .toThrow('Confirmation timed out after 0.1 seconds');
        
        expect(mockClose).toHaveBeenCalled();
      });

      it('should handle case-insensitive input', async () => {
        mockQuestion.mockImplementation((_prompt, callback) => {
          setTimeout(() => callback('YES'), 1);
        });

        const result = await confirmDeletion('Delete this?', 'yes');
        expect(result).toBe(true);
      });

      it('should trim whitespace from input', async () => {
        mockQuestion.mockImplementation((_prompt, callback) => {
          setTimeout(() => callback('  yes  '), 1);
        });

        const result = await confirmDeletion('Delete this?', 'yes');
        expect(result).toBe(true);
      });
    });

    describe('promptConfirmation TTY tests', () => {
      it('should resolve confirmed=true for accepted input', async () => {
        mockQuestion.mockImplementation((_prompt, callback) => {
          setTimeout(() => callback('yes'), 1);
        });

        const result = await promptConfirmation('Proceed?');
        expect(result.confirmed).toBe(true);
        expect(result.input).toBe('yes');
        expect(consoleLogSpy).toHaveBeenCalledWith('✅ Confirmed. Proceeding with operation...\n');
      });

      it('should resolve confirmed=false for rejected input', async () => {
        mockQuestion.mockImplementation((_prompt, callback) => {
          setTimeout(() => callback('no'), 1);
        });

        const result = await promptConfirmation('Proceed?');
        expect(result.confirmed).toBe(false);
        expect(result.input).toBe('no');
        expect(consoleLogSpy).toHaveBeenCalledWith('❌ Cancelled. Operation aborted.\n');
      });

      it('should handle custom accepted inputs', async () => {
        mockQuestion.mockImplementation((_prompt, callback) => {
          setTimeout(() => callback('ok'), 1);
        });

        const result = await promptConfirmation('Proceed?', {
          acceptedInputs: ['ok', 'proceed'],
          rejectedInputs: ['cancel', 'abort']
        });
        expect(result.confirmed).toBe(true);
      });

      it('should handle case sensitivity', async () => {
        mockQuestion.mockImplementation((_prompt, callback) => {
          setTimeout(() => callback('OK'), 1);
        });

        const result = await promptConfirmation('Proceed?', {
          acceptedInputs: ['ok'],
          caseSensitive: true
        });
        expect(result.confirmed).toBe(false); // Should fail because of case
      });

      it('should handle invalid input', async () => {
        mockQuestion.mockImplementation((_prompt, callback) => {
          setTimeout(() => callback('invalid'), 1);
        });

        const result = await promptConfirmation('Proceed?');
        expect(result.confirmed).toBe(false);
        expect(consoleLogSpy).toHaveBeenCalledWith('❓ Invalid input: "invalid". Operation cancelled.\n');
      });

      it('should handle SIGINT in promptConfirmation', async () => {
        let sigintHandler: () => void;
        
        mockOn.mockImplementation((event, handler) => {
          if (event === 'SIGINT') {
            sigintHandler = handler;
          }
        });
        
        mockQuestion.mockImplementation(() => {
          setTimeout(() => sigintHandler(), 1);
        });

        const result = await promptConfirmation('Proceed?');
        expect(result.confirmed).toBe(false);
        expect(result.input).toBe('');
      });

      it('should timeout in promptConfirmation', async () => {
        mockQuestion.mockImplementation(() => {
          // Do nothing - let timeout occur
        });

        await expect(promptConfirmation('Proceed?', { timeout: 100 }))
          .rejects
          .toThrow('Confirmation timed out after 0.1 seconds');
      });
    });

    describe('confirmDangerousOperation TTY tests', () => {
      it('should call confirmDeletion and return result', async () => {
        mockQuestion.mockImplementation((_prompt, callback) => {
          setTimeout(() => callback('yes'), 1);
        });

        const result = await confirmDangerousOperation('delete channel', 'ch-123');
        expect(result).toBe(true);
        
        // Verify danger warnings were displayed
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('DANGEROUS OPERATION WARNING'));
        expect(consoleLogSpy).toHaveBeenCalledWith('Operation: DELETE CHANNEL');
        expect(consoleLogSpy).toHaveBeenCalledWith('Resource: ch-123');
      });

      it('should display additional warnings', async () => {
        mockQuestion.mockImplementation((_prompt, callback) => {
          setTimeout(() => callback('no'), 1);
        });

        const warnings = ['Warning 1', 'Warning 2'];
        const result = await confirmDangerousOperation('delete', 'resource', warnings);
        
        expect(result).toBe(false);
        expect(consoleLogSpy).toHaveBeenCalledWith('\nWarnings:');
        expect(consoleLogSpy).toHaveBeenCalledWith('1. Warning 1');
        expect(consoleLogSpy).toHaveBeenCalledWith('2. Warning 2');
      });
    });
  });
});