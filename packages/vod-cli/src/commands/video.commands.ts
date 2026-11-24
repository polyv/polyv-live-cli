/**
 * `video` commands: search, inspect, update, move, ban, delete and wait for videos.
 */
import { Command } from 'commander';

import { describeVideoStatus, type VideoInfoItem, type VideoSort } from 'polyv-vod-api-sdk';

import { CommandError, type CommandContext, executors } from '../core/context';
import { confirmWrite } from '../core/confirm';
import { optionsOf, optionalString, positiveInteger, requireValue, stringList, vidsOf } from '../core/options';
import { bytes, formatJson, isJson, printRows, seconds, validateOutputFormat } from '../core/output';

/** Flat view of a video for tables and JSON. */
export function videoRow(item: VideoInfoItem): Record<string, unknown> {
  const basic = item.basicInfo;
  return {
    vid: item.vid,
    title: basic?.title,
    status: describeVideoStatus(basic?.status),
    duration: seconds(basic?.duration),
    size: bytes(basic?.size),
    category: basic?.cateName,
    categoryId: basic?.cateId,
    tags: basic?.tags,
    playTimes: basic?.playTimes,
    created: basic?.creationTime,
    ...(item.transcodeInfos?.length ? { playUrl: item.transcodeInfos[0].playUrl } : {})
  };
}

const SEARCH_COLUMNS = ['vid', 'title', 'status', 'duration', 'size', 'category', 'playTimes', 'created'];
const DETAIL_COLUMNS = [...SEARCH_COLUMNS, 'categoryId', 'tags', 'playUrl'];

export function registerVideoCommands(program: Command, ctx: CommandContext): void {
  const { client } = executors(ctx);
  const video = program.command('video').description('Search and manage videos');
  const output = '-o, --output <format>';
  const outputHelp = 'output format (table|json)';

  video
    .command('search')
    .description('Search videos')
    .option('--title <text>', 'fuzzy match on title or vid')
    .option('--cata-id <id>', 'category id')
    .option('--tag <text>', 'fuzzy match on tag')
    .option('--status <codes>', 'status codes, comma-separated; 60 or 61 means published')
    .option('--sort <order>', 'creationTimeAsc|creationTimeDesc|playTimesAsc|playTimesDesc')
    .option('--page <n>', 'page number', positiveInteger, 1)
    .option('--page-size <n>', 'page size (max 1000)', positiveInteger, 10)
    .option(output, outputHelp, validateOutputFormat, 'table')
    .action(function (this: Command, ...args: unknown[]) {
      const options = optionsOf(this, args);
      return client(options, async (sdk) => {
        const result = await sdk.video.searchVideos({
          title: optionalString(options.title),
          cataId: optionalString(options.cataId),
          tag: optionalString(options.tag),
          status: optionalString(options.status),
          sort: optionalString(options.sort) as VideoSort | undefined,
          page: options.page as number,
          pageSize: options.pageSize as number
        });
        const rows = result.contents.map(videoRow);
        if (isJson(options.output)) {
          ctx.out(formatJson({ totalItems: result.totalItems, pageNumber: result.pageNumber, totalPages: result.totalPages, videos: result.contents }));
        } else {
          printRows(ctx.out, rows, SEARCH_COLUMNS, options.output);
          ctx.out(`${result.totalItems} video(s) in total, page ${result.pageNumber} of ${result.totalPages}`);
        }
      });
    });

  video
    .command('get <vid...>')
    .description('Show up to 100 videos; add -o json for every field')
    .option(output, outputHelp, validateOutputFormat, 'table')
    .action(function (this: Command, ...args: unknown[]) {
      const options = optionsOf(this, args);
      return client(options, async (sdk) => {
        const items = await sdk.video.getVideoInfo(vidsOf(options.vid));
        if (isJson(options.output)) ctx.out(formatJson(items));
        else printRows(ctx.out, items.map(videoRow), DETAIL_COLUMNS, options.output);
      });
    });

  video
    .command('update <vid>')
    .description('Change the title, description or tags of a video')
    .option('--title <title>', 'new title')
    .option('--description <text>', 'new description')
    .option('--tag <tags>', 'new tags')
    .option('--force', 'skip the confirmation prompt')
    .option(output, outputHelp, validateOutputFormat, 'table')
    .action(function (this: Command, ...args: unknown[]) {
      const options = optionsOf(this, args);
      return client(options, async (sdk) => {
        const vid = requireValue(options.vid, 'vid');
        const title = optionalString(options.title);
        const description = optionalString(options.description);
        const tag = optionalString(options.tag);
        if (title === undefined && description === undefined && tag === undefined) {
          throw new CommandError('Pass at least one of --title, --description or --tag');
        }
        await confirmWrite(`update video "${vid}"`, { force: options.force === true });
        await sdk.video.updateVideoInfo({ vid, title, description, tag });
        ctx.out(`✅ Video ${vid} updated`);
      });
    });

  video
    .command('delete <vid...>')
    .description('Delete up to 500 videos, to the recycle bin by default')
    .option('--permanent', 'delete for good instead of moving to the recycle bin')
    .option('--strict', 'fail when any video cannot be deleted, instead of skipping it')
    .option('--force', 'skip the confirmation prompt')
    .option(output, outputHelp, validateOutputFormat, 'table')
    .action(function (this: Command, ...args: unknown[]) {
      const options = optionsOf(this, args);
      return client(options, async (sdk) => {
        const vids = vidsOf(options.vid);
        const permanent = options.permanent === true;
        await confirmWrite(`${permanent ? 'permanently delete' : 'move to the recycle bin'} ${vids.length} video(s)`, { force: options.force === true });
        const { skipped } = await sdk.video.deleteVideos(vids, { deleteType: permanent ? 2 : 1, ignoreInvalidVids: options.strict !== true });
        const deleted = vids.filter((vid) => !skipped.includes(vid));
        if (isJson(options.output)) {
          ctx.out(formatJson({ deleted, skipped }));
        } else {
          ctx.out(`✅ ${deleted.length} video(s) ${permanent ? 'permanently deleted' : 'moved to the recycle bin'}`);
        }
        if (skipped.length > 0) {
          // A 200 does not mean every video is gone: the platform lists the ones it skipped.
          ctx.err(`⚠️  Not deleted: ${skipped.join(', ')} (unknown, already deleted, or still processing). Retry later with the same command.`);
        }
      });
    });

  video
    .command('recover <vid...>')
    .description('Restore up to 100 videos from the recycle bin')
    .option('--force', 'skip the confirmation prompt')
    .action(function (this: Command, ...args: unknown[]) {
      const options = optionsOf(this, args);
      return client(options, async (sdk) => {
        const vids = vidsOf(options.vid);
        await confirmWrite(`restore ${vids.length} video(s) from the recycle bin`, { force: options.force === true });
        await sdk.video.recoverVideos(vids);
        ctx.out(`✅ ${vids.length} video(s) restored`);
      });
    });

  video
    .command('move <vid...>')
    .description('Move up to 500 videos into a category')
    .requiredOption('--cata-id <id>', 'target category id')
    .option('--force', 'skip the confirmation prompt')
    .action(function (this: Command, ...args: unknown[]) {
      const options = optionsOf(this, args);
      return client(options, async (sdk) => {
        const vids = vidsOf(options.vid);
        await confirmWrite(`move ${vids.length} video(s) into category ${String(options.cataId)}`, { force: options.force === true });
        await sdk.video.moveVideos({ vids, cataId: requireValue(options.cataId, '--cata-id') });
        ctx.out(`✅ ${vids.length} video(s) moved into category ${String(options.cataId)}`);
      });
    });

  const forbidden = (ban: boolean): void => {
    video
      .command(ban ? 'ban <vid...>' : 'unban <vid...>')
      .description(ban ? 'Ban up to 500 published videos' : 'Unban up to 500 banned videos')
      .option('--force', 'skip the confirmation prompt')
      .action(function (this: Command, ...args: unknown[]) {
        const options = optionsOf(this, args);
        return client(options, async (sdk) => {
          const vids = vidsOf(options.vid);
          await confirmWrite(`${ban ? 'ban' : 'unban'} ${vids.length} video(s)`, { force: options.force === true });
          await sdk.video.setForbidden({ vids, forbidden: ban });
          ctx.out(`✅ ${vids.length} video(s) ${ban ? 'banned' : 'unbanned'}`);
        });
      });
  };
  forbidden(true);
  forbidden(false);

  video
    .command('size')
    .description('Duration and transcoded sizes of videos, or of a category')
    .option('--vid <vids>', 'video ids, comma-separated')
    .option('--cata-id <id>', 'category ids, comma-separated')
    .option(output, outputHelp, validateOutputFormat, 'table')
    .action(function (this: Command, ...args: unknown[]) {
      const options = optionsOf(this, args);
      return client(options, async (sdk) => {
        const vids = optionalString(options.vid);
        const cataId = optionalString(options.cataId);
        if (!vids && !cataId) throw new CommandError('Pass --vid or --cata-id');
        const groups = await sdk.video.getDurationAndSize({ vids: vids ? stringList(vids) : undefined, cataId });
        const rows = groups.flatMap((group) =>
          (group.videos ?? []).map((item) => ({
            categoryId: group.cataid ?? '',
            vid: item.vid,
            duration: item.duration,
            size: bytes((item.filesize1 ?? 0) + (item.filesize2 ?? 0) + (item.filesize3 ?? 0))
          }))
        );
        printRows(ctx.out, rows, ['categoryId', 'vid', 'duration', 'size'], options.output);
      });
    });

  video
    .command('wait <vid>')
    .description('Wait until a video is published or has definitively failed')
    .option('--timeout <seconds>', 'how long to wait (transcoding takes minutes)', positiveInteger, 600)
    .option('--interval <seconds>', 'seconds between checks', positiveInteger, 5)
    .option(output, outputHelp, validateOutputFormat, 'table')
    .action(function (this: Command, ...args: unknown[]) {
      const options = optionsOf(this, args);
      return client(options, async (sdk) => {
        const vid = requireValue(options.vid, 'vid');
        ctx.err(`⏳ Waiting for video ${vid} to be published (up to ${String(options.timeout)}s)...`);
        const outcome = await sdk.video.waitUntilPublished(vid, {
          timeoutMs: (options.timeout as number) * 1000,
          intervalMs: (options.interval as number) * 1000
        });
        const status = outcome.info ? describeVideoStatus(outcome.info.basicInfo.status) : 'unknown';
        if (isJson(options.output)) {
          // stdout carries the result only; the failure goes to stderr so scripts can parse it.
          ctx.out(formatJson({ state: outcome.state, status, video: outcome.info ?? null }));
        } else if (outcome.state === 'published') {
          ctx.out(`✅ Video ${vid} is published`);
        }
        if (outcome.state === 'failed') {
          ctx.err(`❌ Video ${vid} is not playable: ${status}`);
          ctx.fail();
        } else if (outcome.state === 'timeout') {
          ctx.err(`❌ Timed out waiting for video ${vid}; last status: ${status}`);
          ctx.fail();
        }
      });
    });
}
