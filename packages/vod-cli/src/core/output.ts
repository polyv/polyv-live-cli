/**
 * Output helpers: JSON for scripts, tables for people.
 */
import Table from 'cli-table3';

export type OutputFormat = 'table' | 'json';

export function validateOutputFormat(value: string): OutputFormat {
  if (value !== 'table' && value !== 'json') {
    throw new Error('output must be table or json');
  }
  return value;
}

export function isJson(output: unknown): boolean {
  return output === 'json';
}

export function formatJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function cell(value: unknown): string {
  if (value === undefined || value === null) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  if (typeof value === 'boolean') return value ? 'yes' : 'no';
  return String(value);
}

/** The listed columns of each row; columns the row lacks come out empty. */
export function pick(row: Record<string, unknown>, columns: string[]): Record<string, unknown> {
  return Object.fromEntries(columns.map((column) => [column, row[column]]));
}

/** Prints rows as a table with the given columns, or as JSON. */
export function printRows(
  out: (line: string) => void,
  rows: Record<string, unknown>[],
  columns: string[],
  output: unknown
): void {
  if (isJson(output)) {
    out(formatJson(rows));
    return;
  }
  if (rows.length === 0) {
    out('No results');
    return;
  }
  const table = new Table({ head: columns, style: { head: ['cyan'] } });
  for (const row of rows) table.push(columns.map((column) => cell(row[column])));
  out(table.toString());
}

/** Prints one object as a two-column table, or as JSON. */
export function printObject(
  out: (line: string) => void,
  object: Record<string, unknown>,
  columns: string[],
  output: unknown
): void {
  if (isJson(output)) {
    out(formatJson(object));
    return;
  }
  const table = new Table({ style: { head: ['cyan'] } });
  for (const column of columns) table.push({ [column]: cell(object[column]) });
  out(table.toString());
}

/** Human-readable size: `1023 B`, `1 KB`, `1.5 MB`, `20 GB`. */
export function bytes(value: unknown): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = Math.max(value, 0);
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  // A whole number is shown without decimals: "1 KB", not "1.0 KB".
  const text = Number.isInteger(size) || size >= 100 ? String(Math.round(size)) : size.toFixed(1);
  return `${text} ${units[unit]}`;
}

export function seconds(value: unknown): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return String(value ?? '');
  const h = Math.floor(value / 3600);
  const m = Math.floor((value % 3600) / 60);
  const s = value % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
}
