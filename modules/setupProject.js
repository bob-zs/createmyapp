import { copyRecursiveSync, shouldIgnore } from './fileOperations.js';
import { runCommand } from './commands.js';
import kleur from 'kleur';
import fs from 'node:fs';

const defaultIgnores = ['.git', 'gitignore', 'node_modules', 'dist'];

export const setupProject = async (baseAppDir, appName, packageManager, scriptName) => {
  try {
    runCommand(`${packageManager} --version`);
  } catch (e) {
    console.log(`${packageManager} not found. Installing ${packageManager}...`);
    runCommand(`npm install -g ${packageManager}`);
  }

  fs.mkdirSync(appName);
  console.log(kleur.cyan('Setting up files for the application...'));

  copyRecursiveSync(baseAppDir, appName, scriptName, name => shouldIgnore(name, defaultIgnores));
  console.log('\n');

  process.chdir(appName);

  if (packageManager === 'npm') {
    if (fs.existsSync('pnpm-lock.yaml')) fs.unlinkSync('pnpm-lock.yaml');
  } else if (packageManager === 'pnpm') {
    if (fs.existsSync('package-lock.json')) fs.unlinkSync('package-lock.json');
  }

  runCommand(`${packageManager} install`);
  runCommand(`${packageManager} exec webpack --mode="development"`);

  console.log('\n');

  runCommand('git init');
  runCommand('git add .');
  runCommand(`git commit -m "Initial commit from create-my-app for ${appName}"`);

  console.log(kleur.green('\nExpress app setup complete with custom configurations!'));
  console.log(kleur.yellow('Run the following command to start the server:\n'));
  console.log(kleur.blue(`cd ${appName} && ${packageManager} run start:dev\n`));
};
