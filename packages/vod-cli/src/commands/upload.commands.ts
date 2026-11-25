/**
 * `upload` commands: local files, public URLs and the URL-upload tasks.
 */
import { writeFileSync } from 'node:fs';

import { Command } from 'commander';

import type { UploadMode, UploadProgress } from 'polyv-vod-api-sdk';

import { CommandError, type CommandContext, executors } from '../core/context';
import { confirmWrite } from '../core/confirm';
import { optionsOf, jsonOption, optionalString, positiveInteger, requireValue } from '../core/options';
import { bytes, formatJson, isJson, printRows, validateOutputFormat } from '../core/output';

const MODES = ['auto', 'direct', 'chunked'];

/** Writes a progress line that rewrites itself on a terminal and stays silent elsewhere. */
export function progressReporter(err: (line: string) => void, interactive: boolean): (progress: UploadProgress) => void {
  return (progress) => {
    if (!interactive) return;
    const percent = progress.totalBytes > 0 ? Math.floor((progress.uploadedBytes / progress.totalBytes) * 100) : 0;
    const parts = progress.totalParts !== undefined && progress.totalParts > 1 ? ` (${progress.uploadedParts}/${progress.totalParts} parts)` : '';
    err(`\r⬆️  ${percent}%${parts}  ${bytes(progress.uploadedBytes)} / ${bytes(progress.totalBytes)}   `);
  };
}

export function registerUploadCommands(program: Command, ctx: CommandContext): void {
  const { client } = executors(ctx);
  const upload = program.command('upload').description('Upload videos and manage URL-upload tasks');
  const output = '-o, --output <format>';
  const outputHelp = 'output format (table|json)';

  upload
    .command('file <path>')
    .description('Upload a local video (up to 2 GB in one request; larger or interrupted files use the resumable upload)')
    .option('--title <title>', 'title; defaults to the file name')
    .option('--description <text>', 'description')
    .option('--tag <tags>', 'tags')
    .option('--cata-id <id>', 'category to upload into')
    .option('--luping', 'optimise a screen recording')
    .option('--keep-source', 'play the source file instead of transcoding it')
    .option('--mode <mode>', 'auto|direct|chunked')
    .option('--part-size <mb>', 'part size of the resumable upload in MB', positiveInteger)
    .option('--concurrency <n>', 'parallel part uploads', positiveInteger, 3)
    .option('--no-resume', 'ignore the saved progress of an interrupted upload of this file')
    .option('--checkpoint-dir <dir>', 'where the resume state is kept')
    .option('--wait', 'wait until the video is published or has failed')
    .option('--timeout <seconds>', 'how long to wait with --wait', positiveInteger, 600)
    .option(output, outputHelp, validateOutputFormat, 'table')
    .action(function (this: Command, ...args: unknown[]) {
      const options = optionsOf(this, args);
      return client(options, async (sdk) => {
        const path = requireValue(options.path, 'file path');
        const mode = optionalString(options.mode) ?? 'auto';
        if (!MODES.includes(mode)) throw new CommandError(`--mode must be one of ${MODES.join(', ')}`);
        const onProgress = progressReporter(ctx.err, process.stderr.isTTY === true && !isJson(options.output));
        const result = await sdk.upload.uploadFile({
          filePath: path,
          title: optionalString(options.title),
          description: optionalString(options.description),
          tag: optionalString(options.tag),
          cataId: optionalString(options.cataId),
          luping: options.luping === true,
          keepSource: options.keepSource === true,
          mode: mode as UploadMode,
          partSize: typeof options.partSize === 'number' ? options.partSize * 1024 * 1024 : undefined,
          concurrency: options.concurrency as number | undefined,
          resume: options.resume !== false,
          checkpointDir: optionalString(options.checkpointDir),
          onProgress
        });
        if (process.stderr.isTTY === true) ctx.err('');
        if (result.resumed) {
          // The video was created when the interrupted upload reserved its vid.
          const asked = optionalString(options.title);
          const keeps = asked !== undefined && asked !== result.title ? `the title "${result.title ?? ''}"` : 'the title';
          ctx.err(
            `ℹ️  Resumed upload: the video keeps ${keeps} given when the upload was first started, and the description, category and tags given then. ` +
              'Change them once it is published with "video update" and "video move".'
          );
        }
        const view = {
          vid: result.vid,
          title: result.title,
          mode: result.mode,
          status: result.status,
          resumed: result.resumed,
          parts: result.parts
        };
        if (options.wait === true) {
          const outcome = await sdk.video.waitUntilPublished(result.vid, { timeoutMs: (options.timeout as number) * 1000 });
          const status = outcome.info?.basicInfo.status;
          if (isJson(options.output)) {
            ctx.out(formatJson({ ...view, state: outcome.state, status }));
          } else if (outcome.state === 'published') {
            ctx.out(`✅ Uploaded ${result.vid} (${result.mode}) and published`);
          }
          if (outcome.state !== 'published') {
            ctx.err(`❌ Uploaded ${result.vid} (${result.mode}) but it is not published: ${outcome.state}${status !== undefined ? ` (status ${status})` : ''}`);
            ctx.fail();
          }
          return;
        }
        if (isJson(options.output)) ctx.out(formatJson(view));
        else {
          ctx.out(`✅ Uploaded ${result.vid} (${result.mode}${result.resumed ? ', resumed' : ''}${result.parts !== undefined ? `, ${String(result.parts)} part(s)` : ''})`);
          ctx.out(`   The platform now transcodes it; check with: polyv-vod-cli video wait ${result.vid} --source <id>`);
        }
      });
    });

  upload
    .command('url')
    .description('Pull videos from public URLs; the platform processes them in the background')
    .option('--file-url <urls>', 'public video URLs, comma-separated')
    .option('--title <titles>', 'titles matching --file-url, comma-separated')
    .option('--upload-infos <json>', 'JSON array of {fileUrl, title[, tag][, state]}; takes precedence over --file-url')
    .option('--cata-id <id>', 'category to upload into')
    .option('--luping', 'optimise screen recordings')
    .option('--force', 'skip the confirmation prompt')
    .action(function (this: Command, ...args: unknown[]) {
      const options = optionsOf(this, args);
      return client(options, async (sdk) => {
        const infos = typeof options.uploadInfos === 'string' ? (jsonOption(options.uploadInfos, '--upload-infos') as never[]) : undefined;
        const fileUrl = optionalString(options.fileUrl);
        if (!infos && !fileUrl) throw new CommandError('Pass --upload-infos or --file-url');
        await confirmWrite('upload videos from URLs', { force: options.force === true });
        await sdk.upload.uploadByUrl({
          uploadInfos: infos,
          fileUrl,
          title: optionalString(options.title),
          cataId: optionalString(options.cataId),
          luping: options.luping === true
        });
        ctx.out('✅ URL upload submitted; the results arrive through the callback or show up in: polyv-vod-cli upload tasks --source <id>');
      });
    });

  upload
    .command('tasks')
    .description('List the URL-upload tasks')
    .option('--page <n>', 'page number', positiveInteger, 1)
    .option('--page-size <n>', 'page size', positiveInteger, 10)
    .option(output, outputHelp, validateOutputFormat, 'table')
    .action(function (this: Command, ...args: unknown[]) {
      const options = optionsOf(this, args);
      return client(options, async (sdk) => {
        const page = await sdk.upload.listSyncTasks({ page: options.page as number, pageSize: options.pageSize as number });
        const rows = (page.contents ?? []).map((task) => ({
          taskId: task.taskid,
          category: task.classifyname ?? task.classifyid ?? '',
          total: task.totalcount ?? '',
          succeeded: task.seccesscount ?? '',
          failed: task.failcount ?? '',
          finished: task.endtime ? new Date(task.endtime).toISOString() : ''
        }));
        if (isJson(options.output)) ctx.out(formatJson(page));
        else printRows(ctx.out, rows, ['taskId', 'category', 'total', 'succeeded', 'failed', 'finished'], options.output);
      });
    });

  upload
    .command('task-export <task-id>')
    .description('Export the videos of a URL-upload task as CSV')
    .option('--out <file>', 'write the CSV to this file instead of stdout')
    .action(function (this: Command, ...args: unknown[]) {
      const options = optionsOf(this, args);
      return client(options, async (sdk) => {
        const taskId = requireValue(options.taskId, 'task id');
        const csv = await sdk.upload.exportSyncTask(taskId);
        const target = optionalString(options.out);
        if (target) {
          writeFileSync(target, csv);
          ctx.out(`✅ Written to ${target}`);
        } else if (csv.trim() !== '') {
          // stdout gets the CSV as the platform gave it. Output is by line, and a line ends with
          // one newline, so the CSV's own last one is left off here and comes back with the line.
          ctx.out(csv.replace(/\n$/, ''));
        }
        if (csv.trim() === '') {
          // Seen for a task in which every upload failed, and for one still running.
          ctx.err('ℹ️  The export is empty: nothing has finished uploading for this task yet, or every upload in it failed.');
        }
      });
    });

  upload
    .command('task-delete <task-id>')
    .description('Delete a URL-upload task record')
    .option('--force', 'skip the confirmation prompt')
    .action(function (this: Command, ...args: unknown[]) {
      const options = optionsOf(this, args);
      return client(options, async (sdk) => {
        const taskId = requireValue(options.taskId, 'task id');
        await confirmWrite(`delete task ${taskId}`, { force: options.force === true });
        await sdk.upload.deleteSyncTask(taskId);
        ctx.out(`✅ Task ${taskId} deleted`);
      });
    });

  upload
    .command('abort <path>')
    .description('Discard the stored parts of an interrupted resumable upload')
    .option('--checkpoint-dir <dir>', 'where the resume state is kept')
    .option('--force', 'skip the confirmation prompt')
    .action(function (this: Command, ...args: unknown[]) {
      const options = optionsOf(this, args);
      return client(options, async (sdk) => {
        const path = requireValue(options.path, 'file path');
        await confirmWrite(`discard the interrupted upload of ${path}`, { force: options.force === true });
        const aborted = await sdk.upload.abortChunkedUpload({ filePath: path, checkpointDir: optionalString(options.checkpointDir) });
        ctx.out(aborted ? `✅ Interrupted upload of ${path} discarded` : `No interrupted upload found for ${path}`);
      });
    });
}

