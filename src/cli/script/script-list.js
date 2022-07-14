import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { getTokens } from '../../ops/AuthenticateOps.js';
import storage from '../../storage/SessionStorage.js';
import { printMessage } from '../../ops/utils/Console.js';
import { listScripts } from '../../api/ScriptApi.js';

const program = new Command('frodo script list');

program
  .description('List scripts.')
  .helpOption('-h, --help', 'Help')
  .showHelpAfterError()
  .addArgument(common.hostArgumentM)
  .addArgument(common.realmArgument)
  .addArgument(common.userArgument)
  .addArgument(common.passwordArgument)
  .addOption(common.deploymentOption)
  .addOption(common.insecureOption)
  .addOption(
    new Option('-l, --long', 'Long with all fields.').default(false, 'false')
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
          `Listing scripts in realm "${storage.session.getRealm()}"...`
        );
        const scriptList = await listScripts();
        // console.log(scriptList);
        scriptList.sort((a, b) => a.name.localeCompare(b.name));
        scriptList.forEach((item) => {
          printMessage(`${item.name}`, 'data');
        });
      }
    }
    // end command logic inside action handler
  );

program.parse();
