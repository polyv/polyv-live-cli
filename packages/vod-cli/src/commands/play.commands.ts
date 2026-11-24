/**
 * `play` commands: credentials for playing protected videos.
 */
import { Command } from 'commander';

import { type CommandContext, executors } from '../core/context';
import { optionsOf, optionalString, positiveInteger } from '../core/options';
import { formatJson, isJson, printObject, validateOutputFormat } from '../core/output';

export function registerPlayCommands(program: Command, ctx: CommandContext): void {
  const { client } = executors(ctx);
  const play = program.command('play').description('Playback credentials');

  play
    .command('token')
    .description('Create a token for playing an encrypted video')
    .requiredOption('--vid <vid>', 'video id')
    .requiredOption('--viewer-id <id>', 'id of the viewer; use a different one per viewer')
    .option('--viewer-name <name>', 'viewer name')
    .option('--viewer-ip <ip>', 'viewer IP; defaults to the caller IP')
    .option('--expires <seconds>', 'lifetime in seconds (default 600, max 86400)', positiveInteger)
    .option('--disposable', 'make the token valid for a single verification')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action(function (this: Command, ...args: unknown[]) {
      const options = optionsOf(this, args);
      return client(options, async (sdk) => {
        const token = await sdk.playSafe.createPlayToken({
          videoId: options.vid as string,
          viewerId: options.viewerId as string,
          viewerName: optionalString(options.viewerName),
          viewerIp: optionalString(options.viewerIp),
          expires: options.expires as number | undefined,
          disposable: options.disposable === true
        });
        const view = {
          token: token.token,
          videoId: token.videoId,
          viewerId: token.viewerId,
          ttlSeconds: Math.round(token.ttl / 1000),
          expiresAt: new Date(token.expiredTime).toISOString()
        };
        if (isJson(options.output)) ctx.out(formatJson({ ...view, ttl: token.ttl, createdTime: token.createdTime, expiredTime: token.expiredTime, disposable: token.disposable }));
        else printObject(ctx.out, view, ['videoId', 'viewerId', 'token', 'ttlSeconds', 'expiresAt'], 'table');
      });
    });
}
