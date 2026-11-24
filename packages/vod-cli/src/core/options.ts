/**
 * Option parsers shared by the commands.
 */
import { Command } from 'commander';

/**
 * Everything a command received: its own options, the global ones, and its positional
 * arguments keyed by the names the command declares them with.
 *
 * `video get <vid...>` called as `video get a_1 b_1` gives `{ vid: ['a_1', 'b_1'], output: 'table', ... }`;
 * `category rename <cata-id> <name>` gives `{ cataId: '7', name: '课程' }`. A variadic argument is
 * always an array.
 */
export type Options = Record<string, unknown>;

export class ValidationError extends Error {}

/** `cata-id` -> `cataId`, `task-id` -> `taskId` */
function camelCase(name: string): string {
  return name.replace(/-([a-z])/g, (_match, letter: string) => letter.toUpperCase());
}

/**
 * Reads a Commander action's own options together with the global ones and its positional
 * arguments.
 *
 * @param actionArgs The arguments Commander passed to the action handler
 */
export function optionsOf(command: Command, actionArgs: readonly unknown[] = []): Options {
  const options: Options = { ...command.optsWithGlobals() };
  // Commander passes the Command object as the last action argument.
  const values = actionArgs.length > 0 && actionArgs[actionArgs.length - 1] === command ? actionArgs.slice(0, -1) : actionArgs;
  command.registeredArguments.forEach((argument, index) => {
    options[camelCase(argument.name())] = values[index];
  });
  return options;
}

export function requireValue(value: unknown, name: string): string {
  if (typeof value !== 'string' || !value.trim()) throw new ValidationError(`${name} is required`);
  return value.trim();
}

export function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

/** Positive integer, as accepted by `--page` and similar options. */
export function positiveInteger(value: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) throw new ValidationError(`value must be a positive integer, got "${value}"`);
  return parsed;
}

export function nonNegativeInteger(value: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) throw new ValidationError(`value must be a non-negative integer, got "${value}"`);
  return parsed;
}

/** Splits a comma- or space-separated list. */
export function stringList(value: string): string[] {
  const items = value
    .split(/[,\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
  if (items.length === 0) throw new ValidationError('list must not be empty');
  return items;
}

/** Joins repeated positional arguments and comma-separated values into one list. */
export function vidsOf(values: unknown): string[] {
  const list = Array.isArray(values) ? values : [values];
  return list.flatMap((value) => (typeof value === 'string' ? stringList(value) : [])).filter(Boolean);
}

export function booleanOption(value: unknown): boolean {
  return value === true;
}

export function jsonOption(value: string, name: string): unknown {
  try {
    return JSON.parse(value);
  } catch (error) {
    throw new ValidationError(`${name} must be valid JSON: ${(error as Error).message}`);
  }
}

/** `yyyy-MM-dd` */
export function dateString(value: unknown, name: string): string | undefined {
  const text = optionalString(value);
  if (text === undefined) return undefined;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) throw new ValidationError(`${name} must be formatted yyyy-MM-dd, got "${text}"`);
  return text;
}
