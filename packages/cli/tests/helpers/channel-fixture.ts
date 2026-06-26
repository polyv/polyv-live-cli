import { runCli } from './cli-runner';

export function parseJsonValue(output: string): unknown {
  const objectStart = output.indexOf('{');
  const arrayStart = output.indexOf('[');
  const starts = [objectStart, arrayStart].filter((index) => index !== -1);
  const start = Math.min(...starts);
  const end = Math.max(output.lastIndexOf('}'), output.lastIndexOf(']'));

  if (start === -1 || end === -1 || end < start) {
    throw new Error(`No JSON found in CLI output:\n${output}`);
  }

  return JSON.parse(output.slice(start, end + 1));
}

export function parseJsonObject(output: string): Record<string, unknown> {
  const parsed = parseJsonValue(output);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`No JSON object found in CLI output:\n${output}`);
  }

  return parsed as Record<string, unknown>;
}

export function runCliSuccess(args: string[], timeout = 60000): string {
  const result = runCli(args, { timeout });
  if (result.exitCode !== 0) {
    throw new Error(`CLI command failed: ${args.join(' ')}\n${result.output}`);
  }

  return result.output;
}

export interface TemporaryChannelOptions {
  scene?: string;
  template?: string;
}

export function createTemporaryChannel(label: string, options: TemporaryChannelOptions = {}): string {
  const output = runCliSuccess([
    'channel',
    'create',
    '--name',
    `CLI Integration ${label} ${Date.now()}`,
    '--scene',
    options.scene || 'topclass',
    '--template',
    options.template || 'ppt',
    '--output',
    'json',
  ]);

  const created = parseJsonObject(output);
  const channelId = String(created.channelId || '');
  if (!/^\d+$/.test(channelId)) {
    throw new Error(`Cannot extract channelId from CLI output:\n${output}`);
  }

  return channelId;
}

export function deleteTemporaryChannel(channelId: string): void {
  runCliSuccess([
    'channel',
    'delete',
    '--channelId',
    channelId,
    '--force',
    '--output',
    'json',
  ]);
}

export function extractId(value: unknown): string {
  if (!value || typeof value !== 'object') {
    throw new Error(`Cannot extract id from value: ${JSON.stringify(value)}`);
  }

  const obj = value as Record<string, any>;
  const candidates = [
    obj.id,
    obj.activityId,
    obj.groupId,
    obj.data?.id,
    obj.data?.activityId,
    obj.data?.groupId,
    obj.result?.id,
    obj.result?.activityId,
    obj.result?.data?.id,
    obj.result?.data?.activityId,
  ];
  const id = candidates.find((item) => {
    const value = String(item ?? '').trim();
    return value !== '' && value !== 'N/A';
  });
  if (id === undefined) {
    throw new Error(`Cannot extract id from value: ${JSON.stringify(value)}`);
  }

  return String(id);
}
