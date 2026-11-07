/**
 * @fileoverview inputSchema generation from a Commander leaf command.
 *
 * Mapping rules (Story 1):
 *  - requiredOption(...)  -> required param (Commander `option.mandatory`)
 *  - `.command('add <name>')` positional args -> required params (optional `[x]` -> optional)
 *  - enum values from description "(a|b)" text or parser function source (best effort)
 *  - defaults recorded; types inferred from parser source / default value
 *  - the implicit global `--source` is NEVER part of inputSchema (server-injected per AD-6);
 *    the two command-local `--source` options are runtime-shadowed by the global
 *    program-level option and are likewise excluded (see load-cli.ts notes).
 */

import { Command } from 'commander';
import { InputSchema, ParamSchema } from './types';
import { inferEnumFromDescription, inferEnumFromParser, looksLikeValidator } from './enum-inference';

/** Long flag names that must never surface in inputSchema. */
export const EXCLUDED_FLAGS = new Set(['--source']);

interface OptionLike {
  flags: string;
  long: string | undefined;
  mandatory?: boolean;
  required: boolean;
  optional: boolean;
  variadic: boolean;
  defaultValue?: unknown;
  description?: string;
  parseArg?: unknown;
  isBoolean(): boolean;
  attributeName(): string;
}

interface ArgumentLike {
  name(): string;
  required: boolean;
  optional: boolean;
  variadic: boolean;
  description?: string;
}

function functionSource(fn: unknown): string | undefined {
  if (typeof fn !== 'function') {
    return undefined;
  }
  try {
    return fn.toString();
  } catch {
    return undefined;
  }
}

/** Infer a scalar JSON-ish type from a parser function's source. */
function inferTypeFromParser(source: string | undefined): 'integer' | 'number' | 'boolean' | undefined {
  if (!source) {
    return undefined;
  }
  if (/parseInt|isInteger|Math\.floor|parsePositiveInt/i.test(source)) {
    return 'integer';
  }
  if (/parseFloat|Number\(/.test(source)) {
    return 'number';
  }
  return undefined;
}

function typeFromDefaultValue(value: unknown): 'integer' | 'number' | 'boolean' | undefined {
  if (typeof value === 'boolean') {
    return 'boolean';
  }
  if (typeof value === 'number') {
    return Number.isInteger(value) ? 'integer' : 'number';
  }
  return undefined;
}

function jsonDefault(value: unknown): string | number | boolean | undefined {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  return undefined;
}

function buildOptionParam(option: OptionLike): { name: string; param: ParamSchema } | undefined {
  const long = option.long;
  if (!long) {
    // Options without a long flag cannot be addressed deterministically; skip.
    return undefined;
  }
  if (EXCLUDED_FLAGS.has(long)) {
    return undefined;
  }

  const name = option.attributeName();
  const parserSource = functionSource(option.parseArg);

  let type: ParamSchema['type'] = 'string';
  if (option.isBoolean()) {
    type = 'boolean';
  }

  const param: ParamSchema = {
    type,
    flag: long,
    origin: 'option',
  };

  const description = option.description?.trim();
  if (description) {
    param.description = description;
  }

  // Enum inference: parser source first (runtime validator), then description text.
  const fromParser = inferEnumFromParser(parserSource ?? '');
  const fromDescription = inferEnumFromDescription(option.description);
  if (!option.isBoolean() && fromParser) {
    param.enum = fromParser;
    param.enumConfidence = 'high';
  } else if (!option.isBoolean() && fromDescription) {
    param.enum = fromDescription;
    param.enumConfidence = 'medium';
  } else if (!option.isBoolean() && parserSource && looksLikeValidator(parserSource)) {
    // A validator exists but its allowed values could not be extracted.
    param.enumConfidence = 'low';
  }

  // Numeric type inference (only when no enum was inferred).
  if (!param.enum) {
    const parserType = inferTypeFromParser(parserSource);
    const defaultType = typeFromDefaultValue(option.defaultValue);
    const inferred = parserType ?? defaultType;
    if (inferred && !option.isBoolean()) {
      param.type = inferred;
    }
  }

  // Variadic options become arrays.
  if (option.variadic) {
    const itemType: 'string' | 'integer' | 'number' =
      param.type === 'integer' || param.type === 'number' ? param.type : 'string';
    param.type = 'array';
    param.items = { type: itemType };
  }

  const defaultValue = jsonDefault(option.defaultValue);
  if (defaultValue !== undefined) {
    param.default = defaultValue;
  }

  return { name, param };
}

function buildPositionalParam(argument: ArgumentLike): { name: string; param: ParamSchema; required: boolean } {
  const token = (argument.required ? '<' : '[') + argument.name() + (argument.variadic ? '...' : '') + (argument.required ? '>' : ']');
  const param: ParamSchema = {
    type: 'string',
    arg: token,
    origin: 'positional',
  };
  const description = argument.description?.trim();
  if (description) {
    param.description = description;
  }
  if (argument.variadic) {
    param.type = 'array';
    param.items = { type: 'string' };
  }
  return { name: argument.name(), param, required: argument.required };
}

export interface SchemaResult {
  schema: InputSchema;
  warnings: string[];
}

/**
 * Build the MCP inputSchema for a Commander leaf command.
 * Properties and required entries are sorted alphabetically for stable diffs.
 */
export function buildInputSchema(command: Command): SchemaResult {
  const warnings: string[] = [];
  const properties = new Map<string, ParamSchema>();
  const required = new Set<string>();
  const path = commandPathOf(command);

  // Positional arguments first (they cannot collide with option attribute names,
  // but guard anyway and record a warning rather than silently overwriting).
  for (const argument of (command.registeredArguments ?? []) as unknown as ArgumentLike[]) {
    const { name, param, required: isRequired } = buildPositionalParam(argument);
    if (properties.has(name)) {
      warnings.push(`duplicate parameter name "${name}" on ${path.join(' ')} (positional)`);
      continue;
    }
    properties.set(name, param);
    if (isRequired) {
      required.add(name);
    }
  }

  for (const option of (command.options ?? []) as unknown as OptionLike[]) {
    const built = buildOptionParam(option);
    if (!built) {
      continue;
    }
    if (properties.has(built.name)) {
      warnings.push(`duplicate parameter name "${built.name}" on ${path.join(' ')} (option ${built.param.flag})`);
      continue;
    }
    properties.set(built.name, built.param);
    if (option.mandatory) {
      required.add(built.name);
    }
  }

  const schema: InputSchema = {
    type: 'object',
    properties: Object.fromEntries([...properties.entries()].sort(([a], [b]) => a.localeCompare(b))),
    required: [...required].sort((a, b) => a.localeCompare(b)),
    additionalProperties: false,
  };
  return { schema, warnings };
}

function commandPathOf(command: Command): string[] {
  const segments: string[] = [];
  let current: Command | null | undefined = command;
  while (current) {
    const name = current.name();
    if (name && name !== 'polyv-live-cli') {
      segments.unshift(name);
    }
    current = current.parent;
  }
  return segments;
}
