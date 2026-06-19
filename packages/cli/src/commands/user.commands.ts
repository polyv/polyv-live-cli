import { Command } from 'commander';
import { UserSettingsHandler } from '../handlers/user-settings.handler';
import { logError } from '../utils/errors';
import {
  commandParentOptions,
  loadApiCommandConfig,
  parseJsonObject,
  parsePositiveInteger,
  parseTimestamp,
  validateOutputFormat,
  validateYn,
} from '../utils/api-command';

function withUserHandler(
  program: Command,
  run: (handler: UserSettingsHandler) => Promise<void>
): Promise<void> {
  return (async () => {
    try {
      const { authConfig, serviceConfig } = await loadApiCommandConfig(commandParentOptions(program));
      const handler = new UserSettingsHandler(authConfig, serviceConfig);
      await run(handler);
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)));
      process.exit(1);
    }
  })();
}

function addOutput(command: Command): Command {
  return command.option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table');
}

function addWriteOptions(command: Command): Command {
  return addOutput(command).option('-f, --force', 'skip confirmation prompt');
}

function addPaging(command: Command): Command {
  return command
    .option('--page <number>', 'page number', parsePositiveInteger, 1)
    .option('--size <number>', 'page size', parsePositiveInteger, 20);
}

export function registerUserCommands(program: Command): void {
  const userCmd = program
    .command('user')
    .description('Manage user account settings, templates, billing, and logs');

  const childCmd = userCmd.command('child').description('Manage child accounts');

  addOutput(addPaging(childCmd.command('list').description('List child accounts'))
    .option('--child-email <email>', 'filter by child account email'))
    .action((options) => withUserHandler(program, handler => handler.listChildren(options)));

  addOutput(childCmd.command('roles').description('List child account roles'))
    .action((options) => withUserHandler(program, handler => handler.listChildRoles(options)));

  addWriteOptions(childCmd.command('create').description('Create child account')
    .requiredOption('--child-email <email>', 'child account login email')
    .requiredOption('--child-name <name>', 'child account display name')
    .requiredOption('--password <password>', 'child account password')
    .requiredOption('--role-id <id>', 'child account role ID', parsePositiveInteger)
    .option('--organization-id <id>', 'organization ID', parsePositiveInteger)
    .option('--telephone <phone>', 'telephone')
    .option('--description <text>', 'description'))
    .action((options) => withUserHandler(program, handler => handler.createChild(options)));

  addWriteOptions(childCmd.command('update').description('Update child account')
    .requiredOption('--child-email <email>', 'child account login email')
    .option('--child-name <name>', 'child account display name')
    .option('--password <password>', 'child account password')
    .option('--role-id <id>', 'child account role ID', parsePositiveInteger)
    .option('--organization-id <id>', 'organization ID', parsePositiveInteger)
    .option('--telephone <phone>', 'telephone')
    .option('--description <text>', 'description'))
    .action((options) => withUserHandler(program, handler => handler.updateChild(options)));

  addWriteOptions(childCmd.command('delete').description('Delete child account')
    .requiredOption('--child-email <email>', 'child account login email'))
    .action((options) => withUserHandler(program, handler => handler.deleteChild(options)));

  addOutput(childCmd.command('sale-get').description('Get child account by invite sale')
    .option('--sale-id <id>', 'sale ID')
    .option('--sale-code <code>', 'sale invitation code'))
    .action((options) => withUserHandler(program, handler => handler.getChildBySale(options)));

  const orgCmd = userCmd.command('org').description('Manage organizations');

  addOutput(orgCmd.command('list').description('List organizations'))
    .action((options) => withUserHandler(program, handler => handler.listOrganizations(options)));

  addWriteOptions(orgCmd.command('create').description('Create organization')
    .requiredOption('--name <name>', 'organization name')
    .requiredOption('--parent-id <id>', 'parent organization ID', parsePositiveInteger)
    .option('--description <text>', 'organization description'))
    .action((options) => withUserHandler(program, handler => handler.createOrganization(options)));

  addWriteOptions(orgCmd.command('delete').description('Delete organization')
    .requiredOption('--organization-id <id>', 'organization ID', parsePositiveInteger))
    .action((options) => withUserHandler(program, handler => handler.deleteOrganization(options)));

  const templateCmd = userCmd.command('template').description('Manage default user templates');
  registerTemplateCommands(program, templateCmd);

  const settingCmd = userCmd.command('setting').description('Manage user global settings');

  const footerCmd = settingCmd.command('footer').description('Manage global footer setting');
  addOutput(footerCmd.command('get').description('Get global footer setting'))
    .action((options) => withUserHandler(program, handler => handler.getGlobalFooter(options)));
  addWriteOptions(footerCmd.command('update').description('Update global footer setting')
    .option('--show-footer-enabled <Y|N>', 'footer display switch', validateYn)
    .option('--footer-text <text>', 'footer text')
    .option('--foot-text-link-protocol <protocol>', 'footer link protocol')
    .option('--foot-text-link-url <url>', 'footer link URL without protocol'))
    .action((options) => withUserHandler(program, handler => handler.updateGlobalFooter(options)));

  const pvShowCmd = settingCmd.command('pv-show').description('Manage PV display switch');
  addOutput(pvShowCmd.command('get').description('Get PV display switch'))
    .action((options) => withUserHandler(program, handler => handler.getPvShowEnable(options)));
  addWriteOptions(pvShowCmd.command('update').description('Update PV display switch')
    .requiredOption('--enabled <Y|N>', 'PV display switch', validateYn))
    .action((options) => withUserHandler(program, handler => handler.updatePvShowEnable(options)));

  addWriteOptions(userCmd.command('sms-send').description('Send SMS notification')
    .requiredOption('--phone-numbers <numbers>', 'phone numbers, comma-separated')
    .requiredOption('--template-param-names <names>', 'template parameter names, comma-separated')
    .requiredOption('--template-param-values <values>', 'template parameter values, comma-separated'))
    .action((options) => withUserHandler(program, handler => handler.sendSms(options)));

  addOutput(userCmd.command('mic-duration').description('Get user mic duration')
    .option('--start-time <timestamp>', 'start timestamp in milliseconds', parseTimestamp)
    .option('--end-time <timestamp>', 'end timestamp in milliseconds', parseTimestamp))
    .action((options) => withUserHandler(program, handler => handler.getMicDuration(options)));

  const mrCmd = userCmd.command('mr-concurrency').description('Manage MR concurrency');
  addOutput(mrCmd.command('detail').description('Get MR concurrency detail'))
    .action((options) => withUserHandler(program, handler => handler.getMrConcurrencyDetail(options)));

  const billCmd = userCmd.command('bill').description('Manage user billing details');
  addOutput(addPaging(billCmd.command('use-detail').description('List bill use details')
    .requiredOption('--item-category <category>', 'billing item category')
    .requiredOption('--start-date <date>', 'start date')
    .requiredOption('--end-date <date>', 'end date')
    .option('--channel-id <id>', 'channel ID')))
    .action((options) => withUserHandler(program, handler => handler.getBillUseDetailList(options)));

  const viewlogCmd = userCmd.command('viewlog').description('Manage user watch logs');
  addOutput(addPaging(viewlogCmd.command('list').description('List watch logs')))
    .action((options) => withUserHandler(program, handler => handler.listWatchLogs(options)));
  addOutput(addPaging(viewlogCmd.command('detail').description('Get watch log detail')
    .requiredOption('--viewer-id <id>', 'viewer ID')))
    .action((options) => withUserHandler(program, handler => handler.getWatchLogDetail(options)));
}

function registerTemplateCommands(program: Command, templateCmd: Command): void {
  const donateCmd = templateCmd.command('donate').description('Manage donate template');
  addOutput(donateCmd.command('get').description('Get donate template'))
    .action((options) => withUserHandler(program, handler => handler.getDonateTemplate(options)));
  addWriteOptions(donateCmd.command('update').description('Update donate template')
    .requiredOption('--donate-gift-enabled <Y|N>', 'gift donate switch', validateYn)
    .option('--gift-donate <json>', 'gift donate config JSON object', parseJsonObject))
    .action((options) => withUserHandler(program, handler => handler.updateDonateTemplate(options)));

  const marqueeCmd = templateCmd.command('marquee').description('Manage content protection template');
  addOutput(marqueeCmd.command('get').description('Get content protection template'))
    .action((options) => withUserHandler(program, handler => handler.getMarqueeTemplate(options)));
  addWriteOptions(marqueeCmd.command('update').description('Update content protection template')
    .requiredOption('--enable <Y|N>', 'content protection switch', validateYn)
    .option('--anti-record-type <type>', 'content protection type')
    .option('--model-type <type>', 'content protection display model')
    .option('--content <text>', 'content or URL')
    .option('--opacity <value>', 'opacity')
    .option('--font-size <size>', 'font size')
    .option('--font-color <color>', 'font color')
    .option('--show-mode <mode>', 'show mode')
    .option('--double-enabled <Y|N>', 'double marquee switch', validateYn)
    .option('--auto-zoom-enabled <Y|N>', 'auto zoom switch', validateYn))
    .action((options) => withUserHandler(program, handler => handler.updateMarqueeTemplate(options)));

  const roleConfigCmd = templateCmd.command('role-config').description('Manage role config template');
  addOutput(roleConfigCmd.command('get').description('Get role config template'))
    .action((options) => withUserHandler(program, handler => handler.getRoleConfigTemplate(options)));
  addWriteOptions(roleConfigCmd.command('update').description('Update role config template')
    .requiredOption('--config <json>', 'role config JSON object', parseJsonObject))
    .action((options) => withUserHandler(program, handler => handler.updateRoleConfigTemplate(options)));

  const playbackCmd = templateCmd.command('playback').description('Manage playback template');
  addOutput(playbackCmd.command('get').description('Get playback template'))
    .action((options) => withUserHandler(program, handler => handler.getPlaybackSetting(options)));
  addWriteOptions(playbackCmd.command('update').description('Update playback template')
    .requiredOption('--config <json>', 'playback setting JSON object', parseJsonObject))
    .action((options) => withUserHandler(program, handler => handler.updatePlaybackSetting(options)));

  const audioCmd = templateCmd.command('audio-moderation').description('Manage audio moderation template');
  addOutput(audioCmd.command('get').description('Get audio moderation template'))
    .action((options) => withUserHandler(program, handler => handler.getAudioModerationSetting(options)));
  addWriteOptions(audioCmd.command('update').description('Update audio moderation template')
    .requiredOption('--moderation-enabled <Y|N>', 'moderation switch', validateYn)
    .requiredOption('--moderation-strategy <strategy>', 'moderation strategy')
    .requiredOption('--badword-enabled <Y|N>', 'badword switch', validateYn)
    .requiredOption('--illegal-notify <json>', 'illegal notification JSON object', parseJsonObject))
    .action((options) => withUserHandler(program, handler => handler.updateAudioModerationSetting(options)));

  const videoCmd = templateCmd.command('video-moderation').description('Manage video moderation template');
  addOutput(videoCmd.command('get').description('Get video moderation template'))
    .action((options) => withUserHandler(program, handler => handler.getVideoModerationSetting(options)));
  addWriteOptions(videoCmd.command('update').description('Update video moderation template')
    .requiredOption('--moderation-enabled <Y|N>', 'moderation switch', validateYn)
    .requiredOption('--moderation-strategy <strategy>', 'moderation strategy')
    .requiredOption('--image-frequency <seconds>', 'image capture frequency', parsePositiveInteger)
    .requiredOption('--illegal-notify <json>', 'illegal notification JSON object', parseJsonObject))
    .action((options) => withUserHandler(program, handler => handler.updateVideoModerationSetting(options)));
}
