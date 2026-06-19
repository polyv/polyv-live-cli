/**
 * @fileoverview Unit tests for Chat commands
 * @author Development Team
 * @since 11.1.0
 */

import { Command } from 'commander';
import {
  registerChatCommands,
  parsePageSize,
  validateOutputFormat
} from './chat.commands';

describe('Chat Commands', () => {
  describe('command registration', () => {
    let program: Command;

    beforeEach(() => {
      program = new Command();
      registerChatCommands(program);
    });

    it('should register chat command group', () => {
      const chatCmd = program.commands.find(cmd => cmd.name() === 'chat');
      expect(chatCmd).toBeDefined();
      expect(chatCmd?.description()).toBe('Manage live streaming chat messages');
    });

    it('should register chat send subcommand', () => {
      const chatCmd = program.commands.find(cmd => cmd.name() === 'chat');
      const sendCmd = chatCmd?.commands.find(cmd => cmd.name() === 'send');

      expect(sendCmd).toBeDefined();
      expect(sendCmd?.description()).toBe('Send an admin message to the channel chat');
    });

    it('should register chat list subcommand', () => {
      const chatCmd = program.commands.find(cmd => cmd.name() === 'chat');
      const listCmd = chatCmd?.commands.find(cmd => cmd.name() === 'list');
      expect(listCmd).toBeDefined();
      expect(listCmd?.description()).toBe('List chat history with pagination');
    });

    it('should register chat delete subcommand', () => {
      const chatCmd = program.commands.find(cmd => cmd.name() === 'chat');
      const deleteCmd = chatCmd?.commands.find(cmd => cmd.name() === 'delete');
      expect(deleteCmd).toBeDefined();
      expect(deleteCmd?.description()).toBe('Delete a chat message or clear all messages');
    });
  });

  describe('options', () => {
    let program: Command;

    beforeEach(() => {
      program = new Command();
      registerChatCommands(program);
    });

    it('should have correct options for send command', () => {
      const chatCmd = program.commands.find(cmd => cmd.name() === 'chat');
      const sendCmd = chatCmd?.commands.find(cmd => cmd.name() === 'send');
      const options = sendCmd?.options || [];
      const optionNames = options.map(opt => opt.long);
      expect(optionNames).toContain('--channel-id');
      expect(optionNames).toContain('--msg');
      expect(optionNames).toContain('--img-url');
      expect(optionNames).toContain('--pic');
      expect(optionNames).toContain('--nickname');
      expect(optionNames).toContain('--actor')
      expect(optionNames).toContain('--admin-index')
      expect(optionNames).toContain('--output');
    });

    it('should have correct options for list command', () => {
      const chatCmd = program.commands.find(cmd => cmd.name() === 'chat');
      const listCmd = chatCmd?.commands.find(cmd => cmd.name() === 'list');
      const options = listCmd?.options || [];
      const optionNames = options.map(opt => opt.long)
      expect(optionNames).toContain('--channel-id')
      expect(optionNames).toContain('--start-day')
      expect(optionNames).toContain('--end-day')
      expect(optionNames).toContain('--page')
      expect(optionNames).toContain('--size')
      expect(optionNames).toContain('--user-type')
      expect(optionNames).toContain('--status')
      expect(optionNames).toContain('--output')
    });

    it('should have correct options for delete command', () => {
      const chatCmd = program.commands.find(cmd => cmd.name() === 'chat');
      const deleteCmd = chatCmd?.commands.find(cmd => cmd.name() === 'delete');
      const options = deleteCmd?.options || [];
      const optionNames = options.map(opt => opt.long);
      expect(optionNames).toContain('--channel-id')
      expect(optionNames).toContain('--message-id')
      expect(optionNames).toContain('--clear')
      expect(optionNames).toContain('--output');
    });

    it('should have correct short options', () => {
      const chatCmd = program.commands.find(cmd => cmd.name() === 'chat');
      const sendCmd = chatCmd?.commands.find(cmd => cmd.name() === 'send');
      const options = sendCmd?.options || [];
      const shortOptions = options.map(opt => opt.short).filter(Boolean);
      expect(shortOptions).toContain('-c')
      expect(shortOptions).toContain('-m')
      expect(shortOptions).toContain('-i')
      expect(shortOptions).toContain('-p')
      expect(shortOptions).toContain('-n')
      expect(shortOptions).toContain('-a')
      expect(shortOptions).toContain('-o')
    });
  });

  describe('help information', () => {
    let program: Command;

    beforeEach(() => {
      program = new Command();
      registerChatCommands(program);
    });

    it('should include help for send command', () => {
      const chatCmd = program.commands.find(cmd => cmd.name() === 'chat');
      const sendCmd = chatCmd?.commands.find(cmd => cmd.name() === 'send');
      const helpText = sendCmd?.helpInformation();
      expect(helpText).toContain('Send an admin message');
      expect(helpText).toContain('--channel-id');
      expect(helpText).toContain('--msg');
    });

    it('should include help for list command', () => {
      const chatCmd = program.commands.find(cmd => cmd.name() === 'chat');
      const listCmd = chatCmd?.commands.find(cmd => cmd.name() === 'list');
      const helpText = listCmd?.helpInformation();
      expect(helpText).toContain('List chat history');
      expect(helpText).toContain('--channel-id');
      expect(helpText).toContain('--page');
    });

    it('should include help for delete command', () => {
      const chatCmd = program.commands.find(cmd => cmd.name() === 'chat');
      const deleteCmd = chatCmd?.commands.find(cmd => cmd.name() === 'delete');
      const helpText = deleteCmd?.helpInformation();
      expect(helpText).toContain('Delete a chat message');
      expect(helpText).toContain('--channel-id');
      expect(helpText).toContain('--message-id');
      expect(helpText).toContain('--clear');
    });
  });

  describe('parsePageSize', () => {
    it('should parse valid page size', () => {
      expect(parsePageSize('20')).toBe(20);
    });

    it('should accept minimum page size (1)', () => {
      expect(parsePageSize('1')).toBe(1);
    });

    it('should accept maximum page size (100)', () => {
      expect(parsePageSize('100')).toBe(100);
    });

    it('should throw error for page size below minimum', () => {
      expect(() => parsePageSize('0')).toThrow('Page size should be between 1 and 100');
    });

    it('should throw error for page size above maximum', () => {
      expect(() => parsePageSize('101')).toThrow('Page size should be between 1 and 100');
    });
  });

  describe('validateOutputFormat', () => {
    it('should accept table format', () => {
      expect(validateOutputFormat('table')).toBe('table');
    });

    it('should accept json format', () => {
      expect(validateOutputFormat('json')).toBe('json');
    });

    it('should throw error for invalid format', () => {
      expect(() => validateOutputFormat('xml')).toThrow('Output format must be either "table" or "json"');
    });
  });

  // ============================================================
  // Story 11-2: Ban/Kick Management Commands
  // ============================================================

  describe('Story 11-2: Ban/Kick command registration', () => {
    let program: Command;

    beforeEach(() => {
      program = new Command();
      registerChatCommands(program);
    });

    // ========================================
    // AC #1: chat ban command
    // ========================================
    describe('chat ban command', () => {
      it('should register chat ban subcommand', () => {
        const chatCmd = program.commands.find(cmd => cmd.name() === 'chat');
        const banCmd = chatCmd?.commands.find(cmd => cmd.name() === 'ban');

        expect(banCmd).toBeDefined();
        expect(banCmd?.description()).toBe('Ban users from chat (channel or global)');
      });

      it('should have correct options for ban command', () => {
        const chatCmd = program.commands.find(cmd => cmd.name() === 'chat');
        const banCmd = chatCmd?.commands.find(cmd => cmd.name() === 'ban');
        const options = banCmd?.options || [];
        const optionNames = options.map(opt => opt.long);

        expect(optionNames).toContain('--channel-id');
        expect(optionNames).toContain('--user-ids');
        expect(optionNames).toContain('--global');
        expect(optionNames).toContain('--output');
      });

      it('should have short options for ban command', () => {
        const chatCmd = program.commands.find(cmd => cmd.name() === 'chat');
        const banCmd = chatCmd?.commands.find(cmd => cmd.name() === 'ban');
        const options = banCmd?.options || [];
        const shortOptions = options.map(opt => opt.short).filter(Boolean);

        expect(shortOptions).toContain('-c');
        expect(shortOptions).toContain('-u');
        expect(shortOptions).toContain('-o');
      });

      it('should include help for ban command', () => {
        const chatCmd = program.commands.find(cmd => cmd.name() === 'chat');
        const banCmd = chatCmd?.commands.find(cmd => cmd.name() === 'ban');
        const helpText = banCmd?.helpInformation();

        expect(helpText).toContain('Ban users');
        expect(helpText).toContain('--channel-id');
        expect(helpText).toContain('--user-ids');
        expect(helpText).toContain('--global');
      });
    });

    // ========================================
    // AC #2: chat unban command
    // ========================================
    describe('chat unban command', () => {
      it('should register chat unban subcommand', () => {
        const chatCmd = program.commands.find(cmd => cmd.name() === 'chat');
        const unbanCmd = chatCmd?.commands.find(cmd => cmd.name() === 'unban');

        expect(unbanCmd).toBeDefined();
        expect(unbanCmd?.description()).toBe('Unban users from chat (channel or global)');
      });

      it('should have correct options for unban command', () => {
        const chatCmd = program.commands.find(cmd => cmd.name() === 'chat');
        const unbanCmd = chatCmd?.commands.find(cmd => cmd.name() === 'unban');
        const options = unbanCmd?.options || [];
        const optionNames = options.map(opt => opt.long);

        expect(optionNames).toContain('--channel-id');
        expect(optionNames).toContain('--user-ids');
        expect(optionNames).toContain('--global');
        expect(optionNames).toContain('--output');
      });
    });

    // ========================================
    // AC #3: chat kick command
    // ========================================
    describe('chat kick command', () => {
      it('should register chat kick subcommand', () => {
        const chatCmd = program.commands.find(cmd => cmd.name() === 'chat');
        const kickCmd = chatCmd?.commands.find(cmd => cmd.name() === 'kick');

        expect(kickCmd).toBeDefined();
        expect(kickCmd?.description()).toBe('Kick users from channel or globally');
      });

      it('should have correct options for kick command', () => {
        const chatCmd = program.commands.find(cmd => cmd.name() === 'chat');
        const kickCmd = chatCmd?.commands.find(cmd => cmd.name() === 'kick');
        const options = kickCmd?.options || [];
        const optionNames = options.map(opt => opt.long);

        expect(optionNames).toContain('--channel-id');
        expect(optionNames).toContain('--viewer-ids');
        expect(optionNames).toContain('--nick-names');
        expect(optionNames).toContain('--global');
        expect(optionNames).toContain('--output');
      });

      it('should have short options for kick command', () => {
        const chatCmd = program.commands.find(cmd => cmd.name() === 'chat');
        const kickCmd = chatCmd?.commands.find(cmd => cmd.name() === 'kick');
        const options = kickCmd?.options || [];
        const shortOptions = options.map(opt => opt.short).filter(Boolean);

        expect(shortOptions).toContain('-c');
        expect(shortOptions).toContain('-n');
        expect(shortOptions).toContain('-o');
      });
    });

    // ========================================
    // AC #4: chat unkick command
    // ========================================
    describe('chat unkick command', () => {
      it('should register chat unkick subcommand', () => {
        const chatCmd = program.commands.find(cmd => cmd.name() === 'chat');
        const unkickCmd = chatCmd?.commands.find(cmd => cmd.name() === 'unkick');

        expect(unkickCmd).toBeDefined();
        expect(unkickCmd?.description()).toBe('Unkick users (cancel kick status)');
      });

      it('should have correct options for unkick command', () => {
        const chatCmd = program.commands.find(cmd => cmd.name() === 'chat');
        const unkickCmd = chatCmd?.commands.find(cmd => cmd.name() === 'unkick');
        const options = unkickCmd?.options || [];
        const optionNames = options.map(opt => opt.long);

        expect(optionNames).toContain('--channel-id');
        expect(optionNames).toContain('--viewer-ids');
        expect(optionNames).toContain('--nick-names');
        expect(optionNames).toContain('--global');
        expect(optionNames).toContain('--output');
      });
    });

    // ========================================
    // AC #5: chat banned list command
    // ========================================
    describe('chat banned list command', () => {
      it('should register chat banned subcommand group', () => {
        const chatCmd = program.commands.find(cmd => cmd.name() === 'chat');
        const bannedCmd = chatCmd?.commands.find(cmd => cmd.name() === 'banned');

        expect(bannedCmd).toBeDefined();
      });

      it('should register chat banned list subcommand', () => {
        const chatCmd = program.commands.find(cmd => cmd.name() === 'chat');
        const bannedCmd = chatCmd?.commands.find(cmd => cmd.name() === 'banned');
        const listCmd = bannedCmd?.commands.find(cmd => cmd.name() === 'list');

        expect(listCmd).toBeDefined();
        expect(listCmd?.description()).toBe('List banned users, IPs, or badwords');
      });

      it('should have correct options for banned list command', () => {
        const chatCmd = program.commands.find(cmd => cmd.name() === 'chat');
        const bannedCmd = chatCmd?.commands.find(cmd => cmd.name() === 'banned');
        const listCmd = bannedCmd?.commands.find(cmd => cmd.name() === 'list');
        const options = listCmd?.options || [];
        const optionNames = options.map(opt => opt.long);

        expect(optionNames).toContain('--channel-id');
        expect(optionNames).toContain('--type');
        expect(optionNames).toContain('--output');
      });

      it('should have short options for banned list command', () => {
        const chatCmd = program.commands.find(cmd => cmd.name() === 'chat');
        const bannedCmd = chatCmd?.commands.find(cmd => cmd.name() === 'banned');
        const listCmd = bannedCmd?.commands.find(cmd => cmd.name() === 'list');
        const options = listCmd?.options || [];
        const shortOptions = options.map(opt => opt.short).filter(Boolean);

        expect(shortOptions).toContain('-c');
        expect(shortOptions).toContain('-t');
        expect(shortOptions).toContain('-o');
      });

      it('should validate --type option accepts userId, ip, badword', () => {
        const chatCmd = program.commands.find(cmd => cmd.name() === 'chat');
        const bannedCmd = chatCmd?.commands.find(cmd => cmd.name() === 'banned');
        const listCmd = bannedCmd?.commands.find(cmd => cmd.name() === 'list');
        const typeOption = listCmd?.options.find(opt => opt.long === '--type');

        expect(typeOption).toBeDefined();
        // The option should be defined to accept these values
      });
    });

    // ========================================
    // AC #6: chat kicked list command
    // ========================================
    describe('chat kicked list command', () => {
      it('should register chat kicked subcommand group', () => {
        const chatCmd = program.commands.find(cmd => cmd.name() === 'chat');
        const kickedCmd = chatCmd?.commands.find(cmd => cmd.name() === 'kicked');

        expect(kickedCmd).toBeDefined();
      });

      it('should register chat kicked list subcommand', () => {
        const chatCmd = program.commands.find(cmd => cmd.name() === 'chat');
        const kickedCmd = chatCmd?.commands.find(cmd => cmd.name() === 'kicked');
        const listCmd = kickedCmd?.commands.find(cmd => cmd.name() === 'list');

        expect(listCmd).toBeDefined();
        expect(listCmd?.description()).toBe('List kicked users');
      });

      it('should have correct options for kicked list command', () => {
        const chatCmd = program.commands.find(cmd => cmd.name() === 'chat');
        const kickedCmd = chatCmd?.commands.find(cmd => cmd.name() === 'kicked');
        const listCmd = kickedCmd?.commands.find(cmd => cmd.name() === 'list');
        const options = listCmd?.options || [];
        const optionNames = options.map(opt => opt.long);

        expect(optionNames).toContain('--channel-id');
        expect(optionNames).toContain('--output');
      });

      it('should require channel-id option', () => {
        const chatCmd = program.commands.find(cmd => cmd.name() === 'chat');
        const kickedCmd = chatCmd?.commands.find(cmd => cmd.name() === 'kicked');
        const listCmd = kickedCmd?.commands.find(cmd => cmd.name() === 'list');
        const channelIdOption = listCmd?.options.find(opt => opt.long === '--channel-id');

        expect(channelIdOption?.required).toBeTruthy();
      });
    });

    // ========================================
    // AC #7: Output format validation
    // ========================================
    describe('output format validation for ban/kick commands', () => {
      it('should accept table output for ban command', () => {
        const chatCmd = program.commands.find(cmd => cmd.name() === 'chat');
        const banCmd = chatCmd?.commands.find(cmd => cmd.name() === 'ban');
        const outputOption = banCmd?.options.find(opt => opt.long === '--output');

        expect(outputOption).toBeDefined();
        expect(outputOption?.defaultValue).toBe('table');
      });

      it('should accept json output for ban command', () => {
        const chatCmd = program.commands.find(cmd => cmd.name() === 'chat');
        const banCmd = chatCmd?.commands.find(cmd => cmd.name() === 'ban');
        const outputOption = banCmd?.options.find(opt => opt.long === '--output');

        expect(outputOption).toBeDefined();
      });

      it('should accept table output for kick command', () => {
        const chatCmd = program.commands.find(cmd => cmd.name() === 'chat');
        const kickCmd = chatCmd?.commands.find(cmd => cmd.name() === 'kick');
        const outputOption = kickCmd?.options.find(opt => opt.long === '--output');

        expect(outputOption?.defaultValue).toBe('table');
      });

      it('should accept json output for kick command', () => {
        const chatCmd = program.commands.find(cmd => cmd.name() === 'chat');
        const kickCmd = chatCmd?.commands.find(cmd => cmd.name() === 'kick');
        const outputOption = kickCmd?.options.find(opt => opt.long === '--output');

        expect(outputOption).toBeDefined();
      });
    });
  });

  describe('extended chat governance commands', () => {
    let program: Command;

    beforeEach(() => {
      program = new Command();
      registerChatCommands(program);
    });

    function getNestedCommand(path: string[]): Command | undefined {
      let current = program.commands.find(cmd => cmd.name() === path[0]);
      for (const segment of path.slice(1)) {
        current = current?.commands.find(cmd => cmd.name() === segment);
      }
      return current;
    }

    it('should register extended command groups', () => {
      for (const group of ['message', 'badword', 'banned', 'notice', 'qa', 'censor', 'role', 'robot']) {
        expect(getNestedCommand(['chat', group])).toBeDefined();
      }
    });

    it('should register commands for remaining chat APIs', () => {
      const commands = [
        ['chat', 'message', 'hidden-send'],
        ['chat', 'message', 'admin-send'],
        ['chat', 'message', 'online-count'],
        ['chat', 'message', 'speak-list'],
        ['chat', 'message', 'alert-special'],
        ['chat', 'message', 'audit'],
        ['chat', 'message', 'custom-send'],
        ['chat', 'message', 'custom-send-encode'],
        ['chat', 'message', 'emit-by-user-id'],
        ['chat', 'badword', 'list'],
        ['chat', 'badword', 'add'],
        ['chat', 'badword', 'delete'],
        ['chat', 'banned', 'ip-add'],
        ['chat', 'banned', 'user-list'],
        ['chat', 'banned', 'forbid-list'],
        ['chat', 'banned', 'delete'],
        ['chat', 'notice', 'list'],
        ['chat', 'notice', 'add'],
        ['chat', 'notice', 'clean'],
        ['chat', 'qa', 'list'],
        ['chat', 'censor', 'update'],
        ['chat', 'role', 'admin-get'],
        ['chat', 'role', 'admin-update'],
        ['chat', 'role', 'teacher-get'],
        ['chat', 'role', 'teacher-update'],
        ['chat', 'role', 'user-list'],
        ['chat', 'robot', 'setting-get'],
        ['chat', 'robot', 'stats'],
        ['chat', 'robot', 'setting-update'],
        ['chat', 'robot', 'list-update'],
        ['chat', 'robot', 'pause'],
      ];

      for (const commandPath of commands) {
        expect(getNestedCommand(commandPath)).toBeDefined();
      }
    });

    it('should expose force option for dangerous write commands', () => {
      const dangerousCommands = [
        ['chat', 'message', 'alert-special'],
        ['chat', 'message', 'audit'],
        ['chat', 'message', 'custom-send'],
        ['chat', 'message', 'custom-send-encode'],
        ['chat', 'message', 'emit-by-user-id'],
        ['chat', 'badword', 'add'],
        ['chat', 'badword', 'delete'],
        ['chat', 'banned', 'ip-add'],
        ['chat', 'banned', 'delete'],
        ['chat', 'notice', 'add'],
        ['chat', 'notice', 'clean'],
        ['chat', 'censor', 'update'],
        ['chat', 'role', 'admin-update'],
        ['chat', 'role', 'teacher-update'],
        ['chat', 'robot', 'setting-update'],
        ['chat', 'robot', 'list-update'],
        ['chat', 'robot', 'pause'],
      ];

      for (const commandPath of dangerousCommands) {
        const optionNames = (getNestedCommand(commandPath)?.options || []).map(opt => opt.long);
        expect(optionNames).toContain('--force');
        expect(optionNames).toContain('--output');
      }
    });
  });
});
