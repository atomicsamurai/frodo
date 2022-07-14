import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { getTokens } from '../../ops/AuthenticateOps.js';
import storage from '../../storage/SessionStorage.js';
import { printMessage } from '../../ops/utils/Console.js';
import {
  exportThemeById,
  exportThemeByName,
  exportThemesToFile,
  exportThemesToFiles,
} from '../../ops/ThemeOps.js';

const program = new Command('frodo theme export');

program
  .description('Export themes.')
  .helpOption('-h, --help', 'Help')
  .showHelpAfterError()
  .addArgument(common.hostArgumentM)
  .addArgument(common.realmArgument)
  .addArgument(common.userArgument)
  .addArgument(common.passwordArgument)
  .addOption(common.deploymentOption)
  .addOption(common.insecureOption)
  .addOption(
    new Option(
      '-n, --theme-name <name>',
      'Name of the theme. If specified, -a and -A are ignored.'
    )
  )
  .addOption(
    new Option(
      '-i, --theme-id <uuid>',
      'Uuid of the theme. If specified, -a and -A are ignored.'
    )
  )
  .addOption(
    new Option(
      '-f, --file [file]',
      'Name of the file to write the exported theme(s) to. Ignored with -A.'
    )
  )
  .addOption(
    new Option(
      '-a, --all',
      'Export all the themes in a realm to a single file. Ignored with -n and -i.'
    )
  )
  .addOption(
    new Option(
      '-A, --all-separate',
      'Export all the themes in a realm as separate files <theme name>.theme.json. Ignored with -n, -i, and -a.'
    )
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
        // export by name
        if (options.themeName) {
          printMessage(
            `Exporting theme "${
              options.themeName
            }" from realm "${storage.session.getRealm()}"...`
          );
          exportThemeByName(options.themeName, options.file);
        }
        // export by id
        else if (options.themeId) {
          printMessage(
            `Exporting theme "${
              options.themeId
            }" from realm "${storage.session.getRealm()}"...`
          );
          exportThemeById(options.themeId, options.file);
        }
        // --all -a
        else if (options.all) {
          printMessage('Exporting all themes to a single file...');
          exportThemesToFile(options.file);
        }
        // --all-separate -A
        else if (options.allSeparate) {
          printMessage('Exporting all themes to separate files...');
          exportThemesToFiles();
        }
        // unrecognized combination of options or no options
        else {
          printMessage(
            'Unrecognized combination of options or no options...',
            'error'
          );
          program.help();
        }
      }
    }
    // end command logic inside action handler
  );

program.parse();
