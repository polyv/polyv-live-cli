/**
 * `callback` commands: the event-callback setting, and checking callback signatures offline.
 */
import { Command } from 'commander';
import { verifyCallbackSignature, type CallbackSignInput } from 'polyv-vod-api-sdk';

import { resolveAuth } from '../core/auth';
import { CommandError, type CommandContext, executors } from '../core/context';
import { confirmWrite } from '../core/confirm';
import { jsonOption, optionsOf, optionalString } from '../core/options';
import { formatJson, isJson, printObject, validateOutputFormat } from '../core/output';

export function registerCallbackCommands(program: Command, ctx: CommandContext): void {
  const { client, local } = executors(ctx);
  const callback = program.command('callback').description('Event callbacks: the setting, and checking signatures');

  callback
    .command('get')
    .description('Show the callback URL (needs the account API credentials: appId and appSecret)')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(function (this: Command, ...args: unknown[]) {
      const options = optionsOf(this, args);
      return client(options, async (sdk) => {
        const setting = await sdk.callback.getCallbackSetting();
        if (isJson(options.output)) ctx.out(formatJson(setting));
        else printObject(ctx.out, { callbackUrl: setting.callbackUrl || '(not set)' }, ['callbackUrl'], 'table');
      });
    });

  callback
    .command('set')
    .description('Set the callback URL; without --url the setting is cleared')
    .option('--url <url>', 'https URL the platform posts events to')
    .option('--force', 'skip the confirmation prompt')
    .action(function (this: Command, ...args: unknown[]) {
      const options = optionsOf(this, args);
      return client(options, async (sdk) => {
        const url = optionalString(options.url);
        if (url && !/^https?:\/\//.test(url)) throw new CommandError('--url must be an http(s) URL');
        await confirmWrite(url ? `set the callback URL to ${url}` : 'clear the callback URL', { force: options.force === true });
        await sdk.callback.updateCallbackSetting({ callbackUrl: url });
        ctx.out(url ? `✅ Callback URL set to ${url}` : '✅ Callback URL cleared');
      });
    });

  callback
    .command('verify')
    .description('Check that an event callback was signed by the platform (offline; uses the account secretkey)')
    .option('--json <payload>', 'callback body as JSON; query fields such as sign and type may be merged in')
    .option('--sign <sign>', 'sign parameter of the callback')
    .option('--type <type>', 'type parameter of the callback')
    .option('--event-type <type>', 'eventType field of the callback body')
    .option('--vid <vid>', 'video id')
    .option('--format <format>', 'transcoded format, e.g. mp4')
    .option('--df <df>', 'clearness index of the transcoded file')
    .option('--file-url <url>', 'source URL of a failed URL upload')
    .option('--secret-key <key>', 'check with this secretkey instead of the saved one')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(function (this: Command, ...args: unknown[]) {
      const options = optionsOf(this, args);
      return local(() => {
        const payload = (typeof options.json === 'string' ? jsonOption(options.json, '--json') : {}) as Record<string, unknown>;
        const field = (name: keyof CallbackSignInput, ...keys: string[]): string | undefined => {
          for (const key of keys) {
            const value = payload[key];
            if (typeof value === 'string' || typeof value === 'number') return String(value);
          }
          return optionalString(options[name]);
        };
        const input: CallbackSignInput = {
          sign: field('sign', 'sign') ?? '',
          type: field('type', 'type'),
          eventType: field('eventType', 'eventType'),
          vid: field('vid', 'vid', 'mediaId', 'videoId'),
          format: field('format', 'format'),
          df: field('df', 'df'),
          fileUrl: field('fileUrl', 'fileUrl')
        };
        if (!input.sign) throw new CommandError('Pass the callback signature with --sign or in --json');
        const secretKey = optionalString(options.secretKey) ?? resolveAuth(ctx.store, ctx.session, options)?.credentials.secretKey;
        if (!secretKey) throw new CommandError('No secretkey to check against: save an account or pass --secret-key');
        const valid = verifyCallbackSignature(input, secretKey);
        if (isJson(options.output)) {
          // stdout carries the result only; a failure goes to stderr so scripts can parse it.
          ctx.out(formatJson({ valid }));
        } else if (valid) {
          ctx.out('✅ Signature valid: the callback comes from the platform');
        }
        if (!valid) {
          ctx.err('❌ Signature invalid');
          ctx.fail();
        }
      });
    });
}
