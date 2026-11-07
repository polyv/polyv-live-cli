/**
 * @fileoverview Best-effort enum inference (Story 1).
 *
 * The CLI has no native choices() support, so enums are inferred from:
 *  1. parser function source (runtime validator) — confidence "high"
 *     (a) string-array literal, e.g. const valid = ['table', 'json']
 *     (b) error message, e.g. "must be one of: stream, record, playback"
 *  2. option description text "(a|b|c)" patterns — confidence "medium"
 *
 * Options that ship a value-validating parser from which no values can be
 * extracted are marked enumConfidence "low" by the schema builder.
 */

export interface EnumInference {
  values: string[];
  confidence: 'high' | 'medium';
}

const MAX_ENUM_VALUES = 32;

/** Match `['a', 'b', ...]` literals whose elements are all single-quoted strings. */
const QUOTED_ARRAY_RE = /\[\s*'(?:[^'\\]|\\.)*'(?:\s*,\s*'(?:[^'\\]|\\.)*')*\s*\]/g;

/** Match "must be one of: a, b, c" style validation messages. */
const MUST_BE_ONE_OF_RE = /must be one of[^:\n]*[:\n]\s*([\w][\w, ./-]*)/i;

/**
 * Infer enum values from a parser function's source code.
 * Returns undefined when nothing trustworthy can be extracted.
 */
export function inferEnumFromParser(parserSource: string): string[] | undefined {
  // (a) quoted string-array literals, e.g. `['table', 'json']`
  const arrayMatches = parserSource.match(QUOTED_ARRAY_RE) ?? [];
  for (const match of arrayMatches) {
    const items = [...match.matchAll(/'((?:[^'\\]|\\.)*)'/g)].map(m => m[1] ?? '');
    const cleaned = items.map(item => item.trim()).filter(item => item.length > 0);
    if (cleaned.length >= 1 && cleaned.length <= MAX_ENUM_VALUES && cleaned.every(isPlainValue)) {
      return dedupe(cleaned);
    }
  }

  // (b) "must be one of: a, b, c" error messages
  const messageMatch = parserSource.match(MUST_BE_ONE_OF_RE);
  if (messageMatch?.[1]) {
    const parts = messageMatch[1]
      .split(',')
      .map(part => part.trim())
      .filter(part => part.length > 0);
    if (parts.length >= 2 && parts.length <= MAX_ENUM_VALUES && parts.every(isPlainValue)) {
      return dedupe(parts);
    }
  }

  return undefined;
}

/** Match parenthesized alternation in descriptions, e.g. "(table|json)" or "(live|playback|end)". */
const PAREN_ENUM_RE = /\(([^()]+)\)/g;

/**
 * Infer enum values from an option description like
 * "output format (table|json)" or "sort order (startTimeDesc|startTimeAsc|..., default: x)".
 */
export function inferEnumFromDescription(description: string | undefined): string[] | undefined {
  if (!description) {
    return undefined;
  }
  for (const match of description.matchAll(PAREN_ENUM_RE)) {
    const content = match[1] ?? '';
    if (!content.includes('|')) {
      continue;
    }
    const segments = content.split('|').map(segment => segment.trim());
    const values: string[] = [];
    let ok = true;
    segments.forEach((segment, index) => {
      // Allow a trailing ", ..." clause only on the last segment
      // (e.g. "channelCreatedTimeDesc, default: channelCreatedTimeDesc").
      const trailingClause = index === segments.length - 1;
      const re = trailingClause ? /^([\w.]+)(?:\s*,.*)?$/ : /^([\w.]+)$/;
      const m = segment.match(re);
      if (m?.[1]) {
        values.push(m[1]);
      } else {
        ok = false;
      }
    });
    if (ok && values.length >= 2 && values.length <= MAX_ENUM_VALUES && values.every(isPlainValue)) {
      return dedupe(values);
    }
  }
  return undefined;
}

function isPlainValue(value: string): boolean {
  return /^[\w.]+$/.test(value);
}

function dedupe(values: string[]): string[] {
  return [...new Set(values)];
}

/**
 * Heuristic: does this parser function restrict values to a SET (vs. a plain
 * coercion/range check like parseInt)? Only set-style validators qualify for
 * the "enum values exist but could not be extracted" (low-confidence) marker.
 */
export function looksLikeValidator(parserSource: string): boolean {
  return /\[\s*'|must be one of/i.test(parserSource);
}
