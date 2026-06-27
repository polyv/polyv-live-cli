import { Command } from 'commander';
import { WebHandler } from '../handlers/web.handler';
import { logError } from '../utils/errors';
import {
  commandParentOptions,
  loadApiCommandConfig,
  parseJsonArray,
  parseNonNegativeNumber,
  parsePositiveInteger,
  parseStringList,
  validateOutputFormat,
  validateYn,
} from '../utils/api-command';

function withWebHandler(program: Command, run: (handler: WebHandler) => Promise<void>): Promise<void> {
  return (async () => {
    try {
      const { authConfig, serviceConfig } = await loadApiCommandConfig(commandParentOptions(program));
      await run(new WebHandler(authConfig, serviceConfig));
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)));
      process.exit(1);
    }
  })();
}

function parseNumberCsv(value: string): number[] {
  const values = value.split(',').map((item) => Number(item.trim())).filter((item) => Number.isFinite(item));
  if (values.length === 0) {
    throw new Error('value must contain at least one number');
  }
  return values;
}

function validateMenuType(value: string): string {
  const values = ['desc', 'chat', 'quiz', 'text', 'iframe', 'qa', 'buy', 'invite'];
  if (!values.includes(value)) {
    throw new Error(`menu type must be one of: ${values.join(', ')}`);
  }
  return value;
}

function validateLang(value: string): string {
  if (value !== 'zh_CN' && value !== 'EN') {
    throw new Error('lang must be zh_CN or EN');
  }
  return value;
}

function validateGlobalEnabledType(value: string): string {
  const values = ['auth', 'switch', 'marquee', 'restrict', 'donate', 'advert', 'callback', 'player', 'watchtheme'];
  if (!values.includes(value)) {
    throw new Error(`global-enabled type must be one of: ${values.join(', ')}`);
  }
  return value;
}

function addOutput(command: Command): Command {
  return command.option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table');
}

function addForceOutput(command: Command): Command {
  return addOutput(command.option('-f, --force', 'skip confirmation prompt'));
}

export function registerWebCommands(program: Command): void {
  const webCmd = program.command('web').description('Manage watch page configuration');

  const infoCmd = webCmd.command('info').description('Watch page basic info');
  addOutput(infoCmd.command('splash-get').description('Get splash settings')
    .requiredOption('-c, --channel-id <id>', 'channel ID'))
    .action((options) => withWebHandler(program, handler => handler.getSplash(options)));

  addForceOutput(infoCmd.command('splash-set').description('Set splash settings')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--splash-enabled <value>', 'splash enabled (Y|N)', validateYn))
    .action((options) => withWebHandler(program, handler => handler.setSplash(options)));

  addForceOutput(infoCmd.command('publisher-set').description('Set host/publisher name')
    .requiredOption('--user-id <id>', 'user ID')
    .requiredOption('--publisher <name>', 'publisher name')
    .option('-c, --channel-id <id>', 'channel ID; omit for all channels'))
    .action((options) => withWebHandler(program, handler => handler.setPublisher(options)));

  addForceOutput(infoCmd.command('channel-name-update').description('Update channel name')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--name <name>', 'channel name'))
    .action((options) => withWebHandler(program, handler => handler.updateChannelName(options)));

  addForceOutput(infoCmd.command('channel-logo-update').description('Update channel logo')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--imgfile <path>', 'image file path'))
    .action((options) => withWebHandler(program, handler => handler.updateChannelLogo(options)));

  addOutput(infoCmd.command('likes-get').description('Get likes and viewers')
    .requiredOption('--channel-ids <ids>', 'channel IDs, comma-separated'))
    .action((options) => withWebHandler(program, handler => handler.getLikes(options)));

  addForceOutput(infoCmd.command('likes-update').description('Update likes and viewers')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('--likes <count>', 'likes count', parseNonNegativeNumber)
    .option('--viewers <count>', 'viewers count', parseNonNegativeNumber))
    .action((options) => withWebHandler(program, handler => handler.updateLikes(options)));

  addOutput(infoCmd.command('countdown-get').description('Get countdown settings')
    .requiredOption('-c, --channel-id <id>', 'channel ID'))
    .action((options) => withWebHandler(program, handler => handler.getCountdown(options)));

  addForceOutput(infoCmd.command('countdown-set').description('Set countdown settings')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('--booking-enabled <value>', 'booking enabled (Y|N)', validateYn)
    .option('--start-time <time>', 'start time, yyyy-MM-dd HH:mm:ss'))
    .action((options) => withWebHandler(program, handler => handler.setCountdown(options)));

  const menuCmd = webCmd.command('menu').description('Watch page menu APIs');
  addOutput(menuCmd.command('list').description('List channel menus')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('--lang <lang>', 'menu language (zh_CN|EN)', validateLang))
    .action((options) => withWebHandler(program, handler => handler.listMenus(options)));

  addForceOutput(menuCmd.command('add').description('Add channel menu')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--name <name>', 'menu name')
    .requiredOption('--type <type>', 'menu type', validateMenuType)
    .option('--content <content>', 'menu content')
    .option('--lang <lang>', 'menu language (zh_CN|EN)', validateLang)
    .option('--iframe-open-type <type>', 'iframe open type')
    .option('--link-type <type>', 'iframe link type', parsePositiveInteger))
    .action((options) => withWebHandler(program, handler => handler.addMenu(options)));

  addForceOutput(menuCmd.command('update').description('Update channel menu')
    .requiredOption('--menu-id <id>', 'menu ID')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--content <content>', 'menu content')
    .option('--lang <lang>', 'menu language (zh_CN|EN)', validateLang)
    .option('--iframe-open-type <type>', 'iframe open type')
    .option('--link-type <type>', 'iframe link type', parsePositiveInteger))
    .action((options) => withWebHandler(program, handler => handler.updateMenu(options)));

  addForceOutput(menuCmd.command('delete').description('Delete channel menu')
    .requiredOption('--menu-ids <ids>', 'menu IDs, comma-separated')
    .option('--lang <lang>', 'menu language (zh_CN|EN)', validateLang))
    .action((options) => withWebHandler(program, handler => handler.deleteMenu(options)));

  addForceOutput(menuCmd.command('rank-update').description('Update channel menu order')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--menu-ids <ids>', 'complete menu ID list, comma-separated')
    .option('--lang <lang>', 'menu language (zh_CN|EN)', validateLang))
    .action((options) => withWebHandler(program, handler => handler.updateRank(options)));

  addForceOutput(menuCmd.command('intro-set').description('Set live introduction menu')
    .requiredOption('--user-id <id>', 'user ID')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--content <content>', 'introduction content'))
    .action((options) => withWebHandler(program, handler => handler.setMenu(options)));

  addForceOutput(menuCmd.command('consulting-update').description('Update consulting menu switch')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--enabled <value>', 'enabled (Y|N)', validateYn))
    .action((options) => withWebHandler(program, handler => handler.updateConsultingEnabled(options)));

  addOutput(menuCmd.command('tuwen-list').description('List image-text live contents')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('--id <id>', 'content ID cursor', parsePositiveInteger)
    .option('--image-mode <value>', 'image mode (Y|N)', validateYn))
    .action((options) => withWebHandler(program, handler => handler.listTuwen(options)));

  const donateCmd = webCmd.command('donate').description('Watch page donate APIs');
  addOutput(donateCmd.command('get').description('Get donate settings')
    .option('-c, --channel-id <id>', 'channel ID; omit for global settings'))
    .action((options) => withWebHandler(program, handler => handler.getDonate(options)));

  addForceOutput(donateCmd.command('cash-update').description('Update cash donate settings')
    .option('-c, --channel-id <id>', 'channel ID; omit for global settings')
    .requiredOption('--cashes <values>', 'six cash amount values, comma-separated', parseNumberCsv)
    .requiredOption('--cash-min <amount>', 'minimum cash amount', parseNonNegativeNumber)
    .option('--enabled <value>', 'enabled (Y|N)', validateYn))
    .action((options) => withWebHandler(program, handler => handler.updateCash(options)));

  addForceOutput(donateCmd.command('good-update').description('Update gift donate settings')
    .option('-c, --channel-id <id>', 'channel ID; omit for global settings')
    .requiredOption('--goods <json>', 'goods JSON array', parseJsonArray)
    .option('--enabled <value>', 'enabled (Y|N)', validateYn))
    .action((options) => withWebHandler(program, handler => handler.updateGood(options)));

  const shareCmd = webCmd.command('share').description('Watch page share APIs');
  addOutput(shareCmd.command('get').description('Get WeChat share settings')
    .requiredOption('-c, --channel-id <id>', 'channel ID'))
    .action((options) => withWebHandler(program, handler => handler.getWeixinShare(options)));

  addForceOutput(shareCmd.command('update').description('Update WeChat share settings')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('--weixin-share-title <title>', 'WeChat share title')
    .option('--weixin-share-desc <desc>', 'WeChat share description'))
    .action((options) => withWebHandler(program, handler => handler.updateWeixinShare(options)));

  const settingCmd = webCmd.command('setting').description('Watch page common settings');
  addForceOutput(settingCmd.command('global-enabled-update').description('Set whether channel uses global setting')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--global-enabled-type <type>', 'setting type', validateGlobalEnabledType)
    .requiredOption('--enabled <value>', 'enabled (Y|N)', validateYn))
    .action((options) => withWebHandler(program, handler => handler.updateGlobalEnabled(options)));

  addForceOutput(settingCmd.command('image-upload').description('Upload watch page image assets')
    .requiredOption('--type <type>', 'image type')
    .requiredOption('--files <paths>', 'image file paths, comma-separated', parseStringList))
    .action((options) => withWebHandler(program, handler => handler.uploadImage(options)));

  const authCmd = webCmd.command('auth').description('Watch condition and authorization APIs');
  addForceOutput(authCmd.command('type-set').description('Set simple watch auth type')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .requiredOption('--auth-type <type>', 'auth type; SDK currently supports none'))
    .action((options) => withWebHandler(program, handler => handler.setAuthType(options)));

  addForceOutput(authCmd.command('external-set').description('Set external authorization')
    .requiredOption('--user-id <id>', 'user ID')
    .requiredOption('--external-uri <url>', 'external authorization URL')
    .option('-c, --channel-id <id>', 'channel ID; omit for all channels'))
    .action((options) => withWebHandler(program, handler => handler.setExternalAuth(options)));

  addForceOutput(authCmd.command('authorized-address-set').description('Set custom authorized address')
    .requiredOption('--user-id <id>', 'user ID')
    .requiredOption('--custom-uri <url>', 'custom auth URL')
    .option('-c, --channel-id <id>', 'channel ID; omit for all channels'))
    .action((options) => withWebHandler(program, handler => handler.setAuthorizedAddress(options)));

  addForceOutput(authCmd.command('auth-url-update').description('Update playback restrict auth URL')
    .option('-c, --channel-id <id>', 'channel ID; omit for global settings')
    .option('--url <url>', 'auth URL; omit or empty to clear'))
    .action((options) => withWebHandler(program, handler => handler.updateAuthUrl(options)));

  addOutput(authCmd.command('record-field-get').description('Get registration watch fields')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('--rank <rank>', 'condition rank (1|2)', parsePositiveInteger, 1))
    .action((options) => withWebHandler(program, handler => handler.getRecordField(options)));

  addOutput(authCmd.command('record-info-list').description('List registration watch records')
    .requiredOption('-c, --channel-id <id>', 'channel ID'))
    .action((options) => withWebHandler(program, handler => handler.listRecordInfo(options)));

  addOutput(authCmd.command('enroll-list').description('List enrollment records')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('--viewer-ids <ids>', 'viewer IDs, comma-separated, max 20'))
    .action((options) => withWebHandler(program, handler => handler.listEnroll(options)));

  addOutput(authCmd.command('record-info-download').description('Download registration watch records')
    .requiredOption('-c, --channel-id <id>', 'channel ID')
    .option('--rank <rank>', 'condition rank (1|2)', parsePositiveInteger, 1)
    .option('--output-file <path>', 'write downloaded file to path'))
    .action((options) => withWebHandler(program, handler => handler.downloadRecordInfo(options)));

  const whitelistCmd = authCmd.command('whitelist').description('Watch condition whitelist import/export');
  addForceOutput(whitelistCmd.command('upload').description('Upload whitelist file')
    .requiredOption('--rank <rank>', 'condition rank (1|2)', parsePositiveInteger)
    .requiredOption('--file <path>', 'whitelist Excel file path')
    .option('-c, --channel-id <id>', 'channel ID; omit for global settings'))
    .action((options) => withWebHandler(program, handler => handler.uploadWhiteList(options)));

  addOutput(whitelistCmd.command('download').description('Download whitelist file')
    .requiredOption('--rank <rank>', 'condition rank (1|2)', parsePositiveInteger)
    .option('-c, --channel-id <id>', 'channel ID; omit for global settings')
    .option('--output-file <path>', 'write downloaded file to path'))
    .action((options) => withWebHandler(program, handler => handler.downloadWhiteList(options)));
}
