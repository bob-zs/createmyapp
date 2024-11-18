import { Command } from 'commander';
import { setupApp } from './setup.js';

const program = new Command();
const packageJson = require('./package.json');
const version = packageJson.version;

program
  .version(version)
  .option('-v, --ver', 'output the version number');

program.parse(process.argv);
const options = program.opts();
if (options.ver) {
  console.log(`create-my-app version: ${version}\n`);
  process.exit(0);
}

const appName = process.argv[2] || 'my-app';

(async () => {
  const { packageManager } = await enquirer.prompt({
    type: 'select',
    name: 'packageManager',
    message: 'Which package manager do you want to use?',
    choices: ['pnpm', 'npm'],
  });

  await setupApp(appName, packageManager);
})();
