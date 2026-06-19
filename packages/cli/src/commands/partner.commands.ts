import { Command } from 'commander';
import { PartnerHandler } from '../handlers/partner.handler';
import { logError } from '../utils/errors';
import {
  commandParentOptions,
  loadApiCommandConfig,
  parseJsonArray,
  validateOutputFormat,
} from '../utils/api-command';

function withPartnerHandler(program: Command, run: (handler: PartnerHandler) => Promise<void>): Promise<void> {
  return (async () => {
    try {
      const { authConfig, serviceConfig } = await loadApiCommandConfig(commandParentOptions(program));
      await run(new PartnerHandler(authConfig, serviceConfig));
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)));
      process.exit(1);
    }
  })();
}

export function registerPartnerCommands(program: Command): void {
  const partnerCmd = program.command('partner').description('Manage partner account tools');

  partnerCmd.command('user-register')
    .description('Register a partner customer account')
    .requiredOption('--company <company>', 'company name')
    .requiredOption('--mobile <mobile>', 'mobile number')
    .requiredOption('--contact <contact>', 'contact name')
    .requiredOption('--email <email>', 'email')
    .option('--type <type>', 'account type')
    .option('--remark <remark>', 'remark')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withPartnerHandler(program, handler => handler.registerUser(options)));

  const tencentCmd = partnerCmd.command('tencent-order').description('Tencent order APIs');
  tencentCmd.command('create')
    .description('Create Tencent cloud government/enterprise order')
    .requiredOption('--uin <uin>', 'Tencent cloud uin')
    .requiredOption('--order-id <orderId>', 'order ID')
    .requiredOption('--email <email>', 'email')
    .requiredOption('--mobile <mobile>', 'mobile number')
    .option('--company <company>', 'company name')
    .option('--contact <contact>', 'contact name')
    .option('--basic-service <json>', 'basic service JSON array', parseJsonArray)
    .option('--premium-service <json>', 'premium service JSON array', parseJsonArray)
    .option('--remark <remark>', 'remark')
    .option('-f, --force', 'skip confirmation prompt')
    .option('-o, --output <format>', 'output format (table|json)', validateOutputFormat, 'table')
    .action((options) => withPartnerHandler(program, handler => handler.createTencentOrder(options)));
}
