export interface TerminalCapabilities {
  width: number;
  height: number;
  colorDepth: number;
  supportsUnicode: boolean;
  supportsMouse: boolean;
  platform: string;
  terminalType: string;
}

export function detectTerminalCapabilities(): TerminalCapabilities {
  const width = process.stdout.columns || 80;
  const height = process.stdout.rows || 24;
  
  // Detect color depth
  let colorDepth = 1;
  const colorterm = process.env['COLORTERM'];
  const term = process.env['TERM'] || '';
  
  if (colorterm === 'truecolor' || colorterm === '24bit') {
    colorDepth = 24;
  } else if (term.includes('256') || colorterm === '256') {
    colorDepth = 8;
  } else if (term.includes('color')) {
    colorDepth = 4;
  }
  
  // Detect Unicode support
  const supportsUnicode = !!(
    process.env['LC_ALL']?.includes('UTF-8') ||
    process.env['LC_CTYPE']?.includes('UTF-8') ||
    process.env['LANG']?.includes('UTF-8') ||
    term.includes('utf8') ||
    term.includes('utf-8')
  );
  
  // Detect mouse support (basic heuristic)
  const supportsMouse = !!(
    term.includes('xterm') ||
    term.includes('screen') ||
    term.includes('tmux') ||
    process.env['TERM_PROGRAM']
  );

  return {
    width,
    height,
    colorDepth,
    supportsUnicode,
    supportsMouse,
    platform: process.platform,
    terminalType: term,
  };
}

export function validateTerminalSize(minWidth: number, minHeight: number): {
  valid: boolean;
  width: number;
  height: number;
  errors: string[];
} {
  const capabilities = detectTerminalCapabilities();
  const errors: string[] = [];
  
  if (capabilities.width < minWidth) {
    errors.push(`Terminal width too small: ${capabilities.width} (minimum: ${minWidth})`);
  }
  
  if (capabilities.height < minHeight) {
    errors.push(`Terminal height too small: ${capabilities.height} (minimum: ${minHeight})`);
  }
  
  return {
    valid: errors.length === 0,
    width: capabilities.width,
    height: capabilities.height,
    errors,
  };
}

export function isColorTerminal(): boolean {
  const capabilities = detectTerminalCapabilities();
  return capabilities.colorDepth > 1;
}

export function getOptimalLayout(width: number, height: number): string {
  if (width >= 120 && height >= 30) {
    return 'default';
  } else if (width >= 80 && height >= 24) {
    return 'compact';
  } else if (width >= 60 && height >= 20) {
    return 'single';
  }
  
  throw new Error(`Terminal size too small: ${width}x${height}. Minimum required: 60x20`);
}

export function formatBytes(bytes: number): string {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  
  return `${size.toFixed(1)} ${sizes[i]}`;
}

export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength - 3) + '...';
}

export function padText(text: string, width: number, align: 'left' | 'center' | 'right' = 'left'): string {
  if (text.length >= width) {
    return text.substring(0, width);
  }
  
  const padding = width - text.length;
  
  switch (align) {
    case 'center': {
      const leftPad = Math.floor(padding / 2);
      const rightPad = padding - leftPad;
      return ' '.repeat(leftPad) + text + ' '.repeat(rightPad);
    }
    
    case 'right':
      return ' '.repeat(padding) + text;
    
    case 'left':
    default:
      return text + ' '.repeat(padding);
  }
}

export function wrapText(text: string, width: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    if (currentLine.length + word.length + 1 <= width) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}