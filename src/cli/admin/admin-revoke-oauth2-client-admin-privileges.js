import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { getTokens } from '../../ops/AuthenticateOps.js';
import storage from '../../storage/SessionStorage.js';
import { printMessage } from '../../ops/utils/Console.js';
import { revokeOAuth2ClientAdminPrivileges } from '../../ops/AdminOps.js';

const program = new Command(
  'frodo admin revoke-oauth2-client-admin-privileges'
);

program
  .description('Revoke admin privileges from an oauth2 client.')
  .helpOption('-h, --help', 'Help')
  .showHelpAfterError()
  .addArgument(common.hostArgumentM)
  .addArgument(common.realmArgument)
  .addArgument(common.userArgument)
  .addArgument(common.passwordArgument)
  .addOption(common.deploymentOption)
  .addOption(common.insecureOption)
  .addOption(
    new Option('-t, --target <target name or id>', 'Name of the oauth2 client.')
  )
  .action(
    // implement command logic inside action handler
    async (host, realm, user, password, options) => {
      storage.session.setTenant(host);
      storage.session.setRealm(realm);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      storage.session.setAllowInsecureConnection(options.insecure);
      if (await getTokens()) {
        printMessage(
          `Revoking admin privileges from oauth2 client "${
            options.target
          }" in realm "${storage.session.getRealm()}"...`
        );
        await revokeOAuth2ClientAdminPrivileges(options.target);
        printMessage('Done.');
      }
    }
    // end command logic inside action handler
  );

program.parse();
