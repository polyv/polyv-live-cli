/**
 * Type Mapper
 *
 * Maps Markdown API documentation types to TypeScript types.
 *
 * Story 1.9: implement-type-generator
 */

/**
 * Type mapping from Markdown documentation to TypeScript
 */
const TYPE_MAP: Record<string, string> = {
  // String types
  string: 'string',
  String: 'string',
  字符串: 'string',

  // Number types
  integer: 'number',
  Integer: 'number',
  整数: 'number',
  int: 'number',
  Int: 'number',
  long: 'number',
  Long: 'number',
  double: 'number',
  Double: 'number',
  float: 'number',
  Float: 'number',
  number: 'number',
  Number: 'number',
  数字: 'number',

  // Boolean types
  boolean: 'boolean',
  Boolean: 'boolean',
  布尔: 'boolean',
  bool: 'boolean',
  Bool: 'boolean',

  // Object types
  object: 'Record<string, unknown>',
  Object: 'Record<string, unknown>',
  对象: 'Record<string, unknown>',
  JSON: 'Record<string, unknown>',
  json: 'Record<string, unknown>',

  // File types
  file: 'File | Blob',
  File: 'File | Blob',
  文件: 'File | Blob',
  MultipartFile: 'File | Blob',

  // Any type
  any: 'unknown',
  Any: 'unknown',
  mixed: 'unknown',
};

/**
 * Map a Markdown type to TypeScript type
 */
export function mapType(markdownType: string): string {
  if (!markdownType) {
    return 'unknown';
  }

  const trimmed = markdownType.trim();

  // Check for array types: Array<T>, T[], List<T>
  const arrayMatch = trimmed.match(/^(?:Array|List)<(.+)>$/i);
  if (arrayMatch) {
    const innerType = mapType(arrayMatch[1]);
    return `${innerType}[]`;
  }

  // Check for array suffix: T[]
  const arraySuffixMatch = trimmed.match(/^(.+)\[\]$/);
  if (arraySuffixMatch) {
    const innerType = mapType(arraySuffixMatch[1]);
    return `${innerType}[]`;
  }

  // Check for comma-separated types (union-like): String, Integer
  if (trimmed.includes(',') && !trimmed.includes('<')) {
    const types = trimmed.split(',').map((t) => mapType(t.trim()));
    const uniqueTypes = [...new Set(types)];
    return uniqueTypes.join(' | ');
  }

  // Check for pipe-separated union types: String | Integer
  if (trimmed.includes('|') && !trimmed.includes('[]')) {
    const types = trimmed.split('|').map((t) => mapType(t.trim()));
    return types.join(' | ');
  }

  // Direct lookup
  if (TYPE_MAP[trimmed]) {
    return TYPE_MAP[trimmed];
  }

  // Case-insensitive lookup
  const lowerKey = trimmed.toLowerCase();
  for (const [key, value] of Object.entries(TYPE_MAP)) {
    if (key.toLowerCase() === lowerKey) {
      return value;
    }
  }

  // Unknown type - return as is (might be a custom type name)
  return 'unknown';
}

/**
 * Convert a parameter name to a valid TypeScript identifier
 */
export function toValidIdentifier(name: string): string {
  // Handle range patterns like "option1-Option15" by replacing with generic name
  if (/^\w+\d+-\w+\d+$/.test(name)) {
    // Extract the base name without numbers
    const baseMatch = name.match(/^(\D+)\d+-(\D+)\d+$/);
    if (baseMatch) {
      return `${baseMatch[1]}_range`;
    }
    return 'options_range';
  }

  // If name contains Chinese characters, keep them as is (they're valid in TS identifiers)
  // but remove other special characters
  let identifier = name
    .replace(/[^\w\u4e00-\u9fa5]/g, '_') // Keep alphanumeric, Chinese, underscore
    .replace(/_+/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, ''); // Remove leading/trailing underscores

  // If starts with a number, prefix with underscore
  if (/^\d/.test(identifier)) {
    identifier = `_${identifier}`;
  }

  // Handle reserved words
  const reservedWords = [
    'interface',
    'type',
    'class',
    'function',
    'const',
    'let',
    'var',
    'return',
    'if',
    'else',
    'for',
    'while',
    'do',
    'switch',
    'case',
    'break',
    'continue',
    'default',
    'import',
    'export',
    'from',
    'as',
    'new',
    'this',
    'super',
    'extends',
    'implements',
    'static',
    'readonly',
    'private',
    'public',
    'protected',
    'async',
    'await',
    'yield',
    'null',
    'undefined',
    'true',
    'false',
    'void',
    'never',
    'any',
    'unknown',
    'string',
    'number',
    'boolean',
    'object',
    'symbol',
    'bigint',
  ];

  if (reservedWords.includes(identifier)) {
    identifier = `_${identifier}`;
  }

  // If the identifier is empty or just underscores, use a default
  if (!identifier || identifier === '_') {
    return 'field';
  }

  return identifier;
}

/**
 * Generate a valid property name (allows Chinese characters)
 */
export function toValidPropertyName(name: string): string {
  // TypeScript allows Unicode identifiers, including Chinese
  // Just need to handle reserved words and some edge cases
  let propertyName = name.trim();

  // If it starts with a number, prefix with underscore
  if (/^[0-9]/.test(propertyName)) {
    propertyName = `_${propertyName}`;
  }

  // Replace problematic characters but keep Chinese
  propertyName = propertyName.replace(/[<>:"/\\|?*\s]/g, '_');

  return propertyName;
}

/**
 * Generate an interface name from an API title
 */
export function generateInterfaceName(title: string, suffix: 'Request' | 'Response'): string {
  // Remove common prefixes and suffixes
  let name = title
    .replace(/^(接口|API|api)\s*[-:]?\s*/i, '')
    .replace(/\s*(接口|API|api)$/i, '')
    .replace(/\s*\(.*\)\s*/g, '')
    .replace(/[0-9.]+$/, '') // Remove version numbers like 1.0, 2.0
    .replace(/[<>:"/\\|?*]/g, '') // Remove invalid filename characters
    .trim();

  // If title contains Chinese, transliterate or use generic name
  const hasChinese = /[\u4e00-\u9fa5]/.test(name);

  if (hasChinese) {
    // Try to extract meaningful English words or use hash
    // For now, use a hash of the title
    const hash = hashString(title);
    name = `Api${hash}`;
  }

  // Convert to PascalCase
  name = name
    .split(/[\s_-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');

  // Remove non-ASCII characters
  name = name.replace(/[^\x00-\x7F]/g, '');

  // Ensure the name is not empty
  if (!name || name.length < 2) {
    name = 'Api';
  }

  return `${name}${suffix}`;
}

/**
 * Simple hash function for string
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).toUpperCase().padStart(4, '0').slice(0, 4);
}
