import {
  detectTerminalCapabilities,
  validateTerminalSize,
  isColorTerminal,
  getOptimalLayout,
  formatBytes,
  formatDuration,
  truncateText,
  padText,
  wrapText,
} from './terminal';

// Mock process.stdout and process.env
const originalEnv = process.env;
const originalPlatform = process.platform;

describe('Terminal Utilities', () => {
  beforeEach(() => {
    // Reset environment variables
    process.env = { ...originalEnv };
    delete process.env['COLORTERM'];
    delete process.env['TERM'];
    delete process.env['LC_ALL'];
    delete process.env['LC_CTYPE'];
    delete process.env['LANG'];
    delete process.env['TERM_PROGRAM'];
  });

  afterEach(() => {
    process.env = originalEnv;
    Object.defineProperty(process, 'platform', {
      value: originalPlatform,
      writable: true,
    });
  });

  describe('detectTerminalCapabilities', () => {
    it('should detect basic terminal capabilities with defaults', () => {
      // Mock stdout dimensions
      Object.defineProperty(process.stdout, 'columns', {
        value: undefined,
        writable: true,
      });
      Object.defineProperty(process.stdout, 'rows', {
        value: undefined,
        writable: true,
      });

      const capabilities = detectTerminalCapabilities();

      expect(capabilities.width).toBe(80);
      expect(capabilities.height).toBe(24);
      expect(capabilities.colorDepth).toBe(1);
      expect(capabilities.supportsUnicode).toBe(false);
      expect(capabilities.supportsMouse).toBe(false);
      expect(capabilities.platform).toBe(process.platform);
      expect(capabilities.terminalType).toBe('');
    });

    it('should detect terminal dimensions from stdout', () => {
      Object.defineProperty(process.stdout, 'columns', {
        value: 120,
        writable: true,
      });
      Object.defineProperty(process.stdout, 'rows', {
        value: 30,
        writable: true,
      });

      const capabilities = detectTerminalCapabilities();

      expect(capabilities.width).toBe(120);
      expect(capabilities.height).toBe(30);
    });

    it('should detect 24-bit color depth', () => {
      process.env['COLORTERM'] = 'truecolor';
      const capabilities = detectTerminalCapabilities();
      expect(capabilities.colorDepth).toBe(24);

      process.env['COLORTERM'] = '24bit';
      const capabilities2 = detectTerminalCapabilities();
      expect(capabilities2.colorDepth).toBe(24);
    });

    it('should detect 8-bit color depth', () => {
      process.env['TERM'] = 'xterm-256color';
      const capabilities = detectTerminalCapabilities();
      expect(capabilities.colorDepth).toBe(8);

      process.env['TERM'] = 'screen';
      process.env['COLORTERM'] = '256';
      const capabilities2 = detectTerminalCapabilities();
      expect(capabilities2.colorDepth).toBe(8);
    });

    it('should detect 4-bit color depth', () => {
      process.env['TERM'] = 'xterm-color';
      const capabilities = detectTerminalCapabilities();
      expect(capabilities.colorDepth).toBe(4);
    });

    it('should detect Unicode support from various env vars', () => {
      process.env['LC_ALL'] = 'en_US.UTF-8';
      let capabilities = detectTerminalCapabilities();
      expect(capabilities.supportsUnicode).toBe(true);

      process.env['LC_ALL'] = '';
      process.env['LC_CTYPE'] = 'en_US.UTF-8';
      capabilities = detectTerminalCapabilities();
      expect(capabilities.supportsUnicode).toBe(true);

      process.env['LC_CTYPE'] = '';
      process.env['LANG'] = 'en_US.UTF-8';
      capabilities = detectTerminalCapabilities();
      expect(capabilities.supportsUnicode).toBe(true);

      process.env['LANG'] = '';
      process.env['TERM'] = 'xterm-utf8';
      capabilities = detectTerminalCapabilities();
      expect(capabilities.supportsUnicode).toBe(true);

      process.env['TERM'] = 'screen-utf-8';
      capabilities = detectTerminalCapabilities();
      expect(capabilities.supportsUnicode).toBe(true);
    });

    it('should detect mouse support', () => {
      process.env['TERM'] = 'xterm-256color';
      let capabilities = detectTerminalCapabilities();
      expect(capabilities.supportsMouse).toBe(true);

      process.env['TERM'] = 'screen';
      capabilities = detectTerminalCapabilities();
      expect(capabilities.supportsMouse).toBe(true);

      process.env['TERM'] = 'tmux-256color';
      capabilities = detectTerminalCapabilities();
      expect(capabilities.supportsMouse).toBe(true);

      process.env['TERM'] = '';
      process.env['TERM_PROGRAM'] = 'iTerm.app';
      capabilities = detectTerminalCapabilities();
      expect(capabilities.supportsMouse).toBe(true);
    });

    it('should return correct terminal type', () => {
      process.env['TERM'] = 'xterm-256color';
      const capabilities = detectTerminalCapabilities();
      expect(capabilities.terminalType).toBe('xterm-256color');
    });
  });

  describe('validateTerminalSize', () => {
    it('should validate terminal size successfully', () => {
      Object.defineProperty(process.stdout, 'columns', {
        value: 120,
        writable: true,
      });
      Object.defineProperty(process.stdout, 'rows', {
        value: 30,
        writable: true,
      });

      const result = validateTerminalSize(80, 24);

      expect(result.valid).toBe(true);
      expect(result.width).toBe(120);
      expect(result.height).toBe(30);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for insufficient width', () => {
      Object.defineProperty(process.stdout, 'columns', {
        value: 60,
        writable: true,
      });
      Object.defineProperty(process.stdout, 'rows', {
        value: 30,
        writable: true,
      });

      const result = validateTerminalSize(80, 24);

      expect(result.valid).toBe(false);
      expect(result.width).toBe(60);
      expect(result.height).toBe(30);
      expect(result.errors).toContain('Terminal width too small: 60 (minimum: 80)');
    });

    it('should fail validation for insufficient height', () => {
      Object.defineProperty(process.stdout, 'columns', {
        value: 120,
        writable: true,
      });
      Object.defineProperty(process.stdout, 'rows', {
        value: 20,
        writable: true,
      });

      const result = validateTerminalSize(80, 24);

      expect(result.valid).toBe(false);
      expect(result.width).toBe(120);
      expect(result.height).toBe(20);
      expect(result.errors).toContain('Terminal height too small: 20 (minimum: 24)');
    });

    it('should fail validation for both insufficient width and height', () => {
      Object.defineProperty(process.stdout, 'columns', {
        value: 60,
        writable: true,
      });
      Object.defineProperty(process.stdout, 'rows', {
        value: 20,
        writable: true,
      });

      const result = validateTerminalSize(80, 24);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors).toContain('Terminal width too small: 60 (minimum: 80)');
      expect(result.errors).toContain('Terminal height too small: 20 (minimum: 24)');
    });
  });

  describe('isColorTerminal', () => {
    it('should return true for color terminals', () => {
      process.env['COLORTERM'] = 'truecolor';
      expect(isColorTerminal()).toBe(true);
    });

    it('should return false for non-color terminals', () => {
      // Default colorDepth is 1
      expect(isColorTerminal()).toBe(false);
    });
  });

  describe('getOptimalLayout', () => {
    it('should return default layout for large terminals', () => {
      const layout = getOptimalLayout(120, 30);
      expect(layout).toBe('default');
    });

    it('should return compact layout for medium terminals', () => {
      const layout = getOptimalLayout(80, 24);
      expect(layout).toBe('compact');
    });

    it('should return single layout for small terminals', () => {
      const layout = getOptimalLayout(60, 20);
      expect(layout).toBe('single');
    });

    it('should throw error for terminals too small', () => {
      expect(() => getOptimalLayout(50, 15)).toThrow(
        'Terminal size too small: 50x15. Minimum required: 60x20'
      );
    });
  });

  describe('formatBytes', () => {
    it('should format zero bytes', () => {
      expect(formatBytes(0)).toBe('0 B');
    });

    it('should format bytes', () => {
      expect(formatBytes(512)).toBe('512.0 B');
    });

    it('should format kilobytes', () => {
      expect(formatBytes(1024)).toBe('1.0 KB');
      expect(formatBytes(1536)).toBe('1.5 KB');
    });

    it('should format megabytes', () => {
      expect(formatBytes(1024 * 1024)).toBe('1.0 MB');
      expect(formatBytes(1024 * 1024 * 2.5)).toBe('2.5 MB');
    });

    it('should format gigabytes', () => {
      expect(formatBytes(1024 * 1024 * 1024)).toBe('1.0 GB');
      expect(formatBytes(1024 * 1024 * 1024 * 1.5)).toBe('1.5 GB');
    });
  });

  describe('formatDuration', () => {
    it('should format seconds', () => {
      expect(formatDuration(5000)).toBe('5s');
      expect(formatDuration(45000)).toBe('45s');
    });

    it('should format minutes and seconds', () => {
      expect(formatDuration(60000)).toBe('1m 0s');
      expect(formatDuration(90000)).toBe('1m 30s');
      expect(formatDuration(3600000 - 1000)).toBe('59m 59s');
    });

    it('should format hours, minutes, and seconds', () => {
      expect(formatDuration(3600000)).toBe('1h 0m 0s');
      expect(formatDuration(3661000)).toBe('1h 1m 1s');
      expect(formatDuration(86400000 - 1000)).toBe('23h 59m 59s');
    });

    it('should format days, hours, and minutes', () => {
      expect(formatDuration(86400000)).toBe('1d 0h 0m');
      expect(formatDuration(90061000)).toBe('1d 1h 1m');
      expect(formatDuration(172800000)).toBe('2d 0h 0m');
    });
  });

  describe('truncateText', () => {
    it('should not truncate text shorter than max length', () => {
      const text = 'Short text';
      expect(truncateText(text, 20)).toBe(text);
    });

    it('should not truncate text equal to max length', () => {
      const text = 'Exact length';
      expect(truncateText(text, 12)).toBe(text);
    });

    it('should truncate text longer than max length', () => {
      const text = 'This is a very long text that should be truncated';
      expect(truncateText(text, 20)).toBe('This is a very lo...');
    });

    it('should handle edge case with max length of 3', () => {
      const text = 'Long text';
      expect(truncateText(text, 3)).toBe('...');
    });
  });

  describe('padText', () => {
    it('should pad text to the left by default', () => {
      expect(padText('hello', 10)).toBe('hello     ');
    });

    it('should pad text to the left explicitly', () => {
      expect(padText('hello', 10, 'left')).toBe('hello     ');
    });

    it('should pad text to the right', () => {
      expect(padText('hello', 10, 'right')).toBe('     hello');
    });

    it('should pad text to the center', () => {
      expect(padText('hello', 10, 'center')).toBe('  hello   ');
    });

    it('should pad text to the center with odd padding', () => {
      expect(padText('hello', 11, 'center')).toBe('   hello   ');
    });

    it('should truncate text longer than width', () => {
      expect(padText('very long text', 10)).toBe('very long ');
    });

    it('should return text as-is when equal to width', () => {
      expect(padText('exact', 5)).toBe('exact');
    });
  });

  describe('wrapText', () => {
    it('should wrap text that exceeds width', () => {
      const text = 'This is a long sentence that should be wrapped';
      const wrapped = wrapText(text, 20);
      
      expect(wrapped).toEqual([
        'This is a long',
        'sentence that should',
        'be wrapped'
      ]);
    });

    it('should not wrap text that fits within width', () => {
      const text = 'Short text';
      const wrapped = wrapText(text, 20);
      
      expect(wrapped).toEqual(['Short text']);
    });

    it('should handle single word longer than width', () => {
      const text = 'supercalifragilisticexpialidocious';
      const wrapped = wrapText(text, 10);
      
      expect(wrapped).toEqual(['supercalifragilisticexpialidocious']);
    });

    it('should handle empty text', () => {
      const wrapped = wrapText('', 10);
      expect(wrapped).toEqual([]);
    });

    it('should handle text with single word', () => {
      const text = 'word';
      const wrapped = wrapText(text, 10);
      
      expect(wrapped).toEqual(['word']);
    });

    it('should handle multiple spaces', () => {
      const text = 'word1    word2 word3';
      const wrapped = wrapText(text, 15);
      
      expect(wrapped).toEqual(['word1    word2', 'word3']);
    });
  });
});