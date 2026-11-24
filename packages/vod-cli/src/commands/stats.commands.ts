/**
 * `stats` commands: space, traffic and playback statistics.
 */
import { Command } from 'commander';

import type { PlayDateRange, PlayPeriod, RankDateRange, ViewLogEntry } from 'polyv-vod-api-sdk';

import { CommandError, type CommandContext, executors } from '../core/context';
import { dateString, optionsOf, optionalString, positiveInteger, vidsOf } from '../core/options';
import { bytes, formatJson, isJson, printObject, printRows, seconds, validateOutputFormat } from '../core/output';

const output = '-o, --output <format>';
const outputHelp = 'output format (table|json)';

/** The view log comes back as `contents` or as `data` depending on the endpoint. */
export function viewLogRows(entries: ViewLogEntry[] | undefined): Record<string, unknown>[] {
  return (entries ?? []).map((entry) => ({
    day: entry.currentDay ?? '',
    videoId: entry.videoId,
    watched: seconds(entry.playDuration),
    position: seconds(entry.currentTimes),
    length: seconds(entry.duration),
    ip: entry.ipAddress ?? '',
    city: entry.city ?? '',
    page: entry.referer ?? '',
    client: [entry.operatingSystem, entry.browser].filter(Boolean).join(' ')
  }));
}

export function registerStatsCommands(program: Command, ctx: CommandContext): void {
  const { client } = executors(ctx);
  const stats = program.command('stats').description('Space, traffic and playback statistics');

  stats
    .command('usage')
    .description('Space and traffic usage')
    .option('--date <date>', 'one day (yyyy-MM-dd); omit for the whole current plan')
    .option(output, outputHelp, validateOutputFormat, 'table')
    .action(function (this: Command, ...args: unknown[]) {
      const options = optionsOf(this, args);
      return client(options, async (sdk) => {
        const usage = await sdk.statistics.getAccountUsage(dateString(options.date, '--date'));
        if (isJson(options.output)) {
          ctx.out(formatJson(usage));
          return;
        }
        printObject(
          ctx.out,
          {
            videos: usage.videoCount,
            usedSpace: bytes(usage.usedSpace),
            totalSpace: bytes(usage.totalSpace),
            usedTraffic: bytes(usage.usedFlow),
            totalTraffic: bytes(usage.totalFlow)
          },
          ['videos', 'usedSpace', 'totalSpace', 'usedTraffic', 'totalTraffic'],
          'table'
        );
      });
    });

  stats
    .command('play-times')
    .description('Play counts per day, week or month')
    .option('--vid <vid>', 'one video; omit for the whole account')
    .option('--dr <range>', 'today|yesterday|this_week|last_week|7days|this_month|last_month|this_year|last_year')
    .option('--period <period>', 'daily|weekly|monthly (weekly and monthly need this_month or last_month)')
    .option(output, outputHelp, validateOutputFormat, 'table')
    .action(function (this: Command, ...args: unknown[]) {
      const options = optionsOf(this, args);
      return client(options, async (sdk) => {
        const items = await sdk.statistics.getPlayTimes({
          vid: optionalString(options.vid),
          dr: optionalString(options.dr) as PlayDateRange | undefined,
          period: optionalString(options.period) as PlayPeriod | undefined
        });
        printRows(ctx.out, items.map((item) => ({ period: item.currentTime, pc: item.pcVideoView, mobile: item.mobileVideoView })), ['period', 'pc', 'mobile'], options.output);
      });
    });

  stats
    .command('rank')
    .description('Most played videos')
    .option('--start <date>', 'start date (yyyy-MM-dd)')
    .option('--end <date>', 'end date (yyyy-MM-dd)')
    .option('--dr <range>', 'today|yesterday|7days|30days')
    .option(output, outputHelp, validateOutputFormat, 'table')
    .action(function (this: Command, ...args: unknown[]) {
      const options = optionsOf(this, args);
      return client(options, async (sdk) => {
        const rank = await sdk.statistics.getPlayTimesRank({
          start: dateString(options.start, '--start'),
          end: dateString(options.end, '--end'),
          dr: optionalString(options.dr) as RankDateRange | undefined
        });
        const row = (list: string) => (item: { videoId: string; title: string; duration: string; pcVideoView: number; mobileVideoView: number }) => ({ list, videoId: item.videoId, title: item.title, duration: item.duration, pc: item.pcVideoView, mobile: item.mobileVideoView });
        if (isJson(options.output)) {
          ctx.out(formatJson(rank));
          return;
        }
        printRows(ctx.out, [...rank.pcVideoDailys.map(row('PC')), ...rank.moVideoDailys.map(row('mobile'))], ['list', 'videoId', 'title', 'duration', 'pc', 'mobile'], options.output);
      });
    });

  stats
    .command('video-play-times <vid...>')
    .description('Total play count of specific videos')
    .option('--real-time', 'count the plays of today as well')
    .option(output, outputHelp, validateOutputFormat, 'table')
    .action(function (this: Command, ...args: unknown[]) {
      const options = optionsOf(this, args);
      return client(options, async (sdk) => {
        const items = await sdk.statistics.getVideoPlayTimes(vidsOf(options.vid), options.realTime === true);
        printRows(ctx.out, items.map((item) => ({ videoId: item.vid, playTimes: item.times })), ['videoId', 'playTimes'], options.output);
      });
    });

  stats
    .command('view-log')
    .description('View log of one day or of one month')
    .option('--day <day>', 'one day (yyyyMMdd)')
    .option('--month <month>', 'one month (yyyyMM)')
    .option('--vid <vid>', 'one video; omit for every video')
    .option('--page <n>', 'page number', positiveInteger, 1)
    .option('--page-size <n>', 'page size', positiveInteger, 50)
    .option(output, outputHelp, validateOutputFormat, 'table')
    .action(function (this: Command, ...args: unknown[]) {
      const options = optionsOf(this, args);
      return client(options, async (sdk) => {
        const day = optionalString(options.day);
        const month = optionalString(options.month);
        if (!day && !month) throw new CommandError('Pass --day <yyyyMMdd> or --month <yyyyMM>');
        if (day && month) throw new CommandError('Pass either --day or --month, not both');
        if (day) {
          if (!/^\d{8}$/.test(day)) throw new CommandError('--day must be formatted yyyyMMdd');
          const result = await sdk.statistics.getDailyViewLog({ day, pageNum: options.page as number, pageSize: options.pageSize as number });
          if (isJson(options.output)) {
            ctx.out(formatJson(result));
            return;
          }
          const page = result as { total?: number; contents?: ViewLogEntry[]; data?: ViewLogEntry[] };
          printRows(ctx.out, viewLogRows(page.contents ?? page.data), ['day', 'videoId', 'watched', 'position', 'length', 'ip', 'city', 'page', 'client'], 'table');
          return;
        }
        const result = await sdk.statistics.getMonthlyViewLog({ month: month as string, pageNum: options.page as number, pageSize: options.pageSize as number, vid: optionalString(options.vid) });
        if (isJson(options.output)) {
          ctx.out(formatJson(result));
          return;
        }
        printRows(ctx.out, viewLogRows(result.contents ?? result.data), ['day', 'videoId', 'watched', 'position', 'length', 'ip', 'city', 'page', 'client'], 'table');
        if (typeof result.total === 'number') ctx.out(`${result.total} entries in total`);
      });
    });
}
