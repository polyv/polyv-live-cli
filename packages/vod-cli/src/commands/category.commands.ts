/**
 * `category` commands: the category tree (分类).
 */
import { Command } from 'commander';

import { isPolyVVodError, type CategoryNode, type PolyVVodClient } from 'polyv-vod-api-sdk';

import { CommandError, type CommandContext, executors } from '../core/context';
import { confirmWrite } from '../core/confirm';
import { optionsOf, optionalString, requireValue } from '../core/options';
import { formatJson, isJson, validateOutputFormat } from '../core/output';

/** Plain rows of a category tree, parents before their children. */
export function flattenCategories(nodes: CategoryNode[], depth = 0): Record<string, unknown>[] {
  return nodes.flatMap((node) => [
    { id: node.cataid, name: node.cataname, depth, parentId: node.parentid, videos: node.videos },
    ...flattenCategories(node.nodes ?? [], depth + 1)
  ]);
}

/** Nested view of a category for JSON output. */
export function categoryJson(node: CategoryNode): Record<string, unknown> {
  return {
    id: node.cataid,
    name: node.cataname,
    parentId: node.parentid,
    path: node.catatree,
    videos: node.videos,
    ...(node.cataProfile ? { settings: node.cataProfile.replace(/<[^>]+>/g, '').trim() } : {}),
    ...(node.nodes?.length ? { children: node.nodes.map(categoryJson) } : {})
  };
}

/** Categories below this one, at any depth. */
export function countSubCategories(node: CategoryNode): number {
  return (node.nodes ?? []).reduce((count, child) => count + 1 + countSubCategories(child), 0);
}

/**
 * What deleting this category takes with it.
 *
 * The platform deletes a category whatever it holds: every category below it goes with it, and
 * the videos in them are kept but move to the default category. `node.videos` counts the videos
 * of the whole sub-tree.
 */
export function deletedScope(node: CategoryNode, done: boolean): string {
  const subCategories = countSubCategories(node);
  const videos = node.videos ?? 0;
  const parts: string[] = [];
  if (subCategories > 0) parts.push(`with ${subCategories} sub-categor${subCategories === 1 ? 'y' : 'ies'}`);
  if (videos > 0) parts.push(`${videos} video${videos === 1 ? ` ${done ? 'moved' : 'moves'}` : `s ${done ? 'moved' : 'move'}`} to the default category`);
  return parts.join('; ');
}

/** The category an id names, to read what deleting it takes with it. */
async function categoryToDelete(sdk: PolyVVodClient, id: string): Promise<CategoryNode> {
  const notFound = (): CommandError => new CommandError(`Category ${id} was not found`, 'List the categories with: polyv-vod-cli category list --source <id>');
  let nodes: CategoryNode[] | undefined;
  try {
    nodes = await sdk.category.getCategories(id);
  } catch (error) {
    // The platform's own answer to an id it has no category for ("cataId不存在").
    if (isPolyVVodError(error) && error.kind === 'api' && /cataid/i.test(error.message)) throw notFound();
    throw error;
  }
  const node = nodes?.[0];
  if (!node) throw notFound();
  return node;
}

export function registerCategoryCommands(program: Command, ctx: CommandContext): void {
  const { client } = executors(ctx);
  const category = program.command('category').description('Manage the category tree');
  const output = '-o, --output <format>';
  const outputHelp = 'output format (table|json)';
  const cataId = (value: unknown, name: string): string => requireValue(value, name);

  category
    .command('list [id]')
    .description('Show the category tree below a category (the root by default)')
    .option(output, outputHelp, validateOutputFormat, 'table')
    .action(function (this: Command, ...args: unknown[]) {
      const options = optionsOf(this, args);
      return client(options, async (sdk) => {
        const nodes = await sdk.category.getCategories(options.id === undefined ? 1 : cataId(options.id, 'category id'));
        if (isJson(options.output)) {
          ctx.out(formatJson(nodes.map(categoryJson)));
          return;
        }
        if (nodes.length === 0) {
          ctx.out('No categories');
          return;
        }
        for (const row of flattenCategories(nodes)) {
          ctx.out(`${'  '.repeat(row.depth as number)}- ${String(row.id)}  ${String(row.name)}  (${String(row.videos)} video(s))`);
        }
      });
    });

  category
    .command('add <name>')
    .description('Create a category')
    .requiredOption('--parent-id <id>', 'parent category id; 1 is the root')
    .option('--force', 'skip the confirmation prompt')
    .option(output, outputHelp, validateOutputFormat, 'table')
    .action(function (this: Command, ...args: unknown[]) {
      const options = optionsOf(this, args);
      return client(options, async (sdk) => {
        const name = requireValue(options.name, 'category name');
        const parentId = cataId(options.parentId, '--parent-id');
        await confirmWrite(`create category "${name}" under category ${parentId}`, { force: options.force === true });
        const created = await sdk.category.addCategory({ cataname: name, parentid: parentId });
        const view = { id: created.cataid, name, parentId, path: created.catatree };
        if (isJson(options.output)) ctx.out(formatJson(view));
        else ctx.out(`✅ Category created: ${String(created.cataid)} ("${name}" under ${parentId})`);
      });
    });

  category
    .command('rename <id> <name>')
    .description('Rename a category')
    .option('--force', 'skip the confirmation prompt')
    .action(function (this: Command, ...args: unknown[]) {
      const options = optionsOf(this, args);
      return client(options, async (sdk) => {
        const target = cataId(options.id, 'category id');
        const name = requireValue(options.name, 'new name');
        await confirmWrite(`rename category ${target} to "${name}"`, { force: options.force === true });
        await sdk.category.renameCategory({ cataid: target, cataname: name });
        ctx.out(`✅ Category ${target} renamed to "${name}"`);
      });
    });

  category
    .command('setting <id>')
    .description('Change what a top-level category does with videos uploaded into it afterwards')
    .option('--encrypt', 'encrypt new videos').option('--no-encrypt', 'do not encrypt new videos')
    .option('--keep-source', 'play the source file instead of a transcoded one').option('--no-keep-source', 'transcode new videos')
    .option('--edu', 'optimise new videos for screen recordings').option('--no-edu', 'no screen-recording optimisation')
    .option('--aac', 'also produce an audio file').option('--no-aac', 'do not produce an audio file')
    .option('--hls-level <level>', 'mobile authorization level: open|web|app|wxa_app')
    .option('--player-id <id>', 'player for the videos of this category')
    .option('--force', 'skip the confirmation prompt')
    .action(function (this: Command, ...args: unknown[]) {
      const options = optionsOf(this, args);
      return client(options, async (sdk) => {
        const target = cataId(options.id, 'category id');
        const encrypt = flagOf(options, 'encrypt');
        const keepSource = flagOf(options, 'keepSource');
        const isEdu = flagOf(options, 'edu');
        const encodeAac = flagOf(options, 'aac');
        const HLS_LEVELS: readonly string[] = ['open', 'web', 'app', 'wxa_app'];
        const rawLevel = optionalString(options.hlsLevel);
        if (rawLevel !== undefined && !HLS_LEVELS.includes(rawLevel)) {
          throw new CommandError('--hls-level must be one of open, web, app, wxa_app');
        }
        // Validated against HLS_LEVELS above.
        const hlslevel = rawLevel as 'open' | 'web' | 'app' | 'wxa_app' | undefined;
        const playerId = optionalString(options.playerId);
        if (encrypt === undefined && keepSource === undefined && isEdu === undefined && encodeAac === undefined && hlslevel === undefined && playerId === undefined) {
          throw new CommandError('Pass at least one setting to change');
        }
        await confirmWrite(`change the settings of category ${target}`, { force: options.force === true });
        await sdk.category.updateCategorySetting({
          cataid: target,
          encrypt,
          keepSource,
          isEdu,
          encodeAac,
          hlslevel,
          playerId
        });
        ctx.out(`✅ Settings of category ${target} updated`);
      });
    });

  category
    .command('move <id>')
    .description('Move a category under another one')
    .requiredOption('--dest-id <id>', 'new parent category id; 1 is the root')
    .option('--force', 'skip the confirmation prompt')
    .action(function (this: Command, ...args: unknown[]) {
      const options = optionsOf(this, args);
      return client(options, async (sdk) => {
        const source = cataId(options.id, 'category id');
        const dest = cataId(options.destId, '--dest-id');
        await confirmWrite(`move category ${source} under category ${dest}`, { force: options.force === true });
        await sdk.category.moveCategory({ cataid: source, destCataid: dest });
        ctx.out(`✅ Category ${source} moved under category ${dest}`);
      });
    });

  category
    .command('delete <id>')
    .description('Delete a category together with every category under it; the videos in them move to the default category')
    .option('--force', 'skip the confirmation prompt')
    .action(function (this: Command, ...args: unknown[]) {
      const options = optionsOf(this, args);
      return client(options, async (sdk) => {
        const target = cataId(options.id, 'category id');
        if (target === '1') throw new CommandError('Category 1 is the root category; it cannot be deleted');
        // Read what the delete takes with it first, so the confirmation can say so.
        const node = await categoryToDelete(sdk, target);
        const scope = deletedScope(node, false);
        await confirmWrite(`delete category ${target} "${node.cataname}"${scope ? ` (${scope})` : ''}`, { force: options.force === true });
        await sdk.category.deleteCategory(target);
        const done = deletedScope(node, true);
        ctx.out(`✅ Category ${target} deleted${done ? ` (${done})` : ''}`);
      });
    });
}

/** Value of an option declared with both `--x` and `--no-x`: true, false, or unset. */
function flagOf(options: Record<string, unknown>, name: string): boolean | undefined {
  return typeof options[name] === 'boolean' ? (options[name] as boolean) : undefined;
}
