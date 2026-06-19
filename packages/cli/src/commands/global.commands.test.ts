/**
 * Unit tests for global commands.
 */

import { Command } from 'commander';
import { registerGlobalCommands } from './global.commands';

describe('Global Commands', () => {
  let program: Command;

  beforeEach(() => {
    program = new Command();
    registerGlobalCommands(program);
  });

  it('should register global command group', () => {
    const globalCmd = program.commands.find(cmd => cmd.name() === 'global');
    expect(globalCmd).toBeDefined();
    expect(globalCmd?.description()).toContain('global');
  });

  it('should register auth commands with output and force options', () => {
    const globalCmd = program.commands.find(cmd => cmd.name() === 'global');
    const authCmd = globalCmd?.commands.find(cmd => cmd.name() === 'auth');
    const getCmd = authCmd?.commands.find(cmd => cmd.name() === 'get');
    const updateCmd = authCmd?.commands.find(cmd => cmd.name() === 'update');

    expect(getCmd).toBeDefined();
    expect(getCmd?.options.some(opt => opt.long === '--output')).toBe(true);
    expect(updateCmd).toBeDefined();
    expect(updateCmd?.options.some(opt => opt.long === '--settings' && opt.required)).toBe(true);
    expect(updateCmd?.options.some(opt => opt.long === '--force')).toBe(true);
  });

  it('should register page-setting commands with output and force options', () => {
    const globalCmd = program.commands.find(cmd => cmd.name() === 'global');
    const pageSettingCmd = globalCmd?.commands.find(cmd => cmd.name() === 'page-setting');
    const getCmd = pageSettingCmd?.commands.find(cmd => cmd.name() === 'get');
    const updateCmd = pageSettingCmd?.commands.find(cmd => cmd.name() === 'update');

    expect(getCmd).toBeDefined();
    expect(getCmd?.options.some(opt => opt.long === '--output')).toBe(true);
    expect(updateCmd).toBeDefined();
    expect(updateCmd?.options.some(opt => opt.long === '--config' && opt.required)).toBe(true);
    expect(updateCmd?.options.some(opt => opt.long === '--force')).toBe(true);
  });
});
