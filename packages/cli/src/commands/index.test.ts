/**
 * @fileoverview Unit tests for command layer exports
 * @author Development Team
 * @since 2.1.0
 */

import { registerChannelCommands } from './channel.commands';
import { registerStreamCommands } from './stream.commands';
import { registerMonitorCommands } from './monitor.commands';
import { Command } from 'commander';

// Mock the command modules
jest.mock('./channel.commands', () => ({
  registerChannelCommands: jest.fn()
}));

jest.mock('./stream.commands', () => ({
  registerStreamCommands: jest.fn()
}));

jest.mock('./monitor.commands', () => ({
  registerMonitorCommands: jest.fn()
}));

describe('Commands Index', () => {
  let program: Command;

  beforeEach(() => {
    program = new Command();
    jest.clearAllMocks();
  });

  describe('registerChannelCommands export', () => {
    it('should export registerChannelCommands function', () => {
      expect(typeof registerChannelCommands).toBe('function');
    });

    it('should call registerChannelCommands with program', () => {
      registerChannelCommands(program);
      expect(registerChannelCommands).toHaveBeenCalledWith(program);
    });
  });

  describe('registerStreamCommands export', () => {
    it('should export registerStreamCommands function', () => {
      expect(typeof registerStreamCommands).toBe('function');
    });

    it('should call registerStreamCommands with program', () => {
      registerStreamCommands(program);
      expect(registerStreamCommands).toHaveBeenCalledWith(program);
    });
  });

  describe('registerMonitorCommands export', () => {
    it('should export registerMonitorCommands function', () => {
      expect(typeof registerMonitorCommands).toBe('function');
    });

    it('should call registerMonitorCommands with program', () => {
      registerMonitorCommands(program);
      expect(registerMonitorCommands).toHaveBeenCalledWith(program);
    });
  });

  describe('Module exports', () => {
    it('should have all expected exports', () => {
      const exports = require('./index');
      expect(exports).toHaveProperty('registerChannelCommands');
      expect(exports).toHaveProperty('registerStreamCommands');
      expect(exports).toHaveProperty('registerMonitorCommands');
    });

    it('should export functions that are callable', () => {
      const exports = require('./index');
      expect(typeof exports.registerChannelCommands).toBe('function');
      expect(typeof exports.registerStreamCommands).toBe('function');
      expect(typeof exports.registerMonitorCommands).toBe('function');
    });
  });
});